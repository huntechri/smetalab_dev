import { describe, expect, it } from 'vitest';
import { getProgressGradient } from '@/features/projects/list/utils/progress-gradient';

describe('getProgressGradient', () => {
    it('returns red range gradient at 0 percent', () => {
        expect(getProgressGradient(0)).toContain('hsl(0 82% 55%)');
    });

    it('returns green range gradient at 100 percent', () => {
        expect(getProgressGradient(100)).toContain('hsl(120 75% 42%)');
    });

    it('clamps out of range progress values', () => {
        expect(getProgressGradient(-20)).toEqual(getProgressGradient(0));
        expect(getProgressGradient(120)).toEqual(getProgressGradient(100));
    });
});
