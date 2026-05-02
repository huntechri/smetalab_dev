import { StatusBadge, type StatusTone } from '@/shared/ui/status-badge'

import { getProjectStatusLabel, type ProjectStatus } from '@/entities/project/model/status'

const projectStatusTone: Record<ProjectStatus, StatusTone> = {
  active: 'info',
  completed: 'success',
  planned: 'brand',
  paused: 'neutral',
}

type ProjectStatusBadgeProps = {
  status: ProjectStatus
}

export function ProjectStatusBadge({ status }: ProjectStatusBadgeProps) {
  return (
    <StatusBadge tone={projectStatusTone[status]}>
      {getProjectStatusLabel(status)}
    </StatusBadge>
  )
}
