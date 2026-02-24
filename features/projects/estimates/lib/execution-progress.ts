import { EstimateExecutionRow } from '../types/execution.dto';

export interface EstimateExecutionProgress {
  totalWorks: number;
  completedWorks: number;
  percent: number;
}

export function calculateEstimateExecutionProgress(rows: EstimateExecutionRow[]): EstimateExecutionProgress {
  const estimateWorks = rows.filter((row) => row.source === 'from_estimate');
  const totalWorks = estimateWorks.length;

  if (totalWorks === 0) {
    return {
      totalWorks: 0,
      completedWorks: 0,
      percent: 0,
    };
  }

  const completedWorks = estimateWorks.filter((row) => row.status === 'done').length;

  return {
    totalWorks,
    completedWorks,
    percent: Math.round((completedWorks / totalWorks) * 100),
  };
}
