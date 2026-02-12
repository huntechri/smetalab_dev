# UI_ARCHITECTURE_REPORT

## 0. Summary
- App Router-first UI architecture with route groups for admin, authentication, and workspace application flows.
- Shared design system is based on shadcn/ui wrappers in `components/ui`, then composed by feature modules and route pages.
- Most interactivity is in `"use client"` components; server pages mainly fetch/prepare data and render shells.
- Tailwind utility classes + `cn()` merging dominate styling, with limited global CSS overrides.
- Feature-rich table flows (materials/works/counterparties) are organized into columns, dialogs, toolbar, and hook orchestration.

### Key findings
- 123 UI-related files were identified and documented in this report.
- `components/ui/*` contains the reusable primitive layer with Radix patterns and consistent forwardRef usage.
- Workspace guide modules duplicate similar table/action hook patterns between materials and works.
- Route-level loading/error/not-found handling exists but is uneven across feature areas.
- `components/ui/sidebar.tsx` is a complex foundational primitive with high coupling to app navigation UX.
- Notification stack is split across bell/list/item + toast helper APIs; consolidation opportunities exist.
- Several pages are thin wrappers that can share common empty/error boundary components.
- Client components often import many dependencies; bundle impact should be monitored with dynamic splitting where possible.

### Risks and priorities
- **P0 risk:** inconsistent loading/empty/error presentation across data-table pages can create UX and support issues.
- **P0 risk:** custom interactive cell content in tables may miss keyboard semantics despite Radix usage elsewhere.
- **P1 risk:** duplicated business-UI hooks increase drift and bug-fix cost.
- **P2 risk:** some generic wrappers have weakly explicit APIs (implicit props contracts), reducing maintainability.

## 0.1 Update status (2026-02)
- The repository has been partially migrated from `app/(workspace)/app/guide/**/{components,hooks}` to `features/**` modules.
- Current source of truth for guide UIs is:
  - `features/materials/**`
  - `features/works/**`
  - `features/counterparties/**`
  - `features/projects/**` (including new premium Dashboard module)
- Route pages under `app/(workspace)/app/guide/**/page.tsx` and `app/(workspace)/app/projects/page.tsx` now act as thin server wrappers that fetch initial data and render feature screens.
- Shared table orchestration logic is consolidated in `hooks/use-guide-table-search.ts` and consumed by feature adapters.
- `components/ui/states/**` is the canonical layer for shared loading/empty/error/forbidden UI states.
- `features/projects/dashboard/**` implements a premium, responsive dashboard with KPI cards, performance charts (AreaChart), and an interactive pill-style DataTable with drag-and-drop.

> ⚠️ Note: the long per-file inventory below still contains historical file paths from the pre-migration layout and must be treated as archival context, not as the current module map.

## 1. Inventory
- **app/(admin)**
  - `app/(admin)/dashboard/activity/loading.tsx`
  - `app/(admin)/dashboard/activity/page.tsx`
  - `app/(admin)/dashboard/general/page.tsx`
  - `app/(admin)/dashboard/layout.tsx`
  - `app/(admin)/dashboard/page.tsx`
  - `app/(admin)/dashboard/permissions/page.tsx`
  - `app/(admin)/dashboard/security/page.tsx`
  - `app/(admin)/dashboard/tenants/[tenantId]/page.tsx`
  - `app/(admin)/dashboard/tenants/page.tsx`
  - `app/(admin)/layout.tsx`
  - `app/(admin)/page.tsx`
  - `app/(admin)/pricing/page.tsx`
  - `app/(admin)/pricing/submit-button.tsx`
  - `app/(admin)/terminal.tsx`
- **app/(login)**
  - `app/(login)/login.tsx`
  - `app/(login)/sign-in/page.tsx`
  - `app/(login)/sign-up/page.tsx`
- **app/(workspace)**
  - `app/(workspace)/app/global-purchases/page.tsx`
  - `app/(workspace)/app/guide/counterparties/components/CounterpartiesClient.tsx`
  - `app/(workspace)/app/guide/counterparties/components/CreateCounterpartySheet.tsx`
  - `app/(workspace)/app/guide/counterparties/components/columns.tsx`
  - `app/(workspace)/app/guide/counterparties/page.tsx`
  - `app/(workspace)/app/guide/materials/columns.tsx`
  - `app/(workspace)/app/guide/materials/components/MaterialsDeleteDialog.tsx`
  - `app/(workspace)/app/guide/materials/components/MaterialsEditDialog.tsx`
  - `app/(workspace)/app/guide/materials/components/MaterialsHeader.tsx`
  - `app/(workspace)/app/guide/materials/components/MaterialsTableWrapper.tsx`
  - `app/(workspace)/app/guide/materials/components/MaterialsToolbar.tsx`
  - `app/(workspace)/app/guide/materials/hooks/useAiIndexing.ts`
  - `app/(workspace)/app/guide/materials/hooks/useMaterialsActions.ts`
  - `app/(workspace)/app/guide/materials/hooks/useMaterialsRowActions.ts`
  - `app/(workspace)/app/guide/materials/hooks/useMaterialsSearch.ts`
  - `app/(workspace)/app/guide/materials/hooks/useMaterialsTable.ts`
  - `app/(workspace)/app/guide/materials/loading.tsx`
  - `app/(workspace)/app/guide/materials/materials-client.tsx`
  - `app/(workspace)/app/guide/materials/page.tsx`
  - `app/(workspace)/app/guide/page.tsx`
  - `app/(workspace)/app/guide/works/columns.tsx`
  - `app/(workspace)/app/guide/works/components/WorksDeleteDialog.tsx`
  - `app/(workspace)/app/guide/works/components/WorksEditDialog.tsx`
  - `app/(workspace)/app/guide/works/components/WorksHeader.tsx`
  - `app/(workspace)/app/guide/works/components/WorksTableWrapper.tsx`
  - `app/(workspace)/app/guide/works/components/WorksToolbar.tsx`
  - `app/(workspace)/app/guide/works/hooks/useWorksActions.ts`
  - `app/(workspace)/app/guide/works/hooks/useWorksSearch.ts`
  - `app/(workspace)/app/guide/works/hooks/useWorksTable.ts`
  - `app/(workspace)/app/guide/works/loading.tsx`
  - `app/(workspace)/app/guide/works/page.tsx`
  - `app/(workspace)/app/guide/works/works-client.tsx`
  - `app/(workspace)/app/layout.tsx`
  - `app/(workspace)/app/page.tsx`
  - `app/(workspace)/app/patterns/page.tsx`
  - `app/(workspace)/app/projects/[projectId]/estimates/[estimateId]/accomplishment/page.tsx`
  - `app/(workspace)/app/projects/[projectId]/estimates/[estimateId]/docs/page.tsx`
  - `app/(workspace)/app/projects/[projectId]/estimates/[estimateId]/layout.tsx`
  - `app/(workspace)/app/projects/[projectId]/estimates/[estimateId]/page.tsx`
  - `app/(workspace)/app/projects/[projectId]/estimates/[estimateId]/parameters/page.tsx`
  - `app/(workspace)/app/projects/[projectId]/estimates/[estimateId]/purchases/page.tsx`
  - `app/(workspace)/app/projects/[projectId]/layout.tsx`
  - `app/(workspace)/app/projects/[projectId]/page.tsx`
  - `app/(workspace)/app/projects/page.tsx`
  - `app/(workspace)/app/team/client-page.tsx`
  - `app/(workspace)/app/team/page.tsx`
- **app/api-docs**
  - `app/api-docs/page.tsx`
- **app/global-error.tsx**
  - `app/global-error.tsx`
- **app/globals.css**
  - `app/globals.css`
- **app/invitations**
  - `app/invitations/page.tsx`
- **app/layout.tsx**
  - `app/layout.tsx`
- **app/not-found.tsx**
  - `app/not-found.tsx`
- **app/page.tsx**
  - `app/page.tsx`
- **components**
  - `components/active-team-indicator.tsx`
  - `components/admin-sidebar.tsx`
  - `components/app-header.tsx`
  - `components/app-sidebar.tsx`
  - `components/notification-bell.tsx`
  - `components/permissions-matrix.tsx`
  - `components/permissions-provider.tsx`
  - `components/swr-wrapper.tsx`
  - `components/unit-select.tsx`
  - `components/user-menu.tsx`
  - `components/web-vitals.tsx`
- **components/admin**
  - `components/admin/impersonate-button.tsx`
  - `components/admin/impersonation-banner.tsx`
  - `components/admin/stop-impersonation-button.tsx`
- **components/notifications**
  - `components/notifications/notification-item.tsx`
  - `components/notifications/notifications-list.tsx`
  - `components/notifications/types.ts`
- **components/ui**
  - `components/ui/alert-dialog.tsx`
  - `components/ui/avatar.tsx`
  - `components/ui/badge.tsx`
  - `components/ui/breadcrumb.tsx`
  - `components/ui/button.tsx`
  - `components/ui/card.tsx`
  - `components/ui/command.tsx`
  - `components/ui/data-table.tsx`
  - `components/ui/dialog.tsx`
  - `components/ui/dropdown-menu.tsx`
  - `components/ui/form.tsx`
  - `components/ui/input.tsx`
  - `components/ui/label.tsx`
  - `components/ui/loading-button.tsx`
  - `components/ui/loading-indicator.tsx`
  - `components/ui/popover.tsx`
  - `components/ui/radio-group.tsx`
  - `components/ui/scroll-area.tsx`
  - `components/ui/select.tsx`
  - `components/ui/separator.tsx`
  - `components/ui/sheet.tsx`
  - `components/ui/sidebar.tsx`
  - `components/ui/skeleton.tsx`
  - `components/ui/sonner.tsx`
  - `components/ui/switch.tsx`
  - `components/ui/tabs.tsx`
  - `components/ui/tooltip.tsx`
  - `components/ui/use-toast.tsx`
- **hooks**
  - `hooks/use-data-table-editor.ts`
  - `hooks/use-data-table-state.ts`
  - `hooks/use-mobile.ts`
  - `hooks/use-page-title.ts`
  - `hooks/use-permissions.ts`
  - `hooks/use-sidebar-state.ts`
- **lib**
  - `lib/utils.ts`
- **root**
  - `postcss.config.mjs`

## 2. Component-by-component documentation (MANDATORY)

### app/(admin)/dashboard/activity/loading.tsx
**Type:** route state UI  
**Runtime:** Server Component  
**Exports:** default ActivityPageSkeleton, default function  
**Purpose:** This file contributes directly to rendered UI (route surface, reusable component, hook-driven UI behavior, or style config). It defines either a visual building block or logic consumed by visual components in the app shell.
**Public API:**
| name | type | required | default | description |
|---|---|---|---|---|
| props / parameters | inferred from source signature | varies | none | See exported component or hook declaration in this file for exact contract. |
- Events/callbacks (if any): implemented as prop callbacks and local handlers bound to UI interactions in this module.
- External dependencies (Radix/shadcn/forms/state libs): @/components/ui/card.
**Internal behavior:**
- State and hooks used: No React/custom hook calls found.
- Data flow: inputs/params/context -> derived values -> conditional JSX/render output -> side effects (navigation, mutations, telemetry, toasts) when triggered.
- UI states: normal + conditional states (loading/empty/error/disabled) as encoded in branch logic within this file.
**Composition:**
- Composes imported primitives and local helpers according to file role (route shell, form/dialog, table part, or utility hook).
- Children/slot behavior follows React composition patterns where applicable.
**Styling:**
- Tailwind utility classes are primary styling mechanism; class composition may use `cn()` and/or variant helpers depending on file.
**Accessibility (A11y):**
- Leverages semantic HTML and Radix accessibility behavior where primitives are used; custom interactive regions require keyboard/ARIA verification.
- Focus management is primarily inherited from dialogs/menus/sheets/popovers and route-level navigation flow.
**Edge cases & pitfalls:**
- Potential pitfalls include hydration boundaries (`use client`), undefined async data, and stale props in memoized callbacks.
- Validate empty/error branches and permission-gated rendering paths for this file during QA.
**Recommended improvements:**
- Add explicit JSDoc/type comments for exported APIs where signatures are complex or implicit.
- Normalize loading/empty/error visual patterns with shared helper components to reduce divergence.
- Add focused a11y tests for keyboard traversal and announced labels in interactive controls used here.
**Testability notes:**
- Unit/interaction tests should assert render branches, callback execution, and disabled/loading/error states for this module.
- For route files, prefer integration tests validating server/client boundary behavior and composed child rendering.

### app/(admin)/dashboard/activity/page.tsx
**Type:** route page  
**Runtime:** Server Component  
**Exports:** default async  
**Purpose:** This file contributes directly to rendered UI (route surface, reusable component, hook-driven UI behavior, or style config). It defines either a visual building block or logic consumed by visual components in the app shell.
**Public API:**
| name | type | required | default | description |
|---|---|---|---|---|
| props / parameters | inferred from source signature | varies | none | See exported component or hook declaration in this file for exact contract. |
- Events/callbacks (if any): implemented as prop callbacks and local handlers bound to UI interactions in this module.
- External dependencies (Radix/shadcn/forms/state libs): @/components/ui/card, @/lib/data/db/schema, @/lib/data/db/queries, next/navigation.
**Internal behavior:**
- State and hooks used: No React/custom hook calls found.
- Data flow: inputs/params/context -> derived values -> conditional JSX/render output -> side effects (navigation, mutations, telemetry, toasts) when triggered.
- UI states: normal + conditional states (loading/empty/error/disabled) as encoded in branch logic within this file.
**Composition:**
- Composes imported primitives and local helpers according to file role (route shell, form/dialog, table part, or utility hook).
- Children/slot behavior follows React composition patterns where applicable.
**Styling:**
- Tailwind utility classes are primary styling mechanism; class composition may use `cn()` and/or variant helpers depending on file.
**Accessibility (A11y):**
- Leverages semantic HTML and Radix accessibility behavior where primitives are used; custom interactive regions require keyboard/ARIA verification.
- Focus management is primarily inherited from dialogs/menus/sheets/popovers and route-level navigation flow.
**Edge cases & pitfalls:**
- Potential pitfalls include hydration boundaries (`use client`), undefined async data, and stale props in memoized callbacks.
- Validate empty/error branches and permission-gated rendering paths for this file during QA.
**Recommended improvements:**
- Add explicit JSDoc/type comments for exported APIs where signatures are complex or implicit.
- Normalize loading/empty/error visual patterns with shared helper components to reduce divergence.
- Add focused a11y tests for keyboard traversal and announced labels in interactive controls used here.
**Testability notes:**
- Unit/interaction tests should assert render branches, callback execution, and disabled/loading/error states for this module.
- For route files, prefer integration tests validating server/client boundary behavior and composed child rendering.

### app/(admin)/dashboard/general/page.tsx
**Type:** route page  
**Runtime:** Client Component  
**Exports:** default GeneralPage, default function  
**Purpose:** This file contributes directly to rendered UI (route surface, reusable component, hook-driven UI behavior, or style config). It defines either a visual building block or logic consumed by visual components in the app shell.
**Public API:**
| name | type | required | default | description |
|---|---|---|---|---|
| props / parameters | inferred from source signature | varies | none | See exported component or hook declaration in this file for exact contract. |
- Events/callbacks (if any): implemented as prop callbacks and local handlers bound to UI interactions in this module.
- External dependencies (Radix/shadcn/forms/state libs): react, @/components/ui/button, @/components/ui/input, @/components/ui/card, @/components/ui/label, lucide-react, @/app/(login)/actions, @/lib/data/db/schema, swr.
**Internal behavior:**
- State and hooks used: useActionState, useSWR.
- Data flow: inputs/params/context -> derived values -> conditional JSX/render output -> side effects (navigation, mutations, telemetry, toasts) when triggered.
- UI states: normal + conditional states (loading/empty/error/disabled) as encoded in branch logic within this file.
**Composition:**
- Composes imported primitives and local helpers according to file role (route shell, form/dialog, table part, or utility hook).
- Children/slot behavior follows React composition patterns where applicable.
**Styling:**
- Tailwind utility classes are primary styling mechanism; class composition may use `cn()` and/or variant helpers depending on file.
**Accessibility (A11y):**
- Leverages semantic HTML and Radix accessibility behavior where primitives are used; custom interactive regions require keyboard/ARIA verification.
- Focus management is primarily inherited from dialogs/menus/sheets/popovers and route-level navigation flow.
**Edge cases & pitfalls:**
- Potential pitfalls include hydration boundaries (`use client`), undefined async data, and stale props in memoized callbacks.
- Validate empty/error branches and permission-gated rendering paths for this file during QA.
**Recommended improvements:**
- Add explicit JSDoc/type comments for exported APIs where signatures are complex or implicit.
- Normalize loading/empty/error visual patterns with shared helper components to reduce divergence.
- Add focused a11y tests for keyboard traversal and announced labels in interactive controls used here.
**Testability notes:**
- Unit/interaction tests should assert render branches, callback execution, and disabled/loading/error states for this module.
- For route files, prefer integration tests validating server/client boundary behavior and composed child rendering.

### app/(admin)/dashboard/layout.tsx
**Type:** layout  
**Runtime:** Server Component  
**Exports:** default async  
**Purpose:** This file contributes directly to rendered UI (route surface, reusable component, hook-driven UI behavior, or style config). It defines either a visual building block or logic consumed by visual components in the app shell.
**Public API:**
| name | type | required | default | description |
|---|---|---|---|---|
| props / parameters | inferred from source signature | varies | none | See exported component or hook declaration in this file for exact contract. |
- Events/callbacks (if any): implemented as prop callbacks and local handlers bound to UI interactions in this module.
- External dependencies (Radix/shadcn/forms/state libs): @/components/ui/sidebar, @/features/admin/components/admin-sidebar, @/lib/data/db/queries, @/components/providers/permissions-provider, @/lib/infrastructure/auth/rbac.
**Internal behavior:**
- State and hooks used: No React/custom hook calls found.
- Data flow: inputs/params/context -> derived values -> conditional JSX/render output -> side effects (navigation, mutations, telemetry, toasts) when triggered.
- UI states: normal + conditional states (loading/empty/error/disabled) as encoded in branch logic within this file.
**Composition:**
- Composes imported primitives and local helpers according to file role (route shell, form/dialog, table part, or utility hook).
- Children/slot behavior follows React composition patterns where applicable.
**Styling:**
- Tailwind utility classes are primary styling mechanism; class composition may use `cn()` and/or variant helpers depending on file.
**Accessibility (A11y):**
- Leverages semantic HTML and Radix accessibility behavior where primitives are used; custom interactive regions require keyboard/ARIA verification.
- Focus management is primarily inherited from dialogs/menus/sheets/popovers and route-level navigation flow.
**Edge cases & pitfalls:**
- Potential pitfalls include hydration boundaries (`use client`), undefined async data, and stale props in memoized callbacks.
- Validate empty/error branches and permission-gated rendering paths for this file during QA.
**Recommended improvements:**
- Add explicit JSDoc/type comments for exported APIs where signatures are complex or implicit.
- Normalize loading/empty/error visual patterns with shared helper components to reduce divergence.
- Add focused a11y tests for keyboard traversal and announced labels in interactive controls used here.
**Testability notes:**
- Unit/interaction tests should assert render branches, callback execution, and disabled/loading/error states for this module.
- For route files, prefer integration tests validating server/client boundary behavior and composed child rendering.

### app/(admin)/dashboard/page.tsx
**Type:** route page  
**Runtime:** Server Component  
**Exports:** default Page, default function  
**Purpose:** This file contributes directly to rendered UI (route surface, reusable component, hook-driven UI behavior, or style config). It defines either a visual building block or logic consumed by visual components in the app shell.
**Public API:**
| name | type | required | default | description |
|---|---|---|---|---|
| props / parameters | inferred from source signature | varies | none | See exported component or hook declaration in this file for exact contract. |
- Events/callbacks (if any): implemented as prop callbacks and local handlers bound to UI interactions in this module.
- External dependencies (Radix/shadcn/forms/state libs): No external package imports.
**Internal behavior:**
- State and hooks used: No React/custom hook calls found.
- Data flow: inputs/params/context -> derived values -> conditional JSX/render output -> side effects (navigation, mutations, telemetry, toasts) when triggered.
- UI states: normal + conditional states (loading/empty/error/disabled) as encoded in branch logic within this file.
**Composition:**
- Composes imported primitives and local helpers according to file role (route shell, form/dialog, table part, or utility hook).
- Children/slot behavior follows React composition patterns where applicable.
**Styling:**
- Tailwind utility classes are primary styling mechanism; class composition may use `cn()` and/or variant helpers depending on file.
**Accessibility (A11y):**
- Leverages semantic HTML and Radix accessibility behavior where primitives are used; custom interactive regions require keyboard/ARIA verification.
- Focus management is primarily inherited from dialogs/menus/sheets/popovers and route-level navigation flow.
**Edge cases & pitfalls:**
- Potential pitfalls include hydration boundaries (`use client`), undefined async data, and stale props in memoized callbacks.
- Validate empty/error branches and permission-gated rendering paths for this file during QA.
**Recommended improvements:**
- Add explicit JSDoc/type comments for exported APIs where signatures are complex or implicit.
- Normalize loading/empty/error visual patterns with shared helper components to reduce divergence.
- Add focused a11y tests for keyboard traversal and announced labels in interactive controls used here.
**Testability notes:**
- Unit/interaction tests should assert render branches, callback execution, and disabled/loading/error states for this module.
- For route files, prefer integration tests validating server/client boundary behavior and composed child rendering.

### app/(admin)/dashboard/permissions/page.tsx
**Type:** route page  
**Runtime:** Server Component  
**Exports:** default PermissionsPage, default function  
**Purpose:** This file contributes directly to rendered UI (route surface, reusable component, hook-driven UI behavior, or style config). It defines either a visual building block or logic consumed by visual components in the app shell.
**Public API:**
| name | type | required | default | description |
|---|---|---|---|---|
| props / parameters | inferred from source signature | varies | none | See exported component or hook declaration in this file for exact contract. |
- Events/callbacks (if any): implemented as prop callbacks and local handlers bound to UI interactions in this module.
- External dependencies (Radix/shadcn/forms/state libs): @/features/permissions/components/permissions-matrix.
**Internal behavior:**
- State and hooks used: No React/custom hook calls found.
- Data flow: inputs/params/context -> derived values -> conditional JSX/render output -> side effects (navigation, mutations, telemetry, toasts) when triggered.
- UI states: normal + conditional states (loading/empty/error/disabled) as encoded in branch logic within this file.
**Composition:**
- Composes imported primitives and local helpers according to file role (route shell, form/dialog, table part, or utility hook).
- Children/slot behavior follows React composition patterns where applicable.
**Styling:**
- Tailwind utility classes are primary styling mechanism; class composition may use `cn()` and/or variant helpers depending on file.
**Accessibility (A11y):**
- Leverages semantic HTML and Radix accessibility behavior where primitives are used; custom interactive regions require keyboard/ARIA verification.
- Focus management is primarily inherited from dialogs/menus/sheets/popovers and route-level navigation flow.
**Edge cases & pitfalls:**
- Potential pitfalls include hydration boundaries (`use client`), undefined async data, and stale props in memoized callbacks.
- Validate empty/error branches and permission-gated rendering paths for this file during QA.
**Recommended improvements:**
- Add explicit JSDoc/type comments for exported APIs where signatures are complex or implicit.
- Normalize loading/empty/error visual patterns with shared helper components to reduce divergence.
- Add focused a11y tests for keyboard traversal and announced labels in interactive controls used here.
**Testability notes:**
- Unit/interaction tests should assert render branches, callback execution, and disabled/loading/error states for this module.
- For route files, prefer integration tests validating server/client boundary behavior and composed child rendering.

### app/(admin)/dashboard/security/page.tsx
**Type:** route page  
**Runtime:** Client Component  
**Exports:** default SecurityPage, default function  
**Purpose:** This file contributes directly to rendered UI (route surface, reusable component, hook-driven UI behavior, or style config). It defines either a visual building block or logic consumed by visual components in the app shell.
**Public API:**
| name | type | required | default | description |
|---|---|---|---|---|
| props / parameters | inferred from source signature | varies | none | See exported component or hook declaration in this file for exact contract. |
- Events/callbacks (if any): implemented as prop callbacks and local handlers bound to UI interactions in this module.
- External dependencies (Radix/shadcn/forms/state libs): @/components/ui/button, @/components/ui/input, @/components/ui/card, @/components/ui/label, lucide-react, react, @/app/(login)/actions.
**Internal behavior:**
- State and hooks used: useActionState.
- Data flow: inputs/params/context -> derived values -> conditional JSX/render output -> side effects (navigation, mutations, telemetry, toasts) when triggered.
- UI states: normal + conditional states (loading/empty/error/disabled) as encoded in branch logic within this file.
**Composition:**
- Composes imported primitives and local helpers according to file role (route shell, form/dialog, table part, or utility hook).
- Children/slot behavior follows React composition patterns where applicable.
**Styling:**
- Tailwind utility classes are primary styling mechanism; class composition may use `cn()` and/or variant helpers depending on file.
**Accessibility (A11y):**
- Leverages semantic HTML and Radix accessibility behavior where primitives are used; custom interactive regions require keyboard/ARIA verification.
- Focus management is primarily inherited from dialogs/menus/sheets/popovers and route-level navigation flow.
**Edge cases & pitfalls:**
- Potential pitfalls include hydration boundaries (`use client`), undefined async data, and stale props in memoized callbacks.
- Validate empty/error branches and permission-gated rendering paths for this file during QA.
**Recommended improvements:**
- Add explicit JSDoc/type comments for exported APIs where signatures are complex or implicit.
- Normalize loading/empty/error visual patterns with shared helper components to reduce divergence.
- Add focused a11y tests for keyboard traversal and announced labels in interactive controls used here.
**Testability notes:**
- Unit/interaction tests should assert render branches, callback execution, and disabled/loading/error states for this module.
- For route files, prefer integration tests validating server/client boundary behavior and composed child rendering.

### app/(admin)/dashboard/tenants/[tenantId]/page.tsx
**Type:** route page  
**Runtime:** Server Component  
**Exports:** default async  
**Purpose:** This file contributes directly to rendered UI (route surface, reusable component, hook-driven UI behavior, or style config). It defines either a visual building block or logic consumed by visual components in the app shell.
**Public API:**
| name | type | required | default | description |
|---|---|---|---|---|
| props / parameters | inferred from source signature | varies | none | See exported component or hook declaration in this file for exact contract. |
- Events/callbacks (if any): implemented as prop callbacks and local handlers bound to UI interactions in this module.
- External dependencies (Radix/shadcn/forms/state libs): @/lib/data/db/admin-queries, next/navigation, @/components/ui/card, @/components/ui/badge, @/components/ui/button, @/components/ui/tabs, next/link, @/features/admin/components/impersonate-button, date-fns, date-fns/locale.
**Internal behavior:**
- State and hooks used: No React/custom hook calls found.
- Data flow: inputs/params/context -> derived values -> conditional JSX/render output -> side effects (navigation, mutations, telemetry, toasts) when triggered.
- UI states: normal + conditional states (loading/empty/error/disabled) as encoded in branch logic within this file.
**Composition:**
- Composes imported primitives and local helpers according to file role (route shell, form/dialog, table part, or utility hook).
- Children/slot behavior follows React composition patterns where applicable.
**Styling:**
- Tailwind utility classes are primary styling mechanism; class composition may use `cn()` and/or variant helpers depending on file.
**Accessibility (A11y):**
- Leverages semantic HTML and Radix accessibility behavior where primitives are used; custom interactive regions require keyboard/ARIA verification.
- Focus management is primarily inherited from dialogs/menus/sheets/popovers and route-level navigation flow.
**Edge cases & pitfalls:**
- Potential pitfalls include hydration boundaries (`use client`), undefined async data, and stale props in memoized callbacks.
- Validate empty/error branches and permission-gated rendering paths for this file during QA.
**Recommended improvements:**
- Add explicit JSDoc/type comments for exported APIs where signatures are complex or implicit.
- Normalize loading/empty/error visual patterns with shared helper components to reduce divergence.
- Add focused a11y tests for keyboard traversal and announced labels in interactive controls used here.
**Testability notes:**
- Unit/interaction tests should assert render branches, callback execution, and disabled/loading/error states for this module.
- For route files, prefer integration tests validating server/client boundary behavior and composed child rendering.

### app/(admin)/dashboard/tenants/page.tsx
**Type:** route page  
**Runtime:** Server Component  
**Exports:** default async  
**Purpose:** This file contributes directly to rendered UI (route surface, reusable component, hook-driven UI behavior, or style config). It defines either a visual building block or logic consumed by visual components in the app shell.
**Public API:**
| name | type | required | default | description |
|---|---|---|---|---|
| props / parameters | inferred from source signature | varies | none | See exported component or hook declaration in this file for exact contract. |
- Events/callbacks (if any): implemented as prop callbacks and local handlers bound to UI interactions in this module.
- External dependencies (Radix/shadcn/forms/state libs): @/lib/data/db/admin-queries, @/components/ui/card, @/components/ui/badge, @/components/ui/button, lucide-react, next/link.
**Internal behavior:**
- State and hooks used: No React/custom hook calls found.
- Data flow: inputs/params/context -> derived values -> conditional JSX/render output -> side effects (navigation, mutations, telemetry, toasts) when triggered.
- UI states: normal + conditional states (loading/empty/error/disabled) as encoded in branch logic within this file.
**Composition:**
- Composes imported primitives and local helpers according to file role (route shell, form/dialog, table part, or utility hook).
- Children/slot behavior follows React composition patterns where applicable.
**Styling:**
- Tailwind utility classes are primary styling mechanism; class composition may use `cn()` and/or variant helpers depending on file.
**Accessibility (A11y):**
- Leverages semantic HTML and Radix accessibility behavior where primitives are used; custom interactive regions require keyboard/ARIA verification.
- Focus management is primarily inherited from dialogs/menus/sheets/popovers and route-level navigation flow.
**Edge cases & pitfalls:**
- Potential pitfalls include hydration boundaries (`use client`), undefined async data, and stale props in memoized callbacks.
- Validate empty/error branches and permission-gated rendering paths for this file during QA.
**Recommended improvements:**
- Add explicit JSDoc/type comments for exported APIs where signatures are complex or implicit.
- Normalize loading/empty/error visual patterns with shared helper components to reduce divergence.
- Add focused a11y tests for keyboard traversal and announced labels in interactive controls used here.
**Testability notes:**
- Unit/interaction tests should assert render branches, callback execution, and disabled/loading/error states for this module.
- For route files, prefer integration tests validating server/client boundary behavior and composed child rendering.

### app/(admin)/layout.tsx
**Type:** layout  
**Runtime:** Client Component  
**Exports:** default AdminLayout, default function  
**Purpose:** This file contributes directly to rendered UI (route surface, reusable component, hook-driven UI behavior, or style config). It defines either a visual building block or logic consumed by visual components in the app shell.
**Public API:**
| name | type | required | default | description |
|---|---|---|---|---|
| props / parameters | inferred from source signature | varies | none | See exported component or hook declaration in this file for exact contract. |
- Events/callbacks (if any): implemented as prop callbacks and local handlers bound to UI interactions in this module.
- External dependencies (Radix/shadcn/forms/state libs): next/link, react, @/components/ui/button, lucide-react, @/components/ui/avatar, @/app/(login)/actions, next/navigation, @/lib/data/db/schema, swr.
**Internal behavior:**
- State and hooks used: useRouter, useSWR.
- Data flow: inputs/params/context -> derived values -> conditional JSX/render output -> side effects (navigation, mutations, telemetry, toasts) when triggered.
- UI states: normal + conditional states (loading/empty/error/disabled) as encoded in branch logic within this file.
**Composition:**
- Composes imported primitives and local helpers according to file role (route shell, form/dialog, table part, or utility hook).
- Children/slot behavior follows React composition patterns where applicable.
**Styling:**
- Tailwind utility classes are primary styling mechanism; class composition may use `cn()` and/or variant helpers depending on file.
**Accessibility (A11y):**
- Leverages semantic HTML and Radix accessibility behavior where primitives are used; custom interactive regions require keyboard/ARIA verification.
- Focus management is primarily inherited from dialogs/menus/sheets/popovers and route-level navigation flow.
**Edge cases & pitfalls:**
- Potential pitfalls include hydration boundaries (`use client`), undefined async data, and stale props in memoized callbacks.
- Validate empty/error branches and permission-gated rendering paths for this file during QA.
**Recommended improvements:**
- Add explicit JSDoc/type comments for exported APIs where signatures are complex or implicit.
- Normalize loading/empty/error visual patterns with shared helper components to reduce divergence.
- Add focused a11y tests for keyboard traversal and announced labels in interactive controls used here.
**Testability notes:**
- Unit/interaction tests should assert render branches, callback execution, and disabled/loading/error states for this module.
- For route files, prefer integration tests validating server/client boundary behavior and composed child rendering.

### app/(admin)/page.tsx
**Type:** route page  
**Runtime:** Server Component  
**Exports:** default HomePage, default function  
**Purpose:** This file contributes directly to rendered UI (route surface, reusable component, hook-driven UI behavior, or style config). It defines either a visual building block or logic consumed by visual components in the app shell.
**Public API:**
| name | type | required | default | description |
|---|---|---|---|---|
| props / parameters | inferred from source signature | varies | none | See exported component or hook declaration in this file for exact contract. |
- Events/callbacks (if any): implemented as prop callbacks and local handlers bound to UI interactions in this module.
- External dependencies (Radix/shadcn/forms/state libs): @/components/ui/button, @/components/ui/card, lucide-react, next/link.
**Internal behavior:**
- State and hooks used: No React/custom hook calls found.
- Data flow: inputs/params/context -> derived values -> conditional JSX/render output -> side effects (navigation, mutations, telemetry, toasts) when triggered.
- UI states: normal + conditional states (loading/empty/error/disabled) as encoded in branch logic within this file.
**Composition:**
- Composes imported primitives and local helpers according to file role (route shell, form/dialog, table part, or utility hook).
- Children/slot behavior follows React composition patterns where applicable.
**Styling:**
- Tailwind utility classes are primary styling mechanism; class composition may use `cn()` and/or variant helpers depending on file.
**Accessibility (A11y):**
- Leverages semantic HTML and Radix accessibility behavior where primitives are used; custom interactive regions require keyboard/ARIA verification.
- Focus management is primarily inherited from dialogs/menus/sheets/popovers and route-level navigation flow.
**Edge cases & pitfalls:**
- Potential pitfalls include hydration boundaries (`use client`), undefined async data, and stale props in memoized callbacks.
- Validate empty/error branches and permission-gated rendering paths for this file during QA.
**Recommended improvements:**
- Add explicit JSDoc/type comments for exported APIs where signatures are complex or implicit.
- Normalize loading/empty/error visual patterns with shared helper components to reduce divergence.
- Add focused a11y tests for keyboard traversal and announced labels in interactive controls used here.
**Testability notes:**
- Unit/interaction tests should assert render branches, callback execution, and disabled/loading/error states for this module.
- For route files, prefer integration tests validating server/client boundary behavior and composed child rendering.

