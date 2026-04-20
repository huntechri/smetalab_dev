'use client';

import { Button } from '@repo/ui';
import { EditableCell, ImageCell, MoneyCell, DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@repo/ui';
import { ColumnDef } from '@tanstack/react-table';
import { ChevronDown, ChevronRight, HardHat, FolderTree, FolderUp, RefreshCw, Settings, Trash2, Wrench } from 'lucide-react';
import { VisibleEstimateRow } from '../../lib/rows-visible';
import { SectionTotals } from '../../lib/section-totals';

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
            if (item.kind === 'section') {
                return <div className="pl-1 tabular-nums text-[12px] font-semibold">{item.code}</div>;
            }

            if (item.kind === 'work') {
                const expanded = actions.expandedWorkIds.has(item.id);
                return (
                    <div className="flex items-center gap-1">
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
                        <span className="tabular-nums text-[12px] font-medium">{item.code}</span>
                    </div>
                );
            }
            return <div className="pl-9 tabular-nums text-[12px] text-muted-foreground/80">{item.code}</div>;
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
                        className="text-[11px] font-bold uppercase tracking-widest truncate"
                    />
                );
            }
            return (
                <div className={item.kind === 'material' ? 'pl-8' : 'pl-3'}>
                    <EditableCell
                        type="text"
                        cancelOnEmpty
                        value={item.name}
                        onCommit={(value) => actions.onPatch(item.id, 'name', value)}
                        ariaLabel={`Наименование: ${item.name}`}
                        className={item.kind === 'material' ? 'text-[12px] italic text-muted-foreground' : 'text-[12px] font-normal'}
                    />
                </div>
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
            <div className={row.original.kind === 'section' ? 'text-center text-[12px] text-muted-foreground/50' : row.original.kind === 'material' ? 'text-[12px] italic text-muted-foreground text-center' : 'text-center text-[12px] text-muted-foreground font-medium'}>
                {row.original.unit}
            </div>
        )
    },
    {
        accessorKey: 'qty',
        size: 80,
        header: () => <div className="text-right">Кол-во</div>,
        cell: ({ row }) => (
            <div className={`text-right tabular-nums pr-6 text-[12px] ${row.original.kind === 'material' ? 'italic text-muted-foreground' : ''}`}>
                {row.original.kind === 'section' ? null : <EditableCell type="number" align="right" clearOnFocus cancelOnEmpty value={row.original.qty} onCommit={(value) => actions.onPatch(row.original.id, 'qty', value)} ariaLabel={`Количество: ${row.original.name}`} />}
            </div>
        )
    },
    {
        accessorKey: 'price',
        size: 100,
        header: () => <div className="text-right">Цена</div>,
        cell: ({ row }) => (
            <div className={`text-right tabular-nums pr-6 text-[12px] ${row.original.kind === 'material' ? 'italic text-muted-foreground' : ''}`}>
                {row.original.kind === 'section' ? null : <EditableCell type="number" align="right" clearOnFocus cancelOnEmpty value={row.original.price} onCommit={(value) => actions.onPatch(row.original.id, 'price', value)} ariaLabel={`Цена: ${row.original.name}`} />}
            </div>
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
                    <div className="pr-6 text-right text-[11px] font-bold tracking-tight tabular-nums opacity-90">
                        Р: {sectionTotals.works.toLocaleString('ru-RU')} · М: {sectionTotals.materials.toLocaleString('ru-RU')}
                    </div>
                );
            }

            return (
                <div className={`text-right tabular-nums pr-6 text-[12px] ${row.original.kind === 'material' ? 'italic text-muted-foreground' : 'font-medium text-primary/90'}`}>
                    <MoneyCell value={row.original.sum} />
                </div>
            );
        }
    },
    {
        accessorKey: 'expense',
        size: 90,
        header: () => <div className="text-right">Расход</div>,
        cell: ({ row }) => {
            if (row.original.kind === 'work' || row.original.kind === 'section') {
                return <div className="text-right tabular-nums pr-6 text-[12px]" />;
            }
            return (
                <div className="text-right tabular-nums pr-6 text-[12px]">
                    <EditableCell
                        type="number"
                        align="right"
                        clearOnFocus
                        cancelOnEmpty
                        value={row.original.expense}
                        onCommit={(value) => actions.onPatch(row.original.id, 'expense', value)}
                        ariaLabel={`Расход: ${row.original.name}`}
                    />
                </div>
            );
        }
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
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button size="icon-xs" variant="ghost" aria-label="Действия с строкой">
                                <Settings className="size-3.5 text-muted-foreground" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            {item.kind !== 'material' && (
                                <>
                                    <DropdownMenuItem onClick={() => actions.onRequestCreateSectionBefore(item.id)}>
                                        <FolderUp className="mr-2 size-4" />
                                        Добавить раздел выше
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => actions.onRequestCreateSection(item.id)}>
                                        <FolderTree className="mr-2 size-4" />
                                        Добавить раздел ниже
                                    </DropdownMenuItem>
                                </>
                            )}
                            
                            {(item.kind === 'work' || item.kind === 'material') && (
                                <>
                                    {item.kind === 'work' && <DropdownMenuSeparator />}
                                    <DropdownMenuItem onClick={() => item.kind === 'work' ? actions.onReplaceWork(item.id, item.name) : actions.onReplaceMaterial(item.id, item.name)}>
                                        <RefreshCw className="mr-2 size-4" />
                                        Изменить / заменить
                                    </DropdownMenuItem>
                                </>
                            )}

                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive focus:text-destructive focus:bg-destructive/10" onClick={() => void actions.onRemoveRow(item.id)}>
                                <Trash2 className="mr-2 size-4" />
                                {item.kind === 'section' ? 'Удалить раздел' : 'Удалить'}
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            );
        },
    },
];
