// The bed wall — AST-DR-034 — and the bed — AST-DR-035. From the owner's sketches and photos (03.10.2026); rev 5 07.10.2026.
// The whole bed wall is built out 2 in in Dark Diva veneer, polished darker, and round the niche that holds the bed and
// both side tables the face sweeps forward in one smooth concave cove — up both sides and across the top — to 15 in at
// the niche's edge (owner, 7 Oct: option A, 6 in along the wall then a 1 in flat, no step; the veneer wrapped over bent
// ply, satin polish). The niche is 15 in deep, lined with parchment-plaster panels in a grid, and the bed in it is the one
// in the owner's photo: a low dark-wood platform on turned feet, with the slim upholstered headboard back in dusty-rose
// suede (owner, 7 Oct; the long cushion goes). Side tables 16 × 14 in after the owner's photo — shaped top, burl drawer,
// cabriole legs, no stone (AST-DR-049).
// A Sony rear speaker high on each plain face. D1 opens flat along the 2 in face onto a floor stop.
// Seen from the room: the dressing (right-wall) corner on the LEFT of the elevation, the entrance (left-wall) corner on
// the RIGHT. u runs along the wall from the dressing corner; v comes out from the wall into the room. Real units mm.

window.DRAWINGS = window.DRAWINGS || {};

const BEDWALL = {
  rev: "5 — 2 in face, 15 in niche; headboard; new side tables; speakers",
  date: "07.10.2026",
  W: 4724, H: 2769, T: 230,                 // 15 ft 6 in wall, 9 ft 1 in ceiling, 9 in walls (AST-DR-001)
  deep: 381, edge: 51,                      // 15 in at the niche (owner, 7 Oct); 2 in everywhere else — as deep as D1's
                                            // lining, so the open leaf lies along the face (owner: "two inches")
  niche: { u0: 787, u1: 3632, h: 1981 },    // the old bed-back span exactly (owner: "we're keeping that"), centred on the TV; 6 ft 6 in high (owner: good)
  cove: { r: 152, flat: 25 },               // option A (owner, 7 Oct): one smooth concave quarter-ellipse, 6 in along the wall × 13 in out
                                            // (2 in to 15 in), then a 1 in flat edge — 7 in in all, the gap between the open door's tip and the niche
  grid: { cols: 5, rows: 3 },               // as sketched: five across, three up
  plaster: 20,                              // parchment plaster on 12 mm board
  skirt: 102,                               // the room's 4 in white marble skirting, carried on — flush with the veneer on this wall
  door: { leaf: 914, lin: 51, t: 45, knob: 65, back: 64, stop: 5.5 },  // D1: 3 ft leaf, 2 in lining — its hinge pin 2 in off this wall;
                                            // the floor stop holds it 5½° short of flat, so its 2½ in knob stays ⅝ in off the veneer
  side: { w: 406, d: 356, h: 610, top: 22, serp: 16, sideIn: 8, apr: 100, aprS: 34, aprF: 30, aprB: 24, leg: 34, knee: 18, drawerX: 70 },
                                            // 16 × 14 in (owner), 24 in high, after the owner's photo (7 Oct): shaped top, burl drawer,
                                            // carved consoles, cabriole legs — no stone. Drawn in full on AST-DR-049
  spk: { w: 106, h: 216, d: 98, y0: 2362, u: 305 },  // Sony rear speakers (Sony's spec, 106 × 216 × 98), 2 in above the open door's
                                            // top, each in the middle of a plain face and square on the bed (owner: "high… a bit far")
  lamp: { y: 1290, span: 150, proj: 230 },  // a wall lamp over each side table (owner): the room's brass twin-arm sconce, as AST-DR-007
};

// The bed in the owner's photo, sized to the 6 ft × 6 ft 6 in mattress on the plan. Proportions read off the photo.
const BEDFRAME = {
  rev: "6 — base corners rounded 3 in and edges eased; headboard top corners rounded (owner, 8 Oct)",
  date: "08.10.2026",
  mat: { w: 1829, l: 1981, h: 254 },        // 6 ft × 6 ft 6 in, 10 in thick — mattress to be chosen
  over: 51,                                 // the frame runs 2 in past the mattress at the sides and the foot
  base: { h: 280, r: 75, ease: 15 },        // corners rounded 3 in in plan, every edge eased ⅝ in (owner, 8 Oct: 3 ft to walk past — the shins)                         // a storage base, a plain box straight down to the floor — no legs (owner, 7 Oct);
                                            // 11 in to the mattress, the storage inside not drawn; GLOSS BLACK lacquer (owner, 7 Oct)
  head: { h: 1016, t: 76, gap: 25, ply: 18, ease: 6, frame: 32, fd: 70, cr: 32 },   // cr: the frame's two top corners rounded (owner, 8 Oct)   // headboard top 3 ft 4 in off the floor, 3 in thick, 1 in off the
                                            // plaster; framed top and sides in a 1¼ in gloss-black border — as thin as the dressing
                                            // mirror's frame — 2¾ in deep, the rose panel ¼ in proud of it (owner, 7 Oct)
};

