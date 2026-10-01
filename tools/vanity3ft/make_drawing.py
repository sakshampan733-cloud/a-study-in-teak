# A separate drawing set, made to share: a 3 ft floating corner vanity (owner, 1 Oct 2026).
# One geometry, two outputs: an editable DXF (R12, mm, every view at true size in model space, on named layers)
# and two A3 sheets as SVG, printed to PDF by print.js. Not part of the site or the walkthrough.
#
#   python3 tools/vanity3ft/make_drawing.py            -> share/vanity-3ft/vanity-3ft.dxf, sheet1.svg, sheet2.svg
import math, os

OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "share", "vanity-3ft")
os.makedirs(OUT, exist_ok=True)

# ── the vanity, in mm ─────────────────────────────────────────────────────────────────────────────────────────
W, D = 914.0, 533.0          # 3 ft wide (owner); depth NOT GIVEN — 21 in assumed, to confirm
TOP, CLR = 838.0, 305.0      # 33 in to the top of the stone; 12 in clear under (owner)
SLAB, EDGE = 20.0, 40.0      # 20 mm slab, laminated to a 40 mm edge on the exposed sides
R = 10.0                     # the "B" edge: two half-rounds, R10 each, one over the other
OVH = 20.0                   # the stone stands 20 proud of the veneer, front and left
FR, CB, BK = 19.0, 18.0, 9.0 # drawer fronts (18 + veneer), carcase board, back panel
GAP = 3.0                    # reveals
D1H = 178.0                  # top drawer front: 7 in (owner: 6–9 in)
ZS = TOP - EDGE              # underside of the stone edge: 798
D1T, D1B = ZS - GAP, ZS - GAP - D1H                 # 795, 617
D2T, D2B = D1B - GAP, CLR                           # 614, 305
FX0, FX1 = OVH, W - GAP                             # fronts: flush with the left side's face, 3 clear of the right wall
YF = D - OVH                                        # front face of the drawer fronts (from the back wall): 513
YC = YF - FR                                        # front of the carcase: 494
# The secret drawer is the owner's own (AST-DR-019, "the drawer within the big drawer"): it rides at the TOP of the big
# drawer's opening on its own runners, its front 22 behind the big drawer's face; the big drawer's sides stop lower so
# it rides clear above them. Open the big drawer and the inner one pulls out behind the big front, never through it.
SECZ0, SECZ1 = D2T - 124, D2T - 29                  # the inner drawer's front: 490–585
SECB0, SECB1 = SECZ0 + 10, SECZ1 - 10               # its box: 500–575
SECY1 = YC - 22; SECY0 = SECY1 - 18                 # its front, 22 behind the big drawer's face (in depth from the wall)
D2Z0, D2Z1 = CLR + CB + 12, SECZ0 - 30              # big drawer box: 335–460, its sides stopping clear below the inner one
D1Z0, D1Z1 = 632.0, 742.0                           # top drawer box
BOX0, BOX1 = 44.0, YC                               # drawer boxes run 450 (44–494)
def inch(mm): return mm / 25.4
def fi(mm):
    i = inch(mm); f, n = divmod(round(i * 8), 8)
    s = f"{int(f)}" if f else ""
    return (s + (f" {n}/8" if n else "") if s or n else "0").replace(" 2/8", " 1/4").replace(" 4/8", " 1/2").replace(" 6/8", " 3/4") + '"'
def lab(mm): return f"{mm:.0f} ({fi(mm)})"

