# Make an AI clip sit in the Blender film without a jump (owner, 9 Oct: "true to the light, true to the material").
# The AI pass tends to brighten and cool the room; this pulls every frame of the AI clip back onto the Blender render of
# the same shot: per-channel mean and spread matched in Lab space (Reinhard transfer), measured on the shot's first and
# last frames and eased across the clip, so the exposure, warmth and contrast are the film's own.
#
#   tools/.venv/bin/python tools/walk/grade_match.py <ai_frames_dir> <blender_first.png> <blender_last.png> <out_dir> [--keep 0.15] [--skip N]
#
# --keep: how much of the AI's own grade to keep (0 = match Blender exactly).
import os, sys
import numpy as np
from PIL import Image

def to_lab(rgb):
    a = rgb.astype(np.float64) / 255.0
    a = np.where(a > 0.04045, ((a + 0.055) / 1.055) ** 2.4, a / 12.92)
    M = np.array([[0.4124, 0.3576, 0.1805], [0.2126, 0.7152, 0.0722], [0.0193, 0.1192, 0.9505]])
    xyz = a @ M.T / np.array([0.95047, 1.0, 1.08883])
    f = np.where(xyz > 0.008856, np.cbrt(xyz), 7.787 * xyz + 16 / 116)
    return np.stack([116 * f[..., 1] - 16, 500 * (f[..., 0] - f[..., 1]), 200 * (f[..., 1] - f[..., 2])], -1)

def from_lab(lab):
    fy = (lab[..., 0] + 16) / 116; fx = fy + lab[..., 1] / 500; fz = fy - lab[..., 2] / 200
    f = np.stack([fx, fy, fz], -1)
    xyz = np.where(f ** 3 > 0.008856, f ** 3, (f - 16 / 116) / 7.787) * np.array([0.95047, 1.0, 1.08883])
    Mi = np.array([[3.2406, -1.5372, -0.4986], [-0.9689, 1.8758, 0.0415], [0.0557, -0.2040, 1.0570]])
    a = np.clip(xyz @ Mi.T, 0, 1)
    a = np.where(a > 0.0031308, 1.055 * a ** (1 / 2.4) - 0.055, 12.92 * a)
    return (np.clip(a, 0, 1) * 255 + 0.5).astype(np.uint8)

def stats(img, size):
    lab = to_lab(np.asarray(img.convert("RGB").resize(size, Image.BILINEAR)))
    return lab.reshape(-1, 3).mean(0), lab.reshape(-1, 3).std(0) + 1e-6

if __name__ == "__main__":
    a = [x for i, x in enumerate(sys.argv[1:], 1) if not x.startswith("--") and sys.argv[i - 1] not in ("--keep", "--skip")]
    ai_dir, b0, b1, out = a[0], a[1], a[2], a[3]
    keep = float(sys.argv[sys.argv.index("--keep") + 1]) if "--keep" in sys.argv else 0.15
    skip = int(sys.argv[sys.argv.index("--skip") + 1]) if "--skip" in sys.argv else 0     # measure past any fade at either end
    os.makedirs(out, exist_ok=True)
    fs = sorted(f for f in os.listdir(ai_dir) if f.lower().endswith((".png", ".jpg")))
    S = (480, 270)
    tgt0, tgt1 = stats(Image.open(b0), S), stats(Image.open(b1), S)
    src0, src1 = stats(Image.open(os.path.join(ai_dir, fs[skip])), S), stats(Image.open(os.path.join(ai_dir, fs[-1 - skip])), S)
    for i, f in enumerate(fs):
        t = i / max(1, len(fs) - 1)
        sm, ss = src0[0] * (1 - t) + src1[0] * t, src0[1] * (1 - t) + src1[1] * t
        tm, ts = tgt0[0] * (1 - t) + tgt1[0] * t, tgt0[1] * (1 - t) + tgt1[1] * t
        tm, ts = tm * (1 - keep) + sm * keep, ts * (1 - keep) + ss * keep
        im = Image.open(os.path.join(ai_dir, f)).convert("RGB")
        lab = to_lab(np.asarray(im))
        lab = (lab - sm) / ss * ts + tm
        Image.fromarray(from_lab(lab)).save(os.path.join(out, f[:-4] + ".png"))
    print(f"graded {len(fs)} frames: L {src0[0][0]:.1f}->{tgt0[0][0]:.1f}, b(warmth) {src0[0][2]:.1f}->{tgt0[0][2]:.1f}")
