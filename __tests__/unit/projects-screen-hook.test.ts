import { describe, expect, it } from 'vitest';
import { createQueryParams, getSortOption, getViewMode } from '@/features/projects/list/hooks/use-projects-screen';

describe('projects screen query params helpers', () => {
    it('updates existing params and removes empty values', () => {
        const query = createQueryParams('q=alpha&sort=name', {
            q: '',
            sort: 'progress',
            view: 'list',
        });

        expect(query).toBe('sort=progress&view=list');
    });

    it('returns default sort option for unknown values', () => {
        expect(getSortOption('invalid')).toBe('name');
        expect(getSortOption('contractAmount')).toBe('contractAmount');
    });

    it('returns default view mode for unknown values', () => {
        expect(getViewMode('cards')).toBe('grid');
        expect(getViewMode('list')).toBe('list');
    });
});
