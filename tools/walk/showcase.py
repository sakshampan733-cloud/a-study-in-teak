# Two pieces on their own (owner, 23 Oct): a film of the desk and a film of the bed, each alone in the room — no other
# furniture, the bed with no bedding and no mattress — slow, close shots that show the mouldings; and stills of the bare bed.
# Run by real.py in its namespace, so the room, materials, light and render settings are the walk-through film's own:
#
#   DEVICES=gpu blender -b --python tools/walk/real.py -- build/showcase showcase [samples]
#     PREVIEW=1    first and last frame of each shot only, and the stills at low samples — to check the framing
#     WHAT=desk|bed|stills   (comma list) to do part of it; SHOTS=d01_reveal,bed_side,… to do only those
#     EXPOSURE=-1.8 FMT=JPEG     as the room film was rendered (1920 × 1080, 48 samples)
#
# Frames go to <out>/<subject>/<shot>/f####.png; tools/walk/post.py grades them, tools/walk/cut.py joins them.
import bpy, math, os
from mathutils import Vector

exec(compile(open(os.path.join(HERE, "film.py")).read(), "film.py", "exec"))        # film_shot and the hand-held float
BASE = OUTR
WHAT = os.environ.get("WHAT", "desk,bed,stills").split(",")

# ── what goes: every loose piece of furniture, its dressing, and the bedding ──
FURN = ("bed_", "headboard", "mattress", "duvet", "sheet_fold", "throw", "pillow", "cushion", "st0_", "st1_", "deskchair", "gb_",
        "hide", "lamp_", "monitor_", "blotter", "book0", "book1", "book2", "vase", "dk2_")
KEEP = {"desk": ("dk2_",), "bed": ("bed_", "headboard")}                # the bed: no mattress either (owner, 23 Oct)
PRIM = ("Cylinder", "Sphere", "Torus", "Cone", "Cube", "Circle")

def bbox(o):
    cs = [o.matrix_world @ Vector(c) for c in o.bound_box]
    return [min(c[i] for c in cs) for i in range(3)], [max(c[i] for c in cs) for i in range(3)]
def inside(p, box, pad):
    lo, hi = box; return all(lo[i] - pad <= p[i] <= hi[i] + pad for i in range(3))
def isolate(subject):
    """Hide all the furniture but the subject; unnamed primitives and lamps go with whatever piece they sit in."""
    keep = KEEP[subject]
    gone = [o for o in sc.objects if o.type in ("MESH", "CURVE") and o.name.startswith(FURN) and not o.name.startswith(keep)]
    kept = [o for o in sc.objects if o.type in ("MESH", "CURVE") and o.name.startswith(keep)]
    gbox, kbox = [bbox(o) for o in gone], [bbox(o) for o in kept]
    for o in sc.objects:
        if o.type not in ("MESH", "CURVE", "LIGHT"): continue
        hide = False
        if o.type in ("MESH", "CURVE"):
            if o.name.startswith(FURN): hide = not o.name.startswith(keep)
            elif o.name.startswith(PRIM):
                c = o.matrix_world.translation
                hide = any(inside(c, b, .03) for b in gbox) and not any(inside(c, b, .01) for b in kbox)
            else: continue
        else:
            hide = any(inside(o.matrix_world.translation, b, .15) for b in gbox)
        o.hide_render = hide; o.hide_viewport = hide
    print("ISOLATE", subject, "hidden", sum(1 for o in sc.objects if o.hide_render), flush=True)

