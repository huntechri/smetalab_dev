import { getTeamForUser } from '@/lib/data/db/queries';

export async function GET() {
  const team = await getTeamForUser(true);
  return Response.json(team);
}
