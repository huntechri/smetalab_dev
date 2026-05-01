'use client';

import * as React from 'react';
import { Download, Search } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Badge } from '@/shared/ui/badge';
import { DenseCard } from '@/shared/ui/dense-card';
import {
  DenseListMetricPill,
  DenseListPanel,
  DenseListToken,
} from '@/shared/ui/dense-list';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu';
import { Input } from '@/shared/ui/input';
import { Skeleton } from '@/shared/ui/skeleton';
import { ToolbarButton } from '@/shared/ui/toolbar-button';

type EstimateTabCardLayout = 'execution' | 'procurement';
type EstimateTabMetricsLayoutVariant = 'execution' | 'procurement';
type EstimateTabMetricTone = 'neutral' | 'info' | 'success' | 'warning' | 'danger';
type EstimateTabSectionTone = 'plan' | 'fact' | 'delta';
type EstimateTabState = 'not_started' | 'in_progress' | 'done';

type EstimateTabRootProps = React.ComponentProps<'div'>;
type EstimateTabPanelProps = React.ComponentProps<typeof DenseListPanel>;
type EstimateTabToolbarProps = {
  search: React.ReactNode;
  actions: React.ReactNode;
};
type EstimateTabSearchFieldProps = Omit<React.ComponentProps<typeof Input>, 'size'> & {
  ariaLabel: string;
};
type EstimateTabCardProps = React.ComponentProps<'article'> & {
  layout: EstimateTabCardLayout;
};
type EstimateTabMetricsLayoutProps = React.ComponentProps<'div'> & {
  layout: EstimateTabMetricsLayoutVariant;
};
type EstimateTabMetricSectionProps = React.ComponentProps<'section'> & {
  title: string;
  tone: EstimateTabSectionTone;
};
type EstimateTabMetricProps = {
  label: string;
  value: React.ReactNode;
  tone?: EstimateTabMetricTone;
};
type EstimateTabInlineMetricProps = React.ComponentProps<'div'> & {
  label: string;
  suffix?: React.ReactNode;
};
type EstimateTabTokenProps = Omit<React.ComponentProps<typeof Badge>, 'size'>;
type EstimateTabTextProps = React.ComponentProps<'span'>;
type EstimateTabStateMenuProps = {
  currentState: EstimateTabState;
  onStateChange: (state: EstimateTabState) => void;
};
type EstimateTabEmptyStateProps = {
  icon: React.ReactNode;
  title?: string;
  description?: string;
  children?: React.ReactNode;
};
type EstimateTabExportButtonProps = {
  onClick: () => void;
  children: React.ReactNode;
};
type EstimateTabMessageProps = {
  children: React.ReactNode;
  tone?: 'muted' | 'danger';
};

const estimateTabCardLayoutClassName: Record<EstimateTabCardLayout, string> = {
  execution: 'grid grid-cols-1 gap-4 p-2 sm:p-3 lg:grid-cols-[2.5fr_1fr_1.5fr] lg:gap-6',
  procurement: 'grid grid-cols-1 gap-4 p-2 sm:p-3 lg:grid-cols-[2.5fr_1fr_1fr_1fr] lg:gap-6',
};

const estimateTabMetricsLayoutClassName: Record<EstimateTabMetricsLayoutVariant, string> = {
  execution: 'grid grid-cols-1 gap-4 sm:grid-cols-2 lg:contents',
  procurement: 'grid grid-cols-2 gap-4 sm:grid-cols-3 lg:contents',
};

const estimateTabSectionToneClassName: Record<EstimateTabSectionTone, string> = {
  plan: 'border-brand/20 text-brand',
  fact: 'border-success/20 text-success',
  delta: 'border-brand/20 text-brand',
};

const estimateTabSectionMarkerClassName: Record<EstimateTabSectionTone, string> = {
  plan: 'bg-brand',
  fact: 'bg-success',
  delta: 'bg-brand',
};

const estimateTabMetricToneClassName: Record<EstimateTabMetricTone, string> = {
  neutral: 'border-border bg-muted text-muted-foreground',
  info: 'border-brand/30 bg-brand/10 text-brand',
  success: 'border-success/30 bg-success/10 text-success',
  warning: 'border-brand/30 bg-brand/10 text-brand',
  danger: 'border-destructive/30 bg-destructive/10 text-destructive',
};

const estimateTabStateMeta: Record<
  EstimateTabState,
  {
    label: string;
    variant: React.ComponentProps<typeof Badge>['variant'];
    indicatorClassName: string;
    itemClassName: string;
  }
