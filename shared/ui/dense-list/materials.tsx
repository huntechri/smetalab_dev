import * as React from 'react';

import { cn } from '@/lib/utils';

export const denseListMaterialCardClassName = 'rounded-lg border bg-card p-1 sm:p-1.5 shadow-sm';

function DenseListMaterialGrid({ className, ...props }: React.ComponentProps<'div'>) {
  return <div className={cn('grid gap-2 md:grid-cols-2 xl:grid-cols-3', className)} {...props} />;
}

function DenseListMaterialRow({ className, ...props }: React.ComponentProps<'div'>) {
  return <div className={cn('grid grid-cols-[minmax(0,1fr)_auto] gap-1.5 sm:gap-2', className)} {...props} />;
}

function DenseListMaterialMeta({ className, ...props }: React.ComponentProps<'div'>) {
  return <div className={cn('mt-1 flex flex-wrap items-center gap-x-2 gap-y-1.5 text-sm text-muted-foreground sm:mt-0.5', className)} {...props} />;
}

function DenseListMaterialImageFrame({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      className={cn('flex h-6 w-6 shrink-0 items-center justify-center overflow-hidden rounded-lg border bg-muted sm:h-7 sm:w-7', className)}
      {...props}
    />
  );
}

export {
  DenseListMaterialGrid,
  DenseListMaterialImageFrame,
  DenseListMaterialMeta,
  DenseListMaterialRow,
};
