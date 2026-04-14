"use client"

import {
    ColumnDef,
    flexRender,
    Row,
} from "@tanstack/react-table"
import { Search, Sparkles, Loader2 } from "lucide-react"
import { TableVirtuoso, TableComponents } from "react-virtuoso"
import { Skeleton } from "@/shared/ui/skeleton"
import { memo, useState, useCallback, forwardRef, HTMLAttributes, useMemo } from "react"

import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/shared/ui/tooltip"

import { cn } from "@/lib/utils"
import { Input } from "@/shared/ui/input"
import { Switch } from "@/shared/ui/switch"
import { useDataTableState } from "@/shared/hooks/use-data-table-state"
import { EmptyState } from "@/shared/ui/states"

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
    onEdit?: (row: TData) => void
    onDelete?: (row: TData) => void
}

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[]
    data: TData[]
    height?: string
    className?: string
    filterInputClassName?: string
    filterColumn?: string
    filterPlaceholder?: string
    meta?: TableMeta<TData>
    showAiSearch?: boolean
    onSearch?: (query: string) => void
    isAiMode?: boolean
    onAiModeChange?: (val: boolean) => void
    isLoading?: boolean
    isSearching?: boolean
    loadingMore?: boolean
    onEndReached?: () => void
    externalSearchValue?: string
    onSearchValueChange?: (val: string) => void
    actions?: React.ReactNode;
    emptyState?: React.ReactNode;
    getRowClassName?: (row: TData) => string;
    compactMobileToolbar?: boolean;
    showFilter?: boolean;
    tableMinWidth?: string | number;
    tableContainerClassName?: string;
}

