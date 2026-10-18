"""Tileable surfaces: gold foil, cream paper, embossed jaali card, crushed velvet, wax seal."""
import sys
import numpy as np
from scipy.ndimage import gaussian_filter
from common import fft_noise, band_noise, normals, tonemap, save

OUT = sys.argv[1]
S = 1024


def wrap_blur(a, s):
    return gaussian_filter(a, s, mode='wrap')


# ───────── gold foil ─────────
def gold_foil(S=1024, seed=1):
    # big soft reflections + crinkle + brushed streaks
    refl = fft_noise(S, S, beta=3.4, seed=seed)
    crinkle = band_noise(S, S, 0.004, 0.02, seed=seed + 1)
    brush = band_noise(S, S, 0.05, 0.4, sx=0.08, sy=1.0, seed=seed + 2)
    t = 0.62 + 0.42 * refl + 0.07 * crinkle + 0.035 * brush
    t = np.clip(t, 0, 1)
    # metallic ramp: deep bronze → gold → pale highlight
    stops = np.array([0.0, 0.25, 0.5, 0.72, 0.88, 1.0])
    cols = np.array(
        [[0.24, 0.13, 0.03], [0.55, 0.36, 0.12], [0.80, 0.60, 0.28], [0.93, 0.79, 0.47], [0.99, 0.92, 0.70], [0.86, 0.68, 0.36]]
    )
    rgb = np.stack([np.interp(t, stops, cols[:, i]) for i in range(3)], -1)
    # tiny glints
    g = np.random.default_rng(seed).random((S, S))
    glint = wrap_blur((g > 0.99985).astype(float), 0.7) * 1.2
    rgb = np.clip(rgb + glint[..., None] * np.array([1, 0.95, 0.8]), 0, 1)
    return rgb


save(gold_foil(), f'{OUT}/gold-foil.jpg', quality=84)


# ───────── cream paper ─────────
def paper(S=1024, seed=10, tone=(0.965, 0.925, 0.86), mottling=0.03):
    r = np.random.default_rng(seed)
    mott = fft_noise(S, S, beta=2.2, seed=seed)
    grain = wrap_blur(r.standard_normal((S, S)), 0.7)
    grain /= np.abs(grain).max()
    # fibres: short random strokes accumulated on a wrapped canvas
    fib = np.zeros((S, S))
    for _ in range(2600):
        x0, y0 = r.uniform(0, S, 2)
        ang = r.uniform(0, np.pi)
        ln = r.uniform(8, 40)
        ts = np.linspace(0, 1, int(ln))
        bend = r.uniform(-0.25, 0.25)
        xs = (x0 + np.cos(ang + bend * ts) * ln * ts).astype(int) % S
        ys = (y0 + np.sin(ang + bend * ts) * ln * ts).astype(int) % S
        fib[ys, xs] += r.uniform(0.3, 1.0)
    fib = wrap_blur(fib, 0.6)
    fib /= fib.max() + 1e-9
    hmap = 0.6 * mott + 0.25 * grain + 0.6 * fib
    n = normals(wrap_blur(hmap, 0.8), 2.5)
    L = np.array([-0.4, -0.5, 0.77])
    L /= np.linalg.norm(L)
    shade = 0.92 + 0.12 * ((n * L).sum(2) - 0.77)
    base = np.array(tone)
    rgb = base * (1 + mottling * mott)[..., None] * shade[..., None]
    rgb -= 0.035 * fib[..., None] * np.array([0.6, 0.8, 1.0])  # fibres slightly darker/warmer
    return np.clip(rgb, 0, 1), hmap


p_rgb, _ = paper()
save(p_rgb, f'{OUT}/paper.jpg', quality=80)
blush, _ = paper(seed=20, tone=(0.93, 0.86, 0.77), mottling=0.045)
save(blush, f'{OUT}/paper-blush.jpg', quality=80)


# ───────── embossed jaali (8-point star lattice) ─────────
def jaali_height(S=512, cell=128, line=2.0):
    yy, xx = np.mgrid[0:S, 0:S].astype(float)
    px = (xx % cell) - cell / 2
    py = (yy % cell) - cell / 2

    def sq(px, py, r):
        return np.maximum(np.abs(px), np.abs(py)) - r

    def rot(px, py, a):
        c, s = np.cos(a), np.sin(a)
        return c * px - s * py, s * px + c * py

    rx, ry = rot(px, py, np.pi / 4)
    star = np.minimum(sq(px, py, cell * 0.22), sq(rx, ry, cell * 0.22))
    # interlace lines between stars
    qx = ((xx + cell / 2) % cell) - cell / 2
    qy = ((yy + cell / 2) % cell) - cell / 2
    qrx, qry = rot(qx, qy, np.pi / 4)
    diamond = sq(qrx, qry, cell * 0.16)
    d = np.minimum(np.abs(star), np.abs(diamond))
    ring = np.abs(np.sqrt(px * px + py * py) - cell * 0.1)
    d = np.minimum(d, ring)
    return np.clip(1 - d / line, 0, 1)


