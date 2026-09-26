import bpy, math, sys
from mathutils import Vector

args = sys.argv[sys.argv.index("--") + 1:]
OUT = args[0]; STILL = args[1] if len(args) > 1 else None

bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.context.preferences.edit.keyframe_new_interpolation_type = 'CONSTANT'
sc = bpy.context.scene
sc.render.engine = 'BLENDER_WORKBENCH'
sh = sc.display.shading
sh.light = 'STUDIO'; sh.color_type = 'OBJECT'; sh.show_shadows = False; sh.show_cavity = True; sh.show_object_outline = True
sc.view_settings.view_transform = 'Standard'
sc.render.resolution_x, sc.render.resolution_y = 1280, 720
sc.render.fps = 24
world = bpy.data.worlds.new("W"); world.color = (0.86, 0.85, 0.83); sc.world = world

def box(name, x0, y0, z0, x1, y1, z1, col, parent=None):
    x0, x1 = sorted((x0, x1)); y0, y1 = sorted((y0, y1)); z0, z1 = sorted((z0, z1))
    me = bpy.data.meshes.new(name)
    v = [(x0,y0,z0),(x1,y0,z0),(x1,y1,z0),(x0,y1,z0),(x0,y0,z1),(x1,y0,z1),(x1,y1,z1),(x0,y1,z1)]
    me.from_pydata(v, [], [(0,1,2,3),(4,5,6,7),(0,1,5,4),(1,2,6,5),(2,3,7,6),(3,0,4,7)]); me.update()
    ob = bpy.data.objects.new(name, me); sc.collection.objects.link(ob)
    ob.color = (*col, 1)
    if parent: ob.parent = parent
    return ob

WALL, FLOOR, CARC = (0.93, 0.91, 0.87), (0.80, 0.74, 0.66), (0.95, 0.92, 0.84)
STEEL, GLASS, BRASS = (0.12, 0.12, 0.12), (0.97, 0.96, 0.91), (0.80, 0.60, 0.22)
TUN, SHELF = (0.66, 0.66, 0.68), (0.96, 0.93, 0.85)

FR, W, WT, H, T = 2.133, 2.819, 0.10, 2.183, 0.035
TY = 0.914                 # tunnel width, y 0 .. TY
TX0 = W + WT               # tunnel starts on the far side of the wall
TX1 = TX0 + 2.337          # 7 ft 8 in long
TH = 2.2
BAY = (0.0, 0.940)

# room and tunnel
box("floor", 0.6, -0.4, -0.02, TX1 + 0.3, 2.4, 0, FLOOR)
box("wallB", 0.6, -0.12, 0, W, 0, 2.77, WALL)
box("wallR", W, TY, 0, TX0, 2.4, 2.77, WALL)
box("lintel", W, -0.12, TH, TX0, TY, 2.77, WALL)
box("tunFloor", TX0, 0, -0.01, TX1, TY, 0.0, TUN)
box("tunR", W, -0.12, 0, TX1, 0, TH, TUN)            # right side of the tunnel, looking in
box("tunL", TX0, TY, 0, TX1, TY + 0.1, TH, TUN)      # left side
box("tunEnd", TX1, -0.12, 0, TX1 + 0.1, TY + 0.1, TH, TUN)

# the tunnel bay's carcase — two sides and a base, no back: the back is the hidden door
box("sideA", FR, BAY[0], 0, W, BAY[0] + 0.018, H, CARC)
box("sideB", FR, BAY[1], 0, W, BAY[1] + 0.018, H, CARC)
box("base", FR, BAY[0], 0, W, BAY[1], 0.02, CARC)
# the neighbouring bay, closed
box("nbSide", FR, 1.88, 0, W, 1.898, H, CARC); box("nbBack", W - 0.018, 0.94, 0, W, 1.88, H, CARC)
for a, b in ((0.96, 1.408), (1.412, 1.86)):
    box("nb", FR, a, 0.01, FR + T, b, H, STEEL); box("nbg", FR - 0.003, a + 0.04, 0.1, FR, b - 0.04, H - 0.08, GLASS)

# shelves: straight boards at fixed heights, the same inside the door and along the tunnel wall
LEVELS = [0.02, 0.45, 0.85, 1.25, 1.65, 2.05]
SD, DT = 0.26, 0.04       # shelf depth 10¼ in, door/backing 1½ in — 11¾ in overall
# The door is thick, so its far corner swings on a bigger radius than the door is wide. At full width
# (894) that radius is 943 — 29 mm into the tunnel's right wall. So the door is made 845 wide and a
# fixed 64 upright fills the rest of the mouth on the right; the corner then clears the wall by 15 mm.
L_ = 0.845
assert math.hypot(DT + SD, L_) <= TY - 0.015, "the door corner would hit the right wall"

