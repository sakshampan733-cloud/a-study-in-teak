# The bed wall and the bed (AST-DR-034 rev 5 / -035 rev 4, owner 7 Oct): exec'd by realism.py just before it makes the
# bed, in its namespace (real.py's helpers and materials, the skeleton's P / box / prism).
#   · the whole wall built out 2 in in Dark Diva veneer, polished DARKER than the rest of the room, sweeping forward in
#     one smooth concave cove — up both sides and across the top — to 15 in at the edge of a niche that holds the bed and
#     both side tables; the coves meet in a mitre at the two top corners. 2 in is D1's lining: the door opens along it
#   · the niche: 15 in deep, 6 ft 6 in high, its back in parchment-plaster panels five across and three up, its sides and
#     soffit plain parchment plaster
#   · the bed: a storage base straight down to the floor (no legs) and the slim upholstered headboard behind it — the
#     finish of both still the owner's to choose, so they carry their own materials (bed_base_finish, headboard_finish)
#   · a side table each side, 16 × 14 in, a white marble slab set flush in its teak rim; a brass twin-arm lamp over each
#   · a Sony rear speaker high on each plain face, the right one 2 in over the open door
# Plan: x east, s south from the study wall; the bed wall's face is s = Lb. Along the wall u runs from the dressing
# (right-wall) corner, v comes out from the wall: x = xR − u, s = Lb − v.
import bpy, bmesh, math
from mathutils import Vector, Matrix

W_ = xR - xLb                              # 15 ft 6 in
EDGE, DEEP = 51.0, 381.0                   # 2 in everywhere, 15 in at the niche (owner, 7 Oct)
U0, U1, NH = 787.0, 3632.0, 1981.0         # the niche: the old bed-back span, 6 ft 6 in high
CA, CF = 152.0, 25.0                       # cove: 6 in along the wall (7 in out), then a 1 in flat edge
CW, CB = CA + CF, DEEP - EDGE
PL = 20.0                                  # parchment plaster on board, on the niche back
XU = lambda u: xR - u
SV = lambda v: Lb - v

for n_ in ("parchment_wall", "sk_bed", "bed_base", "bed_frame", "headboard", "back_cushion", "mattress", "duvet", "duvet_fold", "throw",
           "pillow_b0", "pillow_b1", "pillow_f0", "pillow_f1", "pillow0", "pillow1"):
    o_ = sc.objects.get(n_)
    if o_: bpy.data.objects.remove(o_, do_unlink=True)

M_VEN_DK = veneer("dark_diva_bedwall", 0.30, 0.42, 0.80, 1.0, "dark_diva_crown.jpg", (0.9, 0.9, 1.1))   # the same Dark Diva, polished darker
M_SPK = fabric("speaker_cloth", (0.025, 0.025, 0.028), 0.3, 0.95, 1400)                               # the speakers' black grille cloth
BW_ = bpy.data.collections.new("bedwall"); sc.collection.children.link(BW_)

def mesh_obj(name, bm, mat, coll=BW_):
    me = bpy.data.meshes.new(name); bm.to_mesh(me); bm.free()
    o = bpy.data.objects.new(name, me); coll.objects.link(o); o.data.materials.append(mat); return o

# ── the build-out's face, a height field v(u, z): 16 in at the niche, the cove, then 3 in ──────────────────────────
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
# the niche: its two side returns (facing into the niche) and the soffit (facing down), 16 in deep — lined in parchment
# plaster like its back (owner, 3 Oct: the inside of the frame is parchment too)
rt = bmesh.new()
def quad(pts, want):
    f_ = rt.faces.new([rt.verts.new(p_) for p_ in pts]); f_.normal_update()
    if f_.normal.dot(Vector(want)) < 0: f_.normal_flip()
quad([P(XU(U0), SV(v), z) for v, z in ((0, 0), (DEEP, 0), (DEEP, NH), (0, NH))], (-1, 0, 0))     # left return: toward −x (into the niche)
quad([P(XU(U1), SV(v), z) for v, z in ((0, 0), (DEEP, 0), (DEEP, NH), (0, NH))], (1, 0, 0))      # right return: toward +x
quad([P(XU(u), SV(v), NH) for u, v in ((U0, 0), (U1, 0), (U1, DEEP), (U0, DEEP))], (0, 0, -1))   # soffit: down
mesh_obj("bw_niche_returns", rt, M_PARCH)

