#!/bin/zsh
# Hero loop v4 — crops of two glassware takes (Higgsfield · Seedance 1.5, design/media/drafts/glass-a/b.mp4):
# crystal, an amber decanter, a lamp and brass on a teak desk, with a window behind. Thrown out of focus, each
# rim and reflection becomes a separate soft shape, and the dolly carries them across the whole frame — behind
# the lockup and the centre lines as well as at the edges. A colour map then makes the brighter shapes copper
# and cream over slate haze, the way the reference's are, whatever colour the takes were shot in.
# Round-4 targets (tools/node/herostats.py, the reference's own hero): 4–6 shapes a frame, ~11% of the frame
# lit, highlights warm by ~38 (red − blue), light centred 0.3–0.7 across, motion ~13; plus the old ones
# (two thirds of pixels below 20, mean ~24, dark behind mark ~17 and CTA ~14, near-neutral shadows).
#   usage: [PP=… LA=… LB=… LC=… LD=… OD=… GM=… POOL=… KNEE=… TONE*=…] tools/node/hero-composite4.sh <out.mp4> [blur opacityB opacityC]
#   a layer is "take|start|seconds|filters before scaling (crop, hflip, reverse)[|blur]"; LC="" leaves it out
#
# The installed loop (v2/media/hero.mp4, after round 6) is v4c, from two abstract takes (design/media/drafts/
# abs-a/b.mp4: macro copper liquid metal, and a chrome-and-copper streak), no colour map, and a true cycle:
#   GM=0 POOL=0.3 PP=4.5 OD=0.38 \
#   KNEE="curves=all='0/0 0.14/0.01 0.52/0.43 0.78/0.94 1/1'" \
#   TONER="0/0.035 0.12/0.085 0.35/0.32 0.7/0.74 1/1" TONEG="0/0.055 0.12/0.105 0.35/0.33 0.7/0.68 1/0.96" \
#   TONEB="0/0.075 0.12/0.125 0.35/0.34 0.7/0.64 1/0.92" LC="" \
#   LA="abs-b.mp4|3.4|4.5|crop=1100:619:0:40|56" \
#   LB="abs-a.mp4|2|4.5|hflip,rotate=-30*PI/180:ow=iw:oh=ih:c=black,crop=960:540:160:90,$COOL|46" \
#   LD="abs-a.mp4|3.5|4.5|vflip,rotate=35*PI/180:ow=iw:oh=ih:c=black,crop=960:540:160:90,$COOL|60" \
#   tools/node/hero-composite4.sh acomp13.mp4 30 0.6
#   with COOL="colorbalance=rs=-0.1:bs=0.1:rm=-0.08:bm=0.1:rh=-0.06:bh=0.06"
# then for the web: noise=alls=1:allf=t, libx264 -preset slow -crf 22 -maxrate 3000k -bufsize 6000k, +faststart.
set -e
HERE="${0:A:h}"
cd "$HERE/../../design/media/drafts"
FF="$HERE/node_modules/ffmpeg-static/ffmpeg"
OUT=${1:-gcomp.mp4}; BL=${2:-26}; OB=${3:-0.5}; OC=${4:-0.4}; OD=${OD:-0.4}
# PP=<seconds>: a true cycle instead of a crossfade — each layer plays forward over PP seconds with its speed
# eased to rest at both ends (s = d·(1 − cos πt/PP)/2), then the whole thing plays back, so the last frame is
# the first and the turn is a slow sway rather than a jump. Without PP: 9 s forward, 1 s crossfade seam.
PP=${PP:-}
T=${PP:-9}
LA=${LA-"glass-a.mp4|0|8|crop=800:450:160:40"}
# B · take B mirrored, the band of table reflections under the row of glasses: lit the whole way through,
# travelling the other way from A
LB=${LB-"glass-b.mp4|0|8|hflip,crop=560:315:320:330|40"}   # blurred harder: its glasses' reflections are a row
LC=${LC-""}
LD=${LD-""}
GM=${GM:-0.75}
POOL=${POOL:-1}                # strength of the dark pools behind the mark and the centre lines
MAPR=${MAPR:-"0/0.04 0.25/0.11 0.4/0.25 0.55/0.46 0.7/0.72 0.88/0.88 1/0.97"}
MAPG=${MAPG:-"0/0.055 0.25/0.14 0.4/0.29 0.55/0.38 0.7/0.5 0.88/0.72 1/0.92"}
MAPB=${MAPB:-"0/0.07 0.25/0.19 0.4/0.36 0.55/0.38 0.7/0.38 0.88/0.6 1/0.85"}
TONER=${TONER:-"0/0.039 0.12/0.09 0.35/0.33 0.7/0.76 1/1"}     # the final split-tone
TONEG=${TONEG:-"0/0.055 0.12/0.115 0.35/0.33 0.7/0.64 1/0.9"}
TONEB=${TONEB:-"0/0.07 0.12/0.135 0.35/0.33 0.7/0.56 1/0.78"}
KNEE=${KNEE:-"curves=all='0/0 0.24/0.01 0.56/0.46 0.8/0.9 1/1'"}   # shadows to black so only the lights remain
layer() {   # layer <spec> <out>
  local take=${1%%|*} rest=${1#*|}; local ss=${rest%%|*}; rest=${rest#*|}; local dur=${rest%%|*}; rest=${rest#*|}
  local pre=${rest%%|*} bl=$BL; [[ $rest == *"|"* ]] && bl=${rest#*|}
  local pts="$T/$dur*PTS"; [[ -n $PP ]] && pts="($T*acos(1-2*(PTS*TB)/$dur)/PI)/TB"
  $FF -loglevel error -y -ss $ss -t $dur -i $take -vf "$pre,scale=1600:900:flags=bicubic,gblur=sigma=$bl,setpts='$pts',minterpolate=fps=24:mi_mode=blend,$KNEE" -t $T -an -c:v libx264 -crf 14 -pix_fmt yuv420p $2
}
layer "$LA" GA.mp4; layer "$LB" GB.mp4
IN3=(); MIX="[ab]null[abc]"; P=2
if [[ -n $LC ]]; then layer "$LC" GC.mp4; IN3+=(-i GC.mp4); MIX="[ab][2]blend=all_mode=screen:all_opacity=${OC}[abc]"; P=3; fi
if [[ -n $LD ]]; then layer "$LD" GD.mp4; IN3+=(-i GD.mp4)
  if [[ -n $LC ]]; then MIX="[ab][2]blend=all_mode=screen:all_opacity=${OC}[ab2];[ab2][3]blend=all_mode=screen:all_opacity=${OD}[abc]"; P=4
  else MIX="[ab][2]blend=all_mode=screen:all_opacity=${OD}[abc]"; P=3; fi
fi
# composite (screen), colour map, dim behind the mark and the centre lines, then one grade: near-neutral shadows
$FF -loglevel error -y -i GA.mp4 -i GB.mp4 $IN3 -loop 1 -i pool-centre.png -loop 1 -i pool-cta.png -filter_complex "\
[0]format=gbrp[a0];[1]format=gbrp[b0];[a0][b0]blend=all_mode=screen:all_opacity=${OB}[ab];$MIX;\
[abc]format=gbrp,split[o][g];[g]format=gray,format=gbrp,curves=r='$MAPR':g='$MAPG':b='$MAPB'[gm];[gm][o]blend=all_mode=normal:all_opacity=${GM},format=yuv420p[m];\
[$P]format=rgba,colorchannelmixer=aa=${POOL}[pc];[$((P+1))]format=rgba,colorchannelmixer=aa=${POOL}[pt];[m][pc]overlay=0:0:shortest=1[p1];[p1][pt]overlay=0:0:shortest=1,format=gbrp,curves=all='0/0 0.25/0.17 0.5/0.42 1/0.97',\
curves=r='$TONER':g='$TONEG':b='$TONEB',format=yuv420p[v]" \
  -map "[v]" -t $T -an -c:v libx264 -crf 14 -pix_fmt yuv420p _gmix9.mp4
if [[ -n $PP ]]; then
  N=$($FF -i _gmix9.mp4 -map 0:v -c copy -f null - 2>&1 | grep -o 'frame= *[0-9]*' | tail -1 | grep -o '[0-9]*$')   # frames in the forward half
  # forward, then backward without repeating either end frame — the loop's wrap is one ordinary frame step
  $FF -loglevel error -y -i _gmix9.mp4 -filter_complex "[0]trim=end_frame=$N,setpts=PTS-STARTPTS,split[f][r0];[r0]reverse,trim=start_frame=1:end_frame=$((N-1)),setpts=PTS-STARTPTS[r];[f][r]concat=n=2:v=1[v]" -map "[v]" -an -c:v libx264 -preset slow -crf 18 -profile:v high -pix_fmt yuv420p -movflags +faststart "$OUT"
else
  $FF -loglevel error -y -i _gmix9.mp4 -filter_complex "[0]split[a][b];[a]trim=start=1,setpts=PTS-STARTPTS[body];[b]trim=0:1,setpts=PTS-STARTPTS[head];[body][head]xfade=transition=fade:duration=1:offset=7[v]" -map "[v]" -an -c:v libx264 -preset slow -crf 18 -profile:v high -pix_fmt yuv420p -movflags +faststart "$OUT"
fi
echo "built $OUT"
