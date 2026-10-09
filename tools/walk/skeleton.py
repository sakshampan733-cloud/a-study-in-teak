# The suite as built — bedroom, dressing, bathroom, tunnel — walls, floors, ceilings and openings only.
# Every number is from the drawings on the site (AST-DR-000 room shell, AST-DR-023 dressing shell),
# the owner's tape, and the LiDAR scan of 27.09.2026. Orange = still open / assumed, to confirm.
#
#   blender -b --python tools/walk/skeleton.py -- <out_dir> [stills|video|blend]
#
# Plan coordinates are the room shell's: x mm east from the bedroom's left wall at the study end,
# s mm south from the study wall. Blender: X = x, Y = −s, Z up, metres.
import bpy, bmesh, math, os, sys
from mathutils import Vector

args = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
OUT = args[0] if args else "/tmp/skeleton"
MODE = args[1] if len(args) > 1 else "stills"
os.makedirs(OUT, exist_ok=True)

bpy.ops.wm.read_factory_settings(use_empty=True)
sc = bpy.context.scene
P = lambda x, s, z=0.0: (x / 1000, -s / 1000, z / 1000)

# ── the numbers ────────────────────────────────────────────────────────────────
T = 230                      # wall, throughout (AST-DR-000 / AST-DR-023: 9 in)
H = 2769                     # ceiling, 9 ft 1 in, level throughout (measured)
ROOF = 480                   # slab drawn above the ceiling — thick enough to take the dressing dome
# bedroom (AST-DR-000): 14'11" at the study wall, 15'6" at the bed wall; left wall leans 2 in then steps 5 in
BED = dict(xR=4547, L=5766, xLs=-50, xLb=-177, yStep=4600)
WIN = dict(x0=4547 - 1219, x1=4547, sill=737, head=2388)          # study-wall window, hard into the right corner: 5 ft 5 in frame to frame,
                                                                   # its top 15 in under the 9 ft 1 in ceiling, so it starts 2 in above the 686 counter (owner, 9 Oct)
# doors: leaf + lining each side. All leaves 7 ft 7 in.
LEAF_H, LIN = 2311, 51
D1 = dict(leaf=914)                                              # entrance, end of the left wall, at the bed-wall corner
D2 = dict(leaf=762, open=864, corner=686)                       # dressing door: 2'6" leaf, 2'10" with frame; 2'3" of wall to the bed-wall corner, 2'5" with frame (owner, 27.09)
# dressing (AST-DR-023): 9'3" along the bedroom, 12'4" deep, its bedroom-end corner = the bed-wall corner
DR = dict(x0=4547 + T, s1=BED["L"], w=2819, d=3759)
DR["x1"], DR["s0"] = DR["x0"] + DR["d"], DR["s1"] - DR["w"]
DOME = dict(w=1524, crown=3048)                                  # 10 ft crown; 5 ft strip down the aisle (designer's grid) — OPEN
TUN = dict(w=914, l=2337, h=2183)                                # 3 ft × 7'8", east end of the dressing's south wall; mouth = hidden door height
# bathroom: 12'3" × 8'11" (tape), north wall on the study-wall line — which leaves exactly a 9 in wall to the dressing
BA = dict(x0=4777, s0=0, l=3734, w=2718)
BA["x1"], BA["s1"] = BA["x0"] + BA["l"], BA["s0"] + BA["w"]
D3 = dict(open=762)                                              # 2'6" frame to frame, hard in the west corner (LiDAR: 0.77 m)
CHASE = dict(d=178, from_door=1626)                             # the 7 in wall on the WC wall: 5'4" from the door corner, then 3'7" of it to the far wall
PIER = dict(east=940, w=254, out=914)                            # 3'1" to the east wall, 10 in thick (owner, 27.09), 3 ft out
BWIN = dict(x0=4777 + 178 + 50, w=914, sill=1829, h=610)          # bathroom window — size and height NOT measured: OPEN

# ── materials (workbench object colours) ───────────────────────────────────────
WALL, FLOOR, CEIL = (0.80, 0.78, 0.74), (0.36, 0.29, 0.23), (0.86, 0.85, 0.83)
OPEN, WOOD, GLASS, HOLE, INKC = (0.95, 0.55, 0.18), (0.45, 0.30, 0.18), (0.62, 0.78, 0.88), (0.10, 0.10, 0.10), (0.15, 0.13, 0.12)

