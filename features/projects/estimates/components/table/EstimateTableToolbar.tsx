'use client';

import {
  Calculator,
  FileDown,
  FileStack,
  FileUp,
  FolderTree,
  MoreHorizontal,
  Percent,
  Save,
  Trash2,
} from 'lucide-react';

import { ToolbarButton } from '@/shared/ui/toolbar-button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu';

interface EstimateTableToolbarProps {
  isImporting: boolean;
  isExporting: boolean;
  onOpenCalculationMode: () => void;
  onOpenCreateSectionDialog: () => void;
  onOpenSavePattern: () => void;
  onOpenApplyPattern: () => void;
  onOpenCoefficientDialog: () => void;
  onImportEstimate: () => void;
  onExportXlsx: () => void;
  onExportPdf: () => void;
  onOpenDeleteDialog: () => void;
}

function DesktopPrimaryActions({
  onOpenCalculationMode,
  onOpenCreateSectionDialog,
  onOpenSavePattern,
}: Pick<
  EstimateTableToolbarProps,
  'onOpenCalculationMode' | 'onOpenCreateSectionDialog' | 'onOpenSavePattern'
>) {
  return (
    <div className="hidden sm:flex items-center gap-1.5 sm:gap-2">
      <ToolbarButton aria-label="Режим расчета" onClick={onOpenCalculationMode} iconLeft={<Calculator className="h-3.5 w-3.5 text-muted-foreground" />} labelClassName="hidden sm:inline">
        Режим расчета
      </ToolbarButton>
      <ToolbarButton aria-label="Добавить раздел" onClick={onOpenCreateSectionDialog} iconLeft={<FolderTree className="h-3.5 w-3.5 text-muted-foreground" />} labelClassName="hidden sm:inline">
        Раздел
      </ToolbarButton>
      <ToolbarButton aria-label="Сохранить смету" onClick={onOpenSavePattern} iconLeft={<Save className="h-3.5 w-3.5 text-muted-foreground" />} labelClassName="hidden sm:inline">
        Сохранить
      </ToolbarButton>
    </div>
  );
}

