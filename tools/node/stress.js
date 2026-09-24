// Load the page fresh N times and report what state it settles in — for intermittent entrance failures.
const p = require("puppeteer-core");
const URL_ = process.argv[2] || "http://localhost:4178/v2/", N = +process.argv[3] || 20, mobile = process.argv[4] === "phone";
(async () => {
  const b = await p.launch({ executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", headless: "new", args: ["--autoplay-policy=no-user-gesture-required"] });
  const tally = {};
  for (let i = 0; i < N; i++) {
    const ctx = await b.createBrowserContext(); const pg = await ctx.newPage();
    if (mobile) await pg.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true }); else await pg.setViewport({ width: 1440, height: 900 });
    const errs = []; pg.on("pageerror", (e) => errs.push(e.message.slice(0, 120))); pg.on("console", (m) => m.type() === "error" && errs.push("console: " + m.text().slice(0, 120)));
    pg.on("requestfailed", (r) => errs.push("reqfail " + r.url().split("/").pop() + " " + (r.failure()?.errorText || "")));
    await pg.goto(URL_, { waitUntil: "domcontentloaded" }).catch((e) => errs.push("goto " + e.message));
    await new Promise((r) => setTimeout(r, 8000));
    const st = await pg.evaluate(() => {
      const h = document.querySelector(".hero"), v = document.querySelector(".hero-video"), m = document.querySelector(".hero-mark"), logo = document.querySelector("[data-intro-logo]");
      const cs = (e) => e && getComputedStyle(e);
      return { intro: h?.dataset.intro, media: h?.dataset.media, ready: document.documentElement.classList.contains("is-ready"),
        markPaths: m?.querySelectorAll("path").length, markOp: cs(m)?.opacity, markVis: cs(m)?.visibility, logoOp: cs(logo)?.opacity, logoFilter: cs(logo)?.filter,
        curtainOp: cs(document.querySelector(".hero-curtain"))?.opacity, bgOp: cs(document.querySelector(".hero-bg"))?.opacity,
        video: v && { rs: v.readyState, paused: v.paused, t: +v.currentTime.toFixed(1), src: (v.currentSrc || "").split("/").pop(), err: v.error?.code } };
    }).catch((e) => ({ evalError: e.message }));
    const key = JSON.stringify({ intro: st.intro, media: st.media, marks: st.markPaths, logoOp: st.logoOp, curtain: st.curtainOp, bg: st.bgOp, playing: st.video && !st.video.paused && st.video.t > 0 });
    (tally[key] = tally[key] || { n: 0, sample: null, errs: new Set() }).n++;
    tally[key].sample = st; errs.forEach((e) => tally[key].errs.add(e));
    await ctx.close();
  }
  for (const [k, v] of Object.entries(tally)) console.log(`${v.n}/${N}  ${k}\n      sample: ${JSON.stringify(v.sample)}\n      errors: ${[...v.errs].join(" | ") || "none"}`);
  await b.close();
})();
