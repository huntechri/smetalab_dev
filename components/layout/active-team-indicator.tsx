'use client';

import { Badge } from '@/shared/ui/badge';
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
          <Badge variant="danger" size="xs">
            Команда не выбрана
          </Badge>
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
        <Badge variant="paused" size="xs" className={primitiveActiveTeamIndicatorClassName}>
          {team.name}
        </Badge>
      </TooltipTrigger>
      <TooltipContent>
        <p>Контекст данных ограничен выбранным тенантом.</p>
      </TooltipContent>
    </Tooltip>
  );
}
