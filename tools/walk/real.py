# Stage 3 of the walkthrough: the rooms as they are meant to look — real materials, real light, Cycles.
# The bedroom (with the study) and the dressing room; the bathroom stays shut, the partition and the bed back
# are left out (the owner, 30.09). Geometry comes from furnish.py (itself on skeleton.py), so every wall and
# piece stays where the drawings put it; this adds the finish: teak veneer, polished marble, cream paint,
# parchment, brass, the right wall's panelling and lamps, panelled doors and casings, the dressing room's
# coffered vault (from the owner's photo), the ceiling coves and spots, books on the shelves.
#
#   blender -b --python tools/walk/real.py -- <out_dir> [still <name>|stills|frames|blend] [samples]
import bpy, bmesh, math, os, sys, json, random
from mathutils import Vector

HERE = os.path.dirname(os.path.abspath(__file__))
_a = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
OUTR = _a[0] if _a else "/tmp/real"
MODER = _a[1] if len(_a) > 1 else "stills"
ONLY = _a[2] if MODER == "still" and len(_a) > 2 else None
SPP = int(_a[3] if MODER == "still" and len(_a) > 3 else (_a[2] if MODER != "still" and len(_a) > 2 else 96))
sys.argv = [sys.argv[0], "--", OUTR, "build"]
exec(compile(open(os.path.join(HERE, "furnish.py")).read(), "furnish.py", "exec"))
os.makedirs(OUTR, exist_ok=True)
TEX = os.path.join(HERE, "tex")
rng = random.Random(7)

# ── what is not part of this tour ─────────────────────────────────────────────
KILL = ("chair_",
        "glass_bwin", "lbl_", "painting", "desk_top", "desk_frieze", "sconce", "dome", "cor_", "L_cor")
for o in list(sc.objects):
    if o.name.startswith(KILL) or o.type == "LIGHT": bpy.data.objects.remove(o, do_unlink=True)
for d in ("door_d1", "door_d2", "door_d3"): sc.objects[d].rotation_euler.z = 0

# ── materials ──────────────────────────────────────────────────────────────────
def node_mat(name):
    m = bpy.data.materials.new(name); m.use_nodes = True
    nt = m.node_tree; b = nt.nodes["Principled BSDF"]
    return m, nt, b
def img(nt, fname, scale, proj="BOX", blend=0.25, rot=0.0):
    tc = nt.nodes.new("ShaderNodeTexCoord"); mp = nt.nodes.new("ShaderNodeMapping")
    sx, sy, sz = scale if isinstance(scale, tuple) else (scale, scale, scale)
    mp.inputs["Scale"].default_value = (1 / sx, 1 / sy, 1 / sz); mp.inputs["Rotation"].default_value = (0, 0, rot)
    t = nt.nodes.new("ShaderNodeTexImage"); t.image = bpy.data.images.load(os.path.join(TEX, fname), check_existing=True)
    t.projection = proj; t.projection_blend = blend
    nt.links.new(tc.outputs["Object"], mp.inputs["Vector"]); nt.links.new(mp.outputs["Vector"], t.inputs["Vector"])
    return t
def tone(nt, sock, hue=0.5, sat=1.0, val=1.0):
    h = nt.nodes.new("ShaderNodeHueSaturation"); h.inputs["Hue"].default_value = hue
    h.inputs["Saturation"].default_value = sat; h.inputs["Value"].default_value = val
    nt.links.new(sock, h.inputs["Color"]); return h.outputs["Color"]
def noise_bump(nt, b, scale=80, strength=0.05, dist=0.001):
    n = nt.nodes.new("ShaderNodeTexNoise"); n.inputs["Scale"].default_value = scale
    bp = nt.nodes.new("ShaderNodeBump"); bp.inputs["Strength"].default_value = strength; bp.inputs["Distance"].default_value = dist
    nt.links.new(n.outputs["Fac"], bp.inputs["Height"]); nt.links.new(bp.outputs["Normal"], b.inputs["Normal"])

def veneer(name="teak_veneer", gloss=0.32, coat=0.35, val=0.78, sat=0.72, tex="veneer.jpg", scale=0.9):
    m, nt, b = node_mat(name)
    t = img(nt, tex, scale, blend=0.15)
    nt.links.new(tone(nt, t.outputs["Color"], 0.5, sat, val), b.inputs["Base Color"])
    b.inputs["Roughness"].default_value = gloss; b.inputs["Coat Weight"].default_value = coat
    b.inputs["Coat Roughness"].default_value = 0.12
    return m
M_VEN = veneer("dark_diva_crown", 0.32, 0.4, 1.12, 1.0, "dark_diva_crown.jpg", (0.9, 0.9, 1.1))   # Dark Diva Crown, from the owner's sample (OHBF-607), book-matched
M_DESK = veneer("teak_desk", gloss=0.18, coat=1.0, val=0.82, sat=0.78)
M_BURL = veneer("burl_diva", 0.14, 1.0, 0.46, 0.9, "burl_diva.jpg", 0.75)          # the 9292 burl, polished to the Dark Diva colour      # French-polish look: the room's gloss is set here
def marble(name, fname, scale, rough, val=1.0, sat=1.0):
    m, nt, b = node_mat(name)
    t = img(nt, fname, scale, blend=0.1)
    nt.links.new(tone(nt, t.outputs["Color"], 0.5, sat, val), b.inputs["Base Color"])
    b.inputs["Roughness"].default_value = rough; b.inputs["Coat Weight"].default_value = 0.6; b.inputs["Coat Roughness"].default_value = 0.03
    return m
M_FLOOR = marble("taupe_marble", "taupe.jpg", 1.6, 0.12, 0.5, 1.05)          # the laid floor is a deep taupe-brown
M_WHITE = marble("white_marble", "white.jpg", 0.7, 0.1)
M_BEIGE = marble("beige_marble", "beige_marble.jpg", 1.1, 0.08, 1.0, 1.0)      # the bathroom stone (the owner's slab)
M_CHROME = None
def flat(name, col, rough=0.8, metal=0.0, bump=0.0, coat=0.0):
    m, nt, b = node_mat(name)
    b.inputs["Base Color"].default_value = (*col, 1); b.inputs["Roughness"].default_value = rough
    b.inputs["Metallic"].default_value = metal; b.inputs["Coat Weight"].default_value = coat
    if bump: noise_bump(nt, b, 120, bump, 0.0006)
    return m
M_PAINT = flat("cream_paint", (0.72, 0.64, 0.52), 0.86, bump=0.04)
M_CEIL = flat("ceiling_paint", (0.86, 0.83, 0.77), 0.9, bump=0.02)
M_BRASS = flat("brass", (0.80, 0.58, 0.28), 0.24, 1.0)
M_BRONZE = flat("bronze", (0.20, 0.14, 0.10), 0.35, 1.0)
M_IRON = flat("iron", (0.03, 0.03, 0.03), 0.45, 0.8)
M_MIRROR = flat("mirror", (0.92, 0.93, 0.93), 0.02, 1.0)
M_DARK = flat("plinth_dark", (0.05, 0.035, 0.028), 0.5)
M_TRIM = flat("light_trim", (0.02, 0.02, 0.02), 0.4, 0.5)
M_LINING = flat("cream_lining", (0.78, 0.70, 0.58), 0.95, bump=0.06)
M_AC = flat("ac_white", (0.86, 0.86, 0.84), 0.35)
def fabric(name, col, sheen=0.6, rough=0.95, scale=900):
    m, nt, b = node_mat(name)
    b.inputs["Base Color"].default_value = (*col, 1); b.inputs["Roughness"].default_value = rough
    b.inputs["Sheen Weight"].default_value = sheen; b.inputs["Sheen Roughness"].default_value = 0.4
    w = nt.nodes.new("ShaderNodeTexWave"); w.inputs["Scale"].default_value = scale; w.inputs["Distortion"].default_value = 3
    bp = nt.nodes.new("ShaderNodeBump"); bp.inputs["Strength"].default_value = 0.08
    nt.links.new(w.outputs["Fac"], bp.inputs["Height"]); nt.links.new(bp.outputs["Normal"], b.inputs["Normal"])
    return m
