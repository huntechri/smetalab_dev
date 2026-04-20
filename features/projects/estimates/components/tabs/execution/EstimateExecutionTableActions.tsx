'use client';

import { Button, DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@repo/ui';
import { Download, MoreHorizontal } from 'lucide-react';
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
                <Button variant="outline" onClick={onExport}>
                    <Download className="h-4 w-4" />
                    Экспорт Excel
                </Button>
                <EstimateExecutionAddExtraWorkSheet
                    addedWorkNames={addedWorkNames}
                    onAddWork={onAddWork}
               />
            </div>

            <div className="sm:hidden">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="icon-xs">
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
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
