"use client"

import * as React from "react"
import {
    ColumnDef,
    flexRender,
    Header,
    HeaderGroup,
    Row,
} from "@tanstack/react-table"
import { Loader2 } from "lucide-react"
import { TableVirtuoso, TableComponents } from "react-virtuoso"
import { TooltipProvider } from "@/shared/ui/tooltip"

import { cn } from "@/lib/utils"
import { Badge } from "@/shared/ui/badge"
import { useDataTableState } from "@/shared/hooks/use-data-table-state"
import { EmptyState } from "@/shared/ui/states"
import {
    dataTableAiContainerClassName,
    dataTableAiOverlayClassName,
    dataTableBodyRowClassName,
    dataTableContainerClassName,
    dataTableEmptyCellClassName,
    dataTableHeaderCellClassName,
    dataTableHeaderContentClassName,
    dataTableHeaderRowClassName,
    dataTableLoadingOverlayClassName,
    dataTableSortableHeaderTriggerClassName,
    dataTableStaticHeaderTriggerClassName,
} from "@/shared/ui/table-density"

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
}

type DataTableHeaderContentProps<TData> = {
    headerGroups: HeaderGroup<TData>[];
}

type DataTableHeaderCellProps<TData> = {
    header: Header<TData, unknown>;
}

type SortableHeaderTriggerProps = {
    children: React.ReactNode;
    onClick: React.MouseEventHandler<HTMLButtonElement> | undefined;
}

function SortableHeaderTrigger({ children, onClick }: SortableHeaderTriggerProps) {
    return (
        <button
            type="button"
            className={dataTableSortableHeaderTriggerClassName}
            onClick={onClick}
            aria-label="Сортировать столбец"
        >
            {children}
        </button>
    );
}

function HeaderCellContent<TData>({ header }: DataTableHeaderCellProps<TData>) {
    const content = (
        <div className={dataTableHeaderContentClassName}>
            {flexRender(
                header.column.columnDef.header,
                header.getContext(),
            )}
        </div>
    );

    if (header.column.getCanSort()) {
        return (
            <SortableHeaderTrigger onClick={header.column.getToggleSortingHandler()}>
                {content}
            </SortableHeaderTrigger>
        );
    }

    return (
        <div className={dataTableStaticHeaderTriggerClassName}>
            {content}
        </div>
    );
}

function DataTableHeaderCell<TData>({ header }: DataTableHeaderCellProps<TData>) {
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
            className={dataTableHeaderCellClassName}
            style={{ width: header.getSize() }}
            aria-sort={ariaSort}
        >
            {header.isPlaceholder ? null : <HeaderCellContent header={header} />}
        </th>
    );
}

function DataTableHeaderContent<TData>({ headerGroups }: DataTableHeaderContentProps<TData>) {
    return (
        <>
            {headerGroups.map((headerGroup) => (
                <tr key={headerGroup.id} className={dataTableHeaderRowClassName}>
                    {headerGroup.headers.map((header) => (
                        <DataTableHeaderCell key={header.id} header={header} />
                    ))}
                </tr>
            ))}
        </>
    );
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
                    className={dataTableBodyRowClassName}
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
        <DataTableHeaderContent headerGroups={table.getHeaderGroups()} />
    )

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
                        dataTableContainerClassName,
                        isAiMode && dataTableAiContainerClassName,
                        tableContainerClassName,
                    )}
                    style={{ contain: 'layout style paint' }}
                >
                    {loadingMore && (
                        <div className={dataTableLoadingOverlayClassName}>
                            <Badge
                                role="status"
                                aria-live="polite"
                                variant="neutral"
                                size="xs"
                            >
                                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                                <span>Загрузка...</span>
                            </Badge>
                        </div>
                    )}

                    {isAiMode && (
                        <div className={dataTableAiOverlayClassName} />
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
                                        className={dataTableEmptyCellClassName}
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
                            fixedHeaderContent={renderHeaderContent}
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
