import * as React from "react"

import { Badge } from "@/shared/ui/badge"
import { cn } from "@/lib/utils"

type BadgeVariant = React.ComponentProps<typeof Badge>["variant"]

const statusBadgeVariantByTone = {
  brand: "default",
  success: "success",
  info: "info",
  warning: "warning",
  danger: "danger",
  neutral: "neutral",
  paused: "paused",
} satisfies Record<string, BadgeVariant>

const statusIndicatorDotClassNames = {
  brand: "bg-brand",
  success: "bg-emerald-500",
  info: "bg-blue-500",
  warning: "bg-amber-500",
  danger: "bg-rose-500",
  neutral: "bg-muted-foreground",
  paused: "bg-violet-500",
} as const

const statusIndicatorPulseClassNames = {
  brand: "bg-brand/50",
  success: "bg-emerald-500/40",
  info: "bg-blue-500/60",
  warning: "bg-amber-500/50",
  danger: "bg-rose-500/50",
  neutral: "bg-muted-foreground/40",
  paused: "bg-violet-500/40",
} as const

const statusIndicatorSizeClassNames = {
  sm: "size-2",
  default: "size-2.5",
} as const

export type StatusTone = keyof typeof statusBadgeVariantByTone
export type StatusIndicatorPulse = "none" | "soft" | "pulse" | "ping"
export type StatusIndicatorSize = keyof typeof statusIndicatorSizeClassNames

type StatusBadgeProps = Omit<React.ComponentProps<typeof Badge>, "variant"> & {
  tone?: StatusTone
}

function StatusBadge({ tone = "neutral", size = "xs", ...props }: StatusBadgeProps) {
  return <Badge variant={statusBadgeVariantByTone[tone]} size={size} {...props} />
}

type StatusIndicatorProps = React.ComponentProps<"span"> & {
  tone?: StatusTone
  size?: StatusIndicatorSize
  pulse?: StatusIndicatorPulse
}

function StatusIndicator({
  tone = "neutral",
  size = "default",
  pulse = "none",
  className,
  ...props
}: StatusIndicatorProps) {
  if (pulse === "none") {
    return (
      <span
        data-slot="status-indicator"
        data-tone={tone}
        data-size={size}
        className={cn(
          "inline-flex shrink-0 rounded-full",
          statusIndicatorSizeClassNames[size],
          statusIndicatorDotClassNames[tone],
          className
        )}
        {...props}
      />
    )
  }

  const pulseAnimationClassName =
    pulse === "ping" ? "animate-ping" : pulse === "pulse" ? "animate-pulse" : undefined

  return (
    <span
      data-slot="status-indicator"
      data-tone={tone}
      data-size={size}
      data-pulse={pulse}
      className={cn("relative inline-flex shrink-0", statusIndicatorSizeClassNames[size], className)}
      {...props}
    >
      <span
        className={cn(
          "absolute inline-flex h-full w-full rounded-full",
          statusIndicatorPulseClassNames[tone],
          pulseAnimationClassName
        )}
      />
      <span
        className={cn(
          "relative inline-flex rounded-full",
          statusIndicatorSizeClassNames[size],
          statusIndicatorDotClassNames[tone]
        )}
      />
    </span>
  )
}

export { StatusBadge, StatusIndicator }