# marble skirting, 4 in, flush with the build-out's veneer (so the open door's heel clears it) and following it round the
# coves; along the niche back it stands ½ in proud of the plaster
SKH, SKP = 102.0, 1.0
sk = bmesh.new()
row_lo = [sk.verts.new(P(XU(u), SV(prof(dist(u, 0)) + SKP), 0)) for u in us]
row_hi = [sk.verts.new(P(XU(u), SV(prof(dist(u, 0)) + SKP), SKH)) for u in us]
row_in = [sk.verts.new(P(XU(u), SV(prof(dist(u, 0))), SKH)) for u in us]
for i in range(len(us) - 1):
    uc = (us[i] + us[i + 1]) / 2
    if U0 < uc < U1: continue
    sk.faces.new((row_lo[i], row_lo[i + 1], row_hi[i + 1], row_hi[i])); sk.faces.new((row_hi[i], row_hi[i + 1], row_in[i + 1], row_in[i]))
mesh_obj("bw_skirting", sk, M_WHITE)
o_ = dbox("bw_skirt_niche", XU(U1) + 1, SV(PL + 12), 0, XU(U0) - 1, SV(0), SKH, M_WHITE); bevel(o_, 0.002)

# ── the niche back: parchment plaster panels, five across and three up, hairline joints ─────────────────────────────
G_ = 3.0
pw, ph = (U1 - U0) / 5, (NH - SKH) / 3
for i in range(5):
    for j in range(3):
        u0_, u1_ = U0 + i * pw + G_ / 2, U0 + (i + 1) * pw - G_ / 2
        z0_, z1_ = SKH + j * ph + G_ / 2, SKH + (j + 1) * ph - G_ / 2
        o_ = dbox(f"bw_panel{i}{j}", XU(u1_), SV(PL), z0_, XU(u0_), SV(1), z1_, M_PARCH); bevel(o_, 0.0015, 2)
dbox("bw_panel_bed", XU(U1), SV(1), SKH, XU(U0), SV(0), NH, M_DARK)          # the joints read dark

# ── the bed: a storage base to the floor, the headboard behind (owner, 7 Oct) ─────────────────────────────────────
# The finish is the owner's to choose (wood, leather or something shiny) before the film: the base and the headboard
# each carry their own material, so the choice is a swap here. Until then the room's Dark Diva on the base and the
# photo's dusty-rose suede on the headboard.
BC = (U0 + U1) / 2                                      # centred in the niche, on the TV's line
FW, ML, MW, OV = 1929.0, 1981.0, 1829.0, 51.0          # base 6 ft 4 in; mattress 6 ft × 6 ft 6 in; 2 in past it at sides and foot
HB_B, HB_T, HB_H = PL + 25.0, 76.0, 1016.0              # the headboard 1 in off the plaster, 3 in thick, 3 ft 4 in high
HB_F = HB_B + HB_T
BASE, MATT = 280.0, 254.0                              # 11 in to the mattress; a 10 in mattress
vF0, vF1 = HB_F, HB_F + ML + OV
xa, xb = XU(BC + FW / 2), XU(BC - FW / 2)
M_BED = veneer("bed_base_finish", 0.32, 0.4, 1.12, 1.0, "dark_diva_crown.jpg", (0.9, 0.9, 1.1))
M_HEAD = fabric("headboard_finish", (0.50, 0.33, 0.30), 0.75, 0.9, 700)
o_ = dbox("bed_base", xa, SV(vF1), 0, xb, SV(vF0), BASE, M_BED); bevel(o_, 0.005, 3)
o_ = dbox("headboard", xa, SV(HB_F), 0, xb, SV(HB_B), HB_H, M_HEAD); bevel(o_, 0.018, 5)
for p_ in o_.data.polygons: p_.use_smooth = True
# the mattress (the bedding is made on it next, in realism.py)
o_ = box("mattress", XU(BC + MW / 2), SV(vF0 + ML), BASE, XU(BC - MW / 2), SV(vF0), BASE + MATT, WALL, FUR)
setmat(o_, M_LINEN_WHITE); bevel(o_, 0.035, 5)
for p_ in o_.data.polygons: p_.use_smooth = True

