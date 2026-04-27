# Dashboard Refresh Parity — 2026-04-27

## Purpose

This PR follows the project card cleanup batch and starts the larger dashboard refresh parity batch.

The goal is to reduce stale KPI/chart data on dashboard surfaces after estimate, execution, procurement, purchase and receipt mutations.

## Surfaces reviewed

- `app/(workspace)/app/page.tsx`
- `features/dashboard/screens/AppHomeScreen.tsx`
- `app/(workspace)/app/projects/[projectId]/page.tsx`
- `features/projects/dashboard/screens/ProjectDashboard.tsx`
- `lib/services/home-dashboard-cache.ts`
- `lib/services/home-dashboard-kpi.service.ts`
- `lib/services/home-performance-dynamics.service.ts`
- `lib/services/project-dashboard-kpi.service.ts`
- `lib/services/estimate-rows.service.ts`
- `lib/services/estimate-execution.service.ts`
- `lib/services/global-purchases.service.ts`
- `lib/services/project-receipts.service.ts`

## Current server/cache behavior

### Home dashboard

Home KPI and performance dynamics use `unstable_cache` with 120-second revalidation and explicit cache tags.

`invalidateHomeDashboardCache(teamId)` currently revalidates:

- global home KPI tag;
- team-scoped home KPI tag;
- global home performance dynamics tag;
- team-scoped home performance dynamics tag;
- global visible-estimates tag;
- team-scoped visible-estimates tag.

Confirmed invalidation call sites include estimate rows, estimate status/delete, execution updates/additions, global purchases and project receipts.

### Project dashboard

Project dashboard KPI currently loads server-side through `ProjectDashboardKpiService.getByProjectId(...)` and is not cached through `unstable_cache`.

This means project dashboard freshness mostly depends on route refresh/navigation rather than tag invalidation.

## Changes in this PR

### Shared visible route refresh hook

Added:

- `shared/hooks/use-visible-route-refresh.ts`

The hook calls `router.refresh()` when the page becomes relevant again:

- window focus;
- pageshow;
- visibility change back to visible;
- periodic visible-tab interval.

It includes a small debounce to avoid duplicate refreshes from overlapping browser events.

### Home dashboard

`AppHomeScreen` now uses `useVisibleRouteRefresh()` so cached KPI/dynamics can be refreshed after tag invalidation when the user returns to the page.

### Project dashboard

`ProjectDashboard` now uses `useVisibleRouteRefresh()` so server-loaded KPI, dynamics and estimate list data can refresh after mutations in nested estimate/procurement/execution pages or other tabs.

## Explicit non-goals

- No dashboard UI redesign.
- No KPI formulas changed.
- No server action rewrites.
- No DB/schema changes.
- No cache tag policy changes.
- No revalidation interval tuning beyond the shared client refresh interval.
- No procurement/global-purchases consistency changes in this PR.

## Manual smoke

- Home dashboard still renders KPI cards and dynamics chart.
- Home dashboard refreshes on focus/pageshow/visible tab without full page reload.
- Project dashboard still renders KPI cards, dynamics chart and estimates table.
- Project dashboard refreshes on focus/pageshow/visible tab without changing route.
- Project estimate table still keeps its existing interactions.

## Follow-up candidates

1. Audit procurement/global purchases data consistency and aggregation separately.
2. Consider project-scoped dashboard cache tags only if project dashboard queries become expensive enough to require caching.
3. Add targeted UI tests for route-refresh hook consumers if stale-dashboard regressions recur.
