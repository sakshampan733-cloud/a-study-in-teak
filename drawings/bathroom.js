// The bathroom — AST-DR-037. From the owner's sketch and words (03.10.2026): along the window wall, after the 7 in
// wall (the owner's "WC wall"), the WC and the shower side by side, each 4 ft wide and 3 ft 5 in from the wall, each
// behind glass, their fronts in line; the tub on the right, in the bay between the pier and the east wall; the vanity
// (scheme C, AST-DR-021) on the door wall against the pier, as already drawn. The shell is the measured one (AST-DR-001).
// Rev 2 (owner, 7 Oct): the ceiling drops 1 ft over the shower bay only, to 8 ft; the two niches in the WC wall, from
// the owner's photo (tall, side by side, framed in marble, above the flush plate); black line only.
// Plan: x east from the bathroom's west wall, y south from the window wall. Section: z up from the floor. Real units mm.

window.DRAWINGS = window.DRAWINGS || {};

const BATH = {
  rev: "2 — the shower's 1 ft dropped ceiling; the two WC-wall niches",
  date: "07.10.2026",
  W: 3734, D: 2718, H: 2769, T: 230,                 // 12 ft 3 in × 8 ft 11 in, 9 ft 1 in ceiling, 9 in walls
  chase: { d: 178, l: 1092 },                        // the 7 in WC wall, 3 ft 7 in from the window wall
  pier: { x0: 2540, x1: 2794, out: 914 },            // 10 in thick, 3 ft out from the door wall, 3 ft 1 in off the east wall
  win: { x0: 380, x1: 990, sill: 1829, h: 305 },     // the bathroom window, 2 ft × 1 ft (owner, 8 Oct) — sill NOT measured
  door: { x0: 0, x1: 762, lin: 38, leaf: 686 },      // D3, from the dressing room, hinged on the left going in
  bay: 1219, deep: 1041,                             // WC and shower: 4 ft wide, 3 ft 5 in from the wall (owner)
  glass: { t: 10, h: 2000, door: 600 },              // clear toughened, frameless, 6 ft 6¾ in — ASSUMED
  wc: { w: 360, l: 540, rim: 400, plate: 1000 },     // wall-hung on the 7 in wall, cistern inside it — ASSUMED type
  tub: { w: 800, l: 1700, h: 600, rim: 60, y0: 250 },   // freestanding oval, 5 ft 7 × 2 ft 7½ — ASSUMED
  van: { x0: 1016, x1: 2540, d: 610, bank: [1169, 2083], bowl: 406 },   // scheme C, 5 ft × 2 ft, against the pier
  drop: 2438,                                        // the ceiling over the shower bay only, 1 ft down: 8 ft clear (owner)
  // the two niches in the WC wall's face, from the owner's photo — read off it, NOT measured: [from the window wall, width,
  // sill, top], 100 deep, each framed in a 40 mm marble moulding; the shorter one by the window
  niches: [[40, 300, 1200, 1800], [380, 380, 1200, 2200]], nicheD: 100, nicheF: 40,
};

