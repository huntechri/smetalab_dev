import * as React from 'react';

import { cn } from '@/lib/utils';

export type PageShellDensity = 'compact' | 'default' | 'comfortable';

const pageShellClassName: Record<PageShellDensity, string> = {
  compact: 'space-y-2',
  default: 'space-y-3',
  comfortable: 'space-y-4',
};

export interface PageShellProps extends React.ComponentPropsWithoutRef<'div'> {
  density?: PageShellDensity;
}

export function PageShell({ density = 'default', className, ...props }: PageShellProps) {
  return <div data-slot="page-shell" className={cn(pageShellClassName[density], className)} {...props} />;
}
