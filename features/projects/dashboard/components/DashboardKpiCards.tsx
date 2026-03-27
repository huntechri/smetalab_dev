import { TrendingUp, Users, Activity } from "lucide-react"

import { Badge } from "@/shared/ui/badge"
import { KPICard } from "@/shared/ui/kpi-card"

type DashboardKpiCardsProps = {
    kpi: {
        revenue: number;
        profit: number;
        progress: number;
        remainingDays: number | null;
    };
};

export function DashboardKpiCards({ kpi }: DashboardKpiCardsProps) {
    const currencyFormatter = new Intl.NumberFormat('ru-RU', {
        style: 'currency',
        currency: 'RUB',
        maximumFractionDigits: 0,
    });

    const formattedRevenue = currencyFormatter.format(kpi.revenue);
    const formattedProfit = currencyFormatter.format(kpi.profit);
    const remainingDaysLabel = kpi.remainingDays === null
        ? 'Без срока'
        : kpi.remainingDays < 0
            ? `Просрочено ${Math.abs(kpi.remainingDays)} дн.`
            : `${kpi.remainingDays} дн.`;

    const getProfitValueClassName = (profit: number, revenue: number) => {
        if (profit < 0) return "text-red-600 dark:text-red-400";

        const profitPercent = revenue > 0 ? (profit / revenue) * 100 : 0;
        if (profitPercent <= 15) return "text-orange-500 dark:text-orange-400";

        return "bg-linear-to-r from-green-500 to-emerald-400 bg-clip-text text-transparent";
    };

    const getProgressValueClassName = (progress: number) => {
        if (progress < 30) return "text-red-600 dark:text-red-400";
        if (progress < 60) return "text-orange-500 dark:text-orange-400";

        return "bg-linear-to-r from-green-500 to-emerald-400 bg-clip-text text-transparent";
    };

    const getRemainingDaysValueClassName = (remainingDays: number | null) => {
        if (remainingDays === null) return "text-muted-foreground";
        if (remainingDays < 0) return "text-red-600 dark:text-red-400";

        return "bg-linear-to-r from-green-500 to-emerald-400 bg-clip-text text-transparent";
    };

    return (
        <div className="grid gap-2 sm:gap-3 md:gap-4 grid-cols-2 sm:grid-cols-2 xl:grid-cols-4">
            <KPICard
                title="Доход"
                value={formattedRevenue}
                valueClassName="text-green-600 dark:text-green-400"
                className="h-[72px] sm:h-[85px] md:h-[95px]"
                tooltip="План работа + план материал"
            />

            <KPICard
                title="Прибыль"
                value={formattedProfit}
                valueClassName={getProfitValueClassName(kpi.profit, kpi.revenue)}
                className="h-[72px] sm:h-[85px] md:h-[95px]"
                tooltip="(План раб. + план мат.) − (Факт раб. + факт мат.)"
            />

            <KPICard
                title="Прогресс"
                value={`${kpi.progress}%`}
                valueClassName={getProgressValueClassName(kpi.progress)}
                className="h-[72px] sm:h-[85px] md:h-[95px]"
                tooltip="Выполнение работ"
            />

            <KPICard
                title="Срок"
                value={remainingDaysLabel}
                valueClassName={getRemainingDaysValueClassName(kpi.remainingDays)}
                className="h-[72px] sm:h-[85px] md:h-[95px]"
                tooltip="Оставшееся время до завершения"
            />
        </div>
    )
}

