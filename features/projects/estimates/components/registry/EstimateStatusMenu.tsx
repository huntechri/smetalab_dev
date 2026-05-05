'use client';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu';
import { Badge } from '@/shared/ui/badge';
import { StatusIndicator } from '@/shared/ui/status-badge';
import { primitiveVisualTypographyClassNames } from '@/shared/ui/primitive-surface';
import { estimateStatusOrder, getEstimateStatusLabel } from '@/entities/estimate/model/status';
import type { EstimateStatus } from '../../types/dto';

const statusVariantByStatus: Record<EstimateStatus, 'success' | 'info' | 'default'> = {
  approved: 'success',
  in_progress: 'info',
  draft: 'default',
};

const statusToneByStatus: Record<EstimateStatus, 'success' | 'info' | 'brand'> = {
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
        <Badge
          variant={statusVariantByStatus[status]}
          size={badgeSize}
          className={className}
        >
          {getEstimateStatusLabel(status)}
        </Badge>
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
