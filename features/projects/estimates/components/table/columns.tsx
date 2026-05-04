'use client';

import { Button } from '@/shared/ui/button';
import { EditableCell } from '@/shared/ui/cells/editable-cell';
import { ImageCell } from '@/shared/ui/cells/image-cell';
import { MoneyCell } from '@/shared/ui/cells/money-cell';
import { ActionMenu } from '@/shared/ui/action-menu';
import {
    EstimateCodeCell,
    EstimateNameCellWrapper,
    EstimateUnitCell,
    EstimateNumberCell,
    EstimateSectionSumCell,
    EstimateSumCell,
    EstimateExpenseCell,
} from '@/shared/ui/cells/estimate-table-cells';
import { ColumnDef } from '@tanstack/react-table';
import { ChevronDown, ChevronRight, HardHat, FolderTree, FolderUp, RefreshCw, Settings, Trash2, Wrench } from 'lucide-react';
import { VisibleEstimateRow } from '../../lib/rows-visible';
import { SectionTotals } from '../../lib/section-totals';
import { primitiveVisualTypographyClassNames } from '@/shared/ui/primitive-surface';

export type EstimateColumnActions = {
    expandedWorkIds: Set<string>;
    onToggleExpand: (workId: string) => void;
    onPatch: (rowId: string, field: 'name' | 'qty' | 'price' | 'expense', rawValue: string) => Promise<void>;
    onOpenMaterialCatalog: (workId: string, workName: string) => void;
    onInsertWorkAfter: (workId: string, workName: string) => void;
    onRequestCreateSection: (insertAfterRowId?: string) => void;
    onRequestCreateSectionBefore: (insertBeforeRowId: string) => void;
    onReplaceMaterial: (materialId: string, materialName: string) => void;
    onReplaceWork: (workId: string, workName: string) => void;
    onRemoveRow: (rowId: string) => Promise<void>;
    sectionTotalsById: Map<string, SectionTotals>;
};

