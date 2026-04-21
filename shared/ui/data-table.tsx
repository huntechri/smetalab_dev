"use client"

import * as React from "react"
import {
    ColumnDef,
    flexRender,
    Row,
} from "@tanstack/react-table"
import { Loader2 } from "lucide-react"
import { TableVirtuoso, TableComponents } from "react-virtuoso"
import { TooltipProvider } from "@/shared/ui/tooltip"

import { cn } from "@/lib/utils"
import { useDataTableState } from "@/shared/hooks/use-data-table-state"
import { EmptyState } from "@/shared/ui/states"

import { DataTableRow } from "./data-table/data-table-row"
import { DataTableToolbar } from "./data-table/data-table-toolbar"
import { DataTableSkeleton } from "./data-table/data-table-skeleton"

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

export interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[]
    data: TData[]
    height?: string
    className?: string
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
    enableVirtualization?: boolean;
}

export function DataTable<TData, TValue>({
    columns,
    data,
    height = "600px",
    className,
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
    enableVirtualization = false,
}: DataTableProps<TData, TValue>) {
    const [internalAiMode, setInternalAiMode] = React.useState(false)
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

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const virtuosoTableComponents = React.useMemo<TableComponents<Row<any>, { flatHeaders: unknown[] }>>(
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
            TableHead: React.forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>((props, ref) => (
                <thead {...props} ref={ref} className="z-40" />
            )),
            TableRow: ({ style, ...props }) => (
                <tr
                    {...props}
                    style={style}
                    className="border-b last:border-0 hover:bg-muted/60 transition-colors group/row cursor-default animate-in fade-in slide-in-from-left-1 duration-300"
                />
            ),
            TableBody: React.forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>((props, ref) => (
                <tbody {...props} ref={ref} />
            )),
        }),
        [tableMinWidth]
    );

    const virtuosoOverscan = React.useMemo(() => {
        const parsedHeight = Number.parseInt(height, 10);
        if (Number.isFinite(parsedHeight) && parsedHeight > 0) {
            return Math.min(400, Math.max(200, Math.round(parsedHeight * 0.5)));
        }

        if (typeof window !== 'undefined') {
            return Math.min(400, Math.max(200, Math.round(window.innerHeight * 0.35)));
        }

        return 300;
    }, [height]);

    const renderHeaderContent = () => (
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
    )

    const shouldVirtualize = enableVirtualization;

    return (
        <TooltipProvider>
            <div className={cn("space-y-4", className)}>
                <DataTableToolbar
                    actions={actions}
                    filterPlaceholder={filterPlaceholder}
                    hasFilterControls={hasFilterControls}
                    isAiMode={isAiMode}
                    isSearching={isSearching}
                    onSearch={onSearch}
                    onSearchValueChange={onSearchValueChange}
                    searchValue={searchValue}
                    setIsAiMode={setIsAiMode}
                    setSearchValue={setSearchValue}
                    showAiSearch={showAiSearch}
                    compactMobileToolbar={compactMobileToolbar}
                />

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
                        <DataTableSkeleton />
                    ) : rows.length === 0 ? (
                        <table
                            style={{ width: '100%', minWidth: tableMinWidth, tableLayout: 'fixed', borderCollapse: 'separate', borderSpacing: 0 }}
                        >
                            <thead className="z-40">
                                {renderHeaderContent()}
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
                    ) : shouldVirtualize ? (
                        <TableVirtuoso
                            style={{ height, width: '100%', willChange: 'transform' }}
                            data={rows}
                            context={{ flatHeaders }}
                            components={virtuosoTableComponents}
                            overscan={virtuosoOverscan}
                            endReached={onEndReached}
                            fixedHeaderContent={renderHeaderContent}
                            itemContent={(_index, row: Row<TData>) => (
                                <DataTableRow 
                                    row={row} 
                                    className={getRowClassName?.(row.original)} 
                                />
                            )}
                        />
                    ) : (
                        <div style={{ height, width: '100%', overflowY: 'auto' }}>
                            <table
                                style={{ width: '100%', minWidth: tableMinWidth, tableLayout: 'fixed', borderCollapse: 'separate', borderSpacing: 0 }}
                            >
                                <thead className="z-40 sticky top-0 bg-background">
                                    {renderHeaderContent()}
                                </thead>
                                <tbody>
                                    {rows.map((row) => (
                                        <tr
                                            key={row.id}
                                            className="border-b last:border-0 hover:bg-muted/60 transition-colors group/row cursor-default"
                                        >
                                            <DataTableRow
                                                row={row}
                                                className={getRowClassName?.(row.original)}
                                            />
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </TooltipProvider>
    );
}
