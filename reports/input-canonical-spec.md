# Canonical Input Spec

Sources: shared/ui/input.tsx, shared/ui/textarea.tsx

```tsx
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import {
  primitiveInputBaseClassName,
  primitiveInputColorPickerClassName,
  primitiveInputSizeClassNames,
  primitiveInputVariantClassNames,
} from "@/shared/ui/primitive-controls"
import { cn } from "@/lib/utils"

const inputVariants = cva(primitiveInputBaseClassName, {
  variants: {
    variant: primitiveInputVariantClassNames,
    size: primitiveInputSizeClassNames,
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
})

type InputProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, "className" | "size"> &
  VariantProps<typeof inputVariants> & {
    numeric?: boolean
    className?: string
  }

function Input({ type, variant, size, textAlign, numeric, className, ...props }: InputProps) {
  const usesColorPickerStyles = type === "color"

  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        inputVariants({ variant, size, textAlign }),
        (numeric || type === "number") && "tabular-nums",
        usesColorPickerStyles && primitiveInputColorPickerClassName,
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

import {
  primitiveTextareaBaseClassName,
  primitiveTextareaVariantClassNames,
} from "@/shared/ui/primitive-controls"
import { cn } from "@/lib/utils"

const textareaVariants = cva(primitiveTextareaBaseClassName, {
  variants: {
    variant: primitiveTextareaVariantClassNames,
  },
  defaultVariants: {
    variant: "default",
  },
})

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
