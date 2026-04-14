export const ESTIMATE_COEF_MIN = -100;
export const ESTIMATE_COEF_MAX = 1000;

export const roundMoney = (value: number): number => Math.round((value + Number.EPSILON) * 100) / 100;

export const getEstimateCoefMultiplier = (coefPercent: number): number => 1 + coefPercent / 100;

export const applyEstimateCoefficient = (baseUnitPrice: number, coefPercent: number): number => roundMoney(baseUnitPrice * getEstimateCoefMultiplier(coefPercent));
