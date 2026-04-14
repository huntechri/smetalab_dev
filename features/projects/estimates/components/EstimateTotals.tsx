import { cn } from '@/lib/utils';
import React from 'react';
import { Badge } from '@/shared/ui/badge';
import { estimateBadgeClassName } from './estimate-badge-styles';

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
            <Badge variant="outline" className={estimateBadgeClassName}>
                <span>План:</span>
                <span className="text-[10px] font-bold tabular-nums normal-case tracking-normal leading-[15px]">{moneyFormatter.format(planned)}</span>
            </Badge>

            <Badge variant="outline" className={estimateBadgeClassName}>
                <span>Факт:</span>
                <span className="text-[10px] font-bold tabular-nums normal-case tracking-normal leading-[15px]">{moneyFormatter.format(actual)}</span>
            </Badge>

            {showDelta && (
                <Badge
                    variant="outline"
                    className={estimateBadgeClassName}
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
