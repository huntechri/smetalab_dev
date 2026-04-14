import { describe, expect, it } from 'vitest';
import { __estimateDetailsShellInternal } from '@/features/projects/estimates/screens/EstimateDetailsShell.client';

describe('EstimateDetailsShell tab href builder', () => {
    it('sets tab query while preserving other params', () => {
        const href = __estimateDetailsShellInternal.buildTabHref(
            '/app/projects/p/estimates/e',
            'foo=1&tab=estimate',
            'procurement',
        );

        expect(href).toBe('/app/projects/p/estimates/e?foo=1&tab=procurement');
    });

    it('adds tab query when search is empty', () => {
        const href = __estimateDetailsShellInternal.buildTabHref(
            '/app/projects/p/estimates/e',
            '',
            'execution',
        );

        expect(href).toBe('/app/projects/p/estimates/e?tab=execution');
    });
});
