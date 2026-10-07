# The study wall, second scheme WITH the arches (AST-DR-040, owner-approved 7 Oct) — exec'd at the end of joinery.py's
# study wall, in its namespace (dbox, run, sweep, frame_on, the profiles, the materials, book, pil, xP2, xR, CASE, CTOP,
# WIN, T). joinery.py has built the cupboards, counter, pedestals, fluted pilasters and the bookcase carcass; this
# replaces what the second scheme changed:
#   · the bookcase's flat head → a segmental arch (spring 1999, rise 320) with three deep rectangular niches in its
#     soffit, an archivolt in three steps, impost blocks, and spandrel mouldings curved to the arch
#   · the window head → the same arch (spring 2037, rise 300): a wood panel flush with the window frame fills the
#     corners above it (no glass in the arch), three niches in its soffit, the archivolt dying into the side wall
#   · the centre bay → pushed back to 25 off the wall, so the counter is a real 9 in shelf: plain skirting, a slim
#     three-step frame with a row of beads; the painting goes in it (realism.py); a band panel over it
#   · the cornice → the smaller dentil crown of the owner's photo, 307 high, breaking forward over the pilasters
# Plan: x along the wall from the left corner, s into the room (the wall face at s = 0), z up. Real mm.
import bmesh, math
from mathutils import Vector, Matrix

for o in list(sc.objects):
    if o.name.startswith(("st_head", "st_band", "st_cback", "st_bolection", "st_cfield", "st_cpicrail", "st_cor", "st_cyma",
                          "st_mod", "st_den", "st_whead")):
        bpy.data.objects.remove(o, do_unlink=True)

ENT = [40, 120, 25, 22, 35, 50, 15]                                   # architrave, frieze, bed, dentils, cove, crown, fillet
YENT = 2769 - sum(ENT)                                               # 2462
FACE = CASE                                                          # the unit's face, 280 off the wall
BX0, BX1, STILE = 0.0, float(book), 60.0
CX0, CX1 = float(book + pil), float(xP2)                             # the centre bay
ZX0 = float(xP2 + pil); WX0, WX1 = float(WIN["x0"]), float(xR)       # the window zone and the window
YOPEN, YBAND = YENT - 400, YENT - 360                                # the centre bay's soffit (rail 40, band 360)

def bm_obj(name, bm, m, smooth=False):
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces[:])
    me = bpy.data.meshes.new(name); bm.to_mesh(me); bm.free()
    for p_ in me.polygons: p_.use_smooth = smooth
    o = bpy.data.objects.new(name, me); J.objects.link(o); setmat(o, m); return o

def seg_arch(xa, xb, ys, rise):
    c = xb - xa; R = (c * c / 4 + rise * rise) / (2 * rise)
    return dict(xa=xa, xb=xb, ys=ys, R=R, cx=(xa + xb) / 2, cy=ys + rise - R, th=math.asin(c / 2 / R))
def apt(g, r, a): return (g["cx"] + r * math.sin(a), g["cy"] + r * math.cos(a))
def ang_at(g, r, y): return math.acos(max(-1.0, min(1.0, (y - g["cy"]) / r)))

def face_with_arch(name, g, x0, x1, z_top, s_face, thick, m, x_clip=None):
    """The flat face over an arch: the rectangle x0..x1 × springing..z_top with the arch cut out, `thick` deep behind
    s_face. Built as two halves meeting at the crown so every face is simple."""
    bm = bmesh.new(); n = 40
    for side in (-1, 1):
        arc = [apt(g, g["R"], side * g["th"] * (1 - i / n)) for i in range(n + 1)]       # springing → crown
        xo = x0 if side < 0 else x1
        pts = [(xo, z_top), (g["cx"], z_top)] + arc[::-1]                                   # crown → springing
        if abs(xo - pts[-1][0]) > 0.5: pts.append((xo, g["ys"]))
        for ds in (0.0, -thick):
            vs = [bm.verts.new(P(x, s_face + ds, z)) for x, z in pts]
            bm.faces.new(vs if side > 0 else vs[::-1])
    o = bm_obj(name, bm, m)
    return o