# ── a tiny drawing model: each view is a list of primitives in its own mm coordinates (x right, y up) ─────────
class View:
    def __init__(s, name, title, scale, sheet, paper_xy, model_xy):
        s.name, s.title, s.scale, s.sheet, s.pxy, s.mxy, s.items = name, title, scale, sheet, paper_xy, model_xy, []
    def line(s, a, b, layer="OUT"): s.items.append(("L", layer, a, b))
    def poly(s, pts, layer="OUT", close=False):
        for a, b in zip(pts, pts[1:] + (pts[:1] if close else [])): s.line(a, b, layer)
    def rect(s, x0, y0, x1, y1, layer="OUT"): s.poly([(x0, y0), (x1, y0), (x1, y1), (x0, y1)], layer, True)
    def arc(s, c, r, a0, a1, layer="OUT"): s.items.append(("A", layer, c, r, a0, a1))       # degrees, counter-clockwise
    def text(s, p, t, h=2.5, layer="TXT", anchor="start", rot=0): s.items.append(("T", layer, p, t, h, anchor, rot))
    def face(s, pts, fill, layer="OUT"): s.items.append(("F", layer, pts, fill))
    def hatch(s, x0, y0, x1, y1, step, layer="HAT", ang=45):
        """Parallel lines across an axis-aligned box (step and box in view mm)."""
        k = math.tan(math.radians(ang)); c0, c1 = y0 - k * x1, y1 - k * x0; c = c0 - (c0 % step)
        while c <= c1:
            pts = []
            for x in (x0, x1):
                y = k * x + c
                if y0 - 1e-6 <= y <= y1 + 1e-6: pts.append((x, y))
            for y in (y0, y1):
                x = (y - c) / k
                if x0 - 1e-6 <= x <= x1 + 1e-6: pts.append((x, y))
            pts = sorted(set((round(p[0], 4), round(p[1], 4)) for p in pts))
            if len(pts) >= 2: s.line(pts[0], pts[-1], layer)
            c += step
    def dim(s, a, b, off, txt=None, h=2.2):
        """A linear dimension between a and b, its line offset by `off` (view mm) to the left of a→b, ticks at the ends."""
        (ax, ay), (bx, by) = a, b; L = math.hypot(bx - ax, by - ay); ux, uy = (bx - ax) / L, (by - ay) / L; nx, ny = -uy, ux
        o = off; pa, pb = (ax + nx * o, ay + ny * o), (bx + nx * o, by + ny * o)
        ext = 2.0 * s.scale; sg = 1 if o > 0 else -1
        s.line(a, (pa[0] + nx * ext * sg, pa[1] + ny * ext * sg), "DIM"); s.line(b, (pb[0] + nx * ext * sg, pb[1] + ny * ext * sg), "DIM")
        s.line(pa, pb, "DIM"); t = 1.4 * s.scale
        for p in (pa, pb): s.line((p[0] - (ux + nx) * t, p[1] - (uy + ny) * t), (p[0] + (ux + nx) * t, p[1] + (uy + ny) * t), "DIM")
        mx, my = (pa[0] + pb[0]) / 2 + nx * 1.2 * s.scale * sg, (pa[1] + pb[1]) / 2 + ny * 1.2 * s.scale * sg
        rot = math.degrees(math.atan2(uy, ux))
        if rot > 90 or rot <= -90: rot += 180
        s.text((mx, my), txt or lab(L), h, "DIM", "middle", rot)
    def leader(s, p, q, t, h=2.3):
        s.line(p, q, "DIM"); s.items.append(("D", "DIM", p))
        s.text((q[0] + 1.2 * s.scale, q[1] - 0.8 * s.scale), t, h, "TXT")

views = []
def view(*a): v = View(*a); views.append(v); return v

# The stone's B edge as a run of points, in a local frame: x outward from the edge line, y up from the stone's underside.
def b_profile():
    pts = []
    for (cy, a0, a1) in ((EDGE - R, 90, -90), (R, 90, -90)):          # upper half-round, then lower, each bulging outward
        for i in range(13):
            t = math.radians(a0 + (a1 - a0) * i / 12); pts.append((R * math.cos(t), cy + R * math.sin(t)))
    return pts                                                         # from the top (0, 40) round to the bottom (0, 0)

def wall(v, x0, y0, x1, y1, label=None):
    v.rect(x0, y0, x1, y1, "WALL"); v.hatch(x0, y0, x1, y1, 3.0 * v.scale, "HAT")
    if label: v.text(((x0 + x1) / 2, y1 + 2.5 * v.scale), label, 2.2, "TXT", "middle")

