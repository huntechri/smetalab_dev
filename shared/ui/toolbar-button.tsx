"use client"

import * as React from "react"

import { cn } from "@/lib/utils"
import { Button, type ButtonProps } from "@/shared/ui/button"

interface ToolbarButtonProps extends ButtonProps {
    labelClassName?: string
}

const toolbarButtonClassName = "shrink-0 font-semibold tracking-tight shadow-sm transition-all active:scale-95"

export function ToolbarButton({
    variant = "outline",
    size = "xs",
    className,
    labelClassName,
    children,
    ...props
}: ToolbarButtonProps) {
    return (
        <Button
            variant={variant}
            size={size}
            className={cn(toolbarButtonClassName, className)}
            {...props}
        >
            {labelClassName ? <span className={labelClassName}>{children}</span> : children}
        </Button>
    )
}

export { toolbarButtonClassName }
