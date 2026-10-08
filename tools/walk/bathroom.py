# The bathroom (AST-DR-037 rev 2, owner 7 Oct) — exec'd by real.py in its namespace (P, dbox, bevel, setmat, flat, warm,
# the materials, BA, H). Drawing coordinates throughout: x east from the bathroom's west wall, y south from the window
# wall, z up; BX / BY map them into the plan. Along the window wall: the 7 in WC wall (cistern inside, the owner's two
# framed niches in its face), the wall-hung WC and the shower side by side, each 4 ft wide and 3 ft 5 in deep behind
# clear glass with fronts in one line; the shower's ceiling dropped 1 ft to 8 ft, a cove round its edge; the oval tub
# east of the pier with a floor-standing filler; the owner's ten spots (his light plan, 7 Oct); marble walls, as the
# owner's photo. The vanity (scheme C) is built just before this, in real.py.
import bpy, bmesh, math
# the bathroom's light is warmer than the room's (owner, 8 Oct: "the lights are not warm enough… in the whole washroom"):
# every spot and cove at 2700 K, and at night the frosted window is only a faint warm glow, not daylight
BATH_K = float(os.environ.get("BATH_K", 2700))
from mathutils import Vector

BX = lambda x: BA["x0"] + x
BY = lambda y: BA["s0"] + y
CHASE_D, CHASE_L, BAY, DEEP, GL_H = 178.0, 1092.0, 1219.0, 1041.0, 2769.0          # the glass runs to the ceiling (owner, 9 Oct)
X1W, X2S = CHASE_D + BAY, CHASE_D + 2 * BAY                     # the WC | shower divider, the shower's east side
DROP = 2438.0                                                    # the shower's ceiling, 8 ft
M_GLASS = None
mg_, ntg_, bg_ = node_mat("shower_glass"); bg_.inputs["Transmission Weight"].default_value = 1.0; bg_.inputs["Roughness"].default_value = 0.02; bg_.inputs["IOR"].default_value = 1.5
bg_.inputs["Base Color"].default_value = (0.92, 0.97, 0.96, 1); M_GLASS = mg_
M_CERAMIC = flat("bath_ceramic", (0.93, 0.92, 0.89), 0.06, coat=0.7)

def bbox(name, x0, y0, z0, x1, y1, z1, m, bev=0.0):
    o = dbox(name, BX(min(x0, x1)), BY(min(y0, y1)), z0, BX(max(x0, x1)), BY(max(y0, y1)), z1, m)
    if bev: bevel(o, bev, 2)
    return o

# ── marble on the walls, floor to ceiling (the owner's photo), a 10 mm skin on each inside face ──
W_, D_ = BA["x1"] - BA["x0"], BA["s1"] - BA["s0"]
BWX0, BWX1, BWS, BWH = 380.0, 990.0, 1829.0, 305.0                 # the window, 2 ft × 1 ft (owner, 8 Oct), its centre and sill as before
for nm, (a, b, c, d) in {"n1": (0, BWX0, 0, H), "n2": (BWX1, W_, 0, H), "n3": (BWX0, BWX1, 0, BWS), "n4": (BWX0, BWX1, BWS + BWH, H)}.items():
    bbox(f"bath_wall_{nm}", a, 0, c, b, 10, d, M_BEIGE)
DOOR_X1, DOOR_H = 762.0, 2311.0 + 51.0                            # D3, 2 ft 6 in frame to frame in the west corner: left open in the marble
bbox("bath_wall_s", DOOR_X1, D_ - 10, 0, W_, D_, H, M_BEIGE); bbox("bath_wall_s_head", 0, D_ - 10, DOOR_H, DOOR_X1, D_, H, M_BEIGE)
bbox("bath_wall_w", 0, 0, 0, 10, D_, H, M_BEIGE); bbox("bath_wall_e", W_ - 10, 0, 0, W_, D_, H, M_BEIGE)

