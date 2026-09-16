// Study wall — bookcase (left), panelled centre for a painting between two fluted pilasters, window (right).
// AST-DR-005 general arrangement, AST-DR-006 details. Real-world units are mm; y measured UP from the floor.

window.DRAWINGS = window.DRAWINGS || {};

const WALL = {
  rev: "1 — 16 ft × 9 ft, full-height plain pilasters, cupboards in every bay",
  date: "17.09.2026",
  W: 4877, H: 2743,            // 16 ft wall, 9 ft ceiling (owner's measure)
  skirt: 120,                  // skirting line on the cupboard fronts
  base: { h: 800, top: 40, d: 450, over: 25 },   // cupboards under all three bays, reeded top (matches the desk edge)
  book: { w: 1500, d: 350, stile: 60, shelves: [1150, 1420, 1690, 1960], spring: 2150, rise: 180 },
  pil: { w: 240, proj: 60, flutes: 9, capH: 130, d: 440 },  // from reference 1: fluted, floor to cornice, moulded cap
  panel: { w: 1400, set: 200, frame: 70, painting: [800, 1000], paintingC: 1630 },
  win: { w: 1200, sill: 840, head: 2150, arch: 70, wall: 230 },  // window size ASSUMED
  ent: { architrave: 60, frieze: 80, mod: 70, dentil: 30, crown: 90, proj: 160, modW: 44, modPitch: 105 },
};

