# Stage 2 of the walkthrough: the skeleton (skeleton.py) with every piece of furniture decided so far,
# still in clay — materials come later. The tour ends up two ways: a numbered WebP sequence the website
# scrubs with the scroll, and an MP4.
#
#   blender -b --python tools/walk/furnish.py -- <out_dir> [stills|frames|blend]
#
# Plan coordinates as skeleton.py: x mm east, s mm south from the study wall, z mm up.
import bpy, math, os, sys
from mathutils import Vector

HERE = os.path.dirname(os.path.abspath(__file__))
_args = sys.argv[sys.argv.index("--") + 1:]
OUTF = _args[0] if _args else "/tmp/furnish"
MODEF = _args[1] if len(_args) > 1 else "stills"
sys.argv = [sys.argv[0], "--", OUTF, "build"]
exec(compile(open(os.path.join(HERE, "skeleton.py")).read(), "skeleton.py", "exec"))   # walls, doors, lights, materials
os.makedirs(OUTF, exist_ok=True)

CLAY, CLAY2, DARK, METAL, CLOTH, MIRR = (0.93, 0.92, 0.90), (0.86, 0.85, 0.83), (0.06, 0.06, 0.06), (0.35, 0.33, 0.30), (0.97, 0.97, 0.95), (0.70, 0.80, 0.86)
FUR = bpy.data.collections.new("furniture"); sc.collection.children.link(FUR)
def fbox(name, x0, s0, z0, x1, s1, z1, col=CLAY):
    return box(name, x0, s0, z0, x1, s1, z1, col, FUR)
def fprism(name, pts, z0, z1, col=CLAY):
    return prism(name, pts, z0, z1, col, FUR)
def band(name, pts, t, z0, z1, col=CLAY):
    """A curved panel: the polyline pts (x, s) given thickness t, extruded z0→z1."""
    n = len(pts); L_, R_ = [], []
    for i, (x, s_) in enumerate(pts):
        a = pts[max(i - 1, 0)]; b = pts[min(i + 1, n - 1)]
        dx, ds = b[0] - a[0], b[1] - a[1]; ln = math.hypot(dx, ds) or 1
        nx, ns = -ds / ln * t / 2, dx / ln * t / 2
        L_.append((x + nx, s_ + ns)); R_.append((x - nx, s_ - ns))
    return fprism(name, L_ + R_[::-1], z0, z1, col)

# ── layout, as the 2D plan (drawings/suite2d.js) ───────────────────────────────
Lb = BED["L"]; xRr = BED["xR"]; xLb_ = BED["xLb"]
doorEnd = xLb_ + D1["leaf"]
bx0, bx1 = doorEnd + 178, xRr - 787
Wb = bx1 - bx0; cx = (bx0 + bx1) / 2
bedW, bedL, BT = 1829, 1981, 50
bedFoot = Lb - BT - 10 - bedL
pT = 70; PW = 2438 - pT; yP = Lb - 3353; pTurn = 0.96; REACH = 381
pR = REACH / (1 - math.cos(pTurn)); st = PW / 2 - pR * math.sin(pTurn)
ri = pR - pT / 2; tInner = math.acos((pR - REACH) / ri); cavF = yP + REACH; cavH = st + ri * math.sin(tInner)

# ── the bed: base, mattress, pillows, the curved bed-back, quarter-circle tables ──
bs = bedW / 2 + 50; bTh = math.radians(70); bR = (Wb / 2 - bs) / math.sin(bTh); tr = bR - BT / 2 - 25
fbox("bed_base", cx - bedW / 2 + 40, bedFoot + 40, 0, cx + bedW / 2 - 40, Lb - BT - 10, 90, DARK)
fbox("bed_frame", cx - bedW / 2, bedFoot, 90, cx + bedW / 2, Lb - BT - 10, 330, CLAY2)
fbox("mattress", cx - bedW / 2 + 15, bedFoot + 15, 330, cx + bedW / 2 - 15, Lb - BT - 25, 580, CLOTH)
fbox("duvet", cx - bedW / 2 + 5, bedFoot + 5, 540, cx + bedW / 2 - 5, Lb - BT - 620, 610, CLAY)
for i, sg in enumerate((-1, 1)):
    fbox(f"pillow{i}", cx + sg * 450 - 400, Lb - BT - 560, 580, cx + sg * 450 + 400, Lb - BT - 110, 720, CLOTH)
