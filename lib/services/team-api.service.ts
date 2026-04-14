import { getTeamForUserWithMembers } from '@/lib/data/db/queries';

export class TeamApiService {
  static async getCurrentTeam() {
    return getTeamForUserWithMembers();
  }
}
