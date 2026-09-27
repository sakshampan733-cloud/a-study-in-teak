// The walk-through, driven by the scroll: a numbered WebP sequence rendered in Blender (tools/walk/furnish.py)
// painted onto a pinned canvas. Nothing plays by itself — the picture moves only as far as the page is scrolled.
// Mounted on the overview by pages.js.
(function () {
  const N = 1061, SRC = (i) => `media/walk/w${String(i).padStart(4, "0")}.webp`;
  // captions, by frame — where the camera is at that point of the tour
  const CAP = [
    [1, "The suite, from above", "Bedroom and study · dressing · bathroom · the tunnel"],
    [91, "In at the front door", "It opens flat along the bed wall"],
    [131, "The bed", "6 ft × 6 ft 6 · the curved bed-back · quarter-circle tables"],
    [215, "The partition", "8 ft · TV on the bed side · drawers filling the curve"],
    [255, "Round the partition", "3 ft 9 in to the wall"],
    [295, "The desk", "Sitting in the partition's other curve"],
    [339, "The bookcase", "Open shelves, cupboards under a reeded counter"],
    [385, "The study wall", "Two fluted pilasters, the panelled centre, the cornice"],
    [425, "The window", "One white curtain, gathered to the left"],
    [461, "Round the other end", "Towards the dressing room"],
    [495, "Into the dressing room", "Wardrobes both sides, 9 ft tall"],
    [541, "The mirror", "Trifold, wings at 45°"],
    [581, "The dome", "10 ft at the crown — its shape still open"],
    [621, "The hidden door", "The last bay — push it and it swings into the tunnel"],
    [665, "The tunnel", "3 ft wide, 7 ft 8 in long"],
    [739, "The bathroom door", "Hinged on the left, it opens in"],
    [795, "The bathroom", "12 ft 3 × 8 ft 11 · fittings still to come"],
    [851, "The east wall", "The window is not measured yet"],
    [903, "The pier", "10 in thick, 3 ft out"],
    [959, "The WC wall", "The 7 in wall, 5 ft 4 in from the door"],
    [1015, "Back to the door", "Clay model · materials next"],
  ];

  function mount(el) {
    el.innerHTML = `<div class="walk-pin">
        <canvas class="walk-cv"></canvas>
        <div class="walk-top"><span class="eyebrow">Walk-through · clay</span><span class="walk-hint">Scroll to walk</span></div>
        <div class="walk-cap"><div class="walk-t"></div><div class="walk-s"></div></div>
        <div class="walk-bar"><i></i></div>
      </div>`;
    const cv = el.querySelector("canvas"), ctx = cv.getContext("2d");
    const capT = el.querySelector(".walk-t"), capS = el.querySelector(".walk-s"), bar = el.querySelector(".walk-bar i");
    const imgs = new Array(N + 1), ready = new Uint8Array(N + 1);
    // load order: the first frame, then every 16th, 8th, 4th, 2nd, then the rest — so any scroll position has
    // something close to show while the rest arrive
    const order = [1]; for (const step of [16, 8, 4, 2, 1]) for (let i = 1; i <= N; i += step) if (!order.includes(i)) order.push(i);
    let q = 0, busy = 0;
    const pump = () => {
      while (busy < 6 && q < order.length) {
        const i = order[q++], im = new Image(); busy++;
        im.decoding = "async"; im.onload = () => { ready[i] = 1; busy--; if (i === 1 || Math.abs(i - cur) < 3) draw(true); pump(); };
        im.onerror = () => { busy--; pump(); };
        im.src = SRC(i); imgs[i] = im;
      }
    };
    let started = false;
    const io = new IntersectionObserver((es) => { if (es[0].isIntersecting && !started) { started = true; pump(); } }, { rootMargin: "150% 0px" });
    io.observe(el);

    let cur = 1, shown = 0, capI = -1;
    const size = () => { const r = cv.getBoundingClientRect(), d = Math.min(devicePixelRatio || 1, 2); cv.width = Math.round(r.width * d); cv.height = Math.round(r.height * d); draw(true); };
    const nearest = (i) => { for (let k = 0; k < N; k++) { if (i - k >= 1 && ready[i - k]) return i - k; if (i + k <= N && ready[i + k]) return i + k; } return 0; };
    function draw(force) {
      const i = nearest(Math.round(cur)); if (!i || (!force && i === shown)) return;
      shown = i; const im = imgs[i], W = cv.width, H = cv.height, s = Math.max(W / im.naturalWidth, H / im.naturalHeight);
      const w = im.naturalWidth * s, h = im.naturalHeight * s;
      ctx.drawImage(im, (W - w) / 2, (H - h) / 2, w, h);
    }
    const progress = () => { const r = el.getBoundingClientRect(), span = r.height - innerHeight; return Math.min(1, Math.max(0, -r.top / (span || 1))); };
    let target = 1, raf = 0;
    const tick = () => {
      const p = progress(); target = 1 + p * (N - 1);
      cur += (target - cur) * 0.25; if (Math.abs(target - cur) < 0.05) cur = target;
      draw(false);
      bar.style.transform = `scaleX(${p})`;
      let c = 0; for (let k = 0; k < CAP.length; k++) if (cur >= CAP[k][0]) c = k;
      if (c !== capI) { capI = c; capT.textContent = CAP[c][1]; capS.textContent = CAP[c][2]; el.querySelector(".walk-cap").classList.remove("in"); void capT.offsetWidth; el.querySelector(".walk-cap").classList.add("in"); }
      raf = requestAnimationFrame(tick);
    };
    const vis = new IntersectionObserver((es) => { cancelAnimationFrame(raf); if (es[0].isIntersecting) raf = requestAnimationFrame(tick); });
    vis.observe(el);
    addEventListener("resize", size);
    size();
  }

  window.WALK = { mount };
})();
