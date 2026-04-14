import { describe, expect, it } from 'vitest';
import { applyEstimateCoefficient, getEstimateCoefMultiplier } from '@/lib/utils/estimate-coefficient';

describe('estimate coefficient helpers', () => {
    it('applies percent to base unit price', () => {
        expect(getEstimateCoefMultiplier(20)).toBe(1.2);
        expect(applyEstimateCoefficient(100, 20)).toBe(120);
    });

    it('supports decimals and negative coefficient', () => {
        expect(applyEstimateCoefficient(99.99, 12.5)).toBe(112.49);
        expect(applyEstimateCoefficient(100, -50)).toBe(50);
    });
});
