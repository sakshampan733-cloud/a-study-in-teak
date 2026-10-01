# Stage 5 of the walkthrough: the film (1 Oct). Not a scroll any more but a short film of slow, composed shots,
# the way interiors are filmed: a camera on a slider or a gimbal, moving a metre or two in five or six seconds,
# a real lens, depth of field, motion blur, a slight float in the hand. Run by real.py in its namespace:
#
#   blender -b --python tools/walk/real.py -- build/film film [samples]       (SHOTS=s01_door,s02_reveal to pick)
#
# Each shot renders to <out>/<shot>/f####.png; tools/walk/post.py adds grain and vignette, tools/walk/cut.py joins them.
import bpy, math, os
from mathutils import Vector

# name, frames, (camera from, looking at), (camera to, looking at), lens mm, f-stop, {extras}
#   extras: open = doors open throughout; swing = (door, from frame, to frame); ev = exposure lift
SHOTS = [
    ("s01_door", 150, ((-2650, 5258, 1500), (-177, 5258, 1250)), ((-1750, 5258, 1500), (60, 5258, 1250)), 28, 5.6,
        {"swing": ("door_d1", 34, 118)}),
    ("s02_reveal", 144, ((300, 5300, 1450), (2700, 2650, 1100)), ((750, 4850, 1450), (2950, 2350, 1150)), 22, 5.6, {}),
    # the partition divides the room (1 Oct): its TV side from above the foot of the bed, sliding across it
    ("s03_partition", 132, ((1650, 4250, 1350), (1900, 2413, 1050)), ((3000, 4250, 1350), (2750, 2413, 1050)), 24, 4.0, {}),
    # the study wall on the diagonal, from the window end, past the partition's end
    ("s04_study", 132, ((4150, 2650, 1550), (1500, 250, 1350)), ((4000, 2050, 1550), (1300, 250, 1350)), 22, 5.6, {}),
    # down the length of the desk toward the banker's lamp, books close by
    ("s05_desk", 132, ((3980, 1720, 1180), (1434, 1782, 930)), ((3760, 1700, 1150), (1434, 1782, 920)), 35, 2.8, {}),
    ("s05b_sconces", 144, ((3300, 3000, 1500), (4547, 3600, 1350)), ((3300, 4300, 1500), (4547, 4800, 1350)), 26, 5.6, {}),
    ("s06_bed", 150, ((3750, 3300, 1350), (2200, 5500, 760)), ((2900, 2950, 1300), (2337, 5550, 760)), 30, 4.0, {}),
    ("s07_d2", 144, ((3350, 4650, 1500), (5400, 4650, 1400)), ((4150, 4650, 1500), (6400, 4600, 1450)), 24, 5.6,
        {"swing": ("door_d2", 18, 96), "ev": 0.6}),
    ("s08_dress", 144, ((5050, 4356, 1450), (8400, 4356, 1450)), ((6300, 4356, 1450), (8400, 4356, 1650)), 22, 5.6,
        {"open": ("door_d2",), "ev": 1.3}),
    ("s09_vault", 132, ((5700, 4356, 1400), (7700, 4356, 1900)), ((6000, 4356, 1400), (7700, 4356, 3050)), 20, 5.6,
        {"open": ("door_d2",), "ev": 1.3, "tilt": True}),
    ("s10_vanity", 132, ((6100, 1000, 1350), (6403, 2718, 1000)), ((6250, 1350, 1330), (6403, 2718, 990)), 26, 4.0,
        {"open": ("door_d2", "door_d3"), "ev": 0.7}),
]
FLOAT = float(os.environ.get("FLOAT", 1.0))
PREVIEW = os.environ.get("PREVIEW") == "1"                     # how much the camera floats in the hand (1 = a gimbal)

def fcurves_of(ob):
    """An object's F-curves (Blender 5 keeps them in the action's channel bag for the object's slot)."""
    ad = ob.animation_data; act = ad.action
    if hasattr(act, "fcurves"): return list(act.fcurves)
    from bpy_extras import anim_utils
    cb = anim_utils.action_get_channelbag_for_slot(act, ad.action_slot)
    return list(cb.fcurves) if cb else []

