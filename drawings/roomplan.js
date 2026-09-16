// Room plan — AST-DR-000. Redrawn from the lighting / false-ceiling plan (light points left out).
// Real-world mm. Plan x runs along the study wall (left → right), y runs from the study wall down to the bed wall.

window.DRAWINGS = window.DRAWINGS || {};

const ROOM = {
  rev: "0 — redrawn from the lighting plan",
  date: "17.09.2026",
  W: 4877,             // study wall, 16 ft (owner) — the plan photo reads nearer 14 ft: CONFIRM
  L: 5791,             // study wall to bed wall, ~19 ft, read from the partition being 11 ft from the bed wall: CONFIRM
  wall: 230,
  study: { d: 475, ped: 525 },                  // study wall joinery depth (from AST-DR-005)
  window: { w: 1160, fromRight: 35 },           // on the study wall (from AST-DR-005)
  desk: { w: 2286, d: 914, xc: 0.52 },          // 7 ft 6 in × 3 ft, faces the partition
  partition: { w: 2900, t: 340, fromBedWall: 3353, arm: 260, xc: 0.52 },   // 11 ft from the bed wall
  bed: { w: 1981, l: 2130, xc: 0.557 },         // 6 ft 6 in
  bedBack: { x0: 0.178, x1: 0.93, h: 720, r: 650, t: 100 },   // curved bed back wrapping the bed
  side: { w: 560, d: 450 },
  doorMain: { w: 914, fromBedWall: 0 },         // D1, left wall at the bed-wall end, swings in
  doorR1: { w: 762, y: 2030 },                  // D2, right wall
  doorR2: { w: 762, y: 3850 },                  // D3, right wall
  cove: 150,                                    // cove / false-ceiling edge offset
};

