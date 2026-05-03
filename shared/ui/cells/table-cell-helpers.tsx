import * as React from "react"

import { cn } from "@/lib/utils"
import { Input, type InputProps } from "@/shared/ui/input"
import { TableCellText } from "@/shared/ui/table-density"

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
  size = "xs",
  ...props
}: PlaceholderTextCellProps) {
  return (
    <Input
      placeholder={placeholder}
      size={size}
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
  size = "xs",
  ...props
}: PlaceholderNumberCellProps) {
  return (
    <Input
      type="number"
      placeholder={placeholder}
      size={size}
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
    <TableCellText align="center" weight="bold" tabular className={cn("tracking-tight", className)}>
      {formatCurrencyRu(value)}
    </TableCellText>
  )
}

type CenteredUnitCellProps = React.HTMLAttributes<HTMLDivElement> & {
  value: React.ReactNode
}

export function CenteredUnitCell({ value, className, ...props }: CenteredUnitCellProps) {
  return (
    <TableCellText as="div" align="center" tone="muted" weight="medium" className={className} {...props}>
      {value}
    </TableCellText>
  )
}
