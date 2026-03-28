"use client";

import * as React from "react";
import { Area, CartesianGrid, ComposedChart, Line, XAxis, YAxis, ReferenceLine } from "recharts";

import {
    Card,
    CardAction,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/shared/ui/card";
import {
    type ChartConfig,
    ChartContainer,
    ChartLegend,
    ChartLegendContent,
    ChartTooltip,
    ChartTooltipContent,
} from "@/shared/ui/chart";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/shared/ui/select";
import {
    ToggleGroup,
    ToggleGroupItem,
} from "@/shared/ui/toggle-group";
import { buildDynamicsTimeline, DynamicsRange, hasActivityInTimeline, toIsoDate } from '../lib/performance-dynamics';
import { HomePerformanceDynamicsPoint } from '../types';

const chartConfig = {
    executionPlan: {
        label: "План раб.",
        color: "hsl(217, 91%, 60%)",
    },
    executionFact: {
        label: "Факт раб.",
        color: "hsl(224, 76%, 48%)",
    },
    procurementPlan: {
        label: "План мат.",
        color: "hsl(162, 72%, 48%)",
    },
    procurementFact: {
        label: "Факт мат.",
        color: "hsl(163, 94%, 24%)",
    },
} satisfies ChartConfig;

type HomeDynamicsChartProps = {
    data: HomePerformanceDynamicsPoint[];
};

const formatDateTick = (value: string, range: DynamicsRange) => {
    const date = new Date(value);

    if (range === '1m') {
        return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
    }

    return date.toLocaleDateString('ru-RU', { month: 'short', year: '2-digit' });
};

export function HomeDynamicsChart({ data }: HomeDynamicsChartProps) {
    const [timeRange, setTimeRange] = React.useState<DynamicsRange>('3m');

    const timeline = React.useMemo(
        () => buildDynamicsTimeline(data, timeRange),
        [data, timeRange],
    );

    const hasActivity = React.useMemo(
        () => hasActivityInTimeline(timeline),
        [timeline],
    );

    return (
        <Card className="@container/card px-4 lg:px-6">
            <CardHeader className="px-0">
                <CardTitle>Динамика проекта</CardTitle>
                <CardAction className="w-full sm:w-auto">
                    <ToggleGroup
                        type="single"
                        value={timeRange}
                        onValueChange={(value) => {
                            if (value) setTimeRange(value as DynamicsRange);
                        }}
                        variant="outline"
                        className="hidden w-fit *:data-[slot=toggle-group-item]:!px-3 @[767px]/card:flex"
                    >
                        <ToggleGroupItem value="1m">1 месяц</ToggleGroupItem>
                        <ToggleGroupItem value="3m">3 месяца</ToggleGroupItem>
                        <ToggleGroupItem value="12m">12 месяцев</ToggleGroupItem>
                    </ToggleGroup>
                    <Select value={timeRange} onValueChange={(value) => setTimeRange(value as DynamicsRange)}>
                        <SelectTrigger
                            className="ml-auto flex h-8 w-[6.5rem] text-xs **:data-[slot=select-value]:block **:data-[slot=select-value]:truncate @[767px]/card:hidden"
                            size="sm"
                            aria-label="Выбрать период"
                        >
                            <SelectValue placeholder="Период" />
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
                        <ComposedChart data={timeline}>
                            <defs>
                                <linearGradient id="homeFillExecution" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="var(--color-executionPlan)" stopOpacity={0.1} />
                                    <stop offset="100%" stopColor="var(--color-executionPlan)" stopOpacity={0.01} />
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
                                            const date = new Date(value as string);
                                            return date.toLocaleDateString('ru-RU', {
                                                month: 'long',
                                                day: timeRange === '1m' ? 'numeric' : undefined,
                                                year: 'numeric',
                                            });
                                        }}
                                        indicator="dot"
                                    />
                                }
                            />
                            <ChartLegend content={<ChartLegendContent className="flex-wrap justify-start gap-x-3 gap-y-2 text-[11px] sm:text-xs" />} />
                            <Area
                                dataKey="executionPlan"
                                name="executionPlan"
                                type="monotone"
                                fill="url(#homeFillExecution)"
                                stroke="var(--color-executionPlan)"
                                strokeWidth={2}
                                connectNulls
                            />
                            <Area
                                dataKey="procurementPlan"
                                name="procurementPlan"
                                type="monotone"
                                fill="none"
                                stroke="var(--color-procurementPlan)"
                                strokeWidth={2}
                                connectNulls
                            />
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
                        </ComposedChart>
                    </ChartContainer>
                )}
            </CardContent>
        </Card>
    );
}
