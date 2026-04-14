import { describe, expect, it } from 'vitest';
import { buildMaterialCategoryTree, filterMaterialsByCategoryPath } from '@/features/catalog/lib/material-category-tree';
import type { CatalogMaterial } from '@/features/catalog/types/dto';

const materials: CatalogMaterial[] = [
    { id: '1', code: 'A', name: 'М1', unit: 'шт', price: 1, categoryLv1: 'L1-A', categoryLv2: 'L2-A', categoryLv3: 'L3-A', categoryLv4: 'L4-A' },
    { id: '2', code: 'B', name: 'М2', unit: 'шт', price: 2, categoryLv1: 'L1-A', categoryLv2: 'L2-A', categoryLv3: 'L3-B', categoryLv4: 'L4-B' },
    { id: '3', code: 'C', name: 'М3', unit: 'шт', price: 3, categoryLv1: 'L1-B', categoryLv2: 'L2-C', categoryLv3: 'L3-C', categoryLv4: 'L4-C' },
];

describe('material category tree', () => {
    it('builds 4-level tree', () => {
        const tree = buildMaterialCategoryTree(materials);

        expect(tree).toHaveLength(2);
        expect(tree[0]?.children[0]?.children[0]?.children[0]?.name).toBeDefined();
    });

    it('filters materials by selected category path', () => {
        const filtered = filterMaterialsByCategoryPath(materials, {
            lv1: 'L1-A',
            lv2: 'L2-A',
            lv3: 'L3-B',
            lv4: null,
        });

        expect(filtered).toHaveLength(1);
        expect(filtered[0]?.id).toBe('2');
    });
});
