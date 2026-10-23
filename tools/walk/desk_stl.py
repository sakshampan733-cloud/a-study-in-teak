# The desk as a printable model (AST-DR-045, 1:10 on the Bambu P1S): every dk2_ piece from a built scene, upright on its
# plinth, centred, as one STL. Then run stl_solidify.py on it so the slicer sees one watertight solid.
#
#   blender -b build/showcase/real.blend --python tools/walk/desk_stl.py -- <out.stl> [scale=10]
import bpy, bmesh, sys
from mathutils import Vector

a = sys.argv[sys.argv.index("--") + 1:]
out, scale = a[0], float(a[1]) if len(a) > 1 else 10.0
dg = bpy.context.evaluated_depsgraph_get()
src = [o for o in bpy.data.objects if o.name.startswith("dk2_") and o.type == "MESH" and o.name != "dk2_clampcut"]
bm = bmesh.new()
for o in src:
    me = bpy.data.meshes.new_from_object(o.evaluated_get(dg)); me.transform(o.matrix_world); bm.from_mesh(me); bpy.data.meshes.remove(me)
bmesh.ops.triangulate(bm, faces=bm.faces[:])
xs = [v.co for v in bm.verts]; lo = Vector([min(c[i] for c in xs) for i in range(3)]); hi = Vector([max(c[i] for c in xs) for i in range(3)])
bmesh.ops.translate(bm, verts=bm.verts[:], vec=(-(lo.x + hi.x) / 2, -(lo.y + hi.y) / 2, -lo.z))
me = bpy.data.meshes.new("desk"); bm.to_mesh(me); bm.free()
o = bpy.data.objects.new("desk", me); bpy.context.scene.collection.objects.link(o)
for x in bpy.context.scene.objects: x.select_set(x == o)
bpy.context.view_layer.objects.active = o
bpy.ops.wm.stl_export(filepath=out, export_selected_objects=True, global_scale=1000.0 / scale)
sz = hi - lo
print("PIECES", len(src), "TRIS", len(me.polygons), "REAL mm", [round(v * 1000) for v in sz], "PRINT mm", [round(v * 1000 / scale, 1) for v in sz])
