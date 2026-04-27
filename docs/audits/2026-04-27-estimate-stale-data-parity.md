# Estimate Stale Data Parity — 2026-04-27

## Purpose

This audit records the current estimate tab stale-data behavior after the deep UI audit cleanup chain through PR #118.

This is an audit-only pass. It does not change refresh behavior, server actions, DB schema, or UI state management.

## Sources reviewed

- `docs/audits/2026-04-27-deep-ui-audit-status.md`
- `app/(workspace)/app/projects/[projectId]/estimates/[estimateId]/page.tsx`
- `features/projects/estimates/screens/EstimateDetailsShell.client.tsx`
- `features/projects/estimates/lib/estimate-client-events.ts`
- `features/projects/estimates/hooks/use-estimate-external-refresh.ts`
- `features/projects/estimates/hooks/use-estimate-rows-data.ts`
- `features/projects/estimates/hooks/use-estimate-rows-data-row-mutations.ts`
- `features/projects/estimates/hooks/use-estimate-rows-data-catalog-section.ts`
- `features/projects/estimates/hooks/use-estimate-rows-data-coefficient.ts`
- `features/projects/estimates/hooks/use-estimate-procurement-controller.ts`
- `features/projects/estimates/hooks/use-estimate-execution-controller.ts`
- `features/global-purchases/hooks/useGlobalPurchasesTable.ts`
- `lib/services/estimate-rows.service.ts`
- `lib/services/estimate-execution.service.ts`
- `lib/services/estimate-import.service.ts`
- `app/actions/estimates/rows.ts`
- `app/actions/estimates/coefficient.ts`
- `app/actions/estimates/execution.ts`
- `app/api/estimates/[estimateId]/rows/[rowId]/route.ts`
- `__tests__/unit/estimate-client-events.test.ts`
- `__tests__/integration/estimate-procurement-cache-invalidation.test.ts`
- `__tests__/integration/procurement-cache.test.ts`

## Current tab/data-loading topology

The estimate details page is a server route that resolves project/estimate access, then passes per-tab data promises into the client shell:

- base estimate rows;
- room parameters;
- execution rows;
- procurement rows;
- finance rows and aggregates.

The client shell owns tab state through the `tab` search parameter and `history.replaceState`. The base estimate tab is force-mounted. Params, finance and docs are lazy-gated through `loadedTabs`. Procurement and execution are mounted through their Suspense loaders and then rely on their own controller refresh lifecycles.

## Invalidation event contract

`features/projects/estimates/lib/estimate-client-events.ts` currently defines three browser-level invalidation events:

```txt
estimate:rows-mutated
estimate:purchases-mutated
estimate:coefficient-updated
```

Matching behavior:

- row mutation listeners require the same `estimateId`;
- coefficient listeners require the same `estimateId`;
- purchase listeners accept either a matching `estimateId` or a global event without `estimateId`.

This keeps global purchase changes able to refresh estimate procurement tabs even when the global purchase source cannot cheaply map the mutation to one estimate.

## Confirmed behavior

### Base estimate rows

Base estimate row edits, removals, catalog work/material inserts, replacements and section creation notify dependent tabs with `notifyEstimateRowsMutated(estimateId)` after successful mutations.

Row delete uses the route handler:

```txt
DELETE /api/estimates/[estimateId]/rows/[rowId]
```

The client repository calls this route with `cache: 'no-store'`, and the row controller emits the row-mutated client event only after successful deletion.

### Coefficient updates

Coefficient apply/reset flows call server actions, update local coefficient state, then reload estimate rows.

The shared `reloadRows` function currently dispatches `notifyEstimateCoefficientUpdated(estimateId)` after reloading rows. This gives the execution tab a signal to reload planned coefficient-dependent values.

Current behavior is conservative and safe for stale-data prevention, but the event name is broader than the implementation because `reloadRows` may also be called by non-coefficient flows.

### Execution tab

Execution refreshes after:

- estimate rows mutated;
- coefficient updated;
- window focus;
- `pageshow`;
- visibility change back to `visible`;
- periodic visible-tab interval.

The execution controller uses `useEstimateExternalRefresh`, which centralizes focus/pageshow/visibility/interval wiring.

Execution data is also protected on the server side. Estimate row mutations mark execution data stale through the execution sync version path, while `EstimateExecutionService.list` syncs from estimate works if `executionSyncedVersion < executionSyncVersion` before returning rows.

Execution row edits and extra execution works are local to the execution tab. They update local execution rows, call the execution server action, refresh project/home dashboard-side data in the service layer, and call `router.refresh()` from the controller.

