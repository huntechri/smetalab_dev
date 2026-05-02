# UI Changed-File Visual Ownership Guardrail

Issue: #217

## Purpose

This guardrail prevents new runtime app/feature code from reintroducing local visual ownership recipes after the shared UI contracts introduced by the #209-#216 migration batches.

It intentionally scans **added lines in changed files only**. It does not make the historical repository-wide baseline release-blocking.

Existing debt remains tracked by:

- `reports/ui-visual-audit.md/json`
- `reports/ui-visual-ownership.md/json`
- `reports/ui-coverage-audit.md/json`

## Enforcement behavior

The CI workflow `UI Changed Visual Ownership Guardrail` runs on PRs against `main`.

It executes:

```bash
pnpm exec tsx scripts/audit-ui-changed-visual-ownership.ts --base="origin/${GITHUB_BASE_REF:-main}" --head=HEAD
```

The script:

1. Resolves the PR base ref.
2. Reads changed files from `git diff --name-only --diff-filter=ACMR`.
3. Filters to scannable UI/runtime roots: `app`, `components`, `entities`, `features`, `shared`, `packages`, `styles`, `widgets`.
4. Reads added lines from a zero-context diff.
5. Blocks only added lines in business-runtime files that introduce high-signal visual ownership recipes.
6. Writes `reports/ui-changed-visual-ownership.md/json`.

## Blocking buckets

| Bucket | What is blocked in changed runtime files | Expected owner |
| --- | --- | --- |
| `badge-status` | local badge/status/chip/pill colors, borders, radius, padding | `shared/ui/status-badge.tsx`, `shared/ui/badge.tsx` |
| `card-surface` | local card/panel/surface recipes such as `rounded-* border bg-card p-* shadow-*` | `shared/ui/surface.tsx`, `shared/ui/card-shell.tsx`, `shared/ui/page-shell.tsx`, `shared/ui/section.tsx` |
| `toolbar-filter` | local toolbar/filter/search-row flex/grid/gap/padding/height recipes | `shared/ui/toolbar.tsx`, `shared/ui/filter-bar.tsx`, `shared/ui/search-control.tsx` |
| `table-cell-density` | local dense table/cell padding, typography, numeric alignment, height recipes | `shared/ui/table-density.tsx`, `shared/ui/data-table.tsx`, `shared/ui/cells/*` |
| `overlay-layout` | local dialog/sheet/popover width, padding, gap, scroll layout recipes | semantic props/contracts in `shared/ui/dialog.tsx`, `shared/ui/sheet.tsx`, `shared/ui/popover.tsx` |
| `form-layout` | local form/field spacing, label/helper typography, grid/row recipes | `shared/ui/form-layout.tsx`, shared form/control primitives |
| `state-surface` | local empty/loading/error/no-results spacing, borders, muted text, icon sizing | shared state contracts when present; otherwise avoid repeated runtime recipes |
| `action-surface` | local action menu/icon/destructive visual recipes | `shared/ui/action-menu.tsx` and shared action/icon/confirm contracts |

## Exact allowlist model

The guardrail uses exact file paths for accepted shared contracts and marketing/auth exceptions.

It does **not** broadly allowlist entire folders such as `shared/ui/**` or `features/auth/**`.

### Accepted shared contracts

The current exact shared contract owners are encoded in `scripts/audit-ui-changed-visual-ownership.ts` under `ACCEPTED_SHARED_CONTRACT_OWNERS`.

Important examples:

- `shared/ui/status-badge.tsx`
- `shared/ui/badge.tsx`
- `shared/ui/surface.tsx`
- `shared/ui/card-shell.tsx`
- `shared/ui/page-shell.tsx`
- `shared/ui/section.tsx`
- `shared/ui/toolbar.tsx`
- `shared/ui/filter-bar.tsx`
- `shared/ui/search-control.tsx`
- `shared/ui/table-density.tsx`
- `shared/ui/data-table.tsx`
- `shared/ui/cells/directory-table-cells.tsx`
- `shared/ui/cells/table-cell-helpers.tsx`
- `shared/ui/dialog.tsx`
- `shared/ui/sheet.tsx`
- `shared/ui/popover.tsx`
- `shared/ui/form-layout.tsx`
- `shared/ui/action-menu.tsx`

### Accepted marketing/auth exceptions

The current exact marketing/auth exceptions are encoded in `ACCEPTED_MARKETING_AUTH_EXCEPTIONS`.

Important examples:

- `app/page.tsx`
- `app/(login)/verify-email/page.tsx`
- `features/auth/components/AuthFormShell.tsx`
- `features/auth/components/LoginForm.tsx`
- `features/auth/components/ForgotPasswordForm.tsx`
- `features/auth/components/ResetPasswordForm.tsx`

## Pass / fail examples

### Pass: semantic status wrapper

```tsx
<StatusBadge tone="success">Активен</StatusBadge>
```

The runtime file selects semantic tone/content; shared UI owns colors, padding, radius, and typography.

### Fail: local status pill recipe in a feature file

```tsx
<span className="inline-flex rounded-full border border-green-200 bg-green-50 px-2 py-0.5 text-xs text-green-700">
  Активен
</span>
```

This reintroduces local badge/status visual ownership. Use `StatusBadge` or a domain wrapper that maps business state to `tone`.

### Pass: semantic card shell

```tsx
<CardShell density="compact" variant="default">
  <CardShellBody>...</CardShellBody>
</CardShell>
```

The feature file selects density/variant; shared UI owns surface styling.

### Fail: local card shell recipe in a feature file

```tsx
<div className="rounded-2xl border bg-card p-4 shadow-sm">...</div>
```

This reintroduces local card/surface ownership. Use `Surface`, `CardShell`, `PageShell`, or `Section`.

### Pass: toolbar composition

```tsx
<Toolbar density="compact">
  <ToolbarGroup>
    <SearchControl value={query} onChange={setQuery} />
  </ToolbarGroup>
</Toolbar>
```

### Fail: local toolbar spacing recipe

```tsx
<div className="flex flex-wrap items-center justify-between gap-3 p-2">...</div>
```

Use `Toolbar`, `ToolbarGroup`, `FilterBar`, or `SearchControl`.

## Rollback plan

If the guardrail blocks a legitimate case:

1. Prefer moving the repeated recipe into an existing shared contract or adding a narrow semantic prop to that contract.
2. If the file is an intentional shared owner, add its exact path to `ACCEPTED_SHARED_CONTRACT_OWNERS` with PR justification.
3. If the file is an intentional marketing/auth exception, add its exact path to `ACCEPTED_MARKETING_AUTH_EXCEPTIONS` with PR justification.
4. If the guardrail pattern is too broad, narrow the specific bucket predicate in `scripts/audit-ui-changed-visual-ownership.ts`.
5. Emergency rollback: remove or disable `.github/workflows/ui-changed-visual-ownership.yml`. Do not delete the baseline audit reports.

## Non-goals

- No repository-wide strict gate for historical baseline debt.
- No broad `shared/ui/**` allowlist.
- No broad marketing/auth folder allowlist.
- No visual redesign.
- No changes to business logic, data loading, auth, RBAC, estimates, purchases, admin, or catalog behavior.
