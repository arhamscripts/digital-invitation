"""Cut roses out of the two Unsplash photos into transparent WebP sprites.
usage: python cutout.py <roses-black.jpg> <rose-white.jpg> <outdir>"""
import sys
import numpy as np
from PIL import Image
from scipy.ndimage import gaussian_filter

black_path, white_path, OUT = sys.argv[1:4]


def smoothstep(a, b, x):
    t = np.clip((x - a) / (b - a), 0, 1)
    return t * t * (3 - 2 * t)


def save_rgba(rgb, a, path, max_side=900):
    rgb8 = (np.clip(rgb, 0, 1) * 255 + 0.5).astype(np.uint8)
    a8 = (np.clip(a, 0, 1) * 255 + 0.5).astype(np.uint8)
    img = Image.fromarray(np.dstack([rgb8, a8]), 'RGBA')
    bbox = img.getchannel('A').point(lambda v: 255 if v > 6 else 0).getbbox()
    if bbox:
        img = img.crop(bbox)
    img.thumbnail((max_side, max_side), Image.LANCZOS)
    img.save(path, 'WEBP', quality=84, method=6)
    print(path, img.size)


# ── roses on black: luminance key + soft circular mask per rose ──
src = np.asarray(Image.open(black_path).convert('RGB')).astype(float) / 255
H, W, _ = src.shape
peak = src.max(axis=2)
key = smoothstep(0.035, 0.2, gaussian_filter(peak, 1.0))
# fill the dark folds between petals so the flower is solid, not see-through
key = np.maximum(key, smoothstep(0.25, 0.55, gaussian_filter(key, 14)))

roses = {
    'rose-a': (830, 725, 470),
    'rose-b': (976, 1640, 450),
    'rose-c': (275, 1672, 370),
}
yy, xx = np.mgrid[0:H, 0:W].astype(float)
for name, (cx, cy, r) in roses.items():
    d = np.hypot(xx - cx, yy - cy)
    # slightly irregular edge so it doesn't read as a perfect circle
    ang = np.arctan2(yy - cy, xx - cx)
    rr = r * (1 + 0.05 * np.sin(5 * ang + cx) + 0.03 * np.sin(9 * ang + cy))
    circle = smoothstep(rr, rr * 0.8, d)
    core = smoothstep(rr * 0.82, rr * 0.6, d)  # the flower's centre is always opaque
    a = np.maximum(key, core) * circle
    # un-premultiply against the black background
    rgb = src / np.maximum(a[..., None], 1e-3)
    rgb = np.where(a[..., None] > 0.02, np.minimum(rgb, 1), 0)
    x0, x1 = int(max(0, cx - r)), int(min(W, cx + r))
    y0, y1 = int(max(0, cy - r)), int(min(H, cy + r))
    save_rgba(rgb[y0:y1, x0:x1], a[y0:y1, x0:x1], f'{OUT}/{name}.webp', max_side=720)


# ── long-stem rose on white: difference key against a fitted background ──
img = np.asarray(Image.open(white_path).convert('RGB')).astype(float) / 255
h, w, _ = img.shape
# fit a smooth background plane from the border pixels
border = np.zeros((h, w), bool)
border[:30, :] = border[-30:, :] = border[:, :30] = True
border[:, -30:] = True
ys, xs = np.nonzero(border)
A = np.c_[np.ones_like(xs), xs / w, ys / h, (xs / w) ** 2, (ys / h) ** 2]
bg = np.zeros_like(img)
Y, X = np.mgrid[0:h, 0:w]
Af = np.c_[np.ones(h * w), (X / w).ravel(), (Y / h).ravel(), (X / w).ravel() ** 2, (Y / h).ravel() ** 2]
for c in range(3):
    coef, *_ = np.linalg.lstsq(A, img[ys, xs, c], rcond=None)
    bg[..., c] = (Af @ coef).reshape(h, w)

diff = np.clip(bg - img, 0, 1).max(axis=2)
sat = img.max(axis=2) - img.min(axis=2)
darker = np.clip((bg.mean(axis=2) - img.mean(axis=2)), 0, 1)
obj = np.maximum(smoothstep(0.10, 0.22, sat * 1.4), smoothstep(0.40, 0.56, diff))
shadow = np.clip(darker / 0.32, 0, 1) ** 1.2 * (1 - obj) * 0.62
a = np.clip(obj + shadow, 0, 1)
a = gaussian_filter(a, 0.6)
rgb = (img - bg * (1 - a[..., None])) / np.maximum(a[..., None], 1e-3)
rgb = np.clip(rgb, 0, 1)
# shadow pixels should be a soft warm-dark, not grey noise
rgb = np.where((obj < 0.5)[..., None], np.array([0.18, 0.08, 0.05]), rgb)
save_rgba(rgb, a, f'{OUT}/rose-stem.webp', max_side=1100)
