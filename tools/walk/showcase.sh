#!/bin/zsh
# The desk film and the bed film (owner, 23 Oct), start to finish, at the room film's settings (1280 × 720, 32 samples,
# exposure −1.8, graded up to 1080p): render every shot and the bare-bed stills (resumable; retried if the GPU driver
# falls over), grade each frame (grain, vignette), cut each film with dissolves, then encode them for the site.
#   zsh tools/walk/showcase.sh
cd "${0:A:h}/../.."
B=/Applications/Blender.app/Contents/MacOS/Blender
PY=/Library/Developer/CommandLineTools/usr/bin/python3
FF=tools/node/node_modules/ffmpeg-static/ffmpeg
OUT=build/showcase
DESK=(d01_reveal d02_drawers d03_corner d04_frieze d05_back d07_wide)
BED=(b01_reveal b02_corner b03_side b07_storage b08_strut b04_headboard b05_hcorner b06_wide)
log() { echo "$(date '+%H:%M:%S') $*" | tee -a $OUT/progress.txt; }
mkdir -p $OUT
log "render: desk ${#DESK} shots, bed ${#BED} shots, 6 stills"
for attempt in 1 2 3 4; do
  find $OUT/desk $OUT/bed -name "f*.png" -size 0 -delete 2>/dev/null          # a crash leaves an empty placeholder frame
  : > $OUT/render.log
  RX=1280 RY=720 EXPOSURE=-1.8 DEVICES=gpu $B -b --python tools/walk/real.py -- $OUT showcase 32 >> $OUT/render.log 2>&1
  grep -q "^DONE showcase" $OUT/render.log && break
  log "render attempt $attempt stopped; retrying"
done
if ! grep -q "^DONE showcase" $OUT/render.log; then log "RENDER INCOMPLETE: not grading or cutting"; exit 1; fi
log "render done; grading"
for s in $DESK; do $PY tools/walk/post.py --dir $OUT/desk/$s $OUT/graded/desk/$s --size 1920x1080 --jpg; done
for s in $BED; do $PY tools/walk/post.py --dir $OUT/bed/$s $OUT/graded/bed/$s --size 1920x1080 --jpg; done
mkdir -p $OUT/stills_graded
for f in $OUT/stills/*.png; do $PY tools/walk/post.py $f $OUT/stills_graded/${f:t:r}.jpg; done
log "cutting"
$B -b --factory-startup --python tools/walk/cut.py -- "$PWD/$OUT/graded/desk" "$PWD/$OUT/desk-film.mp4" ${(j:,:)DESK} 12 1920x1080 > $OUT/cut_desk.log 2>&1
$B -b --factory-startup --python tools/walk/cut.py -- "$PWD/$OUT/graded/bed" "$PWD/$OUT/bed-film.mp4" ${(j:,:)BED} 12 1920x1080 > $OUT/cut_bed.log 2>&1
log "encoding for the site"
mkdir -p assets/video
for n in desk bed; do
  $FF -y -loglevel error -i $OUT/$n-film.mp4 -vf hqdn3d=1.5:1.5:6:6 -c:v libx264 -preset slow -crf 23 -pix_fmt yuv420p -movflags +faststart -an assets/video/$n-film.mp4
  $FF -y -loglevel error -ss 2 -i $OUT/$n-film.mp4 -frames:v 1 -vf scale=1280:-2 -q:v 3 assets/video/$n-film.jpg
done
log "ALL DONE — desk $(ls -la assets/video/desk-film.mp4 | awk '{print $5}') bytes, bed $(ls -la assets/video/bed-film.mp4 | awk '{print $5}') bytes"
