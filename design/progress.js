window.PROGRESS = `
<p><b>Round 2</b> — from scratch in <code>v2/</code>, against the pixel-level bar (<code>design/bar.md</code>). Fonts: free stand-ins (Roboto Condensed · Arimo · Roboto Mono).</p>
<table><tr><th>Piece</th><th>Status</th><th>Brief</th><th>System</th><th>Craft</th><th>Notes</th></tr>
<tr><td>1 · Entrance + hero</td><td>round 1 in review</td><td class="pending">…</td><td class="pending">…</td><td class="pending">…</td>
<td>Entrance timeline ported from the reference's code; key events within ±60 ms of it. Nav pills, flank labels and the 27 px CTA pitch measured to match.
Hero video in: close tracking shot past teak rail, brass and leather (Seedance 1.5), cropped 2x, defocused, slowed, a mirrored far layer for depth, graded to the reference's brightness (24.4 vs 24.2), 8 s seamless loop. Phone layout measured off the reference.</td></tr>
<tr><td>2 · Nav + motion system</td><td class="pending">queued</td><td class="pending">—</td><td class="pending">—</td><td class="pending">—</td><td>Menu overlay, decode-on-scroll, Lenis smooth scroll, footer blur.</td></tr>
<tr><td>3 · Home page</td><td class="pending">queued</td><td class="pending">—</td><td class="pending">—</td><td class="pending">—</td><td>Pinned card stack, expanding row, Bone band. Higgsfield backdrop + four textures.</td></tr>
<tr><td>4 · Room pages + drawings</td><td class="pending">queued</td><td class="pending">—</td><td class="pending">—</td><td class="pending">—</td><td>From data.js, untouched.</td></tr></table>
<h3 style="font-weight:400;margin-top:32px">Hero video log</h3>
<table><tr><th>#</th><th>How</th><th>Verdict</th></tr>
<tr><td>1–2</td><td>text-to-video, cheap model</td><td class="fail">a recognisable room, static camera</td></tr>
<tr><td>3–4</td><td>stills → video, cheap model</td><td class="fail">one sharpens into CGI ribbons; one barely moves</td></tr>
<tr><td>5–6</td><td>stills → video, start = end frame (seamless), Seedance 1.5</td><td class="fail">model invents objects mid-clip (a bowl, sparkles, a cube, smoke)</td></tr>
<tr><td>7–8</td><td>real footage, lateral dolly, Seedance 1.5 → defocus + grade in post</td><td class="fail">room still readable; cool-led; empty last third</td></tr><tr><td>9–10</td><td>extreme close tracking past teak, brass, leather → 2x crop, defocus, slow, far layer, grade</td><td class="pass">in use — pending critics</td></tr></table>`;
