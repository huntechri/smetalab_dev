import * as React from 'react';

import { cn } from '@/lib/utils';

export const denseCardClassName =
  'overflow-hidden rounded-md border border-border bg-card shadow-[0_1px_2px_rgba(0,0,0,0.04)] sm:rounded-lg';

function DenseCard({ className, ...props }: React.ComponentProps<'article'>) {
  return <article className={cn(denseCardClassName, className)} {...props} />;
}

export { DenseCard };
