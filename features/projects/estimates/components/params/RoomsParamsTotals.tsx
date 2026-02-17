import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { format2 } from '../../lib/room-params-calculations';

type Totals = {
    floorArea: number;
    wallsArea: number;
    slopes: number;
    ceilingArea: number;
    doors: number;
};

export function RoomsParamsTotals({ totals }: { totals: Totals }) {
    return (
        <Card>
            <CardHeader className="pb-2">
                <CardTitle className="text-sm">Итоги</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5 text-sm">
                <div>Σ S пола: <b>{format2(totals.floorArea)}</b></div>
                <div>Σ S стен: <b>{format2(totals.wallsArea)}</b></div>
                <div>Σ Откосы: <b>{format2(totals.slopes)}</b></div>
                <div>Σ S потолка: <b>{format2(totals.ceilingArea)}</b></div>
                <div>Σ Двери: <b>{format2(totals.doors)}</b></div>
            </CardContent>
        </Card>
    );
}
