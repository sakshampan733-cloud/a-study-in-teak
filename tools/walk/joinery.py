# The joinery at drawing depth, exec'd by real.py (which supplies P, box, dbox, bevel, setmat, the materials and
# the plan numbers). Every moulding is its real profile swept along its path, mitred at the corners, to the
# numbers on the sheets:
#   study wall  AST-DR-005 / -006 — cornice (stepped architrave, frieze, modillions at 105, dentils 16×32, cyma
#               crown, breaking forward over the pilasters), fluted pilasters (9 half-round flutes, base, astragal,
#               neck, ovolo, abacus), band panels 400 high, bolection centre panel, raised-panel cupboard doors
#               with drop handles, a counter with 4 reeds, glazing bars
#   doors       AST-DR-001 / -009 / -015 — ovolo 20×12 planted round each panel, shaped bead 10×6 (concave
#               shoulders R30 round Ø26 roundels, rounded crown at head and foot), rails 100 / 230 / 295
#   casings     AST-DR-011 — lining 2 in, reeded 4 in moulding, 4 in corner blocks with a two-step sunk panel,
#               plinth blocks; the dressing door's head: scallop course, two small mouldings, crown to 8 ft 8
#   right wall  AST-DR-008 — ogee panel moulding 55×24, rail 40×28 with 4 reeds
import bmesh, math
from mathutils import Vector

J = bpy.data.collections.new("joinery"); sc.collection.children.link(J)

def mesh_obj(name, bm, m, smooth=False):
    bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=1e-6)
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    me = bpy.data.meshes.new(name); bm.to_mesh(me); bm.free()
    if smooth:
        for p in me.polygons: p.use_smooth = True
    o = bpy.data.objects.new(name, me); J.objects.link(o); setmat(o, m); return o

def sweep(name, prof, path, up, closed=False, m=None, smooth=False):
    """Sweep the closed 2D profile prof [(a, b) mm] along path [(x, s, z) mm]. b runs along `up` (a Blender
    vector), a along N = up × T, i.e. to the left of travel seen from up. Corners are mitred."""
    m = m or M_VEN
    prof = [q for i, q in enumerate(prof) if i == 0 or abs(q[0] - prof[i - 1][0]) + abs(q[1] - prof[i - 1][1]) > 1e-6]
    if abs(prof[0][0] - prof[-1][0]) + abs(prof[0][1] - prof[-1][1]) < 1e-6: prof = prof[:-1]
    U = Vector(up).normalized(); pts = [Vector(P(*p)) for p in path]; n = len(pts)
    bm = bmesh.new(); rings = []
    for i in range(n):
        prv = pts[i - 1] if (i > 0 or closed) else None; nxt = pts[(i + 1) % n] if (i < n - 1 or closed) else None
        t_in = (pts[i] - prv).normalized() if prv is not None else (nxt - pts[i]).normalized()
        t_out = (nxt - pts[i]).normalized() if nxt is not None else t_in
        n_in, n_out = U.cross(t_in).normalized(), U.cross(t_out).normalized()
        nm = n_in + n_out
        nm = n_in if nm.length < 1e-6 else nm.normalized()
        sc_ = 1 / max(nm.dot(n_in), 0.25)
        rings.append([bm.verts.new(pts[i] + nm * (a * sc_ / 1000) + U * (b / 1000)) for a, b in prof])
    k = len(prof)
    for i in (range(n) if closed else range(n - 1)):
        r0, r1 = rings[i], rings[(i + 1) % n]
        for j in range(k):
            jj = (j + 1) % k
            try: bm.faces.new((r0[j], r0[jj], r1[jj], r1[j]))
            except ValueError: pass
    if not closed:
        for r in (rings[0], rings[-1]):
            try: bm.faces.new(r)
            except ValueError: pass
    return mesh_obj(name, bm, m, smooth)

def run(name, prof, x0, s0, x1, s1, z, m=None, smooth=False):
    """A straight run along the floor-plan line (x0, s0) → (x1, s1) at height z; prof (a = out into the room to the
    LEFT of travel, b = up). Ends capped — they show the profile, as a return would."""
    return sweep(name, [(a, b) for a, b in prof], [(x0, s0, z), (x1, s1, z)], (0, 0, 1), False, m, smooth)

def arcpts(cx, cy, r, a0, a1, n):
    return [(cx + r * math.cos(a0 + (a1 - a0) * i / n), cy + r * math.sin(a0 + (a1 - a0) * i / n)) for i in range(n + 1)]

# ── profiles (a across / out, b up / out, mm; closed polygons) ──────────────────
def P_ogee(w=55, h=24):                     # panel moulding: outer bead, then an ogee falling to the panel
    pts = [(0, 0), (0, h * 0.45)] + [(w * 0.18 * (1 - math.cos(t)) , h * 0.45 + h * 0.55 * math.sin(t)) for t in [i * math.pi / 2 / 6 for i in range(1, 7)]]
    pts += [(w * 0.18 + w * 0.82 * u, h * (1 - 0.5 * (1 - math.cos(math.pi * u))) * 0.92 + h * 0.08 * (1 - u)) for u in [i / 10 for i in range(1, 11)]]
    return pts + [(w, 0)]
def P_ovolo(w=20, h=12):                     # planted ovolo: full height at the frame, rounding down to the panel
    return [(0, 0), (0, h)] + [(w * math.sin(t), h * math.cos(t)) for t in [i * math.pi / 2 / 8 for i in range(1, 9)]]
