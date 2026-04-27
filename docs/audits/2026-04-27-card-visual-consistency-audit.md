# Card Visual Consistency Audit — 2026-04-27

## Purpose

This audit is the next P2 step after PR #94. It reviews the existing card surfaces before any shared card recipe or visual consolidation is introduced.

The goal is to identify safe consolidation points without doing a broad redesign.

## Sources checked

- `features/projects/list/components/project-card.tsx`
- `features/projects/estimates/components/table/cards/EstimateWorkCard.tsx`
- `features/projects/estimates/components/table/cards/EstimateMaterialCard.tsx`
- `features/projects/estimates/components/tabs/EstimateExecution.tsx`
- `features/global-purchases/components/GlobalPurchasesCardsList.tsx`
- `features/global-purchases/components/cards/GlobalPurchaseCard.tsx`
- `shared/ui/card.tsx`
- `shared/ui/kpi-card.tsx`

## Current state

### Shared Card primitive

`shared/ui/card.tsx` remains a low-level shadcn-style primitive.

Recommendation: keep it generic. Do not push feature-specific dense-card layout decisions into the primitive.

### KPI card primitive

`shared/ui/kpi-card.tsx` already represents a separate dashboard/KPI surface. It should remain separate from dense operational list cards.

Recommendation: do not merge KPI semantics with estimate/procurement/project cards.

## Surface review

### Project cards

File:

- `features/projects/list/components/project-card.tsx`

Observed structure:

- uses shared `Card`, `CardHeader`, `CardContent`, `CardFooter`;
- has semantic project header with status/progress badges;
- has two metric blocks for budget and dates;
- has a progress area with custom gradient via `getProgressGradient`;
- has action footer using `ProjectActions`.

Pattern type:

- entity summary card;
- not a dense editable operational row.

Recommended handling:

- keep on shared `Card` primitive;
- do not force into estimate/procurement dense-row recipe;
- later visual cleanup can target project-specific metric blocks and progress gradient separately.

Do not change now:

- `getProgressGradient`;
- project card grid/action layout;
- progress bar size or colors.

### Estimate work cards

File:

- `features/projects/estimates/components/table/cards/EstimateWorkCard.tsx`

Observed structure:

- dense operational row/card;
- work row is not using `Card`; it uses lightweight `div` wrappers;
- hierarchy: main work row + expandable materials area;
- repeated metric pills for qty/price/sum;
- repeated small icon action buttons with `size="icon-xs"`, `rounded-lg`, slate border/background classes.

Pattern type:

- dense editable operational card;
- table replacement card, not a general content card.

Recommended handling:

- keep as feature-owned estimate card surface;
- extract small estimate-local recipes only after comparing with material/execution cards;
- do not replace with global `Card` wrapper without checking density and virtualization/layout impact.

Candidate future adapter:

```tsx
<EstimateDenseCard />
<EstimateMetricPill />
<EstimateCardIconAction />
```

Only implement after a narrow estimate-card PR.

### Estimate material cards

File:

- `features/projects/estimates/components/table/cards/EstimateMaterialCard.tsx`

Observed structure:

- compact nested material card;
- uses `rounded-lg border border-slate-200 bg-white p-1 sm:p-1.5 shadow-[0_1px_2px_rgba(0,0,0,0.04)]`;
- repeats slate metric pills and green sum badge;
- repeats card icon action button style from work cards.

Pattern type:

- nested dense editable operational card.

Recommended handling:

- good candidate for estimate-local recipe extraction;
- align with `EstimateWorkCard` first;
- avoid global shared card variant.

Candidate safe extraction:

```tsx
const estimateCardShadowClassName = "shadow-[0_1px_2px_rgba(0,0,0,0.04)]"
const estimateIconActionClassName = "size-6 rounded-lg border-slate-200 bg-white text-slate-500 hover:bg-slate-50 sm:size-7"
```

Do not implement in this audit PR.

### Estimate execution cards

File:

- `features/projects/estimates/components/tabs/EstimateExecution.tsx`

Observed structure:

- dense operational cards for works only;
- article wrapper uses `overflow-hidden rounded-md border border-border bg-card shadow-[0_1px_2px_rgba(0,0,0,0.04)] sm:rounded-lg`;
- layout is plan/fact oriented;
- repeats metric pill style with slate/blue/green tonal variants;
- uses `EstimateInlineNumberCell` for editable actual qty/price.

Pattern type:

- dense execution status card;
- close to estimate work/material card density, but not identical semantics.

Recommended handling:

- candidate for estimate-local metric-pills and dense-card wrapper recipes;
- do not mix execution card cleanup with execution data-refresh or stale-data work.

### Global purchase cards

Files:

