import * as React from 'react';

import { cn } from '@/lib/utils';

type FilterBarVariant = 'surface' | 'inline';
type FilterBarDensity = 'compact' | 'default';
type FilterBarScrollMode = 'none' | 'horizontal';

const filterBarVariantClassName: Record<FilterBarVariant, string> = {
  surface: 'border-b bg-background/50 backdrop-blur-sm sticky top-0 z-10',
  inline: 'border-b bg-background/50 backdrop-blur-sm',
};

const filterBarDensityClassName: Record<FilterBarDensity, string> = {
  compact: 'p-1.5',
  default: 'p-2',
};

const filterBarScrollClassName: Record<FilterBarScrollMode, string> = {
  none: 'flex flex-wrap items-center gap-2',
  horizontal: 'flex w-full items-center gap-1.5 overflow-x-auto no-scrollbar',
};

type FilterBarProps = React.ComponentProps<'div'> & {
  variant?: FilterBarVariant;
  density?: FilterBarDensity;
};

type FilterBarViewportProps = React.ComponentProps<'div'> & {
  scroll?: FilterBarScrollMode;
  dragging?: boolean;
  density?: FilterBarDensity;
};

function FilterBar({
  variant = 'surface',
  density = 'default',
  className,
  ...props
}: FilterBarProps) {
  return (
    <div
      className={cn(
        filterBarVariantClassName[variant],
        filterBarDensityClassName[density],
        className,
      )}
      {...props}
    />
  );
}

const FilterBarViewport = React.forwardRef<HTMLDivElement, FilterBarViewportProps>(
  function FilterBarViewport(
    {
      scroll = 'horizontal',
      dragging,
      density = 'default',
      className,
      ...props
    },
    ref,
  ) {
    return (
      <div
        ref={ref}
        className={cn(
          filterBarScrollClassName[scroll],
          'select-none',
          density === 'default' && 'px-4',
          density === 'compact' && 'px-2',
          scroll === 'horizontal' &&
            (dragging ? 'cursor-grabbing' : 'cursor-grab'),
          className,
        )}
        {...props}
      />
    );
  },
);
FilterBarViewport.displayName = 'FilterBarViewport';

function FilterBarSkeleton({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  return (
    <div
      className={cn(
        'border-b flex gap-2 overflow-hidden px-4 py-2',
        className,
      )}
      {...props}
    >
      {[1, 2, 3, 4].map((item) => (
        <div
          key={item}
          className="h-7 w-20 shrink-0 rounded-full bg-muted animate-pulse"
        />
      ))}
    </div>
  );
}

export { FilterBar, FilterBarSkeleton, FilterBarViewport };
export type { FilterBarDensity, FilterBarProps, FilterBarViewportProps };