M_LINEN_TAUPE = fabric("linen_taupe", (0.34, 0.28, 0.22))
M_LINEN_WHITE = fabric("linen_white", (0.86, 0.84, 0.80), 0.8)
M_LINEN_IVORY = fabric("linen_ivory", (0.78, 0.73, 0.64), 0.8)
def sheer():
    m, nt, b = node_mat("sheer")
    b.inputs["Base Color"].default_value = (0.90, 0.87, 0.82, 1); b.inputs["Roughness"].default_value = 1.0
    b.inputs["Sheen Weight"].default_value = 0.8; b.inputs["Sheen Roughness"].default_value = 0.5; b.inputs["Specular IOR Level"].default_value = 0.0
    out = nt.nodes["Material Output"]
    tl = nt.nodes.new("ShaderNodeBsdfTranslucent"); tl.inputs["Color"].default_value = (0.95, 0.90, 0.82, 1)
    tp = nt.nodes.new("ShaderNodeBsdfTransparent")
    m1 = nt.nodes.new("ShaderNodeMixShader"); m1.inputs["Fac"].default_value = 0.45
    m2 = nt.nodes.new("ShaderNodeMixShader"); m2.inputs["Fac"].default_value = 0.38     # a sheer: the window shows through
    nt.links.new(b.outputs["BSDF"], m1.inputs[1]); nt.links.new(tl.outputs["BSDF"], m1.inputs[2])
    nt.links.new(m1.outputs["Shader"], m2.inputs[1]); nt.links.new(tp.outputs["BSDF"], m2.inputs[2])
    nt.links.new(m2.outputs["Shader"], out.inputs["Surface"])
    w = nt.nodes.new("ShaderNodeTexNoise"); w.inputs["Scale"].default_value = 900; bp = nt.nodes.new("ShaderNodeBump"); bp.inputs["Strength"].default_value = 0.05
    nt.links.new(w.outputs["Fac"], bp.inputs["Height"]); nt.links.new(bp.outputs["Normal"], b.inputs["Normal"])
    return m
M_SHEER = sheer()
def shade():
    m, nt, b = node_mat("lamp_shade")
    out = nt.nodes["Material Output"]; tr = nt.nodes.new("ShaderNodeBsdfTranslucent"); tr.inputs["Color"].default_value = (1.0, 0.86, 0.66, 1)
    mix = nt.nodes.new("ShaderNodeMixShader"); mix.inputs["Fac"].default_value = 0.6
    b.inputs["Base Color"].default_value = (0.86, 0.80, 0.68, 1); b.inputs["Roughness"].default_value = 0.95
    nt.links.new(b.outputs["BSDF"], mix.inputs[1]); nt.links.new(tr.outputs["BSDF"], mix.inputs[2]); nt.links.new(mix.outputs["Shader"], out.inputs["Surface"])
    return m
M_SHADE = shade()
def parchment():
    m, nt, b = node_mat("parchment_plaster")
    t = img(nt, "parchment.jpg", 2.2, blend=0.1)
    nt.links.new(tone(nt, t.outputs["Color"], 0.5, 0.62, 0.9), b.inputs["Base Color"])
    b.inputs["Roughness"].default_value = 0.42; b.inputs["Coat Weight"].default_value = 0.15; b.inputs["Coat Roughness"].default_value = 0.35
    noise_bump(nt, b, 14, 0.06, 0.002)                              # a trowelled, waxed plaster, not a flat paint
    return m
M_PARCH = parchment()
def glow(name, col, strength):
    m, nt, b = node_mat(name)
    b.inputs["Base Color"].default_value = (*col, 1); b.inputs["Emission Color"].default_value = (*col, 1)
    b.inputs["Emission Strength"].default_value = strength
    return m
M_STRIP = glow("cove_strip", (1.0, 0.55, 0.22), 2.2)
M_DISC = glow("spot_disc", (1.0, 0.80, 0.55), 12.0)
def night():
    m, nt, b = node_mat("night_sky")
    b.inputs["Base Color"].default_value = (0, 0, 0, 1); b.inputs["Roughness"].default_value = 1
    tc = nt.nodes.new("ShaderNodeTexCoord"); sep = nt.nodes.new("ShaderNodeSeparateXYZ"); ramp = nt.nodes.new("ShaderNodeValToRGB")
    nt.links.new(tc.outputs["Generated"], sep.inputs["Vector"]); nt.links.new(sep.outputs["Y"], ramp.inputs["Fac"])
    ramp.color_ramp.elements[0].position = 0.2; ramp.color_ramp.elements[0].color = (0.22, 0.12, 0.06, 1)    # a warm city glow low down
    ramp.color_ramp.elements[1].position = 0.7; ramp.color_ramp.elements[1].color = (0.012, 0.02, 0.05, 1)   # night above
    vor = nt.nodes.new("ShaderNodeTexVoronoi"); vor.inputs["Scale"].default_value = 60
    lr = nt.nodes.new("ShaderNodeValToRGB"); lr.color_ramp.elements[0].position = 0.0; lr.color_ramp.elements[0].color = (1.0, 0.75, 0.45, 1)
    lr.color_ramp.elements[1].position = 0.035; lr.color_ramp.elements[1].color = (0, 0, 0, 1)
    nt.links.new(tc.outputs["Generated"], vor.inputs["Vector"]); nt.links.new(vor.outputs["Distance"], lr.inputs["Fac"])
    mask = nt.nodes.new("ShaderNodeMath"); mask.operation = "LESS_THAN"; mask.inputs[1].default_value = 0.42
    nt.links.new(sep.outputs["Y"], mask.inputs[0])
    lights = nt.nodes.new("ShaderNodeMixRGB"); lights.blend_type = "MULTIPLY"; lights.inputs["Fac"].default_value = 1.0
    nt.links.new(lr.outputs["Color"], lights.inputs[1]); nt.links.new(mask.outputs["Value"], lights.inputs[2])
    add = nt.nodes.new("ShaderNodeMixRGB"); add.blend_type = "ADD"; add.inputs["Fac"].default_value = 1.0
    nt.links.new(ramp.outputs["Color"], add.inputs[1]); nt.links.new(lights.outputs["Color"], add.inputs[2])
    nt.links.new(add.outputs["Color"], b.inputs["Emission Color"]); b.inputs["Emission Strength"].default_value = 1.6
    return m
M_SKY = night()
BOOKS = [flat(f"book{i}", c, r) for i, (c, r) in enumerate([((0.30, 0.06, 0.05), 0.5), ((0.06, 0.13, 0.09), 0.55), ((0.06, 0.08, 0.16), 0.5),
         ((0.45, 0.32, 0.18), 0.6), ((0.62, 0.56, 0.44), 0.7), ((0.05, 0.04, 0.035), 0.45), ((0.35, 0.18, 0.08), 0.5), ((0.72, 0.66, 0.52), 0.75)])]

def setmat(o, m):
    if o.type == "MESH": o.data.materials.clear(); o.data.materials.append(m)

# ── the new pieces go in their own collection, beveled like real joinery ───────
DET = bpy.data.collections.new("detail"); sc.collection.children.link(DET)
def dbox(name, x0, s0, z0, x1, s1, z1, m):
    o = box(name, x0, s0, z0, x1, s1, z1, WALL, DET); setmat(o, m); return o
def bevel(o, w=0.003, seg=2):
    if o.type != "MESH": return
    b = o.modifiers.new("bevel", "BEVEL"); b.width = w; b.segments = seg; b.limit_method = "ANGLE"; b.harden_normals = False

