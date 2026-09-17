// Right wall — panel moulding board (clean, no leader lines).
// node tools/walls-board.js  →  build/right-wall.svg
// The dado sits on the 610 line, the top of the 2 ft study cupboards, so the lower panels line up with them.
const fs = require("fs"), path = require("path");

const K = {
  run: 4420,                  // panelled run from the study wall to the bathroom door, about 14.5 ft (to confirm)
  H: 2743,
  study: 475,                 // study cupboard return (610 high); panelling starts after it
  skirt: 130, dado: 610, rail: 45,
  crown: 150, cove: 70,       // crown moulding with a hidden LED cove line under it
  gap: 150,                   // stile between panels
  frame: 55,                  // moulding width
  bays: 4,
  door: { w: 762, h: 2438, arch: 70 },   // bathroom door, 2ft6 × 8ft
  lamp: { y: 1290, stiles: [1, 3] },     // twin lamps on the 1st and 3rd stiles, same height as the study sconces
};
K.L = K.run + K.door.arch * 2 + K.door.w + 150;

const INK = "#262626", SOFT = "#8a8479", PAPER = "#faf8f4", WALL = "#f1ece3";
const f = (n) => +n.toFixed(1);
const Y = (y) => K.H - y;                              // y up from the floor
const R = (x0, y0, x1, y1, a) => `<rect x="${f(x0)}" y="${f(Y(y1))}" width="${f(x1 - x0)}" height="${f(y1 - y0)}" ${a}/>`;

function wall() {
  let o = `<rect x="0" y="0" width="${K.L}" height="${K.H}" fill="${WALL}"/>`;
  // crown, cove glow, skirting, study cupboard return, dado rail
  o += `<rect x="0" y="0" width="${K.L}" height="${K.crown}" fill="${PAPER}" stroke="${INK}" stroke-width="5"/>`;
  o += `<line x1="0" y1="${K.crown * 0.45}" x2="${K.L}" y2="${K.crown * 0.45}" stroke="${INK}" stroke-width="3"/>`;
  o += `<rect x="0" y="${K.crown}" width="${K.L}" height="${K.cove * 3}" fill="url(#glow)"/>`;
  o += R(0, 0, K.L, K.skirt, `fill="${PAPER}" stroke="${INK}" stroke-width="5"`);
  o += R(0, 0, K.study, K.dado, `fill="#e3dccf" stroke="${INK}" stroke-width="5"`);
  o += R(K.study, K.dado, K.run, K.dado + K.rail, `fill="${PAPER}" stroke="${INK}" stroke-width="5"`);

  // equal bays between the cupboard return and the door architrave
  const a = K.study, b = K.run, n = K.bays, pw = (b - a - K.gap * (n + 1)) / n, stiles = [];
  for (let i = 0; i < n; i++) {
    const x0 = a + K.gap + i * (pw + K.gap), x1 = x0 + pw;
    if (i > 0) stiles.push(x0 - K.gap / 2);
    [[K.skirt + 110, K.dado - 80], [K.dado + K.rail + 110, K.H - K.crown - 160]].forEach(([y0, y1]) => {
      o += R(x0, y0, x1, y1, `fill="none" stroke="${INK}" stroke-width="7"`);
      o += R(x0 + K.frame / 2, y0 + K.frame / 2, x1 - K.frame / 2, y1 - K.frame / 2, `fill="none" stroke="${SOFT}" stroke-width="2"`);
      o += R(x0 + K.frame, y0 + K.frame, x1 - K.frame, y1 - K.frame, `fill="none" stroke="${INK}" stroke-width="3"`);
    });
  }

  // wall lamps on the chosen stiles: backplate, two arms, candle shades
  K.lamp.stiles.forEach((k) => {
    const cx = f(stiles[k - 1]), cy = Y(K.lamp.y);
    o += `<ellipse cx="${cx}" cy="${cy - 80}" rx="300" ry="240" fill="url(#lamp)"/>`;
    o += `<g stroke="${INK}" fill="${PAPER}" stroke-width="4">`;
    o += `<rect x="${cx - 26}" y="${cy - 30}" width="52" height="150" rx="10"/>`;
    [-1, 1].forEach((sd) => {
      const ax = cx + sd * 115;
      o += `<path d="M${cx} ${cy + 60} C ${cx + sd * 60} ${cy + 70}, ${ax} ${cy + 40}, ${ax} ${cy - 20}" fill="none" stroke-width="7"/>`;
      o += `<path d="M${ax - 55} ${cy - 20} L ${ax + 55} ${cy - 20} L ${ax + 32} ${cy - 150} L ${ax - 32} ${cy - 150} Z" fill="#f7e6c4"/>`;
    });
    o += `</g>`;
  });

  // bathroom door with architrave; rail and skirting stop at it
  const d0 = K.run + K.door.arch, d1 = d0 + K.door.w;
  o += R(K.run, 0, d1 + K.door.arch, K.door.h + K.door.arch, `fill="${PAPER}" stroke="${INK}" stroke-width="6"`);
  o += R(d0, 0, d1, K.door.h, `fill="#e7e2d8" stroke="${INK}" stroke-width="4"`);
  o += `<text x="${f((d0 + d1) / 2)}" y="${f(Y(K.door.h / 2))}" text-anchor="middle" font-family="Helvetica, Arial, sans-serif" font-size="70" letter-spacing="6" fill="${SOFT}">BATHROOM</text>`;
  o += `<line x1="-200" y1="${K.H}" x2="${K.L + 200}" y2="${K.H}" stroke="${INK}" stroke-width="12"/>`;
  return o;
}

const pad = 260, top = 380, vbW = K.L + pad * 2, vbH = top + K.H + 260;
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${vbW} ${vbH}" width="${f(vbW / 6)}" height="${f(vbH / 6)}">
<defs>
<linearGradient id="glow" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f6d9a4" stop-opacity=".9"/><stop offset="1" stop-color="#f6d9a4" stop-opacity="0"/></linearGradient>
<radialGradient id="lamp"><stop offset="0" stop-color="#f6d9a4" stop-opacity=".55"/><stop offset="1" stop-color="#f6d9a4" stop-opacity="0"/></radialGradient>
</defs>
<rect width="${vbW}" height="${vbH}" fill="${PAPER}"/>
<text x="${pad}" y="170" font-family="Georgia, 'Times New Roman', serif" font-size="110" letter-spacing="8" fill="${INK}">RIGHT WALL</text>
<text x="${pad}" y="260" font-family="Helvetica, Arial, sans-serif" font-size="52" letter-spacing="5" fill="${SOFT}">PANEL MOULDING · DADO ON THE 610 LINE OF THE STUDY CUPBOARDS · TWIN WALL LAMPS · COVE LIGHT</text>
<g transform="translate(${pad} ${top})">${wall()}</g>
<text x="${pad}" y="${top + K.H + 150}" font-family="Helvetica, Arial, sans-serif" font-size="46" letter-spacing="4" fill="${SOFT}">SEEN FROM INSIDE THE ROOM · STUDY WALL ON THE LEFT · ${K.bays} BAYS OVER ABOUT 14 FT 6 IN</text>
</svg>`;
const out = path.join(__dirname, "..", "build", "right-wall.svg");
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, svg);
console.log("wrote", out);
