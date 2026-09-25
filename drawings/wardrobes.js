// Dressing room wardrobes — developed elevation, AST-DR-025.
// The three walls unfolded in the order you meet them walking in: LEFT wall, BACK wall (the mirror),
// RIGHT wall. Doors are the briefed ones — blackened steel T-section, white textured glass in linear
// lead came, lit from inside, brass bar pulls, transom band across the top (see the Wardrobes brief).
// Real-world units are mm. In each elevation x runs along that wall and y is measured UP from the floor.

window.DRAWINGS = window.DRAWINGS || {};

const WDR = {
  rev: "1 — first setting out of the bays, off the owner's 2 ft 3 in depth and 3 ft bay",
  date: "25.09.2026",
  W: 2819,          // 9 ft 3 in — the room across, wall to wall
  D: 3759,          // 12 ft 4 in — the room deep, back wall to bedroom wall
  depth: 686,       // 2 ft 3 in — carcase depth, set by the owner so it clears the door frame by 1 in
  H: 2743,          // 9 ft 0 in — top of the wardrobe
  ceil: 2769,       // 9 ft 1 in — the plain ceiling over both these walls
  transom: 560,     // transom bar this far below the top, per the Wardrobes brief (ref. 2)
  fr: 38,           // blackened steel T-section, 38 face
  pull: { y: 1050, len: 300 },   // brass bar pulls
  leftRun: 2845,    // 9 ft 4 in of the left wall before the bathroom door
  nLeft: 3, nRight: 4,
  d3zone: 914,      // 3 ft 0 in left over on the left wall for the bathroom door — leaf still open
  tun: 914,         // 3 ft 0 in — the tunnel behind the hidden door
  mirror: 1067,     // 3 ft 6 in across, wings at 45° — CONFIRMED, free-standing, NOT fixed to either run. Centred in the
                    // clear corridor between the two runs, not spanning it — see AST-DR-026.
};

