"use client"

import {
    ColumnDef,
    ColumnFiltersState,
    SortingState,
    VisibilityState,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getSortedRowModel,
    useReactTable,
    Row,
} from "@tanstack/react-table"
import { ChevronDown, ChevronUp, ChevronsUpDown, Search, Sparkles, Loader2 } from "lucide-react"
import { TableVirtuoso, TableComponents } from "react-virtuoso"
import { Skeleton } from "@/components/ui/skeleton"
import { useDeferredValue, memo, useMemo, useState, useEffect, useCallback, useTransition, forwardRef, HTMLAttributes } from "react"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { useToast } from "@/components/ui/use-toast"

import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"

import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"

/* -------------------------------------------------------------------------- */
/*                               DataTable                                    */
/* -------------------------------------------------------------------------- */

export interface TableMeta<TData> {
    onInsertRequest?: (id?: string) => void
    onCancelInsert?: () => void
    onSaveInsert?: (id: string) => void
    updatePlaceholderRow?: (id: string, data: Partial<TData>) => void
    onReorder?: () => void
    setEditingRow?: (row: TData | null) => void
    setDeletingRow?: (row: TData | null) => void
}

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[]
    data: TData[]
    height?: string
    filterColumn?: string
    filterPlaceholder?: string
    meta?: TableMeta<TData>
    showAiSearch?: boolean
    onSearch?: (query: string) => void
    isAiMode?: boolean
    onAiModeChange?: (val: boolean) => void
    isLoading?: boolean
    isSearching?: boolean
    onEndReached?: () => void
    externalSearchValue?: string
    onSearchValueChange?: (val: string) => void
    actions?: React.ReactNode
    onRowUpdate?: (id: string, data: Partial<TData>) => Promise<{ success: boolean; message?: string }>
    onRowDelete?: (id: string) => Promise<{ success: boolean; message?: string }>
    editDialogFields?: (data: TData, onChange: (field: string, val: unknown) => void) => React.ReactNode
}

// --- Stable Virtuoso Components ---
const VirtuosoTableComponents: TableComponents<Row<unknown>, { flatHeaders: unknown[] }> = {
    Table: ({ children, style, ...props }) => (
        <table
            {...props}
            style={{
                ...style,
                width: '100%',
                minWidth: '800px',
                tableLayout: 'fixed',
                borderCollapse: 'separate',
                borderSpacing: 0
            }}
        >
            {children}
        </table>
    ),
    TableHead: forwardRef<HTMLTableSectionElement, HTMLAttributes<HTMLTableSectionElement>>((props, ref) => (
        <thead {...props} ref={ref} className="z-40" />
    )),
    TableRow: ({ style, ...props }) => (
        <tr
            {...props}
            style={style}
            className="border-b last:border-0 hover:bg-muted/60 transition-colors group/row cursor-default animate-in fade-in slide-in-from-left-1 duration-300"
        />
    ),
    TableBody: forwardRef<HTMLTableSectionElement, HTMLAttributes<HTMLTableSectionElement>>((props, ref) => (
        <tbody {...props} ref={ref} />
    )),
};

interface DataTableRowProps<TData> {
    row: Row<TData>;
}

const DataTableRow = memo(<TData,>({ row }: DataTableRowProps<TData>) => {
    return (
        <>
            {row.getVisibleCells().map((cell) => (
                <td
                    key={cell.id}
                    className="p-2.5 md:p-3 align-middle border-b border-r last:border-r-0"
                    style={{ width: cell.column.getSize() }}
                >
                    <div className="w-full text-xs md:text-sm">
                        {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                        )}
                    </div>
                </td>
            ))}
        </>
    );
}, (prev, next) => {
    // Only re-render if the actual row data or selected state changes
    return prev.row.original === next.row.original &&
        prev.row.getIsSelected() === next.row.getIsSelected();
});
DataTableRow.displayName = "DataTableRow";

