"""Hero loop, round 15 on: a real-lens look from a sharp take and its depth map.

Rounds 1–14 blurred the whole frame by one amount, and every craft critic read that as fog or stock bokeh.
The reference (design/ref-ciridae/.../hero_web.mp4) is a camera on glass objects at a wide aperture: the
nearest form keeps a soft, readable edge while the ones behind dissolve, the focus drifts, and now and then a
small cream glint catches. This does that from a SHARP take (Higgsfield) plus its depth map (Higgsfield's
Depth Anything Video):

  · a stack of blurs (σ ≈ 2 / 7 / 15 / 30 px at 1600 wide), blended per pixel by the circle of confusion
    |depth − focus(t)|, with the focus plane travelling near → far → near once per loop, so it closes;
  · glints kept from the sharp frame (luma > 232), softened a touch and warmed to cream;
  · the grade the bar measures (design/bar.md 8): mostly dark, near-neutral blue-black shadows, no green.

Run with any Python that has numpy (Blender's does):
  /Applications/Blender.app/Contents/Resources/5.2/python/bin/python3.13 tools/node/hero-lens.py \
      <colour.mp4> <depth.mp4> <out.mp4> [focus_near=0.5] [focus_far=0.3] [gain=2.4]
  The depth map is bright = near. Focus stays on the middle forms, so the nearest (a glass lip) never
  sharpens into a readable bowl (bar rule 11).
"""
import os, subprocess, sys
import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
FF = os.path.join(HERE, "node_modules/ffmpeg-static/ffmpeg")
W, H = 1600, 850

colour, depth, out = sys.argv[1:4]
F_NEAR = float(sys.argv[4]) if len(sys.argv) > 4 else 0.5
F_FAR = float(sys.argv[5]) if len(sys.argv) > 5 else 0.3
GAIN = float(sys.argv[6]) if len(sys.argv) > 6 else 2.4
SIGMAS = [float(v) for v in os.environ.get("SIGMAS", "12,18,27,39").split(",")]                                                # even in focus, a wide aperture is never razor-sharp
ZOOM = float(os.environ.get("ZOOM", 1.25))                                     # closer in: fewer, larger forms
GAMMA = float(os.environ.get("GAMMA", 1.15)); EXPO = float(os.environ.get("EXPO", 1.3)); WARM = float(os.environ.get("WARM", 1.1)); SAT = float(os.environ.get("SAT", 0.42))

TORGB = "scale=in_color_matrix=bt709:in_range=tv:flags=accurate_rnd+full_chroma_int+full_chroma_inp"
FIT = f"scale={int(W * ZOOM) // 2 * 2}:{int(W * ZOOM * 9 / 16) // 2 * 2}:flags=bicubic,crop={W}:{H}"


def frames(path, fmt, ch):
    p = subprocess.Popen([FF, "-loglevel", "error", "-i", path, "-vf", f"{FIT},{TORGB},format={fmt}", "-f", "rawvideo", "-"], stdout=subprocess.PIPE)
    n = W * H * ch
    while True:
        b = p.stdout.read(n)
        if len(b) < n: break
        yield np.frombuffer(b, np.uint8).reshape(H, W, ch).astype(np.float32)


def count(path):
    r = subprocess.run([FF, "-i", path, "-map", "0:v:0", "-f", "null", "-"], capture_output=True, text=True).stderr
    return int(r.rsplit("frame=", 1)[1].split()[0])


def box(a, r, axis):
    """Box blur of radius r along one axis, by cumulative sums (edges clamped)."""
    if r < 1: return a
    pad = [(0, 0)] * a.ndim; pad[axis] = (r + 1, r)
    c = np.cumsum(np.pad(a, pad, mode="edge"), axis=axis, dtype=np.float32)
    hi = np.take(c, np.arange(2 * r + 1, c.shape[axis]), axis=axis)
    lo = np.take(c, np.arange(0, c.shape[axis] - 2 * r - 1), axis=axis)
    return (hi - lo) / (2 * r + 1)


