// Doors — how they are MADE, not how they look — AST-DR-015.
//
// The design does not change. The elevations on this sheet are the same drawing as AST-DR-001 and
// -009, generated from the same code, so every line lands in the same place: the two panels, the
// shaped bead with its concave shoulders and rounded crown, the four roundels, the knob on the
// lock rail.
//
// What changes is how it is built. The leaf is veneered blockboard, and a veneer face is 0.6 mm
// thick — you cannot sink a panel field into it or carve a boss out of it without going through.
// So every one of those members is made separately in solid teak and PLANTED on a flat veneered
// face: the ovolo run round each panel, the shaped bead bandsawn to its curve, the roundels turned
// and glued on. Same door. Different order of work.
// Real-world units are mm; y measured DOWN from the top of the leaf, as the door sheets have it.

window.DRAWINGS = window.DRAWINGS || {};

const DVEN = {
  rev: "2 — the design unchanged; only the construction differs",
  date: "23.09.2026",
  core: 38, lip: 12, ven: 0.6,     // blockboard core, solid teak lipping all round, veneer both faces
  T: 45,
  ovolo: { w: 20, p: 12 },         // the sticking, planted round each panel instead of worked in
  bead: { w: 10, p: 6 },           // the shaped bead, bandsawn to its curve and planted
  boss: { d: 26, p: 5 },           // each roundel, turned and glued on
};

