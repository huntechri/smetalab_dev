# Canonical Input Spec

Sources: shared/ui/input.tsx, shared/ui/textarea.tsx

```tsx
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

type InputProps = Omit<React.ComponentProps<"input">, "className" | "size"> &
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

```

```tsx
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const textareaVariants = cva(
  "placeholder:text-muted-foreground aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive flex field-sizing-content min-h-16 w-full bg-transparent text-base transition-[color,box-shadow] outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
  {
    variants: {
      variant: {
        default:
          "border-input focus-visible:border-ring focus-visible:ring-ring/25 dark:bg-input/30 rounded-md border px-3 py-2 shadow-xs focus-visible:ring-[1.5px]",
        inputGroup:
          "flex-1 resize-none rounded-none border-0 py-3 shadow-none focus-visible:ring-0 dark:bg-transparent",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Textarea({
  className,
  variant,
  ...props
}: React.ComponentProps<"textarea"> & VariantProps<typeof textareaVariants>) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(textareaVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Textarea, textareaVariants }

```
