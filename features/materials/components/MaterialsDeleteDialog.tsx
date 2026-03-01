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
} from "@/shared/ui/alert-dialog"

interface MaterialsDeleteDialogProps {
    open: boolean
    isDeleting: boolean
    name?: string | null
    onOpenChange: (open: boolean) => void
    onConfirm: () => void
}

export function MaterialsDeleteDialog({
    open,
    isDeleting,
    name,
    onOpenChange,
    onConfirm,
}: MaterialsDeleteDialogProps) {
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
                        onClick={onConfirm}
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
