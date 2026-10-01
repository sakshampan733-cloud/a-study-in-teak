# Stage 4 of the walkthrough: the realism pass (1 Oct). Run by real.py after its render settings, in its namespace.
# Follows the three things that make a render read as a photograph: the subject (real fabric that has fallen
# under its own weight, wood with depth, edges that catch light, a room with some life in it), the light (a real
# night outside the window), and the camera (a real lens: longer focal length, depth of field, slight dispersion,
# vignette and grain, the last two added in post by tools/walk/post.py).
#
# The styling (desk things, cushions, throw) is the owner's to veto: it all goes in the "styling" collection,
# and STYLE=0 leaves it out.
import bpy, bmesh, math, os, random
from mathutils import Vector, Matrix, noise

STYLE = os.environ.get("STYLE", "1") != "0"
HDRI = os.path.join(HERE, "hdri", "rooftop_night_4k.hdr")      # Poly Haven, CC0: dl.polyhaven.org/file/ph-assets/HDRIs/hdr/4k/rooftop_night_4k.hdr
rr = random.Random(11)

def bb(o):
    """An object's world bounding box in plan millimetres: (x0, s0, z0, x1, s1, z1)."""
    cs = [o.matrix_world @ Vector(c) for c in o.bound_box]
    xs, ss, zs = [c.x * 1000 for c in cs], [-c.y * 1000 for c in cs], [c.z * 1000 for c in cs]
    return min(xs), min(ss), min(zs), max(xs), max(ss), max(zs)

STY = bpy.data.collections.new("styling"); sc.collection.children.link(STY)
SOFT = bpy.data.collections.new("bedding"); sc.collection.children.link(SOFT)

# ═══════════════════════════ 1 · THE BED, MADE ═══════════════════════════════
for n_ in ("duvet", "duvet_fold", "throw", "pillow_b0", "pillow_b1", "pillow_f0", "pillow_f1"):
    o_ = sc.objects.get(n_)
    if o_: bpy.data.objects.remove(o_, do_unlink=True)
mat_ = sc.objects["mattress"]; mx0, ms0, mz0, mx1, ms1, mz1 = bb(mat_)
bcx = (mx0 + mx1) / 2
for n_ in ("mattress", "bed_frame", "bed_base"):
    o_ = sc.objects.get(n_)
    if o_:
        o_.modifiers.new("col", "COLLISION"); o_.collision.thickness_outer = 0.006; o_.collision.cloth_friction = 80

def grid(name, w, d, step, coll):
    """A flat cloth panel, w across x and d along s, one vertex every `step` mm, lying in the plane z=0."""
    me = bpy.data.meshes.new(name); bm = bmesh.new()
    nx, ny = max(2, round(w / step)), max(2, round(d / step))
    vs = [[bm.verts.new(((-w / 2 + w * i / nx) / 1000, (-d / 2 + d * j / ny) / 1000, 0)) for i in range(nx + 1)] for j in range(ny + 1)]
    for j in range(ny):
        for i in range(nx): bm.faces.new((vs[j][i], vs[j][i + 1], vs[j + 1][i + 1], vs[j + 1][i]))
    bm.to_mesh(me); bm.free()
    o = bpy.data.objects.new(name, me); coll.objects.link(o)
    for p_ in me.polygons: p_.use_smooth = True
    return o

def ruffle(o, amp, freq, seed):
    """Lift and drop a flat panel gently, a few hand-widths at a time, so it settles into soft folds rather than a sheet of tin."""
    off = Vector((seed * 3.1, seed * 1.7, seed * 0.9))
    for v in o.data.vertices:
        v.co.z += amp * noise.noise(Vector((v.co.x * freq, v.co.y * freq, 0)) + off)
        v.co.x += amp * 0.6 * noise.noise(Vector((v.co.y * freq, v.co.x * freq, 1.3)) + off)

