/**
 * UI formatters for currency, numbers, and other common patterns.
 * Shared across the application to ensure consistency and performance.
 */

/**
 * Basic price formatter (rounded to integer)
 * Example: 1234.56 -> 1 235
 */
export const priceFormatter = new Intl.NumberFormat('ru-RU', {
    maximumFractionDigits: 0,
});

/**
 * Standard currency formatter (RUB with 2 decimal places)
 * Example: 1234.56 -> 1 234,56 ₽
 */
export const currencyFormatter = new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 2,
});

/**
 * Standard number formatter for the current locale
 */
export const numberFormatter = new Intl.NumberFormat('ru-RU');

/**
 * Formats a number as a price string
 */
export function formatPrice(value: number): string {
    return priceFormatter.format(value);
}

/**
 * Formats a number as a currency string (with RUB symbol)
 */
export function formatCurrency(value: number): string {
    return currencyFormatter.format(value);
}

/**
 * Helper to append a unit to a value
 * Example: "кг" -> "/ кг"
 */
export function formatUnit(unit: string | null | undefined): string {
    if (!unit) return '';
    return `/ ${unit}`;
}