# ── the shots: name, frames, (camera from, looking at), (camera to, looking at), lens, f-stop, extras ──
# desk: x 1194–3480, s 1529–2316 since 23 Oct (2 ft 7 in deep, its back still 2 in off the glass; the drawer fronts face
# the study wall), top 710–750; pedestals x 1194–1814 and 2860–3480; the four corners hollowed R150, top to plinth
DESK = [
    ("d01_reveal", 132, ((4380, 820, 1500), (2337, 1800, 520)), ((4200, 1150, 1380), (2337, 1800, 520)), 20, 5.6, {"tilt": True}),
    ("d02_drawers", 132, ((1350, 700, 820), (1700, 1620, 380)), ((3300, 700, 820), (2950, 1620, 380)), 24, 4.0, {"tilt": True}),
    ("d03_corner", 132, ((690, 1010, 260), (1250, 1580, 200)), ((690, 1010, 880), (1250, 1580, 640)), 30, 4.0, {"tilt": True}),
    ("d04_frieze", 132, ((1850, 1000, 900), (2000, 1529, 640)), ((2750, 1000, 900), (2900, 1529, 640)), 35, 4.0, {"tilt": True}),
    # the back, panelled like the ends, from the bed's side (the glass-block partition is hidden with the furniture)
    ("d05_back", 132, ((1500, 3450, 950), (1750, 2316, 400)), ((3150, 3450, 950), (2900, 2316, 400)), 24, 5.6, {"tilt": True}),
    ("d07_wide", 132, ((900, 720, 1450), (2337, 1850, 450)), ((720, 640, 1650), (2337, 1850, 450)), 22, 5.6, {"tilt": True}),
]
# bed: base x 1373–3302, s 3613–5645, 280 high, gloss black, the foot corners rounded, no mattress; a 1 in rim round four
# lids (top at 255) hinged on the spine at x 2337, the cross rail at s 4646; the headboard 1405–3270
# at s 5645, to 984, in a thin black frame, the suede only above the base; the niche behind, 915–3760
BED = [
    ("b01_reveal", 120, ((2337, 2300, 1700), (2337, 4900, 380)), ((2337, 2620, 1560), (2337, 4900, 380)), 24, 5.6, {"tilt": True}),
    ("b02_corner", 120, ((3820, 3150, 460), (3260, 3660, 180)), ((3780, 3980, 430), (3260, 3700, 180)), 35, 2.8, {"tilt": True}),
    ("b03_side", 132, ((3880, 3700, 380), (3302, 4000, 160)), ((3880, 4900, 380), (3302, 5200, 160)), 28, 4.0, {"tilt": True}),
    # the storage (owner, 23 Oct): the four lids lift one after another on their gas struts, seen from over the foot;
    # then close on one strut with its lid up
    ("b07_storage", 168, ((2337, 2450, 1900), (2337, 4650, 230)), ((2337, 2800, 1750), (2337, 4650, 230)), 24, 5.6, {"tilt": True, "ev": 0.3}),
    ("b08_strut", 120, ((3000, 3250, 750), (2420, 3720, 260)), ((2950, 3420, 700), (2420, 3720, 260)), 32, 4.0, {"tilt": True, "ev": 0.6}),
    ("b04_headboard", 120, ((2600, 3950, 750), (2337, 5650, 700)), ((2450, 4150, 1150), (2337, 5650, 700)), 28, 5.6, {"tilt": True}),
    ("b05_hcorner", 120, ((3720, 5080, 1180), (3285, 5660, 960)), ((3560, 5300, 1120), (3285, 5660, 960)), 50, 2.8, {"tilt": True}),
    ("b06_wide", 132, ((850, 3300, 1400), (2337, 4900, 420)), ((650, 2950, 1550), (2337, 4900, 420)), 22, 5.6, {"tilt": True}),
]
# stills of the bare bed: name, camera, looking at, lens, f-stop
STILLS = [
    ("bed_three", (3950, 3050, 1350), (2337, 4950, 400), 24, 8.0),
    ("bed_foot", (2337, 2350, 1350), (2337, 4800, 430), 24, 8.0),
    ("bed_side", (4450, 4650, 600), (2337, 4650, 380), 18, 8.0),
    ("bed_head", (3500, 4250, 1150), (2337, 5650, 700), 28, 6.3),
    ("bed_corner", (3950, 3000, 700), (3150, 3800, 240), 35, 5.6),
    ("bed_storage", (3950, 3050, 1650), (2337, 4650, 250), 24, 8.0),
]

