// Wardrobe — leaded-glass door study (AST-DR-007). Steel-framed doors with a transom, white textured glass in
// lead came, lit from inside. Wall length is not known yet, so this sheet studies a run of four doors.

window.DRAWINGS = window.DRAWINGS || {};

const WARD = {
  rev: "0 — door study from references",
  date: "17.09.2026",
  H: 2743,                 // ceiling 9 ft
  cornice: 150,            // cornice above the doors
  plinth: 90,              // black recessed plinth
  doorW: 520, doors: 4,    // per leaf; wall length to come
  transomH: 560,           // fixed/upper leaf, as in reference 2
  frame: 38, bar: 26,      // steel frame face and transom bar
  came: 7,                 // lead came face width
  depth: 620,              // overall depth
  pull: { l: 320, y: 1050 },
};

(function () {
  const { INK, THIN, DIM, f, text, view, chainH, chainV, note, heading, frame, titleBlock, sheet } = window.DK;
  const K = WARD;
  const H = K.H, yTopDoor = H - K.cornice, yBase = K.plinth;
  const ey = (y) => H - y;
  const R = (x0, y0, x1, y1, a = "") => `<rect x="${f(Math.min(x0, x1))}" y="${f(ey(Math.max(y0, y1)))}" width="${f(Math.abs(x1 - x0))}" height="${f(Math.abs(y1 - y0))}" ${a}/>`;
  const Ln = (x0, y0, x1, y1, a = "") => `<line x1="${f(x0)}" y1="${f(ey(y0))}" x2="${f(x1)}" y2="${f(ey(y1))}" ${a}/>`;

  // Pattern A — linear leading after reference 2: a narrow border strip and staggered rectangles.
  function patternA(x0, y0, x1, y1, mirror, th) {
    const w = x1 - x0, h = y1 - y0, X = (t) => (mirror ? x1 - t * w : x0 + t * w), Y = (t) => y0 + t * h;
    const c = `stroke-width="${th * 2.2}"`;
    let o = Ln(X(0.26), y0, X(0.26), y1, c);
    [0.2, 0.47, 0.74].forEach((t) => { o += Ln(X(0), Y(t), X(0.26), Y(t), c); });
    o += Ln(X(0.26), Y(0.6), X(1), Y(0.6), c) + Ln(X(0.64), Y(0.6), X(0.64), Y(0.88), c) + Ln(X(0.64), Y(0.88), X(1), Y(0.88), c);
    o += Ln(X(0.26), Y(0.3), X(0.72), Y(0.3), c) + Ln(X(0.72), Y(0.3), X(0.72), Y(0.6), c);
    return o;
  }
  function patternATransom(x0, y0, x1, y1, mirror, th) {
    const w = x1 - x0, h = y1 - y0, X = (t) => (mirror ? x1 - t * w : x0 + t * w), Y = (t) => y0 + t * h;
    const c = `stroke-width="${th * 2.2}"`;
    return Ln(X(0.26), y0, X(0.26), y1, c) + Ln(X(0.26), Y(0.55), X(1), Y(0.55), c) + Ln(X(0.62), Y(0.55), X(0.62), y1, c) + Ln(X(0), Y(0.35), X(0.26), Y(0.35), c);
  }
  // Pattern B — square grid after reference 1 (laylight).
  function patternB(x0, y0, x1, y1, th) {
    const w = x1 - x0, n = 3, s = w / n, c = `stroke-width="${th * 2.2}"`;
    let o = "";
    for (let i = 1; i < n; i++) o += Ln(x0 + s * i, y0, x0 + s * i, y1, c);
    for (let y = y0 + s; y < y1 - s * 0.3; y += s) o += Ln(x0, y, x1, y, c);
    return o;
  }
  // Textured glass hint: a few short wavy strokes.
  const ripple = (x0, y0, x1, y1, th) => {
    let o = "";
    for (let k = 0; k < 5; k++) {
      const x = x0 + (x1 - x0) * (0.15 + 0.17 * k), yA = y0 + (y1 - y0) * (0.1 + ((k * 37) % 50) / 100);
      o += `<path stroke-width="${th * 0.7}" opacity=".35" d="M ${f(x)} ${f(ey(yA))} q 6 -40 0 -80 q -6 -40 0 -80"/>`;
    }
    return o;
  };

  function door(x, pattern, mirror, handleSide, th) {
    const fr = K.frame, x1 = x + K.doorW;
    const yT = yBase + (yTopDoor - yBase - K.transomH), gx0 = x + fr, gx1 = x1 - fr;
    let o = R(x, yBase, x1, yTopDoor, `stroke-width="${th * 2.5}"`);
    // transom bar and glazing openings
    o += R(x, yT - K.bar / 2, x1, yT + K.bar / 2, `fill="#fff" stroke-width="${th * 2}"`);
    o += R(gx0, yBase + fr, gx1, yT - K.bar / 2, `stroke-width="${th}"`) + R(gx0, yT + K.bar / 2, gx1, yTopDoor - fr, `stroke-width="${th}"`);
    if (pattern === "A") {
      o += patternA(gx0, yBase + fr, gx1, yT - K.bar / 2, mirror, th) + patternATransom(gx0, yT + K.bar / 2, gx1, yTopDoor - fr, mirror, th);
    } else {
      o += patternB(gx0, yBase + fr, gx1, yT - K.bar / 2, th) + patternB(gx0, yT + K.bar / 2, gx1, yTopDoor - fr, th);
    }
    o += ripple(gx0, yBase + fr, gx1, yT - K.bar / 2, th);
    // hinges on the outer edge, brass bar pull on the meeting edge
    const hx = handleSide > 0 ? x1 - fr / 2 : x + fr / 2, hinge = handleSide > 0 ? x + 3 : x1 - 3;
    [yBase + 250, yT - 250, yT + K.transomH / 2].forEach((hy) => { o += R(hinge - 6, hy - 50, hinge + 6, hy + 50, `stroke-width="${th}" fill="#fff"`); });
    o += R(hx - 7, K.pull.y - K.pull.l / 2, hx + 7, K.pull.y + K.pull.l / 2, `fill="#fff" stroke-width="${th * 1.5}"`);
    o += R(hx - 7, yT + 140, hx + 7, yT + 260, `fill="#fff" stroke-width="${th * 1.5}"`);
    return o;
  }

  function elevation(th) {
    const W = K.doorW * K.doors;
    let o = R(-60, yBase, W + 60, yTopDoor) + R(-90, yTopDoor, W + 90, H, 'fill="#fff"');
    o += `<g stroke-width="${th}">${Ln(-90, yTopDoor + 45, W + 90, yTopDoor + 45)}${Ln(-90, yTopDoor + 95, W + 90, yTopDoor + 95)}</g>`;
    o += R(-60, 0, W + 60, yBase, `fill="#333" stroke-width="${th}"`);
    o += door(0, "A", false, 1, th) + door(K.doorW, "A", true, -1, th) + door(K.doorW * 2, "B", false, 1, th) + door(K.doorW * 3, "B", false, -1, th);
    o += `<line x1="-300" y1="${ey(0)}" x2="${W + 300}" y2="${ey(0)}" stroke-width="${th * 5}"/><line x1="-300" y1="${ey(H)}" x2="${W + 300}" y2="${ey(H)}" stroke-width="${th * 3}" stroke-dasharray="40 20"/>`;
    return o;
  }

  // PLAN SECTION through two doors: steel frame, glass, lead, the lit cavity and the carcase.
  function planSection(th) {
    const W = K.doorW * 2, D = K.depth, fr = K.frame;
    const hatch = 'fill="url(#hatchWR)"';
    let o = `<rect x="-60" y="${-D}" width="${W + 120}" height="18" ${hatch}/>`;               // back panel (light-coloured)
    o += `<rect x="-60" y="${-D}" width="18" height="${D}" ${hatch}/><rect x="${W + 42}" y="${-D}" width="18" height="${D}" ${hatch}/>`;
    o += `<line x1="-200" y1="${-D - 40}" x2="${W + 200}" y2="${-D - 40}" stroke-width="${th * 4}"/>`;
    [0, K.doorW].forEach((x) => {
      o += `<rect x="${x}" y="-40" width="${fr}" height="40" fill="#333"/><rect x="${x + K.doorW - fr}" y="-40" width="${fr}" height="40" fill="#333"/>`;
      o += `<rect x="${x + fr}" y="-26" width="${K.doorW - 2 * fr}" height="8" fill="#cfd8dc" stroke-width="${th}"/>`;
    });
    // LED strips set back on the carcase sides and at the meeting post, diffuser in front
    [[-42, 1], [W + 42, -1]].forEach(([x, m]) => { o += `<rect x="${x + (m > 0 ? 0 : -14)}" y="-340" width="14" height="60" stroke-width="${th}"/>`; });
    o += `<line x1="-42" y1="-120" x2="${W + 42}" y2="-120" stroke-width="${th}" stroke-dasharray="30 18"/>`;
    // hanging rail and garments
    o += `<line x1="0" y1="${-D / 2 - 40}" x2="${W}" y2="${-D / 2 - 40}" stroke-width="${th * 2}"/>`;
    for (let x = 60; x < W - 40; x += 70) o += `<path stroke-width="${th}" opacity=".4" d="M ${x} ${-D / 2 - 40 - 220} L ${x + 18} ${-D / 2 - 40 + 220}"/>`;
    // door swings (dashed)
    o += `<path stroke-width="${th}" stroke-dasharray="25 15" d="M 0 0 L 0 ${K.doorW} M 0 ${K.doorW} A ${K.doorW} ${K.doorW} 0 0 0 ${K.doorW} 0 M ${W} 0 L ${W} ${K.doorW} M ${W} ${K.doorW} A ${K.doorW} ${K.doorW} 0 0 1 ${K.doorW} 0"/>`;
    return o;
  }

  window.DK.begin("wardrobe");
  let s = frame();
  s += `<defs><pattern id="hatchWR" patternUnits="userSpaceOnUse" width="30" height="30" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="30" stroke="#999" stroke-width="3"/></pattern></defs>`;

  const sc = 20, vE = view(40, 32, sc, "Wardrobe door study"), tE = vE.w(0.1);
  s += heading(18, 17, "ELEVATION — DOOR STUDY", `SCALE 1:${sc} · FOUR LEAVES · PATTERN A (LEFT PAIR) · PATTERN B (RIGHT PAIR)`, 110);
  s += vE.g(elevation(tE), 0.28);
  const W = K.doorW * K.doors, yb = vE.Y(ey(0));
  s += chainH(Array.from({ length: K.doors + 1 }, (_, i) => vE.X(i * K.doorW)), yb + 6, Array(K.doors).fill(K.doorW), { from: yb + 1, size: 1.5 });
  s += chainV([H, yTopDoor, yTopDoor - K.transomH, yBase, 0].map((y) => vE.Y(ey(y))), vE.X(W + 90) + 8, [K.cornice, K.transomH, yTopDoor - K.transomH - yBase, K.plinth], { from: vE.X(W + 90) + 1, size: 1.4 });
  const lab = (x, y, lx, ly, t1, t2, a) => note(vE.X(x), vE.Y(ey(y)), lx, ly, t1, t2, a);
  const RX = vE.X(W + 90) + 26;
  s += lab(K.doorW * 0.3, 1500, RX, vE.Y(ey(1900)), "A · LINEAR LEADING", "AFTER REF. 2 — PAIRS MIRROR");
  s += lab(K.doorW * 2.66, 1500, RX, vE.Y(ey(1500)), "B · SQUARE GRID", "AFTER REF. 1 (LAYLIGHT)");
  s += lab(K.doorW * 2 - K.frame / 2, K.pull.y, RX, vE.Y(ey(1050)), "BRASS BAR PULL", "THE ONLY GOLD");
  s += lab(K.doorW * 3.5, yTopDoor - K.transomH, RX, vE.Y(ey(yTopDoor - K.transomH + 120)), "TRANSOM BAR", "UPPER LEAF OPENS SEPARATELY");
  s += lab(K.doorW * 0.02, yTopDoor - 40, RX, vE.Y(ey(yTopDoor + 60)), "BLACKENED STEEL FRAMES", `${K.frame} FACE`);
  s += lab(W * 0.5, K.plinth / 2, RX, vE.Y(ey(K.plinth + 20)), "RECESSED BLACK PLINTH", "");

  const scP = 15, vP = view(300 + 60 / scP, 40 + K.depth / scP, scP, "Wardrobe plan section"), tP = vP.w(0.1);
  s += heading(290, 17, "PLAN SECTION", `TWO LEAVES · SCALE 1:${scP} · ROOM BELOW`, 60);
  s += vP.g(planSection(tP), 0.28);
  s += chainV([vP.Y(-K.depth), vP.Y(0)], vP.X(-60) - 5, [K.depth], { from: vP.X(-60) - 1, size: 1.4 });
  const LX = 292, ly0 = 128;
  s += note(vP.X(K.doorW * 0.5), vP.Y(-22), LX, ly0, "1 · WHITE TEXTURED GLASS IN LEAD CAME", "LAMINATED, OPAL OR REEDED — HIDES CLOTHES");
  s += note(vP.X(K.doorW + 10), vP.Y(-20), LX, ly0 + 7, "2 · BLACKENED STEEL T-SECTION FRAME", `${K.frame} × 40`);
  s += note(vP.X(-35), vP.Y(-310), LX, ly0 + 14, "3 · LED STRIP 2700 K, SET BACK, DIMMABLE", "");
  s += note(vP.X(K.doorW * 1.5), vP.Y(-120), LX, ly0 + 21, "4 · DIFFUSER LINE — NO HOT SPOTS", "");
  s += note(vP.X(K.doorW * 1.2), vP.Y(-K.depth + 9), LX, ly0 + 28, "5 · LIGHT-COLOURED BACK PANEL", "SO THE GLASS GLOWS EVENLY");

  s += heading(292, 172, "NOTES", "STUDY — NOT FOR MAKING", 50);
  ["Wall length and door count to follow the dressing plan.", "Glass: white and textured so clothes read as soft shadow",
   "   at most — sample opal, reeded and seeded side by side,", "   lit from behind, before choosing.", "Lead came or brass-capped came; pattern A or B to choose.",
   "Frames: blackened steel (no wood). Pulls: brass.", "Lighting on its own switch and dimmer (see Lighting)."]
    .forEach((n, i) => { s += text(292, 183 + i * 4.1, n, { size: 1.5 }); });
  s += titleBlock({ title: "WARDROBE — LEADED GLASS", sub: "Door study: elevation, patterns, lit section", date: K.date, rev: K.rev, dwg: "AST-DR-007" });

  window.DRAWINGS.wardrobe = { title: "Wardrobe — leaded glass door study · AST-DR-007", svg: sheet(s), params: WARD };
})();
