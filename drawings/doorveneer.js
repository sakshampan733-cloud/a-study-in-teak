// Doors as they will actually be made — AST-DR-015.
//
// AST-DR-001 and -009 draw the door as solid timber: sunk panel fields, a carved shaped bead and
// carved roundels. The doors are veneered ply, and you cannot cut a sunk field or carve a boss into
// a 0.6 mm face without going through it. So nothing here is cut INTO the door. The leaf is flat and
// every line on it is a moulding PLANTED ON TOP, mitred at the corners, with a small applied block
// where the carved roundels were. From a step away it reads as the same door.
// Real-world units are mm; y measured UP from the floor.

window.DRAWINGS = window.DRAWINGS || {};

const DVEN = {
  rev: "1 — the buildable version: applied mouldings on a flat veneered leaf",
  date: "23.09.2026",
  H: 2311, T: 45,
  core: 38, lip: 12, ven: 0.6,          // blockboard core, solid teak lipping all round, veneer both faces
  widths: [{ key: "narrow", w: 762, name: "D2 · D3", sub: "DRESSING AND BATHROOM · 2 FT 6" },
           { key: "wide", w: 914, name: "D1", sub: "MAIN DOOR · 3 FT" }],
  marg: 100,                             // margin from the leaf edge to the moulding — the old stile width
  topRail: 100, lockRail: 230, botRail: 295,
  mould: { w: 45, p: 18 },               // the applied moulding: 45 on the face, standing 18 proud
  block: { s: 58, p: 22 },               // the applied corner block that replaces each carved roundel
  knob: { d: 55, y: 972, edge: 130 },
};

