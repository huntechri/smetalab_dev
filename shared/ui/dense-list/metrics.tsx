import * as React from 'react';

import { cn } from '@/lib/utils';

type DenseListMetricPillTone = 'neutral' | 'info' | 'success';
type DenseListMetricPillDensity = 'work' | 'material';

type DenseListMetricPillProps = React.ComponentProps<'div'> & {
  tone?: DenseListMetricPillTone;
  density?: DenseListMetricPillDensity;
};

type DenseListLabeledMetricProps = Omit<DenseListMetricPillProps, 'children'> & {
  label: string;
  value: React.ReactNode;
};

type DenseListInlineMetricProps = React.ComponentProps<'div'> & {
  label: string;
};

type DenseListStatProps = React.ComponentProps<'div'> & {
  label: string;
  valueTone?: 'default' | 'success';
};

const denseListMetricPillToneClassName: Record<DenseListMetricPillTone, string> = {
  neutral: 'border-border bg-muted text-muted-foreground',
  info: 'border-info/30 bg-info/10 text-info',
  success: 'border-success/30 bg-success/10 text-success',
};

const denseListMetricPillDensityClassName: Record<DenseListMetricPillDensity, string> = {
  work: 'gap-1 px-1.5 sm:px-2',
  material: 'gap-0.5 px-1 sm:px-1.5',
};

const denseListStatValueClassName: Record<NonNullable<DenseListStatProps['valueTone']>, string> = {
  default: 'text-foreground',
  success: 'text-success',
};

function DenseListStat({
  label,
  valueTone = 'default',
  className,
  children,
  ...props
}: DenseListStatProps) {
  return (
    <div className={cn('text-right min-w-[60px] sm:min-w-[80px]', className)} {...props}>
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className={cn('text-sm font-bold tabular-nums', denseListStatValueClassName[valueTone])}>
        {children}
      </p>
    </div>
  );
}

function DenseListMetricPill({
  children,
  tone = 'neutral',
  density = 'work',
  className,
  ...props
}: DenseListMetricPillProps) {
  return (
    <div
      className={cn(
        'inline-flex h-4 items-center rounded-full border py-0 text-xs sm:h-5',
        denseListMetricPillToneClassName[tone],
        denseListMetricPillDensityClassName[density],
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

function DenseListLabeledMetric({ label, value, tone = 'neutral', density = 'work', className, ...props }: DenseListLabeledMetricProps) {
  return (
    <DenseListMetricPill tone={tone} density={density} className={className} {...props}>
      <span className="shrink-0 opacity-70">{label}:</span>
      <span className="ml-0.5 tabular-nums">{value}</span>
    </DenseListMetricPill>
  );
}

function DenseListInlineMetric({ label, className, children, ...props }: DenseListInlineMetricProps) {
  return (
    <div
      className={cn(
        'inline-flex h-6 items-center gap-1 whitespace-nowrap rounded-full border border-border bg-muted px-1.5 py-0 text-[11px] font-semibold leading-none text-muted-foreground sm:h-5 sm:text-[10px]',
        className,
      )}
      {...props}
    >
      <span className="shrink-0 opacity-70">{label}:</span>
      {children}
    </div>
  );
}

function DenseListSummaryRail({ className, ...props }: React.ComponentProps<'div'>) {
  return <div className={cn('flex flex-wrap justify-end gap-2 px-1 -mb-[14px]', className)} {...props} />;
}

export {
  DenseListInlineMetric,
  DenseListLabeledMetric,
  DenseListMetricPill,
  DenseListStat,
  DenseListSummaryRail,
};