### app/(admin)/pricing/page.tsx
**Type:** route page  
**Runtime:** Server Component  
**Exports:** default async, revalidate  
**Purpose:** This file contributes directly to rendered UI (route surface, reusable component, hook-driven UI behavior, or style config). It defines either a visual building block or logic consumed by visual components in the app shell.
**Public API:**
| name | type | required | default | description |
|---|---|---|---|---|
| props / parameters | inferred from source signature | varies | none | See exported component or hook declaration in this file for exact contract. |
- Events/callbacks (if any): implemented as prop callbacks and local handlers bound to UI interactions in this module.
- External dependencies (Radix/shadcn/forms/state libs): @/lib/infrastructure/payments/actions, lucide-react, @/lib/infrastructure/payments/stripe.
**Internal behavior:**
- State and hooks used: No React/custom hook calls found.
- Data flow: inputs/params/context -> derived values -> conditional JSX/render output -> side effects (navigation, mutations, telemetry, toasts) when triggered.
- UI states: normal + conditional states (loading/empty/error/disabled) as encoded in branch logic within this file.
**Composition:**
- Composes imported primitives and local helpers according to file role (route shell, form/dialog, table part, or utility hook).
- Children/slot behavior follows React composition patterns where applicable.
**Styling:**
- Tailwind utility classes are primary styling mechanism; class composition may use `cn()` and/or variant helpers depending on file.
**Accessibility (A11y):**
- Leverages semantic HTML and Radix accessibility behavior where primitives are used; custom interactive regions require keyboard/ARIA verification.
- Focus management is primarily inherited from dialogs/menus/sheets/popovers and route-level navigation flow.
**Edge cases & pitfalls:**
- Potential pitfalls include hydration boundaries (`use client`), undefined async data, and stale props in memoized callbacks.
- Validate empty/error branches and permission-gated rendering paths for this file during QA.
**Recommended improvements:**
- Add explicit JSDoc/type comments for exported APIs where signatures are complex or implicit.
- Normalize loading/empty/error visual patterns with shared helper components to reduce divergence.
- Add focused a11y tests for keyboard traversal and announced labels in interactive controls used here.
**Testability notes:**
- Unit/interaction tests should assert render branches, callback execution, and disabled/loading/error states for this module.
- For route files, prefer integration tests validating server/client boundary behavior and composed child rendering.

### app/(admin)/pricing/submit-button.tsx
**Type:** component  
**Runtime:** Client Component  
**Exports:** SubmitButton  
**Purpose:** This file contributes directly to rendered UI (route surface, reusable component, hook-driven UI behavior, or style config). It defines either a visual building block or logic consumed by visual components in the app shell.
**Public API:**
| name | type | required | default | description |
|---|---|---|---|---|
| props / parameters | inferred from source signature | varies | none | See exported component or hook declaration in this file for exact contract. |
- Events/callbacks (if any): implemented as prop callbacks and local handlers bound to UI interactions in this module.
- External dependencies (Radix/shadcn/forms/state libs): @/components/ui/button, lucide-react, react-dom.
**Internal behavior:**
- State and hooks used: useFormStatus.
- Data flow: inputs/params/context -> derived values -> conditional JSX/render output -> side effects (navigation, mutations, telemetry, toasts) when triggered.
- UI states: normal + conditional states (loading/empty/error/disabled) as encoded in branch logic within this file.
**Composition:**
- Composes imported primitives and local helpers according to file role (route shell, form/dialog, table part, or utility hook).
- Children/slot behavior follows React composition patterns where applicable.
**Styling:**
- Tailwind utility classes are primary styling mechanism; class composition may use `cn()` and/or variant helpers depending on file.
**Accessibility (A11y):**
- Leverages semantic HTML and Radix accessibility behavior where primitives are used; custom interactive regions require keyboard/ARIA verification.
- Focus management is primarily inherited from dialogs/menus/sheets/popovers and route-level navigation flow.
**Edge cases & pitfalls:**
- Potential pitfalls include hydration boundaries (`use client`), undefined async data, and stale props in memoized callbacks.
- Validate empty/error branches and permission-gated rendering paths for this file during QA.
**Recommended improvements:**
- Add explicit JSDoc/type comments for exported APIs where signatures are complex or implicit.
- Normalize loading/empty/error visual patterns with shared helper components to reduce divergence.
- Add focused a11y tests for keyboard traversal and announced labels in interactive controls used here.
**Testability notes:**
- Unit/interaction tests should assert render branches, callback execution, and disabled/loading/error states for this module.
- For route files, prefer integration tests validating server/client boundary behavior and composed child rendering.

### app/(admin)/terminal.tsx
**Type:** component  
**Runtime:** Client Component  
**Exports:** Terminal  
**Purpose:** This file contributes directly to rendered UI (route surface, reusable component, hook-driven UI behavior, or style config). It defines either a visual building block or logic consumed by visual components in the app shell.
**Public API:**
| name | type | required | default | description |
|---|---|---|---|---|
| props / parameters | inferred from source signature | varies | none | See exported component or hook declaration in this file for exact contract. |
- Events/callbacks (if any): implemented as prop callbacks and local handlers bound to UI interactions in this module.
- External dependencies (Radix/shadcn/forms/state libs): react, lucide-react.
**Internal behavior:**
- State and hooks used: useEffect, useState.
- Data flow: inputs/params/context -> derived values -> conditional JSX/render output -> side effects (navigation, mutations, telemetry, toasts) when triggered.
- UI states: normal + conditional states (loading/empty/error/disabled) as encoded in branch logic within this file.
**Composition:**
- Composes imported primitives and local helpers according to file role (route shell, form/dialog, table part, or utility hook).
- Children/slot behavior follows React composition patterns where applicable.
**Styling:**
- Tailwind utility classes are primary styling mechanism; class composition may use `cn()` and/or variant helpers depending on file.
**Accessibility (A11y):**
- Leverages semantic HTML and Radix accessibility behavior where primitives are used; custom interactive regions require keyboard/ARIA verification.
- Focus management is primarily inherited from dialogs/menus/sheets/popovers and route-level navigation flow.
**Edge cases & pitfalls:**
- Potential pitfalls include hydration boundaries (`use client`), undefined async data, and stale props in memoized callbacks.
- Validate empty/error branches and permission-gated rendering paths for this file during QA.
**Recommended improvements:**
- Add explicit JSDoc/type comments for exported APIs where signatures are complex or implicit.
- Normalize loading/empty/error visual patterns with shared helper components to reduce divergence.
- Add focused a11y tests for keyboard traversal and announced labels in interactive controls used here.
**Testability notes:**
- Unit/interaction tests should assert render branches, callback execution, and disabled/loading/error states for this module.
- For route files, prefer integration tests validating server/client boundary behavior and composed child rendering.

### app/(login)/login.tsx
**Type:** component  
**Runtime:** Client Component  
**Exports:** Login  
**Purpose:** This file contributes directly to rendered UI (route surface, reusable component, hook-driven UI behavior, or style config). It defines either a visual building block or logic consumed by visual components in the app shell.
**Public API:**
| name | type | required | default | description |
|---|---|---|---|---|
| props / parameters | inferred from source signature | varies | none | See exported component or hook declaration in this file for exact contract. |
- Events/callbacks (if any): implemented as prop callbacks and local handlers bound to UI interactions in this module.
- External dependencies (Radix/shadcn/forms/state libs): next/link, react, next/navigation, @/components/ui/button, @/components/ui/input, @/components/ui/label, lucide-react, @/lib/infrastructure/auth/middleware.
**Internal behavior:**
- State and hooks used: useActionState, useSearchParams, useState.
- Data flow: inputs/params/context -> derived values -> conditional JSX/render output -> side effects (navigation, mutations, telemetry, toasts) when triggered.
- UI states: normal + conditional states (loading/empty/error/disabled) as encoded in branch logic within this file.
**Composition:**
- Composes imported primitives and local helpers according to file role (route shell, form/dialog, table part, or utility hook).
- Children/slot behavior follows React composition patterns where applicable.
**Styling:**
- Tailwind utility classes are primary styling mechanism; class composition may use `cn()` and/or variant helpers depending on file.
**Accessibility (A11y):**
- Leverages semantic HTML and Radix accessibility behavior where primitives are used; custom interactive regions require keyboard/ARIA verification.
- Focus management is primarily inherited from dialogs/menus/sheets/popovers and route-level navigation flow.
**Edge cases & pitfalls:**
- Potential pitfalls include hydration boundaries (`use client`), undefined async data, and stale props in memoized callbacks.
- Validate empty/error branches and permission-gated rendering paths for this file during QA.
**Recommended improvements:**
- Add explicit JSDoc/type comments for exported APIs where signatures are complex or implicit.
- Normalize loading/empty/error visual patterns with shared helper components to reduce divergence.
- Add focused a11y tests for keyboard traversal and announced labels in interactive controls used here.
**Testability notes:**
- Unit/interaction tests should assert render branches, callback execution, and disabled/loading/error states for this module.
- For route files, prefer integration tests validating server/client boundary behavior and composed child rendering.

### app/(login)/sign-in/page.tsx
**Type:** route page  
**Runtime:** Server Component  
**Exports:** default SignInPage, default function  
**Purpose:** This file contributes directly to rendered UI (route surface, reusable component, hook-driven UI behavior, or style config). It defines either a visual building block or logic consumed by visual components in the app shell.
**Public API:**
| name | type | required | default | description |
|---|---|---|---|---|
| props / parameters | inferred from source signature | varies | none | See exported component or hook declaration in this file for exact contract. |
- Events/callbacks (if any): implemented as prop callbacks and local handlers bound to UI interactions in this module.
- External dependencies (Radix/shadcn/forms/state libs): react.
**Internal behavior:**
- State and hooks used: No React/custom hook calls found.
- Data flow: inputs/params/context -> derived values -> conditional JSX/render output -> side effects (navigation, mutations, telemetry, toasts) when triggered.
- UI states: normal + conditional states (loading/empty/error/disabled) as encoded in branch logic within this file.
**Composition:**
- Composes imported primitives and local helpers according to file role (route shell, form/dialog, table part, or utility hook).
- Children/slot behavior follows React composition patterns where applicable.
**Styling:**
- Tailwind utility classes are primary styling mechanism; class composition may use `cn()` and/or variant helpers depending on file.
**Accessibility (A11y):**
- Leverages semantic HTML and Radix accessibility behavior where primitives are used; custom interactive regions require keyboard/ARIA verification.
- Focus management is primarily inherited from dialogs/menus/sheets/popovers and route-level navigation flow.
**Edge cases & pitfalls:**
- Potential pitfalls include hydration boundaries (`use client`), undefined async data, and stale props in memoized callbacks.
- Validate empty/error branches and permission-gated rendering paths for this file during QA.
**Recommended improvements:**
- Add explicit JSDoc/type comments for exported APIs where signatures are complex or implicit.
- Normalize loading/empty/error visual patterns with shared helper components to reduce divergence.
- Add focused a11y tests for keyboard traversal and announced labels in interactive controls used here.
**Testability notes:**
- Unit/interaction tests should assert render branches, callback execution, and disabled/loading/error states for this module.
- For route files, prefer integration tests validating server/client boundary behavior and composed child rendering.

### app/(login)/sign-up/page.tsx
**Type:** route page  
**Runtime:** Server Component  
**Exports:** default SignUpPage, default function  
**Purpose:** This file contributes directly to rendered UI (route surface, reusable component, hook-driven UI behavior, or style config). It defines either a visual building block or logic consumed by visual components in the app shell.
**Public API:**
| name | type | required | default | description |
|---|---|---|---|---|
| props / parameters | inferred from source signature | varies | none | See exported component or hook declaration in this file for exact contract. |
- Events/callbacks (if any): implemented as prop callbacks and local handlers bound to UI interactions in this module.
- External dependencies (Radix/shadcn/forms/state libs): react.
**Internal behavior:**
- State and hooks used: No React/custom hook calls found.
- Data flow: inputs/params/context -> derived values -> conditional JSX/render output -> side effects (navigation, mutations, telemetry, toasts) when triggered.
- UI states: normal + conditional states (loading/empty/error/disabled) as encoded in branch logic within this file.
**Composition:**
- Composes imported primitives and local helpers according to file role (route shell, form/dialog, table part, or utility hook).
- Children/slot behavior follows React composition patterns where applicable.
**Styling:**
- Tailwind utility classes are primary styling mechanism; class composition may use `cn()` and/or variant helpers depending on file.
**Accessibility (A11y):**
- Leverages semantic HTML and Radix accessibility behavior where primitives are used; custom interactive regions require keyboard/ARIA verification.
- Focus management is primarily inherited from dialogs/menus/sheets/popovers and route-level navigation flow.
**Edge cases & pitfalls:**
- Potential pitfalls include hydration boundaries (`use client`), undefined async data, and stale props in memoized callbacks.
- Validate empty/error branches and permission-gated rendering paths for this file during QA.
**Recommended improvements:**
- Add explicit JSDoc/type comments for exported APIs where signatures are complex or implicit.
- Normalize loading/empty/error visual patterns with shared helper components to reduce divergence.
- Add focused a11y tests for keyboard traversal and announced labels in interactive controls used here.
**Testability notes:**
- Unit/interaction tests should assert render branches, callback execution, and disabled/loading/error states for this module.
- For route files, prefer integration tests validating server/client boundary behavior and composed child rendering.

### app/(workspace)/app/global-purchases/page.tsx
**Type:** route page  
**Runtime:** Server Component  
**Exports:** default Page, default function  
**Purpose:** This file contributes directly to rendered UI (route surface, reusable component, hook-driven UI behavior, or style config). It defines either a visual building block or logic consumed by visual components in the app shell.
**Public API:**
| name | type | required | default | description |
|---|---|---|---|---|
| props / parameters | inferred from source signature | varies | none | See exported component or hook declaration in this file for exact contract. |
- Events/callbacks (if any): implemented as prop callbacks and local handlers bound to UI interactions in this module.
- External dependencies (Radix/shadcn/forms/state libs): No external package imports.
**Internal behavior:**
- State and hooks used: No React/custom hook calls found.
- Data flow: inputs/params/context -> derived values -> conditional JSX/render output -> side effects (navigation, mutations, telemetry, toasts) when triggered.
- UI states: normal + conditional states (loading/empty/error/disabled) as encoded in branch logic within this file.
**Composition:**
- Composes imported primitives and local helpers according to file role (route shell, form/dialog, table part, or utility hook).
- Children/slot behavior follows React composition patterns where applicable.
**Styling:**
- Tailwind utility classes are primary styling mechanism; class composition may use `cn()` and/or variant helpers depending on file.
**Accessibility (A11y):**
- Leverages semantic HTML and Radix accessibility behavior where primitives are used; custom interactive regions require keyboard/ARIA verification.
- Focus management is primarily inherited from dialogs/menus/sheets/popovers and route-level navigation flow.
**Edge cases & pitfalls:**
- Potential pitfalls include hydration boundaries (`use client`), undefined async data, and stale props in memoized callbacks.
- Validate empty/error branches and permission-gated rendering paths for this file during QA.
**Recommended improvements:**
- Add explicit JSDoc/type comments for exported APIs where signatures are complex or implicit.
- Normalize loading/empty/error visual patterns with shared helper components to reduce divergence.
- Add focused a11y tests for keyboard traversal and announced labels in interactive controls used here.
**Testability notes:**
- Unit/interaction tests should assert render branches, callback execution, and disabled/loading/error states for this module.
- For route files, prefer integration tests validating server/client boundary behavior and composed child rendering.

### app/(workspace)/app/guide/counterparties/components/CounterpartiesClient.tsx
**Type:** component  
**Runtime:** Client Component  
**Exports:** CounterpartiesClient  
**Purpose:** This file contributes directly to rendered UI (route surface, reusable component, hook-driven UI behavior, or style config). It defines either a visual building block or logic consumed by visual components in the app shell.
**Public API:**
| name | type | required | default | description |
|---|---|---|---|---|
| props / parameters | inferred from source signature | varies | none | See exported component or hook declaration in this file for exact contract. |
- Events/callbacks (if any): implemented as prop callbacks and local handlers bound to UI interactions in this module.
- External dependencies (Radix/shadcn/forms/state libs): react, @/types/counterparty-row, @/components/ui/data-table, @/components/ui/button, lucide-react, sonner, @/app/actions/counterparties.
**Internal behavior:**
- State and hooks used: useState.
- Data flow: inputs/params/context -> derived values -> conditional JSX/render output -> side effects (navigation, mutations, telemetry, toasts) when triggered.
- UI states: normal + conditional states (loading/empty/error/disabled) as encoded in branch logic within this file.
**Composition:**
- Composes imported primitives and local helpers according to file role (route shell, form/dialog, table part, or utility hook).
- Children/slot behavior follows React composition patterns where applicable.
**Styling:**
- Tailwind utility classes are primary styling mechanism; class composition may use `cn()` and/or variant helpers depending on file.
**Accessibility (A11y):**
- Leverages semantic HTML and Radix accessibility behavior where primitives are used; custom interactive regions require keyboard/ARIA verification.
- Focus management is primarily inherited from dialogs/menus/sheets/popovers and route-level navigation flow.
**Edge cases & pitfalls:**
- Potential pitfalls include hydration boundaries (`use client`), undefined async data, and stale props in memoized callbacks.
- Validate empty/error branches and permission-gated rendering paths for this file during QA.
**Recommended improvements:**
- Add explicit JSDoc/type comments for exported APIs where signatures are complex or implicit.
- Normalize loading/empty/error visual patterns with shared helper components to reduce divergence.
- Add focused a11y tests for keyboard traversal and announced labels in interactive controls used here.
**Testability notes:**
- Unit/interaction tests should assert render branches, callback execution, and disabled/loading/error states for this module.
- For route files, prefer integration tests validating server/client boundary behavior and composed child rendering.

### app/(workspace)/app/guide/counterparties/components/CreateCounterpartySheet.tsx
**Type:** component  
**Runtime:** Client Component  
**Exports:** CreateCounterpartySheet  
**Purpose:** This file contributes directly to rendered UI (route surface, reusable component, hook-driven UI behavior, or style config). It defines either a visual building block or logic consumed by visual components in the app shell.
**Public API:**
| name | type | required | default | description |
|---|---|---|---|---|
| props / parameters | inferred from source signature | varies | none | See exported component or hook declaration in this file for exact contract. |
- Events/callbacks (if any): implemented as prop callbacks and local handlers bound to UI interactions in this module.
- External dependencies (Radix/shadcn/forms/state libs): react, react-hook-form, @hookform/resolvers/zod, zod, @/components/ui/button, @/components/ui/input, @/components/ui/radio-group, @/components/ui/tabs, @/components/ui/separator, @/components/ui/scroll-area....
**Internal behavior:**
- State and hooks used: useEffect, useForm, useRouter, useState, useTransition.
- Data flow: inputs/params/context -> derived values -> conditional JSX/render output -> side effects (navigation, mutations, telemetry, toasts) when triggered.
- UI states: normal + conditional states (loading/empty/error/disabled) as encoded in branch logic within this file.
**Composition:**
- Composes imported primitives and local helpers according to file role (route shell, form/dialog, table part, or utility hook).
- Children/slot behavior follows React composition patterns where applicable.
**Styling:**
- Tailwind utility classes are primary styling mechanism; class composition may use `cn()` and/or variant helpers depending on file.
**Accessibility (A11y):**
- Leverages semantic HTML and Radix accessibility behavior where primitives are used; custom interactive regions require keyboard/ARIA verification.
- Focus management is primarily inherited from dialogs/menus/sheets/popovers and route-level navigation flow.
**Edge cases & pitfalls:**
- Potential pitfalls include hydration boundaries (`use client`), undefined async data, and stale props in memoized callbacks.
- Validate empty/error branches and permission-gated rendering paths for this file during QA.
**Recommended improvements:**
- Add explicit JSDoc/type comments for exported APIs where signatures are complex or implicit.
- Normalize loading/empty/error visual patterns with shared helper components to reduce divergence.
- Add focused a11y tests for keyboard traversal and announced labels in interactive controls used here.
**Testability notes:**
- Unit/interaction tests should assert render branches, callback execution, and disabled/loading/error states for this module.
- For route files, prefer integration tests validating server/client boundary behavior and composed child rendering.

### app/(workspace)/app/guide/counterparties/components/columns.tsx
**Type:** component  
**Runtime:** Client Component  
**Exports:** columns  
**Purpose:** This file contributes directly to rendered UI (route surface, reusable component, hook-driven UI behavior, or style config). It defines either a visual building block or logic consumed by visual components in the app shell.
**Public API:**
| name | type | required | default | description |
|---|---|---|---|---|
| props / parameters | inferred from source signature | varies | none | See exported component or hook declaration in this file for exact contract. |
- Events/callbacks (if any): implemented as prop callbacks and local handlers bound to UI interactions in this module.
- External dependencies (Radix/shadcn/forms/state libs): react, @tanstack/react-table, @/types/counterparty-row, @/components/ui/data-table, @/components/ui/button, lucide-react, @/components/ui/badge.
**Internal behavior:**
- State and hooks used: No React/custom hook calls found.
- Data flow: inputs/params/context -> derived values -> conditional JSX/render output -> side effects (navigation, mutations, telemetry, toasts) when triggered.
- UI states: normal + conditional states (loading/empty/error/disabled) as encoded in branch logic within this file.
**Composition:**
- Composes imported primitives and local helpers according to file role (route shell, form/dialog, table part, or utility hook).
- Children/slot behavior follows React composition patterns where applicable.
**Styling:**
- Tailwind utility classes are primary styling mechanism; class composition may use `cn()` and/or variant helpers depending on file.
**Accessibility (A11y):**
- Leverages semantic HTML and Radix accessibility behavior where primitives are used; custom interactive regions require keyboard/ARIA verification.
- Focus management is primarily inherited from dialogs/menus/sheets/popovers and route-level navigation flow.
**Edge cases & pitfalls:**
- Potential pitfalls include hydration boundaries (`use client`), undefined async data, and stale props in memoized callbacks.
- Validate empty/error branches and permission-gated rendering paths for this file during QA.
**Recommended improvements:**
- Add explicit JSDoc/type comments for exported APIs where signatures are complex or implicit.
- Normalize loading/empty/error visual patterns with shared helper components to reduce divergence.
- Add focused a11y tests for keyboard traversal and announced labels in interactive controls used here.
**Testability notes:**
- Unit/interaction tests should assert render branches, callback execution, and disabled/loading/error states for this module.
- For route files, prefer integration tests validating server/client boundary behavior and composed child rendering.

### app/(workspace)/app/guide/counterparties/page.tsx
**Type:** route page  
**Runtime:** Server Component  
**Exports:** default async, metadata  
**Purpose:** This file contributes directly to rendered UI (route surface, reusable component, hook-driven UI behavior, or style config). It defines either a visual building block or logic consumed by visual components in the app shell.
**Public API:**
| name | type | required | default | description |
|---|---|---|---|---|
| props / parameters | inferred from source signature | varies | none | See exported component or hook declaration in this file for exact contract. |
- Events/callbacks (if any): implemented as prop callbacks and local handlers bound to UI interactions in this module.
- External dependencies (Radix/shadcn/forms/state libs): react, next, @/lib/data/db/queries, next/navigation.
**Internal behavior:**
- State and hooks used: No React/custom hook calls found.
- Data flow: inputs/params/context -> derived values -> conditional JSX/render output -> side effects (navigation, mutations, telemetry, toasts) when triggered.
- UI states: normal + conditional states (loading/empty/error/disabled) as encoded in branch logic within this file.
**Composition:**
- Composes imported primitives and local helpers according to file role (route shell, form/dialog, table part, or utility hook).
- Children/slot behavior follows React composition patterns where applicable.
**Styling:**
- Tailwind utility classes are primary styling mechanism; class composition may use `cn()` and/or variant helpers depending on file.
**Accessibility (A11y):**
- Leverages semantic HTML and Radix accessibility behavior where primitives are used; custom interactive regions require keyboard/ARIA verification.
- Focus management is primarily inherited from dialogs/menus/sheets/popovers and route-level navigation flow.
**Edge cases & pitfalls:**
- Potential pitfalls include hydration boundaries (`use client`), undefined async data, and stale props in memoized callbacks.
- Validate empty/error branches and permission-gated rendering paths for this file during QA.
**Recommended improvements:**
- Add explicit JSDoc/type comments for exported APIs where signatures are complex or implicit.
- Normalize loading/empty/error visual patterns with shared helper components to reduce divergence.
- Add focused a11y tests for keyboard traversal and announced labels in interactive controls used here.
**Testability notes:**
- Unit/interaction tests should assert render branches, callback execution, and disabled/loading/error states for this module.
- For route files, prefer integration tests validating server/client boundary behavior and composed child rendering.

### app/(workspace)/app/guide/materials/columns.tsx
**Type:** component  
**Runtime:** Client Component  
**Exports:** columns  
**Purpose:** This file contributes directly to rendered UI (route surface, reusable component, hook-driven UI behavior, or style config). It defines either a visual building block or logic consumed by visual components in the app shell.
**Public API:**
| name | type | required | default | description |
|---|---|---|---|---|
| props / parameters | inferred from source signature | varies | none | See exported component or hook declaration in this file for exact contract. |
- Events/callbacks (if any): implemented as prop callbacks and local handlers bound to UI interactions in this module.
- External dependencies (Radix/shadcn/forms/state libs): react, @tanstack/react-table, lucide-react, next/image, @/components/ui/button, @/components/ui/input, @/types/material-row, @/components/ui/data-table, class-variance-authority.
**Internal behavior:**
- State and hooks used: No React/custom hook calls found.
- Data flow: inputs/params/context -> derived values -> conditional JSX/render output -> side effects (navigation, mutations, telemetry, toasts) when triggered.
- UI states: normal + conditional states (loading/empty/error/disabled) as encoded in branch logic within this file.
**Composition:**
- Composes imported primitives and local helpers according to file role (route shell, form/dialog, table part, or utility hook).
- Children/slot behavior follows React composition patterns where applicable.
**Styling:**
- Tailwind utility classes are primary styling mechanism; class composition may use `cn()` and/or variant helpers depending on file.
**Accessibility (A11y):**
- Leverages semantic HTML and Radix accessibility behavior where primitives are used; custom interactive regions require keyboard/ARIA verification.
- Focus management is primarily inherited from dialogs/menus/sheets/popovers and route-level navigation flow.
**Edge cases & pitfalls:**
- Potential pitfalls include hydration boundaries (`use client`), undefined async data, and stale props in memoized callbacks.
- Validate empty/error branches and permission-gated rendering paths for this file during QA.
**Recommended improvements:**
- Add explicit JSDoc/type comments for exported APIs where signatures are complex or implicit.
- Normalize loading/empty/error visual patterns with shared helper components to reduce divergence.
- Add focused a11y tests for keyboard traversal and announced labels in interactive controls used here.
**Testability notes:**
- Unit/interaction tests should assert render branches, callback execution, and disabled/loading/error states for this module.
- For route files, prefer integration tests validating server/client boundary behavior and composed child rendering.

### app/(workspace)/app/guide/materials/components/MaterialsDeleteDialog.tsx
**Type:** component  
**Runtime:** Client Component  
**Exports:** MaterialsDeleteDialog  
**Purpose:** This file contributes directly to rendered UI (route surface, reusable component, hook-driven UI behavior, or style config). It defines either a visual building block or logic consumed by visual components in the app shell.
**Public API:**
| name | type | required | default | description |
|---|---|---|---|---|
| props / parameters | inferred from source signature | varies | none | See exported component or hook declaration in this file for exact contract. |
- Events/callbacks (if any): implemented as prop callbacks and local handlers bound to UI interactions in this module.
- External dependencies (Radix/shadcn/forms/state libs): No external package imports.
**Internal behavior:**
- State and hooks used: No React/custom hook calls found.
- Data flow: inputs/params/context -> derived values -> conditional JSX/render output -> side effects (navigation, mutations, telemetry, toasts) when triggered.
- UI states: normal + conditional states (loading/empty/error/disabled) as encoded in branch logic within this file.
**Composition:**
- Composes imported primitives and local helpers according to file role (route shell, form/dialog, table part, or utility hook).
- Children/slot behavior follows React composition patterns where applicable.
**Styling:**
- Tailwind utility classes are primary styling mechanism; class composition may use `cn()` and/or variant helpers depending on file.
**Accessibility (A11y):**
- Leverages semantic HTML and Radix accessibility behavior where primitives are used; custom interactive regions require keyboard/ARIA verification.
- Focus management is primarily inherited from dialogs/menus/sheets/popovers and route-level navigation flow.
**Edge cases & pitfalls:**
- Potential pitfalls include hydration boundaries (`use client`), undefined async data, and stale props in memoized callbacks.
- Validate empty/error branches and permission-gated rendering paths for this file during QA.
**Recommended improvements:**
- Add explicit JSDoc/type comments for exported APIs where signatures are complex or implicit.
- Normalize loading/empty/error visual patterns with shared helper components to reduce divergence.
- Add focused a11y tests for keyboard traversal and announced labels in interactive controls used here.
**Testability notes:**
- Unit/interaction tests should assert render branches, callback execution, and disabled/loading/error states for this module.
- For route files, prefer integration tests validating server/client boundary behavior and composed child rendering.

### app/(workspace)/app/guide/materials/components/MaterialsEditDialog.tsx
**Type:** component  
**Runtime:** Client Component  
**Exports:** MaterialsEditDialog  
**Purpose:** This file contributes directly to rendered UI (route surface, reusable component, hook-driven UI behavior, or style config). It defines either a visual building block or logic consumed by visual components in the app shell.
**Public API:**
| name | type | required | default | description |
|---|---|---|---|---|
| props / parameters | inferred from source signature | varies | none | See exported component or hook declaration in this file for exact contract. |
- Events/callbacks (if any): implemented as prop callbacks and local handlers bound to UI interactions in this module.
- External dependencies (Radix/shadcn/forms/state libs): @/types/material-row, @/components/ui/button, @/components/ui/input, @/components/ui/label.
**Internal behavior:**
- State and hooks used: No React/custom hook calls found.
- Data flow: inputs/params/context -> derived values -> conditional JSX/render output -> side effects (navigation, mutations, telemetry, toasts) when triggered.
- UI states: normal + conditional states (loading/empty/error/disabled) as encoded in branch logic within this file.
**Composition:**
- Composes imported primitives and local helpers according to file role (route shell, form/dialog, table part, or utility hook).
- Children/slot behavior follows React composition patterns where applicable.
**Styling:**
- Tailwind utility classes are primary styling mechanism; class composition may use `cn()` and/or variant helpers depending on file.
**Accessibility (A11y):**
- Leverages semantic HTML and Radix accessibility behavior where primitives are used; custom interactive regions require keyboard/ARIA verification.
- Focus management is primarily inherited from dialogs/menus/sheets/popovers and route-level navigation flow.
**Edge cases & pitfalls:**
- Potential pitfalls include hydration boundaries (`use client`), undefined async data, and stale props in memoized callbacks.
- Validate empty/error branches and permission-gated rendering paths for this file during QA.
**Recommended improvements:**
- Add explicit JSDoc/type comments for exported APIs where signatures are complex or implicit.
- Normalize loading/empty/error visual patterns with shared helper components to reduce divergence.
- Add focused a11y tests for keyboard traversal and announced labels in interactive controls used here.
**Testability notes:**
- Unit/interaction tests should assert render branches, callback execution, and disabled/loading/error states for this module.
- For route files, prefer integration tests validating server/client boundary behavior and composed child rendering.

### app/(workspace)/app/guide/materials/components/MaterialsHeader.tsx
**Type:** component  
**Runtime:** Server Component  
**Exports:** MaterialsHeader  
**Purpose:** This file contributes directly to rendered UI (route surface, reusable component, hook-driven UI behavior, or style config). It defines either a visual building block or logic consumed by visual components in the app shell.
**Public API:**
| name | type | required | default | description |
|---|---|---|---|---|
| props / parameters | inferred from source signature | varies | none | See exported component or hook declaration in this file for exact contract. |
- Events/callbacks (if any): implemented as prop callbacks and local handlers bound to UI interactions in this module.
- External dependencies (Radix/shadcn/forms/state libs): lucide-react, @/components/ui/badge.
**Internal behavior:**
- State and hooks used: No React/custom hook calls found.
- Data flow: inputs/params/context -> derived values -> conditional JSX/render output -> side effects (navigation, mutations, telemetry, toasts) when triggered.
- UI states: normal + conditional states (loading/empty/error/disabled) as encoded in branch logic within this file.
**Composition:**
- Composes imported primitives and local helpers according to file role (route shell, form/dialog, table part, or utility hook).
- Children/slot behavior follows React composition patterns where applicable.
**Styling:**
- Tailwind utility classes are primary styling mechanism; class composition may use `cn()` and/or variant helpers depending on file.
**Accessibility (A11y):**
- Leverages semantic HTML and Radix accessibility behavior where primitives are used; custom interactive regions require keyboard/ARIA verification.
- Focus management is primarily inherited from dialogs/menus/sheets/popovers and route-level navigation flow.
**Edge cases & pitfalls:**
- Potential pitfalls include hydration boundaries (`use client`), undefined async data, and stale props in memoized callbacks.
- Validate empty/error branches and permission-gated rendering paths for this file during QA.
**Recommended improvements:**
- Add explicit JSDoc/type comments for exported APIs where signatures are complex or implicit.
- Normalize loading/empty/error visual patterns with shared helper components to reduce divergence.
- Add focused a11y tests for keyboard traversal and announced labels in interactive controls used here.
**Testability notes:**
- Unit/interaction tests should assert render branches, callback execution, and disabled/loading/error states for this module.
- For route files, prefer integration tests validating server/client boundary behavior and composed child rendering.

### app/(workspace)/app/guide/materials/components/MaterialsTableWrapper.tsx
**Type:** component  
**Runtime:** Server Component  
**Exports:** MaterialsTableWrapper  
**Purpose:** This file contributes directly to rendered UI (route surface, reusable component, hook-driven UI behavior, or style config). It defines either a visual building block or logic consumed by visual components in the app shell.
**Public API:**
| name | type | required | default | description |
|---|---|---|---|---|
| props / parameters | inferred from source signature | varies | none | See exported component or hook declaration in this file for exact contract. |
- Events/callbacks (if any): implemented as prop callbacks and local handlers bound to UI interactions in this module.
- External dependencies (Radix/shadcn/forms/state libs): @/components/ui/data-table, @/types/material-row.
**Internal behavior:**
- State and hooks used: No React/custom hook calls found.
- Data flow: inputs/params/context -> derived values -> conditional JSX/render output -> side effects (navigation, mutations, telemetry, toasts) when triggered.
- UI states: normal + conditional states (loading/empty/error/disabled) as encoded in branch logic within this file.
**Composition:**
- Composes imported primitives and local helpers according to file role (route shell, form/dialog, table part, or utility hook).
- Children/slot behavior follows React composition patterns where applicable.
**Styling:**
- Tailwind utility classes are primary styling mechanism; class composition may use `cn()` and/or variant helpers depending on file.
**Accessibility (A11y):**
- Leverages semantic HTML and Radix accessibility behavior where primitives are used; custom interactive regions require keyboard/ARIA verification.
- Focus management is primarily inherited from dialogs/menus/sheets/popovers and route-level navigation flow.
**Edge cases & pitfalls:**
- Potential pitfalls include hydration boundaries (`use client`), undefined async data, and stale props in memoized callbacks.
- Validate empty/error branches and permission-gated rendering paths for this file during QA.
**Recommended improvements:**
- Add explicit JSDoc/type comments for exported APIs where signatures are complex or implicit.
- Normalize loading/empty/error visual patterns with shared helper components to reduce divergence.
- Add focused a11y tests for keyboard traversal and announced labels in interactive controls used here.
**Testability notes:**
- Unit/interaction tests should assert render branches, callback execution, and disabled/loading/error states for this module.
- For route files, prefer integration tests validating server/client boundary behavior and composed child rendering.

### app/(workspace)/app/guide/materials/components/MaterialsToolbar.tsx
**Type:** component  
**Runtime:** Server Component  
**Exports:** MaterialsToolbar  
**Purpose:** This file contributes directly to rendered UI (route surface, reusable component, hook-driven UI behavior, or style config). It defines either a visual building block or logic consumed by visual components in the app shell.
**Public API:**
| name | type | required | default | description |
|---|---|---|---|---|
| props / parameters | inferred from source signature | varies | none | See exported component or hook declaration in this file for exact contract. |
- Events/callbacks (if any): implemented as prop callbacks and local handlers bound to UI interactions in this module.
- External dependencies (Radix/shadcn/forms/state libs): @/components/ui/button, lucide-react.
**Internal behavior:**
- State and hooks used: No React/custom hook calls found.
- Data flow: inputs/params/context -> derived values -> conditional JSX/render output -> side effects (navigation, mutations, telemetry, toasts) when triggered.
- UI states: normal + conditional states (loading/empty/error/disabled) as encoded in branch logic within this file.
**Composition:**
- Composes imported primitives and local helpers according to file role (route shell, form/dialog, table part, or utility hook).
- Children/slot behavior follows React composition patterns where applicable.
**Styling:**
- Tailwind utility classes are primary styling mechanism; class composition may use `cn()` and/or variant helpers depending on file.
**Accessibility (A11y):**
- Leverages semantic HTML and Radix accessibility behavior where primitives are used; custom interactive regions require keyboard/ARIA verification.
- Focus management is primarily inherited from dialogs/menus/sheets/popovers and route-level navigation flow.
**Edge cases & pitfalls:**
- Potential pitfalls include hydration boundaries (`use client`), undefined async data, and stale props in memoized callbacks.
- Validate empty/error branches and permission-gated rendering paths for this file during QA.
**Recommended improvements:**
- Add explicit JSDoc/type comments for exported APIs where signatures are complex or implicit.
- Normalize loading/empty/error visual patterns with shared helper components to reduce divergence.
- Add focused a11y tests for keyboard traversal and announced labels in interactive controls used here.
**Testability notes:**
- Unit/interaction tests should assert render branches, callback execution, and disabled/loading/error states for this module.
- For route files, prefer integration tests validating server/client boundary behavior and composed child rendering.

