// Large-print drawing sets, for printing and for the carpenter (owner, 2 Oct): every drawing the site shows, made
// legible. Each A3 sheet prints first whole, on a page of its own, then every view on it (elevation, plan, section,
// detail, notes) whole on a page of its own, as large as the page allows up to three times the A3 size. Feet and
// inches only (the mm layer is dropped and any mm left in the notes converted). Strong colour for a weak printer:
// drawing black, dimension lines red, measurements green and bold, notes dark blue, every line heavier.
//
// Out, in cad/print/:  <family>.pdf, <family>-a4.pdf   one PDF per drawing or option — all its sheets, every page
//                      <family>-NN.webp                the A3 pages as images, for the scrolling viewer on the site
//                      index.json, index.js            families, titles and page counts, for the site
// A family is a drawing's sheets taken together (desk-square + its details + 3D; vanity-c + the drawer within).
//   node tools/node/print-drawings.js [key-or-family ...]          (no arguments: every drawing the site lists)
const path = require("path"), fs = require("fs"), vm = require("vm");
const puppeteer = require(path.join(__dirname, "node_modules", "puppeteer-core"));
const ROOT = path.join(__dirname, "..", "..");
const CAD = path.join(ROOT, "cad"), OUT = path.join(CAD, "print");
fs.mkdirSync(OUT, { recursive: true });

// ── which drawings, in the site's order, and how they group ──────────────────────────────────────────────────────
function siteOrder() {
  const ctx = { window: {} }; ctx.self = ctx.window;
  vm.runInNewContext(fs.readFileSync(path.join(ROOT, "data.js"), "utf8"), ctx);
  const seen = [];
  (function walk(o) {
    if (!o || typeof o !== "object") return;
    if (Array.isArray(o)) return o.forEach(walk);
    for (const [k, v] of Object.entries(o)) {
      if (k === "drawings" || k === "drawing") [].concat(v || []).forEach((d) => { if (typeof d === "string" && !seen.includes(d)) seen.push(d); });
      else walk(v);
    }
  })(ctx.window.PROJECT);
  return seen.filter((k) => fs.existsSync(path.join(CAD, k + ".svg")));
}
const JOIN = { "vanity-drawer": "vanity-c" };
const family = (k) => JOIN[k] || k.replace(/-(details|3d)$/, "");

