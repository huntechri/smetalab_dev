import { describe, expect, it } from 'vitest'

import { estimateStatusOrder, getEstimateStatusLabel } from '@/entities/estimate/model/status'

describe('entities/estimate/model/status', () => {
  it('returns localized labels for estimate statuses', () => {
    expect(getEstimateStatusLabel('draft')).toBe('Подготовка')
    expect(getEstimateStatusLabel('in_progress')).toBe('В процессе')
    expect(getEstimateStatusLabel('approved')).toBe('Выполнено')
  })

  it('exposes stable status ordering for selectors', () => {
    expect(estimateStatusOrder).toEqual(['draft', 'in_progress', 'approved'])
  })
})
