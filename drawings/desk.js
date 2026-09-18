// Desk — parametric drawing sheets. AST-DR-002 (general arrangement) and AST-DR-003 (details).
// Real-world units are mm. Length and depth confirmed by the owner; other sizes provisional.

window.DRAWINGS = window.DRAWINGS || {};

const DESK = {
  rev: "9 — plain teak top, gold on handles only",
  date: "17.09.2026",
  L: 2286, D: 914, H: 750, // 7 ft 6 in × 3 ft; height set for a 5 ft 9 in user
  top: 40,        // top thickness incl. reeded edge
  ov: 30,         // top overhang, all round
  frz: 75,        // frieze (drawer) band height — slim, keeps 620 knee clearance
  rail: 15,       // reeded rail under frieze
  plH: 80,        // plinth height
  plP: 15,        // plinth projection
  ped: 560,       // pedestal width
  blk: 50,        // fluted block width
  stile: 60,      // pedestal corner stile (carries the carved drop)
  // Corners on plan are HOLLOWED INWARD: a large concave quarter-circle centred on each corner of the top.
  // Every layer below (cove, frieze, pedestal, plinth) is a parallel curve about the SAME centre, and each
  // curve blends into the straight faces through a small convex round f — no sharp arrises.
  hollow: { R: 150, f: 12 },
  // Terminating moulding (fillet + bead + fillet) standing proud at BOTH ENDS of every curve, where the
  // round starts — one on the front face, one on the side face. The middle of the hollow stays clear.
  mould: { w: 26, bead: 9, fillet: 3, proj: 12 },
  conH: 190,        // console bracket height, from underside of top
  conProj: 38,      // console projection at its head
  modestyUp: 150, // modesty panel stops this far above floor
};