export function DataTable<TData, TValue>({
    columns,
    data,
    height = "600px",
    filterColumn,
    filterPlaceholder = "Поиск...",
    meta,
    showAiSearch,
    onSearch,
    isAiMode: externalAiMode,
    onAiModeChange,
    isLoading,
    isSearching,
    externalSearchValue,
    onSearchValueChange,
    onEndReached,
    actions,
    onRowUpdate,
    onRowDelete,
    editDialogFields,
}: DataTableProps<TData, TValue>) {
    const [sorting, setSorting] = useState<SortingState>([])
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
    const [rowSelection, setRowSelection] = useState({})
    const [internalAiMode, setInternalAiMode] = useState(false)

    const isAiMode = externalAiMode ?? internalAiMode;
    const setIsAiMode = onAiModeChange ?? setInternalAiMode;

    const [searchValue, setSearchValue] = useState("")
    const deferredSearchValue = useDeferredValue(searchValue)
    const { toast } = useToast()
    const [editingRow, setEditingRow] = useState<TData | null>(null)
    const [deletingRow, setDeletingRow] = useState<TData | null>(null)
    const [isUpdating, startUpdateTransition] = useTransition()
    const [isDeleting, startDeleteTransition] = useTransition()

    // Form data for editing
    const [editFormData, setEditFormData] = useState<TData | null>(null)

    useEffect(() => {
        if (editingRow) {
            setEditFormData({ ...editingRow })
        } else {
            setEditFormData(null)
        }
    }, [editingRow])

    const handleUpdate = (e: React.FormEvent) => {
        e.preventDefault()
        if (!editingRow || !editFormData || !onRowUpdate) return
        startUpdateTransition(async () => {
            const result = await onRowUpdate((editingRow as unknown as { id: string }).id, editFormData)
            if (result.success) {
                toast({ title: "Запись обновлена", description: result.message })
                setEditingRow(null)
            } else {
                toast({ variant: "destructive", title: "Ошибка", description: result.message })
            }
        })
    }

    const handleDelete = () => {
        if (!deletingRow || !onRowDelete) return
        startDeleteTransition(async () => {
            const result = await onRowDelete((deletingRow as unknown as { id: string }).id)
            if (result.success) {
                toast({ title: "Запись удалена", description: result.message })
                setDeletingRow(null)
            } else {
                toast({ variant: "destructive", title: "Ошибка", description: result.message })
            }
        })
    }

    const tableState = useMemo(() => ({
        sorting,
        columnFilters: (isAiMode || externalSearchValue) ? [] : columnFilters,
        columnVisibility,
        rowSelection,
    }), [sorting, columnFilters, isAiMode, externalSearchValue, columnVisibility, rowSelection]);

    const table = useReactTable({
        data,
        columns,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,
        getRowId: (row) => (row as unknown as { id: string }).id,
        meta: {
            ...meta,
            setEditingRow,
            setDeletingRow
        },
        state: tableState,
    })

    // Unified debounced/deferred search for table filtering
    useEffect(() => {
        if (!isAiMode && filterColumn && !onSearchValueChange) {
            table.getColumn(filterColumn)?.setFilterValue(deferredSearchValue)
        }
    }, [deferredSearchValue, isAiMode, filterColumn, table, onSearchValueChange]);

    // Sync input with table filter (if changed externally)
    useEffect(() => {
        if (!isAiMode && filterColumn) {
            const val = (table.getColumn(filterColumn)?.getFilterValue() as string) ?? "";
            setSearchValue(val);
        }
    }, [columnFilters, isAiMode, filterColumn, table]);

    const { rows } = table.getRowModel()
    const flatHeaders = table.getFlatHeaders();

    const handleSearchClick = useCallback(() => {
        if (searchValue.trim()) {
            onSearch?.(searchValue)
        }
    }, [searchValue, onSearch]);

    return (
        <TooltipProvider>
            <div className="space-y-4">
                {/* Search Filter */}
                {filterColumn && (
                    <div className="flex flex-col gap-2 px-1 md:px-0 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center">
                            <div className={cn(
                                "relative flex-1 sm:max-w-sm group/search transition-all duration-300",
                                isAiMode && "sm:max-w-md"
                            )}>
                                {isSearching ? (
                                    <Loader2 aria-hidden="true" className="absolute left-3 h-4 w-4 top-1/2 -translate-y-1/2 text-indigo-500 animate-spin" />
                                ) : (
                                    <Search aria-hidden="true" className={cn(
                                        "absolute left-3 h-4 w-4 top-1/2 -translate-y-1/2 transition-colors duration-200",
                                        isAiMode ? "text-indigo-500" : "text-muted-foreground group-focus-within/search:text-primary"
                                    )} />
                                )}
                                <Input
                                    aria-label={filterPlaceholder}
                                    placeholder={isAiMode ? "Опишите, что нужно найти (ИИ)..." : filterPlaceholder}
                                    value={searchValue}
                                    onChange={(event) => {
                                        const val = event.target.value
                                        setSearchValue(val)
                                        onSearchValueChange?.(val)

                                        if (val === "") {
                                            onSearch?.("")
                                        }
                                    }}
                                    className={cn(
                                        "pl-9 transition-all duration-300 w-full bg-background/50 backdrop-blur-sm",
                                        isAiMode ? (
                                            "border-indigo-400/50 ring-indigo-400/20 focus-visible:ring-indigo-500/30 focus-visible:border-indigo-500 shadow-[0_0_15px_-5px_rgba(99,102,241,0.2)] pr-16"
                                        ) : (
                                            "focus-visible:ring-primary/20"
                                        )
                                    )}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            handleSearchClick()
                                        }
                                    }}
                                />
                                {isAiMode && (
                                    <div
                                        role="status"
                                        aria-live="polite"
                                        className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center bg-linear-to-r from-indigo-500 to-purple-500 text-white px-2 py-0.5 rounded-full text-[9px] font-bold shadow-lg shadow-indigo-500/20 animate-in fade-in zoom-in duration-300"
                                    >
                                        AI MAGIC
                                    </div>
                                )}
                            </div>
                            {showAiSearch && onSearch && (
                                <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg border border-indigo-100 bg-indigo-50/30 w-full sm:w-auto justify-between sm:justify-start">
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <div className="flex items-center gap-2 cursor-help">
                                                <Sparkles className={cn("h-4 w-4 shrink-0", isAiMode ? "text-indigo-600" : "text-muted-foreground")} />
                                                <span className="text-xs font-medium text-muted-foreground whitespace-nowrap hidden sm:inline">Умный поиск</span>
                                            </div>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>Поиск по смыслу с использованием ИИ</p>
                                        </TooltipContent>
                                    </Tooltip>
                                    <Switch
                                        checked={isAiMode}
                                        onCheckedChange={(checked) => {
                                            setIsAiMode(checked)
                                            if (searchValue.trim() && checked) {
                                                onSearch?.(searchValue)
                                            }
                                        }}
                                        aria-label="Переключатель ИИ поиска"
                                    />
                                </div>
                            )}
                        </div>
                        {actions && (
                            <div className="flex flex-wrap gap-2 w-full sm:w-auto" role="group" aria-label="Действия таблицы">
                                {actions}
                            </div>
                        )}
                    </div>
                )}

                {/* Virtualized Table Container */}
                <div
                    className={cn(
                        "rounded-2xl border border-border/60 bg-card shadow-sm overflow-x-auto relative",
                        isAiMode && "border-indigo-400/30 shadow-[0_0_20px_-5px_rgba(99,102,241,0.15)] ring-1 ring-indigo-500/10"
                    )}
                    style={{ contain: 'layout style paint' }}
                >
                    {isAiMode && (
                        <div className="absolute inset-0 bg-linear-to-br from-indigo-500/2 via-transparent to-purple-500/2 pointer-events-none" />
                    )}
                    {isLoading || (isSearching && rows.length === 0) ? (
                        <div className="p-4 space-y-4">
                            {[...Array(5)].map((_, i) => (
                                <div key={i} className="flex items-center space-x-4">
                                    <Skeleton className="h-10 w-12 rounded-lg" />
                                    <Skeleton className="h-10 flex-1 rounded-lg" />
                                    <Skeleton className="h-10 w-24 rounded-lg" />
                                    <Skeleton className="h-10 w-32 rounded-lg" />
                                </div>
                            ))}
                        </div>
                    ) : rows.length === 0 ? (
                        <table
                            style={{ width: '100%', tableLayout: 'fixed', borderCollapse: 'separate', borderSpacing: 0 }}
                        >
                            <thead className="z-40">
                                {table.getHeaderGroups().map((headerGroup) => (
                                    <tr key={headerGroup.id} className="bg-background shadow-[0_1px_0_0_rgba(0,0,0,0.08)]">
                                        {headerGroup.headers.map((header) => {
                                            const isSortable = header.column.getCanSort()
                                            const sortDirection = header.column.getIsSorted()

                                            return (
                                                <th
                                                    key={header.id}
                                                    className="h-10 md:h-11 px-2.5 md:px-3 text-left align-middle text-[11px] md:text-xs uppercase tracking-[0.2em] text-muted-foreground border-b border-r last:border-r-0 transition-colors"
                                                    style={{ width: header.getSize() }}
                                                >
                                                    {header.isPlaceholder ? null : (
                                                        <div
                                                            className={cn(
                                                                "flex items-center gap-2 select-none w-full",
                                                                isSortable && "cursor-pointer hover:text-foreground"
                                                            )}
                                                            onClick={header.column.getToggleSortingHandler()}
                                                        >
                                                            <div className="truncate flex-1 text-xs md:text-sm">
                                                                {flexRender(
                                                                    header.column.columnDef.header,
                                                                    header.getContext()
                                                                )}
                                                            </div>
                                                            {isSortable && (
                                                                <div className="shrink-0 w-4">
                                                                    {sortDirection === "asc" ? (
                                                                        <ChevronUp className="h-4 w-4" />
                                                                    ) : sortDirection === "desc" ? (
                                                                        <ChevronDown className="h-4 w-4" />
                                                                    ) : (
                                                                        <ChevronsUpDown className="h-4 w-4 opacity-30" />
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                </th>
                                            )
                                        })}
                                    </tr>
                                ))}
                            </thead>
                            <tbody>
                                <tr>
                                    <td
                                        colSpan={flatHeaders.length}
                                        className="px-3 py-8 text-center text-sm text-muted-foreground"
                                    >
                                        Нет данных для отображения
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    ) : (
                        <TableVirtuoso
                            style={{ height, width: '100%', willChange: 'transform' }}
                            data={rows}
                            context={{ flatHeaders }}
                            components={VirtuosoTableComponents}
                            overscan={2000}
                            endReached={onEndReached}
                            fixedHeaderContent={() => (
                                <>
                                    {table.getHeaderGroups().map((headerGroup) => (
                                        <tr key={headerGroup.id} className="bg-background shadow-[0_1px_0_0_rgba(0,0,0,0.08)]">
                                            {headerGroup.headers.map((header) => {
                                                const isSortable = header.column.getCanSort()
                                                const sortDirection = header.column.getIsSorted()

                                                return (
                                                    <th
                                                        key={header.id}
                                                        className={cn(
                                                            "h-10 md:h-11 px-2.5 md:px-3 text-left align-middle text-[10px] md:text-[11px] uppercase tracking-wider font-semibold text-muted-foreground border-b border-r last:border-r-0 transition-colors bg-muted/30",
                                                            isAiMode && "border-indigo-100/50 text-indigo-900/60"
                                                        )}
                                                        style={{ width: header.getSize() }}
                                                    >
                                                        {header.isPlaceholder ? null : (
                                                            <div
                                                                className={cn(
                                                                    "flex items-center gap-2 select-none w-full",
                                                                    isSortable && "cursor-pointer hover:text-foreground"
                                                                )}
                                                                onClick={header.column.getToggleSortingHandler()}
                                                            >
                                                                <div className="truncate flex-1 text-xs md:text-sm">
                                                                    {flexRender(
                                                                        header.column.columnDef.header,
                                                                        header.getContext()
                                                                    )}
                                                                </div>
                                                                {isSortable && (
                                                                    <div className="shrink-0 w-4">
                                                                        {sortDirection === "asc" ? (
                                                                            <ChevronUp className="h-4 w-4" />
                                                                        ) : sortDirection === "desc" ? (
                                                                            <ChevronDown className="h-4 w-4" />
                                                                        ) : (
                                                                            <ChevronsUpDown className="h-4 w-4 opacity-30" />
                                                                        )}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}
                                                    </th>
                                                )
                                            })}
                                        </tr>
                                    ))}
                                </>
                            )}
                            itemContent={(_index, row) => (
                                <DataTableRow row={row} />
                            )}
                        />
                    )}
                </div>

                {/* Footer / Row Count */}
                <div className="flex items-center justify-between px-1 md:px-0">
                    <div className="text-xs md:text-sm text-muted-foreground font-medium">
                        Всего записей: <span className="text-foreground">{data.length}</span>
                        {table.getFilteredRowModel().rows.length !== data.length && (
                            <> (отфильтровано: <span className="text-foreground">{table.getFilteredRowModel().rows.length}</span>)</>
                        )}
                    </div>
                </div>

                {/* --- Shared Dialog Manager --- */}
                <Dialog open={!!editingRow} onOpenChange={(open) => !open && setEditingRow(null)}>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>Изменить запись</DialogTitle>
                            <DialogDescription>Внесите изменения и нажмите сохранить.</DialogDescription>
                        </DialogHeader>
                        {editFormData && onRowUpdate && (
                            <form onSubmit={handleUpdate} className="grid gap-4 py-4">
                                {editDialogFields ? (
                                    editDialogFields(editFormData, (field, val) => setEditFormData({ ...editFormData, [field]: val } as unknown as TData))
                                ) : (
                                    <div className="text-sm text-muted-foreground p-4 text-center">
                                        Форма редактирования не настроена
                                    </div>
                                )}
                                <DialogFooter>
                                    <Button type="submit" disabled={isUpdating} className="h-9 px-8">
                                        {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        Сохранить
                                    </Button>
                                </DialogFooter>
                            </form>
                        )}
                    </DialogContent>
                </Dialog>

                <AlertDialog open={!!deletingRow} onOpenChange={(open) => !open && setDeletingRow(null)}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Вы уверены?</AlertDialogTitle>
                            <AlertDialogDescription>
                                Запись {(deletingRow as unknown as { name?: string })?.name ? `"${(deletingRow as unknown as { name?: string }).name}"` : ""} будет удалена безвозвратно.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Отмена</AlertDialogCancel>
                            <AlertDialogAction
                                onClick={(e) => {
                                    e.preventDefault()
                                    handleDelete()
                                }}
                                className="bg-red-700 text-white hover:bg-red-800"
                                disabled={isDeleting}
                            >
                                {isDeleting ? "Удаление..." : "Удалить"}
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </TooltipProvider>
    );
}