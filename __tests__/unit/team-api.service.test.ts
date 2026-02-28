import { beforeEach, describe, expect, it, vi } from 'vitest';
import { TeamApiService } from '@/lib/services/team-api.service';
import { getTeamForUser } from '@/lib/data/db/queries';

vi.mock('@/lib/data/db/queries', () => ({
  getTeamForUser: vi.fn(),
}));

describe('TeamApiService', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('returns current user team from query layer', async () => {
    const team = { id: 11, name: 'Demo Team' };
    vi.mocked(getTeamForUser).mockResolvedValue(team as Awaited<ReturnType<typeof getTeamForUser>>);

    await expect(TeamApiService.getCurrentTeam()).resolves.toEqual(team);
  });
});
