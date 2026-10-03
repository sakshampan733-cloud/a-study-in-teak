// The TV unit — AST-DR-036. From the owner's sketch (03.10.2026): the drawers under the TV, re-planned so they open.
// The 4 × 2 run that followed the partition's curve could not open at its curved ends, and looked heavy (owner). In
// plan the unit is now a pill: one straight front across the middle and a quarter-round at each end that wraps back
// to the tip of the glass-block partition. Behind the straight front, four equal bays: two stacks of two drawers in the
// middle, and at each end one cabinet the size of two drawers with a flat door (owner: "the far left and far right
// drawers ... one two drawer size cabinet which opens"). Nothing that moves is curved — the drawers run straight out,
// square to the glass, the doors are flat, and the round ends are fixed.
// Plan: x along the partition from its middle (+ to the right, seen from the bed), y from the glass's centre line
// towards the bed. Elevation and section: z up from the floor. Real units mm.

window.DRAWINGS = window.DRAWINGS || {};

const TVUNIT = {
  rev: "1 — a pill in plan: two drawer stacks, two cabinets",
  date: "03.10.2026",
  // the partition as built in the 3D (glassblock.py): Mano cast-glass blocks, 140 face + 10 joint, 95 deep, 16 across;
  // the middle 8 straight, the last 4 at each end turning towards the bed on a 1.3 m radius; a bronze channel at each end
  glass: { mod: 150, blk: 140, dep: 95, cols: 16, rad: 1300, straight: 600, chan: 14, track: 4, z0: 10 },
  col: 290,                     // the wood column up the middle — the TV's power comes down it
  gap: 5, depth: 400,           // 5 mm off the glass, 400 deep: the foot of the bed stays 2 ft 6⅜ in away, as before
  bay: 450, bays: 4,            // four equal bays, 17¾ in, so the joints at ±450 fall on glass joints
  h: 450, plinth: 60, inset: 50, top: 26, over: 10,   // kept low (owner: "don't make them too high"); bullnose top
  front: 20, reveal: 3, ease: 5,                      // fronts 20 thick, 3 mm gaps, every edge eased 5 mm
  back: 9, panel: 18,
  box: { len: 350, side: 15, bot: 12, z: [92, 262], h: [110, 120] },   // drawer boxes on 350 full-extension runners
  pull: { len: 260, posts: 220, proj: 28, bar: 10, edge: 50 },          // the slim brass bar already chosen
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
  const W0 = G.dep / 2 + K.gap, YF = W0 + K.depth, X1 = (K.bay * K.bays) / 2, UE = UH + G.chan;
  const E = place(UE, W0);                                               // where each round end meets the partition's tip
  const RR = ((E[0] - X1) ** 2 + (YF - E[1]) ** 2) / (2 * (YF - E[1]));  // its radius, tangent to the front
  const CY = YF - RR, TE = Math.atan2(E[1] - CY, E[0] - X1);
  const fh = (K.h - K.top - K.plinth - 3 * K.reveal) / 2;                // each drawer front
  const zD = [K.plinth + K.reveal, K.plinth + 2 * K.reveal + fh];        // their bottoms
  const zTop = K.h - K.top, zMidD = zTop / 2 + K.plinth / 2;             // the door's middle
  const CLEAR = K.clear.wallToCentre - YF - K.clear.wallToFoot;          // fronts to the foot of the bed

  const pl = (pts) => pts.map(([x, y], i) => `${i ? "L" : "M"} ${f(x)} ${f(y)}`).join(" ");
  const RC = (x0, y0, x1, y1, attr) => `<rect x="${f(Math.min(x0, x1))}" y="${f(Math.min(y0, y1))}" width="${f(Math.abs(x1 - x0))}" height="${f(Math.abs(y1 - y0))}" ${attr}/>`;
  const along = (w0, w1, u0, u1, n = 6) => {
    const a = [], b = [];
    for (let i = 0; i <= n; i++) { const u = u0 + ((u1 - u0) * i) / n; a.push(place(u, w0)); b.push(place(u, w1)); }
    return a.concat(b.reverse());
  };
  // the pill, offset 'off' outward (the top +10, the plinth −50): right round end, back along the glass, left round end;
  // the closing segment is the straight front
  function outline(off, wb = W0, n = 28) {
    const arc = (sg) => Array.from({ length: n + 1 }, (_, i) => {
      const t = Math.PI / 2 + ((TE - Math.PI / 2) * i) / n;
      return [sg * (X1 + (RR + off) * Math.cos(t)), CY + (RR + off) * Math.sin(t)];
    });
    const back = Array.from({ length: 49 }, (_, i) => place(UE + off - (2 * (UE + off) * i) / 48, wb));
    return arc(1).concat(back, arc(-1).reverse());
  }
  const ring = (sg, r0, r1, n = 28) => {                                 // a band between two radii of the round end
    const a = [], b = [];
    for (let i = 0; i <= n; i++) { const t = Math.PI / 2 + ((TE - Math.PI / 2) * i) / n; a.push([sg * (X1 + r0 * Math.cos(t)), CY + r0 * Math.sin(t)]); b.push([sg * (X1 + r1 * Math.cos(t)), CY + r1 * Math.sin(t)]); }
    return a.concat(b.reverse());
  };
  const bayX = [-X1, -K.bay, 0, K.bay, X1];
  const isDoor = (i) => i === 0 || i === K.bays - 1;
  // a front's left and right edge: 3 mm gaps between, the door stopping 3 mm short of the round end
  const frontX = (i) => [bayX[i] + (i === 0 ? K.reveal : K.reveal / 2), bayX[i + 1] - (i === K.bays - 1 ? K.reveal : K.reveal / 2)];

  // ════════ PLAN — cut through the upper drawers ════════
  function plan(t, dash) {
    let o = "";
    for (let c = 0; c < G.cols; c++) {                                   // the glass blocks
      if (c === 7 || c === 8) continue;
      const u0 = -UH + c * G.mod + (G.mod - G.blk) / 2;
      o += `<path d="${pl(along(-G.dep / 2, G.dep / 2, u0, u0 + G.blk, 4))} Z" fill="${GLASS}" stroke-width="${t}"/>`;
    }
    o += `<path d="${pl(along(-G.dep / 2, G.dep / 2, -K.col / 2, K.col / 2, 2))} Z" fill="${WOOD}" stroke-width="${t * 1.2}"/>`;
    [[UH, UE], [-UE, -UH]].forEach(([a, b]) => (o += `<path d="${pl(along(-G.dep / 2 - G.track, G.dep / 2 + G.track, a, b, 2))} Z" fill="${BRONZE}" stroke-width="${t}"/>`));
    // the TV above, and the plinth below (dashed)
    o += RC(-K.tv.w / 2, G.dep / 2 + K.tv.stand, K.tv.w / 2, G.dep / 2 + K.tv.stand + K.tv.d, `fill="none" stroke-width="${t * 1.1}" stroke-dasharray="${dash}"`);
    o += `<path d="${pl(outline(-K.inset, W0 + K.back))} Z" fill="none" stroke-width="${t * 0.8}" stroke-dasharray="${dash}"/>`;
    // the carcase, cut: back panel along the glass, the dividers, the two round ends
    o += `<path d="${pl(along(W0, W0 + K.back, -UE, UE, 64))} Z" fill="${CUT}" stroke-width="${t}"/>`;
    [-K.bay, 0, K.bay].forEach((x) => (o += RC(x - K.panel / 2, W0 + K.back, x + K.panel / 2, YF - K.front, `fill="${CUT}" stroke-width="${t}"`)));
    [-1, 1].forEach((sg) => (o += `<path d="${pl(ring(sg, RR, RR - K.panel))} Z" fill="${CUT}" stroke-width="${t}"/>`));
    // the drawer boxes (upper drawers), their sides cut
    [1, 2].forEach((i) => {
      const x0 = bayX[i] + K.panel / 2 + 6, x1 = bayX[i + 1] - K.panel / 2 - 6, y0 = YF - K.front - K.box.len, y1 = YF - K.front, s_ = K.box.side;
      o += RC(x0, y0, x1, y1, `fill="${VEN2}" stroke-width="${t}"`) + RC(x0 + s_, y0 + s_, x1 - s_, y1 - s_, `fill="#fff" stroke-width="${t}"`);
    });
    // the fronts, the doors' swing, the shelves below
    for (let i = 0; i < K.bays; i++) { const [a, b] = frontX(i); o += RC(a, YF - K.front, b, YF, `fill="${VEN}" stroke-width="${t * 1.2}"`); }
    [-1, 1].forEach((sg) => {
      const hx = sg * (K.bay + K.reveal / 2), fx = sg * (X1 - K.reveal), w = Math.abs(fx - hx);
      o += `<path d="M ${f(fx)} ${f(YF)} A ${f(w)} ${f(w)} 0 0 ${sg > 0 ? 1 : 0} ${f(hx)} ${f(YF + w)}" fill="none" stroke-width="${t * 0.7}" stroke-dasharray="${dash}"/>`;
      o += RC(hx, YF, hx + sg * K.front, YF + w, `fill="none" stroke-width="${t * 0.7}" stroke-dasharray="${dash}"`);
      const ys = YF - K.front - 20, xs = X1 + Math.sqrt((RR - K.panel - 3) ** 2 - (ys - CY) ** 2);
      o += `<line x1="${f(sg * (K.bay + K.panel / 2))}" y1="${f(ys)}" x2="${f(sg * xs)}" y2="${f(ys)}" stroke-width="${t * 0.8}"/>`;
    });
    // the pulls: a bar on posts on each drawer, an upright bar by each door's free edge
    [1, 2].forEach((i) => { const c = (bayX[i] + bayX[i + 1]) / 2, P = K.pull;
      o += RC(c - P.len / 2, YF + P.proj - P.bar, c + P.len / 2, YF + P.proj, `fill="${BRASS}" stroke-width="${t * 0.8}"`);
      [-1, 1].forEach((d) => (o += RC(c + d * P.posts / 2 - 5, YF, c + d * P.posts / 2 + 5, YF + P.proj - P.bar, `fill="${BRASS}" stroke-width="${t * 0.6}"`))); });
    [-1, 1].forEach((sg) => { const x = sg * (X1 - K.reveal - K.pull.edge); o += RC(x - 5, YF, x + 5, YF + K.pull.proj, `fill="${BRASS}" stroke-width="${t * 0.8}"`); });
    // the top, oversailing 10 (dashed)
    o += `<path d="${pl(outline(K.over))} Z" fill="none" stroke-width="${t * 0.9}" stroke-dasharray="${dash}"/>`;
    return o;
  }

  // ════════ FRONT ELEVATION — from the bed ════════
  function elevation(t, dash, zCut = 620) {
    const Z = (z) => -z;
    let o = "";
    const xs = (u, w = G.dep / 2) => place(u, w)[0];
    // the glass above the unit, to a break
    for (let c = 0; c < G.cols; c++) {
      if (c === 7 || c === 8) continue;
      const u0 = -UH + c * G.mod + (G.mod - G.blk) / 2, a = xs(u0), b = xs(u0 + G.blk);
      for (let r = 0; ; r++) {
        const z0 = G.z0 + r * G.mod, z1 = z0 + G.blk;
        if (z0 >= zCut) break;
        if (z1 <= K.h) continue;
        o += RC(a, Z(Math.max(z0, K.h)), b, Z(Math.min(z1, zCut)), `fill="${GLASS}" stroke-width="${t * 0.8}"`);
      }
    }
    o += RC(-K.col / 2, Z(K.h), K.col / 2, Z(zCut), `fill="${WOOD}" stroke-width="${t}"`);
    [[UH, UE], [-UE, -UH]].forEach(([a, b]) => (o += RC(xs(a, G.dep / 2 + G.track), Z(K.h), xs(b, G.dep / 2 + G.track), Z(zCut), `fill="${BRONZE}" stroke-width="${t}"`)));
    // the break line across the top
    { const L = xs(-UE) - 60, Rr = xs(UE) + 60, zz = zCut + 8, n = 6, m = (L + Rr) / 2;
      o += `<path d="M ${f(L)} ${f(Z(zz))} L ${f(m - 60)} ${f(Z(zz))} L ${f(m - 20)} ${f(Z(zz + 45))} L ${f(m + 20)} ${f(Z(zz - 45))} L ${f(m + 60)} ${f(Z(zz))} L ${f(Rr)} ${f(Z(zz))}" fill="none" stroke-width="${t * 0.8}"/>`; }
    // the plinth, set back; the carcase in the reveals and the two round ends
    const xP = Math.max(...outline(-K.inset, W0 + K.back).map((p) => p[0])), xT = Math.max(...outline(K.over).map((p) => p[0]));
    o += RC(-xP, Z(0), xP, Z(K.plinth), `fill="${DARK}" stroke-width="${t}"`);
    o += RC(-X1, Z(K.plinth), X1, Z(zTop), `fill="${VEN2}" stroke-width="${t}"`);
    [-1, 1].forEach((sg) => {
      o += RC(sg * X1, Z(K.plinth), sg * E[0], Z(zTop), `fill="${VEN}" stroke-width="${t}"`);
      [15, 32, 48, 62, 74].forEach((deg) => { const x = sg * (X1 + RR * Math.sin((deg * Math.PI) / 180)); o += `<line x1="${f(x)}" y1="${f(Z(K.plinth))}" x2="${f(x)}" y2="${f(Z(zTop))}" stroke-width="${t * 0.45}" stroke="${VEN2}"/>`; });
    });
    // the fronts
    for (let i = 0; i < K.bays; i++) {
      const [a, b] = frontX(i);
      if (isDoor(i)) {
        o += `<rect x="${f(a)}" y="${f(Z(zD[1] + fh))}" width="${f(b - a)}" height="${f(zD[1] + fh - zD[0])}" rx="${K.ease}" fill="${VEN}" stroke-width="${t * 1.2}"/>`;
        const hx = i === 0 ? b : a, fx = i === 0 ? a : b;              // the hinge side: the lines meet at it
        o += `<path d="M ${f(fx)} ${f(Z(zD[0] + 10))} L ${f(hx)} ${f(Z(zMidD))} L ${f(fx)} ${f(Z(zD[1] + fh - 10))}" fill="none" stroke-width="${t * 0.6}" stroke-dasharray="${dash}"/>`;
        const px = fx + (i === 0 ? 1 : -1) * K.pull.edge;
        o += RC(px - K.pull.bar / 2, Z(zMidD - K.pull.len / 2), px + K.pull.bar / 2, Z(zMidD + K.pull.len / 2), `fill="${BRASS}" stroke-width="${t * 0.8}"`);
      } else {
        zD.forEach((z0) => {
          o += `<rect x="${f(a)}" y="${f(Z(z0 + fh))}" width="${f(b - a)}" height="${f(fh)}" rx="${K.ease}" fill="${VEN}" stroke-width="${t * 1.2}"/>`;
          const c = (a + b) / 2, zm = z0 + fh / 2;
          o += RC(c - K.pull.len / 2, Z(zm - K.pull.bar / 2), c + K.pull.len / 2, Z(zm + K.pull.bar / 2), `fill="${BRASS}" stroke-width="${t * 0.8}"`);
        });
      }
    }
    // the top: a bullnose, oversailing 10 on the front and round the ends
    o += `<rect x="${f(-xT)}" y="${f(Z(K.h))}" width="${f(2 * xT)}" height="${K.top}" rx="${K.top / 2}" fill="${VEN}" stroke-width="${t * 1.2}"/>`;
    o += `<line x1="${f(-xT + 20)}" y1="${f(Z(K.h - K.top / 2))}" x2="${f(xT - 20)}" y2="${f(Z(K.h - K.top / 2))}" stroke-width="${t * 0.35}" stroke="${VEN2}"/>`;
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
    s += chainH([...bayX.map(vp.X)], yb, Array(K.bays).fill(K.bay), { from: vp.Y(YF) + 0.5, size: 1.2 });
    s += chainH([vp.X(-E[0]), vp.X(-X1), vp.X(X1), vp.X(E[0])], yb + 6, [Math.round(E[0] - X1), `${2 * X1} STRAIGHT FRONT`, Math.round(E[0] - X1)], { from: yb, size: 1.25 });
    s += chainV([vp.Y(G.dep / 2), vp.Y(YF)], vp.X(-E[0]) - 5, [`${K.depth + K.gap}`], { from: vp.X(-X1) - 1, size: 1.15 });
    s += text(vp.X(0), yb + 17, `▼  THE FOOT OF THE BED, ${ft(CLEAR)} FROM THE FRONTS — ${ft(CLEAR - K.box.len)} WITH A DRAWER OUT`, { size: 1.5, anchor: "middle", fill: THIN });
    const c1 = (bayX[2] + bayX[3]) / 2;
    s += note(vp.X(-UH + 2.5 * G.mod), vp.Y(-10), vp.X(-1000), 30, "GLASS-BLOCK PARTITION", "AS BUILT IN THE 3D — NOT CHANGED", "end");
    s += note(vp.X(-60), vp.Y(-20), vp.X(-430), 37, "WOOD COLUMN, 1 FT", "", "end");
    s += note(vp.X(-K.tv.w / 2 + 120), vp.Y(G.dep / 2 + K.tv.stand + 10), vp.X(-760), 37, "TV ABOVE (DASHED)", "", "end");
    s += note(vp.X(380), vp.Y(W0 + 5), vp.X(150), 30, "BACK PANEL, VENEERED BOTH FACES", "IT READS THROUGH THE GLASS FROM THE DESK");
    s += note(vp.X(c1 - 120), vp.Y(YF - 200), vp.X(560), 37, "DRAWER BOX ON 350 RUNNERS", "FULL EXTENSION, SOFT CLOSE");
    s += note(vp.X(X1 + RR * Math.cos(0.9) - 8), vp.Y(CY + RR * Math.sin(0.9) - 8), vp.X(980), 30, "ROUND END, FIXED", "DETAIL 1");
    { const w = X1 - K.reveal - K.bay - K.reveal / 2, a = Math.PI * 0.32;
      s += note(vp.X(-(K.bay + K.reveal / 2) - w * Math.cos(a)), vp.Y(YF + w * Math.sin(a)), vp.X(-1180), yb + 22, "DOORS HINGE ON THE DRAWER SIDE", "THEY SWING CLEAR OF THE ROUND ENDS", "start"); }
    s += cutMark(vp.X(c1) - 3, vp.Y(-110), "A", "down");
    s += cutMark(vp.X(c1) - 3, yb + 11, "A", "up");
  }

  // front elevation 1:10, under the plan
  const ve = view(150, 224, sc, "TV unit elevation"), te = ve.w(0.1), de = `${ve.w(1)} ${ve.w(0.7)}`;
  s += heading(18, 139, "FRONT", `SEEN FROM THE BED · SCALE 1:${sc} · THE GLASS BROKEN OFF ABOVE`, 150);
  s += ve.g(elevation(te, de), 0.3);
  { const yb = ve.Y(0) + 4;
    s += chainH([...bayX.map(ve.X)], yb, ["CABINET", "DRAWERS", "DRAWERS", "CABINET"], { from: ve.Y(0) + 0.5, size: 1.15 });
    s += chainV([ve.Y(0), ve.Y(-K.plinth), ve.Y(-zD[1] + K.reveal / 2), ve.Y(-zTop), ve.Y(-K.h)], ve.X(E[0] + 10) + 6,
      [K.plinth, Math.round(zD[1] - K.reveal / 2 - K.plinth), Math.round(zTop - zD[1] + K.reveal / 2), K.top], { from: ve.X(E[0] + 10) + 1, size: 1.1 });
    s += chainV([ve.Y(0), ve.Y(-K.h)], ve.X(E[0] + 10) + 13, [`${K.h} — KEPT LOW`], { from: ve.X(E[0] + 10) + 1, size: 1.2 });
    s += note(ve.X(-700), ve.Y(-K.h + 8), ve.X(-1000), 150, "BULLNOSE TOP, 1 IN", "", "end");
    s += note(ve.X(-X1 + 60), ve.Y(-zMidD - 40), ve.X(-1150), 156, "CABINET — ONE DOOR, TWO DRAWERS TALL", "ONE ADJUSTABLE SHELF", "start");
    s += note(ve.X(-225), ve.Y(-(zD[1] + fh / 2) - 30), ve.X(-300), 150, "DRAWERS, TWO HIGH", "SLIM BRASS BAR, AS BEFORE", "start");
    s += note(ve.X(X1 + 120), ve.Y(-300), ve.X(700), 150, "ROUND END — FIXED", "BENT PLY, VENEERED");
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

  // detail 1 — the round end, plan 1:5
  const scD = 5, dx0 = 780, dy0 = 115, vd = view(287 - dx0 / scD, 163 - dy0 / scD, scD, "TV unit round end"), td = vd.w(0.11), dd = `${vd.w(1)} ${vd.w(0.7)}`;
  s += heading(284, 150, "DETAIL 1 · THE ROUND END", `PLAN · SCALE 1:${scD}`, 92);
  s += `<clipPath id="clipTV1"><rect x="${vd.X(dx0)}" y="${vd.Y(dy0)}" width="${f(470 / scD)}" height="${f(370 / scD)}"/></clipPath>`;
  s += `<g clip-path="url(#clipTV1)">${vd.g(plan(td, dd), 0.3)}</g>`;
  { const tA = 0.55, ex = X1 + RR * Math.cos(tA), ey = CY + RR * Math.sin(tA);
    s += `<g stroke="${DIM}" stroke-width="0.13"><line x1="${vd.X(X1)}" y1="${vd.Y(CY)}" x2="${vd.X(ex)}" y2="${vd.Y(ey)}"/></g>`;
    s += `<circle cx="${vd.X(X1)}" cy="${vd.Y(CY)}" r="0.5" fill="${DIM}"/>`;
    s += text(vd.X((X1 + ex) / 2) + 1.5, vd.Y((CY + ey) / 2) - 0.6, `R ${ft(RR)}`, { size: 1.3, fill: DIM, cls: "dk-in" }) + text(vd.X((X1 + ex) / 2) + 1.5, vd.Y((CY + ey) / 2) - 0.6, `R ${Math.round(RR)}`, { size: 1.3, fill: DIM, cls: "dk-mm" });
    [[E[0] - 10, E[1] + 15, "SCRIBED TO THE CHANNEL", "AT THE PARTITION'S TIP"],
     [X1 + (RR + K.over) * Math.cos(0.45), CY + (RR + K.over) * Math.sin(0.45), "TOP OVERSAILS 10", "DASHED"],
     [X1 + (RR - 9) * Math.cos(0.75), CY + (RR - 9) * Math.sin(0.75), "18 BENT PLY", "3 × 6, VENEERED BOTH FACES"],
     [1010, YF - K.front - 20, "SHELF", "INTO THE ROUND END"],
     [X1 - K.reveal / 2, YF - 8, "3 MM GAP", "THE DOOR SWINGS CLEAR"],
     [850, YF + K.front + 4, "DOOR, FLAT", "UPRIGHT BRASS BAR"]]
      .forEach(([x, y, l1, l2], i) => (s += note(vd.X(x), vd.Y(y), vd.X(1196), 164 + i * 12.5, l1, l2))); }

  // notes, what is assumed, what is open
  s += heading(18, 241, "NOTES", `REVISION ${K.rev.split(" ")[0]}`, 88);
  ["From the owner's sketch. The run of 4 × 2 drawers that followed the",
   "partition's curve could not open at its curved ends. Now the unit is a pill:",
   "a straight front across the middle, a quarter-round at each end wrapping",
   "back to the partition's tip, and nothing that moves is curved.",
   "Four equal bays, 17¾ in: two stacks of two drawers in the middle, and at",
   "each end one cabinet two drawers tall behind a flat door (owner).",
   "Doors hinge on the drawer side, so they open away from the round ends."]
    .forEach((n, i) => (s += text(18, 251.5 + i * 4.2, n, { size: 1.45 })));
  s += heading(112, 241, "ASSUMED", "TELL ME IF ANY OF THESE IS WRONG", 88);
  ["Height 1 ft 5¾ in and depth 1 ft 3¾ in, as the last run.",
   "The same veneer as before: the 9292 burl in the Dark Diva",
   "   colour, the grain running on across all four bays.",
   "The slim brass bar kept; an upright one on each door.",
   "Every edge eased 5 mm; the top a full bullnose.",
   "Concealed soft-close hinges; one shelf in each cabinet."]
    .forEach((n, i) => (s += text(112, 251.5 + i * 4.2, n, { size: 1.45 })));
  s += heading(206, 241, "TO DECIDE", "", 80);
  ["Fronts: eased edges as drawn, or rounder —",
   "   each front a small pill of its own?",
   "Pulls: the brass bar, or push-to-open with none.",
   `With a drawer out, ${ft(CLEAR - K.box.len)} is left to the bed's`,
   "   foot — fine to pass, tight to kneel at."]
    .forEach((n, i) => (s += text(206, 251.5 + i * 4.2, n, { size: 1.45 })));

  s += titleBlock({ title: "TV UNIT — DRAWERS", sub: "Plan · Front · Section A–A · Round end", date: K.date, rev: K.rev, dwg: "AST-DR-036", scale: "AS NOTED @ A3" });
  window.DRAWINGS.tvunit = { title: "TV unit · AST-DR-036", svg: sheet(s), model: true };
  // handed to the overview plan and the 3D room, so they cannot disagree with the sheet
  window.TVGEOM = { W0, YF, X1, RR, CY, TE, E, UE, bayX, outline, place, K };
})();
