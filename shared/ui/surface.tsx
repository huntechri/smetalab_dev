import * as React from 'react';

import { cn } from '@/lib/utils';

export type SurfaceVariant = 'card' | 'panel' | 'glass' | 'muted' | 'subtle' | 'ghost';
export type SurfaceDensity = 'none' | 'compact' | 'default' | 'comfortable';
export type SurfaceRadius = 'md' | 'lg' | 'xl';
export type SurfaceShadow = 'none' | 'sm' | 'md';

export interface SurfaceClassNameOptions {
  variant?: SurfaceVariant;
  density?: SurfaceDensity;
  radius?: SurfaceRadius;
  shadow?: SurfaceShadow;
  interactive?: boolean;
  overflow?: 'visible' | 'hidden';
}

const surfaceVariantClassName: Record<SurfaceVariant, string> = {
  card: 'border border-border bg-card text-card-foreground',
  panel: 'border border-border/80 bg-card text-card-foreground',
  glass: 'glass-card border border-border/40 bg-background/50 text-card-foreground backdrop-blur-md',
  muted: 'border border-border bg-muted/30 text-card-foreground',
  subtle: 'border border-border/60 bg-muted/20 text-card-foreground',
  ghost: 'bg-transparent text-card-foreground',
};

const surfaceDensityClassName: Record<SurfaceDensity, string> = {
  none: '',
  compact: 'p-3 sm:p-4',
  default: 'p-4 sm:p-5',
  comfortable: 'p-4 sm:p-6',
};

const surfaceRadiusClassName: Record<SurfaceRadius, string> = {
  md: 'rounded-md sm:rounded-lg',
  lg: 'rounded-lg',
  xl: 'rounded-xl',
};

const surfaceShadowClassName: Record<SurfaceShadow, string> = {
  none: 'shadow-none',
  sm: 'shadow-sm',
  md: 'shadow-md',
};

export function getSurfaceClassName(
  {
    variant = 'card',
    density = 'default',
    radius = 'xl',
    shadow = 'sm',
    interactive = false,
    overflow = 'visible',
  }: SurfaceClassNameOptions = {},
  className?: string,
) {
  return cn(
    surfaceVariantClassName[variant],
    surfaceDensityClassName[density],
    surfaceRadiusClassName[radius],
    surfaceShadowClassName[shadow],
    overflow === 'hidden' && 'overflow-hidden',
    interactive &&
      'transition-[border-color,box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:border-border hover:shadow-sm',
    className,
  );
}

export interface SurfaceProps extends React.ComponentPropsWithoutRef<'div'>, SurfaceClassNameOptions {}

export function Surface({
  variant = 'card',
  density = 'default',
  radius = 'xl',
  shadow = 'sm',
  interactive = false,
  overflow = 'visible',
  className,
  ...props
}: SurfaceProps) {
  return (
    <div
      data-slot="surface"
      className={getSurfaceClassName({ variant, density, radius, shadow, interactive, overflow }, className)}
      {...props}
    />
  );
}
