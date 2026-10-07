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

# ═══════════════════════════ 0 · THE DESK UP TO THE PARTITION (owner, 1 Oct) ═══════════════════════════════
# The desk backs onto the glass partition with no more than 2 in (50 mm) between them, room for a monitor arm's clamp.
# The partition's desk-side face is at s = 2413 − 47.5 (glassblock.py); every piece of the desk moves toward it.
DESK_GAP = 50.0
def _in_desk(o):
    if o.type != "MESH": return False
    if o.name.startswith("dk_"): return True
    if o.name.startswith(("dk2_", "dk_")): return True                    # the whole desk: brass pulls and the clamp-bay cutter too
    if o.data.materials and o.data.materials[0] and o.data.materials[0].name.startswith("teak_desk"):
        x0_, s0_, z0_, x1_, s1_, z1_ = bb(o); return 1100 < x0_ and x1_ < 3600 and 1150 < s0_ and s1_ < 2300 and z1_ < 800
    return False
_dk = [o for o in sc.objects if _in_desk(o)]
if _dk:
    _ds = (2413.0 - 95.0 / 2 - DESK_GAP) - max(bb(o)[4] for o in _dk)
    for o in _dk: o.location.y -= _ds / 1000
    bpy.context.view_layer.update()                                       # so everything placed on the desk below sees it moved
    print(f"desk moved {_ds:.0f} mm toward the partition ({len(_dk)} pieces)", flush=True)

# ═══════════════════════════ 0b · THE BED WALL AND THE BED (owner, 3 Oct) ═══════════════════════════════
exec(compile(open(os.path.join(HERE, "bedwall.py")).read(), "bedwall.py", "exec"))

# ═══════════════════════════ 1 · THE BED, MADE ═══════════════════════════════
for n_ in ("duvet", "duvet_fold", "throw", "pillow_b0", "pillow_b1", "pillow_f0", "pillow_f1"):
    o_ = sc.objects.get(n_)
    if o_: bpy.data.objects.remove(o_, do_unlink=True)
mat_ = sc.objects["mattress"]; mx0, ms0, mz0, mx1, ms1, mz1 = bb(mat_)
bcx = (mx0 + mx1) / 2
for n_ in ("mattress", "bed_frame", "bed_base", "bed_rail_l", "bed_rail_r", "headboard", "back_cushion"):
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
DW, DD = (mx1 - mx0) + 2 * 200, (ms1 - ms0) - 470 + 150          # 8 in over each side, 6 in over the foot (owner, 7 Oct: so the gloss-
                                                                  # black base shows below the bedding), 470 short of the head
dv = grid("duvet", DW, DD, 16, SOFT)
dv.location = Vector(P(bcx, ms0 - 150 + DD / 2, mz1 + 60))
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
fs.location = Vector(P(bcx, ms0 - 150 + DD - 120, mz1 + 90))
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
    _bc = sc.objects.get("back_cushion")                               # pillows lean on the long cushion, else a headboard, else the wall
    wall_s = (bb(_bc)[1] + 40) if _bc else (ms1 + 2 if sc.objects.get("headboard") else ms1 + 60)
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
    # symmetric (owner, 7 Oct: the pillows looked lopsided): each right-hand pillow is the left-hand one mirrored about the
    # bed's centre line, so the pair match exactly; the lumbar sits dead centre, square on
    cxb = P(bcx, 0, 0)[0]
    for a_, b_ in (("pillow_euro0", "pillow_euro1"), ("pillow_std0", "pillow_std1")):
        o0, o1 = sc.objects[a_], sc.objects[b_]
        m_ = o0.copy()
        for c in list(o1.users_collection): c.objects.link(m_)
        bpy.data.objects.remove(o1, do_unlink=True); m_.name = b_
        m_.location.x = 2 * cxb - o0.location.x
        m_.rotation_euler = (o0.rotation_euler.x, -o0.rotation_euler.y, -o0.rotation_euler.z)
        m_.scale = (-o0.scale.x, o0.scale.y, o0.scale.z)
    lb_ = sc.objects["cushion_lumbar"]; lb_.location.x = cxb; lb_.rotation_euler.z = 0.0
    for o_ in [o for o in SOFT.objects if o.name.startswith(("pillow_", "cushion_"))]:
        for c in list(o_.users_collection): c.objects.unlink(o_)
        STY.objects.link(o_)
    # a throw over the foot, in a chunky weave
    th = grid("throw", 2250, 620, 14, STY)
    th.location = Vector(P(bcx, ms0 + 480, mz1 + 200))                     # square across the foot, centred (owner: symmetric)
    ruffle(th, 0.04, 5.5, 3)
    dv.modifiers.new("col", "COLLISION"); dv.collision.thickness_outer = 0.006; dv.collision.cloth_friction = 12
    simulate(th, 70, mass=0.1, tension=8, shear=2, bending=0.15, air=1.5, quality=8)
    dv.modifiers.remove(dv.modifiers["col"])
    M_KNIT = fabric("knit_taupe", (0.30, 0.24, 0.18), 0.9, 1.0, 220)
    finish(th, 0.009, 2, 0.0, M_KNIT)
for n_ in ("mattress", "bed_frame", "bed_base", "bed_rail_l", "bed_rail_r", "headboard", "back_cushion", "floor"):
    o_ = sc.objects.get(n_)
    if o_ and "col" in o_.modifiers: o_.modifiers.remove(o_.modifiers["col"])