# ── the 7 in WC wall, its two framed niches cut 4 in into its face (sizes read off the owner's photo) ──
chase = bbox("bath_chase", 0, 0, 0, CHASE_D, CHASE_L, H, M_BEIGE)
NICHES = [(40, 300, 1200, 1800), (380, 380, 1200, 2200)]          # (from the window wall, width, sill, top)
for i, (y0, w, z0, z1) in enumerate(NICHES):
    cut = bbox(f"bath_niche_cut{i}", CHASE_D - 100, y0, z0, CHASE_D + 50, y0 + w, z1, M_BEIGE)
    bo = chase.modifiers.new(f"niche{i}", "BOOLEAN"); bo.object = cut; bo.operation = "DIFFERENCE"; cut.hide_render = True; cut.hide_viewport = True
    for nm, (a, b, c, d) in {"t": (y0 - 40, y0 + w + 40, z1, z1 + 40), "b": (y0 - 40, y0 + w + 40, z0 - 40, z0), "l": (y0 - 40, y0, z0, z1), "r": (y0 + w, y0 + w + 40, z0, z1)}.items():
        bbox(f"bath_niche{i}_{nm}", CHASE_D, a, c, CHASE_D + 12, b, d, M_BEIGE, 0.003)      # the marble frame moulding, ½ in proud
# the wall-hung WC on the chase's face, facing the shower: bowl, seat, the flush plate above
wc_y = DEEP / 2
# a real wall-hung pan: egg-shaped in plan, straight-sided at the wall, its underside sweeping up toward the front; a
# closed soft-close lid and seat in the same white, two chrome hinge posts
WCL, WCW, WCT = 540.0, 360.0, 400.0
wc_hw = lambda u: (WCW / 2) * (1.0 if u <= 0.35 else math.sqrt(max(0.0, 1 - ((u - 0.35) / 0.66) ** 2)))
wc_zb = lambda u: 300 + 75 * u ** 1.5
def wc_ring(u, n=40, sh=1.0, z0=None, z1=None):
    x = WCL * u; hw = wc_hw(u) * sh; zb = wc_zb(u) if z0 is None else z0; zt = WCT if z1 is None else z1
    zc, hh, e = (zt + zb) / 2, (zt - zb) / 2, 2 / 2.6
    return [(x, hw * math.copysign(abs(math.cos(t)) ** e, math.cos(t)), zc + hh * math.copysign(abs(math.sin(t)) ** e, math.sin(t))) for t in [2 * math.pi * k / n for k in range(n)]]
def wc_solid(name, us, m, **kw):
    bm = bmesh.new(); rings = [[bm.verts.new(P(BX(CHASE_D + x), BY(wc_y + y), z)) for x, y, z in wc_ring(u, **kw)] for u in us]
    n = len(rings[0])
    for a_, b_ in zip(rings, rings[1:]):
        for k in range(n): bm.faces.new((a_[k], a_[(k + 1) % n], b_[(k + 1) % n], b_[k]))
    bm.faces.new(rings[0][::-1])
    tip = bm.verts.new(sum((v.co for v in rings[-1]), Vector()) / n + Vector((0.004, 0, 0)))
    for k in range(n): bm.faces.new((rings[-1][k], rings[-1][(k + 1) % n], tip))
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces[:])
    me = bpy.data.meshes.new(name); bm.to_mesh(me); bm.free()
    for p_ in me.polygons: p_.use_smooth = True
    o = bpy.data.objects.new(name, me); bpy.context.scene.collection.objects.link(o); setmat(o, m)
    sd = o.modifiers.new("s", "SUBSURF"); sd.levels = 1; sd.render_levels = 2
    return o
wc_solid("bath_wc", [i / 36 * 0.985 for i in range(37)], M_CERAMIC)
wc_solid("bath_wc_seat", [0.07 + i / 30 * 0.915 for i in range(31)], M_CERAMIC, sh=1.01, z0=WCT + 2, z1=WCT + 20)
wc_solid("bath_wc_lid", [0.08 + i / 30 * 0.9 for i in range(31)], M_CERAMIC, sh=0.99, z0=WCT + 21, z1=WCT + 38)
for sy in (-1, 1):
    bpy.ops.mesh.primitive_cylinder_add(vertices=20, radius=0.009, depth=0.03, location=P(BX(CHASE_D + 45), BY(wc_y + sy * 110), WCT + 12))
    setmat(bpy.context.active_object, M_CHROME)
