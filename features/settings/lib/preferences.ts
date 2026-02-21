import { z } from 'zod';

export const uiPreferencesSchema = z.object({
  theme: z.enum(['light', 'dark', 'system']).default('system'),
  density: z.enum(['comfortable', 'compact']).default('comfortable'),
  confirmDangerousActions: z.boolean().default(true),
});

export const notificationsPreferencesSchema = z.object({
  inApp: z.boolean().default(true),
  email: z.boolean().default(true),
  estimateChanges: z.boolean().default(true),
  projectAssignments: z.boolean().default(true),
  commentsMentions: z.boolean().default(true),
  deadlines: z.boolean().default(true),
});

export type UiPreferences = z.infer<typeof uiPreferencesSchema>;
export type NotificationsPreferences = z.infer<typeof notificationsPreferencesSchema>;

export const defaultUiPreferences: UiPreferences = uiPreferencesSchema.parse({});
export const defaultNotificationsPreferences: NotificationsPreferences = notificationsPreferencesSchema.parse({});

function parseJsonValue(value: string | null): unknown {
  if (!value) {
    return {};
  }

  try {
    return JSON.parse(value) as unknown;
  } catch {
    return {};
  }
}

export function parseUiPreferences(value: string | null): UiPreferences {
  const parsedValue = parseJsonValue(value);
  const result = uiPreferencesSchema.safeParse(parsedValue);
  return result.success ? result.data : defaultUiPreferences;
}

export function parseNotificationPreferences(value: string | null): NotificationsPreferences {
  const parsedValue = parseJsonValue(value);
  const result = notificationsPreferencesSchema.safeParse(parsedValue);
  return result.success ? result.data : defaultNotificationsPreferences;
}
