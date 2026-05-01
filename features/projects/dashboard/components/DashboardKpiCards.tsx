import { KPICard, KPICardGrid, type KPICardValueTone } from "@/shared/ui/kpi-card"

type DashboardKpiCardsProps = {
    kpi: {
        revenue: number;
        expense: number;
        profit: number;
        progress: number;
        remainingDays: number | null;
    };
};

function getProfitTone(profit: number, revenue: number): KPICardValueTone {
    if (profit < 0) return "negative";

    const profitPercent = revenue > 0 ? (profit / revenue) * 100 : 0;
    if (profitPercent <= 15) return "warning";

    return "positive";
}

function getRemainingDaysTone(remainingDays: number | null): KPICardValueTone {
    if (remainingDays === null) return "muted";
    if (remainingDays < 0) return "negative";

    return "positive";
}

export function DashboardKpiCards({ kpi }: DashboardKpiCardsProps) {
    const currencyFormatter = new Intl.NumberFormat('ru-RU', {
        style: 'currency',
        currency: 'RUB',
        maximumFractionDigits: 0,
    });

    const formattedRevenue = currencyFormatter.format(kpi.revenue);
    const formattedExpense = currencyFormatter.format(kpi.expense);
    const formattedProfit = currencyFormatter.format(kpi.profit);
    const remainingDaysLabel = kpi.remainingDays === null
        ? 'Без срока'
        : kpi.remainingDays < 0
            ? `Просрочено ${Math.abs(kpi.remainingDays)} дн.`
            : `${kpi.remainingDays} дн.`;

    return (
        <KPICardGrid>
            <KPICard
                title="Приход"
                value={formattedRevenue}
                valueTone="positive"
                density="dashboard"
                tooltip="Сумма подтвержденных поступлений от заказчика"
            />

            <KPICard
                title="Расход"
                value={formattedExpense}
                valueTone="negative"
                density="dashboard"
                tooltip="Выполнение факт + закупки факт"
            />

            <KPICard
                title="Прибыль"
                value={formattedProfit}
                valueTone={getProfitTone(kpi.profit, kpi.revenue)}
                density="dashboard"
                tooltip="Поступления - факт работ - факт материалов"
            />

            <KPICard
                title="Срок"
                value={remainingDaysLabel}
                valueTone={getRemainingDaysTone(kpi.remainingDays)}
                density="dashboard"
                tooltip="Оставшееся время до завершения"
            />
        </KPICardGrid>
    )
}
