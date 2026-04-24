import { describe, expect, it } from 'vitest';
import { getNotificationsSWRKey } from '@/features/notifications/components/notification-bell';

describe('getNotificationsSWRKey', () => {
  it('returns null when notifications popover is closed', () => {
    expect(getNotificationsSWRKey(false)).toBeNull();
  });

  it('returns notifications endpoint when notifications popover is open', () => {
    expect(getNotificationsSWRKey(true)).toBe('/api/notifications');
  });
});
