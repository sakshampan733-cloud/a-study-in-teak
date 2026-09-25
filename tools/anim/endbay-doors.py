import bpy, math, sys
from mathutils import Vector

OUT = sys.argv[sys.argv.index("--") + 1]
STILL = len(sys.argv) > sys.argv.index("--") + 2 and sys.argv[sys.argv.index("--") + 2]

bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.context.preferences.edit.keyframe_new_interpolation_type = 'CONSTANT'   # doors are keyed every frame; cuts and captions must snap
sc = bpy.context.scene
sc.render.engine = 'BLENDER_WORKBENCH'
sc.display.shading.light = 'STUDIO'
sc.display.shading.color_type = 'OBJECT'
sc.display.shading.show_shadows = False
sc.display.shading.shadow_intensity = 0.35
sc.display.shading.show_cavity = True
sc.display.shading.show_object_outline = True
sc.view_settings.view_transform = 'Standard'
sc.render.resolution_x, sc.render.resolution_y = 1280, 720
sc.render.fps = 24
world = bpy.data.worlds.new("W"); world.color = (0.86, 0.85, 0.83); sc.world = world

def box(name, x0, y0, z0, x1, y1, z1, col, parent=None):
    me = bpy.data.meshes.new(name)
    v = [(x0,y0,z0),(x1,y0,z0),(x1,y1,z0),(x0,y1,z0),(x0,y0,z1),(x1,y0,z1),(x1,y1,z1),(x0,y1,z1)]
    f = [(0,1,2,3),(4,5,6,7),(0,1,5,4),(1,2,6,5),(2,3,7,6),(3,0,4,7)]
    me.from_pydata(v, [], f); me.update()
    ob = bpy.data.objects.new(name, me); sc.collection.objects.link(ob)
    ob.color = (*col, 1)
    if parent: ob.parent = parent
    return ob

WALL, FLOOR, CARC = (0.93, 0.91, 0.87), (0.80, 0.74, 0.66), (0.95, 0.92, 0.84)
STEEL, GLASS, BRASS = (0.12, 0.12, 0.12), (0.97, 0.96, 0.91), (0.80, 0.60, 0.22)
RED, TUN = (0.78, 0.12, 0.10), (0.30, 0.30, 0.32)

W, FL, FR, H, T = 2.819, 0.686, 2.133, 2.183, 0.035
LB = (0.0, 0.948); LB2 = (0.948, 1.897)
RB = (0.0, 0.940); RB2 = (0.940, 1.880)

# room
box("floor", -0.2, -0.2, -0.02, 3.8, 3.2, 0.0, FLOOR)
box("wallL", -0.1, -0.1, 0, 0, 3.0, 2.77, WALL)
box("wallB", -0.1, -0.1, 0, 2.92, 0, 2.77, WALL)
box("wallR", W, 0.914, 0, W + 0.1, 3.0, 2.77, WALL)
# the tunnel, open at the top so the camera can look in
box("tunF", W, 0, -0.01, 3.7, 0.914, 0.0, TUN)
box("tunS1", W, -0.1, 0, 3.7, 0, 2.2, TUN)
box("tunS2", W, 0.914, 0, 3.7, 1.0, 2.2, TUN)
box("tunE", 3.7, -0.1, 0, 3.8, 1.0, 2.2, TUN)

# carcases — side panels, backs, bases; no tops so the camera sees in
for y in (0.0, LB[1], LB2[1]):
    box("lp", 0, y, 0, FL, y + 0.018, H, CARC)
box("lback", 0, 0, 0, 0.018, LB2[1], H, CARC)
box("lbase", 0, 0, 0, FL, LB2[1], 0.02, CARC)
for y in (0.0, RB[1], RB2[1]):
    box("rp", FR, y, 0, W, y + 0.018, H, CARC)
box("rback", W - 0.018, RB2[0], 0, W, RB2[1], H, CARC)
box("rbase", FR, 0, 0, W, RB2[1], 0.02, CARC)

# the wardrobe front line, red on the floor — nothing crosses it
box("redL", FL, 0, 0.001, FL + 0.025, 2.2, 0.004, RED)
box("redR", FR - 0.025, 0, 0.001, FR, 2.2, 0.004, RED)

# neighbouring bays, closed, for context
def static_pair(x_face, y0, y1, inward):
    xa, xb = (x_face - T, x_face) if inward < 0 else (x_face, x_face + T)
    mid = (y0 + y1) / 2
    for a, b in ((y0 + 0.02, mid - 0.002), (mid + 0.002, y1 - 0.02)):
        box("nb", xa, a, 0.01, xb, b, H, STEEL)
        gx = xb + 0.002 if inward < 0 else xa - 0.002
        box("nbg", min(gx, xb if inward < 0 else xa), a + 0.04, 0.10, max(gx, xb if inward < 0 else xa), b - 0.04, H - 0.08, GLASS)