bp = []
for i in range(24, -1, -1): a = bTh * i / 24; bp.append((cx - bs - bR * math.sin(a), Lb - (bR - bR * math.cos(a)) - BT / 2))
for i in range(0, 25): a = bTh * i / 24; bp.append((cx + bs + bR * math.sin(a), Lb - (bR - bR * math.cos(a)) - BT / 2))
band("bed_back", bp, BT, 0, 1372, CLAY2)
for i, sg in enumerate((-1, 1)):
    ccx, ccs = cx + sg * bs, Lb - bR
    q = [(ccx, ccs)] + [(ccx + sg * tr * math.sin(math.pi / 2 * k / 16), ccs + tr * math.cos(math.pi / 2 * k / 16)) for k in range(17)]
    fprism(f"table{i}", q, 0, 600, CLAY)

# ── the partition: straight middle, two curves each end (bed side and desk side), full height ──
def pside(sg):
    pts = []
    for i in range(20, -1, -1): t = pTurn * i / 20; pts.append((cx - st - pR * math.sin(t), yP + sg * (pR - pR * math.cos(t))))
    for i in range(0, 21): t = pTurn * i / 20; pts.append((cx + st + pR * math.sin(t), yP + sg * (pR - pR * math.cos(t))))
    return pts
band("partition_bed", pside(1), pT, 0, H, CLAY2)
band("partition_desk", pside(-1), pT, 0, H, CLAY2)
# the drawer unit filling the TV-side cavity: back follows the curve, front straight across the tips
dpts = [(cx - st - ri * math.sin(tInner * (1 - i / 24)), yP + pR - ri * math.cos(tInner * (1 - i / 24))) for i in range(25)] + \
       [(cx + st + ri * math.sin(tInner * i / 24), yP + pR - ri * math.cos(tInner * i / 24)) for i in range(25)]
fprism("drawers", dpts, 60, 610, CLAY)
fprism("drawers_plinth", [(x, min(sv, cavF - 50)) for x, sv in dpts], 0, 60, DARK)
dw = 2 * cavH / 4
for i in range(1, 4):
    x = cx - cavH + i * dw; fbox(f"dr_gap{i}", x - 4, cavF - 2, 70, x + 4, cavF + 3, 600, DARK)
for i in range(4):
    x = cx - cavH + (i + 0.5) * dw; fbox(f"dr_pull{i}", x - 90, cavF, 470, x + 90, cavF + 22, 490, METAL)
fbox("tv", cx - 614, yP + pT / 2, 850, cx + 614, yP + pT / 2 + 45, 1545, DARK)

# ── the desk: hollowed corners, two pedestals, frieze; it sits in the desk-side curve ──
dL, dD, dh = 2286, 914, 150
def dgap():
    def need(ax, ad):
        if ax <= st: return pT / 2 - ad
        u = ax - st
        if u >= ri * math.sin(pTurn): return 0
        return pR - math.sqrt(ri * ri - u * u) - ad
    g, hx = 0, dL / 2
    for i in range(61): g = max(g, need((hx - dh) * i / 60, 0))
    for i in range(31): p = math.pi / 2 * i / 30; g = max(g, need(hx - dh * math.cos(p), dh * math.sin(p)))
    return g
