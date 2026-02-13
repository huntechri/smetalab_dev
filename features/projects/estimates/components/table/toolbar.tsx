'use client';

import { Button } from '@/components/ui/button';

export function EstimateTableToolbar({ onAddWork }: { onAddWork: () => Promise<void> }) {
    return (
        <div className="flex justify-end">
            <Button onClick={() => void onAddWork()}>Добавить работу</Button>
        </div>
    );
}
