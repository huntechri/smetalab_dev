import { revalidateTag } from 'next/cache';

export const HOME_DASHBOARD_KPI_TAG = 'home-dashboard-kpi';
export const HOME_PERFORMANCE_DYNAMICS_TAG = 'home-performance-dynamics';
export const HOME_DYNAMICS_VISIBLE_ESTIMATES_TAG = 'home-dynamics-visible-estimates';

export const getHomeDashboardKpiTeamTag = (teamId: number) => `${HOME_DASHBOARD_KPI_TAG}-${teamId}`;
export const getHomePerformanceDynamicsTeamTag = (teamId: number) => `${HOME_PERFORMANCE_DYNAMICS_TAG}-${teamId}`;
export const getHomeDynamicsVisibleEstimatesTeamTag = (teamId: number) => `${HOME_DYNAMICS_VISIBLE_ESTIMATES_TAG}-${teamId}`;

const safeRevalidateTag = (tag: string) => {
  try {
    revalidateTag(tag, 'max');
  } catch (cacheError) {
    if (cacheError instanceof Error && cacheError.message.includes('static generation store missing')) {
      return;
    }

    console.warn(`Failed to revalidate cache tag "${tag}"`, cacheError);
  }
};

export const invalidateHomeDashboardCache = (teamId: number) => {
  safeRevalidateTag(HOME_DASHBOARD_KPI_TAG);
  safeRevalidateTag(getHomeDashboardKpiTeamTag(teamId));
  safeRevalidateTag(HOME_PERFORMANCE_DYNAMICS_TAG);
  safeRevalidateTag(getHomePerformanceDynamicsTeamTag(teamId));
  safeRevalidateTag(HOME_DYNAMICS_VISIBLE_ESTIMATES_TAG);
  safeRevalidateTag(getHomeDynamicsVisibleEstimatesTeamTag(teamId));
};
