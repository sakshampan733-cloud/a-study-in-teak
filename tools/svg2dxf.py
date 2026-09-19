"""Convert the drawing sheets to editable CAD files.

Reads build/cad.json (made by tools/dump-cad.js) and writes, per drawing:
  cad/<key>-model.dxf   every view at true size (1 unit = 1 mm), one layer per view
  cad/<key>-sheet.dxf   the A3 sheet exactly as drawn, with dimensions and notes
  cad/<key>.svg         the sheet as vector SVG (Illustrator / Inkscape / Affinity)
"""
import io, json, math, re, sys
from pathlib import Path as FsPath

import ezdxf
from ezdxf import path as ezpath
from ezdxf.enums import TextEntityAlignment
from shapely.geometry import LineString, box
from svgelements import (SVG, Arc, Circle, Close, CubicBezier, Ellipse, Line, Move, Path,
                         Point, QuadraticBezier, Rect, Shape, SimpleLine, Text)

ROOT = FsPath(__file__).resolve().parent.parent
DIM_COLOR = "#8a3a22"
ALIGN = {"start": TextEntityAlignment.LEFT, "middle": TextEntityAlignment.CENTER, "end": TextEntityAlignment.RIGHT}


def prepare(svg_fragment):
    """Make a fragment parseable: drop patterns, turn clipPaths into marker rects."""
    s = re.sub(r"<pattern\b.*?</pattern>", "", svg_fragment, flags=re.S)
    # Chains carry both a mm and a feet-inches label for the web toggle; CAD keeps feet and inches.
    s = re.sub(r'<text[^>]*class="dk-mm"[^>]*>.*?</text>', "", s, flags=re.S)
    s = re.sub(r"</?defs>", "", s)
    s = re.sub(r'<clipPath id="([\w-]+)">\s*<rect ([^>]*?)/>\s*</clipPath>',
               r'<rect data-clipdef="\1" \2 fill="none" stroke="none"/>', s, flags=re.S)
    s = re.sub(r'clip-path="url\(#([\w-]+)\)"', r'data-clip="\1"', s)
    if not s.lstrip().startswith("<svg"):
        s = f'<svg xmlns="http://www.w3.org/2000/svg">{s}</svg>'
    return s


def is_visible_stroke(e):
    stroke = str(e.values.get("stroke", "none")).lower()
    return stroke not in ("none", "") and float(e.values.get("opacity", 1) or 1) > 0


def to_ez_paths(p):
    """svgelements Path -> list of ezdxf Paths (one per subpath)."""
    out, cur, start = [], None, None
    for seg in p:
        if isinstance(seg, Move):
            if cur is not None and len(cur):
                out.append(cur)
            start = seg.end
            cur = ezpath.Path((seg.end.x, seg.end.y))
        elif cur is None:
            continue
        elif isinstance(seg, Close):
            if start is not None and (abs(cur.end.x - start.x) > 1e-9 or abs(cur.end.y - start.y) > 1e-9):
                cur.line_to((start.x, start.y))
        elif isinstance(seg, Line):
            cur.line_to((seg.end.x, seg.end.y))
        elif isinstance(seg, CubicBezier):
            cur.curve4_to((seg.end.x, seg.end.y), (seg.control1.x, seg.control1.y), (seg.control2.x, seg.control2.y))
        elif isinstance(seg, QuadraticBezier):
            cur.curve3_to((seg.end.x, seg.end.y), (seg.control.x, seg.control.y))
        elif isinstance(seg, Arc):
            for c in seg.as_cubic_curves():
                cur.curve4_to((c.end.x, c.end.y), (c.control1.x, c.control1.y), (c.control2.x, c.control2.y))
    if cur is not None and len(cur):
        out.append(cur)
    return out


MM_PER_IN = 25.4          # drawings are authored in mm; CAD is issued in inches
TO_IN = 1.0 / MM_PER_IN