def P_half(w=10, h=6, n=8):                  # a half-round bead
    return [(0, 0)] + [(w / 2 - w / 2 * math.cos(t), h * math.sin(t)) for t in [i * math.pi / n for i in range(1, n)]] + [(w, 0)]
def P_reeds(w, h, n, depth):                 # a flat member with n reeds on its face
    pts = [(0, 0)]
    for i in range(n):
        for k in range(0, 9):
            t = k / 8; a = (i + t) * w / n
            pts.append((a, h - depth + depth * math.sin(math.pi * t)))
    return pts + [(w, 0)]
def P_steps(steps):                          # [(b0, b1, a)] → a stepped profile rising in b, projecting a
    pts = [(0, steps[0][0])]
    for b0, b1, a in steps: pts += [(a, b0), (a, b1)]
    return pts + [(0, steps[-1][1])]
def P_cyma(h, a0, a1):                       # cyma recta crown: from a0 out at the foot, S-curve to a1 at the top
    pts = [(0, 0), (a0, 0)]
    for i in range(1, 13):
        u = i / 12; pts.append((a0 + (a1 - a0) * (0.5 - 0.5 * math.cos(math.pi * u)), h * 0.85 * u))
    return pts + [(a1, h * 0.85), (a1, h), (0, h)]

X, Y, Z = (1, 0, 0), (0, -1, 0), (0, 0, 1)          # Blender axes: +s is −Y

# ── a mitred frame on a wall ────────────────────────────────────────────────────
def frame_on(name, wall, pos, u0, u1, z0, z1, prof, out, m=None):
    """A mitred frame on a wall plane. wall 'x' = a wall along s at x = pos, room on side `out` (±1 in x);
    wall 's' = a wall along x at s = pos, room on side `out` (±1 in s). u0..u1 along the wall, z0..z1 height.
    The profile's a runs INTO the frame, b out of the wall."""
    if wall == "x":
        U = (out, 0, 0)
        corners = [(pos, u0, z0), (pos, u1, z0), (pos, u1, z1), (pos, u0, z1)]
    else:
        U = (0, -out, 0)
        corners = [(u0, pos, z0), (u1, pos, z0), (u1, pos, z1), (u0, pos, z1)]
    # orient so N = U × T points into the frame
    c = [Vector(P(*q)) for q in corners]; t = (c[1] - c[0]).normalized(); nrm = Vector(U).cross(t)
    ctr = sum(c, Vector()) / 4
    if nrm.dot(ctr - c[0]) < 0: corners = corners[::-1]
    return sweep(name, prof, corners, U, True, m)

# ═══════════════════════════ THE STUDY WALL ═════════════════════════════════════
for o in list(sc.objects):
    if o.name.startswith(("cupboards", "counter", "skirt", "cup_gap", "book_side", "book_back", "shelf", "pil_ped", "pil0", "pil1",
                          "flute", "panel_bay", "panel_frame", "band", "cornice", "win_arch")):
        bpy.data.objects.remove(o, do_unlink=True)
CASE = 280; CUPF = 255; PED = 330; PILF = CASE + 40; CTOP = 686; CTH = 38; KICK = 110
bays = [(0, book), (book + pil, xP2), (xP2 + pil, xR)]          # bookcase, centre, window
pils = [(book, book + pil), (xP2, xP2 + pil)]
# carcass behind everything, and the plinth kick
dbox("st_carcass", 0, 0, 0, xR, CUPF - 22, CTOP - CTH, M_VEN)
dbox("st_kick", 0, CUPF - 60, 0, xR, CUPF - 50, KICK, M_DARK)
# counter: 38 thick, 4 reeds on the edge, wraps the pedestals
def counter_run(x0, x1, sf):
    dbox(f"st_ctr{x0:.0f}", x0, 0, CTOP - CTH, x1, sf - 8, CTOP, M_VEN)
    run(f"st_ctre{x0:.0f}", [(b, a) for a, b in P_reeds(CTH, 8, 4, 3)], x1, sf - 8, x0, sf - 8, CTOP - CTH)
for (a, b) in bays: counter_run(a + (25 if a else 0), b - (25 if b < xR else 0), CASE)
for (a, b) in pils:
    counter_run(a - 25, b + 25, PED + 8)
    run(f"st_ctr_rl{a}", [(b_, a_) for a_, b_ in P_reeds(CTH, 8, 4, 3)], a - 25, PED + 8, a - 25, CASE - 8, CTOP - CTH)
    run(f"st_ctr_rr{a}", [(b_, a_) for a_, b_ in P_reeds(CTH, 8, 4, 3)], b + 25, CASE - 8, b + 25, PED + 8, CTOP - CTH)
# cupboard doors: two per bay, 22 thick, a raised field in an ogee frame, a brass drop handle
def cup_door(name, x0, x1):
    z0, z1 = KICK + 8, CTOP - CTH - 8
    d = dbox(name, x0, CUPF - 22, z0, x1, CUPF, z1, M_VEN); bevel(d, 0.002, 2)
    frame_on(name + "_fr", "s", CUPF, x0 + 55, x1 - 55, z0 + 55, z1 - 55, P_ogee(28, 14), 1)
    f = dbox(name + "_field", x0 + 83, CUPF, z0 + 83, x1 - 83, CUPF + 9, z1 - 83, M_VEN); bevel(f, 0.012, 3)
    return d
