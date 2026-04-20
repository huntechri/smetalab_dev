import * as React from "react"
import { cn } from "@/lib/utils"

interface MoneyCellProps extends React.HTMLAttributes<HTMLSpanElement> {
  value: number
  currency?: string
  locale?: string
  maximumFractionDigits?: number
}

export function MoneyCell({
  value,
  currency = "RUB",
  locale = "ru-RU",
  maximumFractionDigits = 0,
  className,
  ...props
}: MoneyCellProps) {
  return (
    <span
      className={cn("tabular-nums text-inherit font-inherit", className)}
      {...props}
    >
      {new Intl.NumberFormat(locale, {
        style: "currency",
        currency,
        maximumFractionDigits,
      }).format(value)}
    </span>
  )
}
