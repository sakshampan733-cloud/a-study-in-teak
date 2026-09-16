// Wardrobe glass options board — a clean side-by-side, not part of the website.
// node tools/wardrobe-options.js  →  build/wardrobe-options.svg
const fs = require("fs"), path = require("path");

const H = 2600, W = 520, FR = 38, BAR = 26, TR = 560, PL = 90;   // door leaf, steel frame, transom bar, transom, plinth
const f = (n) => +n.toFixed(1);
const INK = "#1e1e1e", LEAD = "#3a3a3a", GLASS = "#f3f3ef", STEEL = "#2a2a2a", BRASS = "#b08d4a";

// Leaf in local mm, origin top-left of the leaf; y grows downward.
function leaf(x0, draw, mirror) {
  const g0 = FR, g1 = W - FR;
  const main = [g0, TR + BAR, g1, H - PL - FR], trans = [g0, FR, g1, TR];
  const X = (t, r) => (mirror ? r[2] - t * (r[2] - r[0]) : r[0] + t * (r[2] - r[0]));
  const Y = (t, r) => r[1] + t * (r[3] - r[1]);
  const line = (a, b, c, d) => `<line x1="${f(a)}" y1="${f(b)}" x2="${f(c)}" y2="${f(d)}"/>`;
  let o = `<g transform="translate(${x0} 0)">`;
  o += `<rect x="0" y="0" width="${W}" height="${H - PL}" fill="${STEEL}"/>`;
  o += `<rect x="${trans[0]}" y="${trans[1]}" width="${trans[2] - trans[0]}" height="${trans[3] - trans[1]}" fill="${GLASS}"/>`;
  o += `<rect x="${main[0]}" y="${main[1]}" width="${main[2] - main[0]}" height="${main[3] - main[1]}" fill="${GLASS}"/>`;
  o += `<g stroke="${LEAD}" stroke-width="7" stroke-linecap="square" fill="none">${draw({ X, Y, main, trans, line, mirrorLeaf: mirror })}</g>`;
  // brass bar pull on the meeting edge
  const px = mirror ? FR / 2 : W - FR / 2;
  o += `<rect x="${px - 7}" y="${1200}" width="14" height="320" rx="7" fill="${BRASS}"/>`;
  return o + `</g>`;
}
const dots = (cx, cy, s = 26, r = 10) => [[0, -s], [s, 0], [0, s], [-s, 0]].map(([dx, dy]) => `<circle cx="${f(cx + dx)}" cy="${f(cy + dy)}" r="${r}" fill="${INK}" stroke="none"/>`).join("");

// A — linear leading after the reference: border strip and staggered rectangles.
const A = ({ X, Y, main, trans, line }) => {
  const m = main, t = trans;
  return line(X(0.26, m), m[1], X(0.26, m), m[3]) +
    [0.2, 0.47, 0.74].map((k) => line(X(0, m), Y(k, m), X(0.26, m), Y(k, m))).join("") +
    line(X(0.26, m), Y(0.6, m), X(1, m), Y(0.6, m)) + line(X(0.64, m), Y(0.6, m), X(0.64, m), Y(0.88, m)) + line(X(0.64, m), Y(0.88, m), X(1, m), Y(0.88, m)) +
    line(X(0.26, m), Y(0.3, m), X(0.72, m), Y(0.3, m)) + line(X(0.72, m), Y(0.3, m), X(0.72, m), Y(0.6, m)) +
    line(X(0.26, t), t[1], X(0.26, t), t[3]) + line(X(0.26, t), Y(0.55, t), X(1, t), Y(0.55, t)) + line(X(0.62, t), Y(0.55, t), X(0.62, t), t[3]) + line(X(0, t), Y(0.35, t), X(0.26, t), Y(0.35, t));
};
// C — A with the four-dot jewels from the laylight, set in the open panes.
const C = (p) => {
  const { X, Y, main: m, trans: t } = p;
  return A(p) + dots(X(0.49, m), Y(0.45, m)) + dots(X(0.82, m), Y(0.74, m)) + dots(X(0.63, t), Y(0.28, t));
};
// D — border and jewels: an inner border line, three tall panes, a small square with a four-dot jewel in each.
const D = ({ X, Y, main: m, trans: t, line }) => {
  const b = 60, rect = (x0, y0, x1, y1) => line(x0, y0, x1, y0) + line(x1, y0, x1, y1) + line(x1, y1, x0, y1) + line(x0, y1, x0, y0);
  let o = rect(m[0] + b, m[1] + b, m[2] - b, m[3] - b) + rect(t[0] + b, t[1] + b, t[2] - b, t[3] - b);
  // corner ties from the border to the frame
  [[m[0], m[1], m[0] + b, m[1] + b], [m[2], m[1], m[2] - b, m[1] + b], [m[0], m[3], m[0] + b, m[3] - b], [m[2], m[3], m[2] - b, m[3] - b]].forEach(([a, bb, c, d]) => { o += line(a, bb, c, d); });
  const y1 = Y(1 / 3, m), y2 = Y(2 / 3, m);
  o += line(m[0] + b, y1, m[2] - b, y1) + line(m[0] + b, y2, m[2] - b, y2);
  const cx = (m[0] + m[2]) / 2, sq = 110;
  [(m[1] + y1) / 2, (y1 + y2) / 2, (y2 + m[3]) / 2].forEach((cy) => { o += rect(cx - sq / 2, cy - sq / 2, cx + sq / 2, cy + sq / 2) + dots(cx, cy, 22, 8); });
  const tcx = (t[0] + t[2]) / 2, tcy = (t[1] + t[3]) / 2;
  o += rect(tcx - sq / 2, tcy - sq / 2, tcx + sq / 2, tcy + sq / 2) + dots(tcx, tcy, 22, 8);
  return o;
};

