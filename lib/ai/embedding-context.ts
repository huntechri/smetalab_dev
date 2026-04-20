
export interface MaterialContextInput {
    name: string;
    code: string;
    description?: string | null;
    categoryLv1?: string | null;
    categoryLv2?: string | null;
    categoryLv3?: string | null;
    categoryLv4?: string | null;
    vendor?: string | null;
    unit?: string | null;
    weight?: string | null;
}

export interface WorkContextInput {
    name: string;
    code?: string | null;
    description?: string | null;
    shortDescription?: string | null;
    category?: string | null;
    subcategory?: string | null;
    phase?: string | null;
    unit?: string | null;
}

// Семантические ключевые слова по категориям для улучшения поиска
const CATEGORY_KEYWORDS: Record<string, string> = {
    'сантехника': 'ванная комната водоснабжение сантехническое оборудование смеситель раковина унитаз',
    'строительные материалы': 'строительство ремонт отделка стройматериалы',
    'сухие смеси': 'штукатурка шпаклевка клей раствор цемент гипс',
    'лакокрасочные': 'краска лак эмаль грунтовка покрытие ЛКМ',
    'электрика': 'электромонтаж провод кабель розетка выключатель освещение',
    'инструмент': 'инструменты оборудование ручной электроинструмент',
    'крепеж': 'саморез дюбель болт гайка шуруп анкер',
    'изоляция': 'утеплитель теплоизоляция минвата пенопласт звукоизоляция',
    'напольные покрытия': 'пол ламинат паркет линолеум плитка',
    'отделочные': 'отделка стен потолок обои декор интерьер',
};

function getSemanticKeywords(categoryLv1: string | null | undefined): string {
    if (!categoryLv1) return '';
    const lowerCat = categoryLv1.toLowerCase();

    for (const [key, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
        if (lowerCat.includes(key) || key.includes(lowerCat.split(' ')[0])) {
            return keywords;
        }
    }
    return '';
}

export function buildMaterialContext(data: MaterialContextInput): string {
    const categoryChain = [
        data.categoryLv1,
        data.categoryLv2,
        data.categoryLv3,
        data.categoryLv4
    ].filter(Boolean).join(' > ');

    // Получаем семантические ключевые слова на основе категории
    const semanticKeywords = getSemanticKeywords(data.categoryLv1);

    const parts = [
        categoryChain ? `Категория: ${categoryChain}` : null,
        `Материал: ${data.name}`,
        data.code ? `Код: ${data.code}` : null,
        data.vendor ? `Поставщик: ${data.vendor}` : null,
        data.unit ? `Ед.изм: ${data.unit}` : null,
        data.weight ? `Вес: ${data.weight}` : null,
        data.description ? `Описание: ${data.description}` : null,
        // Добавляем семантические ключевые слова в конце для контекста
        semanticKeywords ? `Ключевые слова: ${semanticKeywords}` : null,
    ];

    return parts.filter(Boolean).join(' | ');
}

export function buildWorkContext(data: WorkContextInput): string {
    const parts = [
        data.phase ? `Этап: ${data.phase}` : null,
        data.category ? `Раздел: ${data.category}` : null,
        data.subcategory ? `Подраздел: ${data.subcategory}` : null,
        `Работа: ${data.name}`,
        data.code ? `Код: ${data.code}` : null,
        data.unit ? `Ед.изм: ${data.unit}` : null,
        data.shortDescription ? `Краткое описание: ${data.shortDescription}` : null,
        data.description ? `Описание: ${data.description}` : null
    ];

    return parts.filter(Boolean).join(' | ');
}
