import { getActiveImpersonationSession } from '@/lib/data/admin/impersonation.repository';

export async function getImpersonationBannerData(sessionToken: string) {
    const session = await getActiveImpersonationSession(sessionToken);

    if (!session || !session.targetTeam) return null;

    return {
        teamName: session.targetTeam.name,
    };
}
