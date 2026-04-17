import { describe, expect, it } from 'vitest';
import { createQueryParams, getSortOption } from '@/features/projects/list/hooks/use-projects-screen';

describe('projects screen query params helpers', () => {
    it('updates existing params and removes empty values', () => {
        const query = createQueryParams('q=alpha&sort=name', {
            q: '',
            sort: 'progress',
        });

        expect(query).toBe('sort=progress');
    });

    it('returns default sort option for unknown values', () => {
        expect(getSortOption('invalid')).toBe('name');
        expect(getSortOption('contractAmount')).toBe('contractAmount');
    });
});
