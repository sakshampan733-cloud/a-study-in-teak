# The photoreal pass (owner, 8 Nov: "make it look more realistic… go all out"). Exec'd by real.py after realism.py and
# realtest.py when PHOTO=1. It changes nothing in the design — no colour, no shape, no layout — only what tells a
# photograph from a render:
#   1 light that is allowed to bounce as it does (no clamp on bright bounces, deeper bounces)
#   2 no two panels cut from the same spot of the same veneer flitch (each object's grain starts somewhere else)
#   3 handled surfaces: faint smudges in the gloss, the brass and the mirrors
#   4 lamp shades that glow through their fabric, not white plastic
#   5 paint with a roller's texture; edges rounded at render time; the denoiser's careful mode
import os, math
PR = {k: os.environ.get(k) for k in ("PR_CLAMP", "PR_SMUDGE", "PR_SHADE")}

# ── 1 · light ─────────────────────────────────────────────────────────────────
cy = sc.cycles
cy.max_bounces = 16; cy.diffuse_bounces = 8; cy.glossy_bounces = 8; cy.transmission_bounces = 12; cy.transparent_max_bounces = 16
cy.sample_clamp_indirect = float(PR["PR_CLAMP"] or 30.0)     # was 6: bright bounce light (lamp pools on veneer) was being cut off
cy.sample_clamp_direct = 0.0
try: cy.denoising_prefilter = "ACCURATE"; cy.denoising_quality = "HIGH"; cy.denoising_use_gpu = True
except Exception as e: print("photoreal denoise?", e, flush=True)

# ── 2 · every panel its own piece of the flitch ──────────────────────────────
# The image textures are box-mapped in object space from the same origin, so neighbouring doors and panels showed the
# same figure in the same place — the surest sign of CG wood. Offset each object's mapping by its own random number.
def vary_mapping(m, amount=2.5):
    nt = m.node_tree; n = 0
    for mp in [x for x in nt.nodes if x.bl_idname == "ShaderNodeMapping"]:
        if mp.inputs["Location"].is_linked: continue
        if not any(l.to_node.bl_idname == "ShaderNodeTexImage" for l in mp.outputs["Vector"].links): continue
        oi = nt.nodes.new("ShaderNodeObjectInfo"); mul = nt.nodes.new("ShaderNodeVectorMath"); mul.operation = "SCALE"
        mul.inputs["Scale"].default_value = amount
        cmb = nt.nodes.new("ShaderNodeCombineXYZ")
        nt.links.new(oi.outputs["Random"], cmb.inputs["X"]); nt.links.new(oi.outputs["Random"], cmb.inputs["Z"])
        vm = nt.nodes.new("ShaderNodeVectorMath"); vm.operation = "MULTIPLY"; vm.inputs[1].default_value = (1.0, 0.37, 0.61)
        nt.links.new(cmb.outputs["Vector"], vm.inputs[0]); nt.links.new(vm.outputs["Vector"], mul.inputs[0])
        nt.links.new(mul.outputs["Vector"], mp.inputs["Location"]); n += 1
    return n
for mn in ("dark_diva_crown", "teak_desk", "burl_diva", "burl_dark", "sidetable_dark", "taupe_marble", "white_marble", "beige_marble"):
    m = bpy.data.materials.get(mn)
    if m and m.use_nodes: print("photoreal: grain varied", mn, vary_mapping(m, 0.9 if "marble" in mn else 2.5), flush=True)

