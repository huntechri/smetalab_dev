'use client';

import { Badge, Button } from '@repo/ui';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@repo/ui';
import { estimateStatusOrder, getEstimateStatusLabel } from '@/entities/estimate/model/status';
import { cn } from '@/lib/utils';
import type { EstimateStatus } from '../../types/dto';

const statusVariantByStatus: Record<EstimateStatus, 'success' | 'info' | 'warning'> = {
  approved: 'success',
  in_progress: 'info',
  draft: 'warning',
};

const statusDotClassByStatus: Record<EstimateStatus, string> = {
  approved: 'bg-emerald-500',
  in_progress: 'bg-blue-500',
  draft: 'bg-brand',
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
          <Badge
            variant={statusVariantByStatus[status]}
            size={badgeSize}
            className={cn('min-w-[88px] cursor-pointer md:min-w-[100px]', className)}
          >
            {getEstimateStatusLabel(status)}
          </Badge>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[150px] p-1">
        {estimateStatusOrder.map((item) => (
          <DropdownMenuItem
            key={item}
            onClick={() => void onChange(item)}
            className="mb-0.5 h-8 cursor-pointer rounded-md"
          >
            <div className="flex w-full items-center gap-2">
              <div className={`size-2 rounded-full ${statusDotClassByStatus[item]}`} />
              <span className="text-xs font-medium md:text-sm">
                {getEstimateStatusLabel(item)}
              </span>
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
