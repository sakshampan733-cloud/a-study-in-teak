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
    dark, hi, mean, cta, mark, topb, botb, orient, shad = [], [], [], [], [], [], [], [], []
    for f in fs:
        im = Image.open(f).convert("RGB"); g = im.convert("L"); W, H = g.size; px = list(g.getdata())
        dark.append(sum(p < 20 for p in px) / len(px)); hi.append(sorted(px)[int(len(px) * .998)])
        mean.append(ImageStat.Stat(g).mean[0])
        cta.append(ImageStat.Stat(g.crop((int(.36 * W), int(.84 * H), int(.64 * W), int(.96 * H)))).median[0])
        mark.append(ImageStat.Stat(g.crop((int(.42 * W), int(.36 * H), int(.58 * W), int(.62 * H)))).median[0])
        topb.append(ImageStat.Stat(g.crop((0, 0, W, int(.2 * H)))).mean[0]); botb.append(ImageStat.Stat(g.crop((0, int(.7 * H), W, H))).mean[0])
        # edge orientation: energy of horizontal vs vertical brightness changes (vertical columns → high ratio)
        a = g.load(); gx = gy = 0
        for y in range(1, H - 1, 3):
            for x in range(1, W - 1, 3):
                gx += abs(a[x + 1, y] - a[x - 1, y]); gy += abs(a[x, y + 1] - a[x, y - 1])
        orient.append(gx / max(1, gy))
        sp = [p for p in im.getdata() if sum(p) < 60]; shad.append(tuple(round(sum(c[i] for c in sp) / max(1, len(sp))) for i in range(3)))
    a_ = lambda v: sum(v) / len(v)
    s0 = shad[len(shad) // 2]
    return (f"dark {a_(dark)*100:3.0f}% · hi {a_(hi):3.0f} · mean {a_(mean):4.1f} · top/bottom {a_(topb):4.1f}/{a_(botb):4.1f} · "
            f"behind mark {a_(mark):4.0f} · behind CTA {a_(cta):3.0f} · h/v edges {a_(orient):4.2f} · shadows {s0}")
rows = [("reference", frames(os.path.join(D, "../ciridae-hero.mp4"), "ref"))]
for m in sys.argv[1:]:
    rows.append((m, frames(os.path.join(D, m), os.path.basename(m).replace(".mp4", ""))))
for lab, fs in rows: print(f"{lab:14s} {stats(fs)}")
w, h = 300, 169; S = Image.new("RGB", (8 * w, len(rows) * (h + 18)), "white"); d = ImageDraw.Draw(S)
for r, (lab, fs) in enumerate(rows):
    d.text((4, r * (h + 18) + 3), lab, fill="black")
    for k, f in enumerate(fs): S.paste(Image.open(f).resize((w, h)), (k * w, r * (h + 18) + 18))
S.save("/private/tmp/claude-501/-Users-sakshampanchal-my-room-/782e1c89-2542-4142-ba4f-b13682a21e22/scratchpad/herostats.png")
