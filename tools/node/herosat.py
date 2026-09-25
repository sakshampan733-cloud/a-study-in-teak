# Per-second saturation of the lit areas and count of lit forms, as the round-12 craft critic measured:
# mean HSV saturation (0–1) of pixels brighter than 60, and connected lit regions (> 45) of at least 0.3 % of the
# frame, with the largest one's share. Reads the frames herostats.py extracted (design/media/drafts/fr/st-<tag>).
#   tools/.venv/bin/python tools/node/herosat.py <tag> [tag…]
import glob, os, sys
from PIL import Image
D = os.path.join(os.path.dirname(os.path.abspath(__file__)), "../../design/media/drafts/fr")
for tag in sys.argv[1:] or ["ref"]:
    sats, forms = [], []
    for f in sorted(glob.glob(f"{D}/st-{tag}/*.png"))[:12]:
        im = Image.open(f).convert("RGB").resize((160, 90))
        hsv = list(im.convert("HSV").getdata()); L = list(im.convert("L").getdata())
        lit = [s / 255 for (h, s, v), l in zip(hsv, L) if l > 60]
        sats.append(round(sum(lit) / len(lit), 2) if lit else 0)
        W, H = im.size; on = [l > 45 for l in L]; seen = [False] * len(on); sizes = []
        for i in range(len(on)):
            if on[i] and not seen[i]:
                st, n = [i], 0; seen[i] = True
                while st:
                    j = st.pop(); n += 1; x = j % W
                    for k in ((j - 1) if x > 0 else -1, (j + 1) if x < W - 1 else -1, j - W, j + W):
                        if 0 <= k < len(on) and on[k] and not seen[k]: seen[k] = True; st.append(k)
                sizes.append(n)
        big = [s for s in sizes if s >= 0.003 * W * H]
        forms.append((len(big), round(100 * max(sizes or [0]) / (W * H), 1)))
    print(f"{tag:10s} lit sat {sats}\n{'':10s} forms (n, largest %) {forms}")
