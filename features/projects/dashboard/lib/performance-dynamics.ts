import { PerformanceDynamicsPoint } from '@/lib/services/project-performance-dynamics.service';

export type DynamicsRange = '1m' | '3m' | '12m';

const monthsByRange: Record<DynamicsRange, number> = {
    '1m': 1,
    '3m': 3,
    '12m': 12,
};

export const filterDynamicsByRange = (
    data: PerformanceDynamicsPoint[],
    range: DynamicsRange,
    now: Date = new Date(),
): PerformanceDynamicsPoint[] => {
    const startDate = new Date(now);
    startDate.setMonth(startDate.getMonth() - monthsByRange[range]);

    return data.filter((point) => {
        const pointDate = new Date(point.date);
        return pointDate >= startDate && pointDate <= now;
    });
};
