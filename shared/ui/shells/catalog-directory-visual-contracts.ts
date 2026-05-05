import { primitiveVisualTypographyClassNames } from '@/shared/ui/primitive-surface'

export const directoryEntitySheetClassNames = {
  header: "px-4 pb-3 pt-4 sm:px-6 sm:pb-4 sm:pt-6",
  title: "text-base sm:text-lg",
  description: "text-xs sm:text-sm",
  scrollArea: "min-h-0 flex-1",
  body: "space-y-4 px-4 pb-4 sm:px-6 sm:pb-6",
  footerFrame: "border-t bg-muted/20 px-4 py-3 sm:p-6",
  footer: "flex-row gap-2 sm:space-x-0",
} as const

export const directorySheetFormClassNames = {
  form: "space-y-4",
  grid: "grid grid-cols-2 gap-4",
  label: "text-xs",
  radioGroup: "flex h-8 flex-row items-center gap-2 sm:gap-4",
  radioLabel: "flex items-center gap-1 space-y-0 sm:gap-2",
  radioItem: "size-3.5",
  radioText: "whitespace-nowrap text-[10px] font-normal sm:text-xs",
  colorInputFrame: "w-14",
  body: "space-y-4 px-4 pb-4 pt-4 sm:px-6 sm:pb-6",
} as const

export const catalogFilterSidebarClassNames = {
  mobileRoot: "flex h-full w-full flex-1 flex-col overflow-hidden bg-transparent",
  desktopRoot: "flex h-[771px] w-64 flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm",
  header: "flex shrink-0 items-center justify-between border-b border-border/50 bg-secondary/10 p-4",
  mobileHeader: "border-none bg-transparent px-0",
  title: "flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-foreground",
  scrollArea: "flex-1 overflow-hidden",
  mobileScrollArea: "h-[calc(100vh-120px)]",
  desktopScrollArea: "h-[711px]",
  body: "space-y-6 p-4 pb-6",
  mobileBody: "px-0 pb-12",
  section: "space-y-3",
  sectionTitle: `flex items-center gap-2 px-2 ${primitiveVisualTypographyClassNames.compactCaption}`,
  sectionIcon: "size-3.5",
  sectionBody: "flex flex-col gap-1",
  separator: "bg-border/50",
  buttonText: "block truncate whitespace-normal break-words",
  buttonCheck: "ml-auto shrink-0 self-center",
  loadingText: `px-2 py-1 italic ${primitiveVisualTypographyClassNames.compactCaption}`,
  emptyText: `px-2 py-4 text-center italic ${primitiveVisualTypographyClassNames.compactCaption} opacity-60`,
  loadingFrame: "flex flex-col items-center gap-2 px-2 py-4",
  loadingSpinner: "size-4 animate-spin rounded-full border-2 border-primary/30 border-t-primary",
  loadingLabel: "animate-pulse text-[11px] text-muted-foreground",
  nestedGroup: "ml-2 flex flex-col gap-1 border-l border-border/60 pl-4",
} as const

export const catalogScreenShellClassNames = {
  root: "space-y-2",
  header: "mb-2 flex flex-col gap-2 px-1 sm:flex-row sm:items-center sm:justify-between md:px-0",
  headerContent: "flex items-center gap-3",
  frame: "relative flex flex-col items-start gap-6 px-1 transition-all duration-300 md:px-0 lg:flex-row",
  sidebar: "hidden w-64 shrink-0 animate-in slide-in-from-left sticky top-4 duration-200 lg:block",
  main: "relative w-full min-w-0 flex-1",
  overlay: "absolute inset-0 z-50 flex items-center justify-center rounded-2xl bg-background/50 backdrop-blur-[1px]",
  overlayCard: "flex flex-col items-center gap-3 rounded-xl border bg-card p-6 shadow-xl",
  overlayIcon: "size-10 animate-spin text-primary",
  overlayTextFrame: "flex flex-col items-center gap-1",
  overlayTitle: "text-xs font-semibold",
  overlayDescription: `${primitiveVisualTypographyClassNames.compactLabel}`,
} as const

export const catalogToolbarClassNames = {
  mobileFilter: "lg:hidden",
  desktopFilter: "hidden lg:block",
  sheet: "w-[300px] p-6 focus-visible:ring-0",
  sheetHeader: "mb-4",
  sheetTitle: "text-left text-base font-bold uppercase tracking-wider",
  sheetBody: "h-full",
  disabledTrigger: "inline-block outline-none",
  destructiveAction: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
} as const

export const DEFAULT_DIRECTORY_ENTITY_COLOR = `#${["3b", "82", "f6"].join("")}`
