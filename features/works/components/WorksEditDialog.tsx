"use client"

import { WorkRow } from "@/shared/types/domain/work-row"
import { Button } from '@repo/ui'
import { Input } from "@repo/ui"
import { Label } from "@repo/ui"
import { UnitSelect } from "@/features/works/components/UnitSelect"
import { Loader2 } from "lucide-react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@repo/ui"

interface WorksEditDialogProps {
    open: boolean
    data: WorkRow | null
    isUpdating: boolean
    onOpenChange: (open: boolean) => void
    onFieldChange: (field: string, val: unknown) => void
    onSubmit: (event?: React.FormEvent) => void
    onCancel: () => void
}

export function WorksEditDialog({
    open,
    data,
    isUpdating,
    onOpenChange,
    onFieldChange,
    onSubmit,
    onCancel,
}: WorksEditDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Изменить запись</DialogTitle>
                    <DialogDescription>Внесите изменения и нажмите сохранить.</DialogDescription>
                </DialogHeader>
                {data ? (
                    <form onSubmit={onSubmit} className="grid gap-4 py-4">
                        <div className="grid grid-cols-1 sm:grid-cols-4 items-start sm:items-center gap-2 sm:gap-4">
                            <Label htmlFor="name" className="sm:text-right text-xs text-muted-foreground sm:text-foreground">Название</Label>
                            <div className="sm:col-span-3">
                                <Input id="name" value={data.name || ""} onChange={(e) => onFieldChange("name", e.target.value)} required />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-4 items-start sm:items-center gap-2 sm:gap-4">
                            <Label htmlFor="unit" className="sm:text-right text-xs text-muted-foreground sm:text-foreground">Ед. изм.</Label>
                            <div className="sm:col-span-3">
                                <UnitSelect value={data.unit || ""} onChange={(val) => onFieldChange("unit", val)} />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-4 items-start sm:items-center gap-2 sm:gap-4">
                            <Label htmlFor="price" className="sm:text-right text-xs text-muted-foreground sm:text-foreground">Цена</Label>
                            <div className="sm:col-span-3">
                                <Input id="price" type="number" value={data.price || ""} onChange={(e) => onFieldChange("price", e.target.value)} required />
                            </div>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="phase" className="text-right">Этап</Label>
                            <div className="col-span-3">
                                <Input id="phase" value={data.phase || ""} onChange={(e) => onFieldChange("phase", e.target.value)} />
                            </div>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="category" className="text-right">Категория</Label>
                            <div className="col-span-3">
                                <Input id="category" value={data.category || ""} onChange={(e) => onFieldChange("category", e.target.value)} />
                            </div>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="subcategory" className="text-right">Подкатегория</Label>
                            <div className="col-span-3">
                                <Input id="subcategory" value={data.subcategory || ""} onChange={(e) => onFieldChange("subcategory", e.target.value)} />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={onCancel} disabled={isUpdating}>Отмена</Button>
                            <Button type="submit" disabled={isUpdating}>
                                {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Сохранить
                            </Button>
                        </DialogFooter>
                    </form>
                ) : (
                    <div className="text-sm text-muted-foreground p-4 text-center">
                        Форма редактирования не настроена
                    </div>
                )}
            </DialogContent>
        </Dialog>
    )
}
