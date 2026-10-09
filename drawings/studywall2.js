// Study wall, second scheme (owner, 7 Oct 2026) — the detailed set, plain line, no colour.
// AST-DR-040 general arrangement WITH the arches, AST-DR-041 the same wall WITHOUT them (the earlier scheme).
// Both carry the approved counter shelf: the centre panel goes back to the wall plane, so the counter is a real
// 9 in shelf and the two fluted pilasters stand nearly 11 in proud. The crown is the smaller dentil cornice from the
// owner's photo; the frame round the painting carries a row of small beads (owner's photo); the wall lamps are the
// brass twin-arm sconce from the owner's photo; the window's red velvet and white linen sheer hang INSIDE the window arch
// from tracks in its soffit, no rods (owner, 8 Oct, his arched-doorway photo); the arched-off scheme keeps the rod.
// With the arches: a segmental arch over the bookcase (books under it, as the owner's arched-bookcase photo) and the
// same arch in the window head — wood only, the glass unchanged behind; three deep rectangular niches cut into the
// underside of each arch (seen looking up), a small focus light in the middle of each (owner, 8 Oct); spandrel
// mouldings curved to the arch.
// Real units mm. Elevation: x along the wall from the left corner, y UP from the floor. Plan: y = depth into the room.

window.DRAWINGS = window.DRAWINGS || {};

