import { describe, expect, it } from 'vitest';
import {
  buildSectionNodes,
  DEFAULT_SECTION_ID,
  filterSectionsByQuery,
} from '@/features/projects/estimates/lib/estimate-cards-table';
import type { EstimateRow } from '@/features/projects/estimates/types/dto';

function makeRows(): EstimateRow[] {
  return [
    {
      id: 'work-before-section',
      kind: 'work',
      code: 'W-0',
      name: 'Черновая работа',
      unit: 'шт',
      qty: 1,
      price: 100,
      sum: 100,
      expense: 0,
      order: 0,
    },
    {
      id: 'section-1',
      kind: 'section',
      code: 'РАЗДЕЛ 1',
      name: 'Основной раздел',
      unit: '',
      qty: 0,
      price: 0,
      sum: 0,
      expense: 0,
      order: 1,
    },
    {
      id: 'work-1',
      kind: 'work',
      code: 'W-1',
      name: 'Монтаж',
      unit: 'м2',
      qty: 2,
      price: 150,
      sum: 300,
      expense: 0,
      order: 2,
    },
    {
      id: 'material-1',
      kind: 'material',
      parentWorkId: 'work-1',
      code: 'M-1',
      name: 'Шуруп',
      unit: 'шт',
      qty: 10,
      price: 5,
      sum: 50,
      expense: 0.1,
      order: 3,
    },
  ];
}

describe('estimate cards table selectors', () => {
  it('creates synthetic default section for works before first section', () => {
    const nodes = buildSectionNodes(makeRows());

    expect(nodes[0]?.section.id).toBe(DEFAULT_SECTION_ID);
    expect(nodes[0]?.works[0]?.work.id).toBe('work-before-section');
  });

  it('filters by material match while preserving hierarchy', () => {
    const nodes = buildSectionNodes(makeRows());
    const filtered = filterSectionsByQuery(nodes, 'шуруп');

    expect(filtered).toHaveLength(1);
    expect(filtered[0]?.works).toHaveLength(1);
    expect(filtered[0]?.works[0]?.materials).toHaveLength(1);
    expect(filtered[0]?.works[0]?.materials[0]?.id).toBe('material-1');
  });
});
