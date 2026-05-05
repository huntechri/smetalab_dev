import { cn } from '@/lib/utils';

const denseListInlineNumberBaseClassName =
  'h-4 min-w-0 flex-none rounded-sm border-0 bg-transparent px-1 py-0 text-right font-semibold leading-none text-foreground !border-0 !shadow-none outline-none focus-visible:!ring-0 focus-visible:!ring-offset-0';
export const denseListWorkNumberClassName = `${denseListInlineNumberBaseClassName} w-10 text-[9px] sm:text-[11px] sm:w-14`;
export const denseListMaterialQtyClassName = `${denseListInlineNumberBaseClassName} w-8 text-[9px] sm:text-[11px] sm:w-10`;
export const denseListMaterialExpenseClassName = `${denseListInlineNumberBaseClassName} w-8 text-[9px] sm:text-[11px] sm:w-9`;

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