def simulate(o, frames, **kw):
    """Run a cloth simulation on `o` for `frames` frames and keep the result as plain mesh."""
    cl = o.modifiers.new("cloth", "CLOTH"); cs = cl.settings
    cs.quality = kw.get("quality", 6); cs.mass = kw.get("mass", 0.3); cs.air_damping = kw.get("air", 1.0)
    cs.tension_stiffness = cs.compression_stiffness = kw.get("tension", 15); cs.shear_stiffness = kw.get("shear", 5)
    cs.bending_stiffness = kw.get("bending", 0.5)
    if kw.get("pressure"):
        cs.use_pressure = True; cs.uniform_pressure_force = kw["pressure"]; cs.effector_weights.gravity = 1.0 if kw.get("gravity") else 0.0
    if kw.get("shrink"): cs.shrink_min = kw["shrink"]
    if kw.get("pin"): cs.vertex_group_mass = kw["pin"]
    cl.collision_settings.distance_min = kw.get("dist", 0.004); cl.collision_settings.collision_quality = kw.get("cq", 5)
    cl.collision_settings.use_self_collision = kw.get("self", False)
    if kw.get("self"): cl.collision_settings.self_distance_min = 0.004
    cl.point_cache.frame_start = 1; cl.point_cache.frame_end = frames
    for fr in range(1, frames + 1): sc.frame_set(fr)
    dg = bpy.context.evaluated_depsgraph_get(); me2 = bpy.data.meshes.new_from_object(o.evaluated_get(dg))
    o.modifiers.clear(); old = o.data; o.data = me2; bpy.data.meshes.remove(old)
    for p_ in me2.polygons: p_.use_smooth = True
    sc.frame_set(1)
    x0_, s0_, z0_, x1_, s1_, z1_ = bb(o); print(f"cloth {o.name}: x {x0_:.0f}-{x1_:.0f} s {s0_:.0f}-{s1_:.0f} z {z0_:.0f}-{z1_:.0f}", flush=True)
    return o

def finish(o, thick, levels=2, wrinkle=0.0, mat=None):
    if mat: setmat(o, mat)
    so = o.modifiers.new("thick", "SOLIDIFY"); so.thickness = thick; so.offset = 1.0
    ss = o.modifiers.new("sub", "SUBSURF"); ss.levels = 1; ss.render_levels = levels
    if wrinkle:
        tx = bpy.data.textures.new(o.name + "_w", "CLOUDS"); tx.noise_scale = 0.16; tx.noise_depth = 3
        dp = o.modifiers.new("w", "DISPLACE"); dp.texture = tx; dp.strength = wrinkle; dp.mid_level = 0.5; dp.texture_coords = "GLOBAL"

# the duvet: an ivory cover, laid square on the mattress and let fall over the sides and the foot
DW, DD = (mx1 - mx0) + 2 * 330, (ms1 - ms0) - 470 + 300          # 330 over each side, 300 over the foot, 470 short of the head
dv = grid("duvet", DW, DD, 16, SOFT)
dv.location = Vector(P(bcx, ms0 - 300 + DD / 2, mz1 + 60))
ruffle(dv, 0.03, 4.5, 1)
FLOOR_ = sc.objects.get("floor")
if FLOOR_: FLOOR_.modifiers.new("col", "COLLISION"); FLOOR_.collision.thickness_outer = 0.004
simulate(dv, 70, mass=0.08, tension=12, shear=4, bending=0.3, air=1.5, quality=8)
finish(dv, 0.030, 2, 0.0, M_LINEN_IVORY)
tx_ = bpy.data.textures.new("duvet_loft", "CLOUDS"); tx_.noise_scale = 0.22; tx_.noise_depth = 2      # the down inside settles unevenly
dl = dv.modifiers.new("loft", "DISPLACE"); dl.texture = tx_; dl.strength = 0.012; dl.mid_level = 0.35; dl.texture_coords = "GLOBAL"
dv.modifiers.new("col", "COLLISION"); dv.collision.thickness_outer = 0.005; dv.collision.cloth_friction = 10

# a white top sheet folded back over the duvet's head edge
fs = grid("sheet_fold", DW - 40, 360, 14, SOFT)
fs.location = Vector(P(bcx, ms0 - 300 + DD - 120, mz1 + 90))
ruffle(fs, 0.015, 7, 2)
simulate(fs, 45, mass=0.05, tension=10, bending=0.08, air=2.0, quality=8)
finish(fs, 0.004, 2, 0.0, M_LINEN_WHITE)
dv.modifiers.remove(dv.modifiers["col"])

