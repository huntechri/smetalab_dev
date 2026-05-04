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
