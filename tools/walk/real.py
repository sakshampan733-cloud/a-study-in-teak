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
KILL = ("chair_", "bed_back", "table0", "table1", "partition_", "drawers", "dr_gap", "dr_pull", "tv",
        "glass_bwin", "lbl_", "painting", "desk_top", "desk_frieze", "sconce", "dome", "L_cor")
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

def rough_var(nt, b, amount=0.12, scale=5.0, detail=8.0):
    """Roughness that wanders a little from place to place, as a polished or painted surface really does."""
    n = nt.nodes.new("ShaderNodeTexNoise"); n.inputs["Scale"].default_value = scale; n.inputs["Detail"].default_value = detail
    mr = nt.nodes.new("ShaderNodeMapRange"); base = b.inputs["Roughness"].default_value
    mr.inputs["To Min"].default_value = max(0.0, base - amount); mr.inputs["To Max"].default_value = min(1.0, base + amount)
    nt.links.new(n.outputs["Fac"], mr.inputs["Value"]); nt.links.new(mr.outputs["Result"], b.inputs["Roughness"])

def veneer(name="teak_veneer", gloss=0.32, coat=0.35, val=0.78, sat=0.72, tex="veneer.jpg", scale=0.9, hue=0.5):
    m, nt, b = node_mat(name)
    t = img(nt, tex, scale, blend=0.15)
    nt.links.new(tone(nt, t.outputs["Color"], hue, sat, val), b.inputs["Base Color"])
    b.inputs["Roughness"].default_value = gloss; b.inputs["Coat Weight"].default_value = coat
    b.inputs["Coat Roughness"].default_value = 0.12
    rough_var(nt, b, 0.07, 9.0)
    return m
M_VEN = veneer("dark_diva_crown", 0.32, 0.4, 1.12, 1.0, "dark_diva_crown.jpg", (0.9, 0.9, 1.1))   # Dark Diva Crown, from the owner's sample (OHBF-607), book-matched
M_DESK = veneer("teak_desk", gloss=0.18, coat=1.0, val=0.82, sat=0.78)
M_BURL = veneer("burl_diva", 0.14, 1.0, 0.46, 0.9, "burl_diva.jpg", 0.75)          # the 9292 burl, polished to the Dark Diva colour      # French-polish look: the room's gloss is set here
def marble(name, fname, scale, rough, val=1.0, sat=1.0):
    m, nt, b = node_mat(name)
    t = img(nt, fname, scale, blend=0.1)
    nt.links.new(tone(nt, t.outputs["Color"], 0.5, sat, val), b.inputs["Base Color"])
    b.inputs["Roughness"].default_value = rough; b.inputs["Coat Weight"].default_value = 0.6; b.inputs["Coat Roughness"].default_value = 0.03
    rough_var(nt, b, 0.05, 3.0)
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
    if rough > 0.5 and not metal: rough_var(nt, b, 0.06, 2.5, 6.0)
    return m
M_PAINT = flat("cream_paint", (0.72, 0.64, 0.52), 0.86, bump=0.04)
M_CEIL = flat("ceiling_paint", (0.86, 0.83, 0.77), 0.9, bump=0.02)
# the room's own ceiling (owner, 7 Oct, refs ceiling-gloss-ref-*-owner): high-gloss, reflective like lacquer — not glitter.
# A clear coat over the cream, and a very slow wave in the surface so the windows' reflections ripple softly, as
# hand-applied gloss does; the corridor and the dressing room's vault stay matte
def ceil_gloss():
    m, nt, b = node_mat("ceiling_gloss")
    b.inputs["Base Color"].default_value = (0.84, 0.80, 0.73, 1); b.inputs["Roughness"].default_value = 0.10
    b.inputs["Coat Weight"].default_value = 1.0; b.inputs["Coat Roughness"].default_value = 0.025
    rough_var(nt, b, 0.04, 1.5, 3.0)
    n = nt.nodes.new("ShaderNodeTexNoise"); n.inputs["Scale"].default_value = 1.2; n.inputs["Detail"].default_value = 2
    bp = nt.nodes.new("ShaderNodeBump"); bp.inputs["Strength"].default_value = 0.12; bp.inputs["Distance"].default_value = 0.004
    nt.links.new(n.outputs["Fac"], bp.inputs["Height"]); nt.links.new(bp.outputs["Normal"], b.inputs["Normal"]); nt.links.new(bp.outputs["Normal"], b.inputs["Coat Normal"])
    return m
M_CEIL_GLOSS = ceil_gloss()
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
    m2 = nt.nodes.new("ShaderNodeMixShader"); m2.inputs["Fac"].default_value = 0.55     # a sheer: the window shows through
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
    b.inputs["Base Color"].default_value = (0.80, 0.72, 0.58, 1); b.inputs["Roughness"].default_value = 0.95
    b.inputs["Emission Color"].default_value = (1.0, 0.70, 0.36, 1); b.inputs["Emission Strength"].default_value = 0.55
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
M_BULB = glow("bulb", (1.0, 0.72, 0.40), 30.0)
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
    elif n == "ceiling": setmat(o, M_CEIL_GLOSS)
    elif n.startswith(("lin_", "door_")): setmat(o, M_VEN)
    elif n == "glass_win":
        mg, ntg, bg_ = node_mat("glass"); bg_.inputs["Transmission Weight"].default_value = 1.0; bg_.inputs["Roughness"].default_value = 0.0; bg_.inputs["IOR"].default_value = 1.45; setmat(o, mg)
    elif n in ("bed_base",): setmat(o, M_DARK)
    elif n == "cor_floor": setmat(o, M_FLOOR)
    elif n.startswith("cor_wall"): setmat(o, M_PAINT)
    elif n == "cor_ceil": setmat(o, M_CEIL)
    elif n == "bed_frame": setmat(o, M_BURL)
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
# no border along the study joinery: only the left, bed and right walls have the white strip (the owner, 1 Oct)
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
def pleated_shade(name, centre, h=0.15, r0=0.092, r1=0.060, npl=48):
    """An empire shade, pleated: a cone whose wall waves, bound with a thin trim at top and bottom."""
    bm = bmesh.new(); rows = 10; ring = []
    for j in range(rows + 1):
        t = j / rows; r = r0 + (r1 - r0) * t; z = -h / 2 + h * t
        ring.append([bm.verts.new((math.cos(2 * math.pi * i / 96) * (r + 0.0028 * math.sin(2 * math.pi * i / 96 * npl)),
                                    math.sin(2 * math.pi * i / 96) * (r + 0.0028 * math.sin(2 * math.pi * i / 96 * npl)), z)) for i in range(96)])
    for a_, b_ in zip(ring, ring[1:]):
        for i in range(96): bm.faces.new((a_[i], a_[(i + 1) % 96], b_[(i + 1) % 96], b_[i]))
    me = bpy.data.meshes.new(name); bm.to_mesh(me); bm.free()
    for p_ in me.polygons: p_.use_smooth = True
    o = bpy.data.objects.new(name, me); sc.collection.objects.link(o); o.location = centre; setmat(o, M_SHADE)
    so = o.modifiers.new("t", "SOLIDIFY"); so.thickness = 0.0016
    for z_ in (-h / 2, h / 2):
        bpy.ops.mesh.primitive_torus_add(major_radius=r0 if z_ < 0 else r1, minor_radius=0.0018, location=centre + Vector((0, 0, z_)))
        setmat(bpy.context.active_object, M_SHADE)
    return o
M_LAMPRIM = flat("lamp_rim", (0.55, 0.55, 0.57), 0.22, 1.0)                 # the shades' thin silver rims
M_PORCELAIN = flat("lamp_porcelain", (0.86, 0.83, 0.77), 0.12, 0.0, 0.0, 0.6)
def tube(name, pts, r, m):
    cv = bpy.data.curves.new(name, "CURVE"); cv.dimensions = "3D"; cv.bevel_depth = r; cv.bevel_resolution = 3; cv.use_fill_caps = True
    spl = cv.splines.new("POLY"); spl.points.add(len(pts) - 1)
    for i, q in enumerate(pts): spl.points[i].co = (*q, 1)
    o = bpy.data.objects.new(name, cv); sc.collection.objects.link(o); o.data.materials.append(m); return o
def bez(p0, p1, p2, p3, n=24):
    return [tuple((1 - t) ** 3 * a + 3 * (1 - t) ** 2 * t * b + 3 * (1 - t) * t * t * c + t ** 3 * d for a, b, c, d in zip(p0, p1, p2, p3)) for t in [i / n for i in range(n + 1)]]
