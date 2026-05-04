import * as React from 'react';
import type { LucideIcon } from 'lucide-react';

import { cn } from '@/lib/utils';

import {
  primitiveMarketingHeroPaddingClassName,
  primitiveMarketingSectionPaddingClassName,
  primitiveMarketingDarkBgClassName,
  primitiveMarketingCardClassName,
  primitiveMarketingCardInnerClassName,
  primitiveMarketingCardAltClassName,
  primitiveMarketingWorkflowCardClassName,
  primitiveMarketingCtaBoxClassName,
  primitiveMarketingPricingCardClassName,
  primitiveMarketingPricingAccentClassName,
  primitiveMarketingPillClassName,
  primitiveMarketingSectionLabelClassName,
  primitiveMarketingDividerClassName,
  primitiveMarketingBorderWhite10ClassName,
  primitiveMarketingH1ClassName,
  primitiveMarketingH2ClassName,
  primitiveMarketingH3ClassName,
  primitiveMarketingBodyClassName,
  primitiveMarketingHeroTextClassName,
} from '@/shared/ui/primitive-marketing';

// ─── Types ────────────────────────────────────────────────────────────────────

export type MarketingPageShellProps = React.ComponentPropsWithoutRef<'div'>;

export interface MarketingSectionProps extends React.ComponentPropsWithoutRef<'section'> {
  label?: string;
  labelWide?: boolean;
}

export interface MarketingHeroProps extends React.ComponentPropsWithoutRef<'section'> {
  /** Optional label/badge above the heading */
  pill?: React.ReactNode;
  /** Main heading */
  heading: React.ReactNode;
  /** Lead paragraph */
  lead: React.ReactNode;
  /** CTA buttons (wrapper for Button groups) */
  actions?: React.ReactNode;
  /** Feature list items (rendered below actions) */
  features?: React.ReactNode;
  /** Side/demo content */
  demo?: React.ReactNode;
}

export interface MarketingCardProps extends Omit<React.ComponentPropsWithoutRef<'div'>, 'title'> {
  icon?: LucideIcon;
  title: string;
  text: string;
  variant?: 'default' | 'inner' | 'alt' | 'workflow' | 'pricing' | 'pricing-accent';
  step?: string;
}

export interface MarketingCTAProps extends React.ComponentPropsWithoutRef<'section'> {
  heading: React.ReactNode;
  description?: React.ReactNode;
  actions: React.ReactNode;
}

// ─── Components ────────────────────────────────────────────────────────────────

/**
 * Root wrapper for the marketing landing page.
 * Sets dark background, full-height layout, and font.
 */
export function MarketingPageShell({ className, children, ...props }: MarketingPageShellProps) {
  return (
    <div
      className={cn(
        'min-h-screen overflow-x-clip text-white font-sans',
        primitiveMarketingDarkBgClassName,
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

/**
 * Standard marketing section with optional label and border.
 */
export function MarketingSection({
  label,
  labelWide,
  className,
  children,
  ...props
}: MarketingSectionProps) {
  return (
    <section
      className={cn(
        'relative border-t',
        primitiveMarketingBorderWhite10ClassName,
        className,
      )}
      {...props}
    >
      <div className={cn('mx-auto w-full max-w-7xl', primitiveMarketingSectionPaddingClassName)}>
        {label ? (
          <span className={labelWide ? primitiveMarketingSectionLabelClassName : primitiveMarketingSectionLabelClassName}>
            {label}
          </span>
        ) : null}
        {children}
      </div>
    </section>
  );
}

/**
 * Hero section: gradient background, large heading, lead text, CTA buttons,
 * feature tags, and optional demo panel.
 */
export function MarketingHero({
  pill,
  heading,
  lead,
  actions,
  features,
  demo,
  className,
  ...props
}: MarketingHeroProps) {
  return (
    <section className={cn('relative', className)} {...props}>
      <div className={cn('mx-auto w-full max-w-7xl', primitiveMarketingHeroPaddingClassName)}>
        <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div className="space-y-8">
            {pill ? <div className={primitiveMarketingPillClassName}>{pill}</div> : null}
            <h1 className={primitiveMarketingH1ClassName}>{heading}</h1>
            <p className={cn('max-w-xl', primitiveMarketingHeroTextClassName)}>{lead}</p>
            {actions ? (
              <div className="flex flex-col gap-4 sm:flex-row">{actions}</div>
            ) : null}
            {features ? (
              <div className="flex flex-wrap items-center gap-6 text-sm text-white/75">
                {features}
              </div>
            ) : null}
          </div>
          {demo ? (
            <div className="relative">{demo}</div>
          ) : null}
        </div>
      </div>
    </section>
  );
}

/**
 * Marketing card – renders an icon + title + description with standard card styling.
 * Variants control the card container class.
 */
export function MarketingCard({
  icon: Icon,
  title,
  text,
  variant = 'default',
  step,
  className,
  children,
  ...props
}: MarketingCardProps) {
  const cardClass = (() => {
    switch (variant) {
      case 'inner': return primitiveMarketingCardInnerClassName;
      case 'alt': return primitiveMarketingCardAltClassName;
      case 'workflow': return primitiveMarketingWorkflowCardClassName;
      case 'pricing': return primitiveMarketingPricingCardClassName;
      case 'pricing-accent': return primitiveMarketingPricingAccentClassName;
      default: return primitiveMarketingCardClassName;
    }
  })();

  return (
    <div className={cn(cardClass, className)} {...props}>
      {step ? (
        <div className="absolute right-6 top-6 text-xs text-white/75">{step}</div>
      ) : null}
      {Icon ? <Icon className="h-6 w-6 text-[#FF6A3D]" aria-hidden="true" /> : null}
      <h3 className={cn('mt-4', primitiveMarketingH3ClassName)}>{title}</h3>
      <p className={cn('mt-2 text-sm', primitiveMarketingBodyClassName)}>{text}</p>
      {step ? <div className={cn('mt-6', primitiveMarketingDividerClassName)} /> : null}
      {children}
    </div>
  );
}

/**
 * CTA section – a large call-to-action box with gradient background.
 */
export function MarketingCTA({
  heading,
  description,
  actions,
  className,
  ...props
}: MarketingCTAProps) {
  return (
    <section className={cn('relative border-t', primitiveMarketingBorderWhite10ClassName, className)} {...props}>
      <div className={cn('mx-auto w-full max-w-7xl', primitiveMarketingSectionPaddingClassName)}>
        <div className={primitiveMarketingCtaBoxClassName}>
          <div className="grid gap-10 md:grid-cols-[1.2fr_0.8fr] md:items-center">
            <div className="space-y-4 rounded-2xl bg-[#0B0A0F] p-4">
              <h2 className={cn(primitiveMarketingH2ClassName)}>{heading}</h2>
              {description ? (
                <p className={primitiveMarketingBodyClassName}>{description}</p>
              ) : null}
            </div>
            <div className="flex flex-col gap-4">
              {actions}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
