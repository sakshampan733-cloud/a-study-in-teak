// The walk-through, driven by the scroll: a numbered WebP sequence rendered in Blender (tools/walk/furnish.py)
// painted onto a pinned canvas. Nothing plays by itself — the picture moves only as far as the page is scrolled.
// media/walk/tour.json (written by the render) gives the frame count and the frame each stop is reached at,
// so the captions stay right however the tour is re-timed. Mounted on the overview by pages.js.
(function () {
  const BASE = "media/walk/", SRC = (i) => `${BASE}w${String(i).padStart(4, "0")}.webp`;
  const PX_PER_FRAME = 24;              // page height per frame — the walking pace: a wheel notch moves about 20 cm
  const TEXT = {
    in: ["The bedroom", "In through the front door — the partition ahead, the panelled wall on the right"],
    tv: ["The partition", "Burl, polished to the Dark Diva colour · a 55 in TV over the drawers · brass inlay and pulls"],
    room: ["The study end", "Teak panelling, the bookcase, the window and its one white curtain"],
    study: ["The study wall", "Dark Diva Crown · cornice with modillions and dentils, fluted pilasters, the bolection centre panel"],
    book: ["The bookcase", "Open shelves over cupboards, a strip light under the head rail"],
    desk: ["The desk", "7 ft 6 × 3 ft in solid teak, French-polished · square corners · brass handles"],
    window: ["The window", "4 ft × 5 ft 5 · slim bronze bars · one pleated sheer, gathered to the left at the tieback"],
    right: ["The right wall", "Painted panel moulding · three brass twin-arm lamps · the cove above"],
    bed: ["The bed", "The curved bed back and its tables in burl, a brass inlay and cap · parchment plaster, wall to wall"],
    d2: ["The dressing room door", "Four panels, a reeded casing and crown — it swings into the dressing room"],
    dress: ["The dressing room", "Teak wardrobes both sides, 9 ft tall · the folding mirror at the end"],
    vault: ["The vault", "Coffered, three across and five along, lit from its cove — as built"],
    mirror: ["The mirror", "Three panels, the wings at 45° · the bedroom behind you in it"],
    mech: ["The tunnel bay", "The doors fold out and slide back — then the shelves swing into the tunnel"],
    tunnel: ["The tunnel", "3 ft wide, 7 ft 8 in long · the door lies against its left wall"],
    d3: ["The bathroom door", "Four panels, hinged on the left — into the bathroom"],
    vanity: ["The vanity", "Scheme C · the beige-gold marble bank to the floor · dark burl pull-outs · the vessel bowl on the tap line"],
  };

  function mount(el) {
    el.innerHTML = `<div class="walk-pin">
        <canvas class="walk-cv"></canvas>
        <div class="walk-top"><span class="eyebrow">Walk-through</span><span class="walk-hint">Scroll to walk</span></div>
        <div class="walk-cap"><div class="walk-t"></div><div class="walk-s"></div></div>
        <div class="walk-bar"><i></i></div>
      </div>`;
    fetch(BASE + "tour.json", { cache: "no-cache" }).then((r) => r.json()).then((tour) => start(el, tour)).catch((e) => console.error("walk:", e));
  }

  function start(el, tour) {
    const N = tour.frames;
    const CAP = Object.entries(tour.stops).sort((a, b) => a[1] - b[1]).map(([k, f]) => [Math.max(1, f - 25), ...(TEXT[k] || [k, ""])]);
    el.style.height = `calc(${N * PX_PER_FRAME}px + 100vh)`;
    const cv = el.querySelector("canvas"), ctx = cv.getContext("2d"), cap = el.querySelector(".walk-cap");
    const capT = el.querySelector(".walk-t"), capS = el.querySelector(".walk-s"), bar = el.querySelector(".walk-bar i");
    const imgs = new Array(N + 1), ready = new Uint8Array(N + 1);
    // load order: the first frame, then every 32nd … 2nd, then the rest — so any scroll position has
    // something close to show while the rest arrive
    const order = [1], seen = new Uint8Array(N + 1); seen[1] = 1;
    for (const step of [32, 16, 8, 4, 2, 1]) for (let i = 1; i <= N; i += step) if (!seen[i]) { seen[i] = 1; order.push(i); }
    let q = 0, busy = 0, cur = 1, shown = 0, capI = -1;
    const pump = () => {
      while (busy < 6 && q < order.length) {
        const i = order[q++], im = new Image(); busy++;
        im.decoding = "async";
        im.onload = () => { ready[i] = 1; busy--; if (Math.abs(i - cur) < 4) draw(true); pump(); };
        im.onerror = () => { busy--; pump(); };
        im.src = SRC(i); imgs[i] = im;
      }
    };
    let started = false;
    new IntersectionObserver((es) => { if (es[0].isIntersecting && !started) { started = true; pump(); } }, { rootMargin: "150% 0px" }).observe(el);

    const size = () => { const r = cv.getBoundingClientRect(), d = Math.min(devicePixelRatio || 1, 2); cv.width = Math.round(r.width * d); cv.height = Math.round(r.height * d); draw(true); };
    const nearest = (i) => { for (let k = 0; k < N; k++) { if (i - k >= 1 && ready[i - k]) return i - k; if (i + k <= N && ready[i + k]) return i + k; } return 0; };
    function draw(force) {
      const i = nearest(Math.round(cur)); if (!i || (!force && i === shown)) return;
      // the whole frame, always — never cropped to fill a tall screen, which zooms it in
      shown = i; const im = imgs[i], W = cv.width, H = cv.height, s = Math.min(W / im.naturalWidth, H / im.naturalHeight);
      const w = im.naturalWidth * s, h = im.naturalHeight * s, y = H > h ? Math.max(0, (H - h) * 0.42) : 0;
      ctx.fillStyle = "#0b0b0b"; ctx.fillRect(0, 0, W, H);
      ctx.drawImage(im, (W - w) / 2, y, w, h);
    }
    const progress = () => { const r = el.getBoundingClientRect(), span = r.height - innerHeight; return Math.min(1, Math.max(0, -r.top / (span || 1))); };
    let raf = 0;
    const tick = () => {
      const p = progress(), target = 1 + p * (N - 1);
      cur += (target - cur) * 0.18; if (Math.abs(target - cur) < 0.05) cur = target;   // a little easing, so a flick of the wheel glides
      draw(false);
      bar.style.transform = `scaleX(${p})`;
      let c = 0; for (let k = 0; k < CAP.length; k++) if (cur >= CAP[k][0]) c = k;
      if (c !== capI) { capI = c; capT.textContent = CAP[c][1]; capS.textContent = CAP[c][2]; cap.classList.remove("in"); void capT.offsetWidth; cap.classList.add("in"); }
      raf = requestAnimationFrame(tick);
    };
    new IntersectionObserver((es) => { cancelAnimationFrame(raf); if (es[0].isIntersecting) raf = requestAnimationFrame(tick); }).observe(el);
    addEventListener("resize", size);
    size();
  }

  window.WALK = { mount };
})();
