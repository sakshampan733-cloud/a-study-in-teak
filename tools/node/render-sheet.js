// Render one drawing sheet to SVG + PNG for review: node tools/node/render-sheet.js drawings/x.js <key> [out-dir]
const fs = require("fs"), path = require("path");
const root = path.join(__dirname, "..", "..");
const [file, key, outDir = "build/final"] = process.argv.slice(2);
global.window = {};
require(path.join(root, "drawings/kit.js"));
require(path.join(root, file));
const d = window.DRAWINGS[key];
if (!d) { console.error("no sheet", key, Object.keys(window.DRAWINGS)); process.exit(1); }
const out = path.join(root, outDir);
fs.mkdirSync(out, { recursive: true });
const svg = d.svg.replace("<svg ", '<svg width="2520" height="1782" ');
fs.writeFileSync(path.join(out, key + ".svg"), svg);
(async () => {
  const p = require(path.join(root, "tools/node/node_modules/puppeteer-core"));
  const b = await p.launch({ executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", headless: "new" });
  const pg = await b.newPage();
  await pg.setViewport({ width: 2520, height: 1782 });
  await pg.goto("file://" + path.join(out, key + ".svg"));
  await pg.screenshot({ path: path.join(out, key + ".png") });
  await b.close();
  console.log("wrote", path.join(outDir, key + ".png"));
})();
