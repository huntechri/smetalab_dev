import { ProjectsScreen } from '@/features/projects';
import { getProjects } from '@/lib/data/projects/repo';
import { getTeamForUser, getCounterparties } from '@/lib/data/db/queries';
import { redirect } from 'next/navigation';
import { ProjectListItem, ProjectStatus } from '@/features/projects';

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
        <div className="mx-auto w-full max-w-[1600px] space-y-6">
            <header className="space-y-2">
                <h1 className="text-3xl font-semibold">Проекты</h1>
                <p className="text-sm text-muted-foreground">Компактный список проектов с быстрым поиском и сортировкой.</p>
            </header>
            <ProjectsScreen
                initialProjects={projects}
                counterparties={counterparties}
            />
        </div>
    );
}
