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
  // the drawer within the big drawer: its own front 22 behind the big one, riding at the top,
  // notched round the trap like the big box so the pipe clears whichever drawer is shut
  inner: { h0: 460, h1: 555, bot: 470, side: 545, back: 115, notch: 125, notchD: 355 },
  bigSide: 430,                        // the big drawer's sides stop here, so the inner one rides clear above
  pullOut: { outer: 450, inner: 410 }, // the inner one comes out behind the big front, never through it
};

// The inner drawer's outline in plan — a U, or an L where the pipe leaves one arm too thin to keep.
function innerOutline(open, AX) {
  const K = VANITY, I = K.inner, x0 = open[0] + 13 + 28, x1 = open[1] - 13 - 28, d0 = I.back, d1 = K.D - 58;
  const n0 = AX - I.notch, n1 = AX + I.notch, nd = I.notchD;
  if (x1 - n1 < 80) return { x0, x1, d0, d1, arm: "right", path: `M ${x0} ${d0} L ${n0} ${d0} L ${n0} ${nd} L ${x1} ${nd} L ${x1} ${d1} L ${x0} ${d1} Z` };
  if (n0 - x0 < 80) return { x0, x1, d0, d1, arm: "left", path: `M ${x0} ${nd} L ${n1} ${nd} L ${n1} ${d0} L ${x1} ${d0} L ${x1} ${d1} L ${x0} ${d1} Z` };
  return { x0, x1, d0, d1, arm: "", path: `M ${x0} ${d0} L ${n0} ${d0} L ${n0} ${nd} L ${n1} ${nd} L ${n1} ${d0} L ${x1} ${d0} L ${x1} ${d1} L ${x0} ${d1} Z` };
}

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
      if (F.kind === "door") o += pull(F.x1 > SP ? F.x0 + 70 : F.x1 - 70, F.h1 - 70, t);   // drawers have no handles: push-to-open
    });
    o += RE(open[0] + 13 + 18, K.inner.h0, open[1] - 13 - 18, K.inner.h1, t * 0.7, "none", dash(t));   // the inner drawer, behind
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
    const box = (h0, h1, cut, low) => {
      let g = RE(D - 18, h0 + gap, D, h1 - gap, t, VEN);                                  // the front
      const b0 = h0 + 20, b1 = low || h1 - 22;
      if (cut) g += RE(330, b0, D - 18, b0 + 12, t * 0.8, VEN) + RE(330, b0, 345, b1, t * 0.8, VEN)
        + RE(92, b0, 330, b1, t * 0.6, "none", dash(t));
      else g += RE(92, b0, D - 18, b1, t * 0.6, "none", dash(t));
      return g;
    };
    o += box(K.top2[0], K.top2[1], SP !== AX);
    o += box(K.big[0], K.big[1], true, K.bigSide);
    { const I = K.inner;
      o += RE(D - 58, I.h0, D - 40, I.h1, t, VEN);                                          // its front
      o += RE(I.notchD, I.bot, D - 58, I.bot + 12, t * 0.8, VEN) + RE(I.notchD, I.bot, I.notchD + 12, I.side, t * 0.8, VEN);
      o += RE(I.back, I.bot, I.notchD, I.side, t * 0.6, "none", dash(t)); }
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
    { const io = innerOutline(open, AX);
      o += PT(io.path, t * 0.9, "none", `stroke="${DIM}" ${dash(t)}`) + RC(x0 + 18, D - 58, x1 - 18, D - 40, t * 0.9, "none", `stroke="${DIM}"`); }
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
  FRONTS.forEach((F, i) => (s += bubble(v.X((F.x0 + F.x1) / 2), v.Y(E((F.h0 + F.h1) / 2)), i + 1)));
  s += text(v.X(AX) + 1.2, v.Y(E(K.spout.h + 90)) + 1.5, "FAUCET AXIS", { size: 1.35, fill: DIM });
  if (SP !== AX) s += text(v.X(SP) - 1.2, v.Y(E(K.spout.h + 90)) + 1.5, "VANITY CENTRE", { size: 1.35, fill: THIN, anchor: "end" });

  // SECTION A–A 1:10
  s += heading(214, 17, "SECTION A–A", "ON THE FAUCET AXIS · 1:10", 76);
  const vs = view(228, oyE, sc, "Vanity section"), ts = vs.w(0.12);
  s += vs.g(section(ts), 0.3);
  s += chainH([vs.X(0), vs.X(D - K.setback), vs.X(D), vs.X(D + K.over)], yF + 5.5, V.support ? [D - K.setback, K.setback, K.over] : ["", "", K.over], { from: yF + 1, size: 1.2 });
  s += chainH([vs.X(0), vs.X(D)], yF + 11.5, [`${D} DEEP`], { from: yF + 1, size: 1.3 });
  s += chainV([vs.Y(E(0)), vs.Y(E(K.trap)), vs.Y(E(700)), vs.Y(E(760))], vs.X(0) - 9, [K.trap, "", 60], { from: vs.X(0) - 7, size: 1.15 });
  [[1, 9, 730], [2, 470, 330], [3, 150, 520], [4, 260, 95], [5, 150, K.spout.h + 70], [6, 400, K.top + 10], [7, 470, 508]].forEach(([n, d, h]) => {
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
  s += heading(214, 170, "DETAIL 2 · THE BIG DRAWER", "PLAN · 1:15 · INNER DRAWER DASHED", 76);
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
    const y = 106.5 + i * 4.1, what = F.kind === "door" ? "Door, cup pull" : F.kind === "top" ? "Top drawer, push-open" : "Big drawer, U-box, push-open";
    s += text(RX, y, String(i + 1), { size: 1.55, weight: 700 }) + text(RX + 8, y, what, { size: 1.55 });
    s += text(RX + 60, y, `${Math.round(F.w)} × ${Math.round(F.h)}`, { size: 1.55 });
    s += text(RX + 108, y, `${mmToFt(F.w)} × ${mmToFt(F.h)}`, { size: 1.45, fill: THIN, anchor: "end" });
  });

  { const y = 106.5 + FRONTS.length * 4.1, iw = open[1] - open[0] - 62, ih = K.inner.h1 - K.inner.h0;
    s += text(RX, y, `${FRONTS.length}a`, { size: 1.55, weight: 700 }) + text(RX + 8, y, "Inner drawer, finger scoop", { size: 1.55, fill: DIM });
    s += text(RX + 60, y, `${iw} × ${ih}`, { size: 1.55, fill: DIM }) + text(RX + 108, y, `${mmToFt(iw)} × ${mmToFt(ih)}`, { size: 1.45, fill: THIN, anchor: "end" }); }
  const my = 110 + (FRONTS.length + 1) * 4.1 + 6;
  s += heading(RX, my, "MATERIALS", "THE ROOM'S PALETTE — NOTHING NEW", 108);
  [["Top", "Beige-gold marble, the bathroom stone. 18 slab"],
   ["", "on a 20 BWP sub-top, mitred 38 apron, polished."],
   ["Carcass", "18 BWP / marine ply, teak veneer both faces."],
   ["", "Every edge sealed — it stands in a wet room."],
   ["Fronts", "18 BWP, teak veneer, 6 solid teak lipping."],
   ...(V.ledges ? [["Ledge", `The ${V.ledges} veneer top: solid teak nosing,`], ["", "sealed like a worktop. Marble stops at the bank."]] : []),
   ["Runners", "Undermount, full extension. Drawers push-to-open —"],
   ["", "no handles on them; the doors keep cup pulls."],
   ["Fittings", "Chrome — already bought. Door cup pulls to match."],
   ["Hanging", "18 ply cleat on the wall, 700–760 high."],
   ["Inner", "A U-box on its own runners, above the big"],
   ["", "drawer's low sides — see AST-DR-022."]]
    .forEach(([a, b], i) => (s += text(RX, my + 11 + i * 3.9, a, { size: 1.5, weight: 700 }) + text(RX + 15, my + 11 + i * 3.9, b, { size: 1.5 })));

  // key to the section, and notes, along the foot
  s += heading(18, 262, "SECTION KEY", "", 70);
  [["A", "Hanging cleat"], ["B", "Big drawer, U-box"], ["C", "Waste Ø40 and P-trap"], ["D", "Support, set back 76"], ["E", "Wall spout"], ["F", "Ply sub-top"], ["G", "Inner drawer"]]
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

