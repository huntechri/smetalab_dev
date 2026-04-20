# Agent Instructions for Smetalab

You are an autonomous coding agent working on the Smetalab project.

## Project Overview
Smetalab is a SaaS application built with Next.js, Postgres, Drizzle, Stripe, and strict RBAC with multi-tenancy.

## Tech Stack
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript (Strict Mode)
- **Styling**: Tailwind CSS 4.0
- **UI Components**: shadcn/ui (Radix UI) via `shared/ui`
- **Database**: Postgres with Drizzle ORM
- **Authentication**: Custom JWT-based auth
- **Payments**: Stripe
- **Email**: Resend
- **Package Manager**: pnpm

## Project Structure
- `app/`: Next.js App Router pages and API routes.
- `app/actions/`: thin server actions (`safeAction`) that delegate business logic.
- `features/`: feature modules (screens, hooks, components, adapters).
  - `features/guide-catalog/`: shared shell/table/toolbar for `materials` and `works`.
  - `features/directories/`: shared list screen for directory-style modules.
- `shared/ui/`: reusable shadcn/ui primitives and UI states.
- `shared/types/`: client-safe DTO types.
- `lib/services/`: orchestration/business services.
- `lib/domain/`: domain contracts/services (some modules still have use-cases).
- `lib/data/db/`: Drizzle schema, queries, and DB helpers.
- `lib/infrastructure/auth/`: authentication, session, RBAC.
- `lib/infrastructure/payments/`: Stripe integration.
- `drizzle/`: database migrations.
- `__tests__/`: unit/integration/ui tests.

## Strict Rules (MANDATORY)
1. **Architecture**: Follow Next.js App Router rules. Use `"use client"` only when needed. Keep client/server boundaries explicit.
2. **UI Canon**: Use components from `shared/ui`. Do not create parallel UI primitive libraries.
3. **TypeScript**: Strict typing only. No `any`. Use Zod for input/data validation.
4. **Database Security**: Always use `withActiveTenant` from `lib/data/db/queries.ts` for tenant tables (`tenantId`, `deletedAt`).
5. **Database Integrity**: Wrap bulk operations and multi-table writes in `db.transaction()`.
6. **Service Layer**: Business logic belongs in `lib/services/*.service.ts`; server actions stay thin.
7. **AI Batching**: Use `generateEmbeddingsBatch` for multi-item embedding generation.
8. **Frontend Decomposition**: Large components must be split into hooks (logic) + presentation components.
9. **Deduplication First**: Reuse `features/guide-catalog` and `features/directories` for similar list/catalog scenarios before adding new bespoke screens.
10. **Client Types**: Client components must use DTO types from `shared/types` or `features/*/types`; avoid importing DB types from `lib/data/db/schema` into client code.
11. **Database Consistency**: Keep `drizzle/*.sql` and `lib/data/db/schema.ts` in sync.
12. **RBAC**: Respect `owner`, `admin`, `member`, `estimator`, `manager`. Admin-only features live under `/admin/**`.
13. **Mutations**: Validate inputs and check authorization before every data mutation.
14. **Environment**: Use Git Bash-compatible commands.
15. **Commits**: Use Conventional Commits (`feat:`, `fix:`, `refactor:`, etc.).
16. **Testing (CRITICAL)**: New logic must have tests; do not reduce coverage.
17. **Cleanup**: Remove temporary/debug artifacts before commit.

## Testing Standards
The project uses Vitest for unit/integration/UI tests.

### 1. Unit Tests (`__tests__/unit/`)
- Target: functions, utilities, hooks, small components.
- Rule: include edge cases and error paths.

### 2. Integration Tests (`__tests__/integration/`)
- Target: actions, DB interactions, RBAC flows.
- Rule: verify cross-layer behavior.

### 3. UI Tests (`__tests__/ui/`)
- Target: screen/component behavior and key user flows.

## Pre-Push Protocol (MANDATORY Checklist)
Before proposing a push or finishing a task, you MUST execute:
1. `pnpm lint`
2. `pnpm type-check`
3. `pnpm test`
4. If `pnpm test` is unavailable in local environment tooling, run `npx vitest run --config vitest.config.ts` and explicitly report the fallback.
5. Sync `README.md` if architecture or behavior changed.
6. Remove temporary files (`test_output.txt`, `.tmp`, logs, debug artifacts).

## Important Context
- Payments: `lib/infrastructure/payments/`.
- Auth + RBAC: `lib/infrastructure/auth/` + middleware.
- Activity logging is centralized.
- For `materials/works`, preferred orchestration is `action -> catalog service -> domain service -> data` (without redundant CRUD pass-through layers).
