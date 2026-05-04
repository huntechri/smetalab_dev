# Isolated Test DB Boundary Audit

This report checks that unit/UI/API/performance tests do not silently turn into DB integration tests.

- Scanned files: 135
- Total findings: 53
- High findings: 42
- Medium findings: 11

| Severity | Location | Token | Reason |
| --- | --- | --- | --- |
| high | `__tests__/unit/access.test.ts:5` | `from '@/lib/data/` | Isolated tests must not import data-layer modules directly. Move the test to integration or mock the repository boundary. |
| high | `__tests__/unit/access.test.ts:5` | `from '@/lib/data/db/` | Isolated tests must not import DB entrypoints. Move the test to integration or mock the DB boundary. |
| high | `__tests__/unit/access.test.ts:6` | `from '@/lib/data/` | Isolated tests must not import data-layer modules directly. Move the test to integration or mock the repository boundary. |
| high | `__tests__/unit/access.test.ts:6` | `from '@/lib/data/db/` | Isolated tests must not import DB entrypoints. Move the test to integration or mock the DB boundary. |
| high | `__tests__/unit/admin-guard.test.ts:3` | `from '@/lib/data/` | Isolated tests must not import data-layer modules directly. Move the test to integration or mock the repository boundary. |
| high | `__tests__/unit/admin-guard.test.ts:3` | `from '@/lib/data/db/` | Isolated tests must not import DB entrypoints. Move the test to integration or mock the DB boundary. |
| high | `__tests__/unit/admin-queries.test.ts:3` | `from '@/lib/data/` | Isolated tests must not import data-layer modules directly. Move the test to integration or mock the repository boundary. |
| high | `__tests__/unit/admin-queries.test.ts:3` | `from '@/lib/data/db/` | Isolated tests must not import DB entrypoints. Move the test to integration or mock the DB boundary. |
| high | `__tests__/unit/admin-queries.test.ts:4` | `from '@/lib/data/` | Isolated tests must not import data-layer modules directly. Move the test to integration or mock the repository boundary. |
| high | `__tests__/unit/admin-queries.test.ts:4` | `from '@/lib/data/db/` | Isolated tests must not import DB entrypoints. Move the test to integration or mock the DB boundary. |
| high | `__tests__/unit/admin-queries.test.ts:5` | `from '@/lib/data/` | Isolated tests must not import data-layer modules directly. Move the test to integration or mock the repository boundary. |
| high | `__tests__/unit/admin-queries.test.ts:5` | `from '@/lib/data/db/` | Isolated tests must not import DB entrypoints. Move the test to integration or mock the DB boundary. |
| medium | `__tests__/unit/admin-queries.test.ts:37` | `process.env.DATABASE_URL` | Isolated tests should not depend on database env vars except explicit env-boundary tests. |
| medium | `__tests__/unit/admin-queries.test.ts:38` | `process.env.DATABASE_URL` | Isolated tests should not depend on database env vars except explicit env-boundary tests. |
| medium | `__tests__/unit/admin-queries.test.ts:45` | `process.env.DATABASE_URL` | Isolated tests should not depend on database env vars except explicit env-boundary tests. |
| high | `__tests__/unit/home-dashboard-kpi-db.service.test.ts:2` | `from 'drizzle-orm'` | Isolated tests must not import database clients directly. |
| high | `__tests__/unit/lib/data/db/db-sync.test.ts:7` | `from '@/lib/data/` | Isolated tests must not import data-layer modules directly. Move the test to integration or mock the repository boundary. |
| high | `__tests__/unit/lib/data/db/db-sync.test.ts:7` | `from '@/lib/data/db/` | Isolated tests must not import DB entrypoints. Move the test to integration or mock the DB boundary. |
| high | `__tests__/unit/lib/data/db/seed-permissions.test.ts:3` | `from '@/lib/data/` | Isolated tests must not import data-layer modules directly. Move the test to integration or mock the repository boundary. |
| high | `__tests__/unit/lib/data/db/seed-permissions.test.ts:3` | `from '@/lib/data/db/` | Isolated tests must not import DB entrypoints. Move the test to integration or mock the DB boundary. |
| high | `__tests__/unit/lib/data/db/seed-permissions.test.ts:15` | `from '@/lib/data/` | Isolated tests must not import data-layer modules directly. Move the test to integration or mock the repository boundary. |
| high | `__tests__/unit/lib/data/db/seed-permissions.test.ts:15` | `from '@/lib/data/db/` | Isolated tests must not import DB entrypoints. Move the test to integration or mock the DB boundary. |
| high | `__tests__/unit/lib/data/db/test-utils.test.ts:11` | `from '@/lib/data/` | Isolated tests must not import data-layer modules directly. Move the test to integration or mock the repository boundary. |
| high | `__tests__/unit/lib/data/db/test-utils.test.ts:11` | `from '@/lib/data/db/` | Isolated tests must not import DB entrypoints. Move the test to integration or mock the DB boundary. |
| medium | `__tests__/unit/lib/data/db/test-utils.test.ts:25` | `process.env.DATABASE_URL` | Isolated tests should not depend on database env vars except explicit env-boundary tests. |
| medium | `__tests__/unit/lib/data/db/test-utils.test.ts:26` | `process.env.TEST_DATABASE_URL` | Isolated tests should not depend on database env vars except explicit env-boundary tests. |
| medium | `__tests__/unit/lib/data/db/test-utils.test.ts:33` | `process.env.TEST_DATABASE_URL` | Isolated tests should not depend on database env vars except explicit env-boundary tests. |
| medium | `__tests__/unit/lib/data/db/test-utils.test.ts:34` | `process.env.DATABASE_URL` | Isolated tests should not depend on database env vars except explicit env-boundary tests. |
| medium | `__tests__/unit/lib/data/db/test-utils.test.ts:42` | `process.env.TEST_DATABASE_URL` | Isolated tests should not depend on database env vars except explicit env-boundary tests. |
| medium | `__tests__/unit/lib/data/db/test-utils.test.ts:43` | `process.env.DATABASE_URL` | Isolated tests should not depend on database env vars except explicit env-boundary tests. |
| medium | `__tests__/unit/lib/data/db/test-utils.test.ts:50` | `process.env.TEST_DATABASE_URL` | Isolated tests should not depend on database env vars except explicit env-boundary tests. |
| medium | `__tests__/unit/lib/data/db/test-utils.test.ts:51` | `process.env.DATABASE_URL` | Isolated tests should not depend on database env vars except explicit env-boundary tests. |
| high | `__tests__/unit/project-dashboard-kpi-db.service.test.ts:2` | `from 'drizzle-orm'` | Isolated tests must not import database clients directly. |
| high | `__tests__/unit/project-receipts.service.test.ts:2` | `from 'drizzle-orm'` | Isolated tests must not import database clients directly. |
| high | `__tests__/unit/team-api.service.test.ts:3` | `from '@/lib/data/` | Isolated tests must not import data-layer modules directly. Move the test to integration or mock the repository boundary. |
| high | `__tests__/unit/team-api.service.test.ts:3` | `from '@/lib/data/db/` | Isolated tests must not import DB entrypoints. Move the test to integration or mock the DB boundary. |
| high | `__tests__/unit/user-menu.test.tsx:4` | `from '@/lib/data/` | Isolated tests must not import data-layer modules directly. Move the test to integration or mock the repository boundary. |
| high | `__tests__/unit/user-menu.test.tsx:4` | `from '@/lib/data/db/` | Isolated tests must not import DB entrypoints. Move the test to integration or mock the DB boundary. |
| high | `__tests__/ui/CounterpartiesClient.test.tsx:6` | `from '@/lib/data/` | Isolated tests must not import data-layer modules directly. Move the test to integration or mock the repository boundary. |
| high | `__tests__/ui/CounterpartiesClient.test.tsx:6` | `from '@/lib/data/db/` | Isolated tests must not import DB entrypoints. Move the test to integration or mock the DB boundary. |
| high | `__tests__/ui/MaterialSuppliersClient.test.tsx:6` | `from '@/lib/data/` | Isolated tests must not import data-layer modules directly. Move the test to integration or mock the repository boundary. |
| high | `__tests__/ui/MaterialSuppliersClient.test.tsx:6` | `from '@/lib/data/db/` | Isolated tests must not import DB entrypoints. Move the test to integration or mock the DB boundary. |
| high | `__tests__/ui/active-team-indicator.test.tsx:5` | `from '@/lib/data/` | Isolated tests must not import data-layer modules directly. Move the test to integration or mock the repository boundary. |
| high | `__tests__/ui/active-team-indicator.test.tsx:5` | `from '@/lib/data/db/` | Isolated tests must not import DB entrypoints. Move the test to integration or mock the DB boundary. |
| high | `__tests__/ui/app-home-dashboard-page.test.tsx:6` | `from '@/lib/data/` | Isolated tests must not import data-layer modules directly. Move the test to integration or mock the repository boundary. |
| high | `__tests__/ui/app-home-dashboard-page.test.tsx:6` | `from '@/lib/data/db/` | Isolated tests must not import DB entrypoints. Move the test to integration or mock the DB boundary. |
| high | `__tests__/ui/project-dashboard-page.test.tsx:6` | `from '@/lib/data/` | Isolated tests must not import data-layer modules directly. Move the test to integration or mock the repository boundary. |
| high | `__tests__/api/user.test.ts:3` | `from '@/lib/data/` | Isolated tests must not import data-layer modules directly. Move the test to integration or mock the repository boundary. |
| high | `__tests__/api/user.test.ts:3` | `from '@/lib/data/db/` | Isolated tests must not import DB entrypoints. Move the test to integration or mock the DB boundary. |
| high | `__tests__/performance/embedding-update.test.ts:3` | `from '@/lib/data/` | Isolated tests must not import data-layer modules directly. Move the test to integration or mock the repository boundary. |
| high | `__tests__/performance/embedding-update.test.ts:3` | `from '@/lib/data/db/` | Isolated tests must not import DB entrypoints. Move the test to integration or mock the DB boundary. |
| high | `__tests__/performance/reindex-embeddings.test.ts:2` | `from '@/lib/data/` | Isolated tests must not import data-layer modules directly. Move the test to integration or mock the repository boundary. |
| high | `__tests__/performance/reindex-embeddings.test.ts:2` | `from '@/lib/data/db/` | Isolated tests must not import DB entrypoints. Move the test to integration or mock the DB boundary. |