for i, (a, b) in enumerate(bays):
    a2, b2 = a + (25 if a else 0), b - (25 if b < xR else 0)
    mid = (a2 + b2) / 2
    cup_door(f"st_cd{i}a", a2 + 3, mid - 2); cup_door(f"st_cd{i}b", mid + 2, b2 - 3)
    for hx in (mid - 40, mid + 40):                                              # drop handles near the meeting stiles
        bpy.ops.mesh.primitive_torus_add(major_radius=0.014, minor_radius=0.0025, location=P(hx, CUPF + 6, CTOP - CTH - 110))
        tr = bpy.context.active_object; tr.rotation_euler = (math.pi / 2, 0, 0); setmat(tr, M_BRASS)
        bpy.ops.mesh.primitive_cylinder_add(vertices=20, radius=0.009, depth=0.008, location=P(hx, CUPF + 4, CTOP - CTH - 92))
        r_ = bpy.context.active_object; r_.rotation_euler = (math.pi / 2, 0, 0); setmat(r_, M_BRASS)
# pilasters: panelled pedestal, moulded base, fluted shaft, capital
FL_W, FL_F, NFL = 16.33, 7, 9
for i, (a, b) in enumerate(pils):
    pd = dbox(f"st_ped{i}", a - 25, CUPF - 22, 0, b + 25, PED, CTOP - CTH, M_VEN); bevel(pd, 0.002, 2)
    frame_on(f"st_pedfr{i}", "s", PED, a - 25 + 40, b + 25 - 40, KICK + 40, CTOP - CTH - 50, P_ogee(24, 12), 1)
    dbox(f"st_pedk{i}", a - 30, PED - 10, 0, b + 30, PED + 4, KICK, M_DARK)
    Z0, Z1 = CTOP, 2439
    dbox(f"st_pilback{i}", a, 0, Z0, b, CASE, Z1, M_VEN)
    # moulded base on the counter
    for (z0, z1, o_) in ((Z0, Z0 + 30, 18), (Z0 + 30, Z0 + 48, 12), (Z0 + 48, Z0 + 62, 6)):
        bb = dbox(f"st_pb{i}{z0}", a - o_, CASE, z0, b + o_, PILF + o_, z1, M_VEN); bevel(bb, 0.004, 3)
    # the fluted shaft: its plan section (fillets and half-round flutes) extruded up the pilaster
    fz0, fz1 = Z0 + 62 + 60, 2240 - 60
    sec = [(0, 0), (0, 40)]
    w_tot = pil; lead = (w_tot - (NFL * FL_W + (NFL - 1) * FL_F)) / 2
    xcur = lead
    sec.append((xcur, 40))
    for k in range(NFL):
        c_ = xcur + FL_W / 2
        sec += [(c_ - FL_W / 2 * math.cos(t), 40 - FL_W / 2 * math.sin(t)) for t in [j * math.pi / 8 for j in range(1, 8)]]
        xcur += FL_W; sec.append((xcur, 40))
        if k < NFL - 1: xcur += FL_F; sec.append((xcur, 40))
    sec += [(w_tot, 40), (w_tot, 0)]
    shaft = sweep(f"st_shaft{i}", [(sy, sx) for sx, sy in sec], [(a, CASE, fz0), (a, CASE, fz1)], (1, 0, 0), False, M_VEN)
    # plain shaft above and below the flutes (the flutes stop)
    dbox(f"st_sh_lo{i}", a, CASE, Z0 + 62, b, PILF, fz0, M_VEN); dbox(f"st_sh_hi{i}", a, CASE, fz1, b, PILF, 2240, M_VEN)
    # capital: astragal, neck, ovolo, abacus — up to the cornice
    bpy.ops.mesh.primitive_cylinder_add(vertices=16, radius=0.008, depth=(pil + 16) / 1000, location=P((a + b) / 2, PILF + 1, 2248))
    ag = bpy.context.active_object; ag.rotation_euler = (0, math.pi / 2, 0); setmat(ag, M_VEN)
    dbox(f"st_neck{i}", a, CASE, 2256, b, PILF, 2330, M_VEN)
    run(f"st_ovolo{i}", [(o_, z_) for o_, z_ in [(0, 0), (4, 6), (10, 16), (16, 30), (19, 44), (20, 55), (0, 55)]], b + 1, PILF, a - 1, PILF, 2330, M_VEN)
    ab = dbox(f"st_abacus{i}", a - 13, CASE, 2385, b + 13, PILF + 13, 2439, M_VEN); bevel(ab, 0.003, 2)
# the bookcase: sides, shelves with lipped fronts, a flat head with the strip light under it
for x0_ in (0, book - 60):
    dbox(f"st_bside{x0_}", x0_, 0, CTOP, x0_ + 60, CASE, 2039, M_VEN)
dbox("st_bback", 60, 0, CTOP, book - 60, 18, 2039, M_VEN)
for z in (890, 1160, 1430, 1700):
    sh = dbox(f"st_shelf{z}", 60, 18, z, book - 60, CASE - 20, z + 25, M_VEN); bevel(sh, 0.002, 2)
    dbox(f"st_lip{z}", 60, CASE - 20, z - 4, book - 60, CASE - 2, z + 29, M_VEN)
