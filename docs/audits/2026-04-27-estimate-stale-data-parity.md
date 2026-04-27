# Estimate Stale Data Parity — 2026-04-27

## Purpose

This document records the current estimate tab stale-data behavior after PR #98 and the execution refresh hook follow-up.

## Surfaces reviewed

- Estimate rows client events.
- Estimate base rows controller.
- Estimate execution controller.
- Estimate procurement controller.
- Global purchases mutation notifications.

## Confirmed behavior

### Base estimate rows

Base estimate row mutations notify dependent tabs through `notifyEstimateRowsMutated(estimateId)` after successful row edits, removals and catalog inserts.

### Coefficient updates

Coefficient updates reload estimate rows and emit the coefficient-updated event through `notifyEstimateCoefficientUpdated(estimateId)`.

### Execution tab

Execution refreshes after:

- estimate rows mutated;
- coefficient updated;
- window focus;
- pageshow;
- visibility change back to visible;
- periodic visible-tab interval.

The execution controller now uses `useEstimateExternalRefresh` for the shared refresh lifecycle wiring.

### Procurement tab

Procurement refreshes after:

- estimate rows mutated;
- estimate purchases mutated;
- window focus;
- pageshow;
- visibility change back to visible;
- periodic visible-tab interval.

The procurement controller uses `useEstimateExternalRefresh` for the shared refresh lifecycle wiring.

### Global purchases

Global purchase mutations call `notifyEstimatePurchasesMutated()` after add, patch batch, remove, import and copy actions. The procurement tab listener accepts global purchase invalidation events without an explicit estimate id.

## Closed items

- Coefficient refresh event is centralized.
- Procurement refresh lifecycle wiring is centralized.
- Execution refresh lifecycle wiring is centralized.
- Estimate client invalidation events have unit coverage.

## Test coverage

`__tests__/unit/estimate-client-events.test.ts` verifies:

- row invalidation only notifies matching estimate listeners;
- coefficient invalidation only notifies matching estimate listeners;
- purchase invalidation accepts global events without `estimateId`;
- purchase invalidation ignores events for another estimate;
- unsubscribe functions remove listeners.

## Explicit non-goals

- No UI changes.
- No DB or schema changes.
- No server action rewrites.
- No optimistic update behavior changes.
- No refresh interval tuning.
- No project dashboard or global dashboard refresh changes.

## Follow-up candidates

1. Audit whether project dashboard KPI should listen to estimate/global-purchase invalidations or rely only on route refresh.
2. Add integration-level stale-data smoke coverage if regressions recur in estimate tabs.
