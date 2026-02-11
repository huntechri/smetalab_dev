export type ProjectStatus = 'active' | 'completed' | 'planned';

export type ProjectViewMode = 'grid' | 'list';

export type ProjectSortOption =
    | 'name'
    | 'contractAmount'
    | 'startDate'
    | 'endDate'
    | 'progress';

export type ProjectListItem = {
    id: string;
    name: string;
    customerName: string;
    contractAmount: number;
    startDate: string;
    endDate: string;
    progress: number;
    status: ProjectStatus;
};
