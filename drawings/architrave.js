// Door casings — AST-DR-011.
// The lining is 2 in on the face. The moulding lays 4 in OUTSIDE it, all round — so the casing is
// 6 in on the jambs, and over the opening the moulding head sits 6 in above the leaf, not on it.
// Above that, and only above that, sit the three things worth having: a course of scallops, two
// small mouldings, and a crown that mitres back at each end. Nothing else.
// Real-world units are mm; y is measured UP from the floor.

window.DRAWINGS = window.DRAWINGS || {};

const ARCH = {
  rev: "4 — no corbels; moulding clear of the lining",
  date: "19.09.2026",
  leaf: { w: 762, h: 2311 },     // the dressing and bathroom doors, 2 ft 6 × 7 ft 7
  wide: 914,                     // D1, the main door — a pair of leaves
  plinth: 230,
  skirt: 102,
  reeds: 8,
  // the head, band by band, reading up from the top of the moulding
  scal: 46, moA: 20, moB: 26, crown: 74,
  earA: 6, earB: 16, earK: 45,   // how far each band runs past the jambs
  projJ: 30, projS: 40, projA: 52, projB: 68, projK: 112,
};

(function () {
  const { INK, THIN, f, text, view, chainH, chainV, heading, frame, titleBlock, sheet } = window.DK;
  const K = ARCH;
  // one source of truth for the casing widths — the door sheet owns them
  const FR = (window.DOORCASE && window.DOORCASE.frame) || 51;
  const MO = (window.DOORCASE && window.DOORCASE.mould) || 102;
  const CAS = FR + MO;

  // levels, read up from the floor
  const yC = K.leaf.h;                       // top of the opening
  const yFr = yC + FR;                       // top of the lining
  const yM = yFr + MO;                       // top of the moulding face — 6 in over the leaf
  const yS = yM + K.scal;                    // the scallop course hangs from here down to yM
  const yA = yS + K.moA, yB = yA + K.moB;    // the two small mouldings
  const TOPY = yB + K.crown;
  const HEAD = TOPY - yC;

  const LN = (a, b, c, d, w) => `<line x1="${f(a)}" y1="${f(b)}" x2="${f(c)}" y2="${f(d)}" stroke-width="${w}"/>`;
  const RC = (a, b, c, d, w, fl) => `<rect x="${f(a)}" y="${f(b)}" width="${f(c - a)}" height="${f(d - b)}" fill="${fl || "none"}" stroke-width="${w}"/>`;
  const PT = (d, w, fl) => `<path d="${d}" fill="${fl || "none"}" stroke-width="${w}"/>`;
  const ey = (y) => TOPY - y, E = ey;

  // reeding — the one motif, running the length of the moulding and turning the corner with it
  const reedsV = (x0, x1, y0, y1, n, t) => {
    let o = ""; const p = (x1 - x0) / n;
    for (let i = 1; i < n; i++) o += LN(x0 + i * p, y0, x0 + i * p, y1, t * 0.6);
    return o;
  };
  const reedsH = (x0, x1, y0, y1, n, t) => {
    let o = ""; const p = (y1 - y0) / n;
    for (let i = 1; i < n; i++) o += LN(x0, y0 + i * p, x1, y0 + i * p, t * 0.6);
    return o;
  };
  // the lambrequin — small half-rounds hanging from the top of their course
  const scallops = (x0, x1, yTop, t) => {
    const n = Math.max(3, Math.round((x1 - x0) / 34)), p = (x1 - x0) / n, r = p / 2;
    let o = "";
    for (let i = 0; i < n; i++) o += PT(`M ${f(x0 + i * p)} ${f(yTop)} A ${f(r)} ${f(r)} 0 0 0 ${f(x0 + (i + 1) * p)} ${f(yTop)}`, t * 0.75);
    return o;
  };

  // ── the head. `cut` stops it short and puts a break line there, for the detail ──
  function head(W, t, cut) {
    const end = cut != null, x = (e) => (end ? cut : W + e);
    let o = "";
    o += RC(MO, ey(yFr), end ? cut : W - MO, ey(yC), t * 1.1);               // the lining head
    o += RC(0, ey(yM), x(0), ey(yFr), t * 1.2);                             // the moulding head, 4 in
    o += reedsH(0, x(0), ey(yM), ey(yFr), K.reeds, t);                      // its reeds, turning the corner
    o += RC(0, ey(yS), x(0), ey(yM), t * 0.9) + scallops(0, x(0), ey(yM), t);
    o += RC(-K.earA, ey(yA), x(K.earA), ey(yS), t * 0.9);                   // the two small mouldings
    o += RC(-K.earB, ey(yB), x(K.earB), ey(yA), t * 0.9);
    const c0 = ey(TOPY), c1 = ey(yB), cm = c0 + (c1 - c0) * 0.42;           // the crown
    o += PT(`M ${f(-K.earK)} ${f(c0)} L ${f(x(K.earK))} ${f(c0)}`
      + (end ? ` L ${f(cut)} ${f(c1)}` : ` L ${f(W + K.earK)} ${f(cm)} L ${f(W + K.earB)} ${f(c1)}`)
      + ` L ${f(-K.earB)} ${f(c1)} L ${f(-K.earK)} ${f(cm)} Z`, t * 1.5);
    o += LN(-K.earK, cm, x(K.earK), cm, t * 0.8);
    o += reedsH(-K.earK + 3, x(K.earK) - (end ? 0 : 3), c0 + 3, cm - 2, 3, t);
    if (end) {
      let d = `M ${f(cut)} ${f(ey(TOPY) - 10)}`;
      for (let y = ey(TOPY) - 10, i = 0; y < ey(yC) + 10; y += 18, i++) d += ` L ${f(cut + (i % 2 ? -6 : 6))} ${f(y + 9)} L ${f(cut)} ${f(y + 18)}`;
      o += PT(d, t * 0.9);
    }
    return o;
  }

  // ── the whole casing in elevation, with the real leaf standing in the opening ──
  function casing(lw, t, key, ground) {
    const W = lw + 2 * CAS;
    let o = "";
    // jambs: the moulding outside and reeded, the lining inside and plain, a plinth block at the foot
    [[0, CAS], [W - CAS, W]].forEach(([a, b]) => {
      const left = a === 0, m0 = left ? a : a + FR, m1 = left ? b - FR : b, l0 = left ? b - FR : a, l1 = left ? b : a + FR;
      o += RC(l0, ey(yFr), l1, ey(0), t * 1.1);                             // the lining leg
      o += RC(m0, ey(yM), m1, ey(K.plinth), t * 1.2);                       // the moulding leg
      o += reedsV(m0, m1, ey(yM), ey(K.plinth), K.reeds, t);
      o += RC(a, ey(K.plinth), b, ey(0), t * 1.3);                          // the plinth block
      o += LN(a, ey(K.plinth - 14), b, ey(K.plinth - 14), t * 0.7);
      o += LN(a, ey(K.skirt), b, ey(K.skirt), t * 0.55);
    });
    o += RC(CAS, ey(yC), CAS + lw, ey(0), t * 1.5);                         // the opening
    const L = key && window.DOORLEAF && window.DOORLEAF[key];
    if (L) o += `<g transform="translate(${f(CAS)},${f(ey(yC))})" stroke-width="${t}">${L.draw(t * 0.7)}</g>`;
    o += head(W, t);
    if (ground !== false) o += LN(-190, ey(0), W + 190, ey(0), t * 3);
    return o;
  }

  // ── sections ──────────────────────────────────────────────────────────────
  function headSection(t) {
    const lv = [[K.crown, K.projK], [K.moB, K.projB], [K.moA, K.projA], [K.scal, K.projS], [MO, K.projJ], [FR, K.projJ * 0.3]];
    let y = 0, d = "M 0 0";
    lv.forEach(([h, p]) => { d += ` L ${f(p)} ${f(y)} L ${f(p)} ${f(y + h)}`; y += h; });
    d += ` L 0 ${f(y)} Z`;
    return PT(d, t * 1.3, "url(#hatchAR)") + LN(-34, 0, 0, 0, t * 2.4) + LN(0, -14, 0, y + 14, t * 2.4);
  }

  function jambSection(t) {
    const p = K.projJ;
    let d = `M 0 0 L 0 ${f(-p)} L 14 ${f(-p)} Q 26 ${f(-p)} 26 ${f(-p * 0.78)} L 26 ${f(-p * 0.74)}`;
    for (let i = 0; i < 7; i++) { const a = 30 + i * 10; d += ` Q ${a + 5} ${f(-p * 0.98)} ${a + 10} ${f(-p * 0.74)}`; }
    d += ` L ${MO} ${f(-p * 0.74)} L ${MO} ${f(-p * 0.34)} L ${MO + 10} ${f(-p * 0.34)}`;
    d += ` Q ${MO + 22} ${f(-p * 0.34)} ${MO + 22} ${f(-p * 0.14)} L ${CAS} ${f(-p * 0.14)} L ${CAS} 0 Z`;
    return PT(d, t, "url(#hatchAR)") + LN(-26, 0, CAS + 16, 0, t * 2) + LN(MO, 0, MO, -p * 0.9, t * 1.6);
  }

  // ═════════════ SHEET ═════════════
  window.DK.begin("architrave");
  let s = frame();
  s += `<defs><pattern id="hatchAR" patternUnits="userSpaceOnUse" width="6" height="6" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="6" stroke="#9a9a9a" stroke-width="0.9"/></pattern></defs>`;

  s += heading(18, 18, "DRESSING AND BATHROOM", "D2 · D3 · 2 FT 6 · 1:20", 86);
  { const sc = 20, v = view(40, 36, sc, "Narrow door casing"), t = v.w(0.12), W = K.leaf.w + 2 * CAS;
    s += v.g(casing(K.leaf.w, t, "door-narrow"), 0.3);
    s += chainH([v.X(0), v.X(CAS), v.X(CAS + K.leaf.w), v.X(W)], v.Y(E(0)) + 8, [CAS, K.leaf.w, CAS], { from: v.Y(E(0)) + 2, size: 1.25 });
    s += chainV([v.Y(E(0)), v.Y(E(yC)), v.Y(E(yFr)), v.Y(E(yM)), v.Y(E(TOPY))], v.X(W) + 7, [K.leaf.h, FR, MO, TOPY - yM], { from: v.X(W) + 2, size: 1.2 });
    s += chainV([v.Y(E(0)), v.Y(E(TOPY))], v.X(W) + 16, [`${TOPY} OVERALL`], { from: v.X(W) + 2, size: 1.35 }); }

  s += heading(112, 18, "MAIN DOOR", "D1 · 3 FT · A PAIR OF LEAVES · 1:20", 86);
  { const sc = 20, v = view(136, 36, sc, "Main door casing"), t = v.w(0.12), W = K.wide + 2 * CAS;
    s += v.g(casing(K.wide, t, "door"), 0.3);
    s += chainH([v.X(0), v.X(CAS), v.X(CAS + K.wide), v.X(W)], v.Y(E(0)) + 8, [CAS, K.wide, CAS], { from: v.Y(E(0)) + 2, size: 1.25 });
    s += chainV([v.Y(E(0)), v.Y(E(K.plinth))], v.X(W) + 7, [K.plinth], { from: v.X(W) + 2, size: 1.25 }); }

  s += heading(226, 18, "1 · THE HEAD", "LEFT END · ELEVATION 1:4 · LINING, MOULDING, SCALLOPS, CROWN", 104);
  { const sc = 4, v = view(250, 46, sc, "Head detail"), t = v.w(0.12), CUT = 400;
    s += v.g(head(1068, t, CUT), 0.3);
    s += chainV([v.Y(E(TOPY)), v.Y(E(yB)), v.Y(E(yA)), v.Y(E(yS)), v.Y(E(yM)), v.Y(E(yFr)), v.Y(E(yC))], v.X(CUT) + 7,
      [K.crown, K.moB, K.moA, K.scal, MO, FR], { from: v.X(CUT) + 2, size: 1.25 });
    s += chainH([v.X(0), v.X(MO), v.X(CAS)], v.Y(E(yC)) + 6, [MO, FR], { from: v.Y(E(yC)) + 1, size: 1.25 }); }

  s += heading(226, 150, "2 · SECTION", "THROUGH THE HEAD · 1:4", 58);
  { const sc = 4, v = view(240, 176, sc, "Head section"), t = v.w(0.12);
    s += v.g(headSection(t), 0.3);
    s += chainH([v.X(0), v.X(K.projJ), v.X(K.projK)], v.Y(-14), [K.projJ, K.projK - K.projJ], { from: v.Y(-2), size: 1.2 });
    s += chainV([v.Y(0), v.Y(HEAD)], v.X(K.projK) + 14, [`${HEAD} HEAD`], { from: v.X(K.projK) + 2, size: 1.25 }); }

  s += heading(300, 150, "3 · JAMB", "SECTION · 1:4 · 6 IN ON THE FACE", 54);
  { const sc = 4, v = view(308, 176, sc, "Jamb section"), t = v.w(0.12);
    s += v.g(jambSection(t), 0.3);
    s += chainH([v.X(0), v.X(MO), v.X(CAS)], v.Y(13), [MO, FR], { from: v.Y(2), size: 1.2 }); }

  s += heading(300, 192, "4 · PLINTH", "AT THE FOOT · 1:10", 54);
  { const sc = 10, v = view(312, 206, sc, "Plinth block"), t = v.w(0.12);
    s += v.g(RC(0, 0, CAS, K.plinth, t * 1.5) + LN(0, 14, CAS, 14, t * 0.9) + LN(0, K.plinth - K.skirt, CAS, K.plinth - K.skirt, t * 0.7), 0.3);
    s += chainV([v.Y(0), v.Y(K.plinth)], v.X(CAS) + 5, [K.plinth], { from: v.X(CAS) + 1, size: 1.2 }); }

  s += heading(18, 202, "NOTES", `REVISION ${K.rev.split(" ")[0]}`, 74);
  [["The lining is 2 in on the face. The moulding lays 4 in outside it,", "all round — so the jambs are 6 in wide, and over the opening the",
    "moulding head sits 6 in ABOVE the leaf rather than on top of it.", "That clearance is the whole of the correction in this revision.",
    "The moulding is reeded and turns the corner over the head, so the", "reeding runs round the opening in one piece."],
   ["Above the moulding, and only above it: a course of scallops, two", "small mouldings, and a crown that mitres back at each end.",
    "No corbels, no carving, no blocks at the head.", `The crown lands at ${TOPY} (8 ft 8 in), leaving 5 in to the ceiling.`,
    "All three doors take the identical casing; only the width changes.", "A plinth block takes each jamb down over the marble skirting."]]
    .forEach((col, c) => col.forEach((n, i) => (s += text(18 + c * 104, 214 + i * 4.6, n, { size: 1.7, fill: INK }))));

  // the other sheets build the same casing rather than drawing their own
  window.CASING = { CAS, FR, MO, TOPY, HEAD, yC, yM, projJ: K.projJ, earK: K.earK, draw: casing, head };

  s += titleBlock({ title: "DOOR CASINGS", sub: "All three doors · Head · Section · Jamb · Plinth", date: K.date, rev: K.rev, dwg: "AST-DR-011", scale: "AS NOTED @ A3" });
  window.DRAWINGS.architrave = { title: "Door casings · AST-DR-011", svg: sheet(s), model: true };
})();
