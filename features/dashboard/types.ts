export type HomeDashboardKpi = {
    revenue: number;
    expense: number;
    profit: number;
    progress: number;
    remainingDays: number | null;
};

export type HomePerformanceDynamicsPoint = {
    date: string;
    receiptsFact: number;
    executionPlan: number;
    executionFact: number;
    procurementPlan: number;
    procurementFact: number;
};