// ── in the browser: drop the mm layer, convert the notes, thicken, and map the ink ───────────────────────────────
const PREPARE = String.raw`
(async () => {
  const FR = ["", "⅛", "¼", "⅜", "½", "⅝", "¾", "⅞"];
  const ftin = (mm) => { const t = Math.round(mm / 25.4 * 8) / 8; let ft = Math.floor(t / 12), r = t - ft * 12, w = Math.floor(r), e = Math.round((r - w) * 8);
    if (e === 8) { e = 0; w++; } if (w === 12) { w = 0; ft++; } const i = w + FR[e] + '"'; return ft ? ft + "'-" + i : i; };
  const IMP = "(?:\\d+[½¼¾⅛⅜⅝⅞]?|[½¼¾⅛⅜⅝⅞])\\s?(?:in|IN)\\b|\\d+\\s?(?:ft|FT)(?:\\s?\\d+(?:[½¼¾⅛⅜⅝⅞])?\\s?(?:in|IN)\\b)?";
  const KEEP = [/\b9292\b/g, /\bREVISION \d+/g, /\bREF\. \d+/g];                // a veneer code, revision and reference numbers — not sizes
  const FIX = { "6 AND 10 IN": "0¼\" AND 0⅜\" IN" };                          // single figures that are mm, said in words
  const conv = (s) => {
    let o = s, kept = [];
    KEEP.forEach((re) => (o = o.replace(re, (m) => { kept.push(m); return "\u0000" + (kept.length - 1) + "\u0001"; })));
    if (FIX[o.trim()]) return FIX[o.trim()];
    const SC = "(?:APPROX\\s+)?(?:SCALE\\s+)?1:\\d+(?:\\.\\d+)?";                // a scale means nothing once the page is enlarged
    o = o.replace(new RegExp("\\s*·\\s*" + SC, "g"), "").replace(new RegExp("\\b" + SC + "\\s*·\\s*", "g"), "").replace(new RegExp("\\b" + SC, "g"), "NOT TO SCALE");
    o = o.replace(new RegExp("(" + IMP + ")\\s*\\(\\s*\\d{2,5}\\s*\\)", "g"), "$1");                    // 2 ft 3 in (686)
    o = o.replace(new RegExp("(\\d{2,5}(?:\\.\\d+)?)(\\s+[A-Za-z]+)?\\s*\\(\\s*(?:" + IMP + ")[^)]*\\)", "g"), (m, n, w) => ftin(+n) + (w || ""));  // 1219 (4 FT)
    o = o.replace(new RegExp("(\\d{2,5})\\s*·\\s*(?:" + IMP + ")", "g"), (m, n) => ftin(+n));          // 948 · 3 FT 1 IN
    o = o.replace(/(\d+(?:\.\d+)?)\s?mm\b/gi, (m, n) => ftin(+n));                                      // 90 mm
    o = o.replace(/(\d+)\s?(ply|PLY)\b/g, (m, n, p) => ftin(+n) + " " + p);                             // 18 ply
    o = o.replace(/\bR\s?(\d+(?:\.\d+)?)\b/g, (m, n) => "R " + ftin(+n));                               // R150
    o = o.replace(/\b(\d)(?=\s+(?:OUT|W|WIDE|DEEP|PROUD|THK|THICK|thick|solid|GAP|wide|deep)\b)/g, (m, n) => ftin(+n));   // 6 OUT, 6 solid lipping
    // any other 2–5 figure number is mm — except feet, and inches up to 12 ("6 in", "10 IN"); 13 and up before IN is mm, "IN" meaning into
    o = o.replace(/(?<![\d.:\-\/'"A-Za-z#\u0000])(\d{2,5}(?:\.\d+)?)(?!\.\d|[\d:\/'"°%⅛¼⅜½⅝¾⅞A-Za-z\u0001]|\s*(?:ft|FT|feet)\b)/g,
      (m, n, at, str) => ((/^\s*(?:in|IN)\b/.test(str.slice(at + m.length)) && +n <= 12) || /(?:ft|FT)\s*$/.test(str.slice(0, at)) ? m : ftin(+n)));
    o = o.replace(/"\s*×\s*(\d)(?![\d.'"½¼¾⅛⅜⅝⅞])/g, (m, n) => '" × ' + ftin(+n));                       // 10 × 6 → ⅜" × ¼"
    return o.replace(/\u0000(\d+)\u0001/g, (m, i) => kept[+i]);
  };
  const svg = document.querySelector("svg");
  svg.querySelectorAll(".dk-mm").forEach((e) => e.remove());
  svg.querySelectorAll(":scope > rect").forEach((r) => { if (+r.getAttribute("width") >= 400 && +r.getAttribute("height") >= 270) r.remove(); });
  svg.querySelectorAll("text.dk-in").forEach((t) => t.setAttribute("font-size", +t.getAttribute("font-size") * 1.15));
  const tb = svg.querySelector("[data-tb]"), tbt = tb ? [...tb.querySelectorAll("text")].map((t) => t.textContent.trim()) : [];
  const di = tbt.indexOf("DWG"), dwg = di >= 0 ? tbt[di + 1] : "";
  const title = tbt[2] || "";                                                  // the sheet's own title, under the project name
  const changed = [], left = [];
  svg.querySelectorAll("text").forEach((t) => {
    if (t.closest("[data-tb]")) return;
    const kids = t.querySelectorAll("tspan").length ? [...t.querySelectorAll("tspan")] : [t];
    kids.forEach((k) => { const a = k.textContent, b = conv(a); if (a !== b) { k.textContent = b; changed.push(a.trim() + "  →  " + b.trim()); } });
    const now = t.textContent;
    if (/(?<![\d'"\-.:\/A-Za-z#½¼¾⅛⅜⅝⅞])\d{2}(?![\d'"½¼¾⅛⅜⅝⅞:])/.test(now.replace(/\d+\s?(?:ft|FT|in|IN)\b/g, ""))) left.push(now.trim());
  });
  // heavier lines: every stroke width up by half, dimension lines a little more, and none finer than 0.2 of the sheet
  svg.querySelectorAll("[stroke-width]").forEach((e) => e.setAttribute("stroke-width", +e.getAttribute("stroke-width") * (e.closest(".dk-dim") ? 1.7 : 1.5)));
  const unit = svg.getBoundingClientRect().width / 420;
  svg.querySelectorAll("line, path, rect, circle, ellipse, polyline, polygon").forEach((e) => {
    if (e.closest("[data-tb]")) return;
    const cs = getComputedStyle(e); if (cs.stroke === "none" || !cs.stroke) return;
    const m = e.getScreenCTM(), k = Math.hypot(m.a, m.b) / unit, w = parseFloat(cs.strokeWidth) * k;
    if (w < 0.2) e.style.strokeWidth = (0.2 / k).toFixed(4);
  });
  // the ink map: the sheet without frame and title block, on a 1-unit grid
  const clone = svg.cloneNode(true);
  clone.querySelectorAll("[data-tb]").forEach((e) => e.remove());
  clone.querySelectorAll("rect").forEach((r) => { const w = +r.getAttribute("width"), h = +r.getAttribute("height"); if (w >= 400 && h >= 270) r.remove(); });
  clone.setAttribute("width", 1260); clone.setAttribute("height", 891);
  const url = URL.createObjectURL(new Blob([new XMLSerializer().serializeToString(clone)], { type: "image/svg+xml" }));
  const img = new Image(); img.src = url; await img.decode();
  const cv = document.createElement("canvas"); cv.width = 1260; cv.height = 891;
  const cx = cv.getContext("2d"); cx.fillStyle = "#fff"; cx.fillRect(0, 0, 1260, 891); cx.drawImage(img, 0, 0, 1260, 891);
  const px = cx.getImageData(0, 0, 1260, 891).data, occ = new Array(420 * 297).fill(0);
  for (let y = 0; y < 891; y++) for (let x = 0; x < 1260; x++) { const i = (y * 1260 + x) * 4; if (px[i] + px[i + 1] + px[i + 2] < 690) occ[((y / 3) | 0) * 420 + ((x / 3) | 0)] = 1; }
  // view headings (DK.heading: bold 3.2 title with a rule 1.5 below it)
  const rules = [...svg.querySelectorAll("line")].map((l) => [+l.getAttribute("x1"), +l.getAttribute("y1"), +l.getAttribute("x2"), +l.getAttribute("y2")]);
  const heads = [...svg.querySelectorAll("text")].filter((t) => !t.closest("[data-tb]") && +t.getAttribute("font-size") >= 3 && +t.getAttribute("font-size") <= 3.6)
    .map((t) => { const x = +t.getAttribute("x"), y = +t.getAttribute("y"), r = rules.find((l) => Math.abs(l[0] - x) < 0.01 && Math.abs(l[1] - y - 1.5) < 0.01);
      return { t: t.textContent.trim(), x, y, w: r ? r[2] - r[0] : 0 }; }).filter((h) => h.w > 0);
  const tbBox = tb ? (() => { const r = tb.querySelector("rect"); return r ? [+r.getAttribute("x"), +r.getAttribute("y")] : [300, 239]; })() : [420, 297];
  // the drawn pieces, each with its box on the sheet: top-level elements, opening plain groups that just gather things
  const sr = svg.getBoundingClientRect(), els = [];
  // what an element actually paints: its pieces' boxes, cut to any clip path (a detail drawn whole and clipped to a window)
  const join = (a, b) => (!a ? b : !b ? a : [Math.min(a[0], b[0]), Math.min(a[1], b[1]), Math.max(a[2], b[2]), Math.max(a[3], b[3])]);
  const painted = (el) => {
    const cp = el.getAttribute("clip-path"), r = el.getBoundingClientRect();
    let box = r.width || r.height ? [r.left, r.top, r.right, r.bottom] : null;
    if (box && cp) {
      const clip = document.getElementById((cp.match(/#([^)]+)/) || [])[1]), m = el.getScreenCTM();
      if (clip && m) { let c = null;
        [...clip.children].forEach((k) => { const b = k.getBBox(); [[b.x, b.y], [b.x + b.width, b.y], [b.x, b.y + b.height], [b.x + b.width, b.y + b.height]].forEach(([x, y]) => {
          const p = new DOMPoint(x, y).matrixTransform(m); c = join(c, [p.x, p.y, p.x, p.y]); }); });
        if (c) box = [Math.max(box[0], c[0]), Math.max(box[1], c[1]), Math.min(box[2], c[2]), Math.min(box[3], c[3])]; }
      return box;
    }
    if (!box || !el.children.length || el.tagName.toLowerCase() === "text") return box;
    let u = null; [...el.children].forEach((k) => { if (!/^(clippath|defs|pattern|style)$/i.test(k.tagName)) u = join(u, painted(k)); });
    return u;
  };
  const collect = (el) => {
    const tag = el.tagName.toLowerCase();
    if (tag === "style" || tag === "defs" || el.hasAttribute("data-tb")) return;
    if (tag === "g" && !el.getAttribute("transform") && !el.classList.contains("dk-dim") && el.children.length > 1) return [...el.children].forEach(collect);
    const r = painted(el); if (!r || (r[2] - r[0] <= 0 && r[3] - r[1] <= 0)) return;
    els.push([(r[0] - sr.left) / unit, (r[1] - sr.top) / unit, (r[2] - sr.left) / unit, (r[3] - sr.top) / unit]);
  };
  [...svg.children].forEach(collect);
  return { title, dwg, changed, left, occ, heads, tbBox, els };
})()`;

