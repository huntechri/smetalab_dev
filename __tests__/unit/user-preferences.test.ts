import { describe, expect, it } from 'vitest';
import {
  defaultNotificationsPreferences,
  defaultUiPreferences,
  parseNotificationPreferences,
  parseUiPreferences,
} from '@/features/settings/lib/preferences';

describe('user preferences parsing', () => {
  it('returns defaults for malformed payloads', () => {
    expect(parseUiPreferences('{broken-json')).toEqual(defaultUiPreferences);
    expect(parseNotificationPreferences('{broken-json')).toEqual(defaultNotificationsPreferences);
  });

  it('returns defaults when payload shape is invalid', () => {
    expect(parseUiPreferences(JSON.stringify({ theme: 'rainbow' }))).toEqual(defaultUiPreferences);
    expect(parseNotificationPreferences(JSON.stringify({ email: 'yes' }))).toEqual(defaultNotificationsPreferences);
  });

  it('parses valid payloads', () => {
    expect(
      parseUiPreferences(
        JSON.stringify({
          theme: 'dark',
          density: 'compact',
          confirmDangerousActions: false,
        }),
      ),
    ).toEqual({
      theme: 'dark',
      density: 'compact',
      confirmDangerousActions: false,
    });

    expect(
      parseNotificationPreferences(
        JSON.stringify({
          inApp: false,
          email: true,
          estimateChanges: false,
          projectAssignments: true,
          commentsMentions: false,
          deadlines: true,
        }),
      ),
    ).toEqual({
      inApp: false,
      email: true,
      estimateChanges: false,
      projectAssignments: true,
      commentsMentions: false,
      deadlines: true,
    });
  });
});
