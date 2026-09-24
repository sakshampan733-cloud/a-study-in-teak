window.PROGRESS = `
<p><b>Round 2</b> — from scratch in <code>v2/</code>, against the pixel-level bar (<code>design/bar.md</code>). Fonts: free stand-ins (Roboto Condensed · Arimo · Roboto Mono).</p>
<table><tr><th>Piece</th><th>Status</th><th>Brief</th><th>System</th><th>Craft</th><th>Notes</th></tr>
<tr><td>1 · Entrance + hero</td><td>building</td><td class="pending">—</td><td class="pending">—</td><td class="pending">—</td>
<td>Entrance timeline ported from the reference's code; key events within ±60 ms of it. Nav pills, flank labels and the 27 px CTA pitch measured to match.
Hero video still in progress — 8 generations so far; approach now: real footage with a lateral camera move, defocused in post.</td></tr>
<tr><td>2 · Nav + motion system</td><td class="pending">queued</td><td class="pending">—</td><td class="pending">—</td><td class="pending">—</td><td>Menu overlay, decode-on-scroll, Lenis smooth scroll, footer blur.</td></tr>
<tr><td>3 · Home page</td><td class="pending">queued</td><td class="pending">—</td><td class="pending">—</td><td class="pending">—</td><td>Pinned card stack, expanding row, Bone band. Higgsfield backdrop + four textures.</td></tr>
<tr><td>4 · Room pages + drawings</td><td class="pending">queued</td><td class="pending">—</td><td class="pending">—</td><td class="pending">—</td><td>From data.js, untouched.</td></tr></table>
<h3 style="font-weight:400;margin-top:32px">Hero video log</h3>
<table><tr><th>#</th><th>How</th><th>Verdict</th></tr>
<tr><td>1–2</td><td>text-to-video, cheap model</td><td class="fail">a recognisable room, static camera</td></tr>
<tr><td>3–4</td><td>stills → video, cheap model</td><td class="fail">one sharpens into CGI ribbons; one barely moves</td></tr>
<tr><td>5–6</td><td>stills → video, start = end frame (seamless), Seedance 1.5</td><td class="fail">model invents objects mid-clip (a bowl, sparkles, a cube, smoke)</td></tr>
<tr><td>7–8</td><td>real footage, lateral dolly, Seedance 1.5 → defocus + grade in post</td><td class="pending">rendering</td></tr></table>`;
