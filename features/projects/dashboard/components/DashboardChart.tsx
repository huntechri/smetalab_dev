"use client"

import * as React from "react"
import { AppWindowIcon, CalendarIcon, CodeIcon, SlidersHorizontal } from "lucide-react"
import { Area, CartesianGrid, ComposedChart, Line, XAxis, YAxis } from "recharts"

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
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/shared/ui/dropdown-menu"
import { Tabs, TabsList, TabsTrigger } from "@/shared/ui/tabs"
import type { PerformanceDynamicsPoint } from '@/shared/types/performance-dynamics'
import { buildDynamicsFlowTimeline, buildDynamicsTimeline, DynamicsMode, DynamicsRange, hasActivityInTimeline } from '../lib/performance-dynamics'

const chartConfig = {
    receiptsFact: {
        label: "Приход",
        color: "#16A34A",
    },
    executionPlan: {
        label: "План раб.",
        color: "#93C5FD",
    },
    executionFact: {
        label: "Факт раб.",
        color: "#2563EB",
    },
    procurementPlan: {
        label: "План мат.",
        color: "#FCD34D",
    },
    procurementFact: {
        label: "Факт мат.",
        color: "#D97706",
    },
    balance: {
        label: "Баланс",
        color: "#6D28D9",
    },
} satisfies ChartConfig

type DashboardChartProps = {
    data: PerformanceDynamicsPoint[];
}

type DashboardSeriesKey = keyof typeof chartConfig

const dashboardSeriesOptions: Array<{ key: DashboardSeriesKey; label: string }> = [
    { key: 'receiptsFact', label: 'Приход' },
    { key: 'executionPlan', label: 'План работ' },
    { key: 'executionFact', label: 'Факт работ' },
    { key: 'procurementPlan', label: 'План материалов' },
    { key: 'procurementFact', label: 'Факт материалов' },
    { key: 'balance', label: 'Баланс' },
]

const defaultVisibleSeries: Record<DashboardSeriesKey, boolean> = {
    receiptsFact: true,
    executionPlan: true,
    executionFact: true,
    procurementPlan: true,
    procurementFact: true,
    balance: true,
}

const formatDateTick = (value: string, range: DynamicsRange) => {
    const date = new Date(value)

    if (range === '1m') {
        return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })
    }

    return date.toLocaleDateString('ru-RU', { month: 'short', year: '2-digit' })
}

