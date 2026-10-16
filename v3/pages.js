// A Study in Teak — v3: everything below the hero, drawn from data.js (unchanged) on the monopo saigon system.
// Routed by the hash: #overview (home) · a room (#study …) · #lighting · #veneer · #principles · #problems.
(() => {
const P = window.PROJECT;
const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
const U = (p = "") => (/^(https?:|\/|data:|\.\.\/)/.test(p) ? p : "../" + p);        // data.js names files from the site root
const esc = (s = "") => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const pad2 = (n) => String(n).padStart(2, "0");
const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
// one italic letter per display line: the first "i" (the reference's signature)
const itl = (s) => esc(s).replace(/i/, "<i>i</i>");
const lab = (t, id) => `<div class="lab rv"${id ? ` id="${id}"` : ""}><span class="arr" aria-hidden="true">→</span>${esc(t)}</div>`;

// ── home ──
const WORKS = [
  { img: "assets/renders/st_wall.jpg", t: "The study wall", tags: ["Bookcase arch", "Panelled centre", "Window arch"], go: "study" },
  { img: "assets/renders/b_three.jpg", t: "The bed in its niche", tags: ["Storage base", "Dark Diva wall", "Cove"], go: "bedroom" },
  { img: "assets/renders/r_desk.jpg", t: "The desk", tags: ["Solid teak", "Double pedestal", "Hollow corners"], go: "study" },
  { img: "assets/renders/h_dress.jpg", t: "The dressing room", tags: ["Teak wardrobes", "Vaulted ceiling", "Hidden door"], go: "dressing" },
  { img: "assets/renders/window.jpg", t: "The window arch", tags: ["Red velvet", "Linen sheer", "Hidden tracks"], go: "study" },
  { img: "assets/renders/bath_van.jpg", t: "The vanity", tags: ["Marble bank", "Red burl", "Octagon mirror"], go: "bathroom" },
  { img: "assets/renders/r_pbed.jpg", t: "The partition and the TV", tags: ["Hand-cast glass", "Pill unit", "Drawers"], go: "bedroom" },
  { img: "assets/renders/vault.jpg", t: "The vault", tags: ["Coffers", "Warm light", "Dressing"], go: "dressing" },
];
function work(w, i) {
  return `<a class="work rv" href="#${w.go}" data-hover><figure class="work-f"><img src="${U(w.img)}" alt="${esc(w.t)}" loading="${i < 2 ? "eager" : "lazy"}" decoding="async"></figure>
    <h3 class="work-t">${esc(w.t)}</h3><p class="work-g">${w.tags.map(esc).join("<span>,</span> ")}</p></a>`;
}
const MADE = [["Teak", "the desk, solid"], ["Royal Oak veneer", "quarter cut"], ["Satin PU", "semi-gloss"], ["Dark Diva", "the bed wall"],
  ["Taupe marble", "the floor"], ["White marble", "border & skirting"], ["Beige-gold marble", "the bathroom"], ["Warm cream", "the walls"],
  ["Hand-cast glass", "the partition"], ["Hammered brass", "the handles"], ["Red velvet", "the curtains"], ["Linen", "the sheer"]];
const BRIEF = ["One teak desk", "sets the tone.", "Every other decision", "follows from it.", "One veneer, one polish,", "everywhere in the room."];
const FILM = [["From the door", 0.0], ["The reveal", 5.75], ["The partition", 11.25], ["The study", 16.25], ["The arch", 21.25], ["The desk", 26.25],
  ["The sconces", 31.25], ["The bed", 36.75], ["The hide", 42.5], ["The dressing-room door", 47.5], ["The dressing room", 53.0], ["The vault", 58.5],
  ["The hidden door", 63.5], ["The tunnel", 70.0], ["The vanity", 75.0], ["The bath", 80.0], ["The WC and shower", 85.0]];
const TILES = ["st_arch", "b_head", "wd_handle", "bath_up", "mould_c", "mirror", "st_lamp", "b_cove", "h_wardrobe", "st_chair", "d1close", "bath_tub", "b_rug", "mould_r", "st_wall3", "d2close"];
const ROOMS4 = [
  ["Study", ["Study wall 14 ft 11 in", "Ceiling 9 ft 1 in", "Window 4 ft × 5 ft 5 in", "Desk faces the partition"], "study"],
  ["Bedroom", ["Bed wall 15 ft 6 in", "Niche 15 in deep", "Partition 7 ft 9 in, glass block", "Bed 1929 × 2108"], "bedroom"],
  ["Dressing", ["Shared wall 9 ft 3 in", "Wardrobes both sides, 2 ft 3 in", "Vault 10 ft 0 in at the centre", "Tunnel 3 ft × 7 ft 8 in"], "dressing"],
  ["Bathroom", ["Vanity, marble bank", "Painted ceiling", "Shower drop and coves", "WC, tub, two niches"], "bathroom"],
];
function home() {
  const left = WORKS.filter((_, i) => i % 2 === 0), right = WORKS.filter((_, i) => i % 2 === 1);
  const rooms = `<section class="sec rooms" id="rooms"><div class="col">${lab("The rooms")}
    <div class="works"><div class="works-c">${left.map((w, i) => work(w, i * 2)).join("")}</div><div class="works-c is-off">${right.map((w, i) => work(w, i * 2 + 1)).join("")}</div></div>
    <div class="more rv"><a class="pill" href="#study" data-hover>Every room, every decision<span aria-hidden="true">→</span></a></div></div></section>`;
  const made = `<section class="sec made"><div class="col">${lab("Made of")}
    <ul class="made-g">${MADE.map(([m, u]) => `<li class="rv"><b>${esc(m)}</b><span>${esc(u)}</span></li>`).join("")}</ul></div></section>`;
  const brief = `<section class="sec brief"><div class="col">${lab("The brief")}
    <p class="brief-t">${BRIEF.map((l) => `<span class="ln">${itl(l)}</span>`).join("")}</p></div></section>`;
  const rules = `<section class="sec rules"><div class="col">${P.principles.groups.map((g) => `<article class="rule rv">
      ${lab(g.name.toUpperCase())}<div class="rule-n">${esc(g.n)}</div>
      <div class="rule-b"><p>${esc(g.line)}</p><a class="rule-a" href="#principles" data-hover>${g.rules.length} rules<span aria-hidden="true"> →</span></a></div></article>`).join("")}</div></section>`;
  const film = `<section class="sec film" id="walk"><div class="col">${lab("The walk-through")}
      <p class="film-p rv">Rendered in Blender from the drawings, in the real finishes and light: in through the door, past the partition to the study and its arches, the desk, the bed, the dressing room, the hidden door and its tunnel, and the bathroom.</p></div>
    <div class="giant" aria-hidden="true"><div class="giant-t">Walk the rooms&nbsp;&nbsp;·&nbsp;&nbsp;Walk the rooms&nbsp;&nbsp;·&nbsp;&nbsp;</div></div>
    <div class="col"><div class="film-frame rv" id="film"><video controls playsinline preload="none" poster="../v2/media/room-film-poster.jpg"></video></div>
      <div class="film-ch rv">${FILM.map(([n, t], k) => `<button class="pill sm" data-film="${t}" data-hover><span class="n">${pad2(k + 1)}</span>${esc(n)}</button>`).join("")}</div>
      <div class="film-song rv"><div class="film-yt"><div id="film-song"></div></div><p><span class="lab-s">Soundtrack</span><b>Devil In A New Dress</b><span>Kanye West ft. Rick Ross · plays with the film, from the start</span></p></div></div></section>`;
  const tiles = `<section class="tiles" aria-hidden="true"><div class="tiles-in">${[0, 1, 2].map((r) => `<div class="tiles-r" data-dir="${r % 2 ? 1 : -1}">${TILES.slice(r * 5, r * 5 + 6).concat(TILES.slice(r * 5, r * 5 + 6)).map((t) => `<figure><img src="${U("assets/renders/" + t + ".jpg")}" alt="" loading="lazy" decoding="async"></figure>`).join("")}</div>`).join("")}</div></section>`;
  const plan = `<section class="sec plan" id="plan"><div class="col">${lab("The plan")}
      <h2 class="sub rv">Every measurement, in one plan. Switch things on and off.</h2>
      <div class="p2d-wrap rv"><div class="p2d" id="p2d"></div></div>
      <dl class="facts">${P.room.facts.map((f) => `<div class="fact rv"><dt>${esc(f.k)}</dt><dd>${esc(f.v)}</dd></div>`).join("")}</dl></div></section>`;
  return rooms + made + brief + rules + film + tiles + plan + footer();
}

function footer() {
  const pages = [["doors", "Doors & moulding"], ["walls", "Left & right walls"], ["veneer", "Materials"], ["principles", "Principles"], ["problems", "Problems"], ["lighting", "Lighting & switches"]];
  return `<footer class="foot"><div class="col">${lab("Contents")}
    <h2 class="foot-ghost rv">Every decision</h2>
    <div class="foot-start rv"><span class="lab-s">Start with</span><a class="iris" href="#study" data-hover>the study wall, AST-DR-040</a></div>
    <div class="foot-g">${ROOMS4.map(([n, lines, id]) => `<a class="foot-c rv" href="#${id}" data-hover><h3>${n}</h3>${lines.map((l) => `<span>${esc(l)}</span>`).join("")}</a>`).join("")}</div>
    <div class="foot-row rv"><nav class="foot-pages" aria-label="More pages">${pages.map(([id, t]) => `<a href="#${id}" data-hover>${t}</a>`).join("")}</nav>
      <span class="foot-m">A Study in Teak · every decision for one room · 2026</span></div></div></footer>`;
}

// ── the film and its soundtrack (carried over from v2: the song plays through YouTube's player, the film follows it) ──
const SOUNDTRACK = "sk3rpYkiHe8";
function mountFilm(el) {
  const v = el.querySelector("video"), small = matchMedia("(max-width: 760px)").matches || navigator.connection?.saveData;
  if (v.getAttribute("src")) return;
  v.src = small ? "../v2/media/room-film-720.mp4" : "../v2/media/room-film.mp4";
  mountSoundtrack(v);
}
function mountSoundtrack(v) {
  const box = $("#film-song"); if (!box || box.dataset.on) return; box.dataset.on = "1";
  let yt = null, ready = false, wait = false; const PLAYING = 1, PAUSED = 2;
  const start = () => { yt = new YT.Player(box, { videoId: SOUNDTRACK, width: "100%", height: "100%", playerVars: { playsinline: 1, rel: 0, modestbranding: 1 },
    events: { onReady: () => (ready = true), onStateChange: (e) => {
      if (e.data === PLAYING && wait) { wait = false; v.play().catch(() => {}); }
      else if (e.data === PLAYING && v.paused && yt.getCurrentTime() < (v.duration || 59)) { v.currentTime = yt.getCurrentTime(); v.play().catch(() => {}); }
      else if (e.data === PAUSED && !v.paused && !wait) v.pause();
    } } }); };
  v.addEventListener("play", () => { if (!ready || yt.getPlayerState() === PLAYING) return; wait = true; v.pause(); yt.seekTo(v.currentTime, true); yt.playVideo(); });
  v.addEventListener("pause", () => { if (ready && !wait) yt.pauseVideo(); });
  v.addEventListener("seeked", () => { if (ready && Math.abs(yt.getCurrentTime() - v.currentTime) > 0.4) yt.seekTo(v.currentTime, true); });
  v.addEventListener("ended", () => { if (ready) yt.pauseVideo(); });
  setInterval(() => { if (ready && !v.paused && yt.getPlayerState() === PLAYING) { const t = yt.getCurrentTime(); if (Math.abs(t - v.currentTime) > 0.5 && t < (v.duration || 59)) v.currentTime = t; } }, 500);
  if (window.YT && YT.Player) start();
  else { const prev = window.onYouTubeIframeAPIReady; window.onYouTubeIframeAPIReady = () => { prev?.(); start(); };
    const sc = document.createElement("script"); sc.src = "https://www.youtube.com/iframe_api"; document.head.appendChild(sc); }
}
document.addEventListener("click", (e) => {
  const b = e.target.closest("[data-film]"); if (!b) return;
  const v = $("#film video"); if (!v) return;
  if (!v.src) mountFilm($("#film"));
  v.preload = "auto"; v.currentTime = +b.dataset.film; v.play().catch(() => {});
  window.__lenis ? window.__lenis.scrollTo(v, { offset: -innerHeight * .2 }) : v.scrollIntoView({ behavior: "smooth", block: "center" });
});

// ── widgets that need the drawing scripts: mounted as they come within a screen of view ──
let mounts;
function mountWidgets() {
  mounts?.disconnect();
  const jobs = [["film", () => true, mountFilm], ["p2d", () => window.SUITE2D?.mount, (el) => window.SUITE2D.mount(el)]];
  const run = new Map();
  mounts = new IntersectionObserver((es) => es.forEach((e) => {
    if (!e.isIntersecting) return; mounts.unobserve(e.target);
    const [id, , mount] = run.get(e.target);
    try { mount(e.target); } catch (err) { console.error(id + ":", err); }
    window.ScrollTrigger?.refresh();
  }), { rootMargin: "100% 0px" });
  for (const j of jobs) { const el = document.getElementById(j[0]); if (el && j[1]()) { run.set(el, j); mounts.observe(el); } }
}

// ── motion: reveals rise and fade in; the brief brightens line by line; the giant line and the tiles drift with the scroll ──
let io, triggers = [];
function motion(root) {
  triggers.forEach((t) => t.kill()); triggers = [];
  if (reduced) { $$(".rv", root).forEach((el) => el.classList.add("in")); $$(".brief-t .ln", root).forEach((l) => (l.style.color = "#fff")); return; }
  io?.disconnect();
  io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { rootMargin: "0px 0px -10% 0px" });
  $$(".rv", root).forEach((el) => io.observe(el));
  if (!window.gsap || !window.ScrollTrigger) return;
  $$(".brief-t .ln", root).forEach((l) => triggers.push(gsap.fromTo(l, { color: "#5a5a5a" }, { color: "#ffffff", ease: "none",
    scrollTrigger: { trigger: l, start: "top 78%", end: "top 48%", scrub: true } }).scrollTrigger));
  const g = $(".giant-t", root);
  if (g) triggers.push(gsap.fromTo(g, { xPercent: 0 }, { xPercent: -38, ease: "none", scrollTrigger: { trigger: g, start: "top bottom", end: "bottom top", scrub: true } }).scrollTrigger);
  $$(".tiles-r", root).forEach((r) => triggers.push(gsap.fromTo(r, { xPercent: r.dataset.dir > 0 ? -18 : 0 }, { xPercent: r.dataset.dir > 0 ? 0 : -18, ease: "none",
    scrollTrigger: { trigger: ".tiles", start: "top bottom", end: "bottom top", scrub: true } }).scrollTrigger));
}

// ── router ──
const pages = { overview: home };
const current = () => { const id = location.hash.slice(1); return id && id !== "overview" && id !== "rooms" ? id : "overview"; };
function render() {
  const id = current(), main = $("#page"), fn = pages[id] || window.PAGES3.room?.(id) || home;
  const html = typeof fn === "function" ? fn() : fn;
  main.innerHTML = html;
  document.body.dataset.page = id;
  $(".hero").hidden = id !== "overview"; $(".field").hidden = id !== "overview";
  document.title = id === "overview" ? P.name : `${id[0].toUpperCase() + id.slice(1)} · ${P.name}`;
  motion(main); mountWidgets(); window.applyDims?.();
  requestAnimationFrame(() => { window.__lenis?.resize?.(); window.ScrollTrigger?.refresh(); });
}
addEventListener("hashchange", () => {
  if (location.hash === "#rooms") { const el = $("#rooms"); if (el) { window.__lenis ? window.__lenis.scrollTo(el) : el.scrollIntoView({ behavior: "smooth" }); } return; }
  window.__lenis ? window.__lenis.scrollTo(0, { immediate: true }) : scrollTo(0, 0);
  render();
});

// the drawing scripts (sheets, the plan, the 3D room, the switch planner) load once the browser is idle
const LIBS = ["../drawings/kit.js", "../drawings/iso.js", "../drawings/roomshell.js", "../drawings/door.js", "../drawings/desk.js", "../drawings/studywall.js", "../drawings/architrave.js", "../drawings/casingb.js", "../drawings/rightwall.js", "../drawings/partitionglass.js", "../drawings/bed.js", "../drawings/leftwall.js", "../drawings/bedwall.js", "../drawings/tvunit.js", "../drawings/doorveneer.js", "../drawings/vanity.js", "../drawings/studywall2.js", "../drawings/wardrobes.js", "../drawings/wardrobe-interiors.js", "../drawings/foldslide.js", "../drawings/bathroom.js", "../drawings/sidetable.js", "../drawings/dressingshell.js", "../drawings/mirror.js", "../drawings/partition3d.js", "../drawings/model3d.js", "../drawings/suite2d.js", "../plans/plans.js", "../cad/print/index.js", "../v2/switchplan.js"];
function loadLibs(done) {
  let left = LIBS.length;
  for (const src of LIBS) { const s = document.createElement("script"); s.src = src; s.async = false; s.onload = s.onerror = () => { if (--left === 0) done(); }; document.body.appendChild(s); }
}

window.PAGES3 = {
  boot() {
    render();
    const deep = current() !== "overview";
    const go = () => loadLibs(() => { window.__libs = true; mountWidgets(); if (current() !== "overview") render(); });
    if (deep || !window.requestIdleCallback) go(); else setTimeout(() => requestIdleCallback(go, { timeout: 2000 }), 1200);
  },
  room: null,           // piece 3 fills this in
  footer, lab, esc, U, itl, motion,
};
})();
