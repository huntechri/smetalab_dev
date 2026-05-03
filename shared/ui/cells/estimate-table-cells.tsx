import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

interface EstimateCodeCellProps {
    code: string;
    kind: 'section' | 'work' | 'material';
    children?: ReactNode;
    className?: string;
}

export function EstimateCodeCell({ code, kind, children, className }: EstimateCodeCellProps) {
    if (kind === 'section') {
        return (
            <div className={cn('pl-1 tabular-nums text-xs font-semibold', className)}>
                {code}
            </div>
        );
    }
    if (kind === 'work') {
        return (
            <div className={cn('flex items-center gap-1', className)}>
                {children}
                <span className="tabular-nums text-xs font-medium">{code}</span>
            </div>
        );
    }
    return (
        <div className={cn('pl-9 tabular-nums text-xs text-muted-foreground/80', className)}>
            {code}
        </div>
    );
}

interface EstimateNameCellWrapperProps {
    kind: 'section' | 'work' | 'material';
    children: ReactNode;
}

export function EstimateNameCellWrapper({ kind, children }: EstimateNameCellWrapperProps) {
    if (kind === 'section') return <>{children}</>;
    return <div className={kind === 'material' ? 'pl-8' : 'pl-3'}>{children}</div>;
}

interface EstimateUnitCellProps {
    unit: string;
    kind: 'section' | 'work' | 'material';
}

export function EstimateUnitCell({ unit, kind }: EstimateUnitCellProps) {
    if (kind === 'section') {
        return (
            <div className="text-center text-xs text-muted-foreground/50">
                {unit}
            </div>
        );
    }
    if (kind === 'material') {
        return (
            <div className="text-xs italic text-muted-foreground text-center">
                {unit}
            </div>
        );
    }
    return (
        <div className="text-center text-xs text-muted-foreground font-medium">
            {unit}
        </div>
    );
}

interface EstimateNumberCellProps {
    children: ReactNode;
    kind: 'section' | 'work' | 'material';
    className?: string;
}

export function EstimateNumberCell({ children, kind, className }: EstimateNumberCellProps) {
    if (kind === 'section') return null;
    return (
        <div className={cn('text-right tabular-nums pr-6 text-xs', kind === 'material' && 'italic text-muted-foreground', className)}>
            {children}
        </div>
    );
}

interface EstimateSectionSumCellProps {
    works: number;
    materials: number;
    className?: string;
}

export function EstimateSectionSumCell({ works, materials, className }: EstimateSectionSumCellProps) {
    return (
        <div className={cn(
            'pr-6 text-right text-[0.6875rem] font-bold tracking-tight tabular-nums opacity-90',
            className,
        )}>
            Р: {works.toLocaleString('ru-RU')} · М: {materials.toLocaleString('ru-RU')}
        </div>
    );
}

interface EstimateSumCellProps {
    children: ReactNode;
    kind: 'section' | 'work' | 'material';
}

export function EstimateSumCell({ children, kind }: EstimateSumCellProps) {
    if (kind === 'section') return null;
    return (
        <div className={cn(
            'text-right tabular-nums pr-6 text-xs',
            kind === 'material' ? 'italic text-muted-foreground' : 'font-medium text-primary/90',
        )}>
            {children}
        </div>
    );
}

interface EstimateExpenseCellProps {
    children: ReactNode;
    kind: 'section' | 'work' | 'material';
}

export function EstimateExpenseCell({ children, kind }: EstimateExpenseCellProps) {
    if (kind === 'work' || kind === 'section') {
        return <div className="text-right tabular-nums pr-6 text-xs" />;
    }
    return (
        <div className="text-right tabular-nums pr-6 text-xs">
            {children}
        </div>
    );
}

export const estimateHeaderAlignClassNames = {
    code: 'pl-1',
    unit: 'text-center',
    qty: 'text-right',
    price: 'text-right',
    sum: 'text-right',
    expense: 'text-right',
    actions: 'text-center',
} as const;
