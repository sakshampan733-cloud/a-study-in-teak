// The partition, in leaded glass. One composition across the whole wall — the per-bay leading
// from the study sheets, with the double-frame border laid over it. No colour.
// Real-world units are mm. In the elevation y is measured DOWN from the ceiling.

window.DRAWINGS = window.DRAWINGS || {};

const PGLASS = {
  rev: "1 — double frame over the bay leading, no colour",
  date: "18.09.2026",
  H: 2769,                 // ceiling
  W: 2438,                 // 8 ft overall, straight across the room
  straight: 1350,          // the flat middle
  turn: 55,                // degrees each end turns towards the bed
  thick: 60,               // the glazed wall
  bays: 5,
  marg: 68,                // the side margin of each bay
  cap: 300,                // head and foot band
  outer: 150,              // the outer rectangle of the border, in from every edge
  innerX: 420, innerY: 460,
  blk: 140,                // the crosses on the border
  tv: { w: 1227, h: 690 },
};

(function () {
  const { INK, THIN, f, text, view, chainH, chainV, note, labels, heading, frame, titleBlock, sheet } = window.DK;
  const K = PGLASS, H = K.H, TH = (K.turn * Math.PI) / 180;
  const R = (K.W / 2 - K.straight / 2) / Math.sin(TH), PROJ = R * (1 - Math.cos(TH));
  const ARC = R * TH, DEV = K.straight + 2 * ARC, BW = DEV / K.bays;

  // ── the run, sampled, so anything can be set out along it ──
  const pts = [];
  { const h = K.straight / 2, N = 22;
    for (let i = N; i >= 0; i--) { const t = -Math.PI / 2 - TH * (i / N); pts.push([-h + R * Math.cos(t), R + R * Math.sin(t)]); }
    pts.push([h, 0]);
    for (let i = 0; i <= N; i++) { const t = -Math.PI / 2 + TH * (i / N); pts.push([h + R * Math.cos(t), R + R * Math.sin(t)]); } }
  const S = [0];
  for (let i = 1; i < pts.length; i++) S.push(S[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
  const TOT = S[S.length - 1];
  function at(s) {
    for (let i = 1; i < pts.length; i++) if (S[i] >= s || i === pts.length - 1) {
      const a = pts[i - 1], b = pts[i], u = (s - S[i - 1]) / (S[i] - S[i - 1] || 1);
      const dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy) || 1;
      return { x: a[0] + dx * u, y: a[1] + dy * u, nx: -dy / L, ny: dx / L };
    }
  }
  const off = (s, d) => { const p = at(s); return [p.x + p.nx * d, p.y + p.ny * d]; };

  // ── the leading ──
  const LN = (a, b, c, d, w) => `<line x1="${f(a)}" y1="${f(b)}" x2="${f(c)}" y2="${f(d)}" stroke-width="${w}"/>`;
  const RC = (a, b, c, d, w) => `<rect x="${f(a)}" y="${f(b)}" width="${f(c - a)}" height="${f(d - b)}" fill="none" stroke-width="${w}"/>`;
  function cross(cx, cy, s, t) {
    return RC(cx - s / 2, cy - s / 2, cx + s / 2, cy + s / 2, t) +
      LN(cx - s / 2, cy - s / 2, cx + s / 2, cy + s / 2, t * 0.7) + LN(cx + s / 2, cy - s / 2, cx - s / 2, cy + s / 2, t * 0.7) +
      RC(cx - s * 0.13, cy - s * 0.13, cx + s * 0.13, cy + s * 0.13, t * 0.7);
  }
  // one bay of the leading, drawn between x0 and x1
  function bay(x0, x1, t) {
    const m = K.marg, cap = K.cap, cx = (x0 + x1) / 2;
    const xa = x0 + m, xb = x1 - m, iw = xb - xa;
    const t1 = xa + iw / 3, t2 = xa + (2 * iw) / 3;
    let o = LN(xa, 0, xa, H, t) + LN(xb, 0, xb, H, t);
    [[0, cap, 1], [H, H - cap, -1]].forEach(([edge, band, d]) => {
      const r1 = edge + d * m * 0.62, r2 = band - d * m;
      o += LN(x0, band, x1, band, t) + LN(x0, r1, x1, r1, t) + LN(x0, r2, x1, r2, t);
      for (let i = 1; i < 5; i++) { const x = xa + (iw * i) / 5; o += LN(x, edge, x, r1, t); }
      o += LN(t1, r1, t1, r2, t) + LN(t2, r1, t2, r2, t);
      o += LN(t1, r2, t1, band, t) + LN(t2, r2, t2, band, t);
      const by = d > 0 ? r2 : band;
      o += cross(x0, by + m / 2, m, t) + cross(xb, by + m / 2, m, t);
      const len = (H - 2 * cap) * 0.128, e = band + d * len;
      o += LN(cx - 38, band, cx - 38, e, t) + LN(cx + 38, band, cx + 38, e, t) + LN(cx - 38, e, cx + 38, e, t);
    });
    [0.25, 0.5, 0.75].forEach((u) => {
      const by = cap + (H - 2 * cap) * u;
      o += cross(x0, by, m, t) + cross(xb, by, m, t);
    });
    return o;
  }
  // the whole wall: the bays, then the border over them
  function elevation(t, withTv) {
    let o = `<rect x="0" y="0" width="${f(DEV)}" height="${f(H)}" fill="#f5f9fb" stroke-width="${t * 2.2}"/>`;
    for (let i = 0; i < K.bays; i++) o += bay(BW * i, BW * (i + 1), t);
    for (let b = 1; b < K.bays; b++) o += LN(BW * b, 0, BW * b, H, t * 1.5);
    const O = K.outer, IX = K.innerX, IY = K.innerY;
    o += RC(O, O, DEV - O, H - O, t * 2.1) + RC(IX, IY, DEV - IX, H - IY, t * 2.1);
    o += LN(DEV / 2, O, DEV / 2, IY, t * 1.6) + LN(DEV / 2, H - IY, DEV / 2, H - O, t * 1.6);
    o += LN(O, H / 2, IX, H / 2, t * 1.6) + LN(DEV - IX, H / 2, DEV - O, H / 2, t * 1.6);
    [[IX, IY], [DEV - IX, IY], [IX, H - IY], [DEV - IX, H - IY]].forEach(([a, b]) => (o += cross(a, b, K.blk, t * 1.4)));
    if (withTv) o += `<rect x="${f(DEV / 2 - K.tv.w / 2)}" y="${f(H / 2 - K.tv.h / 2)}" width="${K.tv.w}" height="${K.tv.h}" fill="#151515" stroke="none"/>`;
    return o;
  }

  // ═════════════ SHEET ═════════════
  window.DK.begin("partitionglass");
  let s = frame();

  s += heading(20, 20, "PLAN", `AN ALL-GLASS WALL · BOTH ENDS TURN ${K.turn}° TOWARDS THE BED · 1:20`, 104);
  {
    const sc = 20, v = view(150, 46, sc, "Partition plan"), t = v.w(0.12);
    const pl = (a) => a.map(([x, y], i) => `${i ? "L" : "M"} ${f(x)} ${f(y)}`).join(" ");
    const A = [], B = [];
    for (let i = 0; i <= 140; i++) { const d = (TOT * i) / 140; A.push(off(d, -K.thick / 2)); B.push(off(d, K.thick / 2)); }
    let g = `<path d="${pl(A)}" fill="none" stroke-width="${t * 1.5}"/><path d="${pl(B)}" fill="none" stroke-width="${t * 1.5}"/>`;
    [0, TOT].forEach((d) => { const a = off(d, -K.thick / 2), b = off(d, K.thick / 2); g += LN(a[0], a[1], b[0], b[1], t * 1.5); });
    for (let i = 1; i < K.bays; i++) { const a = off(BW * i, -K.thick / 2), b = off(BW * i, K.thick / 2); g += LN(a[0], a[1], b[0], b[1], t * 1.2); }
    s += v.g(g, 0.3);
    s += chainH([v.X(-K.W / 2), v.X(K.W / 2)], v.Y(PROJ) + 12, [`${K.W} OVERALL — 8 FT`], { from: v.Y(PROJ) + 2, size: 1.5 });
    s += text(v.X(0), v.Y(PROJ) + 24, "▼  BED", { size: 2, anchor: "middle", fill: THIN });
    s += text(v.X(0), v.Y(0) - 10, "▲  DESK", { size: 2, anchor: "middle", fill: THIN });
    const L1 = labels(300, "right", 26, 70);
    L1.add(v.X(off(TOT * 0.06, 0)[0]), v.Y(off(TOT * 0.06, 0)[1]), "THE CURVE COMES TOWARDS THE BED", `${Math.round(PROJ)} DEEP · RADIUS ${Math.round(R)}`);
    L1.add(v.X(off(BW, 0)[0]), v.Y(off(BW, 0)[1]), `${K.bays} EQUAL BAYS`, `${Math.round(BW)} EACH, SET OUT ROUND THE CURVE`);
    s += L1.draw();
  }

  s += heading(20, 88, "ELEVATION", "THE CURVE UNROLLED FLAT · BOTH FACES THE SAME · 1:22", 100);
  { const sc = 22, v = view(26, 100, sc, "Partition elevation"), t = v.w(0.11);
    s += v.g(elevation(t, false), 0.3);
    s += chainH([v.X(0), ...Array.from({ length: K.bays }, (_, i) => v.X(BW * (i + 1)))], v.Y(H) + 7, Array(K.bays).fill(Math.round(BW)), { from: v.Y(H) + 1, size: 1.3 });
    s += chainH([v.X(0), v.X(DEV)], v.Y(H) + 14, [`${Math.round(DEV)} DEVELOPED`], { from: v.Y(H) + 8, size: 1.5 });
    s += chainV([v.Y(0), v.Y(K.outer), v.Y(K.innerY), v.Y(H - K.innerY), v.Y(H - K.outer), v.Y(H)], v.X(0) - 5,
      [K.outer, K.innerY - K.outer, H - 2 * K.innerY, K.innerY - K.outer, K.outer], { from: v.X(0) - 1, size: 1.25 }); }

  s += heading(160, 88, "WITH THE TELEVISION", "THE SAME WALL · THE SET CENTRED · 1:22", 92);
  { const sc = 22, v = view(166, 100, sc, "Elevation with television"), t = v.w(0.11);
    s += v.g(elevation(t, true), 0.3);
    s += chainH([v.X(DEV / 2 - K.tv.w / 2), v.X(DEV / 2 + K.tv.w / 2)], v.Y(H) + 7, [`${K.tv.w} — 55 IN`], { from: v.Y(H) + 1, size: 1.3 }); }

  s += heading(300, 88, "THE CURVE", "PLAN · 1:10", 56);
  { const sc = 10, O = off(0, 0);
    const Lp = (d, n) => { const q = off(d, n); return [q[0] - O[0], q[1] - O[1]]; };
    const p2 = []; for (let i = 0; i <= 2; i++) p2.push(Lp(BW * i, -K.thick), Lp(BW * i, K.thick));
    const cx = (Math.min(...p2.map((q) => q[0])) + Math.max(...p2.map((q) => q[0]))) / 2;
    const cy = (Math.min(...p2.map((q) => q[1])) + Math.max(...p2.map((q) => q[1]))) / 2;
    const v = view(352 - cx / sc, 122 - cy / sc, sc, "Curve detail"), t = v.w(0.12);
    let g = "";
    for (let i = 0; i < 2; i++) {
      const a = Lp(BW * i, -K.thick / 2), b = Lp(BW * (i + 1), -K.thick / 2), c = Lp(BW * (i + 1), K.thick / 2), d = Lp(BW * i, K.thick / 2);
      g += `<path d="M ${f(a[0])} ${f(a[1])} L ${f(b[0])} ${f(b[1])} L ${f(c[0])} ${f(c[1])} L ${f(d[0])} ${f(d[1])} Z" fill="#f5f9fb" stroke-width="${t * 1.4}"/>`;
      const m = Lp(BW * i, 0); g += `<circle cx="${f(m[0])}" cy="${f(m[1])}" r="${f(K.thick * 0.45)}" fill="#1b1b1b" stroke="none"/>`;
    }
    const mE = Lp(BW * 2, 0); g += `<circle cx="${f(mE[0])}" cy="${f(mE[1])}" r="${f(K.thick * 0.45)}" fill="#1b1b1b" stroke="none"/>`;
    s += v.g(g, 0.3);
    ["Every bay is flat. The came at each joint", "takes the angle — no glass is bent."].forEach((n, i) => (s += text(300, 146 + i * 4.4, n, { size: 1.7 }))); }

  s += heading(300, 166, "AXONOMETRIC", "FROM THE BED SIDE", 56);
  { const k = 0.0225, ox = 352, oy = 232;
    const P = (x, y, z) => [ox + (x - z) * 0.866 * k, oy - (y + (x + z) * 0.5) * k * 0.56];
    const pl = (a) => a.map((p, i) => `${i ? "L" : "M"} ${f(p[0])} ${f(p[1])} `).join("");
    let g = "";
    [0, K.outer, K.innerY, H / 2, H - K.innerY, H - K.outer, H].forEach((yy, ri) => {
      const row = []; for (let i = 0; i <= 50; i++) { const d = (TOT * i) / 50, p = at(d); row.push(P(p.x, yy, p.y)); }
      g += `<path d="${pl(row)}" fill="none" stroke-width="${ri === 0 || ri === 6 ? 0.42 : 0.2}"/>`; });
    [0, K.outer, K.innerX, DEV / 2, DEV - K.innerX, DEV - K.outer, DEV].forEach((xx, i) => {
      const p = at(Math.min(xx, TOT)); const a = P(p.x, 0, p.y), b = P(p.x, H, p.y);
      g += `<line x1="${f(a[0])}" y1="${f(a[1])}" x2="${f(b[0])}" y2="${f(b[1])}" stroke-width="${i === 0 || i === 6 ? 0.42 : 0.2}"/>`; });
    const q0 = at(DEV / 2 - K.tv.w / 2), q1 = at(DEV / 2 + K.tv.w / 2);
    g += `<path d="${pl([P(q0.x, H / 2 - K.tv.h / 2, q0.y), P(q0.x, H / 2 + K.tv.h / 2, q0.y), P(q1.x, H / 2 + K.tv.h / 2, q1.y), P(q1.x, H / 2 - K.tv.h / 2, q1.y)])} Z" fill="#151515" stroke="none"/>`;
    s += `<g stroke="${INK}" fill="none" stroke-linejoin="round">${g}</g>`; }

  s += text(20, 249, "ALL GLASS. One composition across the whole wall — the border runs straight through the bay joints.", { size: 2 });
  s += text(20, 255, `Border: an outer rectangle ${K.outer} in from every edge and an inner one ${K.innerX} in at the sides, ${K.innerY} at head and foot,`, { size: 1.7, fill: THIN });
  s += text(20, 260, "joined by a short bar at the middle of each side, with a cross at each corner of the inner rectangle.", { size: 1.7, fill: THIN });
  s += text(20, 265, "Within it, each bay carries a tiered head and foot, a stem into the field, and three crosses down each margin.", { size: 1.7, fill: THIN });
  s += text(20, 272, "White textured glass in lead came. No colour. The television is shown for position only — how it is carried is not drawn.", { size: 1.7, fill: THIN });

  s += titleBlock({ title: "PARTITION — LEADED GLASS", sub: "Plan · Elevation · With the television · Curve · Axonometric", date: K.date, rev: K.rev, dwg: "AST-DR-010", scale: "AS NOTED @ A3" });
  window.DRAWINGS.partitionglass = { title: "Partition — leaded glass · AST-DR-010", svg: sheet(s), model: true };

  // handed to the 3D viewer so the model and the drawing can never disagree
  window.PGEOM = { DEV, H, BW, BAYS: K.bays, TOT, R, PROJ, at, elevation, tv: K.tv, thick: K.thick };
})();
