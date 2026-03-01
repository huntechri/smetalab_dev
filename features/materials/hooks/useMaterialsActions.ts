import { useTransition, useRef } from 'react';
import { useToast } from "@/shared/ui/use-toast";
import { exportMaterials, deleteAllMaterials, createMaterial } from '@/app/actions/materials';
import * as XLSX from 'xlsx';
import { MaterialRow } from '@/types/material-row';
import { materialsHeaderMap, materialsRequiredFields } from '@/lib/constants/import-configs';

type RawExcelRow = Record<string, unknown>;

const parsePrice = (value: unknown): number | undefined => {
    if (value === null || value === undefined) return undefined;
    if (typeof value === 'number') return Number.isFinite(value) ? Math.round(value) : undefined;
    const normalized = String(value).replace(',', '.').replace(/\s/g, '');
    const parsed = Number.parseFloat(normalized);
    return Number.isNaN(parsed) ? undefined : Math.round(parsed);
};

const mapExcelRows = (rows: RawExcelRow[]) => {
    const mapped: RawExcelRow[] = [];

    for (const row of rows) {
        const item: RawExcelRow = {};
        for (const [excelHeader, value] of Object.entries(row)) {
            const dbField = materialsHeaderMap[excelHeader];
            if (dbField) {
                item[dbField] = value;
            }
        }
        const hasRequired = materialsRequiredFields.every((field) => {
            const value = item[field];
            if (value === null || value === undefined) return false;
            if (typeof value === 'number') return !Number.isNaN(value);
            return String(value).trim().length > 0;
        });
        if (hasRequired) {
            mapped.push(item);
        }
    }

    return mapped.map((row) => ({
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
    }));
};

export function useMaterialsActions(data: MaterialRow[], setData: React.Dispatch<React.SetStateAction<MaterialRow[]>>, tenantId: number) {
    const { toast } = useToast();
    const [isExporting, startExportTransition] = useTransition();
    const [isImporting, startImportTransition] = useTransition();
    const [isDeletingAll, startDeleteAllTransition] = useTransition();
    const [isInserting, startInsertTransition] = useTransition();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleExport = () => {
        startExportTransition(async () => {
            const result = await exportMaterials();
            if (result.success) {
                const worksheet = XLSX.utils.json_to_sheet(result.data);
                const workbook = XLSX.utils.book_new();
                XLSX.utils.book_append_sheet(workbook, worksheet, 'Materials');
                XLSX.writeFile(workbook, 'materials_export.xlsx');
                toast({ title: "Экспорт успешен" });
            } else {
                toast({ variant: "destructive", title: "Ошибка экспорта", description: result.message });
            }
        });
    };

    const handleImportClick = () => fileInputRef.current?.click();

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            startImportTransition(async () => {
                try {
                    const buffer = await file.arrayBuffer();
                    const workbook = XLSX.read(buffer, { type: 'array' });
                    const sheetName = workbook.SheetNames[0];
                    const worksheet = workbook.Sheets[sheetName];
                    const rawData = XLSX.utils.sheet_to_json(worksheet) as RawExcelRow[];

                    if (!rawData.length) {
                        toast({ variant: "destructive", title: "Ошибка импорта", description: "Файл пуст." });
                        return;
                    }

                    const mappedRows = mapExcelRows(rawData);
                    if (mappedRows.length === 0) {
                        toast({ variant: "destructive", title: "Ошибка импорта", description: "Нет валидных строк для импорта." });
                        return;
                    }

                    const response = await fetch('/api/upload/materials', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ rows: mappedRows }),
                    });
                    const result = await response.json();
                    if (response.ok && result.success) {
                        toast({ title: "Импорт завершен", description: result.message });
                    } else {
                        toast({ variant: "destructive", title: "Ошибка импорта", description: result.message || "Неизвестная ошибка" });
                    }
                } catch {
                    toast({ variant: "destructive", title: "Ошибка", description: "Не удалось обработать файл." });
                }
            });
        }
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleDeleteAll = () => {
        startDeleteAllTransition(async () => {
            const result = await deleteAllMaterials();
            if (result.success) {
                toast({ title: "Справочник очищен" });
                setData([]);
            } else {
                toast({ variant: "destructive", title: "Ошибка", description: result.message });
            }
        });
    };

    const onSaveInsert = (id: string) => {
        const row = data.find(r => r.id === id);
        if (!row || !row.name || !row.unit) {
            toast({ variant: "destructive", title: "Ошибка", description: "Заполните обязательные поля." });
            return;
        }

        startInsertTransition(async () => {
            const result = await createMaterial({
                tenantId: tenantId,
                code: row.code || `M-${Date.now()}`,
                name: row.name,
                unit: row.unit,
                price: Number(row.price),
                vendor: row.vendor || '',
                weight: row.weight || '',
                categoryLv1: row.categoryLv1 || '',
                categoryLv2: row.categoryLv2 || '',
                categoryLv3: row.categoryLv3 || '',
                categoryLv4: row.categoryLv4 || '',
                productUrl: row.productUrl || '',
                imageUrl: row.imageUrl || '',
                status: 'active'
            });

            if (result.success) {
                toast({ title: "Материал добавлен" });
            } else {
                toast({ variant: "destructive", title: "Ошибка", description: result.message });
            }
        });
    };

    return {
        isExporting,
        isImporting,
        isDeletingAll,
        isInserting,
        fileInputRef,
        handleExport,
        handleImportClick,
        handleFileChange,
        handleDeleteAll,
        onSaveInsert
    };
}
