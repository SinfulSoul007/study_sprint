# StudySprint — LeetCode meets Pomodoro

A focused coding practice platform that combines LeetCode-style problems with 25-minute sprint sessions. Built with Next.js App Router, Supabase, Tailwind CSS v4, Monaco Editor, and Recharts.

## Features

- **Authentication**: Email/password auth via Supabase
- **Problems Browser**: 3K+ real LeetCode problems with difficulty, tags, acceptance rate
- **Sprint Mode**: 25-minute timer + Monaco editor; track completion
- **Dashboard**: Success rate, streaks, charts, and recent activity
- **Daily Updates (optional)**: Scheduler to fetch fresh LeetCode data nightly
- **Responsive UI**: Polished pages and components with Tailwind v4

## Tech Stack

- **Frontend**: Next.js 15 (App Router), React 19, Tailwind CSS v4, Lucide Icons
- **Editor**: @monaco-editor/react
- **Charts**: recharts
- **Backend/Data**: Supabase (Postgres + RLS), @supabase/supabase-js v2
- **Jobs & Data**: Node scripts + optional Python FastAPI leetcode API fetcher

## Quick Start

1) Clone & install

```bash
npm install
```

2) Configure env

```bash
cp .env.local.example .env.local
# Fill in Supabase keys
```

3) Create database schema

- Open Supabase → SQL editor → run `supabase-schema.sql` from the repo root.

4) Load problems data

- Recommended (bundled JSON → DB):

```bash
npm run sync-simple
```

- Or, full update (fetch latest from LeetCode → update local JSON → sync DB):

```bash
npm run update-leetcode
```

5) Run the app

```bash
npm run dev
# http://localhost:3000
```

## Environment Variables

Create `.env.local` using the example file.

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...   # used only by Node scripts (server-side)

# NextAuth (used for session/security secrets within Next.js)
NEXTAUTH_SECRET=generate-a-random-secret
NEXTAUTH_URL=http://localhost:3000

# Optional — required only if you want Google Sheets export in the Python fetcher
# GOOGLE_CREDENTIALS='{"type":"service_account", ...}'
```

Notes
- The app will still run if envs are missing, but Supabase calls will use placeholders and not work. Ensure real keys in dev/production.
- Never expose `SUPABASE_SERVICE_ROLE_KEY` in client code or the browser; it’s used only by Node scripts.

## Scripts

- `npm run dev` — Start Next.js in dev (Turbopack)
- `npm run build` — Production build
- `npm run start` — Start production server
- `npm run seed` — Legacy CSV-based seed (kept for reference)
- `npm run sync-simple` — Sync from bundled JSON (`leetcode-api/data/leetcode_questions.json`) into Supabase
- `npm run sync-leetcode` — Advanced sync using enhanced fields (tags, hints, likes, etc.)
- `npm run update-leetcode` — Run Python fetcher to refresh JSON, then sync to DB
- `npm run start-scheduler` — Keep a Node process running; fetch at midnight daily then sync to DB

## Data Flow

- Simple flow (default):
  - `leetcode-api/data/leetcode_questions.json` → `scripts/sync-leetcode-simple.js` → `problems` table

- Full flow (optional):
  - Python fetcher (`leetcode-api/src/utils/download.py`) → updates local JSON → `scripts/sync-leetcode-problems.js` → `problems` table
  - Optional: writes an overview to Google Sheets if `GOOGLE_CREDENTIALS` is configured

## Database

- Full schema with indices and RLS is in `supabase-schema.sql`.
- Core tables: `users`, `problems`, `submissions`, `sprints`, `user_stats`.
- Types used across the app are declared in `lib/database.types.ts`.

RLS highlights
- Problems are publicly readable
- `users`, `submissions`, `sprints`, `user_stats` are per-user
- New auth users automatically get a profile and `user_stats` via trigger (`handle_new_user`)

## Project Structure

```
study_sprint/
  app/                  # Next.js app router pages
    dashboard/
    problems/
    sprint/
  components/           # UI components (layout, auth, sprint)
  lib/                  # Supabase client, auth helpers, types, hooks
  scripts/              # Data sync & scheduler scripts
  leetcode-api/         # Optional Python service + data fetcher
  supabase-schema.sql   # Database schema & policies
```

Key files
- `lib/supabase.ts` — client and admin clients
- `lib/hooks/useAuth.ts` — session/profile loader; creates user profile if missing
- `app/problems/page.tsx` — infinite/large list fetch with filters and pagination
- `app/sprint/[id]/page.tsx` — timer, editor, submission & sprint lifecycle
- `app/dashboard/page.tsx` — stats + recharts visualizations

## Optional: Python LeetCode API

Used by `npm run update-leetcode` and for local exploration.

```bash
cd leetcode-api
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
uvicorn src.api.api:app --reload
# http://127.0.0.1:8000
```

- Endpoints: `/problems`, `/problem/{id_or_slug}`, `/search`, `/random`, `/daily`, `/user/*`
- Writes refreshed problem data to `leetcode-api/data/leetcode_questions.json`

Google Sheets export (optional)
- Provide `GOOGLE_CREDENTIALS` in env (stringified service account JSON)
- The fetcher will update a public sheet defined in `src/utils/google_sheets.py`

## Notes & Gotchas

- Use `npm run sync-simple` if you just want to load the bundled dataset quickly.
- The legacy `npm run seed` script inserts `test_cases` as a JSON string. Prefer the sync scripts, which insert arrays matching the app’s types.
- Some UI features (e.g., “Submitted” vs real judging) are mocked for now; extend the submission runner as needed.
- Tailwind v4 is configured via `@import "tailwindcss"` and `postcss.config.mjs`. No tailwind.config needed.

## Troubleshooting

- Problems page empty: ensure schema created, env vars set, and run a sync script
- Auth issues: check Supabase URL/keys; verify RLS policies and triggers exist
- Scheduler: `npm run start-scheduler` should run as a long-lived process (e.g., PM2, systemd, or a serverless cron alternative)
- Python fetcher: ensure Python 3.10+, network access to LeetCode, and valid `GOOGLE_CREDENTIALS` if Sheets is enabled

## License

This project is for educational use. Add a LICENSE file if you plan to distribute.