hr = dbox("st_head", 0, 0, 1975, book, CASE, 2039, M_VEN)
run("st_headmould", [(o_, z_) for o_, z_ in [(0, 0), (10, 0), (14, 8), (14, 22), (8, 30), (0, 30)]], book, CASE, 0, CASE, 1975 - 30)
# centre bay: a flat panel, and the bolection-moulded painting panel with a raised field
c0, c1 = bays[1]
dbox("st_cback", c0, 0, CTOP, c1, CASE - 30, 2039, M_VEN)
bol = [(0, 0), (0, 10), (6, 22), (16, 26), (30, 24), (44, 16), (52, 8), (58, 4), (66, 4), (66, 0)]
frame_on("st_bolection", "s", CASE - 30, c0 + 90, c1 - 90, CTOP + 110, 1960, bol, 1)
fld = dbox("st_cfield", c0 + 156, CASE - 30, CTOP + 176, c1 - 156, CASE - 18, 1894, M_VEN); bevel(fld, 0.02, 4)
dbox("st_cpicrail", (c0 + c1) / 2 - 180, CASE - 30, 1990, (c0 + c1) / 2 + 180, CASE - 10, 2005, M_BRASS)   # picture light bar
# the window bay: reveal lining on its left, glazing bars 4 × 3
w0, w1 = bays[2]
dbox("st_wrev", w0, 0, CTOP, WIN["x0"], CASE, 2439, M_VEN)
dbox("st_whead", WIN["x0"], 0, WIN["head"], xR, CASE, 2439, M_VEN)
for k in range(1, 4):
    gx = WIN["x0"] + (WIN["x1"] - WIN["x0"]) * k / 4
    dbox(f"st_gbv{k}", gx - 12, -T / 2 - 18, WIN["sill"], gx + 12, -T / 2 + 18, WIN["head"], M_IRON)
for k in range(1, 3):
    gz = WIN["sill"] + (WIN["head"] - WIN["sill"]) * k / 3
    dbox(f"st_gbh{k}", WIN["x0"], -T / 2 - 18, gz - 12, WIN["x1"], -T / 2 + 18, gz + 12, M_IRON)
# band panels over every bay, 400 high, in ogee frames
for i, (a, b) in enumerate(bays):
    zb0 = 2039 if i < 2 else WIN["head"]
    a2, b2 = a + (0 if i == 0 else 0), b
    dbox(f"st_band{i}", a2, 0, zb0, b2, CASE, 2439, M_VEN)
    if b2 - a2 > 300 and 2439 - zb0 > 150:
        frame_on(f"st_bandfr{i}", "s", CASE, a2 + 70, b2 - 70, zb0 + 60, 2439 - 60, P_ogee(40, 18), 1)
        bf = dbox(f"st_bandf{i}", a2 + 110, CASE, zb0 + 100, b2 - 110, CASE + 7, 2439 - 100, M_VEN); bevel(bf, 0.01, 3)
# the cornice: stepped architrave, frieze, modillions, dentils, cyma crown — breaking forward over the pilasters
CZ = 2439
COR = P_steps([(0, 20, 8), (20, 42, 14), (42, 64, 20), (64, 153, 6), (153, 220, 30), (220, 255, 48)])
def cornice(tag, x0, x1, sface):
    run(f"st_cor{tag}", COR, x1, sface, x0, sface, CZ)
    run(f"st_cyma{tag}", [(a_, b_ + 255) for a_, b_ in P_cyma(2769 - CZ - 255, 70, 160)], x1, sface, x0, sface, CZ)
    x = x0 + 30
    while x + 44 < x1 - 20:                                                    # modillions at 105 centres
        mb = dbox(f"st_mod{tag}{x:.0f}", x, sface, CZ + 153, x + 44, sface + 75, CZ + 220, M_VEN); bevel(mb, 0.002, 2)
        dbox(f"st_modp{tag}{x:.0f}", x + 10, sface + 75, CZ + 170, x + 34, sface + 77, CZ + 205, M_DARK)
        x += 105
    x = x0 + 8
    while x + 16 < x1 - 8:                                                     # dentils 16 × 32, 12 gap
        dbox(f"st_den{tag}{x:.0f}", x, sface, CZ + 222, x + 16, sface + 70, CZ + 254, M_VEN); x += 28
cornice("m", 0, xR, CASE)
for i, (a, b) in enumerate(pils): cornice(f"p{i}", a - 13, b + 13, CASE + 40)
for o in J.objects:
    if o.type == "MESH" and o.name.startswith(("st_cor", "st_cyma")):
        for p_ in o.data.polygons: p_.use_smooth = False
# the study sconces sit on the pilaster faces

# ═══════════════════════════ THE RIGHT WALL: profiled panelling ═════════════════
for o in list(sc.objects):
    if o.name.startswith(("rw_tall", "rw_short", "rw_rail")): bpy.data.objects.remove(o, do_unlink=True)
for k, (a, b) in enumerate(panels + [nar]):
    frame_on(f"rwp_t{k}", "x", xR, a, b, 797, 2629, P_ogee(55, 24), -1, M_PAINT)
    frame_on(f"rwp_s{k}", "x", xR, a, b, 213, 549, P_ogee(55, 24), -1, M_PAINT)
for (a, b) in ((STUDY, d2s0 - 102), (d2s1 + 102, Lb - 15)):
    run(f"rwp_rail{a}", [(b_, a_) for a_, b_ in P_reeds(38, 28, 4, 4)], xR, b, xR, a, 648, M_PAINT)

# ═══════════════════════════ DOORS: planted mouldings to AST-DR-015 ═════════════
for o in list(sc.objects):
    if o.name.startswith(("door_d1_m", "door_d2_m")) or (o.parent and o.parent.name in ("door_d1", "door_d2")): bpy.data.objects.remove(o, do_unlink=True)
