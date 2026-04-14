import { PerformanceDynamicsPoint } from '@/lib/services/project-performance-dynamics.service';

export type DynamicsRange = '1m' | '3m' | '12m';
export type DynamicsMode = 'level' | 'flow';
export type DynamicsChartPoint = PerformanceDynamicsPoint & {
    balance: number;
};

type RangeBoundaries = {
    start: Date;
    end: Date;
};

export const toIsoDate = (value: Date) => {
    const year = value.getFullYear();
    const month = String(value.getMonth() + 1).padStart(2, '0');
    const day = String(value.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
};

const normalizeMoney = (value: number) => Math.round((value + Number.EPSILON) * 100) / 100;

const ESTIMATE_STATUS_IN_PROGRESS = 'in_progress';
const ESTIMATE_STATUS_APPROVED = 'approved';

const normalizeDate = (date: Date) => {
    const normalized = new Date(date);
    normalized.setHours(0, 0, 0, 0);
    return normalized;
};

const endOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0);

type DynamicsSeriesValues = Omit<PerformanceDynamicsPoint, 'date'>;

const addValues = (target: DynamicsSeriesValues, source: DynamicsSeriesValues) => {
    target.receiptsFact = normalizeMoney(target.receiptsFact + source.receiptsFact);
    target.executionPlan = normalizeMoney(target.executionPlan + source.executionPlan);
    target.executionFact = normalizeMoney(target.executionFact + source.executionFact);
    target.procurementPlan = normalizeMoney(target.procurementPlan + source.procurementPlan);
    target.procurementFact = normalizeMoney(target.procurementFact + source.procurementFact);
};

const applyCarryForward = (
    timeline: PerformanceDynamicsPoint[],
    openingBalance: DynamicsSeriesValues,
): PerformanceDynamicsPoint[] => {
    let running = { ...openingBalance };

    return timeline.map((point) => {
        running = {
            receiptsFact: normalizeMoney(running.receiptsFact + point.receiptsFact),
            executionPlan: normalizeMoney(running.executionPlan + point.executionPlan),
            executionFact: normalizeMoney(running.executionFact + point.executionFact),
            procurementPlan: normalizeMoney(running.procurementPlan + point.procurementPlan),
            procurementFact: normalizeMoney(running.procurementFact + point.procurementFact),
        };

        return {
            date: point.date,
            ...running,
        };
    });
};

const createEmptyPoint = (date: string): PerformanceDynamicsPoint => ({
    date,
    receiptsFact: 0,
    executionPlan: 0,
    executionFact: 0,
    procurementPlan: 0,
    procurementFact: 0,
});

const getRangeBoundaries = (range: DynamicsRange, now: Date): RangeBoundaries => {
    const today = normalizeDate(now);

    if (range === '1m') {
        const start = normalizeDate(now);
        start.setMonth(start.getMonth() - 1);

        return { start, end: today };
    }

    const monthsCount = range === '3m' ? 3 : 12;
    const start = new Date(now.getFullYear(), now.getMonth() - (monthsCount - 1), 1);
    const end = normalizeDate(endOfMonth(now));

    return { start, end };
};

const aggregateByDay = (
    data: PerformanceDynamicsPoint[],
    start: Date,
    end: Date,
): { timeline: PerformanceDynamicsPoint[]; openingBalance: DynamicsSeriesValues } => {
    const valuesByDate = new Map<string, PerformanceDynamicsPoint>();
    const openingBalance = {
        receiptsFact: 0,
        executionPlan: 0,
        executionFact: 0,
        procurementPlan: 0,
        procurementFact: 0,
    };

    for (const point of data) {
        const pointDate = normalizeDate(new Date(point.date));

        if (pointDate < start) {
            addValues(openingBalance, point);
            continue;
        }

        if (pointDate > end) continue;

        const key = toIsoDate(pointDate);
        const existing = valuesByDate.get(key) ?? createEmptyPoint(key);
        addValues(existing, point);
        valuesByDate.set(key, existing);
    }

    const timeline: PerformanceDynamicsPoint[] = [];
    const cursor = new Date(start);

    while (cursor <= end) {
        const key = toIsoDate(cursor);
        timeline.push(valuesByDate.get(key) ?? createEmptyPoint(key));
        cursor.setDate(cursor.getDate() + 1);
    }

    return { timeline, openingBalance };
};

const aggregateByMonth = (
    data: PerformanceDynamicsPoint[],
    start: Date,
    end: Date,
): { timeline: PerformanceDynamicsPoint[]; openingBalance: DynamicsSeriesValues } => {
    const valuesByMonth = new Map<string, PerformanceDynamicsPoint>();
    const openingBalance = {
        receiptsFact: 0,
        executionPlan: 0,
        executionFact: 0,
        procurementPlan: 0,
        procurementFact: 0,
    };

    for (const point of data) {
        const pointDate = normalizeDate(new Date(point.date));

        if (pointDate < start) {
            addValues(openingBalance, point);
            continue;
        }

        if (pointDate > end) continue;

        const monthDate = new Date(pointDate.getFullYear(), pointDate.getMonth(), 1);
        const key = toIsoDate(monthDate);
        const existing = valuesByMonth.get(key) ?? createEmptyPoint(key);
        addValues(existing, point);
        valuesByMonth.set(key, existing);
    }

    const timeline: PerformanceDynamicsPoint[] = [];
    const cursor = new Date(start.getFullYear(), start.getMonth(), 1);
    const endMonth = new Date(end.getFullYear(), end.getMonth(), 1);

    while (cursor <= endMonth) {
        const key = toIsoDate(cursor);
        timeline.push(valuesByMonth.get(key) ?? createEmptyPoint(key));
        cursor.setMonth(cursor.getMonth() + 1);
    }

    return { timeline, openingBalance };
};

export const buildDynamicsTimeline = (
    data: PerformanceDynamicsPoint[],
    range: DynamicsRange,
    now: Date = new Date(),
): PerformanceDynamicsPoint[] => {
    const { start, end } = getRangeBoundaries(range, now);

    const aggregated = range === '1m'
        ? aggregateByDay(data, start, end)
        : aggregateByMonth(data, start, end);

    return applyCarryForward(aggregated.timeline, aggregated.openingBalance);
};

export const buildDynamicsFlowTimeline = (
    data: PerformanceDynamicsPoint[],
    range: DynamicsRange,
    now: Date = new Date(),
): PerformanceDynamicsPoint[] => {
    const { start, end } = getRangeBoundaries(range, now);

    const aggregated = range === '1m'
        ? aggregateByDay(data, start, end)
        : aggregateByMonth(data, start, end);

    return aggregated.timeline;
};

export const hasActivityInTimeline = (timeline: PerformanceDynamicsPoint[]) => {
    return timeline.some((point) =>
        point.receiptsFact !== 0 || point.executionPlan !== 0 || point.executionFact !== 0 || point.procurementPlan !== 0 || point.procurementFact !== 0,
    );
};

export const withBalanceSeries = (timeline: PerformanceDynamicsPoint[]): DynamicsChartPoint[] => {
    return timeline.map((point) => ({
        ...point,
        balance: normalizeMoney(
            point.receiptsFact - point.executionFact - point.procurementFact,
        ),
    }));
};

export const canShowDynamicsChartByEstimateStatuses = (estimateStatuses: readonly string[]) => {
    return estimateStatuses.some(
        (status) => status === ESTIMATE_STATUS_IN_PROGRESS || status === ESTIMATE_STATUS_APPROVED,
    );
};