def prism(name, pts, z0, z1, col=WALL, coll=None):
    """Extrude a plan polygon (x, s pairs in mm) from z0 to z1 (mm)."""
    me = bpy.data.meshes.new(name); bm = bmesh.new()
    vs = [bm.verts.new(P(x, s, z0)) for x, s in pts]
    f = bm.faces.new(vs)
    r = bmesh.ops.extrude_face_region(bm, geom=[f])
    for v in [e for e in r["geom"] if isinstance(e, bmesh.types.BMVert)]: v.co.z = z1 / 1000
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    bm.to_mesh(me); bm.free()
    ob = bpy.data.objects.new(name, me); (coll or sc.collection).objects.link(ob); ob.color = (*col, 1)
    return ob

def box(name, x0, s0, z0, x1, s1, z1, col=WALL, coll=None):
    x0, x1 = sorted((x0, x1)); s0, s1 = sorted((s0, s1))
    return prism(name, [(x0, s0), (x1, s0), (x1, s1), (x0, s1)], z0, z1, col, coll)

def cut(target, cutters):
    """Boolean-subtract a list of objects from target, apply, delete the cutters."""
    c = bpy.data.collections.new("cut_" + target.name)
    for k in cutters:
        for u in list(k.users_collection): u.objects.unlink(k)
        c.objects.link(k)
    m = target.modifiers.new("cut", "BOOLEAN"); m.operation = "DIFFERENCE"; m.solver = "EXACT"
    m.operand_type = "COLLECTION"; m.collection = c
    dg = bpy.context.evaluated_depsgraph_get()
    me = bpy.data.meshes.new_from_object(target.evaluated_get(dg))
    target.modifiers.clear(); old = target.data; target.data = me; bpy.data.meshes.remove(old)
    for k in cutters: bpy.data.objects.remove(k)
    bpy.data.collections.remove(c)

# ── plan outlines ──────────────────────────────────────────────────────────────
xR, L, xLs, xLb, yS = BED["xR"], BED["L"], BED["xLs"], BED["xLb"], BED["yStep"]
bedroom = [(0, 0), (xR, 0), (xR, L), (xLb, L), (xLb, yS), (xLs, yS)]
tun = dict(x0=DR["x1"] - TUN["w"], x1=DR["x1"], s0=DR["s1"] + T, s1=DR["s1"] + T + TUN["l"])
E = max(BA["x1"], DR["x1"]) + T
outline = [(-T, -T), (E, -T), (E, tun["s1"] + T), (tun["x0"] - T, tun["s1"] + T), (tun["x0"] - T, L + T),
           (xLb - T, L + T), (xLb - T, yS), (xLs - T, yS)]

# ── walls: one solid block, the rooms and openings cut out of it ──────────────
walls = prism("walls", outline, 0, H)
rooms = [prism("r_bed", bedroom, -10, H + 10),
         box("r_dress", DR["x0"], DR["s0"], -10, DR["x1"], DR["s1"], H + 10),
         box("r_bath", BA["x0"], BA["s0"], -10, BA["x1"], BA["s1"], H + 10),
         box("r_tun", tun["x0"], tun["s0"], -10, tun["x1"], tun["s1"], H + 10)]
oh = LEAF_H + LIN
d1s1 = L; d1s0 = L - (D1["leaf"] + 2 * LIN)
d2s1 = L - D2["corner"]; d2s0 = d2s1 - D2["open"]
d3x0, d3x1 = BA["x0"], BA["x0"] + D3["open"]
openings = [
    box("o_win", WIN["x0"], -T - 20, WIN["sill"], WIN["x1"], 20, WIN["head"]),
    box("o_d1", xLb - T - 20, d1s0, -10, xLb + 20, d1s1, oh),
    box("o_d2", xR - 20, d2s0, -10, xR + T + 20, d2s1, oh),
    box("o_d3", d3x0, BA["s1"] - 20, -10, d3x1, DR["s0"] + 20, oh),
    box("o_tun", tun["x0"], DR["s1"] - 20, -10, tun["x1"], tun["s0"] + 20, TUN["h"]),
    box("o_bwin", BWIN["x0"], -T - 20, BWIN["sill"], BWIN["x0"] + BWIN["w"], 20, BWIN["sill"] + BWIN["h"]),
]
cut(walls, rooms + openings)

# the bathroom's own masonry: the 7 in chase on the WC wall and the pier off the door wall
chase = box("chase", BA["x0"], BA["s0"], 0, BA["x0"] + CHASE["d"], BA["s1"] - CHASE["from_door"], H)
px1 = BA["x1"] - PIER["east"]; px0 = px1 - PIER["w"]
pier = box("pier", px0, BA["s1"] - PIER["out"], 0, px1, BA["s1"], H)

