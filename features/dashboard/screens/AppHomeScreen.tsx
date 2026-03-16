import { HomeDynamicsChart } from '../components/HomeDynamicsChart';
import { HomeKpiCards } from '../components/HomeKpiCards';
import { HomeDashboardKpi, HomePerformanceDynamicsPoint } from '../types';

type AppHomeScreenProps = {
    kpi: HomeDashboardKpi;
    dynamics: HomePerformanceDynamicsPoint[];
};

export function AppHomeScreen({ kpi, dynamics }: AppHomeScreenProps) {
    return (
        <div className="flex flex-col gap-4 lg:gap-6 pt-1 pb-4 lg:pt-2 lg:pb-6 animate-in fade-in duration-500 ease-out">
            <div className="@container/main space-y-4 lg:space-y-10">
                <HomeKpiCards kpi={kpi} />
                <HomeDynamicsChart data={dynamics} />
            </div>
        </div>
    );
}
