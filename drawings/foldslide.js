// Dressing room — the two end bays' doors. AST-DR-026.
// A hinged leaf at the back of either run would swing into the free-standing mirror. Two leaves hinged
// together always fold into a triangle, so the question is only where the triangle goes: A and B fold it
// INTO the cupboard and push the folded pair back; C is an ordinary bifold that folds it out into the
// room, at the front end, clear of the mirror. Plan views. Real-world units are mm. See the video on the site.

window.DRAWINGS = window.DRAWINGS || {};

(function () {
  const { INK, THIN, f, text, view, chainH, heading, frame, titleBlock, sheet } = window.DK;
  const K = window.WDR || { W: 2819, D: 3759, depth: 686, leftRun: 2845, nLeft: 3, nRight: 4, mirror: 914 };
  const RED = "#b3261e", STEEL = "#2a2a2a", CARC = "#f1ece0", BRASS = "#a07a2c";
  const F = K.depth, corridor = K.W - 2 * F, mx = F + (corridor - K.mirror) / 2;
  const bw = K.leftRun / K.nLeft, w = (bw - 76) / 2, tk = 80, push = F - w - 32;
  const R = (x0, y0, x1, y1, a = "") => `<rect x="${f(Math.min(x0, x1))}" y="${f(Math.min(y0, y1))}" width="${f(Math.abs(x1 - x0))}" height="${f(Math.abs(y1 - y0))}" ${a}/>`;
  const pack = (x0, y0, x1, y1) => R(x0, y0, x1, y1, `fill="${STEEL}" stroke="none"`);
  const arc = (cx, cy, r, a0, a1, th) => {
    const p = (a) => [cx + r * Math.cos(a), cy + r * Math.sin(a)];
    const [x0, y0] = p(a0), [x1, y1] = p(a1);
    return `<path d="M ${f(x0)} ${f(y0)} A ${r} ${r} 0 0 ${a1 > a0 ? 1 : 0} ${f(x1)} ${f(y1)}" fill="none" stroke="${RED}" stroke-width="${th * 0.8}" stroke-dasharray="${th * 3} ${th * 2}"/>`;
  };

  // ── the room, with the end bays open as option A
  function room(th) {
    let o = R(0, 0, K.W, K.D, `fill="none" stroke="${INK}" stroke-width="${th * 1.6}"`);
    o += R(0, 0, F, K.leftRun, `fill="${CARC}" stroke="${STEEL}" stroke-width="${th}"`);
    o += R(K.W - F, 0, K.W, K.D, `fill="${CARC}" stroke="${STEEL}" stroke-width="${th}"`);
    for (let i = 1; i < K.nLeft; i++) o += `<line x1="0" y1="${f(i * bw)}" x2="${f(F)}" y2="${f(i * bw)}" stroke="${STEEL}" stroke-width="${th * 0.5}"/>`;
    const rb = K.D / K.nRight;
    for (let i = 1; i < K.nRight; i++) o += `<line x1="${f(K.W - F)}" y1="${f(i * rb)}" x2="${f(K.W)}" y2="${f(i * rb)}" stroke="${STEEL}" stroke-width="${th * 0.5}"/>`;
    // closed fronts on the ordinary bays
    o += `<line x1="${f(F)}" y1="${f(bw)}" x2="${f(F)}" y2="${f(K.leftRun)}" stroke="${STEEL}" stroke-width="${th * 3}"/>`;
    o += `<line x1="${f(K.W - F)}" y1="${f(rb)}" x2="${f(K.W - F)}" y2="${f(K.D)}" stroke="${STEEL}" stroke-width="${th * 3}"/>`;
    // option A packs, folded in and pushed back against the mirror-end side panel
    o += pack(F - push - w, 40, F - push, 40 + tk);
    o += pack(K.W - F + push, 40, K.W - F + push + w, 40 + tk);
    // the wardrobe front lines, and the mirror
    o += `<line x1="${f(F)}" y1="0" x2="${f(F)}" y2="${f(K.D)}" stroke="${RED}" stroke-width="${th * 0.9}" stroke-dasharray="${th * 4} ${th * 3}"/>`;
    o += `<line x1="${f(K.W - F)}" y1="0" x2="${f(K.W - F)}" y2="${f(K.D)}" stroke="${RED}" stroke-width="${th * 0.9}" stroke-dasharray="${th * 4} ${th * 3}"/>`;
    o += R(mx, 20, mx + K.mirror, 90, `fill="#dfe4e6" stroke="${STEEL}" stroke-width="${th * 1.2}"`);
    return o;
  }

  // ── one end bay in plan, open, in each of the three ways. x = into the room from the back of the
  // cupboard (front face at x = F); y = along the wall, 0 at the mirror end.
  function bay(th, opt) {
    const room = 560;
    let o = R(0, 0, F, bw, `fill="${CARC}" stroke="${STEEL}" stroke-width="${th * 1.3}"`);
    o += R(F, 0, F + room, bw, `fill="#fafafa" stroke="none"`);
    o += `<line x1="${f(F)}" y1="0" x2="${f(F)}" y2="${f(bw)}" stroke="${RED}" stroke-width="${th * 1.1}" stroke-dasharray="${th * 4} ${th * 3}"/>`;
    o += `<line x1="${f(F - 10)}" y1="${f(20)}" x2="${f(F - 10)}" y2="${f(bw - 20)}" stroke="${BRASS}" stroke-width="${th * 1.6}"/>`;   // head track
    if (opt === "A") {
      o += arc(F, 38, w, Math.PI / 2, Math.PI, th);
      o += `<line x1="${f(F)}" y1="38" x2="${f(F - push - w)}" y2="38" stroke="${BRASS}" stroke-width="${th * 1.6}"/>`;   // runner
      o += pack(F - push - w, 38, F - push, 38 + tk);
    } else if (opt === "B") {
      o += arc(F, bw - 38, w, -Math.PI / 2, -Math.PI, th);
      o += `<line x1="${f(F)}" y1="${f(bw - 38)}" x2="${f(F - push - w)}" y2="${f(bw - 38)}" stroke="${BRASS}" stroke-width="${th * 1.6}"/>`;
      o += pack(F - push - w, bw - 38 - tk, F - push, bw - 38);
    } else {
      o += arc(F, bw - 38, w, -Math.PI / 2, 0, th);
      o += R(F, bw - 38 - tk, F + w, bw - 38, `fill="none" stroke="${STEEL}" stroke-width="${th}" stroke-dasharray="${th * 2} ${th * 2}"`);   // folded, before it slides in
      o += `<line x1="${f(F)}" y1="${f(bw - 38)}" x2="${f(F - push - w)}" y2="${f(bw - 38)}" stroke="${BRASS}" stroke-width="${th * 1.6}"/>`;
      o += pack(F - push - w, bw - 38 - tk, F - push, bw - 38);
    }
    return o;
  }

  window.DK.begin("foldslide");
  let s = frame();
  s += heading(18, 18, "DRESSING ROOM — THE END-BAY DOORS", "THREE WAYS TO OPEN THEM WITHOUT HITTING THE FREE-STANDING MIRROR · PLANS", 220);

  const sc1 = 42, v1 = view(40, 42, sc1, "Room, end bays open (A)"), th1 = v1.w(0.12);
  s += v1.g(room(th1), 0.3);
  s += text(v1.X(K.W / 2), 36, "THE ROOM — END BAYS OPEN AS A", { size: 2.2, anchor: "middle", weight: 700 });
  s += chainH([v1.X(F), v1.X(mx), v1.X(mx + K.mirror), v1.X(K.W - F)], v1.Y(K.D) + 7,
    [`${Math.round(mx - F)}`, `${K.mirror} MIRROR`, `${Math.round(K.W - F - mx - K.mirror)}`], { from: v1.Y(K.D), size: 1.2 });
  s += chainH([v1.X(0), v1.X(K.W)], v1.Y(K.D) + 14, [`${K.W} ROOM`], { from: v1.Y(K.D) + 10, size: 1.3 });
  s += text(v1.X(K.W / 2), v1.Y(0) + 5.5, "MIRROR", { size: 1.4, anchor: "middle", fill: THIN });

  const sc2 = 25, gap = 24, x0 = 150;
  [["A", "FOLDS IN · PARKS AT THE MIRROR END"], ["B", "FOLDS IN · PARKS AT THE FRONT END"], ["C", "FOLDS OUT, THEN SLIDES IN · FRONT END"]].forEach(([opt, sub], k) => {
    const ox = x0 + k * ((F + 560) / sc2 + gap), vk = view(ox, 58, sc2, "End bay, option " + opt), thk = vk.w(0.12);
    s += vk.g(bay(thk, opt), 0.3);
    s += text(vk.X((F + 560) / 2), 48, `OPTION ${opt}`, { size: 2.6, anchor: "middle", weight: 700, fill: opt === "C" ? INK : RED });
    s += text(vk.X((F + 560) / 2), 52.5, sub, { size: 1.35, anchor: "middle", fill: THIN });
    s += text(vk.X(F / 2), vk.Y(bw) + 5, "CUPBOARD", { size: 1.3, anchor: "middle", fill: THIN });
    s += text(vk.X(F + 280), vk.Y(bw) + 5, "ROOM", { size: 1.3, anchor: "middle", fill: THIN });
    s += text(vk.X((F + 560) / 2), vk.Y(0) - 1.5, "MIRROR END ↑", { size: 1.2, anchor: "middle", fill: THIN });
  });
  // key, under the three bays
  const ky = 110;
  [[STEEL, "the folded pair of doors, open"], [RED, "dashed red — the wardrobe front / the path of the fold"], [BRASS, "brass — head track along the front, runner along the side"]]
    .forEach(([c, t], i) => { s += `<rect x="150" y="${ky + i * 5.5 - 2}" width="6" height="2.4" fill="${c}"/>` + text(159, ky + i * 5.5, t, { size: 1.5 }); });

  s += text(150, 136, "HINGES AND HARDWARE", { size: 2.2, weight: 700, ls: 0.3 });
  [["CENTRE HINGE", "Continuous brass piano hinge, full height, between the two leaves. INSIDE face for A and B; room face for C."],
   ["PARKING LEAF", "Top and bottom pivot pins on a carriage that runs in a runner along the side panel. The same for A, B and C."],
   ["FREE LEAF", "Guide roller at the top, running in the head track along the front; small guide at the floor. All three options."],
   ["PUSH-BACK", "All three. Folded pair is about 1 ft 6 in deep, 3 in thick; the 2 ft 3 in cupboard lets it go back about 8 in."],
   ["HANGING RAIL", "Stop it about 4 in short of the side panel the pair parks against. Nothing else inside the bay changes."]]
    .forEach(([k, v], i) => { s += text(150, 143 + i * 7, k, { size: 1.5, weight: 700 }) + text(150, 146.2 + i * 7, v, { size: 1.45, fill: THIN }); });

  s += heading(18, 226, "NOTES", "REVISION 2", 220);
  [["Why not ordinary hinges: a leaf at the back of either run swings about 1 ft 6½ in into the room, and",
    "   the 3 ft mirror, centred, leaves only about 10½ in beside it. It would hit the mirror.",
    "Two leaves hinged together always fold into a triangle. A and B put the triangle INSIDE the cupboard",
    "   and push the folded pair back, so nothing ever passes the wardrobe front.",
    "C folds out into the room first, like the owner's photo, then slides back in the same way. It crosses",
    "   the wardrobe front only while folding, at the front end of the bay, well away from the mirror.",
    "Revision 1 of this sheet showed the pair folding flat against the front — that cannot be built and",
    "   is withdrawn. The video on the Dressing page shows all three moving."],
   ["A — parks at the mirror end: you reach in from the front, never from behind the mirror.",
    "B — parks at the front end: same mechanism, other side of the bay.",
    "C — while it folds, it stands about 1 ft 6 in into the room; once slid in, the corridor is clear.",
    "The tunnel bay works the same way; in A and B its folded pair can slide right back into the",
    "   tunnel, out of sight.",
    "CHOSEN — C, confirmed by the owner. A and B are kept here for reference."]]
    .forEach((col, c) => col.forEach((n, i) => (s += text(18 + c * 172, 238 + i * 4.4, n, { size: 1.5, fill: n.startsWith("OPEN") ? RED : INK }))));

  s += titleBlock({ title: "END-BAY DOORS", sub: "Dressing room · three ways to open", date: "26.09.2026",
    rev: "3 — option C chosen", dwg: "AST-DR-026", scale: `1:${sc1} AND 1:${sc2} @ A3` });
  window.DRAWINGS.foldslide = { title: "End-bay doors — three ways to open · AST-DR-026", svg: sheet(s), model: true };
})();
