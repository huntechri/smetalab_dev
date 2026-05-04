import { StatusBadge, StatusIndicator, type StatusTone } from '@/shared/ui/status-badge';
import {
    primitiveVisualIconSizeClassNames,
    primitiveVisualTypographyClassNames,
} from '@/shared/ui/primitive-density';
import { Clock } from 'lucide-react';
import type { ReactNode } from 'react';

interface DashboardFocusItemProps {
    label: string;
    meta: string;
    status: string;
    tone: StatusTone;
    icon?: ReactNode;
}

export function DashboardFocusItem({ label, meta, status, tone, icon }: DashboardFocusItemProps) {
    return (
        <div className="group flex cursor-pointer items-center justify-between gap-4 transition-all hover:bg-muted/20">
            <div className="flex items-start gap-3">
                {icon ?? (
                    <StatusIndicator
                        tone="brand"
                        size="sm"
                        pulse="pulse"
                        className="mt-1.5 transition-transform duration-300 group-hover:scale-125"
                    />
                )}
                <div>
                    <p className={primitiveVisualTypographyClassNames.itemTitleInteractive}>{label}</p>
                    <div className="mt-2 flex items-center gap-1.5">
                        <Clock className={primitiveVisualIconSizeClassNames.mutedMeta} />
                        <span className={primitiveVisualTypographyClassNames.mutedMeta}>{meta}</span>
                    </div>
                </div>
            </div>
            <StatusBadge tone={tone}>
                {status}
            </StatusBadge>
        </div>
    );
}
