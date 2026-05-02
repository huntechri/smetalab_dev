import { cn } from '@/lib/utils';
import React from 'react';
import { StatusBadge, StatusBadgeValue, type StatusTone } from '@/shared/ui/status-badge';

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
    const deltaTone: StatusTone =
        deltaTotal > 0
            ? 'success'
            : deltaTotal < 0
                ? 'danger'
                : 'neutral';

    return (
        <div className={cn("flex flex-wrap items-center gap-2", className)} {...props}>
            <StatusBadge tone="neutral">
                <span>План:</span>
                <StatusBadgeValue>{moneyFormatter.format(planned)}</StatusBadgeValue>
            </StatusBadge>

            <StatusBadge tone="neutral">
                <span>Факт:</span>
                <StatusBadgeValue>{moneyFormatter.format(actual)}</StatusBadgeValue>
            </StatusBadge>

            {showDelta && (
                <StatusBadge tone={deltaTone}>
                    <span>Δ:</span>
                    <StatusBadgeValue>
                        {deltaTotal > 0 ? '+' : ''}{moneyFormatter.format(deltaTotal)}
                    </StatusBadgeValue>
                </StatusBadge>
            )}
        </div>
    );
}
