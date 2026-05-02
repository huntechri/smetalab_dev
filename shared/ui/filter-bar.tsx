import * as React from 'react';

import { cn } from '@/lib/utils';

type FilterBarVariant = 'surface' | 'inline';
type FilterBarScrollMode = 'none' | 'horizontal';

const filterBarVariantClassName: Record<FilterBarVariant, string> = {
  surface: 'border-b bg-background/50 backdrop-blur-sm sticky top-0 z-10',
  inline: 'border-b bg-background/50 backdrop-blur-sm',
};

const filterBarScrollClassName: Record<FilterBarScrollMode, string> = {
  none: 'flex flex-wrap items-center gap-2',
  horizontal: 'flex w-full items-center gap-1.5 overflow-x-auto no-scrollbar',
};

type FilterBarProps = React.ComponentProps<'div'> & {
  variant?: FilterBarVariant;
};

type FilterBarViewportProps = React.ComponentProps<'div'> & {
  scroll?: FilterBarScrollMode;
  dragging?: boolean;
};

function FilterBar({ variant = 'surface', className, ...props }: FilterBarProps) {
  return <div className={cn(filterBarVariantClassName[variant], className)} {...props} />;
}

function FilterBarViewport({
  scroll = 'horizontal',
  dragging,
  className,
  ...props
}: FilterBarViewportProps) {
  return (
    <div
      className={cn(
        filterBarScrollClassName[scroll],
        'p-2 px-4 select-none',
        scroll === 'horizontal' && (dragging ? 'cursor-grabbing' : 'cursor-grab'),
        className,
      )}
      {...props}
    />
  );
}

function FilterBarSkeleton({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div className={cn('px-4 py-2 border-b flex gap-2 overflow-hidden', className)} {...props}>
      {[1, 2, 3, 4].map((item) => (
        <div key={item} className="h-7 w-20 bg-muted animate-pulse rounded-full shrink-0" />
      ))}
    </div>
  );
}

export { FilterBar, FilterBarSkeleton, FilterBarViewport };
export type { FilterBarProps, FilterBarViewportProps };
