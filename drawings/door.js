// Door D1–D3 — parametric drawing sheet (A3 landscape, paper units = mm).
// Change DOOR values and the whole sheet redraws.

window.DRAWINGS = window.DRAWINGS || {};

const DOOR = {
  rev: "1 — main door 8 ft × 3 ft",
  date: "17.09.2026",
  // D1 main door: 8 ft × 3 ft opening (2438 × 914). D2, D3: same design, 8 ft × 2 ft 6 in (2438 × 762).
  leaves: 2,          // reference is a pair of narrow leaves — pair vs single still to confirm
  W: 457,             // leaf width (914 / 2)
  H: 2438,            // leaf height (8 ft)
  T: 45,              // leaf thickness
  stile: 100,
  topRail: 100,
  upperH: 1223,       // sized so the knob centre sits 1000 above the floor
  lockRail: 230,
  lowerH: 655,        // bottom rail = what's left
  sticking: 20,       // ovolo sticking moulding around each panel
  inset: 26,          // shaped bead line, inset from the panel field
  notchR: 26,         // concave shoulder radius (around the roundel)
  crown: 34,          // rise of the rounded crown above the shoulders
  roundel: 9,         // corner roundel radius
  panelT: 18,
  rebate: 12,         // meeting-stile rebate (pair only)
  knobD: 55,
  knobFromEdge: 130,
  architrave: 75,
};

