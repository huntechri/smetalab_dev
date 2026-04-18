# Smetalab — Next.js App on Replit

## Overview
Full-stack Next.js 15 (App Router) application migrated from Vercel. Uses Drizzle ORM with PostgreSQL (Neon), Stripe payments, Resend email, OpenAI, and Sentry error tracking.

## Architecture
- **Framework**: Next.js 15 (App Router, canary)
- **Database**: PostgreSQL via `postgres` driver + Drizzle ORM
- **Auth**: Custom JWT-based auth (`jose`)
- **Payments**: Stripe
- **Email**: Resend
- **AI**: OpenAI
- **Error Tracking**: Sentry (disabled at startup — re-enable via instrumentation.ts)
- **Styling**: Tailwind CSS v4 + shadcn/ui components
- **Package Manager**: pnpm

## Running on Replit
- Dev server runs on port **5000** with `pnpm dev` (`next dev -p 5000 -H 0.0.0.0`)
- Workflow: **Start application** — auto-starts on project open

## Replit-Specific Changes
1. `package.json` `dev`/`start` scripts updated to use `-p 5000 -H 0.0.0.0`
2. `instrumentation.ts` — Sentry initialization commented out to avoid startup failures without credentials

## Required Environment Variables
Set these as Replit Secrets:
- `DATABASE_URL` — PostgreSQL connection string (Neon recommended)
- `AUTH_SECRET` — Random secret for JWT signing
- `BASE_URL` — Public URL of this app (e.g. `https://<your-repl>.replit.app`)
- `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` — Stripe keys
- `RESEND_API_KEY`, `EMAIL_FROM` — Email sending
- `OPENAI_API_KEY` — AI features
- `SUPERADMIN_EMAIL`, `SUPERADMIN_PASSWORD` — Initial admin account
- `NEXT_PUBLIC_SENTRY_DSN`, `SENTRY_AUTH_TOKEN` — Sentry (optional)

## Database Setup
After setting `DATABASE_URL`, run:
```
pnpm db:migrate
pnpm db:seed
```

## Key Directories
- `app/` — Next.js App Router pages and API routes
- `components/` — Shared UI components (shadcn/ui based)
- `features/` — Feature-level modules
- `lib/` — Shared utilities, DB client, auth helpers
- `entities/` — Domain entity types
- `scripts/` — DB migration, seeding, and dev utilities
