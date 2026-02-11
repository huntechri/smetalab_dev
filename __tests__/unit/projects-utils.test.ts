import { describe, expect, it } from 'vitest';
import { filterProjects } from '@/features/projects/utils/filter';
import { sortProjects } from '@/features/projects/utils/sort';
import { ProjectListItem } from '@/features/projects/types';

const projects: ProjectListItem[] = [
    {
        id: 'alpha',
        name: 'Alpha Tower',
        customerName: 'North Build',
        contractAmount: 100,
        startDate: '2025-01-01T00:00:00.000Z',
        endDate: '2025-04-01T00:00:00.000Z',
        progress: 20,
        status: 'planned',
    },
    {
        id: 'bravo',
        name: 'Bravo Port',
        customerName: 'Logistics Inc',
        contractAmount: 500,
        startDate: '2025-02-01T00:00:00.000Z',
        endDate: '2025-03-01T00:00:00.000Z',
        progress: 80,
        status: 'active',
    },
    {
        id: 'charlie',
        name: 'Charlie Yard',
        customerName: 'North Build',
        contractAmount: 300,
        startDate: '2024-11-01T00:00:00.000Z',
        endDate: '2025-05-01T00:00:00.000Z',
        progress: 45,
        status: 'completed',
    },
];

describe('filterProjects', () => {
    it('filters by project name and customer name', () => {
        expect(filterProjects(projects, 'bravo')).toHaveLength(1);
        expect(filterProjects(projects, 'north')).toHaveLength(2);
    });

    it('returns all items for empty query', () => {
        expect(filterProjects(projects, '   ')).toHaveLength(3);
    });
});

describe('sortProjects', () => {
    it('sorts by contract amount descending', () => {
        const result = sortProjects(projects, 'contractAmount');
        expect(result.map((item) => item.id)).toEqual(['bravo', 'charlie', 'alpha']);
    });

    it('sorts by end date nearest first', () => {
        const result = sortProjects(projects, 'endDate');
        expect(result.map((item) => item.id)).toEqual(['bravo', 'alpha', 'charlie']);
    });

    it('sorts by progress descending', () => {
        const result = sortProjects(projects, 'progress');
        expect(result.map((item) => item.id)).toEqual(['bravo', 'charlie', 'alpha']);
    });
});
