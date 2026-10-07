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
# the parchment blocks vary, darker and lighter, as the owner's photo (7 Oct): each panel takes its own tone from its object's
# random number, on its own copy of the parchment so nothing else in the room changes
def _vary_tone(m, lo=0.74, hi=1.10):
    nt = m.node_tree; b = nt.nodes.get("Principled BSDF")
    lk = next((l for l in nt.links if l.to_node == b and l.to_socket.name == "Base Color"), None)
    if not lk: return m
    src = lk.from_socket; nt.links.remove(lk)
    oi = nt.nodes.new("ShaderNodeObjectInfo"); mr = nt.nodes.new("ShaderNodeMapRange"); mr.inputs["To Min"].default_value = lo; mr.inputs["To Max"].default_value = hi
    nt.links.new(oi.outputs["Random"], mr.inputs["Value"])
    mx = nt.nodes.new("ShaderNodeMixRGB"); mx.blend_type = "MULTIPLY"; mx.inputs["Fac"].default_value = 1.0
    nt.links.new(src, mx.inputs["Color1"]); nt.links.new(mr.outputs["Result"], mx.inputs["Color2"]); nt.links.new(mx.outputs["Color"], b.inputs["Base Color"])
    return m
M_PARCH_V = _vary_tone(M_PARCH.copy())
for o_ in sc.objects:
    if o_.name.startswith("bw_panel") and o_.name != "bw_panel_bed": setmat(o_, M_PARCH_V)

# ── the bed: a storage base to the floor, the headboard behind (owner, 7 Oct) ─────────────────────────────────────
# The headboard stays the photo's dusty-rose suede (owner, 7 Oct: "keep the headboard same"); the base is GLOSS BLACK
# (owner, 7 Oct: "let's go with shiny black") — black lacquer, the room's one black accent, Deco with the rose. The
# bedding covers most of it, so only the 11 in band reads. Each keeps its own material: a one-line swap.
BC = (U0 + U1) / 2                                      # centred in the niche, on the TV's line
FW, ML, MW, OV = 1929.0, 1981.0, 1829.0, 51.0          # base 6 ft 4 in; mattress 6 ft × 6 ft 6 in; 2 in past it at sides and foot
HB_B, HB_T, HB_H = PL + 25.0, 76.0, 1016.0              # the headboard 1 in off the plaster, 3 in thick, 3 ft 4 in high
HB_F = HB_B + HB_T
BASE, MATT = 280.0, 254.0                              # 11 in to the mattress; a 10 in mattress
vF0, vF1 = HB_F, HB_F + ML + OV
xa, xb = XU(BC + FW / 2), XU(BC - FW / 2)
def laminate(name, col, rough):
    m, nt, b = node_mat(name)
    b.inputs["Base Color"].default_value = (*col, 1); b.inputs["Roughness"].default_value = rough
    rough_var(nt, b, 0.05, 6.0, 4.0); noise_bump(nt, b, 300, 0.015, 0.0003)        # the fine grain of a super-matte face
    return m
def lacquer(name, col):
    m, nt, b = node_mat(name)
    b.inputs["Base Color"].default_value = (*col, 1); b.inputs["Roughness"].default_value = 0.08
    b.inputs["Coat Weight"].default_value = 1.0; b.inputs["Coat Roughness"].default_value = 0.02
    rough_var(nt, b, 0.03, 4.0, 3.0)
    return m
M_BED = lacquer("bed_base_finish", (0.010, 0.010, 0.011))                 # gloss black lacquer
M_HEAD = fabric("headboard_finish", (0.50, 0.33, 0.30), 0.75, 0.9, 700)      # dusty-rose suede
o_ = dbox("bed_base", xa, SV(vF1), 0, xb, SV(vF0), BASE, M_BED); bevel(o_, 0.005, 3)
# the headboard: a rose suede panel in a thin gloss-black frame round its top and sides — 1¼ in face, as thin as the
# dressing mirror's frame, 2¾ in deep — the panel ¼ in proud of it (owner, 7 Oct)
HBF, HBD = 32.0, 70.0
for nm_, (x0_, x1_, z0_, z1_) in {"top": (xa, xb, HB_H - HBF, HB_H), "l": (xa, xa + HBF, 0, HB_H - HBF), "r": (xb - HBF, xb, 0, HB_H - HBF)}.items():
    o_ = dbox(f"headboard_frame_{nm_}", x0_, SV(HB_B + HBD), z0_, x1_, SV(HB_B), z1_, M_BED); bevel(o_, 0.003, 3)
