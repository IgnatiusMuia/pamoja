#!/usr/bin/env bash
# Pamoja — stop both servers.
pkill -f "uvicorn app.main" 2>/dev/null && echo "Backend stopped"
pkill -f "next dev" 2>/dev/null && echo "Frontend stopped"
echo "Done."