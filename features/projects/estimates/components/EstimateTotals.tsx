import { cn } from '@/lib/utils';
import React from 'react';
import { Badge } from '@repo/ui';

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
    const deltaVariant =
        deltaTotal > 0
            ? 'success'
            : deltaTotal < 0
                ? 'danger'
                : 'neutral';

    return (
        <div className={cn("flex flex-wrap items-center gap-2", className)} {...props}>
            <Badge variant="neutral" size="xs">
                <span>План:</span>
                <span className="text-[10px] font-bold tabular-nums normal-case tracking-normal leading-[15px]">{moneyFormatter.format(planned)}</span>
            </Badge>

            <Badge variant="neutral" size="xs">
                <span>Факт:</span>
                <span className="text-[10px] font-bold tabular-nums normal-case tracking-normal leading-[15px]">{moneyFormatter.format(actual)}</span>
            </Badge>

            {showDelta && (
                <Badge
                    variant={deltaVariant}
                    size="xs"
                >
                    <span>Δ:</span>
                    <span className="text-[10px] font-bold tabular-nums normal-case tracking-normal leading-[15px]">
                        {deltaTotal > 0 ? '+' : ''}{moneyFormatter.format(deltaTotal)}
                    </span>
                </Badge>
            )}
        </div>
    );
}
