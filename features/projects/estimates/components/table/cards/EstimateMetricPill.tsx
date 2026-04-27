import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type EstimateMetricPillTone = 'neutral' | 'info';
type EstimateMetricPillDensity = 'work' | 'material';

type EstimateMetricPillProps = {
  children: ReactNode;
  tone?: EstimateMetricPillTone;
  density?: EstimateMetricPillDensity;
  className?: string;
};

const toneClassName: Record<EstimateMetricPillTone, string> = {
  neutral: 'border-slate-300 bg-slate-50 text-slate-600',
  info: 'border-blue-200 bg-blue-50 text-blue-600',
};

const densityClassName: Record<EstimateMetricPillDensity, string> = {
  work: 'gap-1 px-1.5 sm:px-2',
  material: 'gap-0.5 px-1 sm:px-1.5',
};

export function EstimateMetricPill({
  children,
  tone = 'neutral',
  density = 'work',
  className,
}: EstimateMetricPillProps) {
  return (
    <div
      className={cn(
        'inline-flex h-4 items-center rounded-full border py-0 text-[9px] sm:h-5 sm:text-[10px]',
        toneClassName[tone],
        densityClassName[density],
        className,
      )}
    >
      {children}
    </div>
  );
}