(function () {
  const { INK, THIN, DIM, f, text, mmToFt, view, chainH, chainV, note, labels, heading, cutMark, frame, titleBlock, sheet } = window.DK;
  const K = BATH, W = K.W, D = K.D, T = K.T, G = K.glass;
  const ft = (mm) => mmToFt(mm).replace("'-", " ft ").replace('"', " in").replace(/^0 ft /, "").replace(/ 0 in$/, "");
  // black line only (owner, 7 Oct): white fills, chrome a pale grey, glass by its lines
  const STONE = "#fff", GLS = "#f4f4f4", CER = "#fff", CHR = "#dcdcdc", BURL = "#fff", MARB = "#fff";
  const mono = (svg) => svg.replace(/#8a3a22/g, INK);
  const x1W = K.chase.d + K.bay, x2S = x1W + K.bay;                     // the WC | shower divider, the shower's east side
  const fy = K.deep;                                                     // the glass fronts' line
  const tcx = (K.pier.x1 + W) / 2, tcy = K.tub.y0 + K.tub.l / 2;         // the tub's centre
  const doorWC = [x1W - 6 - G.door - 28, x1W - 6], doorSH = [x1W + 6, x1W + 6 + G.door];   // the two glass doors
  const RC = (x0, y0, x1, y1, attr) => `<rect x="${f(Math.min(x0, x1))}" y="${f(Math.min(y0, y1))}" width="${f(Math.abs(x1 - x0))}" height="${f(Math.abs(y1 - y0))}" ${attr}/>`;
  const hatch = `fill="url(#hatchBA)" stroke="none"`;

  // ════════ PLAN ════════
  function plan(t, dash) {
    let o = RC(0, 0, W, D, `fill="${STONE}" stroke="none"`);
    // walls, hatched, with the window and door openings
    o += RC(-T, -T, W + T, 0, hatch) + RC(-T, D, W + T, D + T, hatch) + RC(-T, 0, 0, D, hatch) + RC(W, 0, W + T, D, hatch);
    o += RC(K.win.x0, -T, K.win.x1, 0, `fill="#fff" stroke="none"`) + RC(K.door.x0, D, K.door.x1, D + T, `fill="#fff" stroke="none"`);
    [-T + 25, -T / 2, -25].forEach((y) => (o += `<line x1="${K.win.x0}" y1="${y}" x2="${K.win.x1}" y2="${y}" stroke-width="${t * 0.6}"/>`));
    o += RC(K.door.x0, D, K.door.x0 + K.door.lin, D + T, `fill="#fff" stroke-width="${t}"`) + RC(K.door.x1 - K.door.lin, D, K.door.x1, D + T, `fill="#fff" stroke-width="${t}"`);
    o += RC(0, 0, K.chase.d, K.chase.l, hatch) + RC(K.pier.x0, D - K.pier.out, K.pier.x1, D, hatch);
    o += `<path d="M ${-T} ${-T} L ${W + T} ${-T} L ${W + T} ${D + T} L ${K.door.x1} ${D + T} M ${K.door.x0} ${D + T} L ${-T} ${D + T} Z M 0 0 L ${K.win.x0} 0 M ${K.win.x1} 0 L ${W} 0 L ${W} ${D} L ${K.door.x1} ${D} M ${K.door.x0} ${D} L 0 ${D} L 0 0" fill="none" stroke-width="${t * 1.6}"/>`;
    o += `<path d="M ${K.chase.d} 0 L ${K.chase.d} ${K.chase.l} L 0 ${K.chase.l} M ${K.pier.x0} ${D} L ${K.pier.x0} ${D - K.pier.out} L ${K.pier.x1} ${D - K.pier.out} L ${K.pier.x1} ${D}" fill="none" stroke-width="${t * 1.6}"/>`;
    // the two niches cut 100 into the WC wall's face (above the cut: dashed), and the dropped ceiling over the shower (dashed)
    K.niches.forEach(([y0, w]) => (o += RC(K.chase.d - K.nicheD, y0, K.chase.d, y0 + w, `fill="#fff" stroke-width="${t * 0.8}" stroke-dasharray="${dash}"`)));
    o += RC(x1W + 15, 15, x2S - 15, fy - 15, `fill="none" stroke-width="${t * 0.9}" stroke-dasharray="${t * 14} ${t * 5} ${t * 3} ${t * 5}"`);
    // D3, opening in along the west wall
    { const hx = K.door.x0 + K.door.lin, L = K.door.leaf;
      o += `<path d="M ${hx + L} ${D} A ${L} ${L} 0 0 0 ${hx} ${D - L}" fill="none" stroke-width="${t * 0.6}" stroke-dasharray="${dash}"/>` + RC(hx, D - L, hx + 40, D, `fill="#fff" stroke-width="${t}"`); }
    // the WC: wall-hung on the 7 in wall, its frame and cistern inside it (dashed), the flush plate on its face
    { const y = fy / 2, x0 = K.chase.d, { w, l } = K.wc;
      o += RC(20, y - 230, K.chase.d - 15, y + 230, `fill="none" stroke-width="${t * 0.7}" stroke-dasharray="${dash}"`);
      o += `<path d="M ${x0} ${y - w / 2} L ${x0 + 190} ${y - w / 2} A ${l - 190} ${w / 2} 0 0 1 ${x0 + 190} ${y + w / 2} L ${x0} ${y + w / 2} Z" fill="${CER}" stroke-width="${t * 1.2}"/>`;
      o += `<ellipse cx="${x0 + 330}" cy="${y}" rx="170" ry="${w / 2 - 55}" fill="none" stroke-width="${t * 0.7}"/>`;
      o += RC(x0, y + 260, x0 + 12, y + 480, `fill="${CHR}" stroke-width="${t * 0.6}"`); }
    // the shower: a level floor to a linear drain at the back, a rain head on an arm (dashed), the mixer
    { const c = (x1W + x2S) / 2;
      o += RC(x1W + 60, 70, x2S - 60, 130, `fill="${CHR}" stroke-width="${t * 0.6}"`);
      o += `<circle cx="${c}" cy="380" r="125" fill="none" stroke-width="${t * 0.7}" stroke-dasharray="${dash}"/><line x1="${c}" y1="0" x2="${c}" y2="380" stroke-width="${t * 0.7}" stroke-dasharray="${dash}"/>`;
      o += RC(c - 60, 0, c + 60, 40, `fill="${CHR}" stroke-width="${t * 0.6}"`);
      o += RC(x1W + 30, 30, x2S - 30, fy - 30, `fill="none" stroke-width="${t * 0.4}" stroke-dasharray="${dash}"`); }
    // the glass: fronts in line, the divider, the shower's east side; doors open out
    o += RC(K.chase.d, fy, x2S + G.t / 2, fy + G.t, `fill="${GLS}" stroke-width="${t * 0.8}"`);
    o += RC(x1W - G.t / 2, 0, x1W + G.t / 2, fy, `fill="${GLS}" stroke-width="${t * 0.8}"`) + RC(x2S - G.t / 2, 0, x2S + G.t / 2, fy, `fill="${GLS}" stroke-width="${t * 0.8}"`);
    [[doorWC[0], doorWC[1], 1], [doorSH[0], doorSH[1], 0]].forEach(([a, b, hingeLeft]) => {
      const hx = hingeLeft ? a : a, ox = hingeLeft ? b : b, w = b - a;
      o += RC(a, fy, b, fy + G.t, `fill="#fff" stroke="none"`);
      o += `<path d="M ${f(ox)} ${fy} A ${w} ${w} 0 0 1 ${f(hx)} ${fy + w}" fill="none" stroke-width="${t * 0.6}" stroke-dasharray="${dash}"/>`;
      o += RC(hx, fy, hx + G.t, fy + w, `fill="${GLS}" stroke-width="${t * 0.8}"`);
      [0.12, 0.88].forEach((k) => (o += RC(hx - 12, fy + k * w - 30, hx + G.t + 12, fy + k * w + 30, `fill="${CHR}" stroke-width="${t * 0.5}"`)));
    });
    // the tub: freestanding oval, its long side along the east wall; the waste, and a floor-standing filler at its head
    { const { w, l, rim } = K.tub;
      o += `<rect x="${tcx - w / 2}" y="${K.tub.y0}" width="${w}" height="${l}" rx="${w / 2}" ry="${w * 0.62}" fill="${CER}" stroke-width="${t * 1.3}"/>`;
      o += `<rect x="${tcx - w / 2 + rim}" y="${K.tub.y0 + rim}" width="${w - 2 * rim}" height="${l - 2 * rim}" rx="${w / 2 - rim}" ry="${w * 0.62 - rim}" fill="none" stroke-width="${t * 0.7}"/>`;
      o += `<circle cx="${tcx}" cy="${K.tub.y0 + l - 260}" r="28" fill="none" stroke-width="${t * 0.7}"/>`;
      o += `<circle cx="${tcx}" cy="${K.tub.y0 - 110}" r="35" fill="${CHR}" stroke-width="${t * 0.7}"/><path d="M ${tcx} ${K.tub.y0 - 110} L ${tcx} ${K.tub.y0 + 80}" stroke-width="${t * 1.6}"/>`; }
    // the vanity, scheme C (AST-DR-021): the marble bank, the dark-burl ends, the vessel bowl on the tap line
    { const V = K.van, y0 = D - V.d, ax = V.bank[0] + 457;
      o += RC(V.x0, y0, V.bank[0], D, `fill="${BURL}" stroke-width="${t}"`) + RC(V.bank[1], y0, V.x1, D, `fill="${BURL}" stroke-width="${t}"`);
      o += RC(V.bank[0], y0 - 20, V.bank[1], D, `fill="${MARB}" stroke-width="${t * 1.2}"`);
      o += `<circle cx="${ax}" cy="${D - 320}" r="${V.bowl / 2}" fill="${CER}" stroke-width="${t}"/><circle cx="${ax}" cy="${D - 320}" r="25" fill="none" stroke-width="${t * 0.6}"/>`;
      o += RC(V.x0, y0 - 70, V.x1, y0 - 60, `fill="none" stroke-width="${t * 0.5}" stroke-dasharray="${dash}"`); }
    return o;
  }

  // ════════ SECTION B–B — cut just in front of the glass, looking at the window wall ════════
  function section(t, dash) {
    const Z = (z) => -z, H = K.H, g = G.h;
    let o = RC(0, Z(H), W, Z(0), `fill="#fff" stroke="none"`);
    o += RC(-T, Z(H + 150), 0, Z(-150), hatch) + RC(W, Z(H + 150), W + T, Z(-150), hatch) + RC(-T, Z(0), W + T, Z(-150), hatch) + RC(-T, Z(H + 150), W + T, Z(H), hatch);
    o += `<path d="M 0 ${Z(0)} L 0 ${Z(H)} L ${W} ${Z(H)} L ${W} ${Z(0)} Z" fill="none" stroke-width="${t * 1.6}"/>`;
    // the window in the far wall, the 7 in wall's end
    o += RC(K.win.x0, Z(K.win.sill + K.win.h), K.win.x1, Z(K.win.sill), `fill="#fff" stroke-width="${t}"`) + `<line x1="${(K.win.x0 + K.win.x1) / 2}" y1="${Z(K.win.sill)}" x2="${(K.win.x0 + K.win.x1) / 2}" y2="${Z(K.win.sill + K.win.h)}" stroke-width="${t * 0.6}"/>`;
    o += RC(0, Z(H), K.chase.d, Z(0), `fill="#fff" stroke-width="${t}"`);
    K.niches.forEach(([, , z0, z1]) => (o += RC(K.chase.d - K.nicheD, Z(z1), K.chase.d, Z(z0), `fill="none" stroke-width="${t * 0.7}" stroke-dasharray="${dash}"`)));   // the niches, edge-on
    // the dropped ceiling over the shower bay, its front face seen above the glass: 1 ft down, 8 ft clear
    o += RC(x1W, Z(H), x2S, Z(K.drop), `fill="#fff" stroke-width="${t * 1.2}"`) + `<line x1="${x1W}" y1="${Z(K.drop) - 18}" x2="${x2S}" y2="${Z(K.drop) - 18}" stroke-width="${t * 0.5}"/>`;
    // behind the glass: the WC in profile on the 7 in wall, its flush plate edge-on; the shower's mixer, arm and head
    { const x0 = K.chase.d, r = K.wc.rim;
      o += `<path d="M ${x0} ${Z(r)} L ${x0 + K.wc.l - 40} ${Z(r)} Q ${x0 + K.wc.l} ${Z(r)} ${x0 + K.wc.l - 30} ${Z(r - 80)} Q ${x0 + K.wc.l - 120} ${Z(r - 180)} ${x0 + 220} ${Z(r - 190)} L ${x0} ${Z(r - 190)} Z" fill="${CER}" stroke-width="${t * 1.2}"/>`;
      o += RC(x0, Z(r + 30), x0 + K.wc.l - 60, Z(r), `fill="${CER}" stroke-width="${t * 0.8}"`);
      o += RC(x0, Z(K.wc.plate + 110), x0 + 12, Z(K.wc.plate - 110), `fill="${CHR}" stroke-width="${t * 0.6}"`); }
    { const c = (x1W + x2S) / 2;
      o += RC(c - 70, Z(1150), c + 70, Z(1010), `fill="${CHR}" stroke-width="${t * 0.8}"`) + `<circle cx="${c}" cy="${Z(1080)}" r="30" fill="none" stroke-width="${t * 0.7}"/>`;
      o += `<path d="M ${c} ${Z(2280)} L ${c} ${Z(2200)}" stroke-width="${t * 2}"/>` + RC(c - 125, Z(2200), c + 125, Z(2180), `fill="${CHR}" stroke-width="${t * 0.8}"`);
      o += RC(x1W + 60, Z(8), x2S - 60, Z(0), `fill="${CHR}" stroke="none"`); }
    // the glass fronts, 2000 high: fixed panels, the two doors (lines meet at the hinge side), the edge-on divider and side
    const panels = [[K.chase.d, doorWC[0] - 6], [doorWC[0], doorWC[1], "L"], [doorSH[0], doorSH[1], "L"], [doorSH[1] + 6, x2S]];
    panels.forEach(([a, b, hinge]) => {
      o += RC(a, Z(g), b, Z(0), `fill="${GLS}" fill-opacity="0.45" stroke-width="${t}"`);
      if (hinge) {
        o += `<path d="M ${b} ${Z(60)} L ${a} ${Z(g / 2)} L ${b} ${Z(g - 60)}" fill="none" stroke-width="${t * 0.6}" stroke-dasharray="${dash}"/>`;
        [0.12, 0.88].forEach((k) => (o += RC(a - 8, Z(k * g + 40), a + 30, Z(k * g - 40), `fill="${CHR}" stroke-width="${t * 0.5}"`)));
        o += RC(b - 60, Z(1250), b - 45, Z(850), `fill="${CHR}" stroke-width="${t * 0.6}"`);
      }
    });
    o += RC(x1W - G.t / 2, Z(g), x1W + G.t / 2, Z(0), `fill="${GLS}" stroke-width="${t}"`) + RC(x2S - G.t / 2, Z(g), x2S + G.t / 2, Z(0), `fill="${GLS}" stroke-width="${t}"`);
    // the tub, cut at its widest: the shell hatched, the filler at its head beyond
    { const { w, h } = K.tub, x0 = tcx - w / 2, x1 = tcx + w / 2, s = 20;
      o += `<path d="M ${x0} ${Z(h)} C ${x0 - 10} ${Z(h * 0.4)} ${x0 + 60} ${Z(0)} ${x0 + 150} ${Z(0)} L ${x1 - 150} ${Z(0)} C ${x1 - 60} ${Z(0)} ${x1 + 10} ${Z(h * 0.4)} ${x1} ${Z(h)} L ${x1 - s} ${Z(h)} C ${x1 - s + 6} ${Z(h * 0.45)} ${x1 - 70} ${Z(s + 40)} ${x1 - 160} ${Z(s + 40)} L ${x0 + 160} ${Z(s + 40)} C ${x0 + 70} ${Z(s + 40)} ${x0 + s - 6} ${Z(h * 0.45)} ${x0 + s} ${Z(h)} Z" fill="${CER}" stroke-width="${t * 1.3}"/>`;
      o += `<path d="M ${tcx} ${Z(0)} L ${tcx} ${Z(980)} Q ${tcx} ${Z(1040)} ${tcx + 60} ${Z(1040)} L ${tcx + 150} ${Z(1040)} L ${tcx + 150} ${Z(1000)}" fill="none" stroke-width="${t * 1.6}" stroke="${CHR}"/>`; }
    o += `<line x1="${-T - 200}" y1="0" x2="${W + T + 200}" y2="0" stroke-width="${t * 2.5}"/>`;
    return o;
  }

  // ════════ ELEVATION C — the WC wall, looking west: the 7 in wall's face, its niches, the WC; the window wall on the right ════════
  // h runs along the face from the wall's south end (left) to the window wall (right): h = chase.l − y
  function wcWall(t, dash) {
    const Z = (z) => -z, H = K.H, L = K.chase.l, hy = (y) => L - y, F = K.nicheF;
    let o = RC(L, Z(H + 150), L + T, Z(-150), hatch) + RC(-150, Z(0), L + T, Z(-150), hatch) + RC(-150, Z(H + 150), L + T, Z(H), hatch);
    o += RC(L, Z(K.win.sill + K.win.h), L + T, Z(K.win.sill), `fill="#fff" stroke="none"`) + [L + 30, L + T / 2, L + T - 30].map((x) => `<line x1="${x}" y1="${Z(K.win.sill)}" x2="${x}" y2="${Z(K.win.sill + K.win.h)}" stroke-width="${t * 0.6}"/>`).join("");
    o += RC(0, Z(H), L, Z(0), `fill="#fff" stroke-width="${t * 1.4}"`);                                     // the face, marble
    [600, 1200, 1800, 2400].forEach((z) => (o += `<line x1="0" y1="${Z(z)}" x2="${L}" y2="${Z(z)}" stroke-width="${t * 0.3}"/>`));   // the slab joints
    K.niches.forEach(([y0, w, z0, z1]) => {
      const a = hy(y0 + w), b = hy(y0);
      o += RC(a - F, Z(z1 + F), b + F, Z(z0 - F), `fill="#fff" stroke-width="${t * 1.1}"`) + RC(a - F / 2, Z(z1 + F / 2), b + F / 2, Z(z0 - F / 2), `fill="none" stroke-width="${t * 0.4}"`);
      o += RC(a, Z(z1), b, Z(z0), `fill="#f2f2f2" stroke-width="${t}"`) + `<path d="M ${a} ${Z(z0)} L ${a + 30} ${Z(z0 + 30)} L ${b - 30} ${Z(z0 + 30)} L ${b} ${Z(z0)}" fill="none" stroke-width="${t * 0.5}"/>`;
    });
    { const c = hy(fy / 2), { w, rim, plate } = K.wc;
      o += RC(c - 110, Z(plate + 80), c + 110, Z(plate - 80), `fill="${CHR}" stroke-width="${t * 0.8}"`) + `<line x1="${c}" y1="${Z(plate + 80)}" x2="${c}" y2="${Z(plate - 80)}" stroke-width="${t * 0.5}"/>`;
      o += `<path d="M ${c - w / 2} ${Z(rim)} L ${c + w / 2} ${Z(rim)} L ${c + w / 2 - 20} ${Z(rim - 120)} Q ${c + w / 2 - 70} ${Z(rim - 190)} ${c} ${Z(rim - 195)} Q ${c - w / 2 + 70} ${Z(rim - 190)} ${c - w / 2 + 20} ${Z(rim - 120)} Z" fill="${CER}" stroke-width="${t * 1.2}"/>`;
      o += RC(c - w / 2 - 5, Z(rim + 25), c + w / 2 + 5, Z(rim), `fill="${CER}" stroke-width="${t * 0.8}"`); }
    o += RC(hy(fy) - G.t / 2, Z(G.h), hy(fy) + G.t / 2, Z(0), `fill="${GLS}" stroke-width="${t * 0.8}"`);   // the glass front, edge-on
    o += `<line x1="-150" y1="0" x2="${L + T}" y2="0" stroke-width="${t * 2.5}"/>`;
    return o;
  }

  // ═════════════ SHEET — AST-DR-037, THE BATHROOM ═════════════
  window.DK.begin("bathroom");
  let s = frame();
  s += `<defs><pattern id="hatchBA" patternUnits="userSpaceOnUse" width="90" height="90" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="90" stroke="#9a9a9a" stroke-width="10"/></pattern></defs>`;

  // plan 1:20
  const sc = 20, vp = view(42, 46, sc, "Bathroom plan"), tp = vp.w(0.1), dp = `${vp.w(1)} ${vp.w(0.7)}`;
  s += heading(18, 17, "PLAN", `SCALE 1:${sc} · THE WINDOW WALL AT THE TOP · THE DOOR FROM THE DRESSING ROOM BOTTOM LEFT`, 150);
  s += vp.g(plan(tp, dp), 0.3);
  { const yt = vp.Y(-T) - 4;
    s += chainH([0, K.chase.d, x1W, x2S, W].map(vp.X), yt, [K.chase.d, `${K.bay} WC`, `${K.bay} SHOWER`, W - x2S], { from: vp.Y(-T) - 0.5, size: 1.25 });
    s += chainV([vp.Y(0), vp.Y(fy), vp.Y(D - K.van.d - 20), vp.Y(D)], vp.X(-T) - 4, [`${fy}`, `${D - K.van.d - 20 - fy} CLEAR`, K.van.d + 20], { from: vp.X(-T) - 0.5, size: 1.2 });
    s += chainV([vp.Y(0), vp.Y(K.tub.y0), vp.Y(K.tub.y0 + K.tub.l), vp.Y(D)], vp.X(W + T) + 4, [K.tub.y0, `${K.tub.l} TUB`, D - K.tub.y0 - K.tub.l], { from: vp.X(W + T) + 0.5, size: 1.2 });
    s += chainH([vp.X(K.pier.x1), vp.X(tcx - K.tub.w / 2), vp.X(tcx + K.tub.w / 2), vp.X(W)], vp.Y(K.tub.y0 + K.tub.l) + 5, ["", K.tub.w, ""], { from: vp.Y(K.tub.y0 + K.tub.l) - 6, size: 1.15 });
    s += text(vp.X(K.chase.d + 260), vp.Y(fy / 2 + 300), "WC", { size: 2.2, weight: 700, anchor: "middle" });
    s += text(vp.X((x1W + x2S) / 2), vp.Y(fy / 2 + 230), "SHOWER", { size: 2.2, weight: 700, anchor: "middle" });
    s += text(vp.X(tcx), vp.Y(tcy + 40), "TUB", { size: 2.2, weight: 700, anchor: "middle" });
    s += text(vp.X(1300), vp.Y(1560), "BATHROOM", { size: 2.6, weight: 700, anchor: "middle", fill: THIN, ls: 0.4 });
    s += note(vp.X(K.chase.d / 2), vp.Y(K.chase.l - 120), vp.X(-T) + 2, vp.Y(K.chase.l + 230), "THE 7 IN WC WALL", "CISTERN AND FRAME INSIDE IT");
    s += note(vp.X(K.chase.d + 120), vp.Y(fy / 2 - 120), vp.X(560), vp.Y(-T) + 9, "WALL-HUNG WC", "FACING THE SHOWER · NICHES OVER IT, ELEV. C");
    s += note(vp.X(x1W), vp.Y(250), vp.X(1250), vp.Y(-T) + 9, "GLASS BETWEEN", "");
    s += note(vp.X((x1W + x2S) / 2 + 200), vp.Y(100), vp.X(2150), vp.Y(-T) + 9, "LINEAR DRAIN", "LEVEL FLOOR, NO TRAY");
    s += note(vp.X(doorWC[1] - 120), vp.Y(fy + 5), vp.X(560), vp.Y(fy + 470), "GLASS FRONTS IN ONE LINE", "DOORS OPEN OUT");
    s += note(vp.X(tcx), vp.Y(K.tub.y0 - 110), vp.X(3150), vp.Y(-T) + 9, "TUB FILLER", "FLOOR-STANDING");
    s += note(vp.X(1300), vp.Y(D - 320), vp.X(1050), vp.Y(1950), "VANITY — SCHEME C", "AST-DR-021, AS DRAWN", "end");
    s += note(vp.X((K.pier.x0 + K.pier.x1) / 2), vp.Y(D - 300), vp.X(2900), vp.Y(2450), "PIER, 10 IN", "");
    s += note(vp.X(3260), vp.Y(2400), vp.X(3150), vp.Y(2620), "? — SEE QUESTIONS", "", "end");
    s += note(vp.X(x2S - 200), vp.Y(fy - 15), vp.X(2150), vp.Y(fy + 330), "CEILING DROPPED 1 FT OVER THE SHOWER", "8 FT CLEAR — THIS BAY ONLY (DASH-DOT)");

    s += cutMark(vp.X(-T) - 1, vp.Y(fy + 110), "B", "up") + cutMark(vp.X(W + T) + 1, vp.Y(fy + 110), "B", "up");
  }

  // section B–B 1:30, right column
  const scS = 30, vs = view(270, 134, scS, "Bathroom section B-B"), ts = vs.w(0.11), ds = `${vs.w(1)} ${vs.w(0.7)}`;
  s += heading(258, 13, "SECTION B–B", `JUST IN FRONT OF THE GLASS, LOOKING AT THE WINDOW WALL · SCALE 1:${scS}`, 150);
  s += vs.g(section(ts, ds), 0.3);
  s += chainH([0, K.chase.d, x1W, x2S, W].map(vs.X), vs.Y(0) + 9, [K.chase.d, K.bay, K.bay, W - x2S], { from: vs.Y(0) + 5.5, size: 1.1 });
  s += chainV([vs.Y(0), vs.Y(-G.h), vs.Y(-K.H)], vs.X(W + T) + 4, [`${G.h} GLASS`, K.H - G.h], { from: vs.X(W + T) + 0.5, size: 1.1 });
  s += chainV([vs.Y(0), vs.Y(-K.win.sill), vs.Y(-K.win.sill - K.win.h)], vs.X(-T) - 4, [K.win.sill, K.win.h], { from: vs.X(-T) - 0.5, size: 1.1 });
  s += note(vs.X(K.win.x1 - 120), vs.Y(-K.win.sill - 400), vs.X(1500), 31, "WINDOW — NOT MEASURED", "", "start");
  s += note(vs.X(K.chase.d + 300), vs.Y(-K.wc.rim + 20), vs.X(700), 38, "WC IN PROFILE", "");
  s += note(vs.X((x1W + x2S) / 2 + 125), vs.Y(-2190), vs.X(2550), 31, "RAIN HEAD ON AN ARM", "");
  s += note(vs.X((x1W + x2S) / 2), vs.Y(-1080), vs.X(2550), 38, "MIXER", "");
  s += note(vs.X(tcx + 150), vs.Y(-1020), vs.X(3400), 31, "FILLER", "", "start");
  s += note(vs.X(tcx - 250), vs.Y(-K.tub.h + 60), vs.X(3400), 38, "TUB, CUT", "", "start");
  s += chainV([vs.Y(-K.drop), vs.Y(-K.H)], vs.X((x1W + x2S) / 2) + 2, [K.H - K.drop], { from: vs.X(x2S) - 2, size: 1.0 });
  s += note(vs.X(x1W + 200), vs.Y(-K.drop - 150), vs.X(1950), 24.5, "CEILING DROPPED 1 FT OVER THE SHOWER — 8 FT", "SHOWER BAY ONLY · THE GLASS OPEN ABOVE");

  // assumed and to ask
  s += heading(258, 158, "ASSUMED", "FROM THE SKETCH — TELL ME IF ANY OF THESE IS WRONG", 150);
  ["WC and shower each 4 ft wide and 3 ft 5 in from the window wall, glass fronts in one line.",
   "The WC wall-hung on the 7 in wall, its cistern hidden in it, facing the shower.",
   "Glass clear, 10 mm, frameless, 6 ft 6¾ in high, open above; chrome hinges, doors opening out.",
   "Shower: level floor falling to a linear drain at the back; rain head on an arm, mixer on the wall.",
   "Tub: freestanding oval, 5 ft 7 × 2 ft 7½, in the 3 ft 1 in bay, a floor-standing filler at its head.",
   "Vanity: scheme C, unchanged. The window's size and height are still not measured."]
    .forEach((n, i) => (s += text(258, 169 + i * 4.3, n, { size: 1.4 })));
  s += heading(258, 201, "TO ASK", "", 150);
  ["The sketch writes 3'0\" by the tub: the tub's width, or the pier's length (it is 3 ft)?",
   "What is the shape along the door wall between the pier and the east wall?",
   "Glass: clear, reeded (very 1930s) or frosted — the WC's especially? To the ceiling?",
   "Wall-hung WC, or one standing on the floor? And the walls: marble or plaster?"]
    .forEach((n, i) => (s += text(258, 212 + i * 4.3, n, { size: 1.4 })));

  // notes
  s += heading(18, 208, "NOTES", `REVISION ${K.rev.split(" ")[0]}`, 120);
  ["From the owner's sketch and words: along the window wall, after the 7 in wall — the owner's",
   "\"WC wall\" — the WC and the shower side by side, each 4 ft wide, both behind glass and coming",
   "the same distance off the wall (3 ft 5 in). The tub on the right, in the bay between the pier and",
   "the east wall. The vanity stays on the door wall against the pier, as AST-DR-021.",
   `That leaves ${ft(D - K.van.d - 20 - fy)} clear between the glass and the vanity, and the door swings`,
   "clear of everything. The shell is the measured one; the fittings are all to choose.",
   "Rev 2 (owner, 7 Oct): the ceiling drops 1 ft over the shower bay only, to 8 ft clear —",
   "a plastered box from the window wall to the glass line. Two niches in the WC wall, tall,",
   "side by side above the flush plate, each framed in a marble moulding, as the owner's photo.",
   "The window starts at the WC wall's corner, as the photo; its size is still to measure."]
    .forEach((n, i) => (s += text(18, 219 + i * 4.3, n, { size: 1.45 })));

  // elevation C 1:40, under the plan
  { const scC = 50, L = K.chase.l, vc = view(166, 221 + K.H / scC, scC, "Bathroom WC wall"), tc = vc.w(0.11), dc = `${vc.w(1)} ${vc.w(0.7)}`;
    s += heading(150, 210, "ELEVATION C — THE WC WALL", `LOOKING WEST · SCALE 1:${scC} · THE WINDOW WALL ON THE RIGHT`, 100);
    s += vc.g(wcWall(tc, dc), 0.3);
    const [n1, n2] = K.niches, hy = (y) => L - y;
    s += chainH([0, hy(n2[0] + n2[1]), hy(n2[0]), hy(n1[0] + n1[1]), hy(n1[0]), L].map(vc.X), vc.Y(0) + 4, [hy(n2[0] + n2[1]), n2[1], n2[0] - n1[0] - n1[1], n1[1], n1[0]], { from: vc.Y(0) + 0.5, size: 0.95 });
    s += chainV([vc.Y(0), vc.Y(-n1[2]), vc.Y(-n1[3]), vc.Y(-n2[3]), vc.Y(-K.H)], vc.X(0) - 4, [n1[2], n1[3] - n1[2], n2[3] - n1[3], K.H - n2[3]], { from: vc.X(0) - 0.5, size: 0.95 });
    const LC = labels(vc.X(L + T) + 8, "right", 218, 280);
    LC.add(vc.X(hy(n2[0] + n2[1] / 2)), vc.Y(-1900), "TALL NICHE", `${ft(n2[1])} × ${ft(n2[3] - n2[2])}, 4 IN DEEP`);
    LC.add(vc.X(hy(n1[0] + n1[1] / 2)), vc.Y(-1600), "SHORT NICHE, BY THE WINDOW", `${ft(n1[1])} × ${ft(n1[3] - n1[2])}, 4 IN DEEP`);
    LC.add(vc.X(hy(n1[0]) + K.nicheF / 2), vc.Y(-n1[2] + 20), "MARBLE FRAME MOULDING", "1½ IN, ROUND EACH NICHE");
    LC.add(vc.X(hy(fy / 2) + 60), vc.Y(-K.wc.plate), "FLUSH PLATE", "CISTERN IN THE 7 IN WALL");
    LC.add(vc.X(hy(fy / 2)), vc.Y(-K.wc.rim + 100), "WALL-HUNG WC", "");
    LC.add(vc.X(L + T / 2), vc.Y(-K.win.sill - 300), "WINDOW, CUT", "IN THE WINDOW WALL");
    s += LC.draw();
    s += text(150, 286.5, "Niches read off the owner's photo — sizes ASSUMED, to measure on site.", { size: 1.25, fill: THIN }); }

  s += titleBlock({ title: "BATHROOM", sub: "Plan · Section B–B · The WC wall", date: K.date, rev: K.rev, dwg: "AST-DR-037", scale: "AS NOTED @ A3" });
  window.DRAWINGS.bathroom = { title: "Bathroom · AST-DR-037", svg: mono(sheet(s)), model: true };
  window.BATHGEOM = { K, x1W, x2S, fy, tcx, tcy, doorWC, doorSH };
})();
