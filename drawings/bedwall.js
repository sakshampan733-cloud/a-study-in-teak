// The bed wall — AST-DR-034 — and the bed — AST-DR-035. From the owner's sketch and photo (03.10.2026).
// The whole bed wall is built out 3 in in Dark Diva veneer, polished darker, and round the niche that holds the bed and
// both side tables the face sweeps forward in a concave cove — up both sides and across the top — to 10 in at the
// niche's edge (rev 2, owner's second sketch: a long cove out of the 3 in face, not a tight rounded knob). The niche is
// 10 in deep, lined with parchment-plaster panels in a grid, and the bed in it is the one in the owner's photo: a low
// dark-wood platform on turned feet, with a slim upholstered headboard.
// Seen from the room: the dressing (right-wall) corner on the LEFT of the elevation, the entrance (left-wall) corner on
// the RIGHT. u runs along the wall from the dressing corner; v comes out from the wall into the room. Real units mm.

window.DRAWINGS = window.DRAWINGS || {};

const BEDWALL = {
  rev: "2 — a 7 in cove round the niche, sides and top; niche 6 ft 6 in",
  date: "03.10.2026",
  W: 4724, H: 2769, T: 230,                 // 15 ft 6 in wall, 9 ft 1 in ceiling, 9 in walls (AST-DR-001)
  deep: 254, edge: 76,                      // 10 in either side of the niche; 3 in at both corners (owner)
  niche: { u0: 787, u1: 3632, h: 1981 },    // bed + both side tables, as on the plan; 6 ft 6 in high (owner: lower) — ASSUMED
  cove: { r: 178, flat: 25 },               // a concave quarter-round, 7 in radius, out of the 3 in face to 10 in, then a 1 in flat edge
  grid: { cols: 5, rows: 3 },               // as sketched: five across, three up
  plaster: 20,                              // parchment plaster on 12 mm board
  skirt: 102,                               // the room's 4 in white marble skirting, carried on — ASSUMED
  door: { leaf: 914, lin: 51, t: 45 },      // D1: 3 ft leaf, 2 in lining — its hinge pin stands 2 in off this wall
  side: { w: 457, d: 406, h: 610 },         // side tables, 18 × 16 in, 24 in high — read off the photo, ASSUMED
};

// The bed in the owner's photo, sized to the 6 ft × 6 ft 6 in mattress on the plan. Proportions read off the photo.
const BEDFRAME = {
  rev: "1 — from the owner's photo",
  date: "03.10.2026",
  mat: { w: 1829, l: 1981, h: 254 },        // 6 ft × 6 ft 6 in, 10 in thick — mattress to be chosen
  over: 51,                                 // the frame runs 2 in past the mattress at the sides and the foot
  rail: { h: 102, lip: 25, t: 45 },         // 4 in rail, 1 in top lip, 1¾ in thick
  leg: { h: 178, d: 95, top: 70, foot: 60, in: 150 },   // 7 in turned bun foot, 3¾ in at its widest, set in 6 in
  head: { h: 1016, t: 76, gap: 25 },        // headboard top 3 ft 4 in off the floor, 3 in thick, 1 in off the plaster
};

