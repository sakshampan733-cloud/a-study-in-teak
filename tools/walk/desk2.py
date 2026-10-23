# The desk as approved (AST-DR-045/046/047): the drawing's own solids — every layer the 3D sheet draws, with all its
# mouldings (the reeded top edge and cove, the frieze and its drawers, the cockbeaded drawer fronts, the panelled ends
# and back, the hollowed corners, the moulded plinth) and the swan-neck handles on their rosettes — so the film, the
# drawing and the print model are one desk (owner, 23 Oct: "I had so much molding… and you just stripped it off").
# tools/walk/desk_solids.js captures the solids from drawings/desk.js; desk_build.py makes the STL from the same file.
# Exec'd at the end of joinery.py, which has just built the earlier desk: that goes. Desk-local x along its length from
# the left end, y from the FRONT (the drawers, facing the study) to the back, z up — the drawing's own axes.
import bmesh, json, math, os, shutil, subprocess
from mathutils import Vector

for o in list(sc.objects):
    if o.name.startswith(("dk_", "dk2_")): bpy.data.objects.remove(o, do_unlink=True)
L_, D_, H_ = 2286.0, 787.0, 750.0                      # 7 ft 6 in × 2 ft 7 in (owner, 23 Oct: was 3 ft)
DXO, DSO = dx0, dFront                                                 # the top's front-left corner in the room

SOL = os.path.join(HERE, "..", "..", "build", "desk-stl", "desk_solids.json")
os.makedirs(os.path.dirname(SOL), exist_ok=True)
node = shutil.which("node") or "/usr/local/bin/node"
subprocess.run([node, os.path.join(HERE, "desk_solids.js"), SOL], check=True)              # always from the current drawing
data = json.load(open(SOL)); S, DEC = data["solids"], data["decals"]
assert abs(max(p[1] for s in S for p in s["ring"]) - D_) < 1, "the drawing's depth and desk2.py's disagree"

def dk2_solid(name, s, m):
    ring, curv = s["ring"], s.get("curved") or [False] * len(s["ring"])
    pts, cv = [], []
    for p, c in zip(ring, curv):                                       # drop repeated points
        if not pts or math.hypot(p[0] - pts[-1][0], p[1] - pts[-1][1]) > 1e-4: pts.append(p); cv.append(c)
    if len(pts) > 1 and math.hypot(pts[0][0] - pts[-1][0], pts[0][1] - pts[-1][1]) < 1e-4: pts.pop(); cv.pop()
    bm = bmesh.new(); n = len(pts)
    lo = [bm.verts.new(P(DXO + x, DSO + y, s["z0"])) for x, y in pts]; hi = [bm.verts.new(P(DXO + x, DSO + y, s["z1"])) for x, y in pts]
    for i in range(n):
        j = (i + 1) % n; f_ = bm.faces.new((lo[i], lo[j], hi[j], hi[i])); f_.smooth = cv[i] and cv[j]
    fb = bm.faces.new(lo[::-1]); ft = bm.faces.new(hi)
    bmesh.ops.triangulate(bm, faces=[fb, ft], quad_method="BEAUTY", ngon_method="EAR_CLIP")
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces[:])
    me = bpy.data.meshes.new(name); bm.to_mesh(me); bm.free()
    o = bpy.data.objects.new(name, me); J.objects.link(o); setmat(o, m)
    if s["z1"] - s["z0"] > 3:                                          # ease the arrises a hair so the light catches them
        bv = o.modifiers.new("ease", "BEVEL"); bv.width = 0.0008; bv.segments = 2; bv.limit_method = "ANGLE"
    return o

# the top is the widest solid that reaches 750: everything set on the desk (realism.py) keys off it as dk2_top
area = lambda s: abs(sum(a[0] * b[1] - b[0] * a[1] for a, b in zip(s["ring"], s["ring"][1:] + s["ring"][:1]))) / 2
top_i = max((i for i, s in enumerate(S) if abs(s["z1"] - H_) < 0.5), key=lambda i: area(S[i]))
for i, s in enumerate(S): dk2_solid("dk2_top" if i == top_i else f"dk2_s{i:03d}", s, M_DESK)

