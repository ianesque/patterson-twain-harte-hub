#!/usr/bin/env bash
# One-time Supabase provisioning for Patterson Trip Hub.
#
#   export SUPABASE_ACCESS_TOKEN=sbp_...   # https://supabase.com/dashboard/account/tokens
#   ./scripts/setup-supabase.sh
#
# If Cloudflare blocks API calls (error 1010), use the dashboard instead:
#   ./scripts/setup-supabase.sh --manual
#
# List orgs:
#   ./scripts/setup-supabase.sh --list-orgs

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
PROJECT_NAME="${SUPABASE_PROJECT_NAME:-patterson-twain-harte}"
DB_PASS="${SUPABASE_DB_PASSWORD:-$(openssl rand -base64 24 | tr -d '/+=' | head -c 24)}"
ORG_ID="${SUPABASE_ORG_ID:-}"
ORG_NAME="${SUPABASE_ORG_NAME:-}"
REGION="${SUPABASE_REGION:-us-west-1}"
API="https://api.supabase.com/v1"

# Cloudflare blocks Python-urllib and bare bots; use curl with explicit headers.
curl_api() {
  local method="$1"
  local path="$2"
  local data="${3:-}"
  local tmp body code
  tmp="$(mktemp)"

  local curl_args=(
    -sS
    -o "$tmp"
    -w "%{http_code}"
    -X "$method"
    -H "Authorization: Bearer ${SUPABASE_ACCESS_TOKEN}"
    -H "Accept: application/json"
    -H "User-Agent: curl/8.4.0 (Patterson-Trip-Hub; Supabase-Management-API)"
  )

  if [[ -n "$data" ]]; then
    curl_args+=(-H "Content-Type: application/json" -d "$data")
  fi

  code="$(curl "${curl_args[@]}" "${API}${path}" 2>"${tmp}.err" || true)"
  body="$(cat "$tmp")"
  local err
  err="$(cat "${tmp}.err" 2>/dev/null || true)"
  rm -f "$tmp" "${tmp}.err"

  API_LAST_CODE="$code"
  API_LAST_BODY="$body"
  if [[ -n "$err" && "$code" == "000" ]]; then
    echo "ERROR: curl failed — ${err}" >&2
    return 1
  fi
  printf '%s' "$body"
}

explain_api_failure() {
  local code="${API_LAST_CODE:-?}"
  local body="${API_LAST_BODY:-}"

  if [[ "$body" == *"error code: 1010"* ]] || [[ "$code" == "403" && "$body" != "{"* ]]; then
    echo "ERROR: Cloudflare blocked this request (HTTP ${code}, error 1010)." >&2
    echo "  This usually means the Management API rejected the client fingerprint or IP." >&2
    echo "  Fixes:" >&2
    echo "    • Run from your Mac Terminal (not a restricted sandbox/VPN/datacenter IP)" >&2
    echo "    • Or skip the API — use dashboard setup instead:" >&2
    echo "        ./scripts/setup-supabase.sh --manual" >&2
    return
  fi

  if [[ "$body" == "{"* ]]; then
    local msg
    msg="$(echo "$body" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('message', d))" 2>/dev/null || echo "$body")"
    echo "ERROR: HTTP ${code} — ${msg}" >&2
  else
    echo "ERROR: HTTP ${code} — ${body:0:300}" >&2
  fi
  echo "  Token: https://supabase.com/dashboard/account/tokens (must start with sbp_)" >&2
}

print_manual_steps() {
  echo ""
  echo "── Dashboard setup (recommended if API is blocked) ──"
  echo "  1. https://supabase.com/dashboard/new → project name: ${PROJECT_NAME}"
  echo "  2. SQL Editor → paste & run: ${ROOT}/supabase/schema.sql"
  echo "  3. Settings → API → copy Project URL + anon public key"
  echo "  4. Run:  ./scripts/setup-supabase.sh --manual"
  echo "     (or create .env.local yourself — see .env.example)"
  echo ""
  echo "Org id (only needed for API create): open org settings — UUID in URL:"
  echo "  https://supabase.com/dashboard/org/<ORG_ID>/general"
}

write_env_interactive() {
  echo "=== Write .env.local from dashboard credentials ==="
  echo "From Supabase → Project Settings → API"
  echo ""
  read -r -p "Project URL (https://xxxx.supabase.co): " SUPA_URL
  read -r -p "anon public key: " SUPA_ANON
  if [[ -z "$SUPA_URL" || -z "$SUPA_ANON" ]]; then
    echo "Both values are required."
    exit 1
  fi
  cat > "${ROOT}/.env.local" <<ENV
VITE_SUPABASE_URL=${SUPA_URL}
VITE_SUPABASE_ANON_KEY=${SUPA_ANON}
VITE_SITE_PASSWORD_HASH=ec773d162576ebd13f3bc1276e30ad2b80322b58e5a762659af322309a8f2377
ENV
  echo ""
  echo "Wrote ${ROOT}/.env.local"
  echo "Restart dev server: npm run dev"
  echo ""
  echo "GitHub Actions secrets (same three values):"
  echo "  VITE_SUPABASE_URL"
  echo "  VITE_SUPABASE_ANON_KEY"
  echo "  VITE_SITE_PASSWORD_HASH=ec773d162576ebd13f3bc1276e30ad2b80322b58e5a762659af322309a8f2377"
}

