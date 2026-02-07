import { getWorks, getWorksCount, getTeamForUser } from "@/lib/db/queries";
import { WorksClient } from "./works-client";

export default async function WorksPage() {
    const [works, totalCount, team] = await Promise.all([
        getWorks(50),
        getWorksCount(),
        getTeamForUser()
    ]);

    return (
        <WorksClient
            initialData={works}
            totalCount={totalCount}
            tenantId={team?.id || 1}
        />
    );
}
