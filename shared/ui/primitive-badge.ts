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
    "border-transparent bg-[var(--badge-success-bg)] text-[var(--badge-success)]",
  warning:
    "border-transparent bg-[var(--badge-warning-bg)] text-[var(--badge-warning)]",
  info: "border-transparent bg-[var(--badge-info-bg)] text-[var(--badge-info)]",
  neutral:
    "border-transparent bg-[var(--badge-neutral-bg)] text-[var(--badge-neutral)]",
  danger:
    "border-transparent bg-[var(--badge-danger-bg)] text-[var(--badge-danger)]",
  paused:
    "border-transparent bg-[var(--badge-paused-bg)] text-[var(--badge-paused)]",
} as const

export const primitiveBadgeSizeClassNames = {
  default: "px-2 py-0.5 text-xs",
  xs: "px-1.5 py-0 text-[9px] sm:text-[10px] font-semibold uppercase tracking-wide",
  count: "size-5 p-0 text-xs",
} as const

// ─── CatalogToken tokens ─────────────────────────────────────────────────

export const primitiveCatalogIndexTokenTextClassName = "text-[9px]"
