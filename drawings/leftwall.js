// Left wall — AST-DR-014. Deliberately the plain one: paint, the marble skirting, one painting
// centred on it, and the air conditioner above. Nothing is built into this wall.
// Seen from inside the room, the study corner on the left and the bed corner on the right, so it
// reads the same way round as the plan. Real-world units are mm; y measured UP from the floor.

window.DRAWINGS = window.DRAWINGS || {};

const LWALL = {
  rev: "5 — the painting widened to 4 ft 6 in",
  date: "23.09.2026",
  skirt: 102,
  art: { w: 1372, h: 1524, centre: 1322 },  // 4 ft 6 x 5 ft — wider than the AC above it by 4 in a side. ASSUMED
  ac: { w: 1168, h: 305, d: 200, down: 160 },   // 3 ft 10 in x 1 ft, MEASURED; depth still assumed
  gap: 180,                                  // clear wall wanted between the AC and the top of the frame
};

(function () {
  const { INK, THIN, f, text, mmToFt, view, chainH, chainV, labels, heading, frame, titleBlock, sheet } = window.DK;
  const K = LWALL, S = window.SHELL;
  const ft = (mm) => mmToFt(mm).replace("'-", " ft ").replace('"', " in").replace(/^0 ft /, "");
  const L = S.lLeft, H = S.H, T = S.t, ENT = S.ent.w, STEP = S.step;
  const yStep = S.yStep;                     // measured from the STUDY end, as the plan has it

  // Along this elevation x runs from the study corner (0) to the bed corner (L).
  const xStep = yStep, xDoor = L - ENT;
  // The painting sits centred on the run of wall before the step — the only uninterrupted piece.
  const xc = xStep / 2;
  const artY0 = K.art.centre - K.art.h / 2, artY1 = artY0 + K.art.h;
  const acY1 = H - K.ac.down, acY0 = acY1 - K.ac.h;

  const ey = (y) => H - y;
  const R = (x0, y0, x1, y1, a = "") => `<rect x="${f(x0)}" y="${f(ey(y1))}" width="${f(x1 - x0)}" height="${f(y1 - y0)}" ${a}/>`;
  const Ln = (x0, y0, x1, y1, w) => `<line x1="${f(x0)}" y1="${f(ey(y0))}" x2="${f(x1)}" y2="${f(ey(y1))}" stroke-width="${w}"/>`;

  function elevation(th) {
    let o = "";
    o += R(0, 0, L, H, `fill="none" stroke-width="${th * 1.2}"`);
    // the step: past it the wall stands 5 in further into the room, so it shows as a break
    o += Ln(xStep, 0, xStep, H, th * 0.8) + `<g stroke-dasharray="${th * 9} ${th * 6}">${Ln(xStep + 40, 0, xStep + 40, H, th * 0.5)}</g>`;
    // skirting, stopping at the door
    o += R(0, 0, xDoor, K.skirt, `fill="none" stroke-width="${th}"`) + Ln(0, K.skirt - 25, xDoor, K.skirt - 25, th * 0.6);
    // entrance door at the far end. PLAIN casing — the carved head is the dressing door's alone.
    const C = window.CASING;
    if (C) o += `<g transform="translate(${f(xDoor - C.CAS)},${f(ey(C.PTOP))})" stroke-width="${th}">${C.plain(ENT, th, "door", false)}</g>`;
    // the painting, and the air conditioner above it
    o += R(xc - K.art.w / 2, artY0, xc + K.art.w / 2, artY1, `fill="#f4f1ea" stroke-width="${th * 1.4}"`);
    o += R(xc - K.art.w / 2 + 60, artY0 + 60, xc + K.art.w / 2 - 60, artY1 - 60, `fill="none" stroke-width="${th * 0.7}"`);
    o += R(xc - K.ac.w / 2, acY0, xc + K.ac.w / 2, acY1, `fill="#fff" stroke-width="${th * 1.3}"`);
    for (let i = 1; i < 5; i++) o += Ln(xc - K.ac.w / 2 + 30, acY0 + (K.ac.h * i) / 5, xc + K.ac.w / 2 - 30, acY0 + (K.ac.h * i) / 5, th * 0.5);
    o += `<line x1="-180" y1="${f(ey(0))}" x2="${f(L + 180)}" y2="${f(ey(0))}" stroke-width="${th * 4}"/>`;
    o += `<line x1="-180" y1="${f(ey(H))}" x2="${f(L + 180)}" y2="${f(ey(H))}" stroke-width="${th * 2}" stroke-dasharray="40 20"/>`;
    return o;
  }

  // plan: the wall in section, the step, the door swinging flat onto the bed wall
  function plan(th, dash) {
    let o = `<rect x="0" y="0" width="${f(xStep)}" height="${f(T)}" fill="url(#hatchLW)" stroke="none"/>`;
    o += `<rect x="${f(xStep)}" y="${f(-STEP)}" width="${f(L - xStep)}" height="${f(T + STEP)}" fill="url(#hatchLW)" stroke="none"/>`;
    o += `<path d="M 0 0 L ${f(xStep)} 0 L ${f(xStep)} ${f(-STEP)} L ${f(xDoor)} ${f(-STEP)}" fill="none" stroke-width="${th * 1.6}"/>`;
    o += `<path d="M 0 ${f(T)} L ${f(L)} ${f(T)}" fill="none" stroke-width="${th}"/>`;
    o += `<rect x="${f(xDoor)}" y="${f(-STEP)}" width="${f(ENT)}" height="${f(T + STEP)}" fill="#fff" stroke="none"/>`;
    o += `<line x1="${f(L)}" y1="${f(-STEP)}" x2="${f(L)}" y2="${f(-STEP - ENT)}" stroke-width="${th * 2.4}"/>`;
    o += `<path d="M ${f(L)} ${f(-STEP - ENT)} A ${ENT} ${ENT} 0 0 1 ${f(xDoor)} ${f(-STEP)}" fill="none" stroke-width="${th}" stroke-dasharray="${dash}"/>`;
    o += `<rect x="${f(xc - K.ac.w / 2)}" y="${f(-STEP - K.ac.d)}" width="${f(K.ac.w)}" height="${f(K.ac.d)}" fill="none" stroke-width="${th}" stroke-dasharray="${dash}"/>`;
    return o;
  }

  // ═════════════ SHEET ═════════════
  window.DK.begin("leftwall");
  let s = frame();
  s += `<defs><pattern id="hatchLW" patternUnits="userSpaceOnUse" width="90" height="90" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="90" stroke="#9a9a9a" stroke-width="10"/></pattern></defs>`;

  const sc = 30, ox = 40;
  s += heading(18, 17, "ELEVATION — LEFT WALL", `SCALE 1:${sc} · SEEN FROM THE ROOM · STUDY CORNER LEFT, BED CORNER RIGHT`, 118);
  const v = view(ox, 36, sc, "Left wall elevation"), th = v.w(0.12);
  s += v.g(elevation(th), 0.3);
  const yb = v.Y(ey(0));
  s += chainH([0, xc - K.art.w / 2, xc + K.art.w / 2, xStep, xDoor, L].map(v.X), yb + 5,
    [xc - K.art.w / 2, K.art.w, xStep - xc - K.art.w / 2, xDoor - xStep, ENT], { from: yb + 1, size: 1.25 });
  s += chainH([v.X(0), v.X(L)], yb + 11, [`${L} OVERALL — ${ft(L)}`], { from: yb + 1, size: 1.5 });
  s += chainV([v.Y(ey(0)), v.Y(ey(artY0)), v.Y(ey(artY1)), v.Y(ey(acY0)), v.Y(ey(acY1)), v.Y(ey(H))], v.X(L) + 6,
    [artY0, K.art.h, acY0 - artY1, K.ac.h, H - acY1], { from: v.X(L) + 1, size: 1.25 });

  const LE = labels(38, "left", 24, 98);
  LE.add(v.X(xc), v.Y(ey(K.art.centre)), "PAINTING", "SIZE AND HEIGHT TO CONFIRM");
  LE.add(v.X(xc - K.ac.w / 2), v.Y(ey(acY0 + K.ac.h / 2)), "AIR CONDITIONER", "3 FT 10 IN \u00d7 1 FT");
  LE.add(v.X(xStep), v.Y(ey(1900)), "THE STEP", "5 IN FURTHER IN PAST HERE");
  LE.add(v.X(xDoor + ENT / 2), v.Y(ey(1200)), "ENTRANCE · PLAIN CASING", "3 FT · OPENS FLAT ON THE BED WALL");
  LE.add(v.X(300), v.Y(ey(60)), "MARBLE SKIRTING", "4 IN");
  s += LE.draw();

  const scP = 30;
  s += heading(18, 150, "PLAN", `CUT AT 1200 · SCALE 1:${scP} · ROOM BELOW THE WALL`, 70);
  const vp = view(ox, 176, scP, "Left wall plan"), tp = vp.w(0.1);
  s += vp.g(plan(tp, `${vp.w(1)} ${vp.w(0.7)}`), 0.3);

  s += heading(18, 214, "NOTES", `REVISION ${K.rev.split(" ")[0]}`, 118);
  [["This wall stays plain. Paint, the marble skirting, one painting and the",
    "air conditioner over it — nothing is built into it and nothing is panelled.",
    "It is the quiet side of the room, opposite the panelled right wall, and it",
    "is the wall that carries the splay and the step, so anything fitted to it",
    "would have to be scribed twice.",
    `The painting is centred on the ${ft(xStep)} of wall before the step, the only`,
    `uninterrupted run. Centre line ${ft(xc)} from the study corner, ${ft(artY0)} off the floor.`],
   [`OPEN — the painting is drawn ${ft(K.art.w)} × ${ft(K.art.h)}, centred at ${ft(K.art.centre)}.`,
    "   Still assumed. Send the real size and it is a one-line change.",
    `   Sized to the wall it has: ${ft(acY0 - artY1)} clear under the air conditioner, and`,
    `   ${ft(K.art.w - K.ac.w)} wider than the unit, so the AC sits within its width.`,
    `The air conditioner is ${ft(K.ac.w)} × ${ft(K.ac.h)} — MEASURED. Its depth (${ft(K.ac.d)})`,
    `   and its height off the ceiling (${ft(K.ac.down)}) are still assumed.`,
    "The AC needs a power point and a drain run before the wall is painted —",
    "   decide the side the pipework leaves on.",
    "The entrance takes the PLAIN casing: same 2 in lining and 4 in moulding as",
    "   every opening, running straight across the head and stopping. The carved",
    "   head on AST-DR-011 is the DRESSING door's alone.",
    "OPEN — the profile of that 4 in plain band is not settled. Drawn flat."]]
    .forEach((col, c) => col.forEach((n, i) => (s += text(18 + c * 112, 226 + i * 4.6, n, { size: 1.6, fill: n.startsWith("OPEN") ? "#b3261e" : INK }))));

  s += titleBlock({ title: "LEFT WALL", sub: "Elevation · Plan · The plain wall", date: K.date, rev: K.rev, dwg: "AST-DR-014", scale: `1:${sc} @ A3` });
  window.DRAWINGS.leftwall = { title: "Left wall · AST-DR-014", svg: sheet(s), model: true };
})();