def embossed_card(seed=30):
    base, _ = paper(S=1024, seed=seed, tone=(0.975, 0.945, 0.89), mottling=0.02)
    jh = np.tile(jaali_height(), (2, 2))
    jh = wrap_blur(jh, 1.4)
    n = normals(jh, 6)
    L = np.array([-0.45, -0.55, 0.7])
    L /= np.linalg.norm(L)
    s = (n * L).sum(2) - L[2]
    rgb = base * (1 + 0.22 * s)[..., None]
    # faint gold ink in the recess
    rgb = rgb * (1 - 0.05 * jh[..., None]) + 0.05 * jh[..., None] * np.array([0.85, 0.68, 0.36])
    return np.clip(rgb, 0, 1)


save(embossed_card(), f'{OUT}/card-jaali.jpg', quality=82)


# ───────── crushed velvet (tile for dark cards/sections) ─────────
def crushed_velvet(S=1024, seed=40, tint=1.0):
    h = fft_noise(S, S, beta=3.2, seed=seed)
    h = wrap_blur(h, 2)
    n = normals(h, 260)
    facing = np.clip(n[..., 2], 0, 1)
    sheen = (1 - facing) ** 1.5
    L = np.array([-0.3, -0.5, 0.8])
    L /= np.linalg.norm(L)
    ndl = np.clip((n * L).sum(2), 0, 1)
    col = np.array([0.13, 0.003, 0.01]) * tint * (0.35 + 0.8 * ndl)[..., None]
    col += np.array([0.6, 0.04, 0.07]) * tint * (sheen * 0.8)[..., None]
    pile = 1 + 0.06 * band_noise(S, S, 0.08, 0.35, sy=0.3, seed=seed + 3)
    pile += 0.04 * wrap_blur(np.random.default_rng(seed).standard_normal((S, S)), 0.6)
    col *= pile[..., None]
    return tonemap(col, 1.3)


save(crushed_velvet(), f'{OUT}/velvet-tile.jpg', quality=80)


# ───────── wax seal (RGBA) ─────────
def wax_seal(S=640, seed=50):
    yy, xx = np.mgrid[0:S, 0:S].astype(float)
    cx = cy = S / 2
    dx, dy = xx - cx, yy - cy
    rad = np.sqrt(dx * dx + dy * dy)
    ang = np.arctan2(dy, dx)
    r = np.random.default_rng(seed)
    # irregular, blobby outer edge
    R = S * 0.42
    edge = R * (1 + sum(r.uniform(0.008, 0.03) * np.sin(k * ang + r.uniform(0, 6)) for k in (3, 5, 7, 11, 17)))
    t = rad / edge
    dome = np.sqrt(np.clip(1 - t**6, 0, 1))
    # pressed inner disc with a raised rim ring
    inner = S * 0.30
    rim = np.exp(-(((rad - inner) / (S * 0.018)) ** 2)) * 0.25
    press = np.where(rad < inner - S * 0.01, -0.12, 0)
    press = gaussian_filter(press, 3)
    beads = 0.04 * np.exp(-(((rad - inner * 0.86) / (S * 0.008)) ** 2)) * (0.5 + 0.5 * np.cos(ang * 48))
    h = dome * 0.6 + rim + press + beads
    h += 0.01 * fft_noise(S, S, beta=2.0, seed=seed)
    h = gaussian_filter(h, 1.2)
    n = normals(h, 120)
    L = np.array([-0.45, -0.6, 0.66])
    L /= np.linalg.norm(L)
    ndl = np.clip((n * L).sum(2), 0, 1)
    Hh = L + np.array([0, 0, 1])
    Hh /= np.linalg.norm(Hh)
    spec = np.clip((n * Hh).sum(2), 0, 1) ** 40
    base = np.array([0.30, 0.008, 0.02])
    col = base * (0.12 + 1.15 * ndl**1.3)[..., None] + np.array([1, 0.8, 0.75]) * (spec * 0.9)[..., None]
    rgb = tonemap(col, 1.25)
    alpha = np.clip((edge - rad) / 1.5, 0, 1)
    return rgb, alpha


rgb, a = wax_seal()
save(rgb, f'{OUT}/wax-seal.webp', quality=86, alpha=a)
print('ok')
