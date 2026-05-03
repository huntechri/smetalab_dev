import * as React from "react"
import type { LucideIcon } from "lucide-react"
import { Check, Copy } from "lucide-react"

import { cn } from "@/lib/utils"
import { HiddenInput } from "@/shared/ui/hidden-input"
import { Badge } from "@/shared/ui/badge"
import { Button } from "@/shared/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card"
import { TabsList, TabsTrigger } from "@/shared/ui/tabs"
import {
  primitivePageShellInnerPaddingClassName,
} from "@/shared/ui/primitive-density"

type AdminBadgeVariant = React.ComponentProps<typeof Badge>["variant"]

type AdminPageShellProps = React.ComponentProps<"section"> & {
  title?: React.ReactNode
  description?: React.ReactNode
  actions?: React.ReactNode
}

function AdminPageShell({
  title,
  description,
  actions,
  children,
  className,
  ...props
}: AdminPageShellProps) {
  return (
    <section className={cn(`flex-1 space-y-6 ${primitivePageShellInnerPaddingClassName}`, className)} {...props}>
      {title || description || actions ? (
        <AdminPageHeader actions={actions}>
          <AdminPageHeading title={title} description={description} />
        </AdminPageHeader>
      ) : null}
      {children}
    </section>
  )
}

function AdminPageHeader({
  children,
  actions,
}: {
  children: React.ReactNode
  actions?: React.ReactNode
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      {children}
      {actions ? <AdminHeaderActions>{actions}</AdminHeaderActions> : null}
    </div>
  )
}

function AdminPageHeading({
  title,
  description,
}: {
  title?: React.ReactNode
  description?: React.ReactNode
}) {
  return (
    <div className="min-w-0 space-y-1">
      {title ? (
        <h1 className="text-xl font-bold tracking-tight text-foreground lg:text-2xl">
          {title}
        </h1>
      ) : null}
      {description ? (
        <p className="text-sm text-muted-foreground">{description}</p>
      ) : null}
    </div>
  )
}

function AdminHeaderActions({ children }: { children: React.ReactNode }) {
  return <div className="ml-auto flex shrink-0 items-center gap-2">{children}</div>
}

function AdminPublicHeader({
  brand,
  actions,
}: {
  brand: React.ReactNode
  actions: React.ReactNode
}) {
  return (
    <header className="border-b border-border">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <div className="[&>a]:flex [&>a]:items-center [&>a]:gap-2 [&_svg]:size-6 [&_svg]:text-primary [&_span]:text-xl [&_span]:font-semibold [&_span]:text-foreground">
          {brand}
        </div>
        <div className="flex items-center gap-4 [&_[aria-hidden=true]]:h-9">{actions}</div>
      </div>
    </header>
  )
}

function AdminStatusBadge({
  children,
  variant = "neutral",
  mono = false,
}: {
  children: React.ReactNode
  variant?: AdminBadgeVariant
  mono?: boolean
}) {
  return (
    <Badge
      variant={variant}
      size="xs"
      className={cn(mono && "border-none font-mono")}
    >
      {children}
    </Badge>
  )
}

function AdminMetricGrid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">{children}</div>
}

function AdminCardGrid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">{children}</div>
}

