// Left wall — round 3: three directions after Newberry Projects (clean, no leader lines).
// node tools/leftwall-newberry.js  →  build/left-wall-newberry.svg
// Seen from the room: entrance door D1 at the left, study bookcase end (full height) at the right.
// All three keep the study counter line (570–610) as a reeded teak rail and stop the frame at the door head (2503).
const fs = require("fs"), path = require("path");

const K = {
  L: 5792, H: 2743,                              // estimates — confirm on site
  band: [570, 610],
  door: { x: 150, w: 914, h: 2438, arch: 65 },   // D1 3 ft × 8 ft; position to confirm
  book: 280,
  stile: 120,
};
const x0 = K.door.x + K.door.w + K.door.arch, x1 = K.L - K.book, head = K.door.h + K.door.arch;

const INK = "#262626", SOFT = "#8a8479", PAPER = "#faf8f4", WALL = "#f1ece3", TEAK = "#bd8c5e", TEAK_L = "#d2a679", TEAK_D = "#7a5334", BRASS = "#b48a3c", LINEN = "#e6dccb";
const f = (n) => +n.toFixed(1);
const Y = (y) => K.H - y;
const R = (a, b, c, d, attr) => `<rect x="${f(a)}" y="${f(Y(d))}" width="${f(c - a)}" height="${f(d - b)}" ${attr}/>`;
const L = (a, b, c, d, attr) => `<line x1="${f(a)}" y1="${f(Y(b))}" x2="${f(c)}" y2="${f(Y(d))}" ${attr}/>`;

// n equal openings between stiles across the run
function openings(n, s = K.stile) {
  const w = (x1 - x0 - s * (n + 1)) / n;
  return Array.from({ length: n }, (_, i) => { const a = x0 + s + i * (w + s); return [a, a + w]; });
}
function reed(a, b) {
  let o = R(a, K.band[0], b, K.band[1], `fill="${TEAK_D}" stroke="${INK}" stroke-width="4"`);
  for (let i = 1; i < 4; i++) o += L(a, K.band[0] + i * 10, b, K.band[0] + i * 10, `stroke="${TEAK_L}" stroke-width="3"`);
  return o;
}
// teak framework: skirting, reeded rail, head rail at the door head, stiles; openings filled by `fill`
function framework(n, fill, s = K.stile) {
  const O = openings(n, s);
  let o = R(x0, 0, x1, head + 60, `fill="${TEAK}"`);
  O.forEach(([a, b]) => { o += fill(a, b, 150, K.band[0] - 40, "low") + fill(a, b, K.band[1] + 40, head - 40, "high"); });
  O.forEach(([a, b]) => { [[150, K.band[0] - 40], [K.band[1] + 40, head - 40]].forEach(([lo, hi]) => { o += R(a, lo, b, hi, `fill="none" stroke="${TEAK_D}" stroke-width="8"`) + R(a - 14, lo - 14, b + 14, hi + 14, `fill="none" stroke="${TEAK_L}" stroke-width="3"`); }); });
  o += R(x0, 0, x1, 100, `fill="${TEAK_D}"`) + reed(x0, x1) + R(x0 - 10, head, x1, head + 60, `fill="${TEAK_D}" stroke="${INK}" stroke-width="5"`) + L(x0 - 10, head + 25, x1, head + 25, `stroke="${TEAK_L}" stroke-width="3"`);
  return { svg: o, O, s };
}
function sconce(cx, cy) {
  let o = `<ellipse cx="${f(cx)}" cy="${Y(cy) - 60}" rx="320" ry="260" fill="url(#glow)"/><g stroke="${INK}" stroke-width="4">`;
  o += `<rect x="${f(cx - 22)}" y="${Y(cy) - 40}" width="44" height="260" rx="8" fill="${BRASS}"/><path d="M ${f(cx - 70)} ${Y(cy) - 250} L ${f(cx + 70)} ${Y(cy) - 250} L ${f(cx + 50)} ${Y(cy) - 40} L ${f(cx - 50)} ${Y(cy) - 40} Z" fill="#f4e7cf"/>`;
  return o + "</g>";
}
function shell(inner) {
  let o = R(0, 0, K.L, K.H, `fill="${WALL}"`) + inner;
  const d = K.door;
  o += R(d.x - d.arch, 0, d.x + d.w + d.arch, head, `fill="${TEAK_D}" stroke="${INK}" stroke-width="6"`) + R(d.x, 0, d.x + d.w, d.h, `fill="${TEAK}" stroke="${INK}" stroke-width="4"`);
  o += `<text x="${d.x + d.w / 2}" y="${Y(d.h / 2)}" text-anchor="middle" font-family="Helvetica, Arial, sans-serif" font-size="80" letter-spacing="6" fill="${PAPER}">D1</text>`;
  o += R(x1, 0, K.L, K.H, `fill="${TEAK}" stroke="${INK}" stroke-width="6"`) + R(x1 - 20, K.band[0], K.L, K.band[1], `fill="${TEAK_D}" stroke="${INK}" stroke-width="4"`);
  o += `<line x1="-150" y1="${K.H}" x2="${K.L + 150}" y2="${K.H}" stroke="${INK}" stroke-width="12"/><line x1="-150" y1="0" x2="${K.L + 150}" y2="0" stroke="${INK}" stroke-width="6"/>`;
  return o;
}

