// ─── Badge tokens ─────────────────────────────────────────────────────────

export const primitiveBadgeBaseClassName =
  "inline-flex w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-full border border-transparent px-2 py-0.5 text-xs font-medium whitespace-nowrap transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&>svg]:pointer-events-none [&>svg]:size-3"

export const primitiveBadgeVariantClassNames = {
  default: "bg-primary text-primary-foreground [a&]:hover:bg-primary/90",
  secondary: "bg-secondary text-secondary-foreground [a&]:hover:bg-secondary/90",
  destructive:
    "bg-destructive text-white focus-visible:ring-destructive/20 dark:bg-destructive/60 dark:focus-visible:ring-destructive/40 [a&]:hover:bg-destructive/90",
  outline: "border-transparent bg-muted/55 text-foreground [a&]:hover:bg-muted",
  ghost: "[a&]:hover:bg-accent [a&]:hover:text-accent-foreground",
  link: "text-primary underline-offset-4 [a&]:hover:underline",
  success:
    "border-transparent bg-emerald-500/15 text-emerald-700 dark:bg-emerald-500/25 dark:text-emerald-400",
  warning:
    "border-transparent bg-amber-500/15 text-amber-700 dark:bg-amber-500/25 dark:text-amber-400",
  info: "border-transparent bg-blue-500/15 text-blue-700 dark:bg-blue-500/25 dark:text-blue-400",
  neutral:
    "border-transparent bg-slate-500/15 text-slate-700 dark:bg-slate-500/25 dark:text-slate-400",
  danger:
    "border-transparent bg-rose-500/15 text-rose-700 dark:bg-rose-500/25 dark:text-rose-400",
  paused:
    "border-transparent bg-violet-500/15 text-violet-700 dark:bg-violet-500/25 dark:text-violet-400",
} as const

export const primitiveBadgeSizeClassNames = {
  default: "px-2 py-0.5 text-xs",
  xs: "px-1.5 py-0 text-[9px] sm:text-[10px] font-semibold uppercase tracking-wide",
  count: "size-5 p-0 text-xs",
} as const

// ─── CatalogToken tokens ─────────────────────────────────────────────────

export const primitiveCatalogTokenTextClassName = "text-[10px]"

export const primitiveCatalogTokenCompactTextClassName = "text-[9px]"

export const primitiveCatalogIndexTokenTextClassName = "text-[9px]"

export const primitiveCatalogDensePaddingClassName = "px-1"

export const primitiveCatalogTokenBasePaddingClassName = "py-0"