# the tunnel's own shelves, on its LEFT wall, carrying on past where the door will land
S0 = TX0 + L_ + 0.01
box("tunBack", TX0, TY - DT, 0, TX1, TY, H, SHELF)
for z in LEVELS:
    box("ts", S0, TY - DT - SD, z, TX1, TY - DT, z + 0.022, SHELF)
for x in (S0, TX1 - 0.02):
    box("tu", x, TY - DT - SD, 0, x + 0.02, TY - DT, H, SHELF)

# the hidden door: hinged on the LEFT edge of the tunnel mouth, shelves facing the room when closed
hinge = bpy.data.objects.new("hinge", None); sc.collection.objects.link(hinge)
hinge.location = (TX0, TY, 0)
box("door", -DT, -L_, 0, 0, -0.005, H, SHELF, hinge)
for z in LEVELS:
    box("ds", -DT - SD, -L_, z, -DT, -0.02, z + 0.022, SHELF, hinge)
for yy in (-0.02, -L_):
    box("du", -DT - SD, yy - 0.02, 0, -DT, yy, H, SHELF, hinge)
box("hk", -0.015, -0.015, 0.05, 0.015, 0.015, H - 0.05, BRASS, hinge)     # the hinge line, in brass
# the fixed upright on the right of the mouth — the door closes against it; the touch latch is on it
box("stile", TX0 - DT - SD, 0, 0, TX0, TY - L_ - 0.005, H, SHELF)
box("latch", TX0 - DT - SD - 0.004, TY - L_ - 0.03, 1.05, TX0 - DT - SD, TY - L_ - 0.01, 1.15, BRASS)

# ── option C doors on the bay front: fold outward, then slide back in
def leaf(name, w, sy, knuckle=False):
    e = bpy.data.objects.new(name, None); sc.collection.objects.link(e); e.scale = (1, sy, 1)
    box(name + "fr", 0, 0, 0.01, w, T, H, STEEL, e)
    box(name + "gl", 0.04, -0.003, 0.10, w - 0.04, 0.0, H - 0.08, GLASS, e)
    if knuckle: box(name + "k", w - 0.012, T * 0.2, 0.05, w + 0.012, T * 0.8, H - 0.05, BRASS, e)
    return e
rot90 = lambda v: Vector((-v.y, v.x, 0))
wR = (BAY[1] - BAY[0] - 0.04 - 0.036) / 2
P0, a_, n_, ins = Vector((FR, BAY[1] - 0.02, 0)), Vector((0, -1, 0)), Vector((-1, 0, 0)), Vector((1, 0, 0))
sy = 1 if rot90(a_).dot(ins) > 0 else -1
LA, LB = leaf("LA", wR, sy, True), leaf("LB", wR, sy)
SMAX = -(wR + 0.02)
box("trk", FR - 0.02, BAY[0] + 0.02, H + 0.03, FR + 0.005, BAY[1] - 0.02, H + 0.05, BRASS)
box("run", FR, BAY[1] - 0.032, H + 0.03, FR - SMAX + 0.01, BAY[1] - 0.008, H + 0.05, BRASS)
def pose_doors(alpha, s):
    ca, sa = math.cos(alpha), math.sin(alpha)
    P = P0 + s * n_
    dA = a_ * ca + n_ * sa; Hh = P + wR * dA; dB = a_ * ca - n_ * sa
    LA.location = (P.x, P.y, 0); LA.rotation_euler = (0, 0, math.atan2(dA.y, dA.x))
    LB.location = (Hh.x, Hh.y, 0); LB.rotation_euler = (0, 0, math.atan2(dB.y, dB.x))

def ease(t): t = max(0, min(1, t)); return t * t * (3 - 2 * t)
SEG = [12, 48, 36, 18, 60, 36]       # closed, fold out, slide in, look at the shelves, door swings, hold
L = sum(SEG); c = [0]
for x in SEG: c.append(c[-1] + x)
def state(f):
    if f < c[1]: return 0, 0, 0
    if f < c[2]: return ease((f - c[1]) / SEG[1]), 0, 0
    if f < c[3]: return 1, ease((f - c[2]) / SEG[2]), 0
    if f < c[4]: return 1, 1, 0
    if f < c[5]: return 1, 1, ease((f - c[4]) / SEG[4])
    return 1, 1, 1
NV = 3; START = 1
sc.frame_start, sc.frame_end = START, START + NV * L - 1
for m in range(NV):
    for f in range(L):
        fa, fs, fd = state(f); fr = START + m * L + f
        pose_doors(math.radians(90) * fa, SMAX * fs)
        hinge.rotation_euler = (0, 0, math.radians(90) * fd)
        for o in (LA, LB): o.keyframe_insert("location", frame=fr); o.keyframe_insert("rotation_euler", frame=fr)
        hinge.keyframe_insert("rotation_euler", frame=fr)

