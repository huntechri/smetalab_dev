'use client';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu';
import { StatusBadge, StatusIndicator, type StatusTone } from '@/shared/ui/status-badge';
import { primitiveVisualTypographyClassNames } from '@/shared/ui/primitive-surface';
import { estimateStatusOrder, getEstimateStatusLabel } from '@/entities/estimate/model/status';
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
        <StatusBadge
          tone={statusToneByStatus[status]}
          size={badgeSize}
          className={className}
        >
          {getEstimateStatusLabel(status)}
        </StatusBadge>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {estimateStatusOrder.map((item) => (
          <DropdownMenuItem
            key={item}
            onClick={() => void onChange(item)}
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
