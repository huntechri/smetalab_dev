import { describe, expect, it } from 'vitest';
import { addDaysToIsoDate, formatLocalDateToIso, isIsoDateString, parseIsoDateSafe } from '@/features/global-purchases/lib/date';

describe('Global Purchases Date Helpers v2', () => {
    describe('isIsoDateString', () => {
        it('validates correct format', () => {
            expect(isIsoDateString('2023-10-27')).toBe(true);
            expect(isIsoDateString('2023-01-01')).toBe(true);
        });

        it('rejects incorrect format', () => {
            expect(isIsoDateString('27-10-2023')).toBe(false);
            expect(isIsoDateString('2023/10/27')).toBe(false);
            expect(isIsoDateString('invalid')).toBe(false);
        });
    });

    describe('parseIsoDateSafe', () => {
        it('parses YYYY-MM-DD as local midnight', () => {
            const date = parseIsoDateSafe('2023-10-27');
            expect(date.getFullYear()).toBe(2023);
            expect(date.getMonth()).toBe(9); // October
            expect(date.getDate()).toBe(27);
            expect(date.getHours()).toBe(0);
        });

        it('throws on invalid format', () => {
            expect(() => parseIsoDateSafe('invalid')).toThrow('INVALID_ISO_DATE');
        });
    });

    describe('addDaysToIsoDate', () => {
        it('adds days correctly across month boundaries', () => {
            expect(addDaysToIsoDate('2023-10-31', 1)).toBe('2023-11-01');
        });

        it('adds days correctly across year boundaries', () => {
            expect(addDaysToIsoDate('2023-12-31', 1)).toBe('2024-01-01');
        });

        it('handles leap years', () => {
            expect(addDaysToIsoDate('2024-02-28', 1)).toBe('2024-02-29');
            expect(addDaysToIsoDate('2024-02-29', 1)).toBe('2024-03-01');
        });

        it('subtracts days correctly', () => {
            expect(addDaysToIsoDate('2023-11-01', -1)).toBe('2023-10-31');
        });
    });

    describe('formatLocalDateToIso', () => {
        it('formats local date correctly', () => {
            const date = new Date(2023, 9, 27); // Oct 27
            expect(formatLocalDateToIso(date)).toBe('2023-10-27');
        });
    });
});
