#!/bin/zsh
# Hero loop v2 — built from two baluster takes (Higgsfield · Seedance 1.5, design/media/drafts/bal-a/b.mp4):
# a lens sliding past turned teak balusters and brass rods. Defocused, a row of verticals becomes what the
# reference's hero is made of: several separate warm columns, cool light between them, small bright
# highlights, moving in layers. 8 s, seamless, with a dark pool behind the hero's centre lines.
#   usage: tools/node/hero-composite2.sh <out.mp4> [nearBlur farBlur farOpacity crushKnee]
set -e
HERE="${0:A:h}"
cd "$HERE/../../design/media/drafts"
FF="$HERE/node_modules/ffmpeg-static/ffmpeg"
OUT=${1:-bcomp.mp4}; NB=${2:-44}; FB=${3:-52}; FO=${4:-0.6}; K=${5:-0.18}
T=9
CRUSH="curves=all='0/0 $K/0.01 0.62/0.47 1/1'"
# near: take A at 1.6x, the band below the handrail (so no rail line reads), slowed to fill 9 s; blue-leaning
# pixels (the window) are dimmed so the cool light stays a quiet slate and the warm columns lead, as in the reference
$FF -loglevel error -y -t 7.6 -i bal-a.mp4 -vf "crop=800:450:120:250,scale=1600:900:flags=bicubic,gblur=sigma=$NB,setpts=$T/7.6*PTS,minterpolate=fps=24:mi_mode=blend,$CRUSH,format=gbrp,geq=r='r(X,Y)*(1-0.40*clip((b(X,Y)-r(X,Y))/55,0,1))':g='g(X,Y)*(1-0.40*clip((b(X,Y)-r(X,Y))/55,0,1))':b='b(X,Y)*(1-0.40*clip((b(X,Y)-r(X,Y))/55,0,1))',format=yuv420p" -t $T -an -c:v libx264 -crf 14 -pix_fmt yuv420p Bnear.mp4
# far: take B at 1.5x, mirrored so its columns travel the other way, larger and softer — the warm highlights
$FF -loglevel error -y -t 7.6 -i bal-b.mp4 -vf "hflip,crop=560:315:720:120,scale=1600:900:flags=bicubic,gblur=sigma=$FB,setpts=$T/7.6*PTS,minterpolate=fps=24:mi_mode=blend,$CRUSH,eq=brightness=-0.02" -t $T -an -c:v libx264 -crf 14 -pix_fmt yuv420p Bfar.mp4
$FF -loglevel error -y -i Bnear.mp4 -i Bfar.mp4 -loop 1 -i pool.png -loop 1 -i pool-centre.png -filter_complex "\
[0]format=gbrp[n];[1]format=gbrp[f];[n][f]blend=all_mode=screen:all_opacity=${FO}[m];\
[m]format=yuv420p,eq=saturation=0.78,colorbalance=rm=0.02:bm=0.03:rh=0.03:gh=0.02[mm];[mm][2]overlay=0:0:shortest=1[p1];[p1][3]overlay=0:0:shortest=1,format=gbrp,curves=r='0/0.043 0.35/0.40 1/1':g='0/0.047 0.35/0.33 1/0.9':b='0/0.063 0.35/0.30 1/0.8',format=yuv420p[v]" -map "[v]" -t $T -an -c:v libx264 -crf 14 -pix_fmt yuv420p Bcomp9.mp4
$FF -loglevel error -y -i Bcomp9.mp4 -filter_complex "[0]split[a][b];[a]trim=start=1,setpts=PTS-STARTPTS[body];[b]trim=0:1,setpts=PTS-STARTPTS[head];[body][head]xfade=transition=fade:duration=1:offset=7[v]" -map "[v]" -an -c:v libx264 -preset slow -crf 20 -profile:v high -pix_fmt yuv420p -movflags +faststart "$OUT"
echo "built $OUT"
