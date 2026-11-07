#!/usr/bin/env bash
set -e

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$DIR"

echo "============================================="
echo "   Mise Restaurant Operating System (Desktop) "
echo "============================================="

# Ensure dist exists
if [ ! -d "$DIR/dist" ]; then
  echo "[1/3] Building production bundle..."
  npm run build
fi

PORT=4173
HOST="0.0.0.0"
URL="http://localhost:$PORT"

# Check if server is already running on port 4173
if ! curl -s --head --request GET "$URL" | grep -q "200\|404\|HTTP"; then
  echo "[2/3] Starting Mise local server on $URL..."
  npx vite preview --port $PORT --host $HOST > /dev/null 2>&1 &
  SERVER_PID=$!
  sleep 1.5
else
  echo "[2/3] Mise server already active on $URL."
fi

echo "[3/3] Launching Mise POS Desktop Interface..."

# Check available browsers with standalone app-mode window
if command -v chromium >/dev/null 2>&1; then
  chromium --app="$URL" --user-data-dir="/tmp/mise-chromium-profile" >/dev/null 2>&1 &
elif command -v brave >/dev/null 2>&1; then
  brave --app="$URL" --user-data-dir="/tmp/mise-brave-profile" >/dev/null 2>&1 &
elif command -v google-chrome >/dev/null 2>&1; then
  google-chrome --app="$URL" >/dev/null 2>&1 &
elif command -v xdg-open >/dev/null 2>&1; then
  xdg-open "$URL" >/dev/null 2>&1 &
elif command -v firefox >/dev/null 2>&1; then
  firefox "$URL" >/dev/null 2>&1 &
else
  echo "Please open $URL in your web browser."
fi

echo ""
echo "Mise POS is running at: $URL"
echo "Network devices (Kitchen, Waiter, Counter) can connect at:"
ip route get 1 2>/dev/null | awk '{print "http://" $7 ":4173"}' || echo "http://<LOCAL_IP>:4173"
echo "============================================="

