const P = window.PROJECT;
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
const allTabIds = () => ["veneer", ...P.tabs.map((t) => t.id), "lighting"];
const titleOf = (id) => (id === "veneer" ? "Materials" : id === "lighting" ? "Lighting & Switches" : id === "overview" ? "Overview" : P.tabs.find((t) => t.id === id)?.title || id);
const IMG = {
  overview: "assets/refs/desk-ref-1.jpg", veneer: "assets/refs/desk-ref-1-detail.jpg", doors: "assets/refs/door-ref-1.jpg",
  study: "assets/refs/wall-ref-1-library-pilasters.jpg", walls: "assets/refs/walls-ref-1-panel-moulding.jpg", bedroom: "assets/refs/bed-ref-1-low-platform-bed.jpg",
  dressing: "assets/refs/wardrobe-ref-2-steel-leaded-doors-wide.jpg", bathroom: "assets/refs/ceiling-barrel-vault-coffers.jpg", lighting: "assets/refs/wall-ref-4-dark-study-bands-sconces.jpg",
  stack: "assets/refs/wall-ref-1-library-pilasters.jpg", footer: "assets/refs/desk-ref-1-detail.jpg",
};
const bg = (src) => `style="background-image:url('${src}')"`;
const today = new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }).toUpperCase();