# ── the existing pieces get their real finish ─────────────────────────────────
for o in list(sc.objects):
    if o.type != "MESH": continue
    n = o.name
    if n == "walls": setmat(o, M_PAINT)
    elif n == "floor": setmat(o, M_FLOOR)
    elif n == "ceiling": setmat(o, M_CEIL)
    elif n.startswith(("lin_", "door_")): setmat(o, M_VEN)
    elif n == "glass_win":
        mg, ntg, bg_ = node_mat("glass"); bg_.inputs["Transmission Weight"].default_value = 1.0; bg_.inputs["Roughness"].default_value = 0.0; bg_.inputs["IOR"].default_value = 1.45; setmat(o, mg)
    elif n in ("bed_base",): setmat(o, M_DARK)
    elif n in ("bed_frame", "bed_back", "table0", "table1", "partition_bed", "partition_desk", "drawers"): setmat(o, M_BURL)
    elif n.startswith("dr_pull"): setmat(o, M_BRASS)
    elif n.startswith("dr_gap") or n == "drawers_plinth": setmat(o, M_DARK)
    elif n == "tv":
        mt, ntt, bt = node_mat("tv_glass"); bt.inputs["Base Color"].default_value = (0.004, 0.004, 0.005, 1); bt.inputs["Roughness"].default_value = 0.04
        bt.inputs["Coat Weight"].default_value = 1.0; setmat(o, mt)
    elif n in ("mattress", "pillow0", "pillow1"): setmat(o, M_LINEN_WHITE)
    elif n == "duvet": setmat(o, M_LINEN_IVORY)
    elif n.startswith(("ped", "plinth", "modesty")): setmat(o, M_DESK)
    elif n.startswith("curtain_track") or n == "tieback": setmat(o, M_IRON)
    elif n == "curtain": bpy.data.objects.remove(o, do_unlink=True); continue
    elif n.startswith(("mirror_c", )) and n != "mirror_cg": setmat(o, M_BRONZE)
    elif n == "mirror_cg" or n.startswith("mirror_w"): setmat(o, M_MIRROR)
    elif n.endswith("_plinth") or n in ("skirt",): setmat(o, M_DARK)
    elif n.startswith(("wd", "tb", "hd_", "tun_s")) and ("_h0" in n or "_h1" in n or n in ("tb_track", "tb_runner", "hd_pivot")): setmat(o, M_BRASS)
    elif n in ("tun_back",): setmat(o, M_LINING)
    elif o.users_collection and o.users_collection[0].name == "furniture": setmat(o, M_VEN)
for o in FUR.objects: bevel(o)
for n_ in ("duvet", "pillow0", "pillow1"):
    o_ = sc.objects.get(n_)
    if o_: bpy.data.objects.remove(o_, do_unlink=True)
for n_, w_, sg_ in (("mattress", 0.035, 5), ("bed_frame", 0.02, 4)):
    o_ = sc.objects.get(n_)
    if o_: o_.modifiers.clear(); bevel(o_, w_, sg_)
def soft(name, x0, s0, z0, x1, s1, z1, m, w_=0.06, seg=6):
    o_ = box(name, x0, s0, z0, x1, s1, z1, WALL, FUR); setmat(o_, m); bevel(o_, w_, seg)
    for p_ in o_.data.polygons: p_.use_smooth = True
    return o_
bh = Lb - BT - 10
dv = soft("duvet", cx - bedW / 2 - 45, bedFoot - 45, 360, cx + bedW / 2 + 45, bh - 560, 615, M_LINEN_IVORY, 0.08, 7)
ss = dv.modifiers.new("sub", "SUBSURF"); ss.levels = 2; ss.render_levels = 3
tx = bpy.data.textures.new("wrinkle", "CLOUDS"); tx.noise_scale = 0.18
dp = dv.modifiers.new("disp", "DISPLACE"); dp.texture = tx; dp.strength = 0.012; dp.mid_level = 0.5
soft("duvet_fold", cx - bedW / 2 - 40, bh - 640, 600, cx + bedW / 2 + 40, bh - 520, 650, M_LINEN_WHITE, 0.05, 6)
soft("throw", cx - bedW / 2 - 55, bedFoot - 55, 560, cx + bedW / 2 + 55, bedFoot + 420, 640, M_LINEN_TAUPE, 0.05, 6)
for k, sg in enumerate((-1, 1)):
    soft(f"pillow_b{k}", cx + sg * 450 - 420, bh - 230, 590, cx + sg * 450 + 420, bh - 60, 1010, M_LINEN_WHITE, 0.085, 8).rotation_euler.x = 0
    soft(f"pillow_f{k}", cx + sg * 440 - 330, bh - 420, 590, cx + sg * 440 + 330, bh - 260, 860, M_LINEN_IVORY, 0.07, 8)

# ── plan numbers used below ────────────────────────────────────────────────────
Lb, xR, xLs, xLb, yS = BED["L"], BED["xR"], BED["xLs"], BED["xLb"], BED["yStep"]
d1s0, d1s1 = Lb - (D1["leaf"] + 2 * LIN), Lb
d2s1 = Lb - D2["corner"]; d2s0 = d2s1 - D2["open"]
OH = LEAF_H + LIN
STUDY = 280                                                      # the study wall unit's depth

# ── skirting: white marble, 4 in, on the bed wall and the left and right walls (not the study wall) ──
SK = 102
def skirt(name, x0, s0, x1, s1):
    o = dbox(name, x0, s0, 0, x1, s1, SK, M_WHITE); bevel(o, 0.003)
skirt("sk_left_a", xLs, STUDY, xLs + 15, yS)
skirt("sk_left_b", xLb, yS, xLb + 15, d1s0 - 102)
skirt("sk_bed", xLb + 15, Lb - 15, xR, Lb)
skirt("sk_right_a", xR - 15, STUDY, xR, d2s0 - 102)
skirt("sk_right_b", xR - 15, d2s1 + 102, xR, Lb - 15)
skirt("sk_dress_far", DR["x1"] - 15, DR["s0"] + WDd, DR["x1"], DR["s1"] - WDd)
# ── the floor border: a 5 in strip of the same white marble along every wall, the skirting standing on it ──
BW = 127
def border(name, x0, s0, x1, s1):
    o = dbox(name, x0, s0, 0.3, x1, s1, 1.4, M_WHITE)
    for p_ in o.data.polygons: p_.use_smooth = False
border("bd_study", xLs, 255, xR, 255 + BW)                              # in front of the study joinery
border("bd_left_a", xLs, 255 + BW, xLs + BW, yS)
border("bd_left_b", xLb, yS, xLb + BW, Lb - BW)
border("bd_left_step", xLb, yS - BW, xLs, yS)
border("bd_bed", xLb, Lb - BW, xR, Lb)
border("bd_right", xR - BW, 255 + BW, xR, Lb - BW)
border("bd_dress_far", DR["x1"] - BW, DR["s0"] + WDd, DR["x1"], DR["s1"] - WDd)

# ── the right wall: painted panel moulding, the rail carried on from the study counter, three brass lamps ──
MOUL, PRJ, STILE = 55, 24, 150
def frame(name, s0, s1, z0, z1, x=xR, depth=PRJ, w=MOUL, m=M_PAINT, face=-1):
    xs = sorted((x, x + face * depth))
    parts = [dbox(name + "b", xs[0], s0, z0, xs[1], s1, z0 + w, m), dbox(name + "t", xs[0], s0, z1 - w, xs[1], s1, z1, m),
             dbox(name + "l", xs[0], s0, z0, xs[1], s0 + w, z1, m), dbox(name + "r", xs[0], s1 - w, z0, xs[1], s1, z1, m)]
    for p in parts: bevel(p, 0.006, 3)
    return parts
