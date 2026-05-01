"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"
import { Button } from "@/shared/ui/button"
import { Input } from "@/shared/ui/input"
import {
  primitiveInputGroupAddonAlignClassNames,
  primitiveInputGroupAddonBaseClassName,
  primitiveInputGroupButtonBaseClassName,
  primitiveInputGroupButtonSizeClassNames,
  primitiveInputGroupRootClassName,
  primitiveInputGroupTextClassName,
} from "@/shared/ui/primitive-density"
import { Textarea } from "@/shared/ui/textarea"

function InputGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="input-group"
      role="group"
      className={cn(primitiveInputGroupRootClassName, className)}
      {...props}
    />
  )
}

const inputGroupAddonVariants = cva(primitiveInputGroupAddonBaseClassName, {
  variants: {
    align: primitiveInputGroupAddonAlignClassNames,
  },
  defaultVariants: {
    align: "inline-start",
  },
})

function InputGroupAddon({
  className,
  align = "inline-start",
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof inputGroupAddonVariants>) {
  return (
    <div
      role="group"
      data-slot="input-group-addon"
      data-align={align}
      className={cn(inputGroupAddonVariants({ align }), className)}
      onClick={(e) => {
        if ((e.target as HTMLElement).closest("button")) {
          return
        }
        e.currentTarget.parentElement?.querySelector("input")?.focus()
      }}
      {...props}
    />
  )
}

const inputGroupButtonVariants = cva(primitiveInputGroupButtonBaseClassName, {
  variants: {
    size: primitiveInputGroupButtonSizeClassNames,
  },
  defaultVariants: {
    size: "xs",
  },
})

function InputGroupButton({
  type = "button",
  variant = "ghost",
  size = "xs",
  className,
  ...props
}: Omit<React.ComponentProps<typeof Button>, "size"> &
  VariantProps<typeof inputGroupButtonVariants>) {
  return (
    <Button
      type={type}
      data-size={size}
      variant={variant}
      className={cn(inputGroupButtonVariants({ size }), className)}
      {...props}
    />
  )
}

function InputGroupText({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      className={cn(primitiveInputGroupTextClassName, className)}
      {...props}
    />
  )
}

function InputGroupInput(props: Omit<React.ComponentProps<typeof Input>, "variant">) {
  return (
    <Input
      data-slot="input-group-control"
      variant="ghost"
      {...props}
    />
  )
}

function InputGroupTextarea(props: Omit<React.ComponentProps<typeof Textarea>, "variant">) {
  return (
    <Textarea
      data-slot="input-group-control"
      variant="inputGroup"
      {...props}
    />
  )
}

export {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupText,
  InputGroupInput,
  InputGroupTextarea,
}
