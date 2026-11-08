#!/bin/zsh
# The photoreal master (owner, 8 Nov: "re-render my entire room… as good as possible"): every still and the whole room
# film, with the photoreal pass (PHOTO=1: light free to bounce, varied grain, smudges, lit shades, creased bedding),
# the scanned surface detail (REALTEST=1) and render-time edge rounding. Stills 2560 × 1440 at 1024 samples, then the
# film 1920 × 1080 at 512 samples, graded, cut with dissolves and encoded — into build/master only; the site's film is
# replaced only when the owner has seen it. Resumable (re-run it), retried if the GPU driver falls over.
#   zsh tools/walk/master.sh
cd "${0:A:h}/../.."
B=/Applications/Blender.app/Contents/MacOS/Blender
PY=tools/.venv/bin/python3
FF=tools/node/node_modules/ffmpeg-static/ffmpeg
OUT=build/master
# no open cupboards (owner, 8 Oct), no plan view, no 18 mm walk views
STILLS=(r_room r_bed r_desk r_study r_pbed r_ptv r_paint r_mon r_pdesk b_front b_three b_cove b_head b_rug st_close st_wall st_arch st_wall2 st_wall3 st_chairf st_chair st_lamp mould_c mould_r wd_handle hide_close c_gloss t_front t_three t_end h_study h_bedwall h_right h_desk h_dress h_vanity h_wardrobe vanity bath_wc bath_tub bath_van bath_van2 bath_up door dress vault mirror d2close d1close pilaster deskclose deskfront d2head window)
CUT=(s01_door s02_reveal s03_partition s04_study s14_arch s05_desk s05b_sconces s06_bed s13_hide s07_d2 s08_dress s09_vault s12_mech s12b_tunnel s10_vanity s11_bath s11b_wc)
Q=(PHOTO=1 REALTEST=1 BEVEL_SHADER=1 DEVICES=gpu EXPOSURE=-1.8)
log() { echo "$(date '+%d %b %H:%M:%S') $*" | tee -a $OUT/progress.txt; }
mkdir -p $OUT/stills $OUT/film
log "stills: ${#STILLS}"
for attempt in 1 2 3 4; do
  env $Q RX=2560 RY=1440 RESUME=1 STILLS=${(j:,:)STILLS} $B -b --python tools/walk/real.py -- $OUT/stills stills 1024 > $OUT/stills/render.log 2>&1
  grep -q "^DONE stills" $OUT/stills/render.log && break
  log "stills attempt $attempt stopped; retrying"
done
log "stills done: $(ls $OUT/stills/*.png 2>/dev/null | wc -l | tr -d ' ') images"
log "film: ${#CUT} shots"
for attempt in 1 2 3 4 5 6; do
  find $OUT/film -name "f*.png" -size 0 -delete 2>/dev/null
  env $Q RX=1920 RY=1080 ATHRESH=0.01 SHOTS=${(j:,:)CUT} $B -b --python tools/walk/real.py -- $OUT/film film 512 > $OUT/film/render.log 2>&1
  grep -q "^DONE film" $OUT/film/render.log && break
  log "film attempt $attempt stopped; retrying"
done
if ! grep -q "^DONE film" $OUT/film/render.log; then log "FILM INCOMPLETE: not grading or cutting"; exit 1; fi
log "grading"
for s in $CUT; do $PY tools/walk/post.py --dir $OUT/film/$s $OUT/graded/$s --size 1920x1080 --jpg; done
log "cutting"
$B -b --factory-startup --python tools/walk/cut.py -- "$PWD/$OUT/graded" "$PWD/$OUT/room_film.mp4" ${(j:,:)CUT} 12 1920x1080 > $OUT/cut.log 2>&1
log "encoding web copies (into build/master/web, not the site)"
mkdir -p $OUT/web
$FF -y -loglevel error -i $OUT/room_film.mp4 -vf hqdn3d=1.5:1.5:6:6 -c:v libx264 -preset slow -crf 20 -pix_fmt yuv420p -movflags +faststart -an $OUT/web/room-film.mp4
$FF -y -loglevel error -i $OUT/room_film.mp4 -vf scale=1280:-2,hqdn3d=1.5:1.5:6:6 -c:v libx264 -preset slow -crf 23 -pix_fmt yuv420p -movflags +faststart -an $OUT/web/room-film-720.mp4
log "ALL DONE"
