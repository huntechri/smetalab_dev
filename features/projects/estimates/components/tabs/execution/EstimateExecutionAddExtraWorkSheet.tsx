'use client';

import { useState } from 'react';
import {
    Button,
    DropdownMenuItem,
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@repo/ui';
import { Plus } from 'lucide-react';
import { WorkCatalogPicker } from '@/features/catalog/components/WorkCatalogPicker.client';
import { CatalogWork } from '@/features/catalog/types/dto';

interface EstimateExecutionAddExtraWorkSheetProps {
    addedWorkNames: Set<string>;
    onAddWork: (catalogWork: CatalogWork) => Promise<boolean>;
    triggerVariant?: 'button' | 'menu-item';
}

export function EstimateExecutionAddExtraWorkSheet({
    addedWorkNames,
    onAddWork,
    triggerVariant = 'button',
}: EstimateExecutionAddExtraWorkSheetProps) {
    const [open, setOpen] = useState(false);

    const handleAddWork = async (work: CatalogWork) => {
        const wasAdded = await onAddWork(work);
        if (wasAdded) {
            setOpen(false);
        }
    };

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                {triggerVariant === 'menu-item' ? (
                    <DropdownMenuItem onSelect={(event) => event.preventDefault()}>
                        <Plus className="mr-2 h-4 w-4" />
                        Добавить доп. работу
                    </DropdownMenuItem>
                ) : (
                    <Button variant="primary" title="Добавить дополнительную работу" aria-label="Добавить дополнительную работу">
                        <Plus className="h-4 w-4" />
                        <span className="hidden sm:inline">Добавить доп. работу</span>
                    </Button>
                )}
            </SheetTrigger>
            <SheetContent side="right" className="w-full sm:max-w-md">
                <SheetHeader>
                    <SheetTitle>Справочник работ</SheetTitle>
                    <SheetDescription>
                        Выберите работу из справочника. Позиция будет добавлена только во вкладку «Выполнение».
                    </SheetDescription>
                </SheetHeader>

                <div className="mt-6 h-[calc(100vh-140px)] overflow-hidden">
                    <WorkCatalogPicker
                        onAddWork={(work) => void handleAddWork(work)}
                        addedWorkNames={addedWorkNames}
                   />
                </div>
            </SheetContent>
        </Sheet>
    );
}
