"""Render a photoreal red velvet stage curtain (two panels)."""
import sys
import numpy as np
from scipy.ndimage import gaussian_filter
from common import fft_noise, band_noise, normals, tonemap, save

OUT = sys.argv[1]
H, W = 2000, 2000  # full stage, split into two 1000px panels
y = np.linspace(0, 1, H)[:, None]
x = np.linspace(0, 1, W)[None, :]
r = np.random.default_rng(11)


def velvet_shade(h, depth, L=(-0.35, -0.45, 0.82), spot=None, pile_seed=1, tint=1.0):
    hh, ww = h.shape
    h = gaussian_filter(h, 2.0)
    n = normals(h, depth)
    L = np.array(L) / np.linalg.norm(L)
    ndl = np.clip((n * L).sum(2), 0, 1)
    facing = np.clip(n[..., 2], 0, 1)
    # velvet: light gathers on the flanks of each fold (grazing angles)
    sheen = (1 - facing) ** 1.4
    hn = (h - h.min()) / (h.max() - h.min() + 1e-9)
    ao = 0.04 + 0.96 * hn**1.6
    base = np.array([0.20, 0.004, 0.012]) * tint
    sheen_col = np.array([0.95, 0.10, 0.12]) * tint
    col = base * (0.15 + 1.2 * ndl)[..., None] * ao[..., None]
    col += sheen_col * (sheen * (0.2 + 0.8 * ndl) * ao)[..., None]
    pile = 1 + 0.06 * band_noise(hh, ww, 0.08, 0.35, sx=1.0, sy=0.25, seed=pile_seed)
    pile += 0.035 * gaussian_filter(np.random.default_rng(pile_seed).standard_normal((hh, ww)), 0.6)
    col *= pile[..., None]
    if spot is not None:
        col *= spot[..., None]
    return col


# ── fold height field ──
warp = 0.012 * fft_noise(H, W, beta=2.6, seed=3)  # gentle sway of the folds
xw = x + warp
xw = xw + 0.010 * np.sin(2 * np.pi * 2.3 * xw + 1.0) + 0.006 * np.sin(2 * np.pi * 5.1 * xw + 2.2)
N = 11
def folds(xw, yy, seed, base_f):
    rr = np.random.default_rng(seed)
    hh = np.zeros(np.broadcast(xw, yy).shape)
    for f, a in [(base_f, 1.0), (base_f * 0.61, 0.55), (base_f * 1.73, 0.35), (base_f * 2.9, 0.12), (base_f * 0.33, 0.4)]:
        ph0 = rr.uniform(0, 2 * np.pi)
        # amplitude of each harmonic drifts slowly down the drop
        drift = 1 + 0.25 * np.sin(2 * np.pi * (yy * rr.uniform(0.3, 0.9)) + rr.uniform(0, 6))
        hh = hh + a * drift * np.cos(2 * np.pi * f * xw + ph0)
    return hh
h = folds(xw, y, 4, N)
h = (h - h.min()) / (h.max() - h.min())
h = h ** 1.15
h *= 0.8 + 0.2 * y  # folds deepen toward the floor
h += 0.05 * fft_noise(H, W, beta=2.2, seed=5)
# pleated heading at the very top
top = np.clip(1 - y / 0.05, 0, 1) ** 2
h = h * (1 - 0.5 * top) + top * 0.35 * (0.5 + 0.5 * np.cos(2 * np.pi * 2 * N * xw))

# stage lighting: warm spot from above-centre, darker floor and edges
spot = 0.12 + 1.35 * np.exp(-(((x - 0.5) / 0.36) ** 2) - ((y - 0.36) / 0.62) ** 2)
spot *= 0.55 + 0.45 * np.clip(1 - (y - 0.75) / 0.25, 0, 1)
spot *= 0.75 + 0.25 * np.clip(y / 0.12, 0, 1)

col = velvet_shade(h, depth=260, spot=spot)
img = tonemap(col, 1.5)
save(img[:, : W // 2], f'{OUT}/curtain-left.jpg', quality=80)
save(img[:, W // 2 :], f'{OUT}/curtain-right.jpg', quality=80)

# ── darker backdrop wall for the hero (tighter folds, dimmer) ──
Hb, Wb = 1600, 1600
yb = np.linspace(0, 1, Hb)[:, None]
xb = np.linspace(0, 1, Wb)[None, :]
xw = xb + 0.01 * fft_noise(Hb, Wb, beta=2.6, seed=8)
hb = folds(xw, yb, 9, 15)
hb = ((hb - hb.min()) / (hb.max() - hb.min())) ** 1.15
hb += 0.04 * fft_noise(Hb, Wb, beta=2.2, seed=9)
spotb = 0.25 + 0.9 * np.exp(-(((xb - 0.5) / 0.35) ** 2) - ((yb - 0.38) / 0.55) ** 2)
colb = velvet_shade(hb, depth=200, spot=spotb, pile_seed=4, tint=0.85)
save(tonemap(colb, 1.4), f'{OUT}/velvet-backdrop.jpg', quality=78)
print('ok')