run0, run1 = STUDY + 40, d2s0 - 102
pw = (run1 - run0 - 6 * STILE) / 5
panels = [(run0 + STILE + k * (pw + STILE), run0 + STILE + k * (pw + STILE) + pw) for k in range(5)]
nar = (d2s1 + 102 + 75, Lb - 15 - 75)
def lamp(name, x, s, z, face, arms=2, span=150):
    """A twin-arm wall lamp: brass back plate, arms, and a fabric shade over a warm bulb on each."""
    ux = face                                                      # direction out of the wall, in x (±1) or s (±2)
    def P3(dn, ds, dz):                                            # dn: out of the wall, ds: along it
        if abs(face) == 1: return P(x + ux * dn, s + ds, z + dz)
        return P(x + ds, s + (face / 2) * dn, z + dz)
    bpy.ops.mesh.primitive_cylinder_add(vertices=32, radius=0.045, depth=0.012, location=P3(6, 0, 0))
    bp = bpy.context.active_object; bp.name = name + "_plate"
    bp.rotation_euler = (0, math.pi / 2, 0) if abs(face) == 1 else (math.pi / 2, 0, 0); setmat(bp, M_BRASS)
    for k in range(arms):
        off = (k - (arms - 1) / 2) * 2 * span / max(arms - 1, 1) if arms > 1 else 0
        a0, a1 = Vector(P3(10, 0, 0)), Vector(P3(150, off, 60))
        mid = (a0 + a1) / 2; d = a1 - a0
        bpy.ops.mesh.primitive_cylinder_add(vertices=12, radius=0.007, depth=d.length, location=mid)
        arm = bpy.context.active_object; arm.name = f"{name}_arm{k}"; arm.rotation_euler = d.to_track_quat("Z", "Y").to_euler(); setmat(arm, M_BRASS)
        c = Vector(P3(150, off, 150))
        bpy.ops.mesh.primitive_cylinder_add(vertices=12, radius=0.012, depth=0.09, location=c - Vector((0, 0, 0.05)))
        cup = bpy.context.active_object; setmat(cup, M_BRASS)
        bpy.ops.mesh.primitive_cone_add(vertices=48, radius1=0.085, radius2=0.052, depth=0.13, end_fill_type="NOTHING", location=c + Vector((0, 0, 0.03)))
        sh = bpy.context.active_object; sh.name = f"{name}_shade{k}"; setmat(sh, M_SHADE)
        sol = sh.modifiers.new("t", "SOLIDIFY"); sol.thickness = 0.002
        ld = bpy.data.lights.new(f"{name}_bulb{k}", "POINT"); ld.shadow_soft_size = 0.02; ld.energy = 14
        warm(ld, 2600)
        lo = bpy.data.objects.new(f"{name}_bulb{k}", ld); sc.collection.objects.link(lo); lo.location = c + Vector((0, 0, 0.02))

def warm(ld, K):
    """Colour a light by its temperature (blackbody), Cycles node."""
    ld.use_nodes = True; nt = ld.node_tree
    em = nt.nodes.get("Emission"); bb = nt.nodes.new("ShaderNodeBlackbody"); bb.inputs["Temperature"].default_value = K
    nt.links.new(bb.outputs["Color"], em.inputs["Color"])

for k in (0, 2, 4):
    a, b = panels[k]; lamp(f"rw_lamp{k}", xR, (a + b) / 2, 1290, -1, 2, 130)
# the study's twin sconces, one on each pilaster
for i, x0 in enumerate((book, xP2)):
    lamp(f"st_sconce{i}", x0 + pil / 2, 320, 1290, 2, 2, 70)

# ── doors: a four-panel leaf, applied mouldings both faces, brass knob; casing with a crown on the room side ──
def dress_leaf(dname, w):
    d = sc.objects[dname]
    cols = 2 if w > 800 else 1
    st, br, lr, tr = 100, 220, 180, 120
    zl = 900                                                      # lock rail bottom
    pwid = (w - (cols + 1) * st) / cols
    for side, xoff in (("a", 0.0), ("b", -0.04)):
        sgn = 1 if side == "a" else -1
        for c_ in range(cols):
            y0 = (st + c_ * (pwid + st)) / 1000
            for (z0, z1) in ((br, zl), (zl + lr, LEAF_H - tr)):
                for (x0, x1, yy0, yy1, zz0, zz1) in (
                        (0, 0.018, y0, y0 + pwid / 1000, z0 / 1000, (z0 + 45) / 1000), (0, 0.018, y0, y0 + pwid / 1000, (z1 - 45) / 1000, z1 / 1000),
                        (0, 0.018, y0, y0 + 0.045, z0 / 1000, z1 / 1000), (0, 0.018, y0 + pwid / 1000 - 0.045, y0 + pwid / 1000, z0 / 1000, z1 / 1000)):
                    me = bpy.data.meshes.new("m"); X0, X1 = (xoff + sgn * x0, xoff + sgn * x1)
                    X0, X1 = sorted((X0, X1))
                    v = [(X0, yy0, zz0), (X1, yy0, zz0), (X1, yy1, zz0), (X0, yy1, zz0), (X0, yy0, zz1), (X1, yy0, zz1), (X1, yy1, zz1), (X0, yy1, zz1)]
                    me.from_pydata(v, [], [(0, 3, 2, 1), (4, 5, 6, 7), (0, 1, 5, 4), (1, 2, 6, 5), (2, 3, 7, 6), (3, 0, 4, 7)]); me.update()
                    ob = bpy.data.objects.new(f"{dname}_m{side}", me); DET.objects.link(ob); ob.parent = d; setmat(ob, M_VEN); bevel(ob, 0.004, 3)
        # knob on the lock stile
        bpy.ops.mesh.primitive_uv_sphere_add(segments=24, ring_count=12, radius=0.028, location=(0, 0, 0))
        kn = bpy.context.active_object; kn.parent = d; kn.location = (xoff + sgn * 0.05, (w - 60) / 1000, (zl + lr / 2) / 1000); kn.scale = (0.9, 1, 1)
        setmat(kn, M_BRASS)
    d.data.materials.clear(); d.data.materials.append(M_VEN); bevel(d, 0.003)
exec(compile(open(os.path.join(HERE, "joinery.py")).read(), "joinery.py", "exec"))    # the joinery at drawing depth

# ── the bed wall: parchment plaster, seamless, over the whole 15 ft 6 in wall, skirting to ceiling ──
pw_ = dbox("parchment_wall", xLb + 16, Lb - 21, SK, xR - 1, Lb - 15, H - 1, M_PARCH)

# ── the bed back (the owner's curved one) in the burl: a brass inlay line and a brass cap along its curve,
# a hidden warm strip on top washing up the parchment wall; the bedside tables get a brass edge ──
band("bb_inlay", bp, BT + 4, 1000, 1012, CLAY); setmat(sc.objects["bb_inlay"], M_BRASS)
band("bb_cap", bp, BT + 10, 1372, 1384, CLAY); setmat(sc.objects["bb_cap"], M_BRASS)
ld = bpy.data.lights.new("bb_glow", "AREA"); ld.shape = "RECTANGLE"; ld.size, ld.size_y = 2.2, 0.03; ld.energy = 55; warm(ld, 2600)
lo = bpy.data.objects.new("bb_glow", ld); sc.collection.objects.link(lo); lo.location = P(cx, Lb - 45, 1392); lo.rotation_euler = (math.radians(180 - 12), 0, 0)
lo.visible_camera = False
for i_, sg in enumerate((-1, 1)):
    ccx, ccs = cx + sg * bs, Lb - bR
    tr_ = bR - BT / 2 - 25                                           # the tables' radius (furnish.py)
    q = [(ccx + sg * (tr_ + 6) * math.sin(math.pi / 2 * k / 24), ccs + (tr_ + 6) * math.cos(math.pi / 2 * k / 24)) for k in range(25)]
    band(f"tb_edge{i_}", q, 8, 588, 602, CLAY); setmat(sc.objects[f"tb_edge{i_}"], M_BRASS)
# the partition: a brass inlay on both faces at the same height as the bed back's
band("pt_inlay_b", pside(1), pT + 4, 1000, 1012, CLAY); setmat(sc.objects["pt_inlay_b"], M_BRASS)
band("pt_inlay_d", pside(-1), pT + 4, 1000, 1012, CLAY); setmat(sc.objects["pt_inlay_d"], M_BRASS)
tvf = dbox("tv_frame", cx - 622, yP + pT / 2 - 2, 842, cx + 622, yP + pT / 2 + 40, 1553, M_DARK)