def drum_shade(name, centre, h=0.12, r0=0.070, r1=0.052):
    """A tapered drum of white fabric, open top and bottom, a thin silver rim round each edge (the owner's lamp)."""
    bm = bmesh.new(); ring = []
    for j in range(7):
        t = j / 6; r = r0 + (r1 - r0) * t; z = -h / 2 + h * t
        ring.append([bm.verts.new((math.cos(2 * math.pi * i / 72) * r, math.sin(2 * math.pi * i / 72) * r, z)) for i in range(72)])
    for a_, b_ in zip(ring, ring[1:]):
        for i in range(72): bm.faces.new((a_[i], a_[(i + 1) % 72], b_[(i + 1) % 72], b_[i]))
    me = bpy.data.meshes.new(name); bm.to_mesh(me); bm.free()
    for p_ in me.polygons: p_.use_smooth = True
    o = bpy.data.objects.new(name, me); sc.collection.objects.link(o); o.location = centre; setmat(o, M_SHADE)
    so = o.modifiers.new("t", "SOLIDIFY"); so.thickness = 0.0015
    for z_, r_ in ((-h / 2, r0), (h / 2, r1)):
        bpy.ops.mesh.primitive_torus_add(major_radius=r_ + 0.0008, minor_radius=0.0022, major_segments=72, location=centre + Vector((0, 0, z_)))
        setmat(bpy.context.active_object, M_LAMPRIM)
    return o
def lamp(name, x, s, z, face, arms=2, span=130):
    """The owner's wall lamp (assets/refs/wall-lamp-ref-owner.jpg): an elongated octagonal brass back plate with a boss and a
    small drop; two brass arms that dip below the plate and sweep up to a brass cup and a white porcelain urn; tapered white
    drum shades rimmed in silver; fine brass scroll tendrils with little flowers rising between the arms. 2700 K."""
    def P3(dn, ds, dz):                                            # dn: out of the wall, ds: along it, dz: up — in mm
        if abs(face) == 1: return P(x + face * dn, s + ds, z + dz)
        return P(x + ds, s + (face / 2) * dn, z + dz)
    # the back plate: an elongated octagon, 70 × 120, 12 thick
    oc = [(-20, -60), (20, -60), (35, -38), (35, 38), (20, 60), (-20, 60), (-35, 38), (-35, -38)]
    bm = bmesh.new(); fr = [bm.verts.new(P3(0, a, b)) for a, b in oc]; bk = [bm.verts.new(P3(12, a * 0.9, b * 0.9)) for a, b in oc]
    bm.faces.new(fr[::-1]); bm.faces.new(bk)
    for i in range(8): bm.faces.new((fr[i], fr[(i + 1) % 8], bk[(i + 1) % 8], bk[i]))
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces[:])
    me = bpy.data.meshes.new(name + "_plate"); bm.to_mesh(me); bm.free()
    pl = bpy.data.objects.new(name + "_plate", me); sc.collection.objects.link(pl); setmat(pl, M_BRASS); bevel(pl, 0.002, 2)
    rot = (0, math.pi / 2, 0) if abs(face) == 1 else (math.pi / 2, 0, 0)
    bpy.ops.mesh.primitive_cylinder_add(vertices=32, radius=0.017, depth=0.016, location=P3(18, 0, 0))
    bo = bpy.context.active_object; bo.name = name + "_boss"; bo.rotation_euler = rot; setmat(bo, M_BRASS); bevel(bo, 0.003, 3)
    bpy.ops.mesh.primitive_uv_sphere_add(segments=16, ring_count=8, radius=0.008, location=P3(14, 0, -68)); setmat(bpy.context.active_object, M_BRASS)
    for k in range(arms):
        off = (k - (arms - 1) / 2) * 2 * span / max(arms - 1, 1) if arms > 1 else 0
        sg = 1 if off >= 0 else -1
        # the arm: out of the boss, down and outward, then sweeping up to the cup
        tube(f"{name}_arm{k}", [P3(*q) for q in bez((24, 0, -4), (70, off * 0.25, -95), (120, off * 1.05, -100), (125, off, -8))], 0.0055, M_BRASS)
        tube(f"{name}_scroll{k}", [P3(*q) for q in bez((16, sg * 10, 30), (22, sg * 30, 90), (26, sg * 6, 150), (30, sg * 40, 170), 20)], 0.0022, M_BRASS)
        bpy.ops.mesh.primitive_uv_sphere_add(segments=12, ring_count=6, radius=0.007, location=P3(22, sg * 24, 98)); fl = bpy.context.active_object
        fl.scale = (1, 1, 0.5) if abs(face) != 1 else (0.5, 1, 1); setmat(fl, M_BRASS)
        c = Vector(P3(125, off, 0))
        bpy.ops.mesh.primitive_cylinder_add(vertices=32, radius=0.022, depth=0.006, location=c + Vector((0, 0, -0.005))); setmat(bpy.context.active_object, M_BRASS)
        bpy.ops.mesh.primitive_uv_sphere_add(segments=32, ring_count=16, radius=0.021, location=c + Vector((0, 0, 0.024)))
        urn = bpy.context.active_object; urn.scale = (1, 1, 1.15); setmat(urn, M_PORCELAIN)
        for p_ in urn.data.polygons: p_.use_smooth = True
        bpy.ops.mesh.primitive_cylinder_add(vertices=24, radius=0.011, depth=0.012, location=c + Vector((0, 0, 0.052))); setmat(bpy.context.active_object, M_BRASS)
        drum_shade(f"{name}_shade{k}", c + Vector((0, 0, 0.118)))
        bpy.ops.mesh.primitive_uv_sphere_add(segments=24, ring_count=12, radius=0.016, location=c + Vector((0, 0, 0.098)))
        bulb = bpy.context.active_object; setmat(bulb, M_BULB)
        ld = bpy.data.lights.new(f"{name}_bulb{k}", "POINT"); ld.shadow_soft_size = 0.02; ld.energy = 14
        warm(ld, 2700)                                          # the lamps: 2700 K, warmer than the coves and spots (owner, 7 Oct)
        lo = bpy.data.objects.new(f"{name}_bulb{k}", ld); sc.collection.objects.link(lo); lo.location = c + Vector((0, 0, 0.10))

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
# the wardrobes: three bays open and fitted out to AST-DR-048, lit backs, hammered brass handles (owner, 7 Oct)
exec(compile(open(os.path.join(HERE, "wardrobe2.py")).read(), "wardrobe2.py", "exec"))

# ── the bed wall: parchment plaster, seamless, over the whole 15 ft 6 in wall, skirting to ceiling ──
pw_ = dbox("parchment_wall", xLb + 16, Lb - 21, SK, xR - 1, Lb - 15, H - 1, M_PARCH)

# (the bed back and the partition are out: the owner is deciding what goes there)
# the corridor outside the front door: lit, with the same marble and paint, so the tour can start there
ld = bpy.data.lights.new("corl_main", "AREA"); ld.shape = "RECTANGLE"; ld.size, ld.size_y = 1.6, 0.9; ld.energy = 140; warm(ld, 2800)
lo = bpy.data.objects.new("corl_main", ld); sc.collection.objects.link(lo); lo.location = P(xLb - T - 1400, 5250, H - 30)
ld = bpy.data.lights.new("corl_fill", "AREA"); ld.shape = "RECTANGLE"; ld.size, ld.size_y = 1.0, 0.6; ld.energy = 40; warm(ld, 2800)
lo = bpy.data.objects.new("corl_fill", ld); sc.collection.objects.link(lo); lo.location = P(xLb - T - 2400, 5250, H - 30)
for o_ in [o for o in sc.objects if o.name in ("L_study", "L_bedz")]: pass

# ── the bathroom, as far as it is known: its stone, and the vanity (scheme C, AST-DR-021) on the door wall,
# between the door and the pier, facing into the room ─────────────────────────
M_CHROME = flat("chrome", (0.9, 0.9, 0.92), 0.06, 1.0)
M_BURL_DARK = veneer("burl_dark", 0.07, 1.0, 0.2, 1.45, "burl_diva.jpg", 0.75, hue=0.475)      # the 9292 burl, polished dark and RED, as the owner's vanity photo (8 Oct)
for o_ in list(sc.objects):
    if o_.type == "MESH" and o_.name == "floor": pass
bfl = dbox("bath_floor", BA["x0"], BA["s0"], 0.2, BA["x1"], BA["s1"], 1.2, M_BEIGE)
pxr = BA["x1"] - PIER["east"]; pxl = pxr - PIER["w"]
VX1 = pxl; VX0 = VX1 - 1524; VS1 = BA["s1"]; VS0 = VS1 - 610                            # 5 ft × 2 ft, against the pier
TOPZ, SLAB = 838, 38
# scheme C rev 5 (AST-DR-021, owner 8 Oct): the 3 ft bank is the marble again — top, mitred strip, face frame and every
# drawer front, read as one stone block with fine joints — but it stops 152 off the floor, level with the two dark red
# burl pull-outs: a floor drain is under it. The whole row hangs on the wall; nothing stands on the floor.
bx0, bx1 = VX1 - 457 - 914, VX1 - 457; AXx = bx0 + 457; BF = VS0 - 25                    # the bank's front, 25 proud of the ends
BANK0 = 152
blk = dbox("van_block", bx0, BF, BANK0, bx1, VS1, TOPZ, M_BEIGE); bevel(blk, 0.0025, 2)
def joint(name, x0_, z0_, x1_, z1_):
    dbox(name, x0_, BF - 0.6, z0_, x1_, BF + 2, z1_, M_DARK)
