#!/usr/bin/env bash
# skillsaarthi one-command dev launcher (macOS / Linux).
#
# Opens one terminal window per service:
#   1. Frontend (Vite)      -> http://localhost:5173   (repo root / npm run dev)
#   2. Backend (Express)    -> http://localhost:5000   (server/    / npm run dev)
#   3. AI Service (FastAPI) -> http://localhost:8000   (ai-service/ uvicorn app.main:app)
#
# It checks for missing dependencies first (node_modules and the ai-service
# virtualenv) and installs them before launching the windows.
#
# Usage:
#   ./dev.sh

set -e

ROOT="$(cd "$(dirname "$0")" && pwd)"
SERVER_DIR="$ROOT/server"
AI_DIR="$ROOT/ai-service"
VENV_PYTHON="$AI_DIR/venv/bin/python"

echo ""
echo "===== skillsaarthi dev launcher ====="

# --- Frontend dependencies (repo root) ---
if [ ! -d "$ROOT/node_modules" ]; then
  echo "Installing frontend dependencies (npm install) ..."
  (cd "$ROOT" && npm install)
fi

# --- Backend dependencies (server/) ---
if [ ! -d "$SERVER_DIR/node_modules" ]; then
  echo "Installing backend dependencies (npm install) ..."
  (cd "$SERVER_DIR" && npm install)
fi

# --- AI service virtualenv + requirements ---
if [ ! -x "$VENV_PYTHON" ]; then
  echo "Creating AI service virtualenv ..."
  (cd "$AI_DIR" && python3 -m venv venv)
fi
if [ -x "$VENV_PYTHON" ]; then
  echo "Installing AI service requirements ..."
  (cd "$AI_DIR" && "$VENV_PYTHON" -m pip install -r requirements.txt -q)
fi

open_terminal() {
  local title="$1"
  local cmd="$2"
  if command -v gnome-terminal >/dev/null 2>&1; then
    gnome-terminal --title "$title" -- bash -c "$cmd"
  elif command -v xterm >/dev/null 2>&1; then
    xterm -T "$title" -e bash -c "$cmd" &
  elif [[ "$(uname)" == "Darwin" ]]; then
    osascript -e "tell application \"Terminal\" to do script \"$cmd\""
  else
    echo "No supported terminal found; running '$title' in background."
    bash -c "$cmd" &
  fi
}

open_terminal "Frontend"    "cd '$ROOT' && npm run dev"
open_terminal "Backend"     "cd '$SERVER_DIR' && npm run dev"
open_terminal "AI Service"  "cd '$AI_DIR' && '$VENV_PYTHON' -m uvicorn app.main:app --reload"

echo ""
echo "Launched 3 windows. Keep them all open:"
echo "  1. Frontend   -> http://localhost:5173"
echo "  2. Backend    -> http://localhost:5000"
echo "  3. AI Service -> http://localhost:8000"
echo "Closing a window stops that service."