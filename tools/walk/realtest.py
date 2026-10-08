# The realism test (owner, 9 Oct: "go all out"): real scanned surface detail from Poly Haven (CC0, tools/walk/tex/ph/,
# downloaded with the owner's OK) laid over the room's own colours — the owner's veneer and linen colours stay, the scans
# add what a photograph shows: the grain's relief and varying sheen, the weave of the linen, the nap of the suede, the
# wrinkles in leather, the hairline scratches in black lacquer. Exec'd by real.py after realism.py when REALTEST=1.
import os
PH = os.path.join(HERE, "tex", "ph")

def _img(nt, fname, colorspace, scale):
    tc = nt.nodes.new("ShaderNodeTexCoord"); mp = nt.nodes.new("ShaderNodeMapping")
    mp.inputs["Scale"].default_value = (scale, scale, scale)
    nt.links.new(tc.outputs["Object"], mp.inputs["Vector"])
    t = nt.nodes.new("ShaderNodeTexImage"); t.image = bpy.data.images.load(os.path.join(PH, fname), check_existing=True)
    t.image.colorspace_settings.name = colorspace; t.projection = "BOX"; t.projection_blend = 0.25
    nt.links.new(mp.outputs["Vector"], t.inputs["Vector"]); return t

def detail(mat_name, scan, scale, nrm, rough=None, replace=False):
    """Give a material the scan's normal (relief) and, optionally, its roughness remapped to (lo, hi). replace: drop any
    procedural bump the material had (the wave 'fabric' bump read as stripes)."""
    m = bpy.data.materials.get(mat_name)
    if not m or not m.use_nodes: print("realtest: no material", mat_name, flush=True); return
    nt = m.node_tree; b = next((n for n in nt.nodes if n.bl_idname == "ShaderNodeBsdfPrincipled"), None)
    if not b: return
    nm = nt.nodes.new("ShaderNodeNormalMap"); nm.inputs["Strength"].default_value = nrm
    tn = _img(nt, f"{scan}_nor_gl_2k.jpg", "Non-Color", scale); nt.links.new(tn.outputs["Color"], nm.inputs["Color"])
    lk = b.inputs["Normal"].links
    if lk and not replace and lk[0].from_node.bl_idname == "ShaderNodeBump" and not lk[0].from_node.inputs["Normal"].is_linked:
        nt.links.new(nm.outputs["Normal"], lk[0].from_node.inputs["Normal"])            # keep the bump, on top of the scan
    else:
        nt.links.new(nm.outputs["Normal"], b.inputs["Normal"])
    if rough:
        tr = _img(nt, f"{scan}_rough_2k.jpg", "Non-Color", scale)
        mr = nt.nodes.new("ShaderNodeMapRange"); mr.inputs["To Min"].default_value, mr.inputs["To Max"].default_value = rough
        nt.links.new(tr.outputs["Color"], mr.inputs["Value"]); nt.links.new(mr.outputs["Result"], b.inputs["Roughness"])
    print(f"realtest: {mat_name} <- {scan}", flush=True)

# veneers (the owner's Dark Diva and burl colours kept): real grain relief, sheen that wanders like a hand-rubbed polish
for mn in ("dark_diva_crown", "teak_desk", "burl_diva", "burl_dark", "sidetable_dark"):
    detail(mn, "sapele_veneer_02", 1.0, 0.18, (0.12, 0.30))
# bedding: the linen's weave and its matte, slightly uneven sheen (the old wave bump goes)
for mn in ("linen_white", "linen_ivory", "linen_taupe"):
    detail(mn, "rough_linen", 3.5, 0.65, (0.72, 0.98), replace=True)
detail("headboard_finish", "scuba_suede", 3.0, 0.35, (0.75, 0.95), replace=True)            # the rose suede's nap
detail("bed_base_finish", "lacquered_cherry_wood", 1.2, 0.04, (0.025, 0.12))               # hairline scratches in the gloss black
detail("royal_green_leather", "fabric_leather_02", 2.5, 0.55)                               # the chair: real leather creasing
detail("leather_oxblood", "fabric_leather_02", 3.0, 0.4, (0.35, 0.55))
detail("red_velvet", "scuba_suede", 4.0, 0.25)

# render: more samples and a stricter noise floor, and the denoiser's careful mode, so fine texture survives
cy = sc.cycles
cy.samples = int(os.environ.get("RT_SPP", 768)); cy.adaptive_threshold = 0.006
try: cy.denoising_prefilter = "ACCURATE"; cy.denoising_quality = "HIGH"
except Exception as e: print("realtest denoise?", e, flush=True)
cy.max_bounces = 12; cy.diffuse_bounces = 6; cy.glossy_bounces = 6; cy.sample_clamp_indirect = 10.0
print("realtest: on", cy.samples, "spp", flush=True)
