"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"

import { useIsMobile } from "@/hooks/use-mobile"
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

const chartData = [
    { date: "2024-04-01", budget: 222, actual: 150 },
    { date: "2024-04-02", budget: 97, actual: 180 },
    { date: "2024-04-03", budget: 167, actual: 120 },
    { date: "2024-04-04", budget: 242, actual: 260 },
    { date: "2024-04-05", budget: 373, actual: 290 },
    { date: "2024-04-06", budget: 301, actual: 340 },
    { date: "2024-04-07", budget: 245, actual: 180 },
    { date: "2024-04-08", budget: 409, actual: 320 },
    { date: "2024-04-09", budget: 59, actual: 110 },
    { date: "2024-04-10", budget: 261, actual: 190 },
    { date: "2024-04-11", budget: 327, actual: 350 },
    { date: "2024-04-12", budget: 292, actual: 210 },
    { date: "2024-04-13", budget: 342, actual: 380 },
    { date: "2024-04-14", budget: 137, actual: 220 },
    { date: "2024-04-15", budget: 120, actual: 170 },
    { date: "2024-04-16", budget: 138, actual: 190 },
    { date: "2024-04-17", budget: 446, actual: 360 },
    { date: "2024-04-18", budget: 364, actual: 410 },
    { date: "2024-04-19", budget: 243, actual: 180 },
    { date: "2024-04-20", budget: 89, actual: 150 },
    { date: "2024-04-21", budget: 137, actual: 200 },
    { date: "2024-04-22", budget: 224, actual: 170 },
    { date: "2024-04-23", budget: 138, actual: 230 },
    { date: "2024-04-24", budget: 387, actual: 290 },
    { date: "2024-04-25", budget: 215, actual: 250 },
    { date: "2024-04-26", budget: 75, actual: 130 },
    { date: "2024-04-27", budget: 383, actual: 420 },
    { date: "2024-04-28", budget: 122, actual: 180 },
    { date: "2024-04-29", budget: 315, actual: 240 },
    { date: "2024-04-30", budget: 454, actual: 380 },
    { date: "2024-05-01", budget: 165, actual: 220 },
    { date: "2024-05-02", budget: 293, actual: 310 },
    { date: "2024-05-03", budget: 247, actual: 190 },
    { date: "2024-05-04", budget: 385, actual: 420 },
    { date: "2024-05-05", budget: 481, actual: 390 },
    { date: "2024-05-06", budget: 498, actual: 520 },
    { date: "2024-05-07", budget: 388, actual: 300 },
    { date: "2024-05-08", budget: 149, actual: 210 },
    { date: "2024-05-09", budget: 227, actual: 180 },
    { date: "2024-05-10", budget: 293, actual: 330 },
    { date: "2024-05-11", budget: 335, actual: 270 },
    { date: "2024-05-12", budget: 197, actual: 240 },
    { date: "2024-05-13", budget: 197, actual: 160 },
    { date: "2024-05-14", budget: 448, actual: 490 },
    { date: "2024-05-15", budget: 473, actual: 380 },
    { date: "2024-05-16", budget: 338, actual: 400 },
    { date: "2024-05-17", budget: 499, actual: 420 },
    { date: "2024-05-18", budget: 315, actual: 350 },
    { date: "2024-05-19", budget: 235, actual: 180 },
    { date: "2024-05-20", budget: 177, actual: 230 },
    { date: "2024-05-21", budget: 82, actual: 140 },
    { date: "2024-05-22", budget: 81, actual: 120 },
    { date: "2024-05-23", budget: 252, actual: 290 },
    { date: "2024-05-24", budget: 294, actual: 220 },
    { date: "2024-05-25", budget: 201, actual: 250 },
    { date: "2024-05-26", budget: 213, actual: 170 },
    { date: "2024-05-27", budget: 420, actual: 460 },
    { date: "2024-05-28", budget: 233, actual: 190 },
    { date: "2024-05-29", budget: 78, actual: 130 },
    { date: "2024-05-30", budget: 340, actual: 280 },
    { date: "2024-05-31", budget: 178, actual: 230 },
    { date: "2024-06-01", budget: 178, actual: 200 },
    { date: "2024-06-02", budget: 470, actual: 410 },
    { date: "2024-06-03", budget: 103, actual: 160 },
    { date: "2024-06-04", budget: 439, actual: 380 },
    { date: "2024-06-05", budget: 88, actual: 140 },
    { date: "2024-06-06", budget: 294, actual: 250 },
    { date: "2024-06-07", budget: 323, actual: 370 },
    { date: "2024-06-08", budget: 385, actual: 320 },
    { date: "2024-06-09", budget: 438, actual: 480 },
    { date: "2024-06-10", budget: 155, actual: 200 },
    { date: "2024-06-11", budget: 92, actual: 150 },
    { date: "2024-06-12", budget: 492, actual: 420 },
    { date: "2024-06-13", budget: 81, actual: 130 },
    { date: "2024-06-14", budget: 426, actual: 380 },
    { date: "2024-06-15", budget: 307, actual: 350 },
    { date: "2024-06-16", budget: 371, actual: 310 },
    { date: "2024-06-17", budget: 475, actual: 520 },
    { date: "2024-06-18", budget: 107, actual: 170 },
    { date: "2024-06-19", budget: 341, actual: 290 },
    { date: "2024-06-20", budget: 408, actual: 450 },
    { date: "2024-06-21", budget: 169, actual: 210 },
    { date: "2024-06-22", budget: 317, actual: 270 },
    { date: "2024-06-23", budget: 480, actual: 530 },
    { date: "2024-06-24", budget: 132, actual: 180 },
    { date: "2024-06-25", budget: 141, actual: 190 },
    { date: "2024-06-26", budget: 434, actual: 380 },
    { date: "2024-06-27", budget: 448, actual: 490 },
    { date: "2024-06-28", budget: 149, actual: 200 },
    { date: "2024-06-29", budget: 103, actual: 160 },
    { date: "2024-06-30", budget: 446, actual: 400 },
]