(function () {
  const { INK, THIN, f, text, mmToFt, view, chainH, chainV, note, heading, frame, titleBlock, sheet } = window.DK;
  const K = DVEN, D = window.DOORLEAF;
  const LN = (a, b, c, d, w) => `<line x1="${f(a)}" y1="${f(b)}" x2="${f(c)}" y2="${f(d)}" stroke-width="${w}"/>`;
  const RC = (a, b, c, d, w, fl) => `<rect x="${f(a)}" y="${f(b)}" width="${f(c - a)}" height="${f(d - b)}" fill="${fl || "none"}" stroke-width="${w}"/>`;
  const LEAVES = [
    { key: "door-narrow", name: "D2 · D3", sub: "DRESSING AND BATHROOM · 2 FT 6 · AS AST-DR-009" },
    { key: "door", name: "D1", sub: "MAIN DOOR · 3 FT · AS AST-DR-001" },
  ];

  // ── section through the leaf, cut across a panel: core, lipping, veneer, and the planted work ──
  function section(t) {
    const c = K.core, v = 2.2, W = 250;
    let o = RC(0, 0, W, c, t * 1.1, "url(#hatchDV)");                                    // blockboard core
    o += RC(0, -v, W, 0, t * 0.9, "#cfc7b6") + RC(0, c, W, c + v, t * 0.9, "#cfc7b6");   // veneer, both faces
    o += RC(-K.lip, -v, 0, c + v, t * 1.1, "#e6dfd0");                                   // solid lipping
    const x0 = 78, w = K.ovolo.w, p = K.ovolo.p;                                          // the ovolo, planted
    let d = `M ${f(x0)} ${f(-v)} L ${f(x0)} ${f(-v - p * 0.35)}`;
    d += ` Q ${f(x0 + 1)} ${f(-v - p)} ${f(x0 + p * 0.8)} ${f(-v - p)}`;
    d += ` L ${f(x0 + w - 3)} ${f(-v - p)} L ${f(x0 + w)} ${f(-v - p * 0.7)} L ${f(x0 + w)} ${f(-v)} Z`;
    o += `<path d="${d}" fill="#e6dfd0" stroke-width="${t * 1.1}"/>`;
    const b0 = x0 + w + 46;                                                               // the shaped bead
    o += `<path d="M ${f(b0)} ${f(-v)} Q ${f(b0)} ${f(-v - K.bead.p)} ${f(b0 + K.bead.w / 2)} ${f(-v - K.bead.p)}`
      + ` Q ${f(b0 + K.bead.w)} ${f(-v - K.bead.p)} ${f(b0 + K.bead.w)} ${f(-v)} Z" fill="#e6dfd0" stroke-width="${t * 1.1}"/>`;
    o += LN(-K.lip - 26, -v, W + 10, -v, t * 0.4);                                        // the face — the datum
    return o;
  }

  // ═════════════ SHEET ═════════════
  window.DK.begin("doorveneer");
  let s = frame();
  s += `<defs><pattern id="hatchDV" patternUnits="userSpaceOnUse" width="7" height="7" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="7" stroke="#a5a5a5" stroke-width="1"/></pattern></defs>`;

  // The elevations are the door sheets' own leaf, drawn by the same code. Nothing here is redrawn,
  // so the design cannot drift from AST-DR-001 and -009.
  const sc = 12;
  LEAVES.forEach((W, i) => {
    const L = D && D[W.key];
    if (!L) return;
    const ox = 26 + i * 92;
    s += heading(ox - 8, 17, W.name, W.sub, 84);
    const v = view(ox, 34, sc, `${W.key} leaf`), t = v.w(0.13);
    s += v.g(`<g stroke-width="${t}">${L.draw(t * 0.7)}</g>` + LN(-150, L.h, L.w + 150, L.h, t * 3), 0.3);
    s += chainH([v.X(0), v.X(L.w)], v.Y(L.h) + 6, [L.w], { from: v.Y(L.h) + 1, size: 1.4 });
    if (i === 0) s += chainV([v.Y(0), v.Y(L.h)], v.X(L.w) + 6, [L.h], { from: v.X(L.w) + 1, size: 1.3 });
  });
  s += text(26, 232, "THE SAME DRAWING AS THE DOOR SHEETS — NOT A REDRAW", { size: 1.9, ls: 0.4, fill: INK });
  s += text(26, 237.6, "Both elevations are generated from the door sheets' own code, so the design cannot", { size: 1.6, fill: THIN });
  s += text(26, 242, "drift. Nothing on this sheet changes how the door LOOKS — only how it is made.", { size: 1.6, fill: THIN });

  // ── 1 · section ──
  s += heading(212, 17, "1 · THROUGH THE LEAF", "SECTION ACROSS A PANEL · 1:2 · EVERY MEMBER PLANTED ON", 96);
  { const v = view(240, 66, 2, "Leaf section"), t = v.w(0.12);
    s += v.g(section(t), 0.3);
    s += chainH([v.X(-K.lip), v.X(0), v.X(78), v.X(78 + K.ovolo.w)], v.Y(K.core + 20), [K.lip, 78, K.ovolo.w], { from: v.Y(K.core + 5), size: 1.2 });
    s += chainV([v.Y(-2.2 - K.ovolo.p), v.Y(-2.2), v.Y(K.core + 2.2)], v.X(-K.lip) - 6, [K.ovolo.p, K.T], { from: v.X(-K.lip) - 1, size: 1.2 });
    s += note(v.X(88), v.Y(-2.2 - K.ovolo.p), v.X(150), v.Y(-40), "OVOLO — PLANTED", "NOT WORKED INTO THE STILE");
    s += note(v.X(152), v.Y(-2.2 - K.bead.p), v.X(206), v.Y(-24), "SHAPED BEAD", "BANDSAWN, THEN PLANTED");
    s += note(v.X(40), v.Y(K.core / 2), v.X(140), v.Y(K.core + 40), "BLOCKBOARD CORE", "VENEERED BOTH FACES"); }

  // ── 2 · each carved member becomes a planted one ──
  s += heading(212, 112, "2 · WHAT CHANGES", "THE SAME MEMBERS, MADE SEPARATELY AND GLUED ON", 96);
  [["Panel field", "sunk 13.5 into the solid", "stays FLAT — the ovolo round it does the work"],
   ["Ovolo sticking", "worked on the stile edge", "run as a separate 20 × 12 moulding, mitred on"],
   ["Shaped bead", "carved into the panel face", "bandsawn to the curve in 10 × 6, planted on"],
   ["Corner roundels", "carved bosses", `turned discs Ø${K.boss.d} × ${K.boss.p}, glued on`],
   ["The leaf", "solid teak, 45", "38 blockboard, 12 lipping, veneer both sides"]]
    .forEach(([a, b, c], i) => {
      const y = 126 + i * 9;
      s += text(212, y, a, { size: 1.75, weight: 700 });
      s += text(212, y + 3.6, "was:   " + b, { size: 1.5, fill: THIN });
      s += text(212, y + 6.8, "now:  " + c, { size: 1.5, fill: INK });
    });

  // ── relief ──
  s += heading(310, 17, "RELIEF", "FACE OF THE VENEER = DATUM 0", 100);
  [["Blockboard core", `${K.core}`], ["Veneer, each face", `${K.ven}`], ["Solid lipping, four edges", `${K.lip} WIDE`],
   ["Leaf overall", `${K.T}`], ["Ovolo, planted", `${K.ovolo.w} W · ${K.ovolo.p} OUT`],
   ["Shaped bead, planted", `${K.bead.w} W · ${K.bead.p} OUT`], ["Roundel boss, glued on", `Ø${K.boss.d} · ${K.boss.p} OUT`],
   ["Panel field", "FLAT · 0"], ["Anything cut INTO the face", "NONE"]]
    .forEach(([a, b], i) => {
      s += text(310, 30 + i * 4.4, a, { size: 1.6 });
      s += text(410, 30 + i * 4.4, b, { size: 1.6, anchor: "end", fill: THIN });
    });

  s += heading(310, 78, "NOTES", `REVISION ${K.rev.split(" ")[0]}`, 100);
  ["The design is not up for change here. If the shaped bead or the",
   "roundels ever change they change on AST-DR-001 and -009, and this",
   "sheet follows — it draws from the same code.",
   "",
   "Lipping is solid teak on all four edges so the leaf can be trimmed",
   "on site and the hinges and lock screw into wood, not into board.",
   "",
   "Veneer both faces of the core and balance it: same thickness back",
   "and front, or the leaf will bow.",
   "",
   "Ovolo, bead and bosses in solid teak, polished to match. They are",
   "small enough to take solid without moving, and they give a crisper",
   "arris than a cut face would.",
   "",
   "Set the bead out from the panel opening, not from the leaf edge, so",
   "the four roundels land exactly on the corners of the curve.",
   "",
   "OPEN — glue and pin, or glue only? Pins need filling and the filler",
   "   shows through polish. Glue and cramp if the shop can.",
  ].forEach((n, i) => (s += text(310, 91 + i * 4.3, n, { size: 1.6, fill: n.startsWith("OPEN") ? "#b3261e" : INK })));

  s += titleBlock({ title: "DOORS — MADE IN VENEER", sub: "Same design · Planted mouldings · Construction only", date: K.date, rev: K.rev, dwg: "AST-DR-015", scale: "AS NOTED @ A3" });
  window.DRAWINGS.doorveneer = { title: "Doors in veneer · AST-DR-015", svg: sheet(s), model: true };
})();
