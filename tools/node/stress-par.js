// The same check, but K fresh pages at once — the machine under load, as it was during review.
const p = require("puppeteer-core");
const URL_ = process.argv[2] || "http://localhost:4178/v2/", K = +process.argv[3] || 12;
(async () => {
  const b = await p.launch({ executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", headless: "new", args: ["--autoplay-policy=no-user-gesture-required"] });
  const run = async (i) => {
    const ctx = await b.createBrowserContext(); const pg = await ctx.newPage();
    if (i % 2) await pg.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true }); else await pg.setViewport({ width: 1440, height: 900 });
    const errs = []; pg.on("pageerror", (e) => errs.push("pageerror: " + e.message.slice(0, 160)));
    pg.on("requestfailed", (r) => errs.push("reqfail " + r.url().split("/").pop() + " " + (r.failure()?.errorText || "")));
    const t0 = Date.now(); await pg.goto(URL_, { waitUntil: "domcontentloaded", timeout: 60000 }).catch((e) => errs.push("goto " + e.message));
    await new Promise((r) => setTimeout(r, 9000));
    const st = await pg.evaluate(() => { const h = document.querySelector(".hero"), v = document.querySelector(".hero-video"), m = document.querySelector(".hero-mark");
      return { intro: h?.dataset.intro, media: h?.dataset.media, marks: m?.querySelectorAll("path").length, markBox: m && Math.round(m.getBoundingClientRect().width), logoOp: getComputedStyle(document.querySelector("[data-intro-logo]")).opacity,
        logoFilter: getComputedStyle(document.querySelector("[data-intro-logo]")).filter, textVis: getComputedStyle(document.querySelector("[data-intro-text]")).visibility, playing: !!v && !v.paused && v.currentTime > 0, rs: v?.readyState }; }).catch((e) => ({ evalError: e.message }));
    await ctx.close(); return { i, ms: Date.now() - t0, st, errs };
  };
  const res = await Promise.all([...Array(K)].map((_, i) => run(i)));
  const bad = res.filter((r) => !(r.st.intro === "complete" && r.st.logoOp === "1" && r.st.marks === 6 && r.st.playing));
  console.log(`${K - bad.length}/${K} clean`); bad.forEach((r) => console.log(`#${r.i} ${r.i % 2 ? "phone" : "desk"} ${JSON.stringify(r.st)} ${r.errs.join(" | ")}`));
  await b.close();
})();
