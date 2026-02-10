import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { MaterialsService } from '@/lib/domain/materials/materials.service';
import { NewMaterial } from '@/lib/data/db/schema';
import { getUser, getTeamForUser } from '@/lib/data/db/queries';
import { materialsRequiredFields } from '@/lib/constants/import-configs';

type RawMaterialRow = Record<string, unknown>;
type SanitizedMaterialRow = {
    code: string;
    name: string;
    unit?: string;
    price?: number;
    vendor?: string;
    weight?: string;
    categoryLv1?: string;
    categoryLv2?: string;
    categoryLv3?: string;
    categoryLv4?: string;
    productUrl?: string;
    imageUrl?: string;
    description?: string;
};

const parsePrice = (value: unknown): number | undefined => {
    if (value === null || value === undefined) return undefined;
    if (typeof value === 'number') return Number.isFinite(value) ? Math.round(value) : undefined;
    const normalized = String(value).replace(',', '.').replace(/\s/g, '');
    const parsed = Number.parseFloat(normalized);
    return Number.isNaN(parsed) ? undefined : Math.round(parsed);
};

const hasRequiredFields = (row: RawMaterialRow): boolean => {
    return materialsRequiredFields.every((field) => {
        const value = row[field];
        if (value === null || value === undefined) return false;
        if (typeof value === 'number') return !Number.isNaN(value);
        return String(value).trim().length > 0;
    });
};


export async function POST(request: NextRequest) {
    try {
        const user = await getUser();
        if (!user) return NextResponse.json({ success: false, message: 'Пользователь не найден.' }, { status: 401 });

        const team = await getTeamForUser();
        if (!team) return NextResponse.json({ success: false, message: 'Команда не найдена.' }, { status: 404 });

        const contentType = request.headers.get('content-type') ?? '';
        if (!contentType.includes('application/json')) {
            return NextResponse.json({ success: false, message: 'Ожидался JSON с данными.' }, { status: 415 });
        }

        const body = await request.json();
        const rawRows = Array.isArray(body?.rows) ? body.rows : null;

        if (!rawRows || rawRows.length === 0) {
            return NextResponse.json({ success: false, message: 'Нет данных для импорта.' }, { status: 400 });
        }

        const sanitizedRows: SanitizedMaterialRow[] = rawRows
            .filter((row: unknown): row is RawMaterialRow => !!row && typeof row === 'object')
            .map((row: RawMaterialRow) => ({
                code: row.code ? String(row.code).trim() : '',
                name: row.name ? String(row.name).trim() : '',
                unit: row.unit ? String(row.unit).trim() : undefined,
                price: parsePrice(row.price),
                vendor: row.vendor ? String(row.vendor).trim() : undefined,
                weight: row.weight ? String(row.weight).trim() : undefined,
                categoryLv1: row.categoryLv1 ? String(row.categoryLv1).trim() : undefined,
                categoryLv2: row.categoryLv2 ? String(row.categoryLv2).trim() : undefined,
                categoryLv3: row.categoryLv3 ? String(row.categoryLv3).trim() : undefined,
                categoryLv4: row.categoryLv4 ? String(row.categoryLv4).trim() : undefined,
                productUrl: row.productUrl ? String(row.productUrl).trim() : undefined,
                imageUrl: row.imageUrl ? String(row.imageUrl).trim() : undefined,
                description: row.description ? String(row.description).trim() : undefined,
            }))
            .filter(hasRequiredFields);

        if (sanitizedRows.length === 0) {
            return NextResponse.json({ success: false, message: 'Нет валидных строк для импорта.' }, { status: 400 });
        }

        const newMaterials: NewMaterial[] = sanitizedRows.map(row => ({
            tenantId: team.id,
            code: String(row.code || ''),
            name: String(row.name || ''),
            unit: row.unit ? String(row.unit) : undefined,
            price: row.price,
            vendor: row.vendor ? String(row.vendor) : undefined,
            weight: row.weight ? String(row.weight) : undefined,
            categoryLv1: row.categoryLv1 ? String(row.categoryLv1) : undefined,
            categoryLv2: row.categoryLv2 ? String(row.categoryLv2) : undefined,
            categoryLv3: row.categoryLv3 ? String(row.categoryLv3) : undefined,
            categoryLv4: row.categoryLv4 ? String(row.categoryLv4) : undefined,
            productUrl: row.productUrl ? String(row.productUrl) : undefined,
            imageUrl: row.imageUrl ? String(row.imageUrl) : undefined,
            description: row.description ? String(row.description) : undefined,
            status: 'active'
        }));

        const result = await MaterialsService.upsertMany(team.id, newMaterials);

        if (result.success) {
            MaterialsService.enqueueImageDownloads(team.id, newMaterials);
            revalidatePath('/app/guide/materials');
            return NextResponse.json({
                success: true,
                message: `Импорт завершен. Загружено записей: ${newMaterials.length}.`,
                count: newMaterials.length
            });
        }

        return NextResponse.json(result, { status: 500 });

    } catch (error) {
        console.error('Import materials API error:', error);
        return NextResponse.json({ success: false, message: 'Ошибка при обработке файла.' }, { status: 500 });
    }
}
