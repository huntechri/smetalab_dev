import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';

const PROJECTS = [
    {
        id: 'north-park',
        name: 'ЖК «Северный парк»',
        status: 'В работе',
        progress: '62%',
        due: 'До 18 фев',
        owner: 'Алина М.',
        budget: '84.3 млн ₽',
        risk: 'Низкий',
    },
    {
        id: 'west-beton',
        name: 'Промзона «Запад»',
        status: 'Пусконаладка',
        progress: '81%',
        due: 'До 4 мар',
        owner: 'Игорь П.',
        budget: '126.5 млн ₽',
        risk: 'Средний',
    },
    {
        id: 'lesnoy',
        name: 'Коттеджный посёлок «Лесной»',
        status: 'Проектирование',
        progress: '38%',
        due: 'До 28 мар',
        owner: 'Марина С.',
        budget: '52.1 млн ₽',
        risk: 'Средний',
    },
    {
        id: 'river-port',
        name: 'Логистический хаб «Речной»',
        status: 'Контроль качества',
        progress: '74%',
        due: 'До 10 апр',
        owner: 'Денис Л.',
        budget: '210.8 млн ₽',
        risk: 'Высокий',
    },
];

const STATUS_TONE: Record<string, string> = {
    'В работе': 'bg-emerald-700 text-white',
    'Пусконаладка': 'bg-sky-700 text-white',
    'Проектирование': 'bg-amber-700 text-white',
    'Контроль качества': 'bg-rose-700 text-white',
};

const PROGRESS_COLORS: Record<string, string> = {
    'В работе': 'bg-emerald-600',
    'Пусконаладка': 'bg-sky-600',
    'Проектирование': 'bg-amber-600',
    'Контроль качества': 'bg-rose-600',
};

export default function Page() {
    return (
        <div className="space-y-8">
            <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div className="space-y-3">
                    <p className="text-xs uppercase tracking-[0.3em] text-foreground/70">Projects</p>
                    <h1 className="text-3xl font-semibold sm:text-4xl">Проекты</h1>
                    <p className="max-w-2xl text-sm text-foreground/80">
                        Все объекты в работе: статус, бюджет, сроки и риск. Создавайте новые проекты и ведите их в одном контуре.
                    </p>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row">
                    <Button className="bg-[#FF6A3D] text-black hover:bg-[#FF865F]">Создать проект</Button>
                    <Button variant="outline" className="border-border">Импортировать смету</Button>
                </div>
            </header>

            <Separator />

            <section aria-labelledby="projects-toolbar" className="space-y-4">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="space-y-1">
                        <h2 id="projects-toolbar" className="text-lg font-semibold">Портфель</h2>
                        <p className="text-sm text-foreground/70">12 активных объектов, 3 требуют внимания.</p>
                    </div>
                    <div className="flex flex-col gap-3 sm:flex-row">
                        <div className="space-y-1">
                            <Label htmlFor="project-search" className="sr-only">Поиск проекта</Label>
                            <Input
                                id="project-search"
                                name="project-search"
                                placeholder="Поиск по названию"
                                className="w-full sm:w-64"
                            />
                        </div>
                        <Button variant="outline" className="border-border">Фильтр рисков</Button>
                        <Button variant="outline" className="border-border">Сортировка</Button>
                    </div>
                </div>

                <div className="grid gap-3 lg:grid-cols-2 xl:grid-cols-3">
                    {PROJECTS.map((project) => (
                        <Card key={project.id} className="border-border/60">
                            <CardContent className="space-y-3 pt-4">
                                <div className="flex flex-wrap items-start justify-between gap-2">
                                    <div className="space-y-1">
                                        <CardTitle className="text-base font-semibold">
                                            <Link
                                                href={`/app/projects/${project.id}`}
                                                className="transition hover:text-[#FF6A3D] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6A3D]/50"
                                            >
                                                {project.name}
                                            </Link>
                                        </CardTitle>
                                        <p className="text-xs text-foreground/70">
                                            Владелец: {project.owner} · Срок: {project.due}
                                        </p>
                                    </div>
                                    <Badge className={STATUS_TONE[project.status]}>{project.status}</Badge>
                                </div>
                                <div className="grid gap-2 sm:grid-cols-2">
                                    <div className="rounded-xl border border-border/60 bg-muted/40 px-2.5 py-2">
                                        <div className="mb-2 flex items-center justify-between">
                                            <p className="text-[11px] uppercase tracking-[0.25em] text-foreground/70">
                                                Готовность
                                            </p>
                                            <p className="text-xs font-semibold text-foreground">{project.progress}</p>
                                        </div>
                                        <div
                                            role="progressbar"
                                            aria-valuenow={parseInt(project.progress)}
                                            aria-valuemin={0}
                                            aria-valuemax={100}
                                            aria-label="Прогресс проекта"
                                            className="h-1.5 w-full overflow-hidden rounded-full bg-background border border-border/20"
                                        >
                                            <div
                                                className={`h-full rounded-full ${PROGRESS_COLORS[project.status] || 'bg-primary'}`}
                                                style={{ width: project.progress }}
                                            />
                                        </div>
                                    </div>
                                    <div className="rounded-xl border border-border/60 bg-muted/40 px-2.5 py-2">
                                        <p className="text-[11px] uppercase tracking-[0.25em] text-foreground/70">Бюджет</p>
                                        <p className="mt-1 text-sm font-semibold text-foreground">{project.budget}</p>
                                    </div>
                                </div>
                                <div className="flex flex-wrap items-center gap-2">
                                    <Button asChild size="sm" className="bg-[#FF6A3D] text-black hover:bg-[#FF865F]">
                                        <Link href={`/app/projects/${project.id}`}>Открыть проект</Link>
                                    </Button>
                                    <Button asChild size="sm" variant="outline">
                                        <Link href={`/app/projects/${project.id}?view=plan`}>План работ</Link>
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </section>
        </div>
    );
}
