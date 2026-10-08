# The wardrobe interiors (AST-DR-048, owner-approved 7 Oct) — exec'd by real.py after the joinery, in its namespace.
# furnish.py built each bay as a solid block with two doors and two bar handles. For the film three bays stand open so
# the inside reads — L2 (shirts, the watch drawer, the trouser pull-out), L3 (the lit perfume niche) and R3 (the tilting
# shoe trays): their blocks are hollowed into a real carcase in the same veneer as the doors (owner: the laminate to come
# reads as the veneer), each back a glowing opal panel (the lit back, no glass), and fitted out as the sheet. Every
# handle becomes the owner's tall hammered brass bar.
import bpy, bmesh, math, random
from mathutils import Vector, Matrix

rw = random.Random(21)
def _bb(o):
    cs = [o.matrix_world @ Vector(c) for c in o.bound_box]
    xs, ss, zs = [c.x * 1000 for c in cs], [-c.y * 1000 for c in cs], [c.z * 1000 for c in cs]
    return min(xs), min(ss), min(zs), max(xs), max(ss), max(zs)
M_HBRASS = flat("hammered_brass", (0.78, 0.56, 0.27), 0.28, 1.0)
_nt = M_HBRASS.node_tree; _b = _nt.nodes["Principled BSDF"]
_vo = _nt.nodes.new("ShaderNodeTexVoronoi"); _vo.inputs["Scale"].default_value = 260
_bp = _nt.nodes.new("ShaderNodeBump"); _bp.inputs["Strength"].default_value = 0.55; _bp.inputs["Distance"].default_value = 0.0006
_nt.links.new(_vo.outputs["Distance"], _bp.inputs["Height"]); _nt.links.new(_bp.outputs["Normal"], _b.inputs["Normal"])
for o in sc.objects:
    if o.type == "MESH" and o.name.startswith(("wdN", "wdS")) and ("_h0" in o.name or "_h1" in o.name): setmat(o, M_HBRASS)

# ── the wardrobe handles, after the owner's photo (wardrobe-handle-ref-owner.webp), redone 9 Oct ("hammered brass"): a
#    chunky faceted bar — a flattened hexagon 38 wide, 22 proud, 450 long — whose faces are really hammered (dents cut
#    into the metal by displacement, not just a texture), bright brass that darkens in the dents and is polished on the
#    edges, standing off the door on two posts ──
M_HAMMER, _hn, _hb_ = node_mat("hammered_brass_handle")
_hb_.inputs["Metallic"].default_value = 1.0; _hb_.inputs["Roughness"].default_value = 0.22
_geo = _hn.nodes.new("ShaderNodeNewGeometry"); _cr = _hn.nodes.new("ShaderNodeValToRGB")
_cr.color_ramp.elements[0].position = 0.42; _cr.color_ramp.elements[1].position = 0.56
_cr.color_ramp.elements[0].color = (0.36, 0.22, 0.08, 1); _cr.color_ramp.elements[1].color = (0.86, 0.62, 0.30, 1)
_hn.links.new(_geo.outputs["Pointiness"], _cr.inputs["Fac"]); _hn.links.new(_cr.outputs["Color"], _hb_.inputs["Base Color"])
_hv = _hn.nodes.new("ShaderNodeTexVoronoi"); _hv.inputs["Scale"].default_value = 160
_hbp = _hn.nodes.new("ShaderNodeBump"); _hbp.inputs["Strength"].default_value = 0.35; _hbp.inputs["Distance"].default_value = 0.0006
_hn.links.new(_hv.outputs["Distance"], _hbp.inputs["Height"]); _hn.links.new(_hbp.outputs["Normal"], _hb_.inputs["Normal"])
_dent = bpy.data.textures.new("hammer_dents", "VORONOI"); _dent.noise_scale = 0.0065; _dent.distance_metric = "DISTANCE"
HSEC = [(-19, 0), (19, 0), (19, 9), (11, 22), (-11, 22), (-19, 9)]       # across the door, out of it (mm)
def hammered_bar(name, hx, face, out_, zc, L=450.0):
    bm_ = bmesh.new(); rings = []
    for j in range(91):
        z = zc - L / 2 + L * j / 90
        taper = 1.0 if 6 < j < 84 else 0.94                                # the ends eased
        rings.append([bm_.verts.new(P(hx + a * taper, face + out_ * (2 + b * taper), z)) for a, b in HSEC])
    n = len(HSEC)
    for ra, rb in zip(rings, rings[1:]):
        for k in range(n): bm_.faces.new((ra[k], ra[(k + 1) % n], rb[(k + 1) % n], rb[k]))
    bm_.faces.new(rings[0][::-1]); bm_.faces.new(rings[-1])
    bmesh.ops.recalc_face_normals(bm_, faces=bm_.faces[:])
    me = bpy.data.meshes.new(name); bm_.to_mesh(me); bm_.free()
    o = bpy.data.objects.new(name, me); sc.collection.objects.link(o); setmat(o, M_HAMMER)
    bv_ = o.modifiers.new("edge", "BEVEL"); bv_.width = 0.0015; bv_.segments = 2; bv_.limit_method = "ANGLE"
    sd_ = o.modifiers.new("fine", "SUBSURF"); sd_.levels = 2; sd_.render_levels = 3; sd_.subdivision_type = "SIMPLE"
    dp_ = o.modifiers.new("dents", "DISPLACE"); dp_.texture = _dent; dp_.strength = -0.0011; dp_.mid_level = 0.0; dp_.texture_coords = "GLOBAL"
    sm_ = o.modifiers.new("soft", "SUBSURF"); sm_.levels = 0; sm_.render_levels = 1
    for p_ in me.polygons: p_.use_smooth = True
    return o
