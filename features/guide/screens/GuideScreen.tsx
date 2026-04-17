import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/components/ui/button';

const guideLinks = [
    { href: '/app/guide/works', title: 'Работы', description: 'Справочник работ и базовые нормы.' },
    { href: '/app/guide/materials', title: 'Материалы', description: 'Материалы, единицы и цены.' },
    { href: '/app/guide/counterparties', title: 'Контрагенты', description: 'Заказчики и подрядчики.' },
    { href: '/app/guide/material-suppliers', title: 'Поставщики', description: 'Поставщики и контактные данные.' },
] as const;

export function GuideScreen() {
    return (
        <div className="space-y-4">
            <h1 className="sr-only">Справочники</h1>

            <div className="grid gap-3 md:grid-cols-2">
                {guideLinks.map((item) => (
                    <Card key={item.href} className="border-border/70">
                        <CardHeader className="space-y-1">
                            <CardTitle className="text-base">{item.title}</CardTitle>
                            <CardDescription>{item.description}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button asChild variant="outline" className="h-9 text-xs md:text-sm font-semibold tracking-tight shadow-sm transition-all active:scale-95">
                                <Link href={item.href}>Открыть</Link>
                            </Button>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