dBack = yP - dgap(); dFront = dBack - dD
def hollow(x0, s0, x1, s1, h, n=10):
    pts = []
    corners = [((x1, s0), (-1, 1)), ((x1, s1), (-1, -1)), ((x0, s1), (1, -1)), ((x0, s0), (1, 1))]
    starts = [(x0 + h, s0)]
    for (cxp, csp), (ux, us) in corners:
        # concave quarter circle struck from the corner itself
        a0 = math.atan2(0, ux)
        for k in range(n + 1):
            ang = math.pi / 2 * k / n
            if (ux, us) == (-1, 1): pts.append((cxp - h * math.cos(ang), csp + h * math.sin(ang)))
            if (ux, us) == (-1, -1): pts.append((cxp - h * math.sin(ang), csp - h * math.cos(ang)))
            if (ux, us) == (1, -1): pts.append((cxp + h * math.cos(ang), csp - h * math.sin(ang)))
            if (ux, us) == (1, 1): pts.append((cxp + h * math.sin(ang), csp + h * math.cos(ang)))
    return pts
dx0, dx1 = cx - dL / 2, cx + dL / 2
fprism("desk_top", hollow(dx0, dFront, dx1, dBack, dh), 710, 750, CLAY2)
fprism("desk_frieze", hollow(dx0 + 30, dFront + 30, dx1 - 30, dBack - 30, dh - 30), 635, 710, CLAY)
for i, (a, b) in enumerate(((dx0 + 30, dx0 + 590), (dx1 - 590, dx1 - 30))):
    fbox(f"ped{i}", a, dFront + 30, 80, b, dBack - 30, 635, CLAY)
    fbox(f"plinth{i}", a - 15, dFront + 15, 0, b + 15, dBack - 15, 80, CLAY2)
fbox("modesty", dx0 + 590, dBack - 60, 150, dx1 - 590, dBack - 30, 635, CLAY)
# chair, pulled up to the kneehole, on the study side
chs = dFront - 180
fbox("chair_seat", cx - 260, chs - 480, 420, cx + 260, chs, 480, CLAY2)
fbox("chair_back", cx - 260, chs - 520, 480, cx + 260, chs - 440, 1000, CLAY2)
for i, (lx, ls) in enumerate(((-230, -30), (230, -30), (-230, -470), (230, -470))):
    fbox(f"chair_leg{i}", cx + lx - 22, chs + ls - 22, 0, cx + lx + 22, chs + ls + 22, 420, DARK)

# ── the study wall: cupboards under a reeded counter, bookcase, two pilasters, panelled centre, band, cornice ──
book, pil = 1489, 240
xP2 = xRr - (70 + 1219) - pil
fbox("cupboards", 0, 0, 0, xRr, 255, 646, CLAY)
fbox("counter", 0, 0, 646, xRr, 280, 686, CLAY2)
fbox("skirt", 0, 250, 0, xRr, 262, 120, CLAY2)
for i in range(1, 9):
    x = xRr * i / 9; fbox(f"cup_gap{i}", x - 3, 253, 130, x + 3, 257, 630, DARK)
fbox("book_back", 0, 0, 686, book, 20, 2039, CLAY2)
for x0 in (0, book - 60): fbox(f"book_side{x0}", x0, 0, 686, x0 + 60, 280, 2039, CLAY)
for z in (890, 1160, 1430, 1700): fbox(f"shelf{z}", 60, 0, z, book - 60, 270, z + 25, CLAY)
for i, x0 in enumerate((book, xP2)):
    fbox(f"pil_ped{i}", x0 - 25, 0, 0, x0 + pil + 25, 330, 686, CLAY2)
    fbox(f"pil{i}", x0, 0, 686, x0 + pil, 280, 2039, CLAY)
    for k in range(9): fbox(f"flute{i}_{k}", x0 + 20 + k * 22.5 + 4, 279, 760, x0 + 20 + k * 22.5 + 16, 284, 1960, CLAY2)
    fbox(f"sconce{i}", x0 + pil / 2 - 110, 280, 1260, x0 + pil / 2 + 110, 420, 1320, METAL)
