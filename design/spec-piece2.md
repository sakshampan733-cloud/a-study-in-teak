# Piece 2 — navigation and motion, read from the reference's code

Source: `design/ref-ciridae/site/` (index.html CSS, `marketingMotionRuntime-*.js`, `useMarketingRouteHead-*.js`,
`MarketingShell-*.js`). Easing everywhere: `--smooth: cubic-bezier(.76, 0, .24, 1)`.

## Smooth scroll
- `new Lenis({ duration: 1.4, smoothWheel: true, wheelMultiplier: 1.6 })`, wired to `ScrollTrigger.update`.
- Stopped while the menu is open (`body.burger-open`), restarted on close.

## Nav bar (`.nav_body`)
- Grid of two columns, padding 8 × 24, 4 px radius.
- Frosted: `background: color-mix(in srgb, currentColor, transparent 75%)` (white 25%) + `backdrop-filter: blur(20px)`.
- Desktop (≥ 992 px): **at the top** it is transparent with no blur. **Scrolling down** it slides away
  (`translateY(-140%)`). **Scrolling up** it returns, frosted. Transform 0.8 s smooth; colour/bg/blur 0.4 s.
- Phone/tablet: frosted even at the top.
- Over light (Bone) sections the nav turns black (`.is--dark`).

## Pills (`.btn`, `.nav_burger`)
- 1 px border, full radius, min-width 140, padding 10 × 18, label shifted `translateY(7%)`.
- **Hover is a glow, not a fill:** a `::before` with `outline: 3px solid`, `box-shadow: 0 0 20px 10px, inset 0 0 20px 10px`
  (currentColor) fading to opacity 0.12 over 0.2 s.
- Labels re-scramble on hover, lowercase `abcdefghijklmnopqrstuvwxyz`.

## Menu (`.burger`)
- Full-screen fixed overlay, `#272a2a`, z 9. Opens: opacity 0→1 over 0.8 s smooth; closes over 0.6 s.
- Content: small mark at top, links centred in a column (40 px, weight 400, line-height 1, gap 10 px),
  a footer row at the bottom (three columns).
- Links fade in 0.6 s each, staggered `delay = 0.2 s + i × 0.1 s`; the footer row fades in at 0.4 s.
- Hovering a link: the others dim to 70%; the hovered one gets a blurred (10 px) ghost copy at 30%.
- Burger button: `MENU` swaps to `CLOSE`; the two 25 px lines rotate ±45° and shrink to 50% width
  (0.6 s smooth); the button's border fades out; the left pill fades and disables.
- Escape closes; focus moves to the first link on open and back to the button on close.
