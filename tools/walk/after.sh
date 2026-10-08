#!/bin/sh
# After the overnight queue (8 Oct): re-render the shot that started before the last changes, the stills those changes
# touch, then cut the two films — A, Blender only; B, the same with the AI bed clip in the bed's place.
cd "$(dirname "$0")/../.."
B=/Applications/Blender.app/Contents/MacOS/Blender; OUT=build/overnight
log() { echo "$(date '+%H:%M:%S') $*" | tee -a $OUT/progress.txt; }
while pgrep -f "tools/walk/overnight.sh" >/dev/null; do sleep 30; done
log "after: queue finished — re-rendering ${REDO}"
for sh in $REDO; do
  [ -d $OUT/film/$sh ] && mkdir -p $OUT/film_superseded && mv $OUT/film/$sh $OUT/film_superseded/${sh}_$(date +%H%M)
  RX=1280 RY=720 EXPOSURE=-1.8 DEVICES=gpu FMT=JPEG SHOTS=$sh $B -b --python tools/walk/real.py -- $OUT/film film 32 > $OUT/film/log_$sh.txt 2>&1
  log "  $sh: $(ls $OUT/film/$sh 2>/dev/null | wc -l | tr -d ' ') frames"
done
log "after: stills ${STILLS}"
RX=1920 RY=1080 EXPOSURE=-1.8 DEVICES=gpu STILLS=$STILLS $B -b --python tools/walk/real.py -- $OUT/stills stills 256 > $OUT/stills/log_after.txt 2>&1
log "after: cutting film A (Blender) and film B (Blender + the AI bed)"
$B -b --factory-startup --python tools/walk/cut.py -- $OUT/film $OUT/film-A-blender.mp4 $CUT 12 1280x720 > $OUT/cut_A.log 2>&1
mkdir -p $OUT/film_b
for d in $OUT/film/s*/; do n=$(basename $d); [ "$n" = s06_bed ] || ln -sfn "$(cd $d && pwd)" $OUT/film_b/$n; done
CUT_B=$(echo "$CUT" | sed 's/s06_bed/s06_bed_ai/')
$B -b --factory-startup --python tools/walk/cut.py -- $OUT/film_b $OUT/film-B-blender-ai.mp4 $CUT_B 12 1280x720 > $OUT/cut_B.log 2>&1
log "after: ALL DONE — A $(ls -la $OUT/film-A-blender.mp4 2>/dev/null | awk '{print $5}') bytes, B $(ls -la $OUT/film-B-blender-ai.mp4 2>/dev/null | awk '{print $5}') bytes"
