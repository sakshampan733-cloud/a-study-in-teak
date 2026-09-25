// Trifold dressing mirror, AST-DR-027 — CONFIRMED: centre GLASS 2 ft 3 in, wings at 45°, the whole frame
// (wings angled) inside 3 ft 6 in across, 9 ft tall. Real-world units are mm.
window.DRAWINGS = window.DRAWINGS || {};

(function () {
  const { INK, THIN, f, text, view, chainH, chainV, heading, frame, titleBlock, sheet } = window.DK;
  const RED = "#b3261e", FRC = "#3a2e22", GL = "#cfdde3";
  const T = 25, FRAME = 32, HT = 2743, FOOT = 1067, HF = FOOT / 2;   // frame 1¼ in each side of every glass
  const FRx = ["", "¼", "½", "¾"];
  const ftin = (mm) => { const q = Math.round(mm / 25.4 * 4), F = Math.floor(q / 48), rem = q - F * 48, i = Math.floor(rem / 4), fr = FRx[rem % 4]; return (F ? F + " ft " : "") + (i || !fr ? i : "") + fr + " in"; };

  function geo(C, w, deg) {
    const A = deg * Math.PI / 180, hx = C / 2, u = [Math.cos(A), Math.sin(A)], nb = [Math.sin(A), -Math.cos(A)];
    return { C, w, deg, A, hx, u, nb, foot: 2 * (hx + w * u[0] + T * nb[0]), depth: T + w * u[1] };
  }
  function plan(g, th) {
    const { C, w, hx, u, nb } = g;
    let o = `<rect x="${f(-hx)}" y="0" width="${f(C)}" height="${T}" fill="${FRC}"/>`;
    o += `<line x1="${f(-hx + 30)}" y1="${T}" x2="${f(hx - 30)}" y2="${T}" stroke="${GL}" stroke-width="${th * 3}"/>`;
    [1, -1].forEach((s) => {
      const p0 = [s * hx, T], p1 = [s * (hx + w * u[0]), T + w * u[1]];
      const p2 = [p1[0] + s * T * nb[0], p1[1] + T * nb[1]], p3 = [p0[0] + s * T * nb[0], p0[1] + T * nb[1]];
      o += `<path d="M ${f(p0[0])} ${f(p0[1])} L ${f(p1[0])} ${f(p1[1])} L ${f(p2[0])} ${f(p2[1])} L ${f(p3[0])} ${f(p3[1])} Z" fill="${FRC}"/>`;
      o += `<circle cx="${f(p0[0])}" cy="${f(p0[1])}" r="${th * 4}" fill="#b08a3e"/>`;
      o += `<line x1="${f(p0[0])}" y1="${T}" x2="${f(s * (hx + w * 1.05))}" y2="${T}" stroke="${THIN}" stroke-width="${th * 0.6}" stroke-dasharray="${th * 3} ${th * 2}"/>`;
      const r = w * 0.8, a1 = [p0[0] + s * r, T], a2 = [p0[0] + s * r * u[0], T + r * u[1]];
      o += `<path d="M ${f(a1[0])} ${f(a1[1])} A ${r} ${r} 0 0 ${s > 0 ? 1 : 0} ${f(a2[0])} ${f(a2[1])}" fill="none" stroke="${RED}" stroke-width="${th * 0.8}"/>`;
    });
    o += `<rect x="${f(-HF)}" y="-6" width="${FOOT}" height="${f(g.depth + 12)}" fill="none" stroke="${RED}" stroke-width="${th * 0.7}" stroke-dasharray="${th * 5} ${th * 3}"/>`;
    o += `<line x1="${f(-HF - 20)}" y1="-40" x2="${f(HF + 20)}" y2="-40" stroke="${INK}" stroke-width="${th * 2}"/>`;
    return o;
  }
  function front(g, th) {
    const wf = g.w * g.u[0] + T * g.nb[0];
    let e = `<rect x="${f(-g.hx)}" y="0" width="${f(g.C)}" height="${HT}" fill="${FRC}"/>`;
    e += `<rect x="${f(-g.hx + 30)}" y="40" width="${f(g.C - 60)}" height="${HT - 120}" fill="${GL}"/>`;
    [1, -1].forEach((s) => {
      const x0 = s > 0 ? g.hx : -g.hx - wf;
      e += `<rect x="${f(x0)}" y="0" width="${f(wf)}" height="${HT}" fill="${FRC}" fill-opacity="0.8"/>`;
      e += `<rect x="${f(x0 + 25)}" y="40" width="${f(wf - 50)}" height="${HT - 120}" fill="${GL}" fill-opacity="0.65"/>`;
    });
    e += `<line x1="${f(-HF - 60)}" y1="${HT}" x2="${f(HF + 60)}" y2="${HT}" stroke="${INK}" stroke-width="${th * 2}"/>`;
    return e;
  }

  window.DK.begin("mirror");
  let s = frame();
  s += heading(18, 18, "DRESSING MIRROR — TRIFOLD", "CONFIRMED · CENTRE GLASS 2 FT 3 IN · WINGS AT 45° · WHOLE FRAME INSIDE 3 FT 6 IN", 220);

  const CG = 686, CF = CG + 2 * FRAME, DEG = 45;                       // centre glass 2 ft 3 in → frame 2 ft 5½ in
  const WF = ((FOOT - CF) / 2 - T * Math.sin(DEG * Math.PI / 180)) / Math.cos(DEG * Math.PI / 180);
  const OPTS = [geo(CF, Math.round(WF), DEG)];
  OPTS.forEach((g, k) => {
    const oy = 80, v = view(128, oy, 5, "Mirror plan"), th = v.w(0.12);
    s += text(128, oy - 18, "PLAN — FROM ABOVE", { size: 2.6, anchor: "middle", weight: 700 });
    s += v.g(plan(g, th), 0.3);
    s += text(v.X(0), v.Y(-40) - 1.6, "BACK WALL", { size: 1.3, anchor: "middle", fill: THIN });
    s += chainH([v.X(-HF), v.X(HF)], v.Y(-40) - 7, [`${FOOT} — 3 FT 6 IN, THE WHOLE FRAME`], { from: v.Y(-6), size: 1.5 });
    s += chainH([v.X(-g.hx), v.X(g.hx)], v.Y(g.depth) + 7, [`${g.C} CENTRE FRAME`], { from: v.Y(T), size: 1.4 });
    s += chainV([v.Y(0), v.Y(g.depth)], v.X(HF) + 7, [`${Math.round(g.depth)}`], { from: v.X(HF), size: 1.2 });
    s += text(v.X(g.hx + g.w * g.u[0] / 2), v.Y(g.depth) + 5, `WING ${g.w}`, { size: 1.4, anchor: "middle" });
    s += text(v.X(-g.hx - g.w * g.u[0] / 2), v.Y(g.depth) + 5, `WING ${g.w}`, { size: 1.4, anchor: "middle" });
    s += text(v.X(g.hx + g.w * 0.95) + 1.5, v.Y(T) + 3.2, `${g.deg}°`, { size: 1.7, fill: RED, weight: 700 });
    s += text(v.X(-g.hx - g.w * 0.95) - 1.5, v.Y(T) + 3.2, `${g.deg}°`, { size: 1.7, fill: RED, weight: 700, anchor: "end" });
    // front view beside it, 1:25
    const ve = view(320, 44, 25, "Mirror front"), te = ve.w(0.12);
    s += ve.g(front(g, te), 0.3);
    s += text(ve.X(0), 39, "FRONT VIEW", { size: 2.2, anchor: "middle", weight: 700 });
    s += chainH([ve.X(-HF), ve.X(HF)], ve.Y(HT) + 6, [`${FOOT} — 3 FT 6 IN`], { from: ve.Y(HT), size: 1.2 });
  });
  s += chainV([view(320, 44, 25).Y(0), view(320, 44, 25).Y(HT)], 320 + HF / 25 + 7, [`${HT} — 9 FT`], { from: 320 + HF / 25 + 1, size: 1.3 });

  // the numbers, as a table
  const G = OPTS[0], tx = 18, ty = 170, rows = [["", "FRAME", "GLASS"],
    ["Centre", ftin(G.C), ftin(G.C - 2 * FRAME)],
    ["Each wing", ftin(G.w), ftin(G.w - 2 * FRAME)],
    ["Height", "9 ft 0 in", ftin(HT - 2 * FRAME)],
    ["Wings", "45° forward, fixed stop", ""],
    ["Whole frame across", ftin(FOOT), ""],
    ["Stands off the wall", ftin(G.depth), ""],
    ["Floor either side", "7½ in", ""]];
  rows.forEach((r, i) => {
    const y = ty + i * 5.6, hd = i === 0;
    s += `<line x1="${tx}" y1="${f(y + 1.6)}" x2="${tx + 150}" y2="${f(y + 1.6)}" stroke="${hd ? INK : "#ddd"}" stroke-width="${hd ? 0.3 : 0.15}"/>`;
    r.forEach((c, j) => { if (c) s += text(tx + [0, 62, 112][j], y, c, { size: hd ? 1.7 : 1.6, weight: hd || j === 0 ? 700 : 400, fill: hd ? RED : INK }); });
  });

  s += heading(18, 226, "NOTES", "CONFIRMED", 220);
  [["CONFIRMED by the owner: centre glass 2 ft 3 in, wings at 45°, and the whole frame — wings angled —",
    "   inside 3 ft 6 in across (the red dashed box). All three panels 9 ft tall, level with the wardrobes.",
    "The cost of a 2 ft 3 in centre inside 3 ft 6 in: the wings are small — about 5¼ in of glass each.",
    "   A slimmer 1 in frame would give them about 6¼ in."],
   ["The wings need a fixed stop at 45°. Opened any flatter, the frame gets wider than 3 ft 6 in.",
    "Hinges: two continuous piano hinges on the back, one at each joint, in the frame finish.",
    "Free-standing, centred on the far wall. 7½ in of floor either side, clear of the folding",
    "   end-bay doors, which come out only about 3 in at this depth. Frame finish still open."]]
    .forEach((col, c) => col.forEach((n, i) => (s += text(18 + c * 172, 238 + i * 4.6, n, { size: 1.55 }))));
  s += titleBlock({ title: "DRESSING MIRROR", sub: "Trifold · confirmed", date: "26.09.2026", rev: "4 — centre glass 2 ft 3 in, wings at 45°", dwg: "AST-DR-027", scale: "1:5 AND 1:25 @ A3" });
  window.DRAWINGS.mirror = { title: "Dressing mirror — trifold · AST-DR-027", svg: sheet(s), model: true };
  window.MIRROR_NUMS = OPTS.map((g) => ({ deg: g.deg, foot: Math.round(g.foot), depth: Math.round(g.depth) }));
})();
