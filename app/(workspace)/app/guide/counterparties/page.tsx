import { Metadata } from 'next';
import { CounterpartiesScreen } from '@/features/counterparties';
import { ForbiddenState } from '@/shared/ui/states';
import { getCounterparties, getUser } from '@/lib/data/db/queries';
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
            <ForbiddenState
                title="Нет доступа к организации"
                description="Обратитесь к администратору для добавления в команду."
            />
        )
    }

    const { data, count } = await getCounterparties(user.tenantId, { limit: 50, offset: 0 });

    return <CounterpartiesScreen initialData={data} totalCount={count} />;
}
