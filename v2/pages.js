// A Study in Teak — v2: the pages below the hero. The first build's renderer, carried over: every section
// is drawn from data.js (untouched), routed by the hash (#overview, #study, #veneer …). v2's own hero, nav and
// menu replace the first build's loader, ticker and menu; the overview's hero is v2's entrance hero.
(() => {
const P = window.PROJECT;
if (!P) return;
// the page lives in /v2/; data.js and the drawings name their files from the site root
const U = (p = "") => (/^(https?:|\/|data:|\.\.\/)/.test(p) ? p : "../" + p);
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = (s = "") => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const STATUS = ["brief", "open", "final"];
const LABEL = { brief: "To brief", open: "Deciding", final: "Final" };
const pad2 = (n) => String(n).padStart(2, "0");

// Status clicks are remembered in this browser; data.js stays the source of truth.
const store = {
  get(k) { try { return JSON.parse(localStorage.getItem("aldwych") || "{}")[k]; } catch { return undefined; } },
  set(k, v) { try { const o = JSON.parse(localStorage.getItem("aldwych") || "{}"); o[k] = v; localStorage.setItem("aldwych", JSON.stringify(o)); } catch {} },
};
const statusOf = (key, base) => store.get(key) || base || "brief";
const pill = (key, base) => { const s = statusOf(key, base); return `<button class="status ${s}" data-key="${key}" data-base="${base || "brief"}" title="Click to change">${LABEL[s]}</button>`; };

// ── the mark: four stars joined by hollowed arcs — the desk's inward corner, drawn as a constellation ──
const star = (x, y, r, w = 0.16) => `<path d="M${x} ${y - r} C${x + r * w} ${y - r * w} ${x + r * w} ${y - r * w} ${x + r} ${y} C${x + r * w} ${y + r * w} ${x + r * w} ${y + r * w} ${x} ${y + r} C${x - r * w} ${y + r * w} ${x - r * w} ${y + r * w} ${x - r} ${y} C${x - r * w} ${y - r * w} ${x - r * w} ${y - r * w} ${x} ${y - r} Z" fill="#fff"/>`;
function markBody() {
  const pts = [[32, 9], [55, 32], [32, 55], [9, 32]];
  const arcs = pts.map((p, i) => { const q = pts[(i + 1) % 4]; return `M${p[0]} ${p[1]} A23 23 0 0 0 ${q[0]} ${q[1]}`; }).join(" ");
  return `<path d="${arcs}" fill="none" stroke="#fff" stroke-width=".9"/>` + pts.map(([x, y], i) => star(x, y, i % 2 ? 7.5 : 9.5)).join("") + star(32, 32, 4.2);
}
function mark(cls = "", big = false) {
  if (!big) return `<svg class="${cls}" viewBox="0 0 64 64" aria-hidden="true">${markBody()}</svg>`;
  // the statement moment: crisp strokes, hairline rays and a faint reflection — no blur, no glow
  const rays = Array.from({ length: 40 }, (_, i) => { const a = (i * 9) * Math.PI / 180, r1 = 30, r2 = 30 + (i % 3 === 0 ? 26 : 16); return `<line x1="${(32 + Math.cos(a) * r1).toFixed(1)}" y1="${(32 + Math.sin(a) * r1).toFixed(1)}" x2="${(32 + Math.cos(a) * r2).toFixed(1)}" y2="${(32 + Math.sin(a) * r2).toFixed(1)}" stroke="#fff" stroke-width=".22" opacity="${i % 3 === 0 ? 0.55 : 0.28}"/>`; }).join("");
  return `<svg class="${cls}" viewBox="-40 -34 144 164" aria-hidden="true">${rays}<g class="mk-body">${markBody()}</g>
    <g transform="translate(0 130) scale(1 -1)" opacity=".07">${markBody()}</g></svg>`;
}

// ── counts ──
function itemsOf(tabId) {
  if (tabId === "veneer") return Object.keys(P.master).filter((k) => P.master[k].options).map((k) => ({ key: "m." + k, s: P.master[k].status }));
  if (tabId === "lighting") return P.lighting.dimmers.map((d) => ({ key: "d." + d.id, s: d.status }));
  const t = P.tabs.find((t) => t.id === tabId);
  return t ? t.items.map((i) => ({ key: "i." + i.id, s: i.status })) : [];
}
function tally(list) {
  const c = { brief: 0, open: 0, final: 0 };
  list.forEach((x) => c[statusOf(x.key, x.s)]++);
  return c;
}
const allTabIds = () => ["veneer", "principles", ...P.tabs.map((t) => t.id), "lighting", "problems"];
const titleOf = (id) => (id === "veneer" ? "Materials" : id === "principles" ? "Principles" : id === "problems" ? "Problems" : id === "lighting" ? "Lighting & Switches" : id === "overview" ? "Overview" : P.tabs.find((t) => t.id === id)?.title || id);
const IMG = {
  overview: "assets/refs/desk-ref-1.jpg", veneer: "assets/refs/desk-ref-1-detail.jpg", doors: "assets/refs/door-ref-1.jpg",
  principles: "assets/refs/paint-ref-1-warm-cream-room-sheer-curtains.jpg",
  problems: "assets/refs/walls-ref-1-panel-moulding.jpg",
  study: "assets/refs/wall-ref-1-library-pilasters.jpg", walls: "assets/refs/walls-ref-1-panel-moulding.jpg", bedroom: "assets/refs/bed-ref-1-low-platform-bed.jpg",
  dressing: "assets/refs/wardrobe-ref-2-steel-leaded-doors-wide.jpg", bathroom: "assets/refs/bathroom-ref-1-painted-ceiling-linework.jpg", lighting: "assets/refs/wall-ref-4-dark-study-bands-sconces.jpg",
  stack: "assets/refs/wall-ref-1-library-pilasters.jpg", footer: "assets/refs/desk-ref-1-detail.jpg",
};
const blurOf = (src) => "v2/media/blur/" + src.split("/").pop().replace(/\.\w+$/, ".jpg");   // pre-blurred, pre-graded
const bg = (src) => `style="background-image:url('${U(src)}')"`;
const today = new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }).toUpperCase();

// ── chrome: ticker + menu ──
function renderChrome() {}

// ── shared blocks ──
const head = (eyebrow, headline, prose = "") => `<div class="head">
  <div class="eyebrow" data-decode>${esc(eyebrow)}</div>
  <h2 class="headline" data-decode>${esc(headline)}</h2>
  ${prose ? `<p class="prose reveal">${esc(prose)}</p>` : ""}</div>`;

