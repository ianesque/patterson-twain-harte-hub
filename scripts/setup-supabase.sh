#!/usr/bin/env bash
# One-time Supabase provisioning for Patterson Trip Hub.
# Requires: curl, jq (optional but recommended)
#
# Option A — fully automated (Supabase personal access token):
#   export SUPABASE_ACCESS_TOKEN=sbp_...
#   ./scripts/setup-supabase.sh
#
# Option B — manual: script prints SQL + env lines to paste.

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
PROJECT_NAME="patterson-twain-harte"
DB_PASS="${SUPABASE_DB_PASSWORD:-$(openssl rand -base64 24 | tr -d '/+=' | head -c 24)}"
ORG_ID="${SUPABASE_ORG_ID:-}"

echo "=== Patterson Trip Hub — Supabase setup ==="

if [[ -z "${SUPABASE_ACCESS_TOKEN:-}" ]]; then
  echo ""
  echo "No SUPABASE_ACCESS_TOKEN set. Manual steps:"
  echo "  1. Create a project at https://supabase.com/dashboard"
  echo "     Name: ${PROJECT_NAME}"
  echo "  2. Open SQL Editor → run: ${ROOT}/supabase/schema.sql"
  echo "  3. Settings → API → copy URL + anon key into .env.local:"
  echo ""
  cat <<'ENV'
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_SITE_PASSWORD_HASH=ec773d162576ebd13f3bc1276e30ad2b80322b58e5a762659af322309a8f2377
ENV
  echo ""
  echo "  4. Add the same three vars as GitHub Actions secrets for Pages deploy."
  exit 0
fi

if [[ -z "$ORG_ID" ]]; then
  echo "Fetching organizations..."
  ORGS=$(curl -sS -H "Authorization: Bearer ${SUPABASE_ACCESS_TOKEN}" \
    "https://api.supabase.com/v1/organizations")
  ORG_ID=$(echo "$ORGS" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d[0]['id'] if d else '')" 2>/dev/null || true)
  if [[ -z "$ORG_ID" ]]; then
    echo "Could not resolve org id. Set SUPABASE_ORG_ID and retry."
    exit 1
  fi
  echo "Using organization: $ORG_ID"
fi

echo "Creating Supabase project '${PROJECT_NAME}' (may take 1–2 min)..."
CREATE=$(curl -sS -X POST "https://api.supabase.com/v1/projects" \
  -H "Authorization: Bearer ${SUPABASE_ACCESS_TOKEN}" \
  -H "Content-Type: application/json" \
  -d "{\"organization_id\":\"${ORG_ID}\",\"name\":\"${PROJECT_NAME}\",\"db_pass\":\"${DB_PASS}\",\"region\":\"us-west-1\"}")

REF=$(echo "$CREATE" | python3 -c "import sys,json; print(json.load(sys.stdin).get('id',''))" 2>/dev/null || true)
if [[ -z "$REF" ]]; then
  echo "Project creation failed:"
  echo "$CREATE"
  exit 1
fi

echo "Project ref: $REF — waiting for health..."
for i in $(seq 1 40); do
  STATUS=$(curl -sS -H "Authorization: Bearer ${SUPABASE_ACCESS_TOKEN}" \
    "https://api.supabase.com/v1/projects/${REF}" | python3 -c "import sys,json; print(json.load(sys.stdin).get('status',''))" 2>/dev/null || true)
  if [[ "$STATUS" == "ACTIVE_HEALTHY" ]]; then
    break
  fi
  sleep 5
done

URL="https://${REF}.supabase.co"
KEYS=$(curl -sS -H "Authorization: Bearer ${SUPABASE_ACCESS_TOKEN}" \
  "https://api.supabase.com/v1/projects/${REF}/api-keys")

ANON=$(echo "$KEYS" | python3 -c "
import sys,json
for k in json.load(sys.stdin):
  if k.get('name')=='anon' or k.get('api_key',{}).get('role')=='anon':
    print(k.get('api_key',k).get('key', k.get('key','')))
    break
" 2>/dev/null || true)

echo "Applying schema via Supabase SQL API..."
SQL=$(cat "${ROOT}/supabase/schema.sql" | python3 -c 'import sys,json; print(json.dumps(sys.stdin.read()))')
curl -sS -X POST "${URL}/rest/v1/rpc/exec_sql" \
  -H "apikey: ${ANON}" \
  -H "Authorization: Bearer ${ANON}" \
  -H "Content-Type: application/json" \
  -d "{\"query\": ${SQL}}" 2>/dev/null || {
  echo "Note: run ${ROOT}/supabase/schema.sql manually in the SQL editor if auto-apply failed."
}

ENV_FILE="${ROOT}/.env.local"
cat > "$ENV_FILE" <<ENV
VITE_SUPABASE_URL=${URL}
VITE_SUPABASE_ANON_KEY=${ANON}
VITE_SITE_PASSWORD_HASH=ec773d162576ebd13f3bc1276e30ad2b80322b58e5a762659af322309a8f2377
ENV

echo ""
echo "Wrote ${ENV_FILE}"
echo "Add these GitHub secrets for Pages deploy:"
echo "  VITE_SUPABASE_URL=${URL}"
echo "  VITE_SUPABASE_ANON_KEY=${ANON}"
echo "  VITE_SITE_PASSWORD_HASH=ec773d162576ebd13f3bc1276e30ad2b80322b58e5a762659af322309a8f2377"
echo ""
echo "If schema was not auto-applied, paste supabase/schema.sql in the Supabase SQL editor."
