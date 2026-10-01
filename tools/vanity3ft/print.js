// Print the vanity sheets (SVG) to one A3-landscape PDF, and a PNG of each sheet for checking.
//   node tools/vanity3ft/print.js
const path = require("path"), fs = require("fs");
const p = require(path.join(__dirname, "..", "node", "node_modules", "puppeteer-core"));
const dir = path.join(__dirname, "..", "..", "share", "vanity-3ft");
(async () => {
  const sheets = ["sheet1.svg", "sheet2.svg", "sheet3.svg"].map(f => fs.readFileSync(path.join(dir, f), "utf8"));
  const html = `<!doctype html><html><head><meta charset="utf-8"><style>@page{size:420mm 297mm;margin:0}html,body{margin:0;padding:0}
    .s{width:420mm;height:297mm;page-break-after:always;overflow:hidden}.s:last-child{page-break-after:auto}svg{display:block}</style></head><body>
    ${sheets.map(s => `<div class="s">${s}</div>`).join("")}</body></html>`;
  const b = await p.launch({ executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", headless: "new" });
  const pg = await b.newPage();
  await pg.setContent(html, { waitUntil: "load" });
  await pg.pdf({ path: path.join(dir, "vanity-3ft.pdf"), width: "420mm", height: "297mm", printBackground: true, preferCSSPageSize: true });
  for (let i = 0; i < sheets.length; i++) {
    const one = `<!doctype html><html><body style="margin:0">${sheets[i].replace('width="420.0mm" height="297.0mm"', 'width="2520" height="1782"')}</body></html>`;
    await pg.setViewport({ width: 2520, height: 1782 });
    await pg.setContent(one, { waitUntil: "load" });
    await pg.screenshot({ path: path.join(dir, `preview-sheet${i + 1}.png`) });
  }
  await b.close();
  console.log("printed", dir);
})();
