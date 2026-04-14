
import { checkAccess } from '@/lib/infrastructure/auth/access';
import { redirect } from 'next/navigation';
import { TeamScreen } from '@/features/team';

export default async function TeamPage() {
    const { authorized } = await checkAccess('team', undefined, 'read');

    if (!authorized) {
        redirect('/app');
    }

    return <TeamScreen />;
}
