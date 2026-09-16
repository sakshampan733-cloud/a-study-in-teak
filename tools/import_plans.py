"""Make CAD files dropped into plans/ viewable on the site.

Put .dxf, .pdf, .png or .jpg files in plans/ and run tools/build-cad.sh (or this script).
  .dxf -> plans/_web/<name>.svg     (black lines on white, all of model space)
  .pdf -> plans/_web/<name>-p<n>.png (one image per page)
  images are used as they are.
Writes plans/plans.js, which the Overview page reads.
DWG cannot be read directly: in AutoCAD use Save As → DXF, or Export / Plot → PDF.
"""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC, OUT = ROOT / "plans", ROOT / "plans" / "_web"


def dxf_to_svg(path, out):
    import ezdxf
    from ezdxf.addons.drawing import Frontend, RenderContext, config, layout, svg
    doc = ezdxf.readfile(path)
    backend = svg.SVGBackend()
    cfg = config.Configuration(background_policy=config.BackgroundPolicy.WHITE, color_policy=config.ColorPolicy.BLACK)
    Frontend(RenderContext(doc), backend, config=cfg).draw_layout(doc.modelspace())
    out.write_text(backend.get_string(layout.Page(0, 0, layout.Units.mm, margins=layout.Margins.all(10))))


def pdf_to_png(path, stem):
    import fitz
    pages = []
    for i, page in enumerate(fitz.open(path), 1):
        target = OUT / f"{stem}-p{i}.png"
        page.get_pixmap(dpi=160).save(target)
        pages.append(target)
    return pages


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    items = []
    for f in sorted(SRC.iterdir()):
        if not f.is_file() or f.name.startswith(".") or f.name == "plans.js":
            continue
        ext, title = f.suffix.lower(), f.stem.replace("_", " ").replace("-", " ")
        try:
            if ext == ".dxf":
                target = OUT / f"{f.stem}.svg"
                dxf_to_svg(f, target)
                items.append({"title": title, "src": f"plans/_web/{target.name}", "file": f"plans/{f.name}"})
            elif ext == ".pdf":
                for i, p in enumerate(pdf_to_png(f, f.stem), 1):
                    items.append({"title": f"{title} — page {i}", "src": f"plans/_web/{p.name}", "file": f"plans/{f.name}"})
            elif ext in (".png", ".jpg", ".jpeg", ".webp", ".svg"):
                items.append({"title": title, "src": f"plans/{f.name}", "file": f"plans/{f.name}"})
            elif ext == ".dwg":
                print(f"skip {f.name}: DWG can't be read — save as DXF or export PDF from AutoCAD")
                continue
            else:
                continue
            print("ok", f.name)
        except Exception as e:  # keep going if one file is broken
            print(f"failed {f.name}: {e}")
    (SRC / "plans.js").write_text("window.PLANS = " + json.dumps(items, indent=2) + ";\n")
    print(len(items), "plan(s) listed")


if __name__ == "__main__":
    main()
