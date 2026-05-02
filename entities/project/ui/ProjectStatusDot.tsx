'use client'

import { StatusIndicator, type StatusIndicatorPulse, type StatusTone } from '@/shared/ui/status-badge'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui/tooltip'

import { getProjectStatusLabel, type ProjectStatus } from '@/entities/project/model/status'

type ProjectStatusDotProps = {
  status: ProjectStatus
}

const STATUS_INDICATOR: Record<ProjectStatus, { tone: StatusTone; pulse: StatusIndicatorPulse }> = {
  active: {
    tone: 'info',
    pulse: 'ping',
  },
  completed: {
    tone: 'success',
    pulse: 'soft',
  },
  planned: {
    tone: 'brand',
    pulse: 'pulse',
  },
  paused: {
    tone: 'neutral',
    pulse: 'soft',
  },
}

export function ProjectStatusDot({ status }: ProjectStatusDotProps) {
  const indicator = STATUS_INDICATOR[status]

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <StatusIndicator
          tone={indicator.tone}
          pulse={indicator.pulse}
          aria-label={`Статус проекта: ${getProjectStatusLabel(status)}`}
        />
      </TooltipTrigger>
      <TooltipContent>
        <p>{getProjectStatusLabel(status)}</p>
      </TooltipContent>
    </Tooltip>
  )
}
