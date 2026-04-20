import { Badge } from '@repo/ui'

import { getEstimateStatusLabel, type EstimateStatus } from '@/entities/estimate/model/status'

type EstimateStatusBadgeProps = {
  status: EstimateStatus
}

const statusBadgeVariant: Record<EstimateStatus, "success" | "info" | "warning"> = {
  draft: 'warning',
  in_progress: 'info',
  approved: 'success',
}

export function EstimateStatusBadge({ status }: EstimateStatusBadgeProps) {
  return (
    <Badge variant={statusBadgeVariant[status]} size="xs">
      {getEstimateStatusLabel(status)}
    </Badge>
  )
}
