// A Study in Teak — v3: the shell. Loader → field up → chrome in → the hero phrase starts cycling.
// Smooth scroll (Lenis) drives ScrollTrigger; pages.js draws everything below the hero.
(() => {
const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
const root = document.documentElement;
const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
const EASE = "expo.out";                       // ≈ cubic-bezier(.19, 1, .22, 1)
const fine = matchMedia("(pointer: fine)").matches;

// ── grain: one noise tile, made here, laid over the field ──
(() => {
  const c = document.createElement("canvas"); c.width = c.height = 200;
  const x = c.getContext("2d"), d = x.createImageData(200, 200);
  for (let i = 0; i < d.data.length; i += 4) { const v = Math.random() * 255; d.data[i] = d.data[i + 1] = d.data[i + 2] = v; d.data[i + 3] = 255; }
  x.putImageData(d, 0, 0);
  $(".field-grain").style.backgroundImage = `url(${c.toDataURL("image/png")})`;
})();

// ── smooth scroll ──
let lenis = null;
if (window.Lenis && !reduced) {
  lenis = new Lenis({ duration: 1.25, easing: (t) => 1 - Math.pow(2, -10 * t), smoothWheel: true, wheelMultiplier: .9, touchMultiplier: 1.4 });
  window.__lenis = lenis;
  if (window.gsap && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000)); gsap.ticker.lagSmoothing(0);
  } else { const raf = (t) => { lenis.raf(t); requestAnimationFrame(raf); }; requestAnimationFrame(raf); }
} else if (window.gsap && window.ScrollTrigger) gsap.registerPlugin(ScrollTrigger);
addEventListener("scroll", () => window.FIELD?.setScroll(scrollY / innerHeight), { passive: true });

// ── chrome: the room stack, top right ──
const ROOMS = [["study", "Study"], ["bedroom", "Bedroom"], ["dressing", "Dressing"], ["bathroom", "Bathroom"], ["lighting", "Lighting"]];
$(".stack").innerHTML = ROOMS.map(([id, t]) => `<a href="#${id}" data-hover>${t}</a>`).join("");
const markNav = () => { const id = location.hash.slice(1); $$(".stack a").forEach((a) => a.classList.toggle("on", a.getAttribute("href") === "#" + id)); };
addEventListener("hashchange", markNav); markNav();

// ── dimensions switch (shared with v2: the drawings read body.dims-*) ──
const DIMS = ["ft", "mm", "off"];
const dimMode = () => { try { const v = localStorage.getItem("dim-mode-v1"); return DIMS.includes(v) ? v : "ft"; } catch { return "ft"; } };
const applyDims = () => { const m = dimMode(); DIMS.forEach((k) => document.body.classList.toggle("dims-" + k, k === m)); $$("[data-dim]").forEach((b) => b.classList.toggle("on", b.dataset.dim === m)); };
document.addEventListener("click", (e) => { const b = e.target.closest("[data-dim]"); if (!b) return; try { localStorage.setItem("dim-mode-v1", b.dataset.dim); } catch {} applyDims(); });
applyDims(); window.applyDims = applyDims;

// ── cursor: a white dot that trails the pointer, and swells over anything you can open ──
if (fine) {
  const c = $(".cursor"); let x = -99, y = -99, cx = -99, cy = -99;
  addEventListener("pointermove", (e) => { x = e.clientX; y = e.clientY; c.classList.add("on"); }, { passive: true });
  document.addEventListener("pointerleave", () => c.classList.remove("on"));
  document.addEventListener("pointerover", (e) => c.classList.toggle("big", !!e.target.closest("a, button, [data-open], [data-hover]")));
  const tick = () => { cx += (x - cx) * .2; cy += (y - cy) * .2; c.style.transform = `translate3d(${cx}px, ${cy}px, 0)`; requestAnimationFrame(tick); };
  requestAnimationFrame(tick);
}

// ── the hero phrase: a short line, one italic letter, changing every few seconds ──
const PHRASES = [["A", "study,", "*i*n teak"], ["Every", "dec*i*sion,", "one", "page"], ["Drawn", "to", "be", "l*i*ved", "in"], ["Study,", "bed,", "dress*i*ng"]];
const wordHTML = (w) => `<span class="w">${w.replace(/\*(.)\*/g, "<i>$1</i>")}</span>`;
const heroT = $(".hero-t");
let pi = 0, cycling = null;
function showPhrase(i, first) {
  heroT.innerHTML = PHRASES[i].map(wordHTML).join("");
  heroT.setAttribute("aria-label", PHRASES[i].join(" ").replace(/\*/g, ""));
  if (!window.gsap || reduced) return;
  gsap.fromTo($$(".w", heroT), { opacity: 0, filter: "blur(14px)", y: 6 }, { opacity: 1, filter: "blur(0px)", y: 0, duration: first ? 1.6 : 1.25, ease: EASE, stagger: .14 });
}
function cycle() {
  if (reduced || !window.gsap) return;
  cycling = gsap.delayedCall(1.7, () => {
    gsap.to($$(".w", heroT), { opacity: 0, filter: "blur(14px)", y: -4, duration: .8, ease: "power2.in", stagger: .1, onComplete: () => { pi = (pi + 1) % PHRASES.length; showPhrase(pi); cycle(); } });
  });
}

// ── load sequence: the first phrase arrives over the dim field (the loader is the hero's first state), then the field
//    comes up, the chrome fades in and the phrase starts to cycle ──
function enter() {
  if (reduced || !window.gsap) { root.classList.remove("is-loading"); window.FIELD?.light(1, 0); showPhrase(0); return start(); }
  window.FIELD?.light(.6, .8);
  showPhrase(0, true);
  gsap.delayedCall(2.4, () => { window.FIELD?.light(1, 1.6); root.classList.remove("is-loading"); });
  gsap.delayedCall(3.4, cycle);
  start();
}
function start() { window.PAGES3?.boot(); }

// fonts first, so the loader line never reflows
(document.fonts?.ready || Promise.resolve()).then(() => requestAnimationFrame(enter));
})();
