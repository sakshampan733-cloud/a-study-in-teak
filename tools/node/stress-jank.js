// Fresh loads, one after another: where the entrance ends up, and the longest frame the page could not paint
// in its first 10 s (a "stuck" moment the visitor sees). Long-animation-frame entries, buffered from the start.
const p = require("puppeteer-core");
const URL_ = process.argv[2] || "http://localhost:4178/v2/", N = +process.argv[3] || 10;
(async () => {
  const b = await p.launch({ executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", headless: "new", args: ["--autoplay-policy=no-user-gesture-required"] });
  const rows = [];
  for (let i = 0; i < N; i++) {
    const ctx = await b.createBrowserContext(); const pg = await ctx.newPage();
    await pg.setViewport(i % 2 ? { width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true } : { width: 1440, height: 900 });
    const errs = []; pg.on("pageerror", (e) => errs.push(e.message.slice(0, 100)));
    await pg.goto(URL_ + (URL_.includes("?") ? "&" : "?") + "r=" + i, { waitUntil: "domcontentloaded" }).catch((e) => errs.push("goto " + e.message));
    await new Promise((r) => setTimeout(r, 10000));
    const st = await pg.evaluate(() => {
      const h = document.querySelector(".hero"), v = document.querySelector(".hero-video");
      const lf = performance.getEntriesByType("long-animation-frame").map((e) => ({ t: Math.round(e.startTime), ms: Math.round(e.duration), src: (e.scripts || []).map((s) => (s.sourceURL || "").split("/").pop()).filter(Boolean).join(",") }));
      const worst = lf.sort((a, b) => b.ms - a.ms)[0] || { ms: 0 };
      return { intro: h?.dataset.intro, media: h?.dataset.media, ready: document.documentElement.classList.contains("is-ready"), playing: v && !v.paused && v.currentTime > 0, worst };
    }).catch((e) => ({ evalError: e.message }));
    rows.push({ i, phone: !!(i % 2), ...st, errs: errs.join(" | ") });
    await ctx.close();
  }
  rows.forEach((r) => console.log(JSON.stringify(r)));
  const w = rows.map((r) => r.worst?.ms || 0);
  console.log(`complete ${rows.filter((r) => r.intro === "complete" && r.ready).length}/${N}  playing ${rows.filter((r) => r.playing).length}/${N}  worst frame max ${Math.max(...w)} ms, median ${w.sort((a, b) => a - b)[Math.floor(N / 2)]} ms`);
  await b.close();
})();
