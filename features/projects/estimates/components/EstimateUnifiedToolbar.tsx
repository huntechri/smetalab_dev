'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu';
import {
    FileUp,
    FileDown,
    Percent,
    FileStack,
    Save,
    Trash2,
    FolderTree,
    Plus,
    MoreHorizontal,
} from 'lucide-react';

export interface EstimateToolbarConfig {
    onImport?: () => void;
    isImporting?: boolean;

    onExportXlsx?: () => void;
    onExportPdf?: () => void;
    isExporting?: boolean;

    onCoefficient?: () => void;
    onApplyPattern?: () => void;
    onSavePattern?: () => void;

    onDelete?: () => void;

    onAddSection?: () => void;
    onAddItem?: () => void;
}

interface ToolbarButtonProps {
    icon: React.ElementType;
    label: string;
    onClick?: () => void;
    disabled?: boolean;
    danger?: boolean;
    loading?: boolean;
}

function ToolbarButton({ icon: Icon, label, onClick, disabled, danger, loading }: ToolbarButtonProps) {
    if (danger) {
        return (
            <Button variant="destructive" disabled={disabled || loading} onClick={onClick} title={label}>
                <Icon className="h-3.5 w-3.5" />
                <span>{loading ? `${label}...` : label}</span>
            </Button>
        );
    }
    return (
        <Button variant="default" disabled={disabled || loading} onClick={onClick} title={label}>
            <Icon className="h-3.5 w-3.5 text-muted-foreground" />
            <span>{loading ? `${label}...` : label}</span>
        </Button>
    );
}

function Sep() {
    return <div className="w-px h-4 bg-border mx-0.5 flex-shrink-0" />;
}

export function EstimateUnifiedToolbar(config: EstimateToolbarConfig) {
    const {
        onImport, isImporting,
        onExportXlsx, onExportPdf, isExporting,
        onCoefficient,
        onApplyPattern, onSavePattern,
        onDelete,
        onAddSection,
        onAddItem,
    } = config;

    const hasExport = !!(onExportXlsx || onExportPdf);
    const hasPatternMenu = !!(onApplyPattern || onSavePattern);

    return (
        <div className="flex items-center gap-1">

            {/* ── Mobile: single "⋯" dropdown ── */}
            <div className="sm:hidden">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="default" size="icon-xs" aria-label="Действия">
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="min-w-[210px]">
                        <DropdownMenuItem disabled={!onImport || isImporting} onClick={onImport}>
                            <FileUp className="mr-2 h-4 w-4 text-muted-foreground" />
                            <span>{isImporting ? 'Импорт...' : 'Импорт'}</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem disabled={!onExportXlsx} onClick={onExportXlsx}>
                            <FileDown className="mr-2 h-4 w-4 text-muted-foreground" />
                            <span>Экспорт в Excel</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem disabled={!onExportPdf} onClick={onExportPdf}>
                            <FileDown className="mr-2 h-4 w-4 text-muted-foreground" />
                            <span>Экспорт в PDF</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem disabled={!onCoefficient} onClick={onCoefficient}>
                            <Percent className="mr-2 h-4 w-4 text-muted-foreground" />
                            <span>Коэффициент</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem disabled={!onApplyPattern} onClick={onApplyPattern}>
                            <FileStack className="mr-2 h-4 w-4 text-muted-foreground" />
                            <span>Применить шаблон</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem disabled={!onSavePattern} onClick={onSavePattern}>
                            <Save className="mr-2 h-4 w-4 text-muted-foreground" />
                            <span>Сохранить шаблон</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            disabled={!onDelete}
                            onClick={onDelete}
                            className="text-destructive focus:text-destructive"
                        >
                            <Trash2 className="mr-2 h-4 w-4" />
                            <span>Удалить</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem disabled={!onAddSection} onClick={onAddSection}>
                            <FolderTree className="mr-2 h-4 w-4 text-muted-foreground" />
                            <span>Добавить раздел</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem disabled={!onAddItem} onClick={onAddItem}>
                            <Plus className="mr-2 h-4 w-4 text-muted-foreground" />
                            <span>Добавить</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            {/* ── Desktop: grouped toolbar ── */}
            <div className="hidden sm:flex items-center gap-1">
                {/* Group 1: data exchange */}
                <ToolbarButton
                    icon={FileUp}
                    label="Импорт"
                    onClick={onImport}
                    disabled={!onImport}
                    loading={isImporting}
                />

                {hasExport ? (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="default" disabled={isExporting}>
                                <FileDown className="h-3.5 w-3.5 text-muted-foreground" />
                                <span>{isExporting ? 'Экспорт...' : 'Экспорт'}</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-52">
                            {onExportXlsx && (
                                <DropdownMenuItem className="gap-2" onClick={onExportXlsx}>
                                    <FileDown className="h-4 w-4 text-muted-foreground" />
                                    Экспорт в Excel (.xlsx)
                                </DropdownMenuItem>
                            )}
                            {onExportPdf && (
                                <DropdownMenuItem className="gap-2" onClick={onExportPdf}>
                                    <FileDown className="h-4 w-4 text-muted-foreground" />
                                    Экспорт в PDF (.pdf)
                                </DropdownMenuItem>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                ) : (
                    <Button variant="default" disabled>
                        <FileDown className="h-3.5 w-3.5 text-muted-foreground" />
                        <span>Экспорт</span>
                    </Button>
                )}

                <Sep />

                {/* Group 2: calculations & templates */}
                <ToolbarButton
                    icon={Percent}
                    label="Коэфф."
                    onClick={onCoefficient}
                    disabled={!onCoefficient}
                />

                {hasPatternMenu ? (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="default" disabled={!hasPatternMenu}>
                                <FileStack className="h-3.5 w-3.5 text-muted-foreground" />
                                <span>Шаблон</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-52">
                            {onApplyPattern && (
                                <DropdownMenuItem className="gap-2" onClick={onApplyPattern}>
                                    <FileStack className="h-4 w-4 text-muted-foreground" />
                                    Применить шаблон
                                </DropdownMenuItem>
                            )}
                            {onSavePattern && (
                                <DropdownMenuItem className="gap-2" onClick={onSavePattern}>
                                    <Save className="h-4 w-4 text-muted-foreground" />
                                    Сохранить шаблон
                                </DropdownMenuItem>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                ) : (
                    <Button variant="default" disabled>
                        <FileStack className="h-3.5 w-3.5 text-muted-foreground" />
                        <span>Шаблон</span>
                    </Button>
                )}

                <Sep />

                {/* Group 3: destructive */}
                <ToolbarButton
                    icon={Trash2}
                    label="Удалить"
                    onClick={onDelete}
                    disabled={!onDelete}
                    danger
                />

                <Sep />

                {/* Group 4: create */}
                <ToolbarButton
                    icon={FolderTree}
                    label="Раздел"
                    onClick={onAddSection}
                    disabled={!onAddSection}
                />
                <ToolbarButton
                    icon={Plus}
                    label="Добавить"
                    onClick={onAddItem}
                    disabled={!onAddItem}
                />
            </div>
        </div>
    );
}
