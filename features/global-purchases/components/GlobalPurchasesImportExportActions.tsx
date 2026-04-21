'use client';

import type { ChangeEvent, RefObject } from 'react';
import { Download, Upload } from 'lucide-react';
import { Button } from '@/shared/ui/button';
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
      <input
        ref={importInputRef}
        type="file"
        accept=".csv,.xlsx"
        className="hidden"
        aria-label="Импорт закупок из CSV/XLSX"
        title="Импорт закупок из CSV/XLSX"
        onChange={(event) => void onFileChange(event)}
      />

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type="button"
            variant="outline"
            onClick={() => void onExport()}
            aria-label="Экспорт закупок"
          >
            <Download className="size-4" />
            <span className="hidden sm:inline">Экспорт XLSX</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>Экспортировать отображаемые строки в XLSX</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type="button"
            variant="outline"
            onClick={onImportClick}
            aria-label="Импорт закупок"
          >
            <Upload className="size-4" />
            <span className="hidden sm:inline">Импорт CSV/XLSX</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>Импортировать строки закупок из CSV или XLSX</TooltipContent>
      </Tooltip>
    </>
  );
}
