// ─────────────────────────────────────────────────────────────
//  A STUDY IN TEAK — the particulars book for the room.
//  All content lives here. The site only renders it.
//  status: "brief"  = not yet briefed
//          "open"   = in discussion
//          "final"  = decided
// ─────────────────────────────────────────────────────────────

window.PROJECT = {
  name: "A Study in Teak",
  tagline: "A book of particulars — neoclassical, post-war British",
  style:
    "Neoclassical / classical, in the manner of a late-1940s British interior: restrained mouldings, symmetry, warm timber, quiet brass.",

  // Materials: the one veneer used across the room, plus solid wood for solid pieces.
  master: {
    veneer: { value: "", status: "open", options: [], rule: "Chosen by look from the veneer catalogue, not by wood species.",
              refs: [{ src: "assets/refs/veneer-ref-1-curved-walnut-gloss.jpg", caption: "Reference for veneer, grain, colour and polish — rich dark walnut-toned veneer with a straight, flowing grain and a soft gloss (not decided)" }] },
    grain:  { value: "", status: "brief", options: ["Crown cut", "Quarter cut / straight", "Book-matched", "Slip-matched"] },
    polish: { value: "", status: "brief", options: ["Matte PU", "Satin PU", "High-gloss PU", "Melamine", "Hand-rubbed / French polish"], rule: "Must match the solid teak desk." },
    tone:   { value: "", status: "brief", options: ["Natural", "Warm / honeyed", "Dark stained"], rule: "Must match the solid teak desk." },
    // Solid timber, for pieces that are not veneered.
    wood:   { value: "Teak", status: "final", options: ["Teak"], usedFor: ["Desk"] },
    // The floor the whole scheme sits on.
    floor:  { value: "Taupe-brown marble, polished", status: "open", options: ["Polished", "Honed / matte"], rule: "Mid taupe-brown marble with fine white veining — brown but with a greyish cast, not red or golden. Polished, so it throws light back up. Every wood tone is judged against this slab.",
              refs: [
                { src: "assets/refs/floor-ref-2-taupe-brown-marble-slab.jpg", caption: "Room floor — taupe-brown marble with fine white veining" },
                { src: "assets/refs/floor-ref-1-taupe-brown-marble-slab.jpg", caption: "The same slab, seen at the yard" },
              ] },
    // Two more stones: the room's border and skirting, and the bathroom.
    trimStone: { value: "White marble with brown-grey veining", status: "open", options: ["Polished", "Honed / matte"], rule: "Used for the border in the room floor and for the skirting — a light stone that draws a line around the taupe field.",
              refs: [{ src: "assets/refs/stone-ref-2-white-brown-border-skirting.jpg", caption: "Border and skirting — white marble with soft brown-grey veining, polished" }] },
    bathStone: { value: "Beige-gold marble", status: "open", options: ["Polished", "Honed / matte"], rule: "The bathroom stone — a warm beige-gold marble with faint cloudy veining, warmer and lighter than the room floor.",
              refs: [{ src: "assets/refs/stone-ref-3-beige-gold-bathroom-marble.jpg", caption: "Bathroom marble — warm beige-gold with faint veining" }] },
    // Wall paint for the room.
    paint:  { value: "Warm cream", status: "open", options: ["Warm cream", "Soft ivory", "Warm off-white"], rule: "Soft, warm cream like the reference room — calm and light, never stark white. Exact shade to pick from samples.",
              refs: [{ src: "assets/refs/paint-ref-1-warm-cream-room-sheer-curtains.jpg", caption: "Paint reference — warm cream walls and ceiling, soft daylight through white curtains" }] },
    appliesTo: ["Doors & moulding", "Wardrobes", "Shelf", "Walls", "TV unit", "Bed", "Headboard"],
    notes: [
      "One single veneer for the entire room — bedroom, study, dressing and all three doors.",
      "Solid wood is teak — final.",
      "Veneer is picked by look, not species. Whatever it is, its polish and tone must match the teak desk.",
    ],
  },

  // How the wood is shared out across the room — the 60 / 30 / 10 rule, applied to what is planned.
  scheme: {
    intro: "Nothing here is confirmed. It is the shortlist and the rules the picks are judged against.",
    rows: [
      { k: "60 · Wood", v: "Dark reddish teak, one tone everywhere: the desk (solid), the study wall and its cupboards, the partition, the three doors, and — if they go wood — the wardrobes and the bathroom vanity." },
      { k: "30 · Quiet surfaces", v: "Warm cream painted walls and mouldings, the parchment bed wall, parchment drawer fronts, the white lit glass of the wardrobes, and the bed's leather if it is wrapped rather than wood." },
      { k: "10 · Accent", v: "Brass on handles and pulls, blackened steel frames, the black ceiling linework in the bathroom, the black volute curtain hook." },
      { k: "Solid vs veneer", v: "Solid teak for the desk and anything carved or shaped (cornice, fluted pilasters, mouldings, edges). Teak veneer for every large flat panel and for the vaulted ceiling, so nothing moves or cracks. Wardrobes and bathroom vanity: veneer only." },
      { k: "Finish", v: "Satin to semi-gloss lacquer on panelling, doors and trim for the formal look. Matte or oiled on the desk, so it feels different under the hand and does not mirror the lamp." },
      { k: "Grain", v: "Straight and consistent, slip-matched so a run of panels reads as one piece. No burl, crotch or wild figure — the reeding and fluting supply the texture." },
      { k: "Undertone", v: "Warm only — teak, walnut, dark oak, mahogany. No grey-washed or ash-toned wood anywhere." },
      { k: "The floor it sits on", v: "Polished taupe-brown marble. Polished, so it throws light back up and carries dark wood above it; being cooler than the wood, the cream and parchment have to stay generous or the floor reads grey." },
      { k: "The other two stones", v: "A white marble with brown-grey veining for the floor border and the skirting, and a warm beige-gold marble in the bathroom. The white border keeps the taupe field from meeting the wood directly; the bathroom stone is the warmest of the three, so the teak vanity will sit easily on it." },
      { k: "Wet areas", v: "The bathroom vanity needs a moisture-resistant core (BWP / marine ply) with every edge sealed." },
    ],
  },

  room: {
    plan: "assets/refs/room-plan-lighting-rcp.jpg",   // source: photo of the lighting / false-ceiling plan
    facts: [
      { k: "Plan", v: "Rectangle, roughly 14 × 18 ft read off the photo (to confirm)" },
      { k: "Study end", v: "Top of the plan: study wall with shelves and cupboards; window at its right-hand end" },
      { k: "Desk", v: "Faces the partition; the study wall is behind the chair" },
      { k: "Partition", v: "Across the middle, about 11 ft from the entrance wall, curved ends, three sections" },
      { k: "Bed end", v: "Bottom of the plan: 6 ft 6 in bed against the wall, curved bed back wrapping round with bedside tables" },
      { k: "Entrance", v: "Bottom-left corner, door swings in" },
      { k: "Beyond right wall", v: "Washroom and dressing (plan to come)" },
      { k: "Ceiling", v: "Barrel vault with coffered panels; cove line and down-lights around the perimeter" },
      { k: "Doors", v: "3 — all identical (D1 8 × 3 ft, D2/D3 8 × 2 ft 6 in)" },
    ],
  },


  // Tabs. Each item is a spec sheet built from parts.
  // A part with inherit:"veneer" / "polish" pulls from the master unless overridden.
  tabs: [
    {
      id: "doors", title: "Doors & Moulding", kicker: "Three doors, one design",
      intro: "All three doors are to look the same. Each door is the sum of three separate decisions — design, veneer and polish — plus the moulding around it.",
      items: [
        {
          id: "door", name: "Doors (×3)", status: "open",
          drawing: "door",
          refs: [
            { src: "assets/refs/door-ref-1.jpg", caption: "Reference — pair of panelled doors in a library (film still)" },
            { src: "assets/refs/door-ref-1-crop.jpg", caption: "Close-up — shaped bead, corner roundels, knob on lock rail" },
          ],
          parts: [
            { label: "Design", value: "Four-panel leaf after the reference: tall upper panel and short lower panel, each with a sunk ovolo-moulded field, a carved shaped bead (concave shoulders rising to a rounded crown at head and foot) and four carved corner roundels. Lock rail carries knob and keyhole." },
            { label: "Veneer", inherit: "veneer" },
            { label: "Polish", inherit: "polish" },
            { label: "Hardware", value: "", hint: "Handles, hinges, lock, finish (brass / antique brass / nickel)" },
            { label: "Size", value: "D1 main door 8 ft × 3 ft (2438 × 914). D2 and D3 same design, 8 ft × 2 ft 6 in (2438 × 762). Thickness to confirm." },
          ],
          questions: [
            "Single leaf or a pair? The reference is a pair of narrow leaves.",
            "Wall thickness at each door (for the frame and architrave)?",
            "Leaf thickness — 35, 40 or 45 mm?",
            "Knob height: the reference proportions put it at ~765 mm from floor; a normal height is 900–1000 mm (makes the lower panel taller).",
            "Are the roundels carved into the panel, or applied brass / wooden bosses?",
            "Is the shaped line a carved groove, or a raised applied moulding?",
            "Knob and hinge finish — ebonised wood, antique brass, or polished brass?",
            "Which three doors — main entry, bathroom, dressing?",
          ],
        },
        {
          id: "moulding", name: "Door Moulding / Architrave", status: "brief",
          parts: [
            { label: "Profile", value: "", hint: "Architrave width and profile, plinth blocks, head detail" },
            { label: "Veneer / Paint", inherit: "veneer" },
            { label: "Polish", inherit: "polish" },
          ],
          questions: [],
        },
      ],
    },
    {
      id: "study", title: "Study", kicker: "Desk & study wall",
      intro: "",
      items: [
        {
          id: "desk", name: "Desk", status: "open",
          drawings: ["desk", "desk-details", "desk-3d"],
          refs: [
            { src: "assets/refs/desk-ref-1.jpg", caption: "Reference — Tommy Shelby's desk, Peaky Blinders (screen photo)" },
            { src: "assets/refs/desk-ref-1-detail.jpg", caption: "Close-up — reeded top edge, frieze drawer, swan-neck handles, fluted corner blocks" },
          ],
          parts: [
            { label: "Type", value: "Double-pedestal (kneehole) writing desk, George III / Victorian English style" },
            { label: "Construction", value: "Solid wood" },
            { label: "Wood type", inherit: "wood" },
            { label: "Top", value: "Thick top with a multi-reeded edge moulding (3–4 parallel reeds) and a slight overhang. Plain teak writing surface — no leather inset." },
            { label: "Frieze", value: "Row of frieze drawers across the front under the top — long centre drawer over the kneehole, one over each pedestal. Reeded / cock-beaded rail under the drawers." },
            { label: "Corners", value: "All four outer corners are hollowed INWARD with a large sweeping curve: R150 on the top, and every layer below (cove, frieze, pedestal, plinth) is a parallel curve struck from the same centre. Each end of each curve is softened with a R12 round — no sharp arrises. The middle of the hollow is left clean." },
            { label: "Corner mouldings", value: "At BOTH ends of every curve — where the round starts on the front face and on the side face — a terminating moulding (fillet + bead + fillet, 26 wide, 12 proud) runs the pedestal height: plinth block at the foot, two carved teak collars, a carved drop down the bead, and a reeded console bracket above it under the top." },
            { label: "Pedestals", value: "Raised-and-fielded doors with a bolection frame, carved rosette-and-scroll ornament and a brass ring pull. Inner stiles (kneehole side) carry a carved drop under a reeded console. Drawers vs doors — to confirm." },
            { label: "Base", value: "Moulded plinth under each pedestal — to confirm (plinth vs bun feet vs castors)." },
            { label: "Hardware", value: "Polished brass swan-neck bail handles with round rosette posts on the drawers; ornate ring pulls on the pedestals." },
            { label: "Finish", value: "Rich red-brown, high gloss (French-polish look). This finish sets the polish for the whole room." },
            { label: "Dimensions", value: "2286 L × 914 D × 750 H (7 ft 6 in × 3 ft; height set for a 5 ft 9 in user, 620 mm knee clearance)" },
          ],
          questions: [
            "Size: how much space do you have? Reference proportions suggest roughly 1800 L × 900 D × 760 H — your room may need smaller.",
            "Is it placed against a wall or free-standing (front, back and sides all finished)?",
            "Pedestals: drawers all the way down, or a cupboard door with the carved ornament?",
            "Carvings: full carving like the reference (drops, ribbon ornaments, fluted blocks), or a simplified version? Carved in teak, or brass mounts?",
            "Colour: the reference is a red-brown gloss. Teak stained to that, or teak's natural golden-brown?",
            "Cable management, a hidden drawer for a laptop / charger, or locks on any drawers?",
          ],
        },
        {
          id: "shelf", name: "Study Wall — Bookcase, Panelled Centre, Window", status: "open",
          drawings: ["studywall", "studywall-details"],
          refs: [
            { src: "assets/refs/wall-ref-0-study-layout.jpg", caption: "Layout reference — bookcase, panelled centre with painting, desk in front" },
            { src: "assets/refs/wall-ref-1-library-pilasters.jpg", caption: "Ref. 1 — full-height fluted pilasters, moulded painting panel, cupboards below" },
            { src: "assets/refs/wall-ref-3-arched-bookcases.jpg", caption: "Ref. 2 — dentil-and-block cornice, lit arched bookcase heads" },
            { src: "assets/refs/wall-ref-2-cornice-closeup.jpg", caption: "Ref. 2 close-up — the cornice" },
            { src: "assets/refs/wall-ref-4-dark-study-bands-sconces.jpg", caption: "Ref. 3 — panel band over every bay, twin sconces, pedestals stepping forward" },
          ],
          parts: [
            { label: "Layout", value: "Left: bookcase with open shelves and a flat head (no arch). Centre: moulded panel (a painting may hang here). Right: the window. A moulded panel band of the same height runs over all three bays under the cornice. Two fluted pilasters on stepped-forward pedestals frame the centre, each carrying a twin sconce. Cupboards under all three bays." },
            { label: "Style", value: "After the reference study: full-height teak panelling, cornice and frieze running across the whole wall, a desk-height cupboard band with a projecting top, open shelves lit from above." },
            { label: "References chosen", value: "Ref. 1: fluted pilasters with plain moulded capitals, moulded painting panel. Ref. 2: block-and-dentil cornice (plain, no carving). Ref. 3 (dark study): moulded panel band over every bay, twin candle sconces with shades on the pilasters, pedestals that step forward below the counter." },
            { label: "Pilasters", value: "Two, 240 wide: panelled pedestal from floor to counter, 25 wider each side and 50 further forward, with the counter wrapping it; above, the fluted shaft (9 stopped flutes) on a moulded base up to a plain moulded capital. A twin sconce on each." },
            { label: "Cornice", value: "Full width, projecting 160 beyond the shelves: stepped architrave, plain frieze, plain modillion blocks with a sunk panel at 105 centres, dentils, cyma crown. Breaks forward over each pilaster." },
            { label: "Bookcase", value: "Open shelves, flat head rail with a strip light under it, moulded band panel above. No arch." },
            { label: "Cupboards", value: "Under all three bays (bookcase, centre panel, window): 2 ft (610) high to the top, 280 (11 in) deep from the wall including the 25 overhang, two doors per bay with a moulded frame and raised field, brass drop handles. Each bay has its own reeded 40 mm top matching the desk, dying into the pilasters." },
            { label: "Centre panel", value: "Bolection-moulded frame with a raised field; painting (drawn 700 × 900) optional, with a picture light." },
            { label: "Window side", value: "Moulded architrave round the window, panelled sides, the same band panel above, cornice running across; sill level with the counter." },
            { label: "Wood", inherit: "wood" },
            { label: "Polish", inherit: "polish" },
            { label: "Dimensions", value: "Wall 16 ft wide (4877), ceiling 9 ft (2743). The unit comes 11 in (280) off the wall; pilasters stand 40 proud of it, pedestals 50 proud of the counter. Bays 1500 / 240 / 1400 / 240 / 1497. Window size and position still to measure." },
          ],
          questions: [
            "Window: width, height, sill height and distance from the right-hand corner?",
            "Does the panelling and cornice run over the window too, so the wall reads as one piece?",
            "Bookcase: open shelves, or glazed doors above the cupboards?",
            "Should the pilasters and cupboard band borrow the desk's details (reeded consoles, hollow corners, carved drops)?",
          ],
        },
        {
          id: "curtains", name: "Window Curtains", status: "open",
          refs: [
            { src: "assets/refs/paint-ref-1-warm-cream-room-sheer-curtains.jpg", caption: "Curtain reference — white, light-filtering curtains in soft folds, floor to ceiling" },
            { src: "assets/refs/curtain-ref-1-volute-tieback.jpg", caption: "Tieback — a black iron volute (spiral) hook holding the curtain back" },
          ],
          parts: [
            { label: "Where", value: "The window on the study wall." },
            { label: "Fabric", value: "White, light-filtering — not see-through, but daylight passes softly through (like a heavy voile or linen sheer)." },
            { label: "Tieback", value: "A black iron volute (spiral) hook fixed to the wall, holding the curtain back, as in the reference." },
            { label: "Track / rod", value: "", hint: "Ceiling track or rod, and how full the pleats are" },
            { label: "Length", value: "", hint: "Floor length, just kissing the floor, as in the reference?" },
          ],
          questions: [],
        },
      ],
    },
    {
      id: "walls", title: "Left & Right Walls", kicker: "Wall treatments",
      intro: "",
      items: [
        {
          id: "left-wall", name: "Left Wall", status: "brief",
          parts: [
            { label: "Treatment", value: "", hint: "Panelling, dado, wainscot, paint, wallpaper" },
            { label: "Veneer", inherit: "veneer" },
            { label: "Polish", inherit: "polish" },
            { label: "What sits here", value: "" },
          ],
          questions: [],
        },
        {
          id: "right-wall", name: "Right Wall", status: "final",
          drawings: ["rightwall"],
          refs: [
            { src: "assets/refs/right-wall-panelling.svg", caption: "Options A–D — C chosen: 5 panels, lamps in panels 1, 3 and 5" },
            { src: "assets/refs/walls-ref-1-panel-moulding.jpg", caption: "Ref. — painted panel moulding: short panels under a dado, tall panels above, cove light at the ceiling" },
          ],
          parts: [
            { label: "Treatment", value: "Applied panel moulding painted the wall colour. Short panels below a dado rail, tall panels above, 150 stiles between" },
            { label: "Length", value: "About 14–15 ft from the study wall to the bathroom door (drawn at 4420 / 14 ft 6 in), then the door, then 2 ft of wall to the corner" },
            { label: "Heights", value: "Skirting 130 · rail 570–610, the study counter band carried round the corner unbroken · short panels 240–490 · tall panels 720–2433, 310 below the ceiling · no crown moulding — the cove light is in the ceiling" },
            { label: "Panels", value: "Option C: 5 equal panels about 24 in (606) wide on the long run, short and tall on the same centres, plus one narrow 345 panel on the 2 ft wall past the door" },
            { label: "Mouldings", value: "Panel moulding 55 × 24 ogee, mitred · rail 40 × 28 with the same 4 reeds as the study counter edge · skirting 130 × 18 — all painted the wall colour" },
            { label: "Door", value: "Bathroom door 2 ft 6 in × 8 ft, architrave 65 (about 2½ in) all round; rail and skirting stop at it" },
            { label: "Lamps", value: "3 twin-arm wall lamps, brass with fabric shades, centred inside tall panels 1, 3 and 5 at 1290 — the same height as the study sconces" },
            { label: "Lighting", value: "No crown moulding on this wall — the ceiling cove light runs above it, on the room's cove dimmer" },
          ],
          questions: ["Exact length to the bathroom door", "Which way the bathroom door swings", "Rail in polished teak like the counter, or painted the wall colour?"],
        },
      ],
    },
    {
      id: "bedroom", title: "Bedroom", kicker: "TV unit · bed · headboard",
      intro: "",
      items: [
        {
          id: "tv-unit", name: "TV Unit / Side Drawers", status: "brief",
          refs: [
            { src: "assets/refs/bedwall-ref-5-parchment-cabinet-dark-room.jpg", caption: "Reference — parchment-fronted cabinet glowing against dark walls" },
          ],
          parts: [
            { label: "Reference", value: "The parchment cabinet: the look for a piece under the TV, but in a drawer style rather than doors." },
            { label: "What it is", value: "", hint: "A drawer unit under the TV, or side drawers — not decided" },
            { label: "Design", value: "", hint: "How the drawers look — not decided" },
            { label: "Veneer", inherit: "veneer" },
            { label: "Polish", inherit: "polish" },
            { label: "Dimensions", value: "" },
            { label: "Services", value: "", hint: "Sockets, cable routing, set-top box space" },
          ],
          questions: ["Drawer unit under the TV, or side drawers?"],
        },
        {
          id: "bed", name: "Bed", status: "open",
          refs: [
            { src: "assets/refs/bed-ref-1-low-platform-bed.jpg", caption: "Bed reference (Newberry Projects) — low bed with a thick upholstered base, wide wooden side ledge as a bedside table, aged metal-leaf panels behind" },
          ],
          parts: [
            { label: "Reference", value: "Low, deep bed with a thick fabric-covered base and cushion; a wide plank-like wooden ledge runs out beside it as the bedside table; behind, a framed screen of aged copper/metal-leaf panels." },
            { label: "Design", value: "", hint: "Frame, legs, storage (hydraulic / drawers / none)" },
            { label: "Veneer", inherit: "veneer" },
            { label: "Polish", inherit: "polish" },
            { label: "Size", value: "", hint: "Queen / King, mattress size" },
          ],
          questions: [],
        },
        {
          id: "headboard", name: "Bed Wall", status: "open",
          refs: [
            { src: "assets/refs/bedwall-ref-1-parchment-dressing-room.jpg", caption: "Your ref — tall parchment panels, pale and warm, fine joints, dark cornice line" },
            { src: "assets/refs/bedwall-ref-3-parchment-large-panels.jpg", caption: "Your ref — large parchment panels with soft cloudy tone, joints kept hairline" },
            { src: "assets/refs/bedwall-ref-4-parchment-fireplace-wall.jpg", caption: "Your ref — a whole wall in parchment squares around a fireplace" },
            { src: "assets/refs/bedwall-ref-2-parchment-entry-niche.jpg", caption: "Your ref — parchment niche with a dark stone skirting and a slim dark edge" },
          ],
          parts: [
            { label: "Direction", value: "Parchment on the wall behind the bed — pale, warm, cloudy tone like vellum." },
            { label: "Two ways to do it", value: "Real parchment / vellum panels (as in your references) — large sheets with hairline joints; or parchment-effect plaster in the same colour with no joints." },
            { label: "Panels or seamless", value: "Probably large panels — not decided yet." },
            { label: "Layout", value: "Symmetrical — the panels set out evenly about the centre of the bed." },
            { label: "Shade", value: "One even shade across every panel — no panel lighter or darker than the next." },
            { label: "Extent", value: "", hint: "Whole bed wall, floor to ceiling?" },
            { label: "Edges", value: "", hint: "Dark slim edge / stone skirting as in ref 2, or plain" },
          ],
          questions: ["Large panels or seamless — to decide", "Whole wall, or just behind the bed?"],
        },
        {
          id: "partition", name: "Partition", status: "open",
          refs: [
            { src: "assets/refs/bedwall-ref-5-parchment-cabinet-dark-room.jpg", caption: "Reference — parchment-fronted cabinet, the look for the partition drawers" },
          ],
          parts: [
            { label: "Size", value: "About 8 ft long, floor to ceiling, curved ends; gaps of about 3½ ft and 2½ ft at the ends (rough — to measure, as they should add up to the room width)." },
            { label: "Material", value: "Wood only — no glass." },
            { label: "Drawers", value: "Parchment-fronted drawers, like the cabinet reference." },
            { label: "Moulding", value: "A little moulding — not too much." },
            { label: "Design", value: "", hint: "Not decided" },
          ],
          questions: ["Measure the room width and the two end gaps"],
        },
      ],
    },
    {
      id: "dressing", title: "Dressing", kicker: "Wardrobes · mirror",
      intro: "",
      items: [
        {
          id: "wardrobe", name: "Wardrobes", status: "open",
          refs: [
            { src: "assets/refs/wardrobe-options-A-C-D.svg", caption: "Glass options — A linear (chosen), C linear with four-dot jewels, D border and jewels" },
            { src: "assets/refs/wardrobe-ref-2-steel-leaded-doors-wide.jpg", caption: "Ref. 2 — blackened steel doors with transoms, textured glass in linear leading" },
            { src: "assets/refs/wardrobe-ref-3-steel-leaded-doors-closeup.jpg", caption: "Ref. 2 close-up — the leading pattern, slim bar pulls" },
            { src: "assets/refs/wardrobe-ref-1-laylight-white-glass-grid.jpg", caption: "Ref. 1 — white glass lit from behind in a square grid (laylight)" },
            { src: "assets/refs/ceiling-barrel-vault-coffers.jpg", caption: "The room's ceiling — barrel vault with coffered panels" },
          ],
          parts: [
            { label: "Direction", value: "Not wood. Full-height blackened-steel doors with a transom (ref. 2), white textured glass in lead came, lit from inside so the wall glows softly like lit windows (ref. 1). Brass bar pulls." },
            { label: "Glass", value: "", hint: "White glass that hides the clothes: opal, satin-etched, reeded or seeded/cathedral glass in lead came" },
            { label: "Pattern", value: "A — linear leading like ref. 2, pairs mirrored (chosen). C adds the laylight's four-dot jewels where they fit; D is a bordered alternative. See the options board." },
            { label: "Frames", value: "Blackened steel T-section, 38 mm face, transom bar at 560 below the cornice (as ref. 2)." },
            { label: "Lighting", value: "", hint: "Warm 2700 K LED strips on a dimmer, set back behind a diffuser so there are no bright spots" },
            { label: "Lit glass", value: "The wardrobe is lit from inside so the leaded white glass glows like a window at night — warm 2700 K LED on its own dimmer, set back so there are no bright spots." },
            { label: "Inside finish", value: "Sunmica (laminate) in a warm ivory / cream with a matte linen (fabric-texture) finish on back panels, sides and shelves. Light and matte so the glass glows evenly and creamy like parchment; the texture hides scuffs. Not white gloss (reflections, hot spots, clinical) and not dark (the glass turns grey and dead)." },
            { label: "Internals", value: "", hint: "Hanging, drawers, shoe rack, loft; brass rails; drawer fronts inside can be a contrast (e.g. walnut-tone or deep green) since they sit behind the glass" },
            { label: "Hardware", value: "", hint: "Brass only (gold on handles)" },
            { label: "Dimensions", value: "" },
          ],
          questions: [
            "Which wall do the wardrobes go on, its width, and how deep can they be (600 is standard)?",
            "Does the vault run along the wardrobe wall or end on it (so the top would meet the arch)?",
            "Height where the vault starts (springing line)?",
            "How many doors / how much hanging vs drawers?",
          ],
        },
        {
          id: "dressing-mirror", name: "Dressing Mirror", status: "open",
          refs: [
            { src: "assets/refs/dressing-mirror-ref-1-folding-screen.jpg", caption: "Chosen reference — free-standing three-panel mirror screen in slim dark bronze frames with cut top corners" },
          ],
          parts: [
            { label: "Design", value: "Free-standing folding mirror screen after the reference: three tall mirror panels hinged together — a wide centre panel with two narrower wings angled in so you see front and sides at once." },
            { label: "Frame", value: "Slim dark bronze / blackened metal frame round each panel, with the top outer corners cut on an angle (chamfered) and a stepped foot rail at the bottom." },
            { label: "Mirror", value: "Clear silver mirror, full height of each panel." },
            { label: "Placement", value: "", hint: "Which wall or corner of the dressing area; free-standing or fixed to the floor" },
            { label: "Dimensions", value: "", hint: "Height, centre panel width, wing width" },
            { label: "Finish", value: "", hint: "Frame finish to sit with the blackened-steel wardrobe frames and brass pulls" },
          ],
          questions: ["Where does the mirror stand, and how tall should it be?"],
        },
      ],
    },
    {
      id: "bathroom", title: "Bathroom", kicker: "Vanity · painted ceiling",
      intro: "",
      items: [
        {
          id: "bath-ceiling", name: "Painted Ceiling", status: "open",
          refs: [
            { src: "assets/refs/bathroom-ref-1-painted-ceiling-linework.jpg", caption: "Reference (@katrin_dib) — a light ceiling with fine dark hand-painted linework over a dark bathroom" },
            { src: "assets/refs/bathroom-ref-1b-painted-ceiling-detail.jpg", caption: "Close-up — rosettes, garlands and a border drawn in thin black lines, like embroidery" },
          ],
          parts: [
            { label: "Ceiling", value: "Already done." },
            { label: "Detail", value: "Fine black hand-painted linework on the ceiling, like embroidery — rosettes, swags and a patterned border, as in the reference." },
            { label: "Pattern", value: "", hint: "Motifs and layout to be drawn up — follow the reference or adapt" },
            { label: "Paint", value: "", hint: "Painter / artist, and a moisture-safe finish for the bathroom" },
          ],
          questions: ["Follow the reference pattern closely, or design your own motif?"],
        },
        {
          id: "vanity", name: "Vanity", status: "brief",
          parts: [
            { label: "Design", value: "" },
            { label: "Counter", value: "", hint: "Stone / marble / quartz" },
            { label: "Basin & tap", value: "" },
            { label: "Mirror", value: "" },
            { label: "Material / finish", value: "", hint: "Veneer in a wet area needs a moisture-resistant core" },
          ],
          questions: [],
        },
      ],
    },
  ],

  // ── Lighting & switch plan ──────────────────────────────────
  lighting: {
    intro: "Which switch turns on which light, grouped by zone. Dimmer groups can span several switches.",
    notes: [
      "Bulb colour — to see at the shop. The cove and focus lights are currently 4000 K natural white (8 W).",
      "At 4000 K the reddish teak goes flat and the cream paint and parchment turn cold. 2700–3000 K suits everything chosen so far.",
      "Keep 4000 K only where you need to see properly: the bathroom mirror and the desk task light.",
    ],
    zones: [
      { id: "bedroom",  name: "Bedroom" },
      { id: "study",    name: "Study" },
      { id: "dressing", name: "Dressing" },
      { id: "bathroom", name: "Bathroom" },
    ],
    // One row per light (fixture group)
    lights: [
      { id: "cove", zone: "bedroom", name: "Cove lights", type: "LED strip", switch: "Separate switches (per run)", dimmer: "cove-dim", notes: "" },
    ],
    dimmers: [
      {
        id: "cove-dim", name: "Cove master dimmer",
        rule: "All cove runs are on different switches, but every one of them must dim together from a single dimmer.",
        status: "open",
      },
    ],
    // Switch boards: location → ordered list of switch positions
    boards: [],
  },
};
