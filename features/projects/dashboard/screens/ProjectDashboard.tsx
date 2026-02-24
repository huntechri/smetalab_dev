'use client';

import { ProjectListItem } from '../../shared/types';
import { DashboardKpiCards } from '../components/DashboardKpiCards';
import { DashboardChart } from '../components/DashboardChart';
import { ProjectEstimatesTable } from '../components/ProjectEstimatesTable';
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import Link from 'next/link';
import { PerformanceDynamicsPoint } from '@/lib/services/project-performance-dynamics.service';

type EstimateListItem = {
    id: string;
    projectId: string;
    name: string;
    slug: string;
    status: string;
    total: number;
    createdAt: Date;
    updatedAt: Date;
};

type ProjectDashboardProps = {
    project: ProjectListItem;
    estimates: EstimateListItem[];
    performanceDynamics: PerformanceDynamicsPoint[];
};

export function ProjectDashboard({ project, estimates, performanceDynamics }: ProjectDashboardProps) {
    return (
        <div className="flex flex-col gap-4 lg:gap-6 pt-1 pb-4 lg:pt-2 lg:pb-6">
            <div className="px-4 lg:px-6">
                <Breadcrumb className="mb-2">
                    <BreadcrumbList>
                        <BreadcrumbItem>
                            <BreadcrumbLink asChild>
                                <Link href="/app">Главная</Link>
                            </BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbLink asChild>
                                <Link href="/app/projects">Проекты</Link>
                            </BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbPage>{project.name}</BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>
                <div className="flex flex-col gap-2">
                    <h1 className="text-2xl font-bold tracking-tight">{project.name}</h1>
                    <p className="text-muted-foreground">Управление проектом и мониторинг основных показателей</p>
                </div>
            </div>

            <div className="space-y-6 lg:space-y-10">
                <div className="@container/main px-4 lg:px-6 space-y-6 lg:space-y-10">
                    <DashboardKpiCards project={project} />
                    <DashboardChart data={performanceDynamics} />
                </div>

                <ProjectEstimatesTable
                    projectId={project.id}
                    projectSlug={project.slug}
                    initialEstimates={estimates}
                />

                <div className="px-4 lg:px-6">
                    <div className="rounded-xl border border-dashed p-8 text-center text-muted-foreground">
                        Additional widgets (Team, Activity) will be implemented here
                    </div>
                </div>
            </div>
        </div>
    );
}
