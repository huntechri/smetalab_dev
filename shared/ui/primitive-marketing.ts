// ─── Marketing / landing page tokens ─────────────────────────────────────

/** Dark background for the marketing/landing page */
export const primitiveMarketingDarkBgClassName = 'bg-marketing-bg';

/** Section alternate background (slightly lighter than main bg) */
export const primitiveMarketingSectionBgClassName = 'bg-marketing-section-bg';

/** Hero section outer padding */
export const primitiveMarketingHeroPaddingClassName = 'pt-20 pb-16 md:pt-28 md:pb-24';

/** Section outer padding */
export const primitiveMarketingSectionPaddingClassName = 'py-20';

// ─── Marketing surface / card tokens ─────────────────────────────────────

/** Default marketing card */
export const primitiveMarketingCardClassName =
  'rounded-2xl border border-white/10 bg-marketing-card p-5 transition hover:-translate-y-1 hover:border-white/30';

/** Inner/details card on marketing */
export const primitiveMarketingCardInnerClassName =
  'rounded-2xl border border-white/10 bg-marketing-card p-4';

/** Alternate card style */
export const primitiveMarketingCardAltClassName =
  'rounded-2xl border border-white/10 bg-marketing-card-alt p-4';

/** Workflow step card */
export const primitiveMarketingWorkflowCardClassName =
  'relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-6';

/** CTA box background */
export const primitiveMarketingCtaBoxClassName =
  'rounded-[32px] border border-white/10 bg-linear-to-br from-marketing-gradient-start via-marketing-gradient-mid to-marketing-bg p-10 md:p-14';

/** Pricing card base */
export const primitiveMarketingPricingCardClassName =
  'rounded-3xl border border-white/10 bg-marketing-pricing-bg p-6';

/** Pricing accent (highlighted) card */
export const primitiveMarketingPricingAccentClassName =
  'rounded-3xl border border-marketing-accent bg-marketing-pricing-accent-bg p-6 shadow-[0_30px_80px_rgba(var(--marketing-accent-rgb),0.2)]';

/** Gradient overlay on marketing card/demo elements */
export const primitiveMarketingCardGradientClassName =
  'bg-linear-to-br from-marketing-accent/30 via-marketing-bg to-marketing-green/30';

/** Demo shell — live project preview */
export const primitiveMarketingDemoShellClassName =
  'rounded-[32px] border border-white/10 bg-white/5 p-6 shadow-[0_40px_120px_rgba(0,0,0,0.45)]';

/** Code-block style element in demo */
export const primitiveMarketingCodeBlockClassName =
  'rounded-2xl border border-white/10 bg-marketing-card p-4';

// ─── Marketing background gradient tokens ────────────────────────────────

/** Orange gradient orb */
export const primitiveMarketingGradientOrangeClassName =
  'bg-[radial-gradient(circle,rgba(var(--marketing-orange-rgb),0.45),rgba(var(--marketing-bg-rgb),0))]';

/** Cyan gradient orb */
export const primitiveMarketingGradientCyanClassName =
  'bg-[radial-gradient(circle,rgba(var(--marketing-cyan-rgb),0.25),rgba(var(--marketing-bg-rgb),0))]';

/** Purple gradient orb */
export const primitiveMarketingGradientPurpleClassName =
  'bg-[radial-gradient(circle,rgba(var(--marketing-purple-rgb),0.25),rgba(var(--marketing-bg-rgb),0))]';

// ─── Marketing pill / label tokens ───────────────────────────────────────

/** Primary pill (badge) — used in hero */
export const primitiveMarketingPillClassName =
  'inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1 text-xs uppercase tracking-[0.3em] text-white/80';

/** Small pill token — used in capability tags */
export const primitiveMarketingPillSmallClassName =
  'rounded-full border border-white/20 bg-white/5 px-3 py-1';

/** Extra-small pill — used inside demo */
export const primitiveMarketingPillXsClassName =
  'rounded-full bg-marketing-bg px-2 py-0.5 text-xs text-white';

/** Section label */
export const primitiveMarketingSectionLabelClassName =
  'text-xs uppercase tracking-[0.3em] text-white/75';

// ─── Marketing divider tokens ────────────────────────────────────────────

export const primitiveMarketingDividerClassName =
  'h-[2px] w-16 bg-marketing-accent';

// ─── Marketing border tokens ─────────────────────────────────────────────

/** White/10 border for marketing elements */
export const primitiveMarketingBorderWhite10ClassName =
  'border-white/10';

// ─── Marketing typography tokens ─────────────────────────────────────────

/** H1 — hero heading */
export const primitiveMarketingH1ClassName =
  'text-4xl sm:text-5xl md:text-6xl leading-[1.05] font-semibold';

/** H2 — section heading */
export const primitiveMarketingH2ClassName =
  'text-3xl md:text-4xl font-semibold';

/** H3 — card title */
export const primitiveMarketingH3ClassName =
  'text-xl font-semibold';

/** Body text on marketing pages */
export const primitiveMarketingBodyClassName =
  'text-sm text-white/80';

/** Hero lead/subtext */
export const primitiveMarketingHeroTextClassName =
  'text-lg text-white/90';

/** Pulse animation wrapper */
export const primitiveMarketingPulseClassName = 'animate-pulse';

// ─── Marketing brand / logo tokens ────────────────────────────────────────

/** Brand icon circle wrapper */
export const primitiveMarketingBrandIconClassName =
  'flex h-9 w-9 items-center justify-center rounded-xl bg-[#FF6A3D] text-black font-bold';

// ─── Marketing nav link tokens ────────────────────────────────────────────

/** Base nav link style for marketing pages */
export const primitiveMarketingNavLinkBaseClassName =
  'rounded-md transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60';