# ── SHEET 1 ── front elevation 1:5, left side elevation 1:5, plan 1:10 ────────────────────────────────────────
fe = view("FE", "FRONT ELEVATION", 5, 1, (42, 18), (0, 0))
wall(fe, W, -40, W + 100, 1000, "RIGHT WALL")
fe.line((-60, 0), (W, 0), "OUT"); fe.text((-55, 12), "FFL", 2.0, "TXT")
fe.hatch(-60, -40, W, 0, 3.0 * 5, "HAT")
# the stone: straight runs, the B profile seen end-on at the left, square to the wall at the right
fe.line((R, TOP), (W, TOP)); fe.line((R, ZS), (W, ZS))
fe.line((R, ZS + EDGE / 2), (W, ZS + EDGE / 2), "THIN")                              # the V between the two rounds
fe.line((0, ZS + EDGE / 2 + R), (W, ZS + EDGE / 2 + R), "THIN"); fe.line((0, ZS + R), (W, ZS + R), "THIN")   # crowns
for p, q in zip(b_profile(), b_profile()[1:]): fe.line((R - p[0], ZS + p[1]), (R - q[0], ZS + q[1]))
# the carcase and the drawer fronts
fe.rect(FX0, D1B, FX1, D1T); fe.rect(FX0, D2B, FX1, D2T)
fe.line((FX0, D2B), (FX0, ZS), "OUT")
fe.rect(FX0 + 40, SECZ0, FX1 - 40, SECZ1, "HID"); fe.text(((FX0 + FX1) / 2, SECZ0 + 40), "SECRET DRAWER — inside the big drawer, at the top", 2.0, "TXT", "middle")
fe.rect(FX0 + 30, D2Z0, FX1 - 30, D2Z1, "HID"); fe.rect(FX0 + 30, D1Z0, FX1 - 30, D1Z1, "HID")
fe.line((W / 2, CLR - 60), (W / 2, TOP + 60), "CEN")
fe.text(((FX0 + FX1) / 2, (D1B + D1T) / 2 - 4), "DRAWER 1", 2.6, "TXT", "middle")
fe.text(((FX0 + FX1) / 2, (D2Z0 + D2Z1) / 2), "DRAWER 2 (big)", 2.6, "TXT", "middle")
fe.text((W / 2, CLR / 2), "305 (12\") CLEAR — FLOATING, WALL-HUNG", 2.4, "TXT", "middle")
# dimensions
fe.dim((0, TOP), (W, TOP), 14 * 5, "914 (3' 0\") OVERALL")
fe.dim((FX0, D2B), (FX1, D2B), -10 * 5, lab(FX1 - FX0) + " FRONTS")
fe.dim((0, ZS), (FX0, ZS), -4 * 5, "20")
for (z0, z1, t, o) in ((D1B, D1T, lab(D1H) + " (6–9\")", 6), (D2B, D2T, lab(D2T - D2B), 6), (ZS, TOP, "40", 6),
                       (CLR, ZS, lab(ZS - CLR), 12), (0, CLR, "305 (12\") CLEAR", 12), (0, TOP, "838 (33\") TO TOP", 18)):
    fe.dim((0, z0), (0, z1), o * 5, t)

se = view("SE", "LEFT SIDE ELEVATION", 5, 1, (282, 18), (1400, 0))
wall(se, -100, -40, 0, 1000, "BACK WALL")
se.line((0, 0), (D + 100, 0)); se.hatch(0, -40, D + 100, 0, 3.0 * 5, "HAT")
se.line((0, TOP), (D - R, TOP)); se.line((0, ZS), (D - R, ZS))
se.line((0, ZS + EDGE / 2), (D - R, ZS + EDGE / 2), "THIN"); se.line((0, ZS + EDGE / 2 + R), (D, ZS + EDGE / 2 + R), "THIN"); se.line((0, ZS + R), (D, ZS + R), "THIN")
for p, q in zip(b_profile(), b_profile()[1:]): se.line((D - R + p[0], ZS + p[1]), (D - R + q[0], ZS + q[1]))
se.rect(0, CLR, YC, ZS)                                                               # the left side panel, veneered
se.rect(YC, D1B, YF, D1T); se.rect(YC, D2B, YF, D2T)                                  # the fronts' edges
se.rect(BOX0, D1Z0, BOX1, D1Z1, "HID"); se.rect(BOX0, D2Z0, BOX1, D2Z1, "HID"); se.rect(110, SECB0, SECY1, SECB1, "HID")
se.text((YC / 2, (CLR + ZS) / 2), "LEFT SIDE PANEL — VENEERED", 2.6, "TXT", "middle")
se.dim((0, TOP), (D, TOP), 14 * 5, "533 (21\") — DEPTH TO CONFIRM")
se.dim((0, CLR), (YC, CLR), -10 * 5, lab(YC) + " CARCASE")
se.dim((YC, CLR), (YF, CLR), -10 * 5, "19"); se.dim((YF, ZS), (D, ZS), -4 * 5, "20")
se.text((D / 2, 150), "Section A–A: sheet 2", 2.2, "TXT", "middle")

