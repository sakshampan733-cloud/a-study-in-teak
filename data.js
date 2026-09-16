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
    veneer: { value: "", status: "brief", options: [], rule: "Chosen by look from the veneer catalogue, not by wood species." },
    grain:  { value: "", status: "brief", options: ["Crown cut", "Quarter cut / straight", "Book-matched", "Slip-matched"] },
    polish: { value: "", status: "brief", options: ["Matte PU", "Satin PU", "High-gloss PU", "Melamine", "Hand-rubbed / French polish"], rule: "Must match the solid teak desk." },
    tone:   { value: "", status: "brief", options: ["Natural", "Warm / honeyed", "Dark stained"], rule: "Must match the solid teak desk." },
    // Solid timber, for pieces that are not veneered.
    wood:   { value: "Teak", status: "final", options: ["Teak"], usedFor: ["Desk"] },
    appliesTo: ["Doors & moulding", "Wardrobes", "Shelf", "Walls", "TV unit", "Bed", "Headboard"],
    notes: [
      "One single veneer for the entire room — bedroom, study, dressing and all three doors.",
      "Solid wood is teak — final.",
      "Veneer is picked by look, not species. Whatever it is, its polish and tone must match the teak desk.",
    ],
  },

  room: {
    plan: "",            // path to plan image once sent, e.g. "assets/plan.jpg"
    facts: [
      { k: "Partition", v: "At the 11 ft mark" },
      { k: "Zones", v: "Bedroom · Study · Dressing · Bathroom" },
      { k: "Doors", v: "3 — all identical" },
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
      id: "study", title: "Study", kicker: "Desk & shelf",
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
          id: "shelf", name: "Shelf", status: "brief",
          parts: [
            { label: "Design", value: "", hint: "Open / glazed, cornice, divisions" },
            { label: "Veneer", inherit: "veneer" },
            { label: "Polish", inherit: "polish" },
            { label: "Dimensions", value: "" },
            { label: "Lighting", value: "", hint: "Internal shelf lighting? (see Lighting)" },
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
          id: "right-wall", name: "Right Wall", status: "brief",
          parts: [
            { label: "Treatment", value: "" },
            { label: "Veneer", inherit: "veneer" },
            { label: "Polish", inherit: "polish" },
            { label: "What sits here", value: "" },
          ],
          questions: [],
        },
      ],
    },
    {
      id: "bedroom", title: "Bedroom", kicker: "TV unit · bed · headboard",
      intro: "",
      items: [
        {
          id: "tv-unit", name: "TV Unit", status: "brief",
          parts: [
            { label: "Design", value: "" },
            { label: "Veneer", inherit: "veneer" },
            { label: "Polish", inherit: "polish" },
            { label: "Dimensions", value: "" },
            { label: "Services", value: "", hint: "Sockets, cable routing, set-top box space" },
          ],
          questions: [],
        },
        {
          id: "bed", name: "Bed", status: "brief",
          parts: [
            { label: "Design", value: "", hint: "Frame, legs, storage (hydraulic / drawers / none)" },
            { label: "Veneer", inherit: "veneer" },
            { label: "Polish", inherit: "polish" },
            { label: "Size", value: "", hint: "Queen / King, mattress size" },
          ],
          questions: [],
        },
        {
          id: "headboard", name: "Headboard & Bed-back Wall", status: "brief",
          parts: [
            { label: "Design", value: "", hint: "Upholstered / panelled / full-wall" },
            { label: "Veneer", inherit: "veneer" },
            { label: "Polish", inherit: "polish" },
            { label: "Upholstery", value: "" },
            { label: "Lighting", value: "", hint: "Reading lights, cove behind headboard?" },
          ],
          questions: [],
        },
      ],
    },
    {
      id: "dressing", title: "Dressing", kicker: "Wardrobes",
      intro: "",
      items: [
        {
          id: "wardrobe", name: "Wardrobes", status: "brief",
          parts: [
            { label: "Shutter design", value: "" },
            { label: "Veneer", inherit: "veneer" },
            { label: "Polish", inherit: "polish" },
            { label: "Internals", value: "", hint: "Hanging, drawers, shoe rack, loft" },
            { label: "Hardware", value: "" },
            { label: "Dimensions", value: "" },
          ],
          questions: [],
        },
      ],
    },
    {
      id: "bathroom", title: "Bathroom", kicker: "Vanity",
      intro: "",
      items: [
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