fbox("panel_bay", book + pil, 0, 686, xP2, 80, 2039, CLAY)
pm = (book + pil + xP2) / 2
for (a0, a1, b0, b1) in ((pm - 700, pm + 700, 760, 1990),):
    fbox("panel_frame_t", a0, 80, b1 - 70, a1, 110, b1, CLAY2); fbox("panel_frame_b", a0, 80, b0, a1, 110, b0 + 70, CLAY2)
    fbox("panel_frame_l", a0, 80, b0, a0 + 70, 110, b1, CLAY2); fbox("panel_frame_r", a1 - 70, 80, b0, a1, 110, b1, CLAY2)
fbox("painting", pm - 380, 80, 1440 - 430, pm + 380, 120, 1440 + 430, CLAY2)
fbox("band", 0, 0, 2039, xRr, 280, 2439, CLAY)
fbox("band_rail", 0, 280, 2039, xRr, 300, 2079, CLAY2)
for i, (z0, z1, d) in enumerate(((2439, 2499, 300), (2499, 2579, 290), (2579, 2649, 340), (2649, 2679, 380), (2679, H - 1, 440))):
    fbox(f"cornice{i}", 0, 0, z0, xRr, d, z1, CLAY if i % 2 else CLAY2)
fbox("win_arch_l", xRr - 1219 - 70, 0, 686, xRr - 1219, 60, 2337 + 70, CLAY2)
fbox("win_arch_t", xRr - 1219 - 70, 0, 2337, xRr, 60, 2337 + 70, CLAY2)
# the curtain: one, white, floor to ceiling, gathered to the left of the window and held by a tieback
fbox("curtain_track", xP2 - 60, 330, H - 60, xRr, 360, H - 30, METAL)
wave = [(xP2 - 40 + k * 18, 390 + 55 * math.sin(k * 0.9)) for k in range(26)]
band("curtain", wave, 14, 20, H - 60, CLOTH)
fbox("tieback", xP2 - 60, 320, 980, xP2 - 20, 470, 1020, DARK)

# ── the dressing: wardrobes both walls (9 ft 0), the hidden door, the trifold mirror ──
WDd, WDh = 686, 2743
nx0 = BA["x0"] + 762
wN = (DR["x1"] - nx0) / 3; wS = (DR["x1"] - DR["x0"]) / 4
def wardrobe(name, x0, x1, sf, sb, hidden=False):
    front = sf; inward = 1 if sf > sb else -1
    if not hidden:
        fbox(name + "_c", x0, min(sf, sb), 0, x1, max(sf, sb), WDh, CLAY)
    fbox(name + "_plinth", x0 + 10, sf - inward * 40, 0, x1 - 10, sf, 90, DARK)
    doors = []
    for k in range(2):
        a, b = x0 + 6 + k * (x1 - x0) / 2, x0 + (k + 1) * (x1 - x0) / 2 - 6
        if hidden: continue
        fbox(f"{name}_d{k}", a, sf, 100, b, sf + inward * 20, WDh - 10, CLAY2)
        hx = b - 40 if k == 0 else a + 40
        fbox(f"{name}_h{k}", hx - 8, sf + inward * 20, 1000, hx + 8, sf + inward * 45, 1400, METAL)
for i in range(3):
    wardrobe(f"wdN{i}", nx0 + i * wN, nx0 + (i + 1) * wN, DR["s0"] + WDd, DR["s0"])
for i in range(4):
    if i < 3: wardrobe(f"wdS{i}", DR["x0"] + i * wS, DR["x0"] + (i + 1) * wS, DR["s1"] - WDd, DR["s1"])
# ── the tunnel bay (the last bay on the right, at the far end) ──
# Its doors are Option C (AST-DR-026): a pair that folds OUT into the room at the end nearest the bedroom,
# then slides straight back into the cupboard. Behind them the back of the bay is a set of shelves — that is
# the hidden door: pushed, it swings into the tunnel on a floor pivot at its LEFT edge (looking into the
# tunnel), 2 ft 8 in wide with a fixed 4 in upright on the right, and lies flat against the tunnel's left wall.
tb0, tb1, tfront = DR["x0"] + 3 * wS, DR["x1"], DR["s1"] - WDd
wR = (tb1 - tb0 - 40 - 36) / 2
def leafC(name):
    e = bpy.data.objects.new(name, None); sc.collection.objects.link(e)
    o_ = fbox(name + "_p", 0, 0, 100, wR, 20, WDh - 10, CLAY2)        # local: along +x, 20 thick into the cupboard (south)
    o_.location = (0, 0, 0); o_.parent = e
    return e
