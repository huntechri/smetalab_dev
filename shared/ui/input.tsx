import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const inputVariants = cva(
  "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground w-full min-w-0 text-sm transition-[color,box-shadow] outline-none file:inline-flex file:border-0 file:bg-transparent file:text-xs file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 read-only:bg-muted/50 read-only:cursor-not-allowed aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40",
  {
    variants: {
      variant: {
        default:
          "dark:bg-input/30 border-input rounded-md border bg-transparent px-3 shadow-sm focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50",
        ghost:
          "rounded-none border-0 bg-transparent shadow-none focus-visible:ring-0 dark:bg-transparent flex-1",
      },
      size: {
        default: "h-9 py-1 file:h-5",
        sm: "h-8 py-1 text-xs file:h-4",
        xs: "h-7 px-2 py-0.5 text-xs file:h-4",
      },
      textAlign: {
        left: "text-left",
        center: "text-center",
        right: "text-right",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "xs",
    },
  }
)

type InputProps = Omit<React.ComponentProps<"input">, "className"> &
  VariantProps<typeof inputVariants> & {
    numeric?: boolean
    className?: string
  }

function Input({ type, variant, size, textAlign, numeric, className, ...props }: InputProps) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        inputVariants({ variant, size, textAlign }),
        (numeric || type === "number") && "tabular-nums",
        type === "color" && "cursor-pointer p-1",
        className
      )}
      {...props}
    />
  )
}

export { Input, inputVariants }
export type { InputProps }
