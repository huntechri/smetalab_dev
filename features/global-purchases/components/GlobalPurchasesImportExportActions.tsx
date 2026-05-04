'use client';

import type { ChangeEvent, RefObject } from 'react';
import { Download, Upload } from 'lucide-react';
import { FileInput } from '@/shared/ui/file-input';
import { ToolbarButton } from '@/shared/ui/toolbar-button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui/tooltip';

interface GlobalPurchasesImportExportActionsProps {
  importInputRef: RefObject<HTMLInputElement | null>;
  onExport: () => void | Promise<void>;
  onImportClick: () => void;
  onFileChange: (event: ChangeEvent<HTMLInputElement>) => void;
}

export function GlobalPurchasesImportExportActions({
  importInputRef,
  onExport,
  onImportClick,
  onFileChange,
}: GlobalPurchasesImportExportActionsProps) {
  return (
    <>
      <FileInput
        ref={importInputRef}
        accept=".csv,.xlsx"
        className="hidden"
        aria-label="Импорт закупок из CSV/XLSX"
        title="Импорт закупок из CSV/XLSX"
        onChange={(event) => void onFileChange(event)}
      />

      <Tooltip>
        <TooltipTrigger asChild>
          <ToolbarButton
            type="button"
            onClick={() => void onExport()}
            aria-label="Экспорт закупок"
            iconLeft={<Download />}
            labelClassName="hidden sm:inline"
          >
            Экспорт XLSX
          </ToolbarButton>
        </TooltipTrigger>
        <TooltipContent>Экспортировать отображаемые строки в XLSX</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <ToolbarButton
            type="button"
            onClick={onImportClick}
            aria-label="Импорт закупок"
            iconLeft={<Upload />}
            labelClassName="hidden sm:inline"
          >
            Импорт CSV/XLSX
          </ToolbarButton>
        </TooltipTrigger>
        <TooltipContent>Импортировать строки закупок из CSV или XLSX</TooltipContent>
      </Tooltip>
    </>
  );
}
