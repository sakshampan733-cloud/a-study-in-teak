"""Hero loop, round 18: planes of light off glass and water, photographed out of focus.

Round 17 (light off water alone, tools/node/hero-water.py) read as "CG light ribbons, smoke" to the craft critic
and "one or two smoke-like streaks" to the brief critic. The reference (design/ref-ciridae/.../hero_web.mp4) is
five to eight overlapping FACETED planes of light — the faces of glass catching a warm and a cool source — that
slide across each other at different depths; the nearer ones keep a soft, readable edge, the far ones dissolve,
and now and then a cream glint runs along an edge. This builds exactly that, and loops exactly:

  · each plane is a tapered quad (a face of glass) lit brighter toward one edge, its light rippled by moving
    water (the caustic from hero-water.py, gently) so it shimmers rather than sits flat;
  · each sways across the frame by its depth (near ones further: parallax) and turns a little, once per loop;
  · each is defocused as a lens does it (flat, hard-edged kernel) by its distance from a focus that drifts;
  · a thin highlight runs along the lit edge of the near planes and, once a loop, peaks cream-white;
  · film grain at full size; graded to design/bar.md rule 8.

  /Applications/Blender.app/Contents/Resources/5.2/python/bin/python3.13 tools/node/hero-facets.py <out.mp4> [seed=3]
"""
import os, subprocess, sys
import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
FF = os.path.join(HERE, "node_modules/ffmpeg-static/ffmpeg")
W, H = 1600, 850
w, h = 800, 425
N = int(os.environ.get("FRAMES", 198))                  # 8.25 s at 24 fps (reference 8.3 s)
out = sys.argv[1]
SEED = int(sys.argv[2]) if len(sys.argv) > 2 else 3
E = lambda k, d: float(os.environ.get(k, d))
SWAY = E("SWAY", 60.0)                                  # px at 800 wide for the nearest plane
EXPO, GAMMA = E("EXPO", 0.75), E("GAMMA", 1.25)


def box(a, r, axis):
    if r < 1: return a
    pad = [(0, 0)] * a.ndim; pad[axis] = (r + 1, r)
    c = np.cumsum(np.pad(a, pad), axis=axis, dtype=np.float32)
    hi = np.take(c, np.arange(2 * r + 1, c.shape[axis]), axis=axis)
    lo = np.take(c, np.arange(0, c.shape[axis] - 2 * r - 1), axis=axis)
    return (hi - lo) / (2 * r + 1)


