#!/usr/bin/env bash
# Start the concept-book FastAPI backend.
# Must be run inside the spl123 conda env (so spl3 is on PATH).
#
# One-time setup:
#   conda activate spl123
#   pip install -r requirements-api.txt
#
# Then start:
#   conda activate spl123
#   bash scripts/start-api.sh
set -euo pipefail
REPO="$(cd "$(dirname "$0")/.." && pwd)"
cd "$REPO"
API_PORT="$(grep -m1 '^API_PORT=' "$REPO/.env" 2>/dev/null | cut -d= -f2)"
API_PORT="${API_PORT:-8200}"
# Localhost-only: this backend now holds user-supplied LLM API keys
# (Settings page) and exposes side-effecting GET endpoints (/api/generate,
# /api/pdf) — 0.0.0.0 would let any device on the LAN reach them, and any
# website the user visits could fire cross-origin requests against them.
# If you genuinely need LAN access, bind an explicit interface IP, not
# 0.0.0.0, and keep CORS narrow (see api/app.py).
uvicorn api.app:app --host 127.0.0.1 --port "$API_PORT" --reload
