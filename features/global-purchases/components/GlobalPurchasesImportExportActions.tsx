'use client';

import type { ChangeEvent, RefObject } from 'react';
import { Download, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
  const buttonClassName = 'h-8 px-3 gap-1.5 bg-white hover:bg-secondary border border-border rounded-[7.6px] text-[14px] font-medium leading-[20px] transition-all active:scale-95 shadow-none text-foreground justify-center';

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
            variant="secondary"
            size="sm"
            className={buttonClassName}
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
            variant="secondary"
            size="sm"
            className={buttonClassName}
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
