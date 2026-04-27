# Deep UI Audit Status — 2026-04-27

## Purpose

This document records the current implementation status after the deep UI/code audit follow-up series. It is intended to prevent repeat analysis drift and to make the next safe refactor batches explicit.

## Baseline

Current baseline after the follow-up cleanup chain:

- PR #90 — `chore(ui): enforce canonical shared ui imports`
- PR #91 — `refactor(data-table): extract header rendering helpers`
- PR #92 — `refactor(ui): normalize input group textarea variant`
- PR #112 — `chore(audit): sync audit tooling source of truth`
- PR #113 — `refactor(table): extract reusable placeholder and numeric cells`
- PR #114 — `style(settings-team): replace raw colors with semantic tokens`
- PR #115 — `chore(audit): tighten generated audit artifact handling`
- PR #116 — `fix(typecheck): stabilize workspace aliases and purchase page types`
- PR #117 — `chore(audit): classify depcheck and unimported false positives`

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

### 5. Audit/tooling drift cleanup

Status: closed.

Implemented by PR #112 and PR #115.

Current canonical audit commands:

```bash
pnpm audit:buttons
pnpm audit:inputs
pnpm audit:ui
```

Canonical scripts:

```txt
scripts/migrate-buttons.ts --report
scripts/migrate-inputs.ts --report
```

Generated report artifacts are ignored and documented:

```txt
reports/button-audit.json
reports/button-canonical-spec.md
reports/input-audit.json
reports/input-canonical-spec.md
```

### 6. Materials/works table-cell helper deduplication

Status: closed.

Implemented by PR #113.

Shared helpers were added under `shared/ui/cells/table-cell-helpers.tsx`:

- `PlaceholderTextCell`
- `PlaceholderNumberCell`
- `FormattedCurrencyCell`
- `CenteredUnitCell`
- `formatCurrencyRu`

Covered areas:

- `features/materials/components/columns.tsx`
- `features/works/components/columns.tsx`

No server actions, route loading, or table meta callback names were changed.

### 7. Settings/team theme-token cleanup

Status: closed.

Implemented by PR #114.

Covered areas:

- `features/settings/screens/AdminSecuritySettingsScreen.tsx`
- `features/team/components/InviteTeamMemberCard.tsx`
- semantic `success` / `success-foreground` tokens in `app/globals.css`

Raw status colors were replaced with semantic tokens where applicable.

### 8. Type-check stabilization

Status: closed.

Implemented by PR #116.

`tsconfig.json` now maps workspace package aliases used by the repo:

- `@repo/ui`
- `@repo/utils`

`app/(workspace)/app/global-purchases/page.tsx` also has explicit inferred option source types for project/supplier mapping callbacks.

Reported validation after this batch:

```txt
pnpm lint        passed
pnpm type-check  passed
```

### 9. Depcheck/unimported cleanup classification

Status: closed as classification; deletion cleanup remains gated.

Implemented by PR #117.

Classification document:

```txt
docs/audits/2026-04-27-depcheck-unimported-classification.md
```

Decision:

- do not delete dependencies or files from raw `depcheck` / `unimported` output;
- treat broad Radix, Tailwind, workspace package, shadcn, test, app route and server-action findings as false-positive/high-risk until exact file-level proof exists;
- only remove single confirmed low-risk candidates in separate PRs after full-tree search and successful build verification.

### 10. Button/Input override cleanup

Status: mostly closed for the audited implementation path.

Tracking document:

```txt
docs/audits/2026-04-27-button-input-override-audit.md
```

Closed implementation points:

- toolbar/action button recipe codified in `ToolbarButton`;
- catalog category selector behavior centralized with `CatalogCategoryButton`;
- numeric/table input cleanup documented and implemented for estimate room params.

Remaining rule:

- do not promote layout-only classes such as `w-full`, `flex-1`, `col-span-*`, `w-24`, or dark-surface landing classes to global Button/Input variants.

### 11. Card visual consistency audit

Status: audit closed; implementation should remain incremental.

Tracking document:

```txt
docs/audits/2026-04-27-card-visual-consistency-audit.md
```

Already present in estimate cards:

- estimate-local card constants in `features/projects/estimates/components/table/cards/constants.ts`;
- `EstimateMetricPill` under estimate card components;
- estimate-local icon action class reuse.

Still open only as optional future refinement:

- compare estimate execution and global purchase dense-card wrappers for exact compatibility;
- extract a shared operational dense-card wrapper only if classes and semantics match exactly;
- do not merge project cards, KPI cards, estimate cards and procurement cards into one global card variant.

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

For dependency/file cleanup, use the classification gate:

```bash
pnpm audit:unused
pnpm audit:deps
pnpm audit:imports
```

Then remove only one confirmed low-risk candidate per PR after exact search and build verification.

## Remaining safe next batches

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

Recommended next action:

- create an audit-only PR first;
- do not change refresh/data-loading behavior until exact stale-data gaps are proven.

### P3 — Landing page visual cleanup

Status: open, optional.

This is visual polish only and should not be mixed with P1/P2 guardrail work.

### P3 — Single-candidate dependency cleanup

Status: optional, gated.

Potential candidates from classification:

- `concurrently`
- `autoprefixer`

Requirements before removal:

- exact full-tree search;
- package-lock/pnpm-lock update;
- `pnpm lint`, `pnpm type-check`, `pnpm test`, `pnpm build` pass.

## Non-goals for the current cleanup series

- No DB/schema changes.
- No server action rewrites.
- No broad component redesigns.
- No feature UX changes hidden inside cleanup PRs.
- No migration away from shadcn/Radix primitives.
- No broad dependency pruning from raw static-audit output.