o_ = dbox("headboard", xa + HBF, SV(HB_F), 0, xb - HBF, SV(HB_B + 2), HB_H - HBF, M_HEAD); bevel(o_, 0.006, 4)
for p_ in o_.data.polygons: p_.use_smooth = True
# the mattress (the bedding is made on it next, in realism.py)
o_ = box("mattress", XU(BC + MW / 2), SV(vF0 + ML), BASE, XU(BC - MW / 2), SV(vF0), BASE + MATT, WALL, FUR)
setmat(o_, M_LINEN_WHITE); bevel(o_, 0.035, 5)
for p_ in o_.data.polygons: p_.use_smooth = True

# ── side tables after the owner's photo (7 Oct, AST-DR-049): a shaped serpentine top with a moulded edge, polished
#    dark — no stone; a burl apron with one drawer and a brass rosette knob; a carved console at each corner; slim
#    cabriole legs ending in a scroll toe ─────────────────────────────────────────────────────────────────────────────
TW, TD, THt, TT = 406.0, 356.0, 610.0, 22.0             # 16 in wide, 14 in deep, 24 in high, a 7/8 in top
SERP, SIDEIN, APR, APS, APF, APB, LEG = 16.0, 8.0, 100.0, 34.0, 30.0, 24.0, 34.0
M_STDARK = veneer("sidetable_dark", 0.20, 0.8, 0.42, 1.0, "dark_diva_crown.jpg", (0.9, 0.9, 1.1))   # top, legs, consoles: polished dark
def st_outline():
    n, r, o = 24, 9.0, []
    for i in range(n + 1): y = (i / n) * (TD - r); o.append((SIDEIN * math.sin(math.pi * y / TD) ** 2, y))
    for k in range(1, 4): a = math.pi - (k / 4) * math.pi / 2; o.append((r + r * math.cos(a), TD - r + r * math.sin(a)))
    for i in range(n + 1): x = r + (i / n) * (TW - 2 * r); o.append((x, TD - SERP * math.sin(2 * math.pi * x / TW) ** 2))
    for k in range(1, 4): a = math.pi / 2 - (k / 4) * math.pi / 2; o.append((TW - r + r * math.cos(a), TD - r + r * math.sin(a)))
    for i in range(n, -1, -1): y = (i / n) * (TD - r); o.append((TW - SIDEIN * math.sin(math.pi * y / TD) ** 2, y))
    return o