> = {
  not_started: {
    label: 'Подготовка',
    variant: 'warning',
    indicatorClassName: 'bg-brand',
    itemClassName: 'focus:bg-brand/10 focus:text-brand',
  },
  in_progress: {
    label: 'В процессе',
    variant: 'info',
    indicatorClassName: 'bg-primary',
    itemClassName: 'focus:bg-primary/10 focus:text-primary',
  },
  done: {
    label: 'Выполнено',
    variant: 'success',
    indicatorClassName: 'bg-success',
    itemClassName: 'focus:bg-success/10 focus:text-success',
  },
};

const estimateTabMessageToneClassName: Record<NonNullable<EstimateTabMessageProps['tone']>, string> = {
  muted: 'text-muted-foreground',
  danger: 'text-destructive',
};

function EstimateTabRoot({ className, ...props }: EstimateTabRootProps) {
  return (
    <div
      className={cn(
        'space-y-1.5 sm:space-y-2 [--estimate-tab-height:calc(100vh-250px)] sm:[--estimate-tab-height:calc(100vh-280px)]',
        className,
      )}
      {...props}
    />
  );
}

function EstimateTabPanel({ className, ...props }: EstimateTabPanelProps) {
  return <DenseListPanel className={className} {...props} />;
}

function EstimateTabToolbar({ search, actions }: EstimateTabToolbarProps) {
  return (
    <div className="p-1.5 pb-0 sm:p-3">
      <div className="mb-2 flex flex-col gap-2 sm:mb-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative min-w-0 flex-1">{search}</div>
        {actions}
      </div>
    </div>
  );
}

function EstimateTabSearchField({ ariaLabel, className, ...props }: EstimateTabSearchFieldProps) {
  return (
    <>
      <Search
        className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground"
        aria-hidden="true"
      />
      <Input
        size="xs"
        className={cn('rounded-md border-border bg-background pl-8', className)}
        aria-label={ariaLabel}
        {...props}
      />
    </>
  );
}

function EstimateTabViewport({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      className={cn('max-h-[var(--estimate-tab-height)] overflow-y-auto px-1.5 pb-1.5 sm:px-3 sm:pb-3', className)}
      {...props}
    />
  );
}

function EstimateTabStack({ className, ...props }: React.ComponentProps<'div'>) {
  return <div className={cn('space-y-2', className)} {...props} />;
}

function EstimateTabCard({ layout, className, children, ...props }: EstimateTabCardProps) {
  return (
    <DenseCard className={className} {...props}>
      <div className={estimateTabCardLayoutClassName[layout]}>{children}</div>
    </DenseCard>
  );
}

function EstimateTabPrimaryCell({ className, ...props }: React.ComponentProps<'div'>) {
  return <div className={cn('flex min-w-0 flex-col justify-center', className)} {...props} />;
}

function EstimateTabTitleRow({ className, ...props }: React.ComponentProps<'div'>) {
  return <div className={cn('flex items-start gap-1.5', className)} {...props} />;
}

function EstimateTabCodeText({ className, ...props }: EstimateTabTextProps) {
  return (
    <span
      className={cn('shrink-0 text-xs font-semibold leading-tight text-muted-foreground sm:text-xs', className)}
      {...props}
    />
  );
}

function EstimateTabNameText({ className, ...props }: EstimateTabTextProps) {
  return (
    <span
      className={cn('min-w-0 flex-1 text-xs font-semibold leading-tight text-foreground sm:text-xs', className)}
      {...props}
    />
  );
}

function EstimateTabToken({ className, children, variant = 'neutral', ...props }: EstimateTabTokenProps) {
  return (
    <DenseListToken variant={variant} className={className} {...props}>
      {children}
    </DenseListToken>
  );
}

function EstimateTabSourceToken({ children, ...props }: Omit<EstimateTabTokenProps, 'variant'>) {
  return (
    <EstimateTabToken variant="warning" {...props}>
      {children}
    </EstimateTabToken>
  );
}

function EstimateTabMetaWrap({ className, ...props }: React.ComponentProps<'div'>) {
  return <div className={cn('mt-2 flex flex-wrap gap-1.5', className)} {...props} />;
}

function EstimateTabMetricsLayout({ layout, className, ...props }: EstimateTabMetricsLayoutProps) {
  return <div className={cn(estimateTabMetricsLayoutClassName[layout], className)} {...props} />;
}

function EstimateTabMetricSection({
  title,
  tone,
  className,
  children,
  ...props
}: EstimateTabMetricSectionProps) {
  return (
    <section className={cn('space-y-2.5', className)} {...props}>
      <div className={cn('flex items-center gap-2 border-b pb-1.5', estimateTabSectionToneClassName[tone])}>
        <span className={cn('h-1.5 w-1.5 rounded-full', estimateTabSectionMarkerClassName[tone])} aria-hidden="true" />
        <span className="text-xs font-bold uppercase tracking-widest sm:text-xs">{title}</span>
      </div>
      {children}
    </section>
  );
}