// ── views: each heading claims a cell (down to the next heading in its column, across to the next one to its right);
// every connected piece of ink then goes to the view whose cell holds its centre — the nearest one where cells overlap —
// so a view that runs past its cell keeps its own lines, and a note or a stray mark is never lost.
const GW = 420, GH = 297;
function components(occ, R) {
  const dil = new Uint8Array(GW * GH);
  for (let y = 0; y < GH; y++) for (let x = 0; x < GW; x++) if (occ[y * GW + x])
    for (let dy = -R; dy <= R; dy++) for (let dx = -R; dx <= R; dx++) { const X = x + dx, Y = y + dy; if (X >= 0 && Y >= 0 && X < GW && Y < GH) dil[Y * GW + X] = 1; }
  const lab = new Uint8Array(GW * GH), out = [];
  for (let s = 0; s < GW * GH; s++) {
    if (!dil[s] || lab[s]) continue;
    const c = { x0: 1e9, y0: 1e9, x1: -1, y1: -1, n: 0, sx: 0, sy: 0, px: [] }, st = [s]; lab[s] = 1;
    while (st.length) {
      const q = st.pop(), x = q % GW, y = (q / GW) | 0;
      if (occ[q]) { c.n++; c.px.push(q); c.sx += x; c.sy += y; c.x0 = Math.min(c.x0, x); c.y0 = Math.min(c.y0, y); c.x1 = Math.max(c.x1, x + 1); c.y1 = Math.max(c.y1, y + 1); }
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const X = x + dx, Y = y + dy, k = Y * GW + X;
        if (X >= 0 && Y >= 0 && X < GW && Y < GH && dil[k] && !lab[k]) { lab[k] = 1; st.push(k); } }
    }
    if (c.n) { c.cx = c.sx / c.n + 0.5; c.cy = c.sy / c.n + 0.5; out.push(c); }
  }
  return out;
}
const gapOf = (a, b) => Math.max(0, Math.max(a.x0, b.x0) - Math.min(a.x1, b.x1)) + Math.max(0, Math.max(a.y0, b.y0) - Math.min(a.y1, b.y1));
const grow = (v, c) => { v.x0 = Math.min(v.x0, c.x0); v.y0 = Math.min(v.y0, c.y0); v.x1 = Math.max(v.x1, c.x1); v.y1 = Math.max(v.y1, c.y1); v.n = (v.n || 0) + c.n; };
function findViews(occ, tbBox, heads, els) {
  const H = heads.map((h) => ({ ...h, top: h.y - 4.2 }));
  const span = (h, g) => Math.min(h.x + h.w, g.x + g.w) - Math.max(h.x, g.x);           // how far two headings' rules overlap
  H.forEach((h) => { h.bottom = Math.min(288, ...H.filter((g) => g !== h && g.y > h.y + 3 && (span(h, g) > 8 || (g.x >= h.x - 25 && g.x < h.x + h.w - 8))).map((g) => g.top)); });
  H.forEach((h) => { h.right = Math.min(411, ...H.filter((g) => g.x > h.x + 5 && g.top < h.bottom && g.bottom > h.top + 1).map((g) => g.x - 1.5)); });
  const views = H.map((h) => ({ name: h.t, cell: { x0: h.x - 2, y0: h.top, x1: h.right, y1: h.bottom }, x0: h.x, y0: h.y - 3, x1: h.x + h.w, y1: h.y + 5.5, n: 1 }));
  // each piece goes to the cell that holds its centre (the one whose heading is nearest above, where cells overlap)
  const strays = [];
  els.forEach(([x0, y0, x1, y1]) => {
    if (x1 < 9 || y1 < 9 || x0 > 411 || y0 > 288 || (x0 >= tbBox[0] - 0.5 && y0 >= tbBox[1] - 0.5)) return;
    const c = { x0: Math.max(9, x0), y0: Math.max(9, y0), x1: Math.min(411, x1), y1: Math.min(288, y1), n: 1 }, cx = (c.x0 + c.x1) / 2, cy = (c.y0 + c.y1) / 2;
    if (c.x1 - c.x0 > 380 && c.y1 - c.y0 > 250) return;                             // a backdrop, not a drawn piece
    const home = views.filter((v) => cx >= v.cell.x0 && cx < v.cell.x1 && cy >= v.cell.y0 && cy < v.cell.y1).sort((a, b) => b.cell.y0 - a.cell.y0)[0]
      || views.filter((v) => gapOf(c, v) < 14).sort((a, b) => gapOf(c, a) - gapOf(c, b))[0];
    if (!home) return strays.push(c);
    // a piece may run a little past its cell (a dimension, a long elevation); a piece that runs far past it is a cut line
    // or an unclipped hatch — keep only the part near the cell
    const M = 60, k = home.cell;
    if (home.cell) grow(home, { x0: Math.max(c.x0, k.x0 - M), y0: Math.max(c.y0, k.y0 - M), x1: Math.min(c.x1, k.x1 + M), y1: Math.min(c.y1, k.y1 + M), n: 1 });
  });
  const extra = [];
  strays.forEach((c) => { const e = extra.find((v) => gapOf(c, v) < 12); if (e) grow(e, c); else extra.push({ name: "", ...c }); });
  if (process.env.DEBUG_VIEWS) views.concat(extra).forEach((v) => console.log("   ", (v.name || "-").padEnd(36), [v.x0, v.y0, v.x1, v.y1].map((n) => Math.round(n)).join(","), v.n, v.cell ? [v.cell.x0, v.cell.y0, v.cell.x1, v.cell.y1].map(Math.round).join(",") : ""));
  return views.filter((v) => v.n > 1).concat(extra)
    .sort((a, b) => (Math.abs(a.y0 - b.y0) < 20 ? a.x0 - b.x0 : a.y0 - b.y0));
}
// ── paper ────────────────────────────────────────────────────────────────────────────────────────────────────────
const PAPERS = {
  // MAXS caps the enlargement (in printed mm per A3 mm), so a small detail is not blown up out of all proportion
  a3: { suffix: "", W: 420, H: 297, M: 8, HEAD: 16, FOOT: 11, T: 1, MAXS: 3 },
  a4: { suffix: "-a4", W: 297, H: 210, M: 6, HEAD: 12, FOOT: 8.5, T: 0.75, MAXS: 3 },
};
const PAD = 2.5;
function planPages(sheet, P) {
  const BW = P.W - 2 * P.M, BH = P.H - P.HEAD - P.FOOT - 3;
  const pages = [];
  sheet.views.forEach((r) => {
    const w = r.x1 - r.x0 + 2 * PAD, h = r.y1 - r.y0 + 2 * PAD, fit = Math.min(BW / w, BH / h);
    const name = r.name || "Detail";
    // each view whole on one page, as large as the page allows — never cut into pieces (owner, 2 Oct: the cut-up
    // enlargements looked wrong)
    pages.push({ view: r, box: [r.x0 - PAD, r.y0 - PAD, w, h], s: Math.min(fit, P.MAXS), name, part: "" });
  });
  return pages;
}

