"use client"

import { useRef, useTransition } from "react"
import * as XLSX from "xlsx"
import { useAppToast } from "@/components/providers/use-app-toast"
import { WorkRow } from "@/types/work-row"
import {
    importWorks,
    exportWorks,
    deleteAllWorks,
    reorderWorks,
    updateWork,
    deleteWork,
} from "@/app/actions/works"

interface UseWorksActionsOptions {
    setData: React.Dispatch<React.SetStateAction<WorkRow[]>>
}

export function useWorksActions({ setData }: UseWorksActionsOptions) {
    const { toast } = useAppToast()
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [isExporting, startExportTransition] = useTransition()
    const [isImporting, startImportTransition] = useTransition()
    const [isDeletingAll, startDeleteAllTransition] = useTransition()
    const [, startReorderTransition] = useTransition()

    const handleExport = () => {
        startExportTransition(async () => {
            const result = await exportWorks()
            if (result.success) {
                const worksheet = XLSX.utils.json_to_sheet(result.data)
                const workbook = XLSX.utils.book_new()
                XLSX.utils.book_append_sheet(workbook, worksheet, "Works")
                XLSX.writeFile(workbook, "works_export.xlsx")
                toast({
                    title: "Экспорт успешен",
                    description: "Данные работ были успешно экспортированы.",
                })
            } else {
                toast({
                    variant: "destructive",
                    title: "Ошибка экспорта",
                    description: result.message,
                })
            }
        })
    }

    const handleImportClick = () => {
        fileInputRef.current?.click()
    }

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (!file) return
        const formData = new FormData()
        formData.append("file", file)

        startImportTransition(async () => {
            const result = await importWorks(formData)
            if (result.success) {
                toast({
                    title: "Импорт завершен",
                    description: result.message,
                })
            } else {
                toast({
                    variant: "destructive",
                    title: "Ошибка импорта",
                    description: result.message,
                })
            }
        })

        if (fileInputRef.current) fileInputRef.current.value = ""
    }

    const handleDeleteAll = () => {
        startDeleteAllTransition(async () => {
            const result = await deleteAllWorks()
            if (result.success) {
                toast({
                    title: "Справочник очищен",
                    description: result.message,
                })
                setData([])
            } else {
                toast({
                    variant: "destructive",
                    title: "Ошибка при очистке",
                    description: result.message,
                })
            }
        })
    }

    const handleReorder = () => {
        startReorderTransition(async () => {
            const result = await reorderWorks()
            if (result.success) {
                toast({ title: "Сортировка сброшена", description: "Порядок записей успешно обновлен." })
            } else {
                toast({ variant: "destructive", title: "Ошибка", description: result.message })
            }
        })
    }

    const handleRowUpdate = (id: string, data: Partial<WorkRow>) => {
        return updateWork(id, {
            ...data,
            price: data.price ? Number(data.price) : undefined,
        })
    }

    const handleRowDelete = (id: string) => {
        return deleteWork(id)
    }

    return {
        fileInputRef,
        isExporting,
        isImporting,
        isDeletingAll,
        handleExport,
        handleImportClick,
        handleFileChange,
        handleDeleteAll,
        handleReorder,
        handleRowUpdate,
        handleRowDelete,
    }
}
