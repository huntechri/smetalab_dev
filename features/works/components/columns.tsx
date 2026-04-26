"use client"

import * as React from "react"
import { ColumnDef, Table, Row } from "@tanstack/react-table"
import { ChevronRight } from "lucide-react"
import { Button } from "@/shared/ui/button"
import { Badge } from "@/shared/ui/badge"
import { Input } from "@/shared/ui/input"
import { TableHeaderActions, TableRowActions } from "@/shared/ui/table-actions"

import { WorkRow } from "@/shared/types/domain/work-row"
import { UnitSelect } from "@/features/works/components/UnitSelect"
import { TableMeta } from "@/shared/ui/data-table"

interface RowActionsProps {
    row: { original: WorkRow };
    table: Table<WorkRow>;
}

const RowActions = React.memo(({ row, table }: RowActionsProps) => (
    <TableRowActions
        row={row.original}
        table={table}
        className="flex items-center justify-end md:pr-4 gap-1"
        actionMenuModal={false}
        insertLabel="Вставить строку ниже"
        insertTitle="Вставить строку ниже"
    />
))
RowActions.displayName = "RowActions"

const IndexCell = React.memo(({ row }: { row: Row<WorkRow> }) => {
    const isPlaceholder = row.original.isPlaceholder;
    const index = row.index + 1;

    return (
        <div className="relative group/cell flex items-center justify-center h-full min-h-[40px]">

            <div className="font-medium text-[12px] text-muted-foreground">
                {isPlaceholder ? "..." : index}
            </div>
        </div>
    );
});
IndexCell.displayName = "IndexCell";

const NameCell = React.memo(({ row, table }: { row: Row<WorkRow>; table: Table<WorkRow> }) => {
    const isPlaceholder = row.original.isPlaceholder;
    const meta = table.options.meta as TableMeta<WorkRow>

    if (isPlaceholder) {
        return (
            <Input
                placeholder="Наименование работы..."
                
                autoFocus
                value={row.original.name || ""}
                onChange={(e) => meta.updatePlaceholderRow?.(row.original.id, { name: e.target.value })}
           />
        )
    }

    const { phase, category, subcategory, name } = row.original;

    return (
        <div className="flex flex-col gap-1.5 py-1.5 min-w-0">
            <div className="text-[12px] font-normal truncate" title={name || undefined}>
                {name}
            </div>
            {(phase || category || subcategory) && (
                <div className="flex flex-wrap items-center gap-1 opacity-80 group-hover/row:opacity-100 transition-opacity">
                    {phase && (
                        <Badge variant="outline" className="h-[16px] rounded-full border-none bg-blue-50/70 px-1.5 py-0 text-[10px] font-medium leading-[16px] text-blue-700">
                            {phase}
                        </Badge>
                    )}
                    {category && (
                        <>
                            {phase && <ChevronRight className="h-2.5 w-2.5 text-muted-foreground/30" />}
                            <Badge variant="outline" className="h-[16px] rounded-full border-none bg-slate-100 px-1.5 py-0 text-[10px] font-medium leading-[16px] text-slate-700">
                                {category}
                            </Badge>
                        </>
                    )}
                    {subcategory && (
                        <>
                            {(phase || category) && <ChevronRight className="h-2.5 w-2.5 text-muted-foreground/30" />}
                            <Badge variant="outline" className="h-[16px] rounded-full border-none bg-indigo-50/70 px-1.5 py-0 text-[10px] font-medium leading-[16px] text-indigo-700">
                                {subcategory}
                            </Badge>
                        </>
                    )}
                </div>
            )}
        </div>
    );
});
NameCell.displayName = "NameCell";

const UnitCell = React.memo(({ row, table }: { row: Row<WorkRow>; table: Table<WorkRow> }) => {
    const isPlaceholder = row.original.isPlaceholder;
    const meta = table.options.meta as TableMeta<WorkRow>

    if (isPlaceholder) {
        return (
            <UnitSelect
                value={row.original.unit || ""}
                onChange={(val: string) => meta.updatePlaceholderRow?.(row.original.id, { unit: val })}
           />
        )
    }
    return <div className="text-center text-[12px] text-muted-foreground font-medium">{row.getValue("unit")}</div>
});
UnitCell.displayName = "UnitCell";

const PriceCell = React.memo(({ row, table }: { row: Row<WorkRow>; table: Table<WorkRow> }) => {
    const isPlaceholder = row.original.isPlaceholder;
    const meta = table.options.meta as TableMeta<WorkRow>

    if (isPlaceholder) {
        return (
            <Input
                type="number"
                placeholder="Цена"
                
                value={row.original.price || ""}
                onChange={(e) => meta.updatePlaceholderRow?.(row.original.id, { price: Number(e.target.value) })}
           />
        )
    }

    const priceValue = row.getValue("price");
    const formatted = React.useMemo(() => {
        const price = typeof priceValue === 'number' ? priceValue : parseFloat(String(priceValue));
        return new Intl.NumberFormat("ru-RU", {
            style: "currency",
            currency: "RUB",
            minimumFractionDigits: 0,
        }).format(isNaN(price) ? 0 : price);
    }, [priceValue]);

    return (
        <div className="text-center font-bold text-[12px] tracking-tighter text-foreground tabular-nums">
            {formatted}
        </div>
    )
});
PriceCell.displayName = "PriceCell";

export const columns: ColumnDef<WorkRow>[] = [
    {
        accessorKey: "index",
        header: "№",
        size: 60,
        cell: (props) => <IndexCell {...props} />,
        enableSorting: false,
    },
    {
        accessorKey: "name",
        header: "Наименование",
        size: 500,
        cell: (props) => <NameCell {...props} />,
    },
    {
        accessorKey: "unit",
        header: () => <div className="text-center">Ед. изм.</div>,
        size: 100,
        cell: (props) => <UnitCell {...props} />,
    },
    {
        accessorKey: "price",
        header: () => <div className="text-center">Цена</div>,
        size: 140,
        cell: (props) => <PriceCell {...props} />,
    },
    {
        id: "actions",
        header: ({ table }) => (
            <TableHeaderActions
                table={table}
                className="flex justify-end pr-6 items-center gap-1"
                trigger={
                    <Button variant="ghost" aria-label="Действия" title="Действия">
                        Действия
                    </Button>
                }
            />
        ),
        size: 90,
        cell: ({ row, table }) => <RowActions row={row} table={table} />,
    },
]
