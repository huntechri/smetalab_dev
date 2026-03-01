'use client';

import { Badge } from '@/shared/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui/tooltip';
import { useUserContext } from '@/components/providers/permissions-provider';

export function ActiveTeamIndicator() {
  const { team, loading } = useUserContext();

  if (loading) {
    return (
      <Badge variant="outline" className="text-xs">
        Команда загружается
      </Badge>
    );
  }

  if (!team) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge variant="destructive" className="text-xs">
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
        <Badge variant="outline" className="text-xs">
          {team.name}
        </Badge>
      </TooltipTrigger>
      <TooltipContent>
        <p>Контекст данных ограничен выбранным тенантом.</p>
      </TooltipContent>
    </Tooltip>
  );
}