(function () {
  const { INK, THIN, DIM, f, text, view, chainH, chainV, note, heading, frame, titleBlock, sheet } = window.DK;
  const K = ROOM;

  function plan(th, dash) {
    const W = K.W, L = K.L, t = K.wall;
    const hatch = `fill="url(#hatchRP)"`;
    let o = "";
    // walls (with openings)
    const winX0 = W - K.window.fromRight - K.window.w, winX1 = W - K.window.fromRight;
    const dMain = [L - K.doorMain.w - 60, L - 60];
    const dR1 = [K.doorR1.y, K.doorR1.y + K.doorR1.w], dR2 = [K.doorR2.y, K.doorR2.y + K.doorR2.w];
    o += `<path ${hatch} d="M ${-t} ${-t} L ${winX0} ${-t} L ${winX0} 0 L 0 0 L 0 ${dMain[0]} L ${-t} ${dMain[0]} Z"/>`;         // study wall (left of window) + left wall top
    o += `<path ${hatch} d="M ${winX1} ${-t} L ${W + t} ${-t} L ${W + t} ${dR1[0]} L ${W} ${dR1[0]} L ${W} 0 L ${winX1} 0 Z"/>`;  // study wall right of window + right wall top
    o += `<rect ${hatch} x="${W}" y="${dR1[1]}" width="${t}" height="${dR2[0] - dR1[1]}"/>`;
    o += `<path ${hatch} d="M ${W} ${dR2[1]} L ${W + t} ${dR2[1]} L ${W + t} ${L + t} L ${-t} ${L + t} L ${-t} ${dMain[1]} L 0 ${dMain[1]} L 0 ${L} L ${W} ${L} Z"/>`;
    // window: frame + glass lines in the study wall
    o += `<rect x="${winX0}" y="${-t}" width="${K.window.w}" height="${t}" fill="#fff"/><g stroke-width="${th}"><line x1="${winX0}" y1="${-t / 2 - 25}" x2="${winX1}" y2="${-t / 2 - 25}"/><line x1="${winX0}" y1="${-t / 2 + 25}" x2="${winX1}" y2="${-t / 2 + 25}"/><line x1="${(winX0 + winX1) / 2}" y1="${-t / 2 - 25}" x2="${(winX0 + winX1) / 2}" y2="${-t / 2 + 25}"/></g>`;
    // doors: leaf + swing
    const leaf = (hx, hy, lx, ly, ax, ay, sweep) => `<line x1="${hx}" y1="${hy}" x2="${lx}" y2="${ly}" stroke-width="${th * 2.5}"/><path stroke-width="${th}" d="M ${lx} ${ly} A ${f(Math.hypot(lx - hx, ly - hy))} ${f(Math.hypot(lx - hx, ly - hy))} 0 0 ${sweep} ${ax} ${ay}"/>`;
    o += leaf(0, dMain[1], K.doorMain.w, dMain[1], 0, dMain[0], 0);                      // D1 swings into the room along the bed wall
    o += leaf(W, dR1[0], W + K.doorR1.w * 0.87, dR1[0] - K.doorR1.w * 0.5, W, dR1[1], 1); // D2 swings out to the right
    o += leaf(W + t, dR2[1], W + t + K.doorR2.w, dR2[1], W + t, dR2[0], 0);              // D3 swings out to the right
    // study wall joinery (dashed — cupboards 2 ft high, bookcase above)
    o += `<rect x="0" y="0" width="${W}" height="${K.study.d}" stroke-width="${th}"/>`;
    o += `<line x1="0" y1="${K.study.d - 25}" x2="${W}" y2="${K.study.d - 25}" stroke-width="${th}" stroke-dasharray="${dash}"/>`;
    // desk (faces the partition) and chair on the study side
    const dx = W * K.desk.xc - K.desk.w / 2, pBodyTop = L - K.partition.fromBedWall - K.partition.t / 2, dy = pBodyTop - K.desk.d;
    o += `<rect x="${dx}" y="${dy}" width="${K.desk.w}" height="${K.desk.d}"/><rect x="${dx + 40}" y="${dy + 40}" width="${K.desk.w - 80}" height="${K.desk.d - 80}" stroke-width="${th}"/>`;
    const cx = W * K.desk.xc;
    o += `<path stroke-width="${th}" d="M ${cx - 300} ${dy - 80} L ${cx + 300} ${dy - 80} Q ${cx + 320} ${dy - 600} ${cx} ${dy - 620} Q ${cx - 320} ${dy - 600} ${cx - 300} ${dy - 80} Z"/>`;
    // partition: body in three panels, curved arms at both ends
    const P = K.partition, px0 = W * P.xc - P.w / 2, px1 = W * P.xc + P.w / 2, py0 = pBodyTop, py1 = pBodyTop + P.t;
    o += `<rect ${hatch} x="${px0}" y="${py0}" width="${P.w}" height="${P.t}"/>`;
    [1, 2].forEach((k) => { o += `<line x1="${px0 + (P.w * k) / 3}" y1="${py0}" x2="${px0 + (P.w * k) / 3}" y2="${py1}" stroke-width="${th}"/>`; });
    [[px0, -1], [px1, 1]].forEach(([ex, m]) => {
      const out = ex + m * P.arm, a = P.arm;
      o += `<path fill="#fff" d="M ${ex} ${py0} C ${ex + m * a * 0.2} ${py0 - a * 0.1} ${out - m * a * 0.15} ${py0 - a * 0.3} ${out} ${py0 - a * 0.8} L ${out + m * 60} ${py0 - a * 0.8} C ${out + m * 60} ${py0 - a * 0.1} ${ex + m * 60} ${py0 + P.t / 2 - 40} ${ex} ${py0 + P.t / 2} C ${ex + m * 60} ${py0 + P.t / 2 + 40} ${out + m * 60} ${py1 + a * 0.1} ${out + m * 60} ${py1 + a * 0.8} L ${out} ${py1 + a * 0.8} C ${out - m * a * 0.15} ${py1 + a * 0.3} ${ex + m * a * 0.2} ${py1 + a * 0.1} ${ex} ${py1} Z"/>`;
    });
    // bed, curved bed back, bedside tables
    const B = K.bed, bx = W * B.xc - B.w / 2, by = L - B.l;
    const BB = K.bedBack, bL = W * BB.x0, bR = W * BB.x1, r = BB.r, h = BB.h, tt = BB.t;
    const u = (off) => `M ${bL + off} ${L - h} L ${bL + off} ${L - r} A ${r - off} ${r - off} 0 0 0 ${bL + r} ${L - off} L ${bR - r} ${L - off} A ${r - off} ${r - off} 0 0 0 ${bR - off} ${L - r} L ${bR - off} ${L - h}`;
    o += `<path d="${u(0)}"/><path d="${u(tt)}"/><path d="M ${bL} ${L - h} L ${bL + tt} ${L - h} M ${bR} ${L - h} L ${bR - tt} ${L - h}"/>`;
    o += `<rect x="${bx}" y="${by}" width="${B.w}" height="${B.l - tt}"/><rect x="${bx + 60}" y="${by + 60}" width="${B.w - 120}" height="${B.l - tt - 60}" stroke-width="${th}"/>`;
    o += `<path stroke-width="${th}" d="M ${bx + 150} ${L - tt - 120} L ${bx + B.w / 2 - 60} ${L - tt - 120} L ${bx + B.w / 2 - 60} ${L - tt - 480} L ${bx + 150} ${L - tt - 480} Z M ${bx + B.w / 2 + 60} ${L - tt - 120} L ${bx + B.w - 150} ${L - tt - 120} L ${bx + B.w - 150} ${L - tt - 480} L ${bx + B.w / 2 + 60} ${L - tt - 480} Z"/>`;
    o += `<line x1="${bx}" y1="${by + 700}" x2="${bx + B.w}" y2="${by + 700}" stroke-width="${th}" stroke-dasharray="${dash}"/>`;
    [[bx - K.side.w - 20, 1], [bx + B.w + 20, -1]].forEach(([sx]) => { o += `<rect x="${sx}" y="${L - tt - K.side.d}" width="${K.side.w}" height="${K.side.d}" stroke-width="${th}"/>`; });
    // cove / false-ceiling edge (above)
    o += `<rect x="${K.cove}" y="${K.study.d + K.cove / 2}" width="${W - 2 * K.cove}" height="${L - K.study.d - K.cove * 1.5}" stroke-width="${th}" stroke-dasharray="${dash}" opacity=".6"/>`;
    // beyond the right wall
    o += `<path stroke-width="${th}" stroke-dasharray="${dash}" d="M ${W + t} ${-t} L ${W + t + 1400} ${-t} M ${W + t} ${L + t} L ${W + t + 1400} ${L + t}"/>`;
    return { svg: o, desk: [dx, dy], part: [px0, py0, px1, py1], bed: [bx, by], dMain, dR1, dR2, winX0, winX1, bL, bR };
  }

  window.DK.begin("room-plan");
  let s = frame();
  s += `<defs><pattern id="hatchRP" patternUnits="userSpaceOnUse" width="60" height="60" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="60" stroke="#888" stroke-width="6"/></pattern></defs>`;
  const sc = 30, v = view(60, 52, sc, "Room plan"), th = v.w(0.12);
  const P = plan(th, `${v.w(1.2)} ${v.w(0.8)}`);
  s += heading(18, 17, "ROOM PLAN", `SCALE 1:${sc} · STUDY AT THE TOP, BED AT THE BOTTOM · LIGHT POINTS OMITTED`, 110);
  s += v.g(P.svg, 0.3);

  // dimensions
  s += chainH([v.X(0), v.X(K.W)], v.Y(-K.wall) - 6, [`${K.W} (16 FT — CONFIRM)`], { from: v.Y(-K.wall) - 1 });
  s += chainH([v.X(0), v.X(P.winX0), v.X(P.winX1), v.X(K.W)], v.Y(-K.wall) - 13, [Math.round(P.winX0), K.window.w, K.window.fromRight], { from: v.Y(-K.wall) - 7, size: 1.5 });
  s += chainV([v.Y(0), v.Y(K.L)], v.X(-K.wall) - 8, [`${K.L} (~19 FT — CONFIRM)`], { from: v.X(-K.wall) - 1 });
  s += chainV([v.Y(K.L - K.partition.fromBedWall), v.Y(K.L)], v.X(K.W + K.wall) + 10, ["11 FT PARTITION → BED WALL"], { from: v.X(K.W) + 1, size: 1.5 });
  s += chainH([v.X(P.bed[0]), v.X(P.bed[0] + K.bed.w)], v.Y(K.L + K.wall) + 7, ["6′6″ BED"], { from: v.Y(K.L) + 1, size: 1.5 });
  s += chainH([v.X(P.desk[0]), v.X(P.desk[0] + K.desk.w)], v.Y(P.desk[1]) - 3, ["7′6″ × 3′ DESK"], { from: v.Y(P.desk[1]) - 1, size: 1.4 });

  // labels
  const lab = (x, y, lx, ly, t1, t2, a) => note(v.X(x), v.Y(y), lx, ly, t1, t2, a);
  const RX = v.X(K.W + K.wall) + 22;
  s += lab(K.W * 0.25, K.study.d / 2, RX, v.Y(K.study.d / 2) + 6, "STUDY WALL", "CUPBOARDS, BOOKCASE, PILASTERS — AST-DR-005");
  s += lab((P.winX0 + P.winX1) / 2, -K.wall / 2, RX, v.Y(-K.wall) - 2, "WINDOW", "");
  s += lab(P.desk[0] + 300, P.desk[1] + 400, RX, v.Y(P.desk[1] + 450), "DESK", "FACES THE PARTITION — AST-DR-002");
  s += lab(K.W * 0.52, P.desk[1] - 350, RX, v.Y(P.desk[1] - 350), "CHAIR", "STUDY WALL BEHIND");
  s += lab(P.part[2] - 400, (P.part[1] + P.part[3]) / 2, RX, v.Y(P.part[3] + 200), "PARTITION", "CURVED ENDS, THREE PANELS");
  s += lab(P.bed[0] + K.bed.w / 2, P.bed[1] + 1100, RX, v.Y(P.bed[1] + 1100), "BED 6′6″", "");
  s += lab(P.bR - 30, K.L - 400, RX, v.Y(K.L - 400), "CURVED BED BACK", "WRAPS THE BED, BEDSIDE TABLES INSIDE");
  s += lab(0, P.dMain[0] + 200, v.X(-K.wall) - 20, v.Y(P.dMain[0] + 200), "D1 ENTRANCE", "8 × 3 FT", "end");
  s += lab(K.W + K.wall / 2, P.dR1[0] + 300, RX + 30, v.Y(P.dR1[0] + 300), "D2", "8 × 2′6″ — TO WASHROOM / DRESSING");
  s += lab(K.W + K.wall / 2, P.dR2[0] + 300, RX + 30, v.Y(P.dR2[0] + 300), "D3", "8 × 2′6″ — TO WASHROOM / DRESSING");
  s += text(v.X(K.W * 0.2), v.Y(K.study.d + 900), "STUDY", { size: 3, weight: 700, ls: 1.2, anchor: "middle", fill: THIN });
  s += text(v.X(K.W * 0.2), v.Y(K.L - 1500), "BEDROOM", { size: 3, weight: 700, ls: 1.2, anchor: "middle", fill: THIN });

  // notes
  s += heading(300, 150, "NOTES", "READ WITH THE LIGHTING PLAN", 50);
  ["Redrawn from the lighting / false-ceiling plan;", "   light points are not shown.", "Overall sizes to confirm with a tape:",
   "   study wall 16 ft (owner) vs ~14 ft on the plan.", "Dashed inner line: cove / false-ceiling edge above.", "Ceiling: barrel vault with coffered panels.",
   "Washroom and dressing beyond the right wall —", "   plan to come."]
    .forEach((n, i) => { s += text(300, 161 + i * 4.3, n, { size: 1.6 }); });
  s += titleBlock({ title: "ROOM — PLAN", sub: "Layout: study, partition, bedroom, doors", date: K.date, rev: K.rev, dwg: "AST-DR-000" });

  window.DRAWINGS["room-plan"] = { title: "Room plan · AST-DR-000", svg: sheet(s), params: ROOM };
})();
