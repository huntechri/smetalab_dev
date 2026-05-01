import * as React from "react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/shared/ui/skeleton";

export function DashboardPageStack({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return <div className={cn("flex flex-col gap-4 pb-4 lg:gap-6 lg:pb-6", className)} {...props} />;
}

export function DashboardSectionStack({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return <div className={cn("space-y-4 lg:space-y-10", className)} {...props} />;
}

export function DashboardMainContainer({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return <div className={cn("@container/main space-y-4 lg:space-y-10", className)} {...props} />;
}

export function DashboardResponsiveColumns({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return <div className={cn("grid grid-cols-1 gap-4 xl:grid-cols-2 xl:items-start", className)} {...props} />;
}

export function DashboardSingleColumn({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return <div className={cn("grid grid-cols-1", className)} {...props} />;
}

export function DashboardPanel({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return <div className={cn("min-w-0 overflow-hidden", className)} {...props} />;
}

export function DashboardChartSkeleton() {
    return <Skeleton className="min-h-96 w-full rounded-xl" />;
}
