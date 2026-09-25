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
    floor:  { value: "Taupe-brown marble, polished — laid", status: "final", options: ["Polished", "Honed / matte"], rule: "Mid taupe-brown marble with fine white veining — brown but with a greyish cast, not red or golden. Polished, so it throws light back up. Every wood tone is judged against this slab.",
              refs: [
                { src: "assets/refs/floor-ref-2-taupe-brown-marble-slab.jpg", caption: "Room floor — taupe-brown marble with fine white veining" },
              ] },
    // Two more stones: the room's border and skirting, and the bathroom.
    trimStone: { value: "White marble with brown-grey veining, polished — laid", status: "final", options: ["Polished", "Honed / matte"], rule: "Used for the border in the room floor and for the skirting. Skirting runs on three walls only — the bed wall and the left and right walls — not on the study wall, where the joinery meets the floor. Laid; no changes.",
              refs: [{ src: "assets/refs/stone-ref-2-white-brown-border-skirting.jpg", caption: "Border and skirting — white marble with soft brown-grey veining, polished" }] },
    bathStone: { value: "Beige-gold marble, polished — laid", status: "final", options: ["Polished", "Honed / matte"], rule: "The bathroom stone — a warm beige-gold marble with faint cloudy veining, warmer and lighter than the room floor.",
              refs: [{ src: "assets/refs/stone-ref-3-beige-gold-bathroom-marble.jpg", caption: "Bathroom marble — warm beige-gold with faint veining" }] },
    // Wall paint for the room.
    paint:  { value: "Warm cream", status: "open", options: ["Warm cream", "Soft ivory", "Warm off-white"], rule: "Soft, warm cream like the reference room — calm and light, never stark white. Exact shade to pick from samples.",
              refs: [{ src: "assets/refs/paint-ref-1-warm-cream-room-sheer-curtains.jpg", caption: "Paint reference — warm cream walls and ceiling, soft daylight through white curtains" }] },
    appliesTo: ["Doors & moulding", "Wardrobes", "Shelf", "Walls", "TV unit", "Bed", "Headboard"],
    notes: [
      "One single veneer for the entire room — bedroom, study, dressing and all three doors.",
      "Solid wood is teak — final.",
      "Veneer is picked by look, not species. Whatever it is, its polish and tone must match the teak desk.",
      "Hardware is brass/gold everywhere except the bathroom — those fittings are already bought, in chrome (brass and gold were too expensive).",
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

  // The reasoning behind the room — the rules every decision is judged against, and where the room
  // currently stands against each one. Rules appear here in full and again on the card they govern.
  principles: {
    intro: "The room is being built to a set of rules rather than assembled and then adjusted. These are the rules, why each one exists, and — honestly — where the room stands against it today.",
    groups: [
      {
        n: "01", name: "Light", line: "The one that decides whether everything else reads as warm.",
        rules: [
          {
            id: "warmth", t: "Light warm, or lose everything else",
            body: "Colour temperature decides whether every other warm decision in this room actually reads as warm. 4000K is neutral white — the light of an office, a clinic, a showroom. On teak it pulls the red out and leaves the grain faintly grey-green; on parchment it turns the cream clinical. 2700K for the room. 3000K at the very most, and only if the study half wants to be crisper. Never two temperatures in one sightline.",
            check: "Currently specified at 4000K throughout, cove and focus lights both. Nothing is bought yet, so this is still free — and it is the single biggest thing standing between this room and the feeling it is aiming at. The 1930s-40s reference argues the same way: those rooms were lit by lamps and filament, nowhere near 4000K.",
            at: ["lighting"],
          },
          {
            id: "cri", t: "CRI 90, or the stone was wasted",
            body: "Colour rendering, not brightness. Under a low-CRI lamp marble veining goes flat and grey and wood grain loses its depth. CRI 90+ on every fitting is the difference between a material looking expensive and looking printed.",
            check: "Not yet specified anywhere. It belongs on the list before the shop visit.",
            at: ["lighting", "veneer"],
          },
          {
            id: "layers", t: "Three layers, never one",
            body: "Ambient (the cove), task (desk, mirror, wardrobe), and low pools for the evening — lamps below eye level, 2200 to 2700K. A room lit only from the ceiling reads as a corridor no matter what is in it. The evening layer is the one that makes a room feel like somewhere lived in rather than somewhere visited.",
            check: "The cove and the focus lights cover the first two. The right wall lamps are the beginning of the third — protect them when the plan is redrawn.",
            at: ["lighting", "right-wall"],
          },
          {
            id: "dim", t: "Everything on a dimmer",
            body: "A calm room is one that can be turned down. 8W of focus light at full is a lot of punch in a room that is also a bedroom. Every circuit dimmable, and the cove on its own dimmer, separate from the rest.",
            check: "The dimmer groups are already planned. Carry them across when the lighting plan is redone.",
            at: ["lighting"],
          },
        ],
      },
      {
        n: "02", name: "Colour", line: "Two different rules doing two different jobs.",
        rules: [
          {
            id: "split", t: "Sixty, thirty, ten — in colour, not only in wood",
            body: "The wood scheme already splits the timber. Colour needs its own split: roughly 60 per cent warm neutral (cream walls, parchment, ceiling), 30 per cent wood, 10 per cent accent. A room can pass one of these rules and fail the other, which is why they are counted separately.",
            at: ["veneer"],
          },
          {
            id: "accent", t: "Metal is punctuation. Find the colour.",
            body: "Teak, cream, parchment, white marble and brass is a disciplined scheme and an entirely neutral one — and neutral schemes are exactly the ones that end up feeling like a good hotel rather than someone's home. Hotels are calm and nobody lives in them. One colour, chosen by you, repeated three times around the room so it reads as intentional rather than accidental. Deep green, oxblood, ochre and indigo all sit naturally with teak. Put it in textiles, where changing your mind costs an afternoon instead of a wall.",
            check: "There is currently no colour anywhere in the room. This is the real gap in the scheme.",
            at: ["bed", "curtains"],
          },
          {
            id: "value", t: "Dark low, light high",
            body: "Visual weight at the bottom, lightness at the top: darkest at the floor, mid on the walls, lightest at the ceiling. It is why some rooms feel settled and others feel top-heavy. The part to protect is the middle — teak running full height on more than one wall will close the room in.",
            check: "The floor is mid-dark and the ceiling is light, so both ends are right. The 2 ft 3 in (686) datum running through the study cupboards keeps the dark band low, which is the correct instinct. Hold it — it runs on round the right wall as the rail.",
            at: ["walls", "study"],
          },
        ],
      },
      {
        n: "03", name: "Surface", line: "How much the room reflects, and how many times the eye stops.",
        rules: [
          {
            id: "contrast", t: "Count the contrast moments",
            body: "Every hard light-against-dark edge is a place the eye stops, and calm is a low number of stops. They are worth counting across the whole room rather than judging one at a time.",
            check: "Five already: the white marble skirting, white curtains against teak, the parchment-to-teak junction, and the television. Nothing new gets added without something else coming out.",
            at: ["walls", "right-wall"],
          },
          {
            id: "ballast", t: "Polish needs something soft to answer it",
            body: "Polished floor, polished skirting, polished bathroom stone, satin lacquer on the panelling. Every one of those is right on its own; together they are a great deal of reflective surface, and rooms that bounce light read as lobbies. Homes feel calm because soft things absorb light — and sound. Echo is a larger part of a room not feeling like home than most people expect. A real rug over that marble, full curtains and an upholstered or leather bed are structural here, not decoration.",
            check: "The curtains and the leather bed are already heading the right way. A rug is the missing piece, and nothing has been said about one yet.",
            at: ["veneer", "bed"],
          },
          {
            id: "texture", t: "Texture, not pattern",
            body: "Calm rooms vary how surfaces feel rather than what is printed on them. Parchment, teak grain, marble veining, linen, leather and wool are already a strong set. Laying pattern on top is what tips a restrained room into a busy one.",
            at: ["veneer", "headboard"],
          },
          {
            id: "skirting", t: "The line at ankle height",
            body: "A high-contrast horizontal running round a room at ankle height pulls the eye downward and cuts the wall away from the floor. It is the least forgiving place in a room to put contrast.",
            check: "The white marble skirting is laid and it is staying. Skipping the study wall saved it — against teak it would have been much worse. What is left is to keep the wall paint close enough in value to the white marble that the two read as one soft base rather than a stripe, which quietly makes the paint choice more important than it looks.",
            at: ["walls", "veneer"],
          },
        ],
      },
      {
        n: "04", name: "Form", line: "Shape, symmetry, and what each wall is asked to do.",
        rules: [
          {
            id: "curves", t: "Curves calm, corners alert",
            body: "This one is measurable rather than taste: people rate rounded contours as safer and more pleasant with striking consistency, and sharp angles provoke a mild threat response. Spend the curves where the body passes closest — the edges walked past, sat against, reached around.",
            check: "The curved partition ends, the curved bed back and the bullnose edges are all this rule already working. It can be pushed further: a rounded mirror, a curved chair back.",
            at: ["partition", "bed", "dressing-mirror"],
          },
          {
            id: "symmetry", t: "Symmetry to rest, asymmetry to work",
            body: "Symmetry reads as settled and lets the eye stop searching; asymmetry keeps it moving. Which one is wanted depends entirely on what the wall is for. The sleeping half can afford to be symmetrical; the working half can afford to be looser.",
            check: "A symmetrical parchment bed wall, one even shade with no panel darker than its neighbour, is right for what that wall is for.",
            at: ["headboard", "study"],
          },
          {
            id: "onejob", t: "One job per wall",
            body: "Give each wall a single thing to do. The moment a wall is asked to store, display and divide all at once it stops being restful and starts being a fixture.",
            check: "Study wall stores and works. Bed wall holds the bed. Right wall panels and leads through to the dressing room. Left wall holds one painting. This is the rule most rooms break.",
            at: ["walls", "left-wall"],
          },
          {
            id: "rest", t: "Leave somewhere for the eye to rest",
            body: "Every wall doing something is exhausting. Blank wall is not wasted wall — it is what makes the considered things legible. A plain wall beside a worked one flatters it.",
            check: "The left wall going plain, with an air-conditioner high on it ruling out anything full height, is a gain rather than a compromise.",
            at: ["left-wall"],
          },
        ],
      },
      {
        n: "05", name: "The two sightlines", line: "The only two views guaranteed to be seen every day.",
        rules: [
          {
            id: "door", t: "What you see from the door",
            body: "The view from the doorway sets the impression of the room every single time it is entered, and it is the one view that cannot be avoided. It should land on the calmest thing in the room — not on the working half and its cables.",
            at: ["walls", "study"],
          },
          {
            id: "pillow", t: "What you see from the pillow",
            body: "Whether the working half is visible from the bed decides whether the room can be switched off at night. That, rather than storage or a television, is the partition's true job. It is also the honest tension in the brief: the more open the partition is, the more spacious the room feels, and the less it does the one thing it is there for.",
            check: "Unresolved — and it is the decision the partition shape should follow from, not the other way round.",
            at: ["partition"],
          },
        ],
      },
    ],
  },

  // What is actually wrong with the room as built, what it damages, and what is being done about it.
  // status: "blocking" — work is stopped until it closes
  //         "open"     — being worked on
  //         "accepted" — nothing can be done; the design absorbs it
  //         "solved"   — closed, kept for the record
  problems: {
    intro: "The room is a little out of square and has a step in one wall. This is the record of every problem that causes, what it damages, and how the design answers it.",
    items: [
      {
        id: "not-square", name: "The room is slightly out of square", status: "open",
        what: "Measured across: 14 ft 11 in at the study wall, 15 ft 0 in at the partition line, 15 ft 1 in just before the step near the bed end, then 15 ft 6 in at the bed wall itself. Along: 18 ft 11 in on one side, 19 ft 0 in on the other. Diagonals 24 ft 5 in and 23 ft 11 in. Ignoring the step, the room widens about 2 inches over its whole length — roughly half a degree.",
        effect: "Small, but real. No dimension can be reused from one end of the room to the other, so every fitted piece is made to the wall it actually meets. Half a degree is far too shallow to read on its own — it only shows where something repeats, or where a tight reveal runs the length of the room.",
        doing: "Each wall drawn to its own measurement: study wall 14 ft 11 in, partition 15 ft 0 in, bed wall 15 ft 6 in. All fitted joinery built 15 to 20 mm undersize with a scribe fillet at each end, planed on site to follow the wall — the carpenter has to be told this before he builds, not after. The diagonals close against the widths and the sides, so the shell is now known.",
        need: "Each wall at three heights — floor, waist and ceiling, since walls lean as well as splay — and whether the floor is level end to end.",
        drawings: ["roomshell"],
      },
      {
        id: "ceiling-plain", name: "The ceiling was left plain on purpose", status: "solved",
        what: "The barrel vault with coffered panels belongs to the dressing room. The main room ceiling is plain, and is 9 ft 1 in level throughout.",
        effect: "None — and that is the point. A coffered grid or any repeating ceiling pattern in a room that tapers 7 inches would have shown the fault straight away, because the border strip round the coffers would have changed width end to end.",
        doing: "Nothing. The decision was made on site before the problem was measured, for exactly the right reason. It is the single thing that keeps the out-of-square invisible from above.",
        need: "",
      },
      {
        id: "sill-datum", name: "The window sill height did not reconcile", status: "solved",
        what: "Three measurements of the same window did not add up to the ceiling, and the sill was given variously as 2 ft 3 in and 3 ft 4 in. Re-measured properly — floor to the underside of the window frame — it is 2 ft 3 in.",
        effect: "The sill sets the datum for the study wall — the counter and the cupboard tops both land on it. The right wall rail follows it too. Two drawings are built on that number. It cannot be guessed.",
        doing: "Closed. The datum is fixed at 686, which is what both drawings were already built on, so nothing had to be redrawn. The wall above the window works out at about 1 ft 5 in rather than the 15 in first paced — two inches, which is ordinary slack.",
        need: "",
      },
      {
        id: "partition-square", name: "The partition sits between two walls that are not parallel", status: "open",
        what: "It stands in the middle of the room, where the width is 15 ft 0 in, with a walk-round gap at each end. The two side walls it sits between splay apart towards the bed.",
        effect: "It can be square to the left wall or to the right wall, but not to both. Whichever one it is not square to, the gap at that end becomes a wedge rather than a parallel opening. Now the splay is known to be about half a degree, that wedge is well under an inch across the gap — a small problem rather than a large one, but a square end would still show a tapering reveal.",
        doing: "Bullnose ends. A curved end has no edge for the eye to measure a gap against, so the wedge cannot be read. The curve was chosen for how it looked; it now does structural work as well.",
        need: "Which side wall the partition should be set square to, and its true run.",
      },
      {
        id: "partition-arith", name: "The partition and its gaps do not add up", status: "open",
        what: "Partition about 8 ft, with gaps of about 3 ft 6 in and 2 ft 6 in either side. That totals 14 ft, against 15 ft 0 in at the partition line. Twelve inches unaccounted for.",
        effect: "The partition cannot be set out, and its drawers, panels and TV backing cannot be divided, until the run is known. A foot is more than rounding.",
        doing: "Nothing until it is measured. Everything about the partition waits behind this number.",
        need: "The partition run end to end, and both gaps, measured rather than paced.",
      },
      {
        id: "centre-panel", name: "The study wall centre panel loses 14 inches", status: "open",
        what: "The wall was drawn at 16 ft and is actually 14 ft 11 in. The window is fixed at 4 ft and the two pilasters are fixed, so the whole shortfall falls on the bookcase and the centre panel between them.",
        effect: "On the old layout the centre panel would drop from 4 ft 9 in to 3 ft 8 in, making the focal point of the wall its narrowest bay.",
        doing: "The centre panel stays — that is decided. Proposed instead: set the centre panel to the same width as the window bay so the two read as a matched pair framed by the pilasters, and let the bookcase take the remainder as the solid anchor at the end of the wall.",
        need: "Agreement on that split before the wall is redrawn.",
      },
      {
        id: "door-step", name: "A five-inch step in the left wall by the door", status: "open",
        what: "The left wall is not one plane. Just past the entrance door, near the bed end, it steps outward about five inches and then runs on to the bed wall. So the room is 15 ft 1 in wide up to that point and 15 ft 6 in wide for the last stretch, including at the bed wall itself.",
        effect: "The bed zone is a wider box than the rest of the room, with a five-inch return in the left wall where the two meet. The bed wall gets designed at its full 15 ft 6 in, but the left wall carries a step that panelling, skirting and anything else running along it has to turn. It also explains why the room first looked 7 inches out of square when it is really about 2, plus this step.",
        doing: "The bed wall is drawn at 15 ft 6 in — its true width — and the parchment field runs the whole of it. The step belongs to the left wall, which is going plain, so it can simply turn the corner there.",
        need: "How far the stepped section runs from the bed wall back along the left wall, exactly how deep the step is, and whether it goes floor to ceiling.",
      },
      {
        id: "window-corner", name: "The window is hard into the corner", status: "accepted",
        what: "The window is 4 ft wide and sits tight against the right-hand corner of the study wall, with no return.",
        effect: "The moulded architrave and panelled reveal can only run down the left side of the window — there is no wall left on the right for them to land on. The curtain has no wall to stack against on that side either.",
        doing: "Accepted; nothing can be done. The architrave runs one side only, and the curtain becomes a single curtain gathering to the left rather than a pair.",
        need: "",
      },
      {
        id: "floor-border", name: "The floor border may already carry the taper", status: "open",
        what: "The white marble border runs parallel to the walls and is already laid. In a tapering room either the border strip changes width end to end, or it stays constant and the taupe field changes instead.",
        effect: "Whichever it did is permanent. If the joinery then makes the opposite choice, the two will contradict each other and both become visible.",
        doing: "Nothing yet — the joinery should repeat whatever the floor already did, not fight it.",
        need: "Measure the border width at the study end and at the bed end and compare.",
      },
      {
        id: "light-temp", name: "The lighting is specified at the wrong temperature", status: "open",
        what: "Cove and focus lights are both specified at 4000K neutral white, in a room finished in warm teak, cream and parchment.",
        effect: "4000K pulls the red out of teak and leaves the grain slightly grey-green, and turns parchment clinical. On its own it looks clean, because the eye adapts within a minute — it only shows against warm wood and after dark.",
        doing: "Nothing bought yet, so it is still free to change. 2700K for the room, 3000K at the very most, CRI 90 or better on every fitting, everything dimmable.",
        need: "Hold a 4000K and a 2700K lamp against a teak offcut after dark, and decide from that.",
      },
      {
        id: "sourcing", name: "Nobody has been found to build any of it", status: "open",
        what: "No carpenter, no veneer supplier, no source for the parchment. The master veneer, grain, polish and tone are all still unchosen, and every piece of joinery in the room inherits them.",
        effect: "Nothing can be quoted, ordered or started. This blocks more of the room than any measurement does.",
        doing: "One visit to a veneer and polish supplier settles veneer, grain, polish and tone together, picked by eye off the catalogue.",
        need: "A supplier, and an afternoon.",
      },
    ],
  },

  room: {
    plan: "assets/refs/room-plan-lighting-rcp.jpg",   // source: photo of the lighting / false-ceiling plan
    facts: [
      { k: "Plan", v: "Measured: 14 ft 11 in wide at the study wall, 15 ft 0 in at the partition, 15 ft 6 in at the bed wall. About 18 ft 11 in long. Not square — it widens roughly 2 in end to end." },
      { k: "Ceiling height", v: "9 ft 1 in (2769), level throughout" },
      { k: "Study end", v: "Top of the plan: study wall with shelves and cupboards; window at its right-hand end" },
      { k: "Desk", v: "Faces the partition; the study wall is behind the chair" },
      { k: "Partition", v: "Across the room, curved ends: 8 ft from the study wall (11 ft from the bed wall), 8 ft wide, set 2 ft 11 in off the right wall. Its material is still open." },
      { k: "Bed end", v: "Bottom of the plan: a 6 ft × 6 ft bed against the wall, an 8 ft curved bed back wrapping round it with a ledge each side" },
      { k: "Entrance", v: "At the very end of the left wall, hinged on the bed-wall corner so it opens flat along the bed wall. The left wall steps out about 5 in just before it." },
      { k: "Beyond right wall", v: "Washroom and dressing (plan to come)" },
      { k: "Ceiling", v: "Plain, deliberately — a coffered grid would have shown up the splay. The barrel vault belongs to the dressing room." },
      { k: "Doors", v: "3 — one design, two widths, all 7 ft 7 in tall. D1 is 3 ft, D2 and D3 are 2 ft 6 in." },
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
          drawings: ["doorveneer", "door", "door-narrow"],
          refs: [
            { src: "assets/refs/door-ref-1.jpg", caption: "Reference — pair of panelled doors in a library (film still)" },
            { src: "assets/refs/door-ref-1-crop.jpg", caption: "Close-up — shaped bead, corner roundels, knob on lock rail" },
          ],
          parts: [
            { label: "Design", value: "Four-panel leaf after the reference: tall upper panel and short lower panel, each with a sunk ovolo-moulded field, a carved shaped bead (concave shoulders rising to a rounded crown at head and foot) and four carved corner roundels. Lock rail carries knob and keyhole." },
            { label: "How it is actually made", value: "AST-DR-015. The doors are veneered blockboard, not solid timber, and a veneer face is 0.6 mm thick — a sunk panel field or a carved boss cuts straight through it into the core. So nothing is cut INTO the leaf. The face stays flat and veneered and every line is a moulding planted on top, mitred at the corners, with a small applied block where each carved roundel was. AST-DR-001 and -009 remain as the solid-timber scheme; AST-DR-015 is the one to build from." },
            { label: "Construction", value: "38 blockboard core, solid teak lipping 12 wide on all four edges so hinges and lock go into wood, veneer both faces and balanced so the leaf does not bow — 45 overall. Applied moulding 45 wide standing 18 proud; corner blocks 58 square standing 22 proud, both in solid teak polished to match." },
            { label: "Lines shared across widths", value: "Both widths take the same horizontal lines, set off the 2 ft 6 leaf where the panel square works, so the three doors line up with each other on a wall. Only the panel width changes. Taking two panel squares off the 3 ft leaf would make its upper panel so tall the two frames overlap." },
            { label: "Veneer", inherit: "veneer" },
            { label: "Polish", inherit: "polish" },
            { label: "Hardware", value: "", hint: "Handles, hinges, lock, finish (brass / antique brass / nickel)" },
            { label: "Size", value: "Two widths, one design, all three the same height. Measured 7 ft 7 in tall (2311). D1, the main door, is 3 ft wide (914). D2 and D3 — dressing and bathroom — are 2 ft 6 in (762). Thickness to confirm." },
            { label: "How the widths differ", value: "The stiles stay 100 and every rail and moulding stays the same, so the extra width goes entirely into the panels: 562 wide on D2 and D3 against 257 on a D1 leaf. That is why there are two sheets — the details A, B and C serve both, but the elevations cannot." },
          ],
          questions: [
            "Single leaf or a pair? The reference is a pair of narrow leaves.",
            "Wall thickness at each door (for the frame and architrave)?",
            "Leaf thickness — 35, 40 or 45 mm?",
            "Knob height: the reference proportions put it at ~765 mm from floor; a normal height is 900–1000 mm (makes the lower panel taller).",
            "Are the roundels carved into the panel, or applied brass / wooden bosses?",
            "Is the shaped line a carved groove, or a raised applied moulding?",
            "Knob and hinge finish — ebonised wood, antique brass, or polished brass?",
            "Is D1 a single 3 ft leaf or a pair of narrow leaves? It is drawn as a pair, after the reference.",
          ],
        },
        {
          id: "moulding", name: "Door Moulding / Architrave", status: "open",
          drawings: ["architrave", "casingb"],
          refs: [
            { src: "assets/refs/moulding-ref-1-brownstone-doorway.jpg", caption: "The reference — brownstone doorway: reeded jambs, carved corbels, scallop course, crown mitred back at each end" },
            { src: "assets/refs/moulding-ref-2-brownstone-head-detail.jpg", caption: "Close-up of the head — the corbel's palmette, chevrons and knot; the same casing painted, on the right" },
          ],
          parts: [
            { label: "Casing", value: "The frame is 2 in on the face; the moulding adds 4 in outside it, so the casing is 6 in all round. Crucially the moulding sits 6 in ABOVE the leaf rather than on top of it — the lining comes first, the moulding stacks clear of it. The jambs are reeded and the reeding turns the corner over the head in one piece. Above the moulding, and only above it: a course of scallops, two small mouldings, and a crown that mitres back at each end. No corbels. The crown lands at 8 ft 8 in, leaving 5 in of wall to the ceiling." },
            { label: "Blocks", value: "A plinth block takes each jamb down to the floor, so the casing meets the marble skirting square instead of scribing over it. No blocks at the head." },
            { label: "Two options for the head — DRESSING DOOR ONLY", value: "A — AST-DR-011: the corner is closed with a square block, a small moulding sunk inside it, and nothing is carved. Crown at 8 ft 8 in, 5 in to the ceiling. B — AST-DR-012: each corner carries a carved corbel and the architrave, scallops and frieze die into it, as the reference. Crown at 8 ft 9 in, 4 in to the ceiling. Everything below the corbels is identical in both. The main and bathroom doors have less wall to give and will take a plainer head — to come." },
            { label: "What is carved in B", value: "One corbel design serves all three doors: a palmette of five lobes with a curl at each side under a small cap, eleven chevrons on a central spine down a tapering panel, and a shield knot woven through a lozenge at the foot. It stands 14 proud of the casing on the wall side, with a serpentine edge." },
            { label: "Veneer / Paint", inherit: "veneer" },
            { label: "Polish", inherit: "polish" },
          ],
          questions: [
            "Option A (square corner blocks) or option B (carved corbels) for the dressing door?",
            "The main and bathroom doors take a plainer head — what should it be?",
          ],
        },
      ],
    },
    {
      id: "study", title: "Study", kicker: "Desk & study wall",
      intro: "",
      items: [
        {
          id: "desk", name: "Desk", status: "open",
          drawings: ["desk", "desk-details", "desk-3d", "desk-simple", "desk-simple-details", "desk-simple-3d"],
          refs: [
            { src: "assets/refs/desk-ref-1.jpg", caption: "Reference — Tommy Shelby's desk, Peaky Blinders (screen photo)" },
            { src: "assets/refs/desk-ref-1-detail.jpg", caption: "Close-up — reeded top edge, frieze drawer, swan-neck handles, fluted corner blocks" },
          ],
          parts: [
            { label: "Two versions", value: "AST-DR-002/3/4 is the desk as designed. AST-DR-016/17/18 is the same desk simplified, for a carpenter who does not carve. Same size, same carcase, same mouldings — only the two carved passages are reduced. Pick one; everything else on the sheets is identical." },
            { label: "What the simplified one changes", value: "The husk drop down the kneehole stile becomes three plain husks with three reeds run out below, instead of twelve veined husks with beads between them. The pedestal ornament keeps its gadrooned boss and ring pull but loses the acanthus scrolls and the ribbon bow. Hollowed corners, the edge moulding, the reeded rail, the console brackets and the plinth are untouched — the mouldings are all still there." },
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
            { label: "Cupboards", value: "Under all three bays (bookcase, centre panel, window): 2 ft 3 in (686) high to the top — set by the window sill, so the counter and the sill are one surface — 280 (11 in) deep from the wall including the 25 overhang, two doors per bay with a moulded frame and raised field, brass drop handles. Each bay has its own reeded 40 mm top matching the desk, dying into the pilasters." },
            { label: "Centre panel", value: "Bolection-moulded frame with a raised field; painting (drawn 700 × 900) optional, with a picture light." },
            { label: "Window side", value: "The window is hard into the right-hand corner, so the architrave and panelled reveal can only run down its left side — there is no wall left on the right for a return. The band panel runs above it and the cornice carries across, so the wall still reads as one piece. Counter top and sill are level at 686." },
            { label: "Wood", inherit: "wood" },
            { label: "Polish", inherit: "polish" },
            { label: "Dimensions", value: "Wall 14 ft 11 in (4547), ceiling 9 ft 1 in (2769). The unit comes 11 in (280) off the wall; pilasters stand 40 proud of it, pedestals 50 proud of the counter. Bays are set out from the window: bookcase 1489, pilaster 240, centre panel 1289, pilaster 240, window bay 1289 — the centre panel is set equal to the window bay so the two pilasters frame a matched pair." },
            { label: "Window", value: "Measured: 4 ft wide (1219) by 5 ft 5 in tall (1651). Sill 2 ft 3 in (686) from the floor to the underside of the frame, head at 2337, leaving about 1 ft 5 in of wall above it to the 9 ft 1 in ceiling. Hard into the right-hand corner — no return on that side." },
          ],
          questions: [
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
            { label: "How it draws", value: "A single curtain, gathering to the left only. The window is hard into the right-hand corner, so there is no wall on that side for a curtain to stack on — a pair would sit over the glass permanently." },
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
          id: "left-wall", name: "Left Wall", status: "open",
          drawings: ["leftwall"],
          parts: [
            { label: "Treatment", value: "Deliberately plain. Paint, the marble skirting, one painting and the air conditioner over it — nothing built in, nothing panelled. It is the quiet side opposite the panelled right wall, and it is the wall that carries the splay and the step, so anything fitted to it would have to be scribed twice." },
            { label: "What sits here", value: "One painting, centred on the 15 ft 1 in of wall before the step — the only uninterrupted run — on a centre line 7 ft 6½ in from the study corner. The air conditioner sits above it. The entrance door takes the last 3 ft, hinged on the bed-wall corner so it opens flat along the bed wall." },
            { label: "Open — sizes", value: "The painting is drawn 4 ft 6 in × 5 ft — 4 in wider than the air conditioner on each side — with its bottom edge 1 ft 10 in off the floor; its real size is still to come. The air conditioner is 3 ft 10 in × 1 ft, MEASURED; its depth and height off the ceiling are assumed. That leaves 8⅝ in of clear wall between the frame and the unit." },
            { label: "Services", value: "The air conditioner needs a power point and a drain run before the wall is painted. Decide which side the pipework leaves on." },
            { label: "Veneer", inherit: "veneer" },
            { label: "Polish", inherit: "polish" },
          ],
          questions: [
            "Size of the painting, and the height you want its centre at?",
            "Make and size of the air-conditioner unit?",
            "Which side does the AC pipework run out on?",
          ],
        },
        {
          id: "right-wall", name: "Right Wall", status: "final",
          drawings: ["rightwall"],
          refs: [
            { src: "assets/refs/rightwall-iter-1-rail-2ft3.jpg", caption: "Iteration 1 — SELECTED. Rail at 2 ft 3 in, the study counter carried round the corner so one line runs round both walls. This is what AST-DR-007 draws." },
            { src: "assets/refs/rightwall-iter-2-rail-2ft10.jpg", caption: "Iteration 2 — rail lifted to 2 ft 10 in to meet the door's lock rail. Better panels, but the study counter then arrives at the corner 6¾ in lower. Not taken." },
            { src: "assets/refs/rightwall-iter-3-no-rail-one-panel.jpg", caption: "Iteration 3 — rail deleted and the two panels merged into one, floor to casing crown. Calm, but the wall loses its base and the sconces float. Not taken." },
            { src: "assets/refs/rightwall-iter-4-adopted.jpg", caption: "Iteration 4 — no rail; two panels split on the door's own lock rail, so the band runs through the door. Drawn and considered, not taken — without the rail the wall felt unfinished." },
            { src: "assets/refs/right-wall-panelling.svg", caption: "Earlier study — options A–D for the bay rhythm. C chosen: 5 panels, lamps in panels 1, 3 and 5" },
            { src: "assets/refs/walls-ref-1-panel-moulding.jpg", caption: "Ref. — painted panel moulding, cove light at the ceiling" },
          ],
          parts: [
            { label: "Treatment", value: "Applied panel moulding painted the wall colour. Short panels below a dado rail, tall panels above, 150 stiles between. SELECTED after four schemes: the rail is the study counter band carried round the corner at 2 ft 3 in, so one line runs round both walls. It dies into the door casing — accepted as the price of the continuous line." },
            { label: "Length", value: "13 ft 6 in from the study wall corner to the door frame, then the 2 ft 6 in door, then 2 ft 9 in of wall to the dressing corner — 18 ft 11 in overall" },
            { label: "Skirting", value: "White marble, 4 in (102) high, already laid — square with a small top chamfer; the panel moulding starts above it." },
            { label: "Setting out", value: "Measured along the wall: 13 ft 6 in from the study wall corner to the door frame, 3 ft of door frame end to end (2 ft 6 in leaf), then a 2 ft 4 in return to the corner. Overall 18 ft 11 in. Panelling starts clear of the study unit — its 11 in return, then a 6 in gap, then the first panel." },
            { label: "Heights", value: "Ceiling 9 ft 1 in (2769). Marble skirting 4 in · short panels 8⅜ in to 1 ft 9½ in · rail 2 ft 1½ in to 2 ft 3 in, the study counter band carried round unbroken · tall panels 2 ft 7⅜ in to 8 ft 7½ in, level with the crown of the door casing · sconces at 4 ft 2¾ in · no crown moulding — the cove light is in the ceiling" },
            { label: "Panels", value: "Option C: 5 equal panels about 24 in (606) wide on the long run, short and tall on the same centres, plus one narrow 345 panel on the 2 ft wall past the door" },
            { label: "Mouldings", value: "Panel moulding 55 × 24 ogee, mitred · rail 40 × 28 with the same 4 reeds as the study counter edge — painted the wall colour · marble skirting below" },
            { label: "Door", value: "Dressing door 2 ft 6 in × 7 ft 7 in (measured). Casing 6 in all round — 2 in frame plus 4 in moulding — so 1068 (3 ft 6 in) overall and the head at 8 ft 1 in. Opens inward, hinged on the right; rail and skirting stop at it" },
            { label: "Lamps", value: "3 twin-arm wall lamps, brass with fabric shades, centred inside tall panels 1, 3 and 5 at 1290 — the same height as the study sconces" },
            { label: "Lighting", value: "No crown moulding on this wall — the ceiling cove light runs above it, on the room's cove dimmer" },
          ],
          questions: ["Exact length to the dressing door"],
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
          drawings: ["bed"],
          refs: [
            { src: "assets/refs/bed-ref-1-low-platform-bed.jpg", caption: "Bed reference (Newberry Projects) — low bed with a thick upholstered base, wide wooden side ledge as a bedside table, aged metal-leaf panels behind" },
          ],
          parts: [
            { label: "Reference", value: "Low, deep bed with a thick fabric-covered base and cushion; a wide plank-like wooden ledge runs out beside it as the bedside table; behind, a framed screen of aged copper/metal-leaf panels." },
            { label: "Design", value: "", hint: "Frame, legs, storage (hydraulic / drawers / none)" },
            { label: "Veneer", inherit: "veneer" },
            { label: "Polish", inherit: "polish" },
            { label: "Size", value: "6 ft × 6 ft, measured, centred on an 8 ft bed back — so the back shows 1 ft either side of it. The base and mattress heights are still assumed until the mattress is chosen." },
            { label: "Bed back", value: "The partition's shape brought to the bed wall: a straight run behind the bed and a tight curl at each end turning 2 ft forward into the room, with a bedside ledge inside each curl. 8 ft overall and set on exactly the same two lines as the partition." },
            { label: "Setting out", value: "Both the bed and the partition moved 6 in to the right, so each sits 2 ft 11 in off the right wall. At the bed wall: the entrance door opens flat over the first 3 ft, then 1 ft 7 in clear, then the 8 ft bed back, then 2 ft 11 in. Either side of the bed: 5 ft 4 in and 3 ft 8 in. The partition line is 8 ft from the study wall, which is 11 ft from the bed wall, leaving 3 ft 9 in of walkway at the foot of the bed." },
            { label: "Open — the ledges", value: "The 6 ft bed leaves 1 ft of bed back either side, so the ledges come to about 9⅜ in wide by 1 ft 4½ in deep. Enough for a lamp, a book and a glass; still not a chest of drawers. Widening the bed back would break its line with the partition." },
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
          drawings: ["partitionglass", "bed"],
          model3d: true,
          parts: [
            { label: "Where it sits", value: "ACROSS the room: set out from the right wall, the straight one — 2 ft 11 in from it, then 8 ft of partition, leaving about 4 ft 1 in on the left. Moved 6 in right so the bed's curled back clears the entrance door, and on the same two lines as the bed back. ALONG the room: 11 ft from the bed wall, so 8 ft from the study wall. That leaves 3 ft 9 in of walkway at the foot of the bed and 8 ft for the desk end. See AST-DR-013." },
            { label: "Thickness", value: "Drawn 2⅜ in. Taking it to your 6 in maximum costs under 2 in at the foot of the bed — the walkway goes from 3 ft 9 in to 3 ft 7 in — so thickness is not the constraint here. Decide it on how the leading and the frame want to be made, not on space." },
            { label: "Size", value: "About 8 ft across the room, floor to ceiling at 9 ft 1 in. Both ends turn 55° towards the bed on a 664 radius, coming 283 (about 11 in) into the room. Developed length 2625 — about 8 ft 7 in. Gaps of about 3½ ft and 2½ ft at the ends, still to be measured against the room width." },
            { label: "Material", value: "Leaded glass, not wood. White textured glass in lead came, no colour." },
            { label: "Composition", value: "One design across the whole wall rather than a panel repeated. An outer rectangle 150 in from every edge and an inner one 420 in at the sides and 460 at head and foot, joined by a short bar at the middle of each side, with a cross at each corner of the inner rectangle. The border runs straight through the bay joints." },
            { label: "The border", value: "All the leading is in the border ring between the two rectangles — short bars dividing it into panes, a second line running through it, and a cross at each corner of the inner rectangle and at the middle of each side. The field inside stays one clear sheet." },
            { label: "The curve", value: "Every bay is flat. The came at each joint takes the angle, so no glass is bent — the end bays turn about 32° each." },
            { label: "Television", value: "55 in (1227 × 690), centred. Shown for position only — how it is carried and how the cable reaches it is not designed yet." },
            { label: "Drawers", value: "", hint: "The parchment drawers have nowhere to live in an all-glass wall — drop them, or bring back a solid base" },
          ],
          questions: [
            "Measure the partition run and both end gaps against the room width",
            "Does the television stay centred, or sit higher for viewing from the bed?",
            "Structure: slim blackened steel at the bay joints, as the wardrobe reference?",
          ],
        },
      ],
    },
    {
      id: "dressing", title: "Dressing", kicker: "Wardrobes · mirror",
      intro: "",
      items: [
        {
          id: "dressing-shape", name: "Room & Layout", status: "open",
          drawings: ["dressingshell"], dressing3d: true,
          parts: [
            { label: "Doorway", value: "From the bedroom: the 9 ft 3 in wall is the common wall between the two rooms." },
            { label: "Bathroom door", value: "2 ft 6 in wide, on the left — corrected from an earlier read of 2 ft 3 in. Matches D2/D3 from the main room's door schedule (2 ft 6 in, 7 ft 7 in tall)." },
            { label: "Wardrobe walls", value: "Left and right walls take the wardrobes (3 ft wide × 2 ft 4 in deep each — see Wardrobes below); the dressing mirror faces them from the wall in between." },
            { label: "The tunnel", value: "At the far right-hand corner: a full-height cupboard door, built and shelved exactly like the wardrobe doors on the same 2 ft 4 in depth, that is really a hidden door — push it and it swings open onto a tunnel about 7 ft 8 in long and 3 ft 6 in wide. From the room it reads as one more cupboard; nobody would guess there is a tunnel behind it." },
            { label: "Ceiling", value: "9 ft 1 in, plain, on the left and right sides — the same height as the main room. A domed / barrel-vaulted centre rises to 10 ft 0 in. Because the sides are plain, the wardrobes (against the left and right walls) sit clear of the dome and can go up to 9 ft 0 in." },
          ],
          questions: [
            "Where does the 7 ft 8 in tunnel lead, and what is it for?",
            "The sketch also carries about 9 ft 8 in and 12 ft 4 in on two other walls — which walls are these, and what are the room's overall width and length?",
            "The dome's own shape: how far along the room it runs, and its profile (circular, segmental) — the 3D model shows it schematically as a flat 9 ft 1 in ceiling for now, not yet the true curve.",
          ],
        },
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
            { label: "Dimensions", value: "Two runs, left wall and right wall: 3 ft wide × 2 ft 4 in deep each, up to 9 ft 0 in tall — the ceiling is plain on both these walls (9 ft 1 in; the dome is over the middle of the room and does not reach them). The right-hand run ends at the hidden tunnel door (see Room & Layout) — same 2 ft 4 in depth, so it reads as one more door in the run." },
          ],
          questions: [
            "How many doors per run, and how much hanging vs drawers behind them?",
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
            { label: "Placement", value: "In the middle of the dressing room, on the wall facing the two wardrobe runs.", hint: "Free-standing or fixed to the floor still open" },
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
          id: "vanity", name: "Vanity", status: "open",
          drawings: ["vanity", "vanity-b", "vanity-c", "vanity-drawer"],
          parts: [
            { label: "Size", value: "5 ft long, 2 ft deep, 33 in to the top of the marble (1524 × 610 × 838). It stands 6 in clear of the floor on a support set back under the middle." },
            { label: "The problem", value: "The faucet was plumbed 6 in right of centre, for a marble shelf on the left that is no longer wanted. The bowl has to sit under the faucet, so something has to make that position look deliberate." },
            { label: "Three schemes", value: "Normal (AST-DR-019): marble the full 5 ft, a door at each end, the bowl 6 in off centre. B (AST-DR-020): a 1 ft veneer cupboard on the left and 4 ft of marble centred on the faucet. C (AST-DR-021): 1 ft 6 on the left, 6 in on the right and 3 ft of marble, also centred. Taking width off one end moves the marble's centre by half of it — so the two ends must differ by exactly 1 ft, and equal ends change nothing." },
            { label: "Drawers", value: "Two small drawers over one big one, under the marble, with a door at each end. In B and C the top pair split on the faucet line, so the waste drops between them and only the big drawer is notched round the trap (a U-box). In the normal version the pipe comes down through the right-hand top drawer too." },
            { label: "The drawer within", value: "The big drawer hides a second, shallower drawer at the top of the opening, on its own runners fixed to the cabinet (AST-DR-022). Open the big drawer and the inner one stays put; pull it and it slides out behind the big front, over the bottles — like the tray in a kitchen pan drawer. The big drawer\'s sides stop low so it can pass beneath. The inner one is a U-box too, so the pipe clears it; its front has a finger scoop in the top edge. Below it, 255 mm clear for tall bottles." },
            { label: "Basin & tap", value: "A vessel bowl sitting on the marble, and a wall spout — drawn Ø16 in × 5 in, both assumed. On a 33 in counter the bowl's rim is at 38 in: stand at that height once before the marble is cut." },
            { label: "Counter", value: "The beige-gold bathroom marble: an 18 slab on a 20 BWP sub-top, with a mitred 38 apron so the front reads 1½ in, oversailing the carcass 1 in." },
            { label: "Carcass & fronts", value: "Teak veneer on 18 BWP / marine ply, every edge sealed; solid teak lipping on the fronts. Hung on a ply cleat on the wall. Undermount runners, push-to-open on the drawers." },
            { label: "Fittings", value: "Chrome — already bought. Brass and gold were priced out for the bathroom, so this is the one place in the room that breaks from the brass rule. Cup pulls on the doors only — the drawers have no handles and open with a push." },
            { label: "Support", value: "", hint: "The block under the middle — its design comes from reference photos, still to send" },
            { label: "A concept, parked for later", value: "A seamless push-to-open niche in the marble top: press a point on the plain surface and a section (about an inch deep) recesses to reveal hidden storage — phone, hand towels. Not being worked on yet." },
            { label: "Mirror", value: "" },
          ],
          questions: ["Which scheme — normal, B or C?", "The support under the middle: send the reference photos.", "Bowl and spout — the actual sizes, so the drawing stops assuming them."],
        },
        {
          id: "fittings", name: "Fittings & Fixtures", status: "brief",
          parts: [
            { label: "Status", value: "Everything else in the bathroom is done — floor, niche, walls, ceiling. Only the vanity, the shower glass enclosure, the WC and the bathtub position are left." },
            { label: "Shower", value: "", hint: "Glass enclosure — size and where it stands" },
            { label: "WC", value: "", hint: "Position" },
            { label: "Bathtub", value: "", hint: "Where it goes" },
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
      "The lighting/RCP photo on the Overview is out of date — the plan has changed since it was taken (drawn up months ago). Treat it as a starting point only, to be rechecked before anything here is treated as final.",
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
