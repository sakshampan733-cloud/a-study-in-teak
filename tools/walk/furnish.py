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
    wardrobe(f"wdS{i}", DR["x0"] + i * wS, DR["x0"] + (i + 1) * wS, DR["s1"] - WDd, DR["s1"], hidden=(i == 3))
# the hidden door: the last bay at the tunnel end. From the room it reads as one more pair of wardrobe doors;
# push it and it swings back into the tunnel — 2 ft 8 in wide, hinged on the left, a fixed 4 in upright on the right
hx0 = DR["x0"] + 3 * wS
hd = bpy.data.objects.new("hidden_door", None); sc.collection.objects.link(hd)
hd.location = P(hx0 + 6, DR["s1"] - WDd, 0); bpy.context.view_layer.update()
hw = (DR["x1"] - 6) - (hx0 + 6) - 102
parts = [fbox("hd_face_l", hx0 + 6, DR["s1"] - WDd, 100, hx0 + 6 + hw / 2 - 3, DR["s1"] - WDd + 20, WDh - 10, CLAY2),
         fbox("hd_face_r", hx0 + 6 + hw / 2 + 3, DR["s1"] - WDd, 100, hx0 + 6 + hw, DR["s1"] - WDd + 20, WDh - 10, CLAY2)]
fbox("hd_upright", DR["x1"] - 108, DR["s1"] - WDd, 100, DR["x1"] - 6, DR["s1"] - WDd + 20, WDh - 10, CLAY2)
for o_ in parts:
    o_.parent = hd; o_.matrix_parent_inverse = hd.matrix_world.inverted()
# the trifold mirror, free-standing, centred on the far (east) wall
mc = (DR["s0"] + DR["s1"]) / 2; mxf = DR["x1"] - 20; mxb = mxf - 25
fbox("mirror_c", mxb, mc - 337, 0, mxf, mc + 337, WDh, DARK)
fbox("mirror_cg", mxb - 2, mc - 305, 60, mxb, mc + 305, WDh - 60, MIRR)
for i, sg in enumerate((-1, 1)):
    ang = math.pi / 4; p0 = (mxb, mc + sg * 337); p1 = (mxb - 253 * math.sin(ang), mc + sg * (337 + 253 * math.cos(ang)))
    band(f"mirror_w{i}", [p0, p1], 25, 0, WDh, DARK)

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

# ── the tour ───────────────────────────────────────────────────────────────────
EYE = 1650
def tour_cameras():
    walk = cam("walk", 20)
    tgt = bpy.data.objects.new("look", None); sc.collection.objects.link(tgt)
    con = walk.constraints.new("TRACK_TO"); con.target = tgt; con.track_axis = "TRACK_NEGATIVE_Z"; con.up_axis = "UP_Y"
    return walk, tgt
ORB = 90
K = [(0, (-1300, 5258), (2000, 4600, 1200)),
     (40, (450, 5000), (2600, 4950, 800)),        # in at the entrance: the bed from its side
     (85, (700, 4200), (2340, 5500, 700)),        # the bed and its curved back
     (125, (700, 3600), (2340, 2500, 1100)),      # the partition, the TV, the drawers
     (165, (550, 2750), (600, 800, 1400)),        # round the partition's left end
     (205, (700, 1750), (2500, 1650, 850)),       # the desk, in the partition's curve
     (250, (850, 1500), (900, 0, 1500)),          # the bookcase
     (295, (3950, 2150), (1700, 0, 1350)),        # the whole study wall
     (335, (4080, 1950), (3800, 0, 1500)),        # the window and its curtain
     (370, (4150, 3000), (4100, 4700, 1300)),     # round the partition's right end
     (405, (4150, 4350), (4700, 4620, 1400)),     # D2
     (450, (5300, 4450), (8536, 4356, 1900)),     # into the dressing: the mirror
     (490, (6300, 4356), (7500, 4356, 3100)),     # the dome
     (530, (7250, 4450), (8067, 5400, 1200)),     # the hidden door
     (575, (7700, 4550), (8079, 8000, 1300)),     # through it, the tunnel
     (620, (6100, 4300), (5158, 2000, 1500)),     # back towards the bathroom
     (665, (5158, 3700), (5158, 1500, 1500)),     # D3
     (715, (5260, 1950), (5500, 200, 1400)),      # in: the far wall and the window
     (770, (5750, 1800), (8350, 1100, 1300)),     # the east wall
     (825, (6350, 1450), (7450, 2650, 1100)),     # the pier
     (880, (6350, 1300), (4777, 650, 1300)),      # the WC wall and its 7 in wall
     (935, (6050, 1250), (4950, 2650, 1300)),     # back to the door
     (970, (6050, 1250), (4950, 2650, 1300))]
