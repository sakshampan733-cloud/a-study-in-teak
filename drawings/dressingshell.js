// Dressing room — shell plan, AST-DR-023. First pass from the owner's own sketch and voice notes
// (25.09.2026), not yet a site measurement — see the notes for what is confirmed and what is assumed.
// Real-world units are mm. x runs across the room as you face in from the bedroom; y runs away from
// that wall, into the room.

window.DRAWINGS = window.DRAWINGS || {};

const DRESS = {
  rev: "1 — first layout from the owner's sketch",
  date: "25.09.2026",
  w: 2819,          // 9 ft 3 in — the wall shared with the bedroom. CONFIRMED (owner: "the nine foot three
                     // inch wall is the common wall between my bedroom and room")
  d: 3048,          // 10 ft 0 in — depth. ASSUMED, a clean placeholder. The sketch also carries about 9 ft 8 in
                     // and 12 ft 4 in on the two side walls — TO CONFIRM which is which before this is final.
  t: 115,           // wall thickness — ASSUMED (no wall build-up given yet)
  bath: { w: 762 }, // D3, the bathroom door — 2 ft 6 in. CONFIRMED (corrected from an earlier 2 ft 3 in read).
                     // Matches the door schedule (AST-DR-015/016): D2 is the existing door IN from the bedroom
                     // (see AST-DR-000, on the main room's right wall); D3 is this one, dressing → bathroom.
  wd: { w: 914, d: 711 },  // each wardrobe door/bay — 3 ft wide, 2 ft 4 in deep. CONFIRMED
  tun: { w: 1067, l: 2337 },  // the tunnel beyond the hidden door — 3 ft 6 in wide, 7 ft 8 in long. CONFIRMED
                     // size; ASSUMED to run straight on from the right wall — its real direction and what it
                     // leads to are both still open.
  hSide: 2769,       // 9 ft 1 in — plain ceiling over the left and right walls, same as the main room. CONFIRMED
  hDome: 3048,       // 10 ft 0 in — the domed / barrel-vaulted centre of the room, floor to the dome. CONFIRMED
  hWd: 2743,         // 9 ft 0 in — the wardrobes' own height cap, clear of the dome, under the plain 9'1" sides. CONFIRMED
};

