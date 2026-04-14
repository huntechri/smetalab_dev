import { getWorks, getTeamForUser } from "@/lib/data/db/queries";
import { WorksScreen } from "@/features/works";

export default async function WorksPage() {
    const [works, team] = await Promise.all([
        getWorks(50),
        getTeamForUser()
    ]);

    return (
        <WorksScreen
            initialData={works}
            tenantId={team?.id || 1}
        />
    );
}
