export function MoneyCell({ value }: { value: number }) {
    return <span className="tabular-nums text-inherit font-inherit">{new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 0 }).format(value)}</span>;
}
