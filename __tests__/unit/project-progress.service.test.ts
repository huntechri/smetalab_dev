import { describe, expect, it } from 'vitest';
import { calculateProjectProgress } from '@/lib/services/project-progress.service';

describe('calculateProjectProgress', () => {
  it('returns 0 when total is 0', () => {
    expect(calculateProjectProgress(0, 0)).toBe(0);
  });

  it('returns rounded percentage', () => {
    expect(calculateProjectProgress(3, 10)).toBe(30);
  });

  it('rounds fractions correctly', () => {
    expect(calculateProjectProgress(2, 3)).toBe(67);
  });
});
