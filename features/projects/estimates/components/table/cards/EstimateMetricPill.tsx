import type { ReactNode } from 'react';
import { DenseListMetricPill } from '@/shared/ui/dense-list';

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
    <DenseListMetricPill tone={tone} density={density} className={className}>
      {children}
    </DenseListMetricPill>
  );
}
