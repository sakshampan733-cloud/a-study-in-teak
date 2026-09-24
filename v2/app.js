// A Study in Teak — v2.
// Built against ciridae.com (design/bar.md). The entrance below is a line-for-line port of the
// reference's own intro timeline: the same constants, the same positions and overlaps, the same eases.
(() => {
  const root = document.documentElement;
  root.classList.add("js");
  gsap.registerPlugin(SplitText, ScrambleTextPlugin, ScrollTrigger);

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
  const INTRO_EARLIEST_MS = 860;
  const SCRAMBLE = { chars: "upperCase", speed: X.scrambleSpeed, text: "{original}" };

  // ── the mark: four stars joined by hollowed arcs — the desk's inward corner, drawn as a constellation ──
  const star = (x, y, r, w = 0.16) => `<path d="M${x} ${y - r} C${x + r * w} ${y - r * w} ${x + r * w} ${y - r * w} ${x + r} ${y} C${x + r * w} ${y + r * w} ${x + r * w} ${y + r * w} ${x} ${y + r} C${x - r * w} ${y + r * w} ${x - r * w} ${y + r * w} ${x - r} ${y} C${x - r * w} ${y - r * w} ${x - r * w} ${y - r * w} ${x} ${y - r} Z" fill="#fff"/>`;
  const markBody = () => {
    const pts = [[32, 9], [55, 32], [32, 55], [9, 32]];
    const arcs = pts.map((p, i) => { const q = pts[(i + 1) % 4]; return `M${p[0]} ${p[1]} A23 23 0 0 0 ${q[0]} ${q[1]}`; }).join(" ");
    return `<path d="${arcs}" fill="none" stroke="#fff" stroke-width=".9"/>` + pts.map(([x, y], i) => star(x, y, i % 2 ? 7.5 : 9.5)).join("") + star(32, 32, 4.2);
  };
  document.querySelectorAll(".hero-mark").forEach((s) => (s.innerHTML = markBody()));

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
      tl.from(split.chars, { duration: X.characterDurationSeconds, scrambleText: SCRAMBLE, stagger: X.characterStaggerSeconds }, i === 0 ? "<0.2" : "<0.1")
        .fromTo(split.chars, { autoAlpha: 0 }, { autoAlpha: 1, duration: X.characterDurationSeconds, stagger: X.characterStaggerSeconds }, i === 0 ? "-=0.8" : "<0.1");
    });
    tl.from(lockedChars, { duration: X.characterDurationSeconds, scrambleText: SCRAMBLE, stagger: X.characterStaggerSeconds }, "<0.2")
      .fromTo(lockedChars, { autoAlpha: 0 }, { autoAlpha: 1, duration: X.characterDurationSeconds, stagger: X.characterStaggerSeconds }, "<");

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

    let intro;
    const begin = () => {
      if (intro) return;
      intro = buildIntro(hero, () => { clearTimeout(failOpen); hero.dataset.intro = "complete"; introDone = true; maybeReveal(); });
      failOpen = setTimeout(() => { if (!introDone) { intro.finish(); if (!media) toPoster(); } }, X.introFailOpenDelayMs);
      setTimeout(() => {
        if (source?.dataset.src) source.src = source.dataset.src;
        video.preload = "auto"; video.load();
        fallback = setTimeout(toPoster, X.videoFallbackDelayMs);
        video.play().catch(toPoster);
      }, Math.max(0, videoAt - Date.now()));
    };
    video.addEventListener("playing", () => setMedia("playing"));
    video.addEventListener("error", toPoster);
    const hold = (fn) => () => setTimeout(fn, Math.max(0, INTRO_EARLIEST_MS - performance.now()));
    const fontGate = setTimeout(hold(begin), X.fontReadyMaximumDelayMs);
    document.fonts.ready.then(() => { clearTimeout(fontGate); hold(begin)(); }).catch(hold(begin));
  }

  const hero = document.querySelector(".hero[data-intro]");
  if (hero) runEntrance(hero);
})();