def soffit(name, g, s_back, s_face, niche_c, niches, n_len=380.0, n_wid=180.0, n_dep=90.0, m=None):
    """The arch's underside from s_back to s_face, with deep rectangular niches cut up into it: (arc start, arc end)
    in arc length from the left springing, centred niche_c out from the wall."""
    L = 2 * g["th"] * g["R"]; ns0, ns1 = niche_c - n_wid / 2, niche_c + n_wid / 2
    ts = sorted(set([0.0, L] + [t for a, b in niches for t in (a, b)] + [L * i / 60 for i in range(1, 60)]))
    ss = sorted(set([s_back, s_face, ns0, ns1]))
    ang = lambda t: -g["th"] + t / g["R"]
    bm = bmesh.new()
    V = {(i, j): bm.verts.new(P(apt(g, g["R"], ang(t))[0], s, apt(g, g["R"], ang(t))[1])) for i, t in enumerate(ts) for j, s in enumerate(ss)}
    inside = lambda t, s: any(a <= t <= b for a, b in niches) and ns0 <= s <= ns1
    for i in range(len(ts) - 1):
        for j in range(len(ss) - 1):
            if inside((ts[i] + ts[i + 1]) / 2, (ss[j] + ss[j + 1]) / 2): continue
            bm.faces.new((V[i, j], V[i + 1, j], V[i + 1, j + 1], V[i, j + 1]))
    # each niche: its two ends, two sides and a curved top, n_dep up into the arch
    for a, b in niches:
        k = 8; tt = [a + (b - a) * q / k for q in range(k + 1)]
        lo = lambda t, s: P(apt(g, g["R"], ang(t))[0], s, apt(g, g["R"], ang(t))[1])
        hi = lambda t, s: P(apt(g, g["R"] + n_dep, ang(t))[0], s, apt(g, g["R"] + n_dep, ang(t))[1])
        for q in range(k):
            for s_ in (ns0, ns1):
                bm.faces.new([bm.verts.new(v) for v in (lo(tt[q], s_), lo(tt[q + 1], s_), hi(tt[q + 1], s_), hi(tt[q], s_))])
            bm.faces.new([bm.verts.new(v) for v in (hi(tt[q], ns0), hi(tt[q + 1], ns0), hi(tt[q + 1], ns1), hi(tt[q], ns1))])
        for t_ in (a, b):
            bm.faces.new([bm.verts.new(v) for v in (lo(t_, ns0), lo(t_, ns1), hi(t_, ns1), hi(t_, ns0))])
    bmesh.ops.remove_doubles(bm, verts=bm.verts[:], dist=1e-6)
    return bm_obj(name, bm, m or M_VEN)

def three_niches(g, n=3, n_len=380.0):
    L = 2 * g["th"] * g["R"]; gap = (L - n * n_len) / (n + 1)
    return [(gap + i * (n_len + gap), gap + i * (n_len + gap) + n_len) for i in range(n)]

def archivolt(name, g, s_face, mould, a0=None, a1=None, steps=(20, 14, 8)):
    """The archivolt on the face: three steps, `mould` wide outward from the arch, proud of the face."""
    a0 = -ang_at(g, g["R"] + mould, g["ys"]) if a0 is None else a0
    a1 = ang_at(g, g["R"] + mould, g["ys"]) if a1 is None else a1
    w3 = mould / 3
    for k, proud in enumerate(steps):
        r0, r1 = g["R"] + k * w3, g["R"] + (k + 1) * w3
        bm = bmesh.new(); n = 64; rows = []
        for i in range(n + 1):
            a = a0 + (a1 - a0) * i / n
            rows.append([bm.verts.new(P(apt(g, r, a)[0], s_face + d, apt(g, r, a)[1])) for r in (r0, r1) for d in (0, proud)])
        for ra, rb in zip(rows, rows[1:]):
            for (i0, i1) in ((0, 1), (1, 3), (3, 2), (2, 0)): bm.faces.new((ra[i0], ra[i1], rb[i1], rb[i0]))
        for r_ in (rows[0], rows[-1]): bm.faces.new((r_[0], r_[1], r_[3], r_[2]))
        bm_obj(f"{name}{k}", bm, M_VEN)

