# The bed wall and the bed (AST-DR-034 / -035, owner 3 Oct): exec'd by realism.py just before it makes the bed, in its
# namespace (real.py's helpers and materials, the skeleton's P / box / prism).
#   · the whole wall built out 3 in in Dark Diva veneer, polished DARKER than the rest of the room, sweeping forward in a
#     concave cove — up both sides and across the top — to 10 in at the edge of a niche that holds the bed and both
#     side tables; the coves meet in a mitre at the two top corners
#   · the niche: 10 in deep, 6 ft 6 in high, its back in parchment-plaster panels five across and three up, its sides and
#     soffit plain parchment plaster
#   · the bed from the owner's photo: a low teak platform (the room's tone) on turned bun feet, a slim headboard in
#     dusty-rose suede; a wooden side table and a brass twin-arm wall lamp either side
# Plan: x east, s south from the study wall; the bed wall's face is s = Lb. Along the wall u runs from the dressing
# (right-wall) corner, v comes out from the wall: x = xR − u, s = Lb − v.
import bpy, bmesh, math
from mathutils import Vector

W_ = xR - xLb                              # 15 ft 6 in
EDGE, DEEP = 76.0, 254.0                   # 3 in everywhere, 10 in at the niche
U0, U1, NH = 787.0, 3632.0, 1981.0         # the niche: the old bed-back span, 6 ft 6 in high
CA, CF = 152.0, 25.0                       # cove: 6 in along the wall (7 in out), then a 1 in flat edge
CW, CB = CA + CF, DEEP - EDGE
PL = 20.0                                  # parchment plaster on board, on the niche back
XU = lambda u: xR - u
SV = lambda v: Lb - v

for n_ in ("parchment_wall", "sk_bed", "bed_base", "bed_frame", "mattress", "duvet", "duvet_fold", "throw",
           "pillow_b0", "pillow_b1", "pillow_f0", "pillow_f1", "pillow0", "pillow1"):
    o_ = sc.objects.get(n_)
    if o_: bpy.data.objects.remove(o_, do_unlink=True)

M_VEN_DK = veneer("dark_diva_bedwall", 0.30, 0.42, 0.80, 1.0, "dark_diva_crown.jpg", (0.9, 0.9, 1.1))   # the same Dark Diva, polished darker
M_SUEDE = fabric("suede_dusty_rose", (0.50, 0.32, 0.29), 0.85, 0.88, 1400)                             # the headboard (owner: yes)
BW_ = bpy.data.collections.new("bedwall"); sc.collection.children.link(BW_)

def mesh_obj(name, bm, mat, coll=BW_):
    me = bpy.data.meshes.new(name); bm.to_mesh(me); bm.free()
    o = bpy.data.objects.new(name, me); coll.objects.link(o); o.data.materials.append(mat); return o

# ── the build-out's face, a height field v(u, z): 10 in at the niche, the cove, then 3 in ──────────────────────────
def prof(d):                                # depth for a distance d out from the niche's edge
    if d <= CF: return DEEP
    if d >= CW: return EDGE
    q = (CW - d) / CA
    return DEEP - CB * math.sqrt(max(0.0, 1 - q * q))
def dist(u, z):
    a = U0 - u if u < U0 else (u - U1 if u > U1 else 0.0)
    b = z - NH if z > NH else 0.0
    return max(a, b)
def steps(a, b, n): return [a + (b - a) * i / n for i in range(n + 1)]
def cove_steps(edge, out_dir, n=22):        # fine steps through the flat edge and the cove, tighter where it turns hardest
    pts = [edge, edge + out_dir * CF]
    for i in range(1, n + 1):
        t = (math.pi / 2) * i / n
        pts.append(edge + out_dir * (CF + CA * (1 - math.cos(t))))
    return pts
us = sorted(set([0.0, W_] + steps(0, U0 - CW, 8) + cove_steps(U0, -1) + steps(U0, U1, 24) + cove_steps(U1, 1) + steps(U1 + CW, W_, 8)))
zs = sorted(set(steps(0, NH, 20) + cove_steps(NH, 1) + steps(NH + CW, H - 1, 6)))
bm = bmesh.new()
grid = [[bm.verts.new(P(XU(u), SV(prof(dist(u, z))), z)) for u in us] for z in zs]
for j in range(len(zs) - 1):
    for i in range(len(us) - 1):
        uc, zc = (us[i] + us[i + 1]) / 2, (zs[j] + zs[j + 1]) / 2
        if U0 < uc < U1 and zc < NH: continue                 # the niche opening
        f_ = bm.faces.new((grid[j][i], grid[j][i + 1], grid[j + 1][i + 1], grid[j + 1][i]))
        d_ = dist(uc, zc); f_.smooth = CF < d_ < CW
