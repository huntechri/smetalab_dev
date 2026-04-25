import { cn } from '@/lib/utils';
import { parseIsoDateSafe } from '../../lib/date';

export const amountFormatter = new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 2 });

const dateFormatter = new Intl.DateTimeFormat('ru-RU', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
});

export const inlineCellClassName =
  'h-6 min-w-0 rounded-sm border-0 bg-transparent px-1 py-0 text-[11px] font-semibold leading-none !shadow-none focus-visible:!ring-0 focus-visible:!ring-offset-0';

export const inlineNumberCellClassName = cn(
  inlineCellClassName,
  'w-16 justify-end text-right tabular-nums',
);

export const inlineTextCellClassName = cn(
  inlineCellClassName,
  'min-h-8 w-full !whitespace-normal !justify-start break-words text-left text-slate-800',
);

export function formatPurchaseDate(value: string) {
  try {
    return dateFormatter.format(parseIsoDateSafe(value));
  } catch {
    return value;
  }
}
