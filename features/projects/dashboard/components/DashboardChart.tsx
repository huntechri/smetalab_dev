"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, Line, XAxis, YAxis } from "recharts"

import {
    Card,
    CardAction,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    type ChartConfig,
    ChartContainer,
    ChartLegend,
    ChartLegendContent,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    ToggleGroup,
    ToggleGroupItem,
} from "@/components/ui/toggle-group"
import { PerformanceDynamicsPoint } from '@/lib/services/project-performance-dynamics.service'
import { buildDynamicsTimeline, DynamicsRange, hasActivityInTimeline } from '../lib/performance-dynamics'

const chartConfig = {
    executionPlan: {
        label: "План работ",
        color: "var(--chart-1)",
    },
    executionFact: {
        label: "Факт работ",
        color: "var(--chart-2)",
    },
    procurementPlan: {
        label: "План материалов",
        color: "var(--chart-3)",
    },
    procurementFact: {
        label: "Факт материалов",
        color: "var(--chart-4)",
    },
} satisfies ChartConfig

type DashboardChartProps = {
    data: PerformanceDynamicsPoint[];
}

const periodLabels: Record<DynamicsRange, string> = {
    '1m': 'последний 1 месяц',
    '3m': 'последние 3 месяца',
    '12m': 'последние 12 месяцев',
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

    const timeline = React.useMemo(
        () => buildDynamicsTimeline(data, timeRange),
        [data, timeRange],
    )

    const hasActivity = React.useMemo(
        () => hasActivityInTimeline(timeline),
        [timeline],
    )

    return (
        <Card className="@container/card px-4 lg:px-6">
            <CardHeader className="px-0">
                <CardTitle>Performance Dynamics</CardTitle>
                <CardDescription>
                    Данные за {periodLabels[timeRange]} от текущей даты
                </CardDescription>
                <CardAction>
                    <ToggleGroup
                        type="single"
                        value={timeRange}
                        onValueChange={(value) => {
                            if (value) setTimeRange(value as DynamicsRange)
                        }}
                        variant="outline"
                        className="hidden *:data-[slot=toggle-group-item]:!px-4 @[767px]/card:flex"
                    >
                        <ToggleGroupItem value="1m">1 месяц</ToggleGroupItem>
                        <ToggleGroupItem value="3m">3 месяца</ToggleGroupItem>
                        <ToggleGroupItem value="12m">12 месяцев</ToggleGroupItem>
                    </ToggleGroup>
                    <Select value={timeRange} onValueChange={(value) => setTimeRange(value as DynamicsRange)}>
                        <SelectTrigger
                            className="flex w-40 **:data-[slot=select-value]:block **:data-[slot=select-value]:truncate @[767px]/card:hidden"
                            size="sm"
                            aria-label="Выбрать период"
                        >
                            <SelectValue placeholder="3 месяца" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl">
                            <SelectItem value="1m" className="rounded-lg">1 месяц</SelectItem>
                            <SelectItem value="3m" className="rounded-lg">3 месяца</SelectItem>
                            <SelectItem value="12m" className="rounded-lg">12 месяцев</SelectItem>
                        </SelectContent>
                    </Select>
                </CardAction>
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
                        <AreaChart data={timeline}>
                            <defs>
                                <linearGradient id="fillExecutionPlan" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="var(--color-executionPlan)" stopOpacity={0.2} />
                                    <stop offset="95%" stopColor="var(--color-executionPlan)" stopOpacity={0.04} />
                                </linearGradient>
                                <linearGradient id="fillProcurementPlan" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="var(--color-procurementPlan)" stopOpacity={0.16} />
                                    <stop offset="95%" stopColor="var(--color-procurementPlan)" stopOpacity={0.04} />
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
                                cursor={false}
                                content={
                                    <ChartTooltipContent
                                        labelFormatter={(value) => {
                                            const date = new Date(value as string)

                                            if (timeRange === '1m') {
                                                return date.toLocaleDateString('ru-RU', {
                                                    month: 'long',
                                                    day: 'numeric',
                                                    year: 'numeric',
                                                })
                                            }

                                            return date.toLocaleDateString('ru-RU', {
                                                month: 'long',
                                                year: 'numeric',
                                            })
                                        }}
                                        indicator="dot"
                                    />
                                }
                            />
                            <ChartLegend content={<ChartLegendContent />} />
                            <Area
                                dataKey="executionPlan"
                                name="executionPlan"
                                type="monotone"
                                fill="url(#fillExecutionPlan)"
                                stroke="var(--color-executionPlan)"
                                strokeWidth={2}
                            />
                            <Area
                                dataKey="procurementPlan"
                                name="procurementPlan"
                                type="monotone"
                                fill="url(#fillProcurementPlan)"
                                stroke="var(--color-procurementPlan)"
                                strokeWidth={2}
                            />
                            <Line
                                dataKey="executionFact"
                                name="executionFact"
                                type="monotone"
                                stroke="var(--color-executionFact)"
                                strokeWidth={2}
                                dot={{ r: 2 }}
                                activeDot={{ r: 4 }}
                            />
                            <Line
                                dataKey="procurementFact"
                                name="procurementFact"
                                type="monotone"
                                stroke="var(--color-procurementFact)"
                                strokeWidth={2}
                                dot={{ r: 2 }}
                                activeDot={{ r: 4 }}
                            />
                        </AreaChart>
                    </ChartContainer>
                )}
            </CardContent>
        </Card>
    )
}
