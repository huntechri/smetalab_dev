"use client"

import * as React from "react"
import { Row, flexRender } from "@tanstack/react-table"
import { cn } from "@/lib/utils"
import {
    dataTableBodyCellClassName,
    dataTableCellContentClassName,
} from "@/shared/ui/table-density"

interface DataTableRowProps<TData> {
    row: Row<TData>
    className?: string
}

export const DataTableRow = React.memo(<TData,>({ 
    row, 
    className 
}: DataTableRowProps<TData>) => {
    return (
        <>
            {row.getVisibleCells().map((cell) => (
                <td
                    key={cell.id}
                    className={cn(dataTableBodyCellClassName, className)}
                    style={{ width: cell.column.getSize() }}
                >
                    <div className={dataTableCellContentClassName}>
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
    return prev.row.original === next.row.original &&
        prev.row.getIsSelected() === next.row.getIsSelected() &&
        prev.className === next.className;
});

DataTableRow.displayName = "DataTableRow";
