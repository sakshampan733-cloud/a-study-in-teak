#!/bin/sh
# Rebuild the editable CAD files in cad/ after changing any drawing.
# First time only: python3 -m venv tools/.venv && tools/.venv/bin/pip install ezdxf svgelements shapely
set -e
cd "$(dirname "$0")/.."
node tools/dump-cad.js
tools/.venv/bin/python tools/svg2dxf.py
tools/.venv/bin/python tools/import_plans.py
