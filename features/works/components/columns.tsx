"use client"

import * as React from "react"
import { ColumnDef, Table, Row } from "@tanstack/react-table"
import { Pencil, Settings, Trash, Plus, Check, X, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/shared/ui/badge"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu"
import { Input } from "@/shared/ui/input"
import { cva } from "class-variance-authority"

import { WorkRow } from "@/shared/types/domain/work-row"
import { UnitSelect } from "@/features/works/components/UnitSelect"
import { TableMeta } from "@/shared/ui/data-table"

interface RowActionsProps {
    row: { original: WorkRow };
    table: Table<WorkRow>;
}

const actionButtonStyles = cva("", {
    variants: {
        tone: {
            primary: "text-primary",
            muted: "",
        },
    },
    defaultVariants: {
        tone: "muted",
    },
})

const insertButtonStyles = cva("", {
    variants: {
        tone: {
            success: "text-green-600 hover:text-green-700",
            danger: "text-destructive",
        },
    },
})



const RowActions = React.memo(({ row, table }: RowActionsProps) => {
    const meta = table.options.meta as TableMeta<WorkRow> & {
        setEditingRow?: (row: WorkRow | null) => void;
        setDeletingRow?: (row: WorkRow | null) => void;
    };

    if (row.original.isPlaceholder) {
        return (
            <div className="flex gap-1 justify-end pr-2">
                <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => meta.onSaveInsert?.(row.original.id)}
                    aria-label="Сохранить строку"
                    title="Сохранить строку"
               >
                    <Check className="h-4 w-4" />
                </Button>
                <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => meta.onCancelInsert?.()}
                    aria-label="Отменить вставку"
                    title="Отменить вставку"
               >
                    <X className="h-4 w-4" />
                </Button>
            </div>
        )
    }

    return (
        <div className="flex items-center justify-end md:pr-4 gap-1">
            <Button
                variant="ghost"
                size="icon"
                onClick={() => meta?.onInsertRequest?.(row.original.id)}
                aria-label="Вставить строку ниже"
                title="Вставить строку ниже"
           >
                <Plus className="h-4 w-4" />
            </Button>

            <DropdownMenu modal={false}>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" aria-label="Действия" title="Действия">
                        <Settings className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40">
                    <DropdownMenuItem onClick={() => meta.setEditingRow?.(row.original)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Изменить
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={() => meta.setDeletingRow?.(row.original)}
                   >
                        <Trash className="mr-2 h-4 w-4" />
                        Удалить
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    )
})
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
        header: ({ table }) => {
            const meta = table.options.meta as TableMeta<WorkRow>
            return (
                <div className="flex justify-end pr-6 items-center gap-1">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => meta.onInsertRequest?.()}
                        title="Добавить строку"
                        aria-label="Добавить строку"
                   >
                        <Plus className="h-4 w-4" />
                    </Button>
                    <DropdownMenu modal={false}>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" aria-label="Действия" title="Действия">
                                Действия
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => meta.onReorder?.()}>
                                Сбросить сортировку
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            )
        },
        size: 90,
        cell: ({ row, table }) => <RowActions row={row} table={table} />,
    },
]
