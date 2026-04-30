# Current File System Architecture

Status: authoritative.

This document is the current source of truth for the physical file-system layout of `smetalab_dev`. Older architecture and UI-audit documents are historical references only and must not be used as implementation instructions.

Last baseline used for this map: `main` at `1f5e9ec9e34b18af3499259715248fc1b9dd8518`.

## Core problem this map solves

The repository had architectural drift at the folder level. Similar responsibilities were spread across `app`, `features`, `shared`, `components`, `entities`, `lib`, and `packages`, which made it unclear where new files should live.

The goal of this map is simple: every new file must have one obvious home.

## Canonical folder roles

### `app/**`

Next.js App Router only.

Allowed here:

- route segments;
- `page.tsx`;
- `layout.tsx`;
- `loading.tsx`;
- `route.ts` handlers;
- server-action entrypoints under `app/actions/**`.

Rules:

- `page.tsx` should stay a thin server wrapper when possible;
- fetch initial server data here;
- pass data into `features/**` screens;
- do not put complex client UI, table state, dialogs, or domain workflows directly in route files.

### `app/actions/**`

Server Actions only.

Allowed here:

- auth/permission guard invocation;
- input validation;
- calling `lib/domain/**`, `lib/services/**`, or `lib/data/**`;
- cache invalidation such as `revalidatePath`.

Not allowed here:

- React components;
- table/card UI logic;
- raw feature screen state;
- large business workflows that belong in `lib/domain/**` or `lib/services/**`.

### `features/<feature>/**`

Real business feature modules.

Examples:

- `features/admin`;
- `features/auth`;
- `features/catalog`;
- `features/counterparties`;
- `features/global-purchases`;
- `features/materials`;
- `features/material-suppliers`;
- `features/notifications`;
- `features/permissions`;
- `features/projects`;
- `features/settings`;
- `features/team`;
- `features/works`.

Allowed here:

- feature screens;
- feature components;
- feature hooks;
- feature-local DTOs;
- feature-local schemas;
- feature-local client orchestration;
- feature-local repository/server-action adapter files when they are part of that module's public contract.

Preferred internal structure:

```txt
features/<feature>/
  components/
  hooks/
  screens/
  types/
  schemas/
  lib/
  repository/
  index.ts
```

Rules:

- expose stable cross-feature imports through `index.ts`;
- do not import another feature's internal files directly unless it is explicitly classified as shared feature infrastructure;
- do not place generic reusable shells here unless they belong under `features/_shared/**`.

### `features/_shared/**`

Shared feature-level infrastructure.

This is for reusable screen orchestration that is too domain-aware for `shared/ui`, but not a standalone business feature.

Canonical homes:

```txt
features/_shared/guide-catalog/**
features/_shared/directories/**
```

Current migration target:

- `features/guide-catalog/**` should move to `features/_shared/guide-catalog/**`;
- `features/directories/**` should move to `features/_shared/directories/**`.

Rules:

- allowed to compose `shared/ui/**`;
- allowed to expose typed adapters for real features;
- must not contain DB calls;
- must not contain tenant-specific business rules.

### `shared/ui/**`

Canonical runtime UI source for the app.

This is the only place for new shared UI components used by `app`, `features`, `entities`, or `components` runtime code.

Allowed here:

- shadcn/Radix primitives;
- common UI composites;
- table/cell helpers;
- empty/loading/error state components;
- neutral UI shells.

Recommended internal classification:

```txt
shared/ui/primitives/**
shared/ui/composites/**
shared/ui/cells/**
shared/ui/shells/**
shared/ui/states/**
```

Current files may still be flatter than this. Do not perform a broad move without a dedicated PR.

Rules:

- no feature imports;
- no app imports;
- no DB imports;
- no business workflows;
- UI must remain reusable and presentation-oriented.

### `components/ui/**`

Legacy compatibility layer only.

This folder exists for historical/shadcn compatibility. It is not the canonical UI source.

Rules:

- do not add new runtime UI here;
- new shared UI goes to `shared/ui/**`;
- if a file remains here, it should generally re-export from `shared/ui/**`.

### `components/layout/**`