def pillow(name, w, h, cover, pressure=6.0):
    """A pillow the way cloth makes one: a flat case, pumped up from inside, so the corners pinch and the faces dome."""
    bpy.ops.mesh.primitive_cube_add(size=1)
    o = bpy.context.active_object; o.name = name
    for c in o.users_collection: c.objects.unlink(o)
    SOFT.objects.link(o)
    o.data.transform(Matrix.Diagonal((w / 1000, h / 1000, 0.03, 1.0)))
    sd = o.modifiers.new("s", "SUBSURF"); sd.subdivision_type = "SIMPLE"; sd.levels = 4
    dg = bpy.context.evaluated_depsgraph_get(); me = bpy.data.meshes.new_from_object(o.evaluated_get(dg)); o.modifiers.clear(); o.data = me
    for v in o.data.vertices: v.co += v.normal * 0.0 + Vector((0, 0, 0.004 * noise.noise(v.co * 9 + Vector((len(name), 0, 0)))))
    simulate(o, 30, mass=0.2, tension=8, shear=3, bending=0.05, pressure=pressure, shrink=0.05, air=3.0, quality=8)
    ss = o.modifiers.new("sub", "SUBSURF"); ss.levels = 1; ss.render_levels = 2
    tx = bpy.data.textures.new(name + "_w", "CLOUDS"); tx.noise_scale = 0.06
    dp = o.modifiers.new("w", "DISPLACE"); dp.texture = tx; dp.strength = 0.004; dp.mid_level = 0.5
    setmat(o, cover); return o

def lean(o, x, s_wall, tilt, h, depth_off, z_seat):
    """Stand a pillow on the mattress and lean its top back against whatever is behind it (wall or pillow)."""
    t = math.radians(tilt)
    o.rotation_euler = (math.radians(90) + t, 0, rr.uniform(-0.03, 0.03))
    sc_ = s_wall - depth_off - (h / 2) * math.sin(t)
    o.location = Vector(P(x, sc_, z_seat + (h / 2) * math.cos(t)))

if STYLE:
    wall_s = ms1 + 60                                                  # the parchment wall is just behind the mattress head
    for k, sg in enumerate((-1, 1)):
        e = pillow(f"pillow_euro{k}", 640, 640, M_LINEN_IVORY, 2.6); lean(e, bcx + sg * 420, wall_s, 18, 640, 80, mz1 - 10)
        p_ = pillow(f"pillow_std{k}", 720, 480, M_LINEN_WHITE, 2.2); lean(p_, bcx + sg * 400, wall_s, 28, 480, 250, mz1 - 15)
    lb = pillow("cushion_lumbar", 560, 300, M_LINEN_TAUPE, 3.0); lean(lb, bcx, wall_s, 32, 300, 400, mz1 - 10)
    # then rest each row where it touches: its lowest point sunk a little into the mattress, its back against the wall
    # or against the row behind it (measured on the pillow as it will render, not guessed)
    def ebb(o):
        bpy.context.view_layer.update(); dg_ = bpy.context.evaluated_depsgraph_get(); oe = o.evaluated_get(dg_)
        cs = [oe.matrix_world @ Vector(c) for c in oe.bound_box]
        return min(c.z for c in cs) * 1000, max(-c.y for c in cs) * 1000, min(-c.y for c in cs) * 1000
    back = wall_s - 6
    for row, sink, press_in in ((("pillow_euro0", "pillow_euro1"), 10, 0), (("pillow_std0", "pillow_std1"), 14, 45), (("cushion_lumbar",), 12, 40)):
        nxt = []
        for n_ in row:
            o_ = sc.objects[n_]; zmin, smax, smin = ebb(o_)
            o_.location.z += (mz1 - sink - zmin) / 1000
            o_.location.y += (smax - (back + press_in)) / 1000            # Blender y = −s: move toward the wall until it touches
            nxt.append(ebb(o_)[2])
        back = max(nxt)                                                  # the next row leans on the front of this one
    for o_ in [o for o in SOFT.objects if o.name.startswith(("pillow_", "cushion_"))]:
        for c in list(o_.users_collection): c.objects.unlink(o_)
        STY.objects.link(o_)
    # a throw over the foot, in a chunky weave
    th = grid("throw", 2250, 620, 14, STY)
    th.location = Vector(P(bcx + 90, ms0 + 480, mz1 + 200)); th.rotation_euler.z = math.radians(4)
    ruffle(th, 0.04, 5.5, 3)
    dv.modifiers.new("col", "COLLISION"); dv.collision.thickness_outer = 0.006; dv.collision.cloth_friction = 12
    simulate(th, 70, mass=0.1, tension=8, shear=2, bending=0.15, air=1.5, quality=8)
    dv.modifiers.remove(dv.modifiers["col"])
    M_KNIT = fabric("knit_taupe", (0.30, 0.24, 0.18), 0.9, 1.0, 220)
    finish(th, 0.009, 2, 0.0, M_KNIT)
