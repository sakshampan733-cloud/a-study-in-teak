// Loads the drawing scripts headlessly and writes every sheet + captured view to build/cad.json.
const fs = require("fs"), path = require("path");
const root = path.join(__dirname, "..");
global.window = {};
for (const f of ["drawings/kit.js", "drawings/iso.js", "drawings/roomshell.js", "drawings/door.js", "drawings/desk.js", "drawings/studywall.js", "drawings/rightwall.js", "drawings/partitionglass.js"]) require(path.join(root, f));
const out = {
  drawings: Object.fromEntries(Object.entries(window.DRAWINGS).map(([k, v]) => [k, { title: v.title, svg: v.svg }])),
  views: window.CAD.views,
};
fs.mkdirSync(path.join(root, "build"), { recursive: true });
fs.writeFileSync(path.join(root, "build/cad.json"), JSON.stringify(out));
console.log(Object.keys(out.drawings).join(", "), "|", out.views.length, "views");
