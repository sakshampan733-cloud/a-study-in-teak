// Right wall — panel moulding options board (clean, no leader lines).
// node tools/walls-board.js  →  build/right-wall.svg
// The dado sits on the 610 line, the top of the 2 ft study cupboards, so the short panels line up with them.
// Moulding is painted the wall colour; lamps sit centred inside the tall panels.
const fs = require("fs"), path = require("path");

const K = {
  run: 4420,                  // study wall to the bathroom door opening, about 14.5 ft (to confirm)
  H: 2743,
  study: 280,                 // study cupboard return (610 high); panelling starts after it
  skirt: 130, dado: 610, rail: 45,
  crown: 150, cove: 70,       // crown moulding with a hidden LED cove line under it
  gap: 150,                   // stile between panels
  edge: 100,                  // margin beside the door architrave and at the corner on the 2 ft wall
  frame: 55,                  // moulding width
  door: { w: 762, h: 2438, arch: 65 },   // bathroom door 2ft6 × 8ft, architrave about 2½ in
  return: 610,                // 2 ft of wall right of the door opening, to the corner
  lampY: 1290,                // same height as the study sconces
};
K.L = K.run + K.door.w + K.return;

// Options: panel count on the long run, and which tall panels get a lamp (1-based from the study end).
const OPTIONS = [
  { key: "A", bays: 4, lamps: [2, 3], text: "4 PANELS · 2 LAMPS IN THE MIDDLE PAIR" },
  { key: "B", bays: 5, lamps: [2, 4], text: "5 PANELS · 2 LAMPS, PLAIN · LAMP · PLAIN · LAMP · PLAIN" },
  { key: "C", bays: 5, lamps: [1, 3, 5], text: "5 PANELS · 3 LAMPS, ALTERNATING", best: true },
  { key: "D", bays: 3, lamps: [1, 2, 3], text: "3 WIDE PANELS · A LAMP IN EACH" },
];

const INK = "#262626", SOFT = "#8a8479", PAPER = "#faf8f4", WALL = "#f1ece3", GOLD = "#9a7b3f";
const f = (n) => +n.toFixed(1);
const Y = (y) => K.H - y;                              // y up from the floor
const R = (x0, y0, x1, y1, a) => `<rect x="${f(x0)}" y="${f(Y(y1))}" width="${f(x1 - x0)}" height="${f(y1 - y0)}" ${a}/>`;
const SHORT = [K.skirt + 110, K.dado - 80], TALL = [K.dado + K.rail + 110, K.H - 310];

// one bay: short panel under the rail, tall panel above, both painted the wall colour
function bay(x0, x1) {
  let o = "";
  [SHORT, TALL].forEach(([y0, y1]) => {
    o += R(x0, y0, x1, y1, `fill="${WALL}" stroke="${INK}" stroke-width="7"`);
    o += R(x0 + K.frame / 2, y0 + K.frame / 2, x1 - K.frame / 2, y1 - K.frame / 2, `fill="none" stroke="${SOFT}" stroke-width="2"`);
    o += R(x0 + K.frame, y0 + K.frame, x1 - K.frame, y1 - K.frame, `fill="none" stroke="${INK}" stroke-width="3"`);
  });
  return o;
}

// twin-arm wall lamp: backplate, two arms, candle shades, soft glow
function lamp(cx) {
  const cy = Y(K.lampY);
  let o = `<ellipse cx="${f(cx)}" cy="${cy - 80}" rx="300" ry="240" fill="url(#lamp)"/>`;
  o += `<g stroke="${INK}" fill="${PAPER}" stroke-width="4">`;
  o += `<rect x="${f(cx - 26)}" y="${cy - 30}" width="52" height="150" rx="10"/>`;
  [-1, 1].forEach((sd) => {
    const ax = f(cx + sd * 115);
    o += `<path d="M${f(cx)} ${cy + 60} C ${f(cx + sd * 60)} ${cy + 70}, ${ax} ${cy + 40}, ${ax} ${cy - 20}" fill="none" stroke-width="7"/>`;
    o += `<path d="M${ax - 55} ${cy - 20} L ${ax + 55} ${cy - 20} L ${ax + 32} ${cy - 150} L ${ax - 32} ${cy - 150} Z" fill="#f7e6c4"/>`;
  });
  return o + `</g>`;
}

