# Frontend Architecture Audit (2026-02)

## Scope
- App Router layout and route composition.
- Feature boundaries for guide modules (`materials`, `works`, `counterparties`).
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
   - Loading/empty/error/forbidden states are standardized in `components/ui/states/*`.
5. **Sidebar composition cleanup**
   - App-level nav rendering is separated into `components/navigation/sidebar-nav.tsx`.

### ⚠️ Gaps to close
1. **Historical report drift**
   - `UI_ARCHITECTURE_REPORT.md` still includes pre-migration paths in the file inventory.
2. **README drift risk**
   - Architectural docs must stay synced with `features/**` as the current UI module map.
3. **Regression coverage for shared hooks**
   - Add/expand tests for `hooks/use-guide-table-search.ts` and `features/*/screens/*Screen` orchestration.

## Recommended guardrails
1. New guide UI work should be created under `features/<feature>/**` only.
2. `app/**/page.tsx` should remain server-first wrappers (fetch + compose).
3. Shared table UX contracts should be implemented once in shared hooks, with feature adapters for domain specifics.
4. Any new UI state pattern should use `components/ui/states/*` instead of ad hoc inline blocks.

## Verification checklist (for future PRs)
- `pnpm lint`
- `pnpm type-check`
- `pnpm test`
- Ensure docs updated when structure changes (`README.md`, `UI_ARCHITECTURE_REPORT.md`, this file)
