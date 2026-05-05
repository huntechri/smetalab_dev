"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"
import { Label } from "@/shared/ui/label"

export const fieldStackClassName = "space-y-2"
export const formHelperTextClassName = "text-[0.8rem] text-muted-foreground"
export const formErrorTextClassName = "text-[0.8rem] font-medium text-destructive"

const formLayoutVariants = cva("grid w-full", {
  variants: {
    gap: {
      none: "gap-0",
      compact: "gap-3",
      default: "gap-4",
      comfortable: "gap-6",
    },
    maxWidth: {
      none: "",
      sm: "md:max-w-sm",
      md: "md:max-w-md",
      lg: "md:max-w-lg",
      xl: "md:max-w-xl",
      "2xl": "md:max-w-2xl",
    },
    padding: {
      none: "",
      dialog: "py-4",
    },
  },
  defaultVariants: {
    gap: "default",
    maxWidth: "none",
    padding: "none",
  },
})

const formSectionVariants = cva("grid w-full", {
  variants: {
    gap: {
      compact: "gap-3",
      default: "gap-4",
      comfortable: "gap-6",
    },
    columns: {
      one: "grid-cols-1",
      two: "grid-cols-1 sm:grid-cols-2",
      three: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
      four: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
    },
    maxWidth: {
      none: "",
      sm: "md:max-w-sm",
      md: "md:max-w-md",
      lg: "md:max-w-lg",
      xl: "md:max-w-xl",
      "2xl": "md:max-w-2xl",
    },
    padding: {
      none: "",
      dialog: "py-4",
    },
  },
  defaultVariants: {
    gap: "default",
    columns: "one",
    maxWidth: "none",
    padding: "none",
  },
})

const fieldRowVariants = cva("grid grid-cols-1 items-start gap-2 sm:grid-cols-4 sm:gap-4", {
  variants: {
    align: {
      start: "sm:items-start",
      center: "sm:items-center",
    },
  },
  defaultVariants: {
    align: "center",
  },
})

const formStatusMessageVariants = cva("text-sm", {
  variants: {
    tone: {
      error: "font-medium text-destructive",
      success: "font-medium text-emerald-700",
      warning: "font-medium text-amber-700",
      info: "text-muted-foreground",
    },
  },
  defaultVariants: {
    tone: "info",
  },
})

type FormLayoutProps = React.ComponentPropsWithoutRef<"form"> &
  VariantProps<typeof formLayoutVariants>

const FormLayout = React.forwardRef<HTMLFormElement, FormLayoutProps>(
  ({ className, gap, maxWidth, padding, ...props }, ref) => {
    return (
      <form
        ref={ref}
        className={cn(formLayoutVariants({ gap, maxWidth, padding }), className)}
        {...props}
      />
    )
  }
)
FormLayout.displayName = "FormLayout"

type FormSectionProps = React.ComponentPropsWithoutRef<"div"> &
  VariantProps<typeof formSectionVariants>

const FormSection = React.forwardRef<HTMLDivElement, FormSectionProps>(
  ({ className, gap, columns, maxWidth, padding, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(formSectionVariants({ gap, columns, maxWidth, padding }), className)}
        {...props}
      />
    )
  }
)
FormSection.displayName = "FormSection"

type FieldStackProps = React.ComponentPropsWithoutRef<"div"> & {
  label?: React.ReactNode
  htmlFor?: string
  helper?: React.ReactNode
  error?: React.ReactNode
  labelClassName?: string
}

const FieldStack = React.forwardRef<HTMLDivElement, FieldStackProps>(
  ({ className, label, htmlFor, helper, error, labelClassName, children, ...props }, ref) => {
    return (
      <div ref={ref} className={cn(fieldStackClassName, className)} {...props}>
        {label ? (
          <Label htmlFor={htmlFor} className={labelClassName}>
            {label}
          </Label>
        ) : null}
        {children}
        {helper ? <FormHelperText>{helper}</FormHelperText> : null}
        {error ? <FormErrorText>{error}</FormErrorText> : null}
      </div>
    )
  }
)
FieldStack.displayName = "FieldStack"

type FieldRowProps = React.ComponentPropsWithoutRef<"div"> &
  VariantProps<typeof fieldRowVariants> & {
    label: React.ReactNode
    htmlFor?: string
    helper?: React.ReactNode
    error?: React.ReactNode
    labelClassName?: string
    controlClassName?: string
  }

const FieldRow = React.forwardRef<HTMLDivElement, FieldRowProps>(
  (
    {
      className,
      align,
      label,
      htmlFor,
      helper,
      error,
      labelClassName,
      controlClassName,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <div ref={ref} className={cn(fieldRowVariants({ align }), className)} {...props}>
        <Label
          htmlFor={htmlFor}
          className={cn("text-xs text-muted-foreground sm:text-right sm:text-foreground", labelClassName)}
        >
          {label}
        </Label>
        <div className={cn("sm:col-span-3", controlClassName)}>
          {children}
          {helper ? <FormHelperText>{helper}</FormHelperText> : null}
          {error ? <FormErrorText>{error}</FormErrorText> : null}
        </div>
      </div>
    )
  }
)
FieldRow.displayName = "FieldRow"

type TextProps = React.ComponentPropsWithoutRef<"p">

const FormHelperText = React.forwardRef<HTMLParagraphElement, TextProps>(
  ({ className, ...props }, ref) => {
    return <p ref={ref} className={cn(formHelperTextClassName, className)} {...props} />
  }
)
FormHelperText.displayName = "FormHelperText"

const FormErrorText = React.forwardRef<HTMLParagraphElement, TextProps>(
  ({ className, ...props }, ref) => {
    return <p ref={ref} className={cn(formErrorTextClassName, className)} {...props} />
  }
)
FormErrorText.displayName = "FormErrorText"

type FormStatusMessageProps = TextProps & VariantProps<typeof formStatusMessageVariants>

const FormStatusMessage = React.forwardRef<HTMLParagraphElement, FormStatusMessageProps>(
  ({ className, tone, ...props }, ref) => {
    return (
      <p
        ref={ref}
        className={cn(formStatusMessageVariants({ tone }), className)}
        {...props}
      />
    )
  }
)
FormStatusMessage.displayName = "FormStatusMessage"

// ─── FormSectionHeader ─────────────────────────────────────────────────────

export type FormSectionHeaderProps = React.ComponentPropsWithoutRef<'div'> & {
  icon?: React.ReactNode;
  title: string;
};

/** Section header with icon (e.g., Phone, User, FileText, Landmark) */
export function FormSectionHeader({ icon, title, className, ...props }: FormSectionHeaderProps) {
  return (
    <div className={cn('flex items-center gap-2 font-medium', className)} {...props}>
      {icon ? <span className="text-muted-foreground">{icon}</span> : null}
      {title}
    </div>
  );
}

// ─── RadioGroupRow ───────────────────────────────────────────────────────────────

export type RadioGroupRowProps = React.ComponentPropsWithoutRef<'div'>;

/** Inline flex row for RadioGroup items */
export function RadioGroupRow({ className, children, ...props }: RadioGroupRowProps) {
  return (
    <div className={cn('flex flex-row items-center gap-2 sm:gap-4', className)} {...props}>
      {children}
    </div>
  );
}

export {
  FieldRow,
  FieldStack,
  FormErrorText,
  FormHelperText,
  FormLayout,
  FormSection,
  FormStatusMessage,
  formLayoutVariants,
  formSectionVariants,
}
