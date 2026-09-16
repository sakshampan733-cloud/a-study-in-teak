const P = window.PROJECT;
const $ = (s) => document.querySelector(s);
const esc = (s = "") => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const STATUS = ["brief", "open", "final"];
const LABEL = { brief: "To brief", open: "Deciding", final: "Final" };

// Status clicks are remembered in this browser; data.js stays the source of truth.
const store = {
  get(k) { try { return JSON.parse(localStorage.getItem("aldwych") || "{}")[k]; } catch { return undefined; } },
  set(k, v) { try { const o = JSON.parse(localStorage.getItem("aldwych") || "{}"); o[k] = v; localStorage.setItem("aldwych", JSON.stringify(o)); } catch {} },
};
const statusOf = (key, base) => store.get(key) || base || "brief";
const pill = (key, base) => { const s = statusOf(key, base); return `<button class="pill ${s}" data-key="${key}" data-base="${base || "brief"}">${LABEL[s]}</button>`; };

document.addEventListener("click", (e) => {
  const b = e.target.closest(".pill[data-key]");
  if (!b) return;
  const cur = statusOf(b.dataset.key, b.dataset.base);
  store.set(b.dataset.key, STATUS[(STATUS.indexOf(cur) + 1) % 3]);
  render();
});

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

// ── nav ──
function renderNav(active) {
  const link = (id, title) => {
    const c = tally(itemsOf(id)), n = c.brief + c.open + c.final;
    return `<a href="#${id}" class="${active === id ? "on" : ""}"><span>${esc(title)}</span><span class="count">${c.final}/${n}</span></a>`;
  };
  $("#nav").innerHTML =
    `<a href="#overview" class="${active === "overview" ? "on" : ""}"><span>Overview</span></a>` +
    `<div class="sep">Material</div>` + link("veneer", "Materials") +
    `<div class="sep">Joinery</div>` + P.tabs.map((t) => link(t.id, t.title)).join("") +
    `<div class="sep">Services</div>` + link("lighting", "Lighting & Switches");
}

// ── pages ──
function overview() {
  const tiles = allTabIds().map((id) => {
    const title = id === "veneer" ? "Materials" : id === "lighting" ? "Lighting & Switches" : P.tabs.find((t) => t.id === id).title;
    const c = tally(itemsOf(id)), n = c.brief + c.open + c.final || 1;
    return `<a class="card tile" href="#${id}">
      <div class="kicker">${c.final} of ${c.brief + c.open + c.final} final</div><h2>${esc(title)}</h2>
      <div class="bar"><i style="width:${(c.final / n) * 100}%;background:var(--final)"></i><i style="width:${(c.open / n) * 100}%;background:var(--open)"></i></div></a>`;
  }).join("");
  const all = tally(allTabIds().flatMap(itemsOf));
  return `<div class="kicker">${esc(P.tagline)}</div><h1>${esc(P.name)}</h1>
    <p class="intro">${esc(P.style)}</p>
    <div class="grid">
      <div class="card"><div class="kicker">Decided</div><div class="stat">${all.final}</div></div>
      <div class="card"><div class="kicker">Deciding</div><div class="stat">${all.open}</div></div>
      <div class="card"><div class="kicker">To brief</div><div class="stat">${all.brief}</div></div>
    </div>
    <h3>Sections</h3><div class="grid">${tiles}</div>
    <h3>The room</h3>
    <div class="grid" style="grid-template-columns:2fr 1fr">
      <div class="card plan">${P.room.drawing && window.DRAWINGS?.[P.room.drawing] ? `<figure class="dwg" data-open="dwg:${P.room.drawing}" style="margin:0;width:100%">${window.DRAWINGS[P.room.drawing].svg}<figcaption>${esc(window.DRAWINGS[P.room.drawing].title)} — click to open full size</figcaption></figure>` : P.room.plan ? `<img src="${esc(P.room.plan)}" alt="Room plan">` : "Room plan — to be added"}</div>
      <div class="card facts">${P.room.facts.map((f) => `<div class="lab" style="color:var(--muted)">${esc(f.k)}</div><div>${esc(f.v)}</div>`).join("")}</div>
    </div>`;
}