const SW2 = {
  rev: "4 — both arches lowered 4 in, springing together, so the window arch's crown hides the window's top rail (owner, 9 Oct); 3 — the arch shown as a panel in front of the window (curtains not drawn); curtains inside the window arch, no rods; a focus light in each niche; a strip light under each shelf; the right reveal veneered (owner, 8 Oct)",
  date: "09.10.2026",
  W: 4547, H: 2769,                          // 14 ft 11 in wall, 9 ft 1 in ceiling (measured)
  base: { h: 646, top: 40, d: 255, over: 25, plinth: 100, door: 22 },   // cupboards; counter 686 = window sill
  book: { w: 1489, d: 280, stile: 60, shelves: [890, 1160, 1430, 1700], st: 25, back: 18 },
  pil: { w: 240, proj: 40, flutes: 9, capH: 120, d: 280, ped: 25, pedProj: 50 },
  // the centre: panel 25 off the wall (approved), a slim 3-step frame 25 proud with a bead row, plain skirting
  centre: { back: 25, skirt: 120, skirtT: 20, frameW: 70, frameP: 25, inset: 80, bead: 8, beadPitch: 14,
            painting: [860, 640], gilt: 50, band: 360, rail: 40 },
  win: { w: 1219, sill: 686, head: 2337, arch: 70, wall: 230, set: 280, glass: -115, frameD: 70 },   // window bay to 280 like the rest: the crown runs on one plane, the reveal is 14 in
  // the smaller crown (owner's photo): stepped architrave, plain frieze, bed mould, fine dentils, cove, cyma, fillet
  ent: { arch: 40, frieze: 120, bed: 25, dentil: 22, cove: 35, crown: 50, fillet: 15, proj: 120, dW: 12, dPitch: 20 },
  bkArch: { spring: 1936, rise: 320, mould: 46 },   // springs with the window arch (owner, 9 Oct)   // archivolt 46 so it lands on the bookcase's outer edge
  winArch: { rise: 300, mould: 56, drop: 101 },   // its crown 4 in below the window head, so the window's top rail never shows (owner, 9 Oct)                // springs 1 ft below the head; archivolt lands on the architrave
  niche: { n: 3, len: 380, wid: 180, depth: 90, cB: 149, cW: 140 },   // three deep rectangular niches in each soffit, a focus light (3000 K, 52 trim) in the middle of each; centred across the soffit (the window's kept clear of the brick lintel)
  lamp: { y: 1290, span: 160 },
  curtain: { rod: 2440, sheer: 2030, tie: 1250, sheerS: -50, velS: 22, tieW: 185, footW: 300 },   // rod/sheer: arched-off scheme; S = line off the wall in the arch
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
  const gW = arch(xWin[0], xWin[1], WN.head - K.winArch.rise - K.winArch.drop, K.winArch.rise);
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
    // the spandrels: mouldings curved to the arch
    o += spandrelPath(g, g.R + m, x0, yEnt, 1, th) + spandrelPath(g, g.R + m, x1, yEnt, -1, th);
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
    // casements, glazing bars at thirds. With the arch the window is untouched behind it: the glass and its bars run up
    // until the arch's curve hides them (owner, 9 Oct) — the arch is a panel in front, not a cut-down window
    const upTo = (x) => (arched ? Math.min(WN.head, gW.cy + Math.sqrt(Math.max(0, gW.R * gW.R - (x - gW.cx) ** 2))) : top);
    o += arched ? Ln(w0, WN.sill, w1, WN.sill) + Ln(w0, WN.sill, w0, upTo(w0)) + Ln(w1, WN.sill, w1, upTo(w1)) : R(w0, WN.sill, w1, top);
    const mid = (w0 + w1) / 2, hgt = WN.head - WN.sill - 40;
    [[w0 + 20, mid - 5], [mid + 5, w1 - 20]].forEach(([a, b]) => {
      o += Ln(a, WN.sill + 20, a, upTo(a), W(th)) + Ln(b, WN.sill + 20, b, upTo(b), W(th)) + Ln(a, WN.sill + 20, b, WN.sill + 20, W(th));
      for (let k = 1; k < 3; k++) { const y = WN.sill + 20 + (hgt * k) / 3; if (y < top) o += Ln(a, y, b, y, W(th)); }
      const c = (a + b) / 2; o += Ln(c, WN.sill + 20, c, upTo(c), W(th));
    });
    if (!arched) {
      o += R(w0 - ar, WN.head, w1, WN.head + ar) + Ln(w0 - ar + 20, WN.head + ar - 20, w1, WN.head + ar - 20, W(th)) + Ln(w0, WN.head, w1, WN.head, W(th));
      return o;
    }
    const g = gW, m = K.winArch.mould;
    // the arch's edge: a panel set in front of the window, hiding only the corners above this curve — the glass shows
    // through the arch right up to it (owner, 9 Oct)
    const aIn = arcPts(g, g.R, -g.th, g.th);
    o += P(aIn, W(th * 1.6));
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
    if (arched) return "";   // curtains left off the drawing so the arch over the window reads clearly (owner, 9 Oct)
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

  // ── with the arches (owner, 8 Oct, his arched-doorway photo): both curtains hang INSIDE the window arch from tracks in
  //    its soffit — no rods. The sheer by the glass, the arch wide; the red velvet in front, two panels meeting at the
  //    crown, swept back to the jambs, tied with gold rope and tassels at 1250, breaking on the counter ──
  function archCurtains(th) {
    const CU = K.curtain, g = gW, [w0, w1] = xWin, yb = yTop + 15, tie = CU.tie;
    const az = (x) => g.cy + Math.sqrt(Math.max(0, g.R * g.R - (Math.min(Math.max(x, g.xa), g.xb) - g.cx) ** 2));
    let o = `<g ${W(th * 0.5)}>`;
    for (let x = w0 + 40; x < w1 - 20; x += 60) o += Ln(x, az(x) - 8, x, WN.sill + 20, 'stroke-dasharray="40 30"');
    o += `</g>`;
    const sweep = (xh, yh, xk, xb) => `C ${f(xh)} ${f(ey(yh - (yh - tie) * 0.55))} ${f(xk)} ${f(ey(tie + (yh - tie) * 0.45))} ${f(xk)} ${f(ey(tie))} C ${f(xk)} ${f(ey(1100))} ${f(xb)} ${f(ey(900))} ${f(xb)} ${f(ey(yb))}`;
    const panel = (xo, d) => {
      const head = Array.from({ length: 25 }, (_, i) => { const x = xo + (d * Math.abs(g.cx - xo) * i) / 24; return [x, az(x) - 4]; });
      const [xc, yc] = head[24];
      let s = `<path fill="#fff" ${W(th * 1.1)} d="M ${f(xo)} ${f(ey(yb))} L ${head.map(([x, y]) => `${f(x)} ${f(ey(y))}`).join(" L ")} ${sweep(xc, yc, xo + d * CU.tieW, xo + d * CU.footW)} Z"/>`;
      for (let k = 1; k < 6; k++) {
        const q = k / 6, xh = xo + d * Math.abs(g.cx - xo) * q, yh = az(xh) - 6;
        s += `<path fill="none" ${W(th * 0.5)} d="M ${f(xh)} ${f(ey(yh))} ${sweep(xh, yh, xo + d * CU.tieW * q, xo + d * CU.footW * q)}"/>`;
      }
      s += `<path fill="none" ${W(th * 1.6)} d="M ${f(xo)} ${f(ey(tie))} L ${f(xo + d * CU.tieW)} ${f(ey(tie))}"/><ellipse cx="${f(xo + d * 34)}" cy="${f(ey(tie - 80))}" rx="12" ry="36" fill="#fff" ${W(th)}/>`;
      return s;
    };
    return o + panel(w0, 1) + panel(w1, -1);
  }

  // the shelf lights (owner, 8 Oct): a strip let into the underside of each shelf just behind its lip — drawn as a short
  // dashed glow under every shelf line
  const shelfLights = (th) => BK.shelves.map((z) => Ln(BK.stile + 20, z - 3, BK.w - BK.stile - 20, z - 3, `${W(th * 0.6)} stroke-dasharray="14 8"`)).join("");
  function elevation(th, arched) {
    return (arched ? shelfLights(th) : "") + baseBand(th) + bookcase(th, arched) + centrePanel(th) + windowZone(th, arched) + curtains(th, arched) + pilaster(xP1[0], th) + pilaster(xP2[0], th) +
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
    // the counter and cupboards below (dashed)
    o += `<rect x="0" y="0" width="${K.W}" height="${B.d + B.over}" stroke-dasharray="${dash}" ${W(th)}/>`;
    // bookcase carcase, back and stiles cut, the shelf below seen
    o += `<rect x="0" y="0" width="${BK.w}" height="${BK.d}" fill="#fff"/><rect x="0" y="0" width="${BK.w}" height="${BK.back}" ${hatch}/>`;
    o += `<rect x="0" y="${BK.back}" width="${BK.stile}" height="${BK.d - BK.back}" ${hatch}/><rect x="${BK.w - BK.stile}" y="${BK.back}" width="${BK.stile}" height="${BK.d - BK.back}" ${hatch}/>`;
    o += `<rect x="${BK.stile}" y="${BK.back}" width="${BK.w - 2 * BK.stile}" height="${BK.d - BK.back - 6}" ${W(th * 0.7)}/>`;
    // the soffit niches overhead (dashed), projected down
    const nicheP = (g, yc) => niches(g).map(([a0, a1]) => { const xa = apt(g, g.R, a0)[0], xb = apt(g, g.R, a1)[0]; return `<rect x="${f(xa)}" y="${f(yc - N.wid / 2)}" width="${f(xb - xa)}" height="${N.wid}" stroke-dasharray="${dash}" ${W(th)}/>`; }).join("");
    if (arched) o += nicheP(gB, N.cB);
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
    // the right reveal lined in the veneer too (owner, 8 Oct): 12 on the plaster, frame to face, a lipped front edge
    o += `<rect x="${K.W - 12}" y="${WN.glass + 35}" width="12" height="${WN.set - WN.glass - 35}" ${hatch}/><rect x="${K.W - 12}" y="${WN.glass + 35}" width="12" height="${WN.set - WN.glass - 35}" fill="none" ${W(th)}/>`;
    if (arched) o += nicheP(gW, N.cW) + `<line x1="${xWin[0]}" y1="${WN.glass + 40}" x2="${K.W}" y2="${WN.glass + 40}" stroke-dasharray="${dash}" ${W(th)}/>`;
    // curtains overhead (dashed). With the arches: both tracks bent to the arch — the sheer's on the lining by the glass,
    // the velvet's let into the soffit behind the niches; the tied-back stacks at the jambs. Without: the rods.
    if (arched) {
      const CU = K.curtain;
      o += `<line x1="${xWin[0]}" y1="${CU.sheerS}" x2="${K.W}" y2="${CU.sheerS}" stroke-dasharray="${dash}" ${W(th * 1.2)}/><line x1="${xWin[0]}" y1="${CU.velS}" x2="${K.W}" y2="${CU.velS}" stroke-dasharray="${dash}" ${W(th * 2)}/>`;
      o += `<path d="M ${xWin[0]} ${CU.velS} c 0 60 120 85 ${CU.tieW} 40 M ${K.W} ${CU.velS} c 0 60 -120 85 -${CU.tieW} 40" stroke-dasharray="${dash}" ${W(th)} fill="none"/>`;
    } else {
    o += `<line x1="${xWin[0]}" y1="${-30}" x2="${K.W}" y2="${-30}" stroke-dasharray="${dash}" ${W(th * 1.4)}/><line x1="${xZone[0] + 14}" y1="${WN.set + 60}" x2="${K.W}" y2="${WN.set + 60}" stroke-dasharray="${dash}" ${W(th * 2)}/>`;
    o += `<path d="M ${xZone[0] + 14} ${WN.set + 60} c 0 70 160 90 250 40 M ${K.W} ${WN.set + 60} c 0 70 -160 90 -250 40" stroke-dasharray="${dash}" ${W(th)} fill="none"/>`;
    }
    // the cornice above (dashed)
    o += `<line x1="0" y1="${BK.d + E.proj}" x2="${K.W}" y2="${BK.d + E.proj}" stroke-dasharray="${dash}" ${W(th)}/>`;
    return o;
  }

  // ═════════════ SHEETS ═════════════
  const defs = `<defs><pattern id="hatchW" patternUnits="userSpaceOnUse" width="40" height="40" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="40" stroke="#888" stroke-width="4"/></pattern><pattern id="hatchW2" patternUnits="userSpaceOnUse" width="22" height="22" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="22" stroke="#777" stroke-width="2.4"/></pattern></defs>`;
  const mono = (svg) => svg.replace(/#8a3a22/g, "#1b1b1b");
  const REV_FLAT = "1 — no arches (for comparison); counter shelf pushed back";

  function gaSheet(key, arched, dwg) {
    window.DK.begin(key);
    let s = frame() + defs;
    const sc = 20, vE = view(64, 32, sc, `Study wall elevation${arched ? " with arches" : ""}`), tE = vE.w(0.09);
    s += heading(18, 17, `ELEVATION — STUDY WALL${arched ? ", WITH THE ARCHES" : ", WITHOUT ARCHES"}`, `SCALE 1:${sc} · SEEN FROM THE ROOM · ${arched ? "CURTAINS NOT DRAWN" : "CURTAINS SHOWN TIED BACK"}`, 150);
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
      ER.add(vE.X(winC), vE.Y(ey(gW.ys + 150)), "WOOD ARCH SET IN FRONT OF THE WINDOW", "ITS CROWN 4 IN BELOW THE HEAD: THE WINDOW'S TOP RAIL NEVER SHOWS");
      ER.add(vE.X(winC - 300), vE.Y(ey(gW.ys + gW.rise - 40)), "3 DEEP NICHES IN ITS SOFFIT", "A FOCUS LIGHT IN EACH — SHEET 042");
    }
    ER.add(vE.X(xZone[0] + 200), vE.Y(ey(1700)), ...(arched ? ["CURTAINS NOT DRAWN — SEE THE CURTAINS PAGE", "VELVET + SHEER HANG INSIDE THE ARCH, ON HIDDEN TRACKS"] : ["RED VELVET, TIED BACK", "WHITE LINEN SHEER UNDER THE HEAD"]));
    ER.add(vE.X((xP2[0] + xP2[1]) / 2 + K.lamp.span), vE.Y(ey(K.lamp.y + 150)), "WALL LAMP ×2", "BRASS TWIN-ARM — OWNER'S PHOTO");
    ER.add(vE.X(xP2[0] + 60), vE.Y(ey(1000)), "FLUTED PILASTER ×2", "STANDS 10½ IN PROUD OF THE PANEL");
    ER.add(vE.X(xZone[1] - 300), vE.Y(ey(350)), "CUPBOARDS UNDER ALL THREE BAYS", "COUNTER = WINDOW SILL, 2 FT 3 IN");
    if (arched) {
      EL.add(vE.X(400), vE.Y(ey(gB.ys + 200)), "ARCH OVER THE BOOKCASE", "BOOKS STAND UNDER IT — OWNER'S PHOTO");
      EL.add(vE.X(gB.cx - 250), vE.Y(ey(gB.ys + gB.rise - 30)), "3 DEEP NICHES IN ITS SOFFIT", "A FOCUS LIGHT IN EACH — SHEET 042");
      EL.add(vE.X(1300), vE.Y(ey(yEnt - 60)), "SPANDREL MOULDINGS, CURVED TO THE ARCH", "");
    } else {
      EL.add(vE.X(BK.w / 2), vE.Y(ey((yBand + yEnt) / 2)), "BAND PANEL", "EVERY BAY");
      EL.add(vE.X(BK.w / 2), vE.Y(ey(yOpen - 13)), "FLAT HEAD", "");
    }
    EL.add(vE.X(400), vE.Y(ey(1300)), "OPEN SHELVES, 280 DEEP", arched ? "A STRIP LIGHT LET INTO EACH SHELF'S UNDERSIDE, 3000 K" : "");
    EL.add(vE.X(fa0 + 30), vE.Y(ey(fb0 + 200)), "3-STEP FRAME + BEAD ROW", "25 PROUD — OWNER'S PHOTO");
    EL.add(vE.X(pcx - 300), vE.Y(ey(pcy)), "OIL LANDSCAPE, GILT FRAME", "STAND-IN — THE OWNER CHOOSES");
    EL.add(vE.X(xPanel[0] + 300), vE.Y(ey(yTop + 60)), "PANEL AT THE WALL, PLAIN SKIRTING", "9 IN SHELF ON THE COUNTER — APPROVED");
    s += EL.draw() + ER.draw();

    // plan
    const scP = 20, vP = view(64, 213, scP, `Study wall plan${arched ? " with arches" : ""}`), tP = vP.w(0.09);
    s += heading(18, 186, "PLAN", `CUT AT 1200 · SCALE 1:${scP} · WALL AT THE TOP · OVERHEAD AND BELOW DASHED`, 150);
    s += vP.g(plan(tP, `${vP.w(0.9)} ${vP.w(0.6)}`, arched), 0.25);
    // where the three sections are cut (AST-DR-042/044), all looking along the wall to the right
    [[gB.cx, "A"], [pcx, "B"], [gW.cx, "C"]].forEach(([x, l]) => {
      const X = vP.X(x), y0 = vP.Y(-WN.wall) - 3, y1 = vP.Y(PL.d + PL.proj) + 3;
      s += `<line x1="${X}" y1="${f(y0)}" x2="${X}" y2="${f(y1)}" stroke="${INK}" stroke-width="0.3" stroke-dasharray="3 1 0.6 1"/>`;
      [y0, y1].forEach((y) => (s += `<path d="M ${X} ${f(y)} l 4 0 m -1.2 -1 l 1.2 1 l -1.2 1" stroke="${INK}" stroke-width="0.35" fill="none"/>` + text(X + 5, y + 0.9, l, { size: 2.4, weight: 700 })));
    });
    s += chainV([vP.Y(0), vP.Y(C.back), vP.Y(BK.d), vP.Y(PL.d + PL.proj)], vP.X(-150) - 3, [C.back, BK.d - C.back, PL.proj], { from: vP.X(0) - 1, size: 1.1 });
    s += chainH([vP.X(xPanel[0]), vP.X(fa0), vP.X(fa1), vP.X(xPanel[1])], vP.Y(PL.d + PL.proj) + 6, [C.inset, fa1 - fa0, C.inset], { from: vP.Y(PL.d) , size: 1.05 });
    const PLb = labels(vP.X(K.W) + 16, "right", 196, 238);
    PLb.add(vP.X(fa0 + 35), vP.Y(C.back + 12), "FRAME STILE, 70 × 25", "");
    PLb.add(vP.X(pcx), vP.Y(C.back + 30), "PAINTING", "");
    PLb.add(vP.X(xZone[0] + 300), vP.Y(arched ? K.curtain.velS : WN.set + 60), arched ? "CURTAIN TRACKS IN THE ARCH, OVERHEAD" : "CURTAIN RODS OVERHEAD", arched ? "NO RODS" : "");
    s += PLb.draw();

    // notes
    s += heading(18, 244, "NOTES", `REVISION ${K.rev.split(" ")[0]}`, 120);
    (arched ? [
      "Owner's second scheme (7 Oct). Arches over the bookcase and the window, three deep rectangular niches cut into each",
      "arch's underside — a focus light in each (8 Oct) — and spandrel mouldings curved to follow the arch. The window's glass is unchanged: the wood arch",
      "is a veneered panel set in front of the window's top: its crown sits 4 in below the head, so the window's top rail is hidden and only glass shows; both arches spring at one line. Curtains not drawn.",
      "Centre: the panel goes back to the wall plane, so the counter is a 9 in shelf and the pilasters stand 10½ in proud (approved).",
      "Mouldings, crown and lamp from the owner's photos. Sections: AST-DR-042. Details: AST-DR-043.",
    ] : [
      "The earlier flat-headed scheme, kept so the two can be compared. Band panels over all three bays; the window head unchanged.",
      "Centre: the panel goes back to the wall plane, so the counter is a 9 in shelf and the pilasters stand 10½ in proud (approved).",
      "Mouldings, crown and lamp from the owner's photos. The arched scheme is AST-DR-040.",
    ]).forEach((n, i) => (s += text(18, 254 + i * 4.3, n, { size: 1.42 })));
    s += titleBlock({ title: `STUDY WALL — ${arched ? "WITH ARCHES" : "WITHOUT ARCHES"}`, sub: "Elevation · Plan", date: K.date, rev: arched ? K.rev : REV_FLAT, dwg, scale: "1:20 @ A3" });
    window.DRAWINGS[key] = { title: `Study wall — ${arched ? "with arches" : "without arches"} · ${dwg}`, svg: mono(sheet(s)), params: SW2 };
  }

  // ═════════════ SECTIONS — all looking along the wall to the right; wall on the left, the room to the right ═════════════
  // local units: x = depth from the wall face (+ into the room), y UP from the floor (drawn with ey)
  const hatchCut = `fill="url(#hatchW2)"`, hatchWall = `fill="url(#hatchW)"`;
  const RS = (x0, y0, x1, y1, a = "") => R(x0, y0, x1, y1, a);
  // the crown in section, from the frieze plane `fx` (owner's photo: architrave, frieze, bed mould, dentils, cove, cyma)
  function crownSection(fx, th) {
    const pts = [[fx, yEnt], [fx + 12, yEnt], [fx + 12, yEnt + 14], [fx + 20, yEnt + 14], [fx + 20, yFr], [fx + 10, yFr], [fx + 10, yBed]];
    let d = `M ${pts.map(([x, y]) => `${f(x)} ${f(ey(y))}`).join(" L ")}`;
    d += ` C ${f(fx + 22)} ${f(ey(yBed + 4))} ${f(fx + 18)} ${f(ey(yDen - 6))} ${f(fx + 30)} ${f(ey(yDen))}`;          // bed mould, an ogee
    d += ` L ${f(fx + 42)} ${f(ey(yDen))} L ${f(fx + 42)} ${f(ey(yCove))}`;                                               // the dentil band
    d += ` C ${f(fx + 46)} ${f(ey(yCove + 26))} ${f(fx + 66)} ${f(ey(yCrn))} ${f(fx + 80)} ${f(ey(yCrn))}`;               // the cove
    d += ` C ${f(fx + 98)} ${f(ey(yCrn + 6))} ${f(fx + 96)} ${f(ey(yCrn + 40))} ${f(fx + E.proj - 4)} ${f(ey(yCrn + E.crown))}`;   // the cyma
    d += ` L ${f(fx + E.proj)} ${f(ey(yCrn + E.crown))} L ${f(fx + E.proj)} ${f(ey(K.H))} L 0 ${f(ey(K.H))} L 0 ${f(ey(yEnt))} Z`;
    let o = `<path d="${d}" ${hatchCut}/><path d="${d}" fill="none" ${W(th * 1.6)}/>`;
    o += `<line x1="${f(fx + 30)}" y1="${f(ey(yDen + 4))}" x2="${f(fx + 42)}" y2="${f(ey(yDen + 4))}" ${W(th * 0.6)}/>`;
    return o;
  }
  // the cupboard and counter, common to all three
  function baseSection(th) {
    let o = RS(18, 0, B.d - 30, B.plinth, `${hatchCut} ${W(th)}`) + RS(0, B.plinth, B.d, B.plinth + 18, `${hatchCut} ${W(th)}`);
    o += RS(0, B.plinth + 18, 9, B.h, `${hatchCut} ${W(th)}`) + RS(B.d - B.door, B.plinth + 20, B.d, B.h - 20, `${hatchCut} ${W(th * 1.2)}`);
    o += RS(18, 360, B.d - B.door - 6, 378, `${hatchCut} ${W(th)}`);
    // the counter: 40 thick, 280 deep, four reeds on its edge (as the desk)
    o += RS(0, B.h, B.d + B.over - 6, yTop, `${hatchCut} ${W(th * 1.4)}`);
    for (let i = 0; i < 4; i++) o += `<path d="M ${f(B.d + B.over - 6)} ${f(ey(B.h + 4 + i * 8))} a 4 4 0 0 0 0 ${f(-8)}" ${W(th)} fill="none"/>`;
    return o;
  }
  // a pilaster seen beyond (its side, the flutes' depth, capital and pedestal), behind whatever is cut
  function pilasterBeyond(th, from) {
    const t = th * 0.6;
    let o = RS(from, 0, PL.d + PL.ped + 25, B.h, `${W(t)}`) + RS(from, yTop, PL.d + PL.proj, yCap, `${W(t)}`) + RS(from, yCap, PL.d + PL.proj + 22, yEnt, `${W(t)}`);
    o += Ln(PL.d, yTop + 60, PL.d, yCap - 40, W(t)) + Ln(PL.d + PL.proj, yTop + 60, PL.d + PL.proj, yCap - 40, W(t));
    return o;
  }
  function floorCeil(xr) { return `<line x1="-330" y1="${ey(0)}" x2="${xr}" y2="${ey(0)}" stroke-width="12"/><line x1="-330" y1="${ey(K.H)}" x2="${xr}" y2="${ey(K.H)}" stroke-width="8"/>`; }

  // A–A, through the bookcase at the crown of its arch
  function secA(th, arched) {
    let o = RS(-230, 0, 0, K.H, `${hatchWall} ${W(th * 1.6)}`) + pilasterBeyond(th, 0) + baseSection(th);
    const headY = arched ? gB.ys + gB.rise : yOpen;
    o += RS(0, yTop, BK.back, headY, `${hatchCut} ${W(th)}`);
    BK.shelves.forEach((y) => (o += RS(BK.back, y - BK.st, BK.d - 5, y, `${hatchCut} ${W(th * 1.2)}`)));
    // a book on each shelf, seen from its end
    [yTop, ...BK.shelves].forEach((y, i) => { const h = i === BK.shelves.length ? 300 : (BK.shelves[i] - BK.st - y) * 0.8; o += RS(BK.back + 6, y, BK.back + 6 + 205, y + h, `fill="#fff" ${W(th * 0.6)}`); });
    o += Ln(BK.d, yTop, BK.d, arched ? gB.ys : yOpen, W(th * 0.6));                                                         // the stile beyond
    if (arched) {
      // the springing beyond, then the head at the crown, cut: ply soffit, the middle niche, the archivolt on the face
      o += RS(BK.d - 3, gB.ys - 34, BK.d + 6, gB.ys, `${W(th * 0.6)}`) + Ln(BK.back, gB.ys, BK.d, gB.ys, `${W(th * 0.6)} stroke-dasharray="30 18"`);
      const n0 = N.cB - N.wid / 2, n1 = N.cB + N.wid / 2;
      o += `<path d="M ${BK.back} ${f(ey(headY))} L ${f(n0)} ${f(ey(headY))} L ${f(n0)} ${f(ey(headY + N.depth))} L ${f(n1)} ${f(ey(headY + N.depth))} L ${f(n1)} ${f(ey(headY))} L ${BK.d} ${f(ey(headY))} L ${BK.d} ${f(ey(yEnt))} L 0 ${f(ey(yEnt))} L 0 ${f(ey(headY))} Z" ${hatchCut} ${W(th * 1.4)}/>`;
      o += `<path d="M ${f(n0 + 12)} ${f(ey(headY))} L ${f(n0 + 12)} ${f(ey(headY + N.depth - 12))} L ${f(n1 - 12)} ${f(ey(headY + N.depth - 12))} L ${f(n1 - 12)} ${f(ey(headY))}" ${W(th * 0.6)} fill="none"/>`;
      o += RS(BK.d, headY, BK.d + 18, headY + K.bkArch.mould, `${hatchCut} ${W(th * 1.2)}`) + Ln(BK.d + 18, headY + 16, BK.d + 10, headY + 16, W(th * 0.6));
    } else {
      o += RS(BK.back, yOpen, BK.d, yOpen + 22, `${hatchCut} ${W(th * 1.2)}`) + RS(BK.d - 18, yOpen, BK.d, yEnt, `${hatchCut} ${W(th * 1.2)}`) + RS(BK.d, yBand + 45, BK.d + 16, yEnt - 45, `${W(th)}`);
      o += RS(BK.back + 30, yOpen - 18, BK.d - 40, yOpen - 6, `${W(th * 0.8)}`);                                            // strip light
    }
    return o + crownSection(BK.d, th) + floorCeil(BK.d + 360);
  }
  // B–B, through the centre bay at the painting
  function secB(th) {
    let o = RS(-230, 0, 0, K.H, `${hatchWall} ${W(th * 1.6)}`) + pilasterBeyond(th, C.back) + baseSection(th);
    // the panel: 18 ply on 7 packers, up behind the header to the cornice; plain skirting on the counter
    o += RS(7, yTop, C.back, yEnt, `${hatchCut} ${W(th)}`);
    [900, 1450, 2000].forEach((y) => (o += RS(0, y, 7, y + 45, `${W(th * 0.6)}`)));
    o += `<path d="M ${C.back} ${f(ey(yTop))} L ${C.back + C.skirtT} ${f(ey(yTop))} L ${C.back + C.skirtT} ${f(ey(yTop + C.skirt - 8))} L ${C.back + C.skirtT - 8} ${f(ey(yTop + C.skirt))} L ${C.back} ${f(ey(yTop + C.skirt))} Z" ${hatchCut} ${W(th * 1.2)}/>`;
    // the frame's bottom and top rails, cut: three steps and the bead row
    const rail = (yo, s) => {   // yo = the rail's outer edge, s = +1 for the bottom rail (inner edge above), -1 for the top
      const u = (v) => yo + s * v, b = C.back;
      const pts = [[b, 0], [b + 10, 0], [b + 10, 8], [b + 17, 8], [b + 17, 16], [b + 25, 16], [b + 25, 30], [b + 19, 36], [b + 19, 52], [b + 12, 52], [b + 12, 62], [b, 70]];
      let q = `<path d="M ${pts.map(([x, v]) => `${f(x)} ${f(ey(u(v)))}`).join(" L ")} Z" ${hatchCut} ${W(th * 1.1)}/>`;
      q += `<circle cx="${f(b + 21)}" cy="${f(ey(u(44)))}" r="4" fill="#fff" ${W(th * 0.8)}/>`;
      return q;
    };
    o += rail(fb0, 1) + rail(fb1, -1);
    // the painting: gilt frame 50 deep standing off the panel, the canvas, the hanging cleat; the picture light
    const pf = (y0, y1) => RS(C.back + 5, y0, C.back + 5 + C.gilt, y1, `${hatchCut} ${W(th * 1.1)}`);
    const py0 = pcy - ph / 2, py1 = pcy + ph / 2;
    o += pf(py0, py0 + C.gilt) + pf(py1 - C.gilt, py1) + Ln(C.back + 35, py0 + C.gilt, C.back + 35, py1 - C.gilt, W(th * 0.8)) + RS(C.back, py1 - 120, C.back + 5, py1 - 60, `${W(th)}`);
    o += RS(C.back, py1 + 60, C.back + 12, py1 + 100, `${W(th)}`) + Ln(C.back + 12, py1 + 80, C.back + 120, py1 + 80, W(th * 1.4)) + RS(C.back + 100, py1 + 70, C.back + 180, py1 + 92, `fill="#fff" ${W(th)}`);
    // the header at the cornice plane: soffit and front board, the band panel on its face
    o += RS(C.back, yOpen, BK.d, yOpen + 18, `${hatchCut} ${W(th * 1.2)}`) + RS(BK.d - 18, yOpen, BK.d, yEnt, `${hatchCut} ${W(th * 1.2)}`);
    o += `<path d="M ${BK.d} ${f(ey(yBand + 45))} L ${BK.d + 10} ${f(ey(yBand + 55))} L ${BK.d + 16} ${f(ey(yBand + 85))} L ${BK.d + 16} ${f(ey(yEnt - 85))} L ${BK.d + 10} ${f(ey(yEnt - 55))} L ${BK.d} ${f(ey(yEnt - 45))}" ${W(th)} fill="none"/>`;
    return o + crownSection(BK.d, th) + floorCeil(BK.d + 360);
  }
  // C–C, through the window at the crown of its arch
  function secC(th, arched) {
    const fi = WN.glass + WN.frameD / 2, fo = WN.glass - WN.frameD / 2;    // the frame's inside and outside faces
    let o = RS(-230, 0, 0, WN.sill, `${hatchWall} ${W(th * 1.6)}`) + RS(-230, WN.head, 0, K.H, `${hatchWall} ${W(th * 1.6)}`);
    o += baseSection(th);
    // the window frame: sill and head members cut, the meeting stiles beyond, the glass
    o += RS(fo, WN.sill, fi, WN.sill + 45, `${hatchCut} ${W(th * 1.2)}`) + RS(fo, WN.head - 45, fi, WN.head, `${hatchCut} ${W(th * 1.2)}`);
    o += RS(fo + 10, WN.sill + 45, fi - 10, WN.head - 45, `${W(th * 0.5)}`) + Ln(WN.glass, WN.sill + 45, WN.glass, WN.head - 45, W(th * 1.4));
    o += RS(fi, WN.sill - 16, 0, WN.sill, `${hatchCut} ${W(th)}`);                                                        // the reveal sill, on to the counter
    o += Ln(fi, WN.sill, fi, arched ? gW.ys : WN.head, W(th * 0.6)) + Ln(WN.set, yTop, WN.set, arched ? gW.ys : WN.head, W(th * 0.6));   // the reveal lining beyond
    if (arched) {
      // the veneered panel under the arch, set flush with the frame's inside face; the head, cut at the crown; the middle niche
      o += RS(fi, gW.ys, fi + 18, WN.head, `${hatchCut} ${W(th * 1.2)}`) + Ln(fi, gW.ys, WN.set, gW.ys, `${W(th * 0.6)} stroke-dasharray="30 18"`);
      o += RS(fi, WN.head, 0, WN.head + 18, `${hatchCut} ${W(th)}`);                                                       // soffit lining under the brick lintel
      const n0 = N.cW - N.wid / 2, n1 = N.cW + N.wid / 2, hy = WN.head;
      o += `<path d="M 0 ${f(ey(hy))} L ${f(n0)} ${f(ey(hy))} L ${f(n0)} ${f(ey(hy + N.depth))} L ${f(n1)} ${f(ey(hy + N.depth))} L ${f(n1)} ${f(ey(hy))} L ${WN.set} ${f(ey(hy))} L ${WN.set} ${f(ey(yEnt))} L 0 ${f(ey(yEnt))} Z" ${hatchCut} ${W(th * 1.4)}/>`;
      o += `<path d="M ${f(n0 + 12)} ${f(ey(hy))} L ${f(n0 + 12)} ${f(ey(hy + N.depth - 12))} L ${f(n1 - 12)} ${f(ey(hy + N.depth - 12))} L ${f(n1 - 12)} ${f(ey(hy))}" ${W(th * 0.6)} fill="none"/>`;
      o += RS(WN.set, hy, WN.set + 18, hy + K.winArch.mould, `${hatchCut} ${W(th * 1.2)}`);
    } else {
      o += RS(fi, WN.head, WN.set, WN.head + 18, `${hatchCut} ${W(th)}`) + RS(0, WN.head + 18, WN.set, yEnt, `${hatchCut} ${W(th * 1.2)}`) + RS(WN.set, WN.head, WN.set + 18, WN.head + WN.arch, `${hatchCut} ${W(th)}`);
    }
    if (arched && false) {
      // both in the arch (owner, 8 Oct), cut here at the crown: the sheer on a slim track on the lining, the velvet on a
      // track let into the soffit, 22 off the wall behind the niche — tied back beyond. No rods.
      const CU = K.curtain, hc = WN.head;
      o += `<rect x="${CU.sheerS - 8}" y="${f(ey(hc))}" width="16" height="10" fill="#fff" ${W(th)}/><path d="M ${CU.sheerS} ${f(ey(hc - 10))} C ${CU.sheerS + 15} ${f(ey(1700))} ${CU.sheerS - 15} ${f(ey(1200))} ${CU.sheerS} ${f(ey(WN.sill + 20))}" ${W(th * 0.6)} fill="none"/>`;
      o += `<rect x="${CU.velS - 10}" y="${f(ey(hc + 22))}" width="20" height="22" fill="#fff" ${W(th * 1.2)}/><path d="M ${CU.velS} ${f(ey(hc))} C ${CU.velS - 10} ${f(ey(1700))} ${CU.velS + 60} ${f(ey(1400))} ${CU.velS + 44} ${f(ey(CU.tie))} C ${CU.velS + 20} ${f(ey(1000))} ${CU.velS + 50} ${f(ey(800))} ${CU.velS + 30} ${f(ey(yTop + 15))}" ${W(th * 0.6)} stroke-dasharray="40 20" fill="none"/>`;
      return o + crownSection(WN.set, th) + floorCeil(WN.set + 400);
    }
    // curtains: the sheer on its rod in the reveal; the red rod in front on a bracket, the red tied back beyond
    const sy = WN.head - 20;
    o += `<circle cx="-30" cy="${f(ey(sy))}" r="9" fill="#fff" ${W(th)}/><path d="M -30 ${f(ey(sy))} C -10 ${f(ey(1700))} -50 ${f(ey(1200))} -28 ${f(ey(WN.sill + 20))}" ${W(th * 0.6)} fill="none"/>`;
    const rx = WN.set + 60, ry = K.curtain.rod;
    o += Ln(WN.set + 18, ry, rx, ry, W(th * 1.6)) + `<circle cx="${rx}" cy="${f(ey(ry))}" r="16" fill="#fff" ${W(th * 1.2)}/>`;
    o += `<path d="M ${rx - 20} ${f(ey(ry - 20))} C ${rx - 30} ${f(ey(1700))} ${rx + 30} ${f(ey(1400))} ${rx} ${f(ey(K.curtain.tie))} C ${rx - 20} ${f(ey(1000))} ${rx + 20} ${f(ey(800))} ${rx} ${f(ey(yTop + 15))}" ${W(th * 0.6)} stroke-dasharray="40 20" fill="none"/>`;
    return o + crownSection(WN.set, th) + floorCeil(WN.set + 400);
  }

  function sectionSheet(key, arched, dwg) {
    window.DK.begin(key);
    let s = frame() + defs;
    const sc = 15, top = 34, T = (v) => v.w(0.09);
    const vA = view(52, top, sc, `Section A-A${arched ? " arch" : ""}`), vB = view(178, top, sc, "Section B-B"), vC = view(306, top, sc, `Section C-C${arched ? " arch" : ""}`);
    s += heading(18, 17, "SECTION A–A", `THROUGH THE BOOKCASE${arched ? " AT THE ARCH'S CROWN" : ""} · 1:${sc}`, 100);
    s += heading(144, 17, "SECTION B–B", `THROUGH THE CENTRE BAY AND PAINTING · 1:${sc}`, 100);
    s += heading(272, 17, "SECTION C–C", `THROUGH THE WINDOW${arched ? " AT THE ARCH'S CROWN" : ""} · 1:${sc}`, 100);
    s += vA.g(secA(T(vA), arched), 0.25) + vB.g(secB(T(vB)), 0.25) + vC.g(secC(T(vC), arched), 0.25);
    const Y = (v, y) => v.Y(ey(y));
    // A — heights and depths
    const hA = arched ? [0, B.h, yTop, gB.ys, gB.ys + gB.rise, gB.ys + gB.rise + N.depth, yEnt, K.H] : [0, B.h, yTop, yOpen, yEnt, K.H];
    const lA = arched ? [B.h, B.top, gB.ys - yTop, gB.rise, N.depth, yEnt - gB.ys - gB.rise - N.depth, entH] : [B.h, B.top, yOpen - yTop, yEnt - yOpen, entH];
    s += chainV(hA.map((y) => Y(vA, y)), vA.X(-230) - 3, lA, { from: vA.X(-230), size: 1.0 });
    s += chainH([vA.X(0), vA.X(BK.d), vA.X(BK.d + E.proj)], Y(vA, 0) + 5, [BK.d, E.proj], { from: Y(vA, 0) + 1, size: 1.05 });
    if (arched) s += chainH([vA.X(N.cB - N.wid / 2), vA.X(N.cB + N.wid / 2)], Y(vA, gB.ys + gB.rise) + 4, [`${N.wid} NICHE`], { from: Y(vA, gB.ys + gB.rise) + 0.5, size: 1.0 });
    const LA = labels(vA.X(BK.d + E.proj) + 12, "right", 26, 214);
    LA.add(vA.X(BK.d + 60), Y(vA, yCrn + 20), "SMALLER DENTIL CROWN", "120 PROUD");
    if (arched) {
      LA.add(vA.X(N.cB), Y(vA, gB.ys + gB.rise + N.depth - 30), "NICHE IN THE SOFFIT", `${N.len} × ${N.wid}, ${N.depth} DEEP`);
      LA.add(vA.X(BK.d + 10), Y(vA, gB.ys + gB.rise + 20), "ARCHIVOLT ON THE FACE", "");
      LA.add(vA.X(BK.d), Y(vA, gB.ys - 17), "SPRINGING (BEYOND)", "IMPOST BLOCK");
    } else LA.add(vA.X(BK.d - 9), Y(vA, yBand), "FLAT HEAD + BAND PANEL", "");
    LA.add(vA.X(150), Y(vA, BK.shelves[1] - 12), "SHELVES 25, 262 CLEAR", "BACK 18");
    LA.add(vA.X(BK.d + 30), Y(vA, 1500), "PILASTER BEYOND", "");
    LA.add(vA.X(B.d + 10), Y(vA, B.h + 20), "COUNTER, 40, REEDED EDGE", "");
    LA.add(vA.X(B.d - 11), Y(vA, 450), "CUPBOARD DOOR 22", "PLINTH SET BACK 30");
    s += LA.draw();
    // B
    s += chainV([0, B.h, yTop, yTop + C.skirt, fb0, fb1, yOpen, yEnt, K.H].map((y) => Y(vB, y)), vB.X(-230) - 3, [B.h, B.top, C.skirt, fb0 - yTop - C.skirt, fb1 - fb0, yOpen - fb1, yEnt - yOpen, entH], { from: vB.X(-230), size: 1.0 });
    s += chainH([vB.X(0), vB.X(B.d + B.over)], Y(vB, 0) + 5, [B.d + B.over], { from: Y(vB, 0) + 1, size: 1.05 });
    s += chainH([vB.X(C.back + C.frameP), vB.X(B.d + B.over)], Y(vB, yTop) - 3, [`${B.d + B.over - C.back - C.frameP} CLEAR`], { from: Y(vB, yTop), size: 0.95 });
    const LB = labels(vB.X(BK.d + E.proj) + 12, "right", 26, 214);
    LB.add(vB.X(BK.d - 9), Y(vB, yBand + 150), "HEADER AT THE CORNICE PLANE", "BAND PANEL ON ITS FACE");
    LB.add(vB.X(C.back + 140), Y(vB, pcy + ph / 2 + 81), "PICTURE LIGHT", "");
    LB.add(vB.X(C.back + 30), Y(vB, fb1 - 40), "FRAME RAIL: 3 STEPS + BEAD", "25 PROUD · DETAIL 043");
    LB.add(vB.X(C.back + 30), Y(vB, pcy + 200), "PAINTING, GILT FRAME 50", "ON A CLEAT");
    LB.add(vB.X(16), Y(vB, 1300), "PANEL 18 ON 7 PACKERS", "25 OFF THE WALL");
    LB.add(vB.X(C.back + 10), Y(vB, yTop + 60), "PLAIN SKIRTING 120 × 20", "");
    s += LB.draw();
    // C
    const fi = WN.glass + WN.frameD / 2;
    const hC = arched ? [0, WN.sill, gW.ys, WN.head, WN.head + N.depth, yEnt, K.H] : [0, WN.sill, WN.head, yEnt, K.H];
    const lC = arched ? [WN.sill, gW.ys - WN.sill, K.winArch.rise, N.depth, yEnt - WN.head - N.depth, entH] : [WN.sill, WN.head - WN.sill, yEnt - WN.head, entH];
    s += chainV(hC.map((y) => Y(vC, y)), vC.X(-230) - 3, lC, { from: vC.X(-230), size: 1.0 });
    s += chainH([vC.X(WN.glass), vC.X(fi), vC.X(0), vC.X(WN.set)], Y(vC, 0) + 5, ["", "", WN.set], { from: Y(vC, 0) + 1, size: 1.0 });
    s += chainH([vC.X(fi), vC.X(WN.set)], Y(vC, 0) + 10, [`${WN.set - fi} REVEAL`], { from: Y(vC, 0) + 1, size: 1.0 });
    const LC = labels(vC.X(WN.set + 400) + 8, "right", 26, 214);
    LC.add(vC.X(WN.set + 70), Y(vC, yCrn + 20), "CROWN", "");
    if (arched) {
      LC.add(vC.X(N.cW), Y(vC, WN.head + N.depth - 30), "NICHE IN THE SOFFIT", "CLEAR OF THE BRICK LINTEL");
      LC.add(vC.X(fi + 9), Y(vC, gW.ys + 150), "PANEL ABOVE THE ARCH'S CURVE, IN FRONT", "HIDES THE WINDOW'S TOP RAIL — ONLY GLASS SHOWS");
      LC.add(vC.X(WN.set + 9), Y(vC, WN.head + 30), "ARCHIVOLT", "");
    }
    if (arched) {
      LC.add(vC.X(WN.glass), Y(vC, gW.ys + 120), "THE ARCH: A PANEL IN FRONT OF THE WINDOW", "THE FRAME AND GLASS UNTOUCHED BEHIND IT");
    } else {
      LC.add(vC.X(WN.set + 60), Y(vC, K.curtain.rod), "RED VELVET ON A BRASS ROD", "TIED BACK, BEYOND");
      LC.add(vC.X(-30), Y(vC, WN.head - 10), "LINEN SHEER ROD", "IN THE REVEAL");
    }
    LC.add(vC.X(WN.glass), Y(vC, 1400), "WINDOW, GLASS UNCHANGED", "");
    LC.add(vC.X(-40), Y(vC, WN.sill - 8), "REVEAL SILL ON TO THE COUNTER", "");
    s += LC.draw();
    s += heading(18, 238, "NOTES", `REVISION ${K.rev.split(" ")[0]}`, 120);
    [arched ? "All three cut looking along the wall to the right (cut lines on AST-DR-040's plan). Each arch's head is a ply former, veneered;"
            : "All three cut looking along the wall to the right (cut lines on AST-DR-041's plan).",
     arched ? "its three niches are boxes let into it, 90 deep, lined in the same veneer, a small focus light (3000 K) in the middle of each. The window's niches stay in the timber,"
            : "The flat bookcase head carries a strip light under it and the band panel above.",
     arched ? "in front of the brick lintel. The window bay's panelling now runs at 280 like the rest, so the crown is one plane and the reveal 14 in."
            : "The window bay's panelling runs at 280 like the rest, so the crown is one plane and the reveal is 14 in.",
     "Centre: panel at the wall plane, header at the cornice plane — the counter becomes a 9 in shelf under it. Details: AST-DR-043."]
      .forEach((n, i) => (s += text(18, 248 + i * 4.3, n, { size: 1.42 })));
    s += titleBlock({ title: `STUDY WALL — SECTIONS${arched ? "" : " (NO ARCHES)"}`, sub: "A–A bookcase · B–B centre · C–C window", date: K.date, rev: arched ? K.rev : REV_FLAT, dwg, scale: "1:15 @ A3" });
    window.DRAWINGS[key] = { title: `Study wall — sections${arched ? "" : " (no arches)"} · ${dwg}`, svg: mono(sheet(s)), params: SW2 };
  }

  gaSheet("studywall-arch", true, "AST-DR-040");
  gaSheet("studywall-flat", false, "AST-DR-041");
  sectionSheet("studywall-arch-sections", true, "AST-DR-042");
  sectionSheet("studywall-flat-sections", false, "AST-DR-044");

  // ═════════════ DETAILS — AST-DR-043 ═════════════
  function detailsSheet(key, dwg) {
    window.DK.begin(key);
    let s = frame() + defs;
    const dash = (v) => `${v.w(0.8)} ${v.w(0.5)}`;

    // 1 + 2 — each arch's underside as seen looking up, unrolled flat: the three niches
    const soffit = (g, d0, d1, c, ox, oy, sc, name, extra) => {
      const v = view(ox, oy, sc, name), th = v.w(0.09), L = 2 * g.th * g.R, nn = niches(g).map(([a0, a1]) => [(a0 + g.th) * g.R, (a1 + g.th) * g.R]);
      let o = `<rect x="0" y="${d0}" width="${f(L)}" height="${d1 - d0}" ${W(th * 1.4)}/>`;
      nn.forEach(([u0]) => (o += `<rect x="${f(u0)}" y="${c - N.wid / 2}" width="${N.len}" height="${N.wid}" ${W(th * 1.4)}/><rect x="${f(u0 + 12)}" y="${c - N.wid / 2 + 12}" width="${N.len - 24}" height="${N.wid - 24}" ${W(th * 0.6)}/>` +
        [[0, 0], [1, 0], [0, 1], [1, 1]].map(([i, j]) => `<line x1="${f(u0 + i * N.len)}" y1="${f(c - N.wid / 2 + j * N.wid)}" x2="${f(u0 + 12 + i * (N.len - 24))}" y2="${f(c - N.wid / 2 + 12 + j * (N.wid - 24))}" ${W(th * 0.6)}/>`).join("")));
      nn.forEach(([u0]) => { const cx = u0 + N.len / 2;                       // the focus light in the middle of each (owner, 8 Oct)
        o += `<circle cx="${f(cx)}" cy="${c}" r="26" fill="#fff" ${W(th)}/><circle cx="${f(cx)}" cy="${c}" r="16" ${W(th * 0.6)} fill="none"/><path d="M ${f(cx - 11)} ${c - 11} L ${f(cx + 11)} ${c + 11} M ${f(cx - 11)} ${c + 11} L ${f(cx + 11)} ${c - 11}" ${W(th * 0.5)}/>`; });
      o += `<line x1="0" y1="${d1 + 18}" x2="${f(L)}" y2="${d1 + 18}" ${W(th * 0.8)}/>` + extra(th, L);
      s += v.g(o, 0.25);
      s += chainH([v.X(0), ...nn.flatMap(([u0, u1]) => [v.X(u0), v.X(u1)]), v.X(L)], v.Y(d1 + 18) + 5, [Math.round(nn[0][0]), N.len, Math.round(nn[1][0] - nn[0][1]), N.len, Math.round(nn[2][0] - nn[1][1]), N.len, Math.round(L - nn[2][1])], { from: v.Y(d1 + 18) + 1, size: 1.0 });
      s += chainH([v.X(0), v.X(L)], v.Y(d1 + 18) + 10, [`${Math.round(L)} ROUND THE CURVE, SPRINGING TO SPRINGING`], { from: v.Y(d1 + 18) + 1, size: 1.05 });
      s += chainV([v.Y(d0), v.Y(c - N.wid / 2), v.Y(c + N.wid / 2), v.Y(d1)], v.X(L) + 4, [c - N.wid / 2 - d0, N.wid, d1 - c - N.wid / 2], { from: v.X(L) + 0.5, size: 1.0 });
      return v;
    };
    s += heading(18, 17, "1 · BOOKCASE ARCH — ITS UNDERSIDE", "LOOKING UP, UNROLLED FLAT · 1:12 · WALL AT THE TOP, ROOM BELOW", 140);
    soffit(gB, BK.back, BK.d, N.cB, 22, 32, 12, "Bookcase soffit unrolled", () => "");
    s += text(22 + 780 / 12, 32 + (BK.d + 14) / 12, "ARCHIVOLT ON THE FACE (18 PROUD)", { size: 1.2, fill: THIN, anchor: "middle" });
    s += heading(222, 17, "2 · WINDOW ARCH — ITS UNDERSIDE", "LOOKING UP, UNROLLED FLAT · 1:12", 120);
    soffit(gW, WN.glass + WN.frameD / 2 + 18, WN.set, N.cW, 226, 32, 12, "Window soffit unrolled", (th, L) => `<line x1="0" y1="0" x2="${f(L)}" y2="0" stroke-dasharray="40 24" ${W(th)}/>` +
      `<line x1="0" y1="${K.curtain.sheerS}" x2="${f(L)}" y2="${K.curtain.sheerS}" ${W(th * 1.6)}/><rect x="0" y="${K.curtain.velS - 10}" width="${f(L)}" height="20" fill="#fff" ${W(th * 1.2)}/>`);
    s += text(226 + 700 / 12, 32 + 300 / 12, "CURTAIN TRACKS: SHEER (SLIM, ON THE LINING) · VELVET (LET IN, 20 SLOT) — BOTH BENT TO THE ARCH", { size: 1.1, fill: THIN, anchor: "middle" });
    s += text(226 + 700 / 12, 32 - 14 / 12, "BRICK LINTEL ON THE WALL SIDE OF THE DASHED LINE — LINING ONLY", { size: 1.2, fill: THIN, anchor: "middle" });

    // 3 — a niche in section, across the soffit at the crown (bookcase)
    s += heading(18, 82, "3 · A NICHE IN SECTION", "ACROSS THE SOFFIT AT THE CROWN · 1:5", 70);
    {
      const sc = 5, v = view(30, 92 + 150 / sc, sc, "Niche section"), th = v.w(0.09), hd = yEnt - gB.ys - gB.rise;
      const n0 = N.cB - N.wid / 2, n1 = N.cB + N.wid / 2, Y = (y) => -y;   // y up from the soffit
      let o = `<rect x="-60" y="${Y(hd + 20)}" width="60" height="${hd + 40}" fill="url(#hatchW)" stroke="none"/><line x1="0" y1="${Y(-20)}" x2="0" y2="${Y(hd + 20)}" ${W(th * 2)}/>`;
      o += `<rect x="0" y="${Y(hd + 20)}" width="${BK.back}" height="${hd + 40}" fill="url(#hatchW2)" ${W(th)}/>`;
      o += `<rect x="${BK.back}" y="${Y(18)}" width="${n0 - BK.back}" height="18" fill="url(#hatchW2)" ${W(th * 1.2)}/><rect x="${n1}" y="${Y(18)}" width="${BK.d - n1}" height="18" fill="url(#hatchW2)" ${W(th * 1.2)}/>`;
      [6, 12].forEach((d) => (o += `<line x1="${BK.back}" y1="${Y(d)}" x2="${n0}" y2="${Y(d)}" ${W(th * 0.4)}/><line x1="${n1}" y1="${Y(d)}" x2="${BK.d}" y2="${Y(d)}" ${W(th * 0.4)}/>`));
      o += `<path d="M ${n0} ${Y(0)} L ${n0} ${Y(N.depth + 12)} L ${n1} ${Y(N.depth + 12)} L ${n1} ${Y(0)} L ${n1 - 12} ${Y(0)} L ${n1 - 12} ${Y(N.depth)} L ${n0 + 12} ${Y(N.depth)} L ${n0 + 12} ${Y(0)} Z" fill="url(#hatchW2)" ${W(th * 1.2)}/>`;
      o += `<path d="M ${n0 + 13} ${Y(0)} L ${n0 + 13} ${Y(N.depth - 1)} L ${n1 - 13} ${Y(N.depth - 1)} L ${n1 - 13} ${Y(0)}" ${W(th * 0.4)} fill="none"/>`;
      o += `<rect x="${BK.back + 10}" y="${Y(hd - 2)}" width="${BK.d - BK.back - 36}" height="${hd - 22}" stroke-dasharray="${dash(v)}" ${W(th * 0.7)}/>`;
      o += `<rect x="${BK.d - 18}" y="${Y(hd)}" width="18" height="${hd}" fill="url(#hatchW2)" ${W(th * 1.2)}/>`;
      o += `<path d="M ${BK.d} ${Y(0)} L ${BK.d + 18} ${Y(0)} L ${BK.d + 18} ${Y(16)} L ${BK.d + 10} ${Y(16)} L ${BK.d + 10} ${Y(30)} L ${BK.d + 6} ${Y(K.bkArch.mould)} L ${BK.d} ${Y(K.bkArch.mould)} Z" fill="url(#hatchW2)" ${W(th * 1.2)}/>`;
      o += `<line x1="-60" y1="${Y(hd)}" x2="${BK.d + 60}" y2="${Y(hd)}" ${W(th)} stroke-dasharray="${dash(v)}"/>`;
      { const lc = (n0 + n1) / 2;                                                   // the focus light, recessed in the niche's top
        o += `<rect x="${lc - 20}" y="${Y(N.depth + 62)}" width="40" height="50" fill="#fff" ${W(th)}/><rect x="${lc - 26}" y="${Y(N.depth + 2)}" width="52" height="4" fill="#000" ${W(th * 0.5)}/>`;
        o += `<path d="M ${lc - 8} ${Y(N.depth - 2)} L ${lc - 40} ${Y(-40)} M ${lc + 8} ${Y(N.depth - 2)} L ${lc + 40} ${Y(-40)}" stroke-dasharray="${dash(v)}" ${W(th * 0.5)} fill="none"/>`; }
      s += v.g(o, 0.25);
      s += chainH([v.X(BK.back), v.X(n0), v.X(n1), v.X(BK.d)], v.Y(0) + 5, [n0 - BK.back, N.wid, BK.d - n1], { from: v.Y(0) + 0.5, size: 1.05 });
      s += chainV([v.Y(0), v.Y(-N.depth), v.Y(-hd)], v.X(BK.d + 18) + 4, [N.depth, hd - N.depth], { from: v.X(BK.d + 18) + 0.5, size: 1.05 });
      const L3 = labels(v.X(BK.d + 18) + 18, "right", 90, 150);
      L3.add(v.X((n0 + n1) / 2 + 20), v.Y(-N.depth - 40), "FOCUS LIGHT, 3000 K, 52 TRIM", "ONE IN THE MIDDLE OF EACH NICHE");
      L3.add(v.X((n0 + n1) / 2), v.Y(-N.depth + 6), "NICHE BOX, 12 PLY", "LINED IN THE SAME VENEER");
      L3.add(v.X(BK.back + 30), v.Y(-9), "BENT PLY SOFFIT, 3 × 6", "ON CURVED RIBS (DASHED)");
      L3.add(v.X(BK.d + 9), v.Y(-20), "ARCHIVOLT", "");
      L3.add(v.X(BK.d - 9), v.Y(-hd + 30), "VENEERED FACE", "");
      L3.add(v.X(-30), v.Y(-hd + 10), "CORNICE ABOVE", "");
      s += L3.draw();
    }

    // 4 — the crown, full profile, 1:5
    s += heading(132, 82, "4 · THE CROWN", "SECTION · 1:5 · OWNER'S PHOTO", 60);
    {
      const sc = 5, v = view(140 - BK.d / sc, 94 - ey(K.H) / sc, sc, "Crown section"), th = v.w(0.09);
      s += v.g(`<clipPath id="clipCr"><rect x="${BK.d - 30}" y="${ey(K.H) - 10}" width="${E.proj + 60}" height="${entH + 30}"/></clipPath><g clip-path="url(#clipCr)">${crownSection(BK.d, th)}</g>`, 0.25);
      const xr = v.X(BK.d + E.proj) + 4;
      s += chainV([K.H, K.H - E.fillet, yCrn, yCove, yDen, yBed, yFr, yEnt].map((y) => v.Y(ey(y))), xr, [E.fillet, E.crown, E.cove, E.dentil, E.bed, E.frieze, E.arch], { from: xr - 3, size: 1.0 });
      s += chainH([v.X(BK.d), v.X(BK.d + 20), v.X(BK.d + 42), v.X(BK.d + E.proj)], v.Y(ey(K.H)) - 3, [20, 22, E.proj - 42], { from: v.Y(ey(K.H)) - 0.5, size: 1.0 });
      const L4 = labels(xr + 12, "right", 90, 156);
      L4.add(v.X(BK.d + 100), v.Y(ey(yCrn + 25)), "CYMA", "");
      L4.add(v.X(BK.d + 60), v.Y(ey(yCove + 18)), "COVE", "");
      L4.add(v.X(BK.d + 36), v.Y(ey(yDen + 11)), "DENTILS 12 × 16", "AT 20 CENTRES");
      L4.add(v.X(BK.d + 20), v.Y(ey(yBed + 12)), "BED MOULD", "");
      L4.add(v.X(BK.d + 10), v.Y(ey(yFr + 60)), "PLAIN FRIEZE", "");
      L4.add(v.X(BK.d + 16), v.Y(ey(yEnt + 20)), "STEPPED ARCHITRAVE", "");
      s += L4.draw();
    }

    // 5 — the frame round the painting: section and face, 1:2
    s += heading(232, 82, "5 · THE PAINTING FRAME", "SECTION + FACE · 1:2 · BEAD ROW, OWNER'S PHOTO", 80);
    {
      const sc = 2, v = view(238, 98, sc, "Frame moulding"), th = v.w(0.1);
      const pts = [[0, 0], [10, 0], [10, 8], [17, 8], [17, 16], [25, 16], [25, 30], [19, 36], [19, 52], [12, 52], [12, 62], [0, 70]];
      let o = `<rect x="-20" y="-6" width="20" height="82" fill="url(#hatchW2)" ${W(th)}/><path d="M ${pts.map(([x, y]) => `${x} ${y}`).join(" L ")} Z" fill="url(#hatchW2)" ${W(th * 1.4)}/><circle cx="21" cy="44" r="4" fill="#fff" ${W(th)}/>`;
      const fx = 60;
      o += `<rect x="${fx}" y="0" width="84" height="70" ${W(th * 1.2)}/>` + [8, 16, 36, 52, 62].map((y) => `<line x1="${fx}" y1="${y}" x2="${fx + 84}" y2="${y}" ${W(th * 0.6)}/>`).join("");
      for (let x = fx + 7; x < fx + 84; x += C.beadPitch) o += `<circle cx="${x}" cy="44" r="4" ${W(th * 0.8)}/>`;
      s += v.g(o, 0.25);
      s += chainV([v.Y(0), v.Y(70)], v.X(-20) - 3, [70], { from: v.X(-20), size: 1.05 });
      s += chainH([v.X(0), v.X(10), v.X(17), v.X(25)], v.Y(70) + 4, [10, 7, 8], { from: v.Y(70), size: 0.95 });
      s += chainH([v.X(fx + 7), v.X(fx + 21)], v.Y(70) + 4, [C.beadPitch], { from: v.Y(44) + 2, size: 0.95 });
      s += note(v.X(21), v.Y(44), v.X(fx - 5), v.Y(90), "BEAD Ø8", "CARVED IN THE SOLID", "end");
      s += text(v.X(fx), v.Y(-6), "FACE", { size: 1.3, fill: THIN });
      s += text(v.X(-20), v.Y(-6), "SECTION", { size: 1.3, fill: THIN });
    }

    // 6 — skirting and counter edge, 1:2
    s += heading(18, 168, "6 · SKIRTING + COUNTER", "SECTION · 1:4", 80);
    {
      const sc = 4, v = view(33, 180 + 170 / sc, sc, "Skirting and counter"), th = v.w(0.1), Y = (y) => -y;
      let o = `<rect x="-14" y="${Y(170)}" width="14" height="170" fill="url(#hatchW)" stroke="none"/>`;
      o += `<rect x="0" y="${Y(160)}" width="18" height="120" fill="url(#hatchW2)" ${W(th)}/>`;
      o += `<path d="M 18 ${Y(40)} L 38 ${Y(40)} L 38 ${Y(152)} L 30 ${Y(160)} L 18 ${Y(160)} Z" fill="url(#hatchW2)" ${W(th * 1.4)}/>`;
      let reeds = ""; for (let i = 0; i < 4; i++) reeds += ` A 4 4 0 0 0 ${B.d + B.over - 6} ${Y(4 + (i + 1) * 8)}`;
      o += `<path d="M -14 ${Y(0)} L ${B.d + B.over - 6} ${Y(0)} L ${B.d + B.over - 6} ${Y(4)}${reeds} L ${B.d + B.over - 6} ${Y(40)} L -14 ${Y(40)} Z" fill="url(#hatchW2)" ${W(th * 1.4)}/>`;
      s += v.g(`<clipPath id="clipSk"><rect x="-14" y="${Y(170)}" width="120" height="175"/><rect x="${B.d + B.over - 80}" y="${Y(60)}" width="90" height="65"/></clipPath><g clip-path="url(#clipSk)">${o}</g><path d="M 106 ${Y(50)} l 5 30 l -5 30 M ${B.d + B.over - 80} ${Y(50)} l 5 30 l -5 30" ${W(th * 0.6)} fill="none"/>`, 0.25);
      s += chainV([v.Y(-40), v.Y(-160)], v.X(38) + 4, [120], { from: v.X(38) + 0.5, size: 1.0 });
      s += chainH([v.X(18), v.X(38)], v.Y(-160) - 3, [20], { from: v.Y(-160) - 0.5, size: 0.95 });
      s += chainV([v.Y(0), v.Y(-40)], v.X(B.d + B.over - 6) + 4, [40], { from: v.X(B.d + B.over - 6) + 0.5, size: 0.95 });
      s += note(v.X(28), v.Y(-120), v.X(70), v.Y(-150), "PLAIN SKIRTING", "120 × 20, 8 CHAMFER");
      s += note(v.X(B.d + B.over - 6), v.Y(-20), v.X(B.d + B.over - 6), v.Y(-75), "COUNTER 40, 4 REEDS × 8", "AS THE DESK", "end");
    }

    // 7 — the spandrel moulding, section 1:2
    s += heading(340, 82, "7 · SPANDREL MOULDING", "SECTION · 1:2", 60);
    {
      const sc = 2, v = view(352, 112, sc, "Spandrel moulding"), th = v.w(0.1);
      const d = "M 0 0 L 0 -6 L 6 -6 Q 8 -12 14 -12 L 14 -18 Q 20 -18 22 -24 L 28 -24 L 28 0 Z";
      s += v.g(`<rect x="-10" y="0" width="60" height="18" fill="url(#hatchW2)" ${W(th)}/><path d="${d}" fill="url(#hatchW2)" ${W(th * 1.4)}/>`, 0.25);
      s += chainH([v.X(0), v.X(28)], v.Y(-24) - 3, [28], { from: v.Y(-24) - 0.5, size: 1.0 });
      s += chainV([v.Y(0), v.Y(-24)], v.X(28) + 4, [24], { from: v.X(28) + 0.5, size: 1.0 });
      s += text(v.X(-10), v.Y(28), "SPANDREL PANEL, VENEERED", { size: 1.2, fill: THIN });
      s += text(v.X(-10), v.Y(34), "STEPS AT 14 AND 28, ROUND THE CURVE TOO", { size: 1.2, fill: THIN });
    }

    s += heading(18, 244, "NOTES", `REVISION ${K.rev.split(" ")[0]}`, 120);
    ["Details for AST-DR-040/042 (and 041/044 except the arches). Mouldings from the owner's photos; profiles to be mocked up full size",
     "before cutting. Each niche has one small focus light, 3000 K, in the middle of its top (owner, 8 Oct). All timber in the room's teak veneer; no colour in this set."]
      .forEach((n, i) => (s += text(18, 254 + i * 4.3, n, { size: 1.42 })));
    s += titleBlock({ title: "STUDY WALL — DETAILS", sub: "Niches · crown · frame · skirting", date: K.date, rev: "2 — niche lights (owner, 8 Oct); niches for the arches only", dwg, scale: "AS NOTED @ A3" });
    window.DRAWINGS[key] = { title: `Study wall — details · ${dwg}`, svg: mono(sheet(s)), params: SW2 };
  }
  detailsSheet("studywall-details2", "AST-DR-043");
  window.SW2GEOM = { gB, gW, niches, K, yEnt, yTop, entH, xPanel, xZone, xWin, fa0, fa1, fb0, fb1, R, Ln, P, ey, W, spandrel, arcPts, angAt, defs, mono };
})();
