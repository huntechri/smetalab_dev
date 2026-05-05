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
    const deltaVariant: 'success' | 'danger' | 'neutral' =
        deltaTotal > 0
            ? 'success'
            : deltaTotal < 0
                ? 'danger'
                : 'neutral';

    return (
        <div className={cn("flex flex-wrap items-center gap-2", className)} {...props}>
            <Badge variant="neutral" size="xs" className="tabular-nums">
                <span>План:</span>
                <span className="font-bold">{moneyFormatter.format(planned)}</span>
            </Badge>

            <Badge variant="neutral" size="xs" className="tabular-nums">
                <span>Факт:</span>
                <span className="font-bold">{moneyFormatter.format(actual)}</span>
            </Badge>

            {showDelta && (
                <Badge variant={deltaVariant} size="xs" className="tabular-nums">
                    <span>Δ:</span>
                    <span className="font-bold">
                        {deltaTotal > 0 ? '+' : ''}{moneyFormatter.format(deltaTotal)}
                    </span>
                </Badge>
            )}
        </div>
    );
}
