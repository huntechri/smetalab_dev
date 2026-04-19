import { Button } from '@/shared/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/shared/ui/tooltip';
import { Edit3, Eye, XCircle } from 'lucide-react';

interface PermissionLevelControlProps {
  currentLevel: string;
  isUpdating: boolean;
  permissionName: string;
  roleLabel: string;
  onSetLevel: (level: 'none' | 'read' | 'manage') => void;
}

export function PermissionLevelControl({
  currentLevel,
  isUpdating,
  permissionName,
  roleLabel,
  onSetLevel,
}: PermissionLevelControlProps) {
  return (
    <div className="flex gap-1 rounded-xl bg-zinc-100 p-1">
      <TooltipProvider delayDuration={200}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              onClick={() => onSetLevel('none')}
              disabled={isUpdating}
              aria-label={`Отключить ${permissionName} для роли ${roleLabel}`}
            >
              <XCircle className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent className="text-xs">Отключить (скрыть)</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              onClick={() => onSetLevel('read')}
              disabled={isUpdating}
              aria-label={`Включить чтение ${permissionName} для роли ${roleLabel}`}
            >
              <Eye className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent className="text-xs">Чтение (только просмотр)</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              onClick={() => onSetLevel('manage')}
              disabled={isUpdating}
              aria-label={`Включить полный доступ ${permissionName} для роли ${roleLabel}`}
            >
              <Edit3 className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent className="text-xs">Полный доступ (ред.)</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}