const IDEAS = [
  {
    title: "A · LINEN IN TEAK FRAMES",
    line: "After 'form-led details' — tall woven-linen panels held in a slim teak frame, lamps on the stiles",
    verdict: "Recommended: your teak and long lines, softened by fabric; timeless, warm, quiet next to the bookcase",
    best: true,
    draw() {
      const fw = framework(5, (a, b, lo, hi) => R(a, lo, b, hi, `fill="url(#linen)"`));
      let o = fw.svg;
      [1, 3].forEach((k) => { const cx = fw.O[k][0] - fw.s / 2; o += sconce(cx, 1500); });
      [2, 4].forEach((k) => { const cx = fw.O[k][0] - fw.s / 2; o += sconce(cx, 1500); });
      return shell(o);
    },
  },
  {
    title: "B · AGED METAL-LEAF PANELS",
    line: "After your bed reference — copper-leaf panels in dark teak frames, so the wall and the bed back speak together",
    verdict: "The richest — glows at night under warm light; best if the bed back uses the same leaf",
    draw() {
      const fw = framework(4, (a, b, lo, hi) => {
        let g = R(a, lo, b, hi, `fill="url(#leaf)"`);
        for (let y = lo + 160; y < hi; y += 160) g += L(a, y, b, y, `stroke="#6e4a2c" stroke-width="3" opacity=".45"`);
        for (let x = a + 160; x < b; x += 160) g += L(x, lo, x, hi, `stroke="#6e4a2c" stroke-width="3" opacity=".45"`);
        return g;
      }, 150);
      let o = fw.svg.replace(new RegExp(`fill="${TEAK}"`), `fill="${TEAK_D}"`);
      [1, 3].forEach((k) => { o += sconce(fw.O[k][0] - fw.s / 2, 1500); });
      return shell(o);
    },
  },
  {
    title: "C · ONE CARVED TEAK PANEL",
    line: "After 'impactful details' — linen panels either side of one deep-framed teak panel with a carved sunburst grain",
    verdict: "A single statement piece; the rest stays calm — works if nothing large hangs on this wall",
    draw() {
      const fw = framework(5, (a, b, lo, hi, zone) => R(a, lo, b, hi, `fill="url(#linen)"`));
      let o = fw.svg;
      const [a, b] = fw.O[2], lo = K.band[1] + 40, hi = head - 40, cx = (a + b) / 2;
      o += `<clipPath id="sunClip"><rect x="${f(a)}" y="${f(Y(hi))}" width="${f(b - a)}" height="${f(hi - lo)}"/></clipPath>`;
      let rays = R(a, lo, b, hi, `fill="${TEAK}"`);
      for (let t = -80; t <= 80; t += 4) { const r = (t * Math.PI) / 180; rays += `<line x1="${f(cx)}" y1="${f(Y(lo + 60))}" x2="${f(cx + Math.sin(r) * 1950)}" y2="${f(Y(lo + 60) - Math.cos(r) * 1950)}" stroke="${t % 8 ? TEAK_L : TEAK_D}" stroke-width="${t % 8 ? 4 : 7}"/>`; }
      o += `<g clip-path="url(#sunClip)">${rays}</g>`;
      o += R(a - 60, lo - 60, b + 60, hi + 60, `fill="none" stroke="${TEAK_D}" stroke-width="40"`) + R(a - 90, lo - 90, b + 90, hi + 90, `fill="none" stroke="${INK}" stroke-width="5"`);
      return shell(o);
    },
  },
];

