'use client';

import { HomeDynamicsChart } from '../components/HomeDynamicsChart';
import { HomeKpiCards } from '../components/HomeKpiCards';
import { HomeDashboardKpi, HomePerformanceDynamicsPoint } from '../types';
import { useBreadcrumbs } from '@/components/providers/breadcrumb-provider';
import { useVisibleRouteRefresh } from '@/shared/hooks/use-visible-route-refresh';
import { DashboardPageStack, DashboardMainContainer } from '@/shared/ui/dashboard-layout';

type AppHomeScreenProps = {
    kpi: HomeDashboardKpi;
    dynamics: HomePerformanceDynamicsPoint[];
    showDynamicsChart: boolean;
};

export function AppHomeScreen({ kpi, dynamics, showDynamicsChart }: AppHomeScreenProps) {
    useBreadcrumbs([{ label: 'Главная' }]);
    useVisibleRouteRefresh();

    return (
        <DashboardPageStack className="animate-in fade-in duration-500 ease-out">
            <DashboardMainContainer>
                <HomeKpiCards kpi={kpi} />
                {showDynamicsChart ? <HomeDynamicsChart data={dynamics} /> : null}
            </DashboardMainContainer>
        </DashboardPageStack>
    );
}