### app/(workspace)/app/guide/materials/hooks/useAiIndexing.ts
**Type:** hook  
**Runtime:** both  
**Exports:** useAiIndexing  
**Purpose:** This file contributes directly to rendered UI (route surface, reusable component, hook-driven UI behavior, or style config). It defines either a visual building block or logic consumed by visual components in the app shell.
**Public API:**
| name | type | required | default | description |
|---|---|---|---|---|
| props / parameters | inferred from source signature | varies | none | See exported component or hook declaration in this file for exact contract. |
- Events/callbacks (if any): implemented as prop callbacks and local handlers bound to UI interactions in this module.
- External dependencies (Radix/shadcn/forms/state libs): react, @/components/ui/use-toast, @/app/actions/materials.
**Internal behavior:**
- State and hooks used: useAiIndexing, useState, useToast.
- Data flow: inputs/params/context -> derived values -> conditional JSX/render output -> side effects (navigation, mutations, telemetry, toasts) when triggered.
- UI states: normal + conditional states (loading/empty/error/disabled) as encoded in branch logic within this file.
**Composition:**
- Composes imported primitives and local helpers according to file role (route shell, form/dialog, table part, or utility hook).
- Children/slot behavior follows React composition patterns where applicable.
**Styling:**
- Tailwind utility classes are primary styling mechanism; class composition may use `cn()` and/or variant helpers depending on file.
**Accessibility (A11y):**
- Leverages semantic HTML and Radix accessibility behavior where primitives are used; custom interactive regions require keyboard/ARIA verification.
- Focus management is primarily inherited from dialogs/menus/sheets/popovers and route-level navigation flow.
**Edge cases & pitfalls:**
- Potential pitfalls include hydration boundaries (`use client`), undefined async data, and stale props in memoized callbacks.
- Validate empty/error branches and permission-gated rendering paths for this file during QA.
**Recommended improvements:**
- Add explicit JSDoc/type comments for exported APIs where signatures are complex or implicit.
- Normalize loading/empty/error visual patterns with shared helper components to reduce divergence.
- Add focused a11y tests for keyboard traversal and announced labels in interactive controls used here.
**Testability notes:**
- Unit/interaction tests should assert render branches, callback execution, and disabled/loading/error states for this module.
- For route files, prefer integration tests validating server/client boundary behavior and composed child rendering.

### app/(workspace)/app/guide/materials/hooks/useMaterialsActions.ts
**Type:** hook  
**Runtime:** both  
**Exports:** useMaterialsActions  
**Purpose:** This file contributes directly to rendered UI (route surface, reusable component, hook-driven UI behavior, or style config). It defines either a visual building block or logic consumed by visual components in the app shell.
**Public API:**
| name | type | required | default | description |
|---|---|---|---|---|
| props / parameters | inferred from source signature | varies | none | See exported component or hook declaration in this file for exact contract. |
- Events/callbacks (if any): implemented as prop callbacks and local handlers bound to UI interactions in this module.
- External dependencies (Radix/shadcn/forms/state libs): react, @/components/ui/use-toast, @/app/actions/materials, xlsx, @/types/material-row, @/lib/constants/import-configs.
**Internal behavior:**
- State and hooks used: useMaterialsActions, useRef, useToast, useTransition.
- Data flow: inputs/params/context -> derived values -> conditional JSX/render output -> side effects (navigation, mutations, telemetry, toasts) when triggered.
- UI states: normal + conditional states (loading/empty/error/disabled) as encoded in branch logic within this file.
**Composition:**
- Composes imported primitives and local helpers according to file role (route shell, form/dialog, table part, or utility hook).
- Children/slot behavior follows React composition patterns where applicable.
**Styling:**
- Tailwind utility classes are primary styling mechanism; class composition may use `cn()` and/or variant helpers depending on file.
**Accessibility (A11y):**
- Leverages semantic HTML and Radix accessibility behavior where primitives are used; custom interactive regions require keyboard/ARIA verification.
- Focus management is primarily inherited from dialogs/menus/sheets/popovers and route-level navigation flow.
**Edge cases & pitfalls:**
- Potential pitfalls include hydration boundaries (`use client`), undefined async data, and stale props in memoized callbacks.
- Validate empty/error branches and permission-gated rendering paths for this file during QA.
**Recommended improvements:**
- Add explicit JSDoc/type comments for exported APIs where signatures are complex or implicit.
- Normalize loading/empty/error visual patterns with shared helper components to reduce divergence.
- Add focused a11y tests for keyboard traversal and announced labels in interactive controls used here.
**Testability notes:**
- Unit/interaction tests should assert render branches, callback execution, and disabled/loading/error states for this module.
- For route files, prefer integration tests validating server/client boundary behavior and composed child rendering.

### app/(workspace)/app/guide/materials/hooks/useMaterialsRowActions.ts
**Type:** hook  
**Runtime:** Client Component  
**Exports:** useMaterialsRowActions  
**Purpose:** This file contributes directly to rendered UI (route surface, reusable component, hook-driven UI behavior, or style config). It defines either a visual building block or logic consumed by visual components in the app shell.
**Public API:**
| name | type | required | default | description |
|---|---|---|---|---|
| props / parameters | inferred from source signature | varies | none | See exported component or hook declaration in this file for exact contract. |
- Events/callbacks (if any): implemented as prop callbacks and local handlers bound to UI interactions in this module.
- External dependencies (Radix/shadcn/forms/state libs): @/app/actions/materials, @/types/material-row.
**Internal behavior:**
- State and hooks used: useMaterialsRowActions.
- Data flow: inputs/params/context -> derived values -> conditional JSX/render output -> side effects (navigation, mutations, telemetry, toasts) when triggered.
- UI states: normal + conditional states (loading/empty/error/disabled) as encoded in branch logic within this file.
**Composition:**
- Composes imported primitives and local helpers according to file role (route shell, form/dialog, table part, or utility hook).
- Children/slot behavior follows React composition patterns where applicable.
**Styling:**
- Tailwind utility classes are primary styling mechanism; class composition may use `cn()` and/or variant helpers depending on file.
**Accessibility (A11y):**
- Leverages semantic HTML and Radix accessibility behavior where primitives are used; custom interactive regions require keyboard/ARIA verification.
- Focus management is primarily inherited from dialogs/menus/sheets/popovers and route-level navigation flow.
**Edge cases & pitfalls:**
- Potential pitfalls include hydration boundaries (`use client`), undefined async data, and stale props in memoized callbacks.
- Validate empty/error branches and permission-gated rendering paths for this file during QA.
**Recommended improvements:**
- Add explicit JSDoc/type comments for exported APIs where signatures are complex or implicit.
- Normalize loading/empty/error visual patterns with shared helper components to reduce divergence.
- Add focused a11y tests for keyboard traversal and announced labels in interactive controls used here.
**Testability notes:**
- Unit/interaction tests should assert render branches, callback execution, and disabled/loading/error states for this module.
- For route files, prefer integration tests validating server/client boundary behavior and composed child rendering.

### app/(workspace)/app/guide/materials/hooks/useMaterialsSearch.ts
**Type:** hook  
**Runtime:** both  
**Exports:** useMaterialsSearch  
**Purpose:** This file contributes directly to rendered UI (route surface, reusable component, hook-driven UI behavior, or style config). It defines either a visual building block or logic consumed by visual components in the app shell.
**Public API:**
| name | type | required | default | description |
|---|---|---|---|---|
| props / parameters | inferred from source signature | varies | none | See exported component or hook declaration in this file for exact contract. |
- Events/callbacks (if any): implemented as prop callbacks and local handlers bound to UI interactions in this module.
- External dependencies (Radix/shadcn/forms/state libs): react, @/app/actions/materials, @/types/material-row, @/components/ui/use-toast.
**Internal behavior:**
- State and hooks used: useEffect, useMaterialsSearch, useState, useToast, useTransition.
- Data flow: inputs/params/context -> derived values -> conditional JSX/render output -> side effects (navigation, mutations, telemetry, toasts) when triggered.
- UI states: normal + conditional states (loading/empty/error/disabled) as encoded in branch logic within this file.
**Composition:**
- Composes imported primitives and local helpers according to file role (route shell, form/dialog, table part, or utility hook).
- Children/slot behavior follows React composition patterns where applicable.
**Styling:**
- Tailwind utility classes are primary styling mechanism; class composition may use `cn()` and/or variant helpers depending on file.
**Accessibility (A11y):**
- Leverages semantic HTML and Radix accessibility behavior where primitives are used; custom interactive regions require keyboard/ARIA verification.
- Focus management is primarily inherited from dialogs/menus/sheets/popovers and route-level navigation flow.
**Edge cases & pitfalls:**
- Potential pitfalls include hydration boundaries (`use client`), undefined async data, and stale props in memoized callbacks.
- Validate empty/error branches and permission-gated rendering paths for this file during QA.
**Recommended improvements:**
- Add explicit JSDoc/type comments for exported APIs where signatures are complex or implicit.
- Normalize loading/empty/error visual patterns with shared helper components to reduce divergence.
- Add focused a11y tests for keyboard traversal and announced labels in interactive controls used here.
**Testability notes:**
- Unit/interaction tests should assert render branches, callback execution, and disabled/loading/error states for this module.
- For route files, prefer integration tests validating server/client boundary behavior and composed child rendering.

### app/(workspace)/app/guide/materials/hooks/useMaterialsTable.ts
**Type:** hook  
**Runtime:** both  
**Exports:** useMaterialsTable  
**Purpose:** This file contributes directly to rendered UI (route surface, reusable component, hook-driven UI behavior, or style config). It defines either a visual building block or logic consumed by visual components in the app shell.
**Public API:**
| name | type | required | default | description |
|---|---|---|---|---|
| props / parameters | inferred from source signature | varies | none | See exported component or hook declaration in this file for exact contract. |
- Events/callbacks (if any): implemented as prop callbacks and local handlers bound to UI interactions in this module.
- External dependencies (Radix/shadcn/forms/state libs): @/types/material-row.
**Internal behavior:**
- State and hooks used: useMaterialsTable.
- Data flow: inputs/params/context -> derived values -> conditional JSX/render output -> side effects (navigation, mutations, telemetry, toasts) when triggered.
- UI states: normal + conditional states (loading/empty/error/disabled) as encoded in branch logic within this file.
**Composition:**
- Composes imported primitives and local helpers according to file role (route shell, form/dialog, table part, or utility hook).
- Children/slot behavior follows React composition patterns where applicable.
**Styling:**
- Tailwind utility classes are primary styling mechanism; class composition may use `cn()` and/or variant helpers depending on file.
**Accessibility (A11y):**
- Leverages semantic HTML and Radix accessibility behavior where primitives are used; custom interactive regions require keyboard/ARIA verification.
- Focus management is primarily inherited from dialogs/menus/sheets/popovers and route-level navigation flow.
**Edge cases & pitfalls:**
- Potential pitfalls include hydration boundaries (`use client`), undefined async data, and stale props in memoized callbacks.
- Validate empty/error branches and permission-gated rendering paths for this file during QA.
**Recommended improvements:**
- Add explicit JSDoc/type comments for exported APIs where signatures are complex or implicit.
- Normalize loading/empty/error visual patterns with shared helper components to reduce divergence.
- Add focused a11y tests for keyboard traversal and announced labels in interactive controls used here.
**Testability notes:**
- Unit/interaction tests should assert render branches, callback execution, and disabled/loading/error states for this module.
- For route files, prefer integration tests validating server/client boundary behavior and composed child rendering.

### app/(workspace)/app/guide/materials/loading.tsx
**Type:** route state UI  
**Runtime:** Server Component  
**Exports:** default Loading, default function  
**Purpose:** This file contributes directly to rendered UI (route surface, reusable component, hook-driven UI behavior, or style config). It defines either a visual building block or logic consumed by visual components in the app shell.
**Public API:**
| name | type | required | default | description |
|---|---|---|---|---|
| props / parameters | inferred from source signature | varies | none | See exported component or hook declaration in this file for exact contract. |
- Events/callbacks (if any): implemented as prop callbacks and local handlers bound to UI interactions in this module.
- External dependencies (Radix/shadcn/forms/state libs): @/components/ui/skeleton.
**Internal behavior:**
- State and hooks used: No React/custom hook calls found.
- Data flow: inputs/params/context -> derived values -> conditional JSX/render output -> side effects (navigation, mutations, telemetry, toasts) when triggered.
- UI states: normal + conditional states (loading/empty/error/disabled) as encoded in branch logic within this file.
**Composition:**
- Composes imported primitives and local helpers according to file role (route shell, form/dialog, table part, or utility hook).
- Children/slot behavior follows React composition patterns where applicable.
**Styling:**
- Tailwind utility classes are primary styling mechanism; class composition may use `cn()` and/or variant helpers depending on file.
**Accessibility (A11y):**
- Leverages semantic HTML and Radix accessibility behavior where primitives are used; custom interactive regions require keyboard/ARIA verification.
- Focus management is primarily inherited from dialogs/menus/sheets/popovers and route-level navigation flow.
**Edge cases & pitfalls:**
- Potential pitfalls include hydration boundaries (`use client`), undefined async data, and stale props in memoized callbacks.
- Validate empty/error branches and permission-gated rendering paths for this file during QA.
**Recommended improvements:**
- Add explicit JSDoc/type comments for exported APIs where signatures are complex or implicit.
- Normalize loading/empty/error visual patterns with shared helper components to reduce divergence.
- Add focused a11y tests for keyboard traversal and announced labels in interactive controls used here.
**Testability notes:**
- Unit/interaction tests should assert render branches, callback execution, and disabled/loading/error states for this module.
- For route files, prefer integration tests validating server/client boundary behavior and composed child rendering.

### app/(workspace)/app/guide/materials/materials-client.tsx
**Type:** component  
**Runtime:** Client Component  
**Exports:** MaterialsClient  
**Purpose:** This file contributes directly to rendered UI (route surface, reusable component, hook-driven UI behavior, or style config). It defines either a visual building block or logic consumed by visual components in the app shell.
**Public API:**
| name | type | required | default | description |
|---|---|---|---|---|
| props / parameters | inferred from source signature | varies | none | See exported component or hook declaration in this file for exact contract. |
- Events/callbacks (if any): implemented as prop callbacks and local handlers bound to UI interactions in this module.
- External dependencies (Radix/shadcn/forms/state libs): react, lucide-react, @/types/material-row, @/hooks/use-data-table-editor.
**Internal behavior:**
- State and hooks used: useCallback, useDataTableEditor, useEffect, useMaterialsActions, useMaterialsRowActions, useMaterialsSearch, useMaterialsTable, useState.
- Data flow: inputs/params/context -> derived values -> conditional JSX/render output -> side effects (navigation, mutations, telemetry, toasts) when triggered.
- UI states: normal + conditional states (loading/empty/error/disabled) as encoded in branch logic within this file.
**Composition:**
- Composes imported primitives and local helpers according to file role (route shell, form/dialog, table part, or utility hook).
- Children/slot behavior follows React composition patterns where applicable.
**Styling:**
- Tailwind utility classes are primary styling mechanism; class composition may use `cn()` and/or variant helpers depending on file.
**Accessibility (A11y):**
- Leverages semantic HTML and Radix accessibility behavior where primitives are used; custom interactive regions require keyboard/ARIA verification.
- Focus management is primarily inherited from dialogs/menus/sheets/popovers and route-level navigation flow.
**Edge cases & pitfalls:**
- Potential pitfalls include hydration boundaries (`use client`), undefined async data, and stale props in memoized callbacks.
- Validate empty/error branches and permission-gated rendering paths for this file during QA.
**Recommended improvements:**
- Add explicit JSDoc/type comments for exported APIs where signatures are complex or implicit.
- Normalize loading/empty/error visual patterns with shared helper components to reduce divergence.
- Add focused a11y tests for keyboard traversal and announced labels in interactive controls used here.
**Testability notes:**
- Unit/interaction tests should assert render branches, callback execution, and disabled/loading/error states for this module.
- For route files, prefer integration tests validating server/client boundary behavior and composed child rendering.

### app/(workspace)/app/guide/materials/page.tsx
**Type:** route page  
**Runtime:** Server Component  
**Exports:** default async  
**Purpose:** This file contributes directly to rendered UI (route surface, reusable component, hook-driven UI behavior, or style config). It defines either a visual building block or logic consumed by visual components in the app shell.
**Public API:**
| name | type | required | default | description |
|---|---|---|---|---|
| props / parameters | inferred from source signature | varies | none | See exported component or hook declaration in this file for exact contract. |
- Events/callbacks (if any): implemented as prop callbacks and local handlers bound to UI interactions in this module.
- External dependencies (Radix/shadcn/forms/state libs): @/lib/data/db/queries.
**Internal behavior:**
- State and hooks used: No React/custom hook calls found.
- Data flow: inputs/params/context -> derived values -> conditional JSX/render output -> side effects (navigation, mutations, telemetry, toasts) when triggered.
- UI states: normal + conditional states (loading/empty/error/disabled) as encoded in branch logic within this file.
**Composition:**
- Composes imported primitives and local helpers according to file role (route shell, form/dialog, table part, or utility hook).
- Children/slot behavior follows React composition patterns where applicable.
**Styling:**
- Tailwind utility classes are primary styling mechanism; class composition may use `cn()` and/or variant helpers depending on file.
**Accessibility (A11y):**
- Leverages semantic HTML and Radix accessibility behavior where primitives are used; custom interactive regions require keyboard/ARIA verification.
- Focus management is primarily inherited from dialogs/menus/sheets/popovers and route-level navigation flow.
**Edge cases & pitfalls:**
- Potential pitfalls include hydration boundaries (`use client`), undefined async data, and stale props in memoized callbacks.
- Validate empty/error branches and permission-gated rendering paths for this file during QA.
**Recommended improvements:**
- Add explicit JSDoc/type comments for exported APIs where signatures are complex or implicit.
- Normalize loading/empty/error visual patterns with shared helper components to reduce divergence.
- Add focused a11y tests for keyboard traversal and announced labels in interactive controls used here.
**Testability notes:**
- Unit/interaction tests should assert render branches, callback execution, and disabled/loading/error states for this module.
- For route files, prefer integration tests validating server/client boundary behavior and composed child rendering.

### app/(workspace)/app/guide/page.tsx
**Type:** route page  
**Runtime:** Server Component  
**Exports:** default Page, default function  
**Purpose:** This file contributes directly to rendered UI (route surface, reusable component, hook-driven UI behavior, or style config). It defines either a visual building block or logic consumed by visual components in the app shell.
**Public API:**
| name | type | required | default | description |
|---|---|---|---|---|
| props / parameters | inferred from source signature | varies | none | See exported component or hook declaration in this file for exact contract. |
- Events/callbacks (if any): implemented as prop callbacks and local handlers bound to UI interactions in this module.
- External dependencies (Radix/shadcn/forms/state libs): No external package imports.
**Internal behavior:**
- State and hooks used: No React/custom hook calls found.
- Data flow: inputs/params/context -> derived values -> conditional JSX/render output -> side effects (navigation, mutations, telemetry, toasts) when triggered.
- UI states: normal + conditional states (loading/empty/error/disabled) as encoded in branch logic within this file.
**Composition:**
- Composes imported primitives and local helpers according to file role (route shell, form/dialog, table part, or utility hook).
- Children/slot behavior follows React composition patterns where applicable.
**Styling:**
- Tailwind utility classes are primary styling mechanism; class composition may use `cn()` and/or variant helpers depending on file.
**Accessibility (A11y):**
- Leverages semantic HTML and Radix accessibility behavior where primitives are used; custom interactive regions require keyboard/ARIA verification.
- Focus management is primarily inherited from dialogs/menus/sheets/popovers and route-level navigation flow.
**Edge cases & pitfalls:**
- Potential pitfalls include hydration boundaries (`use client`), undefined async data, and stale props in memoized callbacks.
- Validate empty/error branches and permission-gated rendering paths for this file during QA.
**Recommended improvements:**
- Add explicit JSDoc/type comments for exported APIs where signatures are complex or implicit.
- Normalize loading/empty/error visual patterns with shared helper components to reduce divergence.
- Add focused a11y tests for keyboard traversal and announced labels in interactive controls used here.
**Testability notes:**
- Unit/interaction tests should assert render branches, callback execution, and disabled/loading/error states for this module.
- For route files, prefer integration tests validating server/client boundary behavior and composed child rendering.

### app/(workspace)/app/guide/works/columns.tsx
**Type:** component  
**Runtime:** Client Component  
**Exports:** columns  
**Purpose:** This file contributes directly to rendered UI (route surface, reusable component, hook-driven UI behavior, or style config). It defines either a visual building block or logic consumed by visual components in the app shell.
**Public API:**
| name | type | required | default | description |
|---|---|---|---|---|
| props / parameters | inferred from source signature | varies | none | See exported component or hook declaration in this file for exact contract. |
- Events/callbacks (if any): implemented as prop callbacks and local handlers bound to UI interactions in this module.
- External dependencies (Radix/shadcn/forms/state libs): react, @tanstack/react-table, lucide-react, @/components/ui/button, @/components/ui/badge, @/components/ui/input, class-variance-authority, @/types/work-row, @/components/unit-select, @/components/ui/data-table.
**Internal behavior:**
- State and hooks used: useMemo.
- Data flow: inputs/params/context -> derived values -> conditional JSX/render output -> side effects (navigation, mutations, telemetry, toasts) when triggered.
- UI states: normal + conditional states (loading/empty/error/disabled) as encoded in branch logic within this file.
**Composition:**
- Composes imported primitives and local helpers according to file role (route shell, form/dialog, table part, or utility hook).
- Children/slot behavior follows React composition patterns where applicable.
**Styling:**
- Tailwind utility classes are primary styling mechanism; class composition may use `cn()` and/or variant helpers depending on file.
**Accessibility (A11y):**
- Leverages semantic HTML and Radix accessibility behavior where primitives are used; custom interactive regions require keyboard/ARIA verification.
- Focus management is primarily inherited from dialogs/menus/sheets/popovers and route-level navigation flow.
**Edge cases & pitfalls:**
- Potential pitfalls include hydration boundaries (`use client`), undefined async data, and stale props in memoized callbacks.
- Validate empty/error branches and permission-gated rendering paths for this file during QA.
**Recommended improvements:**
- Add explicit JSDoc/type comments for exported APIs where signatures are complex or implicit.
- Normalize loading/empty/error visual patterns with shared helper components to reduce divergence.
- Add focused a11y tests for keyboard traversal and announced labels in interactive controls used here.
**Testability notes:**
- Unit/interaction tests should assert render branches, callback execution, and disabled/loading/error states for this module.
- For route files, prefer integration tests validating server/client boundary behavior and composed child rendering.

### app/(workspace)/app/guide/works/components/WorksDeleteDialog.tsx
**Type:** component  
**Runtime:** Client Component  
**Exports:** WorksDeleteDialog  
**Purpose:** This file contributes directly to rendered UI (route surface, reusable component, hook-driven UI behavior, or style config). It defines either a visual building block or logic consumed by visual components in the app shell.
**Public API:**
| name | type | required | default | description |
|---|---|---|---|---|
| props / parameters | inferred from source signature | varies | none | See exported component or hook declaration in this file for exact contract. |
- Events/callbacks (if any): implemented as prop callbacks and local handlers bound to UI interactions in this module.
- External dependencies (Radix/shadcn/forms/state libs): No external package imports.
**Internal behavior:**
- State and hooks used: No React/custom hook calls found.
- Data flow: inputs/params/context -> derived values -> conditional JSX/render output -> side effects (navigation, mutations, telemetry, toasts) when triggered.
- UI states: normal + conditional states (loading/empty/error/disabled) as encoded in branch logic within this file.
**Composition:**
- Composes imported primitives and local helpers according to file role (route shell, form/dialog, table part, or utility hook).
- Children/slot behavior follows React composition patterns where applicable.
**Styling:**
- Tailwind utility classes are primary styling mechanism; class composition may use `cn()` and/or variant helpers depending on file.
**Accessibility (A11y):**
- Leverages semantic HTML and Radix accessibility behavior where primitives are used; custom interactive regions require keyboard/ARIA verification.
- Focus management is primarily inherited from dialogs/menus/sheets/popovers and route-level navigation flow.
**Edge cases & pitfalls:**
- Potential pitfalls include hydration boundaries (`use client`), undefined async data, and stale props in memoized callbacks.
- Validate empty/error branches and permission-gated rendering paths for this file during QA.
**Recommended improvements:**
- Add explicit JSDoc/type comments for exported APIs where signatures are complex or implicit.
- Normalize loading/empty/error visual patterns with shared helper components to reduce divergence.
- Add focused a11y tests for keyboard traversal and announced labels in interactive controls used here.
**Testability notes:**
- Unit/interaction tests should assert render branches, callback execution, and disabled/loading/error states for this module.
- For route files, prefer integration tests validating server/client boundary behavior and composed child rendering.

### app/(workspace)/app/guide/works/components/WorksEditDialog.tsx
**Type:** component  
**Runtime:** Client Component  
**Exports:** WorksEditDialog  
**Purpose:** This file contributes directly to rendered UI (route surface, reusable component, hook-driven UI behavior, or style config). It defines either a visual building block or logic consumed by visual components in the app shell.
**Public API:**
| name | type | required | default | description |
|---|---|---|---|---|
| props / parameters | inferred from source signature | varies | none | See exported component or hook declaration in this file for exact contract. |
- Events/callbacks (if any): implemented as prop callbacks and local handlers bound to UI interactions in this module.
- External dependencies (Radix/shadcn/forms/state libs): @/types/work-row, @/components/ui/button, @/components/ui/input, @/components/ui/label, @/components/unit-select, lucide-react.
**Internal behavior:**
- State and hooks used: No React/custom hook calls found.
- Data flow: inputs/params/context -> derived values -> conditional JSX/render output -> side effects (navigation, mutations, telemetry, toasts) when triggered.
- UI states: normal + conditional states (loading/empty/error/disabled) as encoded in branch logic within this file.
**Composition:**
- Composes imported primitives and local helpers according to file role (route shell, form/dialog, table part, or utility hook).
- Children/slot behavior follows React composition patterns where applicable.
**Styling:**
- Tailwind utility classes are primary styling mechanism; class composition may use `cn()` and/or variant helpers depending on file.
**Accessibility (A11y):**
- Leverages semantic HTML and Radix accessibility behavior where primitives are used; custom interactive regions require keyboard/ARIA verification.
- Focus management is primarily inherited from dialogs/menus/sheets/popovers and route-level navigation flow.
**Edge cases & pitfalls:**
- Potential pitfalls include hydration boundaries (`use client`), undefined async data, and stale props in memoized callbacks.
- Validate empty/error branches and permission-gated rendering paths for this file during QA.
**Recommended improvements:**
- Add explicit JSDoc/type comments for exported APIs where signatures are complex or implicit.
- Normalize loading/empty/error visual patterns with shared helper components to reduce divergence.
- Add focused a11y tests for keyboard traversal and announced labels in interactive controls used here.
**Testability notes:**
- Unit/interaction tests should assert render branches, callback execution, and disabled/loading/error states for this module.
- For route files, prefer integration tests validating server/client boundary behavior and composed child rendering.

### app/(workspace)/app/guide/works/components/WorksHeader.tsx
**Type:** component  
**Runtime:** Server Component  
**Exports:** WorksHeader  
**Purpose:** This file contributes directly to rendered UI (route surface, reusable component, hook-driven UI behavior, or style config). It defines either a visual building block or logic consumed by visual components in the app shell.
**Public API:**
| name | type | required | default | description |
|---|---|---|---|---|
| props / parameters | inferred from source signature | varies | none | See exported component or hook declaration in this file for exact contract. |
- Events/callbacks (if any): implemented as prop callbacks and local handlers bound to UI interactions in this module.
- External dependencies (Radix/shadcn/forms/state libs): lucide-react, @/components/ui/badge.
**Internal behavior:**
- State and hooks used: No React/custom hook calls found.
- Data flow: inputs/params/context -> derived values -> conditional JSX/render output -> side effects (navigation, mutations, telemetry, toasts) when triggered.
- UI states: normal + conditional states (loading/empty/error/disabled) as encoded in branch logic within this file.
**Composition:**
- Composes imported primitives and local helpers according to file role (route shell, form/dialog, table part, or utility hook).
- Children/slot behavior follows React composition patterns where applicable.
**Styling:**
- Tailwind utility classes are primary styling mechanism; class composition may use `cn()` and/or variant helpers depending on file.
**Accessibility (A11y):**
- Leverages semantic HTML and Radix accessibility behavior where primitives are used; custom interactive regions require keyboard/ARIA verification.
- Focus management is primarily inherited from dialogs/menus/sheets/popovers and route-level navigation flow.
**Edge cases & pitfalls:**
- Potential pitfalls include hydration boundaries (`use client`), undefined async data, and stale props in memoized callbacks.
- Validate empty/error branches and permission-gated rendering paths for this file during QA.
**Recommended improvements:**
- Add explicit JSDoc/type comments for exported APIs where signatures are complex or implicit.
- Normalize loading/empty/error visual patterns with shared helper components to reduce divergence.
- Add focused a11y tests for keyboard traversal and announced labels in interactive controls used here.
**Testability notes:**
- Unit/interaction tests should assert render branches, callback execution, and disabled/loading/error states for this module.
- For route files, prefer integration tests validating server/client boundary behavior and composed child rendering.

### app/(workspace)/app/guide/works/components/WorksTableWrapper.tsx
**Type:** component  
**Runtime:** Server Component  
**Exports:** WorksTableWrapper  
**Purpose:** This file contributes directly to rendered UI (route surface, reusable component, hook-driven UI behavior, or style config). It defines either a visual building block or logic consumed by visual components in the app shell.
**Public API:**
| name | type | required | default | description |
|---|---|---|---|---|
| props / parameters | inferred from source signature | varies | none | See exported component or hook declaration in this file for exact contract. |
- Events/callbacks (if any): implemented as prop callbacks and local handlers bound to UI interactions in this module.
- External dependencies (Radix/shadcn/forms/state libs): @/components/ui/data-table, @/types/work-row.
**Internal behavior:**
- State and hooks used: No React/custom hook calls found.
- Data flow: inputs/params/context -> derived values -> conditional JSX/render output -> side effects (navigation, mutations, telemetry, toasts) when triggered.
- UI states: normal + conditional states (loading/empty/error/disabled) as encoded in branch logic within this file.
**Composition:**
- Composes imported primitives and local helpers according to file role (route shell, form/dialog, table part, or utility hook).
- Children/slot behavior follows React composition patterns where applicable.
**Styling:**
- Tailwind utility classes are primary styling mechanism; class composition may use `cn()` and/or variant helpers depending on file.
**Accessibility (A11y):**
- Leverages semantic HTML and Radix accessibility behavior where primitives are used; custom interactive regions require keyboard/ARIA verification.
- Focus management is primarily inherited from dialogs/menus/sheets/popovers and route-level navigation flow.
**Edge cases & pitfalls:**
- Potential pitfalls include hydration boundaries (`use client`), undefined async data, and stale props in memoized callbacks.
- Validate empty/error branches and permission-gated rendering paths for this file during QA.
**Recommended improvements:**
- Add explicit JSDoc/type comments for exported APIs where signatures are complex or implicit.
- Normalize loading/empty/error visual patterns with shared helper components to reduce divergence.
- Add focused a11y tests for keyboard traversal and announced labels in interactive controls used here.
**Testability notes:**
- Unit/interaction tests should assert render branches, callback execution, and disabled/loading/error states for this module.
- For route files, prefer integration tests validating server/client boundary behavior and composed child rendering.

### app/(workspace)/app/guide/works/components/WorksToolbar.tsx
**Type:** component  
**Runtime:** Server Component  
**Exports:** WorksToolbar  
**Purpose:** This file contributes directly to rendered UI (route surface, reusable component, hook-driven UI behavior, or style config). It defines either a visual building block or logic consumed by visual components in the app shell.
**Public API:**
| name | type | required | default | description |
|---|---|---|---|---|
| props / parameters | inferred from source signature | varies | none | See exported component or hook declaration in this file for exact contract. |
- Events/callbacks (if any): implemented as prop callbacks and local handlers bound to UI interactions in this module.
- External dependencies (Radix/shadcn/forms/state libs): @/components/ui/button, lucide-react.
**Internal behavior:**
- State and hooks used: No React/custom hook calls found.
- Data flow: inputs/params/context -> derived values -> conditional JSX/render output -> side effects (navigation, mutations, telemetry, toasts) when triggered.
- UI states: normal + conditional states (loading/empty/error/disabled) as encoded in branch logic within this file.
**Composition:**
- Composes imported primitives and local helpers according to file role (route shell, form/dialog, table part, or utility hook).
- Children/slot behavior follows React composition patterns where applicable.
**Styling:**
- Tailwind utility classes are primary styling mechanism; class composition may use `cn()` and/or variant helpers depending on file.
**Accessibility (A11y):**
- Leverages semantic HTML and Radix accessibility behavior where primitives are used; custom interactive regions require keyboard/ARIA verification.
- Focus management is primarily inherited from dialogs/menus/sheets/popovers and route-level navigation flow.
**Edge cases & pitfalls:**
- Potential pitfalls include hydration boundaries (`use client`), undefined async data, and stale props in memoized callbacks.
- Validate empty/error branches and permission-gated rendering paths for this file during QA.
**Recommended improvements:**
- Add explicit JSDoc/type comments for exported APIs where signatures are complex or implicit.
- Normalize loading/empty/error visual patterns with shared helper components to reduce divergence.
- Add focused a11y tests for keyboard traversal and announced labels in interactive controls used here.
**Testability notes:**
- Unit/interaction tests should assert render branches, callback execution, and disabled/loading/error states for this module.
- For route files, prefer integration tests validating server/client boundary behavior and composed child rendering.

### app/(workspace)/app/guide/works/hooks/useWorksActions.ts
**Type:** hook  
**Runtime:** Client Component  
**Exports:** useWorksActions  
**Purpose:** This file contributes directly to rendered UI (route surface, reusable component, hook-driven UI behavior, or style config). It defines either a visual building block or logic consumed by visual components in the app shell.
**Public API:**
| name | type | required | default | description |
|---|---|---|---|---|
| props / parameters | inferred from source signature | varies | none | See exported component or hook declaration in this file for exact contract. |
- Events/callbacks (if any): implemented as prop callbacks and local handlers bound to UI interactions in this module.
- External dependencies (Radix/shadcn/forms/state libs): react, xlsx, @/components/ui/use-toast, @/types/work-row.
**Internal behavior:**
- State and hooks used: useRef, useToast, useTransition, useWorksActions.
- Data flow: inputs/params/context -> derived values -> conditional JSX/render output -> side effects (navigation, mutations, telemetry, toasts) when triggered.
- UI states: normal + conditional states (loading/empty/error/disabled) as encoded in branch logic within this file.
**Composition:**
- Composes imported primitives and local helpers according to file role (route shell, form/dialog, table part, or utility hook).
- Children/slot behavior follows React composition patterns where applicable.
**Styling:**
- Tailwind utility classes are primary styling mechanism; class composition may use `cn()` and/or variant helpers depending on file.
**Accessibility (A11y):**
- Leverages semantic HTML and Radix accessibility behavior where primitives are used; custom interactive regions require keyboard/ARIA verification.
- Focus management is primarily inherited from dialogs/menus/sheets/popovers and route-level navigation flow.
**Edge cases & pitfalls:**
- Potential pitfalls include hydration boundaries (`use client`), undefined async data, and stale props in memoized callbacks.
- Validate empty/error branches and permission-gated rendering paths for this file during QA.
**Recommended improvements:**
- Add explicit JSDoc/type comments for exported APIs where signatures are complex or implicit.
- Normalize loading/empty/error visual patterns with shared helper components to reduce divergence.
- Add focused a11y tests for keyboard traversal and announced labels in interactive controls used here.
**Testability notes:**
- Unit/interaction tests should assert render branches, callback execution, and disabled/loading/error states for this module.
- For route files, prefer integration tests validating server/client boundary behavior and composed child rendering.

