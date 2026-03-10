import { TrendingUp, Users, Activity } from "lucide-react"

import { Badge } from "@/shared/ui/badge"
import {
    Card,
    CardAction,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/shared/ui/card"
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/shared/ui/tooltip"

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

    const valueBaseClassName = "text-xl sm:text-2xl lg:text-3xl font-semibold tabular-nums break-words leading-tight";

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
        <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-sm grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <Tooltip>
                <TooltipTrigger asChild>
                    <Card className="@container/card">
                        <CardHeader>
                            <CardDescription>Доход</CardDescription>
                            <CardTitle className={`${valueBaseClassName} text-green-600 dark:text-green-400`}>
                                {formattedRevenue}
                            </CardTitle>
                            <CardAction>
                                <Badge variant="outline">
                                    <TrendingUp />
                                    План
                                </Badge>
                            </CardAction>
                        </CardHeader>
                    </Card>
                </TooltipTrigger>
                <TooltipContent side="bottom" sideOffset={8}>
                    План раб. + план мат.
                </TooltipContent>
            </Tooltip>

            <Tooltip>
                <TooltipTrigger asChild>
                    <Card className="@container/card">
                        <CardHeader>
                            <CardDescription>Прибыль</CardDescription>
                            <CardTitle className={`${valueBaseClassName} ${getProfitValueClassName(kpi.profit, kpi.revenue)}`}>
                                {formattedProfit}
                            </CardTitle>
                            <CardAction>
                                <Badge variant="outline">
                                    <Activity />
                                    Δ План/Факт
                                </Badge>
                            </CardAction>
                        </CardHeader>
                    </Card>
                </TooltipTrigger>
                <TooltipContent side="bottom" sideOffset={8}>
                    (План раб. + план мат.) − (Факт раб. + факт мат.)
                </TooltipContent>
            </Tooltip>

            <Tooltip>
                <TooltipTrigger asChild>
                    <Card className="@container/card">
                        <CardHeader>
                            <CardDescription>Прогресс</CardDescription>
                            <CardTitle className={`${valueBaseClassName} ${getProgressValueClassName(kpi.progress)}`}>
                                {kpi.progress}%
                            </CardTitle>
                            <CardAction>
                                <Badge variant="outline">
                                    <Users />
                                    По работам
                                </Badge>
                            </CardAction>
                        </CardHeader>
                    </Card>
                </TooltipTrigger>
                <TooltipContent side="bottom" sideOffset={8}>
                    Выполнение работ
                </TooltipContent>
            </Tooltip>

            <Tooltip>
                <TooltipTrigger asChild>
                    <Card className="@container/card">
                        <CardHeader>
                            <CardDescription>Срок</CardDescription>
                            <CardTitle className={`${valueBaseClassName} ${getRemainingDaysValueClassName(kpi.remainingDays)}`}>
                                {remainingDaysLabel}
                            </CardTitle>
                            <CardAction>
                                <Badge variant="outline">
                                    <TrendingUp />
                                    До конца
                                </Badge>
                            </CardAction>
                        </CardHeader>
                    </Card>
                </TooltipTrigger>
                <TooltipContent side="bottom" sideOffset={8}>
                    Оставшееся время до завершения
                </TooltipContent>
            </Tooltip>
        </div>
    )
}
