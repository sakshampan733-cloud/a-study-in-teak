// The shared wall — the bedroom's right wall and the dressing room's bedroom wall, drawn as one.
// AST-DR-024. A check sheet, not a design: it takes AST-DR-000 (the room as measured) and AST-DR-023
// (the dressing room, off the owner's sketch), lands them on the same wall, and dimensions where the
// two drawings disagree. Nothing here is new measurement — it only compares what the two sheets say.
//
// Real-world units are mm. On this sheet:
//   x runs ALONG the shared wall — 0 at the study-wall corner, growing towards the bed wall
//   y runs ACROSS it — negative into the DRESSING room, positive into the BEDROOM
// The two are landed on each other by the DOOR, because the door is one hole in one wall and has to
// be the same on both drawings. Everything else is then free to agree or not.

window.DRAWINGS = window.DRAWINGS || {};

const XWALL = (function () {
  const B = { wall: 5766, t: 229, door: { from: 4217, w: 762, lining: 76 } };   // from AST-DR-000
  const Dr = { w: 2819, d: 3759, t: 229, d2: { w: 762, corner: 787, frame: 711 }, wd: { w: 914, d: 711 },
               d3: { w: 762, from: 2845 }, tun: { w: 914, l: 2337 } };  // from AST-DR-023
  const doorEnd = B.door.from + B.door.w;
  // the dressing room's own corner, placed by lining its door up with the bedroom's
  const drRight = doorEnd + Dr.d2.corner;      // 5538
  const drLeft = drRight - Dr.w;               // 2719
  return { B, Dr, doorEnd, drRight, drLeft, gap: B.wall - drRight, unbacked: drLeft };
})();

