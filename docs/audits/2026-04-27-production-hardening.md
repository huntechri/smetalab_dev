# Production Hardening — 2026-04-27

## Purpose

This PR follows the procurement/global-purchases consistency batch and starts the production hardening layer.

The goal is to make the repository-level verification path explicit, bring UI governance checks into the main PR gate, and reduce CI duplication between PR validation and production deployment.

## Surfaces reviewed

- `package.json`
- `.github/workflows/deploy.yml`
- `.github/workflows/verify-setup-action.yml`
- Vercel project `smetalabv3-timeweb`
- Recent Vercel deployments for project `prj_t39HsTOj40SuLwFunRf0njg1qz6M`

## CI/CD policy

The workflow supports pull requests to `main`, pushes to `main`, and manual dispatch, but jobs are now split by responsibility.

### Pull request gate

The PR gate runs only for pull requests from the same repository and for manual dispatch.

It runs:

- dependency install;
- pnpm cache restore;
- Next.js build cache restore;
- lint;
- type-check;
- UI audit;
- unit/isolated tests;
- build.

This is the required release-verification surface before merge.

### Integration tests

Integration tests now use a local GitHub Actions service database based on `pgvector/pgvector:pg16`.

This removes the cross-region GitHub Actions runner to Neon round-trip cost from PR validation. The job remains optional and reports failures as warnings, matching the previous policy.

### Main branch path

On `push` to `main`, the workflow no longer repeats the full PR gate. A merge commit should already have passed the PR gate against the protected target branch.

The main branch path is focused on production work:

- run production migrations;
- deploy the prebuilt production application to Vercel.

## Changes in this PR

### Release verification script

Added:

```bash
pnpm verify:release
```

The script runs:

- `pnpm lint`
- `pnpm type-check`
- `pnpm audit:ui`
- `pnpm test`
- `pnpm build`

This gives local/Codex/agent workflows one explicit command for the non-DB release gate.

### CI PR gate

The main `ci` job now runs `pnpm audit:ui` between type-check and unit tests.

This makes UI governance a first-class merge gate instead of a manual-only follow-up.

### CI runtime optimization

Added Next.js build cache restore for `.next/cache` in the PR gate.

Moved PR integration tests from a remote Neon branch to a local `pgvector/pgvector:pg16` service database. This keeps the test semantics DB-backed while removing the largest source of latency: remote network round-trips and branch lifecycle overhead.

### PR/main split

The full lint/typecheck/audit/unit/build gate no longer runs again on `push main`.

Rationale:

- the PR gate validates the merge candidate before merge;
- repeating the same checks after merge increases CI time without adding much signal;
- production pushes should focus on migration and deployment correctness;
- manual dispatch remains available for an explicit re-run of the gate.

## Explicit non-goals

- No app runtime logic changes.
- No UI changes.
- No server action changes.
- No DB/schema migrations.
- No Neon query tuning changes in this PR.
- No integration-test assertion rewrites.
- No Vercel project changes.

## Manual smoke

After merge, verify:

- GitHub PR gate runs the `UI Audit` step.
- `pnpm verify:release` passes locally or in an agent environment.
- Integration job uses local `pgvector/pgvector:pg16` instead of creating a Neon branch.
- Production migration job completes.
- Production deploy job creates a deployment for the latest main commit.

## Follow-up candidates

1. Make a separate `integration:neon-smoke` job for a small compatibility subset against Neon.
2. Split Vitest configs into node-only unit and jsdom UI suites to reduce unit test environment/import overhead.
3. Reduce `resetDatabase()` frequency or introduce schema-per-worker isolation for integration parallelism.
4. Add targeted Vercel deployment status documentation if deployment observability remains confusing.
