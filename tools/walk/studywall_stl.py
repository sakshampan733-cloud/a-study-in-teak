# The study wall as a printable model (owner, 9 Oct; Bambu P1S): AST-DR-040's wall at 1:20, lying on its back, face up.
# A thin flat back (24 mm real = 1.2 mm printed) so it prints fast and light; the window is open — its frame and bars
# sit on the back plane and the slab has the arch's opening cut through it; lamps, lenses, trims and the strip lights
# are left off. Then run stl_solidify.py on the result so the slicer sees one watertight solid.
#
#   blender -b build/wallonly/real.blend --python tools/walk/studywall_stl.py -- <out.stl> [scale=20]
import bpy, bmesh, math, sys
from mathutils import Vector, Matrix

out, scale = sys.argv[-2], float(sys.argv[-1])
dg = bpy.context.evaluated_depsgraph_get()
WIN_PARTS = ("wf", "st_gbv", "st_gbh")
def ok(o):
    if o.type not in ("MESH", "CURVE") or o.hide_render: return False
    n = o.name
    win = n.startswith("wf") and n[2:3].isdigit()                       # the window's frame (no glass: it prints open)
    if not (win or n.startswith(("st_", "st2_"))) or any(k in n for k in ("shelfled", "lens", "trim", "sconce", "archpanel")): return False
    cs = [o.matrix_world @ Vector(c) for c in o.bound_box]
    return all(-80 <= c.x * 1000 <= 4650 for c in cs) and all(-160 <= -c.y * 1000 <= 600 for c in cs)
src = [o for o in bpy.data.objects if ok(o)]
bm = bmesh.new()
def add(o, b, shift=None):
    me = bpy.data.meshes.new_from_object(o.evaluated_get(dg)); me.transform(o.matrix_world)
    if shift: me.transform(Matrix.Translation(shift))
    b.from_mesh(me); bpy.data.meshes.remove(me)
for o in src:
    # the window brought forward so its back is the slab's back: the bars lie on the plate
    add(o, bm, Vector((0, -0.113, 0)) if o.name.startswith(WIN_PARTS) else None)
def box(b, x0, y0, z0, x1, y1, z1):
    t = bmesh.new(); bmesh.ops.create_cube(t, size=1.0)
    for v in t.verts: v.co = Vector((x0 + (v.co.x + .5) * (x1 - x0), y0 + (v.co.y + .5) * (y1 - y0), z0 + (v.co.z + .5) * (z1 - z0)))
    me = bpy.data.meshes.new("b"); t.to_mesh(me); t.free(); b.from_mesh(me); bpy.data.meshes.remove(me)
box(bm, 4.529, -0.280, 2.030, 4.547, 0.0, 2.462)              # the side wall closing the window bay's right end, up to the crown
# everything cut 24 mm behind the wall plane; only the cut is capped (never the niches' open mouths)
bmesh.ops.bisect_plane(bm, geom=bm.verts[:] + bm.edges[:] + bm.faces[:], plane_co=(0, 0.024, 0), plane_no=(0, 1, 0), clear_outer=True)
bmesh.ops.holes_fill(bm, edges=[e for e in bm.edges if e.is_boundary and all(abs(v.co.y - 0.024) < 1e-5 for v in e.verts)])
vx = [v.co.x for v in bm.verts]; XL, XR = min(vx), max(vx)
# the 24 mm slab, with the window's opening cut through it: the arch's shape from the sill to the curve
WX0, WX1, SPR, RISE, SILL = 3.328, 4.547, 2.037, 0.300, 0.737
hw = (WX1 - WX0) / 2; R = (hw * hw + RISE * RISE) / (2 * RISE); cx = (WX0 + WX1) / 2; cz = SPR + RISE - R; th = math.asin(hw / R)
outline = [(WX0, SILL)] + [(cx + R * math.sin(-th + 2 * th * i / 48), cz + R * math.cos(-th + 2 * th * i / 48)) for i in range(49)] + [(WX1, SILL)]
def prism(pts, y0, y1, name):
    t = bmesh.new(); f = t.faces.new([t.verts.new((x, y0, z)) for x, z in pts])
    ext = bmesh.ops.extrude_face_region(t, geom=[f]); bmesh.ops.translate(t, verts=[v for v in ext["geom"] if isinstance(v, bmesh.types.BMVert)], vec=(0, y1 - y0, 0))
    bmesh.ops.recalc_face_normals(t, faces=t.faces[:]); me = bpy.data.meshes.new(name); t.to_mesh(me); t.free()
    o = bpy.data.objects.new(name, me); bpy.context.scene.collection.objects.link(o); return o
slab = prism([(XL, 0), (XR, 0), (XR, 2.769), (XL, 2.769)], -0.001, 0.025, "slab")
hole = prism(outline, -0.05, 0.05, "hole")
m = slab.modifiers.new("b", "BOOLEAN"); m.operation = "DIFFERENCE"; m.object = hole; m.solver = "EXACT"
dg = bpy.context.evaluated_depsgraph_get(); add(slab, bm)
bmesh.ops.triangulate(bm, faces=bm.faces[:])
xs = [v.co for v in bm.verts]; lo = Vector([min(c[i] for c in xs) for i in range(3)]); hi = Vector([max(c[i] for c in xs) for i in range(3)])
bmesh.ops.translate(bm, verts=bm.verts[:], vec=(-(lo.x + hi.x) / 2, -hi.y, -lo.z))
bmesh.ops.rotate(bm, verts=bm.verts[:], cent=(0, 0, 0), matrix=Matrix.Rotation(-math.pi / 2, 3, "X"))   # lying on its back, face up
bmesh.ops.translate(bm, verts=bm.verts[:], vec=(0, 0, -min(v.co.z for v in bm.verts)))
me = bpy.data.meshes.new("wall"); bm.to_mesh(me); bm.free()
o = bpy.data.objects.new("wall", me); bpy.context.scene.collection.objects.link(o)
for x in bpy.context.scene.objects: x.select_set(x == o)
bpy.context.view_layer.objects.active = o
bpy.ops.wm.stl_export(filepath=out, export_selected_objects=True, global_scale=1000.0 / scale)
sz = hi - lo
print("PIECES", len(src), "TRIS", len(me.polygons), "REAL mm", [round(v * 1000) for v in sz], "PRINT mm", [round(v * 1000 / scale, 1) for v in sz])