- `features/global-purchases/components/GlobalPurchasesCardsList.tsx`
- `features/global-purchases/components/cards/GlobalPurchaseCard.tsx`

Observed structure:

- list wrapper with `max-h-[625px] overflow-y-auto px-1.5 pb-1.5 sm:px-3 sm:pb-3`;
- card wrapper uses `article` with `overflow-hidden rounded-md border border-border bg-card shadow-[0_1px_2px_rgba(0,0,0,0.04)] sm:rounded-lg`;
- grid layout is procurement-specific: date, material/project, qty/price/sum, supplier, actions;
- uses `EditableCell`, `ProjectPicker`, `SupplierPicker`, `PurchaseMetric`, `DeletePurchaseAction`.

Pattern type:

- dense editable operational row/card;
- semantically close to estimate execution card wrapper.

Recommended handling:

- good candidate for a shared dense operational wrapper only if estimate execution and procurement wrappers stay identical;
- keep procurement field composition feature-owned.

Candidate future adapter:

```tsx
<OperationalDenseCard as="article" />
```

But only after an implementation PR verifies exact class compatibility and no layout regression.

## Repeatable patterns found

### Dense card wrapper

Repeated class shape:

```text
overflow-hidden rounded-md border border-border bg-card shadow-[0_1px_2px_rgba(0,0,0,0.04)] sm:rounded-lg
```

Appears in:

- estimate execution cards;
- global purchase cards.

Similar but not identical:

- estimate material card uses `rounded-lg border border-slate-200 bg-white p-1 sm:p-1.5`;
- project card uses shared `Card` and hover translation.

Recommendation:

- possible future shared adapter for dense operational cards;
- do not force project cards into it.

### Metric pill pattern

Repeated shape:

```text
inline-flex h-4/h-5 items-center rounded-full border bg-* px-* text-[9px]/text-[10px]
```

Appears in:

- estimate work cards;
- estimate material cards;
- estimate execution cards;
- global purchase cards.

Recommendation:

- best first implementation candidate;
- start feature-local, likely under estimate cards first;
- avoid global badge changes.

Possible future APIs:

```tsx
<EstimateMetricPill tone="neutral" label="Кол-во" />
<PurchaseMetric /> // already exists for global purchases
```

### Icon action button style

Repeated shape:

```text
size-6 rounded-lg border-slate-200 bg-white text-slate-500 hover:bg-slate-50 sm:size-7
```

Appears in:

- estimate work card action buttons;
- estimate material card action menu trigger.

Recommendation:

- estimate-local extraction is safe;
- do not add global Button variant.

### Status/badge tone style

Repeated behavior:

- status badges;
- metric badges;
- sum badges;
- category/label badges.

Recommendation:

- do not normalize all badges globally;
- badge tones are business-context dependent;
- only extract local recipes when exact class and semantics match.

## Safe implementation plan

### PR A — Estimate dense card recipe extraction

Scope:

- estimate cards only;
- extract exact repeated class constants from:
  - `EstimateWorkCard.tsx`
  - `EstimateMaterialCard.tsx`
  - possibly `EstimateExecution.tsx`
- no JSX structure changes;
- no data-flow changes.

Candidate constants:

```ts
export const ESTIMATE_CARD_SHADOW_CLASS = "shadow-[0_1px_2px_rgba(0,0,0,0.04)]";
export const ESTIMATE_CARD_ICON_ACTION_CLASS = "size-6 rounded-lg border-slate-200 bg-white text-slate-500 hover:bg-slate-50 sm:size-7";
```

### PR B — Estimate metric pill extraction

Scope:

- estimate work/material/execution metric pills;
- local component only;
- no global `Badge` changes.

Candidate component:

```tsx
<EstimateMetricPill tone="neutral" label="Кол-во">
  <EstimateInlineNumberCell />
</EstimateMetricPill>
```

### PR C — Operational dense card wrapper check

Scope:

- compare estimate execution card wrapper and global purchase card wrapper;
- if exactly equivalent, extract shared adapter under `shared/ui` or `shared/ui/cards`;
- keep field composition feature-owned.

Do not do this before PR A/B.

## Explicit non-goals

- Do not redesign cards.
- Do not change spacing/density in the same PR as extraction.
- Do not replace project cards with dense operational cards.
- Do not merge `Card` and `KPICard` semantics.
- Do not change `Progress` colors or `getProgressGradient`.
- Do not touch server actions, DB/schema, or stale-data refresh logic.

## Recommended next PR

Start with estimate-local extraction of exact repeated constants/components:

1. action icon button class in estimate work/material cards;
2. card shadow/border wrapper classes where exact;
3. only then metric pill extraction.

Keep it narrow and mechanically verifiable.
