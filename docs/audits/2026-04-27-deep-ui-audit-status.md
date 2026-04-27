# Deep UI Audit Status — 2026-04-27

## Purpose

This document records the current implementation status after the deep UI/code audit follow-up series. It is intended to prevent repeat analysis drift and to make the next safe refactor batches explicit.

## Baseline

Current baseline after merge:

- PR #90 — `chore(ui): enforce canonical shared ui imports`
- PR #91 — `refactor(data-table): extract header rendering helpers`
- PR #92 — `refactor(ui): normalize input group textarea variant`

## Closed items

### 1. Runtime `@repo/ui` drift guard

Status: closed.

Implemented by PR #90.

Runtime roots now have a dedicated audit gate:

- `app/**`
- `components/**`
- `features/**`
- `entities/**`
- `shared/**`

Command:

```bash
pnpm audit:ui-imports
```

`pnpm audit:ui` also runs the UI import audit before the existing button/input audits.

Allowed exception:

- `components/shadcn-studio/**` remains allowlisted as demo/reference-only code.

### 2. Remaining runtime canonical UI imports

Status: closed for the known audit batch.

Implemented by PR #90.

Covered areas included:

- landing page
- materials and works dialogs
- works unit select
- dashboard chart/KPI cards
- project actions
- estimate registry
- counterparty sheets
- material supplier sheets
- guide loading/forbidden states
- catalog fallback skeleton

### 3. `shared/ui/data-table.tsx` header rendering normalization

Status: closed.

Implemented by PR #91.

Extracted helpers:

- `DataTableHeaderContent`
- `DataTableHeaderCell`
- `HeaderCellContent`
- `SortableHeaderTrigger`

Preserved intentionally:

- DataTable public API
- row rendering
- virtualization
- toolbar/search wiring
- empty-state behavior
- `aria-sort`
- sortable header click behavior
- existing header classes, widths and focus styles

### 4. `InputGroupTextarea` class override cleanup

Status: closed.

Implemented by PR #92.

`Textarea` now has supported variants:

- `default`
- `inputGroup`

`InputGroupTextarea` now delegates input-group styling to:

```tsx
<Textarea data-slot="input-group-control" variant="inputGroup" />
```

## Current guardrails

For UI/refactor PRs, use this verification set unless the change is explicitly narrower:

```bash
pnpm lint
pnpm type-check
pnpm test
pnpm audit:ui
```

For import-boundary work, also run:

```bash
pnpm audit:ui-imports
```

## Remaining safe next batches

### P1 — Audit documentation sync

Status: current PR scope.

Keep docs aligned with the merged state so new agents do not repeat already-closed work.

### P2 — Button/Input override cleanup

Status: open.

Goal:

- identify non-tokenized one-off button/input class overrides;
- move recurring visual recipes into variants or small feature-level adapters;
- avoid broad visual redesign.

Do not change:

- business logic;
- server actions;
- DB schema;
- form validation semantics;
- route/data-loading behavior.

### P2 — Card visual consistency audit

Status: open.

Goal:

- compare estimate, execution, procurement, dashboard and project cards;
- document repeatable layout/spacing/badge patterns;
- implement only safe shared UI recipes after audit.

Do not do this as a broad redesign PR.

### P2 — Estimate stale-data parity review

Status: partially closed.

Already improved:

- procurement refresh behavior existed before;
- execution refresh parity was added in PR #89.

Still worth auditing:

- estimate details tabs with route refresh boundaries;
- coefficient update propagation;
- insert/delete row flows across tabs;
- purchases/execution visibility-change parity.

### P3 — Landing page visual cleanup

Status: open, optional.

This is visual polish only and should not be mixed with P1/P2 guardrail work.

## Non-goals for the current cleanup series

- No DB/schema changes.
- No server action rewrites.
- No broad component redesigns.
- No feature UX changes hidden inside cleanup PRs.
- No migration away from shadcn/Radix primitives.
