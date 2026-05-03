# UI Governance

> **Owner:** Architecture Team
> **Status:** Active
> **Applies to:** All UI code in `app/features/`, `shared/ui/`, and related directories.
>
> *Phase 1 — EPIC #275: Transfer visual class ownership to shared/ui.*

---

## Rule 0: App/Features Don't Own Visual Classes

**`app/features/` components must not hold or define visual (Tailwind) classes.**

Feature components **select** visual presentation via **semantic props only**. The visual implementation — Tailwind utility classes, CSS modules, etc. — belongs exclusively in `shared/ui/`.

**✅ Allowed in features:**
```tsx
<Button variant="primary" tone="brand" size="md" />
<Card variant="elevated" density="compact" />
<Badge intent="success" />
```

**❌ Forbidden in features:**
```tsx
<button className="bg-blue-600 text-white px-4 py-2 rounded-md">  {/* visual class ownership violation */}
<Card className="shadow-lg border-2 border-blue-500">             {/* visual class ownership violation */}
```

**Rule 0 applies to all files under `app/features/` and `app/` with the single exception of `app/page.tsx` (marketing).**

---

## Owner Categories

Every visual class, component, and token in the codebase must be assigned to exactly one owner category.

| Category | Description | Visibility |
|----------|-------------|------------|
| `primitive` | Base design tokens (colors, spacing, density, typography). Defined in `shared/ui/primitive-*.ts` and Tailwind config. | `shared/ui` |
| `semantic-shared` | Standard reusable components owned by platform UI. The default destination for new shared components. | `shared/ui` |
| `feature-family` | Recognised feature-level visual contracts grouped by domain (estimate, catalog, auth, dashboard). Must be approved by architecture. | `shared/ui` |
| `layout` | Page shells, workspace frames, and content containers. | `shared/ui` |
| `auth` | Auth-specific components used only by `features/auth/*`. | `shared/ui` |
| `marketing` | Landing page and marketing sections. Exception: `app/page.tsx` only. | `app/` |
| `compatibility` | Temporary legacy entrypoints for backwards compatibility. Must include a deprecation target version. | `shared/ui` |
| `deprecated` | Scheduled for removal. Not to be used in new code. | any |
| `needs-review` | Categories unknown or pending classification. Must be resolved before release. | any |

### Primitive

Base design tokens that all other layers consume. No component logic, no React — pure token maps.

**Location:** `shared/ui/primitive-density.ts` (+ future `primitive-color.ts`, `primitive-spacing.ts`, etc.)

**Example:**
```ts
// shared/ui/primitive-density.ts
export const primitiveDensityMap = {
  compact: { padding: 'px-2 py-1', gap: 'gap-1', textSize: 'text-sm' },
  normal:  { padding: 'px-3 py-1.5', gap: 'gap-2', textSize: 'text-sm' },
  relaxed: { padding: 'px-4 py-2', gap: 'gap-3', textSize: 'text-base' },
} as const;
```

**Owner:** Platform Design System
**Allowed props:** — (tokens, not components)

---

### Semantic-Shared

Standard, reusable components that any feature can consume. This is the **default** owner for any new shared component unless a specific exception applies.

**Location:** `shared/ui/*` (excluding components assigned to other categories)

**Examples:** Button, Input, Badge, Card, Surface, Dialog, Sheet, Popover, Toolbar, FilterBar, SearchControl, Tabs, Select, Textarea, DataTable, FormLayout, ActionMenu, StatusBadge, Skeleton, LoadingIndicator, TableEmptyState, Sidebar, Breadcrumb, States (dir), Cells (dir)

**Owner:** Platform UI Team
**Allowed props:** variant, tone, density, size, layout, intent, overflow, shadow, radius, border, interactive

---

### Feature-Family

Recognised feature-level visual contracts. These cross the boundary from generic UI into domain-specific presentation. Must be approved by architecture before assigning this category.

**Location:** `shared/ui/*` (domain-named components)

**Examples:** AdminSurface, Chart, EstimateTab, CatalogToken, DashboardLayout, KpiCard

**Owner:** Respective domain team (estimates, catalog, analytics, admin)
**Allowed props:** variant, tone, density, size, layout, intent, overflow, shadow, radius, border, interactive

---

### Layout

