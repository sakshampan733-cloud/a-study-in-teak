// The bed wall — AST-DR-034 — and the bed — AST-DR-035. From the owner's sketches and photos (03.10.2026); rev 5 07.10.2026.
// The whole bed wall is built out 2 in in Dark Diva veneer, polished darker, and round the niche that holds the bed and
// both side tables the face sweeps forward in one smooth concave cove — up both sides and across the top — to 15 in at
// the niche's edge (owner, 7 Oct: option A, 6 in along the wall then a 1 in flat, no step; the veneer wrapped over bent
// ply, satin polish). The niche is 15 in deep, lined with parchment-plaster panels in a grid, and the bed in it is the one
// in the owner's photo: a low dark-wood platform on turned feet, with the slim upholstered headboard back in dusty-rose
// suede (owner, 7 Oct; the long cushion goes). Side tables 16 × 14 in, a white marble slab set flush in a teak rim on top.
// A Sony rear speaker high on each plain face. D1 opens flat along the 2 in face onto a floor stop.
// Seen from the room: the dressing (right-wall) corner on the LEFT of the elevation, the entrance (left-wall) corner on
// the RIGHT. u runs along the wall from the dressing corner; v comes out from the wall into the room. Real units mm.

window.DRAWINGS = window.DRAWINGS || {};

const BEDWALL = {
  rev: "5 — 2 in face, 15 in niche; headboard; marble-topped tables; speakers",
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
  side: { w: 406, d: 356, h: 610, top: 32, rim: 45, stone: 20 },   // 16 in wide, 14 in deep (owner), 24 in high; the top a 1¾ in
                                            // teak rim round a ¾ in white marble slab, set flush on a ½ in ply bed (owner, 7 Oct)
  spk: { w: 106, h: 216, d: 98, y0: 2362, u: 305 },  // Sony rear speakers (Sony's spec, 106 × 216 × 98), 2 in above the open door's
                                            // top, each in the middle of a plain face and square on the bed (owner: "high… a bit far")
  lamp: { y: 1290, span: 150, proj: 230 },  // a wall lamp over each side table (owner): the room's brass twin-arm sconce, as AST-DR-007
};