class Writer:
    def __init__(self, msp, flip_y, dx=0.0, dy=0.0, hatch_scale=1.0, layer=None, text_layer="TEXT", k=TO_IN):
        self.msp, self.flip, self.dx, self.dy = msp, flip_y, dx, dy
        self.hatch_scale, self.layer, self.text_layer, self.k = hatch_scale, layer, text_layer, k
        self.clips = {}

    def pt(self, x, y):
        return ((x + self.dx) * self.k, ((-y if self.flip else y) + self.dy) * self.k)

    def layer_for(self, e):
        if self.layer:
            return self.layer
        return "DIMENSIONS" if str(e.values.get("stroke", "")).lower() == DIM_COLOR else "GEOMETRY"

    def attribs(self, e):
        a = {"layer": self.layer_for(e)}
        if e.values.get("stroke-dasharray") not in (None, "none", ""):
            a["linetype"] = "DASHED"
        return a

    def emit_clipped(self, ez_paths, clip, attribs):
        for p in ez_paths:
            pts = [(v.x, v.y) for v in p.flattening(distance=0.15)]
            if len(pts) < 2:
                continue
            geom = LineString(pts).intersection(clip)
            parts = getattr(geom, "geoms", [geom])
            for g in parts:
                if g.is_empty or g.geom_type != "LineString":
                    continue
                self.msp.add_lwpolyline([self.pt(x, y) for x, y in g.coords], dxfattribs=attribs)

    def emit_paths(self, ez_paths, attribs):
        for p in ez_paths:
            p = p.transform(ezdxf.math.Matrix44.chain(
                ezdxf.math.Matrix44.scale(1, -1 if self.flip else 1, 1),
                ezdxf.math.Matrix44.translate(self.dx, self.dy, 0),
                ezdxf.math.Matrix44.scale(self.k, self.k, 1)))
            if p.has_curves:
                ezpath.render_splines_and_polylines(self.msp, [p], dxfattribs=attribs)
            else:
                ezpath.render_lwpolylines(self.msp, [p], dxfattribs=attribs)

    def hatch(self, ez_paths, e):
        fill = str(e.values.get("fill", ""))
        if not fill.startswith("url(#hatch"):
            return
        for p in ez_paths:
            pts = [self.pt(v.x, v.y) for v in p.flattening(distance=0.2)]
            if len(pts) < 3:
                continue
            h = self.msp.add_hatch(dxfattribs={"layer": (self.layer + " hatch") if self.layer else "HATCH", "color": 8})
            h.set_pattern_fill("ANSI31", scale=self.hatch_scale * self.k)
            h.paths.add_polyline_path(pts, is_closed=True)

    def text(self, e):
        content = (e.text or "").strip()
        if not content:
            return
        m = e.transform
        p0 = m.point_in_matrix_space(Point(e.x, e.y))
        p1 = m.point_in_matrix_space(Point(e.x + 1, e.y))
        vx, vy = p1.x - p0.x, p1.y - p0.y
        scale = math.hypot(vx, vy) or 1
        angle = math.degrees(math.atan2(-vy if self.flip else vy, vx))
        height = float(e.font_size or 2) * scale * 0.72 * self.k
        t = self.msp.add_text(content, height=height, rotation=angle, dxfattribs={"layer": self.text_layer})
        t.set_placement(self.pt(p0.x, p0.y), align=ALIGN.get(e.anchor, TextEntityAlignment.LEFT))

    def add(self, svg_text):
        doc = SVG.parse(io.StringIO(prepare(svg_text)), reify=True)
        for e in doc.elements():
            if isinstance(e, Text):
                self.text(e)
                continue
            if not isinstance(e, Shape):
                continue
            if e.values.get("data-clipdef"):
                x0, y0, x1, y1 = e.bbox()
                self.clips[e.values["data-clipdef"]] = box(x0, y0, x1, y1)
                continue
            clip = self.clips.get(e.values.get("data-clip"))
            stroked = is_visible_stroke(e)
            attribs = self.attribs(e)
            if isinstance(e, (Circle, Ellipse)) and clip is None and stroked and abs(e.rx - e.ry) < 1e-6:
                # the centre goes through pt(), which scales to inches — the radius must be scaled the same way
                self.msp.add_circle(self.pt(e.cx, e.cy), e.rx * self.k, dxfattribs=attribs)
                continue
            if isinstance(e, SimpleLine) and clip is None:
                if stroked:
                    self.msp.add_line(self.pt(e.x1, e.y1), self.pt(e.x2, e.y2), dxfattribs=attribs)
                continue
            ez = to_ez_paths(Path(e))
            if not ez:
                continue
            if clip is None:
                self.hatch(ez, e)
            if not stroked:
                continue
            if clip is not None:
                self.emit_clipped(ez, clip, attribs)
            else:
                self.emit_paths(ez, attribs)


def new_doc():
    doc = ezdxf.new("R2010", setup=True, units=ezdxf.units.IN)
    doc.header["$MEASUREMENT"] = 0        # imperial
    doc.header["$INSUNITS"] = 1           # inches
    doc.header["$LUNITS"] = 4             # architectural: feet and fractional inches
    doc.header["$AUPREC"] = 3
    return doc


def bounds(svg_text):
    doc = SVG.parse(io.StringIO(prepare(svg_text)), reify=True)
    xs, ys = [], []
    for e in doc.elements():
        if isinstance(e, Shape) and not e.values.get("data-clipdef") and e.values.get("data-clip") is None:
            b = e.bbox()
            if b:
                xs += [b[0], b[2]]
                ys += [b[1], b[3]]
    # clipped groups: use their clip rects
    for e in doc.elements():
        if isinstance(e, Shape) and e.values.get("data-clipdef"):
            b = e.bbox()
            xs += [b[0], b[2]]
            ys += [b[1], b[3]]
    return min(xs), min(ys), max(xs), max(ys)


