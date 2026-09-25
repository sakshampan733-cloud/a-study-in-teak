// Dressing room — shell plan, AST-DR-023. Third pass, drawn straight off the owner's clean sketch
// (25.09.2026). The first two passes both got the shape wrong: this one copies the sketch as drawn.
// Real-world units are mm. On this sheet the room is drawn the same way up as the sketch:
//   x runs left wall → right wall (the 9 ft 3 in direction)
//   y runs FAR wall (y = 0, the mirror wall, top of the sheet) → BEDROOM wall (y = D, bottom)
// The tunnel runs east, off the far end of the right wall, exactly as the sketch shows it.

window.DRAWINGS = window.DRAWINGS || {};

const DRESS = {
  rev: "3 — drawn off the owner's clean sketch: bathroom door on the LEFT wall, dressing door on the bedroom wall, tunnel running east",
  date: "25.09.2026",
  w: 2819,          // 9 ft 3 in — the room's width, left wall to right wall. CONFIRMED (sketch)
  d: 3759,          // 12 ft 4 in — the room's depth, far wall to bedroom wall. CONFIRMED (sketch)
  t: 229,           // 9 in — the owner's figure, and the same wall as the bedroom's 230 on AST-DR-000

  // D2 — the existing dressing door, in the BEDROOM wall (the bottom wall on this sheet).
  // The sketch showed 2 ft 0 in from the corner, but the owner has since measured it properly:
  // 2 ft 4 in (711) from the corner to the door FRAME, taken on BOTH sides of the wall. Add the
  // 3 in lining back on and it is 787 from the corner to the leaf. That figure now governs, and it
  // matches AST-DR-000/AST-DR-007 exactly — so this corner and the bedroom's bed-wall corner coincide.
  d2: { w: 762, corner: 787, frame: 711 },

  // D3 — the bathroom door, in the LEFT wall, at the bedroom end. The sketch runs 9 ft 4 in of wall
  // down the left side and then opens the door, with 12 ft 4 in over the whole wall — so the sketch
  // leaves 3 ft 0 in for the door. The owner said 2 ft 6 in, so it is drawn 2 ft 6 in with the rest
  // as a short return into the corner. The 6 in difference is an OPEN question on the sheet.
  d3: { w: 762, from: 2845 },

  wd: { w: 914, d: 711 },       // each wardrobe bay — 3 ft wide, 2 ft 4 in deep. CONFIRMED
  tun: { w: 914, l: 2337 },     // the tunnel — 3 ft wide, 7 ft 8 in long, running east. CONFIRMED
  hSide: 2769,      // 9 ft 1 in — plain ceiling over the left and right sides, as the main room. CONFIRMED
  hDome: 3048,      // 10 ft 0 in — the domed centre, floor to the dome. CONFIRMED
  hWd: 2743,        // 9 ft 0 in — the wardrobes' height cap, clear of the dome. CONFIRMED
};