const DataTableRow = memo(<TData,>({ row, className }: { row: Row<TData>, className?: string }) => {
    return (
        <>
            {row.getVisibleCells().map((cell) => (
                <td
                    key={cell.id}
                    className={cn(
                        "px-3 py-1.5 md:px-4 md:py-2 align-middle border-b transition-colors",
                        className
                    )}
                    style={{ width: cell.column.getSize() }}
                >
                    <div className="w-full text-[12px] leading-tight">
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
        prev.row.getIsSelected() === next.row.getIsSelected() &&
        prev.className === next.className;
});
DataTableRow.displayName = "DataTableRow";

export function DataTable<TData, TValue>({
    columns,
    data,
    height = "600px",
    className,
    filterInputClassName,
    filterColumn,
    filterPlaceholder = "Поиск...",
    meta,
    showAiSearch,
    onSearch,
    isAiMode: externalAiMode,
    onAiModeChange,
    isLoading,
    isSearching,
    loadingMore,
    externalSearchValue,
    onSearchValueChange,
    onEndReached,
    actions,
    emptyState,
    getRowClassName,
    compactMobileToolbar = false,
    showFilter = true,
    tableMinWidth = '800px',
    tableContainerClassName,
}: DataTableProps<TData, TValue>) {
    const [internalAiMode, setInternalAiMode] = useState(false)
    const hasFilterControls = Boolean(showFilter && filterColumn)

    const isAiMode = externalAiMode ?? internalAiMode;
    const setIsAiMode = onAiModeChange ?? setInternalAiMode;

    const {
        table,
        rows,
        flatHeaders,
        searchValue,
        setSearchValue,
    } = useDataTableState({
        data,
        columns,
        filterColumn,
        externalSearchValue,
        onSearchValueChange,
        isAiMode,
        meta,
    })

    const handleSearchClick = useCallback(() => {
        if (searchValue.trim()) {
            onSearch?.(searchValue)
        }
    }, [searchValue, onSearch]);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const virtuosoTableComponents = useMemo<TableComponents<Row<any>, { flatHeaders: unknown[] }>>(
        () => ({
            Table: ({ children, style, ...props }) => (
                <table
                    {...props}
                    style={{
                        ...style,
                        width: '100%',
                        minWidth: tableMinWidth,
                        tableLayout: 'fixed',
                        borderCollapse: 'separate',
                        borderSpacing: 0,
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
        }),
        [tableMinWidth]
    );


    const virtuosoOverscan = useMemo(() => {
        const parsedHeight = Number.parseInt(height, 10);
        if (Number.isFinite(parsedHeight) && parsedHeight > 0) {
            return Math.min(400, Math.max(200, Math.round(parsedHeight * 0.5)));
        }

        if (typeof window !== 'undefined') {
            return Math.min(400, Math.max(200, Math.round(window.innerHeight * 0.35)));
        }

        return 300;
    }, [height]);

    return (
        <TooltipProvider>
            <div className={cn("space-y-4", className)}>
                {/* Search Filter */}
                {(actions || hasFilterControls) && (
                    <div className={cn(
                        "justify-between px-1 md:px-0",
                        compactMobileToolbar
                            ? "flex items-center gap-2 xl:flex-row xl:items-center"
                            : "flex flex-col gap-3 xl:flex-row xl:items-center"
                    )}>
                        {/* Search Input & AI Toggle Group */}
                        {hasFilterControls ? (
                            <div className={cn(
                                "flex items-center gap-2 shrink-0",
                                compactMobileToolbar ? "w-full min-w-0 flex-1" : "w-full xl:w-auto"
                            )}>
                                <div className={cn(
                                    "relative flex-1 transition-all duration-300",
                                    compactMobileToolbar ? "min-w-0" : "min-w-[200px]",
                                    isAiMode ? "xl:w-[350px]" : "xl:w-[280px]"
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
                                            "pl-9 transition-all duration-300 w-full bg-background/50 backdrop-blur-sm h-9 text-[12px] placeholder:text-[12px] shadow-sm md:shadow-none",
                                            filterInputClassName,
                                            isAiMode ? (
                                                "border-indigo-400/50 focus-visible:ring-0 focus-visible:border-indigo-500 shadow-[0_0_15px_-5px_rgba(99,102,241,0.2)] pr-16"
                                            ) : (
                                                "focus-visible:ring-0 focus-visible:border-primary/40"
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
                                            className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center bg-linear-to-r from-indigo-500 to-purple-500 text-white px-2 py-0.5 rounded-full text-[12px] font-bold shadow-lg shadow-indigo-500/20 animate-in fade-in zoom-in duration-300"
                                        >
                                            AI
                                        </div>
                                    )}
                                </div>

                                {showAiSearch && onSearch && (
                                    <div className="flex shrink-0 items-center gap-2 px-2 h-9 rounded-lg border border-indigo-100 bg-indigo-50/30">
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <div className="flex items-center gap-3 cursor-help">
                                                    <Sparkles className={cn("h-4 w-4 shrink-0", isAiMode ? "text-indigo-600" : "text-muted-foreground")} />
                                                    <span className="text-[12px] font-medium text-muted-foreground whitespace-nowrap hidden sm:inline">Умный поиск</span>
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
                                            className="select-none"
                                        />
                                    </div>
                                )}
                            </div>
                        ) : null}

                        {/* Actions Group */}
                        {actions && (
                            <div
                                className={cn(
                                    "flex items-center gap-2 xl:justify-end overflow-x-auto xl:pb-0 scrollbar-hide",
                                    hasFilterControls ? "xl:w-auto" : "xl:w-full",
                                    compactMobileToolbar
                                        ? "w-auto justify-end shrink-0"
                                        : hasFilterControls
                                            ? "w-full justify-start"
                                            : "w-full justify-end"
                                )}
                                role="group"
                                aria-label="Действия таблицы"
                            >
                                {actions}
                            </div>
                        )}
                    </div>
                )}

                {/* Virtualized Table Container */}
                <div
                    className={cn(
                        "rounded-2xl border border-border/40 bg-card/50 backdrop-blur-md shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-x-auto relative",
                        isAiMode && "border-indigo-400/30 shadow-[0_0_30px_-5px_rgba(99,102,241,0.15)] ring-1 ring-indigo-500/20",
                        tableContainerClassName,
                    )}
                    style={{ contain: 'layout style paint' }}
                >
                    {loadingMore && (
                        <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center bg-background/18 backdrop-blur-[1px]">
                            <div
                                role="status"
                                aria-live="polite"
                                className="flex items-center gap-2 rounded-full border border-border/60 bg-card/90 px-3 py-1.5 text-[12px] font-medium text-muted-foreground shadow-lg"
                            >
                                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                                <span>Загрузка...</span>
                            </div>
                        </div>
                    )}

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
                            style={{ width: '100%', minWidth: tableMinWidth, tableLayout: 'fixed', borderCollapse: 'separate', borderSpacing: 0 }}
                        >
                            <thead className="z-40">
                                {table.getHeaderGroups().map((headerGroup) => (
                                    <tr key={headerGroup.id} className="bg-background shadow-[0_1px_0_0_rgba(0,0,0,0.08)]">
                                        {headerGroup.headers.map((header) => {
                                            const isSortable = header.column.getCanSort()
                                            const sortDirection = header.column.getIsSorted()
                                            const ariaSort = (isSortable
                                                ? sortDirection === "asc"
                                                    ? "ascending"
                                                    : sortDirection === "desc"
                                                        ? "descending"
                                                        : "none"
                                                : undefined) as React.HTMLAttributes<HTMLTableCellElement>["aria-sort"]

                                            return (
                                                <th
                                                    key={header.id}
                                                    className="h-10 px-3 md:px-4 text-left align-middle text-[11px] font-bold uppercase tracking-widest text-muted-foreground border-b border-border/50 transition-colors bg-muted/20"
                                                    style={{ width: `${header.getSize()}px` }}
                                                    aria-sort={ariaSort}
                                                >
                                                    {header.isPlaceholder ? null : (
                                                        isSortable ? (
                                                            <button
                                                                type="button"
                                                                className="flex items-center gap-2 select-none w-full text-left cursor-pointer transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60 rounded-sm"
                                                                onClick={header.column.getToggleSortingHandler()}
                                                                onKeyDown={(e) => {
                                                                    if (e.key === 'Enter' || e.key === ' ') {
                                                                        e.preventDefault();
                                                                        header.column.getToggleSortingHandler()?.(e);
                                                                    }
                                                                }}
                                                                aria-label="Сортировать столбец"
                                                            >
                                                                <div className="truncate flex-1 text-xs">
                                                                    {flexRender(
                                                                        header.column.columnDef.header,
                                                                        header.getContext()
                                                                    )}
                                                                </div>
                                                            </button>
                                                        ) : (
                                                            <div className="flex items-center gap-2 select-none w-full text-left cursor-default">
                                                                <div className="truncate flex-1 text-xs">
                                                                    {flexRender(
                                                                        header.column.columnDef.header,
                                                                        header.getContext()
                                                                    )}
                                                                </div>
                                                            </div>
                                                        )
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
                                        {emptyState ?? (
                                            <EmptyState
                                                title="Нет данных для отображения"
                                                className="py-2"
                                            />
                                        )}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    ) : (
                        <TableVirtuoso
                            style={{ height, width: '100%', willChange: 'transform' }}
                            data={rows}
                            context={{ flatHeaders }}
                            components={virtuosoTableComponents}
                            overscan={virtuosoOverscan}
                            endReached={onEndReached}
                            fixedHeaderContent={() => (
                                <>
                                    {table.getHeaderGroups().map((headerGroup) => (
                                        <tr key={headerGroup.id} className="bg-background shadow-[0_1px_0_0_rgba(0,0,0,0.08)]">
                                            {headerGroup.headers.map((header) => {
                                                const isSortable = header.column.getCanSort()
                                                const sortDirection = header.column.getIsSorted()
                                                const ariaSort = (isSortable
                                                    ? sortDirection === "asc"
                                                        ? "ascending"
                                                        : sortDirection === "desc"
                                                            ? "descending"
                                                            : "none"
                                                    : undefined) as React.HTMLAttributes<HTMLTableCellElement>["aria-sort"]

                                                return (
                                                    <th
                                                        key={header.id}
                                                        colSpan={header.colSpan}
                                                        className="h-10 px-3 md:px-4 text-left align-middle text-[11px] font-bold uppercase tracking-widest text-muted-foreground border-b border-border/50 transition-colors bg-muted/20"
                                                        style={{ width: header.getSize() }}
                                                        aria-sort={ariaSort}
                                                    >
                                                        {header.isPlaceholder ? null : (
                                                            isSortable ? (
                                                                <button
                                                                    type="button"
                                                                    className="flex items-center gap-2 select-none w-full text-left cursor-pointer transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60 rounded-sm"
                                                                    onClick={header.column.getToggleSortingHandler()}
                                                                    onKeyDown={(e) => {
                                                                        if (e.key === 'Enter' || e.key === ' ') {
                                                                            e.preventDefault();
                                                                            header.column.getToggleSortingHandler()?.(e);
                                                                        }
                                                                    }}
                                                                    aria-label="Сортировать столбец"
                                                                >
                                                                    <div className="truncate flex-1 text-xs">
                                                                        {flexRender(
                                                                            header.column.columnDef.header,
                                                                            header.getContext()
                                                                        )}
                                                                    </div>
                                                                </button>
                                                            ) : (
                                                                <div className="flex items-center gap-2 select-none w-full text-left cursor-default">
                                                                    <div className="truncate flex-1 text-xs">
                                                                        {flexRender(
                                                                            header.column.columnDef.header,
                                                                            header.getContext()
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            )
                                                        )}
                                                    </th>
                                                )
                                            })}
                                        </tr>
                                    ))}
                                </>
                            )}
                            itemContent={(_index, row: Row<TData>) => (
                                <DataTableRow 
                                    row={row} 
                                    className={getRowClassName?.(row.original)} 
                                />
                            )}
                        />
                    )}
                </div>



            </div>
        </TooltipProvider>
    );
}