LA, LB = leafC("tbA"), leafC("tbB")
P0 = Vector(((tb0 + 20) / 1000, -tfront / 1000, 0))
SLIDE = 0.39
def pose_pair(alpha, sl):
    Pp = P0 + Vector((0, -sl, 0))                                    # slides south, into the cupboard
    dA = Vector((math.cos(alpha), math.sin(alpha), 0))               # A folds out, north, into the room
    LA.location = Pp; LA.rotation_euler = (0, 0, alpha)
    Hh = Pp + dA * (wR / 1000)
    LB.location = Hh; LB.rotation_euler = (0, 0, -alpha)
fbox("tb_track", tb0 + 10, tfront - 12, WDh - 10, tb1 - 10, tfront + 10, WDh, METAL)
fbox("tb_runner", tb0 + 10, tfront, WDh - 10, tb0 + 34, tfront + SLIDE * 1000 + 40, WDh, METAL)
for x0_ in (tb0, tb1 - 18): fbox(f"tb_side{x0_}", x0_, tfront, 0, x0_ + 18, DR["s1"], WDh, CLAY)
fbox("tb_top", tb0, tfront, WDh - 18, tb1, DR["s1"], WDh, CLAY)
# the hidden door, hinged at the tunnel mouth's left (far-wall) corner, on the tunnel side of the wall
TS, THh = DR["s1"] + T, TUN["h"]
LEVELS = [20, 450, 850, 1250, 1650, 2050]
hd = bpy.data.objects.new("hidden_door", None); sc.collection.objects.link(hd)
hd.location = P(tb1, TS, 0); bpy.context.view_layer.update()
hdw = 810
parts = [fbox("hd_body", tb1 - hdw, TS - 40, 0, tb1, TS, THh - 10, CLAY2)]
for z in LEVELS: parts.append(fbox(f"hd_s{z}", tb1 - hdw, TS - 300, z, tb1 - 20, TS - 40, z + 22, CLAY))
for xe in (tb1 - hdw, tb1 - 40): parts.append(fbox(f"hd_u{xe}", xe, TS - 300, 0, xe + 20, TS - 40, THh - 10, CLAY))
parts.append(fbox("hd_pivot", tb1 - 30, TS - 30, 0, tb1 - 5, TS - 5, THh, METAL))
for o_ in parts: o_.parent = hd; o_.matrix_parent_inverse = hd.matrix_world.inverted()
fbox("hd_upright", tun["x0"], TS - 300, 0, tb1 - hdw - 5, TS, THh - 10, CLAY)
# the tunnel's own shelves on its left wall, starting just past where the door lands
for z in LEVELS: fbox(f"tun_s{z}", tb1 - 300, TS + hdw + 20, z, tb1 - 40, tun["s1"], z + 22, CLAY)
fbox("tun_back", tb1 - 40, TS + hdw + 20, 0, tb1, tun["s1"], THh, CLAY2)
# the trifold mirror, free-standing, centred on the far (east) wall
mc = (DR["s0"] + DR["s1"]) / 2; mxf = DR["x1"] - 20; mxb = mxf - 25
fbox("mirror_c", mxb, mc - 337, 0, mxf, mc + 337, WDh, DARK)
fbox("mirror_cg", mxb - 2, mc - 305, 60, mxb, mc + 305, WDh - 60, MIRR)
for i, sg in enumerate((-1, 1)):
    ang = math.pi / 4; p0 = (mxb, mc + sg * 337); p1 = (mxb - 253 * math.sin(ang), mc + sg * (337 + 253 * math.cos(ang)))
    band(f"mirror_w{i}", [p0, p1], 25, 0, WDh, DARK)

