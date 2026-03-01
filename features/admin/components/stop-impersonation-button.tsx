'use client';

import { useTransition } from 'react';
import { Button } from '@/shared/ui/button';
import { stopImpersonation } from '@/app/actions/admin/impersonation';
import { LogOut } from 'lucide-react';
import { notify } from '@/lib/infrastructure/notifications/notify';
import { useRouter } from 'next/navigation';

export function StopImpersonationButton() {
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    const handleStop = () => {
        startTransition(async () => {
            const result = await stopImpersonation();
            if (result.success) {
                notify({ title: result.success, intent: "success" });
                router.refresh(); // Refresh to update server components (getTeamForUser)
            } else {
                // @ts-expect-error handling potential error return structure
                notify({ title: result.error || 'Ошибка при выходе', intent: 'error' });
            }
        });
    };

    return (
        <Button
            variant="destructive"
            size="sm"
            onClick={handleStop}
            disabled={isPending}
            className="h-7 text-xs px-3"
        >
            <LogOut className="mr-2 h-3 w-3" />
            Выйти
        </Button>
    );
}