# the handles (the drawing draws them as lines): a rosette and post at each end and a swan-neck bail between, brass
def dk2_tube(name, pts, r, seg=12):
    bm = bmesh.new(); rings = []
    for k, p in enumerate(pts):
        a = Vector(pts[max(0, k - 1)]); b = Vector(pts[min(len(pts) - 1, k + 1)]); t = (b - a).normalized()
        u = t.cross(Vector((0, 0, 1)))
        if u.length < 1e-3: u = t.cross(Vector((1, 0, 0)))
        u.normalize(); v = t.cross(u).normalized()
        rings.append([bm.verts.new(Vector(P(DXO + p[0], DSO + p[1], p[2])) + (u * math.cos(2 * math.pi * q / seg) + v * math.sin(2 * math.pi * q / seg)) * r / 1000 * Vector((1, -1, 1))) for q in range(seg)])
    for ra, rb in zip(rings, rings[1:]):
        for q in range(seg): f_ = bm.faces.new((ra[q], ra[(q + 1) % seg], rb[(q + 1) % seg], rb[q])); f_.smooth = True
    bm.faces.new(rings[0][::-1]); bm.faces.new(rings[-1]); bmesh.ops.recalc_face_normals(bm, faces=bm.faces[:])
    me = bpy.data.meshes.new(name); bm.to_mesh(me); bm.free(); o = bpy.data.objects.new(name, me); J.objects.link(o); setmat(o, M_BRASS); return o
def dk2_cyl(name, x, y0, y1, z, r, seg=24):
    bm = bmesh.new()
    a = [bm.verts.new(P(DXO + x + r * math.cos(2 * math.pi * q / seg), DSO + y0, z + r * math.sin(2 * math.pi * q / seg))) for q in range(seg)]
    b = [bm.verts.new(P(DXO + x + r * math.cos(2 * math.pi * q / seg), DSO + y1, z + r * math.sin(2 * math.pi * q / seg))) for q in range(seg)]
    for q in range(seg): f_ = bm.faces.new((a[q], a[(q + 1) % seg], b[(q + 1) % seg], b[q])); f_.smooth = True
    bm.faces.new(a[::-1]); bm.faces.new(b); bmesh.ops.recalc_face_normals(bm, faces=bm.faces[:])
    me = bpy.data.meshes.new(name); bm.to_mesh(me); bm.free(); o = bpy.data.objects.new(name, me); J.objects.link(o); setmat(o, M_BRASS); return o
ros = [d for d in DEC if len(d["pts"]) == 14]                         # the rosettes, in pairs either side of each handle
for k, d in enumerate(ros):
    xs = [p[0] for p in d["pts"]]; zs = [p[2] for p in d["pts"]]; cx, cz = sum(xs) / 14, (min(zs) + max(zs)) / 2; yf = d["pts"][0][1]
    dk2_cyl(f"dk2_rosette{k}", cx, yf + 0.5, yf - 3.0, cz, 9.0); dk2_cyl(f"dk2_post{k}", cx, yf, yf - 16.0, cz, 3.2)
for k in range(0, len(ros), 2):
    a, b = ros[k], ros[k + 1]
    ax = sum(p[0] for p in a["pts"]) / 14; bx = sum(p[0] for p in b["pts"]) / 14
    if bx < ax: ax, bx = bx, ax
    zc = (min(p[2] for p in a["pts"]) + max(p[2] for p in a["pts"])) / 2; yf = a["pts"][0][1]
    pts = [(ax, yf - 16.0, zc)] + [(ax + (bx - ax) * t, yf - 16.0, zc - 1.0 - 20.0 * math.pow(math.sin(math.pi * t), 0.75)) for t in [q / 24 for q in range(25)]] + [(bx, yf - 16.0, zc)]
    dk2_tube(f"dk2_bail{k // 2}", pts, 3.2)
print(f"desk (AST-DR-045): the drawing's {len(S)} solids and {len(ros) // 2} swan-neck handles", flush=True)
