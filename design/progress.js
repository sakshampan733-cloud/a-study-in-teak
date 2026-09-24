window.PROGRESS = `
<p><b>Round 2 of the loop</b> — from scratch in <code>v2/</code>, against the pixel-level bar (<code>design/bar.md</code>). Fonts: free stand-ins (Roboto Condensed · Arimo · Roboto Mono). Higgsfield ≈ 133 credits left.</p>
<table><tr><th>Piece</th><th>Status</th><th>Brief</th><th>System</th><th>Craft</th><th>Latest</th></tr>
<tr><td>1 · Entrance + hero</td><td>review round 4</td>
<td class="pending">R1 ✗ · R2 — · R3 … · R4 …</td><td class="pending">R1 ✗ · R2 ✗ · R3 ✗ · R4 …</td><td class="pending">R1 ✗ · R2 ✗ · R3 ✗ · R4 …</td>
<td>Every entrance event within ~±100 ms of the reference; 16/16 parallel loads clean; fails open if a script is missing. Lockup 141×163 = reference block. Hero v3: three generated takes at three angles — 63% dark (ref 67), mean 22.7 (24.2), flat top→bottom, shadows (11,15,18) vs (10,15,19).</td></tr>
<tr><td>2 · Nav + motion</td><td>built, unreviewed</td><td class="pending">—</td><td class="pending">—</td><td class="pending">—</td>
<td>Menu (11 sections from data.js, 0.2 s + 0.1 s stagger, MENU↔CLOSE, Escape, focus), nav clear at top / hides scrolling down / returns frosted, pill glow, hover scramble, heading decode, Lenis at the reference's settings.</td></tr>
<tr><td>3 · Home page</td><td class="pending">media ready</td><td class="pending">—</td><td class="pending">—</td><td class="pending">—</td><td>Four material textures (teak, taupe marble, white marble, brass) and two night backdrops generated.</td></tr>
<tr><td>4 · Room pages + drawings</td><td class="pending">queued</td><td class="pending">—</td><td class="pending">—</td><td class="pending">—</td><td>From data.js, untouched.</td></tr></table>
<h3 style="font-weight:400;margin-top:32px">Gap history — piece 1</h3>
<table><tr><th>Round</th><th>Biggest gap named</th><th>Fix</th></tr>
<tr><td>R1</td><td>brief: some loads stayed black · system: condensed register missing (extract vs live site) · craft: hero one flat diagonal band</td><td>threaded dev server + fail-open page; addendum; baluster footage</td></tr>
<tr><td>R2</td><td>system: centre lines tracked −0.05em, letters touch · craft: brightest area behind the mark, room readable, grey highlights</td><td>−0.02em; centre pool, heavier blur, split-tone grade</td></tr>
<tr><td>R3</td><td>system: lockup 107×191 vs 141×163 · craft: all vertical columns lit from above, bright-top/black-bottom</td><td>one-line lockup at the reference's block; three layers at three angles, flattened</td></tr>
<tr><td>R4</td><td colspan="2">in review</td></tr></table>`;
