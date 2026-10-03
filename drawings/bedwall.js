// The bed wall — AST-DR-034 — and the bed — AST-DR-035. From the owner's sketch and photo (03.10.2026).
// The whole bed wall is built out 3 in in Dark Diva veneer, polished darker, and round the niche that holds the bed and
// both side tables the face sweeps forward in a concave cove — up both sides and across the top — to 16 in at the
// niche's edge (rev 2, owner's second sketch: a long cove out of the 3 in face, not a tight rounded knob). The niche is
// 16 in deep, lined with parchment-plaster panels in a grid, and the bed in it is the one in the owner's photo: a low
// dark-wood platform on turned feet — no headboard (owner, 3 Oct): a long white cushion along the back instead,
// resting on the mattress and leaning on the parchment.
// Seen from the room: the dressing (right-wall) corner on the LEFT of the elevation, the entrance (left-wall) corner on
// the RIGHT. u runs along the wall from the dressing corner; v comes out from the wall into the room. Real units mm.

window.DRAWINGS = window.DRAWINGS || {};

const BEDWALL = {
  rev: "4 — niche 16 in deep, the side tables inside it; no headboard",
  date: "03.10.2026",
  W: 4724, H: 2769, T: 230,                 // 15 ft 6 in wall, 9 ft 1 in ceiling, 9 in walls (AST-DR-001)
  deep: 406, edge: 76,                      // 16 in at the niche — as deep as the side tables, so they sit inside it, out of sight
                                            // from the door (owner, 3 Oct; was 10 in); 3 in at both corners
  niche: { u0: 787, u1: 3632, h: 1981 },    // the old bed-back span exactly (owner: "we're keeping that"), centred on the TV; 6 ft 6 in high (owner: good)
  cove: { r: 152, flat: 25 },               // a concave quarter-ellipse, 6 in along the wall × 13 in out (3 in to 16 in), then a 1 in flat edge —
                                            // 7 in in all, which is exactly the gap between the open door's edge and the niche
  grid: { cols: 5, rows: 3 },               // as sketched: five across, three up
  plaster: 20,                              // parchment plaster on 12 mm board
  skirt: 102,                               // the room's 4 in white marble skirting, carried on — ASSUMED
  door: { leaf: 914, lin: 51, t: 45 },      // D1: 3 ft leaf, 2 in lining — its hinge pin stands 2 in off this wall
  side: { w: 406, d: 381, h: 610 },         // 16 in wide, 15 in deep: against the plaster, their fronts just inside the niche's edge
  lamp: { y: 1290, span: 150, proj: 230 },  // a wall lamp over each side table (owner): the room's brass twin-arm sconce, as AST-DR-007         // side tables, 16 × 16 in, 24 in high — 1 in clear each side in the niche; from the photo, ASSUMED
};

// The bed in the owner's photo, sized to the 6 ft × 6 ft 6 in mattress on the plan. Proportions read off the photo.
const BEDFRAME = {
  rev: "2 — no headboard: a long white cushion along the back",
  date: "03.10.2026",
  mat: { w: 1829, l: 1981, h: 254 },        // 6 ft × 6 ft 6 in, 10 in thick — mattress to be chosen
  over: 51,                                 // the frame runs 2 in past the mattress at the sides and the foot
  rail: { h: 102, lip: 25, t: 45 },         // 4 in rail, 1 in top lip, 1¾ in thick
  leg: { h: 178, d: 95, top: 70, foot: 60, in: 150 },   // 7 in turned bun foot, 3¾ in at its widest, set in 6 in
  gap: 25,                                  // the frame's head stands 1 in off the plaster
  cush: { h: 430, d: 200, r: 50, lean: 10 },  // the back cushion: 17 in tall, 8 in deep, eased corners, leaning back 10° on the wall
};

