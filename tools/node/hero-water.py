"""Hero loop, round 17: light bounced off moving water onto a dark wall, out of focus.

The reference (design/ref-ciridae/.../hero_web.mp4) is not objects: it is soft patches of warm and cool light
that swim, bend and cross, with now and then a crisp cream crescent — a caustic, filmed defocused. This makes
one from first principles, so it loops exactly:

  · a water surface h(x, y, t) = a sum of ripples, each turning a whole number of times per loop (t ∈ [0, 1));
  · light refracted through it lands at p + s·∇h — splatted forward, the density IS the caustic (bright where
    the surface focuses light: bands, cusps, crescents);
  · two such lights, a warm one (copper-peach) and a cool one (slate), in different places, smeared along the
    direction of travel and blurred to the reference's softness, with a focus that comes and goes;
  · graded to design/bar.md rule 8 (mostly dark, near-neutral blue-black shadows, no green).

Run with any Python that has numpy (Blender's does):
  /Applications/Blender.app/Contents/Resources/5.2/python/bin/python3.13 tools/node/hero-water.py <out.mp4> [seed=3]
"""
import os, subprocess, sys
import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
FF = os.path.join(HERE, "node_modules/ffmpeg-static/ffmpeg")
W, H = 1600, 850                        # delivered
w, h = 800, 425                         # worked (everything is blurred far past this resolution)
N = int(os.environ.get("FRAMES", 198))  # 8.25 s at 24 fps (reference 8.3 s)
out = sys.argv[1]
SEED = int(sys.argv[2]) if len(sys.argv) > 2 else 3
E = lambda k, d: float(os.environ.get(k, d))
S_REFR = E("REFR", 3.0)                 # how hard the water bends the light (more → sharper, busier caustics)
BLUR = E("BLUR", 22.0)                  # softness at 800 px wide (reference ≈ 14–22)
SHARP = E("SHARP", 3.0)                  # the in-focus moments
SW = E("SW", 0.6)                       # how much of the light is in focus at those moments
GAMMA, EXPO = E("GAMMA", 1.0), E("EXPO", 1.0)


def box(a, r, axis):
    if r < 1: return a
    pad = [(0, 0)] * a.ndim; pad[axis] = (r + 1, r)
    c = np.cumsum(np.pad(a, pad), axis=axis, dtype=np.float32)                   # dark past the frame: no edge glow
    hi = np.take(c, np.arange(2 * r + 1, c.shape[axis]), axis=axis)
    lo = np.take(c, np.arange(0, c.shape[axis] - 2 * r - 1), axis=axis)
    return (hi - lo) / (2 * r + 1)


def gauss(a, s):
    r = max(0, int(round((np.sqrt(12 * s * s / 3 + 1) - 1) / 2)))
    for _ in range(3): a = box(box(a, r, 0), r, 1)
    return a


