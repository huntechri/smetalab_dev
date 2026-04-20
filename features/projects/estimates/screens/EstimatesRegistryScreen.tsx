import { Card, CardContent, CardHeader, CardTitle } from '@repo/ui';
import { EstimatesListTable } from '../components/registry/EstimatesListTable';
import { EstimateMeta } from '../types/dto';

export function EstimatesRegistryScreen({
    estimates,
    projectSlug
}: {
    estimates: EstimateMeta[],
    projectSlug?: string
}) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Сметы проекта</CardTitle>
            </CardHeader>
            <CardContent>
                <EstimatesListTable estimates={estimates} projectSlug={projectSlug} />
            </CardContent>
        </Card>
    );
}