# ═══════════════════════════ 1b · THE HIDE (owner, 7 Oct: a big hair-on hide, "like the fur of the animal", real depth) ═════════
# A large brindle cowhide, hair on: about 2.6 × 2.4 m in its natural outline (the neck, four leg lobes, the tail end),
# lying across the foot of the bed 15° off square — its legs reaching well past both sides, a third of it under the
# gloss-black base — and stopping short of the TV unit. Real fur: short strands (⅝ in) lying down along the hide,
# dark chocolate with caramel stripes; a thin leather underside.
def hide_outline():
    half = [(1150, 0), (1125, 110), (1040, 190), (930, 300), (880, 470), (860, 640), (800, 840), (720, 990), (630, 1020), (590, 930),
            (520, 760), (300, 790), (0, 820), (-300, 790), (-520, 760), (-600, 930), (-670, 1030), (-770, 1010), (-850, 840), (-910, 620),
            (-1000, 400), (-1080, 260), (-1125, 120), (-1150, 0)]
    pts = half + [(x, -y) for x, y in reversed(half[1:-1])]
    for _ in range(3):
        nw = []
        for i in range(len(pts)):
            (x0, y0), (x1, y1) = pts[i], pts[(i + 1) % len(pts)]
            nw += [(0.75 * x0 + 0.25 * x1, 0.75 * y0 + 0.25 * y1), (0.25 * x0 + 0.75 * x1, 0.25 * y0 + 0.75 * y1)]
        pts = nw
    return [(x * (1 + 0.03 * noise.noise(Vector((x / 420, y / 420, 0.3)))), y * (1 + 0.035 * noise.noise(Vector((x / 380, y / 380, 1.7))))) for x, y in pts]
HIDE_A, HIDE_K = math.radians(75), 1.13
hc_x, hc_s = bcx + 40, ms0 + 560
bmh = bmesh.new()
ring_ = [bmh.verts.new(P(hc_x + HIDE_K * (x * math.sin(HIDE_A) - y * math.cos(HIDE_A)), hc_s + HIDE_K * (x * math.cos(HIDE_A) + y * math.sin(HIDE_A)), 2)) for x, y in hide_outline()]
fh_ = bmh.faces.new(ring_); bmesh.ops.triangulate(bmh, faces=[fh_], quad_method="BEAUTY", ngon_method="BEAUTY")
for _ in range(3): bmesh.ops.subdivide_edges(bmh, edges=bmh.edges[:], cuts=1, use_grid_fill=True)
for v_ in bmh.verts:                                                    # a hide never lies quite flat
    v_.co.z = (2 + 4 * max(0.0, noise.noise(Vector((v_.co.x * 1000 / 520, -v_.co.y * 1000 / 520, 4.1))))) / 1000
bmesh.ops.recalc_face_normals(bmh, faces=bmh.faces[:])
for f_ in bmh.faces: f_.smooth = True
meh = bpy.data.meshes.new("hide"); bmh.to_mesh(meh); bmh.free()
if sum(p_.normal.z for p_ in meh.polygons) < 0: meh.flip_normals()
hide_ = bpy.data.objects.new("hide", meh); sc.collection.objects.link(hide_)
sol = hide_.modifiers.new("thick", "SOLIDIFY"); sol.thickness = 0.003; sol.offset = -1.0
# the brindle: a dark chocolate ground with caramel stripes running across the body, broken up the way a coat is
def brindle_ramp(nt):
    tc = nt.nodes.new("ShaderNodeTexCoord")
    wv = nt.nodes.new("ShaderNodeTexWave"); wv.wave_type = "BANDS"; wv.inputs["Scale"].default_value = 2.6; wv.inputs["Distortion"].default_value = 14.0
    wv.inputs["Detail"].default_value = 8; wv.inputs["Detail Scale"].default_value = 2.2
    nz = nt.nodes.new("ShaderNodeTexNoise"); nz.inputs["Scale"].default_value = 6.0; nz.inputs["Detail"].default_value = 6
    for t_ in (wv, nz): nt.links.new(tc.outputs["Object"], t_.inputs["Vector"])
    mx = nt.nodes.new("ShaderNodeMix"); mx.data_type = "FLOAT"; mx.inputs["Factor"].default_value = 0.4
    nt.links.new(wv.outputs["Fac"], mx.inputs["A"]); nt.links.new(nz.outputs["Fac"], mx.inputs["B"])
    cr = nt.nodes.new("ShaderNodeValToRGB"); cr.color_ramp.elements[0].position = 0.50; cr.color_ramp.elements[1].position = 0.86
    cr.color_ramp.elements[0].color = (0.011, 0.0055, 0.003, 1); cr.color_ramp.elements[1].color = (0.075, 0.036, 0.016, 1)
    nt.links.new(mx.outputs["Result"], cr.inputs["Fac"]); return cr
m_skin, nts, bs_ = node_mat("hide_skin"); bs_.inputs["Roughness"].default_value = 0.8
nt_c = brindle_ramp(nts); nts.links.new(nt_c.outputs["Color"], bs_.inputs["Base Color"])
m_fur = bpy.data.materials.new("hide_fur"); m_fur.use_nodes = True; ntf = m_fur.node_tree
for n_ in list(ntf.nodes):
    if n_.bl_idname != "ShaderNodeOutputMaterial": ntf.nodes.remove(n_)