export function DashboardChart({ data }: DashboardChartProps) {
    const [timeRange, setTimeRange] = React.useState<DynamicsRange>('3m')
    const [mode, setMode] = React.useState<DynamicsMode>('level')
    const [visibleSeries, setVisibleSeries] = React.useState<Record<DashboardSeriesKey, boolean>>(defaultVisibleSeries)

    const levelTimeline = React.useMemo(
        () => buildDynamicsTimeline(data, timeRange),
        [data, timeRange],
    )

    const flowTimeline = React.useMemo(
        () => buildDynamicsFlowTimeline(data, timeRange),
        [data, timeRange],
    )

    const timeline = mode === 'level' ? levelTimeline : flowTimeline

    const chartData = React.useMemo(
            () => timeline.map((point, index) => ({
                ...point,
                balance: Math.round((
                + levelTimeline[index]!.receiptsFact
                - levelTimeline[index]!.executionFact
                - levelTimeline[index]!.procurementFact
                + Number.EPSILON
            ) * 100) / 100,
        })),
        [timeline, levelTimeline],
    )

    const hasActivity = React.useMemo(
        () => {
            const hasTimelineActivity = mode === 'level'
                ? hasActivityInTimeline(levelTimeline)
                : hasActivityInTimeline(flowTimeline) || hasActivityInTimeline(levelTimeline)

            if (!hasTimelineActivity) {
                return false
            }

            return chartData.some((point) =>
                dashboardSeriesOptions.some(({ key }) => visibleSeries[key] && Number(point[key] ?? 0) !== 0),
            )
        },
        [mode, flowTimeline, levelTimeline, chartData, visibleSeries],
    )

    const setSeriesVisibility = React.useCallback((key: DashboardSeriesKey, checked: boolean) => {
        setVisibleSeries((prev) => {
            if (!checked && prev[key]) {
                const enabledCount = Object.values(prev).filter(Boolean).length
                if (enabledCount <= 1) {
                    return prev
                }
            }

            return { ...prev, [key]: checked }
        })
    }, [])

    return (
        <Card className="@container/card rounded-[13.6px] border border-[#e4e4e7] bg-white text-[#09090b] shadow-none p-6 gap-6 leading-6 text-[12px]">
            <CardHeader className="px-0 gap-3 !grid-cols-1">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
                    <CardTitle>Динамика проекта</CardTitle>
                    <div className="flex w-full items-center gap-2 sm:ml-auto sm:w-auto sm:shrink-0">
                        <Tabs value={mode} onValueChange={(value) => setMode(value as DynamicsMode)} className="w-full sm:w-auto sm:shrink-0">
                            <TabsList className="w-full justify-start overflow-x-auto sm:w-auto h-auto p-1 bg-muted/40 backdrop-blur-sm border border-border/40 no-scrollbar">
                                <TabsTrigger value="level" aria-label="Режим Уровень" className="px-3 py-2 text-xs font-semibold tracking-wide transition-all duration-200 data-[state=active]:bg-sidebar-primary data-[state=active]:text-sidebar-primary-foreground">
                                    <AppWindowIcon aria-hidden="true" className="size-4" />
                                    Уровень
                                </TabsTrigger>
                                <TabsTrigger value="flow" aria-label="Режим Поток" className="px-3 py-2 text-xs font-semibold tracking-wide transition-all duration-200 data-[state=active]:bg-sidebar-primary data-[state=active]:text-sidebar-primary-foreground">
                                    <CodeIcon aria-hidden="true" className="size-4" />
                                    Поток
                                </TabsTrigger>
                            </TabsList>
                        </Tabs>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="outline"
                                    className="gap-2 shadow-sm"
                                    aria-label="Выбрать серии графика"
                                >
                                    <SlidersHorizontal className="size-4" aria-hidden="true" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="min-w-[210px]">
                                <DropdownMenuLabel>Показывать на графике</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                {dashboardSeriesOptions.map((series) => (
                                    <DropdownMenuCheckboxItem
                                        key={series.key}
                                        checked={visibleSeries[series.key]}
                                        onSelect={(event) => event.preventDefault()}
                                        onCheckedChange={(checked) => setSeriesVisibility(series.key, checked === true)}
                                    >
                                        {series.label}
                                    </DropdownMenuCheckboxItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
                <div className="w-full">
                    <Tabs value={timeRange} onValueChange={(value) => setTimeRange(value as DynamicsRange)} className="w-full sm:ml-auto sm:w-auto">
                        <TabsList className="w-full justify-start overflow-x-auto sm:w-fit h-auto p-1 bg-muted/40 backdrop-blur-sm border border-border/40 no-scrollbar">
                            <TabsTrigger value="1m" aria-label="Период 1 месяц" className="flex-none px-3 py-2 text-xs font-semibold tracking-wide transition-all duration-200 data-[state=active]:bg-sidebar-primary data-[state=active]:text-sidebar-primary-foreground">
                                <CalendarIcon aria-hidden="true" className="size-4" />
                                <span className="sm:hidden">1м</span>
                                <span className="hidden sm:inline">1 месяц</span>
                            </TabsTrigger>
                            <TabsTrigger value="3m" aria-label="Период 3 месяца" className="flex-none px-3 py-2 text-xs font-semibold tracking-wide transition-all duration-200 data-[state=active]:bg-sidebar-primary data-[state=active]:text-sidebar-primary-foreground">
                                <CalendarIcon aria-hidden="true" className="size-4" />
                                <span className="sm:hidden">3м</span>
                                <span className="hidden sm:inline">3 месяца</span>
                            </TabsTrigger>
                            <TabsTrigger value="12m" aria-label="Период 12 месяцев" className="flex-none px-3 py-2 text-xs font-semibold tracking-wide transition-all duration-200 data-[state=active]:bg-sidebar-primary data-[state=active]:text-sidebar-primary-foreground">
                                <CalendarIcon aria-hidden="true" className="size-4" />
                                <span className="sm:hidden">12м</span>
                                <span className="hidden sm:inline">12 месяцев</span>
                            </TabsTrigger>
                        </TabsList>
                    </Tabs>
                </div>
            </CardHeader>
            <CardContent className="px-0 pt-4 sm:pt-6">
                {!hasActivity ? (
                    <div className="flex h-[200px] sm:h-[280px] items-center justify-center rounded-md border border-dashed text-sm text-muted-foreground">
                        Нет данных за выбранный период
                    </div>
                ) : (
                    <ChartContainer
                        config={chartConfig}
                        className="aspect-auto h-[200px] sm:h-[280px] w-full"
                    >
                        <ComposedChart data={chartData}>
                            <defs>
                                <linearGradient id="fillExecution" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="var(--color-executionPlan)" stopOpacity={0.1} />
                                    <stop offset="100%" stopColor="var(--color-executionPlan)" stopOpacity={0.01} />
                                </linearGradient>
                                <linearGradient id="fillProcurement" x1="0" y1="0" x2="0" y2="1">
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
                                minTickGap={timeRange === '1m' ? 24 : 48}
                                tickFormatter={(value) => formatDateTick(value, timeRange)}
                            />
                            <YAxis
                                tickLine={false}
                                axisLine={false}
                                tickMargin={8}
                                width={80}
                                tickCount={6}
                                domain={[0, 'auto']}
                                tickFormatter={(value) => new Intl.NumberFormat('ru-RU', {
                                    notation: 'compact',
                                    maximumFractionDigits: 1,
                                }).format(Number(value))}
                            />
                            <ChartTooltip
                                cursor={{ stroke: 'var(--border)', strokeWidth: 1 }}
                                content={
                                    <ChartTooltipContent
                                        className="w-[180px]"
                                        labelFormatter={(value) => {
                                            const date = new Date(value as string)
                                            return date.toLocaleDateString('ru-RU', {
                                                month: 'long',
                                                day: timeRange === '1m' ? 'numeric' : undefined,
                                                year: 'numeric',
                                            })
                                        }}
                                        indicator="dot"
                                    />
                                }
                            />
                            <ChartLegend content={<ChartLegendContent className="flex-wrap justify-start gap-x-3 gap-y-2 text-xs" />} />
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
                                    fill="url(#fillExecution)"
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
                                    fill="url(#fillProcurement)"
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