(function () {
  const { INK, THIN, f, text, view, chainH, chainV, labels, heading, frame, titleBlock, sheet } = window.DK;
  const K = DRESS, T = K.t;

  const W = K.w, D = K.d;
  const d2x1 = W - K.d2.corner, d2x0 = d2x1 - K.d2.w;   // dressing door, in the bedroom wall
  const d3y0 = K.d3.from, d3y1 = d3y0 + K.d3.w;          // bathroom door, in the left wall
  const tunY1 = K.tun.w;                                  // tunnel/hidden door bay, at the far end

  const R = (x0, y0, x1, y1, a = "") => `<rect x="${f(x0)}" y="${f(y0)}" width="${f(x1 - x0)}" height="${f(y1 - y0)}" ${a}/>`;
  const Wd = (th) => `stroke-width="${th}"`;

  // D2: in the bottom (bedroom) wall, hinged at its right jamb, swinging into the room.
  function doorBottom(x0, w, th, dash) {
    const hx = x0 + w;
    return R(x0, D, x0 + w, D + T, `fill="#fff" stroke="none"`) +
      `<g ${Wd(th)}><line x1="${f(x0)}" y1="${f(D)}" x2="${f(x0)}" y2="${f(D + T)}"/>
       <line x1="${f(hx)}" y1="${f(D)}" x2="${f(hx)}" y2="${f(D + T)}"/>
       <line x1="${f(hx)}" y1="${f(D)}" x2="${f(hx)}" y2="${f(D - w)}" stroke-width="${th * 2.4}"/>
       <path d="M ${f(hx)} ${f(D - w)} A ${w} ${w} 0 0 0 ${f(x0)} ${f(D)}" fill="none" stroke-dasharray="${dash}"/></g>`;
  }
  // D3: in the left wall, hinged at its far jamb, swinging OUT of the room into the bathroom.
  function doorLeft(y0, w, th, dash) {
    return R(-T, y0, 0, y0 + w, `fill="#fff" stroke="none"`) +
      `<g ${Wd(th)}><line x1="${f(-T)}" y1="${f(y0)}" x2="0" y2="${f(y0)}"/>
       <line x1="${f(-T)}" y1="${f(y0 + w)}" x2="0" y2="${f(y0 + w)}"/>
       <line x1="0" y1="${f(y0)}" x2="${f(-w)}" y2="${f(y0)}" stroke-width="${th * 2.4}"/>
       <path d="M ${f(-w)} ${f(y0)} A ${w} ${w} 0 0 0 0 ${f(y0 + w)}" fill="none" stroke-dasharray="${dash}"/></g>`;
  }

  function plan(th) {
    let o = "";
    const outer = `M ${-T} ${-T} L ${W + T} ${-T} L ${W + T} ${D + T} L ${-T} ${D + T} Z`;
    const inner = `M 0 0 L ${W} 0 L ${W} ${D} L 0 ${D} Z`;
    o += `<path d="${outer} ${inner}" fill="url(#hatchDR)" fill-rule="evenodd" stroke="none"/>`;
    o += `<path d="${outer}" fill="none" ${Wd(th)}/><path d="${inner}" fill="none" ${Wd(th * 1.6)}/>`;

    const dash = `${th * 8} ${th * 6}`;
    o += doorBottom(d2x0, K.d2.w, th, dash);
    o += doorLeft(d3y0, K.d3.w, th, dash);

    // wardrobe runs — 2 ft 4 in deep. The left run stops at the bathroom door; the right runs full depth.
    const leftEnd = d3y0;
    o += R(0, 0, K.wd.d, leftEnd, `fill="url(#hatchDR2)" stroke="none"`);
    o += `<path d="M ${f(K.wd.d)} 0 L ${f(K.wd.d)} ${f(leftEnd)}" fill="none" ${Wd(th * 0.7)} stroke-dasharray="${th * 6} ${th * 5}"/>`;
    o += R(W - K.wd.d, 0, W, D, `fill="url(#hatchDR2)" stroke="none"`);
    o += `<path d="M ${f(W - K.wd.d)} 0 L ${f(W - K.wd.d)} ${f(D)}" fill="none" ${Wd(th * 0.7)} stroke-dasharray="${th * 6} ${th * 5}"/>`;
    for (let y = K.wd.w; y < leftEnd; y += K.wd.w) o += `<line x1="0" y1="${f(y)}" x2="${f(K.wd.d)}" y2="${f(y)}" ${Wd(th * 0.5)}/>`;
    for (let y = K.wd.w; y < D; y += K.wd.w) o += `<line x1="${f(W - K.wd.d)}" y1="${f(y)}" x2="${f(W)}" y2="${f(y)}" ${Wd(th * 0.5)}/>`;

    // the hidden door — the last bay on the right run, hard at the far end, on to the tunnel
    o += R(W - K.wd.d, 0, W, tunY1, `fill="#fff8ee" stroke="none"`);
    o += `<g ${Wd(th)} stroke-dasharray="${th * 3} ${th * 2.4}"><path d="M ${f(W - K.wd.d)} ${f(tunY1)} L ${f(W)} ${f(tunY1)}"/></g>`;

    // the tunnel — east off the right wall, its far side flush with the far wall.
    // The right wall is opened through for the mouth: that is what the hidden door hides.
    o += R(W, 0, W + T, tunY1, `fill="#fff" stroke="none"`);
    o += `<g ${Wd(th)}><line x1="${f(W)}" y1="${f(tunY1)}" x2="${f(W + T)}" y2="${f(tunY1)}"/></g>`;
    o += R(W + T, -T, W + T + K.tun.l, tunY1, `fill="url(#hatchDR3)" stroke="${THIN}" stroke-dasharray="${th * 4} ${th * 3}" ${Wd(th * 0.8)}`);

    // the dressing mirror — on the far wall, between the two runs
    o += `<line x1="${f(K.wd.d + 120)}" y1="${f(-18)}" x2="${f(W - K.wd.d - 120)}" y2="${f(-18)}" ${Wd(th * 2.2)}/>`;

    return o;
  }

  window.DK.begin("dressingshell");
  let s = frame();
  s += `<defs>
    <pattern id="hatchDR" patternUnits="userSpaceOnUse" width="90" height="90" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="90" stroke="#9a9a9a" stroke-width="10"/></pattern>
    <pattern id="hatchDR2" patternUnits="userSpaceOnUse" width="70" height="70" patternTransform="rotate(-45)"><line x1="0" y1="0" x2="0" y2="70" stroke="#c7b9a3" stroke-width="18"/></pattern>
    <pattern id="hatchDR3" patternUnits="userSpaceOnUse" width="70" height="70" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="70" stroke="#cfcfcf" stroke-width="10"/></pattern>
  </defs>`;

  const sc = 35, ox = 90, oy = 54;
  const v = view(ox, oy, sc, "Dressing room plan"), th = v.w(0.12);
  s += heading(18, 18, "DRESSING ROOM — SHELL AND LAYOUT", `PLAN · SCALE 1:${sc} · COPIED FROM THE OWNER'S SKETCH — NOT YET A SITE MEASUREMENT`, 170);
  s += v.g(plan(th), 0.3);

  // dimensions
  const yTop = v.Y(-T) - 7, yBot = v.Y(D + T) + 8;
  s += chainH([v.X(0), v.X(W)], yTop, [`${W} — ROOM WIDTH`], { from: v.Y(-T), size: 1.6 });
  s += chainH([v.X(W + T), v.X(W + T + K.tun.l)], yTop, [`${K.tun.l} TUNNEL LONG`], { from: v.Y(-T), size: 1.4 });
  s += chainH([v.X(0), v.X(d2x0), v.X(d2x1), v.X(W)], yBot,
    ["", `${K.d2.w} D2 LEAF`, `${K.d2.corner} TO THE CORNER`], { from: v.Y(D + T), size: 1.3 });
  // the measured control: corner to the door FRAME, taken on both sides of the wall
  s += chainH([v.X(d2x1 + 76), v.X(W)], yBot - 7, [`${K.d2.frame} CORNER TO THE FRAME — MEASURED`], { from: v.Y(D + T), size: 1.3 });
  s += chainH([v.X(0), v.X(W)], yBot + 8, [`${W} — BEDROOM WALL`], { from: yBot + 4, size: 1.5 });
  s += chainV([v.Y(0), v.Y(d3y0), v.Y(D)], v.X(-T) - 8, [`${d3y0} WALL`, `${D - d3y0} D3 + RETURN`], { from: v.X(-T), size: 1.3 });
  s += chainV([v.Y(0), v.Y(D)], v.X(-T) - 20, [`${D} — LEFT AND RIGHT WALL`], { from: v.X(-T) - 1, size: 1.6 });
  s += chainV([v.Y(0), v.Y(tunY1)], v.X(W + T + K.tun.l) + 8, [`${K.tun.w} TUNNEL WIDE`], { from: v.X(W + T + K.tun.l), size: 1.4 });

  const RG = labels(268, "right", 40, 200), LG = labels(50, "left", 40, 200);
  LG.add(v.X(W / 2), v.Y(-18), "DRESSING MIRROR", "ON THE FAR WALL · SIZE STILL OPEN");
  LG.add(v.X(K.wd.d / 2), v.Y(K.wd.w * 1.5), "WARDROBE — LEFT WALL", "3 FT BAYS · 2 FT 4 IN DEEP");
  LG.add(v.X(-T / 2), v.Y((d3y0 + d3y1) / 2), "D3 · BATHROOM DOOR", "IN THE LEFT WALL · SWINGS OUT");
  LG.add(v.X((d2x0 + d2x1) / 2), v.Y(D + T / 2), "D2 · DRESSING DOOR", "IN FROM THE BEDROOM · SWINGS IN");
  RG.add(v.X(W - K.wd.d / 2), v.Y(K.wd.w / 2), "HIDDEN DOOR", "LAST BAY AT THE FAR END · PUSH IT AND IT OPENS");
  RG.add(v.X(W + T + K.tun.l / 2), v.Y(K.tun.w / 2), "THE TUNNEL", "3 FT WIDE · 7 FT 8 IN LONG · RUNS EAST");
  RG.add(v.X(W - K.wd.d / 2), v.Y(K.wd.w * 2.6), "WARDROBE — RIGHT WALL", "SAME BAYS · RUNS THE FULL 12 FT 4 IN");
  s += RG.draw() + LG.draw();

  s += heading(18, 226, "NOTES", `REVISION ${K.rev.split(" ")[0]}`, 170);
  [["Third pass, and this one copies the sketch rather than interpreting it. The two earlier drawings",
    "both had the shape wrong; everything below is read straight off the owner's own clean drawing.",
    "The BEDROOM wall is the bottom wall here, 9 ft 3 in, and it carries D2, the existing dressing",
    "   door in from the bedroom, 2 ft 4 in from the right-hand corner to the door FRAME — measured",
    "   on both sides of the wall, and the figure that now governs. The sketch's 2 ft 0 in is superseded.",
    "The BATHROOM door, D3, is in the LEFT wall, at the bedroom end — not in the bedroom wall. The",
    "   sketch runs 9 ft 4 in of wall down from the far corner and then opens the door.",
    "The TUNNEL runs EAST, straight out of the far end of the right wall, 3 ft wide and 7 ft 8 in long,",
    "   its far side flush with the far wall. The hidden door is the last wardrobe bay in front of it:",
    "   built and shelved like every other bay, so from the room it reads as one more cupboard.",
    "Ceiling 9 ft 1 in, plain, over the left and right sides — the same height as the main room. A",
    "   domed centre rises to 10 ft 0 in, so the wardrobes are capped at 9 ft 0 in, clear under it."],
   ["SETTLED — D2 sits 2 ft 4 in from the corner to its frame, on both sides of the wall. That closes",
    "   this sheet against AST-DR-000 and AST-DR-007: this room's right-hand corner and the bedroom's",
    "   bed-wall corner are the same corner. Walls are taken at 9 in throughout. See AST-DR-024.",
    "OPEN — D3's width. It is drawn 2 ft 6 in, as the owner said, but the sketch's own 9 ft 4 in against",
    "   12 ft 4 in leaves 3 ft 0 in — so a 6 in return is shown into the corner. To confirm.",
    "OPEN — the right-hand wardrobe run is drawn the full 12 ft 4 in, which brings it down to the",
    "   bedroom wall and across about 4 in of D2's opening. Either the run stops a bay short or D2",
    "   sits further left. Not resolved here.",
    "OPEN — the left run is drawn stopping at D3. Whether it ends there or returns over the door",
    "   is not decided.",
    "OPEN — where the tunnel leads, and what is at its far end.",
    "OPEN — the dome's own shape: how far along the room it runs, and its profile.",
    "OPEN — wall thickness (115) and the mirror's own size are assumed or blank."]]
    .forEach((col, c) => col.forEach((n, i) => (s += text(18 + c * 172, 238 + i * 4.6, n, { size: 1.6, fill: n.startsWith("OPEN") ? "#b3261e" : INK }))));

  s += titleBlock({ title: "DRESSING ROOM", sub: "Shell and layout · third pass", date: K.date, rev: K.rev, dwg: "AST-DR-023", scale: `1:${sc} @ A3` });
  window.DRESS = DRESS;
  window.DRAWINGS.dressingshell = { title: "Dressing room — shell and layout · AST-DR-023", svg: sheet(s), model: true };
})();
