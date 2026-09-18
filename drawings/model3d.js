// The room in three dimensions — a line drawing, not a render.
// Geometry is read from the same parameters as the 2D sheets, so the model and the drawings
// can never disagree. Walls that have been decided are drawn in full; the rest stay plain white.
//
// Hidden surfaces are handled the honest way for an interior: every wall is an opaque white
// plane, the near ones are culled, and what remains is painted back to front.

window.MODEL3D = (function () {
  const INK = "#1b1b1b", FAINT = "#b9b9b9", MID = "#8b8b8b", EMBER = "#cc6437";

  // ── the room, in millimetres. x along the study wall, y up, z away from it ──
  function room() {
    // These are script-level consts in the drawing files, not properties of window.
    const S = SHELL, W = WALL, R = RWALL, D = DOOR;
    const xR = S.wStudy, xLs = S.wStudy - S.wPreStep, xLb = S.wStudy - S.wBed;
    return { S, W, R, D, xR, xLs, xLb, L: S.lRight, H: S.H, yStep: S.yStep };
  }

  const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
  const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
  const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];

  // A face is a planar polygon with its own decoration, so its lines are never drawn
  // through a wall in front of it.
  const face = (poly, lines = [], o = {}) => ({ poly, lines, fill: o.fill || "#ffffff", edge: o.edge ?? INK, w: o.w ?? 1, bias: o.bias || 0 });

  // rectangle helpers on each plane
  const rz = (z, x0, y0, x1, y1) => [[x0, y0, z], [x1, y0, z], [x1, y1, z], [x0, y1, z]];
  const rx = (x, z0, y0, z1, y1) => [[x, y0, z0], [x, y0, z1], [x, y1, z1], [x, y1, z0]];
  const lz = (z, x0, y0, x1, y1) => [[x0, y0, z], [x1, y1, z]];
  const lx = (x, z0, y0, z1, y1) => [[x, y0, z0], [x, y1, z1]];
  const frameZ = (z, x0, y0, x1, y1) => [lz(z, x0, y0, x1, y0), lz(z, x1, y0, x1, y1), lz(z, x1, y1, x0, y1), lz(z, x0, y1, x0, y0)];
  const frameX = (x, z0, y0, z1, y1) => [lx(x, z0, y0, z1, y0), lx(x, z1, y0, z1, y1), lx(x, z1, y1, z0, y1), lx(x, z0, y1, z0, y0)];

  // ── the study wall: bookcase, pilasters, panel for a painting, window ──
  function studyWall(K) {
    const { W, xR } = K, B = W.base, BK = W.book, PL = W.pil;
    const yTop = B.h + B.top, out = [], line = [];
    const zoneW = W.win.arch + W.win.w + W.win.fromRight;
    const xZone = [xR - zoneW, xR], xP2 = [xZone[0] - PL.w, xZone[0]];
    const xP1 = [BK.w, BK.w + PL.w], xPanel = [xP1[1], xP2[0]];
    const win = [xZone[0] + W.win.arch, xZone[0] + W.win.arch + W.win.w];

    // the wall itself, with the window cut out of it
    out.push(face(rz(0, 0, 0, win[0], K.H)));
    out.push(face(rz(0, win[1], 0, xR, K.H)));
    out.push(face(rz(0, win[0], 0, win[1], W.win.sill)));
    out.push(face(rz(0, win[0], W.win.head, win[1], K.H)));
    // the window itself — a pale opening, lightly barred
    out.push(face(rz(0, win[0], W.win.sill, win[1], W.win.head),
      [lz(0, (win[0] + win[1]) / 2, W.win.sill, (win[0] + win[1]) / 2, W.win.head),
       lz(0, win[0], (W.win.sill + W.win.head) / 2, win[1], (W.win.sill + W.win.head) / 2)],
      { fill: "#f4f6f8", edge: MID }));

    // counter and cupboards across all three bays
    line.push(lz(0, 0, yTop, xR, yTop), lz(0, 0, B.h, xR, B.h));
    [[0, BK.w], [xPanel[0], xPanel[1]], [xZone[0], xR]].forEach(([a, b]) => {
      const m = (a + b) / 2;
      line.push(lz(0, m, 0, m, B.h));
      [[a + 40, m - 20], [m + 20, b - 40]].forEach(([p, q]) => line.push(...frameZ(0, p, 60, q, B.h - 60)));
    });
    // bookcase shelves
    BK.shelves.forEach((y) => line.push(lz(0, 40, y, BK.w - 40, y)));
    line.push(...frameZ(0, 40, yTop, BK.w - 40, W.band ? 2050 : 2000));
    // the centre panel, where a painting may hang
    line.push(...frameZ(0, xPanel[0] + W.panel.set, yTop + 220, xPanel[1] - W.panel.set, 2050));
    line.push(...frameZ(0, xPanel[0] + W.panel.set + 70, yTop + 290, xPanel[1] - W.panel.set - 70, 1980));
    // the two fluted pilasters
    [xP1, xP2].forEach(([a, b]) => {
      line.push(...frameZ(0, a, 0, b, K.H - 330));
      for (let i = 1; i < 5; i++) { const x = a + (b - a) * (i / 5); line.push(lz(0, x, yTop + 140, x, K.H - 460)); }
    });
    // entablature
    line.push(lz(0, 0, K.H - 330, xR, K.H - 330), lz(0, 0, K.H - 230, xR, K.H - 230), lz(0, 0, K.H - 90, xR, K.H - 90));
    out.push(face(rz(0, 0, 0, xR, K.H), line, { fill: "none", edge: INK, bias: 60 }));
    return out;
  }

  // ── the right wall: panel moulding, rail, the dressing door ──
  function rightWall(K) {
    const { R, xR, L } = K, D = R.door;
    const out = [], line = [];
    const aL = R.run - D.arch, aR = R.run + D.w + D.arch;
    const pw = (aL - R.study.w - R.stile * R.bays - R.edge) / R.bays;
    const yDado = R.dado.y + R.dado.h, yTall = K.H - R.tall.top;

    out.push(face(rx(xR, 0, 0, R.run, K.H)));
    out.push(face(rx(xR, R.run + D.w, 0, L, K.H)));
    out.push(face(rx(xR, R.run, D.h, R.run + D.w, K.H)));
    // the doorway — dark, because it goes somewhere
    out.push(face(rx(xR, R.run, 0, R.run + D.w, D.h), [], { fill: "#e6e3de", edge: INK }));

    line.push(lx(xR, 0, R.skirt.h, L, R.skirt.h));
    line.push(lx(xR, 0, R.dado.y, aL, R.dado.y), lx(xR, 0, yDado, aL, yDado));
    line.push(lx(xR, aR, R.dado.y, L, R.dado.y), lx(xR, aR, yDado, L, yDado));
    for (let i = 0; i < R.bays; i++) {
      const z0 = R.study.w + R.stile + i * (pw + R.stile), z1 = z0 + pw;
      line.push(...frameX(xR, z0, R.short.y0, z1, R.short.y1));
      line.push(...frameX(xR, z0, R.tall.y0, z1, yTall));
    }
    // the casing: frame, then the moulding over it
    line.push(...frameX(xR, R.run - D.arch / 2, 0, R.run + D.w + D.arch / 2, D.h + D.arch / 2));
    line.push(...frameX(xR, aL, 0, aR, D.h + D.arch));
    // the narrow panel past the door
    line.push(...frameX(xR, aR + R.edge, R.tall.y0, L - R.edge, yTall));
    line.push(...frameX(xR, aR + R.edge, R.short.y0, L - R.edge, R.short.y1));
    out.push(face(rx(xR, 0, 0, L, K.H), line, { fill: "none", edge: INK, bias: 60 }));
    return out;
  }

  // ── a door leaf, standing in its opening ──
  function leaf(K, o) {
    const D = K.D, bottomRail = D.H - D.topRail - D.upperH - D.lockRail - D.lowerH;
    const line = [], P = o.plane;                     // "x" or "z"
    const F = P === "x" ? frameX : frameZ, Lf = P === "x" ? lx : lz;
    const at = o.at, a = o.a, b = o.b, h = D.H;
    const pan = (y0, y1) => {
      line.push(...F(at, a + D.stile, y0, b - D.stile, y1));
      line.push(...F(at, a + D.stile + D.sticking, y0 + D.sticking, b - D.stile - D.sticking, y1 - D.sticking));
    };
    const yLock0 = h - D.topRail - D.upperH - D.lockRail, yLock1 = h - D.topRail - D.upperH;
    pan(yLock1, h - D.topRail);
    pan(bottomRail, yLock0);
    line.push(...F(at, a, 0, b, h));
    line.push(Lf(at, a, yLock0, b, yLock0), Lf(at, a, yLock1, b, yLock1));
    const knob = P === "x" ? [at, (yLock0 + yLock1) / 2, b - D.knobFromEdge] : [b - D.knobFromEdge, (yLock0 + yLock1) / 2, at];
    return [face(P === "x" ? rx(at, a, 0, b, h) : rz(at, a, 0, b, h), line, { fill: "#faf9f7", edge: INK }),
            face([], [[knob.slice(), knob.slice()]], { fill: "none", edge: EMBER, w: 3 })];
  }

  // ── everything else stays plain white ──
  function shell(K) {
    const { xR, xLs, xLb, L, H, yStep } = K, out = [];
    out.push(face([[xLs, 0, yStep], [xLb, 0, yStep], [xLb, 0, L], [xR, 0, L], [xR, 0, 0], [0, 0, 0]],
      [], { fill: "#f7f6f4", edge: FAINT }));                               // floor, wound to face up
    out.push(face([[0, H, 0], [xR, H, 0], [xR, H, L], [xLb, H, L], [xLb, H, yStep], [xLs, H, yStep]],
      [], { fill: "#ffffff", edge: FAINT }));                               // ceiling
    out.push(face([[0, 0, 0], [xLs, 0, yStep], [xLs, H, yStep], [0, H, 0]], [], { edge: MID }));   // left wall
    out.push(face([[xLb, 0, yStep], [xLb, 0, L], [xLb, H, L], [xLb, H, yStep]], [], { edge: MID }));
    out.push(face([[xLs, 0, yStep], [xLb, 0, yStep], [xLb, H, yStep], [xLs, H, yStep]], [], { edge: MID })); // the step
    out.push(face(rz(L, xLb, 0, xR, H), [], { edge: MID }));                // bed wall
    return out;
  }

  // Every face is turned to look into the room, so the walls between you and the room
  // cull themselves and you always see in. Winding by hand is too easy to get wrong.
  function faceInward(f, centre) {
    if (f.poly.length < 3) return f;
    const n = cross(sub(f.poly[1], f.poly[0]), sub(f.poly[2], f.poly[0]));
    const mid = f.poly.reduce((a, p) => [a[0] + p[0] / f.poly.length, a[1] + p[1] / f.poly.length, a[2] + p[2] / f.poly.length], [0, 0, 0]);
    if (dot(n, sub(centre, mid)) < 0) f.poly = [...f.poly].reverse();
    return f;
  }

  function build() {
    const K = room();
    const out = [...shell(K), ...studyWall(K), ...rightWall(K)];
    out.push(...leaf(K, { plane: "x", at: K.xR, a: K.R.run, b: K.R.run + K.R.door.w }));
    const centre = [K.xR / 2, K.H / 2, K.L / 2];
    out.forEach((f) => faceInward(f, centre));
    return { K, faces: out };
  }

  // ── projection ──
  function camPos(c) {
    const ce = Math.cos(c.el), se = Math.sin(c.el), sa = Math.sin(c.az), ca = Math.cos(c.az);
    return [c.t[0] - c.d * ce * sa, c.t[1] + c.d * se, c.t[2] - c.d * ce * ca];
  }
  function project(p, c, w, h) {
    const x = p[0] - c.t[0], y = p[1] - c.t[1], z = p[2] - c.t[2];
    const ca = Math.cos(c.az), sa = Math.sin(c.az), ce = Math.cos(c.el), se = Math.sin(c.el);
    const X = x * ca - z * sa, Zr = x * sa + z * ca;
    const Y = y * ce + Zr * se, Z = -y * se + Zr * ce;   // positive elevation lifts the camera
    const dz = Z + c.d;
    if (dz < 300) return null;
    const f = h * 1.15;
    return [w / 2 + (X * f) / dz, h / 2 - (Y * f) / dz, dz];
  }

  function mount(el) {
    const { K, faces } = build();
    const cv = document.createElement("canvas");
    cv.className = "m3d-canvas";
    el.appendChild(cv);
    const cam = { az: 2.36, el: 0.34, d: 11000, t: [K.xR / 2, K.H * 0.45, K.L / 2] };
    const HOME = { ...cam, t: [...cam.t] };
    let w = 0, h = 0;

    function draw() {
      const dpr = Math.min(devicePixelRatio || 1, 2);
      w = el.clientWidth; h = el.clientHeight;
      cv.width = w * dpr; cv.height = h * dpr; cv.style.width = w + "px"; cv.style.height = h + "px";
      const g = cv.getContext("2d");
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
      g.fillStyle = "#ffffff"; g.fillRect(0, 0, w, h);
      g.lineJoin = "round"; g.lineCap = "round";
      const eye = camPos(cam);

      const drawable = [];
      for (const f of faces) {
        let depth = 0, pts = null;
        if (f.poly.length >= 3) {
          const n = cross(sub(f.poly[1], f.poly[0]), sub(f.poly[2], f.poly[0]));
          if (dot(n, sub(eye, f.poly[0])) < 0) continue;            // a wall between us and the room
          pts = f.poly.map((p) => project(p, cam, w, h));
          if (pts.some((p) => !p)) continue;
          depth = pts.reduce((a, p) => a + p[2], 0) / pts.length;
        }
        const segs = [];
        for (const [a, b] of f.lines) {
          const pa = project(a, cam, w, h), pb = project(b, cam, w, h);
          if (pa && pb) { segs.push([pa, pb]); depth = depth || (pa[2] + pb[2]) / 2; }
        }
        if (!pts && !segs.length) continue;
        drawable.push({ f, pts, segs, depth: depth - f.bias });
      }
      drawable.sort((a, b) => b.depth - a.depth);

      // Surfaces first, back to front, so near walls hide what is behind them; then all the
      // line work, back to front. Keeping them apart stops a wall painting over its own
      // detail when it has been split around an opening.
      for (const d of drawable) {
        if (!d.pts || d.f.fill === "none") continue;
        g.beginPath(); d.pts.forEach((p, i) => (i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1]))); g.closePath();
        g.fillStyle = d.f.fill; g.fill();
        if (d.f.edge) { g.strokeStyle = d.f.edge; g.lineWidth = 1; g.stroke(); }
      }
      for (const d of drawable) {
        if (!d.segs.length) continue;
        g.strokeStyle = d.f.edge || INK; g.lineWidth = d.f.w || 1;
        g.beginPath();
        for (const [a, b] of d.segs) {
          if (a[0] === b[0] && a[1] === b[1]) { g.moveTo(a[0] - 2, a[1]); g.arc(a[0], a[1], 2.4, 0, 6.3); continue; }
          g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]);
        }
        g.stroke();
      }
    }

    // ── controls ──
    let drag = null;
    const clampEl = (v) => Math.max(-0.28, Math.min(1.32, v));
    cv.addEventListener("pointerdown", (e) => { drag = { x: e.clientX, y: e.clientY }; cv.setPointerCapture(e.pointerId); cv.style.cursor = "grabbing"; });
    cv.addEventListener("pointermove", (e) => {
      if (!drag) return;
      cam.az -= (e.clientX - drag.x) * 0.006;
      cam.el = clampEl(cam.el + (e.clientY - drag.y) * 0.005);
      drag = { x: e.clientX, y: e.clientY };
      draw();
    });
    const stop = () => { drag = null; cv.style.cursor = "grab"; };
    cv.addEventListener("pointerup", stop); cv.addEventListener("pointercancel", stop);
    cv.addEventListener("wheel", (e) => {
      e.preventDefault();
      cam.d = Math.max(1800, Math.min(26000, cam.d * (1 + Math.sign(e.deltaY) * 0.1)));
      draw();
    }, { passive: false });

    const VIEWS = {
      Corner: { az: 2.36, el: 0.34, d: 11000, t: [K.xR / 2, K.H * 0.45, K.L / 2] },
      Study: { az: 3.14, el: 0.13, d: 7600, t: [K.xR / 2, K.H * 0.44, 900] },
      "Right wall": { az: 1.57, el: 0.11, d: 8600, t: [K.xR, K.H * 0.44, K.L / 2] },
      Door: { az: 1.72, el: 0.06, d: 4300, t: [K.xR - 300, K.H * 0.42, K.R.run + 380] },
      Plan: { az: 3.14, el: 1.30, d: 12000, t: [K.xR / 2, 0, K.L / 2] },
    };
    const bar = document.createElement("div");
    bar.className = "m3d-bar";
    bar.innerHTML = Object.keys(VIEWS).map((k, i) => `<button class="${i ? "" : "on"}" data-v="${k}">${k}</button>`).join("");
    el.appendChild(bar);
    bar.addEventListener("click", (e) => {
      const b = e.target.closest("[data-v]"); if (!b) return;
      Object.assign(cam, VIEWS[b.dataset.v], { t: [...VIEWS[b.dataset.v].t] });
      bar.querySelectorAll("button").forEach((x) => x.classList.toggle("on", x === b));
      draw();
    });

    const hint = document.createElement("div");
    hint.className = "m3d-hint";
    hint.textContent = "Drag to turn · scroll to zoom";
    el.appendChild(hint);

    new ResizeObserver(() => draw()).observe(el);
    cv.style.cursor = "grab";
    draw();
    return { draw, cam, HOME };
  }

  return { mount, build };
})();
