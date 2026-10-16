# design-system.md — A Study in Teak, monopo saigon system

Source: Refero's monopo saigon DESIGN.md, **corrected to the live site** where they differ (the live site is
dark: black canvas below the hero; DESIGN.md describes white). Where this file and DESIGN.md disagree, this
file wins. The system critic judges objective adherence to this file only.

## Colour
| Token | Value | Use |
|---|---|---|
| `--ink` (canvas) | `#000000` | page background everywhere below the hero, and the hero's base |
| `--paper` | `#ffffff` | primary text, active nav, labels, cursor dot |
| `--mist` | `#9a9a9a` | project titles, secondary text, inactive nav and switch (changed in round 1: `--felt` was unreadable over the field — brief critic) |
| `--felt` | `#6d6d6d` | tag lines, addresses, helper text |
| `--slate` | `#5a5a5a` | whisper statements before they brighten |
| `--ghost` | `#262626` | footer display line ("Keep in touch") |
| `--hair` | `rgba(255,255,255,.3)` | pill borders, hairlines |
| `--iris` | `linear-gradient(90deg, rgb(160,224,171), rgb(255,172,46) 50%, rgb(165,45,37))` | hero field + exactly one text line + its underline. Never a UI fill. |

No other hues. No shadows, no glows on UI.

## Type
- One family for everything: **Hanken Grotesk** (free, self-hosted; closest free match to Roobert), weights
  300 / 400 / 600, plus italic 400 for the one-italic-letter signature. System UI only for 9px fine print.
- Scale (px / weight / line-height): label 11 / 600 / 1.2 · nav 11 / 400 / 1.2, uppercase · tag 11 / 400 / 1.3 ·
  body 16 / 400 / 1.5 · title 18 / 400 / 1.2 · hero 54 / 400 / 1.39 · statement 78 / 300 / 1.4 (measured on the reference's manifesto: 110px line pitch; corrected before piece 2) ·
  anchor 94 / 400 / 0.76 · giant 225 / 400 / 1.0.
- Wordmark (a logotype, outside the scale): 16px, "a study" at 600 tracked .05em, "in teak" at 400 (round 2: the reference's own wordmark is a heavier logotype; DESIGN.md lists 16px and 600).
- Never weight ≥ 600 above 45px. Body copy is never centred (the hero phrase — and the loader phrase, which is its first state — are the only centred text; round 2).

## Space & layout
- 4px base. Column: 1078px centred (180px margins at 1440; 24px gutters on phones).
- Section rhythm: 152px between sections on desktop, 64px on phones. Element gap 14px.
- Two-column staggered grid: columns ~506px, gutter 64px, right column offset +130px.

## Shape
- Radius **0** for everything except pills (buttons, tags, chips) = **75px**. Nothing between.
- Pill: transparent, 1px `--hair` border, 11px × 33px padding, 16px text.

## Chrome
- Fixed wordmark top-left, language/secondary switch centre-right, vertical uppercase nav stack top-right.
  No bar, no background. Rotating circular "scroll down" badge bottom-left of the hero. White-dot cursor
  (pointer devices only).
- Section opener: `→ Label` at 11px/600 white, flush left.

## Motion
- Ease: `cubic-bezier(0.19, 1, 0.22, 1)`; durations 0.8s (colour/opacity) and 1.25s (transforms); plain `ease`
  0.4s for micro colour changes. Inertial smooth scroll (Lenis). Reveals: translateY + opacity.
- Hero: live liquid field + grain; phrase cycle every ~3s with blur-fade; loader before it.
- Respect `prefers-reduced-motion`: field freezes, cycle stops on the first phrase, reveals are instant.

## Imagery
- Our renders and drawings, full-bleed inside their frame, 0px radius, no overlays, dimmed to ~70% until hover.
- Drawings (white sheets) are shown as they are — they are the one large light surface allowed below the hero.