nh = 0
for o in list(sc.objects):
    if o.type != "MESH" or not o.name.startswith(("wdN", "wdS", "tb")) or not (o.name.endswith("_h0") or o.name.endswith("_h1")): continue
    hx0, hs0, hz0, hx1, hs1, hz1 = _bb(o); dr = sc.objects.get(o.name[:-3] + "_d" + o.name[-1])
    if dr: ds0, ds1 = _bb(dr)[1], _bb(dr)[4]; face, out_ = (hs0, 1) if abs(hs0 - ds1) < abs(hs1 - ds0) else (hs1, -1)
    else: face, out_ = hs0, 1
    hx = (hx0 + hx1) / 2; nm_ = o.name; bpy.data.objects.remove(o, do_unlink=True)
    hammered_bar(nm_, hx, face + out_ * 26, out_, 1200)
    for zp in (1200 - 175, 1200 + 175):
        bpy.ops.mesh.primitive_cylinder_add(vertices=20, radius=0.0065, depth=0.03, location=P(hx, face + out_ * 13, zp))
        po = bpy.context.active_object; po.name = nm_ + f"_post{zp}"; po.rotation_euler = (math.pi / 2, 0, 0); setmat(po, M_BRASS)
    nh += 1
print(f"wardrobe handles: {nh} chunky hammered-brass bars, dents in the metal (owner's photo)", flush=True)

for o in sc.objects:                                                          # the dressing mirror's frame: hammered brass (owner)
    if o.type == "MESH" and o.name.startswith("van_mirror_fr"): setmat(o, M_HBRASS)          # the bathroom mirror's hinges and standoffs
# ── the dressing mirror: FRAMELESS (owner, 9 Oct — the hammered frame "has no definition"): the glass runs the full
#    height and width of the centre panel, its backing dark and out of sight; the wings are bare glass as they were ──
_cg = sc.objects.get("mirror_cg"); _cs = sc.objects.get("mirror_c")
if _cg and _cs:
    cx0_, cs0_, cz0_, cx1_, cs1_, cz1_ = _bb(_cs)
    bpy.data.objects.remove(_cg, do_unlink=True); setmat(_cs, M_DARK)
    g_ = dbox("mirror_cg", cx0_ - 3, cs0_ + 1, 1, cx0_, cs1_ - 1, cz1_ - 1, M_MIRROR); bevel(g_, 0.0015, 2)
    print("dressing mirror: frameless (glass the full panel)", flush=True)