function footer() {
  return `<footer class="footer"><div class="footer-bg" ${bg(IMG.footer)}></div>
    <div class="footer-card">
      <span></span>
      <div style="display:flex;flex-direction:column;align-items:center;gap:18px">${mark("mk")}<div class="wordmark" data-decode>A Study in Teak</div></div>
      <div class="footer-btns"><a class="btn" href="#overview">Overview</a><a class="btn" href="#veneer">Materials</a><a class="btn" href="#principles">Principles</a><a class="btn" href="#problems">Problems</a></div>
      <div class="footer-links"><span class="dotline"></span>${P.tabs.map((t) => `<a class="nav-link" href="#${t.id}">${esc(t.title)}</a>`).join("")}<a class="nav-link" href="#lighting">Lighting</a><span class="dotline"></span></div>
      <div class="eyebrow">Rough work · finalised with the family</div>
      <div class="footer-flank l">One room, in teak</div><div class="footer-flank r">Rev. ${today}</div>
    </div></footer>`;
}

// ── overview ──
function overview() {
  const all = tally(allTabIds().flatMap(itemsOf));
  const M = P.master;
  const matv = (k, fallback) => (M[k].value ? esc(M[k].value) : `<b>${fallback}</b>`);

  const hero = `<section class="hero"><div class="phero-bg" ${bg(IMG.overview)}></div>
    <div class="phero-flank l" data-decode>Particulars of the room</div>
    <div class="phero-center">${mark("phero-mark")}<div class="wordmark">A Study in Teak</div></div>
    <div class="phero-flank r" data-decode>One veneer, everywhere</div>
    <div class="phero-foot reveal">A study, a bedroom, a dressing room.<br>One teak desk sets the tone.<br>Every decision on one page.</div>
    <div class="phero-meta"><span>${pad2(allTabIds().length)} sections</span><span>Scroll</span></div></section>`;

  const bone = `<section class="bone on-bone" data-light>
    <div class="eyebrow" data-decode>The room is made of</div>
    <div class="mats">
      <a class="mat reveal" href="#veneer"><span class="mat-word">Teak</span><span class="mat-val">Solid · the desk · final</span></a>
      <a class="mat reveal" href="#veneer"><span class="mat-word">Veneer</span><span class="mat-val">${matv("veneer", "Chosen by look")}</span></a>
      <a class="mat reveal" href="#veneer"><span class="mat-word">Polish</span><span class="mat-val">${matv("polish", "Must match the desk")}</span></a>
    </div></section>`;

  const statement = `<section class="statement">
    ${head("The particulars", "Furniture is drawn once. Every other decision follows from the desk.")}
    <div class="glow reveal">${mark("", true)}</div>
    <div class="tally reveal">
      <div><span class="n">${pad2(all.final)}</span><span class="badge">Final</span></div>
      <div><span class="n">${pad2(all.open)}</span><span class="badge">Deciding</span></div>
      <div><span class="n">${pad2(all.brief)}</span><span class="badge">To brief</span></div>
    </div></section>`;

  const chapters = [
    { title: "The Bedroom", ids: ["bedroom", "study", "walls"], img: "assets/refs/bed-ref-1-low-platform-bed.jpg", line: "The bed and the study: the parchment bed wall, the teak desk, the study wall and the panelled walls." },
    { title: "The Bathroom", ids: ["bathroom"], img: "assets/refs/bathroom-ref-1-painted-ceiling-linework.jpg", line: "A ceiling with fine black hand-painted linework, and the vanity below." },
    { title: "The Dressing", ids: ["dressing"], img: "assets/refs/wardrobe-ref-3-steel-leaded-doors-closeup.jpg", line: "Lit white-glass wardrobes in steel frames, and a folding mirror." },
  ].map((ch, i) => {
    const c = tally(ch.ids.flatMap(itemsOf)), n = c.brief + c.open + c.final;
    return `<article class="scard" style="--i:${i}"><div class="ph" ${bg(ch.img)}></div><div class="body">
      <span class="badge">${pad2(i + 1)}</span><h3 class="h-sm" data-decode>${esc(ch.title)}</h3>
      <p class="prose">${esc(ch.line)}</p><span class="mono" style="font-size:11px;color:var(--dim)">${c.final} of ${n} final</span>
      <div class="meta">${ch.ids.map((id) => `<a class="btn" href="#${id}">${esc(titleOf(id))}</a>`).join("")}</div></div></article>`;
  }).join("");
  const stack = `<section class="section" style="padding-bottom:0">${head("The book", "Three rooms. One book.", "The bedroom with its study, the bathroom and the dressing room — each drawn, specified and decided on its own page.")}</section>
    <section class="stack"><div class="stack-pin"><div class="stack-bg"></div><div class="stack-cards">${chapters}</div></div></section>
    <section class="section">${head("The index", "Every section, and where it stands.")}<div class="wrap"><div class="ledger reveal">${allTabIds().map((id, i) => {
      const c = tally(itemsOf(id)), n = c.brief + c.open + c.final;
      return `<a class="ledger-row" href="#${id}"><span class="badge">${pad2(i + 1)}</span><span class="h-sm">${esc(titleOf(id))}</span>
        <span class="ledger-bar"><i style="width:${n ? (c.final / n) * 100 : 0}%"></i><i class="o" style="width:${n ? (c.open / n) * 100 : 0}%"></i></span>
        <span class="mono ledger-n">${c.final}/${n} final${c.open ? ` · ${c.open} deciding` : ""}</span><span class="ledger-go">→</span></a>`;
    }).join("")}</div></div></section>`;

  const pieces = [
    { id: "desk", tab: "study", title: "The Desk", img: "assets/refs/desk-ref-1.jpg" },
    { id: "shelf", tab: "study", title: "The Study Wall", img: "assets/refs/wall-ref-4-dark-study-bands-sconces.jpg" },
    { id: "door", tab: "doors", title: "The Doors", img: "assets/refs/door-ref-1.jpg" },
    { id: "wardrobe", tab: "dressing", title: "The Wardrobes", img: "assets/refs/wardrobe-ref-3-steel-leaded-doors-closeup.jpg" },
    { id: "bed", tab: "bedroom", title: "The Bed", img: "assets/refs/bed-ref-1-low-platform-bed.jpg" },
  ].map((p, i) => {
    const item = P.tabs.find((t) => t.id === p.tab).items.find((x) => x.id === p.id);
    const lead = item.parts.find((x) => x.value && !x.inherit)?.value || "";
    const s = statusOf("i." + item.id, item.status);
    return `<div class="xcard${i === 0 ? " active" : ""}" data-x>
      <div class="bg" ${bg(p.img)}></div>
      <span class="badge">${pad2(i + 1)}</span><h3 class="h-sm">${esc(p.title)}</h3>
      <div class="xbody"><p class="prose">${esc(lead.length > 230 ? lead.slice(0, 227).replace(/\s+\S*$/, "") + "…" : lead)}</p>
        <a class="btn" href="#${p.tab}" data-item="${item.id}">${LABEL[s]} · Open</a></div></div>`;
  }).join("");
  const row = `<section class="section">${head("The pieces", "Drawn to be made, not just imagined.")}<div class="row reveal">${pieces}</div></section>`;

  const plans = `<div class="m3d" id="m3d"></div>`;
  const plan = `<section class="section">${head("The room", "A drawing, in three dimensions. Drag it about.")}
    <div class="wrap"><div class="plan-grid reveal"><div class="panel" style="padding:12px">${plans}</div>
    <div class="panel"><div class="facts">${P.room.facts.map((f) => `<div class="k">${esc(f.k)}</div><div class="v">${esc(f.v)}</div>`).join("")}</div></div></div></div></section>`;

  const K = window.DRESS;
  const dressFacts = K ? [
    ["SHARED WALL", "9 ft 3 in — with the bedroom"],
    ["CEILING", "9 ft 1 in plain · 10 ft 0 in at the dome (centre)"],
    ["WARDROBES", "Left and right · 3 ft modules · up to 9 ft 0 in"],
    ["THE TUNNEL", "Behind a hidden cupboard door · 3 ft 6 in × 7 ft 8 in"],
  ] : [["STATUS", "First pass — see the Dressing tab"]];
  const dressing = `<section class="section">${head("The dressing room", "First pass, from a sketch. Drag it about.")}
    <div class="wrap"><div class="plan-grid reveal"><div class="panel" style="padding:12px"><div class="m3d" id="dress3d"></div></div>
    <div class="panel"><div class="facts">${dressFacts.map(([k, v]) => `<div class="k">${esc(k)}</div><div class="v">${esc(v)}</div>`).join("")}</div>
    <a class="btn" href="#dressing" style="margin-top:16px">Full layout, drawing and notes</a></div></div></div></section>`;

  return bone + statement + stack + row + plan + dressing + footer();
}

