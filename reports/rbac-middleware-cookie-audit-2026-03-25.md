# RBAC, middleware and cookies audit (2026-03-25)

## Scope
- RBAC core checks in `lib/infrastructure/auth/rbac.ts` and `lib/infrastructure/auth/access.ts`.
- Authentication/session and cookie handling in `lib/infrastructure/auth/session.ts`, `app/api/refresh/route.ts`, `app/api/auth/refresh/route.ts`.
- Tenant/team resolution and impersonation interaction in `lib/data/db/user-team-queries.ts` and `app/actions/admin/impersonation.ts`.

## Key findings

### 1) **High**: ended impersonation session can still affect tenant resolution
- `getImpersonationTeam` loads an impersonation session only by `sessionToken`, but does **not** filter by `endedAt IS NULL`.
- As a result, a token that has already been ended in DB can still resolve a target tenant while cookie remains present.
- `hasPermission` already checks `endedAt IS NULL`, which creates an inconsistent state where tenant context can remain impersonated while permission path denies impersonation semantics.

**Evidence**
- Query without `endedAt` guard in `lib/data/db/user-team-queries.ts` (`getImpersonationTeam`).
- Session ending writes `endedAt = CURRENT_TIMESTAMP` in `lib/data/admin/impersonation.repository.ts`.

**Recommendation**
- Add `isNull(impersonationSessions.endedAt)` to both `getImpersonationTeam` query branches.
- Optionally bind impersonation session to current superadmin user id during resolution.

### 2) **Medium**: user profile loads team membership without active-membership filter
- `getUser` does `leftJoin(teamMembers, eq(users.id, teamMembers.userId))` without `leftAt IS NULL`/active guard.
- If historical memberships exist, `tenantId`/`teamRole` can be stale or non-deterministic.

**Evidence**
- Join condition in `lib/data/db/user-team-queries.ts`.
- Active membership filtering is done correctly in `checkAccess` and `rbac` (`isNull(teamMembers.leftAt)`), showing inconsistency.

**Recommendation**
- Join only active memberships (or resolve membership through `resolveTeamForUser`) so user context matches RBAC checks.

### 3) **Low**: naming mismatch can confuse refresh endpoint maintenance
- `REFRESH_ENDPOINT_PATH` is `/api/refresh`, and `LEGACY_REFRESH_ENDPOINT_PATH` is `/api/auth/refresh`.
- `app/api/auth/refresh/route.ts` proxies to `/api/refresh`, so behavior is valid, but naming can cause mistakes if one path is removed later.

**Evidence**
- Constants in `lib/infrastructure/auth/session.ts`.
- Proxy route in `app/api/auth/refresh/route.ts`.

**Recommendation**
- Keep a single canonical constant and route alias docs, or remove legacy alias after migration.

## Cookie checks summary
- Access and refresh tokens are `httpOnly`; good baseline.
- `secure` is enabled only in production; expected.
- `sameSite`: access uses `lax`, refresh uses `strict`.
- Token refresh attempts inside request context handle read-only cookie store gracefully (`try/catch` in `tryRefreshSessionFromCookie`).

## Overall risk assessment
- Immediate fix priority: impersonation session validity check during team resolution.
- Next priority: unify active-membership logic for identity context and RBAC context.

## Implementation status (2026-03-25)
- ✅ Added `endedAt IS NULL` guard for impersonation lookup in `getImpersonationTeam`.
- ✅ Added active-membership guard (`teamMembers.leftAt IS NULL`) in `getUser` and `getUserWithTeam`.
- ✅ Unified refresh endpoint handling constants to use one canonical endpoint plus aliases for cleanup.
