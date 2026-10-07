# The bathroom (AST-DR-037 rev 2, owner 7 Oct) — exec'd by real.py in its namespace (P, dbox, bevel, setmat, flat, warm,
# the materials, BA, H). Drawing coordinates throughout: x east from the bathroom's west wall, y south from the window
# wall, z up; BX / BY map them into the plan. Along the window wall: the 7 in WC wall (cistern inside, the owner's two
# framed niches in its face), the wall-hung WC and the shower side by side, each 4 ft wide and 3 ft 5 in deep behind
# clear glass with fronts in one line; the shower's ceiling dropped 1 ft to 8 ft, a cove round its edge; the oval tub
# east of the pier with a floor-standing filler; the owner's ten spots (his light plan, 7 Oct); marble walls, as the
# owner's photo. The vanity (scheme C) is built just before this, in real.py.
import bpy, bmesh, math
from mathutils import Vector

BX = lambda x: BA["x0"] + x
BY = lambda y: BA["s0"] + y
CHASE_D, CHASE_L, BAY, DEEP, GL_H = 178.0, 1092.0, 1219.0, 1041.0, 2000.0
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
WX0, WX1, WS, WH = 380.0, 990.0, 1829.0, 305.0                 # the window, 2 ft × 1 ft (owner, 8 Oct), its centre and sill as before
for nm, (a, b, c, d) in {"n1": (0, WX0, 0, H), "n2": (WX1, W_, 0, H), "n3": (WX0, WX1, 0, WS), "n4": (WX0, WX1, WS + WH, H)}.items():
    bbox(f"bath_wall_{nm}", a, 0, c, b, 10, d, M_BEIGE)
bbox("bath_wall_s", 0, D_ - 10, 0, W_, D_, H, M_BEIGE)
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
bpy.ops.mesh.primitive_uv_sphere_add(segments=48, ring_count=24, radius=0.5, location=P(BX(CHASE_D + 270), BY(wc_y), 330))
wc = bpy.context.active_object; wc.name = "bath_wc"; wc.scale = (0.54, 0.36, 0.17); setmat(wc, M_CERAMIC)
for p_ in wc.data.polygons: p_.use_smooth = True
bbox("bath_wc_seat", CHASE_D, wc_y - 175, 400, CHASE_D + 520, wc_y + 175, 418, M_CERAMIC, 0.008)
bbox("bath_flush", CHASE_D, wc_y - 115, 920, CHASE_D + 8, wc_y + 115, 1080, M_CHROME, 0.002)

# ── the glass: fronts in one line, the divider, the shower's east side; 10 mm clear, 2000 high, chrome hinges ──
for nm, (x0, y0, x1, y1) in {"front": (CHASE_D, DEEP, X2S, DEEP + 10), "div": (X1W - 5, 10, X1W + 5, DEEP), "east": (X2S - 5, 10, X2S + 5, DEEP + 10)}.items():
    bbox(f"bath_glass_{nm}", x0, y0, 0, x1, y1, GL_H, M_GLASS)
for x_ in (X1W - 640, X1W + 20, X1W + 600):                       # door joints and hinges
    bbox(f"bath_hinge{x_:.0f}a", x_, DEEP - 6, 300, x_ + 40, DEEP + 16, 360, M_CHROME); bbox(f"bath_hinge{x_:.0f}b", x_, DEEP - 6, 1640, x_ + 40, DEEP + 16, 1700, M_CHROME)