M_LITBACK = glow("wardrobe_litback", (1.0, 1.0, 1.0), float(os.environ.get("WD_GLOW", 1.6)))   # warm white, 3000 K like the coves (owner: warm, not yellow)
_lt = M_LITBACK.node_tree; _lbb = _lt.nodes.new("ShaderNodeBlackbody"); _lbb.inputs["Temperature"].default_value = 3000
_lp = _lt.nodes["Principled BSDF"]; _lt.links.new(_lbb.outputs["Color"], _lp.inputs["Emission Color"]); _lp.inputs["Base Color"].default_value = (0.9, 0.88, 0.85, 1)
M_GLASSB = None
_mg, _ntg, _bg = node_mat("perfume_glass"); _bg.inputs["Transmission Weight"].default_value = 1.0; _bg.inputs["Roughness"].default_value = 0.02; _bg.inputs["IOR"].default_value = 1.5
M_GLASSB = _mg
CLOTH_COLS = [(0.86, 0.84, 0.80), (0.12, 0.16, 0.26), (0.55, 0.52, 0.47), (0.30, 0.05, 0.06), (0.18, 0.18, 0.17), (0.62, 0.66, 0.70), (0.42, 0.33, 0.22), (0.06, 0.06, 0.07)]
CLOTH_M = [fabric(f"wd_cloth{i}", c, 0.5, 0.9, 900) for i, c in enumerate(CLOTH_COLS)]
M_LEATHER_SHOE = flat("shoe_leather", (0.05, 0.025, 0.012), 0.3, coat=0.6)
M_SHOE_TAN = flat("shoe_tan", (0.30, 0.14, 0.05), 0.35, coat=0.5)

def bay_geo(name):
    o = sc.objects.get(name + "_c")
    x0, s0, z0, x1, s1, z1 = _bb(o)
    north = name.startswith("wdN")
    front, back = (s1, s0) if north else (s0, s1)
    return o, x0, x1, front, back, north

def open_bay(name, geo, ang=96.0):
    o, x0, x1, front, back, north = geo
    for k in (0, 1):
        d = sc.objects.get(f"{name}_d{k}"); h = sc.objects.get(f"{name}_h{k}")
        hx = x0 + 6 if k == 0 else x1 - 6
        hinge = Vector(P(hx, front, 0))
        sign = (-1 if k == 0 else 1) * (1 if north else -1)
        for part in (d, h):
            if not part: continue
            part.data.transform(Matrix.Translation(-hinge)); part.location = hinge; part.rotation_euler.z = math.radians(sign * ang)

def carcase(name):
    """Swap the solid block for a real carcase: sides, top, base, the loft shelf, and the lit back."""
    o, x0, x1, front, back, north = bay_geo(name)
    bpy.data.objects.remove(o, do_unlink=True)
    d_in = 1 if north else -1                                                 # from the back toward the front, in s
    sb, sf = back, front - d_in * 22                                          # inside the doors
    S = lambda a, b: (min(a, b), max(a, b))
    s_lo, s_hi = S(sb, sf)
    dbox(f"{name}_sideA", x0, s_lo, 0, x0 + 18, s_hi, WDh, M_VEN); dbox(f"{name}_sideB", x1 - 18, s_lo, 0, x1, s_hi, WDh, M_VEN)
    dbox(f"{name}_top", x0, s_lo, WDh - 18, x1, s_hi, WDh, M_VEN); dbox(f"{name}_base", x0, s_lo, 90, x1, s_hi, 108, M_VEN)
    lb0, lb1 = S(sb, sb + d_in * 55)                                          # the lit back: opal acrylic 55 off the wall
    dbox(f"{name}_litback", x0 + 18, lb0, 108, x1 - 18, lb1, WDh - 18, M_LITBACK)
    return x0 + 18, x1 - 18, sb + d_in * 58, sf - d_in * 4, d_in

