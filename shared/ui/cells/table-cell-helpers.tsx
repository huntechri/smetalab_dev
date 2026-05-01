import * as React from "react"

import { cn } from "@/lib/utils"
import { Input, type InputProps } from "@/shared/ui/input"

export function formatCurrencyRu(value: number | string | null | undefined) {
  const parsed = typeof value === "number" ? value : Number.parseFloat(String(value ?? 0))
  const amount = Number.isFinite(parsed) ? parsed : 0

  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
    minimumFractionDigits: 0,
  }).format(amount)
}

type PlaceholderTextCellProps = Omit<InputProps, "onChange" | "value"> & {
  value: string | number | null | undefined
  onValueChange: (nextValue: string) => void
}

export function PlaceholderTextCell({
  value,
  onValueChange,
  placeholder,
  ...props
}: PlaceholderTextCellProps) {
  return (
    <Input
      placeholder={placeholder}
      value={value ?? ""}
      onChange={(event) => onValueChange(event.target.value)}
      {...props}
    />
  )
}

type PlaceholderNumberCellProps = Omit<InputProps, "onChange" | "type" | "value"> & {
  value: string | number | null | undefined
  onValueChange: (nextValue: number) => void
}

export function PlaceholderNumberCell({
  value,
  onValueChange,
  placeholder,
  ...props
}: PlaceholderNumberCellProps) {
  return (
    <Input
      type="number"
      placeholder={placeholder}
      value={value ?? ""}
      onChange={(event) => onValueChange(Number(event.target.value))}
      {...props}
    />
  )
}

type FormattedCurrencyCellProps = {
  value: number | string | null | undefined
  className?: string
}

export function FormattedCurrencyCell({ value, className }: FormattedCurrencyCellProps) {
  return (
    <div className={cn("text-center font-bold text-xs tracking-tight", className)}>
      {formatCurrencyRu(value)}
    </div>
  )
}

type CenteredUnitCellProps = React.HTMLAttributes<HTMLDivElement> & {
  value: React.ReactNode
}

export function CenteredUnitCell({ value, className, ...props }: CenteredUnitCellProps) {
  return (
    <div className={cn("text-center text-xs text-muted-foreground font-medium", className)} {...props}>
      {value}
    </div>
  )
}