function DesktopSecondaryActions({
  isImporting,
  isExporting,
  onOpenApplyPattern,
  onOpenCoefficientDialog,
  onImportEstimate,
  onExportXlsx,
  onExportPdf,
}: Pick<
  EstimateTableToolbarProps,
  | 'isImporting'
  | 'isExporting'
  | 'onOpenApplyPattern'
  | 'onOpenCoefficientDialog'
  | 'onImportEstimate'
  | 'onExportXlsx'
  | 'onExportPdf'
>) {
  return (
    <div className="hidden xl:flex items-center gap-1.5">
      <ToolbarButton onClick={onOpenApplyPattern} iconLeft={<FileStack className="h-3.5 w-3.5 text-muted-foreground" />}>
        Шаблон
      </ToolbarButton>
      <ToolbarButton onClick={onOpenCoefficientDialog} iconLeft={<Percent className="h-3.5 w-3.5 text-muted-foreground" />}>
        Коэффициент
      </ToolbarButton>
      <ToolbarButton onClick={onImportEstimate} disabled={isImporting} iconLeft={<FileUp className="h-3.5 w-3.5 text-muted-foreground" />}>
        {isImporting ? 'Импорт...' : 'Импорт'}
      </ToolbarButton>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <ToolbarButton disabled={isExporting} iconLeft={<FileDown className="h-3.5 w-3.5 text-muted-foreground" />}>
            {isExporting ? 'Экспорт...' : 'Экспорт'}
          </ToolbarButton>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuItem className="gap-2" onClick={onExportXlsx}>
            <FileDown className="h-4 w-4 text-muted-foreground" />
            <span>Экспорт в Excel (.xlsx)</span>
          </DropdownMenuItem>
          <DropdownMenuItem className="gap-2" onClick={onExportPdf}>
            <FileDown className="h-4 w-4 text-muted-foreground" />
            <span>Экспорт в PDF (.pdf)</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

function MobileOverflowActions({
  isImporting,
  isExporting,
  onOpenCalculationMode,
  onOpenCreateSectionDialog,
  onOpenSavePattern,
  onOpenApplyPattern,
  onOpenCoefficientDialog,
  onImportEstimate,
  onExportXlsx,
  onExportPdf,
  onOpenDeleteDialog,
}: EstimateTableToolbarProps) {
  return (
    <div className="xl:hidden">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <ToolbarButton size="icon-xs" aria-label="Действия по смете">
            <MoreHorizontal className="h-4 w-4" />
            <span className="sr-only">Действия по смете</span>
          </ToolbarButton>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuItem className="gap-2" onClick={onOpenCalculationMode}>
            <Calculator className="h-4 w-4 text-muted-foreground" />
            <span>Режим расчета</span>
          </DropdownMenuItem>
          <DropdownMenuItem className="gap-2" onClick={onOpenCreateSectionDialog}>
            <FolderTree className="h-4 w-4 text-muted-foreground" />
            <span>Раздел</span>
          </DropdownMenuItem>
          <DropdownMenuItem className="gap-2" onClick={onOpenSavePattern}>
            <Save className="h-4 w-4 text-muted-foreground" />
            <span>Сохранить</span>
          </DropdownMenuItem>
          <DropdownMenuItem className="gap-2" onClick={onOpenApplyPattern}>
            <FileStack className="h-4 w-4 text-muted-foreground" />
            <span>Шаблон</span>
          </DropdownMenuItem>
          <DropdownMenuItem className="gap-2" onClick={onOpenCoefficientDialog}>
            <Percent className="h-4 w-4 text-muted-foreground" />
            <span>Коэффициент</span>
          </DropdownMenuItem>
          <DropdownMenuItem className="gap-2" disabled={isImporting} onClick={onImportEstimate}>
            <FileUp className="h-4 w-4 text-muted-foreground" />
            <span>{isImporting ? 'Импорт...' : 'Импорт'}</span>
          </DropdownMenuItem>
          <DropdownMenuItem className="gap-2" disabled={isExporting} onClick={onExportXlsx}>
            <FileDown className="h-4 w-4 text-muted-foreground" />
            <span>Экспорт в Excel</span>
          </DropdownMenuItem>
          <DropdownMenuItem className="gap-2" disabled={isExporting} onClick={onExportPdf}>
            <FileDown className="h-4 w-4 text-muted-foreground" />
            <span>Экспорт в PDF</span>
          </DropdownMenuItem>
          <DropdownMenuItem className="gap-2 text-destructive focus:text-destructive" onClick={onOpenDeleteDialog}>
            <Trash2 className="h-4 w-4" />
            <span>Удалить смету</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

export function EstimateTableToolbar(props: EstimateTableToolbarProps) {
  return (
    <div className="flex items-center gap-1.5 sm:gap-2">
      <DesktopPrimaryActions
        onOpenCalculationMode={props.onOpenCalculationMode}
        onOpenCreateSectionDialog={props.onOpenCreateSectionDialog}
        onOpenSavePattern={props.onOpenSavePattern}
      />
      <DesktopSecondaryActions
        isImporting={props.isImporting}
        isExporting={props.isExporting}
        onOpenApplyPattern={props.onOpenApplyPattern}
        onOpenCoefficientDialog={props.onOpenCoefficientDialog}
        onImportEstimate={props.onImportEstimate}
        onExportXlsx={props.onExportXlsx}
        onExportPdf={props.onExportPdf}
      />
      <div className="hidden xl:flex">
        <ToolbarButton variant="destructive" aria-label="Удалить смету" onClick={props.onOpenDeleteDialog} iconLeft={<Trash2 className="h-3.5 w-3.5" />} labelClassName="hidden sm:inline">
          Удалить
        </ToolbarButton>
      </div>
      <MobileOverflowActions {...props} />
    </div>
  );
}
