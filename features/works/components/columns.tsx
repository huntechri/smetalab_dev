"use client"

import * as React from "react"
import { ColumnDef, Table, Row } from "@tanstack/react-table"
import { Button } from "@/shared/ui/button"
import { TableHeaderActions, TableRowActions } from "@/shared/ui/table-actions"

import { WorkRow } from "@/shared/types/domain/work-row"
import { UnitSelect } from "@/features/works/components/UnitSelect"
import { TableMeta } from "@/shared/ui/data-table"
import {
    CenteredUnitCell,
    FormattedCurrencyCell,
    PlaceholderNumberCell,
    PlaceholderTextCell,
} from "@/shared/ui/cells/table-cell-helpers"
import {
    DirectoryIndexCell,
    DirectoryStackCell,
    type DirectoryBadgeTrailItem,
} from "@/shared/ui/cells/directory-table-cells"

interface RowActionsProps {
    row: { original: WorkRow };
    table: Table<WorkRow>;
}

const RowActions = React.memo(({ row, table }: RowActionsProps) => (
    <TableRowActions
        row={row.original}
        table={table}
        actionMenuModal={false}
        insertLabel="Вставить строку ниже"
        insertTitle="Вставить строку ниже"
    />
))
RowActions.displayName = "RowActions"

const IndexCell = React.memo(({ row }: { row: Row<WorkRow> }) => (
    <DirectoryIndexCell index={row.index + 1} isPlaceholder={row.original.isPlaceholder} />
));
IndexCell.displayName = "IndexCell";

const NameCell = React.memo(({ row, table }: { row: Row<WorkRow>; table: Table<WorkRow> }) => {
    const isPlaceholder = row.original.isPlaceholder;
    const meta = table.options.meta as TableMeta<WorkRow>

    if (isPlaceholder) {
        return (
            <PlaceholderTextCell
                placeholder="Наименование работы..."
                autoFocus
                value={row.original.name || ""}
                onValueChange={(name) => meta.updatePlaceholderRow?.(row.original.id, { name })}
           />
        )
    }

    const { phase, category, subcategory, name } = row.original;
    const trailItems: DirectoryBadgeTrailItem[] = [
        phase ? { label: phase, tone: "info" } : null,
        category ? { label: category, tone: "neutral" } : null,
        subcategory ? { label: subcategory, tone: "paused" } : null,
    ].filter(Boolean) as DirectoryBadgeTrailItem[];

    return <DirectoryStackCell title={name || undefined} primary={name} trailItems={trailItems} />;
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
    return <CenteredUnitCell value={row.getValue("unit")} />
});
UnitCell.displayName = "UnitCell";

const PriceCell = React.memo(({ row, table }: { row: Row<WorkRow>; table: Table<WorkRow> }) => {
    const isPlaceholder = row.original.isPlaceholder;
    const meta = table.options.meta as TableMeta<WorkRow>

    if (isPlaceholder) {
        return (
            <PlaceholderNumberCell
                placeholder="Цена"
                value={row.original.price || ""}
                onValueChange={(price) => meta.updatePlaceholderRow?.(row.original.id, { price })}
           />
        )
    }

    return <FormattedCurrencyCell value={row.getValue("price")} />
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
