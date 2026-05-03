// ─── Shared control base tokens ──────────────────────────────────────────

const primitiveFocusRingClassName =
  "focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"

const primitiveInvalidStateClassName =
  "aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40"

const primitiveSvgChildClassName =
  "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4"

// ─── Button tokens ───────────────────────────────────────────────────────

export const primitiveButtonBaseClassName =
  `inline-flex shrink-0 items-center justify-center gap-2 rounded-md text-sm font-medium whitespace-nowrap transition-all outline-none ${primitiveFocusRingClassName} disabled:pointer-events-none disabled:opacity-50 ${primitiveInvalidStateClassName} ${primitiveSvgChildClassName}`

export const primitiveButtonSizeClassNames = {
  default: "h-9 px-4 py-2 has-[>svg]:px-3",
  xs: "h-7 px-2 py-1 text-xs has-[>svg]:px-1.5 [&_svg:not([class*='size-'])]:size-3",
  sm: "h-8 gap-1.5 rounded-md px-3 has-[>svg]:px-2.5",
  lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
  xl: "h-12 rounded-xl px-8 text-base has-[>svg]:px-6",
  icon: "size-9",
  "icon-xs": "size-7 rounded-md [&_svg:not([class*='size-'])]:size-3",
  "icon-sm": "size-8",
  "icon-lg": "size-10",
} as const

// ─── Input tokens ────────────────────────────────────────────────────────

export const primitiveInputBaseClassName =
  "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground w-full min-w-0 text-sm transition-[color,box-shadow] outline-none file:inline-flex file:border-0 file:bg-transparent file:text-xs file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 read-only:bg-muted/50 read-only:cursor-not-allowed aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40"

export const primitiveInputVariantClassNames = {
  default:
    "dark:bg-input/30 border-input rounded-md border bg-transparent px-3 shadow-sm focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50",
  ghost:
    "rounded-none border-0 bg-transparent shadow-none focus-visible:ring-0 dark:bg-transparent flex-1",
} as const

export const primitiveInputSizeClassNames = {
  default: "h-9 py-1 file:h-5",
  sm: "h-8 py-1 text-xs file:h-4",
  xs: "h-7 px-2 py-0.5 text-xs file:h-4",
} as const

// ─── Textarea tokens ─────────────────────────────────────────────────────

export const primitiveTextareaBaseClassName =
  "placeholder:text-muted-foreground aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive flex field-sizing-content min-h-16 w-full bg-transparent text-base transition-[color,box-shadow] outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"

export const primitiveTextareaVariantClassNames = {
  default:
    "border-input focus-visible:border-ring focus-visible:ring-ring/25 dark:bg-input/30 rounded-md border px-3 py-2 shadow-xs focus-visible:ring-[1.5px]",
  inputGroup:
    "flex-1 resize-none rounded-none border-0 py-3 shadow-none focus-visible:ring-0 dark:bg-transparent",
} as const

// ─── InputGroup tokens ────────────────────────────────────────────────────

export const primitiveInputGroupRootClassName = [
  "group/input-group border-input dark:bg-input/30 shadow-xs relative flex w-full items-center rounded-md border outline-none transition-[color,box-shadow]",
  "h-9 has-[>textarea]:h-auto",
  "has-[>[data-align=inline-start]]:[&>input]:pl-2",
  "has-[>[data-align=inline-end]]:[&>input]:pr-2",
  "has-[>[data-align=block-start]]:h-auto has-[>[data-align=block-start]]:flex-col has-[>[data-align=block-start]]:[&>input]:pb-3",
  "has-[>[data-align=block-end]]:h-auto has-[>[data-align=block-end]]:flex-col has-[>[data-align=block-end]]:[&>input]:pt-3",
  "has-[[data-slot=input-group-control]:focus-visible]:ring-ring has-[[data-slot=input-group-control]:focus-visible]:ring-1",
  "has-[[data-slot][aria-invalid=true]]:ring-destructive/20 has-[[data-slot][aria-invalid=true]]:border-destructive dark:has-[[data-slot][aria-invalid=true]]:ring-destructive/40",
].join(" ")

export const primitiveInputGroupAddonBaseClassName =
  "text-muted-foreground flex h-auto cursor-text select-none items-center justify-center gap-2 py-1.5 text-sm font-medium group-data-[disabled=true]/input-group:opacity-50 [&>kbd]:rounded-[calc(var(--radius)-5px)] [&>svg:not([class*='size-'])]:size-4"

