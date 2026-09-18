// The partition in three dimensions — the same elevation the sheet draws, cut into its bays
// and stood up on the curve. Each bay is a flat facet, exactly as the glass would be made.
window.PARTITION3D = (function () {
  function build() {
    const G = window.PGEOM;
    const bays = [];
    for (let i = 0; i < G.BAYS; i++) {
      const s0 = G.BW * i, s1 = G.BW * (i + 1);
      const a = G.at(s0), b = G.at(Math.min(s1, G.TOT));
      const dx = b.x - a.x, dz = b.y - a.y, len = Math.hypot(dx, dz) || 1;
      bays.push({ i, x: a.x, z: a.y, len, deg: (Math.atan2(-dz, dx) * 180) / Math.PI, vb: `${s0} 0 ${G.BW} ${G.H}` });
    }
    return { G, bays };
  }

  function mount(el, opts) {
    const { G, bays } = build();
    // Inline hairlines do not survive being shrunk to this size; strip them so the viewer
    // can set one weight from the zoom, as the room model does.
    const art = String(G.elevation(6, opts && opts.tv)).replace(/\sstroke-width="[^"]*"/g, "");
    el.innerHTML = "";
    const stage = document.createElement("div");
    stage.className = "m3d-stage";
    const scene = document.createElement("div");
    scene.className = "m3d-scene";
    stage.appendChild(scene);
    el.appendChild(stage);

    // the floor it stands on, so the curve reads
    const floor = document.createElement("div");
    floor.className = "m3d-w floor";
    floor.style.cssText = `width:${G.DEV * 1.6}px;height:${G.DEV * 0.9}px;transform:translate3d(${-G.DEV * 0.8}px,${G.H}px,${-G.DEV * 0.3}px) rotateX(90deg)`;
    scene.appendChild(floor);

    for (const b of bays) {
      const d = document.createElement("div");
      d.className = "m3d-w glassbay";
      d.style.width = b.len + "px";
      d.style.height = G.H + "px";
      d.style.transform = `translate3d(${b.x}px,0px,${b.z}px) rotateY(${b.deg}deg)`;
      d.innerHTML = `<svg viewBox="${b.vb}" preserveAspectRatio="none"><g class="ink">${art}</g></svg>`;
      scene.appendChild(d);
    }

    const cam = { az: 34, el: 16, s: 1 };
    function apply() {
      const fit = Math.min(el.clientWidth / (G.DEV * 1.12), el.clientHeight / (G.H * 1.75));
      const s = cam.s * fit;
      scene.style.transform = `scale3d(${s},${s},${s}) rotateX(${-cam.el}deg) rotateY(${cam.az}deg) translate3d(0px,${-G.H / 2}px,${-G.PROJ / 2}px)`;
      scene.style.setProperty("--sw", (0.85 / s).toFixed(2));
    }
    let drag = null;
    stage.addEventListener("pointerdown", (e) => { drag = { x: e.clientX, y: e.clientY }; stage.setPointerCapture(e.pointerId); stage.style.cursor = "grabbing"; });
    stage.addEventListener("pointermove", (e) => {
      if (!drag) return;
      cam.az += (e.clientX - drag.x) * 0.35;
      cam.el = Math.max(-25, Math.min(82, cam.el + (e.clientY - drag.y) * 0.3));
      drag = { x: e.clientX, y: e.clientY }; apply();
    });
    const stop = () => { drag = null; stage.style.cursor = "grab"; };
    stage.addEventListener("pointerup", stop); stage.addEventListener("pointercancel", stop);
    stage.addEventListener("wheel", (e) => { e.preventDefault(); cam.s = Math.max(0.5, Math.min(7, cam.s * (1 - Math.sign(e.deltaY) * 0.12))); apply(); }, { passive: false });

    const VIEWS = { "From the bed": { az: 0, el: 6, s: 1.25 }, Corner: { az: 34, el: 16, s: 1 }, "From the desk": { az: 180, el: 6, s: 1.25 }, Plan: { az: 0, el: 80, s: 0.95 } };
    const bar = document.createElement("div");
    bar.className = "m3d-bar";
    bar.innerHTML = Object.keys(VIEWS).map((k, i) => `<button class="${i === 1 ? "on" : ""}" data-pv="${k}">${k}</button>`).join("");
    el.appendChild(bar);
    bar.addEventListener("click", (e) => {
      const b = e.target.closest("[data-pv]"); if (!b) return;
      Object.assign(cam, VIEWS[b.dataset.pv]);
      bar.querySelectorAll("button").forEach((x) => x.classList.toggle("on", x === b));
      apply();
    });
    const hint = document.createElement("div");
    hint.className = "m3d-hint"; hint.textContent = "Drag to turn · scroll to zoom";
    el.appendChild(hint);
    new ResizeObserver(apply).observe(el);
    stage.style.cursor = "grab";
    apply();
    return { apply, cam };
  }
  return { mount, build };
})();