bbox("bath_flush", CHASE_D, wc_y - 115, 920, CHASE_D + 8, wc_y + 115, 1080, M_CHROME, 0.002)

# ── the glass: fronts in one line, the divider, the shower's east side; 10 mm clear, floor to ceiling, chrome hinges ──
for nm, (x0, y0, x1, y1) in {"front": (CHASE_D, DEEP, X2S, DEEP + 10), "div": (X1W - 5, 10, X1W + 5, DEEP), "east": (X2S - 5, 10, X2S + 5, DEEP + 10)}.items():
    bbox(f"bath_glass_{nm}", x0, y0, 0, x1, y1, GL_H, M_GLASS)
for x_ in (X1W - 640, X1W + 20, X1W + 600):                       # door joints and hinges
    bbox(f"bath_hinge{x_:.0f}a", x_, DEEP - 6, 300, x_ + 40, DEEP + 16, 360, M_CHROME); bbox(f"bath_hinge{x_:.0f}b", x_, DEEP - 6, 1640, x_ + 40, DEEP + 16, 1700, M_CHROME)
# the shower (owner, 7 Oct): the Oyster "Brook" — a square ceiling rain panel set flush in the dropped ceiling, mist
# rainfall over its face and a waterfall slot along its front edge; on the window wall a 3-way thermostatic diverter
# (rain · waterfall · hand shower) and a hand shower on its bracket. Level floor to a linear drain at the back.
SC = (X1W + X2S) / 2
bbox("bath_drain", X1W + 60, 70, 0, X2S - 60, 130, 3, M_CHROME)
M_STEEL, _nts, _bst = node_mat("brushed_steel"); _bst.inputs["Base Color"].default_value = (0.62, 0.62, 0.62, 1)
_bst.inputs["Metallic"].default_value = 1.0; _bst.inputs["Roughness"].default_value = 0.28
_vn = _nts.nodes.new("ShaderNodeTexVoronoi"); _vn.inputs["Scale"].default_value = 55.0
_vn.feature = "F1"; _vn.distance = "CHEBYCHEV"
_cr = _nts.nodes.new("ShaderNodeValToRGB"); _cr.color_ramp.elements[0].position = 0.08; _cr.color_ramp.elements[1].position = 0.1
_cr.color_ramp.elements[0].color = (0.05, 0.05, 0.05, 1); _cr.color_ramp.elements[1].color = (0.62, 0.62, 0.62, 1)
_nts.links.new(_vn.outputs["Distance"], _cr.inputs["Fac"]); _nts.links.new(_cr.outputs["Color"], _bst.inputs["Base Color"])
RP, RPY = 500.0, DEEP / 2                                                  # the panel: 500 square, centred in the bay
bbox("bath_rainpanel_trim", SC - RP / 2 - 12, RPY - RP / 2 - 12, DROP - 4, SC + RP / 2 + 12, RPY + RP / 2 + 12, DROP - 1, M_CHROME, 0.002)
bbox("bath_rainhead", SC - RP / 2, RPY - RP / 2, DROP - 9, SC + RP / 2, RPY + RP / 2, DROP - 3, M_STEEL, 0.001)
bbox("bath_waterfall", SC - RP / 2 + 30, RPY + RP / 2 - 26, DROP - 10, SC + RP / 2 - 30, RPY + RP / 2 - 18, DROP - 8, M_DARK)
bpy.ops.mesh.primitive_cylinder_add(vertices=64, radius=0.095, depth=0.01, location=P(BX(SC), BY(5), 1100))
dv = bpy.context.active_object; dv.name = "bath_diverter"; dv.rotation_euler = (math.pi / 2, 0, 0); setmat(dv, M_CHROME)
for nm, (dx, r, dep) in {"thermo": (-40, 0.022, 0.05), "divert": (40, 0.02, 0.04)}.items():
    bpy.ops.mesh.primitive_cylinder_add(vertices=32, radius=r, depth=dep, location=P(BX(SC + dx), BY(5 + dep * 500), 1100))
    k_ = bpy.context.active_object; k_.name = f"bath_{nm}"; k_.rotation_euler = (math.pi / 2, 0, 0); setmat(k_, M_CHROME)
    bv_ = k_.modifiers.new("b", "BEVEL"); bv_.width = 0.004; bv_.segments = 3
