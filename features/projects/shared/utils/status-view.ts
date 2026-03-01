import { EstimateStatus } from '../../estimates/types/dto';

export function getEstimateStatusLabel(status: EstimateStatus): string {
  if (status === 'approved') {
    return 'Выполнено';
  }

  if (status === 'in_progress') {
    return 'В процессе';
  }

  return 'Подготовка';
}

