#!/usr/bin/env bash
# One-time dependency installer for skillsaarthi (macOS / Linux).
# Installs frontend, backend, and AI-service dependencies if missing.
# Used by .vscode/tasks.json ("setup: install all dependencies") and safe to run directly.

set -e

ROOT="$(cd "$(dirname "$0")" && pwd)"
SERVER_DIR="$ROOT/server"
AI_DIR="$ROOT/ai-service"
VENV_PYTHON="$AI_DIR/venv/bin/python"

echo ""
echo "===== skillsaarthi dependency installer ====="

if [ ! -d "$ROOT/node_modules" ]; then
  echo "Installing frontend dependencies (npm install) ..."
  (cd "$ROOT" && npm install)
else
  echo "Frontend dependencies already installed."
fi

if [ ! -d "$SERVER_DIR/node_modules" ]; then
  echo "Installing backend dependencies (npm install) ..."
  (cd "$SERVER_DIR" && npm install)
else
  echo "Backend dependencies already installed."
fi

if [ ! -x "$VENV_PYTHON" ]; then
  echo "Creating AI service virtualenv ..."
  (cd "$AI_DIR" && python3 -m venv venv)
fi

if [ -x "$VENV_PYTHON" ]; then
  echo "Installing AI service requirements ..."
  (cd "$AI_DIR" && "$VENV_PYTHON" -m pip install -r requirements.txt -q)
else
  echo "WARNING: could not find or create ai-service/venv." >&2
fi

echo ""
echo "Dependencies ready."