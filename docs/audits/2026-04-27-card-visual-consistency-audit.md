# Card Visual Consistency Audit — 2026-04-27

## Purpose

This audit records the card-surface review for the deep UI cleanup series and keeps the implementation boundary explicit.

The goal is to identify safe consolidation points without doing a broad redesign.

## Current status after follow-up PRs

Status: mostly closed for the current cleanup series.

The original audit recommended incremental card cleanup only. Current main already contains the key safe implementation pieces:

- estimate-local card constants in `features/projects/estimates/components/table/cards/constants.ts`;
- `EstimateMetricPill` in `features/projects/estimates/components/table/cards/EstimateMetricPill.tsx`;
- estimate-local icon action class reuse across estimate work/material cards;
- shared operational dense wrapper in `shared/ui/dense-card.tsx`;
- `DenseCard` usage in estimate execution cards;
- `DenseCard` usage in global purchase cards.

This means the strongest exact wrapper duplication from the original audit is already resolved. Future work should be treated as optional P3 refinement only.

## Sources checked

- `features/projects/list/components/project-card.tsx`
- `features/projects/estimates/components/table/cards/EstimateWorkCard.tsx`
- `features/projects/estimates/components/table/cards/EstimateMaterialCard.tsx`
- `features/projects/estimates/components/table/cards/EstimateMetricPill.tsx`
- `features/projects/estimates/components/table/cards/constants.ts`
- `features/projects/estimates/components/tabs/EstimateExecution.tsx`
- `features/global-purchases/components/GlobalPurchasesCardsList.tsx`
- `features/global-purchases/components/cards/GlobalPurchaseCard.tsx`
- `features/global-purchases/components/cards/PurchaseMetric.tsx`
- `shared/ui/card.tsx`
- `shared/ui/kpi-card.tsx`
- `shared/ui/dense-card.tsx`

## Shared Card primitive

`shared/ui/card.tsx` remains a low-level shadcn-style primitive.

Recommendation: keep it generic. Do not push feature-specific dense-card layout decisions into the primitive.

## KPI card primitive

`shared/ui/kpi-card.tsx` represents a separate dashboard/KPI surface.

Recommendation: do not merge KPI semantics with estimate/procurement/project cards.

## Dense operational card wrapper

Current implementation:

```tsx
// shared/ui/dense-card.tsx
export const denseCardClassName =
  'overflow-hidden rounded-md border border-border bg-card shadow-[0_1px_2px_rgba(0,0,0,0.04)] sm:rounded-lg';
```

Used by:

- estimate execution cards;
- global purchase cards.

Status: closed for exact wrapper duplication.

Remaining rule:

- keep field composition feature-owned;
- do not move estimate/procurement-specific cells into `shared/ui/dense-card.tsx`;
- do not turn this into a global replacement for `Card`.

## Surface review

### Project cards

File:

- `features/projects/list/components/project-card.tsx`

Observed structure:

- uses shared `Card`, `CardHeader`, `CardContent`, `CardFooter`;
- has semantic project header with status/progress badges;
- has metric blocks for budget and dates;
- has a progress area with project-specific gradient logic;
- has action footer using `ProjectActions`.

Pattern type:

- entity summary card;
- not a dense editable operational row.

Status: keep separate.

Do not change in this cleanup series:

- `getProgressGradient`;
- project card grid/action layout;
- progress bar size or colors.

### Estimate work cards

File:

- `features/projects/estimates/components/table/cards/EstimateWorkCard.tsx`

Current state:

- dense operational work row/card;
- uses estimate-local `EstimateMetricPill`;
- uses estimate-local `ESTIMATE_CARD_ICON_ACTION_CLASS`;
- uses estimate-local inline number/text class constants.

Status: closed for current exact class extraction.

Remaining optional refinement:

- only small estimate-local cleanup if a repeated class remains after direct file comparison;
- no data-flow changes;
- no virtualization/layout changes.

### Estimate material cards

File:

- `features/projects/estimates/components/table/cards/EstimateMaterialCard.tsx`

Current state:

- compact nested material card;
- uses `ESTIMATE_MATERIAL_CARD_CLASS`;
- uses `EstimateMetricPill`;
- uses `ESTIMATE_CARD_ICON_ACTION_CLASS`;
- uses estimate-local inline number/text class constants.

Status: closed for current exact class extraction.

### Estimate execution cards

File:

- `features/projects/estimates/components/tabs/EstimateExecution.tsx`

Current state:

- dense operational cards for works only;
- uses shared `DenseCard` wrapper;
- uses estimate-local `EstimateMetricPill` for editable fact values;
- keeps execution-specific `ExecutionValue` and status dropdown local.

Status: closed for wrapper compatibility.

Remaining rule:

- do not mix execution card visual cleanup with execution data-refresh or stale-data work.

### Global purchase cards

Files:

- `features/global-purchases/components/GlobalPurchasesCardsList.tsx`
- `features/global-purchases/components/cards/GlobalPurchaseCard.tsx`

Current state:

- dense editable operational row/card;
- uses shared `DenseCard` wrapper;
- keeps procurement-specific composition local: `EditableCell`, `ProjectPicker`, `SupplierPicker`, `PurchaseMetric`, `DeletePurchaseAction`;
- `PurchaseMetric` exists for read-only amount display.

Status: closed for wrapper compatibility.

Remaining optional refinement:

- a small feature-local editable metric wrapper may be considered only if it preserves the exact current class string and behavior;
- do not promote procurement-specific editable cells into shared UI.

## Repeatable patterns and current decision

### Dense card wrapper

Decision: closed.

The exact wrapper duplication is handled by `shared/ui/dense-card.tsx`.

### Metric pill pattern

Decision: partially closed, feature-owned.

Current split is intentional:

- estimate cards use `EstimateMetricPill`;
- global purchases use `PurchaseMetric` plus local editable metric wrappers where needed;
- no global `MetricPill` should be introduced unless multiple features share exact class, density and semantics.

### Icon action button style

Decision: closed for estimate card scope.

Estimate work/material cards already use `ESTIMATE_CARD_ICON_ACTION_CLASS`.

### Status/badge tone style

Decision: keep local.

Status badges, metric badges, sum badges and category labels remain business-context dependent.

## Remaining safe next batches

### Optional PR A — Global purchase editable metric wrapper

Scope:

- `features/global-purchases/components/cards/GlobalPurchaseCard.tsx` only;
- extract only the repeated editable quantity/price metric shell;
- preserve exact class string;
- no behavior changes;
- no shared UI changes.

Allowed shape:

```tsx
<EditablePurchaseMetric label="Кол-во">
  <EditableCell />
  <EditableCell />
</EditablePurchaseMetric>
```

### Optional PR B — No-op verification of dense card usage

Scope:

- audit-only or test-only if needed;
- verify that estimate execution and global purchase cards keep using `DenseCard`;
- no visual changes.

## Explicit non-goals

- Do not redesign cards.
- Do not change spacing/density in the same PR as extraction.
- Do not replace project cards with dense operational cards.
- Do not merge `Card` and `KPICard` semantics.
- Do not change `Progress` colors or `getProgressGradient`.
- Do not touch server actions, DB/schema, or stale-data refresh logic.
- Do not introduce a global metric pill unless exact cross-feature compatibility is proven.

## Final recommendation

For the current audit series, card cleanup can be considered effectively complete.

Only proceed with optional feature-local refinements when they are mechanically verifiable and confined to one feature file at a time.
