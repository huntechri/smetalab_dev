import { describe, it, expect, beforeEach } from 'vitest';
import { db } from '@/lib/data/db/drizzle';
import { globalPurchases, materialSuppliers, materials, projects, teams } from '@/lib/data/db/schema';
import { GlobalPurchasesService } from '@/lib/services/global-purchases.service';
import { eq } from 'drizzle-orm';
import { resetDatabase } from '@/lib/data/db/test-utils';

describe('Global purchases supplier badges integration', () => {
  let teamA: number;
  let teamB: number;
  let purchaseId: string;
  let supplierAId: string;
  let supplierBId: string;
  let projectBId: string;

  beforeEach(async () => {
    await resetDatabase();

    const [a] = await db.insert(teams).values({ name: 'Team A' }).returning();
    const [b] = await db.insert(teams).values({ name: 'Team B' }).returning();
    teamA = a.id;
    teamB = b.id;

    const [supplierA] = await db.insert(materialSuppliers).values({
      tenantId: teamA,
      name: 'Supplier A',
      color: '#22C55E',
      legalStatus: 'company',
    }).returning();

    const [supplierB] = await db.insert(materialSuppliers).values({
      tenantId: teamB,
      name: 'Supplier B',
      color: '#EF4444',
      legalStatus: 'company',
    }).returning();

    supplierAId = supplierA.id;
    supplierBId = supplierB.id;
    await db.insert(projects).values({
      tenantId: teamA,
      name: 'Project A',
      slug: 'project-a',
    }).returning();
    const [projectB] = await db.insert(projects).values({
      tenantId: teamB,
      name: 'Project B',
      slug: 'project-b',
    }).returning();
    projectBId = projectB.id;

    const [row] = await db.insert(globalPurchases).values({
      tenantId: teamA,
      projectName: '',
      materialName: 'Цемент',
      unit: 'шт',
      qty: 1,
      price: 100,
      amount: 100,
      note: '',
      source: 'manual',
      purchaseDate: '2026-02-01',
      order: 1,
    }).returning();

    purchaseId = row.id;
  });

  it('assigns supplier and returns badge fields in list', async () => {
    const patch = await GlobalPurchasesService.patch(teamA, purchaseId, { supplierId: supplierAId });
    expect(patch.success).toBe(true);

    const list = await GlobalPurchasesService.list(teamA, { from: '2026-02-01', to: '2026-02-01' });
    expect(list.success).toBe(true);
    if (!list.success) return;

    expect(list.data[0].supplierId).toBe(supplierAId);
    expect(list.data[0].supplierName).toBe('Supplier A');
    expect(list.data[0].supplierColor).toBe('#22C55E');
  });

  it('blocks assigning supplier from another tenant', async () => {
    const patch = await GlobalPurchasesService.patch(teamA, purchaseId, { supplierId: supplierBId });
    expect(patch.success).toBe(false);
    if (patch.success) return;
    expect(patch.error.code).toBe('NOT_FOUND');
  });


  it('stores materialId for catalog purchase rows', async () => {
    const [material] = await db.insert(materials).values({
      tenantId: teamA,
      code: 'MAT-CEMENT',
      name: 'Цемент М500',
      nameNorm: 'цемент м500',
      unit: 'меш',
      price: 540,
      status: 'active',
    }).returning();

    const created = await GlobalPurchasesService.create(teamA, {
      materialName: material.name,
      materialId: material.id,
      unit: material.unit,
      qty: 3,
      price: 540,
      source: 'catalog',
      purchaseDate: '2026-02-01',
    });

    expect(created.success).toBe(true);
    if (!created.success) return;

    const list = await GlobalPurchasesService.list(teamA, { from: '2026-02-01', to: '2026-02-01' });
    expect(list.success).toBe(true);
    if (!list.success) return;

    const createdRow = list.data.find((row) => row.id === created.data.id);
    expect(createdRow?.materialId).toBe(material.id);
  });

  it('removes supplier from purchase when supplier is deleted', async () => {
    await GlobalPurchasesService.patch(teamA, purchaseId, { supplierId: supplierAId });

    await db.update(materialSuppliers)
      .set({ deletedAt: new Date() })
      .where(eq(materialSuppliers.id, supplierAId));

    const list = await GlobalPurchasesService.list(teamA, { from: '2026-02-01', to: '2026-02-01' });
    expect(list.success).toBe(true);
    if (!list.success) return;
    expect(list.data[0].supplierName).toBeNull();
    expect(list.data[0].supplierColor).toBeNull();
  });

  it('updates 100 rows in a single batch patch call', async () => {
    const rows = await db.insert(globalPurchases).values(
      Array.from({ length: 100 }, (_, index) => ({
        tenantId: teamA,
        projectName: '',
        materialName: `Материал ${index + 1}`,
        unit: 'шт',
        qty: 1,
        price: 10,
        amount: 10,
        note: '',
        source: 'manual' as const,
        purchaseDate: '2026-02-01',
        order: index + 2,
      }))
    ).returning();

    const payload = {
      updates: rows.map((row, index) => ({
        rowId: row.id,
        patch: {
          qty: index + 1,
          price: 25,
          supplierId: supplierAId,
        },
      })),
    };

    const patchResult = await GlobalPurchasesService.patchBatch(teamA, payload);
    expect(patchResult.success).toBe(true);
    if (!patchResult.success) return;

    expect(patchResult.data).toHaveLength(100);
    expect(patchResult.data.every((row) => row.supplierId === supplierAId)).toBe(true);

    const totalAmount = patchResult.data.reduce((acc, row) => acc + row.amount, 0);
    expect(totalAmount).toBeGreaterThan(0);
  });

  it('returns NOT_FOUND when any row in batch is missing', async () => {
    const result = await GlobalPurchasesService.patchBatch(teamA, {
      updates: [
        { rowId: purchaseId, patch: { qty: 2 } },
        { rowId: '0f6f95a0-9db0-4b58-bb12-d7faadf09999', patch: { qty: 3 } },
      ],
    });

    expect(result.success).toBe(false);
    if (result.success) return;
    expect(result.error.code).toBe('NOT_FOUND');
  });

  it('returns NOT_FOUND when target row is soft-deleted', async () => {
    await db.update(globalPurchases)
      .set({ deletedAt: new Date() })
      .where(eq(globalPurchases.id, purchaseId));

    const result = await GlobalPurchasesService.patchBatch(teamA, {
      updates: [{ rowId: purchaseId, patch: { qty: 5 } }],
    });

    expect(result.success).toBe(false);
    if (result.success) return;
    expect(result.error.code).toBe('NOT_FOUND');
  });

  it('returns NOT_FOUND when project does not belong to tenant', async () => {
    const result = await GlobalPurchasesService.patchBatch(teamA, {
      updates: [{ rowId: purchaseId, patch: { projectId: projectBId } }],
    });

    expect(result.success).toBe(false);
    if (result.success) return;
    expect(result.error.code).toBe('NOT_FOUND');
  });

  it('returns NOT_FOUND when supplier does not belong to tenant', async () => {
    const result = await GlobalPurchasesService.patchBatch(teamA, {
      updates: [{ rowId: purchaseId, patch: { supplierId: supplierBId } }],
    });

    expect(result.success).toBe(false);
    if (result.success) return;
    expect(result.error.code).toBe('NOT_FOUND');
  });

  it('enforces tenant isolation for batch updates', async () => {
    const [teamBRow] = await db.insert(globalPurchases).values({
      tenantId: teamB,
      projectName: '',
      materialName: 'Team B material',
      unit: 'шт',
      qty: 1,
      price: 100,
      amount: 100,
      note: '',
      source: 'manual',
      purchaseDate: '2026-02-01',
      order: 1,
    }).returning();

    const result = await GlobalPurchasesService.patchBatch(teamA, {
      updates: [{ rowId: teamBRow.id, patch: { qty: 7 } }],
    });

    expect(result.success).toBe(false);
    if (result.success) return;
    expect(result.error.code).toBe('NOT_FOUND');
  });

  it('rejects entire batch when one update fails validation', async () => {
    const [secondRow] = await db.insert(globalPurchases).values({
      tenantId: teamA,
      projectName: '',
      materialName: 'Песок',
      unit: 'шт',
      qty: 2,
      price: 200,
      amount: 400,
      note: '',
      source: 'manual',
      purchaseDate: '2026-02-01',
      order: 2,
    }).returning();

    const result = await GlobalPurchasesService.patchBatch(teamA, {
      updates: [
        { rowId: purchaseId, patch: { qty: 10 } },
        { rowId: secondRow.id, patch: { projectId: projectBId } },
      ],
    });

    expect(result.success).toBe(false);
    if (result.success) return;
    expect(result.error.code).toBe('NOT_FOUND');

    const untouchedRows = await db.query.globalPurchases.findMany({
      where: eq(globalPurchases.tenantId, teamA),
    });
    const firstRowAfter = untouchedRows.find((row) => row.id === purchaseId);
    const secondRowAfter = untouchedRows.find((row) => row.id === secondRow.id);

    expect(firstRowAfter?.qty).toBe(1);
    expect(secondRowAfter?.projectId).toBeNull();
  });

  it('resolves materialId during import by explicit id or catalog name', async () => {
    const [materialByName] = await db.insert(materials).values({
      tenantId: teamA,
      code: 'MAT-GLUE',
      name: 'Клей для ПГП/ГКЛ/ГВЛ Knauf Перлфикс гипсовый 30 кг',
      nameNorm: 'клей для пгп/гкл/гвл knauf перлфикс гипсовый 30 кг',
      unit: 'шт',
      price: 460,
      status: 'active',
    }).returning();

    const [materialById] = await db.insert(materials).values({
      tenantId: teamA,
      code: 'MAT-ID',
      name: 'Шпаклевка финишная',
      nameNorm: 'шпаклевка финишная',
      unit: 'меш',
      price: 700,
      status: 'active',
    }).returning();

    const imported = await GlobalPurchasesService.importRows(teamA, {
      rows: [
        {
          purchaseDate: '2026-02-02',
          projectName: '',
          materialName: 'Клей для ПГП/ГКЛ/ГВЛ Knauf Перлфикс гипсовый 30 кг',
          unit: 'шт',
          qty: 8,
          price: 460,
          note: '',
          supplierName: '',
        },
        {
          purchaseDate: '2026-02-02',
          projectName: '',
          materialName: 'Любое имя из файла',
          materialId: materialById.id,
          unit: 'меш',
          qty: 3,
          price: 700,
          note: '',
          supplierName: '',
        },
      ],
    });

    expect(imported.success).toBe(true);
    if (!imported.success) return;

    const importedByName = imported.data.find((row) => row.materialName === materialByName.name);
    const importedById = imported.data.find((row) => row.materialId === materialById.id);

    expect(importedByName?.materialId).toBe(materialByName.id);
    expect(importedById?.materialId).toBe(materialById.id);
  });

});
