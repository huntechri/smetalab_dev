import { GlobalPurchasesScreen } from '@/features/global-purchases';
import { getTeamForUser } from '@/lib/data/db/queries';
import { getProjects } from '@/lib/data/projects/repo';

export default async function GlobalPurchasesPage() {
    const team = await getTeamForUser();
    const projects = team?.id ? await getProjects(team.id) : [];

    return (
        <GlobalPurchasesScreen
            initialRows={[]}
            projectOptions={projects.map((project) => ({ id: project.id, name: project.name }))}
        />
    );
}
