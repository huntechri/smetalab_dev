# Procurement / Global Purchases Consistency — 2026-04-27

## Purpose

This PR follows the dashboard refresh parity batch and targets the procurement/global-purchases consistency layer.

The goal is to make sure estimate procurement reflects actual global purchase mutations, especially soft-deleted purchase rows.

## Surfaces reviewed

- `lib/services/estimate-procurement.service.ts`
- `lib/services/global-purchases.service.ts`
- `features/global-purchases/hooks/useGlobalPurchasesTable.ts`
- `features/projects/estimates/hooks/use-estimate-procurement-controller.ts`
- `__tests__/integration/estimate-procurement.service.test.ts`
- `__tests__/unit/estimate-procurement.service.test.ts`

## Current behavior

### Matching model

Procurement rows are aggregated by `matchKey`:

- material id based match when `materialId` exists;
- normalized material name based match when `materialId` is absent.

This supports both current catalog-linked purchases and historical/manual purchases.

### Cache model

`EstimateProcurementService.list(...)` reads from `estimate_procurement_cache` and refreshes the cache when source data is newer than the cached rows.

Source data includes:

- planned estimate material rows;
- actual global purchase rows for the estimate project.

### Client invalidation

Global purchases UI already calls `notifyEstimatePurchasesMutated()` after:

- add manual purchase;
- add catalog purchase;
- patch batch;
- remove;
- import;
- copy to next day.

Estimate procurement controller listens to these events and also refreshes on focus/pageshow/visible tab through the shared external refresh hook.

## Issue fixed in this PR

The procurement cache freshness query previously ignored soft-deleted global purchases when calculating `latestSourceAt`:

```sql
AND global_purchases.deleted_at IS NULL
```

That could leave stale actual quantities/amounts in the procurement cache after a purchase row was soft-deleted, because the deletion timestamp was hidden from the freshness check.

## Changes in this PR

- Removed the active-row filter from the global purchases freshness subquery inside `EstimateProcurementService.shouldRefreshCache(...)`.
- Active-row filtering is still preserved in `refreshCache(...)` through `withActiveTenant(globalPurchases, teamId)`, so deleted purchases are not counted in actual totals.
- Added an integration regression test that:
  - builds a procurement cache with one actual purchase;
  - soft-deletes that purchase;
  - verifies the next procurement read refreshes cache and returns zero actuals.

## Explicit non-goals

- No UI changes.
- No global purchases table behavior changes.
- No DB/schema changes.
- No migration changes.
- No matching algorithm rewrite.
- No cache table structure changes.

## Manual smoke

- Estimate procurement tab shows actual purchase amounts.
- Delete a global purchase linked to the same project.
- Return to the estimate procurement tab.
- The actual quantity/amount for that material should update after refresh.
- Plan-only materials should remain visible.
- Fact-only purchases should disappear after the last matching purchase is deleted.

## Follow-up candidates

1. Add a regression test for global purchase project reassignment if this flow becomes common.
2. Audit whether `match_key` trigger normalization should be aligned with the stronger TypeScript normalization used in `buildEstimateProcurementRows`.
3. Keep DB/index tuning for procurement queries in the production hardening batch.
