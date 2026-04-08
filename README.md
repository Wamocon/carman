# CarMan

Private vehicle management — fuel, costs, maintenance, reminders — in one web app.  
Built with **Next.js 16**, **TypeScript**, **Tailwind CSS v4**, and **Supabase**.

## Features (V1)

- Vehicle profiles (make, model, year, fuel type, mileage)
- Fuel and cost tracking (8 categories)
- Dedicated cost detail pages per entry
- Cost comments and invoice uploads (document storage)
- Maintenance & repair log
- Date- and mileage-based reminders
- Dashboard with monthly cost overview & per-vehicle stats
- Interactive dashboard trend chart (categories, vehicles, monthly time range)
- CSV export (Pro)
- Editable vehicle profiles with comments and image gallery
- Free tier: 1 vehicle, full functionality · Pro tier: unlimited vehicles + export

## Tech Stack

- **Framework:** Next.js 16 (App Router, Turbopack)
- **Language:** TypeScript (strict mode)
- **Styling:** Tailwind CSS v4
- **Backend/DB:** Supabase (PostgreSQL, Auth, RLS)
- **Deployment:** Vercel (via GitHub Actions CI/CD)

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Start the local Supabase stack and sync .env.local
npm run supabase:start

# 3. Reset the local database from migrations
npm run db:reset

# 4. (Optional) Reseed only test data without reset
npm run db:seed:testdata

# 5. Verify local read/write against Docker Supabase
npm run test:integration:local

# 6. Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## Scripts

| Command | Description |
|---|---|
| `npm run supabase:start` | Ensure Docker and local Supabase are running and sync `.env.local` |
| `npm run db:reset` | Recreate local DB from migrations and then seed local test users/data |
| `npm run db:reset:no-seed` | Recreate local DB from migrations without test data seeding |
| `npm run db:seed:testdata` | Idempotent setup/update of local Free/Pro test users and sample data |
| `npm run db:lint` | Lint local database migrations |
| `npm run db:diff` | Inspect uncommitted local schema drift |
| `npm run db:check` | Full local migration verification incl. integration test |
| `npm run test:integration:local` | Verify local DB read/write via PostgreSQL and Supabase |
| `npm run dev` | Start dev server (Turbopack) |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | Run TypeScript type checking |

## Local Supabase Workflow

- Start from `npm run supabase:start` so Docker, the local Supabase stack, and `.env.local` stay in sync.
- Local data persists across regular Docker/Supabase stop/start because Docker volumes are reused.
- Data is only recreated when running reset commands; use `npm run db:seed:testdata` to restore test users/data quickly.
- Every schema change must begin with `npx supabase migration new <name>`.
- Edit only timestamped files in `supabase/migrations/` for schema changes.
- Validate every migration locally with `npm run db:check`.
- Production rollout is intentionally not scripted here; this repo only verifies that local migrations are current and error-free so Supabase MCP can deploy them later.

## Documentation

- **[docs/benutzerhandbuch-carman.md](docs/benutzerhandbuch-carman.md)** — Full user handbook with process visualizations (DE)
- **[docs/implementierung-v1.md](docs/implementierung-v1.md)** — V1 implementation status & architecture
- **[docs/testbenutzer.md](docs/testbenutzer.md)** — Test user setup & scenarios
- **[docs/pitch-smart-car-manager.md](docs/pitch-smart-car-manager.md)** — Product pitch & decision document
- **[docs/analyse-smart-car-manager.md](docs/analyse-smart-car-manager.md)** — Full strategic product & market analysis
- **[HOWTO.md](HOWTO.md)** — Full setup & deployment guide (DE/EN)
- **[AGENTS.md](AGENTS.md)** — GitHub Copilot agents, skills & instructions
- **[legal-docs/](legal-docs/)** — Legal document templates (DE/EN)