// ── pages ──
function pageHero(id, eyebrow, title, prose, flankR) {
  const c = tally(itemsOf(id)), n = c.brief + c.open + c.final;
  return `<section class="phero short page-hero"><div class="phero-bg" ${bg(blurOf(IMG[id] || IMG.overview))}></div>
    <div class="phero-flank l" data-decode>${esc(eyebrow)}</div>
    <div class="phero-center">
      <span class="badge">${pad2(allTabIds().indexOf(id) + 1)}</span>
      <h1 class="wordmark" data-decode>${esc(title)}</h1>
      ${prose ? `<p class="prose-lg reveal">${esc(prose)}</p>` : ""}
    </div>
    <div class="phero-flank r" data-decode>${flankR || `${c.final} of ${n} final`}</div></section>`;
}

// The three-dimensional room lives on the overview; it is rebuilt whenever that page renders.
let model = null;
function mountModel() {
  const el = document.getElementById("m3d");
  model = null;
  if (el && window.MODEL3D) { try { model = window.MODEL3D.mount(el); } catch (e) { console.error("model3d:", e); el.innerHTML = `<div class="empty">Model unavailable</div>`; } }
  const pel = document.getElementById("p3d");
  if (pel && window.PARTITION3D) { try { window.PARTITION3D.mount(pel, { tv: true }); } catch (e) { console.error("partition3d:", e); pel.innerHTML = `<div class="empty">Model unavailable</div>`; } }
  const del = document.getElementById("dress3d");
  if (del && window.DRESSING3D) { try { window.DRESSING3D.mount(del); } catch (e) { console.error("dressing3d:", e); del.innerHTML = `<div class="empty">Model unavailable</div>`; } }
}

function nextLink(id) {
  const ids = allTabIds(), nx = ids[(ids.indexOf(id) + 1) % ids.length];
  return `<section class="next"><span class="eyebrow" data-decode>Next section</span><a href="#${nx}"><h2 class="headline" data-decode>${esc(titleOf(nx))}</h2></a><a class="btn" href="#${nx}">Continue</a></section>`;
}

const allRules = () => P.principles.groups.flatMap((g) => g.rules.map((r) => ({ ...r, gn: g.n, gname: g.name })));

function atLink(a) {
  const t = P.tabs.find((x) => x.id === a);
  if (t) return `<a class="btn steel" href="#${a}">${esc(t.title)}</a>`;
  if (a === "veneer" || a === "lighting") return `<a class="btn steel" href="#${a}">${esc(titleOf(a))}</a>`;
  for (const tb of P.tabs) { const it = tb.items.find((i) => i.id === a); if (it) return `<a class="btn steel" href="#${tb.id}" data-item="${a}">${esc(it.name)}</a>`; }
  return "";
}

// Every rule also appears on the card it governs, so the reasoning sits next to the decision.
function pointers(id) {
  const m = allRules().filter((r) => (r.at || []).includes(id));
  if (!m.length) return "";
  return `<div class="pointers reveal">
    <div class="pointers-top"><span class="eyebrow" data-decode>The reasoning here</span><a class="btn steel" href="#principles">All principles</a></div>
    ${m.map((r) => `<article class="pointer">
      <span class="pointer-n mono">${esc(r.gn)} · ${esc(r.gname)}</span>
      <h4 class="pointer-t">${esc(r.t)}</h4>
      <p class="pointer-b">${esc(r.body)}</p>
      ${r.check ? `<p class="pointer-c"><span>Where it stands</span>${esc(r.check)}</p>` : ""}
    </article>`).join("")}</div>`;
}

