import { cookies } from 'next/headers';
import { getImpersonationBannerData } from '@/lib/services/impersonation.service';
import { StopImpersonationButton } from './stop-impersonation-button';
import { AlertTriangle } from 'lucide-react';

export async function ImpersonationBanner() {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('impersonation_id')?.value;

    if (!sessionToken) return null;

    const data = await getImpersonationBannerData(sessionToken);

    if (!data) return null;

    return (
        <div className="bg-amber-100 border-b border-amber-200 px-4 py-2 flex items-center justify-between text-sm text-amber-900 sticky top-0 z-50">
            <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                <span className="font-medium">
                    Режим имперсонации:
                </span>
                <span>
                    Вы работаете в рабочем пространстве команды <strong>{data.teamName}</strong>
                </span>
            </div>
            <div className="flex items-center gap-4">
                <span className="text-amber-700/70 text-xs hidden md:inline">
                    Все действия логируются
                </span>
                <StopImpersonationButton />
            </div>
        </div>
    );
}
