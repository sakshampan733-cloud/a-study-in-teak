// The TV unit — AST-DR-036. The partition's two ends curve towards the bed — a proper curve, not a C: a straight
// middle of eight blocks and, at each end, five blocks on a 660 mm radius, coming 15 in forward (owner, 29 Oct). The drawers fill the
// space between the two curves: one straight front from tip to tip, six bays of two drawers, and the outer drawers'
// boxes cut at the back to the curve of the glass, so every one still runs straight out. One bay left of centre stays
// open for the subwoofer (the only bay deep enough for it). Nothing that moves is curved.
// Plan: x along the partition from its middle (+ to the right, seen from the bed), y from the glass's centre line
// towards the bed. Elevation and section: z up from the floor. Real units mm.

window.DRAWINGS = window.DRAWINGS || {};

const TVUNIT = {
  rev: "3 — the partition's ends curve 15 in to the bed; the drawers fill the space between the curves (owner, 29 Oct)",
  date: "29.10.2026",
  // the partition as built in the 3D (glassblock.py): Mano cast-glass blocks, 140 face + 10 joint, 95 deep, 18 across;
  // the middle 8 straight, the last 5 at each end curving towards the bed on a 660 radius; a bronze channel at each end
  glass: { mod: 150, blk: 140, dep: 95, cols: 18, rad: 660, straight: 600, chan: 14, track: 4, z0: 10 },
  col: 290,                     // the wood column up the middle — the TV's power comes down it
  gap: 5, depth: 400,           // 5 mm off the glass, 400 deep in the middle: the foot of the bed stays 2 ft 5⅜ in away
  bays: 6, sub: 2,              // six equal bays from tip to tip; the third from the left open for the subwoofer
  h: 450, plinth: 60, inset: 50, top: 26, over: 10,   // kept low (owner: "don't make them too high"); bullnose top
  front: 20, reveal: 3, ease: 5,                      // fronts 20 thick, 3 mm gaps, every edge eased 5 mm
  back: 9, panel: 18,
  box: { len: 350, side: 15, bot: 12, z: [92, 262], h: [110, 120], clear: 12 },   // drawer boxes: 350 deep where they can be
  pull: { len: 260, posts: 220, proj: 28, bar: 10, edge: 50 },                    // the slim brass bar already chosen
  woofer: { w: 388, d: 388, h: 210 },                 // Sony's Bar 6 subwoofer, on its side
  tv: { w: 1227, h: 706, zc: 1055, stand: 35, d: 26 },
  clear: { wallToCentre: 3353, wallToFoot: 2128 },    // AST-DR-034/035: partition centre line and the bed's foot, off the bed wall
};

