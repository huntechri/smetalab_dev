'use client';

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
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
            <DialogContent className="w-[96vw] max-w-[1800px] h-[86vh] p-0 flex flex-col gap-0">
                <DialogHeader className="p-6 border-b">
                    <DialogTitle className="text-xl">
                        {isReplaceMode ? `Заменить материал: ${parentWorkName}` : `Добавить материал в: ${parentWorkName}`}
                    </DialogTitle>
                    <DialogDescription>
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