# the lids: shut, all open, or opening one after another — (start, end) frames for each, in BED_LIDS order
# (left foot, left head, right foot, right head; bedwall.py); 80° open, eased in and out like a gas strut
LID_OPEN = math.radians(80)
LIDS = {"b07_storage": [(20, 64), (70, 114), (45, 89), (95, 139)], "b08_strut": "open", "bed_storage": "open"}
def lids(state=None):
    for i, (hg, sgn) in enumerate(globals().get("BED_LIDS", [])):
        hg.animation_data_clear(); hg.rotation_euler = (0, 0, 0)
        if state == "open": hg.rotation_euler[1] = -sgn * LID_OPEN
        elif state:
            f0, f1 = state[i]
            hg.keyframe_insert("rotation_euler", index=1, frame=f0)
            hg.rotation_euler[1] = -sgn * LID_OPEN; hg.keyframe_insert("rotation_euler", index=1, frame=f1)
    bpy.context.view_layer.update()

def render_setup():
    bake_modifiers()
    sc.render.use_persistent_data = True; sc.render.use_motion_blur = False; sc.render.fps = 24
    sc.render.resolution_x, sc.render.resolution_y = int(os.environ.get("RX", 1920)), int(os.environ.get("RY", 1080))
    ims = sc.render.image_settings; ims.color_mode = "RGB"
    if os.environ.get("FMT", "PNG") == "JPEG": ims.file_format = "JPEG"; ims.quality = 95
    else: ims.file_format = "PNG"; ims.color_depth = "8"
    sc.render.use_overwrite = False; sc.render.use_placeholder = True                # resumable
    cy.samples = SPP; cy.adaptive_threshold = float(os.environ.get("ATHRESH", 0.02))

def still(name, cp, tp, lens, fstop):
    for o in [o for o in sc.objects if o.name.startswith(("sc_cam", "sc_look"))]: bpy.data.objects.remove(o, do_unlink=True)
    c = cam("sc_cam", lens); t = bpy.data.objects.new("sc_look", None); sc.collection.objects.link(t)
    c.location = P(*cp); t.location = P(*tp)
    k = c.constraints.new("TRACK_TO"); k.target = t; k.track_axis = "TRACK_NEGATIVE_Z"; k.up_axis = "UP_Y"
    c.data.dof.use_dof = True; c.data.dof.focus_object = t; c.data.dof.aperture_fstop = fstop
    sc.camera = c
    keep = (sc.render.resolution_x, sc.render.resolution_y, cy.samples, sc.render.use_overwrite)
    sc.render.resolution_x, sc.render.resolution_y = int(os.environ.get("SX", 2560)), int(os.environ.get("SY", 1440))
    cy.samples = 24 if PREVIEW else int(os.environ.get("SSPP", 256)); sc.render.use_overwrite = True
    ims = sc.render.image_settings; fmt = ims.file_format; ims.file_format = "PNG"; ims.color_depth = "8"
    sc.render.filepath = os.path.join(BASE, "stills", name + ".png"); bpy.ops.render.render(write_still=True)
    ims.file_format = fmt
    sc.render.resolution_x, sc.render.resolution_y, cy.samples, sc.render.use_overwrite = keep
    print("STILL", name, flush=True)

want = os.environ.get("SHOTS")                                         # a comma list of shot and still names, to redo a few
pick = lambda n: not want or n in want.split(",")
render_setup()
EV0 = sc.view_settings.exposure
if "desk" in WHAT:
    isolate("desk"); OUTR = os.path.join(BASE, "desk")
    for sh in DESK:
        if pick(sh[0]): film_shot(sh)
if "bed" in WHAT or "stills" in WHAT:
    isolate("bed")
    if "bed" in WHAT:
        OUTR = os.path.join(BASE, "bed")
        for sh in BED:
            if pick(sh[0]): lids(LIDS.get(sh[0])); film_shot(sh)
    if "stills" in WHAT:
        sc.view_settings.exposure = EV0
        for st in STILLS:
            if pick(st[0]): sc.frame_set(1); lids(LIDS.get(st[0])); still(*st)
OUTR = BASE
