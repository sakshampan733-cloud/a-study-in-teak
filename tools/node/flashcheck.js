// Does anything of the finished hero paint before the entrance runs? Loads the page on a throttled network
// (phone-speed by default) and samples, every animation frame from the first one with a <body>, whether the
// hero text, lockup or nav is visible. Prints the first visible moment of each against when the entrance began.
//   node tools/node/flashcheck.js [url] [slow|fast] [runs]
const p = require("puppeteer-core");
const URL_ = process.argv[2] || "http://localhost:4178/v2/", MODE = process.argv[3] || "slow", RUNS = +(process.argv[4] || 3);
const NET = { slow: { latency: 400, downloadThroughput: (400 * 1024) / 8, uploadThroughput: (400 * 1024) / 8 },
              fast: { latency: 20, downloadThroughput: (40 * 1024 * 1024) / 8, uploadThroughput: (10 * 1024 * 1024) / 8 } }[MODE];
(async () => {
  const b = await p.launch({ executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", headless: "new",
    args: ["--autoplay-policy=no-user-gesture-required"] });
  let bad = 0;
  for (let i = 0; i < RUNS; i++) {
    const ctx = await b.createBrowserContext(); const pg = await ctx.newPage();
    await pg.setViewport({ width: 1440, height: 900 });
    const cdp = await pg.target().createCDPSession();
    await cdp.send("Network.enable"); await cdp.send("Network.setCacheDisabled", { cacheDisabled: true });
    await cdp.send("Network.emulateNetworkConditions", { offline: false, ...NET });
    await pg.evaluateOnNewDocument(() => {
      const t0 = performance.now(); window.__first = {}; window.__live = null;
      const seen = (sel) => { const e = document.querySelector(sel); if (!e) return false;
        for (let n = e; n && n.nodeType === 1; n = n.parentElement) { const c = getComputedStyle(n); if (c.visibility === "hidden" || +c.opacity < 0.02 || c.display === "none") return false; }
        const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0; };
      const tick = () => {
        const t = Math.round(performance.now() - t0);
        if (document.body) {
          if (window.__live === null && document.documentElement.classList.contains("intro-live")) window.__live = t;
          for (const [k, s] of Object.entries({ copy: ".hero-copy [data-intro-text]", logo: ".hero-logo", flank: ".hero-flank [data-intro-text]", nav: ".nav" }))
            if (!(k in window.__first) && seen(s)) window.__first[k] = t;
        }
        if (t < 15000) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
    await pg.goto(URL_, { waitUntil: "domcontentloaded", timeout: 60000 });
    await new Promise((r) => setTimeout(r, MODE === "slow" ? 14000 : 7000));
    const r = await pg.evaluate(() => ({ live: window.__live, first: window.__first }));
    const early = Object.entries(r.first).filter(([, t]) => r.live === null || t < r.live);
    if (early.length) bad++;
    console.log(`run ${i + 1}: entrance began ${r.live ?? "never"} ms · first visible ${JSON.stringify(r.first)}${early.length ? "  ← PAINTED BEFORE ENTRANCE: " + early.map(([k]) => k).join(", ") : ""}`);
    await ctx.close();
  }
  console.log(`${MODE}: ${RUNS - bad}/${RUNS} clean`);
  await b.close();
})();
