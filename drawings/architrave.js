// Door casings — AST-DR-011. The brownstone doorway recreated.
// The frame is 2 in on the face; the moulding adds 4 in outside it, so the casing is 6 in all round.
// The head is built up as the reference: an ovolo over the opening, a course of scallops, a reeded
// frieze carried on two carved corbels, a bed mould, and a crown that mitres back at each end.
// Real-world units are mm; y is measured UP from the floor.

window.DRAWINGS = window.DRAWINGS || {};

const ARCH = {
  rev: "3 — the reference recreated",
  date: "18.09.2026",
  leaf: { w: 762, h: 2311 },     // the dressing door, 2 ft 6 × 7 ft 7
  wide: 914,                     // D1, the main door
  frame: 51,                     // the lining, 2 in on the face
  mould: 102,                    // the moulding over it, 4 in — the jambs stay 6 in
  plinth: 230,
  skirt: 102,
  rose: { y: 940, h: 153 },      // the roundel block that interrupts the reeding
  // the head, band by band, reading up from the top of the opening
  band: 34, fil1: 12, scal: 46, fil2: 10, frieze: 118, bed: 26, crown: 74,
  drop: 66,                      // how far the corbels hang below the opening head
  earK: 45, earB: 26,            // how far the crown and the bed run past the jambs
  projJ: 30, projF: 34, projC: 82, projK: 118,
};

