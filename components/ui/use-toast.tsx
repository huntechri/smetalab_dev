'use client';
import { toast as sonnerToast } from "sonner"

export const useToast = () => {
  return {
    toast: ({ title, description, variant }: { title: string, description?: string, variant?: 'default' | 'destructive' }) => {
      if (variant === 'destructive') {
        sonnerToast.error(title, { description })
      } else {
        sonnerToast.success(title, { description })
      }
    },
    dismiss: () => null
  }
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
