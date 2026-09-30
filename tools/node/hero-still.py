"""Hero loop, round 18: a photograph of defocused light, set moving like light off water.

Rounds 17–18 simulated the light (hero-water.py, hero-facets.py) and the critics read it as CG — smoke, ribbons,
slide-deck polygons. The reference is photographed. So the look comes from a photograph (a Higgsfield still of
light through whisky, water and cut glass, taken fully out of focus) and only the motion is made here, exactly
looped:

  · the still is split into its copper light and its slate light (light adds, so the two layers sum back to it);
  · each layer drifts on its own path (the copper nearer, so further: parallax) — forms slide across each other;
  · each is rippled by moving water (a smooth displacement that turns whole times per loop) — the light swims;
  · focus drifts between the layers (one softly readable while the other dissolves, then the other way);
  · the still's crisp cream highlight is held down to copper except once a loop, when it catches and passes;
  · graded to design/bar.md rule 8, film grain at full size.

  /Applications/Blender.app/Contents/Resources/5.2/python/bin/python3.13 tools/node/hero-still.py <still.png> <out.mp4>
"""
import os, subprocess, sys
import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
FF = os.path.join(HERE, "node_modules/ffmpeg-static/ffmpeg")
W, H = 1600, 850
N = int(os.environ.get("FRAMES", 198))                 # 8.25 s at 24 fps (reference 8.3 s)
still, out = sys.argv[1:3]
E = lambda k, d: float(os.environ.get(k, d))
PAD = 1.12                                             # the still is laid a little larger than the frame: room to drift
CW, CH = int(W * PAD) // 2 * 2, int(H * PAD) // 2 * 2


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


def load(path):
    """The still, fitted to cover the (padded) canvas, linear-ish 0…1."""
    raw = subprocess.run([FF, "-loglevel", "error", "-i", path, "-vf", f"scale={CW}:{CH}:force_original_aspect_ratio=increase:flags=lanczos,crop={CW}:{CH},format=rgb24",
                          "-f", "rawvideo", "-"], capture_output=True).stdout
    return np.frombuffer(raw, np.uint8).reshape(CH, CW, 3).astype(np.float32) / 255.0


S = load(still)
lum = S @ np.array([0.2126, 0.7152, 0.0722], np.float32)
warmth = np.clip((S[..., 0] - S[..., 2]) / (S.max(-1) + 0.02) * 3.0, 0, 1)
warmth = lens(warmth, 6)                                                      # soft split: no seams between layers
hot = np.clip((lens(lum, 2) - E("HOT", 0.86)) / 0.1, 0, 1)                    # the crisp cream highlight
LAYERS = [S * (warmth * (1 - hot))[..., None], S * (1 - warmth)[..., None]]  # copper light, slate light
HOT = S * hot[..., None]
TIN = np.array([1.0, 0.62, 0.40], np.float32)                                # the highlight's tint when it is not catching

ys, xs = np.mgrid[0:H, 0:W].astype(np.float32)
rng = np.random.default_rng(int(E("SEED", 4)))


def ripples(n, amp, lam):
    wv = []
    for _ in range(n):
        L = rng.uniform(*lam) * H; ang = rng.uniform(0, np.pi); k = 2 * np.pi / L
        wv.append((k * np.cos(ang), k * np.sin(ang), rng.choice([1, -1]), rng.uniform(0, 2 * np.pi), rng.uniform(0, 2 * np.pi)))
    def at(t):
        dx = np.zeros((H, W), np.float32); dy = np.zeros((H, W), np.float32)
        for kx, ky, om, p1, p2 in wv:
            ph = kx * xs + ky * ys + 2 * np.pi * om * t
            dx += np.sin(ph + p1); dy += np.cos(ph + p2)
        return dx * amp / np.sqrt(n), dy * amp / np.sqrt(n)
    return at


