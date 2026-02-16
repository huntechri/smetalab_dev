import { GlobalPurchasesScreen } from '@/features/global-purchases';
import { getTeamForUser } from '@/lib/data/db/queries';
import { getProjects } from '@/lib/data/projects/repo';
import { GlobalPurchasesService } from '@/lib/services/global-purchases.service';

export default async function GlobalPurchasesPage() {
    const team = await getTeamForUser();
    const today = new Date().toISOString().slice(0, 10);
    const projects = team?.id ? await getProjects(team.id) : [];
    const purchases = team?.id ? await GlobalPurchasesService.list(team.id, { from: today, to: today }) : null;

    return (
        <GlobalPurchasesScreen
            initialRows={purchases?.success ? purchases.data : []}
            initialRange={{ from: today, to: today }}
            projectOptions={projects.map((project) => ({ id: project.id, name: project.name }))}
        />
    );
}
