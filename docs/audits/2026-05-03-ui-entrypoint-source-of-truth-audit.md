# UI entrypoint source-of-truth audit

Date: 2026-05-03
Issue: #240
Scope: narrow source-of-truth audit for UI entrypoints only

## Scope

This audit checks only UI entrypoints and governance rules around them:

- `shared/ui/**`
- `components/ui/**`
- `packages/ui/**`
- `components/ui-primitives/**`
- feature-local/shared-feature wrappers that behave like reusable UI shells

This audit intentionally does not change visual behavior, density, runtime component implementation, feature logic, data loading, server actions, or domain/data code.

## Final decision

| Entrypoint | Status | Allowed usage | Forbidden usage |
| --- | --- | --- | --- |
| `shared/ui/**` | Canonical runtime UI source | App-facing shared UI primitives, shared composites, cells, state components, shells, and neutral UI patterns | Imports from `app/**`, `features/**`, `lib/data/**`, `lib/domain/**`, or `components/ui/**`; business workflows; DB access |
| `components/ui/**` | Deprecated legacy compatibility facade | Temporary re-export files for historical/shadcn compatibility while old branches or scripts still reference legacy paths | New implementation files, new runtime imports, new design-system ownership |
| `packages/ui/**` / `@repo/ui` | Package/export compatibility | Workspace package export surface that re-exports `shared/ui/**` for compatibility | Internal app runtime source-of-truth; direct app/feature/entity imports |
| `components/ui-primitives/**` | Not an active canonical entrypoint in the current tree | None unless reintroduced by a dedicated architecture decision | Competing primitive source, new Radix wrappers, or replacement for `shared/ui/**` |
| `features/_shared/**` wrappers | Shared feature infrastructure | Feature-level shells and adapters such as guide-catalog and directory orchestration wrappers | Generic design-system primitives, low-level UI ownership, DB access, tenant-specific business rules |

## Evidence

`ARCHITECTURE.md` and `README.md` already define `shared/ui/**` as the canonical runtime UI source and classify `components/ui/**` as legacy compatibility. `components/ui/button.tsx` and `components/ui/input.tsx` are currently re-export facades to `shared/ui/button` and `shared/ui/input`, not implementation owners.

`packages/ui/package.json` exposes `@repo/ui`, and `packages/ui/src/index.ts` re-exports from `../../../shared/ui/*`. This confirms package compatibility status rather than a separate app runtime source.

`components.json` maps the shadcn `ui` alias to `@/shared/ui`, so future generated shadcn UI should target `shared/ui/**`, not `components/ui/**`.

`components/ui-primitives` did not appear as an active source path in the current tree. Existing primitive/density contracts are centralized under `shared/ui`, especially `shared/ui/primitive-density.ts`.

## Ownership matrix

| Surface | Canonical import path | Implementation owner | Compatibility surface | Notes |
| --- | --- | --- | --- | --- |
| `Button` | `@/shared/ui/button` | `shared/ui/button.tsx` | `components/ui/button.tsx`, `@repo/ui` | `components/ui/button.tsx` is re-export only. Do not implement new behavior there. |
| `Input` | `@/shared/ui/input` | `shared/ui/input.tsx` | `components/ui/input.tsx`, `@repo/ui` | `components/ui/input.tsx` is re-export only. Do not implement new behavior there. |
| `Card` | `@/shared/ui/card` | `shared/ui/card.tsx` | `@repo/ui` | No active `components/ui/card.tsx` facade was found in this audit. |
| `Dialog` | `@/shared/ui/dialog` | `shared/ui/dialog.tsx` | `@repo/ui` | Direct Radix imports should stay inside shared UI primitive implementation only. |
| `Sheet` | `@/shared/ui/sheet` | `shared/ui/sheet.tsx` | `@repo/ui` | Direct Radix imports should stay inside shared UI primitive implementation only. |
| `Table` | `@/shared/ui/table` | `shared/ui/table.tsx` | `@repo/ui` | Runtime app code should not use raw `<table>` outside the current allowlist. |
| `Select` | `@/shared/ui/select` | `shared/ui/select.tsx` | `@repo/ui` | Uses shared density/primitive class contracts where applicable. |
| `DropdownMenu` | `@/shared/ui/dropdown-menu` | `shared/ui/dropdown-menu.tsx` | `@repo/ui` | Shared UI primitive/composite. |
| `Tooltip` | `@/shared/ui/tooltip` | `shared/ui/tooltip.tsx` | `@repo/ui` | Shared UI primitive/composite. |
| Toast / sonner | `@/shared/ui/sonner` for UI primitive, app-level toast facade where applicable | `shared/ui/sonner.tsx` and toast integration files | `@repo/ui` | Keep direct third-party toast usage controlled by existing governance. |
| `LoadingState` | `@/shared/ui/states` or direct state module | `shared/ui/states/LoadingState` | `@repo/ui` via states export | Raw `Loading...` cleanup is out of scope for this audit. |
| `EmptyState` | `@/shared/ui/states` or direct state module | `shared/ui/states/EmptyState` | `@repo/ui` via states export | Shared state component. |
| `ErrorState` | `@/shared/ui/states` or direct state module | `shared/ui/states/ErrorState` | `@repo/ui` via states export | `error.tsx` route boundaries are out of scope. |
| `ForbiddenState` | `@/shared/ui/states` or direct state module | `shared/ui/states/ForbiddenState` | `@repo/ui` via states export | Shared state component. |
| `StateShell` | `@/shared/ui/states` or direct state module | `shared/ui/states/StateShell` | `@repo/ui` via states export | Shared state shell. |
| `DataTableShell` | `@/shared/ui/shells/data-table-shell` | `shared/ui/shells/data-table-shell.tsx` | none required | Neutral shared UI shell. Directory screens may be required to use feature wrapper instead. |
| `DirectoryListScreen` | `@/features/_shared/directories` | `features/_shared/directories/**` | legacy `features/directories` only if present | Shared feature infrastructure, not design-system primitive. |
| `CatalogTableWrapper` | `@/features/_shared/guide-catalog` | `features/_shared/guide-catalog/**` | legacy `features/guide-catalog` only if present | Shared feature infrastructure, not design-system primitive. |

