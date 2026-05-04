// ─── Surface tone variants ───────────────────────────────────────────────

export type PrimitiveSurfaceTone = 'default' | 'muted' | 'brand' | 'warning' | 'danger';

export const primitiveSurfaceToneClassNames: Record<PrimitiveSurfaceTone, string> = {
  default: '',
  muted: 'bg-muted/30 text-muted-foreground',
  brand: 'bg-brand/10 text-brand',
  warning: 'bg-warning/10 text-warning',
  danger: 'bg-destructive/10 text-destructive',
} as const;

// ─── Surface elevation variants ───────────────────────────────────────────

export type PrimitiveSurfaceElevation = 'flat' | 'raised' | 'elevated';

export const primitiveSurfaceElevationClassNames: Record<PrimitiveSurfaceElevation, string> = {
  flat: 'shadow-none',
  raised: 'shadow-sm',
  elevated: 'shadow-md',
} as const;

// ─── Surface border variants ──────────────────────────────────────────────

export type PrimitiveSurfaceBorder = 'none' | 'hairline' | 'thin' | 'thick';

export const primitiveSurfaceBorderClassNames: Record<PrimitiveSurfaceBorder, string> = {
  none: 'border-0',
  hairline: 'border border-border/30',
  thin: 'border border-border/60',
  thick: 'border border-border',
} as const;

// ─── Visual surface tokens ────────────────────────────────────────────────

export const primitiveVisualSurfaceClassNames = {
  interactiveGlassCard:
    "glass-card group cursor-pointer border-border/40 bg-background/50 p-4 shadow-sm backdrop-blur-md transition-all duration-300 hover:border-border/80 hover:shadow",
  toneIconFrame: "shrink-0 rounded-lg p-2 transition-colors",
} as const

export const primitiveVisualSemanticToneClassNames = {
  danger: "text-rose-600 bg-rose-500/5",
  success: "text-emerald-600 bg-emerald-500/5",
  info: "text-sky-600 bg-sky-500/5",
} as const

// ─── Visual typography tokens ─────────────────────────────────────────────

export const primitiveVisualTypographyClassNames = {
  sectionTitle: "truncate text-sm font-semibold",
  dashboardSectionTitle: "flex items-center gap-2 text-lg font-semibold tracking-tight",
  itemTitle: "text-sm font-semibold leading-none",
  itemTitleInteractive:
    "text-sm font-semibold leading-none text-foreground transition-colors group-hover:text-primary",
  denseItemTitleLink:
    "min-w-0 shrink truncate text-xs font-semibold leading-snug hover:underline sm:text-sm",
  mutedMeta: "text-xs text-muted-foreground",
  mutedMetaRow: "mt-1 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground",
  // Compact data typography tokens (for tables, dense lists, metadata)
  compactCaption: "text-[10px] font-medium text-muted-foreground",
  compactLabel: "text-[11px] font-semibold uppercase tracking-wide text-muted-foreground",
  compactValue: "text-[11px] font-bold tracking-tight tabular-nums",
  compactBody: "text-[12px]",
  compactAvatarInitials: "text-[11px] font-bold text-primary",
  // Catalog item typography
  catalogItemTitle: "text-[13px] sm:text-[14px] font-medium leading-snug break-words",
  catalogItemPrice: "text-[11px] font-bold tracking-tight",
  catalogItemMeta: "text-[10px] text-muted-foreground/60 font-medium",
  // Estimate section typography
  estimateSectionLabel: "text-[9px] sm:text-[11px] uppercase tracking-wider font-semibold",
  estimateCode: "text-[12px] font-semibold tabular-nums",
  estimateSubCode: "text-[12px] font-medium",
  // Dialog / Sheet typography
  dialogTitle: "text-xl md:text-2xl",
  // Form label typography
  formLabel: "text-xs font-medium",
  formLabelNormal: "text-xs font-normal",
} as const

// ─── Card tokens ──────────────────────────────────────────────────────────

export const primitiveCardBasePaddingClassName = "py-6"

export const primitiveCardHeaderPaddingClassName = "px-6 [.border-b]:pb-6"

export const primitiveCardContentPaddingClassName = "px-6"

export const primitiveCardFooterPaddingClassName = "px-6 [.border-t]:pt-6"

export const primitiveCardGapClassName = "gap-6"

// ─── Card shell tokens ────────────────────────────────────────────────────

export type PrimitiveCardShellDensity = "compact" | "default" | "comfortable"

export const primitiveCardShellGapClassNames: Record<PrimitiveCardShellDensity, string> = {
  compact: "gap-3",
  default: "gap-4",
  comfortable: "gap-5",
} as const

export const primitiveCardShellInsetDensityClassNames: Record<PrimitiveCardShellDensity, string> = {
  compact: "px-3 py-2",
  default: "p-3 sm:p-4",
  comfortable: "p-4 sm:p-5",
} as const

export const primitiveCardShellInsetDensityP3 = "p-3"

export const primitiveCardShellHeaderDensityClassNames: Record<PrimitiveCardShellDensity, string> = {
  compact: "px-3 pt-3 sm:px-4 sm:pt-4",
  default: "px-4 pt-4 sm:px-5 sm:pt-5",
  comfortable: "px-4 pt-4 sm:px-6 sm:pt-6",
} as const

export const primitiveCardShellBodyDensityClassNames: Record<PrimitiveCardShellDensity, string> = {
  compact: "p-3 sm:p-4",
  default: "p-4 sm:p-5",
  comfortable: "p-4 sm:p-6",
} as const

export const primitiveCardShellFooterDensityClassNames: Record<PrimitiveCardShellDensity, string> = {
  compact: "px-3 py-3 sm:px-4",
  default: "px-4 py-4 sm:px-5",
  comfortable: "px-4 py-4 sm:px-6",
} as const
