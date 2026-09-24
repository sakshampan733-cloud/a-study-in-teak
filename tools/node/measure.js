const p = require("puppeteer-core");
(async () => {
  const b = await p.launch({ executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", headless: "new" });
  const pg = await b.newPage(); await pg.setViewport({ width: 1440, height: 900 });
  await pg.goto("https://www.ciridae.com", { waitUntil: "networkidle2", timeout: 60000 }); await new Promise(r => setTimeout(r, 6500));
  const out = await pg.evaluate(() => {
    const st = (e) => { if (!e) return null; const c = getComputedStyle(e), r = e.getBoundingClientRect();
      return { txt: (e.innerText || "").trim().slice(0, 30), font: c.fontFamily.split(",")[0], size: c.fontSize, lh: c.lineHeight, ls: c.letterSpacing, wt: c.fontWeight, tt: c.textTransform, color: c.color, bg: c.backgroundColor, radius: c.borderRadius, border: c.borderTopWidth + " " + c.borderTopColor, pad: c.padding, w: Math.round(r.width), h: Math.round(r.height), x: Math.round(r.x), y: Math.round(r.y + scrollY) }; };
    const byText = (t) => [...document.querySelectorAll("body *")].find((e) => e.children.length === 0 && (e.innerText || "").trim().toUpperCase().startsWith(t));
    const secs = [...document.querySelectorAll("section")].map((s) => { const c = getComputedStyle(s); return { pt: c.paddingTop, pb: c.paddingBottom, bg: c.backgroundColor, h: s.offsetHeight }; });
    const card = document.querySelector("[class*=card]");
    return {
      nav_start: st(byText("START NOW")), nav_menu: st(byText("MENU")),
      hero_label: st(byText("AUTOMATE THE MUNDANE")), hero_cta: st(byText("TODAY'S ECONOMY")),
      eyebrow: st(byText("AI TRANSFORMATION")), headline: st(byText("THE FIRST OPERATING")),
      era_eyebrow: st(byText("A NEW ERA")), era_body: st(byText("THERE ARE TWO KINDS")),
      card: st(card), card_num: st(byText("01")), body_bg: getComputedStyle(document.body).backgroundColor, sections: secs };
  });
  console.log(JSON.stringify(out, null, 1));
  await b.close();
})();
