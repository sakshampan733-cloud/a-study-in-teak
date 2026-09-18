// Study wall — bookcase (left), panelled centre for a painting between two fluted pilasters, window (right).
// AST-DR-005 general arrangement, AST-DR-006 details. Real-world units are mm; y measured UP from the floor.

window.DRAWINGS = window.DRAWINGS || {};

const WALL = {
  rev: "9 — sill datum confirmed at 686",
  date: "19.09.2026",
  W: 4547, H: 2769,            // 14 ft 11 in wall, 9 ft 1 in ceiling (measured on site)
  skirt: 120,                  // skirting line on the cupboard fronts
  base: { h: 646, top: 40, d: 255, over: 25 },   // cupboards under all three bays, 2 ft 3 in (686) to the top of the reeded counter — set by the window sill; 280 (11 in) from the wall
  book: { w: 1489, d: 280, stile: 60, shelves: [890, 1160, 1430, 1700] },   // flat head, no arch
  band: { h: 400, rail: 40 },   // moulded panel band under the cornice — same size over all three bays (ref. 3)
  pil: { w: 240, proj: 40, flutes: 9, capH: 130, d: 280, ped: 25, pedProj: 50 },  // ref. 1 fluted shaft; ref. 3 pedestal steps forward below the counter
  panel: { w: 1400, set: 200, frame: 70, painting: [760, 860], paintingC: 1440 },
  win: { w: 1219, sill: 686, head: 2337, fromRight: 0, arch: 70, wall: 230 },  // measured: 4 ft wide, 5 ft 5 in tall, sill 2 ft 3 in, hard into the right-hand corner
  sconce: { y: 1290, span: 150 },  // twin-arm candle sconce with shade, one on each pilaster (ref. 3)
  ent: { architrave: 60, frieze: 80, mod: 70, dentil: 30, crown: 90, proj: 160, modW: 44, modPitch: 105 },
};

