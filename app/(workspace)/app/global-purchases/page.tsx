export const dynamic = 'force-dynamic';
import { GlobalPurchasesScreen } from '@/features/global-purchases';
import { getMaterialSuppliers, getTeamForUser } from '@/lib/data/db/queries';
import { getProjects } from '@/lib/data/projects/repo';
import { GlobalPurchasesService } from '@/lib/services/global-purchases.service';
import { getTodayIsoLocal } from '@/features/global-purchases/lib/date';

export default async function GlobalPurchasesPage() {
  const team = await getTeamForUser();
  const today = getTodayIsoLocal();

  const [projects, purchases, suppliers] = await Promise.all([
    team?.id ? getProjects(team.id) : Promise.resolve([]),
    team?.id ? GlobalPurchasesService.list(team.id, { from: today, to: today }) : Promise.resolve(null),
    team?.id ? getMaterialSuppliers(team.id, { limit: 500, offset: 0 }) : Promise.resolve({ data: [], count: 0 }),
  ]);

  return (
    <GlobalPurchasesScreen
      initialRows={purchases?.success ? purchases.data : []}
      initialRange={{ from: today, to: today }}
      projectOptions={projects.map((project) => ({ id: project.id, name: project.name }))}
      supplierOptions={suppliers.data.map((supplier) => ({
        id: supplier.id,
        name: supplier.name,
        color: supplier.color,
      }))}
    />
  );
}
