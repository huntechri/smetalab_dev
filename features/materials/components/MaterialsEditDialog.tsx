"use client"

import { MaterialRow } from "@/shared/types/domain/material-row"
import { Button } from '@repo/ui'
import { Input } from "@repo/ui"
import { Label } from "@repo/ui"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@repo/ui"

interface MaterialsEditDialogProps {
    open: boolean
    data: MaterialRow | null
    isUpdating: boolean
    onOpenChange: (open: boolean) => void
    onFieldChange: (field: string, val: unknown) => void
    onSubmit: (event?: React.FormEvent) => void
    onCancel: () => void
}

export function MaterialsEditDialog({
    open,
    data,
    isUpdating,
    onOpenChange,
    onFieldChange,
    onSubmit,
    onCancel,
}: MaterialsEditDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Изменить материал</DialogTitle>
                    <DialogDescription>Отредактируйте данные материала.</DialogDescription>
                </DialogHeader>
                {data ? (
                    <form onSubmit={onSubmit}>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="edit-code">Код</Label>
                                <Input id="edit-code" value={data.code || ""} onChange={(e) => onFieldChange("code", e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit-name">Название</Label>
                                <Input id="edit-name" value={data.name || ""} onChange={(e) => onFieldChange("name", e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit-price">Цена</Label>
                                <Input id="edit-price" type="number" value={data.price || ""} onChange={(e) => onFieldChange("price", e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit-unit">Ед.изм.</Label>
                                <Input id="edit-unit" value={data.unit || ""} onChange={(e) => onFieldChange("unit", e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit-vendor">Поставщик</Label>
                                <Input id="edit-vendor" value={data.vendor || ""} onChange={(e) => onFieldChange("vendor", e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit-weight">Вес (кг)</Label>
                                <Input id="edit-weight" value={data.weight || ""} onChange={(e) => onFieldChange("weight", e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit-cat1">Категория LV1</Label>
                                <Input id="edit-cat1" value={data.categoryLv1 || ""} onChange={(e) => onFieldChange("categoryLv1", e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit-cat2">Категория LV2</Label>
                                <Input id="edit-cat2" value={data.categoryLv2 || ""} onChange={(e) => onFieldChange("categoryLv2", e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit-cat3">Категория LV3</Label>
                                <Input id="edit-cat3" value={data.categoryLv3 || ""} onChange={(e) => onFieldChange("categoryLv3", e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit-cat4">Категория LV4</Label>
                                <Input id="edit-cat4" value={data.categoryLv4 || ""} onChange={(e) => onFieldChange("categoryLv4", e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit-purl">URL товара</Label>
                                <Input id="edit-purl" value={data.productUrl || ""} onChange={(e) => onFieldChange("productUrl", e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit-iurl">URL изображения</Label>
                                <Input id="edit-iurl" value={data.imageUrl || ""} onChange={(e) => onFieldChange("imageUrl", e.target.value)} />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={onCancel} disabled={isUpdating}>Отмена</Button>
                            <Button type="submit" disabled={isUpdating}>{isUpdating ? "Сохранение..." : "Сохранить"}</Button>
                        </DialogFooter>
                    </form>
                ) : (
                    <div className="text-sm text-muted-foreground p-4 text-center">Форма редактирования не настроена</div>
                )}
            </DialogContent>
        </Dialog>
    )
}
