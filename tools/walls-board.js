// Side walls — panel moulding board (clean, no leader lines).
// node tools/walls-board.js  →  build/side-walls.svg
// Lower panels finish at 610, the top of the 2 ft study cupboards, so the dado lines up with them.
const fs = require("fs"), path = require("path");

const K = {
  L: 5791, H: 2743,           // wall length (study wall → bed wall, to confirm) and ceiling
  study: 475,                 // study cupboards return: panelling starts after them
  skirt: 130, dado: 610, rail: 45,
  crown: 150, cove: 70,       // crown moulding with a hidden LED cove line under it
  gap: 150,                   // stile between panels
  frame: 55,                  // moulding width
  doorH: 2438, arch: 70,
};
// Openings measured from the study wall (plan estimate).
const WALLS = [
  { name: "LEFT WALL", sub: "SEEN FROM INSIDE THE ROOM · STUDY WALL ON THE RIGHT", mirror: true, ret: 2743 - 150, retNote: "bookcase side", doors: [{ at: K.L - 974, w: 914, label: "D1" }] },
  { name: "RIGHT WALL", sub: "SEEN FROM INSIDE THE ROOM · STUDY WALL ON THE LEFT", mirror: false, ret: 610, retNote: "cupboard end", doors: [{ at: 2030, w: 762, label: "D2" }, { at: 3850, w: 762, label: "D3" }] },
];

const INK = "#262626", SOFT = "#8a8479", PAPER = "#faf8f4", WALL = "#f1ece3";
const f = (n) => +n.toFixed(1);

function wall(w) {
  const X = (x) => (w.mirror ? K.L - x : x), Y = (y) => K.H - y;       // x from the study wall, y up from the floor
  const R = (x0, y0, x1, y1, a = "") => `<rect x="${f(Math.min(X(x0), X(x1)))}" y="${f(Y(y1))}" width="${f(Math.abs(x1 - x0))}" height="${f(y1 - y0)}" ${a}/>`;
  let o = `<rect x="0" y="0" width="${K.L}" height="${K.H}" fill="${WALL}"/>`;
  // crown, glow of the cove, skirting, dado rail
  o += `<rect x="0" y="0" width="${K.L}" height="${K.crown}" fill="${PAPER}" stroke="${INK}" stroke-width="5"/>`;
  o += `<line x1="0" y1="${K.crown * 0.45}" x2="${K.L}" y2="${K.crown * 0.45}" stroke="${INK}" stroke-width="3"/>`;
  o += `<rect x="0" y="${K.crown}" width="${K.L}" height="${K.cove * 3}" fill="url(#glow)"/>`;
  o += R(0, 0, K.L, K.skirt, `fill="${PAPER}" stroke="${INK}" stroke-width="5"`);
  // study cupboards return at the study-wall end
  o += R(0, 0, K.study, w.ret, `fill="#e3dccf" stroke="${INK}" stroke-width="5"`);
  // runs of wall between the study return and the door openings
  const cuts = [K.study, ...w.doors.flatMap((d) => [d.at - K.arch, d.at + d.w + K.arch]), K.L];
  const runs = [];
  for (let i = 0; i < cuts.length; i += 2) if (cuts[i + 1] - cuts[i] > 400) runs.push([cuts[i], cuts[i + 1]]);
  o += R(K.study, K.dado, K.L, K.dado + K.rail, `fill="${PAPER}" stroke="${INK}" stroke-width="5"`);
  let panels = 0;
  runs.forEach(([a, b]) => {
    const n = Math.max(1, Math.round((b - a - K.gap) / 800)), pw = (b - a - K.gap * (n + 1)) / n;
    for (let i = 0; i < n; i++) {
      const x0 = a + K.gap + i * (pw + K.gap), x1 = x0 + pw;
      [[K.skirt + 110, K.dado - 80], [K.dado + K.rail + 110, K.H - K.crown - 160]].forEach(([y0, y1]) => {
        o += R(x0, y0, x1, y1, `fill="none" stroke="${INK}" stroke-width="7"`);
        o += R(x0 + K.frame, y0 + K.frame, x1 - K.frame, y1 - K.frame, `fill="none" stroke="${INK}" stroke-width="3"`);
        o += R(x0 + K.frame / 2, y0 + K.frame / 2, x1 - K.frame / 2, y1 - K.frame / 2, `fill="none" stroke="${SOFT}" stroke-width="2"`);
      });
      panels++;
    }
  });
  // doors with architraves (the rail stops at them)
  w.doors.forEach((d) => {
    o += R(d.at - K.arch, 0, d.at + d.w + K.arch, K.doorH + K.arch, `fill="${PAPER}" stroke="${INK}" stroke-width="6"`);
    o += R(d.at, 0, d.at + d.w, K.doorH, `fill="#e7e2d8" stroke="${INK}" stroke-width="4"`);
    o += `<text x="${f(X(d.at + d.w / 2))}" y="${f(Y(K.doorH / 2))}" text-anchor="middle" font-family="Helvetica, Arial, sans-serif" font-size="90" letter-spacing="6" fill="${SOFT}">${d.label}</text>`;
  });
  o += `<line x1="-200" y1="${K.H}" x2="${K.L + 200}" y2="${K.H}" stroke="${INK}" stroke-width="12"/>`;
  return { svg: o, panels };
}

const pad = 260, gapY = 420, vbW = K.L + pad * 2;
let body = `<defs><linearGradient id="glow" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f6d9a4" stop-opacity=".9"/><stop offset="1" stop-color="#f6d9a4" stop-opacity="0"/></linearGradient></defs>`;
let y = 380;
body += `<text x="${pad}" y="170" font-family="Georgia, 'Times New Roman', serif" font-size="110" letter-spacing="8" fill="${INK}">SIDE WALLS</text>`;
body += `<text x="${pad}" y="260" font-family="Helvetica, Arial, sans-serif" font-size="52" letter-spacing="5" fill="${SOFT}">PANEL MOULDING · LOWER PANELS END AT 610, LEVEL WITH THE STUDY CUPBOARDS · COVE LIGHT UNDER THE CROWN</text>`;
WALLS.forEach((w) => {
  const r = wall(w);
  body += `<g transform="translate(${pad} ${y})">${r.svg}</g>`;
  body += `<text x="${pad}" y="${y + K.H + 150}" font-family="Georgia, 'Times New Roman', serif" font-size="84" fill="${INK}">${w.name}</text>`;
  body += `<text x="${pad + 820}" y="${y + K.H + 150}" font-family="Helvetica, Arial, sans-serif" font-size="46" letter-spacing="4" fill="${SOFT}">${w.sub} · ${r.panels} PANEL BAYS</text>`;
  y += K.H + gapY;
});
const vbH = y - gapY + 260;
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${vbW} ${vbH}" width="${f(vbW / 6)}" height="${f(vbH / 6)}"><rect width="${vbW}" height="${vbH}" fill="${PAPER}"/>${body}</svg>`;
const out = path.join(__dirname, "..", "build", "side-walls.svg");
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, svg);
console.log("wrote", out);
