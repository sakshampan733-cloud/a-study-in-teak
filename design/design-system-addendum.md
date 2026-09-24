# Design-system addendum — where the live site overrides the extract

`design-system.md` is a Refero extract of ciridae.com taken months ago. The owner's gold standard is the
live site itself. Where the two disagree, the **live site wins**, measured with Chrome at 1440 × 900 and
390 × 844 (`design/ref-ciridae/measurements.json`, `measure-hero.json`, `spec-piece2.md`) or read from its
shipped CSS (`design/ref-ciridae/site/ciridae.com/index.html`). Known conflicts:

| Extract says | Live site measures | Rule for this build |
|---|---|---|
| Nav pills set in Pragmatica Cond 14px; mono only in the news ticker | Nav pills are **Roboto Mono** 14px uppercase, −0.28px | Nav, eyebrows and data labels in mono 14px |
| Hero flanking labels in Pragmatica Cond 14px | **Pragmatica** (the wide grotesk) **16px** uppercase, −0.02em | Flank labels grotesk 16px |
| Hero CTA not specified | Pragmatica 16px uppercase, three 16px lines on a **27px pitch** | Same |
| A top news bar in Abyss #050505 on every page | **No news bar** on the live site | None |
| Wordmark in Pragmatica Cond 32px | The wordmark is a heavy **logotype** drawn in SVG, not type | Ours is type (no logotype exists): condensed, weight 400, sized to the reference's block |
| Constellation mark in thin strokes | The live mark has **filled four-point stars** joined by thin strokes | Filled stars + hairline arcs |
| Only 1440px pills and 10px cards; no other radius | The **phone** nav sits in a white-25% panel with a **4px** radius, 8 × 24 padding | 4px on that panel only |
| No glow or box-shadow anywhere | Pills **glow on hover**: `.btn:hover::before` — `outline: 3px solid`, `box-shadow: 0 0 20px 10px, inset 0 0 20px 10px` in currentColor, at opacity 0.12 (shipped CSS; `spec-piece2.md`) | That glow on pill hover only; nothing else casts a shadow |
| Substitute Pragmatica Cond with Oswald or Barlow Condensed; Pragmatica with Inter or Söhne | The owner chose free fonts. Candidates, including those four, were set beside the live faces rendered by the live page (`tools/node/fontcmp.js`); Roboto Condensed and Arimo matched width and letterform closest | Roboto Condensed for Pragmatica Cond, Arimo for Pragmatica, Roboto Mono for mono |
| Every control is a 1px ghost pill, "Menu" included | At **390px** the menu control is a bare 25px two-line burger, no border, no label (`design/ref-ciridae/phone-settled.png`) | Bare burger on phone only; pills at 768px and up |
| Element gaps on the spacing scale (16–20px) | The lockup is one SVG drawing (141 × 162.6); mark to wordmark is ≈ 28–29px **inside the drawing**, not a layout gap | The lockup keeps that proportion; the scale governs gaps between elements, not inside the lockup |

Everything else in `design-system.md` stands: the colours, weight 400 throughout, uppercase condensed
headlines at 32px, prose in grotesk sentence case, 10px cards, pill controls, no shadows or gradients.