function AdminMetricCard({
  title,
  value,
  icon: Icon,
}: {
  title: React.ReactNode
  value: React.ReactNode
  icon: LucideIcon
}) {
  return (
    <Card className="border-border/60 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="size-4 text-muted-foreground" aria-hidden="true" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  )
}

function AdminSectionCard({
  title,
  children,
}: {
  title: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  )
}

function AdminTenantCard({
  title,
  status,
  meta,
  action,
  icon: Icon,
}: {
  title: React.ReactNode
  status: React.ReactNode
  meta: React.ReactNode
  action: React.ReactNode
  icon: LucideIcon
}) {
  return (
    <Card className="overflow-hidden border-border/60 bg-card shadow-sm transition-shadow hover:shadow-md">
      <CardHeader className="space-y-0 pb-2">
        <div className="flex items-start justify-between gap-4">
          <AdminIconFrame icon={Icon} tone="brand" />
          {status}
        </div>
        <CardTitle className="line-clamp-1 pt-4 text-base font-bold">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex items-center gap-4 text-xs text-muted-foreground">
          {meta}
        </div>
        {action}
      </CardContent>
    </Card>
  )
}

function AdminInlineStat({
  icon: Icon,
  children,
  emphasis = false,
}: {
  icon?: LucideIcon
  children: React.ReactNode
  emphasis?: boolean
}) {
  return (
    <div className="flex items-center gap-1.5">
      {Icon ? <Icon className="size-3.5" aria-hidden="true" /> : null}
      <span className={cn(emphasis && "font-medium text-foreground")}>{children}</span>
    </div>
  )
}

function AdminListCard({ children }: { children: React.ReactNode }) {
  return (
    <Card className="overflow-hidden border-border/60 shadow-sm">
      <div className="divide-y divide-border/70">{children}</div>
    </Card>
  )
}

function AdminListItem({
  children,
  interactive = false,
  align = "center",
}: {
  children: React.ReactNode
  interactive?: boolean
  align?: "center" | "start"
}) {
  return (
    <div
      className={cn(
        "flex justify-between gap-4 p-4 transition-colors",
        align === "center" ? "items-center" : "items-start",
        interactive && "hover:bg-muted/50"
      )}
    >
      {children}
    </div>
  )
}

function AdminPersonAvatar({ label }: { label: React.ReactNode }) {
  return (
    <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 font-bold text-primary">
      {label}
    </div>
  )
}

function AdminRecordText({
  title,
  description,
}: {
  title: React.ReactNode
  description?: React.ReactNode
}) {
  return (
    <div className="min-w-0 space-y-1">
      <p className="font-medium text-foreground">{title}</p>
      {description ? <p className="text-xs text-muted-foreground">{description}</p> : null}
    </div>
  )
}

function AdminInlineMeta({ children }: { children: React.ReactNode }) {
  return <div className="flex items-center gap-2 text-xs text-muted-foreground">{children}</div>
}

function AdminActivityRecord({
  icon: Icon,
  title,
  timestamp,
  meta,
}: {
  icon: LucideIcon
  title: React.ReactNode
  timestamp?: React.ReactNode
  meta?: React.ReactNode
}) {
  return (
    <AdminListItem align="start">
      <div className="flex min-w-0 flex-1 items-start gap-4">
        <AdminIconFrame icon={Icon} tone="info" />
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex items-center justify-between gap-4">
            <p className="font-medium text-foreground">{title}</p>
            {timestamp ? <p className="text-xs text-muted-foreground">{timestamp}</p> : null}
          </div>
          {meta}
        </div>
      </div>
    </AdminListItem>
  )
}

function AdminActivityItem({
  icon: Icon,
  title,
  description,
}: {
  icon: LucideIcon
  title: React.ReactNode
  description?: React.ReactNode
}) {
  return (
    <li className="flex items-center gap-4">
      <AdminIconFrame icon={Icon} tone="brand" rounded="full" />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-foreground">{title}</p>
        {description ? <p className="text-xs text-muted-foreground">{description}</p> : null}
      </div>
    </li>
  )
}

function AdminActivityList({ children }: { children: React.ReactNode }) {
  return <ul className="space-y-4">{children}</ul>
}

function AdminEmptyState({
  icon: Icon,
  title,
  description,
}: {
  icon: LucideIcon
  title: React.ReactNode
  description?: React.ReactNode
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <Icon className="mb-4 size-12 text-primary" aria-hidden="true" />
      <h3 className="mb-2 text-lg font-semibold text-foreground">{title}</h3>
      {description ? <p className="max-w-sm text-sm text-muted-foreground">{description}</p> : null}
    </div>
  )
}

function AdminEmptyMessage({ children }: { children: React.ReactNode }) {
  return <div className="p-8 text-center text-sm italic text-muted-foreground">{children}</div>
}

function AdminTabsList({ children }: { children: React.ReactNode }) {
  return <TabsList className="grid w-full grid-cols-2 rounded-xl lg:w-[400px]">{children}</TabsList>
}

function AdminTabsTrigger({ value, children }: { value: string; children: React.ReactNode }) {
  return (
    <TabsTrigger value={value} className="rounded-lg">
      {children}
    </TabsTrigger>
  )
}

function AdminPricingGrid({ children }: { children: React.ReactNode }) {
  return (
    <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-xl gap-8 md:grid-cols-2">{children}</div>
    </main>
  )
}

function AdminPricingCard({
  name,
  price,
  interval,
  trialDays,
  features,
  priceId,
  action,
  submitButton,
}: {
  name: string
  price: number
  interval: string
  trialDays: number
  features: string[]
  priceId?: string
  action: React.ComponentProps<"form">["action"]
  submitButton: React.ReactNode
}) {
  return (
    <Card className="border-border/60 shadow-sm">
      <CardHeader>
        <CardTitle className="text-2xl font-medium">{name}</CardTitle>
        <p className="text-sm text-muted-foreground">with {trialDays} day free trial</p>
      </CardHeader>
      <CardContent className="space-y-6">
        <p className="text-4xl font-medium text-foreground">
          ${price / 100}{" "}
          <span className="text-xl font-normal text-muted-foreground">
            per user / {interval}
          </span>
        </p>
        <ul className="space-y-4">
          {features.map((feature) => (
            <li key={feature} className="flex items-start gap-2">
              <Check className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden="true" />
              <span className="text-foreground/80">{feature}</span>
            </li>
          ))}
        </ul>
        <form action={action}>
          <HiddenInput name="priceId" value={priceId} />
          {submitButton}
        </form>
      </CardContent>
    </Card>
  )
}

function AdminLandingShell({
  heroTitle,
  heroAccent,
  heroDescription,
  heroAction,
  heroVisual,
  features,
  ctaTitle,
  ctaDescription,
  ctaAction,
}: {
  heroTitle: React.ReactNode
  heroAccent: React.ReactNode
  heroDescription: React.ReactNode
  heroAction: React.ReactNode
  heroVisual: React.ReactNode
  features: Array<{ title: React.ReactNode; description: React.ReactNode; icon: LucideIcon }>
  ctaTitle: React.ReactNode
  ctaDescription: React.ReactNode
  ctaAction: React.ReactNode
}) {
  return (
    <main>
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 lg:gap-8">
            <div className="mx-auto text-center md:max-w-2xl lg:col-span-6 lg:text-left">
              <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl">
                {heroTitle}
                <span className="block text-brand">{heroAccent}</span>
              </h1>
              <p className="mt-3 text-base text-muted-foreground sm:mt-5 sm:text-xl lg:text-lg xl:text-xl">
                {heroDescription}
              </p>
              <div className="mx-auto mt-8 max-w-lg text-center lg:mx-0 lg:text-left">
                {heroAction}
              </div>
            </div>
            <div className="relative mx-auto mt-12 max-w-lg lg:col-span-6 lg:mx-0 lg:mt-0 lg:flex lg:max-w-none lg:items-center">
              {heroVisual}
            </div>
          </div>
        </div>
      </section>

      <section className="w-full bg-card py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <AdminFeatureCard key={String(feature.title)} {...feature} />
            ))}
          </div>
        </div>
      </section>

      <section className="bg-muted/50 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-2">
            <div>
              <h2 className="text-3xl font-bold text-foreground sm:text-4xl">{ctaTitle}</h2>
              <p className="mt-3 max-w-3xl text-lg text-muted-foreground">{ctaDescription}</p>
            </div>
            <div className="mt-8 flex justify-center lg:mt-0 lg:justify-end">{ctaAction}</div>
          </div>
        </div>
      </section>
    </main>
  )
}

