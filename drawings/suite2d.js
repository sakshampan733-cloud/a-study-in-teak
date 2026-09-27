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
  const bedW = 1829, bedL = 1981, BT = 50, bedFoot = L - BT - 10 - bedL;
  // partition: 8 ft, 11 ft off the bed wall. A straight middle, and at each end two matching curves —
  // one turning towards the bed, one towards the desk (the same curve turned through 180°).
  const pT = 70, PW = 2438 - pT, yP = L - 3353, pTurn = 0.96;   // PW on the centreline, so it is 8 ft over the outside
  const REACH = 381;                                          // each curve comes out 15 in from the common line — both sides (owner, 27.09)
  const pR = REACH / (1 - Math.cos(pTurn));                   // same 55° turn as before, so the curve radius grows to suit
  const st = PW / 2 - pR * Math.sin(pTurn);                 // half the straight middle
  const reach = pR * (1 - Math.cos(pTurn));                  // how far each curve comes out
  const ri = pR - pT / 2;                                    // the curve's inside face
  const tInner = Math.acos((pR - reach) / ri);               // where that face meets the line across the tips
  const cav = { yF: yP + reach, half: st + ri * Math.sin(tInner) };   // TV-side cavity: front line, half-width
  const drawers = 4;
  const tv = { w: 1228, d: 50 };
  const bs = bedW / 2 + 50, bTh = (70 * Math.PI) / 180, bR = (Wb / 2 - bs) / Math.sin(bTh), tr = bR - BT / 2 - 25;
  const study = { d: 280, book: 1489, pil: 240, xP2: xR - (70 + 1219) - 240 };
  const WD = { d: 686 };
  const mirror = { c: 674, w: 253, t: 25, off: 20 };

  // the desk faces the partition from the study side and sits in the desk-side curve until it touches it
  const desk = { L: 2286, D: 914, h: 150 };
  desk.gap = (() => {                                        // desk back, measured study-wards from the partition line
    const need = (ax, ad) => {                               // the curve's inside face at |x| = ax, less how far in the desk point sits
      if (ax <= st) return pT / 2 - ad;
      const u = ax - st; if (u >= ri * Math.sin(pTurn)) return 0;
      return pR - Math.sqrt(ri * ri - u * u) - ad;
    };
    let g = 0; const hx = desk.L / 2, h = desk.h;
    for (let i = 0; i <= 60; i++) g = Math.max(g, need((hx - h) * i / 60, 0));          // along the back edge
    for (let i = 0; i <= 30; i++) { const p = (Math.PI / 2) * i / 30; g = Math.max(g, need(hx - h * Math.cos(p), h * Math.sin(p))); }   // the hollowed corner
    return g;
  })();
  desk.back = yP - desk.gap; desk.front = desk.back - desk.D;

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
    o += swing(D3.x1 - 38, BA.y1, D3.x1 - 38 - D3.leaf, BA.y1, D3.x1 - 38, BA.y1 - D3.leaf, D3.leaf, 1);
    const dc = (DR.y0 + DR.y1) / 2;
    o += R(DR.x0, dc - 762, DR.x1, dc + 762, "hid");
    o += Tx(700, 3330, "BEDROOM", "rn", { size: 150 }) + Tx((DR.x0 + DR.x1) / 2 - 300, dc - 170, "DRESSING", "rn", { size: 130 }) +
      Tx(BA.x0 + 1700, 560, "BATHROOM", "rn", { size: 130 }) + Tx((TUN.x0 + TUN.x1) / 2 + 40, (TUN.y0 + TUN.y1) / 2, "TUNNEL", "rn", { size: 110, rot: true }) +
      Tx((DR.x0 + DR.x1) / 2 - 300, dc + 10, "DOME ABOVE", "tx2", { size: 85 }) + Tx(xLb + 470, L - 330, "D1", "tx2", { size: 85 }) +
      Tx(DR.x0 + 330, D2.y1 - 300, "D2", "tx2", { size: 85 }) + Tx(D3.x0 + 300, BA.y1 - 250, "D3", "tx2", { size: 85 });
    return o;
  }

  // ── the pieces ──
  const P = {
    bed() {
      let o = "";
      const bp = [];
      for (let i = 24; i >= 0; i--) { const a = bTh * (i / 24); bp.push([cx - bs - bR * Math.sin(a), L - (bR - bR * Math.cos(a)) - BT / 2]); }
      for (let i = 0; i <= 24; i++) { const a = bTh * (i / 24); bp.push([cx + bs + bR * Math.sin(a), L - (bR - bR * Math.cos(a)) - BT / 2]); }
      [-1, 1].forEach((sg) => {
        const ccx = cx + sg * bs, ccy = L - bR, ex = ccx + sg * tr;
        o += `<path class="fu" d="M ${f(ccx)} ${f(ccy)} L ${f(ccx)} ${f(ccy + tr)} A ${f(tr)} ${f(tr)} 0 0 ${sg < 0 ? 1 : 0} ${f(ex)} ${f(ccy)} Z"/>`;
      });
      o += `<path class="solid" stroke-width="${BT}" d="M ${bp.map((p) => `${f(p[0])} ${f(p[1])}`).join(" L ")}"/>`;
      o += R(cx - bedW / 2, bedFoot, cx + bedW / 2, L - BT - 10, "fu");
      o += R(cx - bedW / 2 + 60, L - BT - 380, cx + bedW / 2 - 60, L - BT - 70, "fu2");
      o += `<line class="thin" x1="${f(cx - bedW / 2)}" y1="${f(bedFoot + 520)}" x2="${f(cx + bedW / 2)}" y2="${f(bedFoot + 520)}"/>`;
      o += Tx(cx, bedFoot + 1000, "BED", "lb", { size: 120 });
      o += Tx(cx - bs - tr / 2, L - 170, "TABLE", "tx2", { size: 70 }) + Tx(cx + bs + tr / 2, L - 170, "TABLE", "tx2", { size: 70 });
      o += `<g class="fdim">` + dimH(cx - bedW / 2, cx + bedW / 2, bedFoot + 330, null, "6'-0\" BED", { size: 90 }) +
        dimV(bedFoot, L - BT - 10, cx + bedW / 2 - 170, null, "6'-6\"", { size: 90 }) +
        dimH(bx0, bx1, L + T + 260, L, `${ftin(Wb)} BED-BACK`, { size: 95 }) + `</g>`;
      return o;
    },
    partition() {
      let o = "";
      // the drawer unit filling the TV-side cavity: its back follows the curve, its front runs straight across the tips
      const back = [];
      for (let i = 0; i <= 24; i++) { const t = tInner * (1 - i / 24); back.push([cx - st - ri * Math.sin(t), yP + pR - ri * Math.cos(t)]); }
      for (let i = 0; i <= 24; i++) { const t = tInner * (i / 24); back.push([cx + st + ri * Math.sin(t), yP + pR - ri * Math.cos(t)]); }
      o += `<path class="fu" d="M ${back.map((p) => `${f(p[0])} ${f(p[1])}`).join(" L ")} Z"/>`;
      const dw = (2 * cav.half) / drawers;
      for (let i = 1; i < drawers; i++) {
        const x = cx - cav.half + i * dw, u = Math.abs(x - cx) - st;
        const yb = u <= 0 ? yP + pT / 2 : yP + pR - Math.sqrt(ri * ri - u * u);
        o += `<line class="thin" x1="${f(x)}" y1="${f(yb)}" x2="${f(x)}" y2="${f(cav.yF)}"/>`;
      }
      for (let i = 0; i < drawers; i++) o += `<line class="thin" x1="${f(cx - cav.half + (i + 0.5) * dw - 70)}" y1="${f(cav.yF - 45)}" x2="${f(cx - cav.half + (i + 0.5) * dw + 70)}" y2="${f(cav.yF - 45)}"/>`;
      // the screen: straight middle, two curves at each end — one to the bed, one to the desk
      const side = (sg) => {
        const pts = [];
        for (let i = 20; i >= 0; i--) { const t = pTurn * i / 20; pts.push([cx - st - pR * Math.sin(t), yP + sg * (pR - pR * Math.cos(t))]); }
        for (let i = 0; i <= 20; i++) { const t = pTurn * i / 20; pts.push([cx + st + pR * Math.sin(t), yP + sg * (pR - pR * Math.cos(t))]); }
        return `<path class="solid part" stroke-width="${pT}" d="M ${pts.map((p) => `${f(p[0])} ${f(p[1])}`).join(" L ")}"/>`;
      };
      o += side(1) + side(-1);
      o += R(cx - tv.w / 2, yP + pT / 2, cx + tv.w / 2, yP + pT / 2 + tv.d, "tv");
      o += Tx(cx, cav.yF - 110, `DRAWERS ×4 · ${ftin(cav.yF - yP - pT / 2)} DEEP · TV ABOVE`, "tx2", { size: 70 });
      o += `<g class="fdim">` +
        dimH(cx - PW / 2 - pT / 2, cx + PW / 2 + pT / 2, cav.yF + 430, yP, `${ftin(PW + pT)} PARTITION`, { size: 90 }) +
        dimH(cx - cav.half, cx + cav.half, cav.yF + 200, cav.yF, `${ftin(2 * cav.half)} DRAWERS`, { size: 85 }) +
        dimV(yP, cav.yF, cx + cav.half + 200, cx + cav.half - 60, `${ftin(reach)} OUT`, { size: 80 }) +
        dimV(yP - reach, yP, cx - cav.half - 200, cx - cav.half + 60, `${ftin(reach)} OUT`, { size: 80 }) +
        `<line class="thin" x1="${f(cx - PW / 2 - 300)}" y1="${f(yP)}" x2="${f(cx - PW / 2 + 60)}" y2="${f(yP)}"/>` + `</g>`;
      return o;
    },
    desk() {
      const x0 = cx - desk.L / 2, x1 = cx + desk.L / 2, y0 = desk.front, y1 = desk.back, h = desk.h;
      let o = `<path class="fu" d="M ${f(x0 + h)} ${f(y0)} L ${f(x1 - h)} ${f(y0)} A ${h} ${h} 0 0 0 ${f(x1)} ${f(y0 + h)} L ${f(x1)} ${f(y1 - h)} A ${h} ${h} 0 0 0 ${f(x1 - h)} ${f(y1)} L ${f(x0 + h)} ${f(y1)} A ${h} ${h} 0 0 0 ${f(x0)} ${f(y1 - h)} L ${f(x0)} ${f(y0 + h)} A ${h} ${h} 0 0 0 ${f(x0 + h)} ${f(y0)} Z"/>`;
      o += R(x0 + 560, y0 + 40, x1 - 560, y1 - 280, "hid");
      o += `<rect class="fu2" x="${f(cx - 280)}" y="${f(y0 - 430)}" width="560" height="560" rx="90"/>`;
      o += Tx(cx, (y0 + y1) / 2 + 150, "DESK", "lb", { size: 110 }) + Tx(cx, y0 - 170, "CHAIR", "tx2", { size: 70 });
      o += `<g class="fdim">` + dimH(x0, x1, y0 + 150, null, "7'-6\" × 3'-0\"", { size: 85 }) + `</g>`;
      return o;
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
    const tvFront = yP + pT / 2 + tv.d, tipL = cx - PW / 2 - pT / 2, tipR = cx + PW / 2 + pT / 2;
    let s = "";
    s += cl(["bed", "partition"], dimV(cav.yF, bedFoot, cx - 420, null, `${ftin(bedFoot - cav.yF)} BED TO DRAWERS`, o));
    s += cl(["bed", "partition"], dimV(tvFront, bedFoot, cx + 420, null, `${ftin(bedFoot - tvFront)} BED TO TV`, o));
    s += cl(["partition"], dimH(leftAt(yP), tipL, yP, null, ftin(tipL - leftAt(yP)), o) + dimH(tipR, xR, yP, null, ftin(xR - tipR), o));
    s += cl(["partition"], dimV(yP, L, xR - 330, null, "11'-0\" TO THE BED WALL", o));
    s += cl(["desk", "study"], dimV(study.d, desk.front, cx + 700, null, `${ftin(desk.front - study.d)} CHAIR SPACE`, o));
    s += cl(["desk", "partition"], dimV(desk.back, yP - pT / 2, cx - 700, null, ftin(yP - pT / 2 - desk.back), os));
    s += cl(["bed"], dimH(xLb, cx - bedW / 2, bedFoot + 1250, null, ftin(cx - bedW / 2 - xLb), o) + dimH(cx + bedW / 2, xR, bedFoot + 1250, null, ftin(xR - cx - bedW / 2), o));
    s += cl(["bed"], dimH(doorEnd, bx0, L - 120, null, ftin(bx0 - doorEnd), os) + dimH(bx1, xR, L - 120, null, ftin(xR - bx1), os));
    s += cl(["bed", "partition"], `<line class="cld" x1="${f(cx)}" y1="${f(desk.front - 200)}" x2="${f(cx)}" y2="${f(L + 60)}"/>` + Tx(cx - 45, (cav.yF + bedFoot) / 2, "CENTRELINE", "clt", { size: 62, rot: true }));
    s += cl(["wardrobes"], dimV(DR.y0 + WD.d, DR.y1 - WD.d, DR.x0 + 1500, null, `${ftin(DR.y1 - DR.y0 - 2 * WD.d)} AISLE`, o));
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

  const PIECES = [["bed", "Bed"], ["partition", "Partition, TV & drawers"], ["desk", "Desk & chair"], ["study", "Study wall"], ["wardrobes", "Wardrobes"], ["mirror", "Mirror"]];
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
    const st = Object.assign({ theme: "light", room: true, fsize: false, clr: true, lights: false, bed: true, partition: true, desk: true, study: true, wardrobes: true, mirror: true }, load() || {});
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