// ── chrome: ticker + menu ──
function renderChrome(active) {
  const all = tally(allTabIds().flatMap(itemsOf)), n = all.brief + all.open + all.final;
  $("#ticker").innerHTML = `<span>Particulars</span><span class="sep">•</span><span>${today}</span><span class="sep">•</span><span><b>${all.final}</b> of ${n} decided · ${all.open} deciding</span>`;
  const link = (id) => { const c = tally(itemsOf(id)); return `<a href="#${id}" class="${active === id ? "on" : ""}"><span>${esc(titleOf(id))}</span>${id === "overview" ? "" : `<span class="count">${c.final}/${c.brief + c.open + c.final}</span>`}</a>`; };
  $("#menuLinks").innerHTML = ["overview", ...allTabIds()].map(link).join("");
  $$("#menuLinks a").forEach((a, i) => (a.style.transitionDelay = `${0.08 + i * 0.045}s`));
  $("#navHome span").textContent = active === "overview" ? "A Study in Teak" : "Overview";
  $("#menuTally").textContent = `${all.final} of ${n} decided · ${all.open} deciding · ${all.brief} to brief`;
}

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
      <div class="footer-btns"><a class="btn" href="#overview">Overview</a><a class="btn" href="#veneer">Materials</a></div>
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

  const hero = `<section class="hero"><div class="hero-bg" ${bg(IMG.overview)}></div>
    <div class="hero-flank l" data-decode>Particulars of the room</div>
    <div class="hero-center">${mark("hero-mark")}<div class="wordmark">A Study in Teak</div></div>
    <div class="hero-flank r" data-decode>One veneer, everywhere</div>
    <div class="hero-foot reveal">A study, a bedroom, a dressing room.<br>One teak desk sets the tone.<br>Every decision on one page.</div>
    <div class="hero-meta"><span>${pad2(allTabIds().length)} sections</span><span>Scroll</span></div></section>`;

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
    { title: "The Study", ids: ["study", "walls"], img: "assets/refs/wall-ref-4-dark-study-bands-sconces.jpg", line: "The teak desk, the full-height study wall, and the panelled walls either side." },
    { title: "The Bedroom", ids: ["bedroom", "bathroom"], img: "assets/refs/bed-ref-1-low-platform-bed.jpg", line: "The bed, the bed-back wall, the TV unit, and the vanity next door." },
    { title: "The Dressing", ids: ["dressing"], img: "assets/refs/wardrobe-ref-3-steel-leaded-doors-closeup.jpg", line: "Lit white-glass wardrobes in steel frames, and a folding mirror." },
    { title: "The Fabric", ids: ["veneer", "doors", "lighting"], img: "assets/refs/door-ref-1.jpg", line: "One veneer, three identical doors, and every light on one dimmer plan." },
  ].map((ch, i) => {
    const c = tally(ch.ids.flatMap(itemsOf)), n = c.brief + c.open + c.final;
    return `<article class="scard" style="--i:${i}"><div class="ph" ${bg(ch.img)}></div><div class="body">
      <span class="badge">${pad2(i + 1)}</span><h3 class="h-sm" data-decode>${esc(ch.title)}</h3>
      <p class="prose">${esc(ch.line)}</p><span class="mono" style="font-size:11px;color:var(--dim)">${c.final} of ${n} final</span>
      <div class="meta">${ch.ids.map((id) => `<a class="btn" href="#${id}">${esc(titleOf(id))}</a>`).join("")}</div></div></article>`;
  }).join("");
  const stack = `<section class="section" style="padding-bottom:0">${head("The book", "Four chapters. One room.", "The study, the bedroom, the dressing room — and the materials that hold them together.")}</section>
    <section class="stack"><div class="stack-bg"><div ${bg(IMG.stack)}></div></div><div class="stack-cards">${chapters}</div></section>
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

  const plans = (window.PLANS || []).length
    ? window.PLANS.map((p) => `<figure class="plan-img" data-open="img:${esc(p.src)}"><img src="${esc(p.src)}" alt=""></figure>`).join("")
    : P.room.plan ? `<figure class="plan-img" data-open="img:${esc(P.room.plan)}"><img src="${esc(P.room.plan)}" alt="Room plan"></figure>` : `<div class="empty">Room plan — to be added</div>`;
  const plan = `<section class="section">${head("The plan", "One room, roughly fourteen by eighteen feet.")}
    <div class="wrap"><div class="plan-grid reveal"><div class="panel" style="padding:12px">${plans}</div>
    <div class="panel"><div class="facts">${P.room.facts.map((f) => `<div class="k">${esc(f.k)}</div><div class="v">${esc(f.v)}</div>`).join("")}</div></div></div></div></section>`;

  return hero + bone + statement + stack + row + plan + footer();
}

// ── pages ──
function pageHero(id, eyebrow, title, prose) {
  const c = tally(itemsOf(id)), n = c.brief + c.open + c.final;
  return `<section class="hero short page-hero"><div class="hero-bg" ${bg(IMG[id] || IMG.overview)}></div>
    <div class="hero-flank l" data-decode>${esc(eyebrow)}</div>
    <div class="hero-center">
      <span class="badge">${pad2(allTabIds().indexOf(id) + 1)}</span>
      <h1 class="wordmark" data-decode>${esc(title)}</h1>
      ${prose ? `<p class="prose-lg reveal">${esc(prose)}</p>` : ""}
    </div>
    <div class="hero-flank r" data-decode>${c.final} of ${n} final</div></section>`;
}

function nextLink(id) {
  const ids = allTabIds(), nx = ids[(ids.indexOf(id) + 1) % ids.length];
  return `<section class="next"><span class="eyebrow" data-decode>Next section</span><a href="#${nx}"><h2 class="headline" data-decode>${esc(titleOf(nx))}</h2></a><a class="btn" href="#${nx}">Continue</a></section>`;
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
        <div class="gallery reveal${i.refs.length < 3 ? " few" : ""}">${i.refs.map((r) => `<figure class="shot" data-open="img:${esc(r.src)}"><div class="frame"><img src="${esc(r.src)}" alt="" loading="lazy"></div><figcaption>${esc(r.caption)}</figcaption></figure>`).join("")}</div>` : ""}
      ${[].concat(i.drawings || i.drawing || []).filter((d) => window.DRAWINGS?.[d]).length ? `<div class="sheets">${[].concat(i.drawings || i.drawing || []).filter((d) => window.DRAWINGS?.[d]).map((d) => {
        const D = window.DRAWINGS[d], [name, code] = D.title.split(" · ");
        return `<div class="sheet-card reveal"><div class="sheet-top"><h3 class="h-sm">${esc(name)}</h3><div class="sheet-tools"><span class="mono">${esc(code || "")}</span>${paperToggle()}</div></div>
          <figure class="dwg" data-open="dwg:${d}">${D.svg}</figure>
          <div class="cad-links"><span class="mono">Editable CAD</span>${D.model === false ? "" : `<a class="btn" href="cad/${d}-model.dxf" download>DXF · true size</a>`}<a class="btn" href="cad/${d}-sheet.dxf" download>DXF · A3 sheet</a><a class="btn" href="cad/${d}.svg" download>SVG</a><button class="btn steel" data-open="dwg:${d}">Full size</button></div></div>`;
      }).join("")}</div>` : ""}
      ${i.notes?.length ? `<div class="asks reveal"><span class="eyebrow">Notes</span><ul class="ask-list notes">${i.notes.map((n) => `<li>${esc(n)}</li>`).join("")}</ul></div>` : ""}
      ${i.questions?.length ? `<div class="asks reveal"><span class="eyebrow">Open questions</span><ul class="ask-list">${i.questions.map((q, n) => `<li><span class="badge">Q${pad2(n + 1)}</span><span>${esc(q)}</span></li>`).join("")}</ul></div>` : ""}
    </section>`).join("");
  return pageHero(t.id, t.kicker, t.title, t.intro) + index + items + nextLink(t.id) + footer();
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
    <div class="wrap"><div class="eyebrow" style="text-align:center;margin-top:32px;color:var(--dim)">Used for</div>${chips(M.appliesTo)}</div>
    <div class="group-label"><span class="eyebrow" data-decode>02 · Solid wood</span></div><div class="cards">${card("wood", "Wood type")}</div>
    <div class="wrap"><div class="eyebrow" style="text-align:center;margin-top:32px;color:var(--dim)">Used for</div>${chips(M.wood.usedFor)}</div>
    <div class="group-label"><span class="eyebrow" data-decode>03 · Polish</span></div><div class="cards">${card("polish", "Polish")}${card("tone", "Tone")}</div>
    ${M.notes.length ? `<div class="asks reveal" style="margin-top:var(--gap)"><span class="eyebrow">Notes</span><ul class="ask-list notes">${M.notes.map((n) => `<li>${esc(n)}</li>`).join("")}</ul></div>` : ""}` +
    nextLink("veneer") + footer();
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
    <div class="group-label"><span class="eyebrow" data-decode>03 · Switch boards</span></div><div class="sheets" style="margin-top:0">${boards}</div>` +
    nextLink("lighting") + footer();
}

// ── drawings: dark void (default) or light paper for reading detail; remembered in this browser ──
const paperMode = () => { try { return localStorage.getItem("sheet-mode-v2") || "dark"; } catch { return "dark"; } };
const paperToggle = () => `<div class="seg" role="group" aria-label="Drawing background"><button class="${paperMode() === "light" ? "on" : ""}" data-sheet="light">Light</button><button class="${paperMode() === "dark" ? "on" : ""}" data-sheet="dark">Dark</button></div>`;
const applyPaper = () => { document.body.classList.toggle("sheets-dark", paperMode() === "dark"); $$("[data-sheet]").forEach((b) => b.classList.toggle("on", b.dataset.sheet === paperMode())); };
document.addEventListener("click", (e) => {
  const b = e.target.closest("[data-sheet]");
  if (!b) return;
  try { localStorage.setItem("sheet-mode-v2", b.dataset.sheet); } catch {}
  applyPaper();
});

// ── motion: decode (characters resolve left to right) + reveal ──
const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
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

// ── menu ──
const setMenu = (open) => {
  document.body.classList.toggle("menu-open", open);
  $("#menuBtn").setAttribute("aria-expanded", open);
  $("#menuBtn span").textContent = open ? "Close" : "Menu";
  $("#menu").setAttribute("aria-hidden", !open);
};
$("#menuBtn").addEventListener("click", () => setMenu(!document.body.classList.contains("menu-open")));
$("#menuLinks").addEventListener("click", (e) => { if (e.target.closest("a")) setMenu(false); });
$("#printBtn").addEventListener("click", () => { setMenu(false); setTimeout(() => window.print(), 850); });
$(".menu-mark").innerHTML = mark("", false);
$(".loader-mark").innerHTML = mark("", false);

// ── lightbox with zoom (and paper/void toggle for drawings) ──
let zoom = 1;
document.addEventListener("click", (e) => {
  const lb = $("#lightbox");
  const f = e.target.closest("[data-open]");
  if (f && !e.target.closest("a.btn")) {
    const [kind, ref] = f.dataset.open.split(/:(.*)/s);
    zoom = 1;
    lb.innerHTML = `<div class="lb-bar"><span class="mono" style="font-size:11px;color:var(--dim)">${kind === "dwg" ? esc(window.DRAWINGS[ref].title) : "Reference"}</span>
      <div class="grp">${kind === "dwg" ? paperToggle() : ""}<button class="btn" data-z="-">−</button><button class="btn" data-z="0">Fit</button><button class="btn" data-z="+">+</button><button class="btn" data-z="x">Close</button></div></div>
      <div class="lb-body"><div class="lb-inner${kind === "dwg" ? " is-dwg" : ""}">${kind === "dwg" ? window.DRAWINGS[ref].svg : `<img src="${ref}">`}</div></div>`;
    lb.hidden = false;
    return;
  }
  const z = e.target.closest("[data-z]");
  if (z) {
    const inner = lb.querySelector(".lb-inner");
    if (z.dataset.z === "x") { lb.hidden = true; lb.innerHTML = ""; return; }
    zoom = z.dataset.z === "+" ? zoom * 1.5 : z.dataset.z === "-" ? Math.max(1, zoom / 1.5) : 1;
    inner.style.width = zoom * 100 + "%";
  }
});
document.addEventListener("keydown", (e) => { if (e.key === "Escape") { $("#lightbox").hidden = true; setMenu(false); } });

// ── scroll state: nav tightens; turns dark over the bone strip ──
function onScroll() {
  document.body.classList.toggle("scrolled", scrollY > 24);
  const y = 36, light = $$("[data-light]").some((s) => { const r = s.getBoundingClientRect(); return r.top < y && r.bottom > y; });
  document.body.classList.toggle("on-light", light);
}
window.addEventListener("scroll", onScroll, { passive: true });

// ── router with a soft cross-fade ──
const current = () => { const id = location.hash.slice(1) || "overview"; return ["veneer", "lighting", ...P.tabs.map((t) => t.id)].includes(id) ? id : "overview"; };
function render(delayMotion = 0) {
  const id = current(), t = P.tabs.find((t) => t.id === id), main = $("#main");
  main.innerHTML = id === "veneer" ? veneer() : id === "lighting" ? lighting() : t ? tabPage(t) : overview();
  renderChrome(id);
  document.title = `${titleOf(id)} · ${P.name}`;
  main.classList.remove("leaving"); main.classList.add("entering");
  setTimeout(() => main.classList.remove("entering"), 800);
  delayMotion ? setTimeout(() => animate(main), delayMotion) : animate(main);
  applyPaper();
  onScroll();
  if (pendingItem) { const it = pendingItem; pendingItem = null; setTimeout(() => { const el = document.getElementById(it); if (el) window.scrollTo({ top: el.getBoundingClientRect().top + scrollY - 70, behavior: "smooth" }); }, 500); }
}
window.addEventListener("hashchange", () => {
  const main = $("#main");
  main.classList.add("leaving");
  setTimeout(() => { window.scrollTo(0, 0); render(); }, 400);
});

// load sequence: mark focuses, then the void lifts; page motion starts as it clears
const REDUCED = matchMedia("(prefers-reduced-motion: reduce)").matches;
const firstVisit = !sessionStorage.getItem("seen");
if (REDUCED) { document.body.classList.add("loaded", "reduced"); render(); }
else {
  if (firstVisit) {
    const left = Math.max(0, 900 - (performance.now() - (window.__t0 || 0)));
    render(left + 350);
    setTimeout(() => { document.body.classList.add("loaded"); try { sessionStorage.setItem("seen", 1); } catch {} }, left);
  } else { document.body.classList.add("loaded"); render(); }
}
