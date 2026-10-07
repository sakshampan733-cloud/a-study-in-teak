// The wardrobe interiors — AST-DR-048. The layout the owner approved in chat (7 Oct, "v5"), set out on a sheet:
// both runs with their doors off, seen from the room — the left run L1–L3 (L3 beside the mirror), the right run R1–R4
// (R4 is the tunnel door, AST-DR-026). Every bay has a loft: one open 1 ft 10 in space, no middle shelf. No glass inside.
// Inside finish (owner, 7 Oct): the real thing is a laminate close to the doors' veneer — sample to come — so it is the
// same veneer inside; the back of every bay is backlit (detail 1). Bays 930 wide, 2743 high, 686 deep. Real units mm,
// z up from the floor inside each bay.

window.DRAWINGS = window.DRAWINGS || {};

const WARDIN = {
  rev: "1 — the approved layout; the same veneer inside, backlit backs",
  date: "07.10.2026",
  BW: 930, H: 2743, D: 686, plinth: 100, side: 18, shelf: 22, loft: 2183,
  back: { backer: 9, led: 3, air: 40, opal: 3, groove: 8 },   // the lit back: 9 ply, LED strips, 40 air, 3 opal acrylic — 55 in all
};

(function () {
  const { INK, THIN, f, text, view, chainH, chainV, labels, heading, frame, titleBlock, sheet } = window.DK;
  const K = WARDIN, BW = K.BW, H = K.H, S = K.side;
  const mono = (svg) => svg.replace(/#8a3a22/g, INK);

  // one bay, doors off: drawn in real mm, y = H − z
  function bay(inner, th) {
    const Y = (z) => H - z;
    const R = (a, b, c, d, w = 0.7, extra = "") => `<rect x="${f(a)}" y="${f(Y(d))}" width="${f(c - a)}" height="${f(d - b)}" fill="none" stroke-width="${f(th * w)}" ${extra}/>`;
    const L = (a, b, c, d, w = 0.7, extra = "") => `<line x1="${f(a)}" y1="${f(Y(b))}" x2="${f(c)}" y2="${f(Y(d))}" stroke-width="${f(th * w)}" ${extra}/>`;
    const c = { R, L, Y, th };
    let o = R(0, 0, BW, H, 1.3) + R(S, K.plinth, BW - S, H - S, 0.6) + R(0, 0, BW, K.plinth, 1);
    o += `<rect x="${S}" y="${Y(H - S)}" width="${BW - 2 * S}" height="${H - S - K.plinth}" fill="url(#litWR)" stroke="none"/>`;   // the lit back, shown faintly
    return o + inner(c);
  }
  const drawer = (c, z0, z1, pull = 260) => c.R(36, z0, BW - 36, z1, 1.2) + c.L(BW / 2 - pull / 2, (z0 + z1) / 2, BW / 2 + pull / 2, (z0 + z1) / 2, 2);
  const rail = (c, z, hang) => { let o = c.L(S, z, BW - S, z, 2); for (let x = 90; x < BW - 60; x += 60) o += c.L(x, z, x + 30, z - hang, 0.5); return o; };
  const shelf = (c, z) => `<rect x="${S}" y="${f(c.Y(z + K.shelf))}" width="${BW - 2 * S}" height="${K.shelf}" fill="#fff" stroke-width="${f(c.th)}"/>`;
  const loft = (c) => shelf(c, K.loft) + c.R(80, K.loft + 22, 420, 2480) + c.R(480, K.loft + 22, 860, 2400) + c.R(140, 2480, 400, 2640);
  const BAYS = {
    L1: { t: "L1 · LONG CLOTHES", n: ["kurtas, suits — rail at 2000", "3 drawers under a shelf", "loft: spare bedding"],
      f: (c) => loft(c) + rail(c, 2060, 1250) + shelf(c, 640) + drawer(c, 430, 620) + drawer(c, 250, 410) + drawer(c, 110, 230) },
    L2: { t: "L2 · SHIRTS, WATCHES, TROUSERS", n: ["shirt rail at 1900", "watch + jewellery drawer, locked", "trouser pull-out No. 2"],
      f: (c) => loft(c) + rail(c, 1900, 780) + shelf(c, 1060) + c.R(36, 940, BW - 36, 1050, 1.2) + [0, 1, 2, 3].map((i) => c.R(70 + i * 200, 955, 70 + i * 200 + 170, 1035)).join("")
        + c.R(36, 880, BW - 36, 910, 1.2) + c.L(36, 895, BW - 36, 895, 2) + [0, 1, 2, 3, 4].map((i) => c.L(100 + i * 170, 880, 100 + i * 170, 200, 3)).join("") },
    L3: { t: "L3 · PERFUME + HAIR", n: ["lit open niche, 3 shelves", "hair-dryer bay + socket", "2 drawers · loft above"],
      f: (c) => loft(c) + shelf(c, 1880) + shelf(c, 1600) + shelf(c, 1320) + [1880, 1600, 1320].map((z) => [0, 1, 2, 3, 4, 5].map((i) => c.R(70 + i * 130, z + 22, 70 + i * 130 + 60 + (i % 2) * 14, z + 22 + 130 + (i % 3) * 30, 0.5)).join("")).join("")
        + c.R(S, 780, BW - S, 1300, 1, `stroke-dasharray="${f(c.th * 5)} ${f(c.th * 3)}"`) + drawer(c, 430, 740) + drawer(c, 115, 420) },
    R1: { t: "R1 · FOLDED CLOTHES", n: ["5 open shelves, 330 apart", "3 deep drawers below", "loft above"],
      f: (c) => loft(c) + [0, 1, 2, 3, 4].map((i) => shelf(c, 760 + i * 330)).join("") + [0, 1, 2].map((i) => drawer(c, 115 + i * 215, 115 + i * 215 + 200)).join("") },
    R2: { t: "R2 · TOWELS, TROUSERS, LAUNDRY", n: ["2 shelves · trouser pull-out No. 1", "socks drawer", "laundry pull-out · loft"],
      f: (c) => loft(c) + shelf(c, 1940) + shelf(c, 1620) + c.R(36, 1330, BW - 36, 1360, 1.2) + c.L(36, 1345, BW - 36, 1345, 2) + [0, 1, 2, 3, 4].map((i) => c.L(100 + i * 170, 1330, 100 + i * 170, 800, 3)).join("")
        + drawer(c, 590, 760) + c.R(36, 115, BW - 36, 570, 1.2) + c.L(BW / 2, 115, BW / 2, 570) + c.L(BW / 2 - 120, 350, BW / 2 + 120, 350, 2) },
    R3: { t: "R3 · SHOES", n: ["9 tilting trays, 185 apart", "bag shelf above", "loft above"],
      f: (c) => loft(c) + shelf(c, 1960) + c.R(36, 2000, BW - 36, 2170) + [0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => c.L(40, 160 + i * 185, BW - 40, 160 + i * 185 + 55, 2) + c.L(40, 160 + i * 185, 40, 160 + i * 185 + 40)).join("") },
    R4: { t: "R4 · THE TUNNEL DOOR", n: ["shelved door, 10¼ in deep", "floor pivot, push latch", "AST-DR-026 · not lit"],
      f: (c) => [2050, 1730, 1410, 1090, 770, 450].map((z) => shelf(c, z)).join("") + c.R(S, 100, BW - S, K.loft, 0.7) + c.L(BW / 2, K.loft, BW / 2, 100, 0.5, `stroke-dasharray="${f(c.th * 3)} ${f(c.th * 3)}"`) },
  };

  // detail 1 — the lit back, in plan at a bay's back corner: x across the bay from the side panel's outer face, y out
  // from the wall into the bay
  function litBack(th) {
    const B = K.back, y1 = B.backer, y2 = y1 + B.led, y3 = y2 + B.air, y4 = y3 + B.opal, g = B.groove, sh = `fill="url(#ply48)"`;
    let o = `<rect x="-40" y="-70" width="300" height="70" fill="url(#hatchWR)" stroke="none"/><line x1="-40" y1="0" x2="260" y2="0" stroke-width="${th * 1.6}"/>`;
    o += `<rect x="0" y="0" width="${S}" height="260" ${sh} stroke-width="${th * 1.3}"/>`;                                          // side panel, cut
    o += `<line x1="${S - 1}" y1="${y4 + 2}" x2="${S - 1}" y2="260" stroke-width="${th * 0.4}"/>`;                                   // its veneer face, inside
    o += `<rect x="${S}" y="0" width="242" height="${y1}" ${sh} stroke-width="${th}"/>`;                                            // 9 ply backer
    [70, 170].forEach((x) => (o += `<rect x="${x - 6}" y="${y1}" width="12" height="${B.led}" fill="${INK}" stroke="none"/>` +
      `<path d="M ${x} ${y2} L ${x - 30} ${y3} M ${x} ${y2} L ${x + 30} ${y3} M ${x} ${y2} L ${x} ${y3}" fill="none" stroke-width="${th * 0.35}" stroke-dasharray="${th * 3} ${th * 2}"/>`));   // LED strips, their spread
    o += `<rect x="${S - g}" y="${y3 - 0.5}" width="${242 + g}" height="${B.opal + 1}" fill="#fff" stroke-width="${th * 0.9}"/>`;   // opal acrylic, in a groove
    o += `<rect x="${S}" y="${y4 + 2}" width="242" height="${K.shelf}" fill="#fff" stroke-width="${th}" stroke-dasharray="${th * 6} ${th * 3}"/>`;   // a shelf, beyond
    o += `<path d="M 260 -70 L 260 300" fill="none" stroke-width="${th * 0.5}" stroke-dasharray="${th * 8} ${th * 3} ${th * 2} ${th * 3}"/>`;   // break
    return o;
  }

  window.DK.begin("wardrobe-interiors");
  let s = frame();
  s += `<defs><pattern id="hatchWR" patternUnits="userSpaceOnUse" width="20" height="20" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="20" stroke="#9a9a9a" stroke-width="2"/></pattern>
    <pattern id="ply48" patternUnits="userSpaceOnUse" width="4" height="4" patternTransform="rotate(-45)"><rect width="4" height="4" fill="#fff"/><line x1="0" y1="0" x2="0" y2="4" stroke="#8c8c8c" stroke-width="0.5"/></pattern>
    <pattern id="litWR" patternUnits="userSpaceOnUse" width="120" height="120"><circle cx="60" cy="60" r="7" fill="#e6e6e6"/></pattern></defs>`;

  const sc = 30, top = 32, gapB = 2, runs = [["LEFT RUN — L1 TO L3, L3 BESIDE THE MIRROR", ["L1", "L2", "L3"], 24], ["RIGHT RUN — R1 TO R4, R4 THE TUNNEL DOOR", ["R1", "R2", "R3", "R4"], 24 + 3 * (BW / sc + gapB) + 12]];
  s += heading(18, 17, "WARDROBE INTERIORS — DOORS OFF", `SEEN FROM THE ROOM · SCALE 1:${sc} · EVERY BAY 930 WIDE, 9 FT HIGH, 2 FT 3 IN DEEP`, 228);
  runs.forEach(([title, ids, x0], ri) => {
    s += text(x0, top - 3, title, { size: 1.5, weight: 700 });
    ids.forEach((id, i) => {
      const ox = x0 + i * (BW / sc + gapB), v = view(ox, top, sc, `Wardrobe ${id}`), th = v.w(0.1);
      s += v.g(bay((c) => BAYS[id].f(c), th), 0.3);
      s += text(ox, top + H / sc + 5, BAYS[id].t, { size: 1.3, weight: 700 });
      BAYS[id].n.forEach((t, j) => (s += text(ox, top + H / sc + 8.4 + j * 2.9, t, { size: 1.2, fill: THIN })));
    });
    const xs = ids.map((_, i) => x0 + i * (BW / sc + gapB));
    if (ri === 0) s += chainV([top + H / sc, top + (H - K.plinth) / sc, top + (H - K.loft) / sc, top], x0 - 3, [K.plinth, `${K.loft - K.plinth} BELOW THE LOFT`, `${H - K.loft} LOFT`], { from: x0 - 0.5, size: 1.0 });
  });

  // detail 1, the right-hand column
  s += heading(280, 17, "1 · THE LIT BACK", "PLAN AT A BAY'S BACK CORNER · SCALE 1:5 · NOT THE TUNNEL DOOR", 132);
  { const v = view(300, 46, 5, "Wardrobe lit back"), th = v.w(0.1), B = K.back;
    s += v.g(litBack(th), 0.3);
    const y4 = B.backer + B.led + B.air + B.opal;
    s += chainV([v.Y(0), v.Y(B.backer), v.Y(B.backer + B.led + B.air), v.Y(y4)], v.X(-40) - 3, [B.backer, B.led + B.air, B.opal], { from: v.X(-40) - 0.5, size: 1.0 });
    s += chainV([v.Y(0), v.Y(y4)], v.X(-40) - 9, [`${y4} IN ALL`], { from: v.X(-40) - 0.5, size: 1.05 });
    const L1 = labels(v.X(260) + 10, "right", 34, 112);
    L1.add(v.X(120), v.Y(-35), "THE WALL", "");
    L1.add(v.X(120), v.Y(B.backer / 2), "9 MM PLY BACKER", "PAINTED WHITE, TO THROW THE LIGHT");
    L1.add(v.X(70), v.Y(B.backer + 1.5), "LED STRIP, 100 APART", "WARM WHITE 2700 K, DIMMABLE");
    L1.add(v.X(120), v.Y(B.backer + B.led + 20), "40 MM AIR GAP", "SO THE GLOW IS EVEN, NO DOTS");
    L1.add(v.X(220), v.Y(B.backer + B.led + B.air + 1.5), "3 MM OPAL ACRYLIC — NOT GLASS", "IN A GROOVE IN EACH SIDE, LIFTS OUT");
    L1.add(v.X(S / 2), v.Y(150), "SIDE PANEL, 18 PLY", "THE SAME VENEER BOTH FACES");
    L1.add(v.X(150), v.Y(y4 + 13), "SHELF, 22", "STOPS AT THE ACRYLIC");
    s += L1.draw(); }

  s += heading(280, 132, "INSIDE (OWNER, 7 OCT)", "", 132);
  ["The inside is a laminate the owner has chosen; its sample is still to",
   "come. Until then it is drawn and modelled as the SAME VENEER as the",
   "doors, on every face inside — sides, shelves, drawer fronts, the loft.",
   "The back of every bay glows: an opal acrylic panel lit from behind",
   "(detail 1) — the tunnel door R4 excepted. One dimmer for both runs.",
   "LED strips also down the door edges, as before (not drawn)."]
    .forEach((n, i) => (s += text(280, 142 + i * 4.2, n, { size: 1.4 })));

  s += heading(18, 150, "NOTES", `REVISION ${K.rev.split(" ")[0]}`, 110);
  ["The layout the owner approved in chat (7 Oct), set out as built. Every bay has a loft at",
   "7 ft 2 in — one open 1 ft 10 in space, no middle shelf; a step stool reaches it. Rails at",
   "2000 (L1) and 1900 (L2). Two trouser pull-outs: No. 1 in R2, No. 2 in L2. Shelves 22 thick,",
   "soft-close runners everywhere, no glass inside. Shoe trays in R3 tilt out as the owner's",
   "photo; 5 spare trays for later. L3's open niche is lit for the perfumes (about 10 to 12).",
   "Doors, end bays and the tunnel door: AST-DR-025, -026 and the hidden-door drawings."]
    .forEach((n, i) => (s += text(18, 160 + i * 4.3, n, { size: 1.42 })));
  s += heading(150, 150, "TO MEASURE ON SITE", "", 100);
  ["The bay widths: 930 each as drawn, set out to the",
   "real runs on site. The sockets: L3's hair-dryer bay",
   "and one LED driver per run, in the plinth."]
    .forEach((n, i) => (s += text(150, 160 + i * 4.3, n, { size: 1.42 })));

  s += titleBlock({ title: "WARDROBE INTERIORS", sub: "Both runs, doors off · The lit back", date: K.date, rev: K.rev, dwg: "AST-DR-048", scale: "AS NOTED @ A3" });
  window.DRAWINGS["wardrobe-interiors"] = { title: "Wardrobe interiors · AST-DR-048", svg: mono(sheet(s)) };
})();
