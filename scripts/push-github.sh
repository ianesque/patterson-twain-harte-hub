#!/usr/bin/env bash
# Create GitHub repo and push twain-harte-hub (requires git + GITHUB_TOKEN or gh).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
REPO_NAME="${1:-patterson-twain-harte-hub}"
GITHUB_USER="${GITHUB_USER:-}"

cd "$ROOT"

if [[ ! -d .git ]]; then
  git init -b main
fi

if git diff --quiet && git diff --cached --quiet 2>/dev/null && git rev-parse HEAD >/dev/null 2>&1; then
  echo "Nothing new to commit."
else
  git add -A
  git commit -m "$(cat <<'EOF'
Add collaborative trip hub with password rate limiting.

Realtime meal planning, activity RSVPs, Supabase sync, and GitHub Pages deploy.
EOF
)"
fi

if command -v gh >/dev/null 2>&1; then
  if ! git remote get-url origin >/dev/null 2>&1; then
    gh repo create "$REPO_NAME" --public --source=. --remote=origin --push
  else
    git push -u origin main
  fi
  echo "Repo: $(gh repo view --json url -q .url)"
  exit 0
fi

TOKEN="${GITHUB_TOKEN:-${GH_TOKEN:-}}"
if [[ -z "$TOKEN" ]]; then
  echo "Neither gh nor GITHUB_TOKEN available."
  echo "Manual push:"
  echo "  1. Create empty repo: https://github.com/new → ${REPO_NAME}"
  echo "  2. cd \"${ROOT}\""
  echo "  3. git remote add origin git@github.com:YOUR_USER/${REPO_NAME}.git"
  echo "  4. git push -u origin main"
  echo "  5. Settings → Pages → GitHub Actions"
  echo "  6. Secrets: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, VITE_SITE_PASSWORD_HASH"
  exit 0
fi

if [[ -z "$GITHUB_USER" ]]; then
  GITHUB_USER=$(curl -sS -H "Authorization: Bearer ${TOKEN}" https://api.github.com/user | python3 -c "import sys,json; print(json.load(sys.stdin)['login'])")
fi

if ! git remote get-url origin >/dev/null 2>&1; then
  curl -sS -X POST -H "Authorization: Bearer ${TOKEN}" \
    -H "Accept: application/vnd.github+json" \
    "https://api.github.com/user/repos" \
    -d "{\"name\":\"${REPO_NAME}\",\"private\":false,\"description\":\"Patterson family Twain Harte trip hub\"}" >/dev/null || true
  git remote add origin "https://${GITHUB_USER}:${TOKEN}@github.com/${GITHUB_USER}/${REPO_NAME}.git"
fi

git push -u origin main
echo "https://github.com/${GITHUB_USER}/${REPO_NAME}"
