import { describe, expect, it } from 'vitest'

import { getProjectStatusLabel } from '@/entities/project/model/status'

describe('entities/project/model/status', () => {
  it('returns localized labels for all project statuses', () => {
    expect(getProjectStatusLabel('planned')).toBe('Подготовка')
    expect(getProjectStatusLabel('active')).toBe('В процессе')
    expect(getProjectStatusLabel('paused')).toBe('Пауза')
    expect(getProjectStatusLabel('completed')).toBe('Выполнено')
  })
})