joint("van_j_h0", bx0 + 18, 190, bx1 - 18, 192.5)                                          # under the big drawer
joint("van_j_h1", bx0 + 18, 566, bx1 - 18, 568.5)                                          # over the big drawer
joint("van_j_h2", bx0 + 18, 591, bx1 - 18, 593.5)                                          # under the top pair
joint("van_j_h3", bx0 + 18, 760, bx1 - 18, 762.5)                                          # under the mitred strip
joint("van_j_v", AXx - 1.2, 593.5, AXx + 1.2, 760)                                         # the top pair splits on the tap line
for xx in (bx0 + 18, bx1 - 20.5): joint(f"van_j_s{xx:.0f}", xx, 190, xx + 2.5, 762.5)
ETOP = 800
for (x0_, x1_, nm) in ((bx1, VX1, "L"), (VX0, bx0, "R")):                                  # 1 ft 6 at the pier end, 6 in at the door end
    e = dbox(f"van_end{nm}", x0_ + 2, VS0, BANK0, x1_ - 2, VS1, ETOP - 22, M_BURL_DARK); bevel(e, 0.002, 2)
    t_ = dbox(f"van_etop{nm}", x0_ + 2, VS0 - 4, ETOP - 22, x1_ - 2, VS1, ETOP, M_BURL_DARK); bevel(t_, 0.006, 4)
    for xg in (x0_ + 2, x1_ - 4):                                                          # the pull-out's front, its joints
        dbox(f"van_ej{nm}{xg:.0f}", xg, VS0 - 0.6, BANK0 + 3, xg + 2, VS0 + 2, ETOP - 25, M_DARK)
    bpy.ops.mesh.primitive_cylinder_add(vertices=32, radius=0.018, depth=0.01, location=P((x0_ + x1_) / 2, VS0 - 3, ETOP - 110))
    cp = bpy.context.active_object; cp.rotation_euler = (math.pi / 2, 0, 0); setmat(cp, M_CHROME)            # cup pull
bpy.ops.mesh.primitive_cylinder_add(vertices=48, radius=0.06, depth=0.004, location=P(AXx, VS0 + 260, 1.6))
setmat(bpy.context.active_object, M_CHROME); bpy.context.active_object.name = "van_drain"      # the floor drain the bank stops short of
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
# the mirror (owner, 8 Oct): a mini version of the dressing room's tri-fold (AST-DR-027) — the same thin hammered-brass
# frames, plain glass, the wings at 45° — small: 2 ft 6 in tall, 1 ft 4½ in across the centre, hung over the tap.
MCW, MWW, MH, MZ0, MFR, MT, WANG = 420.0, 160.0, 760.0, 1250.0, 15.0, 20.0, math.radians(45)   # smaller, thinner frames (owner, 8 Oct)
def lbox(name, x0_, x1_, y0_, y1_, z0_, z1_, m, par, bev=0.0):
    me = bpy.data.meshes.new(name); bm = bmesh.new(); bmesh.ops.create_cube(bm, size=1.0); bm.to_mesh(me); bm.free()
    o = bpy.data.objects.new(name, me); sc.collection.objects.link(o); setmat(o, m)
    o.scale = ((x1_ - x0_) / 1000, (y1_ - y0_) / 1000, (z1_ - z0_) / 1000); o.location = ((x0_ + x1_) / 2000, (y0_ + y1_) / 2000, (z0_ + z1_) / 2000)
    o.parent = par
    if bev: bv = o.modifiers.new("ease", "BEVEL"); bv.width = bev; bv.segments = 3; bv.limit_method = "ANGLE"
    return o
def mpanel(tag, x0_, x1_, par):                      # frame pieces are named van_mirror_fr*: wardrobe2.py dresses them in hammered brass
    lbox(f"{tag}_glass", x0_ + MFR - 6, x1_ - MFR + 6, 4, 10, MFR - 6, MH - MFR + 6, M_MIRROR, par)
    lbox(f"{tag}_back", x0_ + 2, x1_ - 2, 0, 4, 2, MH - 2, M_DARK, par)
    for nm, (a_, b_, c_, d_) in {"l": (x0_, x0_ + MFR, 0, MH), "r": (x1_ - MFR, x1_, 0, MH), "b": (x0_ + MFR, x1_ - MFR, 0, MFR), "t": (x0_ + MFR, x1_ - MFR, MH - MFR, MH)}.items():
        lbox(f"van_mirror_fr_{tag}{nm}", a_, b_, 0, MT, c_, d_, M_BRASS, par, 0.003)
mc = bpy.data.objects.new("van_mirror", None); sc.collection.objects.link(mc); mc.location = P(AXx, VS1 - 18, MZ0)
mpanel("c", -MCW / 2, MCW / 2, mc)
for sx in (1, -1):
    hw = bpy.data.objects.new(f"van_mirror_hinge{sx}", None); sc.collection.objects.link(hw); hw.parent = mc
    hw.location = (sx * MCW / 2000, MT / 1000, 0); hw.rotation_euler = (0, 0, sx * WANG)
    mpanel(f"w{sx}", 0 if sx > 0 else -MWW, MWW if sx > 0 else 0, hw)
    for zh in (110, MH / 2, MH - 110):                                                          # the hinges: small brass knuckles
        bpy.ops.mesh.primitive_cylinder_add(vertices=16, radius=0.005, depth=0.05, location=(0, 0, 0)); kn = bpy.context.active_object
        kn.parent = hw; kn.location = (0, -0.003, zh / 1000); setmat(kn, M_BRASS); kn.name = f"van_mirror_fr_knuckle{sx}{zh:.0f}"
# the bathroom's marble on the pier as well (the owner): a skin on its three faces
pz0, pz1 = VS1 - PIER["out"], VS1
dbox("bath_pier_w", pxl - 10, pz0, 0, pxl, pz1, H, M_BEIGE); dbox("bath_pier_n", pxl - 10, pz0 - 10, 0, pxr + 10, pz0, H, M_BEIGE)
dbox("bath_pier_e", pxr, pz0, 0, pxr + 10, pz1, H, M_BEIGE)
# the rest of the bathroom — WC wall and niches, glass, the shower and its dropped ceiling, the tub, the owner's lights
exec(compile(open(os.path.join(HERE, "bathroom.py")).read(), "bathroom.py", "exec"))

# ── left wall: the air conditioner, measured 3 ft 10 × 1 ft, on the painting's centre line ──
acs = 2299
ac = dbox("ac", xLs, acs - 584, 2240, xLs + 220, acs + 584, 2545, M_AC); bevel(ac, 0.02, 4)
for k in range(10): dbox(f"ac_l{k}", xLs + 205, acs - 540 + k * 4, 2250, xLs + 222, acs + 540, 2256 + k * 4, M_AC)

