"""Gathered side drape tied back with a gold rope + tassel (RGBA)."""
import sys
import numpy as np
from scipy.ndimage import gaussian_filter
from common import fft_noise, band_noise, normals, tonemap, save

OUT = sys.argv[1]
H, W = 2000, 640
yy, xx = np.mgrid[0:H, 0:W].astype(float)
y = yy / H
x = xx / W
TY = 0.56  # tie point (fraction of height)


def smooth(t):
    t = np.clip(t, 0, 1)
    return t * t * (3 - 2 * t)


# inner edge of the drape (fraction of width)
top = 1.0 - 0.72 * smooth(y / TY) ** 0.85
bot = 0.28 + 0.40 * smooth((y - TY) / (1 - TY)) ** 0.6
edge = np.where(y < TY, top, bot)
edge = gaussian_filter(edge, 6)
u = np.clip(x / edge, 0, 1.2)  # 0 at wall, 1 at inner edge

# folds follow the gathered shape
rr = np.random.default_rng(3)
h = np.zeros_like(u)
for f, a in [(6.0, 1.0), (3.7, 0.5), (10.3, 0.3), (15.8, 0.1)]:
    h += a * np.cos(2 * np.pi * f * u + rr.uniform(0, 6) + 0.6 * np.sin(2 * np.pi * y * rr.uniform(0.5, 1.5)))
h = (h - h.min()) / (h.max() - h.min())
# the cloth bunches up around the tie
bunch = np.exp(-(((y - TY) / 0.045) ** 2))
h = h * (1 + 0.6 * bunch) + 0.4 * bunch * (1 - (u - 0.5) ** 2 * 2)
# roll the inner edge so it reads as thick fabric
h += 0.35 * np.exp(-(((u - 0.97) / 0.05) ** 2))
h += 0.03 * fft_noise(H, W, beta=2.2, seed=12)
h = gaussian_filter(h, 1.5)

n = normals(h, 150)
L = np.array([0.35, -0.5, 0.8])
L /= np.linalg.norm(L)
ndl = np.clip((n * L).sum(2), 0, 1)
sheen = (1 - np.clip(n[..., 2], 0, 1)) ** 1.4
hn = (h - h.min()) / (h.max() - h.min())
ao = 0.05 + 0.95 * hn**1.4
col = np.array([0.20, 0.004, 0.012]) * ((0.15 + 1.2 * ndl) * ao)[..., None]
col += np.array([0.95, 0.10, 0.12]) * (sheen * (0.2 + 0.8 * ndl) * ao)[..., None]
pile = 1 + 0.06 * band_noise(H, W, 0.08, 0.35, sy=0.25, seed=2)
col *= pile[..., None]
# lit from the stage side (inner edge), darker toward the wall and floor
light = 0.25 + 1.1 * smooth(u) ** 1.2
light *= 0.6 + 0.4 * np.exp(-(((y - 0.45) / 0.6) ** 2))
col *= light[..., None]
# shadow just below the tie
col *= (1 - 0.45 * np.exp(-(((y - TY - 0.035) / 0.03) ** 2)))[..., None]
rgb = tonemap(col, 1.5)
alpha = np.clip((edge * W - xx) / 1.6, 0, 1)

# ── gold rope across the tie point ──
def gold_ramp(t):
    t = np.clip(t, 0, 1)
    dark = np.array([0.20, 0.11, 0.03])
    mid = np.array([0.72, 0.50, 0.20])
    hi = np.array([1.0, 0.92, 0.66])
    a = np.clip(t * 2, 0, 1)[..., None]
    b = np.clip(t * 2 - 1, 0, 1)[..., None]
    return dark * (1 - a) + mid * a * (1 - b) + hi * b


ROPE_W = 26
x_end = 0.28 * W + 4
cy = TY * H + (xx / W) * 30  # slight downward slant toward the knot
t = (yy - cy) / (ROPE_W / 2)
in_rope = (np.abs(t) < 1) & (xx < x_end)
s = xx / 14.0
twist = 0.5 + 0.5 * np.cos(2 * np.pi * (s + t * 0.9))
rope_h = np.sqrt(np.clip(1 - t * t, 0, 1)) * (0.75 + 0.25 * twist)
rope_shade = rope_h * (0.55 + 0.45 * (1 - (t + 0.35) ** 2)) * (0.7 + 0.3 * twist)
rope_rgb = gold_ramp(np.clip(rope_shade, 0, 1))
m = in_rope[..., None]
rgb = np.where(m, rope_rgb, rgb)
alpha = np.where(in_rope, 1.0, alpha)

# ── tassel hanging from the knot ──
kx = x_end - 6
ky = TY * H + 34
# knot (sphere)
dk = np.sqrt((xx - kx) ** 2 + (yy - ky) ** 2) / 22
knot = dk < 1
kz = np.sqrt(np.clip(1 - dk**2, 0, 1))
kshade = np.clip(0.15 + kz * 0.65 + 0.3 * (xx - kx) / 22 + 0.25 * (ky - yy) / 22, 0, 1)
rgb = np.where(knot[..., None], gold_ramp(0.25 + 0.75 * kshade), rgb)
alpha = np.where(knot, 1.0, alpha)
# tassel skirt: flared bundle of threads
ty0, ty1 = ky + 18, ky + 190
v = (yy - ty0) / (ty1 - ty0)
half = 14 + 22 * smooth(v) ** 0.8
dx = (xx - kx) / half
in_t = (v >= 0) & (v <= 1) & (np.abs(dx) < 1)
tid = np.floor((xx - kx) / 2.4).astype(int)
trand = np.random.default_rng(5).uniform(0, 1, 400)[tid % 400]
threads = 0.55 + 0.45 * np.cos(2 * np.pi * ((xx - kx) / 2.4)) ** 2
round_ = np.sqrt(np.clip(1 - dx**2, 0, 1))
lit = np.clip(0.25 + 0.55 * round_ + 0.35 * dx, 0, 1)
tsh = lit * (0.55 + 0.45 * threads) * (0.75 + 0.25 * trand) * (1 - 0.25 * v)
vend = 1 - 0.07 * trand
in_t = in_t & (v <= vend)
# collar bands near the top of the skirt
band = ((v > 0.07) & (v < 0.13)) | ((v > 0.16) & (v < 0.19))
tsh = np.where(band, np.clip(0.3 + 0.7 * round_ + 0.3 * dx, 0, 1), tsh)
rgb = np.where(in_t[..., None], gold_ramp(tsh), rgb)
ta = np.clip((1 - np.abs(dx)) * half / 1.5, 0, 1)
alpha = np.where(in_t, np.maximum(alpha, ta), alpha)

save(rgb, f'{OUT}/drape-left.webp', quality=82, alpha=alpha)
save(rgb[:, ::-1], f'{OUT}/drape-right.webp', quality=82, alpha=alpha[:, ::-1])
print('ok')