def shelf(name, xa, xb, sa, sb_, z, t=22):
    lo, hi = min(sa, sb_), max(sa, sb_)
    s_ = dbox(name, xa, lo, z, xb, hi, z + t, M_VEN); bevel(s_, 0.0015, 2); return s_

def rail(name, xa, xb, s_mid, z):
    bpy.ops.mesh.primitive_cylinder_add(vertices=20, radius=0.011, depth=(xb - xa) / 1000, location=P((xa + xb) / 2, s_mid, z))
    r_ = bpy.context.active_object; r_.name = name; r_.rotation_euler = (0, math.pi / 2, 0); setmat(r_, M_HBRASS)

M_HANGER, _nth, _hb = node_mat("wd_hanger")
_hb.inputs["Base Color"].default_value = (0.16, 0.08, 0.04, 1); _hb.inputs["Roughness"].default_value = 0.35
def garment(name, x_, s_mid, z_top, length, depth, thick, m, seed):
    """A shirt or jacket on its hanger, edge-on to the room: sloped shoulders off a collar, sides falling slightly in to
    the hem, soft and creased (subdivided, displaced by noise), a little thicker at the shoulders."""
    hw = depth / 2
    outline = [(-34, 0), (34, 0), (hw - 30, 34), (hw, 70), (hw - 8, length * 0.55), (hw - 18, length), (0, length + 12),
               (-(hw - 18), length), (-(hw - 8), length * 0.55), (-hw, 70), (-(hw - 30), 34)]
    bm = bmesh.new()
    vs = [bm.verts.new((x_ / 1000, -(s_mid + u) / 1000, (z_top - v) / 1000)) for u, v in outline]
    f_ = bm.faces.new(vs); bmesh.ops.triangulate(bm, faces=[f_])
    for _ in range(3): bmesh.ops.subdivide_edges(bm, edges=bm.edges[:], cuts=1, use_grid_fill=True)
    me = bpy.data.meshes.new(name); bm.to_mesh(me); bm.free()
    o = bpy.data.objects.new(name, me); bpy.context.scene.collection.objects.link(o); setmat(o, m)
    so = o.modifiers.new("t", "SOLIDIFY"); so.thickness = thick / 1000; so.offset = 0
    tx = bpy.data.textures.new(name + "_crease", "CLOUDS"); tx.noise_scale = 0.09; tx.noise_depth = 2
    dp = o.modifiers.new("crease", "DISPLACE"); dp.texture = tx; dp.strength = 0.012; dp.direction = "X"; dp.texture_coords = "GLOBAL"
    ss = o.modifiers.new("soft", "SUBSURF"); ss.levels = 1; ss.render_levels = 2
    for p_ in me.polygons: p_.use_smooth = True
    o.rotation_mode = "XYZ"
    return o

def hang(name, xa, xb, s_mid, z_rail, length, n, thick=26, depth=440):
    """Garments on wooden hangers along the brass rail, not quite evenly spaced, as a real rail is."""
    pitch = (xb - xa - 40) / n
    for i in range(n):
        x_ = xa + 20 + pitch * (i + 0.5) + rw.uniform(-8, 8)
        L_ = length * rw.uniform(0.9, 1.04)
        garment(f"{name}{i}", x_, s_mid, z_rail - 52, L_, depth * rw.uniform(0.94, 1.02), thick * rw.uniform(0.8, 1.3), CLOTH_M[rw.randrange(len(CLOTH_M))], i)
        bpy.ops.mesh.primitive_torus_add(major_radius=0.014, minor_radius=0.002, location=P(x_, s_mid, z_rail + 2)); setmat(bpy.context.active_object, M_HBRASS)
        bpy.ops.mesh.primitive_cylinder_add(vertices=6, radius=0.002, depth=0.04, location=P(x_, s_mid, z_rail - 22)); setmat(bpy.context.active_object, M_HBRASS)
        for sg in (1, -1):                                                    # the hanger's two arms, sloping down from the hook
            bpy.ops.mesh.primitive_cylinder_add(vertices=10, radius=0.007, depth=depth * 0.5 / 1000, location=P(x_, s_mid + sg * depth * 0.24, z_rail - 58))
            h_ = bpy.context.active_object; h_.rotation_euler = (math.pi / 2 + sg * 0.22, 0, 0); setmat(h_, M_HANGER)

