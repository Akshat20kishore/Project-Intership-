#!/usr/bin/env bash
set -e

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT_DIR"

echo "=== Vana Botanicals — Starting Local Environment ==="

# Check for Python 3.12 or fallback to python3
if command -v python3.12 >/dev/null 2>&1; then
  PYTHON_CMD="python3.12"
elif command -v python3 >/dev/null 2>&1; then
  PYTHON_CMD="python3"
else
  echo "Error: Python 3 is required."
  exit 1
fi

# Detect if port 8000 is already in use
if lsof -Pi :8000 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
  API_PORT=8001
  WEB_PORT=3001
  echo "Port 8000 is in use. Running Vana Botanicals on API port $API_PORT and Web port $WEB_PORT."
else
  API_PORT=8000
  WEB_PORT=3000
fi

# 1. Setup Backend
if [ ! -d "backend/.venv" ]; then
  echo "Creating Python virtual environment with $PYTHON_CMD..."
  $PYTHON_CMD -m venv backend/.venv
  backend/.venv/bin/pip install --upgrade pip
  backend/.venv/bin/pip install -r backend/requirements.txt
fi

if [ ! -f "backend/.env" ]; then
  cp backend/.env.example backend/.env
fi

# 2. Setup Frontend
if [ ! -d "frontend/node_modules" ]; then
  echo "Installing frontend packages..."
  (cd frontend && npm install)
fi

if [ ! -f "frontend/.env.local" ]; then
  cp frontend/.env.example frontend/.env.local
fi

cleanup() {
  echo ""
  echo "Shutting down Vana Botanicals servers..."
  kill $(jobs -p) 2>/dev/null || true
  exit 0
}
trap cleanup SIGINT SIGTERM EXIT

# Start Backend API
echo "Starting Backend API on http://localhost:$API_PORT ..."
(cd backend && .venv/bin/python3 -m uvicorn app.main:app --reload --port "$API_PORT") &

# Start Frontend UI
echo "Starting Frontend UI on http://localhost:$WEB_PORT ..."
(cd frontend && NEXT_PUBLIC_API_URL="http://localhost:$API_PORT" PORT="$WEB_PORT" npm run dev -- -p "$WEB_PORT") &

wait
