'use client';

import { Building2, Activity, Wallet, BarChart3 } from 'lucide-react';
import { KPICard } from '@repo/ui';
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

    const stats = [
        {
            title: 'Всего проектов',
            value: totalProjects,
            description: 'Общее количество',
            icon: <Building2 className="h-4 w-4" />,
            trend: 'Total',
            color: 'text-primary'
        },
        {
            title: 'В работе',
            value: activeProjects,
            description: 'Активные стадии',
            icon: <Activity className="h-4 w-4" />,
            trend: 'Live',
            color: 'text-emerald-500 dark:text-emerald-400'
        },
        {
            title: 'Общий бюджет',
            value: currencyFormatter.format(totalBudget),
            description: 'Сумма контрактов',
            icon: <Wallet className="h-4 w-4" />,
            trend: 'Budget',
            color: 'text-amber-500 dark:text-amber-400'
        },
        {
            title: 'Ср. прогресс',
            value: `${avgProgress}%`,
            description: 'Выполнение работ',
            icon: <BarChart3 className="h-4 w-4" />,
            trend: 'Avg',
            color: 'text-primary'
        }
    ];

    return (
        <div className="grid gap-2 sm:gap-3 md:gap-4 grid-cols-2 sm:grid-cols-2 xl:grid-cols-4">
            {stats.map((stat, index) => (
                <KPICard
                    key={index}
                    title={stat.title}
                    value={stat.value}
                    description={stat.description}
                    valueClassName={stat.color}
                    className="h-[72px] sm:h-[85px] md:h-[95px] flex flex-col justify-center"
                />
            ))}
        </div>
    );
}

export const ProjectsKpiPlaceholders = ProjectsStatsCards;