function sheets(list) {
  const ds = [].concat(list || []).filter((d) => window.DRAWINGS?.[d]);
  if (!ds.length) return "";
  return `<div class="sheets">${ds.map((d) => {
    const D = window.DRAWINGS[d], [name, code] = D.title.split(" · ");
    return `<div class="sheet-card reveal"><div class="sheet-top"><h3 class="h-sm">${esc(name)}</h3><div class="sheet-tools"><span class="mono">${esc(code || "")}</span>${dimToggle()}${paperToggle()}</div></div>
      <figure class="dwg" data-open="dwg:${d}">${D.svg}</figure>
      <div class="cad-links"><span class="mono">Editable CAD</span>${D.model === false ? "" : `<a class="btn" href="../cad/${d}-model.dxf" download>DXF · true size</a>`}<a class="btn" href="../cad/${d}-sheet.dxf" download>DXF · A3 sheet</a><a class="btn" href="../cad/${d}.svg" download>SVG</a><button class="btn steel" data-open="dwg:${d}">Full size</button></div></div>`;
  }).join("")}</div>`;
}

const PSTAT = { blocking: "Blocking", open: "Open", accepted: "Accepted", solved: "Solved" };

function problems() {
  const PB = P.problems, c = {};
  PB.items.forEach((i) => (c[i.status] = (c[i.status] || 0) + 1));
  const live = (c.blocking || 0) + (c.open || 0);
  const row = (k, v) => (v ? `<div class="pb-row"><div class="pb-k">${k}</div><div class="pb-v">${esc(v)}</div></div>` : "");
  return pageHero("problems", "The room was not built square", "Problems", PB.intro, `${live} still live`) +
    `<section class="bone on-bone index-strip" data-light><div class="eyebrow" style="text-align:center" data-decode>Where they stand</div>
      <div class="index">${Object.keys(PSTAT).filter((k) => c[k]).map((k) => `<span class="btn" style="pointer-events:none">${esc(PSTAT[k])} · ${pad2(c[k])}</span>`).join("")}</div></section>` +
    `<div class="probs">${PB.items.map((i, k) => `<article class="prob reveal ${i.status}" id="${i.id}">
      <div class="prob-head"><span class="badge">${pad2(k + 1)}</span><h3 class="prob-t">${esc(i.name)}</h3><span class="pstat ${i.status}">${PSTAT[i.status]}</span></div>
      ${row("What", i.what)}${row("What it damages", i.effect)}${row("What we are doing", i.doing)}${row("What is needed", i.need)}
      ${sheets(i.drawings)}
    </article>`).join("")}</div>` +
    nextLink("problems") + footer();
}

function principles() {
  const PR = P.principles, n = PR.groups.reduce((a, g) => a + g.rules.length, 0);
  return pageHero("principles", "Why the room is the way it is", "Principles", PR.intro, `${n} rules`) +
    PR.groups.map((g) => `<div class="group-label"><span class="eyebrow" data-decode>${esc(g.n)} · ${esc(g.name)}</span></div>
      <div class="wrap"><p class="prose gline">${esc(g.line)}</p></div>
      <div class="rules">${g.rules.map((r) => `<article class="rule reveal" id="rule-${r.id}">
        <div class="rule-l"><span class="mono">${esc(g.n)}</span><h3 class="rule-t">${esc(r.t)}</h3></div>
        <div class="rule-r">
          <p class="rule-b">${esc(r.body)}</p>
          ${r.check ? `<div class="rule-c"><span class="eyebrow">Where the room stands</span><p>${esc(r.check)}</p></div>` : ""}
          ${(r.at || []).length ? `<div class="rule-at"><span class="mono">Applies to</span>${r.at.map(atLink).join("")}</div>` : ""}
        </div></article>`).join("")}</div>`).join("") +
    nextLink("principles") + footer();
}

function partValue(p) {
  if (p.inherit && !p.value) {
    const m = P.master[p.inherit];
    return (m.value ? esc(m.value) : `<span class="tbd">Master not chosen</span>`) + `<span class="inherit">From master</span>`;
  }
  return (p.value ? esc(p.value) : `<span class="tbd">To brief</span>`) + (p.hint && !p.value ? `<span class="hint">${esc(p.hint)}</span>` : "");
}

function tabPage(t) {
  const c = tally(itemsOf(t.id));
  const index = `<section class="bone on-bone index-strip" data-light><div class="eyebrow" style="text-align:center" data-decode>In this section</div>
    <div class="index">${t.items.map((i, k) => `<a class="btn" href="#${t.id}" data-item="${i.id}">${pad2(k + 1)} · ${esc(i.name)}</a>`).join("")}</div>
    <div class="tally-ink">${c.final} final · ${c.open} deciding · ${c.brief} to brief</div></section>`;
  const items = t.items.map((i, k) => `
    <section class="item" id="${i.id}">
      <div class="item-head">
        <span class="badge">${pad2(k + 1)} / ${pad2(t.items.length)}</span>
        <div class="eyebrow" data-decode>${esc(t.title)}</div>
        <h2 class="headline" data-decode>${esc(i.name)}</h2>
        ${pill("i." + i.id, i.status)}
      </div>
      <div class="wrap"><div class="spec reveal">${i.parts.map((p) => `<div class="spec-row"><div class="lab">${esc(p.label)}</div><div class="val">${partValue(p)}</div></div>`).join("")}</div></div>
      ${i.refs?.length ? `<div class="gallery-label"><span class="eyebrow" data-decode>References · ${pad2(i.refs.length)}</span>${i.refs.length > 3 ? `<div class="gallery-nav"><button class="btn" data-gal="-1" aria-label="Previous">←</button><button class="btn" data-gal="1" aria-label="Next">→</button></div>` : ""}</div>
        <div class="gallery reveal${i.refs.length < 3 ? " few" : ""}">${i.refs.map((r) => `<figure class="shot" data-open="img:${esc(U(r.src))}"><div class="frame"><img src="${esc(U(r.src))}" alt="" loading="lazy"></div><figcaption>${esc(r.caption)}</figcaption></figure>`).join("")}</div>` : ""}
      ${sheets(i.drawings || i.drawing)}
      ${i.model3d ? `<div class="wrap"><div class="m3d p3d" id="p3d"></div></div>` : ""}
      ${i.dressing3d ? `<div class="wrap"><div class="m3d p3d" id="dress3d"></div></div>` : ""}
      ${pointers(i.id)}
      ${i.notes?.length ? `<div class="asks reveal"><span class="eyebrow">Notes</span><ul class="ask-list notes">${i.notes.map((n) => `<li>${esc(n)}</li>`).join("")}</ul></div>` : ""}
      ${i.questions?.length ? `<div class="asks reveal"><span class="eyebrow">Open questions</span><ul class="ask-list">${i.questions.map((q, n) => `<li><span class="badge">Q${pad2(n + 1)}</span><span>${esc(q)}</span></li>`).join("")}</ul></div>` : ""}
    </section>`).join("");
  return pageHero(t.id, t.kicker, t.title, t.intro) + index + pointers(t.id) + items + nextLink(t.id) + footer();
}

