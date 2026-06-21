#!/usr/bin/env bash
# Verify .env.local Supabase connection and trip_state table.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"

if [[ ! -f "${ROOT}/.env.local" ]]; then
  echo "Missing .env.local — run ./scripts/write-env.sh <url> <anon-key>"
  exit 1
fi

set -a
# shellcheck disable=SC1091
source "${ROOT}/.env.local"
set +a

echo "Testing ${VITE_SUPABASE_URL} …"
RESP=$(curl -sS -w "\n%{http_code}" \
  -H "apikey: ${VITE_SUPABASE_ANON_KEY}" \
  -H "Authorization: Bearer ${VITE_SUPABASE_ANON_KEY}" \
  "${VITE_SUPABASE_URL}/rest/v1/trip_state?id=eq.twain-harte-2026&select=id,updated_at")

BODY=$(echo "$RESP" | sed '$d')
CODE=$(echo "$RESP" | tail -1)

if [[ "$CODE" == "200" ]]; then
  echo "OK — trip_state reachable"
  echo "$BODY" | python3 -m json.tool 2>/dev/null || echo "$BODY"
  exit 0
fi

if [[ "$CODE" == "404" ]] || echo "$BODY" | grep -q "trip_state"; then
  echo "Connected but trip_state missing (HTTP $CODE)."
  echo "Run supabase/schema.sql in the SQL editor:"
  echo "  ${ROOT}/supabase/schema.sql"
  exit 2
fi

echo "Failed (HTTP $CODE): $BODY"
exit 1