Page-level shells, workspace frames, and content-area containers. These define the structural chrome of the application.

**Location:** `shared/ui/page-shell.tsx`, etc.

**Examples:** PageShell

**Owner:** Platform UI Team
**Allowed props:** variant, density, layout

---

### Auth

Auth-specific visual components used exclusively within the auth flow.

**Owner:** Auth Team
**Allowed props:** variant, tone, size, density

---

### Marketing

Landing page and marketing sections. **Exception only for `app/page.tsx`** — no other `app/` file may hold visual classes.

**Owner:** Marketing Team
**Allowed props:** variant, layout, density

---

### Compatibility

Temporary legacy wrappers that provide backwards-compatible APIs while consumers migrate to the new system.

**Example:** A component with both `className` prop (deprecated) and semantic props.

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

`app/features/` code must replace `className` usage with the following semantic props. Props are defined by each component's accepted prop list (see owner contracts below).

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

1. **Classify** every className usage found in `app/features/` and `app/` (except `app/page.tsx`).
2. Assign each to an **owner category** based on the component it wraps.
3. If the target component does not yet accept the required semantic prop(s):
   - Add the prop to the component's accepted props (update owner contract).
   - Implement the prop in the `shared/ui` component.
4. Replace `className` in the feature component with the equivalent semantic prop(s).
5. Remove the visual class definition from the feature file.

### New Code

- **All new UI must be built from `shared/ui` components.**
- Feature code must use only semantic props — zero `className` or direct Tailwind usage.
- If a needed visual combination doesn't exist, either:
  - Extend the existing `shared/ui` component with a new prop value, or
  - Propose a new `shared/ui` component (assigned `semantic-shared`).

### Audit Enforcement (Phase 14)

- Phase 14 will introduce tooling (lint rule, CI check) to enforce Rule 0.
- Until then, enforcement is by **code review policy**:
  - PRs with new `className` in `app/features/` or `app/` (excluding `app/page.tsx`) must be rejected.
  - PRs adding Tailwind classes outside `shared/ui` must be rejected.

---

## Owner Contract Format

Every component that exposes visual classes must have an **owner contract** documented here. The contract defines:

