import * as React from "react";
import { cn } from "@/lib/utils";
import {
    Card,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/shared/ui/card";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/shared/ui/tooltip";

interface KPICardProps extends React.ComponentProps<typeof Card> {
    title: string;
    value: string | number;
    description?: string;
    icon?: React.ReactNode;
    badge?: React.ReactNode;
    tooltip?: string;
    valueClassName?: string;
    isGradient?: boolean;
}

export function KPICard({
    title,
    value,
    description,
    icon,
    badge,
    tooltip,
    valueClassName,
    isGradient = false,
    className,
    ...props
}: KPICardProps) {
    const content = (
        <Card
            className={cn(
                "overflow-hidden transition-all duration-200 flex flex-col gap-0",
                isGradient && "bg-linear-to-t from-primary/5 to-card dark:bg-card shadow-sm",
                !isGradient && "bg-transparent shadow-none",
                className
            )}
            {...props}
        >
            <div className="flex flex-col justify-center flex-1 p-2 sm:p-3 md:p-4 min-h-0">
                <CardHeader className="p-0 space-y-0 relative">
                    <CardDescription className="text-[9px] sm:text-[10px] md:text-[11px] font-medium uppercase tracking-wider text-muted-foreground/70 leading-none">
                        {title}
                    </CardDescription>
                    <CardTitle
                        className={cn(
                            "text-base sm:text-lg md:text-2xl lg:text-[24px] font-bold tabular-nums wrap-break-word leading-tight mt-0.5 sm:mt-1 mb-0",
                            valueClassName
                        )}
                    >
                        {value}
                    </CardTitle>
                    {(badge || icon) && (
                        <div className="absolute right-0 top-0">
                            {badge || (icon && <div className="rounded-md p-1 bg-primary/10 text-primary">{icon}</div>)}
                        </div>
                    )}
                </CardHeader>
                {description && (
                    <div className="flex items-center justify-between mt-0.5">
                        <span className="text-[10px] sm:text-[11px] text-muted-foreground font-medium opacity-70 leading-none">
                            {description}
                        </span>
                    </div>
                )}
            </div>
        </Card>
    );

    if (tooltip) {
        return (
            <Tooltip>
                <TooltipTrigger asChild>{content}</TooltipTrigger>
                <TooltipContent side="bottom" sideOffset={8}>
                    {tooltip}
                </TooltipContent>
            </Tooltip>
        );
    }

    return content;
}