# ── the bookcase: a real shelf — books of every height and thickness, some leaning or lying flat, a few objects ──
def jacket():
    """One material for every book. Each book carries a 'tone' (0–1) that picks its colour from a muted library
    palette — leather, cloth, paper jackets — and sets of volumes share a tone. The spine (the face toward the room)
    gets what spines have: a title running down it, a small mark at the foot, gilt rules on the leather ones."""
    m, nt, b = node_mat("book_jacket")
    at = nt.nodes.new("ShaderNodeAttribute"); at.attribute_type = "OBJECT"; at.attribute_name = "tone"
    ramp = nt.nodes.new("ShaderNodeValToRGB"); ramp.color_ramp.interpolation = "CONSTANT"
    cols = [(0.20, 0.035, 0.03), (0.035, 0.085, 0.05), (0.03, 0.045, 0.10), (0.30, 0.17, 0.08), (0.03, 0.025, 0.02),   # leather
            (0.16, 0.19, 0.22), (0.19, 0.18, 0.10), (0.22, 0.07, 0.06), (0.27, 0.26, 0.24),                               # cloth
            (0.66, 0.61, 0.50), (0.74, 0.72, 0.66), (0.50, 0.43, 0.32), (0.48, 0.22, 0.07), (0.11, 0.22, 0.22)]         # paper jackets
    for i, c in enumerate(cols):
        if i >= len(ramp.color_ramp.elements): ramp.color_ramp.elements.new(i / len(cols))
        ramp.color_ramp.elements[i].position = i / len(cols); ramp.color_ramp.elements[i].color = (*c, 1)
    nt.links.new(at.outputs["Fac"], ramp.inputs["Fac"])
    # a little fading and dirt: the colour wanders over the cover
    nz = nt.nodes.new("ShaderNodeTexNoise"); nz.inputs["Scale"].default_value = 18
    fade = nt.nodes.new("ShaderNodeMixRGB"); fade.blend_type = "MULTIPLY"; fade.inputs["Fac"].default_value = 0.25
    nt.links.new(ramp.outputs["Color"], fade.inputs["Color1"]); nt.links.new(nz.outputs["Color"], fade.inputs["Color2"])
    gen = nt.nodes.new("ShaderNodeTexCoord"); sep = nt.nodes.new("ShaderNodeSeparateXYZ"); nt.links.new(gen.outputs["Generated"], sep.inputs["Vector"])
    def mm(lo, hi, src):                                   # 1 where lo < src < hi
        a_ = nt.nodes.new("ShaderNodeMath"); a_.operation = "GREATER_THAN"; a_.inputs[1].default_value = lo; nt.links.new(src, a_.inputs[0])
        b_ = nt.nodes.new("ShaderNodeMath"); b_.operation = "LESS_THAN"; b_.inputs[1].default_value = hi; nt.links.new(src, b_.inputs[0])
        c_ = nt.nodes.new("ShaderNodeMath"); c_.operation = "MULTIPLY"; nt.links.new(a_.outputs[0], c_.inputs[0]); nt.links.new(b_.outputs[0], c_.inputs[1])
        return c_.outputs[0]
    def mul(x, y):
        c_ = nt.nodes.new("ShaderNodeMath"); c_.operation = "MULTIPLY"; nt.links.new(x, c_.inputs[0]); nt.links.new(y, c_.inputs[1]); return c_.outputs[0]
    def add(x, y):
        c_ = nt.nodes.new("ShaderNodeMath"); c_.operation = "MAXIMUM"; nt.links.new(x, c_.inputs[0]); nt.links.new(y, c_.inputs[1]); return c_.outputs[0]
    # the title: a column down the middle of the spine, broken into letters by a fine wave
    wv = nt.nodes.new("ShaderNodeTexWave"); wv.wave_type = "BANDS"; wv.bands_direction = "Z"; wv.inputs["Scale"].default_value = 70
    wv.inputs["Distortion"].default_value = 9; wv.inputs["Detail"].default_value = 4
    gl = nt.nodes.new("ShaderNodeMath"); gl.operation = "GREATER_THAN"; gl.inputs[1].default_value = 0.62; nt.links.new(wv.outputs["Fac"], gl.inputs[0])
    title = mul(mul(mm(0.30, 0.70, sep.outputs["X"]), mm(0.34, 0.80, sep.outputs["Z"])), gl.outputs[0])
    mark = mul(mm(0.32, 0.68, sep.outputs["X"]), mm(0.05, 0.085, sep.outputs["Z"]))
    rules = add(add(mm(0.10, 0.112, sep.outputs["Z"]), mm(0.13, 0.138, sep.outputs["Z"])), add(mm(0.87, 0.882, sep.outputs["Z"]), mm(0.90, 0.908, sep.outputs["Z"])))
    leather = nt.nodes.new("ShaderNodeMath"); leather.operation = "LESS_THAN"; leather.inputs[1].default_value = 5 / 14; nt.links.new(at.outputs["Fac"], leather.inputs[0])
    ink_m = add(add(title, mark), mul(rules, leather.outputs[0]))
    # only on the spine: the face looking into the room (Blender −Y)
    geo = nt.nodes.new("ShaderNodeNewGeometry"); sp2 = nt.nodes.new("ShaderNodeSeparateXYZ"); nt.links.new(geo.outputs["Normal"], sp2.inputs["Vector"])
    spine = nt.nodes.new("ShaderNodeMath"); spine.operation = "LESS_THAN"; spine.inputs[1].default_value = -0.7; nt.links.new(sp2.outputs["Y"], spine.inputs[0])
    ink_m = mul(ink_m, spine.outputs[0])
    # gilt on dark books, black on light ones
    bw = nt.nodes.new("ShaderNodeRGBToBW"); nt.links.new(ramp.outputs["Color"], bw.inputs["Color"])
    light = nt.nodes.new("ShaderNodeMath"); light.operation = "GREATER_THAN"; light.inputs[1].default_value = 0.3; nt.links.new(bw.outputs["Val"], light.inputs[0])
    ink = nt.nodes.new("ShaderNodeMixRGB"); ink.inputs["Color1"].default_value = (0.62, 0.45, 0.16, 1); ink.inputs["Color2"].default_value = (0.04, 0.035, 0.03, 1)
    nt.links.new(light.outputs[0], ink.inputs["Fac"])
    col = nt.nodes.new("ShaderNodeMixRGB"); nt.links.new(fade.outputs["Color"], col.inputs["Color1"]); nt.links.new(ink.outputs["Color"], col.inputs["Color2"])
    nt.links.new(ink_m, col.inputs["Fac"]); nt.links.new(col.outputs["Color"], b.inputs["Base Color"])
    # finish: leather polished, cloth matt, jackets a soft sheen; gilt is metal
    rmap = nt.nodes.new("ShaderNodeMapRange"); rmap.inputs["From Min"].default_value = 0; rmap.inputs["From Max"].default_value = 1
    rmap.inputs["To Min"].default_value = 0.38; rmap.inputs["To Max"].default_value = 0.72; nt.links.new(at.outputs["Fac"], rmap.inputs["Value"])
    met = mul(mul(ink_m, leather.outputs[0]), ink_m)
    nt.links.new(rmap.outputs["Result"], b.inputs["Roughness"]); nt.links.new(met, b.inputs["Metallic"])
    cl = nt.nodes.new("ShaderNodeTexNoise"); cl.inputs["Scale"].default_value = 700
    bp = nt.nodes.new("ShaderNodeBump"); bp.inputs["Strength"].default_value = 0.08; bp.inputs["Distance"].default_value = 0.0002
    nt.links.new(cl.outputs["Fac"], bp.inputs["Height"]); nt.links.new(bp.outputs["Normal"], b.inputs["Normal"])
    return m
def pageblock():
    m, nt, b = node_mat("book_pages")
    b.inputs["Base Color"].default_value = (0.76, 0.70, 0.56, 1); b.inputs["Roughness"].default_value = 0.85
    wv = nt.nodes.new("ShaderNodeTexWave"); wv.wave_type = "BANDS"; wv.bands_direction = "X"; wv.inputs["Scale"].default_value = 600
    bp = nt.nodes.new("ShaderNodeBump"); bp.inputs["Strength"].default_value = 0.15; bp.inputs["Distance"].default_value = 0.0002
    nt.links.new(wv.outputs["Fac"], bp.inputs["Height"]); nt.links.new(bp.outputs["Normal"], b.inputs["Normal"])
    return m
M_JACKET = jacket()
M_PAGEBLOCK = pageblock()
M_OBJ_CERAMIC = flat("shelf_ceramic", (0.82, 0.80, 0.74), 0.15, coat=0.5)
def pivot_rot(o, pivot_mm, rx=0.0, ry=0.0, rz=0.0):
    pv = Vector(P(*pivot_mm)); o.data.transform(__import__("mathutils").Matrix.Translation(-pv)); o.location = pv; o.rotation_euler = (rx, ry, rz)
def book_obj(name, x0, s0, z0, w, d, h, tone):
    """A hardback as it is made: two boards and a spine wrapped round a page block set 3 mm inside them."""
    bm = bmesh.new(); bt = min(2.6, w * 0.12)
    def part(a0, b0, c0, a1, b1, c1, mi):
        r = bmesh.ops.create_cube(bm, size=1.0)
        for v in r["verts"]:
            v.co.x = (x0 + (a0 if v.co.x < 0 else a1)) / 1000; v.co.y = -(s0 + (b0 if v.co.y < 0 else b1)) / 1000; v.co.z = (z0 + (c0 if v.co.z < 0 else c1)) / 1000
        for f in {f for v in r["verts"] for f in v.link_faces}: f.material_index = mi
    part(0, 0, 0, bt, d, h, 0); part(w - bt, 0, 0, w, d, h, 0)                         # the boards
    part(bt, d - 3.0, 0, w - bt, d, h, 0)                                              # the spine, at the front
    part(bt - 0.2, 3, 3, w - bt + 0.2, d - 3.0, h - 3, 1)                              # the pages, set in
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    me = bpy.data.meshes.new(name); bm.to_mesh(me); bm.free()
    o = bpy.data.objects.new(name, me); DET.objects.link(o)                  # in room coordinates, like dbox, so pivot_rot works
    me.materials.append(M_JACKET); me.materials.append(M_PAGEBLOCK); o["tone"] = tone
    bv = o.modifiers.new("bevel", "BEVEL"); bv.width = 0.0009; bv.segments = 2; bv.limit_method = "ANGLE"
    return o
