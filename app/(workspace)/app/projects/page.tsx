import { ProjectsScreen } from '@/features/projects/list/screens/ProjectsScreen';
import { getProjects } from '@/lib/data/projects/repo';
import { getTeamForUser, getCounterparties } from '@/lib/data/db/queries';
import { redirect } from 'next/navigation';
import { ProjectListItem, ProjectStatus } from '@/features/projects/shared/types';
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/shared/ui/breadcrumb";
import Link from 'next/link';

export default async function Page() {
    const team = await getTeamForUser();

    if (!team) {
        redirect('/login');
    }

    const projectsData = await getProjects(team.id);
    const { data: counterpartiesData } = await getCounterparties(team.id);

    // Map DB projects to the UI expected format
    const projects: ProjectListItem[] = projectsData.map((p) => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        customerName: p.customerName || p.counterpartyName || '',
        counterpartyId: p.counterpartyId || undefined,
        contractAmount: p.contractAmount,
        startDate: p.startDate?.toISOString() || '',
        endDate: p.endDate?.toISOString() || '',
        progress: p.progress,
        status: p.status as ProjectStatus,
    }));

    const counterparties = counterpartiesData.map((c) => ({
        id: c.id,
        name: c.name,
    }));

    return (
        <div className="mx-auto w-full max-w-[1600px] space-y-3 pt-0.5 pb-4">
            <Breadcrumb>
                <BreadcrumbList>
                    <BreadcrumbItem>
                        <BreadcrumbLink asChild>
                            <Link href="/app">Главная</Link>
                        </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbPage>Проекты</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>
            <h1 className="sr-only">Проекты</h1>
            <ProjectsScreen
                initialProjects={projects}
                counterparties={counterparties}
            />
        </div>
    );
}
