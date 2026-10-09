# Dollhouse kit → P1S plates (owner, 9 Oct): every part turned to how it should print, then packed onto 256 × 256 plates,
# one 3MF per plate, so each file opens as one ready plate in Bambu Studio.
#   blender -b --python tools/walk/dollhouse_plates.py -- <parts_dir> <out_dir>
# A wall whose back is one flat face lies on it, detail up (stable, no tall thin print); a wall with built-ins on both
# faces stands on its tongue; furniture stands as it sits; the floor plate has a plate to itself.
import sys, os, re, json, zipfile, io
import numpy as np
SRC, OUT = sys.argv[-2], sys.argv[-1]; os.makedirs(OUT, exist_ok=True)
BED, EDGE, GAP = 256.0, 6.0, 5.0
def load(p):
    t = zipfile.ZipFile(p).read("3D/3dmodel.model").decode()
    v = np.array(re.findall(r'<vertex x="([-\d.]+)" y="([-\d.]+)" z="([-\d.]+)"', t), dtype=np.float64)
    f = np.array(re.findall(r'<triangle v1="(\d+)" v2="(\d+)" v3="(\d+)"', t), dtype=np.int64)
    return v, f
def flat_face(v, f, ax, side):
    """Share of the part's side (other-horizontal × height) covered by triangles lying flat on its extreme along ax."""
    e = v[:, ax].min() if side < 0 else v[:, ax].max()
    tri = v[f]; on = np.all(np.abs(tri[:, :, ax] - e) < 0.3, axis=1)
    a = np.linalg.norm(np.cross(tri[on, 1] - tri[on, 0], tri[on, 2] - tri[on, 0]), axis=1).sum() / 2
    o = 1 - ax; rect = (v[:, o].max() - v[:, o].min()) * (v[:, 2].max() - v[:, 2].min())
    return a / rect
parts = {}
for fn in sorted(os.listdir(SRC)):
    if not fn.endswith(".3mf"): continue
    n = fn[:-4]; v, f = load(os.path.join(SRC, fn)); how = "as built"
    if n.startswith("wall-"):
        ax = 0 if np.ptp(v[:, 0]) < np.ptp(v[:, 1]) else 1                     # the thin horizontal axis
        best = max((flat_face(v, f, ax, s), s) for s in (-1, 1))
        if best[0] > 0.6:                                                       # lay it on that flat back, detail up
            s = best[1]; c = v.copy()
            # rotate so the face at side s along ax becomes z = 0: new z = -s * coord, the old z goes into ax
            c[:, 2] = -s * v[:, ax]; c[:, ax] = s * v[:, 2]; v = c        # a proper rotation (det +1): the winding holds
            how = "lying on its back"
        else: how = "standing on its tongue"
    v = v - v.min(axis=0)
    parts[n] = dict(v=v, f=f, w=float(v[:, 0].max()), d=float(v[:, 1].max()), h=float(v[:, 2].max()), how=how)
    print("PART", n, how, [round(parts[n][k], 1) for k in "wdh"], flush=True)
# pack by kind (owner, 9 Oct: "five, six plates"), so each plate prints with one setting and a failed print costs one plate
GROUPS = [("floor", ["floor"]),
          ("study-and-bed-walls", ["wall-study", "wall-bed", "wall-bath-window"]),
          ("flat-walls", ["wall-bath-east", "wall-dressing-east", "wall-dressing-back", "wall-tunnel"]),
          ("standing-walls", ["wall-bedroom-right", "wall-bath-dressing", "wall-left"]),
          ("tall-pieces", ["shower-glass", "partition-and-tv", "wc-and-chase", "pier", "hidden-door"]),
          ("furniture", ["bed", "desk", "bathtub", "chair", "side-table-1", "side-table-2"])]
left = set(parts) - {n for _, g in GROUPS for n in g}
if left: GROUPS[-1][1].extend(sorted(left))
def pack(names):
    """Shelf-pack onto as many 256 plates as it takes, biggest first."""
    out, shelves, items = [], [], []
    for n in sorted([n for n in names if n in parts], key=lambda n: -parts[n]["d"]):
        p = parts[n]; ok = False
        for i, (y, hgt, x) in enumerate(shelves):
            if p["d"] <= hgt and x + p["w"] <= BED - EDGE:
                items.append((n, x, y)); shelves[i] = (y, hgt, x + p["w"] + GAP); ok = True; break
        if not ok:
            ytop = shelves[-1][0] + shelves[-1][1] + GAP if shelves else EDGE
            if ytop + p["d"] > BED - EDGE: out.append(items); shelves, items, ytop = [], [], EDGE
            shelves.append((ytop, p["d"], EDGE + p["w"] + GAP)); items.append((n, EDGE, ytop))
    out.append(items); return out
plates = []
for gname, g in GROUPS:
    pl = pack(g); plates += [(gname + (f"-{j + 1}" if len(pl) > 1 else ""), items) for j, items in enumerate(pl)]
def write(path, items):
    buf = io.StringIO(); w = buf.write
    w('<?xml version="1.0" encoding="UTF-8"?>\n<model unit="millimeter" xml:lang="en-US" xmlns="http://schemas.microsoft.com/3dmanufacturing/core/2015/02">\n<resources>\n')
    for i, (n, x, y) in enumerate(items, 1):
        p = parts[n]; w(f'<object id="{i}" type="model" name="{n}"><mesh><vertices>\n')
        w("".join('<vertex x="%.4f" y="%.4f" z="%.4f"/>\n' % (a + x, b + y, c) for a, b, c in p["v"]))
        w('</vertices><triangles>\n'); w("".join('<triangle v1="%d" v2="%d" v3="%d"/>\n' % tuple(t) for t in p["f"]))
        w('</triangles></mesh></object>\n')
    w('</resources>\n<build>' + "".join(f'<item objectid="{i}"/>' for i in range(1, len(items) + 1)) + '</build>\n</model>\n')
    with zipfile.ZipFile(path, "w", zipfile.ZIP_DEFLATED, compresslevel=6) as z:
        z.writestr("[Content_Types].xml", '<?xml version="1.0" encoding="UTF-8"?>\n<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="model" ContentType="application/vnd.ms-package.3dmanufacturing-3dmodel+xml"/></Types>')
        z.writestr("_rels/.rels", '<?xml version="1.0" encoding="UTF-8"?>\n<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Target="/3D/3dmodel.model" Id="rel0" Type="http://schemas.microsoft.com/3dmanufacturing/2013/01/3dmodel"/></Relationships>')
        z.writestr("3D/3dmodel.model", buf.getvalue())
layout = []
for k, (gname, items) in enumerate(plates, 1):
    # centre the plate's load on the bed
    xs = [x + parts[n]["w"] for n, x, _ in items]; ys = [y + parts[n]["d"] for n, _, y in items]
    dx, dy = (BED - max(xs) - EDGE) / 2, (BED - max(ys) - EDGE) / 2; items = [(n, x + dx, y + dy) for n, x, y in items]
    name = f"plate-{k}-{gname}"
    write(os.path.join(OUT, name + ".3mf"), items)
    layout.append({"plate": name, "parts": [{"part": n, "x": round(x, 1), "y": round(y, 1), "w": round(parts[n]["w"], 1), "d": round(parts[n]["d"], 1), "h": round(parts[n]["h"], 1), "print": parts[n]["how"]} for n, x, y in items]})
    print("PLATE", name, [n for n, _, _ in items], "tallest", round(max(parts[n]["h"] for n, _, _ in items), 1), flush=True)
json.dump(layout, open(os.path.join(OUT, "plates.json"), "w"), indent=1)
