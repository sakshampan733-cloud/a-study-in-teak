#!/usr/bin/env python3
"""Make one self-contained copy of the wardrobe planner to send to someone (the owner's sister, 21 Nov).

tools/wardrobe-planner.html loads the drawn plan from ../drawings and its fonts from ../v2/fonts, which a lone file
can't reach. This writes a single HTML with the plan and the fonts inside it, that opens on the drawn plan
(AST-DR-048 / 050) and saves in its own slot in the browser:

    python3 tools/share-planner.py [out.html]          (default: share/wardrobe/Wardrobe planner.html)
"""
import base64, json, re, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
out = Path(sys.argv[1]) if len(sys.argv) > 1 else ROOT / "share" / "wardrobe" / "Wardrobe planner.html"
html = (ROOT / "tools" / "wardrobe-planner.html").read_text()
js = (ROOT / "drawings" / "wardrobe-interiors.js").read_text()
plan = json.loads(re.search(r"// PLAN-START\nconst WARDROBE_PLAN = (\{.*?\});\n// PLAN-END", js, re.S).group(1))

tags = '<script src="../drawings/kit.js"></script>\n<script src="../drawings/wardrobe-interiors.js"></script>'
assert tags in html, "the planner's plan scripts moved"
html = html.replace(tags, "<script>window.PLANNER_SHARED = true; window.WARDROBE_PLAN = " + json.dumps(plan, ensure_ascii=False) + ";</script>")
for name in ("cond", "grotesk", "mono"):
    b64 = base64.b64encode((ROOT / "v2" / "fonts" / f"{name}.woff2").read_bytes()).decode()
    html = html.replace(f"url(../v2/fonts/{name}.woff2)", f"url(data:font/woff2;base64,{b64})")
svg = (ROOT / "favicon.svg").read_text()
html = html.replace('href="../favicon.svg"', 'href="data:image/svg+xml;base64,' + base64.b64encode(svg.encode()).decode() + '"')
assert "../" not in re.sub(r"<!--.*?-->", "", html, flags=re.S).split("<script>", 1)[0].replace("../drawings", ""), "a relative link is left"
out.parent.mkdir(parents=True, exist_ok=True)
out.write_text(html)
print("wrote", out, f"{len(html) // 1024} KB")
