const pad = (value: number) => value.toString().padStart(2, '0');

export function isIsoDateString(value: string): boolean {
    return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

export function formatLocalDateToIso(value: Date): string {
    return `${value.getFullYear()}-${pad(value.getMonth() + 1)}-${pad(value.getDate())}`;
}

export function getTodayIsoLocal(): string {
    return formatLocalDateToIso(new Date());
}

export function addDaysToIsoDate(value: string, days: number): string {
    if (!isIsoDateString(value)) {
        throw new Error('INVALID_ISO_DATE');
    }

    const [year, month, day] = value.split('-').map(Number);
    const next = new Date(Date.UTC(year, month - 1, day));
    next.setUTCDate(next.getUTCDate() + days);

    return `${next.getUTCFullYear()}-${pad(next.getUTCMonth() + 1)}-${pad(next.getUTCDate())}`;
}