hb = ntf.nodes.new("ShaderNodeBsdfHairPrincipled"); hb.parametrization = "COLOR"
for k_, v_ in (("Roughness", 0.32), ("Radial Roughness", 0.45), ("Coat", 0.08), ("Random Roughness", 0.2)):
    if k_ in hb.inputs: hb.inputs[k_].default_value = v_
hi_ = ntf.nodes.new("ShaderNodeHairInfo"); tipm = ntf.nodes.new("ShaderNodeMath"); tipm.operation = "MULTIPLY_ADD"
tipm.inputs[1].default_value = 0.7; tipm.inputs[2].default_value = 0.8                         # lighter toward the tips
ntf.links.new(hi_.outputs["Intercept"], tipm.inputs[0])
tmix = ntf.nodes.new("ShaderNodeMixRGB"); tmix.blend_type = "MULTIPLY"; tmix.inputs["Fac"].default_value = 1.0
ntf.links.new(brindle_ramp(ntf).outputs["Color"], tmix.inputs["Color1"]); ntf.links.new(tipm.outputs["Value"], tmix.inputs["Color2"])
ntf.links.new(tmix.outputs["Color"], hb.inputs["Color"])
ntf.links.new(hb.outputs[0], [n_ for n_ in ntf.nodes if n_.bl_idname == "ShaderNodeOutputMaterial"][0].inputs["Surface"])
hide_.data.materials.append(m_skin); hide_.data.materials.append(m_fur)
fur = hide_.modifiers.new("fur", "PARTICLE_SYSTEM"); st = fur.particle_system.settings
st.type = "HAIR"
lie = Vector((-math.sin(HIDE_A), math.cos(HIDE_A), 0.0))                  # the hair lies down toward the tail
def _set(k, v):
    if hasattr(st, k):
        try: setattr(st, k, v)
        except Exception as e: print("fur setting skipped:", k, e, flush=True)
    else: print("fur setting missing:", k, flush=True)
for k, v in (("count", int(os.environ.get("FUR_N", 90000))), ("hair_length", 0.022), ("use_advanced_hair", True), ("emit_from", "FACE"),
             ("use_emit_random", True), ("use_even_distribution", True), ("normal_factor", 0.5), ("object_align_factor", (0.7 * lie.x, 0.7 * lie.y, 0.0)),
             ("factor_random", 0.08), ("child_type", "INTERPOLATED"), ("child_percent", 3), ("child_nbr", 3),
             ("rendered_child_count", int(os.environ.get("FUR_KIDS", 10))), ("child_radius", 0.004), ("roughness_1", 0.0015), ("roughness_1_size", 1.0),
             ("roughness_endpoint", 0.004), ("length_random", 0.35), ("clump_factor", 0.25), ("root_radius", 1.0), ("tip_radius", 0.25), ("radius_scale", 0.0004)):
    if k == "child_nbr" and hasattr(st, "child_percent"): continue
    _set(k, v)
st.material_slot = "hide_fur"
fur.particle_system.seed = 11
try: sc.cycles_curves.shape = "THICK"
except Exception: pass
print(f"hide {2300 * HIDE_K:.0f} x {2040 * HIDE_K:.0f} at {hc_x:.0f}, {hc_s:.0f}, 15° off square, fur {st.count} x {st.rendered_child_count}", flush=True)

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
    # the desk lamp from the owner's Peaky Blinders still (Tommy Shelby's desk): a tall turned column in dark bronze on a
    # stepped square foot, brass collars, a brass gallery, and a white opal glass shade, lit — at the left-hand end
    lx, ls = tx0 + 210, (ts0 + ts1) / 2 + 70
    M_OPAL = glow("opal_glass", (1.0, 0.86, 0.66), 0.9)
    def lathe(name, prof, m, cx, cs, z0, seg=48, smooth=True):
        bm = bmesh.new(); rings = [[bm.verts.new(P(cx + r * math.cos(2 * math.pi * k / seg), cs + r * math.sin(2 * math.pi * k / seg), z0 + z)) for k in range(seg)] for r, z in prof]
        for ra, rb in zip(rings, rings[1:]):
            for k in range(seg):
                f_ = bm.faces.new((ra[k], ra[(k + 1) % seg], rb[(k + 1) % seg], rb[k])); f_.smooth = smooth
        bmesh.ops.recalc_face_normals(bm, faces=bm.faces[:])
        me = bpy.data.meshes.new(name); bm.to_mesh(me); bm.free()
        o = bpy.data.objects.new(name, me); STY.objects.link(o); setmat(o, m); return o
    M_DBRONZE = flat("lamp_bronze", (0.035, 0.028, 0.022), 0.32, 1.0)
    for nm, (w, z0, z1) in {"foot0": (150, 0, 26), "foot1": (118, 26, 44), "foot2": (90, 44, 58)}.items():
        bpy.ops.mesh.primitive_cube_add(size=1, location=P(lx, ls, TZ + (z0 + z1) / 2)); o_ = bpy.context.active_object
        o_.scale = (w / 1000, w / 1000, (z1 - z0) / 1000); solid(f"lamp_{nm}", STY, M_DBRONZE, 0.003, 3)
    lathe("lamp_column", [(0, 58), (20, 58), (24, 70), (17, 96), (15, 200), (16, 330), (14, 470), (18, 520), (12, 540), (0, 540)], M_DBRONZE, lx, ls, TZ)
    for zc in (70, 330, 520):
        lathe(f"lamp_collar{zc}", [(0, zc - 7), (22, zc - 7), (25, zc), (22, zc + 7), (0, zc + 7)], M_BRASS, lx, ls, TZ)
    lathe("lamp_gallery", [(0, 540), (48, 540), (52, 548), (46, 556), (40, 556), (0, 556)], M_BRASS, lx, ls, TZ)
    lathe("lamp_shade", [(36, 556), (62, 572), (86, 610), (92, 650), (80, 700), (52, 735), (24, 752), (0, 756)], M_OPAL, lx, ls, TZ)
    lathe("lamp_finial", [(0, 752), (8, 754), (10, 766), (4, 780), (0, 784)], M_BRASS, lx, ls, TZ)
    ld = bpy.data.lights.new("lamp_bulb", "POINT"); ld.energy = 6; ld.shadow_soft_size = 0.03; warm(ld, 2700)   # lamps 2700 K (owner, 7 Oct)
    lo = bpy.data.objects.new("lamp_bulb", ld); STY.objects.link(lo); lo.location = Vector(P(lx, ls, TZ + 640))
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