RT, RL, RB = 100, 230, 295
def bead_path(w, h, top=True):
    """The shaped bead line round a panel opening w × h (local, origin at the opening's bottom-left), after
    AST-DR-001 detail A: side lines, a concave R30 shoulder round each roundel, a rounded crown at head and foot."""
    si = 30; sh = 70; rise = min(38, w * 0.12) if w < 400 else 38; R_ = 30
    pts = []
    def crown(y_sh, sgn):                                 # left shoulder → crown → right shoulder, sgn +1 up (head), −1 down (foot)
        out = []
        for (cx, cy, a0, a1) in ((si, y_sh, -math.pi / 2 * sgn, 0), ):
            out += arcpts(cx, cy, R_, a0 if sgn > 0 else math.pi / 2, 0 if sgn > 0 else 0, 8)
        return out
    y_top, y_bot = h - sh, sh
    # head (left to right): shoulder arc round (si, y_top), crown hump, shoulder round (w - si, y_top)
    head = arcpts(si, y_top, R_, -math.pi / 2, 0, 8)
    span0, span1 = si + R_, w - si - R_
    head += [(span0 + (span1 - span0) * u, y_top + rise * math.sin(math.pi * u) ** 2) for u in [i / 24 for i in range(1, 24)]]
    head += arcpts(w - si, y_top, R_, math.pi, 3 * math.pi / 2, 8)
    foot = [(x, h - y) for (x, y) in head][::-1]
    pts = head + foot                                     # clockwise-ish ring: head L→R, then foot R→L
    return pts, [(si, y_top), (w - si, y_top), (si, y_bot), (w - si, y_bot)]
def panel(dname, face, y0, z0, w, h, xs):
    """Mouldings for one panel opening on one face of a leaf (leaf-local: y along the leaf, z up, face at x = xs,
    outward along `face` ±1)."""
    d = sc.objects[dname]
    U = (face, 0, 0)
    def loc(yy, zz, out=0): return (xs + face * out, y0 + yy, z0 + zz)
    # ovolo round the opening (sweep in leaf-local mm: build in world then parent — the leaf sits at rest, rot 0)
    corners = [(0, 0), (w, 0), (w, h), (0, h)]
    objs = []
    def lsweep(name, prof, ring, closed=True, m=M_VEN):
        mw = d.matrix_world
        path3 = []
        for (yy, zz) in ring:
            vloc = Vector((xs / 1000, (y0 + yy) / 1000, (z0 + zz) / 1000)); vw = mw @ vloc
            path3.append((vw.x * 1000, -vw.y * 1000, vw.z * 1000))
        Uw = (mw.to_3x3() @ Vector(U)).normalized()
        c = [Vector(P(*q)) for q in path3]; t = (c[1] - c[0]).normalized(); nrm = Uw.cross(t)
        ctr = sum(c, Vector()) / len(c)
        if nrm.dot(ctr - c[0]) < 0: path3 = path3[::-1]
        o = sweep(name, prof, path3, Uw, closed, m, smooth=True)
        o.parent = d; o.matrix_parent_inverse = d.matrix_world.inverted(); objs.append(o); return o
    lsweep(f"{dname}_ov{face}{y0}{z0}", P_ovolo(20, 12), [(yy - 0, zz - 0) for yy, zz in [(-20, -20), (w + 20, -20), (w + 20, h + 20), (-20, h + 20)]])
    ring, rounds = bead_path(w, h)
    lsweep(f"{dname}_bd{face}{y0}{z0}", P_half(10, 6), ring)
    for (ry, rz) in rounds:
        wv = d.matrix_world @ Vector(((xs + face * 3) / 1000, (y0 + ry) / 1000, (z0 + rz) / 1000))
        bpy.ops.mesh.primitive_cylinder_add(vertices=24, radius=0.013, depth=0.005, location=wv)
        rd = bpy.context.active_object; rd.rotation_euler = (0, math.pi / 2, 0); setmat(rd, M_VEN)
        bv = rd.modifiers.new("b", "BEVEL"); bv.width = 0.002; bv.segments = 3
        rd.parent = d; rd.matrix_parent_inverse = d.matrix_world.inverted()
def leaf_detail(dname, w, pair=False):
    d = sc.objects[dname]; rz = d.rotation_euler.z; d.rotation_euler.z = 0; bpy.context.view_layer.update()
    leaves = [(0, w / 2), (w / 2, w)] if pair else [(0, w)]
    for (l0, l1) in leaves:
        lw = l1 - l0; pw = lw - 2 * 100
        for face, xs in ((1, 0.0), (-1, -40.0)):
            panel(dname, face, l0 + 100, RB, pw, 562, xs)                             # lower: one panel square (562)
            panel(dname, face, l0 + 100, RB + 562 + RL, pw, 1124, xs)                 # upper: two squares (1124)
    if pair:                                                                     # the meeting bead Ø10
        wv = d.matrix_world @ Vector((0.004, w / 2000, LEAF_H / 2000))
        bpy.ops.mesh.primitive_cylinder_add(vertices=12, radius=0.005, depth=LEAF_H / 1000, location=wv)
        mb = bpy.context.active_object; setmat(mb, M_VEN); mb.parent = d; mb.matrix_parent_inverse = d.matrix_world.inverted()
    # knob Ø55 at 972, escutcheon Ø34 beside it, both faces
    ky = (w / 2 - 70) if pair else (w - 70)
    for xs, face in ((0.0, 1), (-40.0, -1)):
        for (yy, r_, dep, zz) in ((ky, 0.0275, 0.03, 972), (ky - 60, 0.017, 0.004, 972)):
            wv = d.matrix_world @ Vector(((xs + face * dep * 500) / 1000, yy / 1000, zz / 1000))
            if r_ > 0.02:
                bpy.ops.mesh.primitive_uv_sphere_add(segments=32, ring_count=16, radius=r_, location=wv); kb = bpy.context.active_object; kb.scale = (0.75, 1, 1)
            else:
                bpy.ops.mesh.primitive_cylinder_add(vertices=24, radius=r_, depth=dep, location=wv); kb = bpy.context.active_object; kb.rotation_euler = (0, math.pi / 2, 0)
            setmat(kb, M_BRASS); kb.parent = d; kb.matrix_parent_inverse = d.matrix_world.inverted()
    d.rotation_euler.z = rz
