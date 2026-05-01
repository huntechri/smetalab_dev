import { cookies } from 'next/headers';

import { AdminImpersonationBannerView } from '@/shared/ui/admin-surface';
import { getImpersonationBannerData } from '@/lib/services/impersonation.service';
import { StopImpersonationButton } from './stop-impersonation-button';

export async function ImpersonationBanner() {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('impersonation_id')?.value;

    if (!sessionToken) return null;

    const data = await getImpersonationBannerData(sessionToken);

    if (!data) return null;

    return (
        <AdminImpersonationBannerView
            teamName={data.teamName}
            action={<StopImpersonationButton />}
        />
    );
}