const chartConfig = {
    budget: {
        label: "Budget",
        color: "var(--primary)",
    },
    actual: {
        label: "Actual",
        color: "var(--primary)",
    },
} satisfies ChartConfig

export function DashboardChart() {
    const isMobile = useIsMobile()
    const [timeRange, setTimeRange] = React.useState("90d")

    React.useEffect(() => {
        if (isMobile) {
            setTimeRange("7d")
        }
    }, [isMobile])

    const filteredData = chartData.filter((item) => {
        const date = new Date(item.date)
        const referenceDate = new Date("2024-06-30")
        let daysToSubtract = 90
        if (timeRange === "30d") {
            daysToSubtract = 30
        } else if (timeRange === "7d") {
            daysToSubtract = 7
        }
        const startDate = new Date(referenceDate)
        startDate.setDate(startDate.getDate() - daysToSubtract)
        return date >= startDate
    })

    return (
        <Card className="@container/card px-4 lg:px-6">
            <CardHeader className="px-0">
                <CardTitle>Performance Dynamics</CardTitle>
                <CardDescription>
                    <span className="hidden @[540px]/card:block">
                        Data for the last 3 months
                    </span>
                    <span className="@[540px]/card:hidden">Last 3 months</span>
                </CardDescription>
                <CardAction>
                    <ToggleGroup
                        type="single"
                        value={timeRange}
                        onValueChange={setTimeRange}
                        variant="outline"
                        className="hidden *:data-[slot=toggle-group-item]:!px-4 @[767px]/card:flex"
                    >
                        <ToggleGroupItem value="90d">3 months</ToggleGroupItem>
                        <ToggleGroupItem value="30d">30 days</ToggleGroupItem>
                        <ToggleGroupItem value="7d">7 days</ToggleGroupItem>
                    </ToggleGroup>
                    <Select value={timeRange} onValueChange={setTimeRange}>
                        <SelectTrigger
                            className="flex w-40 **:data-[slot=select-value]:block **:data-[slot=select-value]:truncate @[767px]/card:hidden"
                            size="sm"
                            aria-label="Select a value"
                        >
                            <SelectValue placeholder="3 месяца" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl">
                            <SelectItem value="90d" className="rounded-lg">
                                3 months
                            </SelectItem>
                            <SelectItem value="30d" className="rounded-lg">
                                30 days
                            </SelectItem>
                            <SelectItem value="7d" className="rounded-lg">
                                7 days
                            </SelectItem>
                        </SelectContent>
                    </Select>
                </CardAction>
            </CardHeader>
            <CardContent className="px-0 pt-4 sm:pt-6">
                <ChartContainer
                    config={chartConfig}
                    className="aspect-auto h-[200px] sm:h-[280px] w-full"
                >
                    <AreaChart data={filteredData}>
                        <defs>
                            <linearGradient id="fillBudget" x1="0" y1="0" x2="0" y2="1">
                                <stop
                                    offset="5%"
                                    stopColor="var(--color-budget)"
                                    stopOpacity={1.0}
                                />
                                <stop
                                    offset="95%"
                                    stopColor="var(--color-budget)"
                                    stopOpacity={0.1}
                                />
                            </linearGradient>
                            <linearGradient id="fillActual" x1="0" y1="0" x2="0" y2="1">
                                <stop
                                    offset="5%"
                                    stopColor="var(--color-actual)"
                                    stopOpacity={0.8}
                                />
                                <stop
                                    offset="95%"
                                    stopColor="var(--color-actual)"
                                    stopOpacity={0.1}
                                />
                            </linearGradient>
                        </defs>
                        <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-border" />
                        <XAxis
                            dataKey="date"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            minTickGap={32}
                            tickFormatter={(value) => {
                                const date = new Date(value)
                                return date.toLocaleDateString("ru-RU", {
                                    month: "short",
                                    day: "numeric",
                                })
                            }}
                        />
                        <YAxis
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            width={30}
                        />
                        <ChartTooltip
                            cursor={false}
                            content={
                                <ChartTooltipContent
                                    labelFormatter={(value) => {
                                        return new Date(value as string | number | Date).toLocaleDateString("ru-RU", {
                                            month: "long",
                                            day: "numeric",
                                        })
                                    }}
                                    indicator="dot"
                                />
                            }
                        />
                        <Area
                            dataKey="actual"
                            type="natural"
                            fill="url(#fillActual)"
                            stroke="var(--color-actual)"
                            stackId="a"
                        />
                        <Area
                            dataKey="budget"
                            type="natural"
                            fill="url(#fillBudget)"
                            stroke="var(--color-budget)"
                            stackId="a"
                        />
                    </AreaChart>
                </ChartContainer>
            </CardContent>
        </Card>
    )
}
