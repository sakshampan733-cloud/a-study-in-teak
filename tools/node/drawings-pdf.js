// Print the drawing sheets (cad/<key>.svg, A3 landscape) to PDF, so they can be downloaded and printed from the site:
//   cad/<key>.pdf          one sheet, one A3 page
//   cad/<family>-set.pdf   a flip-through PDF of a drawing's sheets (desk-square = general arrangement, details, 3D)
//   cad/all-drawings.pdf   every sheet, in the order the site shows them
// A family is a drawing's key without its "-details" / "-3d" suffix, so "desk-square", "desk-square-details" and
// "desk-square-3d" are one set; a drawing with no companions gets no set of its own.
//   node tools/node/drawings-pdf.js
const path = require("path"), fs = require("fs"), vm = require("vm");
const puppeteer = require(path.join(__dirname, "node_modules", "puppeteer-core"));
const ROOT = path.join(__dirname, "..", "..");
const CAD = path.join(ROOT, "cad");

// the order the site shows the drawings in: walk data.js's items in order, collecting their `drawings`
function siteOrder() {
  const ctx = { window: {} }; ctx.self = ctx.window;
  vm.runInNewContext(fs.readFileSync(path.join(ROOT, "data.js"), "utf8") + "\n;window.__P = typeof PROJECT !== 'undefined' ? PROJECT : window.PROJECT;", ctx);
  const seen = [], add = (k) => { if (typeof k === "string" && !seen.includes(k)) seen.push(k); };
  (function walk(o) {
    if (!o || typeof o !== "object") return;
    if (Array.isArray(o)) return o.forEach(walk);
    for (const [k, v] of Object.entries(o)) {
      if (k === "drawings" || k === "drawing") [].concat(v || []).forEach(add); else walk(v);
    }
  })(ctx.window.__P || ctx.window.PROJECT);
  return seen;
}
const have = fs.readdirSync(CAD).filter((f) => f.endsWith(".svg")).map((f) => f.slice(0, -4));
let order = siteOrder().filter((k) => have.includes(k));
for (const k of have) if (!order.includes(k)) order.push(k);                     // anything the site doesn't list, last
const JOIN = { "vanity-drawer": "vanity-c" };                       // sheets that belong to another drawing's set (scheme C's drawer)
const family = (k) => JOIN[k] || k.replace(/-(details|3d)$/, "");
const fams = {};
for (const k of order) (fams[family(k)] = fams[family(k)] || []).push(k);

const svgOf = (k) => fs.readFileSync(path.join(CAD, k + ".svg"), "utf8");
const SIZES = { a3: [420, 297, ""], a4: [297, 210, "-a4"] };      // A4 is the same sheet scaled to fit, not re-drawn
const page = (keys, [w, h]) => `<!doctype html><html><head><meta charset="utf-8"><style>
  @page { size: ${w}mm ${h}mm; margin: 0 } html, body { margin: 0; padding: 0; background: #fff }
  .s { width: ${w}mm; height: ${h}mm; page-break-after: always; overflow: hidden } .s:last-child { page-break-after: auto }
  .s svg { display: block; width: ${w}mm; height: ${h}mm }</style></head><body>${keys.map((k) => `<div class="s">${svgOf(k)}</div>`).join("")}</body></html>`;

(async () => {
  const b = await puppeteer.launch({ executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", headless: "new" });
  const pg = await b.newPage();
  const out = async (base, keys) => {
    for (const sz of Object.values(SIZES)) {
      const name = base + sz[2] + ".pdf";
      await pg.setContent(page(keys, sz), { waitUntil: "load" });
      await pg.pdf({ path: path.join(CAD, name), width: sz[0] + "mm", height: sz[1] + "mm", printBackground: true, preferCSSPageSize: true });
      console.log(name.padEnd(34), String(keys.length).padStart(2), "sheet(s)", (fs.statSync(path.join(CAD, name)).size / 1e6).toFixed(1).padStart(5), "MB");
    }
  };
  for (const k of order) await out(k, [k]);
  for (const [f, keys] of Object.entries(fams)) if (keys.length > 1) await out(f + "-set", keys);
  await out("all-drawings", order);
  await b.close();
})();