for n_ in ("mattress", "bed_frame", "bed_base", "floor"):
    o_ = sc.objects.get(n_)
    if o_ and "col" in o_.modifiers: o_.modifiers.remove(o_.modifiers["col"])

# ═══════════════════════════ 2 · ON THE DESK ═════════════════════════════════
def solid(name, coll, m, w_=0.0015, seg=2):
    o = bpy.context.active_object; o.name = name
    if tuple(o.scale) != (1.0, 1.0, 1.0): o.data.transform(Matrix.Diagonal((*o.scale, 1.0))); o.scale = (1, 1, 1)
    for c in list(o.users_collection): c.objects.unlink(o)
    coll.objects.link(o); setmat(o, m)
    if w_: bevel(o, w_, seg)
    return o
def leather(name, col, rough=0.45):
    m, nt, b = node_mat(name); b.inputs["Base Color"].default_value = (*col, 1); b.inputs["Roughness"].default_value = rough
    b.inputs["Coat Weight"].default_value = 0.2; b.inputs["Coat Roughness"].default_value = 0.3
    v = nt.nodes.new("ShaderNodeTexVoronoi"); v.inputs["Scale"].default_value = 900
    bp = nt.nodes.new("ShaderNodeBump"); bp.inputs["Strength"].default_value = 0.12; bp.inputs["Distance"].default_value = 0.0002
    nt.links.new(v.outputs["Distance"], bp.inputs["Height"]); nt.links.new(bp.outputs["Normal"], b.inputs["Normal"])
    rough_var(nt, b, 0.1, 30.0); return m
def ceramic(name, col, rough=0.25):
    m, nt, b = node_mat(name); b.inputs["Base Color"].default_value = (*col, 1); b.inputs["Roughness"].default_value = rough
    b.inputs["Coat Weight"].default_value = 0.5; rough_var(nt, b, 0.05, 8.0); return m

