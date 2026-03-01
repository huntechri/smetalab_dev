import type { ProjectStatus } from '@/entities/project/model/status';

export type { ProjectStatus };

export type ProjectViewMode = 'grid' | 'list';

export type ProjectSortOption =
    | 'name'
    | 'contractAmount'
    | 'startDate'
    | 'endDate'
    | 'progress';

export type ProjectListItem = {
    id: string;
    slug: string;
    name: string;
    customerName: string;
    counterpartyId?: string;
    contractAmount: number;
    startDate: string;
    endDate: string;
    progress: number;
    status: ProjectStatus;
};
