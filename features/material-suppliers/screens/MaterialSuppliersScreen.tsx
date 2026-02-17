'use client';

import { useState } from 'react';
import { MaterialSupplierRow } from '@/types/material-supplier-row';
import { columns } from '../components/columns';
import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { CreateMaterialSupplierSheet } from '../components/CreateMaterialSupplierSheet';
import { useMaterialSuppliersActions } from '../hooks/useMaterialSuppliersActions';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

interface MaterialSuppliersScreenProps {
  initialData: MaterialSupplierRow[];
  totalCount: number;
  tenantId: number;
}

export function MaterialSuppliersScreen({ initialData, totalCount: _totalCount, tenantId }: MaterialSuppliersScreenProps) {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<MaterialSupplierRow | null>(null);

  const { handleDelete } = useMaterialSuppliersActions();

  return (
    <div className="space-y-6 p-1 md:p-0">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem><BreadcrumbLink href="/app">Главная</BreadcrumbLink></BreadcrumbItem>
          <BreadcrumbSeparator /><BreadcrumbItem><BreadcrumbLink>Справочники</BreadcrumbLink></BreadcrumbItem>
          <BreadcrumbSeparator /><BreadcrumbItem><BreadcrumbPage>Поставщики материалов</BreadcrumbPage></BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Поставщики материалов</h1>
          <p className="text-muted-foreground text-sm">Отдельный справочник поставщиков без связки с бизнес-логикой других модулей.</p>
        </div>
        <Button onClick={() => { setEditingSupplier(null); setIsSheetOpen(true); }}>
          <Plus className="mr-2 h-4 w-4" />Добавить
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={initialData}
        meta={{
          onEdit: (supplier) => {
            setEditingSupplier(supplier);
            setIsSheetOpen(true);
          },
          onDelete: handleDelete,
        }}
      />

      <CreateMaterialSupplierSheet
        open={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        materialSupplier={editingSupplier}
        tenantId={tenantId}
        onSaved={() => {
          setIsSheetOpen(false);
          setEditingSupplier(null);
        }}
      />
    </div>
  );
}

export const MaterialSuppliersClient = MaterialSuppliersScreen;
