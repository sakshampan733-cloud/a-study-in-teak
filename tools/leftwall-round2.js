// Left wall — round 2: teak wainscot ideas, a little modern (clean, no leader lines).
// node tools/leftwall-round2.js  →  build/left-wall-round2.svg
// Seen from the room: entrance door D1 at the left, study bookcase end (full height) at the right.
// Every idea keeps the study counter line (570–610) as a reeded teak strip.
const fs = require("fs"), path = require("path");

const K = {
  L: 5792, H: 2743,                              // estimates — confirm on site
  band: [570, 610],
  door: { x: 150, w: 914, h: 2438, arch: 65 },   // D1 3 ft × 8 ft; position to confirm
  book: 280,
  partition: 5792 - 2439,
};
const x0 = K.door.x + K.door.w + K.door.arch, x1 = K.L - K.book, doorTop = K.door.h + K.door.arch;

const INK = "#262626", SOFT = "#8a8479", PAPER = "#faf8f4", WALL = "#f1ece3", TEAK = "#bd8c5e", TEAK_L = "#c99a6c", TEAK_D = "#7f5836", BRASS = "#b48a3c";
const f = (n) => +n.toFixed(1);
const Y = (y) => K.H - y;
const R = (a, b, c, d, attr) => `<rect x="${f(a)}" y="${f(Y(d))}" width="${f(c - a)}" height="${f(d - b)}" ${attr}/>`;
const L = (a, b, c, d, attr) => `<line x1="${f(a)}" y1="${f(Y(b))}" x2="${f(c)}" y2="${f(Y(d))}" ${attr}/>`;

// a field of teak veneer with a soft grain
function teak(a, b, lo, hi) {
  let o = R(a, lo, b, hi, `fill="${TEAK}"`);
  for (let x = a + 37, k = 0; x < b; x += 37 + ((k++ * 13) % 29)) o += L(x, lo, x + 6, hi, `stroke="${TEAK_L}" stroke-width="3" opacity=".6"`);
  return o;
}
function bays(n, stile) {
  const w = (x1 - x0 - stile * (n + 1)) / n;
  return Array.from({ length: n }, (_, i) => { const a = x0 + stile + i * (w + stile); return [a, a + w]; });
}
// slim modern moulding: one crisp frame and an inner bead, in darker teak
const mould = (a, b, lo, hi) => R(a, lo, b, hi, `fill="none" stroke="${TEAK_D}" stroke-width="12"`) + R(a + 30, lo + 30, b - 30, hi - 30, `fill="none" stroke="${TEAK_D}" stroke-width="4"`);
// reeded counter line and a cap rail
function reed(a, b) {
  let o = R(a, K.band[0], b, K.band[1], `fill="${TEAK_D}" stroke="${INK}" stroke-width="4"`);
  for (let i = 1; i < 4; i++) o += L(a, K.band[0] + i * 10, b, K.band[0] + i * 10, `stroke="${TEAK_L}" stroke-width="3"`);
  return o;
}
const cap = (a, b, y, h = 50) => R(a - 10, y, b, y + h, `fill="${TEAK_D}" stroke="${INK}" stroke-width="5"`) + L(a - 10, y + h * 0.45, b, y + h * 0.45, `stroke="${TEAK_L}" stroke-width="3"`);

