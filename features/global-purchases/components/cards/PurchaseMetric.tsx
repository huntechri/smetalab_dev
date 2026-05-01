import type React from 'react';
import { DenseListLabeledMetric } from '@/shared/ui/dense-list';

type PurchaseMetricProps = {
  label: string;
  value: React.ReactNode;
  tone?: 'neutral' | 'info' | 'success';
};

export function PurchaseMetric({ label, value, tone = 'neutral' }: PurchaseMetricProps) {
  return <DenseListLabeledMetric label={label} value={value} tone={tone} density="material" />;
}
