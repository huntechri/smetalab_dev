# UI Refactor Audit — 2026-04-28

## Scope
- Full validation run after merged large-scale UI refactor.
- Focus: places where refactor contracts are violated at runtime and where UI primitives are inconsistently applied.

## What was checked
1. Static scan for UI primitive usage and potential bypasses.
2. Full quality gate run: lint, type-check, and tests.
3. Analysis of runtime warnings emitted during UI tests.

## Findings

### 1) `iconLeft` prop leakage warning in interactive table flows (HIGH)
**Symptoms**
- During test execution, React reports: `React does not recognize the iconLeft prop on a DOM element`.
- Warning appears in flows for:
  - Global purchases table (`GlobalPurchasesView`)
  - Estimate table insert-below flow

**Why it matters**
- This is a contract regression after refactor: `iconLeft` is expected to be a design-system prop, not a DOM attribute.
- Even if tests pass, this can hide real UI regressions and pollute console telemetry.

**Likely hotspots**
- `features/global-purchases/components/GlobalPurchasesToolbar.tsx`
- `features/global-purchases/components/GlobalPurchasesImportExportActions.tsx`
- `features/projects/estimates/components/table/EstimateTableToolbar.tsx`
- `shared/ui/toolbar-button.tsx`

**Notes**
- `shared/ui/button.tsx` correctly declares and strips `iconLeft`/`iconRight` from native button props.
- Warning indicates at least one render path still passes `iconLeft` to a plain DOM element (likely through an intermediate component or test wrapper path).

### 2) UI primitive boundary is mostly preserved (PASS with monitoring)
**Result**
- Direct `@radix-ui/*` imports in feature/app code were not found in the scanned set.
- Radix usage remains centralized in `shared/ui/*`, which matches UI-canon goals.

**Residual risk**
- Runtime prop-forwarding issue above suggests wrapper-level contract tests are still needed around `ToolbarButton` + `Button` combinations.

## Recommended follow-up
1. Add a focused regression test for `ToolbarButton` ensuring `iconLeft`/`iconRight` never appear as DOM attributes.
2. Reproduce warning with isolated render of each toolbar action component and inspect prop spread path.
3. Treat console warnings as CI-failing for UI tests touching design-system wrappers.

## Executed checks
- `pnpm lint` ✅
- `pnpm type-check` ✅
- `pnpm test` ✅ (all tests pass, but warnings remain)
