// Bathroom vanity — AST-DR-019 (the normal version), -020 (scheme B), -021 (scheme C).
//
// The vanity is 5 ft by 2 ft at 33 in, and its faucet was plumbed 6 in right of centre, for a marble
// shelf on the left that is no longer wanted. The bowl has to sit under the faucet. The schemes differ
// only in how much of the top is marble, and so where the marble's centre falls:
//   normal — marble the full 5 ft; the bowl sits 6 in right of the vanity's centre.
//   B      — a 1 ft veneer cupboard on the left; 4 ft of marble, centred on the faucet.
//   C      — 1 ft 6 on the left, 6 in on the right; 3 ft of marble, centred on the faucet.
// Taking width off the left moves the marble's centre by half of it, so B and C both land dead on.
// Real-world units are mm; x runs from the vanity's LEFT end, h up from the floor, d out from the wall.

window.DRAWINGS = window.DRAWINGS || {};

const VANITY = {
  date: "23.09.2026",
  L: 1524, D: 610, AX: 914,            // 5 ft × 2 ft; the faucet 3 ft from the left end, as plumbed
  clear: 152,                          // 6 in clear under the carcass
  top: 800, counter: 838,              // carcass top; top of the marble (33 in)
  over: 25,                            // the marble oversails the front 1 in
  slab: 18, sub: 20,                   // marble slab on a ply sub-top; a mitred 38 apron hides both
  stile: 38, rail: 38, midRail: 25, muntin: 25,
  top2: [610, 762], big: [190, 584],   // drawer openings, floor to top
  bowl: { d: 406, h: 127, c: 254 },    // vessel bowl Ø16 in × 5 in, its centre 10 in off the wall — ASSUMED
  spout: { h: 1045, reach: 229 },      // wall spout — ASSUMED from the sketch
  setback: 76,                         // the support stands 3 in back from the front
  trap: 457,                           // wall waste outlet, 18 in
};

