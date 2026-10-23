# Build the detailed desk from the drawing's solids and export an STL.  blender -b --python desk_build.py -- <solids.json> <out.stl> <scale> [union]
import bpy, bmesh, json, math, sys, time
from mathutils import Vector, Matrix
js, out, scale = sys.argv[-4 if sys.argv[-1] == "union" else -3], None, None
args = sys.argv[sys.argv.index("--") + 1:]
js, out, scale = args[0], args[1], float(args[2]); do_union = len(args) > 3 and args[3] == "union"
data = json.load(open(js)); S = data["solids"]; DEC = data["decals"]
for o in list(bpy.data.objects): bpy.data.objects.remove(o)
col = bpy.data.collections.new("parts"); bpy.context.scene.collection.children.link(col)

def prism(name, ring, z0, z1):
    bm = bmesh.new(); pts = []
    for p in ring:                                           # drop repeated points
        if not pts or math.hypot(p[0] - pts[-1][0], p[1] - pts[-1][1]) > 1e-4: pts.append(p)
    if len(pts) > 1 and math.hypot(pts[0][0] - pts[-1][0], pts[0][1] - pts[-1][1]) < 1e-4: pts.pop()
    lo = [bm.verts.new((x, y, z0)) for x, y in pts]; hi = [bm.verts.new((x, y, z1)) for x, y in pts]; n = len(pts)
    for i in range(n): bm.faces.new((lo[i], lo[(i + 1) % n], hi[(i + 1) % n], hi[i]))
    fb = bm.faces.new(lo[::-1]); ft = bm.faces.new(hi)
    bmesh.ops.triangulate(bm, faces=[fb, ft], quad_method="BEAUTY", ngon_method="EAR_CLIP")
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces[:])
    me = bpy.data.meshes.new(name); bm.to_mesh(me); bm.free()
    o = bpy.data.objects.new(name, me); col.objects.link(o); return o

# desk-model coords: x along, y from the FRONT (drawers) to the back, z up (mm). The drawing's y→ here y as given.
for i, s in enumerate(S): prism(f"s{i:03d}", s["ring"], s["z0"], s["z1"])

# the handles (the drawing draws them as lines): a rosette + post at each end and a swan-neck bail between — brass, solid
def tube(name, pts, r, seg=10):
    bm = bmesh.new(); rings = []
    for k, p in enumerate(pts):
        a = Vector(pts[max(0, k - 1)]); b = Vector(pts[min(len(pts) - 1, k + 1)]); t = (b - a).normalized()
        u = t.cross(Vector((0, 0, 1)))
        if u.length < 1e-3: u = t.cross(Vector((1, 0, 0)))
        u.normalize(); v = t.cross(u).normalized()
        rings.append([bm.verts.new(Vector(p) + (u * math.cos(2 * math.pi * q / seg) + v * math.sin(2 * math.pi * q / seg)) * r) for q in range(seg)])
    for ra, rb in zip(rings, rings[1:]):
        for q in range(seg): bm.faces.new((ra[q], ra[(q + 1) % seg], rb[(q + 1) % seg], rb[q]))
    f0 = bm.faces.new(rings[0][::-1]); f1 = bm.faces.new(rings[-1])
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces[:])
    me = bpy.data.meshes.new(name); bm.to_mesh(me); bm.free(); o = bpy.data.objects.new(name, me); col.objects.link(o); return o
def cyl(name, x, y0, y1, z, r, seg=20):
    bm = bmesh.new(); a = [bm.verts.new((x + r * math.cos(2 * math.pi * q / seg), y0, z + r * math.sin(2 * math.pi * q / seg))) for q in range(seg)]
    b = [bm.verts.new((x + r * math.cos(2 * math.pi * q / seg), y1, z + r * math.sin(2 * math.pi * q / seg))) for q in range(seg)]
    for q in range(seg): bm.faces.new((a[q], a[(q + 1) % seg], b[(q + 1) % seg], b[q]))
    bm.faces.new(a[::-1]); bm.faces.new(b); bmesh.ops.recalc_face_normals(bm, faces=bm.faces[:])
    me = bpy.data.meshes.new(name); bm.to_mesh(me); bm.free(); o = bpy.data.objects.new(name, me); col.objects.link(o); return o