# ── the bathroom, as far as it is known: its stone, and the vanity (scheme C, AST-DR-021) on the door wall,
# between the door and the pier, facing into the room ─────────────────────────
M_CHROME = flat("chrome", (0.9, 0.9, 0.92), 0.06, 1.0)
M_BURL_DARK = veneer("burl_dark", 0.12, 1.0, 0.22, 0.75, "burl_diva.jpg", 0.75)                 # the 9292 burl, darkened
for o_ in list(sc.objects):
    if o_.type == "MESH" and o_.name == "floor": pass
bfl = dbox("bath_floor", BA["x0"], BA["s0"], 0.2, BA["x1"], BA["s1"], 1.2, M_BEIGE)
pxr = BA["x1"] - PIER["east"]; pxl = pxr - PIER["w"]
VX1 = pxl; VX0 = VX1 - 1524; VS1 = BA["s1"]; VS0 = VS1 - 610                            # 5 ft × 2 ft, against the pier
TOPZ, SLAB = 838, 38
# scheme C as the owner wants it read (their reference): the 3 ft marble bank is ONE stone block, floor to the
# 33 in top, standing 20 proud of the ends; its drawers show only as fine joints. Marble nowhere else: the two ends
# are the dark burl, 3 in lower, with their own veneer tops, floating over a shadow-gap kick.
bx0, bx1 = VX1 - 457 - 914, VX1 - 457; AXx = bx0 + 457; BF = VS0 - 20                    # the block's front, proud
blk = dbox("van_block", bx0, BF, 0, bx1, VS1, TOPZ, M_BEIGE); bevel(blk, 0.0025, 2)
def joint(name, x0_, z0_, x1_, z1_):
    dbox(name, x0_, BF - 0.6, z0_, x1_, BF + 2, z1_, M_DARK)
joint("van_j_h1", bx0 + 18, 576, bx1 - 18, 578.5)                                          # over the big drawer
joint("van_j_h2", bx0 + 18, 762, bx1 - 18, 764.5)                                          # under the top apron
joint("van_j_h0", bx0 + 18, 38, bx1 - 18, 40.5)
joint("van_j_v", AXx - 1.2, 578.5, AXx + 1.2, 762)                                         # the top pair splits on the tap line
for xx in (bx0 + 18, bx1 - 20.5): joint(f"van_j_s{xx:.0f}", xx, 38, xx + 2.5, 764.5)
ETOP = TOPZ - 76
for (x0_, x1_, nm) in ((bx1, VX1, "L"), (VX0, bx0, "R")):                                  # 1 ft 6 at the pier end, 6 in at the door end
    e = dbox(f"van_end{nm}", x0_ + 2, VS0, 150, x1_ - 2, VS1, ETOP - 22, M_BURL_DARK); bevel(e, 0.002, 2)
    t_ = dbox(f"van_etop{nm}", x0_ + 2, VS0 - 4, ETOP - 22, x1_ - 2, VS1, ETOP, M_BURL_DARK); bevel(t_, 0.006, 4)
    dbox(f"van_kick{nm}", x0_ + 2, VS0 + 90, 0, x1_ - 2, VS1, 150, M_DARK)
    bpy.ops.mesh.primitive_cylinder_add(vertices=32, radius=0.018, depth=0.01, location=P((x0_ + x1_) / 2, VS0 - 3, ETOP - 110))
    cp = bpy.context.active_object; cp.rotation_euler = (math.pi / 2, 0, 0); setmat(cp, M_CHROME)            # cup pull
# the vessel bowl on the block, on the tap line; the wall spout over it
bpy.ops.mesh.primitive_uv_sphere_add(segments=64, ring_count=32, radius=0.203, location=P(AXx, VS1 - 320, TOPZ + 126))
bowl = bpy.context.active_object; bowl.name = "van_bowl"; bowl.scale = (1, 1, 0.62)
bs_ = bmesh.new(); bs_.from_mesh(bowl.data)
bmesh.ops.bisect_plane(bs_, geom=bs_.verts[:] + bs_.edges[:] + bs_.faces[:], plane_co=(0, 0, 0.05), plane_no=(0, 0, 1), clear_outer=True)
bs_.to_mesh(bowl.data); bs_.free()
so_ = bowl.modifiers.new("t", "SOLIDIFY"); so_.thickness = 0.008
for p_ in bowl.data.polygons: p_.use_smooth = True
setmat(bowl, flat("ceramic", (0.93, 0.92, 0.89), 0.08, coat=0.6))
sp = dbox("van_spout", AXx - 12, VS1 - 170, 1150, AXx + 12, VS1, 1172, M_CHROME); bevel(sp, 0.008, 4)
bpy.ops.mesh.primitive_cylinder_add(vertices=32, radius=0.03, depth=0.008, location=P(AXx, VS1 - 4, 1161))
pl = bpy.context.active_object; pl.rotation_euler = (math.pi / 2, 0, 0); setmat(pl, M_CHROME)
bpy.ops.mesh.primitive_cylinder_add(vertices=32, radius=0.025, depth=0.03, location=P(AXx + 130, VS1 - 15, 1161))
hd_ = bpy.context.active_object; hd_.rotation_euler = (math.pi / 2, 0, 0); setmat(hd_, M_CHROME)            # the mixer
# the mirror (still to brief): the block's width, floating off the wall, a warm light behind it
mz0, mz1 = 1260, 2060
dbox("van_mirror", bx0, VS1 - 30, mz0, bx1, VS1 - 24, mz1, M_MIRROR)
ld = bpy.data.lights.new("van_halo", "AREA"); ld.size, ld.size_y = (bx1 - bx0 - 80) / 1000, 0.6; ld.shape = "RECTANGLE"; ld.energy = 30; warm(ld, 2700)
lo = bpy.data.objects.new("van_halo", ld); sc.collection.objects.link(lo); lo.location = P(AXx, VS1 - 34, (mz0 + mz1) / 2); lo.rotation_euler = (math.radians(-90), 0, 0)
lo.visible_camera = False; lo.visible_glossy = False
ld = bpy.data.lights.new("van_under", "AREA"); ld.size, ld.size_y = (bx1 - bx0 - 40) / 1000, 0.02; ld.shape = "RECTANGLE"; ld.energy = 18; warm(ld, 2700)
lo = bpy.data.objects.new("van_under", ld); sc.collection.objects.link(lo); lo.location = P(AXx, VS1 - 40, mz0 - 8)
lo.visible_camera = False
# the bathroom's light: soft, from the ceiling
ld = bpy.data.lights.new("bath_ceiling", "AREA"); ld.size, ld.size_y = 1.2, 0.8; ld.shape = "RECTANGLE"; ld.energy = 120; warm(ld, 2900)
lo = bpy.data.objects.new("bath_ceiling", ld); sc.collection.objects.link(lo); lo.location = P((BA["x0"] + BA["x1"]) / 2, (BA["s0"] + BA["s1"]) / 2, H - 20)

# ── left wall: the air conditioner, measured 3 ft 10 × 1 ft, on the painting's centre line ──
acs = 2299
ac = dbox("ac", xLs, acs - 584, 2240, xLs + 220, acs + 584, 2545, M_AC); bevel(ac, 0.02, 4)
for k in range(10): dbox(f"ac_l{k}", xLs + 205, acs - 540 + k * 4, 2250, xLs + 222, acs + 540, 2256 + k * 4, M_AC)

