
export type ProjectStatus = 'in_progress' | 'planning' | 'paused' | 'completed';
export type ProjectPriority = 'high' | 'medium' | 'low';
export type ProjectCategory = 'Жилое' | 'Коммерческое' | 'Инфраструктура' | 'Социальное';

export interface ProjectPhase {
    name: string;
    status: 'completed' | 'in_progress' | 'pending';
}

export interface Project {
    id: number;
    name: string;
    category: ProjectCategory;
    status: ProjectStatus;
    priority: ProjectPriority;
    progress: number;
    budget: number;
    spent: number;
    startDate: string;
    endDate: string;
    location: string;
    manager: string;
    workers: number;
    tasks: {
        total: number;
        completed: number;
    };
    description: string;
    phases: ProjectPhase[];
    image: string;
}

export const MOCK_PROJECTS: Project[] = [
    {
        id: 1,
        name: 'ЖК «Солнечный»',
        category: 'Жилое',
        status: 'in_progress',
        priority: 'high',
        progress: 68,
        budget: 2500,
        spent: 1700,
        startDate: '01.03.2024',
        endDate: '15.12.2025',
        location: 'г. Москва, ул. Строителей, 15',
        manager: 'Иванов И.И.',
        workers: 245,
        tasks: { total: 120, completed: 82 },
        description: 'Современный жилой комплекс бизнес-класса с подземным паркингом и благоустроенной территорией.',
        image: 'https://images.unsplash.com/photo-1541888946425-d81bb19480c5?q=80&w=800&auto=format&fit=crop',
        phases: [
            { name: 'Подготовка площадки', status: 'completed' },
            { name: 'Фундамент', status: 'completed' },
            { name: 'Возведение каркаса', status: 'in_progress' },
            { name: 'Инженерные сети', status: 'pending' },
            { name: 'Отделочные работы', status: 'pending' },
        ],
    },
    {
        id: 2,
        name: 'БЦ «Горизонт»',
        category: 'Коммерческое',
        status: 'in_progress',
        priority: 'high',
        progress: 45,
        budget: 1800,
        spent: 810,
        startDate: '10.05.2024',
        endDate: '20.08.2025',
        location: 'г. Санкт-Петербург, пр. Невский, 102',
        manager: 'Петров С.В.',
        workers: 180,
        tasks: { total: 85, completed: 38 },
        description: 'Инновационный бизнес-центр с панорамным остеклением и развитой инфраструктурой для бизнеса.',
        image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=800&auto=format&fit=crop',
        phases: [
            { name: 'Проектирование', status: 'completed' },
            { name: 'Фундамент', status: 'completed' },
            { name: 'Каркас и перекрытия', status: 'in_progress' },
            { name: 'Фасадные работы', status: 'pending' },
        ],
    },
    {
        id: 3,
        name: 'Школа №42',
        category: 'Социальное',
        status: 'planning',
        priority: 'medium',
        progress: 12,
        budget: 450,
        spent: 54,
        startDate: '01.09.2024',
        endDate: '25.08.2025',
        location: 'г. Казань, ул. Мира, 4',
        manager: 'Сидоров А.П.',
        workers: 25,
        tasks: { total: 40, completed: 5 },
        description: 'Строительство общеобразовательной школы на 1100 мест с двумя бассейнами и спортивным ядром.',
        image: 'https://images.unsplash.com/photo-1523050853063-bd401b338e5c?q=80&w=800&auto=format&fit=crop',
        phases: [
            { name: 'Тендер и закупки', status: 'completed' },
            { name: 'Выравнивание участка', status: 'in_progress' },
            { name: 'Земляные работы', status: 'pending' },
        ],
    },
    {
        id: 4,
        name: 'ТЦ «Мегаполис»',
        category: 'Коммерческое',
        status: 'paused',
        priority: 'high',
        progress: 34,
        budget: 3200,
        spent: 1088,
        startDate: '15.01.2024',
        endDate: '30.11.2025',
        location: 'г. Екатеринбург, ул. Ленина, 50',
        manager: 'Козлов М.Д.',
        workers: 0,
        tasks: { total: 150, completed: 51 },
        description: 'Крупнейший торгово-развлекательный центр в регионе с ледовой ареной и кинотеатром.',
        image: 'https://images.unsplash.com/photo-1567449303078-57ad995bd301?q=80&w=800&auto=format&fit=crop',
        phases: [
            { name: 'Фундамент', status: 'completed' },
            { name: 'Первый этаж', status: 'completed' },
            { name: 'Вертикальные конструкции', status: 'in_progress' },
        ],
    },
    {
        id: 5,
        name: 'Мост через р. Волга',
        category: 'Инфраструктура',
        status: 'in_progress',
        priority: 'high',
        progress: 78,
        budget: 5600,
        spent: 4368,
        startDate: '20.06.2023',
        endDate: '15.07.2025',
        location: 'г. Самара, Фрунзенский район',
        manager: 'Васильев Е.Н.',
        workers: 420,
        tasks: { total: 320, completed: 250 },
        description: 'Масштабный инфраструктурный проект по строительству автомобильного моста для разгрузки центра города.',
        image: 'https://images.unsplash.com/photo-1449156001931-82992a47d060?q=80&w=800&auto=format&fit=crop',
        phases: [
            { name: 'Подводные работы', status: 'completed' },
            { name: 'Опоры моста', status: 'completed' },
            { name: 'Пролетные строения', status: 'in_progress' },
            { name: 'Дорожное полотно', status: 'pending' },
        ],
    },
    {
        id: 6,
        name: 'Складской комплекс',
        category: 'Коммерческое',
        status: 'completed',
        priority: 'low',
        progress: 100,
        budget: 800,
        spent: 795,
        startDate: '01.02.2024',
        endDate: '01.02.2025',
        location: 'г. Новосибирск, промзона Кольцово',
        manager: 'Михайлов А.С.',
        workers: 0,
        tasks: { total: 60, completed: 60 },
        description: 'Современный складской комплекс класса А с автоматизированной системой управления.',
        image: 'https://images.unsplash.com/photo-1586528116311-ad861f185ef4?q=80&w=800&auto=format&fit=crop',
        phases: [
            { name: 'Каркас', status: 'completed' },
            { name: 'Кровля', status: 'completed' },
            { name: 'Полы и сети', status: 'completed' },
            { name: 'Сдача объекта', status: 'completed' },
        ],
    },
    {
        id: 7,
        name: 'Детский сад «Радуга»',
        category: 'Социальное',
        status: 'in_progress',
        priority: 'medium',
        progress: 55,
        budget: 320,
        spent: 176,
        startDate: '01.08.2024',
        endDate: '01.06.2025',
        location: 'г. Краснодар, мкр. Юбилейный',
        manager: 'Николаева О.В.',
        workers: 85,
        tasks: { total: 75, completed: 41 },
        description: 'Детское дошкольное учреждение на 240 мест с современными игровыми площадками.',
        image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=800&auto=format&fit=crop',
        phases: [
            { name: 'Коробка здания', status: 'completed' },
            { name: 'Кровля', status: 'in_progress' },
            { name: 'Инженерные системы', status: 'pending' },
            { name: 'Благоустройство', status: 'pending' },
        ],
    },
    {
        id: 8,
        name: 'Автодорога М-12',
        category: 'Инфраструктура',
        status: 'planning',
        priority: 'medium',
        progress: 8,
        budget: 12000,
        spent: 960,
        startDate: '01.01.2025',
        endDate: '31.12.2026',
        location: 'Московская - Владимирская обл.',
        manager: 'Александров К.Б.',
        workers: 50,
        tasks: { total: 450, completed: 36 },
        description: 'Проектирование и строительство скоростного участка федеральной трассы М-12.',
        image: 'https://images.unsplash.com/photo-1590487988256-78f442bf14b1?q=80&w=800&auto=format&fit=crop',
        phases: [
            { name: 'Изыскания', status: 'completed' },
            { name: 'Проектирование', status: 'in_progress' },
            { name: 'Выемка грунта', status: 'pending' },
        ],
    },
];
