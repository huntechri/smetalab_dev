"use client"

import { MaterialRow } from "@/shared/types/domain/material-row"
import { Button } from '@/shared/ui/button'
import { Input } from "@/shared/ui/input"
import {
    FieldStack,
    FormLayout,
    FormSection,
    FormStatusMessage,
} from "@/shared/ui/form-layout"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/shared/ui/dialog"

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
            <DialogContent size="lg" scroll>
                <DialogHeader>
                    <DialogTitle>Изменить материал</DialogTitle>
                    <DialogDescription>Отредактируйте данные материала.</DialogDescription>
                </DialogHeader>
                {data ? (
                    <FormLayout onSubmit={onSubmit} padding="dialog">
                        <FormSection columns="two">
                            <FieldStack label="Код" htmlFor="edit-code">
                                <Input id="edit-code" value={data.code || ""} onChange={(e) => onFieldChange("code", e.target.value)} />
                            </FieldStack>
                            <FieldStack label="Название" htmlFor="edit-name">
                                <Input id="edit-name" value={data.name || ""} onChange={(e) => onFieldChange("name", e.target.value)} />
                            </FieldStack>
                            <FieldStack label="Цена" htmlFor="edit-price">
                                <Input id="edit-price" type="number" value={data.price || ""} onChange={(e) => onFieldChange("price", e.target.value)} />
                            </FieldStack>
                            <FieldStack label="Ед.изм." htmlFor="edit-unit">
                                <Input id="edit-unit" value={data.unit || ""} onChange={(e) => onFieldChange("unit", e.target.value)} />
                            </FieldStack>
                            <FieldStack label="Поставщик" htmlFor="edit-vendor">
                                <Input id="edit-vendor" value={data.vendor || ""} onChange={(e) => onFieldChange("vendor", e.target.value)} />
                            </FieldStack>
                            <FieldStack label="Вес (кг)" htmlFor="edit-weight">
                                <Input id="edit-weight" value={data.weight || ""} onChange={(e) => onFieldChange("weight", e.target.value)} />
                            </FieldStack>
                            <FieldStack label="Категория LV1" htmlFor="edit-cat1">
                                <Input id="edit-cat1" value={data.categoryLv1 || ""} onChange={(e) => onFieldChange("categoryLv1", e.target.value)} />
                            </FieldStack>
                            <FieldStack label="Категория LV2" htmlFor="edit-cat2">
                                <Input id="edit-cat2" value={data.categoryLv2 || ""} onChange={(e) => onFieldChange("categoryLv2", e.target.value)} />
                            </FieldStack>
                            <FieldStack label="Категория LV3" htmlFor="edit-cat3">
                                <Input id="edit-cat3" value={data.categoryLv3 || ""} onChange={(e) => onFieldChange("categoryLv3", e.target.value)} />
                            </FieldStack>
                            <FieldStack label="Категория LV4" htmlFor="edit-cat4">
                                <Input id="edit-cat4" value={data.categoryLv4 || ""} onChange={(e) => onFieldChange("categoryLv4", e.target.value)} />
                            </FieldStack>
                            <FieldStack label="URL товара" htmlFor="edit-purl">
                                <Input id="edit-purl" value={data.productUrl || ""} onChange={(e) => onFieldChange("productUrl", e.target.value)} />
                            </FieldStack>
                            <FieldStack label="URL изображения" htmlFor="edit-iurl">
                                <Input id="edit-iurl" value={data.imageUrl || ""} onChange={(e) => onFieldChange("imageUrl", e.target.value)} />
                            </FieldStack>
                        </FormSection>
                        <DialogFooter>
                            <Button variant="outline" onClick={onCancel} disabled={isUpdating}>Отмена</Button>
                            <Button type="submit" disabled={isUpdating}>{isUpdating ? "Сохранение..." : "Сохранить"}</Button>
                        </DialogFooter>
                    </FormLayout>
                ) : (
                    <FormStatusMessage tone="info" className="p-4 text-center">
                        Форма редактирования не настроена
                    </FormStatusMessage>
                )}
            </DialogContent>
        </Dialog>
    )
}