# ── floor, ceiling, dome ───────────────────────────────────────────────────────
floor = prism("floor", outline, -150, 0, FLOOR)
ceiling = prism("ceiling", outline, H, H + ROOF, CEIL)
c, h = DOME["w"], DOME["crown"] - H
R = (c * c / 4 + h * h) / (2 * h)
sc_ = (DR["s0"] + DR["s1"]) / 2
bpy.ops.mesh.primitive_cylinder_add(vertices=256, radius=R / 1000, depth=DR["d"] / 1000,
                                    location=((DR["x0"] + DR["x1"]) / 2000, -sc_ / 1000, (DOME["crown"] - R) / 1000),
                                    rotation=(0, math.pi / 2, 0))
domecut = bpy.context.active_object
cut(ceiling, [domecut])
# the dome's own surface, tinted — it is the open item on the ceiling
bpy.ops.mesh.primitive_cylinder_add(vertices=256, radius=R / 1000 + 0.004, depth=DR["d"] / 1000 - 0.002,
                                    location=((DR["x0"] + DR["x1"]) / 2000, -sc_ / 1000, (DOME["crown"] - R) / 1000),
                                    rotation=(0, math.pi / 2, 0))
dome = bpy.context.active_object; dome.name = "dome"; dome.color = (*OPEN, 1)
keep = box("k", DR["x0"] + 1, sc_ - c / 2 - 5, H + 1, DR["x1"] - 1, sc_ + c / 2 + 5, DOME["crown"] + 20)
m = dome.modifiers.new("keep", "BOOLEAN"); m.operation = "INTERSECT"; m.solver = "EXACT"; m.object = keep
dg = bpy.context.evaluated_depsgraph_get(); me = bpy.data.meshes.new_from_object(dome.evaluated_get(dg))
dome.modifiers.clear(); dome.data = me; bpy.data.objects.remove(keep)
dome.parent = ceiling

# ── door linings, window glass ─────────────────────────────────────────────────
def lining_x(name, xw0, xw1, s0, s1, top):   # opening through a wall that runs north–south (x = wall faces)
    return [box(name + "a", xw0, s0, 0, xw1, s0 + LIN, top, WOOD), box(name + "b", xw0, s1 - LIN, 0, xw1, s1, top, WOOD),
            box(name + "h", xw0, s0, top - LIN, xw1, s1, top, WOOD)]
def lining_s(name, x0, x1, sw0, sw1, top, lin=LIN):   # opening through a wall that runs east–west
    return [box(name + "a", x0, sw0, 0, x0 + lin, sw1, top, WOOD), box(name + "b", x1 - lin, sw0, 0, x1, sw1, top, WOOD),
            box(name + "h", x0, sw0, top - lin, x1, sw1, top, WOOD)]
lining_x("lin_d1", xLb - T, xLb, d1s0, d1s1, oh)
lining_x("lin_d2", xR, xR + T, d2s0, d2s1, oh)
lining_s("lin_d3", d3x0, d3x1, BA["s1"], DR["s0"], oh, (D3["open"] - 686) / 2)
# ── door leaves, 40 thick, each pivoting on its hinge. rot = the Z turn that swings it fully open.
DOOR = (0.52, 0.36, 0.22)
def leaf(name, hx, hs, w, local, rot):
    """local: 'y' = leaf runs along +Y (north) from the hinge, thickness to −X; '-x' / 'x' = along −X / +X, thickness to −Y."""
    x0, x1, y0, y1 = {"y": (-0.04, 0, 0, w / 1000), "-x": (-w / 1000, 0, -0.04, 0), "x": (0, w / 1000, -0.04, 0)}[local]
    me = bpy.data.meshes.new(name); z1 = LEAF_H / 1000
    v = [(x0, y0, 0), (x1, y0, 0), (x1, y1, 0), (x0, y1, 0), (x0, y0, z1), (x1, y0, z1), (x1, y1, z1), (x0, y1, z1)]
    me.from_pydata(v, [], [(0, 3, 2, 1), (4, 5, 6, 7), (0, 1, 5, 4), (1, 2, 6, 5), (2, 3, 7, 6), (3, 0, 4, 7)]); me.update()
    ob = bpy.data.objects.new(name, me); sc.collection.objects.link(ob); ob.color = (*DOOR, 1)
    ob.location = P(hx, hs, 0); ob["open"] = rot; ob.rotation_euler = (0, 0, rot)
    return ob
