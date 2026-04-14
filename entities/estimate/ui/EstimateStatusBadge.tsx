import { Badge } from '@/shared/ui/badge'

import { getEstimateStatusLabel, type EstimateStatus } from '@/entities/estimate/model/status'

type EstimateStatusBadgeProps = {
  status: EstimateStatus
}

export function EstimateStatusBadge({ status }: EstimateStatusBadgeProps) {
  return <Badge variant="secondary" className="font-medium">{getEstimateStatusLabel(status)}</Badge>
}