function veneer() {
  const M = P.master;
  const card = (k, name) => `<div class="mcard reveal">
      <div class="mcard-top"><span class="eyebrow">${name}</span>${pill("m." + k, M[k].status)}</div>
      <div class="value">${M[k].value ? esc(M[k].value) : `<span class="tbd" style="font-size:14px">Not chosen</span>`}</div>
      ${M[k].rule ? `<p class="rule">${esc(M[k].rule)}</p>` : ""}
      <div class="opts">${M[k].options.map((o) => `<span class="opt ${o === M[k].value ? "sel" : ""}">${esc(o)}</span>`).join("")}</div></div>`;
  const chips = (list) => `<div class="chips" style="margin-top:24px">${list.map((a) => `<span class="opt">${esc(a)}</span>`).join("")}</div>`;
  return pageHero("veneer", "One material, everywhere", "Materials", "The master materials. Every piece inherits them unless its spec sheet says otherwise.") +
    `<section class="bone on-bone index-strip" data-light><div class="eyebrow" style="text-align:center" data-decode>Used across the room</div><div class="index">${M.appliesTo.map((a) => `<span class="btn" style="pointer-events:none">${esc(a)}</span>`).join("")}</div></section>` +
    `<div class="group-label"><span class="eyebrow" data-decode>01 · Veneer</span></div><div class="cards">${card("veneer", "Veneer")}${card("grain", "Grain / cut")}</div>
    ${(M.veneer.refs || []).length ? `<div class="gallery reveal few" style="margin-top:24px">${M.veneer.refs.map((r) => `<figure class="shot" data-open="img:${esc(U(r.src))}"><div class="frame"><img src="${esc(U(r.src))}" alt="" loading="lazy"></div><figcaption>${esc(r.caption)}</figcaption></figure>`).join("")}</div>` : ""}
    <div class="wrap"><div class="eyebrow" style="text-align:center;margin-top:32px;color:var(--dim)">Used for</div>${chips(M.appliesTo)}</div>
    <div class="group-label"><span class="eyebrow" data-decode>02 · Solid wood</span></div><div class="cards">${card("wood", "Wood type")}</div>
    <div class="wrap"><div class="eyebrow" style="text-align:center;margin-top:32px;color:var(--dim)">Used for</div>${chips(M.wood.usedFor)}</div>
    <div class="group-label"><span class="eyebrow" data-decode>03 · Polish</span></div><div class="cards">${card("polish", "Polish")}${card("tone", "Tone")}</div>
    <div class="group-label"><span class="eyebrow" data-decode>04 · Stone</span></div><div class="cards">${card("floor", "Room floor")}${card("trimStone", "Border & skirting")}${card("bathStone", "Bathroom")}</div>
    ${["floor", "trimStone", "bathStone"].flatMap((k) => M[k].refs || []).length ? `<div class="gallery reveal" style="margin-top:24px">${["floor", "trimStone", "bathStone"].flatMap((k) => M[k].refs || []).map((r) => `<figure class="shot" data-open="img:${esc(U(r.src))}"><div class="frame"><img src="${esc(U(r.src))}" alt="" loading="lazy"></div><figcaption>${esc(r.caption)}</figcaption></figure>`).join("")}</div>` : ""}
    <div class="group-label"><span class="eyebrow" data-decode>05 · Wall paint</span></div><div class="cards">${card("paint", "Paint")}</div>
    ${(M.paint.refs || []).length ? `<div class="gallery reveal few" style="margin-top:24px">${M.paint.refs.map((r) => `<figure class="shot" data-open="img:${esc(U(r.src))}"><div class="frame"><img src="${esc(U(r.src))}" alt="" loading="lazy"></div><figcaption>${esc(r.caption)}</figcaption></figure>`).join("")}</div>` : ""}
    <div class="group-label"><span class="eyebrow" data-decode>06 · The wood scheme</span></div>
    <div class="wrap"><p class="prose" style="text-align:center;color:var(--dim);max-width:560px;margin:0 auto 32px">${esc(P.scheme.intro)}</p>
      <div class="spec reveal">${P.scheme.rows.map((r) => `<div class="spec-row"><div class="lab">${esc(r.k)}</div><div class="val">${esc(r.v)}</div></div>`).join("")}</div></div>
    ${M.notes.length ? `<div class="asks reveal" style="margin-top:var(--gap)"><span class="eyebrow">Notes</span><ul class="ask-list notes">${M.notes.map((n) => `<li>${esc(n)}</li>`).join("")}</ul></div>` : ""}` +
    pointers("veneer") + nextLink("veneer") + footer();
}

