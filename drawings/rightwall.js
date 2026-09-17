// Right wall — applied panel moulding (option C), bathroom door, 2 ft of wall past the door.
// AST-DR-007 general arrangement + details. Real-world units are mm; y measured UP from the floor, x from the study wall.

window.DRAWINGS = window.DRAWINGS || {};

const RWALL = {
  rev: "1 — option C, 5 panels, 3 lamps",
  date: "17.09.2026",
  run: 4420,                   // study wall to the bathroom door opening, about 14.5 ft (owner's estimate — confirm)
  H: 2743,                     // 9 ft ceiling
  wall: 230,
  study: { w: 475, h: 610 },   // end of the study cupboards (counter top on the 610 line)
  skirt: { h: 130, t: 18 },
  dado: { y: 610, h: 45, proj: 28 },   // rail sits on the 610 line so it runs on from the study counter top
  crown: { h: 150, proj: 120, led: 40 },
  mould: { w: 55, proj: 24 },          // panel moulding, painted the wall colour
  stile: 150, edge: 100,               // gap between panels; margin beside the door architrave and at the corner
  bays: 5,
  lamps: [1, 3, 5],                    // lamps centred inside tall panels 1, 3 and 5
  short: { y0: 240, y1: 530 },
  tall: { y0: 765, top: 160 },         // tall panels stop 160 below the crown
  door: { w: 762, h: 2438, arch: 65 }, // bathroom door 2 ft 6 × 8 ft, architrave about 2½ in
  ret: 610,                            // 2 ft of wall past the door opening to the corner
  lamp: { y: 1290, span: 150, proj: 230 },   // twin-arm sconce, same height and family as the study wall
};

