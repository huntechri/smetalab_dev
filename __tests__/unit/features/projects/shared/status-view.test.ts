import { describe, expect, it } from 'vitest'

import { getProjectStatusLabel } from '@/features/projects/shared/utils/status-view'

describe('features/projects/shared/utils/status-view', () => {
  it('re-exports project status label resolver from project entity', () => {
    expect(getProjectStatusLabel('planned')).toBe('Подготовка')
    expect(getProjectStatusLabel('active')).toBe('В процессе')
    expect(getProjectStatusLabel('paused')).toBe('Пауза')
    expect(getProjectStatusLabel('completed')).toBe('Выполнено')
  })
})
