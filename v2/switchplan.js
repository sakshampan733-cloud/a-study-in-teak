// The switch planner (owner, 9 Oct): the lighting tab's working tool. Every light in the suite as it is now built (the
// Blender model's fixtures, at their real places), the switch boards from the owner's electric plan (Canva, "Saksham's
// Room Electric Plan" — Norisys TG9 toggles on modular plates), and a way to play: put any light on any switch,
// make it dim, give it a slow glow-up, mark what is automated — then press the switches and watch the plan light up.
//
// Plates follow the Norisys modules: a toggle hole is 1M, a socket window 2M, a small window (USB-C, Ethernet) 1M.
// The plan is kept in this browser (localStorage) and travels as text: "Copy for Claude" for changes to the site and
// the drawings, "Print for the electrician" for the schedule, "Download" / "Load" for a file.
(function () {
  const KEY = "ast.switchplan.v1";
  const ZONES = [["study", "Study"], ["bedroom", "Bedroom"], ["dressing", "Dressing room"], ["bathroom", "Bathroom"]];
  const zoneName = (z) => (ZONES.find((q) => q[0] === z) || [z, z])[1];
  const KINDS = { spot: "Focus spots", cove: "Cove", strip: "LED strip", lamp: "Wall lamps", plug: "Plug-in lamp", load: "Appliance" };
  const AUTO = { none: "Manual", motion: "Motion sensor", timer: "Timer / schedule", smart: "Smart (app · voice)", scene: "Scenes only" };
  const FADES = [0, 0.5, 1, 1.5, 2, 3, 5];
  // ── the fixtures, at their places in plan (mm: x from the left wall, s from the study wall) ──
  const BX = (x) => 4777 + x;
  const F = (id, zone, name, kind, n, K, geo) => ({ id, zone, name, kind, n, K, geo });
  const P = (...pts) => ({ pts }), Ln = (...lines) => ({ lines });
  const FIX = [
    F("st_pairL", "study", "Study-wall spots · over the bookcase", "spot", 2, 3000, P([696, 762], [935, 762])),
    F("st_pairC", "study", "Study-wall spots · over the painting", "spot", 2, 3000, P([2114, 762], [2358, 762])),
    F("st_pairR", "study", "Study-wall spots · over the window", "spot", 2, 3000, P([3541, 762], [3780, 762])),
    F("desk_sp", "study", "Spots over the desk", "spot", 3, 3000, P([1715, 2139], [2314, 2139], [2909, 2139])),
    F("niche_bk", "study", "Bookcase arch · niche spots", "spot", 3, 3000, P([244, 131], [744, 131], [1244, 131])),
    F("niche_win", "study", "Window arch · niche spots", "spot", 3, 3000, P([3474, 140], [3937, 140], [4400, 140])),
    F("shelf", "study", "Bookcase · strip under each shelf", "strip", 4, 3000, Ln([104, 234, 1384, 234])),
    F("picture", "study", "Picture light over the painting", "strip", 1, 2700, Ln([2164, 110, 2584, 110])),
    F("st_lamps", "study", "Study-wall twin lamps (pilasters)", "lamp", 2, 2700, P([1539, 445], [3068, 445])),
    F("rw_study", "study", "Right-wall twin lamps · study", "lamp", 2, 2700, P([4422, 629], [4422, 2087])),
    F("desk_lamp", "study", "Banker's lamp on the desk", "plug", 1, 2700, P([1424, 1899])),
    F("sp_part", "bedroom", "Spots by the partition", "spot", 2, 3000, P([788, 2469], [3836, 2469])),
    F("sp_mid", "bedroom", "Spots · middle of the bedroom", "spot", 2, 3000, P([1738, 2987], [2937, 2987])),
    F("sp_left", "bedroom", "Spots · left side", "spot", 4, 3000, P([788, 3465], [788, 3703], [788, 4432], [788, 4669])),
    F("sp_right", "bedroom", "Spots · right side", "spot", 4, 3000, P([3836, 3465], [3836, 3703], [3836, 4432], [3836, 4669])),
    F("cove_l", "bedroom", "Cove · left wall", "cove", 1, 3000, Ln([102, 480, 102, 4550], [-25, 4650, -25, 5614])),
    F("cove_r", "bedroom", "Cove · right wall", "cove", 1, 3000, Ln([4395, 480, 4395, 5614])),
    F("cove_b", "bedroom", "Cove · bed wall", "cove", 1, 3000, Ln([-25, 5614, 4395, 5614])),
    F("bed_l", "bedroom", "Bed lamp · left (twin-arm)", "lamp", 1, 2700, P([1014, 5621])),
    F("bed_r", "bedroom", "Bed lamp · right (twin-arm)", "lamp", 1, 2700, P([3401, 5621])),
    F("rw_bed", "bedroom", "Right-wall twin lamp · bedroom", "lamp", 1, 2700, P([4422, 3545])),
    F("dr_mid", "dressing", "Dressing spots · down the middle", "spot", 5, 3000, P([5153, 4357], [5905, 4357], [6656, 4357], [7408, 4357], [8160, 4357])),
    F("dr_mirror", "dressing", "Dressing spots · by the mirror", "spot", 2, 3000, P([8160, 3834], [8160, 4879])),
    F("dr_coffer", "dressing", "Coffer coves · middle column", "cove", 5, 3000, Ln([5000, 4357, 5306, 4357], [5752, 4357, 6058, 4357], [6503, 4357, 6809, 4357], [7255, 4357, 7561, 4357], [8007, 4357, 8313, 4357])),
    F("dr_vault", "dressing", "Vault coves · along both sides", "cove", 2, 3000, Ln([4777, 3764, 8536, 3764], [4777, 4949, 8536, 4949])),
    F("dr_door", "dressing", "Cove over the bathroom door", "cove", 1, 3000, Ln([4807, 3099, 5509, 3099])),
    F("wd_left", "dressing", "Wardrobes · lit backs, left run", "strip", 3, 3000, Ln([5640, 3040, 8430, 3040])),
    F("wd_right", "dressing", "Wardrobes · lit backs, right run", "strip", 3, 3000, Ln([4860, 5670, 7650, 5670])),
    F("tunnel", "dressing", "Tunnel light", "strip", 1, 3000, Ln([7779, 7165, 8379, 7165])),
    F("b_wc", "bathroom", "Bath spots · WC and window", "spot", 2, 2700, P([BX(889), 483], [BX(1092), 483])),
    F("b_van", "bathroom", "Bath spots · vanity", "spot", 2, 2700, P([BX(533), 2388], [BX(1753), 2388])),
    F("b_mid", "bathroom", "Bath spots · middle", "spot", 3, 2700, P([BX(533), 1575], [BX(1727), 1549], [BX(2616), 1499])),
    F("b_tub", "bathroom", "Bath spots · tub", "spot", 3, 2700, P([BX(3251), 483], [BX(3302), 1524], [BX(3302), 2362])),
    F("b_cove", "bathroom", "Shower ceiling · cove, four sides", "cove", 4, 2700, Ln([6225, 51, 6225, 991], [6225, 25, 7342, 25], [7342, 51, 7342, 991], [6225, 991, 7342, 991])),
    F("ac_bed", "bedroom", "AC · bedroom", "load", 1, 0, P([2274, 5700])),
    F("ac_dr", "dressing", "AC · dressing room", "load", 1, 0, P([6656, 5700])),
    F("tv", "bedroom", "TV", "load", 1, 0, P([2274, 2480])),
    F("soundbar", "bedroom", "Sound bar", "load", 1, 0, P([2274, 2560])),
    F("wifi", "study", "Wi-Fi router", "load", 1, 0, P([4470, 1300])),
    F("geyser", "bathroom", "Geyser", "load", 1, 0, P([BX(3500), 2000])),
    F("exhaust", "bathroom", "Exhaust fan", "load", 1, 0, P([BX(1000), 120])),
  ];
  // ── the slot types: what can sit in a hole or a window ──
  const SLOT = {
    sw: { m: 1, hole: true, n: "Switch" }, dim: { m: 1, hole: true, n: "Dimmer" }, scene: { m: 1, hole: true, n: "Scene" }, spare: { m: 1, hole: true, n: "Spare" },
    s6: { m: 2, n: "Socket 6A" }, s16: { m: 2, n: "Socket 16A" }, usbc: { m: 1, n: "USB-C" }, eth: { m: 1, n: "Ethernet" }, tvp: { m: 1, n: "TV point" },
  };
  // ── the boards: the owner's electric plan, carried onto the room as it is now (a starting point — change anything) ──
  const S = (t, c = [], extra = {}) => ({ t, c, ...extra });
  const BOARDS = [
    { id: "entry", name: "By the door · main board", zone: "bedroom", at: [-177, 4760], plates: [{ size: 8, slots: [
      S("sw", ["sp_left"]), S("sw", ["sp_right"]), S("sw", ["sp_mid"]), S("sw", ["sp_part"]), S("sw", ["cove_l", "cove_r", "cove_b"]), S("dim", ["cove_l", "cove_r", "cove_b"]), S("sw", ["rw_bed"]), S("scene", [], { scene: "off" })] }] },
    { id: "bedL", name: "Bed back · left side", zone: "bedroom", at: [1144, 5730], plates: [{ size: 8, slots: [
      S("sw", ["bed_l"]), S("dim", ["bed_l"]), S("sw", ["cove_b"]), S("scene", [], { scene: "night" }), S("s6"), S("usbc"), S("usbc")] }] },
    { id: "bedR", name: "Bed back · right side", zone: "bedroom", at: [3531, 5730], plates: [{ size: 8, slots: [
      S("sw", ["bed_r"]), S("sw", ["ac_bed"]), S("s16", ["ac_bed"]), S("s6"), S("eth"), S("usbc")] }] },
    { id: "part", name: "Partition · by the TV", zone: "bedroom", at: [3300, 2470], plates: [{ size: 8, slots: [
      S("sw", ["tv"]), S("sw", ["soundbar"]), S("sw", ["sp_part"]), S("spare"), S("s6", ["tv"]), S("s6", ["soundbar"])] }] },
    { id: "rwMain", name: "Right wall · main board", zone: "bedroom", at: [4547, 3900], plates: [{ size: 8, slots: [
      S("sw", ["sp_right"]), S("sw", ["sp_mid"]), S("sw", ["rw_bed"]), S("sw", ["cove_r"]), S("spare"), S("spare"), S("spare"), S("spare")] }] },
    { id: "rwSmall", name: "Right wall · small board", zone: "bedroom", at: [4547, 3150], plates: [{ size: 6, slots: [S("sw"), S("sw"), S("s6"), S("s16")] }] },
    { id: "stLeft", name: "Study · left wall", zone: "study", at: [-50, 1600], plates: [{ size: 8, slots: [
      S("sw", ["st_lamps", "rw_study"]), S("sw", ["st_pairL"]), S("sw", ["st_pairC"]), S("sw", ["st_pairR"]), S("sw", ["desk_sp"]), S("sw", ["shelf"]), S("dim", ["shelf"]), S("sw", ["niche_bk", "niche_win"])] }] },
    { id: "shelfB", name: "Study · inside the bookcase", zone: "study", at: [744, 320], plates: [{ size: 8, slots: [
      S("sw", ["picture"]), S("spare"), S("s16"), S("s6"), S("usbc"), S("usbc")] }] },
    { id: "desk", name: "Study · under the desk", zone: "study", at: [2337, 1700], plates: [
      { size: 2, slots: [S("sw", ["desk_lamp"]), S("spare")] }, { size: 2, slots: [S("s6", ["desk_lamp"])] }, { size: 2, slots: [S("usbc"), S("usbc")] }, { size: 8, slots: [S("s6"), S("s6"), S("s16"), S("eth"), S("usbc")] }] },
    { id: "stRight", name: "Study · right wall", zone: "study", at: [4547, 1250], plates: [{ size: 8, slots: [
      S("sw", ["wifi"]), S("sw", ["rw_study"]), S("spare"), S("spare"), S("s6", ["wifi"]), S("eth"), S("usbc")] }] },
    { id: "dress", name: "Dressing room · by its door", zone: "dressing", at: [4860, 5500], plates: [
      { size: 8, slots: [S("sw", ["dr_mid"]), S("sw", ["dr_mirror"]), S("sw", ["dr_coffer", "dr_vault", "dr_door"]), S("dim", ["dr_coffer", "dr_vault", "dr_door"]), S("sw", ["ac_dr"]), S("spare"), S("usbc"), S("usbc")] },
      { size: 8, slots: [S("sw", ["wd_left"]), S("sw", ["wd_right"]), S("sw", ["tunnel"]), S("spare"), S("s6"), S("s16", ["ac_dr"])] }] },
    { id: "bath", name: "Bathroom · by its door", zone: "bathroom", at: [4900, 2620], plates: [
      { size: 8, slots: [S("sw", ["b_van"]), S("sw", ["b_wc"]), S("sw", ["b_mid"]), S("sw", ["b_tub"]), S("sw", ["b_cove"]), S("dim", ["b_mid", "b_tub", "b_cove"]), S("sw", ["geyser"]), S("sw", ["exhaust"])] },
      { size: 8, slots: [S("spare"), S("spare"), S("spare"), S("spare"), S("s6"), S("s16", ["geyser"])] }] },
  ];
  const SCENES = [
    { id: "off", name: "All off", levels: {} },
    { id: "night", name: "Night", levels: { bed_l: 25, bed_r: 25, cove_b: 15 } },
    { id: "evening", name: "Evening", levels: { cove_l: 60, cove_r: 60, cove_b: 60, st_lamps: 80, rw_study: 80, rw_bed: 80, bed_l: 70, bed_r: 70, shelf: 70, niche_bk: 70, niche_win: 70, picture: 100 } },
    { id: "work", name: "Work", levels: { desk_sp: 100, st_pairC: 100, desk_lamp: 100, shelf: 60, niche_bk: 60 } },
  ];
  const defaults = () => ({
    v: 1,
    light: Object.fromEntries(FIX.map((f) => [f.id, { dim: f.kind !== "load" && f.kind !== "plug", fade: f.kind === "load" ? 0 : 1.5, auto: f.id === "wd_left" || f.id === "wd_right" || f.id === "tunnel" ? "motion" : "none", K: f.K }])),
    boards: JSON.parse(JSON.stringify(BOARDS)), scenes: JSON.parse(JSON.stringify(SCENES)), custom: [],
  });
  let st, mode = "plan", live = {}, level = {}, root, ed = null;   // live: light on; level: dimmer % per slot key
  const fixAll = () => FIX.concat(st.custom || []);
  const fixById = (id) => fixAll().find((f) => f.id === id);
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(st)); } catch (e) {} };
  const load = () => {
    let s = null; try { s = JSON.parse(localStorage.getItem(KEY) || "null"); } catch (e) {}
    const d = defaults();
    if (!s || s.v !== 1) return d;
    for (const f of FIX) if (!s.light[f.id]) s.light[f.id] = d.light[f.id];
    return s;
  };
  const esc = (t = "") => String(t).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const used = (pl) => pl.slots.reduce((a, q) => a + (SLOT[q.t]?.m || 1), 0);
  const where = (lid) => { const r = []; st.boards.forEach((b) => b.plates.forEach((p, pi) => p.slots.forEach((q, qi) => { if (q.c.includes(lid) && (q.t === "sw" || q.t === "dim")) r.push({ b, pi, qi, q }); }))); return r; };
  const brightness = (lid) => {
    if (!live[lid]) return 0;
    const dims = where(lid).filter((w) => w.q.t === "dim"); if (!dims.length) return 1;
    return Math.max(0.06, Math.min(...dims.map((w) => (level[`${w.b.id}.${w.pi}.${w.qi}`] ?? 100) / 100)));
  };
  // ── the plan (SVG) ──
  const VB = [-500, -380, 9300, 8700];
  function planSVG() {
    const room = (pts) => `<path d="M ${pts.map((p) => p.join(" ")).join(" L ")} Z" class="swp-wall"/>`;
    let s = `<svg class="swp-svg" viewBox="${VB.join(" ")}" preserveAspectRatio="xMidYMid meet"><defs><filter id="swp-glow" x="-1" y="-1" width="3" height="3"><feGaussianBlur stdDeviation="110"/></filter></defs>`;
    s += room([[-50, 0], [4547, 0], [4547, 5766], [-177, 5766], [-177, 4600], [-50, 4600]]) + room([[4777, 2947], [8536, 2947], [8536, 5766], [4777, 5766]]) +
      room([[7622, 5766], [8536, 5766], [8536, 8103], [7622, 8103]]) + room([[4777, 0], [8511, 0], [8511, 2718], [4777, 2718]]);
    s += `<line x1="-50" y1="2413" x2="4547" y2="2413" class="swp-part"/>`;
    s += `<rect x="1309" y="3640" width="1929" height="2040" rx="60" class="swp-furn"/><rect x="1194" y="1180" width="2286" height="914" rx="40" class="swp-furn"/>`;
    s += `<rect x="4800" y="1600" width="1524" height="610" class="swp-furn"/><ellipse cx="7650" cy="1450" rx="380" ry="820" class="swp-furn"/>`;
    [["STUDY", 2250, 1650], ["BEDROOM", 2250, 4300], ["DRESSING", 6650, 4250], ["BATH", 6650, 2200], ["TUNNEL", 8080, 7700]].forEach(([t, x, y]) => (s += `<text x="${x}" y="${y}" class="swp-lbl">${t}</text>`));
    for (const f of fixAll()) {
      const g = f.geo || {}, cls = `swp-f k-${f.kind}`, b = brightness(f.id), fd = st.light[f.id]?.fade ?? 0;
      const sty = `style="--b:${b};--fd:${live[f.id] ? fd : Math.min(0.6, fd)}s"`;
      s += `<g class="${cls}${b > 0 ? " on" : ""}" data-l="${f.id}" ${sty}><title>${esc(f.name)}</title>`;
      (g.lines || []).forEach(([x0, y0, x1, y1]) => (s += `<line x1="${x0}" y1="${y0}" x2="${x1}" y2="${y1}" class="glow" filter="url(#swp-glow)"/><line x1="${x0}" y1="${y0}" x2="${x1}" y2="${y1}" class="core"/>`));
      (g.pts || []).forEach(([x, y]) => (s += f.kind === "load" ? `<rect x="${x - 70}" y="${y - 70}" width="140" height="140" rx="20" class="core"/>`
        : `<circle cx="${x}" cy="${y}" r="${f.kind === "lamp" ? 240 : 200}" class="glow" filter="url(#swp-glow)"/><circle cx="${x}" cy="${y}" r="${f.kind === "lamp" ? 70 : 55}" class="core"/>`));
      s += `</g>`;
    }
    st.boards.forEach((b, i) => (s += `<g class="swp-bd" data-board="${b.id}"><title>${esc(b.name)}</title><rect x="${b.at[0] - 120}" y="${b.at[1] - 70}" width="240" height="140" rx="30"/><text x="${b.at[0]}" y="${b.at[1] + 300}">B${i + 1}</text></g>`));
    return s + `</svg>`;
  }
  // ── a board: its plates, slot by slot ──
  function slotHTML(b, pi, qi, q) {
    const T = SLOT[q.t] || SLOT.spare, key = `${b.id}.${pi}.${qi}`, names = q.c.map((id) => fixById(id)?.name || id);
    const on = q.c.length && q.c.every((id) => live[id]);
    const cls = `swp-slot t-${q.t} m${T.m}${on ? " on" : ""}${ed === key ? " sel" : ""}`;
    let face = "";
    if (q.t === "sw" || q.t === "spare") face = `<span class="lever"></span>`;
    else if (q.t === "dim") face = mode === "try" ? `<input type="range" min="5" max="100" value="${level[key] ?? 100}" data-dim="${key}" aria-label="Dimmer">` : `<span class="knob"></span>`;
    else if (q.t === "scene") face = `<span class="btn-s"></span>`;
    else if (q.t === "s6" || q.t === "s16") face = `<span class="sock"><i></i><i></i><i></i></span>`;
    else face = `<span class="win">${q.t === "usbc" ? "C" : q.t === "eth" ? "LAN" : "TV"}</span>`;
    const lab = q.t === "scene" ? (st.scenes.find((s) => s.id === q.scene)?.name || "Scene") : names.length ? names.join(" + ") : T.n;
    return `<button class="${cls}" data-slot="${key}" title="${esc(T.n + (names.length ? ": " + names.join(", ") : ""))}">${face}<span class="cap"><b>${String(qi + 1).padStart(2, "0")}</b>${esc(lab)}</span></button>`;
  }
  function boardHTML(b) {
    return `<div class="swp-board" id="swp-b-${b.id}"><div class="swp-bt"><span class="swp-bn">B${st.boards.indexOf(b) + 1}</span><h4>${esc(b.name)}</h4>
      ${mode === "plan" ? `<span class="swp-tools"><button class="mini" data-act="addplate" data-b="${b.id}">+ Plate</button><button class="mini" data-act="rename" data-b="${b.id}">Rename</button><button class="mini" data-act="delboard" data-b="${b.id}">Remove</button></span>` : ""}</div>
      ${b.plates.map((p, pi) => `<div class="swp-plate-row"><div class="swp-plate s${p.size}">${p.slots.map((q, qi) => slotHTML(b, pi, qi, q)).join("")}</div>
        ${mode === "plan" ? `<div class="swp-pmeta"><span class="mono${used(p) > p.size ? " over" : ""}">${used(p)} of ${p.size}M</span>
          <select data-act="psize" data-b="${b.id}" data-p="${pi}">${[1, 2, 3, 4, 6, 8, 12, 16].map((m) => `<option value="${m}"${m === p.size ? " selected" : ""}>${m}M plate</option>`).join("")}</select>
          <button class="mini" data-act="addslot" data-b="${b.id}" data-p="${pi}">+ Slot</button><button class="mini" data-act="delplate" data-b="${b.id}" data-p="${pi}">✕</button></div>` : ""}</div>`).join("")}</div>`;
  }
  // ── the slot editor (plan mode) ──
  function editorHTML() {
    if (!ed) return "";
    const [bid, pi, qi] = ed.split("."), b = st.boards.find((x) => x.id === bid); if (!b) return "";
    const q = b.plates[+pi]?.slots[+qi]; if (!q) return "";
    const types = Object.entries(SLOT).map(([k, v]) => `<button class="chip${q.t === k ? " sel" : ""}" data-act="stype" data-t="${k}">${v.n}</button>`).join("");
    const pick = q.t === "scene" ? `<div class="swp-sub mono">Which scene</div><div class="chips">${st.scenes.map((s) => `<button class="chip${q.scene === s.id ? " sel" : ""}" data-act="sscene" data-s="${s.id}">${esc(s.name)}</button>`).join("")}</div>`
      : `<div class="swp-sub mono">${q.t === "dim" ? "It dims" : q.t === "sw" ? "It switches" : "It feeds"}</div>
        ${ZONES.map(([z, zn]) => `<div class="swp-zl mono">${zn}</div><div class="chips">${fixAll().filter((f) => f.zone === z).map((f) => {
          const other = where(f.id).filter((w) => `${w.b.id}.${w.pi}.${w.qi}` !== ed);
          return `<button class="chip${q.c.includes(f.id) ? " sel" : ""}" data-act="slight" data-l="${f.id}" title="${other.length ? "Also on: " + other.map((w) => w.b.name + " #" + (w.qi + 1)).join(", ") : ""}">${esc(f.name)}${other.length ? ` <i>· ${other.length + 1}-way</i>` : ""}</button>`; }).join("")}</div>`).join("")}`;
    return `<div class="swp-ed"><div class="swp-ed-top"><span class="mono">${esc(b.name)} · plate ${+pi + 1} · slot ${+qi + 1}</span><button class="mini" data-act="close">Done</button></div>
      <div class="swp-sub mono">What sits here</div><div class="chips">${types}</div>${pick}
      <div class="swp-ed-foot"><button class="mini" data-act="sleft">← Move</button><button class="mini" data-act="sright">Move →</button><button class="mini" data-act="sdel">Remove slot</button></div></div>`;
  }
  // ── the lights table ──
  function lightsHTML() {
    return ZONES.map(([z, zn]) => {
      const rows = fixAll().filter((f) => f.zone === z);
      return `<div class="swp-lz"><div class="mono swp-zl">${zn}</div><table class="swp-tbl"><thead><tr><th>Light</th><th>Controlled from</th><th>Dims</th><th>Glow-up</th><th>Automation</th><th>Colour</th></tr></thead><tbody>
        ${rows.map((f) => { const L = st.light[f.id] || (st.light[f.id] = { dim: true, fade: 1.5, auto: "none", K: f.K || 3000 }), w = where(f.id).filter((x) => x.q.t === "sw");
          return `<tr><td><b>${esc(f.name)}</b><span class="mono dim">${f.n > 1 ? f.n + " × " : ""}${KINDS[f.kind] || ""}</span></td>
          <td>${w.length ? w.map((x) => `<a href="#" data-goto="${x.b.id}" class="swp-at">${esc(x.b.name)} #${x.qi + 1}</a>`).join("") : `<span class="swp-none">No switch yet</span>`}${w.length > 1 ? `<span class="mono dim">${w.length}-way</span>` : ""}</td>
          <td>${f.kind === "load" ? "—" : `<label class="tog"><input type="checkbox" data-lp="dim" data-l="${f.id}"${L.dim ? " checked" : ""}><span></span></label>`}</td>
          <td>${f.kind === "load" ? "—" : `<select data-lp="fade" data-l="${f.id}">${FADES.map((v) => `<option value="${v}"${+L.fade === v ? " selected" : ""}>${v ? v + " s" : "Instant"}</option>`).join("")}</select>`}</td>
          <td><select data-lp="auto" data-l="${f.id}">${Object.entries(AUTO).map(([k, v]) => `<option value="${k}"${L.auto === k ? " selected" : ""}>${v}</option>`).join("")}</select></td>
          <td>${f.kind === "load" ? "—" : `<select data-lp="K" data-l="${f.id}">${[2700, 3000, 4000].map((k) => `<option value="${k}"${+L.K === k ? " selected" : ""}>${k} K</option>`).join("")}</select>`}</td></tr>`; }).join("")}</tbody></table></div>`;
    }).join("") + `<div class="swp-add"><span class="mono">Add a light or appliance</span><input placeholder="Name, e.g. Under-bed strip" id="swp-new-n"><select id="swp-new-z">${ZONES.map(([z, n]) => `<option value="${z}">${n}</option>`).join("")}</select>
      <select id="swp-new-k">${Object.entries(KINDS).map(([k, v]) => `<option value="${k}">${v}</option>`).join("")}</select><button class="mini" data-act="addlight">Add</button></div>`;
  }
  // ── totals: what to buy ──
  function totals() {
    const c = {}, plates = {};
    st.boards.forEach((b) => b.plates.forEach((p) => { plates[p.size] = (plates[p.size] || 0) + 1; p.slots.forEach((q) => (c[q.t] = (c[q.t] || 0) + 1)); }));
    const unsw = fixAll().filter((f) => f.kind !== "plug" && !where(f.id).some((w) => w.q.t === "sw")).length;
    const part = (k, n) => (c[k] ? `<span><b>${c[k]}</b> ${n}</span>` : "");
    return `${part("sw", "switches")}${part("dim", "dimmers")}${part("scene", "scene keys")}${part("s6", "6A sockets")}${part("s16", "16A sockets")}${part("usbc", "USB-C")}${part("eth", "Ethernet")}${part("tvp", "TV points")}${part("spare", "spare holes")}
      <span><b>${Object.values(plates).reduce((a, b) => a + b, 0)}</b> plates (${Object.entries(plates).sort((a, b) => b[0] - a[0]).map(([m, n]) => `${n}×${m}M`).join(", ")})</span>${unsw ? `<span class="warn"><b>${unsw}</b> without a switch</span>` : ""}`;
  }
  function render() {
    const byZone = ZONES.map(([z, zn]) => { const bs = st.boards.filter((b) => b.zone === z); return bs.length ? `<div class="swp-zone"><div class="eyebrow">${zn}</div>${bs.map(boardHTML).join("")}</div>` : ""; }).join("");
    root.innerHTML = `<div class="swp-bar"><div class="swp-modes"><button class="btn${mode === "plan" ? "" : " steel"}" data-mode="plan">Plan the switches</button><button class="btn${mode === "try" ? "" : " steel"}" data-mode="try">Try it</button></div>
        <div class="swp-acts"><button class="btn steel" data-act="copy">Copy for Claude</button><button class="btn steel" data-act="print">Print for the electrician</button><button class="btn steel" data-act="dl">Download</button><button class="btn steel" data-act="ul">Load</button><button class="btn steel" data-act="reset">Start again</button><input type="file" accept=".json,application/json" id="swp-file" hidden></div></div>
      <div class="swp-totals mono">${totals()}</div>
      <p class="swp-help">${mode === "plan" ? "Click any slot on a plate to choose what sits there and which lights it works. A light on two switches becomes two-way. Set each light's dimming, glow-up time and automation in the table below. Everything saves in this browser." : "Press the switches. Each light glows up at its own speed; dimmers slide. Scene keys set the room in one press."}</p>
      <div class="swp-grid"><div class="swp-planbox"><div class="swp-plan">${planSVG()}</div>
        ${mode === "try" ? `<div class="swp-scenes"><span class="mono">Scenes</span>${st.scenes.map((s) => `<button class="mini" data-act="runscene" data-s="${s.id}">${esc(s.name)}</button>`).join("")}<button class="mini" data-act="savescene">+ Save the room as a scene</button></div>` : editorHTML()}</div>
        <div class="swp-boards">${byZone}<button class="btn steel swp-addb" data-act="addboard">+ Add a board</button></div></div>
      <div class="group-label"><span class="eyebrow">Every light · how it behaves</span></div><div class="swp-lights">${lightsHTML()}</div>`;
  }
  // ── text out: for Claude, and the electrician's schedule ──
  function asText() {
    const lines = ["SWITCH PLAN — A Study in Teak (paste this to Claude)", ""];
    st.boards.forEach((b) => { lines.push(`[${b.name}]`); b.plates.forEach((p, pi) => { lines.push(`  plate ${pi + 1}: ${p.size}M`); p.slots.forEach((q, qi) => lines.push(`    ${qi + 1}. ${SLOT[q.t]?.n || q.t}${q.t === "scene" ? " — " + (st.scenes.find((s) => s.id === q.scene)?.name || "") : q.c.length ? " — " + q.c.map((id) => fixById(id)?.name || id).join(" + ") : ""}`)); }); });
    lines.push("", "LIGHTS");
    fixAll().forEach((f) => { const L = st.light[f.id] || {}; lines.push(`  ${f.name} (${zoneName(f.zone)}): ${L.dim ? "dims" : "no dim"}, glow-up ${L.fade ? L.fade + " s" : "instant"}, ${AUTO[L.auto] || "Manual"}${f.K ? ", " + L.K + " K" : ""}`); });
    lines.push("", "SCENES"); st.scenes.forEach((s) => lines.push(`  ${s.name}: ${Object.entries(s.levels).map(([k, v]) => (fixById(k)?.name || k) + " " + v + "%").join(", ") || "everything off"}`));
    lines.push("", "DATA " + JSON.stringify(st));
    return lines.join("\n");
  }
  function printSheet() {
    const w = window.open("", "_blank"); if (!w) return alert("Allow pop-ups to print the schedule.");
    const rows = st.boards.map((b) => `<h2>${esc(b.name)}</h2><table><tr><th>Plate</th><th>#</th><th>Module</th><th>Controls</th><th>Notes</th></tr>${b.plates.map((p, pi) => p.slots.map((q, qi) => {
      const ls = q.c.map(fixById).filter(Boolean), ways = ls.map((f) => where(f.id).filter((x) => x.q.t === "sw").length).filter((n) => n > 1);
      const note = [q.t === "dim" ? "dimmer — LED-compatible, soft-start " + Math.max(0, ...ls.map((f) => +(st.light[f.id]?.fade || 0))) + " s" : "", ways.length && q.t === "sw" ? "two-way" : "",
        ...ls.filter((f) => st.light[f.id]?.auto && st.light[f.id].auto !== "none").map((f) => f.name + ": " + AUTO[st.light[f.id].auto])].filter(Boolean).join("; ");
      return `<tr><td>${qi ? "" : `${pi + 1} · ${p.size}M`}</td><td>${qi + 1}</td><td>${SLOT[q.t]?.n || q.t}</td><td>${q.t === "scene" ? "Scene: " + esc(st.scenes.find((s) => s.id === q.scene)?.name || "") : esc(ls.map((f) => f.name).join(" + ") || "—")}</td><td>${esc(note)}</td></tr>`; }).join("")).join("")}</table>`).join("");
    const lt = `<h2>Every light</h2><table><tr><th>Light</th><th>Room</th><th>Qty</th><th>Colour</th><th>Dims</th><th>Glow-up</th><th>Automation</th><th>Switched from</th></tr>${fixAll().map((f) => { const L = st.light[f.id] || {};
      return `<tr><td>${esc(f.name)}</td><td>${zoneName(f.zone)}</td><td>${f.n}</td><td>${f.K ? L.K + " K" : "—"}</td><td>${f.kind === "load" ? "—" : L.dim ? "Yes" : "No"}</td><td>${f.kind === "load" ? "—" : L.fade ? L.fade + " s" : "Instant"}</td><td>${AUTO[L.auto] || "Manual"}</td><td>${esc(where(f.id).filter((x) => x.q.t === "sw").map((x) => x.b.name + " #" + (x.qi + 1)).join(", ") || "—")}</td></tr>`; }).join("")}</table>`;
    w.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>Switch schedule — A Study in Teak</title><style>body{font:12px/1.35 Arial,sans-serif;margin:24px;color:#111}h1{font-size:20px;margin:0 0 4px}h2{font-size:14px;margin:18px 0 6px;text-transform:uppercase}
      table{border-collapse:collapse;width:100%}th,td{border:1px solid #999;padding:4px 6px;text-align:left;vertical-align:top}th{background:#eee}p{color:#444}</style></head><body><h1>Switch schedule — A Study in Teak</h1>
      <p>Switches: Norisys TG9 toggles on modular plates (hole 1M, socket 2M, USB-C / Ethernet window 1M). Glow-up = soft start on the dimmer or driver; every dimmed light needs a dimmable LED driver matched to its dimmer.</p>${rows}${lt}</body></html>`);
    w.document.close(); setTimeout(() => w.print(), 300);
  }
  // ── events ──
  function slotAt(key) { const [bid, pi, qi] = key.split("."); const b = st.boards.find((x) => x.id === bid); return { b, p: b.plates[+pi], q: b.plates[+pi].slots[+qi], pi: +pi, qi: +qi }; }
  function press(key) {
    const { q } = slotAt(key);
    if (q.t === "sw" && q.c.length) { const turnOn = !q.c.every((id) => live[id]); q.c.forEach((id) => (live[id] = turnOn)); }
    else if (q.t === "scene") runScene(q.scene);
  }
  function runScene(id) {
    const sc = st.scenes.find((s) => s.id === id); if (!sc) return;
    live = {}; Object.entries(sc.levels).forEach(([lid, v]) => { live[lid] = v > 0;
      where(lid).filter((w) => w.q.t === "dim").forEach((w) => (level[`${w.b.id}.${w.pi}.${w.qi}`] = v)); });
  }
  function refreshPlan() {   // only the plan and the slot states, so the glow-up animates instead of jumping
    root.querySelectorAll(".swp-f").forEach((g) => { const id = g.dataset.l, b = brightness(id), fd = st.light[id]?.fade ?? 0;
      g.style.setProperty("--fd", (live[id] ? fd : Math.min(0.6, fd)) + "s"); g.style.setProperty("--b", b); g.classList.toggle("on", b > 0); });
    root.querySelectorAll(".swp-slot").forEach((el) => { const { q } = slotAt(el.dataset.slot); el.classList.toggle("on", !!(q.c.length && q.c.every((id) => live[id]))); });
  }
  const id36 = () => "x" + Math.random().toString(36).slice(2, 7);
  function onClick(e) {
    const t = e.target.closest("[data-mode],[data-slot],[data-act],[data-goto],[data-board]"); if (!t) return;
    if (t.dataset.mode) { mode = t.dataset.mode; ed = null; render(); return; }
    if (t.dataset.goto) { e.preventDefault(); root.querySelector("#swp-b-" + t.dataset.goto)?.scrollIntoView({ behavior: "smooth", block: "center" }); return; }
    if (t.dataset.board && !t.dataset.act) { root.querySelector("#swp-b-" + t.dataset.board)?.scrollIntoView({ behavior: "smooth", block: "center" }); return; }
    if (t.dataset.slot) {
      if (mode === "try") { press(t.dataset.slot); refreshPlan(); return; }
      ed = ed === t.dataset.slot ? null : t.dataset.slot; render(); root.querySelector(".swp-ed")?.scrollIntoView({ behavior: "smooth", block: "nearest" }); return;
    }
    const a = t.dataset.act, B = (id) => st.boards.find((x) => x.id === id);
    const cur = ed ? slotAt(ed) : null;
    if (a === "close") ed = null;
    else if (a === "stype" && cur) { cur.q.t = t.dataset.t; if (!["sw", "dim", "s6", "s16"].includes(cur.q.t)) cur.q.c = []; if (cur.q.t === "scene" && !cur.q.scene) cur.q.scene = st.scenes[0]?.id; }
    else if (a === "slight" && cur) { const l = t.dataset.l, i = cur.q.c.indexOf(l); i < 0 ? cur.q.c.push(l) : cur.q.c.splice(i, 1); if (cur.q.t === "spare" && cur.q.c.length) cur.q.t = "sw"; }
    else if (a === "sscene" && cur) cur.q.scene = t.dataset.s;
    else if ((a === "sleft" || a === "sright") && cur) { const j = cur.qi + (a === "sleft" ? -1 : 1); if (j >= 0 && j < cur.p.slots.length) { const s = cur.p.slots; [s[cur.qi], s[j]] = [s[j], s[cur.qi]]; ed = `${cur.b.id}.${cur.pi}.${j}`; } }
    else if (a === "sdel" && cur) { cur.p.slots.splice(cur.qi, 1); ed = null; }
    else if (a === "addslot") { const p = B(t.dataset.b).plates[+t.dataset.p]; p.slots.push({ t: "sw", c: [] }); ed = `${t.dataset.b}.${t.dataset.p}.${p.slots.length - 1}`; }
    else if (a === "delplate") { if (confirm("Remove this plate?")) B(t.dataset.b).plates.splice(+t.dataset.p, 1); ed = null; }
    else if (a === "addplate") B(t.dataset.b).plates.push({ size: 8, slots: [] });
    else if (a === "rename") { const b = B(t.dataset.b), n = prompt("Board name", b.name); if (n) b.name = n; }
    else if (a === "delboard") { if (confirm("Remove this board?")) st.boards = st.boards.filter((x) => x.id !== t.dataset.b); ed = null; }
    else if (a === "addboard") { const n = prompt("Where is the new board? e.g. Bathroom · by the vanity"); if (!n) return; const z = (prompt("Which room: study, bedroom, dressing or bathroom?", "bedroom") || "bedroom").toLowerCase().trim();
      st.boards.push({ id: id36(), name: n, zone: ZONES.some((q) => q[0] === z) ? z : "bedroom", at: [2250, 3000], plates: [{ size: 8, slots: [] }] }); }
    else if (a === "addlight") { const n = root.querySelector("#swp-new-n").value.trim(); if (!n) return; const id = id36(), k = root.querySelector("#swp-new-k").value;
      st.custom.push({ id, zone: root.querySelector("#swp-new-z").value, name: n, kind: k, n: 1, K: k === "load" ? 0 : 3000, geo: {} }); st.light[id] = { dim: k !== "load", fade: k === "load" ? 0 : 1.5, auto: "none", K: 3000 }; }
    else if (a === "runscene") { runScene(t.dataset.s); refreshPlan(); root.querySelectorAll("[data-dim]").forEach((r) => (r.value = level[r.dataset.dim] ?? 100)); return; }
    else if (a === "savescene") { const n = prompt("Name this scene"); if (!n) return; const lv = {}; Object.keys(live).filter((k) => live[k]).forEach((k) => (lv[k] = Math.round(brightness(k) * 100))); st.scenes.push({ id: id36(), name: n, levels: lv }); }
    else if (a === "copy") { const txt = asText(); (navigator.clipboard?.writeText(txt) || Promise.reject()).then(() => flash(t, "Copied — paste it to Claude"), () => { prompt("Copy this and paste it to Claude:", txt); }); return; }
    else if (a === "print") { printSheet(); return; }
    else if (a === "dl") { const u = URL.createObjectURL(new Blob([JSON.stringify(st, null, 1)], { type: "application/json" })); const l = document.createElement("a"); l.href = u; l.download = "switch-plan.json"; l.click(); setTimeout(() => URL.revokeObjectURL(u), 2000); return; }
    else if (a === "ul") { root.querySelector("#swp-file").click(); return; }
    else if (a === "reset") { if (!confirm("Start again from the suggested plan? Your changes in this browser will be replaced.")) return; st = defaults(); live = {}; level = {}; ed = null; }
    else return;
    save(); render();
  }
  function flash(el, txt) { const o = el.textContent; el.textContent = txt; setTimeout(() => (el.textContent = o), 1800); }
  function onChange(e) {
    const t = e.target;
    if (t.dataset.lp) { const L = st.light[t.dataset.l]; L[t.dataset.lp] = t.type === "checkbox" ? t.checked : t.dataset.lp === "auto" ? t.value : +t.value; save(); if (t.dataset.lp === "dim") render(); return; }
    if (t.dataset.act === "psize") { st.boards.find((b) => b.id === t.dataset.b).plates[+t.dataset.p].size = +t.value; save(); render(); return; }
    if (t.id === "swp-file" && t.files[0]) { t.files[0].text().then((s) => { try { const j = JSON.parse(s.includes("DATA {") ? s.slice(s.indexOf("DATA {") + 5) : s); if (j.v === 1) { st = j; save(); render(); } } catch (err) { alert("That file is not a switch plan."); } }); }
  }
  function onInput(e) { const t = e.target; if (t.dataset.dim) { level[t.dataset.dim] = +t.value; refreshPlan(); } }
  const CSS = `
.swp{margin-top:24px}
.swp-bar{display:flex;flex-wrap:wrap;gap:12px;justify-content:space-between;align-items:center}
.swp-modes,.swp-acts{display:flex;flex-wrap:wrap;gap:8px}
.swp-acts .btn{height:34px;font-size:12px;padding:0 14px}
.swp-totals{display:flex;flex-wrap:wrap;gap:6px 18px;margin:18px 0 6px;font-size:11px;color:var(--dim)}
.swp-totals b{color:var(--white);font-weight:400}.swp-totals .warn,.swp-totals .warn b{color:var(--ember)}
.swp-help{font:400 15px/1.4 var(--grotesk);color:var(--dim);max-width:820px;margin:6px 0 18px}
.swp-grid{display:grid;grid-template-columns:minmax(0,5fr) minmax(0,6fr);gap:24px;align-items:start}
@media (max-width:980px){.swp-grid{grid-template-columns:1fr}}
.swp-planbox{position:sticky;top:84px;display:flex;flex-direction:column;gap:12px}
@media (max-width:980px){.swp-planbox{position:static}}
.swp-plan{background:#121313;border-radius:10px;padding:10px}
.swp-svg{width:100%;height:auto;display:block;max-height:72vh}
.swp-wall{fill:#1b1d1d;stroke:#5a5a5a;stroke-width:40}
.swp-part{stroke:#6b6b6b;stroke-width:90;stroke-dasharray:140 70}
.swp-furn{fill:none;stroke:#3b3d3d;stroke-width:22}
.swp-lbl{font:400 210px var(--mono);fill:#4c4c4c;text-anchor:middle}
.swp-f .core{fill:#3a3a3a;stroke:#3a3a3a;stroke-width:46;transition:fill var(--fd) ease-out,stroke var(--fd) ease-out}
.swp-f.k-load .core{fill:none;stroke:#555;stroke-width:24}
.swp-f .glow{fill:#ffb766;stroke:#ffb766;stroke-width:300;stroke-linecap:round;opacity:0;transition:opacity var(--fd) ease-out}.swp-f circle.glow{stroke:none}
.swp-bn{display:inline-flex;align-items:center;justify-content:center;min-width:32px;height:22px;border-radius:999px;background:var(--ember);color:#111;font:400 11px var(--mono)}
.swp-f.on .glow{opacity:calc(var(--b) * .85)}
.swp-f.on .core{fill:#ffd9a3;stroke:#ffd9a3}
.swp-f.k-load.on .core{fill:none;stroke:var(--ember)}
.swp-bd rect{fill:var(--ember);opacity:.9;cursor:pointer}.swp-bd text{font:400 170px var(--mono);fill:var(--ember);text-anchor:middle}
.swp-boards{display:flex;flex-direction:column;gap:22px}
.swp-zone{display:flex;flex-direction:column;gap:12px}.swp-zone>.eyebrow{color:var(--dim)}
.swp-board{background:var(--charcoal);border-radius:10px;padding:18px 18px 14px}
.swp-bt{display:flex;flex-wrap:wrap;align-items:baseline;gap:6px 12px;margin-bottom:12px}
.swp-bt .mono{font-size:10px;color:var(--dim)}.swp-bt h4{margin:0;font:400 19px/1 var(--cond);text-transform:uppercase;letter-spacing:-.02em}
.swp-tools{margin-left:auto;display:flex;gap:6px}
.mini{height:28px;padding:0 11px;border:1px solid var(--steel);border-radius:999px;background:none;color:var(--white);font:400 11px/1 var(--mono);text-transform:uppercase;letter-spacing:-.02em;cursor:pointer}
.mini:hover{border-color:var(--white)}
.swp-plate-row{display:flex;flex-direction:column;gap:6px;margin-bottom:10px}
.swp-plate{display:flex;gap:3px;padding:9px;border-radius:7px;background:linear-gradient(#5a4632,#3d2f22);box-shadow:inset 0 1px 0 rgba(255,255,255,.12),0 2px 8px rgba(0,0,0,.5);overflow-x:auto}
.swp-slot{position:relative;flex:0 0 auto;width:62px;min-height:118px;display:flex;flex-direction:column;align-items:center;gap:8px;padding:12px 4px 8px;border-radius:5px;background:rgba(0,0,0,.18);border:1px solid transparent;color:#f3e6d4;cursor:pointer}
.swp-slot.m2{width:96px}.swp-slot:hover{border-color:rgba(255,255,255,.35)}.swp-slot.sel{border-color:var(--ember);background:rgba(204,100,55,.18)}
.swp-slot .cap{font:400 9.5px/1.15 var(--grotesk);text-align:center;color:#e9dccb;word-break:break-word}.swp-slot .cap b{display:block;font:400 9px var(--mono);color:#b9a68c}
.swp-slot.t-spare .cap,.swp-slot.t-spare .lever{opacity:.45}
.lever{width:10px;height:30px;border-radius:5px;background:linear-gradient(90deg,#cfd2d4,#7d8184 60%,#b4b8bb);transform:rotate(-14deg);transform-origin:50% 90%;transition:transform .25s;box-shadow:0 2px 3px rgba(0,0,0,.6)}
.swp-slot.on .lever{transform:rotate(14deg)}
.knob{width:26px;height:26px;border-radius:50%;background:radial-gradient(circle at 40% 35%,#d6d9db,#6d7174);box-shadow:0 2px 3px rgba(0,0,0,.6)}
.btn-s{width:20px;height:20px;border-radius:50%;border:2px solid #cfd2d4}.swp-slot.t-scene.on .btn-s{background:var(--ember)}
.sock{display:flex;gap:7px;padding:9px 10px;border-radius:6px;background:#2a221a}.sock i{width:7px;height:9px;border-radius:2px;background:#0d0b09}.sock i:nth-child(2){height:12px}
.win{display:inline-flex;align-items:center;justify-content:center;min-width:34px;height:22px;border-radius:4px;background:#1c1712;font:400 10px var(--mono);color:#cbb79d}
.swp-slot input[type=range]{width:54px;accent-color:var(--ember)}
.swp-slot.on{background:rgba(255,190,110,.12)}
.swp-pmeta{display:flex;flex-wrap:wrap;gap:6px;align-items:center}.swp-pmeta .mono{font-size:10px;color:var(--dim);margin-right:4px}.swp-pmeta .over{color:var(--ember)}
.swp-pmeta select,.swp-lights select,.swp-add select,.swp-add input{background:#1b1c1c;color:var(--white);border:1px solid var(--steel);border-radius:999px;height:28px;padding:0 10px;font:400 11px var(--mono);text-transform:uppercase}
.swp-add input{text-transform:none;font-family:var(--grotesk);font-size:13px;min-width:220px}
.swp-ed{background:var(--charcoal);border-radius:10px;padding:16px;max-height:52vh;overflow:auto;border:1px solid var(--ember)}
.swp-ed-top{display:flex;justify-content:space-between;align-items:center;margin-bottom:6px}.swp-ed-top .mono{font-size:11px}
.swp-sub{font-size:10px;color:var(--dim);margin:12px 0 6px}.swp-zl{font-size:10px;color:#8d8d8d;margin:10px 0 5px}
.chips{display:flex;flex-wrap:wrap;gap:6px}
.chip{padding:6px 10px;border-radius:999px;border:1px solid var(--steel);background:none;color:var(--dim);font:400 12px/1.1 var(--grotesk);cursor:pointer;text-align:left}
.chip.sel{border-color:var(--white);color:var(--white);background:rgba(255,255,255,.07)}.chip i{font-style:normal;color:var(--ember)}
.swp-ed-foot{display:flex;gap:6px;margin-top:14px}
.swp-scenes{display:flex;flex-wrap:wrap;gap:6px;align-items:center}.swp-scenes .mono{font-size:10px;color:var(--dim);margin-right:6px}
.swp-addb{align-self:flex-start}
.swp-lights{display:flex;flex-direction:column;gap:22px}
.swp-lz{background:var(--charcoal);border-radius:10px;padding:16px 18px;overflow-x:auto}
.swp-tbl{width:100%;border-collapse:collapse;font:400 13px/1.3 var(--grotesk)}
.swp-tbl th{font:400 10px var(--mono);text-transform:uppercase;color:var(--dim);text-align:left;padding:6px 8px;border-bottom:1px solid var(--hair)}
.swp-tbl td{padding:8px;border-bottom:1px solid var(--hair);vertical-align:middle}.swp-tbl td b{font-weight:400;display:block}
.swp-tbl .dim{font-size:10px;color:var(--dim);display:block;margin-top:2px}
.swp-at{display:block;color:var(--white);text-decoration:underline;text-decoration-color:var(--steel);font-size:12px}
.swp-none{color:var(--ember);font:400 11px var(--mono);text-transform:uppercase}
.tog{position:relative;display:inline-block;width:36px;height:20px}.tog input{opacity:0;width:0;height:0}
.tog span{position:absolute;inset:0;border-radius:999px;background:#3a3a3a;transition:.2s}.tog span::after{content:"";position:absolute;left:3px;top:3px;width:14px;height:14px;border-radius:50%;background:#bbb;transition:.2s}
.tog input:checked+span{background:var(--ember)}.tog input:checked+span::after{transform:translateX(16px);background:#fff}
.swp-add{display:flex;flex-wrap:wrap;gap:8px;align-items:center}.swp-add .mono{font-size:10px;color:var(--dim)}
`;
  function mount(el) {
    root = el; root.classList.add("swp");
    if (!document.getElementById("swp-css")) { const s = document.createElement("style"); s.id = "swp-css"; s.textContent = CSS; document.head.appendChild(s); }
    st = load(); render();
    root.addEventListener("click", onClick); root.addEventListener("change", onChange); root.addEventListener("input", onInput);
  }
  window.SWITCHPLAN = { mount };
})();
