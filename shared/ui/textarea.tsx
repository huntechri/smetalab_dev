import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"
import {
  primitiveTextareaBaseClassName,
  primitiveTextareaVariantClassNames,
} from "@/shared/ui/primitive-density"

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
