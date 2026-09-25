// The dressing room in three dimensions — the same first-pass shape as AST-DR-023, stood up.
// Plain walls (nothing is built yet to draw as elevations); the floor carries the same dimensions
// as the plan. Wardrobe runs and the hidden door are blocked in as solids so the layout reads at a
// glance. Everything here is exactly as provisional as the plan it comes from — see its notes.

window.DRESSING3D = (function () {
  // Walls are drawn to the plain 9 ft 1 in sides, CONFIRMED, same height as the main room. The domed
  // centre (10 ft 0 in) is not modelled here — its profile isn't settled yet (see AST-DR-023's notes);
  // a floating label marks where it would rise instead of guessing a curve.
  const H = (window.DRESS && window.DRESS.hSide) || 2769;
  const DOME_H = (window.DRESS && window.DRESS.hDome) || 3048;

  function floorPlan() {
    const K = window.DRESS; if (!K) return "";
    const RED = "#b3261e", T = 150;
    const FR = ["", "⅛", "¼", "⅜", "½", "⅝", "¾", "⅞"];
    const ft = (mm) => { const e = Math.round(mm / 25.4 * 8), F = Math.floor(e / 96), i = Math.floor((e - F * 96) / 8), r = e % 8;
      return (F ? F + "'" : "") + i + FR[r] + '"'; };
    const tick = (x, y, vert) => vert ? `<path d="M ${x - 55} ${y} L ${x + 55} ${y}"/>` : `<path d="M ${x} ${y - 55} L ${x} ${y + 55}"/>`;
    const runH = (y, x0, x1, label) => `<path d="M ${x0} ${y} L ${x1} ${y}"/>` + tick(x0, y, 0) + tick(x1, y, 0)
      + `<text x="${(x0 + x1) / 2}" y="${y - 70}" font-size="${T}" fill="${RED}" stroke="none" text-anchor="middle" font-family="Helvetica" font-weight="700">${label}</text>`;
    const runV = (x, y0, y1, label) => `<path d="M ${x} ${y0} L ${x} ${y1}"/>` + tick(x, y0, 1) + tick(x, y1, 1)
      + `<text x="${x + 80}" y="${(y0 + y1) / 2}" font-size="${T}" fill="${RED}" stroke="none" font-family="Helvetica" font-weight="700">${label}</text>`;
    return `<g stroke="${RED}" fill="none" stroke-width="16">` +
      runH(-260, 0, K.w, ft(K.w) + " — SHARED WALL") +
      runV(K.w + 260, 0, K.d, ft(K.d) + " DEEP (ASSUMED)") +
      `</g>`;
  }

  function build() {
    const K = window.DRESS || { w: 2819, d: 3048, t: 115, bath: { w: 762 }, wd: { w: 914, d: 711 }, tun: { w: 1067, l: 2337 }, hWd: 2743 };
    const W = K.w, D = K.d, P = [];
    // four plain walls, open top (no ceiling, so the camera can look in and down)
    P.push({ id: "front", w: W, h: H, cls: "plain", tf: `translate3d(0px,0px,0px)` });
    P.push({ id: "back", w: W, h: H, cls: "plain", tf: `translate3d(${W}px,0px,${D}px) rotateY(180deg)` });
    P.push({ id: "left", w: D, h: H, cls: "plain", tf: `translate3d(0px,0px,${D}px) rotateY(90deg)` });
    P.push({ id: "right", w: D, h: H, cls: "plain", tf: `translate3d(${W}px,0px,0px) rotateY(-90deg)` });
    P.push({ id: "floor", w: W, h: D, cls: "floor", tf: `translate3d(0px,${H}px,0px) rotateX(90deg)`, art: floorPlan() });

    // the two wardrobe runs — full depth, 2 ft 4 in deep, up to their 9 ft 0 in cap (clear of the dome)
    const wdH = (K.hWd || 2743);
    const slab = (x0, z0, w, d, h) => {
      P.push({ id: "t" + x0 + z0, w, h: d, cls: "solid", tf: `translate3d(${x0}px,${H - h}px,${z0}px) rotateX(90deg)` });
      P.push({ id: "f" + x0 + z0, w, h, cls: "solid", tf: `translate3d(${x0}px,${H - h}px,${z0}px)` });
      P.push({ id: "b" + x0 + z0, w, h, cls: "solid", tf: `translate3d(${x0 + w}px,${H - h}px,${z0 + d}px) rotateY(180deg)` });
    };
    slab(0, 0, K.wd.d, D, wdH);
    slab(W - K.wd.d, 0, K.wd.d, D - K.wd.w, wdH);   // the right run stops short of the hidden door's bay

    // the hidden door's bay, picked out as glass so it reads apart from the ordinary cupboards
    const tunY0 = D - K.wd.w;
    P.push({ id: "hidden", w: K.wd.w, h: wdH, cls: "glassbay", tf: `translate3d(${W}px,${H - wdH}px,${tunY0}px) rotateY(-90deg)` });

    // the tunnel beyond the back-right corner — indicative only
    const tx0 = W - K.tun.w;
    P.push({ id: "tunL", w: K.tun.l, h: H * 0.86, cls: "plain", tf: `translate3d(${tx0}px,${H * 0.07}px,${D}px) rotateY(90deg)` });
    P.push({ id: "tunR", w: K.tun.l, h: H * 0.86, cls: "plain", tf: `translate3d(${W}px,${H * 0.07}px,${D}px) rotateY(90deg) translate3d(${K.tun.w}px,0px,0px)` });
    P.push({ id: "tunEnd", w: K.tun.w, h: H * 0.86, cls: "plain", tf: `translate3d(${W}px,${H * 0.07}px,${D + K.tun.l}px) rotateY(180deg)` });

    // the dressing mirror — a thin marker centred on the back wall, height and width both still open
    const mW = 900, mH = 1900;
    P.push({ id: "mirror", w: mW, h: mH, cls: "glassbay", tf: `translate3d(${W / 2 - mW / 2}px,${H - mH}px,${D - 6}px)` });

    return { P, W, D, H };
  }

  function mount(el) {
    const { P, W, D, H } = build();
    el.innerHTML = "";
    const stage = document.createElement("div");
    stage.className = "m3d-stage";
    const scene = document.createElement("div");
    scene.className = "m3d-scene";
    stage.appendChild(scene);
    el.appendChild(stage);

    for (const p of P) {
      const d = document.createElement("div");
      d.className = "m3d-w" + (p.cls ? " " + p.cls : "");
      d.style.width = p.w + "px";
      d.style.height = p.h + "px";
      d.style.transform = p.tf;
      if (p.art) d.innerHTML = `<svg viewBox="0 0 ${p.w} ${p.h}" preserveAspectRatio="none"><g class="ink">${p.art}</g></svg>`;
      scene.appendChild(d);
    }

    const cam = { az: 36, el: 30, s: 1, t: [W / 2, H / 2, D / 2] };
    function apply() {
      const fit = Math.min(el.clientWidth / (W * 1.7), el.clientHeight / ((D + 2600) * 1.15));
      const s = cam.s * fit;
      scene.style.transform = `scale3d(${s},${s},${s}) rotateX(${-cam.el}deg) rotateY(${cam.az}deg) translate3d(${-cam.t[0]}px,${-cam.t[1]}px,${-cam.t[2]}px)`;
      scene.style.setProperty("--sw", (0.85 / s).toFixed(2));
    }
    let drag = null;
    stage.addEventListener("pointerdown", (e) => { drag = { x: e.clientX, y: e.clientY }; stage.setPointerCapture(e.pointerId); stage.style.cursor = "grabbing"; });
    stage.addEventListener("pointermove", (e) => {
      if (!drag) return;
      cam.az += (e.clientX - drag.x) * 0.35;
      cam.el = Math.max(4, Math.min(84, cam.el + (e.clientY - drag.y) * 0.3));
      drag = { x: e.clientX, y: e.clientY }; apply();
    });
    const stop = () => { drag = null; stage.style.cursor = "grab"; };
    stage.addEventListener("pointerup", stop); stage.addEventListener("pointercancel", stop);
    stage.addEventListener("wheel", (e) => { e.preventDefault(); cam.s = Math.max(0.5, Math.min(7, cam.s * (1 - Math.sign(e.deltaY) * 0.12))); apply(); }, { passive: false });

    const VIEWS = {
      Corner: { az: 36, el: 30, s: 1, t: [W / 2, H / 2, D / 2] },
      "From the door": { az: 4, el: 14, s: 1.4, t: [W / 2, H * 0.5, 700] },
      Plan: { az: 0, el: 86, s: 0.85, t: [W / 2, H / 2, D / 2] },
      "Toward the tunnel": { az: 60, el: 16, s: 1.3, t: [W * 0.86, H * 0.5, D * 0.86] },
    };
    const bar = document.createElement("div");
    bar.className = "m3d-bar";
    bar.innerHTML = Object.keys(VIEWS).map((k, i) => `<button class="${i === 0 ? "on" : ""}" data-dv="${k}">${k}</button>`).join("");
    el.appendChild(bar);
    bar.addEventListener("click", (e) => {
      const b = e.target.closest("[data-dv]"); if (!b) return;
      Object.assign(cam, VIEWS[b.dataset.dv], { t: [...VIEWS[b.dataset.dv].t] });
      bar.querySelectorAll("button").forEach((x) => x.classList.toggle("on", x === b));
      apply();
    });
    const hint = document.createElement("div");
    hint.className = "m3d-hint"; hint.textContent = "Drag to turn · scroll to zoom · first pass, not measured";
    el.appendChild(hint);
    const dome = document.createElement("div");
    dome.className = "m3d-hint";
    dome.style.cssText = "top:auto;right:auto;left:14px;bottom:44px;color:#b3261e";
    dome.textContent = `Dome over the centre to ${((DOME_H - H) / 25.4).toFixed(0)} in higher (${(DOME_H / 304.8).toFixed(0)} ft) — shown flat here, profile not modelled`;
    el.appendChild(dome);
    new ResizeObserver(apply).observe(el);
    stage.style.cursor = "grab";
    apply();
    return { apply, cam };
  }

  return { mount, build };
})();
