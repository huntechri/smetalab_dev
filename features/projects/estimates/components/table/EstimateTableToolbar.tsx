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
      <ToolbarButton aria-label="Режим расчета" onClick={onOpenCalculationMode} iconLeft={<Calculator />} labelClassName="hidden sm:inline">
        Режим расчета
      </ToolbarButton>
      <ToolbarButton aria-label="Добавить раздел" onClick={onOpenCreateSectionDialog} iconLeft={<FolderTree />} labelClassName="hidden sm:inline">
        Раздел
      </ToolbarButton>
      <ToolbarButton aria-label="Сохранить смету" onClick={onOpenSavePattern} iconLeft={<Save />} labelClassName="hidden sm:inline">
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
      <ToolbarButton onClick={onOpenApplyPattern} iconLeft={<FileStack />}>
        Шаблон
      </ToolbarButton>
      <ToolbarButton onClick={onOpenCoefficientDialog} iconLeft={<Percent />}>
        Коэффициент
      </ToolbarButton>
      <ToolbarButton onClick={onImportEstimate} disabled={isImporting} iconLeft={<FileUp />}>
        {isImporting ? 'Импорт...' : 'Импорт'}
      </ToolbarButton>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <ToolbarButton disabled={isExporting} iconLeft={<FileDown />}>
            {isExporting ? 'Экспорт...' : 'Экспорт'}
          </ToolbarButton>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={onExportXlsx}>
            <FileDown />
            <span>Экспорт в Excel (.xlsx)</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onExportPdf}>
            <FileDown />
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
            <MoreHorizontal />
            <span className="sr-only">Действия по смете</span>
          </ToolbarButton>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={onOpenCalculationMode}>
            <Calculator />
            <span>Режим расчета</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onOpenCreateSectionDialog}>
            <FolderTree />
            <span>Раздел</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onOpenSavePattern}>
            <Save />
            <span>Сохранить</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onOpenApplyPattern}>
            <FileStack />
            <span>Шаблон</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onOpenCoefficientDialog}>
            <Percent />
            <span>Коэффициент</span>
          </DropdownMenuItem>
          <DropdownMenuItem disabled={isImporting} onClick={onImportEstimate}>
            <FileUp />
            <span>{isImporting ? 'Импорт...' : 'Импорт'}</span>
          </DropdownMenuItem>
          <DropdownMenuItem disabled={isExporting} onClick={onExportXlsx}>
            <FileDown />
            <span>Экспорт в Excel</span>
          </DropdownMenuItem>
          <DropdownMenuItem disabled={isExporting} onClick={onExportPdf}>
            <FileDown />
            <span>Экспорт в PDF</span>
          </DropdownMenuItem>
          <DropdownMenuItem variant="destructive" onClick={onOpenDeleteDialog}>
            <Trash2 />
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
        <ToolbarButton variant="destructive" aria-label="Удалить смету" onClick={props.onOpenDeleteDialog} iconLeft={<Trash2 />} labelClassName="hidden sm:inline">
          Удалить
        </ToolbarButton>
      </div>
      <MobileOverflowActions {...props} />
    </div>
  );
}
