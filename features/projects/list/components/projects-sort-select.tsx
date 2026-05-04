'use client';

import * as React from 'react';
import { Check, ChevronsUpDown, Filter } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/shared/ui/button';
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from '@/shared/ui/command';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/shared/ui/popover';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/shared/ui/tooltip';
import { ProjectSortOption } from '../../shared/types';

type ProjectsSortSelectProps = {
    value: ProjectSortOption;
    onValueChange: (value: ProjectSortOption) => void;
};

const SORT_OPTIONS: { value: ProjectSortOption; label: string }[] = [
    { value: 'name', label: 'Название (А→Я)' },
    { value: 'contractAmount', label: 'Сумма контракта (по убыв.)' },
    { value: 'startDate', label: 'Дата начала (сначала новые)' },
    { value: 'endDate', label: 'Дата окончания (ближайшие)' },
    { value: 'progress', label: 'Прогресс (по убыв.)' },
];

export function ProjectsSortSelect({ value, onValueChange }: ProjectsSortSelectProps) {
    const [open, setOpen] = React.useState(false);

    const selectedLabel = React.useMemo(() => {
        return SORT_OPTIONS.find((opt) => opt.value === value)?.label ?? 'Сортировка';
    }, [value]);

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <Tooltip>
                <TooltipTrigger asChild>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            size="default"
                        >
                            <Filter className="opacity-60" />
                            <span className="truncate">
                                {selectedLabel}
                            </span>
                            <ChevronsUpDown />
                        </Button>
                    </PopoverTrigger>
                </TooltipTrigger>
                <TooltipContent>Сортировать список проектов</TooltipContent>
            </Tooltip>
            <PopoverContent size="combobox" padding="none" align="start">
                <Command>
                    <CommandInput placeholder="Поиск фильтра..." />
                    <CommandList>
                        <CommandEmpty>Вариант не найден.</CommandEmpty>
                        <CommandGroup>
                            {SORT_OPTIONS.map((option) => (
                                <CommandItem
                                    key={option.value}
                                    value={option.label}
                                    onSelect={() => {
                                        onValueChange(option.value);
                                        setOpen(false);
                                    }}
                                >
                                    <Check
                                        className={cn(
                                            "mr-2 size-4",
                                            option.value === value ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                    <span className="truncate">{option.label}</span>
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}