export const primitiveInputGroupAddonAlignClassNames = {
  "inline-start": "order-first pl-3 has-[>button]:ml-[-0.45rem] has-[>kbd]:ml-[-0.35rem]",
  "inline-end": "order-last pr-3 has-[>button]:mr-[-0.4rem] has-[>kbd]:mr-[-0.35rem]",
  "block-start":
    "[.border-b]:pb-3 order-first w-full justify-start px-3 pt-3 group-has-[>input]/input-group:pt-2.5",
  "block-end":
    "[.border-t]:pt-3 order-last w-full justify-start px-3 pb-3 group-has-[>input]/input-group:pb-2.5",
} as const

export const primitiveInputGroupButtonBaseClassName =
  "flex items-center gap-2 text-sm shadow-none"

export const primitiveInputGroupButtonSizeClassNames = {
  xs: "h-6 gap-1 rounded-[calc(var(--radius)-5px)] px-2 has-[>svg]:px-2 [&>svg:not([class*='size-'])]:size-3.5",
  sm: "h-8 gap-1.5 rounded-md px-2.5 has-[>svg]:px-2.5",
  "icon-xs": "size-6 rounded-[calc(var(--radius)-5px)] p-0 has-[>svg]:p-0",
  "icon-sm": "size-8 p-0 has-[>svg]:p-0",
} as const

export const primitiveInputGroupTextClassName =
  "text-muted-foreground flex items-center gap-2 text-sm [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none"

// ─── Select tokens ────────────────────────────────────────────────────────

export const primitiveSelectTriggerClassName =
  "border-input data-placeholder:text-muted-foreground [&_svg:not([class*='text-'])]:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/25 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 dark:hover:bg-input/50 flex w-fit items-center justify-between gap-2 rounded-md border bg-transparent px-3 py-2 text-sm whitespace-nowrap shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[1.5px] disabled:pointer-events-none disabled:opacity-50 data-[size=default]:h-9 data-[size=sm]:h-8 *:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-2 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4"

export const primitiveSelectContentClassName =
  "bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 relative z-50 max-h-(--radix-select-content-available-height) min-w-[8rem] origin-(--radix-select-content-transform-origin) overflow-x-hidden overflow-y-auto rounded-md border shadow-md"

export const primitiveSelectPopperContentClassName =
  "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1"

export const primitiveSelectViewportClassName = "p-1"

export const primitiveSelectPopperViewportClassName =
  "h-(--radix-select-trigger-height) w-full min-w-(--radix-select-trigger-width) scroll-my-1"

export const primitiveSelectLabelClassName = "text-muted-foreground px-2 py-1.5 text-xs"

export const primitiveSelectItemClassName =
  "focus:bg-accent focus:text-accent-foreground [&_svg:not([class*='text-'])]:text-muted-foreground relative flex w-full cursor-default items-center gap-2 rounded-sm py-1.5 pr-8 pl-2 text-sm outline-hidden select-none data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 *:[span]:last:flex *:[span]:last:items-center *:[span]:last:gap-2"

export const primitiveSelectItemIndicatorClassName =
  "absolute right-2 flex size-3.5 items-center justify-center"

export const primitiveSelectSeparatorClassName = "bg-border pointer-events-none -mx-1 my-1 h-px"

export const primitiveSelectScrollButtonClassName =
  "flex cursor-default items-center justify-center py-1"

// ─── Toggle tokens ────────────────────────────────────────────────────────

export const primitiveToggleSizes = {
  default: "h-9 px-2 min-w-9",
  sm: "h-8 px-1.5 min-w-8",
  lg: "h-10 px-2.5 min-w-10",
} as const

// ─── KBD tokens ───────────────────────────────────────────────────────────

export const primitiveKbdPaddingClassName = "px-1"

// ─── Visual icon tokens ───────────────────────────────────────────────────

export const primitiveVisualIconSizeClassNames = {
  xs: "size-3",
  sm: "size-3.5",
  md: "size-4",
  denseAction: "size-3 sm:size-3.5",
  section: "h-4 w-4",
  mutedMeta: "h-3.5 w-3.5 text-muted-foreground/60",
} as const

export const primitiveVisualIconButtonClassNames = {
  denseAction: "size-6 sm:size-7",
} as const
