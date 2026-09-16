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
  o += `<g stroke="${LEAD}" stroke-width="7" stroke-linecap="square" fill="none">${draw({ X, Y, main, trans, line })}</g>`;
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

const options = [["A", "Linear", A], ["C", "Linear with jewels", C], ["D", "Border and jewels", D]];
const gap = 520, pairW = W * 2, total = options.length * pairW + (options.length - 1) * gap;
const pad = 260, vbW = total + pad * 2, vbH = H + 620;
let body = `<rect x="0" y="0" width="${vbW}" height="${vbH}" fill="#faf8f4"/>`;
body += `<text x="${pad}" y="170" font-family="Georgia, 'Times New Roman', serif" font-size="92" letter-spacing="6" fill="${INK}">WARDROBE GLASS</text>`;
body += `<text x="${pad}" y="250" font-family="Helvetica, Arial, sans-serif" font-size="46" letter-spacing="4" fill="#8a8479">LEADED WHITE GLASS · BLACKENED STEEL · BRASS PULLS</text>`;
options.forEach(([k, name, draw], i) => {
  const x = pad + i * (pairW + gap), y0 = 360;
  body += `<g transform="translate(${x} ${y0})">${leaf(0, draw, false)}${leaf(W, draw, true)}<rect x="-20" y="${H - PL}" width="${pairW + 40}" height="${PL}" fill="#111"/></g>`;
  body += `<text x="${x + pairW / 2}" y="${y0 + H + 120}" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-size="84" fill="${INK}">${k}</text>`;
  body += `<text x="${x + pairW / 2}" y="${y0 + H + 190}" text-anchor="middle" font-family="Helvetica, Arial, sans-serif" font-size="42" letter-spacing="4" fill="#8a8479">${name.toUpperCase()}</text>`;
});
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${vbW} ${vbH}" width="${vbW / 5}" height="${vbH / 5}">${body}</svg>`;
const out = path.join(__dirname, "..", "build", "wardrobe-options.svg");
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, svg);
console.log("wrote", out);