- Who owns the visual implementation
- Which semantic props are accepted
- Where visual classes live (and where they don't)

### Template

```txt
Component: <name>
File: <relative-path>
Owner: <owner-category>
Tokens: <comma-separated list of token/className maps consumed>
Accepted props: <comma-separated list of semantic props>
Visual policy: All Tailwind classes defined in <file>. No custom className on the call site.
```

---

## Owner Contracts

### Button

```
Component: Button
File: shared/ui/button.tsx
Owner: semantic-shared
Tokens: primitiveButtonSizeClassNames, primitiveButtonBaseClassName
Accepted props: variant, size, loading, asChild, iconLeft, iconRight
Visual policy: All Tailwind classes in button.tsx. No custom className at call site.
```

### Input

```
Component: Input
File: shared/ui/input.tsx
Owner: semantic-shared
Tokens: primitiveDensityMap
Accepted props: variant, size, density, tone, intent, placeholder
Visual policy: All Tailwind classes in input.tsx. No custom className at call site.
```

### Badge

```
Component: Badge
File: shared/ui/badge.tsx
Owner: semantic-shared
Tokens: primitiveDensityMap
Accepted props: variant, tone, size, density, intent
Visual policy: All Tailwind classes in badge.tsx. No custom className at call site.
```

### Card

```
Component: Card
File: shared/ui/card.tsx
Owner: semantic-shared
Tokens: primitiveDensityMap
Accepted props: variant, density, shadow, radius, border, interactive
Visual policy: All Tailwind classes in card.tsx. No custom className at call site.
```

### Surface

```
Component: Surface
File: shared/ui/surface.tsx
Owner: semantic-shared
Tokens: primitiveDensityMap
Accepted props: variant, tone, density, shadow, radius, border
Visual policy: All Tailwind classes in surface.tsx. No custom className at call site.
```

### Dialog

```
Component: Dialog
File: shared/ui/dialog.tsx
Owner: semantic-shared
Tokens: primitiveDensityMap
Accepted props: variant, size, density, shadow
Visual policy: All Tailwind classes in dialog.tsx. No custom className at call site.
```

### Sheet

```
Component: Sheet
File: shared/ui/sheet.tsx
Owner: semantic-shared
Tokens: primitiveDensityMap
Accepted props: variant, size, density, shadow
Visual policy: All Tailwind classes in sheet.tsx. No custom className at call site.
```

### Popover

```
Component: Popover
File: shared/ui/popover.tsx
Owner: semantic-shared
Tokens: primitiveDensityMap
Accepted props: variant, density, shadow, radius
Visual policy: All Tailwind classes in popover.tsx. No custom className at call site.
```

### Toolbar

```
Component: Toolbar
File: shared/ui/toolbar.tsx
Owner: semantic-shared
Tokens: primitiveDensityMap
Accepted props: variant, density, layout
Visual policy: All Tailwind classes in toolbar.tsx. No custom className at call site.
```

### FilterBar

```
Component: FilterBar
File: shared/ui/filter-bar.tsx
Owner: semantic-shared
Tokens: primitiveDensityMap
Accepted props: variant, density, layout
Visual policy: All Tailwind classes in filter-bar.tsx. No custom className at call site.
```

### SearchControl

```
Component: SearchControl
File: shared/ui/search-control.tsx
Owner: semantic-shared
Tokens: primitiveDensityMap
Accepted props: variant, size, density, tone
Visual policy: All Tailwind classes in search-control.tsx. No custom className at call site.
```

### Tabs

```
Component: Tabs
File: shared/ui/tabs.tsx
Owner: semantic-shared
Tokens: primitiveDensityMap
Accepted props: variant, size, density, layout
Visual policy: All Tailwind classes in tabs.tsx. No custom className at call site.
```

### Select

```
Component: Select
File: shared/ui/select.tsx
Owner: semantic-shared
Tokens: primitiveDensityMap
Accepted props: variant, size, density, tone, intent
Visual policy: All Tailwind classes in select.tsx. No custom className at call site.
```

### Textarea

```
Component: Textarea
File: shared/ui/textarea.tsx
Owner: semantic-shared
Tokens: primitiveDensityMap
Accepted props: variant, size, density, tone, intent
Visual policy: All Tailwind classes in textarea.tsx. No custom className at call site.
```

### DataTable

```
Component: DataTable
File: shared/ui/data-table.tsx
Owner: semantic-shared
Tokens: primitiveDensityMap
Accepted props: variant, density, layout, overflow
Visual policy: All Tailwind classes in data-table.tsx. No custom className at call site.
```

### FormLayout

```
Component: FormLayout
File: shared/ui/form-layout.tsx
Owner: semantic-shared
Tokens: primitiveDensityMap
Accepted props: variant, density, layout
Visual policy: All Tailwind classes in form-layout.tsx. No custom className at call site.
```

### ActionMenu

```
Component: ActionMenu
File: shared/ui/action-menu.tsx
Owner: semantic-shared
Tokens: primitiveDensityMap
Accepted props: variant, size, density
Visual policy: All Tailwind classes in action-menu.tsx. No custom className at call site.
```

### StatusBadge

```
Component: StatusBadge
File: shared/ui/status-badge.tsx
Owner: semantic-shared
Tokens: primitiveDensityMap
Accepted props: variant, size, density, intent
Visual policy: All Tailwind classes in status-badge.tsx. No custom className at call site.
```

### Skeleton

```
Component: Skeleton
File: shared/ui/skeleton.tsx
Owner: semantic-shared
Tokens: primitiveDensityMap
Accepted props: variant, size, density
Visual policy: All Tailwind classes in skeleton.tsx. No custom className at call site.
```

### LoadingIndicator

```
Component: LoadingIndicator
File: shared/ui/loading-indicator.tsx
Owner: semantic-shared
Tokens: primitiveDensityMap
Accepted props: variant, size, density
Visual policy: All Tailwind classes in loading-indicator.tsx. No custom className at call site.
```

### TableEmptyState

```
Component: TableEmptyState
File: shared/ui/table-empty-state.tsx
Owner: semantic-shared
Tokens: primitiveDensityMap
Accepted props: variant, density, layout
Visual policy: All Tailwind classes in table-empty-state.tsx. No custom className at call site.
```

### Sidebar

```
Component: Sidebar
File: shared/ui/sidebar.tsx
Owner: semantic-shared
Tokens: primitiveDensityMap
Accepted props: variant, density, layout, interactive
Visual policy: All Tailwind classes in sidebar.tsx. No custom className at call site.
```

### Breadcrumb

```
Component: Breadcrumb
File: shared/ui/breadcrumb.tsx
Owner: semantic-shared
Tokens: primitiveDensityMap
Accepted props: variant, size, density
Visual policy: All Tailwind classes in breadcrumb.tsx. No custom className at call site.
```

### States (directory)

```
Component: States (dir)
File: shared/ui/states/*
Owner: semantic-shared
Tokens: primitiveDensityMap
Accepted props: variant, density, layout
Visual policy: All Tailwind classes in each file. No custom className at call site.
```

### Cells (directory)

```
Component: Cells (dir)
File: shared/ui/cells/*
Owner: semantic-shared
Tokens: primitiveDensityMap
Accepted props: variant, density, size
Visual policy: All Tailwind classes in each file. No custom className at call site.
```

### Primitive Density

```
Component: Primitive Density
File: shared/ui/primitive-density.ts
Owner: primitive
Tokens: N/A — this is the token source
Accepted props: N/A — not a component
Visual policy: Contains all density token maps consumed by semantic-shared components.
```

### AdminSurface

```
Component: AdminSurface
File: shared/ui/admin-surface.tsx
Owner: feature-family
Tokens: primitiveDensityMap
Accepted props: variant, density, layout, shadow
Visual policy: All Tailwind classes in admin-surface.tsx. No custom className at call site.
```

### Chart

```
Component: Chart
File: shared/ui/chart.tsx
Owner: feature-family
Tokens: primitiveDensityMap
Accepted props: variant, size, density
Visual policy: All Tailwind classes in chart.tsx. No custom className at call site.
```

### EstimateTab

```
Component: EstimateTab
File: shared/ui/estimate-tab.tsx
Owner: feature-family
Tokens: primitiveDensityMap
Accepted props: variant, size, density, intent
Visual policy: All Tailwind classes in estimate-tab.tsx. No custom className at call site.
```

### CatalogToken

```
Component: CatalogToken
File: shared/ui/catalog-token.tsx
Owner: feature-family
Tokens: primitiveDensityMap
Accepted props: variant, size, density, tone, intent
Visual policy: All Tailwind classes in catalog-token.tsx. No custom className at call site.
```

### DashboardLayout

```
Component: DashboardLayout
File: shared/ui/dashboard-layout.tsx
Owner: feature-family
Tokens: primitiveDensityMap
Accepted props: variant, density, layout
Visual policy: All Tailwind classes in dashboard-layout.tsx. No custom className at call site.
```

### KpiCard

```
Component: KpiCard
File: shared/ui/kpi-card.tsx
Owner: feature-family
Tokens: primitiveDensityMap
Accepted props: variant, density, shadow, intent
Visual policy: All Tailwind classes in kpi-card.tsx. No custom className at call site.
```

### PageShell

```
Component: PageShell
File: shared/ui/page-shell.tsx
Owner: layout
Tokens: primitiveDensityMap
Accepted props: variant, density, layout
Visual policy: All Tailwind classes in page-shell.tsx. No custom className at call site.
```

### app/page.tsx

```
Component: app/page.tsx
File: app/page.tsx
Owner: marketing
Tokens: none — direct visual classes allowed (exception)
Accepted props: N/A
Visual policy: Exception from Rule 0. This is the only allowed file outside shared/ui to hold visual classes.
```

### Auth components

```
Component: auth/*
File: features/auth/*
Owner: auth
Tokens: primitiveDensityMap
Accepted props: variant, tone, size, density
Visual policy: Auth components may hold visual classes specific to auth flows. No custom className outside features/auth/.
```

---

## Summary

| # | Rule | Enforcement |
|---|------|-------------|
| 0 | app/features/ components don't own visual classes | Code review; Phase 14 lint/CI |
| 1 | Every visual class has an owner contract | This document |
| 2 | shared/ui is not a dumping ground | Each component explicitly classified above |
| 3 | Semantic props replace className | variant, tone, density, size, layout, intent + extras |
| 4 | New code uses only shared/ui | PR policy |
| 5 | Existing visual debt must be migrated | Classify → add props → replace → remove |
