'use client';

import { ProjectListItem } from '../../shared/types';
import { DashboardKpiCards } from '../components/DashboardKpiCards';
import { DashboardChart } from '../components/DashboardChart';
import { ProjectEstimatesTable } from '../components/ProjectEstimatesTable';
import { EstimateMeta } from '../../estimates/types/dto';

type ProjectDashboardProps = {
    project: ProjectListItem;
    estimates: EstimateMeta[];
};

export function ProjectDashboard({ project, estimates }: ProjectDashboardProps) {
    return (
        <div className="flex flex-col gap-6 lg:gap-8 py-4 lg:py-6">
            <div className="px-4 lg:px-6">
                <div className="flex flex-col gap-2">
                    <h1 className="text-2xl font-bold tracking-tight">{project.name}</h1>
                    <p className="text-muted-foreground">Управление проектом и мониторинг основных показателей</p>
                </div>
            </div>

            <div className="space-y-6 lg:space-y-10">
                <div className="@container/main px-4 lg:px-6 space-y-6 lg:space-y-10">
                    <DashboardKpiCards project={project} />
                    <DashboardChart />
                </div>

                <ProjectEstimatesTable projectId={project.id} initialEstimates={estimates} />

                <div className="px-4 lg:px-6">
                    <div className="rounded-xl border border-dashed p-8 text-center text-muted-foreground">
                        Additional widgets (Team, Activity) will be implemented here
                    </div>
                </div>
            </div>
        </div>
    );
}
