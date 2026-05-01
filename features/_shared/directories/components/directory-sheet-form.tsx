"use client"

import * as React from "react"

import { cn } from "@/lib/utils"
import {
  DEFAULT_DIRECTORY_ENTITY_COLOR,
  directorySheetFormClassNames,
} from "@/shared/ui/shells/catalog-directory-visual-contracts"
import { FormLabel } from "@/shared/ui/form"
import { RadioGroup, RadioGroupItem } from "@/shared/ui/radio-group"

export { DEFAULT_DIRECTORY_ENTITY_COLOR }

export function DirectorySheetForm({ children }: { children: React.ReactNode }) {
  return <div className={directorySheetFormClassNames.form}>{children}</div>
}

export function DirectorySheetGrid({ children }: { children: React.ReactNode }) {
  return <div className={directorySheetFormClassNames.grid}>{children}</div>
}

export function DirectoryFormLabel({ children }: { children: React.ReactNode }) {
  return <FormLabel className={directorySheetFormClassNames.label}>{children}</FormLabel>
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
    <RadioGroup onValueChange={onValueChange} value={value} className={directorySheetFormClassNames.radioGroup}>
      {options.map((option) => (
        <label key={option.value} className={directorySheetFormClassNames.radioLabel}>
          <RadioGroupItem value={option.value} className={directorySheetFormClassNames.radioItem} />
          <span className={directorySheetFormClassNames.radioText}>{option.label}</span>
        </label>
      ))}
    </RadioGroup>
  )
}

export function DirectoryColorInputFrame({ children }: { children: React.ReactNode }) {
  return <div className={directorySheetFormClassNames.colorInputFrame}>{children}</div>
}

export function directorySheetBodyClassName(className?: string) {
  return cn(directorySheetFormClassNames.body, className)
}
