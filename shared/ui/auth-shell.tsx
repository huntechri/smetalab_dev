import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

// ─── AuthShell ────────────────────────────────────────────────────────────

/**
 * AuthShell — корневая обёртка для страниц авторизации.
 * Центрирует контент, задаёт фон, сбрасывает скролл.
 */
type AuthShellProps = {
  children: ReactNode;
  className?: string;
};

export function AuthShell({ children, className }: AuthShellProps) {
  return (
    <main
      className={cn(
        'mx-auto flex min-h-dvh w-full max-w-md items-center justify-center px-4 py-8',
        className
      )}
    >
      {children}
    </main>
  );
}

// ─── AuthPanel ────────────────────────────────────────────────────────────

/**
 * AuthPanel — карточка с формой авторизации.
 * Белый фон, тень, rounded-lg, padding.
 */
type AuthPanelProps = {
  children: ReactNode;
  className?: string;
};

export function AuthPanel({ children, className }: AuthPanelProps) {
  return (
    <div
      className={cn(
        'w-full rounded-lg bg-card p-6 shadow-sm',
        className
      )}
    >
      {children}
    </div>
  );
}

// ─── AuthFeatureCard ──────────────────────────────────────────────────────

/**
 * AuthFeatureCard — карточка с фичей на странице авторизации.
 */
type AuthFeatureCardProps = {
  label: string;
  children: ReactNode;
  className?: string;
};

export function AuthFeatureCard({
  label,
  children,
  className,
}: AuthFeatureCardProps) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-border/20 bg-background/30 p-4',
        className
      )}
    >
      <p className="text-xs uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="mt-2 font-semibold">{children}</p>
    </div>
  );
}

// ─── AuthStatusMessage ────────────────────────────────────────────────────

/**
 * AuthStatusMessage — сообщение об ошибке / успехе / предупреждении.
 */
type AuthStatusMessageProps = {
  variant: 'error' | 'success' | 'warning';
  children: ReactNode;
  className?: string;
};

const authStatusClassNames: Record<AuthStatusMessageProps['variant'], string> =
  {
    error: 'border-destructive/30 bg-destructive/10 text-destructive',
    success: 'border-success/30 bg-success/10 text-success',
    warning: 'border-brand/30 bg-brand/10 text-brand',
  } as const;

export function AuthStatusMessage({
  variant,
  children,
  className,
}: AuthStatusMessageProps) {
  return (
    <p
      className={cn(
        'rounded-xl border px-3 py-2 text-sm',
        authStatusClassNames[variant],
        className
      )}
      role={variant === 'error' ? 'alert' : 'status'}
      aria-live="polite"
    >
      {children}
    </p>
  );
}
