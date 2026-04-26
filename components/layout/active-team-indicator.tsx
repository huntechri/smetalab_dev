'use client';

import { Badge } from '@/shared/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui/tooltip';
import { useUserContext } from '@/components/providers/permissions-provider';

export function ActiveTeamIndicator() {
  const { team, loading } = useUserContext();

  if (loading) {
    return (
      <Badge variant="secondary" className="text-xs animate-pulse">
        Команда загружается
      </Badge>
    );
  }

  if (!team) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge variant="destructive" className="text-xs font-semibold">
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
        <Badge variant="secondary" className="border-none text-[10px] sm:text-xs font-semibold bg-indigo-50 text-indigo-700 hover:bg-indigo-100/50 transition-colors max-w-[70px] sm:max-w-none truncate shrink-0">
          {team.name}
        </Badge>
      </TooltipTrigger>
      <TooltipContent>
        <p>Контекст данных ограничен выбранным тенантом.</p>
      </TooltipContent>
    </Tooltip>
  );
}