# the cabriole, read off the drawing: (z, the leg's width, how far its centre stands out from the apron corner)
CAB = [(488, 36, 0), (470, 38, 4), (440, 42, 11), (392, 42, 15), (330, 36, 12), (230, 24, 3), (150, 21, 1), (66, 19, 1.5), (30, 21, 7), (8, 26, 13), (0, 20, 13)]
# the top's moulded edge, run round the outline: (how far in from the outline, height) — the thumbnail, a fillet, the cove
EDGE_P = [(10, 610), (5, 609.6), (2, 608.2), (0.3, 605.5), (0, 602.5), (0.5, 599.5), (2, 597.5), (3.2, 596), (3.2, 593), (4.5, 590.5), (7, 588.6), (10, 588)]
def side_table(k, uc):
    W2P = lambda x, y, z: P(XU(uc - TW / 2 + x), SV(PL + y), z)          # table-local → the room
    # the top: the moulded edge lofted round the outline (smooth), flat faces top and bottom
    ol = st_outline(); n_ = len(ol); nrm = []
    for i in range(n_):
        (xa_, ya_), (xb_, yb_) = ol[i - 1], ol[(i + 1) % n_]
        tx, ty = xb_ - xa_, yb_ - ya_; l_ = math.hypot(tx, ty) or 1.0
        nrm.append((ty / l_, -tx / l_))                               # the outline runs clockwise on the page: this points out
    cx_, cy_ = TW / 2, TD / 2
    if sum(nx * (x - cx_) + ny * (y - cy_) for (x, y), (nx, ny) in zip(ol, nrm)) < 0: nrm = [(-nx, -ny) for nx, ny in nrm]
    bm_ = bmesh.new()
    rings = [[bm_.verts.new(W2P(x - nx * d, y - ny * d, z)) for (x, y), (nx, ny) in zip(ol, nrm)] for d, z in EDGE_P]
    for ra, rb in zip(rings, rings[1:]):
        for i in range(n_):
            f_ = bm_.faces.new((ra[i], ra[(i + 1) % n_], rb[(i + 1) % n_], rb[i])); f_.smooth = True
    ft_ = bm_.faces.new(rings[0]); fb_ = bm_.faces.new(rings[-1][::-1])
    bmesh.ops.triangulate(bm_, faces=[ft_, fb_], quad_method="BEAUTY", ngon_method="EAR_CLIP")
    bmesh.ops.recalc_face_normals(bm_, faces=bm_.faces[:]); top = mesh_obj(f"st{k}_top", bm_, M_STDARK, FUR)
    x0_, x1_ = XU(uc - TW / 2 + APS), XU(uc + TW / 2 - APS); s0_, s1_ = SV(PL + TD - APF), SV(PL + APB)
    zA, zB = THt - TT, THt - TT - APR
    o_ = dbox(f"st{k}_apron", min(x0_, x1_), s0_, zB, max(x0_, x1_), s1_, zA, M_BURL); bevel(o_, 0.002, 2)
    xa, xb = XU(uc - TW / 2 + 70), XU(uc + TW / 2 - 70)
    o_ = dbox(f"st{k}_drawer", min(xa, xb), s0_ - 3, zB + 12, max(xa, xb), s0_ + 1, zA - 12, M_BURL); bevel(o_, 0.0025, 3)
    for nm_, (rad, dep, off) in {"rose": (0.015, 0.003, 4.5), "knob": (0.008, 0.012, 10.5)}.items():
        bpy.ops.mesh.primitive_cylinder_add(vertices=32, radius=rad, depth=dep, location=P(XU(uc), s0_ - off, zB + APR / 2))
        kb = bpy.context.active_object; kb.name = f"st{k}_{nm_}"; kb.rotation_euler = (math.pi / 2, 0, 0); setmat(kb, M_BRASS); bevel(kb, 0.002, 3)
    # the four legs and their consoles: the front pair bulge out on the diagonal, the back pair sideways only (the wall)
    for i_, (lx, ly, sx, sy) in enumerate(((APS, TD - APF, -1, 1), (TW - APS, TD - APF, 1, 1), (APS, APB, -1, 0), (TW - APS, APB, 1, 0))):
        cx, cy = lx - sx * LEG / 2, ly - (sy if sy else -1) * LEG / 2
        bl = bmesh.new(); rings = []
        for z, w, d in CAB:
            ox, oy = cx + sx * d, cy + sy * d; h_ = w / 2
            ring = []
            for a in range(16):
                t = 2 * math.pi * a / 16; c_, s_ = math.cos(t), math.sin(t)
                rr_ = h_ / max(abs(c_), abs(s_)) ** 0.25 if max(abs(c_), abs(s_)) > 0 else h_      # a softly squared section
                ring.append(bl.verts.new(W2P(ox + rr_ * c_ * 0.93, oy + rr_ * s_ * 0.93, z)))
            rings.append(ring)
        for ra, rb in zip(rings, rings[1:]):
            for a in range(16): f_ = bl.faces.new((ra[a], ra[(a + 1) % 16], rb[(a + 1) % 16], rb[a])); f_.smooth = True
        bl.faces.new(rings[-1]); bl.faces.new(rings[0][::-1]); bmesh.ops.recalc_face_normals(bl, faces=bl.faces[:])
        lg = mesh_obj(f"st{k}_leg{i_}", bl, M_STDARK, FUR)
        ca, cb = XU(uc - TW / 2 + lx - sx * 11 - 11), XU(uc - TW / 2 + lx - sx * 11 + 11)
        cs0, cs1 = SV(PL + ly - (sy if sy else -1) * 11 + 11), SV(PL + ly - (sy if sy else -1) * 11 - 11)
        o_ = dbox(f"st{k}_console{i_}", min(ca, cb), min(cs0, cs1), zB - 30, max(ca, cb), max(cs0, cs1), zA, M_STDARK); bevel(o_, 0.004, 3)
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