(function () {
  const { INK, THIN, f, text, view, chainH, chainV, labels, heading, frame, titleBlock, sheet } = window.DK;
  const K = WDR;
  const STEEL = "#2a2a2a", GLASS = "#f4f1ea", BRASS = "#8a6a2f", RED = "#b3261e";

  const ey = (y) => K.ceil - y;                       // floor at the bottom
  const R = (x0, y0, x1, y1, a = "") => `<rect x="${f(x0)}" y="${f(ey(y1))}" width="${f(x1 - x0)}" height="${f(y1 - y0)}" ${a}/>`;

  // one glazed leaf: steel frame, leaded glass, brass pull
  function leaf(x0, w, y0, y1, th, hand) {
    const F = K.fr;
    let o = R(x0, y0, x0 + w, y1, `fill="${GLASS}" stroke="none"`);
    // linear lead came — verticals at thirds, horizontals on a regular course
    o += `<g stroke="${THIN}" stroke-width="${th * 0.55}" fill="none">`;
    for (let i = 1; i <= 2; i++) o += `<line x1="${f(x0 + (w * i) / 3)}" y1="${f(ey(y1))}" x2="${f(x0 + (w * i) / 3)}" y2="${f(ey(y0))}"/>`;
    for (let y = y0 + 380; y < y1 - 80; y += 380) o += `<line x1="${f(x0)}" y1="${f(ey(y))}" x2="${f(x0 + w)}" y2="${f(ey(y))}"/>`;
    o += `</g>`;
    // the steel frame round the leaf
    o += R(x0, y0, x0 + w, y1, `fill="none" stroke="${STEEL}" stroke-width="${th * 1.6}"`);
    o += R(x0 + F, y0 + F, x0 + w - F, y1 - F, `fill="none" stroke="${STEEL}" stroke-width="${th * 0.8}"`);
    // brass bar pull, always on the meeting stile — "L" is the left leaf of the pair
    const px = hand === "L" ? x0 + w - 70 : x0 + 70;
    const tall = y1 - y0 > 900;
    const py = tall ? K.pull.y : (y0 + y1) / 2, plen = tall ? K.pull.len : 200;
    o += `<line x1="${f(px)}" y1="${f(ey(py - plen / 2))}" x2="${f(px)}" y2="${f(ey(py + plen / 2))}" stroke="${BRASS}" stroke-width="${th * 2.6}" stroke-linecap="round"/>`;
    return o;
  }

  // one bay: a pair of doors below, a pair of transom lights above
  function bay(x0, w, th) {
    const tY = K.H - K.transom, half = w / 2;
    let o = "";
    o += leaf(x0, half, 0, tY, th, "L");
    o += leaf(x0 + half, half, 0, tY, th, "R");
    o += leaf(x0, half, tY, K.H, th, "L");
    o += leaf(x0 + half, half, tY, K.H, th, "R");
    return o;
  }

  // a run of n equal bays across `len`
  function run(x0, len, n, th) {
    const w = len / n;
    let o = "";
    for (let i = 0; i < n; i++) o += bay(x0 + i * w, w, th);
    // the top: cornice line and the gap to the ceiling
    o += R(x0, K.H, x0 + len, K.H + 26, `fill="none" stroke="${THIN}" stroke-width="${th * 0.7}" stroke-dasharray="${th * 4} ${th * 3}"`);
    return o;
  }

  const grid = (x0, x1, th) => `<line x1="${f(x0)}" y1="${f(ey(0))}" x2="${f(x1)}" y2="${f(ey(0))}" stroke="${INK}" stroke-width="${th * 2.2}"/>` +
    `<line x1="${f(x0)}" y1="${f(ey(K.ceil))}" x2="${f(x1)}" y2="${f(ey(K.ceil))}" stroke="${INK}" stroke-width="${th * 1.2}"/>`;

  window.DK.begin("wardrobes");
  let s = frame();
  const sc = 40, oyE = 44, gap = 12;
  const oxL = 66, oxB = oxL + K.D / sc + gap, oxR = oxB + K.W / sc + gap;
  const vL = view(oxL, oyE, sc, "Left wall"), vB = view(oxB, oyE, sc, "Back wall"), vR = view(oxR, oyE, sc, "Right wall");
  const th = vL.w(0.12);

  s += heading(18, 18, "DRESSING ROOM — THE WARDROBES", `DEVELOPED ELEVATION · 1:${sc} · THE THREE WALLS UNFOLDED, LEFT TO RIGHT AS YOU WALK IN`, 210);

  // ── LEFT WALL: the bathroom door first, then 3 bays running back to the corner
  s += vL.g(
    grid(0, K.D, th) +
    // the bathroom door zone
    R(0, 0, K.d3zone, 2311, `fill="#fff" stroke="${INK}" stroke-width="${th * 1.4}"`) +
    run(K.d3zone, K.leftRun, K.nLeft, th), 0.3);

  // ── BACK WALL: the two run ends, and the mirror standing FREE between them — not spanning the gap,
  // not touching either run. Centred in the corridor, with clear floor both sides of it.
  const corridor = K.W - 2 * K.depth, mW = K.mirror, mx = K.depth + (corridor - mW) / 2;
  const ctr = 750, wing = (mW - ctr) / 2;   // centre frame 2 ft 5½ in; the wings, turned 45°, read narrow from the front
  s += vB.g(
    grid(0, K.W, th) +
    R(0, 0, K.depth, K.H, `fill="#e9e5dc" stroke="${STEEL}" stroke-width="${th * 1.6}"`) +
    R(K.W - K.depth, 0, K.W, K.H, `fill="#e9e5dc" stroke="${STEEL}" stroke-width="${th * 1.6}"`) +
    // the mirror — three panels, 9 ft tall, free-standing, centred
    [[mx, wing], [mx + wing, ctr], [mx + wing + ctr, wing]].map(([x, w]) =>
      R(x, 0, x + w, K.H, `fill="#dfe4e6" stroke="${STEEL}" stroke-width="${th * 1.4}"`) +
      R(x + 55, 90, x + w - 55, K.H - 55, `fill="none" stroke="${STEEL}" stroke-width="${th * 0.7}"`)).join("") +
    // the stepped foot rail
    R(mx, 0, mx + mW, 90, `fill="#cfd4d6" stroke="${STEEL}" stroke-width="${th * 1.2}"`) +
    // the clear floor either side — dashed, so it reads as space, not wall
    `<line x1="${f(K.depth)}" y1="${f(ey(4))}" x2="${f(mx)}" y2="${f(ey(4))}" stroke="${RED}" stroke-width="${th * 0.6}" stroke-dasharray="${th * 3} ${th * 2}"/>` +
    `<line x1="${f(mx + mW)}" y1="${f(ey(4))}" x2="${f(K.W - K.depth)}" y2="${f(ey(4))}" stroke="${RED}" stroke-width="${th * 0.6}" stroke-dasharray="${th * 3} ${th * 2}"/>`, 0.3);

  // ── RIGHT WALL: the hidden tunnel door at the back corner, then 3 bays to the bedroom wall
  s += vR.g(grid(0, K.D, th) + run(0, K.D, K.nRight, th), 0.3);

  // ── text on the views (paper scale — inside a view group it would be drawn 1/sc size)
  s += text(vL.X(K.d3zone / 2), vL.Y(ey(1150)), "D3", { size: 3, anchor: "middle", weight: 700, fill: THIN });
  s += text(vB.X(K.depth / 2), vB.Y(ey(K.H / 2)), "RUN END", { size: 1.7, anchor: "middle", fill: THIN, rot: true });
  s += text(vB.X(K.W - K.depth / 2), vB.Y(ey(K.H / 2)), "RUN END", { size: 1.7, anchor: "middle", fill: THIN, rot: true });
  [[vL, K.d3zone, K.leftRun, K.nLeft, ["1", "2", "3"]], [vR, 0, K.D, K.nRight, ["T", "1", "2", "3"]]]
    .forEach(([vw, x0, len, n, tags]) => tags.forEach((t, i) =>
      (s += text(vw.X(x0 + (i + 0.5) * (len / n)), vw.Y(ey(150)), t, { size: 2, anchor: "middle", weight: 700, fill: t === "T" ? RED : THIN }))));

  // ── dimensions
  const yb = vL.Y(ey(0)) + 7;
  s += chainH([vL.X(0), vL.X(K.d3zone), vL.X(K.D)], yb, [`${K.d3zone} D3`, `${K.leftRun} — ${K.nLeft} BAYS`], { from: vL.Y(ey(0)), size: 1.3 });
  s += chainH([vL.X(K.d3zone), ...Array.from({ length: K.nLeft }, (_, i) => vL.X(K.d3zone + ((i + 1) * K.leftRun) / K.nLeft))], yb + 7,
    Array.from({ length: K.nLeft }, () => `${Math.round(K.leftRun / K.nLeft)}`), { from: yb + 3, size: 1.2 });
  s += chainH([vB.X(0), vB.X(K.depth), vB.X(mx), vB.X(mx + mW), vB.X(K.W - K.depth), vB.X(K.W)], yb,
    [`${K.depth}`, `${Math.round(mx - K.depth)} CLEAR`, `${mW} MIRROR`, `${Math.round(K.W - K.depth - mx - mW)} CLEAR`, `${K.depth}`],
    { from: vB.Y(ey(0)), size: 1.2 });
  s += chainH([vR.X(0), ...Array.from({ length: K.nRight }, (_, i) => vR.X(((i + 1) * K.D) / K.nRight))], yb,
    Array.from({ length: K.nRight }, () => `${Math.round(K.D / K.nRight)}`), { from: vR.Y(ey(0)), size: 1.2 });
  s += chainH([vR.X(0), vR.X(K.D)], yb + 7, [`${K.D} — ${K.nRight} BAYS, ONE OF THEM THE TUNNEL`], { from: yb + 3, size: 1.4 });
  s += chainV([vL.Y(ey(K.ceil)), vL.Y(ey(K.H)), vL.Y(ey(K.H - K.transom)), vL.Y(ey(0))], vL.X(0) - 6,
    ["", `${K.transom} TRANSOM`, `${K.H - K.transom} DOOR`], { from: vL.X(0) - 1, size: 1.2 });
  s += chainV([vL.Y(ey(K.ceil)), vL.Y(ey(0))], vL.X(0) - 13, [`${K.ceil} CEILING`], { from: vL.X(0) - 9, size: 1.4 });

  // view captions
  [[vL, K.D / 2, "LEFT WALL"], [vB, K.W / 2, "BACK WALL"], [vR, K.D / 2, "RIGHT WALL"]]
    .forEach(([vw, xm, t]) => { s += text(vw.X(xm), 36, t, { size: 2.3, anchor: "middle", weight: 700, ls: 0.4 }); });
  s += text(vL.X(K.D / 2), 39.4, "BATHROOM DOOR, THEN 3 BAYS", { size: 1.5, anchor: "middle", fill: THIN });
  s += text(vB.X(K.W / 2), 39.4, "THE MIRROR, BACK TO THE WALL", { size: 1.5, anchor: "middle", fill: THIN });
  s += text(vR.X(K.D / 2), 39.4, "4 BAYS — THE FAR ONE IS THE TUNNEL", { size: 1.5, anchor: "middle", fill: THIN });

  // ── key plan, bottom left
  const scP = 80, vP = view(26, 146, scP, null);
  s += vP.g(
    `<rect x="0" y="0" width="${K.W}" height="${K.D}" fill="none" stroke="${INK}" stroke-width="${th * scP * 0.04}"/>` +
    `<rect x="0" y="0" width="${K.depth}" height="${K.leftRun}" fill="#e9e5dc" stroke="none"/>` +
    `<rect x="${K.W - K.depth}" y="0" width="${K.depth}" height="${K.D}" fill="#e9e5dc" stroke="none"/>` +
    `<rect x="${K.W - K.depth}" y="0" width="${K.depth}" height="${K.tun}" fill="#fff8ee" stroke="none"/>` +
    `<rect x="${mx}" y="0" width="${mW}" height="70" fill="#dfe4e6" stroke="none"/>`, 0.4);
  s += text(26, 142, "KEY PLAN", { size: 1.9, weight: 700, ls: 0.3 });
  s += text(26 + K.W / scP / 2, 146 + K.D / scP + 4, "MIRROR AT THE TOP · FREE-STANDING", { size: 1.35, anchor: "middle", fill: THIN });

  // ── the count, as a table
  const tx = 92, ty = 146, rows = [
    ["", "BAYS", "DOORS BELOW", "DOORS ABOVE", "BAY WIDTH"],
    ["LEFT WALL", `${K.nLeft}`, `${K.nLeft * 2}`, `${K.nLeft * 2}`, `${Math.round(K.leftRun / K.nLeft)} · 3 FT 1 IN`],
    ["RIGHT WALL", `${K.nRight}`, `${K.nRight * 2}`, `${K.nRight * 2}`, `${Math.round(K.D / K.nRight)} · 3 FT 1 IN`],
    ["— of which tunnel", "1", "2", "—", "the far bay, right"],
    ["TOTAL", `${K.nLeft + K.nRight}`, `${(K.nLeft + K.nRight) * 2}`, `${(K.nLeft + K.nRight) * 2}`, "28 leaves in all"],
  ];
  const colx = [0, 46, 66, 96, 126];
  rows.forEach((r, i) => {
    const y = ty + i * 6.4, hd = i === 0, tot = r[0] === "TOTAL";
    s += `<line x1="${tx}" y1="${f(y + 1.6)}" x2="${tx + 186}" y2="${f(y + 1.6)}" stroke="${hd || tot ? INK : "#ddd"}" stroke-width="${hd || tot ? 0.3 : 0.15}"/>`;
    r.forEach((c, j) => { if (c) s += text(tx + colx[j], y, c, { size: hd ? 1.35 : 1.7, weight: hd || tot ? 700 : 400, fill: hd ? THIN : (r[0].startsWith("—") ? RED : INK), ls: hd ? 0.2 : 0 }); });
  });
  s += text(tx, ty - 8, "WHAT THAT COMES TO", { size: 1.9, weight: 700, ls: 0.3 });

  const LG = labels(46, "left", 50, 118), RG = labels(356, "right", 50, 118);
  LG.add(vL.X(K.d3zone / 2), vL.Y(ey(1900)), "D3 · BATHROOM DOOR", "3 FT ZONE · LEAF NOT YET FIXED");
  LG.add(vL.X(K.d3zone + 300), vL.Y(ey(K.H - K.transom / 2)), "TRANSOM BAND", "OPENS — SO IT STORES");
  RG.add(vR.X(K.D - 200), vR.Y(ey(1050)), "BRASS BAR PULL", "ON EVERY LEAF");
  RG.add(vR.X(470), vR.Y(ey(1600)), "THE HIDDEN DOOR", "BAY T · SAME DOORS · SHELVED BEHIND");
  RG.add(vB.X(K.W / 2), vB.Y(ey(2400)), "THE MIRROR", "9 FT TALL · FREE-STANDING · NOT FIXED EITHER SIDE");
  s += LG.draw() + RG.draw();

  s += heading(18, 226, "NOTES", `REVISION ${K.rev.split(" ")[0]}`, 210);
  [["Depth 2 ft 3 in, as instructed. On the right that is what lets the run reach the bedroom wall: the",
    "   door frame stands 2 ft 4 in off that corner, so the end of the run clears it by 1 in.",
    "Bays are the wall divided equally, so nothing is left over and there are no filler strips: the right",
    "   wall is 12 ft 4 in over 4 bays, the left is 9 ft 4 in over 3. Both come out at about 3 ft 1 in —",
    "   an inch over the 3 ft you asked for, which is what makes them land exactly.",
    "Each bay is a pair of doors with a pair of transom lights over, all glazed and all opening — so the",
    "   transom is storage, not just a band of glass. 7 bays, 14 cupboards, 28 leaves.",
    "Doors as the Wardrobes brief: blackened steel T-section, 38 face, white textured glass in linear",
    "   lead came, lit from inside, brass bar pulls, transom bar 560 down from the top."],
   ["SETTLED — the mirror is a trifold, 3 ft 6 in across with its wings at 45°, free-standing and fixed",
    "   to neither run. Centred in the 4 ft 9 in gap it leaves 7½ in of floor either side, and it is 9 ft tall —",
    "   level with the top of the wardrobes. That narrow gap is why the two end bays cannot hinge open",
    "   in the ordinary way — see AST-DR-026 for the fold-slide doors that solve it.",
    "OPEN — D3, the bathroom door. 3 ft of wall is left for it, but the leaf is still not fixed. It is",
    "   drawn as an opening only.",
    "OPEN — the tunnel bay reads as one more cupboard, but it is a door onto a passage, so the",
    "   transom over it cannot be storage in the ordinary way. Decide whether it is a dummy.",
    "OPEN — 4 ft 9 in is what you are left standing in once both runs are built. Open one 1 ft 6 in",
    "   leaf and there is still 3 ft 3 in. Workable, not generous — worth feeling on site first."]]
    .forEach((col, c) => col.forEach((n, i) => (s += text(18 + c * 172, 238 + i * 4.6, n, { size: 1.6, fill: n.startsWith("OPEN") ? RED : INK }))));

  s += titleBlock({ title: "THE WARDROBES", sub: "Dressing room · developed elevation", date: K.date, rev: K.rev, dwg: "AST-DR-025", scale: `1:${sc} @ A3` });
  window.WDR = WDR;
  window.DRAWINGS.wardrobes = { title: "The wardrobes — developed elevation · AST-DR-025", svg: sheet(s), model: true };
})();