def model_dxf(views, title, out):
    doc = new_doc()
    msp = doc.modelspace()
    cursor = 0.0
    for v in views:
        name = re.sub(r"[<>/\\\":;?*|=,]", "-", v["name"])
        doc.layers.add(name)
        doc.layers.add(name + " hatch", color=8)
        svg = f'<g stroke="#1b1b1b" fill="none">{v["svg"]}</g>'  # views inherit stroke from their sheet group
        x0, y0, x1, y1 = bounds(svg)
        w = Writer(msp, flip_y=True, dx=cursor - x0, dy=y1, hatch_scale=4, layer=name, text_layer=name)
        w.add(svg)
        label = msp.add_text(f"{v['name'].upper()}  (1:1, inches)", height=max(18, (x1 - x0) * 0.02) * TO_IN, dxfattribs={"layer": "LABELS"})
        label.set_placement((cursor * TO_IN, ((y1 - y0) + 60) * TO_IN), align=TextEntityAlignment.LEFT)
        cursor += (x1 - x0) + max(250, (x1 - x0) * 0.15)
    t = msp.add_text(title, height=40 * TO_IN, dxfattribs={"layer": "LABELS"})
    t.set_placement((0, -220 * TO_IN), align=TextEntityAlignment.LEFT)
    doc.saveas(out)


def sheet_dxf(svg_text, out):
    doc = new_doc()
    for n, c in (("GEOMETRY", 7), ("DIMENSIONS", 1), ("TEXT", 7), ("HATCH", 8)):
        doc.layers.add(n, color=c)
    doc.header["$LTSCALE"] = 0.25 * TO_IN
    Writer(doc.modelspace(), flip_y=True, dy=297, hatch_scale=0.4).add(svg_text)
    doc.saveas(out)


FRAME = (8.0, 8.0, 412.0, 289.0)     # the printed border on a 420 x 297 sheet
TITLE_BLOCK = (300.0, 239.0, 412.0, 289.0)   # nothing but the title block may sit here


def text_bbox(e):
    """svgelements treats text as a point; estimate the box it actually occupies."""
    b = e.bbox()
    if not b:
        return None
    content = (e.text or "").strip()
    size = float(e.font_size or 2)
    w = len(content) * size * 0.58
    h = size * 1.1
    anchor = str(e.values.get("text-anchor", "start"))
    x = b[0] - (w / 2 if anchor == "middle" else w if anchor == "end" else 0)
    rot = "rotate(-90" in str(e.values.get("transform", ""))
    if rot:
        return (b[0] - h * 0.8, b[1] - w, b[0] + h * 0.3, b[1])
    return (x, b[1] - h * 0.8, x + w, b[1] + h * 0.25)


def frame_overflow(svg_text, tol=0.6):
    """Anything drawn outside the printed border, so a sheet can never quietly run off the page."""
    doc = SVG.parse(io.StringIO(prepare(svg_text)), reify=True)
    clips = {e.values["data-clipdef"]: e.bbox() for e in doc.elements()
             if isinstance(e, Shape) and e.values.get("data-clipdef")}
    x0, y0, x1, y1 = FRAME
    out = []
    for e in doc.elements():
        b = None
        if isinstance(e, Shape):
            if e.values.get("data-clipdef"):
                continue
            b = e.bbox()
            if b and (b[2] - b[0]) >= 400 and (b[3] - b[1]) >= 275:
                continue                                  # the page and its printed border
            clip = clips.get(e.values.get("data-clip"))
            if clip and b:
                b = (max(b[0], clip[0]), max(b[1], clip[1]), min(b[2], clip[2]), min(b[3], clip[3]))
                if b[0] > b[2] or b[1] > b[3]:
                    continue
        elif isinstance(e, Text):
            b = text_bbox(e)
        if not b:
            continue
        label = (getattr(e, "text", "") or "").strip()[:34]
        if b[0] < x0 - tol or b[1] < y0 - tol or b[2] > x1 + tol or b[3] > y1 + tol:
            out.append((round(b[0], 1), round(b[1], 1), round(b[2], 1), round(b[3], 1), label or "off-sheet"))
            continue
        # Drawn content that has drifted under the title block is invisible, not missing.
        t0, u0, t1, u1 = TITLE_BLOCK
        if e.values.get("data-tb") is None and b[0] < t1 and b[2] > t0 and b[1] < u1 and b[3] > u0:
            out.append((round(b[0], 1), round(b[1], 1), round(b[2], 1), round(b[3], 1), (label or "shape") + " UNDER TITLE BLOCK"))
    return out


def main():
    data = json.loads((ROOT / "build/cad.json").read_text())
    outdir = ROOT / "cad"
    outdir.mkdir(exist_ok=True)
    for key, d in data["drawings"].items():
        views = [v for v in data["views"] if v["sheet"] == key]
        (outdir / f"{key}.svg").write_text(d["svg"])
        sheet_dxf(d["svg"], outdir / f"{key}-sheet.dxf")
        if views:
            model_dxf(views, d["title"], outdir / f"{key}-model.dxf")
        over = frame_overflow(d["svg"])
        flag = f"  !! {len(over)} OUTSIDE THE FRAME: " + "; ".join(f"[{o[0]},{o[1]}–{o[2]},{o[3]}] {o[4]}" for o in over[:3]) if over else ""
        print(f"{key}: sheet + {len(views)} model views{flag}")


if __name__ == "__main__":
    sys.exit(main())