(function () {
  const { INK, THIN, DIM, f, text, mmToFt, view, chainH, chainV, note, labels, heading, cutMark, bubble, frame, titleBlock, sheet } = window.DK;
  const K = BEDWALL, B = BEDFRAME, W = K.W, H = K.H, N = K.niche, C = K.cove;
  const CW = C.r + C.flat, CB = K.deep - K.edge;   // the cove band from the niche's edge: 1 in flat, then the cove — 6 in along, 13 in out
  const hTop = N.h + CW;                      // where the top cove meets the 2 in face
  const ft = (mm) => mmToFt(mm).replace("'-", " ft ").replace('"', " in").replace(/^0 ft /, "").replace(/ 0 in$/, "");
  // black line only (owner, 7 Oct: no colour): white fills; cut carcase and walls hatched; the cove band a pale grey
  const VEN = "#fff", VEN2 = "#f0f0f0", PAR = "#fff", UPH = "#fff", WOOD = "#fff", MARB = "#fff", RUG = "#fff";
  const CUT = "url(#hatchBWc)";
  const mono = (svg) => svg.replace(/#8a3a22/g, INK).replace(/#b3261e/g, INK);

  // the bed sits on the niche's centre: the headboard 1 in off the plaster, the frame and mattress in front of it
  const bc = (N.u0 + N.u1) / 2, fw = B.mat.w + 2 * B.over, HB = B.head;
  const vHb = K.plaster + HB.gap, vHf = vHb + HB.t, vMat1 = vHf + B.mat.l, vFr1 = vMat1 + B.over;
  const yBase = B.base.h, yMat = yBase + B.mat.h;
  const tables = [N.u0 + (bc - fw / 2 - N.u0) / 2, N.u1 - (N.u1 - bc - fw / 2) / 2];
  const leafTip = W - K.door.leaf;
  const spkU = [K.spk.u, 2 * bc - K.spk.u], spkY1 = K.spk.y0 + K.spk.h;   // square on the bed: the right one over the open door
  // D1 at its floor stop: the leaf turned 5½° off the wall about its pin; knob 2½ in proud, 2½ in in from the leaf's edge
  const DR = K.door, rad = DR.stop * Math.PI / 180, stopAt = DR.leaf - DR.back - 150;   // the stop 6 in in from the knob
  const leafRot = (inner) => `<g transform="rotate(${-DR.stop} ${W} ${DR.lin})">${inner}</g>`;
  const knobGap = DR.lin + (DR.leaf - DR.back) * Math.sin(rad) - DR.knob * Math.cos(rad) - K.edge;
  const stopPt = [W - stopAt * Math.cos(rad) - 20 * Math.sin(rad), DR.lin + stopAt * Math.sin(rad) - 20 * Math.cos(rad)];
  const tipPt = [W - DR.leaf * Math.cos(rad), DR.lin + DR.leaf * Math.sin(rad)];

  // the build-out's face in plan: 2 in, then the concave cove — tangent to the 2 in face, turning to run straight out
  // at the niche — then the 1 in flat edge at 15 in. (u, v) for a niche edge at ue, the band running dir (−1 left, +1 right)
  const covePts = (ue, dir, n = 18) => Array.from({ length: n + 1 }, (_, i) => { const t = (i / n) * Math.PI / 2;   // t = 0 at the 2 in face
    return [ue + dir * (CW - C.r * Math.sin(t)), K.deep - CB * Math.cos(t)]; });
  const solidL = () => [[0, 0], [0, K.edge], ...covePts(N.u0, -1), [N.u0, K.deep], [N.u0, 0]];
  const solidR = () => [[N.u1, 0], [N.u1, K.deep], ...covePts(N.u1, 1).reverse(), [W, K.edge], [W, 0]];
  const P = (pts, a = "") => `<path d="M ${pts.map(([x, y]) => `${f(x)} ${f(y)}`).join(" L ")} Z" ${a}/>`;
  const PL = (pts, a = "") => `<path d="M ${pts.map(([x, y]) => `${f(x)} ${f(y)}`).join(" L ")}" fill="none" ${a}/>`;
  const RC = (x0, y0, x1, y1, a = "") => `<rect x="${f(Math.min(x0, x1))}" y="${f(Math.min(y0, y1))}" width="${f(Math.abs(x1 - x0))}" height="${f(Math.abs(y1 - y0))}" ${a}/>`;

  // a side table in plan (AST-DR-049): the shaped top — straight back, serpentine front, the sides drawn in a little —
  // with the apron and the four leg tops under it dashed
  const ST = K.side;
  function stOutline() {
    const n = 24, r = 9, o = [];
    for (let i = 0; i <= n; i++) { const y = (i / n) * (ST.d - r); o.push([ST.sideIn * Math.sin(Math.PI * y / ST.d) ** 2, y]); }
    for (let k = 1; k < 4; k++) { const a = Math.PI - (k / 4) * Math.PI / 2; o.push([r + r * Math.cos(a), ST.d - r + r * Math.sin(a)]); }
    for (let i = 0; i <= n; i++) { const x = r + (i / n) * (ST.w - 2 * r); o.push([x, ST.d - ST.serp * Math.sin(2 * Math.PI * x / ST.w) ** 2]); }
    for (let k = 1; k < 4; k++) { const a = Math.PI / 2 - (k / 4) * Math.PI / 2; o.push([ST.w - r + r * Math.cos(a), ST.d - r + r * Math.sin(a)]); }
    for (let i = n; i >= 0; i--) { const y = (i / n) * (ST.d - r); o.push([ST.w - ST.sideIn * Math.sin(Math.PI * y / ST.d) ** 2, y]); }
    return o;
  }
  function tableTop(c, v0, th, dash) {
    const x0 = c - ST.w / 2;
    let o = P(stOutline().map(([x, y]) => [x0 + x, v0 + y]), `fill="#fff" stroke-width="${th}"`);
    if (dash) o += `<g fill="none" stroke-width="${th * 0.6}" stroke-dasharray="${dash}">` + RC(x0 + ST.aprS, v0 + ST.aprB, x0 + ST.w - ST.aprS, v0 + ST.d - ST.aprF)
      + [[ST.aprS, ST.aprB], [ST.w - ST.aprS - ST.leg, ST.aprB], [ST.aprS, ST.d - ST.aprF - ST.leg], [ST.w - ST.aprS - ST.leg, ST.d - ST.aprF - ST.leg]].map(([x, y]) => RC(x0 + x, v0 + y, x0 + x + ST.leg, v0 + y + ST.leg)).join("") + `</g>`;
    return o;
  }
  // D1 resting on its floor stop: the leaf 5½° off the 2 in face, a knob each side, the swing dashed
  function doorAtStop(th, dash) {
    const pin = DR.lin, kx = W - (DR.leaf - DR.back);
    let g = RC(leafTip, pin, W, pin + DR.t, `fill="#fff" stroke-width="${th * 1.4}"`);
    [-1, 1].forEach((m) => { const b = m < 0 ? pin : pin + DR.t;
      g += RC(kx - 10, b, kx + 10, b + m * (DR.knob - 46), `fill="#fff" stroke-width="${th * 0.8}"`) + `<circle cx="${f(kx)}" cy="${f(b + m * (DR.knob - 25))}" r="25" fill="#fff" stroke-width="${th}"/>`; });
    g += `<circle cx="${f(W - stopAt)}" cy="${f(pin - 20)}" r="20" fill="#fff" stroke-width="${th}"/><circle cx="${f(W - stopAt)}" cy="${f(pin - 20)}" r="7" fill="${INK}"/>`;
    return `<path d="M ${W} ${pin + DR.leaf} A ${DR.leaf} ${DR.leaf} 0 0 1 ${f(tipPt[0])} ${f(tipPt[1])}" stroke-width="${th * 0.7}" stroke-dasharray="${dash}" fill="none"/>`
      + leafRot(g) + `<circle cx="${W}" cy="${pin}" r="7" fill="${INK}"/>`;
  }

  // ════════ PLAN — the wall at the top, the room below, cut at 4 ft ════════
  function plan(th, dash) {
    const hatch = `fill="url(#hatchBW)" stroke="none"`;
    let o = RC(-K.T, -K.T, W + K.T, 0, hatch) + RC(-K.T, 0, 0, 2300, hatch) + RC(W, 0, W + K.T, 2300, hatch);
    // the dressing door (right wall) and the entrance (left wall) openings
    o += RC(-K.T, 686, 0, 686 + 864, `fill="#fff" stroke="none"`) + RC(W, 0, W + K.T, 1016, `fill="#fff" stroke="none"`);
    o += `<path d="M ${-K.T} 0 L 0 0 L 0 686 M 0 1550 L 0 2300 M ${W} 2300 L ${W} 1016 M ${W} 0 L ${W + K.T} 0" stroke-width="${th * 1.6}" fill="none"/>`;
    o += `<line x1="0" y1="0" x2="${W}" y2="0" stroke-width="${th * 1.6}"/>`;
    o += RC(W, 0, W + 45, DR.lin, `fill="#fff" stroke-width="${th}"`) + RC(W, 1016 - DR.lin, W + 45, 1016, `fill="#fff" stroke-width="${th}"`);   // D1's linings
    // the build-out, Dark Diva on a ply carcase, cut; the cove over the niche dashed (above the cut)
    o += P(solidL(), `fill="${CUT}" stroke-width="${th * 1.3}"`) + P(solidR(), `fill="${CUT}" stroke-width="${th * 1.3}"`);
    o += `<line x1="${N.u0}" y1="${K.deep}" x2="${N.u1}" y2="${K.deep}" stroke-width="${th}" stroke-dasharray="${dash}"/>`;
    // the niche back, and its two sides, in parchment plaster (the sides lined into the carcase, so the niche stays its width)
    o += RC(N.u0, 0, N.u1, K.plaster, `fill="${PAR}" stroke-width="${th}"`);
    o += RC(N.u0 - K.plaster, K.plaster, N.u0, K.deep, `fill="${PAR}" stroke-width="${th * 0.8}"`) + RC(N.u1, K.plaster, N.u1 + K.plaster, K.deep, `fill="${PAR}" stroke-width="${th * 0.8}"`);
    // the rear speakers, high on the two plain faces — above the cut, dashed
    spkU.forEach((u) => (o += RC(u - K.spk.w / 2, K.edge, u + K.spk.w / 2, K.edge + K.spk.d, `fill="none" stroke-width="${th * 0.8}" stroke-dasharray="${dash}"`)));
    // the side tables' tops, the headboard, the storage base, mattress, pillows
    tables.forEach((c) => (o += tableTop(c, K.plaster, th)));   // above the cut: the top only
    o += RC(bc - fw / 2, vHb, bc + fw / 2, vHf, `fill="${UPH}" stroke-width="${th * 1.2}"`);
    o += RC(bc - fw / 2, vHf, bc + fw / 2, vFr1, `fill="${WOOD}" stroke-width="${th}"`);
    o += RC(bc - B.mat.w / 2, vHf, bc + B.mat.w / 2, vMat1, `fill="#fff" stroke-width="${th}"`);
    [-1, 1].forEach((s) => (o += RC(bc + s * 40, vHf + 30, bc + s * (B.mat.w / 2 - 70), vHf + 330, `fill="#fff" stroke-width="${th * 0.7}"`)));
    o += `<line x1="${f(bc - B.mat.w / 2)}" y1="${f(vHf + 620)}" x2="${f(bc + B.mat.w / 2)}" y2="${f(vHf + 620)}" stroke-width="${th * 0.6}"/>`;
    // the entrance door, open along this wall and resting on its floor stop
    return o + doorAtStop(th, dash);
  }

  // ════════ ELEVATION — seen from the room, floor to ceiling ════════
  function elevation(th, bare = false) {
    const Y = (h) => H - h;
    let o = "";
    // the build-out face, all of it veneer; the niche cut into it
    o += RC(0, Y(H), W, Y(0), `fill="${VEN}" stroke-width="${th * 1.3}"`);
    // veneer leaves: book-matched sheets, joints at about 4 ft — fine lines
    [N.u0 - CW - 600, N.u1 + CW + 600, bc - 900, bc + 900].forEach((u) => (o += `<line x1="${f(u)}" y1="${Y(H)}" x2="${f(u)}" y2="${f(u < N.u0 - CW || u > N.u1 + CW ? Y(K.skirt) : Y(hTop))}" stroke-width="${th * 0.4}" opacity=".55"/>`));
    // the cove band round the niche — up both sides and across the top — shaded darker as it turns out towards you,
    // the two side coves meeting the top one in a mitre at the corners
    const band = `M ${f(N.u0 - CW)} ${Y(0)} L ${f(N.u0 - CW)} ${f(Y(hTop))} L ${f(N.u1 + CW)} ${f(Y(hTop))} L ${f(N.u1 + CW)} ${Y(0)} L ${N.u1} ${Y(0)} L ${N.u1} ${f(Y(N.h))} L ${N.u0} ${f(Y(N.h))} L ${N.u0} ${Y(0)} Z`;
    o += `<path d="${band}" fill="${VEN2}" stroke="none"/>`;
    for (let i = 1; i <= 6; i++) {                                   // lines of the cove, closer together where it curves hardest
      const d = C.flat + C.r * (1 - Math.cos((i / 7) * Math.PI / 2)), w = th * (0.2 + i * 0.06);
      o += `<path d="M ${f(N.u0 - d)} ${Y(K.skirt)} L ${f(N.u0 - d)} ${f(Y(N.h + d))} L ${f(N.u1 + d)} ${f(Y(N.h + d))} L ${f(N.u1 + d)} ${Y(K.skirt)}" fill="none" stroke-width="${f(w)}"/>`;
    }
    o += `<path d="M ${N.u0 - C.flat} ${Y(K.skirt)} L ${N.u0 - C.flat} ${f(Y(N.h + C.flat))} L ${N.u1 + C.flat} ${f(Y(N.h + C.flat))} L ${N.u1 + C.flat} ${Y(K.skirt)}" fill="none" stroke-width="${th * 0.9}"/>`;
    o += `<path d="M ${f(N.u0 - CW)} ${Y(K.skirt)} L ${f(N.u0 - CW)} ${f(Y(hTop))} L ${f(N.u1 + CW)} ${f(Y(hTop))} L ${f(N.u1 + CW)} ${Y(K.skirt)}" fill="none" stroke-width="${th * 0.5}" stroke-dasharray="${th * 8} ${th * 5}"/>`;
    o += `<line x1="${N.u0}" y1="${f(Y(N.h))}" x2="${f(N.u0 - CW)}" y2="${f(Y(hTop))}" stroke-width="${th * 0.6}"/><line x1="${N.u1}" y1="${f(Y(N.h))}" x2="${f(N.u1 + CW)}" y2="${f(Y(hTop))}" stroke-width="${th * 0.6}"/>`;
    // the niche: parchment-plaster panels, five across and three up, hairline joints
    o += RC(N.u0, Y(N.h), N.u1, Y(0), `fill="${PAR}" stroke-width="${th * 1.5}"`);
    const cw = (N.u1 - N.u0) / K.grid.cols, rh = (N.h - K.skirt) / K.grid.rows;
    for (let i = 1; i < K.grid.cols; i++) o += `<line x1="${f(N.u0 + i * cw)}" y1="${Y(N.h)}" x2="${f(N.u0 + i * cw)}" y2="${Y(K.skirt)}" stroke-width="${th * 0.6}"/>`;
    for (let j = 1; j < K.grid.rows; j++) o += `<line x1="${N.u0}" y1="${f(Y(K.skirt + j * rh))}" x2="${N.u1}" y2="${f(Y(K.skirt + j * rh))}" stroke-width="${th * 0.6}"/>`;
    // marble skirting, carried along the build-out and into the niche
    o += RC(0, Y(K.skirt), W, Y(0), `fill="${MARB}" stroke-width="${th}"`);
    if (!bare) tables.forEach((c) => (o += tableFront(c, Y, th)));
    spkU.forEach((u) => (o += speaker(u, Y, th)));                      // the rear speakers, high on the plain faces
    tables.forEach((c) => (o += sconce(c, Y, th)));                     // a wall lamp over each side table, on the plaster
    if (bare) return o + `<line x1="-150" y1="${Y(0)}" x2="${W + 150}" y2="${Y(0)}" stroke-width="${th * 4}"/>`;
    // the bed from its foot: the headboard behind, the storage base down to the floor, mattress and pillows
    o += headFront(bc - fw / 2, Y, th);
    [-1, 1].forEach((s) => (o += RC(bc + s * 60, Y(yMat + 200), bc + s * (B.mat.w / 2 - 40), Y(yMat), `fill="#fff" stroke-width="${th}"`)));
    o += RC(bc - B.mat.w / 2, Y(yMat), bc + B.mat.w / 2, Y(yBase), `fill="#fff" stroke-width="${th * 1.2}"`);
    o += RC(bc - fw / 2, Y(yBase), bc + fw / 2, Y(0), `fill="${WOOD}" stroke-width="${th * 1.2}"`);                       // the base, to the floor
    // the entrance door, open along this wall on its floor stop (dashed): the right-hand speaker clears its top by 2 in
    o += RC(tipPt[0], Y(2311), W, Y(0), `fill="none" stroke-width="${th * 1.1}" stroke-dasharray="${th * 9} ${th * 6}"`);
    o += `<line x1="-150" y1="${Y(0)}" x2="${W + 150}" y2="${Y(0)}" stroke-width="${th * 4}"/><line x1="-150" y1="${Y(H)}" x2="${W + 150}" y2="${Y(H)}" stroke-width="${th * 2}" stroke-dasharray="40 20"/>`;
    return o;
  }
  // the room's twin-arm brass sconce with fabric shades (AST-DR-007, detail 4), centred on u
  function sconce(u, Y, th) {
    const y = K.lamp.y, sp = K.lamp.span;
    let o = `<ellipse cx="${f(u)}" cy="${f(Y(y))}" rx="28" ry="60" fill="#fff" stroke-width="${th}"/><ellipse cx="${f(u)}" cy="${f(Y(y))}" rx="18" ry="44" stroke-width="${th * 0.6}"/>`;
    [-1, 1].forEach((m) => {
      const ax = u + m * sp;
      o += `<path fill="none" stroke-width="${th}" d="M ${f(u + m * 12)} ${f(Y(y - 10))} C ${f(u + m * 70)} ${f(Y(y - 80))} ${f(ax - m * 10)} ${f(Y(y - 50))} ${f(ax)} ${f(Y(y + 20))}"/>`;
      o += RC(ax - 8, Y(y + 36), ax + 8, Y(y + 90), `fill="#fff" stroke-width="${th}"`);
      o += `<path d="M ${f(ax - 60)} ${f(Y(y + 90))} L ${f(ax + 60)} ${f(Y(y + 90))} L ${f(ax + 36)} ${f(Y(y + 190))} L ${f(ax - 36)} ${f(Y(y + 190))} Z" fill="#fff" stroke-width="${th}"/>`;
      o += [-40, -20, 0, 20, 40].map((d) => `<line x1="${f(ax + d)}" y1="${f(Y(y + 92))}" x2="${f(ax + d * 0.6)}" y2="${f(Y(y + 188))}" stroke-width="${th * 0.5}"/>`).join("");
    });
    return o;
  }
  // a side table from the front (AST-DR-049): the moulded top, the apron with its burl drawer and knob, a console at each
  // corner, the cabriole legs. `Y` maps height to the page; u0 the table's left edge, so it can be drawn at any scale
  function stLeg(u0, dir, Y, th) {
    const zB = ST.h - ST.top - ST.apr, k = ST.knee, U = (u) => u0 + dir * u, Pt = (u, z) => `${f(U(u))} ${f(Y(z))}`;
    return `<path d="M ${Pt(0, zB)} C ${Pt(-10, zB - 14)} ${Pt(-k, zB - 46)} ${Pt(-k, zB - 96)} C ${Pt(-k, zB - 170)} ${Pt(-4, zB - 230)} ${Pt(4, 230)}`
      + ` C ${Pt(9, 170)} ${Pt(11, 110)} ${Pt(8, 66)} C ${Pt(5, 36)} ${Pt(-4, 18)} ${Pt(-10, 8)} C ${Pt(-12, 4)} ${Pt(-10, 0)} ${Pt(-6, 0)} L ${Pt(12, 0)}`
      + ` C ${Pt(16, 10)} ${Pt(21, 36)} ${Pt(23, 70)} C ${Pt(25, 116)} ${Pt(26, 176)} ${Pt(24, 236)} C ${Pt(21, zB - 220)} ${Pt(18, zB - 140)} ${Pt(22, zB - 70)} C ${Pt(26, zB - 30)} ${Pt(ST.leg, zB - 10)} ${Pt(ST.leg, zB)} Z" fill="${WOOD}" stroke-width="${th}"/>`;
  }
  function tableFront(c, Y, th, fine = false, side = false) {     // side: seen from the end, the wall on the left (x0 = c then)
    const len = side ? ST.d : ST.w, x0 = side ? c : c - ST.w / 2, zA = ST.h - ST.top, zB = zA - ST.apr;
    const a0 = x0 + (side ? ST.aprB : ST.aprS), a1 = x0 + len - (side ? ST.aprF : ST.aprS);
    let o = stLeg(a0, 1, Y, th) + stLeg(a1, -1, Y, th);
    o += RC(a0, Y(zA), a1, Y(zB), `fill="${WOOD}" stroke-width="${th}"`);
    if (!side) o += RC(x0 + ST.drawerX, Y(zA - 12), x0 + ST.w - ST.drawerX, Y(zB + 12), `fill="#fff" stroke-width="${th * 0.7}"`)
      + `<circle cx="${f(c)}" cy="${f(Y(zB + ST.apr / 2))}" r="${fine ? 15 : 12}" fill="#fff" stroke-width="${th * 0.7}"/>`;
    [a0, a1 - 22].forEach((u) => (o += RC(u, Y(zA), u + 22, Y(zB - 20), `fill="#fff" stroke-width="${th * 0.6}"`) + (fine ? `<circle cx="${f(u + 11)}" cy="${f(Y(zA - 14))}" r="7" fill="none" stroke-width="${th * 0.5}"/>` : "")));
    o += RC(x0, Y(ST.h), x0 + len, Y(zA), `fill="${WOOD}" stroke-width="${th}"`) + `<line x1="${f(x0 + 3)}" y1="${f(Y(ST.h - 10))}" x2="${f(x0 + len - 3)}" y2="${f(Y(ST.h - 10))}" stroke-width="${th * 0.4}"/>`;
    return o;
  }
  // a Sony rear speaker, centred on u: rounded cabinet, cloth grille, on its wall bracket
  function speaker(u, Y, th) {
    const S = K.spk, x0 = u - S.w / 2;
    return `<rect x="${f(x0)}" y="${f(Y(spkY1))}" width="${S.w}" height="${S.h}" rx="10" fill="#fff" stroke-width="${th * 1.1}"/>`
      + `<rect x="${f(x0 + 8)}" y="${f(Y(spkY1 - 8))}" width="${S.w - 16}" height="${S.h - 30}" rx="6" fill="none" stroke-width="${th * 0.5}"/>`
      + `<line x1="${f(u - 12)}" y1="${f(Y(S.y0 + 11))}" x2="${f(u + 12)}" y2="${f(Y(S.y0 + 11))}" stroke-width="${th * 0.6}"/>`;
  }
  // the headboard from the front: a plain upholstered panel the frame's width, its top edge eased (the eased roll a line)
  // the headboard from the front: the thin black frame round its top and sides, the rose panel inside it
  function headFront(x0, Y, th) {
    const F = HB.frame, yb = yMat - 40;
    const r = HB.cr, yt = Y(HB.h), ybb = Y(yb);
    return `<path d="M ${f(x0)} ${f(ybb)} L ${f(x0)} ${f(yt + r)} A ${r} ${r} 0 0 1 ${f(x0 + r)} ${f(yt)} L ${f(x0 + fw - r)} ${f(yt)} A ${r} ${r} 0 0 1 ${f(x0 + fw)} ${f(yt + r)} L ${f(x0 + fw)} ${f(ybb)} Z" fill="${WOOD}" stroke-width="${th * 1.2}"/>`
      + RC(x0 + F, Y(HB.h - F), x0 + fw - F, Y(yb), `fill="${UPH}" stroke-width="${th * 0.9}"`)
      + `<line x1="${f(x0 + F + 8)}" y1="${f(Y(HB.h - F - 10))}" x2="${f(x0 + fw - F - 8)}" y2="${f(Y(HB.h - F - 10))}" stroke-width="${th * 0.35}"/>`;
  }
  // ════════ SECTION A–A — through the bed's centre, the wall on the left ════════
  function section(th) {
    const Y = (h) => H - h, hatch = `fill="url(#hatchBW)" stroke="none"`, dsh = `stroke-dasharray="${th * 6} ${th * 4}"`;
    let o = RC(-K.T, Y(H), 0, Y(0), hatch) + `<line x1="0" y1="${Y(H)}" x2="0" y2="${Y(0)}" stroke-width="${th * 1.6}"/>`;
    // over the niche: the soffit, the 1 in flat edge, the cove sweeping back to the 2 in face, and 2 in up to the ceiling
    // concave: centred out in the room at (15 in, cove top) — leaves the flat edge running straight out, meets the 2 in face tangent
    const cv = Array.from({ length: 19 }, (_, i) => { const t = (1 - i / 18) * Math.PI / 2; return [K.deep - CB * Math.cos(t), hTop - C.r * Math.sin(t)]; });
    o += P([[0, Y(N.h)], [K.deep, Y(N.h)], [K.deep, Y(N.h + C.flat)], ...cv.map(([v, h]) => [v, Y(h)]), [K.edge, Y(H)], [0, Y(H)]], `fill="${CUT}" stroke-width="${th * 1.4}"`);
    o += RC(0, Y(N.h + K.plaster), K.deep, Y(N.h), `fill="${PAR}" stroke-width="${th * 0.8}"`);          // the soffit, parchment plaster too
    // the niche back: parchment plaster on board, marble skirting at its foot
    o += RC(0, Y(N.h), K.plaster, Y(K.skirt), `fill="${PAR}" stroke-width="${th}"`) + RC(0, Y(K.skirt), K.plaster + 12, Y(0), `fill="${MARB}" stroke-width="${th}"`);
    // beyond: the side table in profile (thin, dashed), and the build-out's 15 in face at the niche edge
    o += `<g opacity=".6" stroke-dasharray="${th * 6} ${th * 4}">${tableFront(K.plaster, Y, th * 0.5, false, true)}</g>`.replace(/fill="#fff"/g, 'fill="none"');
    o += `<line x1="${K.deep}" y1="${Y(N.h)}" x2="${K.deep}" y2="${Y(0)}" stroke-width="${th * 0.5}" ${dsh}/>`;
    // beyond, high on the plain face past the niche: a rear speaker on its bracket
    o += `<g fill="none" stroke-width="${th * 0.7}" ${dsh}><rect x="${K.edge + 6}" y="${Y(spkY1)}" width="${K.spk.d}" height="${K.spk.h}" rx="10"/><path d="M ${K.edge} ${Y(K.spk.y0 + 140)} L ${K.edge + 6} ${Y(K.spk.y0 + 140)}"/></g>`;
    // the wall lamp over the side table, beyond (dashed): backplate on the plaster, arm, shade
    { const y = K.lamp.y, p = K.plaster + K.lamp.proj, d = dsh;
      o += `<g fill="none" stroke-width="${th * 0.8}" ${d}><rect x="${K.plaster}" y="${Y(y + 60)}" width="18" height="120"/><path d="M ${K.plaster + 18} ${Y(y - 10)} C ${K.plaster + 90} ${Y(y - 70)} ${p - 20} ${Y(y - 50)} ${p} ${Y(y + 20)}"/><path d="M ${p - 60} ${Y(y + 90)} L ${p + 60} ${Y(y + 90)} L ${p + 36} ${Y(y + 190)} L ${p - 36} ${Y(y + 190)} Z"/></g>`; }
    // the bed, cut: the rug under it; the headboard (ply back, foam and suede, eased top) bolted to the base; the base to the
    // floor, the mattress, a pillow
    o += RC(vHf + 500, Y(12), vFr1 + 600, Y(0), `fill="${RUG}" stroke-width="${th * 0.6}"`);
    o += headCut(vHb, Y, 0, th);
    o += RC(vHf, Y(yMat), vMat1, Y(yBase), `fill="#fff" stroke-width="${th * 1.2}"`) + RC(vHf + 30, Y(yMat + 150), vHf + 560, Y(yMat), `fill="#fff" stroke-width="${th * 0.8}"`);
    o += RC(vHf, Y(yBase), vFr1, Y(0), `fill="${WOOD}" stroke-width="${th * 1.2}"`);
    o += `<line x1="${-K.T}" y1="${Y(0)}" x2="${vFr1 + 250}" y2="${Y(0)}" stroke-width="${th * 4}"/><line x1="${-K.T}" y1="${Y(H)}" x2="${vFr1 + 250}" y2="${Y(H)}" stroke-width="${th * 2}" stroke-dasharray="40 20"/>`;
    return o;
  }
  // the headboard cut through, back at v0, from its foot (yb) to its top: ¾ in ply back, then foam under suede with an eased top;
  // two bolts carry it on the base's head end
  function headCut(v0, Y, yb, th) {
    const t = HB.t, p = HB.ply, e = HB.ease, F = HB.frame, yt = HB.h - F;
    let o = `<path d="M ${v0} ${Y(HB.h)} L ${v0 + HB.fd - 3} ${Y(HB.h)} Q ${v0 + HB.fd} ${Y(HB.h)} ${v0 + HB.fd} ${Y(HB.h - 3)} L ${v0 + HB.fd} ${Y(yt)} L ${v0} ${Y(yt)} Z" fill="url(#hatchBW2)" stroke-width="${th * 1.2}"/>`;   // the black frame's top rail, cut
    o += RC(v0, Y(yt), v0 + p, Y(yb), `fill="url(#hatchBW2)" stroke-width="${th}"`);
    o += `<path d="M ${v0 + p} ${Y(yt)} L ${f(v0 + t - e)} ${Y(yt)} Q ${v0 + t} ${Y(yt)} ${v0 + t} ${Y(yt - e)} L ${v0 + t} ${Y(yb + 6)} L ${v0 + p} ${Y(yb + 6)} Z" fill="${UPH}" stroke-width="${th * 1.2}"/>`;
    o += RC(v0 + p, Y(yBase - 40), v0 + t + 40, Y(yBase - 48), `fill="${INK}" stroke="none"`);                                            // an M8 bolt
    return o;
  }

  // ════════ DETAIL 2 — the entrance corner in plan ════════
  function doorCorner(th, dash) {
    const hatch = `fill="url(#hatchBW)" stroke="none"`;
    let o = RC(N.u1 - 250, -K.T, W + K.T, 0, hatch) + RC(W, 0, W + K.T, 1250, hatch);
    o += RC(W, 0, W + K.T, 1016, `fill="#fff" stroke="none"`);
    o += `<path d="M ${N.u1 - 250} 0 L ${W} 0 M ${W} 1250 L ${W} 1016" stroke-width="${th * 1.6}" fill="none"/>`;
    o += RC(W, 0, W + DR.t + 6, DR.lin, `fill="#fff" stroke-width="${th}"`) + RC(W, 1016 - DR.lin, W + DR.t + 6, 1016, `fill="#fff" stroke-width="${th}"`);   // linings
    o += P(solidR(), `fill="${CUT}" stroke-width="${th * 1.3}"`) + RC(N.u1 - 250, 0, N.u1, K.plaster, `fill="${PAR}" stroke-width="${th}"`);
    o += RC(N.u1, K.plaster, N.u1 + K.plaster, K.deep, `fill="${PAR}" stroke-width="${th * 0.8}"`);
    // the carcase behind the veneer: 18 ply on 33 battens — the cable to the speaker runs in this void
    o += `<line x1="${f(N.u1 + CW)}" y1="33" x2="${W}" y2="33" stroke-width="${th * 0.5}" stroke-dasharray="${dash}"/>`;
    return o + doorAtStop(th, dash);
  }

  // ═════════════ SHEET 1 — AST-DR-034, THE BED WALL ═════════════
  window.DK.begin("bedwall");
  let s = frame();
  s += `<defs><pattern id="hatchBW" patternUnits="userSpaceOnUse" width="90" height="90" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="90" stroke="#9a9a9a" stroke-width="10"/></pattern>
    <pattern id="hatchBWc" patternUnits="userSpaceOnUse" width="40" height="40" patternTransform="rotate(45)"><rect width="40" height="40" fill="#fff"/><line x1="0" y1="0" x2="0" y2="40" stroke="#6f6f6f" stroke-width="6"/></pattern>
    <pattern id="hatchBW2" patternUnits="userSpaceOnUse" width="5" height="5" patternTransform="rotate(-45)"><rect width="5" height="5" fill="#fff"/><line x1="0" y1="0" x2="0" y2="5" stroke="#8c8c8c" stroke-width="0.6"/></pattern></defs>`;
  const bub = (n, x, y, ax, ay) => `<line x1="${f(x)}" y1="${f(y)}" x2="${f(ax)}" y2="${f(ay)}" stroke="${INK}" stroke-width="0.13"/><circle cx="${f(ax)}" cy="${f(ay)}" r="0.45" fill="${INK}"/>` + bubble(x, y, n);

  // elevation 1:30
  const sc = 30, ve = view(26, 32, sc, "Bed wall elevation"), te = ve.w(0.12);
  s += heading(18, 17, "ELEVATION — THE BED WALL", `SCALE 1:${sc} · SEEN FROM THE ROOM · DRESSING CORNER LEFT, ENTRANCE CORNER RIGHT`, 160);
  s += ve.g(elevation(te), 0.3);
  view(0, 0, sc, "Bed wall face").g(elevation(te, true), 0.3);           // captured only: the wall alone, for the 3D room
  { const yb = ve.Y(H);
    s += chainH([0, N.u0 - CW, N.u0, N.u1, N.u1 + CW, W].map(ve.X), yb + 5, [N.u0 - CW, `${CW} COVE`, `${N.u1 - N.u0} NICHE`, `${CW} COVE`, W - N.u1 - CW], { from: yb + 1, size: 1.2 });
    s += chainH([ve.X(0), ve.X(W)], yb + 11, [`${W} BED WALL`], { from: yb + 1, size: 1.4 });
    s += chainV([ve.Y(H), ve.Y(H - K.skirt), ve.Y(H - N.h), ve.Y(H - hTop), ve.Y(0)], ve.X(W) + 6, [K.skirt, `${N.h - K.skirt} PANELS`, `${CW} COVE`, H - hTop], { from: ve.X(W) + 1, size: 1.2 });
    s += chainV([ve.Y(H), ve.Y(0)], ve.X(W) + 13, [`${H} CEILING`], { from: ve.X(W) + 1, size: 1.3 });
    // the speakers: their height on the left, their places along the top (square on the bed)
    s += chainV([ve.Y(H), ve.Y(H - K.spk.y0), ve.Y(H - spkY1), ve.Y(0)], ve.X(0) - 3, [K.spk.y0, K.spk.h, H - spkY1], { from: ve.X(0) - 0.5, size: 1.05 });
    s += chainH([ve.X(0), ve.X(spkU[0])], ve.Y(0) - 2.5, [K.spk.u], { from: ve.Y(H - spkY1), size: 1.05 });
    s += chainH([ve.X(spkU[1]), ve.X(W)], ve.Y(0) - 2.5, [Math.round(W - spkU[1])], { from: ve.Y(H - spkY1), size: 1.05 });
    s += note(ve.X(N.u0 - CW - 300), ve.Y(H - 1500), ve.X(N.u0 + 700), ve.Y(330), "DARK DIVA VENEER — WHOLE WALL, DARKER POLISH", "2 IN BUILD-OUT ON A PLY CARCASE · SATIN");
    s += note(ve.X(N.u0 + 300), ve.Y(H - hTop + 90), ve.X(N.u0 + 700), ve.Y(480), "ONE SMOOTH 6 IN COVE + 1 IN EDGE — 2 IN OUT TO 15 IN", "VENEER WRAPPED OVER BENT PLY, NO JOIN, NO STEP");
    s += note(ve.X(N.u0 + (N.u1 - N.u0) * 0.1), ve.Y(H - 1700), ve.X(N.u0 + 40), ve.Y(-110), "PARCHMENT PLASTER — BACK IN 5 × 3 PANELS", "THE NICHE'S SIDES AND SOFFIT PLAIN PARCHMENT TOO");
    s += note(ve.X(bc + fw / 2 - 150), ve.Y(H - HB.h + 150), ve.X(bc + fw / 2 + 120), ve.Y(H - 1150), "ROSE SUEDE HEADBOARD, THIN BLACK FRAME", "ON A GLOSS-BLACK STORAGE BASE — AST-DR-035");
    s += note(ve.X(W - 150), ve.Y(H - 1500), ve.X(leafTip - 120), ve.Y(-110), "D1 OPEN ON ITS FLOOR STOP (DASHED)", "ALONG THE 2 IN FACE — DETAIL 2", "end");
    s += note(ve.X(tables[0] - 60), ve.Y(H - 560), ve.X(N.u0 - CW) - 2, ve.Y(H - 420), "SIDE TABLE", "AFTER THE PHOTO — DETAIL 3", "end");
    s += note(ve.X(tables[1] + K.lamp.span), ve.Y(H - K.lamp.y - 140), ve.X(tables[1] + 260), ve.Y(H - 1700), "WALL LAMP, EACH SIDE", "BRASS TWIN-ARM, AS THE RIGHT WALL");
    s += note(ve.X(spkU[0] + K.spk.w / 2), ve.Y(H - K.spk.y0 - 120), ve.X(N.u0 + 700), ve.Y(170), "REAR SPEAKER, EACH SIDE", "SONY · THE RIGHT ONE 2 IN OVER THE OPEN DOOR");
    s += cutMark(ve.X(bc) + 4, ve.Y(-60), "A", "down");
  }

  // plan 1:30
  const vp = view(26, 154, sc, "Bed wall plan"), tp = vp.w(0.1), dp = `${vp.w(1)} ${vp.w(0.7)}`;
  s += heading(18, 141, "PLAN", `CUT AT 4 FT · SCALE 1:${sc} · THE BED WALL AT THE TOP, THE ROOM BELOW`, 150);
  s += vp.g(plan(tp, dp), 0.3);
  s += chainV([vp.Y(0), vp.Y(K.edge)], vp.X(0) - 4, [K.edge], { from: vp.X(0), size: 1.1 });
  s += chainV([vp.Y(0), vp.Y(K.deep)], vp.X(N.u0) - 4, [K.deep], { from: vp.X(N.u0), size: 1.1 });
  s += chainH([vp.X(N.u1), vp.X(tipPt[0])], vp.Y(K.deep) + 4, [Math.round(tipPt[0] - N.u1)], { from: vp.Y(K.deep), size: 1.1 });
  s += note(vp.X(W - 420), vp.Y(110), vp.X(W) + 6, vp.Y(-40), "D1 ON ITS FLOOR STOP", "LIES ALONG THE 2 IN FACE — DETAIL 2");
  s += note(vp.X(W + 60), vp.Y(500), vp.X(W) + 6, vp.Y(520), "ENTRANCE DOOR, 3 FT", "SWINGS ROUND TO THIS WALL");
  s += note(vp.X(-60), vp.Y(1100), vp.X(250), vp.Y(1500), "DRESSING DOOR", "2 FT 3 IN FROM THE CORNER");
  s += note(vp.X(spkU[0]), vp.Y(K.edge + K.spk.d), vp.X(250), vp.Y(700), "REAR SPEAKER OVER (DASHED)", "7 FT 9 IN UP");
  s += note(vp.X(tables[0] - 60), vp.Y(K.plaster + K.side.d - 100), vp.X(330), vp.Y(1050), "SIDE TABLE 16 × 14 IN", "SHAPED TOP — AST-DR-049");
  s += text(vp.X(bc), vp.Y(vHf + 1100), "BED 6 FT × 6 FT 6", { size: 1.6, anchor: "middle", fill: THIN });
  s += cutMark(vp.X(bc) + 4, vp.Y(vFr1 + 150), "A", "up");

  // section A–A 1:25
  const scS = 25, vs = view(214, 32, scS, "Bed wall section A-A"), ts = vs.w(0.12);
  s += heading(206, 17, "SECTION A–A", `THROUGH THE BED · SCALE 1:${scS}`, 90);
  s += vs.g(section(ts), 0.3);
  s += chainV([vs.Y(0), vs.Y(H - hTop), vs.Y(H - N.h), vs.Y(H)], vs.X(-K.T) - 3, [H - hTop, `${CW}`, `${N.h} NICHE`], { from: vs.X(-K.T), size: 1.2 });
  s += chainH([vs.X(0), vs.X(K.edge), vs.X(K.deep)], vs.Y(0) - 3, [K.edge, CB], { from: vs.Y(0), size: 1.2 });
  s += chainV([vs.Y(H), vs.Y(H - yBase), vs.Y(H - yMat), vs.Y(H - HB.h)], vs.X(vFr1) + 6, [`${yBase} BASE`, B.mat.h, HB.h - yMat], { from: vs.X(vFr1) + 1, size: 1.1 });
  s += chainV([vs.Y(H), vs.Y(H - HB.h)], vs.X(vFr1) + 13, [`${HB.h} HEADBOARD`], { from: vs.X(vFr1) + 1, size: 1.15 });
  s += chainH([vs.X(0), vs.X(vHb), vs.X(vHf), vs.X(vFr1)], vs.Y(H) + 6, [vHb, HB.t, `${vFr1 - vHf} BASE`], { from: vs.Y(H) + 1, size: 1.1 });
  s += chainH([vs.X(0), vs.X(vFr1)], vs.Y(H) + 12, [`${vFr1} WALL TO FOOT`], { from: vs.Y(H) + 1, size: 1.2 });
  s += note(vs.X(K.deep - 50), vs.Y(H - N.h - C.flat - 60), vs.X(K.deep) + 14, vs.Y(330), "COVE OVER THE NICHE, 6 IN", "BENT PLY ON FORMERS, VENEER WRAPPED ROUND");
  s += note(vs.X(K.edge + 50), vs.Y(H - spkY1 + 60), vs.X(K.deep) + 14, vs.Y(120), "REAR SPEAKER BEYOND", "ON ITS BRACKET ON THE 2 IN FACE");
  s += note(vs.X(K.plaster / 2), vs.Y(1400), vs.X(K.deep) + 14, vs.Y(720), "PARCHMENT PLASTER", "BACK, SIDES AND SOFFIT, ON 12 MM BOARD");
  s += note(vs.X(vHb + 50), vs.Y(H - HB.h + 120), vs.X(K.deep) + 14, vs.Y(1180), "HEADBOARD, DUSTY-ROSE SUEDE", "¾ IN PLY BACK · BOLTED TO THE BASE");

  // detail 2 — the entrance corner, plan 1:20, in the right-hand column; marks keyed underneath
  const scD = 20, d0 = N.u1 - 250, vd = view(323 - d0 / scD, 89, scD, "Entrance corner"), td = vd.w(0.12), dd = `${vd.w(1)} ${vd.w(0.7)}`;
  s += heading(322, 70, "DETAIL 2 · THE ENTRANCE CORNER", `PLAN · SCALE 1:${scD} · D1 OPEN ON ITS FLOOR STOP`, 88);
  s += `<clipPath id="clipBW2"><rect x="${vd.X(d0)}" y="${vd.Y(-K.T)}" width="${f((W + K.T - d0) / scD)}" height="${f((K.T + 1050) / scD)}"/></clipPath>`;
  s += `<g clip-path="url(#clipBW2)">${vd.g(doorCorner(td, dd), 0.3)}</g>`;
  s += chainV([vd.Y(0), vd.Y(K.edge)], vd.X(W + K.T) + 3, [K.edge], { from: vd.X(W + K.T), size: 1.05 });
  s += chainH([vd.X(N.u1), vd.X(N.u1 + CW), vd.X(tipPt[0])], vd.Y(K.deep) + 4, [`${CW} COVE`, ""], { from: vd.Y(K.deep), size: 1.0 });
  s += bub("1", vd.X(4060), vd.Y(-120), vd.X(4060), vd.Y(30));
  s += bub("2", vd.X(4260), vd.Y(400), vd.X(stopPt[0]), vd.Y(stopPt[1]));
  { const kx = W - (DR.leaf - DR.back) * Math.cos(rad), ky = DR.lin + (DR.leaf - DR.back) * Math.sin(rad) - 40;
    s += bub("3", vd.X(3990), vd.Y(560), vd.X(kx), vd.Y(ky)); }
  s += bub("4", vd.X(3560), vd.Y(420), vd.X(tipPt[0] - 6), vd.Y(tipPt[1] - 20));
  s += bub("5", vd.X(4560), vd.Y(-120), vd.X(4560), vd.Y(K.edge));
  [["1", "THE 2 IN FACE — as deep as D1's lining, so the open leaf lies along it."],
   ["2", "Brass floor stop, 6 in in from the knob: the leaf rests on it 5½° off the face."],
   ["3", `The knob stays ${ft(knobGap)} off the veneer.`],
   ["4", "The cove starts where the leaf ends: the whole 3 ft opening stays clear."],
   ["5", "Marble skirting set flush with the veneer here — the leaf's heel clears it."]]
    .forEach(([n, t], i) => (s += bubble(324, 148 + i * 4.4 - 0.7, n) + text(328, 148 + i * 4.4, t, { size: 1.35 })));

  // detail 3 — the side table, front and plan at 1:10; drawn in full on AST-DR-049
  s += heading(206, 160, "DETAIL 3 · THE SIDE TABLES", "FRONT AND PLAN 1:10 · AFTER THE OWNER'S PHOTO · IN FULL ON AST-DR-049", 110);
  { const v3 = view(214, 170, 10, "Side table front"), t3 = v3.w(0.12), Yt = (z) => ST.h - z;
    s += v3.g(tableFront(ST.w / 2, Yt, t3, true) + `<line x1="-40" y1="${ST.h}" x2="${ST.w + 40}" y2="${ST.h}" stroke-width="${t3 * 3}"/>`, 0.3);
    s += chainH([v3.X(0), v3.X(ST.w)], v3.Y(ST.h) + 4, [ST.w], { from: v3.Y(ST.h) + 0.5, size: 1.0 });
    s += chainV([v3.Y(ST.h), v3.Y(0)], v3.X(ST.w) + 4, [ST.h], { from: v3.X(ST.w) + 0.5, size: 1.0 });
    const v5 = view(268, 172, 10, "Side table plan"), t5 = v5.w(0.12), d5 = `${v5.w(0.8)} ${v5.w(0.5)}`;
    s += v5.g(`<line x1="-30" y1="0" x2="${ST.w + 30}" y2="0" stroke-width="${t5 * 1.6}" stroke-dasharray="${d5}"/>` + tableTop(ST.w / 2, 0, t5, d5), 0.3);
    s += chainV([v5.Y(0), v5.Y(ST.d)], v5.X(ST.w) + 4, [ST.d], { from: v5.X(ST.w) + 0.5, size: 1.0 });
    ["Shaped top, moulded edge — wood, no stone.", "One drawer in burl, a brass rosette knob.", "Carved consoles; slim cabriole legs."]
      .forEach((n, i) => (s += text(268, 214 + i * 3.6, n, { size: 1.2, fill: THIN }))); }

  // what is assumed
  s += heading(112, 238, "ASSUMED", "TELL ME IF ANY OF THESE IS WRONG", 80);
  ["Five panels across and three up, as sketched: each about 1 ft 10⅜ × 2 ft ⅝ in.",
   "The 4 in white marble skirting runs along the build-out (flush with the",
   "   veneer) and into the niche. The build-out runs to the ceiling.",
   "Side tables 24 in high — the photo's table is taller; its look is kept.",
   "Speakers: Sony's rear speakers, 106 × 216 × 98 mm from Sony's spec",
   "   page — the Bar 6 has none in the box; confirm the model before the",
   "   brackets go up. Mattress 10 in (AST-DR-035)."]
    .forEach((n, i) => (s += text(112, 248 + i * 4.4, n, { size: 1.45 })));

  // notes and problems
  s += heading(18, 238, "NOTES", `REVISION ${K.rev.split(" ")[0]}`, 88);
  ["From the owner's sketches and photos. The whole wall is built out 2 in",
   "in Dark Diva veneer, polished darker (satin), on a ply carcase. Round the",
   "niche it sweeps forward in one smooth 6 in concave cove to 15 in, then a",
   "1 in flat — up both sides and across the top, no step; the veneer wrapped",
   "over bent ply, grain running round the curve. The niche — bed and both",
   "tables — is 15 in deep, all parchment plaster: back in 5 × 3 panels, sides",
   "and soffit plain. Set square to the bed's centre line and scribed at both",
   "corners, it hides the room's 2 in splay. Bed and headboard: AST-DR-035.",
   "A brass lamp over each table; cove light in the ceiling, nothing else."]
    .forEach((n, i) => (s += text(18, 248 + i * 4.4, n, { size: 1.45 })));
  s += heading(322, 17, "DECIDED · STILL OPEN", "OWNER, 7 OCT", 88);
  ["DECIDED: 2 in face all along — D1 lies along it on a floor stop (detail 2).",
   "DECIDED: one smooth cove (option A); niche 15 in; tables 16 × 14 in.",
   "DECIDED: the headboard back in rose suede, in a thin gloss-black frame.",
   "DECIDED: side tables after the owner's photo, no stone (detail 3, AST-DR-049).",
   "DECIDED: two rear speakers high on the plain faces, either side, clear of D1.",
   "DECIDED: the bed on a storage base to the floor, no legs, in gloss black.",
   "1 · The bed stands 2 ft 5⅜ in clear of the TV drawers (was 2 ft 9¾ in).",
   "2 · Fix the lamp and speaker sockets (list B2) before the panels are made."]
    .forEach((n, i) => (s += text(322, 28 + i * 4.4, n, { size: 1.35, fill: /^\d/.test(n) ? "#b3261e" : INK })));

  s += titleBlock({ title: "BED WALL — THE NICHE", sub: "Elevation · Plan · Section · Entrance corner · Side table", date: K.date, rev: K.rev, dwg: "AST-DR-034", scale: "AS NOTED @ A3" });
  window.DRAWINGS.bedwall = { title: "Bed wall — the niche · AST-DR-034", svg: mono(sheet(s)), model: true };

  // ═════════════ SHEET 2 — AST-DR-035, THE BED ═════════════
  // local coordinates: u across the bed from its left edge (front view), v along it from the headboard's back (side)
  const fwB = fw, lenB = HB.t + B.mat.l + B.over, topB = HB.h;
  function bedFront(th) {
    const Y = (h) => topB - h, c = fwB / 2;
    let o = headFront(0, Y, th);
    [-1, 1].forEach((s2) => (o += RC(c + s2 * 60, Y(yMat + 200), c + s2 * (B.mat.w / 2 - 40), Y(yMat), `fill="#fff" stroke-width="${th}"`)));
    o += RC(B.over, Y(yMat), fwB - B.over, Y(yBase), `fill="#fff" stroke-width="${th * 1.2}"`);
    o += RC(0, Y(yBase), fwB, Y(0), `rx="${B.base.ease}" fill="${WOOD}" stroke-width="${th * 1.2}"`);
    [B.base.r, fwB - B.base.r].forEach((u) => (o += `<line x1="${f(u)}" y1="${f(Y(yBase) + B.base.ease)}" x2="${f(u)}" y2="${f(Y(0) - B.base.ease)}" stroke-width="${th * 0.4}"/>`));   // where the round corners turn
    o += `<line x1="-120" y1="${Y(0)}" x2="${fwB + 120}" y2="${Y(0)}" stroke-width="${th * 3}"/>`;
    return o;
  }
  function bedSide(th, dash) {
    const Y = (h) => topB - h, v0 = HB.t, e = HB.ease;
    // the headboard's side: the black frame's edge, the rose panel ¼ in proud of it; the plaster 1 in behind (dashed)
    const F = HB.frame, fd = HB.fd;
    let o = `<path d="M 0 ${Y(HB.h)} L ${fd - 3} ${Y(HB.h)} Q ${fd} ${Y(HB.h)} ${fd} ${Y(HB.h - 3)} L ${fd} ${Y(0)} L 0 ${Y(0)} Z" fill="${WOOD}" stroke-width="${th * 1.2}"/>`;
    o += `<path d="M ${fd} ${Y(HB.h - F)} L ${HB.t - e} ${Y(HB.h - F)} Q ${HB.t} ${Y(HB.h - F)} ${HB.t} ${Y(HB.h - F - e)} L ${HB.t} ${Y(0)} L ${fd} ${Y(0)} Z" fill="${UPH}" stroke-width="${th}"/>`;
    o += `<line x1="${-HB.gap}" y1="${Y(0)}" x2="${-HB.gap}" y2="${Y(HB.h + 80)}" stroke-width="${th * 1.6}" stroke-dasharray="${dash}"/>`;
    o += RC(v0, Y(yMat), v0 + B.mat.l, Y(yBase), `fill="#fff" stroke-width="${th * 1.2}"`) + RC(v0 + 30, Y(yMat + 150), v0 + 560, Y(yMat), `fill="#fff" stroke-width="${th * 0.8}"`);
    o += RC(v0, Y(yBase), lenB, Y(0), `rx="${B.base.ease}" fill="${WOOD}" stroke-width="${th * 1.2}"`);
    o += `<line x1="${f(lenB - B.base.r)}" y1="${f(Y(yBase) + B.base.ease)}" x2="${f(lenB - B.base.r)}" y2="${f(Y(0) - B.base.ease)}" stroke-width="${th * 0.4}"/>`;
    o += `<line x1="-120" y1="${Y(0)}" x2="${lenB + 120}" y2="${Y(0)}" stroke-width="${th * 3}"/>`;
    return o;
  }
  function bedPlan(th, dash) {
    const F = HB.frame, fd = HB.fd;
    let o = `<path d="M 0 0 L ${fwB} 0 L ${fwB} ${fd} L ${fwB - F} ${fd} L ${fwB - F} ${HB.t} L ${F} ${HB.t} L ${F} ${fd} L 0 ${fd} Z" fill="${UPH}" stroke-width="${th * 1.2}"/>`
      + `<path d="M ${F} 0 L ${F} ${fd} M ${fwB - F} 0 L ${fwB - F} ${fd}" stroke-width="${th * 0.6}"/>`;     // the frame's stiles, the panel between
    o += RC(0, HB.t, fwB, lenB, `rx="${B.base.r}" fill="${WOOD}" stroke-width="${th * 1.2}"`) + RC(B.over, HB.t, fwB - B.over, HB.t + B.mat.l, `fill="#fff" stroke-width="${th}"`);
    [-1, 1].forEach((m) => (o += RC(fwB / 2 + m * 40, HB.t + 30, fwB / 2 + m * (B.mat.w / 2 - 20), HB.t + 330, `fill="#fff" stroke-width="${th * 0.7}"`)));   // pillows
    // the headboard's two bolts into the base, dashed
    o += `<g stroke-width="${th * 0.6}" stroke-dasharray="${dash}">` + [fwB * 0.25, fwB * 0.75].map((u) => `<line x1="${f(u)}" y1="${HB.ply}" x2="${f(u)}" y2="${HB.t + 80}"/>`).join("") + `</g>`;
    return o;
  }
  // the headboard's top edge at 1:5
  function headDetail(th) {
    const t = HB.t, p = HB.ply, e = HB.ease, F = HB.frame, fd = HB.fd, d = 300, fo = 50;   // the top 300: the frame's top rail, then the panel
    let o = `<path d="M 0 0 L ${fd - 3} 0 Q ${fd} 0 ${fd} 3 L ${fd} ${F} L 0 ${F} Z" fill="url(#hatchBW2)" stroke-width="${th * 1.3}"/>`;   // gloss-black frame, cut
    o += RC(0, F, p, d, `fill="url(#hatchBW2)" stroke-width="${th}"`);                                                         // ¾ in ply back
    o += `<path d="M ${p} ${F} L ${t - e} ${F} Q ${t} ${F} ${t} ${F + e} L ${t} ${d} L ${p} ${d} Z" fill="${UPH}" stroke-width="${th * 1.3}"/>`;   // foam and suede
    o += `<path d="M ${p} ${F + 5} L ${t - 5} ${F + 5} L ${t - 5} ${d}" fill="none" stroke-width="${th * 0.5}" stroke-dasharray="6 4"/>`;   // wadding line
    o += `<path d="M ${p + fo} ${F + 5} L ${p + fo} ${d}" fill="none" stroke-width="${th * 0.4}" stroke-dasharray="3 3"/>`;
    o += `<path d="M -10 ${d} L 20 ${d - 10} L 40 ${d + 10} L ${t + 10} ${d}" fill="none" stroke-width="${th * 0.6}"/>`;          // break
    return o;
  }


  window.DK.begin("bedframe");
  let s2 = frame();
  s2 += `<defs><pattern id="hatchBW2" patternUnits="userSpaceOnUse" width="5" height="5" patternTransform="rotate(-45)"><rect width="5" height="5" fill="#fff"/><line x1="0" y1="0" x2="0" y2="5" stroke="#8c8c8c" stroke-width="0.6"/></pattern></defs>`;
  const scB = 12, vf = view(28, 34, scB, "Bed front"), tf = vf.w(0.12);
  s2 += heading(18, 17, "FRONT — FROM THE FOOT", `SCALE 1:${scB} · THE STORAGE BASE AND HEADBOARD BOTH TO THE FLOOR`, 110);
  s2 += vf.g(bedFront(tf), 0.3);
  s2 += chainH([vf.X(0), vf.X(B.over), vf.X(fwB - B.over), vf.X(fwB)], vf.Y(topB) + 5, [B.over, `${B.mat.w} MATTRESS`, B.over], { from: vf.Y(topB) + 1, size: 1.2 });
  s2 += chainH([vf.X(0), vf.X(fwB)], vf.Y(topB) + 11, [`${fwB} OVERALL — THE HEADBOARD THE SAME`], { from: vf.Y(topB) + 1, size: 1.4 });
  s2 += chainV([vf.Y(topB), vf.Y(topB - yBase), vf.Y(topB - yMat), vf.Y(0)], vf.X(fwB) + 6, [`${yBase} BASE`, `${B.mat.h} MATTRESS`, HB.h - yMat], { from: vf.X(fwB) + 1, size: 1.15 });
  s2 += chainV([vf.Y(topB), vf.Y(0)], vf.X(fwB) + 13, [`${HB.h} TO THE TOP`], { from: vf.X(fwB) + 1, size: 1.25 });
  s2 += note(vf.X(fwB * 0.82), vf.Y(120), vf.X(fwB * 0.82) + 8, vf.Y(-60), "HEADBOARD, DUSTY-ROSE SUEDE", "1¼ IN GLOSS-BLACK FRAME, ITS TOP CORNERS ROUNDED");

  const vsd = view(212, 34, scB, "Bed side"), tsd = vsd.w(0.12), dsd = `${vsd.w(1)} ${vsd.w(0.7)}`;
  s2 += heading(206, 17, "SIDE", `SCALE 1:${scB} · HEADBOARD LEFT, THE PLASTER BEHIND IT DASHED`, 110);
  s2 += vsd.g(bedSide(tsd, dsd), 0.3);
  s2 += chainH([vsd.X(-HB.gap), vsd.X(0), vsd.X(HB.t), vsd.X(HB.t + B.mat.l), vsd.X(lenB)], vsd.Y(topB) + 5, [HB.gap, HB.t, `${B.mat.l} MATTRESS`, B.over], { from: vsd.Y(topB) + 1, size: 1.15 });
  s2 += chainH([vsd.X(0), vsd.X(lenB)], vsd.Y(topB) + 11, [`${lenB} OVERALL`], { from: vsd.Y(topB) + 1, size: 1.4 });
  s2 += note(vsd.X(HB.t / 2), vsd.Y(380), vsd.X(HB.t) + 12, vsd.Y(-60), "HEADBOARD, 3 IN", "BOLTED TO THE BASE — DETAIL 2 · 1 IN OFF THE PLASTER");
  s2 += note(vsd.X(lenB - 300), vsd.Y(topB - 140), vsd.X(lenB) - 10, vsd.Y(topB + 120), "STORAGE BASE, TO THE FLOOR", "NO LEGS, GLOSS BLACK · CORNERS ROUNDED 3 IN, EDGES EASED ⅝ IN", "end");

  const scP2 = 20, vpl = view(28, 152, scP2, "Bed plan"), tpl = vpl.w(0.1), dpl = `${vpl.w(1)} ${vpl.w(0.7)}`;
  s2 += heading(18, 142, "PLAN", `SCALE 1:${scP2} · HEADBOARD AT THE TOP`, 80);
  s2 += vpl.g(bedPlan(tpl, dpl), 0.3);
  s2 += chainV([vpl.Y(0), vpl.Y(HB.t), vpl.Y(lenB)], vpl.X(fwB) + 5, [HB.t, lenB - HB.t], { from: vpl.X(fwB) + 1, size: 1.1 });
  s2 += chainV([vpl.Y(0), vpl.Y(lenB)], vpl.X(fwB) + 11, [lenB], { from: vpl.X(fwB) + 1, size: 1.2 });
  s2 += chainH([vpl.X(0), vpl.X(fwB)], vpl.Y(lenB) + 5, [fwB], { from: vpl.Y(lenB) + 1, size: 1.2 });

  const vh = view(158, 158, 5, "Headboard edge"), th5 = vh.w(0.12);
  s2 += heading(150, 142, "1 · HEADBOARD TOP EDGE", "SECTION · SCALE 1:5", 60);
  s2 += vh.g(headDetail(th5), 0.3);
  s2 += chainH([vh.X(0), vh.X(HB.ply), vh.X(HB.fd), vh.X(HB.t)], vh.Y(0) - 3, [HB.ply, HB.fd - HB.ply, HB.t - HB.fd], { from: vh.Y(0), size: 1.1 });
  s2 += chainV([vh.Y(0), vh.Y(HB.frame)], vh.X(0) - 3, [HB.frame], { from: vh.X(0) - 0.5, size: 1.1 });
  { const L2 = labels(vh.X(HB.t) + 14, "right", 156, 220);
    L2.add(vh.X(HB.fd / 2), vh.Y(HB.frame / 2), "THIN BLACK FRAME, GLOSS LACQUER", "1¼ IN FACE, AS THE MIRROR'S · TOP AND BOTH SIDES");
    L2.add(vh.X(HB.ply / 2), vh.Y(160), "¾ IN PLY BACK", "THE SUEDE TURNED OVER AND STAPLED BEHIND");
    L2.add(vh.X(HB.ply + 25), vh.Y(230), "2 IN FOAM, WADDING OVER", "");
    L2.add(vh.X(HB.t - 3), vh.Y(90), "DUSTY-ROSE SUEDE PANEL", "¼ IN PROUD OF THE FRAME · PLAIN");
    s2 += L2.draw(); }

  s2 += heading(300, 142, "2 · FIXING", "", 40);
  ["The headboard bolts to the base's head end —",
   "two M8 bolts through the base into T-nuts in the",
   "ply back, the foam relieved round them (dashed",
   "on the plan). It stands on the floor, 1 in clear of",
   "the parchment, and never hangs off the wall."]
    .forEach((n, i) => (s2 += text(300, 152 + i * 4.3, n, { size: 1.45 })));

  s2 += heading(300, 182, "NOTES", `REVISION ${B.rev.split(" ")[0]}`, 100);
  ["The bed on a storage base (owner, 7 Oct): a plain box straight down to",
   "the floor, no legs, 2 in past the 6 ft × 6 ft 6 in mattress at the sides",
   "and foot, 11 in to the mattress. The storage inside is not drawn.",
   "The slim upholstered headboard behind it, the frame's width, 3 ft 4 in",
   "high, also to the floor: a dusty-rose suede panel in a 1¼ in gloss-black",
   "frame — as thin as the dressing mirror's. The base in GLOSS BLACK lacquer",
   "(owner, 7 Oct): the room's black accent, Deco with the rose. Mattress 10 in."]
    .forEach((n, i) => (s2 += text(300, 193 + i * 4.3, n, { size: 1.45 })));

  s2 += titleBlock({ title: "THE BED", sub: "Front · Side · Plan · Headboard", date: B.date, rev: B.rev, dwg: "AST-DR-035", scale: "AS NOTED @ A3" });
  window.DRAWINGS.bedframe = { title: "The bed · AST-DR-035", svg: mono(sheet(s2)), model: true };
})();
