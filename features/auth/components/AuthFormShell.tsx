import type { ReactNode } from 'react';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/ui/card';
import { cn } from '@/lib/utils';

type AuthFormShellProps = {
  title: string;
  description?: ReactNode;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
  align?: 'left' | 'center';
};

type AuthStatusMessageProps = {
  variant: 'error' | 'success' | 'warning';
  children: ReactNode;
  className?: string;
};

const authStatusClassNames: Record<AuthStatusMessageProps['variant'], string> = {
  error: 'border-destructive/30 bg-destructive/10 text-destructive',
  success: 'border-success/30 bg-success/10 text-success',
  warning: 'border-brand/30 bg-brand/10 text-brand',
};

export function AuthFormShell({
  title,
  description,
  children,
  className,
  contentClassName,
  align = 'left',
}: AuthFormShellProps) {
  const isCentered = align === 'center';

  return (
    <main className="mx-auto flex min-h-[100dvh] w-full max-w-md items-center px-4 py-8">
      <Card className={cn('w-full', className)}>
        <CardHeader className={cn(isCentered && 'items-center text-center')}>
          <CardTitle>{title}</CardTitle>
          {description ? (
            <CardDescription>{description}</CardDescription>
          ) : null}
        </CardHeader>
        <CardContent className={contentClassName}>{children}</CardContent>
      </Card>
    </main>
  );
}

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