# ── 3 · handled surfaces ─────────────────────────────────────────────────────
# Smudges: soft, irregular patches where the gloss is a little duller (and the clear coat with it). Subtle — seen only
# where a highlight crosses them, which is exactly where a photograph shows them.
SMUDGE = float(PR["PR_SMUDGE"] or 1.0)
def smudge(m, amt):
    if not m or not m.use_nodes: return
    nt = m.node_tree; b = next((n for n in nt.nodes if n.bl_idname == "ShaderNodeBsdfPrincipled"), None)
    if not b: return
    n1 = nt.nodes.new("ShaderNodeTexNoise"); n1.inputs["Scale"].default_value = 4.0; n1.inputs["Detail"].default_value = 12; n1.inputs["Roughness"].default_value = 0.65
    n2 = nt.nodes.new("ShaderNodeTexNoise"); n2.inputs["Scale"].default_value = 38.0; n2.inputs["Detail"].default_value = 4
    tc = nt.nodes.new("ShaderNodeTexCoord"); nt.links.new(tc.outputs["Object"], n1.inputs["Vector"]); nt.links.new(tc.outputs["Object"], n2.inputs["Vector"])
    mx = nt.nodes.new("ShaderNodeMath"); mx.operation = "MULTIPLY"; nt.links.new(n1.outputs["Fac"], mx.inputs[0]); nt.links.new(n2.outputs["Fac"], mx.inputs[1])
    ramp = nt.nodes.new("ShaderNodeMapRange"); ramp.inputs["From Min"].default_value = 0.30; ramp.inputs["From Max"].default_value = 0.42
    ramp.inputs["To Min"].default_value = 0.0; ramp.inputs["To Max"].default_value = amt * SMUDGE
    nt.links.new(mx.outputs["Value"], ramp.inputs["Value"])
    for sock in ("Roughness", "Coat Roughness"):
        s = b.inputs.get(sock)
        if s is None: continue
        if sock == "Coat Roughness" and b.inputs["Coat Weight"].default_value < 0.05: continue
        add = nt.nodes.new("ShaderNodeMath"); add.operation = "ADD"; add.use_clamp = True
        if s.is_linked: nt.links.new(s.links[0].from_socket, add.inputs[0])
        else: add.inputs[0].default_value = s.default_value
        nt.links.new(ramp.outputs["Result"], add.inputs[1]); nt.links.new(add.outputs["Value"], s)
    print("photoreal: smudge", m.name, flush=True)
for mn, a in (("brass", 0.18), ("chrome", 0.10), ("mirror", 0.05), ("bed_base_finish", 0.12), ("ceiling_gloss", 0.04),
              ("dark_diva_crown", 0.08), ("teak_desk", 0.10), ("burl_diva", 0.08), ("burl_dark", 0.08), ("sidetable_dark", 0.08),
              ("shelf_ceramic", 0.08), ("lamp_porcelain", 0.08), ("taupe_marble", 0.06), ("white_marble", 0.06), ("beige_marble", 0.06)):
    smudge(bpy.data.materials.get(mn), a)

# ── 4 · lamp shades: fabric lit from inside ──────────────────────────────────
# The shade's glow came mostly from a flat emission, which reads as white plastic. Let the bulb's own light pass through
# the fabric (more translucency, a warm silk colour), keep only a little emission, and give it a weave.
ms = bpy.data.materials.get("lamp_shade")
if ms:
    nt = ms.node_tree; b = nt.nodes["Principled BSDF"]
    b.inputs["Emission Strength"].default_value = float(PR["PR_SHADE"] or 0.35)
    mix = next(n for n in nt.nodes if n.bl_idname == "ShaderNodeMixShader"); mix.inputs["Fac"].default_value = 0.72
    tr = next(n for n in nt.nodes if n.bl_idname == "ShaderNodeBsdfTranslucent"); tr.inputs["Color"].default_value = (1.0, 0.82, 0.58, 1)
    wv = nt.nodes.new("ShaderNodeTexWave"); wv.wave_type = "BANDS"; wv.inputs["Scale"].default_value = 900; wv.inputs["Distortion"].default_value = 2
    bp = nt.nodes.new("ShaderNodeBump"); bp.inputs["Strength"].default_value = 0.2; bp.inputs["Distance"].default_value = 0.0002
    nt.links.new(wv.outputs["Fac"], bp.inputs["Height"]); nt.links.new(bp.outputs["Normal"], b.inputs["Normal"]); nt.links.new(bp.outputs["Normal"], tr.inputs["Normal"])
    print("photoreal: shades", flush=True)
for o in sc.objects:                                         # brighter bulbs make up what the emission no longer gives
    if o.type == "LIGHT" and "_bulb" in o.name and not o.name.startswith("lamp_"): o.data.energy *= float(os.environ.get("PR_BULB", 1.6))

