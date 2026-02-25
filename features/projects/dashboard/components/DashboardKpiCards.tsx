import { TrendingUp, Users, Activity } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import {
    Card,
    CardAction,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip"

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
        : `${kpi.remainingDays} дн.`;

    return (
        <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <Tooltip>
                <TooltipTrigger asChild>
                    <Card className="@container/card">
                        <CardHeader>
                            <CardDescription>Доход</CardDescription>
                            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
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
                            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
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
                            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
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
                            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
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
