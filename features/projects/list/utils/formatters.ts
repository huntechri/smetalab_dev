const currencyFormatter = new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 0,
});

const dateFormatter = new Intl.DateTimeFormat('ru-RU');

export function formatProjectDate(dateString: string | null | undefined): string {
    if (!dateString) return '—';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '—';
    return dateFormatter.format(date);
}

export function formatProjectCurrency(value: number): string {
    return currencyFormatter.format(value);
}
