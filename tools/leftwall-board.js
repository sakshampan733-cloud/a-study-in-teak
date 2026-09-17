// Left wall — six treatment ideas on the same wall, drawn to scale (clean, no leader lines).
// node tools/leftwall-board.js  →  build/left-wall-ideas.svg
// Seen from the room: entrance door D1 at the left, study bookcase end (full height, 280 deep) at the right.
// Every idea keeps the study counter band (570–610) running along the wall, as on the right wall.
const fs = require("fs"), path = require("path");

const K = {
  L: 5792, H: 2743,                          // wall length is an estimate — confirm on site
  skirt: 130, band: [570, 610],
  door: { x: 150, w: 914, h: 2438, arch: 65 },   // D1, 3 ft × 8 ft (position to confirm)
  book: 280,                                 // end of the study bookcase, floor to ceiling
  partition: 5792 - 2439,                    // about 11 ft from the entrance wall (plan estimate)
};
const x0 = K.door.x + K.door.w + K.door.arch, x1 = K.L - K.book;   // the treated run between door and bookcase

const INK = "#262626", SOFT = "#8a8479", PAPER = "#faf8f4", WALL = "#f1ece3", TEAK = "#b8875a", TEAK_D = "#8f6440", BRASS = "#b48a3c";
const f = (n) => +n.toFixed(1);
const Y = (y) => K.H - y;
const R = (a, b, c, d, attr) => `<rect x="${f(a)}" y="${f(Y(d))}" width="${f(c - a)}" height="${f(d - b)}" ${attr}/>`;
let seed = 7; const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);

// equal bays across the run with stiles between
function bays(n, stile = 150) {
  const w = (x1 - x0 - stile * (n + 1)) / n;
  return Array.from({ length: n }, (_, i) => { const a = x0 + stile + i * (w + stile); return [a, a + w]; });
}
function panel(a, b, lo, hi, fill = "none") {
  return R(a, lo, b, hi, `fill="${fill}" stroke="${INK}" stroke-width="7"`) + R(a + 27, lo + 27, b - 27, hi - 27, `fill="none" stroke="${SOFT}" stroke-width="2"`) + R(a + 55, lo + 55, b - 55, hi - 55, `fill="none" stroke="${INK}" stroke-width="3"`);
}
function sconce(cx, cy) {
  let o = `<ellipse cx="${f(cx)}" cy="${Y(cy) - 80}" rx="300" ry="240" fill="url(#lampGlow)"/><g stroke="${INK}" fill="${PAPER}" stroke-width="4"><rect x="${f(cx - 26)}" y="${Y(cy) - 30}" width="52" height="150" rx="10"/>`;
  [-1, 1].forEach((s) => { const ax = f(cx + s * 115); o += `<path d="M${f(cx)} ${Y(cy) + 60} C ${f(cx + s * 60)} ${Y(cy) + 70}, ${ax} ${Y(cy) + 40}, ${ax} ${Y(cy) - 20}" fill="none" stroke-width="7"/><path d="M${ax - 55} ${Y(cy) - 20} L ${ax + 55} ${Y(cy) - 20} L ${ax + 32} ${Y(cy) - 150} L ${ax - 32} ${Y(cy) - 150} Z" fill="#f7e6c4"/>`; });
  return o + "</g>";
}

