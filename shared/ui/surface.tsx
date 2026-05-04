import * as React from 'react';

import { cn } from '@/lib/utils';
import {
  primitiveSurfaceBorderClassNames,
  primitiveSurfaceDensityClassNames,
  primitiveSurfaceToneClassNames,
  type PrimitiveSurfaceBorder,
  type PrimitiveSurfaceDensity,
  type PrimitiveSurfaceTone,
} from '@/shared/ui/primitive-density';

export type SurfaceVariant = 'card' | 'panel' | 'glass' | 'muted' | 'subtle' | 'ghost';
export type SurfaceDensity = PrimitiveSurfaceDensity;
export type SurfaceTone = PrimitiveSurfaceTone;
export type SurfaceBorder = PrimitiveSurfaceBorder;
export type SurfaceRadius = 'md' | 'lg' | 'xl';
export type SurfaceShadow = 'none' | 'sm' | 'md';

export interface SurfaceClassNameOptions {
  variant?: SurfaceVariant;
  density?: SurfaceDensity;
  tone?: SurfaceTone;
  border?: SurfaceBorder;
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
    tone = 'default',
    border = 'thick',
    radius = 'xl',
    shadow = 'sm',
    interactive = false,
    overflow = 'visible',
  }: SurfaceClassNameOptions = {},
  className?: string,
) {
  return cn(
    surfaceVariantClassName[variant],
    primitiveSurfaceDensityClassNames[density],
    primitiveSurfaceToneClassNames[tone],
    primitiveSurfaceBorderClassNames[border],
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
  tone = 'default',
  border = 'thick',
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
      className={getSurfaceClassName({ variant, density, tone, border, radius, shadow, interactive, overflow }, className)}
      {...props}
    />
  );
}
