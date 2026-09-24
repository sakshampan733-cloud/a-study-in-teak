const p = require("puppeteer-core");
(async () => {
  const b = await p.launch({ executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", headless: "new" });
  const pg = await b.newPage(); await pg.setViewport({ width: 1440, height: 900 });
  await pg.goto("https://www.ciridae.com", { waitUntil: "networkidle2", timeout: 60000 }); await new Promise(r => setTimeout(r, 6000));
  await pg.click(".nav_burger"); await new Promise(r => setTimeout(r, 2200));
  await pg.screenshot({ path: "../../design/ref-ciridae/menu-open.png" });
  const m = await pg.evaluate(() => {
    const walk = (e, d = 0) => { const c = getComputedStyle(e), r = e.getBoundingClientRect(); if (r.width === 0 && e.children.length === 0) return [];
      const t = e.children.length === 0 ? (e.textContent || "").trim().slice(0, 30) : "";
      return [" ".repeat(d * 2) + e.tagName + "." + String(e.className.baseVal ?? e.className).split(" ").slice(0, 3).join(".") + ` [${Math.round(r.x)},${Math.round(r.y)} ${Math.round(r.width)}x${Math.round(r.height)}] ${c.fontFamily.split(",")[0]} ${c.fontSize}/${c.lineHeight} ls${c.letterSpacing} ${c.textTransform} op${c.opacity} ${t ? '"' + t + '"' : ""}`,
        ...[...e.children].slice(0, 12).flatMap((k) => (d < 6 ? walk(k, d + 1) : []))]; };
    return walk(document.querySelector(".burger")).join("\n");
  });
  console.log(m); await b.close();
})();
