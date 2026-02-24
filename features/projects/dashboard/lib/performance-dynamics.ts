import { PerformanceDynamicsPoint } from '@/lib/services/project-performance-dynamics.service';

export type DynamicsRange = '1m' | '3m' | '12m';

type RangeBoundaries = {
    start: Date;
    end: Date;
};

const toIsoDate = (value: Date) => value.toISOString().slice(0, 10);

const normalizeMoney = (value: number) => Math.round((value + Number.EPSILON) * 100) / 100;

const normalizeDate = (date: Date) => {
    const normalized = new Date(date);
    normalized.setHours(0, 0, 0, 0);
    return normalized;
};

const addValues = (target: PerformanceDynamicsPoint, source: PerformanceDynamicsPoint) => {
    target.executionPlan = normalizeMoney(target.executionPlan + source.executionPlan);
    target.executionFact = normalizeMoney(target.executionFact + source.executionFact);
    target.procurementPlan = normalizeMoney(target.procurementPlan + source.procurementPlan);
    target.procurementFact = normalizeMoney(target.procurementFact + source.procurementFact);
};

const createEmptyPoint = (date: string): PerformanceDynamicsPoint => ({
    date,
    executionPlan: 0,
    executionFact: 0,
    procurementPlan: 0,
    procurementFact: 0,
});

const getRangeBoundaries = (range: DynamicsRange, now: Date): RangeBoundaries => {
    const end = normalizeDate(now);

    if (range === '1m') {
        const start = normalizeDate(now);
        start.setMonth(start.getMonth() - 1);

        return { start, end };
    }

    const monthsCount = range === '3m' ? 3 : 12;
    const start = new Date(now.getFullYear(), now.getMonth() - (monthsCount - 1), 1);

    return { start, end };
};

const aggregateByDay = (
    data: PerformanceDynamicsPoint[],
    start: Date,
    end: Date,
): PerformanceDynamicsPoint[] => {
    const valuesByDate = new Map<string, PerformanceDynamicsPoint>();

    for (const point of data) {
        const pointDate = normalizeDate(new Date(point.date));
        if (pointDate < start || pointDate > end) continue;

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

    return timeline;
};

const aggregateByMonth = (
    data: PerformanceDynamicsPoint[],
    start: Date,
    end: Date,
): PerformanceDynamicsPoint[] => {
    const valuesByMonth = new Map<string, PerformanceDynamicsPoint>();

    for (const point of data) {
        const pointDate = normalizeDate(new Date(point.date));
        if (pointDate < start || pointDate > end) continue;

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

    return timeline;
};

export const buildDynamicsTimeline = (
    data: PerformanceDynamicsPoint[],
    range: DynamicsRange,
    now: Date = new Date(),
): PerformanceDynamicsPoint[] => {
    const { start, end } = getRangeBoundaries(range, now);

    return range === '1m'
        ? aggregateByDay(data, start, end)
        : aggregateByMonth(data, start, end);
};

export const hasActivityInTimeline = (timeline: PerformanceDynamicsPoint[]) => {
    return timeline.some((point) =>
        point.executionPlan !== 0 || point.executionFact !== 0 || point.procurementPlan !== 0 || point.procurementFact !== 0,
    );
};
