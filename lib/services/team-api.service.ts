import { getTeamForUser } from '@/lib/data/db/queries';

export class TeamApiService {
  static async getCurrentTeam() {
    return getTeamForUser();
  }
}
