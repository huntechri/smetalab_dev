"use client"

import * as React from "react"

import { FormLabel } from "@/shared/ui/form"
import { RadioGroup, RadioGroupItem } from "@/shared/ui/radio-group"
import { cn } from "@/lib/utils"

export const DEFAULT_DIRECTORY_ENTITY_COLOR = "hsl(var(--primary))"

export function DirectorySheetForm({ children }: { children: React.ReactNode }) {
  return <div className="space-y-4">{children}</div>
}

export function DirectorySheetGrid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-2 gap-4">{children}</div>
}

export function DirectoryFormLabel({ children }: { children: React.ReactNode }) {
  return <FormLabel className="text-xs">{children}</FormLabel>
}

interface DirectoryInlineRadioOption {
  value: string
  label: string
}

interface DirectoryInlineRadioGroupProps {
  value: string
  onValueChange: (value: string) => void
  options: DirectoryInlineRadioOption[]
}

export function DirectoryInlineRadioGroup({
  value,
  onValueChange,
  options,
}: DirectoryInlineRadioGroupProps) {
  return (
    <RadioGroup onValueChange={onValueChange} value={value} className="flex h-8 flex-row items-center gap-2 sm:gap-4">
      {options.map((option) => (
        <label key={option.value} className="flex items-center gap-1 space-y-0 sm:gap-2">
          <RadioGroupItem value={option.value} className="size-3.5" />
          <span className="whitespace-nowrap text-[10px] font-normal sm:text-xs">{option.label}</span>
        </label>
      ))}
    </RadioGroup>
  )
}

export function DirectoryColorInputFrame({ children }: { children: React.ReactNode }) {
  return <div className="w-14">{children}</div>
}

export function directorySheetBodyClassName(className?: string) {
  return cn("space-y-4 px-4 pb-4 pt-4 sm:px-6 sm:pb-6", className)
}