// ═════════════ AST-DR-022 — the drawer within the big drawer ═════════════
// The big drawer's front hides a second, shallower drawer riding at the top of it on its own runners:
// open the big drawer, then pull the inner one out further, like a cutlery tray in a kitchen pan drawer.
// Below it the big drawer stays deep enough for tall bottles. Drawn on scheme C; B and the normal
// version are the same drawer at a different width — the table gives all three.
(function () {
  const { INK, THIN, DIM, f, text, mmToFt, view, chainH, chainV, heading, frame, titleBlock, sheet } = window.DK;
  const K = VANITY, D = K.D, AX = K.AX, I = K.inner, P = K.pullOut, gap = 3;
  const MARBLE = "#efede7", VEN = "#f3ead8";
  const E = (h) => 1130 - h;
  const LN = (a, b, c, d, w, x = "") => `<line x1="${f(a)}" y1="${f(b)}" x2="${f(c)}" y2="${f(d)}" stroke-width="${f(w)}" ${x}/>`;
  const RC = (a, b, c, d, w, fl = "none", x = "") => `<rect x="${f(Math.min(a, c))}" y="${f(Math.min(b, d))}" width="${f(Math.abs(c - a))}" height="${f(Math.abs(d - b))}" fill="${fl}" stroke-width="${f(w)}" ${x}/>`;
  const RE = (x0, h0, x1, h1, w, fl, x) => RC(x0, E(h1), x1, E(h0), w, fl, x);
  const PT = (d, w, fl = "none", x = "") => `<path d="${d}" fill="${fl}" stroke-width="${f(w)}" ${x}/>`;
  const dash = (t) => `stroke-dasharray="${f(t * 6)} ${f(t * 4)}"`;
  const cen = (t) => `stroke-dasharray="${f(t * 16)} ${f(t * 4)} ${f(t * 3)} ${f(t * 4)}"`;
  const bankC = [457, 1371], openC = [bankC[0] + K.stile, bankC[1] - K.stile];

  // side section through one ARM of the drawers — clear of the notch, so both boxes run full depth.
  // po: how far the big drawer is out; pi: how much further the inner one is out.
  function side(t, po, pi) {
    let o = "";
    o += RE(0, K.clear, D, K.clear + 18, t, VEN);                                           // carcass bottom
    o += RE(18, K.clear + 18, 30, 650, t * 0.8, VEN);                                      // carcass back
    o += RE(D - 18, K.big[1], D, K.top2[0], t, VEN);                                       // mid rail
    o += RE(D - 18, K.clear + 18, D, K.big[0], t, VEN);                                    // bottom rail
    o += RE(D - 18, K.top2[0] + gap, D, 650, t, VEN);                                      // top drawer front, broken
    o += RE(92, K.top2[0] + 20, D - 18, 650, t * 0.6, "none", dash(t));                    // top drawer box, broken
    o += LN(-40, E(650), D + 40, E(650), t * 0.5, dash(t));
    // the big drawer
    const q = po, bo = K.big[0] + 13, bs = K.bigSide;
    o += RE(92 + q, bo, D - 18 + q, bo + 12, t, VEN) + RE(92 + q, bo, 107 + q, bs, t, VEN);
    o += RE(107 + q, bo + 12, D - 18 + q, bs, t * 0.45, "none");                           // its side, beyond
    o += RE(D - 18 + q, K.big[0] + gap, D + q, K.big[1] - gap, t * 1.2, VEN);              // its front
    o += RE(110 + q, bo - 7, D - 40 + q, bo, t * 0.5, "none", dash(t));                    // undermount runner
    // the inner drawer, riding on the big drawer's sides
    const r = pi;                                                                        // the inner drawer moves on its own
    o += RE(I.back + r, I.bot, D - 58 + r, I.bot + 12, t, VEN) + RE(I.back + r, I.bot, I.back + 12 + r, I.side, t, VEN);
    o += RE(I.back + 12 + r, I.bot + 12, D - 58 + r, I.side, t * 0.45, "none");
    o += PT(`M ${f(D - 58 + r)} ${f(E(I.h0))} L ${f(D - 40 + r)} ${f(E(I.h0))} L ${f(D - 40 + r)} ${f(E(I.h1 - 22))} Q ${f(D - 40 + r)} ${f(E(I.h1))} ${f(D - 58 + r)} ${f(E(I.h1))} Z`, t * 1.2, VEN);   // front, top edge scooped
    o += RE(I.back + 20, 492, D - 70, 502, t * 0.5, "none", dash(t));                     // side runner, fixed to the carcass
    return o;
  }

  // plan: both U-boxes, the pipe in the notch
  function plan(t) {
    const x0 = openC[0] + 13, x1 = openC[1] - 13, d0 = 92, d1 = D - 18, n0 = AX - 100, n1 = AX + 100, nd = 330;
    let o = LN(openC[0] - 80, 0, openC[1] + 80, 0, t * 1.6);
    o += PT(`M ${x0} ${d0} L ${n0} ${d0} L ${n0} ${nd} L ${n1} ${nd} L ${n1} ${d0} L ${x1} ${d0} L ${x1} ${d1} L ${x0} ${d1} Z`, t * 1.2, VEN);
    const io = innerOutline(openC, AX);
    o += PT(io.path, t * 1.1, "#fbf6ec", `stroke="${DIM}"`);
    o += RC(x0 + 18, D - 58, x1 - 18, D - 40, t, VEN, `stroke="${DIM}"`);
    o += RC(openC[0] - gap, d1, openC[1] + gap, D, t * 1.2, VEN);
    o += `<circle cx="${AX}" cy="${K.bowl.c}" r="20" fill="#fff" stroke-width="${f(t)}"/>` + PT(`M ${AX} ${K.bowl.c} L ${AX} 0`, t * 2.6, "none", `stroke="${THIN}"`);
    o += LN(AX, -50, AX, D + 50, t * 0.6, `stroke="${DIM}" ${cen(t)}`);
    return o;
  }

  // front: the bank, with the inner drawer seen through the big front
  function front(t) {
    let o = RE(bankC[0], K.clear, bankC[1], K.top, t * 1.2, VEN);
    [[openC[0], AX - 12.5, K.top2[0], K.top2[1]], [AX + 12.5, openC[1], K.top2[0], K.top2[1]], [openC[0], openC[1], K.big[0], K.big[1]]]
      .forEach(([a, b, h0, h1]) => (o += RE(a + gap, h0 + gap, b - gap, h1 - gap, t, VEN)));
    o += RE(openC[0] + 31, I.h0, openC[1] - 31, I.h1, t * 0.9, "none", `stroke="${DIM}" ${dash(t)}`);
    o += RE(bankC[0], K.top, bankC[1], K.counter, t * 1.2, MARBLE);
    return o;
  }

  window.DK.begin("vanity-drawer");
  let s = frame();

  // 1 · closed, 1:5
  s += heading(18, 17, "1 · CLOSED", "SECTION THROUGH ONE ARM · 1:5 · SCHEME C", 120);
  const sc1 = 5, v1 = view(30, 30 - E(650) / sc1, sc1, "Drawer within, closed"), t1 = v1.w(0.12);
  s += v1.g(side(t1, 0, 0), 0.3);
  s += chainV([v1.Y(E(K.big[0] + 13 + 12)), v1.Y(E(I.bot)), v1.Y(E(I.h1)), v1.Y(E(K.big[1] - gap))], v1.X(D) + 7,
    [`${I.bot - K.big[0] - 25} CLEAR FOR BOTTLES`, I.h1 - I.bot, K.big[1] - gap - I.h1], { from: v1.X(D) + 1, size: 1.3 });
  s += chainV([v1.Y(E(I.h0)), v1.Y(E(I.h1))], v1.X(D) + 15, [`${I.h1 - I.h0} INNER FRONT`], { from: v1.X(D - 40) + 1, size: 1.3 });
  s += chainH([v1.X(D - 58), v1.X(D - 40), v1.X(D - 18), v1.X(D)], v1.Y(E(I.h1)) - 7, [18, 22, 18], { from: v1.Y(E(I.h1)) - 1, size: 1.2 });
  s += chainH([v1.X(I.back), v1.X(D - 58)], v1.Y(E(I.bot)) + 7, [`${D - 58 - I.back} INNER BOX`], { from: v1.Y(E(I.bot)) + 1, size: 1.25 });
  s += chainH([v1.X(92), v1.X(D - 18)], v1.Y(E(K.big[0] + 13)) + 7, [`${D - 18 - 92} BIG BOX`], { from: v1.Y(E(K.big[0] + 13)) + 1, size: 1.25 });

  // 2 · open, 1:10
  s += heading(170, 17, "2 · OPEN", "BIG DRAWER OUT · INNER ONE PULLED OUT BEHIND ITS FRONT · 1:10", 120);
  const sc2 = 10, v2 = view(178, 34 - E(650) / sc2, sc2, "Drawer within, open"), t2 = v2.w(0.12);
  s += v2.g(side(t2, P.outer, P.inner), 0.3);
  s += chainH([v2.X(D), v2.X(D + P.outer)], v2.Y(E(K.big[0])) + 5, [`${P.outer} BIG DRAWER OUT`], { from: v2.Y(E(K.big[0])) + 1, size: 1.25 });
  s += chainH([v2.X(D - 40), v2.X(D - 40 + P.inner)], v2.Y(E(650)) - 4, [`${P.inner} INNER OUT`], { from: v2.Y(E(650)) - 1, size: 1.25 });
  s += text(v2.X(D + 120), v2.Y(E(320)), "BIG DRAWER", { size: 1.5, anchor: "middle" });
  s += text(v2.X(D + 120), v2.Y(E(I.side + 30)), "INNER DRAWER", { size: 1.5, anchor: "middle", fill: DIM });

  // 3 · plan, 1:10
  s += heading(170, 104, "3 · PLAN", "BOTH DRAWERS SHUT · 1:10 · THE PIPE DROPS THROUGH BOTH NOTCHES", 120);
  const sc3 = 10, v3 = view(185 - (openC[0] - 80) / sc3, 118, sc3, "Drawer within, plan"), t3 = v3.w(0.12);
  s += v3.g(plan(t3), 0.3);
  s += chainH([v3.X(AX - I.notch), v3.X(AX + I.notch)], v3.Y(0) - 3, [I.notch * 2], { from: v3.Y(0) - 0.5, size: 1.15 });
  s += chainV([v3.Y(I.back), v3.Y(I.notchD)], v3.X(openC[1] + 13) + 5, [I.notchD - I.back], { from: v3.X(openC[1] - 41) + 1, size: 1.15 });
  s += text(v3.X(AX), v3.Y(D) + 5.5, "INNER DRAWER · RED", { size: 1.4, anchor: "middle", fill: DIM });

  // 4 · front, 1:10
  s += heading(18, 150, "4 · FRONT", "THE INNER DRAWER HIDES BEHIND THE BIG FRONT · 1:10", 120);
  const v4 = view(30 - bankC[0] / 10, 160 - E(K.counter + 20) / 10, 10, "Drawer within, front"), t4 = v4.w(0.12);
  s += v4.g(front(t4), 0.3);

  // the right-hand column: sizes, hardware
  const RX = 302;
  s += heading(RX, 17, "SIZES", "THE SAME DRAWER IN ALL THREE SCHEMES", 108);
  s += text(RX, 29, "", { size: 1.4 }) + ["SCHEME", "BIG FRONT", "INNER FRONT", "INNER BOX W"].map((h, i) => text(RX + [0, 22, 50, 80][i], 29, h, { size: 1.35, fill: THIN })).join("");
  [["Normal", [419, 1105]], ["B", [342, 1486]], ["C", openC]].forEach(([n, o], i) => {
    const W = o[1] - o[0], y = 34 + i * 4.4, io = innerOutline(o, AX);
    s += text(RX, y, n, { size: 1.55, weight: 700 }) + text(RX + 22, y, `${W - 6} × ${K.big[1] - K.big[0] - 6}`, { size: 1.5 })
      + text(RX + 50, y, `${W - 62} × ${I.h1 - I.h0}`, { size: 1.5, fill: DIM }) + text(RX + 80, y, `${io.x1 - io.x0}${io.arm ? " · L" : " · U"}`, { size: 1.5 });
  });
  s += text(RX, 50, `Inner box ${D - 58 - I.back} deep, ${I.side - I.bot} high, 12 ply; notch ${I.notch * 2} wide.`, { size: 1.45, fill: THIN });

  s += heading(RX, 60, "HARDWARE", "", 108);
  [["Big drawer", "Undermount runners, full extension, push-to-"], ["", `open. Its sides stop at ${K.bigSide} to pass under the inner.`],
   ["Inner drawer", "Side-mounted runners 400, full extension, on"], ["", "the carcass partitions at 492–502. Independent."],
   ["Inner front", "18 BWP, teak veneer both faces, top edge"], ["", "scooped for a finger. No handle."]]
    .forEach(([a, b], i) => (s += text(RX, 70 + i * 4, a, { size: 1.5, weight: 700 }) + text(RX + 22, 70 + i * 4, b, { size: 1.5 })));

  s += heading(RX, 102, "NOTES", "REVISION 1", 108);
  ["Open the big drawer: the inner one stays put. Pull it",
   `and it comes out ${P.inner} behind the big front, over the`,
   "bottles — the tray in the kitchen drawer photographed.",
   "",
   "Both are U-boxes. The waste pipe drops through their",
   "notches whichever drawer is shut; neither may be solid",
   "across the back.",
   "",
   "It can never pass the big front — that front is solid.",
   "Shut, it stands 22 behind it.",
   "",
   `Below the inner drawer: ${I.bot - K.big[0] - 25} clear — tall bottles stand.`,
   "",
   "Normal version: the pipe is off centre, which leaves",
   "the inner drawer a 25 right arm. Too thin to keep — that",
   "arm is left off and the inner drawer is an L.",
  ].forEach((n, i) => (s += text(RX, 114 + i * 4.2, n, { size: 1.5, fill: n.startsWith("OPEN") ? "#b3261e" : INK })));

  s += titleBlock({ title: "VANITY — DRAWER WITHIN", sub: "The big drawer, and a drawer inside it", date: K.date, rev: "1 — the concept", dwg: "AST-DR-022", scale: "AS NOTED @ A3" });
  window.DRAWINGS["vanity-drawer"] = { title: "Vanity — drawer within · AST-DR-022", svg: sheet(s), model: true };
})();
