"use client"

import * as React from "react"
import Image from "next/image"
import { ChevronRight, Pencil, Settings, Trash } from "lucide-react"

import { ActionMenu } from "@/shared/ui/action-menu"
import { Badge } from "@/shared/ui/badge"
import { Button } from "@/shared/ui/button"
import { cn } from "@/lib/utils"

export type DirectoryBadgeTone =
  | "default"
  | "secondary"
  | "outline"
  | "ghost"
  | "success"
  | "warning"
  | "info"
  | "neutral"
  | "danger"
  | "paused"

export interface DirectoryBadgeTrailItem {
  label: React.ReactNode
  tone?: DirectoryBadgeTone
}

interface DirectoryIndexCellProps {
  index: number
  isPlaceholder?: boolean
}

export function DirectoryIndexCell({ index, isPlaceholder }: DirectoryIndexCellProps) {
  return (
    <div className="relative flex h-full min-h-10 items-center justify-center">
      <div className="text-xs font-medium text-muted-foreground">
        {isPlaceholder ? "..." : index}
      </div>
    </div>
  )
}

interface DirectoryTextCellProps {
  children: React.ReactNode
  title?: string
  muted?: boolean
  emptyFallback?: React.ReactNode
}

export function DirectoryTextCell({
  children,
  title,
  muted = false,
  emptyFallback = "—",
}: DirectoryTextCellProps) {
  const value = children || emptyFallback

  return (
    <span
      className={cn("text-xs", muted && "text-muted-foreground")}
      title={title}
    >
      {value}
    </span>
  )
}

interface DirectoryNameCellProps {
  children: React.ReactNode
  title?: string
  secondary?: React.ReactNode
  markerColor?: string | null
}

export function DirectoryNameCell({
  children,
  title,
  secondary,
  markerColor,
}: DirectoryNameCellProps) {
  return (
    <div className="flex min-w-0 items-center gap-2 text-xs font-normal" title={title}>
      {markerColor ? (
        <svg className="size-2.5 shrink-0" viewBox="0 0 10 10" aria-hidden="true">
          <circle cx="5" cy="5" r="5" fill={markerColor} />
        </svg>
      ) : null}
      <div className="flex min-w-0 flex-col gap-0.5">
        <span className="truncate">{children}</span>
        {secondary ? (
          <span className="truncate text-xs font-medium uppercase tracking-tight text-foreground/80">
            {secondary}
          </span>
        ) : null}
      </div>
    </div>
  )
}

export function DirectoryCodeCell({ children }: { children: React.ReactNode }) {
  return (
    <div className="px-2 text-xs font-medium text-muted-foreground">
      {children}
    </div>
  )
}

interface DirectoryBadgeCellProps {
  children: React.ReactNode
  tone?: DirectoryBadgeTone
}

export function DirectoryBadgeCell({ children, tone = "neutral" }: DirectoryBadgeCellProps) {
  return (
    <Badge variant={tone} size="xs">
      {children}
    </Badge>
  )
}

interface DirectoryBadgeTrailProps {
  items: DirectoryBadgeTrailItem[]
}

export function DirectoryBadgeTrail({ items }: DirectoryBadgeTrailProps) {
  if (!items.length) return null

  return (
    <div className="flex flex-wrap items-center gap-1 opacity-80 transition-opacity group-hover/row:opacity-100">
      {items.map((item, index) => (
        <React.Fragment key={`${String(item.label)}-${index}`}>
          {index > 0 ? <ChevronRight className="size-2.5 text-muted-foreground/30" /> : null}
          <DirectoryBadgeCell tone={item.tone}>{item.label}</DirectoryBadgeCell>
        </React.Fragment>
      ))}
    </div>
  )
}

interface DirectoryStackCellProps {
  title?: string
  primary: React.ReactNode
  trailItems?: DirectoryBadgeTrailItem[]
}

export function DirectoryStackCell({ title, primary, trailItems = [] }: DirectoryStackCellProps) {
  return (
    <div className="flex min-w-0 flex-col gap-1.5 py-1.5">
      <div className="truncate text-xs font-normal" title={title}>
        {primary}
      </div>
      <DirectoryBadgeTrail items={trailItems} />
    </div>
  )
}

export function DirectoryCategoryCell({ values }: { values: Array<string | null | undefined> }) {
  const categories = values.filter(Boolean)

  return (
    <div className="flex flex-col gap-0.5">
      <span
        className="whitespace-normal break-words text-xs font-medium leading-tight text-muted-foreground"
        title={categories.join("> ")}
      >
        {categories.join(" / ") || "—"}
      </span>
    </div>
  )
}

interface DirectoryImageCellProps {
  src?: string | null
  alt: string
  emptyLabel?: string
}

export function DirectoryImageCell({ src, alt, emptyLabel = "N/A" }: DirectoryImageCellProps) {
  if (!src) {
    return (
      <div className="flex size-6 items-center justify-center rounded bg-muted/30 text-xs text-muted-foreground/50">
        {emptyLabel}
      </div>
    )
  }

  return (
    <div className="relative size-6 overflow-hidden rounded border border-border/50 shadow-sm transition-transform group-hover/row:scale-110">
      <Image src={src} alt={alt} fill sizes="24px" className="object-cover" loading="lazy" />
    </div>
  )
}

export function DirectoryActionsHeader({ children = "Действия" }: { children?: React.ReactNode }) {
  return <div className="pr-4 text-right text-xs">{children}</div>
}

interface DirectoryRowActionMenuProps<TData> {
  row: TData
  onEdit?: (row: TData) => void
  onDelete?: (row: TData) => void
}

export function DirectoryRowActionMenu<TData>({
  row,
  onEdit,
  onDelete,
}: DirectoryRowActionMenuProps<TData>) {
  return (
    <div className="pr-2 text-right">
      <ActionMenu
        ariaLabel="Открыть меню действий"
        trigger={
          <Button variant="ghost" size="icon-sm" aria-label="Открыть меню действий">
            <span className="sr-only">Открыть меню действий</span>
            <Settings className="size-4" />
          </Button>
        }
        items={[
          {
            label: "Редактировать",
            icon: <Pencil className="size-4" />,
            onClick: () => onEdit?.(row),
          },
          {
            label: "Удалить",
            icon: <Trash className="size-4" />,
            variant: "destructive",
            onClick: () => onDelete?.(row),
          },
        ]}
      />
    </div>
  )
}
