'use client';

import { BookOpen, CalendarDays, Check, ChevronsUpDown, Download, Filter, MoreHorizontal, Plus, Upload } from 'lucide-react';
import type { DateRange } from 'react-day-picker';
import { ru } from 'date-fns/locale';

import { ToolbarButton } from '@/shared/ui/toolbar-button';
import { Calendar } from '@/shared/ui/calendar';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/shared/ui/command';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/shared/ui/dropdown-menu';
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/ui/popover';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui/tooltip';
import { cn } from '@/lib/utils';
import {
  denseListCalendarPopoverClassName,
  denseListPickerPopoverClassName,
  denseListToolbarActionsClassName,
  denseListToolbarChevronClassName,
  denseListToolbarDateLabelClassName,
  denseListToolbarDividerClassName,
  denseListToolbarFilterContentClassName,
  denseListToolbarFilterLabelClassName,
  denseListToolbarMenuContentClassName,
  denseListToolbarMenuItemClassName,
  denseListToolbarMobileActionsClassName,
  denseListToolbarRowClassName,
} from '@/shared/ui/dense-list';

import type { ProjectOption, PurchaseRowsRange } from '@/shared/types/domain/purchase-row';
import { formatLocalDateToIso, parseIsoDateSafe } from '../lib/date';
import { GlobalPurchasesImportExportActions } from './GlobalPurchasesImportExportActions';

