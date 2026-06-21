#!/usr/bin/env bash
# Write .env.local from args or env vars (non-interactive).
# Usage:
#   ./scripts/write-env.sh https://xxx.supabase.co eyJhbG...
#   VITE_SUPABASE_URL=... VITE_SUPABASE_ANON_KEY=... ./scripts/write-env.sh

set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"

URL="${1:-${VITE_SUPABASE_URL:-}}"
ANON="${2:-${VITE_SUPABASE_ANON_KEY:-}}"
HASH="${VITE_SITE_PASSWORD_HASH:-ec773d162576ebd13f3bc1276e30ad2b80322b58e5a762659af322309a8f2377}"

if [[ -z "$URL" || -z "$ANON" ]]; then
  echo "Usage: ./scripts/write-env.sh <project-url> <anon-key>"
  exit 1
fi

cat > "${ROOT}/.env.local" <<ENV
VITE_SUPABASE_URL=${URL}
VITE_SUPABASE_ANON_KEY=${ANON}
VITE_SITE_PASSWORD_HASH=${HASH}
ENV

echo "Wrote ${ROOT}/.env.local"
echo "  URL: ${URL}"