### app/(workspace)/app/guide/works/hooks/useWorksSearch.ts
**Type:** hook  
**Runtime:** both  
**Exports:** useWorksSearch  
**Purpose:** This file contributes directly to rendered UI (route surface, reusable component, hook-driven UI behavior, or style config). It defines either a visual building block or logic consumed by visual components in the app shell.
**Public API:**
| name | type | required | default | description |
|---|---|---|---|---|
| props / parameters | inferred from source signature | varies | none | See exported component or hook declaration in this file for exact contract. |
- Events/callbacks (if any): implemented as prop callbacks and local handlers bound to UI interactions in this module.
- External dependencies (Radix/shadcn/forms/state libs): react, @/app/actions/works, @/app/actions/works/search, @/types/work-row, @/components/ui/use-toast.
**Internal behavior:**
- State and hooks used: useEffect, useState, useToast, useTransition, useWorksSearch.
- Data flow: inputs/params/context -> derived values -> conditional JSX/render output -> side effects (navigation, mutations, telemetry, toasts) when triggered.
- UI states: normal + conditional states (loading/empty/error/disabled) as encoded in branch logic within this file.
**Composition:**
- Composes imported primitives and local helpers according to file role (route shell, form/dialog, table part, or utility hook).
- Children/slot behavior follows React composition patterns where applicable.
**Styling:**
- Tailwind utility classes are primary styling mechanism; class composition may use `cn()` and/or variant helpers depending on file.
**Accessibility (A11y):**
- Leverages semantic HTML and Radix accessibility behavior where primitives are used; custom interactive regions require keyboard/ARIA verification.
- Focus management is primarily inherited from dialogs/menus/sheets/popovers and route-level navigation flow.
**Edge cases & pitfalls:**
- Potential pitfalls include hydration boundaries (`use client`), undefined async data, and stale props in memoized callbacks.
- Validate empty/error branches and permission-gated rendering paths for this file during QA.
**Recommended improvements:**
- Add explicit JSDoc/type comments for exported APIs where signatures are complex or implicit.
- Normalize loading/empty/error visual patterns with shared helper components to reduce divergence.
- Add focused a11y tests for keyboard traversal and announced labels in interactive controls used here.
**Testability notes:**
- Unit/interaction tests should assert render branches, callback execution, and disabled/loading/error states for this module.
- For route files, prefer integration tests validating server/client boundary behavior and composed child rendering.

### app/(workspace)/app/guide/works/hooks/useWorksTable.ts
**Type:** hook  
**Runtime:** Client Component  
**Exports:** useWorksTable  
**Purpose:** This file contributes directly to rendered UI (route surface, reusable component, hook-driven UI behavior, or style config). It defines either a visual building block or logic consumed by visual components in the app shell.
**Public API:**
| name | type | required | default | description |
|---|---|---|---|---|
| props / parameters | inferred from source signature | varies | none | See exported component or hook declaration in this file for exact contract. |
- Events/callbacks (if any): implemented as prop callbacks and local handlers bound to UI interactions in this module.
- External dependencies (Radix/shadcn/forms/state libs): react, @/types/work-row, @/app/actions/works, @/components/ui/use-toast.
**Internal behavior:**
- State and hooks used: useState, useToast, useTransition, useWorksTable.
- Data flow: inputs/params/context -> derived values -> conditional JSX/render output -> side effects (navigation, mutations, telemetry, toasts) when triggered.
- UI states: normal + conditional states (loading/empty/error/disabled) as encoded in branch logic within this file.
**Composition:**
- Composes imported primitives and local helpers according to file role (route shell, form/dialog, table part, or utility hook).
- Children/slot behavior follows React composition patterns where applicable.
**Styling:**
- Tailwind utility classes are primary styling mechanism; class composition may use `cn()` and/or variant helpers depending on file.
**Accessibility (A11y):**
- Leverages semantic HTML and Radix accessibility behavior where primitives are used; custom interactive regions require keyboard/ARIA verification.
- Focus management is primarily inherited from dialogs/menus/sheets/popovers and route-level navigation flow.
**Edge cases & pitfalls:**
- Potential pitfalls include hydration boundaries (`use client`), undefined async data, and stale props in memoized callbacks.
- Validate empty/error branches and permission-gated rendering paths for this file during QA.
**Recommended improvements:**
- Add explicit JSDoc/type comments for exported APIs where signatures are complex or implicit.
- Normalize loading/empty/error visual patterns with shared helper components to reduce divergence.
- Add focused a11y tests for keyboard traversal and announced labels in interactive controls used here.
**Testability notes:**
- Unit/interaction tests should assert render branches, callback execution, and disabled/loading/error states for this module.
- For route files, prefer integration tests validating server/client boundary behavior and composed child rendering.

### app/(workspace)/app/guide/works/loading.tsx
**Type:** route state UI  
**Runtime:** Server Component  
**Exports:** default Loading, default function  
**Purpose:** This file contributes directly to rendered UI (route surface, reusable component, hook-driven UI behavior, or style config). It defines either a visual building block or logic consumed by visual components in the app shell.
**Public API:**
| name | type | required | default | description |
|---|---|---|---|---|
| props / parameters | inferred from source signature | varies | none | See exported component or hook declaration in this file for exact contract. |
- Events/callbacks (if any): implemented as prop callbacks and local handlers bound to UI interactions in this module.
- External dependencies (Radix/shadcn/forms/state libs): @/components/ui/skeleton.
**Internal behavior:**
- State and hooks used: No React/custom hook calls found.
- Data flow: inputs/params/context -> derived values -> conditional JSX/render output -> side effects (navigation, mutations, telemetry, toasts) when triggered.
- UI states: normal + conditional states (loading/empty/error/disabled) as encoded in branch logic within this file.
**Composition:**
- Composes imported primitives and local helpers according to file role (route shell, form/dialog, table part, or utility hook).
- Children/slot behavior follows React composition patterns where applicable.
**Styling:**
- Tailwind utility classes are primary styling mechanism; class composition may use `cn()` and/or variant helpers depending on file.
**Accessibility (A11y):**
- Leverages semantic HTML and Radix accessibility behavior where primitives are used; custom interactive regions require keyboard/ARIA verification.
- Focus management is primarily inherited from dialogs/menus/sheets/popovers and route-level navigation flow.
**Edge cases & pitfalls:**
- Potential pitfalls include hydration boundaries (`use client`), undefined async data, and stale props in memoized callbacks.
- Validate empty/error branches and permission-gated rendering paths for this file during QA.
**Recommended improvements:**
- Add explicit JSDoc/type comments for exported APIs where signatures are complex or implicit.
- Normalize loading/empty/error visual patterns with shared helper components to reduce divergence.
- Add focused a11y tests for keyboard traversal and announced labels in interactive controls used here.
**Testability notes:**
- Unit/interaction tests should assert render branches, callback execution, and disabled/loading/error states for this module.
- For route files, prefer integration tests validating server/client boundary behavior and composed child rendering.

### app/(workspace)/app/guide/works/page.tsx
**Type:** route page  
**Runtime:** Server Component  
**Exports:** default async  
**Purpose:** This file contributes directly to rendered UI (route surface, reusable component, hook-driven UI behavior, or style config). It defines either a visual building block or logic consumed by visual components in the app shell.
**Public API:**
| name | type | required | default | description |
|---|---|---|---|---|
| props / parameters | inferred from source signature | varies | none | See exported component or hook declaration in this file for exact contract. |
- Events/callbacks (if any): implemented as prop callbacks and local handlers bound to UI interactions in this module.
- External dependencies (Radix/shadcn/forms/state libs): @/lib/data/db/queries.
**Internal behavior:**
- State and hooks used: No React/custom hook calls found.
- Data flow: inputs/params/context -> derived values -> conditional JSX/render output -> side effects (navigation, mutations, telemetry, toasts) when triggered.
- UI states: normal + conditional states (loading/empty/error/disabled) as encoded in branch logic within this file.
**Composition:**
- Composes imported primitives and local helpers according to file role (route shell, form/dialog, table part, or utility hook).
- Children/slot behavior follows React composition patterns where applicable.
**Styling:**
- Tailwind utility classes are primary styling mechanism; class composition may use `cn()` and/or variant helpers depending on file.
**Accessibility (A11y):**
- Leverages semantic HTML and Radix accessibility behavior where primitives are used; custom interactive regions require keyboard/ARIA verification.
- Focus management is primarily inherited from dialogs/menus/sheets/popovers and route-level navigation flow.
**Edge cases & pitfalls:**
- Potential pitfalls include hydration boundaries (`use client`), undefined async data, and stale props in memoized callbacks.
- Validate empty/error branches and permission-gated rendering paths for this file during QA.
**Recommended improvements:**
- Add explicit JSDoc/type comments for exported APIs where signatures are complex or implicit.
- Normalize loading/empty/error visual patterns with shared helper components to reduce divergence.
- Add focused a11y tests for keyboard traversal and announced labels in interactive controls used here.
**Testability notes:**
- Unit/interaction tests should assert render branches, callback execution, and disabled/loading/error states for this module.
- For route files, prefer integration tests validating server/client boundary behavior and composed child rendering.

### app/(workspace)/app/guide/works/works-client.tsx
**Type:** component  
**Runtime:** Client Component  
**Exports:** WorksClient  
**Purpose:** This file contributes directly to rendered UI (route surface, reusable component, hook-driven UI behavior, or style config). It defines either a visual building block or logic consumed by visual components in the app shell.
**Public API:**
| name | type | required | default | description |
|---|---|---|---|---|
| props / parameters | inferred from source signature | varies | none | See exported component or hook declaration in this file for exact contract. |
- Events/callbacks (if any): implemented as prop callbacks and local handlers bound to UI interactions in this module.
- External dependencies (Radix/shadcn/forms/state libs): react, lucide-react, @/components/ui/tooltip, @/types/work-row, @/hooks/use-data-table-editor.
**Internal behavior:**
- State and hooks used: useCallback, useDataTableEditor, useEffect, useState, useWorksActions, useWorksSearch, useWorksTable.
- Data flow: inputs/params/context -> derived values -> conditional JSX/render output -> side effects (navigation, mutations, telemetry, toasts) when triggered.
- UI states: normal + conditional states (loading/empty/error/disabled) as encoded in branch logic within this file.
**Composition:**
- Composes imported primitives and local helpers according to file role (route shell, form/dialog, table part, or utility hook).
- Children/slot behavior follows React composition patterns where applicable.
**Styling:**
- Tailwind utility classes are primary styling mechanism; class composition may use `cn()` and/or variant helpers depending on file.
**Accessibility (A11y):**
- Leverages semantic HTML and Radix accessibility behavior where primitives are used; custom interactive regions require keyboard/ARIA verification.
- Focus management is primarily inherited from dialogs/menus/sheets/popovers and route-level navigation flow.
**Edge cases & pitfalls:**
- Potential pitfalls include hydration boundaries (`use client`), undefined async data, and stale props in memoized callbacks.
- Validate empty/error branches and permission-gated rendering paths for this file during QA.
**Recommended improvements:**
- Add explicit JSDoc/type comments for exported APIs where signatures are complex or implicit.
- Normalize loading/empty/error visual patterns with shared helper components to reduce divergence.
- Add focused a11y tests for keyboard traversal and announced labels in interactive controls used here.
**Testability notes:**
- Unit/interaction tests should assert render branches, callback execution, and disabled/loading/error states for this module.
- For route files, prefer integration tests validating server/client boundary behavior and composed child rendering.

### app/(workspace)/app/layout.tsx
**Type:** layout  
**Runtime:** Server Component  
**Exports:** default async  
**Purpose:** This file contributes directly to rendered UI (route surface, reusable component, hook-driven UI behavior, or style config). It defines either a visual building block or logic consumed by visual components in the app shell.
**Public API:**
| name | type | required | default | description |
|---|---|---|---|---|
| props / parameters | inferred from source signature | varies | none | See exported component or hook declaration in this file for exact contract. |
- Events/callbacks (if any): implemented as prop callbacks and local handlers bound to UI interactions in this module.
- External dependencies (Radix/shadcn/forms/state libs): @/components/ui/sidebar, @/components/app-sidebar, @/components/app-header, @/lib/data/db/queries, @/lib/infrastructure/auth/rbac, @/components/providers/permissions-provider, @/features/admin/components/impersonation-banner.
**Internal behavior:**
- State and hooks used: No React/custom hook calls found.
- Data flow: inputs/params/context -> derived values -> conditional JSX/render output -> side effects (navigation, mutations, telemetry, toasts) when triggered.
- UI states: normal + conditional states (loading/empty/error/disabled) as encoded in branch logic within this file.
**Composition:**
- Composes imported primitives and local helpers according to file role (route shell, form/dialog, table part, or utility hook).
- Children/slot behavior follows React composition patterns where applicable.
**Styling:**
- Tailwind utility classes are primary styling mechanism; class composition may use `cn()` and/or variant helpers depending on file.
**Accessibility (A11y):**
- Leverages semantic HTML and Radix accessibility behavior where primitives are used; custom interactive regions require keyboard/ARIA verification.
- Focus management is primarily inherited from dialogs/menus/sheets/popovers and route-level navigation flow.
**Edge cases & pitfalls:**
- Potential pitfalls include hydration boundaries (`use client`), undefined async data, and stale props in memoized callbacks.
- Validate empty/error branches and permission-gated rendering paths for this file during QA.
**Recommended improvements:**
- Add explicit JSDoc/type comments for exported APIs where signatures are complex or implicit.
- Normalize loading/empty/error visual patterns with shared helper components to reduce divergence.
- Add focused a11y tests for keyboard traversal and announced labels in interactive controls used here.
**Testability notes:**
- Unit/interaction tests should assert render branches, callback execution, and disabled/loading/error states for this module.
- For route files, prefer integration tests validating server/client boundary behavior and composed child rendering.

### app/(workspace)/app/page.tsx
**Type:** route page  
**Runtime:** Client Component  
**Exports:** default AppHomePage, default function  
**Purpose:** This file contributes directly to rendered UI (route surface, reusable component, hook-driven UI behavior, or style config). It defines either a visual building block or logic consumed by visual components in the app shell.
**Public API:**
| name | type | required | default | description |
|---|---|---|---|---|
| props / parameters | inferred from source signature | varies | none | See exported component or hook declaration in this file for exact contract. |
- Events/callbacks (if any): implemented as prop callbacks and local handlers bound to UI interactions in this module.
- External dependencies (Radix/shadcn/forms/state libs): @/components/ui/badge, @/components/ui/button, @/lib/utils, react.
**Internal behavior:**
- State and hooks used: No React/custom hook calls found.
- Data flow: inputs/params/context -> derived values -> conditional JSX/render output -> side effects (navigation, mutations, telemetry, toasts) when triggered.
- UI states: normal + conditional states (loading/empty/error/disabled) as encoded in branch logic within this file.
**Composition:**
- Composes imported primitives and local helpers according to file role (route shell, form/dialog, table part, or utility hook).
- Children/slot behavior follows React composition patterns where applicable.
**Styling:**
- Tailwind utility classes are primary styling mechanism; class composition may use `cn()` and/or variant helpers depending on file.
**Accessibility (A11y):**
- Leverages semantic HTML and Radix accessibility behavior where primitives are used; custom interactive regions require keyboard/ARIA verification.
- Focus management is primarily inherited from dialogs/menus/sheets/popovers and route-level navigation flow.
**Edge cases & pitfalls:**
- Potential pitfalls include hydration boundaries (`use client`), undefined async data, and stale props in memoized callbacks.
- Validate empty/error branches and permission-gated rendering paths for this file during QA.
**Recommended improvements:**
- Add explicit JSDoc/type comments for exported APIs where signatures are complex or implicit.
- Normalize loading/empty/error visual patterns with shared helper components to reduce divergence.
- Add focused a11y tests for keyboard traversal and announced labels in interactive controls used here.
**Testability notes:**
- Unit/interaction tests should assert render branches, callback execution, and disabled/loading/error states for this module.
- For route files, prefer integration tests validating server/client boundary behavior and composed child rendering.

### app/(workspace)/app/patterns/page.tsx
**Type:** route page  
**Runtime:** Server Component  
**Exports:** default Page, default function  
**Purpose:** This file contributes directly to rendered UI (route surface, reusable component, hook-driven UI behavior, or style config). It defines either a visual building block or logic consumed by visual components in the app shell.
**Public API:**
| name | type | required | default | description |
|---|---|---|---|---|
| props / parameters | inferred from source signature | varies | none | See exported component or hook declaration in this file for exact contract. |
- Events/callbacks (if any): implemented as prop callbacks and local handlers bound to UI interactions in this module.
- External dependencies (Radix/shadcn/forms/state libs): No external package imports.
**Internal behavior:**
- State and hooks used: No React/custom hook calls found.
- Data flow: inputs/params/context -> derived values -> conditional JSX/render output -> side effects (navigation, mutations, telemetry, toasts) when triggered.
- UI states: normal + conditional states (loading/empty/error/disabled) as encoded in branch logic within this file.
**Composition:**
- Composes imported primitives and local helpers according to file role (route shell, form/dialog, table part, or utility hook).
- Children/slot behavior follows React composition patterns where applicable.
**Styling:**
- Tailwind utility classes are primary styling mechanism; class composition may use `cn()` and/or variant helpers depending on file.
**Accessibility (A11y):**
- Leverages semantic HTML and Radix accessibility behavior where primitives are used; custom interactive regions require keyboard/ARIA verification.
- Focus management is primarily inherited from dialogs/menus/sheets/popovers and route-level navigation flow.
**Edge cases & pitfalls:**
- Potential pitfalls include hydration boundaries (`use client`), undefined async data, and stale props in memoized callbacks.
- Validate empty/error branches and permission-gated rendering paths for this file during QA.
**Recommended improvements:**
- Add explicit JSDoc/type comments for exported APIs where signatures are complex or implicit.
- Normalize loading/empty/error visual patterns with shared helper components to reduce divergence.
- Add focused a11y tests for keyboard traversal and announced labels in interactive controls used here.
**Testability notes:**
- Unit/interaction tests should assert render branches, callback execution, and disabled/loading/error states for this module.
- For route files, prefer integration tests validating server/client boundary behavior and composed child rendering.

### app/(workspace)/app/projects/[projectId]/estimates/[estimateId]/accomplishment/page.tsx
**Type:** route page  
**Runtime:** Server Component  
**Exports:** default Page, default function  
**Purpose:** This file contributes directly to rendered UI (route surface, reusable component, hook-driven UI behavior, or style config). It defines either a visual building block or logic consumed by visual components in the app shell.
**Public API:**
| name | type | required | default | description |
|---|---|---|---|---|
| props / parameters | inferred from source signature | varies | none | See exported component or hook declaration in this file for exact contract. |
- Events/callbacks (if any): implemented as prop callbacks and local handlers bound to UI interactions in this module.
- External dependencies (Radix/shadcn/forms/state libs): No external package imports.
**Internal behavior:**
- State and hooks used: No React/custom hook calls found.
- Data flow: inputs/params/context -> derived values -> conditional JSX/render output -> side effects (navigation, mutations, telemetry, toasts) when triggered.
- UI states: normal + conditional states (loading/empty/error/disabled) as encoded in branch logic within this file.
**Composition:**
- Composes imported primitives and local helpers according to file role (route shell, form/dialog, table part, or utility hook).
- Children/slot behavior follows React composition patterns where applicable.
**Styling:**
- Tailwind utility classes are primary styling mechanism; class composition may use `cn()` and/or variant helpers depending on file.
**Accessibility (A11y):**
- Leverages semantic HTML and Radix accessibility behavior where primitives are used; custom interactive regions require keyboard/ARIA verification.
- Focus management is primarily inherited from dialogs/menus/sheets/popovers and route-level navigation flow.
**Edge cases & pitfalls:**
- Potential pitfalls include hydration boundaries (`use client`), undefined async data, and stale props in memoized callbacks.
- Validate empty/error branches and permission-gated rendering paths for this file during QA.
**Recommended improvements:**
- Add explicit JSDoc/type comments for exported APIs where signatures are complex or implicit.
- Normalize loading/empty/error visual patterns with shared helper components to reduce divergence.
- Add focused a11y tests for keyboard traversal and announced labels in interactive controls used here.
**Testability notes:**
- Unit/interaction tests should assert render branches, callback execution, and disabled/loading/error states for this module.
- For route files, prefer integration tests validating server/client boundary behavior and composed child rendering.

### app/(workspace)/app/projects/[projectId]/estimates/[estimateId]/docs/page.tsx
**Type:** route page  
**Runtime:** Server Component  
**Exports:** default Page, default function  
**Purpose:** This file contributes directly to rendered UI (route surface, reusable component, hook-driven UI behavior, or style config). It defines either a visual building block or logic consumed by visual components in the app shell.
**Public API:**
| name | type | required | default | description |
|---|---|---|---|---|
| props / parameters | inferred from source signature | varies | none | See exported component or hook declaration in this file for exact contract. |
- Events/callbacks (if any): implemented as prop callbacks and local handlers bound to UI interactions in this module.
- External dependencies (Radix/shadcn/forms/state libs): No external package imports.
**Internal behavior:**
- State and hooks used: No React/custom hook calls found.
- Data flow: inputs/params/context -> derived values -> conditional JSX/render output -> side effects (navigation, mutations, telemetry, toasts) when triggered.
- UI states: normal + conditional states (loading/empty/error/disabled) as encoded in branch logic within this file.
**Composition:**
- Composes imported primitives and local helpers according to file role (route shell, form/dialog, table part, or utility hook).
- Children/slot behavior follows React composition patterns where applicable.
**Styling:**
- Tailwind utility classes are primary styling mechanism; class composition may use `cn()` and/or variant helpers depending on file.
**Accessibility (A11y):**
- Leverages semantic HTML and Radix accessibility behavior where primitives are used; custom interactive regions require keyboard/ARIA verification.
- Focus management is primarily inherited from dialogs/menus/sheets/popovers and route-level navigation flow.
**Edge cases & pitfalls:**
- Potential pitfalls include hydration boundaries (`use client`), undefined async data, and stale props in memoized callbacks.
- Validate empty/error branches and permission-gated rendering paths for this file during QA.
**Recommended improvements:**
- Add explicit JSDoc/type comments for exported APIs where signatures are complex or implicit.
- Normalize loading/empty/error visual patterns with shared helper components to reduce divergence.
- Add focused a11y tests for keyboard traversal and announced labels in interactive controls used here.
**Testability notes:**
- Unit/interaction tests should assert render branches, callback execution, and disabled/loading/error states for this module.
- For route files, prefer integration tests validating server/client boundary behavior and composed child rendering.

### app/(workspace)/app/projects/[projectId]/estimates/[estimateId]/layout.tsx
**Type:** layout  
**Runtime:** Server Component  
**Exports:** default EstimateLayout, default function  
**Purpose:** This file contributes directly to rendered UI (route surface, reusable component, hook-driven UI behavior, or style config). It defines either a visual building block or logic consumed by visual components in the app shell.
**Public API:**
| name | type | required | default | description |
|---|---|---|---|---|
| props / parameters | inferred from source signature | varies | none | See exported component or hook declaration in this file for exact contract. |
- Events/callbacks (if any): implemented as prop callbacks and local handlers bound to UI interactions in this module.
- External dependencies (Radix/shadcn/forms/state libs): react.
**Internal behavior:**
- State and hooks used: No React/custom hook calls found.
- Data flow: inputs/params/context -> derived values -> conditional JSX/render output -> side effects (navigation, mutations, telemetry, toasts) when triggered.
- UI states: normal + conditional states (loading/empty/error/disabled) as encoded in branch logic within this file.
**Composition:**
- Composes imported primitives and local helpers according to file role (route shell, form/dialog, table part, or utility hook).
- Children/slot behavior follows React composition patterns where applicable.
**Styling:**
- Tailwind utility classes are primary styling mechanism; class composition may use `cn()` and/or variant helpers depending on file.
**Accessibility (A11y):**
- Leverages semantic HTML and Radix accessibility behavior where primitives are used; custom interactive regions require keyboard/ARIA verification.
- Focus management is primarily inherited from dialogs/menus/sheets/popovers and route-level navigation flow.
**Edge cases & pitfalls:**
- Potential pitfalls include hydration boundaries (`use client`), undefined async data, and stale props in memoized callbacks.
- Validate empty/error branches and permission-gated rendering paths for this file during QA.
**Recommended improvements:**
- Add explicit JSDoc/type comments for exported APIs where signatures are complex or implicit.
- Normalize loading/empty/error visual patterns with shared helper components to reduce divergence.
- Add focused a11y tests for keyboard traversal and announced labels in interactive controls used here.
**Testability notes:**
- Unit/interaction tests should assert render branches, callback execution, and disabled/loading/error states for this module.
- For route files, prefer integration tests validating server/client boundary behavior and composed child rendering.

### app/(workspace)/app/projects/[projectId]/estimates/[estimateId]/page.tsx
**Type:** route page  
**Runtime:** Server Component  
**Exports:** default Page, default function  
**Purpose:** This file contributes directly to rendered UI (route surface, reusable component, hook-driven UI behavior, or style config). It defines either a visual building block or logic consumed by visual components in the app shell.
**Public API:**
| name | type | required | default | description |
|---|---|---|---|---|
| props / parameters | inferred from source signature | varies | none | See exported component or hook declaration in this file for exact contract. |
- Events/callbacks (if any): implemented as prop callbacks and local handlers bound to UI interactions in this module.
- External dependencies (Radix/shadcn/forms/state libs): No external package imports.
**Internal behavior:**
- State and hooks used: No React/custom hook calls found.
- Data flow: inputs/params/context -> derived values -> conditional JSX/render output -> side effects (navigation, mutations, telemetry, toasts) when triggered.
- UI states: normal + conditional states (loading/empty/error/disabled) as encoded in branch logic within this file.
**Composition:**
- Composes imported primitives and local helpers according to file role (route shell, form/dialog, table part, or utility hook).
- Children/slot behavior follows React composition patterns where applicable.
**Styling:**
- Tailwind utility classes are primary styling mechanism; class composition may use `cn()` and/or variant helpers depending on file.
**Accessibility (A11y):**
- Leverages semantic HTML and Radix accessibility behavior where primitives are used; custom interactive regions require keyboard/ARIA verification.
- Focus management is primarily inherited from dialogs/menus/sheets/popovers and route-level navigation flow.
**Edge cases & pitfalls:**
- Potential pitfalls include hydration boundaries (`use client`), undefined async data, and stale props in memoized callbacks.
- Validate empty/error branches and permission-gated rendering paths for this file during QA.
**Recommended improvements:**
- Add explicit JSDoc/type comments for exported APIs where signatures are complex or implicit.
- Normalize loading/empty/error visual patterns with shared helper components to reduce divergence.
- Add focused a11y tests for keyboard traversal and announced labels in interactive controls used here.
**Testability notes:**
- Unit/interaction tests should assert render branches, callback execution, and disabled/loading/error states for this module.
- For route files, prefer integration tests validating server/client boundary behavior and composed child rendering.

### app/(workspace)/app/projects/[projectId]/estimates/[estimateId]/parameters/page.tsx
**Type:** route page  
**Runtime:** Server Component  
**Exports:** default Page, default function  
**Purpose:** This file contributes directly to rendered UI (route surface, reusable component, hook-driven UI behavior, or style config). It defines either a visual building block or logic consumed by visual components in the app shell.
**Public API:**
| name | type | required | default | description |
|---|---|---|---|---|
| props / parameters | inferred from source signature | varies | none | See exported component or hook declaration in this file for exact contract. |
- Events/callbacks (if any): implemented as prop callbacks and local handlers bound to UI interactions in this module.
- External dependencies (Radix/shadcn/forms/state libs): No external package imports.
**Internal behavior:**
- State and hooks used: No React/custom hook calls found.
- Data flow: inputs/params/context -> derived values -> conditional JSX/render output -> side effects (navigation, mutations, telemetry, toasts) when triggered.
- UI states: normal + conditional states (loading/empty/error/disabled) as encoded in branch logic within this file.
**Composition:**
- Composes imported primitives and local helpers according to file role (route shell, form/dialog, table part, or utility hook).
- Children/slot behavior follows React composition patterns where applicable.
**Styling:**
- Tailwind utility classes are primary styling mechanism; class composition may use `cn()` and/or variant helpers depending on file.
**Accessibility (A11y):**
- Leverages semantic HTML and Radix accessibility behavior where primitives are used; custom interactive regions require keyboard/ARIA verification.
- Focus management is primarily inherited from dialogs/menus/sheets/popovers and route-level navigation flow.
**Edge cases & pitfalls:**
- Potential pitfalls include hydration boundaries (`use client`), undefined async data, and stale props in memoized callbacks.
- Validate empty/error branches and permission-gated rendering paths for this file during QA.
**Recommended improvements:**
- Add explicit JSDoc/type comments for exported APIs where signatures are complex or implicit.
- Normalize loading/empty/error visual patterns with shared helper components to reduce divergence.
- Add focused a11y tests for keyboard traversal and announced labels in interactive controls used here.
**Testability notes:**
- Unit/interaction tests should assert render branches, callback execution, and disabled/loading/error states for this module.
- For route files, prefer integration tests validating server/client boundary behavior and composed child rendering.

### app/(workspace)/app/projects/[projectId]/estimates/[estimateId]/purchases/page.tsx
**Type:** route page  
**Runtime:** Server Component  
**Exports:** default Page, default function  
**Purpose:** This file contributes directly to rendered UI (route surface, reusable component, hook-driven UI behavior, or style config). It defines either a visual building block or logic consumed by visual components in the app shell.
**Public API:**
| name | type | required | default | description |
|---|---|---|---|---|
| props / parameters | inferred from source signature | varies | none | See exported component or hook declaration in this file for exact contract. |
- Events/callbacks (if any): implemented as prop callbacks and local handlers bound to UI interactions in this module.
- External dependencies (Radix/shadcn/forms/state libs): No external package imports.
**Internal behavior:**
- State and hooks used: No React/custom hook calls found.
- Data flow: inputs/params/context -> derived values -> conditional JSX/render output -> side effects (navigation, mutations, telemetry, toasts) when triggered.
- UI states: normal + conditional states (loading/empty/error/disabled) as encoded in branch logic within this file.
**Composition:**
- Composes imported primitives and local helpers according to file role (route shell, form/dialog, table part, or utility hook).
- Children/slot behavior follows React composition patterns where applicable.
**Styling:**
- Tailwind utility classes are primary styling mechanism; class composition may use `cn()` and/or variant helpers depending on file.
**Accessibility (A11y):**
- Leverages semantic HTML and Radix accessibility behavior where primitives are used; custom interactive regions require keyboard/ARIA verification.
- Focus management is primarily inherited from dialogs/menus/sheets/popovers and route-level navigation flow.
**Edge cases & pitfalls:**
- Potential pitfalls include hydration boundaries (`use client`), undefined async data, and stale props in memoized callbacks.
- Validate empty/error branches and permission-gated rendering paths for this file during QA.
**Recommended improvements:**
- Add explicit JSDoc/type comments for exported APIs where signatures are complex or implicit.
- Normalize loading/empty/error visual patterns with shared helper components to reduce divergence.
- Add focused a11y tests for keyboard traversal and announced labels in interactive controls used here.
**Testability notes:**
- Unit/interaction tests should assert render branches, callback execution, and disabled/loading/error states for this module.
- For route files, prefer integration tests validating server/client boundary behavior and composed child rendering.

### app/(workspace)/app/projects/[projectId]/layout.tsx
**Type:** layout  
**Runtime:** Server Component  
**Exports:** default ProjectLayout, default function  
**Purpose:** This file contributes directly to rendered UI (route surface, reusable component, hook-driven UI behavior, or style config). It defines either a visual building block or logic consumed by visual components in the app shell.
**Public API:**
| name | type | required | default | description |
|---|---|---|---|---|
| props / parameters | inferred from source signature | varies | none | See exported component or hook declaration in this file for exact contract. |
- Events/callbacks (if any): implemented as prop callbacks and local handlers bound to UI interactions in this module.
- External dependencies (Radix/shadcn/forms/state libs): react.
**Internal behavior:**
- State and hooks used: No React/custom hook calls found.
- Data flow: inputs/params/context -> derived values -> conditional JSX/render output -> side effects (navigation, mutations, telemetry, toasts) when triggered.
- UI states: normal + conditional states (loading/empty/error/disabled) as encoded in branch logic within this file.
**Composition:**
- Composes imported primitives and local helpers according to file role (route shell, form/dialog, table part, or utility hook).
- Children/slot behavior follows React composition patterns where applicable.
**Styling:**
- Tailwind utility classes are primary styling mechanism; class composition may use `cn()` and/or variant helpers depending on file.
**Accessibility (A11y):**
- Leverages semantic HTML and Radix accessibility behavior where primitives are used; custom interactive regions require keyboard/ARIA verification.
- Focus management is primarily inherited from dialogs/menus/sheets/popovers and route-level navigation flow.
**Edge cases & pitfalls:**
- Potential pitfalls include hydration boundaries (`use client`), undefined async data, and stale props in memoized callbacks.
- Validate empty/error branches and permission-gated rendering paths for this file during QA.
**Recommended improvements:**
- Add explicit JSDoc/type comments for exported APIs where signatures are complex or implicit.
- Normalize loading/empty/error visual patterns with shared helper components to reduce divergence.
- Add focused a11y tests for keyboard traversal and announced labels in interactive controls used here.
**Testability notes:**
- Unit/interaction tests should assert render branches, callback execution, and disabled/loading/error states for this module.
- For route files, prefer integration tests validating server/client boundary behavior and composed child rendering.

### app/(workspace)/app/projects/[projectId]/page.tsx
**Type:** route page  
**Runtime:** Server Component  
**Exports:** default Page, default function  
**Purpose:** This file contributes directly to rendered UI (route surface, reusable component, hook-driven UI behavior, or style config). It defines either a visual building block or logic consumed by visual components in the app shell.
**Public API:**
| name | type | required | default | description |
|---|---|---|---|---|
| props / parameters | inferred from source signature | varies | none | See exported component or hook declaration in this file for exact contract. |
- Events/callbacks (if any): implemented as prop callbacks and local handlers bound to UI interactions in this module.
- External dependencies (Radix/shadcn/forms/state libs): No external package imports.
**Internal behavior:**
- State and hooks used: No React/custom hook calls found.
- Data flow: inputs/params/context -> derived values -> conditional JSX/render output -> side effects (navigation, mutations, telemetry, toasts) when triggered.
- UI states: normal + conditional states (loading/empty/error/disabled) as encoded in branch logic within this file.
**Composition:**
- Composes imported primitives and local helpers according to file role (route shell, form/dialog, table part, or utility hook).
- Children/slot behavior follows React composition patterns where applicable.
**Styling:**
- Tailwind utility classes are primary styling mechanism; class composition may use `cn()` and/or variant helpers depending on file.
**Accessibility (A11y):**
- Leverages semantic HTML and Radix accessibility behavior where primitives are used; custom interactive regions require keyboard/ARIA verification.
- Focus management is primarily inherited from dialogs/menus/sheets/popovers and route-level navigation flow.
**Edge cases & pitfalls:**
- Potential pitfalls include hydration boundaries (`use client`), undefined async data, and stale props in memoized callbacks.
- Validate empty/error branches and permission-gated rendering paths for this file during QA.
**Recommended improvements:**
- Add explicit JSDoc/type comments for exported APIs where signatures are complex or implicit.
- Normalize loading/empty/error visual patterns with shared helper components to reduce divergence.
- Add focused a11y tests for keyboard traversal and announced labels in interactive controls used here.
**Testability notes:**
- Unit/interaction tests should assert render branches, callback execution, and disabled/loading/error states for this module.
- For route files, prefer integration tests validating server/client boundary behavior and composed child rendering.

