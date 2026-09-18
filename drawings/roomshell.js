// The room as built — shell only, no furniture. Plan at 1:40.
// AST-DR-001. Real-world units are mm. In this drawing x runs left-to-right along the study wall
// and y runs DOWN the page, away from the study wall towards the bed wall (no flip, unlike the elevations).

window.DRAWINGS = window.DRAWINGS || {};

const SHELL = {
  rev: "1 — measured on site, step in the left wall recorded",
  date: "18.09.2026",
  wStudy: 4547,   // 14 ft 11 in — study wall, the narrow end
  wPart: 4572,    // 15 ft 0 in — at the partition line
  wPreStep: 4597, // 15 ft 1 in — just before the step
  wBed: 4724,     // 15 ft 6 in — bed wall, the wide end
  lRight: 5791,   // 19 ft 0 in — right wall, study wall to bed wall
  lLeft: 5766,    // 18 ft 11 in — left wall
  H: 2769,        // 9 ft 1 in, level throughout
  t: 230,         // wall thickness
  step: 127,      // 5 in — the left wall kicks out past the entrance door
  yStep: 4600,    // how far down the step falls — TO CONFIRM
  yPart: 2900,    // the partition line — TO CONFIRM
  win: { w: 1219 },                 // 4 ft, hard into the right-hand corner of the study wall
  dress: { from: 4420, w: 762 },    // dressing door in the right wall, 2 ft 6
  ent: { w: 914 },                  // entrance door in the left wall, just before the step — TO CONFIRM
};

