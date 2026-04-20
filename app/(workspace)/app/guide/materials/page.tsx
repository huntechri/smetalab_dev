import { getMaterials, getTeamForUser } from "@/lib/data/db/queries";
import { MaterialsScreen } from "@/features/materials";

export default async function MaterialsPage() {
    const [materials, team] = await Promise.all([
        getMaterials(50),
        getTeamForUser()
    ]);

    return (
        <MaterialsScreen
            initialData={materials}
            tenantId={team?.id || 1}
        />
    );
}