(function () {
  const { INK, THIN, f, text, mmToFt, view, chainH, chainV, heading, frame, titleBlock, sheet } = window.DK;
  const K = DVEN;
  const ft = (mm) => mmToFt(mm).replace("'-", " ft ").replace('"', " in").replace(/^0 ft /, "");
  const ey = (y) => K.H - y;
  const LN = (a, b, c, d, w) => `<line x1="${f(a)}" y1="${f(b)}" x2="${f(c)}" y2="${f(d)}" stroke-width="${w}"/>`;
  const RC = (a, b, c, d, w, fl) => `<rect x="${f(a)}" y="${f(b)}" width="${f(c - a)}" height="${f(d - b)}" fill="${fl || "none"}" stroke-width="${w}"/>`;

  // the two panel openings, set out on the panel square exactly as the solid door is
  // The HORIZONTAL lines are set once, off the 2 ft 6 leaf where the panel square works, and both
  // widths then share them — so all three doors line up with each other on a wall. Only the panel
  // WIDTH changes. (Taking two squares off the 3 ft leaf would make the upper panel so tall the
  // two frames would overlap.)
  const NARROW = 762, pw0 = NARROW - 2 * K.marg;      // 562 — the panel square
  const upperH = pw0 * 2, lowerH = pw0;               // 1124 and 562
  const panels = (w) => [
    { x0: K.marg, x1: w - K.marg, y0: K.H - K.topRail - upperH, y1: K.H - K.topRail },
    { x0: K.marg, x1: w - K.marg, y0: K.botRail, y1: K.botRail + lowerH },
  ];

  // A planted moulding round an opening: the outer edge of the moulding, its inner edge, the mitres,
  // and a block at each corner. Nothing is sunk — every line here stands off the face.
  function plantedFrame(p, t) {
    const m = K.mould.w, b = K.block.s;
    let o = RC(p.x0, ey(p.y1), p.x1, ey(p.y0), t * 1.3);                       // outer edge of the moulding
    o += RC(p.x0 + m, ey(p.y1 - m), p.x1 - m, ey(p.y0 + m), t * 1.1);          // inner edge
    [[p.x0, p.y1], [p.x1, p.y1], [p.x0, p.y0], [p.x1, p.y0]].forEach(([x, y]) => {
      const sx = x === p.x0 ? 1 : -1, sy = y === p.y1 ? -1 : 1;
      o += LN(x, ey(y), x + sx * m, ey(y + sy * m), t * 0.55);                 // the mitre
    });
    // the applied blocks, sitting over the mitres
    [[p.x0, p.y1], [p.x1, p.y1], [p.x0, p.y0], [p.x1, p.y0]].forEach(([x, y]) => {
      o += RC(x - b / 2, ey(y + b / 2), x + b / 2, ey(y - b / 2), t * 1.2, "#f4f1ea");
      o += RC(x - b / 2 + 11, ey(y + b / 2 - 11), x + b / 2 - 11, ey(y - b / 2 + 11), t * 0.7);
    });
    return o;
  }

  function leaf(w, t, active) {
    let o = RC(0, ey(K.H), w, ey(0), t * 1.6, "#fdfcfa");
    o += LN(K.lip, ey(K.H), K.lip, ey(0), t * 0.4) + LN(w - K.lip, ey(K.H), w - K.lip, ey(0), t * 0.4);
    o += LN(0, ey(K.H - K.lip), w, ey(K.H - K.lip), t * 0.4) + LN(0, ey(K.lip), w, ey(K.lip), t * 0.4);
    panels(w).forEach((p) => (o += plantedFrame(p, t)));
    if (active) {
      const y = ey(K.knob.y);
      o += `<circle cx="${f(w - K.knob.edge)}" cy="${f(y)}" r="${f(K.knob.d / 2)}" fill="none" stroke-width="${t * 1.2}"/>`;
      o += `<circle cx="${f(w - K.knob.edge)}" cy="${f(y)}" r="${f(K.knob.d / 2 - 10)}" fill="none" stroke-width="${t * 0.6}"/>`;
      o += `<circle cx="${f(w - 42)}" cy="${f(y)}" r="17" fill="none" stroke-width="${t * 0.9}"/>`;
    }
    o += LN(-160, ey(0), w + 160, ey(0), t * 3);
    return o;
  }

  // section through the leaf on the flat: core, lipping, veneer, and the moulding standing on it
  function section(t) {
    const w = 180, c = K.core, v = 3;                                  // veneer drawn thick enough to see
    let o = RC(0, 0, w, c, t * 1.2, "url(#hatchDV)");                  // the blockboard core
    o += RC(0, -v, w, 0, t, "#cfc7b6") + RC(0, c, w, c + v, t, "#cfc7b6");
    o += RC(-K.lip, -v, 0, c + v, t * 1.2, "#e6dfd0");                 // solid lipping on the edge
    const m = K.mould.w, p = K.mould.p, x0 = 70;
    let d = `M ${f(x0)} ${f(-v)} L ${f(x0)} ${f(-v - p * 0.3)}`;
    d += ` Q ${f(x0 + 6)} ${f(-v - p)} ${f(x0 + 18)} ${f(-v - p)}`;
    d += ` L ${f(x0 + m - 16)} ${f(-v - p)} Q ${f(x0 + m - 4)} ${f(-v - p)} ${f(x0 + m - 4)} ${f(-v - p * 0.55)}`;
    d += ` L ${f(x0 + m)} ${f(-v - p * 0.2)} L ${f(x0 + m)} ${f(-v)} Z`;
    o += `<path d="${d}" fill="#e6dfd0" stroke-width="${t * 1.2}"/>`;
    return o;
  }

  // ═════════════ SHEET ═════════════
  window.DK.begin("doorveneer");
  let s = frame();
  s += `<defs><pattern id="hatchDV" patternUnits="userSpaceOnUse" width="7" height="7" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="7" stroke="#a5a5a5" stroke-width="1"/></pattern></defs>`;

  const sc = 12;
  K.widths.forEach((W, i) => {
    const ox = 26 + i * 94;
    s += heading(ox - 6, 17, W.name, W.sub, 86);
    const v = view(ox, 34, sc, `${W.key} leaf`), t = v.w(0.13);
    s += v.g(leaf(W.w, t, true), 0.3);
    const P = panels(W.w);
    s += chainH([v.X(0), v.X(K.marg), v.X(W.w - K.marg), v.X(W.w)], v.Y(ey(0)) + 6, [K.marg, W.w - 2 * K.marg, K.marg], { from: v.Y(ey(0)) + 1, size: 1.25 });
    s += chainH([v.X(0), v.X(W.w)], v.Y(ey(0)) + 12, [W.w], { from: v.Y(ey(0)) + 1, size: 1.4 });
    if (i === 0) {
      s += chainV([v.Y(ey(0)), v.Y(ey(K.botRail)), v.Y(ey(P[1].y1)), v.Y(ey(P[0].y0)), v.Y(ey(P[0].y1)), v.Y(ey(K.H))],
        v.X(W.w) + 6, [K.botRail, lowerH, P[0].y0 - P[1].y1, upperH, K.topRail], { from: v.X(W.w) + 1, size: 1.2 });
    }
    s += chainV([v.Y(ey(0)), v.Y(ey(K.knob.y))], v.X(0) - 5, [`${K.knob.y}`], { from: v.X(0) - 1, size: 1.2 });
  });

  s += heading(212, 17, "1 · THROUGH THE LEAF", "SECTION · 1:2 · BLOCKBOARD, LIPPING, VENEER, MOULDING ON TOP", 92);
  { const v = view(220, 58, 2, "Leaf section"), t = v.w(0.12);
    s += v.g(section(t), 0.3);
    s += chainH([v.X(-K.lip), v.X(0), v.X(70), v.X(70 + K.mould.w)], v.Y(K.core + 22), [K.lip, 70, K.mould.w], { from: v.Y(K.core + 6), size: 1.2 });
    s += chainV([v.Y(-3 - K.mould.p), v.Y(-3), v.Y(K.core + 3)], v.X(-K.lip) - 6, [K.mould.p, K.core + 6], { from: v.X(-K.lip) - 1, size: 1.2 }); }

  s += heading(212, 96, "2 · CORNER BLOCK", "ELEVATION AND SECTION · 1:2", 92);
  { const v = view(232, 116, 2, "Corner block"), t = v.w(0.12), b = K.block.s;
    s += v.g(RC(0, 0, b, b, t * 1.3, "#f4f1ea") + RC(11, 11, b - 11, b - 11, t * 0.8)
      + RC(b + 40, 0, b + 40 + K.block.p, b, t * 1.2, "#e6dfd0") + LN(b + 40, 0, b + 40, b, t * 0.5), 0.3);
    s += chainH([v.X(0), v.X(b)], v.Y(b) + 5, [b], { from: v.Y(b) + 1, size: 1.2 });
    s += chainH([v.X(b + 40), v.X(b + 40 + K.block.p)], v.Y(b) + 5, [K.block.p], { from: v.Y(b) + 1, size: 1.2 }); }

  s += heading(310, 17, "WHY THIS SHEET", "AST-DR-001 AND -009 CANNOT BE MADE IN VENEER", 100);
  ["The other door sheets draw the leaf as solid timber: the panel",
   "fields are sunk into it, the shaped bead is carved, and the four",
   "roundels are carved bosses.",
   "",
   "A veneered door is a blockboard core with a face 0.6 mm thick.",
   "Cut a sunk field or a carved boss into that and the cutter goes",
   "straight through the veneer into the core, which then shows.",
   "There is no way to CNC it and no way to hand-carve it.",
   "",
   "So on this sheet nothing is cut into the leaf. The face stays",
   "flat and veneered, and every line is a moulding planted on top:",
   "mitred at the corners, glued and pinned, with a small applied",
   "block where each carved roundel was.",
   "",
   "The panel layout does not change — the upper opening is still",
   "two panel squares and the lower one is one — so from a step",
   "away it reads as the same door.",
  ].forEach((n, i) => (s += text(310, 30 + i * 4.4, n, { size: 1.7, fill: INK })));

  s += heading(310, 130, "RELIEF", "FACE OF THE VENEER = DATUM 0 · EVERYTHING STANDS OUT, NOTHING GOES IN", 100);
  [["Blockboard core", `${K.core} THICK`],
   ["Veneer, both faces", `${K.ven} EACH`],
   ["Solid lipping, all four edges", `${K.lip} WIDE`],
   ["Leaf overall", `${K.T} THICK`],
   ["Applied panel moulding", `${K.mould.w} WIDE · ${K.mould.p} OUT`],
   ["Applied corner block", `${K.block.s} SQ · ${K.block.p} OUT`],
   ["Mitres at the moulding corners", "CUT, NOT SCRIBED"],
   ["Anything cut INTO the face", "NONE"],
  ].forEach(([a, b], i) => {
    s += text(310, 143 + i * 4.4, a, { size: 1.65 });
    s += text(410, 143 + i * 4.4, b, { size: 1.65, anchor: "end", fill: THIN });
  });

  s += heading(212, 150, "NOTES", `REVISION ${K.rev.split(" ")[0]}`, 92);
  [`Leaf ${ft(K.H)} tall, ${K.T} thick. Widths ${ft(762)} and ${ft(914)}.`,
   `Moulding margin ${ft(K.marg)} from every leaf edge, as the old stile.`,
   `Bottom rail ${ft(K.botRail)}, lock rail ${ft(K.lockRail)}, top ${ft(K.topRail)}.`,
   "Both widths share the same horizontal lines, so the three doors",
   "   line up with each other; only the panel width changes.",
   "Lipping is solid teak so the edges can be cleaned up and the",
   "   hinges and lock screwed into wood, not into board.",
   "Veneer both faces of the core, and balance it: the same",
   "   thickness on the back or the leaf will bow.",
   "Moulding and blocks in solid teak, veneered faces polished to",
   "   match — the moulding is small enough to take solid.",
   "OPEN: mitre the moulding at the blocks, or butt it into them?",
   "   Butting is easier and is what the casing already does.",
  ].forEach((n, i) => (s += text(212, 163 + i * 4.4, n, { size: 1.65, fill: n.startsWith("OPEN") ? "#b3261e" : INK })));

  s += titleBlock({ title: "DOORS — AS MADE IN VENEER", sub: "Applied mouldings · No engraving · Both widths", date: K.date, rev: K.rev, dwg: "AST-DR-015", scale: "AS NOTED @ A3" });
  window.DRAWINGS.doorveneer = { title: "Doors in veneer · AST-DR-015", svg: sheet(s), model: true };
})();