function buildVanity(V) {
  const { INK, THIN, DIM, f, text, mmToFt, view, chainH, chainV, bubble, heading, cutMark, frame, titleBlock, sheet } = window.DK;
  const K = VANITY, L = K.L, D = K.D, AX = K.AX;
  const ft = (mm) => mmToFt(mm).replace("'-", " ft ").replace('"', " in").replace(/^0 ft /, "").replace(/ 0 in$/, "");
  const bank = V.bank, mid = (bank[0] + bank[1]) / 2;
  const SP = Math.abs(mid - AX) < 3 ? AX : mid;                        // the drawers split on the bank's centre
  const open = [bank[0] + K.stile, bank[1] - K.stile];
  const MARBLE = "#efede7", VEN = "#f3ead8", id = V.key.replace(/\W/g, "");

  const TOPH = 1130, E = (h) => TOPH - h;                                  // elevation and section: y down from 1130
  const LN = (a, b, c, d, w, x = "") => `<line x1="${f(a)}" y1="${f(b)}" x2="${f(c)}" y2="${f(d)}" stroke-width="${f(w)}" ${x}/>`;
  const RC = (a, b, c, d, w, fl = "none", x = "") => `<rect x="${f(Math.min(a, c))}" y="${f(Math.min(b, d))}" width="${f(Math.abs(c - a))}" height="${f(Math.abs(d - b))}" fill="${fl}" stroke-width="${f(w)}" ${x}/>`;
  const RE = (x0, h0, x1, h1, w, fl, x) => RC(x0, E(h1), x1, E(h0), w, fl, x);   // a rect by heights
  const PT = (d, w, fl = "none", x = "") => `<path d="${d}" fill="${fl}" stroke-width="${f(w)}" ${x}/>`;
  const dash = (t) => `stroke-dasharray="${f(t * 6)} ${f(t * 4)}"`;
  const cen = (t) => `stroke-dasharray="${f(t * 16)} ${f(t * 4)} ${f(t * 3)} ${f(t * 4)}"`;

  // ── the fronts: every door and drawer, numbered, so the schedule can carry their sizes ──
  const FRONTS = [];
  const gap = 3;
  (V.doors || []).forEach(([a, b, st]) => FRONTS.push({ kind: "door", x0: a + (st || K.stile), x1: b - (st || K.stile), h0: K.clear + K.rail, h1: K.top - K.rail }));
  FRONTS.push({ kind: "top", x0: open[0], x1: SP - K.muntin / 2, h0: K.top2[0], h1: K.top2[1] });
  FRONTS.push({ kind: "top", x0: SP + K.muntin / 2, x1: open[1], h0: K.top2[0], h1: K.top2[1] });
  FRONTS.push({ kind: "big", x0: open[0], x1: open[1], h0: K.big[0], h1: K.big[1] });
  FRONTS.forEach((F) => { F.w = F.x1 - F.x0 - 2 * gap; F.h = F.h1 - F.h0 - 2 * gap; });

  // cup pull, centred on (x, h)
  const pull = (x, h, t) => PT(`M ${f(x - 45)} ${f(E(h))} Q ${f(x)} ${f(E(h - 30))} ${f(x + 45)} ${f(E(h))}`, t * 1.4);
  // the vessel bowl in profile, sitting on the counter
  const bowl = (xc, t, toX) => {
    const r = K.bowl.d / 2, b = K.counter, h = K.bowl.h, X = toX;
    return PT(`M ${f(X(xc - r))} ${f(E(b + h))} L ${f(X(xc + r))} ${f(E(b + h))} C ${f(X(xc + r))} ${f(E(b + h * 0.35))} ${f(X(xc + r * 0.55))} ${f(E(b))} ${f(X(xc + r * 0.3))} ${f(E(b))} L ${f(X(xc - r * 0.3))} ${f(E(b))} C ${f(X(xc - r * 0.55))} ${f(E(b))} ${f(X(xc - r))} ${f(E(b + h * 0.35))} ${f(X(xc - r))} ${f(E(b + h))} Z`, t * 1.2, "#fff")
      + LN(X(xc - r + 12), E(b + h - 12), X(xc + r - 12), E(b + h - 12), t * 0.5);
  };

  // ═════════════ FRONT ELEVATION ═════════════
  function front(t) {
    let o = "";
    if (V.support) o += RE(V.support[0], 0, V.support[1], K.clear, t, "#fff", dash(t));
    o += RE(0, K.clear, L, K.top, t * 1.3, VEN);                                           // the carcass
    o += RE(V.marble[0], K.top, V.marble[1], K.counter, t * 1.3, MARBLE);                  // the marble, over the bank
    FRONTS.forEach((F) => {
      o += RE(F.x0 + gap, F.h0 + gap, F.x1 - gap, F.h1 - gap, t * 1.1, VEN);
      if (F.kind === "door") o += pull(F.x1 > SP ? F.x0 + 70 : F.x1 - 70, F.h1 - 70, t);
      else o += pull((F.x0 + F.x1) / 2, F.kind === "big" ? F.h1 - 80 : (F.h0 + F.h1) / 2 + 20, t);
    });
    o += bowl(AX, t, (x) => x);
    o += RE(AX - 30, K.spout.h - 15, AX + 30, K.spout.h + 45, t, "#fff") + RE(AX - 11, K.spout.h - 40, AX + 11, K.spout.h - 15, t, "#fff");
    o += LN(-150, E(0), L + 150, E(0), t * 3.5);                                           // floor
    o += LN(AX, E(K.spout.h + 90), AX, E(K.counter - 20), t * 0.6, `stroke="${DIM}" ${cen(t)}`);
    if (SP !== AX) o += LN(SP, E(K.spout.h + 90), SP, E(K.counter - 20), t * 0.6, `stroke="${THIN}" ${cen(t)}`);
    return o;
  }

  // ═════════════ PLAN ═════════════
  function plan(t) {
    let o = RC(-150, -40, L + 150, 0, 0, `url(#hatchV${id})`, 'stroke="none"') + LN(-150, 0, L + 150, 0, t * 1.6);
    o += RC(0, 0, L, D, t * 1.2, VEN);
    o += RC(V.marble[0], 0, V.marble[1], D + K.over, t * 1.3, MARBLE);
    if (V.support) o += RC(V.support[0], 0, V.support[1], D - K.setback, t * 0.8, "none", dash(t));
    const r = K.bowl.d / 2;
    o += `<circle cx="${AX}" cy="${K.bowl.c}" r="${r}" fill="#fff" stroke-width="${f(t * 1.2)}"/><circle cx="${AX}" cy="${K.bowl.c}" r="${r - 12}" stroke-width="${f(t * 0.5)}"/>`;
    o += `<circle cx="${AX}" cy="${K.bowl.c}" r="22" stroke-width="${f(t * 0.8)}"/>`;
    o += RC(AX - 11, 0, AX + 11, K.spout.reach, t, "#fff");
    o += LN(AX, -90, AX, D + K.over + 90, t * 0.6, `stroke="${DIM}" ${cen(t)}`);
    if (SP !== AX) o += LN(SP, -90, SP, D + K.over + 90, t * 0.6, `stroke="${THIN}" ${cen(t)}`);
    return o;
  }

  // ═════════════ SECTION A–A, on the faucet axis ═════════════
  function section(t) {
    const P = (d) => d;                                                    // depth from the wall is x here
    let o = RC(-60, E(K.spout.h + 120), 0, E(0), 0, `url(#hatchV${id})`, 'stroke="none"') + LN(0, E(K.spout.h + 120), 0, E(0), t * 1.6);
    o += LN(-60, E(0), D + 60, E(0), t * 3.5);
    // hanging rail, back, top, bottom, face
    o += RE(0, 700, 18, 760, t, VEN);
    o += RE(18, K.clear + 18, 30, K.top - 18, t * 0.8, VEN);
    o += RE(0, K.top - 18, D, K.top, t, VEN) + RE(0, K.clear, D, K.clear + 18, t, VEN);
    // sub-top, slab, and the mitred apron that hides both edges
    o += RE(0, K.top, D + K.over - K.slab, K.top + K.sub, t * 0.8, VEN);
    o += PT(`M 0 ${f(E(K.counter))} L ${f(D + K.over)} ${f(E(K.counter))} L ${f(D + K.over)} ${f(E(K.top))} L ${f(D + K.over - K.slab)} ${f(E(K.top))} L ${f(D + K.over - K.slab)} ${f(E(K.counter - K.slab))} L 0 ${f(E(K.counter - K.slab))} Z`, t * 1.2, MARBLE);
    o += LN(D + K.over - K.slab, E(K.counter - K.slab), D + K.over, E(K.counter), t * 0.6);
    // face frame: top rail, mid rail, bottom rail
    [[K.top - K.rail, K.top - 18], [K.big[1], K.top2[0]], [K.clear + 18, K.big[0]]].forEach(([a, b]) => (o += RE(D - 18, a, D, b, t, VEN)));
    // top drawer: cut if the pipe goes through it, seen beyond if the pipe drops beside it
    const box = (h0, h1, cut) => {
      let g = RE(D - 18, h0 + gap, D, h1 - gap, t, VEN);                                  // the front
      const b0 = h0 + 20, b1 = h1 - 22;
      if (cut) g += RE(330, b0, D - 18, b0 + 12, t * 0.8, VEN) + RE(330, b0, 345, b1, t * 0.8, VEN)
        + RE(92, b0, 330, b1, t * 0.6, "none", dash(t));
      else g += RE(92, b0, D - 18, b1, t * 0.6, "none", dash(t));
      return g;
    };
    o += box(K.top2[0], K.top2[1], SP !== AX);
    o += box(K.big[0], K.big[1], true);
    // waste and trap, back to the wall
    const c = K.bowl.c, wr = 20;
    o += PT(`M ${c - wr} ${f(E(K.counter))} L ${c - wr} ${f(E(430))} A 70 70 0 0 0 ${c - 140 + wr} ${f(E(430))} L ${c - 140 + wr} ${f(E(K.trap - wr))} L 0 ${f(E(K.trap - wr))}`
      + ` M ${c + wr} ${f(E(K.counter))} L ${c + wr} ${f(E(430))} A 110 110 0 0 1 ${c - 140 - wr} ${f(E(430))} L ${c - 140 - wr} ${f(E(K.trap + wr))} L 0 ${f(E(K.trap + wr))}`, t * 0.9, "none", `stroke="${THIN}"`);
    // bowl, spout, support
    o += bowl(c, t, (x) => x);
    o += PT(`M 0 ${f(E(K.spout.h + 30))} L ${K.spout.reach - 25} ${f(E(K.spout.h + 30))} Q ${K.spout.reach} ${f(E(K.spout.h + 30))} ${K.spout.reach} ${f(E(K.spout.h))} L ${K.spout.reach} ${f(E(K.spout.h - 25))} L ${K.spout.reach - 22} ${f(E(K.spout.h - 25))} L ${K.spout.reach - 22} ${f(E(K.spout.h + 8))} L 0 ${f(E(K.spout.h + 8))} Z`, t, "#fff");
    if (V.support) o += RE(0, 0, D - K.setback, K.clear, t, "#fff", dash(t));
    return o;
  }

  // ═════════════ DETAIL 1 — the marble edge, 1:2 ═════════════
  function edge(t) {
    const x0 = D - 70, x1 = D + K.over;
    let o = RE(x0, K.top - 18, D, K.top, t, VEN);                                          // carcass top
    o += RE(D - 18, K.top - K.rail, D, K.top - 18, t, VEN);                               // top rail
    o += RE(D - 18, K.top - 55, D, K.top - K.rail - gap, t, VEN, dash(t));               // drawer front, below
    o += RE(x0, K.top, x1 - K.slab, K.top + K.sub, t * 0.8, VEN);                         // ply sub-top
    o += PT(`M ${x0} ${f(E(K.counter))} L ${x1} ${f(E(K.counter))} L ${x1} ${f(E(K.top))} L ${x1 - K.slab} ${f(E(K.top))} L ${x1 - K.slab} ${f(E(K.counter - K.slab))} L ${x0} ${f(E(K.counter - K.slab))}`, t * 1.2, MARBLE);
    o += LN(x1 - K.slab, E(K.counter - K.slab), x1, E(K.counter), t * 0.7);              // the mitre
    o += LN(x0, E(K.counter + 6), x0, E(K.top - 60), t * 0.5, dash(t));                  // break line
    return o;
  }

  // ═════════════ DETAIL 2 — the big drawer in plan, notched round the trap ═════════════
  function udrawer(t) {
    const x0 = open[0] + 13, x1 = open[1] - 13, d0 = 92, d1 = D - 18, n0 = AX - 100, n1 = AX + 100, nd = 330;
    let o = PT(`M ${x0} ${d0} L ${n0} ${d0} L ${n0} ${nd} L ${n1} ${nd} L ${n1} ${d0} L ${x1} ${d0} L ${x1} ${d1} L ${x0} ${d1} Z`, t * 1.2, VEN);
    o += PT(`M ${x0 + 15} ${d0 + 15} L ${n0 - 15} ${d0 + 15} L ${n0 - 15} ${nd + 15} L ${n1 + 15} ${nd + 15} L ${n1 + 15} ${d0 + 15} L ${x1 - 15} ${d0 + 15} L ${x1 - 15} ${d1 - 15} L ${x0 + 15} ${d1 - 15} Z`, t * 0.5);
    o += RC(open[0] - gap, d1, open[1] + gap, D, t, VEN);                                   // the front
    o += `<circle cx="${AX}" cy="${K.bowl.c}" r="20" fill="#fff" stroke-width="${f(t)}"/>`;
    o += PT(`M ${AX} ${K.bowl.c} L ${AX} ${K.bowl.c - 140} L ${AX} 0`, t * 2.6, "none", `stroke="${THIN}"`);
    o += LN(open[0] - 60, 0, open[1] + 60, 0, t * 1.6);
    o += LN(AX, -40, AX, D + 40, t * 0.6, `stroke="${DIM}" ${cen(t)}`);
    return o;
  }

  // ═════════════ SHEET ═════════════
  window.DK.begin(V.key);
  let s = frame();
  s += `<defs><pattern id="hatchV${id}" patternUnits="userSpaceOnUse" width="40" height="40" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="40" stroke="#9a9a9a" stroke-width="5"/></pattern></defs>`;

  // FRONT 1:10
  const sc = 10, oyE = 30;
  s += heading(18, 17, "FRONT", `1:${sc} · ${V.headline}`, 170);
  const v = view(34, oyE, sc, "Vanity front"), t = v.w(0.12);
  s += v.g(front(t), 0.3);
  const yF = v.Y(E(0));
  s += chainH(V.stations.map(v.X), yF + 5.5, V.spans, { from: yF + 1, size: 1.25 });
  s += chainH([bank[0], open[0], SP - K.muntin / 2, SP + K.muntin / 2, open[1], bank[1]].map(v.X), yF + 11.5, [K.stile, SP - K.muntin / 2 - open[0], K.muntin, open[1] - SP - K.muntin / 2, K.stile], { from: yF + 1, size: 1.15 });
  s += chainH([v.X(0), v.X(L)], yF + 17.5, [`${L} OVERALL`], { from: yF + 1, size: 1.35 });
  const hs = [0, K.clear, K.big[0], K.big[1], K.top2[0], K.top2[1], K.top, K.counter];
  s += chainV(hs.map((h) => v.Y(E(h))), v.X(L) + 6, hs.slice(1).map((h, i) => h - hs[i]), { from: v.X(L) + 1, size: 1.15 });
  s += chainV([v.Y(E(0)), v.Y(E(K.counter)), v.Y(E(K.counter + K.bowl.h))], v.X(L) + 14, [`${K.counter} COUNTER`, K.bowl.h], { from: v.X(L) + 1, size: 1.3 });
  FRONTS.forEach((F, i) => (s += bubble(v.X((F.x0 + F.x1) / 2), v.Y(E((F.h0 + F.h1) / 2 - (F.kind === "top" ? 38 : F.kind === "big" ? 40 : 0))), i + 1)));
  s += text(v.X(AX) + 1.2, v.Y(E(K.spout.h + 90)) + 1.5, "FAUCET AXIS", { size: 1.35, fill: DIM });
  if (SP !== AX) s += text(v.X(SP) - 1.2, v.Y(E(K.spout.h + 90)) + 1.5, "VANITY CENTRE", { size: 1.35, fill: THIN, anchor: "end" });

  // SECTION A–A 1:10
  s += heading(214, 17, "SECTION A–A", "ON THE FAUCET AXIS · 1:10", 76);
  const vs = view(228, oyE, sc, "Vanity section"), ts = vs.w(0.12);
  s += vs.g(section(ts), 0.3);
  s += chainH([vs.X(0), vs.X(D - K.setback), vs.X(D), vs.X(D + K.over)], yF + 5.5, V.support ? [D - K.setback, K.setback, K.over] : ["", "", K.over], { from: yF + 1, size: 1.2 });
  s += chainH([vs.X(0), vs.X(D)], yF + 11.5, [`${D} DEEP`], { from: yF + 1, size: 1.3 });
  s += chainV([vs.Y(E(0)), vs.Y(E(K.trap)), vs.Y(E(700)), vs.Y(E(760))], vs.X(0) - 9, [K.trap, "", 60], { from: vs.X(0) - 7, size: 1.15 });
  [[1, 9, 730], [2, 470, (K.big[0] + K.big[1]) / 2], [3, 150, 520], [4, 260, 95], [5, 150, K.spout.h + 70], [6, 400, K.top + 10]].forEach(([n, d, h]) => {
    if (n === 4 && !V.support) return;
    s += bubble(vs.X(d), vs.Y(E(h)), String.fromCharCode(64 + n));
  });

  // PLAN 1:10
  s += heading(18, 170, "PLAN", `1:${sc} · FROM ABOVE · WALL AT THE TOP`, 170);
  const vp = view(34, 184, sc, "Vanity plan"), tp = vp.w(0.12);
  s += vp.g(plan(tp), 0.3);
  s += cutMark(vp.X(AX) - 3, vp.Y(-55), "A", "up") + cutMark(vp.X(AX) - 3, vp.Y(D + K.over + 45), "A", "down");
  s += chainV([vp.Y(0), vp.Y(D), vp.Y(D + K.over)], vp.X(0) - 5, [D, K.over], { from: vp.X(0) - 1, size: 1.2 });
  if (SP !== AX) s += chainH([vp.X(SP), vp.X(AX)], vp.Y(570), [`${AX - SP} OFF CENTRE`], { from: vp.Y(560), size: 1.25 });
  else s += chainH([vp.X(V.marble[0]), vp.X(AX), vp.X(V.marble[1])], vp.Y(570), [AX - V.marble[0], V.marble[1] - AX], { from: vp.Y(560), size: 1.25 });

  // DETAIL 2 — U drawer, 1:15
  s += heading(214, 170, "DETAIL 2 · THE BIG DRAWER", "PLAN · 1:15 · NOTCHED ROUND THE TRAP", 76);
  const vu = view(214 + (76 - (open[1] - open[0] + 120) / 15) / 2 - (open[0] - 60) / 15, 190, 15, "Vanity drawer"), tu = vu.w(0.12);
  s += vu.g(udrawer(tu), 0.3);
  s += chainH([vu.X(AX - 100), vu.X(AX + 100)], vu.Y(0) - 2.5, [200], { from: vu.Y(0) - 0.5, size: 1.1 });
  s += chainV([vu.Y(92), vu.Y(330)], vu.X(open[1] + 13) + 4, [238], { from: vu.X(open[1] - 13) + 1, size: 1.1 });

  // ── the right-hand column: detail 1, fronts, materials, open ──
  const RX = 302;
  s += heading(RX, 17, "DETAIL 1 · THE MARBLE EDGE", "SECTION · 1:2", 108);
  const ve = view(RX + 4 - (D - 70) / 2, 30 - E(K.counter + 10) / 2, 2, "Vanity edge"), te = ve.w(0.12);
  s += ve.g(edge(te), 0.3);
  s += chainV([ve.Y(E(K.top)), ve.Y(E(K.top + K.sub)), ve.Y(E(K.counter))], ve.X(D + K.over) + 5, [K.sub, K.slab], { from: ve.X(D + K.over) + 1, size: 1.15 });
  s += chainV([ve.Y(E(K.top)), ve.Y(E(K.counter))], ve.X(D + K.over) + 11, [K.counter - K.top], { from: ve.X(D + K.over) + 1, size: 1.2 });
  s += chainH([ve.X(D), ve.X(D + K.over)], ve.Y(E(K.top)) + 5, [K.over], { from: ve.Y(E(K.top)) + 1, size: 1.15 });
  [["MARBLE SLAB 18", ve.X(D - 40), ve.Y(E(K.counter - 9))], ["BWP PLY SUB-TOP 20", ve.X(D - 40), ve.Y(E(K.top + 10))], ["MITRED APRON, 18 × 38", ve.X(D + K.over - 9), ve.Y(E(K.top + 12))],
   ["CARCASS TOP 18", ve.X(D - 40), ve.Y(E(K.top - 9))], ["TOP RAIL", ve.X(D - 9), ve.Y(E(K.top - 28))]].forEach(([l, x, y], i) => {
    const ty = 36 + i * 5;
    s += `<path d="M ${f(x)} ${f(y)} L ${RX + 66} ${f(ty - 0.6)} L ${RX + 69} ${f(ty - 0.6)}" fill="none" stroke="${INK}" stroke-width="0.12"/><circle cx="${f(x)}" cy="${f(y)}" r="0.4" fill="${INK}"/>`;
    s += text(RX + 70, ty, l, { size: 1.45 });
  });

  s += heading(RX, 90, "FRONTS", "SIZES ARE THE FRONT ITSELF · 3 MM GAP ALL ROUND", 108);
  s += text(RX, 102, "No.", { size: 1.4, fill: THIN }) + text(RX + 8, 102, "WHAT", { size: 1.4, fill: THIN }) + text(RX + 60, 102, "W × H", { size: 1.4, fill: THIN }) + text(RX + 108, 102, "FT-IN", { size: 1.4, fill: THIN, anchor: "end" });
  FRONTS.forEach((F, i) => {
    const y = 106.5 + i * 4.1, what = F.kind === "door" ? "Door, cup pull" : F.kind === "top" ? "Top drawer" : "Big drawer, U-box";
    s += text(RX, y, String(i + 1), { size: 1.55, weight: 700 }) + text(RX + 8, y, what, { size: 1.55 });
    s += text(RX + 60, y, `${Math.round(F.w)} × ${Math.round(F.h)}`, { size: 1.55 });
    s += text(RX + 108, y, `${mmToFt(F.w)} × ${mmToFt(F.h)}`, { size: 1.45, fill: THIN, anchor: "end" });
  });

  const my = 110 + FRONTS.length * 4.1 + 6;
  s += heading(RX, my, "MATERIALS", "THE ROOM'S PALETTE — NOTHING NEW", 108);
  [["Top", "Beige-gold marble, the bathroom stone. 18 slab"],
   ["", "on a 20 BWP sub-top, mitred 38 apron, polished."],
   ["Carcass", "18 BWP / marine ply, teak veneer both faces."],
   ["", "Every edge sealed — it stands in a wet room."],
   ["Fronts", "18 BWP, teak veneer, 6 solid teak lipping."],
   ...(V.ledges ? [["Ledge", `The ${V.ledges} veneer top: solid teak nosing,`], ["", "sealed like a worktop. Marble stops at the bank."]] : []),
   ["Runners", "Full-extension soft-close, undermount."],
   ["Fittings", "Chrome — already bought. Cup pulls to match."],
   ["Hanging", "18 ply cleat on the wall, 700–760 high."]]
    .forEach(([a, b], i) => (s += text(RX, my + 11 + i * 3.9, a, { size: 1.5, weight: 700 }) + text(RX + 15, my + 11 + i * 3.9, b, { size: 1.5 })));

  // key to the section, and notes, along the foot
  s += heading(18, 262, "SECTION KEY", "", 70);
  [["A", "Hanging cleat"], ["B", "Big drawer, U-box"], ["C", "Waste Ø40 and P-trap"], ["D", "Support, set back 76"], ["E", "Wall spout"], ["F", "Ply sub-top"]]
    .filter(([k]) => V.support || k !== "D")
    .forEach(([k, l], i) => (s += bubble(20 + (i % 3) * 24, 270 + Math.floor(i / 3) * 6, k) + text(23.5 + (i % 3) * 24, 270.7 + Math.floor(i / 3) * 6, l, { size: 1.4 })));

  s += heading(96, 262, "NOTES", `REVISION ${V.rev.split(" ")[0]}`, 190);
  V.notes.forEach((n, i) => (s += text(96 + (i >= 4 ? 96 : 0), 270 + (i % 4) * 4.2, n, { size: 1.45, fill: n.startsWith("OPEN") ? "#b3261e" : INK })));

  s += titleBlock({ title: V.title, sub: V.sub, date: K.date, rev: V.rev, dwg: V.dwg, scale: "AS NOTED @ A3" });
  window.DRAWINGS[V.key] = { title: `${V.name} · ${V.dwg}`, svg: sheet(s), model: true };
}

