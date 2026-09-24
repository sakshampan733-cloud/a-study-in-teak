const p = require("puppeteer-core"), path = require("path");
const cond = ["Barlow Condensed", "Roboto Condensed", "Archivo Narrow", "IBM Plex Sans Condensed", "Saira Condensed", "Oswald"];
const body = ["Arimo", "Inter", "Figtree", "Instrument Sans", "Albert Sans", "Hanken Grotesk"];
(async () => {
  const b = await p.launch({ executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", headless: "new" });
  const pg = await b.newPage(); await pg.setViewport({ width: 900, height: 900, deviceScaleFactor: 2 });
  // their actual faces, rendered by their own page
  await pg.goto("https://www.ciridae.com", { waitUntil: "networkidle2", timeout: 60000 }); await new Promise(r => setTimeout(r, 5000));
  const fam = [...cond, ...body].map(f => "family=" + f.replace(/ /g, "+") + ":wght@400").join("&");
  const html = `<link href="https://fonts.googleapis.com/css2?${fam}&display=block" rel="stylesheet"><style>#cmp{color:#fff;font-size:32px}
    .r{display:flex;gap:18px;align-items:baseline;margin:6px 0}.l{font:12px monospace;color:#c96;width:190px;flex:none}
    .h{text-transform:uppercase;letter-spacing:-.02em;line-height:1.05}.b{text-transform:uppercase;font-size:16px;letter-spacing:-.02em}</style>
    <div class=r><span class=l>CIRIDAE Pragmatica Cond</span><span class=h style="font-family:'Pragmatica Cond'">The first operating systems ran computers.</span></div>
    ${cond.map(f => `<div class=r><span class=l>${f}</span><span class=h style="font-family:'${f}'">The first operating systems ran computers.</span></div>`).join("")}
    <hr style="border-color:#333"><div class=r><span class=l>CIRIDAE Pragmatica</span><span class=b style="font-family:'Pragmatica'">Automate the mundane · Today's economy demands</span></div>
    ${body.map(f => `<div class=r><span class=l>${f}</span><span class=b style="font-family:'${f}'">Automate the mundane · Today's economy demands</span></div>`).join("")}`;
  await pg.evaluate((h) => {
    const [link, rest] = [h.slice(0, h.indexOf("<style>")), h.slice(h.indexOf("<style>"))];
    document.head.insertAdjacentHTML("beforeend", link);
    const box = document.createElement("div"); box.id = "cmp"; box.innerHTML = rest;
    box.style.cssText = "position:fixed;inset:0;z-index:2147483647;background:#0b0b0b;overflow:auto;padding:24px";
    document.body.appendChild(box); document.documentElement.style.overflow = "hidden";
  }, html);
  await pg.evaluate(() => document.fonts.ready); await new Promise(r => setTimeout(r, 2500));
  await pg.screenshot({ path: path.resolve("/private/tmp/claude-501/-Users-sakshampanchal-my-room-/782e1c89-2542-4142-ba4f-b13682a21e22/scratchpad/fonts.png"), fullPage: false });
  await b.close();
})();