pl = view("PL", "PLAN", 5, 3, (36, 22), (0, -1300))
wall(pl, -40, D, W + 100, D + 100, "BACK WALL"); wall(pl, W, -60, W + 100, D)
pl.rect(0, 0, W, D)
pl.line((R, R), (W, R), "THIN"); pl.line((R, R), (R, D), "THIN"); pl.line((0, 0), (R, R), "THIN")   # B edge: crown line + mitre
pl.rect(FX0, OVH, FX1, OVH + FR, "HID"); pl.rect(FX0, OVH + FR, W, D, "HID")
pl.line((W / 2, -60), (W / 2, D + 20), "CEN")
for x_ in (W / 2 - 18, W / 2 + 18): pass
pl.line((W / 2, -40), (W / 2, -10), "OUT"); pl.text((W / 2 + 12, -48), "A", 3.2, "TXT"); pl.line((W / 2, -40), (W / 2 + 60, -40), "OUT")
pl.line((W / 2, D + 40), (W / 2 + 60, D + 40), "OUT"); pl.text((W / 2 + 12, D + 46), "A", 3.2, "TXT")
pl.text((W / 2, D / 2), "MARBLE TOP", 2.4, "TXT", "middle")
pl.text((W / 2, D / 2 - 45), "no basin or tap cut-out shown — to confirm", 2.0, "TXT", "middle")
pl.dim((0, -10), (W, -10), -14 * 5, "914 (3' 0\")"); pl.dim((0, 0), (0, D), 14 * 5, "533 (21\") TBC")
pl.dim((0, D + 10), (FX0, D + 10), 0.01, "20"); pl.dim((W + 10, 0), (W + 10, OVH), -0.01, "20")

# ── SHEET 2 ── section A–A 1:5, B-edge detail 2:1, corner detail 1:2, the secret drawer, notes ──────────────
sa = view("SA", "SECTION A–A", 5, 2, (42, 18), (2400, 0))
wall(sa, -100, -40, 0, 1000, "BACK WALL")
sa.line((0, 0), (D + 120, 0)); sa.hatch(0, -40, D + 120, 0, 3.0 * 5, "HAT")
# the stone in section: slab and the laminated edge, B profile at the front
prof = [(D - R + p[0], ZS + p[1]) for p in b_profile()]
stone = [(0, TOP), (D - R, TOP)] + prof + [(D - 20, ZS), (D - 20, ZS + SLAB), (0, ZS + SLAB)]
sa.poly(stone, "OUT", True); sa.hatch(0, ZS + SLAB, D - R - 1, TOP, 2.0 * 5, "HAT", 30); sa.hatch(D - 20, ZS, D - R - 1, ZS + SLAB, 2.0 * 5, "HAT", 30)
sa.line((D - 20, ZS + SLAB), (D - R, ZS + SLAB), "THIN")
# carcase: top, bottom, back, hanging rail
sa.rect(BK, ZS - CB, YC, ZS, "OUT"); sa.rect(BK, CLR, YC, CLR + CB, "OUT"); sa.rect(0, CLR, BK, ZS, "OUT")
sa.rect(BK, ZS - CB - 60, BK + 20, ZS - CB, "OUT"); sa.hatch(BK, ZS - CB - 60, BK + 20, ZS - CB, 1.2 * 5, "HAT")
# fronts and boxes
sa.rect(YC, D1B, YF, D1T); sa.rect(YC, D2B, YF, D2T)
for (z0, z1) in ((D1Z0, D1Z1), (D2Z0, D2Z1)):
    sa.rect(BOX0, z0, BOX1, z1, "OUT"); sa.rect(BOX0 + 15, z0 + 12, BOX1 - 15, z1, "THIN")
    sa.rect(BOX0 + 20, z0 - 12, BOX1 - 20, z0, "HID")                                  # undermount runners
