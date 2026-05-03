import * as React from 'react';

import { cn } from '@/lib/utils';

type DenseListMetaFieldAlign = 'start' | 'end';

type DenseListMetaFieldProps = React.ComponentProps<'div'> & {
  label: string;
  align?: DenseListMetaFieldAlign;
};

const denseListMetaFieldLabelClassName: Record<DenseListMetaFieldAlign, string> = {
  start: 'mb-1 text-[9px] font-bold uppercase tracking-[0.08em] text-muted-foreground',
  end: 'mb-1 text-[9px] font-bold uppercase tracking-[0.08em] text-muted-foreground lg:text-right',
};

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

function DenseListRecordGrid({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      className={cn(
        'grid grid-cols-1 gap-2.5 p-2 sm:p-2.5 lg:grid-cols-[92px_minmax(0,1fr)_minmax(300px,auto)_minmax(150px,220px)_auto] lg:items-center lg:gap-3',
        className,
      )}
      {...props}
    />
  );
}

function DenseListMetaField({ label, align = 'start', className, children, ...props }: DenseListMetaFieldProps) {
  return (
    <div className={cn('min-w-0', className)} {...props}>
      <p className={denseListMetaFieldLabelClassName[align]}>{label}</p>
      {children}
    </div>
  );
}

function DenseListPrimaryCell({ className, ...props }: React.ComponentProps<'div'>) {
  return <div className={cn('min-w-0 space-y-1.5', className)} {...props} />;
}

function DenseListInlineStart({ className, ...props }: React.ComponentProps<'div'>) {
  return <div className={cn('flex min-w-0 items-start gap-1.5', className)} {...props} />;
}

function DenseListWrap({ className, ...props }: React.ComponentProps<'div'>) {
  return <div className={cn('flex flex-wrap items-center gap-1.5', className)} {...props} />;
}

function DenseListMetricGroup({ className, ...props }: React.ComponentProps<'div'>) {
  return <div className={cn('flex flex-wrap items-center gap-1.5 lg:justify-end', className)} {...props} />;
}

function DenseListTrailingActions({ className, ...props }: React.ComponentProps<'div'>) {
  return <div className={cn('flex items-start justify-end lg:items-center', className)} {...props} />;
}

function DenseListInlineContent({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      className={cn('flex min-w-0 flex-nowrap items-center gap-1.5 overflow-hidden sm:gap-2', className)}
      {...props}
    />
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

function DenseListActionsGrid({ className, ...props }: React.ComponentProps<'div'>) {
  return <div className={cn('mt-3 grid grid-cols-3 gap-1.5 sm:mt-4 sm:max-w-[400px] sm:gap-2', className)} {...props} />;
}

function DenseListTrailingAction({ className, ...props }: React.ComponentProps<'div'>) {
  return <div className={cn('flex shrink-0 items-start pt-0.5', className)} {...props} />;
}

export {
  DenseListActionsGrid,
  DenseListBodyRow,
  DenseListInlineContent,
  DenseListInlineStart,
  DenseListItem,
  DenseListMetaField,
  DenseListMetricGroup,
  DenseListNestedPanel,
  DenseListPrimaryCell,
  DenseListRecordGrid,
  DenseListRow,
  DenseListTrailingAction,
  DenseListTrailingActions,
  DenseListWrap,
};