static_pair(FL, *LB2, -1)
static_pair(FR, *RB2, +1)

# the mirror — free-standing trifold, centred, 3 ft
xc = W / 2; MY = 0.06; MH = 2.743
def mpanel(name, px, py, ang, w):
    e = bpy.data.objects.new(name, None); sc.collection.objects.link(e)
    e.location = (px, py, 0); e.rotation_euler = (0, 0, ang)
    box(name + "f", 0, 0, 0, w, 0.03, MH, (0.20, 0.16, 0.12), e)
    box(name + "m", 0.03, 0.03, 0.08, w - 0.03, 0.034, MH - 0.04, (0.70, 0.79, 0.84), e)
cw = 0.466; ww = 0.224; wa = math.radians(25)
mpanel("mc", xc - cw / 2, MY, 0, cw)
mpanel("mr", xc + cw / 2, MY, wa, ww)
e = bpy.data.objects.new("mlw", None); sc.collection.objects.link(e)
mpanel("ml", xc - cw / 2 - ww * math.cos(wa), MY + ww * math.sin(wa), -wa, ww)

# ── the moving doors
def leaf(name, w, sy, knuckle=False):
    e = bpy.data.objects.new(name, None); sc.collection.objects.link(e)
    e.scale = (1, sy, 1)
    box(name + "fr", 0, 0, 0.01, w, T, H, STEEL, e)
    box(name + "gl", 0.04, -0.003, 0.10, w - 0.04, 0.0, H - 0.08, GLASS, e)
    if knuckle:
        box(name + "k", w - 0.012, T * 0.2, 0.05, w + 0.012, T * 0.8, H - 0.05, BRASS, e)
        box(name + "car", -0.01, 0.0, H - 0.04, 0.03, T, H + 0.03, BRASS, e)
    return e

def rot90(v): return Vector((-v.y, v.x, 0))

class Bay:
    def __init__(self, P, a, n, w, smax, tag, inside=None, runner=True):
        self.P, self.a, self.n, self.w, self.smax = Vector((*P, 0)), Vector((*a, 0)), Vector((*n, 0)), w, smax
        ins = Vector((*inside, 0)) if inside else self.n
        sy = 1 if rot90(self.a).dot(ins) > 0 else -1
        self.A = leaf(tag + "A", w, sy, knuckle=True)
        self.B = leaf(tag + "B", w, sy)
        # hardware: head track along the front, pocket runner along the side panel
        z0, z1 = H + 0.03, H + 0.05
        pA, pB = self.P, self.P + 2 * w * self.a
        self.track = self.bar(tag + "trk", pA, pB, z0, z1)
        self.runner = (self.bar(tag + "run", pA, pA + ((w + smax) if smax >= 0 else smax) * self.n, z0, z1)) if runner else None
    def bar(self, name, p, q, z0, z1):
        x0, x1 = sorted((p.x, q.x)); y0, y1 = sorted((p.y, q.y))
        return box(name, x0 - 0.012, y0 - 0.012, z0, x1 + 0.012, y1 + 0.012, z1, BRASS)
    def pose(self, alpha, s):
        a, n, w = self.a, self.n, self.w
        ca, sa = math.cos(alpha), math.sin(alpha)
        P = self.P + s * n
        dA = a * ca + n * sa
        Hh = P + w * dA
        dB = a * ca - n * sa
        self.A.location = (P.x, P.y, 0); self.A.rotation_euler = (0, 0, math.atan2(dA.y, dA.x))
        self.B.location = (Hh.x, Hh.y, 0); self.B.rotation_euler = (0, 0, math.atan2(dB.y, dB.x))
    def key(self, f):
        for o in (self.A, self.B):
            o.keyframe_insert("location", frame=f); o.keyframe_insert("rotation_euler", frame=f)
    def show(self, on, f):
        for o in [x for x in (self.A, self.B, self.track, self.runner) if x] + list(self.A.children) + list(self.B.children):
            o.hide_render = not on; o.keyframe_insert("hide_render", frame=f)

wL = (LB[1] - LB[0] - 0.04 - 0.036) / 2
wR = (RB[1] - RB[0] - 0.04 - 0.036) / 2
optA = [Bay((FL, LB[0] + 0.038), (0, 1), (-1, 0), wL, FL - wL - 0.04, "LA"),
        Bay((FR, RB[0] + 0.038), (0, 1), (1, 0), wR, 0.55, "RA")]
optB = [Bay((FL, LB[1] - 0.02), (0, -1), (-1, 0), wL, FL - wL - 0.04, "LB"),
        Bay((FR, RB[1] - 0.02), (0, -1), (1, 0), wR, 0.20, "RB")]
