# UI Governance

> **Owner:** Architecture Team
> **Status:** Active — Phase 1 baseline (see note below)
> **Applies to:** All UI code in `app/**`, `features/**`, `components/layout/**`, `components/navigation/**`, `shared/ui/`, and related directories.
>
> *Phase 1 — EPIC #275: Transfer visual class ownership to shared/ui.*

> **⚠️ Baseline note:** This document is Phase 1 governance baseline. Some contracts are target contracts and must be enforced only after corresponding migration phases. Until migration is complete, existing visual debt is tracked but not release-blocking.

---

## Rule 0: Scopes Don't Own Visual Classes

**`app/**`, `features/**`, `components/layout/**`, `components/navigation/**` must not hold or define visual (Tailwind) classes.**

These scopes **select** visual presentation via **semantic props only**. The visual implementation — Tailwind utility classes, CSS modules, etc. — belongs exclusively in `shared/ui/`.

**✅ Allowed in scopes:**
```tsx
<Button variant="primary" tone="brand" size="md" />
<Card variant="elevated" density="compact" />
<Badge intent="success" />
```

**❌ Forbidden in scopes:**
```tsx
<button className="bg-blue-600 text-white px-4 py-2 rounded-md">  {/* visual class ownership violation */}
<Card className="shadow-lg border-2 border-blue-500">             {/* visual class ownership violation */}
```

**Rule 0 applies to all files under `app/**`, `features/**`, `components/layout/**`, `components/navigation/**` with the following legacy debt exceptions until Phase 12:**

- `app/page.tsx` — marketing exception, **temporary legacy debt** until Phase 12 (see Marketing section)
- `features/auth/*` — **temporary legacy debt** until Phase 12 (see Auth section)

---

## Owner Categories

Every visual class, component, and token in the codebase must be assigned to exactly one owner category.

| Category | Description | Visibility |
|----------|-------------|------------|
| `primitive` | Base design tokens (colors, spacing, density, typography). Defined in `shared/ui/primitive-*.ts` and Tailwind config. | `shared/ui` |
| `semantic-shared` | Standard reusable components owned by platform UI. The default destination for new shared components. | `shared/ui` |
| `feature-family` | Recognised feature-level visual contracts grouped by domain (estimate, catalog, dashboard). Must be approved by architecture. | `shared/ui` |
| `layout` | Page shells, workspace frames, and content containers. | `shared/ui` |
| `auth` | **Temporary.** Auth-specific visual classes. Target: `shared/ui/auth/*` or shared auth contracts. | `features/auth/*` → `shared/ui/auth/*` |
| `marketing` | **Temporary.** Landing page visual classes until Phase 12. Target: shared marketing contracts. | `app/page.tsx` → `shared/ui/marketing/*` |
| `compatibility` | Temporary legacy wrappers for backwards compatibility. Must include a deprecation target version. | `shared/ui` |
| `deprecated` | Scheduled for removal. Not to be used in new code. | any |
| `needs-review` | Categories unknown or pending classification. Must be resolved before release. | any |

---

### Primitive

Base design tokens that all other layers consume. No component logic, no React — pure token maps.

**Location:** `shared/ui/primitive-*.ts`:
  - `primitive-controls.ts` — Button, Input, Select, Toggle, KBD, InputGroup, Textarea, Visual icon tokens
  - `primitive-spacing.ts` — Surface density, Empty state, Calendar, Accordion, Chart layout spacing
  - `primitive-surface.ts` — Card, CardShell, Visual surface, Visual typography, Semantic tone tokens
  - `primitive-table.ts` — DataTable, Table, TableDensity, Cell tokens
  - `primitive-overlay.ts` — Drawer tokens (Dialog, Sheet, Popover — inline)
  - `primitive-form.ts` — Field padding tokens
  - `primitive-navigation.ts` — Tabs, PageShell tokens
  - `primitive-chart.ts` — Chart, Chart legend, Chart indicator tokens
  - `primitive-badge.ts` — Badge, StatusBadge, CatalogToken tokens
  - `primitive-density.ts` — **Deprecated barrel file.** Re-exports all domain files for backward compatibility. Import from domain files directly for new code.

**Owner:** Platform Design System
**Allowed props:** — (tokens, not components)

---

### Semantic-Shared

Standard, reusable components that any feature can consume. This is the **default** owner for any new shared component unless a specific exception applies.

