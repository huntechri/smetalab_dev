"use client"

import * as React from "react"
import { Row, flexRender } from "@tanstack/react-table"
import { cn } from "@/lib/utils"

interface DataTableRowProps<TData> {
    row: Row<TData>
    className?: string
    disableColumnWidth?: boolean
}

export const DataTableRow = React.memo(<TData,>({ 
    row, 
    className,
    disableColumnWidth = false,
}: DataTableRowProps<TData>) => {
    return (
        <>
            {row.getVisibleCells().map((cell) => (
                <td
                    key={cell.id}
                    className={cn(
                        "px-3 py-1.5 md:px-4 md:py-2 align-middle border-b transition-colors whitespace-normal break-words",
                        className
                    )}
                    style={disableColumnWidth ? undefined : { width: cell.column.getSize() }}
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
    return prev.row.original === next.row.original &&
        prev.row.getIsSelected() === next.row.getIsSelected() &&
        prev.className === next.className &&
        prev.disableColumnWidth === next.disableColumnWidth;
});

DataTableRow.displayName = "DataTableRow";