if STYLE and sc.objects.get("dk_top"):
    tx0, ts0, tz0, tx1, ts1, TZ = bb(sc.objects["dk_top"])
    tcx = (tx0 + tx1) / 2
    seat = ts0 + 40                                                    # the sitter's edge: the drawer side, toward the study wall
    # the blotter: oxblood leather in a darker leather frame
    M_LEA = leather("leather_oxblood", (0.16, 0.035, 0.025)); M_LEA2 = leather("leather_dark", (0.045, 0.02, 0.012), 0.38)
    bw, bd = 600, 420; bs0 = seat + 40
    bpy.ops.mesh.primitive_cube_add(size=1, location=P(tcx, bs0 + bd / 2, TZ + 3)); bl = bpy.context.active_object
    bl.scale = (bw / 1000, bd / 1000, 0.006); solid("blotter", STY, M_LEA2, 0.002, 3)
    bpy.ops.mesh.primitive_cube_add(size=1, location=P(tcx, bs0 + bd / 2, TZ + 6.5)); bi = bpy.context.active_object
    bi.scale = ((bw - 50) / 1000, (bd - 50) / 1000, 0.001); solid("blotter_in", STY, M_LEA, 0.0005, 1)
    # three cloth-bound books stacked at the right-hand end, slightly out of square
    M_PAGES = flat("pages", (0.80, 0.74, 0.60), 0.9, bump=0.08)
    z = TZ; bx, bsx = tx1 - 260, (ts0 + ts1) / 2 + 40
    for k, (w, d, t, m) in enumerate(((260, 190, 38, BOOKS[0]), (238, 170, 30, BOOKS[1]), (215, 150, 26, BOOKS[3]))):
        a = math.radians(rr.uniform(-9, 9)); cx_, cs_ = bx + rr.uniform(-12, 12), bsx + rr.uniform(-10, 10)
        parts = []
        for nm, (pw, pd, pz0, pz1, off) in {"bot": (w, d, 0, 3, 0), "top": (w, d, t - 3, t, 0), "pg": (w - 8, d - 8, 3, t - 3, 4)}.items():
            bpy.ops.mesh.primitive_cube_add(size=1, location=P(cx_ + off, cs_, z + (pz0 + pz1) / 2))
            o = bpy.context.active_object; o.scale = (pw / 1000, pd / 1000, (pz1 - pz0) / 1000)
            parts.append(solid(f"book{k}_{nm}", STY, M_PAGES if nm == "pg" else m, 0.0008, 2))
        bpy.ops.mesh.primitive_cylinder_add(vertices=24, radius=t / 2000, depth=d / 1000, location=P(cx_ - w / 2 + 2, cs_, z + t / 2))
        sp = bpy.context.active_object; sp.rotation_euler = (math.pi / 2, 0, 0); parts.append(solid(f"book{k}_spine", STY, m, 0))
        for o in parts:                                                    # turn the whole book about its own centre
            rel = o.location - Vector(P(cx_, cs_, 0)); rel.z = 0
            o.location = Vector(P(cx_, cs_, 0)) + Vector((rel.x * math.cos(a) - rel.y * math.sin(a), rel.x * math.sin(a) + rel.y * math.cos(a), o.location.z))
            o.rotation_euler.z += a
        z += t
    # a banker's lamp at the left-hand end: brass foot and stem, a cased green glass shade, lit
    lx, ls = tx0 + 230, (ts0 + ts1) / 2 + 60
    M_GREEN = None
    mg, ntg, bgl = node_mat("banker_glass")
    bgl.inputs["Base Color"].default_value = (0.02, 0.22, 0.07, 1); bgl.inputs["Roughness"].default_value = 0.06
    bgl.inputs["Transmission Weight"].default_value = 0.35; bgl.inputs["Coat Weight"].default_value = 1.0
    bgl.inputs["Subsurface Weight"].default_value = 0.0
    M_OPAL = glow("opal_glass", (1.0, 0.82, 0.55), 0.6)
    bpy.ops.mesh.primitive_cylinder_add(vertices=48, radius=0.085, depth=0.022, location=P(lx, ls, TZ + 11)); solid("lamp_foot", STY, M_BRASS, 0.004, 3)
    bpy.ops.mesh.primitive_cylinder_add(vertices=24, radius=0.009, depth=0.25, location=P(lx, ls, TZ + 22 + 125)); solid("lamp_stem", STY, M_BRASS, 0.001, 1)
    bpy.ops.mesh.primitive_cylinder_add(vertices=24, radius=0.006, depth=0.12, location=P(lx, ls, TZ + 280)); a_ = solid("lamp_yoke", STY, M_BRASS, 0)
    a_.rotation_euler = (0, math.pi / 2, 0)
    # the shade: half a cylinder, 230 long, lying across, open underneath
    me = bpy.data.meshes.new("lamp_shade_g"); bm = bmesh.new(); R_, L_ = 0.072, 0.23; seg = 32
    rings = []
    for j, xx in enumerate((-L_ / 2, L_ / 2)):
        rings.append([bm.verts.new((xx, R_ * math.cos(math.pi * i / seg), R_ * math.sin(math.pi * i / seg))) for i in range(seg + 1)])
    for i in range(seg): bm.faces.new((rings[0][i], rings[0][i + 1], rings[1][i + 1], rings[1][i]))
    bm.to_mesh(me); bm.free()
    sh = bpy.data.objects.new("lamp_shade", me); STY.objects.link(sh); sh.location = Vector(P(lx, ls, TZ + 288)); sh.rotation_euler = (0, 0, 0)
    sh.data.materials.append(mg); sh.data.materials.append(M_OPAL)
    for p_ in me.polygons: p_.use_smooth = True
    so = sh.modifiers.new("t", "SOLIDIFY"); so.thickness = 0.003; so.material_offset = 1; so.offset = -1
    ld = bpy.data.lights.new("lamp_bulb", "POINT"); ld.energy = 6; ld.shadow_soft_size = 0.03; warm(ld, 2500)
    lo = bpy.data.objects.new("lamp_bulb", ld); STY.objects.link(lo); lo.location = Vector(P(lx, ls, TZ + 272))
    # a small ceramic vase on the study counter, by the window
    vs_ = [o for o in sc.objects if o.name == "glass_win"]
    if vs_:
        gx0, gs0, gz0, gx1, gs1, gz1 = bb(vs_[0])
        prof = [(0, 0), (38, 0), (52, 30), (60, 90), (55, 150), (36, 205), (28, 240), (32, 262), (30, 268)]
        me = bpy.data.meshes.new("vase"); bm = bmesh.new(); seg = 48; rws = []
        for (r_, z_) in prof:
            rws.append([bm.verts.new((r_ / 1000 * math.cos(2 * math.pi * i / seg), r_ / 1000 * math.sin(2 * math.pi * i / seg), z_ / 1000)) for i in range(seg)])
        for a__, b__ in zip(rws, rws[1:]):
            for i in range(seg): bm.faces.new((a__[i], a__[(i + 1) % seg], b__[(i + 1) % seg], b__[i]))
        bm.to_mesh(me); bm.free()
        va = bpy.data.objects.new("vase", me); STY.objects.link(va); setmat(va, ceramic("ceramic_cream", (0.72, 0.66, 0.55)))
        for p_ in me.polygons: p_.use_smooth = True
        va.modifiers.new("t", "SOLIDIFY").thickness = 0.004
        dg_ = bpy.context.evaluated_depsgraph_get()
        hit, loc_, *_ = sc.ray_cast(dg_, Vector(P(gx0 + 170, 200, gz0 + 400)), Vector((0, 0, -1)))
        va.location = loc_ if hit else Vector(P(gx0 + 170, 200, gz0))         # stood on whatever surface is under the window's left end
        print("vase on", hit, tuple(round(c, 3) for c in loc_), flush=True)
        sd = va.modifiers.new("s", "SUBSURF"); sd.levels = 1; sd.render_levels = 2

