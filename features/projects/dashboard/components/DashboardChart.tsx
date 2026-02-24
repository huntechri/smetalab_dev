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
import { DynamicsRange, filterDynamicsByRange } from '../lib/performance-dynamics'

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

export function DashboardChart({ data }: DashboardChartProps) {
    const [timeRange, setTimeRange] = React.useState<DynamicsRange>('3m')

    const filteredData = React.useMemo(
        () => filterDynamicsByRange(data, timeRange),
        [data, timeRange],
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
                {filteredData.length === 0 ? (
                    <div className="flex h-[200px] sm:h-[280px] items-center justify-center rounded-md border border-dashed text-sm text-muted-foreground">
                        Нет данных за выбранный период
                    </div>
                ) : (
                    <ChartContainer
                        config={chartConfig}
                        className="aspect-auto h-[200px] sm:h-[280px] w-full"
                    >
                        <AreaChart data={filteredData}>
                            <defs>
                                <linearGradient id="fillExecutionPlan" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="var(--color-executionPlan)" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="var(--color-executionPlan)" stopOpacity={0.05} />
                                </linearGradient>
                                <linearGradient id="fillProcurementPlan" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="var(--color-procurementPlan)" stopOpacity={0.25} />
                                    <stop offset="95%" stopColor="var(--color-procurementPlan)" stopOpacity={0.05} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-border" />
                            <XAxis
                                dataKey="date"
                                tickLine={false}
                                axisLine={false}
                                tickMargin={8}
                                minTickGap={24}
                                tickFormatter={(value) => new Date(value).toLocaleDateString("ru-RU", {
                                    month: "short",
                                    day: "numeric",
                                })}
                            />
                            <YAxis
                                tickLine={false}
                                axisLine={false}
                                tickMargin={8}
                                width={80}
                                tickFormatter={(value) => new Intl.NumberFormat('ru-RU', {
                                    notation: 'compact',
                                    maximumFractionDigits: 1,
                                }).format(Number(value))}
                            />
                            <ChartTooltip
                                cursor={false}
                                content={
                                    <ChartTooltipContent
                                        labelFormatter={(value) => new Date(value as string).toLocaleDateString("ru-RU", {
                                            month: "long",
                                            day: "numeric",
                                            year: "numeric",
                                        })}
                                        formatter={(value) => new Intl.NumberFormat('ru-RU', {
                                            style: 'currency',
                                            currency: 'RUB',
                                            maximumFractionDigits: 0,
                                        }).format(Number(value))}
                                        indicator="dot"
                                    />
                                }
                            />
                            <Area
                                dataKey="executionPlan"
                                type="monotone"
                                fill="url(#fillExecutionPlan)"
                                stroke="var(--color-executionPlan)"
                                strokeWidth={2}
                            />
                            <Area
                                dataKey="procurementPlan"
                                type="monotone"
                                fill="url(#fillProcurementPlan)"
                                stroke="var(--color-procurementPlan)"
                                strokeWidth={2}
                            />
                            <Line
                                dataKey="executionFact"
                                type="monotone"
                                stroke="var(--color-executionFact)"
                                strokeWidth={2}
                                dot={false}
                            />
                            <Line
                                dataKey="procurementFact"
                                type="monotone"
                                stroke="var(--color-procurementFact)"
                                strokeWidth={2}
                                dot={false}
                            />
                        </AreaChart>
                    </ChartContainer>
                )}
            </CardContent>
        </Card>
    )
}
