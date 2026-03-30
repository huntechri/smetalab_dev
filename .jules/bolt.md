## 2026-02-02 - Database Indexing Surprises
**Learning:** The `notifications` table was missing indexes entirely, despite being a high-volume table queried by `userId` and `createdAt`. Also, `teamMembers` table had a unique index on `(teamId, userId)` but not `userId` alone, making `getTeamForUser` (a hot path) a potential full table scan.
**Action:** Always verify `schema.ts` for indexes on foreign keys and frequently filtered columns, especially for "feed" type tables and core relationship tables. Do not assume composite indexes cover single-column lookups effectively if the column is not the first one.

## 2026-02-02 - CI Database Shared State
**Learning:** The CI pipeline runs migrations against a shared/persistent database (Neon), leading to `duplicate key` errors if an index already exists (e.g., from a previous run or manual fix) but the migration hasn't been recorded. Drizzle's default `CREATE INDEX` is not idempotent.
**Action:** When adding indexes, manually modify the generated Drizzle migration file to use `CREATE INDEX IF NOT EXISTS`. This ensures the migration is robust against existing schema states in shared environments.

## 2026-02-02 - Commit Message Linting
**Learning:** The project enforces strict commit message linting, including a body line length limit of 100 characters.
**Action:** Always wrap the body of commit messages to 72-80 characters.

## 2026-02-02 - Security Checks in CI
**Learning:** The 'Security Checks' job (dependency review) may fail if the repository doesn't have the dependency graph enabled, which agents cannot change.
**Action:** Ensure the workflow step has `continue-on-error: true` if the feature is optional, to prevent blocking the entire pipeline.

## 2026-02-02 - Testing Client Components
**Learning:** Testing `use client` components (like `Login`) with `vitest` and `@testing-library/react` can trigger `ReferenceError: window is not defined` if `react-dom` attempts to access globals not present in the test environment (or if `jsdom` setup is partial).
**Action:** Polyfill `global.window` in the specific test file if you encounter this error during unit testing of client components.

## 2026-02-03 - Robust Seeding with TRUNCATE CASCADE and RETURNING
**Learning:** Seeding scripts that delete and re-insert reference data (like permissions) are fragile if they rely on static IDs or don't handle dependent tables.
**Action:** Use `TRUNCATE TABLE ... RESTART IDENTITY CASCADE` to cleanly wipe data and dependencies. Use `RETURNING` clause on `INSERT` to capture dynamic IDs for subsequent inserts in the same transaction.

## 2026-03-30 - Progress Recalculation Hot Path
**Learning:** `ProjectProgressService.refreshForProject` fetched every execution row just to compute totals (`rows.length` + `filter`). For large projects this scales network transfer and memory as O(n) per recalculation, even though only two counts are needed.
**Action:** For progress/KPI recomputations, push aggregation to SQL (`count(*)`, `count(*) filter`) and return one row only; reserve row-level fetches for screens that actually render row details.
