import { getMaterials, getMaterialsCount, getTeamForUser } from "@/lib/data/db/queries";
import { MaterialsClient } from "./materials-client";

export default async function MaterialsPage() {
    const [materials, totalCount, team] = await Promise.all([
        getMaterials(50),
        getMaterialsCount(),
        getTeamForUser()
    ]);

    return (
        <MaterialsClient
            initialData={materials}
            totalCount={totalCount}
            tenantId={team?.id || 1}
        />
    );
}

