# The desk as approved (AST-DR-045/046/047, owner 7 Oct): the plain moulded desk — no carving, no corner mouldings, the
# monitor clamp bay — with all four corners hollowed R150 again, top to plinth, every layer struck from one centre (the
# top's corner) and blended into the flat faces through a 12 mm round. Teak; brass on the handles only. Exec'd at the
# end of joinery.py, which has just built the earlier desk: that goes. Desk-local x along its length from the left end,
# y from the FRONT (the drawers, facing the study) to the back; z up.
import bmesh, math
from mathutils import Vector

for o in list(sc.objects):
    if o.name.startswith("dk_"): bpy.data.objects.remove(o, do_unlink=True)
L_, D_, H_ = 2286.0, 914.0, 750.0
TOPT, OVd, FRZ, RAILd, PLH, PLP, PEDW, STL = 40.0, 30.0, 75.0, 15.0, 80.0, 15.0, 560.0, 38.0
HR, HF = 150.0, 12.0
DXO, DSO = dx0, dFront                                                 # the top's front-left corner in the room

def corner_prims(off):
    Ro = HR + off; v = math.sqrt((Ro + HF) ** 2 - (off + HF) ** 2); k = Ro / (Ro + HF)
    F1, F2 = (off + HF, v), (v, off + HF)
    return v, [(off, v), (F1[0] * k, F1[1] * k), (F2[0] * k, F2[1] * k), (v, off)], [(F1, HF), ((0.0, 0.0), Ro), (F2, HF)]
VC = corner_prims(OVd)[0]; SO = round(VC - OVd + 20)                   # the outer stile runs on 20 past the curve (177)

def ring(x0, y0, x1, y1, flags, off):
    corners = [(x0, y0, 1, 1, False), (x1, y0, -1, 1, True), (x1, y1, -1, -1, False), (x0, y1, 1, -1, True)]
    pts, curv = [], []
    for i, (ox, oy, sx, sy, rev) in enumerate(corners):
        mp = lambda p, ox=ox, oy=oy, sx=sx, sy=sy: (ox + sx * p[0], oy + sy * p[1])
        if not flags[i]:
            pts.append(mp((off, off))); curv.append(False); continue
        _, cp, arcs = corner_prims(off)
        cp = [mp(p) for p in cp]; arcs = [(mp(c), r) for c, r in arcs]
        if rev: cp, arcs = cp[::-1], arcs[::-1]
        pts.append(cp[0]); curv.append(False)
        for j, (c, r) in enumerate(arcs):
            a0 = math.atan2(cp[j][1] - c[1], cp[j][0] - c[0]); a1 = math.atan2(cp[j + 1][1] - c[1], cp[j + 1][0] - c[0])
            da = a1 - a0
            while da > math.pi: da -= 2 * math.pi
            while da < -math.pi: da += 2 * math.pi
            n = max(2, int(math.ceil(abs(da) / math.radians(5 if r > 40 else 22))))
            for q in range(1, n + 1):
                t = a0 + da * q / n; pts.append((c[0] + r * math.cos(t), c[1] + r * math.sin(t))); curv.append(True)
    out_p, out_c = [], []
    for p, c in zip(pts, curv):
        if out_p and math.hypot(p[0] - out_p[-1][0], p[1] - out_p[-1][1]) < 0.01: continue
        out_p.append(p); out_c.append(c)
    return out_p, out_c

def dk2_prism(name, rc, z0, z1, m, bev=0.0):
    pts, curv = rc; bm = bmesh.new(); n = len(pts)
    lo = [bm.verts.new(P(DXO + x, DSO + y, z0)) for x, y in pts]; hi = [bm.verts.new(P(DXO + x, DSO + y, z1)) for x, y in pts]
    for i in range(n):
        j = (i + 1) % n; f_ = bm.faces.new((lo[i], lo[j], hi[j], hi[i])); f_.smooth = curv[i] and curv[j]
    fb = bm.faces.new(lo[::-1]); ft = bm.faces.new(hi)
    bmesh.ops.triangulate(bm, faces=[fb, ft], quad_method="BEAUTY", ngon_method="EAR_CLIP")
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces[:])
    me = bpy.data.meshes.new(name); bm.to_mesh(me); bm.free()
    o = bpy.data.objects.new(name, me); J.objects.link(o); setmat(o, m)
    if bev:
        bv = o.modifiers.new("ease", "BEVEL"); bv.width = bev; bv.segments = 3; bv.limit_method = "ANGLE"
    return o