(function () {
  const { INK, THIN, f, text, mmToFt, view, chainH, chainV, labels, heading, frame, titleBlock, sheet } = window.DK;
  const K = DRESS, T = K.t;
  const ft = (mm) => mmToFt(mm).replace("'-", " ft ").replace('"', " in").replace(/^0 ft /, "");

  const W = K.w, D = K.d;
  // the tunnel's bay is the last wardrobe module on the right wall, hard into the back corner
  const tunY1 = D, tunY0 = tunY1 - K.wd.w;

  const R = (x0, y0, x1, y1, a = "") => `<rect x="${f(x0)}" y="${f(y0)}" width="${f(x1 - x0)}" height="${f(y1 - y0)}" ${a}/>`;
  const Wd = (th) => `stroke-width="${th}"`;

  function plan(th) {
    let o = "";
    const outer = `M ${-T} ${-T} L ${W + T} ${-T} L ${W + T} ${D + T} L ${-T} ${D + T} Z`;
    const inner = `M 0 0 L ${W} 0 L ${W} ${D} L 0 ${D} Z`;
    o += `<path d="${outer} ${inner}" fill="url(#hatchDR)" fill-rule="evenodd" stroke="none"/>`;
    o += `<path d="${outer}" fill="none" ${Wd(th)}/><path d="${inner}" fill="none" ${Wd(th * 1.6)}/>`;

    // the bathroom door — front-left corner, opening in, hinged away from the corner
    o += R(0, -T, K.bath.w, 0, `fill="#fff" stroke="none"`);
    o += `<g ${Wd(th)}><line x1="0" y1="${f(-T)}" x2="0" y2="0"/><line x1="${f(K.bath.w)}" y1="${f(-T)}" x2="${f(K.bath.w)}" y2="0"/>
      <line x1="${f(K.bath.w)}" y1="0" x2="${f(K.bath.w)}" y2="${f(K.bath.w)}" stroke-width="${th * 2.4}"/>
      <path d="M ${f(K.bath.w)} ${f(K.bath.w)} A ${K.bath.w} ${K.bath.w} 0 0 1 0 0" fill="none" stroke-dasharray="${th * 8} ${th * 6}"/></g>`;

    // the two wardrobe runs — hatched strips the depth of the room, full 2 ft 4 in deep
    o += R(0, 0, K.wd.d, D, `fill="url(#hatchDR2)" stroke="none"`);
    o += `<path d="M ${f(K.wd.d)} 0 L ${f(K.wd.d)} ${f(D)}" fill="none" ${Wd(th * 0.7)} stroke-dasharray="${th * 6} ${th * 5}"/>`;
    o += R(W - K.wd.d, 0, W, D, `fill="url(#hatchDR2)" stroke="none"`);
    o += `<path d="M ${f(W - K.wd.d)} 0 L ${f(W - K.wd.d)} ${f(D)}" fill="none" ${Wd(th * 0.7)} stroke-dasharray="${th * 6} ${th * 5}"/>`;
    // the module lines along each run, 3 ft apart, so it reads as a row of doors
    for (let y = K.wd.w; y < D; y += K.wd.w) {
      o += `<line x1="0" y1="${f(y)}" x2="${f(K.wd.d)}" y2="${f(y)}" ${Wd(th * 0.5)}/>`;
      o += `<line x1="${f(W - K.wd.d)}" y1="${f(y)}" x2="${f(W)}" y2="${f(y)}" ${Wd(th * 0.5)}/>`;
    }

    // the hidden door — same footprint as the wardrobe bay it sits in, marked apart
    o += R(W - K.wd.d, tunY0, W, tunY1, `fill="#fff8ee" stroke="none"`);
    o += `<g ${Wd(th)} stroke-dasharray="${th * 3} ${th * 2.4}"><path d="M ${f(W - K.wd.d)} ${f(tunY0)} L ${f(W)} ${f(tunY0)}"/></g>`;
    // the tunnel beyond the back wall — indicative only, drawn lighter and hatched the other way
    const tx1 = W, tx0 = tx1 - K.tun.w, ty0 = D + T, ty1 = ty0 + K.tun.l;
    o += R(tx0, ty0, tx1, ty1, `fill="url(#hatchDR3)" stroke="${THIN}" stroke-dasharray="${th * 4} ${th * 3}" ${Wd(th * 0.8)}`);

    return o;
  }

  window.DK.begin("dressingshell");
  let s = frame();
  s += `<defs>
    <pattern id="hatchDR" patternUnits="userSpaceOnUse" width="90" height="90" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="90" stroke="#9a9a9a" stroke-width="10"/></pattern>
    <pattern id="hatchDR2" patternUnits="userSpaceOnUse" width="70" height="70" patternTransform="rotate(-45)"><line x1="0" y1="0" x2="0" y2="70" stroke="#c7b9a3" stroke-width="18"/></pattern>
    <pattern id="hatchDR3" patternUnits="userSpaceOnUse" width="70" height="70" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="70" stroke="#cfcfcf" stroke-width="10"/></pattern>
  </defs>`;

  const sc = 30, ox = 66, oy = 52;
  const v = view(ox, oy, sc, "Dressing room plan"), th = v.w(0.12);
  s += heading(18, 18, "DRESSING ROOM — SHELL AND LAYOUT", `PLAN · SCALE 1:${sc} · FIRST PASS FROM THE OWNER'S SKETCH — SHAPE NOT YET SITE-CONFIRMED`, 170);
  s += v.g(plan(th), 0.3);

  // dimensions
  const yTop = v.Y(-T) - 7, yBot = v.Y(D + T + K.tun.l) + 8;
  s += chainH([v.X(0), v.X(K.bath.w)], yTop, [`${K.bath.w} — BATHROOM DOOR (D3)`], { from: v.Y(-T), size: 1.4 });
  s += chainH([v.X(0), v.X(W)], yTop - 7, [`${W} — SHARED WALL WITH BEDROOM (9 FT 3 IN)`], { from: yTop - 11, size: 1.6 });
  s += chainV([v.Y(0), v.Y(K.wd.w)], v.X(0) - 8, [`${K.wd.w} MODULE`], { from: v.X(0) - 1, size: 1.3 });
  s += chainV([v.Y(0), v.Y(D)], v.X(-T) - 15, [`${D} — DEPTH (ASSUMED)`], { from: v.X(-T) - 1, size: 1.6 });
  const tx0 = W - K.tun.w, tx1 = W, ty1 = D + T + K.tun.l;
  s += chainH([v.X(tx0), v.X(tx1)], v.Y(ty1) + 6, [`${K.tun.w} TUNNEL WIDE`], { from: v.Y(ty1), size: 1.4 });
  s += chainV([v.Y(D + T), v.Y(ty1)], v.X(W) + 8, [`${K.tun.l} TUNNEL LONG`], { from: v.X(W) + 1, size: 1.4 });

  const RG = labels(230, "right", 40, 175), LG = labels(50, "left", 40, 175);
  LG.add(v.X(K.wd.d / 2), v.Y(K.wd.w * 1.5), "WARDROBE — LEFT WALL", "3 FT MODULES × 2 FT 4 IN DEEP · UP TO 9 FT 0 IN TALL");
  RG.add(v.X(W - K.wd.d / 2), v.Y(K.wd.w * 1.5), "WARDROBE — RIGHT WALL", "SAME AS THE LEFT · ENDS AT THE HIDDEN DOOR");
  RG.add(v.X(W - K.wd.d / 2), v.Y((tunY0 + tunY1) / 2), "HIDDEN DOOR", "LOOKS LIKE A CUPBOARD · SHELVED · PUSH TO OPEN ONTO THE TUNNEL");
  RG.add(v.X(W), v.Y(D + T + K.tun.l / 2), "THE TUNNEL", "3 FT 6 IN × 7 FT 8 IN · WHERE IT LEADS IS OPEN");
  LG.add(v.X(K.bath.w / 2), v.Y(-T / 2), "BATHROOM DOOR", "2 FT 6 IN · D3 · CORRECTED FROM 2 FT 3 IN");
  LG.add(v.X(W / 2), v.Y(D), "DRESSING MIRROR", "CENTRED ON THIS WALL · WIDTH / HEIGHT OPEN");
  s += RG.draw() + LG.draw();

  s += heading(18, 226, "NOTES", `REVISION ${K.rev.split(" ")[0]}`, 170);
  [["First pass, drawn from a hand sketch and a voice description — nothing here has been measured",
    "on site. The order and relationship of every element is as the owner described it; only the",
    "overall envelope is a guess.",
    "The wall shared with the bedroom is 9 ft 3 in — CONFIRMED. An existing door (D2, 2 ft 6 in, opens",
    "   in) already connects through this wall from the bedroom side — see AST-DR-000. Its position",
    "   along THIS wall is not yet known and is not drawn here.",
    "Both wardrobe runs are full-height blackened steel with lit white glass, per the Wardrobes brief",
    "   — see the Dressing tab. Door count per run is still open.",
    "Ceiling 9 ft 1 in, plain, over the left and right walls — the same height as the main room.",
    "   CONFIRMED. A domed / barrel-vaulted centre rises to 10 ft 0 in. Because the sides are plain,",
    "   the wardrobes sit clear of the dome and are capped at 9 ft 0 in, a hand's width under it."],
   [`OPEN — depth drawn at ${ft(D)}. The sketch also carries about 9 ft 8 in and 12 ft 4 in on the`,
    "   two side walls. Confirm which figure belongs to which wall — the room may not be square,",
    "   the same way the main room widens from the study wall to the bed wall.",
    "OPEN — the hidden tunnel door is drawn as the last wardrobe module on the right wall, flush",
    "   with the others so it reads as one more cupboard. Confirm this is the intended wall and end.",
    "OPEN — the tunnel is drawn running straight on from the right wall, 3 ft 6 in × 7 ft 8 in.",
    "   Its real direction, what is at the far end, and how it is built are all still open.",
    "OPEN — the dome's own shape is not yet known: how far along the room it runs, and its profile.",
    "   The 3D model shows it schematically, as a flat 9 ft 1 in ceiling — not yet the true curve.",
    "OPEN — wall thickness (115), the bathroom door's hinge side, and the dressing mirror's own",
    "   size are all assumed or blank. See the Dressing tab for the mirror."]]
    .forEach((col, c) => col.forEach((n, i) => (s += text(18 + c * 172, 238 + i * 4.6, n, { size: 1.6, fill: n.startsWith("OPEN") ? "#b3261e" : INK }))));

  s += titleBlock({ title: "DRESSING ROOM", sub: "Shell and layout · first pass", date: K.date, rev: K.rev, dwg: "AST-DR-023", scale: `1:${sc} @ A3` });
  window.DRESS = DRESS;
  window.DRAWINGS.dressingshell = { title: "Dressing room — shell and layout · AST-DR-023", svg: sheet(s), model: true };
})();