leaf_detail("door_d1", D1["leaf"], pair=True)
leaf_detail("door_d2", D2["leaf"])

# ═══════════════════════════ CASINGS: AST-DR-011 ═══════════════════════════════
for o in list(sc.objects):
    if o.name.startswith(("cas_d1", "cas_d2")): bpy.data.objects.remove(o, do_unlink=True)
def casing(tag, xwall, s0, s1, face, carved, jambs=(True, True)):
    """AST-DR-011. xwall: the wall face (a wall running along s); the room on side `face` (±1 in x); s0..s1 the
    opening frame to frame (the 2 in lining is inside it). Moulding 4 in reeded on the jambs, stepped across the
    head; 4 in corner blocks; plinth blocks 6 × 9 in; the carved head: scallops, two small mouldings, the crown."""
    xo = lambda d_: sorted((xwall, xwall + face * d_))
    zL = LEAF_H; zM = zL + 51; zH = zM + 102
    for j, on in enumerate(jambs):
        if not on: continue
        sgn = -1 if j == 0 else 1; se = s0 if j == 0 else s1
        a0, a1 = xo(6); dbox(f"{tag}_lin{j}", a0, min(se, se - sgn * 51), 0, a1, max(se, se - sgn * 51), zM, M_VEN)   # lining edge, 6 out
        m_lo, m_hi = sorted((se, se + sgn * 102))
        start = m_lo if face > 0 else m_hi                                  # the reeded moulding, 30 out, 6 reeds
        sweep(f"{tag}_rd{j}", P_reeds(102, 30, 6, 3), [(xwall, start, 229), (xwall, start, zM)], (face, 0, 0), False, M_VEN)
        a0, a1 = xo(34); pb = dbox(f"{tag}_pb{j}", a0, min(se - sgn * 51, se + sgn * 102), 0, a1, max(se - sgn * 51, se + sgn * 102), 229, M_VEN); bevel(pb, 0.004, 2)
        a0, a1 = xo(30); cb = dbox(f"{tag}_cb{j}", a0, m_lo, zM, a1, m_hi, zH, M_VEN); bevel(cb, 0.003, 2)
        for (ins, dep, mm) in ((14, 6, M_VEN), (26, 10, M_DARK)):
            a0, a1 = xo(30 - dep + 1)
            dbox(f"{tag}_cbp{j}{ins}", a1 - 1 if face > 0 else a0, m_lo + ins, zM + ins, a1 + (1 if face > 0 else 0) if face > 0 else a0 + 1, m_hi - ins, zH - ins, mm)
    def srun(name, prof, z, lo, hi):                                        # a run along s, profile into the room
        sA, sB = (hi, lo) if face < 0 else (lo, hi)
        return run(name, prof, xwall, sA, xwall, sB, z)
    lo = s0 - (51 if jambs[0] else 0); hi = s1 + (51 if jambs[1] else 0)
    a0, a1 = xo(6); dbox(f"{tag}_hlin", a0, lo, zL, a1, hi, zM, M_VEN)
    mlo = s0 if jambs[0] else lo; mhi = s1 if jambs[1] else hi
    srun(f"{tag}_hm", P_steps([(0, 34, 22), (34, 68, 26), (68, 102, 30)]), zM, mlo, mhi)
    if not jambs[1]: srun(f"{tag}_hm2", P_steps([(0, 34, 22), (34, 68, 26), (68, 102, 30)]), zM, mhi - 1, s1 + 5)
    if carved:
        A, B_ = s0 - 102, s1 + 102
        srun(f"{tag}_scc", P_steps([(0, 44, 40)]), zH, A, B_)                # scallop course, 40 out
        k = A + 13
        while k < B_ - 12:                                                  # scallops below it, cut back 5
            bpy.ops.mesh.primitive_cylinder_add(vertices=20, radius=0.012, depth=0.035, location=P(xwall + face * 17.5, k, zH))
            so_ = bpy.context.active_object; so_.rotation_euler = (0, math.pi / 2, 0); setmat(so_, M_VEN)
            bs = bmesh.new(); bs.from_mesh(so_.data)
            bmesh.ops.bisect_plane(bs, geom=bs.verts[:] + bs.edges[:] + bs.faces[:], plane_co=(0, 0, 0), plane_no=(-1, 0, 0), clear_outer=True)
            bs.to_mesh(so_.data); bs.free(); k += 26
        srun(f"{tag}_sm1", P_steps([(0, 19, 52)]), zH + 44, A - 12, B_ + 12)
        srun(f"{tag}_sm2", P_steps([(0, 25, 68)]), zH + 63, A - 28, B_ + 28)
        srun(f"{tag}_crown", P_cyma(2630 - (zH + 88), 68, 112), zH + 88, A - 72, B_ + 72)

casing("jc_d1", xLb, d1s0, d1s1 - 10, 1, False, (True, False))
casing("jc_d2", xR, d2s0, d2s1, -1, True)

# ═══════════════════════════ THE DESK: AST-DR-028 / -029, square corners ═══════════════
for o in list(sc.objects):
    if o.name.startswith(("desk_", "ped0", "ped1", "plinth0", "plinth1", "modesty")): bpy.data.objects.remove(o, do_unlink=True)
