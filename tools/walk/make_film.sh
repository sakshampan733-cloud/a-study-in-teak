#!/bin/zsh
# The whole film, start to finish: render every shot (resumable; retried if the GPU driver falls over), grade each
# frame (grain, vignette, up to 1080p), then cut them together with dissolves into build/film/room_film.mp4.
#   zsh tools/walk/make_film.sh
cd "${0:A:h}/../.."
B=/Applications/Blender.app/Contents/MacOS/Blender
PY=/Library/Developer/CommandLineTools/usr/bin/python3
ORDER=(s01_door s02_reveal s03_partition s04_study s05_desk s05b_sconces s06_bed s07_d2 s08_dress s09_vault s10_vanity)
mkdir -p build/film
for attempt in 1 2 3 4; do
  find build/film/s* -name "*.png" -size 0 -delete 2>/dev/null          # a crash leaves an empty placeholder frame
  RX=1600 RY=900 EXPOSURE=-2.0 ATHRESH=0.03 DEVICES=gpu $B -b --python tools/walk/real.py -- build/film film 80 >> build/film/render.log 2>&1
  grep -q "^DONE film" build/film/render.log && break
  echo "render attempt $attempt stopped; retrying" >> build/film/render.log
done
for s in $ORDER; do $PY tools/walk/post.py --dir build/film/$s build/film/graded/$s --size 1920x1080; done
$B -b --factory-startup --python tools/walk/cut.py -- "$PWD/build/film/graded" "$PWD/build/film/room_film.mp4" ${(j:,:)ORDER} 12 1920x1080 >> build/film/render.log 2>&1
echo "FILM READY $(date)" >> build/film/render.log
