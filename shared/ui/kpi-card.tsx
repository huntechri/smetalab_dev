import * as React from "react";
import { cn } from "@/lib/utils";
import { CardShell, CardShellBody } from "@/shared/ui/card-shell";
import { Skeleton } from "@/shared/ui/skeleton";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/shared/ui/tooltip";

export type KPICardValueTone = "default" | "muted" | "positive" | "negative" | "warning";
type KPICardDensity = "default" | "dashboard";

const KPI_CARD_VALUE_TONE_CLASS_NAME: Record<KPICardValueTone, string> = {
    default: "text-foreground",
    muted: "text-muted-foreground",
    positive: "text-primary",
    negative: "text-destructive",
    warning: "text-foreground",
};

const KPI_CARD_DENSITY_CLASS_NAME: Record<KPICardDensity, string> = {
    default: "",
    dashboard: "min-h-20 sm:min-h-24",
};

interface KPICardProps extends Omit<React.ComponentProps<typeof CardShell>, "density"> {
    title: string;
    value: string | number;
    description?: string;
    icon?: React.ReactNode;
    badge?: React.ReactNode;
    tooltip?: string;
    valueClassName?: string;
    valueTone?: KPICardValueTone;
    density?: KPICardDensity;
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
    valueTone = "default",
    density = "default",
    isGradient = false,
    className,
    ...props
}: KPICardProps) {
    const content = (
        <CardShell
            className={cn(
                "transition-all duration-200",
                isGradient && "bg-linear-to-t from-primary/5 to-card dark:bg-card",
                KPI_CARD_DENSITY_CLASS_NAME[density],
                className
            )}
            density="compact"
            shadow={isGradient ? "sm" : "none"}
            variant={isGradient ? "card" : "ghost"}
            {...props}
        >
            <CardShellBody className="flex min-h-0 flex-1 flex-col justify-center" density="compact">
                <div className="relative space-y-0">
                    <div className="text-[9px] sm:text-[10px] md:text-[11px] font-medium uppercase tracking-wider text-muted-foreground/70 leading-none">
                        {title}
                    </div>
                    <div
                        className={cn(
                            "text-base sm:text-lg md:text-2xl lg:text-[24px] font-bold tabular-nums wrap-break-word leading-tight mt-0.5 sm:mt-1 mb-0",
                            KPI_CARD_VALUE_TONE_CLASS_NAME[valueTone],
                            valueClassName
                        )}
                    >
                        {value}
                    </div>
                    {(badge || icon) && (
                        <div className="absolute right-0 top-0">
                            {badge || (icon && <div className="rounded-md p-1 bg-primary/10 text-primary">{icon}</div>)}
                        </div>
                    )}
                </div>
                {description && (
                    <div className="flex items-center justify-between mt-0.5">
                        <span className="text-[10px] sm:text-[11px] text-muted-foreground font-medium opacity-70 leading-none">
                            {description}
                        </span>
                    </div>
                )}
            </CardShellBody>
        </CardShell>
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

export function KPICardGrid({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            className={cn("grid grid-cols-2 gap-2 sm:gap-3 md:gap-4 xl:grid-cols-4", className)}
            {...props}
        />
    );
}

export function KPICardGridSkeleton({ count = 4 }: { count?: number }) {
    return (
        <KPICardGrid>
            {Array.from({ length: count }, (_, index) => (
                <Skeleton key={index} className="min-h-20 rounded-xl sm:min-h-24" />
            ))}
        </KPICardGrid>
    );
}