(function () {
  const { INK, THIN, DIM, f, text, view, chainH, chainV, bubble, note, heading, cutMark, frame, titleBlock, sheet } = window.DK;
  const K = DESK;
  const cx0 = K.ov, cx1 = K.L - K.ov;
  const pedL = [cx0, cx0 + K.ped], pedR = [cx1 - K.ped, cx1];
  const yF0 = K.top, yF1 = K.top + K.frz, yR1 = yF1 + K.rail, yP = K.H - K.plH;
  const knee = pedR[0] - pedL[1];
  const SPEC = K.hollow;
  const P = (pts) => pts.map((p, i) => `${i ? "L" : "M"} ${f(p[0])} ${f(p[1])}`).join(" ") + " Z";

  // ── hollow-corner geometry ──
  // Local corner at the origin (the corner of the TOP), material toward +x/+y. The hollow is centred on the
  // origin with radius R + off, straight faces sit at `off`, and a round of radius f blends each end.
  function cornerPrims({ R, f: rf }, off = 0) {
    const Ro = R + off, v = Math.sqrt((Ro + rf) ** 2 - (off + rf) ** 2), k = Ro / (Ro + rf);
    const F1 = [off + rf, v], F2 = [v, off + rf];
    return { u: v, pts: [[off, v], [F1[0] * k, F1[1] * k], [F2[0] * k, F2[1] * k], [v, off]], arcs: [[F1, rf], [[0, 0], Ro], [F2, rf]] };
  }
  // Where the carcase curve meets the flat faces, and the centre of the moulding strip that starts there
  // (measured along the face from the top's corner). Its inner edge laps 2 mm onto the round.
  const VC = cornerPrims(SPEC, K.ov).u;
  const MS = VC + K.mould.w / 2 - 2;
  // Outer stile on the pedestal front: carcase edge to the far side of the moulding, plus 10.
  const SO = MS + K.mould.w / 2 - K.ov + 10;
  // Outline of a box with hollow corners where flags (TL, TR, BR, BL) are set. Plan: y0 = front.
  function outline(x0, y0, x1, y1, spec, flags = [1, 1, 1, 1], off = 0) {
    const corners = [[x0, y0, 1, 1, false], [x1, y0, -1, 1, true], [x1, y1, -1, -1, false], [x0, y1, 1, -1, true]];
    const segs = [];
    corners.forEach(([ox, oy, sx, sy, rev], i) => {
      const map = (p) => [ox + sx * p[0], oy + sy * p[1]];
      if (!flags[i]) { segs.push({ to: map([off, off]) }); return; }
      const g = cornerPrims(spec, off);
      let pts = g.pts.map(map), arcs = g.arcs.map(([c, r]) => [map(c), r]);
      if (rev) { pts = pts.reverse(); arcs = arcs.reverse(); }
      segs.push({ to: pts[0] });
      arcs.forEach(([c, r], j) => segs.push({ to: pts[j + 1], c, r, from: pts[j] }));
    });
    return segs;
  }
  function outlinePath(...args) {
    return outline(...args).map((s, i) => {
      if (!s.c) return `${i ? "L" : "M"} ${f(s.to[0])} ${f(s.to[1])}`;
      const cr = (s.from[0] - s.c[0]) * (s.to[1] - s.c[1]) - (s.from[1] - s.c[1]) * (s.to[0] - s.c[0]);
      return `A ${f(s.r)} ${f(s.r)} 0 0 ${cr > 0 ? 1 : 0} ${f(s.to[0])} ${f(s.to[1])}`;
    }).join(" ") + " Z";
  }
  // Sampled ring for the 3D renderer, with a flag per edge marking curved surface.
  function outlineRing(...args) {
    const ring = [], curved = [];
    outline(...args).forEach((s) => {
      if (!s.c) { ring.push(s.to); curved.push(false); return; }
      let a0 = Math.atan2(s.from[1] - s.c[1], s.from[0] - s.c[0]), a1 = Math.atan2(s.to[1] - s.c[1], s.to[0] - s.c[0]);
      let da = a1 - a0; while (da > Math.PI) da -= 2 * Math.PI; while (da < -Math.PI) da += 2 * Math.PI;
      const nSeg = Math.max(2, Math.ceil(Math.abs(da) / ((s.r > 40 ? 7 : 22) * Math.PI / 180)));
      for (let k = 1; k <= nSeg; k++) { const t = a0 + (da * k) / nSeg; ring.push([s.c[0] + s.r * Math.cos(t), s.c[1] + s.r * Math.sin(t)]); curved.push(true); }
    });
    // dedupe consecutive points; an edge is curved if it ends on a sampled arc point
    const r2 = [], c2 = [];
    ring.forEach((p, i) => { const q = r2[r2.length - 1]; if (!q || Math.hypot(p[0] - q[0], p[1] - q[1]) > 0.01) { r2.push(p); c2.push(curved[i]); } });
    if (Math.hypot(r2[0][0] - r2[r2.length - 1][0], r2[0][1] - r2[r2.length - 1][1]) < 0.01) { r2.pop(); c2.pop(); }
    return { ring: r2, curved: c2.map((c, i) => c && c2[(i + 1) % c2.length]) };
  }
  // A hollow corner seen square-on. edge = the TOP's corner line (0 or overall length), dir = +1 / -1, off = layer inset.
  // Shading follows the concave curve; the softened ends read as thin lines where the rounds meet the faces.
  function hollowShade(edge, dir, off, y0, y1, th) {
    const g = cornerPrims(SPEC, off), Ro = SPEC.R + off, a1 = Math.atan2(g.pts[1][1], g.pts[1][0]), a2 = Math.atan2(g.pts[2][1], g.pts[2][0]);
    let o = [0.1, 0.25, 0.4, 0.55, 0.7, 0.85].map((t) => { const x = edge + dir * Ro * Math.cos(a1 + (a2 - a1) * t); return `<line stroke-width="${th}" x1="${f(x)}" y1="${y0}" x2="${f(x)}" y2="${y1}"/>`; }).join("");
    o += `<line stroke-width="${th * 1.6}" x1="${f(edge + dir * g.pts[2][0])}" y1="${y0}" x2="${f(edge + dir * g.pts[2][0])}" y2="${y1}"/>`;
    o += `<line stroke-width="${th}" opacity=".5" x1="${f(edge + dir * g.u)}" y1="${y0}" x2="${f(edge + dir * g.u)}" y2="${y1}"/>`;
    return o;
  }

  // ── glyphs (real mm, front elevation coordinates) ──
  const handle = (x, y, th) =>
    `<circle cx="${x - 45}" cy="${y}" r="8"/><circle cx="${x + 45}" cy="${y}" r="8"/>` +
    `<circle cx="${x - 45}" cy="${y}" r="3" stroke-width="${th}"/><circle cx="${x + 45}" cy="${y}" r="3" stroke-width="${th}"/>` +
    `<path d="M ${x - 45} ${y + 3} C ${x - 45} ${y + 14} ${x - 36} ${y + 12} ${x - 30} ${y + 20} C ${x - 24} ${y + 27} ${x - 12} ${y + 26} ${x} ${y + 26} C ${x + 12} ${y + 26} ${x + 24} ${y + 27} ${x + 30} ${y + 20} C ${x + 36} ${y + 12} ${x + 45} ${y + 14} ${x + 45} ${y + 3}"/>`;

  // Carved drop: ribbon bow, then a chain of diminishing husks with beads.
  function drop(cx, y0, len, th) {
    let o = `<ellipse cx="${cx - 9}" cy="${y0 + 8}" rx="9" ry="5.5"/><ellipse cx="${cx + 9}" cy="${y0 + 8}" rx="9" ry="5.5"/><circle cx="${cx}" cy="${y0 + 8}" r="3.5" fill="#fff"/>`;
    o += `<path stroke-width="${th}" d="M ${cx - 2} ${y0 + 11} L ${cx - 8} ${y0 + 26} M ${cx + 2} ${y0 + 11} L ${cx + 8} ${y0 + 26}"/>`;
    let y = y0 + 30, sz = 24, i = 0;
    while (y + sz < y0 + len && i < 12) {
      o += `<path d="M ${cx} ${y} C ${cx + sz * 0.55} ${y} ${cx + sz * 0.5} ${y + sz * 0.75} ${cx} ${y + sz * 1.15} C ${cx - sz * 0.5} ${y + sz * 0.75} ${cx - sz * 0.55} ${y} ${cx} ${y} Z"/>`;
      o += `<path stroke-width="${th}" d="M ${cx} ${y + sz * 0.15} L ${cx} ${y + sz * 0.9} M ${cx - sz * 0.22} ${y + sz * 0.25} Q ${cx - sz * 0.1} ${y + sz * 0.6} ${cx} ${y + sz * 0.9} M ${cx + sz * 0.22} ${y + sz * 0.25} Q ${cx + sz * 0.1} ${y + sz * 0.6} ${cx} ${y + sz * 0.9}"/>`;
      y += sz * 1.15 + 4;
      o += `<circle cx="${cx}" cy="${y}" r="2.5"/>`;
      y += 5; sz *= 0.9; i++;
    }
    return o;
  }

  // Pedestal ornament: rosette with acanthus scrolls and a ribbon bow, ring pull below.
  function ornament(cx, cy, th) {
    let o = "";
    [1, -1].forEach((m) => {
      o += `<path d="M ${cx + m * 12} ${cy} C ${cx + m * 40} ${cy - 32} ${cx + m * 78} ${cy - 8} ${cx + m * 62} ${cy + 16} C ${cx + m * 52} ${cy + 30} ${cx + m * 34} ${cy + 18} ${cx + m * 44} ${cy + 6}"/>`;
      o += `<path stroke-width="${th}" d="M ${cx + m * 20} ${cy - 10} C ${cx + m * 38} ${cy - 24} ${cx + m * 62} ${cy - 12} ${cx + m * 60} ${cy + 6} M ${cx + m * 14} ${cy + 12} C ${cx + m * 30} ${cy + 36} ${cx + m * 60} ${cy + 44} ${cx + m * 80} ${cy + 36} C ${cx + m * 64} ${cy + 30} ${cx + m * 40} ${cy + 26} ${cx + m * 24} ${cy + 8}"/>`;
      o += `<path d="M ${cx} ${cy - 16} C ${cx + m * 10} ${cy - 34} ${cx + m * 30} ${cy - 30} ${cx + m * 18} ${cy - 20} C ${cx + m * 10} ${cy - 14} ${cx + m * 4} ${cy - 16} ${cx} ${cy - 16}"/>`;
    });
    o += `<circle cx="${cx}" cy="${cy}" r="11" fill="#fff"/><circle cx="${cx}" cy="${cy}" r="5"/>`;
    for (let a = 0; a < 8; a++) { const t = (a * Math.PI) / 4; o += `<line stroke-width="${th}" x1="${f(cx + Math.cos(t) * 5)}" y1="${f(cy + Math.sin(t) * 5)}" x2="${f(cx + Math.cos(t) * 11)}" y2="${f(cy + Math.sin(t) * 11)}"/>`; }
    o += `<circle cx="${cx}" cy="${cy + 11 + 24}" r="24"/><circle cx="${cx}" cy="${cy + 11 + 24}" r="18" stroke-width="${th}"/>`;
    return o;
  }

  // Reeded console bracket, front face. Sits on the corner stile under the top.
  const consoleFront = (x, th, w = K.stile - 10) => {
    const y0 = K.top, h = K.conH;
    let o = `<rect fill="#fff" x="${x - 3}" y="${y0}" width="${w + 6}" height="12"/>`;
    o += `<path fill="#fff" d="M ${x + 2} ${y0 + 12} L ${x + w - 2} ${y0 + 12} L ${x + w - 7} ${y0 + h - 30} L ${x + 7} ${y0 + h - 30} Z"/>`;
    for (let i = 1; i <= 4; i++) {
      const t = i / 5;
      o += `<line stroke-width="${th}" x1="${f(x + 2 + (w - 4) * t)}" y1="${y0 + 18}" x2="${f(x + 7 + (w - 14) * t)}" y2="${y0 + h - 36}"/>`;
    }
    o += `<rect fill="#fff" x="${x + 3}" y="${y0 + h - 30}" width="${w - 6}" height="22" rx="10"/><circle cx="${x + w / 2}" cy="${y0 + h - 19}" r="5" stroke-width="${th}"/>`;
    o += `<circle fill="#fff" cx="${x + w / 2}" cy="${y0 + h - 3}" r="5"/>`;
    return o;
  };
  // Side profile of the console: wall at x = 0, projecting toward -x.
  const consoleProfile = (th) => {
    const h = K.conH, p = K.conProj;
    let o = `<path fill="url(#hatchDesk2)" d="M 0 0 L ${-p} 0 L ${-p} 12 L ${-p + 6} 12 C ${-p + 6} 32 ${-p + 16} 36 ${-p + 18} 62 L ${-p + 24} ${h - 40} C ${-p + 12} ${h - 40} ${-p + 8} ${h - 28} ${-p + 12} ${h - 18} C ${-p + 16} ${h - 6} ${-p + 32} ${h - 6} ${-p + 32} ${h - 20} C ${-p + 32} ${h - 28} ${-p + 24} ${h - 30} ${-p + 22} ${h - 24} L 0 ${h - 14} Z"/>`;
    [4, 8, 12].forEach((d) => { o += `<path stroke-width="${th}" d="M ${-p + 6 + d} 14 C ${-p + 6 + d} 32 ${-p + 16 + d} 36 ${-p + 18 + d} 62 L ${-p + 24 + d * 0.6} ${h - 42}"/>`; });
    return o;
  };
  // Outer corner in elevation: the hollow's shading, plus the terminating moulding at each end of the curve —
  // square-on on the face we look at, edge-on (in profile) on the return face at the silhouette.
  // edge = the top's corner line on this view (0 or full width), dir = +1 at the left, -1 at the right.
  const cornerMould = (edge, dir, th) => {
    const M = K.mould, hw = M.w / 2, xf = edge + dir * MS, xs = edge + dir * K.ov, xo = xs - dir * M.proj;
    const yTop = K.top + K.conH, yC1 = yTop + 4, yC2 = yP - 104, yB = yP - 60;
    let o = hollowShade(edge, dir, K.ov, yF0 + 12, yF1, th) + hollowShade(edge, dir, K.ov, yR1, yP, th) + hollowShade(edge, dir, K.ov - K.plP, yP, K.H, th);
    // square-on strip
    o += `<rect fill="#fff" x="${f(xf - hw)}" y="${yR1}" width="${M.w}" height="${yB - yR1}"/>`;
    o += `<g stroke-width="${th}">${[-M.bead, M.bead].map((d) => `<line x1="${f(xf + d)}" y1="${yR1}" x2="${f(xf + d)}" y2="${yB}"/>`).join("")}${[-M.bead * 0.55, M.bead * 0.55].map((d) => `<line opacity=".5" x1="${f(xf + d)}" y1="${yR1}" x2="${f(xf + d)}" y2="${yB}"/>`).join("")}</g>`;
    [yC1, yC2].forEach((y) => { o += `<rect fill="#fff" x="${f(xf - hw - 3)}" y="${y}" width="${M.w + 6}" height="12"/><line stroke-width="${th}" x1="${f(xf - hw - 3)}" y1="${y + 6}" x2="${f(xf + hw + 3)}" y2="${y + 6}"/>`; });
    o += drop(xf, yC1 + 16, yC2 - yC1 - 24, th);
    o += `<rect fill="#fff" x="${f(xf - hw - 4)}" y="${yB}" width="${M.w + 8}" height="${yP - yB}"/><line stroke-width="${th}" x1="${f(xf - hw - 4)}" y1="${yB + 8}" x2="${f(xf + hw + 4)}" y2="${yB + 8}"/>`;
    o += consoleFront(xf - 17, th, 34);
    // edge-on strip on the return face
    o += `<path fill="#fff" d="M ${f(xs)} ${yR1} L ${f(xo)} ${yR1} L ${f(xo)} ${yB} L ${f(xs)} ${yB}"/><line stroke-width="${th}" x1="${f(xs - dir * M.proj * 0.45)}" y1="${yR1}" x2="${f(xs - dir * M.proj * 0.45)}" y2="${yB}"/>`;
    [yC1, yC2].forEach((y) => { o += `<rect fill="#fff" x="${f(Math.min(xs, xs - dir * (M.proj + 3)))}" y="${y}" width="${M.proj + 3}" height="12"/>`; });
    o += `<rect fill="#fff" x="${f(Math.min(xs, xs - dir * (M.proj + 4)))}" y="${yB}" width="${M.proj + 4}" height="${yP - yB}"/>`;
    o += `<path fill="#fff" d="M ${f(xs)} ${yF0 + 12} L ${f(xs - dir * 22)} ${yF0 + 12} L ${f(xs - dir * 22)} ${yF0 + 20} L ${f(xs - dir * 17)} ${yF0 + 20} C ${f(xs - dir * 17)} ${yF0 + 60} ${f(xs - dir * 9)} ${yF0 + 70} ${f(xs - dir * 8)} ${yTop - 30} C ${f(xs - dir * 16)} ${yTop - 28} ${f(xs - dir * 18)} ${yTop - 8} ${f(xs - dir * 10)} ${yTop - 4} L ${f(xs)} ${yTop - 6}"/>`;
    return o;
  };
  const topShade = (w, th) => hollowShade(0, 1, 0, 0, K.top, th) + hollowShade(w, -1, 0, 0, K.top, th);

  // ════════ FRONT ELEVATION ════════
  function front(th) {
    let o = `<rect x="0" y="0" width="${K.L}" height="${K.top}"/>`;
    o += `<g stroke-width="${th}">${[0.2, 0.4, 0.6, 0.8].map((k) => `<line x1="0" y1="${K.top * k}" x2="${K.L}" y2="${K.top * k}"/>`).join("")}</g>`;
    o += `<rect x="${cx0}" y="${yF0}" width="${cx1 - cx0}" height="${K.frz}"/>`;
    o += topShade(K.L, th);
    [[cx0 + SO, pedL[1] - K.stile], [pedL[1], pedR[0]], [pedR[0] + K.stile, cx1 - SO]].forEach(([a, b]) => {
      o += `<rect x="${a + 5}" y="${yF0 + 6}" width="${b - a - 10}" height="${K.frz - 12}" stroke-width="${th}"/><rect x="${a + 8}" y="${yF0 + 9}" width="${b - a - 16}" height="${K.frz - 18}"/>`;
      const hy = yF0 + K.frz / 2 - 10, mid = (a + b) / 2;
      o += b - a > 500 ? handle(mid - 200, hy, th) + handle(mid + 200, hy, th) : handle(mid, hy, th);
      o += `<path stroke-width="${th}" d="M ${mid - 5} ${yF0 + 18} a 4 4 0 1 1 10 0 l 2 10 l -14 0 z"/>`; // keyhole
    });
    o += `<rect x="${cx0}" y="${yF1}" width="${cx1 - cx0}" height="${K.rail}"/><g stroke-width="${th}"><line x1="${cx0}" y1="${yF1 + 5}" x2="${cx1}" y2="${yF1 + 5}"/><line x1="${cx0}" y1="${yF1 + 10}" x2="${cx1}" y2="${yF1 + 10}"/></g>`;
    // modesty panel seen through kneehole
    o += `<g stroke-width="${th}" opacity=".7"><rect x="${pedL[1] + 20}" y="${yR1}" width="${knee - 40}" height="${K.H - K.modestyUp - yR1}"/><rect x="${pedL[1] + 60}" y="${yR1 + 40}" width="${knee / 2 - 70}" height="${K.H - K.modestyUp - yR1 - 80}"/><rect x="${pedL[1] + knee / 2 + 10}" y="${yR1 + 40}" width="${knee / 2 - 70}" height="${K.H - K.modestyUp - yR1 - 80}"/></g>`;
    [pedL, pedR].forEach(([a, b]) => {
      const outerLeft = a === pedL[0], wl = outerLeft ? SO : K.stile, wr = outerLeft ? K.stile : SO;
      o += `<rect x="${a}" y="${yR1}" width="${K.ped}" height="${yP - yR1}"/>`;
      o += `<g stroke-width="${th}"><line x1="${a + wl}" y1="${yR1}" x2="${a + wl}" y2="${yP}"/><line x1="${b - wr}" y1="${yR1}" x2="${b - wr}" y2="${yP}"/></g>`;
      const dx0 = a + wl + 10, dx1 = b - wr - 10, dy0 = yR1 + 12, dy1 = yP - 12;
      o += `<rect x="${dx0}" y="${dy0}" width="${dx1 - dx0}" height="${dy1 - dy0}"/>`;
      o += `<g stroke-width="${th}"><rect x="${dx0 + 38}" y="${dy0 + 38}" width="${dx1 - dx0 - 76}" height="${dy1 - dy0 - 76}"/><rect x="${dx0 + 46}" y="${dy0 + 46}" width="${dx1 - dx0 - 92}" height="${dy1 - dy0 - 92}"/></g>`;
      o += ornament((dx0 + dx1) / 2, dy0 + (dy1 - dy0) * 0.36, th);
      o += `<rect x="${a - K.plP}" y="${yP}" width="${K.ped + 2 * K.plP}" height="${K.plH}"/><g stroke-width="${th}"><line x1="${a - K.plP}" y1="${yP + 10}" x2="${b + K.plP}" y2="${yP + 10}"/><line x1="${a - K.plP}" y1="${yP + 22}" x2="${b + K.plP}" y2="${yP + 22}"/></g>`;
      o += outerLeft ? cornerMould(0, 1, th) + drop(b - K.stile / 2, K.top + K.conH + 20, yP - 60 - (K.top + K.conH + 20), th)
                     : cornerMould(K.L, -1, th) + drop(a + K.stile / 2, K.top + K.conH + 20, yP - 60 - (K.top + K.conH + 20), th);
      o += outerLeft ? consoleFront(b - K.stile + 5, th) : consoleFront(a + 5, th);
    });
    return o;
  }

  // ════════ LEFT END ELEVATION (front of desk on the right) ════════
  function end(th) {
    const W = K.D, s0 = K.ov, s1 = W - K.ov;
    let o = `<rect x="0" y="0" width="${W}" height="${K.top}"/>`;
    o += `<g stroke-width="${th}">${[0.2, 0.4, 0.6, 0.8].map((k) => `<line x1="0" y1="${K.top * k}" x2="${W}" y2="${K.top * k}"/>`).join("")}</g>`;
    o += `<rect x="${s0}" y="${yF0}" width="${s1 - s0}" height="${K.frz}"/>`;
    o += topShade(W, th);
    o += `<rect x="${s0 + SO + 20}" y="${yF0 + 20}" width="${s1 - s0 - 2 * SO - 40}" height="${K.frz - 40}" stroke-width="${th}"/>`;
    o += `<rect x="${s0}" y="${yF1}" width="${s1 - s0}" height="${K.rail}"/><g stroke-width="${th}"><line x1="${s0}" y1="${yF1 + 5}" x2="${s1}" y2="${yF1 + 5}"/><line x1="${s0}" y1="${yF1 + 10}" x2="${s1}" y2="${yF1 + 10}"/></g>`;
    o += `<rect x="${s0}" y="${yR1}" width="${s1 - s0}" height="${yP - yR1}"/>`;
    o += `<g stroke-width="${th}"><line x1="${s0 + SO}" y1="${yR1}" x2="${s0 + SO}" y2="${yP}"/><line x1="${s1 - SO}" y1="${yR1}" x2="${s1 - SO}" y2="${yP}"/>
      <rect x="${s0 + SO + 40}" y="${yR1 + 40}" width="${s1 - s0 - 2 * SO - 80}" height="${yP - yR1 - 80}"/><rect x="${s0 + SO + 48}" y="${yR1 + 48}" width="${s1 - s0 - 2 * SO - 96}" height="${yP - yR1 - 96}"/></g>`;
    o += `<rect x="${s0 + SO + 30}" y="${yR1 + 30}" width="${s1 - s0 - 2 * SO - 60}" height="${yP - yR1 - 60}"/>`;
    o += `<rect x="${s0 - K.plP}" y="${yP}" width="${s1 - s0 + 2 * K.plP}" height="${K.plH}"/><g stroke-width="${th}"><line x1="${s0 - K.plP}" y1="${yP + 10}" x2="${s1 + K.plP}" y2="${yP + 10}"/><line x1="${s0 - K.plP}" y1="${yP + 22}" x2="${s1 + K.plP}" y2="${yP + 22}"/></g>`;
    o += cornerMould(0, 1, th) + cornerMould(W, -1, th);
    return o;
  }

  // ════════ PLAN (front at bottom) ════════
  function plan(th, dash) {
    let o = `<path d="${outlinePath(0, 0, K.L, K.D, SPEC)}"/><path stroke-width="${th}" d="${outlinePath(0, 0, K.L, K.D, SPEC, [1, 1, 1, 1], 6)}"/>`;
    // plain teak top: grain indicated lengthways
    [0.3, 0.5, 0.7].forEach((k) => { o += `<path stroke-width="${th}" opacity=".45" d="M ${K.L * 0.18} ${K.D * k} C ${K.L * 0.35} ${K.D * k - 12} ${K.L * 0.5} ${K.D * k + 14} ${K.L * 0.82} ${K.D * k}"/>`; });
    o += `<g stroke-width="${th}" stroke-dasharray="${dash}" opacity=".7">`;
    const y0 = K.ov, y1 = K.D - K.ov;
    o += `<path d="${outlinePath(0, 0, pedL[1] + K.ov, K.D, SPEC, [1, 0, 0, 1], K.ov)}"/><path d="${outlinePath(pedR[0] - K.ov, 0, K.L, K.D, SPEC, [0, 1, 1, 0], K.ov)}"/>`;
    [[0, 0, 1, 1], [K.L, 0, -1, 1], [K.L, K.D, -1, -1], [0, K.D, 1, -1]].forEach(([ox, oy, sx, sy]) => {
      const M = K.mould, a = ox + sx * K.ov, b = oy + sy * K.ov;
      o += `<rect x="${f(Math.min(ox + sx * (MS - M.w / 2), ox + sx * (MS + M.w / 2)))}" y="${f(Math.min(b, b - sy * M.proj))}" width="${M.w}" height="${M.proj}"/>`;
      o += `<rect x="${f(Math.min(a, a - sx * M.proj))}" y="${f(Math.min(oy + sy * (MS - M.w / 2), oy + sy * (MS + M.w / 2)))}" width="${M.proj}" height="${M.w}"/>`;
    });
    o += `<line x1="${pedL[1]}" y1="${K.D - K.ov - 40}" x2="${pedR[0]}" y2="${K.D - K.ov - 40}"/></g>`;
    return o;
  }

  // ════════ BACK ELEVATION ════════
  function back(th) {
    let o = `<rect x="0" y="0" width="${K.L}" height="${K.top}"/>`;
    o += `<g stroke-width="${th}">${[0.2, 0.4, 0.6, 0.8].map((k) => `<line x1="0" y1="${K.top * k}" x2="${K.L}" y2="${K.top * k}"/>`).join("")}</g>`;
    o += `<rect x="${cx0}" y="${yF0}" width="${cx1 - cx0}" height="${K.frz}"/>`;
    o += topShade(K.L, th);
    [[cx0 + SO, pedL[1]], [pedL[1], pedR[0]], [pedR[0], cx1 - SO]].forEach(([a, b]) => { o += `<rect x="${a + 20}" y="${yF0 + 20}" width="${b - a - 40}" height="${K.frz - 40}" stroke-width="${th}"/>`; });
    o += `<rect x="${cx0}" y="${yF1}" width="${cx1 - cx0}" height="${K.rail}"/>`;
    o += `<rect x="${pedL[1]}" y="${yR1}" width="${knee}" height="${K.H - K.modestyUp - yR1}"/>`;
    o += `<g stroke-width="${th}"><rect x="${pedL[1] + 40}" y="${yR1 + 40}" width="${knee / 2 - 60}" height="${K.H - K.modestyUp - yR1 - 80}"/><rect x="${pedL[1] + knee / 2 + 20}" y="${yR1 + 40}" width="${knee / 2 - 60}" height="${K.H - K.modestyUp - yR1 - 80}"/></g>`;
    [pedL, pedR].forEach(([a, b]) => {
      o += `<rect x="${a}" y="${yR1}" width="${K.ped}" height="${yP - yR1}"/>`;
      o += `<g stroke-width="${th}"><rect x="${a + 50}" y="${yR1 + 50}" width="${K.ped - 100}" height="${yP - yR1 - 100}"/><rect x="${a + 58}" y="${yR1 + 58}" width="${K.ped - 116}" height="${yP - yR1 - 116}"/></g>`;
      o += `<rect x="${a - K.plP}" y="${yP}" width="${K.ped + 2 * K.plP}" height="${K.plH}"/><line stroke-width="${th}" x1="${a - K.plP}" y1="${yP + 10}" x2="${b + K.plP}" y2="${yP + 10}"/>`;
    });
    o += cornerMould(0, 1, th) + cornerMould(K.L, -1, th);
    return o;
  }

  // ════════ SECTION A–A (through kneehole, front on the left) ════════
  function section(th) {
    const W = K.D, s0 = K.ov, s1 = W - K.ov;
    const hatch = `fill="url(#hatchDesk)"`;
    // top with reeded edges both ends
    const reeds = (x, dir) => { let d = ""; for (let i = 0; i < 4; i++) d += ` A 4 4 0 0 ${dir > 0 ? 0 : 1} ${x} ${4 + (i + 1) * 8}`; return d; };
    let o = `<path ${hatch} d="M 4 0 L ${W - 4} 0 L ${W - 4} 4${reeds(W - 4, -1)} L ${W - 4} ${K.top} L 4 ${K.top} L 4 36 ${(() => { let d = ""; for (let i = 3; i >= 0; i--) d += ` A 4 4 0 0 1 4 ${4 + i * 8}`; return d; })()} Z"/>`;
    // seen beyond: pedestal inner face
    o += `<g stroke-width="${th}"><rect x="${s0}" y="${yR1}" width="${s1 - s0}" height="${yP - yR1}"/><rect x="${s0 - K.plP}" y="${yP}" width="${s1 - s0 + 2 * K.plP}" height="${K.plH}"/></g>`;
    // drawer: front, bottom, back ; runners
    o += `<rect ${hatch} x="${s0}" y="${yF0 + 3}" width="22" height="${K.frz - 6}"/>`;
    o += `<rect ${hatch} x="${s0 + 22}" y="${yF1 - 15}" width="${s1 - s0 - 22 - 80}" height="9"/>`;
    o += `<rect ${hatch} x="${s1 - 80 - 15}" y="${yF0 + 25}" width="15" height="${K.frz - 31}"/>`;
    o += `<rect stroke-width="${th}" x="${s0 + 22}" y="${yF1 - 6}" width="${s1 - s0 - 60}" height="6"/>`;
    // front rail, back rail, modesty panel
    o += `<rect ${hatch} x="${s0}" y="${yF1}" width="22" height="${K.rail}"/>`;
    o += `<rect ${hatch} x="${s1 - 22}" y="${yF0}" width="22" height="${K.frz + K.rail}"/>`;
    o += `<rect ${hatch} x="${s1 - 40}" y="${yR1}" width="18" height="${K.H - K.modestyUp - yR1}"/>`;
    o += `<line x1="-60" y1="${K.H}" x2="${W + 60}" y2="${K.H}" stroke-width="${th * 4}"/>`;
    return o;
  }

  // ════════ 3D MODEL (world mm: x along the desk, y = depth from the front, z up) ════════
  // Every moulding is built as real stepped geometry so the axonometric shows depth, not outlines.
  function deskModel() {
    const solids = [], decals = [], beads = [], lines = [];
    const Z = (e) => K.H - e;                                  // elevation y (from top) -> height
    const L = K.L, DD = K.D, ov = K.ov, yb = DD - ov;
    const add = (r, z0, z1, o = {}) => { if (z1 - z0 > 0.01) solids.push({ ring: r.ring, curved: r.curved, z0, z1, ...o }); };
    const full = (off) => outlineRing(0, 0, L, DD, SPEC, [1, 1, 1, 1], off);
    const pedRing = (side, off) => side === 0 ? outlineRing(0, 0, pedL[1] + off, DD, SPEC, [1, 0, 0, 1], off) : outlineRing(pedR[0] - off, 0, L, DD, SPEC, [0, 1, 1, 0], off);
    const box = (x0, y0, x1, y1) => ({ ring: [[x0, y0], [x1, y0], [x1, y1], [x0, y1]], curved: [false, false, false, false] });
    const circ = (cx, cy, r, n = 24) => ({ ring: Array.from({ length: n }, (_, i) => [cx + r * Math.cos((i / n) * 2 * Math.PI), cy + r * Math.sin((i / n) * 2 * Math.PI)]), curved: Array(n).fill(true) });
    const onY = (y, ny, pts, o = {}) => decals.push({ n: [0, ny, 0], pts: pts.map(([x, e]) => [x, y, Z(e)]), ...o });
    const onX = (x, nx, pts, o = {}) => decals.push({ n: [nx, 0, 0], pts: pts.map(([yy, e]) => [x, yy, Z(e)]), ...o });
    const rectPts = (a0, e0, a1, e1) => [[a0, e0], [a1, e0], [a1, e1], [a0, e1]];
    const circPts = (ca, ce, r, n = 18, ry = 1) => Array.from({ length: n }, (_, i) => [ca + r * Math.cos((i / n) * 2 * Math.PI), ce + r * ry * Math.sin((i / n) * 2 * Math.PI)]);
    // A frame of four boxes standing proud of a vertical face. face: {axis:'y'|'x', at, dir(-1 out toward -axis)}.
    const frameOn = (face, a0, e0, a1, e1, w, proj) => {
      const out = (d) => face.at + face.dir * d;
      const mk = (p0, p1, q0, q1) => face.axis === "y" ? box(p0, Math.min(out(0), out(proj)), p1, Math.max(out(0), out(proj))) : box(Math.min(out(0), out(proj)), p0, Math.max(out(0), out(proj)), p1);
      add(mk(a0, a1), Z(e0 + w), Z(e0), { hatch: false }); add(mk(a0, a1), Z(e1), Z(e1 - w), { hatch: false });
      add(mk(a0, a0 + w), Z(e1 - w), Z(e0 + w), { hatch: false }); add(mk(a1 - w, a1), Z(e1 - w), Z(e0 + w), { hatch: false });
    };
    const slab = (face, a0, e0, a1, e1, d0, d1, o = {}) => {
      const p = face.at + face.dir * d0, q = face.at + face.dir * d1;
      add(face.axis === "y" ? box(a0, Math.min(p, q), a1, Math.max(p, q)) : box(Math.min(p, q), a0, Math.max(p, q), a1), Z(e1), Z(e0), o);
    };

    // ── TOP: 40 mm slab, four reeds as real steps, running unbroken round the hollows
    const topBands = [[K.H, K.H - 1.5, 1.5]];
    for (let r = 0; r < 4; r++) { const b = K.H - 1.5 - r * 8; topBands.push([b, b - 1.5, 1.4], [b - 1.5, b - 6.5, 0], [b - 6.5, b - 8, 1.4]); }
    topBands.push([K.H - 33.5, K.H - 37, 2.5], [K.H - 37, K.H - K.top, 5]);
    topBands.forEach(([z1, z0, off], i) => add(full(off), z0, z1, { capOcc: i === 0, hatch: z1 - z0 >= 4.9 }));
    // ── cove under the top
    [[K.H - K.top, K.H - K.top - 4, 12], [K.H - K.top - 4, K.H - K.top - 8, 18], [K.H - K.top - 8, K.H - K.top - 12, 24]].forEach(([z1, z0, off]) => add(full(off), z0, z1, { capOcc: false, hatch: false }));

    // ── frieze band with drawers
    const zFt = K.H - K.top - 12, zFb = Z(yF1);
    add(full(ov), zFb, zFt, { capOcc: false });
    const fy = { axis: "y", at: ov, dir: -1 };
    const drawers = [[ov + SO, pedL[1] - K.stile], [pedL[1], pedR[0]], [pedR[0] + K.stile, L - ov - SO]];
    drawers.forEach(([a, b]) => {
      const e0 = yF0 + 16, e1 = yF1 - 4;
      slab(fy, a + 3, e0, b - 3, e1, 0, 2.5, { hatch: false });
      frameOn(fy, a + 3, e0, b - 3, e1, 3, 5.5);                              // cockbead
      const eh = (e0 + e1) / 2 - 8, mid = (a + b) / 2, yf = ov - 2.5;
      (b - a > 600 ? [mid - 230, mid + 230] : [mid]).forEach((hx) => {
        [-45, 45].forEach((dx) => { onY(yf, -1, circPts(hx + dx, eh, 9, 14), { closed: true, w: 1 }); onY(yf, -1, circPts(hx + dx, eh, 4, 10), { closed: true }); });
        const zh = Z(eh), bail = Array.from({ length: 17 }, (_, i) => { const t = i / 16; return [hx - 45 + 90 * t, yf - 16, zh - 4 - 20 * Math.pow(Math.sin(Math.PI * t), 0.75)]; });
        lines.push({ n: [0, -1, 0], w: 1, pts: [[hx - 45, yf, zh], [hx - 45, yf - 16, zh - 3], ...bail, [hx + 45, yf - 16, zh - 3], [hx + 45, yf, zh]] });
      });
      onY(ov - 2.5, -1, [[mid - 3.5, yF0 + 22], [mid + 3.5, yF0 + 22], [mid + 4.5, yF0 + 32], [mid - 4.5, yF0 + 32]], { closed: true });
    });
    // frieze back and ends: sunk panels as mouldings
    [[ov + SO, pedL[1]], [pedL[1], pedR[0]], [pedR[0], L - ov - SO]].forEach(([a, b]) => frameOn({ axis: "y", at: yb, dir: 1 }, a + 16, yF0 + 18, b - 16, yF1 - 6, 3, 4));
    frameOn({ axis: "x", at: ov, dir: -1 }, ov + SO + 10, yF0 + 18, yb - SO - 10, yF1 - 6, 3, 4);
    frameOn({ axis: "x", at: L - ov, dir: 1 }, ov + SO + 10, yF0 + 18, yb - SO - 10, yF1 - 6, 3, 4);

    // ── reeded rail under the frieze: three reeds, runs right round and across the kneehole
    for (let r = 0; r < 3; r++) { const b = zFb - r * 5; add(full(ov - 1.5), b - 1, b, { capOcc: false, hatch: false }); add(full(ov - 3.5), b - 4, b - 1, { capOcc: false, hatch: false }); add(full(ov - 1.5), b - 5, b - 4, { capOcc: false, hatch: false }); }

    // ── modesty panel, framed on both faces
    add(box(pedL[1], yb - 40, pedR[0], yb - 22), K.modestyUp, Z(yR1));
    [[pedL[1] + 50, pedL[1] + knee / 2 - 12], [pedL[1] + knee / 2 + 12, pedR[0] - 50]].forEach(([a, b]) => {
      frameOn({ axis: "y", at: yb - 40, dir: -1 }, a, yR1 + 40, b, K.H - K.modestyUp - 40, 18, 5);
      frameOn({ axis: "y", at: yb - 22, dir: 1 }, a, yR1 + 40, b, K.H - K.modestyUp - 40, 18, 5);
    });

    [0, 1].forEach((side) => {
      const [a, b] = side === 0 ? pedL : pedR, left = side === 0, wl = left ? SO : K.stile, wr = left ? K.stile : SO;
      // carcase + stepped plinth (ogee lip, fillet, plain band, toe)
      add(pedRing(side, ov), K.plH, Z(yR1), { capOcc: false });
      [[K.plH, K.plH - 4, ov - 12], [K.plH - 4, K.plH - 9, ov - 9.5], [K.plH - 9, K.plH - 14, ov - 12.5], [K.plH - 14, 12, ov - K.plP], [12, 0, ov - K.plP - 3]]
        .forEach(([z1, z0, off]) => add(pedRing(side, off), z0, z1, { capOcc: false, hatch: z1 - z0 > 6 }));

      // front: raised-and-fielded door with bolection frame, carved ornament and ring pull
      const dx0 = a + wl + 10, dx1 = b - wr - 10, dy0 = yR1 + 14, dy1 = yP - 14, oc = (dx0 + dx1) / 2, oy = dy0 + (dy1 - dy0) * 0.36;
      slab(fy, dx0, dy0, dx1, dy1, 0, 4, { hatch: false });
      frameOn(fy, dx0, dy0, dx1, dy1, 28, 11);
      frameOn(fy, dx0 + 28, dy0 + 28, dx1 - 28, dy1 - 28, 5, 8);
      slab(fy, dx0 + 44, dy0 + 44, dx1 - 44, dy1 - 44, 4, 6, { hatch: false });
      slab(fy, dx0 + 52, dy0 + 52, dx1 - 52, dy1 - 52, 6, 8, { hatch: false });
      const yo = ov - 8;
      onY(yo, -1, circPts(oc, oy, 11, 16), { closed: true, w: 1 }); onY(yo, -1, circPts(oc, oy, 5, 10), { closed: true });
      for (let k = 0; k < 8; k++) { const t = (k / 8) * 2 * Math.PI; onY(yo, -1, [[oc + 5 * Math.cos(t), oy + 5 * Math.sin(t)], [oc + 11 * Math.cos(t), oy + 11 * Math.sin(t)]]); }
      // ribbon bow above the rosette
      [-1, 1].forEach((m) => {
        onY(yo, -1, circPts(oc + m * 9, oy - 19, 8, 14, 0.55), { closed: true, w: 1 });
        onY(yo, -1, [[oc + m * 3, oy - 15], [oc + m * 7, oy - 4], [oc + m * 12, oy + 2]]);
        // acanthus C-scroll: a tightening spiral opening toward the rosette
        onY(yo, -1, Array.from({ length: 30 }, (_, i) => { const t = i / 29, ang = Math.PI * (1 - 2.3 * t), r = 24 * (1 - 0.72 * t); return [oc + m * (40 + r * Math.cos(ang)), oy + 2 - r * 0.85 * Math.sin(ang)]; }), { w: 1 });
        // leaf tip flowing outward and down from the scroll
        onY(yo, -1, [[oc + m * 16, oy + 8], [oc + m * 34, oy + 22], [oc + m * 56, oy + 26], [oc + m * 72, oy + 20], [oc + m * 60, oy + 30], [oc + m * 38, oy + 30], [oc + m * 20, oy + 14]], { closed: true });
        onY(yo, -1, [[oc + m * 24, oy + 16], [oc + m * 44, oy + 25], [oc + m * 62, oy + 25]]);
      });
      const zr = Z(oy + 36), ringPts = (r) => Array.from({ length: 28 }, (_, i) => { const t = (i / 28) * 2 * Math.PI; return [oc + r * Math.cos(t), yo - 7, zr + r * Math.sin(t)]; });
      lines.push({ n: [0, -1, 0], w: 1, closed: true, pts: ringPts(25) });
      lines.push({ n: [0, -1, 0], w: 0, closed: true, pts: ringPts(19) });
      lines.push({ n: [0, -1, 0], w: 1, pts: [[oc, yo, Z(oy + 11)], [oc, yo - 7, zr + 25]] });
      // carved drop on the inner stile: ribbon bow, then diminishing husks
      const ix = left ? b - K.stile / 2 : a + K.stile / 2, dropTop = K.top + K.conH + 26;
      beads.push({ p: [ix - 8, ov - 3, Z(dropTop)], r: 6, ry: 0.6, n: [0, -1, 0] }, { p: [ix + 8, ov - 3, Z(dropTop)], r: 6, ry: 0.6, n: [0, -1, 0] });
      for (let e = dropTop + 18, r = 7.5; e < yP - 70; e += r * 2.5 + 5, r *= 0.93) beads.push({ p: [ix, ov - 3, Z(e)], r, ry: 1.35, n: [0, -1, 0] });

      // outer end: raised panel with bolection frame
      const ex = left ? ov : L - ov, en = left ? -1 : 1, fx = { axis: "x", at: ex, dir: en };
      const ey0 = ov + SO - 10, ey1 = yb - SO + 10;
      frameOn(fx, ey0, yR1 + 40, ey1, yP - 40, 26, 10);
      frameOn(fx, ey0 + 26, yR1 + 66, ey1 - 26, yP - 66, 5, 7);
      slab(fx, ey0 + 40, yR1 + 80, ey1 - 40, yP - 80, 0, 5, { hatch: false });
      // back: framed panel (desk may stand free)
      const fb = { axis: "y", at: yb, dir: 1 };
      frameOn(fb, a + wl - 20, yR1 + 40, b - wr + 20, yP - 40, 26, 10);
      slab(fb, a + wl + 20, yR1 + 80, b - wr - 20, yP - 80, 0, 5, { hatch: false });

      // inner console bracket on the front (kneehole side): abacus, tapering reeded body, scroll foot
      const cx = ix, zTop = zFt, zBot = Z(K.top + K.conH);
      const stack = [[zTop - 8, zTop, 29, 26], [zTop - 12, zTop - 8, 26, 22]];
      const bodyTop = zTop - 12, bodyBot = zBot + 34, nb = 5;
      for (let k = 0; k < nb; k++) { const t = k / nb, hw = 24 - 3 * t, pr = 21 - 6 * t; stack.push([bodyTop - ((bodyTop - bodyBot) * (k + 1)) / nb, bodyTop - ((bodyTop - bodyBot) * k) / nb, hw, pr]); }
      stack.push([zBot + 24, bodyBot, 20, 13], [zBot + 12, zBot + 24, 23, 20], [zBot + 4, zBot + 12, 21, 17], [zBot, zBot + 4, 16, 11]);
      stack.forEach(([z0, z1, hw, pr]) => {
        add(box(cx - hw, ov - pr, cx + hw, ov), z0, z1, { capOcc: false });
        if (z1 - z0 > 20) for (let q = 1; q <= 4; q++) decals.push({ n: [0, -1, 0], pts: [[cx - hw + (2 * hw * q) / 5, ov - pr, z0 + 3], [cx - hw + (2 * hw * q) / 5, ov - pr, z1 - 3]] });
      });
    });

    // ── outer corners: terminating moulding at BOTH ends of each curve (front face + side face)
    const M = K.mould, zCap = Z(K.top + K.conH), zC1 = zCap - 16, zC2 = Z(yP - 104), zFt2 = K.H - K.top - 12;
    [[0, 0, 1, 1], [L, 0, -1, 1], [L, DD, -1, -1], [0, DD, 1, -1]].forEach(([ox, oy, sx, sy]) => {
      [
        { c: [ox + sx * MS, oy + sy * ov], t: [1, 0], n: [0, -sy] },   // on the front / back face
        { c: [ox + sx * ov, oy + sy * MS], t: [0, 1], n: [-sx, 0] },   // on the end face
      ].forEach(({ c, t, n }) => {
        const F = (u, w) => [c[0] + t[0] * u + n[0] * w, c[1] + t[1] * u + n[1] * w];
        const n3 = [n[0], n[1], 0];
        const profile = (hw, bead, fil, steps = 8) => {
          const ring = [F(-hw, 0), F(-hw, fil), F(-bead, fil)], curved = [false, false, true];
          for (let k = 1; k < steps; k++) { const a = Math.PI * (1 - k / steps); ring.push(F(bead * Math.cos(a), fil + bead * Math.sin(a))); curved.push(true); }
          ring.push(F(bead, fil), F(hw, fil), F(hw, 0)); curved.push(false, false, false);
          return { ring, curved };
        };
        const rect = (hw, pr) => ({ ring: [F(-hw, 0), F(hw, 0), F(hw, pr), F(-hw, pr)], curved: [false, false, false, false] });
        // plinth block and its cap
        add(rect(M.w / 2 + 4, M.proj + 4), K.plH, Z(yP - 8), { capOcc: false });
        add(rect(M.w / 2 + 6, M.proj + 6), Z(yP - 8), Z(yP - 12), { capOcc: false, hatch: false });
        // the strip: fillet + bead + fillet
        add(profile(M.w / 2, M.bead, M.fillet), Z(yP - 12), zCap - 8, { capOcc: false });
        add(rect(M.w / 2 + 3, M.proj + 3), zCap - 8, zCap, { capOcc: false, hatch: false });
        // carved teak collars (bead between fillets)
        [zC1, zC2].forEach((z) => {
          add(profile(M.w / 2 + 2, M.bead + 1.5, M.fillet + 1), z - 12, z - 9, { capOcc: false });
          add(profile(M.w / 2 + 3, M.bead + 3, M.fillet + 2), z - 9, z - 3, { capOcc: false, hatch: false });
          add(profile(M.w / 2 + 2, M.bead + 1.5, M.fillet + 1), z - 3, z, { capOcc: false });
        });
        // carved drop down the bead
        const face = F(0, M.fillet + M.bead + 1.5);
        beads.push({ p: [face[0], face[1], zC1 - 22], r: 5, ry: 0.6, n: n3 });
        for (let z = zC1 - 36, r = 6; z > zC2 + 16; z -= r * 2.5 + 4, r *= 0.94) beads.push({ p: [face[0], face[1], z], r, ry: 1.35, n: n3 });
        // console bracket above: abacus, tapering reeded body, scroll foot
        const cons = [[zFt2 - 8, zFt2, 19, 24], [zFt2 - 12, zFt2 - 8, 17, 21]], bT = zFt2 - 12, bB = zCap + 30;
        for (let k = 0; k < 5; k++) { const q = k / 5; cons.push([bT - ((bT - bB) * (k + 1)) / 5, bT - ((bT - bB) * k) / 5, 16 - 2 * q, 19 - 6 * q]); }
        cons.push([zCap + 20, bB, 13, 11], [zCap + 9, zCap + 20, 16, 17], [zCap, zCap + 9, 14, 13]);
        cons.forEach(([z0, z1, hw, pr]) => {
          add(rect(hw, pr), z0, z1, { capOcc: false });
          if (z1 - z0 > 20) for (let q = 1; q <= 3; q++) { const u = -hw + (2 * hw * q) / 4, a = F(u, pr); decals.push({ n: n3, pts: [[a[0], a[1], z0 + 3], [a[0], a[1], z1 - 3]] }); }
        });
      });
    });
    return { faces: window.ISO.build(solids, decals), beads, lines };
  }
  const MODEL = deskModel();
  // Renders are cached by parameters (tools/dump-cad.js writes drawings/desk-3d.cache.js) so the page loads fast.
  const CACHE_KEY = JSON.stringify(DESK);
  window.ISO_CACHE = window.ISO_CACHE || {};
  function render3d(scale, flip) {
    const key = `${scale}|${flip}`, hit = window.ISO_CACHE[key];
    if (hit && hit.params === CACHE_KEY) return hit;
    const r = window.ISO.render(MODEL, { scale, flip, L: K.L, D: K.D, eps: 0.35 });
    window.ISO_CACHE[key] = { ...r, params: CACHE_KEY };
    return window.ISO_CACHE[key];
  }
  // Render an axonometric; returns svg placed with its top-left at (x, y). clip = optional [x, y, w, h] window in paper mm.
  function axo3d(x, y, scale, flip = false, clip) {
    const r = render3d(scale, flip);
    const tx = x - r.bbox[0], ty = y - r.bbox[1];
    return { svg: `<g transform="translate(${f(tx)} ${f(ty)})">${r.svg}</g>`, w: r.bbox[2] - r.bbox[0], h: r.bbox[3] - r.bbox[1], tx, ty };
  }

  // ═════════════ SHEET 1 — GENERAL ARRANGEMENT ═════════════
  window.DK.begin("desk");
  let s1 = frame();
  s1 += `<defs><pattern id="hatchDesk" patternUnits="userSpaceOnUse" width="14" height="14" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="14" stroke="#888" stroke-width="1.6"/></pattern></defs>`;
  const sc = 20;

  // Front
  const vF = view(28, 34, sc, "Front elevation"), tF = vF.w(0.12);
  s1 += heading(18, 17, "FRONT ELEVATION", `SCALE 1:${sc}`);
  s1 += vF.g(front(tF) + `<line x1="-120" y1="${K.H}" x2="${K.L + 120}" y2="${K.H}" stroke-width="${vF.w(0.6)}"/>`, 0.3);
  s1 += chainH([0, cx0, pedL[1], pedR[0], cx1, K.L].map(vF.X), vF.Y(K.H) + 6, [K.ov, K.ped, knee, K.ped, K.ov], { from: vF.Y(K.H) + 1, size: 1.5 });
  s1 += chainH([vF.X(0), vF.X(K.L)], vF.Y(K.H) + 12, [`${K.L} OVERALL (7 FT 6 IN)`], { from: vF.Y(K.H) + 1 });
  s1 += chainV([0, K.top, yF1, yR1, yP, K.H].map(vF.Y), vF.X(K.L) + 7, [K.top, K.frz, "", yP - yR1, K.plH], { from: vF.X(K.L) + 1, size: 1.5 });
  s1 += chainV([vF.Y(0), vF.Y(K.H)], vF.X(K.L) + 13, [`${K.H} HIGH`], { from: vF.X(K.L) + 1 });
  s1 += chainV([vF.Y(yR1), vF.Y(K.H)], vF.X(pedL[1]) + 8, [`${K.H - yR1} KNEE`], { from: vF.X(pedL[1]) + 8, size: 1.5 });
  s1 += cutMark(vF.X(K.L / 2), vF.Y(0) - 3, "A", "up");
  // bubbles
  [[1, K.L * 0.62, K.top / 2], [2, pedR[0] + K.blk / 2, yF0 + K.frz / 2], [3, K.L / 2 + 200, yF0 + 34], [4, K.L * 0.36, yF1 + 8], [5, pedR[1] - K.stile / 2, 520],
   [6, (pedR[0] + pedR[1]) / 2, yR1 + 120], [7, (pedR[0] + pedR[1]) / 2 + 110, 560], [8, pedR[1] - 120, yP + 40], [9, K.L / 2, 470]]
    .forEach(([n, x, y]) => { s1 += bubble(vF.X(x), vF.Y(y), n); });

  // Left end (to the right of the front — first-angle projection)
  const vE = view(176, 34, sc, "Left end elevation"), tE = vE.w(0.12);
  s1 += heading(176, 17, "LEFT END ELEVATION", `SCALE 1:${sc} · FRONT →`, 50);
  s1 += vE.g(end(tE) + `<line x1="-60" y1="${K.H}" x2="${K.D + 60}" y2="${K.H}" stroke-width="${vE.w(0.6)}"/>`, 0.3);
  s1 += chainH([0, K.ov, K.D - K.ov, K.D].map(vE.X), vE.Y(K.H) + 6, [K.ov, K.D - 2 * K.ov, K.ov], { from: vE.Y(K.H) + 1, size: 1.5 });
  s1 += chainH([vE.X(0), vE.X(K.D)], vE.Y(K.H) + 12, [`${K.D} DEEP (3 FT)`], { from: vE.Y(K.H) + 1 });

  // Section A–A
  const scS = 12, vS = view(282, 34, scS, "Section A-A"), tS = vS.w(0.12);
  s1 += heading(282, 17, "SECTION A–A", `THROUGH KNEEHOLE · 1:${scS} · FRONT ←`, 50);
  s1 += vS.g(section(tS), 0.3);
  s1 += note(vS.X(K.ov + 11), vS.Y(yF0 + 60), vS.X(K.D) + 6, vS.Y(yF0 + 120), "DRAWER FRONT 22", "DOVETAILED, 9 BOTTOM");
  s1 += note(vS.X(K.D - K.ov - 31), vS.Y(450), vS.X(K.D) + 6, vS.Y(470), "MODESTY PANEL 18", `STOPS ${K.modestyUp} ABOVE FLOOR`);
  s1 += note(vS.X(K.D - 4), vS.Y(20), vS.X(K.D) + 6, vS.Y(60), "REEDED EDGE", "SEE DETAIL 1");
  s1 += chainV([vS.Y(yF0), vS.Y(yF1)], vS.X(0) - 4, [K.frz], { from: vS.X(K.ov), size: 1.5 });

  // Plan (below the front — first-angle projection)
  const vP = view(28, 110, sc, "Plan"), tP = vP.w(0.12);
  s1 += heading(18, 101, "PLAN", `SCALE 1:${sc} · FRONT AT BOTTOM`, 40);
  s1 += vP.g(plan(tP, `${vP.w(1)} ${vP.w(0.7)}`), 0.3);
  s1 += chainV([vP.Y(0), vP.Y(K.D)], vP.X(K.L) + 13, [K.D], { from: vP.X(K.L) + 1 });
  s1 += note(vP.X(K.L * 0.3), vP.Y(K.D * 0.4), vP.X(K.L * 0.3) + 2, vP.Y(K.D * 0.4) - 2, "PLAIN TEAK TOP", "NO INSET — GRAIN LENGTHWAYS");
  s1 += note(vP.X(pedR[0] + 60), vP.Y(K.D - 60), vP.X(pedR[0] + 60) + 2, vP.Y(K.D - 60) + 1, "PEDESTALS BELOW", "(HIDDEN, DASHED)");

  // Back
  const vB = view(176, 110, sc, "Back elevation"), tB = vB.w(0.12);
  s1 += heading(176, 101, "BACK ELEVATION", `SCALE 1:${sc} · IF FREE-STANDING`, 50);
  s1 += vB.g(back(tB) + `<line x1="-60" y1="${K.H}" x2="${K.L + 60}" y2="${K.H}" stroke-width="${vB.w(0.6)}"/>`, 0.3);

  // Axonometric
  s1 += heading(18, 190, "AXONOMETRIC", "NOT TO SCALE · FROM FRONT RIGHT", 45);
  s1 += axo3d(30, 204, 31).svg;

  // Key + notes
  const kx = 160;
  s1 += heading(kx, 190, "KEY", "PARTS OF THE DESK", 30);
  ["Top — plain teak, reeded edge", "Reeded console bracket", "Frieze drawer, swan-neck handles", "Reeded rail", "Hollow corner, moulding at each end of the curve",
   "Pedestal door, moulded panel", "Carved ornament + ring pull", "Moulded plinth", "Modesty panel in kneehole"]
    .forEach((l, i) => { s1 += bubble(kx + 2, 201 + i * 5.2, i + 1) + text(kx + 6, 201.7 + i * 5.2, l, { size: 1.7 }); });
  s1 += heading(236, 190, "NOTES", "READ BEFORE MAKING", 40);
  ["Dimensions in feet and inches. Do not scale.", "Length 7 ft 6 in and depth 3 ft confirmed.", "   Height 750 set for a 5 ft 9 in user.",
   "Solid teak throughout; polish sets the room finish.", "Pedestals shown as doors — drawers TBC.", "Hollowed corners; moulding strip at both curve ends.",
   "Carving shown schematically — carver to", "   work from reference and Details sheet.", "First-angle projection."]
    .forEach((n, i) => { s1 += text(236, 201 + i * 4.3, n, { size: 1.6 }); });
  s1 += titleBlock({ title: "DESK — GENERAL ARRANGEMENT", sub: "Front · End · Section · Plan · Back · Axo", date: K.date, rev: K.rev, dwg: "AST-DR-002" });

  // ═════════════ SHEET 2 — DETAILS ═════════════
  window.DK.begin("desk-details");
  let s2 = frame();
  s2 += `<defs><pattern id="hatchDesk2" patternUnits="userSpaceOnUse" width="3" height="3" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="3" stroke="#999" stroke-width="0.25"/></pattern></defs>`;
  const H2 = `fill="url(#hatchDesk2)"`;

  // 1 — top edge profile 1:1
  s2 += heading(18, 17, "1 · TOP EDGE", "SECTION · SCALE 1:1", 50);
  const o1 = { x: 40, y: 34 };
  let reedsL = ""; for (let i = 0; i < 4; i++) reedsL += ` A 4 4 0 0 0 ${o1.x + 4} ${o1.y + 4 + (i + 1) * 8}`;
  const d1 = `<g stroke="${INK}" stroke-width="0.35" stroke-linejoin="round">
    <path ${H2} d="M ${o1.x + 100} ${o1.y} L ${o1.x + 6} ${o1.y} Q ${o1.x + 4} ${o1.y} ${o1.x + 4} ${o1.y + 2} L ${o1.x + 4} ${o1.y + 4}${reedsL} L ${o1.x + 4} ${o1.y + 38} Q ${o1.x + 4} ${o1.y + 40} ${o1.x + 6} ${o1.y + 40} L ${o1.x + 100} ${o1.y + 40}"/>
    <path ${H2} d="M ${o1.x + 18} ${o1.y + 40} L ${o1.x + 30} ${o1.y + 40} L ${o1.x + 30} ${o1.y + 52} Q ${o1.x + 21} ${o1.y + 50} ${o1.x + 18} ${o1.y + 40} Z"/>
    <path ${H2} d="M ${o1.x + 30} ${o1.y + 40} L ${o1.x + 52} ${o1.y + 40} L ${o1.x + 52} ${o1.y + 70} L ${o1.x + 30} ${o1.y + 70} Z"/>
    <path fill="none" stroke-width="0.2" d="M ${o1.x + 100} ${o1.y - 3} L ${o1.x + 100} ${o1.y + 15} L ${o1.x + 96} ${o1.y + 18} L ${o1.x + 104} ${o1.y + 22} L ${o1.x + 100} ${o1.y + 25} L ${o1.x + 100} ${o1.y + 43}"/></g>`;
  s2 += d1;
  window.DK.capture("Top edge section", 1, d1);
  s2 += chainV([o1.y, o1.y + 4, o1.y + 36, o1.y + 40], o1.x - 8, ["", "4 REEDS × 8", ""], { from: o1.x - 1, size: 1.5 });
  s2 += chainV([o1.y, o1.y + 40], o1.x - 14, [K.top], { from: o1.x - 1 });
  s2 += chainH([o1.x, o1.x + 30], o1.y - 5, [K.ov], { from: o1.y - 1, size: 1.5 });
  s2 += note(o1.x + 88, o1.y + 1, o1.x + 90, o1.y - 10, "PLAIN TEAK TOP", "NO LEATHER INSET");
  s2 += note(o1.x + 22, o1.y + 45, o1.x + 5, o1.y + 62, "COVE 12 × 12", "", "end");
  s2 += note(o1.x + 45, o1.y + 60, o1.x + 62, o1.y + 62, "FRIEZE 22", "");

  // 2 — reeded rail + cockbead 1:1
  s2 += heading(18, 118, "2 · DRAWER RAIL", "SECTION · SCALE 1:1", 50);
  const o2 = { x: 45, y: 132 };
  let r2 = ""; for (let i = 0; i < 3; i++) r2 += ` A 2.5 2.5 0 0 0 ${o2.x} ${o2.y + 30 + (i + 1) * 5}`;
  const d2 = `<g stroke="${INK}" stroke-width="0.35" stroke-linejoin="round">
    <path ${H2} d="M ${o2.x + 3} ${o2.y} L ${o2.x + 25} ${o2.y} L ${o2.x + 25} ${o2.y + 28} L ${o2.x + 3} ${o2.y + 28} Z"/>
    <circle ${H2} cx="${o2.x + 1.5}" cy="${o2.y + 1.5}" r="1.5"/><circle ${H2} cx="${o2.x + 1.5}" cy="${o2.y + 26.5}" r="1.5"/>
    <path ${H2} d="M ${o2.x} ${o2.y + 30}${r2} L ${o2.x + 22} ${o2.y + 45} L ${o2.x + 22} ${o2.y + 30} Z"/>
    <path fill="none" stroke-width="0.2" stroke-dasharray="1 .7" d="M ${o2.x + 25} ${o2.y + 26} L ${o2.x + 80} ${o2.y + 26}"/></g>`;
  s2 += d2;
  window.DK.capture("Drawer rail section", 1, d2);
  s2 += note(o2.x + 1.5, o2.y + 1.5, o2.x + 30, o2.y - 4, "COCKBEAD Ø3 ROUND DRAWER FRONT", "");
  s2 += note(o2.x, o2.y + 38, o2.x - 5, o2.y + 55, `RAIL ${K.rail} HIGH — 3 REEDS`, "RUNS FULL WIDTH, ALSO ACROSS KNEEHOLE", "start");
  s2 += note(o2.x + 60, o2.y + 26, o2.x + 62, o2.y + 18, "DRAWER BOTTOM", "");

  // 3 — console bracket 1:2.5
  s2 += heading(150, 17, "3 · CONSOLE BRACKET", "FRONT + SIDE · 1:2.5 · 50 WIDE AT KNEEHOLE, 34 ON CORNERS", 70);
  const vD3 = view(152, 34 - K.top / 2.5, 2.5, "Console bracket - front"), tD3 = vD3.w(0.12);
  s2 += vD3.g(consoleFront(5, tD3), 0.3);
  const vD3b = view(200, 34, 2.5, "Console bracket - side profile"), tD3b = vD3b.w(0.12);
  s2 += vD3b.g(consoleProfile(tD3b) + `<line x1="0" y1="-10" x2="0" y2="${K.conH + 10}" stroke-width="${tD3b}" stroke-dasharray="6 4"/>`, 0.3);
  s2 += chainH([vD3.X(0), vD3.X(K.stile)], 31, [`${K.stile} STILE`], { from: 32, size: 1.4 });
  s2 += chainV([vD3b.Y(0), vD3b.Y(K.conH)], vD3b.X(0) + 5, [K.conH], { from: vD3b.X(0) + 1, size: 1.5 });
  s2 += chainH([vD3b.X(-K.conProj), vD3b.X(0)], vD3b.Y(K.conH) + 6, [K.conProj], { from: vD3b.Y(K.conH) + 1, size: 1.4 });
  s2 += text(160, 34 + K.conH / 2.5 + 12, "FRONT", { size: 1.5, fill: THIN, anchor: "middle" }) + text(193, 34 + K.conH / 2.5 + 12, "SIDE", { size: 1.5, fill: THIN, anchor: "middle" });
  s2 += note(vD3b.X(-K.conProj + 3), vD3b.Y(6), vD3b.X(-K.conProj) - 3, vD3b.Y(-8), "ABACUS", "", "end");
  s2 += note(vD3b.X(-K.conProj + 16), vD3b.Y(K.conH - 16), vD3b.X(-K.conProj) - 5, vD3b.Y(K.conH + 4), "SCROLL FOOT", "", "end");
  s2 += note(vD3.X(K.stile / 2), vD3.Y(K.top + 90), vD3.X(0) - 3, vD3.Y(K.top + 110), "4 REEDS, TAPERING", "PLAIN POLISHED TEAK", "end");

  // 4 — carved drop 1:4
  s2 += heading(232, 17, "4 · CARVED DROP", "KNEEHOLE STILE · SCALE 1:4", 45);
  const vD4 = view(242, 30, 4, "Carved drop"), tD4 = vD4.w(0.12);
  const dropLen = yP - yR1 - 40;
  s2 += vD4.g(`<rect x="0" y="0" width="${K.stile}" height="${yP - yR1}" stroke-width="${tD4}"/>` + drop(K.stile / 2, 14, dropLen, tD4), 0.3);
  s2 += chainH([vD4.X(0), vD4.X(K.stile)], vD4.Y(0) - 3, [K.stile], { from: vD4.Y(0) - 1, size: 1.5 });
  s2 += chainV([vD4.Y(0), vD4.Y(yP - yR1)], vD4.X(K.stile) + 6, [yP - yR1], { from: vD4.X(K.stile) + 1, size: 1.5 });
  s2 += note(vD4.X(K.stile / 2 + 12), vD4.Y(22), vD4.X(K.stile) + 12, vD4.Y(10), "RIBBON BOW", "");
  s2 += note(vD4.X(K.stile / 2 + 8), vD4.Y(60), vD4.X(K.stile) + 12, vD4.Y(80), "HUSKS, DIMINISHING", "EACH ~10% SMALLER");
  s2 += note(vD4.X(K.stile / 2 + 3), vD4.Y(120), vD4.X(K.stile) + 12, vD4.Y(150), "BEAD BETWEEN HUSKS", "");
  s2 += note(vD4.X(K.stile / 2), vD4.Y(260), vD4.X(K.stile) + 12, vD4.Y(260), "CARVED IN THE SOLID", "RELIEF 6–8");
  s2 += text(vD4.X(0), vD4.Y(yP - yR1) + 6, "SMALLER DROP ALSO RUNS DOWN", { size: 1.45, fill: THIN }) + text(vD4.X(0), vD4.Y(yP - yR1) + 8.5, "EACH CORNER MOULDING", { size: 1.45, fill: THIN });

  // 5 — pedestal ornament 1:3
  s2 += heading(300, 17, "5 · PEDESTAL ORNAMENT", "ELEVATION · SCALE 1:3", 55);
  const vD5 = view(350, 50, 3, "Pedestal ornament"), tD5 = vD5.w(0.12);
  s2 += vD5.g(ornament(0, 0, tD5), 0.3);
  s2 += chainH([vD5.X(-80), vD5.X(80)], vD5.Y(-40) - 2, ["≈160"], { from: vD5.Y(-30) });
  s2 += note(vD5.X(0), vD5.Y(35 + 24), vD5.X(60), vD5.Y(80), "BRASS RING PULL Ø48", "HANGS FROM ROSETTE");
  s2 += note(vD5.X(-62), vD5.Y(16), vD5.X(-90), vD5.Y(45), "ACANTHUS SCROLLS", "CARVED OR BRASS — TBC", "end");
  s2 += note(vD5.X(-10), vD5.Y(-24), vD5.X(-90), vD5.Y(-25), "RIBBON TIE", "", "end");

  // 6 — swan-neck handle 1:1
  s2 += heading(300, 100, "6 · DRAWER HANDLE", "ELEVATION · SCALE 1:1", 55);
  const vD6 = view(350, 120, 1, "Drawer handle"), tD6 = vD6.w(0.12);
  s2 += vD6.g(handle(0, 0, tD6), 0.3);
  s2 += chainH([vD6.X(-45), vD6.X(45)], vD6.Y(-12), ["90 CENTRES"], { from: vD6.Y(-8) });
  s2 += note(vD6.X(-45), vD6.Y(-8), vD6.X(-58), vD6.Y(-14), "ROSETTE POST Ø16", "", "end");
  s2 += note(vD6.X(20), vD6.Y(26), vD6.X(40), vD6.Y(38), "SWAN-NECK BAIL", "POLISHED BRASS");

  // 7 — plinth profile 1:2
  s2 += heading(150, 130, "7 · PLINTH", "SECTION · SCALE 1:2", 40);
  const o7 = { x: 175, y: 152, s: 0.5 };
  s2 += `<g transform="translate(${o7.x} ${o7.y}) scale(${o7.s})" stroke="${INK}" stroke-width="0.7" stroke-linejoin="round">
    ${(() => { const d7 = `<path fill="url(#hatchDesk2)" d="M 15 0 L 60 0 L 60 ${K.plH} L 0 ${K.plH} L 0 22 C 0 16 6 16 8 12 C 10 8 15 8 15 0 Z"/>`; window.DK.capture("Plinth section", 1, d7); return d7; })()}
    <path fill="none" stroke-width="0.4" d="M 15 -40 L 15 0 M 60 -40 L 60 -5"/></g>`;
  s2 += note(o7.x + 3, o7.y + 6, o7.x - 10, o7.y - 2, "OGEE TOP MOULD", "", "end");
  s2 += chainH([o7.x, o7.x + 7.5], o7.y + K.plH * o7.s + 5, [K.plP], { from: o7.y + K.plH * o7.s + 1, size: 1.5 });
  s2 += chainV([o7.y, o7.y + K.plH * o7.s], o7.x + 36, [K.plH], { from: o7.x + 31, size: 1.5 });
  s2 += note(o7.x + 7.5, o7.y - 10, o7.x + 20, o7.y - 16, "PEDESTAL CARCASE ABOVE", "");

  // 8 — hollow corner: one centre, parallel curves, softened ends, column in the hollow. Plan 1:4
  s2 += heading(18, 205, "8 · CORNER — HOLLOW + END MOULDINGS", "PLAN · SCALE 1:4 · ALL FOUR CORNERS · CURVES SHARE ONE CENTRE", 90);
  const vD8 = view(62, 218, 4, "Corner plan"), tD8 = vD8.w(0.12), ext = 250, big = 4000, dsh = `${vD8.w(1)} ${vD8.w(0.6)}`;
  const gT = cornerPrims(SPEC), gC = cornerPrims(SPEC, K.ov), gP = cornerPrims(SPEC, K.ov - K.plP);
  let d8 = `<clipPath id="clipD8"><rect x="-20" y="-20" width="${ext + 20}" height="${ext + 20}"/></clipPath><g clip-path="url(#clipD8)">`;
  d8 += `<path d="${outlinePath(0, 0, big, big, SPEC)}"/>`;
  d8 += `<path stroke-width="${tD8}" d="${outlinePath(0, 0, big, big, SPEC, [1, 1, 1, 1], 6)}"/>`;
  d8 += `<path stroke-width="${tD8}" stroke-dasharray="${dsh}" d="${outlinePath(0, 0, big, big, SPEC, [1, 1, 1, 1], K.ov)}"/>`;
  d8 += `<path stroke-width="${tD8}" stroke-dasharray="${vD8.w(0.5)} ${vD8.w(0.8)}" d="${outlinePath(0, 0, big, big, SPEC, [1, 1, 1, 1], K.ov - K.plP)}"/>`;
  {
    const M = K.mould, prof = (c, t, n) => { const F = (u, w) => [c[0] + t[0] * u + n[0] * w, c[1] + t[1] * u + n[1] * w]; const pts = [F(-M.w / 2, 0), F(-M.w / 2, M.fillet), F(-M.bead, M.fillet)]; for (let k = 1; k < 10; k++) { const a = Math.PI * (1 - k / 10); pts.push(F(M.bead * Math.cos(a), M.fillet + M.bead * Math.sin(a))); } pts.push(F(M.bead, M.fillet), F(M.w / 2, M.fillet), F(M.w / 2, 0)); return pts; };
    [prof([MS, K.ov], [1, 0], [0, -1]), prof([K.ov, MS], [0, 1], [-1, 0])].forEach((pts) => { d8 += `<path fill="url(#hatchDesk2)" d="M ${pts.map((p) => `${f(p[0])} ${f(p[1])}`).join(" L ")} Z"/>`; });
    // console above (dashed, 38 × 24) and plinth block below (dotted, 34 × 16) at each strip
    d8 += `<g stroke-width="${tD8}"><rect x="${f(MS - 19)}" y="${K.ov - 24}" width="38" height="24" stroke-dasharray="${dsh}"/><rect x="${K.ov - 24}" y="${f(MS - 19)}" width="24" height="38" stroke-dasharray="${dsh}"/>
      <rect x="${f(MS - 17)}" y="${K.ov - 16}" width="34" height="16" stroke-dasharray="${vD8.w(0.4)} ${vD8.w(0.6)}"/><rect x="${K.ov - 16}" y="${f(MS - 17)}" width="16" height="34" stroke-dasharray="${vD8.w(0.4)} ${vD8.w(0.6)}"/></g>`;
  }
  d8 += `<g stroke-width="${tD8}" stroke-dasharray="${vD8.w(0.3)} ${vD8.w(0.5)}"><line x1="0" y1="0" x2="${f((SPEC.R + K.ov) * 0.707)}" y2="${f((SPEC.R + K.ov) * 0.707)}"/><line x1="${f(gT.u)}" y1="${SPEC.f}" x2="${f(gT.pts[2][0])}" y2="${f(gT.pts[2][1])}"/><line x1="${SPEC.f}" y1="${f(gT.u)}" x2="${f(gT.pts[1][0])}" y2="${f(gT.pts[1][1])}"/></g>`;
  d8 += `<circle cx="0" cy="0" r="2" fill="${INK}"/><circle cx="${f(gT.u)}" cy="${SPEC.f}" r="1.5" fill="${INK}"/><circle cx="${SPEC.f}" cy="${f(gT.u)}" r="1.5" fill="${INK}"/>`;
  d8 += `</g>`;
  s2 += vD8.g(d8, 0.35);
  s2 += note(vD8.X(0), vD8.Y(0), vD8.X(-8) - 3, vD8.Y(-12), "COMMON CENTRE", "ALL CURVES STRUCK FROM HERE", "end");
  s2 += note(vD8.X(SPEC.R * 0.707), vD8.Y(SPEC.R * 0.707), vD8.X(-8) - 3, vD8.Y(40), `TOP HOLLOW R${SPEC.R}`, "REEDED EDGE FOLLOWS", "end");
  s2 += note(vD8.X(gT.u - 4), vD8.Y(2), vD8.X(ext) + 4, vD8.Y(-12), `ROUND R${SPEC.f} AT EACH END`, "NO SHARP ARRIS — ALL LAYERS");
  s2 += note(vD8.X((SPEC.R + K.ov) * 0.9), vD8.Y((SPEC.R + K.ov) * 0.44), vD8.X(ext) + 4, vD8.Y(52), `FRIEZE + PEDESTAL R${SPEC.R + K.ov}`, "DASHED — PARALLEL, 30 IN FROM THE TOP");
  s2 += note(vD8.X(MS), vD8.Y(K.ov - K.mould.fillet - K.mould.bead), vD8.X(ext) + 4, vD8.Y(84), "MOULDING AT EACH END OF THE CURVE", `FILLET + BEAD + FILLET · ${K.mould.w} WIDE · ${K.mould.proj} PROUD`);
  s2 += note(vD8.X(K.ov - K.mould.fillet - K.mould.bead), vD8.Y(MS), vD8.X(-8) - 3, vD8.Y(MS + 10), "SAME ON THE END FACE", "CONSOLE ABOVE (DASHED), BLOCK BELOW", "end");
  s2 += note(vD8.X((SPEC.R + K.ov) * 0.72), vD8.Y((SPEC.R + K.ov) * 0.72), vD8.X(-8) - 3, vD8.Y(118), "CLEAN HOLLOW", "NOTHING IN THE MIDDLE", "end");
  s2 += note(vD8.X((SPEC.R + K.ov - K.plP) * 0.34), vD8.Y((SPEC.R + K.ov - K.plP) * 0.94), vD8.X(ext) + 4, vD8.Y(116), `PLINTH R${SPEC.R + K.ov - K.plP}`, "PROJECTS 15");
  s2 += chainH([vD8.X(0), vD8.X(K.ov), vD8.X(MS)], vD8.Y(ext) + 4, [K.ov, Math.round(MS - K.ov)], { from: vD8.Y(ext) + 1, size: 1.4 });

  // 8B — corner elevation, square-on: the hollow between its two end mouldings. 1:10 crop of the front.
  s2 += heading(212, 180, "8B · CORNER ELEVATION", "FRONT LEFT CORNER · SCALE 1:10", 60);
  {
    const s8 = 10, v8 = view(222, 196, s8, "Corner elevation"), t8 = v8.w(0.12), w8 = MS + 120;
    s2 += v8.g(`<clipPath id="clip8b"><rect x="-10" y="-5" width="${w8 + 10}" height="${K.H + 10}"/></clipPath><g clip-path="url(#clip8b)">${front(t8)}</g><line x1="-10" y1="${K.H}" x2="${w8}" y2="${K.H}" stroke-width="${v8.w(0.5)}"/>`, 0.3);
    const yC1 = K.top + K.conH + 10;
    s2 += note(v8.X(VC * 0.55), v8.Y(yR1 + 260), v8.X(w8) + 4, v8.Y(yR1 + 230), "CLEAN HOLLOW", "CURVES AWAY FROM YOU");
    s2 += note(v8.X(MS + 8), v8.Y(yR1 + 380), v8.X(w8) + 4, v8.Y(yR1 + 360), "MOULDING, SQUARE-ON", "CURVE STARTS HERE");
    s2 += note(v8.X(K.ov - K.mould.proj / 2), v8.Y(yR1 + 330), v8.X(-10) - 2, v8.Y(yR1 + 330), "MOULDING,", "EDGE-ON", "end");
    s2 += note(v8.X(MS), v8.Y(K.top + 80), v8.X(w8) + 4, v8.Y(K.top + 60), "CONSOLE", "34 WIDE");
    s2 += note(v8.X(MS + 14), v8.Y(yC1), v8.X(w8) + 4, v8.Y(yC1 - 30), "CARVED COLLAR", "TEAK");
    s2 += note(v8.X(MS + 16), v8.Y(yP - 30), v8.X(w8) + 4, v8.Y(yP - 30), "PLINTH BLOCK", "");
  }
  s2 += heading(300, 160, "NOTES", "DETAILS", 40);
  ["Profiles are drawn from film stills and are indicative;", "   the joiner to prepare a full-size mock-up of 1, 2 and 7.",
   "Carving (4, 5): carver to work from the reference photos;", "   sample one drop before carving the set.",
   "Hardware (6): standard 90 mm swan-neck, solid brass.", "Gold/brass on handles and ring pulls only; rest plain teak.", "Corners: clean R150 hollow, moulding at both ends (8, 8B).", "Cut a card template of the hollow to confirm."]
    .forEach((n, i) => { s2 += text(300, 171 + i * 4.3, n, { size: 1.6 }); });
  s2 += titleBlock({ title: "DESK — DETAILS", sub: "Edge · Rail · Console · Drop · Ornament · Handle · Plinth · Corner", date: K.date, rev: K.rev, dwg: "AST-DR-003" });

  // ═════════════ SHEET 3 — 3D VIEWS ═════════════
  window.DK.begin("desk-3d");
  let s3 = frame();
  s3 += heading(18, 17, "FROM THE FRONT RIGHT", "AXONOMETRIC · APPROX 1:14 · HIDDEN LINES REMOVED · SHADED", 80);
  const A = axo3d(24, 32, 14);
  s3 += A.svg;
  s3 += heading(250, 17, "FROM THE BACK LEFT", "AXONOMETRIC · APPROX 1:29 · IF FREE-STANDING", 70);
  s3 += axo3d(270, 32, 29, true).svg;
  // corner close-up: the same model at 1:4, windowed on the front-left corner
  s3 += heading(250, 128, "CORNER CLOSE-UP", "FRONT RIGHT · APPROX 1:4 · HOLLOW, ROUNDS, END MOULDINGS, CONSOLES", 70);
  {
    const sc = 4, full = render3d(sc, false);
    const cs = Math.cos(Math.PI / 6);
    const S3 = (x, y, z) => [(x + y) * cs / sc, ((x - y) * 0.5 - z) / sc];
    const win = { x: 252, y: 140, w: 158, h: 94 };
    const focus = S3(K.L - VC * 0.62, VC * 0.62, 560);
    const tx = win.x + 79 - focus[0], ty = win.y + 47 - focus[1];
    s3 += `<clipPath id="clip3d"><rect x="${win.x}" y="${win.y}" width="${win.w}" height="${win.h}"/></clipPath>`;
    s3 += `<g clip-path="url(#clip3d)"><g transform="translate(${f(tx)} ${f(ty)})">${full.svg}</g></g>`;
    s3 += `<rect x="${win.x}" y="${win.y}" width="${win.w}" height="${win.h}" fill="none" stroke="${INK}" stroke-width="0.25"/>`;
    const P3 = (x, y, z) => { const q = S3(x, y, z); return [tx + q[0], ty + q[1]]; };
    const g = cornerPrims(SPEC), M = K.mould, zCap = K.H - (K.top + K.conH);
    const lbl = (pt, x2, y2, t1, t2, anchor = "start") => { const q = P3(...pt); return note(q[0], q[1], x2, y2, t1, t2, anchor); };
    s3 += lbl([K.L - g.pts[2][0], g.pts[2][1], K.H - 30], win.x + win.w - 4, win.y + 8, `TOP HOLLOW R${SPEC.R}`, "REEDS RUN ROUND THE CURVE", "end");
    s3 += lbl([K.L - g.u, 0, K.H - 20], win.x + 4, win.y + 8, `ROUNDED END R${SPEC.f}`, "NO SHARP ARRIS");
    s3 += lbl([K.L - K.ov + M.proj, MS, 420], win.x + win.w - 4, win.y + 72, "MOULDING WHERE THE CURVE STARTS", "SIDE FACE — COLLARS + CARVED DROP", "end");
    s3 += lbl([K.L - MS, K.ov - M.proj, 440], win.x + 4, win.y + 72, "MOULDING WHERE THE CURVE STARTS", "FRONT FACE");
    s3 += lbl([K.L - MS, K.ov - 18, K.H - K.top - 70], win.x + 4, win.y + 50, "CONSOLE ABOVE EACH MOULDING", "3 REEDS");
    s3 += lbl([K.L - K.ov + M.proj + 3, MS, zCap - 22], win.x + win.w - 4, win.y + 52, "CARVED COLLAR", "TEAK", "end");
    { const gm = cornerPrims(SPEC, K.ov), a = Math.PI / 4, R0 = SPEC.R + K.ov; s3 += lbl([K.L - R0 * Math.cos(a), R0 * Math.sin(a), 380], win.x + win.w / 2, win.y + win.h - 6, "CLEAN HOLLOW — NOTHING IN THE MIDDLE", "", "middle"); }

  }
  s3 += heading(18, 214, "NOTES", "3D VIEWS", 30);
  ["Generated from the same geometry as the plan and elevations —", "   any change to sizes, hollows or mouldings updates every view.",
   "Carving and handles shown simplified; see AST-DR-003.", "Axonometric: measure along the three axes only."]
    .forEach((n, i) => { s3 += text(18, 225 + i * 4.3, n, { size: 1.6 }); });
  s3 += titleBlock({ title: "DESK — 3D VIEWS", sub: "Front right · Back left · Corner close-up", date: K.date, rev: K.rev, dwg: "AST-DR-004" });
  window.DRAWINGS["desk-3d"] = { title: "Desk — 3D views · AST-DR-004", svg: sheet(s3), params: DESK, model: false };

  window.DRAWINGS.desk = { title: "Desk — General arrangement · AST-DR-002", svg: sheet(s1), params: DESK };
  window.DRAWINGS["desk-details"] = { title: "Desk — Details · AST-DR-003", svg: sheet(s2), params: DESK };
})();
