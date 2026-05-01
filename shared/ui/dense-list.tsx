import * as React from 'react';

import { Badge } from '@/shared/ui/badge';
import { cn } from '@/lib/utils';

type DenseListTokenProps = Omit<React.ComponentProps<typeof Badge>, 'size'>;
type DenseListMetricPillTone = 'neutral' | 'info';
type DenseListMetricPillDensity = 'work' | 'material';

type DenseListMetricPillProps = React.ComponentProps<'div'> & {
  tone?: DenseListMetricPillTone;
  density?: DenseListMetricPillDensity;
};

type DenseListStatProps = React.ComponentProps<'div'> & {
  label: string;
  valueTone?: 'default' | 'success';
};

const denseListMetricPillToneClassName: Record<DenseListMetricPillTone, string> = {
  neutral: 'border-border bg-muted text-muted-foreground',
  info: 'border-info/30 bg-info/10 text-info',
};

const denseListMetricPillDensityClassName: Record<DenseListMetricPillDensity, string> = {
  work: 'gap-1 px-1.5 sm:px-2',
  material: 'gap-0.5 px-1 sm:px-1.5',
};

const denseListStatValueClassName: Record<NonNullable<DenseListStatProps['valueTone']>, string> = {
  default: 'text-foreground',
  success: 'text-success',
};

export const denseListActionIconClassName = 'size-6 sm:size-7';
export const denseListMaterialCardClassName = 'rounded-lg border bg-card p-1 sm:p-1.5 shadow-sm';

const denseListInlineNumberBaseClassName =
  'h-4 min-w-0 flex-none rounded-sm border-0 bg-transparent px-1 py-0 text-right font-semibold leading-none text-foreground !border-0 !shadow-none outline-none focus-visible:!ring-0 focus-visible:!ring-offset-0';
export const denseListWorkNumberClassName = `${denseListInlineNumberBaseClassName} w-10 text-xs sm:w-14`;
export const denseListMaterialQtyClassName = `${denseListInlineNumberBaseClassName} w-8 text-xs sm:w-10`;
export const denseListMaterialExpenseClassName = `${denseListInlineNumberBaseClassName} w-8 text-xs sm:w-9`;

const denseListInlineTextBaseClassName =
  'min-w-0 rounded-sm border-0 bg-transparent !border-0 !shadow-none outline-none focus-visible:!ring-0 focus-visible:!ring-offset-0';
export const denseListWorkNameClassName = `${denseListInlineTextBaseClassName} min-h-9 max-w-[48rem] flex-1 !whitespace-normal !justify-start break-words px-1 text-left text-xs font-semibold leading-tight text-foreground sm:min-h-10 sm:min-w-[8rem] xl:min-w-[18rem]`;
export const denseListMaterialNameClassName = `${denseListInlineTextBaseClassName} min-h-9 w-full !whitespace-normal !justify-start break-words px-0 text-left text-xs font-semibold leading-tight text-foreground sm:min-h-10`;

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

function DenseListBodyRow({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      className={cn('flex items-start gap-1.5 px-2 py-2.5 sm:gap-2 sm:px-3.5 sm:py-3', className)}
      {...props}
    />
  );
}

function DenseListNestedPanel({ className, ...props }: React.ComponentProps<'div'>) {
  return <div className={cn('border-t bg-muted/50 px-2 py-2.5 sm:px-3.5 sm:py-3', className)} {...props} />;
}

function DenseListEmptyInset({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      className={cn('rounded-md border border-dashed bg-card p-3 text-center text-xs text-muted-foreground', className)}
      {...props}
    />
  );
}

function DenseListActionsGrid({ className, ...props }: React.ComponentProps<'div'>) {
  return <div className={cn('mt-3 grid grid-cols-3 gap-1.5 sm:mt-4 sm:max-w-[400px] sm:gap-2', className)} {...props} />;
}

function DenseListStat({
  label,
  valueTone = 'default',
  className,
  children,
  ...props
}: DenseListStatProps) {
  return (
    <div className={cn('text-right min-w-[60px] sm:min-w-[80px]', className)} {...props}>
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className={cn('text-sm font-bold tabular-nums', denseListStatValueClassName[valueTone])}>
        {children}
      </p>
    </div>
  );
}

function DenseListMetricPill({
  children,
  tone = 'neutral',
  density = 'work',
  className,
  ...props
}: DenseListMetricPillProps) {
  return (
    <div
      className={cn(
        'inline-flex h-4 items-center rounded-full border py-0 text-xs sm:h-5',
        denseListMetricPillToneClassName[tone],
        denseListMetricPillDensityClassName[density],
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

function DenseListMaterialGrid({ className, ...props }: React.ComponentProps<'div'>) {
  return <div className={cn('grid gap-2 md:grid-cols-2 xl:grid-cols-3', className)} {...props} />;
}

function DenseListMaterialRow({ className, ...props }: React.ComponentProps<'div'>) {
  return <div className={cn('grid grid-cols-[minmax(0,1fr)_auto] gap-1.5 sm:gap-2', className)} {...props} />;
}

function DenseListMaterialMeta({ className, ...props }: React.ComponentProps<'div'>) {
  return <div className={cn('mt-1 flex flex-wrap items-center gap-x-2 gap-y-1.5 text-xs text-muted-foreground sm:mt-0.5', className)} {...props} />;
}

function DenseListMaterialImageFrame({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      className={cn('flex h-6 w-6 shrink-0 items-center justify-center overflow-hidden rounded-lg border bg-muted sm:h-7 sm:w-7', className)}
      {...props}
    />
  );
}

function DenseListTrailingAction({ className, ...props }: React.ComponentProps<'div'>) {
  return <div className={cn('flex shrink-0 items-start pt-0.5', className)} {...props} />;
}

export {
  DenseListActionsGrid,
  DenseListBodyRow,
  DenseListEmptyInset,
  DenseListHeader,
  DenseListInlineContent,
  DenseListItem,
  DenseListMaterialGrid,
  DenseListMaterialImageFrame,
  DenseListMaterialMeta,
  DenseListMaterialRow,
  DenseListMetricPill,
  DenseListNestedPanel,
  DenseListRow,
  DenseListStat,
  DenseListSurface,
  DenseListToken,
  DenseListTrailingAction,
  DenseListViewport,
};