ZT0, ZF0, ZR0 = H_ - TOPT, H_ - TOPT - FRZ, H_ - TOPT - FRZ - RAILd           # 710 · 635 · 620
dk2_prism("dk2_top", ring(0, 0, L_, D_, (1, 1, 1, 1), 0), ZT0, H_, M_DESK, 0.003)
fr = dk2_prism("dk2_frieze", ring(0, 0, L_, D_, (1, 1, 1, 1), OVd), ZF0, ZT0, M_DESK, 0.0015)
dk2_prism("dk2_rail", ring(0, 0, L_, D_, (1, 1, 1, 1), OVd + 4), ZR0, ZF0, M_DESK)
# the monitor clamp bay: 10 in wide, 4 in in from the back edge, cut out of the frieze and rail at the back
cut = dbox("dk2_clampcut", DXO + L_ / 2 - 127, DSO + D_ - OVd - 102, ZR0 - 5, DXO + L_ / 2 + 127, DSO + D_ + 20, ZT0 - 0.5, M_DESK)
for o_ in (fr, sc.objects["dk2_rail"]):
    bo = o_.modifiers.new("clamp", "BOOLEAN"); bo.object = cut; bo.operation = "DIFFERENCE"
cut.hide_render = True; cut.hide_viewport = True
# the two pedestals and their plinths, hollowed at the outer corners only
for i, flags in enumerate(((1, 0, 0, 1), (0, 1, 1, 0))):
    x0, x1 = (0.0, 2 * OVd + PEDW) if i == 0 else (L_ - 2 * OVd - PEDW, L_)
    dk2_prism(f"dk2_ped{i}", ring(x0, 0, x1, D_, flags, OVd), PLH, ZR0, M_DESK, 0.0015)
    dk2_prism(f"dk2_plinth{i}", ring(x0, 0, x1, D_, flags, OVd - PLP), 0, PLH, M_DESK, 0.002)
    dk2_prism(f"dk2_plinthcap{i}", ring(x0, 0, x1, D_, flags, OVd - PLP + 6), PLH, PLH + 10, M_DESK, 0.002)
# the kneehole's modesty panel, set in to the clamp bay's line
dbox("dk2_modesty", DXO + OVd + PEDW, DSO + D_ - 102 - 18, 150, DXO + L_ - OVd - PEDW, DSO + D_ - 102, ZR0, M_DESK)
# drawers: three graduated on each pedestal, three in the frieze; slim brass bar pulls (brass on the handles only)
def pull(name, xc, z, w):
    dbox(name + "_bar", DXO + xc - w / 2, DSO + OVd - 30, z - 6, DXO + xc + w / 2, DSO + OVd - 22, z + 6, M_BRASS)
    for sx in (-w / 2 + 12, w / 2 - 12):
        dbox(name + f"_post{sx:.0f}", DXO + xc + sx - 5, DSO + OVd - 24, z - 5, DXO + xc + sx + 5, DSO + OVd, z + 5, M_BRASS)
for i in range(2):
    xa_, xb_ = (OVd + SO, OVd + PEDW - STL) if i == 0 else (L_ - OVd - PEDW + STL, L_ - OVd - SO)
    for k, (z0, z1) in enumerate(((PLH + 20, PLH + 214), (PLH + 222, PLH + 386), (PLH + 394, ZR0 - 10))):
        d = dbox(f"dk2_dr{i}{k}", DXO + xa_, DSO + OVd - 3, z0, DXO + xb_, DSO + OVd + 15, z1, M_DESK); bevel(d, 0.0015, 2)
        pull(f"dk2_pull{i}{k}", (xa_ + xb_) / 2, z1 - 55 if k == 2 else (z0 + z1) / 2 + 30, 128)
fx = [OVd + SO, OVd + PEDW, L_ - OVd - PEDW, L_ - OVd - SO]
for k in range(3):
    d = dbox(f"dk2_fd{k}", DXO + fx[k] + 3, DSO + OVd - 3, ZF0 + 7, DXO + fx[k + 1] - 3, DSO + OVd + 15, ZT0 - 7, M_DESK); bevel(d, 0.0015, 2)
    pull(f"dk2_fpull{k}", (fx[k] + fx[k + 1]) / 2, (ZF0 + ZT0) / 2, 96)
print(f"desk (AST-DR-045): hollow corners R{HR:.0f}, outer stile {SO}, clamp bay at the back", flush=True)
