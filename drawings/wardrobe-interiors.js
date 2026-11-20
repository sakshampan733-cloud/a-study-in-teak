// The wardrobe interiors — two sheets, both runs with their doors off, seen standing in the room:
//   AST-DR-048 (key "wardrobe-interiors")        the LEFT wall, L1 · L2 · L3 (L1 by the bathroom door, L3 by the mirror),
//                                                 with detail 1, the lit back
//   AST-DR-050 (key "wardrobe-interiors-right")  the RIGHT wall, R4 · R3 · R2 · R1 (R4 the tunnel bay by the mirror)
// Rev 2, 21 Nov 2026: drawn from the owner's own layout in the wardrobe planner (tools/wardrobe-planner.html), tidied
// to standard sizes (owner: "if I am messing up some measurements … fix them"): every shelf space in a bay equal, rails
// down to 6 ft 6¾ in, a fixed board over every drawer stack, the loft shelf at 7 ft 2 in — and the tunnel 7 ft 0 in high
// (owner, 21 Nov), so R4's loft starts lower and is taller than the rest.
// The plan below is the one source: these sheets, the planner's "Start from the drawn plan", and the Blender model
// (tools/walk/furnish.py, the tunnel door's shelves) all read it. Real units mm, z up from the floor.

window.DRAWINGS = window.DRAWINGS || {};

// PLAN-START
const WARDROBE_PLAN = {
  "v": 1, "rev": "2 — 21 Nov 2026", "setOut": "drawings", "mouth": 2134,
  "widths": { "L": 948.33, "R": 939.75 },
  "bays": {
    "L1": { "label": "Linen", "note": "Blankets, bed sheets, cushions and cushion covers.", "lit": true, "edgeLed": false, "sensor": false, "fits": [
      { "id": "L1d1", "type": "drawer", "z": 100, "h": 400, "label": "bed sheets", "opts": {} },
      { "id": "L1d2", "type": "drawer", "z": 500, "h": 400, "label": "cushion covers", "opts": {} },
      { "id": "L1s1", "type": "shelf", "z": 900, "h": 22, "label": "blankets", "opts": {} },
      { "id": "L1s2", "type": "shelf", "z": 1328, "h": 22, "label": "blankets", "opts": {} },
      { "id": "L1s3", "type": "shelf", "z": 1756, "h": 22, "label": "cushions", "opts": {} },
      { "id": "L1lo", "type": "loft", "z": 2183, "h": 22, "label": "spare bedding", "opts": {} } ] },
    "L2": { "label": "Suits & long clothes", "note": "", "lit": true, "edgeLed": false, "sensor": false, "fits": [
      { "id": "L2d1", "type": "drawer", "z": 100, "h": 400, "label": "", "opts": {} },
      { "id": "L2s1", "type": "shelf", "z": 500, "h": 22, "label": "top of the drawer", "opts": {} },
      { "id": "L2h1", "type": "longHang", "z": 522, "h": 1538, "label": "suits, coats, kurtas", "opts": { "led": false } },
      { "id": "L2lo", "type": "loft", "z": 2183, "h": 22, "label": "", "opts": {} } ] },
    "L3": { "label": "Perfume display", "note": "", "lit": false, "edgeLed": true, "sensor": false, "fits": [
      { "id": "L3b1", "type": "boots", "z": 100, "h": 420, "label": "boots", "opts": {} },
      { "id": "L3d1", "type": "drawer", "z": 520, "h": 200, "label": "", "opts": {} },
      { "id": "L3d2", "type": "drawer", "z": 720, "h": 400, "label": "", "opts": {} },
      { "id": "L3d3", "type": "drawer", "z": 1120, "h": 120, "label": "", "opts": {} },
      { "id": "L3p1", "type": "display", "z": 1240, "h": 640, "label": "perfumes", "opts": { "lit": true, "risers": 0, "glass": false } },
      { "id": "L3s1", "type": "shelf", "z": 1880, "h": 22, "label": "top of the display", "opts": {} },
      { "id": "L3lo", "type": "loft", "z": 2183, "h": 22, "label": "", "opts": {} } ] },
    "R1": { "label": "Shoes", "note": "", "lit": true, "edgeLed": false, "sensor": false, "fits": [
      { "id": "R1r1", "type": "shoeRack", "z": 100, "h": 2083, "label": "shoes", "opts": {} },
      { "id": "R1lo", "type": "loft", "z": 2183, "h": 22, "label": "", "opts": {} } ] },
    "R2": { "label": "Daily wear", "note": "", "lit": true, "edgeLed": false, "sensor": false, "fits": [
      { "id": "R2d1", "type": "drawer", "z": 100, "h": 350, "label": "", "opts": {} },
      { "id": "R2d2", "type": "drawer", "z": 450, "h": 350, "label": "", "opts": {} },
      { "id": "R2d3", "type": "drawer", "z": 800, "h": 200, "label": "", "opts": {} },
      { "id": "R2s1", "type": "shelf", "z": 1000, "h": 22, "label": "top of the drawers", "opts": {} },
      { "id": "R2h1", "type": "shortHang", "z": 1022, "h": 1038, "label": "shirts, T-shirts", "opts": { "led": false } },
      { "id": "R2lo", "type": "loft", "z": 2183, "h": 22, "label": "", "opts": {} } ] },
    "R3": { "label": "Daily wear", "note": "", "lit": true, "edgeLed": false, "sensor": false, "fits": [
      { "id": "R3t1", "type": "trouser", "z": 100, "h": 700, "label": "trousers", "opts": { "glassTray": false } },
      { "id": "R3d1", "type": "drawer", "z": 800, "h": 200, "label": "", "opts": {} },
      { "id": "R3s1", "type": "shelf", "z": 1000, "h": 22, "label": "top of the drawer", "opts": {} },
      { "id": "R3h1", "type": "shortHang", "z": 1022, "h": 1038, "label": "shirts, T-shirts", "opts": { "led": false } },
      { "id": "R3lo", "type": "loft", "z": 2183, "h": 22, "label": "", "opts": {} } ] },
    "R4": { "label": "Tunnel door", "note": "", "lit": false, "edgeLed": false, "sensor": false, "fits": [
      { "id": "R4s1", "type": "shelf", "z": 337.3, "h": 22, "label": "", "opts": {} },
      { "id": "R4s2", "type": "shelf", "z": 696.7, "h": 22, "label": "", "opts": {} },
      { "id": "R4s3", "type": "shelf", "z": 1056, "h": 22, "label": "", "opts": {} },
      { "id": "R4s4", "type": "shelf", "z": 1415.3, "h": 22, "label": "", "opts": {} },
      { "id": "R4s5", "type": "shelf", "z": 1774.7, "h": 22, "label": "", "opts": {} },
      { "id": "R4lo", "type": "loft", "z": 2134, "h": 22, "label": "", "opts": {} } ] }
  }
};
// PLAN-END
window.WARDROBE_PLAN = WARDROBE_PLAN;