# ── the bookcase: books, some leaning, a stack or two ──────────────────────────
for z in (686, 890 + 25, 1160 + 25, 1430 + 25, 1700 + 25):
    top = min([zz for zz in (890, 1160, 1430, 1700, 2039) if zz > z + 10])
    x = 70 + rng.uniform(0, 40)
    while x < book - 80:
        if rng.random() < 0.08:                                     # a gap, or a small stack lying flat
            if rng.random() < 0.5:
                for q in range(rng.randint(2, 5)):
                    hh = rng.uniform(22, 38); d_ = rng.uniform(150, 210); w_ = rng.uniform(150, 230)
                    zz = z + q * 40; o = dbox(f"bk{x:.0f}{zz:.0f}", x, 20, zz, x + w_, 20 + d_, zz + hh, rng.choice(BOOKS)); bevel(o, 0.003, 2)
                x += 240
            else: x += rng.uniform(40, 120)
            continue
        w_ = rng.uniform(18, 48); h_ = min(rng.uniform(170, 265), top - z - 20); d_ = rng.uniform(140, 220)
        o = dbox(f"bk{x:.0f}{z:.0f}", x, 20, z, x + w_, 20 + d_, z + h_, rng.choice(BOOKS)); bevel(o, 0.004, 2)
        x += w_ + rng.uniform(0, 3)
# the bookcase strip light, under the head rail
ld = bpy.data.lights.new("book_strip", "AREA"); ld.shape = "RECTANGLE"; ld.size, ld.size_y = (book - 120) / 1000, 0.03; ld.energy = 35; warm(ld, 2700)
lo = bpy.data.objects.new("book_strip", ld); sc.collection.objects.link(lo); lo.location = P(book / 2, 120, 2025)

# ── the dressing room's coffered vault (the owner's photo): three coffers across, five along ──
cvw, crown = DOME["w"], DOME["crown"]; rise = crown - H
R = (cvw * cvw / 4 + rise * rise) / (2 * rise); th0 = math.asin(cvw / 2 / R)
vs = (DR["s0"] + DR["s1"]) / 2; zc = crown - R
def arc_pt(x, th, inset=0.0):
    rr = R - inset; return P(x, vs + rr * math.sin(th), zc + rr * math.cos(th))
def sweep_rib(name, x0, x1, th_a, th_b, depth, n=40, m=M_CEIL):
    """A strip of the vault between angles th_a..th_b and x0..x1, standing `depth` mm proud of it."""
    me = bpy.data.meshes.new(name); bm = bmesh.new(); rows = []
    for i in range(n + 1):
        th = th_a + (th_b - th_a) * i / n
        rows.append([bm.verts.new(arc_pt(x, th, dd)) for x in (x0, x1) for dd in (-2, depth)])
    for a, b in zip(rows, rows[1:]):
        for (i0, i1) in ((0, 1), (1, 3), (3, 2), (2, 0)):
            bm.faces.new((a[i0], a[i1], b[i1], b[i0]))
    for r in (rows[0], rows[-1]): bm.faces.new((r[0], r[1], r[3], r[2]))
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces); bm.to_mesh(me); bm.free()
    o = bpy.data.objects.new(name, me); DET.objects.link(o); setmat(o, m); return o
vx0, vx1 = DR["x0"], DR["x1"]
shell = sweep_rib("vault", vx0, vx1, -th0, th0, 6, 80, M_CEIL)
NA, NX, RIB = 3, 5, 90
bay = (vx1 - vx0) / NX
for k in range(NX + 1):                                               # ribs across the vault
    x = vx0 + k * bay; sweep_rib(f"vrib_x{k}", max(vx0, x - RIB / 2), min(vx1, x + RIB / 2), -th0, th0, 40)
for j in range(1, NA):                                                # ribs along it
    th = -th0 + 2 * th0 * j / NA; dth = (RIB / 2) / R
    sweep_rib(f"vrib_a{j}", vx0, vx1, th - dth, th + dth, 40, 6)
for k in range(NX):                                                   # a moulded frame inside every coffer
    for j in range(NA):
        xa, xb = vx0 + k * bay + RIB / 2 + 70, vx0 + (k + 1) * bay - RIB / 2 - 70
        ta = -th0 + 2 * th0 * j / NA + (RIB / 2 + 70) / R; tb = -th0 + 2 * th0 * (j + 1) / NA - (RIB / 2 + 70) / R
        w_ = 26 / R
        sweep_rib(f"vfr{k}{j}a", xa, xb, ta, ta + w_, 14, 4); sweep_rib(f"vfr{k}{j}b", xa, xb, tb - w_, tb, 14, 4)
        sweep_rib(f"vfr{k}{j}c", xa, xa + 26, ta, tb, 14, 30); sweep_rib(f"vfr{k}{j}d", xb - 26, xb, ta, tb, 14, 30)
for sgn in (-1, 1):                                                   # the springing: a band where the vault meets the flat ceiling
    s_edge = vs + sgn * cvw / 2
    dbox(f"v_spring{sgn}", vx0, min(s_edge, s_edge + sgn * 120), H - 60, vx1, max(s_edge, s_edge + sgn * 120), H, M_CEIL)
    # the vault's cove: a warm strip along each springing, washing up into the coffers
    ld = bpy.data.lights.new(f"v_cove{sgn}", "AREA"); ld.shape = "RECTANGLE"; ld.size, ld.size_y = (vx1 - vx0) / 1000, 0.03; ld.energy = float(os.environ.get("VCOVE", 70)); warm(ld, 2700)
    lo = bpy.data.objects.new(f"v_cove{sgn}", ld); sc.collection.objects.link(lo); lo.location = P((vx0 + vx1) / 2, s_edge - sgn * 170, H - 150)
    lo.rotation_euler = (math.radians(180 + sgn * 35), 0, 0)

# the light the vault throws back down: a soft fill under the crown, seen by nothing but the room
ld = bpy.data.lights.new("v_fill", "AREA"); ld.shape = "RECTANGLE"; ld.size, ld.size_y = (vx1 - vx0 - 300) / 1000, 1.0
ld.energy = float(os.environ.get("VFILL", 140)); warm(ld, 2800)
lo = bpy.data.objects.new("v_fill", ld); sc.collection.objects.link(lo); lo.location = P((vx0 + vx1) / 2, vs, H + 120)
lo.visible_camera = False; lo.visible_glossy = False

# ── the bedroom's ceiling: a cove line 6 in off three walls, and the spots already cut ──
def cove(name, x0, s0, x1, s1, power_per_m=28):
    L_ = math.hypot(x1 - x0, s1 - s0) / 1000
    dbox(name + "_strip", min(x0, x1) - (0 if x0 != x1 else 12), min(s0, s1) - (0 if s0 != s1 else 12), H - 4,
         max(x0, x1) + (0 if x0 != x1 else 12), max(s0, s1) + (0 if s0 != s1 else 12), H, M_STRIP)
    ld = bpy.data.lights.new(name, "AREA"); ld.shape = "RECTANGLE"
    ld.size, ld.size_y = (L_, 0.024) if s0 == s1 else (0.024, L_); ld.energy = power_per_m * L_; warm(ld, 2700)
    lo = bpy.data.objects.new(name, ld); sc.collection.objects.link(lo); lo.location = P((x0 + x1) / 2, (s0 + s1) / 2, H - 8)
OFF = 152
cove("cove_left_a", xLs + OFF, STUDY + 200, xLs + OFF, yS - 50)
cove("cove_left_b", xLb + OFF, yS + 50, xLb + OFF, Lb - OFF)
cove("cove_bed", xLb + OFF, Lb - OFF, xR - OFF, Lb - OFF)
cove("cove_right", xR - OFF, STUDY + 200, xR - OFF, Lb - OFF)
for o in [o for o in sc.objects if o.parent and o.parent.name == "ceiling" and o.type == "MESH" and o.name.startswith("Cylinder")]:
    setmat(o, M_TRIM)
    loc = o.matrix_world.translation.copy()
    bpy.ops.mesh.primitive_cylinder_add(vertices=24, radius=0.022, depth=0.003, location=loc - Vector((0, 0, 0.003)))
    setmat(bpy.context.active_object, M_DISC)
    ld = bpy.data.lights.new("spot", "SPOT"); ld.spot_size = math.radians(55); ld.spot_blend = 0.7; ld.shadow_soft_size = 0.015; ld.energy = 9; warm(ld, 2700)
    so = bpy.data.objects.new("spot", ld); sc.collection.objects.link(so); so.location = loc - Vector((0, 0, 0.01))

