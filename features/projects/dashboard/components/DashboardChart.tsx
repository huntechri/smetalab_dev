"use client"

import * as React from "react"

import {
    DashboardDynamicsChart,
    type DashboardDynamicsChartPoint,
    dashboardDynamicsDefaultVisibleSeries,
    type DashboardDynamicsMode,
    type DashboardDynamicsRange,
    type DashboardDynamicsSeriesKey,
    type DashboardDynamicsVisibleSeries,
    dashboardDynamicsSeriesOptions,
} from '@/shared/ui/dashboard-dynamics-chart'
import type { PerformanceDynamicsPoint } from '@/shared/types/performance-dynamics'
import { buildDynamicsFlowTimeline, buildDynamicsTimeline, hasActivityInTimeline } from '../lib/performance-dynamics'

type DashboardChartProps = {
    data: PerformanceDynamicsPoint[];
}

const normalizeMoney = (value: number) => Math.round((value + Number.EPSILON) * 100) / 100

export function DashboardChart({ data }: DashboardChartProps) {
    const [timeRange, setTimeRange] = React.useState<DashboardDynamicsRange>('3m')
    const [mode, setMode] = React.useState<DashboardDynamicsMode>('level')
    const [visibleSeries, setVisibleSeries] = React.useState<DashboardDynamicsVisibleSeries>(dashboardDynamicsDefaultVisibleSeries)

    const levelTimeline = React.useMemo(
        () => buildDynamicsTimeline(data, timeRange),
        [data, timeRange],
    )

    const flowTimeline = React.useMemo(
        () => buildDynamicsFlowTimeline(data, timeRange),
        [data, timeRange],
    )

    const timeline = mode === 'level' ? levelTimeline : flowTimeline

    const chartData = React.useMemo<DashboardDynamicsChartPoint[]>(
        () => timeline.map((point, index) => ({
            ...point,
            balance: normalizeMoney(
                levelTimeline[index]!.receiptsFact
                - levelTimeline[index]!.executionFact
                - levelTimeline[index]!.procurementFact,
            ),
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
                dashboardDynamicsSeriesOptions.some(({ key }) => visibleSeries[key] && Number(point[key] ?? 0) !== 0),
            )
        },
        [mode, flowTimeline, levelTimeline, chartData, visibleSeries],
    )

    const setSeriesVisibility = React.useCallback((key: DashboardDynamicsSeriesKey, checked: boolean) => {
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
        <DashboardDynamicsChart
            data={chartData}
            hasActivity={hasActivity}
            mode={mode}
            onModeChange={setMode}
            range={timeRange}
            onRangeChange={setTimeRange}
            visibleSeries={visibleSeries}
            onSeriesVisibilityChange={setSeriesVisibility}
        />
    )
}
