export interface ExecutionMoneyMetrics {
    plannedSum: number;
    actualSum: number;
    deltaSum: number;
    marginPercent: number | null;
}

export function calculateExecutionMoneyMetrics(plannedQty: number, plannedPrice: number, actualQty: number, actualPrice: number): ExecutionMoneyMetrics {
    const plannedSum = plannedQty * plannedPrice;
    const actualSum = actualQty * actualPrice;
    const deltaSum = actualSum - plannedSum;

    if (plannedSum <= 0) {
        return {
            plannedSum,
            actualSum,
            deltaSum,
            marginPercent: null,
        };
    }

    return {
        plannedSum,
        actualSum,
        deltaSum,
        marginPercent: ((plannedSum - actualSum) / plannedSum) * 100,
    };
}