def spandrel_frame(name, g, ro, xc, yt, dx, s_face, inset=25, gap=30):
    """A moulding round the spandrel: down the jamb, along under the cornice, and curved parallel to the archivolt."""
    x0, y0, rr = xc + dx * inset, yt - inset, ro + gap
    yb = max(g["ys"] + 30, g["cy"] + math.sqrt(max(0.0, rr * rr - (x0 - g["cx"]) ** 2)))
    yTip = y0 - 60; xt = g["cx"] - dx * math.sqrt(max(0.0, rr * rr - (yTip - g["cy"]) ** 2))
    aB, aC = math.atan2(x0 - g["cx"], yb - g["cy"]), math.atan2(xt - g["cx"], yTip - g["cy"])
    pts = [(x0, y0), (x0, yb)] + [apt(g, rr, aB + (aC - aB) * i / 24) for i in range(25)] + [(xt, y0)]
    sweep(name, [(0, 0), (0, 8), (5, 10), (10, 8), (14, 0)], [(x, s_face, z) for x, z in pts], (0, -1, 0), True, M_VEN)

# ═══ the crown: the smaller dentil cornice, breaking forward over the pilasters ═══
def P_crown():
    pts = [(0, 0), (8, 0), (8, 14), (14, 14), (14, 40), (6, 40), (6, 160)]                         # architrave steps, frieze
    pts += [(6 + 24 * math.sin(t), 160 + 25 * (1 - math.cos(t))) for t in [i * math.pi / 2 / 6 for i in range(1, 7)]]   # bed mould (ovolo)
    pts += [(30, 185), (30, 207)]                                                                    # behind the dentils
    pts += [(30 + 55 * (1 - math.cos(t)), 207 + 35 * math.sin(t)) for t in [i * math.pi / 2 / 6 for i in range(1, 7)]]  # the cove
    pts += [(85 + 25 * (0.5 - 0.5 * math.cos(math.pi * u)), 242 + 42 * u) for u in [i / 10 for i in range(1, 11)]]      # the cyma
    pts += [(110, 292), (120, 292), (120, 307), (0, 307)]
    return pts
CROWN = P_crown()
def crown(tag, x0, x1, sface):
    run(f"st2_crown{tag}", CROWN, x1, sface, x0, sface, YENT)
    x = x0 + 8
    while x + 12 < x1 - 8:
        dbox(f"st2_dent{tag}{x:.0f}", x, sface + 30, YENT + 185, x + 12, sface + 50, YENT + 207, M_VEN); x += 20
crown("m", 0, xR, FACE)
for i, a in enumerate((float(book), float(xP2))):
    crown(f"p{i}", a - 22, a + pil + 22, FACE + 40)
    dbox(f"st2_capx{i}", a - 13, CASE, 2439, a + pil + 13, CASE + 53, YENT, M_VEN)            # the capital carried up to the crown

# ═══ the bookcase: the arch over its top bay ═══
gB = seg_arch(BX0 + STILE, BX1 - STILE, 1999.0, 320.0)
for x0_ in (BX0, BX1 - STILE):
    dbox(f"st2_bside_hi{x0_:.0f}", x0_, 0, 2039, x0_ + STILE, FACE, YENT, M_VEN)
dbox("st2_bback_hi", BX0 + STILE, 0, 2039, BX1 - STILE, 18, YENT, M_VEN)
face_with_arch("st2_bk_face", gB, BX0, BX1, YENT, FACE, 22, M_VEN)
soffit("st2_bk_soffit", gB, 18, FACE - 22, FACE - 149, three_niches(gB))
archivolt("st2_bk_volt", gB, FACE, 46)
for (a, b) in ((BX0, BX0 + STILE), (BX1 - STILE, BX1)):
    im = dbox(f"st2_bk_impost{a:.0f}", a - 6, FACE - 4, gB["ys"] - 34, b + 6, FACE + 14, gB["ys"], M_VEN); bevel(im, 0.002, 2)
spandrel_frame("st2_bk_spanL", gB, gB["R"] + 46, BX0, YENT, 1, FACE)
spandrel_frame("st2_bk_spanR", gB, gB["R"] + 46, BX1, YENT, -1, FACE)

# ═══ the window: the arch in its head, a wood panel flush with the frame above it, niches in its soffit ═══
gW = seg_arch(WX0, WX1, WIN["head"] - 300.0, 300.0)
GLASS_S = -T / 2 + 40                                                  # the window frame's room face
bmw = bmesh.new(); n_ = 40
for side in (-1, 1):
    arc = [apt(gW, gW["R"], side * gW["th"] * (1 - i / n_)) for i in range(n_ + 1)]
    xo = WX0 if side < 0 else WX1
    pts = [(xo, WIN["head"]), (gW["cx"], WIN["head"])] + arc[::-1]
    vs = [bmw.verts.new(P(x, GLASS_S, z)) for x, z in pts]; bmw.faces.new(vs if side > 0 else vs[::-1])
