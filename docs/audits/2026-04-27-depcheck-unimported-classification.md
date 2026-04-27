# Depcheck and unimported classification — 2026-04-27

## Context

This audit follows the updated deep audit cleanup series after these merged batches:

- `#112` — audit tooling source of truth
- `#113` — reusable table-cell helpers
- `#114` — settings/team semantic theme tokens
- `#115` — generated audit artifact handling
- `#116` — TypeScript workspace alias/type-check stabilization

Current CI status reported for the latest stabilization batch:

```txt
pnpm lint        passed
pnpm type-check  passed
```

## Decision

Do not remove dependencies or files from the raw `depcheck` / `unimported` output yet.

The reported output is too broad and contains known false positives for this codebase shape:

- workspace packages exported through `packages/*`;
- shadcn/Radix primitive wrappers;
- Tailwind/PostCSS build-time dependencies;
- generated/demo/reference code;
- route handlers, server actions, tests and barrel exports that are not always visible to static import scanners.

## `depcheck` classification

| Finding group | Classification | Reason | Action |
| --- | --- | --- | --- |
| `@radix-ui/react-*` | Keep / false-positive risk | Radix packages back the shadcn wrappers in `shared/ui/*`. Static dependency scanners can miss usage through wrapper/barrel patterns. | Do not remove. Review package-by-package only if the matching `shared/ui/*` primitive is removed. |
| `@tailwindcss/postcss` | Keep | Used by `postcss.config.mjs`. | Do not remove. |
| `tailwindcss` | Keep | Build/runtime styling foundation through `app/globals.css`, shadcn and Tailwind v4 pipeline. | Do not remove. |
| `postcss` | Keep / build dependency | Required by the PostCSS/Tailwind pipeline even when not imported from application code. | Do not remove without build verification. |
| `tw-animate-css` | Keep | Imported by `app/globals.css`. | Do not remove. |
| `clsx` / `tailwind-merge` | Keep | Used by `packages/utils/src/cn.ts`; root imports consume `cn` through `@repo/utils` and `@/lib/utils`. | Do not remove. |
| `@repo/ui` | Keep | Workspace package exports the shared UI barrel for tests/demo/reference consumers and is now mapped in `tsconfig.json`. | Do not remove. |
| `@repo/utils` | Keep | Workspace package provides `cn` and utility exports consumed by root utilities. | Do not remove. |
| `@commitlint/*` | Keep unless hooks/CI policy is intentionally removed | Backed by `commitlint.config.mjs`; may be used by developer workflow even if not referenced by npm scripts. | Do not remove in cleanup PR. |
| `shadcn` | Keep | Project has `components.json` and shadcn workflow; CLI is a tooling dependency, not runtime import. | Do not remove in cleanup PR. |
| `concurrently` | Review candidate | No direct package script usage was confirmed in this pass. It may still be referenced in local workflows or agent docs. | Candidate only after grep across full working tree and confirming no local/dev workflow depends on it. |
| `autoprefixer` | Review candidate | Tailwind v4/PostCSS setup currently uses `@tailwindcss/postcss`; no direct `postcss.config.mjs` plugin reference was confirmed. | Candidate only after build verification and browser support review. |

## `unimported` classification

| Finding group | Classification | Reason | Action |
| --- | --- | --- | --- |
| `__tests__/**` | Keep / scanner false positive | Test entrypoints are reached by Vitest config, not application imports. | Do not remove. |
| `app/**/page.tsx`, `layout.tsx`, `route.ts` | Keep / framework entrypoints | Next.js App Router discovers these by convention. | Do not remove. |
| `app/actions/**` | Keep / server-action entrypoints | Server actions may be referenced by form actions, route modules or framework boundaries. | Do not remove from static output alone. |
| `shared/ui/**` | Keep / design-system surface | Many components are public primitives, used through direct imports or `@repo/ui` barrel exports. | Do not remove unless component-specific search and `@repo/ui` export review prove dead code. |
| `features/**/index.ts` | Keep / barrel entrypoints | Feature barrels are architectural boundaries used by app routes and tests. | Do not remove from static output alone. |
| `components/shadcn-studio/**` | Keep as reference/demo unless product decision says otherwise | Already treated as reference-only/allowlisted in UI import audit policy. | Do not remove in cleanup PR. |
| `docs/**`, `.agents/**`, generated audit docs | Keep / documentation and agent workflow | Not imported by app runtime by design. | Do not remove based on `unimported`. |
| Standalone feature components with no direct imports | Review candidate | Some may be true dead code; others are pending feature surfaces or dynamic usage. | Require exact file-level proof before deletion. |

## Safe cleanup rule

A dependency/file can be removed only when all checks pass:

1. exact `rg` search confirms no runtime, test, config, docs, agent or package-barrel usage;
2. it is not a Next.js convention entrypoint;
3. it is not a server action / route handler / dynamic import target;
4. it is not exported from `packages/ui` or another intentional public barrel;
5. `pnpm lint`, `pnpm type-check`, `pnpm test`, and `pnpm build` pass after removal.

## Recommended next PR

If cleanup is still desired, make the next PR narrowly scoped:

```txt
chore(cleanup): remove confirmed unused dev tooling dependency
```

Start only with a single low-risk candidate, for example `concurrently` or `autoprefixer`, but only after a full-tree search and a successful local build. Do not combine dependency removal with UI refactors, server code changes, or feature cleanup.
