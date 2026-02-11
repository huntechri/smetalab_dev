import { ProjectsScreen } from '@/features/projects';
import { ProjectListItem } from '@/features/projects/types';

const PROJECTS: ProjectListItem[] = [
    {
        id: 'north-park',
        name: 'ЖК «Северный парк»',
        customerName: 'ООО СеверСтрой',
        contractAmount: 84_300_000,
        startDate: '2025-01-10T00:00:00.000Z',
        endDate: '2025-06-18T00:00:00.000Z',
        progress: 62,
        status: 'active',
    },
    {
        id: 'west-beton',
        name: 'Промзона «Запад»',
        customerName: 'АО ИнфраПром',
        contractAmount: 126_500_000,
        startDate: '2024-09-01T00:00:00.000Z',
        endDate: '2025-03-04T00:00:00.000Z',
        progress: 81,
        status: 'completed',
    },
    {
        id: 'lesnoy',
        name: 'Коттеджный посёлок «Лесной»',
        customerName: 'ООО Лесной Девелопмент',
        contractAmount: 52_100_000,
        startDate: '2025-02-15T00:00:00.000Z',
        endDate: '2025-08-28T00:00:00.000Z',
        progress: 38,
        status: 'planned',
    },
    {
        id: 'river-port',
        name: 'Логистический хаб «Речной»',
        customerName: 'ЗАО Логистик Транс',
        contractAmount: 210_800_000,
        startDate: '2024-05-10T00:00:00.000Z',
        endDate: '2025-04-10T00:00:00.000Z',
        progress: 74,
        status: 'active',
    },
    {
        id: 'city-tech',
        name: 'Технопарк «Сити»',
        customerName: 'ООО СитиИнвест',
        contractAmount: 189_000_000,
        startDate: '2025-03-02T00:00:00.000Z',
        endDate: '2025-12-15T00:00:00.000Z',
        progress: 21,
        status: 'planned',
    },
];

export default function Page() {
    return (
        <div className="mx-auto w-full max-w-[1600px] space-y-6">
            <header className="space-y-2">
                <h1 className="text-3xl font-semibold">Проекты</h1>
                <p className="text-sm text-muted-foreground">Компактный список проектов с быстрым поиском и сортировкой.</p>
            </header>
            <ProjectsScreen initialProjects={PROJECTS} />
        </div>
    );
}
