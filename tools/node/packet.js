// Build a critic packet for one piece: matched load frames, settled frames, hero-video frames, timings, a phone render.
// Blind copy labels the two sites A/B in a random order; the key is printed here, never written into the packet.
const fs = require("fs"), path = require("path"), p = require("puppeteer-core");
const { execFileSync } = require("child_process"); const FF = require("ffmpeg-static");
const R = path.resolve(__dirname, "../..");
const OUT = path.join(R, process.argv[2] || "design/review/r2/p1");
const times = [300, 1300, 1800, 2100, 2400, 2800, 3300, 3700, 4200, 5000, 6000, 7200];
const pick = (tag) => { const dir = path.join(R, `design/ref-ciridae/load-${tag}/frames`); const fs_ = fs.readdirSync(dir).sort();
  const ts = fs_.map((f) => +f.split("_")[1].replace("ms.jpg", "")); return times.map((t) => { const i = ts.reduce((b, x, k) => Math.abs(x - t) < Math.abs(ts[b] - t) ? k : b, 0); return path.join(dir, fs_[i]); }); };
(async () => {
  fs.rmSync(OUT, { recursive: true, force: true }); for (const d of ["ours", "blind"]) fs.mkdirSync(path.join(OUT, d), { recursive: true });
  const ours = pick("v2"), ref = pick("ciridae");
  const flip = Math.random() < 0.5; const A = flip ? ref : ours, B = flip ? ours : ref;
  times.forEach((t, k) => {
    fs.copyFileSync(ours[k], path.join(OUT, "ours", `load-${String(t).padStart(4, "0")}ms.jpg`));
    fs.copyFileSync(A[k], path.join(OUT, "blind", `A-load-${String(t).padStart(4, "0")}ms.jpg`));
    fs.copyFileSync(B[k], path.join(OUT, "blind", `B-load-${String(t).padStart(4, "0")}ms.jpg`));
  });
  // settled frames at full resolution, and 8 hero-video frames each
  const last = (tag) => { const dir = path.join(R, `design/ref-ciridae/load-${tag}/frames`); return path.join(dir, fs.readdirSync(dir).sort().at(-1)); };
  fs.copyFileSync(last("v2"), path.join(OUT, "ours", "settled.jpg"));
  fs.copyFileSync(last(flip ? "ciridae" : "v2"), path.join(OUT, "blind", "A-settled.jpg"));
  fs.copyFileSync(last(flip ? "v2" : "ciridae"), path.join(OUT, "blind", "B-settled.jpg"));
  const vid = (src, dst) => execFileSync(FF, ["-loglevel", "error", "-y", "-i", src, "-vf", "fps=1,scale=960:-2", "-frames:v", "8", "-q:v", "3", dst]);
  const refV = path.join(R, "design/media/ciridae-hero.mp4"), ourV = path.join(R, "v2/media/hero.mp4");
  vid(ourV, path.join(OUT, "ours", "video-%02d.jpg"));
  vid(flip ? refV : ourV, path.join(OUT, "blind", "A-video-%02d.jpg")); vid(flip ? ourV : refV, path.join(OUT, "blind", "B-video-%02d.jpg"));
  // phone render of ours, after the entrance
  const b = await p.launch({ executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", headless: "new", args: ["--autoplay-policy=no-user-gesture-required"] });
  const pg = await b.newPage(); await pg.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  await pg.goto("http://localhost:4178/v2/", { waitUntil: "networkidle2" }); await new Promise((r) => setTimeout(r, 6500));
  await pg.screenshot({ path: path.join(OUT, "ours", "phone-settled.png") }); await b.close();
  console.log("packet at", path.relative(R, OUT), "· blind key: A =", flip ? "REFERENCE" : "OURS", ", B =", flip ? "OURS" : "REFERENCE");
})().catch((e) => { console.error(e); process.exit(1); });
