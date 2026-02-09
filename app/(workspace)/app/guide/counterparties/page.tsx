import { Suspense } from 'react';
import { Metadata } from 'next';
import { CounterpartiesClient } from './components/CounterpartiesClient';
import { getCounterparties, getUser } from '@/lib/db/queries';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
    title: 'Контрагенты | Smetalab',
    description: 'Управление контрагентами',
};

export default async function CounterpartiesPage() {
    const user = await getUser();
    if (!user) redirect('/sign-in');

    if (!user.tenantId) {
        return (
            <div className="flex items-center justify-center h-full p-8">
                <div className="text-center">
                    <h2 className="text-lg font-semibold">Нет доступа к организации</h2>
                    <p className="text-muted-foreground mt-2">Обратитесь к администратору для добавления в команду.</p>
                </div>
            </div>
        )
    }

    const { data, count } = await getCounterparties(user.tenantId, { limit: 50, offset: 0 });

    return (
        <div className="flex-1 w-full flex flex-col">
            <Suspense fallback={<div>Loading...</div>}>
                <CounterpartiesClient
                    initialData={data}
                    totalCount={count}
                    tenantId={user.tenantId}
                />
            </Suspense>
        </div>
    );
}
