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
