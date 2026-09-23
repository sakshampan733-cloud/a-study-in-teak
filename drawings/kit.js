// Shared drafting helpers for A3 sheets (paper units = mm).
// CAD capture: every named view records its geometry in real mm so it can be exported to DXF.
window.CAD = window.CAD || { sheet: null, views: [] };

window.DK = (function () {
  const INK = "#1b1b1b", THIN = "#666", DIM = "#8a3a22";
  const FONT = "Helvetica, Arial, sans-serif";
  const f = (n) => +(+n).toFixed(2);

  const text = (x, y, s, o = {}) =>
    `<text x="${f(x)}" y="${f(y)}" font-size="${o.size || 2.2}" text-anchor="${o.anchor || "start"}" fill="${o.fill || INK}" font-weight="${o.weight || 400}" letter-spacing="${o.ls || 0}" font-family="${FONT}"${o.cls ? ` class="${o.cls}"` : ""}${o.style ? ` font-style="${o.style}"` : ""}${o.rot ? ` transform="rotate(-90 ${f(x)} ${f(y)})"` : ""}>${s}</text>`;

  const CAD = window.CAD;
  const begin = (sheet) => { CAD.sheet = sheet; };
  const capture = (name, scale, svg) => { CAD.views.push({ sheet: CAD.sheet, name, scale, svg }); };
  // Maps real mm to paper mm at 1:s, origin (ox, oy). A named view is captured for CAD export.
  const view = (ox, oy, s, name) => ({
    s, X: (x) => f(ox + x / s), Y: (y) => f(oy + y / s),
    w: (paper) => paper * s,
    g: (inner, w = 0.3) => (name && capture(name, s, inner), `<g transform="translate(${ox} ${oy}) scale(${1 / s})" stroke="${INK}" stroke-width="${w * s}" fill="none" stroke-linejoin="round" stroke-linecap="round">${inner}</g>`),
  });

  // A label only fits inside its segment if the segment is longer than the text. Where it is not,
  // the label steps outward, alternating so that consecutive tight ones do not collide either.
  const runLen = (l, size) => String(l).length * size * 0.62;

  const tick = (x, y) => `<line x1="${f(x - 1)}" y1="${f(y + 1)}" x2="${f(x + 1)}" y2="${f(y - 1)}" stroke-width="0.3"/>`;

  // Feet and inches, to the nearest eighth — for the imperial view of every dimension.
  const FR = ["", "\u215B", "\u00BC", "\u215C", "\u00BD", "\u215D", "\u00BE", "\u215E"];
  function mmToFt(mm) {
    const total = Math.round((mm / 25.4) * 8) / 8;
    let ft = Math.floor(total / 12), rest = total - ft * 12;
    let whole = Math.floor(rest), eighths = Math.round((rest - whole) * 8);
    if (eighths === 8) { eighths = 0; whole += 1; }
    if (whole === 12) { whole = 0; ft += 1; }
    const inch = `${whole}${FR[eighths]}"`;
    return ft ? `${ft}'-${inch}` : inch;
  }
  // A chain label may be a bare number ("4547") or a number with words ("4547 WALL (14 FT 11 IN)").
  // The imperial version swaps the leading number for feet and inches and drops any bracketed repeat.
  function imperial(label) {
    const m = String(label).match(/^(\d+(?:\.\d+)?)(.*)$/);
    if (!m) return String(label);
    return mmToFt(+m[1]) + m[2].replace(/\s*\([^)]*(?:FT|IN)[^)]*\)/i, "");
  }
  const dimText = (x, y, l, o) =>
    text(x, y, l, { ...o, cls: "dk-mm" }) + text(x, y, imperial(l), { ...o, cls: "dk-in" });
  function chainH(xs, y, labels, o = {}) {
    let g = `<line x1="${f(xs[0] - 1.5)}" y1="${f(y)}" x2="${f(xs[xs.length - 1] + 1.5)}" y2="${f(y)}"/>`;
    xs.forEach((x) => { g += `<line x1="${f(x)}" y1="${f(o.from ?? y - 2)}" x2="${f(x)}" y2="${f(y + 1.2)}"/>` + tick(x, y); });
    let t = "";
    let step = 0;
    labels.forEach((l, i) => {
      if (l === "") return;
      const size = o.size || 1.7, span = Math.abs(xs[i + 1] - xs[i]);
      const out = runLen(l, size) > span ? (step++ % 2 ? 7.4 : 3.6) : 0;
      if (out) g += `<line x1="${f((xs[i] + xs[i + 1]) / 2)}" y1="${f(y - 1)}" x2="${f((xs[i] + xs[i + 1]) / 2)}" y2="${f(y - out + 0.6)}" stroke-dasharray="0.6 0.6"/>`;
      t += dimText((xs[i] + xs[i + 1]) / 2, y - 0.8 - out, l, { size, anchor: "middle", fill: DIM });
    });
    return `<g class="dk-dim"><g stroke="${DIM}" stroke-width="0.13">${g}</g>${t}</g>`;
  }
  function chainV(ys, x, labels, o = {}) {
    let g = `<line x1="${f(x)}" y1="${f(ys[0] - 1.5)}" x2="${f(x)}" y2="${f(ys[ys.length - 1] + 1.5)}"/>`;
    ys.forEach((y) => { g += `<line x1="${f(o.from ?? x - 2)}" y1="${f(y)}" x2="${f(x + 1.2)}" y2="${f(y)}"/>` + tick(x, y); });
    let t = "";
    let stepV = 0;
    labels.forEach((l, i) => {
      if (l === "") return;
      const size = o.size || 1.7, span = Math.abs(ys[i + 1] - ys[i]);
      const out = runLen(l, size) > span ? (stepV++ % 2 ? 7.4 : 3.6) : 0;
      if (out) g += `<line x1="${f(x - 1)}" y1="${f((ys[i] + ys[i + 1]) / 2)}" x2="${f(x - out + 0.6)}" y2="${f((ys[i] + ys[i + 1]) / 2)}" stroke-dasharray="0.6 0.6"/>`;
      t += dimText(x - 0.8 - out, (ys[i] + ys[i + 1]) / 2, l, { size, anchor: "middle", fill: DIM, rot: true });
    });
    return `<g class="dk-dim"><g stroke="${DIM}" stroke-width="0.13">${g}</g>${t}</g>`;
  }
  const bubble = (x, y, n) =>
    `<circle cx="${f(x)}" cy="${f(y)}" r="2" fill="#fff" stroke="${INK}" stroke-width="0.2"/>${text(x, y + 0.75, n, { size: 2, anchor: "middle", weight: 700 })}`;
  const note = (x1, y1, x2, y2, l1, l2, anchor = "start") => {
    const tx = anchor === "end" ? x2 - 1 : x2 + 1;
    return `<line x1="${f(x1)}" y1="${f(y1)}" x2="${f(x2)}" y2="${f(y2)}" stroke="${INK}" stroke-width="0.13"/><circle cx="${f(x1)}" cy="${f(y1)}" r="0.4" fill="${INK}"/>` +
      text(tx, y2 + 0.2, l1, { size: 1.7, anchor }) + (l2 ? text(tx, y2 + 2.5, l2, { size: 1.45, fill: THIN, anchor }) : "");
  };
  // ── label stacks ────────────────────────────────────────────────────────────
  // Hand-placing leaders always ends in collisions. Instead, labels are collected
  // against a gutter column: each keeps the height it wants where it can, and where
  // two would overlap they are pushed apart, in order, inside the band. The leader is
  // drawn as an elbow with a horizontal landing into the text, so it reads as one line.
  function labels(x, side = "right", yMin = 16, yMax = 280, o = {}) {
    const items = [], gap = o.gap ?? 2.4, land = o.land ?? 6;
    const api = {
      add(ax, ay, l1, l2) { if (l1) items.push({ ax, ay, l1, l2: l2 || "", h: l2 ? 6.4 : 3.2 }); return api; },
      draw() {
        if (!items.length) return "";
        items.sort((a, b) => a.ay - b.ay);
        let y = yMin;                                   // sweep down, never overlapping
        items.forEach((it) => { it.y = Math.max(it.ay - 0.8, y); y = it.y + it.h + gap; });
        const over = y - gap - yMax;
        if (over > 0) {                                 // ran off the bottom: sweep back up
          let top = yMax;
          for (let i = items.length - 1; i >= 0; i--) { items[i].y = Math.min(items[i].y, top - items[i].h); top = items[i].y - gap; }
        }
        const right = side === "right", elbow = right ? x - land : x + land, tx = right ? x + 1.6 : x - 1.6;
        return items.map((it) =>
          `<g stroke="${INK}" stroke-width="0.13" fill="none"><path d="M ${f(it.ax)} ${f(it.ay)} L ${f(elbow)} ${f(it.y)} L ${f(x)} ${f(it.y)}"/></g>` +
          `<circle cx="${f(it.ax)}" cy="${f(it.ay)}" r="0.45" fill="${INK}"/>` +
          text(tx, it.y + 0.6, it.l1, { size: 1.8, anchor: right ? "start" : "end" }) +
          (it.l2 ? text(tx, it.y + 3.4, it.l2, { size: 1.45, fill: THIN, anchor: right ? "start" : "end" }) : "")
        ).join("");
      },
    };
    return api;
  }

  const heading = (x, y, t, sub, w = 60) =>
    text(x, y, t, { size: 3.2, weight: 700, ls: 0.3 }) + `<line x1="${x}" y1="${y + 1.5}" x2="${x + w}" y2="${y + 1.5}" stroke="${INK}" stroke-width="0.35"/>` + text(x, y + 4.8, sub, { size: 1.7, fill: THIN, ls: 0.2 });
  const cutMark = (x, y, label, dir = "up") =>
    `<path d="M ${x - 3} ${y} L ${x + 3} ${y}" stroke="${INK}" stroke-width="0.5"/><path d="M ${x} ${y} l 0 ${dir === "up" ? -3 : 3} l -1 ${dir === "up" ? 1.2 : -1.2} m 1 ${dir === "up" ? -1.2 : 1.2} l 1 ${dir === "up" ? 1.2 : -1.2}" stroke="${INK}" stroke-width="0.3" fill="none"/>` + text(x + 4, y + 1, label, { size: 2.6, weight: 700 });

  const frame = () => `<rect x="0" y="0" width="420" height="297" fill="#fff"/><rect x="8" y="8" width="404" height="281" fill="none" stroke="${INK}" stroke-width="0.5"/>`;

  // Tagged so the build can tell the title block apart from anything drifting under it.
  const titleBlock = (o) => `<g data-tb="1">${titleBlockBody(o)}</g>`;
  function titleBlockBody(o) {
    const x = 300, y = 239, w = 112, h = 50;
    return `<g stroke="${INK}" stroke-width="0.3" fill="none"><rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#fff"/>
      <line x1="${x}" y1="${y + 14}" x2="${x + w}" y2="${y + 14}"/><line x1="${x}" y1="${y + 30}" x2="${x + w}" y2="${y + 30}"/>
      <line x1="${x}" y1="${y + 40}" x2="${x + w}" y2="${y + 40}"/><line x1="${x + 56}" y1="${y + 30}" x2="${x + 56}" y2="${y + 50}"/></g>` +
      text(x + 3, y + 6.5, "A STUDY IN TEAK", { size: 3.4, weight: 700, ls: 0.6 }) +
      text(x + 3, y + 11, "Particulars of the room", { size: 1.9, fill: THIN }) +
      text(x + 3, y + 20.5, o.title, { size: 3.4, weight: 700, ls: 0.3 }) +
      text(x + 3, y + 26, o.sub, { size: 2, fill: THIN }) +
      text(x + 3, y + 34, "SCALE", { size: 1.5, fill: THIN }) + text(x + 3, y + 38, o.scale || "AS NOTED @ A3", { size: 2.1 }) +
      text(x + 59, y + 34, "DATE", { size: 1.5, fill: THIN }) + text(x + 59, y + 38, o.date, { size: 2.1 }) +
      text(x + 3, y + 44, "REV", { size: 1.5, fill: THIN }) + text(x + 3, y + 48, o.rev, { size: Math.min(1.8, (1.8 * 56) / String(o.rev).length) }) +
      text(x + 59, y + 44, "DWG", { size: 1.5, fill: THIN }) + text(x + 59, y + 48, o.dwg, { size: 2.1, weight: 700 });
  }
  // Feet and inches are the default the sheet ships with, so a raw SVG or a printed sheet
  // reads imperial. The site's own stylesheet is more specific and switches to mm or off.
  const sheet = (inner) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 420 297" class="sheet"><style>.dk-mm{display:none}</style>${inner}</svg>`;

  return { begin, capture, INK, THIN, DIM, f, text, mmToFt, view, chainH, chainV, bubble, note, labels, heading, cutMark, frame, titleBlock, sheet };
})();