Application-wide layout composition.

Allowed here:

- app header;
- app shell pieces;
- layout-level wrappers shared across route groups.

Not allowed here:

- business feature tables;
- estimate/procurement/material-specific UI;
- server data-access logic.

### `components/navigation/**`

Application-wide navigation only.

Allowed here:

- sidebar navigation;
- top navigation;
- reusable nav renderers.

### `components/providers/**`

Application-wide React providers and provider hooks.

Allowed here:

- toast provider wiring;
- breadcrumb provider;
- app-level context providers.

Rules:

- keep provider modules generic;
- do not put feature workflows here.

### `components/shadcn-studio/**`

Demo/reference code only.

Rules:

- do not treat this folder as runtime architecture;
- do not import from it in production feature code unless explicitly reviewed;
- it may remain allowlisted in audits as reference/demo material.

### `entities/**`

Reusable domain-oriented UI/model building blocks.

Use this when the thing is domain-specific but shared by more than one feature.

Examples:

```txt
entities/project/ui/ProjectStatusDot.tsx
entities/estimate/ui/EstimateStatusBadge.tsx
```

Good candidates:

- status badges;
- domain labels;
- entity icons;
- display formatters;
- reusable domain cells/cards with no page orchestration.

Rules:

- entities may import `shared/ui/**` and shared utils;
- entities must not import `features/**`;
- entities must not call DB or server actions.

### `shared/types/**`

Shared client/server-safe DTOs and plain types.

Use this for types that are consumed by more than one layer and do not belong to a single feature UI.

Rules:

- safe for client imports;
- no Drizzle table types unless intentionally exposed as DTOs;
- prefer plain DTOs over raw DB row types in client components.

### `shared/hooks/**`

Reusable client hooks that are not owned by one feature.

Examples:

- table editor state;
- generic debounce;
- shared UI state hooks;
- reusable table/search state when not domain-specific.

Rules:

- no DB access;
- no server-only imports;
- no feature-specific business assumptions.

### `lib/data/**`

Data-access layer.

Allowed here:

- Drizzle schema;
- DB clients;
- DB repositories;
- DB queries;
- tenant filters such as `withActiveTenant`;
- seed/setup/reset scripts that directly manipulate DB state.

Rules:

- must not import `features/**`;
- must not import React/UI/components;
- must not depend on route files;
- DB access must stay server-only.

### `lib/domain/**`

Framework-independent business rules and use-cases.

Allowed here:

- use-cases;
- business policies;
- pure validation rules that are not UI-specific;
- domain services that do not require React/Next UI.

Rules:

- no React;
- no client state libraries;
- avoid direct UI imports;
- avoid framework-specific routing/cache APIs.

### `lib/services/**`

Server-side application services.

Allowed here:

- orchestration across repositories;
- transactions;
- DB-backed workflows;
- cache invalidation helpers when server-only;
- integration with `lib/data/**` and `lib/domain/**`.

Rules:

- must not import `features/**`;
- must not import UI components;
- if a service needs a type currently located in a feature, move that type to `shared/types/**` or `lib/domain/<context>/**` first.

Known cleanup target:

- remove `lib/services/** -> features/**` dependencies, starting with global purchases DTO/date helpers.

### `lib/infrastructure/**`

External/environment-bound adapters.

Allowed here:

- auth adapters;
- payments/Stripe;
- email/Resend;
- storage/Vercel Blob;
- notifications transport;
- Sentry or other monitoring integration;
- middleware/rate-limit/session adapters.

Rules:

- keep integration details here;
- expose stable functions/services upward;
- do not leak provider-specific implementation details into UI features.

### `lib/utils/**` and `lib/utils.ts`

Shared utilities.

Allowed here:

- `cn`;
- result helpers;
- slug helpers;
- formatting helpers that are not UI/domain-specific.

Rules:

- if a utility becomes package-worthy and framework-agnostic, consider moving it to `packages/utils` with backwards-compatible re-export.

### `packages/**`

Workspace packages.

Current workspace globs include `packages/*` and `apps/*`, but the main Next app currently lives at the repository root.

Current packages:

- `packages/ui`;
- `packages/utils`.

Rules:

- `packages/ui` is not the canonical runtime UI source inside the app;
- app runtime code should import UI from `@/shared/ui/*`, not `@repo/ui`;
- `@repo/ui` may remain as package export compatibility, but it should not drive internal app architecture;
- do not create an `apps/web` migration without a dedicated plan and PR.

## Import direction

Preferred dependency direction:

```txt
app -> features -> entities -> shared/ui
app -> lib/services -> lib/domain -> lib/data
features -> shared/ui
features -> shared/hooks
features -> shared/types
features -> entities
features -> lib/services or app/actions adapters when needed
lib/services -> lib/domain + lib/data + lib/infrastructure
lib/data -> database only
```

Forbidden or discouraged:

```txt
lib/** -> features/**
lib/data/** -> UI/components/features
shared/ui/** -> app/features/lib/data
entities/** -> features/**
features/<a>/** -> features/<b>/internal/path
app/**/page.tsx -> large client UI workflows
components/ui/** -> new canonical UI work
```

## Current duplication / drift points

### 1. UI entrypoints

Current overlapping entrypoints:

```txt
shared/ui/**
components/ui/**
packages/ui/**
```

Decision:

- `shared/ui/**` is canonical for runtime app UI;
- `components/ui/**` is legacy compatibility only;
- `packages/ui/**` is package export compatibility, not the app's internal source of truth.

### 2. Shared feature shells inside `features/**`

Current shared shell folders:

```txt
features/guide-catalog/**
features/directories/**
```

Decision:

- classify these as shared feature infrastructure;
- target location is `features/_shared/**`;
- move only in a dedicated mechanical PR.

### 3. Service layer importing feature types/helpers

Known pattern:

```txt
lib/services/** imports from features/**
```

Decision:

- this direction is invalid;
- move shared DTO/date helpers to `shared/types/**`, `shared/**`, or `lib/domain/**` before changing imports.

### 4. Weak `entities/**` adoption

Decision:

- do not mass-migrate;
- move only truly reused domain UI/model pieces into `entities/**`.

## Safe cleanup order

### PR 1 — Architecture source of truth

Scope:

- keep this `ARCHITECTURE.md` current;
- archive obsolete architecture/audit docs;
- do not change runtime code.

### PR 2 — UI entrypoint cleanup

Scope:

- enforce `@/shared/ui/*` in runtime app code;
- keep `components/ui` as compatibility only;
- do not migrate to `@repo/ui` internally.

### PR 3 — Shared feature shell relocation

Scope:

- move `features/guide-catalog/**` to `features/_shared/guide-catalog/**`;
- move `features/directories/**` to `features/_shared/directories/**`;
- update imports only;
- no behavior changes.

### PR 4 — Remove `lib -> features` dependencies

Scope:

- identify imports from `lib/**` into `features/**`;
- move shared types/helpers to neutral layers;
- no UI behavior changes.

### PR 5 — Internal `shared/ui` classification

Scope:

- classify primitives/composites/cells/shells/states;
- move files only when imports are obvious and safe;
- avoid broad design changes.

## New file placement checklist

Before adding a file, answer:

1. Is it a route, layout, route handler, or server action entrypoint? Put it in `app/**`.
2. Is it a real business screen/component/hook? Put it in `features/<feature>/**`.
3. Is it a reusable feature-level shell? Put it in `features/_shared/**`.
4. Is it reusable UI with no business domain? Put it in `shared/ui/**`.
5. Is it domain-specific UI/model reused by multiple features? Put it in `entities/<entity>/**`.
6. Is it a shared DTO/type safe for client/server? Put it in `shared/types/**`.
7. Is it a DB query/repository/schema? Put it in `lib/data/**`.
8. Is it a business rule/use-case? Put it in `lib/domain/**`.
9. Is it a server workflow over DB/domain/infrastructure? Put it in `lib/services/**`.
10. Is it an external provider adapter? Put it in `lib/infrastructure/**`.

If two answers seem valid, choose the lower-level reusable location only when the file is already used by more than one feature. Otherwise keep it local to the feature.