/** Header nav link style */
export const primitiveMarketingHeaderNavLinkClassName =
  `${primitiveMarketingNavLinkBaseClassName} px-3 py-2`;

/** Footer nav link style */
export const primitiveMarketingFooterNavLinkClassName =
  `${primitiveMarketingNavLinkBaseClassName} px-2 py-1`;

// ─── Marketing header / footer tokens ────────────────────────────────────

export const primitiveMarketingHeaderClassName =
  'sticky top-0 z-40 border-b border-white/10 bg-marketing-bg';

export const primitiveMarketingMobileSummaryClassName =
  'list-none rounded-full border border-white/20 px-4 py-2 text-sm text-white/90 transition hover:border-white/40 hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-white/60 [&::-webkit-details-marker]:hidden';

export const primitiveMarketingMobilePanelClassName =
  'absolute left-0 right-0 top-16 z-50 border-t border-white/10 bg-marketing-bg shadow-2xl';

export const primitiveMarketingFooterClassName =
  'border-t border-white/10 bg-marketing-bg';

// ─── Marketing skip-link token ────────────────────────────────────────────

/** Skip-to-main-content link — sr-only until focused */
export const primitiveMarketingSkipLinkClassName =
  'sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-full focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:text-black';

// ─── Marketing demo section tokens ────────────────────────────────────────

/** Budget value badge in demo */
export const primitiveMarketingDemoBudgetClassName =
  'mt-4 inline-flex rounded-2xl bg-marketing-bg px-3 py-1 text-2xl font-semibold text-white';

/** Schedule frame slot */
export const primitiveMarketingDemoFrameClassName =
  'relative h-20 rounded-xl border border-white/10 bg-linear-to-br from-white/10 to-transparent';

/** Schedule frame label */
export const primitiveMarketingDemoFrameLabelClassName =
  'absolute left-2 top-2 rounded-full bg-marketing-bg px-2 py-0.5 text-[10px] text-white';

/** Glowing accent glow */
export const primitiveMarketingDemoGlowClassName =
  'absolute -bottom-10 -left-6 h-20 w-40 rounded-full bg-[#B4FF7A]/40 blur-3xl animate-pulse';

// ─── Auth / marketing brand tokens ───────────────────────────────────────

/** Brand-gradient background blobs (auth pages) */
export const primitiveMarketingBgBlobClassNames = {
  orange:
    'bg-[radial-gradient(circle,rgba(var(--marketing-accent-rgb),0.35),rgba(var(--marketing-bg-rgb),0))]',
  teal: 'bg-[radial-gradient(circle,rgba(var(--marketing-cyan-rgb),0.2),rgba(var(--marketing-bg-rgb),0))]',
} as const;

/** Sizes / positions for background blobs */
export const primitiveMarketingBgBlobPlacementClassNames = {
  topLeft: '-left-32 top-32 h-80 w-80',
  bottomRight: '-right-40 bottom-36 h-80 w-80',
} as const;

// ─── Auth-specific surface tokens ────────────────────────────────────────

/** Auth form card shadow (heavy black shadow for dark auth pages) */
export const primitiveAuthPanelShadowClassName =
  'shadow-xl shadow-black/40';

/** Auth form card border (subtle white-on-dark) */
export const primitiveAuthPanelBorderClassName =
  'border-white/10';

/** Auth background page classNames */
export const primitiveAuthPageBackgroundClassName =
  'bg-background text-white';

// ─── Auth feature card tokens ────────────────────────────────────────────

/** Feature card base styling on auth marketing pages */
export const primitiveAuthFeatureCardClassName =
  'rounded-2xl border border-white/10 bg-white/5 p-4';

/** Feature card label (uppercase muted) */
export const primitiveAuthFeatureCardLabelClassName =
  'text-xs uppercase tracking-mega text-white/70';

/** Feature card value */
export const primitiveAuthFeatureCardValueClassName =
  'mt-2 font-semibold';

// ─── Auth branding tokens ────────────────────────────────────────────────

/** Brand icon circle wrapper */
export const primitiveAuthBrandIconClassName =
  'flex h-11 w-11 items-center justify-center rounded-2xl bg-brand text-brand-foreground font-bold';

// ─── Auth layout tokens ──────────────────────────────────────────────────

/** Auth marketing two-column grid (split 1.1 / 0.9 on lg) */
export const primitiveAuthMarketingGridClassName =
  'relative mx-auto grid min-h-dvh w-full max-w-6xl items-center gap-10 px-4 py-16 lg:grid-cols-[1.1fr_0.9fr] lg:px-8';

// ─── Auth a11y tokens ────────────────────────────────────────────────────

/** Skip-link (skip to main content) — sr-only until focused */
export const primitiveAuthSkipLinkClassName =
  'sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-full focus:bg-background focus:px-4 focus:py-2 focus:text-sm focus:text-foreground';

// ─── Auth form spacing tokens ────────────────────────────────────────────

/** Standard gap between form fields */
export const primitiveAuthFormGapClassName = 'space-y-4';

/** Standard gap for a form field group (label + input) */
export const primitiveAuthFieldGapClassName = 'space-y-2';

// ─── Auth typography tokens ──────────────────────────────────────────────

/** Auth marketing heading (large, prominent) */
export const primitiveAuthMarketingHeadingClassName =
  'text-4xl font-semibold leading-tight sm:text-5xl';

/** Auth marketing sub-text */
export const primitiveAuthMarketingSubtextClassName =
  'max-w-lg text-lg text-white/80';

/** Auth form title */
export const primitiveAuthFormTitleClassName =
  'text-2xl font-semibold text-white';

/** Auth form description / muted text */
export const primitiveAuthFormDescriptionClassName =
  'text-white/70';
