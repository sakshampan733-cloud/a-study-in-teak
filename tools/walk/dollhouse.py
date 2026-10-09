# The dollhouse kit (owner, 9 Oct): the whole suite at 1:40 as a printable kit for a Bambu P1S — one floor plate with a
# groove under every wall, wall panels that lift out (each with its built-ins on it, a tongue along its foot that drops
# into the floor's groove), and the free-standing furniture as separate pieces. Open-topped, like a dollhouse.
#
#   blender -b build/dollhouse/real.blend --factory-startup --python tools/walk/dollhouse.py -- <out_dir> [scale=40]
#
# Every part is fused into one watertight solid (voxel remesh at 0.15 mm printed) so the slicer sees no open edges.
import bpy, bmesh, sys, os, math, json, io, zipfile
from mathutils import Vector, Matrix

args = sys.argv[sys.argv.index("--") + 1:]
OUT = args[0]; SCALE = float(args[1]) if len(args) > 1 else 40.0
os.makedirs(OUT, exist_ok=True)
VOX = 0.15 * SCALE / 1000          # voxel in model metres = 0.15 mm printed
CLR = 0.25 * SCALE / 1000          # tongue clearance, 0.25 mm printed
TONGUE = 1.5 * SCALE / 1000        # tongue / groove depth, 1.5 mm printed
SLAB = 3.0 * SCALE / 1000          # floor slab, 3 mm printed
MINT = 1.0 * SCALE / 1000          # nothing printed thinner than 1 mm: glass and cloth are thickened to this
dg = bpy.context.evaluated_depsgraph_get()

# ── the wall panels: plan boxes (x0, s0, x1, s1) in mm, cutting the one 'walls' mesh; each also takes the built-ins nearest it
PANELS = {
    "wall-study":        (-280, -230, 4547, 0),
    "wall-left":         (-410, 0, 60, 5996),
    "wall-bed":          (-177, 5766, 4547, 5996),
    "wall-bedroom-right":(4547, -230, 4777, 5996),
    "wall-bath-window":  (4777, -230, 8766, 0),
    "wall-bath-east":    (8511, 0, 8766, 2947),
    "wall-bath-dressing":(4777, 2718, 8511, 2947),
    "wall-dressing-east":(8536, 2947, 8766, 5996),
    "wall-dressing-back":(4777, 5766, 7622, 5996),
    "wall-tunnel":       (7392, 5996, 8766, 8563),
}
FURN = {   # free-standing pieces: name prefixes
    "desk": ("dk2_", "blotter", "lamp_", "monitor_"),
    "chair": ("deskchair",),
    "bed": ("bed_base", "bed_frame", "mattress", "duvet", "sheet_fold", "throw", "pillow", "cushion", "headboard"),
    "side-table-1": ("st0_",), "side-table-2": ("st1_",),
    "partition-and-tv": ("gb_",),
    "bathtub": ("bath_tub", "bath_filler"),
    "wc-and-chase": ("bath_chase", "chase", "bath_wc", "bath_flush", "bath_niche"),
    "pier": ("pier", "bath_pier"),
    "shower-glass": ("bath_glass", "bath_hinge"),
    "hidden-door": ("hd_",),
}
FLOOR_FUSED = ("hide", "bd_", "bath_drain", "van_drain")
EXCLUDE = ("ceiling", "cor_", "floor", "walls", "curtain_fringe", "curtain_sheer", "glass_win", "bath_drop", "bath_rain", "bath_waterfall",
           "vault", "vfr", "vrib", "v_spring", "bath_cove", "bath_floor", "monitor_glass", "mirror_cg", "bath_win_glass", "van_mirror_c_glass", "van_mirror_w")
GLASSY = ("bath_glass",)                       # thin sheets thickened to MINT
CLOTH = ("curtain_velvet",)

def bbox(o):
    cs = [o.matrix_world @ Vector(c) for c in o.bound_box]
    return (min(c.x for c in cs) * 1000, max(c.x for c in cs) * 1000, min(-c.y for c in cs) * 1000, max(-c.y for c in cs) * 1000,
            min(c.z for c in cs) * 1000, max(c.z for c in cs) * 1000)
