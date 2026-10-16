# bar.md — monopo saigon (monopo.vn), as measured 16 Oct 2026

Measured from the live site at 1440 × 900 (headless captures), cross-checked with Refero's DESIGN.md.
Every line is checkable by looking at a rendered screen.

1. **One coloured thing per page, and it is light, not paint.** The hero is a full-viewport liquid field —
   sage `rgb(160,224,171)` → amber `rgb(255,172,46)` → oxblood `rgb(165,45,37)` swirling on black, under visible
   film grain, with one glass sphere refracting it — and it melts to pure black at the hero's bottom edge.
   Below that the page is `#000` to the footer: every word, rule and label is white or a grey. The only other
   colour anywhere is the same gradient run through one line of text (the footer email) and its underline.

2. **The hero says one short phrase, small, dead centre, and keeps changing it.** One line, ~54px, weight 400,
   white, centred on the viewport — no subhead, no button. It cycles through 3–4 phrases every ~3s, each one
   blurring/fading out and the next fading in. One letter per phrase is set in italic (Un*i*ted, sa*i*gon,
   Creat*i*ve stud*i*o). It is preceded by a loader: the same phrase-style word ("hello saigon") over a dark,
   barely-lit version of the field.

3. **Fixed, tiny, three-point chrome; content on a 1078px column.** Wordmark top-left, language switch at
   centre-right, the nav as a *vertical stack* of five uppercase links top-right (~11px, grey, active white) —
   all fixed, no bar, no background, no shadow. Everything else aligns to one centred 1078px column (180px
   margins at 1440). A rotating circular "SCROLL DOWN · SCROLL DOWN" badge sits bottom-left of the hero; the
   cursor is a small white dot that trails the pointer.

4. **Every section opens with an arrow-label, then lets the content be big.** Each block starts with
   "→ Label" (≈11px, semibold, white) flush left on the column, then one of three things: a two-column
   *staggered* grid of tall portrait images (right column starts ~130px lower than the left, ~506px wide each,
   gutter ~64px, 0px corners, images dimmed until hovered); a whisper-weight statement in grey at ~78–94px that
   brightens line by line as it scrolls in; or one giant ~225px line that runs off the edge ("Discover Saigon").

5. **Captions are quiet and below, never on top.** Under each image: title ~18px regular grey (#9a9a9a-ish),
   then a ~11px comma-separated tag line in darker grey. No overlays, no cards, no borders, no hover lift.
   The footer repeats the mood: "Keep in touch" at ~78px in near-black grey (#2a2a2a on #000), a small grey
   label, the gradient email, then a four-column grid of office addresses (small grey headings ~18px,
   11–12px grey lines).

6. **Corners are 0 or a full pill — nothing in between.** Images, cards, sections, inputs: 0px. Buttons and
   tags: 75px pill, 1px border (white at 30% on dark), transparent fill. No shadows anywhere.

7. **Motion is slow and always eases out.** Inertial smooth scroll; reveals slide up/fade over 0.8–1.25s on
   `cubic-bezier(0.19, 1, 0.22, 1)`; images ease from dim to full on hover; nothing snaps, bounces, or appears
   in under ~0.4s. The grain is always alive and the liquid field never stops moving.

## What "winning" means here
Put our home page and the monopo home page side by side at 1440 × 900, labels hidden. A stranger should not be
able to say which one is the studio site from the chrome, type, colour, rhythm or motion — only from the
content (our room, not their clients).
