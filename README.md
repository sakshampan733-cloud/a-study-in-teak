# A Study in Teak

Working brief for the interior of one room — neoclassical, late-1940s British, in teak.
A static website: open `index.html`, or serve the folder and browse by section.

```bash
python3 -m http.server 4178
```

## What's where

| Path | What it holds |
|---|---|
| `data.js` | All written content: materials, each piece of furniture, doors, lighting and switch plan |
| `drawings/` | Parametric drawing sheets (desk, door) and the hidden-line 3D renderer — change the numbers at the top of a file and every view redraws |
| `cad/` | Editable CAD exports: `*-model.dxf` true size in mm, `*-sheet.dxf` the A3 sheet, `*.svg` |
| `assets/refs/` | Reference photos |
| `tools/` | Scripts that rebuild the CAD files |

## Rebuilding the CAD files

After changing a drawing:

```bash
python3 -m venv tools/.venv && tools/.venv/bin/pip install ezdxf svgelements shapely   # first time only
tools/build-cad.sh
```

Status: rough work. Sizes and details are finalised with the family before anything is made.
