"use client"

import { useEffect, useState, useTransition } from "react"
import { useAppToast } from "@/components/providers/use-app-toast"

type ActionResult = {
    success: boolean
    message?: string
}

interface UseDataTableEditorOptions<TData extends { id: string }> {
    onRowUpdate?: (id: string, data: Partial<TData>) => Promise<ActionResult>
    onRowDelete?: (id: string) => Promise<ActionResult>
}

export function useDataTableEditor<TData extends { id: string }>({
    onRowUpdate,
    onRowDelete,
}: UseDataTableEditorOptions<TData>) {
    const { toast } = useAppToast()
    const [editingRow, setEditingRow] = useState<TData | null>(null)
    const [deletingRow, setDeletingRow] = useState<TData | null>(null)
    const [editFormData, setEditFormData] = useState<TData | null>(null)
    const [isUpdating, startUpdateTransition] = useTransition()
    const [isDeleting, startDeleteTransition] = useTransition()

    useEffect(() => {
        if (editingRow) {
            setEditFormData({ ...editingRow })
        } else {
            setEditFormData(null)
        }
    }, [editingRow])

    const handleUpdate = (event?: React.FormEvent) => {
        event?.preventDefault()
        if (!editingRow || !editFormData || !onRowUpdate) return
        startUpdateTransition(async () => {
            const result = await onRowUpdate(editingRow.id, editFormData)
            if (result.success) {
                toast({ title: "Запись обновлена", description: result.message })
                setEditingRow(null)
            } else {
                toast({ variant: "destructive", title: "Ошибка", description: result.message })
            }
        })
    }

    const handleDelete = () => {
        if (!deletingRow || !onRowDelete) return
        startDeleteTransition(async () => {
            const result = await onRowDelete(deletingRow.id)
            if (result.success) {
                toast({ title: "Запись удалена", description: result.message })
                setDeletingRow(null)
            } else {
                toast({ variant: "destructive", title: "Ошибка", description: result.message })
            }
        })
    }

    return {
        editingRow,
        setEditingRow,
        deletingRow,
        setDeletingRow,
        editFormData,
        setEditFormData,
        isUpdating,
        isDeleting,
        handleUpdate,
        handleDelete,
    }
}
