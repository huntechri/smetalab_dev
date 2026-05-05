import type React from 'react';
import { Badge } from '@/shared/ui/badge';

type PurchaseMetricProps = {
  label: string;
  value: React.ReactNode;
  tone?: 'neutral' | 'info' | 'success';
};

export function PurchaseMetric({ label, value, tone = 'neutral' }: PurchaseMetricProps) {
  return (
    <Badge variant={tone} size="xs">
      <span className="shrink-0 opacity-70">{label}:</span>
      <span className="ml-0.5 tabular-nums">{value}</span>
    </Badge>
  );
}
