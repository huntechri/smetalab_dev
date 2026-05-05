import { Badge } from '@/shared/ui/badge';
import type { ReactNode } from 'react';

type EstimateMetricPillTone = 'neutral' | 'info';
type EstimateMetricPillDensity = 'work' | 'material';

type EstimateMetricPillProps = {
  children: ReactNode;
  tone?: EstimateMetricPillTone;
  density?: EstimateMetricPillDensity;
  className?: string;
};

export function EstimateMetricPill({
  children,
  tone = 'neutral',
  density = 'work',
  className,
}: EstimateMetricPillProps) {
  return (
    <Badge
      variant={tone}
      size="xs"
      className={className}
    >
      {children}
    </Badge>
  );
}