(function () {
  const { INK, THIN, f, text, view, chainH, chainV, heading, frame, titleBlock, sheet } = window.DK;
  const K = ARCH, CAS = K.frame + K.mould;

  // levels, read up from the floor
  const yC = K.leaf.h;
  const yS0 = yC + K.band + K.fil1, yS1 = yS0 + K.scal;      // the scallop course
  const yF0 = yS1 + K.fil2, yF1 = yF0 + K.frieze;            // the frieze
  const yB1 = yF1 + K.bed, TOPY = yB1 + K.crown;             // bed mould, then the crown
  const HEAD = TOPY - yC;
  const yK0 = yC - K.drop;                                   // where the corbels stop
  const CH = yF1 - yK0;                                      // corbel height

  const LN = (a, b, c, d, w) => `<line x1="${f(a)}" y1="${f(b)}" x2="${f(c)}" y2="${f(d)}" stroke-width="${w}"/>`;
  const RC = (a, b, c, d, w, fl) => `<rect x="${f(a)}" y="${f(b)}" width="${f(c - a)}" height="${f(d - b)}" fill="${fl || "none"}" stroke-width="${w}"/>`;
  const PT = (d, w, fl) => `<path d="${d}" fill="${fl || "none"}" stroke-width="${w}"/>`;
  const ey = (y) => TOPY - y, E = ey;   // real height above the floor → the drawing's own y

  // ── the carved parts ──────────────────────────────────────────────────────
  const reeds = (x0, x1, y0, y1, n, t) => {
    let o = ""; const p = (x1 - x0) / n;
    for (let i = 1; i < n; i++) o += LN(x0 + i * p, y0, x0 + i * p, y1, t * 0.6);
    return o;
  };
  const reedsH = (x0, x1, y0, y1, n, t) => {
    let o = ""; const p = (y1 - y0) / n;
    for (let i = 1; i < n; i++) o += LN(x0, y0 + i * p, x1, y0 + i * p, t * 0.55);
    return o;
  };
  // the lambrequin — small half-rounds hanging from the top of their course
  const scallops = (x0, x1, yTop, t) => {
    const n = Math.max(3, Math.round((x1 - x0) / 34)), p = (x1 - x0) / n, r = p / 2;
    let o = "";
    for (let i = 0; i < n; i++) {
      const a = x0 + i * p;
      o += PT(`M ${f(a)} ${f(yTop)} A ${f(r)} ${f(r)} 0 0 0 ${f(a + p)} ${f(yTop)}`, t * 0.75);
    }
    return o;
  };
  // the bracket: a palmette cap, a long panel of chevrons, an interlaced knot at the foot
  function corbel(x0, yTop, w, h, t, carved) {
    const x1 = x0 + w, cap = 46, knot = 78, foot = 18, cx = (x0 + x1) / 2;
    let o = RC(x0, yTop, x1, yTop + h, t * 1.3);
    o += LN(x0, yTop + cap, x1, yTop + cap, t * 0.9);
    o += LN(x0, yTop + h - knot, x1, yTop + h - knot, t * 0.9);
    o += LN(x0, yTop + h - foot, x1, yTop + h - foot, t * 0.9);
    // the raised border that runs down both edges of the bracket
    o += LN(x0 + 10, yTop + cap, x0 + 10, yTop + h - foot, t * 0.55);
    o += LN(x1 - 10, yTop + cap, x1 - 10, yTop + h - foot, t * 0.55);
    if (!carved) {
      o += RC(x0 + 22, yTop + cap + 16, x1 - 22, yTop + h - knot - 16, t * 0.7);
      o += RC(x0 + 30, yTop + h - knot + 12, x1 - 30, yTop + h - foot - 10, t * 0.7);
      return o;
    }
    // palmette — a fan of five lobes in the cap
    const cb = yTop + cap - 7;
    for (let i = -2; i <= 2; i++) {
      const a = (i * 28 * Math.PI) / 180, L1 = 34 - Math.abs(i) * 5, sx = Math.sin(a) * L1, sy = Math.cos(a) * L1;
      o += PT(`M ${f(cx)} ${f(cb)} Q ${f(cx + sx * 0.35 - 7)} ${f(cb - sy * 0.8)} ${f(cx + sx)} ${f(cb - sy)}`
        + ` Q ${f(cx + sx * 0.45 + 7)} ${f(cb - sy * 0.68)} ${f(cx)} ${f(cb)}`, t * 0.6);
    }
    // chevrons — deep Vs pointing up, in a panel that narrows as it falls
    const p0 = yTop + cap + 14, p1 = yTop + h - knot - 12, rows = 11, dy = (p1 - p0) / rows;
    const arm = 21, ins = (y) => 26 + ((y - p0) / (p1 - p0 + arm)) * 13;
    for (let i = 0; i <= rows; i++) {
      const y = p0 + i * dy, k = ins(y + arm);
      o += PT(`M ${f(x0 + k)} ${f(y + arm)} L ${f(cx)} ${f(y)} L ${f(x1 - k)} ${f(y + arm)}`, t * 0.6);
    }
    o += LN(x0 + ins(p0), p0, x0 + ins(p1 + arm), p1 + arm, t * 0.6);
    o += LN(x1 - ins(p0), p0, x1 - ins(p1 + arm), p1 + arm, t * 0.6);
    // the knot — strapwork diamonds in a square panel
    const k0 = yTop + h - knot + 11, k1 = yTop + h - foot - 10, ky = (k0 + k1) / 2, kh = (k1 - k0) / 2, kw = 40;
    o += RC(cx - kw - 8, k0, cx + kw + 8, k1, t * 0.6);
    // an interlace: two lozenges woven through a square set on the diagonal
    [1, 0.58].forEach((m) => (o += PT(`M ${f(cx)} ${f(ky - kh * m)} L ${f(cx + kw * m)} ${f(ky)} L ${f(cx)} ${f(ky + kh * m)} L ${f(cx - kw * m)} ${f(ky)} Z`, t * 0.6)));
    const q = Math.min(kw, kh) * 0.72;
    o += RC(cx - q, ky - q * 0.86, cx + q, ky + q * 0.86, t * 0.6);
    o += LN(cx - kw * 0.5, ky - kh * 0.5, cx + kw * 0.5, ky + kh * 0.5, t * 0.5);
    o += LN(cx - kw * 0.5, ky + kh * 0.5, cx + kw * 0.5, ky - kh * 0.5, t * 0.5);
    return o;
  }

  // ── the head. `cut` stops it short and puts a break line there, for the detail ──
  function head(W, t, carved, cut) {
    const EK = K.earK, EB = K.earB, end = cut != null;
    const xk = end ? cut : W + EK, xb = end ? cut : W + EB, xw = end ? cut : W;
    let o = "";
    // the courses run BETWEEN the corbels — the corbels cover the ends of every one of them
    const a0 = CAS, a1 = end ? cut : W - CAS;
    o += RC(a0, ey(yC + K.band), a1, ey(yC), t * 1.1);                      // the ovolo over the opening
    o += RC(a0, ey(yS0), a1, ey(yC + K.band), t * 0.9);                     // fillet
    o += RC(a0, ey(yS1), a1, ey(yS0), t * 0.9);                             // the scallop course
    o += scallops(a0, a1, ey(yS0), t);
    o += RC(a0, ey(yF0), a1, ey(yS1), t * 0.9);                             // fillet
    o += RC(a0, ey(yF1), a1, ey(yF0), t * 1.1);                             // the frieze, plain but for one groove
    o += LN(a0, ey(yF1 - 22), a1, ey(yF1 - 22), t * 0.6);
    o += RC(-EB * 0.5, ey(yF1 + K.bed * 0.45), xb, ey(yF1), t * 0.9);       // the bed mould
    o += RC(-EB, ey(yB1), xb, ey(yF1 + K.bed * 0.45), t * 0.9);
    // the crown — a flat cap over a cyma, mitred back at each end
    const c0 = ey(TOPY), c1 = ey(yB1), cm = c0 + (c1 - c0) * 0.42;
    o += PT(`M ${f(-EK)} ${f(c0)} L ${f(xk)} ${f(c0)}` + (end ? ` L ${f(xk)} ${f(c1)}` : ` L ${f(xk)} ${f(cm)} L ${f(W + EB)} ${f(c1)}`)
      + ` L ${f(-EB)} ${f(c1)} L ${f(-EK)} ${f(cm)} Z`, t * 1.5);
    o += LN(-EK, cm, xk, cm, t * 0.8);
    o += reedsH(-EK + 3, xk - (end ? 0 : 3), c0 + 3, cm - 2, 4, t);          // the reeded fascia
    o += corbel(0, ey(yF1), CAS, CH, t, carved);
    if (!end) o += corbel(W - CAS, ey(yF1), CAS, CH, t, carved);
    if (end) {                                                              // the break
      let d = `M ${f(cut)} ${f(ey(TOPY) - 10)}`;
      for (let y = ey(TOPY) - 10, i = 0; y < ey(yK0) + 10; y += 18, i++) d += ` L ${f(cut + (i % 2 ? -6 : 6))} ${f(y + 9)} L ${f(cut)} ${f(y + 18)}`;
      o += PT(d, t * 0.9);
    }
    return o;
  }

  // ── the whole casing in elevation ─────────────────────────────────────────
  function casing(lw, t, carved, ground) {
    const W = lw + 2 * CAS;
    let o = RC(CAS, ey(yC), CAS + lw, ey(0), t * 1.5);                      // the opening
    o += RC(CAS - K.frame, ey(yC + K.band * 0.4), CAS + lw + K.frame, ey(0), t * 0.9);
    [[0, CAS], [W - CAS, W]].forEach(([a, b]) => {
      const left = a === 0, m0 = left ? a : a + K.frame, m1 = left ? b - K.frame : b;
      o += RC(a, ey(yC), b, ey(K.plinth), t * 1.2);
      o += LN(left ? m1 : m0, ey(yC), left ? m1 : m0, ey(K.plinth), t * 0.8);
      [[K.plinth + 6, K.rose.y], [K.rose.y + K.rose.h, yC - 6]].forEach(([g0, g1]) =>
        (o += reeds(m0 + 5, m1 - 5, ey(g1), ey(g0), 8, t)));
      const cx = (a + b) / 2, cy = ey(K.rose.y + K.rose.h / 2);             // the roundel block
      o += RC(a, ey(K.rose.y + K.rose.h), b, ey(K.rose.y), t * 1.1);
      o += `<circle cx="${f(cx)}" cy="${f(cy)}" r="46" fill="none" stroke-width="${t * 0.8}"/>`;
      o += `<circle cx="${f(cx)}" cy="${f(cy)}" r="33" fill="none" stroke-width="${t * 0.6}"/>`;
      o += RC(a, ey(K.plinth), b, ey(0), t * 1.3) + LN(a, ey(K.plinth - 14), b, ey(K.plinth - 14), t * 0.7);
      o += LN(a, ey(K.skirt), b, ey(K.skirt), t * 0.55);
    });
    o += head(W, t, carved);
    if (ground !== false) o += LN(-190, ey(0), W + 190, ey(0), t * 3);
    return o;
  }

  // ── sections ──────────────────────────────────────────────────────────────
  function headSection(t) {
    const lv = [[K.crown, K.projK], [K.bed, K.projC + 14], [K.frieze, K.projF], [K.fil2, K.projF + 10],
      [K.scal, K.projF + 16], [K.fil1, K.projF + 8], [K.band, K.projJ + 14]];
    let y = 0, d = "M 0 0";
    lv.forEach(([h, p]) => { d += ` L ${f(p)} ${f(y)} L ${f(p)} ${f(y + h)}`; y += h; });
    d += ` L 0 ${f(y)} Z`;
    let o = PT(d, t * 1.3, "url(#hatchAR)");
    o += LN(-34, 0, 0, 0, t * 2.4) + LN(0, -14, 0, y + 14, t * 2.4);
    o += `<path d="M ${f(K.projF)} ${f(K.crown + K.bed)} L ${f(K.projC)} ${f(K.crown + K.bed)} L ${f(K.projC)} ${f(y + K.drop * 0.55)} L ${f(K.projF)} ${f(y + K.drop * 0.55)}" fill="none" stroke-width="${t * 0.8}" stroke-dasharray="${t * 9} ${t * 6}"/>`;
    return o;
  }

  function jambSection(t) {
    const p = K.projJ;
    let d = `M 0 0 L 0 ${f(-p)} L 14 ${f(-p)} Q 26 ${f(-p)} 26 ${f(-p * 0.78)} L 26 ${f(-p * 0.74)}`;
    for (let i = 0; i < 7; i++) { const a = 30 + i * 10; d += ` Q ${a + 5} ${f(-p * 0.98)} ${a + 10} ${f(-p * 0.74)}`; }
    d += ` L ${K.mould} ${f(-p * 0.74)} L ${K.mould} ${f(-p * 0.4)} L ${K.mould + 12} ${f(-p * 0.4)}`;
    d += ` Q ${K.mould + 26} ${f(-p * 0.4)} ${K.mould + 26} ${f(-p * 0.18)} L ${CAS} ${f(-p * 0.18)} L ${CAS} 0 Z`;
    return PT(d, t, "url(#hatchAR)") + LN(-26, 0, CAS + 16, 0, t * 2);
  }

  // ═════════════ SHEET ═════════════
  window.DK.begin("architrave");
  let s = frame();
  s += `<defs><pattern id="hatchAR" patternUnits="userSpaceOnUse" width="6" height="6" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="6" stroke="#9a9a9a" stroke-width="0.9"/></pattern></defs>`;

  s += heading(18, 18, "DRESSING DOOR", "THE CARVED ONE · 1:20", 84);
  { const sc = 20, v = view(40, 36, sc, "Dressing door casing"), t = v.w(0.12), W = K.leaf.w + 2 * CAS;
    s += v.g(casing(K.leaf.w, t, true), 0.3);
    s += chainH([v.X(0), v.X(CAS), v.X(CAS + K.leaf.w), v.X(W)], v.Y(E(0)) + 8, [CAS, K.leaf.w, CAS], { from: v.Y(E(0)) + 2, size: 1.3 });
    s += chainV([v.Y(E(0)), v.Y(E(yC)), v.Y(E(TOPY))], v.X(W) + 7, [K.leaf.h, HEAD], { from: v.X(W) + 2, size: 1.3 });
    s += chainV([v.Y(E(0)), v.Y(E(TOPY))], v.X(W) + 15, [`${TOPY} — 8 FT 8 IN`], { from: v.X(W) + 2, size: 1.4 }); }

  s += heading(112, 18, "MAIN AND BATHROOM", "THE SAME HEAD, PANELLED CORBELS · 1:20", 90);
  { const sc = 20, v = view(136, 36, sc, "Plain door casing"), t = v.w(0.12), W = K.wide + 2 * CAS;
    s += v.g(casing(K.wide, t, false), 0.3);
    s += chainH([v.X(0), v.X(CAS), v.X(CAS + K.wide), v.X(W)], v.Y(E(0)) + 8, [CAS, K.wide, CAS], { from: v.Y(E(0)) + 2, size: 1.3 });
    s += chainV([v.Y(E(K.plinth)), v.Y(E(K.rose.y)), v.Y(E(K.rose.y + K.rose.h))], v.X(W) + 7, [K.rose.y - K.plinth, K.rose.h], { from: v.X(W) + 2, size: 1.25 }); }

  s += heading(226, 18, "1 · THE HEAD", "LEFT END · ELEVATION 1:4 · THE COURSES AS THEY STACK", 104);
  { const sc = 4, v = view(250, 42, sc, "Head detail"), t = v.w(0.12), CUT = 420;
    s += v.g(head(1068, t, true, CUT), 0.3);
    s += chainV([v.Y(E(TOPY)), v.Y(E(yB1)), v.Y(E(yF1)), v.Y(E(yF0)), v.Y(E(yS1)), v.Y(E(yS0)), v.Y(E(yC)), v.Y(E(yK0))], v.X(CUT) + 7,
      [K.crown, K.bed, K.frieze, K.fil2, K.scal, K.fil1 + K.band, K.drop], { from: v.X(CUT) + 2, size: 1.25 });
    s += chainH([v.X(0), v.X(CAS)], v.Y(E(yK0)) + 6, [CAS], { from: v.Y(E(yK0)) + 1, size: 1.25 }); }

  s += heading(226, 156, "2 · SECTION", "THROUGH THE HEAD · 1:4", 58);
  { const sc = 4, v = view(238, 182, sc, "Head section"), t = v.w(0.12), H2 = TOPY - yC;
    s += v.g(headSection(t), 0.3);
    s += chainH([v.X(0), v.X(K.projF), v.X(K.projC), v.X(K.projK)], v.Y(-14), [K.projF, K.projC - K.projF, K.projK - K.projC], { from: v.Y(-2), size: 1.2 });
    s += chainV([v.Y(0), v.Y(H2)], v.X(K.projK) + 20, [`${HEAD} HEAD`], { from: v.X(K.projK) + 2, size: 1.25 }); }

  s += heading(300, 156, "3 · CORBEL", "CARVED · 1:5", 48);
  { const sc = 5, v = view(310, 172, sc, "Corbel"), t = v.w(0.12);
    s += v.g(corbel(0, 0, CAS, CH, t, true), 0.3);
    s += chainV([v.Y(0), v.Y(CH)], v.X(CAS) + 5, [CH], { from: v.X(CAS) + 1, size: 1.25 });
    s += chainH([v.X(0), v.X(CAS)], v.Y(CH) + 5, [CAS], { from: v.Y(CH) + 1, size: 1.25 }); }

  s += heading(358, 156, "4 · JAMB", "SECTION · 1:4", 48);
  { const sc = 4, v = view(366, 200, sc, "Jamb section"), t = v.w(0.12);
    s += v.g(jambSection(t), 0.3);
    s += chainH([v.X(0), v.X(K.mould), v.X(CAS)], v.Y(13), [K.mould, K.frame], { from: v.Y(2), size: 1.2 }); }

  s += heading(18, 206, "NOTES", `REVISION ${K.rev.split(" ")[0]}`, 74);
  [["The head is the reference recreated. Reading up from the opening:", "an ovolo, a fillet, a course of scallops, the reeded frieze, a bed",
    "mould, and a crown that mitres back at each end rather than dying", "into the wall.",
    `It stands ${HEAD} (1 ft 1 in) over the leaf, so the crown sits at 8 ft 8 in`, "and 5 in of wall is left to the ceiling."],
   ["The jambs stay 6 in on the face — 2 in frame, 4 in moulding —", "and are reeded, so they answer the study pilasters. A roundel",
    "block interrupts the reeding at 3 ft 1 in; a plinth block takes it", "down to the floor over the skirting.",
    "Only the dressing door is carved: palmette, chevrons, knot.", "The other two take the same head with panelled corbels."]]
    .forEach((col, c) => col.forEach((n, i) => (s += text(18 + c * 104, 218 + i * 4.6, n, { size: 1.7, fill: INK }))));

  s += titleBlock({ title: "DOOR CASINGS", sub: "Dressing · Main and bathroom · Head · Corbel · Jamb", date: K.date, rev: K.rev, dwg: "AST-DR-011", scale: "AS NOTED @ A3" });
  // the other sheets build the same casing rather than drawing their own
  window.CASING = { CAS, TOPY, HEAD, yC, earK: K.earK, draw: casing, head };

  window.DRAWINGS.architrave = { title: "Door casings · AST-DR-011", svg: sheet(s), model: true };
})();