# ═══════════════════════════ 3 · MATERIALS WITH DEPTH ════════════════════════
def depth(m, bump=0.06, bevel_r=0.0015, coat_flat=True):
    """Grain you can feel (the texture drives a fine bump), and edges rounded at render time so they catch light."""
    if not m or (not bump and not bevel_r): return
    nt = m.node_tree; b = nt.nodes.get("Principled BSDF")
    if not b: return
    tex = next((n for n in nt.nodes if n.type == "TEX_IMAGE"), None)
    bv = nt.nodes.new("ShaderNodeBevel"); bv.samples = 6; bv.inputs["Radius"].default_value = bevel_r
    if tex and bump:
        bw_ = nt.nodes.new("ShaderNodeRGBToBW"); nt.links.new(tex.outputs["Color"], bw_.inputs["Color"])
        bp = nt.nodes.new("ShaderNodeBump"); bp.inputs["Strength"].default_value = bump; bp.inputs["Distance"].default_value = 0.0004
        nt.links.new(bw_.outputs["Val"], bp.inputs["Height"]); nt.links.new(bv.outputs["Normal"], bp.inputs["Normal"])
        nt.links.new(bp.outputs["Normal"], b.inputs["Normal"])
    elif not b.inputs["Normal"].is_linked:
        nt.links.new(bv.outputs["Normal"], b.inputs["Normal"])
    if coat_flat and "Coat Normal" in b.inputs: nt.links.new(bv.outputs["Normal"], b.inputs["Coat Normal"])   # the polish fills the pores
