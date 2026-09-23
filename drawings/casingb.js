// Door casings, OPTION B — AST-DR-012. The brownstone doorway recreated as closely as it can be.
//
// This is the alternative to AST-DR-011. Everything below the corbels is the same casing: a 2 in
// lining with a 4 in reeded moulding outside it. What changes is the head. Instead of a corner
// block, each end carries a carved corbel — a palmette, a long panel of chevrons, and an
// interlaced knot at the foot — and the scallop course, architrave and frieze die into them.
// Real-world units are mm; y is measured UP from the floor.

window.DRAWINGS = window.DRAWINGS || {};

const CASB = {
  rev: "2 — carved head: dressing door only",
  date: "19.09.2026",
  leaf: { w: 762, h: 2311 },
  wide: 914,
  plinth: 230,
  skirt: 102,
  reeds: 8,
  // the head, band by band, up from the top of the lining
  arch: 50, scal: 38, fil: 8, frieze: 120, bed: 24, crown: 70,
  drop: 80,                      // how far the corbels hang below the opening head
  cProj: 14,                     // how far a corbel stands outboard of the casing
  earB: 20, earK: 48,
  projJ: 30, projA: 44, projS: 52, projC: 86, projB: 96, projK: 132,
};

(function () {
  const { INK, THIN, f, text, view, chainH, chainV, heading, frame, titleBlock, sheet } = window.DK;
  const K = CASB;
  const FR = (window.DOORCASE && window.DOORCASE.frame) || 51;
  const MO = (window.DOORCASE && window.DOORCASE.mould) || 102;
  const CAS = FR + MO;

  const yC = K.leaf.h;                         // top of the opening
  const yL = yC + FR;                          // top of the lining
  const yA = yL + K.arch;                      // top of the architrave band
  const yS = yA + K.scal;                      // top of the scallop course
  const yF0 = yS + K.fil, yF1 = yF0 + K.frieze;
  const yB = yF1 + K.bed, TOPY = yB + K.crown;
  const HEAD = TOPY - yC;
  const yK0 = yC - K.drop;                     // where the corbels stop
  const CH = yF1 - yK0;                        // corbel height

  const LN = (a, b, c, d, w) => `<line x1="${f(a)}" y1="${f(b)}" x2="${f(c)}" y2="${f(d)}" stroke-width="${w}"/>`;
  const RC = (a, b, c, d, w, fl) => `<rect x="${f(a)}" y="${f(b)}" width="${f(c - a)}" height="${f(d - b)}" fill="${fl || "none"}" stroke-width="${w}"/>`;
  const PT = (d, w, fl) => `<path d="${d}" fill="${fl || "none"}" stroke-width="${w}"/>`;
  const ey = (y) => TOPY - y, E = ey;

  const reedsV = (x0, x1, y0, y1, n, t) => {
    let o = ""; const p = (x1 - x0) / n;
    for (let i = 1; i < n; i++) o += LN(x0 + i * p, y0, x0 + i * p, y1, t * 0.6);
    return o;
  };
  const scallops = (x0, x1, yTop, t) => {
    const n = Math.max(3, Math.round((x1 - x0) / 34)), p = (x1 - x0) / n, r = p / 2;
    let o = "";
    for (let i = 0; i < n; i++) o += PT(`M ${f(x0 + i * p)} ${f(yTop)} A ${f(r)} ${f(r)} 0 0 0 ${f(x0 + (i + 1) * p)} ${f(yTop)}`, t * 0.75);
    return o;
  };

  // ══════════ THE CARVING ══════════
  // A spiral, wound inward — the curl at each end of the palmette.
  const volute = (cx, cy, r, dir, t) => {
    let d = "";
    for (let i = 0; i <= 26; i++) {
      const a = Math.PI * 0.5 - i * 0.40, rr = r * (1 - i / 31);
      const x = cx + dir * Math.cos(a) * rr, y = cy - Math.sin(a) * rr;
      d += (i ? " L " : "M ") + f(x) + " " + f(y);
    }
    return PT(d, t * 0.55);
  };

  // The leaf: a palmette of five pointed lobes springing from a collar, a curl at each side.
  function palmette(cx, yBase, w, h, t) {
    let o = "";
    for (let i = -2; i <= 2; i++) {
      const a = i * 0.46, L = h * (1 - Math.abs(i) * 0.16);
      const ux = Math.sin(a), uy = -Math.cos(a);              // the lobe's axis
      const nx = -uy, ny = ux;                                // and its normal
      const tx = cx + ux * L, ty = yBase + uy * L;
      const mx = cx + ux * L * 0.46, my = yBase + uy * L * 0.46;
      const b = (w * 0.058) * (1 - Math.abs(i) * 0.1);
      o += PT(`M ${f(cx)} ${f(yBase)}`
        + ` C ${f(mx - nx * b * 2.1)} ${f(my - ny * b * 2.1)} ${f(tx - nx * b * 0.9)} ${f(ty - uy * L * 0.24)} ${f(tx)} ${f(ty)}`
        + ` C ${f(tx + nx * b * 0.9)} ${f(ty - uy * L * 0.24)} ${f(mx + nx * b * 2.1)} ${f(my + ny * b * 2.1)} ${f(cx)} ${f(yBase)} Z`, t * 0.65);
      o += PT(`M ${f(cx)} ${f(yBase)} Q ${f(mx)} ${f(my)} ${f(tx)} ${f(ty)}`, t * 0.42);   // the midrib
    }
    // the two curls, and the collar the whole fan springs from
    o += volute(cx - w * 0.40, yBase - h * 0.34, h * 0.20, -1, t) + volute(cx + w * 0.40, yBase - h * 0.34, h * 0.20, 1, t);
    o += PT(`M ${f(cx - w * 0.16)} ${f(yBase)} Q ${f(cx)} ${f(yBase - h * 0.15)} ${f(cx + w * 0.16)} ${f(yBase)}`
      + ` Q ${f(cx)} ${f(yBase + h * 0.12)} ${f(cx - w * 0.16)} ${f(yBase)} Z`, t * 0.6);
    return o;
  }

  // The chevrons: nested V bands on a central spine, each band a pair of curves, the panel
  // narrowing as it falls. Drawn as leaf veins rather than arrowheads.
  function chevronPanel(x0, x1, y0, y1, rows, t) {
    let o = "";
    const cx = (x0 + x1) / 2, dy = (y1 - y0) / rows, drop = (x1 - x0) * 0.34, band = dy * 0.42;
    const kAt = (y) => 4 + 9 * ((y - y0) / (y1 - y0));                 // the taper
    const vee = (yApex, k) => {
      const yEnd = yApex + drop;
      return `M ${f(x0 + k)} ${f(yEnd)} Q ${f(cx - (cx - x0 - k) * 0.34)} ${f(yApex + drop * 0.10)} ${f(cx)} ${f(yApex)}`
        + ` Q ${f(cx + (x1 - k - cx) * 0.34)} ${f(yApex + drop * 0.10)} ${f(x1 - k)} ${f(yEnd)}`;
    };
    o += LN(cx, y0 - dy * 0.3, cx, y1 + drop, t * 0.45);               // the spine
    for (let i = 0; i <= rows; i++) {
      const y = y0 + i * dy;
      o += PT(vee(y, kAt(y)), t * 0.62) + PT(vee(y + band, kAt(y + band)), t * 0.42);
    }
    o += LN(x0 + kAt(y0), y0 + drop, x0 + kAt(y1), y1 + drop, t * 0.5);
    o += LN(x1 - kAt(y0), y0 + drop, x1 - kAt(y1), y1 + drop, t * 0.5);
    return o;
  }

  // The knot: a shield strap woven through a lozenge, as the photograph. Each strap is a band —
  // two parallel edges round a white core — so whichever is drawn last passes over the other, and
  // two runs of the lozenge are brought back on top so the pair genuinely weaves.
  function knot(x0, y0, w, h, t) {
    const P = (u, v, k) => [x0 + w * (0.5 + (u - 0.5) * k), y0 + h * (0.5 + (v - 0.5) * k)];
    const p = (u, v, k) => P(u, v, k).map(f).join(" ");
    // the shield is tall and narrow, the lozenge wide and flat, so the two cross four times
    const shield = (k) =>
      `M ${p(0.20, 0.40, k)} C ${p(0.20, 0.12, k)} ${p(0.44, 0.10, k)} ${p(0.50, 0.32, k)}`
      + ` C ${p(0.56, 0.10, k)} ${p(0.80, 0.12, k)} ${p(0.80, 0.40, k)}`
      + ` C ${p(0.80, 0.64, k)} ${p(0.62, 0.78, k)} ${p(0.50, 0.96, k)}`
      + ` C ${p(0.38, 0.78, k)} ${p(0.20, 0.64, k)} ${p(0.20, 0.40, k)} Z`;
    const LZ = [[0.5, 0.22], [0.94, 0.5], [0.5, 0.78], [0.06, 0.5]];
    const loz = (k) => "M " + LZ.map(([u, v]) => p(u, v, k)).join(" L ") + " Z";
    const ring = (o1, o2, tt) => `<path d="${o1} ${o2}" fill="#fff" fill-rule="evenodd" stroke-width="${tt}"/>`;
    let o = ring(loz(1), loz(0.58), t * 0.55) + ring(shield(1), shield(0.70), t * 0.6);
    const over = (i) => {
      const A = LZ[i], B = LZ[(i + 1) % 4];
      const at = (sx, k) => P(A[0] + (B[0] - A[0]) * sx, A[1] + (B[1] - A[1]) * sx, k).map(f).join(" ");
      return `<path d="M ${at(0.52, 1)} L ${at(0.9, 1)} L ${at(0.9, 0.58)} L ${at(0.52, 0.58)} Z" fill="#fff" stroke="none"/>`
        + `<path d="M ${at(0.52, 1)} L ${at(0.9, 1)}" fill="none" stroke-width="${t * 0.55}"/>`
        + `<path d="M ${at(0.52, 0.58)} L ${at(0.9, 0.58)}" fill="none" stroke-width="${t * 0.55}"/>`;
    };
    return o + over(0) + over(2);
  }

  // ══════════ THE CORBEL ══════════
  function corbel(x0, yTop, w, h, t) {
    const cap = 17, leafH = 37, knotH = 88, foot = 20, x1 = x0 + w, cx = (x0 + x1) / 2, p = K.cProj;
    const yB0 = yTop + h;
    let o = "";
    // the silhouette — one closed outline, serpentine on the wall side, as the photograph
    o += PT(`M ${f(x1)} ${f(yTop)} L ${f(x0 - p)} ${f(yTop)}`
      + ` C ${f(x0 - p - 4)} ${f(yTop + h * 0.09)} ${f(x0 - p + 10)} ${f(yTop + h * 0.12)} ${f(x0 - p + 8)} ${f(yTop + h * 0.21)}`
      + ` C ${f(x0 - p + 6)} ${f(yTop + h * 0.38)} ${f(x0 - p + 2)} ${f(yTop + h * 0.52)} ${f(x0 - p + 3)} ${f(yTop + h * 0.70)}`
      + ` C ${f(x0 - p + 4)} ${f(yTop + h * 0.84)} ${f(x0 - p)} ${f(yTop + h * 0.87)} ${f(x0 - p)} ${f(yB0)}`
      + ` L ${f(x1)} ${f(yB0)} Z`, t * 1.3);
    o += LN(x0, yTop, x0, yB0, t * 0.7);                                // where the casing face ends
    // the cap and the shelf at the foot
    o += LN(x0 - p, yTop + cap, x1, yTop + cap, t * 0.9) + LN(x0 - p * 0.6, yTop + cap * 0.45, x1, yTop + cap * 0.45, t * 0.6);
    o += LN(x0 - p, yB0 - foot, x1, yB0 - foot, t * 0.9);
    o += RC(x0 - p * 0.5, yB0 - foot + 5, x1, yB0 - 4, t * 0.7);
    // the three carved zones
    const lb0 = yTop + cap, lb1 = lb0 + leafH, kb0 = yB0 - foot - knotH;
    o += LN(x0, lb1, x1, lb1, t * 0.8) + LN(x0, kb0, x1, kb0, t * 0.8);
    o += palmette(cx, lb1 - leafH * 0.12, w * 1.04, leafH * 0.84, t);
    o += chevronPanel(x0 + 5, x1 - 5, lb1 + 9, kb0 - 8 - (w - 10) * 0.34, 10, t);
    o += RC(x0 + 6, kb0 + 6, x1 - 6, yB0 - foot - 6, t * 0.6);
    o += knot(x0 + 11, kb0 + 11, w - 22, knotH - 22, t);
    return o;
  }

  // ══════════ THE HEAD ══════════
  function head(W, t, cut) {
    const end = cut != null, x = (e) => (end ? cut : W + e);
    const a0 = MO, a1 = end ? cut : W - MO;                    // the bands run between the corbels
    let o = "";
    o += RC(a0, ey(yL), a1, ey(yC), t * 1.1);                               // the lining head
    o += RC(a0, ey(yA), a1, ey(yL), t * 1.1);                               // the architrave, stepped
    [17, 34].forEach((d) => (o += LN(a0, ey(yL + d), a1, ey(yL + d), t * 0.7)));
    o += RC(a0, ey(yS), a1, ey(yA), t * 0.9) + scallops(a0, a1, ey(yA), t);  // the scallop course
    o += RC(a0, ey(yF0), a1, ey(yS), t * 0.85);
    o += RC(a0, ey(yF1), a1, ey(yF0), t * 1.1);                             // the frieze, plain
    o += LN(a0, ey(yF1 - 20), a1, ey(yF1 - 20), t * 0.55);
    o += RC(-K.earB * 0.5, ey(yF1 + K.bed * 0.45), x(K.earB * 0.5), ey(yF1), t * 0.85);   // the bed mould
    o += RC(-K.earB, ey(yB), x(K.earB), ey(yF1 + K.bed * 0.45), t * 0.85);
    const c0 = ey(TOPY), c1 = ey(yB), cm = c0 + (c1 - c0) * 0.44;           // the crown, mitred back
    o += PT(`M ${f(-K.earK)} ${f(c0)} L ${f(x(K.earK))} ${f(c0)}`
      + (end ? ` L ${f(cut)} ${f(c1)}` : ` L ${f(W + K.earK)} ${f(cm)} L ${f(W + K.earB)} ${f(c1)}`)
      + ` L ${f(-K.earB)} ${f(c1)} L ${f(-K.earK)} ${f(cm)} Z`, t * 1.5);
    o += LN(-K.earK, cm, x(K.earK), cm, t * 0.8);
    o += LN(-K.earK + 3, c0 + (cm - c0) * 0.46, x(K.earK) - (end ? 0 : 3), c0 + (cm - c0) * 0.46, t * 0.6);
    o += corbel(0, ey(yF1), MO, CH, t);
    if (!end) o += corbel(W - MO, ey(yF1), MO, CH, t);
    if (end) {
      let d = `M ${f(cut)} ${f(ey(TOPY) - 10)}`;
      for (let y = ey(TOPY) - 10, i = 0; y < ey(yK0) + 10; y += 18, i++) d += ` L ${f(cut + (i % 2 ? -6 : 6))} ${f(y + 9)} L ${f(cut)} ${f(y + 18)}`;
      o += PT(d, t * 0.9);
    }
    return o;
  }

  function casing(lw, t, key, ground) {
    const W = lw + 2 * CAS;
    let o = "";
    [[0, CAS], [W - CAS, W]].forEach(([a, b]) => {
      const left = a === 0, m0 = left ? a : a + FR, m1 = left ? b - FR : b, l0 = left ? b - FR : a, l1 = left ? b : a + FR;
      o += RC(l0, ey(yL), l1, ey(0), t * 1.1);                              // the lining leg
      o += RC(m0, ey(yK0), m1, ey(K.plinth), t * 1.2);                      // the moulding leg, under the corbel
      o += reedsV(m0, m1, ey(yK0), ey(K.plinth), K.reeds, t);
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

  function headSection(t) {
    const lv = [[K.crown, K.projK], [K.bed, K.projB], [K.frieze, K.projC], [K.fil, K.projS + 4],
      [K.scal, K.projS], [K.arch, K.projA], [FR, K.projJ * 0.34]];
    let y = 0, d = "M 0 0";
    lv.forEach(([h, p]) => { d += ` L ${f(p)} ${f(y)} L ${f(p)} ${f(y + h)}`; y += h; });
    d += ` L 0 ${f(y)} Z`;
    return PT(d, t * 1.3, "url(#hatchCB)") + LN(-30, 0, 0, 0, t * 2.4) + LN(0, -12, 0, y + 12, t * 2.4);
  }

  // ═════════════ SHEET ═════════════
  window.DK.begin("casingb");
  let s = frame();
  s += `<defs><pattern id="hatchCB" patternUnits="userSpaceOnUse" width="6" height="6" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="6" stroke="#9a9a9a" stroke-width="0.9"/></pattern></defs>`;

  s += heading(18, 18, "DRESSING DOOR", "OPTION B · D2 · 2 FT 6 · THE CARVED HEAD · 1:20", 92);
  { const sc = 20, v = view(42, 36, sc, "Narrow door casing B"), t = v.w(0.12), W = K.leaf.w + 2 * CAS;
    s += v.g(casing(K.leaf.w, t, "door-narrow"), 0.3);
    s += chainH([v.X(0), v.X(CAS), v.X(CAS + K.leaf.w), v.X(W)], v.Y(E(0)) + 8, [CAS, K.leaf.w, CAS], { from: v.Y(E(0)) + 2, size: 1.25 });
    s += chainV([v.Y(E(0)), v.Y(E(yC)), v.Y(E(yF1)), v.Y(E(TOPY))], v.X(W) + 7, [K.leaf.h, yF1 - yC, TOPY - yF1], { from: v.X(W) + 2, size: 1.2 });
    s += chainV([v.Y(E(0)), v.Y(E(TOPY))], v.X(W) + 16, [`${TOPY} OVERALL`], { from: v.X(W) + 2, size: 1.3 }); }

  // The carved head belongs to the dressing door alone — the same rule as AST-DR-011. The main and
  // bathroom doors take the plain casing from that sheet, floor-aligned with the door beside it.
  s += heading(118, 18, "MAIN AND BATHROOM", "D1 3 FT · D3 2 FT 6 · PLAIN CASING · 1:20", 88);
  { const sc = 20, C = window.CASING, v = view(144, 36 + (TOPY - C.PTOP) / sc, sc, "Main door casing B"), t = v.w(0.12), W = K.wide + 2 * C.CAS;
    const pY = (y) => v.Y(C.PTOP - y);
    s += v.g(C.plain(K.wide, t, "door"), 0.3);
    s += chainH([v.X(0), v.X(C.CAS), v.X(C.CAS + K.wide), v.X(W)], pY(0) + 8, [C.CAS, K.wide, C.CAS], { from: pY(0) + 2, size: 1.25 }); }

  s += heading(216, 18, "1 · THE CORBEL", "ELEVATION · 1:2 · THE DRESSING DOOR ONLY", 78);
  { const sc = 2, v = view(238, 42, sc, "Corbel"), t = v.w(0.12);
    s += v.g(corbel(0, 0, MO, CH, t), 0.3);
    s += chainV([v.Y(0), v.Y(17), v.Y(54), v.Y(CH - 108), v.Y(CH - 20), v.Y(CH)], v.X(MO) + 6, ["CAP 17", "LEAF 37", "CHEVRONS", "KNOT 88", "FOOT 20"], { from: v.X(MO) + 1, size: 1.2 });
    s += chainH([v.X(-K.cProj), v.X(0), v.X(MO)], v.Y(CH) + 6, [K.cProj, MO], { from: v.Y(CH) + 1, size: 1.2 }); }

  s += heading(312, 18, "2 · THE LEAF", "PALMETTE · 1:1.5", 50);
  { const sc = 1.5, v = view(318, 40, sc, "Palmette"), t = v.w(0.12);
    s += v.g(RC(0, 0, MO, 37, t * 0.8) + palmette(MO / 2, 37 - 3.7, MO * 1.06, 32, t), 0.3);
    s += chainH([v.X(0), v.X(MO)], v.Y(37) + 5, [MO], { from: v.Y(37) + 1, size: 1.2 }); }

  s += heading(312, 76, "3 · THE KNOT", "INTERLACE · 1:1.5", 50);
  { const sc = 1.5, v = view(318, 92, sc, "Knot"), t = v.w(0.12);
    s += v.g(RC(0, 0, MO, 88, t * 0.8) + RC(6, 6, MO - 6, 82, t * 0.6) + knot(11, 11, MO - 22, 66, t), 0.3);
    s += chainH([v.X(0), v.X(MO)], v.Y(88) + 5, [MO], { from: v.Y(88) + 1, size: 1.2 });
    s += chainV([v.Y(0), v.Y(88)], v.X(MO) + 5, [88], { from: v.X(MO) + 1, size: 1.2 }); }

  s += heading(312, 150, "4 · SECTION", "THROUGH THE HEAD · 1:5", 50);
  { const sc = 5, v = view(322, 162, sc, "Head section B"), t = v.w(0.12);
    s += v.g(headSection(t), 0.3);
    s += chainH([v.X(0), v.X(K.projK)], v.Y(-10), [K.projK], { from: v.Y(-2), size: 1.2 }); }

  s += heading(18, 192, "NOTES", `OPTION B · REVISION ${K.rev.split(" ")[0]}`, 74);
  [["This is the alternative to AST-DR-011. Below the corbels the two", "are the same casing: a 2 in lining with a 4 in reeded moulding",
    "outside it, a plinth block at the foot, the same leaf.", "What changes is the head. Option A closes the corner with a",
    "moulded square block. Option B carries it on a carved corbel and", "lets the architrave, scallops and frieze die into it."],
   ["Each corbel is one piece, standing 14 proud of the casing on the", "wall side with a serpentine edge: a palmette under a small cap,",
    "eleven chevrons on a spine, and a shield knot woven through a", "lozenge at the foot. Dressing door only — the others go plain.",
    `The crown lands at ${TOPY} — 3 in higher than Option A — leaving`, "about 4 in of wall to the ceiling."]]
    .forEach((col, c) => col.forEach((n, i) => (s += text(18 + c * 104, 204 + i * 4.6, n, { size: 1.7, fill: INK }))));

  window.CASINGB = { CAS, TOPY, HEAD, draw: casing, head, corbel, CH };

  s += titleBlock({ title: "DOOR CASINGS — OPTION B", sub: "Carved corbels · Palmette · Chevrons · Knot", date: K.date, rev: K.rev, dwg: "AST-DR-012", scale: "AS NOTED @ A3" });
  window.DRAWINGS.casingb = { title: "Door casings, option B · AST-DR-012", svg: sheet(s), model: true };
})();
