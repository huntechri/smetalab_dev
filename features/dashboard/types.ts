export type HomeDashboardKpi = {
    revenue: number;
    profit: number;
    progress: number;
    remainingDays: number | null;
};

export type HomePerformanceDynamicsPoint = {
    date: string;
    executionPlan: number;
    executionFact: number;
    procurementPlan: number;
    procurementFact: number;
};
