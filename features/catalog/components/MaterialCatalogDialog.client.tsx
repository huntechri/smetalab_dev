'use client';

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CatalogMaterial } from '../types/dto';
import { MaterialCatalogPicker } from './MaterialCatalogPicker.client';

interface MaterialCatalogDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (material: CatalogMaterial) => Promise<void>;
    parentWorkName: string;
}

export function MaterialCatalogDialog({ isOpen, onClose, onSelect, parentWorkName }: MaterialCatalogDialogProps) {
    return (
        <Dialog open={isOpen} onOpenChange={(open) => {
            if (!open) {
                onClose();
            }
        }}>
            <DialogContent className="max-w-4xl h-[80vh] p-0 flex flex-col gap-0">
                <DialogHeader className="p-6 border-b">
                    <DialogTitle className="text-xl">Добавить материал в: {parentWorkName}</DialogTitle>
                    <DialogDescription>
                        Выберите позицию из справочника материалов, чтобы добавить её к выбранной работе.
                    </DialogDescription>
                </DialogHeader>
                <div className="flex-1 min-h-0">
                    <MaterialCatalogPicker onAddMaterial={onSelect} />
                </div>
            </DialogContent>
        </Dialog>
    );
}

