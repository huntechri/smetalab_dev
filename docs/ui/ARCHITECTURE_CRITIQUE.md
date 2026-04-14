# UI Architecture Critique (Next.js App Router)

## Scope and assumptions validation

### Confirmed
- App Router route groups are present: `(admin)`, `(login)`, `(workspace)`. Evidence: pages/layouts under `app/(admin)/*`, `app/(login)/*`, `app/(workspace)/*`.
- Design-system primitives exist in `components/ui/*` including `data-table`, `sidebar`, `button`, `dialog`, `tooltip`, `sheet`, etc.
- Guide entities and table modules exist for materials/works/counterparties under `app/(workspace)/app/guide/*`.
- Tailwind + utility composition via `cn()` is in active use (`components/ui/data-table.tsx`, `components/ui/sidebar.tsx`, `components/notifications/notifications-list.tsx`).

### Notable mismatch to assumptions
- There is no route-level `error.tsx` in route groups and no nested `not-found.tsx` files; only global `app/global-error.tsx` and root `app/not-found.tsx` were found.
- No explicit UI governance contract file (e.g. `UI_GOVERNANCE.md`) was found.
- ESLint config does not currently enforce import boundaries for `sonner` or Radix usage.

---

## Step 1 evidence inventory

### 1) Route-level states (`loading.tsx` / `error.tsx` / `not-found.tsx` / `global-error.tsx`)

Found:
- `app/not-found.tsx` (English full-screen marketing-style 404).
- `app/global-error.tsx` (Sentry capture + `NextError` generic renderer).
- `app/(workspace)/app/guide/materials/loading.tsx` and `app/(workspace)/app/guide/works/loading.tsx` (near-duplicate skeleton pages).
- `app/(admin)/dashboard/activity/loading.tsx` (different visual pattern and density).

Not found:
- No `error.tsx` in route groups for workspace/admin/login.
- No scoped `not-found.tsx` for workspace/admin domains.

### 2) Empty states and data pages

- `components/ui/data-table.tsx` renders inline empty text (`"Нет данных для отображения"`) when row model is empty.
- `app/(workspace)/app/guide/counterparties/page.tsx` returns ad hoc "Нет доступа к организации" view.
- `app/(workspace)/app/guide/counterparties/page.tsx` uses a raw `<Suspense fallback={<div>Loading...</div>}>` instead of shared loading primitive.
- `components/notifications/notifications-list.tsx` has its own empty-state visual contract.

### 3) Data table primitives and orchestration hooks

Core primitive:
- `components/ui/data-table.tsx` handles filtering, sortable headers, virtualization, empty/loading UI, AI mode UX, and action slot.

Shared hooks:
- `hooks/use-data-table-state.ts`: table state, filtering/sorting linkage, deferred search state.
- `hooks/use-data-table-editor.ts`: edit/delete dialog orchestration + toast.

Feature hooks (materials/works):
- `useMaterialsTable` and `useWorksTable` both build placeholder rows and insert/cancel/update lifecycles.
- `useMaterialsSearch` and `useWorksSearch` are highly similar (AI mode toggle, search term state, incremental load).
- `useMaterialsActions` and `useWorksActions` overlap on import/export/delete and toast handling with implementation divergence.

Guide modules:
- Materials: `app/(workspace)/app/guide/materials/*`
- Works: `app/(workspace)/app/guide/works/*`
- Counterparties: `app/(workspace)/app/guide/counterparties/*`

### 4) `"use client"` spread and dependency pull-in

Observed client islands include:
- Core primitives: `components/ui/data-table.tsx`, `components/ui/sidebar.tsx`, multiple shadcn wrappers.
- Feature columns and clients: materials/works/counterparties columns and client components.
- App shell components: `components/app-sidebar.tsx`, `components/admin-sidebar.tsx`, `components/app-header.tsx`.

Heavy deps imported in client components:
- `@tanstack/react-table`, `react-virtuoso` in `components/ui/data-table.tsx`.
- `xlsx` in `useMaterialsActions` and `useWorksActions`.
- `swr` in notifications and admin/workspace pages.
- `react-hook-form` + `zod` in counterparty sheet client form.
- `sonner` used both through wrapper (`components/ui/use-toast.tsx`) and directly (`CounterpartiesClient`, `CreateCounterpartySheet`, admin impersonation buttons).

---

## Step 2 ranked critical findings

## P0 — Inconsistent route/data state contract

- **Risk**: Users see inconsistent loading/empty/error experiences by page; hard to evolve and test route-state UX.
- **Evidence**:
  - Only some routes implement `loading.tsx`; no route-level `error.tsx`.
  - Materials/works loading screens are near copies with minor textual differences.
  - Counterparties uses plain text Suspense fallback (`Loading...`) and custom no-tenant block.
  - DataTable has its own internal empty state text, separate from page-level empty/no-access states.
