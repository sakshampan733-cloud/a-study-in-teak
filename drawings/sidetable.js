// The side tables — AST-DR-049. After the owner's photo (7 Oct, assets/refs/side-table-ref-cabriole-owner.jpg): a shaped
// serpentine top with a moulded edge and eared front corners, no stone; a deep apron with one drawer in burl and a brass
// rosette knob in the middle; carved scroll consoles at the four corners; tall slim cabriole legs with a bead down the
// front edge, ending in a scroll toe. 16 × 14 in and 24 in high, to sit in the bed-wall niche (AST-DR-034), one each side.
// Local: x across from the left edge of the top, y back to front from the wall, z up from the floor. Real units mm.

window.DRAWINGS = window.DRAWINGS || {};

const SIDETABLE = {
  rev: "1 — after the owner's photo: shaped top, burl drawer, cabriole legs; no stone",
  date: "07.10.2026",
  W: 406, D: 356, H: 610,          // 16 in wide, 14 in deep (owner), 24 in high — 3 in above the mattress
  top: 22, serp: 16, sideIn: 8,    // 7/8 in top; the front dips 5/8 in either side of a full centre; the sides 5/16 in
  apr: 100, aprS: 34, aprF: 30, aprB: 24,   // the apron: 4 in deep; in from the top's edge 1⅜ in at the sides, 1¼ at the front, 1 in at the back
  leg: 34, knee: 18,               // leg stock 1⅜ in square; the knee stands out ¾ in, on the diagonal
  drawer: { x: 70, gap: 12 }, knob: 30,
};

