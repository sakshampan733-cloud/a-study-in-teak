#!/bin/zsh
# Hero loop v3 — three generated takes (Higgsfield · Seedance 1.5) layered at three angles, so that warm and
# cool shapes of different sizes cross the frame in different directions rather than as a row of columns.
# Targets, measured off the reference's own hero (tools/node/herostats.py): brightness even top to bottom
# (27 → 20), dark behind the mark (~17) and behind the centre lines (~14), no dominant edge direction
# (h/v ≈ 0.9), near-neutral shadows (≈ 10,15,19), about two thirds of pixels below 20. 8 s, seamless.
#   usage: tools/node/hero-composite3.sh <out.mp4> [blur1 blur2 blur3]
set -e
HERE="${0:A:h}"
cd "$HERE/../../design/media/drafts"
FF="$HERE/node_modules/ffmpeg-static/ffmpeg"
OUT=${1:-ccomp.mp4}; B1=${2:-50}; B2=${3:-60}; B3=${4:-56}
T=9
CRUSH="curves=all='0/0 0.30/0.01 0.66/0.38 1/1'"          # the cool layer: shadows crushed hard
WARM="curves=all='0/0 0.22/0.01 0.6/0.5 1/1',hue=h=9:s=0.82"   # the warm layers keep more of their light
COOL="format=gbrp,geq=r='r(X,Y)*(1-0.4*clip((b(X,Y)-r(X,Y))/55,0,1))':g='g(X,Y)*(1-0.4*clip((b(X,Y)-r(X,Y))/55,0,1))':b='b(X,Y)*(1-0.4*clip((b(X,Y)-r(X,Y))/55,0,1))',format=yuv420p"
# 1 · the teak rail pass — a warm diagonal, before the lamp shade enters
$FF -loglevel error -y -t 4.1 -i close-b.mp4 -vf "crop=853:480:40:160,scale=1600:900:flags=bicubic,gblur=sigma=$B1,setpts=$T/4.1*PTS,minterpolate=fps=24:mi_mode=blend,$WARM" -t $T -an -c:v libx264 -crf 14 -pix_fmt yuv420p C1.mp4
# 2 · baluster take A turned 25°, cropped inside the turn — columns become a leaning warm/cool band
$FF -loglevel error -y -t 7.6 -i bal-a.mp4 -vf "rotate=25*PI/180:ow=iw:oh=ih:c=black,crop=640:360:320:180,scale=1600:900:flags=bicubic,gblur=sigma=$B2,setpts=$T/7.6*PTS,minterpolate=fps=24:mi_mode=blend,$CRUSH,$COOL,hue=s=0.45" -t $T -an -c:v libx264 -crf 14 -pix_fmt yuv420p C2.mp4
# 3 · baluster take B mirrored and turned −40° — warm highlights crossing the other way, half a cycle on
$FF -loglevel error -y -t 7.6 -i bal-b.mp4 -vf "hflip,rotate=-40*PI/180:ow=iw:oh=ih:c=black,crop=560:315:360:200,scale=1600:900:flags=bicubic,gblur=sigma=$B3,setpts=$T/7.6*PTS,minterpolate=fps=24:mi_mode=blend,$WARM" -t $T -an -c:v libx264 -crf 14 -pix_fmt yuv420p C3a.mp4
$FF -loglevel error -y -i C3a.mp4 -filter_complex "[0]split[a][b];[a]trim=start=4.5,setpts=PTS-STARTPTS[x];[b]trim=0:4.5,setpts=PTS-STARTPTS[y];[x][y]concat=n=2:v=1[v]" -map "[v]" -an -c:v libx264 -crf 14 -pix_fmt yuv420p C3.mp4
# composite (screen), flatten the top-to-bottom falloff, darken behind the mark and behind the centre lines,
# then one grade: near-neutral shadows, warm only in the highlights
$FF -loglevel error -y -i C1.mp4 -i C2.mp4 -i C3.mp4 -loop 1 -i pool-centre.png -loop 1 -i pool-cta.png -filter_complex "\
[0]format=gbrp[a];[1]format=gbrp[b];[2]format=gbrp[c];\
[a][b]blend=all_mode=screen:all_opacity=0.55[ab];[ab][c]blend=all_mode=screen:all_opacity=0.95[m];\
[m]geq=r='clip(r(X,Y)*(0.62+0.7*Y/H),0,255)':g='clip(g(X,Y)*(0.62+0.7*Y/H),0,255)':b='clip(b(X,Y)*(0.62+0.7*Y/H),0,255)',format=yuv420p[f];\
[f][3]overlay=0:0:shortest=1[p1];[p1][4]overlay=0:0:shortest=1,format=gbrp,curves=all='0/0 0.25/0.14 0.5/0.36 1/0.94',\
curves=r='0/0.039 0.12/0.09 0.35/0.31 0.7/0.72 1/1':g='0/0.055 0.12/0.115 0.35/0.33 0.7/0.66 1/0.93':b='0/0.07 0.12/0.135 0.35/0.35 0.7/0.62 1/0.84',format=yuv420p[v]" \
  -map "[v]" -t $T -an -c:v libx264 -crf 14 -pix_fmt yuv420p Ccomp9.mp4
$FF -loglevel error -y -i Ccomp9.mp4 -filter_complex "[0]split[a][b];[a]trim=start=1,setpts=PTS-STARTPTS[body];[b]trim=0:1,setpts=PTS-STARTPTS[head];[body][head]xfade=transition=fade:duration=1:offset=7[v]" -map "[v]" -an -c:v libx264 -preset slow -crf 18 -profile:v high -pix_fmt yuv420p -movflags +faststart "$OUT"
echo "built $OUT"