OV = 32                                                   # the top oversails the carcase 1¼ in
ZPL, ZPED, ZRAIL, ZFR, ZTOP = 89, 629, 644, 718, 750       # plinth · pedestal drawers · reeded rail · frieze · top
cx0, cx1, cs0, cs1 = dx0 + OV, dx1 - OV, dFront + OV, dBack - OV          # carcase; the FRONT (drawers) faces the study (s = cs0)
PW = 559                                                   # each pedestal 1 ft 10
peds = [(cx0, cx0 + PW), (cx1 - PW, cx1)]
FRONT = (0, 1, 0)                                          # Blender: the front face looks toward −s = +Y
def tube(name, pts, r=3.0, face=FRONT, m=None):
    ring = [(r * math.cos(t), r * math.sin(t)) for t in [i * 2 * math.pi / 10 for i in range(10)]]
    return sweep(name, ring, pts, face, False, m or M_BRASS, smooth=True)
# plinth under each pedestal, 3½ in, ogee top mould projecting 15, mitred
for i, (a, b) in enumerate(peds):
    dbox(f"dk_pl{i}", a - 15, cs0 - 15, 0, b + 15, cs1 + 15, ZPL - 22, M_DESK)
    corners = [(a - 15, cs0 - 15, ZPL - 22), (b + 15, cs0 - 15, ZPL - 22), (b + 15, cs1 + 15, ZPL - 22), (a - 15, cs1 + 15, ZPL - 22)]
    og = [(0, 0), (0, 8), (4, 14), (10, 18), (15, 22), (15, 22.01)][::1]
    sweep(f"dk_plog{i}", [(-x_, z_) for x_, z_ in [(0, 0), (15, 0), (15, 6), (11, 12), (6, 16), (2, 20), (0, 22)]], corners[::-1], (0, 0, 1), True, M_DESK)
    # the pedestal carcase and its end / back fielded panels
    dbox(f"dk_ped{i}", a, cs0 + 20, ZPL, b, cs1, ZPED, M_DESK)
    xe = a if i == 0 else b; out = -1 if i == 0 else 1
    frame_on(f"dk_endfr{i}", "x", xe, cs0 + 90, cs1 - 90, ZPL + 70, ZPED - 60, P_ogee(30, 12), out, M_DESK)
    ef = dbox(f"dk_endf{i}", min(xe, xe + out * 8), cs0 + 132, ZPL + 112, max(xe, xe + out * 8), cs1 - 132, ZPED - 102, M_DESK); bevel(ef, 0.012, 3)
    frame_on(f"dk_bkfr{i}", "s", cs1, a + 70, b - 70, ZPL + 70, ZPED - 60, P_ogee(30, 12), 1, M_DESK)
    # three drawers, graduated (7⅛ · 6¼ · 5½ in from the bottom), cockbeaded, swan-neck bail + keyhole
    z = ZPL + 14
    for k, hgt in enumerate((181, 159, 140)):
        x0_, x1_ = a + 22, b - 22
        dbox(f"dk_df{i}{k}", x0_, cs0, z, x1_, cs0 + 20, z + hgt, M_DESK)
        frame_on(f"dk_cb{i}{k}", "s", cs0, x0_, x1_, z, z + hgt, P_half(3, 3), -1, M_DESK)
        hx, hz = (x0_ + x1_) / 2, z + hgt / 2 - 6
        for sx in (-44.5, 44.5):
            bpy.ops.mesh.primitive_cylinder_add(vertices=24, radius=0.008, depth=0.008, location=P(hx + sx, cs0 - 4, hz + 12))
            ro = bpy.context.active_object; ro.rotation_euler = (math.pi / 2, 0, 0); setmat(ro, M_BRASS)
        bail = [(hx - 44.5, cs0 - 9, hz + 12), (hx - 42, cs0 - 9, hz + 2), (hx - 34, cs0 - 9, hz - 10), (hx - 22, cs0 - 9, hz - 16),
                (hx, cs0 - 9, hz - 17), (hx + 22, cs0 - 9, hz - 16), (hx + 34, cs0 - 9, hz - 10), (hx + 42, cs0 - 9, hz + 2), (hx + 44.5, cs0 - 9, hz + 12)]
        tube(f"dk_bail{i}{k}", bail, 2.6, (0, 0, 1))
        dbox(f"dk_kh{i}{k}", hx - 5, cs0 - 2, hz + 30, hx + 5, cs0 + 1, hz + 44, M_BRASS)
        z += hgt + 18
    # the corner moulding (fillet + bead + fillet) on each face just in from the outer corner, collars, plinth block
    cxm = a + 22 if i == 0 else b - 22
    for (px, face_) in ((cxm, "front"),):
        bpy.ops.mesh.primitive_cylinder_add(vertices=16, radius=0.007, depth=(ZPED - ZPL) / 1000, location=P(px, cs0 - 3, (ZPL + ZPED) / 2))
        bd = bpy.context.active_object; setmat(bd, M_DESK)
        for zc in (ZPL + 120, ZPED - 140):
            bpy.ops.mesh.primitive_torus_add(major_radius=0.009, minor_radius=0.004, location=P(px, cs0 - 3, zc))
            setmat(bpy.context.active_object, M_DESK)
