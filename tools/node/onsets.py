# Onset times of the entrance's key events, measured from recorded frames — reference vs ours.
import glob, sys
from PIL import Image, ImageStat, ImageFilter
def curve(tag):
    fs = sorted(glob.glob(f"design/ref-ciridae/load-{tag}/frames/*.jpg")); out = []
    for f in fs:
        t = int(f.split("_")[1].replace("ms.jpg", "")); im = Image.open(f).convert("L"); W, H = im.size
        c = im.crop((int(.45 * W), int(.40 * H), int(.55 * W), int(.60 * H)))
        out.append((t, c.getextrema()[1], ImageStat.Stat(c.filter(ImageFilter.FIND_EDGES)).mean[0],
                    im.crop((0, int(.45 * H), int(.2 * W), int(.55 * H))).getextrema()[1],
                    im.crop((int(.35 * W), int(.82 * H), int(.65 * W), int(.95 * H))).getextrema()[1], ImageStat.Stat(im).mean[0]))
    return out
res = {}
for tag in sys.argv[1:] or ("ciridae", "v2"):
    c = [r for r in curve(tag) if r[0] > 150]; first = lambda k, th: next((r[0] for r in c if r[k] > th), None)
    emax = max(r[2] for r in c); sharp = next((r[0] for r in c if r[2] >= 0.9 * emax), None)
    bg0 = sorted(r[5] for r in c)[len(c) // 10]; vid = next((r[0] for r in c if r[5] > bg0 + 6), None)
    res[tag] = dict(mark=first(1, 40), sharp=sharp, left=first(3, 120), centre=first(4, 120), video=vid)
    print(f"{tag:8s} " + " · ".join(f"{k} {v}" for k, v in res[tag].items()))
if len(res) == 2:
    a, b = list(res.values())
    print("delta    " + " · ".join(f"{k} {b[k] - a[k]:+d}" for k in a if a[k] and b[k]))
