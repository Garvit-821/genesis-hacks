"""
Turn event photographs into engraved ink plates for the home page story.

Look: copperplate hatching (line width follows tone), cross-hatching in the shadows,
inked contour lines, and one vermilion spot colour for saturated reds, printed on paper.
Output is a 3-colour palette PNG: paper, ink, vermilion. Real photos, drawn, not invented.

Usage: python3 scripts/engrave.py <src.webp> <out.png> [width]
"""
import sys
import numpy as np
from PIL import Image, ImageFilter

PAPER = (242, 238, 230)
INK = (12, 11, 16)
SPOT = (226, 59, 39)  # vermilion


def blur(a, r):
    img = Image.fromarray(np.clip(a * 255, 0, 255).astype(np.uint8))
    return np.asarray(img.filter(ImageFilter.GaussianBlur(r)), dtype=np.float32) / 255.0


def hatch(h, w, angle, period, phase=0.0):
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
    a = np.deg2rad(angle)
    # A slow wobble so lines read as hand-cut, not ruled.
    t = (xx * np.cos(a) + yy * np.sin(a)) / period + phase
    t += 0.18 * np.sin((xx * np.sin(a) - yy * np.cos(a)) / (period * 9.0))
    return np.abs((t % 1.0) - 0.5) * 2.0  # 0 on the line centre, 1 between lines


def engrave(src, out, width=1920):
    im = Image.open(src).convert('RGB')
    h0 = round(im.height * width / im.width)
    im = im.resize((width, h0), Image.LANCZOS)
    rgb = np.asarray(im, dtype=np.float32) / 255.0
    h, w, _ = rgb.shape

    lum = rgb[..., 0] * 0.299 + rgb[..., 1] * 0.587 + rgb[..., 2] * 0.114
    # Local contrast so figures separate from bright walls, then a print-like curve.
    lum = np.clip(lum + (lum - blur(lum, 24)) * 1.15, 0, 1)
    lum = np.clip((lum - 0.06) / 0.86, 0, 1) ** 1.15
    dark = 1.0 - blur(lum, 0.8)

    p = max(5.0, width / 300.0)
    ink = hatch(h, w, 32, p) < np.clip((dark - 0.2) * 1.15, 0, 1)
    ink |= hatch(h, w, -38, p * 0.9, 0.3) < np.clip((dark - 0.56) * 1.7, 0, 1)
    ink |= hatch(h, w, 82, p * 0.8, 0.6) < np.clip((dark - 0.78) * 2.4, 0, 1)
    ink |= dark > 0.94

    # Contours: gradient of a softened tone map, thresholded into drawn lines.
    s = blur(lum, 1.6)
    gy, gx = np.gradient(s)
    edge = np.hypot(gx, gy)
    ink |= edge > np.percentile(edge, 94.5)

    # Spot colour: strongly saturated reds and oranges print in vermilion instead of black.
    mx, mn = rgb.max(2), rgb.min(2)
    sat = (mx - mn) / (mx + 1e-5)
    r, g, b = rgb[..., 0], rgb[..., 1], rgb[..., 2]
    # True reds only (cans, shirts, signage). Skin keeps g/r around 0.6-0.8, so it stays in ink.
    reddish = (g < r * 0.42) & (b < r * 0.5) & (sat > 0.6) & (r > 0.32)
    reddish = blur(reddish.astype(np.float32), 1.2) > 0.5

    out_rgb = np.empty((h, w, 3), dtype=np.uint8)
    out_rgb[:] = PAPER
    out_rgb[ink] = INK
    spot_fill = reddish & ((dark > 0.18) | ink)
    out_rgb[spot_fill] = SPOT

    img = Image.fromarray(out_rgb).quantize(colors=3, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.NONE)
    img.save(out, optimize=True)
    return w, h


if __name__ == '__main__':
    width = int(sys.argv[3]) if len(sys.argv) > 3 else 1920
    w, h = engrave(sys.argv[1], sys.argv[2], width)
    print(f'{sys.argv[2]} {w}x{h}')
