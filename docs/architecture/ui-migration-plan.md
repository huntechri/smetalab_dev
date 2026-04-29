# UI Migration Plan (Merge-Safe)

## Goal
Normalize UI structure and styling so teams can refactor in parallel with minimal merge conflicts.

## Layer boundaries
- `shared/ui/*`: reusable primitives only (Button, Card, Table, Input, etc.).
- `features/*`: feature-specific composition/screens/components.
- `app/*`: thin route layer (layout/page wiring only).

## Merge-safe stages

| Stage | Scope | Allowed paths | Forbidden paths | Deliverable |
|---|---|---|---|---|
| 0 | Guardrails | `scripts/find-borders.mjs`, `docs/architecture/*` | `features/*`, `app/*` UI logic | scanner + documented rules |
| 1 | Shared primitives | `shared/ui/*`, `__tests__/unit/*shared-ui*` | `features/*`, `app/*` | tokenized primitives baseline |
| 2A | Global Purchases vertical | `features/global-purchases/**`, related tests | other `features/*` | domain-complete border/token cleanup |
| 2B | Estimates vertical | `features/projects/estimates/**`, related tests | other `features/*` | domain-complete border/token cleanup |
| 2C | Dashboard/List vertical | `features/projects/dashboard/**`, `features/projects/list/**` | unrelated features | domain-complete border/token cleanup |
| 2D | Directories vertical | `features/materials/**`, `features/works/**`, `features/counterparties/**`, `features/material-suppliers/**`, `features/guide-catalog/**`, `features/directories/**` | unrelated features | unified directory shells |
| 2E | Team/Permissions/Settings | `features/team/**`, `features/permissions/**`, `features/settings/**` | unrelated features | token-aligned UI |
| 3 | App thin pages | `app/**` (only composition/routes) | deep feature logic | `app/*` delegates to feature screens |
| 4 | Admin / Marketing split | `app/(admin)/**`, `features/admin/**` OR marketing pages | core product features | isolated cleanup without cross-domain churn |
| 5 | Final sweep | remaining files from scanner report | broad unrelated refactors | zero unexpected token regressions |

## PR slicing rules
1. One PR = one stage or one vertical only.
2. Max ~30 files per PR; split if larger.
3. No cross-vertical edits in the same PR.
4. Rebase on `main` before review.
5. Required checks: `pnpm lint`, `pnpm type-check`, `pnpm test`.

## Ownership matrix

| Area | Primary owner | Reviewer |
|---|---|---|
| `shared/ui/*` | Design System | Frontend Lead |
| `features/global-purchases/**` | Purchases | Frontend Lead |
| `features/projects/estimates/**` | Estimates | Domain Tech Lead |
| `features/projects/dashboard/**`, `features/projects/list/**` | Projects | Frontend Lead |
| Directory modules | Directory squad | Frontend Lead |
| `app/**` routing/composition | Platform FE | Frontend Lead |

## Done criteria
- No new hardcoded neutral border classes in touched scope.
- Border classes in touched scope use design tokens.
- No React unknown-prop warnings in tests.
- Stage-specific paths respected.
