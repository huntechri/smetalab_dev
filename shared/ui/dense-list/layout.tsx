import * as React from 'react';

import { cn } from '@/lib/utils';

type DenseListViewportSize = 'default' | 'large';

type DenseListViewportProps = React.ComponentProps<'div'> & {
  size?: DenseListViewportSize;
};

const denseListViewportSizeClassName: Record<DenseListViewportSize, string> = {
  default: 'max-h-[430px] overflow-y-auto pr-0 sm:pr-1',
  large: 'max-h-[625px] overflow-y-auto px-1.5 pb-1.5 sm:px-3 sm:pb-3',
};

function DenseListSurface({ className, ...props }: React.ComponentProps<'section'>) {
  return (
    <section
      className={cn('rounded-lg border bg-card p-3 text-card-foreground shadow-none', className)}
      {...props}
    />
  );
}

function DenseListPanel({ className, ...props }: React.ComponentProps<'section'>) {
  return (
    <section
      className={cn('flex flex-col rounded-lg border bg-card text-card-foreground shadow-none', className)}
      {...props}
    />
  );
}

function DenseListToolbarInset({ className, ...props }: React.ComponentProps<'div'>) {
  return <div className={cn('p-1.5 pb-0 sm:p-2', className)} {...props} />;
}

function DenseListContentInset({ className, ...props }: React.ComponentProps<'div'>) {
  return <div className={cn('pt-1.5 sm:pt-2', className)} {...props} />;
}

function DenseListHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      className={cn('mb-3 flex min-w-0 items-center justify-between gap-3', className)}
      {...props}
    />
  );
}

function DenseListViewport({ size = 'default', className, ...props }: DenseListViewportProps) {
  return <div className={cn(denseListViewportSizeClassName[size], className)} {...props} />;
}

function DenseListStack({ className, ...props }: React.ComponentProps<'div'>) {
  return <div className={cn('space-y-2', className)} {...props} />;
}

function DenseListEmptyBlock({ className, ...props }: React.ComponentProps<'div'>) {
  return <div className={cn('px-3 py-8', className)} {...props} />;
}

function DenseListEmptyInset({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      className={cn('rounded-md border border-dashed bg-card p-3 text-center text-xs text-muted-foreground', className)}
      {...props}
    />
  );
}

export {
  DenseListContentInset,
  DenseListEmptyBlock,
  DenseListEmptyInset,
  DenseListHeader,
  DenseListPanel,
  DenseListStack,
  DenseListSurface,
  DenseListToolbarInset,
  DenseListViewport,
};
