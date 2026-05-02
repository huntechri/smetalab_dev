import * as React from 'react';

import { cn } from '@/lib/utils';
import { TableCell, TableHead, TableRow } from '@/shared/ui/table';

export type TableDensity = 'compact' | 'default';
export type TableTextAlign = 'start' | 'center' | 'end';
export type TableTextTone = 'default' | 'muted' | 'success' | 'danger';
export type TableTextWeight = 'normal' | 'medium' | 'semibold' | 'bold';
export type TableTextSize = 'xs' | 'sm';

type CompactTableHeaderRowProps = React.ComponentPropsWithoutRef<typeof TableRow>;
type CompactTableRowProps = React.ComponentPropsWithoutRef<typeof TableRow>;
type CompactTableHeadProps = Omit<React.ComponentPropsWithoutRef<typeof TableHead>, 'align'> & {
  align?: TableTextAlign;
};
type CompactTableCellProps = Omit<React.ComponentPropsWithoutRef<typeof TableCell>, 'align'> & {
  align?: TableTextAlign;
  tone?: TableTextTone;
  weight?: TableTextWeight;
  truncate?: boolean;
  tabular?: boolean;
};

const tableTextAlignClassName: Record<TableTextAlign, string> = {
  start: 'text-left',
  center: 'text-center',
  end: 'text-right',
};

const tableTextToneClassName: Record<TableTextTone, string> = {
  default: 'text-foreground',
  muted: 'text-muted-foreground',
  success: 'text-success',
  danger: 'text-destructive',
};

const tableTextWeightClassName: Record<TableTextWeight, string> = {
  normal: 'font-normal',
  medium: 'font-medium',
  semibold: 'font-semibold',
  bold: 'font-bold',
};

const tableTextSizeClassName: Record<TableTextSize, string> = {
  xs: 'text-xs',
  sm: 'text-sm',
};

const compactTableHeadClassName = 'h-8 text-[9px] font-bold uppercase tracking-wider text-muted-foreground/70 sm:text-[11px]';
const compactTableCellClassName = 'py-2 text-[9px] sm:text-[11px]';

export const dataTableSortableHeaderTriggerClassName =
  'flex w-full cursor-pointer select-none items-center gap-2 rounded-sm text-left transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60';
export const dataTableStaticHeaderTriggerClassName =
  'flex w-full cursor-default select-none items-center gap-2 text-left';
export const dataTableHeaderContentClassName = 'flex-1 truncate text-xs';
export const dataTableHeaderRowClassName = 'bg-background shadow-[0_1px_0_0_rgba(0,0,0,0.08)]';
export const dataTableHeaderCellClassName =
  'h-10 border-b border-border/50 bg-muted/20 px-3 text-left align-middle text-[11px] font-bold uppercase tracking-widest text-muted-foreground transition-colors md:px-4';
export const dataTableBodyRowClassName =
  'group/row cursor-default animate-in border-b fade-in slide-in-from-left-1 transition-colors duration-300 last:border-0 hover:bg-muted/60';
export const dataTableBodyCellClassName =
  'border-b px-3 py-1.5 align-middle transition-colors md:px-4 md:py-2';
export const dataTableCellContentClassName = 'w-full text-[12px] leading-tight';
export const dataTableContainerClassName =
  'relative overflow-x-auto rounded-2xl border border-border/40 bg-card/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-md';
export const dataTableAiContainerClassName =
  'border-indigo-400/30 shadow-[0_0_30px_-5px_rgba(99,102,241,0.15)] ring-1 ring-indigo-500/20';
export const dataTableAiOverlayClassName =
  'pointer-events-none absolute inset-0 bg-linear-to-br from-indigo-500/2 via-transparent to-purple-500/2';
export const dataTableLoadingOverlayClassName =
  'pointer-events-none absolute inset-0 z-20 flex items-center justify-center bg-background/18 backdrop-blur-[1px]';
export const dataTableLoadingBadgeClassName =
  'flex items-center gap-2 rounded-full border border-border/60 bg-card/90 px-3 py-1.5 text-[12px] font-medium text-muted-foreground shadow-lg';
export const dataTableEmptyCellClassName = 'px-3 py-8 text-center text-sm text-muted-foreground';

export interface TableHeaderLabelProps extends React.ComponentPropsWithoutRef<'div'> {
  align?: TableTextAlign;
}

export function TableHeaderLabel({ align = 'start', className, ...props }: TableHeaderLabelProps) {
  return <div className={cn(tableTextAlignClassName[align], className)} {...props} />;
}

export interface TableCellTextProps extends React.HTMLAttributes<HTMLElement> {
  as?: 'span' | 'div' | 'p';
  align?: TableTextAlign;
  tone?: TableTextTone;
  weight?: TableTextWeight;
  size?: TableTextSize;
  truncate?: boolean;
  tabular?: boolean;
}

export function TableCellText({
  as: Component = 'span',
  align = 'start',
  tone = 'default',
  weight = 'normal',
  size = 'xs',
  truncate = false,
  tabular = false,
  className,
  ...props
}: TableCellTextProps) {
  return (
    <Component
      className={cn(
        tableTextAlignClassName[align],
        tableTextToneClassName[tone],
        tableTextWeightClassName[weight],
        tableTextSizeClassName[size],
        truncate && 'truncate',
        tabular && 'tabular-nums',
        className,
      )}
      {...props}
    />
  );
}

export function CompactTableHeaderRow({ className, ...props }: CompactTableHeaderRowProps) {
  return <TableRow className={cn('hover:bg-transparent', className)} {...props} />;
}

export function CompactTableRow({ className, ...props }: CompactTableRowProps) {
  return <TableRow className={cn(compactTableCellClassName, className)} {...props} />;
}

export function CompactTableHead({ align = 'start', className, ...props }: CompactTableHeadProps) {
  return <TableHead className={cn(compactTableHeadClassName, tableTextAlignClassName[align], className)} {...props} />;
}

export function CompactTableCell({
  align = 'start',
  tone = 'default',
  weight = 'normal',
  truncate = false,
  tabular = false,
  className,
  ...props
}: CompactTableCellProps) {
  return (
    <TableCell
      className={cn(
        compactTableCellClassName,
        tableTextAlignClassName[align],
        tableTextToneClassName[tone],
        tableTextWeightClassName[weight],
        truncate && 'truncate',
        tabular && 'tabular-nums',
        className,
      )}
      {...props}
    />
  );
}
