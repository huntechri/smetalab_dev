import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { Loader2 } from "lucide-react"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 rounded-md text-sm font-medium whitespace-nowrap transition-all outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "bg-white text-foreground border border-border hover:bg-secondary/80 hover:text-foreground",
        primary: "bg-white text-foreground border border-border hover:bg-secondary/80 hover:text-foreground",
        destructive:
          "bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:bg-destructive/60 dark:focus-visible:ring-destructive/40",
        outline: "bg-white text-foreground border border-border hover:bg-secondary/80 hover:text-foreground",
        secondary: "bg-white text-foreground border border-border hover:bg-secondary/80 hover:text-foreground",
        ghost: "bg-white text-foreground border border-border hover:bg-secondary/80 hover:text-foreground",
        link: "bg-white text-foreground border border-border hover:bg-secondary/80 hover:text-foreground",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        xs: "h-7 px-2 py-1 text-xs has-[>svg]:px-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-8 gap-1.5 rounded-md px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-9",
        "icon-xs": "size-6 rounded-md [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-7",
        "icon-lg": "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "xs",
    },
  }
)

type ButtonProps = React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
    loading?: boolean
    isLoading?: boolean
    loadingText?: string
    iconLeft?: React.ReactNode
    iconRight?: React.ReactNode
  }

function Button({
  className,
  variant = "default",
  size = "xs",
  asChild = false,
  loading = false,
  isLoading = false,
  loadingText,
  disabled,
  children,
  iconLeft,
  iconRight,
  ...props
}: ButtonProps) {
  const resolvedLoading = loading || isLoading
  const Comp = asChild ? Slot : "button"
  const buttonClassName = cn(buttonVariants({ variant, size, className }))

  if (asChild) {
    return (
      <Comp
        data-slot="button"
        data-variant={variant}
        data-size={size}
        className={buttonClassName}
        {...props}
      >
        {children}
      </Comp>
    )
  }

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={buttonClassName}
      disabled={disabled || resolvedLoading}
      aria-busy={resolvedLoading || undefined}
      {...props}
    >
      {resolvedLoading ? (
        <Loader2 className="size-4 animate-spin" aria-hidden="true" />
      ) : (
        iconLeft
      )}
      {resolvedLoading && loadingText ? loadingText : children}
      {!resolvedLoading ? iconRight : null}
    </Comp>
  )
}

export { Button, buttonVariants }
export type { ButtonProps }
