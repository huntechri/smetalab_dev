"use client"

import * as React from "react"
import { Check, ChevronsUpDown, Plus } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/shared/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/shared/ui/popover"
import { getUniqueUnits } from "@/app/actions/works"

interface UnitSelectProps {
    value: string
    onChange: (value: string) => void
    placeholder?: string
    className?: string
}

export function UnitSelect({ value, onChange, placeholder = "Ед. изм...", className }: UnitSelectProps) {
    const [open, setOpen] = React.useState(false)
    const [units, setUnits] = React.useState<string[]>([])
    const [inputValue, setInputValue] = React.useState("")

    React.useEffect(() => {
        if (open) {
            getUniqueUnits().then(res => {
                if (res.success) {
                    setUnits(res.data);
                }
            })
        }
    }, [open])

    const handleSelect = (currentValue: string) => {
        onChange(currentValue)
        setOpen(false)
    }

    const handleCreate = () => {
        if (inputValue) {
            if (!units.includes(inputValue)) {
                setUnits([...units, inputValue].sort())
            }
            onChange(inputValue)
            setOpen(false)
        }
    }

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className={cn("w-full justify-between font-normal text-xs md:text-sm px-2", className)}
                >
                    <span className="truncate">{value || placeholder}</span>
                    <ChevronsUpDown className="ml-1 h-3 w-3 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[min(20rem,calc(100vw-2rem))] p-0" align="start">
                <Command>
                    <CommandInput
                        placeholder="Поиск или ввод..."
                        value={inputValue}
                        onValueChange={setInputValue}
                    />
                    <CommandList className="max-h-[200px]">
                        <CommandEmpty>
                            <div className="p-1 px-2">
                                <Button
                                    variant="ghost"
                                    className="font-semibold tracking-tight shadow-sm w-full justify-start text-[12px] px-1 text-primary hover:text-primary"
                                    onClick={handleCreate}
                                >
                                    <Plus className="mr-1 h-3 w-3" />
                                    Добавить "{inputValue}"
                                </Button>
                            </div>
                        </CommandEmpty>
                        <CommandGroup>
                            {units.map((unit) => (
                                <CommandItem
                                    key={unit}
                                    value={unit}
                                    onSelect={handleSelect}
                                    className="text-[12px] py-1"
                                >
                                    <Check
                                        className={cn(
                                            "mr-2 h-3 w-3",
                                            value === unit ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                    {unit}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    )
}
