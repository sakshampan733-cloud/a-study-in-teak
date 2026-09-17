#!/bin/sh
# Rebuild the editable CAD files in cad/ after changing any drawing.
# First time only: python3 -m venv tools/.venv && tools/.venv/bin/pip install ezdxf svgelements shapely
set -e
cd "$(dirname "$0")/.."
node tools/dump-cad.js
tools/.venv/bin/python tools/svg2dxf.py
tools/.venv/bin/python tools/import_plans.py
# Stamp script and stylesheet links so browsers load the new drawings instead of a cached copy.
v=$(date +%Y%m%d%H%M%S)
sed -i '' -E "s#(src=\"[^\"]+\.js)(\?v=[0-9]+)?\"#\1?v=$v\"#g; s#(href=\"styles\.css)(\?v=[0-9]+)?\"#\1?v=$v\"#" index.html
