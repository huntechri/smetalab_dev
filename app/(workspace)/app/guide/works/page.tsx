import { getWorks, getWorksCount, getTeamForUser } from "@/lib/data/db/queries";
import { WorksScreen } from "@/features/works";

export default async function WorksPage() {
    const [works, totalCount, team] = await Promise.all([
        getWorks(50),
        getWorksCount(),
        getTeamForUser()
    ]);

    return (
        <WorksScreen
            initialData={works}
            totalCount={totalCount}
            tenantId={team?.id || 1}
        />
    );
}