const STYLE = `
  text { font-weight: 600; }
  text[font-weight="700"], text[font-weight="bold"] { font-weight: 800; }
  [stroke="#1b1b1b"], [stroke="#2a2a2a"], [stroke="#111"], [stroke="#222"], [stroke="#333"] { stroke: #000 !important; }
  [fill="#1b1b1b"], [fill="#2a2a2a"], [fill="#111"], [fill="#222"], [fill="#333"] { fill: #000 !important; }
  text[fill="#666"], text[fill="#6f6f6f"], text[fill="#777"], text[fill="#888"], text[fill="#8c8c8c"], text[fill="#999"], text[fill="#555"] { fill: #12308a !important; }
  [stroke="#666"], [stroke="#6f6f6f"], [stroke="#777"], [stroke="#888"], [stroke="#8c8c8c"], [stroke="#999"], [stroke="#9a9a9a"], [stroke="#aaa"], [stroke="#bbb"] { stroke: #333 !important; }
  [stroke="#8a3a22"], .dk-dim line, .dk-dim path, .dk-dim polyline { stroke: #e00000 !important; }
  text[fill="#8a3a22"], text.dk-in { fill: #007a33 !important; font-weight: 800 !important; }`;

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;");
const prefixIds = (s, p) => s.replace(/\bid="([^"]+)"/g, `id="${p}-$1"`).replace(/url\(#([^)]+)\)/g, `url(#${p}-$1)`).replace(/href="#([^"]+)"/g, `href="#${p}-$1"`);

