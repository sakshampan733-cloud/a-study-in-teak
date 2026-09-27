// The suite in plan — bedroom, dressing, bathroom, tunnel — with layers the viewer switches on and off:
// measurements, the ceiling lights, and each piece of furniture on its own. Mounted on the overview.
// Same shell as the Blender skeleton (tools/walk/skeleton.py). Real-world mm; x east from the bedroom's
// left wall at the study end, y (= s) south from the study wall — so the study is at the top.
(function () {
  const INK = "#1b1b1b", DIM = "#8a3a22", LIGHT = "#cc6437", WOOD = "#3a2e22", FILL = "#f1ece0", THIN = "#8c8c8c";
  const f = (n) => +(+n).toFixed(1);
  const ftin = (mm) => (window.DK && window.DK.mmToFt ? window.DK.mmToFt(mm) : `${Math.round(mm)}`);

  // ── the shell ──
  const T = 230, H = 2769;
  const xR = 4547, L = 5766, xLs = -50, xLb = -177, yS = 4600;
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
  const bedW = 1829, bedL = 1981, BT = 50;
  const PW = 2438, yPart = L - 3353, pR = 664, pTurn = 0.96, pT = 70;
  const bs = bedW / 2 + 50, bTh = (70 * Math.PI) / 180, bR = (Wb / 2 - bs) / Math.sin(bTh), tr = bR - BT / 2 - 25;
  const desk = { L: 2286, D: 914, h: 150 }; desk.back = yPart - pT / 2; desk.front = desk.back - desk.D;
  const study = { d: 280, book: 1489, pil: 240, xP2: xR - (70 + 1219) - 240 };
  const WD = { d: 686 };
  const mirror = { c: 674, w: 253, t: 25, off: 20 };

  const R = (x0, y0, x1, y1, a = "") => `<rect x="${f(Math.min(x0, x1))}" y="${f(Math.min(y0, y1))}" width="${f(Math.abs(x1 - x0))}" height="${f(Math.abs(y1 - y0))}" ${a}/>`;
  const poly = (pts) => "M " + pts.map((p) => `${f(p[0])} ${f(p[1])}`).join(" L ") + " Z";
  const T_ = (x, y, s, o = {}) => `<text x="${f(x)}" y="${f(y)}" font-size="${o.size || 120}" text-anchor="${o.anchor || "middle"}" fill="${o.fill || INK}" font-family="Mono, 'Roboto Mono', monospace" letter-spacing="-2"${o.rot ? ` transform="rotate(-90 ${f(x)} ${f(y)})"` : ""}${o.weight ? ` font-weight="${o.weight}"` : ""}>${s}</text>`;

  // dimension lines, in plan mm
  function dimH(x0, x1, y, from, label, o = {}) {
    const t = o.size || 110, g = `stroke="${DIM}" stroke-width="10"`;
    return `<g ${g}><line x1="${f(x0)}" y1="${f(y)}" x2="${f(x1)}" y2="${f(y)}"/>` +
      [x0, x1].map((x) => `<line x1="${f(x)}" y1="${f(from)}" x2="${f(x)}" y2="${f(y + (y > from ? 60 : -60))}"/><line x1="${f(x - 45)}" y1="${f(y + 45)}" x2="${f(x + 45)}" y2="${f(y - 45)}" stroke-width="16"/>`).join("") + `</g>` +
      T_((x0 + x1) / 2, y - 40, label || ftin(Math.abs(x1 - x0)), { size: t, fill: DIM });
  }
  function dimV(y0, y1, x, from, label, o = {}) {
    const t = o.size || 110, g = `stroke="${DIM}" stroke-width="10"`;
    return `<g ${g}><line x1="${f(x)}" y1="${f(y0)}" x2="${f(x)}" y2="${f(y1)}"/>` +
      [y0, y1].map((y) => `<line x1="${f(from)}" y1="${f(y)}" x2="${f(x + (x > from ? 60 : -60))}" y2="${f(y)}"/><line x1="${f(x - 45)}" y1="${f(y + 45)}" x2="${f(x + 45)}" y2="${f(y - 45)}" stroke-width="16"/>`).join("") + `</g>` +
      T_(x - 40, (y0 + y1) / 2, label || ftin(Math.abs(y1 - y0)), { size: t, fill: DIM, rot: true });
  }

  // ── layers ──
  function shell() {
    const outline = [[-T, -T], [E, -T], [E, TUN.y1 + T], [TUN.x0 - T, TUN.y1 + T], [TUN.x0 - T, L + T], [xLb - T, L + T], [xLb - T, yS], [xLs - T, yS]];
    const rooms = [[[0, 0], [xR, 0], [xR, L], [xLb, L], [xLb, yS], [xLs, yS]],
      [[DR.x0, DR.y0], [DR.x1, DR.y0], [DR.x1, DR.y1], [DR.x0, DR.y1]],
      [[BA.x0, BA.y0], [BA.x1, BA.y0], [BA.x1, BA.y1], [BA.x0, BA.y1]],
      [[TUN.x0, TUN.y0], [TUN.x1, TUN.y0], [TUN.x1, TUN.y1], [TUN.x0, TUN.y1]]];
    let o = R(-T - 40, -T - 40, E + 40, TUN.y1 + T + 40, `fill="none"`);
    o += `<path d="${[outline, ...rooms].map(poly).join(" ")}" fill-rule="evenodd" fill="${INK}"/>`;
    o += R(BA.x0, 0, BA.x0 + CHASE.d, CHASE.y1, `fill="${INK}"`);                         // the 7 in wall on the WC wall
    o += R(PIER.x0, BA.y1 - PIER.out, PIER.x1, BA.y1, `fill="${INK}"`);                    // the pier
    // openings, knocked back out of the walls
    const gap = (x0, y0, x1, y1) => R(x0, y0, x1, y1, `fill="#fff"`);
    o += gap(WIN.x0, -T, WIN.x1, 0) + gap(xLb - T, D1.y0, xLb, D1.y1) + gap(xR, D2.y0, DR.x0, D2.y1) + gap(D3.x0, BA.y1, D3.x1, DR.y0) +
      gap(TUN.x0, DR.y1, TUN.x1, TUN.y0) + gap(BWIN.x0, -T, BWIN.x1, 0);
    // windows: three lines in the wall
    [[WIN.x0, WIN.x1, ""], [BWIN.x0, BWIN.x1, ` stroke-dasharray="40 30"`]].forEach(([a, b, d]) => {
      [-T + 30, -T / 2, -30].forEach((y) => (o += `<line x1="${f(a)}" y1="${f(y)}" x2="${f(b)}" y2="${f(y)}" stroke="${INK}" stroke-width="12"${d}/>`));
      o += `<line x1="${f(a)}" y1="${-T}" x2="${f(a)}" y2="0" stroke="${INK}" stroke-width="12"/><line x1="${f(b)}" y1="${-T}" x2="${f(b)}" y2="0" stroke="${INK}" stroke-width="12"/>`;
    });
    // door linings
    o += R(xLb - T, D1.y0, xLb, D1.y0 + LIN, `fill="${WOOD}"`) + R(xLb - T, D1.y1 - LIN, xLb, D1.y1, `fill="${WOOD}"`);
    o += R(xR, D2.y0, DR.x0, D2.y0 + LIN, `fill="${WOOD}"`) + R(xR, D2.y1 - LIN, DR.x0, D2.y1, `fill="${WOOD}"`);
    o += R(D3.x0, BA.y1, D3.x0 + 38, DR.y0, `fill="${WOOD}"`) + R(D3.x1 - 38, BA.y1, D3.x1, DR.y0, `fill="${WOOD}"`);
    // doors, open, with their swings
    const swing = (hx, hy, ax, ay, ox, oy, w, sweep) =>
      `<path d="M ${f(ax)} ${f(ay)} A ${w} ${w} 0 0 ${sweep} ${f(ox)} ${f(oy)}" fill="none" stroke="${THIN}" stroke-width="10" stroke-dasharray="50 35"/>` +
      `<line x1="${f(hx)}" y1="${f(hy)}" x2="${f(ox)}" y2="${f(oy)}" stroke="${WOOD}" stroke-width="42"/>`;
    o += swing(xLb, D1.y1 - LIN, xLb, D1.y1 - LIN - D1.leaf, xLb + D1.leaf, D1.y1 - LIN, D1.leaf, 0);
    o += swing(DR.x0, D2.y1 - LIN, DR.x0, D2.y1 - LIN - D2.leaf, DR.x0 + D2.leaf, D2.y1 - LIN, D2.leaf, 1);
    o += swing(D3.x1 - 38, BA.y1, D3.x1 - 38 - D3.leaf, BA.y1, D3.x1 - 38, BA.y1 - D3.leaf, D3.leaf, 1);
    // the dressing dome, above — dashed
    const dc = (DR.y0 + DR.y1) / 2;
    o += R(DR.x0, dc - 762, DR.x1, dc + 762, `fill="none" stroke="${THIN}" stroke-width="10" stroke-dasharray="70 45"`);
    // room names
    o += T_(xR / 2, 3120, "BEDROOM", { size: 170, fill: "#6d6d6d" }) + T_((DR.x0 + DR.x1) / 2 - 300, dc - 180, "DRESSING", { size: 140, fill: "#6d6d6d" }) +
      T_(BA.x0 + 1650, 520, "BATHROOM", { size: 140, fill: "#6d6d6d" }) + T_((TUN.x0 + TUN.x1) / 2, (TUN.y0 + TUN.y1) / 2, "TUNNEL", { size: 120, fill: "#6d6d6d", rot: true }) +
      T_((DR.x0 + DR.x1) / 2 - 300, dc + 20, "DOME ABOVE", { size: 90, fill: THIN });
    return o;
  }

  const P = {
    bed() {
      let o = "";
      const bp = [];
      for (let i = 24; i >= 0; i--) { const a = bTh * (i / 24); bp.push([cx - bs - bR * Math.sin(a), L - (bR - bR * Math.cos(a)) - BT / 2]); }
      for (let i = 0; i <= 24; i++) { const a = bTh * (i / 24); bp.push([cx + bs + bR * Math.sin(a), L - (bR - bR * Math.cos(a)) - BT / 2]); }
      [-1, 1].forEach((sg) => {
        const ccx = cx + sg * bs, ccy = L - bR, ex = ccx + sg * tr;
        o += `<path d="M ${f(ccx)} ${f(ccy)} L ${f(ccx)} ${f(ccy + tr)} A ${f(tr)} ${f(tr)} 0 0 ${sg < 0 ? 1 : 0} ${f(ex)} ${f(ccy)} Z" fill="#e8dcc0" stroke="#8a6a2f" stroke-width="14"/>`;
      });
      o += `<path d="M ${bp.map((p) => `${f(p[0])} ${f(p[1])}`).join(" L ")}" fill="none" stroke="${WOOD}" stroke-width="${BT}" stroke-linecap="round"/>`;
      o += R(cx - bedW / 2, L - BT - 10 - bedL, cx + bedW / 2, L - BT - 10, `fill="${FILL}" stroke="${INK}" stroke-width="18"`);
      o += R(cx - bedW / 2 + 60, L - BT - 380, cx + bedW / 2 - 60, L - BT - 70, `fill="#fff" stroke="${THIN}" stroke-width="8"`);
      o += T_(cx, L - BT - 10 - bedL / 2, "BED", { size: 130 });
      o += `<g class="fdim">` + dimH(cx - bedW / 2, cx + bedW / 2, L - BT - 10 - bedL - 160, L - BT - 10 - bedL, "6'-0\" BED", { size: 95 }) +
        dimV(L - BT - 10 - bedL, L - BT - 10, cx - bedW / 2 - 170, cx - bedW / 2, "6'-6\"", { size: 95 }) +
        dimH(bx0, bx1, L - 560, L - 420, `${ftin(Wb)} BED-BACK`, { size: 95 }) + `</g>`;
      return o;
    },
    partition() {
      let o = "";
      const half = PW / 2, straight = half - pR * Math.sin(pTurn), pts = [];
      for (let i = 20; i >= 0; i--) { const a = -Math.PI / 2 - pTurn * (i / 20); pts.push([cx - straight + pR * Math.cos(a), L - (L - yPart - pR - pR * Math.sin(a))]); }
      for (let i = 0; i <= 20; i++) { const a = -Math.PI / 2 + pTurn * (i / 20); pts.push([cx + straight + pR * Math.cos(a), L - (L - yPart - pR - pR * Math.sin(a))]); }
      o += `<path d="M ${pts.map((p) => `${f(p[0])} ${f(p[1])}`).join(" L ")}" fill="none" stroke="${WOOD}" stroke-width="${pT}" stroke-linecap="round"/>`;
      o += R(cx - 614, yPart + 40, cx + 614, yPart + 90, `fill="#111"`);
      o += T_(cx, yPart + 260, "TV", { size: 100, fill: "#555" });
      o += `<g class="fdim">` + dimH(cx - PW / 2, cx + PW / 2, yPart - 150, yPart, "8'-0\" PARTITION", { size: 95 }) +
        dimV(yPart, L, xR - 380, yPart, "11'-0\"", { size: 95 }) + `</g>`;
      return o;
    },
    desk() {
      const x0 = cx - desk.L / 2, x1 = cx + desk.L / 2, y0 = desk.front, y1 = desk.back, h = desk.h;
      let o = `<path d="M ${f(x0 + h)} ${f(y0)} L ${f(x1 - h)} ${f(y0)} A ${h} ${h} 0 0 0 ${f(x1)} ${f(y0 + h)} L ${f(x1)} ${f(y1 - h)} A ${h} ${h} 0 0 0 ${f(x1 - h)} ${f(y1)} L ${f(x0 + h)} ${f(y1)} A ${h} ${h} 0 0 0 ${f(x0)} ${f(y1 - h)} L ${f(x0)} ${f(y0 + h)} A ${h} ${h} 0 0 0 ${f(x0 + h)} ${f(y0)} Z" fill="#d8c29a" stroke="${WOOD}" stroke-width="18"/>`;
      o += `<rect x="${f(cx - 280)}" y="${f(y0 - 440)}" width="560" height="560" rx="90" fill="#fff" stroke="${THIN}" stroke-width="12"/>`;
      o += T_(cx, (y0 + y1) / 2 + 40, "DESK", { size: 120 });
      o += `<g class="fdim">` + dimH(x0, x1, y0 - 520, y0, "7'-6\" DESK", { size: 95 }) + `</g>`;
      return o;
    },
    study() {
      let o = R(0, 0, xR, study.d, `fill="#efe6d4" stroke="${WOOD}" stroke-width="12"`);
      o += R(0, 0, study.book, study.d, `fill="#e3d4b6" stroke="${WOOD}" stroke-width="12"`);
      for (let i = 1; i < 4; i++) o += `<line x1="${f((study.book * i) / 4)}" y1="0" x2="${f((study.book * i) / 4)}" y2="${study.d}" stroke="${WOOD}" stroke-width="6" opacity=".5"/>`;
      [study.book, study.xP2].forEach((x) => (o += R(x - 25, 0, x + study.pil + 25, study.d + 50, `fill="#d9c7a3" stroke="${WOOD}" stroke-width="12"`)));
      o += T_(study.book / 2, study.d / 2 + 40, "BOOKCASE", { size: 90, fill: WOOD });
      return o;
    },
    wardrobes() {
      let o = "";
      const nx0 = D3.x1, sy0 = DR.y1 - WD.d;
      const bay = (x0, y0, x1, y1, hid) => R(x0, y0, x1, y1, `fill="${hid ? "#fff8ee" : "#e9e2d4"}" stroke="${WOOD}" stroke-width="12"${hid ? ` stroke-dasharray="40 25"` : ""}`);
      const nN = 3, wN = (DR.x1 - nx0) / nN;
      for (let i = 0; i < nN; i++) o += bay(nx0 + i * wN, DR.y0, nx0 + (i + 1) * wN, DR.y0 + WD.d);
      const nS = 4, wS = (DR.x1 - DR.x0) / nS;
      for (let i = 0; i < nS; i++) o += bay(DR.x0 + i * wS, sy0, DR.x0 + (i + 1) * wS, DR.y1, i === nS - 1);
      o += T_(DR.x1 - wS / 2, sy0 + WD.d / 2 + 30, "HIDDEN DOOR", { size: 75, fill: WOOD });
      o += `<g class="fdim">` + dimV(sy0, DR.y1, DR.x0 + 200, DR.x0 + 20, "2'-3\"", { size: 85 }) + `</g>`;
      return o;
    },
    mirror() {
      const xf = DR.x1 - mirror.off, xb = xf - mirror.t, cy = (DR.y0 + DR.y1) / 2, hx = mirror.c / 2, a = Math.PI / 4;
      let o = R(xb, cy - hx, xf, cy + hx, `fill="${WOOD}"`);
      [-1, 1].forEach((sg) => {
        const p0 = [xb, cy + sg * hx], p1 = [xb - mirror.w * Math.sin(a), cy + sg * (hx + mirror.w * Math.cos(a))];
        o += `<line x1="${f(p0[0])}" y1="${f(p0[1])}" x2="${f(p1[0])}" y2="${f(p1[1])}" stroke="${WOOD}" stroke-width="${mirror.t}"/>`;
      });
      return o + T_(xb - 330, cy + 35, "MIRROR", { size: 80, fill: WOOD });
    },
  };

  function lights() {
    const DES_W = 182 * 25.4, X = (i) => xR - (DES_W - i * 25.4), Y = (i) => i * 25.4;
    const cut = [[30.0, [30.4, 39.8, 86.2, 95.8, 142.4, 151.8]], [84.2, [70.5, 94.1, 117.5]], [97.2, [34.0, 154.0]], [117.6, [71.4, 118.6]],
      [136.4, [34.0, 154.0]], [145.8, [34.0, 154.0]], [174.5, [34.0, 154.0]], [183.8, [34.0, 154.0]]];
    let o = "";
    cut.forEach(([y, xs]) => xs.forEach((x) => (o += `<circle cx="${f(X(x))}" cy="${f(Y(y))}" r="62" fill="#fff" stroke="${LIGHT}" stroke-width="22"/><circle cx="${f(X(x))}" cy="${f(Y(y))}" r="18" fill="${LIGHT}"/>`)));
    // over the bed: not cut yet — drawn centred on the bed, where they will go
    [-229, 0, 229].forEach((d) => (o += `<circle cx="${f(cx + d)}" cy="${f(Y(168.3))}" r="62" fill="#fff" stroke="${LIGHT}" stroke-width="16" stroke-dasharray="30 22"/>`));
    return o;
  }

  function dims() {
    let o = "";
    const yt = -T - 260, yt2 = yt - 300;
    o += dimH(0, WIN.x0, yt, -T) + dimH(WIN.x0, xR, yt, -T, "4'-0\" WINDOW");
    o += dimH(0, xR, yt2, yt + 60, `${ftin(xR)} STUDY WALL`);
    o += dimH(BA.x0, BA.x1, yt2, -T, `${ftin(BA.x1 - BA.x0)} BATHROOM`);
    o += dimH(xLb, xR, L + T + 300, L + T, `${ftin(xR - xLb)} BED WALL`);
    o += dimV(0, L, xLb - T - 520, xLb - T, `${ftin(L)} BEDROOM`);
    o += dimV(D1.y0, D1.y1, xLb - T - 220, xLb - T, "3'-4\" D1");
    const xr = E + 280;
    o += dimV(0, BA.y1, xr, E, `${ftin(BA.y1)}`) + dimV(DR.y0, DR.y1, xr, E, `${ftin(DR.y1 - DR.y0)}`) + dimV(TUN.y0, TUN.y1, xr, E, `${ftin(TUN.y1 - TUN.y0)} TUNNEL`);
    o += dimH(DR.x0, DR.x1, (DR.y0 + DR.y1) / 2 + 380, (DR.y0 + DR.y1) / 2 + 300, `${ftin(DR.x1 - DR.x0)} DRESSING`);
    o += dimH(TUN.x0, TUN.x1, TUN.y1 + T + 260, TUN.y1 + T, "3'-0\"");
    // D2 and the wall beside it; the WC wall; the pier
    o += dimV(D2.y0, D2.y1, xR - 170, xR, "2'-10\" D2");
    o += dimV(D2.y1, L, xR - 170, xR, "2'-3\"", { size: 90 });
    o += dimV(CHASE.y1, BA.y1, BA.x0 + 420, BA.x0 + 20, "5'-4\"", { size: 95 });
    o += dimV(0, CHASE.y1, BA.x0 + 420, BA.x0 + CHASE.d + 20, "3'-7\"", { size: 95 });
    o += dimH(PIER.x1, BA.x1, BA.y1 - PIER.out - 160, BA.y1 - PIER.out, "3'-1\"", { size: 95 });
    o += dimV(BA.y1 - PIER.out, BA.y1, PIER.x0 - 150, PIER.x0, "3'-0\"", { size: 90 });
    o += T_(xR / 2, 3300, "CEILING 9'-1\"", { size: 95, fill: DIM });
    return o;
  }

  const PIECES = [
    ["bed", "Bed"], ["partition", "Partition & TV"], ["desk", "Desk & chair"], ["study", "Study wall"], ["wardrobes", "Wardrobes"], ["mirror", "Mirror"],
  ];
  const VB = [xLb - T - 800, -T - 800, E + 700 - (xLb - T - 800), TUN.y1 + T + 520 - (-T - 800)];

  function svg() {
    return `<svg class="p2d-svg" viewBox="${VB.join(" ")}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Plan of the suite">
      ${PIECES.map(([k]) => `<g class="L L-${k}">${P[k]()}</g>`).join("")}
      <g class="L L-shell">${shell()}</g>
      <g class="L L-lights">${lights()}</g>
      <g class="L L-dims">${dims()}</g></svg>`;
  }

  // ── the switches ──
  const KEY = "suite2d";
  const load = () => { try { return JSON.parse(localStorage.getItem(KEY) || "null"); } catch { return null; } };
  const save = (s) => { try { localStorage.setItem(KEY, JSON.stringify(s)); } catch {} };

  function mount(el) {
    const st = Object.assign({ dims: true, lights: false, bed: true, partition: true, desk: true, study: true, wardrobes: true, mirror: true }, load() || {});
    const btn = (k, label, cls = "") => `<button type="button" data-k="${k}" class="${cls}">${label}</button>`;
    el.innerHTML = `<div class="p2d-bar">
        <div class="p2d-grp"><span class="p2d-lbl">Show</span>${btn("dims", "Measurements")}${btn("lights", "Lights")}</div>
        <div class="p2d-grp"><span class="p2d-lbl">Furniture</span>${btn("all", "All", "act")}${btn("none", "None", "act")}${PIECES.map(([k, l]) => btn(k, l)).join("")}</div>
      </div>
      <div class="p2d-stage">${svg()}</div>
      <div class="p2d-key"><span><i class="k-light"></i>Light holes, cut</span><span><i class="k-light dash"></i>Over the bed — not cut yet</span><span><i class="k-dash"></i>Dome above · bathroom window not measured</span><span>Bathroom fittings to come</span></div>`;
    const apply = () => {
      Object.keys(st).forEach((k) => el.classList.toggle("off-" + k, !st[k]));
      el.querySelectorAll(".p2d-bar button[data-k]").forEach((b) => { const k = b.dataset.k; if (k in st) b.classList.toggle("on", !!st[k]); });
      save(st);
    };
    el.querySelector(".p2d-bar").addEventListener("click", (e) => {
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
