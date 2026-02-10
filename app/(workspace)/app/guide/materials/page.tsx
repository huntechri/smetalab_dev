import { getMaterials, getMaterialsCount, getTeamForUser } from "@/lib/data/db/queries";
import { MaterialsScreen } from "@/features/materials";

export default async function MaterialsPage() {
    const [materials, totalCount, team] = await Promise.all([
        getMaterials(50),
        getMaterialsCount(),
        getTeamForUser()
    ]);

    return (
        <MaterialsScreen
            initialData={materials}
            totalCount={totalCount}
            tenantId={team?.id || 1}
        />
    );
}

