import type React from 'react';
import { cn } from '@/lib/utils';
import { Badge } from '@/shared/ui/badge';

type PurchaseMetricProps = {
  label: string;
  value: React.ReactNode;
  tone?: 'neutral' | 'info' | 'success';
};

export function PurchaseMetric({ label, value, tone = 'neutral' }: PurchaseMetricProps) {
  const toneClasses = {
    neutral: 'border-slate-200 bg-slate-50 text-slate-600',
    info: 'border-blue-200 bg-blue-50 text-blue-600',
    success: 'border-green-200 bg-green-50 text-green-600',
  };

  return (
    <Badge
      variant="outline"
      className={cn(
        'h-4 sm:h-5 whitespace-nowrap px-1 sm:px-1.5 text-[9px] sm:text-[10px] font-semibold normal-case leading-none tracking-tight border shadow-none',
        toneClasses[tone],
      )}
    >
      <span className="shrink-0 opacity-70">{label}:</span>
      <span className="ml-0.5 tabular-nums">{value}</span>
    </Badge>
  );
}