const pad = 300, gapY = 900, top = 640;
const vbW = pad * 2 + K.L, vbH = top + IDEAS.length * (K.H + gapY);
let body = "";
IDEAS.forEach((idea, i) => {
  const cy = top + i * (K.H + gapY);
  body += `<text x="${pad}" y="${cy + 110}" font-family="Georgia, 'Times New Roman', serif" font-size="150" fill="${INK}">${idea.title}</text>`;
  if (idea.best) body += `<text x="${pad + K.L}" y="${cy + 110}" text-anchor="end" font-family="Helvetica, Arial, sans-serif" font-size="80" letter-spacing="10" fill="${BRASS}">RECOMMENDED</text>`;
  body += `<text x="${pad}" y="${cy + 220}" font-family="Helvetica, Arial, sans-serif" font-size="78" fill="${SOFT}">${idea.line}</text>`;
  body += `<g transform="translate(${pad} ${cy + 320})">${idea.draw()}</g>`;
  body += `<text x="${pad}" y="${cy + 320 + K.H + 140}" font-family="Helvetica, Arial, sans-serif" font-size="78" fill="${INK}">${idea.verdict}</text>`;
});
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${vbW} ${vbH}" width="${f(vbW / 8)}" height="${f(vbH / 8)}">
<defs>
<radialGradient id="glow"><stop offset="0" stop-color="#f6d9a4" stop-opacity=".6"/><stop offset="1" stop-color="#f6d9a4" stop-opacity="0"/></radialGradient>
<pattern id="linen" patternUnits="userSpaceOnUse" width="24" height="24"><rect width="24" height="24" fill="${LINEN}"/><path d="M0 6h24M0 18h24" stroke="#d6cab5" stroke-width="3"/><path d="M6 0v24M18 0v24" stroke="#ddd2bf" stroke-width="2"/></pattern>
<linearGradient id="leaf" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#9a6a45"/><stop offset=".35" stop-color="#c08a5c"/><stop offset=".6" stop-color="#7d5a44"/><stop offset=".85" stop-color="#b98457"/><stop offset="1" stop-color="#6f5040"/></linearGradient>
</defs>
<rect width="${vbW}" height="${vbH}" fill="${PAPER}"/>
<text x="${pad}" y="230" font-family="Georgia, 'Times New Roman', serif" font-size="180" letter-spacing="10" fill="${INK}">LEFT WALL · AFTER NEWBERRY PROJECTS</text>
<text x="${pad}" y="360" font-family="Helvetica, Arial, sans-serif" font-size="76" letter-spacing="5" fill="${SOFT}">SEEN FROM THE ROOM · D1 ON THE LEFT · BOOKCASE END ON THE RIGHT · TEAK FRAME TO THE DOOR HEAD (2503)</text>
<text x="${pad}" y="470" font-family="Helvetica, Arial, sans-serif" font-size="76" letter-spacing="5" fill="${SOFT}">REEDED TEAK RAIL ON THE STUDY COUNTER LINE (570–610) · PLAIN WALL ABOVE · SIZES ARE ESTIMATES</text>
${body}
</svg>`;
const out = path.join(__dirname, "..", "build", "left-wall-newberry.svg");
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, svg);
console.log("wrote", out);
