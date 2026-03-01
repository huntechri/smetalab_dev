export type EstimateStatus = 'draft' | 'in_progress' | 'approved'

export const estimateStatusOrder: EstimateStatus[] = ['draft', 'in_progress', 'approved']

export function getEstimateStatusLabel(status: EstimateStatus): string {
  if (status === 'approved') {
    return 'Выполнено'
  }

  if (status === 'in_progress') {
    return 'В процессе'
  }

  return 'Подготовка'
}
