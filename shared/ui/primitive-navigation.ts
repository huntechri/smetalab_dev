// ─── Tabs tokens ──────────────────────────────────────────────────────────

export const primitiveTabsRootClassName =
  "group/tabs flex gap-2 data-[orientation=horizontal]:flex-col w-full"

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

// ─── Sidebar tokens ──────────────────────────────────────────────────────────

export const primitiveSidebarGroupClassName = "py-3"

export const primitiveSidebarGroupLabelClassName =
  "text-xs font-semibold uppercase tracking-widest text-sidebar-foreground/50 mb-3 px-3"

export const primitiveSidebarMenuClassName = "gap-2 px-2"

export const primitiveSidebarMenuButtonClassName = [
  "h-11 rounded-lg px-4 transition-all duration-200",
  "hover:bg-sidebar-accent/60",
  "data-[active=true]:bg-sidebar-primary/12",
  "data-[active=true]:text-sidebar-primary",
  "data-[active=true]:font-medium",
  "border-l-2 border-l-transparent",
  "data-[active=true]:border-l-sidebar-primary",
  "data-[active=true]:shadow-sm",
].join(" ")

// ─── PageShell tokens ──────────────────────────────────────────────────────

export const primitivePageShellInnerPaddingClassName = "p-4 md:p-6 lg:p-8"

export const primitivePageShellContainerWidthClassName = "max-w-[1600px]"

// ─── AppHeader tokens ──────────────────────────────────────────────────────

export const primitiveAppHeaderClassName = [
  "sticky top-0 z-40",
  "border-b border-border/40",
  "bg-background/60 backdrop-blur-xl",
  "transition-all duration-300",
].join(" ")

export const primitiveAppHeaderInnerClassName = [
  "flex h-16 shrink-0 items-center gap-2 px-3",
  "sm:gap-3 sm:px-4",
  "md:gap-4 md:px-6",
].join(" ")

// ─── AppSidebar tokens ─────────────────────────────────────────────────────

export const primitiveAppSidebarSkeletonHeaderClassName =
  "flex items-center gap-2 px-2 py-4"

export const primitiveAppSidebarSkeletonContentClassName =
  "px-4 py-6 space-y-6"

export const primitiveAppSidebarBrandHeaderClassName =
  "flex items-center gap-3 px-3 py-5"

export const primitiveAppSidebarBrandGradientClassName =
  "bg-gradient-to-br from-orange-500 to-orange-600"

export const primitiveAppSidebarContentClassName =
  "px-2 space-y-3"

// ─── ActiveTeamIndicator tokens ────────────────────────────────────────────

export const primitiveActiveTeamIndicatorClassName =
  "max-w-[70px] truncate sm:max-w-none"
