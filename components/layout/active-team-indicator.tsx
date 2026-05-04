'use client';

import { Badge } from '@/shared/ui/badge';
import { StatusBadge } from '@/shared/ui/status-badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui/tooltip';
import { useUserContext } from '@/components/providers/permissions-provider';
import { primitiveActiveTeamIndicatorClassName } from '@/shared/ui/primitive-navigation';

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
        <StatusBadge tone="paused" className={primitiveActiveTeamIndicatorClassName}>
          {team.name}
        </StatusBadge>
      </TooltipTrigger>
      <TooltipContent>
        <p>Контекст данных ограничен выбранным тенантом.</p>
      </TooltipContent>
    </Tooltip>
  );
}
