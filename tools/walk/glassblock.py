# The partition (owner, 1 Oct): a wall of Mano cast-glass blocks between the desk and the bed, with one wood column
# a foot wide down the middle, floor to ceiling (the TV's power comes down it), and a wood board on it that holds the
# 55" TV. The board is smaller than the TV, so from the bed the TV floats on the glass with no wood round it. A low
# unit of drawers runs the whole length on the bed side, four wide drawers across and two high, the end ones curving
# with the wall, in the 9292 burl re-tinted to the Dark Diva colour. (The wood bands, LED strips and twin columns
# tried earlier the same day were withdrawn by the owner.) Run by realism.py in real.py's namespace.
#
# Mano Vetra block (Eco Outdoor, Tom Fereday): 5½ in square (140 mm), 3¾ in deep (95 mm), solid hand-cast glass,
# 3/8 in (10 mm) joints, so one block and its joint is 150 mm. Cast glass can't be cut: every piece of wood lands on
# that grid, so the foot-wide column is two blocks (290 mm of wood) and the wall is 16 blocks across to keep it
# central. PCURVE=1 (default) turns each end gently toward the bed on a 1.3 m radius (about the tightest a 140 mm
# block takes; Eco Outdoor's own figure still to confirm); PCURVE=0 keeps it straight.
import bpy, bmesh, math, os
from mathutils import Vector, noise

MOD, BLK, DEP = 150.0, 140.0, 95.0                     # module, block face, block depth (mm)
COLS, ROWS = 16, 18
L = COLS * MOD                                         # 2400 developed (≈ 2356 across with the curve)
BOARD_C, BOARD_R = (5, 11), (5, 9)                     # columns [5, 11) = 6 blocks (890 mm), rows [5, 9) = 4 blocks (590 mm)
WCOLS = (7, 8)                                         # the column: the middle two blocks, a foot wide
Z0 = 10.0                                              # the mortar bed under the first course
PX, PS = bcx if "bcx" in dir() else 2337.0, 2413.0     # the old partition's centre line: on the bed's axis, 3353 off the bed wall
CURVE = os.environ.get("PCURVE", "1") != "0"
RAD = float(os.environ.get("PRAD", 1300)); STRAIGHT = 8 * MOD / 2   # the middle 8 blocks stay straight; 4 curve at each end

def place(u, w):
    """Developed position u (mm along the wall from its middle) and w (mm across it, + toward the bed) to plan x, s."""
    a = STRAIGHT
    if not CURVE or abs(u) <= a: return PX + u, PS + w
    sg = 1 if u > 0 else -1; th = (abs(u) - a) / RAD
    x = PX + sg * (a + RAD * math.sin(th)); s = PS + RAD * (1 - math.cos(th))
    nx, ns = -sg * math.sin(th), math.cos(th)
    return x + w * nx, s + w * ns

def bend(bm):
    """Vertices are built straight in (u, w, z) mm; wrap them onto the plan path and into Blender metres."""
    for v in bm.verts:
        u, w, z = v.co.x, v.co.y, v.co.z
        x, s = place(u, w); v.co = Vector(P(x, s, z))

GB = bpy.data.collections.new("partition"); sc.collection.children.link(GB)
def obj(name, bm, mats):
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces[:])
    me = bpy.data.meshes.new(name); bm.to_mesh(me); bm.free()
    o = bpy.data.objects.new(name, me); GB.objects.link(o)
    for m_ in mats: me.materials.append(m_)
    for p_ in me.polygons: p_.use_smooth = True
    return o

# ── one block: a soft-cornered cast slab (7 mm round on every edge); the dish and the hand-cast ripple are in the shader ──
def block_template():
    bm = bmesh.new(); bmesh.ops.create_cube(bm, size=1.0)
    bmesh.ops.scale(bm, vec=(BLK, DEP, BLK), verts=bm.verts)
    bmesh.ops.bevel(bm, geom=bm.edges[:], offset=7.0, segments=4, affect="EDGES", profile=0.5)
    return bm
TPL = block_template()

def add_block(bm_all, uc, zc, k):
    """Copy the template into the wall centred at (uc, zc), with UVs across its face and a per-block random."""
    vmap = {v: bm_all.verts.new((uc + v.co.x, v.co.y, zc + v.co.z)) for v in TPL.verts}
    rl = bm_all.faces.layers.float.get("blk") or bm_all.faces.layers.float.new("blk")
    uvl = bm_all.loops.layers.uv.verify()
    rv = ((k * 2654435761) % 1000) / 1000.0
    for f in TPL.faces:
        nf = bm_all.faces.new([vmap[v] for v in f.verts]); nf[rl] = rv
        for lp, lo in zip(nf.loops, f.loops):
            lp[uvl].uv = (lo.vert.co.x / BLK + 0.5, lo.vert.co.z / BLK + 0.5)