(function () {
  const D = DOOR;
  const bottomRail = D.H - D.topRail - D.upperH - D.lockRail - D.lowerH;
  const lockY = D.topRail + D.upperH + D.lockRail / 2;   // from top of leaf
  const INK = "#1b1b1b", THIN = "#666", DIM = "#8a3a22";
  const FONT = "Helvetica, Arial, sans-serif";

  // ── helpers ──
  const f = (n) => +(+n).toFixed(2);
  const text = (x, y, s, o = {}) =>
    `<text x="${f(x)}" y="${f(y)}" font-size="${o.size || 2.2}" text-anchor="${o.anchor || "start"}" fill="${o.fill || INK}" font-weight="${o.weight || 400}" letter-spacing="${o.ls || 0}" font-family="${FONT}"${o.rot ? ` transform="rotate(-90 ${f(x)} ${f(y)})"` : ""}>${s}</text>`;
  // A view maps real mm to paper mm at 1:s with origin (ox, oy).
  const CAD = (window.CAD = window.CAD || { sheet: null, views: [] });
  CAD.sheet = "door";
  const view = (ox, oy, s, name) => ({
    X: (x) => f(ox + x / s), Y: (y) => f(oy + y / s),
    g: (inner, w = 0.3) => (name && CAD.views.push({ sheet: "door", name, scale: s, svg: inner }), `<g transform="translate(${ox} ${oy}) scale(${1 / s})" stroke="${INK}" stroke-width="${w * s}" fill="none" stroke-linejoin="round" stroke-linecap="round">${inner}</g>`),
    w: (paperW) => paperW * s,   // paper stroke width -> local units
  });
  const tick = (x, y) => `<line x1="${f(x - 1)}" y1="${f(y + 1)}" x2="${f(x + 1)}" y2="${f(y - 1)}" stroke-width="0.3"/>`;
  // Horizontal dim chain: xs in paper, labels = real values. ext = where extension lines reach to (paper y).
  function chainH(xs, y, labels, o = {}) {
    let g = `<line x1="${xs[0] - 1.5}" y1="${y}" x2="${xs[xs.length - 1] + 1.5}" y2="${y}"/>`;
    xs.forEach((x) => { g += `<line x1="${x}" y1="${o.from ?? y - 2}" x2="${x}" y2="${y + 1.2}"/>` + tick(x, y); });
    let t = "";
    labels.forEach((l, i) => { t += text((xs[i] + xs[i + 1]) / 2, y - 0.8, l, { size: o.size || 1.7, anchor: "middle", fill: DIM }); });
    return `<g stroke="${DIM}" stroke-width="0.13">${g}</g>${t}`;
  }
  function chainV(ys, x, labels, o = {}) {
    let g = `<line x1="${x}" y1="${ys[0] - 1.5}" x2="${x}" y2="${ys[ys.length - 1] + 1.5}"/>`;
    ys.forEach((y) => { g += `<line x1="${o.from ?? x - 2}" y1="${y}" x2="${x + 1.2}" y2="${y}"/>` + tick(x, y); });
    let t = "";
    labels.forEach((l, i) => { t += text(x - 0.8, (ys[i] + ys[i + 1]) / 2, l, { size: o.size || 1.7, anchor: "middle", fill: DIM, rot: true }); });
    return `<g stroke="${DIM}" stroke-width="0.13">${g}</g>${t}`;
  }
  const bubble = (x, y, n) =>
    `<circle cx="${f(x)}" cy="${f(y)}" r="2" fill="#fff" stroke="${INK}" stroke-width="0.2"/>${text(x, y + 0.75, n, { size: 2, anchor: "middle", weight: 700 })}`;
  const note = (x1, y1, x2, y2, l1, l2, anchor = "start") => {
    const tx = anchor === "end" ? x2 - 1 : x2 + 1;
    return `<g stroke="${INK}" stroke-width="0.13"><line x1="${f(x1)}" y1="${f(y1)}" x2="${f(x2)}" y2="${f(y2)}"/></g><circle cx="${f(x1)}" cy="${f(y1)}" r="0.4" fill="${INK}"/>` +
      text(tx, y2 + 0.2, l1, { size: 1.7, anchor }) + (l2 ? text(tx, y2 + 2.5, l2, { size: 1.45, fill: THIN, anchor }) : "");
  };
  const heading = (x, y, t, sub) => text(x, y, t, { size: 3.4, weight: 700, ls: 0.3 }) + `<line x1="${x}" y1="${y + 1.6}" x2="${x + 60}" y2="${y + 1.6}" stroke="${INK}" stroke-width="0.35"/>` + text(x, y + 5, sub, { size: 1.8, fill: THIN, ls: 0.2 });

  // Shaped bead: vertical sides; at head and foot a concave shoulder (around the
  // roundel) rising into a rounded crown. Real mm.
  function shapedPath(L, T, R, B) {
    const r = D.notchR, k = D.crown, cx = (L + R) / 2, run = cx - (L + r);
    return [
      `M ${L} ${B - r}`, `L ${L} ${T + r}`,
      `A ${r} ${r} 0 0 0 ${L + r} ${T}`,
      `C ${L + r + run * 0.5} ${T} ${cx - run * 0.62} ${T - k} ${cx} ${T - k}`,
      `C ${cx + run * 0.62} ${T - k} ${R - r - run * 0.5} ${T} ${R - r} ${T}`,
      `A ${r} ${r} 0 0 0 ${R} ${T + r}`, `L ${R} ${B - r}`,
      `A ${r} ${r} 0 0 0 ${R - r} ${B}`,
      `C ${R - r - run * 0.5} ${B} ${cx + run * 0.62} ${B + k} ${cx} ${B + k}`,
      `C ${cx - run * 0.62} ${B + k} ${L + r + run * 0.5} ${B} ${L + r} ${B}`,
      `A ${r} ${r} 0 0 0 ${L} ${B - r}`, "Z",
    ].join(" ");
  }
  // Bead positions for a panel opening.
  const bead = (x0, y0, w, h) => {
    const s = D.sticking, i = D.inset, k = D.crown;
    return { L: x0 + s + i, R: x0 + w - s - i, T: y0 + s + i + k, B: y0 + h - s - i - k };
  };

  // One panel: opening, sticking, mitres, shaped bead, four roundels.
  function panel(x0, y0, w, h, thin) {
    const s = D.sticking, { L, R, T, B } = bead(x0, y0, w, h);
    let out = `<rect x="${x0}" y="${y0}" width="${w}" height="${h}"/>`;
    out += `<g stroke-width="${thin}"><rect x="${x0 + s}" y="${y0 + s}" width="${w - 2 * s}" height="${h - 2 * s}"/>`;
    out += [[0, 0, 1, 1], [w, 0, -1, 1], [0, h, 1, -1], [w, h, -1, -1]]
      .map(([dx, dy, sx, sy]) => `<line x1="${x0 + dx}" y1="${y0 + dy}" x2="${x0 + dx + sx * s}" y2="${y0 + dy + sy * s}"/>`).join("") + `</g>`;
    out += `<path d="${shapedPath(L, T, R, B)}"/>`;
    const rx = D.notchR * 0.1;
    out += [[L + rx, T - D.notchR * 0.1], [R - rx, T - D.notchR * 0.1], [L + rx, B + D.notchR * 0.1], [R - rx, B + D.notchR * 0.1]]
      .map(([cx, cy]) => `<circle cx="${cx}" cy="${cy}" r="${D.roundel}"/><circle cx="${cx}" cy="${cy}" r="${D.roundel * 0.4}" stroke-width="${thin}"/>`).join("");
    return out;
  }

  function hardware(kx, ex, ky, thin) {
    return `<circle cx="${kx}" cy="${ky}" r="${D.knobD / 2}"/><circle cx="${kx}" cy="${ky}" r="${D.knobD / 2 - 10}" stroke-width="${thin}"/>` +
      `<circle cx="${ex}" cy="${ky}" r="17"/><path stroke-width="${thin}" d="M ${ex - 3} ${ky - 1} A 4.5 4.5 0 1 1 ${ex + 3} ${ky - 1} L ${ex + 4.5} ${ky + 10} L ${ex - 4.5} ${ky + 10} Z"/>`;
  }

  function leaf(x, active, thin) {
    const pw = D.W - 2 * D.stile;
    let out = `<rect x="${x}" y="0" width="${D.W}" height="${D.H}"/>`;
    out += `<g stroke-width="${thin}">
      <line x1="${x + D.stile}" y1="${D.topRail}" x2="${x + D.W - D.stile}" y2="${D.topRail}"/>
      <line x1="${x + D.stile}" y1="${D.H - bottomRail}" x2="${x + D.W - D.stile}" y2="${D.H - bottomRail}"/>
      <line x1="${x + D.stile}" y1="${D.topRail + D.upperH}" x2="${x + D.stile}" y2="${D.topRail + D.upperH + D.lockRail}"/>
      <line x1="${x + D.W - D.stile}" y1="${D.topRail + D.upperH}" x2="${x + D.W - D.stile}" y2="${D.topRail + D.upperH + D.lockRail}"/>
      <line x1="${x + D.stile}" y1="0" x2="${x + D.stile}" y2="${D.topRail}"/><line x1="${x + D.W - D.stile}" y1="0" x2="${x + D.W - D.stile}" y2="${D.topRail}"/>
      <line x1="${x + D.stile}" y1="${D.H - bottomRail}" x2="${x + D.stile}" y2="${D.H}"/><line x1="${x + D.W - D.stile}" y1="${D.H - bottomRail}" x2="${x + D.W - D.stile}" y2="${D.H}"/>
    </g>`;
    out += panel(x + D.stile, D.topRail, pw, D.upperH, thin) + panel(x + D.stile, D.topRail + D.upperH + D.lockRail, pw, D.lowerH, thin);
    if (active) out += hardware(x + D.knobFromEdge, x + 42, lockY, thin);
    return out;
  }

  let svg = `<rect x="0" y="0" width="420" height="297" fill="#fff"/>`;
  svg += `<rect x="8" y="8" width="404" height="281" fill="none" stroke="${INK}" stroke-width="0.5"/>`;

  // ═══ VIEW 1 · FRONT ELEVATION 1:10 ═══
  const s1 = 12, total = D.W * D.leaves, a = D.architrave;
  const v1 = view(50, 36, s1, "Front elevation"), t1 = v1.w(0.13);
  let e = "";
  e += `<path d="M ${-a} ${D.H} L ${-a} ${-a} L ${total + a} ${-a} L ${total + a} ${D.H}" stroke-dasharray="${v1.w(2)} ${v1.w(1)}" stroke-width="${t1}"/>`;
  for (let i = 0; i < D.leaves; i++) e += leaf(i * D.W, i === 0, t1);
  if (D.leaves === 2) e += `<line x1="${D.W + 6}" y1="0" x2="${D.W + 6}" y2="${D.H}" stroke-width="${t1}"/>`;
  e += `<line x1="${-a - 180}" y1="${D.H}" x2="${total + a + 180}" y2="${D.H}" stroke-width="${v1.w(0.6)}"/>`;
  svg += v1.g(e, 0.3);
  svg += heading(22, 17, "FRONT ELEVATION", `${D.leaves === 2 ? "PAIR OF LEAVES" : "SINGLE LEAF"} · SCALE 1:${s1}`);
  svg += text(v1.X(-a - 180), v1.Y(D.H) - 1, "FFL ±0", { size: 1.6, fill: THIN });

  // section / detail markers
  const cutY = v1.Y(D.topRail + 560);
  svg += `<g stroke="${INK}" stroke-width="0.5"><line x1="${v1.X(-a) - 7}" y1="${cutY}" x2="${v1.X(-a) - 2}" y2="${cutY}"/><line x1="${v1.X(total + a) + 2}" y1="${cutY}" x2="${v1.X(total + a) + 7}" y2="${cutY}"/></g>`;
  svg += text(v1.X(-a) - 8, cutY + 1, "B", { size: 2.8, anchor: "end", weight: 700 }) + text(v1.X(total + a) + 8, cutY + 1, "B", { size: 2.8, weight: 700 });
  const dA = { x: v1.X(D.W / 2), y: v1.Y(D.topRail + 90), r: 5.5 };
  svg += `<circle cx="${dA.x}" cy="${dA.y}" r="${dA.r}" fill="none" stroke="${INK}" stroke-width="0.2" stroke-dasharray="1 .7"/>` + text(dA.x - 6.5, dA.y - 4, "A", { size: 2.6, weight: 700, anchor: "end" });
  const dC = { x: v1.X(D.W / 2), y: v1.Y(lockY) };
  svg += `<rect x="${v1.X(0) - 1.5}" y="${v1.Y(D.topRail + D.upperH) - 1.5}" width="${D.W / s1 + 3}" height="${D.lockRail / s1 + 3}" fill="none" stroke="${INK}" stroke-width="0.2" stroke-dasharray="1 .7"/>` + text(v1.X(0) - 2.5, v1.Y(D.topRail + D.upperH) - 0.5, "C", { size: 2.6, weight: 700, anchor: "end" });

  // dims — below
  const yd = v1.Y(D.H);
  svg += chainH([0, D.stile, D.W - D.stile, D.W].map(v1.X), yd + 7, [D.stile, D.W - 2 * D.stile, D.stile], { from: yd + 2 });
  svg += chainH(Array.from({ length: D.leaves + 1 }, (_, i) => v1.X(i * D.W)), yd + 13, Array(D.leaves).fill(D.W), { from: yd + 2 });
  svg += chainH([v1.X(0), v1.X(total)], yd + 19, [`${total} D1 · 3 FT (D2, D3: 762)`], { from: yd + 2 });
  // dims — right
  const xd = v1.X(total + a) + 12;
  svg += chainV([0, D.topRail, D.topRail + D.upperH, D.topRail + D.upperH + D.lockRail, D.H - bottomRail, D.H].map(v1.Y), xd,
    [D.topRail, D.upperH, D.lockRail, D.lowerH, bottomRail], { from: v1.X(total) + 2 });
  svg += chainV([v1.Y(0), v1.Y(D.H)], xd + 7, [`${D.H} LEAF · 8 FT`], { from: v1.X(total) + 2 });
  // dims — left: knob height
  svg += chainV([v1.Y(lockY), v1.Y(D.H)], v1.X(-a) - 14, [`${D.H - lockY} KNOB C/L`], { from: v1.X(D.knobFromEdge) });

  // bubbles, placed on the right leaf (left leaf keeps hardware clear)
  const rx = D.leaves === 2 ? D.W : 0;
  [
    [1, rx + D.W - D.stile / 2, 900], [2, rx + D.W / 2, D.topRail / 2], [3, rx + D.W / 2, 700],
    [4, rx + D.W / 2, lockY], [5, rx + D.W / 2, D.topRail + D.upperH + D.lockRail + D.lowerH / 2],
    [6, rx + D.W / 2, D.H - bottomRail / 2], [9, D.W + 6, 1650], [10, -a / 2, 900],
  ].forEach(([n, x, y]) => { svg += bubble(v1.X(x), v1.Y(y), n); });
  svg += note(v1.X(D.knobFromEdge), v1.Y(lockY), v1.X(-a) - 3, v1.Y(lockY) - 14, "", "", "end") + bubble(v1.X(-a) - 5, v1.Y(lockY) - 14, 7);
  svg += note(v1.X(42), v1.Y(lockY) + 1, v1.X(-a) - 3, v1.Y(lockY) + 12, "", "", "end") + bubble(v1.X(-a) - 5, v1.Y(lockY) + 12, 8);

  // ═══ VIEW 2 · DETAIL A — PANEL HEAD 1:2.5 ═══
  const s2 = 3, pw = D.W - 2 * D.stile, px = D.stile, py = D.topRail;
  const v2 = view(186 - (px - 45) / s2, 44 - (py - 40) / s2, s2, "Panel head - detail A"), t2 = v2.w(0.13);
  const cut = py + 175;
  let d2 = `<clipPath id="clipA"><rect x="${px - 45}" y="${py - 40}" width="${pw + 90}" height="${cut - py + 40}"/></clipPath>`;
  d2 += `<g clip-path="url(#clipA)"><rect x="0" y="0" width="${D.W}" height="${D.H}"/><line x1="${px}" y1="0" x2="${px}" y2="${py}" stroke-width="${t2}"/><line x1="${px + pw}" y1="0" x2="${px + pw}" y2="${py}" stroke-width="${t2}"/>${panel(px, py, pw, D.upperH, t2)}</g>`;
  d2 += `<path stroke-width="${t2}" d="M ${px - 45} ${cut} L ${px + pw / 2 - 12} ${cut} L ${px + pw / 2 - 4} ${cut - 12} L ${px + pw / 2 + 4} ${cut + 12} L ${px + pw / 2 + 12} ${cut} L ${px + pw + 45} ${cut}"/>`;
  svg += v2.g(d2, 0.35);
  svg += heading(170, 17, "DETAIL A — PANEL HEAD", `SCALE 1:${s2} · FOOT OF PANEL IS THE MIRROR`);
  const b = bead(px, py, pw, D.upperH);
  const topY = v2.Y(py - 40) - 3;
  svg += chainH([px, px + D.sticking, b.L, b.R, px + pw - D.sticking, px + pw].map(v2.X), topY,
    [D.sticking, D.inset, b.R - b.L, D.inset, D.sticking], { from: v2.Y(py) - 1, size: 1.5 });
  svg += chainH([px, px + pw].map(v2.X), topY - 6, [`${pw} PANEL OPENING`], { from: topY - 1 });
  const rxD = v2.X(px + pw + 45) + 6;
  svg += chainV([py, py + D.sticking + D.inset, b.T, b.T + D.notchR].map(v2.Y), rxD,
    [D.sticking + D.inset, D.crown, `R${D.notchR}`], { from: v2.X(px + pw) + 1, size: 1.5 });
  svg += note(v2.X(b.L + D.notchR * 0.1 - D.roundel * 0.7), v2.Y(b.T - D.notchR * 0.1 - D.roundel * 0.7), v2.X(px - 45) - 4, v2.Y(py + 10), `ROUNDEL Ø${D.roundel * 2}`, "CARVED BOSS, 4 PER PANEL", "end");
  svg += note(v2.X((b.L + b.R) / 2 - 20), v2.Y(b.T - D.crown + 3), v2.X(px - 45) - 4, v2.Y(py + 55), "ROUNDED CROWN", "SHAPED BEAD LINE", "end");
  svg += note(v2.X(b.L + D.notchR * 0.3), v2.Y(b.T + D.notchR * 0.7), v2.X(px - 45) - 4, v2.Y(py + 100), `CONCAVE SHOULDER R${D.notchR}`, "WRAPS THE ROUNDEL", "end");
  svg += note(v2.X(px + 10), v2.Y(py + 150), v2.X(px - 45) - 4, v2.Y(py + 140), `OVOLO STICKING ${D.sticking}`, "MITRED AT CORNERS", "end");
  svg += note(v2.X(px + pw / 2 + 50), v2.Y(py + 150), v2.X(px + pw + 45) + 3, v2.Y(py + 160), "SUNK FIELD", `PANEL ${D.panelT} THK`);

  // ═══ VIEW 3 · SECTION B–B 1:3 ═══
  const s3 = 4, T3 = D.T, pT = D.panelT, z0 = (T3 - pT) / 2, st = D.sticking, g = 12, reb = D.rebate;
  const v3 = view(192, 160, s3, "Section B-B"), t3 = v3.w(0.13);
  let d3 = `<pattern id="grain" patternUnits="userSpaceOnUse" width="14" height="9"><path d="M0 3 Q7 1 14 3 M0 7.5 Q7 5.5 14 7.5" stroke="#aaa" stroke-width="${t3}" fill="none"/></pattern>`;
  // stile: outer edge xo, inner (panel) edge xi. meet: "front" = front half projects by reb, "back" = back half projects.
  const stile = (xo, xi, meet) => {
    const dir = Math.sign(xi - xo), q = 2;
    const front = meet === "front" ? xo - dir * reb : xo, back = meet === "back" ? xo - dir * reb : xo;
    return `<path fill="url(#grain)" d="M ${front} 0 L ${xi - dir * st} 0 L ${xi - dir * st} ${q} Q ${xi} ${q} ${xi} ${z0} L ${xi} ${T3 - z0} Q ${xi} ${T3 - q} ${xi - dir * st} ${T3 - q} L ${xi - dir * st} ${T3} L ${back} ${T3} ${meet ? `L ${back} ${T3 / 2} L ${front} ${T3 / 2}` : ""} Z"/>` +
      `<rect x="${Math.min(xi, xi + dir * g)}" y="${z0}" width="${g}" height="${pT}" stroke-width="${t3}" stroke-dasharray="${v3.w(0.8)} ${v3.w(0.5)}"/>`;
  };
  d3 += stile(0, D.stile) + stile(D.W, D.W - D.stile, D.leaves === 2 ? "front" : null);
  d3 += `<rect x="${D.stile + 1}" y="${z0}" width="${pw - 2}" height="${pT}" fill="url(#grain)"/>`;
  [b.L, b.R].forEach((bx) => { d3 += `<path stroke-width="${t3}" d="M ${bx - 3} ${z0} L ${bx} ${z0 + 2.5} L ${bx + 3} ${z0}"/>`; });
  if (D.leaves === 2) {
    const x2 = D.W, show = 150;
    d3 += `<clipPath id="clipB"><rect x="${x2 - 20}" y="-20" width="${D.stile + show + 20}" height="${T3 + 40}"/></clipPath>`;
    d3 += `<g clip-path="url(#clipB)">${stile(x2, x2 + D.stile, "back")}<rect x="${x2 + D.stile + 1}" y="${z0}" width="${pw}" height="${pT}" fill="url(#grain)"/></g>`;
    d3 += `<circle cx="${x2 - reb + 5}" cy="-4" r="5" fill="#fff"/>`;
    const bx = x2 + D.stile + show;
    d3 += `<path stroke-width="${t3}" d="M ${bx} -12 L ${bx} ${T3 / 2 - 8} L ${bx - 8} ${T3 / 2 - 3} L ${bx + 8} ${T3 / 2 + 3} L ${bx} ${T3 / 2 + 8} L ${bx} ${T3 + 12}"/>`;
  }
  svg += v3.g(d3, 0.3);
  svg += heading(170, 128, "SECTION B–B", `HORIZONTAL THROUGH UPPER PANELS · SCALE 1:${s3}`);
  svg += text(v3.X(0), v3.Y(T3) + 14, "↑ ROOM SIDE (FACE SHOWN IN ELEVATION)", { size: 1.45, fill: THIN });
  svg += chainV([v3.Y(0), v3.Y(z0), v3.Y(z0 + pT), v3.Y(T3)], v3.X(0) - 6, ["", pT, ""], { from: v3.X(0) - 1, size: 1.4 });
  svg += chainV([v3.Y(0), v3.Y(T3)], v3.X(0) - 12, [T3], { from: v3.X(0) - 1, size: 1.5 });
  svg += chainH([0, D.stile, D.W - D.stile, D.W].map(v3.X), v3.Y(T3) + 7, [D.stile, pw, D.stile], { from: v3.Y(T3) + 1 });
  svg += note(v3.X(D.stile - 6), v3.Y(3), v3.X(D.stile - 30), v3.Y(0) - 12, "OVOLO STICKING", `${st} × ${z0} BOTH FACES`, "end");
  svg += note(v3.X(D.stile + 4), v3.Y(T3 / 2), v3.X(D.stile + 150), v3.Y(0) - 5, `PANEL ${pT} IN ${g} GROOVE`, "LOOSE — ALLOWS MOVEMENT");
  svg += note(v3.X(b.L), v3.Y(z0 + 1), v3.X(b.L + 30), v3.Y(0) - 12, "V-GROOVE (SHAPED BEAD)", "3 WIDE × 2.5 DEEP, BOTH FACES");
  if (D.leaves === 2) {
    svg += note(v3.X(D.W - reb + 5), v3.Y(-8), v3.X(D.W + 20), v3.Y(0) - 12, "MEETING BEAD Ø10", `${reb} REBATE, HALF THICKNESS`);
  }

  // ═══ VIEW 4 · DETAIL C — LOCK RAIL 1:5 ═══
  const s4 = 6, y0 = D.topRail + D.upperH - 60, y1 = D.topRail + D.upperH + D.lockRail + 60;
  const v4 = view(180, 210 - y0 / s4, s4, "Lock rail - detail C"), t4 = v4.w(0.13);
  let d4 = `<clipPath id="clipC"><rect x="-10" y="${y0}" width="${D.W + 20}" height="${y1 - y0}"/></clipPath>`;
  d4 += `<g clip-path="url(#clipC)">${leaf(0, true, t4)}</g>`;
  svg += v4.g(d4, 0.3);
  svg += heading(170, 199, "DETAIL C — LOCK RAIL", `SCALE 1:${s4} · ACTIVE LEAF`);
  svg += chainH([0, 42, D.knobFromEdge].map(v4.X), v4.Y(y1) + 5, [42, D.knobFromEdge - 42], { from: v4.Y(lockY) });
  svg += chainV([D.topRail + D.upperH, lockY, D.topRail + D.upperH + D.lockRail].map(v4.Y), v4.X(D.W) + 6, [D.lockRail / 2, D.lockRail / 2], { from: v4.X(D.W) + 1 });
  svg += note(v4.X(D.knobFromEdge + D.knobD / 2 - 4), v4.Y(lockY - 18), v4.X(D.W) + 12, v4.Y(lockY - 60), `KNOB Ø${D.knobD}`, "EBONISED / BRASS — TBC");
  svg += note(v4.X(42), v4.Y(lockY + 14), v4.X(D.W) + 12, v4.Y(lockY + 60), "ESCUTCHEON Ø34", "KEYHOLE, MORTICE LOCK");

  // ═══ KEY / NOTES / TITLE ═══
  const kx = 348;
  svg += heading(kx, 17, "KEY", "PARTS OF THE LEAF");
  [
    "Stile", "Top rail", "Upper panel — shaped bead, 4 roundels", "Lock rail", "Lower panel — same pattern",
    "Bottom rail", `Knob Ø${D.knobD}`, "Keyhole escutcheon", "Meeting bead (pair only)", "Architrave — to design",
  ].forEach((l, i) => { svg += bubble(kx + 2, 29 + i * 5.6, i + 1) + text(kx + 6, 29.7 + i * 5.6, l, { size: 1.8 }); });
  svg += heading(kx, 94, "NOTES", "READ BEFORE MAKING");
  [
    "All dimensions in mm. Do not scale.",
    "Proportions taken from a film-still reference;",
    "   leaf size, opening and thickness are ASSUMED.",
    "Knob height follows reference (low) — to confirm.",
    "D1, D2, D3 identical.",
    "Solid teak frame. Veneer and polish per",
    "   Materials; polish to match the teak desk.",
    "Architrave, hinges and lock not yet designed.",
  ].forEach((n, i) => { svg += text(kx, 105 + i * 4.2, n, { size: 1.7 }); });

  const tb = { x: 300, y: 239, w: 112, h: 50 };
  svg += `<g stroke="${INK}" stroke-width="0.3" fill="none"><rect x="${tb.x}" y="${tb.y}" width="${tb.w}" height="${tb.h}"/>
    <line x1="${tb.x}" y1="${tb.y + 14}" x2="${tb.x + tb.w}" y2="${tb.y + 14}"/><line x1="${tb.x}" y1="${tb.y + 30}" x2="${tb.x + tb.w}" y2="${tb.y + 30}"/>
    <line x1="${tb.x}" y1="${tb.y + 40}" x2="${tb.x + tb.w}" y2="${tb.y + 40}"/><line x1="${tb.x + 56}" y1="${tb.y + 30}" x2="${tb.x + 56}" y2="${tb.y + 50}"/></g>`;
  svg += text(tb.x + 3, tb.y + 6.5, "A STUDY IN TEAK", { size: 3.4, weight: 700, ls: 0.6 });
  svg += text(tb.x + 3, tb.y + 11, "Particulars of the room", { size: 1.9, fill: THIN });
  svg += text(tb.x + 3, tb.y + 20.5, "DOORS D1 – D3", { size: 3.4, weight: 700, ls: 0.3 });
  svg += text(tb.x + 3, tb.y + 26, "Elevation · Panel head · Section · Lock rail", { size: 2, fill: THIN });
  svg += text(tb.x + 3, tb.y + 34, "SCALE", { size: 1.5, fill: THIN }) + text(tb.x + 3, tb.y + 38, "AS NOTED @ A3", { size: 2.1 });
  svg += text(tb.x + 59, tb.y + 34, "DATE", { size: 1.5, fill: THIN }) + text(tb.x + 59, tb.y + 38, D.date, { size: 2.1 });
  svg += text(tb.x + 3, tb.y + 44, "REV", { size: 1.5, fill: THIN }) + text(tb.x + 3, tb.y + 48, D.rev, { size: 1.8 });
  svg += text(tb.x + 59, tb.y + 44, "DWG", { size: 1.5, fill: THIN }) + text(tb.x + 59, tb.y + 48, "AST-DR-001", { size: 2.1, weight: 700 });

  window.DRAWINGS.door = {
    title: "Doors D1–D3 · AST-DR-001",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 420 297" class="sheet">${svg}</svg>`,
    params: DOOR,
  };
})();
