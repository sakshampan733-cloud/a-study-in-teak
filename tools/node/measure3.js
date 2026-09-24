const p = require("puppeteer-core");
(async () => {
  const b = await p.launch({ executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", headless: "new" });
  const pg = await b.newPage(); await pg.setViewport({ width: 1440, height: 900 });
  await pg.goto(process.argv[2], { waitUntil: "networkidle2", timeout: 60000 }); await new Promise(r => setTimeout(r, 6500));
  const out = await pg.evaluate(() => {
    const R = (e) => { const r = e.getBoundingClientRect(); return [Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height)]; };
    const lines = [...document.querySelectorAll("[data-home-hero-intro-line-lock], [data-line-lock]")].map((e) => ({ t: e.textContent.trim().slice(0, 30), r: R(e), lh: getComputedStyle(e).lineHeight, fs: getComputedStyle(e).fontSize }));
    const logo = document.querySelector("[data-home-hero-intro-logo], [data-intro-logo]");
    const parts = logo ? [...logo.querySelectorAll("svg, path, div")].slice(0, 12).map((e) => ({ tag: e.tagName, cls: String(e.className.baseVal ?? e.className).slice(0, 30), r: R(e) })) : [];
    return { lines, logo: logo && R(logo), parts };
  });
  console.log(JSON.stringify(out, null, 1)); await b.close();
})();
