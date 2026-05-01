import * as React from 'react';

import { Badge } from '@/shared/ui/badge';
import { cn } from '@/lib/utils';

type DenseListTokenProps = Omit<React.ComponentProps<typeof Badge>, 'size'>;

function DenseListSurface({ className, ...props }: React.ComponentProps<'section'>) {
  return (
    <section
      className={cn('rounded-lg border bg-card p-3 text-card-foreground shadow-none', className)}
      {...props}
    />
  );
}

function DenseListHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      className={cn('mb-3 flex min-w-0 items-center justify-between gap-3', className)}
      {...props}
    />
  );
}

function DenseListViewport({ className, ...props }: React.ComponentProps<'div'>) {
  return <div className={cn('max-h-[430px] overflow-y-auto pr-0 sm:pr-1', className)} {...props} />;
}

function DenseListItem({ className, ...props }: React.ComponentProps<'article'>) {
  return (
    <article
      className={cn('overflow-hidden rounded-md border bg-card shadow-sm sm:rounded-lg', className)}
      {...props}
    />
  );
}

function DenseListRow({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      className={cn('flex items-center gap-1.5 px-2 py-2 sm:gap-2 sm:px-3 sm:py-2.5', className)}
      {...props}
    />
  );
}

function DenseListInlineContent({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      className={cn('flex min-w-0 flex-nowrap items-center gap-1.5 overflow-hidden sm:gap-2', className)}
      {...props}
    />
  );
}

function DenseListToken({ className, children, ...props }: DenseListTokenProps) {
  return (
    <Badge size="xs" className={cn('shrink-0 normal-case tracking-normal', className)} {...props}>
      {children}
    </Badge>
  );
}

export {
  DenseListHeader,
  DenseListInlineContent,
  DenseListItem,
  DenseListRow,
  DenseListSurface,
  DenseListToken,
  DenseListViewport,
};