# ── 5 · paint, edges ─────────────────────────────────────────────────────────
# a roller's orange-peel on the walls: a fine stipple on top of the existing bump, only seen where light rakes the wall
for mn in ("cream_paint", "ceiling_paint"):
    m = bpy.data.materials.get(mn)
    if not m: continue
    nt = m.node_tree; b = nt.nodes["Principled BSDF"]
    vo = nt.nodes.new("ShaderNodeTexVoronoi"); vo.inputs["Scale"].default_value = 900
    bp = nt.nodes.new("ShaderNodeBump"); bp.inputs["Strength"].default_value = 0.08; bp.inputs["Distance"].default_value = 0.0003
    nt.links.new(vo.outputs["Distance"], bp.inputs["Height"])
    if b.inputs["Normal"].is_linked: nt.links.new(b.inputs["Normal"].links[0].from_socket, bp.inputs["Normal"])
    nt.links.new(bp.outputs["Normal"], b.inputs["Normal"])

# ── 6 · bedding that has been slept in a little ──────────────────────────────
# The cloth sim gives the right drape but the surfaces between the folds stayed glass-smooth, and the modelled pillows
# read as cushions cut from foam. Two scales of crease, as pressed linen has: soft swells a hand-width across (geometry,
# a few mm) and fine creases running mostly one way (a stretched noise in the shading). Shapes and layout unchanged.
def crease_shader(m, strength=0.35, scale=12.0, stretch=4.0):
    if not m or not m.use_nodes or m.get("pr_crease"): return
    nt = m.node_tree; b = next((n for n in nt.nodes if n.bl_idname == "ShaderNodeBsdfPrincipled"), None)
    if not b: return
    tc = nt.nodes.new("ShaderNodeTexCoord"); mp = nt.nodes.new("ShaderNodeMapping"); mp.inputs["Scale"].default_value = (1.0, stretch, 1.0)
    nt.links.new(tc.outputs["Object"], mp.inputs["Vector"])
    n = nt.nodes.new("ShaderNodeTexNoise"); n.inputs["Scale"].default_value = scale; n.inputs["Detail"].default_value = 6; n.inputs["Distortion"].default_value = 0.6
    nt.links.new(mp.outputs["Vector"], n.inputs["Vector"])
    ridge = nt.nodes.new("ShaderNodeMath"); ridge.operation = "PINGPONG"; ridge.inputs[1].default_value = 0.5      # sharp-crested creases, not bumps
    nt.links.new(n.outputs["Fac"], ridge.inputs[0])
    bp = nt.nodes.new("ShaderNodeBump"); bp.inputs["Strength"].default_value = strength; bp.inputs["Distance"].default_value = 0.003
    nt.links.new(ridge.outputs["Value"], bp.inputs["Height"])
    if b.inputs["Normal"].is_linked: nt.links.new(b.inputs["Normal"].links[0].from_socket, bp.inputs["Normal"])
    nt.links.new(bp.outputs["Normal"], b.inputs["Normal"]); m["pr_crease"] = 1
    print("photoreal: creases", m.name, flush=True)
for mn, st in (("linen_white", 0.6), ("linen_ivory", 0.7), ("linen_taupe", 0.5), ("suede_taupe", 0.25)):
    crease_shader(bpy.data.materials.get(mn), st)
SWELL = float(os.environ.get("PR_SWELL", 0.010))
for o in [o for o in sc.objects if o.type == "MESH" and o.name.startswith(("duvet", "sheet_fold", "throw", "pillow_", "cushion_"))]:
    if not any(md.type == "SUBSURF" for md in o.modifiers):
        ss = o.modifiers.new("pr_sub", "SUBSURF"); ss.levels = 0; ss.render_levels = 1
    tx = bpy.data.textures.new(o.name + "_swell", "CLOUDS"); tx.noise_scale = 0.09 if o.name.startswith(("pillow", "cushion")) else 0.14; tx.noise_depth = 2
    dp = o.modifiers.new("pr_swell", "DISPLACE"); dp.texture = tx; dp.texture_coords = "GLOBAL"; dp.mid_level = 0.5
    dp.strength = SWELL * (0.7 if o.name.startswith(("pillow", "cushion")) else 1.0)
    print("photoreal: swell", o.name, flush=True)

# ── 7 · the downlights' discs: a warm white, not the cold blue the white balance turned them ──
md = bpy.data.materials.get("spot_disc")
if md:
    b = md.node_tree.nodes["Principled BSDF"]; b.inputs["Emission Color"].default_value = (1.0, 0.66, 0.36, 1)
    b.inputs["Base Color"].default_value = (1.0, 0.66, 0.36, 1)
print("photoreal pass done", flush=True)