(function () {
  const { INK, THIN, DIM, f, text, view, chainH, chainV, note, labels, heading, frame, titleBlock, sheet } = window.DK;
  const K = WALL, B = K.base, BK = K.book, PL = K.pil, PN = K.panel, WN = K.win, E = K.ent, BD = K.band, SC = K.sconce;

  // ── layout along the wall (x from the left corner) ──
  const xBook = [0, BK.w];
  const xP1 = [BK.w, BK.w + PL.w];
  // The window bay is exactly the window and its architrave, so the right-hand pilaster stands right beside it;
  // the centre panel takes whatever width is left.
  const zoneW = WN.arch + WN.w + WN.fromRight;
  const xZone = [K.W - zoneW, K.W];
  const xP2 = [xZone[0] - PL.w, xZone[0]];
  const xPanel = [xP1[1], xP2[0]];
  const PNW = xPanel[1] - xPanel[0];
  const xWin = [xZone[0] + WN.arch, xZone[0] + WN.arch + WN.w], winC = (xWin[0] + xWin[1]) / 2;
  // ── heights ──
  const yTop = B.h + B.top;                                   // counter top
  const entH = E.architrave + E.frieze + E.mod + E.dentil + E.crown;
  const yEnt = K.H - entH;                                    // underside of the entablature
  const yCap = yEnt - PL.capH;
  const yBand = yEnt - BD.h, yOpen = yBand - BD.rail;   // band panel zone, and the top of the bay openings below it
  const yFr = yEnt + E.architrave, yMod = yFr + E.frieze, yDen = yMod + E.mod, yCrown = yDen + E.dentil;

  // elevation helpers (local mm, SVG y down)
  const ey = (y) => K.H - y;
  const R = (x0, y0, x1, y1, a = "") => `<rect x="${f(Math.min(x0, x1))}" y="${f(ey(Math.max(y0, y1)))}" width="${f(Math.abs(x1 - x0))}" height="${f(Math.abs(y1 - y0))}" ${a}/>`;
  const Ln = (x0, y0, x1, y1, a = "") => `<line x1="${f(x0)}" y1="${f(ey(y0))}" x2="${f(x1)}" y2="${f(ey(y1))}" ${a}/>`;
  const W = (th) => `stroke-width="${th}"`;

  // Pilaster: a panelled pedestal from the floor to the counter that steps forward (ref. 3), a counter cap that
  // wraps it, then the fluted shaft (ref. 1) with a moulded base and plain capital up to the cornice.
  function pilaster(x0, th) {
    const x1 = x0 + PL.w, pe = PL.ped;
    let o = "";
    // pedestal, floor to counter
    o += R(x0 - pe, 0, x1 + pe, B.h) + R(x0 - pe - 12, 0, x1 + pe + 12, 90) + `<g ${W(th)}>${Ln(x0 - pe - 12, 70, x1 + pe + 12, 70)}${Ln(x0 - pe, 100, x1 + pe, 100)}</g>`;
    o += `<g ${W(th)}>${R(x0 - pe + 30, 140, x1 + pe - 30, B.h - 40)}${R(x0 - pe + 42, 152, x1 + pe - 42, B.h - 52)}${R(x0 - pe + 62, 172, x1 + pe - 62, B.h - 72)}</g>`;
    // counter cap wrapping the pedestal
    o += R(x0 - pe - 15, B.h, x1 + pe + 15, yTop) + `<g ${W(th)}>${Ln(x0 - pe - 15, B.h + 10, x1 + pe + 15, B.h + 10)}${Ln(x0 - pe - 15, B.h + 20, x1 + pe + 15, B.h + 20)}${Ln(x0 - pe - 15, B.h + 30, x1 + pe + 15, B.h + 30)}</g>`;
    // shaft with moulded base on the counter
    o += R(x0, yTop, x1, yEnt) + R(x0 - 10, yTop, x1 + 10, yTop + 45) + `<g ${W(th)}>${Ln(x0 - 10, yTop + 25, x1 + 10, yTop + 25)}${Ln(x0 - 4, yTop + 58, x1 + 4, yTop + 58)}</g>`;
    const n = PL.flutes, pitch = (PL.w - 30) / n, fw = pitch * 0.7, f0 = yTop + 105, f1 = yCap - 40;
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

  // Twin-arm candle sconce with fabric shades, centred on a pilaster (ref. 3).
  function sconce(cx, th) {
    const y = SC.y, sp = SC.span;
    let o = `<ellipse cx="${f(cx)}" cy="${f(ey(y))}" rx="28" ry="60" fill="#fff"/><ellipse cx="${f(cx)}" cy="${f(ey(y))}" rx="18" ry="44" ${W(th)}/><circle cx="${f(cx)}" cy="${f(ey(y))}" r="9" fill="#fff"/>`;
    [-1, 1].forEach((m) => {
      const ax = cx + m * sp;
      o += `<path fill="none" d="M ${f(cx + m * 12)} ${f(ey(y - 10))} C ${f(cx + m * 70)} ${f(ey(y - 80))} ${f(ax - m * 10)} ${f(ey(y - 50))} ${f(ax)} ${f(ey(y + 20))}"/>`;
      o += `<path fill="none" ${W(th)} d="M ${f(cx + m * 12)} ${f(ey(y - 20))} C ${f(cx + m * 60)} ${f(ey(y - 72))} ${f(ax - m * 16)} ${f(ey(y - 44))} ${f(ax - m * 4)} ${f(ey(y + 14))}"/>`;
      o += `<path d="M ${f(ax - 26)} ${f(ey(y + 20))} Q ${f(ax)} ${f(ey(y + 2))} ${f(ax + 26)} ${f(ey(y + 20))} L ${f(ax + 18)} ${f(ey(y + 36))} L ${f(ax - 18)} ${f(ey(y + 36))} Z" fill="#fff"/>`;
      o += R(ax - 8, y + 36, ax + 8, y + 90, 'fill="#fff"');
      o += `<path d="M ${f(ax - 60)} ${f(ey(y + 90))} L ${f(ax + 60)} ${f(ey(y + 90))} L ${f(ax + 36)} ${f(ey(y + 190))} L ${f(ax - 36)} ${f(ey(y + 190))} Z" fill="#fff"/>`;
      o += `<g ${W(th)}>${[-40, -20, 0, 20, 40].map((d) => `<line x1="${f(ax + d)}" y1="${f(ey(y + 92))}" x2="${f(ax + d * 0.6)}" y2="${f(ey(y + 188))}"/>`).join("")}</g>`;
    });
    return o;
  }

  // Moulded panel in the band under the cornice — identical in every bay.
  function bandPanel(a, b, th) {
    const x0 = a + 60, x1 = b - 60, y0 = yBand + 45, y1 = yEnt - 45;
    let o = R(a, yOpen, b, yBand, W(th)) + R(x0, y0, x1, y1) + `<g ${W(th)}>${R(x0 + 18, y0 + 18, x1 - 18, y1 - 18)}${R(x0 + 32, y0 + 32, x1 - 32, y1 - 32)}</g>` + R(x0 + 45, y0 + 45, x1 - 45, y1 - 45);
    [[x0, y0, x0 + 45, y0 + 45], [x1, y0, x1 - 45, y0 + 45], [x0, y1, x0 + 45, y1 - 45], [x1, y1, x1 - 45, y1 - 45]].forEach(([p, q, r2, s2]) => { o += Ln(p, q, r2, s2, W(th)); });
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

  // Bookcase bay: open shelves with a flat head rail, the moulded band panel above.
  function bookcase(th) {
    const [x0, x1] = xBook, s = BK.stile, xi0 = x0 + s, xi1 = x1 - s;
    let o = R(x0, yTop, x1, yEnt);
    o += `<g ${W(th)}>${R(xi0, yTop, xi1, yOpen)}${Ln(xi0 - 15, yOpen, xi1 + 15, yOpen)}</g>`;
    BK.shelves.forEach((y) => { o += R(xi0, y - 25, xi1, y, W(th)) + Ln(xi0, y - 12, xi1, y - 12, `${W(th)} opacity=".5"`); });
    [yTop, ...BK.shelves].forEach((y, i) => {
      let x = xi0 + 20; const top = (BK.shelves[i] ?? yOpen) - 25 - 30;
      while (x < xi1 - 40) { const bw = 22 + ((x * 7) % 18), bh = top - y - ((x * 13) % 60); o += R(x, y, x + bw, y + bh, `${W(th)} opacity=".35"`); x += bw + 2; }
    });
    // strip light under the head rail
    o += R(xi0 + 40, yOpen - 18, xi1 - 40, yOpen - 8, W(th));
    return o + bandPanel(x0, x1, th);
  }

  function centrePanel(th) {
    const [x0, x1] = xPanel, fr = PN.frame, ins = 70;
    const a0 = x0 + ins, a1 = x1 - ins, b0 = yTop + 90, b1 = yOpen - 60;
    let o = R(x0, yTop, x1, yEnt, W(th)) + bandPanel(x0, x1, th);
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
    const [z0, z1] = xZone, [w0, w1] = xWin, ar = WN.arch, arR = Math.min(ar, WN.fromRight);   // tight to the corner: only a slim return on the right
    let o = R(z0, yTop, z1, yEnt, W(th));
    // architrave round the opening
    o += R(w0 - ar, WN.sill, w1 + arR, WN.head + ar) + `<g ${W(th)}>${R(w0 - ar + 20, WN.sill, w1 + Math.max(arR - 20, 0), WN.head + ar - 20)}${R(w0 - ar + 40, WN.sill, w1 + Math.max(arR - 40, 0), WN.head + ar - 40)}</g>`;
    // opening, pair of casements with glazing bars
    o += R(w0, WN.sill, w1, WN.head);
    const mid = (w0 + w1) / 2;
    [[w0 + 20, mid - 5], [mid + 5, w1 - 20]].forEach(([a, b]) => {
      o += R(a, WN.sill + 20, b, WN.head - 20, W(th));
      for (let k = 1; k < 3; k++) o += Ln(a, WN.sill + 20 + ((WN.head - WN.sill - 40) * k) / 3, b, WN.sill + 20 + ((WN.head - WN.sill - 40) * k) / 3, W(th));
      o += Ln((a + b) / 2, WN.sill + 20, (a + b) / 2, WN.head - 20, W(th));
    });
    // the same moulded band panel over the window as over the other bays
    if (WN.head + ar <= yOpen) o += bandPanel(z0, z1, th);
    else {
      // window reaches the band: its architrave runs up to the cornice, the band panel continues only beside it
      o += R(w0 - ar, WN.head + ar, w1 + arR, yEnt, W(th)) + Ln(w0 - ar, yEnt - 20, w1 + arR, yEnt - 20, W(th));
      if (w0 - ar - z0 > 200) o += bandPanel(z0, w0 - ar, th);
    }
    // side panels
    [[z0 + 30, w0 - ar - 25], [w1 + arR + 25, z1 - 30]].forEach(([a, b]) => { if (b - a > 40) o += `<g ${W(th)}>${R(a, yTop + 60, b, yOpen - 30)}${R(a + 18, yTop + 78, b - 18, yOpen - 48)}</g>`; });
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
      sconce((xP1[0] + xP1[1]) / 2, th) + sconce((xP2[0] + xP2[1]) / 2, th) +
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
      o += `<rect x="${a - PL.ped - 15}" y="0" width="${PL.w + 2 * PL.ped + 30}" height="${B.d + B.over + PL.pedProj}" stroke-dasharray="${dash}" stroke-width="${th}"/>`;
      let d = `M ${a} ${PL.d} L ${a} ${PL.d + PL.proj - 15} `; const n = PL.flutes, pitch = (PL.w - 30) / n, fw = pitch * 0.7;
      d = `M ${a} ${PL.d} L ${a} ${PL.d + PL.proj} L ${a + 15} ${PL.d + PL.proj} `;
      for (let i = 0; i < n; i++) { const xc = a + 15 + pitch * (i + 0.5); d += `L ${f(xc - fw / 2)} ${PL.d + PL.proj} A ${f(fw / 2)} ${f(fw / 2)} 0 0 0 ${f(xc + fw / 2)} ${PL.d + PL.proj} `; }
      d += `L ${b} ${PL.d + PL.proj} L ${b} ${PL.d}`;
      o += `<path d="${d}" fill="#fff"/>`;
    });
    // centre panelling set forward of the wall on battens
    o += `<rect x="${xPanel[0]}" y="0" width="${PNW}" height="${PN.set}" stroke-width="${th}"/><line x1="${xPanel[0]}" y1="${PN.set}" x2="${xPanel[1]}" y2="${PN.set}"/>`;
    o += `<rect x="${xPanel[0] + 70}" y="${PN.set}" width="${PNW - 140}" height="35" stroke-width="${th}"/>`;
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
    o += `<g stroke-width="${th}"><rect x="${B.d - 22}" y="${ey(B.h - 20)}" width="22" height="${B.h - 20 - K.skirt}"/><line x1="18" y1="${ey(B.h / 2)}" x2="${B.d - 22}" y2="${ey(B.h / 2)}"/><rect x="0" y="${ey(K.skirt)}" width="${B.d - 20}" height="${K.skirt}"/></g>`;
    // upper case: back, shelves, arch soffit
    o += `<rect x="0" y="${ey(yEnt)}" width="${BK.d}" height="${yEnt - yTop}"/><rect x="0" y="${ey(yEnt)}" width="18" height="${yEnt - yTop}" ${hatch}/>`;
    BK.shelves.forEach((y) => { o += `<rect x="18" y="${ey(y)}" width="${BK.d - 18}" height="25" ${hatch}/>`; });
    o += `<rect x="18" y="${ey(yBand)}" width="${BK.d - 18}" height="${BD.rail}" fill="url(#hatchWall2)"/><rect x="${BK.d - 22}" y="${ey(yEnt)}" width="22" height="${BD.h}" fill="url(#hatchWall2)"/><rect x="${BK.d}" y="${ey(yEnt - 45)}" width="14" height="${BD.h - 90}" stroke-width="${th}"/>`;
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
  const vE = view(62, 34, sc, "Wall elevation"), tE = vE.w(0.1);
  s1 += heading(18, 17, "ELEVATION — STUDY WALL", `SCALE 1:${sc} · BOOKCASE · PANEL FOR PAINTING · WINDOW`, 90);
  s1 += vE.g(elevation(tE), 0.28);
  const yb = vE.Y(ey(0));
  s1 += chainH([0, xBook[1], xP1[1], xPanel[1], xP2[1], K.W].map(vE.X), yb + 6, [BK.w, PL.w, PNW, PL.w, xZone[1] - xZone[0]], { from: yb + 1, size: 1.5 });
  s1 += chainH([vE.X(0), vE.X(K.W)], yb + 12, [`${K.W} WALL (14 FT 11 IN)`], { from: yb + 1 });
  s1 += chainV([K.H, yEnt, yCap, yTop, B.h, 0].map((y) => vE.Y(ey(y))), vE.X(K.W) + 8, [entH, PL.capH, yCap - yTop, B.top, B.h], { from: vE.X(K.W) + 1, size: 1.4 });
  s1 += chainV([vE.Y(ey(K.H)), vE.Y(ey(0))], vE.X(K.W) + 15, [`${K.H} CEILING (9 FT)`], { from: vE.X(K.W) + 1 });
  s1 += chainV([vE.Y(ey(WN.head)), vE.Y(ey(WN.sill))], vE.X(xWin[1]) + 6, [WN.head - WN.sill], { from: vE.X(xWin[1]) + 1, size: 1.4 });
  // labels
  const EL = labels(58, "left", 22, 152), ER = labels(vE.X(K.W) + 18, "right", 22, 152);
  ER.add(vE.X(xP2[1] + 15), vE.Y(ey(yCap + 70)), "MOULDED CAPITAL", "NO CARVING — REF. 1");
  ER.add(vE.X(xPanel[0] + 400), vE.Y(ey((yMod + yDen) / 2)), "MODILLION BLOCKS + DENTILS", "REF. 2 — NO LEAF CARVING");
  ER.add(vE.X(xP2[0] + 60), vE.Y(ey(1500)), "FLUTED PILASTER ×2", "ON A PANELLED PEDESTAL — REF. 1");
  ER.add(vE.X((xPanel[0] + xPanel[1]) / 2 + 400), vE.Y(ey(1150)), "MOULDED PANEL", "PAINTING OPTIONAL — REF. 1");
  ER.add(vE.X(xP2[1] + PL.ped), vE.Y(ey(450)), "PEDESTAL STEPS FORWARD", "COUNTER WRAPS IT — REF. 3");
  EL.add(vE.X(BK.w / 2), vE.Y(ey((yBand + yEnt) / 2)), "BAND PANELS", "SAME SIZE WHERE THEY FIT");
  EL.add(vE.X(BK.w / 2), vE.Y(ey(yOpen - 13)), "FLAT HEAD, NO ARCH", "STRIP LIGHT UNDER RAIL");
  EL.add(vE.X((xP1[0] + xP1[1]) / 2 - SC.span), vE.Y(ey(SC.y + 150)), "TWIN SCONCE ×2", "ON THE PILASTERS — REF. 3");
  EL.add(vE.X(BK.w / 2), vE.Y(ey(yTop - 10)), "REEDED TOP", "MATCHES THE DESK");
  EL.add(vE.X(260), vE.Y(ey(300)), "CUPBOARDS, ALL 3 BAYS", "TOP LEVEL WITH THE WINDOW SILL");
  s1 += EL.draw() + ER.draw();

  // Plan
  const scP = 25, vP = view(62, 196, scP, "Wall plan"), tP = vP.w(0.1);
  s1 += heading(18, 180, "PLAN", `CUT AT 1200 · SCALE 1:${scP} · ROOM BELOW, WALL ABOVE`, 60);
  s1 += vP.g(plan(tP, `${vP.w(1)} ${vP.w(0.7)}`), 0.28);
  s1 += chainV([vP.Y(0), vP.Y(BK.d), vP.Y(B.d + B.over + PL.pedProj)], vP.X(-150) - 4, [`${BK.d} (11 IN)`, PL.pedProj], { from: vP.X(0) - 1, size: 1.3 });
  s1 += note(vP.X(xWin[0] + 100), vP.Y(-WN.wall / 2), vP.X(xWin[0] + 100) + 4, vP.Y(-WN.wall) - 5, "WINDOW 1219 (4 FT) WIDE", "HARD INTO THE CORNER — NO RETURN ON THE RIGHT");

  // Section
  const scS = 25, vS = view(345, 34, scS, "Section through bookcase"), tS = vS.w(0.1);
  s1 += heading(318, 17, "SECTION A–A", `THROUGH BOOKCASE · 1:${scS}`, 50);
  s1 += vS.g(section(tS), 0.28);
  const SL = labels(vS.X(BK.d + 190) + 10, "right", 22, 150);
  SL.add(vS.X(BK.d + 150), vS.Y(ey(yCrown + 30)), "CROWN", "");
  SL.add(vS.X(BK.d + 65), vS.Y(ey(yMod + 40)), "MODILLION", "");
  SL.add(vS.X(B.d + 10), vS.Y(ey(yTop - 20)), "COUNTER", `${B.d} DEEP + ${B.over}`);
  s1 += SL.draw();
  s1 += chainH([vS.X(0), vS.X(BK.d), vS.X(B.d + B.over)], vS.Y(ey(0)) + 6, [BK.d, B.d + B.over - BK.d], { from: vS.Y(ey(0)) + 1, size: 1.3 });

  // Notes
  s1 += heading(318, 166, "NOTES", `REVISION ${K.rev.split(" ")[0]}`, 40);
  ["Wall 14 ft 11 in, ceiling 9 ft 1 in (measured).", "Centre panel set equal to the window bay so the two", "   pilasters frame a matched pair; the bookcase takes", "   the remainder as the anchor at the end of the wall.", "Window measured: 4 ft wide, 5 ft 5 in tall, hard into", "   the right corner. Sill 2 ft 3 in (686) — CONFIRMED.", "OPEN: sill 2 ft 3 + height 5 ft 5 + your 1 ft 3 to the", "   ceiling makes 8 ft 11, two inches short of the 9 ft 1", "   ceiling. Sill and height are drawn as measured, so the", "   head falls 1 ft 5 down, not 1 ft 3. Laser it.", "Counter top is set to the sill at 686, so the two are", "   one surface; this datum runs on round to the right", "   wall rail.", "Cupboards under all three bays. Gold on handles only."]
    .forEach((n, i) => { s1 += text(318, 177 + i * 4.1, n, { size: 1.55 }); });
  s1 += titleBlock({ title: "STUDY WALL — GENERAL ARRANGEMENT", sub: "Elevation · Plan · Section", date: K.date, rev: K.rev, dwg: "AST-DR-005" });

  // ═════════════ SHEET 2 — DETAILS ═════════════
  window.DK.begin("studywall-details");
  let s2 = frame();
  s2 += `<defs><pattern id="hatchSW" patternUnits="userSpaceOnUse" width="3" height="3" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="3" stroke="#999" stroke-width="0.25"/></pattern></defs>`;

  // 1 — pilaster capital + base, elevation 1:5 with break
  s2 += heading(18, 17, "1 · PILASTER", "CAPITAL AND BASE · ELEVATION · SCALE 1:5 · REF. 1", 70);
  {
    const s = 5, keep = 300, lo = B.h - 90, hi = yTop + 250;
    const vC = view(55, 32 - (K.H - yEnt) / s, s, "Pilaster capital");
    s2 += vC.g(`<clipPath id="clipCap"><rect x="-60" y="${ey(yEnt)}" width="${PL.w + 120}" height="${keep}"/></clipPath><g clip-path="url(#clipCap)">${pilaster(0, vC.w(0.12))}</g>`, 0.3);
    const gap = 8, top2 = 32 + keep / s + gap;
    const vB = view(55, top2 - (K.H - hi) / s, s, "Pilaster base and pedestal");
    s2 += vB.g(`<clipPath id="clipBase"><rect x="-80" y="${ey(hi)}" width="${PL.w + 160}" height="${hi - lo}"/></clipPath><g clip-path="url(#clipBase)">${pilaster(0, vB.w(0.12))}</g>`, 0.3);
    const brk = 32 + keep / s + gap / 2;
    s2 += `<path d="M 36 ${brk} L 70 ${brk} L 74 ${brk - 3} L 80 ${brk + 3} L 84 ${brk} L 118 ${brk}" stroke="${INK}" stroke-width="0.2" fill="none"/>`;
    s2 += chainH([vC.X(-22), vC.X(0), vC.X(PL.w), vC.X(PL.w + 22)], 29, [22, PL.w, 22], { from: 31, size: 1.4 });
    s2 += note(vC.X(PL.w + 22), vC.Y(ey(yCap + 108)), 128, 38, "ABACUS", "");
    s2 += note(vC.X(PL.w + 10), vC.Y(ey(yCap + 75)), 128, 46, "OVOLO", "");
    s2 += note(vC.X(PL.w), vC.Y(ey(yCap + 35)), 128, 54, "NECK", "");
    s2 += note(vC.X(PL.w + 4), vC.Y(ey(yCap + 9)), 128, 62, "ASTRAGAL", "");
    s2 += note(vC.X(PL.w / 2), vC.Y(ey(yCap - 120)), 128, 74, `${PL.flutes} STOPPED FLUTES`, "ROUNDED ENDS");
    s2 += note(vB.X(PL.w + 10), vB.Y(ey(yTop + 25)), 128, vB.Y(ey(yTop + 90)), "MOULDED BASE", "ON THE COUNTER");
    s2 += note(vB.X(PL.w + PL.ped + 15), vB.Y(ey(B.h + 20)), 128, vB.Y(ey(B.h + 20)), "COUNTER CAP", "WRAPS THE PEDESTAL");
    s2 += note(vB.X(PL.w + PL.ped), vB.Y(ey(B.h - 60)), 128, vB.Y(ey(B.h - 70)), `PEDESTAL, ${PL.pedProj} FORWARD`, `${PL.ped} WIDER EACH SIDE`);
    s2 += chainH([vB.X(-PL.ped), vB.X(0), vB.X(PL.w), vB.X(PL.w + PL.ped)], vB.Y(ey(lo)) + 4, [PL.ped, PL.w, PL.ped], { from: vB.Y(ey(lo)) + 1, size: 1.3 });
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

  // 6 — band panel, pilaster head and sconce, elevation 1:20
  s2 += heading(18, 205, "6 · BAND PANEL + SCONCE", "ELEVATION · SCALE 1:25 · SAME PANEL OVER EVERY BAY", 80);
  {
    const s = 25, lo = SC.y - 120, x0 = BK.w - 700, x1 = xP1[1] + 700;
    const v = view(28 - x0 / s, 214 - (K.H - K.H) / s, s, "Band panel and sconce");
    s2 += v.g(`<clipPath id="clipBand"><rect x="${x0}" y="${ey(K.H)}" width="${x1 - x0}" height="${K.H - lo}"/></clipPath><g clip-path="url(#clipBand)">${bookcase(v.w(0.12))}${centrePanel(v.w(0.12))}${pilaster(xP1[0], v.w(0.12))}${entablature(0, K.W, v.w(0.12))}${sconce((xP1[0] + xP1[1]) / 2, v.w(0.12))}</g>`, 0.3);
    s2 += chainV([v.Y(ey(yEnt)), v.Y(ey(yBand)), v.Y(ey(yOpen))], v.X(x1) + 5, [BD.h, BD.rail], { from: v.X(x1) + 1, size: 1.3 });
    s2 += note(v.X(BK.w - 300), v.Y(ey((yBand + yEnt) / 2)), v.X(x1) + 12, v.Y(ey(yEnt - 60)), "BAND PANEL", `${BD.h} HIGH, EVERY BAY`);
    s2 += note(v.X((xP1[0] + xP1[1]) / 2 + SC.span), v.Y(ey(SC.y + 140)), v.X(x1) + 12, v.Y(ey(SC.y + 120)), "TWIN SCONCE", "BRASS, FABRIC SHADES");
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
  s2 += titleBlock({ title: "STUDY WALL — DETAILS", sub: "Pilaster · Cornice · Modillion · Panel · Band · Counter", date: K.date, rev: K.rev, dwg: "AST-DR-006" });

  window.DRAWINGS.studywall = { title: "Study wall — General arrangement · AST-DR-005", svg: sheet(s1), params: WALL };
  window.DRAWINGS["studywall-details"] = { title: "Study wall — Details · AST-DR-006", svg: sheet(s2), params: WALL };
})();
