"use client"

import { useDeferredValue, useEffect, useMemo, useState } from "react"
import {
    ColumnDef,
    ColumnFiltersState,
    SortingState,
    VisibilityState,
    TableMeta,
    getCoreRowModel,
    getFilteredRowModel,
    getSortedRowModel,
    useReactTable,
} from "@tanstack/react-table"

interface UseDataTableStateOptions<TData, TValue> {
    data: TData[]
    columns: ColumnDef<TData, TValue>[]
    filterColumn?: string
    externalSearchValue?: string
    onSearchValueChange?: (val: string) => void
    isAiMode?: boolean
    meta?: TableMeta<TData>
}

export function useDataTableState<TData, TValue>({
    data,
    columns,
    filterColumn,
    externalSearchValue,
    onSearchValueChange,
    isAiMode,
    meta,
}: UseDataTableStateOptions<TData, TValue>) {
    const [sorting, setSorting] = useState<SortingState>([])
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
    const [rowSelection, setRowSelection] = useState({})
    const [searchValue, setSearchValue] = useState(externalSearchValue ?? "")
    const deferredSearchValue = useDeferredValue(searchValue)

    useEffect(() => {
        if (externalSearchValue !== undefined && externalSearchValue !== searchValue) {
            setSearchValue(externalSearchValue)
        }
    }, [externalSearchValue, searchValue])

    const tableState = useMemo(() => ({
        sorting,
        columnFilters: (isAiMode || externalSearchValue) ? [] : columnFilters,
        columnVisibility,
        rowSelection,
    }), [sorting, columnFilters, isAiMode, externalSearchValue, columnVisibility, rowSelection])

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
        meta,
        state: tableState,
    })

    useEffect(() => {
        if (!isAiMode && filterColumn && !onSearchValueChange) {
            table.getColumn(filterColumn)?.setFilterValue(deferredSearchValue)
        }
    }, [deferredSearchValue, isAiMode, filterColumn, table, onSearchValueChange])

    useEffect(() => {
        if (!isAiMode && filterColumn && externalSearchValue === undefined) {
            const val = (table.getColumn(filterColumn)?.getFilterValue() as string) ?? ""
            setSearchValue(val)
        }
    }, [columnFilters, isAiMode, filterColumn, table, externalSearchValue])

    return {
        table,
        rows: table.getRowModel().rows,
        flatHeaders: table.getFlatHeaders(),
        searchValue,
        setSearchValue,
    }
}
