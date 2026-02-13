import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DashboardDataTable } from '../../dashboard/components/DashboardDataTable';
import { EstimateMeta } from '../types/dto';

export function EstimatesRegistryScreen({ estimates: _estimates }: { estimates: EstimateMeta[] }) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Сметы проекта</CardTitle>
            </CardHeader>
            <CardContent>
                <DashboardDataTable addButtonLabel="Создать смету" />
            </CardContent>
        </Card>
    );
}