d3lin = (D3["open"] - 686) / 2
doors = [leaf("door_d1", xLb, d1s1 - LIN, D1["leaf"], "y", -math.pi / 2),            # entrance: hinged on the bed-wall side, lies flat along the bed wall
         leaf("door_d2", DR["x0"], d2s1 - LIN, D2["leaf"], "y", -math.pi / 2),       # dressing: hinged on the bed-wall side, swings into the dressing
         leaf("door_d3", d3x0 + d3lin, BA["s1"], 686, "x", math.pi / 2)]              # bathroom: hinged on the LEFT (west) jamb as you go in, swings into the bathroom
box("glass_win", WIN["x0"], -T / 2 - 6, WIN["sill"], WIN["x1"], -T / 2 + 6, WIN["head"], GLASS)
box("glass_bwin", BWIN["x0"], -T / 2 - 6, BWIN["sill"], BWIN["x0"] + BWIN["w"], -T / 2 + 6, BWIN["sill"] + BWIN["h"], OPEN)

# ── the ceiling light holes already cut in the bedroom (designer's CAD, set from the right wall) ──
DES_W = 182 * 25.4
holes = [(30.0, [30.4, 39.8, 86.2, 95.8, 142.4, 151.8]), (84.2, [70.5, 94.1, 117.5]), (97.2, [34.0, 154.0]),
         (117.6, [71.4, 118.6]), (136.4, [34.0, 154.0]), (145.8, [34.0, 154.0]), (174.5, [34.0, 154.0]), (183.8, [34.0, 154.0])]
for yi, xs in holes:
    for xi in xs:
        bpy.ops.mesh.primitive_cylinder_add(vertices=24, radius=0.034, depth=0.004,
                                            location=((xR - (DES_W - xi * 25.4)) / 1000, -yi * 25.4 / 1000, (H - 2) / 1000))
        o = bpy.context.active_object; o.color = (*HOLE, 1); o.parent = ceiling

# ── labels on the floor ────────────────────────────────────────────────────────
def label(txt, x, s, size=0.32, rot=0.0):
    cu = bpy.data.curves.new(txt, "FONT"); cu.body = txt; cu.size = size; cu.align_x = "CENTER"; cu.align_y = "CENTER"
    cu.extrude = 0.002
    ob = bpy.data.objects.new("lbl_" + txt, cu); sc.collection.objects.link(ob)
    ob.location = (x / 1000, -s / 1000, 0.004); ob.rotation_euler = (0, 0, rot); ob.color = (*INKC, 1)
    return ob
labels = [label("BEDROOM", xR / 2, 2900), label("DRESSING", (DR["x0"] + DR["x1"]) / 2, DR["s0"] + 700, 0.26),
          label("BATHROOM", BA["x0"] + 1500, BA["s0"] + 900, 0.26), label("TUNNEL", (tun["x0"] + tun["x1"]) / 2, (tun["s0"] + tun["s1"]) / 2, 0.2, math.pi / 2),
          label("STUDY WALL", xR / 2, 450, 0.18), label("BED WALL", xR / 2, L - 350, 0.18)]

# ── look: Eevee, clay materials, a soft ceiling light in every room ────────────
sc.render.engine = "BLENDER_EEVEE"
ee = sc.eevee
for k, v in (("taa_render_samples", 48), ("use_raytracing", True), ("use_shadows", True), ("use_gtao", True)):
    try: setattr(ee, k, v)
    except Exception: pass
sc.view_settings.view_transform = "AgX"
try: sc.view_settings.look = "AgX - Medium High Contrast"
except Exception: pass
MATS = {}
def mat_for(col, rough=0.85):
    key = tuple(round(c, 3) for c in col)
    if key in MATS: return MATS[key]
    m = bpy.data.materials.new("m_%d_%d_%d" % tuple(int(c * 255) for c in col)); m.use_nodes = True
    b = m.node_tree.nodes.get("Principled BSDF"); b.inputs["Base Color"].default_value = (*col, 1)
    b.inputs["Roughness"].default_value = rough
    if col == GLASS:
        b.inputs["Alpha"].default_value = 0.35
        try: m.surface_render_method = "BLENDED"
        except Exception: pass
    MATS[key] = m; return m
for o in sc.objects:
    if o.type in ("MESH", "FONT"):
        o.data.materials.clear(); o.data.materials.append(mat_for(tuple(o.color[:3])))