def loft(name, xa, xb, sa, sb_):
    shelf(f"{name}_loft", xa, xb, sa, sb_, 2183)
    for i, (w, h) in enumerate(((320, 260), (300, 200), (260, 160))):
        lo, hi = min(sa, sb_) + 40, max(sa, sb_) - 60
        bx_ = xa + 30 + i * (xb - xa - 60) / 3
        b_ = dbox(f"{name}_box{i}", bx_, lo, 2205, bx_ + w * (xb - xa) / 1000, hi, 2205 + h, CLOTH_M[(i + 2) % len(CLOTH_M)]); bevel(b_, 0.004, 2)

def drawer_front(name, xa, xb, s_face, z0, z1, d_in):
    lo, hi = min(s_face, s_face - d_in * 18), max(s_face, s_face - d_in * 18)
    df = dbox(name, xa + 18, lo, z0, xb - 18, hi, z1, M_VEN); bevel(df, 0.0015, 2)
    hx = (xa + xb) / 2
    pl = dbox(name + "_pull", hx - 70, min(s_face + d_in * 2, s_face + d_in * 14), (z0 + z1) / 2 - 6, hx + 70, max(s_face + d_in * 2, s_face + d_in * 14), (z0 + z1) / 2 + 6, M_HBRASS)

# ── L2: shirts on the rail at 1900, the watch/jewellery drawer, trouser pull-out No. 2, the loft ──
def fit_L2(name):
    xa, xb, sa, sf, d_in = carcase(name); sm = (sa + sf) / 2
    loft(name, xa, xb, sa, sf); rail(f"{name}_rail", xa, xb, sm, 1900); hang(f"{name}_shirt", xa, xb, sm, 1900, 760, 9)
    shelf(f"{name}_sh1060", xa, xb, sa, sf, 1060)
    drawer_front(f"{name}_watch", xa, xb, sf, 940, 1050, d_in)
    for k in range(5):                                                          # the trouser pull-out: bars, trousers folded over
        xk = xa + 60 + k * (xb - xa - 120) / 4
        bpy.ops.mesh.primitive_cylinder_add(vertices=12, radius=0.006, depth=abs(sf - sa) / 1000 * 0.85, location=P(xk, sm, 895))
        b_ = bpy.context.active_object; b_.rotation_euler = (math.pi / 2, 0, 0); setmat(b_, M_HBRASS)
        t_ = dbox(f"{name}_trouser{k}", xk - 9, sm - 160, 300, xk + 9, sm + 160, 890, CLOTH_M[(k * 3 + 1) % len(CLOTH_M)]); bevel(t_, 0.01, 2)

# ── L3: the lit open perfume niche (three shelves of bottles), the hair-dryer bay, two drawers, the loft ──
def fit_L3(name):
    xa, xb, sa, sf, d_in = carcase(name); sm = (sa + sf) / 2
    loft(name, xa, xb, sa, sf)
    for z in (1320, 1600, 1880):
        shelf(f"{name}_sh{z}", xa, xb, sa, sf, z)
        n = 4 if z != 1600 else 5
        for i in range(n):
            x_ = xa + 80 + i * (xb - xa - 160) / max(1, n - 1); w_ = rw.choice((60, 70, 80)); h_ = rw.choice((110, 130, 150, 170))
            s_ = sm + rw.uniform(-60, 40)
            bpy.ops.mesh.primitive_cube_add(size=1, location=P(x_, s_, z + 22 + h_ / 2)); bo = bpy.context.active_object
            bo.name = f"{name}_bottle{z}{i}"; bo.scale = (w_ / 1000, w_ * 0.6 / 1000, h_ / 1000); setmat(bo, M_GLASSB); bevel(bo, 0.006, 3)
            bpy.ops.mesh.primitive_cylinder_add(vertices=20, radius=0.016, depth=0.03, location=P(x_, s_, z + 22 + h_ + 15))
            setmat(bpy.context.active_object, rw.choice((M_HBRASS, M_DARK, M_HBRASS)))
        ld = bpy.data.lights.new(f"{name}_niche{z}", "AREA"); ld.shape = "RECTANGLE"; ld.size, ld.size_y = (xb - xa - 40) / 1000, 0.02; ld.energy = 3.5; warm(ld, 3000)
        lo_ = bpy.data.objects.new(f"{name}_niche{z}", ld); sc.collection.objects.link(lo_); lo_.location = P((xa + xb) / 2, sf - d_in * 30, z + 270)
    shelf(f"{name}_sh780", xa, xb, sa, sf, 780)
    drawer_front(f"{name}_dr1", xa, xb, sf, 430, 740, d_in); drawer_front(f"{name}_dr0", xa, xb, sf, 115, 420, d_in)

