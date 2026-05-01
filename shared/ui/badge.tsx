import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import {
  primitiveBadgeBaseClassName,
  primitiveBadgeSizeClassNames,
  primitiveBadgeVariantClassNames,
} from "@/lib/ui/primitive-density"
import { cn } from "@/lib/utils"

const badgeVariants = cva(primitiveBadgeBaseClassName, {
  variants: {
    variant: primitiveBadgeVariantClassNames,
    size: primitiveBadgeSizeClassNames,
  },
  defaultVariants: {
    variant: "default",
    size: "default",
  },
})

function Badge({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "span"

  return (
    <Comp
      data-slot="badge"
      data-variant={variant}
      data-size={size}
      className={cn(badgeVariants({ variant, size }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
