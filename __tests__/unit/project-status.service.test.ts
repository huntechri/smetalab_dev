import { describe, expect, it } from 'vitest';
import { resolveProjectStatusFromCounts, resolveProjectStatusFromEstimateStatuses } from '@/lib/services/project-status.service';

describe('resolveProjectStatusFromEstimateStatuses', () => {
  it('returns planned when no estimates exist', () => {
    expect(resolveProjectStatusFromEstimateStatuses([])).toBe('planned');
  });

  it('returns planned when all estimates are in draft', () => {
    expect(resolveProjectStatusFromEstimateStatuses(['draft', 'draft'])).toBe('planned');
  });

  it('returns active when at least one estimate is in progress', () => {
    expect(resolveProjectStatusFromEstimateStatuses(['draft', 'in_progress'])).toBe('active');
  });

  it('returns active when mix of approved and draft exists', () => {
    expect(resolveProjectStatusFromEstimateStatuses(['approved', 'draft'])).toBe('active');
  });

  it('returns completed when every estimate is approved', () => {
    expect(resolveProjectStatusFromEstimateStatuses(['approved', 'approved'])).toBe('completed');
  });
});

describe('resolveProjectStatusFromCounts', () => {
  it('returns planned when no estimates exist', () => {
    expect(resolveProjectStatusFromCounts(0, 0, 0)).toBe('planned');
  });

  it('returns planned when all estimates are draft', () => {
    expect(resolveProjectStatusFromCounts(3, 0, 0)).toBe('planned');
  });

  it('returns active when there are active estimates', () => {
    expect(resolveProjectStatusFromCounts(3, 1, 2)).toBe('active');
  });

  it('returns completed when all estimates are approved', () => {
    expect(resolveProjectStatusFromCounts(2, 2, 2)).toBe('completed');
  });
});
