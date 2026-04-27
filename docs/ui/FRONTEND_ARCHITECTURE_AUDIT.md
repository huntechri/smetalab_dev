# Frontend Architecture Audit (2026-02)

## Scope
- App Router layout and route composition.
- Feature boundaries for guide modules (`materials`, `works`, `counterparties`, `projects`).
- Shared UI primitives and state patterns.
- Client/server boundary hygiene.

## Current status

### ✅ What is aligned
1. **Thin server routes + feature screens**
   - Route pages in `app/(workspace)/app/guide/**/page.tsx` fetch initial data and render `features/**/screens/*Screen`.
2. **Feature decomposition is in place**
   - `features/*` modules are split into `components`, `hooks`, and `screens`.
3. **Shared table behavior extraction**
   - Search/load-more orchestration was centralized in `hooks/use-guide-table-search.ts`.
4. **Shared state UI layer**
   - Loading/empty/error/forbidden states are standardized in `shared/ui/states/*`.
5. **Sidebar composition cleanup**
   - App-level nav rendering is separated into `components/navigation/sidebar-nav.tsx`.
6. **Canonical shared UI imports are guarded**
   - Runtime roots are protected by `pnpm audit:ui-imports`, added in PR #90.
   - The gate covers `app/**`, `components/**`, `features/**`, `entities/**`, and `shared/**`.
7. **DataTable header rendering is normalized**
   - `shared/ui/data-table.tsx` now has extracted header helpers from PR #91.
8. **InputGroup textarea styling is variant-driven**
   - `Textarea` supports `variant="inputGroup"`, and `InputGroupTextarea` delegates to that variant as of PR #92.

### ⚠️ Gaps to close
1. **Historical report drift**
   - `UI_ARCHITECTURE_REPORT.md` still includes pre-migration paths in the file inventory.
2. **README drift risk**
   - Architectural docs must stay synced with `features/**` as the current UI module map.
3. **Regression coverage for shared hooks**
   - Add/expand tests for `hooks/use-guide-table-search.ts` and `features/*/screens/*Screen` orchestration.
4. **Button/Input override cleanup**
   - Identify recurring one-off button/input class overrides and promote stable recipes into variants or adapters.
5. **Card visual consistency audit**
   - Compare estimate, execution, procurement, dashboard and project cards before making shared recipe changes.
6. **Estimate stale-data parity review**
   - Execution/procurement refresh parity has improved, but coefficient propagation and tab refresh boundaries should still be audited.

## Recommended guardrails
1. New guide UI work should be created under `features/<feature>/**` only.
2. `app/**/page.tsx` should remain server-first wrappers (fetch + compose).
3. Shared table UX contracts should be implemented once in shared hooks, with feature adapters for domain specifics.
4. Any new UI state pattern should use `shared/ui/states/*` instead of ad hoc inline blocks.
5. Runtime UI imports must use canonical `@/shared/ui/*` paths, not `@repo/ui`.
6. Cleanup PRs must not hide business logic, server action, DB/schema, or broad UX changes.

## Verification checklist (for future PRs)
- `pnpm lint`
- `pnpm type-check`
- `pnpm test`
- `pnpm audit:ui`
- Ensure docs updated when structure changes (`README.md`, `UI_ARCHITECTURE_REPORT.md`, this file)

## Status log
- PR #90 closed runtime canonical UI import drift and added `audit:ui-imports`.
- PR #91 normalized `DataTable` header rendering helpers.
- PR #92 moved `InputGroupTextarea` styling into a supported `Textarea` variant.
- See `docs/audits/2026-04-27-deep-ui-audit-status.md` for the detailed current status map.