def dilate(a, r):
    """Max filter of radius ≈ r (doubling shifts): a near object's blur spreads over what is behind it."""
    k = 1
    while k <= r:
        for ax in (0, 1):
            a = np.maximum(a, np.maximum(np.roll(a, k, ax), np.roll(a, -k, ax)))
        k *= 2
    return a


def gauss(a, s):
    """Three box passes ≈ a Gaussian of σ s."""
    r = max(0, int(round((np.sqrt(12 * s * s / 3 + 1) - 1) / 2)))
    for _ in range(3): a = box(box(a, r, 0), r, 1)
    return a


N = count(colour)
enc = subprocess.Popen([FF, "-loglevel", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W}x{H}", "-r", "24", "-i", "-",
                        "-vf", "scale=out_color_matrix=bt709:out_range=tv:flags=accurate_rnd+full_chroma_int+full_chroma_inp,format=yuv420p",
                        "-c:v", "libx264", "-preset", "slow", "-crf", "20", "-profile:v", "high", "-pix_fmt", "yuv420p",
                        "-colorspace", "bt709", "-color_primaries", "bt709", "-color_trc", "iec61966-2-1", "-color_range", "tv",
                        "-movflags", "+faststart", out], stdin=subprocess.PIPE)
rng = np.random.default_rng(7)
for i, (c, d) in enumerate(zip(frames(colour, "rgb24", 3), frames(depth, "gray", 1))):
    t = i / N
    focus = F_FAR + (F_NEAR - F_FAR) * (0.5 + 0.5 * np.cos(2 * np.pi * t))        # near at the loop point, far half-way
    dz = gauss(dilate(d[..., 0] / 255.0, 24), 10)                                  # near edges keep the near depth (no sharp rim halo)
    coc = np.clip(np.abs(dz - focus) * GAIN, 0, 1) * (len(SIGMAS) - 1)           # 0 … 3 → which blur
    img = np.zeros_like(c)
    for k, s in enumerate(SIGMAS):                                                 # linear blend between neighbouring blurs
        img += gauss(c, s) * np.clip(1 - np.abs(coc - k), 0, 1)[..., None]
    # glints: the sharp frame's hottest points, only where that surface is near focus (a defocused glint is
    # already spread by the blur), softened and warmed to cream
    lum = c @ np.array([0.2126, 0.7152, 0.0722], np.float32)
    g = gauss(np.clip((lum - 232) / 23, 0, 1) * np.clip(1 - coc / 1.5, 0, 1), 6.0)[..., None]
    img = img + np.clip(g * 1.4, 0, 1) * (np.array([255, 244, 224], np.float32) - img) * 0.8
    # grade: mostly dark, near-neutral blue-black, no green (design/bar.md 8)
    x = np.clip(img / 255.0, 0, 1)
    x = x ** GAMMA * EXPO                                                          # the reference's exposure: dark, but the forms carry light
    x[..., 0] *= WARM; x[..., 1] *= 0.95                                           # copper a touch warmer; no green cast
    mx, mn = x.max(-1, keepdims=True), x.min(-1, keepdims=True)                   # lit saturation held to the reference's
    y = x @ np.array([0.2126, 0.7152, 0.0722], np.float32)                         # ≈ 0.29–0.40: peach and slate, not orange and blue
    x = y[..., None] + (x - y[..., None]) * np.minimum(1, SAT / ((mx - mn) / (mx + 1e-3) + 1e-6))
    x = x + np.array([9, 13, 16], np.float32) / 255.0 * (1 - x) ** 3              # blacks read ≈ (7, 11, 14) after grain and encode
    x = x * 255 + rng.normal(0, 1.2, x.shape).astype(np.float32)                  # a touch of grain
    enc.stdin.write(np.clip(x, 0, 255).astype(np.uint8).tobytes())
    if i % 24 == 0: print(f"frame {i}/{N} focus {focus:.2f}", flush=True)
enc.stdin.close(); enc.wait()
print("built", out)