bbox("bath_hs_bracket", SC + 260, 0, 1180, SC + 300, 40, 1230, M_CHROME, 0.003)               # the hand shower in its holder
bpy.ops.mesh.primitive_cylinder_add(vertices=24, radius=0.016, depth=0.24, location=P(BX(SC + 280), BY(48), 1290))
hs_ = bpy.context.active_object; hs_.name = "bath_handshower"; hs_.rotation_euler = (math.radians(-12), 0, 0); setmat(hs_, M_CHROME)
cvh = bpy.data.curves.new("bath_hose", "CURVE"); cvh.dimensions = "3D"; cvh.bevel_depth = 0.006; cvh.bevel_resolution = 2
spl = cvh.splines.new("POLY"); hp = [(SC + 280, 45, 1170), (SC + 300, 80, 900), (SC + 220, 70, 700), (SC + 100, 30, 820), (SC + 60, 12, 1040)]
spl.points.add(len(hp) - 1)
for i, q in enumerate(hp): spl.points[i].co = (*P(BX(q[0]), BY(q[1]), q[2]), 1)
spl.type = "NURBS"; spl.order_u = 4; spl.use_endpoint_u = True
hob = bpy.data.objects.new("bath_hose", cvh); bpy.context.scene.collection.objects.link(hob); hob.data.materials.append(M_CHROME)
# the dropped ceiling over the shower bay only — 1 ft down, from the window wall to the glass line
bbox("bath_drop", X1W, 0, DROP, X2S, DEEP + 10, H, M_CEIL)
# its cove (the owner's 11–14): a lit line round the drop's underside, just inside its edge
CV = [(1448, 51, 1448, 991), (1448, 25, 2565, 25), (2565, 51, 2565, 991), (1448, 991, 2565, 991)]
for i, (x0, y0, x1, y1) in enumerate(CV):
    L_ = math.hypot(x1 - x0, y1 - y0) / 1000
    bbox(f"bath_cove{i}_strip", min(x0, x1) - (0 if x0 != x1 else 9), min(y0, y1) - (0 if y0 != y1 else 9), DROP - 4,
         max(x0, x1) + (0 if x0 != x1 else 9), max(y0, y1) + (0 if y0 != y1 else 9), DROP, M_STRIP)
    ld = bpy.data.lights.new(f"bath_cove{i}", "AREA"); ld.shape = "RECTANGLE"
    ld.size, ld.size_y = (L_, 0.018) if y0 == y1 else (0.018, L_); ld.energy = 24 * L_; warm(ld, BATH_K)
    lo = bpy.data.objects.new(f"bath_cove{i}", ld); sc.collection.objects.link(lo); lo.location = P(BX((x0 + x1) / 2), BY((y0 + y1) / 2), DROP - 8)

# ── the tub: a freestanding oval, 5 ft 7 × 2 ft 7½, east of the pier; a floor-standing filler at its head ──
TCX, TCY, TW_, TL_, TH_ = (2794 + 3734) / 2, 250 + 850, 800.0, 1700.0, 600.0
bmt = bmesh.new(); rings_ = []
for zz, kk in ((0, 0.80), (40, 0.86), (150, 0.93), (330, 0.975), (520, 0.995), (TH_, 1.0)):
    ring = []
    for a in range(64):
        t = 2 * math.pi * a / 64; c_, s_ = math.cos(t), math.sin(t)
        r_ = 1 / (abs(c_) ** 2.6 + abs(s_) ** 2.6) ** (1 / 2.6)       # an oval with fuller ends
        ring.append(bmt.verts.new(P(BX(TCX + kk * TW_ / 2 * r_ * c_), BY(TCY + kk * TL_ / 2 * r_ * s_), zz)))
    rings_.append(ring)
for ra, rb in zip(rings_, rings_[1:]):
    for a in range(64): bmt.faces.new((ra[a], ra[(a + 1) % 64], rb[(a + 1) % 64], rb[a]))
