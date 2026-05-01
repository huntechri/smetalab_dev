"use client"

import * as React from "react"
import { AppWindowIcon, CalendarIcon, CodeIcon, SlidersHorizontal } from "lucide-react"
import { Area, CartesianGrid, ComposedChart, Line, XAxis, YAxis } from "recharts"

import { Button } from "@/shared/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card"
import {
  type ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/shared/ui/chart"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu"
import { Tabs, TabsList, TabsTrigger } from "@/shared/ui/tabs"

export type DashboardDynamicsRange = "1m" | "3m" | "12m"
export type DashboardDynamicsMode = "level" | "flow"

export const dashboardDynamicsSeriesKeys = [
  "receiptsFact",
  "executionPlan",
  "executionFact",
  "procurementPlan",
  "procurementFact",
  "balance",
] as const

export type DashboardDynamicsSeriesKey = (typeof dashboardDynamicsSeriesKeys)[number]
export type DashboardDynamicsVisibleSeries = Record<DashboardDynamicsSeriesKey, boolean>
export type DashboardDynamicsChartPoint = { date: string } & Record<DashboardDynamicsSeriesKey, number>

export const dashboardDynamicsChartConfig = {
  receiptsFact: {
    label: "Приход",
    color: "var(--success)",
  },
  executionPlan: {
    label: "План раб.",
    color: "var(--chart-2)",
  },
  executionFact: {
    label: "Факт раб.",
    color: "var(--chart-1)",
  },
  procurementPlan: {
    label: "План мат.",
    color: "var(--chart-4)",
  },
  procurementFact: {
    label: "Факт мат.",
    color: "var(--chart-5)",
  },
  balance: {
    label: "Баланс",
    color: "var(--brand)",
  },
} satisfies ChartConfig

export const dashboardDynamicsSeriesOptions: Array<{
  key: DashboardDynamicsSeriesKey
  label: string
}> = [
  { key: "receiptsFact", label: "Приход" },
  { key: "executionPlan", label: "План работ" },
  { key: "executionFact", label: "Факт работ" },
  { key: "procurementPlan", label: "План материалов" },
  { key: "procurementFact", label: "Факт материалов" },
  { key: "balance", label: "Баланс" },
]

export const dashboardDynamicsDefaultVisibleSeries: DashboardDynamicsVisibleSeries = {
  receiptsFact: true,
  executionPlan: true,
  executionFact: true,
  procurementPlan: true,
  procurementFact: true,
  balance: true,
}

const dashboardDynamicsCardClassName = "@container/card px-4 shadow-none lg:px-6"
const dashboardDynamicsHeaderClassName = "grid-cols-1 gap-3 px-0"
const dashboardDynamicsHeaderRowClassName =
  "flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3"
const dashboardDynamicsControlsClassName =
  "flex w-full items-center gap-2 sm:ml-auto sm:w-auto sm:shrink-0"
const dashboardDynamicsControlTabsClassName = "w-full sm:w-auto sm:shrink-0"
const dashboardDynamicsRangeTabsClassName = "w-full sm:ml-auto sm:w-auto"
const dashboardDynamicsTabsListClassName =
  "h-auto w-full justify-start overflow-x-auto border border-border/40 bg-muted/40 p-1 backdrop-blur-sm no-scrollbar sm:w-auto"
const dashboardDynamicsRangeTabsListClassName = `${dashboardDynamicsTabsListClassName} sm:w-fit`
const dashboardDynamicsTabsTriggerClassName =
  "px-3 py-2 text-xs font-semibold tracking-wide transition-all duration-200 data-[state=active]:bg-sidebar-primary data-[state=active]:text-sidebar-primary-foreground"
const dashboardDynamicsRangeTabsTriggerClassName = `flex-none ${dashboardDynamicsTabsTriggerClassName}`
const dashboardDynamicsContentClassName = "px-0 pt-4 sm:pt-6"
const dashboardDynamicsEmptyStateClassName =
  "flex h-52 items-center justify-center rounded-md border border-dashed text-sm text-muted-foreground sm:h-72"
const dashboardDynamicsContainerClassName = "aspect-auto h-52 w-full sm:h-72"
const dashboardDynamicsTooltipClassName = "w-44"
const dashboardDynamicsLegendClassName = "flex-wrap justify-start gap-x-3 gap-y-2 text-xs"
const dashboardDynamicsDropdownContentClassName = "min-w-52"

const formatDateTick = (value: string, range: DashboardDynamicsRange) => {
  const date = new Date(value)

  if (range === "1m") {
    return date.toLocaleDateString("ru-RU", { day: "numeric", month: "short" })
  }

  return date.toLocaleDateString("ru-RU", { month: "short", year: "2-digit" })
}

type DashboardDynamicsChartProps = {
  data: DashboardDynamicsChartPoint[]
  hasActivity: boolean
  mode: DashboardDynamicsMode
  onModeChange: (mode: DashboardDynamicsMode) => void
  range: DashboardDynamicsRange
  onRangeChange: (range: DashboardDynamicsRange) => void
  visibleSeries: DashboardDynamicsVisibleSeries
  onSeriesVisibilityChange: (key: DashboardDynamicsSeriesKey, checked: boolean) => void
  title?: string
}

export function DashboardDynamicsChart({
  data,
  hasActivity,
  mode,
  onModeChange,
  range,
  onRangeChange,
  visibleSeries,
  onSeriesVisibilityChange,
  title = "Динамика проекта",
}: DashboardDynamicsChartProps) {
  const gradientId = React.useId().replace(/:/g, "")
  const executionGradientId = `${gradientId}-execution`
  const procurementGradientId = `${gradientId}-procurement`

  return (
    <Card className={dashboardDynamicsCardClassName}>
      <CardHeader className={dashboardDynamicsHeaderClassName}>
        <div className={dashboardDynamicsHeaderRowClassName}>
          <CardTitle>{title}</CardTitle>
          <div className={dashboardDynamicsControlsClassName}>
            <Tabs
              value={mode}
              onValueChange={(value) => onModeChange(value as DashboardDynamicsMode)}
              className={dashboardDynamicsControlTabsClassName}
            >
              <TabsList className={dashboardDynamicsTabsListClassName}>
                <TabsTrigger
                  value="level"
                  aria-label="Режим Уровень"
                  className={dashboardDynamicsTabsTriggerClassName}
                >
                  <AppWindowIcon aria-hidden="true" className="size-4" />
                  Уровень
                </TabsTrigger>
                <TabsTrigger
                  value="flow"
                  aria-label="Режим Поток"
                  className={dashboardDynamicsTabsTriggerClassName}
                >
                  <CodeIcon aria-hidden="true" className="size-4" />
                  Поток
                </TabsTrigger>
              </TabsList>
            </Tabs>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" aria-label="Выбрать серии графика">
                  <SlidersHorizontal className="size-4" aria-hidden="true" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className={dashboardDynamicsDropdownContentClassName}>
                <DropdownMenuLabel>Показывать на графике</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {dashboardDynamicsSeriesOptions.map((series) => (
                  <DropdownMenuCheckboxItem
                    key={series.key}
                    checked={visibleSeries[series.key]}
                    onSelect={(event) => event.preventDefault()}
                    onCheckedChange={(checked) => onSeriesVisibilityChange(series.key, checked === true)}
                  >
                    {series.label}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        <div>
          <Tabs
            value={range}
            onValueChange={(value) => onRangeChange(value as DashboardDynamicsRange)}
            className={dashboardDynamicsRangeTabsClassName}
          >
            <TabsList className={dashboardDynamicsRangeTabsListClassName}>
              <TabsTrigger
                value="1m"
                aria-label="Период 1 месяц"
                className={dashboardDynamicsRangeTabsTriggerClassName}
              >
                <CalendarIcon aria-hidden="true" className="size-4" />
                <span className="sm:hidden">1м</span>
                <span className="hidden sm:inline">1 месяц</span>
              </TabsTrigger>
              <TabsTrigger
                value="3m"
                aria-label="Период 3 месяца"
                className={dashboardDynamicsRangeTabsTriggerClassName}
              >
                <CalendarIcon aria-hidden="true" className="size-4" />
                <span className="sm:hidden">3м</span>
                <span className="hidden sm:inline">3 месяца</span>
              </TabsTrigger>
              <TabsTrigger
                value="12m"
                aria-label="Период 12 месяцев"
                className={dashboardDynamicsRangeTabsTriggerClassName}
              >
                <CalendarIcon aria-hidden="true" className="size-4" />
                <span className="sm:hidden">12м</span>
                <span className="hidden sm:inline">12 месяцев</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>
      <CardContent className={dashboardDynamicsContentClassName}>
        {!hasActivity ? (
          <div className={dashboardDynamicsEmptyStateClassName}>Нет данных за выбранный период</div>
        ) : (
          <ChartContainer config={dashboardDynamicsChartConfig} className={dashboardDynamicsContainerClassName}>
            <ComposedChart data={data}>
              <defs>
                <linearGradient id={executionGradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--color-executionPlan)" stopOpacity={0.1} />
                  <stop offset="100%" stopColor="var(--color-executionPlan)" stopOpacity={0.01} />
                </linearGradient>
                <linearGradient id={procurementGradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--color-procurementPlan)" stopOpacity={0.1} />
                  <stop offset="100%" stopColor="var(--color-procurementPlan)" stopOpacity={0.01} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-border" />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={range === "1m" ? 24 : 48}
                tickFormatter={(value) => formatDateTick(value, range)}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                width={80}
                tickCount={6}
                domain={[0, "auto"]}
                tickFormatter={(value) =>
                  new Intl.NumberFormat("ru-RU", {
                    notation: "compact",
                    maximumFractionDigits: 1,
                  }).format(Number(value))
                }
              />
              <ChartTooltip
                cursor={{ stroke: "var(--border)", strokeWidth: 1 }}
                content={
                  <ChartTooltipContent
                    className={dashboardDynamicsTooltipClassName}
                    labelFormatter={(value) => {
                      const date = new Date(value as string)
                      return date.toLocaleDateString("ru-RU", {
                        month: "long",
                        day: range === "1m" ? "numeric" : undefined,
                        year: "numeric",
                      })
                    }}
                    indicator="dot"
                  />
                }
              />
              <ChartLegend
                content={<ChartLegendContent className={dashboardDynamicsLegendClassName} />}
              />
              {visibleSeries.receiptsFact ? (
                <Area
                  dataKey="receiptsFact"
                  name="receiptsFact"
                  type="monotone"
                  fill="none"
                  stroke="var(--color-receiptsFact)"
                  strokeWidth={2}
                  connectNulls
                />
              ) : null}
              {visibleSeries.executionPlan ? (
                <Area
                  dataKey="executionPlan"
                  name="executionPlan"
                  type="monotone"
                  fill={`url(#${executionGradientId})`}
                  stroke="var(--color-executionPlan)"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  connectNulls
                />
              ) : null}
              {visibleSeries.procurementPlan ? (
                <Area
                  dataKey="procurementPlan"
                  name="procurementPlan"
                  type="monotone"
                  fill={`url(#${procurementGradientId})`}
                  stroke="var(--color-procurementPlan)"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  connectNulls
                />
              ) : null}
              {visibleSeries.executionFact ? (
                <Line
                  dataKey="executionFact"
                  name="executionFact"
                  type="monotone"
                  stroke="var(--color-executionFact)"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={{ r: 2, fill: "var(--color-executionFact)" }}
                  activeDot={{ r: 4 }}
                  connectNulls
                />
              ) : null}
              {visibleSeries.procurementFact ? (
                <Line
                  dataKey="procurementFact"
                  name="procurementFact"
                  type="monotone"
                  stroke="var(--color-procurementFact)"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={{ r: 2, fill: "var(--color-procurementFact)" }}
                  activeDot={{ r: 4 }}
                  connectNulls
                />
              ) : null}
              {visibleSeries.balance ? (
                <Line
                  dataKey="balance"
                  name="balance"
                  type="monotone"
                  stroke="var(--color-balance)"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4 }}
                  connectNulls
                />
              ) : null}
            </ComposedChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}