# ── materials ──
def m_glass():
    m, nt, b = node_mat("mano_glass")
    b.inputs["Base Color"].default_value = (0.93, 0.95, 0.92, 1); b.inputs["Transmission Weight"].default_value = 1.0
    b.inputs["Roughness"].default_value = 0.05; b.inputs["IOR"].default_value = 1.5
    # the cast surface: a slow wave plus a fine ripple, different on every block
    at = nt.nodes.new("ShaderNodeAttribute"); at.attribute_type = "GEOMETRY"; at.attribute_name = "blk"
    tc = nt.nodes.new("ShaderNodeTexCoord"); add = nt.nodes.new("ShaderNodeVectorMath"); add.operation = "ADD"
    nt.links.new(tc.outputs["Object"], add.inputs[0]); nt.links.new(at.outputs["Fac"], add.inputs[1])
    n1 = nt.nodes.new("ShaderNodeTexNoise"); n1.inputs["Scale"].default_value = 28; n1.inputs["Detail"].default_value = 4
    n2 = nt.nodes.new("ShaderNodeTexNoise"); n2.inputs["Scale"].default_value = 160; n2.inputs["Detail"].default_value = 2
    nt.links.new(add.outputs["Vector"], n1.inputs["Vector"]); nt.links.new(add.outputs["Vector"], n2.inputs["Vector"])
    mx = nt.nodes.new("ShaderNodeMath"); mx.operation = "MULTIPLY_ADD"; mx.inputs[1].default_value = 0.25
    nt.links.new(n2.outputs["Fac"], mx.inputs[0]); nt.links.new(n1.outputs["Fac"], mx.inputs[2])
    bp = nt.nodes.new("ShaderNodeBump"); bp.inputs["Strength"].default_value = 0.32; bp.inputs["Distance"].default_value = 0.0018
    nt.links.new(mx.outputs["Value"], bp.inputs["Height"])
    # each face is dished ~2.5 mm inside a ~15 mm rim, height = −(1 − r²)^1.5 on a rounded-square r
    uv = nt.nodes.new("ShaderNodeUVMap"); sp = nt.nodes.new("ShaderNodeSeparateXYZ"); nt.links.new(uv.outputs["UV"], sp.inputs["Vector"])
    def op(o, a_, b_=None, v=None):
        n = nt.nodes.new("ShaderNodeMath"); n.operation = o
        nt.links.new(a_, n.inputs[0])
        if b_ is not None: nt.links.new(b_, n.inputs[1])
        if v is not None: n.inputs[1].default_value = v
        return n.outputs[0]
    ru = op("ABSOLUTE", op("SUBTRACT", sp.outputs["X"], v=0.5)); rv_ = op("ABSOLUTE", op("SUBTRACT", sp.outputs["Y"], v=0.5))
    # a rounded square (superellipse, p = 6), not max(|u|,|v|), whose diagonal creases read as a pyramid
    r = op("DIVIDE", op("MULTIPLY", op("POWER", op("ADD", op("POWER", ru, v=6.0), op("POWER", rv_, v=6.0)), v=1 / 6), v=2.0), v=0.80)
    one = nt.nodes.new("ShaderNodeValue"); one.outputs[0].default_value = 1.0
    dish = op("POWER", op("MAXIMUM", op("SUBTRACT", one.outputs[0], op("MULTIPLY", r, r)), v=0.0), v=1.5)
    bp2 = nt.nodes.new("ShaderNodeBump"); bp2.invert = True; bp2.inputs["Strength"].default_value = 0.35; bp2.inputs["Distance"].default_value = 0.0025
    nt.links.new(dish, bp2.inputs["Height"]); nt.links.new(bp2.outputs["Normal"], bp.inputs["Normal"])
    nt.links.new(bp.outputs["Normal"], b.inputs["Normal"])
    # thick recycled glass: a faint green-grey that deepens with thickness
    va = nt.nodes.new("ShaderNodeVolumeAbsorption"); va.inputs["Color"].default_value = (0.82, 0.88, 0.80, 1); va.inputs["Density"].default_value = 2.0
    nt.links.new(va.outputs["Volume"], nt.nodes["Material Output"].inputs["Volume"])
    return m
