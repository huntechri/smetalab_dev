import * as React from 'react';

import { Badge } from '@/shared/ui/badge';
import { Button, type ButtonProps } from '@/shared/ui/button';
import { cn } from '@/lib/utils';

type DenseListTokenProps = Omit<React.ComponentProps<typeof Badge>, 'size'>;
type DenseListMetricPillTone = 'neutral' | 'info' | 'success';
type DenseListMetricPillDensity = 'work' | 'material';
type DenseListViewportSize = 'default' | 'large';
type DenseListMetaFieldAlign = 'start' | 'end';
type DenseListPickerButtonMaxWidth = 'default' | 'project';

type DenseListMetricPillProps = React.ComponentProps<'div'> & {
  tone?: DenseListMetricPillTone;
  density?: DenseListMetricPillDensity;
};

type DenseListLabeledMetricProps = Omit<DenseListMetricPillProps, 'children'> & {
  label: string;
  value: React.ReactNode;
};

type DenseListInlineMetricProps = React.ComponentProps<'div'> & {
  label: string;
};

type DenseListStatProps = React.ComponentProps<'div'> & {
  label: string;
  valueTone?: 'default' | 'success';
};

type DenseListViewportProps = React.ComponentProps<'div'> & {
  size?: DenseListViewportSize;
};

type DenseListMetaFieldProps = React.ComponentProps<'div'> & {
  label: string;
  align?: DenseListMetaFieldAlign;
};

type DenseListPickerButtonProps = ButtonProps & {
  maxWidth?: DenseListPickerButtonMaxWidth;
};

type DenseListColorIndicatorProps = Omit<React.ComponentProps<'span'>, 'color'> & {
  color?: string | null;
};

const denseListMetricPillToneClassName: Record<DenseListMetricPillTone, string> = {
  neutral: 'border-border bg-muted text-muted-foreground',
  info: 'border-info/30 bg-info/10 text-info',
  success: 'border-success/30 bg-success/10 text-success',
};

const denseListMetricPillDensityClassName: Record<DenseListMetricPillDensity, string> = {
  work: 'gap-1 px-1.5 sm:px-2',
  material: 'gap-0.5 px-1 sm:px-1.5',
};

const denseListStatValueClassName: Record<NonNullable<DenseListStatProps['valueTone']>, string> = {
  default: 'text-foreground',
  success: 'text-success',
};

const denseListViewportSizeClassName: Record<DenseListViewportSize, string> = {
  default: 'max-h-[430px] overflow-y-auto pr-0 sm:pr-1',
  large: 'max-h-[625px] overflow-y-auto px-1.5 pb-1.5 sm:px-3 sm:pb-3',
};

const denseListMetaFieldLabelClassName: Record<DenseListMetaFieldAlign, string> = {
  start: 'mb-1 text-[9px] font-bold uppercase tracking-[0.08em] text-muted-foreground',
  end: 'mb-1 text-[9px] font-bold uppercase tracking-[0.08em] text-muted-foreground lg:text-right',
};

const denseListPickerButtonMaxWidthClassName: Record<DenseListPickerButtonMaxWidth, string> = {
  default: 'max-w-full',
  project: 'max-w-[14rem] sm:max-w-[12rem]',
};

export const denseListActionIconClassName = 'size-6 sm:size-7';
export const denseListMaterialCardClassName = 'rounded-lg border bg-card p-1 sm:p-1.5 shadow-sm';
export const denseListPickerPopoverClassName = 'w-[min(20rem,calc(100vw-2rem))] p-0';
export const denseListIndicatorClassName = 'size-2.5 shrink-0 rounded-full';
export const denseListMutedIndicatorClassName = `${denseListIndicatorClassName} bg-muted-foreground/40`;
export const denseListTableTextClassName = 'text-[12px]';
export const denseListTableNumericCellClassName = `${denseListTableTextClassName} tabular-nums text-right`;
export const denseListTableAmountClassName = `${denseListTableNumericCellClassName} font-bold tracking-tight pr-2`;
export const denseListTableActionsClassName = 'flex justify-start pl-2';
export const denseListToolbarRowClassName = 'flex w-auto flex-row items-center gap-2';
export const denseListToolbarFilterContentClassName = 'flex items-center gap-2 truncate';
export const denseListToolbarFilterLabelClassName = 'hidden truncate font-semibold lg:inline';
export const denseListToolbarChevronClassName = 'ml-1 hidden size-3.5 shrink-0 opacity-50 lg:block';
export const denseListToolbarDateLabelClassName = 'hidden flex-1 text-left text-[13px] font-semibold tracking-tight sm:text-center lg:inline';
export const denseListToolbarDividerClassName = 'mx-1 hidden h-6 w-px bg-border xl:block';
export const denseListToolbarActionsClassName = 'hidden flex-row items-center gap-2 overflow-x-auto pb-1 sm:flex xl:pb-0';
export const denseListToolbarMobileActionsClassName = 'ml-auto sm:hidden';
export const denseListToolbarMenuContentClassName = 'w-56';
export const denseListToolbarMenuItemClassName = 'gap-2';

const denseListInlineNumberBaseClassName =
  'h-4 min-w-0 flex-none rounded-sm border-0 bg-transparent px-1 py-0 text-right font-semibold leading-none text-foreground !border-0 !shadow-none outline-none focus-visible:!ring-0 focus-visible:!ring-offset-0';
