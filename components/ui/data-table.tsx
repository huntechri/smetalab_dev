"use client"

import {
    ColumnDef,
    flexRender,
    Row,
} from "@tanstack/react-table"
import { ChevronDown, ChevronUp, ChevronsUpDown, Search, Sparkles, Loader2 } from "lucide-react"
import { TableVirtuoso, TableComponents } from "react-virtuoso"
import { Skeleton } from "@/components/ui/skeleton"
import { memo, useState, useCallback, forwardRef, HTMLAttributes } from "react"

import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"

import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { useDataTableState } from "@/hooks/use-data-table-state"
import { EmptyState } from "@/components/ui/states"

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
    emptyState?: React.ReactNode
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
                    className="p-3 md:p-4 align-middle border-b transition-colors"
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
    emptyState,
}: DataTableProps<TData, TValue>) {
    const [internalAiMode, setInternalAiMode] = useState(false)

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
                        "rounded-2xl border border-border/40 bg-card/50 backdrop-blur-md shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-x-auto relative",
                        isAiMode && "border-indigo-400/30 shadow-[0_0_30px_-5px_rgba(99,102,241,0.15)] ring-1 ring-indigo-500/20"
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
                                            const ariaSort = isSortable
                                                ? sortDirection === "asc"
                                                    ? "ascending"
                                                    : sortDirection === "desc"
                                                        ? "descending"
                                                        : "none"
                                                : undefined

                                            return (
                                                <th
                                                    key={header.id}
                                                    className="h-12 px-3 md:px-4 text-left align-middle text-xs font-semibold text-muted-foreground border-b transition-colors bg-muted/5 font-medium tracking-tight"
                                                    style={{ width: header.getSize() }}
                                                    aria-sort={ariaSort}
                                                >
                                                    {header.isPlaceholder ? null : (
                                                        isSortable ? (
                                                            <button
                                                                type="button"
                                                                className="flex items-center gap-2 select-none w-full text-left cursor-pointer hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60 rounded-sm"
                                                                onClick={header.column.getToggleSortingHandler()}
                                                                onKeyDown={(e) => {
                                                                    if (e.key === 'Enter' || e.key === ' ') {
                                                                        e.preventDefault();
                                                                        header.column.getToggleSortingHandler()?.(e);
                                                                    }
                                                                }}
                                                                aria-label="Сортировать столбец"
                                                            >
                                                                <div className="truncate flex-1 text-xs md:text-sm">
                                                                    {flexRender(
                                                                        header.column.columnDef.header,
                                                                        header.getContext()
                                                                    )}
                                                                </div>
                                                                <div className="shrink-0 w-4" aria-hidden="true">
                                                                    {sortDirection === "asc" ? (
                                                                        <ChevronUp className="h-4 w-4" />
                                                                    ) : sortDirection === "desc" ? (
                                                                        <ChevronDown className="h-4 w-4" />
                                                                    ) : (
                                                                        <ChevronsUpDown className="h-4 w-4 opacity-30" />
                                                                    )}
                                                                </div>
                                                            </button>
                                                        ) : (
                                                            <div className="flex items-center gap-2 select-none w-full text-left cursor-default">
                                                                <div className="truncate flex-1 text-xs md:text-sm">
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
                                                const ariaSort = isSortable
                                                    ? sortDirection === "asc"
                                                        ? "ascending"
                                                        : sortDirection === "desc"
                                                            ? "descending"
                                                            : "none"
                                                    : undefined

                                                return (
                                                    <th
                                                        key={header.id}
                                                        className={cn(
                                                            "h-12 px-3 md:px-4 text-left align-middle text-xs font-semibold text-muted-foreground/70 border-b tracking-tight transition-colors bg-muted/5 backdrop-blur-sm",
                                                            isAiMode && "border-indigo-100/50 text-indigo-900/60 bg-indigo-50/10"
                                                        )}
                                                        style={{ width: header.getSize() }}
                                                        aria-sort={ariaSort}
                                                    >
                                                        {header.isPlaceholder ? null : (
                                                            isSortable ? (
                                                                <button
                                                                    type="button"
                                                                    className="flex items-center gap-2 select-none w-full text-left cursor-pointer hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60 rounded-sm"
                                                                    onClick={header.column.getToggleSortingHandler()}
                                                                    onKeyDown={(e) => {
                                                                        if (e.key === 'Enter' || e.key === ' ') {
                                                                            e.preventDefault();
                                                                            header.column.getToggleSortingHandler()?.(e);
                                                                        }
                                                                    }}
                                                                    aria-label="Сортировать столбец"
                                                                >
                                                                    <div className="truncate flex-1 text-xs md:text-sm">
                                                                        {flexRender(
                                                                            header.column.columnDef.header,
                                                                            header.getContext()
                                                                        )}
                                                                    </div>
                                                                    <div className="shrink-0 w-4" aria-hidden="true">
                                                                        {sortDirection === "asc" ? (
                                                                            <ChevronUp className="h-4 w-4" />
                                                                        ) : sortDirection === "desc" ? (
                                                                            <ChevronDown className="h-4 w-4" />
                                                                        ) : (
                                                                            <ChevronsUpDown className="h-4 w-4 opacity-30" />
                                                                        )}
                                                                    </div>
                                                                </button>
                                                            ) : (
                                                                <div className="flex items-center gap-2 select-none w-full text-left cursor-default">
                                                                    <div className="truncate flex-1 text-xs md:text-sm">
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
                            itemContent={(_index, row) => (
                                <DataTableRow row={row} />
                            )}
                        />
                    )}
                </div>



            </div>
        </TooltipProvider>
    );
}

