// The switch planner (owner, 9 Oct): the lighting tab's working tool. Every light in the suite as it is now built (the
// Blender model's fixtures, at their real places), the switch boards from the owner's electric plan (Canva, "Saksham's
// Room Electric Plan"), each made of real Norisys TG9 cover plates (their price list, 2023: every layout 1M–8M by code),
// and a way to play: put any light on any switch, add lights where you want them (how many, how many watts, what
// colour), make them dim, give them a slow glow-up, mark what is automated — then press the switches and watch the plan.
//
// TG9 modules: a column of toggle holes is 1M (one hole, or two stacked), a window 1M (USB, data, TV), a socket 2M.
// The plan is kept in this browser (localStorage) and travels as text: "Copy for Claude" for changes to the site and
// the drawings, "Print for the electrician" for the schedule with plate codes and back-box sizes.
(function () {
  const KEY = "ast.switchplan.v1", VER = 2;
  const ZONES = [["study", "Study"], ["bedroom", "Bedroom"], ["dressing", "Dressing room"], ["bathroom", "Bathroom"]];
  const zoneName = (z) => (ZONES.find((q) => q[0] === z) || [z, z])[1];
  const KINDS = { spot: "Focus spot", cove: "Cove", strip: "LED strip", lamp: "Wall lamp", pendant: "Pendant", plug: "Plug-in lamp", load: "Appliance" };
  const AUTO = { none: "Manual", motion: "Motion sensor", timer: "Timer / schedule", smart: "Smart (app · voice)", scene: "Scenes only" };
  const FADES = [0, 0.5, 1, 1.5, 2, 3, 5];
  const isLine = (k) => k === "cove" || k === "strip";
  const WDEF = { spot: 8, cove: 10, strip: 10, lamp: 12, pendant: 15, plug: 7, load: 0 };   // starting estimates
  const W_PT = [3, 5, 8, 10, 12, 15, 18, 24], W_PM = [4.8, 7.2, 9.6, 12, 14.4, 19.2], KS = [2200, 2700, 3000, 3500, 4000];
  const DIM_MAX = 100;                                                                  // the TG9 LED dimmer: 100 W, 2-wire
  // ── Norisys TG9 cover plates (price list p. 28–39): code, modules, layout — h a hole, H two stacked, w a window, s a socket ──
  const CAT = [["9111", 1, "h"], ["9121", 1, "w"], ["9212", 2, "hh"], ["9142", 2, "hw"], ["9132", 2, "ww"], ["9222", 2, "HH"], ["9152", 2, "s"],
    ["9313", 3, "hhh"], ["9323", 3, "HHH"], ["9133", 3, "Hs"], ["9143", 3, "hs"], ["9153", 3, "hhw"], ["9163", 3, "hww"],
    ["9414", 4, "hhhh"], ["9424", 4, "HHHH"], ["9114", 4, "HHs"], ["9144", 4, "hhs"], ["9134", 4, "hsw"], ["9164", 4, "hhhw"],
    ["9116", 6, "hhhhs"], ["9616", 6, "hhhhhh"], ["9126", 6, "HHHHs"], ["9626", 6, "HHHHHH"], ["9136", 6, "HHsww"], ["9146", 6, "shhs"], ["9156", 6, "HHHsw"],
    ["9166", 6, "hhsww"], ["9176", 6, "hhhsw"], ["9186", 6, "hhhhww"],
    ["9118", 8, "hhhhhhs"], ["9818", 8, "hhhhhhhh"], ["9128", 8, "hhhhsww"], ["9148", 8, "shhhhs"], ["9158", 8, "hhhhhhww"], ["9828", 8, "HHHHHHHH"],
    ["9178", 8, "hshsww"], ["9188", 8, "HHHsHs"], ["9198", 8, "HHHHHHww"], ["9138", 8, "hhhwwhs"], ["9168", 8, "hhhshs"]].map(([code, m, lay]) => ({ code, m, lay }));
  const BOX = { 1: "3″ × 3″ (75 × 75 mm)", 2: "3″ × 3″ (75 × 75 mm)", 3: "4″ × 3″ (100 × 75 mm)", 4: "5″ × 3″ (135 × 75 mm)", 6: "8″ × 3″ (210 × 75 mm)", 8: "9″ or 8″ × 3″ (230/210 × 80 mm)" };
  const cat = (code) => CAT.find((c) => c.code === code) || CAT.find((c) => c.code === "9818");
  const posOf = (lay) => [...lay].flatMap((ch, col) => (ch === "H" ? [{ k: "h", col, row: 0 }, { k: "h", col, row: 1 }] : [{ k: ch, col, row: 0 }]));
  const descOf = (c) => { const p = posOf(c.lay), h = p.filter((q) => q.k === "h").length, s = p.filter((q) => q.k === "s").length, w = p.filter((q) => q.k === "w").length;
    return [h && `${h} hole${h > 1 ? "s" : ""}`, s && `${s} socket${s > 1 ? "s" : ""}`, w && `${w} window${w > 1 ? "s" : ""}`].filter(Boolean).join(" + "); };
  const SLOT = {
    sw: { k: "h", n: "Switch" }, dim: { k: "h", n: "LED dimmer" }, fan: { k: "h", n: "Fan regulator" }, bell: { k: "h", n: "Bell push" }, scene: { k: "h", n: "Scene key" }, spare: { k: "h", n: "Blank" },
    s6: { k: "s", n: "Socket 6A" }, s16: { k: "s", n: "Socket 16A" }, s13: { k: "s", n: "Multi socket 13A" },
    usbc: { k: "w", n: "USB-C charger" }, usbac: { k: "w", n: "USB A + C charger" }, eth: { k: "w", n: "Ethernet" }, tv: { k: "w", n: "TV point" }, blankw: { k: "w", n: "Blank" },
  };
  const BLANK = { h: "spare", s: "s6", w: "blankw" };
  const FEEDS = (t) => ["sw", "dim", "fan", "s6", "s16", "s13"].includes(t);
  // ── the fixtures, at their places in plan (mm: x from the left wall, s from the study wall) ──
  const BX = (x) => 4777 + x;
  const F = (id, zone, name, kind, n, K, geo, ex = {}) => ({ id, zone, name, kind, n, K, geo, ...ex });
  const P = (...pts) => ({ pts }), Ln = (...lines) => ({ lines });
  const FIX = [
    F("st_pairL", "study", "Study-wall spots · over the bookcase", "spot", 2, 3000, P([696, 762], [935, 762])),
    F("st_pairC", "study", "Study-wall spots · over the painting", "spot", 2, 3000, P([2114, 762], [2358, 762])),
    F("st_pairR", "study", "Study-wall spots · over the window", "spot", 2, 3000, P([3541, 762], [3780, 762])),
    F("desk_sp", "study", "Spots over the desk", "spot", 3, 3000, P([1715, 2139], [2314, 2139], [2909, 2139])),
    F("niche_bk", "study", "Bookcase arch · niche spots", "spot", 3, 3000, P([244, 131], [744, 131], [1244, 131]), { w: 3 }),
    F("niche_win", "study", "Window arch · niche spots", "spot", 3, 3000, P([3474, 140], [3937, 140], [4400, 140]), { w: 3 }),
    F("counter", "study", "Counter frame · two small spots", "spot", 2, 3000, P([2073, 150], [2673, 150]), { w: 3 }),
    F("shelf", "study", "Bookcase · strip under each shelf", "strip", 4, 3000, Ln([104, 234, 1384, 234]), { len: 5.1 }),
    F("picture", "study", "Picture light over the painting", "strip", 1, 2700, Ln([2164, 110, 2584, 110]), { pt: true, w: 6 }),
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
    F("wd_left", "dressing", "Wardrobes · lit backs, left run", "strip", 3, 3000, Ln([5640, 3040, 8430, 3040]), { len: 7.2 }),
    F("wd_right", "dressing", "Wardrobes · lit backs, right run", "strip", 3, 3000, Ln([4860, 5670, 7650, 5670]), { len: 7.2 }),
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
  // ── the boards: the owner's electric plan on the room as it is now, in real TG9 plates (a starting point — change anything) ──
  const S = (t, c = [], extra = {}) => ({ t, c, ...extra });
  const PL = (code, ...slots) => ({ code, slots });
  const BOARDS = [
    { id: "entry", name: "By the door · main board", zone: "bedroom", at: [-177, 4760], plates: [PL("9818",
      S("sw", ["sp_left"]), S("sw", ["sp_right"]), S("sw", ["sp_mid"]), S("sw", ["sp_part"]), S("sw", ["cove_l", "cove_r", "cove_b"]), S("dim", ["cove_l", "cove_r", "cove_b"]), S("sw", ["rw_bed"]), S("scene", [], { scene: "off" }))] },
    { id: "bedL", name: "Bed back · left side", zone: "bedroom", at: [1144, 5730], plates: [PL("9128",
      S("sw", ["bed_l"]), S("dim", ["bed_l"]), S("sw", ["cove_b"]), S("scene", [], { scene: "night" }), S("s6"), S("usbc"), S("usbc"))] },
    { id: "bedR", name: "Bed back · right side", zone: "bedroom", at: [3531, 5730], plates: [PL("9178",
      S("sw", ["bed_r"]), S("s16", ["ac_bed"]), S("sw", ["ac_bed"]), S("s6"), S("eth"), S("usbc"))] },
    { id: "part", name: "Partition · by the TV", zone: "bedroom", at: [3300, 2470], plates: [PL("9148",
      S("s6", ["tv"]), S("sw", ["tv"]), S("sw", ["soundbar"]), S("sw", ["sp_part"]), S("spare"), S("s6", ["soundbar"]))] },
    { id: "rwMain", name: "Right wall · main board", zone: "bedroom", at: [4547, 3900], plates: [PL("9818",
      S("sw", ["sp_right"]), S("sw", ["sp_mid"]), S("sw", ["rw_bed"]), S("sw", ["cove_r"]), S("spare"), S("spare"), S("spare"), S("spare"))] },
    { id: "rwSmall", name: "Right wall · small board", zone: "bedroom", at: [4547, 3150], plates: [PL("9146", S("s6"), S("sw"), S("sw"), S("s16"))] },
    { id: "stLeft", name: "Study · left wall", zone: "study", at: [-50, 1600], plates: [PL("9818",
      S("sw", ["st_lamps", "rw_study"]), S("sw", ["st_pairL"]), S("sw", ["st_pairC"]), S("sw", ["st_pairR"]), S("sw", ["desk_sp"]), S("sw", ["shelf"]), S("dim", ["shelf"]), S("sw", ["niche_bk", "niche_win", "counter"]))] },
    { id: "shelfB", name: "Study · inside the bookcase", zone: "study", at: [744, 320], plates: [PL("9178",
      S("sw", ["picture"]), S("s16"), S("spare"), S("s6"), S("usbc"), S("usbc"))] },
    { id: "desk", name: "Study · under the desk", zone: "study", at: [2337, 1700], plates: [
      PL("9142", S("sw", ["desk_lamp"]), S("usbc")), PL("9152", S("s6", ["desk_lamp"])), PL("9146", S("s6"), S("spare"), S("spare"), S("s16")), PL("9132", S("eth"), S("usbc"))] },
    { id: "stRight", name: "Study · right wall", zone: "study", at: [4547, 1250], plates: [PL("9128",
      S("sw", ["wifi"]), S("sw", ["rw_study"]), S("spare"), S("spare"), S("s6", ["wifi"]), S("eth"), S("usbc"))] },
    { id: "dress", name: "Dressing room · by its door", zone: "dressing", at: [4860, 5500], plates: [
      PL("9158", S("sw", ["dr_mid"]), S("sw", ["dr_mirror"]), S("sw", ["dr_coffer", "dr_vault", "dr_door"]), S("dim", ["dr_coffer", "dr_vault", "dr_door"]), S("sw", ["ac_dr"]), S("spare"), S("usbc"), S("usbc")),
      PL("9148", S("s6"), S("sw", ["wd_left"]), S("sw", ["wd_right"]), S("sw", ["tunnel"]), S("spare"), S("s16", ["ac_dr"]))] },
    { id: "bath", name: "Bathroom · by its door", zone: "bathroom", at: [4900, 2620], plates: [
      PL("9818", S("sw", ["b_van"]), S("sw", ["b_wc"]), S("sw", ["b_mid"]), S("sw", ["b_tub"]), S("sw", ["b_cove"]), S("dim", ["b_mid", "b_tub", "b_cove"]), S("sw", ["geyser"]), S("sw", ["exhaust"])),
      PL("9148", S("s6"), S("spare"), S("spare"), S("spare"), S("spare"), S("s16", ["geyser"]))] },
  ];
  const SCENES = [
    { id: "off", name: "All off", levels: {} },
    { id: "night", name: "Night", levels: { bed_l: 25, bed_r: 25, cove_b: 15 } },
    { id: "evening", name: "Evening", levels: { cove_l: 60, cove_r: 60, cove_b: 60, st_lamps: 80, rw_study: 80, rw_bed: 80, bed_l: 70, bed_r: 70, shelf: 70, niche_bk: 70, niche_win: 70, counter: 70, picture: 100 } },
    { id: "work", name: "Work", levels: { desk_sp: 100, st_pairC: 100, desk_lamp: 100, shelf: 60, niche_bk: 60, counter: 60 } },
  ];
  // ── geometry and watts ──
  const lenMM = (lines) => (lines || []).reduce((a, [x0, y0, x1, y1]) => a + Math.hypot(x1 - x0, y1 - y0), 0);
  function geoOf(f) {
    if (!f.custom) return f.geo || {};
    const a = f.a, b = f.b;
    if (!a) return {};
    if (isLine(f.kind)) return { lines: [[a[0], a[1], (b || [a[0] + 600, a[1]])[0], (b || [a[0] + 600, a[1]])[1]]] };
    if (!b || f.n <= 1) return { pts: [a] };
    return { pts: Array.from({ length: f.n }, (_, i) => [Math.round(a[0] + ((b[0] - a[0]) * i) / (f.n - 1)), Math.round(a[1] + ((b[1] - a[1]) * i) / (f.n - 1))]) };
  }
  const perM = (f) => isLine(f.kind) && !f.pt;
  const lightDefault = (f) => ({ dim: f.kind !== "load" && f.kind !== "plug", fade: f.kind === "load" ? 0 : 1.5, auto: ["wd_left", "wd_right", "tunnel"].includes(f.id) ? "motion" : "none",
    K: f.K || 3000, w: f.w ?? WDEF[f.kind] ?? 8, len: perM(f) ? +(f.len ?? lenMM(geoOf(f).lines) / 1000).toFixed(2) : undefined });
  const wattOf = (f) => { const L = st.light[f.id] || {}; return perM(f) ? (+L.w || 0) * (+L.len || 0) : (+L.w || 0) * (f.n || 1); };
  const fmtW = (w) => (w >= 100 ? Math.round(w) : Math.round(w * 10) / 10) + " W";
  const defaults = () => {
    const boards = JSON.parse(JSON.stringify(BOARDS));
    boards.forEach((b) => b.plates.forEach((p) => { const want = posOf(cat(p.code).lay).map((q) => q.k).join(""), got = p.slots.map((q) => (SLOT[q.t] || SLOT.spare).k).join("");
      if (want !== got) { console.warn("switchplan: plate", b.id, p.code, "wants", want, "has", got); conform(p, p.code); } }));
    return { v: VER, light: Object.fromEntries(FIX.map((f) => [f.id, lightDefault(f)])), boards, scenes: JSON.parse(JSON.stringify(SCENES)), custom: [] };
  };
  let st, mode = "plan", live = {}, level = {}, root, ed = null, addOpen = false, pl = null, note = "";
  const af = { zone: "dressing", kind: "spot", name: "", n: 1, w: 8, K: 3000, wire: "" };
  const fixAll = () => FIX.concat(st.custom || []);
  const fixById = (id) => fixAll().find((f) => f.id === id);
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(st)); } catch (e) {} };
  function load() {
    let s = null; try { s = JSON.parse(localStorage.getItem(KEY) || "null"); } catch (e) {}
    const d = defaults(); if (!s) return d;
    if (s.v !== VER) { d.custom = s.custom || []; for (const [k, v] of Object.entries(s.light || {})) d.light[k] = { ...d.light[k], ...v }; s = d; }   // the plates are new: boards restart, light settings stay
    for (const f of FIX.concat(s.custom)) s.light[f.id] = { ...lightDefault(f), ...(s.light[f.id] || {}) };
    return s;
  }
  const esc = (t = "") => String(t).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const bNo = (b) => "B" + (st.boards.indexOf(b) + 1);
  const where = (lid) => { const r = []; st.boards.forEach((b) => b.plates.forEach((p, pi) => p.slots.forEach((q, qi) => { if (q.c.includes(lid) && (q.t === "sw" || q.t === "dim")) r.push({ b, pi, qi, q }); }))); return r; };
  const dimLoad = (q) => q.c.map(fixById).filter((f) => f && f.kind !== "load").reduce((a, f) => a + wattOf(f), 0);
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
      const g = geoOf(f), b = brightness(f.id), fd = st.light[f.id]?.fade ?? 0;
      s += `<g class="swp-f k-${f.kind}${b > 0 ? " on" : ""}${f.custom ? " cust" : ""}" data-l="${f.id}" style="--b:${b};--fd:${live[f.id] ? fd : Math.min(0.6, fd)}s"><title>${esc(f.name)}</title>`;
      (g.lines || []).forEach(([x0, y0, x1, y1]) => (s += `<line x1="${x0}" y1="${y0}" x2="${x1}" y2="${y1}" class="glow" filter="url(#swp-glow)"/><line x1="${x0}" y1="${y0}" x2="${x1}" y2="${y1}" class="core"/>`));
      (g.pts || []).forEach(([x, y]) => (s += f.kind === "load" ? `<rect x="${x - 70}" y="${y - 70}" width="140" height="140" rx="20" class="core"/>`
        : `<circle cx="${x}" cy="${y}" r="${f.kind === "lamp" || f.kind === "pendant" ? 240 : 200}" class="glow" filter="url(#swp-glow)"/><circle cx="${x}" cy="${y}" r="${f.kind === "lamp" || f.kind === "pendant" ? 70 : 55}" class="core"/>`));
      s += `</g>`;
    }
    st.boards.forEach((b, i) => (s += `<g class="swp-bd" data-board="${b.id}"><title>${esc(b.name)}</title><rect x="${b.at[0] - 120}" y="${b.at[1] - 70}" width="240" height="140" rx="30"/><text x="${b.at[0]}" y="${b.at[1] + 300}">B${i + 1}</text></g>`));
    if (pl && pl.a) s += `<circle cx="${pl.a[0]}" cy="${pl.a[1]}" r="90" class="swp-ghost"/>`;
    return s + `</svg>`;
  }
  // ── a board: its plates, slot by slot, laid out as the real plate ──
  function slotHTML(b, pi, qi, q, half) {
    const T = SLOT[q.t] || SLOT.spare, key = `${b.id}.${pi}.${qi}`, names = q.c.map((id) => fixById(id)?.name || id);
    const on = q.c.length && q.c.every((id) => live[id]), over = q.t === "dim" && dimLoad(q) > DIM_MAX;
    const cls = `swp-slot t-${q.t} k-${T.k}${half ? " half" : ""}${on ? " on" : ""}${ed === key ? " sel" : ""}${over ? " over" : ""}`;
    let face = "";
    if (["sw", "spare", "bell"].includes(q.t)) face = `<span class="lever"></span>`;
    else if (q.t === "dim" || q.t === "fan") face = mode === "try" && q.t === "dim" ? `<input type="range" min="5" max="100" value="${level[key] ?? 100}" data-dim="${key}" aria-label="Dimmer">` : `<span class="knob"></span>`;
    else if (q.t === "scene") face = `<span class="btn-s"></span>`;
    else if (T.k === "s") face = `<span class="sock"><i></i><i></i><i></i></span>`;
    else face = `<span class="win">${{ usbc: "C", usbac: "A·C", eth: "LAN", tv: "TV", blankw: "" }[q.t] ?? ""}</span>`;
    const lab = q.t === "scene" ? (st.scenes.find((s) => s.id === q.scene)?.name || "Scene") : names.length ? names.join(" + ") : T.n;
    return `<button class="${cls}" data-slot="${key}" title="${esc(T.n + (names.length ? ": " + names.join(", ") : "") + (over ? ` — ${Math.round(dimLoad(q))} W, over the dimmer's ${DIM_MAX} W` : ""))}">${face}<span class="cap"><b>${String(qi + 1).padStart(2, "0")}${over ? " · OVER" : ""}</b>${esc(lab)}</span></button>`;
  }
  function plateHTML(b, p, pi) {
    const c = cat(p.code), pos = posOf(c.lay); let html = "", i = 0;
    [...c.lay].forEach((ch) => {
      if (ch === "H") { html += `<div class="swp-col two">${slotHTML(b, pi, i, p.slots[i], true)}${slotHTML(b, pi, i + 1, p.slots[i + 1], true)}</div>`; i += 2; }
      else { html += `<div class="swp-col">${slotHTML(b, pi, i, p.slots[i], false)}</div>`; i += 1; }
    });
    return html;
  }
  function plateSelect(b, p, pi) {
    const sizes = [...new Set(CAT.map((c) => c.m))];
    return `<select data-act="pcode" data-b="${b.id}" data-p="${pi}">${sizes.map((m) => `<optgroup label="${m}M · box ${BOX[m]}">${CAT.filter((c) => c.m === m).map((c) => `<option value="${c.code}"${c.code === p.code ? " selected" : ""}>${c.code} · ${descOf(c)}</option>`).join("")}</optgroup>`).join("")}</select>`;
  }
  function boardHTML(b) {
    return `<div class="swp-board" id="swp-b-${b.id}"><div class="swp-bt"><span class="swp-bn">${bNo(b)}</span><h4>${esc(b.name)}</h4>
      ${mode === "plan" ? `<span class="swp-tools"><button class="mini" data-act="addplate" data-b="${b.id}">+ Plate</button><button class="mini" data-act="placeboard" data-b="${b.id}">Move on plan</button><button class="mini" data-act="rename" data-b="${b.id}">Rename</button><button class="mini" data-act="delboard" data-b="${b.id}">Remove</button></span>` : ""}</div>
      ${b.plates.map((p, pi) => { const c = cat(p.code);
        return `<div class="swp-plate-row"><div class="swp-plate m${c.m}">${plateHTML(b, p, pi)}</div>
        <div class="swp-pmeta"><span class="mono">Norisys ${c.code} · ${c.m}M · box ${BOX[c.m]}</span>${mode === "plan" ? `${plateSelect(b, p, pi)}<button class="mini" data-act="delplate" data-b="${b.id}" data-p="${pi}" title="Remove this plate">✕</button>` : ""}</div></div>`; }).join("")}</div>`;
  }
  // ── the slot editor (plan mode) ──
  function editorHTML() {
    if (!ed) return "";
    const [bid, pi, qi] = ed.split("."), b = st.boards.find((x) => x.id === bid); if (!b) return "";
    const p = b.plates[+pi], q = p?.slots[+qi]; if (!q) return "";
    const k = posOf(cat(p.code).lay)[+qi].k;
    const types = Object.entries(SLOT).filter(([, v]) => v.k === k).map(([t, v]) => `<button class="chip${q.t === t ? " sel" : ""}" data-act="stype" data-t="${t}">${v.n}</button>`).join("");
    let pick = "";
    if (q.t === "scene") pick = `<div class="swp-sub mono">Which scene</div><div class="chips">${st.scenes.map((s) => `<button class="chip${q.scene === s.id ? " sel" : ""}" data-act="sscene" data-s="${s.id}">${esc(s.name)}</button>`).join("")}</div>`;
    else if (FEEDS(q.t) || q.t === "spare") pick = `<div class="swp-sub mono">${q.t === "dim" ? `It dims · ${fmtW(dimLoad(q))} of ${DIM_MAX} W` : q.t === "sw" || q.t === "spare" ? "It switches" : "It feeds"}</div>
        ${ZONES.map(([z, zn]) => `<div class="swp-zl mono">${zn}</div><div class="chips">${fixAll().filter((f) => f.zone === z).map((f) => {
          const other = where(f.id).filter((w) => `${w.b.id}.${w.pi}.${w.qi}` !== ed && w.q.t === "sw");
          return `<button class="chip${q.c.includes(f.id) ? " sel" : ""}" data-act="slight" data-l="${f.id}" title="${other.length ? "Also switched from: " + other.map((w) => bNo(w.b) + " #" + (w.qi + 1)).join(", ") : ""}">${esc(f.name)}${other.length && q.t === "sw" ? ` <i>· ${other.length + 1}-way</i>` : ""}</button>`; }).join("")}</div>`).join("")}`;
    return `<div class="swp-ed"><div class="swp-ed-top"><span class="mono">${bNo(b)} ${esc(b.name)} · plate ${+pi + 1} · ${k === "h" ? "hole" : k === "s" ? "socket" : "window"} ${+qi + 1}</span><button class="mini" data-act="close">Done</button></div>
      <div class="swp-sub mono">What sits here</div><div class="chips">${types}</div>${pick}</div>`;
  }
  // ── adding lights: what, how many, how many watts, what colour, and where (click the plan) ──
  function wireOptions() {
    const o = [`<option value="">Not yet</option>`];
    st.boards.forEach((b) => b.plates.forEach((p, pi) => p.slots.forEach((q, qi) => { if (q.t === "sw") o.push(`<option value="slot:${b.id}.${pi}.${qi}"${af.wire === `slot:${b.id}.${pi}.${qi}` ? " selected" : ""}>${bNo(b)} #${qi + 1} · ${esc((q.c.map((id) => fixById(id)?.name).join(" + ") || "empty").slice(0, 48))}</option>`); })));
    st.boards.forEach((b) => o.push(`<option value="new:${b.id}"${af.wire === "new:" + b.id ? " selected" : ""}>A blank hole on ${bNo(b)} · ${esc(b.name)}</option>`));
    return o.join("");
  }
  function addHTML() {
    if (!addOpen) return "";
    const line = isLine(af.kind), two = line || af.n > 1;
    return `<div class="swp-ed swp-addp"><div class="swp-ed-top"><span class="mono">Add lights</span><button class="mini" data-act="addclose">Close</button></div>
      <div class="swp-sub mono">Room</div><div class="chips">${ZONES.map(([z, n]) => `<button class="chip${af.zone === z ? " sel" : ""}" data-act="afz" data-v="${z}">${n}</button>`).join("")}</div>
      <div class="swp-sub mono">What</div><div class="chips">${Object.entries(KINDS).map(([k, n]) => `<button class="chip${af.kind === k ? " sel" : ""}" data-act="afk" data-v="${k}">${n}</button>`).join("")}</div>
      <div class="swp-form"><label><span class="mono">Name</span><input data-af="name" value="${esc(af.name)}" placeholder="e.g. Tunnel focus lights"></label>
        ${line || af.kind === "load" ? "" : `<label><span class="mono">How many</span><input type="number" min="1" max="40" data-af="n" value="${af.n}"></label>`}</div>
      ${af.kind === "load" ? "" : `<div class="swp-sub mono">${line ? "Watts per metre" : "Watts each"}</div><div class="chips">${(line ? W_PM : W_PT).map((v) => `<button class="chip${+af.w === v ? " sel" : ""}" data-act="afw" data-v="${v}">${v} W</button>`).join("")}<input type="number" min="0" step="0.1" data-af="w" value="${af.w}" class="num"></div>
      <div class="swp-sub mono">Colour</div><div class="chips">${KS.map((v) => `<button class="chip${+af.K === v ? " sel" : ""}" data-act="afK" data-v="${v}">${v} K</button>`).join("")}<input type="number" min="1800" max="6500" step="100" data-af="K" value="${af.K}" class="num"></div>`}
      <div class="swp-sub mono">Switch it from</div><select data-af="wire" class="wide">${wireOptions()}</select>
      <div class="swp-ed-foot"><button class="btn${pl ? " steel" : ""}" data-act="place">${pl ? "Placing — click the plan" : "Place on the plan"}</button></div>
      <p class="swp-hint">${pl ? (two ? (pl.a ? "Now click where the last one goes (or where the run ends)." : `Click where the first one goes${line ? " (the run's start)" : ""}.`) : "Click where it goes.") + " Esc to stop." : two ? (line ? "You'll click the start and the end of the run; its length sets the watts." : `You'll click the first and the last — the ${af.n} are spread evenly between.`) : "You'll click once, where it goes."}</p>
      ${note ? `<p class="swp-hint ok">${esc(note)}</p>` : ""}</div>`;
  }
  // ── the lights table ──
  function lightsHTML() {
    const dl = `<datalist id="swp-wpt">${W_PT.map((v) => `<option value="${v}">`).join("")}</datalist><datalist id="swp-wpm">${W_PM.map((v) => `<option value="${v}">`).join("")}</datalist><datalist id="swp-k">${KS.map((v) => `<option value="${v}">`).join("")}</datalist>`;
    return dl + ZONES.map(([z, zn]) => {
      const rows = fixAll().filter((f) => f.zone === z), tot = rows.filter((f) => f.kind !== "load").reduce((a, f) => a + wattOf(f), 0);
      return `<div class="swp-lz"><div class="swp-lzh"><span class="mono swp-zl">${zn}</span><span class="mono">${fmtW(tot)} of light</span></div><table class="swp-tbl"><thead><tr><th>Light</th><th>Qty</th><th>Watts</th><th>Total</th><th>Switched from</th><th>Dims</th><th>Glow-up</th><th>Automation</th><th>Colour</th></tr></thead><tbody>
        ${rows.map((f) => { const L = st.light[f.id], w = where(f.id).filter((x) => x.q.t === "sw"), ld = f.kind === "load";
          return `<tr><td>${f.custom ? `<input class="nm" data-cf="name" data-l="${f.id}" value="${esc(f.name)}">` : `<b>${esc(f.name)}</b>`}<span class="mono dim">${KINDS[f.kind] || ""}${f.custom ? ` · <a href="#" data-act="movelight" data-l="${f.id}">Move</a> · <a href="#" data-act="dellight" data-l="${f.id}">Remove</a>` : ""}</span></td>
          <td>${perM(f) ? `<input type="number" class="num" step="0.1" min="0" data-lp="len" data-l="${f.id}" value="${L.len}"><span class="mono dim">metres</span>` : f.custom && !ld ? `<input type="number" class="num" min="1" max="40" data-cf="n" data-l="${f.id}" value="${f.n}">` : f.n}</td>
          <td><input type="number" class="num" step="0.1" min="0" list="${perM(f) ? "swp-wpm" : "swp-wpt"}" data-lp="w" data-l="${f.id}" value="${L.w}"><span class="mono dim">${perM(f) ? "W / m" : "W each"}</span></td>
          <td>${wattOf(f) ? fmtW(wattOf(f)) : "—"}</td>
          <td>${w.length ? w.map((x) => `<a href="#" data-goto="${x.b.id}" class="swp-at">${bNo(x.b)} #${x.qi + 1} · ${esc(x.b.name)}</a>`).join("") : `<span class="swp-none">No switch yet</span>`}${w.length > 1 ? `<span class="mono dim">${w.length}-way</span>` : ""}</td>
          <td>${ld ? "—" : `<label class="tog"><input type="checkbox" data-lp="dim" data-l="${f.id}"${L.dim ? " checked" : ""}><span></span></label>`}</td>
          <td>${ld ? "—" : `<select data-lp="fade" data-l="${f.id}">${FADES.map((v) => `<option value="${v}"${+L.fade === v ? " selected" : ""}>${v ? v + " s" : "Instant"}</option>`).join("")}</select>`}</td>
          <td><select data-lp="auto" data-l="${f.id}">${Object.entries(AUTO).map(([k, v]) => `<option value="${k}"${L.auto === k ? " selected" : ""}>${v}</option>`).join("")}</select></td>
          <td>${ld ? "—" : `<input type="number" class="num" step="100" min="1800" max="6500" list="swp-k" data-lp="K" data-l="${f.id}" value="${L.K}"><span class="mono dim">kelvin</span>`}</td></tr>`; }).join("")}</tbody></table></div>`;
    }).join("");
  }
  // ── totals: what to buy, the load, and what needs fixing ──
  function totals() {
    const c = {}, codes = {};
    st.boards.forEach((b) => b.plates.forEach((p) => { codes[p.code] = (codes[p.code] || 0) + 1; p.slots.forEach((q) => (c[q.t] = (c[q.t] || 0) + 1)); }));
    const unsw = fixAll().filter((f) => f.kind !== "plug" && !where(f.id).some((w) => w.q.t === "sw")).length;
    const overDims = []; st.boards.forEach((b) => b.plates.forEach((p) => p.slots.forEach((q) => { if (q.t === "dim" && dimLoad(q) > DIM_MAX) overDims.push(q); })));
    const lightW = fixAll().filter((f) => f.kind !== "load").reduce((a, f) => a + wattOf(f), 0), appW = fixAll().filter((f) => f.kind === "load").reduce((a, f) => a + wattOf(f), 0);
    const part = (k, n) => (c[k] ? `<span><b>${c[k]}</b> ${n}</span>` : "");
    return `${part("sw", "switches")}${part("dim", "dimmers")}${part("fan", "fan regulators")}${part("scene", "scene keys")}${part("s6", "6A sockets")}${part("s16", "16A sockets")}${part("s13", "13A sockets")}${part("usbc", "USB-C")}${part("usbac", "USB A+C")}${part("eth", "Ethernet")}${part("tv", "TV points")}
      <span><b>${Object.values(codes).reduce((a, b) => a + b, 0)}</b> plates · ${Object.entries(codes).sort().map(([k, n]) => `${k}×${n}`).join(" ")}</span><span><b>${fmtW(lightW)}</b> of light${appW ? ` · <b>${fmtW(appW)}</b> appliances` : ""}</span>
      ${unsw ? `<span class="warn"><b>${unsw}</b> without a switch</span>` : ""}${overDims.length ? `<span class="warn"><b>${overDims.length}</b> dimmer${overDims.length > 1 ? "s" : ""} over ${DIM_MAX} W</span>` : ""}`;
  }
  function render() {
    const byZone = ZONES.map(([z, zn]) => { const bs = st.boards.filter((b) => b.zone === z); return bs.length ? `<div class="swp-zone"><div class="eyebrow">${zn}</div>${bs.map(boardHTML).join("")}</div>` : ""; }).join("");
    root.innerHTML = `<div class="swp-bar"><div class="swp-modes"><button class="btn${mode === "plan" ? "" : " steel"}" data-mode="plan">Plan the switches</button><button class="btn${mode === "try" ? "" : " steel"}" data-mode="try">Try it</button>${mode === "plan" ? `<button class="btn steel" data-act="addopen">+ Add lights</button>` : ""}</div>
        <div class="swp-acts"><button class="btn steel" data-act="copy">Copy for Claude</button><button class="btn steel" data-act="print">Print for the electrician</button><button class="btn steel" data-act="dl">Download</button><button class="btn steel" data-act="ul">Load</button><button class="btn steel" data-act="reset">Start again</button><input type="file" accept=".json,application/json,.txt" id="swp-file" hidden></div></div>
      <div class="swp-totals mono">${totals()}</div>
      <p class="swp-help">${mode === "plan" ? "Click any hole, socket or window on a plate to choose what sits there and which lights it works — a light on two switches becomes two-way. Change a plate with its list: every Norisys TG9 layout is there, with its back-box size. Add lights with + Add lights and click the plan to place them. Watts and colours are in the table below; the starting watts are estimates. Everything saves in this browser." : "Press the switches. Each light glows up at its own speed; dimmers slide. Scene keys set the room in one press."}</p>
      <div class="swp-grid"><div class="swp-planbox"><div class="swp-plan${pl ? " placing" : ""}">${planSVG()}</div>
        ${mode === "try" ? `<div class="swp-scenes"><span class="mono">Scenes</span>${st.scenes.map((s) => `<button class="mini" data-act="runscene" data-s="${s.id}">${esc(s.name)}</button>`).join("")}<button class="mini" data-act="savescene">+ Save the room as a scene</button></div>` : addHTML() + editorHTML()}</div>
        <div class="swp-boards">${byZone}<button class="btn steel swp-addb" data-act="addboard">+ Add a board</button></div></div>
      <div class="group-label"><span class="eyebrow">Every light · how it behaves</span></div><div class="swp-lights">${lightsHTML()}</div>`;
  }
  // ── text out: for Claude, and the electrician's schedule ──
  const slotText = (q) => `${SLOT[q.t]?.n || q.t}${q.t === "scene" ? " — " + (st.scenes.find((s) => s.id === q.scene)?.name || "") : q.c.length ? " — " + q.c.map((id) => fixById(id)?.name || id).join(" + ") : ""}`;
  function asText() {
    const lines = ["SWITCH PLAN — A Study in Teak (paste this to Claude)", ""];
    st.boards.forEach((b) => { lines.push(`[${bNo(b)} ${b.name}]`); b.plates.forEach((p, pi) => { const c = cat(p.code); lines.push(`  plate ${pi + 1}: Norisys ${c.code}, ${c.m}M (${descOf(c)}), box ${BOX[c.m]}`); p.slots.forEach((q, qi) => lines.push(`    ${qi + 1}. ${slotText(q)}`)); }); });
    lines.push("", "LIGHTS");
    fixAll().forEach((f) => { const L = st.light[f.id] || {}; lines.push(`  ${f.name} (${zoneName(f.zone)}, ${KINDS[f.kind]}): ${perM(f) ? `${L.w} W/m × ${L.len} m` : `${f.n} × ${L.w} W`} = ${fmtW(wattOf(f))}${f.kind === "load" ? "" : `, ${L.K} K, ${L.dim ? "dims" : "no dim"}, glow-up ${L.fade ? L.fade + " s" : "instant"}`}, ${AUTO[L.auto] || "Manual"}${f.custom ? `, NEW — at ${JSON.stringify(geoOf(f))} (mm: x from the left wall, s from the study wall)` : ""}`); });
    lines.push("", "SCENES"); st.scenes.forEach((s) => lines.push(`  ${s.name}: ${Object.entries(s.levels).map(([k, v]) => (fixById(k)?.name || k) + " " + v + "%").join(", ") || "everything off"}`));
    lines.push("", "DATA " + JSON.stringify(st));
    return lines.join("\n");
  }
  function printSheet() {
    const w = window.open("", "_blank"); if (!w) return alert("Allow pop-ups to print the schedule.");
    const rows = st.boards.map((b) => `<h2>${bNo(b)} · ${esc(b.name)}</h2><table><tr><th>Plate</th><th>#</th><th>Module</th><th>Controls</th><th>Notes</th></tr>${b.plates.map((p, pi) => { const c = cat(p.code);
      return p.slots.map((q, qi) => {
        const ls = q.c.map(fixById).filter(Boolean), ways = ls.map((f) => where(f.id).filter((x) => x.q.t === "sw").length).filter((n) => n > 1);
        const note = [q.t === "dim" ? `LED dimmer ${DIM_MAX} W — load ${fmtW(dimLoad(q))}${dimLoad(q) > DIM_MAX ? " (OVER — split it)" : ""}; soft-start ${Math.max(0, ...ls.map((f) => +(st.light[f.id]?.fade || 0)))} s` : "", ways.length && q.t === "sw" ? "two-way" : "",
          q.t === "sw" && ls.length ? fmtW(ls.filter((f) => f.kind !== "load").reduce((a, f) => a + wattOf(f), 0)) : "",
          ...ls.filter((f) => st.light[f.id]?.auto && st.light[f.id].auto !== "none").map((f) => f.name + ": " + AUTO[st.light[f.id].auto])].filter(Boolean).join("; ");
        return `<tr><td>${qi ? "" : `${pi + 1} · Norisys ${c.code} (${c.m}M · ${descOf(c)})<br>box ${BOX[c.m]} · aluminium TA${c.code.slice(1)}`}</td><td>${qi + 1}</td><td>${SLOT[q.t]?.n || q.t}</td><td>${q.t === "scene" ? "Scene: " + esc(st.scenes.find((s) => s.id === q.scene)?.name || "") : esc(ls.map((f) => f.name).join(" + ") || "—")}</td><td>${esc(note)}</td></tr>`; }).join(""); }).join("")}</table>`).join("");
    const lt = `<h2>Every light</h2><table><tr><th>Light</th><th>Room</th><th>Qty</th><th>Watts</th><th>Total</th><th>Colour</th><th>Dims</th><th>Glow-up</th><th>Automation</th><th>Switched from</th></tr>${fixAll().map((f) => { const L = st.light[f.id] || {}, ld = f.kind === "load";
      return `<tr><td>${esc(f.name)}</td><td>${zoneName(f.zone)}</td><td>${perM(f) ? L.len + " m" : f.n}</td><td>${perM(f) ? L.w + " W/m" : L.w + " W"}</td><td>${wattOf(f) ? fmtW(wattOf(f)) : "—"}</td><td>${ld ? "—" : L.K + " K"}</td><td>${ld ? "—" : L.dim ? "Yes" : "No"}</td><td>${ld ? "—" : L.fade ? L.fade + " s" : "Instant"}</td><td>${AUTO[L.auto] || "Manual"}</td><td>${esc(where(f.id).filter((x) => x.q.t === "sw").map((x) => bNo(x.b) + " #" + (x.qi + 1)).join(", ") || "—")}</td></tr>`; }).join("")}</table>`;
    const codes = {}; st.boards.forEach((b) => b.plates.forEach((p) => (codes[p.code] = (codes[p.code] || 0) + 1)));
    const buy = `<h2>Plates and back boxes</h2><table><tr><th>Norisys plate</th><th>Layout</th><th>Back box</th><th>Qty</th></tr>${Object.entries(codes).sort().map(([k, n]) => { const c = cat(k); return `<tr><td>${k} (aluminium TA${k.slice(1)})</td><td>${c.m}M · ${descOf(c)}</td><td>${BOX[c.m]}</td><td>${n}</td></tr>`; }).join("")}</table>`;
    w.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>Switch schedule — A Study in Teak</title><style>body{font:12px/1.35 Arial,sans-serif;margin:24px;color:#111}h1{font-size:20px;margin:0 0 4px}h2{font-size:14px;margin:18px 0 6px;text-transform:uppercase}
      table{border-collapse:collapse;width:100%}th,td{border:1px solid #999;padding:4px 6px;text-align:left;vertical-align:top}th{background:#eee}p{color:#444}</style></head><body><h1>Switch schedule — A Study in Teak</h1>
      <p>Norisys TG9 series: toggle switches and modules on cover plates (a hole column 1M, a window 1M, a socket 2M). The TG9 LED dimmer is rated ${DIM_MAX} W (2-wire); glow-up means its soft-start, and every dimmed light needs a driver that dims on it. Watts are the owner's figures where set, estimates otherwise.</p>${buy}${rows}${lt}</body></html>`);
    w.document.close(); setTimeout(() => w.print(), 300);
  }
  // ── events ──
  function slotAt(key) { const [bid, pi, qi] = key.split("."); const b = st.boards.find((x) => x.id === bid); const p = b?.plates[+pi]; return { b, p, q: p?.slots[+qi], pi: +pi, qi: +qi }; }
  function conform(p, code) {          // a new plate: keep what fits, in order, by kind
    const old = p.slots.slice(); p.code = code;
    p.slots = posOf(cat(code).lay).map(({ k }) => { const i = old.findIndex((q) => (SLOT[q.t] || SLOT.spare).k === k); return i < 0 ? { t: BLANK[k], c: [] } : old.splice(i, 1)[0]; });
  }
  function press(key) {
    const { q } = slotAt(key);
    if (q.t === "sw" && q.c.length) { const turnOn = !q.c.every((id) => live[id]); q.c.forEach((id) => (live[id] = turnOn)); }
    else if (q.t === "scene") runScene(q.scene);
  }
  function runScene(id) {
    const sc = st.scenes.find((s) => s.id === id); if (!sc) return;
    live = {}; Object.entries(sc.levels).forEach(([lid, v]) => { live[lid] = v > 0; where(lid).filter((w) => w.q.t === "dim").forEach((w) => (level[`${w.b.id}.${w.pi}.${w.qi}`] = v)); });
  }
  function refreshPlan() {   // only the plan and the slot states, so the glow-up animates instead of jumping
    root.querySelectorAll(".swp-f").forEach((g) => { const id = g.dataset.l, b = brightness(id), fd = st.light[id]?.fade ?? 0;
      g.style.setProperty("--fd", (live[id] ? fd : Math.min(0.6, fd)) + "s"); g.style.setProperty("--b", b); g.classList.toggle("on", b > 0); });
    root.querySelectorAll(".swp-slot").forEach((el) => { const { q } = slotAt(el.dataset.slot); el.classList.toggle("on", !!(q && q.c.length && q.c.every((id) => live[id]))); });
  }
  const id36 = () => "x" + Math.random().toString(36).slice(2, 7);
  function wireTo(id, wire) {
    if (!wire) return "";
    if (wire.startsWith("slot:")) { const { q, b, qi } = slotAt(wire.slice(5)); if (q && !q.c.includes(id)) q.c.push(id); return ` on ${bNo(b)} #${qi + 1}`; }
    const b = st.boards.find((x) => x.id === wire.slice(4));
    for (const p of b.plates) { const i = p.slots.findIndex((q) => q.t === "spare"); if (i >= 0) { p.slots[i] = { t: "sw", c: [id] }; return ` on ${bNo(b)} #${i + 1}`; } }
    return ` — ${bNo(b)} has no blank hole left, so pick its switch yourself`;
  }
  function planPoint(e) {
    const svg = root.querySelector(".swp-svg"), p = svg.createSVGPoint(); p.x = e.clientX; p.y = e.clientY;
    const m = p.matrixTransform(svg.getScreenCTM().inverse()); return [Math.round(m.x / 10) * 10, Math.round(m.y / 10) * 10];
  }
  function placeClick(e) {
    const pt = planPoint(e);
    if (pl.board) { const b = st.boards.find((x) => x.id === pl.board); if (b) b.at = pt; pl = null; save(); render(); return; }
    const f0 = pl.id ? fixById(pl.id) : null, kind = f0 ? f0.kind : af.kind, n = f0 ? f0.n : af.n;
    const two = isLine(kind) || n > 1;
    if (two && !pl.a) { pl.a = pt; root.querySelector(".swp-plan").innerHTML = planSVG(); const h = root.querySelector(".swp-hint"); if (h) h.textContent = "Now click where the last one goes (or where the run ends). Esc to stop."; return; }
    const a = pl.a || pt, b = two ? pt : null;
    if (f0) { f0.a = a; f0.b = b; if (perM(f0)) st.light[f0.id].len = +(Math.hypot(b[0] - a[0], b[1] - a[1]) / 1000).toFixed(2); note = `Moved: ${f0.name}`; }
    else {
      const id = id36(), f = { id, zone: af.zone, name: af.name.trim() || `${KINDS[af.kind]}${isLine(af.kind) ? "" : "s"} · ${zoneName(af.zone).toLowerCase()}`, kind: af.kind, n: isLine(af.kind) || af.kind === "load" ? 1 : Math.max(1, +af.n || 1), K: af.kind === "load" ? 0 : +af.K, custom: true, a, b };
      st.custom.push(f); st.light[id] = { ...lightDefault(f), w: +af.w || 0, K: +af.K || 3000 };
      note = `Added: ${f.name}${wireTo(id, af.wire)}.`; af.name = "";
    }
    pl = null; save(); render();
  }
  function onClick(e) {
    if (pl && e.target.closest(".swp-svg")) { placeClick(e); return; }
    const t = e.target.closest("[data-mode],[data-slot],[data-act],[data-goto],[data-board]"); if (!t) return;
    if (t.dataset.mode) { mode = t.dataset.mode; ed = null; pl = null; render(); return; }
    if (t.dataset.goto) { e.preventDefault(); root.querySelector("#swp-b-" + t.dataset.goto)?.scrollIntoView({ behavior: "smooth", block: "center" }); return; }
    if (t.dataset.board && !t.dataset.act) { root.querySelector("#swp-b-" + t.dataset.board)?.scrollIntoView({ behavior: "smooth", block: "center" }); return; }
    if (t.dataset.slot) {
      if (mode === "try") { press(t.dataset.slot); refreshPlan(); return; }
      ed = ed === t.dataset.slot ? null : t.dataset.slot; addOpen = false; render(); root.querySelector(".swp-ed")?.scrollIntoView({ behavior: "smooth", block: "nearest" }); return;
    }
    const a = t.dataset.act, B = (id) => st.boards.find((x) => x.id === id), cur = ed ? slotAt(ed) : null;
    if (t.tagName === "A") e.preventDefault();
    if (a === "close") ed = null;
    else if (a === "stype" && cur?.q) { cur.q.t = t.dataset.t; if (!FEEDS(cur.q.t)) cur.q.c = []; if (cur.q.t === "scene" && !cur.q.scene) cur.q.scene = st.scenes[0]?.id; }
    else if (a === "slight" && cur?.q) { const l = t.dataset.l, i = cur.q.c.indexOf(l); i < 0 ? cur.q.c.push(l) : cur.q.c.splice(i, 1); if (cur.q.t === "spare" && cur.q.c.length) cur.q.t = "sw"; }
    else if (a === "sscene" && cur?.q) cur.q.scene = t.dataset.s;
    else if (a === "delplate") { if (confirm("Remove this plate?")) B(t.dataset.b).plates.splice(+t.dataset.p, 1); ed = null; }
    else if (a === "addplate") { const p = { code: "9212", slots: [] }; conform(p, "9212"); B(t.dataset.b).plates.push(p); }
    else if (a === "placeboard") { pl = { board: t.dataset.b }; render(); root.querySelector(".swp-plan")?.scrollIntoView({ behavior: "smooth", block: "center" }); return; }
    else if (a === "rename") { const b = B(t.dataset.b), n = prompt("Board name", b.name); if (n) b.name = n; }
    else if (a === "delboard") { if (confirm("Remove this board?")) st.boards = st.boards.filter((x) => x.id !== t.dataset.b); ed = null; }
    else if (a === "addboard") { const n = prompt("Where is the new board? e.g. Bathroom · by the vanity"); if (!n) return; const z = (prompt("Which room: study, bedroom, dressing or bathroom?", "bedroom") || "bedroom").toLowerCase().trim();
      const p = { code: "9818", slots: [] }; conform(p, "9818"); const b = { id: id36(), name: n, zone: ZONES.some((q) => q[0] === z) ? z : "bedroom", at: [2250, 3000], plates: [p] }; st.boards.push(b); pl = { board: b.id }; }
    else if (a === "addopen") { addOpen = !addOpen; ed = null; pl = null; note = ""; }
    else if (a === "addclose") { addOpen = false; pl = null; note = ""; }
    else if (a === "afz") af.zone = t.dataset.v;
    else if (a === "afk") { af.kind = t.dataset.v; af.w = WDEF[af.kind] ?? 8; if (isLine(af.kind)) af.w = 9.6; }
    else if (a === "afw") af.w = +t.dataset.v;
    else if (a === "afK") af.K = +t.dataset.v;
    else if (a === "place") { pl = pl ? null : { a: null }; note = ""; render(); root.querySelector(".swp-plan")?.scrollIntoView({ behavior: "smooth", block: "center" }); return; }
    else if (a === "movelight") { pl = { id: t.dataset.l, a: null }; addOpen = true; note = `Moving ${fixById(t.dataset.l)?.name} — click the plan.`; render(); root.querySelector(".swp-plan")?.scrollIntoView({ behavior: "smooth", block: "center" }); return; }
    else if (a === "dellight") { const id = t.dataset.l; if (!confirm("Remove this light?")) return; st.custom = st.custom.filter((f) => f.id !== id); delete st.light[id]; st.boards.forEach((b) => b.plates.forEach((p) => p.slots.forEach((q) => (q.c = q.c.filter((x) => x !== id))))); }
    else if (a === "runscene") { runScene(t.dataset.s); refreshPlan(); root.querySelectorAll("[data-dim]").forEach((r) => (r.value = level[r.dataset.dim] ?? 100)); return; }
    else if (a === "savescene") { const n = prompt("Name this scene"); if (!n) return; const lv = {}; Object.keys(live).filter((k) => live[k]).forEach((k) => (lv[k] = Math.round(brightness(k) * 100))); st.scenes.push({ id: id36(), name: n, levels: lv }); }
    else if (a === "copy") { const txt = asText(); (navigator.clipboard?.writeText(txt) || Promise.reject()).then(() => flash(t, "Copied — paste it to Claude"), () => { prompt("Copy this and paste it to Claude:", txt); }); return; }
    else if (a === "print") { printSheet(); return; }
    else if (a === "dl") { const u = URL.createObjectURL(new Blob([JSON.stringify(st, null, 1)], { type: "application/json" })); const l = document.createElement("a"); l.href = u; l.download = "switch-plan.json"; l.click(); setTimeout(() => URL.revokeObjectURL(u), 2000); return; }
    else if (a === "ul") { root.querySelector("#swp-file").click(); return; }
    else if (a === "reset") { if (!confirm("Start again from the suggested plan? Your changes in this browser will be replaced.")) return; st = defaults(); live = {}; level = {}; ed = null; pl = null; }
    else return;
    save(); render();
  }
  function flash(el, txt) { const o = el.textContent; el.textContent = txt; setTimeout(() => (el.textContent = o), 1800); }
  function onChange(e) {
    const t = e.target;
    if (t.dataset.lp) { const L = st.light[t.dataset.l]; L[t.dataset.lp] = t.type === "checkbox" ? t.checked : t.dataset.lp === "auto" ? t.value : +t.value; save(); render(); return; }
    if (t.dataset.cf) { const f = fixById(t.dataset.l); if (!f) return; f[t.dataset.cf] = t.dataset.cf === "n" ? Math.max(1, +t.value || 1) : t.value; save(); render(); return; }
    if (t.dataset.act === "pcode") { const p = st.boards.find((b) => b.id === t.dataset.b).plates[+t.dataset.p]; conform(p, t.value); ed = null; save(); render(); return; }
    if (t.dataset.af === "wire") { af.wire = t.value; return; }
    if (t.id === "swp-file" && t.files[0]) { t.files[0].text().then((s) => { try { const j = JSON.parse(s.includes("DATA {") ? s.slice(s.indexOf("DATA {") + 5) : s); if (j.v === VER) { st = j; save(); render(); } else alert("That plan is from an older version."); } catch (err) { alert("That file is not a switch plan."); } }); }
  }
  function onInput(e) {
    const t = e.target;
    if (t.dataset.dim) { level[t.dataset.dim] = +t.value; refreshPlan(); return; }
    if (t.dataset.af) { af[t.dataset.af] = t.type === "number" ? +t.value : t.value; if (t.dataset.af === "n" && (+t.value > 1) !== (pl ? !!pl : false)) { const h = root.querySelector(".swp-hint"); if (h && !pl) h.textContent = +t.value > 1 ? `You'll click the first and the last — the ${t.value} are spread evenly between.` : "You'll click once, where it goes."; } }
  }
  const CSS = `
.swp{margin-top:24px}
.swp-bar{display:flex;flex-wrap:wrap;gap:12px;justify-content:space-between;align-items:center}
.swp-modes,.swp-acts{display:flex;flex-wrap:wrap;gap:8px}
.swp-acts .btn{height:34px;font-size:12px;padding:0 14px}
.swp-totals{display:flex;flex-wrap:wrap;gap:6px 18px;margin:18px 0 6px;font-size:11px;color:var(--dim)}
.swp-totals b{color:var(--white);font-weight:400}.swp-totals .warn,.swp-totals .warn b{color:var(--ember)}
.swp-help{font:400 15px/1.4 var(--grotesk);color:var(--dim);max-width:900px;margin:6px 0 18px}
.swp-grid{display:grid;grid-template-columns:minmax(0,5fr) minmax(0,6fr);gap:24px;align-items:start}
@media (max-width:980px){.swp-grid{grid-template-columns:1fr}}
.swp-planbox{position:sticky;top:84px;display:flex;flex-direction:column;gap:12px;max-height:calc(100vh - 100px);overflow:auto}
@media (max-width:980px){.swp-planbox{position:static;max-height:none}}
.swp-plan{background:#121313;border-radius:10px;padding:10px;flex:0 0 auto}.swp-plan.placing{outline:2px solid var(--ember);cursor:crosshair}.swp-plan.placing svg{cursor:crosshair}
.swp-svg{width:100%;height:auto;display:block;max-height:64vh}
.swp-wall{fill:#1b1d1d;stroke:#5a5a5a;stroke-width:40}
.swp-part{stroke:#6b6b6b;stroke-width:90;stroke-dasharray:140 70}
.swp-furn{fill:none;stroke:#3b3d3d;stroke-width:22}
.swp-lbl{font:400 210px var(--mono);fill:#4c4c4c;text-anchor:middle}
.swp-f .core{fill:#3a3a3a;stroke:#3a3a3a;stroke-width:46;transition:fill var(--fd) ease-out,stroke var(--fd) ease-out}
.swp-f.cust .core{stroke:#8a6a4a}
.swp-f.k-load .core{fill:none;stroke:#555;stroke-width:24}
.swp-f .glow{fill:#ffb766;stroke:#ffb766;stroke-width:300;stroke-linecap:round;opacity:0;transition:opacity var(--fd) ease-out}.swp-f circle.glow{stroke:none}
.swp-f.on .glow{opacity:calc(var(--b) * .85)}
.swp-f.on .core{fill:#ffd9a3;stroke:#ffd9a3}
.swp-f.k-load.on .core{fill:none;stroke:var(--ember)}
.swp-ghost{fill:none;stroke:var(--ember);stroke-width:30}
.swp-bd rect{fill:var(--ember);opacity:.9;cursor:pointer}.swp-bd text{font:400 170px var(--mono);fill:var(--ember);text-anchor:middle}
.swp-bn{display:inline-flex;align-items:center;justify-content:center;min-width:32px;height:22px;border-radius:999px;background:var(--ember);color:#111;font:400 11px var(--mono)}
.swp-boards{display:flex;flex-direction:column;gap:22px}
.swp-zone{display:flex;flex-direction:column;gap:12px}.swp-zone>.eyebrow{color:var(--dim)}
.swp-board{background:var(--charcoal);border-radius:10px;padding:18px 18px 14px}
.swp-bt{display:flex;flex-wrap:wrap;align-items:center;gap:6px 12px;margin-bottom:12px}
.swp-bt h4{margin:0;font:400 19px/1 var(--cond);text-transform:uppercase;letter-spacing:-.02em}
.swp-tools{margin-left:auto;display:flex;flex-wrap:wrap;gap:6px}
.mini{height:28px;padding:0 11px;border:1px solid var(--steel);border-radius:999px;background:none;color:var(--white);font:400 11px/1 var(--mono);text-transform:uppercase;letter-spacing:-.02em;cursor:pointer}
.mini:hover{border-color:var(--white)}
.swp-plate-row{display:flex;flex-direction:column;gap:6px;margin-bottom:12px}
.swp-plate{display:flex;align-items:stretch;gap:3px;padding:9px;border-radius:7px;background:linear-gradient(#5a4632,#3d2f22);box-shadow:inset 0 1px 0 rgba(255,255,255,.12),0 2px 8px rgba(0,0,0,.5);overflow-x:auto;align-self:flex-start;max-width:100%}
.swp-col{display:flex;flex-direction:column;gap:3px}
.swp-slot{position:relative;flex:1 1 auto;width:64px;min-height:124px;display:flex;flex-direction:column;align-items:center;gap:8px;padding:12px 4px 8px;border-radius:5px;background:rgba(0,0,0,.18);border:1px solid transparent;color:#f3e6d4;cursor:pointer}
.swp-slot.half{min-height:60px;padding:7px 4px 5px;gap:4px}.swp-slot.half .lever{height:18px;width:8px}.swp-slot.half .knob{width:18px;height:18px}
.swp-slot.k-s{width:100px}
.swp-slot:hover{border-color:rgba(255,255,255,.35)}.swp-slot.sel{border-color:var(--ember);background:rgba(204,100,55,.18)}.swp-slot.over{border-color:#e0452c}
.swp-slot .cap{font:400 9.5px/1.15 var(--grotesk);text-align:center;color:#e9dccb;word-break:break-word}.swp-slot .cap b{display:block;font:400 9px var(--mono);color:#b9a68c}.swp-slot.over .cap b{color:#ff8a70}
.swp-slot.half .cap{font-size:8.5px;max-height:28px;overflow:hidden}
.swp-slot.t-spare .cap,.swp-slot.t-spare .lever,.swp-slot.t-blankw .cap{opacity:.45}
.lever{width:10px;height:30px;border-radius:5px;background:linear-gradient(90deg,#cfd2d4,#7d8184 60%,#b4b8bb);transform:rotate(-14deg);transform-origin:50% 90%;transition:transform .25s;box-shadow:0 2px 3px rgba(0,0,0,.6)}
.swp-slot.on .lever{transform:rotate(14deg)}
.knob{width:26px;height:26px;border-radius:50%;background:radial-gradient(circle at 40% 35%,#d6d9db,#6d7174);box-shadow:0 2px 3px rgba(0,0,0,.6)}
.btn-s{width:20px;height:20px;border-radius:50%;border:2px solid #cfd2d4}.swp-slot.t-scene.on .btn-s{background:var(--ember)}
.sock{display:flex;gap:7px;padding:9px 10px;border-radius:6px;background:#2a221a}.sock i{width:7px;height:9px;border-radius:2px;background:#0d0b09}.sock i:nth-child(2){height:12px}
.win{display:inline-flex;align-items:center;justify-content:center;min-width:34px;height:22px;border-radius:5px;background:#1c1712;font:400 10px var(--mono);color:#cbb79d}
.swp-slot input[type=range]{width:54px;accent-color:var(--ember)}
.swp-slot.on{background:rgba(255,190,110,.12)}
.swp-pmeta{display:flex;flex-wrap:wrap;gap:6px;align-items:center}.swp-pmeta .mono{font-size:10px;color:var(--dim);margin-right:4px}
.swp-pmeta select,.swp-lights select,.swp-addp select,.swp-addp input,.swp-lights input{background:#1b1c1c;color:var(--white);border:1px solid var(--steel);border-radius:999px;height:28px;padding:0 10px;font:400 11px var(--mono)}
.swp-pmeta select{max-width:100%}
.swp-lights input.num,.swp-addp input.num{width:74px}.swp-lights input.nm{width:100%;min-width:180px;font:400 13px var(--grotesk);border-radius:6px}
.swp-addp select.wide{width:100%;border-radius:6px}
.swp-ed{background:var(--charcoal);border-radius:10px;padding:16px;border:1px solid var(--ember)}
.swp-ed-top{display:flex;justify-content:space-between;align-items:center;margin-bottom:6px}.swp-ed-top .mono{font-size:11px}
.swp-sub{font-size:10px;color:var(--dim);margin:12px 0 6px}.swp-zl{font-size:10px;color:#8d8d8d;margin:10px 0 5px}
.chips{display:flex;flex-wrap:wrap;gap:6px;align-items:center}
.chip{padding:6px 10px;border-radius:999px;border:1px solid var(--steel);background:none;color:var(--dim);font:400 12px/1.1 var(--grotesk);cursor:pointer;text-align:left}
.chip.sel{border-color:var(--white);color:var(--white);background:rgba(255,255,255,.07)}.chip i{font-style:normal;color:var(--ember)}
.swp-form{display:flex;flex-wrap:wrap;gap:10px;margin-top:12px}.swp-form label{display:flex;flex-direction:column;gap:5px}.swp-form .mono{font-size:10px;color:var(--dim)}
.swp-form input{min-width:200px;font-family:var(--grotesk)!important;font-size:13px!important;border-radius:6px!important}
.swp-ed-foot{display:flex;gap:6px;margin-top:14px}
.swp-hint{font:400 13px/1.35 var(--grotesk);color:var(--dim);margin:10px 0 0}.swp-hint.ok{color:#e9c08f}
.swp-scenes{display:flex;flex-wrap:wrap;gap:6px;align-items:center}.swp-scenes .mono{font-size:10px;color:var(--dim);margin-right:6px}
.swp-addb{align-self:flex-start}
.swp-lights{display:flex;flex-direction:column;gap:22px}
.swp-lz{background:var(--charcoal);border-radius:10px;padding:16px 18px;overflow-x:auto}
.swp-lzh{display:flex;justify-content:space-between;align-items:baseline}.swp-lzh .mono{font-size:10px;color:var(--dim)}
.swp-tbl{width:100%;border-collapse:collapse;font:400 13px/1.3 var(--grotesk)}
.swp-tbl th{font:400 10px var(--mono);text-transform:uppercase;color:var(--dim);text-align:left;padding:6px 8px;border-bottom:1px solid var(--hair);white-space:nowrap}
.swp-tbl td{padding:8px;border-bottom:1px solid var(--hair);vertical-align:middle}.swp-tbl td b{font-weight:400;display:block}
.swp-tbl .dim{font-size:10px;color:var(--dim);display:block;margin-top:3px}.swp-tbl .dim a{color:var(--white)}
.swp-at{display:block;color:var(--white);text-decoration:underline;text-decoration-color:var(--steel);font-size:12px}
.swp-none{color:var(--ember);font:400 11px var(--mono);text-transform:uppercase}
.tog{position:relative;display:inline-block;width:36px;height:20px}.tog input{opacity:0;width:0;height:0}
.tog span{position:absolute;inset:0;border-radius:999px;background:#3a3a3a;transition:.2s}.tog span::after{content:"";position:absolute;left:3px;top:3px;width:14px;height:14px;border-radius:50%;background:#bbb;transition:.2s}
.tog input:checked+span{background:var(--ember)}.tog input:checked+span::after{transform:translateX(16px);background:#fff}
`;
  function mount(el) {
    root = el; root.classList.add("swp");
    if (!document.getElementById("swp-css")) { const s = document.createElement("style"); s.id = "swp-css"; s.textContent = CSS; document.head.appendChild(s); }
    st = load(); render();
    root.addEventListener("click", onClick); root.addEventListener("change", onChange); root.addEventListener("input", onInput);
    document.addEventListener("keydown", (e) => { if (e.key === "Escape" && pl && root.isConnected) { pl = null; render(); } });
  }
  window.SWITCHPLAN = { mount };
})();