# a stretch of corridor outside the front door, so the tour can start there (its layout is not drawn — neutral)
cxw = xLb_ - T
fbox("cor_floor", cxw - 2800, 4250, -150, cxw, 6250, 0, FLOOR)
fbox("cor_wallN", cxw - 2800, 4250 - 120, 0, cxw, 4250, H, WALL); fbox("cor_wallS", cxw - 2800, 6250, 0, cxw, 6250 + 120, H, WALL)
fbox("cor_wallW", cxw - 2920, 4130, 0, cxw - 2800, 6370, H, WALL); fbox("cor_ceil", cxw - 2920, 4130, H, cxw, 6370, H + 150, CEIL)
area("L_cor", cxw - 2800, 4250, cxw, 6250, 120)
# light: the partition now splits the bedroom, so each half gets its own ceiling light; the windows glow
for o_ in [o for o in sc.objects if o.name == "L_bed"]: bpy.data.objects.remove(o_)
area("L_study", 0, 0, xRr, yP, 300); area("L_bedz", 0, yP, xRr, Lb, 340)
sky = bpy.data.materials.new("sky"); sky.use_nodes = True
bb = sky.node_tree.nodes.get("Principled BSDF"); bb.inputs["Base Color"].default_value = (0.9, 0.94, 1.0, 1)
bb.inputs["Emission Color"].default_value = (0.92, 0.95, 1.0, 1); bb.inputs["Emission Strength"].default_value = 2.2
for nm in ("glass_win", "glass_bwin"):
    g_ = sc.objects.get(nm)
    if g_: g_.data.materials.clear(); g_.data.materials.append(sky)
try: sc.eevee.taa_render_samples = 64 if MODEF == "stills" else 40
except Exception: pass
# every new object gets its clay material
for o_ in list(FUR.objects):
    if o_.type == "MESH":
        o_.data.materials.clear(); o_.data.materials.append(mat_for(tuple(o_.color[:3]), 0.6 if o_.color[:3] == MIRR else 0.85))
labels_hide = [o for o in sc.objects if o.name.startswith("lbl_")]
for o in labels_hide: o.hide_render = True; o.hide_viewport = True
for o in [ceiling, *ceiling.children]: o.hide_render = False

# ── the tour: calm stops at standing eye height, a pause at each, no orbit ─────
EYE, LENS = 1650, 21
STOPS = [  # name, camera (x, s[, z]), looking at (x, s, z), hold frames, what happens while it holds
    ("door", (-2400, 5258), (-177, 5258, 1150), 48, "d1"),
    ("in", (350, 5150), (3300, 3500, 1000), 30, None),
    ("tv", (1000, 4500), (2340, 2450, 1050), 36, None),
    (None, (2340, 3250, 1750), (2340, 5000, 700), 0, None),
    ("bed", (4000, 2950), (2200, 5400, 650), 39, None),
    (None, (4150, 2400), (2500, 1000, 1200), 0, None),
    ("study", (4000, 1650), (1600, 0, 1300), 39, None),
    ("window", (3940, 1650), (3940, 0, 1350), 33, None),
    ("book", (1900, 1150), (700, 0, 1300), 33, None),
    ("desk", (650, 900), (2340, 2000, 800), 36, None),
    (None, (500, 2400), (500, 4000, 1300), 0, None),
    (None, (700, 3350), (3000, 3300, 1300), 0, None),
    (None, (2340, 3250), (4600, 4300, 1300), 0, None),
    ("d2", (4000, 4450), (5600, 4500, 1350), 36, "d2"),
    ("dress", (5000, 4450), (8400, 4356, 1500), 36, None),
    ("dome", (5900, 4380), (7800, 4356, 3000), 27, None),
    ("mech", (6900, 3900), (8100, 5550, 1200), 260, "mech"),
    ("tunnel", (7700, 4650), (8100, 7800, 1250), 36, None),
    (None, (6000, 4050), (5158, 2000, 1500), 0, None),
    ("d3", (5158, 3700), (5158, 1500, 1500), 36, "d3"),
    ("bath", (5250, 2400), (8200, 600, 1300), 39, None),
    ("corner", (8150, 450), (5200, 2400, 1100), 39, None),
    ("pier", (6000, 700), (7450, 2400, 1100), 33, None),
    ("wc", (7000, 1450), (4777, 600, 1300), 36, None),
    ("end", (6600, 1550), (5158, 2718, 1200), 30, None),
]
def ease(t): t = max(0.0, min(1.0, t)); return t * t * (3 - 2 * t)