function wall(opt) {
  const aL = K.run - K.door.arch, aR = K.run + K.door.w + K.door.arch;       // architrave outer edges
  let o = `<rect x="0" y="0" width="${K.L}" height="${K.H}" fill="${WALL}"/>`;
  o += `<rect x="0" y="0" width="${K.L}" height="${K.cove * 3}" fill="url(#glow)"/>`;                 // light from the ceiling cove, no crown
  o += R(0, 0, K.L, K.skirt, `fill="${WALL}" stroke="${INK}" stroke-width="5"`);
  o += R(0, 0, K.study, K.dado, `fill="#e3dccf" stroke="${INK}" stroke-width="5"`);
  o += R(K.study, K.dado, aL, K.dado + K.rail, `fill="${WALL}" stroke="${INK}" stroke-width="5"`);
  o += R(aR, K.dado, K.L, K.dado + K.rail, `fill="${WALL}" stroke="${INK}" stroke-width="5"`);

  // long run: equal bays between the cupboard return and the architrave
  const a = K.study, b = aL, n = opt.bays, pw = (b - a - K.gap * n - K.edge) / n;
  for (let i = 0; i < n; i++) {
    const x0 = a + K.gap + i * (pw + K.gap), x1 = x0 + pw;
    o += bay(x0, x1);
    if (opt.lamps.includes(i + 1)) o += lamp((x0 + x1) / 2);
  }
  // 2 ft wall past the door: one narrow bay on the same lines
  o += bay(aR + K.edge, K.L - K.edge);

  // bathroom door with architrave
  o += R(aL, 0, aR, K.door.h + K.door.arch, `fill="${WALL}" stroke="${INK}" stroke-width="6"`);
  o += R(K.run, 0, K.run + K.door.w, K.door.h, `fill="#e7e2d8" stroke="${INK}" stroke-width="4"`);
  o += `<text x="${f(K.run + K.door.w / 2)}" y="${f(Y(K.door.h / 2))}" text-anchor="middle" font-family="Helvetica, Arial, sans-serif" font-size="70" letter-spacing="6" fill="${SOFT}">BATHROOM</text>`;
  o += `<line x1="-200" y1="0" x2="${K.L + 200}" y2="0" stroke="${INK}" stroke-width="8"/><line x1="-200" y1="${K.H}" x2="${K.L + 200}" y2="${K.H}" stroke="${INK}" stroke-width="12"/>`;
  return { svg: o, pw };
}

const pad = 260, head = 420, rowH = K.H + 520, vbW = K.L + pad * 2;
const vbH = head + OPTIONS.length * rowH;
let body = "";
OPTIONS.forEach((opt, i) => {
  const y = head + i * rowH, w = wall(opt);
  body += `<text x="${pad}" y="${y + 110}" font-family="Georgia, 'Times New Roman', serif" font-size="110" fill="${INK}">${opt.key}</text>`;
  body += `<text x="${pad + 150}" y="${y + 100}" font-family="Helvetica, Arial, sans-serif" font-size="56" letter-spacing="5" fill="${INK}">${opt.text}</text>`;
  body += `<text x="${pad + 150}" y="${y + 170}" font-family="Helvetica, Arial, sans-serif" font-size="44" letter-spacing="4" fill="${SOFT}">PANELS ABOUT ${Math.round(w.pw / 25.4)} IN WIDE</text>`;
  if (opt.best) body += `<text x="${pad + K.L}" y="${y + 100}" text-anchor="end" font-family="Helvetica, Arial, sans-serif" font-size="56" letter-spacing="8" fill="${GOLD}">CHOSEN</text>`;
  body += `<g transform="translate(${pad} ${y + 240})">${w.svg}</g>`;
});
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${vbW} ${vbH}" width="${f(vbW / 6)}" height="${f(vbH / 6)}">
<defs>
<linearGradient id="glow" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f6d9a4" stop-opacity=".9"/><stop offset="1" stop-color="#f6d9a4" stop-opacity="0"/></linearGradient>
<radialGradient id="lamp"><stop offset="0" stop-color="#f6d9a4" stop-opacity=".55"/><stop offset="1" stop-color="#f6d9a4" stop-opacity="0"/></radialGradient>
</defs>
<rect width="${vbW}" height="${vbH}" fill="${PAPER}"/>
<text x="${pad}" y="170" font-family="Georgia, 'Times New Roman', serif" font-size="110" letter-spacing="8" fill="${INK}">RIGHT WALL · OPTIONS</text>
<text x="${pad}" y="260" font-family="Helvetica, Arial, sans-serif" font-size="50" letter-spacing="5" fill="${SOFT}">MOULDING IN THE WALL COLOUR · DADO ON THE 610 LINE OF THE STUDY CUPBOARDS · LAMPS INSIDE THE PANELS · 2 FT OF WALL PAST THE DOOR · CEILING COVE LIGHT, NO CROWN</text>
${body}
</svg>`;
const out = path.join(__dirname, "..", "build", "right-wall.svg");
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, svg);
console.log("wrote", out);
