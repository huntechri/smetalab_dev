'use client';

import { notify } from '@/lib/infrastructure/notifications/notify';

export const useAppToast = () => {
  return {
    toast: ({ title, description, variant }: { title: string; description?: string; variant?: 'default' | 'destructive' }) => {
      notify({
        title,
        description,
        intent: variant === 'destructive' ? 'error' : 'success',
        channel: 'toast',
      });
    },
    dismiss: () => null,
  };
};