### app/(workspace)/app/projects/page.tsx
**Type:** route page  
**Runtime:** Server Component  
**Exports:** default Page, default function  
**Purpose:** This file contributes directly to rendered UI (route surface, reusable component, hook-driven UI behavior, or style config). It defines either a visual building block or logic consumed by visual components in the app shell.
**Public API:**
| name | type | required | default | description |
|---|---|---|---|---|
| props / parameters | inferred from source signature | varies | none | See exported component or hook declaration in this file for exact contract. |
- Events/callbacks (if any): implemented as prop callbacks and local handlers bound to UI interactions in this module.
- External dependencies (Radix/shadcn/forms/state libs): next/link, @/components/ui/badge, @/components/ui/button, @/components/ui/input, @/components/ui/label, @/components/ui/separator.
**Internal behavior:**
- State and hooks used: No React/custom hook calls found.
- Data flow: inputs/params/context -> derived values -> conditional JSX/render output -> side effects (navigation, mutations, telemetry, toasts) when triggered.
- UI states: normal + conditional states (loading/empty/error/disabled) as encoded in branch logic within this file.
**Composition:**
- Composes imported primitives and local helpers according to file role (route shell, form/dialog, table part, or utility hook).
- Children/slot behavior follows React composition patterns where applicable.
**Styling:**
- Tailwind utility classes are primary styling mechanism; class composition may use `cn()` and/or variant helpers depending on file.
**Accessibility (A11y):**
- Leverages semantic HTML and Radix accessibility behavior where primitives are used; custom interactive regions require keyboard/ARIA verification.
- Focus management is primarily inherited from dialogs/menus/sheets/popovers and route-level navigation flow.
**Edge cases & pitfalls:**
- Potential pitfalls include hydration boundaries (`use client`), undefined async data, and stale props in memoized callbacks.
- Validate empty/error branches and permission-gated rendering paths for this file during QA.
**Recommended improvements:**
- Add explicit JSDoc/type comments for exported APIs where signatures are complex or implicit.
- Normalize loading/empty/error visual patterns with shared helper components to reduce divergence.
- Add focused a11y tests for keyboard traversal and announced labels in interactive controls used here.
**Testability notes:**
- Unit/interaction tests should assert render branches, callback execution, and disabled/loading/error states for this module.
- For route files, prefer integration tests validating server/client boundary behavior and composed child rendering.

### app/(workspace)/app/team/client-page.tsx
**Type:** component  
**Runtime:** Client Component  
**Exports:** default TeamPage, default function  
**Purpose:** This file contributes directly to rendered UI (route surface, reusable component, hook-driven UI behavior, or style config). It defines either a visual building block or logic consumed by visual components in the app shell.
**Public API:**
| name | type | required | default | description |
|---|---|---|---|---|
| props / parameters | inferred from source signature | varies | none | See exported component or hook declaration in this file for exact contract. |
- Events/callbacks (if any): implemented as prop callbacks and local handlers bound to UI interactions in this module.
- External dependencies (Radix/shadcn/forms/state libs): react, swr, @/components/ui/button, @/components/ui/input, @/components/ui/label, @/components/ui/avatar, @/components/ui/badge, lucide-react, @/app/(login)/actions, @/hooks/use-permissions.
**Internal behavior:**
- State and hooks used: useMemo, usePermissions, useSWR, useState.
- Data flow: inputs/params/context -> derived values -> conditional JSX/render output -> side effects (navigation, mutations, telemetry, toasts) when triggered.
- UI states: normal + conditional states (loading/empty/error/disabled) as encoded in branch logic within this file.
**Composition:**
- Composes imported primitives and local helpers according to file role (route shell, form/dialog, table part, or utility hook).
- Children/slot behavior follows React composition patterns where applicable.
**Styling:**
- Tailwind utility classes are primary styling mechanism; class composition may use `cn()` and/or variant helpers depending on file.
**Accessibility (A11y):**
- Leverages semantic HTML and Radix accessibility behavior where primitives are used; custom interactive regions require keyboard/ARIA verification.
- Focus management is primarily inherited from dialogs/menus/sheets/popovers and route-level navigation flow.
**Edge cases & pitfalls:**
- Potential pitfalls include hydration boundaries (`use client`), undefined async data, and stale props in memoized callbacks.
- Validate empty/error branches and permission-gated rendering paths for this file during QA.
**Recommended improvements:**
- Add explicit JSDoc/type comments for exported APIs where signatures are complex or implicit.
- Normalize loading/empty/error visual patterns with shared helper components to reduce divergence.
- Add focused a11y tests for keyboard traversal and announced labels in interactive controls used here.
**Testability notes:**
- Unit/interaction tests should assert render branches, callback execution, and disabled/loading/error states for this module.
- For route files, prefer integration tests validating server/client boundary behavior and composed child rendering.

### app/(workspace)/app/team/page.tsx
**Type:** route page  
**Runtime:** Server Component  
**Exports:** default async  
**Purpose:** This file contributes directly to rendered UI (route surface, reusable component, hook-driven UI behavior, or style config). It defines either a visual building block or logic consumed by visual components in the app shell.
**Public API:**
| name | type | required | default | description |
|---|---|---|---|---|
| props / parameters | inferred from source signature | varies | none | See exported component or hook declaration in this file for exact contract. |
- Events/callbacks (if any): implemented as prop callbacks and local handlers bound to UI interactions in this module.
- External dependencies (Radix/shadcn/forms/state libs): @/lib/infrastructure/auth/access, next/navigation.
**Internal behavior:**
- State and hooks used: No React/custom hook calls found.
- Data flow: inputs/params/context -> derived values -> conditional JSX/render output -> side effects (navigation, mutations, telemetry, toasts) when triggered.
- UI states: normal + conditional states (loading/empty/error/disabled) as encoded in branch logic within this file.
**Composition:**
- Composes imported primitives and local helpers according to file role (route shell, form/dialog, table part, or utility hook).
- Children/slot behavior follows React composition patterns where applicable.
**Styling:**
- Tailwind utility classes are primary styling mechanism; class composition may use `cn()` and/or variant helpers depending on file.
**Accessibility (A11y):**
- Leverages semantic HTML and Radix accessibility behavior where primitives are used; custom interactive regions require keyboard/ARIA verification.
- Focus management is primarily inherited from dialogs/menus/sheets/popovers and route-level navigation flow.
**Edge cases & pitfalls:**
- Potential pitfalls include hydration boundaries (`use client`), undefined async data, and stale props in memoized callbacks.
- Validate empty/error branches and permission-gated rendering paths for this file during QA.
**Recommended improvements:**
- Add explicit JSDoc/type comments for exported APIs where signatures are complex or implicit.
- Normalize loading/empty/error visual patterns with shared helper components to reduce divergence.
- Add focused a11y tests for keyboard traversal and announced labels in interactive controls used here.
**Testability notes:**
- Unit/interaction tests should assert render branches, callback execution, and disabled/loading/error states for this module.
- For route files, prefer integration tests validating server/client boundary behavior and composed child rendering.

### app/api-docs/page.tsx
**Type:** route page  
**Runtime:** Client Component  
**Exports:** default ApiDocsPage, default function  
**Purpose:** This file contributes directly to rendered UI (route surface, reusable component, hook-driven UI behavior, or style config). It defines either a visual building block or logic consumed by visual components in the app shell.
**Public API:**
| name | type | required | default | description |
|---|---|---|---|---|
| props / parameters | inferred from source signature | varies | none | See exported component or hook declaration in this file for exact contract. |
- Events/callbacks (if any): implemented as prop callbacks and local handlers bound to UI interactions in this module.
- External dependencies (Radix/shadcn/forms/state libs): next/dynamic.
**Internal behavior:**
- State and hooks used: No React/custom hook calls found.
- Data flow: inputs/params/context -> derived values -> conditional JSX/render output -> side effects (navigation, mutations, telemetry, toasts) when triggered.
- UI states: normal + conditional states (loading/empty/error/disabled) as encoded in branch logic within this file.
**Composition:**
- Composes imported primitives and local helpers according to file role (route shell, form/dialog, table part, or utility hook).
- Children/slot behavior follows React composition patterns where applicable.
**Styling:**
- Tailwind utility classes are primary styling mechanism; class composition may use `cn()` and/or variant helpers depending on file.
**Accessibility (A11y):**
- Leverages semantic HTML and Radix accessibility behavior where primitives are used; custom interactive regions require keyboard/ARIA verification.
- Focus management is primarily inherited from dialogs/menus/sheets/popovers and route-level navigation flow.
**Edge cases & pitfalls:**
- Potential pitfalls include hydration boundaries (`use client`), undefined async data, and stale props in memoized callbacks.
- Validate empty/error branches and permission-gated rendering paths for this file during QA.
**Recommended improvements:**
- Add explicit JSDoc/type comments for exported APIs where signatures are complex or implicit.
- Normalize loading/empty/error visual patterns with shared helper components to reduce divergence.
- Add focused a11y tests for keyboard traversal and announced labels in interactive controls used here.
**Testability notes:**
- Unit/interaction tests should assert render branches, callback execution, and disabled/loading/error states for this module.
- For route files, prefer integration tests validating server/client boundary behavior and composed child rendering.

### app/global-error.tsx
**Type:** route state UI  
**Runtime:** Client Component  
**Exports:** default GlobalError, default function  
**Purpose:** This file contributes directly to rendered UI (route surface, reusable component, hook-driven UI behavior, or style config). It defines either a visual building block or logic consumed by visual components in the app shell.
**Public API:**
| name | type | required | default | description |
|---|---|---|---|---|
| props / parameters | inferred from source signature | varies | none | See exported component or hook declaration in this file for exact contract. |
- Events/callbacks (if any): implemented as prop callbacks and local handlers bound to UI interactions in this module.
- External dependencies (Radix/shadcn/forms/state libs): @sentry/nextjs, next/error, react.
**Internal behavior:**
- State and hooks used: useEffect.
- Data flow: inputs/params/context -> derived values -> conditional JSX/render output -> side effects (navigation, mutations, telemetry, toasts) when triggered.
- UI states: normal + conditional states (loading/empty/error/disabled) as encoded in branch logic within this file.
**Composition:**
- Composes imported primitives and local helpers according to file role (route shell, form/dialog, table part, or utility hook).
- Children/slot behavior follows React composition patterns where applicable.
**Styling:**
- Tailwind utility classes are primary styling mechanism; class composition may use `cn()` and/or variant helpers depending on file.
**Accessibility (A11y):**
- Leverages semantic HTML and Radix accessibility behavior where primitives are used; custom interactive regions require keyboard/ARIA verification.
- Focus management is primarily inherited from dialogs/menus/sheets/popovers and route-level navigation flow.
**Edge cases & pitfalls:**
- Potential pitfalls include hydration boundaries (`use client`), undefined async data, and stale props in memoized callbacks.
- Validate empty/error branches and permission-gated rendering paths for this file during QA.
**Recommended improvements:**
- Add explicit JSDoc/type comments for exported APIs where signatures are complex or implicit.
- Normalize loading/empty/error visual patterns with shared helper components to reduce divergence.
- Add focused a11y tests for keyboard traversal and announced labels in interactive controls used here.
**Testability notes:**
- Unit/interaction tests should assert render branches, callback execution, and disabled/loading/error states for this module.
- For route files, prefer integration tests validating server/client boundary behavior and composed child rendering.

### app/globals.css
**Type:** style  
**Runtime:** n/a  
**Exports:** No explicit exports detected  
**Purpose:** This file contributes directly to rendered UI (route surface, reusable component, hook-driven UI behavior, or style config). It defines either a visual building block or logic consumed by visual components in the app shell.
**Public API:**
| name | type | required | default | description |
|---|---|---|---|---|
| props / parameters | inferred from source signature | varies | none | See exported component or hook declaration in this file for exact contract. |
- Events/callbacks (if any): implemented as prop callbacks and local handlers bound to UI interactions in this module.
- External dependencies (Radix/shadcn/forms/state libs): No external package imports.
**Internal behavior:**
- State and hooks used: No React/custom hook calls found.
- Data flow: inputs/params/context -> derived values -> conditional JSX/render output -> side effects (navigation, mutations, telemetry, toasts) when triggered.
- UI states: normal + conditional states (loading/empty/error/disabled) as encoded in branch logic within this file.
**Composition:**
- Composes imported primitives and local helpers according to file role (route shell, form/dialog, table part, or utility hook).
- Children/slot behavior follows React composition patterns where applicable.
**Styling:**
- Tailwind utility classes are primary styling mechanism; class composition may use `cn()` and/or variant helpers depending on file.
**Accessibility (A11y):**
- Leverages semantic HTML and Radix accessibility behavior where primitives are used; custom interactive regions require keyboard/ARIA verification.
- Focus management is primarily inherited from dialogs/menus/sheets/popovers and route-level navigation flow.
**Edge cases & pitfalls:**
- Potential pitfalls include hydration boundaries (`use client`), undefined async data, and stale props in memoized callbacks.
- Validate empty/error branches and permission-gated rendering paths for this file during QA.
**Recommended improvements:**
- Add explicit JSDoc/type comments for exported APIs where signatures are complex or implicit.
- Normalize loading/empty/error visual patterns with shared helper components to reduce divergence.
- Add focused a11y tests for keyboard traversal and announced labels in interactive controls used here.
**Testability notes:**
- Unit/interaction tests should assert render branches, callback execution, and disabled/loading/error states for this module.
- For route files, prefer integration tests validating server/client boundary behavior and composed child rendering.

### app/invitations/page.tsx
**Type:** route page  
**Runtime:** Server Component  
**Exports:** default async  
**Purpose:** This file contributes directly to rendered UI (route surface, reusable component, hook-driven UI behavior, or style config). It defines either a visual building block or logic consumed by visual components in the app shell.
**Public API:**
| name | type | required | default | description |
|---|---|---|---|---|
| props / parameters | inferred from source signature | varies | none | See exported component or hook declaration in this file for exact contract. |
- Events/callbacks (if any): implemented as prop callbacks and local handlers bound to UI interactions in this module.
- External dependencies (Radix/shadcn/forms/state libs): next/navigation, @/lib/data/db/drizzle, @/lib/data/db/schema, drizzle-orm, @/lib/data/db/queries.
**Internal behavior:**
- State and hooks used: No React/custom hook calls found.
- Data flow: inputs/params/context -> derived values -> conditional JSX/render output -> side effects (navigation, mutations, telemetry, toasts) when triggered.
- UI states: normal + conditional states (loading/empty/error/disabled) as encoded in branch logic within this file.
**Composition:**
- Composes imported primitives and local helpers according to file role (route shell, form/dialog, table part, or utility hook).
- Children/slot behavior follows React composition patterns where applicable.
**Styling:**
- Tailwind utility classes are primary styling mechanism; class composition may use `cn()` and/or variant helpers depending on file.
**Accessibility (A11y):**
- Leverages semantic HTML and Radix accessibility behavior where primitives are used; custom interactive regions require keyboard/ARIA verification.
- Focus management is primarily inherited from dialogs/menus/sheets/popovers and route-level navigation flow.
**Edge cases & pitfalls:**
- Potential pitfalls include hydration boundaries (`use client`), undefined async data, and stale props in memoized callbacks.
- Validate empty/error branches and permission-gated rendering paths for this file during QA.
**Recommended improvements:**
- Add explicit JSDoc/type comments for exported APIs where signatures are complex or implicit.
- Normalize loading/empty/error visual patterns with shared helper components to reduce divergence.
- Add focused a11y tests for keyboard traversal and announced labels in interactive controls used here.
**Testability notes:**
- Unit/interaction tests should assert render branches, callback execution, and disabled/loading/error states for this module.
- For route files, prefer integration tests validating server/client boundary behavior and composed child rendering.

### app/layout.tsx
**Type:** layout  
**Runtime:** Server Component  
**Exports:** default RootLayout, default function, metadata, viewport  
**Purpose:** This file contributes directly to rendered UI (route surface, reusable component, hook-driven UI behavior, or style config). It defines either a visual building block or logic consumed by visual components in the app shell.
**Public API:**
| name | type | required | default | description |
|---|---|---|---|---|
| props / parameters | inferred from source signature | varies | none | See exported component or hook declaration in this file for exact contract. |
- Events/callbacks (if any): implemented as prop callbacks and local handlers bound to UI interactions in this module.
- External dependencies (Radix/shadcn/forms/state libs): next, @/lib/data/db/queries, @/components/ui/sonner, next/font/google, react, @/components/swr-wrapper, @/components/web-vitals.
**Internal behavior:**
- State and hooks used: No React/custom hook calls found.
- Data flow: inputs/params/context -> derived values -> conditional JSX/render output -> side effects (navigation, mutations, telemetry, toasts) when triggered.
- UI states: normal + conditional states (loading/empty/error/disabled) as encoded in branch logic within this file.
**Composition:**
- Composes imported primitives and local helpers according to file role (route shell, form/dialog, table part, or utility hook).
- Children/slot behavior follows React composition patterns where applicable.
**Styling:**
- Tailwind utility classes are primary styling mechanism; class composition may use `cn()` and/or variant helpers depending on file.
**Accessibility (A11y):**
- Leverages semantic HTML and Radix accessibility behavior where primitives are used; custom interactive regions require keyboard/ARIA verification.
- Focus management is primarily inherited from dialogs/menus/sheets/popovers and route-level navigation flow.
**Edge cases & pitfalls:**
- Potential pitfalls include hydration boundaries (`use client`), undefined async data, and stale props in memoized callbacks.
- Validate empty/error branches and permission-gated rendering paths for this file during QA.
**Recommended improvements:**
- Add explicit JSDoc/type comments for exported APIs where signatures are complex or implicit.
- Normalize loading/empty/error visual patterns with shared helper components to reduce divergence.
- Add focused a11y tests for keyboard traversal and announced labels in interactive controls used here.
**Testability notes:**
- Unit/interaction tests should assert render branches, callback execution, and disabled/loading/error states for this module.
- For route files, prefer integration tests validating server/client boundary behavior and composed child rendering.

### app/not-found.tsx
**Type:** route state UI  
**Runtime:** Server Component  
**Exports:** default NotFound, default function  
**Purpose:** This file contributes directly to rendered UI (route surface, reusable component, hook-driven UI behavior, or style config). It defines either a visual building block or logic consumed by visual components in the app shell.
**Public API:**
| name | type | required | default | description |
|---|---|---|---|---|
| props / parameters | inferred from source signature | varies | none | See exported component or hook declaration in this file for exact contract. |
- Events/callbacks (if any): implemented as prop callbacks and local handlers bound to UI interactions in this module.
- External dependencies (Radix/shadcn/forms/state libs): next/link, lucide-react.
**Internal behavior:**
- State and hooks used: No React/custom hook calls found.
- Data flow: inputs/params/context -> derived values -> conditional JSX/render output -> side effects (navigation, mutations, telemetry, toasts) when triggered.
- UI states: normal + conditional states (loading/empty/error/disabled) as encoded in branch logic within this file.
**Composition:**
- Composes imported primitives and local helpers according to file role (route shell, form/dialog, table part, or utility hook).
- Children/slot behavior follows React composition patterns where applicable.
**Styling:**
- Tailwind utility classes are primary styling mechanism; class composition may use `cn()` and/or variant helpers depending on file.
**Accessibility (A11y):**
- Leverages semantic HTML and Radix accessibility behavior where primitives are used; custom interactive regions require keyboard/ARIA verification.
- Focus management is primarily inherited from dialogs/menus/sheets/popovers and route-level navigation flow.
**Edge cases & pitfalls:**
- Potential pitfalls include hydration boundaries (`use client`), undefined async data, and stale props in memoized callbacks.
- Validate empty/error branches and permission-gated rendering paths for this file during QA.
**Recommended improvements:**
- Add explicit JSDoc/type comments for exported APIs where signatures are complex or implicit.
- Normalize loading/empty/error visual patterns with shared helper components to reduce divergence.
- Add focused a11y tests for keyboard traversal and announced labels in interactive controls used here.
**Testability notes:**
- Unit/interaction tests should assert render branches, callback execution, and disabled/loading/error states for this module.
- For route files, prefer integration tests validating server/client boundary behavior and composed child rendering.

### app/page.tsx
**Type:** route page  
**Runtime:** Server Component  
**Exports:** default LandingPage, default function  
**Purpose:** This file contributes directly to rendered UI (route surface, reusable component, hook-driven UI behavior, or style config). It defines either a visual building block or logic consumed by visual components in the app shell.
**Public API:**
| name | type | required | default | description |
|---|---|---|---|---|
| props / parameters | inferred from source signature | varies | none | See exported component or hook declaration in this file for exact contract. |
- Events/callbacks (if any): implemented as prop callbacks and local handlers bound to UI interactions in this module.
- External dependencies (Radix/shadcn/forms/state libs): next/link, @/components/ui/button.
**Internal behavior:**
- State and hooks used: No React/custom hook calls found.
- Data flow: inputs/params/context -> derived values -> conditional JSX/render output -> side effects (navigation, mutations, telemetry, toasts) when triggered.
- UI states: normal + conditional states (loading/empty/error/disabled) as encoded in branch logic within this file.
**Composition:**
- Composes imported primitives and local helpers according to file role (route shell, form/dialog, table part, or utility hook).
- Children/slot behavior follows React composition patterns where applicable.
**Styling:**
- Tailwind utility classes are primary styling mechanism; class composition may use `cn()` and/or variant helpers depending on file.
**Accessibility (A11y):**
- Leverages semantic HTML and Radix accessibility behavior where primitives are used; custom interactive regions require keyboard/ARIA verification.
- Focus management is primarily inherited from dialogs/menus/sheets/popovers and route-level navigation flow.
**Edge cases & pitfalls:**
- Potential pitfalls include hydration boundaries (`use client`), undefined async data, and stale props in memoized callbacks.
- Validate empty/error branches and permission-gated rendering paths for this file during QA.
**Recommended improvements:**
- Add explicit JSDoc/type comments for exported APIs where signatures are complex or implicit.
- Normalize loading/empty/error visual patterns with shared helper components to reduce divergence.
- Add focused a11y tests for keyboard traversal and announced labels in interactive controls used here.
**Testability notes:**
- Unit/interaction tests should assert render branches, callback execution, and disabled/loading/error states for this module.
- For route files, prefer integration tests validating server/client boundary behavior and composed child rendering.

### components/active-team-indicator.tsx
**Type:** component  
**Runtime:** Client Component  
**Exports:** ActiveTeamIndicator  
**Purpose:** This file contributes directly to rendered UI (route surface, reusable component, hook-driven UI behavior, or style config). It defines either a visual building block or logic consumed by visual components in the app shell.
**Public API:**
| name | type | required | default | description |
|---|---|---|---|---|
| props / parameters | inferred from source signature | varies | none | See exported component or hook declaration in this file for exact contract. |
- Events/callbacks (if any): implemented as prop callbacks and local handlers bound to UI interactions in this module.
- External dependencies (Radix/shadcn/forms/state libs): @/components/ui/badge, @/components/ui/tooltip, @/components/providers/permissions-provider.
**Internal behavior:**
- State and hooks used: useUserContext.
- Data flow: inputs/params/context -> derived values -> conditional JSX/render output -> side effects (navigation, mutations, telemetry, toasts) when triggered.
- UI states: normal + conditional states (loading/empty/error/disabled) as encoded in branch logic within this file.
**Composition:**
- Composes imported primitives and local helpers according to file role (route shell, form/dialog, table part, or utility hook).
- Children/slot behavior follows React composition patterns where applicable.
**Styling:**
- Tailwind utility classes are primary styling mechanism; class composition may use `cn()` and/or variant helpers depending on file.
**Accessibility (A11y):**
- Leverages semantic HTML and Radix accessibility behavior where primitives are used; custom interactive regions require keyboard/ARIA verification.
- Focus management is primarily inherited from dialogs/menus/sheets/popovers and route-level navigation flow.
**Edge cases & pitfalls:**
- Potential pitfalls include hydration boundaries (`use client`), undefined async data, and stale props in memoized callbacks.
- Validate empty/error branches and permission-gated rendering paths for this file during QA.
**Recommended improvements:**
- Add explicit JSDoc/type comments for exported APIs where signatures are complex or implicit.
- Normalize loading/empty/error visual patterns with shared helper components to reduce divergence.
- Add focused a11y tests for keyboard traversal and announced labels in interactive controls used here.
**Testability notes:**
- Unit/interaction tests should assert render branches, callback execution, and disabled/loading/error states for this module.
- For route files, prefer integration tests validating server/client boundary behavior and composed child rendering.

### components/admin-sidebar.tsx
**Type:** component  
**Runtime:** Client Component  
**Exports:** AdminSidebar  
**Purpose:** This file contributes directly to rendered UI (route surface, reusable component, hook-driven UI behavior, or style config). It defines either a visual building block or logic consumed by visual components in the app shell.
**Public API:**
| name | type | required | default | description |
|---|---|---|---|---|
| props / parameters | inferred from source signature | varies | none | See exported component or hook declaration in this file for exact contract. |
- Events/callbacks (if any): implemented as prop callbacks and local handlers bound to UI interactions in this module.
- External dependencies (Radix/shadcn/forms/state libs): next/link, next/navigation, @/lib/data/db/schema.
**Internal behavior:**
- State and hooks used: usePathname.
- Data flow: inputs/params/context -> derived values -> conditional JSX/render output -> side effects (navigation, mutations, telemetry, toasts) when triggered.
- UI states: normal + conditional states (loading/empty/error/disabled) as encoded in branch logic within this file.
**Composition:**
- Composes imported primitives and local helpers according to file role (route shell, form/dialog, table part, or utility hook).
- Children/slot behavior follows React composition patterns where applicable.
**Styling:**
- Tailwind utility classes are primary styling mechanism; class composition may use `cn()` and/or variant helpers depending on file.
**Accessibility (A11y):**
- Leverages semantic HTML and Radix accessibility behavior where primitives are used; custom interactive regions require keyboard/ARIA verification.
- Focus management is primarily inherited from dialogs/menus/sheets/popovers and route-level navigation flow.
**Edge cases & pitfalls:**
- Potential pitfalls include hydration boundaries (`use client`), undefined async data, and stale props in memoized callbacks.
- Validate empty/error branches and permission-gated rendering paths for this file during QA.
**Recommended improvements:**
- Add explicit JSDoc/type comments for exported APIs where signatures are complex or implicit.
- Normalize loading/empty/error visual patterns with shared helper components to reduce divergence.
- Add focused a11y tests for keyboard traversal and announced labels in interactive controls used here.
**Testability notes:**
- Unit/interaction tests should assert render branches, callback execution, and disabled/loading/error states for this module.
- For route files, prefer integration tests validating server/client boundary behavior and composed child rendering.

### components/admin/impersonate-button.tsx
**Type:** component  
**Runtime:** Client Component  
**Exports:** ImpersonateButton  
**Purpose:** This file contributes directly to rendered UI (route surface, reusable component, hook-driven UI behavior, or style config). It defines either a visual building block or logic consumed by visual components in the app shell.
**Public API:**
| name | type | required | default | description |
|---|---|---|---|---|
| props / parameters | inferred from source signature | varies | none | See exported component or hook declaration in this file for exact contract. |
- Events/callbacks (if any): implemented as prop callbacks and local handlers bound to UI interactions in this module.
- External dependencies (Radix/shadcn/forms/state libs): react, @/components/ui/button, @/app/actions/admin/impersonation, lucide-react, sonner, @/lib/infrastructure/auth/middleware.
**Internal behavior:**
- State and hooks used: useActionState, useEffect.
- Data flow: inputs/params/context -> derived values -> conditional JSX/render output -> side effects (navigation, mutations, telemetry, toasts) when triggered.
- UI states: normal + conditional states (loading/empty/error/disabled) as encoded in branch logic within this file.
**Composition:**
- Composes imported primitives and local helpers according to file role (route shell, form/dialog, table part, or utility hook).
- Children/slot behavior follows React composition patterns where applicable.
**Styling:**
- Tailwind utility classes are primary styling mechanism; class composition may use `cn()` and/or variant helpers depending on file.
**Accessibility (A11y):**
- Leverages semantic HTML and Radix accessibility behavior where primitives are used; custom interactive regions require keyboard/ARIA verification.
- Focus management is primarily inherited from dialogs/menus/sheets/popovers and route-level navigation flow.
**Edge cases & pitfalls:**
- Potential pitfalls include hydration boundaries (`use client`), undefined async data, and stale props in memoized callbacks.
- Validate empty/error branches and permission-gated rendering paths for this file during QA.
**Recommended improvements:**
- Add explicit JSDoc/type comments for exported APIs where signatures are complex or implicit.
- Normalize loading/empty/error visual patterns with shared helper components to reduce divergence.
- Add focused a11y tests for keyboard traversal and announced labels in interactive controls used here.
**Testability notes:**
- Unit/interaction tests should assert render branches, callback execution, and disabled/loading/error states for this module.
- For route files, prefer integration tests validating server/client boundary behavior and composed child rendering.

### components/admin/impersonation-banner.tsx
**Type:** component  
**Runtime:** Server Component  
**Exports:** No explicit exports detected  
**Purpose:** This file contributes directly to rendered UI (route surface, reusable component, hook-driven UI behavior, or style config). It defines either a visual building block or logic consumed by visual components in the app shell.
**Public API:**
| name | type | required | default | description |
|---|---|---|---|---|
| props / parameters | inferred from source signature | varies | none | See exported component or hook declaration in this file for exact contract. |
- Events/callbacks (if any): implemented as prop callbacks and local handlers bound to UI interactions in this module.
- External dependencies (Radix/shadcn/forms/state libs): next/headers, @/lib/data/db/drizzle, @/lib/data/db/schema, drizzle-orm, lucide-react.
**Internal behavior:**
- State and hooks used: No React/custom hook calls found.
- Data flow: inputs/params/context -> derived values -> conditional JSX/render output -> side effects (navigation, mutations, telemetry, toasts) when triggered.
- UI states: normal + conditional states (loading/empty/error/disabled) as encoded in branch logic within this file.
**Composition:**
- Composes imported primitives and local helpers according to file role (route shell, form/dialog, table part, or utility hook).
- Children/slot behavior follows React composition patterns where applicable.
**Styling:**
- Tailwind utility classes are primary styling mechanism; class composition may use `cn()` and/or variant helpers depending on file.
**Accessibility (A11y):**
- Leverages semantic HTML and Radix accessibility behavior where primitives are used; custom interactive regions require keyboard/ARIA verification.
- Focus management is primarily inherited from dialogs/menus/sheets/popovers and route-level navigation flow.
**Edge cases & pitfalls:**
- Potential pitfalls include hydration boundaries (`use client`), undefined async data, and stale props in memoized callbacks.
- Validate empty/error branches and permission-gated rendering paths for this file during QA.
**Recommended improvements:**
- Add explicit JSDoc/type comments for exported APIs where signatures are complex or implicit.
- Normalize loading/empty/error visual patterns with shared helper components to reduce divergence.
- Add focused a11y tests for keyboard traversal and announced labels in interactive controls used here.
**Testability notes:**
- Unit/interaction tests should assert render branches, callback execution, and disabled/loading/error states for this module.
- For route files, prefer integration tests validating server/client boundary behavior and composed child rendering.

### components/admin/stop-impersonation-button.tsx
**Type:** component  
**Runtime:** Client Component  
**Exports:** StopImpersonationButton  
**Purpose:** This file contributes directly to rendered UI (route surface, reusable component, hook-driven UI behavior, or style config). It defines either a visual building block or logic consumed by visual components in the app shell.
**Public API:**
| name | type | required | default | description |
|---|---|---|---|---|
| props / parameters | inferred from source signature | varies | none | See exported component or hook declaration in this file for exact contract. |
- Events/callbacks (if any): implemented as prop callbacks and local handlers bound to UI interactions in this module.
- External dependencies (Radix/shadcn/forms/state libs): react, @/components/ui/button, @/app/actions/admin/impersonation, lucide-react, sonner, next/navigation.
**Internal behavior:**
- State and hooks used: useRouter, useTransition.
- Data flow: inputs/params/context -> derived values -> conditional JSX/render output -> side effects (navigation, mutations, telemetry, toasts) when triggered.
- UI states: normal + conditional states (loading/empty/error/disabled) as encoded in branch logic within this file.
**Composition:**
- Composes imported primitives and local helpers according to file role (route shell, form/dialog, table part, or utility hook).
- Children/slot behavior follows React composition patterns where applicable.
**Styling:**
- Tailwind utility classes are primary styling mechanism; class composition may use `cn()` and/or variant helpers depending on file.
**Accessibility (A11y):**
- Leverages semantic HTML and Radix accessibility behavior where primitives are used; custom interactive regions require keyboard/ARIA verification.
- Focus management is primarily inherited from dialogs/menus/sheets/popovers and route-level navigation flow.
**Edge cases & pitfalls:**
- Potential pitfalls include hydration boundaries (`use client`), undefined async data, and stale props in memoized callbacks.
- Validate empty/error branches and permission-gated rendering paths for this file during QA.
**Recommended improvements:**
- Add explicit JSDoc/type comments for exported APIs where signatures are complex or implicit.
- Normalize loading/empty/error visual patterns with shared helper components to reduce divergence.
- Add focused a11y tests for keyboard traversal and announced labels in interactive controls used here.
**Testability notes:**
- Unit/interaction tests should assert render branches, callback execution, and disabled/loading/error states for this module.
- For route files, prefer integration tests validating server/client boundary behavior and composed child rendering.

### components/app-header.tsx
**Type:** component  
**Runtime:** Client Component  
**Exports:** AppHeader  
**Purpose:** This file contributes directly to rendered UI (route surface, reusable component, hook-driven UI behavior, or style config). It defines either a visual building block or logic consumed by visual components in the app shell.
**Public API:**
| name | type | required | default | description |
|---|---|---|---|---|
| props / parameters | inferred from source signature | varies | none | See exported component or hook declaration in this file for exact contract. |
- Events/callbacks (if any): implemented as prop callbacks and local handlers bound to UI interactions in this module.
- External dependencies (Radix/shadcn/forms/state libs): @/components/ui/sidebar, @/components/ui/separator, @/hooks/use-page-title, @/features/notifications/components/notification-bell, @/components/user-menu, @/components/active-team-indicator.
**Internal behavior:**
- State and hooks used: usePageTitle.
- Data flow: inputs/params/context -> derived values -> conditional JSX/render output -> side effects (navigation, mutations, telemetry, toasts) when triggered.
- UI states: normal + conditional states (loading/empty/error/disabled) as encoded in branch logic within this file.
**Composition:**
- Composes imported primitives and local helpers according to file role (route shell, form/dialog, table part, or utility hook).
- Children/slot behavior follows React composition patterns where applicable.
**Styling:**
- Tailwind utility classes are primary styling mechanism; class composition may use `cn()` and/or variant helpers depending on file.
**Accessibility (A11y):**
- Leverages semantic HTML and Radix accessibility behavior where primitives are used; custom interactive regions require keyboard/ARIA verification.
- Focus management is primarily inherited from dialogs/menus/sheets/popovers and route-level navigation flow.
**Edge cases & pitfalls:**
- Potential pitfalls include hydration boundaries (`use client`), undefined async data, and stale props in memoized callbacks.
- Validate empty/error branches and permission-gated rendering paths for this file during QA.
**Recommended improvements:**
- Add explicit JSDoc/type comments for exported APIs where signatures are complex or implicit.
- Normalize loading/empty/error visual patterns with shared helper components to reduce divergence.
- Add focused a11y tests for keyboard traversal and announced labels in interactive controls used here.
**Testability notes:**
- Unit/interaction tests should assert render branches, callback execution, and disabled/loading/error states for this module.
- For route files, prefer integration tests validating server/client boundary behavior and composed child rendering.

