import { Badge } from '@repo/ui'

import { getEstimateStatusLabel, type EstimateStatus } from '@/entities/estimate/model/status'

type EstimateStatusBadgeProps = {
  status: EstimateStatus
}

const statusBadgeClassName: Record<EstimateStatus, string> = {
  draft: 'border-none bg-amber-500/15 text-amber-700',
  in_progress: 'border-none bg-blue-500/12 text-blue-700',
  approved: 'border-none bg-emerald-500/12 text-emerald-700',
}

export function EstimateStatusBadge({ status }: EstimateStatusBadgeProps) {
  return <Badge variant="secondary" className={`font-medium ${statusBadgeClassName[status]}`}>{getEstimateStatusLabel(status)}</Badge>
}