resolve_org_id() {
  if [[ -n "$ORG_ID" ]]; then
    echo "$ORG_ID"
    return 0
  fi

  local body
  body="$(curl_api GET "/organizations")" || return 1

  if [[ "${API_LAST_CODE}" != "200" ]]; then
    explain_api_failure
    return 1
  fi

  ORG_ID="$(
    ORG_JSON="$body" ORG_NAME="$ORG_NAME" python3 <<'PY'
import json, os, sys

data = json.loads(os.environ["ORG_JSON"])
name_filter = os.environ.get("ORG_NAME", "").strip().lower()

if not isinstance(data, list) or not data:
    print("ERROR: No organizations on this account.", file=sys.stderr)
    sys.exit(2)

for org in data:
    print(f"  • {org.get('name','(unnamed)')}  →  {org.get('id')}", file=sys.stderr)

if name_filter:
    for org in data:
        if org.get("name", "").lower() == name_filter:
            print(org["id"])
            sys.exit(0)
    print(f"ERROR: No org named {name_filter!r}", file=sys.stderr)
    sys.exit(2)

if len(data) == 1:
    print(data[0]["id"])
    sys.exit(0)

print("ERROR: Multiple orgs — set SUPABASE_ORG_ID or SUPABASE_ORG_NAME", file=sys.stderr)
sys.exit(2)
PY
  )" || return 1

  echo "$ORG_ID"
}

list_orgs_only() {
  echo "=== Supabase organizations ==="
  if [[ -n "${SUPABASE_ORG_ID:-}" ]]; then
    echo "SUPABASE_ORG_ID=$SUPABASE_ORG_ID"
    return 0
  fi
  echo "Fetching…"
  local id
  id="$(resolve_org_id)" || {
    print_manual_steps
    return 1
  }
  echo "Using org id: $id"
}

echo "=== Patterson Trip Hub — Supabase setup ==="

case "${1:-}" in
  --manual)
    write_env_interactive
    exit 0
    ;;
  --list-orgs)
    if [[ -z "${SUPABASE_ACCESS_TOKEN:-}" ]]; then
      echo "Set SUPABASE_ACCESS_TOKEN first, or use --manual for dashboard setup."
      exit 1
    fi
    list_orgs_only
    exit $?
    ;;
esac

if [[ -z "${SUPABASE_ACCESS_TOKEN:-}" ]]; then
  echo "No SUPABASE_ACCESS_TOKEN set."
  print_manual_steps
  exit 0
fi

echo "Fetching organizations..."
ORG_ID="$(resolve_org_id)" || {
  print_manual_steps
  exit 1
}
echo "Using organization: $ORG_ID"

echo "Creating Supabase project '${PROJECT_NAME}' in ${REGION} (may take 1–2 min)..."
CREATE="$(curl_api POST "/projects" "{\"organization_id\":\"${ORG_ID}\",\"name\":\"${PROJECT_NAME}\",\"db_pass\":\"${DB_PASS}\",\"region\":\"${REGION}\"}")" || true

if [[ "${API_LAST_CODE}" != "201" && "${API_LAST_CODE}" != "200" ]]; then
  echo "Project creation failed:"
  explain_api_failure
  echo "$CREATE" | python3 -m json.tool 2>/dev/null || echo "$CREATE"
  print_manual_steps
  exit 1
fi

REF="$(echo "$CREATE" | python3 -c "import sys,json; print(json.load(sys.stdin).get('id',''))" 2>/dev/null || true)"
if [[ -z "$REF" ]]; then
  echo "Could not parse project ref from response."
  exit 1
fi

echo "Project ref: $REF — waiting for ACTIVE_HEALTHY..."
for _ in $(seq 1 40); do
  curl_api GET "/projects/${REF}" >/dev/null || true
  STATUS="$(echo "${API_LAST_BODY}" | python3 -c "import sys,json; print(json.load(sys.stdin).get('status',''))" 2>/dev/null || true)"
  if [[ "$STATUS" == "ACTIVE_HEALTHY" ]]; then
    break
  fi
  echo "  status: ${STATUS:-unknown}…"
  sleep 5
done

URL="https://${REF}.supabase.co"
curl_api GET "/projects/${REF}/api-keys" >/dev/null || true

ANON="$(echo "${API_LAST_BODY}" | python3 -c "
import sys, json
raw = json.load(sys.stdin)
items = raw if isinstance(raw, list) else raw.get('data', [])
for k in items:
    if k.get('name') == 'anon':
        print(k.get('api_key', k.get('key', '')))
        break
" 2>/dev/null || true)"

if [[ -z "$ANON" ]]; then
  echo "Copy anon key from: https://supabase.com/dashboard/project/${REF}/settings/api"
fi

cat > "${ROOT}/.env.local" <<ENV
VITE_SUPABASE_URL=${URL}
VITE_SUPABASE_ANON_KEY=${ANON}
VITE_SITE_PASSWORD_HASH=ec773d162576ebd13f3bc1276e30ad2b80322b58e5a762659af322309a8f2377
ENV

echo ""
echo "Wrote ${ROOT}/.env.local"
echo ""
echo "Run schema in SQL editor:"
echo "  https://supabase.com/dashboard/project/${REF}/sql/new"
echo "  File: ${ROOT}/supabase/schema.sql"
echo ""
echo "GitHub Actions secrets:"
echo "  VITE_SUPABASE_URL=${URL}"
echo "  VITE_SUPABASE_ANON_KEY=${ANON}"
echo "  VITE_SITE_PASSWORD_HASH=ec773d162576ebd13f3bc1276e30ad2b80322b58e5a762659af322309a8f2377"