function shell(inner) {
  let o = R(0, 0, K.L, K.H, `fill="${WALL}"`) + inner;
  const d = K.door;
  o += R(d.x - d.arch, 0, d.x + d.w + d.arch, doorTop, `fill="${TEAK_D}" stroke="${INK}" stroke-width="6"`) + R(d.x, 0, d.x + d.w, d.h, `fill="${TEAK}" stroke="${INK}" stroke-width="4"`);
  o += `<text x="${d.x + d.w / 2}" y="${Y(d.h / 2)}" text-anchor="middle" font-family="Helvetica, Arial, sans-serif" font-size="80" letter-spacing="6" fill="${PAPER}">D1</text>`;
  o += R(x1, 0, K.L, K.H, `fill="${TEAK}" stroke="${INK}" stroke-width="6"`) + R(x1 - 20, K.band[0], K.L, K.band[1], `fill="${TEAK_D}" stroke="${INK}" stroke-width="4"`);
  o += `<line x1="${K.partition}" y1="-60" x2="${K.partition}" y2="${K.H + 60}" stroke="${SOFT}" stroke-width="6" stroke-dasharray="50 35"/>`;
  o += `<line x1="-150" y1="${K.H}" x2="${K.L + 150}" y2="${K.H}" stroke="${INK}" stroke-width="12"/><line x1="-150" y1="0" x2="${K.L + 150}" y2="0" stroke="${INK}" stroke-width="6"/>`;
  return o;
}
// height marker on the right edge, outside the wall
const mark = (y, t) => `<line x1="${K.L + 40}" y1="${Y(y)}" x2="${K.L + 260}" y2="${Y(y)}" stroke="${SOFT}" stroke-width="5"/><text x="${K.L + 290}" y="${Y(y) + 28}" font-family="Helvetica, Arial, sans-serif" font-size="80" fill="${SOFT}">${t}</text>`;

const IDEAS = [
  {
    title: "1 · YOUR IDEA — TEAK TO ONE THIRD",
    line: "Teak wainscot to 915 (3 ft) with long mouldings and a cap; the counter line runs through it as a reed",
    verdict: "Good, but on a 9 ft wall the wood reads low and the plain wall above feels big — as you suspected",
    draw() {
      const top = 915;
      let o = teak(x0, x1, 0, top);
      bays(4, 110).forEach(([a, b]) => { o += mould(a, b, 120, K.band[0] - 70); o += mould(a, b, K.band[1] + 60, top - 60 > K.band[1] + 150 ? top - 60 : K.band[1] + 150); });
      o += reed(x0, x1) + cap(x0, x1, top) + R(x0, 0, x1, 90, `fill="${TEAK_D}"`);
      return shell(o) + mark(915, "915") + mark(610, "610");
    },
  },
  {
    title: "2 · TEAK TO THE TOP OF THE DOOR",
    line: "Wood runs up to the head of D1 — the strongest line on the wall — with long moulded panels; plain band above",
    verdict: "Recommended: timeless, lines up with the door and the counter, and the plain band keeps it light",
    best: true,
    draw() {
      let o = teak(x0, x1, 0, doorTop);
      bays(4, 110).forEach(([a, b]) => { o += mould(a, b, 120, K.band[0] - 70) + mould(a, b, K.band[1] + 90, doorTop - 110); });
      o += reed(x0, x1) + cap(x0, x1, doorTop, 45) + R(x0, 0, x1, 90, `fill="${TEAK_D}"`);
      return shell(o) + mark(doorTop, "2503 = DOOR HEAD") + mark(610, "610");
    },
  },
  {
    title: "3 · FLUSH TEAK, SHADOW LINES",
    line: "Full-height teak veneer in wide boards with fine V-joints, no mouldings; shadow gaps at floor and ceiling",
    verdict: "The most modern — very calm, lets the grain do the work; a lot of wood beside the bookcase",
    draw() {
      let o = teak(x0, x1, 25, K.H - 25);
      const n = 7, w = (x1 - x0) / n;
      for (let i = 1; i < n; i++) o += L(x0 + i * w, 25, x0 + i * w, K.H - 25, `stroke="${TEAK_D}" stroke-width="6"`);
      o += L(x0, 25, x1, 25, `stroke="${INK}" stroke-width="10"`) + L(x0, K.H - 25, x1, K.H - 25, `stroke="${INK}" stroke-width="10"`);
      o += reed(x0, x1);
      return shell(o) + mark(610, "610");
    },
  },
  {
    title: "4 · PLAIN WALL, ONE LINE",
    line: "Painted wall, recessed shadow-gap skirting and a single teak reed on the counter line; one large artwork, picture light",
    verdict: "Cheapest and quietest — lets the desk, bookcase and right wall carry the room",
    draw() {
      let o = R(x0, 0, x1, 70, `fill="${TEAK_D}"`) + L(x0, 70, x1, 70, `stroke="${INK}" stroke-width="4"`) + L(x0, 80, x1, 80, `stroke="${SOFT}" stroke-width="10"`);
      o += reed(x0, x1);
      const cx = (x0 + x1) / 2 + 150, aw = 1800, ah = 1150, ay = 1050;
      o += R(cx - aw / 2, ay, cx + aw / 2, ay + ah, `fill="#d8cdb8" stroke="${INK}" stroke-width="10"`) + R(cx - aw / 2 + 90, ay + 90, cx + aw / 2 - 90, ay + ah - 90, `fill="#cbbd9f" stroke="${SOFT}" stroke-width="4"`);
      o += `<text x="${f(cx)}" y="${Y(ay + ah / 2) + 25}" text-anchor="middle" font-family="Helvetica, Arial, sans-serif" font-size="70" letter-spacing="8" fill="${SOFT}">ARTWORK</text>`;
      o += R(cx - 380, ay + ah + 90, cx + 380, ay + ah + 130, `fill="${BRASS}" stroke="${INK}" stroke-width="4"`) + L(cx, ay + ah + 90, cx, ay + ah + 30, `stroke="${INK}" stroke-width="8"`);
      o += `<ellipse cx="${f(cx)}" cy="${Y(ay + ah - 150)}" rx="900" ry="380" fill="url(#lampGlow)"/>`;
      return shell(o) + mark(610, "610");
    },
  },
];

