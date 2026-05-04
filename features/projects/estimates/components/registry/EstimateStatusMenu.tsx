'use client';

import { Button } from '@/shared/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu';
import { StatusBadge, StatusIndicator, type StatusTone } from '@/shared/ui/status-badge';
import { primitiveVisualTypographyClassNames } from '@/shared/ui/primitive-surface';
import { estimateStatusOrder, getEstimateStatusLabel } from '@/entities/estimate/model/status';
import { cn } from '@/lib/utils';
import type { EstimateStatus } from '../../types/dto';

const statusToneByStatus: Record<EstimateStatus, StatusTone> = {
  approved: 'success',
  in_progress: 'info',
  draft: 'brand',
};

interface EstimateStatusMenuProps {
  status: EstimateStatus;
  onChange: (next: EstimateStatus) => Promise<void>;
  className?: string;
  badgeSize?: 'default' | 'xs';
}

export function EstimateStatusMenu({
  status,
  onChange,
  className,
  badgeSize = 'xs',
}: EstimateStatusMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button type="button" variant="ghost" size="sm" className="h-auto p-0">
          <StatusBadge
            tone={statusToneByStatus[status]}
            size={badgeSize}
            className={cn('min-w-20 cursor-pointer md:min-w-24', className)}
          >
            {getEstimateStatusLabel(status)}
          </StatusBadge>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-36 p-1">
        {estimateStatusOrder.map((item) => (
          <DropdownMenuItem
            key={item}
            onClick={() => void onChange(item)}
            className="mb-0.5 h-8 cursor-pointer rounded-md"
          >
            <div className="flex w-full items-center gap-2">
              <StatusIndicator tone={statusToneByStatus[item]} size="sm" />
              <span className={primitiveVisualTypographyClassNames.denseItemTitleLink}>
                {getEstimateStatusLabel(item)}
              </span>
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