bmt.faces.new(rings_[0][::-1]); bmesh.ops.recalc_face_normals(bmt, faces=bmt.faces[:])
met = bpy.data.meshes.new("bath_tub"); bmt.to_mesh(met); bmt.free()
tub = bpy.data.objects.new("bath_tub", met); sc.collection.objects.link(tub); setmat(tub, M_CERAMIC)
sol_ = tub.modifiers.new("shell", "SOLIDIFY"); sol_.thickness = 0.022; sol_.offset = -1
ss_ = tub.modifiers.new("smooth", "SUBSURF"); ss_.levels = 1; ss_.render_levels = 2
for p_ in met.polygons: p_.use_smooth = True
bbox("bath_filler", TCX - 14, 130, 0, TCX + 14, 158, 1040, M_CHROME, 0.006)
bbox("bath_filler_spout", TCX - 14, 130, 1010, TCX + 14, 330, 1040, M_CHROME, 0.006)

# ── the window over the WC: frosted glass in a bronze frame ──
mf_, ntf_, bf_ = node_mat("frosted"); bf_.inputs["Base Color"].default_value = (0.30, 0.28, 0.26, 1)       # a night pane: dark, not a white hole; bf_.inputs["Roughness"].default_value = 0.6
bf_.inputs["Emission Color"].default_value = (1.0, 0.80, 0.58, 1); bf_.inputs["Emission Strength"].default_value = 0.10      # frosted glass at night: the street's faint warm glow
bbox("bath_win_glass", BWX0, -T / 2 - 6, BWS, BWX1, -T / 2 + 6, BWS + BWH, mf_)
for nm, (a, b, c, d) in {"l": (BWX0, BWX0 + 40, BWS, BWS + BWH), "r": (BWX1 - 40, BWX1, BWS, BWS + BWH), "b": (BWX0, BWX1, BWS, BWS + 40), "t": (BWX0, BWX1, BWS + BWH - 40, BWS + BWH)}.items():
    bbox(f"bath_win_{nm}", a, -70, c, b, -40, d, M_BRONZE)
ld = bpy.data.lights.new("bath_daylight", "AREA"); ld.size, ld.size_y = (BWX1 - BWX0) / 1000, BWH / 1000; ld.energy = 1.0; warm(ld, 3200)                                       # night: barely anything comes in
lo = bpy.data.objects.new("bath_daylight", ld); sc.collection.objects.link(lo); lo.location = P(BX((BWX0 + BWX1) / 2), BY(25), BWS + BWH / 2)
lo.rotation_euler = (math.radians(-90), 0, 0); lo.visible_camera = False; lo.visible_glossy = False   # into the room

# ── the owner's ten spots (his light plan, 7 Oct), recessed in the ceiling, 2700 K (8 Oct) ──
SPOTS_B = [(889, 483), (1092, 483), (533, 2388), (1753, 2388), (533, 1575), (1727, 1549), (2616, 1499), (3251, 483), (3302, 1524), (3302, 2362)]
for i, (x_, y_) in enumerate(SPOTS_B):
    z_ = H
    bpy.ops.mesh.primitive_cylinder_add(vertices=24, radius=0.032, depth=0.004, location=P(BX(x_), BY(y_), z_ - 2)); setmat(bpy.context.active_object, M_TRIM)
    bpy.ops.mesh.primitive_cylinder_add(vertices=24, radius=0.022, depth=0.003, location=P(BX(x_), BY(y_), z_ - 4)); setmat(bpy.context.active_object, M_DISC)
    ld = bpy.data.lights.new(f"bath_spot{i + 1}", "SPOT"); ld.spot_size = math.radians(62); ld.spot_blend = 0.45; ld.shadow_soft_size = 0.02; ld.energy = float(os.environ.get("BATH_SPOT", 160)); warm(ld, BATH_K)   # bright, so each makes its own pool on the polished floor (owner, 9 Oct)
    so = bpy.data.objects.new(f"bath_spot{i + 1}", ld); sc.collection.objects.link(so); so.location = P(BX(x_), BY(y_), z_ - 12)
print(f"bathroom: chase + 2 niches, WC, glass, shower drop at {DROP:.0f} with 4 coves, tub, window, {len(SPOTS_B)} spots", flush=True)
