import { PatternsScreen } from '@/features/patterns';
import { getTeamForUser } from '@/lib/data/db/queries';
import { EstimatePatternsService } from '@/lib/services/estimate-patterns.service';

export default async function PatternsPage() {
  const team = await getTeamForUser();
  const patterns = team
    ? await EstimatePatternsService.list(team.id).then((result) => result.success ? result.data : [])
    : [];

  return <PatternsScreen initialItems={patterns} />;
}
