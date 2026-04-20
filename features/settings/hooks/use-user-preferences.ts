'use client';

import { useEffect, useState } from 'react';
import {
  defaultNotificationsPreferences,
  defaultUiPreferences,
  parseNotificationPreferences,
  parseUiPreferences,
  type NotificationsPreferences,
  type UiPreferences,
} from '@/features/settings/lib/preferences';

const UI_STORAGE_KEY = 'smetalab.ui.preferences';
const NOTIFICATIONS_STORAGE_KEY = 'smetalab.notifications.preferences';

export function useUserPreferences() {
  const [uiPreferences, setUiPreferences] = useState<UiPreferences>(defaultUiPreferences);
  const [notificationPreferences, setNotificationPreferences] = useState<NotificationsPreferences>(defaultNotificationsPreferences);

  useEffect(() => {
    setUiPreferences(parseUiPreferences(window.localStorage.getItem(UI_STORAGE_KEY)));
    setNotificationPreferences(parseNotificationPreferences(window.localStorage.getItem(NOTIFICATIONS_STORAGE_KEY)));
  }, []);

  useEffect(() => {
    window.localStorage.setItem(UI_STORAGE_KEY, JSON.stringify(uiPreferences));
  }, [uiPreferences]);

  useEffect(() => {
    window.localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(notificationPreferences));
  }, [notificationPreferences]);

  return {
    uiPreferences,
    setUiPreferences,
    notificationPreferences,
    setNotificationPreferences,
  };
}