function veneer() {
  const M = P.master;
  const card = (k, name) => `
    <div class="card"><div class="card-head"><div class="kicker" style="margin:0">${name}</div>${pill("m." + k, M[k].status)}</div>
      <h2>${M[k].value ? esc(M[k].value) : '<span class="tbd">Not chosen</span>'}</h2>
      ${M[k].rule ? `<p style="margin:8px 0 0;font-size:13px;color:var(--accent)">${esc(M[k].rule)}</p>` : ""}
      <div class="opts">${M[k].options.map((o) => `<span class="opt ${o === M[k].value ? "sel" : ""}">${esc(o)}</span>`).join("")}</div>
    </div>`;
  const chips = (list) => `<div class="chips">${list.map((a) => `<span class="tag">${esc(a)}</span>`).join("")}</div>`;
  return `<div class="kicker">One material, everywhere</div><h1>Materials</h1>
    <p class="intro">The master materials. Every piece inherits them unless its spec sheet says otherwise.</p>
    <h3>Veneer</h3><div class="master">${card("veneer", "Veneer")}${card("grain", "Grain / cut")}</div>
    <p style="margin:4px 0 0;font-size:13px;color:var(--muted)">Used for</p>${chips(M.appliesTo)}
    <h3>Solid wood</h3><div class="master">${card("wood", "Wood type")}</div>
    <p style="margin:4px 0 0;font-size:13px;color:var(--muted)">Used for</p>${chips(M.wood.usedFor)}
    <h3>Polish</h3><div class="master">${card("polish", "Polish")}${card("tone", "Tone")}</div>
    ${M.notes.length ? `<h3>Notes</h3><ul class="notes">${M.notes.map((n) => `<li>${esc(n)}</li>`).join("")}</ul>` : ""}`;
}

function partValue(p) {
  if (p.inherit && !p.value) {
    const m = P.master[p.inherit];
    return (m.value ? esc(m.value) : '<span class="tbd">Master not chosen</span>') + `<span class="inherit">from master</span>`;
  }
  return (p.value ? esc(p.value) : '<span class="tbd">To brief</span>') + (p.hint && !p.value ? `<span class="hint">${esc(p.hint)}</span>` : "");
}

function tabPage(t) {
  const cards = t.items.map((i) => `
    <section class="card" id="${i.id}">
      <div class="card-head"><h2>${esc(i.name)}</h2>${pill("i." + i.id, i.status)}</div>
      <div class="parts">${i.parts.map((p) => `<div class="lab">${esc(p.label)}</div><div>${partValue(p)}</div>`).join("")}</div>
      ${i.refs?.length ? `<div class="media">
        ${(i.refs || []).map((r) => `<figure class="ref" data-open="img:${esc(r.src)}"><img src="${esc(r.src)}" alt=""><figcaption>${esc(r.caption)}</figcaption></figure>`).join("")}
      </div>` : ""}
      ${[].concat(i.drawings || i.drawing || []).filter((d) => window.DRAWINGS?.[d]).map((d) => `<figure class="dwg" data-open="dwg:${d}">${window.DRAWINGS[d].svg}<figcaption>${esc(window.DRAWINGS[d].title)} — click to open full size</figcaption></figure>
        <div class="cad-links">Editable CAD: ${window.DRAWINGS[d].model === false ? "" : `<a href="cad/${d}-model.dxf" download>DXF · true size</a>`}<a href="cad/${d}-sheet.dxf" download>DXF · A3 sheet</a><a href="cad/${d}.svg" download>SVG</a></div>`).join("")}
      ${i.notes?.length ? `<ul class="notes">${i.notes.map((n) => `<li>${esc(n)}</li>`).join("")}</ul>` : ""}
      ${i.questions?.length ? `<ul class="qs">${i.questions.map((q) => `<li>${esc(q)}</li>`).join("")}</ul>` : ""}
    </section>`).join("");
  return `<div class="kicker">${esc(t.kicker)}</div><h1>${esc(t.title)}</h1>
    ${t.intro ? `<p class="intro">${esc(t.intro)}</p>` : '<div style="height:24px"></div>'}${cards}`;
}

