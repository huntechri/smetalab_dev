export const INTEGER_FORMATTER = new Intl.NumberFormat('ru-RU', {
  maximumFractionDigits: 0,
});

export const ESTIMATE_CARD_SHADOW_CLASS = 'shadow-sm';
export const ESTIMATE_CARD_ICON_ACTION_CLASS = 'size-6 sm:size-7';
export const ESTIMATE_MATERIAL_CARD_CLASS =
  `rounded-lg border bg-card p-1 sm:p-1.5 ${ESTIMATE_CARD_SHADOW_CLASS}`;

const INLINE_NUMBER_BASE_CLASS =
  'h-4 min-w-0 flex-none rounded-sm border-0 bg-transparent px-1 py-0 text-right font-semibold leading-none text-foreground !border-0 !shadow-none outline-none focus-visible:!ring-0 focus-visible:!ring-offset-0';
export const WORK_NUMBER_CLASS = `${INLINE_NUMBER_BASE_CLASS} w-10 text-xs sm:w-14`;
export const MATERIAL_QTY_CLASS = `${INLINE_NUMBER_BASE_CLASS} w-8 text-xs sm:w-10`;
export const MATERIAL_EXPENSE_CLASS = `${INLINE_NUMBER_BASE_CLASS} w-8 text-xs sm:w-9`;

const INLINE_TEXT_BASE_CLASS =
  'min-w-0 rounded-sm border-0 bg-transparent !border-0 !shadow-none outline-none focus-visible:!ring-0 focus-visible:!ring-offset-0';
export const WORK_NAME_CLASS = `${INLINE_TEXT_BASE_CLASS} min-h-9 max-w-[48rem] flex-1 !whitespace-normal !justify-start break-words px-1 text-left text-xs font-semibold leading-tight text-foreground sm:min-h-10 sm:min-w-[8rem] xl:min-w-[18rem]`;
export const MATERIAL_NAME_CLASS = `${INLINE_TEXT_BASE_CLASS} min-h-9 w-full !whitespace-normal !justify-start break-words px-0 text-left text-xs font-semibold leading-tight text-foreground sm:min-h-10`;
