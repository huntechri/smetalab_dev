# Dense Card Wrapper Compare Audit — 2026-04-27

## Scope

Compared dense-card wrappers and adjacent card-shell patterns in:

- `features/projects/estimates/components/tabs/EstimateExecution.tsx`
- `features/projects/estimates/components/tabs/EstimateProcurement.tsx`
- `features/global-purchases/components/cards/*`

## Findings

### 1) Repeated wrapper pattern is real (one mechanical duplicate)

- `EstimateExecution` and `GlobalPurchaseCard` already use `DenseCard` from `shared/ui/dense-card`.
- `EstimateProcurement` used an inline `<article>` wrapper with classes that are mechanically identical to `denseCardClassName`:
  - `overflow-hidden rounded-md border border-border bg-card shadow-[0_1px_2px_rgba(0,0,0,0.04)] sm:rounded-lg`

This duplication is not semantic; it is purely visual shell markup.

### 2) Inner layout/content are not extractable safely now

Although visual density is similar, card internals differ in behavior and data flow:

- `EstimateExecution` has editable execution status, editable fact values, and extra-work specific badges/actions.
- `EstimateProcurement` is read-focused with delta badges and export-oriented toolbar.
- `GlobalPurchaseCard` is fully inline-editable with async pending state, supplier/project pickers, and destructive action control.

So only wrapper-level deduplication is justified. Any shared inner card abstraction would be overly broad and risky.

## Decision

- **Do not create a global shared Card abstraction**.
- Apply only the safe, local mechanical refactor: use existing `DenseCard` in `EstimateProcurement`.
- Keep all content, text, interactions, and layout semantics unchanged.

## Change made

- In `EstimateProcurement`, replaced the duplicated inline card wrapper `<article ...>` with `<DenseCard>`.
- No visual or runtime behavior intent changed; only shell-class deduplication to the already-established dense-card primitive.

## Non-goals kept intact

- No server action changes.
- No DB/schema/migration changes.
- No estimate refresh/runtime logic changes.
- No table-shell architecture changes.
- No unrelated card refactors.