bookx = {}
for z in (686, 890 + 25, 1160 + 25, 1430 + 25, 1700 + 25):
    top = min([zz for zz in (890, 1160, 1430, 1700, 2039) if zz > z + 10]); room_h = top - z - 15
    x = 70 + rng.uniform(0, 30); nb = 0; setn = 0; set_tone = set_h = set_w = set_d = 0
    while x < book - 90:
        r_ = rng.random()
        if r_ < 0.06:                                               # a small stack lying flat
            n_ = rng.randint(2, 5); w_ = rng.uniform(170, 240); d_ = rng.uniform(150, 215); zz = z
            for q in range(n_):
                hh = rng.uniform(20, 42); xo = rng.uniform(-6, 6)
                o = dbox(f"bks{x:.0f}{zz:.0f}", x + xo, 22 + rng.uniform(-4, 4), zz, x + xo + w_ - q * 4, 22 + d_, zz + hh, M_JACKET)
                o["tone"] = rng.random(); bevel(o, 0.002, 2); pivot_rot(o, (x + w_ / 2, 22 + d_ / 2, zz), 0, 0, rng.uniform(-0.05, 0.05)); zz += hh
            if rng.random() < 0.6 and zz + 90 < top:                 # an object on top of the stack
                bpy.ops.mesh.primitive_cylinder_add(vertices=32, radius=0.03, depth=0.07, location=P(x + w_ / 2, 22 + d_ / 2, zz + 38))
                setmat(bpy.context.active_object, M_BRASS)
            x += w_ + 10; continue
        if r_ < 0.10 and room_h > 230:                              # an object: a vase, a frame, a brass bowl
            kind = rng.choice(["vase", "frame", "bowl"]); ox = x + 60
            if kind == "vase":
                bpy.ops.mesh.primitive_uv_sphere_add(segments=32, ring_count=16, radius=0.055, location=P(ox, 110, z + 75))
                v_ = bpy.context.active_object; v_.scale = (1, 1, 1.3); setmat(v_, M_OBJ_CERAMIC)
                bpy.ops.mesh.primitive_cylinder_add(vertices=24, radius=0.022, depth=0.08, location=P(ox, 110, z + 175)); setmat(bpy.context.active_object, M_OBJ_CERAMIC)
            elif kind == "frame":
                o = dbox(f"fr{x:.0f}{z}", ox - 70, 150, z, ox + 70, 160, z + 180, M_BRASS); bevel(o, 0.003, 2)
                pivot_rot(o, (ox, 155, z), -0.18, 0, 0)
            else:
                bpy.ops.mesh.primitive_cone_add(vertices=40, radius1=0.05, radius2=0.085, depth=0.06, location=P(ox, 120, z + 32)); setmat(bpy.context.active_object, M_BRASS)
            x += 150; continue
        if r_ < 0.14: x += rng.uniform(40, 130); continue          # a gap
        if setn <= 0:                                                 # start a new run: a set of volumes, or a few odd books
            setn = rng.choice([1, 1, 2, 3, 4, 6, 8]); set_tone = rng.random()
            set_h = min(rng.choice([rng.uniform(178, 205), rng.uniform(205, 240), rng.uniform(235, 280)]), room_h)
            set_w = rng.choice([rng.uniform(18, 28), rng.uniform(26, 40), rng.uniform(36, 55)]); set_d = rng.uniform(150, 230)
        btone = min(0.999, max(0.0, set_tone + (rng.uniform(-0.03, 0.03) if setn > 1 else 0)))
        w_ = set_w * rng.uniform(0.92, 1.08); h_ = min(set_h * rng.uniform(0.985, 1.0), room_h); d_ = set_d * rng.uniform(0.97, 1.0)
        front = STUDY - 12 - rng.uniform(0, 14); y0 = max(22, front - d_)                 # spines near the shelf's front edge
        o = book_obj(f"bk{x:.0f}{z:.0f}", x, y0, z, w_, d_, h_, btone); setn -= 1
        if rng.random() < 0.07 and nb:                                # a leaning book: rests against its neighbour
            pivot_rot(o, (x + w_ / 2, y0 + d_ / 2, z), 0, rng.choice([-1, 1]) * rng.uniform(0.08, 0.2), 0); x += w_ + 22; setn = 0
        else: x += w_ + rng.uniform(0.3, 2.0)
        nb += 1
# the bookcase strip light, under the head rail
ld = bpy.data.lights.new("book_strip", "AREA"); ld.shape = "RECTANGLE"; ld.size, ld.size_y = (book - 120) / 1000, 0.03; ld.energy = 35; warm(ld, 3000)
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
    ld = bpy.data.lights.new(f"v_cove{sgn}", "AREA"); ld.shape = "RECTANGLE"; ld.size, ld.size_y = (vx1 - vx0) / 1000, 0.03; ld.energy = float(os.environ.get("VCOVE", 70)); warm(ld, 3000)
    lo = bpy.data.objects.new(f"v_cove{sgn}", ld); sc.collection.objects.link(lo); lo.location = P((vx0 + vx1) / 2, s_edge - sgn * 170, H - 150)
    lo.rotation_euler = (math.radians(180 + sgn * 35), 0, 0)

# the light the vault throws back down: a soft fill under the crown, seen by nothing but the room
ld = bpy.data.lights.new("v_fill", "AREA"); ld.shape = "RECTANGLE"; ld.size, ld.size_y = (vx1 - vx0 - 300) / 1000, 1.0
ld.energy = float(os.environ.get("VFILL", 140)); warm(ld, 3000)
lo = bpy.data.objects.new("v_fill", ld); sc.collection.objects.link(lo); lo.location = P((vx0 + vx1) / 2, vs, H + 120)
lo.visible_camera = False; lo.visible_glossy = False

# the owner's dressing lights (7 Oct): a FOCUS light (a recessed spot, 3000 K) in every coffer of the middle column down the
# vault, and in all three coffers of the row over the mirror — seven in all; the coves along the springings stay, and a
# cove over the bathroom door (where the left run's fourth cupboard would be) is added with the bedroom's coves below
spots_dr = [(k, 1) for k in range(NX)] + [(NX - 1, 0), (NX - 1, 2)]
for k, j in spots_dr:
    x_, th_ = vx0 + (k + 0.5) * bay, -th0 + 2 * th0 * (j + 0.5) / NA
    bpy.ops.mesh.primitive_cylinder_add(vertices=24, radius=0.032, depth=0.004, location=arc_pt(x_, th_, 8))
    tr_ = bpy.context.active_object; tr_.name = f"dr_spot_trim{k}{j}"; tr_.rotation_euler = (th_, 0, 0); setmat(tr_, M_TRIM)
    bpy.ops.mesh.primitive_cylinder_add(vertices=24, radius=0.022, depth=0.003, location=arc_pt(x_, th_, 10))
    ds_ = bpy.context.active_object; ds_.name = f"dr_spot_disc{k}{j}"; ds_.rotation_euler = (th_, 0, 0); setmat(ds_, M_DISC)
    ld = bpy.data.lights.new(f"dr_spot{k}{j}", "SPOT"); ld.spot_size = math.radians(50); ld.spot_blend = 0.7; ld.shadow_soft_size = 0.015
    ld.energy = float(os.environ.get("DRSPOT", 11)); warm(ld, 3000)
    so = bpy.data.objects.new(f"dr_spot{k}{j}", ld); sc.collection.objects.link(so); so.location = arc_pt(x_, th_, 22)   # pointing straight down, just under the shell's face

# ── the bedroom's ceiling: a cove line 6 in off three walls, and the spots already cut ──
def cove(name, x0, s0, x1, s1, power_per_m=28):
    L_ = math.hypot(x1 - x0, s1 - s0) / 1000
    dbox(name + "_strip", min(x0, x1) - (0 if x0 != x1 else 12), min(s0, s1) - (0 if s0 != s1 else 12), H - 4,
         max(x0, x1) + (0 if x0 != x1 else 12), max(s0, s1) + (0 if s0 != s1 else 12), H, M_STRIP)
    ld = bpy.data.lights.new(name, "AREA"); ld.shape = "RECTANGLE"
    ld.size, ld.size_y = (L_, 0.024) if s0 == s1 else (0.024, L_); ld.energy = power_per_m * L_; warm(ld, 3000)   # coves 3000 K (owner, 7 Oct)
    lo = bpy.data.objects.new(name, ld); sc.collection.objects.link(lo); lo.location = P((x0 + x1) / 2, (s0 + s1) / 2, H - 8)
OFF = 152
cove("cove_left_a", xLs + OFF, STUDY + 200, xLs + OFF, yS - 50)
cove("cove_left_b", xLb + OFF, yS + 50, xLb + OFF, Lb - OFF)
cove("cove_bed", xLb + OFF, Lb - OFF, xR - OFF, Lb - OFF)
cove("cove_right", xR - OFF, STUDY + 200, xR - OFF, Lb - OFF)
cove("dr_cove_door", BA["x0"] + 30, DR["s0"] + OFF, BA["x0"] + D3["open"] - 30, DR["s0"] + OFF)   # dressing: over the bathroom door (owner, 7 Oct)
for o in [o for o in sc.objects if o.parent and o.parent.name == "ceiling" and o.type == "MESH" and o.name.startswith("Cylinder")]:
    setmat(o, M_TRIM)
    loc = o.matrix_world.translation.copy()
    bpy.ops.mesh.primitive_cylinder_add(vertices=24, radius=0.022, depth=0.003, location=loc - Vector((0, 0, 0.003)))
    setmat(bpy.context.active_object, M_DISC)
    ld = bpy.data.lights.new("spot", "SPOT"); ld.spot_size = math.radians(55); ld.spot_blend = 0.7; ld.shadow_soft_size = 0.015; ld.energy = 9; warm(ld, 3000)                 # focus lights 3000 K
    so = bpy.data.objects.new("spot", ld); sc.collection.objects.link(so); so.location = loc - Vector((0, 0, 0.01))

