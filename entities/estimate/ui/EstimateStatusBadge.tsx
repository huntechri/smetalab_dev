import { StatusBadge, type StatusTone } from '@/shared/ui/status-badge'

import { getEstimateStatusLabel, type EstimateStatus } from '@/entities/estimate/model/status'

type EstimateStatusBadgeProps = {
  status: EstimateStatus
}

const statusBadgeTone: Record<EstimateStatus, StatusTone> = {
  draft: 'warning',
  in_progress: 'info',
  approved: 'success',
}

export function EstimateStatusBadge({ status }: EstimateStatusBadgeProps) {
  return (
    <StatusBadge tone={statusBadgeTone[status]}>
      {getEstimateStatusLabel(status)}
    </StatusBadge>
  )
}