### components/app-sidebar.tsx
**Type:** component  
**Runtime:** Client Component  
**Exports:** AppSidebar  
**Purpose:** This file contributes directly to rendered UI (route surface, reusable component, hook-driven UI behavior, or style config). It defines either a visual building block or logic consumed by visual components in the app shell.
**Public API:**
| name | type | required | default | description |
|---|---|---|---|---|
| props / parameters | inferred from source signature | varies | none | See exported component or hook declaration in this file for exact contract. |
- Events/callbacks (if any): implemented as prop callbacks and local handlers bound to UI interactions in this module.
- External dependencies (Radix/shadcn/forms/state libs): next/link, next/navigation, @/hooks/use-permissions.
**Internal behavior:**
- State and hooks used: usePathname, usePermissions.
- Data flow: inputs/params/context -> derived values -> conditional JSX/render output -> side effects (navigation, mutations, telemetry, toasts) when triggered.
- UI states: normal + conditional states (loading/empty/error/disabled) as encoded in branch logic within this file.
**Composition:**
- Composes imported primitives and local helpers according to file role (route shell, form/dialog, table part, or utility hook).
- Children/slot behavior follows React composition patterns where applicable.
**Styling:**
- Tailwind utility classes are primary styling mechanism; class composition may use `cn()` and/or variant helpers depending on file.
**Accessibility (A11y):**
- Leverages semantic HTML and Radix accessibility behavior where primitives are used; custom interactive regions require keyboard/ARIA verification.
- Focus management is primarily inherited from dialogs/menus/sheets/popovers and route-level navigation flow.
**Edge cases & pitfalls:**
- Potential pitfalls include hydration boundaries (`use client`), undefined async data, and stale props in memoized callbacks.
- Validate empty/error branches and permission-gated rendering paths for this file during QA.
**Recommended improvements:**
- Add explicit JSDoc/type comments for exported APIs where signatures are complex or implicit.
- Normalize loading/empty/error visual patterns with shared helper components to reduce divergence.
- Add focused a11y tests for keyboard traversal and announced labels in interactive controls used here.
**Testability notes:**
- Unit/interaction tests should assert render branches, callback execution, and disabled/loading/error states for this module.
- For route files, prefer integration tests validating server/client boundary behavior and composed child rendering.

### components/notification-bell.tsx
**Type:** component  
**Runtime:** Client Component  
**Exports:** NotificationBell  
**Purpose:** This file contributes directly to rendered UI (route surface, reusable component, hook-driven UI behavior, or style config). It defines either a visual building block or logic consumed by visual components in the app shell.
**Public API:**
| name | type | required | default | description |
|---|---|---|---|---|
| props / parameters | inferred from source signature | varies | none | See exported component or hook declaration in this file for exact contract. |
- Events/callbacks (if any): implemented as prop callbacks and local handlers bound to UI interactions in this module.
- External dependencies (Radix/shadcn/forms/state libs): lucide-react, @/components/ui/button, @/components/ui/badge, swr, react, @/features/notifications/components/notifications-list, @/features/notifications/components/types.
**Internal behavior:**
- State and hooks used: useEffect, useSWR, useState.
- Data flow: inputs/params/context -> derived values -> conditional JSX/render output -> side effects (navigation, mutations, telemetry, toasts) when triggered.
- UI states: normal + conditional states (loading/empty/error/disabled) as encoded in branch logic within this file.
**Composition:**
- Composes imported primitives and local helpers according to file role (route shell, form/dialog, table part, or utility hook).
- Children/slot behavior follows React composition patterns where applicable.
**Styling:**
- Tailwind utility classes are primary styling mechanism; class composition may use `cn()` and/or variant helpers depending on file.
**Accessibility (A11y):**
- Leverages semantic HTML and Radix accessibility behavior where primitives are used; custom interactive regions require keyboard/ARIA verification.
- Focus management is primarily inherited from dialogs/menus/sheets/popovers and route-level navigation flow.
**Edge cases & pitfalls:**
- Potential pitfalls include hydration boundaries (`use client`), undefined async data, and stale props in memoized callbacks.
- Validate empty/error branches and permission-gated rendering paths for this file during QA.
**Recommended improvements:**
- Add explicit JSDoc/type comments for exported APIs where signatures are complex or implicit.
- Normalize loading/empty/error visual patterns with shared helper components to reduce divergence.
- Add focused a11y tests for keyboard traversal and announced labels in interactive controls used here.
**Testability notes:**
- Unit/interaction tests should assert render branches, callback execution, and disabled/loading/error states for this module.
- For route files, prefer integration tests validating server/client boundary behavior and composed child rendering.

### components/notifications/notification-item.tsx
**Type:** component  
**Runtime:** Server Component  
**Exports:** NotificationItem  
**Purpose:** This file contributes directly to rendered UI (route surface, reusable component, hook-driven UI behavior, or style config). It defines either a visual building block or logic consumed by visual components in the app shell.
**Public API:**
| name | type | required | default | description |
|---|---|---|---|---|
| props / parameters | inferred from source signature | varies | none | See exported component or hook declaration in this file for exact contract. |
- Events/callbacks (if any): implemented as prop callbacks and local handlers bound to UI interactions in this module.
- External dependencies (Radix/shadcn/forms/state libs): @/components/ui/badge, @/components/ui/button, @/lib/utils, @/features/notifications/components/types.
**Internal behavior:**
- State and hooks used: No React/custom hook calls found.
- Data flow: inputs/params/context -> derived values -> conditional JSX/render output -> side effects (navigation, mutations, telemetry, toasts) when triggered.
- UI states: normal + conditional states (loading/empty/error/disabled) as encoded in branch logic within this file.
**Composition:**
- Composes imported primitives and local helpers according to file role (route shell, form/dialog, table part, or utility hook).
- Children/slot behavior follows React composition patterns where applicable.
**Styling:**
- Tailwind utility classes are primary styling mechanism; class composition may use `cn()` and/or variant helpers depending on file.
**Accessibility (A11y):**
- Leverages semantic HTML and Radix accessibility behavior where primitives are used; custom interactive regions require keyboard/ARIA verification.
- Focus management is primarily inherited from dialogs/menus/sheets/popovers and route-level navigation flow.
**Edge cases & pitfalls:**
- Potential pitfalls include hydration boundaries (`use client`), undefined async data, and stale props in memoized callbacks.
- Validate empty/error branches and permission-gated rendering paths for this file during QA.
**Recommended improvements:**
- Add explicit JSDoc/type comments for exported APIs where signatures are complex or implicit.
- Normalize loading/empty/error visual patterns with shared helper components to reduce divergence.
- Add focused a11y tests for keyboard traversal and announced labels in interactive controls used here.
**Testability notes:**
- Unit/interaction tests should assert render branches, callback execution, and disabled/loading/error states for this module.
- For route files, prefer integration tests validating server/client boundary behavior and composed child rendering.

### components/notifications/notifications-list.tsx
**Type:** component  
**Runtime:** Server Component  
**Exports:** NotificationsList  
**Purpose:** This file contributes directly to rendered UI (route surface, reusable component, hook-driven UI behavior, or style config). It defines either a visual building block or logic consumed by visual components in the app shell.
**Public API:**
| name | type | required | default | description |
|---|---|---|---|---|
| props / parameters | inferred from source signature | varies | none | See exported component or hook declaration in this file for exact contract. |
- Events/callbacks (if any): implemented as prop callbacks and local handlers bound to UI interactions in this module.
- External dependencies (Radix/shadcn/forms/state libs): lucide-react, @/features/notifications/components/notification-item, @/features/notifications/components/types, @/components/ui/loading-indicator, @/components/ui/scroll-area, @/lib/utils.
**Internal behavior:**
- State and hooks used: No React/custom hook calls found.
- Data flow: inputs/params/context -> derived values -> conditional JSX/render output -> side effects (navigation, mutations, telemetry, toasts) when triggered.
- UI states: normal + conditional states (loading/empty/error/disabled) as encoded in branch logic within this file.
**Composition:**
- Composes imported primitives and local helpers according to file role (route shell, form/dialog, table part, or utility hook).
- Children/slot behavior follows React composition patterns where applicable.
**Styling:**
- Tailwind utility classes are primary styling mechanism; class composition may use `cn()` and/or variant helpers depending on file.
**Accessibility (A11y):**
- Leverages semantic HTML and Radix accessibility behavior where primitives are used; custom interactive regions require keyboard/ARIA verification.
- Focus management is primarily inherited from dialogs/menus/sheets/popovers and route-level navigation flow.
**Edge cases & pitfalls:**
- Potential pitfalls include hydration boundaries (`use client`), undefined async data, and stale props in memoized callbacks.
- Validate empty/error branches and permission-gated rendering paths for this file during QA.
**Recommended improvements:**
- Add explicit JSDoc/type comments for exported APIs where signatures are complex or implicit.
- Normalize loading/empty/error visual patterns with shared helper components to reduce divergence.
- Add focused a11y tests for keyboard traversal and announced labels in interactive controls used here.
**Testability notes:**
- Unit/interaction tests should assert render branches, callback execution, and disabled/loading/error states for this module.
- For route files, prefer integration tests validating server/client boundary behavior and composed child rendering.

### components/notifications/types.ts
**Type:** utility  
**Runtime:** n/a  
**Exports:** NotificationPayload  
**Purpose:** This file contributes directly to rendered UI (route surface, reusable component, hook-driven UI behavior, or style config). It defines either a visual building block or logic consumed by visual components in the app shell.
**Public API:**
| name | type | required | default | description |
|---|---|---|---|---|
| props / parameters | inferred from source signature | varies | none | See exported component or hook declaration in this file for exact contract. |
- Events/callbacks (if any): implemented as prop callbacks and local handlers bound to UI interactions in this module.
- External dependencies (Radix/shadcn/forms/state libs): No external package imports.
**Internal behavior:**
- State and hooks used: No React/custom hook calls found.
- Data flow: inputs/params/context -> derived values -> conditional JSX/render output -> side effects (navigation, mutations, telemetry, toasts) when triggered.
- UI states: normal + conditional states (loading/empty/error/disabled) as encoded in branch logic within this file.
**Composition:**
- Composes imported primitives and local helpers according to file role (route shell, form/dialog, table part, or utility hook).
- Children/slot behavior follows React composition patterns where applicable.
**Styling:**
- Tailwind utility classes are primary styling mechanism; class composition may use `cn()` and/or variant helpers depending on file.
**Accessibility (A11y):**
- Leverages semantic HTML and Radix accessibility behavior where primitives are used; custom interactive regions require keyboard/ARIA verification.
- Focus management is primarily inherited from dialogs/menus/sheets/popovers and route-level navigation flow.
**Edge cases & pitfalls:**
- Potential pitfalls include hydration boundaries (`use client`), undefined async data, and stale props in memoized callbacks.
- Validate empty/error branches and permission-gated rendering paths for this file during QA.
**Recommended improvements:**
- Add explicit JSDoc/type comments for exported APIs where signatures are complex or implicit.
- Normalize loading/empty/error visual patterns with shared helper components to reduce divergence.
- Add focused a11y tests for keyboard traversal and announced labels in interactive controls used here.
**Testability notes:**
- Unit/interaction tests should assert render branches, callback execution, and disabled/loading/error states for this module.
- For route files, prefer integration tests validating server/client boundary behavior and composed child rendering.

### components/permissions-matrix.tsx
**Type:** component  
**Runtime:** Client Component  
**Exports:** PermissionsMatrix  
**Purpose:** This file contributes directly to rendered UI (route surface, reusable component, hook-driven UI behavior, or style config). It defines either a visual building block or logic consumed by visual components in the app shell.
**Public API:**
| name | type | required | default | description |
|---|---|---|---|---|
| props / parameters | inferred from source signature | varies | none | See exported component or hook declaration in this file for exact contract. |
- Events/callbacks (if any): implemented as prop callbacks and local handlers bound to UI interactions in this module.
- External dependencies (Radix/shadcn/forms/state libs): react, @/components/ui/badge, @/components/ui/tabs, @/components/ui/skeleton, lucide-react, @/components/ui/tooltip.
**Internal behavior:**
- State and hooks used: useEffect, useState.
- Data flow: inputs/params/context -> derived values -> conditional JSX/render output -> side effects (navigation, mutations, telemetry, toasts) when triggered.
- UI states: normal + conditional states (loading/empty/error/disabled) as encoded in branch logic within this file.
**Composition:**
- Composes imported primitives and local helpers according to file role (route shell, form/dialog, table part, or utility hook).
- Children/slot behavior follows React composition patterns where applicable.
**Styling:**
- Tailwind utility classes are primary styling mechanism; class composition may use `cn()` and/or variant helpers depending on file.
**Accessibility (A11y):**
- Leverages semantic HTML and Radix accessibility behavior where primitives are used; custom interactive regions require keyboard/ARIA verification.
- Focus management is primarily inherited from dialogs/menus/sheets/popovers and route-level navigation flow.
**Edge cases & pitfalls:**
- Potential pitfalls include hydration boundaries (`use client`), undefined async data, and stale props in memoized callbacks.
- Validate empty/error branches and permission-gated rendering paths for this file during QA.
**Recommended improvements:**
- Add explicit JSDoc/type comments for exported APIs where signatures are complex or implicit.
- Normalize loading/empty/error visual patterns with shared helper components to reduce divergence.
- Add focused a11y tests for keyboard traversal and announced labels in interactive controls used here.
**Testability notes:**
- Unit/interaction tests should assert render branches, callback execution, and disabled/loading/error states for this module.
- For route files, prefer integration tests validating server/client boundary behavior and composed child rendering.

### components/permissions-provider.tsx
**Type:** component  
**Runtime:** Client Component  
**Exports:** PermissionEntry, UserProvider, usePermissionsContext, useUserContext  
**Purpose:** This file contributes directly to rendered UI (route surface, reusable component, hook-driven UI behavior, or style config). It defines either a visual building block or logic consumed by visual components in the app shell.
**Public API:**
| name | type | required | default | description |
|---|---|---|---|---|
| props / parameters | inferred from source signature | varies | none | See exported component or hook declaration in this file for exact contract. |
- Events/callbacks (if any): implemented as prop callbacks and local handlers bound to UI interactions in this module.
- External dependencies (Radix/shadcn/forms/state libs): react, @/lib/data/db/schema.
**Internal behavior:**
- State and hooks used: useContext, usePermissionsContext, useUserContext.
- Data flow: inputs/params/context -> derived values -> conditional JSX/render output -> side effects (navigation, mutations, telemetry, toasts) when triggered.
- UI states: normal + conditional states (loading/empty/error/disabled) as encoded in branch logic within this file.
**Composition:**
- Composes imported primitives and local helpers according to file role (route shell, form/dialog, table part, or utility hook).
- Children/slot behavior follows React composition patterns where applicable.
**Styling:**
- Tailwind utility classes are primary styling mechanism; class composition may use `cn()` and/or variant helpers depending on file.
**Accessibility (A11y):**
- Leverages semantic HTML and Radix accessibility behavior where primitives are used; custom interactive regions require keyboard/ARIA verification.
- Focus management is primarily inherited from dialogs/menus/sheets/popovers and route-level navigation flow.
**Edge cases & pitfalls:**
- Potential pitfalls include hydration boundaries (`use client`), undefined async data, and stale props in memoized callbacks.
- Validate empty/error branches and permission-gated rendering paths for this file during QA.
**Recommended improvements:**
- Add explicit JSDoc/type comments for exported APIs where signatures are complex or implicit.
- Normalize loading/empty/error visual patterns with shared helper components to reduce divergence.
- Add focused a11y tests for keyboard traversal and announced labels in interactive controls used here.
**Testability notes:**
- Unit/interaction tests should assert render branches, callback execution, and disabled/loading/error states for this module.
- For route files, prefer integration tests validating server/client boundary behavior and composed child rendering.

### components/swr-wrapper.tsx
**Type:** component  
**Runtime:** Client Component  
**Exports:** SWRWrapper  
**Purpose:** This file contributes directly to rendered UI (route surface, reusable component, hook-driven UI behavior, or style config). It defines either a visual building block or logic consumed by visual components in the app shell.
**Public API:**
| name | type | required | default | description |
|---|---|---|---|---|
| props / parameters | inferred from source signature | varies | none | See exported component or hook declaration in this file for exact contract. |
- Events/callbacks (if any): implemented as prop callbacks and local handlers bound to UI interactions in this module.
- External dependencies (Radix/shadcn/forms/state libs): swr, react, @/lib/data/db/schema.
**Internal behavior:**
- State and hooks used: No React/custom hook calls found.
- Data flow: inputs/params/context -> derived values -> conditional JSX/render output -> side effects (navigation, mutations, telemetry, toasts) when triggered.
- UI states: normal + conditional states (loading/empty/error/disabled) as encoded in branch logic within this file.
**Composition:**
- Composes imported primitives and local helpers according to file role (route shell, form/dialog, table part, or utility hook).
- Children/slot behavior follows React composition patterns where applicable.
**Styling:**
- Tailwind utility classes are primary styling mechanism; class composition may use `cn()` and/or variant helpers depending on file.
**Accessibility (A11y):**
- Leverages semantic HTML and Radix accessibility behavior where primitives are used; custom interactive regions require keyboard/ARIA verification.
- Focus management is primarily inherited from dialogs/menus/sheets/popovers and route-level navigation flow.
**Edge cases & pitfalls:**
- Potential pitfalls include hydration boundaries (`use client`), undefined async data, and stale props in memoized callbacks.
- Validate empty/error branches and permission-gated rendering paths for this file during QA.
**Recommended improvements:**
- Add explicit JSDoc/type comments for exported APIs where signatures are complex or implicit.
- Normalize loading/empty/error visual patterns with shared helper components to reduce divergence.
- Add focused a11y tests for keyboard traversal and announced labels in interactive controls used here.
**Testability notes:**
- Unit/interaction tests should assert render branches, callback execution, and disabled/loading/error states for this module.
- For route files, prefer integration tests validating server/client boundary behavior and composed child rendering.

### components/ui/alert-dialog.tsx
**Type:** ui primitive  
**Runtime:** Client Component  
**Exports:** AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogMedia, AlertDialogOverlay, AlertDialogPortal, AlertDialogTitle, AlertDialogTrigger  
**Purpose:** This file contributes directly to rendered UI (route surface, reusable component, hook-driven UI behavior, or style config). It defines either a visual building block or logic consumed by visual components in the app shell.
**Public API:**
| name | type | required | default | description |
|---|---|---|---|---|
| props / parameters | inferred from source signature | varies | none | See exported component or hook declaration in this file for exact contract. |
- Events/callbacks (if any): implemented as prop callbacks and local handlers bound to UI interactions in this module.
- External dependencies (Radix/shadcn/forms/state libs): react, @radix-ui/react-alert-dialog, @/lib/utils, @/components/ui/button.
**Internal behavior:**
- State and hooks used: No React/custom hook calls found.
- Data flow: inputs/params/context -> derived values -> conditional JSX/render output -> side effects (navigation, mutations, telemetry, toasts) when triggered.
- UI states: normal + conditional states (loading/empty/error/disabled) as encoded in branch logic within this file.
**Composition:**
- Composes imported primitives and local helpers according to file role (route shell, form/dialog, table part, or utility hook).
- Children/slot behavior follows React composition patterns where applicable.
**Styling:**
- Tailwind utility classes are primary styling mechanism; class composition may use `cn()` and/or variant helpers depending on file.
**Accessibility (A11y):**
- Leverages semantic HTML and Radix accessibility behavior where primitives are used; custom interactive regions require keyboard/ARIA verification.
- Focus management is primarily inherited from dialogs/menus/sheets/popovers and route-level navigation flow.
**Edge cases & pitfalls:**
- Potential pitfalls include hydration boundaries (`use client`), undefined async data, and stale props in memoized callbacks.
- Validate empty/error branches and permission-gated rendering paths for this file during QA.
**Recommended improvements:**
- Add explicit JSDoc/type comments for exported APIs where signatures are complex or implicit.
- Normalize loading/empty/error visual patterns with shared helper components to reduce divergence.
- Add focused a11y tests for keyboard traversal and announced labels in interactive controls used here.
**Testability notes:**
- Unit/interaction tests should assert render branches, callback execution, and disabled/loading/error states for this module.
- For route files, prefer integration tests validating server/client boundary behavior and composed child rendering.

### components/ui/avatar.tsx
**Type:** ui primitive  
**Runtime:** Client Component  
**Exports:** Avatar, AvatarImage, AvatarFallback  
**Purpose:** This file contributes directly to rendered UI (route surface, reusable component, hook-driven UI behavior, or style config). It defines either a visual building block or logic consumed by visual components in the app shell.
**Public API:**
| name | type | required | default | description |
|---|---|---|---|---|
| props / parameters | inferred from source signature | varies | none | See exported component or hook declaration in this file for exact contract. |
- Events/callbacks (if any): implemented as prop callbacks and local handlers bound to UI interactions in this module.
- External dependencies (Radix/shadcn/forms/state libs): react, radix-ui, @/lib/utils.
**Internal behavior:**
- State and hooks used: No React/custom hook calls found.
- Data flow: inputs/params/context -> derived values -> conditional JSX/render output -> side effects (navigation, mutations, telemetry, toasts) when triggered.
- UI states: normal + conditional states (loading/empty/error/disabled) as encoded in branch logic within this file.
**Composition:**
- Composes imported primitives and local helpers according to file role (route shell, form/dialog, table part, or utility hook).
- Children/slot behavior follows React composition patterns where applicable.
**Styling:**
- Tailwind utility classes are primary styling mechanism; class composition may use `cn()` and/or variant helpers depending on file.
**Accessibility (A11y):**
- Leverages semantic HTML and Radix accessibility behavior where primitives are used; custom interactive regions require keyboard/ARIA verification.
- Focus management is primarily inherited from dialogs/menus/sheets/popovers and route-level navigation flow.
**Edge cases & pitfalls:**
- Potential pitfalls include hydration boundaries (`use client`), undefined async data, and stale props in memoized callbacks.
- Validate empty/error branches and permission-gated rendering paths for this file during QA.
**Recommended improvements:**
- Add explicit JSDoc/type comments for exported APIs where signatures are complex or implicit.
- Normalize loading/empty/error visual patterns with shared helper components to reduce divergence.
- Add focused a11y tests for keyboard traversal and announced labels in interactive controls used here.
**Testability notes:**
- Unit/interaction tests should assert render branches, callback execution, and disabled/loading/error states for this module.
- For route files, prefer integration tests validating server/client boundary behavior and composed child rendering.

### components/ui/badge.tsx
**Type:** ui primitive  
**Runtime:** Server Component  
**Exports:** Badge, badgeVariants  
**Purpose:** This file contributes directly to rendered UI (route surface, reusable component, hook-driven UI behavior, or style config). It defines either a visual building block or logic consumed by visual components in the app shell.
**Public API:**
| name | type | required | default | description |
|---|---|---|---|---|
| props / parameters | inferred from source signature | varies | none | See exported component or hook declaration in this file for exact contract. |
- Events/callbacks (if any): implemented as prop callbacks and local handlers bound to UI interactions in this module.
- External dependencies (Radix/shadcn/forms/state libs): react, @radix-ui/react-slot, class-variance-authority, @/lib/utils.
**Internal behavior:**
- State and hooks used: No React/custom hook calls found.
- Data flow: inputs/params/context -> derived values -> conditional JSX/render output -> side effects (navigation, mutations, telemetry, toasts) when triggered.
- UI states: normal + conditional states (loading/empty/error/disabled) as encoded in branch logic within this file.
**Composition:**
- Composes imported primitives and local helpers according to file role (route shell, form/dialog, table part, or utility hook).
- Children/slot behavior follows React composition patterns where applicable.
**Styling:**
- Tailwind utility classes are primary styling mechanism; class composition may use `cn()` and/or variant helpers depending on file.
**Accessibility (A11y):**
- Leverages semantic HTML and Radix accessibility behavior where primitives are used; custom interactive regions require keyboard/ARIA verification.
- Focus management is primarily inherited from dialogs/menus/sheets/popovers and route-level navigation flow.
**Edge cases & pitfalls:**
- Potential pitfalls include hydration boundaries (`use client`), undefined async data, and stale props in memoized callbacks.
- Validate empty/error branches and permission-gated rendering paths for this file during QA.
**Recommended improvements:**
- Add explicit JSDoc/type comments for exported APIs where signatures are complex or implicit.
- Normalize loading/empty/error visual patterns with shared helper components to reduce divergence.
- Add focused a11y tests for keyboard traversal and announced labels in interactive controls used here.
**Testability notes:**
- Unit/interaction tests should assert render branches, callback execution, and disabled/loading/error states for this module.
- For route files, prefer integration tests validating server/client boundary behavior and composed child rendering.

### components/ui/breadcrumb.tsx
**Type:** ui primitive  
**Runtime:** Server Component  
**Exports:** Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator, BreadcrumbEllipsis  
**Purpose:** This file contributes directly to rendered UI (route surface, reusable component, hook-driven UI behavior, or style config). It defines either a visual building block or logic consumed by visual components in the app shell.
**Public API:**
| name | type | required | default | description |
|---|---|---|---|---|
| props / parameters | inferred from source signature | varies | none | See exported component or hook declaration in this file for exact contract. |
- Events/callbacks (if any): implemented as prop callbacks and local handlers bound to UI interactions in this module.
- External dependencies (Radix/shadcn/forms/state libs): react, lucide-react, @radix-ui/react-slot, @/lib/utils.
**Internal behavior:**
- State and hooks used: No React/custom hook calls found.
- Data flow: inputs/params/context -> derived values -> conditional JSX/render output -> side effects (navigation, mutations, telemetry, toasts) when triggered.
- UI states: normal + conditional states (loading/empty/error/disabled) as encoded in branch logic within this file.
**Composition:**
- Composes imported primitives and local helpers according to file role (route shell, form/dialog, table part, or utility hook).
- Children/slot behavior follows React composition patterns where applicable.
**Styling:**
- Tailwind utility classes are primary styling mechanism; class composition may use `cn()` and/or variant helpers depending on file.
**Accessibility (A11y):**
- Leverages semantic HTML and Radix accessibility behavior where primitives are used; custom interactive regions require keyboard/ARIA verification.
- Focus management is primarily inherited from dialogs/menus/sheets/popovers and route-level navigation flow.
**Edge cases & pitfalls:**
- Potential pitfalls include hydration boundaries (`use client`), undefined async data, and stale props in memoized callbacks.
- Validate empty/error branches and permission-gated rendering paths for this file during QA.
**Recommended improvements:**
- Add explicit JSDoc/type comments for exported APIs where signatures are complex or implicit.
- Normalize loading/empty/error visual patterns with shared helper components to reduce divergence.
- Add focused a11y tests for keyboard traversal and announced labels in interactive controls used here.
**Testability notes:**
- Unit/interaction tests should assert render branches, callback execution, and disabled/loading/error states for this module.
- For route files, prefer integration tests validating server/client boundary behavior and composed child rendering.

### components/ui/button.tsx
**Type:** ui primitive  
**Runtime:** Server Component  
**Exports:** Button, buttonVariants  
**Purpose:** This file contributes directly to rendered UI (route surface, reusable component, hook-driven UI behavior, or style config). It defines either a visual building block or logic consumed by visual components in the app shell.
**Public API:**
| name | type | required | default | description |
|---|---|---|---|---|
| props / parameters | inferred from source signature | varies | none | See exported component or hook declaration in this file for exact contract. |
- Events/callbacks (if any): implemented as prop callbacks and local handlers bound to UI interactions in this module.
- External dependencies (Radix/shadcn/forms/state libs): react, @radix-ui/react-slot, class-variance-authority, @/lib/utils.
**Internal behavior:**
- State and hooks used: No React/custom hook calls found.
- Data flow: inputs/params/context -> derived values -> conditional JSX/render output -> side effects (navigation, mutations, telemetry, toasts) when triggered.
- UI states: normal + conditional states (loading/empty/error/disabled) as encoded in branch logic within this file.
**Composition:**
- Composes imported primitives and local helpers according to file role (route shell, form/dialog, table part, or utility hook).
- Children/slot behavior follows React composition patterns where applicable.
**Styling:**
- Tailwind utility classes are primary styling mechanism; class composition may use `cn()` and/or variant helpers depending on file.
**Accessibility (A11y):**
- Leverages semantic HTML and Radix accessibility behavior where primitives are used; custom interactive regions require keyboard/ARIA verification.
- Focus management is primarily inherited from dialogs/menus/sheets/popovers and route-level navigation flow.
**Edge cases & pitfalls:**
- Potential pitfalls include hydration boundaries (`use client`), undefined async data, and stale props in memoized callbacks.
- Validate empty/error branches and permission-gated rendering paths for this file during QA.
**Recommended improvements:**
- Add explicit JSDoc/type comments for exported APIs where signatures are complex or implicit.
- Normalize loading/empty/error visual patterns with shared helper components to reduce divergence.
- Add focused a11y tests for keyboard traversal and announced labels in interactive controls used here.
**Testability notes:**
- Unit/interaction tests should assert render branches, callback execution, and disabled/loading/error states for this module.
- For route files, prefer integration tests validating server/client boundary behavior and composed child rendering.

### components/ui/card.tsx
**Type:** ui primitive  
**Runtime:** Server Component  
**Exports:** Card, CardHeader, CardFooter, CardTitle, CardAction, CardDescription, CardContent  
**Purpose:** This file contributes directly to rendered UI (route surface, reusable component, hook-driven UI behavior, or style config). It defines either a visual building block or logic consumed by visual components in the app shell.
**Public API:**
| name | type | required | default | description |
|---|---|---|---|---|
| props / parameters | inferred from source signature | varies | none | See exported component or hook declaration in this file for exact contract. |
- Events/callbacks (if any): implemented as prop callbacks and local handlers bound to UI interactions in this module.
- External dependencies (Radix/shadcn/forms/state libs): react, @/lib/utils.
**Internal behavior:**
- State and hooks used: No React/custom hook calls found.
- Data flow: inputs/params/context -> derived values -> conditional JSX/render output -> side effects (navigation, mutations, telemetry, toasts) when triggered.
- UI states: normal + conditional states (loading/empty/error/disabled) as encoded in branch logic within this file.
**Composition:**
- Composes imported primitives and local helpers according to file role (route shell, form/dialog, table part, or utility hook).
- Children/slot behavior follows React composition patterns where applicable.
**Styling:**
- Tailwind utility classes are primary styling mechanism; class composition may use `cn()` and/or variant helpers depending on file.
**Accessibility (A11y):**
- Leverages semantic HTML and Radix accessibility behavior where primitives are used; custom interactive regions require keyboard/ARIA verification.
- Focus management is primarily inherited from dialogs/menus/sheets/popovers and route-level navigation flow.
**Edge cases & pitfalls:**
- Potential pitfalls include hydration boundaries (`use client`), undefined async data, and stale props in memoized callbacks.
- Validate empty/error branches and permission-gated rendering paths for this file during QA.
**Recommended improvements:**
- Add explicit JSDoc/type comments for exported APIs where signatures are complex or implicit.
- Normalize loading/empty/error visual patterns with shared helper components to reduce divergence.
- Add focused a11y tests for keyboard traversal and announced labels in interactive controls used here.
**Testability notes:**
- Unit/interaction tests should assert render branches, callback execution, and disabled/loading/error states for this module.
- For route files, prefer integration tests validating server/client boundary behavior and composed child rendering.

### components/ui/command.tsx
**Type:** ui primitive  
**Runtime:** Client Component  
**Exports:** Command, CommandDialog, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem, CommandShortcut, CommandSeparator  
**Purpose:** This file contributes directly to rendered UI (route surface, reusable component, hook-driven UI behavior, or style config). It defines either a visual building block or logic consumed by visual components in the app shell.
**Public API:**
| name | type | required | default | description |
|---|---|---|---|---|
| props / parameters | inferred from source signature | varies | none | See exported component or hook declaration in this file for exact contract. |
- Events/callbacks (if any): implemented as prop callbacks and local handlers bound to UI interactions in this module.
- External dependencies (Radix/shadcn/forms/state libs): react, cmdk, lucide-react, @/lib/utils.
**Internal behavior:**
- State and hooks used: No React/custom hook calls found.
- Data flow: inputs/params/context -> derived values -> conditional JSX/render output -> side effects (navigation, mutations, telemetry, toasts) when triggered.
- UI states: normal + conditional states (loading/empty/error/disabled) as encoded in branch logic within this file.
**Composition:**
- Composes imported primitives and local helpers according to file role (route shell, form/dialog, table part, or utility hook).
- Children/slot behavior follows React composition patterns where applicable.
**Styling:**
- Tailwind utility classes are primary styling mechanism; class composition may use `cn()` and/or variant helpers depending on file.
**Accessibility (A11y):**
- Leverages semantic HTML and Radix accessibility behavior where primitives are used; custom interactive regions require keyboard/ARIA verification.
- Focus management is primarily inherited from dialogs/menus/sheets/popovers and route-level navigation flow.
**Edge cases & pitfalls:**
- Potential pitfalls include hydration boundaries (`use client`), undefined async data, and stale props in memoized callbacks.
- Validate empty/error branches and permission-gated rendering paths for this file during QA.
**Recommended improvements:**
- Add explicit JSDoc/type comments for exported APIs where signatures are complex or implicit.
- Normalize loading/empty/error visual patterns with shared helper components to reduce divergence.
- Add focused a11y tests for keyboard traversal and announced labels in interactive controls used here.
**Testability notes:**
- Unit/interaction tests should assert render branches, callback execution, and disabled/loading/error states for this module.
- For route files, prefer integration tests validating server/client boundary behavior and composed child rendering.

### components/ui/data-table.tsx
**Type:** ui primitive  
**Runtime:** Client Component  
**Exports:** TableMeta, DataTable  
**Purpose:** This file contributes directly to rendered UI (route surface, reusable component, hook-driven UI behavior, or style config). It defines either a visual building block or logic consumed by visual components in the app shell.
**Public API:**
| name | type | required | default | description |
|---|---|---|---|---|
| props / parameters | inferred from source signature | varies | none | See exported component or hook declaration in this file for exact contract. |
- Events/callbacks (if any): implemented as prop callbacks and local handlers bound to UI interactions in this module.
- External dependencies (Radix/shadcn/forms/state libs): lucide-react, react-virtuoso, @/components/ui/skeleton, react, @/lib/utils, @/components/ui/input, @/components/ui/switch, @/hooks/use-data-table-state.
**Internal behavior:**
- State and hooks used: useCallback, useDataTableState, useState.
- Data flow: inputs/params/context -> derived values -> conditional JSX/render output -> side effects (navigation, mutations, telemetry, toasts) when triggered.
- UI states: normal + conditional states (loading/empty/error/disabled) as encoded in branch logic within this file.
**Composition:**
- Composes imported primitives and local helpers according to file role (route shell, form/dialog, table part, or utility hook).
- Children/slot behavior follows React composition patterns where applicable.
**Styling:**
- Tailwind utility classes are primary styling mechanism; class composition may use `cn()` and/or variant helpers depending on file.
**Accessibility (A11y):**
- Leverages semantic HTML and Radix accessibility behavior where primitives are used; custom interactive regions require keyboard/ARIA verification.
- Focus management is primarily inherited from dialogs/menus/sheets/popovers and route-level navigation flow.
**Edge cases & pitfalls:**
- Potential pitfalls include hydration boundaries (`use client`), undefined async data, and stale props in memoized callbacks.
- Validate empty/error branches and permission-gated rendering paths for this file during QA.
**Recommended improvements:**
- Add explicit JSDoc/type comments for exported APIs where signatures are complex or implicit.
- Normalize loading/empty/error visual patterns with shared helper components to reduce divergence.
- Add focused a11y tests for keyboard traversal and announced labels in interactive controls used here.
**Testability notes:**
- Unit/interaction tests should assert render branches, callback execution, and disabled/loading/error states for this module.
- For route files, prefer integration tests validating server/client boundary behavior and composed child rendering.

