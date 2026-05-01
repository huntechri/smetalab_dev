import * as React from 'react';

import { cn } from '@/lib/utils';

function CompactCardSurface({
  className,
  ...props
}: React.ComponentProps<'section'>) {
  return (
    <section
      className={cn('rounded-lg border bg-card p-3 text-card-foreground shadow-none', className)}
      {...props}
    />
  );
}

function CompactCardHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      className={cn('mb-3 flex min-w-0 items-center justify-between gap-3', className)}
      {...props}
    />
  );
}

function CompactCardViewport({ className, ...props }: React.ComponentProps<'div'>) {
  return <div className={cn('max-h-[430px] overflow-y-auto pr-0 sm:pr-1', className)} {...props} />;
}

function CompactCardItem({ className, ...props }: React.ComponentProps<'article'>) {
  return (
    <article
      className={cn('overflow-hidden rounded-md border bg-card shadow-sm sm:rounded-lg', className)}
      {...props}
    />
  );
}

function CompactCardRow({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      className={cn('flex items-center gap-1.5 px-2 py-2 sm:gap-2 sm:px-3 sm:py-2.5', className)}
      {...props}
    />
  );
}

function CompactCardInlineContent({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      className={cn('flex min-w-0 flex-nowrap items-center gap-1.5 overflow-hidden sm:gap-2', className)}
      {...props}
    />
  );
}

export {
  CompactCardHeader,
  CompactCardInlineContent,
  CompactCardItem,
  CompactCardRow,
  CompactCardSurface,
  CompactCardViewport,
};
