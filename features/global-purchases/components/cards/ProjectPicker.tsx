import { useState } from 'react';
import { Check, ChevronsUpDown, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/shared/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/shared/ui/command';
import type { ProjectOption, PurchaseRow, PurchaseRowPatch } from '../../types/dto';

type ProjectPickerProps = {
  row: PurchaseRow;
  projectOptions: ProjectOption[];
  disabled: boolean;
  onPatchAction: (rowId: string, patch: PurchaseRowPatch) => Promise<void>;
};

export function ProjectPicker({ row, projectOptions, disabled, onPatchAction }: ProjectPickerProps) {
  const [open, setOpen] = useState(false);
  const current = row.projectId ? projectOptions.find((project) => project.id === row.projectId) : null;
  const name = current?.name ?? row.projectName;

  const handleSelect = async (projectId: string | null) => {
    try {
      await onPatchAction(row.id, { projectId });
      setOpen(false);
    } catch {
      // Toast and rollback are handled by the parent/controller layer.
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="xs"
          disabled={disabled}
          aria-label="Выбрать объект"
          className="h-6 sm:h-5 max-w-[14rem] sm:max-w-[12rem] justify-start gap-1 rounded-full border border-slate-200 bg-slate-50 px-1.5 text-[11px] sm:text-[10px] font-semibold text-slate-700 hover:bg-slate-100"
        >
          {disabled ? <Loader2 className="size-3 shrink-0 animate-spin" aria-hidden="true" /> : null}
          <span className="min-w-0 truncate">{name || 'Без объекта'}</span>
          <ChevronsUpDown className="size-3 shrink-0 opacity-60" aria-hidden="true" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[min(20rem,calc(100vw-2rem))] p-0" align="start">
        <Command>
          <CommandInput placeholder="Поиск объекта..." />
          <CommandList>
            <CommandEmpty>Объект не найден.</CommandEmpty>
            <CommandGroup>
              <CommandItem onSelect={() => void handleSelect(null)}>
                <Check className={cn('size-4', !row.projectId ? 'opacity-100' : 'opacity-0')} />
                Без привязки
              </CommandItem>
              {projectOptions.map((project) => (
                <CommandItem key={project.id} value={project.name} onSelect={() => void handleSelect(project.id)}>
                  <Check className={cn('size-4', project.id === row.projectId ? 'opacity-100' : 'opacity-0')} />
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