(function () {
  const { INK, THIN, f, text, view, chainH, chainV, labels, heading, frame, titleBlock, sheet } = window.DK;
  const K = SIDETABLE, W = K.W, D = K.D, H = K.H, zA = H - K.top, zB = zA - K.apr;
  const mono = (svg) => svg.replace(/#8a3a22/g, INK);
  const pts = (a) => a.map(([x, y]) => `${f(x)} ${f(y)}`).join(" L ");

  // the top in plan (y down = towards the room): straight back, the front a serpentine — full at the middle and at the
  // eared corners, dipping 16 between — the sides drawn in a little; the ears rounded
  function topOutline() {
    const n = 36, r = 9, o = [];
    for (let i = 0; i <= n; i++) { const y = (i / n) * (D - r); o.push([K.sideIn * Math.sin(Math.PI * y / D) ** 2, y]); }      // left side, back to front
    for (let k = 1; k < 4; k++) { const a = Math.PI - (k / 4) * Math.PI / 2; o.push([r + r * Math.cos(a), D - r + r * Math.sin(a)]); }   // the left ear
    for (let i = 0; i <= n; i++) { const x = r + (i / n) * (W - 2 * r); o.push([x, D - K.serp * Math.sin(2 * Math.PI * x / W) ** 2]); }
    for (let k = 1; k < 4; k++) { const a = Math.PI / 2 - (k / 4) * Math.PI / 2; o.push([W - r + r * Math.cos(a), D - r + r * Math.sin(a)]); }
    for (let i = n; i >= 0; i--) { const y = (i / n) * (D - r); o.push([W - K.sideIn * Math.sin(Math.PI * y / D) ** 2, y]); }
    return o;
  }
  // a cabriole leg seen square to one face, its outer side at u = 0 going outward to −u; z up. `Y` maps z to the page.
  function legPath(u0, dir, Y, th) {
    const U = (u) => u0 + dir * u, P = (u, z) => `${f(U(u))} ${f(Y(z))}`;
    const out = `M ${P(0, zB)} C ${P(-10, zB - 14)} ${P(-K.knee, zB - 46)} ${P(-K.knee, zB - 96)} C ${P(-K.knee, zB - 170)} ${P(-4, zB - 230)} ${P(4, 230)}`
      + ` C ${P(9, 170)} ${P(11, 110)} ${P(8, 66)} C ${P(5, 36)} ${P(-4, 18)} ${P(-10, 8)} C ${P(-12, 4)} ${P(-10, 0)} ${P(-6, 0)} L ${P(12, 0)}`
      + ` C ${P(16, 10)} ${P(21, 36)} ${P(23, 70)} C ${P(25, 116)} ${P(26, 176)} ${P(24, 236)} C ${P(21, zB - 220)} ${P(18, zB - 140)} ${P(22, zB - 70)} C ${P(26, zB - 30)} ${P(K.leg, zB - 10)} ${P(K.leg, zB)} Z`;
    const bead = `M ${P(4, zB - 10)} C ${P(-5, zB - 36)} ${P(-K.knee + 7, zB - 70)} ${P(-K.knee + 7, zB - 100)} C ${P(-K.knee + 7, zB - 170)} ${P(1, zB - 226)} ${P(9, 232)} C ${P(14, 172)} ${P(16, 112)} ${P(14, 72)}`;
    return `<path d="${out}" fill="#fff" stroke-width="${th * 1.2}"/><path d="${bead}" fill="none" stroke-width="${th * 0.45}"/>`;
  }
  // the carved console over each leg's top: a roundel, a reeded stem, a volute curling over the knee
  function console(u0, dir, Y, th) {
    const U = (u) => u0 + dir * u, w = 22;
    let o = `<path d="M ${f(U(1))} ${f(Y(zA))} L ${f(U(w))} ${f(Y(zA))} L ${f(U(w))} ${f(Y(zB - 10))} C ${f(U(w))} ${f(Y(zB - 30))} ${f(U(8))} ${f(Y(zB - 40))} ${f(U(2))} ${f(Y(zB - 28))} C ${f(U(-2))} ${f(Y(zB - 20))} ${f(U(1))} ${f(Y(zB - 8))} ${f(U(1))} ${f(Y(zB))} Z" fill="#fff" stroke-width="${th}"/>`;
    o += `<circle cx="${f(U(w / 2 + 0.5))}" cy="${f(Y(zA - 14))}" r="7" fill="#fff" stroke-width="${th * 0.8}"/><circle cx="${f(U(w / 2 + 0.5))}" cy="${f(Y(zA - 14))}" r="3" fill="none" stroke-width="${th * 0.5}"/>`;
    o += [6, 11, 16].map((u) => `<line x1="${f(U(u))}" y1="${f(Y(zA - 26))}" x2="${f(U(u))}" y2="${f(Y(zB + 4))}" stroke-width="${th * 0.4}"/>`).join("");
    o += `<path d="M ${f(U(14))} ${f(Y(zB - 14))} C ${f(U(16))} ${f(Y(zB - 26))} ${f(U(6))} ${f(Y(zB - 30))} ${f(U(6))} ${f(Y(zB - 22))} C ${f(U(6))} ${f(Y(zB - 17))} ${f(U(11))} ${f(Y(zB - 17))} ${f(U(11))} ${f(Y(zB - 21))}" fill="none" stroke-width="${th * 0.6}"/>`;
    return o;
  }
  // the moulded edge, seen from the front: the thumbnail, its fillet and the cove under
  const topFace = (x0, x1, Y, th) => `<rect x="${f(x0)}" y="${f(Y(H))}" width="${f(x1 - x0)}" height="${K.top}" fill="#fff" stroke-width="${th * 1.2}"/>`
    + [9, 15, 19].map((d) => `<line x1="${f(x0 + 3)}" y1="${f(Y(H - d))}" x2="${f(x1 - 3)}" y2="${f(Y(H - d))}" stroke-width="${th * 0.45}"/>`).join("");

  function front(th) {
    const Y = (z) => H - z, a0 = K.aprS, a1 = W - K.aprS, dr = K.drawer;
    let o = `<line x1="-60" y1="${Y(0)}" x2="${W + 60}" y2="${Y(0)}" stroke-width="${th * 3}"/>`;
    o += legPath(a0, 1, Y, th) + legPath(a1, -1, Y, th);
    o += `<rect x="${a0}" y="${Y(zA)}" width="${a1 - a0}" height="${K.apr}" fill="#fff" stroke-width="${th * 1.2}"/>`;            // the apron
    o += `<rect x="${dr.x}" y="${Y(zA - dr.gap)}" width="${W - 2 * dr.x}" height="${K.apr - 2 * dr.gap}" fill="#fff" stroke-width="${th}"/>`;   // the drawer
    o += `<rect x="${dr.x + 4}" y="${Y(zA - dr.gap - 4)}" width="${W - 2 * dr.x - 8}" height="${K.apr - 2 * dr.gap - 8}" fill="none" stroke-width="${th * 0.45}"/>`;   // cock bead
    o += burlMarks(dr.x + 10, W - dr.x - 10, zB + dr.gap + 10, zA - dr.gap - 10, Y, th);
    o += knob(W / 2, Y(zB + K.apr / 2), th, 1);
    o += console(a0, 1, Y, th) + console(a1, -1, Y, th);
    return o + topFace(0, W, Y, th);
  }
  function side(th) {
    const Y = (z) => H - z, b0 = K.aprB, b1 = D - K.aprF;
    let o = `<line x1="-60" y1="${Y(0)}" x2="${D + 60}" y2="${Y(0)}" stroke-width="${th * 3}"/>`;
    o += `<line x1="0" y1="${Y(0)}" x2="0" y2="${Y(H + 15)}" stroke-width="${th * 1.4}" stroke-dasharray="${th * 8} ${th * 5}"/>`;   // the parchment behind
    o += legPath(b0, 1, Y, th) + legPath(b1, -1, Y, th);
    o += `<rect x="${b0}" y="${Y(zA)}" width="${b1 - b0}" height="${K.apr}" fill="#fff" stroke-width="${th * 1.2}"/>` + burlMarks(b0 + 20, b1 - 20, zB + 14, zA - 14, Y, th);
    o += console(b0, 1, Y, th) + console(b1, -1, Y, th);
    return o + topFace(0, D, Y, th);
  }
  function burlMarks(x0, x1, z0, z1, Y, th) {            // a few loose burl swirls, so the drawer reads as figured veneer
    const cx = (x0 + x1) / 2, cz = (z0 + z1) / 2, w = (x1 - x0) / 2, h = (z1 - z0) / 2;
    return [[-0.55, 0.2, 0.18], [0.5, -0.25, 0.14], [-0.15, -0.35, 0.1], [0.2, 0.4, 0.09]].map(([a, b, r]) =>
      `<ellipse cx="${f(cx + a * w)}" cy="${f(Y(cz + b * h))}" rx="${f(r * w)}" ry="${f(r * w * 0.45)}" fill="none" stroke-width="${th * 0.3}" transform="rotate(${f(a * 30)} ${f(cx + a * w)} ${f(Y(cz + b * h))})"/>`).join("");
  }
  // the brass rosette knob, face on: a petalled backplate and a domed knob
  function knob(cx, cy, th, s = 1) {
    let o = `<circle cx="${f(cx)}" cy="${f(cy)}" r="${f(15 * s)}" fill="#fff" stroke-width="${th * 0.8}"/>`;
    for (let i = 0; i < 12; i++) { const a = (i / 12) * 2 * Math.PI; o += `<circle cx="${f(cx + 11.5 * s * Math.cos(a))}" cy="${f(cy + 11.5 * s * Math.sin(a))}" r="${f(2.6 * s)}" fill="none" stroke-width="${th * 0.35}"/>`; }
    return o + `<circle cx="${f(cx)}" cy="${f(cy)}" r="${f(8 * s)}" fill="#fff" stroke-width="${th}"/><circle cx="${f(cx)}" cy="${f(cy)}" r="${f(3 * s)}" fill="none" stroke-width="${th * 0.5}"/>`;
  }
  function plan(th, dash) {
    let o = `<line x1="-40" y1="0" x2="${W + 40}" y2="0" stroke-width="${th * 1.6}" stroke-dasharray="${th * 8} ${th * 5}"/>`;   // the parchment
    o += `<path d="M ${pts(topOutline())} Z" fill="#fff" stroke-width="${th * 1.3}"/>`;
    o += `<path d="M ${pts(topOutline().map(([x, y]) => [W / 2 + (x - W / 2) * (1 - 18 / W), y * (1 - 9 / D)]))}" fill="none" stroke-width="${th * 0.45}"/>`;   // the edge moulding's line, front and sides
    o += `<g fill="none" stroke-width="${th * 0.7}" stroke-dasharray="${dash}"><rect x="${K.aprS}" y="${K.aprB}" width="${W - 2 * K.aprS}" height="${D - K.aprB - K.aprF}"/>`;
    [[K.aprS, K.aprB, 1, 1], [W - K.aprS, K.aprB, -1, 1], [K.aprS, D - K.aprF, 1, -1], [W - K.aprS, D - K.aprF, -1, -1]].forEach(([x, y, sx, sy]) => {
      const cx = x + sx * K.leg / 2, cy = y + sy * K.leg / 2, back = sy > 0;
      o += `<rect x="${f(cx - K.leg / 2)}" y="${f(cy - K.leg / 2)}" width="${K.leg}" height="${K.leg}"/>`;
      o += `<ellipse cx="${f(cx - sx * 9)}" cy="${f(cy + (back ? 0 : 9))}" rx="13" ry="10"/>`;   // the foot: out on the diagonal at the front, sideways only at the back
    });
    return o + `</g>`;
  }
  // the top's edge in section, at 1:1: x outward to the edge, y down from the top face
  function edge(th) {
    let o = `<path d="M -62 0 L -6 0 C -1 0 5 2 8 7 C 10 10 10 13 7 15 L 5 16 L 5 19 C 5 21 3 22 0 22 L -62 22" fill="url(#hatchST)" stroke-width="${th * 1.3}"/>`;
    o += `<path d="M -62 -3 L -62 25" stroke-width="${th * 0.6}" stroke-dasharray="3 2"/>`;
    o += `<rect x="${-K.aprS - 18}" y="22" width="18" height="24" fill="url(#hatchST2)" stroke-width="${th}"/><line x1="${-K.aprS - 0.6}" y1="22" x2="${-K.aprS - 0.6}" y2="46" stroke-width="${th * 0.4}"/>`;   // the apron's side, veneered
    o += `<rect x="${-K.aprS - 18 - 10}" y="24" width="10" height="16" fill="#fff" stroke-width="${th * 0.8}"/>`;   // a wooden button holding the top down
    o += `<path d="M ${-K.aprS - 30} 46 L ${-K.aprS + 2} 46" stroke-width="${th * 0.6}" stroke-dasharray="3 2"/>`;
    return o;
  }
  function knobSection(th) {
    return `<rect x="0" y="-15" width="3" height="30" fill="#fff" stroke-width="${th}"/><path d="M 3 -8 L 8 -6 L 8 6 L 3 8 Z" fill="#fff" stroke-width="${th}"/>`
      + `<path d="M 8 -4 C 12 -9 22 -9 24 0 C 22 9 12 9 8 4 Z" fill="#fff" stroke-width="${th * 1.1}"/><rect x="-18" y="-15" width="18" height="30" fill="url(#hatchST2)" stroke-width="${th}"/>`
      + `<line x1="-14" y1="0" x2="20" y2="0" stroke-width="${th * 0.5}" stroke-dasharray="2 1.5"/>`;
  }

  window.DK.begin("sidetable");
  let s = frame();
  s += `<defs><pattern id="hatchST" patternUnits="userSpaceOnUse" width="3" height="3" patternTransform="rotate(45)"><rect width="3" height="3" fill="#fff"/><line x1="0" y1="0" x2="0" y2="3" stroke="#8c8c8c" stroke-width="0.3"/></pattern>
    <pattern id="hatchST2" patternUnits="userSpaceOnUse" width="2" height="2" patternTransform="rotate(-45)"><rect width="2" height="2" fill="#fff"/><line x1="0" y1="0" x2="0" y2="2" stroke="#8c8c8c" stroke-width="0.25"/></pattern></defs>`;

  const sc = 5;
  const vf = view(30, 34, sc, "Side table front"), tf = vf.w(0.12);
  s += heading(18, 17, "FRONT", `SCALE 1:${sc} · AS THE OWNER'S PHOTO`, 110);
  s += vf.g(front(tf), 0.3);
  s += chainH([0, K.aprS, K.drawer.x, W - K.drawer.x, W - K.aprS, W].map(vf.X), vf.Y(H) + 5, [K.aprS, K.drawer.x - K.aprS, `${W - 2 * K.drawer.x} DRAWER`, K.drawer.x - K.aprS, K.aprS], { from: vf.Y(H) + 1, size: 1.1 });
  s += chainH([vf.X(0), vf.X(W)], vf.Y(H) + 11, [`${W} TOP`], { from: vf.Y(H) + 1, size: 1.3 });
  s += chainV([vf.Y(H), vf.Y(H - zB), vf.Y(H - zA), vf.Y(0)], vf.X(W) + 8, [zB, K.apr, K.top], { from: vf.X(W) + 1, size: 1.1 });
  s += chainV([vf.Y(H), vf.Y(0)], vf.X(W) + 15, [`${H} HIGH`], { from: vf.X(W) + 1, size: 1.3 });
  { const L = labels(vf.X(W) + 21, "right", 34, 156);
    L.add(vf.X(W - 40), vf.Y(12), "SHAPED TOP, MOULDED EDGE", "WOOD, POLISHED DARK — NO STONE");
    L.add(vf.X(W / 2 + 60), vf.Y(H - zB - 50), "ONE DRAWER, BURL FRONT", "COCK-BEADED · SOFT-CLOSE RUNNERS");
    L.add(vf.X(W / 2 + 10), vf.Y(H - zB - K.apr / 2), "BRASS ROSETTE KNOB", "DETAIL 3");
    L.add(vf.X(W - K.aprS - 11), vf.Y(H - zA + 14), "CARVED CONSOLE, EACH CORNER", "ROUNDEL, REEDED STEM, VOLUTE");
    L.add(vf.X(W - K.aprS + K.knee - 2), vf.Y(H - zB + 92), "CABRIOLE LEG", "SOLID, A BEAD DOWN ITS FRONT EDGE");
    L.add(vf.X(W - K.aprS + 12), vf.Y(H - 6), "SCROLL TOE", "");
    s += L.draw(); }

  const vs = view(196, 34, sc, "Side table side"), ts = vs.w(0.12);
  s += heading(186, 17, "SIDE", `SCALE 1:${sc} · THE WALL ON THE LEFT`, 90);
  s += vs.g(side(ts), 0.3);
  s += chainH([0, K.aprB, D - K.aprF, D].map(vs.X), vs.Y(H) + 5, [K.aprB, `${D - K.aprB - K.aprF} APRON`, K.aprF], { from: vs.Y(H) + 1, size: 1.1 });
  s += chainH([vs.X(0), vs.X(D)], vs.Y(H) + 11, [`${D} TOP`], { from: vs.Y(H) + 1, size: 1.3 });

  const vp = view(312, 36, sc, "Side table plan"), tp = vp.w(0.1), dp = `${vp.w(1.2)} ${vp.w(0.8)}`;
  s += heading(300, 17, "PLAN", `SCALE 1:${sc} · THE WALL AT THE TOP · APRON AND LEGS DASHED`, 108);
  s += vp.g(plan(tp, dp), 0.3);
  s += chainV([vp.Y(0), vp.Y(D - K.serp), vp.Y(D)], vp.X(W) + 5, [D - K.serp, K.serp], { from: vp.X(W) + 1, size: 1.0 });
  s += chainH([vp.X(0), vp.X(W / 4), vp.X(W / 2)], vp.Y(D) + 5, [`${W / 4} TO THE DIP`, `${W / 4} TO THE FULL CENTRE`], { from: vp.Y(D) + 1, size: 1.0 });
  s += text(vp.X(W / 2), vp.Y(D / 2), "TOP — WOOD, NO STONE", { size: 1.4, anchor: "middle", fill: THIN });

  s += heading(300, 128, "2 · TOP EDGE", "SECTION · SCALE 1:1", 50);
  { const ve = view(362, 140, 1, "Side table top edge"), te = ve.w(0.15);
    s += ve.g(edge(te), 0.3);
    s += chainV([ve.Y(0), ve.Y(K.top)], ve.X(5) + 4, [K.top], { from: ve.X(5) + 0.5, size: 1.0 });
    const L2 = labels(ve.X(10) + 6, "right", 136, 186);
    L2.add(ve.X(7), ve.Y(6), "THUMBNAIL MOULDING", "AND A FILLET UNDER");
    L2.add(ve.X(-30), ve.Y(11), "THE TOP, SOLID", "⅞ IN, POLISHED DARK");
    L2.add(ve.X(-K.aprS - 9), ve.Y(38), "THE APRON SIDE", "BURL OUTSIDE");
    L2.add(ve.X(-K.aprS - 23), ve.Y(32), "WOODEN BUTTON", "LETS THE TOP MOVE");
    s += L2.draw(); }

  s += heading(300, 194, "3 · KNOB", "FACE AND SECTION · SCALE 1:1", 50);
  { const vk = view(318, 218, 1, "Side table knob"), tk = vk.w(0.15);
    s += vk.g(knob(0, 0, tk, 1), 0.3);
    const vk2 = view(352, 218, 1, "Side table knob section");
    s += vk2.g(knobSection(tk), 0.3);
    s += text(380, 214, "BRASS, CAST ROSETTE", { size: 1.4 }) + text(380, 217.5, "30 BACKPLATE, 16 KNOB", { size: 1.25, fill: THIN }) + text(380, 221, "BOLTED THROUGH THE DRAWER", { size: 1.25, fill: THIN }); }

  s += heading(18, 194, "NOTES", `REVISION ${K.rev.split(" ")[0]}`, 120);
  ["After the owner's photo (7 Oct): a shaped serpentine top with a moulded edge and eared front corners — wood, no",
   "stone (owner); a deep apron with one drawer, its front in burl, a brass rosette knob in the middle; a carved console",
   "at each corner; tall slim cabriole legs with a bead down the front edge, ending in a scroll toe. Two the same.",
   "16 × 14 in and 24 in high — the photo's table is taller; its proportions are kept, the height is set by the bed",
   "(3 in above the mattress). The back legs turn their knees sideways only, so the table stands tight to the parchment.",
   "Top and legs polished dark, as the photo; apron and drawer in the room's burl. Finish to confirm with the bed's."]
    .forEach((n, i) => (s += text(18, 204 + i * 4.2, n, { size: 1.42 })));

  s += titleBlock({ title: "THE SIDE TABLES", sub: "Front · Side · Plan · Top edge · Knob", date: K.date, rev: K.rev, dwg: "AST-DR-049", scale: "AS NOTED @ A3" });
  window.DRAWINGS.sidetable = { title: "The side tables · AST-DR-049", svg: mono(sheet(s)) };
})();