// one document per family and paper: every sheet defined once, every page a window onto it
function familyHTML(famTitle, sheets, P) {
  const BW = P.W - 2 * P.M, BH = P.H - P.HEAD - P.FOOT - 3, t = (v) => (v * P.T).toFixed(2) + "mm", mm = (v) => v.toFixed(2) + "mm";
  const plans = sheets.map((sh) => planPages(sh, P));
  const total = plans.reduce((a, p) => a + p.length + 1, 0);
  let defs = "", body = "", n = 0;
  const starts = [];
  const legend = `<span class="lg"><i style="background:#000"></i>drawing</span><span class="lg"><i style="background:#e00000"></i>dimension line</span><span class="lg"><b style="color:#007a33">5'-2½"</b> measurement</span><span class="lg"><b style="color:#12308a">Aa</b> note</span>`;
  const page = (sh, title, part, inner) => { n++;
    return `<section class="pg"><header><div class="t">${esc(sh.dwg)}  ${esc(sh.title)}</div><div class="v">${esc(title)}${part ? `<span>${esc(part)}</span>` : ""}</div><div class="n">${n}/${total}</div></header>
      <div class="box">${inner}</div><footer>${legend}<span class="sc">All sizes in feet and inches. Go by the written sizes — never measure the paper.</span></footer></section>`; };
  sheets.forEach((sh, si) => {
    const id = "S" + si, pages = plans[si];
    starts.push(n);
    defs += `<g id="${id}">${prefixIds(sh.inner, id)}</g>`;
    const s0 = Math.min(BW / 420, BH / 297);
    body += page(sh, `The whole sheet — then each view on its own page, ${n + 2} to ${n + 1 + pages.length}`, "",
      `<svg viewBox="0 0 420 297" style="width:${mm(420 * s0)};height:${mm(297 * s0)}"><rect x="8" y="8" width="404" height="281" fill="#fff" stroke="#000" stroke-width="0.6"/><use href="#${id}"/></svg>`);
    pages.forEach((p) => { const [x, y, w, h] = p.box;
      body += page(sh, p.name, p.part, `<svg viewBox="${x} ${y} ${w} ${h}" style="width:${mm(w * p.s)};height:${mm(h * p.s)}"><use href="#${id}"/></svg>`); });
  });
  return { total, starts, html: `<!doctype html><html><head><meta charset="utf-8"><title>${esc(famTitle)}</title><style>
    @page { size: ${P.W}mm ${P.H}mm; margin: 0 } html, body { margin: 0; padding: 0; background: #fff; font-family: Helvetica, Arial, sans-serif; color: #000; }
    .pg { width: ${P.W}mm; height: ${P.H}mm; page-break-after: always; break-after: page; overflow: hidden; box-sizing: border-box; padding: 0 ${P.M}mm; background: #fff; }
    .pg:last-child { page-break-after: auto; break-after: auto; }
    header { height: ${P.HEAD}mm; box-sizing: border-box; display: flex; align-items: center; gap: ${t(6)}; border-bottom: ${t(0.9)} solid #000; }
    header .t { font-size: ${t(5)}; font-weight: 800; white-space: nowrap; }
    header .v { font-size: ${t(4.6)}; font-weight: 700; color: #12308a; flex: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    header .v span { color: #e00000; margin-left: ${t(4)}; }
    header .n { font-size: ${t(5.4)}; font-weight: 800; }
    .box { height: ${BH + 3}mm; display: flex; align-items: center; justify-content: center; }
    .box svg { display: block; overflow: hidden; }
    footer { height: ${P.FOOT}mm; box-sizing: border-box; display: flex; align-items: center; gap: ${t(6)}; border-top: ${t(0.6)} solid #000; font-size: ${t(3.6)}; font-weight: 700; white-space: nowrap; }
    footer .lg i { display: inline-block; width: ${t(8)}; height: ${t(2.4)}; margin-right: ${t(1.6)}; vertical-align: middle; }
    footer .lg b { margin-right: ${t(1.2)}; }
    footer .sc { margin-left: auto; }
    ${STYLE}
  </style></head><body><svg width="0" height="0" style="position:absolute"><defs>${defs}</defs></svg>${body}</body></html>` };
}

