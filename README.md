# Smetalab

Smetalab is a multi-tenant SaaS application for construction estimating and project operations. It supports project management, estimates, work/material catalogs, procurement tracking, execution tracking, finance-related project data, team workflows, and administration tools.

The application is built as a production-oriented Next.js App Router codebase with a strict layered architecture, shared UI governance, tenant-aware data access, and AI-assisted catalog search.

Repository: <https://github.com/huntechri/smetalab_dev>

## Overview

Smetalab is designed for construction and fit-out workflows where estimates, materials, works, purchases, and execution data must stay connected inside a tenant-scoped workspace.

Core product areas:

- workspace dashboard and project dashboards;
- project registry and project details;
- estimate registry and estimate details;
- estimate rows with works and nested materials;
- materials and works catalogs;
- estimate procurement reconciliation against global purchases;
- execution tracking for actual work quantities and prices;
- global purchases;
- counterparties and material suppliers;
- team, permissions, settings, notifications, and admin surfaces;
- AI/semantic search for catalog workflows where configured.

## Tech Stack

High-level stack:

- Next.js App Router;
- React and TypeScript;
- Tailwind CSS and shadcn/Radix-style UI primitives;
- Postgres hosted on Neon;
- Drizzle ORM and Drizzle migrations;
- Vercel for deployment;
- Vercel Blob for larger estimate import files;
- Stripe for billing/payment integration;
- Resend for transactional email;
- Sentry for monitoring;
- OpenAI embeddings for semantic/AI search.

The exact package versions are defined in `package.json` and `pnpm-lock.yaml`.

## Architecture

`ARCHITECTURE.md` is the authoritative architecture map for this repository. The README only summarizes the current rules.

Canonical layers:

```txt
app/**                  Next.js route segments, pages, layouts, route handlers
app/actions/**          thin Server Action entrypoints
features/**             real business feature modules
features/_shared/**     shared feature-level infrastructure
shared/ui/**            canonical runtime UI primitives and shared UI patterns
shared/types/**         shared client/server-safe DTOs and plain types
shared/hooks/**         reusable client hooks
entities/**             reusable domain-oriented UI/model blocks
lib/data/**             database schema, repositories, queries, tenant filters
lib/domain/**           framework-independent business rules and use cases
lib/services/**         server-side application services and DB-backed workflows
lib/infrastructure/**   external adapters such as auth, payments, email, storage
packages/**             workspace packages and compatibility exports
```

Core dependency rules:

- route files in `app/**` should stay thin and pass server-loaded data into feature screens;
- `app/actions/**` should validate input, check permissions, call lower layers, and handle cache invalidation;
- runtime app UI should import shared primitives from `@/shared/ui/*`;
- `components/ui/**` is a legacy compatibility layer, not the canonical place for new runtime UI;
- `@repo/ui` is package export compatibility and should not be the internal runtime UI source for the app;
- `features/_shared/**` is the canonical home for shared feature shells such as guide-catalog and directory infrastructure;
- `shared/ui/**` must remain presentation-oriented and must not import features, app routes, DB code, or domain workflows;
- `lib/**` must not import from `features/**`;
- service-layer code should depend on `lib/domain/**`, `lib/data/**`, `lib/infrastructure/**`, and neutral shared types.

For file placement, import direction, and cleanup rules, use `ARCHITECTURE.md`.

## Getting Started

Install dependencies:

```bash
pnpm install
```

Create a local environment file from the example:

```bash
cp .env.example .env
```

Fill the required local values in `.env`. Do not commit real environment values.

Run database migrations and seed data:

```bash
pnpm db:migrate
pnpm db:seed
```

Start the development server:

```bash
pnpm dev
```

## Environment Variables

Required variable names and categories are documented in `.env.example`.

Environment categories:

- database connection variables;
- authentication/session variables;
- Stripe variables;
- Resend email variables;
- OpenAI variables;
- Sentry variables;
- Vercel Blob storage variables;
- Neon/Vercel/GitHub variables used by CI/CD and preview environments.

