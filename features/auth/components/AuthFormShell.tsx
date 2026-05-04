import type { ReactNode } from 'react';

import { AuthShell, AuthStatusMessage } from '@/shared/ui/auth-shell';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/ui/card';
import { cn } from '@/lib/utils';

/**
 * Auth visual ownership note:
 * this shell is the current auth-only form visual contract. It is intentionally
 * separate from authenticated runtime app shells and must not be normalized by
 * changing auth actions, redirects, validation, sessions, email verification, or
 * password-reset behavior.
 *
 * Uses shared AuthShell for the outer page wrapper and AuthStatusMessage for
 * feedback to consumers.
 */

type AuthFormShellProps = {
  title: string;
  description?: ReactNode;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
  align?: 'left' | 'center';
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
    <AuthShell>
      <Card className={cn('w-full', className)}>
        <CardHeader className={cn(isCentered && 'items-center text-center')}>
          <CardTitle>{title}</CardTitle>
          {description ? (
            <CardDescription>{description}</CardDescription>
          ) : null}
        </CardHeader>
        <CardContent className={contentClassName}>{children}</CardContent>
      </Card>
    </AuthShell>
  );
}

export { AuthStatusMessage };
