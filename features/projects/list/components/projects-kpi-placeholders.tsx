'use client';

import { Building2, Activity, Wallet, BarChart3 } from 'lucide-react';
import { KPICard, KPICardGrid, type KPICardValueTone } from '@/shared/ui/kpi-card';
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

    const currencyFormatter = new Intl.NumberFormat('ru-RU', {
        style: 'currency',
        currency: 'RUB',
        maximumFractionDigits: 0,
        notation: 'compact',
        compactDisplay: 'short'
    });

    const stats: Array<{
        title: string;
        value: string | number;
        description: string;
        icon: React.ReactNode;
        trend: string;
        valueTone: KPICardValueTone;
    }> = [
        {
            title: 'Всего проектов',
            value: totalProjects,
            description: 'Общее количество',
            icon: <Building2 className="h-4 w-4" />,
            trend: 'Total',
            valueTone: 'positive'
        },
        {
            title: 'В работе',
            value: activeProjects,
            description: 'Активные стадии',
            icon: <Activity className="h-4 w-4" />,
            trend: 'Live',
            valueTone: 'positive'
        },
        {
            title: 'Общий бюджет',
            value: currencyFormatter.format(totalBudget),
            description: 'Сумма контрактов',
            icon: <Wallet className="h-4 w-4" />,
            trend: 'Budget',
            valueTone: 'warning'
        },
        {
            title: 'Ср. прогресс',
            value: `${avgProgress}%`,
            description: 'Выполнение работ',
            icon: <BarChart3 className="h-4 w-4" />,
            trend: 'Avg',
            valueTone: 'positive'
        }
    ];

    return (
        <KPICardGrid>
            {stats.map((stat, index) => (
                <KPICard
                    key={index}
                    title={stat.title}
                    value={stat.value}
                    description={stat.description}
                    valueTone={stat.valueTone}
                    density="dashboard"
                />
            ))}
        </KPICardGrid>
    );
}

export const ProjectsKpiPlaceholders = ProjectsStatsCards;
