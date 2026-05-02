"use client"

import { WorkRow } from "@/shared/types/domain/work-row"
import { Button } from '@/shared/ui/button'
import { Input } from "@/shared/ui/input"
import { FieldRow, FormLayout, FormStatusMessage } from "@/shared/ui/form-layout"
import { UnitSelect } from "@/features/works/components/UnitSelect"
import { Loader2 } from "lucide-react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/shared/ui/dialog"

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
            <DialogContent size="sm">
                <DialogHeader>
                    <DialogTitle>Изменить запись</DialogTitle>
                    <DialogDescription>Внесите изменения и нажмите сохранить.</DialogDescription>
                </DialogHeader>
                {data ? (
                    <FormLayout onSubmit={onSubmit} padding="dialog">
                        <FieldRow label="Название" htmlFor="name">
                            <Input id="name" value={data.name || ""} onChange={(e) => onFieldChange("name", e.target.value)} required />
                        </FieldRow>
                        <FieldRow label="Ед. изм." htmlFor="unit">
                            <UnitSelect value={data.unit || ""} onChange={(val) => onFieldChange("unit", val)} />
                        </FieldRow>
                        <FieldRow label="Цена" htmlFor="price">
                            <Input id="price" type="number" value={data.price || ""} onChange={(e) => onFieldChange("price", e.target.value)} required />
                        </FieldRow>
                        <FieldRow label="Этап" htmlFor="phase">
                            <Input id="phase" value={data.phase || ""} onChange={(e) => onFieldChange("phase", e.target.value)} />
                        </FieldRow>
                        <FieldRow label="Категория" htmlFor="category">
                            <Input id="category" value={data.category || ""} onChange={(e) => onFieldChange("category", e.target.value)} />
                        </FieldRow>
                        <FieldRow label="Подкатегория" htmlFor="subcategory">
                            <Input id="subcategory" value={data.subcategory || ""} onChange={(e) => onFieldChange("subcategory", e.target.value)} />
                        </FieldRow>
                        <DialogFooter>
                            <Button variant="outline" onClick={onCancel} disabled={isUpdating}>Отмена</Button>
                            <Button type="submit" disabled={isUpdating}>
                                {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Сохранить
                            </Button>
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