# ═══════════════════════════ 2b · THE MONITOR (owner, 1 Oct: "a nice Samsung OLED monitor") ════════════
# A 32 in 16:9 flat OLED (the Odyssey OLED G8 class: about 714 × 414 mm, a few mm thin at the edge), on a single arm
# clamped to the desk's back edge in the 2 in gap, facing the chair. Centred on the desk, its middle 1.12 m up.
if sc.objects.get("dk_top"):
    tx0, ts0, tz0, tx1, ts1, TZ = bb(sc.objects["dk_top"]); mcx = (tx0 + tx1) / 2
    M_PANEL = flat("monitor_body", (0.018, 0.018, 0.02), 0.35, 0.6); M_SCR = None
    ms_, nt_, bs_ = node_mat("monitor_screen"); bs_.inputs["Base Color"].default_value = (0.004, 0.004, 0.005, 1)
    bs_.inputs["Roughness"].default_value = 0.3; bs_.inputs["Specular IOR Level"].default_value = 0.25
    MW, MH, MZ, MS = 714.0, 414.0, TZ + 370, ts1 - 230                      # width, height, centre height, screen plane (s)
    def mbox(name, x0, s0, z0, x1, s1, z1, m, bv=0.0015):
        bpy.ops.mesh.primitive_cube_add(size=1, location=P((x0 + x1) / 2, (s0 + s1) / 2, (z0 + z1) / 2))
        o = bpy.context.active_object; o.scale = ((x1 - x0) / 1000, (s1 - s0) / 1000, (z1 - z0) / 1000)
        return solid(name, STY, m, bv, 2)
    mbox("monitor_panel", mcx - MW / 2, MS, MZ - MH / 2, mcx + MW / 2, MS + 7, MZ + MH / 2, M_PANEL, 0.002)
    mbox("monitor_glass", mcx - MW / 2 + 3, MS - 0.6, MZ - MH / 2 + 3, mcx + MW / 2 - 3, MS, MZ + MH / 2 - 3, ms_, 0)
    mbox("monitor_back", mcx - 160, MS + 7, MZ - 110, mcx + 160, MS + 32, MZ + 90, M_PANEL, 0.006)
    pole_s = ts1 + DESK_GAP / 2                                              # the clamp sits in the gap behind the desk
    bpy.ops.mesh.primitive_cylinder_add(vertices=32, radius=0.016, depth=0.46, location=P(mcx, pole_s, TZ + 230)); solid("monitor_pole", STY, M_IRON, 0)
    mbox("monitor_clamp", mcx - 30, pole_s - 22, TZ - 70, mcx + 30, pole_s + 22, TZ + 18, M_IRON, 0.003)
    mbox("monitor_arm", mcx - 18, MS + 32, MZ - 20, mcx + 18, pole_s, MZ + 4, M_IRON, 0.004)
    print("monitor on the desk", flush=True)