**Location:** `shared/ui/*` (excluding components assigned to other categories)

**Owner:** Platform UI Team
**Allowed props:** variant, tone, density, size, layout, intent, overflow, shadow, radius, border, interactive

---

### Feature-Family

Recognised feature-level visual contracts. These cross the boundary from generic UI into domain-specific presentation. Must be approved by architecture before assigning this category.

**Location:** `shared/ui/*` (domain-named components)

**Owner:** Respective domain team (estimates, catalog, analytics, admin)
**Allowed props:** variant, tone, density, size, layout, intent, overflow, shadow, radius, border, interactive

---

### Layout

Page-level shells, workspace frames, and content-area containers.

**Location:** `shared/ui/page-shell.tsx`, `shared/ui/admin-surface.tsx`

**Owner:** Platform UI Team
**Allowed props:** variant, density, layout

---

### Auth (Temporary Legacy Debt)

Auth-specific visual classes currently in `features/auth/*`. **This is temporary legacy debt.** Final target: `shared/ui/auth/*` or shared auth contracts.

The `auth` owner category will be removed in Phase 12. All auth visual classes must migrate to shared/ui/auth components.

**Current location:** `features/auth/*`
**Target location:** `shared/ui/auth/*`
**Migration:** Phase 12

---

### Marketing (Temporary Legacy Debt)

Landing page and marketing section visual classes currently in `app/page.tsx`. **This is temporary legacy debt.** Final target: shared marketing contracts.

The `marketing` owner category will be removed in Phase 12. All marketing visual classes must migrate to shared marketing components.

**Current location:** `app/page.tsx`
**Target location:** `shared/ui/marketing/*`
**Migration:** Phase 12

---

### Compatibility

Temporary legacy wrappers that provide backwards-compatible APIs while consumers migrate to the new system.

**Must include:** Target version when the compat layer will be removed.

**Owner:** Architecture Team (managed rollout)

---

### Deprecated

Classes and components that are scheduled for removal. Must not be used in new code. Existing consumers must migrate before the removal version.

**Owner:** N/A (being removed)

---

### Needs-Review

Visual classes discovered during audit that don't have an owner category. Must be classified before the next release.

**Process:** File a ticket against EPIC #275 with the component/class location. Architecture team assigns a category.

---

## Allowed Semantic Props

`app/**`, `features/**`, `components/layout/**`, `components/navigation/**` must replace `className` usage with the following semantic props. Props are defined by each component's accepted prop list (see owner contracts below).

| Prop | Purpose | Example values |
|------|---------|----------------|
| `variant` | Visual style variation | `primary`, `secondary`, `ghost`, `outline`, `elevated`, `flat` |
| `tone` | Colour/hierarchy tone | `brand`, `neutral`, `muted`, `accent` |
| `density` | Spacing / compactness | `compact`, `normal`, `relaxed` |
| `size` | Physical size | `xs`, `sm`, `md`, `lg`, `xl` |
| `layout` | Arrangement / orientation | `horizontal`, `vertical`, `grid`, `stack`, `inline` |
| `intent` | Semantic meaning | `success`, `warning`, `error`, `info`, `neutral` |
| `overflow` | Overflow behaviour | `auto`, `hidden`, `scroll`, `clip`, `visible` |
| `shadow` | Elevation / shadow style | `none`, `sm`, `md`, `lg`, `xl` |
| `radius` | Corner rounding | `none`, `sm`, `md`, `lg`, `full` |
| `border` | Border style | `none`, `hairline`, `thin`, `thick` |
| `interactive` | Interactive behaviour hint | `clickable`, `selectable`, `draggable`, `resizeable` |

**⚠️ Each component only accepts a subset — check its owner contract.**

---

## Process: Migration

### Existing Visual Debt

1. **Classify** every className usage found in `app/**`, `features/**`, `components/layout/**`, `components/navigation/**` (exceptions: `app/page.tsx` and `features/auth/*` are legacy debt, tracked until Phase 12).
2. Assign each to an **owner category** based on the component it wraps.
3. If the target component does not yet accept the required semantic prop(s):
   - Add the prop to the component's accepted props (update owner contract).
   - Implement the prop in the `shared/ui` component.
4. Replace `className` in the scoped component with the equivalent semantic prop(s).
5. Remove the visual class definition from the scoped file.

