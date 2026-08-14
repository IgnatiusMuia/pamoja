#!/usr/bin/env bash
# Pamoja — start backend + frontend with one command.
# Usage: ./start.sh   (stop: Ctrl+C, or ./stop.sh)

set -e
ROOT="$(cd "$(dirname "$0")" && pwd)"

echo "▶ Starting Pamoja backend (FastAPI) on http://127.0.0.1:8000"
(cd "$ROOT/backend" && nohup .venv/bin/uvicorn app.main:app --host 127.0.0.1 --port 8000 > /tmp/uvicorn.log 2>&1 &)
sleep 4

echo "▶ Starting Pamoja frontend (Next.js) on http://localhost:3000"
(cd "$ROOT/frontend" && nohup npm run dev > /tmp/next-dev.log 2>&1 &)
sleep 6

echo ""
echo "  ✅ Backend  → http://127.0.0.1:8000  (docs: /docs, health: /health)"
echo "  ✅ Frontend → http://localhost:3000"
echo ""
echo "  Logs: tail -f /tmp/uvicorn.log · tail -f /tmp/next-dev.log"