# cameras, each showing the whole movement
def make_cam(name, loc, tgt):
    d = bpy.data.cameras.new(name); d.lens = 19; d.clip_start = 0.005
    ob = bpy.data.objects.new(name, d); sc.collection.objects.link(ob)
    ob.location = loc; ob.rotation_euler = (Vector(tgt) - Vector(loc)).to_track_quat('-Z', 'Y').to_euler()
    return ob
CAMS = [make_cam("front", (1.05, 0.47, 1.55), (3.4, 0.47, 1.05)),
        make_cam("tunnel", (1.55, 0.10, 1.75), (4.4, 0.72, 0.95)),
        make_cam("top", (3.55, 0.05, 4.3), (3.55, 0.45, 0.0))]
LABELS = ["VIEW 1 / 3  ·  FROM THE ROOM", "VIEW 2 / 3  ·  INTO THE TUNNEL", "VIEW 3 / 3  ·  FROM ABOVE"]
sc.camera = CAMS[0]
hud = bpy.data.objects.new("hud", None); sc.collection.objects.link(hud); hud.scale = (0.03, 0.03, 0.03)   # caption layer 3 cm from the lens, so no wall gets in front of it
for m in range(NV):
    f = START + m * L
    sc.timeline_markers.new("v%d" % m, frame=f).camera = CAMS[m]
    hud.location = CAMS[m].location; hud.rotation_euler = CAMS[m].rotation_euler
    hud.keyframe_insert("location", frame=f); hud.keyframe_insert("rotation_euler", frame=f)
def all_fcurves(act):
    if hasattr(act, "layers") and len(act.layers):
        for lay in act.layers:
            for st in lay.strips:
                for cb in st.channelbags: yield from cb.fcurves
    else:
        yield from getattr(act, "fcurves", [])
for fc in all_fcurves(hud.animation_data.action):
    for kp in fc.keyframe_points: kp.interpolation = 'CONSTANT'

def caption(body, x, y, size, col, align='CENTER'):
    cu = bpy.data.curves.new("t", 'FONT'); cu.body = body; cu.size = size; cu.align_x = align; cu.align_y = 'CENTER'
    ob = bpy.data.objects.new("t", cu); sc.collection.objects.link(ob)
    ob.parent = hud; ob.location = (x, y, -1.0); ob.color = (*col, 1)
    return ob
def vis(ob, ranges):
    ob.hide_render = True; ob.keyframe_insert("hide_render", frame=0)
    for a, b in ranges:
        ob.hide_render = False; ob.keyframe_insert("hide_render", frame=a)
        ob.hide_render = True; ob.keyframe_insert("hide_render", frame=b)
DARK, WHITE, GOLD = (0.06, 0.06, 0.06), (1, 1, 1), (0.95, 0.80, 0.45)
fw = 36 / 19; fh = fw * 9 / 16
box("stripT", -fw, fh / 2 - 0.135, -1.01, fw, fh, -1.005, DARK, hud)
box("stripB", -fw, -fh, -1.01, fw, -fh / 2 + 0.105, -1.005, DARK, hud)
caption("THE HIDDEN DOOR  ·  TUNNEL BAY  ·  OPTION C", 0, fh / 2 - 0.045, 0.036, WHITE)
caption("Hinged on the LEFT. The door is 2¾ in narrower than the opening, with a fixed upright on the right, so its corner clears the wall.",
        0, -fh / 2 + 0.028, 0.019, (0.85, 0.85, 0.85))
caption("Push the shelves — they are the door into the tunnel", 0, -fh / 2 + 0.072, 0.026, WHITE)
steps = ["1   Closed — the tunnel bay reads as an ordinary double door",
         "2   Option C — the doors fold outward …",
         "3   … and slide back into the cupboard",
         "4   The back of the bay is a set of shelves — it is really the hidden door",
         "5   Push it: it swings into the tunnel, on its hinge at the LEFT side",
         "6   It lies against the left wall — its shelves line up with the tunnel's own"]
for i, t in enumerate(steps):
    vis(caption(t, 0, fh / 2 - 0.100, 0.024, GOLD), [(START + m * L + c[i], START + m * L + c[i + 1]) for m in range(NV)])
for m, t in enumerate(LABELS):
    vis(caption(t, -fw / 2 + 0.05, fh / 2 - 0.045, 0.024, GOLD, 'LEFT'), [(START + m * L, START + (m + 1) * L)])

if STILL:
    sc.frame_set(int(STILL))
    sc.render.image_settings.file_format = 'PNG'; sc.render.filepath = OUT
    bpy.ops.render.render(write_still=True)
else:
    try: sc.render.image_settings.media_type = 'VIDEO'
    except Exception: pass
    sc.render.image_settings.file_format = 'FFMPEG'
    sc.render.ffmpeg.format = 'MPEG4'; sc.render.ffmpeg.codec = 'H264'; sc.render.ffmpeg.constant_rate_factor = 'MEDIUM'
    sc.render.filepath = OUT
    bpy.ops.render.render(animation=True)
