#!/bin/zsh
# The hero loop, composited from generated footage (Higgsfield · Seedance 1.5) in design/media/drafts.
# Target, from the reference's own hero: mostly dark (about two thirds of pixels below 20), several separate
# defocused warm and cool shapes rather than one band, small highlights reaching ~150–190, motion in layers,
# and the bottom-centre (behind the hero's centre lines) kept dark. 8 s, seamless.
#   usage: tools/node/hero-composite.sh <out.mp4> [warmBlur farBlur glintBlur crush]
set -e
HERE="${0:A:h}"
cd "$HERE/../../design/media/drafts"
FF="$HERE/node_modules/ffmpeg-static/ffmpeg"
OUT=${1:-comp.mp4}; WB=${2:-30}; FB=${3:-44}; GB=${4:-12}; K=${5:-0.24}
T=9
CRUSH="curves=all='0/0 $K/0.01 0.62/0.46 1/1'"          # shadows to black; the shapes and the blue glow survive
RAIL="-t 4.1 -i close-b.mp4"                           # the teak-rail pass, stopped before the lamp shade enters (~4.2 s)
# near layer: the rail at 1.5x, lightly defocused — the main warm shape plus the cool glow behind it
$FF -loglevel error -y $=RAIL -vf "crop=853:480:40:160,scale=1600:900:flags=bicubic,gblur=sigma=$WB,setpts=$T/4.1*PTS,minterpolate=fps=24:mi_mode=blend,$CRUSH" -t $T -an -c:v libx264 -crf 14 -pix_fmt yuv420p Lnear.mp4
# far layer: the cool glow and soft lights along the top of the round-table take — blue-grey shapes at another
# depth (not a mirror of the near layer: that crossed into an X and read as a lens flare)
$FF -loglevel error -y -i close-a.mp4 -vf "crop=288:162:420:0,scale=1600:900:flags=bicubic,gblur=sigma=$FB,setpts=$T/8*PTS,minterpolate=fps=24:mi_mode=blend,$CRUSH,hue=s=0.55,eq=brightness=-0.02" -t $T -an -c:v libx264 -crf 14 -pix_fmt yuv420p Lfar.mp4
# (a third "glint" layer of brass studs was tried and dropped: however soft, a stud head read as a small vase)
# composite in RGB (screen), lift the rail's own speculars for the highlights, then lay the dark pool over the
# bottom centre
$FF -loglevel error -y -i Lnear.mp4 -i Lfar.mp4 -loop 1 -i pool.png -filter_complex "\
[0]format=gbrp,curves=all='0/0 0.35/0.40 0.7/0.93 1/1'[n];[1]format=gbrp[f];\
[n][f]blend=all_mode=screen:all_opacity=0.9[m];\
[m]format=yuv420p,eq=saturation=0.72,colorbalance=rm=0.02:gm=0.01:bm=0.03:rh=0.03:gh=0.02[mm];[mm][2]overlay=0:0:shortest=1[v]" -map "[v]" -t $T -an -c:v libx264 -crf 14 -pix_fmt yuv420p Lcomp9.mp4
# seamless: drop the first second and crossfade it back in over the tail
$FF -loglevel error -y -i Lcomp9.mp4 -filter_complex "[0]split[a][b];[a]trim=start=1,setpts=PTS-STARTPTS[body];[b]trim=0:1,setpts=PTS-STARTPTS[head];[body][head]xfade=transition=fade:duration=1:offset=7[v]" -map "[v]" -an -c:v libx264 -preset slow -crf 20 -profile:v high -pix_fmt yuv420p -movflags +faststart "$OUT"
echo "built $OUT"