# ═══════════════════════════ 2c · THE PAINTING (owner, 1 Oct: "a really big painting, landscape") ═════════════
# 8 ft × 5 ft (2400 × 1500) on the left wall, centred under the air-conditioner, its top ~250 mm below it. The owner
# hasn't chosen the picture: a stand-in, a tonal dusk landscape in oils, in a slim antique gilt frame.
def oil_landscape():
    m, nt, b = node_mat("painting_landscape"); b.inputs["Roughness"].default_value = 0.45; b.inputs["Coat Weight"].default_value = 0.35
    tc = nt.nodes.new("ShaderNodeTexCoord"); sp = nt.nodes.new("ShaderNodeSeparateXYZ"); nt.links.new(tc.outputs["Generated"], sp.inputs["Vector"])
    # the horizon wanders: a low line of hills against a warm, fading sky; darker earth below
    hz = nt.nodes.new("ShaderNodeTexNoise"); hz.inputs["Scale"].default_value = 3.0; hz.inputs["Detail"].default_value = 4
    nt.links.new(tc.outputs["Generated"], hz.inputs["Vector"])
    hl = nt.nodes.new("ShaderNodeMath"); hl.operation = "MULTIPLY_ADD"; hl.inputs[1].default_value = 0.16; hl.inputs[2].default_value = 0.30
    nt.links.new(hz.outputs["Fac"], hl.inputs[0])
    d_ = nt.nodes.new("ShaderNodeMath"); d_.operation = "SUBTRACT"; nt.links.new(sp.outputs["Z"], d_.inputs[0]); nt.links.new(hl.outputs["Value"], d_.inputs[1])
    ramp = nt.nodes.new("ShaderNodeValToRGB"); cr = ramp.color_ramp
    stops = [(0.0, (0.035, 0.032, 0.022)), (0.26, (0.075, 0.065, 0.040)), (0.30, (0.14, 0.11, 0.065)), (0.33, (0.40, 0.28, 0.13)),
             (0.42, (0.62, 0.45, 0.22)), (0.62, (0.36, 0.33, 0.27)), (1.0, (0.12, 0.13, 0.14))]
    cr.elements[0].position, cr.elements[0].color = stops[0][0], (*stops[0][1], 1)
    cr.elements[1].position, cr.elements[1].color = stops[-1][0], (*stops[-1][1], 1)
    for pos, col in stops[1:-1]:
        e = cr.elements.new(pos); e.color = (*col, 1)
    mr = nt.nodes.new("ShaderNodeMapRange"); mr.inputs["From Min"].default_value = -0.35; mr.inputs["From Max"].default_value = 0.70
    nt.links.new(d_.outputs["Value"], mr.inputs["Value"]); nt.links.new(mr.outputs["Result"], ramp.inputs["Fac"])
    # the paint: dabs and strokes, horizontal in the sky, broken in the ground
    br = nt.nodes.new("ShaderNodeTexWave"); br.bands_direction = "Z"; br.inputs["Scale"].default_value = 9; br.inputs["Distortion"].default_value = 14
    br.inputs["Detail"].default_value = 6; br.inputs["Detail Roughness"].default_value = 0.7
    nt.links.new(tc.outputs["Generated"], br.inputs["Vector"])
    # clouds: soft, stretched sideways, brighter toward the horizon glow; the brushwork only as texture
    cl = nt.nodes.new("ShaderNodeTexNoise"); cl.inputs["Scale"].default_value = 2.2; cl.inputs["Detail"].default_value = 7; cl.inputs["Roughness"].default_value = 0.62
    cm = nt.nodes.new("ShaderNodeMapping"); cm.inputs["Scale"].default_value = (1.0, 0.55, 2.4)
    nt.links.new(tc.outputs["Generated"], cm.inputs["Vector"]); nt.links.new(cm.outputs["Vector"], cl.inputs["Vector"])
    cv = nt.nodes.new("ShaderNodeMapRange"); cv.inputs["From Min"].default_value = 0.35; cv.inputs["From Max"].default_value = 0.7
    cv.inputs["To Min"].default_value = 0.72; cv.inputs["To Max"].default_value = 1.3; nt.links.new(cl.outputs["Fac"], cv.inputs["Value"])
    sky = nt.nodes.new("ShaderNodeMath"); sky.operation = "GREATER_THAN"; sky.inputs[1].default_value = 0.0; nt.links.new(d_.outputs["Value"], sky.inputs[0])
    k_ = nt.nodes.new("ShaderNodeMix"); k_.data_type = "FLOAT"; k_.inputs["A"].default_value = 1.0
    nt.links.new(sky.outputs["Value"], k_.inputs["Factor"]); nt.links.new(cv.outputs["Result"], k_.inputs["B"])
    lit = nt.nodes.new("ShaderNodeMixRGB"); lit.blend_type = "MULTIPLY"; lit.inputs["Fac"].default_value = 1.0
    nt.links.new(ramp.outputs["Color"], lit.inputs["Color1"]); nt.links.new(k_.outputs["Result"], lit.inputs["Color2"])
    dab = nt.nodes.new("ShaderNodeTexNoise"); dab.inputs["Scale"].default_value = 38; dab.inputs["Detail"].default_value = 3
    nt.links.new(tc.outputs["Generated"], dab.inputs["Vector"])
    mix = nt.nodes.new("ShaderNodeMixRGB"); mix.blend_type = "OVERLAY"; mix.inputs["Fac"].default_value = 0.12
    nt.links.new(lit.outputs["Color"], mix.inputs["Color1"]); nt.links.new(dab.outputs["Color"], mix.inputs["Color2"])
    nt.links.new(mix.outputs["Color"], b.inputs["Base Color"])
    imp = nt.nodes.new("ShaderNodeTexNoise"); imp.inputs["Scale"].default_value = 140; imp.inputs["Detail"].default_value = 8
    nt.links.new(tc.outputs["Generated"], imp.inputs["Vector"])
    bp = nt.nodes.new("ShaderNodeBump"); bp.inputs["Strength"].default_value = 0.25; bp.inputs["Distance"].default_value = 0.0012
    hb = nt.nodes.new("ShaderNodeMath"); hb.operation = "MULTIPLY_ADD"; hb.inputs[1].default_value = 0.3
    nt.links.new(br.outputs["Fac"], hb.inputs[0]); nt.links.new(imp.outputs["Fac"], hb.inputs[2])
    nt.links.new(hb.outputs["Value"], bp.inputs["Height"]); nt.links.new(bp.outputs["Normal"], b.inputs["Normal"])
    return m