def centre_dist(b, box):
    cx, cs = (b[0] + b[1]) / 2, (b[2] + b[3]) / 2; X0, S0, X1, S1 = box
    return math.hypot(max(X0 - cx, 0, cx - X1), max(S0 - cs, 0, cs - S1))
def plan_dist(b, box):
    """How far an object's middle is from a panel, across the wall. A thin, flat object (a skirting, a painting, a moulding
    strip) can only belong to a wall it lies flat against; a chunky one goes to the wall nearest its middle."""
    cx, cs = (b[0] + b[1]) / 2, (b[2] + b[3]) / 2; X0, S0, X1, S1 = box; dx_, ds_ = b[1] - b[0], b[3] - b[2]
    along_x = (X1 - X0) >= (S1 - S0)
    if dx_ > 3 * max(ds_, 1) and not along_x: return 1e9          # flat against an x-running wall only
    if ds_ > 3 * max(dx_, 1) and along_x: return 1e9              # flat against an s-running wall only
    if along_x and not (X0 - 300 <= cx <= X1 + 300): return 1e9
    if not along_x and not (S0 - 300 <= cs <= S1 + 300): return 1e9
    return max(S0 - cs, 0, cs - S1) if along_x else max(X0 - cx, 0, cx - X1)

groups = {k: [] for k in list(PANELS) + list(FURN) + ["floor"]}
skipped = 0; pending = []
for o in bpy.data.objects:
    if o.type not in ("MESH", "CURVE") or o.hide_render: continue
    n = o.name
    if n.startswith(EXCLUDE): skipped += 1; continue
    b = bbox(o)
    if b[4] >= 2745: skipped += 1; continue                                       # ceiling-mounted: no ceiling on a dollhouse
    if b[0] < -450 or b[1] > 8800 or b[2] < -260 or b[3] > 8600: skipped += 1; continue   # outside the suite
    f = next((k for k, pre in FURN.items() if n.startswith(pre)), None)
    if f is None and n.startswith("book") and 1150 < (b[0] + b[1]) / 2 < 3550 and 1300 < (b[2] + b[3]) / 2 < 2400 and b[4] > 700: f = "desk"
    if f: groups[f].append(o); continue
    pending.append((o, b))
# unnamed pieces (cylinders, spheres, tori) that sit inside a piece of furniture go with it
fbox = {}
for k in FURN:
    bs = [bbox(o) for o in groups[k]]
    if bs: fbox[k] = (min(x[0] for x in bs) - 40, max(x[1] for x in bs) + 40, min(x[2] for x in bs) - 40, max(x[3] for x in bs) + 40, min(x[4] for x in bs) - 40, max(x[5] for x in bs) + 40)
for o, b in pending:
    n = o.name; cx, cs, cz = (b[0] + b[1]) / 2, (b[2] + b[3]) / 2, (b[4] + b[5]) / 2
    f = next((k for k, B in fbox.items() if B[0] <= cx <= B[1] and B[2] <= cs <= B[3] and B[4] <= cz <= B[5]), None)
    if n.startswith(FLOOR_FUSED): groups["floor"].append(o); continue
    if n.startswith(("bk", "vase", "Cone")) and (b[2] + b[3]) / 2 < 600: groups["wall-study"].append(o); continue   # the bookcase's books stay in it
    if f and n.startswith(("Cylinder", "Sphere", "Torus", "Cone", "Cube", "Circle")): groups[f].append(o); continue
    best = min(PANELS, key=lambda k: plan_dist(b, PANELS[k]))
    if plan_dist(b, PANELS[best]) < 1000: groups[best].append(o); continue
    best = min(PANELS, key=lambda k: centre_dist(b, PANELS[k]))           # not flat against any wall: the wall nearest its middle
    if centre_dist(b, PANELS[best]) < 1000: groups[best].append(o)
    else: groups["floor"].append(o)
print("ASSIGN", {k: len(v) for k, v in groups.items()}, "skipped", skipped, flush=True)
for o in groups["floor"]:
    b = bbox(o)
    if b[5] > 30: print("FLOOR-TALL", o.name, [round(v) for v in b], flush=True)

