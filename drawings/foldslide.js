// Dressing room — the two end bays' doors, and what happens when everything is open.
// AST-DR-026. A hinged double door at the back of either run would swing into the room and hit the
// free-standing mirror; this sheet works out by how much, and details the fix — a door that folds
// flat and then SLIDES sideways along its own top track, so it never leaves the plane of the wall.
// Real-world units are mm.

window.DRAWINGS = window.DRAWINGS || {};

(function () {
  const { INK, THIN, f, text, view, chainH, chainV, labels, heading, frame, titleBlock, sheet } = window.DK;
  const K = window.WDR || { W: 2819, D: 3759, depth: 686, leftRun: 2845, nLeft: 3, nRight: 4, mirror: 914, fr: 38 };
  const RED = "#b3261e", STEEL = "#2a2a2a", GLASS = "#f4f1ea";

  const corridor = K.W - 2 * K.depth;
  const mx = K.depth + (corridor - K.mirror) / 2;
  const leftBayW = K.leftRun / K.nLeft, rightBayW = K.D / K.nRight;
  const leafL = leftBayW / 2, leafR = rightBayW / 2;
  const clear = (corridor - K.mirror) / 2;
  const proj = 90;    // fold-slide projection off the wall face — approximate, see notes

  const R = (x0, y0, x1, y1, a = "") => `<rect x="${f(x0)}" y="${f(y0)}" width="${f(x1 - x0)}" height="${f(y1 - y0)}" ${a}/>`;
  const Wd = (th) => `stroke-width="${th}"`;

  function plan1(th) {
    let o = "";
    o += R(0, 0, K.W, K.D, `fill="none" stroke="${INK}" stroke-width="${th * 1.6}"`);
    o += R(0, 0, K.depth, K.leftRun, `fill="${GLASS}" stroke="${STEEL}" stroke-width="${th}"`);
    o += R(K.W - K.depth, 0, K.W, K.D, `fill="${GLASS}" stroke="${STEEL}" stroke-width="${th}"`);
    for (let i = 1; i < K.nLeft; i++) { const y = (i * K.leftRun) / K.nLeft; o += `<line x1="0" y1="${f(y)}" x2="${f(K.depth)}" y2="${f(y)}" ${Wd(th * 0.5)} stroke="${STEEL}"/>`; }
    for (let i = 1; i < K.nRight; i++) { const y = (i * K.D) / K.nRight; o += `<line x1="${f(K.W - K.depth)}" y1="${f(y)}" x2="${f(K.W)}" y2="${f(y)}" ${Wd(th * 0.5)} stroke="${STEEL}"/>`; }

    // LEFT run: bays 1 & 2 ordinary, swung open 90° into the corridor
    for (let i = 0; i < K.nLeft - 1; i++) {
      const y0 = (i * K.leftRun) / K.nLeft, y1 = y0 + leftBayW;
      const hinge = i % 2 === 0 ? y0 : y1;
      o += `<g ${Wd(th)} stroke="${INK}"><line x1="${f(K.depth)}" y1="${f(hinge)}" x2="${f(K.depth + leftBayW)}" y2="${f(hinge)}"/></g>`;
      o += `<path d="M ${f(K.depth)} ${f(hinge)} A ${f(leftBayW)} ${f(leftBayW)} 0 0 ${i % 2 === 0 ? 1 : 0} ${f(K.depth + leftBayW)} ${f(hinge)}" fill="none" stroke="${THIN}" stroke-width="${th * 0.5}" stroke-dasharray="${th * 2} ${th * 1.6}"/>`;
    }
    // bay 3 — fold-slide, OPEN: folded pack against the party line with bay 2, clear opening toward the back wall
    { const y0 = (2 * K.leftRun) / K.nLeft;
      o += R(K.depth, y0, K.depth + proj, y0 + leafL + 20, `fill="${STEEL}" stroke="${STEEL}" stroke-width="${th}"`);
      o += `<line x1="${f(K.depth + proj + 8)}" y1="${f(y0 + (leafL + 20) / 2)}" x2="${f(K.depth + proj + 70)}" y2="${f(y0 + (leafL + 20) / 2)}" stroke="${RED}" stroke-width="${th}" marker-end="url(#arrLS)"/>`; }

    // RIGHT run: bays 1–3 ordinary
    for (let i = 1; i < K.nRight; i++) {
      const y0 = (i * K.D) / K.nRight, y1 = y0 + rightBayW;
      const hinge = i % 2 === 0 ? y0 : y1;
      o += `<g ${Wd(th)} stroke="${INK}"><line x1="${f(K.W - K.depth)}" y1="${f(hinge)}" x2="${f(K.W - K.depth - rightBayW)}" y2="${f(hinge)}"/></g>`;
      o += `<path d="M ${f(K.W - K.depth)} ${f(hinge)} A ${f(rightBayW)} ${f(rightBayW)} 0 0 ${i % 2 === 0 ? 0 : 1} ${f(K.W - K.depth - rightBayW)} ${f(hinge)}" fill="none" stroke="${THIN}" stroke-width="${th * 0.5}" stroke-dasharray="${th * 2} ${th * 1.6}"/>`;
    }
    // bay T — fold-slide tunnel door
    { const y1 = rightBayW;
      o += R(K.W - K.depth - proj, y1 - leafR - 20, K.W - K.depth, y1, `fill="${STEEL}" stroke="${STEEL}" stroke-width="${th}"`);
      o += `<line x1="${f(K.W - K.depth - proj - 8)}" y1="${f(y1 - (leafR + 20) / 2)}" x2="${f(K.W - K.depth - proj - 70)}" y2="${f(y1 - (leafR + 20) / 2)}" stroke="${RED}" stroke-width="${th}" marker-end="url(#arrLS)"/>`; }

    // the mirror — free-standing, centred
    o += R(mx, -22, mx + K.mirror, 42, `fill="#dfe4e6" stroke="${STEEL}" stroke-width="${th * 1.3}"`);
    o += `<line x1="0" y1="${f(K.D)}" x2="${f(K.W)}" y2="${f(K.D)}" stroke="${INK}" stroke-width="${th * 1.6}"/>`;
    return o;
  }

  // ── mechanism detail: one bay, CLOSED and OPEN, in plan. bh is the along-wall span drawn (~2 leaves).
  function detail(th, bh) {
    let o = "", parts = {};
    const mid = bh / 2;
    // CLOSED — left illustration
    const cx0 = 0;
    o += R(cx0, 0, cx0 + K.depth, bh, `fill="none" stroke="${STEEL}" stroke-width="${th * 1.4}"`);
    o += `<line x1="${f(cx0)}" y1="0" x2="${f(cx0)}" y2="${f(bh)}" ${Wd(th * 2.6)} stroke="${STEEL}"/>`;
    o += R(cx0, mid - leafL, cx0 + 34, mid + leafL, `fill="${GLASS}" stroke="${STEEL}" stroke-width="${th * 1.1}"`);
    o += `<line x1="${f(cx0 + 17)}" y1="${f(mid - leafL)}" x2="${f(cx0 + 17)}" y2="${f(mid + leafL)}" ${Wd(th * 0.4)} stroke="${THIN}"/>`;
    o += `<circle cx="${f(cx0 + 34)}" cy="${f(mid)}" r="${th * 3.2}" fill="${STEEL}"/>`;

    // OPEN — right illustration
    const gap = K.depth + 220, ox0 = cx0 + gap;
    o += R(ox0, 0, ox0 + K.depth, bh, `fill="none" stroke="${STEEL}" stroke-width="${th * 1.4}"`);
    o += `<line x1="${f(ox0)}" y1="0" x2="${f(ox0)}" y2="${f(bh)}" ${Wd(th * 2.6)} stroke="${STEEL}"/>`;
    o += `<line x1="${f(ox0 - 5)}" y1="${f(mid - leafL - 12)}" x2="${f(ox0 + leafL * 2 + 5)}" y2="${f(mid - leafL - 12)}" ${Wd(th * 0.4)} stroke="${RED}" stroke-dasharray="${th * 2} ${th * 1.6}"/>`;
    o += R(ox0, mid - leafL, ox0 + proj, mid + leafL, `fill="${STEEL}" stroke="${STEEL}" stroke-width="${th * 1.1}"`);
    o += `<line x1="${f(ox0 + proj + 20)}" y1="${f(mid - leafL)}" x2="${f(ox0 + leafL * 2)}" y2="${f(mid - leafL)}" ${Wd(th * 0.4)} stroke="${THIN}" stroke-dasharray="${th * 2} ${th * 1.6}"/>`;
    o += `<line x1="${f(ox0 + proj + 20)}" y1="${f(mid + leafL)}" x2="${f(ox0 + leafL * 2)}" y2="${f(mid + leafL)}" ${Wd(th * 0.4)} stroke="${THIN} " stroke-dasharray="${th * 2} ${th * 1.6}"/>`;
    o += `<path d="M ${f(ox0 + leafL * 2 - 40)} ${f(mid)} L ${f(ox0 + proj + 40)} ${f(mid)}" stroke="${RED}" stroke-width="${th}" fill="none" marker-end="url(#arrLS)"/>`;

    parts = { cx0, ox0, mid, gap };
    return { o, parts };
  }

  window.DK.begin("foldslide");
  let s = frame();
  s += `<defs><marker id="arrLS" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill="${RED}"/></marker></defs>`;

  const sc1 = 40, ox1 = 76, oy1 = 32;
  const v1 = view(ox1, oy1, sc1, "Room, doors open"), th1 = v1.w(0.12);
  s += heading(18, 18, "DRESSING ROOM — THE END BAYS", "EVERYTHING OPEN AT ONCE, AND HOW THE FOLD-SLIDE DOORS AVOID THE MIRROR", 220);
  s += v1.g(plan1(th1), 0.3);

  const yb1 = v1.Y(K.D) + 6;
  s += chainH([v1.X(0), v1.X(K.depth), v1.X(mx), v1.X(mx + K.mirror), v1.X(K.W - K.depth), v1.X(K.W)], yb1,
    ["", `${Math.round(clear)} CLEAR`, `${K.mirror} MIRROR`, `${Math.round(clear)} CLEAR`, ""], { from: v1.Y(K.D), size: 1.15 });
  s += chainH([v1.X(0), v1.X(K.W)], yb1 + 6, [`${K.W} ROOM WIDTH — 9 FT 3 IN`], { from: yb1 + 2.5, size: 1.4 });

  const RG1 = labels(268, "right", 32, 105), LG1 = labels(58, "left", 32, 105);
  LG1.add(v1.X(K.depth + leftBayW / 2), v1.Y(leftBayW * 0.5), "BAYS 1 AND 2 — LEFT", "ORDINARY HINGED DOORS, SWUNG OPEN 90°");
  LG1.add(v1.X(K.depth + proj / 2), v1.Y(K.leftRun - leafL / 2), "BAY 3 — FOLD-SLIDE", "PROJECTS ONLY ~90 MM — SEE BELOW");
  RG1.add(v1.X(K.W - K.depth - rightBayW / 2), v1.Y(rightBayW * 2.5), "BAYS 1–3 — RIGHT", "ORDINARY HINGED DOORS, SWUNG OPEN 90°");
  RG1.add(v1.X(K.W - K.depth - proj / 2), v1.Y(leafR / 2), "BAY T — FOLD-SLIDE", "SAME MECHANISM · DOUBLES AS THE TUNNEL DOOR");
  RG1.add(v1.X(mx + K.mirror), v1.Y(-22), "THE MIRROR", "FREE-STANDING · 3 FT · NOTHING SWINGS NEAR IT NOW");
  s += RG1.draw() + LG1.draw();

  // ── mechanism detail — compact, well clear of the notes below
  const sc2 = 18, ox2 = 90, oy2 = 158;
  const bh = 2 * leafL + 40;
  const v2 = view(ox2, oy2, sc2, "End bay, closed and open"), th2 = v2.w(0.12);
  const { o: detO, parts } = detail(th2, bh);
  s += v2.g(detO, 0.3);
  s += text(v2.X(parts.cx0 + K.depth / 2), v2.Y(0) - 4, "CLOSED", { size: 2.6, anchor: "middle", weight: 700 });
  s += text(v2.X(parts.ox0 + K.depth / 2), v2.Y(0) - 4, "OPEN", { size: 2.6, anchor: "middle", weight: 700, fill: RED });
  s += text(v2.X(parts.cx0 + K.depth / 2), v2.Y(bh) + 7, "READS AS AN ORDINARY DOUBLE DOOR", { size: 1.4, anchor: "middle", fill: THIN });
  s += text(v2.X(parts.ox0 + K.depth / 2), v2.Y(bh) + 7, "FOLDED, PARKED AGAINST THE PARTY LINE", { size: 1.4, anchor: "middle", fill: THIN });
  s += chainH([v2.X(parts.ox0), v2.X(parts.ox0 + proj)], v2.Y(bh) + 16, [`${proj} PROJECTION`], { from: v2.Y(bh) + 12, size: 1.5 });
  s += chainV([v2.Y(parts.mid - leafL), v2.Y(parts.mid + leafL)], v2.X(parts.ox0) - 8, [`${Math.round(2 * leafL)} FOLDED-STACK ZONE`], { from: v2.X(parts.ox0) - 3, size: 1.3 });

  const RG2 = labels(268, "right", 150, 218), LG2 = labels(58, "left", 150, 218);
  LG2.add(v2.X(parts.cx0 + 34), v2.Y(parts.mid), "CENTRE JOINT", "PIANO HINGE — THE SAME MEETING LINE AS EVERY OTHER BAY");
  RG2.add(v2.X(parts.ox0), v2.Y(parts.mid - leafL - 12), "TOP TRACK ONLY", "NO FIXED PIVOT: THE HINGE RIDES THE TRACK TOO, SO THE FOLD MOVES SIDEWAYS, NOT OUTWARD");
  RG2.add(v2.X(parts.ox0 + K.depth), v2.Y(parts.mid), "FOLDED FLAT", "TWO LEAVES FACE TO FACE — STAYS IN THE WALL PLANE");
  s += RG2.draw() + LG2.draw();

  s += heading(18, 232, "NOTES", "REVISION 1", 220);
  [["THE PROBLEM, IN NUMBERS — the mirror is 3 ft wide, free-standing, centred in the 4 ft 9 in gap",
    `   the two runs leave: that puts ${Math.round(clear)} mm (about 10½ in) of clear floor either side of it.`,
    `   A hinged double door at the back of either run swings a leaf about ${Math.round(leafL)} mm (1 ft 6½ in)`,
    "   into that same space — it would hit the mirror by roughly 8 in. Ordinary hinges cannot work there.",
    "THE FIX — a fold-and-slide door. The two leaves are joined by a hinge down the centre, same as an",
    "   ordinary double door, so CLOSED it looks identical to every other bay. But there is no fixed pivot",
    "   at the jamb: both stiles hang from a single TOP TRACK. Pushing the door folds the leaves flat",
    "   together AND slides that folded pack sideways along the track — it never swings into the room.",
    "   Open, it projects about 90 mm off the wall face — no more than a deep picture frame, and well",
    "   inside the clearance the mirror leaves either side of it.",
    "WHERE IT PARKS — the folded pack tucks against the party line shared with the NEXT bay along, away",
    "   from the mirror end, so the clear opening it leaves falls on the mirror side — the side that most",
    "   needed to stay open. Bay T doubles as the tunnel door and works the same way."],
   ["HOW THIS DIFFERS FROM THE REFERENCE PHOTOS SENT — both show an ordinary bifold: the pivot post",
    "   is fixed at the jamb, so the folded pair swings out into the room on an arc (the \"triangle\" you",
    "   pointed at). This keeps the same folded look but puts the pivot ON the track instead of fixing",
    "   it, so the whole assembly travels sideways and stays flat against the wall throughout.",
    "OPEN — this needs real hardware to be workable, not just geometry. The category to ask a supplier",
    "   for is a telescoping or bypass bi-fold track (sometimes sold for room dividers or wide wardrobes).",
    "   The 90 mm projection and the exact parked position both depend on what that hardware needs —",
    "   treat the numbers here as the shape of the answer, not the final ones.",
    "OPEN — whether the folded pack needs a wider pocket than its own bay gives it. As drawn it stays",
    "   inside bay 3 / bay T's own width; if the hardware wants more run, the pocket would have to eat",
    "   into the neighbouring bay's party frame, which has not been checked structurally.",
    "OPEN — floor guide. Most of this hardware still wants a shallow channel at the floor to stop the",
    "   bottom kicking in and out; confirm it can sit flush and not read against the wardrobe plinth."]]
    .forEach((col, c) => col.forEach((n, i) => (s += text(18 + c * 172, 244 + i * 4.2, n, { size: 1.5, fill: n.startsWith("OPEN") ? RED : INK }))));

  s += titleBlock({ title: "END BAYS — FOLD-SLIDE DOORS", sub: "Dressing room · mechanism and clearances", date: "25.09.2026",
    rev: "1 — first pass at a door that will not hit the free-standing mirror", dwg: "AST-DR-026", scale: `1:${sc1} AND 1:${sc2} @ A3` });
  window.DRAWINGS.foldslide = { title: "End bays — fold-slide doors · AST-DR-026", svg: sheet(s), model: true };
})();