sa.rect(110, SECB0, SECY0, SECB1, "OUT"); sa.rect(110 + 12, SECB0 + 8, SECY0, SECB1, "THIN")        # the inner drawer's box
sa.rect(SECY0, SECZ0, SECY1, SECZ1, "OUT")                                                         # its front, 22 behind D2's face
sa.rect(130, SECB0 - 12, SECY0 - 20, SECB0, "HID")                                                 # its own runners
TX = D + 170                                                                       # leader notes start here, right of the dims
for i, (pt, t) in enumerate((((300, TOP - 8), "MARBLE TOP: 20 slab + 20 laminated edge, \"B\" profile (detail 1)"),
                             ((BK + 10, ZS - CB - 30), "steel hanging rail + 2 concealed brackets"),
                             ((D - 6, (D1B + D1T) / 2), "DRAWER 1 FRONT, veneered"),
                             ((300, (D1Z0 + D1Z1) / 2), "drawer box, 15 ply, 450 soft-close runners"),
                             ((260, (SECB0 + SECB1) / 2), "SECRET DRAWER: rides at the top on its own runners"),
                             (((SECY0 + SECY1) / 2, SECZ0 + 5), "its front, 22 behind D2's face (as on the owner's vanity)"),
                             ((300, (D2Z0 + D2Z1) / 2), "BIG DRAWER box (D2)"),
                             ((200, CLR + 9), "bottom panel: veneered underside (seen from below)"))):
    sa.leader(pt, (TX, 940 - i * 95), t)
sa.dim((0, CLR - 120), (D, CLR - 120), 0.01, "533 (21\") TBC")
for (z0, z1, t, o) in ((0, CLR, "305 (12\")", 14), (CLR, ZS, lab(ZS - CLR), 14), (ZS, TOP, "40", 14), (SECZ0, SECZ1, lab(SECZ1 - SECZ0), 6)):
    sa.dim((D + 10, z0), (D + 10, z1), -o * 5, t)

dt = view("DT1", "DETAIL 1 — STONE EDGE \"B\"", 1, 2, (318, 30), (3200, 600))
pts = [(-60, EDGE), (0, EDGE)] + [(p[0], p[1]) for p in b_profile()] + [(0, 0), (-20, 0), (-20, SLAB), (-60, SLAB)]
dt.poly(pts, "OUT", True); dt.hatch(-60, SLAB, -0.5, EDGE, 1.2 * 0.5, "HAT", 30); dt.hatch(-20, 0, -0.5, SLAB, 1.2 * 0.5, "HAT", 30)
dt.line((-20, SLAB), (0, SLAB), "THIN")
for cy in (R, EDGE - R): dt.line((-2, cy), (2, cy), "CEN"); dt.line((0, cy - 2), (0, cy + 2), "CEN")
dt.dim((-60, 0), (-60, EDGE), 9, "40"); dt.dim((-60, 0), (-60, SLAB), 4, "20")
dt.leader((R * 0.7, EDGE - R + R * 0.7), (18, EDGE + 4), "R10")
dt.leader((R * 0.7, R - R * 0.7), (18, 2), "R10")
dt.leader((-10, SLAB), (-45, -10), "lamination joint, hidden in the V")
dt.text((-60, -16), "Two half-rounds, one over the other (\"B\"), polished;", 2.0, "TXT")
dt.text((-60, -20), "front and left edges, mitred round the front-left corner.", 2.0, "TXT")

dc = view("DT2", "DETAIL 2 — FRONT-LEFT CORNER, PLAN", 2, 2, (300, 120), (3200, 300))
dc.line((0, 0), (160, 0)); dc.line((0, 0), (0, 130)); dc.line((R, R), (160, R), "THIN"); dc.line((R, R), (R, 130), "THIN")
dc.line((0, 0), (OVH, OVH), "THIN"); dc.text((OVH + 4, OVH - 10), "mitre", 2.0, "TXT")
dc.rect(OVH, OVH, 160, OVH + FR, "HID"); dc.line((OVH, OVH + FR), (OVH, 130), "HID"); dc.line((OVH + CB, OVH + FR), (OVH + CB, 130), "HID")
dc.text((OVH + 60, OVH + 8), "drawer front", 2.0, "TXT"); dc.text((OVH + 3, 105), "side", 2.0, "TXT", "start", 90)
dc.leader((OVH, OVH + 3), (45, 70), "veneer wraps the front's left edge")
dc.dim((0, 140), (OVH, 140), 3 * 2, "20"); dc.dim((170, 0), (170, OVH), -3 * 2, "20")

