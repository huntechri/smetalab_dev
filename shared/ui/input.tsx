import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import {
  primitiveInputBaseClassName,
  primitiveInputSizeClassNames,
  primitiveInputVariantClassNames,
} from "@/shared/ui/primitive-density"
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
    size: "default",
  },
})

type InputProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, "className" | "size"> &
  VariantProps<typeof inputVariants> & {
    numeric?: boolean
    className?: string
  }

function Input({ type, variant, size, textAlign, numeric, className, ...props }: InputProps) {
  const usesColorPickerStyles = type === "color"
  const resolvedSize = size ?? "default"

  return (
    <input
      type={type}
      data-slot="input"
      data-size={resolvedSize}
      className={cn(
        inputVariants({ variant, size: resolvedSize, textAlign }),
        (numeric || type === "number") && "tabular-nums",
        usesColorPickerStyles && "cursor-pointer p-1",
        className
      )}
      {...props}
    />
  )
}

export { Input, inputVariants }
export type { InputProps }