### New Code

- **All new UI must be built from `shared/ui` components.**
- `app/**`, `features/**`, `components/layout/**`, `components/navigation/**` must use only semantic props — zero `className` or direct Tailwind usage.
- If a needed visual combination doesn't exist, either:
  - Extend the existing `shared/ui` component with a new prop value, or
  - Propose a new `shared/ui` component (assigned `semantic-shared`).

### Audit Enforcement (Phase 14)

- Phase 14 will introduce tooling (lint rule, CI check) to enforce Rule 0.
- Until then, enforcement is by **code review policy**:
  - PRs with new `className` in `app/**`, `features/**`, `components/layout/**`, `components/navigation/**` (excluding legacy debt paths) must be rejected.
  - PRs adding Tailwind classes outside `shared/ui` must be rejected.

---

## Owner Contract Format

Every component that exposes visual classes must have an **owner contract** documented here. The contract defines:

- Who owns the visual implementation
- Which semantic props are accepted
- Where visual classes live (and where they don't)
- Migration path from current state to target state

### Template

```txt
Component: <name>
File: <relative-path>
Owner: <owner-category>
Tokens: <comma-separated list of token/className maps consumed>

Current API: <props currently accepted by the component>
Target API: <props the component should accept after migration>
Migration required: <yes/no — if yes, link to phase>

Visual policy: <description of where Tailwind classes are defined>
```

---

## Owner Contracts

### Button

```
Component: Button
File: shared/ui/button.tsx
Owner: semantic-shared
Tokens: primitiveButtonSizeClassNames, primitiveButtonBaseClassName

Current API: variant, size, loading, asChild, iconLeft, iconRight, className
Target API: variant, size, loading, asChild, iconLeft, iconRight
Migration required: yes — remove className prop

Visual policy: All Tailwind classes defined in button.tsx.
```

### Input

```
Component: Input
File: shared/ui/input.tsx
Owner: semantic-shared
Tokens: primitiveInputBaseClassName, primitiveInputSizeClassNames

Current API: variant, size, textAlign, numeric, type, className
Target API: variant, size, textAlign, numeric, type
Migration required: yes — remove className prop

Visual policy: All Tailwind classes defined in input.tsx.
```

### Badge

```
Component: Badge
File: shared/ui/badge.tsx
Owner: semantic-shared
Tokens: primitiveBadgeBaseClassName, primitiveBadgeVariantClassNames, primitiveBadgeSizeClassNames

Current API: variant, size, className
Target API: variant, size
Migration required: yes — remove className prop

Visual policy: All Tailwind classes defined in badge.tsx.
```

### Card

```
Component: Card
File: shared/ui/card.tsx
Owner: semantic-shared
Tokens: N/A — inline Tailwind classes in card.tsx

Current API: className
Target API: variant, density, shadow, radius, border, interactive
Migration required: yes — add semantic props, reduce className dependency

Visual policy: All Tailwind classes defined in card.tsx.
```

### Surface

```
Component: Surface
File: shared/ui/surface.tsx
Owner: semantic-shared
Tokens: primitiveSurfaceDensityClassNames

Current API: variant, density, shadow, radius, overflow, className
Target API: variant, density, shadow, radius, overflow
Migration required: yes — remove className prop

Visual policy: All Tailwind classes defined in surface.tsx.
```

### Dialog

```
Component: Dialog
File: shared/ui/dialog.tsx
Owner: semantic-shared
Tokens: N/A — inline Tailwind classes in dialog.tsx

Current API: size, layout, className
Target API: variant, size, density, shadow, layout
Migration required: yes — add semantic props

Visual policy: All Tailwind classes defined in dialog.tsx.
```

### Sheet

```
Component: Sheet
File: shared/ui/sheet.tsx
Owner: semantic-shared
Tokens: N/A — inline Tailwind classes in sheet.tsx

Current API: size, className
Target API: variant, size, density, shadow
Migration required: yes — add semantic props

Visual policy: All Tailwind classes defined in sheet.tsx.
```

### Popover

```
Component: Popover
File: shared/ui/popover.tsx
Owner: semantic-shared
Tokens: N/A — inline Tailwind classes in popover.tsx

Current API: size, padding, className
Target API: variant, density, shadow, radius, size, padding
Migration required: yes — add semantic props

Visual policy: All Tailwind classes defined in popover.tsx.
```

### Toolbar

```
Component: Toolbar
File: shared/ui/toolbar.tsx
Owner: semantic-shared
Tokens: N/A — inline Tailwind classes in toolbar.tsx

Current API: responsive, align, className
Target API: variant, density, layout
Migration required: yes — reduce className dependency

Visual policy: All Tailwind classes defined in toolbar.tsx.
```

### FilterBar

```
Component: FilterBar
File: shared/ui/filter-bar.tsx
Owner: semantic-shared
Tokens: N/A — inline Tailwind classes

Current API: className
Target API: variant, density, layout
Migration required: yes — add semantic props

Visual policy: All Tailwind classes defined in filter-bar.tsx.
```

### SearchControl

```
Component: SearchControl
File: shared/ui/search-control.tsx
Owner: semantic-shared
Tokens: N/A — inline Tailwind classes

Current API: size, className
Target API: variant, size, density, tone
Migration required: yes — add semantic props

Visual policy: All Tailwind classes defined in search-control.tsx.
```

### Tabs

```
Component: Tabs
File: shared/ui/tabs.tsx
Owner: semantic-shared
Tokens: primitiveTabsRootClassName, primitiveTabsListBaseClassName, primitiveTabsTriggerClassName, primitiveTabsContentClassName

Current API: variant, orientation, className
Target API: variant, size, density, layout
Migration required: yes — reduce className dependency

Visual policy: All Tailwind classes defined in tabs.tsx.
```

### Select

```
Component: Select
File: shared/ui/select.tsx
Owner: semantic-shared
Tokens: primitiveSelectTriggerClassName, primitiveSelectContentClassName, primitiveSelectItemClassName, primitiveSelectLabelClassName

Current API: size, className
Target API: variant, size, density, tone, intent
Migration required: yes — add semantic props

Visual policy: All Tailwind classes defined in select.tsx.
```

### Textarea

```
Component: Textarea
File: shared/ui/textarea.tsx
Owner: semantic-shared
Tokens: primitiveTextareaBaseClassName, primitiveTextareaVariantClassNames

Current API: variant, className
Target API: variant, size, density, tone, intent
Migration required: yes — add size/density/tone/intent props

Visual policy: All Tailwind classes defined in textarea.tsx.
```

### DataTable

```
Component: DataTable
File: shared/ui/data-table.tsx
Owner: semantic-shared
Tokens: primitiveDataTableHeaderClassName, primitiveDataTableBodyCellClassName, primitiveDataTableContainerClassName

Current API: columns, data, height, filterColumn, filterPlaceholder, actions, emptyState,
            tableContainerClassName, headerRowClassName, getRowClassName, className
Target API: variant, density, layout, overflow, columns, data, height
Migration required: yes — migrate className/containerClassName/rowClassName to semantic props

Visual policy: All Tailwind classes defined in data-table.tsx. Row/cell classes in data-table/*
```

### FormLayout

```
Component: FormLayout
File: shared/ui/form-layout.tsx
Owner: semantic-shared
Tokens: formLayoutVariants

Current API: gap, maxWidth, padding, className
Target API: variant, density, layout, gap, maxWidth
Migration required: yes — reduce className dependency

Visual policy: All Tailwind classes defined in form-layout.tsx.
```

### ActionMenu

```
Component: ActionMenu
File: shared/ui/action-menu.tsx
Owner: semantic-shared
Tokens: N/A — inline Tailwind classes

Current API: variant, size, align, className
Target API: variant, size, density, align
Migration required: yes — reduce className dependency

Visual policy: All Tailwind classes defined in action-menu.tsx.
```

### StatusBadge

```
Component: StatusBadge
File: shared/ui/status-badge.tsx
Owner: semantic-shared
Tokens: primitiveBadgeVariantClassNames

Current API: variant, status, size, className
Target API: variant, size, density, intent
Migration required: yes — add density/intent, reduce className dependency

Visual policy: All Tailwind classes defined in status-badge.tsx.
```

### Skeleton

```
Component: Skeleton
File: shared/ui/skeleton.tsx
Owner: semantic-shared
Tokens: N/A — inline Tailwind classes

Current API: className
Target API: variant, size, density
Migration required: yes — add semantic props

Visual policy: All Tailwind classes defined in skeleton.tsx.
```

### LoadingIndicator

```
Component: LoadingIndicator
File: shared/ui/loading-indicator.tsx
Owner: semantic-shared
Tokens: N/A — inline Tailwind classes

Current API: className
Target API: variant, size, density
Migration required: yes — add semantic props

Visual policy: All Tailwind classes defined in loading-indicator.tsx.
```

### TableEmptyState

```
Component: TableEmptyState
File: shared/ui/table-empty-state.tsx
Owner: semantic-shared
Tokens: N/A — inline Tailwind classes

Current API: className
Target API: variant, density, layout
Migration required: yes — add semantic props

Visual policy: All Tailwind classes defined in table-empty-state.tsx.
```

### Sidebar

```
Component: Sidebar
File: shared/ui/sidebar.tsx
Owner: semantic-shared
Tokens: N/A — inline Tailwind classes

Current API: variant, collapsible, side, className
Target API: variant, density, layout, interactive
Migration required: yes — add density/layout/interactive, reduce className dependency

Visual policy: All Tailwind classes defined in sidebar.tsx.
```

### Breadcrumb

```
Component: Breadcrumb
File: shared/ui/breadcrumb.tsx
Owner: semantic-shared
Tokens: N/A — inline Tailwind classes

Current API: className
Target API: variant, size, density
Migration required: yes — add semantic props

Visual policy: All Tailwind classes defined in breadcrumb.tsx.
```

### LoadingState

```
Component: LoadingState
File: shared/ui/states/LoadingState.tsx
Owner: semantic-shared
Tokens: N/A — composes existing primitives

Current API: title, description, height, className
Target API: variant, density, size, title, description
Migration required: yes — add semantic props, reduce className

Visual policy: All Tailwind classes in states/LoadingState.tsx.
```

### EmptyState

```
Component: EmptyState
File: shared/ui/states/EmptyState.tsx
Owner: semantic-shared
Tokens: N/A — composes existing primitives

Current API: title, description, action, icon, className
Target API: variant, density, layout, title, description, action, icon
Migration required: yes — add semantic props

Visual policy: All Tailwind classes in states/EmptyState.tsx.
```

### ErrorState

```
Component: ErrorState
File: shared/ui/states/ErrorState.tsx
Owner: semantic-shared
Tokens: N/A — composes existing primitives

Current API: title, description, action, density, className
Target API: variant, density, size, title, description, action
Migration required: yes — add variant/size, reduce className dependency

Visual policy: All Tailwind classes in states/ErrorState.tsx.
```

### ForbiddenState

```
Component: ForbiddenState
File: shared/ui/states/ForbiddenState.tsx
Owner: semantic-shared
Tokens: N/A — composes existing primitives

Current API: title, description, action, className
Target API: variant, density, layout, title, description, action
Migration required: yes — add semantic props

Visual policy: All Tailwind classes in states/ForbiddenState.tsx.
```

### EditableCell

```
Component: EditableCell
File: shared/ui/cells/editable-cell.tsx
Owner: semantic-shared
Tokens: N/A — composes Button and Input

Current API: value, onCommit, type, disabled, align, clearOnFocus, cancelOnEmpty, ariaLabel, title, className
Target API: value, onCommit, type, disabled, align, clearOnFocus, cancelOnEmpty, ariaLabel, title, size, density
Migration required: yes — add size/density, reduce className dependency

Visual policy: All Tailwind classes in cells/editable-cell.tsx.
```

### Primitive Tokens

```
Component: Primitive Tokens
File: shared/ui/primitive-controls.ts, primitive-spacing.ts, primitive-surface.ts,
      primitive-table.ts, primitive-overlay.ts, primitive-form.ts,
      primitive-navigation.ts, primitive-chart.ts, primitive-badge.ts
Owner: primitive
Tokens: N/A — this is the token source
Accepted props: N/A — not a component
Visual policy: Contains all base token maps consumed by semantic-shared components.
              New imports should target the domain-specific file.
              The legacy barrel file `primitive-density.ts` is deprecated.
```

### AdminSurface

```
Component: AdminSurface
File: shared/ui/admin-surface.tsx
Owner: feature-family
Tokens: N/A — inline Tailwind classes

Current API: variant, density, layout, className
Target API: variant, density, layout, shadow
Migration required: yes — add shadow prop, reduce className dependency

Visual policy: All Tailwind classes defined in admin-surface.tsx.
```

### Chart

```
Component: Chart
File: shared/ui/chart.tsx
Owner: feature-family
Tokens: primitiveChartTooltipClassName, primitiveChartLegendClassName

Current API: className
Target API: variant, size, density
Migration required: yes — add semantic props

Visual policy: All Tailwind classes defined in chart.tsx.
```

### EstimateTab

```
Component: EstimateTab
File: shared/ui/estimate-tab.tsx
Owner: feature-family
Tokens: N/A — inline Tailwind classes

Current API: variant, status, className
Target API: variant, size, density, intent
Migration required: yes — add size/density, reduce className dependency

Visual policy: All Tailwind classes defined in estimate-tab.tsx.
```

### CatalogToken

```
Component: CatalogToken
File: shared/ui/catalog-token.tsx
Owner: feature-family
Tokens: primitiveCatalogTokenClassNames

Current API: variant, size, className
Target API: variant, size, density, tone, intent
Migration required: yes — add density/tone/intent

Visual policy: All Tailwind classes defined in catalog-token.tsx.
```

### DashboardLayout

```
Component: DashboardLayout
File: shared/ui/dashboard-layout.tsx
Owner: feature-family
Tokens: N/A — inline Tailwind classes

Current API: className
Target API: variant, density, layout
Migration required: yes — add semantic props

Visual policy: All Tailwind classes defined in dashboard-layout.tsx.
```

### KpiCard

```
Component: KpiCard
File: shared/ui/kpi-card.tsx
Owner: feature-family
Tokens: N/A — inline Tailwind classes

Current API: variant, className
Target API: variant, density, shadow, intent
Migration required: yes — add density/shadow/intent, reduce className

Visual policy: All Tailwind classes defined in kpi-card.tsx.
```

### PageShell

```
Component: PageShell
File: shared/ui/page-shell.tsx
Owner: layout
Tokens: legacyPageShellClassName, pageShellWidthClassName, pageShellSpacingClassName

Current API: density, title, description, actions, width, spacing, titleAs, visuallyHiddenTitle, className
Target API: variant, density, layout, title, description, actions, width, spacing
Migration required: yes — add variant/layout, reduce className dependency

Visual policy: All Tailwind classes defined in page-shell.tsx.
```

### WorkspaceMain

```
Component: WorkspaceMain
File: shared/ui/page-shell.tsx
Owner: layout
Tokens: N/A — inline Tailwind classes

Current API: className
Target API: variant, density, layout
Migration required: yes — add semantic props

Visual policy: All Tailwind classes defined in page-shell.tsx (WorkspaceMain export).
```

### app/page.tsx (Legacy Debt Until Phase 12)

```
Component: app/page.tsx
File: app/page.tsx
Owner: marketing (temporary)
Tokens: none

Current API: N/A — page-level component
Target API: Composition of shared marketing contracts (MarketingPageShell, MarketingSection, etc.)
Migration required: yes — Phase 12. This is temporary legacy debt.

Visual policy: Direct visual classes temporarily allowed. Must migrate to shared/ui/marketing/* in Phase 12.
```

### Auth components (Legacy Debt Until Phase 12)

```
Component: Auth components
File: features/auth/*
Owner: auth (temporary)
Tokens: none

Current API: N/A — auth-specific visual classes
Target API: Shared/ui/auth/* or shared auth contracts
Migration required: yes — Phase 12. This is temporary legacy debt.

Visual policy: Auth visual classes temporarily allowed in features/auth/*.
Must migrate to shared/ui/auth/* in Phase 12.
```

---

## Summary

| # | Rule | Enforcement |
|---|------|-------------|
| 0 | `app/**`, `features/**`, `components/layout/**`, `components/navigation/**` don't own visual classes | Code review; Phase 14 lint/CI |
| 1 | Every visual class has an owner contract | This document |
| 2 | shared/ui is not a dumping ground | Each component explicitly classified above |
| 3 | Semantic props replace className | variant, tone, density, size, layout, intent + extras |
| 4 | New code uses only shared/ui | PR policy |
| 5 | Existing visual debt must be migrated | Classify → add props → replace → remove |
| 6 | app/page.tsx and features/auth/* are temporary legacy debt until Phase 12 | Tracked, not permanent |