function lighting() {
  const L = P.lighting, dimName = (id) => L.dimmers.find((d) => d.id === id)?.name;
  const dims = L.dimmers.map((d) => {
    const members = L.lights.filter((l) => l.dimmer === d.id);
    return `<div class="mcard reveal"><div class="mcard-top"><span class="eyebrow">Dimmer group</span>${pill("d." + d.id, d.status)}</div>
      <div class="value">${esc(d.name)}</div><p class="rule">${esc(d.rule)}</p>
      <div class="opts">${members.map((m) => `<span class="opt sel">${esc(m.name)} · ${esc(L.zones.find((z) => z.id === m.zone).name)}</span>`).join("")}</div></div>`;
  }).join("");
  const zones = L.zones.map((z, i) => {
    const rows = L.lights.filter((l) => l.zone === z.id);
    return `<div class="sheet-card reveal"><div class="sheet-top"><h3 class="h-sm">${esc(z.name)}</h3><span class="badge">${pad2(rows.length)} group${rows.length === 1 ? "" : "s"}</span></div>
      ${rows.length ? `<table><thead><tr><th>Light</th><th>Type</th><th>Switch</th><th>Dimmer</th><th>Notes</th></tr></thead><tbody>
        ${rows.map((l) => `<tr><td data-l="Light">${esc(l.name)}</td><td data-l="Type">${esc(l.type)}</td><td data-l="Switch">${esc(l.switch)}</td><td data-l="Dimmer">${l.dimmer ? `<span class="opt sel">${esc(dimName(l.dimmer))}</span>` : "—"}</td><td data-l="Notes">${esc(l.notes) || "—"}</td></tr>`).join("")}
      </tbody></table>` : `<div class="empty">No lights briefed yet</div>`}</div>`;
  }).join("");
  const boards = L.boards.length
    ? L.boards.map((b) => `<div class="sheet-card reveal"><div class="sheet-top"><h3 class="h-sm">${esc(b.location)}</h3></div><table><thead><tr><th>#</th><th>Controls</th></tr></thead><tbody>${b.switches.map((s, i) => `<tr><td>${pad2(i + 1)}</td><td>${esc(s)}</td></tr>`).join("")}</tbody></table></div>`).join("")
    : `<div class="sheet-card reveal"><div class="empty">Switch boards not mapped yet</div></div>`;
  return pageHero("lighting", "Switch plan", "Lighting & Switches", L.intro) +
    `<section class="bone on-bone index-strip" data-light><div class="eyebrow" style="text-align:center" data-decode>The one rule</div><div class="tally-ink" style="font:400 20px/1.2 var(--cond);color:var(--void)">${esc(L.dimmers[0]?.rule || "")}</div></section>` +
    `<div class="group-label"><span class="eyebrow" data-decode>01 · Dimmer groups</span></div><div class="cards">${dims}</div>
    <div class="group-label"><span class="eyebrow" data-decode>02 · By zone</span></div><div class="sheets" style="margin-top:0">${zones}</div>
    <div class="group-label"><span class="eyebrow" data-decode>03 · Switch boards</span></div><div class="sheets" style="margin-top:0">${boards}</div>
    ${(L.notes || []).length ? `<div class="asks reveal" style="margin-top:var(--gap)"><span class="eyebrow">Notes</span><ul class="ask-list notes">${L.notes.map((n) => `<li>${esc(n)}</li>`).join("")}</ul></div>` : ""}` +
    pointers("lighting") + nextLink("lighting") + footer();
}

// ── drawings: dark void (default) or light paper for reading detail; remembered in this browser ──
const paperMode = () => { try { return localStorage.getItem("sheet-mode-v2") || "dark"; } catch { return "dark"; } };
const PAPERS = [["light", "Light"], ["dark", "Dark"], ["blue", "Blueprint"]];
const paperToggle = () => `<div class="seg" role="group" aria-label="Drawing background">${PAPERS.map(([k, l]) => `<button class="${paperMode() === k ? "on" : ""}" data-sheet="${k}">${l}</button>`).join("")}</div>`;
const applyPaper = () => { const m = paperMode(); document.body.classList.toggle("sheets-dark", m === "dark"); document.body.classList.toggle("sheets-blue", m === "blue"); $$("[data-sheet]").forEach((b) => b.classList.toggle("on", b.dataset.sheet === m)); };
document.addEventListener("click", (e) => {
  const b = e.target.closest("[data-sheet]");
  if (!b) return;
  try { localStorage.setItem("sheet-mode-v2", b.dataset.sheet); } catch {}
  applyPaper();

});

// ── dimensions: off, in millimetres, or in feet and inches. Every chain carries both labels. ──
const DIMS = ["off", "mm", "ft"];
const dimMode = () => { try { const v = localStorage.getItem("dim-mode-v1"); return DIMS.includes(v) ? v : "ft"; } catch { return "ft"; } };
const dimToggle = () => `<div class="seg" role="group" aria-label="Dimensions"><button class="${dimMode() === "off" ? "on" : ""}" data-dim="off">Off</button><button class="${dimMode() === "mm" ? "on" : ""}" data-dim="mm">mm</button><button class="${dimMode() === "ft" ? "on" : ""}" data-dim="ft">Ft·In</button></div>`;
const applyDims = () => {
  const m = dimMode();
  DIMS.forEach((k) => document.body.classList.toggle(`dims-${k}`, k === m));
  $$("[data-dim]").forEach((b) => b.classList.toggle("on", b.dataset.dim === m));
};
document.addEventListener("click", (e) => {
  const b = e.target.closest("[data-dim]");
  if (!b) return;
  try { localStorage.setItem("dim-mode-v1", b.dataset.dim); } catch {}
  applyDims();
});

// ── motion: decode (characters resolve left to right) + reveal ──
const GLYPHS = "abcdefghijklmnopqrstuvwxyz";
function decode(el) {
  if (el.dataset.done) return;
  el.dataset.done = 1;
  const text = el.textContent, chars = [...text], dur = 620, per = Math.min(22, 420 / Math.max(chars.length, 1));
  el.textContent = "";
  const spans = chars.map((c) => { const s = document.createElement("span"); s.textContent = c; s.style.opacity = 0; s.style.display = "inline-block"; if (c === " ") s.style.whiteSpace = "pre"; el.appendChild(s); return s; });
  el.classList.add("decoded");
  const t0 = performance.now();
  (function tick(now) {
    const t = now - t0;
    let done = true;
    spans.forEach((s, i) => {
      const start = i * per, settle = start + 260;
      if (chars[i] === " ") { s.style.opacity = 1; return; }
      if (t < settle) { done = false; s.style.opacity = Math.max(0, Math.min(1, (t - start) / 200)); s.textContent = GLYPHS[(Math.random() * GLYPHS.length) | 0]; }
      else { s.style.opacity = 1; s.textContent = chars[i]; }
    });
    if (!done && t < dur + chars.length * per) requestAnimationFrame(tick);
    else el.textContent = text;
  })(t0);
}
let io;
function animate(root) {
  if (document.body.classList.contains("reduced")) { $$("[data-decode]", root).forEach((el) => el.classList.add("decoded")); $$(".reveal", root).forEach((el) => el.classList.add("in")); return; }
  io?.disconnect();
  io = new IntersectionObserver((es) => es.forEach((e) => {
    if (!e.isIntersecting) return;
    if (e.target.hasAttribute("data-decode")) decode(e.target); else e.target.classList.add("in");
    io.unobserve(e.target);
  }), { rootMargin: "0px 0px -8% 0px" });
  $$("[data-decode], .reveal", root).forEach((el, i) => { if (el.classList.contains("reveal")) el.style.transitionDelay = `${(i % 3) * 0.08}s`; io.observe(el); });
}

