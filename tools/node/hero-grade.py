"""Hero loop, round 19: grade real footage (Higgsfield takes of defocused light) to the reference.

The owner compared the reference with our simulated and animated-still loops and chose the reference: neither
was close. So the motion now comes from real generated footage — a photograph of defocused light through whisky,
water and cut glass, animated by Kling — and this only grades it to design/bar.md rule 8 and closes the loop:

  · fitted to 1600 × 850 (cover), optionally defocused further (a lens-like flat kernel);
  · the reference's darkness (gamma / exposure), wide bright areas held down, lit saturation capped (peach and
    slate, not orange and blue), blacks at ≈ (7, 11, 14);
  · if the take does not end exactly where it began, the last XF frames ease into the first ones (the take's own
    motion carries through; set XF=0 when it ends on its first frame);
  · film grain at full size; BT.709 with the sRGB transfer tag, ≤ 850 kb/s, faststart.

  /Applications/Blender.app/Contents/Resources/5.2/python/bin/python3.13 tools/node/hero-grade.py <in.mp4> <out.mp4>
"""
import os, subprocess, sys
import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
FF = os.path.join(HERE, "node_modules/ffmpeg-static/ffmpeg")
W, H = 1600, 850
src, out = sys.argv[1:3]
E = lambda k, d: float(os.environ.get(k, d))
TORGB = "scale=in_color_matrix=bt709:in_range=tv:flags=accurate_rnd+full_chroma_int+full_chroma_inp"


def box(a, r, axis):
    if r < 1: return a
    pad = [(0, 0)] * a.ndim; pad[axis] = (r + 1, r)
    c = np.cumsum(np.pad(a, pad, mode="edge"), axis=axis, dtype=np.float32)
    hi = np.take(c, np.arange(2 * r + 1, c.shape[axis]), axis=axis)
    lo = np.take(c, np.arange(0, c.shape[axis] - 2 * r - 1), axis=axis)
    return (hi - lo) / (2 * r + 1)


def lens(a, s):
    r = max(1, int(round(s)))
    a = box(box(a, r, 0), r, 1)
    r2 = max(1, r // 3)
    return box(box(a, r2, 0), r2, 1)


def gauss(a, s):
    r = max(0, int(round((np.sqrt(12 * s * s / 3 + 1) - 1) / 2)))
    for _ in range(3): a = box(box(a, r, 0), r, 1)
    return a


raw = subprocess.run([FF, "-loglevel", "error", "-i", src, "-vf",
                      f"scale={W}:{H}:force_original_aspect_ratio=increase:flags=bicubic,crop={W}:{H},{TORGB},format=rgb24,fps=24",
                      "-f", "rawvideo", "-"], capture_output=True).stdout
F = np.frombuffer(raw, np.uint8).reshape(-1, H, W, 3)
N0 = len(F); XF = int(E("XF", 0)); N = N0 - XF
print(f"{N0} frames in, {N} out (blend {XF})", flush=True)

enc = subprocess.Popen([FF, "-loglevel", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W}x{H}", "-r", "24", "-i", "-",
                        "-vf", f"scale=out_color_matrix=bt709:out_range=tv:flags=accurate_rnd+full_chroma_int+full_chroma_inp,format=yuv420p,noise=c0s={int(E('GRAIN', 5))}:c0f=t",
                        "-c:v", "libx264", "-preset", "slow", "-crf", "20", "-maxrate", "850k", "-bufsize", "1700k", "-profile:v", "high",
                        "-pix_fmt", "yuv420p", "-colorspace", "bt709", "-color_primaries", "bt709", "-color_trc", "iec61966-2-1",
                        "-color_range", "tv", "-movflags", "+faststart", out], stdin=subprocess.PIPE)
Y = np.array([0.2126, 0.7152, 0.0722], np.float32)
for i in range(N):
    x = F[i].astype(np.float32) / 255
    if XF and i < XF:                                    # the take's tail eases into its head: the loop point
        k = (i + 1) / (XF + 1); k = k * k * (3 - 2 * k)
        x = x * k + F[N + i].astype(np.float32) / 255 * (1 - k)
    if E("BLUR", 0) > 0: x = lens(x, E("BLUR", 0))
    x = np.clip(x * E("EXPO", 1.0), 0, None) ** E("GAMMA", 1.4)
    Lw = gauss(x @ Y, 50)                                 # wide pools of light held down, small lights kept
    x = x * np.minimum(1, (E("LOCAL", 0.16) / np.maximum(Lw, 1e-4)) ** 0.6)[..., None]
    mx, mn = x.max(-1, keepdims=True), x.min(-1, keepdims=True)
    y = x @ Y
    x = y[..., None] + (x - y[..., None]) * np.minimum(1, E("SAT", 0.42) / ((mx - mn) / (mx + 1e-3) + 1e-6))
    # the take's own brightest catches (a crescent off the glass) stay cream when they peak, not graded to copper
    hot = np.clip((gauss(F[i].astype(np.float32) @ Y / 255, 1.5) - E("HOT", 0.9)) / 0.08, 0, 1)
    x = x + (gauss(hot, 2) * E("HOTK", 0.9))[..., None] * (np.array([1.0, 0.957, 0.878], np.float32) - x)
    x = x + np.array([7, 11, 14], np.float32) / 255.0 * (1 - np.clip(x, 0, 1)) ** 3
    enc.stdin.write(np.clip(x * 255, 0, 255).astype(np.uint8).tobytes())
enc.stdin.close(); enc.wait()
print("built", out)