function AdminFeatureCard({
  title,
  description,
  icon: Icon,
}: {
  title: React.ReactNode
  description: React.ReactNode
  icon: LucideIcon
}) {
  return (
    <Card>
      <CardHeader>
        <div className="flex size-12 items-center justify-center rounded-md bg-brand text-brand-foreground">
          <Icon className="size-6" aria-hidden="true" />
        </div>
        <CardTitle className="mt-5 text-lg font-medium text-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-base text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  )
}

function AdminTerminalPreview({
  steps,
  activeStep,
  copied,
  onCopy,
}: {
  steps: string[]
  activeStep: number
  copied: boolean
  onCopy: () => void
}) {
  const CopyIcon = copied ? Check : Copy

  return (
    <div className="relative w-full overflow-hidden rounded-lg bg-foreground font-mono text-sm text-background shadow-lg">
      <div className="p-4">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex gap-2">
            <span className="size-3 rounded-full bg-destructive" />
            <span className="size-3 rounded-full bg-muted-foreground" />
            <span className="size-3 rounded-full bg-primary" />
          </div>
          <Button
            type="button"
            onClick={onCopy}
            variant="ghost"
            size="icon-sm"
            aria-label="Copy to clipboard"
          >
            <CopyIcon className="size-5" />
          </Button>
        </div>
        <div className="space-y-2">
          {steps.map((step, index) => (
            <div
              key={step}
              className={cn(
                "transition-opacity duration-300",
                index > activeStep ? "opacity-0" : "opacity-100"
              )}
            >
              <span className="text-primary">$</span> {step}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function AdminImpersonationBannerView({
  teamName,
  action,
}: {
  teamName: React.ReactNode
  action: React.ReactNode
}) {
  return (
    <div className="sticky top-0 z-50 flex items-center justify-between border-b border-border bg-primary/10 px-4 py-2 text-sm text-foreground">
      <div className="flex items-center gap-2">
        <span className="font-medium">Режим имперсонации:</span>
        <span>
          Вы работаете в рабочем пространстве команды <strong>{teamName}</strong>
        </span>
      </div>
      <div className="flex items-center gap-4">
        <span className="hidden text-xs text-muted-foreground md:inline">Все действия логируются</span>
        {action}
      </div>
    </div>
  )
}

function AdminSidebarBrand({ label }: { label: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 px-2 py-4">
      <div className="flex size-8 items-center justify-center rounded-lg bg-sidebar-primary font-bold text-sidebar-primary-foreground">
        A
      </div>
      <span className="text-lg font-semibold">{label}</span>
    </div>
  )
}

function AdminHeaderTextLink({ children }: { children: React.ReactNode }) {
  return <span className="text-sm font-medium text-muted-foreground hover:text-foreground">{children}</span>
}

function AdminIconFrame({
  icon: Icon,
  tone = "default",
  rounded = "lg",
}: {
  icon: LucideIcon
  tone?: "default" | "brand" | "info"
  rounded?: "lg" | "full"
}) {
  return (
    <div
      className={cn(
        "flex size-10 shrink-0 items-center justify-center",
        rounded === "full" ? "rounded-full" : "rounded-lg",
        tone === "brand" && "bg-primary/10 text-primary",
        tone === "info" && "bg-muted text-muted-foreground",
        tone === "default" && "bg-muted text-muted-foreground"
      )}
    >
      <Icon className="size-5" aria-hidden="true" />
    </div>
  )
}

export {
  AdminActivityItem,
  AdminActivityList,
  AdminActivityRecord,
  AdminCardGrid,
  AdminEmptyMessage,
  AdminEmptyState,
  AdminHeaderActions,
  AdminHeaderTextLink,
  AdminIconFrame,
  AdminImpersonationBannerView,
  AdminInlineMeta,
  AdminInlineStat,
  AdminLandingShell,
  AdminListCard,
  AdminListItem,
  AdminMetricCard,
  AdminMetricGrid,
  AdminPageHeader,
  AdminPageHeading,
  AdminPageShell,
  AdminPersonAvatar,
  AdminPricingCard,
  AdminPricingGrid,
  AdminPublicHeader,
  AdminRecordText,
  AdminSectionCard,
  AdminSidebarBrand,
  AdminStatusBadge,
  AdminTabsList,
  AdminTabsTrigger,
  AdminTenantCard,
  AdminTerminalPreview,
}
