# UI Changed-File Visual Ownership Guardrail

- Status: failed
- Base ref: origin/main
- Head ref: HEAD
- Diff range: origin/main...HEAD
- Changed files: 61
- Scanned changed files: 52
- Scanned added lines: 1077
- Violations: 10


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
| form-layout | `features/projects/list/components/projects-sort-select.tsx:56` | `<div className="flex items-center gap-2 truncate">` | shared/ui/form-layout.tsx and shared form/control primitives |
| overlay-layout | `features/projects/list/components/projects-sort-select.tsx:68` | `<PopoverContent className="w-[min(20rem,calc(100vw-2rem))] p-0" align="start">` | shared/ui/dialog.tsx, shared/ui/sheet.tsx, or shared/ui/popover.tsx semantic layout props |
| form-layout | `features/projects/list/components/projects-sort-select.tsx:68` | `<PopoverContent className="w-[min(20rem,calc(100vw-2rem))] p-0" align="start">` | shared/ui/form-layout.tsx and shared form/control primitives |
| toolbar-filter | `features/projects/list/components/projects-toolbar.tsx:25` | `<div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">` | shared/ui/toolbar.tsx, shared/ui/filter-bar.tsx, or shared/ui/search-control.tsx |
| toolbar-filter | `features/projects/list/components/projects-toolbar.tsx:26` | `<div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">` | shared/ui/toolbar.tsx, shared/ui/filter-bar.tsx, or shared/ui/search-control.tsx |
| form-layout | `features/settings/components/user-settings-page.tsx:464` | `<p className="text-xs text-muted-foreground">{label}</p>` | shared/ui/form-layout.tsx and shared form/control primitives |
| card-surface | `features/settings/components/user-settings-page.tsx:480` | `<div className="flex items-center justify-between rounded-md border bg-card p-3">` | shared/ui/surface.tsx, shared/ui/card-shell.tsx, shared/ui/page-shell.tsx, or shared/ui/section.tsx |
| form-layout | `features/settings/components/user-settings-page.tsx:481` | `<Label className="text-sm font-normal">{label}</Label>` | shared/ui/form-layout.tsx and shared form/control primitives |
| action-surface | `features/settings/screens/AdminSecuritySettingsScreen.tsx:49` | `<Button type="submit" variant="destructive" size="default" disabled={isDeletePending}>{isDeletePending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Deleting...</> : <><Trash2 className="mr-2 h-4 w-4" />Delete Account</>}</Button>` | shared/ui/action-menu.tsx and shared action/icon/confirm contracts |
| overlay-layout | `features/works/components/UnitSelect.tsx:74` | `<PopoverContent className="w-[min(20rem,calc(100vw-2rem))] p-0" align="start">` | shared/ui/dialog.tsx, shared/ui/sheet.tsx, or shared/ui/popover.tsx semantic layout props |

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