# the kneehole: reeded rail across the full width, the modesty panel (two fielded panels), the carved drops
run("dk_rail", [(b_, a_) for a_, b_ in P_reeds(15, 12, 3, 3)], cx1, cs0 - 4, cx0, cs0 - 4, ZPED)
dbox("dk_railb", cx0, cs0 - 4, ZPED, cx1, cs1, ZRAIL, M_DESK)
mz0 = 150
dbox("dk_mod", peds[0][1], cs1 - 40, mz0, peds[1][0], cs1 - 22, ZPED, M_DESK)
mw_ = (peds[1][0] - peds[0][1]) / 2
for k in range(2):
    a_ = peds[0][1] + k * mw_
    frame_on(f"dk_modfr{k}", "s", cs1 - 40, a_ + 60, a_ + mw_ - 60, mz0 + 60, ZPED - 60, P_ogee(30, 12), -1, M_DESK)
    frame_on(f"dk_modbk{k}", "s", cs1 - 22, a_ + 60, a_ + mw_ - 60, mz0 + 60, ZPED - 60, P_ogee(30, 12), 1, M_DESK)
for i, xs_ in enumerate((peds[0][1] + 33, peds[1][0] - 33)):                  # kneehole stiles carry the carved drops
    dbox(f"dk_stile{i}", xs_ - 33, cs0 - 2, ZPL, xs_ + 33, cs0 + 20, ZPED, M_DESK)
    zc = ZPED - 60
    bpy.ops.mesh.primitive_uv_sphere_add(segments=16, ring_count=8, radius=0.012, location=P(xs_, cs0 - 8, zc + 16))
    rb = bpy.context.active_object; rb.scale = (1.9, 0.6, 0.8); setmat(rb, M_DESK)               # ribbon bow
    size = 16.0
    while zc > ZPL + 90 and size > 5:
        bpy.ops.mesh.primitive_uv_sphere_add(segments=16, ring_count=8, radius=size / 1000, location=P(xs_, cs0 - 7, zc - size))
        hk = bpy.context.active_object; hk.scale = (0.7, 0.55, 1.35); setmat(hk, M_DESK)          # a husk
        zc -= size * 2.7
        bpy.ops.mesh.primitive_uv_sphere_add(segments=12, ring_count=6, radius=0.0035, location=P(xs_, cs0 - 6, zc + 3))
        setmat(bpy.context.active_object, M_DESK)                                                   # the bead between
        zc -= 8; size *= 0.9
# frieze: three push-to-open drawers with cockbeads, under a 12 × 12 cove
fx = [cx0, peds[0][1], peds[1][0], cx1]
for k in range(3):
    dbox(f"dk_fr{k}", fx[k] + 3, cs0, ZRAIL, fx[k + 1] - 3, cs0 + 22, ZFR - 2, M_DESK)
    frame_on(f"dk_frcb{k}", "s", cs0, fx[k] + 3, fx[k + 1] - 3, ZRAIL, ZFR - 2, P_half(3, 3), -1, M_DESK)
dbox("dk_frbox", cx0, cs0 + 22, ZRAIL, cx1, cs1, ZFR, M_DESK)
cv = [(0, 0), (12, 0)] + [(12 - 12 * math.sin(t), 12 - 12 * math.cos(t)) for t in [i * math.pi / 2 / 8 for i in range(1, 9)]]
sweep("dk_cove", [(a_, -b_ + 12) for a_, b_ in [(0, 12), (12, 12)] + [(12 - 12 * math.sin(t), 12 - 12 * math.cos(t) * 0 - 12 * (1 - math.cos(t)) + 0) for t in [i * math.pi / 2 / 8 for i in range(1, 9)]]],
      [(cx1, cs0, ZFR - 12), (cx0, cs0, ZFR - 12), (cx0, cs1, ZFR - 12), (cx1, cs1, ZFR - 12)][::-1], (0, 0, 1), True, M_DESK) if False else None
# the top: plain teak, the reeded edge (8 reeds) mitred all round
dbox("dk_top", dx0 + 9, dFront + 9, ZTOP - 32, dx1 - 9, dBack - 9, ZTOP, M_DESK)
sweep("dk_edge", [(b_, a_) for a_, b_ in P_reeds(32, 9, 8, 2.5)],
      [(dx0 + 9, dFront + 9, ZTOP - 32), (dx0 + 9, dBack - 9, ZTOP - 32), (dx1 - 9, dBack - 9, ZTOP - 32), (dx1 - 9, dFront + 9, ZTOP - 32)], (0, 0, -1), True, M_DESK)
# console brackets: reeded, under the top at the outer corners (34 wide) and the kneehole stiles (50 wide)
for (xb, wb) in ((cx0 + 17, 34), (cx1 - 17, 34), (peds[0][1] + 33, 50), (peds[1][0] - 33, 50)):
    dbox(f"dk_cons{xb:.0f}", xb - wb / 2, cs0 - 38, ZFR - 190, xb + wb / 2, cs0, ZFR, M_DESK)
    for r in range(4):
        rx = xb - wb / 2 + wb * (r + 0.5) / 4
        bpy.ops.mesh.primitive_cylinder_add(vertices=10, radius=0.0035, depth=0.15, location=P(rx, cs0 - 38, ZFR - 105))
        setmat(bpy.context.active_object, M_DESK)
    bpy.ops.mesh.primitive_cylinder_add(vertices=20, radius=0.017, depth=wb / 1000, location=P(xb, cs0 - 30, ZFR - 190))
    sf = bpy.context.active_object; sf.rotation_euler = (0, math.pi / 2, 0); setmat(sf, M_DESK)          # the scroll foot
    dbox(f"dk_cabac{xb:.0f}", xb - wb / 2 - 4, cs0 - 44, ZFR - 14, xb + wb / 2 + 4, cs0, ZFR, M_DESK)     # abacus
