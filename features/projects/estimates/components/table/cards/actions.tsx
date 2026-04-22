import { FolderTree, FolderUp, RefreshCw, Trash2 } from 'lucide-react';
import { ActionMenuItem } from '@/shared/ui/action-menu';
import type { EstimateRow } from '../../../types/dto';
import { DEFAULT_SECTION_ID } from '../../../lib/estimate-cards-table';
import type { EstimateCardsTableProps } from './types';

export function buildSectionActions(
  section: EstimateRow,
  props: Pick<
    EstimateCardsTableProps,
    'onRequestCreateSection' | 'onRequestCreateSectionBefore' | 'onRemoveRow'
  >,
): ActionMenuItem[] {
  if (section.id === DEFAULT_SECTION_ID) {
    return [];
  }

  return [
    {
      label: 'Добавить раздел выше',
      icon: <FolderUp className="size-4" />,
      onClick: () => props.onRequestCreateSectionBefore(section.id),
    },
    {
      label: 'Добавить раздел ниже',
      icon: <FolderTree className="size-4" />,
      onClick: () => props.onRequestCreateSection(section.id),
    },
    {
      label: 'Удалить раздел',
      icon: <Trash2 className="size-4" />,
      variant: 'destructive',
      onClick: () => void props.onRemoveRow(section.id),
    },
  ];
}

export function buildWorkActions(
  work: EstimateRow,
  props: Pick<
    EstimateCardsTableProps,
    | 'onRequestCreateSection'
    | 'onRequestCreateSectionBefore'
    | 'onReplaceWork'
    | 'onRemoveRow'
  >,
): ActionMenuItem[] {
  return [
    {
      label: 'Добавить раздел выше',
      icon: <FolderUp className="size-4" />,
      onClick: () => props.onRequestCreateSectionBefore(work.id),
    },
    {
      label: 'Добавить раздел ниже',
      icon: <FolderTree className="size-4" />,
      onClick: () => props.onRequestCreateSection(work.id),
    },
    {
      label: 'Изменить / заменить',
      icon: <RefreshCw className="size-4" />,
      onClick: () => props.onReplaceWork(work.id, work.name),
    },
    {
      label: 'Удалить',
      icon: <Trash2 className="size-4" />,
      variant: 'destructive',
      onClick: () => void props.onRemoveRow(work.id),
    },
  ];
}

export function buildMaterialActions(
  material: EstimateRow,
  props: Pick<EstimateCardsTableProps, 'onReplaceMaterial' | 'onRemoveRow'>,
): ActionMenuItem[] {
  return [
    {
      label: 'Изменить / заменить',
      icon: <RefreshCw className="size-4" />,
      onClick: () => props.onReplaceMaterial(material.id, material.name),
    },
    {
      label: 'Удалить',
      icon: <Trash2 className="size-4" />,
      variant: 'destructive',
      onClick: () => void props.onRemoveRow(material.id),
    },
  ];
}