DOORS = {"door_d1": (5, 35), "door_d2": (385, 425), "door_d3": (640, 680)}

def animate(walk, tgt, orb):
    for i, fr in enumerate(range(1, ORB + 1, 10)):
        a = math.radians(-65 + 120 * (fr - 1) / (ORB - 1))
        orb.location = centre + Vector((14 * math.cos(a), 14 * math.sin(a), 13 - 2 * (fr - 1) / (ORB - 1)))
        aim(orb, centre + Vector((0, 0, 0.3)))
        orb.keyframe_insert("location", frame=fr); orb.keyframe_insert("rotation_euler", frame=fr)
    for o in [ceiling, *ceiling.children]:
        o.hide_render = True; o.keyframe_insert("hide_render", frame=1)
        o.hide_render = False; o.keyframe_insert("hide_render", frame=ORB + 1)
    for fr, (x, s_), t in K:
        walk.location = P(x, s_, EYE); tgt.location = P(*t)
        walk.keyframe_insert("location", frame=ORB + 1 + fr); tgt.keyframe_insert("location", frame=ORB + 1 + fr)
    for d in doors:
        f0, f1 = DOORS[d.name]; rot = d["open"]
        d.rotation_euler.z = 0; d.keyframe_insert("rotation_euler", index=2, frame=1); d.keyframe_insert("rotation_euler", index=2, frame=ORB + 1 + f0)
        d.rotation_euler.z = rot; d.keyframe_insert("rotation_euler", index=2, frame=ORB + 1 + f1)
    hd.rotation_euler.z = 0; hd.keyframe_insert("rotation_euler", index=2, frame=ORB + 1 + 520)
    hd.rotation_euler.z = math.radians(-92); hd.keyframe_insert("rotation_euler", index=2, frame=ORB + 1 + 560)
    sc.frame_start, sc.frame_end = 1, ORB + 1 + K[-1][0]
    mk = sc.timeline_markers.new("orbit", frame=1); mk.camera = orb
    mk = sc.timeline_markers.new("walk", frame=ORB + 1); mk.camera = walk
    sc.camera = orb

if MODEF == "stills":
    for d in doors: d.rotation_euler.z = d["open"]
    hd.rotation_euler.z = math.radians(-92)
    sc.render.resolution_x, sc.render.resolution_y = 1600, 900
    shots = [("f_bed", (500, 4700), (2500, 5300, 700)), ("f_partition", (1200, 3900), (2340, 2400, 1100)),
             ("f_desk", (650, 1700), (2500, 1700, 850)), ("f_study", (3950, 2150), (1700, 0, 1350)),
             ("f_window", (4080, 1950), (3800, 0, 1500)), ("f_dressing", (5300, 4450), (8536, 4356, 1900)),
             ("f_hidden", (7250, 4450), (8067, 5400, 1200)), ("f_bath", (5260, 2000), (5600, 200, 1400))]
    for nm, (x, s_), t in shots:
        c_ = cam("c_" + nm, 20); c_.location = P(x, s_, EYE); aim(c_, P(*t)); still(nm, c_)
    for o in [ceiling, *ceiling.children]: o.hide_render = True
    ax = cam("axon_f", 35); ax.location = centre + Vector((9.0, -13.0, 13.0)); aim(ax, centre + Vector((0, 0.3, 0.5)))
    still("f_axon", ax)

if MODEF == "frames":
    walk, tgt = tour_cameras(); orb = cam("orbit", 30)
    animate(walk, tgt, orb)
    sc.render.resolution_x, sc.render.resolution_y = 1280, 720
    ims = sc.render.image_settings
    ims.file_format = "WEBP"; ims.quality = 72; ims.color_mode = "RGB"
    sc.render.filepath = os.path.join(OUTF, "frames", "f")
    bpy.ops.render.render(animation=True)

bpy.ops.wm.save_as_mainfile(filepath=os.path.join(OUTF, "furnished.blend"))
print("DONE", MODEF)
