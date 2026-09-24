# Bar — ciridae.com, to the pixel, for A Study in Teak

Gold standard, saved locally: `design/ref-ciridae/site/` (every file the browser loads, incl. the hero
video), `ciridae.mhtml`, `full-page.png`, section frames, and the first-load recorded at 33 fps
(`load-ciridae/load.mp4`). Numbers below are read from their source (`_site-*.js`, the motion runtime)
and measured off the live page at 1440 × 900. Every line is checkable on a render or a filmstrip.
Last round's bar is kept as `bar-round1.md`.

1. **The entrance, to the millisecond.** Black `#0b0b0b` and nothing else for the first 225 ms. The mark
   fades 0→1 over 0.75 s from 0.225 s while its blur runs 20 px→0 over 1.65 s, so it is fully sharp at
   ~1.9 s. The five hero texts (wordmark, two edge labels, the CTA's lines) scramble in A–Z letter by
   letter — 0.3 s per character, 7.5 ms stagger, left→right, fading in as they resolve — the first 0.2 s
   after the mark starts, each next 0.1 s later. The background video starts at 1.875 s; a curtain
   lifts over 0.6 s (power1) and the nav fades in with it. Entrance complete ≈ 3.2 s.
   *Filmstrip check:* 300 ms black · 900 ms a soft blurred mark · 1.9 s sharp mark, text resolving ·
   3.2 s video full-bleed, nav present.

2. **Void, one flip.** Page `#0b0b0b`; panels `#272a2a` at 10 px radius; exactly one Bone `#edebe7`
   full-width band per page. No box-shadow, glow or gradient fill anywhere — the only softening is
   backdrop blur: 40–50 px on the footer, a frosted veil on the stacked cards.

3. **Three registers, one weight.** Everything is weight 400. Headlines: condensed uppercase, 32 px,
   line-height 1.05, −0.02 em. Hero labels and CTA: grotesk uppercase 16 px, −0.02 em. Eyebrows, nav and
   data: mono uppercase 14 px, −0.02 em; card numbers mono 11 px. Prose: grotesk 14 px / 1.4, sentence
   case, ≤ 50 ch. Nothing larger than 32 px except the hero wordmark.

4. **Nav is two labels in outlines.** Fixed, text baseline ~31 px from the top, 67 px in from each edge:
   left action, right `MENU`, 14 px mono uppercase inside 1 px pill outlines, transparent fill. `MENU`
   opens a full-screen `#272a2a` overlay with the links in large condensed uppercase, centred.

5. **Moving media, never a static hero.** The hero is a full-bleed looping video: heavily defocused,
   warm-against-cool light, no hard edge and no recognisable object, ~8 s, seamless. Mark + wordmark
   dead centre; two 16 px labels pinned to the far left and far right at the vertical centre; a
   three-line CTA centred ~120 px above the bottom. Section imagery is dark and atmospheric — never a
   thumbnail grid.

6. **Text decodes, sections rise, scroll glides.** Every eyebrow and headline scrambles into place as it
   enters view (0.3 s per character, 10–20 ms stagger, left→right). Section media: content yPercent
   50→0 (expo.in), image scale 1.4→1 with yPercent −20→0 (power1). Default tween 0.4 s power2. Scroll
   is inertial (lerp-smoothed), never native-jumpy.

7. **The set pieces.** One scroll-pinned full-bleed backdrop with numbered frosted cards rising and
   stacking over it; one row of cards where the hovered card grows to ~2× width over 0.6 s; one Bone
   band with a logo/marquee strip; a footer under 40–50 px backdrop blur.

## Accepted deltas — a critic must not fail on these

- **Content is ours.** Room names, copy, drawings, photos: from `data.js`, never theirs.
- **Media is ours.** Every video and image is generated for this room (Higgsfield). Match their
  *treatment* — blur level, grade, pacing, motion — never their pixels.
- **Typefaces**, until decided: Pragmatica / Pragmatica Cond are licensed commercial faces. Until the
  owner buys them, the closest free substitutes stand in; judge metrics (size, tracking, case, weight),
  not letterforms.
