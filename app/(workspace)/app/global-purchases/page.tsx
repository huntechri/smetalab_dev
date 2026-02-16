import { GlobalPurchasesScreen } from '@/features/global-purchases';
import { getTeamForUser } from '@/lib/data/db/queries';
import { getProjects } from '@/lib/data/projects/repo';
import { GlobalPurchasesService } from '@/lib/services/global-purchases.service';

export default async function GlobalPurchasesPage() {
    const team = await getTeamForUser();
    const projects = team?.id ? await getProjects(team.id) : [];
    const purchases = team?.id ? await GlobalPurchasesService.list(team.id) : null;

    return (
        <GlobalPurchasesScreen
            initialRows={purchases?.success ? purchases.data : []}
            projectOptions={projects.map((project) => ({ id: project.id, name: project.name }))}
        />
    );
}