// ── status pills update in place (no re-render, no re-animation) ──
document.addEventListener("click", (e) => {
  const b = e.target.closest(".status[data-key]");
  if (!b) return;
  const cur = statusOf(b.dataset.key, b.dataset.base), nx = STATUS[(STATUS.indexOf(cur) + 1) % 3];
  store.set(b.dataset.key, nx);
  $$(`.status[data-key="${b.dataset.key}"]`).forEach((x) => { x.className = `status ${nx}`; x.textContent = LABEL[nx]; });
  renderChrome(current());
});

// ── expanding row: hover or tap to open a card ──
document.addEventListener("mouseover", (e) => {
  const c = e.target.closest("[data-x]");
  if (!c || c.classList.contains("active")) return;
  $$("[data-x]", c.parentElement).forEach((x) => x.classList.toggle("active", x === c));
});

// ── gallery arrows ──
document.addEventListener("click", (e) => {
  const b = e.target.closest("[data-gal]");
  if (!b) return;
  const g = b.closest(".gallery-label").nextElementSibling;
  g.scrollBy({ left: +b.dataset.gal * (g.clientWidth / 3 + 3), behavior: "smooth" });
});

// ── jump to an item on a page ──
document.addEventListener("click", (e) => {
  const a = e.target.closest("[data-item]");
  if (!a) return;
  const tab = a.getAttribute("href").slice(1), item = a.dataset.item;
  e.preventDefault();
  const go = () => { const el = document.getElementById(item); if (el) window.scrollTo({ top: el.getBoundingClientRect().top + scrollY - 70, behavior: "smooth" }); };
  if (current() === tab) go(); else { pendingItem = item; location.hash = tab; }
});
let pendingItem = null;



// ── lightbox: the drawing zooms and pans, the page never does ──
// Two zooms in play. During a gesture the drawing is scaled by TRANSFORM, which is smooth but only
// stretches pixels; the moment the gesture ends that zoom is COMMITTED into the element's width, so
// the SVG redraws itself at the new size and the lines come back sharp. Both scale about the
// top-left corner, so the picture never jumps as it changes hands.
const LB = { z: 1, s: 1, x: 0, y: 0, pts: new Map(), last: null, down: null, tap: 0, commit: 0 };
const lbEls = () => [$("#lightbox .lb-body"), $("#lightbox .lb-inner")];
function lbApply() {
  const [body, inner] = lbEls(); if (!body || !inner) return;
  // Free panning. The only limit is that a corner must stay in view so it can always be dragged
  // back — no snapping to the middle, which is what stopped it moving before.
  const bw = body.clientWidth, bh = body.clientHeight;
  const iw = inner.offsetWidth * LB.s, ih = inner.offsetHeight * LB.s, m = 60;
  LB.x = Math.min(bw - m, Math.max(m - iw, LB.x));
  LB.y = Math.min(bh - m, Math.max(m - ih, LB.y));
  inner.style.transform = `translate(${LB.x}px,${LB.y}px) scale(${LB.s})`;
}
// fold the gesture's scale into the layout, so the drawing redraws sharp at its new size
function lbCommit() {
  const [body, inner] = lbEls(); if (!body || !inner || Math.abs(LB.s - 1) < 0.001) return;
  LB.z = Math.max(1, Math.min(8, LB.z * LB.s)); LB.s = 1;
  inner.style.width = LB.z * 100 + "%";
  lbApply();
}
function lbZoomAt(mult, cx, cy) {
  const [body] = lbEls(); if (!body) return;
  const r = body.getBoundingClientRect(), px = cx - r.left, py = cy - r.top;
  const want = Math.max(1, Math.min(8, LB.z * LB.s * mult)), ns = want / LB.z;
  LB.x = px - ((px - LB.x) * ns) / LB.s; LB.y = py - ((py - LB.y) * ns) / LB.s; LB.s = ns;
  lbApply();
}
function lbFit() {
  const [body, inner] = lbEls(); if (!body || !inner) return;
  LB.z = 1; LB.s = 1; LB.x = 0; LB.y = 0; inner.style.width = "100%";
  LB.y = Math.max(0, (body.clientHeight - inner.offsetHeight) / 2);
  lbApply();
}
function lbClose() { const lb = $("#lightbox"); lb.hidden = true; lb.innerHTML = ""; document.documentElement.classList.remove("lb-open"); }

document.addEventListener("click", (e) => {
  const lb = $("#lightbox");
  const f = e.target.closest("[data-open]");
  if (f && !e.target.closest("a.btn")) {
    const [kind, ref] = f.dataset.open.split(/:(.*)/s);
    Object.assign(LB, { z: 1, s: 1, x: 0, y: 0, last: null }); LB.pts.clear();
    lb.innerHTML = `<div class="lb-bar"><span class="mono" style="font-size:11px;color:var(--dim)">${kind === "dwg" ? esc(window.DRAWINGS[ref].title) : "Reference"}</span>
      <div class="grp">${kind === "dwg" ? dimToggle() + paperToggle() : ""}<button class="btn" data-z="-">−</button><button class="btn" data-z="0">Fit</button><button class="btn" data-z="+">+</button><button class="btn" data-z="x">Close</button></div></div>
      <div class="lb-body"><div class="lb-inner${kind === "dwg" ? " is-dwg" : ""}">${kind === "dwg" ? window.DRAWINGS[ref].svg : `<img src="${ref}">`}</div></div>
      <div class="lb-hint mono">Pinch or scroll to zoom · drag to move · double-tap to zoom in</div>`;
    lb.hidden = false;
    document.documentElement.classList.add("lb-open");
    const img = lb.querySelector(".lb-inner img");
    if (img && !img.complete) img.addEventListener("load", lbFit, { once: true });
    requestAnimationFrame(lbFit);
    return;
  }
  const z = e.target.closest("[data-z]");
  if (z) {
    if (z.dataset.z === "x") return lbClose();
    if (z.dataset.z === "0") return lbFit();
    const [body] = lbEls(), r = body.getBoundingClientRect();
    lbZoomAt(z.dataset.z === "+" ? 1.6 : 1 / 1.6, r.left + r.width / 2, r.top + r.height / 2);
    lbCommit();
  }
});