# the dressing room also gets its wardrobes' warm glow where the tunnel bay opens, and the tunnel a light
ld = bpy.data.lights.new("tunnel", "AREA"); ld.size = 0.6; ld.energy = 25; warm(ld, 2700)
lo = bpy.data.objects.new("tunnel", ld); sc.collection.objects.link(lo); lo.location = P((tun["x0"] + tun["x1"]) / 2, (tun["s0"] + tun["s1"]) / 2, TUN["h"] - 40)
for o in sc.objects:
    if o.type == "MESH" and o.name.startswith(("tb_side", "tb_top")): setmat(o, M_LINING)

# the window: dusk outside, a frame
bpy.ops.mesh.primitive_plane_add(size=1, location=P((WIN["x0"] + WIN["x1"]) / 2, -T - 900, (WIN["sill"] + WIN["head"]) / 2))
sky = bpy.context.active_object; sky.scale = (4, 3, 1); sky.rotation_euler = (math.pi / 2, 0, 0); setmat(sky, M_SKY)
for (a, b, c_, d_) in ((WIN["x0"], WIN["x0"] + 50, WIN["sill"], WIN["head"]), (WIN["x1"] - 50, WIN["x1"], WIN["sill"], WIN["head"]),
                       (WIN["x0"], WIN["x1"], WIN["sill"], WIN["sill"] + 50), (WIN["x0"], WIN["x1"], WIN["head"] - 50, WIN["head"]),
                       ((WIN["x0"] + WIN["x1"]) / 2 - 20, (WIN["x0"] + WIN["x1"]) / 2 + 20, WIN["sill"], WIN["head"])):
    dbox(f"wf{a}{c_}", a, -T / 2 - 22, c_, b, -T / 2 + 22, d_, M_BRONZE)

# ── the curtain: one sheer, floor to ceiling, gathered to the left of the window and pinched at the tieback ──
def curtain():
    """The sheer, open: pinch-pleated on a slim bronze track, gathered in a stack to the left of the window and held
    at the tieback by the black volute hook — so the window shows."""
    me = bpy.data.meshes.new("curtain"); bm = bmesh.new()
    xa, xb = WIN["x0"] - 470, WIN["x0"] + 110; zt, zb = H - 55, 12; ztie = 1000
    NXc, NZc = 150, 80; npl = 12
    rng_c = random.Random(5); dep = [rng_c.uniform(0.8, 1.2) for _ in range(npl + 2)]
    rows = []
    for j in range(NZc + 1):
        z = zb + (zt - zb) * j / NZc; t = (z - zb) / (zt - zb)
        pinch = 1 - 0.55 * math.exp(-((z - ztie) / 380) ** 2)            # gathered in at the tieback
        belly = 0.25 * math.exp(-((z - (ztie - 380)) / 300) ** 2)         # the fabric blousing out just below it
        row = []
        for i in range(NXc + 1):
            u = i / NXc; k = u * npl; kk = int(k)
            x = xa + (xb - xa) * (u * pinch) + (xb - xa) * (1 - pinch) * 0.08
            a_ = 55 * dep[kk] * (0.8 + 0.4 * (1 - t)) * (0.7 + 0.3 * pinch)
            sv = 390 + a_ * math.sin(2 * math.pi * (k + 0.15 * math.sin(z / 400 + k))) + 60 * belly
            if t > 0.94: sv = 390 + 26 * math.sin(2 * math.pi * k)
            row.append(bm.verts.new(P(x, sv, z)))
        rows.append(row)
    for a_, b_ in zip(rows, rows[1:]):
        for i in range(NXc): bm.faces.new((a_[i], a_[i + 1], b_[i + 1], b_[i]))
    bm.to_mesh(me); bm.free()
    o = bpy.data.objects.new("curtain", me); DET.objects.link(o); setmat(o, M_SHEER)
    so = o.modifiers.new("t", "SOLIDIFY"); so.thickness = 0.0012
    sd = o.modifiers.new("s", "SUBSURF"); sd.levels = 1; sd.render_levels = 1
    for p_ in me.polygons: p_.use_smooth = True
    tr = dbox("curtain_track2", xa - 40, 365, H - 40, xR - 12, 405, H - 20, M_BRONZE); bevel(tr, 0.004, 2)
    for o_ in [o for o in sc.objects if o.name.startswith("curtain_track") and o.name != "curtain_track2"]: bpy.data.objects.remove(o_, do_unlink=True)
    tb = sc.objects.get("tieback")
    if tb: tb.location = (0, 0, 0)
curtain()

# ── world and render ───────────────────────────────────────────────────────────
w = sc.world; bg = w.node_tree.nodes["Background"]; bg.inputs["Color"].default_value = (0.01, 0.012, 0.02, 1); bg.inputs["Strength"].default_value = 0.3
sc.render.engine = "CYCLES"
cy = sc.cycles
prefs = bpy.context.preferences.addons["cycles"].preferences
try:
    prefs.compute_device_type = "METAL"; prefs.get_devices()
    DEV = os.environ.get("DEVICES", "gpu")
    for dv in prefs.devices: dv.use = (DEV == "both") or (DEV == "gpu" and dv.type != "CPU") or (DEV == "cpu" and dv.type == "CPU")
    cy.device = "CPU" if DEV == "cpu" else "GPU"
except Exception as e: print("GPU?", e)
cy.samples = SPP; cy.use_adaptive_sampling = True; cy.adaptive_threshold = 0.02
cy.use_denoising = True
try: cy.denoiser = "OPENIMAGEDENOISE"
except Exception: pass
cy.max_bounces = 8; cy.diffuse_bounces = 4; cy.glossy_bounces = 4; cy.transmission_bounces = 8; cy.transparent_max_bounces = 8
cy.sample_clamp_indirect = 6.0; cy.caustics_reflective = False; cy.caustics_refractive = False
try: cy.use_light_tree = True
except Exception: pass
sc.view_settings.view_transform = "AgX"
try: sc.view_settings.look = "AgX - Medium High Contrast"
except Exception: pass
sc.view_settings.exposure = float(os.environ.get("EXPOSURE", -1.5))
try:                                                                  # white-balanced for warm light, as a camera would be
    sc.view_settings.use_white_balance = True
    sc.view_settings.white_balance_temperature = float(os.environ.get("WB", 3700))
except Exception as e: print("white balance?", e)

EYE_R = 1600; LENS_R = float(os.environ.get("LENS", 18))
VIEWS = {  # name: camera (x, s[, z]), looking at (x, s, z)
    "room": ((1200, 5000), (2600, 600, 1250)),
    "study": ((3300, 2900), (1500, 0, 1250)),
    "desk": ((3900, 700, 1350), (2000, 2300, 700)),
    "right": ((700, 1800), (4547, 3300, 1300)),
    "bed": ((3300, 3350), (2100, 5766, 900)),
    "tvside": ((1100, 4250), (2337, 2450, 1100)),
    "vanity": ((6250, 1150, 1400), (6600, 2718, 950)),
    "door": ((2600, 3500), (-177, 5200, 1250)),
    "dress": ((4900, 4450), (8400, 4356, 1500)),
    "vault": ((5100, 4356, 1450), (7600, 4356, 3000)),
    "mirror": ((6200, 4500), (8536, 4356, 1300)),
    "d2close": ((3300, 4650, 1500), (4547, 4650, 1600)),
    "d1close": ((1500, 5000, 1450), (-177, 5250, 1500)),
    "pilaster": ((2000, 1100, 1700), (1609, 280, 1900)),
    "deskclose": ((2600, 700, 1250), (1900, 1500, 600)),
    "deskfront": ((1500, 420, 1050), (2350, 1600, 480)),
    "d2head": ((3300, 4650, 1700), (4547, 4650, 2450)),
    "window": ((3000, 1900, 1550), (3950, 0, 1450)),
}
def shoot(name):
    cp, tp = VIEWS[name]
    c_ = cam("r_" + name, LENS_R); c_.location = P(cp[0], cp[1], cp[2] if len(cp) > 2 else EYE_R); aim(c_, P(*tp))
    sc.camera = c_; sc.render.filepath = os.path.join(OUTR, name + ".png"); sc.render.image_settings.file_format = "PNG"
    bpy.ops.render.render(write_still=True)

