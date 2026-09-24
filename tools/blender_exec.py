#!/usr/bin/env python3
"""Send Python code to the running Blender's MCP-for-Blender addon socket and print the result.

Bypasses the mcp__Blender__* tool bridge, which was stuck (holding a dead connection) on
2026-09-24 while the addon's own socket server answered correctly. Talks the addon's raw
protocol directly: one JSON object per request, newline-agnostic, response is JSON with a
"status" key ("success" or "error") and a "result" (or "message" on error).

Usage:
    tools/.venv/bin/python tools/blender_exec.py "<python code>"
    tools/.venv/bin/python tools/blender_exec.py -f path/to/script.py

The addon returns whatever the code PRINTS (stdout), not a `result` variable — so print() what
you want back. For structured data, print(json.dumps(...)) and parse it on this side.
"""
import json
import socket
import sys

HOST, PORT = "127.0.0.1", 9876


def send(cmd_type, params=None, timeout=30):
    s = socket.create_connection((HOST, PORT), timeout=5)
    s.settimeout(timeout)
    s.sendall(json.dumps({"type": cmd_type, "params": params or {}}).encode())
    data = b""
    try:
        while True:
            chunk = s.recv(65536)
            if not chunk:
                break
            data += chunk
            if len(chunk) < 65536:
                break
    except socket.timeout:
        pass
    s.close()
    return json.loads(data.decode()) if data else {"status": "error", "message": "no response"}


def run_code(code, timeout=60):
    return send("execute_code", {"code": code}, timeout=timeout)


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(__doc__)
        sys.exit(1)
    if sys.argv[1] == "-f":
        code = open(sys.argv[2]).read()
    else:
        code = sys.argv[1]
    out = run_code(code)
    print(json.dumps(out, indent=2))
