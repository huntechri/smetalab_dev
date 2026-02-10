'use client';

import { notify } from '@/lib/notifications/notify';

export const useToast = () => {
  return {
    toast: ({ title, description, variant }: { title: string, description?: string, variant?: 'default' | 'destructive' }) => {
      notify({
        title,
        description,
        intent: variant === 'destructive' ? 'error' : 'success',
        channel: 'toast',
      });
    },
    dismiss: () => null
  };
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
