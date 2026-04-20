export function parseDecimalInput(value: string): number {
    const normalized = value.trim().replace(/\s+/g, '').replace(',', '.');
    return Number(normalized);
}

export function toDecimalInput(value: number): string {
    return Number.isFinite(value) ? String(value) : '0';
}
