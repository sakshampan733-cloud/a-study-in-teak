# Bar — Ciridae (ciridae.com), recreated for A Study in Teak

Reference: https://www.ciridae.com · Refero extract: design/design-system.md
Every line is checkable by looking at a render (screenshot or filmstrip).

1. **Void, one flip.** Canvas is #0b0b0b; cards/panels #272a2a with 10px radius; exactly one Bone (#edebe7) full-width section per page; no box-shadow, glow or gradient fill anywhere.
2. **Three registers, one weight.** Labels and headlines are condensed UPPERCASE at 14 / 20 / 32px (weight 400, −0.02em); prose is a grotesk at 15–24px sentence case; monospace 11–14px UPPERCASE appears only for system data (dates, codes, sizes, statuses, the top ticker). Nothing is heavier than 400.
3. **Ghost pills and one ember.** Every control is transparent with a 1px border and full pill radius; numbered markers are "01"-style mono pills with a #cecece border. Ember #cc6437 appears as hairline or small text only — never a fill — at most twice per viewport.
4. **Centred eyebrow → headline.** Each section opens with a centred 14px eyebrow above a 32px headline, with ≥80px vertical space between sections; content is centred inside a 1400px max width.
5. **Ambient imagery.** The hero is a full-viewport, heavily blurred photo (≥40px blur) with a centred mark + wordmark and two 14px labels pinned to the far left and far right edges; section/card photos are dark and atmospheric behind centred type, never illustrative thumbnails in a grid.
6. **Motion vocabulary.** Load begins with the mark blurring into focus on black; labels and headlines decode (random characters resolving left→right in ~600ms) as they enter view; all transitions use cubic-bezier(0.76, 0, 0.24, 1) at 400–800ms; a card row expands the hovered card to ~2× width over 600ms.
7. **Stacks and overlays.** At least one scroll section pins a full-bleed image while numbered cards stack over it; navigation is two fixed ghost pills (left action, right MENU) and MENU opens a full-screen #272a2a overlay with large condensed links.