(async () => {
  const want = process.argv.slice(2);
  const order = siteOrder().filter((k) => !want.length || want.includes(k) || want.includes(family(k)));
  const fams = {};
  order.forEach((k) => (fams[family(k)] = fams[family(k)] || []).push(k));
  const b = await puppeteer.launch({ executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", headless: "new" });
  const pg = await b.newPage();
  const idxPath = path.join(OUT, "index.json");
  const index = fs.existsSync(idxPath) ? JSON.parse(fs.readFileSync(idxPath, "utf8")) : {};
  const report = [];
  for (const [fam, keys] of Object.entries(fams)) {
    const sheets = [];
    for (const k of keys) {
      await pg.setContent(`<!doctype html><html><body style="margin:0">${fs.readFileSync(path.join(CAD, k + ".svg"), "utf8")}</body></html>`, { waitUntil: "load" });
      const prep = await pg.evaluate(PREPARE);
      const inner = await pg.evaluate(() => document.querySelector("svg").innerHTML);
      const views = findViews(prep.occ, prep.tbBox, prep.heads, prep.els);
      sheets.push({ key: k, title: prep.title, dwg: prep.dwg, inner, occ: prep.occ, heads: prep.heads, views });
      report.push(`\n${k}: ${views.length} views, ${prep.changed.length} notes converted`);
      prep.changed.forEach((c) => report.push("   ✓ " + c));
      prep.left.forEach((c) => report.push("   ? " + c));
    }
    const famTitle = sheets[0].title;
    let pagesA3 = 0;
    for (const P of Object.values(PAPERS)) {
      const { html, total, starts } = familyHTML(famTitle, sheets, P);
      await pg.setContent(html, { waitUntil: "load" });
      await pg.pdf({ path: path.join(OUT, `${fam}${P.suffix}.pdf`), width: P.W + "mm", height: P.H + "mm", printBackground: true, preferCSSPageSize: true });
      if (P === PAPERS.a3) {
        pagesA3 = total;
        await pg.setViewport({ width: 1588, height: 1123, deviceScaleFactor: 1.25 });
        await pg.evaluate(() => document.fonts.ready);
        const els = await pg.$$("section.pg"), imgs = [];
        for (let i = 0; i < els.length; i++) {
          const f = `${fam}-${String(i + 1).padStart(2, "0")}.webp`;
          await els[i].screenshot({ path: path.join(OUT, f), type: "webp", quality: 78 }); imgs.push(f);
        }
        fs.readdirSync(OUT).filter((f) => f.startsWith(fam + "-") && /-\d\d\.webp$/.test(f) && f.replace(/-\d\d\.webp$/, "") === fam && !imgs.includes(f))
          .forEach((f) => fs.unlinkSync(path.join(OUT, f)));
        index[fam] = { title: famTitle, dwgs: sheets.map((s) => s.dwg), keys, starts, pages: imgs.length };
      } else index[fam].pagesA4 = total;
    }
    const mb = (f) => (fs.statSync(path.join(OUT, f)).size / 1e6).toFixed(1);
    console.log(`${fam.padEnd(16)} A3 ${String(pagesA3).padStart(3)} pages ${mb(fam + ".pdf").padStart(5)} MB   A4 ${String(index[fam].pagesA4).padStart(3)} pages ${mb(fam + "-a4.pdf").padStart(5)} MB`);
  }
  const ordered = {};
  Object.keys(index).sort((a, b) => order.findIndex((k) => family(k) === a) - order.findIndex((k) => family(k) === b)).forEach((k) => (ordered[k] = index[k]));
  fs.writeFileSync(idxPath, JSON.stringify(ordered, null, 1));
  fs.writeFileSync(path.join(OUT, "index.js"), `// Written by tools/node/print-drawings.js — the large-print sets the site offers.\nwindow.PRINTSETS = ${JSON.stringify(ordered)};\n`);
  fs.mkdirSync(path.join(ROOT, "build"), { recursive: true });
  fs.writeFileSync(path.join(ROOT, "build", "print-report.txt"), report.join("\n"));          // every note converted, and any figure left to check
  await b.close();
})();