# C — an ordinary bifold, as in the owner's photo: folds OUTWARD into the room, parks at the front end
optC = [Bay((FL, LB[1] - 0.02), (0, -1), (1, 0), wL, -(wL + 0.15), "LC", inside=(-1, 0)),
        Bay((FR, RB[1] - 0.02), (0, -1), (-1, 0), wR, -(wR + 0.15), "RC", inside=(1, 0))]
OPTS = (optA, optB, optC)

def ease(t): t = max(0, min(1, t)); return t * t * (3 - 2 * t)
# per option: closed 18, fold 60, slide 36, hold 36, slide out 24, unfold 36, hold 12
SEG = [12, 54, 36, 24, 24, 36, 12]
NV = 3   # each option plays its whole cycle once per camera
L = sum(SEG)
def state(f):
    c = [0]
    for s in SEG: c.append(c[-1] + s)
    if f < c[1]: return 0, 0
    if f < c[2]: return ease((f - c[1]) / SEG[1]), 0
    if f < c[3]: return 1, ease((f - c[2]) / SEG[2])
    if f < c[4]: return 1, 1
    if f < c[5]: return 1, 1 - ease((f - c[4]) / SEG[4])
    if f < c[6]: return 1 - ease((f - c[5]) / SEG[5]), 0
    return 0, 0

START = 1
sc.frame_start, sc.frame_end = START, START + 3 * NV * L - 1
for m in range(3 * NV):
    k = m // NV; bays = OPTS[k]
    o = START + m * L
    for f in range(L):
        fa, fs = state(f)
        for b in bays:
            b.pose(math.radians(90) * fa, b.smax * fs); b.key(o + f)
for k, bays in enumerate(OPTS):
    for b in bays:
        b.show(False, 0)
        if k: b.show(False, START)
        b.show(True, START + k * NV * L); b.show(False, START + (k + 1) * NV * L)
for ob in bpy.data.objects:
    if ob.animation_data and ob.animation_data.action:
        for fc in getattr(ob.animation_data.action, "fcurves", []):
            if fc.data_path == "hide_render":
                for kp in fc.keyframe_points: kp.interpolation = 'CONSTANT'

# cameras — overhead, in front of the door, and a three-quarter view into the bay
def make_cam(name, loc, tgt):
    d = bpy.data.cameras.new(name); d.lens = 19
    ob = bpy.data.objects.new(name, d); sc.collection.objects.link(ob)
    ob.location = loc
    ob.rotation_euler = (Vector(tgt) - Vector(loc)).to_track_quat('-Z', 'Y').to_euler()
    return ob
CAMS = {"top": make_cam("camTop", (1.41, 2.25, 5.3), (1.41, 0.40, 0.25)),
        "front": make_cam("camFront", (1.45, 3.35, 1.6), (1.0, 0.35, 1.0)),
        "side": make_cam("camSide", (1.8, 0.95, 2.15), (0.40, 0.45, 0.85))}
sc.camera = CAMS["top"]
cam = bpy.data.objects.new("hud", None); sc.collection.objects.link(cam); cam.scale = (0.2, 0.2, 0.2)   # caption plane 20 cm ahead, so nothing gets between
VIEWS = ["front", "side", "top"]
def cut(f, key):
    m = sc.timeline_markers.new(key + str(f), frame=f); m.camera = CAMS[key]
    cam.location = CAMS[key].location; cam.rotation_euler = CAMS[key].rotation_euler
    cam.keyframe_insert("location", frame=f); cam.keyframe_insert("rotation_euler", frame=f)
for m in range(3 * NV):
    cut(START + m * L, VIEWS[m % NV])
def all_fcurves(act):
    if hasattr(act, "layers") and len(act.layers):
        for lay in act.layers:
            for st in lay.strips:
                for cb in st.channelbags:
                    yield from cb.fcurves
    else:
        yield from getattr(act, "fcurves", [])
for fc in all_fcurves(cam.animation_data.action):
    for kp in fc.keyframe_points: kp.interpolation = 'CONSTANT'

# captions, fixed to the camera
def caption(body, x, y, size, col, parent, align='CENTER'):
    cu = bpy.data.curves.new("t", 'FONT'); cu.body = body; cu.size = size; cu.align_x = align; cu.align_y = 'CENTER'
    ob = bpy.data.objects.new("t", cu); sc.collection.objects.link(ob)
    ob.parent = parent; ob.location = (x, y, -1.0); ob.color = (*col, 1)
    return ob
