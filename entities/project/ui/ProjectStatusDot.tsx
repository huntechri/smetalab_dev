'use client'

import { cn } from '@/lib/utils'
import { Tooltip, TooltipContent, TooltipTrigger } from '@repo/ui'

import { getProjectStatusLabel, type ProjectStatus } from '@/entities/project/model/status'

type ProjectStatusDotProps = {
  status: ProjectStatus
}

const STATUS_STYLES: Record<ProjectStatus, { dot: string; pulse: string }> = {
  active: {
    dot: 'bg-blue-500',
    pulse: 'animate-ping bg-blue-500/60',
  },
  completed: {
    dot: 'bg-emerald-500',
    pulse: 'bg-emerald-500/40',
  },
  planned: {
    dot: 'bg-brand',
    pulse: 'animate-pulse bg-brand/50',
  },
  paused: {
    dot: 'bg-muted-foreground',
    pulse: 'bg-muted-foreground/40',
  },
}

export function ProjectStatusDot({ status }: ProjectStatusDotProps) {
  const style = STATUS_STYLES[status]

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span
          className="relative inline-flex size-2.5"
          aria-label={`Статус проекта: ${getProjectStatusLabel(status)}`}
        >
          <span className={cn('absolute inline-flex h-full w-full rounded-full', style.pulse)} />
          <span className={cn('relative inline-flex size-2.5 rounded-full', style.dot)} />
        </span>
      </TooltipTrigger>
      <TooltipContent>
        <p>{getProjectStatusLabel(status)}</p>
      </TooltipContent>
    </Tooltip>
  )
}
