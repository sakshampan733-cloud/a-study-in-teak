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

  // The floor carries the setting-out, so the room can be read at a glance instead of guessed at.
  // Drawn in room coordinates: x across, y along from the study wall — which is exactly how the
  // floor plane is laid out, so no transform is needed.
  // What stands in the room, as decided on 1 Oct — the same numbers as the plan (drawings/suite2d.js): the glass-block
  // partition on the old centre line, turning towards the bed only; the desk (square corners) 2 in off it; the bed
  // with its rug; no curved bed back (its design is still open).
  function layout(L) {
    const cx = 2337, yP = L - 3353, pT = 95, RUN = 2400, straight = 600, pR = 1300;
    const pAt = (u, w) => {
      if (Math.abs(u) <= straight) return [cx + u, yP + w];
      const sg = Math.sign(u), th = (Math.abs(u) - straight) / pR;
      return [cx + sg * (straight + pR * Math.sin(th)) - sg * w * Math.sin(th), yP + pR * (1 - Math.cos(th)) + w * Math.cos(th)];
    };
    // the bed in the bed-wall niche (AST-DR-034/035): no headboard — the frame 1 in off the plaster, 2 in past the mattress
    const drF = pT / 2 + 5 + 400, bed = { w: 1929, l: 2108 }, bedHead = L - 45, bedFoot = bedHead - bed.l;   // headboard + base (AST-DR-035 rev 4)
    const desk = { L: 2286, D: 914, H: 750 }; desk.back = yP - pT / 2 - 50; desk.front = desk.back - desk.D;
    return { cx, yP, pT, RUN, pAt, drF, bed, bedFoot, bedHead, desk };
  }

  function floorDims(S, Wd, L) {
    const Y = layout(L);
    const FR = ["", "\u215b", "\u00bc", "\u215c", "\u00bd", "\u215d", "\u00be", "\u215e"];
    const ft = (mm) => { const e = Math.round(mm / 25.4 * 8), F = Math.floor(e / 96), i = Math.floor((e - F * 96) / 8), r = e % 8;
      return (F ? F + "'" : "") + i + FR[r] + '"'; };
    const T = 150, RED = "#b3261e";
    let o = `<g stroke="${RED}" fill="none" stroke-width="16">`;
    const tick = (x, y, vert) => vert ? `<path d="M ${x - 55} ${y} L ${x + 55} ${y}"/>` : `<path d="M ${x} ${y - 55} L ${x} ${y + 55}"/>`;
    // a run along the room (vertical on this plane)
    const runV = (x, y0, y1, label) => `<path d="M ${x} ${y0} L ${x} ${y1}"/>` + tick(x, y0, 1) + tick(x, y1, 1)
      + `<text x="${x + 80}" y="${(y0 + y1) / 2 + T * 0.36}" font-size="${T}" fill="${RED}" stroke="none" font-family="Helvetica" font-weight="700">${label}</text>`;
    // a run across the room (horizontal on this plane)
    const runH = (y, x0, x1, label) => `<path d="M ${x0} ${y} L ${x1} ${y}"/>` + tick(x0, y, 0) + tick(x1, y, 0)
      + `<text x="${(x0 + x1) / 2}" y="${y - 70}" font-size="${T}" fill="${RED}" stroke="none" text-anchor="middle" font-family="Helvetica" font-weight="700">${label}</text>`;
    const yPart = Y.yP, face = Y.yP + Y.drF;
    const bedFoot = Y.bedFoot, bedHead = Y.bedHead;
    const cup = 280, dD = Y.desk.D, dBack = Y.desk.back;
    // along the room, down the left-hand side
    o += runV(330, 0, yPart, ft(yPart) + "  STUDY SIDE");
    o += runV(330, yPart, L, ft(L - yPart) + "  BED SIDE");
    // what the study side is holding
    o += runV(1130, 0, cup, ft(cup));
    o += runV(1130, cup, dBack - dD, ft(dBack - dD - cup) + "  CHAIR");
    o += runV(1130, dBack - dD, dBack, ft(dD) + "  DESK");
    // and the bed side, from the drawers' front
    o += runV(Wd - 520, face, bedFoot, ft(bedFoot - face) + "  WALKWAY");
    o += runV(Wd - 520, bedFoot, bedHead, ft(Y.bed.l) + "  BED");
    o += runH(260, 0, Wd, ft(Wd) + " WIDE");
    const xBL = Y.cx - Y.bed.w / 2, xBR = Y.cx + Y.bed.w / 2;
    o += runH(bedFoot + 420, 0, xBL, ft(xBL) + "+");
    o += runH(bedFoot + 420, xBL, xBR, ft(Y.bed.w) + " BED");
    o += runH(bedFoot + 420, xBR, Wd, ft(Wd - xBR));
    return o + "</g>";
  }

  function planes() {
    const S = SHELL, R = RWALL, H = S.H, Wd = S.wStudy, L = R.run + R.door.w + R.ret;
    const P = [];
    // the walls that are decided carry their own elevations, exactly as drawn
    P.push({ id: "study", w: Wd, h: H, tf: `translate3d(0px,0px,0px)`, art: view("studywall", "Wall elevation") });
    P.push({ id: "right", w: L, h: H, tf: `translate3d(${Wd}px,0px,0px) rotateY(-90deg)`, art: view("rightwall", "Right wall elevation") });
    // The left wall plane runs from the bed end back to the study end, so its elevation — drawn
    // the other way round — is flipped rather than redrawn.
    P.push({ id: "left", w: S.lLeft, h: H, tf: `translate3d(0px,0px,${L}px) rotateY(90deg)`, art: view("leftwall", "Left wall elevation"), mirror: true });
    P.push({ id: "bed", w: S.wBed, h: H, tf: `translate3d(${Wd}px,0px,${L}px) rotateY(180deg)`, art: view("bedwall", "Bed wall face") });   // AST-DR-034, the wall alone
    P.push({ id: "floor", w: Wd, h: L, tf: `translate3d(0px,${H}px,0px) rotateX(90deg)`, floor: true,
      art: { svg: floorDims(S, Wd, L) } });

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
      P.push({ id: "s2" + x0 + z0, w, h, cls: "solid", tf: `translate3d(${x0 + w}px,${H - h}px,${z0 + d}px) rotateY(180deg)` });
      P.push({ id: "s3" + x0 + z0, w: d, h, cls: "solid", tf: `translate3d(${x0}px,${H - h}px,${z0}px) rotateY(-90deg)` });
      P.push({ id: "s4" + x0 + z0, w: d, h, cls: "solid", tf: `translate3d(${x0 + w}px,${H - h}px,${z0}px) rotateY(-90deg)` });
    };

    {
      const Y = layout(L), { cx, pAt, RUN, pT } = Y;
      const path = (w, n = 16) => Array.from({ length: n + 1 }, (_, i) => pAt(-RUN / 2 + RUN * i / n, w));
      run(path(0), H, 0, "glassbay");                                         // the glass blocks, floor to ceiling
      slab(cx - 145, Y.yP - pT / 2, 290, pT, H);                              // the wood column, a foot wide
      P.push({ id: "tv", w: 1227, h: 706, cls: "tvpanel", tf: `translate3d(${cx - 613}px,${H - 1408}px,${Y.yP + pT / 2 + 61}px)` });   // the TV, floating
      { const TG = window.TVGEOM, ol = TG.outline(0), n = ol.length;        // the TV unit (AST-DR-036): its pill-shaped front
        run(ol.slice(n - 29).concat(ol.slice(0, 29)).map(([x, y]) => [cx + x, Y.yP + y]), 450, 0, "solid");
        slab(cx - TG.X1, Y.yP + TG.W0, 2 * TG.X1, TG.YF - TG.W0, 450); }       // and its top across the straight front
      slab(cx - Y.desk.L / 2, Y.desk.front, Y.desk.L, Y.desk.D, Y.desk.H);   // the desk, square corners, 2 in off the glass
      slab(cx - Y.bed.w / 2, Y.bedFoot, Y.bed.w, Y.bed.l - 76, 534);         // the bed: storage base to the floor, and the mattress
      slab(cx - Y.bed.w / 2, Y.bedHead - 76, Y.bed.w, 76, 1016);             // the headboard, 3 ft 4 in
      [cx - Y.bed.w / 2 - 254, cx + Y.bed.w / 2 + 254].forEach((t) => slab(t - 203, L - 376, 406, 356, 610));   // side tables, inside the 15 in niche
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
