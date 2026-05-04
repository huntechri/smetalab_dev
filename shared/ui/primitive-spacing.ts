// ─── Surface density tokens ───────────────────────────────────────────────

export type PrimitiveSurfaceDensity = "none" | "compact" | "default" | "comfortable"

export const primitiveSurfaceDensityClassNames: Record<PrimitiveSurfaceDensity, string> = {
  none: "",
  compact: "p-3 sm:p-4",
  default: "p-4 sm:p-5",
  comfortable: "p-4 sm:p-6",
} as const

// ─── Empty state tokens ───────────────────────────────────────────────────

export const primitiveEmptyBasePaddingClassName = "p-6 md:p-12"

// ─── Calendar tokens ──────────────────────────────────────────────────────

export const primitiveCalendarNavigationPaddingClassName = "pl-2 pr-1"

export const primitiveCalendarCellPaddingClassName = "p-0"

export const primitiveCalendarGridPaddingClassName = "p-3"

// ─── Accordion tokens ─────────────────────────────────────────────────────

export const primitiveAccordionItemPaddingClassName = "py-4"

export const primitiveAccordionContentPaddingClassName = "pt-0 pb-4"

// ─── Chart layout spacing tokens ──────────────────────────────────────────

export const primitiveChartValuePaddingClassName = "pl-2"

export const primitiveChartLegendVerticalClassName = "pt-3"

export const primitiveChartLegendTopClassName = "pb-3"
