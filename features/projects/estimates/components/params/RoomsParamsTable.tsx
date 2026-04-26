import { Button } from '@/shared/ui/button';
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

const headers = [
    '№', 'Помещение (Наименование)', 'Периметр (м)', 'Высота (м)', 'S пола (м²)', 'S стен (м²)', 'Откосы (м)',
    'S потолка (м²)', 'Откосы пот. (м)', 'Двери (шт)', 'Простенки (м)',
    'Окно 1 (В×Ш)', 'Окно 2 (В×Ш)', 'Окно 3 (В×Ш)', 'Портал 1 (В×Ш)', 'Портал 2 (В×Ш)', 'Портал 3 (В×Ш)', 'Действия',
];

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
        <div className="flex items-center gap-1 min-w-[150px]">
            <Input  type="number" inputMode="decimal" value={height} onChange={(event) => onHeight(event.target.value)} placeholder="В" />
            <span className="text-muted-foreground">×</span>
            <Input  type="number" inputMode="decimal" value={width} onChange={(event) => onWidth(event.target.value)} placeholder="Ш" />
        </div>
    );
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
        <div className="w-full overflow-x-auto rounded-md border">
            <Table className="text-[9px] sm:text-[11px]">
                <TableHeader>
                    <TableRow>
                        {headers.map((header) => <TableHead key={header} className="whitespace-nowrap py-2">{header}</TableHead>)}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {rows.map((row, rowIndex) => (
                        <TableRow key={row.id}>
                            <TableCell>{rowIndex + 1}</TableCell>
                            <TableCell><div className="min-w-[180px]"><Input value={row.name} onChange={(event) => onChangeCell(row.id, 'name', event.target.value)} /></div></TableCell>
                            <TableCell><div className="w-24"><Input type="number" value={row.perimeter} onChange={(event) => onChangeCell(row.id, 'perimeter', event.target.value)} /></div></TableCell>
                            <TableCell><div className="w-24"><Input type="number" value={row.height} onChange={(event) => onChangeCell(row.id, 'height', event.target.value)} /></div></TableCell>
                            <TableCell><div className="w-24"><Input type="number" value={row.floorArea} onChange={(event) => onChangeCell(row.id, 'floorArea', event.target.value)} /></div></TableCell>
                            <TableCell><div className="h-8 w-24 rounded border bg-muted/30 px-2 flex items-center">{format2(calcWallsArea(row))}</div></TableCell>
                            <TableCell><div className="h-8 w-24 rounded border bg-muted/30 px-2 flex items-center">{format2(calcSlopes(row))}</div></TableCell>
                            <TableCell><div className="w-24"><Input type="number" value={row.ceilingArea} onChange={(event) => onChangeCell(row.id, 'ceilingArea', event.target.value)} /></div></TableCell>
                            <TableCell><div className="w-24"><Input type="number" value={row.ceilingSlopes} onChange={(event) => onChangeCell(row.id, 'ceilingSlopes', event.target.value)} /></div></TableCell>
                            <TableCell><div className="w-24"><Input type="number" value={row.doorsCount} onChange={(event) => onChangeCell(row.id, 'doorsCount', event.target.value)} /></div></TableCell>
                            <TableCell><div className="w-24"><Input type="number" value={row.wallSegments} onChange={(event) => onChangeCell(row.id, 'wallSegments', event.target.value)} /></div></TableCell>
                            {row.windows.map((window, index) => (
                                <TableCell key={`w-${row.id}-${index}`}>
                                    <OpeningInput
                                        height={window.height}
                                        width={window.width}
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
        </div>
    );
}