// The parts every idea shares: wall, skirting, counter band, door, bookcase end, partition line.
function frameWall(inner, bandFill = WALL) {
  let o = R(0, 0, K.L, K.H, `fill="${WALL}"`) + inner;
  o += R(x0, 0, x1, K.skirt, `fill="${WALL}" stroke="${INK}" stroke-width="5"`);
  o += R(x0, K.band[0], x1, K.band[1], `fill="${bandFill}" stroke="${INK}" stroke-width="5"`);
  for (let i = 1; i < 4; i++) o += `<line x1="${x0}" y1="${Y(K.band[0] + i * 10)}" x2="${x1}" y2="${Y(K.band[0] + i * 10)}" stroke="${INK}" stroke-width="2"/>`;
  const d = K.door;
  o += R(d.x - d.arch, 0, d.x + d.w + d.arch, d.h + d.arch, `fill="${WALL}" stroke="${INK}" stroke-width="6"`) + R(d.x, 0, d.x + d.w, d.h, `fill="#e7e2d8" stroke="${INK}" stroke-width="4"`);
  o += `<text x="${d.x + d.w / 2}" y="${Y(d.h / 2)}" text-anchor="middle" font-family="Helvetica, Arial, sans-serif" font-size="80" letter-spacing="6" fill="${SOFT}">D1</text>`;
  o += R(x1, 0, K.L, K.H, `fill="${TEAK}" stroke="${INK}" stroke-width="6"`) + R(x1 - 20, K.band[0], K.L, K.band[1], `fill="${TEAK_D}" stroke="${INK}" stroke-width="4"`);
  o += `<line x1="${K.partition}" y1="-60" x2="${K.partition}" y2="${K.H + 60}" stroke="${SOFT}" stroke-width="6" stroke-dasharray="50 35"/>`;
  o += `<line x1="-150" y1="${K.H}" x2="${K.L + 150}" y2="${K.H}" stroke="${INK}" stroke-width="12"/><line x1="-150" y1="0" x2="${K.L + 150}" y2="0" stroke="${INK}" stroke-width="6"/>`;
  return o;
}
const upper = [K.band[1] + 110, K.H - 310], lower = [K.skirt + 110, K.band[0] - 80];

