import { describe, expect, it } from 'vitest';
import { parseDecimalInput, toDecimalInput } from '@/features/projects/estimates/lib/decimal-input';

describe('decimal-input helpers', () => {
    it('parses decimal numbers with dot and comma separators', () => {
        expect(parseDecimalInput('100.10')).toBe(100.1);
        expect(parseDecimalInput('100,10')).toBe(100.1);
        expect(parseDecimalInput(' 1 000,25 ')).toBe(1000.25);
    });

    it('returns NaN for invalid values', () => {
        expect(Number.isNaN(parseDecimalInput('abc'))).toBe(true);
        expect(Number.isNaN(parseDecimalInput(''))).toBe(false);
    });

    it('formats finite numbers for inputs', () => {
        expect(toDecimalInput(120.5)).toBe('120.5');
        expect(toDecimalInput(Number.NaN)).toBe('0');
    });
});
