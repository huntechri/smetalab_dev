import { renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useEstimateSectionsExpansion } from '@/features/projects/estimates/hooks/use-estimate-sections-expansion';
import type { SectionNode } from '@/features/projects/estimates/lib/estimate-cards-table';

function makeSectionNode(id: string): SectionNode {
  return {
    section: {
      id,
      kind: 'section',
      code: id,
      name: id,
      unit: '',
      qty: 0,
      price: 0,
      sum: 0,
      expense: 0,
      order: 1,
    },
    works: [],
  };
}

describe('useEstimateSectionsExpansion', () => {
  it('auto-expands newly added sections', () => {
    const first = [makeSectionNode('section-1')];
    const second = [makeSectionNode('section-1'), makeSectionNode('section-2')];

    const { result, rerender } = renderHook(
      ({ sections }) => useEstimateSectionsExpansion(sections),
      { initialProps: { sections: first } },
    );

    expect(result.current.expandedSectionIds.has('section-1')).toBe(true);

    rerender({ sections: second });

    expect(result.current.expandedSectionIds.has('section-2')).toBe(true);
  });
});
