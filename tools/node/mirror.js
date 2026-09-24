// Save ciridae.com as a local gold standard: every response the browser loads, an MHTML archive,
// and a full-page screenshot. Scrolls the whole page so lazy media (the hero video) is fetched.
const p = require("puppeteer-core"), fs = require("fs"), path = require("path");
const OUT = path.resolve(__dirname, "../../design/ref-ciridae/site");
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const b = await p.launch({ executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", headless: "new",
    args: ["--autoplay-policy=no-user-gesture-required", "--hide-scrollbars"] });
  const pg = await b.newPage(); await pg.setViewport({ width: 1440, height: 900 });
  const saved = [];
  pg.on("response", async (res) => {
    try {
      const u = new URL(res.url()); if (!/^https?:$/.test(u.protocol)) return;
      if (res.status() >= 300) return;
      const buf = await res.buffer().catch(() => null); if (!buf || !buf.length) return;
      let rel = path.join(u.hostname, u.pathname.endsWith("/") ? u.pathname + "index.html" : u.pathname);
      if (u.search) rel += "__" + u.search.replace(/[^a-z0-9]/gi, "_").slice(0, 60);
      const f = path.join(OUT, rel); fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, buf);
      saved.push({ url: res.url(), type: res.headers()["content-type"] || "", bytes: buf.length, file: rel });
    } catch (e) {}
  });
  await pg.goto("https://www.ciridae.com", { waitUntil: "networkidle2", timeout: 60000 });
  await sleep(4000);
  // force the lazy hero video to load
  await pg.evaluate(() => { document.querySelectorAll("video source[data-src]").forEach((s) => { if (!s.src) { s.src = s.dataset.src; s.parentElement.load(); } }); });
  const H = await pg.evaluate(() => document.body.scrollHeight);
  for (let y = 0; y < H; y += 500) { await pg.evaluate((y) => window.scrollTo(0, y), y); await sleep(300); }
  await sleep(3000); await pg.evaluate(() => window.scrollTo(0, 0)); await sleep(2000);
  const cdp = await pg.target().createCDPSession();
  const { data } = await cdp.send("Page.captureSnapshot", { format: "mhtml" });
  fs.writeFileSync(path.join(OUT, "ciridae.mhtml"), data);
  await pg.screenshot({ path: path.join(OUT, "full-page.png"), fullPage: true });
  fs.writeFileSync(path.join(OUT, "manifest.json"), JSON.stringify(saved, null, 1));
  const byType = {}; saved.forEach((s) => { const t = (s.type.split(";")[0] || "?"); byType[t] = (byType[t] || 0) + 1; });
  console.log("saved", saved.length, "files,", (saved.reduce((a, s) => a + s.bytes, 0) / 1e6).toFixed(1), "MB"); console.log(byType);
  await b.close();
})().catch((e) => { console.error("ERR", e.message); process.exit(1); });
