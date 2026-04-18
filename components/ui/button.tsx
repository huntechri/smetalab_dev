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
        default: "bg-background text-foreground border border-border/70 shadow-sm hover:bg-secondary/80",
        primary: "bg-primary text-primary-foreground shadow hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:bg-destructive/60 dark:focus-visible:ring-destructive/40",
        outline: "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        brand: "bg-[#FF6A3D] text-black shadow-sm hover:bg-[#FF865F] focus-visible:ring-[#FF6A3D]/50 transition-all active:scale-95",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        xs: "h-7 px-2 py-1 text-xs has-[>svg]:px-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-8 gap-1.5 rounded-md px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        xl: "h-12 rounded-xl px-8 text-base has-[>svg]:px-6",
        icon: "size-9",
        "icon-xs": "size-7 rounded-md [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-8",
        "icon-lg": "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

type ButtonProps = Omit<React.ComponentProps<"button">, "className"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
    loading?: boolean
    isLoading?: boolean
    loadingText?: string
    iconLeft?: React.ReactNode
    iconRight?: React.ReactNode
  }

function Button({
  variant,
  size,
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
  const buttonClassName = cn(buttonVariants({ variant, size }))

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
