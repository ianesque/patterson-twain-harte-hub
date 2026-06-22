# Patterson Twain Harte Trip Hub

Collaborative vacation planning for the Patterson family reunion (Jun 23–27, 2026). Built with **Untitled UI** + React + Supabase realtime sync. Password-gated for GitHub Pages.

## Quick start (local)

```bash
cd twain-harte-hub
npm install
cp .env.example .env.local   # optional for sync
npm run dev
```

- **Default password (dev):** `patterson2026`
- Open `http://localhost:5173`

## Live sync setup (Supabase — one time)

1. Create a free project at [supabase.com](https://supabase.com)
2. Run `supabase/schema.sql` in the SQL editor
3. Copy **Project URL** and **anon public key** into `.env.local`:

```env
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_SITE_PASSWORD_HASH=ec773d162576ebd13f3bc1276e30ad2b80322b58e5a762659af322309a8f2377
```

Generate a new password hash:

```bash
node -e "const c=require('crypto'); console.log(c.createHash('sha256').update('YOUR_PASSWORD').digest('hex'))"
```

Without Supabase, the app still works but saves **per device only**.

## Password security

- Site password is verified via SHA-256 hash baked in at build time (not stored in plain text).
- **Rate limiting:** 5 failed attempts triggers lockout (30s → 1m → 2m → … up to 15m). Countdown shown on the login screen. Successful login clears the counter.

## GitHub Pages deploy

1. Push this folder to a GitHub repo
2. Add repository secrets (Settings → Secrets → Actions):
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_SITE_PASSWORD_HASH`
3. Enable GitHub Pages from **GitHub Actions** (workflow included)
4. Share the Pages URL + family password with planners

Uses `HashRouter` (`/#/`) so routing works on static hosting.

**Cache busting:** Vite hashes JS/CSS filenames on each build. Trip itinerary content ships in those bundles (not from Supabase). If the site looks stale after a deploy, the app polls `index.html` and shows a **Refresh** banner when a newer build is live. GitHub Pages cannot set custom `Cache-Control` headers, so cached HTML is the main risk — the banner handles that for family users.

### Local preview after content edits

```bash
npm run build && npm run preview
```

If you still see old content:

1. Rebuild (`npm run build`) — preview serves `dist/`, not live source.
2. Hard refresh: **Cmd+Shift+R** (Mac) or **Ctrl+Shift+R** (Windows).
3. Dev server (`npm run dev`) hot-reloads source; no service worker is registered.

### One-command helpers

```bash
# List organizations (debug token / pick org id)
export SUPABASE_ACCESS_TOKEN=sbp_...
./scripts/setup-supabase.sh --list-orgs

# Auto-provision (uses sole org, or set one explicitly)
export SUPABASE_ORG_ID=your-org-uuid   # if you have multiple orgs
# export SUPABASE_ORG_NAME="My Org"    # alternative to ORG_ID
./scripts/setup-supabase.sh
```

**Cloudflare 1010 / API blocked?** Skip the Management API and use the dashboard:

```bash
./scripts/setup-supabase.sh --manual
```

Create the project at [supabase.com/dashboard/new](https://supabase.com/dashboard/new), run `supabase/schema.sql` in the SQL editor, then paste URL + anon key when prompted.

```bash
# GitHub (needs gh CLI or GITHUB_TOKEN)
./scripts/push-github.sh patterson-twain-harte-hub
```

## Features

| Tab | Purpose |
|---|---|
| **Plan** | Full week itinerary + shared day notes |
| **Meals** | Cook rotation & menus (breakfast/lunch/dinner) — live sync |
| **Coordinate** | Activity in/maybe/out + shared reservations checklist |
| **Activities / Gems / Game Night** | Reference content from the original trip research |

## Docs

- [PRD](../docs/PRD.md)
- [Project plan](../docs/PROJECT_PLAN.md)
- [Technical spec](../docs/TECHNICAL_SPEC.md)
- [Project briefing](../PROJECT_BRIEFING.md)

## Customize planner names

Edit `DEFAULT_PLANNER_SUGGESTIONS` in `src/lib/types.ts` with your household names.
