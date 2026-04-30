const pad = (value: number) => value.toString().padStart(2, '0');

export function isIsoDateString(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

/**
 * Converts a Date object to YYYY-MM-DD using local time.
 */
export function formatLocalDateToIso(value: Date): string {
  return `${value.getFullYear()}-${pad(value.getMonth() + 1)}-${pad(value.getDate())}`;
}

/**
 * Returns the current date in YYYY-MM-DD format using local time.
 */
export function getTodayIsoLocal(): string {
  return formatLocalDateToIso(new Date());
}

/**
 * Safely parses a YYYY-MM-DD string into a Date object at local midnight.
 */
export function parseIsoDateSafe(value: string): Date {
  if (!isIsoDateString(value)) {
    throw new Error('INVALID_ISO_DATE');
  }
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day);
}

/**
 * Adds days to an ISO date and returns a new ISO date.
 * Uses UTC arithmetic to avoid daylight-saving-time issues.
 */
export function addDaysToIsoDate(value: string, days: number): string {
  if (!isIsoDateString(value)) {
    throw new Error('INVALID_ISO_DATE');
  }

  const [year, month, day] = value.split('-').map(Number);
  const next = new Date(Date.UTC(year, month - 1, day));
  next.setUTCDate(next.getUTCDate() + days);

  return `${next.getUTCFullYear()}-${pad(next.getUTCMonth() + 1)}-${pad(next.getUTCDate())}`;
}
