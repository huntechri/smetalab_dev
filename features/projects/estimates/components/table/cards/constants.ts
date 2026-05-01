import {
  denseListActionIconClassName,
  denseListMaterialCardClassName,
  denseListMaterialExpenseClassName,
  denseListMaterialNameClassName,
  denseListMaterialQtyClassName,
  denseListWorkNameClassName,
  denseListWorkNumberClassName,
} from '@/shared/ui/dense-list';

export const INTEGER_FORMATTER = new Intl.NumberFormat('ru-RU', {
  maximumFractionDigits: 0,
});

export const ESTIMATE_CARD_ICON_ACTION_CLASS = denseListActionIconClassName;
export const ESTIMATE_MATERIAL_CARD_CLASS = denseListMaterialCardClassName;
export const WORK_NUMBER_CLASS = denseListWorkNumberClassName;
export const MATERIAL_QTY_CLASS = denseListMaterialQtyClassName;
export const MATERIAL_EXPENSE_CLASS = denseListMaterialExpenseClassName;
export const WORK_NAME_CLASS = denseListWorkNameClassName;
export const MATERIAL_NAME_CLASS = denseListMaterialNameClassName;
