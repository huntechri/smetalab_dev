'use client';

import type { ChangeEvent, RefObject } from 'react';
import { Download, Upload } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui/tooltip';

interface GlobalPurchasesImportExportActionsProps {
  importInputRef: RefObject<HTMLInputElement | null>;
  onExport: () => void;
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
        accept=".csv"
        className="hidden"
        onChange={(event) => void onFileChange(event)}
      />

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8 gap-1.5 px-0 size-8 sm:size-auto sm:px-3 text-xs md:text-sm"
            onClick={onExport}
            aria-label="Экспорт закупок"
          >
            <Download className="size-4" />
            <span className="hidden sm:inline">Экспорт CSV</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>Экспортировать отображаемые строки в CSV</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8 gap-1.5 px-0 size-8 sm:size-auto sm:px-3 text-xs md:text-sm"
            onClick={onImportClick}
            aria-label="Импорт закупок"
          >
            <Upload className="size-4" />
            <span className="hidden sm:inline">Импорт CSV</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>Импортировать строки закупок из CSV</TooltipContent>
      </Tooltip>
    </>
  );
}