### components/ui/dialog.tsx
**Type:** ui primitive  
**Runtime:** Client Component  
**Exports:** Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogOverlay, DialogPortal, DialogTitle, DialogTrigger  
**Purpose:** This file contributes directly to rendered UI (route surface, reusable component, hook-driven UI behavior, or style config). It defines either a visual building block or logic consumed by visual components in the app shell.
**Public API:**
| name | type | required | default | description |
|---|---|---|---|---|
| props / parameters | inferred from source signature | varies | none | See exported component or hook declaration in this file for exact contract. |
- Events/callbacks (if any): implemented as prop callbacks and local handlers bound to UI interactions in this module.
- External dependencies (Radix/shadcn/forms/state libs): react, @radix-ui/react-dialog, lucide-react, @/lib/utils, @/components/ui/button.
**Internal behavior:**
- State and hooks used: No React/custom hook calls found.
- Data flow: inputs/params/context -> derived values -> conditional JSX/render output -> side effects (navigation, mutations, telemetry, toasts) when triggered.
- UI states: normal + conditional states (loading/empty/error/disabled) as encoded in branch logic within this file.
**Composition:**
- Composes imported primitives and local helpers according to file role (route shell, form/dialog, table part, or utility hook).
- Children/slot behavior follows React composition patterns where applicable.
**Styling:**
- Tailwind utility classes are primary styling mechanism; class composition may use `cn()` and/or variant helpers depending on file.
**Accessibility (A11y):**
- Leverages semantic HTML and Radix accessibility behavior where primitives are used; custom interactive regions require keyboard/ARIA verification.
- Focus management is primarily inherited from dialogs/menus/sheets/popovers and route-level navigation flow.
**Edge cases & pitfalls:**
- Potential pitfalls include hydration boundaries (`use client`), undefined async data, and stale props in memoized callbacks.
- Validate empty/error branches and permission-gated rendering paths for this file during QA.
**Recommended improvements:**
- Add explicit JSDoc/type comments for exported APIs where signatures are complex or implicit.
- Normalize loading/empty/error visual patterns with shared helper components to reduce divergence.
- Add focused a11y tests for keyboard traversal and announced labels in interactive controls used here.
**Testability notes:**
- Unit/interaction tests should assert render branches, callback execution, and disabled/loading/error states for this module.
- For route files, prefer integration tests validating server/client boundary behavior and composed child rendering.

### components/ui/dropdown-menu.tsx
**Type:** ui primitive  
**Runtime:** Client Component  
**Exports:** DropdownMenu, DropdownMenuPortal, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuGroup, DropdownMenuLabel, DropdownMenuItem, DropdownMenuCheckboxItem, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuSeparator, DropdownMenuShortcut, DropdownMenuSub, DropdownMenuSubTrigger, DropdownMenuSubContent  
**Purpose:** This file contributes directly to rendered UI (route surface, reusable component, hook-driven UI behavior, or style config). It defines either a visual building block or logic consumed by visual components in the app shell.
**Public API:**
| name | type | required | default | description |
|---|---|---|---|---|
| props / parameters | inferred from source signature | varies | none | See exported component or hook declaration in this file for exact contract. |
- Events/callbacks (if any): implemented as prop callbacks and local handlers bound to UI interactions in this module.
- External dependencies (Radix/shadcn/forms/state libs): react, radix-ui, lucide-react, @/lib/utils.
**Internal behavior:**
- State and hooks used: No React/custom hook calls found.
- Data flow: inputs/params/context -> derived values -> conditional JSX/render output -> side effects (navigation, mutations, telemetry, toasts) when triggered.
- UI states: normal + conditional states (loading/empty/error/disabled) as encoded in branch logic within this file.
**Composition:**
- Composes imported primitives and local helpers according to file role (route shell, form/dialog, table part, or utility hook).
- Children/slot behavior follows React composition patterns where applicable.
**Styling:**
- Tailwind utility classes are primary styling mechanism; class composition may use `cn()` and/or variant helpers depending on file.
**Accessibility (A11y):**
- Leverages semantic HTML and Radix accessibility behavior where primitives are used; custom interactive regions require keyboard/ARIA verification.
- Focus management is primarily inherited from dialogs/menus/sheets/popovers and route-level navigation flow.
**Edge cases & pitfalls:**
- Potential pitfalls include hydration boundaries (`use client`), undefined async data, and stale props in memoized callbacks.
- Validate empty/error branches and permission-gated rendering paths for this file during QA.
**Recommended improvements:**
- Add explicit JSDoc/type comments for exported APIs where signatures are complex or implicit.
- Normalize loading/empty/error visual patterns with shared helper components to reduce divergence.
- Add focused a11y tests for keyboard traversal and announced labels in interactive controls used here.
**Testability notes:**
- Unit/interaction tests should assert render branches, callback execution, and disabled/loading/error states for this module.
- For route files, prefer integration tests validating server/client boundary behavior and composed child rendering.

### components/ui/form.tsx
**Type:** ui primitive  
**Runtime:** Client Component  
**Exports:** useFormField, Form, FormItem, FormLabel, FormControl, FormDescription, FormMessage, FormField  
**Purpose:** This file contributes directly to rendered UI (route surface, reusable component, hook-driven UI behavior, or style config). It defines either a visual building block or logic consumed by visual components in the app shell.
**Public API:**
| name | type | required | default | description |
|---|---|---|---|---|
| props / parameters | inferred from source signature | varies | none | See exported component or hook declaration in this file for exact contract. |
- Events/callbacks (if any): implemented as prop callbacks and local handlers bound to UI interactions in this module.
- External dependencies (Radix/shadcn/forms/state libs): react, @radix-ui/react-label, @radix-ui/react-slot, @/lib/utils, @/components/ui/label.
**Internal behavior:**
- State and hooks used: useContext, useFormContext, useFormField, useId.
- Data flow: inputs/params/context -> derived values -> conditional JSX/render output -> side effects (navigation, mutations, telemetry, toasts) when triggered.
- UI states: normal + conditional states (loading/empty/error/disabled) as encoded in branch logic within this file.
**Composition:**
- Composes imported primitives and local helpers according to file role (route shell, form/dialog, table part, or utility hook).
- Children/slot behavior follows React composition patterns where applicable.
**Styling:**
- Tailwind utility classes are primary styling mechanism; class composition may use `cn()` and/or variant helpers depending on file.
**Accessibility (A11y):**
- Leverages semantic HTML and Radix accessibility behavior where primitives are used; custom interactive regions require keyboard/ARIA verification.
- Focus management is primarily inherited from dialogs/menus/sheets/popovers and route-level navigation flow.
**Edge cases & pitfalls:**
- Potential pitfalls include hydration boundaries (`use client`), undefined async data, and stale props in memoized callbacks.
- Validate empty/error branches and permission-gated rendering paths for this file during QA.
**Recommended improvements:**
- Add explicit JSDoc/type comments for exported APIs where signatures are complex or implicit.
- Normalize loading/empty/error visual patterns with shared helper components to reduce divergence.
- Add focused a11y tests for keyboard traversal and announced labels in interactive controls used here.
**Testability notes:**
- Unit/interaction tests should assert render branches, callback execution, and disabled/loading/error states for this module.
- For route files, prefer integration tests validating server/client boundary behavior and composed child rendering.

### components/ui/input.tsx
**Type:** ui primitive  
**Runtime:** Server Component  
**Exports:** Input  
**Purpose:** This file contributes directly to rendered UI (route surface, reusable component, hook-driven UI behavior, or style config). It defines either a visual building block or logic consumed by visual components in the app shell.
**Public API:**
| name | type | required | default | description |
|---|---|---|---|---|
| props / parameters | inferred from source signature | varies | none | See exported component or hook declaration in this file for exact contract. |
- Events/callbacks (if any): implemented as prop callbacks and local handlers bound to UI interactions in this module.
- External dependencies (Radix/shadcn/forms/state libs): react, @/lib/utils.
**Internal behavior:**
- State and hooks used: No React/custom hook calls found.
- Data flow: inputs/params/context -> derived values -> conditional JSX/render output -> side effects (navigation, mutations, telemetry, toasts) when triggered.
- UI states: normal + conditional states (loading/empty/error/disabled) as encoded in branch logic within this file.
**Composition:**
- Composes imported primitives and local helpers according to file role (route shell, form/dialog, table part, or utility hook).
- Children/slot behavior follows React composition patterns where applicable.
**Styling:**
- Tailwind utility classes are primary styling mechanism; class composition may use `cn()` and/or variant helpers depending on file.
**Accessibility (A11y):**
- Leverages semantic HTML and Radix accessibility behavior where primitives are used; custom interactive regions require keyboard/ARIA verification.
- Focus management is primarily inherited from dialogs/menus/sheets/popovers and route-level navigation flow.
**Edge cases & pitfalls:**
- Potential pitfalls include hydration boundaries (`use client`), undefined async data, and stale props in memoized callbacks.
- Validate empty/error branches and permission-gated rendering paths for this file during QA.
**Recommended improvements:**
- Add explicit JSDoc/type comments for exported APIs where signatures are complex or implicit.
- Normalize loading/empty/error visual patterns with shared helper components to reduce divergence.
- Add focused a11y tests for keyboard traversal and announced labels in interactive controls used here.
**Testability notes:**
- Unit/interaction tests should assert render branches, callback execution, and disabled/loading/error states for this module.
- For route files, prefer integration tests validating server/client boundary behavior and composed child rendering.

### components/ui/label.tsx
**Type:** ui primitive  
**Runtime:** Client Component  
**Exports:** Label  
**Purpose:** This file contributes directly to rendered UI (route surface, reusable component, hook-driven UI behavior, or style config). It defines either a visual building block or logic consumed by visual components in the app shell.
**Public API:**
| name | type | required | default | description |
|---|---|---|---|---|
| props / parameters | inferred from source signature | varies | none | See exported component or hook declaration in this file for exact contract. |
- Events/callbacks (if any): implemented as prop callbacks and local handlers bound to UI interactions in this module.
- External dependencies (Radix/shadcn/forms/state libs): react, radix-ui, @/lib/utils.
**Internal behavior:**
- State and hooks used: No React/custom hook calls found.
- Data flow: inputs/params/context -> derived values -> conditional JSX/render output -> side effects (navigation, mutations, telemetry, toasts) when triggered.
- UI states: normal + conditional states (loading/empty/error/disabled) as encoded in branch logic within this file.
**Composition:**
- Composes imported primitives and local helpers according to file role (route shell, form/dialog, table part, or utility hook).
- Children/slot behavior follows React composition patterns where applicable.
**Styling:**
- Tailwind utility classes are primary styling mechanism; class composition may use `cn()` and/or variant helpers depending on file.
**Accessibility (A11y):**
- Leverages semantic HTML and Radix accessibility behavior where primitives are used; custom interactive regions require keyboard/ARIA verification.
- Focus management is primarily inherited from dialogs/menus/sheets/popovers and route-level navigation flow.
**Edge cases & pitfalls:**
- Potential pitfalls include hydration boundaries (`use client`), undefined async data, and stale props in memoized callbacks.
- Validate empty/error branches and permission-gated rendering paths for this file during QA.
**Recommended improvements:**
- Add explicit JSDoc/type comments for exported APIs where signatures are complex or implicit.
- Normalize loading/empty/error visual patterns with shared helper components to reduce divergence.
- Add focused a11y tests for keyboard traversal and announced labels in interactive controls used here.
**Testability notes:**
- Unit/interaction tests should assert render branches, callback execution, and disabled/loading/error states for this module.
- For route files, prefer integration tests validating server/client boundary behavior and composed child rendering.

### components/ui/loading-button.tsx
**Type:** ui primitive  
**Runtime:** Server Component  
**Exports:** LoadingButton  
**Purpose:** This file contributes directly to rendered UI (route surface, reusable component, hook-driven UI behavior, or style config). It defines either a visual building block or logic consumed by visual components in the app shell.
**Public API:**
| name | type | required | default | description |
|---|---|---|---|---|
| props / parameters | inferred from source signature | varies | none | See exported component or hook declaration in this file for exact contract. |
- Events/callbacks (if any): implemented as prop callbacks and local handlers bound to UI interactions in this module.
- External dependencies (Radix/shadcn/forms/state libs): react, lucide-react, @/components/ui/button, @/lib/utils.
**Internal behavior:**
- State and hooks used: No React/custom hook calls found.
- Data flow: inputs/params/context -> derived values -> conditional JSX/render output -> side effects (navigation, mutations, telemetry, toasts) when triggered.
- UI states: normal + conditional states (loading/empty/error/disabled) as encoded in branch logic within this file.
**Composition:**
- Composes imported primitives and local helpers according to file role (route shell, form/dialog, table part, or utility hook).
- Children/slot behavior follows React composition patterns where applicable.
**Styling:**
- Tailwind utility classes are primary styling mechanism; class composition may use `cn()` and/or variant helpers depending on file.
**Accessibility (A11y):**
- Leverages semantic HTML and Radix accessibility behavior where primitives are used; custom interactive regions require keyboard/ARIA verification.
- Focus management is primarily inherited from dialogs/menus/sheets/popovers and route-level navigation flow.
**Edge cases & pitfalls:**
- Potential pitfalls include hydration boundaries (`use client`), undefined async data, and stale props in memoized callbacks.
- Validate empty/error branches and permission-gated rendering paths for this file during QA.
**Recommended improvements:**
- Add explicit JSDoc/type comments for exported APIs where signatures are complex or implicit.
- Normalize loading/empty/error visual patterns with shared helper components to reduce divergence.
- Add focused a11y tests for keyboard traversal and announced labels in interactive controls used here.
**Testability notes:**
- Unit/interaction tests should assert render branches, callback execution, and disabled/loading/error states for this module.
- For route files, prefer integration tests validating server/client boundary behavior and composed child rendering.

### components/ui/loading-indicator.tsx
**Type:** ui primitive  
**Runtime:** Server Component  
**Exports:** LoadingIndicator  
**Purpose:** This file contributes directly to rendered UI (route surface, reusable component, hook-driven UI behavior, or style config). It defines either a visual building block or logic consumed by visual components in the app shell.
**Public API:**
| name | type | required | default | description |
|---|---|---|---|---|
| props / parameters | inferred from source signature | varies | none | See exported component or hook declaration in this file for exact contract. |
- Events/callbacks (if any): implemented as prop callbacks and local handlers bound to UI interactions in this module.
- External dependencies (Radix/shadcn/forms/state libs): lucide-react, @/lib/utils.
**Internal behavior:**
- State and hooks used: No React/custom hook calls found.
- Data flow: inputs/params/context -> derived values -> conditional JSX/render output -> side effects (navigation, mutations, telemetry, toasts) when triggered.
- UI states: normal + conditional states (loading/empty/error/disabled) as encoded in branch logic within this file.
**Composition:**
- Composes imported primitives and local helpers according to file role (route shell, form/dialog, table part, or utility hook).
- Children/slot behavior follows React composition patterns where applicable.
**Styling:**
- Tailwind utility classes are primary styling mechanism; class composition may use `cn()` and/or variant helpers depending on file.
**Accessibility (A11y):**
- Leverages semantic HTML and Radix accessibility behavior where primitives are used; custom interactive regions require keyboard/ARIA verification.
- Focus management is primarily inherited from dialogs/menus/sheets/popovers and route-level navigation flow.
**Edge cases & pitfalls:**
- Potential pitfalls include hydration boundaries (`use client`), undefined async data, and stale props in memoized callbacks.
- Validate empty/error branches and permission-gated rendering paths for this file during QA.
**Recommended improvements:**
- Add explicit JSDoc/type comments for exported APIs where signatures are complex or implicit.
- Normalize loading/empty/error visual patterns with shared helper components to reduce divergence.
- Add focused a11y tests for keyboard traversal and announced labels in interactive controls used here.
**Testability notes:**
- Unit/interaction tests should assert render branches, callback execution, and disabled/loading/error states for this module.
- For route files, prefer integration tests validating server/client boundary behavior and composed child rendering.

### components/ui/popover.tsx
**Type:** ui primitive  
**Runtime:** Client Component  
**Exports:** Popover, PopoverTrigger, PopoverContent, PopoverAnchor, PopoverHeader, PopoverTitle, PopoverDescription  
**Purpose:** This file contributes directly to rendered UI (route surface, reusable component, hook-driven UI behavior, or style config). It defines either a visual building block or logic consumed by visual components in the app shell.
**Public API:**
| name | type | required | default | description |
|---|---|---|---|---|
| props / parameters | inferred from source signature | varies | none | See exported component or hook declaration in this file for exact contract. |
- Events/callbacks (if any): implemented as prop callbacks and local handlers bound to UI interactions in this module.
- External dependencies (Radix/shadcn/forms/state libs): react, @radix-ui/react-popover, @/lib/utils.
**Internal behavior:**
- State and hooks used: No React/custom hook calls found.
- Data flow: inputs/params/context -> derived values -> conditional JSX/render output -> side effects (navigation, mutations, telemetry, toasts) when triggered.
- UI states: normal + conditional states (loading/empty/error/disabled) as encoded in branch logic within this file.
**Composition:**
- Composes imported primitives and local helpers according to file role (route shell, form/dialog, table part, or utility hook).
- Children/slot behavior follows React composition patterns where applicable.
**Styling:**
- Tailwind utility classes are primary styling mechanism; class composition may use `cn()` and/or variant helpers depending on file.
**Accessibility (A11y):**
- Leverages semantic HTML and Radix accessibility behavior where primitives are used; custom interactive regions require keyboard/ARIA verification.
- Focus management is primarily inherited from dialogs/menus/sheets/popovers and route-level navigation flow.
**Edge cases & pitfalls:**
- Potential pitfalls include hydration boundaries (`use client`), undefined async data, and stale props in memoized callbacks.
- Validate empty/error branches and permission-gated rendering paths for this file during QA.
**Recommended improvements:**
- Add explicit JSDoc/type comments for exported APIs where signatures are complex or implicit.
- Normalize loading/empty/error visual patterns with shared helper components to reduce divergence.
- Add focused a11y tests for keyboard traversal and announced labels in interactive controls used here.
**Testability notes:**
- Unit/interaction tests should assert render branches, callback execution, and disabled/loading/error states for this module.
- For route files, prefer integration tests validating server/client boundary behavior and composed child rendering.

### components/ui/radio-group.tsx
**Type:** ui primitive  
**Runtime:** Client Component  
**Exports:** RadioGroup, RadioGroupItem  
**Purpose:** This file contributes directly to rendered UI (route surface, reusable component, hook-driven UI behavior, or style config). It defines either a visual building block or logic consumed by visual components in the app shell.
**Public API:**
| name | type | required | default | description |
|---|---|---|---|---|
| props / parameters | inferred from source signature | varies | none | See exported component or hook declaration in this file for exact contract. |
- Events/callbacks (if any): implemented as prop callbacks and local handlers bound to UI interactions in this module.
- External dependencies (Radix/shadcn/forms/state libs): react, radix-ui, lucide-react, @/lib/utils.
**Internal behavior:**
- State and hooks used: No React/custom hook calls found.
- Data flow: inputs/params/context -> derived values -> conditional JSX/render output -> side effects (navigation, mutations, telemetry, toasts) when triggered.
- UI states: normal + conditional states (loading/empty/error/disabled) as encoded in branch logic within this file.
**Composition:**
- Composes imported primitives and local helpers according to file role (route shell, form/dialog, table part, or utility hook).
- Children/slot behavior follows React composition patterns where applicable.
**Styling:**
- Tailwind utility classes are primary styling mechanism; class composition may use `cn()` and/or variant helpers depending on file.
**Accessibility (A11y):**
- Leverages semantic HTML and Radix accessibility behavior where primitives are used; custom interactive regions require keyboard/ARIA verification.
- Focus management is primarily inherited from dialogs/menus/sheets/popovers and route-level navigation flow.
**Edge cases & pitfalls:**
- Potential pitfalls include hydration boundaries (`use client`), undefined async data, and stale props in memoized callbacks.
- Validate empty/error branches and permission-gated rendering paths for this file during QA.
**Recommended improvements:**
- Add explicit JSDoc/type comments for exported APIs where signatures are complex or implicit.
- Normalize loading/empty/error visual patterns with shared helper components to reduce divergence.
- Add focused a11y tests for keyboard traversal and announced labels in interactive controls used here.
**Testability notes:**
- Unit/interaction tests should assert render branches, callback execution, and disabled/loading/error states for this module.
- For route files, prefer integration tests validating server/client boundary behavior and composed child rendering.

### components/ui/scroll-area.tsx
**Type:** ui primitive  
**Runtime:** Client Component  
**Exports:** ScrollArea, ScrollBar  
**Purpose:** This file contributes directly to rendered UI (route surface, reusable component, hook-driven UI behavior, or style config). It defines either a visual building block or logic consumed by visual components in the app shell.
**Public API:**
| name | type | required | default | description |
|---|---|---|---|---|
| props / parameters | inferred from source signature | varies | none | See exported component or hook declaration in this file for exact contract. |
- Events/callbacks (if any): implemented as prop callbacks and local handlers bound to UI interactions in this module.
- External dependencies (Radix/shadcn/forms/state libs): react, @radix-ui/react-scroll-area, @/lib/utils.
**Internal behavior:**
- State and hooks used: No React/custom hook calls found.
- Data flow: inputs/params/context -> derived values -> conditional JSX/render output -> side effects (navigation, mutations, telemetry, toasts) when triggered.
- UI states: normal + conditional states (loading/empty/error/disabled) as encoded in branch logic within this file.
**Composition:**
- Composes imported primitives and local helpers according to file role (route shell, form/dialog, table part, or utility hook).
- Children/slot behavior follows React composition patterns where applicable.
**Styling:**
- Tailwind utility classes are primary styling mechanism; class composition may use `cn()` and/or variant helpers depending on file.
**Accessibility (A11y):**
- Leverages semantic HTML and Radix accessibility behavior where primitives are used; custom interactive regions require keyboard/ARIA verification.
- Focus management is primarily inherited from dialogs/menus/sheets/popovers and route-level navigation flow.
**Edge cases & pitfalls:**
- Potential pitfalls include hydration boundaries (`use client`), undefined async data, and stale props in memoized callbacks.
- Validate empty/error branches and permission-gated rendering paths for this file during QA.
**Recommended improvements:**
- Add explicit JSDoc/type comments for exported APIs where signatures are complex or implicit.
- Normalize loading/empty/error visual patterns with shared helper components to reduce divergence.
- Add focused a11y tests for keyboard traversal and announced labels in interactive controls used here.
**Testability notes:**
- Unit/interaction tests should assert render branches, callback execution, and disabled/loading/error states for this module.
- For route files, prefer integration tests validating server/client boundary behavior and composed child rendering.

### components/ui/select.tsx
**Type:** ui primitive  
**Runtime:** Client Component  
**Exports:** Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectScrollDownButton, SelectScrollUpButton, SelectSeparator, SelectTrigger, SelectValue  
**Purpose:** This file contributes directly to rendered UI (route surface, reusable component, hook-driven UI behavior, or style config). It defines either a visual building block or logic consumed by visual components in the app shell.
**Public API:**
| name | type | required | default | description |
|---|---|---|---|---|
| props / parameters | inferred from source signature | varies | none | See exported component or hook declaration in this file for exact contract. |
- Events/callbacks (if any): implemented as prop callbacks and local handlers bound to UI interactions in this module.
- External dependencies (Radix/shadcn/forms/state libs): react, @radix-ui/react-select, lucide-react, @/lib/utils.
**Internal behavior:**
- State and hooks used: No React/custom hook calls found.
- Data flow: inputs/params/context -> derived values -> conditional JSX/render output -> side effects (navigation, mutations, telemetry, toasts) when triggered.
- UI states: normal + conditional states (loading/empty/error/disabled) as encoded in branch logic within this file.
**Composition:**
- Composes imported primitives and local helpers according to file role (route shell, form/dialog, table part, or utility hook).
- Children/slot behavior follows React composition patterns where applicable.
**Styling:**
- Tailwind utility classes are primary styling mechanism; class composition may use `cn()` and/or variant helpers depending on file.
**Accessibility (A11y):**
- Leverages semantic HTML and Radix accessibility behavior where primitives are used; custom interactive regions require keyboard/ARIA verification.
- Focus management is primarily inherited from dialogs/menus/sheets/popovers and route-level navigation flow.
**Edge cases & pitfalls:**
- Potential pitfalls include hydration boundaries (`use client`), undefined async data, and stale props in memoized callbacks.
- Validate empty/error branches and permission-gated rendering paths for this file during QA.
**Recommended improvements:**
- Add explicit JSDoc/type comments for exported APIs where signatures are complex or implicit.
- Normalize loading/empty/error visual patterns with shared helper components to reduce divergence.
- Add focused a11y tests for keyboard traversal and announced labels in interactive controls used here.
**Testability notes:**
- Unit/interaction tests should assert render branches, callback execution, and disabled/loading/error states for this module.
- For route files, prefer integration tests validating server/client boundary behavior and composed child rendering.

### components/ui/separator.tsx
**Type:** ui primitive  
**Runtime:** Client Component  
**Exports:** Separator  
**Purpose:** This file contributes directly to rendered UI (route surface, reusable component, hook-driven UI behavior, or style config). It defines either a visual building block or logic consumed by visual components in the app shell.
**Public API:**
| name | type | required | default | description |
|---|---|---|---|---|
| props / parameters | inferred from source signature | varies | none | See exported component or hook declaration in this file for exact contract. |
- Events/callbacks (if any): implemented as prop callbacks and local handlers bound to UI interactions in this module.
- External dependencies (Radix/shadcn/forms/state libs): react, @radix-ui/react-separator, @/lib/utils.
**Internal behavior:**
- State and hooks used: No React/custom hook calls found.
- Data flow: inputs/params/context -> derived values -> conditional JSX/render output -> side effects (navigation, mutations, telemetry, toasts) when triggered.
- UI states: normal + conditional states (loading/empty/error/disabled) as encoded in branch logic within this file.
**Composition:**
- Composes imported primitives and local helpers according to file role (route shell, form/dialog, table part, or utility hook).
- Children/slot behavior follows React composition patterns where applicable.
**Styling:**
- Tailwind utility classes are primary styling mechanism; class composition may use `cn()` and/or variant helpers depending on file.
**Accessibility (A11y):**
- Leverages semantic HTML and Radix accessibility behavior where primitives are used; custom interactive regions require keyboard/ARIA verification.
- Focus management is primarily inherited from dialogs/menus/sheets/popovers and route-level navigation flow.
**Edge cases & pitfalls:**
- Potential pitfalls include hydration boundaries (`use client`), undefined async data, and stale props in memoized callbacks.
- Validate empty/error branches and permission-gated rendering paths for this file during QA.
**Recommended improvements:**
- Add explicit JSDoc/type comments for exported APIs where signatures are complex or implicit.
- Normalize loading/empty/error visual patterns with shared helper components to reduce divergence.
- Add focused a11y tests for keyboard traversal and announced labels in interactive controls used here.
**Testability notes:**
- Unit/interaction tests should assert render branches, callback execution, and disabled/loading/error states for this module.
- For route files, prefer integration tests validating server/client boundary behavior and composed child rendering.

### components/ui/sheet.tsx
**Type:** ui primitive  
**Runtime:** Client Component  
**Exports:** Sheet, SheetTrigger, SheetClose, SheetContent, SheetHeader, SheetFooter, SheetTitle, SheetDescription  
**Purpose:** This file contributes directly to rendered UI (route surface, reusable component, hook-driven UI behavior, or style config). It defines either a visual building block or logic consumed by visual components in the app shell.
**Public API:**
| name | type | required | default | description |
|---|---|---|---|---|
| props / parameters | inferred from source signature | varies | none | See exported component or hook declaration in this file for exact contract. |
- Events/callbacks (if any): implemented as prop callbacks and local handlers bound to UI interactions in this module.
- External dependencies (Radix/shadcn/forms/state libs): react, @radix-ui/react-dialog, lucide-react, @/lib/utils.
**Internal behavior:**
- State and hooks used: No React/custom hook calls found.
- Data flow: inputs/params/context -> derived values -> conditional JSX/render output -> side effects (navigation, mutations, telemetry, toasts) when triggered.
- UI states: normal + conditional states (loading/empty/error/disabled) as encoded in branch logic within this file.
**Composition:**
- Composes imported primitives and local helpers according to file role (route shell, form/dialog, table part, or utility hook).
- Children/slot behavior follows React composition patterns where applicable.
**Styling:**
- Tailwind utility classes are primary styling mechanism; class composition may use `cn()` and/or variant helpers depending on file.
**Accessibility (A11y):**
- Leverages semantic HTML and Radix accessibility behavior where primitives are used; custom interactive regions require keyboard/ARIA verification.
- Focus management is primarily inherited from dialogs/menus/sheets/popovers and route-level navigation flow.
**Edge cases & pitfalls:**
- Potential pitfalls include hydration boundaries (`use client`), undefined async data, and stale props in memoized callbacks.
- Validate empty/error branches and permission-gated rendering paths for this file during QA.
**Recommended improvements:**
- Add explicit JSDoc/type comments for exported APIs where signatures are complex or implicit.
- Normalize loading/empty/error visual patterns with shared helper components to reduce divergence.
- Add focused a11y tests for keyboard traversal and announced labels in interactive controls used here.
**Testability notes:**
- Unit/interaction tests should assert render branches, callback execution, and disabled/loading/error states for this module.
- For route files, prefer integration tests validating server/client boundary behavior and composed child rendering.

### components/ui/sidebar.tsx
**Type:** ui primitive  
**Runtime:** Client Component  
**Exports:** Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupAction, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarInput, SidebarInset, SidebarMenu, SidebarMenuAction, SidebarMenuBadge, SidebarMenuButton, SidebarMenuItem, SidebarMenuSkeleton, SidebarMenuSub, SidebarMenuSubButton, SidebarMenuSubItem, SidebarProvider, SidebarRail, SidebarSeparator, SidebarTrigger, useSidebar  
**Purpose:** This file contributes directly to rendered UI (route surface, reusable component, hook-driven UI behavior, or style config). It defines either a visual building block or logic consumed by visual components in the app shell.
**Public API:**
| name | type | required | default | description |
|---|---|---|---|---|
| props / parameters | inferred from source signature | varies | none | See exported component or hook declaration in this file for exact contract. |
- Events/callbacks (if any): implemented as prop callbacks and local handlers bound to UI interactions in this module.
- External dependencies (Radix/shadcn/forms/state libs): react, @radix-ui/react-slot, class-variance-authority, lucide-react, @/hooks/use-mobile, @/hooks/use-sidebar-state, @/lib/utils, @/components/ui/button, @/components/ui/input, @/components/ui/separator....
**Internal behavior:**
- State and hooks used: useContext, useIsMobile, useMemo, useSidebar, useSidebarState.
- Data flow: inputs/params/context -> derived values -> conditional JSX/render output -> side effects (navigation, mutations, telemetry, toasts) when triggered.
- UI states: normal + conditional states (loading/empty/error/disabled) as encoded in branch logic within this file.
**Composition:**
- Composes imported primitives and local helpers according to file role (route shell, form/dialog, table part, or utility hook).
- Children/slot behavior follows React composition patterns where applicable.
**Styling:**
- Tailwind utility classes are primary styling mechanism; class composition may use `cn()` and/or variant helpers depending on file.
**Accessibility (A11y):**
- Leverages semantic HTML and Radix accessibility behavior where primitives are used; custom interactive regions require keyboard/ARIA verification.
- Focus management is primarily inherited from dialogs/menus/sheets/popovers and route-level navigation flow.
**Edge cases & pitfalls:**
- Potential pitfalls include hydration boundaries (`use client`), undefined async data, and stale props in memoized callbacks.
- Validate empty/error branches and permission-gated rendering paths for this file during QA.
**Recommended improvements:**
- Add explicit JSDoc/type comments for exported APIs where signatures are complex or implicit.
- Normalize loading/empty/error visual patterns with shared helper components to reduce divergence.
- Add focused a11y tests for keyboard traversal and announced labels in interactive controls used here.
**Testability notes:**
- Unit/interaction tests should assert render branches, callback execution, and disabled/loading/error states for this module.
- For route files, prefer integration tests validating server/client boundary behavior and composed child rendering.

### components/ui/skeleton.tsx
**Type:** ui primitive  
**Runtime:** Server Component  
**Exports:** Skeleton  
**Purpose:** This file contributes directly to rendered UI (route surface, reusable component, hook-driven UI behavior, or style config). It defines either a visual building block or logic consumed by visual components in the app shell.
**Public API:**
| name | type | required | default | description |
|---|---|---|---|---|
| props / parameters | inferred from source signature | varies | none | See exported component or hook declaration in this file for exact contract. |
- Events/callbacks (if any): implemented as prop callbacks and local handlers bound to UI interactions in this module.
- External dependencies (Radix/shadcn/forms/state libs): @/lib/utils.
**Internal behavior:**
- State and hooks used: No React/custom hook calls found.
- Data flow: inputs/params/context -> derived values -> conditional JSX/render output -> side effects (navigation, mutations, telemetry, toasts) when triggered.
- UI states: normal + conditional states (loading/empty/error/disabled) as encoded in branch logic within this file.
**Composition:**
- Composes imported primitives and local helpers according to file role (route shell, form/dialog, table part, or utility hook).
- Children/slot behavior follows React composition patterns where applicable.
**Styling:**
- Tailwind utility classes are primary styling mechanism; class composition may use `cn()` and/or variant helpers depending on file.
**Accessibility (A11y):**
- Leverages semantic HTML and Radix accessibility behavior where primitives are used; custom interactive regions require keyboard/ARIA verification.
- Focus management is primarily inherited from dialogs/menus/sheets/popovers and route-level navigation flow.
**Edge cases & pitfalls:**
- Potential pitfalls include hydration boundaries (`use client`), undefined async data, and stale props in memoized callbacks.
- Validate empty/error branches and permission-gated rendering paths for this file during QA.
**Recommended improvements:**
- Add explicit JSDoc/type comments for exported APIs where signatures are complex or implicit.
- Normalize loading/empty/error visual patterns with shared helper components to reduce divergence.
- Add focused a11y tests for keyboard traversal and announced labels in interactive controls used here.
**Testability notes:**
- Unit/interaction tests should assert render branches, callback execution, and disabled/loading/error states for this module.
- For route files, prefer integration tests validating server/client boundary behavior and composed child rendering.

### components/ui/sonner.tsx
**Type:** ui primitive  
**Runtime:** Client Component  
**Exports:** Toaster  
**Purpose:** This file contributes directly to rendered UI (route surface, reusable component, hook-driven UI behavior, or style config). It defines either a visual building block or logic consumed by visual components in the app shell.
**Public API:**
| name | type | required | default | description |
|---|---|---|---|---|
| props / parameters | inferred from source signature | varies | none | See exported component or hook declaration in this file for exact contract. |
- Events/callbacks (if any): implemented as prop callbacks and local handlers bound to UI interactions in this module.
- External dependencies (Radix/shadcn/forms/state libs): sonner.
**Internal behavior:**
- State and hooks used: No React/custom hook calls found.
- Data flow: inputs/params/context -> derived values -> conditional JSX/render output -> side effects (navigation, mutations, telemetry, toasts) when triggered.
- UI states: normal + conditional states (loading/empty/error/disabled) as encoded in branch logic within this file.
**Composition:**
- Composes imported primitives and local helpers according to file role (route shell, form/dialog, table part, or utility hook).
- Children/slot behavior follows React composition patterns where applicable.
**Styling:**
- Tailwind utility classes are primary styling mechanism; class composition may use `cn()` and/or variant helpers depending on file.
**Accessibility (A11y):**
- Leverages semantic HTML and Radix accessibility behavior where primitives are used; custom interactive regions require keyboard/ARIA verification.
- Focus management is primarily inherited from dialogs/menus/sheets/popovers and route-level navigation flow.
**Edge cases & pitfalls:**
- Potential pitfalls include hydration boundaries (`use client`), undefined async data, and stale props in memoized callbacks.
- Validate empty/error branches and permission-gated rendering paths for this file during QA.
**Recommended improvements:**
- Add explicit JSDoc/type comments for exported APIs where signatures are complex or implicit.
- Normalize loading/empty/error visual patterns with shared helper components to reduce divergence.
- Add focused a11y tests for keyboard traversal and announced labels in interactive controls used here.
**Testability notes:**
- Unit/interaction tests should assert render branches, callback execution, and disabled/loading/error states for this module.
- For route files, prefer integration tests validating server/client boundary behavior and composed child rendering.

