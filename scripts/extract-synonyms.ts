/**
 * Скрипт для извлечения словаря синонимов из базы материалов
 * Запуск: pnpm tsx scripts/extract-synonyms.ts
 */

import { db } from '@/lib/data/db/drizzle';
import { materials } from '@/lib/data/db/schema';
import { sql } from 'drizzle-orm';
import * as fs from 'fs';
import * as path from 'path';

interface SynonymEntry {
    term: string;
    synonyms: string[];
    category: string;
    count: number;
}

// Известные аббревиатуры и их расшифровки
const KNOWN_ABBREVIATIONS: Record<string, string[]> = {
    'гкл': ['гипсокартон', 'гипсокартонный лист'],
    'гвл': ['гипсоволокно', 'гипсоволокнистый лист'],
    'осп': ['osb', 'ориентированно-стружечная плита'],
    'osb': ['осп', 'ориентированно-стружечная плита'],
    'цсп': ['цементно-стружечная плита'],
    'двп': ['древесно-волокнистая плита', 'оргалит'],
    'дсп': ['древесно-стружечная плита'],
    'мдф': ['mdf', 'древесноволокнистая плита средней плотности'],
    'пвх': ['поливинилхлорид', 'пластик'],
    'лкм': ['лакокрасочные материалы', 'краски'],
    'эппс': ['экструдированный пенополистирол', 'пеноплекс'],
    'ппс': ['пенополистирол', 'пенопласт'],
    'пэ': ['полиэтилен'],
    'рубероид': ['гидроизоляция', 'кровельный материал'],
    'ротбанд': ['rotband', 'гипсовая штукатурка', 'knauf'],
    'фуген': ['fugen', 'шпаклевка', 'knauf'],
    'ветонит': ['vetonit', 'шпаклевка'],
    'церезит': ['ceresit', 'клей', 'затирка'],
};

// Известные бренды и их ассоциации
const BRAND_ASSOCIATIONS: Record<string, string[]> = {
    'knauf': ['кнауф', 'ротбанд', 'фуген', 'гипсокартон'],
    'кнауф': ['knauf', 'ротбанд', 'фуген', 'гипсокартон'],
    'henkel': ['хенкель', 'церезит', 'ceresit'],
    'weber': ['вебер', 'ветонит', 'vetonit'],
    'технониколь': ['техно', 'гидроизоляция', 'утеплитель'],
    'rockwool': ['роквул', 'минвата', 'утеплитель'],
    'isover': ['изовер', 'минвата', 'утеплитель'],
    'пеноплекс': ['penoplex', 'эппс', 'утеплитель'],
};

async function extractSynonymsFromDatabase(): Promise<Map<string, SynonymEntry>> {
    console.log('📊 Анализ базы данных материалов...');

    const synonymsMap = new Map<string, SynonymEntry>();

    // 1. Получаем уникальные категории и их частоту
    const categoryStats = await db
        .select({
            categoryLv1: materials.categoryLv1,
            categoryLv2: materials.categoryLv2,
            count: sql<number>`count(*)::int`
        })
        .from(materials)
        .groupBy(materials.categoryLv1, materials.categoryLv2)
        .orderBy(sql`count(*) DESC`);

    console.log(`📁 Найдено ${categoryStats.length} уникальных комбинаций категорий`);

    // 2. Извлекаем популярные слова из названий
    const allMaterials = await db
        .select({
            name: materials.name,
            categoryLv1: materials.categoryLv1,
            vendor: materials.vendor,
        })
        .from(materials);

    console.log(`📦 Анализируем ${allMaterials.length} материалов...`);

    // Словарь частоты слов по категориям
    const wordFrequency: Map<string, { count: number; categories: Set<string>; contexts: string[] }> = new Map();

    for (const mat of allMaterials) {
        const name = (mat.name || '').toLowerCase();
        const category = mat.categoryLv1 || 'unknown';

        // Разбиваем название на слова
        const words = name.split(/[\s,./\-()]+/).filter(w => w.length >= 3);

        for (const word of words) {
            // Пропускаем числа и единицы измерения
            if (/^\d+$/.test(word) || ['шт', 'мм', 'см', 'кг', 'мл', 'для', 'при', 'или', 'под'].includes(word)) {
                continue;
            }

            const existing = wordFrequency.get(word) || { count: 0, categories: new Set(), contexts: [] };
            existing.count++;
            existing.categories.add(category);
            if (existing.contexts.length < 5) {
                existing.contexts.push(name.slice(0, 80));
            }
            wordFrequency.set(word, existing);
        }
    }

    // 3. Формируем синонимы на основе анализа
    console.log('🔍 Формируем словарь синонимов...');

    // Добавляем известные аббревиатуры
    for (const [abbr, synonyms] of Object.entries(KNOWN_ABBREVIATIONS)) {
        synonymsMap.set(abbr, {
            term: abbr,
            synonyms: synonyms,
            category: 'аббревиатура',
            count: wordFrequency.get(abbr)?.count || 0
        });
    }

    // Добавляем бренды
    for (const [brand, synonyms] of Object.entries(BRAND_ASSOCIATIONS)) {
        synonymsMap.set(brand, {
            term: brand,
            synonyms: synonyms,
            category: 'бренд',
            count: wordFrequency.get(brand)?.count || 0
        });
    }

    // 4. Находим слова с общим корнем (потенциальные синонимы)
    const sortedWords = Array.from(wordFrequency.entries())
        .filter(([, data]) => data.count >= 10) // Только популярные слова
        .sort((a, b) => b[1].count - a[1].count);

    // Группируем по корню (первые 4-5 букв)
    const rootGroups: Map<string, string[]> = new Map();
    for (const [word] of sortedWords) {
        if (word.length >= 5) {
            const root = word.slice(0, 5);
            const group = rootGroups.get(root) || [];
            if (!group.includes(word)) {
                group.push(word);
            }
            rootGroups.set(root, group);
        }
    }

    // Добавляем группы с несколькими вариантами как синонимы
    for (const [root, words] of rootGroups.entries()) {
        if (words.length >= 2 && !synonymsMap.has(words[0])) {
            const baseWord = words[0];
            synonymsMap.set(baseWord, {
                term: baseWord,
                synonyms: words.slice(1),
                category: 'вариации',
                count: wordFrequency.get(baseWord)?.count || 0
            });
        }
    }

    return synonymsMap;
}

