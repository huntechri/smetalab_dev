'use client';

import { ProjectListItem } from '../../shared/types';
import { DashboardKpiCards } from '../components/DashboardKpiCards';
import { DashboardChart } from '../components/DashboardChart';
import { DashboardDataTable } from '../components/DashboardDataTable';

type ProjectDashboardProps = {
    project: ProjectListItem;
};

export function ProjectDashboard({ project }: ProjectDashboardProps) {
    return (
        <div className="flex flex-col gap-6 lg:gap-8 py-4 lg:py-6">
            {/* Header Section */}
            <div className="px-4 lg:px-6">
                <div className="flex flex-col gap-2">
                    <h1 className="text-2xl font-bold tracking-tight">{project.name}</h1>
                    <p className="text-muted-foreground">Управление проектом и мониторинг основных показателей</p>
                </div>
            </div>

            {/* Dashboard Content */}
            <div className="space-y-6 lg:space-y-10">
                <div className="@container/main px-4 lg:px-6 space-y-6 lg:space-y-10">
                    <DashboardKpiCards project={project} />
                    <DashboardChart />
                </div>

                <DashboardDataTable />

                <div className="px-4 lg:px-6">
                    <div className="rounded-xl border border-dashed p-8 text-center text-muted-foreground">
                        Additional widgets (Team, Activity) will be implemented here
                    </div>
                </div>
            </div>
        </div>
    );
}