# ── writers ───────────────────────────────────────────────────────────────────────────────────────────────────
LAYERS = {"OUT": ("A-OUTLINE", 7, "CONTINUOUS", 0.45), "THIN": ("A-THIN", 7, "CONTINUOUS", 0.18), "HID": ("A-HIDDEN", 8, "DASHED", 0.25),
          "CEN": ("A-CENTRE", 1, "CENTER", 0.18), "DIM": ("A-DIM", 3, "CONTINUOUS", 0.18), "TXT": ("A-TEXT", 2, "CONTINUOUS", 0.18),
          "HAT": ("A-HATCH", 9, "CONTINUOUS", 0.13), "WALL": ("A-WALL", 8, "CONTINUOUS", 0.35)}

def dxf():
    out = []
    def g(code, val): out.append(f"{code}\n{val}")
    g(0, "SECTION"); g(2, "HEADER"); g(9, "$ACADVER"); g(1, "AC1009"); g(0, "ENDSEC")
    g(0, "SECTION"); g(2, "TABLES")
    g(0, "TABLE"); g(2, "LTYPE"); g(70, 3)
    for name, desc, pat in (("CONTINUOUS", "Solid line", []), ("DASHED", "__ __ __", [6.0, -3.0]), ("CENTER", "____ _ ____", [12.5, -2.5, 2.5, -2.5])):
        g(0, "LTYPE"); g(2, name); g(70, 0); g(3, desc); g(72, 65); g(73, len(pat)); g(40, sum(abs(x) for x in pat))
        for x in pat: g(49, x)
    g(0, "ENDTAB")
    g(0, "TABLE"); g(2, "LAYER"); g(70, len(LAYERS))
    for nm, col, lt, _ in LAYERS.values(): g(0, "LAYER"); g(2, nm); g(70, 0); g(62, col); g(6, lt)
    g(0, "ENDTAB"); g(0, "ENDSEC")
    g(0, "SECTION"); g(2, "ENTITIES")
    for v in views:
        ox, oy = v.mxy; k = v.scale if v.scale >= 1 else 1.0          # model text size: paper size × scale (details at true size)
        def P(p): return (ox + p[0], oy + p[1])
        for it in v.items:
            lay = LAYERS[it[1]][0]
            if it[0] == "L":
                a, b = P(it[2]), P(it[3]); g(0, "LINE"); g(8, lay); g(10, f"{a[0]:.3f}"); g(20, f"{a[1]:.3f}"); g(30, 0); g(11, f"{b[0]:.3f}"); g(21, f"{b[1]:.3f}"); g(31, 0)
            elif it[0] == "A":
                c = P(it[2]); g(0, "ARC"); g(8, lay); g(10, f"{c[0]:.3f}"); g(20, f"{c[1]:.3f}"); g(30, 0); g(40, it[3]); g(50, it[4]); g(51, it[5])
            elif it[0] == "F":
                pts = [P(q) for q in it[2]]
                for a_, b_ in zip(pts, pts[1:] + pts[:1]):
                    g(0, "LINE"); g(8, lay); g(10, f"{a_[0]:.3f}"); g(20, f"{a_[1]:.3f}"); g(30, 0); g(11, f"{b_[0]:.3f}"); g(21, f"{b_[1]:.3f}"); g(31, 0)
            elif it[0] == "D":
                c = P(it[2]); g(0, "CIRCLE"); g(8, lay); g(10, f"{c[0]:.3f}"); g(20, f"{c[1]:.3f}"); g(30, 0); g(40, 0.6 * k)
            elif it[0] == "T":
                p, t, h, anc, rot = P(it[2]), it[3], it[4] * k, it[5], it[6]
                g(0, "TEXT"); g(8, lay); g(10, f"{p[0]:.3f}"); g(20, f"{p[1]:.3f}"); g(30, 0); g(40, f"{h:.3f}"); g(1, t.replace("—", "-").replace("–", "-"))
                if rot: g(50, f"{rot:.2f}")
                if anc == "middle": g(72, 1); g(11, f"{p[0]:.3f}"); g(21, f"{p[1]:.3f}"); g(31, 0)
        g(0, "TEXT"); g(8, "A-TEXT"); g(10, f"{ox:.1f}"); g(20, f"{oy - 120 * (k if k > 1 else 0.2):.1f}"); g(30, 0); g(40, f"{4.5 * k:.2f}")
        g(1, f"{v.title}  ({'1:' + str(v.scale) if v.scale >= 1 else '2:1'}{' — drawn true size' if v.scale < 1 else ''})".replace("—", "-"))
    y = -1300.0                                                       # the notes, beside the plan, in the drawing itself
    for t, hd in (NOTE_LINES or []):
        g(0, "TEXT"); g(8, "A-TEXT"); g(10, "1300.0"); g(20, f"{y:.1f}"); g(30, 0); g(40, "16.0" if hd else "12.0")
        g(1, t.replace("—", "-").replace("–", "-")); y -= 30 if hd else 22
    g(0, "ENDSEC"); g(0, "EOF")
    open(os.path.join(OUT, "vanity-3ft.dxf"), "w").write("\n".join(out) + "\n")

