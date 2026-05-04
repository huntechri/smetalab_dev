import * as React from 'react';

import { cn } from '@/lib/utils';
import { TableCell, TableHead, TableRow } from '@/shared/ui/table';
import {
  primitiveDataTableHeaderRowClassName,
  primitiveDataTableHeaderCellClassName,
  primitiveDataTableBodyRowClassName,
  primitiveDataTableBodyCellClassName,
  primitiveDataTableCellContentClassName,
  primitiveDataTableContainerClassName,
  primitiveDataTableAiContainerClassName,
  primitiveDataTableAiOverlayClassName,
  primitiveDataTableEmptyCellClassName,
  primitiveCompactTableHeadClassName,
  primitiveCompactTableCellClassName,
} from '@/shared/ui/primitive-density';

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

export const dataTableSortableHeaderTriggerClassName =
  'flex w-full cursor-pointer select-none items-center gap-2 rounded-sm text-left transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60';
export const dataTableStaticHeaderTriggerClassName =
  'flex w-full cursor-default select-none items-center gap-2 text-left';
export const dataTableHeaderContentClassName = 'flex-1 truncate text-xs';
export const dataTableHeaderRowClassName = primitiveDataTableHeaderRowClassName;
export const dataTableHeaderCellClassName = primitiveDataTableHeaderCellClassName;
export const dataTableBodyRowClassName = primitiveDataTableBodyRowClassName;
export const dataTableBodyCellClassName = primitiveDataTableBodyCellClassName;
export const dataTableCellContentClassName = primitiveDataTableCellContentClassName;
export const dataTableContainerClassName = primitiveDataTableContainerClassName;
export const dataTableAiContainerClassName = primitiveDataTableAiContainerClassName;
export const dataTableAiOverlayClassName = primitiveDataTableAiOverlayClassName;
export const dataTableLoadingOverlayClassName =
  'pointer-events-none absolute inset-0 z-20 flex items-center justify-center bg-background/18 backdrop-blur-[1px]';
export const dataTableLoadingBadgeClassName =
  'flex items-center gap-2 rounded-full border border-border/60 bg-card/90 px-3 py-1.5 text-[12px] font-medium text-muted-foreground shadow-lg';
export const dataTableEmptyCellClassName = primitiveDataTableEmptyCellClassName;

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
  return <TableRow className={cn(primitiveCompactTableCellClassName, className)} {...props} />;
}

export function CompactTableHead({ align = 'start', className, ...props }: CompactTableHeadProps) {
  return <TableHead className={cn(primitiveCompactTableHeadClassName, tableTextAlignClassName[align], className)} {...props} />;
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
        primitiveCompactTableCellClassName,
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
