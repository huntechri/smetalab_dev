'use client';

import { useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { stopImpersonation } from '@/app/actions/admin/impersonation';
import { LogOut } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export function StopImpersonationButton() {
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    const handleStop = () => {
        startTransition(async () => {
            const result = await stopImpersonation();
            if (result.success) {
                toast.success(result.success);
                router.refresh(); // Refresh to update server components (getTeamForUser)
            } else {
                // @ts-expect-error handling potential error return structure
                toast.error(result.error || 'Ошибка при выходе');
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
