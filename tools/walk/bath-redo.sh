#!/bin/sh
# After the main overnight run: re-render the bathroom stills and the two bathroom film shots with the 9 Oct changes
# (glass to the ceiling, frameless mirror, brighter spots), then re-cut the film.
cd "$(dirname "$0")/../.."
B=/Applications/Blender.app/Contents/MacOS/Blender; OUT=build/overnight
while pgrep -f "tools/walk/overnight.sh" >/dev/null; do sleep 60; done
echo "$(date '+%H:%M:%S') bathroom redo starts" >> $OUT/progress.txt
RX=1920 RY=1080 EXPOSURE=-1.8 DEVICES=gpu STILLS=bath_van,bath_van2,bath_wc,bath_tub,bath_up $B -b --python tools/walk/real.py -- $OUT/stills stills 256 > $OUT/stills/log_bath.txt 2>&1
echo "$(date '+%H:%M:%S') bathroom stills redone" >> $OUT/progress.txt
mkdir -p $OUT/old_bath_film; mv $OUT/film/s10_vanity $OUT/film/s11_bath $OUT/old_bath_film/ 2>/dev/null
for sh in s10_vanity s11_bath; do
  RX=1280 RY=720 EXPOSURE=-1.8 DEVICES=gpu FMT=JPEG SHOTS=$sh $B -b --python tools/walk/real.py -- $OUT/film film 32 > $OUT/film/log_${sh}_redo.txt 2>&1
  echo "$(date '+%H:%M:%S') $sh redone: $(ls $OUT/film/$sh | wc -l) frames" >> $OUT/progress.txt
done
$B -b --factory-startup --python tools/walk/cut.py -- $OUT/film $OUT/a-study-in-teak-film.mp4 s01_door,s02_reveal,s03_partition,s04_study,s14_arch,s05_desk,s05b_sconces,s06_bed,s13_hide,s07_d2,s08_dress,s09_vault,s12_mech,s12b_tunnel,s10_vanity,s11_bath 12 1280x720 > $OUT/cut2.log 2>&1
echo "$(date '+%H:%M:%S') film recut: $(ls -la $OUT/a-study-in-teak-film.mp4 | awk '{print $5}') bytes — BATH REDO DONE" >> $OUT/progress.txt
