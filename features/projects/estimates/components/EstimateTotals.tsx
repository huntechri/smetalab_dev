import { cn } from '@/lib/utils';
import React from 'react';
import { Badge } from '@/shared/ui/badge';

const moneyFormatter = new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 2,
});

export interface EstimateTotalsProps extends React.HTMLAttributes<HTMLDivElement> {
    planned: number;
    actual: number;
    className?: string;
    showDelta?: boolean;
}

export function EstimateTotals({
    planned,
    actual,
    className,
    showDelta = true,
    ...props
}: EstimateTotalsProps) {
    const deltaTotal = planned - actual;

    return (
        <div className={cn("flex flex-wrap items-center gap-2", className)} {...props}>
            <Badge variant="outline" className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg border bg-muted/30 hover:bg-muted/30 text-foreground font-normal">
                <span className="text-[10px] sm:text-xs font-medium text-muted-foreground uppercase tracking-wider">План:</span>
                <span className="text-xs sm:text-sm font-semibold tabular-nums">{moneyFormatter.format(planned)}</span>
            </Badge>

            <Badge variant="outline" className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg border bg-muted/30 hover:bg-muted/30 text-foreground font-normal">
                <span className="text-[10px] sm:text-xs font-medium text-muted-foreground uppercase tracking-wider">Факт:</span>
                <span className="text-xs sm:text-sm font-semibold tabular-nums">{moneyFormatter.format(actual)}</span>
            </Badge>

            {showDelta && (
                <Badge
                    variant="outline"
                    className={cn(
                        "flex items-center gap-1.5 px-2 py-1.5 rounded-lg border font-normal",
                        deltaTotal > 0 ? "bg-emerald-50/50 hover:bg-emerald-50/50 border-emerald-200/50 text-emerald-700" :
                            deltaTotal < 0 ? "bg-orange-50/50 hover:bg-orange-50/50 border-orange-200/50 text-orange-700" :
                                "bg-muted/30 hover:bg-muted/30 text-foreground"
                    )}
                >
                    <span className="text-[10px] sm:text-xs font-medium uppercase tracking-wider opacity-80">Δ:</span>
                    <span className="text-xs sm:text-sm font-bold tabular-nums">
                        {deltaTotal > 0 ? '+' : ''}{moneyFormatter.format(deltaTotal)}
                    </span>
                </Badge>
            )}
        </div>
    );
}
