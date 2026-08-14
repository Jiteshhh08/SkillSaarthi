#!/usr/bin/env bash
# Kills any leftover Skill_Guide dev servers listening on ports 5173 (Vite),
# 5000 (Express), and 8000 (FastAPI/uvicorn). Safe to re-run.
# Also stops the uvicorn --reload parent so it does not respawn the server.

for port in 5173 5000 8000; do
  pid="$(lsof -ti :$port 2>/dev/null)"
  [ -n "$pid" ] && kill -9 $pid 2>/dev/null || true
done

pkill -f 'uvicorn app.main:app' 2>/dev/null || true

echo 'Old dev servers stopped (ports 5173, 5000, 8000 are free).'