// The bed in the owner's photo, sized to the 6 ft × 6 ft 6 in mattress on the plan. Proportions read off the photo.
const BEDFRAME = {
  rev: "3 — the headboard back, dusty-rose suede; no cushion",
  date: "07.10.2026",
  mat: { w: 1829, l: 1981, h: 254 },        // 6 ft × 6 ft 6 in, 10 in thick — mattress to be chosen
  over: 51,                                 // the frame runs 2 in past the mattress at the sides and the foot
  rail: { h: 102, lip: 25, t: 45 },         // 4 in rail, 1 in top lip, 1¾ in thick
  leg: { h: 178, d: 95, top: 70, foot: 60, in: 150 },   // 7 in turned bun foot, 3¾ in at its widest, set in 6 in
  head: { h: 1016, t: 76, gap: 25, ply: 18, ease: 18 }, // headboard top 3 ft 4 in off the floor, 3 in thick, 1 in off the plaster (owner, 7 Oct)
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
  const yLeg = B.leg.h, yRail = yLeg + B.rail.h, yMat = yRail + B.mat.h;
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

  // a side-table top in plan: the teak rim, the marble slab set in it, a few soft veins
  function tableTop(c, v0, th) {
    const T_ = K.side, x0 = c - T_.w / 2, x1 = c + T_.w / 2, v1 = v0 + T_.d, r = T_.rim;
    let o = RC(x0, v0, x1, v1, `fill="#fff" stroke-width="${th}"`) + RC(x0 + r, v0 + r, x1 - r, v1 - r, `fill="${MARB}" stroke-width="${th * 0.8}"`);
    const vx = (k) => `M ${f(x0 + r)} ${f(v0 + r + k * 60)} C ${f(x0 + 140)} ${f(v0 + r + k * 60 + 50)} ${f(x1 - 160)} ${f(v1 - r - 140 + k * 40)} ${f(x1 - r)} ${f(v1 - r - 60 + k * 30)}`;
    return o + `<path d="${vx(0)} ${vx(1.3)}" fill="none" stroke-width="${th * 0.3}"/>`;
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
    // side tables with their marble tops, the headboard, frame, mattress, pillows
    tables.forEach((c) => (o += tableTop(c, K.plaster, th)));
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
    // the bed from its foot: the headboard behind, the frame on turned feet, mattress and pillows
    o += headFront(bc - fw / 2, Y, th);
    [-1, 1].forEach((s) => (o += RC(bc + s * 60, Y(yMat + 200), bc + s * (B.mat.w / 2 - 40), Y(yMat), `fill="#fff" stroke-width="${th}"`)));
    o += RC(bc - B.mat.w / 2, Y(yMat), bc + B.mat.w / 2, Y(yRail), `fill="#fff" stroke-width="${th * 1.2}"`);
    o += RC(bc - fw / 2, Y(yRail), bc + fw / 2, Y(yLeg), `fill="${WOOD}" stroke-width="${th * 1.2}"`) + `<line x1="${f(bc - fw / 2)}" y1="${Y(yRail - B.rail.lip)}" x2="${f(bc + fw / 2)}" y2="${Y(yRail - B.rail.lip)}" stroke-width="${th * 0.6}"/>`;
    [-1, 1].forEach((s) => (o += legPath(bc + s * (fw / 2 - B.leg.in), Y, th)));
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
  // a side table from the front: the top's teak rim (the marble is set flush inside it, so it does not show from here),
  // one drawer with a brass keyhole, four slim splayed legs
  function tableFront(c, Y, th) {
    const T_ = K.side, w = T_.w, h = T_.h, x0 = c - w / 2, bx = 10, yb = h - 150;
    let o = RC(x0, Y(h), x0 + w, Y(h - T_.top), `fill="${WOOD}" stroke-width="${th}"`);
    o += RC(x0 + bx, Y(h - T_.top), x0 + w - bx, Y(yb), `fill="${WOOD}" stroke-width="${th}"`) + RC(x0 + bx + 18, Y(h - T_.top - 10), x0 + w - bx - 18, Y(yb + 10), `fill="none" stroke-width="${th * 0.6}"`);
    o += `<circle cx="${f(c)}" cy="${f(Y((h - T_.top + yb) / 2))}" r="9" fill="#fff" stroke-width="${th * 0.8}"/>`;
    o += `<path d="M ${f(x0 + bx + 4)} ${Y(yb)} L ${f(x0 - 8)} ${Y(0)} L ${f(x0 + 16)} ${Y(0)} L ${f(x0 + bx + 32)} ${Y(yb)} M ${f(x0 + w - bx - 4)} ${Y(yb)} L ${f(x0 + w + 8)} ${Y(0)} L ${f(x0 + w - 16)} ${Y(0)} L ${f(x0 + w - bx - 32)} ${Y(yb)}" fill="${WOOD}" stroke-width="${th}"/>`;
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
  function headFront(x0, Y, th) {
    return RC(x0, Y(HB.h), x0 + fw, Y(yMat - 40), `fill="${UPH}" stroke-width="${th * 1.2}"`)
      + `<line x1="${f(x0 + 12)}" y1="${f(Y(HB.h - HB.ease))}" x2="${f(x0 + fw - 12)}" y2="${f(Y(HB.h - HB.ease))}" stroke-width="${th * 0.4}"/>`;
  }
  // a turned bun foot, centred on u, as seen square-on
  function legPath(u, Y, th) {
    const L = B.leg, r1 = L.top / 2, r2 = L.d / 2, r3 = L.foot / 2, y0 = Y(L.h), y1 = Y(0);
    return `<path d="M ${f(u - r1)} ${y0} L ${f(u - r1)} ${f(y0 + 16)} C ${f(u - r2)} ${f(y0 + 30)} ${f(u - r2 - 4)} ${f(y0 + 90)} ${f(u - r2)} ${f(y0 + 110)} C ${f(u - r2 + 6)} ${f(y1 - 30)} ${f(u - r3)} ${f(y1 - 10)} ${f(u - r3)} ${y1}`
      + ` L ${f(u + r3)} ${y1} C ${f(u + r3)} ${f(y1 - 10)} ${f(u + r2 - 6)} ${f(y1 - 30)} ${f(u + r2)} ${f(y0 + 110)} C ${f(u + r2 + 4)} ${f(y0 + 90)} ${f(u + r2)} ${f(y0 + 30)} ${f(u + r1)} ${f(y0 + 16)} L ${f(u + r1)} ${y0} Z" fill="${WOOD}" stroke-width="${th}"/>`
      + `<line x1="${f(u - r1)}" y1="${f(y0 + 16)}" x2="${f(u + r1)}" y2="${f(y0 + 16)}" stroke-width="${th * 0.6}"/>`;
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
    // beyond: the side table (thin, its marble-topped rim), and the build-out's 15 in face at the niche edge
    { const T_ = K.side, v0 = K.plaster, v1 = v0 + T_.d;
      o += `<g fill="none" stroke-width="${th * 0.5}" ${dsh}>` + RC(v0, Y(T_.h), v1, Y(T_.h - T_.top)) + RC(v0 + 10, Y(T_.h - T_.top), v1 - 10, Y(T_.h - 150))
        + `<path d="M ${v0 + 14} ${Y(T_.h - 150)} L ${v0 - 4} ${Y(0)} M ${v1 - 14} ${Y(T_.h - 150)} L ${v1 + 4} ${Y(0)}"/></g>`; }
    o += `<line x1="${K.deep}" y1="${Y(N.h)}" x2="${K.deep}" y2="${Y(0)}" stroke-width="${th * 0.5}" ${dsh}/>`;
    // beyond, high on the plain face past the niche: a rear speaker on its bracket
    o += `<g fill="none" stroke-width="${th * 0.7}" ${dsh}><rect x="${K.edge + 6}" y="${Y(spkY1)}" width="${K.spk.d}" height="${K.spk.h}" rx="10"/><path d="M ${K.edge} ${Y(K.spk.y0 + 140)} L ${K.edge + 6} ${Y(K.spk.y0 + 140)}"/></g>`;
    // the wall lamp over the side table, beyond (dashed): backplate on the plaster, arm, shade
    { const y = K.lamp.y, p = K.plaster + K.lamp.proj, d = dsh;
      o += `<g fill="none" stroke-width="${th * 0.8}" ${d}><rect x="${K.plaster}" y="${Y(y + 60)}" width="18" height="120"/><path d="M ${K.plaster + 18} ${Y(y - 10)} C ${K.plaster + 90} ${Y(y - 70)} ${p - 20} ${Y(y - 50)} ${p} ${Y(y + 20)}"/><path d="M ${p - 60} ${Y(y + 90)} L ${p + 60} ${Y(y + 90)} L ${p + 36} ${Y(y + 190)} L ${p - 36} ${Y(y + 190)} Z"/></g>`; }
    // the bed, cut: the headboard (ply back, foam and suede, eased top) bolted to the frame's head rail; the mattress, a pillow, the feet
    o += headCut(vHb, Y, yLeg, th);
    o += RC(vHf, Y(yMat), vMat1, Y(yRail), `fill="#fff" stroke-width="${th * 1.2}"`) + RC(vHf + 30, Y(yMat + 150), vHf + 560, Y(yMat), `fill="#fff" stroke-width="${th * 0.8}"`);
    o += RC(vHf, Y(yRail), vFr1, Y(yLeg), `fill="${WOOD}" stroke-width="${th * 1.2}"`) + `<line x1="${vHf}" y1="${Y(yRail - B.rail.lip)}" x2="${vFr1}" y2="${Y(yRail - B.rail.lip)}" stroke-width="${th * 0.6}"/>`;
    [vHf + B.leg.in, vFr1 - B.leg.in].forEach((v) => (o += legPath(v, Y, th)));
    o += RC(vHf + 300, Y(15), vFr1 + 200, Y(0), `fill="${RUG}" stroke-width="${th * 0.5}"`);
    o += `<line x1="${-K.T}" y1="${Y(0)}" x2="${vFr1 + 250}" y2="${Y(0)}" stroke-width="${th * 4}"/><line x1="${-K.T}" y1="${Y(H)}" x2="${vFr1 + 250}" y2="${Y(H)}" stroke-width="${th * 2}" stroke-dasharray="40 20"/>`;
    return o;
  }
  // the headboard cut through, back at v0, from its foot (yb) to its top: ¾ in ply back, then foam under suede with an eased top;
  // a steel bracket (hidden) carries it on the frame's head rail
  function headCut(v0, Y, yb, th) {
    const t = HB.t, p = HB.ply, e = HB.ease, yt = HB.h;
    let o = RC(v0, Y(yt - 4), v0 + p, Y(yb), `fill="url(#hatchBW2)" stroke-width="${th}"`);
    o += `<path d="M ${v0 + p} ${Y(yt)} L ${f(v0 + t - e)} ${Y(yt)} Q ${v0 + t} ${Y(yt)} ${v0 + t} ${Y(yt - e)} L ${v0 + t} ${Y(yb + 6)} L ${v0 + p} ${Y(yb + 6)} Z" fill="${UPH}" stroke-width="${th * 1.2}"/>`;
    o += RC(v0 + p, Y(yRail - 30), v0 + t + 60, Y(yRail - 36), `fill="${INK}" stroke="none"`);                                            // the bracket's flat
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

  // ════════ DETAIL 3 — the side table's top: the marble set flush in the teak rim ════════
  // section through a side edge, x across the edge (the rim on the right, outside), y down from the top face
  function topEdge(th) {
    const T_ = K.side, r = T_.rim, st = T_.stone, tt = T_.top, ply = tt - st, x0 = 30, xr = 80, xo = xr + r, ap = 18, xa = xo - 10;
    const brk = (x, y0, y1) => `<path d="M ${x} ${y0} L ${x} ${y0 + (y1 - y0) * 0.35} L ${x - 4} ${y0 + (y1 - y0) * 0.45} L ${x + 4} ${y0 + (y1 - y0) * 0.55} L ${x} ${y0 + (y1 - y0) * 0.65} L ${x} ${y1}" fill="none" stroke-width="${th * 0.6}"/>`;
    let o = `<path d="M ${x0} 0 L ${xr - 1} 0 L ${xr - 1} ${st} L ${x0} ${st} Z" fill="#fff" stroke-width="${th * 1.3}"/>`;                     // marble
    o += `<path d="M ${x0 + 6} 6 C ${x0 + 20} 9 ${x0 + 30} 4 ${xr - 8} 12" fill="none" stroke-width="${th * 0.35}"/>`;                           // a vein
    o += `<path d="M ${x0} ${st} L ${xr + 8} ${st} L ${xr + 8} ${tt} L ${x0} ${tt} Z" fill="url(#hatchBW2)" stroke-width="${th}"/>`;            // ply bed, tongued into the rim
    o += `<path d="M ${xr} 0 L ${xo - 3} 0 Q ${xo} 0 ${xo} 3 L ${xo} ${tt} L ${xr + 8} ${tt} L ${xr + 8} ${st} L ${xr} ${st} Z" fill="#fff" stroke-width="${th * 1.3}"/>`;   // teak rim
    o += [0.3, 0.55, 0.8].map((k) => `<path d="M ${xr + 12} ${f(tt * k - 2)} Q ${xr + 25} ${f(tt * k + 1)} ${xo - 4} ${f(tt * k - 1)}" fill="none" stroke-width="${th * 0.3}"/>`).join("");   // grain
    o += `<line x1="${xr - 0.5}" y1="0" x2="${xr - 0.5}" y2="${st}" stroke-width="${th * 0.5}"/>`;                                                // the 1 mm joint
    o += `<path d="M ${xa - ap} ${tt} L ${xa} ${tt} L ${xa} ${tt + 40}" fill="none" stroke-width="${th * 1.2}"/><path d="M ${xa - ap} ${tt} L ${xa - ap} ${tt + 40}" fill="none" stroke-width="${th * 1.2}"/>`;   // side rail
    o += `<path d="M ${xa - ap - 14} ${tt + 4} L ${xa - ap} ${tt + 4} M ${xa - ap - 14} ${tt} L ${xa - ap - 14} ${tt + 12} L ${xa - ap} ${tt + 12}" fill="none" stroke-width="${th * 0.8}"/>`;   // a wooden button
    o += brk(x0, -2, tt + 2) + `<path d="M ${xa - ap - 2} ${tt + 40} L ${xa + 2} ${tt + 40}" stroke-width="${th * 0.6}" stroke-dasharray="2 1.5"/>`;
    return o;
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
    s += note(ve.X(bc + fw / 2 - 150), ve.Y(H - HB.h + 150), ve.X(bc + fw / 2 + 120), ve.Y(H - 1150), "HEADBOARD, DUSTY-ROSE SUEDE", "THE FRAME'S WIDTH — AST-DR-035");
    s += note(ve.X(W - 150), ve.Y(H - 1500), ve.X(leafTip - 120), ve.Y(-110), "D1 OPEN ON ITS FLOOR STOP (DASHED)", "ALONG THE 2 IN FACE — DETAIL 2", "end");
    s += note(ve.X(tables[0] - 60), ve.Y(H - 560), ve.X(N.u0 - CW) - 2, ve.Y(H - 420), "SIDE TABLE", "MARBLE TOP — DETAIL 3", "end");
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
  s += note(vp.X(tables[0] - 60), vp.Y(K.plaster + K.side.d - 100), vp.X(330), vp.Y(1050), "SIDE TABLE 16 × 14 IN", "MARBLE INSET IN A TEAK RIM");
  s += text(vp.X(bc), vp.Y(vHf + 1100), "BED 6 FT × 6 FT 6", { size: 1.6, anchor: "middle", fill: THIN });
  s += cutMark(vp.X(bc) + 4, vp.Y(vFr1 + 150), "A", "up");

  // section A–A 1:25
  const scS = 25, vs = view(214, 32, scS, "Bed wall section A-A"), ts = vs.w(0.12);
  s += heading(206, 17, "SECTION A–A", `THROUGH THE BED · SCALE 1:${scS}`, 90);
  s += vs.g(section(ts), 0.3);
  s += chainV([vs.Y(0), vs.Y(H - hTop), vs.Y(H - N.h), vs.Y(H)], vs.X(-K.T) - 3, [H - hTop, `${CW}`, `${N.h} NICHE`], { from: vs.X(-K.T), size: 1.2 });
  s += chainH([vs.X(0), vs.X(K.edge), vs.X(K.deep)], vs.Y(0) - 3, [K.edge, CB], { from: vs.Y(0), size: 1.2 });
  s += chainV([vs.Y(H), vs.Y(H - yLeg), vs.Y(H - yRail), vs.Y(H - yMat), vs.Y(H - HB.h)], vs.X(vFr1) + 6, [yLeg, B.rail.h, B.mat.h, HB.h - yMat], { from: vs.X(vFr1) + 1, size: 1.1 });
  s += chainV([vs.Y(H), vs.Y(H - HB.h)], vs.X(vFr1) + 13, [`${HB.h} HEADBOARD`], { from: vs.X(vFr1) + 1, size: 1.15 });
  s += chainH([vs.X(0), vs.X(vHb), vs.X(vHf), vs.X(vFr1)], vs.Y(H) + 6, [vHb, HB.t, `${vFr1 - vHf} FRAME`], { from: vs.Y(H) + 1, size: 1.1 });
  s += chainH([vs.X(0), vs.X(vFr1)], vs.Y(H) + 12, [`${vFr1} WALL TO FOOT`], { from: vs.Y(H) + 1, size: 1.2 });
  s += note(vs.X(K.deep - 50), vs.Y(H - N.h - C.flat - 60), vs.X(K.deep) + 14, vs.Y(330), "COVE OVER THE NICHE, 6 IN", "BENT PLY ON FORMERS, VENEER WRAPPED ROUND");
  s += note(vs.X(K.edge + 50), vs.Y(H - spkY1 + 60), vs.X(K.deep) + 14, vs.Y(120), "REAR SPEAKER BEYOND", "ON ITS BRACKET ON THE 2 IN FACE");
  s += note(vs.X(K.plaster / 2), vs.Y(1400), vs.X(K.deep) + 14, vs.Y(720), "PARCHMENT PLASTER", "BACK, SIDES AND SOFFIT, ON 12 MM BOARD");
  s += note(vs.X(vHb + 50), vs.Y(H - HB.h + 120), vs.X(K.deep) + 14, vs.Y(1180), "HEADBOARD, DUSTY-ROSE SUEDE", "¾ IN PLY BACK · BOLTED TO THE HEAD RAIL");

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

  // detail 3 — the side table's top: plan 1:10, section through its side edge 1:2
  s += heading(206, 160, "DETAIL 3 · SIDE-TABLE TOP", "PLAN 1:10 · SECTION THROUGH THE SIDE EDGE 1:2 · MARBLE FLUSH IN A TEAK RIM", 110);
  { const v3 = view(213, 176, 10, "Side table top plan"), t3 = v3.w(0.12), T_ = K.side;
    s += v3.g(tableTop(T_.w / 2, 0, t3), 0.3);
    s += chainH([v3.X(0), v3.X(T_.rim), v3.X(T_.w - T_.rim), v3.X(T_.w)], v3.Y(T_.d) + 4, [T_.rim, T_.w - 2 * T_.rim, T_.rim], { from: v3.Y(T_.d) + 0.5, size: 1.0 });
    s += chainH([v3.X(0), v3.X(T_.w)], v3.Y(T_.d) + 9, [`${T_.w} TOP`], { from: v3.Y(T_.d) + 0.5, size: 1.1 });
    s += chainV([v3.Y(0), v3.Y(T_.rim), v3.Y(T_.d - T_.rim), v3.Y(T_.d)], v3.X(T_.w) + 4, [T_.rim, T_.d - 2 * T_.rim, T_.rim], { from: v3.X(T_.w) + 0.5, size: 1.0 });
    s += chainV([v3.Y(0), v3.Y(T_.d)], v3.X(T_.w) + 9, [`${T_.d}`], { from: v3.X(T_.w) + 0.5, size: 1.1 });
    s += text(v3.X(T_.w / 2), v3.Y(T_.d / 2) + 0.5, "WHITE MARBLE", { size: 1.2, anchor: "middle", fill: THIN });
  }
  { const v4 = view(262 - 30 / 2, 180, 2, "Side table top section"), t4 = v4.w(0.1), T_ = K.side, xr = 80, xo = xr + T_.rim, xa = xo - 10;
    s += v4.g(topEdge(t4), 0.3);
    s += chainV([v4.Y(0), v4.Y(T_.stone), v4.Y(T_.top)], v4.X(xo) + 3, [T_.stone, T_.top - T_.stone], { from: v4.X(xo) + 0.5, size: 1.0 });
    s += chainV([v4.Y(0), v4.Y(T_.top)], v4.X(xo) + 8, [T_.top], { from: v4.X(xo) + 0.5, size: 1.05 });
    s += chainH([v4.X(xr), v4.X(xo)], v4.Y(0) - 3, [T_.rim], { from: v4.Y(0) - 0.5, size: 1.0 });
    s += text(v4.X(55), v4.Y(T_.stone / 2) + 0.5, "WHITE MARBLE", { size: 1.25, anchor: "middle" }) + text(v4.X(55), v4.Y(T_.stone + 6) + 0.45, "½ IN PLY BED", { size: 1.05, anchor: "middle" });
    s += text(v4.X(xr + T_.rim / 2 + 3), v4.Y(T_.top / 2) + 0.5, "TEAK", { size: 1.25, anchor: "middle" });
    s += note(v4.X(xr - 0.5), v4.Y(0.5), v4.X(xo) + 13, v4.Y(-9), "1 MM JOINT, CLEAR SILICONE", "ALL ROUND THE STONE");
    const L3 = labels(324, "right", 184, 206, { land: 5 });
    L3.add(v4.X(xo - 2), v4.Y(2), "EASED TOP EDGE", "THE STONE AND THE RIM FLUSH ON TOP");
    L3.add(v4.X(xa - 4), v4.Y(T_.top + 26), "SIDE RAIL, ¾ IN", "THE TOP HELD DOWN ON WOODEN BUTTONS");
    s += L3.draw();
    ["MARBLE — white, honed and sealed, ¾ in; set flush in the rim.",
     "PLY BED — ½ in, tongued into a groove in the rim; the stone bedded",
     "   on it in silicone, so it can move free of the timber.",
     "RIM — teak, 1¾ × 1¼ in, mitred at the corners, polished dark."]
      .forEach((n, i) => (s += text(324, 214 + i * 4, n, { size: 1.3 }))); }

  // what is assumed
  s += heading(112, 238, "ASSUMED", "TELL ME IF ANY OF THESE IS WRONG", 80);
  ["Five panels across and three up, as sketched: each about 1 ft 10⅜ × 2 ft ⅝ in.",
   "The 4 in white marble skirting runs along the build-out (flush with the",
   "   veneer) and into the niche. The build-out runs to the ceiling.",
   "Side tables 24 in high, one drawer, four splayed legs, as the photo.",
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
   "corners, it hides the room's 2 in splay. Headboard and bed: AST-DR-035.",
   "A brass lamp over each table; cove light in the ceiling, nothing else."]
    .forEach((n, i) => (s += text(18, 248 + i * 4.4, n, { size: 1.45 })));
  s += heading(322, 17, "DECIDED · STILL OPEN", "OWNER, 7 OCT", 88);
  ["DECIDED: 2 in face all along — D1 lies along it on a floor stop (detail 2).",
   "DECIDED: one smooth cove (option A); niche 15 in; tables 16 × 14 in.",
   "DECIDED: the headboard back, dusty-rose suede — the long cushion goes.",
   "DECIDED: tables topped in white marble, flush in a teak rim (detail 3).",
   "DECIDED: two rear speakers high on the plain faces, either side, clear of D1.",
   "1 · The bed stands 2 ft 5⅜ in clear of the TV drawers (2 ft 9¾ in before",
   "   the frame and headboard) — the walk round its foot.",
   "2 · Lamp and speaker sockets go through the plaster and veneer — fix",
   "   their places (list item B2) before the panels are made."]
    .forEach((n, i) => (s += text(322, 28 + i * 4.4, n, { size: 1.35, fill: /^\d/.test(n) ? "#b3261e" : INK })));

  s += titleBlock({ title: "BED WALL — THE NICHE", sub: "Elevation · Plan · Section · Entrance corner · Table top", date: K.date, rev: K.rev, dwg: "AST-DR-034", scale: "AS NOTED @ A3" });
  window.DRAWINGS.bedwall = { title: "Bed wall — the niche · AST-DR-034", svg: mono(sheet(s)), model: true };

  // ═════════════ SHEET 2 — AST-DR-035, THE BED ═════════════
  // local coordinates: u across the bed from its left edge (front view), v along it from the headboard's back (side)
  const fwB = fw, lenB = HB.t + B.mat.l + B.over, topB = HB.h;
  function bedFront(th) {
    const Y = (h) => topB - h, c = fwB / 2;
    let o = headFront(0, Y, th);
    [-1, 1].forEach((s2) => (o += RC(c + s2 * 60, Y(yMat + 200), c + s2 * (B.mat.w / 2 - 40), Y(yMat), `fill="#fff" stroke-width="${th}"`)));
    o += RC(B.over, Y(yMat), fwB - B.over, Y(yRail), `fill="#fff" stroke-width="${th * 1.2}"`);
    o += RC(0, Y(yRail), fwB, Y(yLeg), `fill="${WOOD}" stroke-width="${th * 1.2}"`) + `<line x1="0" y1="${Y(yRail - B.rail.lip)}" x2="${fwB}" y2="${Y(yRail - B.rail.lip)}" stroke-width="${th * 0.6}"/>`;
    [B.leg.in, fwB - B.leg.in].forEach((u) => (o += legPath(u, Y, th)));
    o += `<line x1="-120" y1="${Y(0)}" x2="${fwB + 120}" y2="${Y(0)}" stroke-width="${th * 3}"/>`;
    return o;
  }
  function bedSide(th, dash) {
    const Y = (h) => topB - h, v0 = HB.t, e = HB.ease;
    // the headboard's side: ply back, upholstery with the eased top; the plaster 1 in behind it (dashed)
    let o = `<path d="M 0 ${Y(HB.h - 4)} L 0 ${Y(yLeg)} L ${HB.t} ${Y(yLeg)} L ${HB.t} ${Y(HB.h - e)} Q ${HB.t} ${Y(HB.h)} ${HB.t - e} ${Y(HB.h)} L ${HB.ply} ${Y(HB.h)} L ${HB.ply} ${Y(HB.h - 4)} Z" fill="${UPH}" stroke-width="${th * 1.2}"/>`;
    o += `<line x1="${HB.ply}" y1="${Y(HB.h)}" x2="${HB.ply}" y2="${Y(yLeg)}" stroke-width="${th * 0.6}"/>`;
    o += `<line x1="${-HB.gap}" y1="${Y(0)}" x2="${-HB.gap}" y2="${Y(HB.h + 80)}" stroke-width="${th * 1.6}" stroke-dasharray="${dash}"/>`;
    o += RC(v0, Y(yMat), v0 + B.mat.l, Y(yRail), `fill="#fff" stroke-width="${th * 1.2}"`) + RC(v0 + 30, Y(yMat + 150), v0 + 560, Y(yMat), `fill="#fff" stroke-width="${th * 0.8}"`);
    o += RC(v0, Y(yRail), lenB, Y(yLeg), `fill="${WOOD}" stroke-width="${th * 1.2}"`) + `<line x1="${v0}" y1="${Y(yRail - B.rail.lip)}" x2="${lenB}" y2="${Y(yRail - B.rail.lip)}" stroke-width="${th * 0.6}"/>`;
    [v0 + B.leg.in, (v0 + lenB) / 2, lenB - B.leg.in].forEach((v, i) => (o += i === 1 ? `<g opacity=".45">${legPath(v, Y, th)}</g>` : legPath(v, Y, th)));
    o += `<line x1="-120" y1="${Y(0)}" x2="${lenB + 120}" y2="${Y(0)}" stroke-width="${th * 3}"/>`;
    return o;
  }
  function bedPlan(th, dash) {
    let o = RC(0, 0, fwB, HB.t, `fill="${UPH}" stroke-width="${th * 1.2}"`) + `<line x1="0" y1="${HB.ply}" x2="${fwB}" y2="${HB.ply}" stroke-width="${th * 0.6}"/>`;
    o += RC(0, HB.t, fwB, lenB, `fill="${WOOD}" stroke-width="${th * 1.2}"`) + RC(B.over, HB.t, fwB - B.over, HB.t + B.mat.l, `fill="#fff" stroke-width="${th}"`);
    // slats, the centre rail and the headboard's two bolts below, dashed
    o += `<g stroke-width="${th * 0.6}" stroke-dasharray="${dash}">` + RC(B.rail.t, HB.t + B.rail.t, fwB - B.rail.t, lenB - B.rail.t) + `<line x1="${fwB / 2}" y1="${HB.t + B.rail.t}" x2="${fwB / 2}" y2="${lenB - B.rail.t}"/>`;
    for (let v = HB.t + 160; v < lenB - 100; v += 160) o += `<line x1="${B.rail.t}" y1="${v}" x2="${fwB - B.rail.t}" y2="${v}"/>`;
    [fwB * 0.25, fwB * 0.75].forEach((u) => (o += `<line x1="${f(u)}" y1="${HB.ply}" x2="${f(u)}" y2="${HB.t + B.rail.t + 20}"/>`));
    o += `</g>`;
    [[B.leg.in, HB.t + B.leg.in], [fwB - B.leg.in, HB.t + B.leg.in], [B.leg.in, lenB - B.leg.in], [fwB - B.leg.in, lenB - B.leg.in], [fwB / 2, (HB.t + lenB) / 2]]
      .forEach(([u, v], i) => (o += `<circle cx="${f(u)}" cy="${f(v)}" r="${B.leg.d / 2}" fill="none" stroke-width="${th}" ${i === 4 ? `stroke-dasharray="${dash}"` : ""}/>`));
    return o;
  }
  // the turned foot at 1:4, and the headboard's top edge at 1:5
  function legDetail(th) { return legPath(0, (h) => B.leg.h - h, th) + `<line x1="-80" y1="${B.leg.h}" x2="80" y2="${B.leg.h}" stroke-width="${th * 3}"/>` + RC(-90, -40, 90, 0, `fill="${WOOD}" stroke-width="${th}"`); }
  function headDetail(th) {
    const t = HB.t, p = HB.ply, e = HB.ease, d = 300, fo = 50;                  // the top 300 of it; 2 in foam, then wadding under the suede
    let o = RC(0, 4, p, d, `fill="url(#hatchBW2)" stroke-width="${th}"`);                                                     // ¾ in ply back
    o += `<path d="M ${p} 0 L ${t - e} 0 Q ${t} 0 ${t} ${e} L ${t} ${d} L ${p} ${d} Z" fill="${UPH}" stroke-width="${th * 1.3}"/>`;   // the suede over it all
    o += `<path d="M ${p} 6 L ${t - e - 2} 6 Q ${t - 6} 6 ${t - 6} ${e + 2} L ${t - 6} ${d}" fill="none" stroke-width="${th * 0.5}" stroke-dasharray="6 4"/>`;   // wadding line
    o += `<path d="M ${p + fo} 6 L ${p + fo} ${d}" fill="none" stroke-width="${th * 0.4}" stroke-dasharray="3 3"/>`;
    o += `<path d="M ${p} 0 L ${p - 4} 0 L ${p - 4} 4" fill="none" stroke-width="${th * 0.8}"/>`;                              // the suede turned over the ply's top and stapled behind
    o += `<path d="M -10 ${d} L 20 ${d - 10} L 40 ${d + 10} L ${t + 10} ${d}" fill="none" stroke-width="${th * 0.6}"/>`;          // break
    return o;
  }

  window.DK.begin("bedframe");
  let s2 = frame();
  s2 += `<defs><pattern id="hatchBW2" patternUnits="userSpaceOnUse" width="5" height="5" patternTransform="rotate(-45)"><rect width="5" height="5" fill="#fff"/><line x1="0" y1="0" x2="0" y2="5" stroke="#8c8c8c" stroke-width="0.6"/></pattern></defs>`;
  const scB = 12, vf = view(28, 34, scB, "Bed front"), tf = vf.w(0.12);
  s2 += heading(18, 17, "FRONT — FROM THE FOOT", `SCALE 1:${scB} · AS THE OWNER'S PHOTO`, 110);
  s2 += vf.g(bedFront(tf), 0.3);
  s2 += chainH([vf.X(0), vf.X(B.over), vf.X(fwB - B.over), vf.X(fwB)], vf.Y(topB) + 5, [B.over, `${B.mat.w} MATTRESS`, B.over], { from: vf.Y(topB) + 1, size: 1.2 });
  s2 += chainH([vf.X(0), vf.X(fwB)], vf.Y(topB) + 11, [`${fwB} OVERALL — THE HEADBOARD THE SAME`], { from: vf.Y(topB) + 1, size: 1.4 });
  s2 += chainH([vf.X(0), vf.X(B.leg.in)], vf.Y(topB) + 17, [`${B.leg.in} TO THE FOOT`], { from: vf.Y(topB) + 1, size: 1.1 });
  s2 += chainV([vf.Y(topB), vf.Y(topB - yLeg), vf.Y(topB - yRail), vf.Y(topB - yMat), vf.Y(0)], vf.X(fwB) + 6, [yLeg, B.rail.h, B.mat.h, HB.h - yMat], { from: vf.X(fwB) + 1, size: 1.15 });
  s2 += chainV([vf.Y(topB), vf.Y(0)], vf.X(fwB) + 13, [`${HB.h} TO THE TOP`], { from: vf.X(fwB) + 1, size: 1.25 });
  s2 += note(vf.X(fwB * 0.82), vf.Y(120), vf.X(fwB * 0.82) + 8, vf.Y(-60), "HEADBOARD, DUSTY-ROSE SUEDE", "PLAIN, NO BUTTONS OR PIPING · EASED TOP");

  const vsd = view(212, 34, scB, "Bed side"), tsd = vsd.w(0.12), dsd = `${vsd.w(1)} ${vsd.w(0.7)}`;
  s2 += heading(206, 17, "SIDE", `SCALE 1:${scB} · HEADBOARD LEFT, THE PLASTER BEHIND IT DASHED`, 110);
  s2 += vsd.g(bedSide(tsd, dsd), 0.3);
  s2 += chainH([vsd.X(-HB.gap), vsd.X(0), vsd.X(HB.t), vsd.X(HB.t + B.mat.l), vsd.X(lenB)], vsd.Y(topB) + 5, [HB.gap, HB.t, `${B.mat.l} MATTRESS`, B.over], { from: vsd.Y(topB) + 1, size: 1.15 });
  s2 += chainH([vsd.X(0), vsd.X(lenB)], vsd.Y(topB) + 11, [`${lenB} OVERALL`], { from: vsd.Y(topB) + 1, size: 1.4 });
  s2 += note(vsd.X(HB.t / 2), vsd.Y(380), vsd.X(HB.t) + 12, vsd.Y(-60), "HEADBOARD, 3 IN", "BOLTED TO THE FRAME — DETAIL 3 · 1 IN OFF THE PLASTER");
  s2 += note(vsd.X(lenB - 300), vsd.Y(topB - yRail + 50), vsd.X(lenB) - 10, vsd.Y(topB + 120), "FRAME RAIL, 4 IN", "1 IN LIP ON TOP · TEAK, POLISHED DARK", "end");
  s2 += note(vsd.X((HB.t + lenB) / 2), vsd.Y(topB - 80), vsd.X((HB.t + lenB) / 2) + 22, vsd.Y(topB + 120), "CENTRE FOOT", "UNDER THE MIDDLE RAIL");

  const scP2 = 20, vpl = view(28, 152, scP2, "Bed plan"), tpl = vpl.w(0.1), dpl = `${vpl.w(1)} ${vpl.w(0.7)}`;
  s2 += heading(18, 142, "PLAN", `SCALE 1:${scP2} · HEADBOARD AT THE TOP · SLATS DASHED`, 80);
  s2 += vpl.g(bedPlan(tpl, dpl), 0.3);
  s2 += chainV([vpl.Y(0), vpl.Y(HB.t), vpl.Y(lenB)], vpl.X(fwB) + 5, [HB.t, lenB - HB.t], { from: vpl.X(fwB) + 1, size: 1.1 });
  s2 += chainV([vpl.Y(0), vpl.Y(lenB)], vpl.X(fwB) + 11, [lenB], { from: vpl.X(fwB) + 1, size: 1.2 });
  s2 += chainH([vpl.X(0), vpl.X(fwB)], vpl.Y(lenB) + 5, [fwB], { from: vpl.Y(lenB) + 1, size: 1.2 });

  const vl = view(165, 166, 4, "Bed foot"), tl = vl.w(0.12);
  s2 += heading(140, 142, "1 · TURNED FOOT", "ELEVATION · SCALE 1:4", 50);
  s2 += vl.g(legDetail(tl), 0.3);
  s2 += chainV([vl.Y(0), vl.Y(B.leg.h)], vl.X(B.leg.d / 2) + 6, [B.leg.h], { from: vl.X(B.leg.d / 2) + 1, size: 1.2 });
  s2 += chainH([vl.X(-B.leg.d / 2), vl.X(B.leg.d / 2)], vl.Y(B.leg.h) + 5, [B.leg.d], { from: vl.Y(B.leg.h) + 1, size: 1.2 });
  s2 += note(vl.X(0), vl.Y(8), vl.X(B.leg.d / 2) + 16, vl.Y(-30), "COLLAR", "TURNED IN THE SOLID");

  const vh = view(214, 158, 5, "Headboard edge"), th5 = vh.w(0.12);
  s2 += heading(206, 142, "2 · HEADBOARD TOP EDGE", "SECTION · SCALE 1:5", 60);
  s2 += vh.g(headDetail(th5), 0.3);
  s2 += chainH([vh.X(0), vh.X(HB.ply), vh.X(HB.t)], vh.Y(0) - 3, [HB.ply, HB.t - HB.ply], { from: vh.Y(0), size: 1.15 });
  { const L2 = labels(vh.X(HB.t) + 14, "right", 156, 220);
    L2.add(vh.X(HB.ply / 2), vh.Y(150), "¾ IN PLY BACK", "THE SUEDE TURNED OVER AND STAPLED BEHIND");
    L2.add(vh.X(HB.ply + 25), vh.Y(220), "2 IN FOAM, WADDING OVER", "");
    L2.add(vh.X(HB.t - 4), vh.Y(60), "DUSTY-ROSE SUEDE", "PLAIN · NO PIPING, NO BUTTONS");
    L2.add(vh.X(HB.t - 6), vh.Y(6), "TOP EDGE EASED, ¾ IN RADIUS", "");
    s2 += L2.draw(); }

  s2 += heading(300, 142, "3 · FIXING", "", 40);
  ["The headboard bolts to the frame's head rail —",
   "two M8 bolts through the rail into T-nuts in the",
   "ply back, the foam relieved round them (dashed",
   "on the plan). It stands on the frame, 1 in clear of",
   "the parchment, and never hangs off the wall."]
    .forEach((n, i) => (s2 += text(300, 152 + i * 4.3, n, { size: 1.45 })));

  s2 += heading(300, 182, "NOTES", `REVISION ${B.rev.split(" ")[0]}`, 100);
  ["The bed in the owner's photo, sized to the 6 ft × 6 ft 6 in mattress:",
   "a low dark-wood platform — a 4 in rail with a 1 in lip, on five turned",
   "bun feet — with the slim upholstered headboard back (owner, 7 Oct):",
   "plain, the frame's width, 3 ft 4 in high, in dusty-rose suede as the",
   "photo. The long cushion is gone. Proportions read off the photos;",
   "mattress thickness ASSUMED until the mattress is chosen. Frame in",
   "solid teak, polished dark to sit with the Dark Diva wall."]
    .forEach((n, i) => (s2 += text(300, 193 + i * 4.3, n, { size: 1.45 })));

  s2 += titleBlock({ title: "THE BED", sub: "Front · Side · Plan · Foot · Headboard", date: B.date, rev: B.rev, dwg: "AST-DR-035", scale: "AS NOTED @ A3" });
  window.DRAWINGS.bedframe = { title: "The bed · AST-DR-035", svg: mono(sheet(s2)), model: true };
})();
