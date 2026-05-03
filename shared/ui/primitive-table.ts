// ─── DataTable tokens ─────────────────────────────────────────────────────

export const primitiveDataTableHeaderRowClassName =
  "bg-background shadow-[0_1px_0_0_rgba(0,0,0,0.08)]"

export const primitiveDataTableHeaderCellClassName =
  "h-10 border-b border-border/50 bg-muted/20 px-3 text-left align-middle text-[11px] font-bold uppercase tracking-widest text-muted-foreground transition-colors md:px-4"

export const primitiveDataTableBodyRowClassName =
  "group/row cursor-default animate-in border-b fade-in slide-in-from-left-1 transition-colors duration-300 last:border-0 hover:bg-muted/60"

export const primitiveDataTableBodyCellClassName =
  "border-b px-3 py-1.5 align-middle transition-colors md:px-4 md:py-2"

export const primitiveDataTableCellContentClassName = "w-full text-[12px] leading-tight"

export const primitiveDataTableContainerClassName =
  "relative overflow-x-auto rounded-2xl border border-border/40 bg-card/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-md"

export const primitiveDataTableAiContainerClassName =
  "border-indigo-400/30 shadow-[0_0_30px_-5px_rgba(99,102,241,0.15)] ring-1 ring-indigo-500/20"

export const primitiveDataTableAiOverlayClassName =
  "pointer-events-none absolute inset-0 bg-linear-to-br from-indigo-500/2 via-transparent to-purple-500/2"

export const primitiveDataTableEmptyCellClassName = "px-3 py-8 text-center text-sm text-muted-foreground"

// ─── Table density tokens ─────────────────────────────────────────────────

export const primitiveCompactTableHeadClassName =
  "h-8 text-[9px] font-bold uppercase tracking-wider text-muted-foreground/70 sm:text-[11px]"

export const primitiveCompactTableCellClassName = "py-2 text-[9px] sm:text-[11px]"

// ─── Table cell tokens ────────────────────────────────────────────────────

export const primitiveTableHeadCellClassName =
  "h-10 px-2 text-left align-middle font-normal text-muted-foreground [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]"

export const primitiveTableCellClassName =
  "p-2 align-middle [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]"
