# UI Refactor Plan (Staged, Low-Risk)

This plan is intentionally split into small, reviewable PRs. Each PR must keep lint/typecheck/tests green.

## Global verification for every PR
- `pnpm lint`
- `pnpm tsc --noEmit`
- `pnpm test`

---

## PR1 (P0): `feat(ui): introduce shared route/page state kit and migrate guide tables`

### Scope
Create a shared UI state kit and migrate the two highest-traffic guide pages (`materials`, `works`) plus counterparties fallback usage to one pattern.

### Rationale
Current loading/empty/error/forbidden presentation is fragmented across route files, table internals, and page-specific ad hoc blocks.

### Files to create
- `components/ui/states/LoadingState.tsx`
- `components/ui/states/EmptyState.tsx`
- `components/ui/states/ErrorState.tsx`
- `components/ui/states/ForbiddenState.tsx`
- `components/ui/states/index.ts`
- `docs/ui/STATE_CONTRACT.md` (short conventions doc)

### Files to change
- `app/(workspace)/app/guide/materials/loading.tsx`
- `app/(workspace)/app/guide/works/loading.tsx`
- `app/(workspace)/app/guide/counterparties/page.tsx`
- `components/ui/data-table.tsx` (optional: allow custom empty renderer prop)

### Migration strategy
1. Introduce state components with consistent title/description/icon/action slots.
2. Replace route-level loading files for materials/works with shared `LoadingState` composition.
3. Replace counterparties raw `<div>Loading...</div>` and no-tenant block using `LoadingState` + `ForbiddenState`.
4. Keep existing behavior/texts; do not alter navigation paths.

### Risk mitigation
- Do not touch data fetching or actions.
- Keep old `DataTable` empty string fallback until all consumers are migrated.

### Acceptance criteria
- At least materials and works use the same loading pattern.
- Counterparties no-tenant state uses shared forbidden component.
- No route groups/navigation changes.

---

## PR2 (P0/P1): `fix(a11y): enforce interactive table cell contract + add regression checks`

### Scope
Standardize interactive table elements for keyboard and screen readers; add one automated regression path.

### Rationale
Sortable headers and action cells currently mix custom div-button semantics and uneven labeling.

### Files to change
- `components/ui/data-table.tsx`
- `app/(workspace)/app/guide/materials/columns.tsx`
- `app/(workspace)/app/guide/works/columns.tsx`
- `app/(workspace)/app/guide/counterparties/components/columns.tsx`
- `__tests__/ui/*` (new or extended test)

### Migration strategy
1. Replace sortable header clickable `<div>` with semantic `<button type="button">` while preserving sort indicators.
2. Ensure action menu triggers have explicit localized `aria-label` and consistent `sr-only` text.
3. Normalize focus-visible classes for icon-only controls.
4. Add automated check:
   - preferred: UI test asserting keyboard toggle sort and action menu accessibility labels,
   - fallback: minimal Playwright script validating keyboard activation on one guide table.

### Risk mitigation
- Keep TanStack integration unchanged.
- Do not modify business logic in hooks/actions.

### Acceptance criteria
- No remaining sortable header “div onClick” pattern in shared table.
- One automated a11y/keyboard regression check merged.

---

## PR3 (P1): `refactor(table): deduplicate guide table orchestration hooks`

### Scope
Extract shared orchestration layer and migrate materials + works to it, while preserving feature-level columns/validation.

### Rationale
Current hook duplication increases maintenance risk and behavior drift.

### Files to create
- `hooks/use-guide-table-search.ts`
- `hooks/use-guide-placeholder-rows.ts`
- `hooks/use-guide-table-actions.ts` (or equivalent split)

### Files to change
- `app/(workspace)/app/guide/materials/hooks/useMaterialsSearch.ts`
- `app/(workspace)/app/guide/works/hooks/useWorksSearch.ts`
- `app/(workspace)/app/guide/materials/hooks/useMaterialsTable.ts`
- `app/(workspace)/app/guide/works/hooks/useWorksTable.ts`
- `app/(workspace)/app/guide/materials/materials-client.tsx`
- `app/(workspace)/app/guide/works/works-client.tsx`

### Migration strategy
1. Implement generic shared hook interfaces with adapter callbacks (fetch/search/ai search/placeholder defaults).
2. Re-export feature wrappers (`useMaterialsSearch`, etc.) initially to minimize call-site churn.
3. Switch client pages to wrappers; keep feature-specific `columns.tsx` and row schemas untouched.

### Risk mitigation
- Move logic first, behavior second; no API signature break in first pass.
- Validate inserts/search/load-more parity with existing tests + manual smoke.

### Acceptance criteria
- Materials + works share common orchestration implementation for search and placeholder insertion lifecycles.
- Feature modules still own table columns and domain-specific row fields.

---

## PR4 (P1/P2): `refactor(shell): sidebar composition split + unified notify contract`

### Scope
Decouple sidebar composition from primitive concerns and introduce a single notification API.

### Rationale
App/admin sidebars duplicate nav composition patterns, and notifications are split between wrapper and direct sonner usage.

### Files to create
- `components/navigation/sidebar-nav.tsx` (app composition helper)
- `lib/notifications/notify.ts`
- `lib/notifications/policy.ts`

### Files to change
- `components/app-sidebar.tsx`
- `components/admin-sidebar.tsx`
- `components/ui/use-toast.tsx` (internally delegate)
- Direct `sonner` callers:
  - `app/(workspace)/app/guide/counterparties/components/CounterpartiesClient.tsx`
  - `app/(workspace)/app/guide/counterparties/components/CreateCounterpartySheet.tsx`
  - `components/admin/impersonate-button.tsx`
  - `components/admin/stop-impersonation-button.tsx`

### Migration strategy
1. Add `notify({ intent, channel, title, description })` with channels: `toast | inbox | both`.
2. Keep existing `useToast().toast()` API but route internally to `notify` for backward compatibility.
3. Replace direct sonner imports incrementally.
4. Introduce shared nav section renderer used by app/admin sidebar shells.

### Risk mitigation
- Maintain existing UI strings and behaviors initially.
- Do not change notification backend routes in this PR.

### Acceptance criteria
- No direct `sonner` import in feature components migrated within scope.
- Sidebar primitive remains in `components/ui/sidebar.tsx`; app-specific navigation lives outside primitive layer.

---

## Rollout order and dependency notes
1. **PR1 first** to establish UI state contract and reduce page-level inconsistency.
2. **PR2 second** to lock in accessibility interaction contract before deeper hook refactors.
3. **PR3 third** to remove orchestration duplication with lowest UX impact.
4. **PR4 last** to clean shell and notification architecture after core table behavior is stabilized.
