'use client';

import { Badge } from '@/shared/ui/badge';
import { StatusBadge } from '@/shared/ui/status-badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui/tooltip';
import { useUserContext } from '@/components/providers/permissions-provider';

export function ActiveTeamIndicator() {
  const { team, loading } = useUserContext();

  if (loading) {
    return (
      <Badge variant="secondary" size="xs" className="animate-pulse">
        Команда загружается
      </Badge>
    );
  }

  if (!team) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <StatusBadge tone="danger">
            Команда не выбрана
          </StatusBadge>
        </TooltipTrigger>
        <TooltipContent>
          <p>У вас нет активной команды или доступ был отозван.</p>
        </TooltipContent>
      </Tooltip>
    );
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <StatusBadge tone="paused" className="max-w-[70px] truncate sm:max-w-none">
          {team.name}
        </StatusBadge>
      </TooltipTrigger>
      <TooltipContent>
        <p>Контекст данных ограничен выбранным тенантом.</p>
      </TooltipContent>
    </Tooltip>
  );
}
