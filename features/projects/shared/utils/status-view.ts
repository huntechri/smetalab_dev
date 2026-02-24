import { ProjectStatus } from '../types';
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

export function getProjectStatusLabel(status: ProjectStatus): string {
  if (status === 'completed') {
    return 'Выполнено';
  }

  if (status === 'active') {
    return 'В процессе';
  }

  if (status === 'paused') {
    return 'Пауза';
  }

  return 'Подготовка';
}
