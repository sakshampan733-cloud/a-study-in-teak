// A Study in Teak — v2.
// Built against ciridae.com (design/bar.md). The entrance below is a line-for-line port of the
// reference's own intro timeline: the same constants, the same positions and overlaps, the same eases.
(() => {
  const root = document.documentElement;
  // Fail open. The page only hides anything for the entrance once the engine is known to be here; if a
  // script failed to load, everything simply shows, static, instead of a black screen.
  if (!(window.gsap && window.SplitText && window.ScrambleTextPlugin)) { root.classList.remove("js"); return; }
  // the head script hid the entrance from first paint; if its 4 s fail-open already fired, the page is showing
  // static — take over the rest of the site, but don't hide what the visitor is already looking at
  const entranceAllowed = root.classList.contains("js");
  root.classList.add("js", "intro-live");
  gsap.registerPlugin(SplitText, ScrambleTextPlugin);
  const here = document.currentScript?.src || location.href;

  // ── the entrance constants, as the reference ships them ─────────────────────
  const X = {
    characterDurationSeconds: 0.3,
    characterStaggerSeconds: 0.0075,
    fontReadyMaximumDelayMs: 1000,
    introFailOpenDelayMs: 5875,
    logoBlurDurationSeconds: 1.65,
    logoOpacityDurationSeconds: 0.75,
    logoStartSeconds: 0.225,
    mediaRevealDurationSeconds: 0.6,
    scrambleSpeed: 0.5,
    timelineStartDelayMs: 7.5,
    videoFallbackDelayMs: 4000,
    videoStartDelayMs: 1875,
  };
  // The reference's app takes ~1 s to boot before its intro can run, so its logo first shows at ~1.26 s.
  // This page is static and would start ~0.8 s early; hold the intro to the same moment instead.
  const INTRO_EARLIEST_MS = 880;
  const SCRAMBLE_CHARS = "abcdefghijklmnopqrstuvwxyz";   // the reference's scrambleCharacters module, verbatim
  const SCRAMBLE = { chars: SCRAMBLE_CHARS, speed: X.scrambleSpeed, text: "{original}" };
  // Our copy is longer than theirs, and the intro's length is set by character count × stagger. To land every
  // text's decode in the same window as the reference's, the stagger is scaled by their length over ours.
  const REF_CHARS = { free: [20, 25], locked: 51 };   // "Automate the mundane", "Accelerate the remarkable", the three CTA lines
  const staggerFor = (refN, ourN) => X.characterStaggerSeconds * Math.min(1, refN / Math.max(1, ourN));


  const nav = document.querySelector(".nav");
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ── the intro timeline (reference: Z + re) ──────────────────────────────────
  function buildIntro(hero, onComplete) {
    const logo = hero.querySelector("[data-intro-logo]");
    const texts = [...hero.querySelectorAll("[data-intro-text]")];
    const splits = texts.map((el) => ({ el, split: new SplitText(el, { type: "lines,chars" }) }));
    const free = splits.filter(({ el }) => !el.hasAttribute("data-line-lock"));
    const locked = splits.filter(({ el }) => el.hasAttribute("data-line-lock"));
    // lock each line's box so the scramble cannot reflow it
    for (const { split } of locked) split.lines.forEach((l) => { const r = l.getBoundingClientRect(); gsap.set(l, { height: r.height, overflow: "hidden", width: r.width + 1 }); });

    let reverted = false;
    const cleanup = () => { gsap.set(logo, { clearProps: "filter,opacity,visibility" }); if (!reverted) { reverted = true; splits.forEach(({ split }) => split.revert()); } };

    const lockedChars = locked.flatMap(({ split }) => split.chars);
    gsap.set(logo, { autoAlpha: 0, filter: "blur(20px)" });
    gsap.set([...free.flatMap(({ split }) => split.chars), ...lockedChars], { autoAlpha: 0 });

    const tl = gsap.timeline({ defaults: { duration: 0.8, ease: "power2" }, paused: true, onComplete: () => { onComplete(); cleanup(); } });
    tl.fromTo(logo, { autoAlpha: 0 }, { autoAlpha: 1, duration: X.logoOpacityDurationSeconds }, X.logoStartSeconds)
      .to(logo, { duration: X.logoBlurDurationSeconds, filter: "blur(0px)" }, "<");
    free.forEach(({ split }, i) => {
      const st = staggerFor(REF_CHARS.free[i] ?? split.chars.length, split.chars.length);
      tl.from(split.chars, { duration: X.characterDurationSeconds, scrambleText: SCRAMBLE, stagger: st }, i === 0 ? "<0.2" : "<0.1")
        .fromTo(split.chars, { autoAlpha: 0 }, { autoAlpha: 1, duration: X.characterDurationSeconds, stagger: st }, i === 0 ? "-=0.8" : "<0.1");
    });
    const stL = X.characterStaggerSeconds * Math.pow(Math.min(1, REF_CHARS.locked / Math.max(1, lockedChars.length)), 0.75);   // part-way: full scaling ran the centre lines ~150 ms early
    tl.from(lockedChars, { duration: X.characterDurationSeconds, scrambleText: SCRAMBLE, stagger: stL }, "<0.2")
      .fromTo(lockedChars, { autoAlpha: 0 }, { autoAlpha: 1, duration: X.characterDurationSeconds, stagger: stL }, "<");

    gsap.set(texts, { visibility: "visible" });
    const start = setTimeout(() => tl.play(), X.timelineStartDelayMs);
    return { finish: () => tl.progress(1), dispose: () => { clearTimeout(start); tl.kill(); cleanup(); } };
  }

  // ── the media reveal (reference: ie) — curtain out, video and nav in, together ──
  function buildReveal(curtain, bg) {
    let done = false;
    return () => {
      if (done) return; done = true;
      gsap.timeline({ defaults: { duration: X.mediaRevealDurationSeconds, ease: "power1" },
        onComplete: () => { root.classList.add("is-ready"); gsap.set([curtain, bg, nav], { clearProps: "opacity,visibility" }); } })
        .fromTo(curtain, { autoAlpha: 1 }, { autoAlpha: 0 }, 0)
        .fromTo(bg, { autoAlpha: 0 }, { autoAlpha: 1 }, 0)
        .fromTo(nav, { autoAlpha: 0 }, { autoAlpha: 1 }, 0);
    };
  }

  // ── orchestration (reference: ae + se): fonts, then the intro; the video loads at 1.875 s ──
  function runEntrance(hero) {
    const video = hero.querySelector(".hero-video"), source = video?.querySelector("source[data-src]");
    const curtain = hero.querySelector(".hero-curtain"), bg = hero.querySelector(".hero-bg");
    const finishStatic = (media) => { hero.dataset.intro = "complete"; hero.dataset.media = media; root.classList.add("is-ready"); gsap.set(curtain, { autoAlpha: 0 }); };
    if (!video || reduced) return finishStatic(reduced ? "static" : "poster");

    const videoAt = Date.now() + X.videoStartDelayMs;
    let media = null, introDone = false, fallback = 0, failOpen = 0;
    const reveal = buildReveal(curtain, bg);
    const maybeReveal = () => { if (introDone && media) { hero.dataset.media = media; reveal(); } };
    const setMedia = (m) => { if (media) return; clearTimeout(fallback); media = m; maybeReveal(); };
    const toPoster = () => { if (media) return; video.pause(); source?.removeAttribute("src"); video.preload = "none"; video.load(); setMedia("poster"); };
    // a video that is only slow (not broken) keeps loading behind the poster and takes over when it plays
    const posterForNow = () => setMedia("poster");

    let intro;
    const begin = () => {
      if (intro) return;
      intro = buildIntro(hero, () => { clearTimeout(failOpen); hero.dataset.intro = "complete"; introDone = true; maybeReveal(); });
      failOpen = setTimeout(() => { if (!introDone) { intro.finish(); posterForNow(); } }, X.introFailOpenDelayMs);
      setTimeout(() => {
        if (source?.dataset.src) source.src = source.dataset.src;
        video.preload = "auto"; video.load();
        fallback = setTimeout(posterForNow, X.videoFallbackDelayMs);
        video.play().catch(toPoster);
      }, Math.max(0, videoAt - Date.now()));
    };
    video.addEventListener("playing", () => setMedia("playing"));
    video.addEventListener("error", toPoster);
    const hold = (fn) => () => setTimeout(fn, Math.max(0, INTRO_EARLIEST_MS - performance.now()));
    const fontGate = setTimeout(hold(begin), X.fontReadyMaximumDelayMs);
    document.fonts.ready.then(() => { clearTimeout(fontGate); hold(begin)(); }).catch(hold(begin));
  }

  // ═════════════ PIECE 2 — navigation, menu, scroll, decode (design/spec-piece2.md) ═════════════
  // Nothing here is needed for the entrance, so its scripts load after it has started instead of competing
  // with it for the connection: on a phone-speed network that brings the entrance forward by seconds.
  function loadRest(done) {
    const srcs = ["../data.js", "vendor/ScrollTrigger.min.js", "vendor/lenis.min.js"];
    let left = srcs.length;
    for (const src of srcs) {
      const el = document.createElement("script");
      el.src = new URL(src, here).href; el.async = false;          // fetched together, run in order
      el.onload = el.onerror = () => { if (--left === 0) done(); };
      document.body.appendChild(el);
    }
  }
  function initSite() {
    const SITE = window.PROJECT;
    if (window.ScrollTrigger) gsap.registerPlugin(ScrollTrigger);
    const body = document.body;

    // ── the menu's section list, from data.js ─────────────────────────────────────
    function buildMenu() {
      const list = document.querySelector(".menu-list");
      if (!list || !SITE) return;
      const extra = { veneer: "Materials", principles: "Principles", lighting: "Lighting", problems: "Problems" };
      const items = [["overview", "Overview"], ["veneer", extra.veneer], ["principles", extra.principles],
        ...SITE.tabs.map((t) => [t.id, t.title]), ["lighting", extra.lighting], ["problems", extra.problems]];
      list.innerHTML = items.map(([id, title], i) =>
        `<a class="menu-item" href="#${id}" style="--delay:${(i * 0.1 + 0.2).toFixed(2)}s" data-hover><span class="menu-text" data-text="${title.replace(/"/g, "&quot;")}">${title}</span></a>`).join("");
    }
    buildMenu();

    // ── smooth scroll: the reference's own Lenis settings ─────────────────────────
    let lenis = null;
    if (window.Lenis && !reduced) {
      lenis = new Lenis({ duration: 1.4, smoothWheel: true, wheelMultiplier: 1.6 });
      if (window.ScrollTrigger) lenis.on("scroll", ScrollTrigger.update);
      gsap.ticker.add((t) => lenis.raf(t * 1000));
      gsap.ticker.lagSmoothing(0);
    }

    // ── scroll states: at-top (first 300 px), past-first (hero gone), scroll-down (M = 10 px) ──
    body.classList.add("at-top");
    if (window.ScrollTrigger) {
      ScrollTrigger.create({ trigger: body, start: "top top", end: "300 top", onLeave: () => body.classList.remove("at-top"), onEnterBack: () => body.classList.add("at-top") });
      const first = document.querySelector("main section");
      if (first) ScrollTrigger.create({ trigger: first, start: "bottom top", onLeave: () => body.classList.add("past-first"), onEnterBack: () => body.classList.remove("past-first") });
    }
    {
      const M = 10; let last = lenis ? lenis.animatedScroll : scrollY, lastDir = 0;
      const step = (dir, y) => { const d = dir === 0 ? lastDir : dir, prev = last; lastDir = d; last = y;
        if (d === 1) body.classList.add("scroll-down"); else if (y < prev - M) body.classList.remove("scroll-down"); };
      if (lenis) lenis.on("scroll", (e) => step(e.direction, e.animatedScroll));
      else addEventListener("scroll", () => step(Math.sign(scrollY - last), scrollY), { passive: true });
      const navEl = document.querySelector(".nav");
      const show = () => body.classList.remove("scroll-down");
      navEl?.addEventListener("mouseenter", show); navEl?.addEventListener("mousemove", show);
    }

    // ── the menu ──────────────────────────────────────────────────────────────────
    {
      const toggle = document.querySelector(".pill.is-menu"), overlay = document.getElementById("menu");
      const isOpen = () => body.classList.contains("menu-open");
      const setOpen = (open, returnFocus = true) => {
        if (!toggle || open === isOpen()) return;
        body.classList.toggle("menu-open", open);
        toggle.setAttribute("aria-expanded", String(open));
        toggle.setAttribute("aria-label", open ? "Close menu" : "Menu");
        overlay.setAttribute("aria-hidden", String(!open));
        if (open) { lenis?.stop(); overlay.querySelector(".menu-item")?.focus({ preventScroll: true }); }
        else { lenis?.start(); if (returnFocus) toggle.focus({ preventScroll: true }); }
      };
      toggle?.addEventListener("click", () => setOpen(!isOpen()));
      overlay?.addEventListener("click", (e) => { if (e.target.closest("a[href]")) setOpen(false, false); });
      addEventListener("keydown", (e) => { if (e.key === "Escape" && isOpen()) setOpen(false); });
    }

    // ── hover: labels re-scramble in the reference's alphabet (0.3 s a letter, 10 ms apart) ──
    function hoverScramble(link, label) {
      let rt = null;
      link.addEventListener("mouseenter", () => {
        if (!rt) {
          const split = new SplitText(label, { type: "lines,chars" });
          split.lines.forEach((l) => gsap.set(l, { height: "1em", overflow: "hidden", width: l.getBoundingClientRect().width + 1 }));
          const tl = gsap.timeline({ paused: true });
          split.chars.forEach((c, i) => tl.from(c, { duration: 0.3, scrambleText: { chars: SCRAMBLE_CHARS, speed: 0.25, text: "{original}" } }, i * 0.01));
          rt = { split, tl };
        }
        rt.tl.restart();
      });
      addEventListener("resize", () => { if (rt) { rt.tl.kill(); rt.split.revert(); rt = null; } }, { passive: true });
    }
    document.querySelectorAll("[data-hover]").forEach((link) => {
      // the menu button scrambles only its visible word (MENU), never the box that also holds CLOSE
      const label = link.querySelector(".pill-open") || link.querySelector(".pill-text, .menu-text") || link;
      hoverScramble(link, label);
    });

    // ── decode on entering view: each letter scrambles in and fades up, 20 ms apart ──
    if (window.ScrollTrigger) document.querySelectorAll("[data-decode]").forEach((el) => {
      const split = new SplitText(el, { type: "lines,chars" });
      gsap.set(split.chars, { autoAlpha: 0 });
      const tl = gsap.timeline({ defaults: { duration: 0.4, ease: "power2" }, paused: true });
      split.chars.forEach((c, i) => tl.from(c, { scrambleText: { chars: SCRAMBLE_CHARS, speed: 0.5, text: "{original}" } }, i * 0.02).fromTo(c, { autoAlpha: 0 }, { autoAlpha: 1 }, i * 0.02));
      ScrollTrigger.create({ trigger: el, start: "top 90%", animation: tl, toggleActions: "play none none reverse" });
    });
  }

  const hero = document.querySelector(".hero[data-intro]");
  if (hero && !entranceAllowed) { hero.dataset.intro = "complete"; hero.dataset.media = "poster"; root.classList.add("is-ready"); }
  else if (hero) {
    try { runEntrance(hero); }
    catch (e) { console.error("entrance failed, showing static", e); root.classList.remove("js"); hero.dataset.intro = "complete"; hero.dataset.media = "poster"; }
  }
  loadRest(initSite);
})();