SW, SH = 420.0, 297.0
def svg(sheet, extra):
    o = [f'<svg xmlns="http://www.w3.org/2000/svg" width="{SW}mm" height="{SH}mm" viewBox="0 0 {SW} {SH}" font-family="Helvetica, Arial, sans-serif">',
         f'<rect x="0" y="0" width="{SW}" height="{SH}" fill="#fff"/>', f'<rect x="8" y="8" width="{SW - 16}" height="{SH - 16}" fill="none" stroke="#000" stroke-width="0.5"/>']
    dash = {"HID": "1.6 0.9", "CEN": "4 0.8 0.8 0.8"}
    col = {"DIM": "#1f4fa3", "TXT": "#111", "HAT": "#777", "WALL": "#333"}
    for v in [v for v in views if v.sheet == sheet]:
        px, py = v.pxy; s = 1.0 / v.scale
        def Q(p): return (px + p[0] * s, py + (VH[v.name] - p[1]) * s)
        for it in v.items:
            nm, c_, lt, wdt = LAYERS[it[1]]; stroke = col.get(it[1], "#000"); da = f' stroke-dasharray="{dash[it[1]]}"' if it[1] in dash else ""
            if it[0] == "L":
                a, b = Q(it[2]), Q(it[3]); o.append(f'<line x1="{a[0]:.3f}" y1="{a[1]:.3f}" x2="{b[0]:.3f}" y2="{b[1]:.3f}" stroke="{stroke}" stroke-width="{wdt}"{da}/>')
            elif it[0] == "A":
                c, r, a0, a1 = it[2], it[3], it[4], it[5]; n = 24
                pts = [Q((c[0] + r * math.cos(math.radians(a0 + (a1 - a0) * i / n)), c[1] + r * math.sin(math.radians(a0 + (a1 - a0) * i / n)))) for i in range(n + 1)]
                o.append(f'<polyline points="{" ".join(f"{x:.3f},{y:.3f}" for x, y in pts)}" fill="none" stroke="{stroke}" stroke-width="{wdt}"{da}/>')
            elif it[0] == "F":
                pts = [Q(q) for q in it[2]]
                o.append(f'<polygon points="{" ".join(f"{x:.3f},{y:.3f}" for x, y in pts)}" fill="{it[3]}" stroke="{stroke}" stroke-width="{wdt}" stroke-linejoin="round"/>')
            elif it[0] == "D":
                c = Q(it[2]); o.append(f'<circle cx="{c[0]:.3f}" cy="{c[1]:.3f}" r="0.5" fill="{stroke}"/>')
            elif it[0] == "T":
                p, t, h, anc, rot = Q(it[2]), it[3], it[4], it[5], it[6]
                t = t.replace("&", "&amp;").replace("<", "&lt;")
                o.append(f'<text x="{p[0]:.3f}" y="{p[1]:.3f}" font-size="{h}" fill="{stroke}" text-anchor="{anc}"' + (f' transform="rotate({-rot:.2f} {p[0]:.3f} {p[1]:.3f})"' if rot else "") + f'>{t}</text>')
        ys = []
        for it in v.items:
            if it[0] == "L": ys += [it[2][1], it[3][1]]
            elif it[0] in ("T", "D"): ys.append(it[2][1])
            elif it[0] == "A": ys.append(it[2][1] - it[3])
        tx, ty = px, py + (VH[v.name] - min(ys)) * s + 7
        o.append(f'<text x="{tx:.2f}" y="{ty:.2f}" font-size="3.6" font-weight="bold">{v.title}</text>')
        o.append(f'<text x="{tx:.2f}" y="{ty + 4.4:.2f}" font-size="2.4">SCALE {"1:" + str(v.scale) if v.scale >= 1 else "2:1"} at A3</text>')
    o.extend(extra); o.append("</svg>")
    open(os.path.join(OUT, f"sheet{sheet}.svg"), "w").write("\n".join(o))