def lens(a, s):
    """Defocus as a lens does it: a flat, hard-edged kernel, barely rounded off (not a Gaussian's mush)."""
    r = max(1, int(round(s)))
    a = box(box(a, r, 0), r, 1)
    r2 = max(1, r // 3)
    return box(box(a, r2, 0), r2, 1)


YS, XS = np.mgrid[0:h, 0:w].astype(np.float32)


def ripple(rng, n=5):
    """Gentle moving-water shimmer: a smooth field 0.6…1.4 that turns whole times per loop."""
    waves = []
    for _ in range(n):
        lam = rng.uniform(0.5, 1.3) * h; ang = rng.uniform(0, np.pi); k = 2 * np.pi / lam
        waves.append((k * np.cos(ang), k * np.sin(ang), rng.choice([1, -1, 2]), rng.uniform(0, 2 * np.pi)))
    def at(t, ox, oy):
        f = np.zeros((h, w), np.float32)
        for kx, ky, om, ph in waves:
            f += np.cos(kx * (XS - ox) + ky * (YS - oy) + 2 * np.pi * om * t + ph)
        f /= np.sqrt(n / 2)
        return np.clip(1 + E("SHIM", 0.3) * np.tanh(f), 0.2, 2)
    return at


def quad(cx, cy, length, width, ang, taper, bend=0.0):
    """A tapered quad (a face of glass): signed coverage 0…1, and u = 0 at the unlit edge → 1 at the lit edge."""
    ca, sa = np.cos(ang), np.sin(ang)
    lx = (XS - cx) * ca + (YS - cy) * sa                  # along the face
    ly = -(XS - cx) * sa + (YS - cy) * ca                 # across it
    ly = ly - bend * lx ** 2 / max(length, 1)             # glass is curved: the face bows
    half_w = width / 2 * (1 + taper * lx / (length / 2))  # narrower at one end
    inside = np.minimum(length / 2 - np.abs(lx), half_w - np.abs(ly))
    cov = np.clip(inside + 0.5, 0, 1)
    u = np.clip(0.5 + ly / np.maximum(2 * half_w, 1), 0, 1)
    return cov, u, ly - half_w                             # last: distance past the lit edge (0 on it)


C_WARM = np.array([1.00, 0.63, 0.43], np.float32)       # copper-peach
C_COOL = np.array([0.47, 0.56, 0.71], np.float32)       # slate
rng = np.random.default_rng(SEED)
# the planes, laid out as in the reference: a tall copper face left of centre, copper shards below and at the far
# left; slate faces across the upper right, down the right edge, a sliver near the top, faint ones at the corners.
#   centre (x, y), length, width (fractions of height), angle°, taper, colour, level, depth (0 far … 1 near)
PLANES = [((0.29, 0.50), 1.15, 0.24, 92, 0.25, C_WARM, 1.00, 0.85),
          ((0.37, 0.78), 0.30, 0.13, 20, -0.5, C_WARM, 0.85, 1.00),
          ((0.12, 0.78), 0.55, 0.07, 58, 0.4, C_WARM, 0.55, 0.55),
          ((0.70, 0.30), 0.75, 0.34, 28, 0.3, C_COOL, 0.75, 0.15),
          ((0.90, 0.56), 0.65, 0.16, 80, -0.3, C_COOL, 0.60, 0.45),
          ((0.55, 0.17), 0.50, 0.06, -18, 0.2, C_COOL, 0.55, 0.75),
          ((0.10, 0.14), 0.40, 0.22, 10, 0.0, C_COOL, 0.30, 0.05),
          ((0.80, 0.86), 0.45, 0.20, -30, 0.2, C_COOL, 0.30, 0.10)]
PH = rng.uniform(0, 2 * np.pi, (len(PLANES), 3))
BEND = rng.uniform(-1.0, 1.0, len(PLANES)) * E("BEND", 0.9)
RIP = [ripple(rng) for _ in PLANES]
GLINT_AT, GLINT_PLANE = E("GLINT_AT", 0.31), 1        # once a loop, on the near copper shard


def plane(j, t):
    (cx, cy), ln, wd, ang, taper, col, lv, depth = PLANES[j]
    a = 2 * np.pi * t
    ox = SWAY * (0.15 + depth) * np.sin(a + PH[j, 0]); oy = 0.3 * SWAY * (0.15 + depth) * np.sin(a + PH[j, 1])
    th = np.radians(ang) + 0.10 * np.sin(a + PH[j, 2])                      # turning a little: its light travels
    cov, u, past = quad(cx * w + ox, cy * h + oy, ln * h, wd * h, th, taper, BEND[j] * (1 + 0.3 * np.sin(a + PH[j, 1])))
    shade = (0.35 + 0.65 * u ** 1.6) * RIP[j](t, ox, oy)                     # brighter toward the lit edge, shimmering
    # focus drifts from near to far and back: a plane's blur is its distance from it
    focus = 0.55 + 0.4 * np.cos(a)
    blur = E("B0", 5.0) + E("B1", 40.0) * abs(depth - focus) ** 1.2
    light = lens(cov * shade, blur) * lv
    if depth >= 0.75:                                                        # the near faces carry a highlight on
        run = np.exp(-0.5 * ((XS - (cx * w + ox) - 0.35 * ln * h * np.sin(a * 2 + PH[j, 0]) * np.cos(th)) / (0.06 * w)) ** 2)
        rim = np.exp(-0.5 * (past / (1.2 + 0.3 * blur)) ** 2) * cov.max() * run
        light = light + lens(rim, 0.3 * blur + 1) * 0.9 * lv
    return light, blur


enc = subprocess.Popen([FF, "-loglevel", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{w}x{h}", "-r", "24", "-i", "-",
                        "-vf", f"scale={W}:{H}:flags=bicubic,scale=out_color_matrix=bt709:out_range=tv:flags=accurate_rnd+full_chroma_int+full_chroma_inp,format=yuv420p,noise=c0s={int(E('GRAIN', 7))}:c0f=t",
                        "-c:v", "libx264", "-preset", "slow", "-crf", "20", "-maxrate", "850k", "-bufsize", "1700k", "-profile:v", "high",
                        "-pix_fmt", "yuv420p", "-colorspace", "bt709", "-color_primaries", "bt709", "-color_trc", "iec61966-2-1",
                        "-color_range", "tv", "-movflags", "+faststart", out], stdin=subprocess.PIPE)
for i in range(N):
    t = i / N
    x = np.zeros((h, w, 3), np.float32)
    for j in range(len(PLANES)):
        L, _ = plane(j, t)
        x += L[..., None] * PLANES[j][5]
    x = np.clip(x * 0.5 * EXPO, 0, None) ** GAMMA
    x = x / (1 + 0.3 * x)                                                    # soft shoulder: lit glass, not white-out
    # once a loop the near shard's lit edge catches cream-white for ~½ s
    e = np.exp(-0.5 * (min(abs(t - GLINT_AT), 1 - abs(t - GLINT_AT)) / 0.03) ** 2)
    if e > 0.02:
        L, _ = plane(GLINT_PLANE, t)
        thr = np.percentile(L[::3, ::3], 99.6)
        g = np.clip((L - thr) / max(float(L.max()) - thr, 1e-4) * 1.4, 0, 1)
        x = x + (lens(g, 2) * e)[..., None] * (np.array([1.0, 0.957, 0.878], np.float32) - x)
    x = x + np.array([9, 13, 16], np.float32) / 255.0 * (1 - np.clip(x, 0, 1)) ** 3
    enc.stdin.write(np.clip(x * 255, 0, 255).astype(np.uint8).tobytes())
    if i % 48 == 0: print(f"frame {i}/{N}", flush=True)
enc.stdin.close(); enc.wait()
print("built", out)