def film_shot(sh):
    name, n, (c0, t0), (c1, t1), lens, fstop, ex = sh
    for o in [o for o in sc.objects if o.name.startswith(("film_cam", "film_look"))]: bpy.data.objects.remove(o, do_unlink=True)
    c = cam("film_cam", lens); t = bpy.data.objects.new("film_look", None); sc.collection.objects.link(t)
    c.data.dof.use_dof = True; c.data.dof.focus_object = t; c.data.dof.aperture_fstop = fstop
    k = c.constraints.new("TRACK_TO"); k.target = t; k.track_axis = "TRACK_NEGATIVE_Z"; k.up_axis = "UP_Y"
    tilt = ex.get("tilt", False)              # most shots keep the camera level and frame by lens shift, so walls stay upright
    for fr, cp, tp in ((1, c0, t0), (n, c1, t1)):
        c.location = P(*cp); t.location = P(tp[0], tp[1], tp[2] if tilt else cp[2])
        c.keyframe_insert("location", frame=fr); t.keyframe_insert("location", frame=fr)
    if not tilt:
        sh_ = [lens * (tp[2] - cp[2]) / math.hypot(tp[0] - cp[0], tp[1] - cp[1]) / c.data.sensor_width for cp, tp in ((c0, t0), (c1, t1))]
        c.data.shift_y = sh_[0]; c.data.keyframe_insert("shift_y", frame=1); c.data.shift_y = sh_[1]; c.data.keyframe_insert("shift_y", frame=n)
    # the hand: a slow, small wander on where the camera stands and where it looks
    for ob, amp, scale in ((c, 0.004, 110), (t, 0.010, 80)):
        if not ob.animation_data or not ob.animation_data.action: continue
        for fc in fcurves_of(ob):
            m = fc.modifiers.new("NOISE"); m.strength = amp * FLOAT; m.scale = scale; m.phase = hash((name, fc.array_index)) % 97
    # doors: shut unless the shot says otherwise
    for d in ("door_d1", "door_d2", "door_d3"):
        o = sc.objects[d]
        if o.animation_data: o.animation_data_clear()
        o.rotation_euler.z = o["open"] if d in ex.get("open", ()) else 0.0
    if "swing" in ex:
        d, a, b = ex["swing"]; o = sc.objects[d]
        o.rotation_euler.z = 0; o.keyframe_insert("rotation_euler", index=2, frame=1); o.keyframe_insert("rotation_euler", index=2, frame=a)
        o.rotation_euler.z = o["open"]; o.keyframe_insert("rotation_euler", index=2, frame=b)
    sc.view_settings.exposure = EV0 + ex.get("ev", 0.0)
    sc.camera = c; sc.frame_start, sc.frame_end = 1, n
    sc.render.filepath = os.path.join(OUTR, name, "f")
    print("SHOT", name, n, "frames", flush=True)
    if PREVIEW:                                                           # first and last frame only, to check the framing
        for fr in (1, n):
            sc.frame_set(fr); sc.render.filepath = os.path.join(OUTR, "preview", f"{name}_{fr:03d}.png")
            bpy.ops.render.render(write_still=True)
        return
    bpy.ops.render.render(animation=True)

if MODER == "film":
    bake_modifiers()
    sc.render.use_persistent_data = True
    sc.render.use_motion_blur = os.environ.get("MBLUR") == "1"; sc.render.motion_blur_shutter = 0.5   # slow moves: blur is invisible, and costly
    sc.render.fps = 24
    sc.render.resolution_x, sc.render.resolution_y = int(os.environ.get("RX", 1920)), int(os.environ.get("RY", 1080))
    ims = sc.render.image_settings; ims.file_format = "PNG"; ims.color_mode = "RGB"; ims.color_depth = "8"
    sc.render.use_overwrite = False; sc.render.use_placeholder = True                # resumable
    cy.samples = SPP; cy.adaptive_threshold = float(os.environ.get("ATHRESH", 0.02))
    EV0 = sc.view_settings.exposure
    want = os.environ.get("SHOTS")
    for sh in SHOTS:
        if not want or sh[0] in want.split(","): film_shot(sh)
