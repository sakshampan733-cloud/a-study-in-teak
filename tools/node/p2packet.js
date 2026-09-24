// Critic packet for piece 2 (nav, menu, scroll, hover) — the same states captured on both sites at 1440×900:
// settled at the top, hovering the left pill (0–400 ms), the menu opening (0–1400 ms) and open, scrolled down,
// then scrolled back up a little. The blind copy labels the sites A/B at random; the key is printed, not written.
//   node tools/node/p2packet.js design/review/r2/p2a
const fs = require("fs"), path = require("path"), p = require("puppeteer-core");
const R = path.resolve(__dirname, "../..");
const OUT = path.join(R, process.argv[2] || "design/review/r2/p2a");
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const SITES = {
  ours: { url: "http://localhost:4178/v2/", pill: ".nav-l .pill", burger: ".pill.is-menu" },
  ref: { url: "https://www.ciridae.com", pill: ".nav_body a", burger: ".nav_burger" },
};
async function capture(b, key, dir) {
  const S = SITES[key]; fs.mkdirSync(dir, { recursive: true });
  const ctx = await b.createBrowserContext(); const pg = await ctx.newPage();
  await pg.setViewport({ width: 1440, height: 900 });
  await pg.goto(S.url, { waitUntil: "networkidle2", timeout: 90000 }); await sleep(7000);
  const shot = (n) => pg.screenshot({ path: path.join(dir, n + ".jpg"), type: "jpeg", quality: 88 });
  await shot("01-top-settled");
  // hover the left pill: glow and label scramble
  const pill = await pg.$(S.pill); const bx = await pill.boundingBox();
  await pg.mouse.move(bx.x + bx.width / 2, bx.y + bx.height / 2);
  let t0 = Date.now(); const at = (t) => sleep(Math.max(0, t0 + t - Date.now()));
  for (const t of [0, 60, 120, 200, 400]) { await at(t); await pg.screenshot({ path: path.join(dir, `02-hover-${String(t).padStart(3, "0")}ms.jpg`), type: "jpeg", quality: 92, clip: { x: 0, y: 0, width: 720, height: 140 } }); }
  await pg.mouse.move(720, 450); await sleep(800);
  // the menu opening, then open, then hovering its second link
  await pg.click(S.burger);
  t0 = Date.now();
  for (const t of [100, 300, 600, 1000, 1400]) { await at(t); await shot(`03-menu-${String(t).padStart(4, "0")}ms`); }
  await sleep(1200); await shot("04-menu-open");
  const links = await pg.$$(key === "ours" ? ".menu-item" : ".burger a");
  if (links[1]) { const lb = await links[1].boundingBox(); if (lb) { await pg.mouse.move(lb.x + lb.width / 2, lb.y + lb.height / 2); await sleep(700); await shot("05-menu-link-hover"); } }
  await pg.keyboard.press("Escape"); await sleep(300);
  if (await pg.evaluate(() => document.body.classList.contains("menu-open") || document.body.classList.contains("burger-open"))) { await pg.click(S.burger); }
  await sleep(1200); await shot("06-menu-closed");
  // scroll down (the nav slides away), then back up a little (it returns, frosted)
  await pg.mouse.move(720, 600);
  for (let i = 0; i < 6; i++) { await pg.mouse.wheel({ deltaY: 200 }); await sleep(120); }
  await sleep(1600); await shot("07-scrolled-down");
  for (let i = 0; i < 2; i++) { await pg.mouse.wheel({ deltaY: -120 }); await sleep(120); }
  await sleep(1600); await shot("08-scrolled-back-up");
  await ctx.close();
}
(async () => {
  fs.rmSync(OUT, { recursive: true, force: true });
  const b = await p.launch({ executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", headless: "new", args: ["--autoplay-policy=no-user-gesture-required", "--hide-scrollbars"] });
  await capture(b, "ours", path.join(OUT, "ours")); await capture(b, "ref", path.join(OUT, "ref"));
  await b.close();
  const flip = Math.random() < 0.5, A = flip ? "ref" : "ours", Bk = flip ? "ours" : "ref";
  fs.mkdirSync(path.join(OUT, "blind"));
  for (const [lab, k] of [["A", A], ["B", Bk]]) for (const f of fs.readdirSync(path.join(OUT, k))) fs.copyFileSync(path.join(OUT, k, f), path.join(OUT, "blind", `${lab}-${f}`));
  console.log("packet at", path.relative(R, OUT), "· blind key: A =", A === "ref" ? "REFERENCE" : "OURS", ", B =", Bk === "ref" ? "REFERENCE" : "OURS");
})().catch((e) => { console.error(e); process.exit(1); });