Rules:

- never commit `.env` or real environment files;
- never document real API keys, webhook secrets, database URLs, auth secrets, tokens, passwords, DSNs, or private credentials;
- store deployment values in Vercel environment variables and GitHub Secrets;
- keep README examples limited to variable names and categories only.

## Available Scripts

Important scripts from `package.json`:

```bash
pnpm dev                         # start the development server
pnpm build                       # build the Next.js application
pnpm start                       # start the production server

pnpm lint                        # run ESLint
pnpm type-check                  # run TypeScript checks
pnpm test                        # run unit/isolated tests
pnpm test:watch                  # run Vitest in watch mode
pnpm test:integration            # run integration tests with preflight handling
pnpm test:integration:force      # run integration tests in strict mode
pnpm e2e                         # run Playwright tests

pnpm audit:ui                    # run UI import/button/input audits
pnpm audit:lib-feature-imports   # block lib-to-feature imports
pnpm audit:legacy-compat-imports # block legacy compatibility import paths
pnpm verify:release              # lint, type-check, audits, tests, and build

pnpm db:generate                 # generate Drizzle migrations
pnpm db:migrate                  # apply migrations
pnpm db:seed                     # seed database data
pnpm db:studio                   # open Drizzle Studio
pnpm db:sync                     # generate and migrate with production guardrails
pnpm db:migrate:prod             # explicit production migration alias
```

Testing model:

- `pnpm test` is intended for unit and isolated tests and should not require a live database;
- `pnpm test:integration` is for DB-backed integration tests and depends on a valid database environment;
- `pnpm verify:release` is the main release verification command and includes architecture/UI audits.

## Database and Migrations

The project uses Postgres with Drizzle ORM.

Database rules:

- schema changes must be represented in Drizzle schema and committed migration files;
- do not manually patch production schema outside the migration flow;
- tenant-aware queries must preserve tenant isolation and soft-delete behavior;
- shared DTOs used outside the data layer should live in neutral locations such as `shared/types/**` or `lib/domain/**`;
- production and preview database values must be provided through environment variables, not committed documentation.

## CI/CD

The repository uses GitHub Actions for validation and Vercel for deployment.

Current CI/CD responsibilities include:

- pull request validation;
- linting, type-checking, UI/architecture audits, tests, and build verification;
- Vercel preview and production deployment flows;
- Neon preview database branch handling where configured;
- production migration/deploy sequencing;
- branch protection through repository rulesets and the setup workflow.

Relevant files:

- `.github/workflows/deploy.yml`;
- `.github/workflows/setup-branch-protection.yml`;
- `.github/rulesets/main-protection.json`;
- `.github/CODEOWNERS`.

Do not place operational tokens or secret values in README. Use GitHub Secrets and Vercel environment variables.

## Security and Secret Handling

This repository must not contain real secrets.

Do not commit or document:

- API keys;
- database URLs;
- webhook secrets;
- auth/session secrets;
- access tokens;
- OAuth credentials;
- SMTP or email provider credentials;
- Sentry auth tokens or DSNs with private context;
- Vercel, Neon, Stripe, Resend, OpenAI, or GitHub credentials;
- real passwords or private account identifiers.

Safe documentation may include only variable names, placeholder names, or links to configuration files that do not expose real values.

## Documentation

Important repository documents:

- `ARCHITECTURE.md` — source of truth for file-system architecture and dependency direction;
- `.env.example` — environment variable names and categories;
- `docs/audits/**` — audit notes and historical cleanup status;
- `.github/workflows/deploy.yml` — CI/CD workflow;
- `.github/rulesets/main-protection.json` — branch protection ruleset.

Older architecture and audit documents should be treated as historical references unless `ARCHITECTURE.md` points to them as current.

## License

License: not specified in this repository.