const pad = 300, gapX = 1400, head = 620, cellH = K.H + 800;
const vbW = pad * 2 + K.L * 2 + gapX, vbH = head + Math.ceil(IDEAS.length / 2) * cellH;
let body = "";
IDEAS.forEach((idea, i) => {
  const cx = pad + (i % 2) * (K.L + gapX), cy = head + Math.floor(i / 2) * cellH;
  body += `<text x="${cx}" y="${cy + 120}" font-family="Georgia, 'Times New Roman', serif" font-size="150" fill="${INK}">${idea.title}</text>`;
  if (idea.best) body += `<text x="${cx + K.L}" y="${cy + 120}" text-anchor="end" font-family="Helvetica, Arial, sans-serif" font-size="80" letter-spacing="10" fill="${BRASS}">RECOMMENDED</text>`;
  body += `<text x="${cx}" y="${cy + 230}" font-family="Helvetica, Arial, sans-serif" font-size="78" fill="${SOFT}">${idea.line}</text>`;
  body += `<g transform="translate(${cx} ${cy + 330})">${idea.draw()}</g>`;
  body += `<text x="${cx}" y="${cy + 330 + K.H + 150}" font-family="Helvetica, Arial, sans-serif" font-size="78" fill="${INK}">${idea.verdict}</text>`;
});
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${vbW} ${vbH}" width="${f(vbW / 10)}" height="${f(vbH / 10)}">
<defs><radialGradient id="lampGlow"><stop offset="0" stop-color="#f6d9a4" stop-opacity=".5"/><stop offset="1" stop-color="#f6d9a4" stop-opacity="0"/></radialGradient></defs>
<rect width="${vbW}" height="${vbH}" fill="${PAPER}"/>
<text x="${pad}" y="230" font-family="Georgia, 'Times New Roman', serif" font-size="190" letter-spacing="10" fill="${INK}">LEFT WALL · TEAK, A LITTLE MODERN</text>
<text x="${pad}" y="370" font-family="Helvetica, Arial, sans-serif" font-size="80" letter-spacing="5" fill="${SOFT}">SEEN FROM THE ROOM · ENTRANCE DOOR D1 ON THE LEFT · STUDY BOOKCASE END ON THE RIGHT · DASHED LINE = PARTITION (APPROX.)</text>
<text x="${pad}" y="480" font-family="Helvetica, Arial, sans-serif" font-size="80" letter-spacing="5" fill="${SOFT}">EVERY IDEA CARRIES THE STUDY COUNTER LINE (570–610) AS A REEDED TEAK STRIP · 9 FT CEILING · SIZES ARE ESTIMATES</text>
${body}
</svg>`;
const out = path.join(__dirname, "..", "build", "left-wall-round2.svg");
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, svg);
console.log("wrote", out);