### components/ui/switch.tsx
**Type:** ui primitive  
**Runtime:** Client Component  
**Exports:** Switch  
**Purpose:** This file contributes directly to rendered UI (route surface, reusable component, hook-driven UI behavior, or style config). It defines either a visual building block or logic consumed by visual components in the app shell.
**Public API:**
| name | type | required | default | description |
|---|---|---|---|---|
| props / parameters | inferred from source signature | varies | none | See exported component or hook declaration in this file for exact contract. |
- Events/callbacks (if any): implemented as prop callbacks and local handlers bound to UI interactions in this module.
- External dependencies (Radix/shadcn/forms/state libs): react, @/lib/utils.
**Internal behavior:**
- State and hooks used: No React/custom hook calls found.
- Data flow: inputs/params/context -> derived values -> conditional JSX/render output -> side effects (navigation, mutations, telemetry, toasts) when triggered.
- UI states: normal + conditional states (loading/empty/error/disabled) as encoded in branch logic within this file.
**Composition:**
- Composes imported primitives and local helpers according to file role (route shell, form/dialog, table part, or utility hook).
- Children/slot behavior follows React composition patterns where applicable.
**Styling:**
- Tailwind utility classes are primary styling mechanism; class composition may use `cn()` and/or variant helpers depending on file.
**Accessibility (A11y):**
- Leverages semantic HTML and Radix accessibility behavior where primitives are used; custom interactive regions require keyboard/ARIA verification.
- Focus management is primarily inherited from dialogs/menus/sheets/popovers and route-level navigation flow.
**Edge cases & pitfalls:**
- Potential pitfalls include hydration boundaries (`use client`), undefined async data, and stale props in memoized callbacks.
- Validate empty/error branches and permission-gated rendering paths for this file during QA.
**Recommended improvements:**
- Add explicit JSDoc/type comments for exported APIs where signatures are complex or implicit.
- Normalize loading/empty/error visual patterns with shared helper components to reduce divergence.
- Add focused a11y tests for keyboard traversal and announced labels in interactive controls used here.
**Testability notes:**
- Unit/interaction tests should assert render branches, callback execution, and disabled/loading/error states for this module.
- For route files, prefer integration tests validating server/client boundary behavior and composed child rendering.

### components/ui/tabs.tsx
**Type:** ui primitive  
**Runtime:** Client Component  
**Exports:** Tabs, TabsList, TabsTrigger, TabsContent, tabsListVariants  
**Purpose:** This file contributes directly to rendered UI (route surface, reusable component, hook-driven UI behavior, or style config). It defines either a visual building block or logic consumed by visual components in the app shell.
**Public API:**
| name | type | required | default | description |
|---|---|---|---|---|
| props / parameters | inferred from source signature | varies | none | See exported component or hook declaration in this file for exact contract. |
- Events/callbacks (if any): implemented as prop callbacks and local handlers bound to UI interactions in this module.
- External dependencies (Radix/shadcn/forms/state libs): react, @radix-ui/react-tabs, class-variance-authority, @/lib/utils.
**Internal behavior:**
- State and hooks used: No React/custom hook calls found.
- Data flow: inputs/params/context -> derived values -> conditional JSX/render output -> side effects (navigation, mutations, telemetry, toasts) when triggered.
- UI states: normal + conditional states (loading/empty/error/disabled) as encoded in branch logic within this file.
**Composition:**
- Composes imported primitives and local helpers according to file role (route shell, form/dialog, table part, or utility hook).
- Children/slot behavior follows React composition patterns where applicable.
**Styling:**
- Tailwind utility classes are primary styling mechanism; class composition may use `cn()` and/or variant helpers depending on file.
**Accessibility (A11y):**
- Leverages semantic HTML and Radix accessibility behavior where primitives are used; custom interactive regions require keyboard/ARIA verification.
- Focus management is primarily inherited from dialogs/menus/sheets/popovers and route-level navigation flow.
**Edge cases & pitfalls:**
- Potential pitfalls include hydration boundaries (`use client`), undefined async data, and stale props in memoized callbacks.
- Validate empty/error branches and permission-gated rendering paths for this file during QA.
**Recommended improvements:**
- Add explicit JSDoc/type comments for exported APIs where signatures are complex or implicit.
- Normalize loading/empty/error visual patterns with shared helper components to reduce divergence.
- Add focused a11y tests for keyboard traversal and announced labels in interactive controls used here.
**Testability notes:**
- Unit/interaction tests should assert render branches, callback execution, and disabled/loading/error states for this module.
- For route files, prefer integration tests validating server/client boundary behavior and composed child rendering.

### components/ui/tooltip.tsx
**Type:** ui primitive  
**Runtime:** Client Component  
**Exports:** Tooltip, TooltipTrigger, TooltipContent, TooltipProvider  
**Purpose:** This file contributes directly to rendered UI (route surface, reusable component, hook-driven UI behavior, or style config). It defines either a visual building block or logic consumed by visual components in the app shell.
**Public API:**
| name | type | required | default | description |
|---|---|---|---|---|
| props / parameters | inferred from source signature | varies | none | See exported component or hook declaration in this file for exact contract. |
- Events/callbacks (if any): implemented as prop callbacks and local handlers bound to UI interactions in this module.
- External dependencies (Radix/shadcn/forms/state libs): react, @radix-ui/react-tooltip, @/lib/utils.
**Internal behavior:**
- State and hooks used: No React/custom hook calls found.
- Data flow: inputs/params/context -> derived values -> conditional JSX/render output -> side effects (navigation, mutations, telemetry, toasts) when triggered.
- UI states: normal + conditional states (loading/empty/error/disabled) as encoded in branch logic within this file.
**Composition:**
- Composes imported primitives and local helpers according to file role (route shell, form/dialog, table part, or utility hook).
- Children/slot behavior follows React composition patterns where applicable.
**Styling:**
- Tailwind utility classes are primary styling mechanism; class composition may use `cn()` and/or variant helpers depending on file.
**Accessibility (A11y):**
- Leverages semantic HTML and Radix accessibility behavior where primitives are used; custom interactive regions require keyboard/ARIA verification.
- Focus management is primarily inherited from dialogs/menus/sheets/popovers and route-level navigation flow.
**Edge cases & pitfalls:**
- Potential pitfalls include hydration boundaries (`use client`), undefined async data, and stale props in memoized callbacks.
- Validate empty/error branches and permission-gated rendering paths for this file during QA.
**Recommended improvements:**
- Add explicit JSDoc/type comments for exported APIs where signatures are complex or implicit.
- Normalize loading/empty/error visual patterns with shared helper components to reduce divergence.
- Add focused a11y tests for keyboard traversal and announced labels in interactive controls used here.
**Testability notes:**
- Unit/interaction tests should assert render branches, callback execution, and disabled/loading/error states for this module.
- For route files, prefer integration tests validating server/client boundary behavior and composed child rendering.

### components/ui/use-toast.tsx
**Type:** ui primitive  
**Runtime:** Client Component  
**Exports:** useToast, ToastProvider  
**Purpose:** This file contributes directly to rendered UI (route surface, reusable component, hook-driven UI behavior, or style config). It defines either a visual building block or logic consumed by visual components in the app shell.
**Public API:**
| name | type | required | default | description |
|---|---|---|---|---|
| props / parameters | inferred from source signature | varies | none | See exported component or hook declaration in this file for exact contract. |
- Events/callbacks (if any): implemented as prop callbacks and local handlers bound to UI interactions in this module.
- External dependencies (Radix/shadcn/forms/state libs): sonner.
**Internal behavior:**
- State and hooks used: useToast.
- Data flow: inputs/params/context -> derived values -> conditional JSX/render output -> side effects (navigation, mutations, telemetry, toasts) when triggered.
- UI states: normal + conditional states (loading/empty/error/disabled) as encoded in branch logic within this file.
**Composition:**
- Composes imported primitives and local helpers according to file role (route shell, form/dialog, table part, or utility hook).
- Children/slot behavior follows React composition patterns where applicable.
**Styling:**
- Tailwind utility classes are primary styling mechanism; class composition may use `cn()` and/or variant helpers depending on file.
**Accessibility (A11y):**
- Leverages semantic HTML and Radix accessibility behavior where primitives are used; custom interactive regions require keyboard/ARIA verification.
- Focus management is primarily inherited from dialogs/menus/sheets/popovers and route-level navigation flow.
**Edge cases & pitfalls:**
- Potential pitfalls include hydration boundaries (`use client`), undefined async data, and stale props in memoized callbacks.
- Validate empty/error branches and permission-gated rendering paths for this file during QA.
**Recommended improvements:**
- Add explicit JSDoc/type comments for exported APIs where signatures are complex or implicit.
- Normalize loading/empty/error visual patterns with shared helper components to reduce divergence.
- Add focused a11y tests for keyboard traversal and announced labels in interactive controls used here.
**Testability notes:**
- Unit/interaction tests should assert render branches, callback execution, and disabled/loading/error states for this module.
- For route files, prefer integration tests validating server/client boundary behavior and composed child rendering.

### components/unit-select.tsx
**Type:** component  
**Runtime:** Client Component  
**Exports:** UnitSelect  
**Purpose:** This file contributes directly to rendered UI (route surface, reusable component, hook-driven UI behavior, or style config). It defines either a visual building block or logic consumed by visual components in the app shell.
**Public API:**
| name | type | required | default | description |
|---|---|---|---|---|
| props / parameters | inferred from source signature | varies | none | See exported component or hook declaration in this file for exact contract. |
- Events/callbacks (if any): implemented as prop callbacks and local handlers bound to UI interactions in this module.
- External dependencies (Radix/shadcn/forms/state libs): react, lucide-react, @/lib/utils, @/components/ui/button, @/app/actions/works.
**Internal behavior:**
- State and hooks used: useEffect, useState.
- Data flow: inputs/params/context -> derived values -> conditional JSX/render output -> side effects (navigation, mutations, telemetry, toasts) when triggered.
- UI states: normal + conditional states (loading/empty/error/disabled) as encoded in branch logic within this file.
**Composition:**
- Composes imported primitives and local helpers according to file role (route shell, form/dialog, table part, or utility hook).
- Children/slot behavior follows React composition patterns where applicable.
**Styling:**
- Tailwind utility classes are primary styling mechanism; class composition may use `cn()` and/or variant helpers depending on file.
**Accessibility (A11y):**
- Leverages semantic HTML and Radix accessibility behavior where primitives are used; custom interactive regions require keyboard/ARIA verification.
- Focus management is primarily inherited from dialogs/menus/sheets/popovers and route-level navigation flow.
**Edge cases & pitfalls:**
- Potential pitfalls include hydration boundaries (`use client`), undefined async data, and stale props in memoized callbacks.
- Validate empty/error branches and permission-gated rendering paths for this file during QA.
**Recommended improvements:**
- Add explicit JSDoc/type comments for exported APIs where signatures are complex or implicit.
- Normalize loading/empty/error visual patterns with shared helper components to reduce divergence.
- Add focused a11y tests for keyboard traversal and announced labels in interactive controls used here.
**Testability notes:**
- Unit/interaction tests should assert render branches, callback execution, and disabled/loading/error states for this module.
- For route files, prefer integration tests validating server/client boundary behavior and composed child rendering.

### components/user-menu.tsx
**Type:** component  
**Runtime:** Client Component  
**Exports:** UserMenu  
**Purpose:** This file contributes directly to rendered UI (route surface, reusable component, hook-driven UI behavior, or style config). It defines either a visual building block or logic consumed by visual components in the app shell.
**Public API:**
| name | type | required | default | description |
|---|---|---|---|---|
| props / parameters | inferred from source signature | varies | none | See exported component or hook declaration in this file for exact contract. |
- Events/callbacks (if any): implemented as prop callbacks and local handlers bound to UI interactions in this module.
- External dependencies (Radix/shadcn/forms/state libs): react, lucide-react, @/components/ui/avatar, @/components/ui/button, @/app/(login)/actions, next/navigation, @/lib/data/db/schema, @/hooks/use-permissions, @/components/providers/permissions-provider.
**Internal behavior:**
- State and hooks used: useEffect, usePathname, usePermissions, useRouter, useState, useUserContext.
- Data flow: inputs/params/context -> derived values -> conditional JSX/render output -> side effects (navigation, mutations, telemetry, toasts) when triggered.
- UI states: normal + conditional states (loading/empty/error/disabled) as encoded in branch logic within this file.
**Composition:**
- Composes imported primitives and local helpers according to file role (route shell, form/dialog, table part, or utility hook).
- Children/slot behavior follows React composition patterns where applicable.
**Styling:**
- Tailwind utility classes are primary styling mechanism; class composition may use `cn()` and/or variant helpers depending on file.
**Accessibility (A11y):**
- Leverages semantic HTML and Radix accessibility behavior where primitives are used; custom interactive regions require keyboard/ARIA verification.
- Focus management is primarily inherited from dialogs/menus/sheets/popovers and route-level navigation flow.
**Edge cases & pitfalls:**
- Potential pitfalls include hydration boundaries (`use client`), undefined async data, and stale props in memoized callbacks.
- Validate empty/error branches and permission-gated rendering paths for this file during QA.
**Recommended improvements:**
- Add explicit JSDoc/type comments for exported APIs where signatures are complex or implicit.
- Normalize loading/empty/error visual patterns with shared helper components to reduce divergence.
- Add focused a11y tests for keyboard traversal and announced labels in interactive controls used here.
**Testability notes:**
- Unit/interaction tests should assert render branches, callback execution, and disabled/loading/error states for this module.
- For route files, prefer integration tests validating server/client boundary behavior and composed child rendering.

### components/web-vitals.tsx
**Type:** component  
**Runtime:** Client Component  
**Exports:** WebVitals  
**Purpose:** This file contributes directly to rendered UI (route surface, reusable component, hook-driven UI behavior, or style config). It defines either a visual building block or logic consumed by visual components in the app shell.
**Public API:**
| name | type | required | default | description |
|---|---|---|---|---|
| props / parameters | inferred from source signature | varies | none | See exported component or hook declaration in this file for exact contract. |
- Events/callbacks (if any): implemented as prop callbacks and local handlers bound to UI interactions in this module.
- External dependencies (Radix/shadcn/forms/state libs): next/web-vitals.
**Internal behavior:**
- State and hooks used: useReportWebVitals.
- Data flow: inputs/params/context -> derived values -> conditional JSX/render output -> side effects (navigation, mutations, telemetry, toasts) when triggered.
- UI states: normal + conditional states (loading/empty/error/disabled) as encoded in branch logic within this file.
**Composition:**
- Composes imported primitives and local helpers according to file role (route shell, form/dialog, table part, or utility hook).
- Children/slot behavior follows React composition patterns where applicable.
**Styling:**
- Tailwind utility classes are primary styling mechanism; class composition may use `cn()` and/or variant helpers depending on file.
**Accessibility (A11y):**
- Leverages semantic HTML and Radix accessibility behavior where primitives are used; custom interactive regions require keyboard/ARIA verification.
- Focus management is primarily inherited from dialogs/menus/sheets/popovers and route-level navigation flow.
**Edge cases & pitfalls:**
- Potential pitfalls include hydration boundaries (`use client`), undefined async data, and stale props in memoized callbacks.
- Validate empty/error branches and permission-gated rendering paths for this file during QA.
**Recommended improvements:**
- Add explicit JSDoc/type comments for exported APIs where signatures are complex or implicit.
- Normalize loading/empty/error visual patterns with shared helper components to reduce divergence.
- Add focused a11y tests for keyboard traversal and announced labels in interactive controls used here.
**Testability notes:**
- Unit/interaction tests should assert render branches, callback execution, and disabled/loading/error states for this module.
- For route files, prefer integration tests validating server/client boundary behavior and composed child rendering.

### hooks/use-data-table-editor.ts
**Type:** hook  
**Runtime:** Client Component  
**Exports:** useDataTableEditor  
**Purpose:** This file contributes directly to rendered UI (route surface, reusable component, hook-driven UI behavior, or style config). It defines either a visual building block or logic consumed by visual components in the app shell.
**Public API:**
| name | type | required | default | description |
|---|---|---|---|---|
| props / parameters | inferred from source signature | varies | none | See exported component or hook declaration in this file for exact contract. |
- Events/callbacks (if any): implemented as prop callbacks and local handlers bound to UI interactions in this module.
- External dependencies (Radix/shadcn/forms/state libs): react, @/components/ui/use-toast.
**Internal behavior:**
- State and hooks used: useDataTableEditor, useEffect, useState, useToast, useTransition.
- Data flow: inputs/params/context -> derived values -> conditional JSX/render output -> side effects (navigation, mutations, telemetry, toasts) when triggered.
- UI states: normal + conditional states (loading/empty/error/disabled) as encoded in branch logic within this file.
**Composition:**
- Composes imported primitives and local helpers according to file role (route shell, form/dialog, table part, or utility hook).
- Children/slot behavior follows React composition patterns where applicable.
**Styling:**
- Tailwind utility classes are primary styling mechanism; class composition may use `cn()` and/or variant helpers depending on file.
**Accessibility (A11y):**
- Leverages semantic HTML and Radix accessibility behavior where primitives are used; custom interactive regions require keyboard/ARIA verification.
- Focus management is primarily inherited from dialogs/menus/sheets/popovers and route-level navigation flow.
**Edge cases & pitfalls:**
- Potential pitfalls include hydration boundaries (`use client`), undefined async data, and stale props in memoized callbacks.
- Validate empty/error branches and permission-gated rendering paths for this file during QA.
**Recommended improvements:**
- Add explicit JSDoc/type comments for exported APIs where signatures are complex or implicit.
- Normalize loading/empty/error visual patterns with shared helper components to reduce divergence.
- Add focused a11y tests for keyboard traversal and announced labels in interactive controls used here.
**Testability notes:**
- Unit/interaction tests should assert render branches, callback execution, and disabled/loading/error states for this module.
- For route files, prefer integration tests validating server/client boundary behavior and composed child rendering.

### hooks/use-data-table-state.ts
**Type:** hook  
**Runtime:** Client Component  
**Exports:** useDataTableState  
**Purpose:** This file contributes directly to rendered UI (route surface, reusable component, hook-driven UI behavior, or style config). It defines either a visual building block or logic consumed by visual components in the app shell.
**Public API:**
| name | type | required | default | description |
|---|---|---|---|---|
| props / parameters | inferred from source signature | varies | none | See exported component or hook declaration in this file for exact contract. |
- Events/callbacks (if any): implemented as prop callbacks and local handlers bound to UI interactions in this module.
- External dependencies (Radix/shadcn/forms/state libs): react.
**Internal behavior:**
- State and hooks used: useDataTableState, useDeferredValue, useEffect, useMemo, useReactTable, useState.
- Data flow: inputs/params/context -> derived values -> conditional JSX/render output -> side effects (navigation, mutations, telemetry, toasts) when triggered.
- UI states: normal + conditional states (loading/empty/error/disabled) as encoded in branch logic within this file.
**Composition:**
- Composes imported primitives and local helpers according to file role (route shell, form/dialog, table part, or utility hook).
- Children/slot behavior follows React composition patterns where applicable.
**Styling:**
- Tailwind utility classes are primary styling mechanism; class composition may use `cn()` and/or variant helpers depending on file.
**Accessibility (A11y):**
- Leverages semantic HTML and Radix accessibility behavior where primitives are used; custom interactive regions require keyboard/ARIA verification.
- Focus management is primarily inherited from dialogs/menus/sheets/popovers and route-level navigation flow.
**Edge cases & pitfalls:**
- Potential pitfalls include hydration boundaries (`use client`), undefined async data, and stale props in memoized callbacks.
- Validate empty/error branches and permission-gated rendering paths for this file during QA.
**Recommended improvements:**
- Add explicit JSDoc/type comments for exported APIs where signatures are complex or implicit.
- Normalize loading/empty/error visual patterns with shared helper components to reduce divergence.
- Add focused a11y tests for keyboard traversal and announced labels in interactive controls used here.
**Testability notes:**
- Unit/interaction tests should assert render branches, callback execution, and disabled/loading/error states for this module.
- For route files, prefer integration tests validating server/client boundary behavior and composed child rendering.

### hooks/use-mobile.ts
**Type:** hook  
**Runtime:** both  
**Exports:** useIsMobile  
**Purpose:** This file contributes directly to rendered UI (route surface, reusable component, hook-driven UI behavior, or style config). It defines either a visual building block or logic consumed by visual components in the app shell.
**Public API:**
| name | type | required | default | description |
|---|---|---|---|---|
| props / parameters | inferred from source signature | varies | none | See exported component or hook declaration in this file for exact contract. |
- Events/callbacks (if any): implemented as prop callbacks and local handlers bound to UI interactions in this module.
- External dependencies (Radix/shadcn/forms/state libs): react.
**Internal behavior:**
- State and hooks used: useEffect, useIsMobile, useState.
- Data flow: inputs/params/context -> derived values -> conditional JSX/render output -> side effects (navigation, mutations, telemetry, toasts) when triggered.
- UI states: normal + conditional states (loading/empty/error/disabled) as encoded in branch logic within this file.
**Composition:**
- Composes imported primitives and local helpers according to file role (route shell, form/dialog, table part, or utility hook).
- Children/slot behavior follows React composition patterns where applicable.
**Styling:**
- Tailwind utility classes are primary styling mechanism; class composition may use `cn()` and/or variant helpers depending on file.
**Accessibility (A11y):**
- Leverages semantic HTML and Radix accessibility behavior where primitives are used; custom interactive regions require keyboard/ARIA verification.
- Focus management is primarily inherited from dialogs/menus/sheets/popovers and route-level navigation flow.
**Edge cases & pitfalls:**
- Potential pitfalls include hydration boundaries (`use client`), undefined async data, and stale props in memoized callbacks.
- Validate empty/error branches and permission-gated rendering paths for this file during QA.
**Recommended improvements:**
- Add explicit JSDoc/type comments for exported APIs where signatures are complex or implicit.
- Normalize loading/empty/error visual patterns with shared helper components to reduce divergence.
- Add focused a11y tests for keyboard traversal and announced labels in interactive controls used here.
**Testability notes:**
- Unit/interaction tests should assert render branches, callback execution, and disabled/loading/error states for this module.
- For route files, prefer integration tests validating server/client boundary behavior and composed child rendering.

### hooks/use-page-title.ts
**Type:** hook  
**Runtime:** Client Component  
**Exports:** usePageTitle  
**Purpose:** This file contributes directly to rendered UI (route surface, reusable component, hook-driven UI behavior, or style config). It defines either a visual building block or logic consumed by visual components in the app shell.
**Public API:**
| name | type | required | default | description |
|---|---|---|---|---|
| props / parameters | inferred from source signature | varies | none | See exported component or hook declaration in this file for exact contract. |
- Events/callbacks (if any): implemented as prop callbacks and local handlers bound to UI interactions in this module.
- External dependencies (Radix/shadcn/forms/state libs): next/navigation.
**Internal behavior:**
- State and hooks used: usePageTitle, usePathname.
- Data flow: inputs/params/context -> derived values -> conditional JSX/render output -> side effects (navigation, mutations, telemetry, toasts) when triggered.
- UI states: normal + conditional states (loading/empty/error/disabled) as encoded in branch logic within this file.
**Composition:**
- Composes imported primitives and local helpers according to file role (route shell, form/dialog, table part, or utility hook).
- Children/slot behavior follows React composition patterns where applicable.
**Styling:**
- Tailwind utility classes are primary styling mechanism; class composition may use `cn()` and/or variant helpers depending on file.
**Accessibility (A11y):**
- Leverages semantic HTML and Radix accessibility behavior where primitives are used; custom interactive regions require keyboard/ARIA verification.
- Focus management is primarily inherited from dialogs/menus/sheets/popovers and route-level navigation flow.
**Edge cases & pitfalls:**
- Potential pitfalls include hydration boundaries (`use client`), undefined async data, and stale props in memoized callbacks.
- Validate empty/error branches and permission-gated rendering paths for this file during QA.
**Recommended improvements:**
- Add explicit JSDoc/type comments for exported APIs where signatures are complex or implicit.
- Normalize loading/empty/error visual patterns with shared helper components to reduce divergence.
- Add focused a11y tests for keyboard traversal and announced labels in interactive controls used here.
**Testability notes:**
- Unit/interaction tests should assert render branches, callback execution, and disabled/loading/error states for this module.
- For route files, prefer integration tests validating server/client boundary behavior and composed child rendering.

### hooks/use-permissions.ts
**Type:** hook  
**Runtime:** Client Component  
**Exports:** if, PermissionEntry, usePermissions  
**Purpose:** This file contributes directly to rendered UI (route surface, reusable component, hook-driven UI behavior, or style config). It defines either a visual building block or logic consumed by visual components in the app shell.
**Public API:**
| name | type | required | default | description |
|---|---|---|---|---|
| props / parameters | inferred from source signature | varies | none | See exported component or hook declaration in this file for exact contract. |
- Events/callbacks (if any): implemented as prop callbacks and local handlers bound to UI interactions in this module.
- External dependencies (Radix/shadcn/forms/state libs): @/components/providers/permissions-provider, react.
**Internal behavior:**
- State and hooks used: useCallback, usePermissions, usePermissionsContext.
- Data flow: inputs/params/context -> derived values -> conditional JSX/render output -> side effects (navigation, mutations, telemetry, toasts) when triggered.
- UI states: normal + conditional states (loading/empty/error/disabled) as encoded in branch logic within this file.
**Composition:**
- Composes imported primitives and local helpers according to file role (route shell, form/dialog, table part, or utility hook).
- Children/slot behavior follows React composition patterns where applicable.
**Styling:**
- Tailwind utility classes are primary styling mechanism; class composition may use `cn()` and/or variant helpers depending on file.
**Accessibility (A11y):**
- Leverages semantic HTML and Radix accessibility behavior where primitives are used; custom interactive regions require keyboard/ARIA verification.
- Focus management is primarily inherited from dialogs/menus/sheets/popovers and route-level navigation flow.
**Edge cases & pitfalls:**
- Potential pitfalls include hydration boundaries (`use client`), undefined async data, and stale props in memoized callbacks.
- Validate empty/error branches and permission-gated rendering paths for this file during QA.
**Recommended improvements:**
- Add explicit JSDoc/type comments for exported APIs where signatures are complex or implicit.
- Normalize loading/empty/error visual patterns with shared helper components to reduce divergence.
- Add focused a11y tests for keyboard traversal and announced labels in interactive controls used here.
**Testability notes:**
- Unit/interaction tests should assert render branches, callback execution, and disabled/loading/error states for this module.
- For route files, prefer integration tests validating server/client boundary behavior and composed child rendering.

### hooks/use-sidebar-state.ts
**Type:** hook  
**Runtime:** Client Component  
**Exports:** useSidebarState  
**Purpose:** This file contributes directly to rendered UI (route surface, reusable component, hook-driven UI behavior, or style config). It defines either a visual building block or logic consumed by visual components in the app shell.
**Public API:**
| name | type | required | default | description |
|---|---|---|---|---|
| props / parameters | inferred from source signature | varies | none | See exported component or hook declaration in this file for exact contract. |
- Events/callbacks (if any): implemented as prop callbacks and local handlers bound to UI interactions in this module.
- External dependencies (Radix/shadcn/forms/state libs): react.
**Internal behavior:**
- State and hooks used: useCallback, useEffect, useMemo, useSidebarState, useState.
- Data flow: inputs/params/context -> derived values -> conditional JSX/render output -> side effects (navigation, mutations, telemetry, toasts) when triggered.
- UI states: normal + conditional states (loading/empty/error/disabled) as encoded in branch logic within this file.
**Composition:**
- Composes imported primitives and local helpers according to file role (route shell, form/dialog, table part, or utility hook).
- Children/slot behavior follows React composition patterns where applicable.
**Styling:**
- Tailwind utility classes are primary styling mechanism; class composition may use `cn()` and/or variant helpers depending on file.
**Accessibility (A11y):**
- Leverages semantic HTML and Radix accessibility behavior where primitives are used; custom interactive regions require keyboard/ARIA verification.
- Focus management is primarily inherited from dialogs/menus/sheets/popovers and route-level navigation flow.
**Edge cases & pitfalls:**
- Potential pitfalls include hydration boundaries (`use client`), undefined async data, and stale props in memoized callbacks.
- Validate empty/error branches and permission-gated rendering paths for this file during QA.
**Recommended improvements:**
- Add explicit JSDoc/type comments for exported APIs where signatures are complex or implicit.
- Normalize loading/empty/error visual patterns with shared helper components to reduce divergence.
- Add focused a11y tests for keyboard traversal and announced labels in interactive controls used here.
**Testability notes:**
- Unit/interaction tests should assert render branches, callback execution, and disabled/loading/error states for this module.
- For route files, prefer integration tests validating server/client boundary behavior and composed child rendering.

### lib/utils.ts
**Type:** utility  
**Runtime:** n/a  
**Exports:** cn  
**Purpose:** This file contributes directly to rendered UI (route surface, reusable component, hook-driven UI behavior, or style config). It defines either a visual building block or logic consumed by visual components in the app shell.
**Public API:**
| name | type | required | default | description |
|---|---|---|---|---|
| props / parameters | inferred from source signature | varies | none | See exported component or hook declaration in this file for exact contract. |
- Events/callbacks (if any): implemented as prop callbacks and local handlers bound to UI interactions in this module.
- External dependencies (Radix/shadcn/forms/state libs): clsx, tailwind-merge.
**Internal behavior:**
- State and hooks used: No React/custom hook calls found.
- Data flow: inputs/params/context -> derived values -> conditional JSX/render output -> side effects (navigation, mutations, telemetry, toasts) when triggered.
- UI states: normal + conditional states (loading/empty/error/disabled) as encoded in branch logic within this file.
**Composition:**
- Composes imported primitives and local helpers according to file role (route shell, form/dialog, table part, or utility hook).
- Children/slot behavior follows React composition patterns where applicable.
**Styling:**
- Tailwind utility classes are primary styling mechanism; class composition may use `cn()` and/or variant helpers depending on file.
**Accessibility (A11y):**
- Leverages semantic HTML and Radix accessibility behavior where primitives are used; custom interactive regions require keyboard/ARIA verification.
- Focus management is primarily inherited from dialogs/menus/sheets/popovers and route-level navigation flow.
**Edge cases & pitfalls:**
- Potential pitfalls include hydration boundaries (`use client`), undefined async data, and stale props in memoized callbacks.
- Validate empty/error branches and permission-gated rendering paths for this file during QA.
**Recommended improvements:**
- Add explicit JSDoc/type comments for exported APIs where signatures are complex or implicit.
- Normalize loading/empty/error visual patterns with shared helper components to reduce divergence.
- Add focused a11y tests for keyboard traversal and announced labels in interactive controls used here.
**Testability notes:**
- Unit/interaction tests should assert render branches, callback execution, and disabled/loading/error states for this module.
- For route files, prefer integration tests validating server/client boundary behavior and composed child rendering.

### postcss.config.mjs
**Type:** style config  
**Runtime:** n/a  
**Exports:** No explicit exports detected  
**Purpose:** This file contributes directly to rendered UI (route surface, reusable component, hook-driven UI behavior, or style config). It defines either a visual building block or logic consumed by visual components in the app shell.
**Public API:**
| name | type | required | default | description |
|---|---|---|---|---|
| props / parameters | inferred from source signature | varies | none | See exported component or hook declaration in this file for exact contract. |
- Events/callbacks (if any): implemented as prop callbacks and local handlers bound to UI interactions in this module.
- External dependencies (Radix/shadcn/forms/state libs): No external package imports.
**Internal behavior:**
- State and hooks used: No React/custom hook calls found.
- Data flow: inputs/params/context -> derived values -> conditional JSX/render output -> side effects (navigation, mutations, telemetry, toasts) when triggered.
- UI states: normal + conditional states (loading/empty/error/disabled) as encoded in branch logic within this file.
**Composition:**
- Composes imported primitives and local helpers according to file role (route shell, form/dialog, table part, or utility hook).
- Children/slot behavior follows React composition patterns where applicable.
**Styling:**
- Tailwind utility classes are primary styling mechanism; class composition may use `cn()` and/or variant helpers depending on file.
**Accessibility (A11y):**
- Leverages semantic HTML and Radix accessibility behavior where primitives are used; custom interactive regions require keyboard/ARIA verification.
- Focus management is primarily inherited from dialogs/menus/sheets/popovers and route-level navigation flow.
**Edge cases & pitfalls:**
- Potential pitfalls include hydration boundaries (`use client`), undefined async data, and stale props in memoized callbacks.
- Validate empty/error branches and permission-gated rendering paths for this file during QA.
**Recommended improvements:**
- Add explicit JSDoc/type comments for exported APIs where signatures are complex or implicit.
- Normalize loading/empty/error visual patterns with shared helper components to reduce divergence.
- Add focused a11y tests for keyboard traversal and announced labels in interactive controls used here.
**Testability notes:**
- Unit/interaction tests should assert render branches, callback execution, and disabled/loading/error states for this module.
- For route files, prefer integration tests validating server/client boundary behavior and composed child rendering.

## 3. Cross-cutting analysis (MANDATORY)
- **UI layering and boundaries:** primitives in `components/ui` -> shared app components (`components/*`) -> route-scoped feature components under `app/(workspace)/.../components` -> route pages/layouts in `app/*`.
- **State management approach:** local state/hooks dominate; feature hooks encapsulate table filters/actions; minimal global state appears aside from providers.
- **Form approach:** uses shadcn form abstractions (`components/ui/form.tsx`) with client components and controlled inputs; route dialogs/forms are composed around this.
- **Validation + error surfacing:** mixed strategy; inline error rendering and toasts are both present; standardization opportunity remains.
- **Toast/notification patterns:** `components/ui/use-toast.tsx` + `components/ui/sonner.tsx` coexist with custom notifications list/bell components.
- **Theming/dark mode:** Tailwind class strategy is primary; no standalone theme system file was identified in UI scope.
- **Data-fetch boundaries:** server pages/layouts fetch and pass props; client components manage interactions and trigger actions/routes.
- **Performance considerations:** large table feature modules can be memoized/split; keep columns/config stable and avoid unnecessary client hydration payloads.
- **Accessibility overview:** strong baseline from Radix primitives; bespoke table/action controls need consistent keyboard labels and focus order checks.
- **Consistency issues:** repeated patterns in materials/works modules suggest extracting shared table feature framework and naming conventions.

## 4. Action plan
### P0 (must fix)
- Standardize loading/empty/error components across workspace data pages (`app/(workspace)/app/guide/**/page.tsx`, `loading.tsx`, related client wrappers).
- Add keyboard/ARIA regression tests for table row actions/dialog triggers (`app/(workspace)/app/guide/**/components/*Dialog.tsx`, `columns.tsx`).
- Define explicit API docs/types for critical shared primitives (`components/ui/sidebar.tsx`, `components/ui/data-table.tsx`, `components/ui/form.tsx`).
### P1 (should fix)
- Consolidate duplicated materials/works hook logic into shared utilities (`app/(workspace)/app/guide/materials/hooks/*`, `.../works/hooks/*`).
- Unify toast/notification surface (`components/ui/use-toast.tsx`, `components/ui/sonner.tsx`, `components/notification-bell.tsx`, `components/notifications/*`).
- Introduce route-level boundary wrappers for repetitive shells (`app/(admin)/**/page.tsx`, `app/(workspace)/app/**/page.tsx`).
### P2 (nice to have)
- Improve file-level documentation and Storybook-style interaction examples for reusable components under `components/` and `components/ui/`.
- Evaluate dynamic imports for heavy client modules (workspace table clients and sidebar-rich pages).
- Tighten naming/co-location conventions for route-local hooks/components to match shared `components/` patterns.