bm.normal_update()
if sum(f_.normal.y for f_ in bm.faces) < 0: bmesh.ops.reverse_faces(bm, faces=list(bm.faces))   # face the room (+y)
face_ = mesh_obj("bw_face", bm, M_VEN_DK)
# the niche: its two side returns (facing into the niche) and the soffit (facing down), 10 in deep — lined in parchment
# plaster like its back (owner, 3 Oct: the inside of the frame is parchment too)
rt = bmesh.new()
def quad(pts, want):
    f_ = rt.faces.new([rt.verts.new(p_) for p_ in pts]); f_.normal_update()
    if f_.normal.dot(Vector(want)) < 0: f_.normal_flip()
quad([P(XU(U0), SV(v), z) for v, z in ((0, 0), (DEEP, 0), (DEEP, NH), (0, NH))], (-1, 0, 0))     # left return: toward −x (into the niche)
quad([P(XU(U1), SV(v), z) for v, z in ((0, 0), (DEEP, 0), (DEEP, NH), (0, NH))], (1, 0, 0))      # right return: toward +x
quad([P(XU(u), SV(v), NH) for u, v in ((U0, 0), (U1, 0), (U1, DEEP), (U0, DEEP))], (0, 0, -1))   # soffit: down
mesh_obj("bw_niche_returns", rt, M_PARCH)

# marble skirting, 4 in, standing ½ in proud of the build-out and following it round the coves, and along the niche back
SKH, SKP = 102.0, 12.0
sk = bmesh.new()
row_lo = [sk.verts.new(P(XU(u), SV(prof(dist(u, 0)) + SKP), 0)) for u in us]
row_hi = [sk.verts.new(P(XU(u), SV(prof(dist(u, 0)) + SKP), SKH)) for u in us]
row_in = [sk.verts.new(P(XU(u), SV(prof(dist(u, 0))), SKH)) for u in us]
for i in range(len(us) - 1):
    uc = (us[i] + us[i + 1]) / 2
    if U0 < uc < U1: continue
    sk.faces.new((row_lo[i], row_lo[i + 1], row_hi[i + 1], row_hi[i])); sk.faces.new((row_hi[i], row_hi[i + 1], row_in[i + 1], row_in[i]))
mesh_obj("bw_skirting", sk, M_WHITE)
o_ = dbox("bw_skirt_niche", XU(U1) + 1, SV(PL + SKP), 0, XU(U0) - 1, SV(0), SKH, M_WHITE); bevel(o_, 0.002)

# ── the niche back: parchment plaster panels, five across and three up, hairline joints ─────────────────────────────
G_ = 3.0
pw, ph = (U1 - U0) / 5, (NH - SKH) / 3
for i in range(5):
    for j in range(3):
        u0_, u1_ = U0 + i * pw + G_ / 2, U0 + (i + 1) * pw - G_ / 2
        z0_, z1_ = SKH + j * ph + G_ / 2, SKH + (j + 1) * ph - G_ / 2
        o_ = dbox(f"bw_panel{i}{j}", XU(u1_), SV(PL), z0_, XU(u0_), SV(1), z1_, M_PARCH); bevel(o_, 0.0015, 2)
dbox("bw_panel_bed", XU(U1), SV(1), SKH, XU(U0), SV(0), NH, M_DARK)          # the joints read dark

# ── the bed, from the owner's photo ─────────────────────────────────────────────────────────────────────────────────
BC = (U0 + U1) / 2                                      # centred in the niche, on the TV's line
FW, ML, MW, OV = 1929.0, 1981.0, 1829.0, 51.0          # frame 6 ft 4 in; mattress 6 ft × 6 ft 6 in; 2 in past it
HB_B, HB_F = PL + 25.0, PL + 25.0 + 76.0               # headboard 1 in off the plaster, 3 in thick
LEG, RAIL, MATT, HBT = 178.0, 102.0, 254.0, 1016.0
vF0, vF1 = HB_F, HB_F + ML + OV
xa, xb = XU(BC + FW / 2), XU(BC - FW / 2)
# the frame: a 4 in rail with a 1 in lip round a slatted deck
rl = 45.0
for nm, (x0_, s0_, x1_, s1_) in {"bed_frame": (xa, SV(vF1), xb, SV(vF1) + rl), "bed_rail_l": (xa, SV(vF1), xa + rl, SV(vF0)),
                                  "bed_rail_r": (xb - rl, SV(vF1), xb, SV(vF0)), "bed_rail_h": (xa, SV(vF0) - rl, xb, SV(vF0))}.items():
    o_ = dbox(nm, x0_, s0_, LEG, x1_, s1_, LEG + RAIL - 25, M_VEN); bevel(o_, 0.004, 3)
    o_ = dbox(nm + "_lip", x0_ - (6 if nm != "bed_rail_r" else 0), s0_ - 6, LEG + RAIL - 25, x1_ + (6 if nm != "bed_rail_l" else 0), s1_ + 6, LEG + RAIL, M_VEN); bevel(o_, 0.006, 3)