// Flowing, cathedral-window designs. Drawn for the LEFT leaf (meeting edge on the right, x = 482);
// the right leaf mirrors it, so each pair reads as one two-light window.
const mirrorWrap = (fn) => (p) => {
  const mx = (x) => (p.mirrorLeaf ? W - x : x);
  const P = (d) => `<path d="${d.replace(/(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/g, (_, x, y) => `${f(mx(+x))},${y}`)}"/>`;
  const circle = (cx, cy, r) => `<circle cx="${f(mx(cx))}" cy="${cy}" r="${r}"/>`;
  return fn({ ...p, P, circle, sweep: (s) => (p.mirrorLeaf ? 1 - s : s) });
};
// E — Gothic lancet: pointed arch with a cusped inner head and trefoil, flame-shaped mouchettes, half a rose in the transom.
const E = mirrorWrap(({ P, circle, sweep }) => {
  const xa = 88, xb = 432, sp = 1150, xm = 260;
  let o = P(`M ${xa},2360 L ${xa},${sp} A 344 344 0 0 ${sweep(1)} ${xm},852 A 344 344 0 0 ${sweep(1)} ${xb},${sp} L ${xb},2360 L ${xa},2360`);
  o += P(`M 128,2320 L 128,${sp + 30} A 264 264 0 0 ${sweep(1)} ${xm},951 A 264 264 0 0 ${sweep(1)} 392,${sp + 30} L 392,2320`);
  o += circle(xm, 1040, 40) + circle(221, 1105, 40) + circle(299, 1105, 40);
  o += P(`M 60,1120 C 60,930 130,780 236,650 C 150,790 96,940 60,1120`) + P(`M 468,1120 C 468,930 398,780 292,650 C 378,790 432,940 468,1120`);
  // reticulated tracery: a net of ogee cells, like the lower lights of a Decorated window
  for (let row = 0; row < 4; row++) {
    const y0 = 1240 + row * 270, y1 = y0 + 270;
    o += P(`M 128,${y0} C 128,${y0 + 150} ${xm},${y0 + 120} ${xm},${y1} C ${xm},${y0 + 120} 392,${y0 + 150} 392,${y0}`);
    if (row < 3) o += P(`M ${xm},${y1} C ${xm},${y1 + 60} ${xm - 70},${y1 + 60} ${xm - 70},${y1 + 130} M ${xm},${y1} C ${xm},${y1 + 60} ${xm + 70},${y1 + 60} ${xm + 70},${y1 + 130}`);
  }
  o += circle(xm, 2270, 30) + circle(xm - 36, 2270, 30) + circle(xm + 36, 2270, 30);
  // transom: half a rose, completed by the other leaf
  o += P(`M 482,69 A 230 230 0 0 ${sweep(0)} 482,529`) + P(`M 482,209 A 90 90 0 0 ${sweep(0)} 482,389`);
  [150, 180, 210].forEach((deg) => { const a = (deg * Math.PI) / 180; o += P(`M ${f(482 + 90 * Math.cos(a))},${f(299 + 90 * Math.sin(a))} Q ${f(482 + 170 * Math.cos(a + 0.25))},${f(299 + 170 * Math.sin(a + 0.25))} ${f(482 + 230 * Math.cos(a))},${f(299 + 230 * Math.sin(a))}`); });
  o += P(`M 60,80 C 150,90 200,140 230,220 C 170,170 110,140 60,80`) + P(`M 60,520 C 150,510 200,460 230,380 C 170,430 110,460 60,520`);
  return o;
});
// F — Curvilinear: whiplash stems rising into an ogee arch shared across the pair, with leaf-shaped openings.
const F = mirrorWrap(({ P }) => {
  let o = "";
  // nested flame curves rising from the outer foot and meeting the stile in pointed ogees
  [0, 1, 2, 3].forEach((i) => {
    const x0 = 38 + i * 60, top = 760 + i * 290;
    o += P(`M ${x0},2472 C ${x0 - 10},${1900 - i * 40} ${160 + i * 40},${1300 + i * 120} 482,${top}`);
  });
  // mouchettes (flame shapes) in the bays between the curves
  [[150, 1500], [240, 1700], [320, 1950]].forEach(([x, y]) => { o += P(`M ${x},${y + 160} C ${x - 40},${y + 60} ${x + 30},${y - 60} ${x + 110},${y - 150} C ${x + 70},${y - 40} ${x + 50},${y + 70} ${x},${y + 160}`); });
  o += P(`M 38,1150 C 150,1000 300,900 420,720`) + P(`M 90,1020 C 160,960 230,880 280,800 C 210,870 140,940 90,1020`);
  // transom: flame tongues rising to the stile
  o += P(`M 38,540 C 120,480 300,360 482,110`) + P(`M 160,560 C 230,500 380,400 482,300`) + P(`M 90,300 C 150,240 220,160 260,70 C 200,150 130,230 90,300`);
  return o;
});
// G — Arts and Crafts rose: tall slender stems lifting to a stylised rose, leaves in pairs, a bud in the transom.
const G = mirrorWrap(({ P, circle }) => {
  const cx = 260, cy = 960;
  let o = P(`M 200,2472 C 190,1900 215,1400 214,1083`) + P(`M 260,2472 L 260,1090`) + P(`M 320,2472 C 330,1900 305,1400 306,1083`);
  o += circle(cx, cy, 130) + circle(cx, cy, 86);
  o += circle(cx, cy, 36);
  [0, 72, 144, 216, 288].forEach((deg) => { const a = (deg * Math.PI) / 180; o += P(`M ${f(cx + 36 * Math.cos(a))},${f(cy + 36 * Math.sin(a))} Q ${f(cx + 70 * Math.cos(a + 0.6))},${f(cy + 70 * Math.sin(a + 0.6))} ${f(cx + 86 * Math.cos(a + 0.9))},${f(cy + 86 * Math.sin(a + 0.9))}`); });
  [[1700, 1], [1380, -1]].forEach(([y, s]) => {
    o += P(`M 260,${y} C 200,${y - 60} 120,${y - 40} 90,${y + 10} C 150,${y + 30} 210,${y + 20} 260,${y}`);
    o += P(`M 260,${y + 120 * s} C 320,${y + 60 * s} 400,${y + 80 * s} 430,${y + 130 * s} C 370,${y + 150 * s} 310,${y + 140 * s} 260,${y + 120 * s}`);
  });
  o += P(`M 38,2230 C 180,2200 340,2200 482,2230`);
  o += circle(cx, 300, 62) + circle(cx, 300, 30) + P(`M 260,362 L 260,560`) + P(`M 260,470 C 200,430 140,450 110,500`) + P(`M 260,450 C 320,410 380,430 410,480`);
  return o;
});

