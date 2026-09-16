// Hidden-line axonometric renderer.
// Solids are vertical prisms (a plan ring extruded from z0 to z1); mouldings are built by stacking prisms
// with stepped offsets. Output is plain vector lines with hidden parts removed geometrically, plus
// shade hatching on faces turned away from the light — so the same result works in SVG and in DXF.
window.ISO = (function () {
  const C = Math.cos(Math.PI / 6), S = 0.5, V = [1, -1, 1];
  const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  const proj = (p) => [(p[0] + p[1]) * C, (p[0] - p[1]) * S - p[2]];
  const depth = (p) => p[0] - p[1] + p[2];
  const r2 = (n) => +n.toFixed(2);
  // Light from the viewer's upper left.
  const LIGHT = (() => { const l = [-0.62, -0.1, 0.78], m = Math.hypot(...l); return l.map((v) => v / m); })();

  const ringArea = (r) => r.reduce((a, p, i) => { const q = r[(i + 1) % r.length]; return a + p[0] * q[1] - q[0] * p[1]; }, 0) / 2;
  function inside(poly, pt) {
    let c = false;
    for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
      const a = poly[i], b = poly[j];
      if ((a[1] > pt[1]) !== (b[1] > pt[1]) && pt[0] < ((b[0] - a[0]) * (pt[1] - a[1])) / (b[1] - a[1]) + a[0]) c = !c;
    }
    return c;
  }
  function distToEdges(poly, pt) {
    let m = Infinity;
    for (let i = 0; i < poly.length; i++) {
      const a = poly[i], b = poly[(i + 1) % poly.length], ex = b[0] - a[0], ey = b[1] - a[1];
      const t = Math.max(0, Math.min(1, ((pt[0] - a[0]) * ex + (pt[1] - a[1]) * ey) / (ex * ex + ey * ey || 1)));
      m = Math.min(m, Math.hypot(pt[0] - a[0] - t * ex, pt[1] - a[1] - t * ey));
    }
    return m;
  }
  const bbox = (pts) => pts.reduce((b, p) => [Math.min(b[0], p[0]), Math.min(b[1], p[1]), Math.max(b[2], p[0]), Math.max(b[3], p[1])], [Infinity, Infinity, -Infinity, -Infinity]);
  const overlap = (a, b) => a[0] < b[2] && b[0] < a[2] && a[1] < b[3] && b[1] < a[3];

  // Uniform grid for broad-phase queries on screen bounding boxes.
  function grid(items, cell) {
    const map = new Map();
    const keys = (bb) => { const out = []; for (let i = Math.floor(bb[0] / cell); i <= Math.floor(bb[2] / cell); i++) for (let j = Math.floor(bb[1] / cell); j <= Math.floor(bb[3] / cell); j++) out.push(i + "," + j); return out; };
    const add = (idx) => keys(items[idx].bb).forEach((k) => { if (!map.has(k)) map.set(k, []); map.get(k).push(idx); });
    const query = (bb) => { const s = new Set(); keys(bb).forEach((k) => (map.get(k) || []).forEach((i) => s.add(i))); return s; };
    return { add, query };
  }

  // Faces in world space. Decals (polylines lying on a face plane) attach to the face they sit on.
  function build(solids, decals) {
    const faces = [];
    solids.forEach((s) => {
      const n = s.ring.length, o = ringArea(s.ring) > 0 ? 1 : -1, side = [];
      for (let i = 0; i < n; i++) {
        const a = s.ring[i], b = s.ring[(i + 1) % n], ex = b[0] - a[0], ey = b[1] - a[1], L = Math.hypot(ex, ey) || 1;
        side.push({ kind: "side", i, a, b, z0: s.z0, z1: s.z1, n: o > 0 ? [ey / L, -ex / L, 0] : [-ey / L, ex / L, 0],
          curved: s.curved && s.curved[i], rings: s.rings || [], flutes: s.flutes, hatch: s.hatch !== false, decals: [] });
      }
      side.forEach((f, i) => { f.prev = side[(i - 1 + n) % n]; f.next = side[(i + 1) % n]; });
      faces.push(...side, { kind: "cap", ring: s.ring, z: s.z1, n: [0, 0, 1], occ: s.capOcc !== false, decals: [] });
    });
    decals.forEach((d) => {
      const m = d.pts.reduce((acc, p) => [acc[0] + p[0] / d.pts.length, acc[1] + p[1] / d.pts.length, acc[2] + p[2] / d.pts.length], [0, 0, 0]);
      let best = null, bestDist = 1.5;
      faces.forEach((f) => {
        if (dot(f.n, d.n) < 0.99) return;
        if (f.kind === "cap") { const dz = Math.abs(m[2] - f.z); if (dz < bestDist && inside(f.ring, m)) { best = f; bestDist = dz; } return; }
        const ex = f.b[0] - f.a[0], ey = f.b[1] - f.a[1], t = ((m[0] - f.a[0]) * ex + (m[1] - f.a[1]) * ey) / (ex * ex + ey * ey);
        const dist = Math.abs((m[0] - f.a[0]) * f.n[0] + (m[1] - f.a[1]) * f.n[1]);
        if (dist < bestDist && t > -0.001 && t < 1.001 && m[2] > f.z0 - 0.5 && m[2] < f.z1 + 0.5) { best = f; bestDist = dist; }
      });
      if (best) best.decals.push(d);
    });
    return faces;
  }

  // flip = view from the opposite corner (rotate 180° about the vertical axis within an L × D footprint).
  function render(model, o) {
    const { scale, flip = false, L = 0, D = 0, eps = 0.4, hatch = true } = o;
    const T = (p) => (flip ? [L - p[0], D - p[1], p[2]] : p);
    const TN = (n) => (flip ? [-n[0], -n[1], n[2]] : n);
    const vis = (f) => dot(TN(f.n), V) > 1e-9;
    const seg = (p, q, w) => { const a = T(p), b = T(q); return [proj(a), proj(b), w, depth(a), depth(b)]; };
    const items = [];

    model.faces.forEach((f) => {
      if (!vis(f)) return;
      let pts3; const st = [];
      const nv = TN(f.n);
      if (f.kind === "side") {
        const A0 = [f.a[0], f.a[1], f.z0], B0 = [f.b[0], f.b[1], f.z0], B1 = [f.b[0], f.b[1], f.z1], A1 = [f.a[0], f.a[1], f.z1];
        pts3 = [A0, B0, B1, A1];
        st.push(seg(A0, B0, 1), seg(A1, B1, 1));
        f.rings.forEach((z) => st.push(seg([f.a[0], f.a[1], z], [f.b[0], f.b[1], z], 0)));
        if (!vis(f.prev)) st.push(seg(A0, A1, 2));
        if (!vis(f.next)) st.push(seg(B0, B1, 2));
        else if (dot(f.n, f.next.n) < Math.cos((20 * Math.PI) / 180)) st.push(seg(B0, B1, 1));
        else if (f.flutes) st.push(seg(B0, B1, 0));
        else if (f.curved && f.i % 3 === 0) st.push(seg(B0, B1, 3));
        // shade hatching on faces turned from the light
        const shade = dot(nv, LIGHT);
        if (hatch && f.hatch && !f.curved && shade < 0) {
          const len = Math.hypot(f.b[0] - f.a[0], f.b[1] - f.a[1]), step = shade < -0.3 ? 8 : shade < -0.1 ? 12 : 20;
          const k = Math.max(0, Math.floor(len / step));
          if (k === 0 && shade < -0.3 && f.i % 2 === 0) { const t = 0.5; st.push(seg([f.a[0] + (f.b[0] - f.a[0]) * t, f.a[1] + (f.b[1] - f.a[1]) * t, f.z0], [f.a[0] + (f.b[0] - f.a[0]) * t, f.a[1] + (f.b[1] - f.a[1]) * t, f.z1], 4)); }
          for (let i = 1; i <= k; i++) { const t = i / (k + 1); st.push(seg([f.a[0] + (f.b[0] - f.a[0]) * t, f.a[1] + (f.b[1] - f.a[1]) * t, f.z0], [f.a[0] + (f.b[0] - f.a[0]) * t, f.a[1] + (f.b[1] - f.a[1]) * t, f.z1], 4)); }
        }
      } else {
        pts3 = f.ring.map((p) => [p[0], p[1], f.z]);
        pts3.forEach((p, i) => st.push(seg(p, pts3[(i + 1) % pts3.length], 1)));
      }
      f.decals.forEach((d) => { const k = d.pts.length; for (let i = 0; i < (d.closed ? k : k - 1); i++) st.push(seg(d.pts[i], d.pts[(i + 1) % k], d.w ?? 0)); });
      const vp = pts3.map(T), poly = vp.map(proj);
      items.push({ poly, bb: bbox(poly), n: nv, d: dot(nv, vp[0]), cd: vp.reduce((a, p) => a + depth(p), 0) / vp.length, strokes: st, occ: f.kind === "cap" ? f.occ : true });
    });

    // Beads: either on a round column's generator facing the viewer, or at a fixed point standing off a face.
    (model.beads || []).forEach((b) => {
      let p;
      if (b.c) { const c = T([b.c[0], b.c[1], b.z]); p = [c[0] + b.colR * Math.SQRT1_2, c[1] - b.colR * Math.SQRT1_2, b.z]; }
      else { if (b.n && dot(TN(b.n), V) <= 0) return; p = T(b.p); }
      const sc = proj(p), rx = b.r, ry = b.r * (b.ry || 1);
      const poly = Array.from({ length: 12 }, (_, i) => { const t = (i / 12) * 2 * Math.PI; return [sc[0] + Math.cos(t) * rx, sc[1] + Math.sin(t) * ry]; });
      const dp = depth(p) + 1, st = poly.map((q, i) => [q, poly[(i + 1) % poly.length], 0, dp, dp]);
      if (b.r > 4) st.push([[sc[0] - rx * 0.35, sc[1] - ry * 0.45], [sc[0] + rx * 0.1, sc[1] - ry * 0.55], 3, dp, dp]);
      items.push({ poly, bb: bbox(poly), n: null, cd: dp, strokes: st, occ: true });
    });
    // Free 3D polylines (handles, ring pulls standing off a face).
    (model.lines || []).forEach((l) => {
      if (l.n && dot(TN(l.n), V) <= 0) return;
      const vp = l.pts.map(T), sp = vp.map(proj);
      const st = []; for (let i = 0; i < (l.closed ? sp.length : sp.length - 1); i++) { const j = (i + 1) % sp.length; st.push([sp[i], sp[j], l.w ?? 1, depth(vp[i]), depth(vp[j])]); }
      items.push({ poly: null, bb: bbox(sp), n: null, cd: 0, strokes: st, occ: false });
    });

    // Hidden-line removal by exact depth: a piece of a line is hidden where it falls inside another face's
    // outline AND that face is nearer at that very point. No global ordering, so interpenetrating parts are fine.
    const depthAt = (it, pt) => {
      if (!it.n) return it.cd;
      const a = pt[0] / C, bb = pt[1] / S, p0 = [(a + bb) / 2, (a - bb) / 2, 0], nv = dot(it.n, V);
      if (Math.abs(nv) < 1e-9) return -Infinity;
      const t = (it.d - dot(it.n, p0)) / nv;
      return depth([p0[0] + t * V[0], p0[1] + t * V[1], p0[2] + t * V[2]]);
    };
    const span = items.reduce((b, it) => [Math.min(b[0], it.bb[0]), Math.min(b[1], it.bb[1]), Math.max(b[2], it.bb[2]), Math.max(b[3], it.bb[3])], [Infinity, Infinity, -Infinity, -Infinity]);
    const cell = Math.max(span[2] - span[0], span[3] - span[1]) / 70 || 1;
    const OG = grid(items, cell);
    items.forEach((it, idx) => { if (it.poly && it.occ) OG.add(idx); });
    const out = { 0: [], 1: [], 2: [], 3: [], 4: [] }, TOL = 0.6;
    const cross = (a, b) => a[0] * b[1] - a[1] * b[0];
    items.forEach((it, idx) => {
      it.strokes.forEach(([p, q, w, dp, dq]) => {
        const sb = bbox([p, q]), hidden = [], r = [q[0] - p[0], q[1] - p[1]];
        OG.query([sb[0] - eps, sb[1] - eps, sb[2] + eps, sb[3] + eps]).forEach((oi) => {
          if (oi === idx) return;
          const oc = items[oi];
          if (!overlap([sb[0] - eps, sb[1] - eps, sb[2] + eps, sb[3] + eps], oc.bb)) return;
          const ts = [0, 1];
          for (let e = 0; e < oc.poly.length; e++) {
            const a = oc.poly[e], b = oc.poly[(e + 1) % oc.poly.length], sv = [b[0] - a[0], b[1] - a[1]], den = cross(r, sv);
            if (Math.abs(den) < 1e-12) continue;
            const ap = [a[0] - p[0], a[1] - p[1]], t = cross(ap, sv) / den, u = cross(ap, r) / den;
            if (t > 0 && t < 1 && u >= 0 && u <= 1) ts.push(t);
          }
          ts.sort((x, y) => x - y);
          for (let k = 0; k < ts.length - 1; k++) {
            if (ts[k + 1] - ts[k] < 1e-9) continue;
            const t = (ts[k] + ts[k + 1]) / 2, m = [p[0] + r[0] * t, p[1] + r[1] * t];
            if (!inside(oc.poly, m) || distToEdges(oc.poly, m) <= eps) continue;
            if (depthAt(oc, m) > dp + (dq - dp) * t + TOL) hidden.push([ts[k], ts[k + 1]]);
          }
        });
        hidden.sort((a, b) => a[0] - b[0]);
        let t = 0;
        const emit = (t0, t1) => { if ((t1 - t0) * Math.hypot(r[0], r[1]) > 0.05) out[w].push([p[0] + r[0] * t0, p[1] + r[1] * t0, p[0] + r[0] * t1, p[1] + r[1] * t1]); };
        hidden.forEach(([h0, h1]) => { if (h0 > t) emit(t, h0); t = Math.max(t, h1); });
        if (t < 1) emit(t, 1);
      });
    });

    const all = [].concat(...Object.values(out));
    const bb = all.reduce((b, s) => [Math.min(b[0], s[0], s[2]), Math.min(b[1], s[1], s[3]), Math.max(b[2], s[0], s[2]), Math.max(b[3], s[1], s[3])], [Infinity, Infinity, -Infinity, -Infinity]);
    const sw = o.lineScale || 1;
    const style = {
      0: `stroke="#1b1b1b" stroke-width="${r2(0.09 * sw)}"`, 1: `stroke="#1b1b1b" stroke-width="${r2(0.2 * sw)}"`, 2: `stroke="#111" stroke-width="${r2(0.38 * sw)}"`,
      3: `stroke="#8c8c8c" stroke-width="${r2(0.07 * sw)}"`, 4: `stroke="#6f6f6f" stroke-width="${r2(0.06 * sw)}"`,
    };
    const svg = Object.entries(out).map(([w, segs]) =>
      `<g ${style[w]} fill="none" stroke-linecap="round">${segs.map((s) => `<line x1="${r2(s[0] / scale)}" y1="${r2(s[1] / scale)}" x2="${r2(s[2] / scale)}" y2="${r2(s[3] / scale)}"/>`).join("")}</g>`).join("");
    return { svg, bbox: bb.map((v) => v / scale) };
  }

  return { build, render, proj };
})();