TOUR = [  # name, camera (x, s[, z]), looking at (x, s, z), hold frames, what happens while it holds
    ("in", (300, 5200), (2337, 2600, 1150), 20, None),
    ("tv", (1100, 4250), (2337, 2450, 1100), 26, None),
    ("bed", (3300, 3350), (2100, 5766, 900), 30, None),
    ("right", (1500, 3550), (4547, 3200, 1400), 22, None),
    (None, (4150, 3150), (4150, 1000, 1300), 0, None),
    ("study", (4100, 1900), (1600, 0, 1300), 26, None),
    ("window", (3600, 1500), (3950, 0, 1450), 20, None),
    ("book", (1500, 1150), (600, 0, 1300), 20, None),
    ("desk", (3300, 780, 1300), (2337, 2000, 720), 26, None),
    (None, (650, 1300), (650, 3000, 1300), 0, None),
    (None, (700, 3350), (2500, 4300, 1300), 0, None),
    ("d2", (3450, 4650), (5400, 4650, 1400), 34, "d2"),
    ("dress", (5100, 4450), (8400, 4356, 1500), 26, None),
    ("vault", (5900, 4356, 1500), (7700, 4356, 3000), 26, None),
    ("mirror", (6800, 4400), (8536, 4356, 1300), 20, None),
    ("mech", (6900, 3950), (8100, 5550, 1200), 150, "mech"),
    ("tunnel", (7700, 4700), (8100, 7800, 1250), 26, None),
    (None, (6000, 4000), (5158, 2400, 1400), 0, None),
    ("d3", (5158, 3600), (5158, 1500, 1400), 34, "d3"),
    (None, (5158, 2250), (5300, 800, 1300), 0, None),
    ("vanity", (6250, 1150, 1400), (6600, 2718, 950), 40, None),
]
FPM = float(os.environ.get("FPM", 15))                                # frames per metre walked: the scroll's pace
def animate_real():
    walk = cam("walk_r", LENS_R)
    tgt = bpy.data.objects.new("look_r", None); sc.collection.objects.link(tgt)
    con = walk.constraints.new("TRACK_TO"); con.target = tgt; con.track_axis = "TRACK_NEGATIVE_Z"; con.up_axis = "UP_Y"
    f, prev, marks, acts = 1, None, {}, {}
    for name, cp, tp, hold, act in TOUR:
        pos = Vector(P(cp[0], cp[1], cp[2] if len(cp) > 2 else EYE_R))
        if prev is not None:
            d = (pos - prev[0]).length + 0.45 * (Vector(P(*tp)) - prev[1]).length
            f += max(22, int(d * FPM))
        walk.location = pos; tgt.location = P(*tp)
        walk.keyframe_insert("location", frame=f); tgt.keyframe_insert("location", frame=f)
        if name: marks[name] = f
        if hold:
            if act: acts[act] = (f, f + hold)
            f += hold
            walk.keyframe_insert("location", frame=f); tgt.keyframe_insert("location", frame=f)
        prev = (pos, Vector(P(*tp)))
    end = f
    d = sc.objects["door_d2"]; a, b = acts["d2"]; rot = d["open"]
    d.rotation_euler.z = 0; d.keyframe_insert("rotation_euler", index=2, frame=1); d.keyframe_insert("rotation_euler", index=2, frame=a + 4)
    d.rotation_euler.z = rot; d.keyframe_insert("rotation_euler", index=2, frame=b - 2)
    d = sc.objects["door_d3"]; a, b = acts["d3"]; rot = d["open"]
    d.rotation_euler.z = 0; d.keyframe_insert("rotation_euler", index=2, frame=1); d.keyframe_insert("rotation_euler", index=2, frame=a + 4)
    d.rotation_euler.z = rot; d.keyframe_insert("rotation_euler", index=2, frame=b - 2)
    a, b = acts["mech"]; seg = [10, 38, 30, 14, 50]; c = [a]
    for x in seg: c.append(c[-1] + x)
    for fr in range(1, end + 1):
        if fr < c[1]: al, sl, sw = 0, 0, 0
        elif fr < c[2]: al, sl, sw = ease((fr - c[1]) / seg[1]), 0, 0
        elif fr < c[3]: al, sl, sw = 1, ease((fr - c[2]) / seg[2]), 0
        elif fr < c[4]: al, sl, sw = 1, 1, 0
        else: al, sl, sw = 1, 1, ease((fr - c[4]) / seg[4])
        if fr in (1, c[1], c[5], end) or c[1] <= fr <= c[5]:
            pose_pair(math.radians(90) * al, SLIDE * sl); hd.rotation_euler.z = math.radians(90) * sw
            for o in (LA, LB): o.keyframe_insert("location", frame=fr); o.keyframe_insert("rotation_euler", frame=fr)
            hd.keyframe_insert("rotation_euler", index=2, frame=fr)
    sc.frame_start, sc.frame_end = 1, end; sc.camera = walk
    # the camera opens up as it walks into the darker dressing room, as an eye would
    vs_ = sc.view_settings; a, b = acts["d2"]; e0 = vs_.exposure
    vs_.exposure = e0; vs_.keyframe_insert("exposure", frame=a)
    vs_.exposure = e0 + float(os.environ.get("DRESS_EV", 0.6)); vs_.keyframe_insert("exposure", frame=marks["dress"])
    return marks, end

def bake_modifiers():
    """Apply every modifier once, so an animation re-syncs nothing but the camera, the doors and the mirror's view."""
    dg = bpy.context.evaluated_depsgraph_get(); n = 0
    for o in list(sc.objects):
        if o.type == "MESH" and o.modifiers:
            me = bpy.data.meshes.new_from_object(o.evaluated_get(dg)); o.modifiers.clear(); o.data = me; n += 1
    print("baked", n, "objects", flush=True)

if MODER == "frames":
    bake_modifiers()
    sc.render.use_persistent_data = True
    print("device", cy.device, [(d.name, d.type, d.use) for d in prefs.devices], flush=True)
    marks, end = animate_real()
    json.dump({"frames": end, "stops": marks}, open(os.path.join(OUTR, "tour.json"), "w"))
    print("TOUR", end, marks, flush=True)
    sc.render.resolution_x, sc.render.resolution_y = int(os.environ.get("RX", 1280)), int(os.environ.get("RY", 720))
    ims = sc.render.image_settings; ims.file_format = "WEBP"; ims.quality = int(os.environ.get("Q", 74)); ims.color_mode = "RGB"
    sc.render.filepath = os.path.join(OUTR, "frames", "w")
    sc.render.use_overwrite = False; sc.render.use_placeholder = True          # resumable
    if os.environ.get("FSTART"): sc.frame_start = int(os.environ["FSTART"])
    if os.environ.get("FEND"): sc.frame_end = int(os.environ["FEND"])
    bpy.ops.render.render(animation=True)

if MODER == "stops":                                                    # a quick look at every stop, to check the framing
    marks, end = animate_real()
    sc.render.resolution_x, sc.render.resolution_y = 960, 540
    for k, f in marks.items():
        sc.frame_set(f + 8); sc.render.filepath = os.path.join(OUTR, "stops", f"{f:04d}_{k}.jpg")
        sc.render.image_settings.file_format = "JPEG"; bpy.ops.render.render(write_still=True)

if MODER in ("still", "stills"):
    sc.render.resolution_x, sc.render.resolution_y = int(os.environ.get("RX", 1280)), int(os.environ.get("RY", 720))
    for d in ("door_d2",): sc.objects[d].rotation_euler.z = sc.objects[d]["open"]
    for n in ([ONLY] if ONLY else VIEWS): shoot(n)
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(OUTR, "real.blend"))
print("DONE", MODER)
