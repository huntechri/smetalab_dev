"use client"

import * as React from "react"
import type { Table } from "@tanstack/react-table"
import { Check, Pencil, Plus, Settings, Trash, X } from "lucide-react"

import { ActionMenu } from "@/shared/ui/action-menu"
import { Button } from "@/shared/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/shared/ui/tooltip"
import type { TableMeta } from "@/shared/ui/data-table"

type InsertableRow = {
    id: string
    isPlaceholder?: boolean
}

type IconButtonSize = "icon-xs" | "icon-sm"

function withTooltip(children: React.ReactElement, label: string, enabled: boolean) {
    if (!enabled) {
        return children
    }

    return (
        <Tooltip>
            <TooltipTrigger asChild>{children}</TooltipTrigger>
            <TooltipContent>
                <p>{label}</p>
            </TooltipContent>
        </Tooltip>
    )
}

interface TablePlaceholderRowActionsProps<TData extends InsertableRow> {
    row: TData
    meta: TableMeta<TData>
    className?: string
    iconClassName?: string
    withTooltips?: boolean
    stopPropagation?: boolean
}

export function TablePlaceholderRowActions<TData extends InsertableRow>({
    row,
    meta,
    className = "flex gap-1 justify-end pr-2",
    iconClassName = "h-4 w-4",
    withTooltips = false,
    stopPropagation = false,
}: TablePlaceholderRowActionsProps<TData>) {
    const handleClick = (
        event: React.MouseEvent<HTMLButtonElement>,
        callback: (() => void) | undefined,
    ) => {
        if (stopPropagation) {
            event.stopPropagation()
        }

        callback?.()
    }

    const saveButton = (
        <Button
            size="icon-xs"
            variant="ghost"
            onClick={(event) => handleClick(event, () => meta.onSaveInsert?.(row.id))}
            aria-label="Сохранить строку"
            title={withTooltips ? undefined : "Сохранить строку"}
        >
            <Check className={iconClassName} />
        </Button>
    )

    const cancelButton = (
        <Button
            size="icon-xs"
            variant="ghost"
            onClick={(event) => handleClick(event, () => meta.onCancelInsert?.())}
            aria-label="Отменить вставку"
            title={withTooltips ? undefined : "Отменить вставку"}
        >
            <X className={iconClassName} />
        </Button>
    )

    return (
        <div className={className}>
            {withTooltip(saveButton, "Сохранить строку", withTooltips)}
            {withTooltip(cancelButton, "Отменить вставку", withTooltips)}
        </div>
    )
}

interface TableRowActionsProps<TData extends InsertableRow> {
    row: TData
    table: Table<TData>
    className?: string
    insertButtonSize?: IconButtonSize
    actionButtonSize?: IconButtonSize
    actionMenuModal?: boolean
    insertLabel?: string
    insertTitle?: string
    insertWithTooltip?: boolean
    placeholderIconClassName?: string
    placeholderWithTooltips?: boolean
    placeholderStopPropagation?: boolean
}

export function TableRowActions<TData extends InsertableRow>({
    row,
    table,
    className = "flex items-center justify-end gap-1",
    insertButtonSize = "icon-xs",
    actionButtonSize = "icon-xs",
    actionMenuModal,
    insertLabel = "Вставить строку ниже",
    insertTitle = insertLabel,
    insertWithTooltip = false,
    placeholderIconClassName = "h-4 w-4",
    placeholderWithTooltips = false,
    placeholderStopPropagation = false,
}: TableRowActionsProps<TData>) {
    const meta = table.options.meta as TableMeta<TData>

    if (row.isPlaceholder) {
        return (
            <TablePlaceholderRowActions
                row={row}
                meta={meta}
                iconClassName={placeholderIconClassName}
                withTooltips={placeholderWithTooltips}
                stopPropagation={placeholderStopPropagation}
            />
        )
    }

    const insertButton = (
        <Button
            variant="ghost"
            size={insertButtonSize}
            onClick={() => meta.onInsertRequest?.(row.id)}
            aria-label={insertLabel}
            title={insertWithTooltip ? undefined : insertTitle}
        >
            <Plus className="h-4 w-4" />
        </Button>
    )

    return (
        <div className={className}>
            {withTooltip(insertButton, insertTitle, insertWithTooltip)}
            <ActionMenu
                ariaLabel="Действия"
                modal={actionMenuModal}
                trigger={
                    <Button variant="ghost" size={actionButtonSize} aria-label="Действия" title="Действия">
                        <Settings className="h-4 w-4" />
                    </Button>
                }
                items={[
                    {
                        label: "Изменить",
                        icon: <Pencil className="h-4 w-4" />,
                        onClick: () => meta.setEditingRow?.(row),
                    },
                    {
                        label: "Удалить",
                        icon: <Trash className="h-4 w-4" />,
                        variant: "destructive",
                        onClick: () => meta.setDeletingRow?.(row),
                    },
                ]}
            />
        </div>
    )
}

interface TableHeaderActionsProps<TData> {
    table: Table<TData>
    className?: string
    insertButtonSize?: IconButtonSize
    insertLabel?: string
    insertTitle?: string
    insertWithTooltip?: boolean
    actionMenuAriaLabel?: string
    actionMenuModal?: boolean
    trigger?: React.ReactNode
}

export function TableHeaderActions<TData>({
    table,
    className = "flex justify-end items-center gap-1",
    insertButtonSize = "icon-xs",
    insertLabel = "Добавить строку",
    insertTitle = insertLabel,
    insertWithTooltip = false,
    actionMenuAriaLabel = "Действия",
    actionMenuModal = false,
    trigger,
}: TableHeaderActionsProps<TData>) {
    const meta = table.options.meta as TableMeta<TData>

    const insertButton = (
        <Button
            variant="ghost"
            size={insertButtonSize}
            onClick={() => meta.onInsertRequest?.()}
            aria-label={insertLabel}
            title={insertWithTooltip ? undefined : insertTitle}
        >
            <Plus className="h-4 w-4" />
        </Button>
    )

    return (
        <div className={className}>
            {withTooltip(insertButton, insertTitle, insertWithTooltip)}
            <ActionMenu
                ariaLabel={actionMenuAriaLabel}
                modal={actionMenuModal}
                trigger={trigger ?? (
                    <Button variant="ghost" size="icon-xs" aria-label={actionMenuAriaLabel} title={actionMenuAriaLabel}>
                        <Settings className="h-4 w-4" />
                    </Button>
                )}
                items={[
                    {
                        label: "Сбросить сортировку",
                        onClick: () => meta.onReorder?.(),
                    },
                ]}
            />
        </div>
    )
}