- **Root cause**: No shared state primitives (`LoadingState`, `EmptyState`, `ErrorState`, `ForbiddenState`) and no route-state architecture contract.
- **Fix strategy**: Introduce a UI state kit in `components/ui/states/*`, then migrate guide pages to a single contract (route-level loading + page-level empty/forbidden + table-level zero-row behavior).

## P0 — Accessibility contract gaps in table interactions

- **Risk**: Keyboard and screen-reader behavior may be inconsistent/unreliable, especially for sortable headers implemented as clickable containers.
- **Evidence**:
  - Sort headers in `components/ui/data-table.tsx` are `<div>` with `onClick`, `role="button"`, and custom key handling.
  - Action-rich cells rely on icon buttons and dropdowns with mixed labeling quality.
  - Counterparty actions include English sr-only label (`Open menu`) unlike localized UI.
- **Root cause**: No enforced “interactive cells contract” (semantic buttons/menus, localization/accessibility conventions, keyboard acceptance tests).
- **Fix strategy**: Convert sortable header controls to semantic `<button>` wrappers, standardize aria labels per locale, and add automated keyboard/a11y regression checks for at least one guide table.

## P1 — Duplication in table orchestration hooks (materials vs works)

- **Risk**: Drift in behavior (insert/search/pagination/import) and duplicated fixes across hooks.
- **Evidence**:
  - `useMaterialsSearch` and `useWorksSearch` share almost identical control flow and state machine.
  - `useMaterialsTable` and insertion logic in `useWorksTable` overlap substantially.
  - Actions hooks overlap in export/import/delete transition patterns.
- **Root cause**: Feature-specific hooks evolved independently without a reusable orchestration layer.
- **Fix strategy**: Add shared orchestration hook(s) (e.g., `useGuideTableSearch`, `useGuidePlaceholderRows`, `useGuideImportExport`) with feature adapters for row shape and API calls.

## P1 — Sidebar primitive coupling to app navigation and permissions logic

- **Risk**: Primitive layer usage becomes harder to reuse/test because app concerns (permissions/path matching/nav model) sit close to UI primitives.
- **Evidence**:
  - `components/app-sidebar.tsx` is client-only and couples nav rendering to permissions and path logic.
  - `components/admin-sidebar.tsx` repeats nav composition patterns in separate module.
  - `components/ui/sidebar.tsx` correctly acts as primitive, but composition patterns are duplicated across app/admin.
- **Root cause**: No shared composition contract for sidebar sections/nav items independent from runtime permission checks.
- **Fix strategy**: Keep `components/ui/sidebar.tsx` primitive-only; add app-level composition helpers (e.g., `components/navigation/sidebar-nav.tsx`) consumed by both app/admin sidebars.

## P1/P2 — Notification contract split (toast wrapper vs direct sonner + inbox)

- **Risk**: Inconsistent UX and policy: some events go to toasts only, some to inbox, and APIs differ (`useToast` wrapper vs raw `toast`).
- **Evidence**:
  - Wrapper exists: `components/ui/use-toast.tsx` (maps to sonner).
  - Direct `sonner` imports in feature components (`CounterpartiesClient`, `CreateCounterpartySheet`, admin impersonation).
  - Inbox/bell system exists separately (`notification-bell`, `notifications-list`, API routes).
- **Root cause**: No unified `notify()` abstraction with channel policy (toast vs inbox vs both).
- **Fix strategy**: Introduce `lib/notifications/notify.ts` with typed channels and event intents; gradually replace direct calls.

## P1 — Client bundle pressure from broad client surface area

- **Risk**: Increased JS payload and hydration cost in high-traffic pages (guide tables, sidebars).
- **Evidence**:
  - Heavy libs inside top-level clients: table virtualization/tanstack in shared DataTable; xlsx in action hooks; SWR in shell-level components.
  - Columns files are client modules with rich interactivity and icon-heavy imports.
- **Root cause**: Business/table orchestration and large dependencies often reside in always-mounted client trees.
- **Fix strategy**: Push non-interactive chrome to server components where possible, lazy-load heavy toolbars/actions (xlsx import/export), and isolate feature-only client subtrees.

---

## Governance alignment check

- No separate UI governance doc was found.
- Current ESLint rules enforce TypeScript quality but do not restrict direct `sonner` imports or primitive-layer boundaries.
- Proposal therefore adds lightweight architecture contracts in docs first, then staged code migration with lint/type/test gates.