const IDEAS = [
  {
    title: "1 · PANELS, LIKE THE RIGHT WALL",
    line: "Quiet and symmetrical — both side walls match, the desk and shelves stay the stars",
    draw() {
      let o = ""; const B = bays(5);
      B.forEach(([a, b]) => { o += panel(a, b, ...upper) + panel(a, b, ...lower); });
      [0, 2, 4].forEach((i) => { o += sconce((B[i][0] + B[i][1]) / 2, 1290); });
      return frameWall(o);
    },
  },
  {
    title: "2 · REEDED TEAK WALL",
    line: "Milan / Paris 1930s — full-height fluted teak above the counter line; echoes the reeds on the desk",
    draw() {
      let o = R(x0, K.band[1], x1, K.H, `fill="${TEAK}"`);
      for (let x = x0 + 45; x < x1; x += 45) o += `<line x1="${x}" y1="0" x2="${x}" y2="${Y(K.band[1])}" stroke="${TEAK_D}" stroke-width="5"/>`;
      o += R(x0, K.skirt, x1, K.band[0], `fill="${TEAK}"`);
      bays(4).forEach(([a, b]) => { o += R(a, lower[0], b, lower[1], `fill="none" stroke="${TEAK_D}" stroke-width="6"`); });
      o += `<line x1="${x0}" y1="${Y(K.H - 60)}" x2="${x1}" y2="${Y(K.H - 60)}" stroke="${TEAK_D}" stroke-width="6"/>`;
      return frameWall(o, TEAK_D);
    },
  },
  {
    title: "3 · ANTIQUED MIRROR PANELS",
    line: "1930s ocean-liner glamour — smoky mirror in slim frames; doubles the window light and the bookcase",
    draw() {
      let o = "";
      bays(3, 180).forEach(([a, b]) => {
        o += R(a, upper[0], b, upper[1], `fill="url(#mirror)" stroke="${INK}" stroke-width="10"`);
        const cols = 3, rows = 4, cw = (b - a) / cols, rh = (upper[1] - upper[0]) / rows;
        for (let c = 1; c < cols; c++) o += `<line x1="${f(a + c * cw)}" y1="${Y(upper[1])}" x2="${f(a + c * cw)}" y2="${Y(upper[0])}" stroke="${BRASS}" stroke-width="8"/>`;
        for (let r = 1; r < rows; r++) o += `<line x1="${a}" y1="${f(Y(upper[0] + r * rh))}" x2="${b}" y2="${f(Y(upper[0] + r * rh))}" stroke="${BRASS}" stroke-width="8"/>`;
        for (let k = 0; k < 3; k++) { const sx = a + (b - a) * (0.15 + 0.3 * k); o += `<line x1="${f(sx)}" y1="${Y(upper[1] - 150)}" x2="${f(sx + 300)}" y2="${Y(upper[1] - 700)}" stroke="#ffffff" stroke-opacity=".45" stroke-width="18"/>`; }
        o += panel(a, b, ...lower);
      });
      return frameWall(o);
    },
  },
  {
    title: "4 · PAINTED MURAL IN PANELS",
    line: "In the manner of Sert's 1930s murals — one landscape running behind the panel mouldings, sepia on gold",
    draw() {
      let o = `<defs><clipPath id="muralClip">${bays(4).map(([a, b]) => R(a + 55, upper[0] + 55, b - 55, upper[1] - 55, "")).join("")}</clipPath></defs>`;
      let m = R(x0, upper[0], x1, upper[1], `fill="#dcc596"`);
      m += `<path d="M ${x0} ${Y(1250)} C ${x0 + 700} ${Y(1700)}, ${x0 + 1400} ${Y(1150)}, ${x0 + 2100} ${Y(1500)} S ${x0 + 3300} ${Y(1900)}, ${x1} ${Y(1350)} L ${x1} ${Y(upper[0])} L ${x0} ${Y(upper[0])} Z" fill="#b49464"/>`;
      m += `<path d="M ${x0} ${Y(950)} C ${x0 + 900} ${Y(1250)}, ${x0 + 1900} ${Y(900)}, ${x0 + 2800} ${Y(1150)} S ${x1 - 300} ${Y(1000)}, ${x1} ${Y(1100)} L ${x1} ${Y(upper[0])} L ${x0} ${Y(upper[0])} Z" fill="#8f6f45"/>`;
      [[600, 1300], [760, 1180], [1900, 1450], [2050, 1350], [3200, 1500], [3900, 1250], [4050, 1300]].forEach(([x, y]) => {
        o += ""; m += `<path d="M ${x0 + x} ${Y(y + 700)} C ${x0 + x + 90} ${Y(y + 420)}, ${x0 + x + 80} ${Y(y + 120)}, ${x0 + x} ${Y(y)} C ${x0 + x - 80} ${Y(y + 120)}, ${x0 + x - 90} ${Y(y + 420)}, ${x0 + x} ${Y(y + 700)} Z" fill="#5f4a30"/>`;
      });
      m += `<path d="M ${x0 + 300} ${Y(2250)} q 200 -120 400 0 q 150 -90 300 0 M ${x0 + 2400} ${Y(2150)} q 250 -140 500 0 q 180 -100 360 0" fill="none" stroke="#9c7d52" stroke-width="10"/>`;
      o += `<g clip-path="url(#muralClip)">${m}</g>`;
      bays(4).forEach(([a, b]) => { o += panel(a, b, ...upper) + panel(a, b, ...lower); });
      return frameWall(o);
    },
  },
  {
    title: "5 · UPHOLSTERED WALL",
    line: "1940s Hollywood / Jean-Michel Frank — fabric or leather panels with brass nailheads; soft and quiet for the bed side",
    draw() {
      let o = "";
      bays(4, 120).forEach(([a, b]) => {
        o += R(a, upper[0], b, upper[1], `fill="#9b7f68" stroke="${INK}" stroke-width="6"`);
        for (let x = a + 60; x < b - 30; x += 60) o += `<line x1="${x}" y1="${Y(upper[1] - 40)}" x2="${x}" y2="${Y(upper[0] + 40)}" stroke="#8a6f59" stroke-width="3"/>`;
        const n = (a2, b2, y) => { let s = ""; for (let x = a2; x <= b2; x += 55) s += `<circle cx="${f(x)}" cy="${f(Y(y))}" r="11" fill="${BRASS}"/>`; return s; };
        o += n(a + 40, b - 40, upper[0] + 40) + n(a + 40, b - 40, upper[1] - 40);
        for (let y = upper[0] + 95; y < upper[1] - 60; y += 55) o += `<circle cx="${a + 40}" cy="${f(Y(y))}" r="11" fill="${BRASS}"/><circle cx="${b - 40}" cy="${f(Y(y))}" r="11" fill="${BRASS}"/>`;
        o += panel(a, b, ...lower);
      });
      return frameWall(o);
    },
  },
  {
    title: "6 · PARCHMENT SQUARES",
    line: "Jean-Michel Frank's Paris, 1930s — a grid of vellum-toned squares above the counter line; pale, rich, very quiet",
    draw() {
      let o = "", s = 380;
      const cols = Math.round((x1 - x0) / s), w = (x1 - x0) / cols, rows = Math.round((upper[1] + 310 - K.band[1] - 60) / s), h = (K.H - 60 - K.band[1]) / rows;
      for (let c = 0; c < cols; c++) for (let r = 0; r < rows; r++) {
        const t = rnd(), col = `rgb(${f(233 + t * 10)},${f(220 + t * 10)},${f(192 + t * 12)})`;
        o += R(x0 + c * w, K.band[1] + r * h, x0 + (c + 1) * w, K.band[1] + (r + 1) * h, `fill="${col}" stroke="#cdbb95" stroke-width="5"`);
      }
      o += `<line x1="${x0}" y1="${Y(K.H - 60)}" x2="${x1}" y2="${Y(K.H - 60)}" stroke="${INK}" stroke-width="5"/>`;
      bays(4).forEach(([a, b]) => { o += panel(a, b, ...lower); });
      return frameWall(o);
    },
  },
];

