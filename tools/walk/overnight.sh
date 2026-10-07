#!/bin/sh
# The overnight render: the final stills, then the film shot by shot. Before every shot it checks the free disk space and
# stops cleanly (writing build/overnight/STOPPED.txt) rather than fill the disk; every shot is resumable — run it again
# and it carries on from the last frame on disk. Frames are JPEG (q95): about 1 MB each at 1080p.
cd "$(dirname "$0")/../.."
B=/Applications/Blender.app/Contents/MacOS/Blender
OUT=build/overnight; mkdir -p $OUT/stills $OUT/film
MINGB=${MINGB:-3}
free_gb() { df -g . | awk 'NR==2 {print $4}'; }
log() { echo "$(date '+%H:%M:%S') $*" | tee -a $OUT/progress.txt; }
guard() { f=$(free_gb); if [ "$f" -lt "$MINGB" ]; then log "STOP: only ${f} GB free (need ${MINGB})"; echo "Stopped at $(date): ${f} GB free. Free space and run tools/walk/overnight.sh again — it resumes." > $OUT/STOPPED.txt; exit 0; fi; }
if [ "${SKIP_STILLS:-0}" != "1" ]; then
  guard; log "stills: ${STILL_RX:-1920}x${STILL_RY:-1080}, ${STILL_SPP:-256} spp"
  RX=${STILL_RX:-1920} RY=${STILL_RY:-1080} EXPOSURE=-1.8 DEVICES=gpu STILLS=$STILLS $B -b --python tools/walk/real.py -- $OUT/stills stills ${STILL_SPP:-256} > $OUT/stills/log.txt 2>&1
  log "stills done: $(ls $OUT/stills/*.png 2>/dev/null | wc -l | tr -d ' ') images"
fi
for sh in $SHOTS; do
  guard; log "film shot $sh"
  RX=${FILM_RX:-1920} RY=${FILM_RY:-1080} EXPOSURE=-1.8 DEVICES=gpu FMT=JPEG SHOTS=$sh $B -b --python tools/walk/real.py -- $OUT/film film ${FILM_SPP:-48} > $OUT/film/log_$sh.txt 2>&1
  log "  $sh: $(ls $OUT/film/$sh 2>/dev/null | wc -l | tr -d ' ') frames, $(free_gb) GB free"
done
if [ -n "$CUT" ]; then
  guard; log "cutting the film"
  $B -b --factory-startup --python tools/walk/cut.py -- $OUT/film $OUT/a-study-in-teak-film.mp4 $CUT 12 ${FILM_RX:-1920}x${FILM_RY:-1080} > $OUT/cut.log 2>&1
  log "film: $(ls -la $OUT/a-study-in-teak-film.mp4 2>/dev/null | awk '{print $5}') bytes"
fi
log "ALL DONE"
