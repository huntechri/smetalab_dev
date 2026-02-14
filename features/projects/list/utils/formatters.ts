const currencyFormatter = new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 0,
});

const dateFormatter = new Intl.DateTimeFormat('ru-RU');

export function formatProjectDate(dateString: string): string {
    return dateFormatter.format(new Date(dateString));
}

export function formatProjectCurrency(value: number): string {
    return currencyFormatter.format(value);
}