(function () {
  const { INK, THIN, f, text, view, chainH, chainV, labels, heading, frame, titleBlock, sheet } = window.DK;
  const { B, Dr, doorEnd, drRight, drLeft, gap } = XWALL;
  const RED = "#b3261e";

  const R = (x0, y0, x1, y1, a = "") => `<rect x="${f(x0)}" y="${f(y0)}" width="${f(x1 - x0)}" height="${f(y1 - y0)}" ${a}/>`;
  const Wd = (th) => `stroke-width="${th}"`;

  // how far into the bedroom we bother to draw before cutting it off
  const BED_CUT = 1750;
  // the dressing room, across the wall: inner face at y = −t, far wall at y = −t − depth
  const drIn = -B.t, drFar = drIn - Dr.d, drOut = drFar - Dr.t;

  function plan(th) {
    let o = "";
    const dash = `${th * 8} ${th * 6}`;

    // ── the shared wall itself, running the full length of the bedroom's right wall
    o += R(0, -B.t, B.wall, 0, `fill="url(#hatchXW)" stroke="none"`);
    o += `<g ${Wd(th)}>${R(0, -B.t, B.wall, 0, 'fill="none"')}</g>`;

    // ── the bedroom side — hatched band, cut off with a break line
    o += R(0, 0, B.wall, BED_CUT, `fill="#fbfaf7" stroke="none"`);
    o += `<g ${Wd(th * 1.6)}><line x1="0" y1="0" x2="${f(B.wall)}" y2="0"/></g>`;
    // the bed wall, closing the far end; and the study-wall end
    o += R(B.wall, -B.t, B.wall + B.t, BED_CUT, `fill="url(#hatchXW)" stroke="none"`);
    o += `<g ${Wd(th)}>${R(B.wall, -B.t, B.wall + B.t, BED_CUT, 'fill="none"')}</g>`;
    o += R(-B.t, -B.t, 0, BED_CUT, `fill="url(#hatchXW)" stroke="none"`);
    o += `<g ${Wd(th)}>${R(-B.t, -B.t, 0, BED_CUT, 'fill="none"')}</g>`;
    // break line across the bedroom
    let brk = `M ${-B.t} ${BED_CUT}`;
    for (let x = -B.t; x < B.wall + B.t; x += 300) brk += ` L ${x + 150} ${BED_CUT + 55} L ${x + 300} ${BED_CUT}`;
    o += `<path d="${brk}" fill="none" stroke="${THIN}" ${Wd(th)}/>`;

    // ── the door — one opening, through the one wall
    o += R(B.door.from, -B.t, doorEnd, 0, `fill="#fff" stroke="none"`);
    o += `<g ${Wd(th)}><line x1="${f(B.door.from)}" y1="${f(-B.t)}" x2="${f(B.door.from)}" y2="0"/>
      <line x1="${f(doorEnd)}" y1="${f(-B.t)}" x2="${f(doorEnd)}" y2="0"/>
      <line x1="${f(doorEnd)}" y1="0" x2="${f(doorEnd)}" y2="${f(B.door.w)}" stroke-width="${th * 2.4}"/>
      <path d="M ${f(doorEnd)} ${f(B.door.w)} A ${B.door.w} ${B.door.w} 0 0 1 ${f(B.door.from)} 0" fill="none" stroke-dasharray="${dash}"/></g>`;

    // ── the dressing room, landed by its door
    o += `<g ${Wd(th)}>${R(drLeft - Dr.t, drOut, drRight + Dr.t, drIn, `fill="url(#hatchXW)"`)}</g>`;
    o += R(drLeft, drFar, drRight, drIn, `fill="#fff" stroke="none"`);
    o += `<g ${Wd(th * 1.6)}>${R(drLeft, drFar, drRight, drIn, 'fill="none"')}</g>`;

    // wardrobe runs — against the two long walls
    const leftRunEnd = drFar + (Dr.d - Dr.d3.from);   // the left run stops at the bathroom door
    o += R(drLeft, leftRunEnd, drLeft + Dr.wd.d, drIn, `fill="url(#hatchXW2)" stroke="none"`);
    o += R(drRight - Dr.wd.d, drFar, drRight, drIn, `fill="url(#hatchXW2)" stroke="none"`);
    // the hidden door + the tunnel, at the far end of the right-hand run
    o += R(drRight - Dr.wd.d, drFar, drRight, drFar + Dr.tun.w, `fill="#fff8ee" stroke="none"`);
    o += R(drRight, drFar, drRight + Dr.t, drFar + Dr.tun.w, `fill="#fff" stroke="none"`);
    o += R(drRight + Dr.t, drFar - Dr.t, drRight + Dr.t + Dr.tun.l, drFar + Dr.tun.w,
      `fill="url(#hatchXW3)" stroke="${THIN}" stroke-dasharray="${th * 4} ${th * 3}" ${Wd(th * 0.8)}`);
    // the bathroom door, in the dressing room's left wall
    const b0 = drFar + (Dr.d - Dr.d3.from - Dr.d3.w), b1 = b0 + Dr.d3.w;
    o += R(drLeft - Dr.t, b0, drLeft, b1, `fill="#fff" stroke="none"`);
    o += `<g ${Wd(th)}><line x1="${f(drLeft - Dr.t)}" y1="${f(b1)}" x2="${f(drLeft)}" y2="${f(b1)}"/>
      <line x1="${f(drLeft - Dr.t)}" y1="${f(b0)}" x2="${f(drLeft)}" y2="${f(b0)}"/></g>`;

    // ── the two corners, now one corner: marked so it is obvious they land together
    o += `<g stroke="${RED}" ${Wd(th * 1.4)}><line x1="${f(B.wall)}" y1="${f(drFar - 400)}" x2="${f(B.wall)}" y2="${f(BED_CUT)}"/></g>`;
    // ── the measured control: corner to the door frame, 2 ft 4 in, the same both sides
    const fFar = B.door.from + B.door.w + B.door.lining;
    o += `<g stroke="${RED}" ${Wd(th * 1.2)}><line x1="${f(fFar)}" y1="${f(-B.t - 260)}" x2="${f(fFar)}" y2="${f(B.t + 260)}" stroke-dasharray="${th * 5} ${th * 4}"/></g>`;

    return o;
  }

  window.DK.begin("sharedwall");
  let s = frame();
  s += `<defs>
    <pattern id="hatchXW" patternUnits="userSpaceOnUse" width="110" height="110" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="110" stroke="#9a9a9a" stroke-width="12"/></pattern>
    <pattern id="hatchXW2" patternUnits="userSpaceOnUse" width="90" height="90" patternTransform="rotate(-45)"><line x1="0" y1="0" x2="0" y2="90" stroke="#c7b9a3" stroke-width="22"/></pattern>
    <pattern id="hatchXW3" patternUnits="userSpaceOnUse" width="90" height="90" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="90" stroke="#cfcfcf" stroke-width="12"/></pattern>
  </defs>`;

  const sc = 45, ox = 116, oy = 146;
  const v = view(ox, oy, sc, "Shared wall — comparison"), th = v.w(0.12);
  s += heading(18, 18, "THE SHARED WALL — RECONCILED", "AST-DR-000 AND AST-DR-023 SET OUT FROM ONE MEASUREMENT — 2 FT 4 IN, CORNER TO THE DOOR FRAME", 210);
  s += v.g(plan(th), 0.3);

  // ── dimensions. The bedroom's account of the wall, below it; the dressing room's, above.
  const yB = v.Y(BED_CUT) + 10;
  s += chainH([v.X(0), v.X(B.door.from), v.X(doorEnd), v.X(B.wall)], yB,
    [`${B.door.from} TO THE DOOR`, `${B.door.w} DOOR`, `${B.wall - doorEnd} TO THE CORNER`], { from: v.Y(BED_CUT), size: 1.35 });
  s += chainH([v.X(0), v.X(B.wall)], yB + 9, [`${B.wall} — THE WALL ON AST-DR-000`], { from: yB + 5, size: 1.6 });

  const yD = v.Y(drOut) - 9;
  s += chainH([v.X(drLeft), v.X(B.door.from), v.X(doorEnd), v.X(drRight)], yD,
    [`${B.door.from - drLeft} TO THE DOOR`, `${Dr.d2.w} D2`, `${Dr.d2.corner} TO THE CORNER`], { from: v.Y(drOut), size: 1.35 });
  s += chainH([v.X(drLeft), v.X(drRight)], yD - 9, [`${Dr.w} — THE SAME WALL ON AST-DR-023`], { from: yD - 5, size: 1.6 });

  // the measured control, red, sitting across the wall: corner to the frame, both sides
  const fFar = B.door.from + B.door.w + B.door.lining;
  s += chainH([v.X(fFar), v.X(B.wall)], v.Y(-B.t) - 4, [`${Dr.d2.frame} CORNER TO THE FRAME — MEASURED, BOTH SIDES`],
    { from: v.Y(-B.t) - 1, size: 1.35 });

  const RG = labels(286, "right", 38, 205), LG = labels(58, "left", 38, 205);
  LG.add(v.X(1400), v.Y(BED_CUT * 0.45), "THE BEDROOM", "AST-DR-000 · AS MEASURED · CUT OFF HERE");
  const d3Mid = drFar + (Dr.d - Dr.d3.from - Dr.d3.w / 2);
  LG.add(v.X(drLeft - Dr.t / 2), v.Y(d3Mid), "D3 · BATHROOM DOOR", "OFF THE DRESSING ROOM'S LEFT WALL");
  LG.add(v.X(drLeft + Dr.wd.d / 2), v.Y(drFar + Dr.d * 0.45), "WARDROBE RUNS", "BOTH LONG WALLS · 2 FT 4 IN DEEP");
  RG.add(v.X(drRight + Dr.t + Dr.tun.l * 0.55), v.Y(drFar + Dr.tun.w / 2), "THE TUNNEL", "RUNS OUT PAST THE BED-WALL LINE");
  RG.add(v.X((B.door.from + doorEnd) / 2), v.Y(-B.t / 2), "THE DOOR", "THE ONE FIXED POINT · BOTH SHEETS LANDED ON IT");
  RG.add(v.X(B.wall), v.Y(-B.t / 2), "ONE CORNER, NOT TWO", "THE BED WALL AND THE DRESSING WALL NOW LAND TOGETHER");
  RG.add(v.X(drLeft * 0.5), v.Y(-B.t / 2), "NOT BACKED BY THE DRESSING ROOM", "9 FT 8 IN OF THE WALL BACKS ON TO SOMETHING ELSE");
  s += RG.draw() + LG.draw();

  s += heading(18, 226, "HOW IT WAS SETTLED", "ONE MEASUREMENT, TAKEN ON BOTH SIDES, NOW GOVERNS BOTH SHEETS", 210);
  [["THE CONTROL — 2 ft 4 in from the dressing corner to the door FRAME, taped on both sides of the",
    "   wall. Everything on this wall is now set out from that and nothing else. It replaced two figures",
    "   that disagreed: 2 ft 9 in on AST-DR-000, which had been back-calculated rather than measured,",
    "   and 2 ft 0 in on the dressing sketch, which was a reading off a hand drawing.",
    "WHAT IT FIXED — with a 3 in lining the chain now closes: frame 13 ft 7 in from the study corner",
    "   (the tape said 13 ft 6 in), the 3 ft frame, then 2 ft 4 in to the corner, on the measured",
    "   18 ft 11 in overall. Both corners now fall on the same line, so the dressing room's right-hand",
    "   wall and the bedroom's bed wall are one wall, not two a hand's width apart."],
   ["WALLS — taken at 9 in throughout, as instructed. AST-DR-000 already carried 230 mm, which is the",
    "   same 9 in, so the two sheets no longer differ on thickness either.",
    "STILL OPEN — the wall is 18 ft 11 in on the bedroom side and the dressing room only covers",
    "   9 ft 3 in of it. That leaves 9 ft 8 in at the study-wall end backing on to something that has",
    "   never been drawn. Worth knowing what is behind it before anything is fixed to that wall.",
    "KNOCK-ON — moving the door 2 in along the wall shifts the right wall's panel setting out, so the",
    "   five bays and the narrow panel past the door are all slightly different from the last issue of",
    "   AST-DR-007. That sheet has been re-cut to suit and should be reread before anything is made."]]
    .forEach((col, c) => col.forEach((n, i) => (s += text(18 + c * 172, 238 + i * 4.6, n, { size: 1.6, fill: /^[A-Z][A-Z ]+ —/.test(n) ? RED : INK }))));

  s += titleBlock({ title: "THE SHARED WALL", sub: "Bedroom / dressing room · reconciled", date: "25.09.2026",
    rev: "2 — set out from the measured 2 ft 4 in, corner to the door frame, both sides", dwg: "AST-DR-024", scale: `1:${sc} @ A3` });
  window.DRAWINGS.sharedwall = { title: "The shared wall — the two drawings compared · AST-DR-024", svg: sheet(s), model: true };
})();