M_GLASSB = m_glass()
M_MORTAR = flat("mortar_dark", (0.055, 0.047, 0.040), 0.85, bump=0.12)
M_TRACK = flat("track_bronze", (0.12, 0.085, 0.06), 0.4, 0.7)
def m_screen():
    m, nt, b = node_mat("tv_screen"); b.inputs["Base Color"].default_value = (0.004, 0.004, 0.005, 1)   # an anti-glare panel:
    b.inputs["Roughness"].default_value = 0.4; b.inputs["Specular IOR Level"].default_value = 0.2         # dim, soft reflections,
    b.inputs["Coat Weight"].default_value = 0.15; b.inputs["Coat Roughness"].default_value = 0.15         # not a mirror
    return m
M_SCREEN = m_screen(); M_TVBODY = flat("tv_body", (0.025, 0.025, 0.027), 0.45, 0.3)

# ── the blocks: every course, except the column and the board ──
bm_g = bmesh.new(); k = 0
for c in range(COLS):
    for r in range(ROWS):
        if c in WCOLS or (BOARD_C[0] <= c < BOARD_C[1] and BOARD_R[0] <= r < BOARD_R[1]): continue
        add_block(bm_g, -L / 2 + c * MOD + MOD / 2, Z0 + r * MOD + BLK / 2, k); k += 1
bend(bm_g); GLASS_O = obj("gb_blocks", bm_g, [M_GLASSB])
print("glass blocks:", k, "curve" if CURVE else "straight", flush=True)

def slab(bm, u0, u1, w0, w1, z0, z1, nu=1):
    """A box in developed coordinates, cut into nu pieces along u so it follows the bend."""
    us = [u0 + (u1 - u0) * i / nu for i in range(nu + 1)]
    rows_ = []
    for u in us:
        rows_.append([bm.verts.new((u, w, z)) for (w, z) in ((w0, z0), (w1, z0), (w1, z1), (w0, z1))])
    for a, b_ in zip(rows_, rows_[1:]):
        for i in range(4): bm.faces.new((a[i], b_[i], b_[(i + 1) % 4], a[(i + 1) % 4]))
    bm.faces.new(rows_[0][::-1]); bm.faces.new(rows_[-1])
def nseg(u0, u1): return max(1, int(abs(u1 - u0) / 40))               # enough pieces to follow the curve smoothly

# ── the mortar: bed joints and head joints, 10 mm, set back 6 mm from each face ──
bm_m = bmesh.new(); WI = DEP / 2 - 6
for r in range(ROWS + 1):
    zj = Z0 + r * MOD - 10 if r else 0.0
    slab(bm_m, -L / 2, L / 2, -WI, WI, zj, zj + 10, nu=60)
for c in range(COLS + 1):
    uj = -L / 2 + c * MOD - 5
    slab(bm_m, uj, uj + 10, -WI, WI, 0, Z0 + ROWS * MOD - 10)
bend(bm_m); obj("gb_mortar", bm_m, [M_MORTAR])

# ── the head track to the ceiling and the two end channels ──
bm_t = bmesh.new()
slab(bm_t, -L / 2 - 6, L / 2 + 6, -DEP / 2 - 4, DEP / 2 + 4, Z0 + ROWS * MOD - 10, H, nu=60)
for sg in (-1, 1):
    ue = sg * L / 2
    slab(bm_t, min(ue, ue + sg * 14), max(ue, ue + sg * 14), -DEP / 2 - 4, DEP / 2 + 4, 0, H)
bend(bm_t); obj("gb_track", bm_t, [M_TRACK])

# ── the wood: the foot-wide column, floor to ceiling, and the board across it ──
uc0 = -L / 2 + WCOLS[0] * MOD + (MOD - BLK) / 2; uc1 = -L / 2 + (WCOLS[-1] + 1) * MOD - (MOD - BLK) / 2
ub0 = -L / 2 + BOARD_C[0] * MOD + (MOD - BLK) / 2; ub1 = -L / 2 + BOARD_C[1] * MOD - (MOD - BLK) / 2
zb0 = Z0 + BOARD_R[0] * MOD; zb1 = Z0 + BOARD_R[1] * MOD - (MOD - BLK)
bm_w = bmesh.new()
slab(bm_w, uc0, uc1, -DEP / 2, DEP / 2, 0, H)                                  # the column, a foot wide
slab(bm_w, ub0, ub1, -DEP / 2, DEP / 2, zb0, zb1)                              # the board
bend(bm_w); WOOD_O = obj("gb_wood", bm_w, [M_VEN]); bevel(WOOD_O, 0.0025, 2)
print(f"column {uc1 - uc0:.0f} wide; board {ub1 - ub0:.0f} x {zb1 - zb0:.0f} mm, centre {(zb0 + zb1) / 2:.0f} mm up", flush=True)

