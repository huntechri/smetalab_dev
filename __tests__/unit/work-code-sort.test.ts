import { describe, expect, it } from 'vitest';

import { buildWorkCodeSortKey } from '@/lib/domain/works/code-sort';

describe('buildWorkCodeSortKey', () => {
  it('builds fixed-width natural sort key for dotted numeric codes', () => {
    expect(buildWorkCodeSortKey('1.2.10')).toBe('0000000001.0000000002.0000000010');
  });

  it('returns fallback key for non-numeric codes', () => {
    expect(buildWorkCodeSortKey('W-100')).toBe('~');
  });
});
