'use client';

import { Building2, Activity, Wallet, BarChart3 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardAction } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ProjectListItem } from '../../shared/types';

interface ProjectsStatsCardsProps {
    projects: ProjectListItem[];
}

export function ProjectsStatsCards({ projects }: ProjectsStatsCardsProps) {
    const totalProjects = projects.length;
    const activeProjects = projects.filter(p => p.status === 'active').length;
    const totalBudget = projects.reduce((sum, p) => sum + (p.contractAmount || 0), 0);
    const avgProgress = totalProjects > 0
        ? Math.round(projects.reduce((sum, p) => sum + (p.progress || 0), 0) / totalProjects)
        : 0;

    // Helper to format currency
    const formatCurrency = (val: number) => {
        if (val >= 1000000) return `${(val / 1000000).toFixed(1)}M`;
        if (val >= 1000) return `${(val / 1000).toFixed(1)}K`;
        return val.toString();
    };

    const stats = [
        {
            title: 'Всего проектов',
            value: totalProjects,
            description: 'Общее количество',
            icon: Building2,
            trend: 'Total',
            color: 'text-blue-600 bg-blue-500/10'
        },
        {
            title: 'В работе',
            value: activeProjects,
            description: 'Активные стадии',
            icon: Activity,
            trend: 'Live',
            color: 'text-emerald-600 bg-emerald-500/10'
        },
        {
            title: 'Общий бюджет',
            value: formatCurrency(totalBudget),
            description: 'Сумма контрактов',
            icon: Wallet,
            trend: 'Budget',
            color: 'text-amber-600 bg-amber-500/10'
        },
        {
            title: 'Ср. прогресс',
            value: `${avgProgress}%`,
            description: 'Выполнение работ',
            icon: BarChart3,
            trend: 'Avg',
            color: 'text-purple-600 bg-purple-500/10'
        }
    ];

    return (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat, index) => (
                <Card key={index} className="py-0 overflow-hidden relative border-primary/5 hover:border-primary/20 transition-all duration-300">
                    <CardHeader className="p-4 pb-2 space-y-1">
                        <CardDescription className="text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground">
                            {stat.title}
                        </CardDescription>
                        <CardTitle className="text-2xl font-bold tracking-tight">
                            {stat.value}
                        </CardTitle>
                        <CardAction>
                            <div className={`rounded-md p-1.5 ${stat.color}`}>
                                <stat.icon className="h-4 w-4" />
                            </div>
                        </CardAction>
                    </CardHeader>
                    <div className="px-4 pb-3 flex items-center justify-between">
                        <span className="text-[10px] text-muted-foreground font-medium">{stat.description}</span>
                        <Badge variant="outline" className="text-[9px] h-4 px-1.5 font-bold border-0 bg-muted/50 text-muted-foreground uppercase opacity-70">
                            {stat.trend}
                        </Badge>
                    </div>
                </Card>
            ))}
        </div>
    );
}

// Keep the old name as alias for backward compatibility if needed, 
// though we will update the parent component
export const ProjectsKpiPlaceholders = ProjectsStatsCards;
