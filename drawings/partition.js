// Partition — a low teak console (parchment drawers) at the 610 datum, carrying a slim veneered
// screen up to the ceiling. Rounded (bullnose) ends both in plan, so passing round them is soft.
// AST-DR-008. Real-world units are mm; y measured UP from the floor, x along the partition run.

window.RWALL = window.RWALL; // (no dependency — kept isolated)
window.DRAWINGS = window.DRAWINGS || {};

const PART = {
  rev: "1 — console + slim screen, at the room's 610 datum",
  date: "18.09.2026",
  run: 2438,                  // the partition body, about 8 ft (confirmed nominal — fine-measure on site)
  H: 2743,                    // ceiling, matching the rest of the room
  base: { h: 610, d: 420 },   // console to the 610 line — the same datum as the study cupboards and the right wall rail
  wall: { t: 140 },           // the thin screen above the console
  mould: { w: 40, proj: 16 }, // slim applied frame — "a little moulding, not too much"
  drawers: 4,                 // equal parchment-fronted drawers across the console
  panels: 3,                  // equal flush panels across the screen above
  gapA: 1067, gapB: 760,      // the two walk-round gaps either side (rough — to confirm so they sum to the room width)
};

(function () {
  const { INK, THIN, f, text, view, chainH, chainV, note, heading, frame, titleBlock, sheet } = window.DK;
  const K = PART, B = K.base, W2 = K.wall, M = K.mould;
  const yDado = B.h;

  const ey = (y) => K.H - y;
  const R = (x0, y0, x1, y1, a = "") => `<rect x="${f(Math.min(x0, x1))}" y="${f(ey(Math.max(y0, y1)))}" width="${f(Math.abs(x1 - x0))}" height="${f(Math.abs(y1 - y0))}" ${a}/>`;
  const Ln = (x0, y0, x1, y1, a = "") => `<line x1="${f(x0)}" y1="${f(ey(y0))}" x2="${f(x1)}" y2="${f(ey(y1))}" ${a}/>`;
  const Wd = (th) => `stroke-width="${th}"`;

  // A drawer or panel front: outer edge, slim applied frame, a raised or flush centre.
  function front(x0, x1, y0, y1, th, fillMid = "none") {
    let o = R(x0, y0, x1, y1, `fill="none" ${Wd(th * 1.3)}`);
    o += R(x0 + M.w, y0 + M.w, x1 - M.w, y1 - M.w, `fill="${fillMid}" ${Wd(th)}`);
    return o;
  }
  // Parchment texture — a soft mottled fill for drawer fronts.
  const parch = (x0, y0, x1, y1) => `<rect x="${f(x0)}" y="${f(ey(y1))}" width="${f(x1 - x0)}" height="${f(y1 - y0)}" fill="url(#parchFill)"/>`;

  // ── Elevation: the console (parchment drawers) below, the slim screen (flush panels) above.
  // Both faces of the partition are built the same way — this is either face.
  function elevation(th, showTV) {
    const x0 = 0, x1 = K.run, r = B.h; // console is a tall bullnose pill — its rounded end shows in the elevation as a simple round-over
    let o = "";
    // console carcase
    o += R(x0, 0, x1, B.h, `fill="none" ${Wd(th * 1.4)}`);
    o += Ln(x0, B.h - 14, x1, B.h - 14, Wd(th)); // reeded top edge, matching the room's counter tops
    for (let i = 1; i < 4; i++) o += Ln(x0, B.h - 14 - i * 10, x1, B.h - 14 - i * 10, `${Wd(th * 0.6)} opacity=".6"`);
    // drawer fronts
    const dw = (x1 - x0 - M.w * (K.drawers + 1)) / K.drawers;
    for (let i = 0; i < K.drawers; i++) {
      const a = x0 + M.w + i * (dw + M.w), b = a + dw;
      o += front(a, b, 60, B.h - 40, th);
      o += parch(a + M.w + 6, 60 + M.w + 6, b - M.w - 6, B.h - 40 - M.w - 6);
      const hx = (a + b) / 2;
      o += `<circle cx="${f(hx)}" cy="${f(ey((60 + B.h - 40) / 2))}" r="6" ${Wd(th)} fill="#fff"/>`;
    }
    // slim screen above
    const pw = (x1 - x0 - M.w * (K.panels + 1)) / K.panels;
    for (let i = 0; i < K.panels; i++) {
      const a = x0 + M.w + i * (pw + M.w), b = a + pw;
      o += front(a, b, B.h + 60, K.H - 60, th);
    }
    if (showTV) {
      const tw = 1100, thh = 640, cx = (x0 + x1) / 2;
      o += R(cx - tw / 2, B.h + 90, cx + tw / 2, B.h + 90 + thh, `fill="#111" ${Wd(th)}`);
      o += text(cx, ey(B.h + 90 + thh / 2) - 6, "TV (OPTION)", { size: 2, anchor: "middle", fill: "#fff" });
    }
    o += `<line x1="-40" y1="${ey(0)}" x2="${x1 + 40}" y2="${ey(0)}" ${Wd(th * 4)}/>`;
    return o;
  }

  // ── Plan, cut at 1200 (through the thin screen). The wider console footprint shows dashed beneath.
  // Both ends are rounded (bullnose) — the leading edge people pass, softened rather than square.
  function plan(th, dash) {
    const cx0 = 0, cx1 = K.run, cy = W2.t / 2;
    let o = "";
    // console footprint (below the cut) — a rounded pill, dashed
    const cr = B.d / 2;
    o += `<path d="M ${cx0 + cr} ${-B.d / 2} H ${cx1 - cr} A ${cr} ${cr} 0 0 1 ${cx1 - cr} ${B.d / 2} H ${cx0 + cr} A ${cr} ${cr} 0 0 1 ${cx0 + cr} ${-B.d / 2} Z" fill="none" stroke-dasharray="${dash}" ${Wd(th)}/>`;
    // thin screen at the cut — a slim rounded-end bar
    const wr = W2.t / 2;
    o += `<path d="M ${cx0 + wr} ${-wr} H ${cx1 - wr} A ${wr} ${wr} 0 0 1 ${cx1 - wr} ${wr} H ${cx0 + wr} A ${wr} ${wr} 0 0 1 ${cx0 + wr} ${-wr} Z" ${Wd(th * 1.6)}/>`;
    // solid teak lipping wrapping the rounded ends (drawn as a slightly heavier double line at both ends)
    [cx0 + wr, cx1 - wr].forEach((x) => { o += `<circle cx="${f(x)}" cy="0" r="${wr - 4}" fill="none" ${Wd(th)}/>`; });
    return o;
  }

  // ── Detail 1: the moulding — a slim quirk-and-bead, applied, mitred at the corners.
  function mouldPath() {
    const w = M.w, p = M.proj;
    return `M 0 0 L ${w} 0 L ${w} ${p * 0.35} Q ${w} ${p * 0.7} ${w - 6} ${p * 0.72} Q ${w - 14} ${p * 0.74} ${w - 14} ${p} L 6 ${p} Q 6 ${p * 0.74} 0 ${p * 0.35} Z`;
  }

  // ── Detail 2: the rounded end, in plan, close up — the solid teak lipping wrapping the veneered core.
  function endDetail(th) {
    const r = W2.t / 2;
    let o = `<circle cx="0" cy="0" r="${r}" fill="url(#hatchPT)" ${Wd(th)}/>`;
    o += `<circle cx="0" cy="0" r="${r - 5}" fill="none" ${Wd(th * 0.6)}/>`;
    o += `<line x1="${-r - 60}" y1="${-r}" x2="0" y2="${-r}" ${Wd(th)}/><line x1="${-r - 60}" y1="${r}" x2="0" y2="${r}" ${Wd(th)}/>`;
    return o;
  }

  // ═════════════ SHEET — PARTITION ═════════════
  window.DK.begin("partition");
  let s = frame();
  s += `<defs>
    <pattern id="parchFill" patternUnits="userSpaceOnUse" width="20" height="14"><rect width="20" height="14" fill="#e7dcc2"/><path d="M0 4h20M0 10h20" stroke="#d8c9a3" stroke-width="0.6"/></pattern>
    <pattern id="hatchPT" patternUnits="userSpaceOnUse" width="3" height="3" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="3" stroke="#999" stroke-width="0.25"/></pattern>
  </defs>`;

  // Elevation 1:20
  const sc = 20, ox = 55, vE = view(ox, 34, sc, "Partition elevation"), tE = vE.w(0.12);
  s += heading(18, 17, "ELEVATION", `EITHER FACE · SCALE 1:${sc} · BOTH FACES BUILT THE SAME WAY`, 100);
  s += vE.g(elevation(tE, true), 0.3);
  const yb = vE.Y(ey(0));
  s += chainV([0, B.h, K.H].map((y) => vE.Y(ey(y))), vE.X(K.run) + 6, [B.h, K.H - B.h], { from: vE.X(K.run) + 1, size: 1.4 });
  s += chainV([vE.Y(ey(K.H)), vE.Y(ey(0))], vE.X(K.run) + 14, [`${K.H} (9 FT)`], { from: vE.X(K.run) + 1, size: 1.4 });
  s += chainH([vE.X(0), vE.X(K.run)], yb + 6, [`${K.run} (ABOUT 8 FT)`], { from: yb + 1, size: 1.4 });
  const lab = (x, y, ly, t1, t2) => note(vE.X(x), vE.Y(ey(y)), 55 - 4, vE.Y(ey(ly)), t1, t2 || "", "end");
  s += lab(K.run * 0.15, B.h + 400, B.h + 700, "SLIM SCREEN ABOVE", `${W2.t} THICK — KEEPS THE ROOM OPEN`);
  s += lab(K.run * 0.15, B.h - 250, 250, "PARCHMENT DRAWERS", "ON THE 610 LINE — SAME AS THE STUDY CUPBOARDS");
  s += lab(K.run * 0.85, B.h - 480, 470, "REEDED TOP", "MATCHES THE DESK AND THE STUDY COUNTER");

  // Plan 1:20
  const vP = view(ox, 226, sc, "Partition plan"), tP = vP.w(0.12);
  s += heading(18, 200, "PLAN", `CUT AT 1200 · SCALE 1:${sc} · CONSOLE FOOTPRINT DASHED BELOW`, 100);
  s += vP.g(plan(tP, `${vP.w(1)} ${vP.w(0.7)}`), 0.3);
  s += chainV([vP.Y(-B.d / 2), vP.Y(B.d / 2)], vP.X(K.run) + 10, [B.d], { from: vP.X(K.run) + 1, size: 1.4 });
  s += chainV([vP.Y(-W2.t / 2), vP.Y(W2.t / 2)], vP.X(K.run) + 30, [W2.t], { from: vP.X(K.run) + 21, size: 1.3 });
  s += note(vP.X(K.run - W2.t / 2), vP.Y(0), vP.X(K.run) + 40, vP.Y(-B.d / 2 - 500), "BULLNOSE END, BOTH SIDES", "SOLID TEAK LIPPING WRAPS THE VENEERED CORE");
  s += note(vP.X(W2.t / 2), vP.Y(0), 55 - 4, vP.Y(-B.d / 2 - 900), "GAP TO CONFIRM", `≈ ${K.gapA} ONE END, ${K.gapB} THE OTHER`, "end");

  // Notes
  s += heading(300, 17, "NOTES", `REVISION ${K.rev.split(" ")[0]}`, 60);
  ["The idea: the 610 line runs through the whole room —", "   study cupboards, the right wall rail, and now this.", "Console is deeper (for real drawers); the screen above",
   "   stays thin, so the room keeps its air above waist height.", "Both faces built the same — panels/drawers mirrored.", "Bullnose ends, both console and screen, in solid teak.",
   "TV can sit on the console against the screen (either face).", "Run length and the two end gaps are estimates —", "   they should add up to the room's width. Confirm on site."]
    .forEach((n, i) => { s += text(300, 30 + i * 4.6, n, { size: 1.55 }); });

  // Detail 1 — moulding
  s += heading(300, 130, "1 · APPLIED MOULDING", "SECTION · 1:1", 60);
  {
    const v = view(310, 168, 1, "Moulding section");
    s += v.g(`<path d="${mouldPath()}" fill="url(#hatchPT)"/><line x1="-8" y1="0" x2="${M.w + 8}" y2="0" stroke-width="0.6"/>`, 0.25);
    s += chainH([v.X(0), v.X(M.w)], 174, [M.w], { from: 169, size: 1.4 });
    s += chainV([v.Y(-M.proj), v.Y(0)], v.X(M.w) + 5, [M.proj], { from: v.X(M.w) + 1, size: 1.4 });
    s += text(310, 182, "SLIM, APPLIED — “A LITTLE, NOT TOO MUCH”", { size: 1.4, fill: THIN });
  }

  // Detail 2 — rounded end
  s += heading(300, 200, "2 · ROUNDED END", "PLAN CLOSE-UP · SCALE 1:2", 70);
  {
    const s2 = 2, v = view(340, 232, s2, "Rounded end detail");
    s += v.g(endDetail(v.w(0.12)), 0.3);
    s += text(300, 260, "SOLID TEAK LIPPING OVER THE VENEERED CORE", { size: 1.4, fill: THIN });
  }

  s += titleBlock({ title: "PARTITION — CONSOLE + SCREEN", sub: "Elevation · Plan · Details", date: K.date, rev: K.rev, dwg: "AST-DR-008" });

  window.DRAWINGS.partition = { title: "Partition — Console + screen · AST-DR-008", svg: sheet(s), params: PART };
})();
