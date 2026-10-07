// The suite in plan — bedroom, dressing, bathroom, tunnel — with layers the viewer switches on and off:
// room sizes, furniture sizes, clearances between pieces, the ceiling lights, each piece of furniture on
// its own, and a light / dark / blueprint look. Mounted on the overview, under the 3D room.
// Same shell as the Blender skeleton (tools/walk/skeleton.py). Real-world mm; x east from the bedroom's
// left wall at the study end, y south from the study wall — so the study is at the top.
// Colours live in pages.css (.p2d theme variables); the SVG carries classes only.
(function () {
  const f = (n) => +(+n).toFixed(1);
  const ftin = (mm) => (window.DK && window.DK.mmToFt ? window.DK.mmToFt(mm) : `${Math.round(mm)}`);

  // ── the shell ──
  const T = 230;
  const xR = 4547, L = 5766, xLs = -50, xLb = -177, yS = 4600;
  const leftAt = (y) => (y >= yS ? xLb : (xLs * y) / yS);
  const DR = { x0: xR + T, x1: xR + T + 3759, y0: L - 2819, y1: L };
  const BA = { x0: xR + T, x1: xR + T + 3734, y0: 0, y1: 2718 };
  const TUN = { x0: DR.x1 - 914, x1: DR.x1, y0: L + T, y1: L + T + 2337 };
  const E = DR.x1 + T;
  const LIN = 51;
  const D1 = { y0: L - (914 + 2 * LIN), y1: L, leaf: 914 };
  const D2 = { y1: L - 686, leaf: 762 }; D2.y0 = D2.y1 - 864;
  const D3 = { x0: BA.x0, x1: BA.x0 + 762, leaf: 686 };
  const CHASE = { d: 178, y1: BA.y1 - 1626 };
  const PIER = { x1: BA.x1 - 940, w: 254, out: 914 }; PIER.x0 = PIER.x1 - PIER.w;
  const WIN = { x0: xR - 1219, x1: xR };
  const BWIN = { x0: BA.x0 + 178 + 50, x1: BA.x0 + 178 + 50 + 914 };

  // ── the furniture, where the owner wants it (bed wall best case, 27.09) ──
  const doorEnd = xLb + D1.leaf;
  const bx0 = doorEnd + 178, bx1 = xR - 787, Wb = bx1 - bx0, cx = (bx0 + bx1) / 2;
  // the bed wall (AST-DR-034 rev 5): built out 2 in, sweeping in one 6 in cove to 15 in round a niche on the old bed-back
  // span; the bed (AST-DR-035 rev 4) stands in it — a 3 in headboard 1 in off the plaster, then a storage base down to the
  // floor, 2 in past the mattress at the sides and foot
  const BW = { edge: 51, deep: 381, cove: 152, flat: 25, plaster: 20 };   // 15 in at the niche: the 14 in side tables sit inside it
  const bedW = 1929, bedL = 1981, hbBack = L - 45, hbFront = L - 121, bedFoot = hbFront - bedL - 51, BT = 121;
  // partition (owner, 1 Oct): Mano cast-glass blocks, 95 deep, 16 blocks of 150 = 2400 along its run, on the old
  // centre line 11 ft off the bed wall. A straight middle of 8 blocks; each end turns TOWARDS THE BED only, on a 1.3 m
  // radius over 4 blocks (26°, 136 out) — about as tight as the blocks go. One foot-wide wood column up the middle;
  // the TV floats on the bed side; under it the TV unit, a pill in plan, 450 high and 400 deep (AST-DR-036).
  const pT = 95, yP = L - 3353, MOD = 150, RUN = 16 * MOD, pR = 1300, straight = 8 * MOD / 2;
  const pTurn = (RUN / 2 - straight) / pR, reach = pR * (1 - Math.cos(pTurn));
  const pAt = (u, w) => {                                    // run position u (from the middle) and offset w (+ towards the bed) to plan x, y
    if (Math.abs(u) <= straight) return [cx + u, yP + w];
    const sg = Math.sign(u), th = (Math.abs(u) - straight) / pR;
    return [cx + sg * (straight + pR * Math.sin(th)) - sg * w * Math.sin(th), yP + pR * (1 - Math.cos(th)) + w * Math.cos(th)];
  };
  const along = (w, u0 = -RUN / 2, u1 = RUN / 2, n = 48) => Array.from({ length: n + 1 }, (_, i) => pAt(u0 + (u1 - u0) * i / n, w));
  const col = 290, drw = { gap: 5, d: 400, n: 4 }, drFront = pT / 2 + drw.gap + drw.d;
  const tv = { w: 1227, d: 26, stand: 35 };
  const study = { d: 280, book: 1489, pil: 240, xP2: xR - (70 + 1219) - 240 };
  const WD = { d: 686 };
  const mirror = { c: 674, w: 253, t: 25, off: 20 };
  const rug = { w: 3050, l: 2440, y0: bedFoot + 15 - 600 };   // 10 × 8 ft wool rug under the bed (owner: "your choice")

  // the desk: the square-cornered version (AST-DR-028), its back 2 in from the glass — room for a monitor arm's clamp
  const desk = { L: 2286, D: 914, gap: 50 };
  desk.back = yP - pT / 2 - desk.gap; desk.front = desk.back - desk.D;

  const R = (x0, y0, x1, y1, c = "", a = "") => `<rect class="${c}" x="${f(Math.min(x0, x1))}" y="${f(Math.min(y0, y1))}" width="${f(Math.abs(x1 - x0))}" height="${f(Math.abs(y1 - y0))}" ${a}/>`;
  const poly = (pts) => "M " + pts.map((p) => `${f(p[0])} ${f(p[1])}`).join(" L ") + " Z";
  const Tx = (x, y, s, c = "tx", o = {}) => `<text class="${c}" x="${f(x)}" y="${f(y)}" font-size="${o.size || 110}" text-anchor="${o.anchor || "middle"}"${o.rot ? ` transform="rotate(-90 ${f(x)} ${f(y)})"` : ""}>${s}</text>`;

  // dimension lines, in plan mm; cls "dm" (sizes) or "cl" (clearances)
  function dimH(x0, x1, y, from, label, o = {}) {
    const c = o.cls || "dm", t = o.size || 105, tick = (x) => `<line class="tk" x1="${f(x - 40)}" y1="${f(y + 40)}" x2="${f(x + 40)}" y2="${f(y - 40)}"/>`;
    const ext = from == null ? "" : [x0, x1].map((x) => `<line x1="${f(x)}" y1="${f(from)}" x2="${f(x)}" y2="${f(y + (y > from ? 55 : -55))}"/>`).join("");
    return `<g class="${c}"><line x1="${f(x0)}" y1="${f(y)}" x2="${f(x1)}" y2="${f(y)}"/>${ext}${tick(x0)}${tick(x1)}` +
      Tx((x0 + x1) / 2, y - 38, label || ftin(Math.abs(x1 - x0)), c + "t", { size: t }) + `</g>`;
  }
  function dimV(y0, y1, x, from, label, o = {}) {
    const c = o.cls || "dm", t = o.size || 105, tick = (y) => `<line class="tk" x1="${f(x - 40)}" y1="${f(y + 40)}" x2="${f(x + 40)}" y2="${f(y - 40)}"/>`;
    const ext = from == null ? "" : [y0, y1].map((y) => `<line x1="${f(from)}" y1="${f(y)}" x2="${f(x + (x > from ? 55 : -55))}" y2="${f(y)}"/>`).join("");
    return `<g class="${c}"><line x1="${f(x)}" y1="${f(y0)}" x2="${f(x)}" y2="${f(y1)}"/>${ext}${tick(y0)}${tick(y1)}` +
      Tx(x - 38, (y0 + y1) / 2, label || ftin(Math.abs(y1 - y0)), c + "t", { size: t, rot: true }) + `</g>`;
  }

  // ── the shell ──
  function shell() {
    const outline = [[-T, -T], [E, -T], [E, TUN.y1 + T], [TUN.x0 - T, TUN.y1 + T], [TUN.x0 - T, L + T], [xLb - T, L + T], [xLb - T, yS], [xLs - T, yS]];
    const rooms = [[[0, 0], [xR, 0], [xR, L], [xLb, L], [xLb, yS], [xLs, yS]],
      [[DR.x0, DR.y0], [DR.x1, DR.y0], [DR.x1, DR.y1], [DR.x0, DR.y1]],
      [[BA.x0, BA.y0], [BA.x1, BA.y0], [BA.x1, BA.y1], [BA.x0, BA.y1]],
      [[TUN.x0, TUN.y0], [TUN.x1, TUN.y0], [TUN.x1, TUN.y1], [TUN.x0, TUN.y1]]];
    let o = `<path class="w" fill-rule="evenodd" d="${[outline, ...rooms].map(poly).join(" ")}"/>`;
    o += R(BA.x0, 0, BA.x0 + CHASE.d, CHASE.y1, "w") + R(PIER.x0, BA.y1 - PIER.out, PIER.x1, BA.y1, "w");
    o += R(WIN.x0, -T, WIN.x1, 0, "gap") + R(xLb - T, D1.y0, xLb, D1.y1, "gap") + R(xR, D2.y0, DR.x0, D2.y1, "gap") +
      R(D3.x0, BA.y1, D3.x1, DR.y0, "gap") + R(TUN.x0, DR.y1, TUN.x1, TUN.y0, "gap") + R(BWIN.x0, -T, BWIN.x1, 0, "gap");
    [[WIN.x0, WIN.x1, "win"], [BWIN.x0, BWIN.x1, "win hidw"]].forEach(([a, b, c]) => {
      o += `<g class="${c}">` + [-T + 25, -T / 2, -25].map((y) => `<line x1="${f(a)}" y1="${f(y)}" x2="${f(b)}" y2="${f(y)}"/>`).join("") +
        `<line x1="${f(a)}" y1="${-T}" x2="${f(a)}" y2="0"/><line x1="${f(b)}" y1="${-T}" x2="${f(b)}" y2="0"/></g>`;
    });
    o += R(xLb - T, D1.y0, xLb, D1.y0 + LIN, "lin") + R(xLb - T, D1.y1 - LIN, xLb, D1.y1, "lin");
    o += R(xR, D2.y0, DR.x0, D2.y0 + LIN, "lin") + R(xR, D2.y1 - LIN, DR.x0, D2.y1, "lin");
    o += R(D3.x0, BA.y1, D3.x0 + 38, DR.y0, "lin") + R(D3.x1 - 38, BA.y1, D3.x1, DR.y0, "lin");
    const swing = (hx, hy, ax, ay, ox, oy, w, sweep) =>
      `<path class="sw" d="M ${f(ax)} ${f(ay)} A ${w} ${w} 0 0 ${sweep} ${f(ox)} ${f(oy)}"/><line class="door" x1="${f(hx)}" y1="${f(hy)}" x2="${f(ox)}" y2="${f(oy)}"/>`;
    o += swing(xLb, D1.y1 - LIN, xLb, D1.y1 - LIN - D1.leaf, xLb + D1.leaf, D1.y1 - LIN, D1.leaf, 0);
    o += swing(DR.x0, D2.y1 - LIN, DR.x0, D2.y1 - LIN - D2.leaf, DR.x0 + D2.leaf, D2.y1 - LIN, D2.leaf, 1);
    o += swing(D3.x0 + 38, BA.y1, D3.x0 + 38 + D3.leaf, BA.y1, D3.x0 + 38, BA.y1 - D3.leaf, D3.leaf, 0);   // hinged on the left as you go in
    const dc = (DR.y0 + DR.y1) / 2;
    o += R(DR.x0, dc - 762, DR.x1, dc + 762, "hid");
    o += Tx(700, 3330, "BEDROOM", "rn", { size: 150 }) + Tx((DR.x0 + DR.x1) / 2 - 300, dc - 170, "DRESSING", "rn", { size: 130 }) +
      Tx(BA.x0 + 1700, 560, "BATHROOM", "rn", { size: 130 }) + Tx((TUN.x0 + TUN.x1) / 2 + 40, (TUN.y0 + TUN.y1) / 2, "TUNNEL", "rn", { size: 110, rot: true }) +
      Tx((DR.x0 + DR.x1) / 2 - 300, dc + 10, "DOME ABOVE", "tx2", { size: 85 }) + Tx(xLb + 470, L - 330, "D1", "tx2", { size: 85 }) +
      Tx(DR.x0 + 330, D2.y1 - 300, "D2", "tx2", { size: 85 }) + Tx(D3.x0 + 480, BA.y1 - 170, "D3", "tx2", { size: 85 });
    return o;
  }

  // ── the pieces ──
  const P = {
    bed() {
      let o = R(cx - rug.w / 2, rug.y0, cx + rug.w / 2, rug.y0 + rug.l, "hid");
      o += Tx(cx - rug.w / 2 + 420, rug.y0 + 170, "RUG 10'×8'", "tx2", { size: 70 });
      // the bed wall's build-out in plan: 2 in, the cove out to 15 in, the niche between (its plaster back a thin line)
      const cw = BW.cove + BW.flat, cv = (xe, dir) => Array.from({ length: 13 }, (_, i) => { const t = (i / 12) * Math.PI / 2;
        return [xe + dir * (cw - BW.cove * Math.sin(t)), L - (BW.deep - (BW.deep - BW.edge) * Math.cos(t))]; });
      const poly = (pts) => `<path class="fu3" d="M ${pts.map(([x, y]) => `${f(x)} ${f(y)}`).join(" L ")} Z"/>`;
      o += poly([[xLb, L], [xLb, L - BW.edge], ...cv(bx0, -1), [bx0, L - BW.deep], [bx0, L]]);
      o += poly([[bx1, L], [bx1, L - BW.deep], ...cv(bx1, 1).reverse(), [xR, L - BW.edge], [xR, L]]);
      o += R(bx0, L - BW.plaster, bx1, L, "fu2");
      // headboard, the storage base, mattress, pillows; side tables either side
      o += R(cx - bedW / 2, bedFoot, cx + bedW / 2, hbBack, "fu");
      o += R(cx - bedW / 2, hbFront, cx + bedW / 2, hbBack, "fu2");
      o += R(cx - bedW / 2 + 50, bedFoot + 51, cx + bedW / 2 - 50, hbFront, "fu2");
      o += R(cx - bedW / 2 + 90, hbFront - 330, cx + bedW / 2 - 90, hbFront - 30, "fu2");
      [bx0 + (cx - bedW / 2 - bx0) / 2, bx1 - (bx1 - cx - bedW / 2) / 2].forEach((t) => (o += R(t - 203, L - BW.plaster - 356, t + 203, L - BW.plaster, "fu")));
      o += `<line class="thin" x1="${f(cx - bedW / 2)}" y1="${f(bedFoot + 520)}" x2="${f(cx + bedW / 2)}" y2="${f(bedFoot + 520)}"/>`;
      o += Tx(cx, bedFoot + 1000, "BED", "lb", { size: 120 });
      o += Tx(cx, L + 150, "BED WALL — 15 IN NICHE, 6 IN COVE, 2 IN ELSEWHERE · AST-DR-034", "tx2", { size: 60 });
      o += `<g class="fdim">` + dimH(cx - bedW / 2, cx + bedW / 2, bedFoot + 330, null, `${ftin(bedW)} BED`, { size: 90 }) +
        dimV(bedFoot, hbFront, cx + bedW / 2 - 170, null, ftin(hbFront - bedFoot), { size: 90 }) +
        dimH(bx0, bx1, L + T + 260, L, `${ftin(bx1 - bx0)} NICHE`, { size: 95 }) + `</g>`;
      return o;
    },
    partition() {
      const ring = (wa, wb, u0, u1) => { const a = along(wa, u0, u1), b = along(wb, u0, u1).reverse(); return a.concat(b); };
      // the TV unit (AST-DR-036): a pill in plan — a straight front, a quarter-round at each end back to the glass's tip;
      // four bays, two drawer stacks in the middle and a flat-doored cabinet at each end
      const TG = window.TVGEOM, at = ([x, y]) => [cx + x, yP + y];
      let o = `<path class="fu" d="${poly(TG.outline(0).map(at))}"/>`;
      TG.bayX.slice(1, -1).forEach((x) => { const [ax, ay] = at([x, TG.W0 + 9]), [bx, by] = at([x, TG.YF]);
        o += `<line class="thin" x1="${f(ax)}" y1="${f(ay)}" x2="${f(bx)}" y2="${f(by)}"/>`; });
      { const [ax, ay] = at([-TG.X1, TG.YF - 20]), [bx, by] = at([TG.X1, TG.YF - 20]); o += `<line class="thin" x1="${f(ax)}" y1="${f(ay)}" x2="${f(bx)}" y2="${f(by)}"/>`; }
      [-225, 225].forEach((c) => { const [ax, ay] = at([c - 130, TG.YF + 28]), [bx] = at([c + 130, 0]); o += `<line class="thin" x1="${f(ax)}" y1="${f(ay)}" x2="${f(bx)}" y2="${f(ay)}"/>`; });
      o += `<path class="glassb" d="${poly(ring(-pT / 2, pT / 2))}"/>`;                // the glass blocks
      for (let i = 1; i < 16; i++) { const [ax, ay] = pAt(-RUN / 2 + i * MOD, -pT / 2), [bx, by] = pAt(-RUN / 2 + i * MOD, pT / 2);
        o += `<line class="thin" x1="${f(ax)}" y1="${f(ay)}" x2="${f(bx)}" y2="${f(by)}"/>`; }
      o += R(cx - col / 2, yP - pT / 2, cx + col / 2, yP + pT / 2, "solidf");                // the wood column, a foot wide
      o += R(cx - tv.w / 2, yP + pT / 2 + tv.stand, cx + tv.w / 2, yP + pT / 2 + tv.stand + tv.d, "tv");
      o += Tx(cx, yP + drFront - 110, `TV UNIT · 4 DRAWERS, 2 CABINETS · ${ftin(drw.d)} DEEP · AST-DR-036`, "tx2", { size: 66 });
      const [lx] = pAt(-RUN / 2, 0), [rx] = pAt(RUN / 2, 0);
      o += `<g class="fdim">` +
        dimH(lx - pT / 2, rx + pT / 2, yP - 330, yP - pT / 2, `${ftin(rx - lx + pT)} GLASS-BLOCK PARTITION`, { size: 90 }) +
        dimV(yP, yP + reach, rx + 230, rx, `${ftin(reach)} OUT`, { size: 80 }) + `</g>`;
      return o;
    },
    desk() {
      const x0 = cx - desk.L / 2, x1 = cx + desk.L / 2, y0 = desk.front, y1 = desk.back;
      let o = R(x0, y0, x1, y1, "fu");                                                     // square corners (AST-DR-028)
      o += R(x0 + 560, y0 + 40, x1 - 560, y1 - 280, "hid");
      o += R(cx - 357, y1 - 260, cx + 357, y1 - 230, "thin");                              // the monitor, on its arm
      o += `<rect class="fu2" x="${f(cx - 280)}" y="${f(y0 - 430)}" width="560" height="560" rx="90"/>`;
      o += Tx(cx, (y0 + y1) / 2 + 150, "DESK", "lb", { size: 110 }) + Tx(cx, y0 - 170, "CHAIR", "tx2", { size: 70 });
      o += `<g class="fdim">` + dimH(x0, x1, y0 + 150, null, "7'-6\" × 3'-0\" · SQUARE", { size: 85 }) + `</g>`;
      return o;
    },
    art() {                                                                                 // the big painting, left wall, under the AC (stand-in)
      return R(xLs + 5, 1099, xLs + 60, 3499, "solidf") + Tx(xLs + 190, 2299, "PAINTING 8'×5'", "tx2", { size: 66, rot: true });
    },
    study() {
      let o = R(0, 0, xR, study.d, "fu");
      o += R(0, 0, study.book, study.d, "fu3");
      for (let i = 1; i < 4; i++) o += `<line class="thin" x1="${f((study.book * i) / 4)}" y1="0" x2="${f((study.book * i) / 4)}" y2="${study.d}"/>`;
      [study.book, study.xP2].forEach((x) => (o += R(x - 25, 0, x + study.pil + 25, study.d + 50, "fu")));
      o += Tx(study.book / 2, study.d / 2 + 30, "BOOKCASE", "tx2", { size: 80 }) + Tx((study.book + study.xP2 + study.pil) / 2, study.d / 2 + 30, "CUPBOARDS · COUNTER", "tx2", { size: 70 });
      o += `<g class="fdim">` + dimV(0, study.d, study.xP2 + study.pil + 400, null, "11\"", { size: 75 }) + `</g>`;
      return o;
    },
    wardrobes() {
      let o = "";
      const nx0 = D3.x1, sy0 = DR.y1 - WD.d;
      const nN = 3, wN = (DR.x1 - nx0) / nN;
      for (let i = 0; i < nN; i++) o += R(nx0 + i * wN, DR.y0, nx0 + (i + 1) * wN, DR.y0 + WD.d, "fu");
      const nS = 4, wS = (DR.x1 - DR.x0) / nS;
      for (let i = 0; i < nS; i++) o += R(DR.x0 + i * wS, sy0, DR.x0 + (i + 1) * wS, DR.y1, i === nS - 1 ? "fu hidd" : "fu");
      o += Tx(DR.x1 - wS / 2, sy0 + WD.d / 2 + 25, "HIDDEN DOOR", "tx2", { size: 70 });
      o += `<g class="fdim">` + dimV(sy0, DR.y1, DR.x0 + 260, null, "2'-3\"", { size: 80 }) + dimH(nx0, nx0 + wN, DR.y0 + WD.d - 120, null, ftin(wN), { size: 75 }) + `</g>`;
      return o;
    },
    mirror() {
      const xf = DR.x1 - mirror.off, xb = xf - mirror.t, cy = (DR.y0 + DR.y1) / 2, hx = mirror.c / 2, a = Math.PI / 4;
      let o = R(xb, cy - hx, xf, cy + hx, "mir");
      [-1, 1].forEach((sg) => {
        const p0 = [xb, cy + sg * hx], p1 = [xb - mirror.w * Math.sin(a), cy + sg * (hx + mirror.w * Math.cos(a))];
        o += `<line class="solid" stroke-width="${mirror.t}" x1="${f(p0[0])}" y1="${f(p0[1])}" x2="${f(p1[0])}" y2="${f(p1[1])}"/>`;
      });
      return o + Tx(xb - 330, cy + 30, "MIRROR", "tx2", { size: 70 });
    },
  };

  // ── clearances: each names the pieces it needs, and hides with either ──
  function clearances() {
    const cl = (needs, s) => `<g class="clg ${needs.map((n) => "need-" + n).join(" ")}">${s}</g>`;
    const o = { cls: "cl", size: 88 }, os = { cls: "cl", size: 76 };
    const tvFront = yP + pT / 2 + tv.stand + tv.d, drF = yP + drFront, [tipL] = pAt(-RUN / 2, -pT / 2), [tipR] = pAt(RUN / 2, -pT / 2);
    let s = "";
    s += cl(["bed", "partition"], dimV(drF, bedFoot, cx - 420, null, `${ftin(bedFoot - drF)} BED TO DRAWERS`, o));
    s += cl(["bed", "partition"], dimV(tvFront, bedFoot, cx + 420, null, `${ftin(bedFoot - tvFront)} BED TO TV`, o));
    s += cl(["partition"], dimH(leftAt(yP), tipL - pT / 2, yP, null, ftin(tipL - pT / 2 - leftAt(yP)), o) + dimH(tipR + pT / 2, xR, yP, null, ftin(xR - tipR - pT / 2), o));
    s += cl(["partition"], dimV(yP, L, xR - 330, null, "11'-0\" TO THE BED WALL", o));
    s += cl(["desk", "study"], dimV(study.d, desk.front, cx + 700, null, `${ftin(desk.front - study.d)} CHAIR SPACE`, o));
    s += cl(["desk", "partition"], dimV(desk.back, yP - pT / 2, cx - 700, null, "2\" GAP", os));
    s += cl(["bed"], dimH(xLb, cx - bedW / 2, bedFoot + 1250, null, ftin(cx - bedW / 2 - xLb), o) + dimH(cx + bedW / 2, xR, bedFoot + 1250, null, ftin(xR - cx - bedW / 2), o));
    s += cl(["bed", "partition"], `<line class="cld" x1="${f(cx)}" y1="${f(desk.front - 200)}" x2="${f(cx)}" y2="${f(L + 60)}"/>` + Tx(cx - 45, (drF + bedFoot) / 2, "CENTRELINE", "clt", { size: 62, rot: true }));
    s += cl(["wardrobes"], dimV(DR.y0 + WD.d, DR.y1 - WD.d, DR.x0 + 2650, null, `${ftin(DR.y1 - DR.y0 - 2 * WD.d)} AISLE`, o));
    return s;
  }

  function lights() {
    const DES_W = 182 * 25.4, X = (i) => xR - (DES_W - i * 25.4), Y = (i) => i * 25.4;
    const cut = [[30.0, [30.4, 39.8, 86.2, 95.8, 142.4, 151.8]], [84.2, [70.5, 94.1, 117.5]], [97.2, [34.0, 154.0]], [117.6, [71.4, 118.6]],
      [136.4, [34.0, 154.0]], [145.8, [34.0, 154.0]], [174.5, [34.0, 154.0]], [183.8, [34.0, 154.0]]];
    let o = "";
    cut.forEach(([y, xs]) => xs.forEach((x) => (o += `<circle class="lt" cx="${f(X(x))}" cy="${f(Y(y))}" r="60"/><circle class="ltd" cx="${f(X(x))}" cy="${f(Y(y))}" r="17"/>`)));
    [-229, 0, 229].forEach((d) => (o += `<circle class="lt ltn" cx="${f(cx + d)}" cy="${f(Y(168.3))}" r="60"/>`));
    return o;
  }

  function roomDims() {
    let o = "";
    const yt = -T - 250, yt2 = yt - 290;
    o += dimH(0, WIN.x0, yt, -T) + dimH(WIN.x0, xR, yt, -T, "4'-0\" WINDOW");
    o += dimH(0, xR, yt2, yt + 55, `${ftin(xR)} STUDY WALL`);
    o += dimH(BA.x0, BA.x1, yt2, -T, `${ftin(BA.x1 - BA.x0)} BATHROOM`);
    o += dimH(xLb, xR, L + T + 560, L + T + 330, `${ftin(xR - xLb)} BED WALL`);
    o += dimV(0, L, xLb - T - 520, xLb - T, `${ftin(L)} BEDROOM`);
    o += dimV(D1.y0, D1.y1, xLb - T - 230, xLb - T, "3'-4\" D1");
    const xr = E + 280;
    o += dimV(0, BA.y1, xr, E, ftin(BA.y1)) + dimV(BA.y1, DR.y0, xr, E, "9\"", { size: 75 }) + dimV(DR.y0, DR.y1, xr, E, ftin(DR.y1 - DR.y0)) +
      dimV(TUN.y0, TUN.y1, xr, E, `${ftin(TUN.y1 - TUN.y0)} TUNNEL`);
    o += dimH(DR.x0, DR.x1, (DR.y0 + DR.y1) / 2 + 380, null, `${ftin(DR.x1 - DR.x0)} DRESSING`);
    o += dimH(TUN.x0, TUN.x1, TUN.y1 + T + 260, TUN.y1 + T, "3'-0\"");
    o += dimV(D2.y0, D2.y1, xR - 150, xR, "2'-10\" D2", { size: 85 });
    o += dimV(D2.y1, L, xR - 150, xR, "2'-3\"", { size: 80 });
    o += dimV(CHASE.y1, BA.y1, BA.x0 + 430, BA.x0 + 20, "5'-4\"", { size: 90 });
    o += dimV(0, CHASE.y1, BA.x0 + 430, BA.x0 + CHASE.d + 20, "3'-7\"", { size: 90 });
    o += dimH(PIER.x1, BA.x1, BA.y1 - PIER.out - 160, BA.y1 - PIER.out, "3'-1\"", { size: 90 });
    o += dimV(BA.y1 - PIER.out, BA.y1, PIER.x0 - 150, PIER.x0, "3'-0\"", { size: 85 });
    o += dimH(D3.x0, D3.x1, BA.y1 - 90, null, "2'-6\"", { size: 80 });
    return o;
  }

  const PIECES = [["bed", "Bed & rug"], ["partition", "Partition, TV & drawers"], ["desk", "Desk & chair"], ["art", "Painting"], ["study", "Study wall"], ["wardrobes", "Wardrobes"], ["mirror", "Mirror"]];
  const SHOW = [["room", "Room sizes"], ["fsize", "Furniture sizes"], ["clr", "Clearances"], ["lights", "Lights"]];
  const THEMES = [["light", "Light"], ["dark", "Dark"], ["blue", "Blueprint"]];
  const VB = [xLb - T - 800, -T - 800, E + 700 - (xLb - T - 800), TUN.y1 + T + 520 - (-T - 800)];

  function svg() {
    return `<svg class="p2d-svg" viewBox="${VB.join(" ")}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Plan of the suite">
      ${PIECES.map(([k]) => `<g class="L L-${k}">${P[k]()}</g>`).join("")}
      <g class="L L-shell">${shell()}</g>
      <g class="L L-lights">${lights()}</g>
      <g class="L L-room">${roomDims()}</g>
      <g class="L L-clr">${clearances()}</g></svg>`;
  }

  // ── the switches ──
  const KEY = "suite2d.v2";
  const load = () => { try { return JSON.parse(localStorage.getItem(KEY) || "null"); } catch { return null; } };
  const save = (s) => { try { localStorage.setItem(KEY, JSON.stringify(s)); } catch {} };

  function mount(el) {
    const st = Object.assign({ theme: "light", room: true, fsize: false, clr: true, lights: false, bed: true, partition: true, desk: true, art: true, study: true, wardrobes: true, mirror: true }, load() || {});
    const btn = (k, label, cls = "") => `<button type="button" data-k="${k}" class="${cls}">${label}</button>`;
    el.innerHTML = `<div class="p2d-bar">
        <div class="p2d-grp"><span class="p2d-lbl">Show</span>${SHOW.map(([k, l]) => btn(k, l)).join("")}</div>
        <div class="p2d-grp p2d-theme"><span class="p2d-lbl">Look</span>${THEMES.map(([k, l]) => `<button type="button" data-t="${k}">${l}</button>`).join("")}</div>
        <div class="p2d-grp"><span class="p2d-lbl">Furniture</span>${btn("all", "All", "act")}${btn("none", "None", "act")}${PIECES.map(([k, l]) => btn(k, l)).join("")}</div>
      </div>
      <div class="p2d-stage">${svg()}</div>
      <div class="p2d-key"><span><i class="k-dm"></i>Sizes</span><span><i class="k-cl"></i>Clearances</span><span><i class="k-lt"></i>Light holes, cut</span><span><i class="k-lt dash"></i>Over the bed — not cut yet</span><span><i class="k-dash"></i>Above / hidden · bathroom window not measured</span><span>Ceiling 9'-1" · bathroom fittings to come</span></div>`;
    const apply = () => {
      el.dataset.theme = st.theme;
      Object.keys(st).forEach((k) => { if (k !== "theme") el.classList.toggle("off-" + k, !st[k]); });
      el.querySelectorAll(".p2d-bar button[data-k]").forEach((b) => { const k = b.dataset.k; if (k in st) b.classList.toggle("on", !!st[k]); });
      el.querySelectorAll(".p2d-bar button[data-t]").forEach((b) => b.classList.toggle("on", b.dataset.t === st.theme));
      save(st);
    };
    el.querySelector(".p2d-bar").addEventListener("click", (e) => {
      const t = e.target.closest("button[data-t]"); if (t) { st.theme = t.dataset.t; return apply(); }
      const b = e.target.closest("button[data-k]"); if (!b) return;
      const k = b.dataset.k;
      if (k === "all" || k === "none") PIECES.forEach(([p]) => (st[p] = k === "all"));
      else st[k] = !st[k];
      apply();
    });
    apply();
  }

  window.SUITE2D = { mount, svg };
})();