function generateCategoryKeywords(categoryStats: { categoryLv1: string | null; count: number }[]): Record<string, string[]> {
    const keywords: Record<string, string[]> = {};

    // Предопределённые ключевые слова для категорий
    const categoryKeywordMap: Record<string, string[]> = {
        'сантехника': ['ванная', 'водоснабжение', 'смеситель', 'унитаз', 'раковина', 'душ', 'трубы'],
        'электрика': ['провод', 'кабель', 'розетка', 'выключатель', 'освещение', 'щит'],
        'строительные материалы': ['строительство', 'ремонт', 'отделка', 'стройка'],
        'сухие смеси': ['штукатурка', 'шпаклевка', 'клей', 'раствор', 'цемент', 'гипс'],
        'отделочные материалы': ['отделка', 'декор', 'интерьер', 'стены', 'потолок'],
        'лакокрасочные': ['краска', 'эмаль', 'лак', 'грунтовка', 'покрытие'],
        'крепеж': ['саморез', 'дюбель', 'болт', 'гайка', 'шуруп', 'анкер'],
        'изоляция': ['утеплитель', 'теплоизоляция', 'минвата', 'пенопласт'],
        'напольные покрытия': ['ламинат', 'паркет', 'линолеум', 'плитка', 'пол'],
        'инструмент': ['инструменты', 'оборудование', 'ручной', 'электро'],
    };

    for (const stat of categoryStats) {
        if (!stat.categoryLv1) continue;
        const catLower = stat.categoryLv1.toLowerCase();

        for (const [key, kws] of Object.entries(categoryKeywordMap)) {
            if (catLower.includes(key) || key.includes(catLower.split(' ')[0])) {
                keywords[stat.categoryLv1] = kws;
                break;
            }
        }
    }

    return keywords;
}

async function main() {
    console.log('🚀 Запуск извлечения синонимов из базы данных...\n');

    try {
        const synonymsMap = await extractSynonymsFromDatabase();

        // Преобразуем в объект для JSON
        const synonymsDict: Record<string, string> = {};
        const fullSynonymsData: SynonymEntry[] = [];

        for (const [term, entry] of synonymsMap.entries()) {
            // Формат для поиска: term -> "synonym1 synonym2 synonym3"
            synonymsDict[term] = entry.synonyms.join(' ');
            fullSynonymsData.push(entry);
        }

        // Сортируем по популярности
        fullSynonymsData.sort((a, b) => b.count - a.count);

        // Сохраняем в файлы
        const outputDir = path.join(process.cwd(), 'lib', 'ai', 'dictionaries');
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }

        // 1. Простой словарь для использования в поиске
        const simpleDictPath = path.join(outputDir, 'synonyms.json');
        fs.writeFileSync(simpleDictPath, JSON.stringify(synonymsDict, null, 2), 'utf-8');
        console.log(`✅ Простой словарь сохранён: ${simpleDictPath}`);

        // 2. Полный словарь с метаданными
        const fullDictPath = path.join(outputDir, 'synonyms-full.json');
        fs.writeFileSync(fullDictPath, JSON.stringify(fullSynonymsData, null, 2), 'utf-8');
        console.log(`✅ Полный словарь сохранён: ${fullDictPath}`);

        // 3. TypeScript файл для импорта
        const tsContent = `/**
 * Автоматически сгенерированный словарь синонимов
 * Создан: ${new Date().toISOString()}
 * Источник: база материалов (${fullSynonymsData.length} записей)
 */

export const SYNONYMS: Record<string, string> = ${JSON.stringify(synonymsDict, null, 4)};

export const SYNONYMS_FULL: Array<{
    term: string;
    synonyms: string[];
    category: string;
    count: number;
}> = ${JSON.stringify(fullSynonymsData.slice(0, 100), null, 4)};
`;

        const tsPath = path.join(outputDir, 'synonyms.ts');
        fs.writeFileSync(tsPath, tsContent, 'utf-8');
        console.log(`✅ TypeScript модуль сохранён: ${tsPath}`);

        console.log(`\n📊 Статистика:`);
        console.log(`   - Всего терминов: ${synonymsMap.size}`);
        console.log(`   - Аббревиатур: ${fullSynonymsData.filter(e => e.category === 'аббревиатура').length}`);
        console.log(`   - Брендов: ${fullSynonymsData.filter(e => e.category === 'бренд').length}`);
        console.log(`   - Вариаций: ${fullSynonymsData.filter(e => e.category === 'вариации').length}`);

        console.log('\n✨ Готово! Теперь импортируйте словарь:');
        console.log("   import { SYNONYMS } from '@/lib/ai/dictionaries/synonyms';");

    } catch (error) {
        console.error('❌ Ошибка:', error);
        process.exit(1);
    }

    process.exit(0);
}

main();
