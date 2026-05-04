'use client';

import { useState } from 'react';
import { Button } from '@/shared/ui/button';
import { ActionMenuItemContent } from '@/shared/ui/action-menu';
import { DropdownMenuItem } from '@/shared/ui/dropdown-menu';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/shared/ui/sheet';
import { Plus } from 'lucide-react';
import { WorkCatalogPicker } from '@/features/catalog/components/WorkCatalogPicker.client';
import { CatalogWork } from '@/shared/types/domain/catalog';

interface EstimateExecutionAddExtraWorkSheetProps {
    addedWorkNames: Set<string>;
    onAddWork: (catalogWork: CatalogWork) => Promise<boolean>;
    triggerVariant?: 'button' | 'menu-item';
}

import { primitiveVisualIconSizeClassNames } from '@/shared/ui/primitive-controls';

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
                        <ActionMenuItemContent icon={<Plus />}>
                            Добавить доп. работу
                        </ActionMenuItemContent>
                    </DropdownMenuItem>
                ) : (
                    <Button variant="primary" size="default" title="Добавить дополнительную работу" aria-label="Добавить дополнительную работу">
                        <Plus className={primitiveVisualIconSizeClassNames.md} />
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

                <div className="mt-6 h-content-fill overflow-hidden">
                    <WorkCatalogPicker
                        onAddWork={(work) => void handleAddWork(work)}
                        addedWorkNames={addedWorkNames}
                   />
                </div>
            </SheetContent>
        </Sheet>
    );
}
