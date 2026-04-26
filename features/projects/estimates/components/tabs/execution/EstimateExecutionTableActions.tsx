'use client';

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/shared/ui/dropdown-menu';
import { Download, MoreHorizontal } from 'lucide-react';
import { ToolbarButton } from '@/shared/ui/toolbar-button';
import { CatalogWork } from '@/features/catalog/types/dto';
import { EstimateExecutionAddExtraWorkSheet } from './EstimateExecutionAddExtraWorkSheet';

interface EstimateExecutionTableActionsProps {
    addedWorkNames: Set<string>;
    onExport: () => void;
    onAddWork: (catalogWork: CatalogWork) => Promise<boolean>;
}

export function EstimateExecutionTableActions({
    addedWorkNames,
    onExport,
    onAddWork,
}: EstimateExecutionTableActionsProps) {
    return (
        <>
            <div className="hidden items-center gap-2 sm:flex">
                <ToolbarButton onClick={onExport} iconLeft={<Download className="h-4 w-4" />}>
                    Экспорт Excel
                </ToolbarButton>
                <EstimateExecutionAddExtraWorkSheet
                    addedWorkNames={addedWorkNames}
                    onAddWork={onAddWork}
               />
            </div>

            <div className="sm:hidden">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <ToolbarButton size="icon-xs" aria-label="Действия выполнения">
                            <MoreHorizontal className="h-4 w-4" />
                        </ToolbarButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="min-w-[220px]">
                        <DropdownMenuItem onClick={onExport}>
                            <Download className="mr-2 h-4 w-4" />
                            Экспорт Excel
                        </DropdownMenuItem>
                        <EstimateExecutionAddExtraWorkSheet
                            addedWorkNames={addedWorkNames}
                            onAddWork={onAddWork}
                            triggerVariant="menu-item"
                       />
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </>
    );
}