(function () {
  const { INK, THIN, f, text, view, chainH, chainV, note, heading, frame, titleBlock, sheet } = window.DK;
  const K = RWALL, D = K.door, M = K.mould;

  // ── layout along the wall ──
  const L = K.run + D.w + K.ret;
  const aL = K.run - D.arch, aR = K.run + D.w + D.arch;          // architrave outer edges
  const pw = (aL - K.study.w - K.stile * K.bays - K.edge) / K.bays;
  const bays = Array.from({ length: K.bays }, (_, i) => { const x0 = K.study.w + K.stile + i * (pw + K.stile); return [x0, x0 + pw]; });
  const narrow = [aR + K.edge, L - K.edge];
  const yCrown = K.H - K.crown.h, yTall = yCrown - K.tall.top, yDado = K.dado.y + K.dado.h;

  const ey = (y) => K.H - y;
  const R = (x0, y0, x1, y1, a = "") => `<rect x="${f(Math.min(x0, x1))}" y="${f(ey(Math.max(y0, y1)))}" width="${f(Math.abs(x1 - x0))}" height="${f(Math.abs(y1 - y0))}" ${a}/>`;
  const Ln = (x0, y0, x1, y1, a = "") => `<line x1="${f(x0)}" y1="${f(ey(y0))}" x2="${f(x1)}" y2="${f(ey(y1))}" ${a}/>`;
  const W = (th) => `stroke-width="${th}"`;

  // Panel: outer edge, two steps of the ogee, inner edge — the same profile as detail 1.
  function panel(x0, y0, x1, y1, th) {
    return R(x0, y0, x1, y1) + `<g ${W(th)}>${R(x0 + 18, y0 + 18, x1 - 18, y1 - 18)}${R(x0 + 34, y0 + 34, x1 - 34, y1 - 34)}</g>` + R(x0 + M.w, y0 + M.w, x1 - M.w, y1 - M.w);
  }

  // Twin-arm candle sconce with fabric shades (same as the study wall sconces).
  function sconce(cx, th) {
    const y = K.lamp.y, sp = K.lamp.span;
    let o = `<ellipse cx="${f(cx)}" cy="${f(ey(y))}" rx="28" ry="60" fill="#fff"/><ellipse cx="${f(cx)}" cy="${f(ey(y))}" rx="18" ry="44" ${W(th)}/><circle cx="${f(cx)}" cy="${f(ey(y))}" r="9" fill="#fff"/>`;
    [-1, 1].forEach((m) => {
      const ax = cx + m * sp;
      o += `<path fill="none" d="M ${f(cx + m * 12)} ${f(ey(y - 10))} C ${f(cx + m * 70)} ${f(ey(y - 80))} ${f(ax - m * 10)} ${f(ey(y - 50))} ${f(ax)} ${f(ey(y + 20))}"/>`;
      o += `<path fill="none" ${W(th)} d="M ${f(cx + m * 12)} ${f(ey(y - 20))} C ${f(cx + m * 60)} ${f(ey(y - 72))} ${f(ax - m * 16)} ${f(ey(y - 44))} ${f(ax - m * 4)} ${f(ey(y + 14))}"/>`;
      o += `<path d="M ${f(ax - 26)} ${f(ey(y + 20))} Q ${f(ax)} ${f(ey(y + 2))} ${f(ax + 26)} ${f(ey(y + 20))} L ${f(ax + 18)} ${f(ey(y + 36))} L ${f(ax - 18)} ${f(ey(y + 36))} Z" fill="#fff"/>`;
      o += R(ax - 8, y + 36, ax + 8, y + 90, 'fill="#fff"');
      o += `<path d="M ${f(ax - 60)} ${f(ey(y + 90))} L ${f(ax + 60)} ${f(ey(y + 90))} L ${f(ax + 36)} ${f(ey(y + 190))} L ${f(ax - 36)} ${f(ey(y + 190))} Z" fill="#fff"/>`;
      o += `<g ${W(th)}>${[-40, -20, 0, 20, 40].map((d) => `<line x1="${f(ax + d)}" y1="${f(ey(y + 92))}" x2="${f(ax + d * 0.6)}" y2="${f(ey(y + 188))}"/>`).join("")}</g>`;
    });
    return o;
  }

  function elevation(th) {
    let o = "";
    // crown with the LED lip, dashed line of light under it
    o += R(0, yCrown, L, K.H) + `<g ${W(th)}>${Ln(0, yCrown + 30, L, yCrown + 30)}${Ln(0, yCrown + 70, L, yCrown + 70)}${Ln(0, K.H - 20, L, K.H - 20)}</g>`;
    o += Ln(0, yCrown - 25, L, yCrown - 25, `${W(th)} stroke-dasharray="60 30"`);
    // skirting and dado rail, stopping at the architrave
    [[K.study.w, aL], [aR, L]].forEach(([a, b]) => {
      o += R(a, 0, b, K.skirt.h) + Ln(a, K.skirt.h - 25, b, K.skirt.h - 25, W(th));
      o += R(a, K.dado.y, b, yDado) + Ln(a, K.dado.y + 15, b, K.dado.y + 15, W(th)) + Ln(a, K.dado.y + 30, b, K.dado.y + 30, W(th));
    });
    // end of the study cupboards: reeded counter top on the 610 line
    o += R(0, 0, K.study.w, K.study.h) + `<g ${W(th)}>${Ln(0, K.study.h - 40, K.study.w, K.study.h - 40)}${Ln(0, K.study.h - 30, K.study.w, K.study.h - 30)}${Ln(0, K.study.h - 20, K.study.w, K.study.h - 20)}${Ln(0, K.study.h - 10, K.study.w, K.study.h - 10)}${R(40, 40, K.study.w - 40, K.study.h - 80)}</g>`;
    // panels
    [...bays, narrow].forEach(([a, b]) => { o += panel(a, K.short.y0, b, K.short.y1, th) + panel(a, K.tall.y0, b, yTall, th); });
    K.lamps.forEach((n) => { const [a, b] = bays[n - 1]; o += sconce((a + b) / 2, th); });
    // bathroom door: stepped architrave, leaf with two moulded panels, lever
    o += R(aL, 0, aR, D.h + D.arch) + `<g ${W(th)}>${R(aL + 20, 0, aR - 20, D.h + D.arch - 20)}${R(aL + 40, 0, aR - 40, D.h + D.arch - 40)}</g>`;
    o += R(K.run, 0, K.run + D.w, D.h);
    const px0 = K.run + 110, px1 = K.run + D.w - 110;
    o += `<g ${W(th)}>${R(px0, 1300, px1, D.h - 150)}${R(px0 + 30, 1330, px1 - 30, D.h - 180)}${R(px0, 150, px1, 1150)}${R(px0 + 30, 180, px1 - 30, 1120)}</g>`;
    o += R(K.run + D.w - 80, 1000, K.run + D.w - 60, 1060) + Ln(K.run + D.w - 70, 1030, K.run + D.w - 190, 1030, W(th * 3));
    o += `<line x1="-150" y1="${ey(0)}" x2="${L + 150}" y2="${ey(0)}" stroke-width="${th * 5}"/><line x1="-150" y1="${ey(K.H)}" x2="${L + 150}" y2="${ey(K.H)}" stroke-width="${th * 3}" stroke-dasharray="40 20"/>`;
    return o;
  }

  // PLAN cut at 1000 (below the lamps). y = distance into the room from the wall face; the wall is above (negative y).
  function plan(th, dash) {
    let o = `<rect x="-${K.wall}" y="-${K.wall}" width="${K.run + K.wall}" height="${K.wall}" fill="url(#hatchRW)" stroke="none"/><rect x="${K.run + D.w}" y="-${K.wall}" width="${K.ret + K.wall}" height="${K.wall}" fill="url(#hatchRW)" stroke="none"/>`;
    o += `<rect x="-${K.wall}" y="-${K.wall}" width="${K.wall}" height="${K.wall + 600}" fill="url(#hatchRW)" stroke="none"/><rect x="${L}" y="-${K.wall}" width="${K.wall}" height="${K.wall + 600}" fill="url(#hatchRW)" stroke="none"/>`;
    o += `<path d="M 0 600 L 0 0 L ${K.run} 0 L ${K.run} -${K.wall} M ${K.run + D.w} -${K.wall} L ${K.run + D.w} 0 L ${L} 0 L ${L} 600" stroke-width="${th * 3}"/>`;
    // door leaf opening into the bathroom, swing dashed
    o += `<g stroke-width="${th}"><rect x="${K.run}" y="-${K.wall + D.w}" width="40" height="${D.w}"/><path d="M ${K.run + 40} -${K.wall + D.w} A ${D.w} ${D.w} 0 0 1 ${K.run + D.w} -${K.wall}" stroke-dasharray="${dash}"/></g>`;
    // architraves
    [[aL, K.run], [K.run + D.w, aR]].forEach(([a, b]) => { o += `<rect x="${a}" y="0" width="${b - a}" height="22"/>`; });
    // study cupboards return
    o += `<rect x="0" y="0" width="${K.study.w}" height="600"/><line x1="0" y1="600" x2="${K.study.w}" y2="600" stroke-dasharray="${dash}" stroke-width="${th}"/>`;
    // skirting, rail (below the cut, dashed), mouldings on the wall face
    [[K.study.w, aL], [aR, L]].forEach(([a, b]) => {
      o += `<rect x="${a}" y="0" width="${b - a}" height="${K.skirt.t}" stroke-width="${th}"/>`;
      o += `<line x1="${a}" y1="${K.dado.proj}" x2="${b}" y2="${K.dado.proj}" stroke-dasharray="${dash}" stroke-width="${th}"/>`;
    });
    [...bays, narrow].forEach(([a, b]) => { o += `<rect x="${a}" y="0" width="${M.w}" height="${M.proj}" stroke-width="${th}"/><rect x="${b - M.w}" y="0" width="${M.w}" height="${M.proj}" stroke-width="${th}"/>`; });
    // lamps above the cut
    K.lamps.forEach((n) => {
      const [a, b] = bays[n - 1], cx = (a + b) / 2, sp = K.lamp.span;
      o += `<g stroke-dasharray="${dash}" stroke-width="${th}"><path d="M ${cx} 0 L ${cx} 60 Q ${cx} ${K.lamp.proj - 90} ${cx - sp} ${K.lamp.proj - 60} M ${cx} 60 Q ${cx} ${K.lamp.proj - 90} ${cx + sp} ${K.lamp.proj - 60}"/><circle cx="${cx - sp}" cy="${K.lamp.proj - 60}" r="60"/><circle cx="${cx + sp}" cy="${K.lamp.proj - 60}" r="60"/></g>`;
    });
    return o;
  }

  // Crown profile with the LED lip (x = projection from the wall, y up), used in the section and detail 3.
  function crownPath() {
    const C = K.crown, y0 = yCrown;
    return `M 0 ${f(ey(y0))} L 20 ${f(ey(y0))} L 20 ${f(ey(y0 + 12))} L ${C.led} ${f(ey(y0 + 12))} L ${C.led} ${f(ey(y0 + 25))} ` +
      `C ${C.led + 5} ${f(ey(y0 + 60))} ${C.proj - 40} ${f(ey(y0 + 55))} ${C.proj - 20} ${f(ey(y0 + 95))} ` +
      `C ${C.proj - 5} ${f(ey(y0 + 115))} ${C.proj} ${f(ey(y0 + 120))} ${C.proj} ${f(ey(y0 + 130))} L ${C.proj} ${f(ey(K.H))} L 0 ${f(ey(K.H))} Z`;
  }
  // LED strip sitting in the lip, facing down the wall
  const ledStrip = (th) => `<rect x="24" y="${f(ey(yCrown + 10))}" width="12" height="8" fill="#fff" stroke-width="${th}"/>`;

  function dadoPath() {
    const y = K.dado.y, p = K.dado.proj;
    return `M 0 ${ey(y)} L 8 ${ey(y)} Q 12 ${ey(y + 4)} 14 ${ey(y + 8)} Q ${p} ${ey(y + 10)} ${p} ${ey(y + 22)} Q ${p} ${ey(y + 34)} 16 ${ey(y + 38)} L 12 ${ey(y + K.dado.h)} L 0 ${ey(y + K.dado.h)} Z`;
  }
  function skirtPath() {
    const h = K.skirt.h, t = K.skirt.t;
    return `M 0 ${ey(0)} L ${t} ${ey(0)} L ${t} ${ey(h - 30)} Q ${t} ${ey(h - 18)} ${t - 7} ${ey(h - 14)} Q ${t - 12} ${ey(h - 8)} 6 ${ey(h)} L 0 ${ey(h)} Z`;
  }
  // Panel moulding across its width: flat back on the wall, ogee rising to a bead, small step at the inner edge.
  function mouldPath(x0, yBase, s = 1) {
    const P = (x, y) => `${f(x0 + x * s)} ${f(yBase - y * s)}`;
    return `M ${P(0, 0)} L ${P(0, 5)} Q ${P(2, 14)} ${P(12, 15)} Q ${P(22, 16)} ${P(26, 22)} Q ${P(32, 24)} ${P(37, 20)} Q ${P(44, 9)} ${P(50, 8)} L ${P(55, 8)} L ${P(55, 0)} Z`;
  }

  // SECTION through tall panel 1 and its lamp: wall on the left, room to the right.
  function section(th) {
    let o = `<rect x="-${K.wall}" y="${ey(K.H)}" width="${K.wall}" height="${K.H}" fill="url(#hatchRW)" stroke-width="${th * 2}"/>`;
    o += `<path d="${skirtPath()}" fill="url(#hatchRW2)"/><path d="${dadoPath()}" fill="url(#hatchRW2)"/><path d="${crownPath()}" fill="url(#hatchRW2)"/>` + ledStrip(th);
    // moulding rails cut through: short panel top/bottom, tall panel top/bottom (22 proud, 55 high)
    [K.short.y0, K.short.y1 - M.w, K.tall.y0, yTall - M.w].forEach((y) => { o += `<rect x="0" y="${ey(y + M.w)}" width="${M.proj}" height="${M.w}" fill="url(#hatchRW2)"/>`; });
    // sconce in profile: backplate, arm, shade
    const y = K.lamp.y, p = K.lamp.proj;
    o += `<rect x="0" y="${ey(y + 60)}" width="18" height="120" fill="#fff"/>`;
    o += `<path fill="none" d="M 18 ${ey(y - 10)} C 90 ${ey(y - 70)} ${p - 20} ${ey(y - 50)} ${p} ${ey(y + 20)}"/>`;
    o += `<rect x="${p - 8}" y="${ey(y + 90)}" width="16" height="70" fill="#fff"/><path d="M ${p - 60} ${ey(y + 90)} L ${p + 60} ${ey(y + 90)} L ${p + 36} ${ey(y + 190)} L ${p - 36} ${ey(y + 190)} Z" fill="#fff"/>`;
    o += `<line x1="-${K.wall + 80}" y1="${ey(0)}" x2="${p + 250}" y2="${ey(0)}" stroke-width="${th * 5}"/><line x1="-${K.wall + 80}" y1="${ey(K.H)}" x2="${p + 250}" y2="${ey(K.H)}" stroke-width="${th * 3}"/>`;
    return o;
  }

  // ═════════════ SHEET — RIGHT WALL ═════════════
  window.DK.begin("rightwall");
  let s = frame();
  s += `<defs><pattern id="hatchRW" patternUnits="userSpaceOnUse" width="40" height="40" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="40" stroke="#999" stroke-width="4"/></pattern>` +
    `<pattern id="hatchRW2" patternUnits="userSpaceOnUse" width="12" height="12" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="12" stroke="#999" stroke-width="1.5"/></pattern>` +
    `<pattern id="hatchD2" patternUnits="userSpaceOnUse" width="6" height="6" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="6" stroke="#999" stroke-width="0.5"/></pattern><pattern id="hatchD5" patternUnits="userSpaceOnUse" width="15" height="15" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="15" stroke="#999" stroke-width="1.2"/></pattern>` +
    `<pattern id="hatchRW3" patternUnits="userSpaceOnUse" width="3" height="3" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="3" stroke="#999" stroke-width="0.25"/></pattern></defs>`;

  // Elevation 1:25
  const sc = 25, ox = 62, vE = view(ox, 32, sc, "Right wall elevation"), tE = vE.w(0.1);
  s += heading(18, 17, "ELEVATION — RIGHT WALL", `SCALE 1:${sc} · SEEN FROM THE ROOM · STUDY WALL ON THE LEFT · OPTION C`, 110);
  s += vE.g(elevation(tE), 0.28);
  const yb = vE.Y(ey(0));
  const xsA = [0, K.study.w, ...bays.flatMap(([a, b]) => [a, b]), aL, K.run];
  s += chainH(xsA.map(vE.X), yb + 5, xsA.slice(1).map((x, i) => Math.round(x - xsA[i])), { from: yb + 1, size: 1.2 });
  const xsB = [K.run + D.w, aR, narrow[0], narrow[1], L];
  s += chainH(xsB.map(vE.X), yb + 5, xsB.slice(1).map((x, i) => Math.round(x - xsB[i])), { from: yb + 1, size: 1.2 });
  s += chainH([0, K.study.w, K.run, K.run + D.w, L].map(vE.X), yb + 11, [K.study.w, `${K.run - K.study.w} PANELLED`, `${D.w} DOOR`, `${K.ret} (2 FT)`], { from: yb + 1, size: 1.4 });
  s += chainH([vE.X(0), vE.X(L)], yb + 17, [`${L} OVERALL · STUDY WALL TO DOOR ${K.run} (ABOUT 14 FT 6 IN) — CONFIRM ON SITE`], { from: yb + 1, size: 1.5 });
  const ysV = [0, K.skirt.h, K.short.y0, K.short.y1, K.dado.y, yDado, K.tall.y0, yTall, yCrown, K.H];
  s += chainV(ysV.map((y) => vE.Y(ey(y))), vE.X(L) + 6, ysV.slice(1).map((y, i) => y - ysV[i]), { from: vE.X(L) + 1, size: 1.2 });
  s += chainV([vE.Y(ey(K.H)), vE.Y(ey(0))], vE.X(L) + 13, [`${K.H} (9 FT)`], { from: vE.X(L) + 1, size: 1.4 });
  const lx = (bays[0][0] + bays[0][1]) / 2;
  s += chainV([vE.Y(ey(D.h)), vE.Y(ey(0))], vE.X(K.run) + 4, [`${D.h}`], { from: vE.X(K.run) + 1, size: 1.2 });
  s += text(vE.X(K.run + D.w / 2), vE.Y(ey(1225)), "BATHROOM", { size: 1.5, anchor: "middle", fill: THIN, ls: 0.3 });
  // labels on the left margin, one line each
  const lab = (x, y, ly, t1, t2) => note(vE.X(x), vE.Y(ey(y)), 57, vE.Y(ey(ly)), t1, t2 || "", "end");
  s += lab(300, K.H - 40, K.H + 40, "CROWN", "LED IN THE LIP");
  s += lab(250, yCrown - 25, yCrown - 250, "LINE OF LIGHT", "WASHES DOWN");
  s += lab(bays[0][0] + 18, 1900, 1900, "TALL PANEL ×6", "WALL COLOUR");
  s += lab(lx - K.lamp.span - 60, K.lamp.y + 140, K.lamp.y + 200, "WALL LAMP ×3", "PANELS 1, 3, 5");
  s += lab(K.study.w + 60, yDado - 10, yDado + 150, "DADO RAIL", "ON THE 610 LINE");
  s += lab(K.study.w - 60, K.study.h - 20, 470, "STUDY COUNTER", "END OF CUPBOARDS");
  s += lab(bays[0][0] + 18, 280, 250, "SHORT PANEL ×6", "");
  s += lab(K.study.w + 60, 60, 20, "SKIRTING", "");

  // Plan 1:25
  const vP = view(ox, 205, sc, "Right wall plan"), tP = vP.w(0.1);
  s += heading(18, 170, "PLAN", `CUT AT 1000 · SCALE 1:${sc} · ROOM BELOW, WALL ABOVE`, 60);
  s += vP.g(plan(tP, `${vP.w(1)} ${vP.w(0.7)}`), 0.28);
  s += note(vP.X(K.run + D.w / 2), vP.Y(-K.wall - D.w * 0.5), vP.X(aL) - 30, vP.Y(-K.wall - D.w * 0.5), "BATHROOM DOOR 2′6″ × 8′", "SWING TO CONFIRM", "end");
  s += note(vP.X(K.study.w / 2), vP.Y(400), 57, vP.Y(400), "STUDY CUPBOARDS", "", "end");
  s += note(vP.X(bays[2][0] + pw / 2 - K.lamp.span), vP.Y(K.lamp.proj - 60), vP.X(bays[2][0] + pw / 2) + 3, vP.Y(560), "LAMP ABOVE, 230 OFF THE WALL", "");

  // Section A–A 1:20
  const scS = 20, vS = view(352, 30, scS, "Right wall section"), tS = vS.w(0.1);
  s += heading(318, 17, "SECTION A–A", `THROUGH PANEL 1 · 1:${scS}`, 50);
  s += vS.g(section(tS), 0.28);
  const nx = vS.X(K.lamp.proj + 250) + 2;
  s += note(vS.X(K.crown.proj - 10), vS.Y(ey(yCrown + 100)), nx, vS.Y(ey(K.H - 30)), "CROWN + LED", "DET. 3");
  s += note(vS.X(M.proj), vS.Y(ey(yTall - 30)), nx, vS.Y(ey(yTall - 180)), "PANEL MOULDING", "DET. 1");
  s += note(vS.X(K.lamp.proj + 30), vS.Y(ey(K.lamp.y + 140)), nx, vS.Y(ey(K.lamp.y + 280)), "WALL LAMP", "DET. 4");
  s += note(vS.X(K.dado.proj), vS.Y(ey(K.dado.y + 22)), nx, vS.Y(ey(K.dado.y + 150)), "DADO RAIL", "DET. 2");
  s += chainV([vS.Y(ey(K.lamp.y)), vS.Y(ey(0))], vS.X(-K.wall) - 4, [`${K.lamp.y} TO LAMP CENTRE`], { from: vS.X(-K.wall) - 1, size: 1.2 });
  s += note(vS.X(K.skirt.t), vS.Y(ey(60)), nx, vS.Y(ey(120)), "SKIRTING", `${K.skirt.h} × ${K.skirt.t}`);

  // Notes
  s += heading(318, 180, "NOTES", `REVISION ${K.rev.split(" ")[0]}`, 40);
  ["Option C: 5 equal panels, lamps in 1, 3 and 5.", "One narrow panel on the 2 ft wall past the door.", "Moulding, rail and skirting painted the wall colour.",
   "Dado rail on the 610 line — level with the study", "   counter top, so the line runs on round the room.", "Short and tall panels share the same centres.",
   "Lengths are estimates — set out from site measure,", "   keeping the stiles 150 and the panels equal."]
    .forEach((n, i) => { s += text(318, 191 + i * 4.3, n, { size: 1.55 }); });

  // Details along the bottom
  s += heading(18, 238, "1 · PANEL MOULDING", "SECTION · 1:1", 40);
  {
    const v = view(22, 268, 1, "Panel moulding section");
    s += v.g(`<path d="${mouldPath(0, 0)}" fill="url(#hatchD2)"/><line x1="-6" y1="0" x2="62" y2="0" stroke-width="0.6"/>`, 0.25);
    s += chainH([v.X(0), v.X(M.w)], 276, [M.w], { from: 269, size: 1.3 });
    s += chainV([v.Y(-M.proj), v.Y(0)], v.X(M.w) + 5, [M.proj], { from: v.X(M.w) + 1, size: 1.3 });
    s += text(22, 283, "WALL FACE BELOW · MITRED CORNERS", { size: 1.3, fill: THIN });
  }
  s += heading(88, 238, "2 · DADO RAIL", "SECTION · 1:2", 32);
  {
    const s2 = 2, v = view(98, 252 - ey(yDado) / s2, s2, "Dado rail section");
    s += v.g(`<rect x="-24" y="${ey(yDado + 15)}" width="24" height="${K.dado.h + 30}" fill="url(#hatchD2)" stroke="none"/><path d="${dadoPath()}" fill="url(#hatchD2)"/><line x1="0" y1="${ey(yDado + 15)}" x2="0" y2="${ey(K.dado.y - 15)}"/>`, 0.25);
    s += chainV([v.Y(ey(yDado)), v.Y(ey(K.dado.y))], v.X(K.dado.proj) + 5, [K.dado.h], { from: v.X(K.dado.proj) + 1, size: 1.3 });
    s += chainH([v.X(0), v.X(K.dado.proj)], v.Y(ey(yDado)) - 4, [K.dado.proj], { from: v.Y(ey(yDado)) - 1, size: 1.3 });
    s += text(88, 283, "UNDERSIDE ON THE 610 LINE", { size: 1.3, fill: THIN });
  }
  s += heading(145, 238, "3 · CROWN + LED", "SECTION · 1:5", 36);
  {
    const s3 = 5, v = view(160, 250 - ey(K.H) / s3, s3, "Crown and LED section");
    s += v.g(`<rect x="-50" y="${ey(K.H) - 20}" width="50" height="${K.crown.h + 45}" fill="url(#hatchD5)" stroke="none"/><path d="${crownPath()}" fill="url(#hatchD5)"/>${ledStrip(v.w(0.12))}<line x1="0" y1="${ey(yCrown - 25)}" x2="0" y2="${ey(K.H)}"/><line x1="-50" y1="${ey(K.H)}" x2="${K.crown.proj + 30}" y2="${ey(K.H)}" stroke-width="${v.w(0.5)}"/><path d="M 30 ${ey(yCrown)} L 22 ${ey(yCrown - 40)} M 30 ${ey(yCrown)} L 48 ${ey(yCrown - 36)}" stroke-dasharray="10 8" stroke-width="${v.w(0.12)}"/>`, 0.25);
    s += chainV([v.Y(ey(K.H)), v.Y(ey(yCrown))], v.X(K.crown.proj) + 5, [K.crown.h], { from: v.X(K.crown.proj) + 1, size: 1.3 });
    s += chainH([v.X(0), v.X(K.crown.proj)], v.Y(ey(K.H)) - 3, [K.crown.proj], { from: v.Y(ey(K.H)) - 1, size: 1.3 });
    s += note(v.X(30), v.Y(ey(yCrown + 14)), v.X(K.crown.proj) + 10, v.Y(ey(yCrown + 10)), "LED STRIP IN LIP", "ON THE COVE DIMMER");
  }
  s += heading(222, 238, "4 · WALL LAMP", "ELEVATION · 1:10 · ×3", 40);
  {
    const s4 = 10, v = view(248 - (lx - K.lamp.span - 60 - lx) / s4 - 6, 250 - ey(K.lamp.y + 200) / s4, s4, "Wall lamp elevation");
    const cx = 0;
    s += v.g(sconce(cx, v.w(0.12)), 0.25);
    s += chainH([v.X(-K.lamp.span - 60), v.X(K.lamp.span + 60)], v.Y(ey(K.lamp.y - 90)) + 3, [2 * (K.lamp.span + 60)], { from: v.Y(ey(K.lamp.y - 60)), size: 1.3 });
    s += text(v.X(0), 283, "BRASS, FABRIC SHADES · CENTRED IN PANEL", { size: 1.3, fill: THIN, anchor: "middle" });
  }

  s += titleBlock({ title: "RIGHT WALL — PANEL MOULDING", sub: "Elevation · Plan · Section · Details", date: K.date, rev: K.rev, dwg: "AST-DR-007" });

  window.DRAWINGS.rightwall = { title: "Right wall — Panel moulding · AST-DR-007", svg: sheet(s), params: RWALL };
})();