interface ProjectFilterControlProps {
  filterProjectId: string | null;
  projectOptions: ProjectOption[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onFilterChange: (projectId: string | null) => void;
}

function ProjectFilterControl({
  filterProjectId,
  projectOptions,
  open,
  onOpenChange,
  onFilterChange,
}: ProjectFilterControlProps) {
  const activeProjectName =
    filterProjectId === 'none'
      ? 'Без привязки'
      : projectOptions.find((project) => project.id === filterProjectId)?.name ?? 'Все объекты';

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <Tooltip>
        <TooltipTrigger asChild>
          <PopoverTrigger asChild>
            <ToolbarButton>
              <div className={denseListToolbarFilterContentClassName}>
                <Filter />
                <span className={denseListToolbarFilterLabelClassName}>{activeProjectName}</span>
              </div>
              <ChevronsUpDown className={denseListToolbarChevronClassName} />
            </ToolbarButton>
          </PopoverTrigger>
        </TooltipTrigger>
        <TooltipContent>Фильтровать закупки по объекту</TooltipContent>
      </Tooltip>

      <PopoverContent className={denseListPickerPopoverClassName} align="start">
        <Command>
          <CommandInput placeholder="Поиск объекта..." />
          <CommandList>
            <CommandEmpty>Объект не найден.</CommandEmpty>
            <CommandGroup>
              <CommandItem
                onSelect={() => {
                  onFilterChange(null);
                  onOpenChange(false);
                }}
              >
                <Check className={cn('mr-2 h-4 w-4', !filterProjectId ? 'opacity-100' : 'opacity-0')} />
                Все объекты
              </CommandItem>
              <CommandItem
                onSelect={() => {
                  onFilterChange('none');
                  onOpenChange(false);
                }}
              >
                <Check className={cn('mr-2 h-4 w-4', filterProjectId === 'none' ? 'opacity-100' : 'opacity-0')} />
                Без привязки
              </CommandItem>
              {projectOptions.map((project) => (
                <CommandItem
                  key={project.id}
                  value={project.name}
                  onSelect={() => {
                    onFilterChange(project.id);
                    onOpenChange(false);
                  }}
                >
                  <Check className={cn('mr-2 h-4 w-4', project.id === filterProjectId ? 'opacity-100' : 'opacity-0')} />
                  <span className="truncate">{project.name}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

interface DateRangeFilterControlProps {
  range: PurchaseRowsRange;
  onRangeChange: (range: PurchaseRowsRange) => void;
}

function DateRangeFilterControl({ range, onRangeChange }: DateRangeFilterControlProps) {
  const handleDateRangeSelect = (nextRange: DateRange | undefined) => {
    if (!nextRange?.from) {
      return;
    }

    onRangeChange({
      from: formatLocalDateToIso(nextRange.from),
      to: formatLocalDateToIso(nextRange.to ?? nextRange.from),
    });
  };

  return (
    <Popover>
      <Tooltip>
        <TooltipTrigger asChild>
          <PopoverTrigger asChild>
            <ToolbarButton type="button">
              <CalendarDays />
              <span className={denseListToolbarDateLabelClassName}>
                {range.from === range.to ? range.from : `${range.from} → ${range.to}`}
              </span>
            </ToolbarButton>
          </PopoverTrigger>
        </TooltipTrigger>
        <TooltipContent>Выберете период отображения закупок</TooltipContent>
      </Tooltip>
      <PopoverContent className={denseListCalendarPopoverClassName} align="start">
        <Calendar
          mode="range"
          selected={{ from: parseIsoDateSafe(range.from), to: parseIsoDateSafe(range.to) }}
          onSelect={handleDateRangeSelect}
          locale={ru}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}

interface GlobalPurchasesToolbarProps {
  filterProjectId: string | null;
  projectOptions: ProjectOption[];
  openProjectFilter: boolean;
  onOpenProjectFilterChange: (open: boolean) => void;
  onFilterProjectChange: (projectId: string | null) => void;
  range: PurchaseRowsRange;
  onRangeChange: (range: PurchaseRowsRange) => void;
  importInputRef: React.RefObject<HTMLInputElement | null>;
  onExport: () => void;
  onImportClick: () => void;
  onFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  isAddingManual: boolean;
  isAddingCatalog: boolean;
  onAddManual: () => void;
  onAddCatalog: () => void;
}

export function GlobalPurchasesToolbar({
  filterProjectId,
  projectOptions,
  openProjectFilter,
  onOpenProjectFilterChange,
  onFilterProjectChange,
  range,
  onRangeChange,
  importInputRef,
  onExport,
  onImportClick,
  onFileChange,
  isAddingManual,
  isAddingCatalog,
  onAddManual,
  onAddCatalog,
}: GlobalPurchasesToolbarProps) {
  return (
    <div className={denseListToolbarRowClassName}>
      <div className={denseListToolbarRowClassName}>
        <ProjectFilterControl
          filterProjectId={filterProjectId}
          projectOptions={projectOptions}
          open={openProjectFilter}
          onOpenChange={onOpenProjectFilterChange}
          onFilterChange={onFilterProjectChange}
        />

        <DateRangeFilterControl range={range} onRangeChange={onRangeChange} />
      </div>

      <div className={denseListToolbarDividerClassName} />

      <div className={denseListToolbarActionsClassName}>
        <GlobalPurchasesImportExportActions
          importInputRef={importInputRef}
          onExport={onExport}
          onImportClick={onImportClick}
          onFileChange={onFileChange}
        />

        <Tooltip>
          <TooltipTrigger asChild>
            <ToolbarButton
              type="button"
              onClick={onAddManual}
              disabled={isAddingManual}
              aria-label="Добавить строку вручную"
              iconLeft={<Plus />}
              labelClassName="hidden sm:inline"
            >
              Вручную
            </ToolbarButton>
          </TooltipTrigger>
          <TooltipContent>Добавить пустую строку закупки</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <ToolbarButton
              type="button"
              onClick={onAddCatalog}
              disabled={isAddingCatalog}
              aria-label="Добавить из справочника"
              iconLeft={<BookOpen />}
              labelClassName="hidden sm:inline"
            >
              Из справочника
            </ToolbarButton>
          </TooltipTrigger>
          <TooltipContent>Выбрать материалы из каталога</TooltipContent>
        </Tooltip>
      </div>

      <div className={denseListToolbarMobileActionsClassName}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <ToolbarButton size="icon-xs" aria-label="Действия по закупкам">
              <MoreHorizontal />
            </ToolbarButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className={denseListToolbarMenuContentClassName}>
            <DropdownMenuItem className={denseListToolbarMenuItemClassName} onClick={onImportClick}>
              <Upload className="size-4 text-muted-foreground" />
              <span>Импорт CSV/XLSX</span>
            </DropdownMenuItem>
            <DropdownMenuItem className={denseListToolbarMenuItemClassName} onClick={onExport}>
              <Download className="size-4 text-muted-foreground" />
              <span>Экспорт XLSX</span>
            </DropdownMenuItem>
            <DropdownMenuItem className={denseListToolbarMenuItemClassName} onClick={onAddManual} disabled={isAddingManual}>
              <Plus />
              <span>{isAddingManual ? 'Добавление...' : 'Вручную'}</span>
            </DropdownMenuItem>
            <DropdownMenuItem className={denseListToolbarMenuItemClassName} onClick={onAddCatalog} disabled={isAddingCatalog}>
              <BookOpen />
              <span>Из справочника</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
