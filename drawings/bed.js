// Bed, headboard and partition, set out together — AST-DR-013.
// The bed back is the partition's shape brought to the bed wall: a straight run behind the bed and
// a curl at each end turning forward into the room, the bedside ledges tucked inside the curls.
// Both pieces are 8 ft and are set out from the RIGHT wall, the straight one, so they line up
// exactly; the left wall splays and would put them out of line.
// Plan coordinates as AST-DR-000: x across (0 = left wall at the study end), y from the study wall
// towards the bed wall; z up from the floor. Real-world units are mm.

window.DRAWINGS = window.DRAWINGS || {};

const BEDPLAN = {
  rev: "5 — the bed's clearance to each wall, splay included",
  date: "20.09.2026",
  gapR: 889,                       // 2 ft 11 in from the right wall to both pieces (3 ft 5 in, less the 6 in move)
  width: 2438,                     // 8 ft — partition and bed back alike
  bed: { w: 1829, l: 1829, base: 330, matt: 250 },   // 6 ft x 6 ft, MEASURED; the heights still ASSUMED
  back: { h: 1372, t: 50, rc: 90, d: 610 },          // bed back 4 ft 6 tall ASSUMED; the curls reach 2 ft forward
  ledge: { h: 600, gap: 12 },      // bedside ledges inside the curls, 2 ft high
  door: 914,
};

