import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EstimateMeta } from '../types/dto';
import { EstimatesListTable } from '../components/registry/EstimatesListTable';

export function EstimatesRegistryScreen({ estimates }: { estimates: EstimateMeta[] }) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Сметы проекта</CardTitle>
            </CardHeader>
            <CardContent>
                <EstimatesListTable estimates={estimates} />
            </CardContent>
        </Card>
    );
}