o_ = dbox("bed_deck", xa + rl, SV(vF1) + rl, LEG + RAIL - 30, xb - rl, SV(vF0) - rl, LEG + RAIL - 12, M_VEN)
# five turned bun feet: collar, a swelling body, tapering to the floor
def bun(name, x, s):
    prof_ = [(0, 0), (30, 0), (33, 12), (40, 40), (47, 80), (46, 112), (40, 140), (35, 156), (35, 162), (32, 162), (32, 178), (0, 178)]
    bmb = bmesh.new(); n = 32
    rings = [[bmb.verts.new(P(x + r * math.cos(2 * math.pi * k / n), s - r * math.sin(2 * math.pi * k / n), z)) for k in range(n)] for r, z in prof_]
    for a, b in zip(rings, rings[1:]):
        for k in range(n):
            f_ = bmb.faces.new((a[k], a[(k + 1) % n], b[(k + 1) % n], b[k])); f_.smooth = True
    bmb.normal_update(); o = mesh_obj(name, bmb, M_VEN, FUR); return o
for k, (u_, v_) in enumerate(((BC - FW / 2 + 150, vF0 + 150), (BC + FW / 2 - 150, vF0 + 150), (BC - FW / 2 + 150, vF1 - 150), (BC + FW / 2 - 150, vF1 - 150), (BC, (vF0 + vF1) / 2))):
    bun(f"bed_foot{k}", XU(u_), SV(v_))
# the mattress (the bedding is made on it next, in realism.py)
o_ = box("mattress", XU(BC + MW / 2), SV(vF0 + ML), LEG + RAIL - 12, XU(BC - MW / 2), SV(vF0), LEG + RAIL - 12 + MATT, WALL, FUR)
setmat(o_, M_LINEN_WHITE); bevel(o_, 0.035, 5)
for p_ in o_.data.polygons: p_.use_smooth = True
# the headboard: a plain upholstered panel, the frame's width, its edges eased, standing on the frame's head rail
o_ = box("headboard", xa, SV(HB_F), LEG + 40, xb, SV(HB_B), HBT, WALL, FUR); setmat(o_, M_SUEDE); bevel(o_, 0.022, 6)
for p_ in o_.data.polygons: p_.use_smooth = True

# ── side tables, all wood (owner: no marble): top, one drawer with a brass keyhole, four slim splayed legs ────────────────────────────────
TW, TD, THt = 406.0, 406.0, 610.0
def side_table(k, uc):
    x0_, x1_ = XU(uc + TW / 2), XU(uc - TW / 2); s0_, s1_ = SV(HB_B + TD), SV(HB_B)
    o_ = dbox(f"st{k}_top", x0_ - 8, s0_ - 8, THt - 25, x1_ + 8, s1_ + 4, THt, M_VEN); bevel(o_, 0.004, 3)
    o_ = dbox(f"st{k}_box", x0_, s0_, THt - 150, x1_, s1_, THt - 25, M_VEN); bevel(o_, 0.003, 2)
    o_ = dbox(f"st{k}_drawer", x0_ + 18, s0_ - 3, THt - 138, x1_ - 18, s0_ + 2, THt - 37, M_VEN); bevel(o_, 0.002, 2)
    bpy.ops.mesh.primitive_cylinder_add(vertices=24, radius=0.008, depth=0.004, location=P((x0_ + x1_) / 2, s0_ - 4, THt - 88))
    kh = bpy.context.active_object; kh.name = f"st{k}_key"; kh.rotation_euler = (math.pi / 2, 0, 0); setmat(kh, M_BRASS)
    for i_, (lx, ls) in enumerate(((x0_ + 22, s0_ + 22), (x1_ - 22, s0_ + 22), (x0_ + 22, s1_ - 22), (x1_ - 22, s1_ - 22))):
        dx_, ds_ = (-28 if lx < (x0_ + x1_) / 2 else 28), (-28 if ls < (s0_ + s1_) / 2 else 28)
        top, bot = Vector(P(lx, ls, THt - 150)), Vector(P(lx + dx_, ls + ds_, 0))
        bpy.ops.mesh.primitive_cone_add(vertices=4, radius1=0.011, radius2=0.017, depth=(top - bot).length, location=(top + bot) / 2)
        lg = bpy.context.active_object; lg.name = f"st{k}_leg{i_}"; lg.rotation_euler = (top - bot).to_track_quat("Z", "Y").to_euler(); setmat(lg, M_VEN)
tables_ = (U0 + (BC - FW / 2 - U0) / 2, U1 - (U1 - BC - FW / 2) / 2)
for k, uc in enumerate(tables_): side_table(k, uc)

# ── a brass twin-arm wall lamp over each table, the right wall's lamp ───────────────────────────────────────────────
for k, uc in enumerate(tables_): lamp(f"bw_lamp{k}", XU(uc), SV(PL), 1290, -2, 2, 130)

print(f"bed wall: niche {U1 - U0:.0f} × {NH:.0f}, cove {CW:.0f}; bed {FW:.0f} × {ML + OV + 76:.0f}; tables at u {tables_[0]:.0f}, {tables_[1]:.0f}", flush=True)