for m_, bmp, br in ((M_VEN, 0.05, 0.0015), (M_DESK, 0.04, 0.0012), (M_BURL, 0.03, 0.002), (M_WHITE, 0.0, 0.001), (M_FLOOR, 0.0, 0.0)):
    depth(m_, bmp, br)
for m_ in (M_BRASS, M_BRONZE):                                          # handled brass: not a perfect mirror
    nt = m_.node_tree; b = nt.nodes["Principled BSDF"]; b.inputs["Roughness"].default_value = 0.28; rough_var(nt, b, 0.1, 60.0)
    bv = nt.nodes.new("ShaderNodeBevel"); bv.inputs["Radius"].default_value = 0.0008; nt.links.new(bv.outputs["Normal"], b.inputs["Normal"])

# ═══════════════════════════ 4 · A REAL NIGHT OUTSIDE ════════════════════════
for o in [o for o in sc.objects if o.type == "MESH" and o.data.materials and o.data.materials[0] and o.data.materials[0].name.startswith("night_sky")]:
    bpy.data.objects.remove(o, do_unlink=True)
if os.path.exists(HDRI):
    wt = sc.world.node_tree; bgn = wt.nodes["Background"]
    env = wt.nodes.new("ShaderNodeTexEnvironment"); env.image = bpy.data.images.load(HDRI, check_existing=True)
    tc = wt.nodes.new("ShaderNodeTexCoord"); mp = wt.nodes.new("ShaderNodeMapping")
    mp.inputs["Rotation"].default_value = (0, 0, math.radians(float(os.environ.get("HDRI_ROT", 90))))
    wt.links.new(tc.outputs["Generated"], mp.inputs["Vector"]); wt.links.new(mp.outputs["Vector"], env.inputs["Vector"])
    # the photograph is a rooftop car park at dusk: face the window to its distant city lights, and keep what lies below
    # the horizon dim, as a view down from an upper floor at night would be
    sep_ = wt.nodes.new("ShaderNodeSeparateXYZ"); wt.links.new(mp.outputs["Vector"], sep_.inputs["Vector"])
    hz = wt.nodes.new("ShaderNodeMapRange"); hz.inputs["From Min"].default_value = -0.03; hz.inputs["From Max"].default_value = 0.01
    hz.inputs["To Min"].default_value = float(os.environ.get("HDRI_GROUND", 0.08)); hz.inputs["To Max"].default_value = 1.0
    wt.links.new(sep_.outputs["Z"], hz.inputs["Value"])
    mul_ = wt.nodes.new("ShaderNodeMixRGB"); mul_.blend_type = "MULTIPLY"; mul_.inputs["Fac"].default_value = 1.0
    wt.links.new(env.outputs["Color"], mul_.inputs["Color1"]); wt.links.new(hz.outputs["Result"], mul_.inputs["Color2"])
    wt.links.new(mul_.outputs["Color"], bgn.inputs["Color"]); bgn.inputs["Strength"].default_value = float(os.environ.get("HDRI_STR", 1.5))
    print("hdri on", flush=True)

# ═══════════════════════════ 4b · LIGHT WITH SHAPE ═══════════════════════════
# A room lit evenly from the ceiling reads as a render. Dim the cove, let the lamps make the pools.
COVE_K, LAMP_K, SPOT_K = float(os.environ.get("COVE_K", 0.45)), float(os.environ.get("LAMP_K", 1.8)), float(os.environ.get("SPOT_K", 2.0))
# the ceiling spots: a real downlight's beam is tighter and crisper than the first guess, so each one throws a pool on
# the floor and, close to a wall, the V-shaped scallop. The fixtures' beam angle is NOT known yet: 40° is a common one.
SPOT_BEAM, SPOT_BLEND = float(os.environ.get("SPOT_BEAM", 40)), float(os.environ.get("SPOT_BLEND", 0.25))
for o in sc.objects:
    if o.type == "LIGHT" and o.name.startswith("spot"):
        o.data.spot_size = math.radians(SPOT_BEAM); o.data.spot_blend = SPOT_BLEND; o.data.shadow_soft_size = 0.01
