import { TrendingUp, TrendingDown, Users, Activity } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import {
    Card,
    CardAction,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { ProjectListItem } from "../../shared/types"

type DashboardKpiCardsProps = {
    project: ProjectListItem;
};

export function DashboardKpiCards({ project }: DashboardKpiCardsProps) {
    // Форматирование суммы контракта
    const formattedAmount = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0,
    }).format(project.contractAmount / 100); // Placeholder conversion for demo look

    return (
        <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <Card className="@container/card">
                <CardHeader>
                    <CardDescription>Total Revenue</CardDescription>
                    <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                        {formattedAmount}
                    </CardTitle>
                    <CardAction>
                        <Badge variant="outline">
                            <TrendingUp />
                            +12.5%
                        </Badge>
                    </CardAction>
                </CardHeader>
                <CardFooter className="flex-col items-start gap-1.5 text-sm">
                    <div className="line-clamp-1 flex gap-2 font-medium">
                        Trending up this month <TrendingUp className="size-4" />
                    </div>
                    <div className="text-muted-foreground">
                        Project budget utilization
                    </div>
                </CardFooter>
            </Card>

            <Card className="@container/card">
                <CardHeader>
                    <CardDescription>Overall Progress</CardDescription>
                    <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                        {project.progress}%
                    </CardTitle>
                    <CardAction>
                        <Badge variant="outline">
                            <Activity />
                            +4.5%
                        </Badge>
                    </CardAction>
                </CardHeader>
                <CardFooter className="flex-col items-start gap-1.5 text-sm">
                    <div className="line-clamp-1 flex gap-2 font-medium">
                        Ahead of schedule <Activity className="size-4" />
                    </div>
                    <div className="text-muted-foreground">
                        Current completion rate
                    </div>
                </CardFooter>
            </Card>

            <Card className="@container/card">
                <CardHeader>
                    <CardDescription>Active Tasks</CardDescription>
                    <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                        {Math.round(project.progress * 1.2)}
                    </CardTitle>
                    <CardAction>
                        <Badge variant="outline">
                            <Users />
                            On track
                        </Badge>
                    </CardAction>
                </CardHeader>
                <CardFooter className="flex-col items-start gap-1.5 text-sm">
                    <div className="line-clamp-1 flex gap-2 font-medium">
                        Team performance high <Users className="size-4" />
                    </div>
                    <div className="text-muted-foreground">
                        Assigned items for this week
                    </div>
                </CardFooter>
            </Card>

            <Card className="@container/card">
                <CardHeader>
                    <CardDescription>Growth Rate</CardDescription>
                    <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                        {(project.progress / 20).toFixed(1)}%
                    </CardTitle>
                    <CardAction>
                        <Badge variant="outline">
                            <TrendingUp />
                            Target
                        </Badge>
                    </CardAction>
                </CardHeader>
                <CardFooter className="flex-col items-start gap-1.5 text-sm">
                    <div className="line-clamp-1 flex gap-2 font-medium">
                        Steady growth increase <TrendingUp className="size-4" />
                    </div>
                    <div className="text-muted-foreground">
                        Meets efficiency projections
                    </div>
                </CardFooter>
            </Card>
        </div>
    )
}
