# UI Changed-File Visual Ownership Guardrail

- Status: failed
- Base ref: origin/main
- Head ref: HEAD
- Diff range: origin/main...HEAD
- Changed files: 139
- Scanned changed files: 117
- Scanned added lines: 2688
- Violations: 1


## Behavior

This guardrail scans added lines in changed files only. It does not make the historical repository baseline release-blocking. Repository-wide debt remains visible in `reports/ui-visual-audit.*`, `reports/ui-visual-ownership.*`, and `reports/ui-coverage-audit.*`.

## Blocking buckets

- badge-status: shared/ui/status-badge.tsx or shared/ui/badge.tsx
- card-surface: shared/ui/surface.tsx, shared/ui/card-shell.tsx, shared/ui/page-shell.tsx, or shared/ui/section.tsx
- toolbar-filter: shared/ui/toolbar.tsx, shared/ui/filter-bar.tsx, or shared/ui/search-control.tsx
- table-cell-density: shared/ui/table-density.tsx, shared/ui/data-table.tsx, or shared/ui/cells/*
- overlay-layout: shared/ui/dialog.tsx, shared/ui/sheet.tsx, or shared/ui/popover.tsx semantic layout props
- form-layout: shared/ui/form-layout.tsx and shared form/control primitives
- state-surface: shared empty/loading/error/no-results contracts when present; otherwise keep state recipes out of runtime call sites
- action-surface: shared/ui/action-menu.tsx and shared action/icon/confirm contracts

## Violations

| Bucket | Location | Evidence | Expected shared contract |
| --- | --- | --- | --- |
| card-surface | `features/projects/estimates/components/params/RoomsParamsTable.tsx:87` | `<CardShell variant="card" radius="md" shadow="none" overflow="visible" className="gap-0">` | shared/ui/surface.tsx, shared/ui/card-shell.tsx, shared/ui/page-shell.tsx, or shared/ui/section.tsx |

## Exact accepted shared contract owners

- `shared/ui/action-menu.tsx`
- `shared/ui/admin-surface.tsx`
- `shared/ui/badge.tsx`
- `shared/ui/button.tsx`
- `shared/ui/card-shell.tsx`
- `shared/ui/card.tsx`
- `shared/ui/catalog-token.tsx`
- `shared/ui/cells/directory-table-cells.tsx`
- `shared/ui/cells/table-cell-helpers.tsx`
- `shared/ui/data-table.tsx`
- `shared/ui/data-table/data-table-row.tsx`
- `shared/ui/data-table/data-table-toolbar.tsx`
- `shared/ui/dense-list.tsx`
- `shared/ui/dialog.tsx`
- `shared/ui/estimate-tab.tsx`
- `shared/ui/filter-bar.tsx`
- `shared/ui/form-layout.tsx`
- `shared/ui/form.tsx`
- `shared/ui/input.tsx`
- `shared/ui/kpi-card.tsx`
- `shared/ui/label.tsx`
- `shared/ui/page-shell.tsx`
- `shared/ui/popover.tsx`
- `shared/ui/primitive-density.ts`
- `shared/ui/search-control.tsx`
- `shared/ui/section.tsx`
- `shared/ui/select.tsx`
- `shared/ui/sheet.tsx`
- `shared/ui/shells/catalog-directory-visual-contracts.ts`
- `shared/ui/states/EmptyState.tsx`
- `shared/ui/states/ErrorState.tsx`
- `shared/ui/states/ForbiddenState.tsx`
- `shared/ui/states/LoadingState.tsx`
- `shared/ui/states/NoResultsState.tsx`
- `shared/ui/states/StateShell.tsx`
- `shared/ui/status-badge.tsx`
- `shared/ui/surface.tsx`
- `shared/ui/table-density.tsx`
- `shared/ui/table-empty-state.tsx`
- `shared/ui/textarea.tsx`
- `shared/ui/toolbar.tsx`

## Exact accepted marketing/auth exceptions

- `app/(login)/forgot-password/page.tsx`
- `app/(login)/reset-password/page.tsx`
- `app/(login)/sign-in/page.tsx`
- `app/(login)/sign-up/page.tsx`
- `app/(login)/verify-email/page.tsx`
- `app/page.tsx`
- `features/auth/components/AuthFormShell.tsx`
- `features/auth/components/ForgotPasswordForm.tsx`
- `features/auth/components/LoginForm.tsx`
- `features/auth/components/ResetPasswordForm.tsx`