ac_ = sc.objects.get("ac")
if ac_:
    ax0, as0, az0, ax1, as1, az1 = bb(ac_)
    PW_, PH_ = 2400.0, 1500.0; pc_s = (as0 + as1) / 2; ptop = az0 - 100 - 152; pz0 = ptop - PH_    # 6 in lower (owner): clear of the AC
    wall_x = BED["xLs"]                                                          # the left wall's face here
    M_GILT = flat("antique_gilt", (0.55, 0.40, 0.17), 0.38, 1.0); rough_var(M_GILT.node_tree, M_GILT.node_tree.nodes["Principled BSDF"], 0.12, 25.0)
    def pbox(name, x0, s0, z0, x1, s1, z1, m, bv=0.002):
        bpy.ops.mesh.primitive_cube_add(size=1, location=P((x0 + x1) / 2, (s0 + s1) / 2, (z0 + z1) / 2))
        o = bpy.context.active_object; o.scale = ((x1 - x0) / 1000, (s1 - s0) / 1000, (z1 - z0) / 1000)
        return solid(name, STY, m, bv, 3)
    FW, FD = 80.0, 55.0                                                          # frame: 80 wide, 55 deep off the wall
    pbox("painting_canvas", wall_x + 12, pc_s - PW_ / 2, pz0, wall_x + 40, pc_s + PW_ / 2, ptop, oil_landscape(), 0.001)
    for nm, (s0_, s1_, z0_, z1_) in {"t": (pc_s - PW_ / 2 - FW, pc_s + PW_ / 2 + FW, ptop, ptop + FW), "b": (pc_s - PW_ / 2 - FW, pc_s + PW_ / 2 + FW, pz0 - FW, pz0),
                                     "l": (pc_s - PW_ / 2 - FW, pc_s - PW_ / 2, pz0, ptop), "r": (pc_s + PW_ / 2, pc_s + PW_ / 2 + FW, pz0, ptop)}.items():
        pbox(f"painting_frame_{nm}", wall_x + 5, s0_, z0_, wall_x + FD, s1_, z1_, M_GILT, 0.012)
    print(f"painting {PW_:.0f} x {PH_:.0f} on the left wall, centre s {pc_s:.0f}, {pz0:.0f}-{ptop:.0f} up", flush=True)

# the study wall's centre panel (AST-DR-040): a stand-in oil landscape, 860 × 640, in a slim gilt frame, hung on the
# pushed-back panel inside the beaded frame, a brass picture light over it
SPt = globals().get("STUDY_PAINT")
if SPt:
    if "M_GILT" not in globals():
        M_GILT = flat("antique_gilt", (0.55, 0.40, 0.17), 0.38, 1.0)
    def sbox(name, x0, s0, z0, x1, s1, z1, m, bv=0.002):
        bpy.ops.mesh.primitive_cube_add(size=1, location=P((x0 + x1) / 2, (s0 + s1) / 2, (z0 + z1) / 2))
        o = bpy.context.active_object; o.scale = ((x1 - x0) / 1000, (s1 - s0) / 1000, (z1 - z0) / 1000)
        return solid(name, STY, m, bv, 3)
    cx_, cz_, pw_, ph_, ws_ = SPt["cx"], SPt["cz"], SPt["w"], SPt["h"], SPt["s"]
    sbox("study_painting_canvas", cx_ - pw_ / 2 + 50, ws_ + 6, cz_ - ph_ / 2 + 50, cx_ + pw_ / 2 - 50, ws_ + 30, cz_ + ph_ / 2 - 50, oil_landscape(), 0.001)
    for nm, (x0_, x1_, z0_, z1_) in {"t": (cx_ - pw_ / 2, cx_ + pw_ / 2, cz_ + ph_ / 2 - 50, cz_ + ph_ / 2), "b": (cx_ - pw_ / 2, cx_ + pw_ / 2, cz_ - ph_ / 2, cz_ - ph_ / 2 + 50),
                                     "l": (cx_ - pw_ / 2, cx_ - pw_ / 2 + 50, cz_ - ph_ / 2 + 50, cz_ + ph_ / 2 - 50), "r": (cx_ + pw_ / 2 - 50, cx_ + pw_ / 2, cz_ - ph_ / 2 + 50, cz_ + ph_ / 2 - 50)}.items():
        sbox(f"study_painting_frame_{nm}", x0_, ws_, z0_, x1_, ws_ + 42, z1_, M_GILT, 0.008)
    sbox("study_picture_light", cx_ - 230, ws_ + 70, cz_ + ph_ / 2 + 70, cx_ + 230, ws_ + 100, cz_ + ph_ / 2 + 92, M_BRASS, 0.006)
    sbox("study_picture_arm", cx_ - 8, ws_, cz_ + ph_ / 2 + 92, cx_ + 8, ws_ + 90, cz_ + ph_ / 2 + 106, M_BRASS, 0.003)
    ld = bpy.data.lights.new("study_picture_light", "AREA"); ld.shape = "RECTANGLE"; ld.size, ld.size_y = 0.42, 0.02; ld.energy = 6; warm(ld, 2700)
    lo = bpy.data.objects.new("study_picture_light", ld); sc.collection.objects.link(lo); lo.location = P(cx_, ws_ + 85, cz_ + ph_ / 2 + 66)
    lo.rotation_euler = (math.radians(-25), 0, 0)
    print(f"study painting {pw_:.0f} x {ph_:.0f} at {cx_:.0f}, {cz_:.0f}", flush=True)

