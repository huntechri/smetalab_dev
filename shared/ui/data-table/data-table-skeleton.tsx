"use client"

import * as React from "react"
import { Skeleton } from "@/shared/ui/skeleton"

export function DataTableSkeleton() {
    return (
        <div className="p-4 space-y-4">
            {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                    <Skeleton className="h-10 w-12 rounded-lg" />
                    <Skeleton className="h-10 flex-1 rounded-lg" />
                    <Skeleton className="h-10 w-24 rounded-lg" />
                    <Skeleton className="h-10 w-32 rounded-lg" />
                </div>
            ))}
        </div>
    );
}
