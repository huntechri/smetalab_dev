export const INTEGER_FORMATTER = new Intl.NumberFormat('ru-RU', {
  maximumFractionDigits: 0,
});

const INLINE_NUMBER_BASE_CLASS =
  'h-4 min-w-0 flex-none rounded-sm border-0 bg-transparent px-1 py-0 text-right font-semibold leading-none text-slate-800 !border-0 !shadow-none outline-none focus-visible:!ring-0 focus-visible:!ring-offset-0';
export const WORK_NUMBER_CLASS = `${INLINE_NUMBER_BASE_CLASS} w-10 text-[9px] sm:w-14 sm:text-[10px]`;
export const MATERIAL_QTY_CLASS = `${INLINE_NUMBER_BASE_CLASS} w-8 text-[9px] sm:w-10 sm:text-[10px]`;
export const MATERIAL_EXPENSE_CLASS = `${INLINE_NUMBER_BASE_CLASS} w-8 text-[9px] sm:w-9 sm:text-[10px]`;

const INLINE_TEXT_BASE_CLASS =
  'min-w-0 rounded-sm border-0 bg-transparent !border-0 !shadow-none outline-none focus-visible:!ring-0 focus-visible:!ring-offset-0';
export const WORK_NAME_CLASS = `${INLINE_TEXT_BASE_CLASS} min-h-9 max-w-[48rem] flex-1 !whitespace-normal !justify-start break-words px-1 text-left text-[9px] font-semibold leading-tight text-slate-800 sm:min-h-10 sm:min-w-[8rem] sm:text-[11px] xl:min-w-[18rem]`;
export const MATERIAL_NAME_CLASS = `${INLINE_TEXT_BASE_CLASS} min-h-9 w-full !whitespace-normal !justify-start break-words px-0 text-left text-[9px] font-semibold leading-tight text-slate-800 sm:min-h-10 sm:text-[11px]`;
