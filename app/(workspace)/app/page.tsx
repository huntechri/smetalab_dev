import { AppHomeScreen } from '@/features/dashboard';
import { HomeDashboardKpiService } from '@/lib/services/home-dashboard-kpi.service';
import { HomePerformanceDynamicsService } from '@/lib/services/home-performance-dynamics.service';
import { getTeamForUser } from '@/lib/data/db/queries';

const EMPTY_KPI = {
    revenue: 0,
    expense: 0,
    profit: 0,
    progress: 0,
    remainingDays: null,
} as const;

export default async function AppHomePage() {
    const team = await getTeamForUser();

    if (!team) {
        return <AppHomeScreen kpi={EMPTY_KPI} dynamics={[]} showDynamicsChart={false} />;
    }

    const [kpi, dynamics, showDynamicsChart] = await Promise.all([
        HomeDashboardKpiService.getByTeamId(team.id),
        HomePerformanceDynamicsService.listByTeamId(team.id),
        HomePerformanceDynamicsService.hasVisibleEstimatesByTeamId(team.id),
    ]);

    return <AppHomeScreen kpi={kpi} dynamics={dynamics} showDynamicsChart={showDynamicsChart} />;
}