nh = 0
ros = [d for d in DEC if len(d["pts"]) == 14]                # the r9 rosettes, in pairs (hx - 45, hx + 45)
for d in ros:
    xs = [p[0] for p in d["pts"]]; zs = [p[2] for p in d["pts"]]; cx, cz = sum(xs) / 14, (min(zs) + max(zs)) / 2; yf = d["pts"][0][1]
    cyl(f"rosette{nh}", cx, yf + 0.5, yf - 3.0, cz, 9.0); cyl(f"post{nh}", cx, yf, yf - 16.0, cz, 3.2); nh += 1
for k in range(0, len(ros), 2):                              # a bail from each pair
    a, b = ros[k], ros[k + 1]
    ax = sum(p[0] for p in a["pts"]) / 14; bx = sum(p[0] for p in b["pts"]) / 14
    if bx < ax: ax, bx = bx, ax
    zc = (min(p[2] for p in a["pts"]) + max(p[2] for p in a["pts"])) / 2; yf = a["pts"][0][1]
    pts = [(ax, yf - 16.0, zc)] + [(ax + (bx - ax) * t, yf - 16.0, zc - 1.0 - 20.0 * math.pow(math.sin(math.pi * t), 0.75)) for t in [q / 24 for q in range(25)]] + [(bx, yf - 16.0, zc)]
    tube(f"bail{k // 2}", pts, 3.2)
print("PARTS", len(col.objects), "handles", nh // 2)

objs = list(col.objects)
if do_union:
    t0 = time.time()
    # the stack of layers is one solid: union them all with the exact solver, in chunks to keep it quick
    base = objs[0]
    mod = base.modifiers.new("u", "BOOLEAN"); mod.operation = "UNION"; mod.solver = "EXACT"; mod.operand_type = "COLLECTION"
    oc = bpy.data.collections.new("operands"); bpy.context.scene.collection.children.link(oc)
    for o in objs[1:]: col.objects.unlink(o); oc.objects.link(o)
    mod.collection = oc; mod.use_self = True; mod.use_hole_tolerant = True
    bpy.context.view_layer.update()
    dg = bpy.context.evaluated_depsgraph_get(); me = bpy.data.meshes.new_from_object(base.evaluated_get(dg))
    print("UNION in", round(time.time() - t0, 1), "s: tris", len(me.polygons))
    final = bpy.data.objects.new("desk", me); bpy.context.scene.collection.objects.link(final)
    for o in list(bpy.data.objects):
        if o is not final: bpy.data.objects.remove(o)
else:
    bm = bmesh.new()
    for o in objs: bm.from_mesh(o.data, face_normals=False) if False else None
    me = bpy.data.meshes.new("desk")
    for o in objs:
        pass
    bpy.ops.object.select_all(action="DESELECT")
    for o in objs: o.select_set(True)
    bpy.context.view_layer.objects.active = objs[0]; bpy.ops.object.join(); final = bpy.context.active_object; final.name = "desk"
# stand it on z=0, long side along x, centred, then export (y is front→back; STL up is +Z)
bm = bmesh.new(); bm.from_mesh(final.data)
xs = [v.co.x for v in bm.verts]; ys = [v.co.y for v in bm.verts]; zs = [v.co.z for v in bm.verts]
cx, cy, z0 = (min(xs) + max(xs)) / 2, (min(ys) + max(ys)) / 2, min(zs)
bmesh.ops.translate(bm, verts=bm.verts[:], vec=(-cx, -cy, -z0)); bmesh.ops.reverse_faces(bm, faces=bm.faces[:]) if False else None
nm = sum(1 for e in bm.edges if not e.is_manifold)
bm.to_mesh(final.data); bm.free()
bpy.ops.object.select_all(action="DESELECT"); final.select_set(True); bpy.context.view_layer.objects.active = final
bpy.ops.wm.stl_export(filepath=out, export_selected_objects=True, global_scale=1.0 / scale, ascii_format=False, apply_modifiers=True)
print("WROTE", out, "tris", sum(len(p.vertices) - 2 for p in final.data.polygons), "non-manifold edges", nm, "size mm", [round(v / scale, 1) for v in (max(xs) - min(xs), max(ys) - min(ys), max(zs) - min(zs))])