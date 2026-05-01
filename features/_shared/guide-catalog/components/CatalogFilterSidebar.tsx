"use client"

import * as React from "react"
import type { LucideIcon } from "lucide-react"
import { FilterX } from "lucide-react"

import { Button } from "@/shared/ui/button"
import { ScrollArea } from "@/shared/ui/scroll-area"
import { Separator } from "@/shared/ui/separator"
import { cn } from "@/lib/utils"

interface CatalogFilterSidebarProps {
  title?: string
  hasFilters: boolean
  onReset: () => void
  isMobile?: boolean
  className?: string
  children: React.ReactNode
}

export function CatalogFilterSidebar({
  title = "Фильтры",
  hasFilters,
  onReset,
  isMobile = false,
  className,
  children,
}: CatalogFilterSidebarProps) {
  return (
    <div
      className={cn(
        isMobile
          ? "flex h-full w-full flex-1 flex-col overflow-hidden bg-transparent"
          : "flex h-[771px] w-64 flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm",
        className
      )}
    >
      <div
        className={cn(
          "flex shrink-0 items-center justify-between border-b border-border/50 bg-secondary/10 p-4",
          isMobile && "border-none bg-transparent px-0"
        )}
      >
        <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-foreground">
          {title}
        </h3>
        {hasFilters ? (
          <Button variant="ghost" size="icon-sm" onClick={onReset}>
            <FilterX className="size-3" />
            Сбросить
          </Button>
        ) : null}
      </div>

      <ScrollArea className="flex-1 overflow-hidden" style={{ height: isMobile ? "calc(100vh - 120px)" : "calc(771px - 60px)" }}>
        <div className={cn("space-y-6 p-4 pb-6", isMobile && "px-0 pb-12")}>{children}</div>
      </ScrollArea>
    </div>
  )
}

interface CatalogFilterSectionProps {
  icon: LucideIcon
  title: string
  children: React.ReactNode
  separated?: boolean
}

export function CatalogFilterSection({
  icon: Icon,
  title,
  children,
  separated = false,
}: CatalogFilterSectionProps) {
  return (
    <>
      {separated ? <Separator className="bg-border/50" /> : null}
      <div className="space-y-3">
        <div className="flex items-center gap-2 px-2 text-xs font-medium text-muted-foreground">
          <Icon className="size-3.5" />
          {title}
        </div>
        <div className="flex flex-col gap-1">{children}</div>
      </div>
    </>
  )
}

interface CatalogFilterButtonProps extends React.ComponentProps<typeof Button> {
  selected?: boolean
  checkIcon?: React.ReactNode
}

export function CatalogFilterButton({
  children,
  selected = false,
  checkIcon,
  ...props
}: CatalogFilterButtonProps) {
  return (
    <Button variant="ghost" {...props}>
      <span className="block truncate whitespace-normal break-words">{children}</span>
      {selected ? <span className="ml-auto shrink-0 self-center">{checkIcon}</span> : null}
    </Button>
  )
}

export function CatalogFilterLoadingText({ children }: { children: React.ReactNode }) {
  return <div className="px-2 py-1 text-xs italic text-muted-foreground">{children}</div>
}

export function CatalogFilterEmptyText({ children }: { children: React.ReactNode }) {
  return <div className="px-2 py-4 text-center text-xs italic text-muted-foreground/60">{children}</div>
}

export function CatalogFilterLoadingState({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-2 px-2 py-4">
      <div className="size-4 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
      <span className="animate-pulse text-[11px] text-muted-foreground">{children}</span>
    </div>
  )
}

export function CatalogFilterNestedGroup({ children }: { children: React.ReactNode }) {
  return <div className="ml-2 flex flex-col gap-1 border-l border-border/60 pl-4">{children}</div>
}