# ── R3: nine tilting shoe trays, four of them filled; the bag shelf; the loft ──
def fit_R3(name):
    xa, xb, sa, sf, d_in = carcase(name); sm = (sa + sf) / 2
    loft(name, xa, xb, sa, sf); shelf(f"{name}_sh1960", xa, xb, sa, sf, 1960)
    for i, w_ in enumerate((260, 220)):
        bg = dbox(f"{name}_bag{i}", xa + 60 + i * 300, min(sa, sf) + 60, 1982, xa + 60 + i * 300 + w_, max(sa, sf) - 80, 1982 + 170, (M_LEATHER_SHOE, M_SHOE_TAN)[i]); bevel(bg, 0.02, 3)
    for i in range(9):
        z = 160 + i * 185
        bm = bmesh.new(); tilt = 0.30                                            # the tray tips its front edge down
        pts = [(xa + 4, sa, z + 55), (xb - 4, sa, z + 55), (xb - 4, sf, z), (xa + 4, sf, z)]
        lo_ = [bm.verts.new(P(*q)) for q in pts]; hi_ = [bm.verts.new(P(q[0], q[1], q[2] + 14)) for q in pts]
        bm.faces.new(lo_[::-1]); bm.faces.new(hi_)
        for k in range(4): bm.faces.new((lo_[k], lo_[(k + 1) % 4], hi_[(k + 1) % 4], hi_[k]))
        bmesh.ops.recalc_face_normals(bm, faces=bm.faces[:]); me = bpy.data.meshes.new(f"{name}_tray{i}"); bm.to_mesh(me); bm.free()
        tr = bpy.data.objects.new(f"{name}_tray{i}", me); DET.objects.link(tr); setmat(tr, M_VEN)
        dbox(f"{name}_traylip{i}", xa + 4, min(sf, sf - d_in * 12), z, xb - 4, max(sf, sf - d_in * 12), z + 40, M_HBRASS)
        if i in (2, 3, 5, 6):                                                  # four trays filled: a pair or two of shoes each
            for j in range(2):
                for side in (-1, 1):
                    sx = xa + 120 + j * (xb - xa - 240) + side * 55
                    bpy.ops.mesh.primitive_uv_sphere_add(segments=20, ring_count=10, radius=0.5, location=P(sx, sm, z + 70))
                    sh_ = bpy.context.active_object; sh_.scale = (0.09, 0.28, 0.08); sh_.rotation_euler = (0.28 * -d_in, 0, 0)
                    setmat(sh_, (M_LEATHER_SHOE, M_SHOE_TAN)[(i + j) % 2])
                    for p_ in sh_.data.polygons: p_.use_smooth = True

FITS = {"wdN1": fit_L2, "wdN2": fit_L3, "wdS2": fit_R3}
if os.environ.get("WD_OPEN", "0") != "1": FITS = {}                     # owner, 8 Oct: no cupboard insides in the renders — drawings only
for nm, fn in FITS.items():
    if sc.objects.get(nm + "_c"):
        geo_ = bay_geo(nm); fn(nm); open_bay(nm, geo_)
print(f"wardrobes: {', '.join(FITS) or 'all shut'} (AST-DR-048), hammered brass handles", flush=True)
