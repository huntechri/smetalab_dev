"use client"

import * as React from "react"
import type { LucideIcon } from "lucide-react"
import { FilterX } from "lucide-react"

import { Button } from "@/shared/ui/button"
import { catalogFilterSidebarClassNames } from "@/shared/ui/shells/catalog-directory-visual-contracts"
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
          ? catalogFilterSidebarClassNames.mobileRoot
          : catalogFilterSidebarClassNames.desktopRoot,
        className
      )}
    >
      <div
        className={cn(
          catalogFilterSidebarClassNames.header,
          isMobile && catalogFilterSidebarClassNames.mobileHeader
        )}
      >
        <h3 className={catalogFilterSidebarClassNames.title}>
          {title}
        </h3>
        {hasFilters ? (
          <Button variant="ghost" size="icon-sm" onClick={onReset}>
            <FilterX className="size-3" />
            Сбросить
          </Button>
        ) : null}
      </div>

      <ScrollArea
        className={cn(
          catalogFilterSidebarClassNames.scrollArea,
          isMobile
            ? catalogFilterSidebarClassNames.mobileScrollArea
            : catalogFilterSidebarClassNames.desktopScrollArea
        )}
      >
        <div className={cn(catalogFilterSidebarClassNames.body, isMobile && catalogFilterSidebarClassNames.mobileBody)}>{children}</div>
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
      {separated ? <Separator className={catalogFilterSidebarClassNames.separator} /> : null}
      <div className={catalogFilterSidebarClassNames.section}>
        <div className={catalogFilterSidebarClassNames.sectionTitle}>
          <Icon className={catalogFilterSidebarClassNames.sectionIcon} />
          {title}
        </div>
        <div className={catalogFilterSidebarClassNames.sectionBody}>{children}</div>
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
    <Button variant="ghost" size="default" {...props}>
      <span className={catalogFilterSidebarClassNames.buttonText}>{children}</span>
      {selected ? <span className={catalogFilterSidebarClassNames.buttonCheck}>{checkIcon}</span> : null}
    </Button>
  )
}

export function CatalogFilterLoadingText({ children }: { children: React.ReactNode }) {
  return <div className={catalogFilterSidebarClassNames.loadingText}>{children}</div>
}

export function CatalogFilterEmptyText({ children }: { children: React.ReactNode }) {
  return <div className={catalogFilterSidebarClassNames.emptyText}>{children}</div>
}

export function CatalogFilterLoadingState({ children }: { children: React.ReactNode }) {
  return (
    <div className={catalogFilterSidebarClassNames.loadingFrame}>
      <div className={catalogFilterSidebarClassNames.loadingSpinner} />
      <span className={catalogFilterSidebarClassNames.loadingLabel}>{children}</span>
    </div>
  )
}

export function CatalogFilterNestedGroup({ children }: { children: React.ReactNode }) {
  return <div className={catalogFilterSidebarClassNames.nestedGroup}>{children}</div>
}
