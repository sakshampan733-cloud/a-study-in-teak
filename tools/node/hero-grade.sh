#!/bin/zsh
# Hero loop v5 — one Higgsfield take that is defocused in camera (design/media/drafts/bok-*.mp4: a still made
# out of focus by gpt-image-2.5, animated by Seedance 1.5 with that same still as its first AND last frame, so
# the take closes on itself — no crossfade, no ping-pong). Real lens bokeh: discs with edges, hot spots,
# fringing. This only grades it: a little softening so nothing reads as an object, shadows crushed to the
# void, dark pools behind the mark and the centre lines, and the house split-tone.
#   usage: [CROP=w:h:x:y SLOW=1.2 BLUR=… HUE=h=…:s=… KNEE=… POOL=…] tools/node/hero-grade.sh <take.mp4> <out.mp4>
#
# Installed after round 7 (v2/media/hero.mp4): bok-b.mp4 with
#   CROP=1067:600:200:60 SLOW=1.2 BLUR=14 HUE="h=8:s=0.8" POOL=1 KNEE="0/0 0.26/0.01 0.6/0.3 0.88/0.7 1/0.93"
# then for the web: noise=alls=1:allf=t, libx264 -preset slow -crf 22 -maxrate 3000k -bufsize 6000k, +faststart.
set -e
HERE="${0:A:h}"
cd "$HERE/../../design/media/drafts"
FF="$HERE/node_modules/ffmpeg-static/ffmpeg"
IN=$1; OUT=$2
BLUR=${BLUR:-9}
KNEE=${KNEE:-"0/0 0.2/0.01 0.55/0.3 0.85/0.72 1/0.95"}
POOL=${POOL:-0.8}
TONER=${TONER:-"0/0.035 0.12/0.085 0.35/0.32 0.7/0.74 1/1"}
TONEG=${TONEG:-"0/0.055 0.12/0.105 0.35/0.33 0.7/0.68 1/0.96"}
TONEB=${TONEB:-"0/0.075 0.12/0.125 0.35/0.34 0.7/0.64 1/0.92"}
$FF -loglevel error -y -i $IN -loop 1 -i pool-centre.png -loop 1 -i pool-cta.png -filter_complex "\
[0]${CROP:+crop=$CROP,}${SLOW:+setpts=$SLOW*PTS,minterpolate=fps=24:mi_mode=blend,}scale=1600:900:flags=bicubic,gblur=sigma=$BLUR,${HUE:+hue=$HUE,}format=gbrp,curves=all='$KNEE',format=yuv420p[m];\
[1]format=rgba,colorchannelmixer=aa=${POOL}[pc];[2]format=rgba,colorchannelmixer=aa=${POOL}[pt];\
[m][pc]overlay=0:0:shortest=1[p1];[p1][pt]overlay=0:0:shortest=1,format=gbrp,\
curves=r='$TONER':g='$TONEG':b='$TONEB',format=yuv420p[v]" \
  -map "[v]" -an -c:v libx264 -preset slow -crf 18 -profile:v high -pix_fmt yuv420p -movflags +faststart $OUT
echo "built $OUT"
