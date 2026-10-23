// Capture the desk-curved 3D model's solids (the layered prisms the drawing renders) as JSON.   node desk_solids.js <out.json> [boost]
const fs = require("fs"), vm = require("vm"), path = require("path");
const ROOT = path.join(__dirname, "..", "..");
const [out, boost] = process.argv.slice(2);
const ctx = { console, Math, JSON, Array, Object, Number, String, Set, Map, Date, parseFloat, parseInt, isFinite, isNaN }; ctx.window = ctx; ctx.self = ctx; ctx.globalThis = ctx;
vm.createContext(ctx);
const load = (f, patch) => { let s = fs.readFileSync(path.join(ROOT, "drawings", f), "utf8"); if (patch) s = patch(s); vm.runInContext(s, ctx, { filename: f }); };
load("kit.js"); load("iso.js");
const caps = []; const ob = ctx.window.ISO.build;
ctx.window.ISO.build = (solids, decals) => { caps.push({ solids: JSON.parse(JSON.stringify(solids)), decals: JSON.parse(JSON.stringify(decals)) }); return ob(solids, decals); };
const db = ctx.window.DK.begin; ctx.window.DK.begin = (k) => { if (caps.length && !caps[caps.length - 1].key) caps[caps.length - 1].key = k; return db(k); };
const rep = (s, a, b) => { if (!s.includes(a)) throw new Error("patch miss: " + a); return s.split(a).join(b); };
load("desk.js", boost ? (s) => {                                    // the print boost: the reeds' steps three times deeper
  s = rep(s, "const topBands = [[K.H, K.H - 1.5, 1.5]];", "const topBands = [[K.H, K.H - 1.5, 4.5]];");
  s = rep(s, "topBands.push([b, b - 1.5, 1.4], [b - 1.5, b - 6.5, 0], [b - 6.5, b - 8, 1.4]);", "topBands.push([b, b - 1.5, 4.2], [b - 1.5, b - 6.5, 0], [b - 6.5, b - 8, 4.2]);");
  s = rep(s, "add(full(ov - 1.5), b - 1, b, { capOcc: false, hatch: false }); add(full(ov - 3.5), b - 4, b - 1, { capOcc: false, hatch: false }); add(full(ov - 1.5), b - 5, b - 4, { capOcc: false, hatch: false });",
               "add(full(ov - 1.5), b - 1, b, { capOcc: false, hatch: false }); add(full(ov - 8.5), b - 4, b - 1, { capOcc: false, hatch: false }); add(full(ov - 1.5), b - 5, b - 4, { capOcc: false, hatch: false });");
  return s; } : null);
void ctx.window.DRAWINGS["desk-curved"].svg;                         // the sheet is built on first ask
const c = caps.find((x) => x.key === "desk-curved");
if (!c) { console.error("keys:", caps.map((x) => x.key)); process.exit(1); }
fs.writeFileSync(out, JSON.stringify(c));
console.log("solids", c.solids.length, "decals", c.decals.length, "rings", c.solids.reduce((a, s) => a + s.ring.length, 0));