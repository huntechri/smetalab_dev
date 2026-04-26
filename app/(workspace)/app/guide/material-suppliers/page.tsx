import { Metadata } from 'next';
import { MaterialSuppliersScreen } from '@/features/material-suppliers';
import { ForbiddenState } from '@repo/ui';
import { getMaterialSuppliers, getUser } from '@/lib/data/db/queries';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Поставщики материалов | Smetalab',
  description: 'Управление поставщиками материалов',
};

export default async function MaterialSuppliersPage() {
  const user = await getUser();
  if (!user) redirect('/sign-in');

  if (!user.tenantId) {
    return (
      <ForbiddenState
        title="Нет доступа к организации"
        description="Обратитесь к администратору для добавления в команду."
        className="min-h-[40vh]"
      />
    );
  }

  const { data, count } = await getMaterialSuppliers(user.tenantId, { limit: 50, offset: 0 });

  return (
    <div className="flex-1 w-full flex flex-col">
      <MaterialSuppliersScreen initialData={data} totalCount={count} />
    </div>
  );
}