#          drift (px): x, y      ripple: n, amp px, wavelengths      focus phase
PATHS = [((E("WX", 110), 22), ripples(4, E("RW", 16), (0.35, 0.9)), 0.0),     # copper, nearer
         ((E("CX", 50), 16), ripples(4, E("RC", 12), (0.4, 1.1)), 0.5)]        # slate, further
PH = rng.uniform(0, 2 * np.pi, (2, 2))


def sample(img, X, Y):
    """Bilinear lookup of img at float coordinates (clamped to the canvas)."""
    X = np.clip(X, 0, CW - 1.001); Y = np.clip(Y, 0, CH - 1.001)
    x0 = X.astype(np.int32); y0 = Y.astype(np.int32); fx = (X - x0)[..., None]; fy = (Y - y0)[..., None]
    a = img[y0, x0]; b = img[y0, x0 + 1]; c = img[y0 + 1, x0]; d = img[y0 + 1, x0 + 1]
    return (a * (1 - fx) + b * fx) * (1 - fy) + (c * (1 - fx) + d * fx) * fy


enc = subprocess.Popen([FF, "-loglevel", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W}x{H}", "-r", "24", "-i", "-",
                        "-vf", f"scale=out_color_matrix=bt709:out_range=tv:flags=accurate_rnd+full_chroma_int+full_chroma_inp,format=yuv420p,noise=c0s={int(E('GRAIN', 6))}:c0f=t",
                        "-c:v", "libx264", "-preset", "slow", "-crf", "20", "-maxrate", "850k", "-bufsize", "1700k", "-profile:v", "high",
                        "-pix_fmt", "yuv420p", "-colorspace", "bt709", "-color_primaries", "bt709", "-color_trc", "iec61966-2-1",
                        "-color_range", "tv", "-movflags", "+faststart", out], stdin=subprocess.PIPE)
ox0, oy0 = (CW - W) / 2, (CH - H) / 2
G_AT = E("GLINT_AT", 0.31)
for i in range(N):
    t = i / N; a = 2 * np.pi * t
    x = np.zeros((H, W, 3), np.float32)
    for j, (img, ((ax, ay), rip, fph)) in enumerate(zip(LAYERS, PATHS)):
        dx, dy = rip(t)
        X = xs + ox0 + ax * np.sin(a + PH[j, 0]) + dx; Y = ys + oy0 + ay * np.sin(a + PH[j, 1]) + dy
        L = sample(img, X, Y)
        f = 0.5 + 0.5 * np.cos(a + np.pi * 2 * fph)                         # 1: this layer is the softly focused one
        L = L * (0.35 + 0.65 * f) + lens(L, E("DEFOCUS", 14)) * (0.65 * (1 - f))
        x += L
        if j == 0:                                                          # the highlight rides on the copper light
            e = np.exp(-0.5 * (min(abs(t - G_AT), 1 - abs(t - G_AT)) / 0.035) ** 2)
            Hh = sample(HOT, X, Y)
            x += Hh * (e + (1 - e) * TIN * E("HOTREST", 0.45))                 # cream once a loop, copper otherwise
    x = np.clip(x * E("EXPO", 1.0), 0, None) ** E("GAMMA", 1.35)               # the reference's darkness
    mx, mn = x.max(-1, keepdims=True), x.min(-1, keepdims=True)                # lit saturation held to the reference's:
    y = x @ np.array([0.2126, 0.7152, 0.0722], np.float32)                     # peach and slate, not orange and blue
    x = y[..., None] + (x - y[..., None]) * np.minimum(1, E("SAT", 0.42) / ((mx - mn) / (mx + 1e-3) + 1e-6))
    x = x + np.array([7, 11, 14], np.float32) / 255.0 * (1 - np.clip(x, 0, 1)) ** 3
    enc.stdin.write(np.clip(x * 255, 0, 255).astype(np.uint8).tobytes())
    if i % 48 == 0: print(f"frame {i}/{N}", flush=True)
enc.stdin.close(); enc.wait()
print("built", out)
