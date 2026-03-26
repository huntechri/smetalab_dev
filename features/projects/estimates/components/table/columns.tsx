'use client';

import { Button } from '@/shared/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/shared/ui/dropdown-menu';
import { ColumnDef } from '@tanstack/react-table';
import { ChevronDown, ChevronRight, FileStack, FolderTree, FolderUp, Plus, RefreshCw, Settings, Trash2 } from 'lucide-react';
import { VisibleEstimateRow } from '../../lib/rows-visible';
import { SectionTotals } from '../../lib/section-totals';
import { EditableCell } from './cells/EditableCell';
import { ImageCell } from './cells/ImageCell';
import { MoneyCell } from './cells/MoneyCell';

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
        size: 80,
        minSize: 80,
        maxSize: 100,
        header: () => <div className="pl-1">№ / Код</div>,
        cell: ({ row }) => {
            const item = row.original;
            if (item.kind === 'section') {
                return <div className="pl-1 tabular-nums text-xs md:text-sm font-semibold">{item.code}</div>;
            }

            if (item.kind === 'work') {
                const expanded = actions.expandedWorkIds.has(item.id);
                return (
                    <div className="flex items-center gap-1">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="size-7 hover:bg-muted/80"
                            onClick={() => actions.onToggleExpand(item.id)}
                            aria-label={expanded ? 'Свернуть работу' : 'Развернуть работу'}
                        >
                            {expanded ? (
                                <ChevronDown className="size-4 text-muted-foreground transition-transform duration-200" />
                            ) : (
                                <ChevronRight className="size-4 text-muted-foreground transition-transform duration-200" />
                            )}
                        </Button>
                        <span className="tabular-nums text-xs md:text-sm font-medium">{item.code}</span>
                    </div>
                );
            }
            return <div className="pl-9 tabular-nums text-xs md:text-sm text-muted-foreground/80">{item.code}</div>;
        },
    },
    {
        accessorKey: 'name',
        size: 600,
        minSize: 300,
        header: 'Наименование',
        cell: ({ row }) => {
            const item = row.original;
            return (
                <div className={item.kind === 'material' ? 'pl-8' : item.kind === 'work' ? 'pl-3' : ''}>
                    <div
                        className={
                            item.kind === 'section'
                                ? 'text-xs md:text-sm font-semibold uppercase tracking-wide truncate'
                                : item.kind === 'work'
                                  ? 'text-xs md:text-sm font-normal truncate'
                                  : 'text-xs md:text-sm italic text-muted-foreground'
                        }
                        title={item.name}
                    >
                        {item.name}
                    </div>
                </div>
            );
        },
    },
    {
        accessorKey: 'imageUrl',
        header: 'Изображение',
        size: 110,
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
        size: 100,
        cell: ({ row }) => (
            <div className={row.original.kind === 'section' ? 'text-center text-xs md:text-sm text-muted-foreground/50' : row.original.kind === 'material' ? 'text-xs md:text-sm italic text-muted-foreground text-center' : 'text-center text-xs md:text-sm text-muted-foreground font-medium'}>
                {row.original.unit}
            </div>
        )
    },
    {
        accessorKey: 'qty',
        size: 100,
        header: () => <div className="text-right">Кол-во</div>,
        cell: ({ row }) => (
            <div className={`text-right tabular-nums pr-6 text-xs md:text-sm ${row.original.kind === 'material' ? 'italic text-muted-foreground' : ''}`}>
                {row.original.kind === 'section' ? null : <EditableCell type="number" align="right" clearOnFocus cancelOnEmpty value={row.original.qty} onCommit={(value) => actions.onPatch(row.original.id, 'qty', value)} />}
            </div>
        )
    },
    {
        accessorKey: 'price',
        size: 110,
        header: () => <div className="text-right">Цена</div>,
        cell: ({ row }) => (
            <div className={`text-right tabular-nums pr-6 text-xs md:text-sm ${row.original.kind === 'material' ? 'italic text-muted-foreground' : ''}`}>
                {row.original.kind === 'section' ? null : <EditableCell type="number" align="right" clearOnFocus cancelOnEmpty value={row.original.price} onCommit={(value) => actions.onPatch(row.original.id, 'price', value)} />}
            </div>
        )
    },
    {
        accessorKey: 'sum',
        size: 180,
        header: () => <div className="text-right">Сумма</div>,
        cell: ({ row }) => {
            if (row.original.kind === 'section') {
                const sectionTotals = actions.sectionTotalsById.get(row.original.id) ?? { works: 0, materials: 0, total: 0 };
                return (
                    <div className="pr-6 text-right text-xs md:text-sm">
                        <div className="font-semibold tabular-nums">
                            <MoneyCell value={sectionTotals.total} />
                        </div>
                        <div className="text-[10px] md:text-xs text-muted-foreground tabular-nums leading-tight">
                            Р: {sectionTotals.works.toLocaleString('ru-RU')} · М: {sectionTotals.materials.toLocaleString('ru-RU')}
                        </div>
                    </div>
                );
            }

            return (
                <div className={`text-right tabular-nums pr-6 text-xs md:text-sm ${row.original.kind === 'material' ? 'italic text-muted-foreground' : 'font-medium text-primary/90'}`}>
                    <MoneyCell value={row.original.sum} />
                </div>
            );
        }
    },
    {
        accessorKey: 'expense',
        size: 100,
        header: () => <div className="text-right">Расход</div>,
        cell: ({ row }) => {
            if (row.original.kind === 'work' || row.original.kind === 'section') {
                return <div className="text-right tabular-nums pr-6 text-xs md:text-sm" />;
            }
            return (
                <div className="text-right tabular-nums pr-6 text-xs md:text-sm">
                    <EditableCell
                        type="number"
                        align="right"
                        clearOnFocus
                        cancelOnEmpty
                        value={row.original.expense}
                        onCommit={(value) => actions.onPatch(row.original.id, 'expense', value)}
                    />
                </div>
            );
        }
    },
    {
        id: 'actions',
        header: () => <div className="text-center">Действия</div>,
        cell: ({ row }) => {
            const item = row.original;
            return (
                <div className="flex items-center justify-center gap-1">
                    {item.kind === 'work' ? (
                        <>
                            <Button
                                size="icon"
                                variant="ghost"
                                className="size-8"
                                onClick={() => actions.onOpenMaterialCatalog(item.id, item.name)}
                                title="Добавить материал"
                                aria-label="Добавить материал"
                            >
                                <Plus className="size-4 text-muted-foreground" />
                            </Button>
                            <Button
                                size="icon"
                                variant="ghost"
                                className="size-8"
                                onClick={() => actions.onInsertWorkAfter(item.id, item.name)}
                                title="Добавить работу ниже"
                                aria-label="Добавить работу ниже"
                            >
                                <FileStack className="size-4 text-primary/80" />
                            </Button>
                        </>
                    ) : null}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button size="icon" variant="ghost" className="size-8 focus-visible:ring-0 focus:ring-0" aria-label="Действия с строкой">
                                <Settings className="size-4 text-muted-foreground" />
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