# the dressing room also gets its wardrobes' warm glow where the tunnel bay opens, and the tunnel a light
ld = bpy.data.lights.new("tunnel", "AREA"); ld.size = 0.6; ld.energy = 25; warm(ld, 3000)
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
    # cloth: pin the heading, let gravity and the fabric's own stiffness settle the folds (80 frames), keep the result
    pin = o.vertex_groups.new(name="pin")
    top_row = [v.index for v in me.vertices if v.co.z > (H - 70) / 1000]
    pin.add(top_row, 1.0, "REPLACE")
    cl = o.modifiers.new("cloth", "CLOTH"); cs = cl.settings
    cs.quality = 12; cs.mass = 0.3; cs.tension_stiffness = 40; cs.compression_stiffness = 40; cs.shear_stiffness = 25
    cs.bending_stiffness = 0.9; cs.air_damping = 2.5; cs.vertex_group_mass = "pin"
    cl.collision_settings.use_self_collision = False
    cl.point_cache.frame_start = 1; cl.point_cache.frame_end = 90
    o.modifiers.move(len(o.modifiers) - 1, 0)
    for fr in range(1, 91): sc.frame_set(fr)
    dg = bpy.context.evaluated_depsgraph_get(); me2 = bpy.data.meshes.new_from_object(o.evaluated_get(dg))
    o.modifiers.clear(); o.data = me2
    for p_ in me2.polygons: p_.use_smooth = True
    ss2 = o.modifiers.new("t", "SOLIDIFY"); ss2.thickness = 0.0012
    sc.frame_set(1)
    tr = dbox("curtain_track2", xa - 40, 365, H - 40, xR - 12, 405, H - 20, M_BRONZE); bevel(tr, 0.004, 2)
    for o_ in [o for o in sc.objects if o.name.startswith("curtain_track") and o.name != "curtain_track2"]: bpy.data.objects.remove(o_, do_unlink=True)
    tb = sc.objects.get("tieback")
    if tb: tb.location = (0, 0, 0)
# 1 Oct: the owner wants the curtain out for now (it hid the window and panelling); keep curtain() for when it returns
for o_ in [o for o in sc.objects if o.name.startswith("curtain") or o.name == "tieback"]: bpy.data.objects.remove(o_, do_unlink=True)

# ── the curtains, approved (owner, 7 Oct): a white linen sheer on a slim rod inside the window, falling to the sill; heavy
#    red velvet on a brass rod under the crown, 13 in off the wall, two panels tied back with gold rope and tassels at 1250,
#    falling to the counter just in front of its edge (AST-DR-040). Shaped, not simulated: pleats set by hand. ──
def velvet_mat():
    """Real velvet: a deep crimson pile, nearly black in the folds' hollows, a pale rosy sheen where the light grazes the
    pile; a fine noise in the nap — no wave texture (that read as wood grain)."""
    m, nt, b = node_mat("red_velvet"); N = nt.nodes; Lk = nt.links.new
    lw = N.new("ShaderNodeLayerWeight"); lw.inputs["Blend"].default_value = 0.42
    cr = N.new("ShaderNodeValToRGB"); cr.color_ramp.elements[0].color = (0.055, 0.002, 0.007, 1); cr.color_ramp.elements[1].color = (0.30, 0.03, 0.045, 1)
    cr.color_ramp.elements[0].position = 0.15; cr.color_ramp.elements[1].position = 0.95
    Lk(lw.outputs["Facing"], cr.inputs["Fac"]); Lk(cr.outputs["Color"], b.inputs["Base Color"])
    b.inputs["Roughness"].default_value = 0.85; b.inputs["Specular IOR Level"].default_value = 0.25
    b.inputs["Sheen Weight"].default_value = 1.0; b.inputs["Sheen Roughness"].default_value = 0.32
    b.inputs["Sheen Tint"].default_value = (1.0, 0.45, 0.48, 1)
    nz = N.new("ShaderNodeTexNoise"); nz.inputs["Scale"].default_value = 420.0; nz.inputs["Detail"].default_value = 3
    bp = N.new("ShaderNodeBump"); bp.inputs["Strength"].default_value = 0.05; bp.inputs["Distance"].default_value = 0.0003
    Lk(nz.outputs["Fac"], bp.inputs["Height"]); Lk(bp.outputs["Normal"], b.inputs["Normal"])
    return m
M_VELVET = velvet_mat()
M_SILK_GOLD = flat("gold_silk_rope", (0.55, 0.36, 0.12), 0.38, 0.6)
def pleated(name, rows, m, thick=0.003, crumple=0.0):
    bm = bmesh.new(); vr = [[bm.verts.new(P(*q)) for q in row] for row in rows]
    for ra, rb in zip(vr, vr[1:]):
        for i in range(len(ra) - 1): bm.faces.new((ra[i], ra[i + 1], rb[i + 1], rb[i]))
    me = bpy.data.meshes.new(name); bm.to_mesh(me); bm.free()
    o = bpy.data.objects.new(name, me); DET.objects.link(o); setmat(o, m)
    if crumple:
        tx = bpy.data.textures.new(name + "_c", "CLOUDS"); tx.noise_scale = 0.16; tx.noise_depth = 2
        dp = o.modifiers.new("crumple", "DISPLACE"); dp.texture = tx; dp.strength = crumple; dp.texture_coords = "GLOBAL"
    so = o.modifiers.new("t", "SOLIDIFY"); so.thickness = thick
    sd = o.modifiers.new("s", "SUBSURF"); sd.levels = 1; sd.render_levels = 2
    for p_ in me.polygons: p_.use_smooth = True
    return o
# the sheer: fine soft pleats across the window zone, hung from its own rod just under the velvet's, down to the counter
SH_Z0, SH_Z1, SH_S = CTOP + 16.0, 2420.0, FACE + 22.0                       # the sheer all the way up (owner, 8 Oct): rod to counter
rv = random.Random(7); rows = []
SNF = 15; sw_ = [rv.uniform(0.7, 1.4) for _ in range(SNF)]; st_ = sum(sw_); sed = [0.0]
for w_ in sw_: sed.append(sed[-1] + w_ / st_)
sam = [rv.uniform(0.6, 1.25) for _ in range(SNF)]; sph = [rv.uniform(0, 6.28) for _ in range(SNF)]
def sfold(t, z):                                                            # soft, uneven folds that wander as they fall
    for f in range(SNF):
        if sed[f] <= t <= sed[f + 1]:
            q = (t - sed[f]) / (sed[f + 1] - sed[f]); q = min(1, max(0, q + 0.15 * math.sin(z / 600 + sph[f]) * q * (1 - q)))
            return sam[f] * math.sin(math.pi * q)
    return 0.0
for j in range(61):
    z = SH_Z0 + (SH_Z1 - SH_Z0) * j / 60
    rows.append([(ZX0 + 60 + (WX1 - ZX0 - 90) * i / 240, SH_S + 22 * (sfold(i / 240, z) - 0.5) * 2 + 4 * math.sin(z / 350 + i * 0.05), z) for i in range(241)])
pleated("curtain_sheer", rows, M_SHEER, 0.0008)
rr_ = dbox("curtain_sheer_rod", ZX0 + 40, SH_S - 6, SH_Z1 + 2, WX1 - 20, SH_S + 6, SH_Z1 + 14, M_BRASS); bevel(rr_, 0.005, 3)
# the velvet: two panels either side of the window — full at the rod, swept to the tie-back, flaring and breaking on the
# counter. Folds of uneven width and depth, the way heavy cloth really hangs.
VR_Z, VR_S, VTIE, VBOT = 2440.0, FACE + 50.0, 1250.0, CTOP + 14.0
VX0 = ZX0 + 14.0
def vel_width(z):
    if z >= VTIE: u = (z - VTIE) / (VR_Z - VTIE); return 175 + 175 * (u * u * (3 - 2 * u))
    u = (VTIE - z) / (VTIE - VBOT); return 175 + 150 * math.sin(min(1.0, u * 1.5) * math.pi / 2)
