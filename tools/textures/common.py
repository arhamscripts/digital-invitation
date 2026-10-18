import numpy as np
from PIL import Image

rng = np.random.default_rng(7)


def fft_noise(h, w, beta=2.0, sx=1.0, sy=1.0, seed=None):
    """Periodic (tileable) 1/f^beta noise, normalised to [-1, 1].
    sx/sy > 1 stretch the noise along that axis."""
    r = np.random.default_rng(seed) if seed is not None else rng
    white = r.standard_normal((h, w))
    fy = np.fft.fftfreq(h)[:, None] * sy
    fx = np.fft.fftfreq(w)[None, :] * sx
    f = np.sqrt(fx * fx + fy * fy)
    f[0, 0] = 1
    spec = np.fft.fft2(white) / f**beta
    spec[0, 0] = 0
    n = np.real(np.fft.ifft2(spec))
    n -= n.mean()
    return n / (np.abs(n).max() + 1e-9)


def band_noise(h, w, lo, hi, sx=1.0, sy=1.0, seed=None):
    """Tileable band-limited noise between frequencies lo..hi (cycles/pixel)."""
    r = np.random.default_rng(seed) if seed is not None else rng
    white = r.standard_normal((h, w))
    fy = np.fft.fftfreq(h)[:, None] * sy
    fx = np.fft.fftfreq(w)[None, :] * sx
    f = np.sqrt(fx * fx + fy * fy)
    mask = np.exp(-(((f - (lo + hi) / 2) / ((hi - lo) / 2 + 1e-9)) ** 2))
    n = np.real(np.fft.ifft2(np.fft.fft2(white) * mask))
    n -= n.mean()
    return n / (n.std() * 3 + 1e-9)


def normals(hmap, depth):
    gy, gx = np.gradient(hmap * depth)
    n = np.dstack([-gx, -gy, np.ones_like(hmap)])
    return n / np.linalg.norm(n, axis=2, keepdims=True)


def tonemap(lin, exposure=1.0):
    c = 1 - np.exp(-lin * exposure)
    return np.clip(c, 0, 1) ** (1 / 2.2)


def save(arr, path, quality=82, alpha=None):
    a = (np.clip(arr, 0, 1) * 255 + 0.5).astype(np.uint8)
    if alpha is not None:
        al = (np.clip(alpha, 0, 1) * 255 + 0.5).astype(np.uint8)
        img = Image.fromarray(np.dstack([a, al]), 'RGBA')
    else:
        img = Image.fromarray(a, 'RGB')
    if path.endswith('.webp'):
        img.save(path, 'WEBP', quality=quality, method=6)
    elif path.endswith('.jpg'):
        img.save(path, 'JPEG', quality=quality, optimize=True, progressive=True)
    else:
        img.save(path, optimize=True)
    return img