def mesh_of(objs):
    global dg
    for o in objs:                                                                # cloth: its own solidify, made printable
        if o.name.startswith(CLOTH):
            for m in o.modifiers:
                if m.type == "SOLIDIFY": m.thickness = MINT
    bpy.context.view_layer.update(); dg = bpy.context.evaluated_depsgraph_get()
    bm = bmesh.new()
    for o in objs:
        me = bpy.data.meshes.new_from_object(o.evaluated_get(dg)); me.transform(o.matrix_world)
        if o.name.startswith(GLASSY + CLOTH):                                     # thicken a sheet about its own middle
            t = bmesh.new(); t.from_mesh(me)
            if o.name.startswith(CLOTH): pass                                      # cloth is thickened by its own modifier (below)
            else:
                xs = [v.co for v in t.verts]; lo = Vector([min(c[i] for c in xs) for i in range(3)]); hi = Vector([max(c[i] for c in xs) for i in range(3)])
                ax = min(range(3), key=lambda i: hi[i] - lo[i]); mid = (lo[ax] + hi[ax]) / 2; half = max((hi[ax] - lo[ax]) / 2, 1e-6)
                for v in t.verts: v.co[ax] = mid + (v.co[ax] - mid) / half * MINT / 2
            t.to_mesh(me); t.free()
        bm.from_mesh(me); bpy.data.meshes.remove(me)
    return bm
def obj_from_bm(name, bm):
    me = bpy.data.meshes.new(name); bm.to_mesh(me); bm.free()
    o = bpy.data.objects.new(name, me); bpy.context.scene.collection.objects.link(o); return o
def remesh(o, vox=VOX):
    for x in bpy.context.scene.objects: x.select_set(False)
    o.select_set(True); bpy.context.view_layer.objects.active = o
    m = o.modifiers.new("v", "REMESH"); m.mode = "VOXEL"; m.voxel_size = vox; m.adaptivity = 0.0
    bpy.ops.object.modifier_apply(modifier="v")
def cut_box(bm, box, zlo=-1.0, zhi=4.0):
    X0, S0, X1, S1 = box
    for co, no in (((X0 / 1000, 0, 0), (-1, 0, 0)), ((X1 / 1000, 0, 0), (1, 0, 0)), ((0, -S0 / 1000, 0), (0, 1, 0)), ((0, -S1 / 1000, 0), (0, -1, 0))):
        bmesh.ops.bisect_plane(bm, geom=bm.verts[:] + bm.edges[:] + bm.faces[:], plane_co=co, plane_no=no, clear_outer=True)
    bmesh.ops.holes_fill(bm, edges=[e for e in bm.edges if e.is_boundary])
def footprint(o, z=0.02, inset=0.0):
    """The part's section a little above the floor, as filled faces at z = 0 (inset by `inset`)."""
    bm = bmesh.new(); bm.from_mesh(o.data)
    r = bmesh.ops.bisect_plane(bm, geom=bm.verts[:] + bm.edges[:] + bm.faces[:], plane_co=(0, 0, z), plane_no=(0, 0, 1))
    cut = [e for e in r["geom_cut"] if isinstance(e, bmesh.types.BMEdge)]
    fp = bmesh.new(); vm = {}
    for e in cut:
        vs = []
        for v in e.verts:
            key = (round(v.co.x, 5), round(v.co.y, 5))
            if key not in vm: vm[key] = fp.verts.new((key[0], key[1], 0.0))
            vs.append(vm[key])
        if vs[0] is not vs[1]:
            try: fp.edges.new(vs)
            except ValueError: pass
    bm.free()
    bmesh.ops.triangle_fill(fp, use_beauty=True, use_dissolve=False, edges=fp.edges[:])
    if inset > 0 and fp.faces: bmesh.ops.inset_region(fp, faces=fp.faces[:], thickness=inset, use_even_offset=True)
    return fp
def prism(fp, z0, z1):
    """Extrude footprint faces from z0 to z1 into a closed solid."""
    faces = [f for f in fp.faces]
    if not faces: return fp
    for v in fp.verts: v.co.z = z0
    r = bmesh.ops.extrude_face_region(fp, geom=faces)
    for v in [g for g in r["geom"] if isinstance(g, bmesh.types.BMVert)]: v.co.z = z1
    bmesh.ops.recalc_face_normals(fp, faces=fp.faces[:])
    return fp