for k_, (xo, d) in enumerate(((VX0, 1), (WX1 - 6, -1))):
    rv = random.Random(31 + k_)
    NF = 9; wts = [rv.uniform(0.7, 1.35) for _ in range(NF)]; tot = sum(wts)
    edges = [0.0]
    for w_ in wts: edges.append(edges[-1] + w_ / tot)
    amps = [rv.uniform(0.75, 1.3) for _ in range(NF)]; ph_s = [rv.uniform(-0.25, 0.25) for _ in range(NF)]
    def fold(t, z):                                                             # depth of the cloth at fraction t across
        for f in range(NF):
            if edges[f] <= t <= edges[f + 1]:
                q = (t - edges[f]) / (edges[f + 1] - edges[f])
                tw = 0.18 * math.sin(z / 520 + ph_s[f] * 9)                          # each fold wanders a little as it falls
                return amps[f] * math.sin(math.pi * min(1, max(0, q + tw * q * (1 - q))))
        return 0.0
    rows = []
    for j in range(81):
        z = VBOT + (VR_Z - 25 - VBOT) * j / 80; w_ = vel_width(z)
        amp = 30 + 22 * math.exp(-((z - VTIE) / 240) ** 2) + 20 * (1 - (z - VBOT) / (VR_Z - VBOT)) ** 2
        belly = 34 * math.exp(-((z - (VTIE + 330)) / 260) ** 2) + 22 * math.exp(-((z - (VTIE - 230)) / 200) ** 2)
        brk = 26 * max(0.0, 1 - (z - VBOT) / 110) ** 2                              # the break where it meets the counter
        row = []
        for i in range(97):
            t = i / 96
            row.append((xo + d * (w_ + brk * 1.2) * t, VR_S + amp * (fold(t, z) - 0.5) * 2 + belly * math.sin(math.pi * t) + brk * math.sin(t * 7), z + (brk * 0.6 * math.sin(t * 11) if z < VBOT + 40 else 0)))
        rows.append(row)
    pleated(f"curtain_velvet{k_}", rows, M_VELVET, 0.006, 0.006)
    # the tie-back: a twisted gold silk rope round the gathered waist, a tassel hanging from it
    cx_ = xo + d * 88
    cv = bpy.data.curves.new(f"curtain_tie{k_}", "CURVE"); cv.dimensions = "3D"; cv.bevel_depth = 0.0075; cv.bevel_resolution = 3
    for strand in range(2):
        spl = cv.splines.new("POLY"); n = 96; spl.points.add(n - 1)
        for i in range(n):
            a = 2 * math.pi * i / n; tw = 0.004 * math.cos(a * 9 + strand * math.pi)
            spl.points[i].co = (*P(cx_ + (110 + tw * 1000) * math.cos(a), VR_S + 8 + (62 + tw * 1000) * math.sin(a), VTIE + 6 * math.sin(a * 9 + strand * math.pi)), 1)
        spl.use_cyclic_u = True
    tie = bpy.data.objects.new(f"curtain_tie{k_}", cv); DET.objects.link(tie); tie.data.materials.append(M_SILK_GOLD)
    xt, st_ = cx_ + d * 80, VR_S + 70
    bpy.ops.mesh.primitive_uv_sphere_add(segments=24, ring_count=12, radius=0.02, location=P(xt, st_, VTIE - 40)); tsh_ = bpy.context.active_object; tsh_.scale = (1, 1, 1.25)
    setmat(tsh_, M_SILK_GOLD); tsh_.name = f"curtain_tassel_head{k_}"     # (not `hd`: that is the hidden door, from furnish.py)
    for q in range(56):                                                         # the fringe: fine silk strands
        a = 2 * math.pi * q / 56 + rv.uniform(-0.05, 0.05); rr = 0.012 + rv.uniform(0, 0.006); L_ = 0.13 + rv.uniform(-0.01, 0.01)
        bpy.ops.mesh.primitive_cylinder_add(vertices=5, radius=0.0012, depth=L_, location=(0, 0, 0))
        fs = bpy.context.active_object; fs.name = f"curtain_fringe{k_}_{q}"
        top_ = Vector(P(xt + rr * 800 * math.cos(a), st_ + rr * 800 * math.sin(a), VTIE - 62))
        bot_ = Vector(P(xt + (rr + 0.006) * 1000 * math.cos(a), st_ + (rr + 0.006) * 1000 * math.sin(a), VTIE - 62 - L_ * 1000))
        fs.location = (top_ + bot_) / 2; fs.rotation_euler = (bot_ - top_).to_track_quat("Z", "Y").to_euler(); setmat(fs, M_SILK_GOLD)
    bpy.ops.mesh.primitive_cylinder_add(vertices=24, radius=0.016, depth=0.03, location=P(xt, st_, VTIE - 66)); setmat(bpy.context.active_object, M_SILK_GOLD)
bpy.ops.mesh.primitive_cylinder_add(vertices=24, radius=0.015, depth=(WX1 - VX0 + 10) / 1000, location=P((VX0 + WX1) / 2, VR_S, VR_Z))
vrod = bpy.context.active_object; vrod.name = "curtain_velvet_rod"; vrod.rotation_euler = (0, math.pi / 2, 0); setmat(vrod, M_BRASS)
bpy.ops.mesh.primitive_uv_sphere_add(radius=0.03, location=P(VX0 - 20, VR_S, VR_Z)); setmat(bpy.context.active_object, M_BRASS)
for x_ in (VX0 + 40, WX1 - 60):
    dbox(f"curtain_bracket{x_:.0f}", x_ - 8, FACE, VR_Z - 8, x_ + 8, VR_S, VR_Z + 8, M_BRASS)
print(f"curtains: sheer + red velvet pair, tied back, window {WX0:.0f}-{WX1:.0f}", flush=True)

# ── the corridor outside the front door, wider and longer than the stub furnish.py left ──
for o_ in [o for o in sc.objects if o.name.startswith("cor_")]: bpy.data.objects.remove(o_, do_unlink=True)
cxw = xLb - T
dbox("cor_floor", cxw - 3600, 3300, -150, cxw, 7200, 0, M_FLOOR)
dbox("cor_wallN", cxw - 3600, 3180, 0, cxw, 3300, H, M_PAINT); dbox("cor_wallS", cxw - 3600, 7200, 0, cxw, 7320, H, M_PAINT)
dbox("cor_wallW", cxw - 3720, 3180, 0, cxw - 3600, 7320, H, M_PAINT); dbox("cor_ceil", cxw - 3720, 3180, H, cxw, 7320, H + 150, M_CEIL)
dbox("cor_wallE_s", cxw, 5996, 0, cxw + 110, 7320, H, M_PAINT); dbox("cor_wallE_n", cxw, 3180, 0, xLs - T, 4600, H, M_PAINT)
for sg_ in (3300 + 12, 7200 - 12):
    skirt(f"cor_sk{sg_}", cxw - 3600, sg_ - 12 if sg_ < 5000 else sg_ - 0, cxw, sg_ + 12 if sg_ < 5000 else sg_ + 12)

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
def compositing():
    """A soft glow on the highlights (Blender 5: the compositor is a node group assigned to the scene)."""
    try:
        ng = bpy.data.node_groups.new("comp", "CompositorNodeTree")
        ng.interface.new_socket("Image", in_out="OUTPUT", socket_type="NodeSocketColor")
        rl = ng.nodes.new("CompositorNodeRLayers"); gl = ng.nodes.new("CompositorNodeGlare"); go = ng.nodes.new("NodeGroupOutput")
        for k, v in (("Type", "Fog Glow"), ("Quality", "High")):
            try: gl.inputs[k].default_value = v
            except Exception as e: print("glare in", k, e, flush=True)
        for k, v in (("Threshold", 0.9), ("Strength", 0.22), ("Size", 0.45)):
            gl.inputs[k].default_value = v
        print("glare inputs", [i.name for i in gl.inputs], flush=True)
        ng.links.new(rl.outputs["Image"], gl.inputs["Image"]); ng.links.new(gl.outputs["Image"], go.inputs[0])
        sc.compositing_node_group = ng
        print("compositor glare on", flush=True)
    except Exception as e: print("compositor?", e, flush=True)
compositing()
sc.view_settings.view_transform = "AgX"
try: sc.view_settings.look = "AgX - Medium High Contrast"
except Exception: pass
sc.view_settings.exposure = float(os.environ.get("EXPOSURE", -1.5))
try:                                                                  # white-balanced for warm light, as a camera would be
    sc.view_settings.use_white_balance = True
    sc.view_settings.white_balance_temperature = float(os.environ.get("WB", 3700))
except Exception as e: print("white balance?", e)

if os.environ.get("REAL4", "1") != "0":                              # stage 4: the realism pass (bedding, styling, depth, night, lens)
    exec(compile(open(os.path.join(HERE, "realism.py")).read(), "realism.py", "exec"))

