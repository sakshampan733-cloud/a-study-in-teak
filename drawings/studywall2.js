// Study wall, second scheme (owner, 7 Oct 2026) — the detailed set, plain line, no colour.
// AST-DR-040 general arrangement WITH the arches, AST-DR-041 the same wall WITHOUT them (the earlier scheme).
// Both carry the approved counter shelf: the centre panel goes back to the wall plane, so the counter is a real
// 9 in shelf and the two fluted pilasters stand nearly 11 in proud. The crown is the smaller dentil cornice from the
// owner's photo; the frame round the painting carries a row of small beads (owner's photo); the wall lamps are the
// brass twin-arm sconce from the owner's photo; the window has the approved red velvet over a white linen sheer.
// With the arches: a segmental arch over the bookcase (books under it, as the owner's arched-bookcase photo) and the
// same arch in the window head — wood only, the glass unchanged behind; three deep rectangular niches cut into the
// underside of each arch (seen looking up); spandrel mouldings curved to the arch, the bookcase's right one a hinged flap.
// Real units mm. Elevation: x along the wall from the left corner, y UP from the floor. Plan: y = depth into the room.

window.DRAWINGS = window.DRAWINGS || {};

const SW2 = {
  rev: "1 — owner's second scheme: arches, counter shelf pushed back",
  date: "07.10.2026",
  W: 4547, H: 2769,                          // 14 ft 11 in wall, 9 ft 1 in ceiling (measured)
  base: { h: 646, top: 40, d: 255, over: 25, plinth: 100, door: 22 },   // cupboards; counter 686 = window sill
  book: { w: 1489, d: 280, stile: 60, shelves: [890, 1160, 1430, 1700], st: 25, back: 18 },
  pil: { w: 240, proj: 40, flutes: 9, capH: 120, d: 280, ped: 25, pedProj: 50 },
  // the centre: panel 25 off the wall (approved), a slim 3-step frame 25 proud with a bead row, plain skirting
  centre: { back: 25, skirt: 120, skirtT: 20, frameW: 70, frameP: 25, inset: 80, bead: 8, beadPitch: 14,
            painting: [860, 640], gilt: 50, band: 360, rail: 40 },
  win: { w: 1219, sill: 686, head: 2337, arch: 70, wall: 230, set: 200, glass: -115, frameD: 70 },
  // the smaller crown (owner's photo): stepped architrave, plain frieze, bed mould, fine dentils, cove, cyma, fillet
  ent: { arch: 40, frieze: 120, bed: 25, dentil: 22, cove: 35, crown: 50, fillet: 15, proj: 120, dW: 12, dPitch: 20 },
  bkArch: { spring: 1999, rise: 320, mould: 46 },   // archivolt 46 so it lands on the bookcase's outer edge
  winArch: { rise: 300, mould: 56 },                // springs 1 ft below the head; archivolt lands on the architrave
  niche: { n: 3, len: 380, wid: 180, depth: 90 },   // three deep rectangular niches in each soffit — no lights
  lamp: { y: 1290, span: 160 },
  curtain: { rod: 2440, sheer: 2030, tie: 1250 },
};