parts, grooves, report = {}, [], []
# ── the wall panels ──
W = bpy.data.objects["walls"]
for name, box in PANELS.items():
    bm = bmesh.new(); me = bpy.data.meshes.new_from_object(W.evaluated_get(dg)); me.transform(W.matrix_world); bm.from_mesh(me); bpy.data.meshes.remove(me)
    cut_box(bm, box)
    extra = mesh_of(groups[name]); tmp = bpy.data.meshes.new("t"); extra.to_mesh(tmp); extra.free(); bm.from_mesh(tmp); bpy.data.meshes.remove(tmp)
    # nothing below the floor or above the ceiling
    bmesh.ops.bisect_plane(bm, geom=bm.verts[:] + bm.edges[:] + bm.faces[:], plane_co=(0, 0, 0.0), plane_no=(0, 0, -1), clear_outer=True)
    bmesh.ops.bisect_plane(bm, geom=bm.verts[:] + bm.edges[:] + bm.faces[:], plane_co=(0, 0, 2.769), plane_no=(0, 0, 1), clear_outer=True)
    bmesh.ops.holes_fill(bm, edges=[e for e in bm.edges if e.is_boundary])
    o = obj_from_bm(name, bm); remesh(o)
    # the tongue under its foot, and the groove it drops into
    g = footprint(o, 0.02); grooves.append(prism(g, -TONGUE - 0.002, 0.003))
    t = prism(footprint(o, 0.02, CLR), -TONGUE + 0.0005, 0.01)
    tb = bmesh.new(); tb.from_mesh(o.data); tm = bpy.data.meshes.new("tg"); t.to_mesh(tm); t.free(); tb.from_mesh(tm); bpy.data.meshes.remove(tm)
    tb.to_mesh(o.data); tb.free(); remesh(o)
    parts[name] = o; print("PART", name, len(groups[name]), "pieces", flush=True)
# ── the free-standing pieces ──
for name in FURN:
    if not groups[name]: continue
    bm = mesh_of(groups[name])
    bmesh.ops.bisect_plane(bm, geom=bm.verts[:] + bm.edges[:] + bm.faces[:], plane_co=(0, 0, 0.0), plane_no=(0, 0, -1), clear_outer=True)
    bmesh.ops.holes_fill(bm, edges=[e for e in bm.edges if e.is_boundary])
    o = obj_from_bm(name, bm); remesh(o); parts[name] = o; print("PART", name, len(groups[name]), "pieces", flush=True)
# ── the floor: one slab under the whole suite, the hide and borders on it, a groove under every wall ──
fb = bmesh.new()
for (x0, s0, x1, s1) in ((-410, -230, 8766, 5996), (7392, 5996, 8766, 8563)):
    r = bmesh.ops.create_cube(fb, size=1.0)
    for v in r["verts"]:
        v.co = Vector((x0 / 1000 + (v.co.x + .5) * (x1 - x0) / 1000, -s0 / 1000 - (v.co.y + .5) * (s1 - s0) / 1000, -SLAB + (v.co.z + .5) * SLAB))
ex = mesh_of(groups["floor"]); tmp = bpy.data.meshes.new("t"); ex.to_mesh(tmp); ex.free(); fb.from_mesh(tmp); bpy.data.meshes.remove(tmp)
fl = obj_from_bm("floor", fb); remesh(fl)
gb = bmesh.new()
for g in grooves:
    tm = bpy.data.meshes.new("g"); g.to_mesh(tm); g.free(); gb.from_mesh(tm); bpy.data.meshes.remove(tm)