EYE_R = 1600; LENS_R = float(os.environ.get("LENS", 18))
VIEWS = {  # name: camera (x, s[, z]), looking at (x, s, z)
    "room": ((1200, 5000), (2600, 600, 1250)),
    "study": ((3300, 2900), (1500, 0, 1250)),
    "desk": ((3900, 700, 1350), (2000, 2300, 700)),
    "right": ((700, 1800), (4547, 3300, 1300)),
    "bed": ((2300, 3000), (2337, 5766, 900)),
    "left": ((3750, 4900), (-50, 2700, 1450)),
    "outside": ((-2500, 5200), (-177, 5230, 1200)),
    "h_study": ((2400, 3300, 1450), (2200, 0, 1250)),
    "h_bedwall": ((2300, 2400, 1400), (2337, 5766, 1000)),
    "h_right": ((900, 2900, 1450), (4547, 2600, 1300)),
    "h_desk": ((1500, 380, 1250), (2400, 1700, 650)),
    "h_dress": ((4950, 4400, 1500), (8536, 4356, 1450)),
    "h_vanity": ((6150, 1050, 1450), (6600, 2718, 1000)),
    "h_wardrobe": ((4950, 3720, 1450), (6600, 5080, 1300)),     # the south wardrobes, from the aisle by the dressing door
    # stage-4 test views: (camera, target, {lens, fstop}) — a real lens, not the 18 mm walk lens
    "r_room": ((350, 5300, 1450), (2700, 2600, 1100), {"lens": 22, "fstop": 5.6}),
    "r_bed": ((3700, 3250, 1350), (2200, 5500, 750), {"lens": 30, "fstop": 4.0}),
    "r_desk": ((3350, 2250, 1350), (2150, 1350, 800), {"lens": 28, "fstop": 4.0}),
    "r_study": ((2337, 3700, 1500), (2337, 0, 1300), {"lens": 22, "fstop": 8.0}),
    # the glass-block partition (1 Oct): from the bed, from the desk, and from straight above to show the curve
    "r_pbed": ((3950, 4850, 1300), (2337, 2413, 1150), {"lens": 24, "fstop": 5.6}),
    "r_ptv": ((2337, 4600, 1150), (2337, 2413, 1250), {"lens": 24, "fstop": 4.0}),
    "r_paint": ((3500, 4100, 1450), (-50, 2299, 1400), {"lens": 24, "fstop": 5.6}),
    "r_mon": ((2337, 900, 1250), (2337, 2300, 1050), {"lens": 28, "fstop": 4.0}),
    "r_pdesk": ((1000, 650, 1450), (2337, 2413, 1250), {"lens": 24, "fstop": 5.6}),
    "p_plan": ((2337, 2900, 7000), (2337, 2900, 0), {"ortho": 5.2, "hide": ("ceiling",)}),
    # the bed wall and the bed (3 Oct): straight on, three-quarter from the door side, the cove, the headboard
    "b_front": ((2337, 2500, 1250), (2337, 5766, 1150), {"lens": 22, "fstop": 8.0}),
    "b_three": ((300, 3500, 1350), (2700, 5650, 900), {"lens": 26, "fstop": 5.6}),
    "b_cove": ((4100, 4950, 1650), (3150, 5740, 1700), {"lens": 24, "fstop": 5.6}),
    "b_head": ((3350, 4250, 1450), (3000, 5700, 1000), {"lens": 30, "fstop": 4.0}),      # over the pillows at the rose headboard and its frame
    "st_close": ((4150, 4950, 1000), (3560, 5560, 450), {"lens": 35, "fstop": 4.0}),      # the cabriole side table, from the room side
    "st_wall": ((2337, 2250, 1550), (2337, 0, 1450), {"lens": 15, "fstop": 8.0}),      # the whole study wall, from over the desk
    "st_arch": ((1250, 1350, 1350), (744, 200, 2250), {"lens": 22, "fstop": 5.6}),     # up into the bookcase arch and its niches
    "st_chairf": ((2560, 1900, 1250), (2337, 1002, 760), {"lens": 32, "fstop": 4.0}),   # the chair's face, over the desk
    "st_chair": ((3600, 2250, 1300), (2337, 1050, 650), {"lens": 26, "fstop": 5.6}),   # the green chair at the desk
    "hide_close": ((3350, 3150, 520), (2700, 3700, 0), {"lens": 32, "fstop": 4.0}),     # low over the hide's fur
    "wd_open": ((7000, 4950, 1500), (7000, 3300, 1250), {"lens": 15, "fstop": 6.3}),   # L2 and L3 open, square on from the aisle: shirts, the lit perfume niche
    "wd_shoes": ((7300, 3800, 1450), (7300, 5450, 800), {"lens": 15, "fstop": 6.3}),   # R3 open, square on: the shoe trays
    "c_gloss": ((2337, 4700, 1350), (2700, 600, 2500), {"lens": 20, "fstop": 8.0}),    # up at the gloss ceiling, toward the window
    "b_rug": ((3900, 3050, 1750), (2337, 4350, 100), {"lens": 22, "fstop": 8.0}),    # the bed's foot and the rug under it (bed side of the glass)
    "t_front": ((2337, 3560, 980), (2337, 2780, 360), {"lens": 22, "fstop": 8}),
    "t_three": ((3550, 3700, 950), (2600, 2780, 260), {"lens": 28, "fstop": 5.6}),
    "t_end": ((3900, 3150, 700), (3300, 2650, 250), {"lens": 30, "fstop": 4}),
    "vanity": ((6250, 1150, 1400), (6600, 2718, 950)),
    "bath_wc": ((4777 + 2300, 2300, 1550), (4777 + 900, 450, 1250), {"lens": 20, "fstop": 8}),       # the WC wall, its niches, the WC and shower in glass
    "bath_tub": ((4777 + 1150, 2050, 1500), (4777 + 3300, 950, 550), {"lens": 22, "fstop": 8}),      # the tub east of the pier
    "bath_van": ((4777 + 1250, 1130, 1450), (4777 + 1250, 2718, 1150), {"lens": 13, "fstop": 8}),       # the vanity square on, the door beside it on the right
    "bath_van2": ((4777 + 2250, 1180, 1550), (4777 + 700, 2718, 1100), {"lens": 15, "fstop": 8}),       # the vanity and the door, from by the pier
    "bath_up": ((4777 + 1300, 2100, 1300), (4777 + 1950, 400, 2600), {"lens": 18, "fstop": 8}),      # the dropped shower ceiling and its cove
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
EV_BASE = None
EVX = {"wd_open": 1.0, "wd_shoes": 1.0, "h_wardrobe": 0.9, "dress": 0.8, "h_dress": 0.8, "vault": 0.8, "mirror": 0.8,      # exposure lifts by view:
       "bath_van": 0.5, "bath_van2": 0.5, "bath_wc": 0.5, "bath_tub": 0.5, "bath_up": 0.5, "d2close": 0.3}               # interiors with less light
def shoot(name):
    global EV_BASE
    cp, tp = VIEWS[name][:2]
    op = VIEWS[name][2] if len(VIEWS[name]) > 2 else {}
    if EV_BASE is None: EV_BASE = sc.view_settings.exposure
    sc.view_settings.exposure = EV_BASE + op.get("ev", EVX.get(name, 0.0))
    cz = cp[2] if len(cp) > 2 else EYE_R
    c_ = cam("r_" + name, op.get("lens", LENS_R)); c_.location = P(cp[0], cp[1], cz)
    if "fstop" in op:
        c_.data.dof.use_dof = True; c_.data.dof.aperture_fstop = op["fstop"]
        c_.data.dof.focus_distance = (Vector(P(*tp)) - c_.location).length
    if "ortho" in op:                     # a plan, looking straight down with the ceiling lifted off
        c_.data.type = "ORTHO"; c_.data.ortho_scale = op["ortho"]; c_.data.clip_end = 20
        for n_ in op.get("hide", ()):
            if sc.objects.get(n_): sc.objects[n_].hide_render = True
        c_.rotation_euler = (0, 0, 0)
    elif name.startswith(("h_", "r_")):      # hero stills: camera held level and raised/lowered by lens shift, so walls stay upright
        aim(c_, P(tp[0], tp[1], cz)); d_ = math.hypot(tp[0] - cp[0], tp[1] - cp[1])
        c_.data.shift_y = c_.data.lens * (tp[2] - cz) / d_ / c_.data.sensor_width
    else: aim(c_, P(*tp))
    sc.camera = c_; sc.render.filepath = os.path.join(OUTR, name + ".png"); sc.render.image_settings.file_format = "PNG"
    bpy.ops.render.render(write_still=True)
    for n_ in op.get("hide", ()):
        if sc.objects.get(n_): sc.objects[n_].hide_render = False

TOUR = [  # name, camera (x, s[, z]), looking at (x, s, z), hold frames, what happens while it holds
    ("door", (-2500, 5200), (-177, 5230, 1200), 56, "d1"),
    ("in", (150, 5150), (2600, 3000, 1150), 22, None),
    ("bed", (2300, 3000), (2337, 5766, 900), 30, None),
    ("left", (3750, 4900), (-50, 2700, 1450), 30, None),
    ("left2", (3600, 3600), (-80, 4700, 1350), 24, None),
    ("right", (1500, 3550), (4547, 3200, 1400), 22, None),
    (None, (4150, 3150), (4150, 1000, 1300), 0, None),
    ("study", (4100, 1900), (1600, 0, 1300), 26, None),
    ("window", (3600, 1500), (3950, 0, 1450), 20, None),
    ("book", (1500, 1150), (600, 0, 1300), 20, None),
    ("desk", (3300, 780, 1300), (2337, 2000, 720), 26, None),
    (None, (1100, 1500), (1100, 3500, 1300), 0, None),
    (None, (1000, 3350), (2800, 4300, 1300), 0, None),
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
    walk.data.dof.use_dof = True; walk.data.dof.focus_object = tgt; walk.data.dof.aperture_fstop = float(os.environ.get("FSTOP", 4.0))
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
    d = sc.objects["door_d1"]; a, b = acts["d1"]; rot = d["open"]
    d.rotation_euler.z = 0; d.keyframe_insert("rotation_euler", index=2, frame=1); d.keyframe_insert("rotation_euler", index=2, frame=a + 8)
    d.rotation_euler.z = rot; d.keyframe_insert("rotation_euler", index=2, frame=b - 4)
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
    pick = [ONLY] if ONLY else ([v for v in os.environ["STILLS"].split(",")] if os.environ.get("STILLS") else list(VIEWS))
    for n in pick: shoot(n)
if MODER == "film":                                                      # stage 5: the film of slow composed shots
    exec(compile(open(os.path.join(HERE, "film.py")).read(), "film.py", "exec"))
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(OUTR, "real.blend"))
print("DONE", MODER)