(function () {
  const { INK, THIN, DIM, f, text, mmToFt, view, chainH, chainV, note, labels, heading, cutMark, bubble, frame, titleBlock, sheet } = window.DK;
  const K = BEDWALL, B = BEDFRAME, W = K.W, H = K.H, N = K.niche, C = K.cove;
  const CW = C.r + C.flat;                    // the cove band, measured from the niche's edge: 1 in flat, then the 7 in cove
  const hTop = N.h + CW;                      // where the top cove meets the 3 in face
  const ft = (mm) => mmToFt(mm).replace("'-", " ft ").replace('"', " in").replace(/^0 ft /, "").replace(/ 0 in$/, "");
  const VEN = "#dcc6a8", VEN2 = "#cdb391", PAR = "#f6eedd", UPH = "#ead6cd", WOOD = "#c9a88a", MARB = "#f1efea", RUG = "#ecebe7";

  // the bed sits on the niche's centre; the frame and headboard
  const bc = (N.u0 + N.u1) / 2, fw = B.mat.w + 2 * B.over;
  const vHb = K.plaster + B.head.gap, vHf = vHb + B.head.t, vMat1 = vHf + B.mat.l, vFr1 = vMat1 + B.over;
  const yLeg = B.leg.h, yRail = yLeg + B.rail.h, yMat = yRail + B.mat.h;
  const tables = [N.u0 + (bc - fw / 2 - N.u0) / 2, N.u1 - (N.u1 - bc - fw / 2) / 2];
  const leafTip = W - K.door.leaf;

  // the build-out's face in plan: 3 in, then the concave cove — tangent to the 3 in face, turning to run straight out
  // at the niche — then the 1 in flat edge at 10 in. (u, v) for a niche edge at ue, the band running dir (−1 left, +1 right)
  const covePts = (ue, dir, n = 18) => Array.from({ length: n + 1 }, (_, i) => { const t = (i / n) * Math.PI / 2;   // t = 0 at the 3 in face
    return [ue + dir * (CW - C.r * Math.sin(t)), K.deep - C.r * Math.cos(t)]; });
  const solidL = () => [[0, 0], [0, K.edge], ...covePts(N.u0, -1), [N.u0, K.deep], [N.u0, 0]];
  const solidR = () => [[N.u1, 0], [N.u1, K.deep], ...covePts(N.u1, 1).reverse(), [W, K.edge], [W, 0]];
  const P = (pts, a = "") => `<path d="M ${pts.map(([x, y]) => `${f(x)} ${f(y)}`).join(" L ")} Z" ${a}/>`;
  const PL = (pts, a = "") => `<path d="M ${pts.map(([x, y]) => `${f(x)} ${f(y)}`).join(" L ")}" fill="none" ${a}/>`;
  const RC = (x0, y0, x1, y1, a = "") => `<rect x="${f(Math.min(x0, x1))}" y="${f(Math.min(y0, y1))}" width="${f(Math.abs(x1 - x0))}" height="${f(Math.abs(y1 - y0))}" ${a}/>`;

  // ════════ PLAN — the wall at the top, the room below, cut at 4 ft ════════
  function plan(th, dash) {
    const hatch = `fill="url(#hatchBW)" stroke="none"`;
    let o = RC(-K.T, -K.T, W + K.T, 0, hatch) + RC(-K.T, 0, 0, 2300, hatch) + RC(W, 0, W + K.T, 2300, hatch);
    // the dressing door (right wall) and the entrance (left wall) openings
    o += RC(-K.T, 686, 0, 686 + 864, `fill="#fff" stroke="none"`) + RC(W, 0, W + K.T, 1016, `fill="#fff" stroke="none"`);
    o += `<path d="M ${-K.T} 0 L 0 0 L 0 686 M 0 1550 L 0 2300 M ${W} 2300 L ${W} 1016 M ${W} 0 L ${W + K.T} 0" stroke-width="${th * 1.6}" fill="none"/>`;
    o += `<line x1="0" y1="0" x2="${W}" y2="0" stroke-width="${th * 1.6}"/>`;
    // the build-out, Dark Diva on a ply carcase; the cove over the niche dashed (above the cut)
    o += P(solidL(), `fill="${VEN}" stroke-width="${th * 1.3}"`) + P(solidR(), `fill="${VEN}" stroke-width="${th * 1.3}"`);
    o += `<line x1="${N.u0}" y1="${K.deep}" x2="${N.u1}" y2="${K.deep}" stroke-width="${th}" stroke-dasharray="${dash}"/>`;
    // the niche back: parchment plaster
    o += RC(N.u0, 0, N.u1, K.plaster, `fill="${PAR}" stroke-width="${th}"`);
    // side tables, headboard, frame, mattress, pillows
    tables.forEach((c) => (o += RC(c - K.side.w / 2, vHb, c + K.side.w / 2, vHb + K.side.d, `fill="#fff" stroke-width="${th}"`)));
    o += RC(bc - fw / 2, vHb, bc + fw / 2, vHf, `fill="${UPH}" stroke-width="${th}"`);
    o += RC(bc - fw / 2, vHf, bc + fw / 2, vFr1, `fill="${WOOD}" stroke-width="${th}"`);
    o += RC(bc - B.mat.w / 2, vHf, bc + B.mat.w / 2, vMat1, `fill="#fff" stroke-width="${th}"`);
    [-1, 1].forEach((s) => (o += RC(bc + s * 40, vHf + 60, bc + s * (B.mat.w / 2 - 70), vHf + 380, `fill="#fff" stroke-width="${th * 0.7}"`)));
    o += `<line x1="${f(bc - B.mat.w / 2)}" y1="${f(vHf + 620)}" x2="${f(bc + B.mat.w / 2)}" y2="${f(vHf + 620)}" stroke-width="${th * 0.6}"/>`;
    // the entrance door, open flat along this wall on its ordinary hinges — where it meets the 3 in face
    const L = K.door, pin = L.lin;
    o += RC(leafTip, pin, W, pin + L.t, `fill="#fff" stroke-width="${th * 1.4}"`);
    o += `<path d="M ${W} ${pin + L.leaf} A ${L.leaf} ${L.leaf} 0 0 1 ${leafTip} ${pin}" stroke-width="${th * 0.7}" stroke-dasharray="${dash}" fill="none"/>`;
    o += RC(leafTip, pin, W, K.edge, `fill="url(#clashBW)" stroke="${DIM}" stroke-width="${th * 1.2}"`);
    return o;
  }

  // ════════ ELEVATION — seen from the room, floor to ceiling ════════
  function elevation(th) {
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
    // side tables: a single drawer with a keyhole, slim splayed legs, a pale top
    tables.forEach((c) => {
      const w = K.side.w, h = K.side.h, x0 = c - w / 2;
      o += RC(x0 - 8, Y(h), x0 + w + 8, Y(h - 25), `fill="#f3efe6" stroke-width="${th}"`);
      o += RC(x0, Y(h - 25), x0 + w, Y(h - 150), `fill="${WOOD}" stroke-width="${th}"`) + `<circle cx="${f(c)}" cy="${f(Y(h - 88))}" r="9" fill="#fff" stroke-width="${th * 0.8}"/>`;
      o += `<path d="M ${f(x0 + 12)} ${Y(h - 150)} L ${f(x0 - 10)} ${Y(0)} L ${f(x0 + 14)} ${Y(0)} L ${f(x0 + 40)} ${Y(h - 150)} M ${f(x0 + w - 12)} ${Y(h - 150)} L ${f(x0 + w + 10)} ${Y(0)} L ${f(x0 + w - 14)} ${Y(0)} L ${f(x0 + w - 40)} ${Y(h - 150)}" fill="${WOOD}" stroke-width="${th}"/>`;
    });
    // the bed from its foot: headboard behind, the frame on turned feet, mattress and pillows
    o += RC(bc - fw / 2, Y(B.head.h), bc + fw / 2, Y(yMat - 40), `fill="${UPH}" stroke-width="${th * 1.2}"`);
    o += `<path d="M ${f(bc - fw / 2 + 25)} ${Y(B.head.h)} L ${f(bc + fw / 2 - 25)} ${Y(B.head.h)}" stroke-width="${th * 0.5}"/>`;
    [-1, 1].forEach((s) => (o += RC(bc + s * 60, Y(yMat + 200), bc + s * (B.mat.w / 2 - 40), Y(yMat), `fill="#fff" stroke-width="${th}"`)));
    o += RC(bc - B.mat.w / 2, Y(yMat), bc + B.mat.w / 2, Y(yRail), `fill="#fff" stroke-width="${th * 1.2}"`);
    o += RC(bc - fw / 2, Y(yRail), bc + fw / 2, Y(yLeg), `fill="${WOOD}" stroke-width="${th * 1.2}"`) + `<line x1="${f(bc - fw / 2)}" y1="${Y(yRail - B.rail.lip)}" x2="${f(bc + fw / 2)}" y2="${Y(yRail - B.rail.lip)}" stroke-width="${th * 0.6}"/>`;
    [-1, 1].forEach((s) => (o += legPath(bc + s * (fw / 2 - B.leg.in), Y, th)));
    // the entrance door, open flat against this wall (dashed): where it stands in front of the 3 in zone
    o += RC(leafTip, Y(2311), W, Y(0), `fill="none" stroke="${DIM}" stroke-width="${th * 1.1}" stroke-dasharray="${th * 9} ${th * 6}"`);
    o += `<line x1="-150" y1="${Y(0)}" x2="${W + 150}" y2="${Y(0)}" stroke-width="${th * 4}"/><line x1="-150" y1="${Y(H)}" x2="${W + 150}" y2="${Y(H)}" stroke-width="${th * 2}" stroke-dasharray="40 20"/>`;
    return o;
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
    const Y = (h) => H - h, hatch = `fill="url(#hatchBW)" stroke="none"`;
    let o = RC(-K.T, Y(H), 0, Y(0), hatch) + `<line x1="0" y1="${Y(H)}" x2="0" y2="${Y(0)}" stroke-width="${th * 1.6}"/>`;
    // over the niche: the soffit, the 1 in flat edge, the cove sweeping back to the 3 in face, and 3 in up to the ceiling
    // concave: centred out in the room at (10 in, cove top) — leaves the flat edge running straight out, meets the 3 in face tangent
    const cv = Array.from({ length: 19 }, (_, i) => { const t = (i / 18) * Math.PI / 2; return [K.deep - C.r * Math.sin(t), hTop - C.r * Math.cos(t)]; });
    o += P([[0, Y(N.h)], [K.deep, Y(N.h)], [K.deep, Y(N.h + C.flat)], ...cv.map(([v, h]) => [v, Y(h)]), [K.edge, Y(H)], [0, Y(H)]], `fill="${VEN}" stroke-width="${th * 1.4}"`);
    o += PL([[18, Y(N.h) - 18], [K.deep - 18, Y(N.h) - 18], [K.deep - 18, Y(N.h + C.flat)]], `stroke-width="${th * 0.5}"`);
    // the niche back: parchment plaster on board, marble skirting at its foot
    o += RC(0, Y(N.h), K.plaster, Y(K.skirt), `fill="${PAR}" stroke-width="${th}"`) + RC(0, Y(K.skirt), K.plaster + 12, Y(0), `fill="${MARB}" stroke-width="${th}"`);
    // beyond: the side table (thin), and the build-out's 10 in face at the niche edge
    o += RC(vHb, Y(K.side.h), vHb + K.side.d, Y(0), `fill="none" stroke-width="${th * 0.5}" stroke-dasharray="${th * 6} ${th * 4}"`);
    o += `<line x1="${K.deep}" y1="${Y(N.h)}" x2="${K.deep}" y2="${Y(0)}" stroke-width="${th * 0.5}" stroke-dasharray="${th * 6} ${th * 4}"/>`;
    // the bed: headboard, frame rail, mattress, a foot beyond
    o += RC(vHb, Y(B.head.h), vHf, Y(yLeg), `fill="${UPH}" stroke-width="${th * 1.2}"`);
    o += RC(vHf, Y(yMat), vMat1, Y(yRail), `fill="#fff" stroke-width="${th * 1.2}"`) + RC(vHf + 40, Y(yMat + 150), vHf + 560, Y(yMat), `fill="#fff" stroke-width="${th * 0.8}"`);
    o += RC(vHf, Y(yRail), vFr1, Y(yLeg), `fill="${WOOD}" stroke-width="${th * 1.2}"`) + `<line x1="${vHf}" y1="${Y(yRail - B.rail.lip)}" x2="${vFr1}" y2="${Y(yRail - B.rail.lip)}" stroke-width="${th * 0.6}"/>`;
    [vHf + B.leg.in, vFr1 - B.leg.in].forEach((v) => (o += legPath(v, Y, th)));
    o += RC(vHb + 300, Y(15), vFr1 + 200, Y(0), `fill="${RUG}" stroke-width="${th * 0.5}"`);
    o += `<line x1="${-K.T}" y1="${Y(0)}" x2="${vFr1 + 250}" y2="${Y(0)}" stroke-width="${th * 4}"/><line x1="${-K.T}" y1="${Y(H)}" x2="${vFr1 + 250}" y2="${Y(H)}" stroke-width="${th * 2}" stroke-dasharray="40 20"/>`;
    return o;
  }

  // ════════ DETAIL 2 — the entrance corner in plan ════════
  function doorCorner(th, dash) {
    const L = K.door, pin = L.lin, hatch = `fill="url(#hatchBW)" stroke="none"`, proj = 32;
    let o = RC(N.u1 - 250, -K.T, W + K.T, 0, hatch) + RC(W, 0, W + K.T, 1250, hatch);
    o += RC(W, 0, W + K.T, 1016, `fill="#fff" stroke="none"`);
    o += `<path d="M ${N.u1 - 250} 0 L ${W} 0 M ${W} 1250 L ${W} 1016" stroke-width="${th * 1.6}" fill="none"/>`;
    o += RC(W, 0, W + L.t + 6, L.lin, `fill="#fff" stroke-width="${th}"`) + RC(W, 1016 - L.lin, W + L.t + 6, 1016, `fill="#fff" stroke-width="${th}"`);   // linings
    o += P(solidR(), `fill="${VEN}" stroke-width="${th * 1.3}"`) + RC(N.u1 - 250, 0, N.u1, K.plaster, `fill="${PAR}" stroke-width="${th}"`);
    // ordinary hinges: the leaf open flat — it runs into the 3 in face
    o += RC(leafTip, pin, W, pin + L.t, `fill="#fff" stroke-width="${th * 1.4}"`) + RC(leafTip, pin, W, K.edge, `fill="url(#clashBW)" stroke="${DIM}" stroke-width="${th * 1.4}"`);
    o += `<circle cx="${W}" cy="${pin}" r="7" fill="${INK}"/>`;
    o += `<path d="M ${W} ${pin + L.leaf} A ${L.leaf} ${L.leaf} 0 0 1 ${leafTip} ${pin}" stroke-width="${th * 0.6}" stroke-dasharray="${dash}" fill="none"/>`;
    // fix A: projecting (parliament) hinges throw the pin out 1¼ in — the leaf clears the face (dashed)
    o += RC(leafTip - 6, K.edge + 6, W + 6, K.edge + 6 + L.t, `fill="none" stroke="${DIM}" stroke-width="${th * 1.2}" stroke-dasharray="${dash}"`);
    o += `<circle cx="${W + 6}" cy="${K.edge + 6}" r="7" fill="none" stroke="${DIM}" stroke-width="${th}"/>`;
    // the knob, and a floor stop so it never meets the veneer
    o += `<circle cx="${f(leafTip + 65)}" cy="${f(K.edge + 6 + L.t + 30)}" r="27" fill="#fff" stroke-width="${th}"/>`;
    o += `<circle cx="${f(leafTip + 200)}" cy="${f(K.edge + 6 + L.t + 70)}" r="20" fill="none" stroke-width="${th}"/><circle cx="${f(leafTip + 200)}" cy="${f(K.edge + 6 + L.t + 70)}" r="8" fill="${INK}"/>`;
    return o;
  }

  // ═════════════ SHEET 1 — AST-DR-034, THE BED WALL ═════════════
  window.DK.begin("bedwall");
  let s = frame();
  s += `<defs><pattern id="hatchBW" patternUnits="userSpaceOnUse" width="90" height="90" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="90" stroke="#9a9a9a" stroke-width="10"/></pattern>
    <pattern id="clashBW" patternUnits="userSpaceOnUse" width="24" height="24" patternTransform="rotate(45)"><rect width="24" height="24" fill="#fbe3df"/><line x1="0" y1="0" x2="0" y2="24" stroke="${DIM}" stroke-width="6"/></pattern></defs>`;

  // elevation 1:30
  const sc = 30, ve = view(26, 32, sc, "Bed wall elevation"), te = ve.w(0.12);
  s += heading(18, 17, "ELEVATION — THE BED WALL", `SCALE 1:${sc} · SEEN FROM THE ROOM · DRESSING CORNER LEFT, ENTRANCE CORNER RIGHT`, 160);
  s += ve.g(elevation(te), 0.3);
  { const yb = ve.Y(H);
    s += chainH([0, N.u0 - CW, N.u0, N.u1, N.u1 + CW, W].map(ve.X), yb + 5, [N.u0 - CW, `${CW} COVE`, `${N.u1 - N.u0} NICHE`, `${CW} COVE`, W - N.u1 - CW], { from: yb + 1, size: 1.2 });
    s += chainH([ve.X(0), ve.X(W)], yb + 11, [`${W} BED WALL`], { from: yb + 1, size: 1.4 });
    s += chainV([ve.Y(H), ve.Y(H - K.skirt), ve.Y(H - N.h), ve.Y(H - hTop), ve.Y(0)], ve.X(W) + 6, [K.skirt, `${N.h - K.skirt} PANELS`, `${CW} COVE`, H - hTop], { from: ve.X(W) + 1, size: 1.2 });
    s += chainV([ve.Y(H), ve.Y(0)], ve.X(W) + 13, [`${H} CEILING`], { from: ve.X(W) + 1, size: 1.3 });
    s += note(ve.X(N.u0 + 500), ve.Y(250), ve.X(N.u0 + 700), ve.Y(330), "DARK DIVA VENEER — WHOLE WALL, DARKER POLISH", "");
    s += note(ve.X(N.u0 + 300), ve.Y(H - hTop + 90), ve.X(N.u0 + 700), ve.Y(470), "7 IN COVE ROUND THE NICHE — 3 IN OUT TO 10 IN", "");
    s += note(ve.X(N.u0 + (N.u1 - N.u0) * 0.1), ve.Y(H - 1700), ve.X(N.u0 + 40) , ve.Y(-110), "PARCHMENT PLASTER", "5 × 3 PANELS, HAIRLINE JOINTS");
    s += note(ve.X(bc + fw / 2 - 150), ve.Y(H - 760), ve.X(bc + fw / 2 + 120), ve.Y(H - 1150), "HEADBOARD", "UPHOLSTERED — AST-DR-035");
    s += note(ve.X(leafTip + 120), ve.Y(H - 1500), ve.X(leafTip - 120), ve.Y(-110), "ENTRANCE DOOR OPEN (DASHED)", "LIES IN FRONT OF THE 3 IN ZONE", "end");
    s += note(ve.X(tables[0]), ve.Y(H - 560), ve.X(tables[0] - 200), ve.Y(H - 300), "SIDE TABLE", "", "end");
    s += cutMark(ve.X(bc) + 4, ve.Y(-60), "A", "down");
  }

  // plan 1:30
  const vp = view(26, 154, sc, "Bed wall plan"), tp = vp.w(0.1), dp = `${vp.w(1)} ${vp.w(0.7)}`;
  s += heading(18, 141, "PLAN", `CUT AT 4 FT · SCALE 1:${sc} · THE BED WALL AT THE TOP, THE ROOM BELOW`, 150);
  s += vp.g(plan(tp, dp), 0.3);
  s += chainV([vp.Y(0), vp.Y(K.edge)], vp.X(0) - 4, [K.edge], { from: vp.X(0), size: 1.1 });
  s += chainV([vp.Y(0), vp.Y(K.deep)], vp.X(N.u0) - 4, [K.deep], { from: vp.X(N.u0), size: 1.1 });
  s += chainH([vp.X(N.u1), vp.X(leafTip)], vp.Y(K.deep) + 4, [leafTip - N.u1], { from: vp.Y(K.deep), size: 1.1 });
  s += note(vp.X(W - 300), vp.Y(K.edge - 10), vp.X(W) + 6, vp.Y(-40), "CLASH — SEE DETAIL 2", "DOOR LEAF vs THE 3 IN FACE");
  s += note(vp.X(W + 60), vp.Y(500), vp.X(W) + 6, vp.Y(520), "ENTRANCE DOOR, 3 FT", "OPENS FLAT ALONG THIS WALL");
  s += note(vp.X(-60), vp.Y(1100), vp.X(250), vp.Y(1500), "DRESSING DOOR", "2 FT 3 IN FROM THE CORNER");
  s += text(vp.X(bc), vp.Y(vHf + 1100), "BED 6 FT × 6 FT 6", { size: 1.6, anchor: "middle", fill: THIN });
  s += cutMark(vp.X(bc) + 4, vp.Y(vFr1 + 150), "A", "up");

  // section A–A 1:25
  const scS = 25, vs = view(214, 32, scS, "Bed wall section A-A"), ts = vs.w(0.12);
  s += heading(206, 17, "SECTION A–A", `THROUGH THE BED · SCALE 1:${scS}`, 90);
  s += vs.g(section(ts), 0.3);
  s += chainV([vs.Y(0), vs.Y(H - hTop), vs.Y(H - N.h), vs.Y(H)], vs.X(-K.T) - 3, [H - hTop, `${CW}`, `${N.h} NICHE`], { from: vs.X(-K.T), size: 1.2 });
  s += chainH([vs.X(0), vs.X(K.edge), vs.X(K.deep)], vs.Y(0) - 3, [K.edge, C.r], { from: vs.Y(0), size: 1.2 });
  s += chainV([vs.Y(H), vs.Y(H - yLeg), vs.Y(H - yRail), vs.Y(H - yMat), vs.Y(H - B.head.h)], vs.X(vFr1) + 6, [yLeg, B.rail.h, B.mat.h, B.head.h - yMat], { from: vs.X(vFr1) + 1, size: 1.1 });
  s += chainH([vs.X(0), vs.X(vFr1)], vs.Y(H) + 6, [`${vFr1} WALL TO FOOT`], { from: vs.Y(H) + 1, size: 1.2 });
  s += note(vs.X(K.deep - 50), vs.Y(H - N.h - C.flat - 60), vs.X(K.deep) + 14, vs.Y(300), "COVE OVER THE NICHE, 7 IN RADIUS", "BENT PLY ON FORMERS, VENEERED");
  s += note(vs.X(K.plaster / 2), vs.Y(1400), vs.X(K.deep) + 14, vs.Y(700), "PARCHMENT PLASTER", "ON 12 MM BOARD");
  s += note(vs.X(vHb + 30), vs.Y(H - 900), vs.X(K.deep) + 14, vs.Y(1150), "HEADBOARD, 3 IN", "1 IN OFF THE PLASTER");

  // detail 2 — the entrance corner, plan 1:20, in the right-hand column; marks keyed underneath
  const scD = 20, d0 = N.u1 - 250, vd = view(323 - d0 / scD, 84, scD, "Entrance corner"), td = vd.w(0.12), dd = `${vd.w(1)} ${vd.w(0.7)}`;
  s += heading(322, 70, "DETAIL 2 · THE ENTRANCE CORNER", `PLAN · SCALE 1:${scD} · THE DOOR vs THE 3 IN FACE`, 88);
  s += `<clipPath id="clipBW2"><rect x="${vd.X(d0)}" y="${vd.Y(-K.T)}" width="${f((W + K.T - d0) / scD)}" height="${f((K.T + 1050) / scD)}"/></clipPath>`;
  s += `<g clip-path="url(#clipBW2)">${vd.g(doorCorner(td, dd), 0.3)}</g>`;
  s += chainV([vd.Y(0), vd.Y(K.door.lin), vd.Y(K.edge)], vd.X(d0) - 2, ["2 IN", "1 IN"], { from: vd.X(d0), size: 1.05 });
  [[1, vd.X(leafTip + 450), vd.Y(64) - 3.2], [2, vd.X(leafTip + 450), vd.Y(K.edge + 51) + 3.4], [3, vd.X(leafTip + 200), vd.Y(K.edge + 120) + 3.6], [4, vd.X(N.u1 + 76), vd.Y(170)]]
    .forEach(([n, x, y]) => (s += bubble(x, y, n)));
  [["1", "AS SKETCHED — the open leaf hits the 3 in face: its hinge pin"], ["", "   stands only 2 in off the wall (red)."],
   ["2", "FIX A — projecting (parliament) hinges throw the pin out 1¼ in;"], ["", "   the leaf clears and still opens flat (dashed)."],
   ["3", "Floor stop — keeps the knob off the veneer."],
   ["4", "FIX B — 1½ in at this corner instead of 3 in: ordinary hinges clear."]]
    .forEach(([n, t], i) => (s += (n ? bubble(324, 148 + i * 4.4 - 0.7, n) : "") + text(328, 148 + i * 4.4, t, { size: 1.4 })));

  // what is assumed
  s += heading(206, 192, "ASSUMED", "TELL ME IF ANY OF THESE IS WRONG", 90);
  ["Niche 6 ft 6 in high (lowered); the cove tops out at 7 ft 2 in.", "Five panels across and three up, as sketched:", "   each about 1 ft 10⅜ × 2 ft ⅝ in — nearly square.",
   "The 4 in white marble skirting runs along the build-out", "   and into the niche.", "The build-out runs to the ceiling.", "Side tables 18 × 16 in, 24 in high (from the photo).",
   "Bed and headboard heights: AST-DR-035."]
    .forEach((n, i) => (s += text(206, 203 + i * 4.4, n, { size: 1.5 })));

  // notes and problems
  s += heading(18, 238, "NOTES", `REVISION ${K.rev.split(" ")[0]}`, 90);
  ["From the owner's sketches and photo. The whole wall is built out 3 in in Dark Diva",
   "veneer, polished darker, on a ply carcase. Round the niche it sweeps forward in a",
   "7 in concave cove to 10 in at the niche's edge — up both sides and across the top.",
   "The niche — bed and both tables — is 10 in deep, in parchment plaster, 5 × 3 panels.",
   "The build-out is set square to the bed's centre line and scribed at both corners,",
   "so it also hides the room's 2 in splay. The bed, headboard and side tables",
   "stand in the niche; the bed is drawn on AST-DR-035."]
    .forEach((n, i) => (s += text(18, 248 + i * 4.4, n, { size: 1.55 })));
  s += heading(322, 17, "PROBLEMS FOUND", "TO DECIDE", 88);
  ["1 · DOOR: the 3 in face stands 1 in proud of D1's hinge pin — the open leaf",
   "   hits it (detail 2). Projecting hinges (A), or 1½ in at that corner (B).",
   "2 · The bed comes 4½ in further out (headboard + frame): 2 ft 5½ in left",
   "   to the TV drawers instead of 2 ft 9¾ in.",
   "3 · The ceiling cove light along this wall: stop the build-out under it,",
   "   or run the cove in its top. Your call.",
   "4 · Lamp sockets and switches go through the plaster panels — fix their",
   "   places (list item B2) before the panels are made."]
    .forEach((n, i) => (s += text(322, 28 + i * 4.4, n, { size: 1.4, fill: /^\d/.test(n) ? "#b3261e" : INK })));

  s += titleBlock({ title: "BED WALL — THE NICHE", sub: "Elevation · Plan · Section · The entrance corner", date: K.date, rev: K.rev, dwg: "AST-DR-034", scale: "AS NOTED @ A3" });
  window.DRAWINGS.bedwall = { title: "Bed wall — the niche · AST-DR-034", svg: sheet(s), model: true };

  // ═════════════ SHEET 2 — AST-DR-035, THE BED ═════════════
  // local coordinates: u across the bed from its left edge (front view), v along it from the headboard's back (side)
  const fwB = fw, lenB = B.head.t + B.mat.l + B.over;
  function bedFront(th) {
    const Y = (h) => B.head.h - h, c = fwB / 2;
    let o = RC(0, Y(B.head.h), fwB, Y(yMat - 40), `fill="${UPH}" stroke-width="${th * 1.2}"`);
    o += `<path d="M 30 ${Y(B.head.h) + 18} L ${fwB - 30} ${Y(B.head.h) + 18}" stroke-width="${th * 0.4}"/>`;
    [-1, 1].forEach((s2) => (o += RC(c + s2 * 60, Y(yMat + 200), c + s2 * (B.mat.w / 2 - 40), Y(yMat), `fill="#fff" stroke-width="${th}"`)));
    o += RC(B.over, Y(yMat), fwB - B.over, Y(yRail), `fill="#fff" stroke-width="${th * 1.2}"`);
    o += RC(0, Y(yRail), fwB, Y(yLeg), `fill="${WOOD}" stroke-width="${th * 1.2}"`) + `<line x1="0" y1="${Y(yRail - B.rail.lip)}" x2="${fwB}" y2="${Y(yRail - B.rail.lip)}" stroke-width="${th * 0.6}"/>`;
    [B.leg.in, fwB - B.leg.in].forEach((u) => (o += legPath(u, Y, th)));
    o += `<line x1="-120" y1="${Y(0)}" x2="${fwB + 120}" y2="${Y(0)}" stroke-width="${th * 3}"/>`;
    return o;
  }
  function bedSide(th) {
    const Y = (h) => B.head.h - h, v0 = B.head.t;
    let o = RC(0, Y(B.head.h), B.head.t, Y(yLeg), `fill="${UPH}" stroke-width="${th * 1.2}"`);
    o += RC(v0, Y(yMat), v0 + B.mat.l, Y(yRail), `fill="#fff" stroke-width="${th * 1.2}"`) + RC(v0 + 40, Y(yMat + 150), v0 + 560, Y(yMat), `fill="#fff" stroke-width="${th * 0.8}"`);
    o += RC(v0, Y(yRail), lenB, Y(yLeg), `fill="${WOOD}" stroke-width="${th * 1.2}"`) + `<line x1="${v0}" y1="${Y(yRail - B.rail.lip)}" x2="${lenB}" y2="${Y(yRail - B.rail.lip)}" stroke-width="${th * 0.6}"/>`;
    [v0 + B.leg.in, (v0 + lenB) / 2, lenB - B.leg.in].forEach((v, i) => (o += i === 1 ? `<g opacity=".45">${legPath(v, Y, th)}</g>` : legPath(v, Y, th)));
    o += `<line x1="-120" y1="${Y(0)}" x2="${lenB + 120}" y2="${Y(0)}" stroke-width="${th * 3}"/>`;
    return o;
  }
  function bedPlan(th, dash) {
    let o = RC(0, 0, fwB, B.head.t, `fill="${UPH}" stroke-width="${th}"`);
    o += RC(0, B.head.t, fwB, lenB, `fill="${WOOD}" stroke-width="${th * 1.2}"`) + RC(B.over, B.head.t, fwB - B.over, B.head.t + B.mat.l, `fill="#fff" stroke-width="${th}"`);
    // slats and the centre rail below, dashed
    o += `<g stroke-width="${th * 0.6}" stroke-dasharray="${dash}">` + RC(B.rail.t, B.head.t + 10, fwB - B.rail.t, lenB - B.rail.t) + `<line x1="${fwB / 2}" y1="${B.head.t}" x2="${fwB / 2}" y2="${lenB - B.rail.t}"/>`;
    for (let v = B.head.t + 120; v < lenB - 100; v += 160) o += `<line x1="${B.rail.t}" y1="${v}" x2="${fwB - B.rail.t}" y2="${v}"/>`;
    o += `</g>`;
    [[B.leg.in, B.head.t + B.leg.in], [fwB - B.leg.in, B.head.t + B.leg.in], [B.leg.in, lenB - B.leg.in], [fwB - B.leg.in, lenB - B.leg.in], [fwB / 2, (B.head.t + lenB) / 2]]
      .forEach(([u, v], i) => (o += `<circle cx="${u}" cy="${v}" r="${B.leg.d / 2}" fill="none" stroke-width="${th}" ${i === 4 ? `stroke-dasharray="${dash}"` : ""}/>`));
    return o;
  }
  // the turned foot at 1:2, and the headboard edge at 1:5
  function legDetail(th) { return legPath(0, (h) => B.leg.h - h, th) + `<line x1="-80" y1="${B.leg.h}" x2="80" y2="${B.leg.h}" stroke-width="${th * 3}"/>` + RC(-90, -40, 90, 0, `fill="${WOOD}" stroke-width="${th}"`); }
  function headDetail(th) {
    const t = B.head.t;
    let o = RC(0, 0, 18, 300, `fill="${VEN2}" stroke-width="${th}"`);                                      // ply back
    o += `<path d="M 18 0 L ${t - 18} 0 Q ${t} 0 ${t} 18 L ${t} 282 Q ${t} 300 ${t - 18} 300 L 18 300 Z" fill="${UPH}" stroke-width="${th * 1.2}"/>`;   // foam + fabric, eased edges
    o += `<path d="M 18 4 L ${t - 20} 4 Q ${t - 4} 4 ${t - 4} 20 L ${t - 4} 280 Q ${t - 4} 296 ${t - 20} 296 L 18 296" fill="none" stroke-width="${th * 0.5}" stroke-dasharray="6 4"/>`;
    return o;
  }

  window.DK.begin("bedframe");
  let s2 = frame();
  const scB = 12, vf = view(28, 34, scB, "Bed front"), tf = vf.w(0.12);
  s2 += heading(18, 17, "FRONT — FROM THE FOOT", `SCALE 1:${scB} · AS THE OWNER'S PHOTO`, 110);
  s2 += vf.g(bedFront(tf), 0.3);
  s2 += chainH([vf.X(0), vf.X(B.over), vf.X(fwB - B.over), vf.X(fwB)], vf.Y(B.head.h) + 5, [B.over, `${B.mat.w} MATTRESS`, B.over], { from: vf.Y(B.head.h) + 1, size: 1.2 });
  s2 += chainH([vf.X(0), vf.X(fwB)], vf.Y(B.head.h) + 11, [`${fwB} OVERALL`], { from: vf.Y(B.head.h) + 1, size: 1.4 });
  s2 += chainH([vf.X(0), vf.X(B.leg.in)], vf.Y(B.head.h) + 17, [`${B.leg.in} TO THE FOOT`], { from: vf.Y(B.head.h) + 1, size: 1.1 });
  s2 += chainV([vf.Y(B.head.h), vf.Y(B.head.h - yLeg), vf.Y(B.head.h - yRail), vf.Y(B.head.h - yMat), vf.Y(0)], vf.X(fwB) + 6, [yLeg, B.rail.h, B.mat.h, B.head.h - yMat], { from: vf.X(fwB) + 1, size: 1.15 });
  s2 += chainV([vf.Y(B.head.h), vf.Y(0)], vf.X(fwB) + 13, [`${B.head.h} TO THE TOP`], { from: vf.X(fwB) + 1, size: 1.25 });

  const vsd = view(212, 34, scB, "Bed side"), tsd = vsd.w(0.12);
  s2 += heading(206, 17, "SIDE", `SCALE 1:${scB} · HEADBOARD LEFT`, 70);
  s2 += vsd.g(bedSide(tsd), 0.3);
  s2 += chainH([vsd.X(0), vsd.X(B.head.t), vsd.X(B.head.t + B.mat.l), vsd.X(lenB)], vsd.Y(B.head.h) + 5, [B.head.t, `${B.mat.l} MATTRESS`, B.over], { from: vsd.Y(B.head.h) + 1, size: 1.2 });
  s2 += chainH([vsd.X(0), vsd.X(lenB)], vsd.Y(B.head.h) + 11, [`${lenB} OVERALL`], { from: vsd.Y(B.head.h) + 1, size: 1.4 });
  s2 += note(vsd.X(B.head.t / 2), vsd.Y(300), vsd.X(B.head.t) + 10, vsd.Y(-60), "HEADBOARD, UPHOLSTERED", "FIXED TO THE FRAME — DETAIL 3");
  s2 += note(vsd.X(lenB - 300), vsd.Y(B.head.h - yRail + 50), vsd.X(lenB) - 10, vsd.Y(B.head.h + 120), "FRAME RAIL, 4 IN", "1 IN LIP ON TOP · DARK TEAK", "end");
  s2 += note(vsd.X((B.head.t + lenB) / 2), vsd.Y(B.head.h - 80), vsd.X((B.head.t + lenB) / 2) + 22, vsd.Y(B.head.h + 120), "CENTRE FOOT", "UNDER THE MIDDLE RAIL");

  const scP2 = 20, vpl = view(28, 152, scP2, "Bed plan"), tpl = vpl.w(0.1), dpl = `${vpl.w(1)} ${vpl.w(0.7)}`;
  s2 += heading(18, 142, "PLAN", `SCALE 1:${scP2} · HEADBOARD AT THE TOP · SLATS DASHED`, 80);
  s2 += vpl.g(bedPlan(tpl, dpl), 0.3);
  s2 += chainV([vpl.Y(0), vpl.Y(lenB)], vpl.X(fwB) + 5, [lenB], { from: vpl.X(fwB) + 1, size: 1.2 });
  s2 += chainH([vpl.X(0), vpl.X(fwB)], vpl.Y(lenB) + 5, [fwB], { from: vpl.Y(lenB) + 1, size: 1.2 });

  const vl = view(165, 166, 4, "Bed foot"), tl = vl.w(0.12);
  s2 += heading(140, 142, "1 · TURNED FOOT", "ELEVATION · SCALE 1:4", 50);
  s2 += vl.g(legDetail(tl), 0.3);
  s2 += chainV([vl.Y(0), vl.Y(B.leg.h)], vl.X(B.leg.d / 2) + 6, [B.leg.h], { from: vl.X(B.leg.d / 2) + 1, size: 1.2 });
  s2 += chainH([vl.X(-B.leg.d / 2), vl.X(B.leg.d / 2)], vl.Y(B.leg.h) + 5, [B.leg.d], { from: vl.Y(B.leg.h) + 1, size: 1.2 });
  s2 += note(vl.X(0), vl.Y(8), vl.X(B.leg.d / 2) + 16, vl.Y(-30), "COLLAR", "TURNED IN THE SOLID");

  const vh = view(214, 160, 5, "Headboard edge"), th5 = vh.w(0.12);
  s2 += heading(206, 142, "2 · HEADBOARD EDGE", "SECTION · SCALE 1:5", 50);
  s2 += vh.g(headDetail(th5), 0.3);
  s2 += chainH([vh.X(0), vh.X(18), vh.X(B.head.t)], vh.Y(0) - 3, [18, B.head.t - 18], { from: vh.Y(0), size: 1.15 });
  s2 += note(vh.X(9), vh.Y(150), vh.X(-8), vh.Y(170), "¾ IN PLY BACK", "", "end");
  s2 += note(vh.X(B.head.t - 10), vh.Y(100), vh.X(B.head.t) + 10, vh.Y(80), "FOAM + FABRIC", "EASED EDGES, NO PIPING");

  s2 += heading(270, 142, "3 · FIXING", "", 40);
  ["The headboard bolts to the frame's head rail on",
   "two hidden steel brackets — it does not touch the",
   "plaster (1 in clear) and never hangs off it."]
    .forEach((n, i) => (s2 += text(270, 152 + i * 4.3, n, { size: 1.55 })));

  s2 += heading(270, 178, "NOTES", `REVISION ${B.rev.split(" ")[0]}`, 120);
  ["The bed in the owner's photo, sized to the 6 ft × 6 ft 6 in mattress:",
   "a low dark-wood platform — a 4 in rail with a 1 in lip, on five turned",
   "bun feet — and a slim upholstered headboard, plain, the frame's width.",
   "Proportions read off the photo. Mattress thickness and the headboard",
   "height are ASSUMED until the mattress is chosen.",
   "Frame in solid teak, polished dark to sit with the Dark Diva wall.",
   "Headboard fabric to choose (the photo's is a dusty-rose suede)."]
    .forEach((n, i) => (s2 += text(270, 189 + i * 4.4, n, { size: 1.55 })));

  s2 += titleBlock({ title: "THE BED", sub: "Front · Side · Plan · Foot · Headboard", date: B.date, rev: B.rev, dwg: "AST-DR-035", scale: "AS NOTED @ A3" });
  window.DRAWINGS.bedframe = { title: "The bed · AST-DR-035", svg: sheet(s2), model: true };
})();
