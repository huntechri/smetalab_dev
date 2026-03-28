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
  const buttonClassName = 'h-8 px-2 gap-1.5 bg-transparent hover:bg-[hsl(240_4.7%_96%_/_0.82)] text-[14px] leading-[21px] font-medium font-[Manrope] rounded-[7.6px] border border-[hsl(240_5.9%_90%_/_0.7)] text-[hsl(240_10%_3.9%)] shadow-none transition-all justify-center';

  return (
    <>
      <input
        ref={importInputRef}
        type="file"
        accept=".csv"
        className="hidden"
        aria-label="Импорт закупок из CSV"
        title="Импорт закупок из CSV"
        onChange={(event) => void onFileChange(event)}
      />

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className={buttonClassName}
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
            variant="secondary"
            size="sm"
            className={buttonClassName}
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