DARK, WHITE, GOLD = (0.06, 0.06, 0.06), (1, 1, 1), (0.95, 0.75, 0.35)
fw = 36 / 19; fh = fw * 9 / 16
box("stripT", -fw, fh / 2 - 0.135, -1.01, fw, fh, -1.005, DARK, cam)
box("stripB", -fw, -fh, -1.01, fw, -fh / 2 + 0.105, -1.005, DARK, cam)
caption("END-BAY DOORS  ·  THREE WAYS TO OPEN", 0, fh / 2 - 0.045, 0.036, WHITE, cam)
notes = [caption("Red line = the front of the wardrobe. Nothing crosses it, so the free-standing mirror is never touched.",
        0, -fh / 2 + 0.028, 0.019, (0.85, 0.85, 0.85), cam),
         caption("The doors cross the red line only while folding — at the front end, away from the mirror — then slide inside.",
        0, -fh / 2 + 0.028, 0.019, (0.85, 0.85, 0.85), cam)]

opt_caps = [caption("OPTION A  —  the folded doors park at the MIRROR end of the bay", 0, -fh / 2 + 0.072, 0.026, WHITE, cam),
            caption("OPTION B  —  the folded doors park at the FRONT end of the bay", 0, -fh / 2 + 0.072, 0.026, WHITE, cam),
            caption("OPTION C  —  folds OUTWARD like a bifold, then slides back INTO the cupboard", 0, -fh / 2 + 0.072, 0.026, WHITE, cam)]
steps = ["1   Closed — reads as an ordinary double door",
         "2   Folds INWARD at the centre hinge — the triangle goes into the cupboard",
         "3   The folded pair pushes straight back along the side panel",
         "4   Open — the bay is clear, as if there were no door",
         "5   Pull forward, unfold, and it closes flush again"]
stepsC = ["1   Closed — reads as an ordinary double door",
          "2   Folds OUTWARD at the centre hinge — like the photo",
          "3   The folded pair slides straight back into the cupboard",
          "4   Open — the bay is clear, the doors tucked away inside",
          "5   Pull out, unfold, and it closes flush again"]
GOLDC = (0.95, 0.80, 0.45)
step_caps = [caption(t, 0, fh / 2 - 0.100, 0.024, GOLDC, cam) for t in steps]
step_capsC = [caption(t, 0, fh / 2 - 0.100, 0.024, GOLDC, cam) for t in stepsC]
c = [0]
for s in SEG: c.append(c[-1] + s)
win = [(c[0], c[1]), (c[1], c[2]), (c[2], c[3]), (c[3], c[4]), (c[4], c[7])]
def vis(ob, on_ranges):
    ob.hide_render = True; ob.keyframe_insert("hide_render", frame=0)
    for a, b in on_ranges:
        ob.hide_render = False; ob.keyframe_insert("hide_render", frame=a)
        ob.hide_render = True; ob.keyframe_insert("hide_render", frame=b)
for k in range(3):
    vis(opt_caps[k], [(START + k * NV * L, START + (k + 1) * NV * L)])
vis(notes[0], [(START, START + 2 * NV * L)]); vis(notes[1], [(START + 2 * NV * L, START + 3 * NV * L)])
segs = lambda ks: [k * NV + v for k in ks for v in range(NV)]
for i, sc_ in enumerate(step_caps):
    vis(sc_, [(START + m * L + win[i][0], START + m * L + win[i][1]) for m in segs((0, 1))])
for i, sc_ in enumerate(step_capsC):
    vis(sc_, [(START + m * L + win[i][0], START + m * L + win[i][1]) for m in segs((2,))])
view_caps = [caption(t, -fw / 2 + 0.05, fh / 2 - 0.045, 0.024, (0.95, 0.80, 0.45), cam, "LEFT")
             for t in ("VIEW 1 / 3  ·  FROM THE DOORWAY", "VIEW 2 / 3  ·  INTO THE BAY", "VIEW 3 / 3  ·  FROM ABOVE")]
for v, vc in enumerate(view_caps):
    vis(vc, [(START + m * L, START + (m + 1) * L) for m in range(3 * NV) if m % NV == v])
for ob in bpy.data.objects:
    if ob.animation_data and ob.animation_data.action:
        for fc in getattr(ob.animation_data.action, "fcurves", []):
            if fc.data_path == "hide_render":
                for kp in fc.keyframe_points: kp.interpolation = 'CONSTANT'

if STILL:
    sc.frame_set(int(STILL))
    sc.render.image_settings.file_format = 'PNG'
    sc.render.filepath = OUT
    bpy.ops.render.render(write_still=True)
else:
    try: sc.render.image_settings.media_type = 'VIDEO'
    except Exception: pass
    sc.render.image_settings.file_format = 'FFMPEG'
    sc.render.ffmpeg.format = 'MPEG4'; sc.render.ffmpeg.codec = 'H264'
    sc.render.ffmpeg.constant_rate_factor = 'MEDIUM'
    sc.render.filepath = OUT
    bpy.ops.render.render(animation=True)
