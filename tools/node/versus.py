# Side-by-side filmstrip: the reference's first load against ours, at the same instants.
import sys, glob
from PIL import Image, ImageDraw
def strip(tag, targets, w=288, h=180):
    fs = sorted(glob.glob(f"design/ref-ciridae/load-{tag}/frames/*.jpg"))
    ts = [int(f.split("_")[1].replace("ms.jpg", "")) for f in fs]
    pick = [min(range(len(ts)), key=lambda i: abs(ts[i] - t)) for t in targets]
    ims = []
    for i in pick:
        im = Image.open(fs[i]).resize((w, h)); d = ImageDraw.Draw(im)
        d.rectangle([0, 0, 64, 15], fill=(200, 40, 40)); d.text((3, 2), f"{ts[i]}ms", fill="white"); ims.append(im)
    return ims
targets = [int(x) for x in (sys.argv[3] if len(sys.argv) > 3 else "300,900,1200,1500,1800,2100,2400,2800,3300,3800,4400,5500").split(",")]
a, b = strip(sys.argv[1], targets), strip(sys.argv[2], targets)
cols = 6; rows = (len(targets) + cols - 1) // cols; w, h = 288, 180
S = Image.new("RGB", (cols * w, rows * (2 * h + 24)), "white"); d = ImageDraw.Draw(S)
for k in range(len(targets)):
    x, y = (k % cols) * w, (k // cols) * (2 * h + 24)
    S.paste(a[k], (x, y)); S.paste(b[k], (x, y + h + 2))
    if k % cols == 0: d.text((4, y + 2 * h + 6), f"top: {sys.argv[1]}   bottom: {sys.argv[2]}", fill="black")
S.save(sys.argv[4] if len(sys.argv) > 4 else "/tmp/versus.png")
