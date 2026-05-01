import { parseIsoDateSafe } from '../../lib/date';
import {
  denseListInlineDateCellClassName,
  denseListInlinePriceCellClassName,
  denseListInlineQtyCellClassName,
  denseListInlineTextCellClassName,
  denseListInlineUnitCellClassName,
} from '@/shared/ui/dense-list';

export const amountFormatter = new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 2 });

const dateFormatter = new Intl.DateTimeFormat('ru-RU', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
});

export const inlineQtyCellClassName = denseListInlineQtyCellClassName;
export const inlineUnitCellClassName = denseListInlineUnitCellClassName;
export const inlinePriceCellClassName = denseListInlinePriceCellClassName;
export const inlineDateCellClassName = denseListInlineDateCellClassName;
export const inlineTextCellClassName = denseListInlineTextCellClassName;

export function formatPurchaseDate(value: string) {
  try {
    return dateFormatter.format(parseIsoDateSafe(value));
  } catch {
    return value;
  }
}