export const denseListWorkNumberClassName = `${denseListInlineNumberBaseClassName} w-10 text-xs sm:w-14`;
export const denseListMaterialQtyClassName = `${denseListInlineNumberBaseClassName} w-8 text-xs sm:w-10`;
export const denseListMaterialExpenseClassName = `${denseListInlineNumberBaseClassName} w-8 text-xs sm:w-9`;

const denseListInlineTextBaseClassName =
  'min-w-0 rounded-sm border-0 bg-transparent !border-0 !shadow-none outline-none focus-visible:!ring-0 focus-visible:!ring-offset-0';
export const denseListWorkNameClassName = `${denseListInlineTextBaseClassName} min-h-9 max-w-[48rem] flex-1 !whitespace-normal !justify-start break-words px-1 text-left text-xs font-semibold leading-tight text-foreground sm:min-h-10 sm:min-w-[8rem] xl:min-w-[18rem]`;
export const denseListMaterialNameClassName = `${denseListInlineTextBaseClassName} min-h-9 w-full !whitespace-normal !justify-start break-words px-0 text-left text-xs font-semibold leading-tight text-foreground sm:min-h-10`;

const denseListInlineEditIconClassName = '[&_svg]:hidden';
export const denseListInlineCellClassName = cn(
  'h-6 sm:h-5 min-w-0 rounded-sm border-0 bg-transparent px-1 sm:px-0.5 py-0 text-[11px] sm:text-[10px] font-semibold leading-none !shadow-none focus-visible:!ring-0 focus-visible:!ring-offset-0',
  denseListInlineEditIconClassName,
);
export const denseListInlineQtyCellClassName = cn(
  denseListInlineCellClassName,
  'w-14 sm:w-11 justify-end text-right tabular-nums',
);
export const denseListInlineUnitCellClassName = cn(
  denseListInlineCellClassName,
  'w-10 sm:w-8 justify-start text-left font-bold text-foreground',
);
export const denseListInlinePriceCellClassName = cn(
  denseListInlineCellClassName,
  'min-w-[5.75rem] justify-end text-right tabular-nums font-bold',
);
export const denseListInlineDateCellClassName = cn(
  denseListInlineCellClassName,
  'w-[5.75rem] sm:w-[4.9rem] justify-center rounded-full border border-border bg-muted px-1.5 text-muted-foreground',
);
export const denseListInlineTextCellClassName = cn(
  denseListInlineCellClassName,
  'h-auto min-h-6 sm:min-h-5 w-full !justify-start !whitespace-normal break-words px-0 text-left text-[11px] sm:text-[11px] font-semibold leading-tight text-foreground hover:bg-transparent',
);

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

function DenseListLabeledMetric({ label, value, tone = 'neutral', density = 'work', className, ...props }: DenseListLabeledMetricProps) {
  return (
    <DenseListMetricPill tone={tone} density={density} className={className} {...props}>
      <span className="shrink-0 opacity-70">{label}:</span>
      <span className="ml-0.5 tabular-nums">{value}</span>
    </DenseListMetricPill>
  );
}

function DenseListInlineMetric({ label, className, children, ...props }: DenseListInlineMetricProps) {
  return (
    <div
      className={cn(
        'inline-flex h-6 items-center gap-1 whitespace-nowrap rounded-full border border-border bg-muted px-1.5 py-0 text-[11px] font-semibold leading-none text-muted-foreground sm:h-5 sm:text-[10px]',
        className,
      )}
      {...props}
    >
      <span className="shrink-0 opacity-70">{label}:</span>
      {children}
    </div>
  );
}

function DenseListSummaryRail({ className, ...props }: React.ComponentProps<'div'>) {
  return <div className={cn('flex flex-wrap justify-end gap-2 px-1 -mb-[14px]', className)} {...props} />;
}

function DenseListPickerButton({ maxWidth = 'default', className, ...props }: DenseListPickerButtonProps) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="xs"
      className={cn(
        'h-6 justify-start gap-1 rounded-full border border-border bg-muted px-1.5 text-[11px] font-semibold text-foreground hover:bg-muted/80 sm:h-5 sm:text-[10px]',
        denseListPickerButtonMaxWidthClassName[maxWidth],
        className,
      )}
      {...props}
    />
  );
}

function DenseListColorIndicator({ color, className, style, ...props }: DenseListColorIndicatorProps) {
  return (
    <span
      className={cn(color ? denseListIndicatorClassName : denseListMutedIndicatorClassName, className)}
      style={color ? { ...style, backgroundColor: color } : style}
      aria-hidden="true"
      {...props}
    />
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
  DenseListColorIndicator,
  DenseListContentInset,
  DenseListEmptyBlock,
  DenseListEmptyInset,
  DenseListHeader,
  DenseListInlineContent,
  DenseListInlineMetric,
  DenseListInlineStart,
  DenseListItem,
  DenseListLabeledMetric,
  DenseListMaterialGrid,
  DenseListMaterialImageFrame,
  DenseListMaterialMeta,
  DenseListMaterialRow,
  DenseListMetaField,
  DenseListMetricGroup,
  DenseListMetricPill,
  DenseListNestedPanel,
  DenseListPanel,
  DenseListPickerButton,
  DenseListPrimaryCell,
  DenseListRecordGrid,
  DenseListRow,
  DenseListStack,
  DenseListStat,
  DenseListSummaryRail,
  DenseListSurface,
  DenseListToken,
  DenseListToolbarInset,
  DenseListTrailingAction,
  DenseListTrailingActions,
  DenseListViewport,
  DenseListWrap,
};