export const getEstimateColumns = (actions: EstimateColumnActions): ColumnDef<VisibleEstimateRow>[] => [
    {
        accessorKey: 'code',
        size: 70,
        minSize: 60,
        maxSize: 80,
        header: () => <div className="pl-1">Код</div>,
        cell: ({ row }) => {
            const item = row.original;
            if (item.kind === 'work') {
                const expanded = actions.expandedWorkIds.has(item.id);
                return (
                    <EstimateCodeCell code={item.code} kind={item.kind}>
                        <Button
                            variant="ghost"
                            size="icon-xs"
                            onClick={() => actions.onToggleExpand(item.id)}
                            aria-label={expanded ? 'Свернуть работу' : 'Развернуть работу'}
                        >
                            {expanded ? (
                                <ChevronDown className="size-3.5 text-muted-foreground transition-transform duration-200" />
                            ) : (
                                <ChevronRight className="size-3.5 text-muted-foreground transition-transform duration-200" />
                            )}
                        </Button>
                    </EstimateCodeCell>
                );
            }
            return <EstimateCodeCell code={item.code} kind={item.kind} />;
        },
    },
    {
        accessorKey: 'name',
        size: 450,
        minSize: 200,
        header: 'Наименование',
        cell: ({ row }) => {
            const item = row.original;
            if (item.kind === 'section') {
                return (
                    <EditableCell
                        type="text"
                        cancelOnEmpty
                        value={item.name}
                        onCommit={(value) => actions.onPatch(item.id, 'name', value)}
                        ariaLabel={`Раздел: ${item.name}`}
                        title={item.name}
                        className={primitiveVisualTypographyClassNames.compactValue}
                    />
                );
            }
            return (
                <EstimateNameCellWrapper kind={item.kind}>
                    <EditableCell
                        type="text"
                        cancelOnEmpty
                        value={item.name}
                        onCommit={(value) => actions.onPatch(item.id, 'name', value)}
                        ariaLabel={`Наименование: ${item.name}`}
                        className={item.kind === 'material' ? `${primitiveVisualTypographyClassNames.compactBody} italic text-muted-foreground` : `${primitiveVisualTypographyClassNames.compactBody} font-normal`}
                    />
                </EstimateNameCellWrapper>
            );
        },
    },
    {
        accessorKey: 'imageUrl',
        header: 'Фото',
        size: 60,
        cell: ({ row }) => {
            if (row.original.kind === 'work' || row.original.kind === 'section') {
                return null;
            }

            return <ImageCell imageUrl={row.original.imageUrl} name={row.original.name} />;
        }
    },
    {
        accessorKey: 'unit',
        header: () => <div className="text-center">Ед. изм.</div>,
        size: 70,
        cell: ({ row }) => (
            <EstimateUnitCell unit={row.original.unit} kind={row.original.kind} />
        )
    },
    {
        accessorKey: 'qty',
        size: 80,
        header: () => <div className="text-right">Кол-во</div>,
        cell: ({ row }) => (
            <EstimateNumberCell kind={row.original.kind}>
                {row.original.kind === 'section' ? null : <EditableCell type="number" align="right" clearOnFocus cancelOnEmpty value={row.original.qty} onCommit={(value) => actions.onPatch(row.original.id, 'qty', value)} ariaLabel={`Количество: ${row.original.name}`} />}
            </EstimateNumberCell>
        )
    },
    {
        accessorKey: 'price',
        size: 100,
        header: () => <div className="text-right">Цена</div>,
        cell: ({ row }) => (
            <EstimateNumberCell kind={row.original.kind}>
                {row.original.kind === 'section' ? null : <EditableCell type="number" align="right" clearOnFocus cancelOnEmpty value={row.original.price} onCommit={(value) => actions.onPatch(row.original.id, 'price', value)} ariaLabel={`Цена: ${row.original.name}`} />}
            </EstimateNumberCell>
        )
    },
    {
        accessorKey: 'sum',
        size: 140,
        header: () => <div className="text-right">Сумма</div>,
        cell: ({ row }) => {
            if (row.original.kind === 'section') {
                const sectionTotals = actions.sectionTotalsById.get(row.original.id) ?? { works: 0, materials: 0, total: 0 };
                return (
                    <EstimateSectionSumCell works={sectionTotals.works} materials={sectionTotals.materials} />
                );
            }

            return (
                <EstimateSumCell kind={row.original.kind}>
                    <MoneyCell value={row.original.sum} />
                </EstimateSumCell>
            );
        }
    },
    {
        accessorKey: 'expense',
        size: 90,
        header: () => <div className="text-right">Расход</div>,
        cell: ({ row }) => (
            <EstimateExpenseCell kind={row.original.kind}>
                <EditableCell
                    type="number"
                    align="right"
                    clearOnFocus
                    cancelOnEmpty
                    value={row.original.expense}
                    onCommit={(value) => actions.onPatch(row.original.id, 'expense', value)}
                    ariaLabel={`Расход: ${row.original.name}`}
                />
            </EstimateExpenseCell>
        )
    },
    {
        id: 'actions',
        size: 100,
        header: () => <div className="text-center">Действия</div>,
        cell: ({ row }) => {
            const item = row.original;
            return (
                <div className="flex items-center justify-center gap-1">
                    {item.kind === 'work' ? (
                        <>
                            <Button
                                size="icon-xs"
                                variant="ghost"
                                onClick={() => actions.onOpenMaterialCatalog(item.id, item.name)}
                                title="Добавить материал"
                                aria-label="Добавить материал"
                            >
                                <Wrench className="size-3.5 text-muted-foreground" />
                            </Button>
                            <Button
                                size="icon-xs"
                                variant="ghost"
                                onClick={() => actions.onInsertWorkAfter(item.id, item.name)}
                                title="Добавить работу ниже"
                                aria-label="Добавить работу ниже"
                            >
                                <HardHat className="size-3.5 text-primary/80" />
                            </Button>
                        </>
                    ) : null}
                    <ActionMenu
                        trigger={
                            <Button size="icon-xs" variant="ghost" aria-label="Действия с строкой">
                                <Settings className="size-3.5 text-muted-foreground" />
                            </Button>
                        }
                        items={[
                            ...(item.kind !== 'material'
                                ? [
                                      ...(item.kind === 'section'
                                          ? [
                                                {
                                                    label: 'Добавить работу',
                                                    icon: <HardHat className="size-4" />,
                                                    onClick: () => actions.onInsertWorkAfter(item.id, item.name),
                                                },
                                            ]
                                          : []),
                                      {
                                          label: 'Добавить раздел выше',
                                          icon: <FolderUp className="size-4" />,
                                          onClick: () => actions.onRequestCreateSectionBefore(item.id),
                                      },
                                      {
                                          label: 'Добавить раздел ниже',
                                          icon: <FolderTree className="size-4" />,
                                          onClick: () => actions.onRequestCreateSection(item.id),
                                      },
                                  ]
                                : []),
                            ...(item.kind === 'work' || item.kind === 'material'
                                ? [
                                      {
                                          label: 'Изменить / заменить',
                                          icon: <RefreshCw className="size-4" />,
                                          onClick: () =>
                                              item.kind === 'work'
                                                  ? actions.onReplaceWork(item.id, item.name)
                                                  : actions.onReplaceMaterial(item.id, item.name),
                                      },
                                  ]
                                : []),
                            {
                                label: item.kind === 'section' ? 'Удалить раздел' : 'Удалить',
                                icon: <Trash2 className="size-4" />,
                                variant: 'destructive',
                                onClick: () => void actions.onRemoveRow(item.id),
                            },
                        ]}
                    />
                </div>
            );
        },
    },
];