function EstimateTabMetric({ label, value, tone = 'neutral' }: EstimateTabMetricProps) {
  return (
    <span
      className={cn(
        'inline-flex h-4 items-center gap-1 rounded-full border px-1.5 py-0 text-xs sm:h-5 sm:px-2',
        estimateTabMetricToneClassName[tone],
      )}
    >
      <span className="shrink-0 opacity-70">{label}:</span>
      <span className="ml-0.5 tabular-nums">{value}</span>
    </span>
  );
}

function EstimateTabMetricsWrap({ className, ...props }: React.ComponentProps<'div'>) {
  return <div className={cn('flex flex-wrap items-center gap-2', className)} {...props} />;
}

function EstimateTabInlineMetric({ label, suffix, className, children, ...props }: EstimateTabInlineMetricProps) {
  return (
    <DenseListMetricPill className={className} {...props}>
      <span>{label}</span>
      {children}
      {suffix ? <span>{suffix}</span> : null}
    </DenseListMetricPill>
  );
}

function EstimateTabStateMenu({ currentState, onStateChange }: EstimateTabStateMenuProps) {
  const active = estimateTabStateMeta[currentState];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className="inline-flex outline-none">
          <Badge
            variant={active.variant}
            size="xs"
            className="min-w-[88px] cursor-pointer normal-case tracking-tight"
          >
            {active.label}
          </Badge>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[150px] p-1">
        {Object.entries(estimateTabStateMeta).map(([state, meta]) => (
          <DropdownMenuItem
            key={state}
            onClick={() => onStateChange(state as EstimateTabState)}
            className={cn('mb-0.5 h-8 cursor-pointer rounded-md last:mb-0', meta.itemClassName)}
          >
            <div className="flex w-full items-center gap-2">
              <span className={cn('h-2 w-2 rounded-full', meta.indicatorClassName)} aria-hidden="true" />
              <span className="text-xs font-medium">{meta.label}</span>
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function EstimateTabActionsBar({ className, ...props }: React.ComponentProps<'div'>) {
  return <div className={cn('flex justify-end', className)} {...props} />;
}

function EstimateTabEmptyState({ icon, title, description, children }: EstimateTabEmptyStateProps) {
  return (
    <div className="flex min-h-[220px] flex-col items-center justify-center rounded-md border border-dashed border-border bg-muted/30 p-4 text-center text-sm text-muted-foreground">
      <span className="mb-2 [&>svg]:size-6" aria-hidden="true">
        {icon}
      </span>
      {title ? <p className="mb-1 font-medium">{title}</p> : null}
      {description ? <p className="opacity-80">{description}</p> : null}
      {children}
    </div>
  );
}

function EstimateTabMessage({ children, tone = 'muted' }: EstimateTabMessageProps) {
  return (
    <div className={cn('rounded-md border p-4 text-sm', estimateTabMessageToneClassName[tone])}>
      {children}
    </div>
  );
}

function EstimateTabError({ children }: { children: React.ReactNode }) {
  return <EstimateTabMessage tone="danger">{children}</EstimateTabMessage>;
}

function EstimateTabLoading() {
  return (
    <div className="space-y-2">
      <Skeleton className="h-9 w-full" />
      <Skeleton className="h-[420px] w-full" />
    </div>
  );
}

function EstimateTabTotalsBar({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      className={cn('flex justify-end border-t border-border/60 bg-background/95 px-1 pt-1', className)}
      {...props}
    />
  );
}

function EstimateTabExportButton({ onClick, children }: EstimateTabExportButtonProps) {
  return (
    <ToolbarButton onClick={onClick} iconLeft={<Download className="mr-2 size-3.5" aria-hidden="true" />}>
      {children}
    </ToolbarButton>
  );
}

export {
  EstimateTabActionsBar,
  EstimateTabCard,
  EstimateTabCodeText,
  EstimateTabEmptyState,
  EstimateTabError,
  EstimateTabExportButton,
  EstimateTabInlineMetric,
  EstimateTabMessage,
  EstimateTabMetaWrap,
  EstimateTabMetric,
  EstimateTabMetricSection,
  EstimateTabMetricsLayout,
  EstimateTabMetricsWrap,
  EstimateTabNameText,
  EstimateTabPanel,
  EstimateTabPrimaryCell,
  EstimateTabRoot,
  EstimateTabSearchField,
  EstimateTabSourceToken,
  EstimateTabStack,
  EstimateTabStateMenu,
  EstimateTabTitleRow,
  EstimateTabToken,
  EstimateTabToolbar,
  EstimateTabTotalsBar,
  EstimateTabViewport,
  EstimateTabLoading,
};
