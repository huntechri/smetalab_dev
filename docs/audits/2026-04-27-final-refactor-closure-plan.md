# Final Refactor Closure Plan — 2026-04-27

## Purpose

This document defines the final 3–5 PR closure plan for the deep UI/code audit refactor cycle after PR #125.

The goal is to finish the audit-driven refactor work without starting another broad refactor pass.

## Current baseline

Merged baseline through PR #125:

- PR #90 — canonical shared UI import guard
- PR #91 — DataTable header rendering helpers
- PR #92 — InputGroupTextarea variant cleanup
- PR #112 — audit tooling source of truth
- PR #113 — materials/works table-cell helper deduplication
- PR #114 — settings/team semantic theme tokens
- PR #115 — generated audit artifact handling
- PR #116 — workspace alias/type-check stabilization
- PR #117 — depcheck/unimported classification
- PR #118 — deep UI audit status sync
- PR #119 — estimate stale-data parity audit
- PR #120 — estimate stale-data parity tests
- PR #121 — landing header auth link semantics
- PR #122 — landing CTA link semantics
- PR #123 — landing local data extraction
- PR #124 — deep UI status sync after landing cleanup
- PR #125 — card visual consistency status sync

## Completion criteria

The refactor cycle is considered closed when:

1. Remaining card cleanup is either implemented as a single feature-local change or explicitly skipped as not worth the risk.
2. Dependency cleanup is limited to confirmed single-candidate changes only.
3. All audit status documents agree that broad P1/P2 refactor work is closed.
4. Final verification command is recorded.
5. Future changes become feature-driven, not audit-driven.

## Final PR sequence

### PR #126 — Global purchase metric wrapper or explicit skip

Preferred title:

```txt
refactor(purchases): extract editable purchase metric wrapper
```

Scope:

```txt
features/global-purchases/components/cards/GlobalPurchaseCard.tsx only
```

Allowed work:

- extract the repeated editable metric shell for quantity and price;
- keep the helper local to `GlobalPurchaseCard.tsx`;
- preserve the exact class string;
- preserve all `EditableCell` props and callbacks;
- no shared UI changes.

Fallback if tool constraints prevent a safe code edit:

```txt
docs(audit): mark purchase metric wrapper as skipped
```

Reasonable skip condition:

- the duplication is only two local wrappers;
- extracting it does not materially reduce architectural risk;
- current card architecture is already closed by `DenseCard`, `PurchaseMetric`, and estimate-local card helpers.

Validation:

```bash
pnpm lint
pnpm type-check
pnpm test
```

### PR #127 — Remove `concurrently` only if confirmed

Preferred title:

```txt
chore(deps): remove unused concurrently
```

Scope:

```txt
package.json
pnpm-lock.yaml
```

Required local commands:

```bash
rg "concurrently"
pnpm remove concurrently
pnpm lint
pnpm type-check
pnpm test
pnpm build
```

Rules:

- do not edit `pnpm-lock.yaml` manually;
- do not remove from raw `depcheck` output alone;
- if `rg` finds active workflow usage outside package metadata/audit docs, keep the dependency;
- if build fails after removal, revert the change.

### PR #128 — Resolve `autoprefixer`

Preferred title if removal passes:

```txt
chore(deps): remove unused autoprefixer
```

Preferred title if kept:

```txt
docs(deps): keep autoprefixer as build-pipeline dependency
```

Scope:

```txt
package.json
pnpm-lock.yaml
postcss/tailwind config review
```

Required local commands:

```bash
rg "autoprefixer"
pnpm remove autoprefixer
pnpm lint
pnpm type-check
pnpm test
pnpm build
```

Rules:

- verify `postcss.config.*` first;
- do not remove if the Tailwind/PostCSS pipeline becomes unstable;
- if removal is risky, keep the dependency and document why.

### PR #129 — Close the deep refactor cycle

Preferred title:

```txt
docs(audit): close deep refactor cycle
```

Scope:

```txt
docs/audits/2026-04-27-deep-ui-audit-status.md
docs/audits/2026-04-27-depcheck-unimported-classification.md
docs/audits/2026-04-27-card-visual-consistency-audit.md
```

Required updates:

- mark P1/P2 audit-driven work closed;
- record the outcome of purchase metric cleanup;
- record the outcome of `concurrently`;
- record the outcome of `autoprefixer`;
- state that broad refactor work is complete;
- state that future work must be feature-driven.

Final verification:

```bash
pnpm verify:release
```

If `verify:release` fails for external/environmental reasons, record the exact failure reason in the PR body.

## Three-PR compressed path

Use this if the goal is minimum churn:

| PR | Action |
| --- | --- |
| #126 | purchase metric wrapper or explicit skip |
| #127 | remove `concurrently` only if confirmed |
| #128 | close deep refactor cycle and explicitly keep/defer `autoprefixer` |

## Four-PR preferred path

Use this if dependency cleanup should be fully resolved:

| PR | Action |
| --- | --- |
| #126 | purchase metric wrapper or explicit skip |
| #127 | remove `concurrently` only if confirmed |
| #128 | remove or explicitly keep `autoprefixer` after build verification |
| #129 | close deep refactor cycle |

## Non-goals

- No broad shared UI refactor.
- No server action rewrites.
- No DB/schema changes.
- No estimate stale-data runtime changes without a reproduced bug.
- No global `MetricPill` until exact cross-feature compatibility is proven.
- No unimported/depcheck mass deletion.
- No manual lockfile editing for dependency removal.
