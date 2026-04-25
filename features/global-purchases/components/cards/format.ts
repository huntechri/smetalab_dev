import { cn } from '@/lib/utils';
import { parseIsoDateSafe } from '../../lib/date';

export const amountFormatter = new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 2 });

const dateFormatter = new Intl.DateTimeFormat('ru-RU', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
});

const hideInlineEditIconClassName = '[&_svg]:hidden';

export const inlineCellClassName = cn(
  'h-4 sm:h-5 min-w-0 rounded-sm border-0 bg-transparent px-0.5 py-0 text-[9px] sm:text-[10px] font-semibold leading-none !shadow-none focus-visible:!ring-0 focus-visible:!ring-offset-0',
  hideInlineEditIconClassName,
);

export const inlineQtyCellClassName = cn(
  inlineCellClassName,
  'w-11 justify-end text-right tabular-nums',
);

export const inlineUnitCellClassName = cn(
  inlineCellClassName,
  'w-8 justify-start text-left font-bold text-slate-700',
);

export const inlinePriceCellClassName = cn(
  inlineCellClassName,
  'w-[4.75rem] justify-end text-right tabular-nums',
);

export const inlineDateCellClassName = cn(
  inlineCellClassName,
  'w-[4.9rem] justify-center rounded-full border border-slate-200 bg-slate-50 px-1 text-slate-600 sm:px-1.5',
);

export const inlineTextCellClassName = cn(
  inlineCellClassName,
  'h-auto min-h-4 sm:min-h-5 w-full !justify-start !whitespace-normal break-words px-0 text-left text-[9px] sm:text-[11px] font-semibold leading-tight text-slate-800 hover:bg-transparent',
);

export function formatPurchaseDate(value: string) {
  try {
    return dateFormatter.format(parseIsoDateSafe(value));
  } catch {
    return value;
  }
}
