# Production Hardening — 2026-04-27

## Purpose

This PR follows the procurement/global-purchases consistency batch and starts the production hardening layer.

The goal is to make the repository-level verification path explicit and to bring UI governance checks into the main PR gate.

## Surfaces reviewed

- `package.json`
- `.github/workflows/deploy.yml`
- `.github/workflows/verify-setup-action.yml`
- Vercel project `smetalabv3-timeweb`
- Recent Vercel deployments for project `prj_t39HsTOj40SuLwFunRf0njg1qz6M`

## Current CI/CD baseline

The main CI/CD workflow currently runs on push to `main`, pull requests to `main`, and manual dispatch.

The `ci` job runs:

- install dependencies;
- lint;
- type-check;
- unit/isolated tests;
- build.

The integration-test job is optional and uses a Neon test branch. Failures are reported as warnings rather than hard-blocking the pipeline.

Production deploy path is split into:

- production migration job;
- production Vercel deploy job.

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

## Vercel deployment observation

Recent Vercel deployment listing shows production deployments are being created for main-branch merge commits. The latest observed production deployment in the returned page was still for PR #102 at the time of inspection, while later main commits existed in GitHub.

This PR does not change Vercel deployment logic. The next manual check after merge should confirm that the production deployment advances to the current main commit.

## Explicit non-goals

- No app runtime logic changes.
- No UI changes.
- No server action changes.
- No DB/schema migrations.
- No Neon query tuning changes in this PR.
- No integration-test gating policy change.
- No Vercel project/env variable changes.

## Manual smoke

After merge, verify:

- GitHub CI runs the `UI Audit` step.
- `pnpm verify:release` passes locally or in an agent environment.
- Production migration job still pulls Vercel production env.
- Production deploy job creates a deployment for the latest main commit.

## Follow-up candidates

1. Neon slow query/index audit as a separate database-performance batch.
2. Decide whether optional integration tests should eventually become required on protected branches.
3. Add targeted Vercel deployment status documentation if deployment observability remains confusing.