def animate():
    walk = cam("walk", LENS)
    tgt = bpy.data.objects.new("look", None); sc.collection.objects.link(tgt)
    con = walk.constraints.new("TRACK_TO"); con.target = tgt; con.track_axis = "TRACK_NEGATIVE_Z"; con.up_axis = "UP_Y"
    f, prev, marks, acts = 1, None, {}, {}
    for name, cp, tp, hold, act in STOPS:
        pos = Vector(P(cp[0], cp[1], cp[2] if len(cp) > 2 else EYE))
        if prev is not None:
            d = (pos - prev[0]).length + 0.5 * (Vector(P(*tp)) - prev[1]).length
            f += max(30, int(d / 0.05))                             # the page's height, not the frame count, sets the pace
        walk.location = pos; tgt.location = P(*tp)
        walk.keyframe_insert("location", frame=f); tgt.keyframe_insert("location", frame=f)
        if name: marks[name] = f
        if hold:
            if act: acts[act] = (f, f + hold)
            f += hold
            walk.keyframe_insert("location", frame=f); tgt.keyframe_insert("location", frame=f)
        prev = (pos, Vector(P(*tp)))
    end = f
    # doors: each opens while the camera waits in front of it
    for dname, key in (("door_d1", "d1"), ("door_d2", "d2"), ("door_d3", "d3")):
        d = sc.objects[dname]; a, b = acts[key]; rot = d["open"]
        d.rotation_euler.z = 0; d.keyframe_insert("rotation_euler", index=2, frame=1); d.keyframe_insert("rotation_euler", index=2, frame=a + 10)
        d.rotation_euler.z = rot; d.keyframe_insert("rotation_euler", index=2, frame=min(b, a + 55))
    # the tunnel bay: fold out, slide in, then the shelves swing into the tunnel — keyed every frame
    a, b = acts["mech"]
    seg = [15, 65, 50, 25, 75]                                          # wait, fold, slide, look, swing
    c = [a]
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
    sc.frame_start, sc.frame_end = 1, end
    sc.camera = walk
    return marks, end

if MODEF == "stills":
    for d in doors: d.rotation_euler.z = d["open"]
    pose_pair(math.radians(90), SLIDE); hd.rotation_euler.z = math.radians(90)
    sc.render.resolution_x, sc.render.resolution_y = 1600, 900
    for name, cp, tp, hold, act in STOPS:
        if not name: continue
        c_ = cam("c_" + name, LENS); c_.location = P(cp[0], cp[1], cp[2] if len(cp) > 2 else EYE); aim(c_, P(*tp)); still("s_" + name, c_)

if MODEF == "frames":
    marks, end = animate()
    import json
    json.dump({"frames": end, "stops": marks}, open(os.path.join(OUTF, "tour.json"), "w"))
    sc.render.resolution_x, sc.render.resolution_y = 1280, 720
    ims = sc.render.image_settings
    ims.file_format = "WEBP"; ims.quality = 72; ims.color_mode = "RGB"
    sc.render.filepath = os.path.join(OUTF, "frames", "f")
    bpy.ops.render.render(animation=True)

bpy.ops.wm.save_as_mainfile(filepath=os.path.join(OUTF, "furnished.blend"))
print("DONE", MODEF)