(function () {
  const { INK, THIN, f, text, view, chainH, chainV, note, heading, frame, titleBlock, sheet } = window.DK;
  const K = SHELL, T = K.t;

  // ── the shell, in plan ──
  // Right wall is taken as the straight reference; the left wall carries the whole splay and the step.
  const xR = K.wStudy;                       // right wall inner face
  const xL0 = 0;                             // left wall inner face at the study wall
  const xLs = K.wStudy - K.wPreStep;         // left wall inner face just before the step  (= −50)
  const xLb = K.wStudy - K.wBed;             // left wall inner face past the step         (= −177)
  const L = K.lRight;

  const inner = `M ${xL0} 0 L ${xR} 0 L ${xR} ${L} L ${xLb} ${L} L ${xLb} ${K.yStep} L ${xLs} ${K.yStep} Z`;
  const outer = `M ${xL0 - T} ${-T} L ${xR + T} ${-T} L ${xR + T} ${L + T} L ${xLb - T} ${L + T} L ${xLb - T} ${K.yStep} L ${xLs - T} ${K.yStep} Z`;

  const R = (x0, y0, x1, y1, a = "") => `<rect x="${f(x0)}" y="${f(y0)}" width="${f(x1 - x0)}" height="${f(y1 - y0)}" ${a}/>`;
  const W = (th) => `stroke-width="${th}"`;

  function plan(th) {
    let o = "";
    // poché — the wall thickness, hatched, with the room as a hole
    o += `<path d="${outer} ${inner}" fill="url(#hatchSH)" fill-rule="evenodd" stroke="none"/>`;
    o += `<path d="${outer}" fill="none" ${W(th)}/>`;
    o += `<path d="${inner}" fill="none" ${W(th * 1.6)}/>`;

    // window — hard into the right corner of the study wall
    const wx0 = xR - K.win.w;
    o += R(wx0, -T, xR, 0, `fill="#fff" stroke="none"`);
    o += `<g ${W(th)}>${R(wx0, -T, xR, 0, "fill=\"none\"")}
      <line x1="${f(wx0)}" y1="${f(-T / 2 - 30)}" x2="${f(xR)}" y2="${f(-T / 2 - 30)}"/>
      <line x1="${f(wx0)}" y1="${f(-T / 2 + 30)}" x2="${f(xR)}" y2="${f(-T / 2 + 30)}"/></g>`;

    // dressing door — right wall, opening inward, hinged on the far side
    const d0 = K.dress.from, d1 = d0 + K.dress.w;
    o += R(xR, d0, xR + T, d1, `fill="#fff" stroke="none"`);
    o += `<g ${W(th)}><line x1="${f(xR)}" y1="${f(d0)}" x2="${f(xR + T)}" y2="${f(d0)}"/><line x1="${f(xR)}" y1="${f(d1)}" x2="${f(xR + T)}" y2="${f(d1)}"/>
      <line x1="${f(xR)}" y1="${f(d1)}" x2="${f(xR - K.dress.w)}" y2="${f(d1)}"/>
      <path d="M ${f(xR - K.dress.w)} ${f(d1)} A ${K.dress.w} ${K.dress.w} 0 0 0 ${f(xR)} ${f(d0)}" fill="none" stroke-dasharray="${th * 8} ${th * 6}"/></g>`;

    // entrance door — left wall, just before the step, swinging in
    const e1 = K.yStep, e0 = e1 - K.ent.w;
    o += R(xLs - T, e0, xLs, e1, `fill="#fff" stroke="none"`);
    o += `<g ${W(th)}><line x1="${f(xLs - T)}" y1="${f(e0)}" x2="${f(xLs)}" y2="${f(e0)}"/><line x1="${f(xLs - T)}" y1="${f(e1)}" x2="${f(xLs)}" y2="${f(e1)}"/>
      <line x1="${f(xLs)}" y1="${f(e0)}" x2="${f(xLs + K.ent.w)}" y2="${f(e0)}"/>
      <path d="M ${f(xLs + K.ent.w)} ${f(e0)} A ${K.ent.w} ${K.ent.w} 0 0 0 ${f(xLs)} ${f(e1)}" fill="none" stroke-dasharray="${th * 8} ${th * 6}"/></g>`;

    // the partition line — shell reference only, nothing built shown
    o += `<line x1="${f(xR)}" y1="${f(K.yPart)}" x2="${f(xL0 - (K.yPart / L) * (xL0 - xLs))}" y2="${f(K.yPart)}" stroke="${THIN}" ${W(th)} stroke-dasharray="${th * 14} ${th * 10}"/>`;
    return o;
  }

  // ═════════════ SHEET — THE ROOM AS BUILT ═════════════
  window.DK.begin("roomshell");
  let s = frame();
  s += `<defs><pattern id="hatchSH" patternUnits="userSpaceOnUse" width="90" height="90" patternTransform="rotate(45)">
    <line x1="0" y1="0" x2="0" y2="90" stroke="#9a9a9a" stroke-width="10"/></pattern></defs>`;

  const sc = 50, ox = 60, oy = 55;
  const v = view(ox, oy, sc, "Room shell plan"), th = v.w(0.12);
  s += heading(18, 20, "THE ROOM AS BUILT", `PLAN · SCALE 1:${sc} · SHELL ONLY, NO FURNITURE · CEILING ${K.H} (9 FT 1 IN) LEVEL THROUGHOUT`, 120);
  s += v.g(plan(th), 0.3);

  // ── dimensions ──
  const yTop = v.Y(-T) - 8, yBot = v.Y(L + T) + 10;
  const wx0 = xR - K.win.w;
  s += chainH([v.X(wx0), v.X(xR)], yTop, [`${K.win.w} (4 FT) WINDOW`], { from: v.Y(0) - 1, size: 1.5 });
  s += chainH([v.X(xL0), v.X(xR)], yTop - 8, [`${K.wStudy} — STUDY WALL, 14 FT 11 IN`], { from: yTop - 12, size: 1.6 });
  s += chainH([v.X(xLb), v.X(xR)], yBot, [`${K.wBed} — BED WALL, 15 FT 6 IN`], { from: v.Y(L + T) + 1, size: 1.6 });
  s += chainH([v.X(xLb), v.X(xLs)], yBot + 9, [`${K.step} (5 IN) STEP`], { from: yBot + 1, size: 1.5 });

  const xRt = v.X(xR + T) + 9;
  s += chainV([v.Y(0), v.Y(K.dress.from), v.Y(K.dress.from + K.dress.w), v.Y(L)], xRt, [`${K.dress.from}`, `${K.dress.w} DOOR`, `${L - K.dress.from - K.dress.w}`], { from: v.X(xR + T) + 1, size: 1.5 });
  s += chainV([v.Y(0), v.Y(L)], xRt + 9, [`${L} — RIGHT WALL, 19 FT 0 IN`], { from: xRt + 1, size: 1.6 });
  s += chainV([v.Y(0), v.Y(L)], v.X(xLb - T) - 9, [`${K.lLeft} — LEFT WALL, 18 FT 11 IN`], { from: v.X(xLb - T) - 1, size: 1.6 });

  // width at the partition line
  const yP = v.Y(K.yPart);
  s += chainH([v.X(xL0 - (K.yPart / L) * (xL0 - xLs)), v.X(xR)], yP - 1.5, [`${K.wPart} — 15 FT 0 IN AT THE PARTITION LINE`], { from: yP, size: 1.5 });

  // ── labels, kept in the column to the right of the plan ──
  const lab = (x, y, tx, ty, a, b, anchor = "start") => note(v.X(x), v.Y(y), tx, ty, a, b, anchor);
  s += lab(xR - K.win.w / 2, 0, 182, 36, "WINDOW", "HARD INTO THE CORNER — NO RETURN");
  s += lab(xR, 2200, 182, 62, "RIGHT WALL", "PANELLING AND THE DRESSING DOOR");
  s += lab(xR, K.dress.from + K.dress.w / 2, 182, 88, "DRESSING DOOR", "2 FT 6 × 8 FT · OPENS IN, HINGED RIGHT");
  s += lab(2600, K.yPart, 182, 114, "PARTITION LINE", "SHELL REFERENCE ONLY · POSITION TO CONFIRM");
  s += lab((xR + xLb) / 2, L, 182, 140, "BED WALL", "PARCHMENT · 15 FT 6 IN");
  s += lab(xLs - T / 2, K.yStep - K.ent.w / 2, 54, 208, "ENTRANCE", "POSITION TO CONFIRM");
  s += lab(xLb, K.yStep, 54, 222, "THE STEP — 5 IN", "THE LEFT WALL KICKS OUT PAST THE DOOR · POSITION TO CONFIRM");

  // ── notes ──
  s += heading(300, 20, "NOTES", `REVISION ${K.rev.split(" ")[0]}`, 80);
  ["The room is not square. It widens about 2 in from the",
   "   study wall to the bed wall — roughly half a degree.",
   "Diagonals measured 24 ft 5 in and 23 ft 11 in.",
   "The right wall is taken as the straight reference; the left",
   "   wall carries the splay and the step.",
   "Ceiling 9 ft 1 in, level throughout. The main room ceiling",
   "   is plain, so the splay never shows from above.",
   "Floor, marble border and skirting are laid. Skirting runs",
   "   on three walls only: bed, left and right.",
   "Every fitted piece to be built 15–20 undersize and scribed",
   "   on site to the wall it actually meets.",
   "Furniture, partition and joinery are NOT shown.",
   "Bathroom and dressing lie beyond the right wall — to come.",
  ].forEach((t, i) => (s += text(300, 32 + i * 5.4, t, { size: 1.75, fill: i > 10 ? THIN : INK })));

  s += titleBlock({ title: "THE ROOM AS BUILT", sub: "Shell plan · measured on site", date: K.date, rev: K.rev, dwg: "AST-DR-001", scale: `1:${sc} @ A3` });
  window.DRAWINGS.roomshell = { title: "The room as built · AST-DR-001", svg: sheet(s), model: true };
})();
