const pad = (value: number) => value.toString().padStart(2, '0');

export function isIsoDateString(value: string): boolean {
    return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

/**
 * Конвертирует объект Date в строку YYYY-MM-DD, используя локальное время.
 */
export function formatLocalDateToIso(value: Date): string {
    return `${value.getFullYear()}-${pad(value.getMonth() + 1)}-${pad(value.getDate())}`;
}

/**
 * Возвращает текущую дату в формате YYYY-MM-DD по локальному времени.
 */
export function getTodayIsoLocal(): string {
    return formatLocalDateToIso(new Date());
}

/**
 * Безопасно парсит строку YYYY-MM-DD в объект Date (полночь по местному времени).
 * Избегает проблем с UTC-сдвигом при использовании new Date(isoString).
 */
export function parseIsoDateSafe(value: string): Date {
    if (!isIsoDateString(value)) {
        throw new Error('INVALID_ISO_DATE');
    }
    const [year, month, day] = value.split('-').map(Number);
    return new Date(year, month - 1, day);
}

/**
 * Добавляет указанное количество дней к ISO дате, возвращая новую ISO дату.
 * Работает через UTC для исключения проблем с переходом на летнее/зимнее время.
 */
export function addDaysToIsoDate(value: string, days: number): string {
    if (!isIsoDateString(value)) {
        throw new Error('INVALID_ISO_DATE');
    }

    const [year, month, day] = value.split('-').map(Number);
    // Используем UTC для арифметики дат, чтобы избежать проблем с DST
    const next = new Date(Date.UTC(year, month - 1, day));
    next.setUTCDate(next.getUTCDate() + days);

    return `${next.getUTCFullYear()}-${pad(next.getUTCMonth() + 1)}-${pad(next.getUTCDate())}`;
}
