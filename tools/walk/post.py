# The camera's own marks, added after the render: a soft lens vignette and sensor grain (heavier in the shadows,
# a little coarser than a pixel, fresh every frame). A render is too clean to read as a photograph without them.
#
#   python3 tools/walk/post.py in.png out.jpg [--grain 0.10] [--vig 0.16]
#   python3 tools/walk/post.py --dir in_dir out_dir [--size 1920x1080]   [--jpg]   (every .png in a folder, for a shot's frames)
import os, sys
from PIL import Image, ImageChops, ImageFilter

def arg(name, default):
    return float(sys.argv[sys.argv.index(name) + 1]) if name in sys.argv else default
GRAIN, VIG = arg("--grain", 0.10), arg("--vig", 0.16)

SIZE = sys.argv[sys.argv.index("--size") + 1] if "--size" in sys.argv else None     # e.g. 1920x1080: scale up first

def post(src, dst):
    im = Image.open(src).convert("RGB")
    if SIZE:
        tw, th = (int(v) for v in SIZE.split("x"))
        if im.size != (tw, th): im = im.resize((tw, th), Image.LANCZOS)
    w, h = im.size
    # vignette: darken toward the corners, following the frame's shape
    rad = Image.radial_gradient("L").resize((w, h), Image.BILINEAR)
    vig = rad.point(lambda v: 255 - int(255 * VIG * (v / 255.0) ** 2.4))
    im = ImageChops.multiply(im, Image.merge("RGB", (vig, vig, vig)))
    # grain: gaussian, about 1.5 px across, monochrome with a touch of colour, stronger where it is dark
    gw, gh = int(w / 1.5), int(h / 1.5)
    def layer():
        n = Image.effect_noise((gw, gh), 64).resize((w, h), Image.BICUBIC)
        return n.point(lambda v: max(0, min(255, int(128 + (v - 128) * GRAIN))))
    g = layer(); gc = [g.point(lambda v: v), layer().point(lambda v: 128 + (v - 128) // 4), layer().point(lambda v: 128 + (v - 128) // 4)]
    grain = Image.merge("RGB", (ImageChops.add(gc[0], gc[1], 1, -128), gc[0], ImageChops.add(gc[0], gc[2], 1, -128)))
    grainy = ImageChops.add(im, grain, 1.0, -128)
    luma = im.convert("L").filter(ImageFilter.GaussianBlur(2))
    mask = luma.point(lambda v: int(255 - v * 0.55))
    out = Image.composite(grainy, im, mask)
    out.save(dst, quality=95) if dst.lower().endswith((".jpg", ".jpeg")) else out.save(dst)

if __name__ == "__main__":
    a = [x for x in sys.argv[1:] if not x.startswith("--") and not (sys.argv[sys.argv.index(x) - 1] in ("--grain", "--vig", "--size"))]
    if "--dir" in sys.argv:
        src, dst = a[0], a[1]; os.makedirs(dst, exist_ok=True)
        ext = ".jpg" if "--jpg" in sys.argv else ".png"                      # --jpg: quality 95, about a tenth the size
        for f in sorted(os.listdir(src)):
            out = os.path.join(dst, f[:-4] + ext)
            if f.endswith(".png") and not (os.path.exists(out) and os.path.getsize(out) > 0): post(os.path.join(src, f), out)   # resumable
    else:
        post(a[0], a[1])
