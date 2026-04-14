# Architecture

## Folder map

- `app/**`: Next.js App Router routes, layouts, route handlers, and server actions.
- `shared/ui/**`: design-system and primitive UI only.
- `components/providers/**`: app-wide React providers.
- `components/layout/**` and `components/navigation/**`: cross-feature shell/navigation composition.
- `entities/<entity>/**`: reusable domain-oriented UI/model building blocks (no page orchestration).
- `features/<feature>/**`: feature-specific UI modules and orchestration.
- `lib/domain/**`: business use-cases and policies.
- `lib/data/**`: DB and repository/data-access layer.
- `lib/infrastructure/**`: auth, payments, email, notifications transport, and server integrations.

## Dependency rules

- `app/**` can import from `features/**`, `entities/**`, `components/**`, and `lib/**`.
- `features/**` can import from `shared/ui/**`, `entities/**`, `components/*` (non-ui shell), `lib/domain/**`, `lib/data/**`, and shared utils.
- `entities/**` can import from `shared/ui/**` and shared utils, but must not depend on `features/**`.
- `shared/ui/**` must stay presentation-only and cannot import from app/features/entities/lib layers; documented exception: utility class-name helper `cn` from `@/lib/utils` (to be migrated to shared utils later).
- `lib/domain/**` must be framework-agnostic (no `react`, `next/*`, client state libs).
- `lib/data/**` must not import from UI layers (`components/**`, `features/**`).
- `lib/infrastructure/**` contains environment-bound adapters (cookies, stripe, email, auth middleware).

## Server/client boundary

- Server-only modules include explicit `import 'server-only'` in DB entrypoints (for example `lib/data/db/drizzle.ts`).
- Client components must never import DB clients, secrets, or server-only adapters directly.
- Server actions validate input, enforce auth, call domain use-cases, and revalidate cache.

## Where to put new code

- New route composition: `app/...`.
- New reusable domain UI (status badges/cells/cards used in multiple features): `entities/<entity>/ui` + `entities/<entity>/model` (e.g. `entities/project`, `entities/estimate`).
- New feature UI: `features/<feature>/components` + `features/<feature>/hooks` + `features/<feature>/schemas`.
- New business workflow/use-case: `lib/domain/<bounded-context>/use-cases.ts`.
- New DB query/repository: `lib/data/**`.
- New external integration (Stripe/Email/Auth transport): `lib/infrastructure/**`.

## Current feature modules

- `features/admin`
- `features/notifications`
- `features/permissions`
- `features/materials`
- `features/works`
- `features/counterparties`
- `features/projects` (including `dashboard` submodule)

These expose stable entrypoints with `index.ts` barrels.