const VANITY_OPEN = [
  "OPEN — bowl Ø406 × 127 and the spout are assumed.",
  "   With the bowl on a 838 counter its rim is at 965 (38 in).",
];
buildVanity({
  key: "vanity", dwg: "AST-DR-019", name: "Vanity — normal", rev: "1 — as sketched",
  title: "VANITY — NORMAL", sub: "Marble full length · Door · Drawers · Door",
  headline: "MARBLE THE FULL 5 FT · THE BOWL SITS UNDER THE FAUCET, 6 IN RIGHT OF CENTRE",
  bank: [381, 1143], marble: [0, 1524], support: [457, 1067],
  doors: [[0, 381], [1143, 1524]],
  stations: [0, 381, 1143, 1524], spans: [381, 762, 381],
  notes: [
    "Symmetric about the vanity's centre — except the bowl,",
    "which has to sit under the faucet, 152 right of it.",
    "The waste drops through the right-hand TOP drawer as",
    "well as the big one: both are U-boxes (see section).",
    ...VANITY_OPEN,
    "OPEN — the support's design: reference photos to come.",
  ],
});
buildVanity({
  key: "vanity-b", dwg: "AST-DR-020", name: "Vanity — scheme B", rev: "1 — as sketched",
  title: "VANITY — SCHEME B", sub: "1 ft cupboard left · 4 ft marble on the faucet",
  headline: "A 1 FT VENEER CUPBOARD LEFT · 4 FT OF MARBLE CENTRED ON THE FAUCET",
  bank: [304, 1524], marble: [304, 1524], support: [406, 1422], ledges: "1 ft",
  doors: [[0, 304]],
  stations: [0, 304, 1524], spans: [304, "1220 MARBLE"],
  notes: [
    "Taking 1 ft off the left moves the marble's centre 6 in",
    "right — onto the faucet. Bowl, drawer split and support",
    "all sit on that one line. The top drawers split on it,",
    "so the waste drops between them: only the big one is a U.",
    ...VANITY_OPEN,
    "OPEN — the support's design: reference photos to come.",
  ],
});
buildVanity({
  key: "vanity-c", dwg: "AST-DR-021", name: "Vanity — scheme C", rev: "1 — as sketched",
  title: "VANITY — SCHEME C", sub: "1 ft 6 left · 6 in right · 3 ft marble on the faucet",
  headline: "1 FT 6 LEFT, 6 IN RIGHT · 3 FT OF MARBLE CENTRED ON THE FAUCET",
  bank: [457, 1371], marble: [457, 1371], support: [559, 1269], ledges: "two",
  doors: [[0, 457], [1371, 1524, 19]],
  stations: [0, 457, 1371, 1524], spans: [457, "914 MARBLE", 153],
  notes: [
    "The two ends differ by exactly 1 ft, so the marble's",
    "centre lands on the faucet. The top drawers split on it.",
    "The 6 in end takes a 108 door on 19 stiles: about 110",
    "clear inside — a hair dryer on its side, not much more.",
    ...VANITY_OPEN,
    "OPEN — the support's design: reference photos to come.",
  ],
});
