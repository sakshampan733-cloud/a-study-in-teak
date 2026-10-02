# Join the film's shots into one MP4: each shot's graded frames in order, a short dissolve between shots,
# a fade up from black at the start and down to black at the end. Blender's sequencer does the encoding.
#
#   blender -b --factory-startup --python tools/walk/cut.py -- <frames_root> <out.mp4> s01_door,s02_reveal,... [dissolve] [WxH]
import bpy, os, sys

a = sys.argv[sys.argv.index("--") + 1:]
root, out, names = a[0], a[1], a[2].split(",")
XF = int(a[3]) if len(a) > 3 else 12
W, H = (int(v) for v in (a[4] if len(a) > 4 else "1920x1080").split("x"))

sc = bpy.context.scene; sc.sequence_editor_create(); ed = sc.sequence_editor
sc.render.fps = 24; sc.render.resolution_x, sc.render.resolution_y = W, H; sc.render.resolution_percentage = 100
start, prev, ch = 1, None, 1
for i, n in enumerate(names):
    d = os.path.join(root, n)
    files = sorted(f for f in os.listdir(d) if f.lower().endswith((".png", ".jpg")))
    st = ed.strips.new_image(n, os.path.join(d, files[0]), ch, start)
    for f in files[1:]: st.elements.append(f)
    prev, ch = st, 2 if ch == 1 else 1                                    # alternate channels so each shot overlaps the last
    start = st.frame_final_end - XF
# dissolves: one cross effect wherever two shots overlap
strips = sorted([s for s in ed.strips if s.type == "IMAGE"], key=lambda s: s.frame_start)
for k, (s1, s2) in enumerate(zip(strips, strips[1:])):
    ln = int(s1.frame_final_end - s2.frame_start)
    if ln > 0: ed.strips.new_effect(f"dissolve{k}", "CROSS", 3 + k % 2, int(s2.frame_start), length=ln, input1=s1, input2=s2)
end = strips[-1].frame_final_end - 1
sc.frame_start, sc.frame_end = 1, end
# fade up from and down to black, by keying the master brightness of the whole edit through a colour strip on top
blk = ed.strips.new_effect("black", "COLOR", 6, 1, length=end); blk.color = (0, 0, 0); blk.blend_type = "ALPHA_OVER"
for fr, v in ((1, 1.0), (18, 0.0), (end - 24, 0.0), (end, 1.0)):
    blk.blend_alpha = v; blk.keyframe_insert("blend_alpha", frame=fr)
im = sc.render.image_settings; im.media_type = "VIDEO"; im.file_format = "FFMPEG"
ff = sc.render.ffmpeg; ff.format = "MPEG4"; ff.codec = "H264"; ff.constant_rate_factor = os.environ.get("CRF", "PERC_LOSSLESS"); ff.ffmpeg_preset = "GOOD"
ff.gopsize = 24; ff.audio_codec = "NONE"
sc.view_settings.view_transform = "Standard"
sc.render.filepath = out
bpy.ops.render.render(animation=True)
print("CUT", out, end, "frames", flush=True)