go = obj_from_bm("grooves", gb); remesh(go, VOX)
bo = fl.modifiers.new("cut", "BOOLEAN"); bo.operation = "DIFFERENCE"; bo.solver = "EXACT"; bo.object = go
for x in bpy.context.scene.objects: x.select_set(False)
fl.select_set(True); bpy.context.view_layer.objects.active = fl; bpy.ops.object.modifier_apply(modifier="cut")
bpy.data.objects.remove(go); parts["floor"] = fl
def model_xml(objs):
    """3MF model text for (name, mesh, offset) triples, each its own object (Bambu Studio: one part per object)."""
    buf = io.StringIO(); w = buf.write
    w('<?xml version="1.0" encoding="UTF-8"?>\n<model unit="millimeter" xml:lang="en-US" xmlns="http://schemas.microsoft.com/3dmanufacturing/core/2015/02">\n<resources>\n')
    for i, (nm, me, off) in enumerate(objs, 1):
        me.calc_loop_triangles()
        w(f'<object id="{i}" type="model" name="{nm}"><mesh><vertices>\n')
        for v in me.vertices: w('<vertex x="%.4f" y="%.4f" z="%.4f"/>\n' % (v.co.x + off[0], v.co.y + off[1], v.co.z + off[2]))
        w('</vertices><triangles>\n')
        for t in me.loop_triangles: w('<triangle v1="%d" v2="%d" v3="%d"/>\n' % tuple(t.vertices))
        w('</triangles></mesh></object>\n')
    w('</resources>\n<build>' + "".join(f'<item objectid="{i}"/>' for i in range(1, len(objs) + 1)) + '</build>\n</model>\n')
    return buf.getvalue()
def write_3mf(path, objs):
    with zipfile.ZipFile(path, "w", zipfile.ZIP_DEFLATED, compresslevel=6) as z:
        z.writestr("[Content_Types].xml", '<?xml version="1.0" encoding="UTF-8"?>\n<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="model" ContentType="application/vnd.ms-package.3dmanufacturing-3dmodel+xml"/></Types>')
        z.writestr("_rels/.rels", '<?xml version="1.0" encoding="UTF-8"?>\n<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Target="/3D/3dmodel.model" Id="rel0" Type="http://schemas.microsoft.com/3dmanufacturing/2013/01/3dmodel"/></Relationships>')
        z.writestr("3D/3dmodel.model", model_xml(objs))

# ── export: millimetres at 1:SCALE; walls stand as built, everything sits on z = 0; compressed 3MF (an STL of the whole
#    kit is ~2 GB) — one file per part, and the whole kit in one file for Bambu Studio to arrange onto plates ──
k = 1000.0 / SCALE
summary = {}
for name, o in parts.items():
    me = o.data; me.transform(Matrix.Scale(k, 4))
    xs = [v.co for v in me.vertices]; lo = Vector([min(c[i] for c in xs) for i in range(3)]); hi = Vector([max(c[i] for c in xs) for i in range(3)])
    me.transform(Matrix.Translation((-(lo.x + hi.x) / 2, -(lo.y + hi.y) / 2, -lo.z)))
    bm = bmesh.new(); bm.from_mesh(me); nm = sum(1 for e in bm.edges if not e.is_manifold); bm.free()
    write_3mf(os.path.join(OUT, name + ".3mf"), [(name, me, (0, 0, 0))])
    summary[name] = {"size_mm": [round(v, 1) for v in (hi - lo)], "tris": len(me.polygons), "open_edges": nm,
                     "home_mm": [round((lo.x + hi.x) / 2, 1), round((lo.y + hi.y) / 2, 1), round(lo.z, 1)]}
    print("OUT", name, summary[name], flush=True)
json.dump(summary, open(os.path.join(OUT, "parts.json"), "w"), indent=1)
# the whole kit: every part set out in rows with a 5 mm gap, nothing overlapping, so it opens tidy (Arrange packs the plates)
row, x, y, rh, kit = 260.0, 0.0, 0.0, 0.0, []
for name, o in sorted(parts.items(), key=lambda kv: -summary[kv[0]]["size_mm"][1]):
    sx, sy, _ = summary[name]["size_mm"]
    if x + sx > row and x > 0: x, y, rh = 0.0, y + rh + 5, 0.0
    kit.append((name, o.data, (x + sx / 2, y + sy / 2, 0))); x += sx + 5; rh = max(rh, sy)
write_3mf(os.path.join(OUT, "dollhouse-kit-1to%d.3mf" % SCALE), kit)
print("KIT", len(kit), "parts", flush=True)
