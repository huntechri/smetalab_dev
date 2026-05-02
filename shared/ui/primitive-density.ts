const primitiveFocusRingClassName =
  "focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"

const primitiveInvalidStateClassName =
  "aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40"

const primitiveSvgChildClassName =
  "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4"

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

export const primitiveTextareaBaseClassName =
  "placeholder:text-muted-foreground aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive flex field-sizing-content min-h-16 w-full bg-transparent text-base transition-[color,box-shadow] outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"

export const primitiveTextareaVariantClassNames = {
  default:
    "border-input focus-visible:border-ring focus-visible:ring-ring/25 dark:bg-input/30 rounded-md border px-3 py-2 shadow-xs focus-visible:ring-[1.5px]",
  inputGroup:
    "flex-1 resize-none rounded-none border-0 py-3 shadow-none focus-visible:ring-0 dark:bg-transparent",
} as const

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

export const primitiveTabsRootClassName =
  "group/tabs flex gap-2 data-[orientation=horizontal]:flex-col"

export const primitiveTabsListBaseClassName =
  "rounded-lg p-[3px] group-data-[orientation=horizontal]/tabs:h-8 data-[variant=line]:rounded-none group/tabs-list text-muted-foreground inline-flex w-fit items-center justify-center group-data-[orientation=vertical]/tabs:h-fit group-data-[orientation=vertical]/tabs:flex-col"

export const primitiveTabsListVariantClassNames = {
  default: "bg-muted",
  line: "gap-1 bg-transparent",
} as const

export const primitiveTabsTriggerClassName = [
  "focus-visible:border-ring focus-visible:ring-ring/20 focus-visible:outline-ring text-foreground/60 hover:text-foreground dark:text-muted-foreground dark:hover:text-foreground relative inline-flex h-[calc(100%-2px)] flex-1 items-center justify-center gap-1.5 rounded-md border border-transparent px-2 py-1 text-sm font-medium whitespace-nowrap transition-all group-data-[orientation=vertical]/tabs:w-full group-data-[orientation=vertical]/tabs:justify-start focus-visible:ring-[1.5px] focus-visible:outline-1 disabled:pointer-events-none disabled:opacity-50 group-data-[variant=default]/tabs-list:data-[state=active]:shadow-sm group-data-[variant=line]/tabs-list:data-[state=active]:shadow-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  "group-data-[variant=line]/tabs-list:bg-transparent group-data-[variant=line]/tabs-list:data-[state=active]:bg-transparent dark:group-data-[variant=line]/tabs-list:data-[state=active]:border-transparent dark:group-data-[variant=line]/tabs-list:data-[state=active]:bg-transparent",
  "data-[state=active]:bg-background dark:data-[state=active]:text-foreground dark:data-[state=active]:border-input dark:data-[state=active]:bg-input/30 data-[state=active]:text-foreground",
  "after:bg-foreground after:absolute after:opacity-0 after:transition-opacity group-data-[orientation=horizontal]/tabs:after:inset-x-0 group-data-[orientation=horizontal]/tabs:after:bottom-[-5px] group-data-[orientation=horizontal]/tabs:after:h-0.5 group-data-[orientation=vertical]/tabs:after:inset-y-0 group-data-[orientation=vertical]/tabs:after:-right-1 group-data-[orientation=vertical]/tabs:after:w-0.5 group-data-[variant=line]/tabs-list:data-[state=active]:after:opacity-100",
].join(" ")

export const primitiveTabsContentClassName =
  "flex-1 outline-none data-[state=inactive]:hidden"