world = bpy.data.worlds.new("W"); world.use_nodes = True
bg = world.node_tree.nodes["Background"]; bg.inputs["Color"].default_value = (0.20, 0.19, 0.18, 1); bg.inputs["Strength"].default_value = 0.7
sc.world = world
def area(name, x0, s0, x1, s1, power):
    ld = bpy.data.lights.new(name, "AREA"); ld.shape = "RECTANGLE"
    ld.size, ld.size_y = (x1 - x0) / 1000 * 0.7, (s1 - s0) / 1000 * 0.7
    ld.energy = power; ld.color = (1.0, 0.93, 0.84)
    ob = bpy.data.objects.new(name, ld); sc.collection.objects.link(ob)
    ob.location = P((x0 + x1) / 2, (s0 + s1) / 2, H - 60); return ob
area("L_bed", 0, 0, xR, L, 380)
area("L_dress", DR["x0"], DR["s0"], DR["x1"], DR["s1"], 190)
area("L_bath", BA["x0"], BA["s0"], BA["x1"], BA["s1"], 170)
area("L_tun", tun["x0"], tun["s0"], tun["x1"], tun["s1"], 55)
sun = bpy.data.lights.new("sun", "SUN"); sun.energy = 1.6; sun.angle = math.radians(8); sun.color = (1.0, 0.95, 0.88)
so = bpy.data.objects.new("sun", sun); sc.collection.objects.link(so); so.rotation_euler = (math.radians(38), math.radians(12), math.radians(-35))
sc.render.resolution_x, sc.render.resolution_y = 1920, 1080
sc.render.fps = 30

centre = Vector(((xLb + E) / 2000, -(tun["s1"] / 2) / 1000, 0))
def cam(name, lens=24.0):
    cd = bpy.data.cameras.new(name); cd.lens = lens; cd.clip_start = 0.05; cd.clip_end = 200
    ob = bpy.data.objects.new(name, cd); sc.collection.objects.link(ob); return ob
def aim(ob, target):
    ob.rotation_euler = (Vector(target) - ob.location).to_track_quat("-Z", "Y").to_euler()

def still(name, ob):
    sc.camera = ob; sc.render.filepath = os.path.join(OUT, name + ".png")
    sc.render.image_settings.file_format = "PNG"; bpy.ops.render.render(write_still=True)

if MODE in ("stills", "blend"):
    ceiling.hide_render = True
    for o in ceiling.children: o.hide_render = True
    top = cam("top"); top.data.type = "ORTHO"; top.data.ortho_scale = 10.0
    top.location = Vector(((xLb - T + E) / 2000, -((tun["s1"] + T - T) / 2) / 1000, 30)); top.rotation_euler = (0, 0, 0)
    ax = cam("axon", 35); ax.location = centre + Vector((9.0, -13.0, 13.0)); aim(ax, centre + Vector((0, 0.3, 0.5)))
    ax2 = cam("axon_nw", 35); ax2.location = centre + Vector((-10.0, 11.0, 12.0)); aim(ax2, centre + Vector((0, 0, 0.5)))
    if MODE == "stills":
        sc.render.resolution_x, sc.render.resolution_y = 1600, 1500
        still("plan", top)
        sc.render.resolution_x, sc.render.resolution_y = 1920, 1080
        still("axon_se", ax); still("axon_nw", ax2)
        for o in labels: o.hide_render = True
        ceiling.hide_render = False
        for o in ceiling.children: o.hide_render = False
        # a few eye-level views with the ceiling on
        for nm, p, t in [("in_bedroom", (2200, 5300, 1600), (2600, 0, 1300)),
                         ("in_bedroom_bedwall", (2400, 1400, 1600), (1800, 5766, 1100)),
                         ("in_dressing", (5000, 4400, 1600), (8536, 4356, 2300)),
                         ("in_bathroom", (6200, 2400, 1600), (4777, 400, 1300)),
                         ("in_bathroom_pier", (5000, 1000, 1600), (8200, 2400, 1200))]:
            c_ = cam("c_" + nm, 20); c_.location = P(*p); aim(c_, P(*t)); still(nm, c_)