(function () {
  const { INK, THIN, DIM, f, text, view, chainH, chainV, note, heading, frame, titleBlock, sheet } = window.DK;
  const K = WALL, B = K.base, BK = K.book, PL = K.pil, PN = K.panel, WN = K.win, E = K.ent;

  // ── layout along the wall (x from the left corner) ──
  const xBook = [0, BK.w];
  const xP1 = [BK.w, BK.w + PL.w];
  const xPanel = [xP1[1], xP1[1] + PN.w];
  const xP2 = [xPanel[1], xPanel[1] + PL.w];
  const xZone = [xP2[1], K.W];
  const winC = (xZone[0] + xZone[1]) / 2, xWin = [winC - WN.w / 2, winC + WN.w / 2];
  // ── heights ──
  const yTop = B.h + B.top;                                   // counter top
  const entH = E.architrave + E.frieze + E.mod + E.dentil + E.crown;
  const yEnt = K.H - entH;                                    // underside of the entablature
  const yCap = yEnt - PL.capH;
  const yFr = yEnt + E.architrave, yMod = yFr + E.frieze, yDen = yMod + E.mod, yCrown = yDen + E.dentil;

  // elevation helpers (local mm, SVG y down)
  const ey = (y) => K.H - y;
  const R = (x0, y0, x1, y1, a = "") => `<rect x="${f(Math.min(x0, x1))}" y="${f(ey(Math.max(y0, y1)))}" width="${f(Math.abs(x1 - x0))}" height="${f(Math.abs(y1 - y0))}" ${a}/>`;
  const Ln = (x0, y0, x1, y1, a = "") => `<line x1="${f(x0)}" y1="${f(ey(y0))}" x2="${f(x1)}" y2="${f(ey(y1))}" ${a}/>`;
  const W = (th) => `stroke-width="${th}"`;

  // Fluted pilaster after reference 1: floor to cornice, plinth block, torus, stopped flutes, plain moulded capital.
  function pilaster(x0, th) {
    const x1 = x0 + PL.w;
    let o = R(x0, 0, x1, yEnt);
    // base at the floor: plinth block, torus, fillet
    o += R(x0 - 15, 0, x1 + 15, 130) + R(x0 - 10, 130, x1 + 10, 160) + R(x0 - 5, 160, x1 + 5, 175);
    o += `<g ${W(th)}>${Ln(x0 - 15, 110, x1 + 15, 110)}${Ln(x0 - 10, 145, x1 + 10, 145)}</g>`;
    // stopped flutes, rounded ends
    const n = PL.flutes, pitch = (PL.w - 30) / n, fw = pitch * 0.7, f0 = 235, f1 = yCap - 40;
    for (let i = 0; i < n; i++) {
      const xc = x0 + 15 + pitch * (i + 0.5);
      o += `<rect ${W(th)} x="${f(xc - fw / 2)}" y="${f(ey(f1))}" width="${f(fw)}" height="${f(f1 - f0)}" rx="${f(fw / 2)}"/>`;
    }
    // capital: astragal, neck, ovolo, abacus
    o += R(x0 - 4, yCap, x1 + 4, yCap + 18) + `<g ${W(th)}>${Ln(x0 - 4, yCap + 9, x1 + 4, yCap + 9)}</g>`;
    o += `<path d="M ${f(x0)} ${f(ey(yCap + 55))} C ${f(x0 - 2)} ${f(ey(yCap + 70))} ${f(x0 - 12)} ${f(ey(yCap + 78))} ${f(x0 - 12)} ${f(ey(yCap + 85))} L ${f(x1 + 12)} ${f(ey(yCap + 85))} C ${f(x1 + 12)} ${f(ey(yCap + 78))} ${f(x1 + 2)} ${f(ey(yCap + 70))} ${f(x1)} ${f(ey(yCap + 55))}" fill="#fff"/>`;
    o += `<g ${W(th)}>${Ln(x0, yCap + 55, x1, yCap + 55)}${Ln(x0 - 6, yCap + 72, x1 + 6, yCap + 72)}</g>`;
    o += R(x0 - 22, yCap + 85, x1 + 22, yEnt) + `<g ${W(th)}>${Ln(x0 - 22, yCap + 100, x1 + 22, yCap + 100)}</g>`;
    return o;
  }

  // Cupboard door with a moulded frame and raised field (same family as the painting panel) and a brass drop handle.
  function door(x0, x1, y0, y1, th, handleSide) {
    let o = R(x0, y0, x1, y1) + R(x0 + 38, y0 + 38, x1 - 38, y1 - 38);
    o += `<g ${W(th)}>${R(x0 + 50, y0 + 50, x1 - 50, y1 - 50)}${R(x0 + 62, y0 + 62, x1 - 62, y1 - 62)}${R(x0 + 95, y0 + 95, x1 - 95, y1 - 95)}</g>`;
    [[x0 + 38, y0 + 38, x0 + 62, y0 + 62], [x1 - 38, y0 + 38, x1 - 62, y0 + 62], [x0 + 38, y1 - 38, x0 + 62, y1 - 62], [x1 - 38, y1 - 38, x1 - 62, y1 - 62]].forEach(([a, b, c, d]) => { o += Ln(a, b, c, d, W(th)); });
    const hx = handleSide > 0 ? x1 - 20 : x0 + 20, hy = y1 - 150;
    o += `<circle cx="${f(hx)}" cy="${f(ey(hy))}" r="7" ${W(th)}/><path ${W(th)} d="M ${f(hx - 9)} ${f(ey(hy) + 4)} Q ${f(hx)} ${f(ey(hy) + 22)} ${f(hx + 9)} ${f(ey(hy) + 4)}"/>`;
    return o;
  }

  // Entablature across the full width: stepped architrave, frieze, plain modillion blocks, dentils, crown.
  function entablature(x0, x1, th) {
    let o = R(x0, yEnt, x1, K.H);
    o += `<g ${W(th)}>${Ln(x0, yEnt + 22, x1, yEnt + 22)}${Ln(x0, yEnt + 42, x1, yEnt + 42)}${Ln(x0, yFr, x1, yFr)}${Ln(x0, yMod, x1, yMod)}${Ln(x0, yMod + 14, x1, yMod + 14)}${Ln(x0, yDen, x1, yDen)}${Ln(x0, yCrown, x1, yCrown)}${Ln(x0, yCrown + 30, x1, yCrown + 30)}${Ln(x0, yCrown + 62, x1, yCrown + 62)}${Ln(x0, K.H - 12, x1, K.H - 12)}</g>`;
    // breaks forward over each pilaster
    [xP1, xP2].forEach(([a, b]) => { o += `<g ${W(th)}>${Ln(a - 26, yEnt, a - 26, yMod)}${Ln(b + 26, yEnt, b + 26, yMod)}</g>`; });
    // dentils
    for (let x = x0 + 10; x + 16 < x1; x += 28) o += `<rect ${W(th)} x="${f(x)}" y="${f(ey(yCrown - 4))}" width="16" height="${E.dentil - 8}"/>`;
    // plain modillion blocks (no carving)
    for (let x = x0 + E.modPitch / 2; x < x1 - E.modW / 2; x += E.modPitch) {
      o += R(x - E.modW / 2, yMod + 14, x + E.modW / 2, yDen);
      o += `<g ${W(th)}>${R(x - E.modW / 2 + 8, yMod + 22, x + E.modW / 2 - 8, yDen - 10)}</g>`;
    }
    return o;
  }

  // Bookcase bay with arched, lit head.
  function bookcase(th) {
    const [x0, x1] = xBook, s = BK.stile, xi0 = x0 + s, xi1 = x1 - s, span = xi1 - xi0, cx = (xi0 + xi1) / 2;
    const r = (span * span / 4 + BK.rise * BK.rise) / (2 * BK.rise), cyUp = BK.spring + BK.rise - r;   // arc centre (y up)
    let o = R(x0, yTop, x1, yEnt);
    o += `<g ${W(th)}>${Ln(xi0, yTop, xi0, BK.spring)}${Ln(xi1, yTop, xi1, BK.spring)}</g>`;
    BK.shelves.forEach((y) => { o += R(xi0, y - 25, xi1, y, W(th)) + Ln(xi0, y - 12, xi1, y - 12, `${W(th)} opacity=".5"`); });
    // books, suggested
    [yTop, ...BK.shelves].forEach((y, i) => {
      let x = xi0 + 20; const top = (BK.shelves[i] ?? BK.spring) - 25 - 30;
      while (x < xi1 - 40) { const bw = 22 + ((x * 7) % 18), bh = top - y - ((x * 13) % 60); o += R(x, y, x + bw, y + bh, `${W(th)} opacity=".35"`); x += bw + 2; }
    });
    // arch opening, archivolt and keystone
    const arc = (rad) => { const dx = Math.sqrt(rad * rad - (BK.spring - cyUp) ** 2); return `M ${f(cx - dx)} ${f(ey(BK.spring))} A ${f(rad)} ${f(rad)} 0 0 1 ${f(cx + dx)} ${f(ey(BK.spring))}`; };
    o += `<path d="${arc(r)}"/><path ${W(th)} d="${arc(r + 35)}"/><path d="${arc(r + 60)}"/>`;
    o += `<path d="M ${f(cx - 26)} ${f(ey(cyUp + r - 8))} L ${f(cx - 34)} ${f(ey(cyUp + r + 95))} L ${f(cx + 34)} ${f(ey(cyUp + r + 95))} L ${f(cx + 26)} ${f(ey(cyUp + r - 8))} Z" fill="#fff"/>`;
    o += `<g ${W(th)}>${Ln(cx - 20, cyUp + r + 20, cx + 20, cyUp + r + 20)}</g>`;
    // spandrel panels
    [-1, 1].forEach((m) => {
      const pts = [];
      for (let a = 0; a <= 1.001; a += 0.1) { const ang = Math.PI / 2 - m * a * (Math.PI / 2 - Math.acos(Math.min(1, (span / 2 + 40) / (r + 85)))); const px = cx + (r + 85) * Math.cos(ang) * (m < 0 ? -1 : 1) * (m < 0 ? -1 : 1), py = cyUp + (r + 85) * Math.sin(ang); pts.push([cx + m * Math.abs(px - cx), py]); }
      const edgeX = m < 0 ? xi0 - 20 : xi1 + 20, topY = yEnt - 30;
      const poly = [[edgeX, topY], ...pts.filter((p) => p[1] < topY && (m < 0 ? p[0] > edgeX : p[0] < edgeX)).map((p) => p)];
      if (poly.length > 2) o += `<path ${W(th)} d="M ${poly.map((p) => `${f(p[0])} ${f(ey(p[1]))}`).join(" L ")} Z"/>`;
    });
    // up-light in the arch
    o += `<circle cx="${f(cx)}" cy="${f(ey(cyUp + r - 30))}" r="12" ${W(th)}/>`;
    [-40, -20, 0, 20, 40].forEach((d) => { o += Ln(cx, cyUp + r - 44, cx + d * 3, cyUp + r - 170, `${W(th)} opacity=".35" stroke-dasharray="20 14"`); });
    return o;
  }

  function centrePanel(th) {
    const [x0, x1] = xPanel, fr = PN.frame, ins = 70;
    const a0 = x0 + ins, a1 = x1 - ins, b0 = yTop + 90, b1 = yEnt - 90;
    let o = R(x0, yTop, x1, yEnt, W(th));
    // bolection frame: outer, step, inner
    o += R(a0, b0, a1, b1) + `<g ${W(th)}>${R(a0 + 22, b0 + 22, a1 - 22, b1 - 22)}${R(a0 + 45, b0 + 45, a1 - 45, b1 - 45)}</g>` + R(a0 + fr, b0 + fr, a1 - fr, b1 - fr);
    [[a0, b0, a0 + fr, b0 + fr], [a1, b0, a1 - fr, b0 + fr], [a0, b1, a0 + fr, b1 - fr], [a1, b1, a1 - fr, b1 - fr]].forEach(([p, q, r2, s2]) => { o += Ln(p, q, r2, s2, W(th)); });
    // raised field
    o += `<g ${W(th)}>${R(a0 + fr + 40, b0 + fr + 40, a1 - fr - 40, b1 - fr - 40)}</g>`;
    // painting (optional) + picture light
    const [pw, ph] = PN.painting, pcx = (x0 + x1) / 2, pcy = PN.paintingC;
    o += `<g ${W(th)} stroke-dasharray="30 18">${R(pcx - pw / 2, pcy - ph / 2, pcx + pw / 2, pcy + ph / 2)}${R(pcx - pw / 2 + 70, pcy - ph / 2 + 70, pcx + pw / 2 - 70, pcy + ph / 2 - 70)}</g>`;
    o += R(pcx - 220, pcy + ph / 2 + 70, pcx + 220, pcy + ph / 2 + 95) + Ln(pcx, pcy + ph / 2 + 70, pcx, pcy + ph / 2 + 30, W(th));
    return o;
  }

  function windowZone(th) {
    const [z0, z1] = xZone, [w0, w1] = xWin, ar = WN.arch;
    let o = R(z0, yTop, z1, yEnt, W(th));
    // architrave round the opening
    o += R(w0 - ar, WN.sill, w1 + ar, WN.head + ar) + `<g ${W(th)}>${R(w0 - ar + 20, WN.sill, w1 + ar - 20, WN.head + ar - 20)}${R(w0 - ar + 40, WN.sill, w1 + ar - 40, WN.head + ar - 40)}</g>`;
    // opening, pair of casements with glazing bars
    o += R(w0, WN.sill, w1, WN.head);
    const mid = (w0 + w1) / 2;
    [[w0 + 20, mid - 5], [mid + 5, w1 - 20]].forEach(([a, b]) => {
      o += R(a, WN.sill + 20, b, WN.head - 20, W(th));
      for (let k = 1; k < 3; k++) o += Ln(a, WN.sill + 20 + ((WN.head - WN.sill - 40) * k) / 3, b, WN.sill + 20 + ((WN.head - WN.sill - 40) * k) / 3, W(th));
      o += Ln((a + b) / 2, WN.sill + 20, (a + b) / 2, WN.head - 20, W(th));
    });
    // panel over the head, with keystone
    o += `<g ${W(th)}>${R(w0, WN.head + ar + 30, w1, yEnt - 30)}</g>`;
    o += `<path d="M ${f(mid - 30)} ${f(ey(WN.head))} L ${f(mid - 40)} ${f(ey(WN.head + ar + 15))} L ${f(mid + 40)} ${f(ey(WN.head + ar + 15))} L ${f(mid + 30)} ${f(ey(WN.head))} Z" fill="#fff"/>`;
    // side panels
    [[z0 + 30, w0 - ar - 25], [w1 + ar + 25, z1 - 30]].forEach(([a, b]) => { if (b - a > 40) o += `<g ${W(th)}>${R(a, yTop + 60, b, yEnt - 30)}</g>`; });
    return o;
  }

  // Cupboards under all three bays (bookcase, centre panel, window), each bay with its own reeded counter
  // that dies into the full-height pilasters.
  function baseBand(th) {
    let o = "";
    [xBook, xPanel, xZone].forEach(([a, b]) => {
      o += R(a, 0, b, B.h) + R(a, B.h, b, yTop);
      o += `<g ${W(th)}>${Ln(a, B.h + 10, b, B.h + 10)}${Ln(a, B.h + 20, b, B.h + 20)}${Ln(a, B.h + 30, b, B.h + 30)}${Ln(a, 40, b, 40)}</g>`;
      const m = (a + b) / 2;
      o += door(a + 20, m - 4, 50, B.h - 20, th, 1) + door(m + 4, b - 20, 50, B.h - 20, th, -1);
    });
    return o;
  }

  function elevation(th) {
    return baseBand(th) + bookcase(th) + centrePanel(th) + windowZone(th) + pilaster(xP1[0], th) + pilaster(xP2[0], th) + entablature(0, K.W, th) +
      `<line x1="-150" y1="${ey(0)}" x2="${K.W + 150}" y2="${ey(0)}" stroke-width="${th * 5}"/><line x1="-150" y1="${ey(K.H)}" x2="${K.W + 150}" y2="${ey(K.H)}" stroke-width="${th * 3}" stroke-dasharray="40 20"/>`;
  }

  // PLAN, cut at 1200 above the floor. y = depth from the wall face (down the page = into the room).
  function plan(th, dash) {
    let o = `<path d="M -150 0 L ${K.W + 150} 0 M -150 -${WN.wall} L ${xWin[0] - WN.arch} -${WN.wall} M ${xWin[1] + WN.arch} -${WN.wall} L ${K.W + 150} -${WN.wall}" stroke-width="${th * 3}"/>`;
    o += `<rect x="-150" y="-${WN.wall}" width="${K.W + 300}" height="${WN.wall}" fill="url(#hatchWall)" stroke="none"/>`;
    // window opening in the wall
    o += `<rect x="${xWin[0]}" y="-${WN.wall}" width="${WN.w}" height="${WN.wall}" fill="#fff"/><g stroke-width="${th}"><line x1="${xWin[0]}" y1="-${WN.wall / 2 + 30}" x2="${xWin[1]}" y2="-${WN.wall / 2 + 30}"/><line x1="${xWin[0]}" y1="-${WN.wall / 2 - 30}" x2="${xWin[1]}" y2="-${WN.wall / 2 - 30}"/></g>`;
    // counter below (dashed)
    o += `<rect x="0" y="0" width="${K.W}" height="${B.d + B.over}" stroke-dasharray="${dash}" stroke-width="${th}"/>`;
    // bookcase carcase and shelves
    o += `<rect x="0" y="0" width="${BK.w}" height="${BK.d}"/><rect x="${BK.stile}" y="18" width="${BK.w - 2 * BK.stile}" height="${BK.d - 18}" stroke-width="${th}"/>`;
    // pilasters with fluted faces
    [xP1, xP2].forEach(([a, b]) => {
      o += `<rect x="${a}" y="0" width="${PL.w}" height="${PL.d}"/>`;
      let d = `M ${a} ${PL.d} L ${a} ${PL.d + PL.proj - 15} `; const n = PL.flutes, pitch = (PL.w - 30) / n, fw = pitch * 0.7;
      d = `M ${a} ${PL.d} L ${a} ${PL.d + PL.proj} L ${a + 15} ${PL.d + PL.proj} `;
      for (let i = 0; i < n; i++) { const xc = a + 15 + pitch * (i + 0.5); d += `L ${f(xc - fw / 2)} ${PL.d + PL.proj} A ${f(fw / 2)} ${f(fw / 2)} 0 0 0 ${f(xc + fw / 2)} ${PL.d + PL.proj} `; }
      d += `L ${b} ${PL.d + PL.proj} L ${b} ${PL.d}`;
      o += `<path d="${d}" fill="#fff"/>`;
    });
    // centre panelling set forward of the wall on battens
    o += `<rect x="${xPanel[0]}" y="0" width="${PN.w}" height="${PN.set}" stroke-width="${th}"/><line x1="${xPanel[0]}" y1="${PN.set}" x2="${xPanel[1]}" y2="${PN.set}"/>`;
    o += `<rect x="${xPanel[0] + 70}" y="${PN.set}" width="${PN.w - 140}" height="35" stroke-width="${th}"/>`;
    // window zone panelling and reveal linings
    o += `<rect x="${xZone[0]}" y="0" width="${xZone[1] - xZone[0]}" height="${PN.set}" stroke-width="${th}"/><line x1="${xZone[0]}" y1="${PN.set}" x2="${xWin[0] - WN.arch}" y2="${PN.set}"/><line x1="${xWin[1] + WN.arch}" y1="${PN.set}" x2="${xZone[1]}" y2="${PN.set}"/>`;
    o += `<g stroke-width="${th}"><path d="M ${xWin[0] - WN.arch} ${PN.set} L ${xWin[0] - WN.arch} ${PN.set + 25} L ${xWin[0]} ${PN.set + 25} L ${xWin[0]} -${WN.wall / 2 + 30}"/><path d="M ${xWin[1] + WN.arch} ${PN.set} L ${xWin[1] + WN.arch} ${PN.set + 25} L ${xWin[1]} ${PN.set + 25} L ${xWin[1]} -${WN.wall / 2 + 30}"/></g>`;
    // entablature projection above (dashed)
    o += `<line x1="0" y1="${PL.d + E.proj - 30}" x2="${K.W}" y2="${PL.d + E.proj - 30}" stroke-dasharray="${dash}" stroke-width="${th}"/>`;
    return o;
  }

  // SECTION through the bookcase bay (side view, wall on the left, room to the right).
  function section(th) {
    const hatch = `fill="url(#hatchWall2)"`;
    let o = `<rect x="-${WN.wall}" y="${ey(K.H)}" width="${WN.wall}" height="${K.H}" fill="url(#hatchWall)" stroke-width="${th * 2}"/>`;
    // base cupboard + counter
    o += `<rect x="0" y="${ey(B.h)}" width="${B.d}" height="${B.h}"/><rect x="0" y="${ey(yTop)}" width="${B.d + B.over}" height="${B.top}" ${hatch}/>`;
    o += `<g stroke-width="${th}"><rect x="${B.d - 22}" y="${ey(B.h - 20)}" width="22" height="${B.h - 20 - K.skirt}"/><line x1="18" y1="${ey(450)}" x2="${B.d - 22}" y2="${ey(450)}"/><rect x="0" y="${ey(K.skirt)}" width="${B.d - 20}" height="${K.skirt}"/></g>`;
    // upper case: back, shelves, arch soffit
    o += `<rect x="0" y="${ey(yEnt)}" width="${BK.d}" height="${yEnt - yTop}"/><rect x="0" y="${ey(yEnt)}" width="18" height="${yEnt - yTop}" ${hatch}/>`;
    BK.shelves.forEach((y) => { o += `<rect x="18" y="${ey(y)}" width="${BK.d - 18}" height="25" ${hatch}/>`; });
    o += `<path stroke-width="${th}" d="M 18 ${ey(BK.spring)} L ${BK.d} ${ey(BK.spring)} M 18 ${ey(BK.spring + BK.rise)} L ${BK.d} ${ey(BK.spring + BK.rise)}" stroke-dasharray="30 20"/>`;
    // entablature profile
    const p = E.proj, z = (y) => ey(y);
    const prof = [[BK.d, yEnt], [BK.d + 10, yEnt], [BK.d + 10, yEnt + 30], [BK.d + 20, yEnt + 30], [BK.d + 20, yEnt + 58], [BK.d + 32, yEnt + 58], [BK.d + 32, yFr], [BK.d + 26, yFr], [BK.d + 26, yMod],
      [BK.d + 40, yMod], [BK.d + 40, yMod + 14], [BK.d + 90, yMod + 14], [BK.d + 90, yDen], [BK.d + 110, yDen], [BK.d + 110, yCrown], [BK.d + 130, yCrown], [BK.d + 130, yCrown + 15]];
    let d = `M ${prof.map(([x, y]) => `${f(x)} ${f(z(y))}`).join(" L ")} C ${f(BK.d + 130)} ${f(z(yCrown + 70))} ${f(BK.d + p)} ${f(z(yCrown + 60))} ${f(BK.d + p)} ${f(z(K.H - 25))} L ${f(BK.d + p)} ${f(z(K.H))} L 0 ${z(K.H)} L 0 ${z(yEnt)} Z`;
    o += `<path d="${d}" ${hatch}/>`;
    o += `<path stroke-width="${th}" d="M ${BK.d + 40} ${f(z(yMod + 14))} L ${BK.d + 40} ${f(z(yMod + 70))} Q ${BK.d + 48} ${f(z(yDen))} ${BK.d + 90} ${f(z(yDen))}"/>`;
    o += `<line x1="-${WN.wall + 80}" y1="${ey(0)}" x2="${B.d + 300}" y2="${ey(0)}" stroke-width="${th * 5}"/><line x1="-${WN.wall + 80}" y1="${ey(K.H)}" x2="${B.d + 300}" y2="${ey(K.H)}" stroke-width="${th * 3}"/>`;
    return o;
  }

  // ═════════════ SHEET 1 — STUDY WALL GA ═════════════
  window.DK.begin("studywall");
  let s1 = frame();
  s1 += `<defs><pattern id="hatchWall" patternUnits="userSpaceOnUse" width="40" height="40" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="40" stroke="#999" stroke-width="4"/></pattern><pattern id="hatchWall2" patternUnits="userSpaceOnUse" width="25" height="25" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="25" stroke="#999" stroke-width="3"/></pattern></defs>`;
  const sc = 25;
  const vE = view(30, 34, sc, "Wall elevation"), tE = vE.w(0.1);
  s1 += heading(18, 17, "ELEVATION — STUDY WALL", `SCALE 1:${sc} · BOOKCASE · PANEL FOR PAINTING · WINDOW`, 90);
  s1 += vE.g(elevation(tE), 0.28);
  const yb = vE.Y(ey(0));
  s1 += chainH([0, xBook[1], xP1[1], xPanel[1], xP2[1], K.W].map(vE.X), yb + 6, [BK.w, PL.w, PN.w, PL.w, xZone[1] - xZone[0]], { from: yb + 1, size: 1.5 });
  s1 += chainH([vE.X(0), vE.X(K.W)], yb + 12, [`${K.W} WALL (16 FT)`], { from: yb + 1 });
  s1 += chainV([K.H, yEnt, yCap, yTop, B.h, 0].map((y) => vE.Y(ey(y))), vE.X(K.W) + 8, [entH, PL.capH, yCap - yTop, B.top, B.h], { from: vE.X(K.W) + 1, size: 1.4 });
  s1 += chainV([vE.Y(ey(K.H)), vE.Y(ey(0))], vE.X(K.W) + 15, [`${K.H} CEILING (9 FT)`], { from: vE.X(K.W) + 1 });
  s1 += chainV([vE.Y(ey(WN.head)), vE.Y(ey(WN.sill))], vE.X(xWin[1]) + 6, [WN.head - WN.sill], { from: vE.X(xWin[1]) + 1, size: 1.4 });
  // labels
  const lab = (x, y, lx, ly, t1, t2, a) => note(vE.X(x), vE.Y(ey(y)), lx, ly, t1, t2, a);
  s1 += lab(xP2[1] + 15, yCap + 70, vE.X(xP2[1] + 700), 27, "MOULDED CAPITAL", "NO CARVING — REF. 1");
  s1 += lab(xPanel[0] + 400, (yMod + yDen) / 2, vE.X(xPanel[0] + 400) + 10, 27, "PLAIN MODILLION BLOCKS + DENTILS", "REF. 2 — NO LEAF CARVING");
  s1 += lab(xP2[0] + 60, 1500, vE.X(xP2[1]) + 22, vE.Y(ey(1700)), "FLUTED PILASTER ×2", "FLOOR TO CORNICE — REF. 1");
  s1 += lab((xPanel[0] + xPanel[1]) / 2 + 400, 1150, vE.X(xP2[1]) + 22, vE.Y(ey(1200)), "MOULDED PANEL", "PAINTING OPTIONAL — REF. 1");
  s1 += lab(xP1[0] + 120, 60, vE.X(xP1[0] + 120) + 4, vE.Y(ey(0)) + 3, "PLINTH BLOCK AT FLOOR", "");
  s1 += lab(BK.w / 2, BK.spring + BK.rise - 20, vE.X(-40), vE.Y(ey(2450)) + 12, "LIT ARCHED HEAD", "REF. 2", "end");
  s1 += lab(260, 420, vE.X(-40), vE.Y(ey(450)), "CUPBOARDS, ALL 3 BAYS", "MOULDED PANEL DOORS", "end");
  s1 += lab(BK.w / 2, yTop - 10, vE.X(-40), vE.Y(ey(900)), "REEDED TOP", "MATCHES THE DESK", "end");

  // Plan
  const scP = 25, vP = view(30, 196, scP, "Wall plan"), tP = vP.w(0.1);
  s1 += heading(18, 180, "PLAN", `CUT AT 1200 · SCALE 1:${scP} · ROOM BELOW, WALL ABOVE`, 60);
  s1 += vP.g(plan(tP, `${vP.w(1)} ${vP.w(0.7)}`), 0.28);
  s1 += chainV([vP.Y(0), vP.Y(BK.d), vP.Y(PL.d + PL.proj), vP.Y(B.d + B.over)], vP.X(-150) - 4, [BK.d, PL.proj + PL.d - BK.d, ""], { from: vP.X(0) - 1, size: 1.4 });
  s1 += note(vP.X(xWin[0] + 100), vP.Y(-WN.wall / 2), vP.X(xWin[0] + 100) + 4, vP.Y(-WN.wall) - 5, "WINDOW (ASSUMED 1200 WIDE)", "PANELLED REVEALS");

  // Section
  const scS = 25, vS = view(345, 34, scS, "Section through bookcase"), tS = vS.w(0.1);
  s1 += heading(318, 17, "SECTION A–A", `THROUGH BOOKCASE · 1:${scS}`, 50);
  s1 += vS.g(section(tS), 0.28);
  s1 += note(vS.X(BK.d + 150), vS.Y(ey(yCrown + 30)), vS.X(BK.d + 190) + 8, vS.Y(ey(K.H)) + 4, "CROWN", "");
  s1 += note(vS.X(BK.d + 65), vS.Y(ey(yMod + 40)), vS.X(BK.d + 190) + 8, vS.Y(ey(yMod)) + 2, "MODILLION", "");
  s1 += note(vS.X(B.d + 10), vS.Y(ey(yTop - 20)), vS.X(B.d + 190) + 8, vS.Y(ey(yTop + 120)), "COUNTER", `${B.d} DEEP + ${B.over}`);
  s1 += chainH([vS.X(0), vS.X(BK.d), vS.X(B.d + B.over)], vS.Y(ey(0)) + 6, [BK.d, B.d + B.over - BK.d], { from: vS.Y(ey(0)) + 1, size: 1.3 });

  // Notes
  s1 += heading(318, 170, "NOTES", "REVISION 1", 40);
  ["Wall 16 ft wide, ceiling 9 ft (owner's measure).", "Window size and position ASSUMED — measure.", "Elements taken from the references:",
   "   Ref. 1 — full-height fluted pilasters, moulded", "   painting panel, cupboards under every bay.", "   Ref. 2 — block-and-dentil cornice (plain,",
   "   no leaf carving), lit arched bookcase head.", "Solid teak; polish to match the desk.", "Gold only on handles."]
    .forEach((n, i) => { s1 += text(318, 181 + i * 4.1, n, { size: 1.55 }); });
  s1 += titleBlock({ title: "STUDY WALL — GENERAL ARRANGEMENT", sub: "Elevation · Plan · Section", date: K.date, rev: K.rev, dwg: "AST-DR-005" });

  // ═════════════ SHEET 2 — DETAILS ═════════════
  window.DK.begin("studywall-details");
  let s2 = frame();
  s2 += `<defs><pattern id="hatchSW" patternUnits="userSpaceOnUse" width="3" height="3" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="3" stroke="#999" stroke-width="0.25"/></pattern></defs>`;

  // 1 — pilaster capital + base, elevation 1:5 with break
  s2 += heading(18, 17, "1 · PILASTER", "CAPITAL AND BASE · ELEVATION · SCALE 1:5 · REF. 1", 70);
  {
    const s = 5, keep = 300, baseKeep = 330;
    const vC = view(55, 32 - (K.H - yEnt) / s, s, "Pilaster capital");
    s2 += vC.g(`<clipPath id="clipCap"><rect x="-60" y="${ey(yEnt)}" width="${PL.w + 120}" height="${keep}"/></clipPath><g clip-path="url(#clipCap)">${pilaster(0, vC.w(0.12))}</g>`, 0.3);
    const gap = 8, top2 = 32 + keep / s + gap;
    const vB = view(55, top2 - (K.H - baseKeep) / s, s, "Pilaster base");
    s2 += vB.g(`<clipPath id="clipBase"><rect x="-60" y="${ey(baseKeep)}" width="${PL.w + 120}" height="${baseKeep + 20}"/></clipPath><g clip-path="url(#clipBase)">${pilaster(0, vB.w(0.12))}<line x1="-80" y1="${ey(0)}" x2="${PL.w + 80}" y2="${ey(0)}" stroke-width="${vB.w(0.5)}"/></g>`, 0.3);
    const brk = 32 + keep / s + gap / 2;
    s2 += `<path d="M 40 ${brk} L 70 ${brk} L 74 ${brk - 3} L 80 ${brk + 3} L 84 ${brk} L 115 ${brk}" stroke="${INK}" stroke-width="0.2" fill="none"/>`;
    s2 += chainH([vC.X(-22), vC.X(0), vC.X(PL.w), vC.X(PL.w + 22)], 29, [22, PL.w, 22], { from: 31, size: 1.4 });
    s2 += note(vC.X(PL.w + 22), vC.Y(ey(yCap + 108)), 128, 38, "ABACUS", "");
    s2 += note(vC.X(PL.w + 10), vC.Y(ey(yCap + 75)), 128, 46, "OVOLO", "");
    s2 += note(vC.X(PL.w), vC.Y(ey(yCap + 35)), 128, 54, "NECK", "");
    s2 += note(vC.X(PL.w + 4), vC.Y(ey(yCap + 9)), 128, 62, "ASTRAGAL", "");
    s2 += note(vC.X(PL.w / 2), vC.Y(ey(yCap - 120)), 128, 74, `${PL.flutes} STOPPED FLUTES`, "ROUNDED ENDS, FULL HEIGHT");
    s2 += note(vB.X(PL.w + 10), vB.Y(ey(145)), 128, vB.Y(ey(170)), "TORUS", "");
    s2 += note(vB.X(PL.w + 15), vB.Y(ey(60)), 128, vB.Y(ey(60)), "PLINTH BLOCK", "SITS ON THE FLOOR");
    s2 += chainV([vB.Y(ey(175)), vB.Y(ey(130)), vB.Y(ey(0))], vB.X(-15) - 5, [45, 130], { from: vB.X(-15) - 1, size: 1.3 });
  }

  // 2 — pilaster section, plan 1:2
  s2 += heading(150, 17, "2 · PILASTER SECTION", "PLAN · SCALE 1:2", 50);
  {
    const s = 2, v = view(160, 40, s, "Pilaster section"), n = PL.flutes, pitch = (PL.w - 30) / n, fw = pitch * 0.7;
    let d = `M 0 0 L 0 ${PL.proj} L 15 ${PL.proj} `;
    for (let i = 0; i < n; i++) { const xc = 15 + pitch * (i + 0.5); d += `L ${f(xc - fw / 2)} ${PL.proj} A ${f(fw / 2)} ${f(fw / 2)} 0 0 0 ${f(xc + fw / 2)} ${PL.proj} `; }
    d += `L ${PL.w} ${PL.proj} L ${PL.w} 0 Z`;
    s2 += v.g(`<path d="${d}" fill="url(#hatchSW)"/><line x1="-30" y1="0" x2="${PL.w + 30}" y2="0" stroke-width="${v.w(0.5)}"/>`, 0.3);
    s2 += chainH([v.X(0), v.X(PL.w)], v.Y(0) - 4, [PL.w], { from: v.Y(0) - 1 });
    s2 += chainV([v.Y(0), v.Y(PL.proj)], v.X(PL.w) + 6, [PL.proj], { from: v.X(PL.w) + 1, size: 1.5 });
    s2 += note(v.X(15 + pitch * 0.5), v.Y(PL.proj - fw / 2), v.X(15 + pitch * 0.5) + 6, v.Y(PL.proj) + 12, `FLUTE ${f(fw)} WIDE, HALF-ROUND`, `FILLET ${f(pitch - fw)}`);
    s2 += text(v.X(PL.w / 2), v.Y(0) - 12, "FACE OF CASE", { size: 1.5, fill: THIN, anchor: "middle" });
  }

  // 3 — cornice section 1:6, cropped to the entablature
  s2 += heading(300, 17, "3 · CORNICE", "SECTION · SCALE 1:6", 40);
  {
    const s = 6, x0 = BK.d - 40, v = view(305 - x0 / s, 28, s, "Cornice section");
    const clip = `<clipPath id="clipCorn"><rect x="${x0}" y="${ey(K.H) - 5}" width="${E.proj + 60}" height="${entH + 45}"/></clipPath>`;
    const pats = `<pattern id="hatchWall2" patternUnits="userSpaceOnUse" width="25" height="25" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="25" stroke="#999" stroke-width="3"/></pattern><pattern id="hatchWall" patternUnits="userSpaceOnUse" width="40" height="40" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="40" stroke="#999" stroke-width="4"/></pattern>`;
    s2 += v.g(`<defs>${pats}</defs>${clip}<g clip-path="url(#clipCorn)">${section(v.w(0.12))}</g>`, 0.3);
    const xr = v.X(BK.d + E.proj);
    s2 += chainV([K.H, yCrown, yDen, yMod, yFr, yEnt].map((y) => v.Y(ey(y))), xr + 7, [E.crown, E.dentil, E.mod, E.frieze, E.architrave], { from: xr + 1, size: 1.3 });
    s2 += chainH([v.X(BK.d), v.X(BK.d + E.proj)], v.Y(ey(K.H)) - 3, [E.proj], { from: v.Y(ey(K.H)) - 1, size: 1.3 });
    s2 += note(v.X(BK.d + 150), v.Y(ey(yCrown + 70)), xr + 14, v.Y(ey(yCrown + 90)), "CYMA CROWN", "");
    s2 += note(v.X(BK.d + 100), v.Y(ey(yDen + 20)), xr + 14, v.Y(ey(yDen + 10)), "DENTIL", "");
    s2 += note(v.X(BK.d + 65), v.Y(ey(yMod + 45)), xr + 14, v.Y(ey(yMod + 50)), "MODILLION", "");
    s2 += note(v.X(BK.d + 20), v.Y(ey(yEnt + 40)), xr + 14, v.Y(ey(yEnt + 50)), "ARCHITRAVE", "STEPPED");
  }

  // 4 — modillion block, front 1:2
  s2 += heading(150, 95, "4 · MODILLION + DENTILS", "FRONT · SCALE 1:2 · PLAIN", 55);
  {
    const s = 2, v = view(170, 108 - (K.H - yCrown) / s, s, "Modillion front"), th = v.w(0.12);
    let g = `<rect x="-${E.modW}" y="${ey(yCrown)}" width="${E.modW * 3 + 20}" height="${E.dentil}" fill="none"/>`;
    for (let x = -E.modW + 6; x < E.modW * 2 + 10; x += 28) g += `<rect stroke-width="${th}" x="${x}" y="${ey(yCrown - 4)}" width="16" height="${E.dentil - 8}"/>`;
    g += R(0, yMod + 14, E.modW, yDen) + `<rect stroke-width="${th}" x="8" y="${ey(yDen - 10)}" width="${E.modW - 16}" height="${E.mod - 14 - 32}"/>`;
    g += `<line x1="-${E.modW}" y1="${ey(yMod + 14)}" x2="${E.modW * 2 + 20}" y2="${ey(yMod + 14)}"/>`;
    s2 += v.g(g, 0.3);
    s2 += chainH([v.X(0), v.X(E.modW)], v.Y(ey(yMod + 14)) + 6, [E.modW], { from: v.Y(ey(yMod + 14)) + 1, size: 1.4 });
    s2 += chainH([v.X(E.modW), v.X(E.modPitch)], v.Y(ey(yMod + 14)) + 6, [`${E.modPitch} CENTRES`], { from: v.Y(ey(yMod + 14)) + 1, size: 1.4 });
    s2 += note(v.X(E.modW / 2), v.Y(ey(yMod + 50)), v.X(E.modW * 2 + 30), v.Y(ey(yMod + 50)), "PLAIN BLOCK, SUNK PANEL", "NO CARVING");
    s2 += note(v.X(E.modW + 20), v.Y(ey(yCrown + 16)), v.X(E.modW * 2 + 30), v.Y(ey(yCrown + 30)), "DENTILS 16 × 32", "12 GAP");
  }

  // 5 — bolection panel moulding, section 1:2
  s2 += heading(275, 125, "5 · PAINTING PANEL", "BOLECTION MOULDING · SECTION · SCALE 1:2", 60);
  {
    const s = 2, v = view(305, 150, s, "Bolection moulding");
    const d = `M 0 0 L 0 18 L 70 18 L 70 0 Z`;
    const bol = `M 0 18 L 0 26 Q 0 34 8 36 L 22 40 Q 34 44 40 38 Q 52 26 62 30 Q 70 32 70 26 L 70 18 Z`;
    s2 += v.g(`<path d="M -40 0 L 140 0 L 140 18 L 90 18 L 90 12 L 70 12" fill="url(#hatchSW)"/><path d="${bol}" fill="url(#hatchSW)"/><path d="M -40 0 L -40 18 L 0 18" fill="none"/><path d="M 70 12 L 70 18" fill="none"/>`, 0.3);
    s2 += chainH([v.X(0), v.X(70)], v.Y(0) - 4, [70], { from: v.Y(0) - 1, size: 1.4 });
    s2 += chainV([v.Y(18), v.Y(44)], v.X(140) + 5, [26], { from: v.X(70) + 1, size: 1.4 });
    s2 += note(v.X(35), v.Y(42), v.X(35) + 4, v.Y(62), "BOLECTION — LAPS FRAME AND FIELD", "PROUD 26");
    s2 += note(v.X(110), v.Y(9), v.X(140) + 8, v.Y(-6), "RAISED FIELD", "");
    s2 += note(v.X(-20), v.Y(9), v.X(-40) - 4, v.Y(-6), "PANEL FRAME", "", "end");
  }

  // 6 — bookcase head: arch, archivolt, keystone, spandrels, light — elevation 1:10
  s2 += heading(18, 170, "6 · BOOKCASE HEAD", "ARCH · KEYSTONE · SPANDRELS · LIGHT · SCALE 1:15", 70);
  {
    const s = 15, top = K.H, bot = BK.shelves[BK.shelves.length - 1] - 60;
    const v = view(30, 180 - (K.H - top) / s, s, "Bookcase head");
    s2 += v.g(`<clipPath id="clipHead"><rect x="-20" y="${ey(top)}" width="${BK.w + 260}" height="${top - bot}"/></clipPath><g clip-path="url(#clipHead)">${bookcase(v.w(0.12))}${pilaster(xP1[0], v.w(0.12))}${entablature(0, BK.w + 240, v.w(0.12))}</g>`, 0.3);
    const cx = BK.w / 2;
    s2 += note(v.X(cx), v.Y(ey(BK.spring + BK.rise + 50)), v.X(BK.w + 260) + 4, v.Y(ey(BK.spring + BK.rise + 120)), "KEYSTONE", "");
    s2 += note(v.X(cx), v.Y(ey(BK.spring + BK.rise - 30)), v.X(BK.w + 260) + 4, v.Y(ey(BK.spring + 60)), "LED DOWN-LIGHT IN ARCH", "WARM WHITE, ON DIMMER");
    s2 += note(v.X(90), v.Y(ey(yEnt - 60)), v.X(-20) - 2, v.Y(ey(yEnt - 60)), "SPANDREL PANEL", "", "end");
    s2 += note(v.X(BK.stile + 20), v.Y(ey(BK.spring + 40)), v.X(-20) - 2, v.Y(ey(BK.spring)), `ARCH RISE ${BK.rise}`, "SEGMENTAL", "end");
  }

  // 7 — counter edge + cupboard door, section 1:2
  s2 += heading(150, 195, "7 · COUNTER EDGE", "SECTION · SCALE 1:2 · SAME REEDS AS THE DESK", 70);
  {
    const s = 2, v = view(175, 215, s, "Counter edge");
    let reeds = ""; for (let i = 0; i < 4; i++) reeds += ` A 4 4 0 0 0 4 ${4 + (i + 1) * 8}`;
    const d = `M 120 0 L 6 0 Q 4 0 4 2 L 4 4${reeds} L 4 38 Q 4 40 6 40 L 120 40`;
    s2 += v.g(`<path d="${d}" fill="url(#hatchSW)"/><path d="M ${B.over + 4} 40 L ${B.over + 4} 110 M ${B.over + 26} 40 L ${B.over + 26} 110" fill="none"/><path d="M 120 -4 L 120 44" stroke-dasharray="4 3" fill="none"/>`, 0.3);
    s2 += chainV([v.Y(0), v.Y(40)], v.X(0) - 5, [40], { from: v.X(0) - 1, size: 1.4 });
    s2 += chainH([v.X(4), v.X(B.over + 4)], v.Y(40) + 30, [B.over], { from: v.Y(40) + 1, size: 1.4 });
    s2 += note(v.X(4), v.Y(20), v.X(-20), v.Y(60), "4 REEDS × 8", "AS DESK TOP", "end");
    s2 += note(v.X(B.over + 15), v.Y(90), v.X(80), v.Y(90), "CUPBOARD DOOR 22", "RAISED PANEL, BRASS DROP HANDLE");
  }

  s2 += heading(270, 195, "NOTES", "DETAILS", 40);
  ["No carving on pilasters or modillions — mouldings only.", "Flute and modillion spacing to be set out on site",
   "   so they finish symmetrically on the wall.", "Mock up profiles 3, 5 and 7 full size before cutting."]
    .forEach((n, i) => { s2 += text(270, 206 + i * 4.3, n, { size: 1.55 }); });
  s2 += titleBlock({ title: "STUDY WALL — DETAILS", sub: "Pilaster · Cornice · Modillion · Panel · Arch · Counter", date: K.date, rev: K.rev, dwg: "AST-DR-006" });

  window.DRAWINGS.studywall = { title: "Study wall — General arrangement · AST-DR-005", svg: sheet(s1), params: WALL };
  window.DRAWINGS["studywall-details"] = { title: "Study wall — Details · AST-DR-006", svg: sheet(s2), params: WALL };
})();
