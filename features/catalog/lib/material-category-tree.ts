import type { CatalogMaterial } from '../types/dto';

export type MaterialCategorySelection = {
    lv1: string | null;
    lv2: string | null;
    lv3: string | null;
    lv4: string | null;
};

export type MaterialCategoryNode = {
    name: string;
    children: MaterialCategoryNode[];
};

const uniqSorted = (values: string[]) => Array.from(new Set(values.filter(Boolean))).sort((a, b) => a.localeCompare(b, 'ru'));

export function buildMaterialCategoryTree(materials: CatalogMaterial[]): MaterialCategoryNode[] {
    const lv1Values = uniqSorted(materials.map((material) => material.categoryLv1 ?? ''));

    return lv1Values.map((lv1) => {
        const lv1Materials = materials.filter((material) => material.categoryLv1 === lv1);
        const lv2Values = uniqSorted(lv1Materials.map((material) => material.categoryLv2 ?? ''));

        return {
            name: lv1,
            children: lv2Values.map((lv2) => {
                const lv2Materials = lv1Materials.filter((material) => material.categoryLv2 === lv2);
                const lv3Values = uniqSorted(lv2Materials.map((material) => material.categoryLv3 ?? ''));

                return {
                    name: lv2,
                    children: lv3Values.map((lv3) => {
                        const lv3Materials = lv2Materials.filter((material) => material.categoryLv3 === lv3);
                        const lv4Values = uniqSorted(lv3Materials.map((material) => material.categoryLv4 ?? ''));

                        return {
                            name: lv3,
                            children: lv4Values.map((lv4) => ({ name: lv4, children: [] })),
                        };
                    }),
                };
            }),
        };
    });
}

export function filterMaterialsByCategoryPath(materials: CatalogMaterial[], selected: MaterialCategorySelection): CatalogMaterial[] {
    return materials.filter((material) => {
        if (selected.lv1 && material.categoryLv1 !== selected.lv1) {
            return false;
        }

        if (selected.lv2 && material.categoryLv2 !== selected.lv2) {
            return false;
        }

        if (selected.lv3 && material.categoryLv3 !== selected.lv3) {
            return false;
        }

        if (selected.lv4 && material.categoryLv4 !== selected.lv4) {
            return false;
        }

        return true;
    });
}