# ═══════════════════════════ 2d · THE DESK CHAIR (owner: Tommy Shelby's chair, in royal green) ═════════
# A tall button-tufted leather office chair, as in the owner's two Peaky Blinders stills: the back a deep curved shell that
# wraps round the seat and rolls down into the arms, deep-buttoned in diamonds; a loose seat cushion; a swivel column on a
# five-star base with brass castors. Royal green leather (owner). It stands at the desk's drawer side, facing the desk.
dtop_ = sc.objects.get("dk2_top")
if dtop_:
    qx0, qs0, qz0, qx1, qs1, qz1 = bb(dtop_)
    CHX, CHS = (qx0 + qx1) / 2, qs0 - 330                                  # in the kneehole's line, pulled up to the desk
    M_GREEN_LEATHER = flat("royal_green_leather", (0.010, 0.075, 0.035), 0.36, coat=0.35)
    rough_var(M_GREEN_LEATHER.node_tree, M_GREEN_LEATHER.node_tree.nodes["Principled BSDF"], 0.08, 14.0)
    noise_bump(M_GREEN_LEATHER.node_tree, M_GREEN_LEATHER.node_tree.nodes["Principled BSDF"], 160, 0.08, 0.0006)
    SEAT_Z, BACK_TOP, ARM_TOP, RI, RO = 470.0, 1180.0, 700.0, 300.0, 410.0
    PH0 = math.radians(105)                                                # the shell wraps 105° either side of the back's centre
    def h_back(ph):                                                       # the top falls from the back to the rolled arm fronts
        u = abs(ph) / PH0; return ARM_TOP + (BACK_TOP - ARM_TOP) * (1 - u ** 2.2)
    def shell_pt(ph, r, z):                                               # ph = 0 at the back (away from the desk), +s is the desk
        return P(CHX + r * math.sin(ph), CHS - r * math.cos(ph), z)
    buttons = []
    for row, z_ in enumerate(range(int(SEAT_Z + 140), int(BACK_TOP - 90), 115)):
        step = 118.0 / RI; off = 0.5 * step if row % 2 else 0.0
        ph_ = -PH0 * 0.82 + off
        while ph_ <= PH0 * 0.82:
            if z_ < h_back(ph_) - 80: buttons.append((ph_, float(z_)))
            ph_ += step
    def tuft(ph, z):                                                      # how far the inner face is pulled in at (ph, z)
        d = 0.0
        for bp, bz in buttons:
            dd = ((ph - bp) * RI) ** 2 + (z - bz) ** 2
            if dd < 140 ** 2: d = max(d, 26 * math.exp(-dd / (2 * 34 ** 2)))
        return d
    bm = bmesh.new(); NPH, NZ = 110, 56
    grid_in, grid_out = [], []
    for i in range(NPH + 1):
        ph = -PH0 + 2 * PH0 * i / NPH; top = h_back(ph); col_i, col_o = [], []
        for j in range(NZ + 1):
            z = SEAT_Z - 60 + (top - SEAT_Z + 60) * j / NZ
            col_i.append(bm.verts.new(shell_pt(ph, RI + tuft(ph, z), z)))
            col_o.append(bm.verts.new(shell_pt(ph, RO, z)))
        grid_in.append(col_i); grid_out.append(col_o)
    for i in range(NPH):
        for j in range(NZ):
            bm.faces.new((grid_in[i][j], grid_in[i][j + 1], grid_in[i + 1][j + 1], grid_in[i + 1][j])).smooth = True
            bm.faces.new((grid_out[i][j], grid_out[i + 1][j], grid_out[i + 1][j + 1], grid_out[i][j + 1])).smooth = True
    for i in range(NPH):                                                  # the rolled top and the foot of the shell
        bm.faces.new((grid_in[i][NZ], grid_out[i][NZ], grid_out[i + 1][NZ], grid_in[i + 1][NZ])).smooth = True
        bm.faces.new((grid_in[i][0], grid_in[i + 1][0], grid_out[i + 1][0], grid_out[i][0]))
    for i in (0, NPH):                                                    # the arm fronts
        for j in range(NZ): bm.faces.new((grid_in[i][j], grid_out[i][j], grid_out[i][j + 1], grid_in[i][j + 1])).smooth = True
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces[:])
    me = bpy.data.meshes.new("deskchair_back"); bm.to_mesh(me); bm.free()
    ch = bpy.data.objects.new("deskchair_back", me); STY.objects.link(ch); setmat(ch, M_GREEN_LEATHER)
    bv = ch.modifiers.new("roll", "BEVEL"); bv.width = 0.03; bv.segments = 5; bv.limit_method = "ANGLE"
    sd = ch.modifiers.new("s", "SUBSURF"); sd.levels = 1; sd.render_levels = 1
    M_BTN = flat("chair_button", (0.008, 0.06, 0.028), 0.3, coat=0.4)
    for k, (bp, bz) in enumerate(buttons):
        bpy.ops.mesh.primitive_uv_sphere_add(segments=12, ring_count=6, radius=0.007, location=shell_pt(bp, RI + 20, bz)); solid(f"deskchair_btn{k}", STY, M_BTN, 0)
    # the seat: a loose cushion on a sprung base, both in the leather
    bpy.ops.mesh.primitive_cylinder_add(vertices=64, radius=0.31, depth=0.07, location=P(CHX, CHS, SEAT_Z - 35)); solid("deskchair_seatbase", STY, M_GREEN_LEATHER, 0.02, 4)
    bpy.ops.mesh.primitive_cylinder_add(vertices=64, radius=0.29, depth=0.09, location=P(CHX, CHS + 10, SEAT_Z + 45)); cu_ = solid("deskchair_cushion", STY, M_GREEN_LEATHER, 0.035, 6)
    cu_.scale = (1.0, 1.0, 1.0); [setattr(p_, "use_smooth", True) for p_ in cu_.data.polygons]
    # the swivel: a column and a five-star base in dark bronze, brass castors
    M_CBRZ = flat("chair_bronze", (0.04, 0.03, 0.022), 0.35, 1.0)
    bpy.ops.mesh.primitive_cylinder_add(vertices=32, radius=0.03, depth=0.30, location=P(CHX, CHS, 250)); solid("deskchair_column", STY, M_CBRZ, 0.003, 2)
    for k in range(5):
        a_ = 2 * math.pi * k / 5
        bpy.ops.mesh.primitive_cube_add(size=1, location=P(CHX + 170 * math.sin(a_), CHS - 170 * math.cos(a_), 95))
        lg_ = bpy.context.active_object; lg_.scale = (0.04, 0.34, 0.03); lg_.rotation_euler = (0, 0, -a_); solid(f"deskchair_leg{k}", STY, M_CBRZ, 0.008, 3)
        bpy.ops.mesh.primitive_uv_sphere_add(segments=16, ring_count=8, radius=0.028, location=P(CHX + 330 * math.sin(a_), CHS - 330 * math.cos(a_), 30)); solid(f"deskchair_castor{k}", STY, M_BRASS, 0)
    print(f"desk chair: royal green, tufted, {len(buttons)} buttons, at {CHX:.0f}, {CHS:.0f}", flush=True)

