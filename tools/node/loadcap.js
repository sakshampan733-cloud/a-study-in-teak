// Record ciridae.com's first-load sequence as the browser paints it (CDP screencast), and sample the
// computed style of every element that moves during it, so the loader can be copied to the millisecond.
const p = require("puppeteer-core"), fs = require("fs"), path = require("path");
const URL_ = process.argv[2] || "https://www.ciridae.com", TAG = process.argv[3] || "ciridae";
const OUT = path.resolve(__dirname, "../../design/ref-ciridae/load-" + TAG);
const FF = require("ffmpeg-static"); const { execFileSync } = require("child_process");
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
(async () => {
  fs.rmSync(OUT, { recursive: true, force: true }); fs.mkdirSync(OUT + "/frames", { recursive: true });
  const b = await p.launch({ executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", headless: "new",
    args: ["--autoplay-policy=no-user-gesture-required", "--hide-scrollbars"] });
  const ctx = await b.createBrowserContext(); const pg = await ctx.newPage();
  await pg.setViewport({ width: 1440, height: 900 });
  const cdp = await pg.target().createCDPSession();
  const frames = []; let t0 = null;
  cdp.on("Page.screencastFrame", async (f) => {
    const t = f.metadata.timestamp * 1000; if (t0 === null) t0 = t;
    frames.push({ t: t - t0, data: f.data }); cdp.send("Page.screencastFrameAck", { sessionId: f.sessionId }).catch(() => {});
  });
  await cdp.send("Page.startScreencast", { format: "jpeg", quality: 85, maxWidth: 1440, maxHeight: 900, everyNthFrame: 1 });
  // sample styles of the moving parts every ~50ms from navigation
  await pg.evaluateOnNewDocument(() => {
    window.__samples = []; const t0 = performance.now();
    const pick = () => {
      const q = (s) => [...document.querySelectorAll(s)].slice(0, 6);
      const els = [...q("[class*=loader]"), ...q("[class*=preload]"), ...q("svg"), ...q("h1"), ...q("[class*=hero] *")].filter((e, i, a) => a.indexOf(e) === i).slice(0, 40);
      window.__samples.push({ t: Math.round(performance.now() - t0), els: els.map((e) => { const c = getComputedStyle(e), r = e.getBoundingClientRect();
        return { k: e.tagName.toLowerCase() + "." + String(e.className.baseVal ?? e.className).split(" ").slice(0, 2).join("."), txt: (e.textContent || "").trim().slice(0, 24),
          op: c.opacity, f: c.filter, tf: c.transform, vis: c.visibility, x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) }; }) });
      if (performance.now() - t0 < 7000) setTimeout(pick, 50);
    };
    document.addEventListener("DOMContentLoaded", pick);
  });
  const nav = pg.goto(URL_, { waitUntil: "domcontentloaded", timeout: 60000 }).catch(() => {});
  await sleep(7500); await nav;
  await cdp.send("Page.stopScreencast");
  const samples = await pg.evaluate(() => window.__samples).catch(() => []);
  const anims = await pg.evaluate(() => document.getAnimations().map((a) => ({ name: a.animationName || a.transitionProperty || a.constructor.name, dur: a.effect?.getTiming().duration, delay: a.effect?.getTiming().delay, ease: a.effect?.getTiming().easing, target: a.effect?.target?.className?.toString().slice(0, 50) }))).catch(() => []);
  frames.forEach((f, i) => fs.writeFileSync(`${OUT}/frames/${String(i).padStart(4, "0")}_${String(Math.round(f.t)).padStart(5, "0")}ms.jpg`, Buffer.from(f.data, "base64")));
  // real-time mp4 from variable-rate frames
  const list = frames.map((f, i) => `file 'frames/${String(i).padStart(4, "0")}_${String(Math.round(f.t)).padStart(5, "0")}ms.jpg'\nduration ${(((frames[i + 1]?.t ?? f.t + 40) - f.t) / 1000).toFixed(3)}`).join("\n");
  fs.writeFileSync(OUT + "/list.txt", list + `\nfile 'frames/${String(frames.length - 1).padStart(4, "0")}_${String(Math.round(frames.at(-1).t)).padStart(5, "0")}ms.jpg'\n`);
  execFileSync(FF, ["-y", "-loglevel", "error", "-f", "concat", "-safe", "0", "-i", "list.txt", "-vsync", "cfr", "-r", "30", "-vf", "scale=trunc(iw/2)*2:trunc(ih/2)*2", "-pix_fmt", "yuv420p", "load.mp4"], { cwd: OUT });
  fs.writeFileSync(OUT + "/samples.json", JSON.stringify(samples)); fs.writeFileSync(OUT + "/animations.json", JSON.stringify(anims, null, 1));
  console.log(frames.length, "frames over", Math.round(frames.at(-1).t), "ms;", samples.length, "style samples;", anims.length, "live animations");
  await b.close();
})().catch((e) => { console.error("ERR", e.stack); process.exit(1); });
