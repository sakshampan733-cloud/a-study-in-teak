# Make an STL one watertight solid for the slicer: a voxel remesh (no decimation — that breaks manifoldness).
#   blender -b --python tools/walk/stl_solidify.py -- <in.stl> <out.stl> <voxel mm> [--3mf out.3mf]
# Prints the non-manifold edge count, which should be 0. With --3mf it also writes a compressed 3MF (a tenth the size).
import bpy, bmesh, sys, time, io, zipfile
a = sys.argv[sys.argv.index("--") + 1:]
src, out, vox = a[0], a[1], float(a[2])
mf = a[a.index("--3mf") + 1] if "--3mf" in a else None
for o in list(bpy.data.objects): bpy.data.objects.remove(o)
bpy.ops.wm.stl_import(filepath=src); o = bpy.context.selected_objects[0]; bpy.context.view_layer.objects.active = o
t = time.time()
m = o.modifiers.new("v", "REMESH"); m.mode = "VOXEL"; m.voxel_size = vox; m.adaptivity = 0.0; m.use_smooth_shade = False
bpy.ops.object.modifier_apply(modifier="v")
bm = bmesh.new(); bm.from_mesh(o.data)
print("REMESH", round(time.time() - t), "s, tris", len(o.data.polygons), "non-manifold", sum(1 for e in bm.edges if not e.is_manifold)); bm.free()
bpy.ops.wm.stl_export(filepath=out, export_selected_objects=True)
if mf:
    me = o.data; me.calc_loop_triangles(); buf = io.StringIO(); w = buf.write
    w('<?xml version="1.0" encoding="UTF-8"?>\n<model unit="millimeter" xml:lang="en-US" xmlns="http://schemas.microsoft.com/3dmanufacturing/core/2015/02">\n<resources><object id="1" type="model" name="part"><mesh><vertices>\n')
    w("".join('<vertex x="%.4f" y="%.4f" z="%.4f"/>\n' % tuple(v.co) for v in me.vertices)); w('</vertices><triangles>\n')
    w("".join('<triangle v1="%d" v2="%d" v3="%d"/>\n' % tuple(t.vertices) for t in me.loop_triangles))
    w('</triangles></mesh></object></resources>\n<build><item objectid="1"/></build>\n</model>\n')
    with zipfile.ZipFile(mf, "w", zipfile.ZIP_DEFLATED, compresslevel=9) as z:
        z.writestr("[Content_Types].xml", '<?xml version="1.0" encoding="UTF-8"?>\n<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="model" ContentType="application/vnd.ms-package.3dmanufacturing-3dmodel+xml"/></Types>')
        z.writestr("_rels/.rels", '<?xml version="1.0" encoding="UTF-8"?>\n<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Target="/3D/3dmodel.model" Id="rel0" Type="http://schemas.microsoft.com/3dmanufacturing/2013/01/3dmodel"/></Relationships>')
        z.writestr("3D/3dmodel.model", buf.getvalue())
    print("3MF", mf)
