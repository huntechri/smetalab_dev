import { describe, expect, it } from 'vitest';
import { formatProjectCurrency, formatProjectDate } from '@/features/projects/list/utils/formatters';

describe('project list formatters', () => {
    it('formats currency in RUB locale style', () => {
        expect(formatProjectCurrency(1523400)).toBe('1\u00a0523\u00a0400\u00a0₽');
    });

    it('formats ISO date using ru-RU locale', () => {
        expect(formatProjectDate('2025-03-17T00:00:00.000Z')).toBe('17.03.2025');
    });

    it('returns dash for empty or null date', () => {
        expect(formatProjectDate('')).toBe('—');
        expect(formatProjectDate(null as any)).toBe('—');
        expect(formatProjectDate(undefined)).toBe('—');
    });

    it('returns dash for invalid date string', () => {
        expect(formatProjectDate('not-a-date')).toBe('—');
    });
});
