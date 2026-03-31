# Card Keeper - Development Guide

## Tech Stack
- **Framework:** Next.js 15 (App Router) + TypeScript
- **Styling:** Tailwind CSS v4 + custom UI components (src/components/ui/)
- **Database:** Neon Postgres via `@vercel/postgres` + Drizzle ORM
- **Auth:** Simple password (bcrypt + JWT via jose), middleware-protected
- **Deployment:** Vercel (auto-deploy from main), Neon Postgres
- **Monitoring:** Brave Search API for benefits change detection

## Commands
```bash
npm run dev          # Start dev server (Turbopack)
npm run build        # Production build
npm run db:generate  # Generate Drizzle migrations
npm run db:push      # Push schema to database
npm run db:seed      # Seed cards + benefits data (npx tsx src/db/seed.ts)
```

## Project Structure
```
src/
├── app/
│   ├── page.tsx              # Dashboard (overview stats, card grid)
│   ├── login/page.tsx        # Password login
│   ├── cards/page.tsx        # Card list (US/CN filter)
│   ├── cards/[id]/page.tsx   # Card detail + benefit tracking
│   ├── insurance/page.tsx    # Insurance comparison matrix
│   ├── spending/page.tsx     # Spending trackers (placeholder)
│   ├── changes/page.tsx      # Benefits change log
│   ├── settings/page.tsx     # Password, data export
│   └── api/
│       ├── auth/             # login + setup routes
│       ├── cards/            # GET cards list, GET card detail
│       ├── usages/           # POST/DELETE benefit usage records
│       ├── tasks/            # Card task management
│       └── monitor/          # Benefits change monitoring
├── components/
│   ├── app-shell.tsx         # Layout with sidebar + mobile nav
│   └── ui/index.tsx          # Card, Progress, Badge, Button
├── db/
│   ├── schema.ts             # Drizzle table definitions
│   ├── index.ts              # DB connection
│   ├── seed-data.ts          # 9 cards, 59 benefits seed data
│   └── seed.ts               # Seed runner script
└── lib/
    ├── auth.ts               # Password hashing, JWT sessions
    └── utils.ts              # Cycle calculation, formatting helpers
```

## Key Conventions
- UI language: Chinese, card names in English
- Currency: USD and CNY, displayed with $ and ¥
- Cycle types: monthly, quarterly, semi_annual, annual, one_time, per_event, ongoing
- Cycle reference: "calendar" (Jan 1 reset) or "anniversary" (card open date reset)
- All dates stored as YYYY-MM-DD strings
- No multi-tenancy: single-user app with password protection
- Components use hsl CSS variables for theming (defined in globals.css)

## Database
- Drizzle ORM with `@vercel/postgres` driver
- Schema in src/db/schema.ts — run `npm run db:push` after changes
- `.env.local` loaded via dotenv in drizzle.config.ts and seed.ts
- Key env vars: POSTGRES_URL, AUTH_SECRET, BRAVE_API_KEY

## Card Data Model
9 cards pre-populated:
- US: 2x Amex Hilton Aspire, 1x Surpass, 1x Marriott Brilliant, 1x Chase CSP, 1x Chase IHG Premier
- CN: 农行万事达尊然白, 中信国航世界卡, 广发国航臻享白

## Current Status
- Phase 1 (MVP): Complete — dashboard, card tracking, benefit usage, insurance comparison
- Phase 2: In progress — card tasks, change monitoring, card customization
- Future: Email reminders, PWA, spending trackers