# ═══════════════════════════ 3 · MATERIALS WITH DEPTH ════════════════════════
def depth(m, bump=0.06, bevel_r=0.0015, coat_flat=True):
    """Grain you can feel (the texture drives a fine bump), and edges rounded at render time so they catch light."""
    if not m or (not bump and not bevel_r): return
    nt = m.node_tree; b = nt.nodes.get("Principled BSDF")
    if not b: return
    tex = next((n for n in nt.nodes if n.type == "TEX_IMAGE"), None)
    if os.environ.get("BEVEL_SHADER") != "1": bevel_r = 0.0          # the joinery's edges are already rounded in the mesh; the
    bv = nt.nodes.new("ShaderNodeBevel"); bv.samples = 6; bv.inputs["Radius"].default_value = bevel_r   # shader bevel doubled render time
    if tex and bump:
        bw_ = nt.nodes.new("ShaderNodeRGBToBW"); nt.links.new(tex.outputs["Color"], bw_.inputs["Color"])
        bp = nt.nodes.new("ShaderNodeBump"); bp.inputs["Strength"].default_value = bump; bp.inputs["Distance"].default_value = 0.0004
        nt.links.new(bw_.outputs["Val"], bp.inputs["Height"])
        if bevel_r: nt.links.new(bv.outputs["Normal"], bp.inputs["Normal"])
        nt.links.new(bp.outputs["Normal"], b.inputs["Normal"])
    elif bevel_r and not b.inputs["Normal"].is_linked:
        nt.links.new(bv.outputs["Normal"], b.inputs["Normal"])
    if bevel_r and coat_flat and "Coat Normal" in b.inputs: nt.links.new(bv.outputs["Normal"], b.inputs["Coat Normal"])   # the polish fills the pores
    if not bevel_r: nt.nodes.remove(bv)
for m_, bmp, br in ((M_VEN, 0.05, 0.0015), (M_DESK, 0.04, 0.0012), (M_BURL, 0.03, 0.002), (M_WHITE, 0.0, 0.001), (M_FLOOR, 0.0, 0.0)):
    depth(m_, bmp, br)
for m_ in (M_BRASS, M_BRONZE):                                          # handled brass: not a perfect mirror
    nt = m_.node_tree; b = nt.nodes["Principled BSDF"]; b.inputs["Roughness"].default_value = 0.28; rough_var(nt, b, 0.1, 60.0)
    if os.environ.get("BEVEL_SHADER") == "1":
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
    cap = wt.nodes.new("ShaderNodeRGBCurve")                     # cap the car park's floodlights, which flare through the glass
    wt.links.new(env.outputs["Color"], cap.inputs["Color"]); env_c = cap.outputs["Color"]
    wt.links.new(env_c, mul_.inputs["Color1"]); wt.links.new(hz.outputs["Result"], mul_.inputs["Color2"])
    wt.links.new(mul_.outputs["Color"], bgn.inputs["Color"]); bgn.inputs["Strength"].default_value = float(os.environ.get("HDRI_STR", 1.5))
    print("hdri on", flush=True)

# ═══════════════════════════ 4b · LIGHT WITH SHAPE ═══════════════════════════
# A room lit evenly from the ceiling reads as a render. Dim the cove, let the lamps make the pools.
COVE_K, LAMP_K, SPOT_K = float(os.environ.get("COVE_K", 0.45)), float(os.environ.get("LAMP_K", 1.8)), float(os.environ.get("SPOT_K", 100.0))
# the ceiling spots: stage 3 had them ~100× too weak (9 W against lamps a hand's width from the wall), so they lit
# nothing. At ~900 W each (Blender's point-light measure, matching a 10 W LED downlight's beam) they pool on the floor.
# A real downlight's beam is also tighter and crisper than the first guess, so each one throws a pool on
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

# ═══════════════════════════ 4c · THE PARTITION ══════════════════════════════
if os.environ.get("PARTITION", "1") != "0":
    exec(compile(open(os.path.join(HERE, "glassblock.py")).read(), "glassblock.py", "exec"))

# ═══════════════════════════ 4d · THE SWITCHES ════════════════════════════════
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
