import { Surface } from '@/shared/ui/surface';
import { EstimateRoomParamDraft } from '../../types/room-params.dto';
import { calcSlopes, calcWallsArea, format2, toSafeNumber } from '../../lib/room-params-calculations';
import { primitiveCompactTableCellClassName } from '@/shared/ui/primitive-table';
import { primitiveVisualTypographyClassNames, primitiveCardShellInsetDensityClassNames } from '@/shared/ui/primitive-surface';

type Totals = {
    floorArea: number;
    wallsArea: number;
    slopes: number;
    ceilingArea: number;
    ceilingSlopes: number;
    doors: number;
};

function TotalLine({ label, totals, isGrandTotal = false }: { label: string; totals: Totals; isGrandTotal?: boolean }) {
    return (
        <div className={`flex flex-row flex-wrap items-center gap-x-4 gap-y-1 ${primitiveCompactTableCellClassName} ${isGrandTotal ? 'mt-2 pt-2 border-t border-border/50 font-bold' : 'py-1 text-muted-foreground'}`}>
            <span className={isGrandTotal ? "text-foreground min-w-20" : "min-w-28"}>{label}</span>
            <div className="flex items-center gap-1">
                <span>Σ S пола:</span>
                <span className="text-foreground">{format2(totals.floorArea)} м²</span>
            </div>
            <div className="flex items-center gap-1">
                <span>Σ S стен:</span>
                <span className="text-foreground">{format2(totals.wallsArea)} м²</span>
            </div>
            <div className="flex items-center gap-1">
                <span>Σ Откосы:</span>
                <span className="text-foreground">{format2(totals.slopes)} м.пог.</span>
            </div>
            <div className="flex items-center gap-1">
                <span>Σ S потолка:</span>
                <span className="text-foreground">{format2(totals.ceilingArea)} м²</span>
            </div>
            <div className="flex items-center gap-1">
                <span>Σ Откосы пот.:</span>
                <span className="text-foreground">{format2(totals.ceilingSlopes)} м.пог.</span>
            </div>
            <div className="flex items-center gap-1">
                <span>Σ Двери:</span>
                <span className="text-foreground">{format2(totals.doors)} шт.</span>
            </div>
        </div>
    );
}

export function RoomsParamsTotals({ rows, grandTotals }: { rows: EstimateRoomParamDraft[]; grandTotals: Totals }) {
    return (
        <div className="mt-4">
            <Surface variant="muted" className={primitiveCardShellInsetDensityClassNames.compact}>
                <div className={`${primitiveVisualTypographyClassNames.estimateSectionLabel} text-muted-foreground mb-2`}>Итого:</div>

                {rows.map((row, index) => {
                    const rowTotals: Totals = {
                        floorArea: toSafeNumber(row.floorArea),
                        wallsArea: calcWallsArea(row),
                        slopes: calcSlopes(row),
                        ceilingArea: toSafeNumber(row.ceilingArea),
                        ceilingSlopes: toSafeNumber(row.ceilingSlopes),
                        doors: toSafeNumber(row.doorsCount),
                    };
                    return (
                        <TotalLine
                            key={row.id}
                            label={row.name.trim() || `Помещение ${index + 1}`}
                            totals={rowTotals}
                        />
                    );
                })}

                <TotalLine
                    label="Всего:"
                    totals={grandTotals}
                    isGrandTotal
                />
        </Surface>
        </div>
    );
}
