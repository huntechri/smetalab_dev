# P0–P3 Recheck Report (2026-02-22)

## Scope of this recheck
- Verified previously delivered P0/P1/P2/P3 items against current code state.
- Re-ran quality gates: `pnpm lint`, `pnpm type-check`, `pnpm test`.

## What was improved (confirmed)

### P0 — shadcn alignment for critical controls
- `PermissionsMatrix` uses shadcn `Table` primitives (`Table`, `TableHeader`, `TableRow`, `TableCell`) instead of raw `<table>`.
- Permission level actions are rendered via `PermissionLevelControl`, and action triggers use shadcn `Button`.
- Critical raw-button spots previously flagged in audit were aligned to `Button` (admin menu + editable cell).

### P1 — typography baseline and consistency
- Added reusable typography utilities in global styles:
  - `.text-display`
  - `.text-title`
  - `.text-subtitle`
  - `.text-body`
  - `.text-caption`
- Permissions screen now applies these utilities for title/body/caption text and avoids local one-off tiny font classes in the matrix content.

### P2 — decomposition of a god component
- Data loading + update side-effects were extracted to `usePermissionsMatrix` hook.
- Permission level UI control was extracted into atomic `PermissionLevelControl`.
- `PermissionsMatrix` now acts as composition/orchestration layer instead of holding all concerns.

### P3 — guardrail to prevent regressions
- ESLint now blocks raw `<button>` and `<table>` in app code areas and points developers to shadcn primitives.
- Guardrail scope is configured for `app/**/*`, `features/**/*`, `components/**/*` with explicit allowlist exceptions.

## Current verification results
- `pnpm lint` — passes with warnings only (no errors).
- `pnpm type-check` — passes.
- `pnpm test` — passes (`79` test files, `237` tests).

## What still needs to be done
1. **Reduce technical debt from lint warnings**
   - Lint currently reports warnings (mainly `no-explicit-any` and unused vars) across tests/scripts/ui helpers.
   - Next step: run a warning burn-down wave (start with high-churn files and shared UI helpers).

2. **Complete P1 rollout beyond permissions screen**
   - Typography utilities are introduced, but should be systematically adopted across remaining key routes (login/dashboard/dialog-heavy pages/tables/toolbars).

3. **Add visual regression checks for responsive typography (original P2 recommendation #6)**
   - Add Playwright/Storybook snapshots at key breakpoints: `375`, `768`, `1024`, `1440`.

4. **Ship a dedicated Typography & Density Guide (original P3 recommendation #8)**
   - Convert utility classes into a documented usage standard with examples for headers, tabs, table cells, dialogs, and search controls.

## Overall readiness
- **P0–P3 baseline is implemented and stable.**
- Team can proceed with a focused hardening phase: warning cleanup + broad typography rollout + visual regression automation.
