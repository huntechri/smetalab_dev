import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@repo/ui';
import { Button } from '@repo/ui';

export function ProjectEstimatesSection({ projectSlug }: { projectSlug: string }) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Сметы</CardTitle>
                <CardDescription>Переход к реестру смет проекта и деталям по каждой смете.</CardDescription>
            </CardHeader>
            <CardContent>
                <Button asChild>
                    <Link href={`/app/projects/${projectSlug}/estimates`}>Все сметы</Link>
                </Button>
            </CardContent>
        </Card>
    );
}
