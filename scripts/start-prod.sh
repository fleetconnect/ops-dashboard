#!/usr/bin/env bash
# Production entrypoint for the Next.js dashboard, used by launchd. Serves the compiled
# build on the canonical internal port 4100. Run "npm run build" before (re)starting.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
export PATH="/Users/fleetconnect/.local/bin:/opt/homebrew/bin:/usr/bin:/bin:${PATH:-}"
export NODE_ENV=production

if [ ! -d ".next" ]; then
  echo "[start-prod] ERROR: .next missing — run 'npm run build' first" >&2
  exit 1
fi

exec node_modules/.bin/next start -p 4100
