# Architecture Cleanup Verification Status — 2026-04-30

Issue: #155

This note records the final verification pass for the current architecture cleanup batch. It is intentionally documentation-only and does not change runtime behavior.

## Source of truth reviewed

- `ARCHITECTURE.md`
- `package.json` audit and release scripts
- `scripts/audit-lib-feature-imports.mjs`
- `scripts/audit-legacy-compat-imports.mjs`
- `scripts/audit-ui-imports.mjs`

`UI_GOVERNANCE.md` was requested by the issue text but was not present at the repository root on current `main`. The authoritative architecture source remains `ARCHITECTURE.md`.

## Dependency status

The architecture cleanup series dependencies were completed before this pass:

- #148 — closed/completed
- #150 — closed/completed
- #151 — closed/completed
- #152 — closed/completed
- #153 — closed/completed
- #154 — closed/completed

## Grep / audit summary

The requested checks were reviewed using repository-side search and the current audit scripts.

### `lib/** -> features/**`

Target check:

```bash
rg "@/features/" lib/services lib/domain lib/data lib/infrastructure --glob "*.ts" --glob "*.tsx"
```

Status: covered by `scripts/audit-lib-feature-imports.mjs`.

Result summary: no runtime lib-to-feature boundary imports were identified during this pass. The audit script scans:

```txt
lib/services
lib/domain
lib/data
lib/infrastructure
```

and fails on absolute `@/features/**` imports or relative feature imports crossing upward into `features/**`.

### Legacy shared shell imports

Target check:

```bash
rg "@/features/(guide-catalog|directories)" --glob "*.ts" --glob "*.tsx"
```

Status: covered by `scripts/audit-legacy-compat-imports.mjs` and ESLint guardrails.

Result summary: no old runtime imports from these legacy shell entrypoints were identified. Canonical imports are:

```txt
@/features/_shared/guide-catalog
@/features/_shared/directories
```

### Legacy compatibility imports

Target check:

```bash
rg "@/features/(projects/estimates/types/dto|projects/estimates/types/execution\.dto|projects/estimates/types/room-params\.dto|projects/estimates/schemas/room-params\.schema|catalog/types/dto|global-purchases/types/dto|global-purchases/lib/date)" --glob "*.ts" --glob "*.tsx"
```

Status: covered by `scripts/audit-legacy-compat-imports.mjs`.

Result summary: no forbidden legacy compatibility imports were identified during repository-side search. The script guards the known legacy paths from #151.

### UI entrypoints

Target check:

```bash
rg "from ['\"](@/components/ui|@/shared/ui|@/components/ui-primitives|@repo/ui|@radix-ui|sonner)" --glob "*.ts" --glob "*.tsx"
```

Status: partially covered by `scripts/audit-ui-imports.mjs` and ESLint guardrails.

Result summary:

- `@/shared/ui/**` remains the canonical runtime app UI import surface.
- `components/ui/**` remains legacy compatibility only.
- `@repo/ui` is not the app runtime source of truth and is guarded by `audit:ui-imports` for runtime app roots.
- direct `@radix-ui/*` imports are now blocked outside the canonical `shared/ui/**` primitive layer by ESLint.
- direct runtime feature imports from `sonner` were removed in #154 and routed through `lib/infrastructure/notifications/notify.ts`.

Known intentional contexts:

- `shared/ui/**` may import `@radix-ui/*` as implementation detail of shadcn/Radix primitives.
- `shared/ui/sonner.tsx` and `lib/infrastructure/notifications/notify.ts` may import/use `sonner` as wrapper/provider abstraction points.
- `packages/ui/**`, `__tests__/**`, and `components/shadcn-studio/**` may contain package/test/demo usages and are not treated as runtime app architecture violations.

## Release verification commands

Requested commands:

```bash
pnpm audit:lib-feature-imports
pnpm audit:legacy-compat-imports
pnpm audit:ui
pnpm lint
pnpm type-check
pnpm test
pnpm build
pnpm verify:release
```

The local command suite was not run in this assistant environment because direct GitHub checkout previously failed with DNS resolution (`Could not resolve host: github.com`). Repository-side file inspection, search, diff review, and script review were performed through the GitHub connector.

## Remaining known gaps

No new runtime architecture gap was intentionally introduced in this pass.

Known non-blocking documentation gap:

- `UI_GOVERNANCE.md` is referenced by issue #155, but current `main` uses `ARCHITECTURE.md` as the authoritative architecture source. If a separate UI governance document is still desired, create a dedicated docs-only issue rather than mixing it into runtime cleanup.

## Runtime behavior

No runtime behavior, UI behavior, layout, business logic, DB/schema/migration, server action behavior, DTO shape, validation behavior, or feature runtime logic was intentionally changed by this final verification pass.
