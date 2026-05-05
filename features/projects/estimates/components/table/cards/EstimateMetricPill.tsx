import { cn } from '@/lib/utils';
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
      className={cn(
        density === 'material'
          ? 'gap-0.5 px-1 sm:px-1.5'
          : 'gap-1 px-1.5 sm:px-2',
        className,
      )}
    >
      {children}
    </Badge>
  );
}