## Import-rule assessment

| Rule | Status | Current / changed enforcement |
| --- | --- | --- |
| Runtime app/features/entities code must not import `@/components/ui/*` | Enforced | Existing ESLint rule blocks this and points to `@/shared/ui/*`. |
| `shared/ui/**` must not import app/features/domain/data/legacy UI | Enforced | Existing ESLint rule blocks `@/app/*`, `@/features/*`, `@/lib/domain/*`, `@/lib/data/*`, and `@/components/ui/*`. This audit also added `@repo/ui` to prevent shared UI from importing package compatibility back into itself. |
| Runtime app/features/entities code must not import direct `@radix-ui/*` | Enforced | Existing ESLint rule requires project primitives from `@/shared/ui/*`. |
| `components/**` and `lib/**` must not import direct `@radix-ui/*` | Enforced with allowlist | Existing rule applies outside `components/shadcn-studio/**` and tests. |
| Internal runtime app code must not import `@repo/ui` | Added in this audit | Added targeted `@repo/ui` / `@repo/ui/*` restrictions for app/features/entities/components/lib runtime files. |
| Directory feature screens should not bypass `DirectoryListScreen` | Enforced for selected screens | Existing rule blocks direct `DataTable` / `DataTableShell` imports in counterparty and material supplier directory screens. |
| `components/ui/**` should be re-export-only compatibility | Documented, partially enforceable | Current search shows only known facades for button/input. Full deletion or hard file-shape enforcement should be a separate mechanical cleanup if desired. |

## Recommended governance wording

Canonical import policy:

```ts
// ✅ runtime app UI
import { Button } from '@/shared/ui/button'

// ❌ legacy compatibility facade; do not add new imports
import { Button } from '@/components/ui/button'

// ❌ package compatibility; do not use as internal runtime source
import { Button } from '@repo/ui'
```

Feature-wrapper policy:

```ts
// ✅ directory feature screens
import { DirectoryListScreen } from '@/features/_shared/directories'

// ✅ guide catalog screens
import { CatalogTableWrapper } from '@/features/_shared/guide-catalog'

// ✅ neutral shared shell when not in a feature wrapper boundary
import { DataTableShell } from '@/shared/ui/shells/data-table-shell'
```

## Compatibility facade decision

`components/ui/**` facades are not needed as architecture once runtime imports are migrated. They can remain temporarily only to reduce breakage for old branches, scripts, or shadcn-adjacent expectations.

Deletion should be handled in a separate mechanical PR after verifying:

```bash
rg "@/components/ui" app features entities components lib shared packages __tests__ scripts
```

If only docs/scripts remain, the next cleanup PR can remove unused facade files and update any script assumptions. Do not mix that deletion into visual or behavior work.

## Out of scope for this audit

The following items are explicitly out of scope and were not fixed here:

- Button/Input default size
- `error.tsx`
- `DESIGN_SYSTEM.md`
- `MASTER.md`
- unknown styles
- guide hooks
- raw `Loading...` placeholders
- visual density changes
- runtime component behavior
- feature screen refactors
- server actions or data loading

## Validation checklist

Run before merging:

```bash
pnpm lint
pnpm audit:ui
pnpm audit:legacy-compat-imports
pnpm type-check
```

If failures are unrelated pre-existing issues, document them in the PR without expanding this audit scope.