const pad = 300, gapX = 420, head = 620, cellH = K.H + 700;
const vbW = pad * 2 + K.L * 2 + gapX, vbH = head + Math.ceil(IDEAS.length / 2) * cellH;
let body = "";
IDEAS.forEach((idea, i) => {
  const cx = pad + (i % 2) * (K.L + gapX), cy = head + Math.floor(i / 2) * cellH;
  body += `<text x="${cx}" y="${cy + 120}" font-family="Georgia, 'Times New Roman', serif" font-size="150" fill="${INK}">${idea.title}</text>`;
  body += `<text x="${cx}" y="${cy + 230}" font-family="Helvetica, Arial, sans-serif" font-size="78" fill="${SOFT}">${idea.line}</text>`;
  body += `<g transform="translate(${cx} ${cy + 330})">${idea.draw()}</g>`;
});
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${vbW} ${vbH}" width="${f(vbW / 10)}" height="${f(vbH / 10)}">
<defs>
<radialGradient id="lampGlow"><stop offset="0" stop-color="#f6d9a4" stop-opacity=".55"/><stop offset="1" stop-color="#f6d9a4" stop-opacity="0"/></radialGradient>
<linearGradient id="mirror" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#d9dcd6"/><stop offset=".5" stop-color="#aeb3ad"/><stop offset="1" stop-color="#c9c6b8"/></linearGradient>
</defs>
<rect width="${vbW}" height="${vbH}" fill="${PAPER}"/>
<text x="${pad}" y="230" font-family="Georgia, 'Times New Roman', serif" font-size="190" letter-spacing="10" fill="${INK}">LEFT WALL · SIX IDEAS</text>
<text x="${pad}" y="370" font-family="Helvetica, Arial, sans-serif" font-size="80" letter-spacing="5" fill="${SOFT}">SEEN FROM THE ROOM · ENTRANCE DOOR D1 ON THE LEFT · STUDY BOOKCASE END ON THE RIGHT · DASHED LINE = PARTITION (APPROX.)</text>
<text x="${pad}" y="480" font-family="Helvetica, Arial, sans-serif" font-size="80" letter-spacing="5" fill="${SOFT}">EVERY IDEA CARRIES THE STUDY COUNTER LINE (570–610) ALONG THE WALL · SIZES AND DOOR POSITION ARE ESTIMATES</text>
${body}
</svg>`;
const out = path.join(__dirname, "..", "build", "left-wall-ideas.svg");
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, svg);
console.log("wrote", out);