def lens(a, s):
    """Defocus as a lens does it: a flat, hard-edged kernel (patches keep an edge), barely rounded off —
    not a Gaussian's mush. Same spread as gauss(a, s)."""
    r = max(1, int(round(s * 1.5)))
    a = box(box(a, r, 0), r, 1)
    r2 = max(1, r // 3)
    return box(box(a, r2, 0), r2, 1)


class Water:
    """A patch of rippling water lit by one source; .light(t) is where its light lands on the wall."""
    def __init__(self, rng, n=4, lam=(1.6, 3.6), ss=2):
        self.k, self.a, self.om, self.ph = [], [], [], []
        for _ in range(n):
            lam_i = rng.uniform(*lam); ang = rng.normal(-0.9, 0.7)            # mostly running on a diagonal
            kk = 2 * np.pi / lam_i
            self.k.append((kk * np.cos(ang), kk * np.sin(ang)))
            self.a.append(0.012 * lam_i ** 1.6)
            self.om.append(2 * np.pi * rng.choice([1, -1, 0]))                     # whole turns per loop (or standing): it closes
            self.ph.append(rng.uniform(0, 2 * np.pi))
        ys, xs = np.mgrid[0:h * ss, 0:w * ss].astype(np.float32) / (h * ss)       # y 0…1, x 0…1.88
        self.x, self.y, self.ss = xs.ravel(), ys.ravel(), ss

    def light(self, t, refr, off=(0.0, 0.0)):
        gx = np.zeros_like(self.x); gy = np.zeros_like(self.y)
        for (kx, ky), a, om, ph in zip(self.k, self.a, self.om, self.ph):
            c = a * np.cos(kx * self.x + ky * self.y + om * t + ph)
            gx += c * kx; gy += c * ky
        px = (self.x + refr * gx) * h + off[0]; py = (self.y + refr * gy) * h + off[1]  # where each ray lands, in pixels
        ix = px.astype(np.int32); iy = py.astype(np.int32)
        ok = (ix >= 0) & (ix < w) & (iy >= 0) & (iy < h)                           # rays that leave the frame are gone
        img = np.bincount(iy[ok] * w + ix[ok], minlength=w * h).astype(np.float32).reshape(h, w)
        return img / (self.ss * self.ss)                                           # 1.0 = flat water


def smear(a, dx, dy, n=10):
    """Streak along (dx, dy) pixels: the reference's light is drawn out along its direction of travel."""
    acc = np.zeros_like(a); hh, ww = a.shape
    for i in range(n):
        f = i / (n - 1) - 0.5; oy, ox = int(round(f * dy)), int(round(f * dx))
        acc[max(oy, 0):hh + min(oy, 0), max(ox, 0):ww + min(ox, 0)] += a[max(-oy, 0):hh - max(oy, 0), max(-ox, 0):ww - max(ox, 0)]
    return acc / n                                                              # shifted, not wrapped round the frame


def blob(cx, cy, rx, ry):
    ys, xs = np.mgrid[0:h, 0:w].astype(np.float32)
    return np.exp(-0.5 * (((xs - cx * w) / (rx * w)) ** 2 + ((ys - cy * h) / (ry * h)) ** 2))


rng = np.random.default_rng(SEED)
C_WARM = np.array([1.00, 0.62, 0.42], np.float32)       # copper-peach
C_COOL = np.array([0.46, 0.55, 0.70], np.float32)       # slate
NR = int(E("NR", 6))
# five lights, each its own patch of water and its own pool on the wall, laid out as in the reference: a tall warm
# pool left of centre with a smaller one below the middle; slate across the upper right, the right edge and top left
# …and a faint slate haze drifting along the top, as in most of the reference's frames
# depth: how near the light's surface is — near ones sway further across the frame (parallax), one sway per loop
#        pool (cx, cy, rx, ry)        colour  level  smear (dx, dy)  focus phase  floor  blur        ripples     depth
LIGHTS = [((0.30, 0.48, 0.11, 0.55), C_WARM, 1.00, (-10, 60), 0.00, 0.35, BLUR,       (1.2, 3.4), 1.00),
          ((0.46, 0.80, 0.09, 0.22), C_WARM, 0.55, (30, 20), 0.35, 0.35, BLUR,        (1.2, 3.4), 0.60),
          ((0.72, 0.28, 0.15, 0.30), C_COOL, 0.85, (40, -22), 0.50, 0.6, BLUR * 1.4, (1.2, 3.4), 0.35),
          ((0.86, 0.68, 0.08, 0.26), C_COOL, 0.50, (10, 50), 0.80, 0.6, BLUR * 1.4,  (1.2, 3.4), 0.70),
          ((0.12, 0.12, 0.12, 0.14), C_COOL, 0.40, (45, 10), 0.20, 0.6, BLUR * 1.4,  (1.2, 3.4), 0.20),
          ((0.55, 0.02, 0.45, 0.22), C_COOL, E("HAZE", 0.14), (80, 0), 0.60, 0.0, 60.0, (3.0, 6.0), 0.05)]
SWAY = E("SWAY", 70.0)                  # px at 800 wide for the nearest light
SW_PH = rng.uniform(0, 2 * np.pi, len(LIGHTS))
def sway(j, t):
    d = LIGHTS[j][8] * SWAY
    return d * np.sin(2 * np.pi * t + SW_PH[j] * 0.3), 0.25 * d * np.sin(2 * np.pi * t + SW_PH[j])
WATERS = [Water(rng, n=NR, lam=lt[7]) for lt in LIGHTS]

enc = subprocess.Popen([FF, "-loglevel", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{w}x{h}", "-r", "24", "-i", "-",
                        "-vf", f"scale={W}:{H}:flags=bicubic,scale=out_color_matrix=bt709:out_range=tv:flags=accurate_rnd+full_chroma_int+full_chroma_inp,format=yuv420p,noise=c0s={int(E('GRAIN', 7))}:c0f=t",
                        "-c:v", "libx264", "-preset", "slow", "-crf", "20", "-maxrate", "850k", "-bufsize", "1700k", "-profile:v", "high",
                        "-pix_fmt", "yuv420p", "-colorspace", "bt709", "-color_primaries", "bt709", "-color_trc", "iec61966-2-1",
                        "-color_range", "tv", "-movflags", "+faststart", out], stdin=subprocess.PIPE)
# pass 1: each light as it falls, smeared and blurred (kept, half precision)
def layer(j, t):
    water = WATERS[j]; (cx, cy, rx, ry), c, lv, dxy, ph, floor, blur, lam, depth = LIGHTS[j]
    ox, oy = sway(j, t)
    m = blob(cx + ox / w, cy + oy / h, rx, ry)
    L = water.light(t, S_REFR, (ox, oy))
    L = np.maximum(L - floor, 0)                                                # only where the water gathers light
    L = smear(L, *dxy)
    f = 0.5 + 0.5 * np.cos(2 * np.pi * (2 * t + ph))                            # focus comes and goes, twice a loop
    sw = SW if blur == BLUR else 0.0                                            # the haze is never in focus
    L = (lens(L, blur) * (1 - sw * f) + lens(L, SHARP + 4 * (1 - f)) * sw * f) * m
    if j == 0 and E("LIP", 1):
        # the nearest light crosses the lip of a glass: a gently curved edge, softly focused, that sweeps up and down
        # the copper column; light past it is dimmed, and a highlight runs along it
        ys, xs = np.mgrid[0:h, 0:w].astype(np.float32)
        ecx = (cx + 0.05) * w + ox; ecy = -1.5 * h + 0.18 * h * np.sin(2 * np.pi * t + 1.1) + oy; R = 2.0 * h
        dist = np.sqrt((xs - ecx) ** 2 + (ys - ecy) ** 2) - R                    # < 0 above the lip
        soft = 1.2 + 2.5 * (1 - f)                                              # the lip's focus follows the light's
        edge = 1 / (1 + np.exp(dist / soft))
        run = np.exp(-0.5 * ((xs - (cx * w + ox + 0.07 * w * np.sin(2 * np.pi * t))) / (0.035 * w)) ** 2)
        rim = np.exp(-0.5 * (dist / (0.8 + soft)) ** 2) * run
        L = L * (0.30 + 0.70 * edge) + lens(L, 6) * rim * 1.4
    return L

store = [np.zeros((N, h, w), np.float16) for _ in LIGHTS]
peak = np.zeros((len(LIGHTS), N))
for i in range(N):
    for j in range(len(LIGHTS)):
        L = layer(j, i / N)
        store[j][i] = L; peak[j, i] = np.percentile(L[::4, ::4], 99.5)
    if i % 48 == 0: print(f"light {i}/{N}", flush=True)
# each light keeps a steady presence: its brightest 0.5% held near one level, the hold eased over ±0.35 s
sg = max(1.0, 0.35 * 24 * N / 198)
k = np.exp(-0.5 * (np.arange(-int(3 * sg), int(3 * sg) + 1) / sg) ** 2); k /= k.sum()
gain = np.clip(1.0 / np.maximum(peak, 1e-3), 0.2, 12.0)
gain = np.array([np.convolve(np.tile(g, 3), k, "same")[N:2 * N] for g in gain])
# …and the frame as a whole holds its exposure (no breathing): total light eased toward its loop average
lumw = np.array([float(LIGHTS[j][1] @ np.array([0.2126, 0.7152, 0.0722], np.float32)) * LIGHTS[j][2] for j in range(len(LIGHTS))])
tot = np.array([sum(float(store[j][i][::4, ::4].astype(np.float32).mean()) * gain[j, i] * lumw[j] for j in range(len(LIGHTS))) for i in range(N)])
hold = (tot.mean() / np.maximum(tot, 1e-6)) ** E("HOLD", 0.6)
hold = np.convolve(np.tile(hold, 3), k, "same")[N:2 * N]

# pass 2: colour, grade, encode
noise = np.random.default_rng(11)
for i in range(N):
    parts = [store[j][i].astype(np.float32) * (gain[j, i] * LIGHTS[j][2] * hold[i]) for j in range(len(LIGHTS))]
    x = sum(p[..., None] * LIGHTS[j][1] for j, p in enumerate(parts))
    warm_light = sum(p for j, p in enumerate(parts) if LIGHTS[j][1] is C_WARM)   # glints catch on the copper light only
    x = np.clip(x * 0.55 * EXPO, 0, None) ** GAMMA
    x = x / (1 + 0.35 * x)                                                      # soft shoulder: patches, not white-outs
    # a glint: twice a loop the hottest point of the light (a caustic cusp) catches cream-white for ~½ s
    e = max(np.exp(-0.5 * (min(abs(i / N - a), 1 - abs(i / N - a)) / 0.03) ** 2) for a in (0.31,))
    if e > 0.02:
        lb = gauss(warm_light, 4); thr = np.percentile(lb[::3, ::3], 99.4)                # the brightest patch's lit face,
        g = np.clip((lb - thr) / max(float(lb.max()) - thr, 1e-4) * 1.6, 0, 1)     # not a point
        x = x + (np.clip(gauss(g, 4) * 1.5, 0, 1) * e)[..., None] * (np.array([1.0, 0.957, 0.878], np.float32) - x)
    x = x + np.array([9, 13, 16], np.float32) / 255.0 * (1 - np.clip(x, 0, 1)) ** 3
    x = x * 255 + noise.normal(0, 0.6, x.shape).astype(np.float32)
    enc.stdin.write(np.clip(x, 0, 255).astype(np.uint8).tobytes())
enc.stdin.close(); enc.wait()
print("built", out)
