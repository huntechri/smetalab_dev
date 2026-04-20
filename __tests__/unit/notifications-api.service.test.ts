import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NotificationsApiService } from '@/lib/services/notifications-api.service';

const chain = {
  from: vi.fn(),
  where: vi.fn(),
  orderBy: vi.fn(),
  limit: vi.fn(),
};

vi.mock('@/lib/data/db/drizzle', () => ({
  db: {
    select: vi.fn(() => chain),
  },
}));

describe('NotificationsApiService', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    chain.from.mockReturnValue(chain);
    chain.where.mockReturnValue(chain);
    chain.orderBy.mockReturnValue(chain);
    chain.limit.mockResolvedValue([{ id: 1, title: 'n1' }]);
  });

  it('builds notifications query for user with default limit', async () => {
    const result = await NotificationsApiService.listForUser(42);

    expect(chain.from).toHaveBeenCalledTimes(1);
    expect(chain.where).toHaveBeenCalledTimes(1);
    expect(chain.orderBy).toHaveBeenCalledTimes(1);
    expect(chain.limit).toHaveBeenCalledWith(50);
    expect(result).toEqual([{ id: 1, title: 'n1' }]);
  });

  it('supports custom limit', async () => {
    await NotificationsApiService.listForUser(42, 10);
    expect(chain.limit).toHaveBeenCalledWith(10);
  });
});
