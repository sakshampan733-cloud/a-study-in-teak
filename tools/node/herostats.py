# Compare hero loops with the reference's by the numbers the craft critic used, plus a contact sheet.
import sys, glob, os, subprocess
from PIL import Image, ImageStat, ImageDraw
HERE = os.path.dirname(os.path.abspath(__file__))
FF = os.path.join(HERE, "node_modules/ffmpeg-static/ffmpeg")
D = os.path.join(HERE, "../../design/media/drafts")
def frames(mp4, tag):
    out = os.path.join(D, "fr", f"st-{tag}"); os.makedirs(out, exist_ok=True)
    for f in glob.glob(out + "/*.png"): os.remove(f)
    subprocess.run([FF, "-loglevel", "error", "-y", "-i", mp4, "-vf", "fps=1,scale=480:-2", out + "/%02d.png"], check=True)
    return sorted(glob.glob(out + "/*.png"))[:8]
def stats(fs):
    dark, hi, sd, mean, cta = [], [], [], [], []
    for f in fs:
        g = Image.open(f).convert("L"); W, H = g.size; px = list(g.getdata())
        dark.append(sum(p < 20 for p in px) / len(px)); hi.append(sorted(px)[int(len(px) * .998)])
        s = ImageStat.Stat(g); sd.append(s.stddev[0]); mean.append(s.mean[0])
        c = g.crop((int(.36 * W), int(.84 * H), int(.64 * W), int(.96 * H))); cta.append(ImageStat.Stat(c).median[0])
    a = lambda v: sum(v) / len(v)
    return f"dark<20 {a(dark)*100:4.0f}% · highlights {a(hi):5.0f} · contrast sd {a(sd):4.1f} · mean {a(mean):4.1f} · behind CTA {a(cta):4.0f}"
rows = [("reference", frames(os.path.join(D, "../ciridae-hero.mp4"), "ref"))]
for m in sys.argv[1:]:
    rows.append((m, frames(os.path.join(D, m), os.path.basename(m).replace(".mp4", ""))))
for lab, fs in rows: print(f"{lab:14s} {stats(fs)}")
w, h = 300, 169; S = Image.new("RGB", (8 * w, len(rows) * (h + 18)), "white"); d = ImageDraw.Draw(S)
for r, (lab, fs) in enumerate(rows):
    d.text((4, r * (h + 18) + 3), lab, fill="black")
    for k, f in enumerate(fs): S.paste(Image.open(f).resize((w, h)), (k * w, r * (h + 18) + 18))
S.save("/private/tmp/claude-501/-Users-sakshampanchal-my-room-/782e1c89-2542-4142-ba4f-b13682a21e22/scratchpad/herostats.png")