function lighting() {
  const L = P.lighting, dimName = (id) => L.dimmers.find((d) => d.id === id)?.name;
  const zones = L.zones.map((z) => {
    const rows = L.lights.filter((l) => l.zone === z.id);
    return `<section class="card" id="light-${z.id}"><div class="card-head"><h2>${esc(z.name)}</h2><span class="kicker" style="margin:0">${rows.length} light group${rows.length === 1 ? "" : "s"}</span></div>
      ${rows.length ? `<table><thead><tr><th>Light</th><th>Type</th><th>Switch</th><th>Dimmer</th><th>Notes</th></tr></thead><tbody>
        ${rows.map((l) => `<tr><td>${esc(l.name)}</td><td>${esc(l.type)}</td><td>${esc(l.switch)}</td><td>${l.dimmer ? `<span class="tag">${esc(dimName(l.dimmer))}</span>` : "—"}</td><td>${esc(l.notes)}</td></tr>`).join("")}
      </tbody></table>` : `<div class="empty">No lights briefed yet.</div>`}</section>`;
  }).join("");
  const dims = L.dimmers.map((d) => {
    const members = L.lights.filter((l) => l.dimmer === d.id);
    return `<div class="card"><div class="card-head"><h2>${esc(d.name)}</h2>${pill("d." + d.id, d.status)}</div>
      <p style="margin:0 0 10px">${esc(d.rule)}</p>
      <div class="chips">${members.map((m) => `<span class="tag">${esc(m.name)} · ${esc(L.zones.find((z) => z.id === m.zone).name)}</span>`).join("")}</div></div>`;
  }).join("");
  const boards = L.boards.length
    ? L.boards.map((b) => `<div class="card"><h2>${esc(b.location)}</h2><table><thead><tr><th>#</th><th>Controls</th></tr></thead><tbody>${b.switches.map((s, i) => `<tr><td>${i + 1}</td><td>${esc(s)}</td></tr>`).join("")}</tbody></table></div>`).join("")
    : `<div class="card empty">Switch boards not mapped yet.</div>`;
  return `<div class="kicker">Switch plan</div><h1>Lighting & Switches</h1><p class="intro">${esc(L.intro)}</p>
    <h3>Dimmer groups</h3><div class="grid" style="grid-template-columns:1fr">${dims}</div>
    <h3>By zone</h3>${zones}
    <h3>Switch boards</h3>${boards}`;
}

// ── lightbox with zoom ──
let zoom = 1;
document.addEventListener("click", (e) => {
  const f = e.target.closest("[data-open]");
  const lb = $("#lightbox");
  if (f) {
    const [kind, ref] = f.dataset.open.split(/:(.*)/s);
    zoom = 1;
    lb.innerHTML = `<div class="lb-bar"><button data-z="-">−</button><button data-z="0">Fit</button><button data-z="+">+</button><button data-z="x">Close</button></div>
      <div class="lb-body"><div class="lb-inner">${kind === "dwg" ? window.DRAWINGS[ref].svg : `<img src="${ref}">`}</div></div>`;
    lb.hidden = false;
    return;
  }
  const z = e.target.closest("[data-z]");
  if (z) {
    if (z.dataset.z === "x") { lb.hidden = true; lb.innerHTML = ""; return; }
    zoom = z.dataset.z === "+" ? zoom * 1.5 : z.dataset.z === "-" ? Math.max(1, zoom / 1.5) : 1;
    lb.querySelector(".lb-inner").style.width = zoom * 100 + "%";
  }
});
document.addEventListener("keydown", (e) => { if (e.key === "Escape") { $("#lightbox").hidden = true; } });

// ── router ──
function render() {
  const id = location.hash.slice(1) || "overview";
  const t = P.tabs.find((t) => t.id === id);
  $("#main").innerHTML = id === "veneer" ? veneer() : id === "lighting" ? lighting() : t ? tabPage(t) : overview();
  renderNav(t || id === "veneer" || id === "lighting" ? id : "overview");
  document.title = `${t ? t.title : id === "veneer" ? "Materials" : id === "lighting" ? "Lighting" : "Overview"} · ${P.name}`;
}
$("#brandName").textContent = P.name;
$("#brandTag").textContent = "Particulars of the room";
window.addEventListener("hashchange", () => { render(); window.scrollTo(0, 0); });
render();
