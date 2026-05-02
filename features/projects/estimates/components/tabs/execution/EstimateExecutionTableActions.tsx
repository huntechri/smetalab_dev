'use client';

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/shared/ui/dropdown-menu';
import { Download, MoreHorizontal } from 'lucide-react';
import {
    actionInlineGroupClassName,
    actionMenuContentClassName,
    ActionMenuItemContent,
} from '@/shared/ui/action-menu';
import { ToolbarButton } from '@/shared/ui/toolbar-button';
import { CatalogWork } from '@/shared/types/domain/catalog';
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
            <div className={`hidden sm:flex ${actionInlineGroupClassName}`}>
                <ToolbarButton onClick={onExport} iconLeft={<Download className="size-4" />}>
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
                            <MoreHorizontal className="size-4" />
                        </ToolbarButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className={actionMenuContentClassName}>
                        <DropdownMenuItem onClick={onExport}>
                            <ActionMenuItemContent icon={<Download />}>
                                Экспорт Excel
                            </ActionMenuItemContent>
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
