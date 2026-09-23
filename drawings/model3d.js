// The room in three dimensions — the drawings themselves, stood up in space.
//
// Nothing here redraws the room. Each wall is the elevation already captured by its own CAD
// sheet, in real millimetres, mounted on a plane in the browser's own 3D. So the model carries
// every line the sheet does — mouldings, reeding, flutes, panel profiles, the door — and can
// never disagree with it. Walls face into the room and hide their backs, so whichever wall
// stands between you and the room removes itself and you always see in.

window.MODEL3D = (function () {
  const view = (sheet, name) => (window.CAD.views || []).find((v) => v.sheet === sheet && v.name === name);

  // Captured geometry carries its own hairlines and pattern fills, neither of which survive
  // being shrunk to this size. Strip both; line weight is set from the zoom instead.
  function clean(svg) {
    return String(svg)
      .replace(/\sstroke-width="[^"]*"/g, "")
      .replace(/fill="url\(#[^)]*\)"/g, 'fill="#efece6"')
      .replace(/\sclip-path="url\(#[^)]*\)"/g, "");
  }

  function planes() {
    const S = SHELL, R = RWALL, H = S.H, Wd = S.wStudy, L = R.run + R.door.w + R.ret;
    const B = BEDPLAN, G = window.PGEOM;
    const P = [];
    // the walls that are decided carry their own elevations, exactly as drawn
    P.push({ id: "study", w: Wd, h: H, tf: `translate3d(0px,0px,0px)`, art: view("studywall", "Wall elevation") });
    P.push({ id: "right", w: L, h: H, tf: `translate3d(${Wd}px,0px,0px) rotateY(-90deg)`, art: view("rightwall", "Right wall elevation") });
    // The left wall plane runs from the bed end back to the study end, so its elevation — drawn
    // the other way round — is flipped rather than redrawn.
    P.push({ id: "left", w: S.lLeft, h: H, tf: `translate3d(0px,0px,${L}px) rotateY(90deg)`, art: view("leftwall", "Left wall elevation"), mirror: true });
    P.push({ id: "bed", w: S.wBed, h: H, tf: `translate3d(${Wd}px,0px,${L}px) rotateY(180deg)`, plain: true });
    P.push({ id: "floor", w: Wd, h: L, tf: `translate3d(0px,${H}px,0px) rotateX(90deg)`, floor: true });

    // ── what stands in the room ──
    // A run of facets along a plan centreline. Each facet is a flat panel turned to follow the
    // line, so a curve is built the way it will really be made rather than faked.
    const run = (pts, h, z0, cls) => {
      for (let i = 0; i < pts.length - 1; i++) {
        const [x0, y0] = pts[i], [x1, y1] = pts[i + 1];
        const dx = x1 - x0, dz = y1 - y0, len = Math.hypot(dx, dz);
        if (len < 1) continue;
        const deg = (Math.atan2(-dz, dx) * 180) / Math.PI;
        P.push({ id: cls + i, w: len + 1, h, cls, tf: `translate3d(${x0}px,${H - z0 - h}px,${y0}px) rotateY(${deg}deg)` });
      }
    };
    const slab = (x0, z0, w, d, h) => {                       // a box: top, and the four sides
      P.push({ id: "t" + x0 + z0, w, h: d, cls: "solid", tf: `translate3d(${x0}px,${H - h}px,${z0}px) rotateX(90deg)` });
      P.push({ id: "s1" + x0 + z0, w, h, cls: "solid", tf: `translate3d(${x0}px,${H - h}px,${z0}px)` });
      P.push({ id: "s2" + x0 + z0, w, h, cls: "solid", tf: `translate3d(${x0 + w}px,${H - h}px,${z0}px) rotateY(180deg) translate3d(${-w}px,0px,${-d}px)` });
      P.push({ id: "s3" + x0 + z0, w: d, h, cls: "solid", tf: `translate3d(${x0}px,${H - h}px,${z0}px) rotateY(-90deg)` });
      P.push({ id: "s4" + x0 + z0, w: d, h, cls: "solid", tf: `translate3d(${x0 + w}px,${H - h}px,${z0}px) rotateY(-90deg)` });
    };

    if (B && G) {
      const xPR = Wd - B.gapR, xPL = xPR - B.width, xc = (xPL + xPR) / 2;
      const TH = Math.acos(1 - G.PROJ / G.R), half = B.width / 2 - G.R * Math.sin(TH);
      // the partition: plain glass, no leading — its pattern is not settled
      const part = [];
      // six facets to a curl: enough to read as a curve, few enough not to look like a fence
      for (let i = 6; i >= 0; i--) { const t = -Math.PI / 2 - TH * (i / 6); part.push([xc - half + G.R * Math.cos(t), S.yPart + G.R + G.R * Math.sin(t)]); }
      for (let i = 0; i <= 6; i++) { const t = -Math.PI / 2 + TH * (i / 6); part.push([xc + half + G.R * Math.cos(t), S.yPart + G.R + G.R * Math.sin(t)]); }
      run(part, H, 0, "glassbay");
      // the bed back: straight behind the bed, a curl at each end turning into the room
      const c = B.back.t / 2, r = B.back.rc, back = [[xPL + c, L - B.back.d]];
      for (let i = 0; i <= 4; i++) { const a = Math.PI - (Math.PI / 2) * (i / 4); back.push([xPL + c + r + r * Math.cos(a), L - c - r + r * Math.sin(a)]); }
      for (let i = 0; i <= 4; i++) { const a = Math.PI / 2 - (Math.PI / 2) * (i / 4); back.push([xPR - c - r + r * Math.cos(a), L - c - r + r * Math.sin(a)]); }
      back.push([xPR - c, L - B.back.d]);
      run(back, B.back.h, 0, "solid");
      // the bed, and a bedside ledge inside each curl
      const xBR = xPR - (B.width - B.bed.w) / 2, xBL = xBR - B.bed.w;
      slab(xBL, L - B.back.t - B.bed.l, B.bed.w, B.bed.l, B.bed.base + B.bed.matt);
      [[xPL + B.back.t + 5, xBL - B.ledge.gap], [xBR + B.ledge.gap, xPR - B.back.t - 5]]
        .forEach(([a, b]) => slab(a, L - B.back.d + 20, b - a, B.back.d - B.back.t - B.back.rc - 50, B.ledge.h));
    }
    return { P, Wd, H, L };
  }

  function mount(el) {
    const { P, Wd, H, L } = planes();
    el.innerHTML = "";
    const stage = document.createElement("div");
    stage.className = "m3d-stage";
    const scene = document.createElement("div");
    scene.className = "m3d-scene";
    stage.appendChild(scene);
    el.appendChild(stage);

    for (const p of P) {
      const d = document.createElement("div");
      d.className = "m3d-w" + (p.plain ? " plain" : "") + (p.floor ? " floor" : "") + (p.cls ? " " + p.cls : "");
      d.style.width = p.w + "px";
      d.style.height = p.h + "px";
      d.style.transform = p.tf;
      if (p.art) d.innerHTML = `<svg viewBox="0 0 ${p.w} ${p.h}" preserveAspectRatio="none"><g class="ink"${p.mirror ? ` transform="translate(${p.w},0) scale(-1,1)"` : ""}>${clean(p.art.svg)}</g></svg>`;
      if (p.over && p.over.art) {
        const o = document.createElement("div");
        o.className = "m3d-over";
        o.style.cssText = `left:${p.over.x}px;top:${p.over.y}px;width:${p.over.w}px;height:${p.over.h}px`;
        o.innerHTML = `<svg viewBox="${p.over.vb}" preserveAspectRatio="none"><g class="ink">${clean(p.over.art.svg)}</g></svg>`;
        d.appendChild(o);
      }
      scene.appendChild(d);
    }

    const R = RWALL, door = R.run + R.door.w / 2;
    const cam = { az: 40, el: 22, s: 1, t: [Wd / 2, H / 2, L / 2] };

    function apply() {
      const fit = Math.min(el.clientWidth / (Wd * 1.66), el.clientHeight / (H * 2.75));
      const s = cam.s * fit;
      scene.style.transform =
        `scale3d(${s},${s},${s}) rotateX(${-cam.el}deg) rotateY(${cam.az}deg) ` +
        `translate3d(${-cam.t[0]}px,${-cam.t[1]}px,${-cam.t[2]}px)`;
      // one screen pixel, expressed in the drawing's own millimetres
      scene.style.setProperty("--sw", (0.8 / s).toFixed(2));
    }

    let drag = null;
    stage.addEventListener("pointerdown", (e) => { drag = { x: e.clientX, y: e.clientY }; stage.setPointerCapture(e.pointerId); stage.style.cursor = "grabbing"; });
    stage.addEventListener("pointermove", (e) => {
      if (!drag) return;
      cam.az += (e.clientX - drag.x) * 0.35;
      cam.el = Math.max(-12, Math.min(84, cam.el + (e.clientY - drag.y) * 0.3));
      drag = { x: e.clientX, y: e.clientY };
      apply();
    });
    const stop = () => { drag = null; stage.style.cursor = "grab"; };
    stage.addEventListener("pointerup", stop);
    stage.addEventListener("pointercancel", stop);
    stage.addEventListener("wheel", (e) => {
      e.preventDefault();
      cam.s = Math.max(0.45, Math.min(9, cam.s * (1 - Math.sign(e.deltaY) * 0.12)));
      apply();
    }, { passive: false });

    // Each view aims somewhere as well as looking from somewhere.
    const VIEWS = {
      Corner: { az: 40, el: 22, s: 1, t: [Wd / 2, H / 2, L / 2] },
      Study: { az: 1, el: 5, s: 1.5, t: [Wd / 2, H * 0.52, 700] },
      "Right wall": { az: 88, el: 4, s: 1.15, t: [Wd * 0.94, H * 0.52, L / 2] },
      Door: { az: 80, el: 2, s: 3.1, t: [Wd * 0.96, H * 0.5, door] },
      Window: { az: 14, el: 4, s: 2.6, t: [Wd - 610, H * 0.55, 500] },
      Plan: { az: 0, el: 84, s: 0.9, t: [Wd / 2, H / 2, L / 2] },
    };
    const bar = document.createElement("div");
    bar.className = "m3d-bar";
    bar.innerHTML = Object.keys(VIEWS).map((k, i) => `<button class="${i ? "" : "on"}" data-v="${k}">${k}</button>`).join("");
    el.appendChild(bar);
    bar.addEventListener("click", (e) => {
      const b = e.target.closest("[data-v]"); if (!b) return;
      Object.assign(cam, VIEWS[b.dataset.v], { t: [...VIEWS[b.dataset.v].t] });
      bar.querySelectorAll("button").forEach((x) => x.classList.toggle("on", x === b));
      apply();
    });

    const hint = document.createElement("div");
    hint.className = "m3d-hint";
    hint.textContent = "Drag to turn · scroll to zoom";
    el.appendChild(hint);

    new ResizeObserver(apply).observe(el);
    stage.style.cursor = "grab";
    apply();
    return { apply, cam };
  }

  return { mount, planes };
})();
