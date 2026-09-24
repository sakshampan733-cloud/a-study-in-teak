const p = require("puppeteer-core");
(async () => {
  const b = await p.launch({ executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", headless: "new" });
  const pg = await b.newPage(); await pg.setViewport({ width: 1440, height: 900 });
  await pg.goto("https://www.ciridae.com", { waitUntil: "networkidle2", timeout: 60000 }); await new Promise(r => setTimeout(r, 6500));
  const out = await pg.evaluate(() => {
    const box = (e) => { if (!e) return null; const c = getComputedStyle(e), r = e.getBoundingClientRect();
      return { tag: e.tagName, cls: String(e.className.baseVal ?? e.className).slice(0, 60), x: +r.x.toFixed(1), y: +r.y.toFixed(1), w: +r.width.toFixed(1), h: +r.height.toFixed(1),
        radius: c.borderRadius, border: `${c.borderTopWidth} ${c.borderTopStyle} ${c.borderTopColor}`, bg: c.backgroundColor, pad: c.padding, gap: c.gap, op: c.opacity, filter: c.filter, bf: c.backdropFilter, z: c.zIndex, pos: c.position, blend: c.mixBlendMode }; };
    const nav = document.querySelector("nav");
    const navEls = nav ? [...nav.querySelectorAll("a,button")].map(box) : [];
    const logo = document.querySelector("[data-home-hero-intro-logo]");
    const hero = logo?.closest("section");
    return { nav: box(nav), navEls, logo: box(logo), logoKids: logo ? [...logo.children].map(box) : [],
      curtain: box(document.querySelector(".home-hero_curtain")), heroBg: box(document.querySelector(".hero_bg")),
      heroBgKids: [...(document.querySelector(".hero_bg")?.querySelectorAll("*") || [])].map(box),
      hero: box(hero), heroKids: hero ? [...hero.children].map(box) : [] };
  });
  console.log(JSON.stringify(out, null, 1));
  await b.close();
})();
