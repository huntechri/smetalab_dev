'use client';

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/shared/ui/dialog';
import { CatalogMaterial } from '../types/dto';
import { MaterialCatalogPicker } from './MaterialCatalogPicker.client';

interface MaterialCatalogDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (material: CatalogMaterial) => Promise<void>;
    parentWorkName: string;
    mode?: 'add' | 'replace';
    addedMaterialNames?: Set<string>;
    closeOnSelect?: boolean;
    allowDuplicateSelection?: boolean;
}

export function MaterialCatalogDialog({
    isOpen,
    onClose,
    onSelect,
    parentWorkName,
    mode = 'add',
    addedMaterialNames,
    closeOnSelect = true,
    allowDuplicateSelection = false,
}: MaterialCatalogDialogProps) {
    const isReplaceMode = mode === 'replace';

    const handleAddMaterial = async (material: CatalogMaterial) => {
        await onSelect(material);

        if (closeOnSelect) {
            onClose();
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => {
            if (!open) {
                onClose();
            }
        }}>
            <DialogContent className="h-[100dvh] w-screen max-w-[1024px] rounded-none p-0 flex flex-col gap-0 sm:h-[80vh] sm:w-[96vw] sm:max-w-[1024px] sm:rounded-xl shadow-2xl overflow-hidden">
                <DialogHeader className="border-b p-4">
                    <DialogTitle className="pr-8 text-base leading-tight sm:text-lg font-semibold">
                        {isReplaceMode ? `Заменить материал: ${parentWorkName}` : `Добавить материал в: ${parentWorkName}`}
                    </DialogTitle>
                    <DialogDescription className="text-xs sm:text-sm">
                        {isReplaceMode
                            ? 'Выберите новую позицию из справочника материалов для замены текущей строки.'
                            : 'Выберите позицию из справочника материалов, чтобы добавить её к выбранной работе.'}
                    </DialogDescription>
                </DialogHeader>
                <div className="flex-1 min-h-0">
                    <MaterialCatalogPicker
                        onAddMaterial={handleAddMaterial}
                        addedMaterialNames={addedMaterialNames}
                        allowDuplicateSelection={allowDuplicateSelection}
                    />
                </div>
            </DialogContent>
        </Dialog>
    );
}