if MODE == "video":
    # 1 — the model from above, ceiling off, a slow half-orbit
    orb = cam("orbit", 30)
    ORB = 270
    for i, fr in enumerate(range(1, ORB + 1, 15)):
        a = math.radians(-60 + 150 * (fr - 1) / (ORB - 1))
        orb.location = centre + Vector((15 * math.cos(a), 15 * math.sin(a), 14 - 3 * (fr - 1) / (ORB - 1)))
        aim(orb, centre + Vector((0, 0, 0.3)))
        orb.keyframe_insert("location", frame=fr); orb.keyframe_insert("rotation_euler", frame=fr)
    ceiling.hide_render = True; ceiling.keyframe_insert("hide_render", frame=1)
    ceiling.hide_render = False; ceiling.keyframe_insert("hide_render", frame=ORB + 1)
    for o in ceiling.children:
        o.hide_render = True; o.keyframe_insert("hide_render", frame=1)
        o.hide_render = False; o.keyframe_insert("hide_render", frame=ORB + 1)
    for o in labels:
        o.hide_render = False; o.keyframe_insert("hide_render", frame=1)
        o.hide_render = True; o.keyframe_insert("hide_render", frame=ORB + 1)
    # 2 — the walk, eye height 1.6 m, through every door
    walk = cam("walk", 20)
    tgt = bpy.data.objects.new("look", None); sc.collection.objects.link(tgt)
    con = walk.constraints.new("TRACK_TO"); con.target = tgt; con.track_axis = "TRACK_NEGATIVE_Z"; con.up_axis = "UP_Y"
    K = [(0, (-1300, 5258, 1600), (2000, 4300, 1300)),
         (80, (400, 5160, 1600), (2300, 2600, 1300)),
         (170, (1900, 3700, 1600), (2900, 0, 1400)),
         (250, (2100, 3500, 1600), (1100, 5766, 1200)),
         (320, (2700, 4250, 1600), (4547, 4661, 1300)),
         (400, (4200, 4661, 1600), (6200, 4600, 1450)),
         (470, (5300, 4560, 1600), (8536, 4356, 2100)),
         (560, (6500, 4356, 1600), (7700, 4356, 3150)),
         (640, (7450, 4750, 1600), (8079, 5766, 1250)),
         (700, (8079, 5450, 1600), (8079, 8332, 1300)),
         (790, (8079, 7000, 1600), (8079, 8400, 1250)),
         (840, (8079, 6900, 1600), (6500, 7000, 1400)),
         (900, (8079, 5300, 1600), (5158, 2400, 1400)),
         (990, (5158, 3550, 1600), (5158, 1400, 1400)),
         (1080, (5200, 1800, 1600), (5300, 300, 1400)),     # through D3 and past its open leaf, looking north
         (1160, (5600, 1700, 1600), (8200, 2300, 1300)),    # turn east: the pier and the east wall
         (1250, (5700, 1500, 1600), (4777, 300, 1300)),     # turn back to the WC wall, the 7 in wall and the window
         (1300, (5700, 1500, 1600), (4777, 300, 1300))]
    for fr, p, t in K:
        f = ORB + 1 + fr
        walk.location = P(*p); tgt.location = P(*t)
        walk.keyframe_insert("location", frame=f); tgt.keyframe_insert("location", frame=f)
    for d, (f0, f1) in zip(doors, [(5, 55), (300, 360), (930, 990)]):
        rot = d["open"]
        d.rotation_euler.z = 0; d.keyframe_insert("rotation_euler", index=2, frame=1)
        d.keyframe_insert("rotation_euler", index=2, frame=ORB + 1 + f0)
        d.rotation_euler.z = rot; d.keyframe_insert("rotation_euler", index=2, frame=ORB + 1 + f1)
    sc.frame_start, sc.frame_end = 1, ORB + 1 + K[-1][0]
    mk = sc.timeline_markers.new("orbit", frame=1); mk.camera = orb
    mk = sc.timeline_markers.new("walk", frame=ORB + 1); mk.camera = walk
    sc.camera = orb
    ims = sc.render.image_settings
    try: ims.media_type = "VIDEO"
    except Exception: pass
    ims.file_format = "FFMPEG"
    sc.render.ffmpeg.format = "MPEG4"; sc.render.ffmpeg.codec = "H264"
    sc.render.ffmpeg.constant_rate_factor = "HIGH"; sc.render.ffmpeg.ffmpeg_preset = "GOOD"
    sc.render.filepath = os.path.join(OUT, "skeleton-walkthrough.mp4")
    bpy.ops.render.render(animation=True)

if MODE == "blend":   # opened by hand: ceiling hidden so the rooms read from above (H to toggle), orbit camera active
    for o in [ceiling, *ceiling.children]: o.hide_set(True)
    sc.camera = ax
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(OUT, "skeleton.blend"))
print("DONE", MODE)
