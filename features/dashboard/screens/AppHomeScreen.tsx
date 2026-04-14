'use client';

import { HomeDynamicsChart } from '../components/HomeDynamicsChart';
import { HomeKpiCards } from '../components/HomeKpiCards';
import { HomeDashboardKpi, HomePerformanceDynamicsPoint } from '../types';
import { useBreadcrumbs } from '@/components/providers/breadcrumb-provider';

type AppHomeScreenProps = {
    kpi: HomeDashboardKpi;
    dynamics: HomePerformanceDynamicsPoint[];
    showDynamicsChart: boolean;
};

export function AppHomeScreen({ kpi, dynamics, showDynamicsChart }: AppHomeScreenProps) {
    useBreadcrumbs([{ label: 'Главная' }]);
    return (
        <div className="flex flex-col gap-3 sm:gap-4 lg:gap-6 pt-1 pb-3 sm:pb-4 lg:pt-2 lg:pb-6 animate-in fade-in duration-500 ease-out">
            <div className="@container/main space-y-3 sm:space-y-6 lg:space-y-10">
                <HomeKpiCards kpi={kpi} />
                {showDynamicsChart ? <HomeDynamicsChart data={dynamics} /> : null}
            </div>
        </div>
    );
}
