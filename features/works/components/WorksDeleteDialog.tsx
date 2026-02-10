"use client"

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface WorksDeleteDialogProps {
    open: boolean
    isDeleting: boolean
    name?: string | null
    onOpenChange: (open: boolean) => void
    onConfirm: () => void
}

export function WorksDeleteDialog({
    open,
    isDeleting,
    name,
    onOpenChange,
    onConfirm,
}: WorksDeleteDialogProps) {
    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Вы уверены?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Запись {name ? `"${name}"` : ""} будет удалена безвозвратно.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isDeleting}>Отмена</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={(event) => {
                            event.preventDefault()
                            onConfirm()
                        }}
                        className="bg-red-700 text-white hover:bg-red-800"
                        disabled={isDeleting}
                    >
                        {isDeleting ? "Удаление..." : "Удалить"}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
