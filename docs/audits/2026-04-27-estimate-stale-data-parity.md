# Estimate Stale Data Parity — 2026-04-27

## Purpose

This PR starts the larger data-refresh parity batch after dense-card UI consolidation. The scope is estimate tab stale-data behavior only.

## Surfaces reviewed

- Estimate rows client events.
- Estimate base rows controller.
- Estimate execution controller.
- Estimate procurement controller.
- Global purchases mutation notifications.

## Confirmed existing behavior

### Base estimate rows

Base estimate row mutations notify dependent tabs through `notifyEstimateRowsMutated(estimateId)` after successful row edits, removals and catalog inserts.

### Coefficient updates

Coefficient updates reload estimate rows and emit the coefficient-updated event.

This PR centralizes that event through `notifyEstimateCoefficientUpdated(estimateId)` instead of dispatching the raw browser event inline.

### Execution tab

Execution already refreshes after:

- estimate rows mutated;
- coefficient updated;
- window focus;
- pageshow;
- visibility change back to visible;
- periodic visible-tab interval.

This PR keeps the behavior and moves the repeated lifecycle wiring into `useEstimateExternalRefresh`.

### Procurement tab

Procurement already refreshes after:

- estimate rows mutated;
- estimate purchases mutated;
- window focus;
- pageshow;
- visibility change back to visible;
- periodic visible-tab interval.

This PR keeps the behavior and moves the repeated lifecycle wiring into `useEstimateExternalRefresh`.

### Global purchases

Global purchase mutations call `notifyEstimatePurchasesMutated()` after add, patch batch, remove, import and copy actions. The procurement tab listener accepts global purchase invalidation events without an explicit estimate id.

## Changes in this PR

- Added `notifyEstimateCoefficientUpdated`.
- Added `addEstimateCoefficientUpdatedListener`.
- Added `useEstimateExternalRefresh` for shared focus/pageshow/visibility/interval refresh wiring.
- Updated procurement controller to use `useEstimateExternalRefresh`.
- Kept execution behavior aligned through the centralized coefficient event API.

## Explicit non-goals

- No UI changes.
- No DB or schema changes.
- No server action rewrites.
- No optimistic update behavior changes.
- No refresh interval tuning.
- No project dashboard or global dashboard refresh changes.

## Follow-up candidates

1. Finish wiring execution controller to `useEstimateExternalRefresh` if the connector session allows a clean file update.
2. Add focused tests around `estimate-client-events` filtering.
3. Audit whether project dashboard KPI should listen to estimate/global-purchase invalidations or rely only on route refresh.