for o in sc.objects:
    if o.type != "LIGHT": continue
    n = o.name
    if n.startswith(("cove_", "v_cove")): o.data.energy *= COVE_K
    elif "_bulb" in n and not n.startswith("lamp_"): o.data.energy *= LAMP_K
    elif n.startswith("spot"): o.data.energy *= SPOT_K
for m_ in (M_STRIP,): m_.node_tree.nodes["Principled BSDF"].inputs["Emission Strength"].default_value *= COVE_K
M_SHADE.node_tree.nodes["Principled BSDF"].inputs["Emission Strength"].default_value = float(os.environ.get("SHADE_EM", 1.6))   # a lit shade glows

# ═══════════════════════════ 4c · THE SWITCHES ════════════════════════════════
# LIGHTS=all, or a comma list of circuits to leave on: study6 (the six spots 2'6" off the study wall), spots (all 21),
# cove, sconces, desk (the banker's lamp), shelf (the bookcase strip). Everything else goes dark; the night outside stays.
LIGHTS = os.environ.get("LIGHTS", "all")
if LIGHTS != "all":
    on = set(LIGHTS.split(","))
    def circuit(o):
        n = o.name; s_ = -o.location.y * 1000
        if n.startswith("spot"): return "study6" if abs(s_ - 762) < 30 else "spots"
        if n.startswith(("cove_", "v_cove", "v_fill")): return "cove"
        if "_bulb" in n and not n.startswith("lamp_"): return "sconces"
        if n.startswith("lamp_"): return "desk"
        if n.startswith("book_strip"): return "shelf"
        return "other"
    for o in sc.objects:
        if o.type == "LIGHT":
            c_ = circuit(o)
            o.hide_render = not (c_ in on or (c_ == "study6" and "spots" in on))
    def dark(m_):
        if m_: m_.node_tree.nodes["Principled BSDF"].inputs["Emission Strength"].default_value = 0.0
    if "cove" not in on: dark(M_STRIP)
    if "sconces" not in on: dark(M_SHADE); dark(M_BULB)
    if "desk" not in on: dark(bpy.data.materials.get("opal_glass"))
    # the spot discs share one glowing material: give the ones that stay on their own copy, dim the rest
    lit = [o.location.copy() for o in sc.objects if o.type == "LIGHT" and o.name.startswith("spot") and not o.hide_render]
    m_on = M_DISC.copy(); m_on.name = "spot_disc_on"; dark(M_DISC)
    for o in sc.objects:
        if o.type == "MESH" and o.data.materials and o.data.materials[0] == M_DISC and any((o.location - p_).length < 0.05 for p_ in lit):
            o.data.materials[0] = m_on
    print("lights on:", sorted(on), sum(1 for o in sc.objects if o.type == "LIGHT" and not o.hide_render), flush=True)

# ═══════════════════════════ 5 · THE LENS ════════════════════════════════════
ng = sc.compositing_node_group
if ng:
    try:
        gl = next(n for n in ng.nodes if n.bl_idname == "CompositorNodeGlare"); go = next(n for n in ng.nodes if n.bl_idname == "NodeGroupOutput")
        ld_ = ng.nodes.new("CompositorNodeLensdist")
        for k, v in (("Distortion", float(os.environ.get("LDIST", 0.0))), ("Dispersion", float(os.environ.get("LDISP", 0.006)))):
            try: ld_.inputs[k].default_value = v
            except Exception as e: print("lensdist", k, e, flush=True)
        for k in ("Fit", "Jitter"):
            try: ld_.inputs[k].default_value = True
            except Exception: pass
        ng.links.new(gl.outputs["Image"], ld_.inputs["Image"]); ng.links.new(ld_.outputs["Image"], go.inputs[0])
        print("lens dispersion on", [i.name for i in ld_.inputs], flush=True)
    except Exception as e: print("lens?", e, flush=True)
cy.adaptive_threshold = float(os.environ.get("ATHRESH", 0.012))
print("realism pass done", flush=True)
