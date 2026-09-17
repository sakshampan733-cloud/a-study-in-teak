window.PROGRESS = `
<p>Round <b>2</b> reviewed → fixes applied and pushed (f65c81f) · Round 3 not started</p>
<table><tr><th>Piece</th><th>Brief</th><th>System</th><th>Craft</th><th>Biggest gap (round 2) → fix applied</th></tr>
<tr><td>A · Chrome</td><td class="pass">PASS (r1)</td><td class="fail">FAIL</td><td class="fail">FAIL</td><td>Menu footer links in mono → ghost pills; cramped zig-zag menu → centred links, counts offset, × close; nav over hero labels → labels hide on scroll, pills blur what's behind</td></tr>
<tr><td>B · Overview</td><td class="fail">FAIL</td><td class="fail">FAIL</td><td class="fail">FAIL</td><td>Text shows through nav pills → backdrop blur; stack collisions → solid cards with hairline edge, sharp photo; one-sided rays → full circle; plan panel gap → image fills row; mono nav links → condensed</td></tr>
<tr><td>C · Rooms</td><td class="pass">PASS (r1)</td><td class="fail">FAIL</td><td class="fail">FAIL</td><td>Squeezed hero prose → 560px measure; no light section → bone "In this section" strip; chips/table in mono or mixed case → condensed uppercase</td></tr>
<tr><td>D · Motion</td><td class="fail">FAIL</td><td class="fail">FAIL</td><td class="fail">FAIL</td><td>Loader too long + broken handoff → 1.1s, same composition as hero, skipped on repeat visits; durations → 0.6s layout / 0.4s opacity</td></tr></table>
<h2>User requests during run</h2><ul><li>Drawings: light/dark toggle, default dark ✔</li><li>Push to repo ✔</li></ul>`;
