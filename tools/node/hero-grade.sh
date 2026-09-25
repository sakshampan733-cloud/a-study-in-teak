#!/bin/zsh
# Hero loop v5 — Higgsfield takes that are defocused in camera (design/media/drafts/bok-*.mp4: a still made
# out of focus by gpt-image-2.5, animated by Seedance 1.5 with that same still as its first AND last frame, so
# each take closes on itself — no crossfade, no ping-pong). Real lens bokeh: discs with edges, hot spots,
# fringing. This grades them: a little softening so nothing reads as an object, a second take screened in
# (optionally tinted cool) to light the other side of the frame, a low glow so the dark isn't dead, shadows
# to the void, dark pools behind the mark and the centre lines, and the house split-tone.
# Both takes are the same length and slowed alike, so the composite closes on itself too.
#   usage: [CROP=w:h:x:y SLOW=1.2 BLUR=… HUE=h=…:s=… KNEE=… POOL=… L2="take|filters|opacity" GLOW=…]
#          tools/node/hero-grade.sh <take.mp4> <out.mp4>
#
# Colour: every RGB↔YUV step names BT.709 and the output is tagged BT.709, limited range. Left to itself
# ffmpeg converts with BT.601 and writes no tags, and browsers then decode HD video as BT.709 — the blacks
# came out ~7 levels short of red on the page (round-8 craft critic). Its fast path also rounds dark
# colours down by 2–3 levels at 4:2:0, hence accurate_rnd. The web encode must keep the tags:
#   noise=alls=1:allf=t, libx264 -preset slow -crf 22 -maxrate 3000k -bufsize 6000k,
#   -colorspace bt709 -color_primaries bt709 -color_trc iec61966-2-1 -color_range tv, +faststart.
# The transfer is tagged sRGB, not BT.709: the grade was judged in sRGB, and a BT.709 (or missing) transfer tag
# makes Chrome convert the curve and pull the near-blacks down — (7,14,19) in the file showed as (3,11,18).
# Installed after round 9 (v2/media/hero.mp4): bok-b.mp4 over itself — the second layer is the same take
# mirrored, started half a cycle on (bok-b-rot.mp4: trim 4 s → end, then 0 → 4 s; the take closes on
# itself, so the rotated copy does too) and tinted slate, so it lights the right of the frame:
#   CROP=1067:600:200:60 SLOW=1.5 BLUR=26 HUE="h=8:s=0.8" POOL=1 GLOW=0.3 \
#   KNEE="0/0 0.27/0.015 0.64/0.27 0.92/0.66 1/0.9" \
#   L2="bok-b-rot.mp4|hflip,crop=1067:600:0:60,colorchannelmixer=rr=0.75:rg=0.05:gg=0.88:gb=0.05:bb=1.0:bg=0.08|0.85" \
#   TONER="0/0.035 0.12/0.075 0.25/0.18 0.4/0.36 0.7/0.8 1/1" TONEG="0/0.055 0.12/0.1 0.25/0.21 0.4/0.37 0.7/0.67 1/0.95" \
#   TONEB="0/0.075 0.12/0.13 0.25/0.26 0.4/0.4 0.7/0.56 1/0.86" tools/node/hero-grade.sh bok-b.mp4 bgrade21.mp4
set -e
HERE="${0:A:h}"
cd "$HERE/../../design/media/drafts"
FF="$HERE/node_modules/ffmpeg-static/ffmpeg"
IN=$1; OUT=$2
BLUR=${BLUR:-9}
KNEE=${KNEE:-"0/0 0.2/0.01 0.55/0.3 0.85/0.72 1/0.95"}
POOL=${POOL:-0.8}
GLOW=${GLOW:-0}
TONER=${TONER:-"0/0.035 0.12/0.085 0.35/0.32 0.7/0.74 1/1"}
TONEG=${TONEG:-"0/0.055 0.12/0.105 0.35/0.33 0.7/0.68 1/0.96"}
TONEB=${TONEB:-"0/0.075 0.12/0.125 0.35/0.34 0.7/0.64 1/0.92"}
TORGB="scale=in_color_matrix=bt709:in_range=tv:flags=accurate_rnd+full_chroma_int+full_chroma_inp,format=gbrp"
TOYUV="scale=out_color_matrix=bt709:out_range=tv:flags=accurate_rnd+full_chroma_int+full_chroma_inp,format=yuv420p"
PRE="${SLOW:+setpts=$SLOW*PTS,minterpolate=fps=24:mi_mode=blend,}scale=1600:900:flags=bicubic,gblur=sigma=$BLUR"
if [[ -n $L2 ]]; then
  T2=${L2%%|*}; R2=${L2#*|}; F2=${R2%%|*}; O2=${R2#*|}
  IN2=(-i $T2); P=2
  MIX="[1]${F2:+${F2},}${PRE},${TORGB}[l2];[a][l2]blend=all_mode=screen:all_opacity=${O2}[ab];"
else IN2=(); P=1; MIX="[a]null[ab];"; fi
$FF -loglevel error -y -i $IN $IN2 -loop 1 -i pool-centre.png -loop 1 -i pool-cta.png -filter_complex "\
[0]${CROP:+crop=$CROP,}${PRE}${HUE:+,hue=$HUE},${TORGB}[a];${MIX}\
[ab]split[s][g];[g]scale=400:225,gblur=sigma=40,scale=1600:900[gl];[s][gl]blend=all_mode=screen:all_opacity=${GLOW},curves=all='${KNEE}',${TOYUV}[m];\
[$P]format=rgba,colorchannelmixer=aa=${POOL}[pc];[$((P+1))]format=rgba,colorchannelmixer=aa=${POOL}[pt];\
[m][pc]overlay=0:0:shortest=1[p1];[p1][pt]overlay=0:0:shortest=1,${TORGB},\
curves=r='${TONER}':g='${TONEG}':b='${TONEB}',${TOYUV}[v]" \
  -map "[v]" -an -c:v libx264 -preset slow -crf 18 -profile:v high -pix_fmt yuv420p \
  -colorspace bt709 -color_primaries bt709 -color_trc iec61966-2-1 -color_range tv -movflags +faststart $OUT
echo "built $OUT"