(function () {
  const { INK, THIN, f, text, view, chainH, chainV, note, labels, heading, frame, titleBlock, sheet } = window.DK;
  const K = SW2, B = K.base, BK = K.book, PL = K.pil, C = K.centre, WN = K.win, E = K.ent, N = K.niche;

  // ── along the wall ──
  const xBook = [0, BK.w], xP1 = [BK.w, BK.w + PL.w];
  const zoneW = WN.arch + WN.w, xZone = [K.W - zoneW, K.W], xP2 = [xZone[0] - PL.w, xZone[0]];
  const xPanel = [xP1[1], xP2[0]], PNW = xPanel[1] - xPanel[0];
  const xWin = [xZone[0] + WN.arch, K.W], winC = (xWin[0] + xWin[1]) / 2;
  // ── heights ──
  const yTop = B.h + B.top;
  const entH = E.arch + E.frieze + E.bed + E.dentil + E.cove + E.crown + E.fillet;
  const yEnt = K.H - entH, yFr = yEnt + E.arch, yBed = yFr + E.frieze, yDen = yBed + E.bed, yCove = yDen + E.dentil, yCrn = yCove + E.cove;
  const yCap = yEnt - PL.capH;
  const yBand = yEnt - C.band, yOpen = yBand - C.rail;
  // centre frame and painting
  const fa0 = xPanel[0] + C.inset, fa1 = xPanel[1] - C.inset, fb0 = yTop + C.skirt + 60, fb1 = yOpen - 60;
  const pcx = (xPanel[0] + xPanel[1]) / 2, pcy = (fb0 + fb1) / 2, [pw, ph] = C.painting;

  const ey = (y) => K.H - y;
  const R = (x0, y0, x1, y1, a = "") => `<rect x="${f(Math.min(x0, x1))}" y="${f(ey(Math.max(y0, y1)))}" width="${f(Math.abs(x1 - x0))}" height="${f(Math.abs(y1 - y0))}" ${a}/>`;
  const Ln = (x0, y0, x1, y1, a = "") => `<line x1="${f(x0)}" y1="${f(ey(y0))}" x2="${f(x1)}" y2="${f(ey(y1))}" ${a}/>`;
  const W = (th) => `stroke-width="${f(th)}"`;
  const P = (pts, a = "", close = false) => `<path d="M ${pts.map(([x, y]) => `${f(x)} ${f(ey(y))}`).join(" L ")}${close ? " Z" : ""}" ${a}/>`;

  // ── arches: a segmental arch on the chord [xa, xb] springing at ys with the given rise ──
  function arch(xa, xb, ys, rise) {
    const c = xb - xa, Rr = (c * c / 4 + rise * rise) / (2 * rise), cx = (xa + xb) / 2, cy = ys + rise - Rr;
    return { xa, xb, ys, rise, R: Rr, cx, cy, th: Math.asin(c / 2 / Rr) };
  }
  const apt = (g, r, a) => [g.cx + r * Math.sin(a), g.cy + r * Math.cos(a)];
  const arcPts = (g, r, a0, a1, n = 60) => Array.from({ length: n + 1 }, (_, i) => apt(g, r, a0 + ((a1 - a0) * i) / n));
  // the angle at which a circle of radius r about the arch centre meets the horizontal y
  const angAt = (g, r, y) => Math.acos(Math.max(-1, Math.min(1, (y - g.cy) / r)));
  const gB = arch(BK.stile, BK.w - BK.stile, K.bkArch.spring, K.bkArch.rise);
  const gW = arch(xWin[0], xWin[1], WN.head - K.winArch.rise, K.winArch.rise);
  // the three niches along each soffit, as arc positions (length from the left springing)
  function niches(g) {
    const L = 2 * g.th * g.R, gap = (L - N.n * N.len) / (N.n + 1);
    return Array.from({ length: N.n }, (_, i) => { const s0 = gap + i * (N.len + gap); return [-g.th + s0 / g.R, -g.th + (s0 + N.len) / g.R]; });
  }
  // a spandrel panel moulding (owner, 7 Oct: the triangle's long side curved to melt into the arch): a straight edge
  // down the jamb, a straight edge under the cornice, and a curved edge running parallel to the archivolt, `gap` off it.
  // k steps the outline inwards for the moulding's inner lines. Returns the outline, corner first.
  function spandrel(g, ro, xc, yt, dx, inset = 25, gap = 30, k = 0) {
    const x0 = xc + dx * (inset + k), y0 = yt - inset - k, rr = ro + gap + k;
    const yb = Math.max(g.ys + 30, g.cy + Math.sqrt(Math.max(0, rr * rr - (x0 - g.cx) ** 2)));   // where the jamb edge meets the curve
    // the curve runs on until the panel is 60 deep under the cornice, then a short square end — no long thin tail
    const yTip = y0 - 60 + k, xt = g.cx - dx * Math.sqrt(Math.max(0, rr * rr - (yTip - g.cy) ** 2));
    const aB = Math.atan2(x0 - g.cx, yb - g.cy), aC = Math.atan2(xt - g.cx, yTip - g.cy);
    const arcP = Array.from({ length: 33 }, (_, i) => apt(g, rr, aB + ((aC - aB) * i) / 32));
    return [[x0, y0], [x0, yb], ...arcP, [xt, y0]];
  }
  const spandrelPath = (g, ro, xc, yt, dx, th, inset = 25, gap = 30) =>
    P(spandrel(g, ro, xc, yt, dx, inset, gap, 0), `fill="#fff" ${W(th * 1.3)}`, true) +
    P(spandrel(g, ro, xc, yt, dx, inset, gap, 14), W(th * 0.8), true) + P(spandrel(g, ro, xc, yt, dx, inset, gap, 28), W(th * 0.6), true);

  // ── pilaster (fluted shaft on a panelled pedestal; the counter wraps the pedestal) ──
  function pilaster(x0, th) {
    const x1 = x0 + PL.w, pe = PL.ped;
    let o = R(x0 - pe, 0, x1 + pe, B.h, 'fill="#fff"') + R(x0 - pe - 12, 0, x1 + pe + 12, 90, 'fill="#fff"') + `<g ${W(th)}>${Ln(x0 - pe - 12, 70, x1 + pe + 12, 70)}${Ln(x0 - pe, 100, x1 + pe, 100)}</g>`;
    o += `<g ${W(th)}>${R(x0 - pe + 30, 140, x1 + pe - 30, B.h - 40)}${R(x0 - pe + 42, 152, x1 + pe - 42, B.h - 52)}${R(x0 - pe + 62, 172, x1 + pe - 62, B.h - 72)}</g>`;
    o += R(x0 - pe - 15, B.h, x1 + pe + 15, yTop, 'fill="#fff"') + `<g ${W(th)}>${[10, 20, 30].map((d) => Ln(x0 - pe - 15, B.h + d, x1 + pe + 15, B.h + d)).join("")}</g>`;
    o += R(x0, yTop, x1, yEnt, 'fill="#fff"') + R(x0 - 10, yTop, x1 + 10, yTop + 45, 'fill="#fff"') + `<g ${W(th)}>${Ln(x0 - 10, yTop + 25, x1 + 10, yTop + 25)}${Ln(x0 - 4, yTop + 58, x1 + 4, yTop + 58)}</g>`;
    const n = PL.flutes, pitch = (PL.w - 30) / n, fw = pitch * 0.7, f0 = yTop + 105, f1 = yCap - 40;
    for (let i = 0; i < n; i++) { const xc = x0 + 15 + pitch * (i + 0.5); o += `<rect ${W(th)} x="${f(xc - fw / 2)}" y="${f(ey(f1))}" width="${f(fw)}" height="${f(f1 - f0)}" rx="${f(fw / 2)}"/>`; }
    o += R(x0 - 4, yCap, x1 + 4, yCap + 18, 'fill="#fff"') + `<g ${W(th)}>${Ln(x0 - 4, yCap + 9, x1 + 4, yCap + 9)}</g>`;
    o += `<path d="M ${f(x0)} ${f(ey(yCap + 50))} C ${f(x0 - 2)} ${f(ey(yCap + 64))} ${f(x0 - 12)} ${f(ey(yCap + 72))} ${f(x0 - 12)} ${f(ey(yCap + 80))} L ${f(x1 + 12)} ${f(ey(yCap + 80))} C ${f(x1 + 12)} ${f(ey(yCap + 72))} ${f(x1 + 2)} ${f(ey(yCap + 64))} ${f(x1)} ${f(ey(yCap + 50))}" fill="#fff"/>`;
    o += `<g ${W(th)}>${Ln(x0, yCap + 50, x1, yCap + 50)}${Ln(x0 - 6, yCap + 66, x1 + 6, yCap + 66)}</g>`;
    o += R(x0 - 22, yCap + 80, x1 + 22, yEnt, 'fill="#fff"') + `<g ${W(th)}>${Ln(x0 - 22, yCap + 94, x1 + 22, yCap + 94)}</g>`;
    return o;
  }

  // ── the wall lamp (owner's photo): octagonal brass backplate, two scrolled arms, ceramic collars, small shades ──
  function lamp(cx, th) {
    const y = K.lamp.y, sp = K.lamp.span;
    let o = `<path d="M ${f(cx - 22)} ${f(ey(y + 70))} L ${f(cx + 22)} ${f(ey(y + 70))} L ${f(cx + 34)} ${f(ey(y + 50))} L ${f(cx + 34)} ${f(ey(y - 50))} L ${f(cx + 22)} ${f(ey(y - 70))} L ${f(cx - 22)} ${f(ey(y - 70))} L ${f(cx - 34)} ${f(ey(y - 50))} L ${f(cx - 34)} ${f(ey(y + 50))} Z" fill="#fff"/>`;
    o += `<path d="M ${f(cx - 22)} ${f(ey(y + 54))} L ${f(cx + 22)} ${f(ey(y + 54))} L ${f(cx + 24)} ${f(ey(y - 54))} L ${f(cx - 24)} ${f(ey(y - 54))} Z" fill="none" ${W(th * 0.7)}/><circle cx="${f(cx)}" cy="${f(ey(y))}" r="12" fill="#fff"/>`;
    [-1, 1].forEach((m) => {
      const ax = cx + m * sp;
      // the arm: out and down in an S, up to the cup; a little scroll curling back at its foot
      o += `<path fill="none" d="M ${f(cx + m * 12)} ${f(ey(y))} C ${f(cx + m * 60)} ${f(ey(y - 10))} ${f(cx + m * 80)} ${f(ey(y - 90))} ${f(cx + m * 110)} ${f(ey(y - 80))} C ${f(ax - m * 10)} ${f(ey(y - 70))} ${f(ax)} ${f(ey(y - 30))} ${f(ax)} ${f(ey(y + 40))}"/>`;
      o += `<path fill="none" ${W(th * 0.8)} d="M ${f(cx + m * 70)} ${f(ey(y - 40))} C ${f(cx + m * 90)} ${f(ey(y + 20))} ${f(cx + m * 70)} ${f(ey(y + 70))} ${f(cx + m * 50)} ${f(ey(y + 90))} c ${f(-m * 14)} ${f(-8)} ${f(-m * 4)} ${f(-24)} ${f(m * 8)} ${f(-14)}"/>`;
      o += `<circle cx="${f(cx + m * 75)}" cy="${f(ey(y + 95))}" r="9" fill="#fff" ${W(th * 0.7)}/>`;      // the small flower on the stem
      o += `<ellipse cx="${f(ax)}" cy="${f(ey(y + 62))}" rx="30" ry="20" fill="#fff"/>`;                     // ceramic collar
      o += R(ax - 22, y + 82, ax + 22, y + 96, 'fill="#fff"');                                               // cup
      o += `<path d="M ${f(ax - 70)} ${f(ey(y + 96))} L ${f(ax + 70)} ${f(ey(y + 96))} L ${f(ax + 50)} ${f(ey(y + 206))} L ${f(ax - 50)} ${f(ey(y + 206))} Z" fill="#fff"/>`;
      o += `<g ${W(th * 0.6)}>${Ln(ax - 68, y + 108, ax + 68, y + 108)}${Ln(ax - 52, y + 194, ax + 52, y + 194)}</g>`;
    });
    return o;
  }

  // ── the cupboard door: moulded frame, raised field, brass drop handle ──
  function door(x0, x1, y0, y1, th, hs) {
    let o = R(x0, y0, x1, y1) + R(x0 + 38, y0 + 38, x1 - 38, y1 - 38);
    o += `<g ${W(th)}>${R(x0 + 50, y0 + 50, x1 - 50, y1 - 50)}${R(x0 + 62, y0 + 62, x1 - 62, y1 - 62)}${R(x0 + 95, y0 + 95, x1 - 95, y1 - 95)}</g>`;
    [[x0 + 38, y0 + 38, x0 + 62, y0 + 62], [x1 - 38, y0 + 38, x1 - 62, y0 + 62], [x0 + 38, y1 - 38, x0 + 62, y1 - 62], [x1 - 38, y1 - 38, x1 - 62, y1 - 62]].forEach(([a, b, c, d]) => { o += Ln(a, b, c, d, W(th)); });
    const hx = hs > 0 ? x1 - 22 : x0 + 22, hy = y1 - 150;
    o += `<circle cx="${f(hx)}" cy="${f(ey(hy))}" r="7" ${W(th)}/><path ${W(th)} d="M ${f(hx - 9)} ${f(ey(hy) + 4)} Q ${f(hx)} ${f(ey(hy) + 22)} ${f(hx + 9)} ${f(ey(hy) + 4)}"/>`;
    return o;
  }
  function baseBand(th) {
    let o = "";
    [xBook, xPanel, xZone].forEach(([a, b]) => {
      o += R(a, 0, b, B.h) + R(a, B.h, b, yTop) + `<g ${W(th)}>${[10, 20, 30].map((d) => Ln(a, B.h + d, b, B.h + d)).join("")}${Ln(a, 40, b, 40)}</g>`;
      const m = (a + b) / 2;
      o += door(a + 20, m - 4, 50, B.h - 20, th, 1) + door(m + 4, b - 20, 50, B.h - 20, th, -1);
    });
    return o;
  }

  // ── the smaller crown, full width, breaking forward over the pilasters (owner's photo) ──
  function entablature(x0, x1, th) {
    let o = R(x0, yEnt, x1, K.H, 'fill="#fff"');
    o += `<g ${W(th)}>${[yEnt + 14, yEnt + 26, yFr, yBed, yBed + 12, yDen, yCove, yCrn, yCrn + 22, K.H - E.fillet].map((y) => Ln(x0, y, x1, y)).join("")}</g>`;
    [xP1, xP2].forEach(([a, b]) => { o += `<g ${W(th)}>${Ln(a - 22, yEnt, a - 22, K.H - E.fillet)}${Ln(b + 22, yEnt, b + 22, K.H - E.fillet)}</g>`; });
    for (let x = x0 + 8; x + E.dW < x1; x += E.dPitch) o += `<rect ${W(th * 0.8)} x="${f(x)}" y="${f(ey(yCove - 3))}" width="${E.dW}" height="${E.dentil - 6}"/>`;
    return o;
  }

  // ── bookcase: shelves of books, and either the flat head with its band panel, or the arch ──
  function books(x0, x1, y0, y1, th) {
    let o = "", x = x0 + 20;
    while (x < x1 - 40) { const bw = 22 + ((x * 7) % 18), bh = y1 - y0 - 30 - ((x * 13) % 70); o += R(x, y0, x + bw, y0 + bh, `${W(th * 0.6)}`); x += bw + 2; }
    return o;
  }
  function bandPanel(a, b, th) {
    const x0 = a + 60, x1 = b - 60, y0 = yBand + 45, y1 = yEnt - 45;
    let o = R(a, yOpen, b, yBand, W(th)) + R(x0, y0, x1, y1) + `<g ${W(th)}>${R(x0 + 18, y0 + 18, x1 - 18, y1 - 18)}${R(x0 + 32, y0 + 32, x1 - 32, y1 - 32)}</g>` + R(x0 + 45, y0 + 45, x1 - 45, y1 - 45);
    [[x0, y0, x0 + 45, y0 + 45], [x1, y0, x1 - 45, y0 + 45], [x0, y1, x0 + 45, y1 - 45], [x1, y1, x1 - 45, y1 - 45]].forEach(([p, q, r2, s2]) => { o += Ln(p, q, r2, s2, W(th)); });
    return o;
  }
  function bookcase(th, arched) {
    const [x0, x1] = xBook, s = BK.stile, xi0 = x0 + s, xi1 = x1 - s;
    let o = R(x0, yTop, x1, yEnt);
    BK.shelves.forEach((y) => { o += R(xi0, y - BK.st, xi1, y, W(th)) + Ln(xi0, y - 12, xi1, y - 12, `${W(th * 0.5)}`); });
    [yTop, ...BK.shelves.slice(0, -1)].forEach((y, i) => (o += books(xi0, xi1, y, BK.shelves[i] - BK.st, th)));
    if (!arched) {
      o += `<g ${W(th)}>${R(xi0, yTop, xi1, yOpen)}${Ln(xi0 - 15, yOpen, xi1 + 15, yOpen)}</g>` + books(xi0, xi1, BK.shelves.at(-1), yOpen, th);
      return o + bandPanel(x0, x1, th);
    }
    const g = gB, m = K.bkArch.mould;
    o += `<g ${W(th)}>${Ln(xi0, yTop, xi0, g.ys)}${Ln(xi1, yTop, xi1, g.ys)}</g>`;
    // the arched top bay: books on the top shelf, standing under the arch (owner's photo)
    o += books(xi0 + 40, xi1 - 40, BK.shelves.at(-1), BK.shelves.at(-1) + 300, th);
    // impost blocks at the springing, the arch, the archivolt with two steps
    [[x0, xi0], [xi1, x1]].forEach(([a, b]) => (o += R(a - 6, g.ys - 34, b + 6, g.ys, 'fill="#fff"') + Ln(a - 6, g.ys - 14, b + 6, g.ys - 14, W(th))));
    const aIn = arcPts(g, g.R, -g.th, g.th), aOut0 = angAt(g, g.R + m, g.ys);
    o += P(aIn, W(th * 1.6));
    o += P(arcPts(g, g.R + m, -aOut0, aOut0), "");
    [16, 30].forEach((d) => { const a = angAt(g, g.R + d, g.ys); o += P(arcPts(g, g.R + d, -a, a), W(th * 0.7)); });
    // the spandrels: mouldings curved to the arch; the right-hand one is the hinged flap (hidden storage B)
    const tR = spandrel(g, g.R + m, x1, yEnt, -1);
    o += spandrelPath(g, g.R + m, x0, yEnt, 1, th) + spandrelPath(g, g.R + m, x1, yEnt, -1, th);
    o += `<circle cx="${f(tR[0][0] - 9)}" cy="${f(ey(tR[0][1] - 40))}" r="6" ${W(th)}/><circle cx="${f(tR[1][0] - 9)}" cy="${f(ey(tR[1][1] + 40))}" r="6" ${W(th)}/>`;
    return o;
  }

  // ── centre bay: panel at the wall plane, plain skirting, 3-step frame with a bead row, the painting ──
  function centrePanel(th) {
    const [x0, x1] = xPanel, fr = C.frameW;
    let o = R(x0, yTop, x1, yEnt, W(th)) + bandPanel(x0, x1, th);
    o += R(x0, yTop, x1, yTop + C.skirt) + Ln(x0, yTop + C.skirt - 18, x1, yTop + C.skirt - 18, W(th)) + Ln(x0, yTop + 14, x1, yTop + 14, W(th * 0.6));
    o += R(fa0, fb0, fa1, fb1) + `<g ${W(th)}>${R(fa0 + 14, fb0 + 14, fa1 - 14, fb1 - 14)}${R(fa0 + 30, fb0 + 30, fa1 - 30, fb1 - 30)}</g>` + R(fa0 + fr, fb0 + fr, fa1 - fr, fb1 - fr);
    [[fa0, fb0, 1, 1], [fa1, fb0, -1, 1], [fa0, fb1, 1, -1], [fa1, fb1, -1, -1]].forEach(([p, q, sx, sy]) => (o += Ln(p, q, p + sx * fr, q + sy * fr, W(th))));
    // the bead row between the second step and the inner edge (owner's photo), 8 beads at 14 centres
    const bi = 42 + C.bead / 2, beadRow = (ax, ay, bx, by) => { const L = Math.hypot(bx - ax, by - ay), n = Math.floor(L / C.beadPitch); let s = ""; for (let i = 1; i < n; i++) { const t = i / n; s += `<circle cx="${f(ax + (bx - ax) * t)}" cy="${f(ey(ay + (by - ay) * t))}" r="${C.bead / 2}" ${W(th * 0.4)}/>`; } return s; };
    o += beadRow(fa0 + bi, fb0 + bi, fa1 - bi, fb0 + bi) + beadRow(fa0 + bi, fb1 - bi, fa1 - bi, fb1 - bi) + beadRow(fa0 + bi, fb0 + bi, fa0 + bi, fb1 - bi) + beadRow(fa1 - bi, fb0 + bi, fa1 - bi, fb1 - bi);
    // the painting: an oil landscape in a slim gilt frame (a stand-in, as the left wall's), picture light above
    const g = C.gilt, px0 = pcx - pw / 2, px1 = pcx + pw / 2, py0 = pcy - ph / 2, py1 = pcy + ph / 2;
    o += R(px0, py0, px1, py1, 'fill="#fff"') + `<g ${W(th * 0.8)}>${R(px0 + 14, py0 + 14, px1 - 14, py1 - 14)}${R(px0 + g, py0 + g, px1 - g, py1 - g)}</g>`;
    o += `<g ${W(th * 0.5)} fill="none"><path d="M ${f(px0 + g)} ${f(ey(py0 + ph * 0.42))} C ${f(px0 + 250)} ${f(ey(py0 + ph * 0.55))} ${f(px0 + 420)} ${f(ey(py0 + ph * 0.38))} ${f(px1 - g)} ${f(ey(py0 + ph * 0.47))}"/><path d="M ${f(px0 + 120)} ${f(ey(py0 + ph * 0.42))} L ${f(px0 + 160)} ${f(ey(py0 + ph * 0.66))} L ${f(px0 + 200)} ${f(ey(py0 + ph * 0.44))}"/><path d="M ${f(px1 - 220)} ${f(ey(py0 + ph * 0.45))} C ${f(px1 - 200)} ${f(ey(py0 + ph * 0.7))} ${f(px1 - 140)} ${f(ey(py0 + ph * 0.7))} ${f(px1 - 120)} ${f(ey(py0 + ph * 0.46))}"/></g>`;
    o += R(pcx - 230, py1 + 70, pcx + 230, py1 + 92, 'fill="#fff"') + Ln(pcx, py1 + 70, pcx, py1 + 30, W(th));
    return o;
  }

  // ── window bay: architrave, casements; either the flat head, or the wood arch with the veneered panel under it ──
  function windowZone(th, arched) {
    const [z0, z1] = xZone, [w0, w1] = xWin, ar = WN.arch;
    let o = R(z0, yTop, z1, yEnt, W(th));
    const top = arched ? gW.ys : WN.head;
    // left jamb architrave, stepped (the window is hard into the right-hand corner)
    o += R(w0 - ar, WN.sill, w0, arched ? gW.ys : WN.head + ar) + `<g ${W(th)}>${Ln(w0 - ar + 20, WN.sill, w0 - ar + 20, arched ? gW.ys : WN.head + ar - 20)}${Ln(w0 - ar + 40, WN.sill, w0 - ar + 40, arched ? gW.ys : WN.head + ar - 40)}</g>`;
    // casements below `top`, glazing bars at thirds
    o += R(w0, WN.sill, w1, top);
    const mid = (w0 + w1) / 2, hgt = WN.head - WN.sill - 40;
    [[w0 + 20, mid - 5], [mid + 5, w1 - 20]].forEach(([a, b]) => {
      o += Ln(a, WN.sill + 20, a, top, W(th)) + Ln(b, WN.sill + 20, b, top, W(th)) + Ln(a, WN.sill + 20, b, WN.sill + 20, W(th));
      for (let k = 1; k < 3; k++) { const y = WN.sill + 20 + (hgt * k) / 3; if (y < top) o += Ln(a, y, b, y, W(th)); }
      o += Ln((a + b) / 2, WN.sill + 20, (a + b) / 2, top, W(th));
    });
    if (!arched) {
      o += R(w0 - ar, WN.head, w1, WN.head + ar) + Ln(w0 - ar + 20, WN.head + ar - 20, w1, WN.head + ar - 20, W(th)) + Ln(w0, WN.head, w1, WN.head, W(th));
      return o;
    }
    const g = gW, m = K.winArch.mould;
    // the veneered panel under the arch, set back flush with the window frame: no glass in the arch
    const aIn = arcPts(g, g.R, -g.th, g.th);
    o += P([[w0, g.ys], ...aIn, [w1, g.ys]], `fill="#fff" ${W(th * 1.6)}`, true);
    o += P([[w0 + 30, g.ys + 30], ...arcPts(g, g.R - 30, -angAt(g, g.R - 30, g.ys + 30), angAt(g, g.R - 30, g.ys + 30)), [w1 - 30, g.ys + 30]], W(th * 0.5), true);
    // the archivolt, continuing the architrave; it dies into the side wall on the right
    const aO = angAt(g, g.R + m, g.ys), aWall = Math.asin(Math.min(1, (z1 - g.cx) / (g.R + m)));
    o += P(arcPts(g, g.R + m, -aO, Math.min(aO, aWall)), "");
    [20, 40].forEach((d) => { const a = angAt(g, g.R + d, g.ys), aw = Math.asin(Math.min(1, (z1 - g.cx) / (g.R + d))); o += P(arcPts(g, g.R + d, -a, Math.min(a, aw)), W(th * 0.7)); });
    // spandrel triangles in the two upper corners
    o += spandrelPath(g, g.R + m, z0, yEnt, 1, th, 22, 25) + spandrelPath(g, g.R + m, z1, yEnt, -1, th, 22, 25);
    return o;
  }

  // ── the curtains (approved): red velvet on a rod under the cornice, tied back; white linen sheer under the arch ──
  function curtains(th, arched) {
    const CU = K.curtain, sy = arched ? gW.ys - 10 : WN.head - 20, [w0, w1] = xWin, x0 = xZone[0] + 14;
    let o = `<g ${W(th * 0.5)}>`;
    for (let x = w0 + 40; x < w1 - 20; x += 60) o += Ln(x, sy - 10, x, WN.sill + 20, 'stroke-dasharray="40 30"');
    o += `</g>` + Ln(w0, sy, w1, sy, W(th * 1.2));
    o += Ln(x0, CU.rod, K.W, CU.rod, W(th * 2.2)) + `<circle cx="${f(x0)}" cy="${f(ey(CU.rod))}" r="16" fill="#fff" ${W(th)}/>`;
    // each red panel: full at the rod, gathered at the tie-back, falling to the counter
    const panel = (xo, d) => {
      const xi = xo + d * 330, xt = xo + d * 170, xf = xo + d * 300;
      let s = `<path fill="#fff" ${W(th * 1.1)} d="M ${f(xo)} ${f(ey(CU.rod - 12))} L ${f(xi)} ${f(ey(CU.rod - 12))} C ${f(xi)} ${f(ey(1900))} ${f(xt + d * 20)} ${f(ey(1500))} ${f(xt)} ${f(ey(CU.tie))} C ${f(xt + d * 10)} ${f(ey(1100))} ${f(xf)} ${f(ey(900))} ${f(xf)} ${f(ey(yTop + 15))} L ${f(xo)} ${f(ey(yTop + 15))} Z"/>`;
      for (let k = 1; k < 5; k++) s += `<path fill="none" ${W(th * 0.5)} d="M ${f(xo + d * 66 * k)} ${f(ey(CU.rod - 14))} C ${f(xo + d * 66 * k)} ${f(ey(1900))} ${f(xo + d * 34 * k)} ${f(ey(1500))} ${f(xo + d * 34 * k)} ${f(ey(CU.tie))} C ${f(xo + d * 34 * k)} ${f(ey(1100))} ${f(xo + d * 60 * k)} ${f(ey(900))} ${f(xo + d * 60 * k)} ${f(ey(yTop + 18))}"/>`;
      s += `<path fill="none" ${W(th * 1.6)} d="M ${f(xo)} ${f(ey(CU.tie))} L ${f(xt)} ${f(ey(CU.tie))}"/><ellipse cx="${f(xt)}" cy="${f(ey(CU.tie - 60))}" rx="12" ry="36" fill="#fff" ${W(th)}/>`;
      return s;
    };
    return o + panel(x0, 1) + panel(K.W, -1);
  }

  function elevation(th, arched) {
    return baseBand(th) + bookcase(th, arched) + centrePanel(th) + windowZone(th, arched) + curtains(th, arched) + pilaster(xP1[0], th) + pilaster(xP2[0], th) +
      entablature(0, K.W, th) + lamp((xP1[0] + xP1[1]) / 2, th) + lamp((xP2[0] + xP2[1]) / 2, th) +
      `<line x1="-150" y1="${ey(0)}" x2="${K.W + 150}" y2="${ey(0)}" stroke-width="${f(th * 5)}"/><line x1="-150" y1="${ey(K.H)}" x2="${K.W + 150}" y2="${ey(K.H)}" stroke-width="${f(th * 3)}" stroke-dasharray="40 20"/>`;
  }

  // ── PLAN, cut at 1200; y = depth from the wall face, into the room ──
  function plan(th, dash, arched) {
    const hatch = `fill="url(#hatchW2)" stroke="none"`;
    let o = `<rect x="-150" y="${-WN.wall}" width="${K.W + 300}" height="${WN.wall}" ${hatch}/><rect x="${K.W}" y="0" width="150" height="420" ${hatch}/>`;
    o += `<rect x="${xWin[0]}" y="${-WN.wall}" width="${WN.w}" height="${WN.wall}" fill="#fff" stroke="none"/>`;
    o += `<path d="M -150 0 L ${xWin[0]} 0 L ${xWin[0]} ${-WN.wall} M -150 ${-WN.wall} L ${xWin[0]} ${-WN.wall} M ${K.W} 420 L ${K.W} ${-WN.wall}" stroke-width="${f(th * 3)}" fill="none"/>`;
    // window frame and glass in the middle of the wall; two casements
    o += `<rect x="${xWin[0]}" y="${WN.glass - 35}" width="${WN.w}" height="${WN.frameD}" ${W(th * 1.2)}/>` + `<line x1="${xWin[0]}" y1="${WN.glass}" x2="${K.W}" y2="${WN.glass}" ${W(th)}/><line x1="${winC}" y1="${WN.glass - 35}" x2="${winC}" y2="${WN.glass + 35}" ${W(th)}/>`;
    // the counter and cupboards below (dashed), and the false back in the centre cupboard (hidden storage A)
    o += `<rect x="0" y="0" width="${K.W}" height="${B.d + B.over}" stroke-dasharray="${dash}" ${W(th)}/>`;
    o += `<line x1="${xPanel[0] + 30}" y1="100" x2="${xPanel[1] - 30}" y2="100" stroke-dasharray="${dash}" ${W(th * 1.6)}/>`;
    // bookcase carcase, back and stiles cut, the shelf below seen
    o += `<rect x="0" y="0" width="${BK.w}" height="${BK.d}" fill="#fff"/><rect x="0" y="0" width="${BK.w}" height="${BK.back}" ${hatch}/>`;
    o += `<rect x="0" y="${BK.back}" width="${BK.stile}" height="${BK.d - BK.back}" ${hatch}/><rect x="${BK.w - BK.stile}" y="${BK.back}" width="${BK.stile}" height="${BK.d - BK.back}" ${hatch}/>`;
    o += `<rect x="${BK.stile}" y="${BK.back}" width="${BK.w - 2 * BK.stile}" height="${BK.d - BK.back - 6}" ${W(th * 0.7)}/>`;
    // the soffit niches overhead (dashed), projected down
    const nicheP = (g, yA, yB) => niches(g).map(([a0, a1]) => { const xa = apt(g, g.R, a0)[0], xb = apt(g, g.R, a1)[0], yc = (yA + yB) / 2; return `<rect x="${f(xa)}" y="${f(yc - N.wid / 2)}" width="${f(xb - xa)}" height="${N.wid}" stroke-dasharray="${dash}" ${W(th)}/>`; }).join("");
    if (arched) o += nicheP(gB, BK.back, BK.d);
    // pilasters, fluted faces; pedestals below (dashed)
    [xP1, xP2].forEach(([a, b]) => {
      o += `<rect x="${a}" y="0" width="${PL.w}" height="${PL.d}" ${hatch}/><rect x="${a}" y="0" width="${PL.w}" height="${PL.d}" fill="none"/>`;
      o += `<rect x="${a - PL.ped - 15}" y="0" width="${PL.w + 2 * PL.ped + 30}" height="${B.d + B.over + PL.pedProj}" stroke-dasharray="${dash}" ${W(th)}/>`;
      const n = PL.flutes, pitch = (PL.w - 30) / n, fw = pitch * 0.7;
      let d = `M ${a} ${PL.d} L ${a} ${PL.d + PL.proj} L ${a + 15} ${PL.d + PL.proj} `;
      for (let i = 0; i < n; i++) { const xc = a + 15 + pitch * (i + 0.5); d += `L ${f(xc - fw / 2)} ${PL.d + PL.proj} A ${f(fw / 2)} ${f(fw / 2)} 0 0 0 ${f(xc + fw / 2)} ${PL.d + PL.proj} `; }
      o += `<path d="${d}L ${b} ${PL.d + PL.proj} L ${b} ${PL.d}" fill="#fff"/>`;
    });
    // centre: the panel at the wall plane (ply on packers), the frame's stiles cut, the painting hung
    o += `<rect x="${xPanel[0]}" y="7" width="${PNW}" height="18" ${hatch}/><rect x="${xPanel[0]}" y="0" width="${PNW}" height="${C.back}" fill="none" ${W(th)}/>`;
    [[fa0, fa0 + C.frameW], [fa1 - C.frameW, fa1]].forEach(([a, b]) => (o += `<rect x="${f(a)}" y="${C.back}" width="${C.frameW}" height="${C.frameP}" ${hatch}/><rect x="${f(a)}" y="${C.back}" width="${C.frameW}" height="${C.frameP}" fill="none"/>`));
    o += `<rect x="${f(pcx - pw / 2)}" y="${C.back + 8}" width="${pw}" height="40" fill="#fff" ${W(th)}/>`;
    // window bay: panelling to 200, the reveal lining back to the frame
    o += `<rect x="${xZone[0]}" y="0" width="${WN.arch}" height="${WN.set}" ${hatch}/><rect x="${xZone[0]}" y="0" width="${WN.arch}" height="${WN.set}" fill="none"/>`;
    o += `<path d="M ${xWin[0]} ${WN.set} L ${xWin[0]} ${WN.glass + 35}" ${W(th * 1.2)}/><path d="M ${xZone[0]} ${WN.set} L ${xWin[0]} ${WN.set}" ${W(th)}/>`;
    if (arched) o += nicheP(gW, WN.glass + 35, WN.set) + `<line x1="${xWin[0]}" y1="${WN.glass + 40}" x2="${K.W}" y2="${WN.glass + 40}" stroke-dasharray="${dash}" ${W(th)}/>`;
    // curtains overhead (dashed): the sheer rod in the reveal, the red rod in front; the tied-back stacks
    o += `<line x1="${xWin[0]}" y1="${-30}" x2="${K.W}" y2="${-30}" stroke-dasharray="${dash}" ${W(th * 1.4)}/><line x1="${xZone[0] + 14}" y1="${WN.set + 60}" x2="${K.W}" y2="${WN.set + 60}" stroke-dasharray="${dash}" ${W(th * 2)}/>`;
    o += `<path d="M ${xZone[0] + 14} ${WN.set + 60} c 0 70 160 90 250 40 M ${K.W} ${WN.set + 60} c 0 70 -160 90 -250 40" stroke-dasharray="${dash}" ${W(th)} fill="none"/>`;
    // the cornice above (dashed)
    o += `<line x1="0" y1="${BK.d + E.proj}" x2="${K.W}" y2="${BK.d + E.proj}" stroke-dasharray="${dash}" ${W(th)}/>`;
    return o;
  }

  // ═════════════ SHEETS ═════════════
  const defs = `<defs><pattern id="hatchW" patternUnits="userSpaceOnUse" width="40" height="40" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="40" stroke="#888" stroke-width="4"/></pattern><pattern id="hatchW2" patternUnits="userSpaceOnUse" width="22" height="22" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="22" stroke="#777" stroke-width="2.4"/></pattern></defs>`;
  const mono = (svg) => svg.replace(/#8a3a22/g, "#1b1b1b");

  function gaSheet(key, arched, dwg) {
    window.DK.begin(key);
    let s = frame() + defs;
    const sc = 20, vE = view(64, 32, sc, `Study wall elevation${arched ? " with arches" : ""}`), tE = vE.w(0.09);
    s += heading(18, 17, `ELEVATION — STUDY WALL${arched ? ", WITH THE ARCHES" : ", WITHOUT ARCHES"}`, `SCALE 1:${sc} · SEEN FROM THE ROOM · CURTAINS SHOWN TIED BACK`, 150);
    s += vE.g(elevation(tE, arched), 0.25);
    const yb = vE.Y(ey(0));
    s += chainH([0, xBook[1], xP1[1], xPanel[1], xP2[1], K.W].map(vE.X), yb + 5, [BK.w, PL.w, PNW, PL.w, xZone[1] - xZone[0]], { from: yb + 1, size: 1.25 });
    s += chainH([vE.X(0), vE.X(K.W)], yb + 11, [`${K.W} WALL (14 FT 11 IN)`], { from: yb + 1, size: 1.35 });
    const hs = arched ? [0, B.h, yTop, gB.ys, gB.ys + gB.rise, yEnt, K.H] : [0, B.h, yTop, yOpen, yEnt, K.H];
    const hl = arched ? [B.h, B.top, gB.ys - yTop, gB.rise, yEnt - gB.ys - gB.rise, entH] : [B.h, B.top, yOpen - yTop, yEnt - yOpen, entH];
    s += chainV(hs.map((y) => vE.Y(ey(y))), vE.X(K.W) + 6, hl, { from: vE.X(K.W) + 1, size: 1.1 });
    s += chainV([vE.Y(ey(0)), vE.Y(ey(K.H))], vE.X(K.W) + 19, [`${K.H} CEILING (9 FT 1 IN)`], { from: vE.X(K.W) + 1, size: 1.25 });
    const ws = arched ? [WN.sill, gW.ys, WN.head] : [WN.sill, WN.head];
    s += chainV(ws.map((y) => vE.Y(ey(y))), vE.X(K.W) + 13, arched ? [`${gW.ys - WN.sill} GLASS SEEN`, K.winArch.rise] : [WN.head - WN.sill], { from: vE.X(K.W) + 1, size: 1.05 });
    if (arched) {
      s += chainH([vE.X(gB.xa), vE.X(gB.xb)], vE.Y(ey(gB.ys)) + 3.5, [`${gB.xb - gB.xa} ARCH, RISE ${gB.rise}`], { from: vE.Y(ey(gB.ys)), size: 1.1 });
      s += chainH([vE.X(gW.xa), vE.X(gW.xb)], vE.Y(ey(gW.ys)) + 3.5, [`${gW.xb - gW.xa} ARCH, RISE ${gW.rise}`], { from: vE.Y(ey(gW.ys)), size: 1.1 });
    }
    // labels: left gutter (bookcase side), right gutter (window side)
    const EL = labels(56, "left", 30, 166), ER = labels(vE.X(K.W) + 30, "right", 30, 166);
    ER.add(vE.X(xPanel[0] + 600), vE.Y(ey(yCrn + 10)), "SMALLER DENTIL CROWN", "AS OWNER'S PHOTO · NO MODILLIONS");
    ER.add(vE.X(xP2[0] - 22), vE.Y(ey(yCap + 70)), "MOULDED CAPITAL", "BREAKS FORWARD");
    if (arched) {
      ER.add(vE.X(winC), vE.Y(ey(gW.ys + 150)), "WOOD ARCH IN THE WINDOW HEAD", "VENEERED PANEL, FLUSH WITH THE FRAME — NO GLASS");
      ER.add(vE.X(winC - 300), vE.Y(ey(gW.ys + gW.rise - 40)), "3 DEEP NICHES IN ITS SOFFIT", "SEEN LOOKING UP — SHEET 042");
    }
    ER.add(vE.X(xZone[0] + 200), vE.Y(ey(1700)), "RED VELVET, TIED BACK", "WHITE LINEN SHEER UNDER THE " + (arched ? "ARCH" : "HEAD"));
    ER.add(vE.X((xP2[0] + xP2[1]) / 2 + K.lamp.span), vE.Y(ey(K.lamp.y + 150)), "WALL LAMP ×2", "BRASS TWIN-ARM — OWNER'S PHOTO");
    ER.add(vE.X(xP2[0] + 60), vE.Y(ey(1000)), "FLUTED PILASTER ×2", "STANDS 10½ IN PROUD OF THE PANEL");
    ER.add(vE.X(xZone[1] - 300), vE.Y(ey(350)), "CUPBOARDS UNDER ALL THREE BAYS", "COUNTER = WINDOW SILL, 2 FT 3 IN");
    if (arched) {
      EL.add(vE.X(400), vE.Y(ey(gB.ys + 200)), "ARCH OVER THE BOOKCASE", "BOOKS STAND UNDER IT — OWNER'S PHOTO");
      EL.add(vE.X(gB.cx - 250), vE.Y(ey(gB.ys + gB.rise - 30)), "3 DEEP NICHES IN ITS SOFFIT", "SEEN LOOKING UP — SHEET 042");
      EL.add(vE.X(1300), vE.Y(ey(yEnt - 60)), "SPANDREL MOULDINGS, CURVED TO THE ARCH", "RIGHT ONE HINGES — HIDDEN STORE B");
    } else {
      EL.add(vE.X(BK.w / 2), vE.Y(ey((yBand + yEnt) / 2)), "BAND PANEL", "EVERY BAY");
      EL.add(vE.X(BK.w / 2), vE.Y(ey(yOpen - 13)), "FLAT HEAD", "");
    }
    EL.add(vE.X(400), vE.Y(ey(1300)), "OPEN SHELVES, 280 DEEP", "");
    EL.add(vE.X(fa0 + 30), vE.Y(ey(fb0 + 200)), "3-STEP FRAME + BEAD ROW", "25 PROUD — OWNER'S PHOTO");
    EL.add(vE.X(pcx - 300), vE.Y(ey(pcy)), "OIL LANDSCAPE, GILT FRAME", "STAND-IN — THE OWNER CHOOSES");
    EL.add(vE.X(xPanel[0] + 300), vE.Y(ey(yTop + 60)), "PANEL AT THE WALL, PLAIN SKIRTING", "9 IN SHELF ON THE COUNTER — APPROVED");
    EL.add(vE.X(xPanel[0] + 320), vE.Y(ey(300)), "FALSE BACK INSIDE", "HIDDEN STORE A — BOOK KEY");
    s += EL.draw() + ER.draw();

    // plan
    const scP = 20, vP = view(64, 213, scP, `Study wall plan${arched ? " with arches" : ""}`), tP = vP.w(0.09);
    s += heading(18, 186, "PLAN", `CUT AT 1200 · SCALE 1:${scP} · WALL AT THE TOP · OVERHEAD AND BELOW DASHED`, 150);
    s += vP.g(plan(tP, `${vP.w(0.9)} ${vP.w(0.6)}`, arched), 0.25);
    s += chainV([vP.Y(0), vP.Y(C.back), vP.Y(BK.d), vP.Y(PL.d + PL.proj)], vP.X(-150) - 3, [C.back, BK.d - C.back, PL.proj], { from: vP.X(0) - 1, size: 1.1 });
    s += chainH([vP.X(xPanel[0]), vP.X(fa0), vP.X(fa1), vP.X(xPanel[1])], vP.Y(PL.d + PL.proj) + 6, [C.inset, fa1 - fa0, C.inset], { from: vP.Y(PL.d) , size: 1.05 });
    const PLb = labels(vP.X(K.W) + 16, "right", 196, 238);
    PLb.add(vP.X(fa0 + 35), vP.Y(C.back + 12), "FRAME STILE, 70 × 25", "");
    PLb.add(vP.X(pcx), vP.Y(C.back + 30), "PAINTING", "");
    PLb.add(vP.X(xPanel[1] - 100), vP.Y(100), "FALSE BACK, 100 OFF THE WALL", "IN THE CUPBOARD BELOW");
    PLb.add(vP.X(xZone[0] + 300), vP.Y(WN.set + 60), "CURTAIN RODS OVERHEAD", "");
    s += PLb.draw();

    // notes
    s += heading(18, 244, "NOTES", `REVISION ${K.rev.split(" ")[0]}`, 120);
    (arched ? [
      "Owner's second scheme (7 Oct). Arches over the bookcase and the window, three deep rectangular niches cut into each",
      "arch's underside — no lights — and spandrel mouldings curved to follow the arch. The window's glass is unchanged: the wood arch",
      "fills the top 1 ft of the opening, veneered flush with the frame. Only 4 in is free above the window, so it cannot rise higher.",
      "Centre: the panel goes back to the wall plane, so the counter is a 9 in shelf and the pilasters stand 10½ in proud (approved).",
      "Mouldings, crown and lamp from the owner's photos. Sections: AST-DR-042. Details and hidden storage: AST-DR-043.",
    ] : [
      "The earlier flat-headed scheme, kept so the two can be compared. Band panels over all three bays; the window head unchanged.",
      "Centre: the panel goes back to the wall plane, so the counter is a 9 in shelf and the pilasters stand 10½ in proud (approved).",
      "Mouldings, crown and lamp from the owner's photos. The arched scheme is AST-DR-040.",
    ]).forEach((n, i) => (s += text(18, 254 + i * 4.3, n, { size: 1.42 })));
    s += titleBlock({ title: `STUDY WALL — ${arched ? "WITH ARCHES" : "WITHOUT ARCHES"}`, sub: "Elevation · Plan", date: K.date, rev: K.rev, dwg, scale: "1:20 @ A3" });
    window.DRAWINGS[key] = { title: `Study wall — ${arched ? "with arches" : "without arches"} · ${dwg}`, svg: mono(sheet(s)), params: SW2 };
  }

  gaSheet("studywall-arch", true, "AST-DR-040");
  gaSheet("studywall-flat", false, "AST-DR-041");
  window.SW2GEOM = { gB, gW, niches, K, yEnt, entH, xPanel, xZone, xWin, fa0, fa1, fb0, fb1 };
})();