# ── the TV: a 55" panel (1227 × 706 × 26 mm) on a slim mount, 35 mm proud of the board, on the bed side ──
TVW, TVH, TVD, STAND = 1227.0, 706.0, 26.0, 35.0
zc = (zb0 + zb1) / 2; wf = DEP / 2 + STAND
bm_tv = bmesh.new()
slab(bm_tv, -TVW / 2, TVW / 2, wf, wf + TVD, zc - TVH / 2, zc + TVH / 2)
bend(bm_tv); tv = obj("gb_tv", bm_tv, [M_TVBODY]); bevel(tv, 0.003, 2)
bm_sc = bmesh.new()                                                # the glass of the screen, a hair in front, 4 mm bezel
slab(bm_sc, -TVW / 2 + 4, TVW / 2 - 4, wf + TVD, wf + TVD + 0.6, zc - TVH / 2 + 4, zc + TVH / 2 - 4)
bend(bm_sc); obj("gb_screen", bm_sc, [M_SCREEN])
bm_mt = bmesh.new(); slab(bm_mt, -200, 200, DEP / 2, wf, zc - 150, zc + 150); bend(bm_mt); obj("gb_mount", bm_mt, [M_IRON])

cy.transmission_bounces = max(cy.transmission_bounces, 12); cy.max_bounces = max(cy.max_bounces, 12)
cy.volume_bounces = max(getattr(cy, "volume_bounces", 0), 2)

# ── the drawers (owner, 1 Oct): the whole length of the partition on the bed side, four wide drawers across and
#    two high (eight), each 600 mm — four blocks — so the joints between them meet the glass joints and the two end
#    drawers are exactly the curved ends. The 9292 burl re-tinted to the Dark Diva colour (tex/burl_darkdiva.jpg),
#    in the same polish as the Dark Diva so the two read as one wood, a slim brass bar on each. Height 450 ("not too high") and depth 400 are mine.
M_BURL_DD = veneer("burl_darkdiva", 0.32, 0.4, 1.12, 1.0, "burl_darkdiva.jpg", 0.6)   # the same satin polish as the Dark Diva
depth(M_BURL_DD, 0.03, 0.0)
CDP, CHT, PL, TOP = 400.0, 450.0, 60.0, 26.0
w0 = DEP / 2 + 5; w1 = w0 + CDP; FR = 20.0                         # carcase back at the glass; fronts 20 mm thick
bm_c = bmesh.new()
slab(bm_c, -L / 2, L / 2, w0, w1 - FR, PL, CHT - TOP, nu=nseg(-L / 2, L / 2))                 # the carcase
slab(bm_c, -L / 2 - 10, L / 2 + 10, w0, w1 + 10, CHT - TOP, CHT, nu=nseg(-L / 2, L / 2))      # the top, oversailing 10
bend(bm_c); CON_B = obj("gb_console", bm_c, [M_BURL_DD]); bevel(CON_B, 0.004, 3)
bm_p = bmesh.new(); slab(bm_p, -L / 2 + 30, L / 2 - 30, w0, w1 - 50, 0, PL, nu=nseg(-L / 2, L / 2)); bend(bm_p)
obj("gb_console_plinth", bm_p, [M_DARK])
GAP = 3.0; fh = (CHT - TOP - PL - 3 * GAP) / 2; fz = [PL + GAP, PL + 2 * GAP + fh]
for i in range(4):
    for j in range(2):
        u0 = -L / 2 + i * 4 * MOD + GAP / 2; u1 = u0 + 4 * MOD - GAP; z0 = fz[j]
        bm_f = bmesh.new(); slab(bm_f, u0, u1, w1 - FR, w1, z0, z0 + fh, nu=nseg(u0, u1))
        bend(bm_f); fo = obj(f"gb_drawer{i}{j}", bm_f, [M_BURL_DD]); bevel(fo, 0.0025, 3)
        um, zm = (u0 + u1) / 2, z0 + fh / 2
        bm_h = bmesh.new()
        slab(bm_h, um - 130, um + 130, w1 + 18, w1 + 28, zm - 5, zm + 5, nu=8)           # a slim brass bar, 260 long,
        for sx in (-110, 110): slab(bm_h, um + sx - 5, um + sx + 5, w1, w1 + 18, zm - 4, zm + 4)   # on two posts
        bend(bm_h); ho = obj(f"gb_pull{i}{j}", bm_h, [M_BRASS]); bevel(ho, 0.002, 2)
print(f"drawers: 4 x 2 along {L:.0f}, {CHT:.0f} high, {CDP:.0f} deep", flush=True)
