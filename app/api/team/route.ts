import { TeamApiService } from '@/lib/services/team-api.service';

export async function GET() {
  const team = await TeamApiService.getCurrentTeam();
  return Response.json(team);
}
