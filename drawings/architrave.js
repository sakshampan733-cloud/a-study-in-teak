// Door casings — AST-DR-011. The frame is 2 in on the face; the moulding adds 4 in outside it,
// so the casing is 6 in all round. The dressing door is the carved one; the other two are plain.
// Real-world units are mm; y measured UP from the floor.

window.DRAWINGS = window.DRAWINGS || {};

const ARCH = {
  rev: "1 — 2 in frame, 4 in moulding, 6 in casing",
  date: "18.09.2026",
  leaf: { w: 762, h: 2311 },     // the dressing door, 2 ft 6 × 7 ft 7
  wide: 914,                     // D1, the main door
  frame: 51,                     // the lining, 2 in on the face
  mould: 102,                    // the moulding over it, 4 in
  block: 153,                    // corner block = the full casing width
  plinth: 230,                   // plinth block height
  proj: 30,                      // how far the casing stands off the wall
  skirt: 102,                    // the marble skirting it meets
};

(function () {
  const { INK, THIN, f, text, view, chainH, chainV, note, labels, heading, frame, titleBlock, sheet } = window.DK;
  const K = ARCH, CAS = K.frame + K.mould, TOPY = K.leaf.h + CAS;
  const LN = (a, b, c, d, w) => `<line x1="${f(a)}" y1="${f(b)}" x2="${f(c)}" y2="${f(d)}" stroke-width="${w}"/>`;
  const RC = (a, b, c, d, w, fill) => `<rect x="${f(a)}" y="${f(b)}" width="${f(c - a)}" height="${f(d - b)}" fill="${fill || "none"}" stroke-width="${w}"/>`;

  // ── the casing in elevation, round an opening of width lw ──
  function casing(lw, t, carved) {
    const W = lw + 2 * CAS, ey = (y) => TOPY - y;
    let o = "";
    o += RC(0, ey(TOPY), W, ey(0), t * 1.5);
    o += RC(CAS, ey(K.leaf.h), CAS + lw, ey(0), t * 1.5);          // the opening
    // the architrave runs between the blocks
    o += RC(0, ey(K.leaf.h), CAS, ey(K.plinth), t);
    o += RC(W - CAS, ey(K.leaf.h), W, ey(K.plinth), t);
    o += RC(CAS, ey(TOPY), W - CAS, ey(K.leaf.h), t);
    // the steps of the moulding, shown as lines down the face
    [0.30, 0.55, 0.78].forEach((u) => {
      o += LN(CAS * u, ey(K.leaf.h), CAS * u, ey(K.plinth), t * 0.7);
      o += LN(W - CAS * u, ey(K.leaf.h), W - CAS * u, ey(K.plinth), t * 0.7);
      o += LN(CAS, ey(K.leaf.h + CAS * u), W - CAS, ey(K.leaf.h + CAS * u), t * 0.7);
    });
    // corner blocks
    [[0, K.block], [W - K.block, W]].forEach(([a, b]) => {
      o += RC(a, ey(TOPY), b, ey(K.leaf.h), t * 1.4);
      if (carved) {
        for (let i = 0; i < 4; i++) {                              // chevrons, as the reference
          const yy = K.leaf.h + 22 + i * 30;
          o += `<path d="M ${f(a + 18)} ${f(ey(yy))} L ${f((a + b) / 2)} ${f(ey(yy + 20))} L ${f(b - 18)} ${f(ey(yy))}" fill="none" stroke-width="${t * 0.8}"/>`;
        }
        o += RC(a + 52, ey(K.leaf.h + 132), b - 52, ey(K.leaf.h + 14), t * 0.8);
      } else {
        o += RC(a + 30, ey(TOPY - 30), b - 30, ey(K.leaf.h + 30), t * 0.8);
      }
    });
    // plinth blocks
    [[0, K.block], [W - K.block, W]].forEach(([a, b]) => {
      o += RC(a, ey(K.plinth), b, ey(0), t * 1.4);
      o += LN(a, ey(K.plinth - 16), b, ey(K.plinth - 16), t * 0.7);
      o += LN(a, ey(K.skirt), b, ey(K.skirt), t * 0.7);
    });
    o += LN(-120, ey(0), W + 120, ey(0), t * 3);                   // floor
    return o;
  }

  // ── the profile, in section ──
  function profile(t) {
    const p = K.proj;
    let d = `M 0 0 L 0 ${-p * 0.22} L ${K.frame} ${-p * 0.22} L ${K.frame} ${-p * 0.5}`;   // lining, then the step up
    d += ` L ${K.frame + 14} ${-p * 0.5} Q ${K.frame + 26} ${-p * 0.5} ${K.frame + 26} ${-p * 0.72}`;   // ovolo
    d += ` L ${K.frame + 26} ${-p * 0.78} L ${K.frame + 40} ${-p * 0.78}`;
    d += ` Q ${K.frame + 62} ${-p * 0.78} ${K.frame + 70} ${-p}`;                          // the big cavetto
    d += ` L ${CAS - 10} ${-p} Q ${CAS} ${-p} ${CAS} ${-p * 0.8} L ${CAS} 0 Z`;
    return `<path d="${d}" fill="url(#hatchAR)" stroke-width="${t}"/>` +
      LN(-30, 0, CAS + 18, 0, t * 2) + text(-34, -3, "WALL", { size: 2.4, anchor: "end", fill: THIN });
  }

  // ═════════════ SHEET ═════════════
  window.DK.begin("architrave");
  let s = frame();
  s += `<defs><pattern id="hatchAR" patternUnits="userSpaceOnUse" width="6" height="6" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="6" stroke="#9a9a9a" stroke-width="0.9"/></pattern></defs>`;

  s += heading(18, 18, "DRESSING DOOR", `CASING 6 IN ALL ROUND · CARVED BLOCKS · 1:14`, 84);
  { const sc = 14, v = view(24, 34, sc, "Dressing door casing"), t = v.w(0.12);
    s += v.g(casing(K.leaf.w, t, true), 0.3);
    const W = K.leaf.w + 2 * CAS;
    s += chainH([v.X(0), v.X(CAS), v.X(CAS + K.leaf.w), v.X(W)], v.Y(TOPY) + 7, [CAS, K.leaf.w, CAS], { from: v.Y(TOPY) + 1, size: 1.3 });
    s += chainV([v.Y(0), v.Y(TOPY - K.leaf.h), v.Y(TOPY)], v.X(W) + 6, [K.leaf.h, CAS], { from: v.X(W) + 1, size: 1.3 });
    s += chainV([v.Y(0), v.Y(TOPY)], v.X(W) + 13, [`${TOPY} — 8 FT 1 IN`], { from: v.X(W) + 1, size: 1.4 }); }

  s += heading(120, 18, "MAIN AND BATHROOM", "THE SAME CASING, PLAIN BLOCKS · 1:14", 84);
  { const sc = 14, v = view(126, 34, sc, "Plain door casing"), t = v.w(0.12);
    s += v.g(casing(K.wide, t, false), 0.3);
    const W = K.wide + 2 * CAS;
    s += chainH([v.X(0), v.X(CAS), v.X(CAS + K.wide), v.X(W)], v.Y(TOPY) + 7, [CAS, K.wide, CAS], { from: v.Y(TOPY) + 1, size: 1.3 }); }

  s += heading(232, 18, "1 · THE CASING", "SECTION · 1:1 · 2 IN FRAME + 4 IN MOULDING", 74);
  { const sc = 1, v = view(240, 62, sc, "Casing section"), t = v.w(0.12);
    s += v.g(profile(t), 0.3);
    s += chainH([v.X(0), v.X(K.frame), v.X(CAS)], v.Y(14), [`${K.frame} FRAME`, `${K.mould} MOULDING`], { from: v.Y(2), size: 1.4 });
    s += chainV([v.Y(-K.proj), v.Y(0)], v.X(CAS) + 6, [K.proj], { from: v.X(CAS) + 1, size: 1.4 }); }

  s += heading(232, 96, "2 · CORNER BLOCK", "CARVED · DRESSING DOOR ONLY · 1:3", 74);
  { const sc = 3, v = view(240, 112, sc, "Corner block"), t = v.w(0.12);
    let g = RC(0, 0, K.block, K.block, t * 1.5);
    for (let i = 0; i < 4; i++) g += `<path d="M 18 ${f(K.block - 22 - i * 30)} L ${f(K.block / 2)} ${f(K.block - 42 - i * 30)} L ${f(K.block - 18)} ${f(K.block - 22 - i * 30)}" fill="none" stroke-width="${t}"/>`;
    g += RC(52, 14, K.block - 52, 132, t);
    s += v.g(g, 0.3);
    s += chainH([v.X(0), v.X(K.block)], v.Y(K.block) + 6, [`${K.block} SQUARE`], { from: v.Y(K.block) + 1, size: 1.4 }); }

  s += heading(304, 96, "3 · PLINTH BLOCK", "AT THE FOOT · 1:3", 62);
  { const sc = 3, v = view(312, 112, sc, "Plinth block"), t = v.w(0.12);
    let g = RC(0, 0, K.block, K.plinth, t * 1.5);
    g += LN(0, 16, K.block, 16, t) + LN(0, K.plinth - K.skirt, K.block, K.plinth - K.skirt, t * 0.8);
    g += text(K.block / 2, K.plinth - 34, "SKIRTING", { size: 5, anchor: "middle", fill: THIN });
    s += v.g(g, 0.3);
    s += chainV([v.Y(0), v.Y(K.plinth)], v.X(K.block) + 6, [K.plinth], { from: v.X(K.block) + 1, size: 1.4 }); }

  s += heading(20, 228, "NOTES", `REVISION ${K.rev.split(" ")[0]}`, 74);
  const NOTES_L = ["The frame is 2 in on the face. The moulding adds 4 in",
   "outside it, so the casing is 6 in all round and its head",
   "sits at 8 ft 1 in.",
   "Depth comes from four small steps, not from one big",
   `member — the whole thing stands only ${K.proj} off the wall.`,
   "No crown: there is only 4 in to play with."];
  const NOTES_R = ["Corner blocks and plinth blocks at every door, so the",
   "head and jamb die into a block instead of being mitred,",
   "and the architrave meets the marble skirting square.",
   "Only the dressing door is carved — chevrons and a sunk",
   "panel. The main and bathroom doors take the same casing",
   "with plain blocks: one family, one of them the important",
   "one. The moulding face is reeded, as the study pilasters."];
  NOTES_L.forEach((n, i) => (s += text(20, 240 + i * 4.4, n, { size: 1.7 })));
  NOTES_R.forEach((n, i) => (s += text(150, 240 + i * 4.4, n, { size: 1.7, fill: i > 2 ? INK : INK })));

  s += titleBlock({ title: "DOOR CASINGS", sub: "Dressing · Main and bathroom · Section · Blocks", date: K.date, rev: K.rev, dwg: "AST-DR-011", scale: "AS NOTED @ A3" });
  window.DRAWINGS.architrave = { title: "Door casings · AST-DR-011", svg: sheet(s), model: true };
})();
