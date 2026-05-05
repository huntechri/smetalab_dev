import * as React from 'react';
import type { LucideIcon } from 'lucide-react';

import { cn } from '@/lib/utils';

import { Badge } from '@/shared/ui/badge';

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
  primitiveMarketingDividerClassName,
  primitiveMarketingBorderWhite10ClassName,
  primitiveMarketingH1ClassName,
  primitiveMarketingH2ClassName,
  primitiveMarketingH3ClassName,
  primitiveMarketingBodyClassName,
  primitiveMarketingHeroTextClassName,
  primitiveMarketingSkipLinkClassName,
  primitiveMarketingHeaderClassName,
  primitiveMarketingBrandIconClassName,
  primitiveMarketingMobileSummaryClassName,
  primitiveMarketingMobilePanelClassName,
  primitiveMarketingFooterClassName,
  primitiveMarketingGradientOrangeClassName,
  primitiveMarketingGradientCyanClassName,
  primitiveMarketingGradientPurpleClassName,
} from '@/shared/ui/primitive-marketing';

// ─── Types ────────────────────────────────────────────────────────────────────

export type MarketingPageShellProps = React.ComponentPropsWithoutRef<'div'>;

export type MarketingSectionProps = React.ComponentPropsWithoutRef<'section'>;

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

// ─── MarketingSkipLink ──────────────────────────────────────────────────────────

export type MarketingSkipLinkProps = React.ComponentPropsWithoutRef<'a'>;

/** Skip-to-main-content link — sr-only until focused */
export function MarketingSkipLink({ className, children, ...props }: MarketingSkipLinkProps) {
  return (
    <a className={cn(primitiveMarketingSkipLinkClassName, className)} {...props}>
      {children ?? 'Пропустить к содержимому'}
    </a>
  );
}

// ─── MarketingBrandLogo ──────────────────────────────────────────────────────────

export type MarketingBrandLogoProps = React.ComponentPropsWithoutRef<'div'> & {
  /** Override the logo letter */
  letter?: string;
  /** Top line text */
  top?: string;
  /** Bottom line text */
  bottom?: string;
};

/** Smetalab brand logo icon + text */
export function MarketingBrandLogo({
  className,
  letter = 'S',
  top = 'Smetalab',
  bottom = 'BuildOS',
  ...props
}: MarketingBrandLogoProps) {
  return (
    <div className={cn('flex items-center gap-3', className)} {...props}>
      <div className={primitiveMarketingBrandIconClassName}>{letter}</div>
      <div className="leading-none">
        <span className="block text-xs uppercase tracking-[0.4em] text-white/80">{top}</span>
        <span className="block text-sm font-semibold">{bottom}</span>
      </div>
    </div>
  );
}

// ─── MarketingGradientOrbs ────────────────────────────────────────────────────────

/** Background gradient orbs for the marketing hero area */
export function MarketingGradientOrbs() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <div
        className={cn(
          'absolute left-1/2 top-[-260px] h-[520px] w-[520px] -translate-x-1/2 rounded-full',
          primitiveMarketingGradientOrangeClassName,
          'blur-2xl will-change-transform',
        )}
      />
      <div
        className={cn(
          'absolute right-[-120px] top-[220px] h-[420px] w-[420px] rounded-full',
          primitiveMarketingGradientCyanClassName,
          'blur-3xl will-change-transform',
        )}
      />
      <div
        className={cn(
          'absolute left-[-160px] top-[520px] h-[380px] w-[380px] rounded-full',
          primitiveMarketingGradientPurpleClassName,
          'blur-3xl will-change-transform',
        )}
      />
    </div>
  );
}

// ─── MarketingHeader ──────────────────────────────────────────────────────────────

export type MarketingHeaderProps = React.ComponentPropsWithoutRef<'header'> & {
  /** Left side — brand logo */
  brand?: React.ReactNode;
  /** Center — desktop navigation */
  desktopNav?: React.ReactNode;
  /** Right — desktop auth buttons */
  desktopActions?: React.ReactNode;
  /** Mobile menu (details/summary or dialog) */
  mobileMenu?: React.ReactNode;
};

/** Sticky header for marketing pages */
export function MarketingHeader({
  brand,
  desktopNav,
  desktopActions,
  mobileMenu,
  className,
  ...props
}: MarketingHeaderProps) {
  return (
    <header className={cn(primitiveMarketingHeaderClassName, className)} {...props}>
      <div className="container mx-auto flex h-16 items-center justify-between gap-4 px-4 md:px-8">
        {brand}
        {desktopNav ? (
          <nav className="hidden md:flex items-center gap-4 text-sm text-white/90" aria-label="Основная навигация">
            {desktopNav}
          </nav>
        ) : null}
        {desktopActions ? (
          <div className="hidden md:flex items-center gap-3">{desktopActions}</div>
        ) : null}
        {mobileMenu}
      </div>
    </header>
  );
}

// ─── MarketingMobileMenu ──────────────────────────────────────────────────────────

export type MarketingMobileMenuProps = React.ComponentPropsWithoutRef<'details'> & {
  /** Button label */
  label?: string;
  /** Panel content */
  panel: React.ReactNode;
};

/** Mobile menu using details/summary for landing pages */
export function MarketingMobileMenu({
  label = 'Меню',
  panel,
  className,
  ...props
}: MarketingMobileMenuProps) {
  return (
    <details className={cn('group md:hidden', className)} {...props}>
      <summary
        aria-controls="mobile-navigation-panel"
        className={primitiveMarketingMobileSummaryClassName}
      >
        {label}
      </summary>
      <div id="mobile-navigation-panel" className={primitiveMarketingMobilePanelClassName}>
        <div className="container mx-auto flex flex-col gap-4 px-4 py-6">
          {panel}
        </div>
      </div>
    </details>
  );
}

// ─── MarketingFooter ──────────────────────────────────────────────────────────────

export type MarketingFooterProps = React.ComponentPropsWithoutRef<'footer'>;

/** Footer for marketing landing pages */
export function MarketingFooter({ className, children, ...props }: MarketingFooterProps) {
  return (
    <footer className={cn(primitiveMarketingFooterClassName, className)} {...props}>
      {children}
    </footer>
  );
}

// ─── Original components ──────────────────────────────────────────────────────────

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
            {pill ? <Badge variant="outline" size="xs" className="uppercase tracking-[0.3em]">{pill}</Badge> : null}
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