### Procurement tab

Procurement refreshes after:

- estimate rows mutated;
- estimate purchases mutated;
- window focus;
- `pageshow`;
- visibility change back to `visible`;
- periodic visible-tab interval.

The procurement controller also uses `useEstimateExternalRefresh`, so the lifecycle wiring is aligned with execution.

### Global purchases

Global purchase mutations emit `notifyEstimatePurchasesMutated()` after:

- manual row add;
- catalog row add;
- successful batched patch flush;
- row remove;
- import;
- copy-to-next-day when rows were actually created.

Because the event is global, mounted procurement controllers for estimates can reload without requiring global-purchase code to know the exact estimate id.

### Import flow

Estimate import replaces rows at the service layer and calls `EstimateExecutionService.syncAfterEstimateMutation(teamId, estimateId)` after replacement. This keeps generated execution rows stale until the execution tab reads them, consistent with the lazy sync model.

## Parity matrix

| Surface | Row mutation event | Purchase mutation event | Coefficient event | Focus/pageshow/visible refresh | Notes |
| --- | --- | --- | --- | --- | --- |
| Base estimate tab | Emits | Not applicable | Emits through row reload | Not currently using external refresh hook | Source of row/coefficient mutations. |
| Procurement tab | Listens | Listens, including global events | Not required | Yes | Parity with execution lifecycle is present. |
| Execution tab | Listens | Not required | Listens | Yes | Server-side stale sync protects planned work rows. |
| Params tab | Not currently wired | Not required | Not required | Not currently wired | Room params are independent from estimate rows. |
| Finance tab | Not currently wired to estimate events | Not currently wired to estimate events | Not required | Delegated to `ProjectReceiptsSection` behavior | Finance is project-receipts scoped, not estimate-row scoped. |
| Docs tab | Not required | Not required | Not required | Not required | Placeholder/document surface. |

## Findings

### Finding 1 — Execution/procurement refresh parity is currently acceptable

Both execution and procurement use the same external refresh hook and are subscribed to their relevant mutation events.

No implementation change is recommended from this audit alone.

### Finding 2 — Coefficient invalidation is safe but semantically broad

`useEstimateRowsData.reloadRows` dispatches `notifyEstimateCoefficientUpdated(estimateId)` after every row reload, not only after coefficient apply/reset.

This avoids stale execution planned values, but it can over-refresh execution after row reloads that are not coefficient changes.

Recommended future cleanup:

- split `reloadRows` into a plain reload and a coefficient-specific reload; or
- move `notifyEstimateCoefficientUpdated(estimateId)` directly into `applyCoefficient` and `resetCoefficient` after successful row reload.

Do this only if profiling or duplicated refresh noise becomes a real issue. It is not a stale-data correctness bug.

### Finding 3 — Server-side execution sync model is correct for stale-data safety

Estimate row mutations do not eagerly upsert all execution rows. They mark execution stale through sync versioning, and execution list reads perform sync if stale.

This is a good tradeoff: row mutations stay fast, and execution data becomes fresh when the execution tab loads or refreshes.

### Finding 4 — Finance tab is outside the estimate row/procurement invalidation model

The finance tab wraps `ProjectReceiptsSection`, using project receipt rows and aggregates. It is not currently part of estimate rows/procurement/coefficient events.

No change is recommended in this estimate stale-data PR. If finance stale-data issues appear, audit project receipts refresh separately.

### Finding 5 — Existing test coverage is focused on client event filtering

`estimate-client-events` has unit coverage for estimate-id matching, global purchase invalidation, and unsubscribe behavior.

Recommended future test-only improvement:

- add integration or component-level smoke coverage for tab parity:
  - base row mutation refreshes execution/procurement;
  - coefficient apply/reset refreshes execution;
  - global purchase mutation refreshes procurement;
  - focus/pageshow/visibility refresh remains wired for execution and procurement.

## Explicit non-goals

- No UI changes.
- No DB or schema changes.
- No server action rewrites.
- No optimistic update behavior changes.
- No refresh interval tuning.
- No project dashboard or global dashboard refresh changes.
- No finance/project receipts refresh changes.

## Recommended next PR

No runtime fix is required based on this audit.

The safest follow-up is test-only:

```txt
test(estimates): cover stale-data refresh parity for execution and procurement
```

Scope for that PR:

- unit or component tests for `useEstimateExternalRefresh` subscribers;
- event dispatch tests for rows/coefficient/purchase invalidations;
- no production behavior changes.

If runtime work is still desired, start with the low-risk coefficient-event naming cleanup, but only as a separate PR with tests.