VH = {"FE": 1040, "SE": 1040, "PL": 660, "SA": 1040, "DT1": 50, "DT2": 160}   # each view's height in its own mm, for flipping y

def block(sheet, of):
    x0, y0 = SW - 8 - 150, SH - 8 - 34
    t = [f'<rect x="{x0}" y="{y0}" width="150" height="34" fill="#fff" stroke="#000" stroke-width="0.5"/>',
         f'<line x1="{x0}" y1="{y0 + 12}" x2="{x0 + 150}" y2="{y0 + 12}" stroke="#000" stroke-width="0.3"/>',
         f'<text x="{x0 + 3}" y="{y0 + 8.5}" font-size="5" font-weight="bold">VANITY — 3 FT, FLOATING, CORNER</text>',
         f'<text x="{x0 + 3}" y="{y0 + 17.5}" font-size="2.6">Marble top with "B" edge · veneered front and left side · 2 drawers + secret drawer</text>',
         f'<text x="{x0 + 3}" y="{y0 + 23}" font-size="2.6">For Saksham Panchal · drawn 01.10.2026 · Rev A (first issue)</text>',
         f'<text x="{x0 + 3}" y="{y0 + 28.5}" font-size="2.6">Dimensions in mm (inches). Do not scale. Check all sizes on site.</text>',
         f'<text x="{x0 + 147}" y="{y0 + 31.5}" font-size="3.2" text-anchor="end" font-weight="bold">SHEET {sheet} OF {of}</text>']
    return t

NOTE_LINES = None
def notes():
    global NOTE_LINES
    x, y = 250, 30; L = [
        ("MATERIALS", True),
        ("Top — the owner's beige-gold marble (as on the owner's vanity): 20 mm slab, a 20 mm strip laminated under the exposed edges", False),
        ("  for a 40 mm edge, \"B\" profile (detail 1), polished, to the front and left edges, mitred at the front-left corner.", False),
        ("  Back and right edges square, scribed to the walls, 3 mm clear silicone. Stands 20 proud of the veneer, front and left.", False),
        ("Veneer — as the owner's vanity (9292 burl in the Dark Diva polish) on both exposed faces: drawer fronts and left side panel;", False),
        ("  also the underside, which shows on a floating vanity. Carcase 18 mm BWP ply; drawer boxes 15 mm birch ply.", False),
        ("DRAWERS AND HARDWARE", True),
        ("Drawer 1: 178 (7\") front — anywhere from 152–229 (6–9\") works; drawer 2 takes the rest. 3 mm reveals.", False),
        ("Drawers 1 and 2: full-extension soft-close undermount runners, 450 mm (Blum Movento or equal).", False),
        ("Secret drawer: as on the owner's vanity — a drawer within the big drawer. A 75 mm box rides at the top of the big", False),
        ("  drawer's opening on its own 400 mm runners, its front 22 mm behind the big drawer's face; the big drawer's sides stop", False),
        ("  lower so it rides clear. Invisible when shut: open the big drawer, then pull the inner one out behind it.  Pulls: not specified.", False),
        ("FIXING", True),
        ("Wall-hung on a steel hanging rail and two concealed steel cantilever brackets inside the side panels, into the back wall;", False),
        ("  cleated to the right wall. Size for the stone (about 30 kg) plus contents — the fabricator / engineer to confirm.", False),
        ("TO CONFIRM", True),
        ("Depth: 533 (21\") assumed — not given.  Basin and tap: none shown.  Pull style.  Top drawer height within 6–9\".", False)]
    NOTE_LINES = L
    o = []
    for t, hd in L:
        t = t.replace("&", "&amp;")
        bold = ' font-weight="bold"' if hd else ""
        o.append(f'<text x="{x}" y="{y}" font-size="{2.9 if hd else 2.25}"{bold}>{t}</text>'); y += 4.6 if hd else 3.6
    return o

def key1():
    return [f'<text x="42" y="262" font-size="2.3">Lines: thick = visible; dashed = hidden (drawer boxes, the secret drawer); chain = centre line.</text>',
            f'<text x="42" y="266" font-size="2.3">Section A–A and details: sheet 2.  Plan and notes: sheet 3.  Editable DXF: vanity-3ft.dxf (mm, true size).</text>']

n_ = notes(); dxf(); svg(1, block(1, 3) + key1()); svg(2, block(2, 3)); svg(3, block(3, 3) + n_)
print("wrote", OUT)
