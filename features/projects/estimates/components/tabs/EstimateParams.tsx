'use client';

import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useAppToast } from '@/components/providers/use-app-toast';
import { Plus, Save } from 'lucide-react';
import { RoomsParamsTable } from '../params/RoomsParamsTable';
import { RoomsParamsTotals } from '../params/RoomsParamsTotals';
import { EstimateRoomParam } from '../../types/room-params.dto';
import { useRoomsParamsTable } from '../../hooks/useRoomsParamsTable';
import { roomParamsActionsRepo } from '../../repository/room-params.actions';
import { RoomParamSaveInput } from '../../schemas/room-params.schema';
import { toSafeNumber } from '../../lib/room-params-calculations';

const toPayload = (rows: ReturnType<typeof useRoomsParamsTable>['rows']): RoomParamSaveInput[] => rows.map((row, index) => ({
    id: row.id,
    order: index,
    name: row.name.trim() || `Помещение ${index + 1}`,
    perimeter: toSafeNumber(row.perimeter),
    height: toSafeNumber(row.height),
    floorArea: toSafeNumber(row.floorArea),
    ceilingArea: toSafeNumber(row.ceilingArea),
    ceilingSlopes: toSafeNumber(row.ceilingSlopes),
    doorsCount: toSafeNumber(row.doorsCount),
    wallSegments: toSafeNumber(row.wallSegments),
    windows: [
        { height: toSafeNumber(row.windows[0].height), width: toSafeNumber(row.windows[0].width) },
        { height: toSafeNumber(row.windows[1].height), width: toSafeNumber(row.windows[1].width) },
        { height: toSafeNumber(row.windows[2].height), width: toSafeNumber(row.windows[2].width) },
    ],
    portals: [
        { height: toSafeNumber(row.portals[0].height), width: toSafeNumber(row.portals[0].width) },
        { height: toSafeNumber(row.portals[1].height), width: toSafeNumber(row.portals[1].width) },
        { height: toSafeNumber(row.portals[2].height), width: toSafeNumber(row.portals[2].width) },
    ],
}));

export function EstimateParams({ estimateId, initialRows }: { estimateId: string; initialRows: EstimateRoomParam[] }) {
    const [isSaving, setIsSaving] = useState(false);
    const { toast } = useAppToast();
    const { rows, totals, addRoom, removeRoom, updateCell, updateOpening } = useRoomsParamsTable(initialRows);

    const hasRows = useMemo(() => rows.length > 0, [rows.length]);

    const onSave = async () => {
        setIsSaving(true);
        try {
            const payload = toPayload(rows);
            const result = await roomParamsActionsRepo.save(estimateId, payload);
            toast({ title: 'Параметры сохранены', description: `Сохранено помещений: ${result.count}` });
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Не удалось сохранить параметры помещений';
            toast({ variant: 'destructive', title: 'Ошибка сохранения', description: message });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-end gap-1.5 md:gap-2">
                <Button variant="default" size="xs" className="h-7 gap-1.5 px-3" onClick={addRoom} aria-label="Добавить помещение">
                    <Plus className="h-4 w-4" />
                    <span className="hidden sm:inline">Добавить помещение</span>
                </Button>
                <Button variant="default" size="xs" className="h-7 gap-1.5 px-3" onClick={onSave} disabled={isSaving || !hasRows} aria-label="Сохранить параметры">
                    <Save className="h-4 w-4" />
                    <span className="hidden sm:inline">{isSaving ? 'Сохранение...' : 'Сохранить'}</span>
                </Button>
            </div>

            <RoomsParamsTable
                rows={rows}
                onChangeCell={updateCell}
                onChangeOpening={updateOpening}
                onRemove={removeRoom}
            />

            <RoomsParamsTotals rows={rows} grandTotals={totals} />
        </div>
    );
}