(function () {
  const { INK, THIN, DIM, f, text, mmToFt, view, chainH, chainV, note, heading, cutMark, bubble, frame, titleBlock, sheet } = window.DK;
  const K = TVUNIT, G = K.glass, R = G.rad, A = G.straight, UH = (G.cols * G.mod) / 2;
  const ft = (mm) => mmToFt(mm).replace("'-", " ft ").replace('"', " in").replace(/^0 ft /, "").replace(/ 0 in$/, "");
  const VEN = "#dcc2a2", VEN2 = "#b8967a", CUT = "#a8876a", GLASS = "#e9f1f1", BRONZE = "#8b6a4f", DARK = "#3b3029", BRASS = "#c9a24a", WOOD = "#c9a88a", TVC = "#151515";

  // the partition's run: position u along it (from the middle) and w across it (+ towards the bed) to plan x, y
  function place(u, w) {
    if (Math.abs(u) <= A) return [u, w];
    const sg = Math.sign(u), th = (Math.abs(u) - A) / R;
    return [sg * (A + R * Math.sin(th)) - sg * w * Math.sin(th), R * (1 - Math.cos(th)) + w * Math.cos(th)];
  }
  const TURN = (UH - A) / R, REACH = R * (1 - Math.cos(TURN)), NC = (UH - A) / G.mod;   // each end: 5 blocks, 65°, 15 in forward
  const JO = Math.round(G.mod * (R + G.dep / 2) / R - G.blk), JI = Math.round(G.mod * (R - G.dep / 2) / R - G.blk);   // the joints, bed side and desk side
  const W0 = G.dep / 2 + K.gap, YF = W0 + K.depth, UE = UH + G.chan;
  const E = place(UE, W0), XT = E[0];                                   // the tip: the drawers run from tip to tip
  // how far forward the glass's bed-side face (offset w) stands at plan x
  function backAt(x, w = W0) {
    if (Math.abs(x) <= A) return w;
    let lo = A, hi = UE;
    for (let k = 0; k < 40; k++) { const m = (lo + hi) / 2; if (place(m, w)[0] < Math.abs(x)) lo = m; else hi = m; }
    return place((lo + hi) / 2, w)[1];
  }
  const fh = (K.h - K.top - K.plinth - 3 * K.reveal) / 2;                // each drawer front
  const zD = [K.plinth + K.reveal, K.plinth + 2 * K.reveal + fh];        // their bottoms
  const zTop = K.h - K.top;
  const CLEAR = K.clear.wallToCentre - YF - K.clear.wallToFoot;          // fronts to the foot of the bed

  const pl = (pts) => pts.map(([x, y], i) => `${i ? "L" : "M"} ${f(x)} ${f(y)}`).join(" ");
  const RC = (x0, y0, x1, y1, attr) => `<rect x="${f(Math.min(x0, x1))}" y="${f(Math.min(y0, y1))}" width="${f(Math.abs(x1 - x0))}" height="${f(Math.abs(y1 - y0))}" ${attr}/>`;
  const along = (w0, w1, u0, u1, n = 6) => {
    const a = [], b = [];
    for (let i = 0; i <= n; i++) { const u = u0 + ((u1 - u0) * i) / n; a.push(place(u, w0)); b.push(place(u, w1)); }
    return a.concat(b.reverse());
  };
  // the unit in plan, offset 'off' from the front (the top +10, the plinth −50): the straight front, and behind it the
  // glass's curve from tip to tip — wherever the curve comes forward of the front, the unit stops there
  function outline(off, wb = W0) {
    const yF = YF + off, pts = [];
    for (let i = 0; i <= 120; i++) { const p = place(UE - (2 * UE * i) / 120, wb); if (p[1] < yF) pts.push(p); }
    return [[pts[0][0], yF]].concat(pts, [[pts[pts.length - 1][0], yF]]);
  }
  const bayX = Array.from({ length: K.bays + 1 }, (_, i) => -XT + (2 * XT * i) / K.bays), BW = bayX[1] - bayX[0];
  const isSub = (i) => i === K.sub;
  const frontX = (i) => [bayX[i] + (i === 0 ? K.reveal : K.reveal / 2), bayX[i + 1] - (i === K.bays - 1 ? K.reveal : K.reveal / 2)];
  // an upper drawer's box in plan: straight at the front, its back 350 behind or cut to the glass, whichever comes first
  function boxPts(i, inset = 0) {
    const x0 = bayX[i] + K.panel / 2 + 6 + inset, x1 = bayX[i + 1] - K.panel / 2 - 6 - inset, yf = YF - K.front - inset, n = 12, back = [];
    for (let k = 0; k <= n; k++) { const x = x0 + ((x1 - x0) * k) / n; back.push([x, Math.min(yf - 2 * K.box.side, Math.max(YF - K.front - K.box.len + inset, backAt(x, W0 + K.back) + K.box.clear + inset))]); }
    return [[x0, yf]].concat(back, [[x1, yf]]);
  }

  // ════════ PLAN — cut through the upper drawers ════════
  function plan(t, dash) {
    let o = "";
    const WC = [G.cols / 2 - 1, G.cols / 2];
    for (let c = 0; c < G.cols; c++) {                                   // the glass blocks
      if (WC.includes(c)) continue;
      const u0 = -UH + c * G.mod + (G.mod - G.blk) / 2;
      o += `<path d="${pl(along(-G.dep / 2, G.dep / 2, u0, u0 + G.blk, 4))} Z" fill="${GLASS}" stroke-width="${t}"/>`;
    }
    o += `<path d="${pl(along(-G.dep / 2, G.dep / 2, -K.col / 2, K.col / 2, 2))} Z" fill="${WOOD}" stroke-width="${t * 1.2}"/>`;
    [[UH, UE], [-UE, -UH]].forEach(([a, b]) => (o += `<path d="${pl(along(-G.dep / 2 - G.track, G.dep / 2 + G.track, a, b, 2))} Z" fill="${BRONZE}" stroke-width="${t}"/>`));
    // the TV above, and the plinth below (dashed)
    o += RC(-K.tv.w / 2, G.dep / 2 + K.tv.stand, K.tv.w / 2, G.dep / 2 + K.tv.stand + K.tv.d, `fill="none" stroke-width="${t * 1.1}" stroke-dasharray="${dash}"`);
    o += `<path d="${pl(outline(-K.inset, W0 + K.back))} Z" fill="none" stroke-width="${t * 0.8}" stroke-dasharray="${dash}"/>`;
    // the carcase, cut: the back panel along the glass from tip to tip, the dividers, the two ends at the tips
    o += `<path d="${pl(along(W0, W0 + K.back, -UE, UE, 96))} Z" fill="${CUT}" stroke-width="${t}"/>`;
    bayX.slice(1, -1).forEach((x) => (o += RC(x - K.panel / 2, backAt(Math.abs(x) + K.panel / 2, W0 + K.back), x + K.panel / 2, YF - K.front, `fill="${CUT}" stroke-width="${t}"`)));
    [-1, 1].forEach((sg) => { const x = sg * (XT - K.panel); o += RC(x, backAt(XT, W0 + K.back), sg * XT, YF - K.front, `fill="${CUT}" stroke-width="${t}"`); });
    // the drawer boxes (upper drawers), their sides cut; the outer ones shaped to the glass
    for (let i = 0; i < K.bays; i++) {
      if (isSub(i)) continue;
      o += `<path d="${pl(boxPts(i))} Z" fill="${VEN2}" stroke-width="${t}"/><path d="${pl(boxPts(i, K.box.side))} Z" fill="#fff" stroke-width="${t}"/>`;
    }
    // the subwoofer in its open bay (dashed)
    { const c = (bayX[K.sub] + bayX[K.sub + 1]) / 2, W = K.woofer;
      o += RC(c - W.w / 2, YF - 6 - W.d, c + W.w / 2, YF - 6, `fill="none" stroke-width="${t * 0.8}" stroke-dasharray="${dash}"`); }
    // the fronts and the pulls
    for (let i = 0; i < K.bays; i++) {
      if (isSub(i)) continue;
      const [a, b] = frontX(i), c = (a + b) / 2, P = K.pull;
      o += RC(a, YF - K.front, b, YF, `fill="${VEN}" stroke-width="${t * 1.2}"`);
      o += RC(c - P.len / 2, YF + P.proj - P.bar, c + P.len / 2, YF + P.proj, `fill="${BRASS}" stroke-width="${t * 0.8}"`);
      [-1, 1].forEach((d) => (o += RC(c + d * P.posts / 2 - 5, YF, c + d * P.posts / 2 + 5, YF + P.proj - P.bar, `fill="${BRASS}" stroke-width="${t * 0.6}"`)));
    }
    // the top, oversailing 10 at the front (dashed)
    o += `<path d="${pl(outline(K.over))} Z" fill="none" stroke-width="${t * 0.9}" stroke-dasharray="${dash}"/>`;
    return o;
  }

  // ════════ FRONT ELEVATION — from the bed ════════
  function elevation(t, dash, zCut = 620) {
    const Z = (z) => -z;
    let o = "";
    const xs = (u, w = G.dep / 2) => place(u, w)[0], WC = [G.cols / 2 - 1, G.cols / 2];
    // the glass above the unit, to a break
    for (let c = 0; c < G.cols; c++) {
      if (WC.includes(c)) continue;
      const u0 = -UH + c * G.mod + (G.mod - G.blk) / 2, a = xs(u0), b = xs(u0 + G.blk);
      for (let r = 0; ; r++) {
        const z0 = G.z0 + r * G.mod, z1 = z0 + G.blk;
        if (z0 >= zCut) break;
        if (z1 <= K.h) continue;
        o += RC(a, Z(Math.max(z0, K.h)), b, Z(Math.min(z1, zCut)), `fill="${GLASS}" stroke-width="${t * 0.8}"`);
      }
    }
    o += RC(-K.col / 2, Z(K.h), K.col / 2, Z(zCut), `fill="${WOOD}" stroke-width="${t}"`);
    [[UH, UE], [-UE, -UH]].forEach(([a, b]) => (o += RC(xs(a, G.dep / 2 + G.track), Z(0), xs(b, G.dep / 2 + G.track), Z(zCut), `fill="${BRONZE}" stroke-width="${t}"`)));
    // the break line across the top
    { const L = xs(-UE) - 60, Rr = xs(UE) + 60, zz = zCut + 8, m = (L + Rr) / 2;
      o += `<path d="M ${f(L)} ${f(Z(zz))} L ${f(m - 60)} ${f(Z(zz))} L ${f(m - 20)} ${f(Z(zz + 45))} L ${f(m + 20)} ${f(Z(zz - 45))} L ${f(m + 60)} ${f(Z(zz))} L ${f(Rr)} ${f(Z(zz))}" fill="none" stroke-width="${t * 0.8}"/>`; }
    // the plinth, set back; the carcase in the reveals
    const xP = Math.max(...outline(-K.inset, W0 + K.back).map((p) => p[0]));
    o += RC(-xP, Z(0), xP, Z(K.plinth), `fill="${DARK}" stroke-width="${t}"`);
    o += RC(-XT, Z(K.plinth), XT, Z(zTop), `fill="${VEN2}" stroke-width="${t}"`);
    // the fronts: two drawers in every bay but the subwoofer's, which stands open
    for (let i = 0; i < K.bays; i++) {
      const [a, b] = frontX(i);
      if (isSub(i)) {
        o += RC(a, Z(zD[0]), b, Z(zD[1] + fh), `fill="${DARK}" stroke-width="${t}"`);
        const c = (a + b) / 2, W = K.woofer;
        o += RC(c - W.w / 2, Z(zD[0] + 2), c + W.w / 2, Z(zD[0] + 2 + W.h), `fill="${TVC}" stroke-width="${t * 0.8}"`);
        continue;
      }
      zD.forEach((z0) => {
        o += `<rect x="${f(a)}" y="${f(Z(z0 + fh))}" width="${f(b - a)}" height="${f(fh)}" rx="${K.ease}" fill="${VEN}" stroke-width="${t * 1.2}"/>`;
        const c = (a + b) / 2, zm = z0 + fh / 2;
        o += RC(c - K.pull.len / 2, Z(zm - K.pull.bar / 2), c + K.pull.len / 2, Z(zm + K.pull.bar / 2), `fill="${BRASS}" stroke-width="${t * 0.8}"`);
      });
    }
    // the top: a bullnose on the front, stopping at the glass at each end
    o += `<rect x="${f(-XT)}" y="${f(Z(K.h))}" width="${f(2 * XT)}" height="${K.top}" rx="${K.top / 2}" fill="${VEN}" stroke-width="${t * 1.2}"/>`;
    o += `<line x1="${f(-XT + 20)}" y1="${f(Z(K.h - K.top / 2))}" x2="${f(XT - 20)}" y2="${f(Z(K.h - K.top / 2))}" stroke-width="${t * 0.35}" stroke="${VEN2}"/>`;
    o += `<line x1="${f(xs(-UE) - 120)}" y1="0" x2="${f(xs(UE) + 120)}" y2="0" stroke-width="${t * 3}"/>`;
    return o;
  }

  // ════════ SECTION A–A — through a drawer stack; the glass on the left, the bed to the right ════════
  function section(t, dash, zCut = 560) {
    const Z = (z) => -z;
    let o = "";
    for (let r = 0; ; r++) {                                              // the glass courses and their joints
      const z0 = G.z0 + r * G.mod;
      if (z0 >= zCut) break;
      o += RC(-G.dep / 2 + 6, Z(z0 - 10), G.dep / 2 - 6, Z(z0), `fill="#4a4038" stroke="none"`);
      o += `<rect x="${f(-G.dep / 2)}" y="${f(Z(Math.min(z0 + G.blk, zCut)))}" width="${G.dep}" height="${f(Math.min(G.blk, zCut - z0))}" rx="7" fill="${GLASS}" stroke-width="${t}"/>`;
    }
    o += `<path d="M ${f(-G.dep / 2 - 30)} ${f(Z(zCut))} L ${f(-10)} ${f(Z(zCut))} L ${f(5)} ${f(Z(zCut + 25))} L ${f(15)} ${f(Z(zCut - 25))} L ${f(30)} ${f(Z(zCut))} L ${f(G.dep / 2 + 30)} ${f(Z(zCut))}" fill="none" stroke-width="${t * 0.8}"/>`;
    // plinth, carcase bottom, back panel, top
    o += RC(W0 + K.back, Z(0), YF - K.inset, Z(K.plinth), `fill="${DARK}" stroke-width="${t}"`);
    o += RC(W0 + K.back, Z(K.plinth), YF - K.front, Z(K.plinth + K.panel), `fill="${CUT}" stroke-width="${t}"`);
    o += RC(W0, Z(K.plinth), W0 + K.back, Z(zTop), `fill="${CUT}" stroke-width="${t}"`);
    const a = YF + K.over - K.top / 2;
    o += `<path d="M ${f(W0)} ${f(Z(zTop))} L ${f(a)} ${f(Z(zTop))} A ${K.top / 2} ${K.top / 2} 0 0 0 ${f(a)} ${f(Z(K.h))} L ${f(W0)} ${f(Z(K.h))} Z" fill="${CUT}" stroke-width="${t * 1.1}"/>`;
    // the two drawers: front, box (side beyond; front, back and bottom cut), runner, pull
    zD.forEach((z0, j) => {
      const B = K.box, bz = B.z[j], bh = B.h[j], y0 = YF - K.front - B.len, y1 = YF - K.front;
      o += `<rect x="${f(YF - K.front)}" y="${f(Z(z0 + fh))}" width="${K.front}" height="${f(fh)}" rx="${K.ease}" fill="${VEN}" stroke-width="${t * 1.1}"/>`;
      o += RC(y0, Z(bz), y1, Z(bz + bh), `fill="#fff" stroke-width="${t * 0.7}"`);
      o += RC(y0, Z(bz), y1, Z(bz + B.bot), `fill="${VEN2}" stroke-width="${t * 0.8}"`);
      o += RC(y0, Z(bz), y0 + B.side, Z(bz + bh), `fill="${VEN2}" stroke-width="${t * 0.8}"`) + RC(y1 - B.side, Z(bz), y1, Z(bz + bh), `fill="${VEN2}" stroke-width="${t * 0.8}"`);
      o += RC(y0 + 10, Z(bz - 9), y1 - 5, Z(bz - 1), `fill="#9a9a9a" stroke-width="${t * 0.5}"`);
      const zm = z0 + fh / 2, P = K.pull;
      o += RC(YF, Z(zm - 4), YF + P.proj - P.bar, Z(zm + 4), `fill="${BRASS}" stroke-width="${t * 0.6}"`) + RC(YF + P.proj - P.bar, Z(zm - P.bar / 2), YF + P.proj, Z(zm + P.bar / 2), `fill="${BRASS}" stroke-width="${t * 0.8}"`);
    });
    o += `<line x1="${f(-G.dep / 2 - 60)}" y1="0" x2="${f(YF + 140)}" y2="0" stroke-width="${t * 3}"/>`;
    return o;
  }

  // ═════════════ SHEET — AST-DR-036, THE TV UNIT ═════════════
  window.DK.begin("tvunit");
  let s = frame();

  // plan 1:10
  const sc = 10, vp = view(150, 46, sc, "TV unit plan"), tp = vp.w(0.1), dp = `${vp.w(1)} ${vp.w(0.7)}`;
  s += heading(18, 17, "PLAN", `CUT THROUGH THE UPPER DRAWERS · SCALE 1:${sc} · THE PARTITION AT THE TOP, THE BED BELOW · TOP AND PLINTH DASHED`, 150);
  s += vp.g(plan(tp, dp), 0.3);
  { const yb = vp.Y(YF + K.pull.proj) + 4;
    s += chainH([...bayX.map(vp.X)], yb, Array(K.bays).fill(Math.round(BW)), { from: vp.Y(YF) + 0.5, size: 1.1 });
    s += chainH([vp.X(-XT), vp.X(XT)], yb + 6, [`${Math.round(2 * XT)} — ONE STRAIGHT FRONT, TIP TO TIP`], { from: yb, size: 1.25 });
    s += chainV([vp.Y(G.dep / 2), vp.Y(YF)], vp.X(-UE) - 9, [`${K.depth + K.gap}`], { from: vp.X(-A) - 1, size: 1.15 });
    s += chainV([vp.Y(0), vp.Y(REACH)], vp.X(UE) + 10, [`${ft(REACH)} — THE CURVE`], { from: vp.X(A), size: 1.15 });
    s += text(vp.X(0), yb + 17, `▼  THE FOOT OF THE BED, ${ft(CLEAR)} FROM THE FRONTS — ${ft(CLEAR - K.box.len)} WITH A DRAWER OUT`, { size: 1.5, anchor: "middle", fill: THIN });
    const c1 = (bayX[3] + bayX[4]) / 2, gp = place(-UH + 2.5 * G.mod, 0), op = boxPts(5)[9];
    s += note(vp.X(gp[0]), vp.Y(gp[1]), vp.X(-1100), 30, "GLASS-BLOCK PARTITION", `ENDS CURVE TO THE BED: ${NC} BLOCKS ON R ${R}, ${Math.round(TURN * 180 / Math.PI)}°`, "end");
    s += note(vp.X(-60), vp.Y(-20), vp.X(-430), 37, "WOOD COLUMN, 1 FT", "", "end");
    s += note(vp.X(-K.tv.w / 2 + 120), vp.Y(G.dep / 2 + K.tv.stand + 10), vp.X(-760), 37, "TV ABOVE (DASHED)", "", "end");
    s += note(vp.X(300), vp.Y(W0 + 5), vp.X(150), 30, "BACK PANEL, VENEERED BOTH FACES", "IT READS THROUGH THE GLASS FROM THE DESK");
    s += note(vp.X(c1 - 120), vp.Y(YF - 200), vp.X(560), 37, "DRAWER BOX ON 350 RUNNERS", "FULL EXTENSION, SOFT CLOSE");
    s += note(vp.X(op[0]), vp.Y(op[1]), vp.X(1000), 30, "OUTER DRAWERS CUT TO THE CURVE", "DETAIL 1");
    { const c = (bayX[K.sub] + bayX[K.sub + 1]) / 2;
      s += note(vp.X(c - 100), vp.Y(YF - 120), vp.X(-1150), yb + 22, "SUBWOOFER BAY, OPEN", "THE ONLY BAY DEEP ENOUGH FOR IT", "start"); }
    s += cutMark(vp.X(c1) - 3, vp.Y(-110), "A", "down");
    s += cutMark(vp.X(c1) - 3, yb + 11, "A", "up");
  }

  // front elevation 1:10, under the plan
  const ve = view(150, 224, sc, "TV unit elevation"), te = ve.w(0.1), de = `${ve.w(1)} ${ve.w(0.7)}`;
  s += heading(18, 139, "FRONT", `SEEN FROM THE BED · SCALE 1:${sc} · THE GLASS BROKEN OFF ABOVE`, 150);
  s += ve.g(elevation(te, de), 0.3);
  { const yb = ve.Y(0) + 4;
    s += chainH([...bayX.map(ve.X)], yb, bayX.slice(1).map((_, i) => (isSub(i) ? "SUB" : "2 DRAWERS")), { from: ve.Y(0) + 0.5, size: 1.0 });
    s += chainV([ve.Y(0), ve.Y(-K.plinth), ve.Y(-zD[1] + K.reveal / 2), ve.Y(-zTop), ve.Y(-K.h)], ve.X(XT + 140) + 6,
      [K.plinth, Math.round(zD[1] - K.reveal / 2 - K.plinth), Math.round(zTop - zD[1] + K.reveal / 2), K.top], { from: ve.X(XT + 10) + 1, size: 1.1 });
    s += chainV([ve.Y(0), ve.Y(-K.h)], ve.X(XT + 140) + 13, [`${K.h} — KEPT LOW`], { from: ve.X(XT + 10) + 1, size: 1.2 });
    const cS = (bayX[K.sub] + bayX[K.sub + 1]) / 2, c3 = (bayX[3] + bayX[4]) / 2;
    s += note(ve.X(-700), ve.Y(-K.h + 8), ve.X(-1050), 150, "BULLNOSE TOP, 1 IN", "", "end");
    s += note(ve.X(cS - 60), ve.Y(-zD[0] - 150), ve.X(-1200), 156, "SUBWOOFER BAY — OPEN", "SONY BAR 6 SUB ON ITS SIDE", "start");
    s += note(ve.X(c3), ve.Y(-(zD[1] + fh / 2) - 30), ve.X(-300), 150, "DRAWERS, TWO HIGH", "SLIM BRASS BAR, AS BEFORE", "start");
    s += note(ve.X(XT - 30), ve.Y(-300), ve.X(800), 150, "THE END STOPS AT THE GLASS'S TIP", "SCRIBED TO THE BRONZE CHANNEL");
    s += note(ve.X(600), ve.Y(-30), ve.X(330), 156, "PLINTH, DARK, 2 IN BACK", "");
  }

  // section A–A 1:6, right column
  const scS = 6, vs = view(298, 128, scS, "TV unit section A-A"), ts = vs.w(0.11), ds = `${vs.w(1)} ${vs.w(0.7)}`;
  s += heading(284, 17, "SECTION A–A", `THROUGH A DRAWER STACK · SCALE 1:${scS}`, 92);
  s += vs.g(section(ts, ds), 0.3);
  s += chainV([vs.Y(0), vs.Y(-K.plinth), vs.Y(-zD[1] + K.reveal / 2), vs.Y(-zTop), vs.Y(-K.h)], vs.X(-G.dep / 2) - 4,
    [K.plinth, Math.round(zD[1] - K.reveal / 2 - K.plinth), Math.round(zTop - zD[1] + K.reveal / 2), K.top], { from: vs.X(-G.dep / 2) - 0.5, size: 1.1 });
  s += chainH([vs.X(-G.dep / 2), vs.X(G.dep / 2), vs.X(YF), vs.X(YF + K.pull.proj)], vs.Y(0) + 5, [G.dep, K.depth + K.gap, ""], { from: vs.Y(0) + 0.5, size: 1.15 });
  { const L = [
      [vs.X(YF + K.over - 4), vs.Y(-K.h + 13), "BULLNOSE TOP", "26, SOLID TEAK LIP"],
      [vs.X(YF + K.pull.proj - 3), vs.Y(-(zD[1] + fh / 2)), "BRASS BAR", "ON TWO POSTS"],
      [vs.X(YF - K.front / 2), vs.Y(-(zD[0] + fh / 2) - 20), "FRONT, 20", "EDGES EASED 5"],
      [vs.X(200), vs.Y(-K.box.z[0] + 5), "350 RUNNER", "UNDERMOUNT"],
      [vs.X(YF - 100), vs.Y(-K.plinth / 2), "PLINTH", "SET BACK 2 IN"],
    ];
    L.sort((p, q) => p[1] - q[1]).forEach(([x, y, l1, l2], i) => (s += note(x, y, 381, 44 + i * 16, l1, l2)));
    s += note(vs.X(W0 + K.back / 2), vs.Y(-300), vs.X(120), 40, "BACK, 9", "", "start");
    s += note(vs.X(0), vs.Y(-200), vs.X(-80), 40, "GLASS", "", "end"); }

  // detail 1 — the end at the curve, plan 1:5
  const scD = 5, dx0 = 800, dy0 = 90, vd = view(287 - dx0 / scD, 163 - dy0 / scD, scD, "TV unit end at the curve"), td = vd.w(0.11), dd = `${vd.w(1)} ${vd.w(0.7)}`;
  s += heading(284, 150, "DETAIL 1 · THE END AT THE CURVE", `PLAN · SCALE 1:${scD}`, 92);
  s += `<clipPath id="clipTV1"><rect x="${vd.X(dx0)}" y="${vd.Y(dy0)}" width="${f(470 / scD)}" height="${f(390 / scD)}"/></clipPath>`;
  s += `<g clip-path="url(#clipTV1)">${vd.g(plan(td, dd), 0.3)}</g>`;
  { const bp = boxPts(5), g1 = place(UH - 2.5 * G.mod, G.dep / 2), tp_ = outline(K.over);
    [[XT - 6, E[1] + 6, "SCRIBED TO THE BRONZE CHANNEL", "AT THE PARTITION'S TIP"],
     [g1[0], g1[1], "THE GLASS CURVES TO THE BED", `R ${R} · ${ft(REACH)} FORWARD`],
     [bp[8][0], bp[8][1] - 4, "THE BOX'S BACK CUT TO THE CURVE", "IT RUNS STRAIGHT OUT, SHORTER RUNNERS"],
     [bayX[5] + 2, YF - K.front - 40, "18 DIVIDER", ""],
     [tp_[0][0] - 60, tp_[0][1], "TOP OVERSAILS 10 AT THE FRONT", "AND STOPS AT THE GLASS (DASHED)"],
     [bayX[5] + 120, YF + 6, "DRAWER FRONT, FLAT", "BRASS BAR"]]
      .forEach(([x, y, l1, l2], i) => (s += note(vd.X(x), vd.Y(y), vd.X(1290), 164 + i * 12.5, l1, l2))); }

  // notes, what is assumed, what is open
  s += heading(18, 241, "NOTES", `REVISION ${K.rev.split(" ")[0]}`, 88);
  [`The partition's ends curve towards the bed, a proper curve — ${NC} blocks`,
   `at each end on a ${R} radius, ${Math.round(TURN * 180 / Math.PI)}°, coming ${ft(REACH)} forward (owner, 29 Oct).`,
   "The drawers fill the space between the two curves: one straight front",
   "from tip to tip, six bays, two drawers in each. The outer drawers' boxes",
   "are cut at the back to the curve, so every drawer runs straight out.",
   "One bay open for the subwoofer — the only one deep enough for it.",
   "Nothing that moves is curved."]
    .forEach((n, i) => (s += text(18, 251.5 + i * 4.2, n, { size: 1.45 })));
  s += heading(112, 241, "ASSUMED", "TELL ME IF ANY OF THESE IS WRONG", 88);
  ["Height 1 ft 5¾ in and depth 1 ft 3¾ in in the middle, as before.",
   "The 9292 burl, polished darker than the room (owner, 7 Oct),",
   "   the grain running on across all six bays.",
   "The slim brass bar on every drawer.",
   "Every edge eased 5 mm; the top a full bullnose.",
   "The right-hand cabinet door is gone: drawers, as asked."]
    .forEach((n, i) => (s += text(112, 251.5 + i * 4.2, n, { size: 1.45 })));
  s += heading(206, 241, "TO DECIDE", "", 80);
  ["Fronts: eased edges as drawn, or rounder —",
   "   each front a small pill of its own?",
   "Pulls: the brass bar, or push-to-open with none.",
   `The curve: Eco Outdoor to confirm R ${R} for this block —`,
   `   joints ${JO} mm on the bed side, ${Math.max(JI, 0)} on the desk side.`]
    .forEach((n, i) => (s += text(206, 251.5 + i * 4.2, n, { size: 1.45 })));

  s += titleBlock({ title: "TV UNIT — DRAWERS", sub: "Plan · Front · Section A–A · End at the curve", date: K.date, rev: K.rev, dwg: "AST-DR-036", scale: "AS NOTED @ A3" });
  window.DRAWINGS.tvunit = { title: "TV unit · AST-DR-036", svg: sheet(s), model: true };
  // handed to the overview plan and the 3D room, so they cannot disagree with the sheet
  window.TVGEOM = { W0, YF, X1: XT, XT, E, UE, bayX, outline, place, backAt, K, G, REACH, TURN };
})();