document.addEventListener("pointerdown", (e) => {
  const body = e.target.closest("#lightbox .lb-body"); if (!body) return;
  e.preventDefault();
  body.setPointerCapture(e.pointerId);
  LB.pts.set(e.pointerId, [e.clientX, e.clientY]);
  if (LB.pts.size === 1) LB.down = { x: e.clientX, y: e.clientY, t: Date.now(), moved: false };
  LB.last = null;
});
document.addEventListener("pointermove", (e) => {
  if (!LB.pts.has(e.pointerId)) return;
  LB.pts.set(e.pointerId, [e.clientX, e.clientY]);
  const p = [...LB.pts.values()];
  if (LB.down && Math.hypot(e.clientX - LB.down.x, e.clientY - LB.down.y) > 8) LB.down.moved = true;
  if (p.length === 1) {
    const [x, y] = p[0];
    if (LB.last && LB.last.n === 1) { LB.x += x - LB.last.x; LB.y += y - LB.last.y; lbApply(); }
    LB.last = { n: 1, x, y };
  } else {
    const cx = (p[0][0] + p[1][0]) / 2, cy = (p[0][1] + p[1][1]) / 2, d = Math.hypot(p[0][0] - p[1][0], p[0][1] - p[1][1]);
    if (LB.last && LB.last.n === 2) {
      LB.x += cx - LB.last.x; LB.y += cy - LB.last.y;        // two fingers move the drawing as well as scale it
      const k = d / LB.last.d;
      if (Math.abs(k - 1) > 0.004) lbZoomAt(k, cx, cy); else lbApply();
    }
    LB.last = { n: 2, x: cx, y: cy, d };
  }
});
const lbUp = (e) => {
  if (!LB.pts.has(e.pointerId)) return;
  LB.pts.delete(e.pointerId); LB.last = null;
  if (LB.pts.size) return;
  // A tap is a touch that did not move and did not linger. Two of them in quick succession zoom
  // in on that spot — a drag, however fast, is never mistaken for one.
  const d = LB.down; LB.down = null;
  if (d && !d.moved && Date.now() - d.t < 260) {
    const now = Date.now();
    if (now - LB.tap < 320) { lbZoomAt(LB.z * LB.s > 1.2 ? 1 / (LB.z * LB.s) : 2.5, d.x, d.y); LB.tap = 0; }
    else LB.tap = now;
  }
  lbCommit();                                                // gesture over — redraw sharp
};
document.addEventListener("pointerup", lbUp);
document.addEventListener("pointercancel", lbUp);
document.addEventListener("wheel", (e) => {
  if (!e.target.closest("#lightbox .lb-body")) return;
  e.preventDefault();
  lbZoomAt(Math.exp(-e.deltaY * (e.ctrlKey ? 0.01 : 0.0022)), e.clientX, e.clientY);
  clearTimeout(LB.commit); LB.commit = setTimeout(lbCommit, 180);
}, { passive: false });
["gesturestart", "gesturechange"].forEach((t) => document.addEventListener(t, (e) => { if (document.documentElement.classList.contains("lb-open")) e.preventDefault(); }, { passive: false }));
window.addEventListener("resize", () => { if (!$("#lightbox").hidden) lbApply(); });

document.addEventListener("keydown", (e) => { if (e.key === "Escape") lbClose(); });

// ── scroll state: nav tightens; turns dark over the bone strip ──
function onScroll() {
  document.body.classList.toggle("scrolled", scrollY > 24);
  const y = 36, light = $$("[data-light]").some((s) => { const r = s.getBoundingClientRect(); return r.top < y && r.bottom > y; });
  document.body.classList.toggle("on-light", light);
}
window.addEventListener("scroll", onScroll, { passive: true });

// ── router with a soft cross-fade ──
const current = () => { const id = location.hash.slice(1) || "overview"; return ["veneer", "principles", "lighting", "problems", ...P.tabs.map((t) => t.id)].includes(id) ? id : "overview"; };
function render(delayMotion = 0) {
  const id = current(), t = P.tabs.find((t) => t.id === id), main = $("#page");
  main.innerHTML = id === "veneer" ? veneer() : id === "principles" ? principles() : id === "problems" ? problems() : id === "lighting" ? lighting() : t ? tabPage(t) : overview();
  renderChrome(id);
  document.title = `${titleOf(id)} · ${P.name}`;
  const hero = document.querySelector(".hero[data-intro]");
  if (hero) hero.style.display = id === "overview" ? "" : "none";
  if (id !== "overview") document.documentElement.classList.add("is-ready");   // a deep link: the nav shows at once
  requestAnimationFrame(() => { window.__lenis?.resize?.(); window.ScrollTrigger?.refresh(); });
  main.classList.remove("leaving"); main.classList.add("entering");
  setTimeout(() => main.classList.remove("entering"), 800);
  delayMotion ? setTimeout(() => animate(main), delayMotion) : animate(main);
  applyPaper();
  applyDims();
  mountModel();
  // the rooms band holds the screen while the three cards come in one after another, side by side (not on phones)
  window.__stackST?.kill(); window.__stackST = null;
  const band = main.querySelector(".stack");
  if (band && window.gsap && window.ScrollTrigger && !document.body.classList.contains("reduced")) {
    const tl = gsap.timeline({ defaults: { ease: "power2.out", duration: 1 } });
    if (innerWidth >= 768) {
      band.querySelectorAll(".scard").forEach((c, i) => tl.fromTo(c, { autoAlpha: 0, yPercent: 24 }, { autoAlpha: 1, yPercent: 0 }, i * 0.9));
      tl.to({}, { duration: 0.9 });   // hold the full row a moment before the band scrolls on
    } else {
      // phones: the row is wider than the screen, so the scroll carries it sideways — still side by side
      band.classList.add("is-track");
      const track = band.querySelector(".stack-cards");
      tl.to(track, { x: () => -(track.scrollWidth - innerWidth), ease: "none", duration: 3 });
    }
    window.__stackST = ScrollTrigger.create({ trigger: band, start: "top top", end: "bottom bottom", scrub: 0.6, animation: tl, invalidateOnRefresh: true });
  }
  onScroll();
  if (pendingItem) { const it = pendingItem; pendingItem = null; setTimeout(() => { const el = document.getElementById(it); if (el) window.scrollTo({ top: el.getBoundingClientRect().top + scrollY - 70, behavior: "smooth" }); }, 500); }
}
window.addEventListener("hashchange", () => {
  const main = $("#page");
  main.classList.add("leaving");
  setTimeout(() => { window.__lenis ? window.__lenis.scrollTo(0, { immediate: true }) : window.scrollTo(0, 0); render(); }, 400);
});

// v2's entrance is the load sequence; the pages render as soon as this runs
if (matchMedia("(prefers-reduced-motion: reduce)").matches) document.body.classList.add("reduced");
document.body.classList.add("loaded");
render();
})();