(function () {
  const { INK, THIN, DIM, f, text, mmToFt, view, chainH, chainV, note, labels, heading, cutMark, bubble, frame, titleBlock, sheet } = window.DK;
  const K = BEDWALL, B = BEDFRAME, W = K.W, H = K.H, N = K.niche, C = K.cove;
  const CW = C.r + C.flat, CB = K.deep - K.edge;   // the cove band from the niche's edge: 1 in flat, then the cove — 6 in along, 7 in out
  const hTop = N.h + CW;                      // where the top cove meets the 3 in face
  const ft = (mm) => mmToFt(mm).replace("'-", " ft ").replace('"', " in").replace(/^0 ft /, "").replace(/ 0 in$/, "");
  const VEN = "#dcc6a8", VEN2 = "#cdb391", PAR = "#f6eedd", UPH = "#ead6cd", WOOD = "#c9a88a", MARB = "#f1efea", RUG = "#ecebe7";

  // the bed sits on the niche's centre: the frame 1 in off the plaster, the mattress inside it, the cushion leaning at the head
  const bc = (N.u0 + N.u1) / 2, fw = B.mat.w + 2 * B.over;
  const vHb = K.plaster + B.gap, vHf = vHb + B.over, vMat1 = vHf + B.mat.l, vFr1 = vMat1 + B.over;
  const yLeg = B.leg.h, yRail = yLeg + B.rail.h, yMat = yRail + B.mat.h;
  const CU = B.cush, cuTop = yMat + CU.h * Math.cos(CU.lean * Math.PI / 180), cuBack = vHf - CU.h * Math.sin(CU.lean * Math.PI / 180);
  const CUSH = "#f4f1ea";
  // the cushion in side view (v across, Y(h) down): a rounded box tipped back 10° about its bottom-back corner
  const cushSide = (Y, v0, th) => `<rect x="${f(v0)}" y="${f(Y(yMat) - CU.h)}" width="${CU.d}" height="${CU.h}" rx="${CU.r}" fill="${CUSH}" stroke-width="${th * 1.2}" transform="rotate(${-CU.lean} ${f(v0)} ${f(Y(yMat))})"/>`;
  const tables = [N.u0 + (bc - fw / 2 - N.u0) / 2, N.u1 - (N.u1 - bc - fw / 2) / 2];
  const leafTip = W - K.door.leaf;

  // the build-out's face in plan: 3 in, then the concave cove — tangent to the 3 in face, turning to run straight out
  // at the niche — then the 1 in flat edge at 16 in. (u, v) for a niche edge at ue, the band running dir (−1 left, +1 right)
  const covePts = (ue, dir, n = 18) => Array.from({ length: n + 1 }, (_, i) => { const t = (i / n) * Math.PI / 2;   // t = 0 at the 3 in face
    return [ue + dir * (CW - C.r * Math.sin(t)), K.deep - CB * Math.cos(t)]; });
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
    // the niche back, and its two sides, in parchment plaster (the sides lined into the carcase, so the niche stays its width)
    o += RC(N.u0, 0, N.u1, K.plaster, `fill="${PAR}" stroke-width="${th}"`);
    o += RC(N.u0 - K.plaster, K.plaster, N.u0, K.deep, `fill="${PAR}" stroke-width="${th * 0.8}"`) + RC(N.u1, K.plaster, N.u1 + K.plaster, K.deep, `fill="${PAR}" stroke-width="${th * 0.8}"`);
    // side tables, frame, mattress, the back cushion, pillows
    tables.forEach((c) => (o += RC(c - K.side.w / 2, K.plaster, c + K.side.w / 2, K.plaster + K.side.d, `fill="#fff" stroke-width="${th}"`)));
    o += RC(bc - fw / 2, vHb, bc + fw / 2, vFr1, `fill="${WOOD}" stroke-width="${th}"`);
    o += RC(bc - B.mat.w / 2, vHf, bc + B.mat.w / 2, vMat1, `fill="#fff" stroke-width="${th}"`);
    o += `<rect x="${f(bc - B.mat.w / 2)}" y="${f(cuBack)}" width="${B.mat.w}" height="${f(vHf + CU.d - cuBack)}" rx="${CU.r}" fill="${CUSH}" stroke-width="${th}"/>`;
    [-1, 1].forEach((s) => (o += RC(bc + s * 40, vHf + CU.d + 20, bc + s * (B.mat.w / 2 - 70), vHf + CU.d + 320, `fill="#fff" stroke-width="${th * 0.7}"`)));
    o += `<line x1="${f(bc - B.mat.w / 2)}" y1="${f(vHf + 620)}" x2="${f(bc + B.mat.w / 2)}" y2="${f(vHf + 620)}" stroke-width="${th * 0.6}"/>`;
    // the entrance door, open flat along this wall on its ordinary hinges — where it meets the 3 in face
    const L = K.door, pin = L.lin;
    o += RC(leafTip, pin, W, pin + L.t, `fill="#fff" stroke-width="${th * 1.4}"`);
    o += `<path d="M ${W} ${pin + L.leaf} A ${L.leaf} ${L.leaf} 0 0 1 ${leafTip} ${pin}" stroke-width="${th * 0.7}" stroke-dasharray="${dash}" fill="none"/>`;
    o += RC(leafTip, pin, W, K.edge, `fill="url(#clashBW)" stroke="${DIM}" stroke-width="${th * 1.2}"`);
    return o;
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
    if (!bare) tables.forEach((c) => {
      const w = K.side.w, h = K.side.h, x0 = c - w / 2;
      o += RC(x0 - 8, Y(h), x0 + w + 8, Y(h - 25), `fill="${WOOD}" stroke-width="${th}"`);
      o += RC(x0, Y(h - 25), x0 + w, Y(h - 150), `fill="${WOOD}" stroke-width="${th}"`) + `<circle cx="${f(c)}" cy="${f(Y(h - 88))}" r="9" fill="#fff" stroke-width="${th * 0.8}"/>`;
      o += `<path d="M ${f(x0 + 12)} ${Y(h - 150)} L ${f(x0 - 10)} ${Y(0)} L ${f(x0 + 14)} ${Y(0)} L ${f(x0 + 40)} ${Y(h - 150)} M ${f(x0 + w - 12)} ${Y(h - 150)} L ${f(x0 + w + 10)} ${Y(0)} L ${f(x0 + w - 14)} ${Y(0)} L ${f(x0 + w - 40)} ${Y(h - 150)}" fill="${WOOD}" stroke-width="${th}"/>`;
    });
    tables.forEach((c) => (o += sconce(c, Y, th)));                     // a wall lamp over each side table, on the plaster
    if (bare) return o + `<line x1="-150" y1="${Y(0)}" x2="${W + 150}" y2="${Y(0)}" stroke-width="${th * 4}"/>`;
    // the bed from its foot: the long white cushion at the back, the frame on turned feet, mattress and pillows
    o += `<rect x="${f(bc - B.mat.w / 2)}" y="${f(Y(cuTop))}" width="${B.mat.w}" height="${f(cuTop - yMat + 10)}" rx="${CU.r}" fill="${CUSH}" stroke-width="${th * 1.2}"/>`;
    o += `<path d="M ${f(bc - B.mat.w / 2 + 40)} ${f(Y(cuTop) + 12)} L ${f(bc + B.mat.w / 2 - 40)} ${f(Y(cuTop) + 12)}" stroke-width="${th * 0.4}"/>`;
    [-1, 1].forEach((s) => (o += RC(bc + s * 60, Y(yMat + 200), bc + s * (B.mat.w / 2 - 40), Y(yMat), `fill="#fff" stroke-width="${th}"`)));
    o += RC(bc - B.mat.w / 2, Y(yMat), bc + B.mat.w / 2, Y(yRail), `fill="#fff" stroke-width="${th * 1.2}"`);
    o += RC(bc - fw / 2, Y(yRail), bc + fw / 2, Y(yLeg), `fill="${WOOD}" stroke-width="${th * 1.2}"`) + `<line x1="${f(bc - fw / 2)}" y1="${Y(yRail - B.rail.lip)}" x2="${f(bc + fw / 2)}" y2="${Y(yRail - B.rail.lip)}" stroke-width="${th * 0.6}"/>`;
    [-1, 1].forEach((s) => (o += legPath(bc + s * (fw / 2 - B.leg.in), Y, th)));
    // the entrance door, open flat against this wall (dashed): where it stands in front of the 3 in zone
    o += RC(leafTip, Y(2311), W, Y(0), `fill="none" stroke="${DIM}" stroke-width="${th * 1.1}" stroke-dasharray="${th * 9} ${th * 6}"`);
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
    // concave: centred out in the room at (16 in, cove top) — leaves the flat edge running straight out, meets the 3 in face tangent
    const cv = Array.from({ length: 19 }, (_, i) => { const t = (1 - i / 18) * Math.PI / 2; return [K.deep - CB * Math.cos(t), hTop - C.r * Math.sin(t)]; });
    o += P([[0, Y(N.h)], [K.deep, Y(N.h)], [K.deep, Y(N.h + C.flat)], ...cv.map(([v, h]) => [v, Y(h)]), [K.edge, Y(H)], [0, Y(H)]], `fill="${VEN}" stroke-width="${th * 1.4}"`);
    o += RC(0, Y(N.h + K.plaster), K.deep, Y(N.h), `fill="${PAR}" stroke-width="${th * 0.8}"`);          // the soffit, parchment plaster too
    // the niche back: parchment plaster on board, marble skirting at its foot
    o += RC(0, Y(N.h), K.plaster, Y(K.skirt), `fill="${PAR}" stroke-width="${th}"`) + RC(0, Y(K.skirt), K.plaster + 12, Y(0), `fill="${MARB}" stroke-width="${th}"`);
    // beyond: the side table (thin), and the build-out's 16 in face at the niche edge
    o += RC(K.plaster, Y(K.side.h), K.plaster + K.side.d, Y(0), `fill="none" stroke-width="${th * 0.5}" stroke-dasharray="${th * 6} ${th * 4}"`);
    o += `<line x1="${K.deep}" y1="${Y(N.h)}" x2="${K.deep}" y2="${Y(0)}" stroke-width="${th * 0.5}" stroke-dasharray="${th * 6} ${th * 4}"/>`;
    // the wall lamp over the side table, beyond (dashed): backplate on the plaster, arm, shade
    { const y = K.lamp.y, p = K.plaster + K.lamp.proj, d = `stroke-dasharray="${th * 6} ${th * 4}"`;
      o += `<g fill="none" stroke-width="${th * 0.8}" ${d}><rect x="${K.plaster}" y="${Y(y + 60)}" width="18" height="120"/><path d="M ${K.plaster + 18} ${Y(y - 10)} C ${K.plaster + 90} ${Y(y - 70)} ${p - 20} ${Y(y - 50)} ${p} ${Y(y + 20)}"/><path d="M ${p - 60} ${Y(y + 90)} L ${p + 60} ${Y(y + 90)} L ${p + 36} ${Y(y + 190)} L ${p - 36} ${Y(y + 190)} Z"/></g>`; }
    // the bed: frame rail, mattress, the back cushion leaning on the plaster, a pillow, the feet
    o += RC(vHf, Y(yMat), vMat1, Y(yRail), `fill="#fff" stroke-width="${th * 1.2}"`) + RC(vHf + CU.d + 30, Y(yMat + 150), vHf + CU.d + 560, Y(yMat), `fill="#fff" stroke-width="${th * 0.8}"`);
    o += cushSide(Y, vHf, th);
    o += RC(vHb, Y(yRail), vFr1, Y(yLeg), `fill="${WOOD}" stroke-width="${th * 1.2}"`) + `<line x1="${vHb}" y1="${Y(yRail - B.rail.lip)}" x2="${vFr1}" y2="${Y(yRail - B.rail.lip)}" stroke-width="${th * 0.6}"/>`;
    [vHb + B.leg.in, vFr1 - B.leg.in].forEach((v) => (o += legPath(v, Y, th)));
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
  view(0, 0, sc, "Bed wall face").g(elevation(te, true), 0.3);           // captured only: the wall alone, for the 3D room
  { const yb = ve.Y(H);
    s += chainH([0, N.u0 - CW, N.u0, N.u1, N.u1 + CW, W].map(ve.X), yb + 5, [N.u0 - CW, `${CW} COVE`, `${N.u1 - N.u0} NICHE`, `${CW} COVE`, W - N.u1 - CW], { from: yb + 1, size: 1.2 });
    s += chainH([ve.X(0), ve.X(W)], yb + 11, [`${W} BED WALL`], { from: yb + 1, size: 1.4 });
    s += chainV([ve.Y(H), ve.Y(H - K.skirt), ve.Y(H - N.h), ve.Y(H - hTop), ve.Y(0)], ve.X(W) + 6, [K.skirt, `${N.h - K.skirt} PANELS`, `${CW} COVE`, H - hTop], { from: ve.X(W) + 1, size: 1.2 });
    s += chainV([ve.Y(H), ve.Y(0)], ve.X(W) + 13, [`${H} CEILING`], { from: ve.X(W) + 1, size: 1.3 });
    s += note(ve.X(N.u0 + 500), ve.Y(250), ve.X(N.u0 + 700), ve.Y(330), "DARK DIVA VENEER — WHOLE WALL, DARKER POLISH", "");
    s += note(ve.X(N.u0 + 300), ve.Y(H - hTop + 90), ve.X(N.u0 + 700), ve.Y(470), "6 IN COVE + 1 IN EDGE ROUND THE NICHE — 3 IN OUT TO 16 IN", "");
    s += note(ve.X(N.u0 + (N.u1 - N.u0) * 0.1), ve.Y(H - 1700), ve.X(N.u0 + 40) , ve.Y(-110), "PARCHMENT PLASTER — BACK IN 5 × 3 PANELS", "THE NICHE'S SIDES AND SOFFIT PLAIN PARCHMENT TOO");
    s += note(ve.X(bc + B.mat.w / 2 - 150), ve.Y(H - cuTop + 120), ve.X(bc + fw / 2 + 120), ve.Y(H - 1150), "LONG WHITE CUSHION", "NO HEADBOARD — AST-DR-035");
    s += note(ve.X(leafTip + 120), ve.Y(H - 1500), ve.X(leafTip - 120), ve.Y(-110), "ENTRANCE DOOR OPEN (DASHED)", "LIES IN FRONT OF THE 3 IN ZONE", "end");
    s += note(ve.X(tables[0]), ve.Y(H - 560), ve.X(tables[0] - 200), ve.Y(H - 300), "SIDE TABLE", "", "end");
    s += note(ve.X(tables[1] + K.lamp.span), ve.Y(H - K.lamp.y - 140), ve.X(tables[1] + 260), ve.Y(H - 1700), "WALL LAMP, EACH SIDE", "BRASS TWIN-ARM, AS THE RIGHT WALL");
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
  s += chainV([vs.Y(H), vs.Y(H - yLeg), vs.Y(H - yRail), vs.Y(H - yMat), vs.Y(H - cuTop)], vs.X(vFr1) + 6, [yLeg, B.rail.h, B.mat.h, Math.round(cuTop - yMat)], { from: vs.X(vFr1) + 1, size: 1.1 });
  s += chainH([vs.X(0), vs.X(vFr1)], vs.Y(H) + 6, [`${vFr1} WALL TO FOOT`], { from: vs.Y(H) + 1, size: 1.2 });
  s += note(vs.X(K.deep - 50), vs.Y(H - N.h - C.flat - 60), vs.X(K.deep) + 14, vs.Y(300), "COVE OVER THE NICHE, 6 IN RADIUS", "BENT PLY ON FORMERS, VENEERED");
  s += note(vs.X(K.plaster / 2), vs.Y(1400), vs.X(K.deep) + 14, vs.Y(700), "PARCHMENT PLASTER", "BACK, SIDES AND SOFFIT, ON 12 MM BOARD");
  s += note(vs.X(vHf + 90), vs.Y(H - yMat - 250), vs.X(K.deep) + 14, vs.Y(1150), "LONG WHITE CUSHION", "LOOSE · LEANS ON THE PLASTER");

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
  ["Niche 9 ft 4 in wide — the old bed-back span — and 16 in deep.", "Five panels across and three up, as sketched:", "   each about 1 ft 10⅜ × 2 ft ⅝ in — nearly square.",
   "The 4 in white marble skirting runs along the build-out", "   and into the niche.", "The build-out runs to the ceiling.", "Side tables 16 in wide, 15 in deep, 24 in high, all wood.",
   "Bed and cushion heights: AST-DR-035."]
    .forEach((n, i) => (s += text(206, 203 + i * 4.4, n, { size: 1.5 })));

  // notes and problems
  s += heading(18, 238, "NOTES", `REVISION ${K.rev.split(" ")[0]}`, 90);
  ["From the owner's sketches and photo. The whole wall is built out 3 in in Dark Diva",
   "veneer, polished darker, on a ply carcase. Round the niche it sweeps forward in a",
   "6 in concave cove to 16 in at the niche's edge — up both sides and across the top.",
   "The niche — bed and both tables — is 16 in deep, all parchment plaster: its back in",
   "5 × 3 panels, its two sides and soffit plain (owner).",
   "The build-out is set square to the bed's centre line and scribed at both corners,",
   "so it also hides the room's 2 in splay. The niche is the old bed-back span, centred",
   "on the TV; the cove stops where the open door's leaf ends. Cove light: in the ceiling.",
   "No headboard: a long white cushion along the back (owner). A brass wall lamp each side.",
   "The bed is drawn on AST-DR-035."]
    .forEach((n, i) => (s += text(18, 248 + i * 4.4, n, { size: 1.55 })));
  s += heading(322, 17, "PROBLEMS FOUND", "TO DECIDE", 88);
  ["1 · DOOR — not its 3 ft, which is kept clear, but the DEPTH: D1's hinge pin",
   "   is 2 in off this wall, so a 3 in face there stops it opening flat (detail 2).",
   "   Projecting hinges (A), or 1½ in deep at that corner (B).",
   "2 · The bed comes 3½ in further out (its frame runs 2 in past the mattress",
   "   all round): 2 ft 6⅜ in left to the TV drawers instead of 2 ft 9¾ in.",
   "3 · Lamp sockets and switches go through the plaster panels — fix their",
   "   places (list item B2) before the panels are made.",
   "DECIDED: the cove light stays in the ceiling; no other light on this wall",
   "   but the two wall lamps over the side tables (owner)."]
    .forEach((n, i) => (s += text(322, 28 + i * 4.4, n, { size: 1.4, fill: /^\d/.test(n) ? "#b3261e" : INK })));

  s += titleBlock({ title: "BED WALL — THE NICHE", sub: "Elevation · Plan · Section · The entrance corner", date: K.date, rev: K.rev, dwg: "AST-DR-034", scale: "AS NOTED @ A3" });
  window.DRAWINGS.bedwall = { title: "Bed wall — the niche · AST-DR-034", svg: sheet(s), model: true };

  // ═════════════ SHEET 2 — AST-DR-035, THE BED ═════════════
  // local coordinates: u across the bed from its left edge (front view), v along it from the frame's head (side)
  const fwB = fw, lenB = 2 * B.over + B.mat.l, topB = Math.ceil(cuTop / 50) * 50;
  function bedFront(th) {
    const Y = (h) => topB - h, c = fwB / 2;
    let o = `<rect x="${B.over}" y="${f(Y(cuTop))}" width="${B.mat.w}" height="${f(cuTop - yMat + 10)}" rx="${CU.r}" fill="${CUSH}" stroke-width="${th * 1.2}"/>`;
    o += `<path d="M ${B.over + 40} ${f(Y(cuTop) + 12)} L ${fwB - B.over - 40} ${f(Y(cuTop) + 12)}" stroke-width="${th * 0.4}"/>`;
    [-1, 1].forEach((s2) => (o += RC(c + s2 * 60, Y(yMat + 200), c + s2 * (B.mat.w / 2 - 40), Y(yMat), `fill="#fff" stroke-width="${th}"`)));
    o += RC(B.over, Y(yMat), fwB - B.over, Y(yRail), `fill="#fff" stroke-width="${th * 1.2}"`);
    o += RC(0, Y(yRail), fwB, Y(yLeg), `fill="${WOOD}" stroke-width="${th * 1.2}"`) + `<line x1="0" y1="${Y(yRail - B.rail.lip)}" x2="${fwB}" y2="${Y(yRail - B.rail.lip)}" stroke-width="${th * 0.6}"/>`;
    [B.leg.in, fwB - B.leg.in].forEach((u) => (o += legPath(u, Y, th)));
    o += `<line x1="-120" y1="${Y(0)}" x2="${fwB + 120}" y2="${Y(0)}" stroke-width="${th * 3}"/>`;
    return o;
  }
  function bedSide(th) {
    const Y = (h) => topB - h, v0 = B.over;
    let o = RC(v0, Y(yMat), v0 + B.mat.l, Y(yRail), `fill="#fff" stroke-width="${th * 1.2}"`) + RC(v0 + CU.d + 30, Y(yMat + 150), v0 + CU.d + 560, Y(yMat), `fill="#fff" stroke-width="${th * 0.8}"`);
    o += cushSide(Y, v0, th);
    o += `<line x1="${f(-K.plaster - B.gap)}" y1="${Y(0)}" x2="${f(-K.plaster - B.gap)}" y2="${f(Y(cuTop + 120))}" stroke-width="${th * 1.6}" stroke-dasharray="${th * 8} ${th * 5}"/>`;   // the plaster
    o += RC(0, Y(yRail), lenB, Y(yLeg), `fill="${WOOD}" stroke-width="${th * 1.2}"`) + `<line x1="0" y1="${Y(yRail - B.rail.lip)}" x2="${lenB}" y2="${Y(yRail - B.rail.lip)}" stroke-width="${th * 0.6}"/>`;
    [B.leg.in, lenB / 2, lenB - B.leg.in].forEach((v, i) => (o += i === 1 ? `<g opacity=".45">${legPath(v, Y, th)}</g>` : legPath(v, Y, th)));
    o += `<line x1="-120" y1="${Y(0)}" x2="${lenB + 120}" y2="${Y(0)}" stroke-width="${th * 3}"/>`;
    return o;
  }
  function bedPlan(th, dash) {
    let o = RC(0, 0, fwB, lenB, `fill="${WOOD}" stroke-width="${th * 1.2}"`) + RC(B.over, B.over, fwB - B.over, B.over + B.mat.l, `fill="#fff" stroke-width="${th}"`);
    o += `<rect x="${B.over}" y="${f(B.over - (vHf - cuBack))}" width="${B.mat.w}" height="${f(CU.d + vHf - cuBack)}" rx="${CU.r}" fill="${CUSH}" stroke-width="${th}"/>`;
    // slats and the centre rail below, dashed
    o += `<g stroke-width="${th * 0.6}" stroke-dasharray="${dash}">` + RC(B.rail.t, B.rail.t, fwB - B.rail.t, lenB - B.rail.t) + `<line x1="${fwB / 2}" y1="${B.rail.t}" x2="${fwB / 2}" y2="${lenB - B.rail.t}"/>`;
    for (let v = CU.d + 160; v < lenB - 100; v += 160) o += `<line x1="${B.rail.t}" y1="${v}" x2="${fwB - B.rail.t}" y2="${v}"/>`;
    o += `</g>`;
    [[B.leg.in, B.leg.in], [fwB - B.leg.in, B.leg.in], [B.leg.in, lenB - B.leg.in], [fwB - B.leg.in, lenB - B.leg.in], [fwB / 2, lenB / 2]]
      .forEach(([u, v], i) => (o += `<circle cx="${u}" cy="${v}" r="${B.leg.d / 2}" fill="none" stroke-width="${th}" ${i === 4 ? `stroke-dasharray="${dash}"` : ""}/>`));
    return o;
  }
  // the turned foot at 1:2, and the headboard edge at 1:5
  function legDetail(th) { return legPath(0, (h) => B.leg.h - h, th) + `<line x1="-80" y1="${B.leg.h}" x2="80" y2="${B.leg.h}" stroke-width="${th * 3}"/>` + RC(-90, -40, 90, 0, `fill="${WOOD}" stroke-width="${th}"`); }
  function cushDetail(th) {
    const d = CU.d, h = CU.h, r = CU.r;
    let o = `<rect x="0" y="0" width="${d}" height="${h}" rx="${r}" fill="${CUSH}" stroke-width="${th * 1.3}"/>`;
    o += `<rect x="22" y="22" width="${d - 44}" height="${h - 44}" rx="${r - 18}" fill="none" stroke-width="${th * 0.6}" stroke-dasharray="7 5"/>`;   // foam core
    [[r * 0.3, r * 0.3], [d - r * 0.3, r * 0.3], [r * 0.3, h - r * 0.3], [d - r * 0.3, h - r * 0.3]].forEach(([x, y]) => (o += `<circle cx="${f(x)}" cy="${f(y)}" r="5" fill="#fff" stroke-width="${th * 0.6}"/>`));
    return o;
  }


  window.DK.begin("bedframe");
  let s2 = frame();
  const scB = 12, vf = view(28, 34, scB, "Bed front"), tf = vf.w(0.12);
  s2 += heading(18, 17, "FRONT — FROM THE FOOT", `SCALE 1:${scB} · AS THE OWNER'S PHOTO`, 110);
  s2 += vf.g(bedFront(tf), 0.3);
  s2 += chainH([vf.X(0), vf.X(B.over), vf.X(fwB - B.over), vf.X(fwB)], vf.Y(topB) + 5, [B.over, `${B.mat.w} MATTRESS`, B.over], { from: vf.Y(topB) + 1, size: 1.2 });
  s2 += chainH([vf.X(0), vf.X(fwB)], vf.Y(topB) + 11, [`${fwB} OVERALL`], { from: vf.Y(topB) + 1, size: 1.4 });
  s2 += chainH([vf.X(0), vf.X(B.leg.in)], vf.Y(topB) + 17, [`${B.leg.in} TO THE FOOT`], { from: vf.Y(topB) + 1, size: 1.1 });
  s2 += chainV([vf.Y(topB), vf.Y(topB - yLeg), vf.Y(topB - yRail), vf.Y(topB - yMat), vf.Y(topB - cuTop)], vf.X(fwB) + 6, [yLeg, B.rail.h, B.mat.h, Math.round(cuTop - yMat)], { from: vf.X(fwB) + 1, size: 1.15 });
  s2 += chainV([vf.Y(topB), vf.Y(topB - cuTop)], vf.X(fwB) + 13, [`${Math.round(cuTop)} TO THE TOP`], { from: vf.X(fwB) + 1, size: 1.25 });

  const vsd = view(212, 34, scB, "Bed side"), tsd = vsd.w(0.12);
  s2 += heading(206, 17, "SIDE", `SCALE 1:${scB} · THE WALL ON THE LEFT`, 70);
  s2 += vsd.g(bedSide(tsd), 0.3);
  s2 += chainH([vsd.X(0), vsd.X(B.over), vsd.X(B.over + B.mat.l), vsd.X(lenB)], vsd.Y(topB) + 5, [B.over, `${B.mat.l} MATTRESS`, B.over], { from: vsd.Y(topB) + 1, size: 1.2 });
  s2 += chainH([vsd.X(0), vsd.X(lenB)], vsd.Y(topB) + 11, [`${lenB} OVERALL`], { from: vsd.Y(topB) + 1, size: 1.4 });
  s2 += note(vsd.X(B.over + 80), vsd.Y(topB - yMat - 250), vsd.X(B.over + CU.d) + 14, vsd.Y(-40), "LONG WHITE CUSHION", "LOOSE · LEANS BACK 10° ON THE PLASTER — DETAIL 2");
  s2 += note(vsd.X(lenB - 300), vsd.Y(topB - yRail + 50), vsd.X(lenB) - 10, vsd.Y(topB + 120), "FRAME RAIL, 4 IN", "1 IN LIP ON TOP · TEAK, THE ROOM'S TONE", "end");
  s2 += note(vsd.X(lenB / 2), vsd.Y(topB - 80), vsd.X(lenB / 2) + 22, vsd.Y(topB + 120), "CENTRE FOOT", "UNDER THE MIDDLE RAIL");

  const scP2 = 20, vpl = view(28, 152, scP2, "Bed plan"), tpl = vpl.w(0.1), dpl = `${vpl.w(1)} ${vpl.w(0.7)}`;
  s2 += heading(18, 142, "PLAN", `SCALE 1:${scP2} · THE WALL AT THE TOP · SLATS DASHED`, 80);
  s2 += vpl.g(bedPlan(tpl, dpl), 0.3);
  s2 += chainV([vpl.Y(0), vpl.Y(lenB)], vpl.X(fwB) + 5, [lenB], { from: vpl.X(fwB) + 1, size: 1.2 });
  s2 += chainH([vpl.X(0), vpl.X(fwB)], vpl.Y(lenB) + 5, [fwB], { from: vpl.Y(lenB) + 1, size: 1.2 });

  const vl = view(165, 166, 4, "Bed foot"), tl = vl.w(0.12);
  s2 += heading(140, 142, "1 · TURNED FOOT", "ELEVATION · SCALE 1:4", 50);
  s2 += vl.g(legDetail(tl), 0.3);
  s2 += chainV([vl.Y(0), vl.Y(B.leg.h)], vl.X(B.leg.d / 2) + 6, [B.leg.h], { from: vl.X(B.leg.d / 2) + 1, size: 1.2 });
  s2 += chainH([vl.X(-B.leg.d / 2), vl.X(B.leg.d / 2)], vl.Y(B.leg.h) + 5, [B.leg.d], { from: vl.Y(B.leg.h) + 1, size: 1.2 });
  s2 += note(vl.X(0), vl.Y(8), vl.X(B.leg.d / 2) + 16, vl.Y(-30), "COLLAR", "TURNED IN THE SOLID");

  const vh = view(214, 156, 5, "Back cushion"), th5 = vh.w(0.12);
  s2 += heading(206, 142, "2 · THE BACK CUSHION", "SECTION · SCALE 1:5", 50);
  s2 += vh.g(cushDetail(th5), 0.3);
  s2 += chainH([vh.X(0), vh.X(CU.d)], vh.Y(0) - 3, [CU.d], { from: vh.Y(0), size: 1.15 });
  s2 += chainV([vh.Y(0), vh.Y(CU.h)], vh.X(CU.d) + 5, [CU.h], { from: vh.X(CU.d) + 1, size: 1.15 });
  s2 += note(vh.X(CU.d / 2), vh.Y(CU.h / 2), vh.X(CU.d) + 12, vh.Y(CU.h / 2 + 40), "FOAM", "FEATHER-WRAPPED");
  s2 += note(vh.X(CU.d - CU.r * 0.3), vh.Y(CU.r * 0.3), vh.X(CU.d) + 12, vh.Y(70), "PIPED EDGES", "CREAM WEAVE, ZIPPED");

  s2 += heading(300, 142, "3 · NO HEADBOARD", "", 40);
  ["Nothing is fixed: the cushion is loose — it sits on",
   "the mattress and leans back on the parchment. The",
   "frame's head stands 1 in off the plaster. Wax the",
   "plaster behind the cushion so it does not scuff."]
    .forEach((n, i) => (s2 += text(300, 152 + i * 4.3, n, { size: 1.5 })));

  s2 += heading(300, 178, "NOTES", `REVISION ${B.rev.split(" ")[0]}`, 100);
  ["The bed in the owner's photo, sized to the 6 ft × 6 ft 6 in mattress:",
   "a low dark-wood platform — a 4 in rail with a 1 in lip, on five turned",
   "bun feet. No headboard (owner): a long white cushion along the back,",
   "the mattress's width, leaning on the parchment. Proportions read off",
   "the photos; mattress thickness ASSUMED until the mattress is chosen.",
   "Frame in solid teak, polished dark to sit with the Dark Diva wall.",
   "Cushion: cream textured weave, piped, as the owner's photo."]
    .forEach((n, i) => (s2 += text(300, 189 + i * 4.4, n, { size: 1.5 })));

  s2 += titleBlock({ title: "THE BED", sub: "Front · Side · Plan · Foot · Back cushion", date: B.date, rev: B.rev, dwg: "AST-DR-035", scale: "AS NOTED @ A3" });
  window.DRAWINGS.bedframe = { title: "The bed · AST-DR-035", svg: sheet(s2), model: true };
})();
