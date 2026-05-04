import { Button } from '@/shared/ui/button';
import { CardShell } from '@/shared/ui/card-shell';
import { Input } from '@/shared/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/shared/ui/table';
import { Trash2 } from 'lucide-react';
import { EstimateRoomParamDraft } from '../../types/room-params.dto';
import { calcSlopes, calcWallsArea, format2 } from '../../lib/room-params-calculations';
import { primitiveCompactTableCellClassName } from '@/shared/ui/primitive-table';

const headers = [
    '№', 'Помещение (Наименование)', 'Периметр (м)', 'Высота (м)', 'S пола (м²)', 'S стен (м²)', 'Откосы (м)',
    'S потолка (м²)', 'Откосы пот. (м)', 'Двери (шт)', 'Простенки (м)',
    'Окно 1 (В×Ш)', 'Окно 2 (В×Ш)', 'Окно 3 (В×Ш)', 'Портал 1 (В×Ш)', 'Портал 2 (В×Ш)', 'Портал 3 (В×Ш)', 'Действия',
];

import { primitiveSurfaceBorderClassNames } from '@/shared/ui/primitive-surface';

type RoomParamNumberInputProps = {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
};

function RoomParamNumberInput({ value, onChange, placeholder }: RoomParamNumberInputProps) {
    return (
        <Input
            type="number"
            inputMode="decimal"
            size="sm"
            value={value}
            onChange={(event) => onChange(event.target.value)}
            placeholder={placeholder}
        />
    );
}

function OpeningInput({
    height,
    width,
    onHeight,
    onWidth,
}: {
    height: string;
    width: string;
    onHeight: (value: string) => void;
    onWidth: (value: string) => void;
}) {
    return (
        <div className="flex items-center gap-1 min-w-36">
            <RoomParamNumberInput value={height} onChange={onHeight} placeholder="В" />
            <span className="text-muted-foreground">×</span>
            <RoomParamNumberInput value={width} onChange={onWidth} placeholder="Ш" />
        </div>
    );
}

function NumericCell({ value, onChange }: RoomParamNumberInputProps) {
    return (
        <div className="w-24">
            <RoomParamNumberInput value={value} onChange={onChange} />
        </div>
    );
}

function CalculatedValueCell({ value }: { value: string }) {
    return <div className={`h-8 w-24 ${primitiveSurfaceBorderClassNames.hairline} px-2 flex items-center`}>{value}</div>;
}

export function RoomsParamsTable({
    rows,
    onChangeCell,
    onChangeOpening,
    onRemove,
}: {
    rows: EstimateRoomParamDraft[];
    onChangeCell: (rowId: string, field: keyof Omit<EstimateRoomParamDraft, 'id' | 'windows' | 'portals'>, value: string) => void;
    onChangeOpening: (rowId: string, type: 'windows' | 'portals', index: number, field: 'height' | 'width', value: string) => void;
    onRemove: (rowId: string) => void;
}) {
    return (
        <CardShell variant="card" className="rounded-md shadow-none overflow-visible gap-0">
            <Table className={primitiveCompactTableCellClassName}>
                <TableHeader>
                    <TableRow>
                        {headers.map((header) => <TableHead key={header} className="whitespace-nowrap py-2">{header}</TableHead>)}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {rows.map((row, rowIndex) => (
                        <TableRow key={row.id}>
                            <TableCell>{rowIndex + 1}</TableCell>
                            <TableCell><div className="min-w-44"><Input value={row.name} size="sm" onChange={(event) => onChangeCell(row.id, 'name', event.target.value)} /></div></TableCell>
                            <TableCell><NumericCell value={row.perimeter} onChange={(value) => onChangeCell(row.id, 'perimeter', value)} /></TableCell>
                            <TableCell><NumericCell value={row.height} onChange={(value) => onChangeCell(row.id, 'height', value)} /></TableCell>
                            <TableCell><NumericCell value={row.floorArea} onChange={(value) => onChangeCell(row.id, 'floorArea', value)} /></TableCell>
                            <TableCell><CalculatedValueCell value={format2(calcWallsArea(row))} /></TableCell>
                            <TableCell><CalculatedValueCell value={format2(calcSlopes(row))} /></TableCell>
                            <TableCell><NumericCell value={row.ceilingArea} onChange={(value) => onChangeCell(row.id, 'ceilingArea', value)} /></TableCell>
                            <TableCell><NumericCell value={row.ceilingSlopes} onChange={(value) => onChangeCell(row.id, 'ceilingSlopes', value)} /></TableCell>
                            <TableCell><NumericCell value={row.doorsCount} onChange={(value) => onChangeCell(row.id, 'doorsCount', value)} /></TableCell>
                            <TableCell><NumericCell value={row.wallSegments} onChange={(value) => onChangeCell(row.id, 'wallSegments', value)} /></TableCell>
                            {row.windows.map((opening, index) => (
                                <TableCell key={`w-${row.id}-${index}`}>
                                    <OpeningInput
                                        height={opening.height}
                                        width={opening.width}
                                        onHeight={(value) => onChangeOpening(row.id, 'windows', index, 'height', value)}
                                        onWidth={(value) => onChangeOpening(row.id, 'windows', index, 'width', value)}
                                   />
                                </TableCell>
                            ))}
                            {row.portals.map((portal, index) => (
                                <TableCell key={`p-${row.id}-${index}`}>
                                    <OpeningInput
                                        height={portal.height}
                                        width={portal.width}
                                        onHeight={(value) => onChangeOpening(row.id, 'portals', index, 'height', value)}
                                        onWidth={(value) => onChangeOpening(row.id, 'portals', index, 'width', value)}
                                   />
                                </TableCell>
                            ))}
                            <TableCell>
                                <Button size="icon-sm" variant="destructive" onClick={() => onRemove(row.id)} aria-label="Удалить помещение">
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </CardShell>
    );
}
