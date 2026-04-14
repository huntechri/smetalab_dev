import { describe, expect, it } from 'vitest';
import { addDaysToIsoDate, formatLocalDateToIso, isIsoDateString } from '@/features/global-purchases/lib/date';

describe('global purchases date helpers', () => {
    it('formats local date into ISO', () => {
        const value = new Date(2026, 0, 5);
        expect(formatLocalDateToIso(value)).toBe('2026-01-05');
    });

    it('adds days correctly across month/year boundaries', () => {
        expect(addDaysToIsoDate('2026-01-31', 1)).toBe('2026-02-01');
        expect(addDaysToIsoDate('2026-12-31', 1)).toBe('2027-01-01');
        expect(addDaysToIsoDate('2026-03-01', -1)).toBe('2026-02-28');
    });

    it('validates ISO format', () => {
        expect(isIsoDateString('2026-09-15')).toBe(true);
        expect(isIsoDateString('15.09.2026')).toBe(false);
    });

    it('throws when date input is invalid', () => {
        expect(() => addDaysToIsoDate('2026/09/15', 1)).toThrow('INVALID_ISO_DATE');
    });
});
