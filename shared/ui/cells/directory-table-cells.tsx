"use client"

import * as React from "react"
import Image from "next/image"
import { ChevronRight, Pencil, Settings, Trash } from "lucide-react"

import { ActionIconButton, ActionMenu } from "@/shared/ui/action-menu"
import { Badge } from "@/shared/ui/badge"
import { TableCellText, TableHeaderLabel } from "@/shared/ui/table-density"

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
      <TableCellText tone="muted" weight="medium">
        {isPlaceholder ? "..." : index}
      </TableCellText>
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
    <TableCellText
      tone={muted ? "muted" : "default"}
      title={title}
    >
      {value}
    </TableCellText>
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
    <div className="flex min-w-0 items-center gap-2 font-normal" title={title}>
      {markerColor ? (
        <svg className="size-2.5 shrink-0" viewBox="0 0 10 10" aria-hidden="true">
          <circle cx="5" cy="5" r="5" fill={markerColor} />
        </svg>
      ) : null}
      <div className="flex min-w-0 flex-col gap-0.5">
        <TableCellText truncate>{children}</TableCellText>
        {secondary ? (
          <TableCellText tone="default" weight="medium" className="truncate uppercase tracking-tight text-foreground/80">
            {secondary}
          </TableCellText>
        ) : null}
      </div>
    </div>
  )
}

export function DirectoryCodeCell({ children }: { children: React.ReactNode }) {
  return (
    <div className="px-2">
      <TableCellText tone="muted" weight="medium">{children}</TableCellText>
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
      <TableCellText as="div" weight="normal" truncate title={title}>
        {primary}
      </TableCellText>
      <DirectoryBadgeTrail items={trailItems} />
    </div>
  )
}

export function DirectoryCategoryCell({ values }: { values: Array<string | null | undefined> }) {
  const categories = values.filter(Boolean)

  return (
    <div className="flex flex-col gap-0.5">
      <TableCellText
        as="span"
        tone="muted"
        weight="medium"
        className="whitespace-normal break-words leading-tight"
        title={categories.join("> ")}
      >
        {categories.join(" / ") || "—"}
      </TableCellText>
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
  return <TableHeaderLabel align="end" className="pr-4 text-xs">{children}</TableHeaderLabel>
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
          <ActionIconButton
            label="Открыть меню действий"
            icon={<Settings className="size-4" />}
          />
        }
        items={[
          {
            label: "Редактировать",
            icon: <Pencil />,
            onClick: () => onEdit?.(row),
          },
          {
            label: "Удалить",
            icon: <Trash />,
            variant: "destructive",
            onClick: () => onDelete?.(row),
          },
        ]}
      />
    </div>
  )
}
