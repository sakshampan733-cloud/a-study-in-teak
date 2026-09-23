# Redesign brief — Ciridae, to the last pixel

Gathered 23.09.2026, ahead of the redesign. Everything we have, and what's still missing.

## The reference

- **Site:** https://www.ciridae.com — "Ciridae — AI Transformation"
- **Refero style extract:** https://styles.refero.design/style/a1b78a21-a304-482b-8ce5-f612d95d44fe
- **Your source files** (still in ~/Downloads, copies here in `design/`):
  `DESIGN-4.md` → `design-system.md`, `tokens-4.json` → `tokens.json`,
  `variables-4.css` → `variables.css`, `theme-4.css`
- **The bar** the first pass was judged against: `design/bar.md` (7 checkable rules)
- **Fresh captures of the live site:** `design/ref-ciridae/` — 49 frames at 1440 × 900,
  recorded in Chrome with the video playing (kept on this Mac, not in git)

## Where the first pass stopped (17.09)

Design loop, 4 rounds, paused. Brief checks passed for navigation and room pages;
system and craft critics still failing on every piece (`design/progress.js`).
What shipped: void palette, condensed type, ghost pills, rust accent, blur-in loader,
decode headings, card-stack, expanding row, menu overlay. What was substituted:
**every moving image was replaced by a blurred still**, because we had nothing to make video with.

## The page, section by section (live, 23.09)

| # | Section | What moves | What we need |
|---|---|---|---|
| 0 | Hero — mark + wordmark, two edge labels, CTA line | **Background video** `hero_web.mp4`, 1600 × 850, 8.3 s loop, muted: slow, heavily defocused shapes in warm copper and cold blue-grey | **Higgsfield:** an 8 s seamless loop of the room — teak, brass sconce glow, lamplight — out of focus, drifting |
| — | Loader (0–2.6 s) | Mark + wordmark blur into focus on black (~0.9 s); edge labels decode letter by letter; video fades up behind by ~2.6 s | Code — already built, retune timings |
| 1 | "Backed by" — light Bone strip, three logos | Static | Code |
| 2 | "AI transformation" headline over a **WebGL2 canvas** | The mark rendered as chrome stars with a soft glow and a mirrored reflection below; slow shimmer | **Code (WebGL)** or a **Higgsfield** render of our mark in brass |
| 3 | Pinned full-bleed night landscape (mountain lake, star field, shooting star) with three frosted cards rising and stacking over it, each with its own star-constellation glyph | Scroll-pinned stack; glyphs | **Higgsfield:** one atmospheric backdrop of ours, same mood. Glyphs are code |
| 4 | "A new era" — centred prose on black | Decode on enter | Code |
| 5 | "Systems, not tools" — expanding card row, 4 cards | Hovered card grows to ~2× over 0.6 s | **Higgsfield:** four rich macro textures in their style (theirs: marbled fluid, dark forest, cloud, copper). Ours: teak grain, veined marble, leaded glass, brass |
| 6 | "Our team" — light Bone section, logo marquee | Marquee scroll | Code |
| 7 | Testimonials — charcoal cards, 1 / 6 carousel | Slide | Code |
| — | Menu | Full-screen charcoal overlay; links decode in | Code — built |

## The Higgsfield shopping list

1. **Hero loop** — 8 s, seamless, 16:9 or wider, generated from our own reference photos, then defocused.
2. **Pinned backdrop** — one still or slow video: the room's mood at night.
3. **Four textures** for the expanding row.
4. *(optional)* **The mark in brass** — if we render it rather than build it in WebGL.

Everything else is code and doesn't need credits.

## Still open before we start

- Which of our pages map onto which Ciridae sections (the overview is the obvious home page).
- The fonts: Ciridae's are paid; we used Barlow Condensed / Inter / Roboto Mono. Buy the real ones, or keep the substitutes?
