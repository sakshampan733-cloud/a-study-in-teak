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
    veneer: { value: "Royal Oak (lot OHBF-624) — its pattern, not its raw colour", status: "final", options: ["Royal Oak (grain) stained to Dark Diva Crown (colour)"],
              rule: "CONFIRMED by the owner: the grain of Royal Oak — tight, straight, quarter-cut, almost no figure — finished with a dark stain to reach the colour of Dark Diva Crown (lot OHBF-607), not oak's own pale honey tone. Covers the three main doors (dressing, bathroom, third), the wardrobe, and the study shelf — one veneer, one tone, one polish, as the room's own rule requires.",
              refs: [
                { src: "assets/refs/veneer-royal-oak-OHBF-624.jpg", caption: "Royal Oak, lot OHBF-624 — the grain and pattern to use (raw colour shown is not the target)" },
                { src: "assets/refs/veneer-dark-diva-crown-OHBF-607-color-target.jpg", caption: "Dark Diva Crown, lot OHBF-607 — the colour to stain Royal Oak toward, not its own pattern" },
              ] },
    grain:  { value: "Quarter cut / straight", status: "final", options: ["Crown cut", "Quarter cut / straight", "Book-matched", "Slip-matched"], rule: "Royal Oak's own grain — tight and quiet, chosen specifically because Dark Diva Crown's crown-cut pattern was too busy." },
    polish: { value: "Satin to semi-gloss PU", status: "final", options: ["Matte PU", "Satin PU", "High-gloss PU", "Melamine", "Hand-rubbed / French polish"], rule: "Must match the solid teak desk." },
    tone:   { value: "Dark stained — to Dark Diva Crown's colour", status: "final", options: ["Natural", "Warm / honeyed", "Dark stained"], rule: "Must match the solid teak desk." },
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
      { k: "30 · Quiet surfaces", v: "Warm cream painted walls and mouldings, the parchment bed wall, parchment drawer fronts, the wardrobes' lit interior lining, and the bed's leather if it is wrapped rather than wood." },
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
            check: "The partition's ends curving towards the bed, the B-edge on the stone and the bullnose edges are all this rule already working. It can be pushed further: a rounded mirror, a curved chair back.",
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
      { k: "Partition", v: "Across the room, 11 ft from the bed wall: a floor-to-ceiling wall of hand-cast glass blocks, about 7 ft 9 in across, its ends turning gently towards the bed, a foot-wide Dark Diva column up the middle with the TV floating on it, and eight drawers along its bed side." },
      { k: "Bed end", v: "Bottom of the plan: a 6 ft bed on a 10 × 8 ft rug, against a straight bed back running the full 15 ft 6 in wall — its design still open" },
      { k: "Entrance", v: "At the very end of the left wall, hinged on the bed-wall corner so it opens flat along the bed wall. The left wall steps out about 5 in just before it." },
      { k: "Beyond right wall", v: "Washroom and dressing (plan to come)" },
      { k: "Ceiling", v: "Plain, deliberately — a coffered grid would have shown up the splay. The barrel vault belongs to the dressing room." },
      { k: "Doors", v: "3 — one design, two widths, all 7 ft 7 in tall. D1 is 3 ft, D2 and D3 are 2 ft 6 in." },
    ],
  },


  // Tabs. Each item is a spec sheet built from parts.
  // A part with inherit:"veneer" / "polish" pulls from the master unless overridden.
  // material swatches for the glance cards: a photo where we have one, a colour where we do not
  swatches: {
    oakGrain: { name: "Royal Oak grain", img: "assets/refs/veneer-royal-oak-OHBF-624.jpg", pos: "50% 80%", zoom: 4 },
    gloss: { name: "Polish, as the desk", img: "assets/refs/veneer-9292-polish-gloss-reference.jpg" },
    solidTeak: { name: "Solid teak", img: "assets/refs/desk-ref-1-detail.jpg", pos: "35% 45%", zoom: 3 },
    teak: { name: "Teak, dark stain", img: "assets/refs/veneer-dark-diva-crown-OHBF-607-color-target.jpg", pos: "22% 86%", zoom: 5 },
    burl: { name: "9292 cream burl", img: "assets/refs/veneer-9292-cream-burl.jpg" },
    taupeMarble: { name: "Taupe marble floor", img: "assets/refs/floor-ref-2-taupe-brown-marble-slab.jpg" },
    whiteMarble: { name: "White marble", img: "assets/refs/stone-ref-2-white-brown-border-skirting.jpg" },
    beigeMarble: { name: "Beige-gold marble", img: "assets/refs/stone-ref-3-beige-gold-bathroom-marble.jpg" },
    parchment: { name: "Parchment", img: "assets/refs/bedwall-ref-3-parchment-large-panels.jpg" },
    lining: { name: "Cream lining, lit", img: "assets/refs/wardrobe-ref-4-inside-finish-lit-niche.jpg" },
    blackLine: { name: "Black linework", img: "assets/refs/bathroom-ref-1b-painted-ceiling-detail.jpg" },
    cream: { name: "Warm cream paint", color: "#e7dcc6" },
    brass: { name: "Polished brass", color: "linear-gradient(135deg, #7d5f28, #e4c679 48%, #9a7833)" },
    chrome: { name: "Chrome", color: "linear-gradient(135deg, #8e9398, #f1f3f5 48%, #9ba0a5)" },
    iron: { name: "Black iron", color: "#1d1c1b" },
    linen: { name: "White sheer", color: "#f2eee6" },
    mirror: { name: "Silver mirror", color: "linear-gradient(135deg, #7f8a93, #dfe6eb 50%, #8a959e)" },
    bronze: { name: "Dark bronze", color: "#3b2f26" },
    glass: { name: "Backlit glass", color: "linear-gradient(180deg, #f6ecd6, #d9c9a8)" },
  },
  tabs: [
    {
      id: "doors", title: "Doors & Moulding", kicker: "Three doors, one design",
      intro: "All three doors are to look the same. Each door is the sum of three separate decisions — design, veneer and polish — plus the moulding around it.",
      items: [
        {
          id: "door", name: "Doors (×3)", status: "open",
          glance: {"line": "One four-panel teak door design, in two widths.", "facts": [["7 ft 7 in", "tall"], ["3 ft", "main door"], ["2 ft 6 in", "dressing & bath"], ["45 mm", "veneered blockboard"]], "mats": ["teak"]},
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
          glance: {"line": "A reeded 6 in casing with a crown above each door.", "facts": [["6 in", "casing, all round"], ["8 ft 8 in", "crown (option A)"], ["A / B", "plain block or carved corbel"]], "mats": ["teak", "whiteMarble"]},
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
          id: "desk", name: "Desk", status: "final",
          glance: {"line": "Tommy Shelby's double-pedestal desk, in solid teak — square corners, mouldings only, no carving, backed up to the glass.", "facts": [["7 ft 6 × 3 ft", "top"], ["750 mm", "high"], ["Plain", "square, no carving (AST-DR-031)"], ["2 in", "off the partition"]], "mats": ["teak", "brass"]},
          drawings: ["desk-plain", "desk-plain-details", "desk-plain-3d", "desk-square", "desk-square-details", "desk-square-3d", "desk", "desk-details", "desk-3d"],
          refs: [
            { src: "assets/refs/desk-ref-1.jpg", caption: "Reference — Tommy Shelby's desk, Peaky Blinders (screen photo)" },
            { src: "assets/refs/desk-ref-1-detail.jpg", caption: "Close-up — reeded top edge, frieze drawer, swan-neck handles, fluted corner blocks" },
          ],
          parts: [
            { label: "Chosen", value: "The PLAIN square desk, AST-DR-031/32/33 (owner, 2 Oct): square corners and no carving — the console brackets, the carved drops and the carved collars come off, because they cost more than they are worth, need a carver and a far finer drawing, and would not come out like the reference anyway. It keeps the mouldings: the reeded top edge and cove, the frieze and reeded rail all round, the square panel mouldings, cockbeaded drawers, a plain bead at each corner and the moulded plinth. The square desk with every carving (AST-DR-028) and the curved-corner desk (AST-DR-002) stay below for reference." },
            { label: "Placement", value: "Its back stands no more than 2 in off the glass partition — room for a monitor arm's clamp (owner) — with a 32 in OLED monitor on the arm. The curved-corner sheets are kept below for reference only." },
            { label: "Two versions", value: "AST-DR-002/3/4 is the desk as designed, with the R150 hollowed corners. AST-DR-028/29/30 is the same desk with SQUARE corners, because the carpenter cannot make the curves (owner, 30.09). Same size, same carcase, same carving and mouldings — only the corners change. The earlier simplified (carving-reduced) version is withdrawn." },
            { label: "What the square one changes", value: "Every layer — the top with its reeded edge, the cove, the frieze, the reeded rail, the pedestals and the plinth — turns a plain 90° corner, mitred, instead of the R150 hollow. The corner moulding (fillet + bead + fillet), its two carved collars, the carved drop and the console above it stay, one on each face, standing just in from the corner so the two consoles clear each other. Everything else is identical: carving, drawers, handles, fielded doors, ornament, ring pulls." },
            { label: "Type", value: "Double-pedestal (kneehole) writing desk, George III / Victorian English style" },
            { label: "Construction", value: "Solid wood" },
            { label: "Wood type", inherit: "wood" },
            { label: "Top", value: "Thick top with a multi-reeded edge moulding (3–4 parallel reeds) and a slight overhang. Plain teak writing surface — no leather inset." },
            { label: "Frieze", value: "Row of frieze drawers across the front under the top — long centre drawer over the kneehole, one over each pedestal. No handles and no keyholes on these (owner, 30.09) — the band is too thin for them; they open with a push. Reeded / cock-beaded rail under the drawers." },
            { label: "Corners", value: "Designed version: all four outer corners are hollowed INWARD with a large sweeping curve: R150 on the top, and every layer below (cove, frieze, pedestal, plinth) is a parallel curve struck from the same centre. Each end of each curve is softened with a R12 round — no sharp arrises. The middle of the hollow is left clean. Square version (AST-DR-028): plain mitred 90° corners throughout." },
            { label: "Corner mouldings", value: "At BOTH ends of every curve — where the round starts on the front face and on the side face — a terminating moulding (fillet + bead + fillet, 26 wide, 12 proud) runs the pedestal height: plinth block at the foot, two carved teak collars, a carved drop down the bead, and a reeded console bracket above it under the top." },
            { label: "Pedestals", value: "CONFIRMED by the owner (30.09): three drawers in each pedestal — six in all — graduated, shallowest at the top (fronts about 5½, 6¼ and 7⅛ in high), with 18 rails between them. Cockbeaded fronts, a brass swan-neck handle and a keyhole on every one. About 11¾ in wide in the curved desk, 1 ft 5⅛ in in the square-cornered one (its outer stile is narrower). Inner stiles keep the carved drop under a reeded console. See detail 5 on both details sheets." },
            { label: "Base", value: "Moulded plinth under each pedestal — to confirm (plinth vs bun feet vs castors)." },
            { label: "Hardware", value: "Polished brass swan-neck bail handles with round rosette posts on the six pedestal drawers. The three frieze drawers have none — push-to-open." },
            { label: "Finish", value: "Rich red-brown, high gloss (French-polish look). This finish sets the polish for the whole room." },
            { label: "Dimensions", value: "2286 L × 914 D × 750 H (7 ft 6 in × 3 ft; height set for a 5 ft 9 in user, 620 mm knee clearance)" },
          ],
          questions: [
            "Size: how much space do you have? Reference proportions suggest roughly 1800 L × 900 D × 760 H — your room may need smaller.",
            "Is it placed against a wall or free-standing (front, back and sides all finished)?",
            "Carvings: full carving like the reference (drops, ribbon ornaments, fluted blocks), or a simplified version? Carved in teak, or brass mounts?",
            "Colour: the reference is a red-brown gloss. Teak stained to that, or teak's natural golden-brown?",
            "Cable management, a hidden drawer for a laptop / charger, or locks on any drawers?",
          ],
        },
        {
          id: "shelf", name: "Study Wall — Bookcase, Panelled Centre, Window", status: "open",
          glance: {"line": "A full-height teak study wall: bookcase, panel, window.", "facts": [["14 ft 11 in", "wide"], ["2 ft 3 in", "counter = window sill"], ["11 in", "deep"], ["2", "fluted pilasters"]], "mats": ["teak"]},
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
          glance: {"line": "One white sheer curtain, gathered to the left.", "facts": [["1", "curtain, left side only"], ["White", "light-filtering"], ["Iron", "volute tieback"]], "mats": ["linen", "iron"]},
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
          glance: {"line": "Kept plain on purpose: paint, one painting, the AC.", "facts": [["4 ft 6 × 5 ft", "painting (as drawn)"], ["3 ft 10 × 1 ft", "air conditioner, measured"], ["0", "built-ins"]], "mats": ["cream", "whiteMarble"], "img": "assets/refs/paint-ref-1-warm-cream-room-sheer-curtains.jpg"},
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
          glance: {"line": "Painted panel moulding with three brass wall lamps.", "facts": [["5", "tall panels"], ["2 ft 3 in", "rail = study counter"], ["3", "twin-arm lamps"], ["4 in", "white marble skirting"]], "mats": ["cream", "whiteMarble", "brass"]},
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
            { label: "Length", value: "The door is a 2 ft 3 in leaf in a 2 in frame each side — 2 ft 7 in frame to frame — and it sits 2 ft 4 in from the dressing corner, taped on both sides of the wall. That 2 ft 4 in governs. Against the measured 18 ft 11 in overall it puts the frame 14 ft 0 in from the study wall corner, which is 6 in off the 13 ft 6 in taped from that end — so the 13 ft 6 in is the reading to retake. An earlier 2 ft 9 in to the corner had been back-calculated and was wrong." },
            { label: "Skirting", value: "White marble, 4 in (102) high, already laid — square with a small top chamfer; the panel moulding starts above it." },
            { label: "Setting out", value: "Measured along the wall: 2 ft 4 in from the dressing corner back to the door frame, 2 ft 7 in of frame end to end (2 ft 3 in leaf, 2 in frame each side), on the measured 18 ft 11 in overall. The 13 ft 6 in once taped from the study corner does not fit that chain — it wants to be 14 ft 0 in — so retape it before anything is cut. Panelling starts clear of the study unit — its 11 in return, then a 6 in gap, then the first panel." },
            { label: "Heights", value: "Ceiling 9 ft 1 in (2769). Marble skirting 4 in · short panels 8⅜ in to 1 ft 9½ in · rail 2 ft 1½ in to 2 ft 3 in, the study counter band carried round unbroken · tall panels 2 ft 7⅜ in to 8 ft 7½ in, level with the crown of the door casing · sconces at 4 ft 2¾ in · no crown moulding — the cove light is in the ceiling" },
            { label: "Panels", value: "Option C: 5 equal panels about 24 in (612) wide on the long run, short and tall on the same centres, plus one narrow 434 panel on the wall past the door" },
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
          id: "tv-unit", name: "TV Unit / Drawers", status: "final",
          glance: {"line": "Eight drawers along the whole partition, the TV floating above.", "facts": [["4 × 2", "drawers, 600 wide"], ["450 mm", "high"], ["400 mm", "deep"], ["9292", "burl, Dark Diva colour"]], "mats": ["burl", "brass"]},
          refs: [
            { src: "assets/refs/veneer-9292-cream-burl.jpg", caption: "Sample 9292 — the burl's figure, re-tinted to the Dark Diva colour for the drawers" },
          ],
          parts: [
            { label: "What it is", value: "DECIDED (owner, 1 Oct): a low run of drawers along the whole length of the glass-block partition, on the bed side — four drawers across, two high, eight in all. The two end drawers curve with the partition's ends." },
            { label: "Size", value: "Each drawer 600 wide (four glass blocks, so the joints between drawers meet the glass joints). 450 high overall — kept low, as asked — on a recessed dark plinth; 400 deep, leaving about 2 ft 9 in to the foot of the bed. Height and depth are drawn, not yet confirmed." },
            { label: "Veneer", value: "The 9292 burl's figure, re-tinted to match the Dark Diva colour (owner: \"the colour should match the Dark Diva, with the pattern of the veneer\"), in the same satin polish as the Dark Diva so the two read as one wood." },
            { label: "Handles", value: "A slim brass bar on each drawer." },
            { label: "TV", value: "The 55 in TV floats on the partition above the drawers — see Partition." },
            { label: "Open — opening the end drawers", value: "The two curved end drawers cannot slide straight out as drawn. For now it is the look; how they open is to be worked out." },
          ],
          questions: ["How the curved end drawers open."],
        },
        {
          id: "bed", name: "Bed", status: "open",
          glance: {"line": "The low dark-wood platform bed from the owner's photo, with a slim upholstered headboard, in the bed-wall niche.", "facts": [["6 × 6½ ft", "mattress"], ["Turned", "bun feet"], ["3 ft 4", "headboard top"], ["10 × 8 ft", "rug"]], "mats": ["burl", "teak"]},
          drawings: ["bedframe"],
          refs: [
            { src: "assets/refs/bedwall-ref-6-plaster-grid-bed.jpg", caption: "Your ref (3 Oct) — THIS bed: low dark-wood platform on turned feet, slim upholstered headboard (owner: the same exact bed and headboard)" },
            { src: "assets/refs/bed-ref-1-low-platform-bed.jpg", caption: "Bed reference (Newberry Projects) — low bed with a thick upholstered base" },
          ],
          parts: [
            { label: "The bed (owner, 3 Oct)", value: "The same exact bed and headboard as in the owner's photo: a low dark-wood platform — a 4 in rail with a 1 in lip on turned bun feet — and a slim, plain upholstered headboard the frame's width, standing in the bed-wall niche. Drawn on AST-DR-035, sized to the 6 ft × 6 ft 6 in mattress; mattress thickness still to choose. No headboard (owner, later on 3 Oct): a long white cushion along the back, in a cream textured weave, leaning on the parchment." },
            { label: "Bed back (before)", value: "Superseded by the niche and headboard (3 Oct). DECIDED (owner, 1 Oct): NOT curved. A plain, straight bed back running corner to corner across the whole 15 ft 6 in bed wall. Its height (the owner said \"about 4\" — to confirm whether inches or feet) and what it is made of are still open. The curled bed back with a ledge at each end, and the sheet AST-DR-013 that draws it, are withdrawn." },
            { label: "Bedside tables", value: "The curled ledges went with the curved bed back. Nothing is drawn either side of the bed for now." },
            { label: "Size", value: "6 ft × 6 ft 6 in, centred on the room's bed axis. Base and mattress heights assumed until the mattress is chosen." },
            { label: "Rug", value: "A 10 × 8 ft wool rug under the lower two-thirds of the bed, about 2 ft proud of the foot and of each side (owner: \"your choice\"). Shown as oatmeal with a tobacco border in the walk-through." },
            { label: "Veneer", inherit: "veneer" },
            { label: "Polish", inherit: "polish" },
          ],
          questions: ["The bed back: height (4 in or 4 ft?) and what it is.", "The bed itself: frame, legs, storage."],
        },
        {
          id: "headboard", name: "Bed Wall", status: "open",
          glance: {"line": "A Dark Diva wall with a 16 in niche behind the bed and its tables, lined in parchment plaster.", "facts": [["16 in", "niche, 6 ft 6 high"], ["6 in", "cove, sides and top"], ["3 in", "the rest of the wall"], ["5 × 3", "parchment plaster panels"]], "mats": ["parchment"]},
          drawings: ["bedwall"],
          refs: [
            { src: "assets/refs/bedwall-ref-6-plaster-grid-bed.jpg", caption: "Your ref (3 Oct) — parchment-plaster panels in a grid, in a niche behind a low bed with a slim upholstered headboard" },
            { src: "assets/refs/bedwall-sketch-owner.jpg", caption: "Your sketch (3 Oct) — plan: 10 in out behind the bed, easing to 3 in at the corners; front: wood all round, the parchment grid in the middle" },
            { src: "assets/refs/bedwall-ref-1-parchment-dressing-room.jpg", caption: "Your ref — tall parchment panels, pale and warm, fine joints, dark cornice line" },
            { src: "assets/refs/bedwall-ref-3-parchment-large-panels.jpg", caption: "Your ref — large parchment panels with soft cloudy tone, joints kept hairline" },
            { src: "assets/refs/bedwall-ref-4-parchment-fireplace-wall.jpg", caption: "Your ref — a whole wall in parchment squares around a fireplace" },
            { src: "assets/refs/bedwall-ref-2-parchment-entry-niche.jpg", caption: "Your ref — parchment niche with a dark stone skirting and a slim dark edge" },
          ],
          parts: [
            { label: "The idea (owner, 3 Oct)", value: "The whole bed wall is built out 3 in in Dark Diva veneer, polished darker. Round the niche that holds the bed and both side tables, the face sweeps forward in a concave 7 in cove — up both sides AND across the top (owner's second sketch, 3 Oct) — to 10 in at the niche's edge, with a 1 in flat edge. The niche is 10 in deep and 6 ft 6 in high (lowered), lined with parchment plaster in a grid (five across, three up — nearly square panels). Drawn on AST-DR-034 rev 2 — still the owner's to approve." },
            { label: "Later the same day (owner)", value: "The niche is as deep as the side tables — 16 in from the wall, about 15 in clear inside the plaster — so the 15 in tables stand right inside it and can't be seen from the door. The inside of the niche's frame (both sides and the soffit) is parchment plaster too. The side tables are all wood, no marble. No headboard: a long white cushion along the back instead, like the owner's photo." },
            { label: "Decided (owner, 3 Oct)", value: "Niche height 6 ft 6 in is good. The cove light stays in the ceiling — no other light on this wall except a brass twin-arm wall lamp over each side table, the same lamp as the right wall. The bed-back wall's Dark Diva polish a bit darker than the rest of the room; the bed itself in the room's tone. The niche keeps the old bed-back span (9 ft 4 in on the drawings), centred on the TV; the cove stops where the open door's leaf ends, so the door keeps its 3 ft." },
            { label: "Problems found", value: "1) The entrance door's hinge pin stands only 2 in off this wall, so a 3 in face there stops the door opening flat (it is the depth, not the 3 ft) — projecting (parliament) hinges, or 1½ in at that corner instead. 2) The bed comes 4½ in further out (headboard + frame), leaving 2 ft 5½ in to the TV drawers instead of 2 ft 9¾ in. 3) Lamp sockets and switches go through the plaster panels — their places needed first." },
            { label: "Direction", value: "Parchment on the wall behind the bed — pale, warm, cloudy tone like vellum." },
            { label: "Two ways to do it", value: "Real parchment / vellum panels (as in your references) — large sheets with hairline joints; or parchment-effect plaster in the same colour with no joints." },
            { label: "Panels or seamless", value: "Probably large panels — not decided yet." },
            { label: "Layout", value: "Symmetrical — the panels set out evenly about the centre of the bed." },
            { label: "Shade", value: "One even shade across every panel — no panel lighter or darker than the next." },
            { label: "Extent", value: "", hint: "Whole bed wall, floor to ceiling?" },
            { label: "Edges", value: "", hint: "Dark slim edge / stone skirting as in ref 2, or plain" },
          ],
          questions: ["The entrance corner: projecting hinges on the door, or 1½ in there instead of 3 in?", "Niche height (drawn 6 ft 6 in) and the panel grid (drawn 5 × 3)", "Skirting along the build-out and into the niche?"],
        },
        {
          id: "partition", name: "Partition", status: "final",
          glance: {"line": "A wall of hand-cast glass blocks with a foot-wide Dark Diva column; the TV floats on it.", "facts": [["Mano", "glass blocks, 140 × 140 × 95"], ["1 ft", "wood column, centre"], ["26°", "ends turn to the bed"], ["~7 ft 9", "across"]], "mats": ["glass", "teak", "burl"]},
          refs: [],
          parts: [
            { label: "What it is", value: "DECIDED (owner, 1 Oct): a floor-to-ceiling wall of Mano cast-glass blocks (Eco Outdoor, Tom Fereday — the Vetra block: 5½ in square, 3¾ in deep, solid hand-cast glass, 3/8 in joints) in dark joints, between the desk and the bed, on the old partition's centre line 11 ft off the bed wall." },
            { label: "The column", value: "One Dark Diva column a foot wide (two blocks, 290 mm of wood) runs floor to ceiling down the middle — the TV's power comes down it. The owner tried two columns and withdrew them: the power is central." },
            { label: "The TV", value: "A wood board (6 × 4 blocks, 890 × 590) is set into the glass on the column, smaller than the 55 in TV, so from the bed the TV floats on the glass with no wood border (owner: no border around the TV). TV centre about 1.05 m off the floor — assumed." },
            { label: "Shape", value: "The ends curve towards the bed only — none towards the desk. 16 blocks across: 8 straight in the middle, 4 curving at each end on a 1.3 m radius (each end turns 26° and comes 14 cm forward), about 7 ft 9 in across. 1.3 m is about the tightest a block this size takes; Eco Outdoor to confirm." },
            { label: "Below", value: "Eight drawers run its whole length on the bed side — see TV Unit / Drawers. On the desk side the desk stands 2 in off it." },
            { label: "Withdrawn", value: "Wood bands top and bottom with LED strips washing the glass (owner: the light does not look good), and twin columns. The earlier leaded-glass console design, its curved 55° end bays and the backlit-glass / burl options are all gone." },
            { label: "Weight", value: "Solid glass blocks are about 6 kg each — roughly 25 kg per sq ft, 1.5 tonnes or so for the wall. The floor slab needs a structural check." },
          ],
          questions: ["Structural check of the floor for the glass-block wall.", "Eco Outdoor's minimum radius for the curved ends."],
        },
      ],
    },
    {
      id: "dressing", title: "Dressing", kicker: "Wardrobes · mirror",
      intro: "",
      items: [
        {
          id: "dressing-shape", name: "Room & Layout", status: "open",
          glance: {"line": "Wardrobes both sides, a vaulted ceiling down the middle.", "facts": [["9 ft 3 × 12 ft 4", "room"], ["10 ft", "vault crown"], ["9 ft 1 in", "ceiling at the sides"], ["3 × 7 ft 8", "hidden tunnel"]], "mats": ["teak", "cream"]},
          drawings: ["dressingshell"],
          parts: [
            { label: "Doorway", value: "The 9 ft 3 in wall shared with the bedroom carries ONE door: D2, the existing door in from the bedroom (AST-DR-000), sitting 2 ft 4 in from the right-hand corner to its frame — measured on both sides of the wall. The bathroom door is not on this wall; it is in the LEFT wall. The mirror is on the far wall, 12 ft 4 in away." },
            { label: "Bathroom door", value: "D3 is in the LEFT wall, at the bedroom end — not in the bedroom wall, as two earlier passes had it. The sketch runs 9 ft 4 in of wall down from the far corner and then opens the door, with 12 ft 4 in over the whole wall, which leaves a 3 ft zone for it. The leaf itself is still not fixed." },
            { label: "Wardrobe walls", value: "Left and right walls take the wardrobes, 2 ft 3 in deep (see Wardrobes below). The right wall runs the full 12 ft 4 in; the left stops at the bathroom door after 9 ft 4 in. The mirror faces them from the far wall." },
            { label: "The tunnel", value: "The far bay of the right-hand run, hard against the far wall, is built and shelved exactly like every other bay on the same 2 ft 3 in depth — but it is really a hidden door. Push it and it opens on to a tunnel 3 ft wide and 7 ft 8 in long, running EAST straight out of the right wall, its far side flush with the far wall. From the room it reads as one more cupboard; nobody would guess there is a tunnel behind it." },
            { label: "Ceiling", value: "9 ft 1 in, plain, on the left and right sides — the same height as the main room. A domed / barrel-vaulted centre rises to 10 ft 0 in. Because the sides are plain, the wardrobes (against the left and right walls) sit clear of the dome and can go up to 9 ft 0 in." },
          ],
          questions: [
            "Where does the 7 ft 8 in tunnel lead, and what is it for?",
            "D3's exact position along the front wall, and D2's position on this sheet checked against AST-DR-000.",
            "The dome's own shape: how far along the room it runs, and its profile (circular, segmental).",
          ],
        },
        {
          id: "wardrobe", name: "Wardrobes", status: "open",
          glance: {"line": "Two teak runs, warm-lit and cream-lined inside. No glass.", "facts": [["7", "bays, 28 leaves"], ["9 ft", "tall"], ["2 ft 3 in", "deep"], ["535½ sq ft", "of lining"]], "mats": ["teak", "lining"]},
          refs: [
            { src: "assets/refs/wardrobe-ref-4-inside-finish-lit-niche.jpg", caption: "CONFIRMED — the owner's own reference for the inside finish: warm lit niche, cream/beige lining, dark wood surround" },
          ],
          parts: [
            { label: "SCRAPPED", value: "The glazed-glass door design is withdrawn at the owner's request — no glass wardrobe doors anywhere. That takes the whole earlier direction with it: the blackened-steel-look framing, the lead-came glass, the leading pattern options, the internal lighting behind glass, and the one-glass-bay idea. The doors are solid — plywood core, mica and veneer — finish to be picked from the two menus the owner has since chosen (not yet on this sheet)." },
            { label: "Inside finish", value: "CONFIRMED by the owner's own photo: a warm lit interior, cream/beige lining (suede or a matte fabric-texture laminate), against dark wood surrounds — the glow and the softness of the reference, not a literal shoe-shop fit-out. Light and matte so it stays even and calm, not glossy." },
            { label: "Dimensions", value: "Two runs, 2 ft 3 in deep and 9 ft 0 in tall — the ceiling is plain on both these walls (9 ft 1 in; the dome is over the middle and does not reach them). The 2 ft 3 in is what lets the right-hand run reach the bedroom wall: the door frame stands 2 ft 4 in off that corner, so the run clears it by 1 in. Each wall is divided into equal bays, so nothing is left over: the right wall is 12 ft 4 in over 4 bays, the left 9 ft 4 in over 3, both coming out at about 3 ft 1 in. Seven bays in all, 14 cupboards, 28 leaves — this layout stands; only the door finish changes. The far bay of the right run is the hidden tunnel door. See AST-DR-025." },
            { label: "Inside lining — area", value: "For ordering the lining (owner, 30.09): every cupboard except the tunnel bay — six in all, three on each wall. Each is lined on four sides, 8 ft 6 in high: two sides 2 ft 3 in deep and two 3 ft wide. Per cupboard: 2 × (2 ft 3 × 8 ft 6) = 38¼ sq ft, plus 2 × (3 ft × 8 ft 6) = 51 sq ft — 89¼ sq ft. Six cupboards: 535½ sq ft (49.8 m²). Measured on the drawn bays instead (left run about 3 ft 3¼ in wide, right run 3 ft 1 in) it comes to about 554 sq ft. Order about 610 sq ft to allow 10% for cutting. If the top and bottom of each cupboard are lined too, add 13½ sq ft a cupboard — 81 sq ft more." },
            { label: "End bays", value: "The bay at the back of each run — nearest the free-standing mirror — does not hinge open like the rest: a hinged leaf would swing about 1 ft 6½ in into the room, and the mirror leaves only 7½ in beside it. Both end bays (including the tunnel door) use Option C instead — fold out at the front end, then slide back into the cupboard — see End-Bay Doors below, with the video." },
          ],
          questions: [
            "The door finish, from the two menus the owner has chosen — not yet described here.",
            "How many doors per run, and how much hanging vs drawers behind them?",
          ],
        },
        {
          id: "end-bay-doors", name: "End-Bay Doors", status: "final",
          glance: {"line": "The end bays fold out, then slide back inside.", "facts": [["C", "chosen"], ["1 ft 6½ in", "folded depth"], ["Brass", "piano hinge"]], "mats": ["teak", "brass"]},
          video: { src: "assets/video/dressing-endbay-foldin.mp4", poster: "assets/video/dressing-endbay-foldin.jpg", caption: "Three ways, one after another. A — folds into the cupboard, parks at the mirror end. B — folds into the cupboard, parks at the front end. C — folds out like the owner's photo, then slides back into the cupboard. Each one plays its whole movement three times: from the doorway, looking into the bay, and from above. Red line = the front of the wardrobe." },
          parts: [
            { label: "Chosen", value: "OPTION C — CONFIRMED by the owner. The doors fold outward like the photo, then slide back into the cupboard. A and B stay in the video for reference." },
            { label: "What it does (A and B)", value: "Closed, it is an ordinary double door, the same as every other bay. To open, the pair folds INWARD at the centre joint — the triangle goes into the cupboard, never into the room — and the folded pair then pushes straight back along the side panel. Nothing ever passes the front of the wardrobe, so the free-standing mirror cannot be touched, whichever way it parks." },
            { label: "Centre hinge — where", value: "Between the two leaves, full height, on the INSIDE face (the cupboard side). Putting it on the inside is what makes the pair fold inward. From the room you only see a hairline joint down the middle, like the meeting line on every other bay." },
            { label: "Centre hinge — type", value: "One continuous piano hinge the full height of the leaf, in brass. A ply-and-veneer leaf this tall is still heavy; a continuous hinge carries the weight along its whole length and stops the pair twisting. (Four heavy concealed hinges would also work, but the piano hinge is stiffer.)" },
            { label: "Parking side", value: "The outer edge of the leaf on the side where it parks turns on a top and a bottom pivot pin. Both pins are fixed to a carriage, and the carriage runs in a runner screwed along that side panel — one at the top, one at the floor. While the door folds, it turns on the pins; once folded, the carriage rolls back along the runner, taking the folded pair with it." },
            { label: "Other side", value: "The outer edge of the other leaf has a guide roller at the top, running in a track along the front of the bay (the brass line along the front in the video), and a small guide at the floor. That keeps the free edge running straight along the front while the pair folds, so it can never swing out into the room." },
            { label: "How far back", value: "Folded, the pair is about 1 ft 6½ in deep and about 3 in thick. In the left end bay the cupboard is 2 ft 3 in deep, so it pushes back about 8 in and sits recessed inside. In the tunnel bay there is the tunnel behind, so it can slide right back out of sight." },
            { label: "Which way it parks", value: "A — at the MIRROR end. The clear opening is then on the front side, so you never reach round behind the mirror. B — at the FRONT end. Both keep clear of the mirror." },
            { label: "Option C", value: "Folds OUTWARD like the owner's photo, then slides back into the cupboard. The pair folds out into the room at the front end of the bay — so here the centre hinge goes on the OUTSIDE (room) face — and once folded, the carriage carries the pair straight back into the cupboard along the side panel, the same runner as A and B. Open, the bay is clear and the doors are tucked away inside. It crosses the front of the wardrobe only while folding, at the front end, well away from the mirror." },
            { label: "Inside the bay", value: "The parked pair takes about 3 in along the side it parks against. Stop the hanging rail about 4 in short of that side panel and everything else in the bay is unaffected." },
          ],
        },
        {
          id: "hidden-door", name: "The Hidden Door", status: "open",
          glance: {"line": "Shelves at the back of the last bay swing open to a tunnel.", "facts": [["Push", "touch latch, no handle"], ["2 ft 8 in", "door"], ["11¾ in", "door + shelves"], ["Floor pivot", "hinge"]], "mats": ["teak"]},
          video: { src: "assets/video/dressing-hidden-door.mp4", poster: "assets/video/dressing-hidden-door.jpg", caption: "The tunnel bay, start to finish, three times: from the room, looking into the tunnel, and from above. The Option C doors fold out and slide in; the shelves behind them are the hidden door." },
          parts: [
            { label: "What happens", value: "Open the tunnel bay like any other (Option C: fold out, slide in). What you see at the back is a set of shelves. That is the hidden door. Push it and it swings into the tunnel, on a hinge at its LEFT edge, and comes to rest flat against the tunnel's left wall — where its shelves line up with the shelves already fixed along that wall, so the run looks complete and the tunnel is open." },
            { label: "Hinge — where", value: "On the LEFT edge of the tunnel mouth, looking into the tunnel from the dressing room — the side the tunnel's own shelves are on. Vertical, full height." },
            { label: "Hinge — type", value: "A pivot hinge, not ordinary butt hinges: a pin set in the floor that carries the weight, and a matching pin at the top. A door carrying shelves is heavy, and loaded shelves heavier still; a floor pivot takes that load straight down so the door never sags or drags." },
            { label: "The catch", value: "No handle. A push-to-open touch latch on the RIGHT edge — push the shelves and the door releases. Closed, nothing gives it away." },
            { label: "Shelves", value: "10¼ in deep, on a 1½ in door — 11¾ in overall. The shelves on the door are at exactly the same heights and depth as the shelves on the tunnel's left wall, so once the door is open they read as one continuous run. Drawn as plain boards; their design is still open." },
            { label: "Clearing the wall", value: "Because the door is thick, its far corner swings on a bigger circle than the door is wide. Full width (2 ft 11¼ in) it would hit the tunnel's right wall by about 1 in. So the door is 2 ft 8 in wide, and a fixed 4 in upright fills the rest of the opening on the right — the door closes against it and the touch latch sits on it. Closed, it reads as one more shelf upright. The corner then clears the wall by 2 in all the way round its swing." },
            { label: "What it leaves", value: "Door plus shelves is 11¾ in deep. The tunnel is 3 ft wide, so about 2 ft stays clear to walk through — narrowing to about 1 ft 8 in for a moment at the mouth, past the fixed upright. The first 2 ft 8 in of the left wall, where the door lands, must stay empty — the tunnel's own shelves begin just after it." },
          ],
          questions: [
            "Shelf heights and design, inside the door and along the tunnel — the video only shows plain boards.",
          ],
        },
        {
          id: "dressing-mirror", name: "Dressing Mirror", status: "open",
          glance: {"line": "A free-standing, three-panel folding mirror.", "facts": [["9 ft", "tall"], ["3 ft 6 in", "wide, wings at 45°"], ["2 ft", "centre glass"], ["7½ in", "clear each side"]], "mats": ["mirror", "bronze"]},
          drawings: ["mirror"],
          refs: [
            { src: "assets/refs/dressing-mirror-ref-1-folding-screen.jpg", caption: "Chosen reference — free-standing three-panel mirror screen in slim dark bronze frames with cut top corners" },
          ],
          parts: [
            { label: "Design", value: "Free-standing folding mirror screen after the reference: three tall mirror panels hinged together — a wide centre panel with two narrower wings angled in so you see front and sides at once." },
            { label: "Frame", value: "Slim dark bronze / blackened metal frame round each panel, with the top outer corners cut on an angle (chamfered) and a stepped foot rail at the bottom." },
            { label: "Mirror", value: "Clear silver mirror, full height of each panel." },
            { label: "Placement", value: "Centred on the far wall, free-standing — CONFIRMED not fixed to either wardrobe run. 7½ in of floor either side of it, which clears the folding end-bay doors." },
            { label: "Size", value: "FINAL. Centre GLASS 2 ft 0 in (frame 2 ft 2½ in). The wings take everything the 3 ft 6 in frame has left at 45°: frame 10 in, glass about 7½ in each. 9 ft tall. Stands about 8 in off the wall. Bigger wings would need a slimmer frame (¾ in → about 9¼ in of glass) or a steeper angle (60° → about 11¼ in). See AST-DR-027." },
            { label: "Wing angle", value: "CONFIRMED 45°, turned forward towards you, on a fixed stop. Opened any flatter, the frame would get wider than 3 ft 6 in." },
            { label: "Hinges", value: "Two continuous piano hinges on the back of the frame, one at each joint, in the frame's own finish." },
            { label: "Finish", value: "", hint: "Frame finish to sit with the room's brass hardware — the wardrobes are no longer steel-framed, so this is open again" },
          ],
          questions: ["The frame finish — dark bronze, blackened steel, or something to match the door veneer once that is picked?"],
        },
      ],
    },
    {
      id: "bathroom", title: "Bathroom", kicker: "Vanity · painted ceiling",
      intro: "",
      items: [
        {
          id: "bath-ceiling", name: "Painted Ceiling", status: "open",
          glance: {"line": "Fine black linework painted on a light ceiling.", "facts": [["Done", "ceiling"], ["Black", "hand-painted lines"], ["Rosettes", "swags, border"]], "mats": ["blackLine"]},
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
          glance: {"line": "A marble bank to the floor, with burl pull-outs each side.", "facts": [["5 × 2 ft", "top"], ["33 in", "to the marble"], ["3 ft", "marble bank, centred on the tap"], ["C", "scheme chosen"]], "mats": ["beigeMarble", "burl", "chrome"]},
          drawings: ["vanity", "vanity-b", "vanity-c", "vanity-drawer"],
          refs: [
            { src: "assets/refs/veneer-9292-cream-burl.jpg", caption: "CONFIRMED veneer — sample 9292, the pale cream burl, same as the bedroom's tables and drawers" },
          ],
          parts: [
            { label: "Chosen", value: "SCHEME C — CONFIRMED by the owner (30.09): 1 ft 6 in on the left, 6 in on the right, and the 3 ft marble bank in the middle, centred on the faucet (AST-DR-021, revision 2). The other two schemes stay on the page for reference." },
            { label: "Size", value: "5 ft long, 2 ft deep, 33 in to the top of the marble (1524 × 610 × 838). The 3 ft marble bank in the middle runs all the way down to the FLOOR and carries the top — it is the support. The two ends are pull-out cabinets, 6 in off the floor, the same height as before." },
            { label: "The problem", value: "The faucet was plumbed 6 in right of centre, for a marble shelf on the left that is no longer wanted. The bowl has to sit under the faucet, so something has to make that position look deliberate." },
            { label: "Three schemes", value: "Normal (AST-DR-019): marble the full 5 ft, a door at each end, the bowl 6 in off centre. B (AST-DR-020): a 1 ft veneer cupboard on the left and 4 ft of marble centred on the faucet. C (AST-DR-021, CHOSEN): 1 ft 6 on the left, 6 in on the right and 3 ft of marble, also centred. Taking width off one end moves the marble's centre by half of it — so the two ends must differ by exactly 1 ft, and equal ends change nothing." },
            { label: "Drawers — scheme C", value: "Because the bank now reaches the floor, it uses the full 33 in: the top pair of drawers have 6½ in fronts (they were 5¾ in), the big drawer below them a 20½ in front, and the drawer within the big one a 5½ in box (it was 3 in). Under the inner drawer, 12¾ in stays clear for tall bottles. The ends are pull-out cabinets on heavy full-extension runners — not hinged doors." },
            { label: "Drawers", value: "Two small drawers over one big one, under the marble, with a door at each end. In B and C the top pair split on the faucet line, so the waste drops between them and only the big drawer is notched round the trap (a U-box). In the normal version the pipe comes down through the right-hand top drawer too." },
            { label: "The drawer within", value: "The big drawer hides a second, shallower drawer at the top of the opening, on its own runners fixed to the cabinet (AST-DR-022). Open the big drawer and the inner one stays put; pull it and it slides out behind the big front, over the bottles — like the tray in a kitchen pan drawer. The big drawer\'s sides stop low so it can pass beneath. The inner one is a U-box too, so the pipe clears it; its front has a finger scoop in the top edge. In scheme C its box is 5½ in deep, and below it 12¾ in (324 mm) stays clear for tall bottles." },
            { label: "Basin & tap", value: "A vessel bowl sitting on the marble, and a wall spout — drawn Ø16 in × 5 in, both assumed. On a 33 in counter the bowl's rim is at 38 in: stand at that height once before the marble is cut." },
            { label: "Counter", value: "The beige-gold bathroom marble: an 18 slab on a 20 BWP sub-top, with a mitred 38 apron so the front reads 1½ in, oversailing the carcass 1 in." },
            { label: "Marble front", value: "CONFIRMED by the owner (30.09): the middle bank's front — its face frame and every drawer front — is the beige marble (the third marble on the Materials page), floor to counter. It is NOT veneer. Veneer is only on the two end pull-outs and their ledges." },
            { label: "Ends — veneer", value: "CONFIRMED — sample 9292 (the pale cream burl, see reference — same as the bedroom's tables and drawers), in high gloss, on 18 BWP / marine ply, every edge sealed — a wet area, so the ply core stays moisture-resistant regardless of veneer. Solid teak lipping on the fronts. Hung on a ply cleat on the wall. Undermount runners, push-to-open on the drawers." },
            { label: "Fittings", value: "Chrome — already bought. Brass and gold were priced out for the bathroom, so this is the one place in the room that breaks from the brass rule. Cup pulls on the two end pull-outs only — the drawers have no handles and open with a push." },
            { label: "Support", value: "Not needed in scheme C — the marble bank stands on the floor and carries the top." },
            { label: "A concept, parked for later", value: "A seamless push-to-open niche in the marble top: press a point on the plain surface and a section (about an inch deep) recesses to reveal hidden storage — phone, hand towels. Not being worked on yet." },
            { label: "Mirror", value: "" },
          ],
          questions: ["The marble front: the owner is sending a reference photo; its thickness and how it is fixed to the drawer boxes are for the stone supplier.", "Bowl and spout — the actual sizes, so the drawing stops assuming them."],
        },
        {
          id: "fittings", name: "Fittings & Fixtures", status: "brief",
          glance: {"line": "Shower glass, WC and bath position still to decide.", "facts": [["Done", "floor, niche, walls"], ["3", "left: shower, WC, bath"]], "mats": ["beigeMarble", "chrome"], "img": "assets/refs/stone-ref-3-beige-gold-bathroom-marble.jpg"},
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