(function () {
  const { INK, THIN, f, text, view, chainH, chainV, labels, heading, frame, titleBlock, sheet, mmToFt } = window.DK;
  const P = window.WARDROBE_PLAN;
  const H = 2743, CEIL = 2769, S = 18, BD = 22, PL = 100, TOPI = H - S, HOOK = 60, SC = 20;
  const MOUTH = P.mouth, DOORTOP = MOUTH - 10, DOORW = 790, PACK = 100;   // tunnel head; the hidden door ⅜ in under it; AST-DR-026's parked pair
  const ft = (mm) => mmToFt(mm);
  const esc = (t) => String(t).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const mono = (svg) => svg.replace(/#8a3a22/g, INK);
  const WHERE = { L1: "LEFT WALL, BY THE BATHROOM DOOR", L2: "LEFT WALL, THE MIDDLE", L3: "LEFT WALL, BY THE MIRROR",
    R1: "RIGHT WALL, BY THE BEDROOM WALL", R2: "RIGHT WALL", R3: "RIGHT WALL", R4: "RIGHT WALL, BY THE MIRROR — THE TUNNEL BAY" };
  const NAME = { loft: "LOFT SHELF", shelf: "SHELF", display: "DISPLAY SHELF, LIT", longHang: "LONG HANGING", shortHang: "SHORT HANGING",
    trouser: "TROUSER PULL-OUT", shoeRack: "SLOPED SHOE SHELVES", boots: "BOOT SPACE", pullShelf: "PULL-OUT SHELF", jewel: "JEWELLERY DRAWER",
    ironing: "IRONING-BOARD DRAWER", laundry: "LAUNDRY PULL-OUT", shoeTilt: "TILTING SHOE TRAYS", watch: "WATCH DISPLAY", pullDown: "PULL-DOWN RAIL", carousel: "CAROUSEL" };
  const nameOf = (f_) => f_.type === "drawer" ? (f_.h <= 150 ? "SMALL DRAWER" : f_.h <= 250 ? "MEDIUM DRAWER" : f_.h <= 330 ? "LARGE DRAWER" : "DEEP DRAWER")
    : f_.type === "shelf" && /^top of/.test(f_.label) ? "FIXED BOARD" : NAME[f_.type] || f_.type.toUpperCase();

  function geo(id) {
    const run = id[0], W = P.widths[run], inner = W - 2 * S, tunnel = id === "R4";
    const pack = tunnel ? inner - DOORW : id === "L3" ? PACK : 0, packSide = tunnel ? "R" : id === "L3" ? "L" : null;
    const x0 = S + (packSide === "L" ? pack : 0), x1 = W - S - (packSide === "R" ? pack : 0), lit = P.bays[id].lit && !tunnel;
    return { id, W, inner, pack, packSide, x0, x1, usable: x1 - x0, tunnel, lit, floor: tunnel ? 0 : PL,
      depth: tunnel ? 260 : 686 - 22 - (lit ? 58 : 0) - 4 };
  }
  function rnd(seed) { let s = 0; for (const c of seed) s = (s * 31 + c.charCodeAt(0)) | 0; return () => { s = (s * 1103515245 + 12345) & 0x7fffffff; return s / 0x7fffffff; }; }

  // ── one bay, doors off, in real mm (y down from the ceiling line) ──
  function bay(id, g) {
    const B = P.bays[id], Y = (z) => CEIL - z, lw = (paper) => f(paper * SC), r = rnd(id);
    const R = (x0, z0, x1, z1, w, a = "") => `<rect x="${f(x0)}" y="${f(Y(z1))}" width="${f(x1 - x0)}" height="${f(z1 - z0)}" stroke-width="${lw(w)}" ${a}/>`;
    const L = (x1, z1, x2, z2, w, a = "") => `<line x1="${f(x1)}" y1="${f(Y(z1))}" x2="${f(x2)}" y2="${f(Y(z2))}" stroke-width="${lw(w)}" ${a}/>`;
    const PATH = (pts, w, a = "") => `<path d="M ${pts.map(([x, z]) => `${f(x)} ${f(Y(z))}`).join(" L ")}" stroke-width="${lw(w)}" ${a}/>`;
    const dash = (a, b) => `stroke-dasharray="${lw(a)} ${lw(b)}"`, thin = `stroke="${THIN}"`, white = `fill="#fff"`;
    let o = "";
    o += L(-160, CEIL, g.W + 160, CEIL, 0.18, dash(1.4, 0.9)) + L(-160, 0, g.W + 160, 0, 0.6);
    // folded doors parked along one side (AST-DR-026), and in R4 the fixed upright beside the hidden door
    if (g.pack) {
      const px = g.packSide === "L" ? S : g.W - S - g.pack, z0 = g.tunnel ? 0 : g.floor, z1 = g.tunnel ? MOUTH : TOPI;
      o += R(px, z0, px + g.pack, z1, 0.25);
      for (let z = z0 + 60; z < z1 + g.pack; z += 90) o += L(px, Math.max(z0, z - g.pack), px + Math.min(g.pack, z - z0), Math.min(z1, z), 0.1, thin);
    }
    if (g.tunnel) {   // the hidden door: its face is the back of this bay; the tunnel is behind it
      o += R(g.x0, 0, g.x1, DOORTOP, 0.45, white) + R(g.x0 + 45, 45, g.x1 - 45, DOORTOP - 45, 0.13, thin);
      o += L(S, MOUTH, g.W - S, MOUTH, 0.3, dash(1.6, 0.8));
      o += `<circle cx="${f(g.x1 - 40)}" cy="${f(Y(1050))}" r="14" stroke-width="${lw(0.18)}" ${thin}/>`;   // the touch latch
      if (g.pack) o += R(g.x1, MOUTH, g.x1 + g.pack, TOPI, 0.25);
    }
    // carcase: sides, top, plinth
    o += R(0, 0, S, H, 0.35, white) + R(g.W - S, 0, g.W, H, 0.35, white) + R(S, TOPI, g.W - S, H, 0.35, white);
    if (!g.tunnel) o += R(S, 0, g.W - S, PL, 0.35) + L(S + 30, 0, S + 30, PL - 30, 0.13, thin) + L(g.W - S - 30, 0, g.W - S - 30, PL - 30, 0.13, thin) + L(S + 30, PL - 30, g.W - S - 30, PL - 30, 0.13, thin);
    o += R(0, 0, g.W, H, 0.6);
    const fits = B.fits.slice().sort((a, b) => a.z - b.z);
    fits.forEach((ft_) => {
      const x0 = g.x0, x1 = g.x1, w = x1 - x0, z = ft_.z, h = ft_.h, top = z + h, cx = (x0 + x1) / 2;
      switch (ft_.type) {
        case "loft": {
          o += R(x0, z, x1, z + BD, 0.4, white);
          const lz = z + BD, lh = TOPI - lz;   // a few storage boxes, dashed: what the loft is for
          [[0.06, 0.4, 0.42], [0.5, 0.86, 0.3]].forEach(([a, b, k]) => (o += R(x0 + w * a, lz, x0 + w * b, lz + lh * k, 0.13, `${thin} ${dash(0.8, 0.5)}`)));
          break;
        }
        case "shelf":
          o += R(x0, z, x1, z + BD, 0.4, white);
          if (!/^top of/.test(ft_.label)) o += `<circle cx="${f(x0 + 22)}" cy="${f(Y(z - 12))}" r="5" stroke-width="${lw(0.13)}"/><circle cx="${f(x1 - 22)}" cy="${f(Y(z - 12))}" r="5" stroke-width="${lw(0.13)}"/>`;   // shelf pins
          break;
        case "drawer": {
          const pl = Math.min(220, w * 0.3);
          o += R(x0 + 3, z + 2, x1 - 3, top - 2, 0.4, white) + L(cx - pl / 2, z + h / 2, cx + pl / 2, z + h / 2, 0.75);
          o += R(x0 + 40, z + 30, x1 - 40, top - Math.min(60, h * 0.3), 0.1, `${thin} ${dash(0.6, 0.5)}`);   // the box behind the front
          break;
        }
        case "longHang": case "shortHang": {
          const rail = top - HOOK, drop = h - HOOK, n = Math.max(3, Math.floor((w - 70) / (ft_.type === "longHang" ? 64 : 58)));
          for (let k = 0; k < n; k++) {
            const gx = x0 + 35 + (k + 0.5) * ((w - 70) / n) + (r() - 0.5) * 10, gw = 26 + r() * 18;
            const len = drop * (ft_.type === "longHang" ? 0.6 + r() * 0.38 : 0.72 + r() * 0.24), zt = rail - 34;
            o += PATH([[gx, rail + 10], [gx, zt]], 0.12, thin);
            o += PATH([[gx - 5, zt], [gx + 5, zt], [gx + gw / 2, zt - 70], [gx + gw / 2 - 4, zt - len], [gx - gw / 2 + 4, zt - len], [gx - gw / 2, zt - 70], [gx - 5, zt]], 0.12, `${thin} fill="none"`);
          }
          o += L(x0 + 20, z, x1 - 20, z, 0.2, dash(1, 0.7));                                  // the hem line
          o += R(x0, rail - 13, x1, rail + 13, 0.4, white) + R(x0, rail - 32, x0 + 14, rail + 32, 0.3, white) + R(x1 - 14, rail - 32, x1, rail + 32, 0.3, white);
          break;
        }
        case "trouser": {
          const bar = top - 22;
          o += R(x0 + 4, bar - 11, x1 - 4, bar + 11, 0.4, white) + R(x0 + 4, z + 10, x0 + 30, bar - 11, 0.3, white);
          for (let k = 0; k < 6; k++) {
            const tx = x0 + 90 + k * ((w - 150) / 5), len = (bar - z) * (0.8 + r() * 0.14);
            o += R(tx - 16, bar - 11 - len, tx + 16, bar - 11, 0.12, thin);
          }
          break;
        }
        case "shoeRack": case "shoeTilt": {
          const n = Math.max(1, Math.round(h / (ft_.type === "shoeRack" ? 200 : 185))), p = h / n;
          for (let k = 0; k < n; k++) {
            const zb = z + k * p;
            o += R(x0, zb + 14, x1, zb + 36, 0.35, white) + L(x0 + 8, zb + 92, x1 - 8, zb + 92, 0.22);   // the shelf's front lip; the heel rail behind
            if (k % 3 !== 2) for (let j = 0; j < 4; j++) {
              const sx = x0 + 70 + j * ((w - 140) / 3), sh = 70 + r() * 30;
              o += `<rect x="${f(sx - 42)}" y="${f(Y(zb + 36 + sh))}" width="84" height="${f(sh)}" rx="30" stroke-width="${lw(0.12)}" ${thin}/>`;
            }
          }
          break;
        }
        case "display": {
          o += R(x0, z, x1, z + BD, 0.4, white);
          o += L(x0 + 12, top - 10, x1 - 12, top - 10, 0.45, dash(0.5, 0.35));               // LED strip under the board above
          let bx = x0 + 45;
          while (bx < x1 - 90) {
            const bw = 55 + r() * 40, bh = 110 + r() * 110;
            o += `<rect x="${f(bx)}" y="${f(Y(z + BD + bh))}" width="${f(bw)}" height="${f(bh)}" rx="14" stroke-width="${lw(0.13)}" ${thin}/>` + R(bx + bw / 2 - 12, z + BD + bh, bx + bw / 2 + 12, z + BD + bh + 22, 0.13, thin);
            bx += bw + 30 + r() * 30;
          }
          break;
        }
        case "boots":
          o += R(x0, z, x1, z + BD, 0.4, white);
          for (let k = 0; k < 3; k++) {
            const bx = x0 + 80 + k * ((w - 160) / 3), bh = Math.min(h - 80, 300 + r() * 60);
            o += PATH([[bx, z + BD], [bx, z + BD + bh], [bx + 70, z + BD + bh], [bx + 70, z + BD + 80], [bx + 150, z + BD + 60], [bx + 150, z + BD]], 0.13, thin);
          }
          break;
        default: o += R(x0 + 3, z + 2, x1 - 3, top - 2, 0.4, white);
      }
    });
    return o;
  }

  // ── a bay with its heading, dimensions, labels and notes, in a column of the sheet ──
  function column(id, colX, colW, top) {
    const g = geo(id), B = P.bays[id], oy = top + 12, bx = colX + 16;
    const v = view(bx, oy, SC, `Wardrobe ${id}`), PX = (x) => v.X(x), PY = (z) => v.Y(CEIL - z);
    let s = heading(colX, top, `${id} · ${esc(B.label.toUpperCase())}`, `${WHERE[id]} · DOORS OFF · 1:${SC}`, colW - 6);
    s += v.g(bay(id, g), 0.3);
    const fits = B.fits.slice().sort((a, b) => a.z - b.z);
    // the open spaces, with their clear heights
    const loft = fits.find((x) => x.type === "loft");
    let cur = g.floor;
    const gaps = [];
    fits.forEach((x) => { if (x.z > cur + 1) gaps.push([cur, x.z]); cur = Math.max(cur, x.z + x.h); });
    if (TOPI > cur + 1) gaps.push([cur, TOPI]);
    gaps.forEach(([a, b]) => {
      if (b - a < 110) return;
      const inLoft = loft && a >= loft.z;
      s += text(PX((g.x0 + g.x1) / 2), PY(inLoft ? a + (b - a) * 0.74 : (a + b) / 2) + 0.7, `${inLoft ? "LOFT · " : ""}${ft(b - a)} CLEAR`, { size: 1.8, anchor: "middle", fill: THIN, weight: 700 });
    });
    if (g.tunnel) {
      s += text(PX(g.x1 + g.pack / 2) + 0.55, PY(MOUTH / 2), "FIXED UPRIGHT + FOLDED DOORS", { size: 1.3, anchor: "middle", fill: THIN, rot: true });
    } else if (g.pack) s += text(PX(S + g.pack / 2) + 0.55, PY((g.floor + TOPI) / 2), "FOLDED DOORS PARK HERE", { size: 1.3, anchor: "middle", fill: THIN, rot: true });
    // heights: every piece, then floor to the loft shelf (or tunnel head) and the loft
    const edges = [0];
    if (g.floor) edges.push(g.floor);
    let c2 = g.floor;
    fits.forEach((x) => { if (x.z > c2 + 0.5) edges.push(x.z); edges.push(x.z + x.h); c2 = x.z + x.h; });
    if (TOPI > c2 + 0.5) edges.push(TOPI);
    edges.push(H);
    const uniq = [...new Set(edges.map((e) => Math.round(e * 10) / 10))].sort((a, b) => a - b);
    const segL = uniq.slice(1).map((e, i) => (e - uniq[i] >= 70 ? String(Math.round(e - uniq[i])) : ""));
    s += chainV(uniq.map((e) => PY(e)).reverse(), v.X(0) - 4.5, segL.slice().reverse(), { from: v.X(0) - 0.8, size: 1.7 });
    const lz = loft ? loft.z : TOPI;
    s += chainV([PY(H), PY(lz), PY(0)], v.X(0) - 12, [`${H - lz} LOFT`, g.tunnel ? `${lz} TO THE TUNNEL HEAD` : `${lz} TO THE LOFT SHELF`], { from: v.X(0) - 10, size: 1.75 });
    // widths
    const fy = PY(0);
    s += chainH([PX(0), PX(g.W)], fy + 5, [`${Math.round(g.W)} BAY`], { from: fy + 1, size: 1.75 });
    s += chainH([PX(g.x0), PX(g.x1)], fy + 11, [g.tunnel ? `${Math.round(g.usable)} DOOR SHELVES` : `${Math.round(g.usable)} ${g.pack ? "CLEAR" : "INSIDE"}`], { from: fy + 7, size: 1.75 });
    // labels, right of the bay
    const LB = labels(PX(g.W) + 7, "right", top + 6, fy - 1, { size: 2.05, size2: 1.7, size3: 1.55, bold: true, gap: 1.5, land: 5 });
    const above = (x) => { const nx = fits.find((y) => y.z >= x.z + x.h - 0.5 && y !== x); return (nx ? nx.z : TOPI) - (x.z + x.h); };
    fits.forEach((x) => {
      const ay = PY(x.z + x.h / 2), ax = PX(g.x1 - 6), pur = x.label ? esc(x.label.toUpperCase()) : "";
      let spec;
      switch (x.type) {
        case "loft": spec = `LOFT ${ft(TOPI - x.z - BD)} CLEAR ABOVE`; break;
        case "shelf": spec = `${ft(x.z)} UP · ${ft(above(x))} CLEAR ABOVE`; break;
        case "drawer": spec = `${ft(x.h)} FRONT · ${ft(x.z)} UP`; break;
        case "longHang": case "shortHang": spec = `RAIL ${ft(x.z + x.h - HOOK)} · ${ft(x.h - HOOK)} DROP`; break;
        case "trouser": spec = `${ft(x.h)} HIGH · ${ft(x.z)} UP`; break;
        case "shoeRack": { const n = Math.round(x.h / 200); spec = `${n} SHELVES, ${ft(x.h / n)} APART`; break; }
        case "display": spec = `${ft(x.h - BD)} CLEAR · LED STRIP`; break;
        case "boots": spec = `${ft(x.h - BD)} CLEAR`; break;
        default: spec = `${ft(x.h)} · ${ft(x.z)} UP`;
      }
      if (g.tunnel && x.type === "shelf") LB.add(ax, ay, "SHELF ON THE DOOR", `${ft(x.z)} UP · 10¼" DEEP`);
      else if (pur && !/^top of/.test(x.label)) LB.add(ax, ay, nameOf(x), pur, spec);
      else if (/^top of/.test(x.label)) LB.add(ax, ay, nameOf(x), pur, `${ft(x.z)} UP · FIXED`);
      else LB.add(ax, ay, nameOf(x), spec);
    });
    if (g.tunnel) LB.add(PX(g.x0 + 60), PY(260), "THE HIDDEN DOOR", "PUSH TO OPEN", `${ft(DOORTOP)} HIGH · TUNNEL BEHIND`);
    s += LB.draw();
    // under the bay
    const lines = [
      `INSIDE ${ft(g.usable)} WIDE × ${ft(g.depth)} DEEP${g.tunnel ? " (THE DOOR'S SHELVES)" : ""}`,
      g.tunnel ? "NOT LIT · THE BAY STAYS CLEAR TO WALK THROUGH" : [g.lit ? "LIT BACK" : "NO LIT BACK", B.edgeLed ? "DOOR-EDGE LED" : "", B.sensor ? "DOOR SWITCH" : ""].filter(Boolean).join(" · "),
      B.note ? esc(B.note.toUpperCase()) : "",
    ].filter(Boolean);
    lines.forEach((t, i) => (s += text(colX, fy + 16.8 + i * 3.4, t, { size: 1.65, fill: i ? THIN : INK, weight: i ? 400 : 700 })));
    return s;
  }

  // ── detail 1 — the lit back, in plan at a bay's back corner (unchanged from rev 1) ──
  const BACK = { backer: 9, led: 3, air: 40, opal: 3, groove: 8 };
  function litBack(th) {
    const B = BACK, y1 = B.backer, y2 = y1 + B.led, y3 = y2 + B.air, y4 = y3 + B.opal, g = B.groove, sh = `fill="url(#ply48)"`;
    let o = `<rect x="-40" y="-70" width="300" height="70" fill="url(#hatchWR)" stroke="none"/><line x1="-40" y1="0" x2="260" y2="0" stroke-width="${th * 1.6}"/>`;
    o += `<rect x="0" y="0" width="${S}" height="260" ${sh} stroke-width="${th * 1.3}"/>`;
    o += `<line x1="${S - 1}" y1="${y4 + 2}" x2="${S - 1}" y2="260" stroke-width="${th * 0.4}"/>`;
    o += `<rect x="${S}" y="0" width="242" height="${y1}" ${sh} stroke-width="${th}"/>`;
    [70, 170].forEach((x) => (o += `<rect x="${x - 6}" y="${y1}" width="12" height="${B.led}" fill="${INK}" stroke="none"/>` +
      `<path d="M ${x} ${y2} L ${x - 30} ${y3} M ${x} ${y2} L ${x + 30} ${y3} M ${x} ${y2} L ${x} ${y3}" fill="none" stroke-width="${th * 0.35}" stroke-dasharray="${th * 3} ${th * 2}"/>`));
    o += `<rect x="${S - g}" y="${y3 - 0.5}" width="${242 + g}" height="${B.opal + 1}" fill="#fff" stroke-width="${th * 0.9}"/>`;
    o += `<rect x="${S}" y="${y4 + 2}" width="242" height="${BD}" fill="#fff" stroke-width="${th}" stroke-dasharray="${th * 6} ${th * 3}"/>`;
    o += `<path d="M 260 -70 L 260 300" fill="none" stroke-width="${th * 0.5}" stroke-dasharray="${th * 8} ${th * 3} ${th * 2} ${th * 3}"/>`;
    return o;
  }
  const DEFS = `<defs><pattern id="hatchWR" patternUnits="userSpaceOnUse" width="20" height="20" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="20" stroke="#9a9a9a" stroke-width="2"/></pattern>
    <pattern id="ply48" patternUnits="userSpaceOnUse" width="4" height="4" patternTransform="rotate(-45)"><rect width="4" height="4" fill="#fff"/><line x1="0" y1="0" x2="0" y2="4" stroke="#8c8c8c" stroke-width="0.5"/></pattern></defs>`;
  let out = "";
  const notes = (x, y, cols, w) => cols.forEach((col, c) => col.forEach((n, i) => (out += text(x + c * w, y + i * 3.9, n, { size: 1.72, fill: n.startsWith("TO CONFIRM") ? "#b3261e" : INK }))));

  // ═══ AST-DR-048 — the left wall ═══
  window.DK.begin("wardrobe-interiors");
  out = frame() + DEFS;
  ["L1", "L2", "L3"].forEach((id, i) => (out += column(id, 12 + i * 96, 96, 18)));
  out += heading(306, 18, "1 · THE LIT BACK", "PLAN AT A BAY'S BACK CORNER · 1:5", 100);
  { const v = view(318, 44, 5, "Wardrobe lit back"), th = v.w(0.1), B = BACK, y4 = B.backer + B.led + B.air + B.opal;
    out += v.g(litBack(th), 0.3);
    out += chainV([v.Y(0), v.Y(B.backer), v.Y(B.backer + B.led + B.air), v.Y(y4)], v.X(-40) - 2.5, [B.backer, B.led + B.air, B.opal], { from: v.X(-40) - 0.5, size: 1.1 });
    const L1 = labels(v.X(260) + 7, "right", 30, 118, { size: 1.55, size2: 1.3 });
    L1.add(v.X(120), v.Y(-35), "THE WALL", "");
    L1.add(v.X(120), v.Y(B.backer / 2), "9 MM PLY BACKER", "PAINTED WHITE");
    L1.add(v.X(70), v.Y(B.backer + 1.5), "LED STRIP, 100 APART", "WARM WHITE, DIMMABLE");
    L1.add(v.X(120), v.Y(B.backer + B.led + 20), "40 MM AIR GAP", "SO THE GLOW IS EVEN");
    L1.add(v.X(220), v.Y(B.backer + B.led + B.air + 1.5), "3 MM OPAL ACRYLIC", "NOT GLASS · LIFTS OUT");
    L1.add(v.X(S / 2), v.Y(150), "SIDE PANEL, 18 PLY", "VENEER BOTH FACES");
    L1.add(v.X(150), v.Y(y4 + 13), "SHELF, 22", "STOPS AT THE ACRYLIC");
    out += L1.draw(); }
  out += heading(306, 136, "INSIDE", "FINISH, HARDWARE, LIGHT", 100);
  ["Laminate close to the doors' veneer on every face",
   "inside (sample still to come) — drawn as the veneer.",
   "Drawers: soft-close, full-extension runners;",
   "fronts with ⅛\" gaps all round.",
   "Shelves: ⅞\" board on pins, moving on a 1¼\" line;",
   "the boards over drawers and displays are fixed.",
   "Rails: 1\" brass rod, centred in the depth, on end",
   "sockets; 2⅜\" clear above for the hooks.",
   "Lit backs: opal acrylic, detail 1 — one dimmer",
   "for both runs. L3 has none: its display has its",
   "own LED strip, and the door edge is lit."]
    .forEach((n, i) => (out += text(306, 146 + i * 3.9, n, { size: 1.72 })));
  out += heading(18, 205, "NOTES", "LEFT WALL · REVISION 2", 278);
  notes(18, 215, [
    ["Drawn from the owner's own layout in the wardrobe planner (21 Nov), tidied to",
     "standard sizes. The arrangement is the owner's; only the measurements moved:",
     "   every shelf space in a bay is equal — L1's three are 1'-4\" each over its drawers;",
     "   rails come down to 6'-6¾\", in reach without a step (they were at 6'-11½\");",
     "   a fixed board sits on every drawer stack, so the drawers run true and hems clear;",
     "   the loft shelf is at 7'-2\" in every bay here (L1's had slipped to 7'-0½\").",
     "Each bay is 3'-1¼\" wide, 9'-0\" high and 2'-3\" deep; inside, 3'-0\" × 1'-11¾\"",
     "   with the lit back. The loft above is one open space, reached from a step stool."],
    ["L3 is the end bay by the mirror. Its fold-slide doors (AST-DR-026) park along",
     "   the side by L2, so its fittings stop 4\" short of that side.",
     "Heights are from the finished floor. The plinth is 4\"; the inside floor is on it.",
     "Rails, drawers and boards are the same on the right wall: AST-DR-050.",
     "TO CONFIRM — the cupboard names, read from the owner's brief: linen, suits and",
     "   long clothes, the perfume display. Rename any in the planner.",
     "TO CONFIRM — what goes in L2's and L3's drawers; L1's are named from the brief."]], 140);
  out += titleBlock({ title: "WARDROBE INTERIORS", sub: "Left wall, L1 to L3 · doors off · the lit back", date: "21.11.2026",
    rev: "2 — from the owner's planner, 21 Nov: even shelves, rails in reach", dwg: "AST-DR-048", scale: "1:20 AND 1:5 @ A3" });
  window.DRAWINGS["wardrobe-interiors"] = { title: "Wardrobe interiors — left wall · AST-DR-048", svg: mono(sheet(out)) };

  // ═══ AST-DR-050 — the right wall ═══
  window.DK.begin("wardrobe-interiors-right");
  out = frame();
  ["R4", "R3", "R2", "R1"].forEach((id, i) => (out += column(id, 12 + i * 99.5, 99.5, 18)));
  out += heading(18, 205, "NOTES", "RIGHT WALL · REVISION 1", 278);
  notes(18, 215, [
    ["R4 is the tunnel bay. The tunnel is 7'-0\" high (owner, 21 Nov) — lower than the",
     "   7'-2\" loft shelf in the other bays — so R4's loft shelf sits at 7'-0\", on the",
     "   tunnel's head, and its loft is the tallest: 1'-10⅜\" clear.",
     "The back of R4 is the hidden door, 6'-11⅝\" high, ⅜\" under the head. Five shelves",
     "   on its face, 10¼\" deep, in six equal spaces of 1'-1¼\"; the tunnel's own shelves",
     "   on its left wall line up with them. The bay stays clear to walk through; its",
     "   fold-slide doors park by R3, beside the fixed 4\" upright (AST-DR-026)."],
    ["R1 is all shoes: ten sloped shelves with heel rails, evenly 8¼\" apart from the",
     "   floor to the loft. The top two are above 6 ft — for pairs worn less often.",
     "R2 and R3 are daily wear: the rail at 6'-6¾\" with 3'-2½\" of drop for shirts,",
     "   over three drawers (R2), or a trouser pull-out and a drawer (R3).",
     "Bays 3'-1\" wide, 9'-0\" high, 2'-3\" deep. Finish, hardware and the lit back as",
     "   the left wall: AST-DR-048 (rails, boards and loft heights the same).",
     "TO CONFIRM — the cupboard names, read from the owner's brief; the tunnel",
     "   height on site (it was 7'-2\" in the model; the owner says 7'-0\")."]], 140);
  out += titleBlock({ title: "WARDROBE INTERIORS", sub: "Right wall, R4 to R1 · doors off · the tunnel bay", date: "21.11.2026",
    rev: "1 — from the owner's planner, 21 Nov; tunnel 7 ft", dwg: "AST-DR-050", scale: "1:20 @ A3" });
  window.DRAWINGS["wardrobe-interiors-right"] = { title: "Wardrobe interiors — right wall · AST-DR-050", svg: mono(sheet(out)) };
})();