pw_ = bm_obj("st2_win_archpanel", bmw, M_VEN)
so_ = pw_.modifiers.new("t", "SOLIDIFY"); so_.thickness = 0.02
dbox("st2_win_head", ZX0, GLASS_S, WIN["head"], xR, FACE, YENT, M_VEN)                          # the head over the window, to the crown
face_with_arch("st2_win_face", gW, ZX0, xR, WIN["head"], FACE, 22, M_VEN)
soffit("st2_win_soffit", gW, GLASS_S, FACE - 22, FACE - 140, three_niches(gW))
a_wall = math.asin(min(1.0, (xR - gW["cx"]) / (gW["R"] + 56)))
archivolt("st2_win_volt", gW, FACE, 56, None, min(a_wall, ang_at(gW, gW["R"] + 56, gW["ys"])))
spandrel_frame("st2_win_spanL", gW, gW["R"] + 56, ZX0, YENT, 1, FACE, 22, 25)
for o in list(sc.objects):
    if o.name == "st_wrev": o.scale.z = 1.0
dbox("st2_wrev_hi", ZX0, 0, 2439, WIN["x0"], FACE, YENT, M_VEN)

# ═══ the centre bay: pushed back to 25 off the wall — skirting, a three-step frame with beads, a band panel over ═══
dbox("st2_c_back", CX0, 0, CTOP, CX1, 25, YOPEN, M_VEN)
for x0_ in (CX0, CX1 - 20):                                              # the returns: the pilasters' backs, veneered
    dbox(f"st2_c_ret{x0_:.0f}", x0_, 25, CTOP, x0_ + 20, FACE, YOPEN, M_VEN)
sk = dbox("st2_c_skirt", CX0 + 20, 25, CTOP, CX1 - 20, 45, CTOP + 120, M_VEN); bevel(sk, 0.003, 2)
run("st2_c_skirtcap", [(0, 0), (6, 0), (6, 8), (3, 12), (0, 12)], CX1 - 20, 45, CX0 + 20, 45, CTOP + 120)
FA0, FA1, FB0, FB1 = CX0 + 80, CX1 - 80, CTOP + 180, YOPEN - 60
frame_on("st2_c_frame", "s", 25, FA0, FA1, FB0, FB1, [(0, 0), (0, 25), (14, 25), (14, 18), (30, 18), (30, 10), (70, 10), (70, 0)], 1)
# the counter frame's carving (owner's ref, counterframe-moulding-ref-owner.webp): an egg-and-dart run on the frame's flat,
# fine fillets either side of it, and a string of pearls just inside, on the panel
enrich("st2_c_egg", "s", 25, FA0, FA1, FB0, FB1, 1, 50, "egg", 10, M_VEN, pitch=25.0, size=1.5)
for k_, ins in enumerate((38, 62)):
    frame_on(f"st2_c_fillet{k_}", "s", 25, FA0 + ins, FA1 - ins, FB0 + ins, FB1 - ins, P_lift([(0, 0), (0, 2), (1.5, 3.5), (3.5, 3.5), (5, 2), (5, 0)], 10), 1, M_VEN)
enrich("st2_c_pearl", "s", 25, FA0, FA1, FB0, FB1, 1, 80, "pearl", 0, M_VEN, pitch=12.0, size=1.3)
dbox("st2_c_soffit", CX0, 0, YOPEN, CX1, FACE, YBAND, M_VEN)                                  # the rail under the band
dbox("st2_c_band", CX0, 0, YBAND, CX1, FACE, YENT, M_VEN)
frame_on("st2_c_bandfr", "s", FACE, CX0 + 60, CX1 - 60, YBAND + 45, YENT - 45, P_ogee(32, 14), 1)
bf_ = dbox("st2_c_bandfield", CX0 + 92, FACE, YBAND + 77, CX1 - 92, FACE + 6, YENT - 77, M_VEN); bevel(bf_, 0.008, 3)
STUDY_PAINT = dict(cx=(CX0 + CX1) / 2, cz=(FB0 + FB1) / 2, w=860.0, h=640.0, s=25.0)        # the painting hangs here (realism.py)
print(f"study wall (AST-DR-040): arches over the bookcase (R {gB['R']:.0f}) and the window (R {gW['R']:.0f}), 6 niches, centre bay at 25, crown at {YENT:.0f}", flush=True)
