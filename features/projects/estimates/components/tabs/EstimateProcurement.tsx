'use client';

import { use } from 'react';
import type { EstimateProcurementRow } from '@/shared/types/estimate-procurement';
import { EstimateProcurementTable } from '../procurement/EstimateProcurementTable.client';

interface EstimateProcurementProps {
    dataPromise: Promise<EstimateProcurementRow[]>;
}

export function EstimateProcurement({ dataPromise }: EstimateProcurementProps) {
    const data = use(dataPromise);

    if (data.length === 0) {
        return (
            <div className="rounded-[9.6px] border bg-white p-8 text-center shadow-sm">
                <p className="text-sm text-muted-foreground">В смете и закупках нет материалов для отображения.</p>
            </div>
        );
    }

    return <EstimateProcurementTable data={data} />;
}