# ── side tables: a white marble slab set flush in a teak rim (owner, 7 Oct), one drawer with a brass keyhole, four
#    slim splayed legs ─────────────────────────────────────────────────────────────────────────────────────────────
TW, TD, THt, TT, RIM = 406.0, 356.0, 610.0, 32.0, 45.0   # 16 in wide, 14 in deep, 24 in high; 1¼ in top, 1¾ in rim
def side_table(k, uc):
    x0_, x1_ = XU(uc + TW / 2), XU(uc - TW / 2); s0_, s1_ = SV(PL + TD), SV(PL)
    for nm, (a0_, b0_, a1_, b1_) in {"l": (x0_, s0_, x0_ + RIM, s1_), "r": (x1_ - RIM, s0_, x1_, s1_),
                                     "f": (x0_ + RIM, s0_, x1_ - RIM, s0_ + RIM), "b": (x0_ + RIM, s1_ - RIM, x1_ - RIM, s1_)}.items():
        o_ = dbox(f"st{k}_rim_{nm}", a0_, b0_, THt - TT, a1_, b1_, THt, M_VEN); bevel(o_, 0.0025, 2)
    o_ = dbox(f"st{k}_marble", x0_ + RIM + 1, s0_ + RIM + 1, THt - 20, x1_ - RIM - 1, s1_ - RIM - 1, THt, M_WHITE); bevel(o_, 0.0008, 1)
    o_ = dbox(f"st{k}_box", x0_ + 10, s0_ + 10, THt - 150, x1_ - 10, s1_ - 4, THt - TT, M_VEN); bevel(o_, 0.003, 2)
    o_ = dbox(f"st{k}_drawer", x0_ + 28, s0_ + 7, THt - 140, x1_ - 28, s0_ + 12, THt - TT - 10, M_VEN); bevel(o_, 0.002, 2)
    bpy.ops.mesh.primitive_cylinder_add(vertices=24, radius=0.008, depth=0.004, location=P((x0_ + x1_) / 2, s0_ + 6, THt - 91))
    kh = bpy.context.active_object; kh.name = f"st{k}_key"; kh.rotation_euler = (math.pi / 2, 0, 0); setmat(kh, M_BRASS)
    for i_, (lx, ls) in enumerate(((x0_ + 32, s0_ + 32), (x1_ - 32, s0_ + 32), (x0_ + 32, s1_ - 26), (x1_ - 32, s1_ - 26))):
        dx_, ds_ = (-28 if lx < (x0_ + x1_) / 2 else 28), (-28 if ls < (s0_ + s1_) / 2 else 18)
        top, bot = Vector(P(lx, ls, THt - 150)), Vector(P(lx + dx_, ls + ds_, 0))
        bpy.ops.mesh.primitive_cone_add(vertices=4, radius1=0.011, radius2=0.017, depth=(top - bot).length, location=(top + bot) / 2)
        lg = bpy.context.active_object; lg.name = f"st{k}_leg{i_}"; lg.rotation_euler = (top - bot).to_track_quat("Z", "Y").to_euler(); setmat(lg, M_VEN)
tables_ = (U0 + (BC - FW / 2 - U0) / 2, U1 - (U1 - BC - FW / 2) / 2)
for k, uc in enumerate(tables_): side_table(k, uc)

# ── the rear speakers: 106 × 216 × 98 (Sony), on a short bracket 6 mm off the 2 in face, 7 ft 9 in up — square on the
#    bed, each in the middle of a plain face; the right one clears the open door's top by 2 in ───────────────────────
for k, u_ in enumerate((305.0, 2 * BC - 305.0)):
    o_ = dbox(f"bw_speaker{k}", XU(u_ + 53), SV(EDGE + 6 + 98), 2362, XU(u_ - 53), SV(EDGE + 6), 2578, M_SPK); bevel(o_, 0.012, 4)
    dbox(f"bw_speaker{k}_bracket", XU(u_ + 16), SV(EDGE + 6), 2440, XU(u_ - 16), SV(EDGE), 2500, M_IRON)

# ── a brass twin-arm wall lamp over each table, the right wall's lamp ───────────────────────────────────────────────
for k, uc in enumerate(tables_): lamp(f"bw_lamp{k}", XU(uc), SV(PL), 1290, -2, 2, 130)

print(f"bed wall: niche {U1 - U0:.0f} × {NH:.0f} × {DEEP:.0f}, cove {CW:.0f}; bed {FW:.0f} × {ML + OV + HB_T:.0f} on a base to the floor; tables at u {tables_[0]:.0f}, {tables_[1]:.0f}", flush=True)
