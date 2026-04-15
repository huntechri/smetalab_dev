'use client';

import { useMemo, useState } from 'react';
import {
    getCoreRowModel,
    getFilteredRowModel,
    getSortedRowModel,
    SortingState,
    useReactTable,
} from '@tanstack/react-table';
import type { EstimateProcurementRow } from '@/shared/types/estimate-procurement';
import { columns } from '../components/procurement/estimate-procurement-columns';

export function useEstimateProcurementTable(data: EstimateProcurementRow[]) {
    const [sorting, setSorting] = useState<SortingState>([]);
    const [globalFilter, setGlobalFilter] = useState('');

    const table = useReactTable({
        data,
        columns,
        state: {
            sorting,
            globalFilter,
        },
        onSortingChange: setSorting,
        onGlobalFilterChange: setGlobalFilter,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
    });

    const totals = useMemo(() => {
        return data.reduce(
            (acc, row) => ({
                plannedAmount: acc.plannedAmount + row.plannedAmount,
                actualAmount: acc.actualAmount + row.actualAmount,
                amountDelta: acc.amountDelta + row.amountDelta,
            }),
            { plannedAmount: 0, actualAmount: 0, amountDelta: 0 }
        );
    }, [data]);

    return {
        table,
        globalFilter,
        setGlobalFilter,
        totals,
    };
}
