export type ProjectStatus = 'active' | 'completed' | 'planned' | 'paused'

export function getProjectStatusLabel(status: ProjectStatus): string {
  if (status === 'completed') {
    return 'Выполнено'
  }

  if (status === 'active') {
    return 'В процессе'
  }

  if (status === 'paused') {
    return 'Пауза'
  }

  return 'Подготовка'
}