const which = process.argv[2] === "flowing" ? "flowing" : "first";
const options = which === "flowing"
  ? [["E", "Gothic lancet", E], ["F", "Curvilinear", F], ["G", "Arts and Crafts rose", G]]
  : [["A", "Linear", A], ["C", "Linear with jewels", C], ["D", "Border and jewels", D]];
const gap = 520, pairW = W * 2, total = options.length * pairW + (options.length - 1) * gap;
const pad = 260, vbW = total + pad * 2, vbH = H + 620;
let body = `<rect x="0" y="0" width="${vbW}" height="${vbH}" fill="#faf8f4"/>`;
body += `<text x="${pad}" y="170" font-family="Georgia, 'Times New Roman', serif" font-size="92" letter-spacing="6" fill="${INK}">WARDROBE GLASS</text>`;
body += `<text x="${pad}" y="250" font-family="Helvetica, Arial, sans-serif" font-size="46" letter-spacing="4" fill="#8a8479">${which === "flowing" ? "CATHEDRAL WINDOW STUDIES · WHITE GLASS IN LEAD · STEEL AND BRASS" : "LEADED WHITE GLASS · BLACKENED STEEL · BRASS PULLS"}</text>`;
options.forEach(([k, name, draw], i) => {
  const x = pad + i * (pairW + gap), y0 = 360;
  body += `<g transform="translate(${x} ${y0})">${leaf(0, draw, false)}${leaf(W, draw, true)}<rect x="-20" y="${H - PL}" width="${pairW + 40}" height="${PL}" fill="#111"/></g>`;
  body += `<text x="${x + pairW / 2}" y="${y0 + H + 120}" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-size="84" fill="${INK}">${k}</text>`;
  body += `<text x="${x + pairW / 2}" y="${y0 + H + 190}" text-anchor="middle" font-family="Helvetica, Arial, sans-serif" font-size="42" letter-spacing="4" fill="#8a8479">${name.toUpperCase()}</text>`;
});
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${vbW} ${vbH}" width="${vbW / 5}" height="${vbH / 5}">${body}</svg>`;
const out = path.join(__dirname, "..", "build", which === "flowing" ? "wardrobe-options-flowing.svg" : "wardrobe-options.svg");
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, svg);
console.log("wrote", out);
