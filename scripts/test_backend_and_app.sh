#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BACKEND_DIR="$ROOT_DIR/backend"

BACKEND_HOST="${BACKEND_HOST:-127.0.0.1}"
BACKEND_PORT="${BACKEND_PORT:-8000}"
BASE_URL="http://${BACKEND_HOST}:${BACKEND_PORT}"
RUN_AI_TESTS="${RUN_AI_TESTS:-0}"

if ! command -v python3 >/dev/null 2>&1; then
  echo "python3 is required" >&2
  exit 1
fi

if ! command -v npm >/dev/null 2>&1; then
  echo "npm is required" >&2
  exit 1
fi

if [ ! -d "$ROOT_DIR/node_modules" ]; then
  echo "Installing frontend dependencies..."
  (cd "$ROOT_DIR" && npm install)
fi

if [ ! -d "$BACKEND_DIR/venv" ]; then
  echo "Creating backend virtualenv..."
  python3 -m venv "$BACKEND_DIR/venv"
fi

# shellcheck source=/dev/null
if [ -d "$BACKEND_DIR/venv/Scripts" ]; then
  source "$BACKEND_DIR/venv/Scripts/activate"
else
  source "$BACKEND_DIR/venv/bin/activate"
fi

echo "Installing backend dependencies..."
pip install -r "$BACKEND_DIR/requirements.txt" >/dev/null

export AI_PROVIDER="${AI_PROVIDER:-gemini}"

BACKEND_PID=""
cleanup() {
  if [ -n "$BACKEND_PID" ] && kill -0 "$BACKEND_PID" >/dev/null 2>&1; then
    kill "$BACKEND_PID" >/dev/null 2>&1 || true
    wait "$BACKEND_PID" 2>/dev/null || true
  fi
}
trap cleanup EXIT

echo "Starting backend on ${BASE_URL}..."
(
  cd "$BACKEND_DIR"
  python main.py
) >/tmp/crt4m-backend.log 2>&1 &
BACKEND_PID=$!

echo "Waiting for backend to become ready..."
for _ in {1..40}; do
  if curl -fsS "$BASE_URL/api/config" >/dev/null; then
    break
  fi
  sleep 0.5
done

if ! curl -fsS "$BASE_URL/api/config" >/dev/null; then
  echo "Backend failed to start. Last backend logs:" >&2
  tail -n 80 /tmp/crt4m-backend.log >&2 || true
  exit 1
fi

echo "Running backend smoke tests..."
curl -fsS "$BASE_URL/api/config" >/dev/null

DOC_ID="smoke-$(date +%s)"
ANNOTATION_PAYLOAD=$(cat <<JSON
{"document_id":"${DOC_ID}","page":1,"note":"smoke test note","selected_text":"smoke"}
JSON
)

ANNOTATION_RESPONSE=$(curl -fsS -X POST "$BASE_URL/api/annotations" \
  -H "Content-Type: application/json" \
  -d "$ANNOTATION_PAYLOAD")

ANNOTATION_ID=$(python3 -c 'import json,sys; print(json.loads(sys.stdin.read())["id"])' <<<"$ANNOTATION_RESPONSE")

curl -fsS "$BASE_URL/api/annotations/${DOC_ID}" >/dev/null
curl -fsS -X DELETE "$BASE_URL/api/annotations/${DOC_ID}/${ANNOTATION_ID}" >/dev/null

if [ "$RUN_AI_TESTS" = "1" ]; then
  echo "RUN_AI_TESTS=1, running AI endpoint smoke tests..."
  curl -fsS -X POST "$BASE_URL/api/analyze/translate" \
    -H "Content-Type: application/json" \
    -d '{"text":"Hola mundo","target_language":"English"}' >/dev/null
  curl -fsS -X POST "$BASE_URL/api/analyze/summarize" \
    -H "Content-Type: application/json" \
    -d '{"text":"This is a short passage for summary testing."}' >/dev/null
  curl -fsS -X POST "$BASE_URL/api/analyze/vocabulary" \
    -H "Content-Type: application/json" \
    -d '{"text":"Ephemeral and ubiquitous are useful vocabulary words."}' >/dev/null
fi

echo "Running frontend checks..."
(cd "$ROOT_DIR" && npm run lint)
(cd "$ROOT_DIR" && npm run build)

echo "All backend and full-application checks passed."