(function () {
  const { INK, THIN, f, text, mmToFt, view, chainH, chainV, heading, frame, titleBlock, sheet } = window.DK;
  const K = BEDPLAN, S = window.SHELL, G = window.PGEOM;
  const ft = (mm) => mmToFt(mm).replace("'-", " ft ").replace('"', " in").replace(/^0 ft /, "");

  // ── the room, from AST-DR-000 ──
  const xR = S.wStudy, L = S.lRight, T = S.t, yPart = S.yPart, yStep = S.yStep, H = S.H;
  const xLs = S.wStudy - S.wPreStep, xLb = S.wStudy - S.wBed;
  const leftAt = (y) => (y <= yStep ? (xLs * y) / yStep : xLb);

  // ── the setting-out: everything measured off the right wall ──
  const xPR = xR - K.gapR, xPL = xPR - K.width, xc = (xPL + xPR) / 2;
  const B = K.bed, BK = K.back;
  const xBR = xPR - (K.width - B.w) / 2, xBL = xBR - B.w;
  const yHead = L - BK.t;                                    // face of the bed back, where the bed's head stops
  const doorEnd = xLb + K.door;

  // ── plan shapes ──
  // the partition's centreline, as AST-DR-010 draws it: a straight middle and two arcs turning to the bed
  const TH = Math.acos(1 - G.PROJ / G.R), halfStraight = K.width / 2 - G.R * Math.sin(TH);
  const partLine = (() => {
    const p = [], N = 20;
    for (let i = N; i >= 0; i--) { const t = -Math.PI / 2 - TH * (i / N); p.push([xc - halfStraight + G.R * Math.cos(t), yPart + G.R + G.R * Math.sin(t)]); }
    for (let i = 0; i <= N; i++) { const t = -Math.PI / 2 + TH * (i / N); p.push([xc + halfStraight + G.R * Math.cos(t), yPart + G.R + G.R * Math.sin(t)]); }
    return p;
  })();
  // the bed back's centreline: forward from the left curl, tight arc, straight behind the bed, arc, forward
  const backLine = (() => {
    const c = BK.t / 2, r = BK.rc, p = [], N = 12;
    p.push([xPL + c, L - BK.d]);
    for (let i = 0; i <= N; i++) { const a = Math.PI - (Math.PI / 2) * (i / N); p.push([xPL + c + r + r * Math.cos(a), L - c - r + r * Math.sin(a)]); }
    for (let i = 0; i <= N; i++) { const a = Math.PI / 2 - (Math.PI / 2) * (i / N); p.push([xPR - c - r + r * Math.cos(a), L - c - r + r * Math.sin(a)]); }
    p.push([xPR - c, L - BK.d]);
    return p;
  })();
  // a centreline thickened into a closed ring, with its curved edges flagged for the 3D
  function band(line, t, straightIdx) {
    const n = line.length, L1 = [], R1 = [];
    for (let i = 0; i < n; i++) {
      const a = line[Math.max(0, i - 1)], b = line[Math.min(n - 1, i + 1)], dx = b[0] - a[0], dy = b[1] - a[1], m = Math.hypot(dx, dy) || 1;
      const nx = -dy / m, ny = dx / m;
      L1.push([line[i][0] + nx * t / 2, line[i][1] + ny * t / 2]); R1.push([line[i][0] - nx * t / 2, line[i][1] - ny * t / 2]);
    }
    const ring = [...L1, ...R1.reverse()];
    const curved = ring.map((_, i) => {
      const k = i < n ? i : 2 * n - 2 - i;                   // which centreline segment this edge follows
      return i !== n - 1 && i !== 2 * n - 1 && !straightIdx(k);
    });
    return { ring, curved };
  }
  const partBand = band(partLine, G.thick, (k) => k === 20);
  const backBand = band(backLine, BK.t, (k) => k === 0 || k === 13 || k === 26);
  const box = (x0, y0, x1, y1) => ({ ring: [[x0, y0], [x1, y0], [x1, y1], [x0, y1]], curved: [false, false, false, false] });
  const ledgeL = [xPL + BK.t + 5, xBL - K.ledge.gap], ledgeR = [xBR + K.ledge.gap, xPR - BK.t - 5];
  const ledgeY = [L - BK.d + 20, L - BK.t - BK.rc - 30];
  const tvY = yPart + G.thick / 2;
  const tv = { w: G.tv.w, h: G.tv.h, z0: H / 2 - G.tv.h / 2 };

  // ══════════ THE 3D ══════════
  // Isometric views from four corners of the bedroom. Each view drops whatever would stand
  // between you and the room, and keeps only the walls behind.
  function scene(keep) {
    const s = [], add = (r, z0, z1) => s.push({ ring: r.ring, curved: r.curved, z0, z1 });
    add(box(xLb - 60, yPart - 700, xR + 60, L), -40, 0);                         // the floor
    if (keep.partition) { add(partBand, 0, H); add(box(xc - tv.w / 2, tvY, xc + tv.w / 2, tvY + 45), tv.z0, tv.z0 + tv.h); }
    add(backBand, 0, BK.h);
    [ledgeL, ledgeR].forEach(([a, b]) => add(box(a, ledgeY[0], b, ledgeY[1]), 0, K.ledge.h));
    add(box(xBL, yHead - B.l, xBR, yHead), 0, B.base);
    add(box(xBL + 25, yHead - B.l + 25, xBR - 25, yHead), B.base, B.base + B.matt);
    if (keep.bedWall) add(box(xLb - T, L, xR + T, L + T), 0, H);
    if (keep.rightWall) add(box(xR, yPart - 700, xR + T, L + T), 0, H);
    if (keep.leftWall) {
      add(box(xLb - T, yStep, xLb, L - K.door), 0, H);
      add(box(xLb - T, L - K.door, xLb, L), 2311, H);                         // over the entrance
    }
    return s;
  }
  const ROT = { id: (x, y) => [x, y], cw: (x, y) => [y, -x], half: (x, y) => [-x, -y], ccw: (x, y) => [-y, x] };
  function axo(keep, rot, scale) {
    const r = ROT[rot], solids = scene(keep).map((q) => ({ ...q, ring: q.ring.map(([x, y]) => r(x, y)) }));
    return window.ISO.render({ faces: window.ISO.build(solids, []), beads: [], lines: [] }, { scale, eps: 0.35, lineScale: 0.9 });
  }
  const VIEWS = [
    { t: "A · FROM THE DOOR", sub: "STANDING AT THE ENTRANCE, LOOKING IN", keep: { partition: 1, rightWall: 1 }, rot: "half" },
    { t: "B · BED TO PARTITION", sub: "FROM THE BED, LOOKING AT THE TV", keep: { partition: 1, leftWall: 1 }, rot: "cw" },
    { t: "C · PARTITION TO BED", sub: "FROM THE PARTITION, LOOKING AT THE BED", keep: { bedWall: 1, leftWall: 1 }, rot: "id" },
    { t: "D · FROM THE STUDY", sub: "THE PARTITION'S BACK, THE BED BEYOND", keep: { partition: 1, bedWall: 1, rightWall: 1 }, rot: "ccw" },
  ];

  // ══════════ SHEET ══════════
  window.DK.begin("bed");
  let s = frame();
  s += `<defs><pattern id="hatchBD" patternUnits="userSpaceOnUse" width="90" height="90" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="90" stroke="#9a9a9a" stroke-width="10"/></pattern></defs>`;

  // ── PLAN 1:40 ──
  const Y0 = yPart - 700, sc = 50;
  s += heading(18, 17, "PLAN — BED AND PARTITION", `SCALE 1:${sc} · BOTH 8 FT · SET OUT FROM THE RIGHT WALL`, 118);
  const v = view(30 - (xLb - T) / sc, 42 - Y0 / sc, sc, "Bed and partition plan"), th = v.w(0.12);
  const P = (x, y) => `${f(x)} ${f(y)}`;
  const ringPath = (r) => "M " + r.map(([x, y]) => P(x, y)).join(" L ") + " Z";
  let g = "";
  // walls: right, bed, and the left wall with the entrance at its end
  const innerPts = [[xR, Y0], [xR, L], [xLb, L], [xLb, yStep], [xLs, yStep], [leftAt(Y0), Y0]];
  const outerPts = [[xR + T, Y0], [xR + T, L + T], [xLb - T, L + T], [xLb - T, yStep], [xLs - T, yStep], [leftAt(Y0) - T, Y0]];
  const poly = (pts) => "M " + pts.map(([x, y]) => P(x, y)).join(" L ");
  g += `<path d="${poly([...outerPts, ...innerPts.slice().reverse()])} Z" fill="url(#hatchBD)" stroke="none"/>`;
  g += `<path d="${poly(innerPts)}" fill="none" stroke-width="${th * 1.6}"/><path d="${poly(outerPts)}" fill="none" stroke-width="${th}"/>`;
  g += `<rect x="${f(xLb - T)}" y="${f(L - K.door)}" width="${f(T)}" height="${f(K.door)}" fill="#fff" stroke="none"/>`;
  g += `<line x1="${f(xLb)}" y1="${f(L)}" x2="${f(doorEnd)}" y2="${f(L)}" stroke-width="${th * 3}"/>`;
  g += `<path d="M ${P(doorEnd, L)} A ${K.door} ${K.door} 0 0 0 ${P(xLb, L - K.door)}" fill="none" stroke-width="${th}" stroke-dasharray="${th * 8} ${th * 6}"/>`;
  // partition, TV, bed back, ledges, bed
  g += `<path d="${ringPath(partBand.ring)}" fill="#dcd6cc" stroke-width="${th * 1.3}"/>`;
  g += `<rect x="${f(xc - tv.w / 2)}" y="${f(tvY)}" width="${f(tv.w)}" height="45" fill="#151515" stroke="none"/>`;
  g += `<path d="${ringPath(backBand.ring)}" fill="#dcd6cc" stroke-width="${th * 1.3}"/>`;
  [ledgeL, ledgeR].forEach(([a, b]) => (g += `<rect x="${f(a)}" y="${f(ledgeY[0])}" width="${f(b - a)}" height="${f(ledgeY[1] - ledgeY[0])}" fill="#fff" stroke-width="${th}"/>`));
  g += `<rect x="${f(xBL)}" y="${f(yHead - B.l)}" width="${f(B.w)}" height="${f(B.l)}" fill="#fff" stroke-width="${th * 1.3}"/>`;
  g += `<rect x="${f(xBL + 25)}" y="${f(yHead - B.l + 25)}" width="${f(B.w - 50)}" height="${f(B.l - 25)}" fill="none" stroke-width="${th * 0.6}"/>`;
  g += `<line x1="${f(xBL + 25)}" y1="${f(yHead - 600)}" x2="${f(xBR - 25)}" y2="${f(yHead - 600)}" stroke-width="${th * 0.6}"/>`;
  s += v.g(g, 0.3);
  // the alignment: the two lines both pieces stand on
  [xPL, xPR].forEach((x) => (s += `<line x1="${f(v.X(x))}" y1="${f(v.Y(yPart - 380))}" x2="${f(v.X(x))}" y2="${f(v.Y(L + T) + 3)}" stroke="#1e8449" stroke-width="0.25" stroke-dasharray="2 1.4"/>`));
  s += text(v.X(xc), v.Y(yPart) - 2.2, "TV — 4 FT ½ IN", { size: 1.5, anchor: "middle", fill: THIN });
  s += text(v.X(xc), v.Y(yHead - B.l / 2), "BED 6 FT \u00d7 6 FT", { size: 2.2, anchor: "middle", ls: 0.3 });
  // dimension chains, feet and inches
  s += chainH([v.X(leftAt(yPart)), v.X(xPL), v.X(xPR), v.X(xR)], v.Y(yPart - 420), [xPL - leftAt(yPart), K.width, K.gapR], { from: v.Y(yPart - 380), size: 1.4 });
  const yFoot = yHead - B.l;
  s += chainH([v.X(leftAt(yFoot)), v.X(xBL), v.X(xBR), v.X(xR)], v.Y(yFoot) - 5, [xBL - leftAt(yFoot), B.w, xR - xBR], { from: v.Y(yFoot) - 1, size: 1.4 });
  s += chainH([v.X(xLb), v.X(doorEnd), v.X(xPL), v.X(xPR), v.X(xR)], v.Y(L + T) + 6, [K.door, xPL - doorEnd, K.width, K.gapR], { from: v.Y(L + T) + 1, size: 1.4 });
  s += text(v.X(xLb), v.Y(L + T) + 10.5, "BED WALL · FIRST FIGURE IS THE ENTRANCE DOOR, OPEN FLAT", { size: 1.4, fill: THIN });
  s += text(v.X(leftAt(yPart)), v.Y(yPart - 420) + 4.2, "AT THE PARTITION LINE", { size: 1.4, fill: THIN });

  // ── BED BACK, FRONT ELEVATION 1:25 ──
  const se = 25, e = view(24 - xPL / se, 156 + BK.h / se, se, "Bed back elevation"), te = e.w(0.12);
  s += heading(18, 143, "BED BACK — FROM THE FOOT OF THE BED", `ELEVATION · 1:${se} · THE CURLS SEEN END-ON`, 118);
  const Z = (z) => -z;                                       // elevation y is up
  let eg = `<rect x="${f(xPL)}" y="${f(Z(BK.h))}" width="${f(K.width)}" height="${f(BK.h)}" fill="#f1ede6" stroke-width="${te * 1.5}"/>`;
  [[xPL, xPL + BK.t, xPL + BK.t / 2 + BK.rc], [xPR - BK.t, xPR, xPR - BK.t / 2 - BK.rc]].forEach(([a, b, tan]) => {
    eg += `<rect x="${f(a)}" y="${f(Z(BK.h))}" width="${f(b - a)}" height="${f(BK.h)}" fill="#e2dccf" stroke-width="${te * 1.2}"/>`;
    eg += `<line x1="${f(tan)}" y1="${f(Z(BK.h))}" x2="${f(tan)}" y2="${f(Z(0))}" stroke-width="${te * 0.5}" stroke-dasharray="${te * 10} ${te * 7}"/>`;
  });
  [ledgeL, ledgeR].forEach(([a, b]) => (eg += `<rect x="${f(a)}" y="${f(Z(K.ledge.h))}" width="${f(b - a)}" height="${f(K.ledge.h)}" fill="#fff" stroke-width="${te}"/>`));
  eg += `<rect x="${f(xBL)}" y="${f(Z(B.base))}" width="${f(B.w)}" height="${f(B.base)}" fill="#fff" stroke-width="${te * 1.2}"/>`;
  eg += `<rect x="${f(xBL + 25)}" y="${f(Z(B.base + B.matt))}" width="${f(B.w - 50)}" height="${f(B.matt)}" fill="#fff" stroke-width="${te}"/>`;
  eg += `<line x1="${f(xPL - 300)}" y1="0" x2="${f(xPR + 300)}" y2="0" stroke-width="${te * 3}"/>`;
  s += e.g(eg, 0.3);
  s += chainH([e.X(xPL), e.X(xBL), e.X(xBR), e.X(xPR)], e.Y(0) + 6, [xBL - xPL, B.w, xPR - xBR], { from: e.Y(0) + 1, size: 1.3 });
  s += chainH([e.X(xPL), e.X(xPR)], e.Y(0) + 12, [K.width], { from: e.Y(0) + 1, size: 1.3 });
  s += chainV([e.Y(Z(0)), e.Y(Z(K.ledge.h)), e.Y(Z(BK.h))], e.X(xPR) + 6, [K.ledge.h, BK.h - K.ledge.h], { from: e.X(xPR) + 1, size: 1.3 });

  // ── FOUR VIEWS ──
  const cells = [[150, 20], [281, 20], [150, 128], [281, 128]], CW = 124, CHt = 100;
  VIEWS.forEach((V, i) => {
    let r = axo(V.keep, V.rot, 60);
    const k = Math.max((r.bbox[2] - r.bbox[0]) / CW, (r.bbox[3] - r.bbox[1]) / (CHt - 14));
    if (k > 1 || k < 0.85) r = axo(V.keep, V.rot, 60 * k);
    const [cx0, cy0] = cells[i], w = r.bbox[2] - r.bbox[0], h = r.bbox[3] - r.bbox[1];
    s += heading(cx0, cy0, V.t, V.sub, CW);
    s += `<g transform="translate(${f(cx0 + (CW - w) / 2 - r.bbox[0])} ${f(cy0 + 12 + (CHt - 14 - h) / 2 - r.bbox[1])})">${r.svg}</g>`;
  });

  // ── NOTES ──
  s += heading(150, 223, "SETTING OUT", `REVISION ${K.rev.split(" ")[0]} · FEET AND INCHES`, 118);
  const ledgeW = ledgeL[1] - ledgeL[0], ledgeD = ledgeY[1] - ledgeY[0];
  const curlTip = yPart + G.PROJ, bedFoot = yHead - B.l, walk = bedFoot - curlTip;
  [`Both pieces moved 6 in to the right: ${ft(K.gapR)} from the right wall to each.`,
   `Partition line: ${ft(xPL - leftAt(yPart))} · partition 8 ft · ${ft(K.gapR)}.`,
   `Bed wall: ${ft(K.door)} open door · ${ft(xPL - doorEnd)} clear · bed back 8 ft · ${ft(K.gapR)}.`,
   `The bed is ${ft(B.w)} × ${ft(B.l)}, centred on the back, which shows ${ft(xBL - xPL)} each side.`,
   `RIGHT wall to the bed: ${ft(xR - xBR)} the whole way — that wall is straight.`,
   `LEFT wall to the bed: ${ft(xBL - leftAt(bedFoot))} at the foot, ${ft(xBL - leftAt(yStep))} at the step, ${ft(xBL - xLb)} at the head —`,
   `   that wall carries the splay AND the step, so the gap opens out along the bed.`,
   `The bed therefore sits off centre. Centring the 8 ft back in the ${ft(S.wBed)} bed`,
   `   wall would move everything ${ft((S.wBed - K.width) / 2 - K.gapR)} left — but it is set off the RIGHT wall,`,
   `   the only straight one, and moved 6 in right on purpose.`,
   `Walkway: curls reach ${ft(curlTip)}, foot of the bed at ${ft(bedFoot)} — ${ft(walk)} between.`,
   `OPEN — the ledges inside the curls come to ${ft(ledgeW)} × ${ft(ledgeD)}: a phone and a slim`,
   `   lamp, not a nightstand. 9 in a side is all 8 ft leaves.`,
   `ASSUMED — back 4 ft 6 tall, ledges 2 ft. Bed and partition line measured.`]
    .forEach((n, i) => (s += text(150, 234 + i * 4.15, n, { size: 1.5, fill: n.startsWith("OPEN") ? "#b3261e" : INK })));

  s += titleBlock({ title: "BED, BED BACK AND PARTITION", sub: "Plan · Bed back · Four views", date: K.date, rev: K.rev, dwg: "AST-DR-013", scale: "AS NOTED @ A3" });
  window.DRAWINGS.bed = { title: "Bed and partition · AST-DR-013", svg: sheet(s), model: true };
})();