# the shower: level floor to a linear drain at the back, the mixer, a rain head on an arm from the window wall
SC = (X1W + X2S) / 2
bbox("bath_drain", X1W + 60, 70, 0, X2S - 60, 130, 3, M_CHROME)
bbox("bath_mixer", SC - 70, 10, 1010, SC + 70, 40, 1150, M_CHROME, 0.004)
bbox("bath_arm", SC - 10, 10, 2190, SC + 10, 380, 2210, M_CHROME)
bpy.ops.mesh.primitive_cylinder_add(vertices=48, radius=0.125, depth=0.012, location=P(BX(SC), BY(380), 2180))
setmat(bpy.context.active_object, M_CHROME); bpy.context.active_object.name = "bath_rainhead"
# the dropped ceiling over the shower bay only — 1 ft down, from the window wall to the glass line
bbox("bath_drop", X1W, 0, DROP, X2S, DEEP + 10, H, M_CEIL)
# its cove (the owner's 11–14): a lit line round the drop's underside, just inside its edge
CV = [(1448, 51, 1448, 991), (1448, 25, 2565, 25), (2565, 51, 2565, 991), (1448, 991, 2565, 991)]
for i, (x0, y0, x1, y1) in enumerate(CV):
    L_ = math.hypot(x1 - x0, y1 - y0) / 1000
    bbox(f"bath_cove{i}_strip", min(x0, x1) - (0 if x0 != x1 else 9), min(y0, y1) - (0 if y0 != y1 else 9), DROP - 4,
         max(x0, x1) + (0 if x0 != x1 else 9), max(y0, y1) + (0 if y0 != y1 else 9), DROP, M_STRIP)
    ld = bpy.data.lights.new(f"bath_cove{i}", "AREA"); ld.shape = "RECTANGLE"
    ld.size, ld.size_y = (L_, 0.018) if y0 == y1 else (0.018, L_); ld.energy = 24 * L_; warm(ld, 3000)
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

# ── the window over the WC (size still to measure): frosted glass in a bronze frame ──
mf_, ntf_, bf_ = node_mat("frosted"); bf_.inputs["Transmission Weight"].default_value = 1.0; bf_.inputs["Roughness"].default_value = 0.45
bbox("bath_win_glass", WX0, -T / 2 - 6, WS, WX1, -T / 2 + 6, WS + WH, mf_)
for nm, (a, b, c, d) in {"l": (WX0, WX0 + 40, WS, WS + WH), "r": (WX1 - 40, WX1, WS, WS + WH), "b": (WX0, WX1, WS, WS + 40), "t": (WX0, WX1, WS + WH - 40, WS + WH)}.items():
    bbox(f"bath_win_{nm}", a, -70, c, b, -40, d, M_BRONZE)
ld = bpy.data.lights.new("bath_daylight", "AREA"); ld.size, ld.size_y = (WX1 - WX0) / 1000, WH / 1000; ld.energy = 10; warm(ld, 5200)
lo = bpy.data.objects.new("bath_daylight", ld); sc.collection.objects.link(lo); lo.location = P(BX((WX0 + WX1) / 2), BY(25), WS + WH / 2)
lo.rotation_euler = (math.radians(-90), 0, 0); lo.visible_camera = False; lo.visible_glossy = False   # into the room

# ── the owner's ten spots (his light plan, 7 Oct), recessed in the ceiling, 3000 K ──
SPOTS_B = [(889, 483), (1092, 483), (533, 2388), (1753, 2388), (533, 1575), (1727, 1549), (2616, 1499), (3251, 483), (3302, 1524), (3302, 2362)]
for i, (x_, y_) in enumerate(SPOTS_B):
    z_ = H
    bpy.ops.mesh.primitive_cylinder_add(vertices=24, radius=0.032, depth=0.004, location=P(BX(x_), BY(y_), z_ - 2)); setmat(bpy.context.active_object, M_TRIM)
    bpy.ops.mesh.primitive_cylinder_add(vertices=24, radius=0.022, depth=0.003, location=P(BX(x_), BY(y_), z_ - 4)); setmat(bpy.context.active_object, M_DISC)
    ld = bpy.data.lights.new(f"bath_spot{i + 1}", "SPOT"); ld.spot_size = math.radians(55); ld.spot_blend = 0.7; ld.shadow_soft_size = 0.015; ld.energy = 9; warm(ld, 3000)
    so = bpy.data.objects.new(f"bath_spot{i + 1}", ld); sc.collection.objects.link(so); so.location = P(BX(x_), BY(y_), z_ - 12)
print(f"bathroom: chase + 2 niches, WC, glass, shower drop at {DROP:.0f} with 4 coves, tub, window, {len(SPOTS_B)} spots", flush=True)
