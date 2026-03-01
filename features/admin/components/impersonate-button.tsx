'use client';

import { useActionState } from 'react';
import { Button } from '@/shared/ui/button';
import { startImpersonation } from '@/app/actions/admin/impersonation';
import { ShieldAlert, Loader2 } from 'lucide-react';
import { notify } from '@/lib/infrastructure/notifications/notify';
import { useEffect } from 'react';
import type { ActionState } from '@/lib/infrastructure/auth/middleware';

interface ImpersonateButtonProps {
    teamId: number;
}

export function ImpersonateButton({ teamId }: ImpersonateButtonProps) {
    const [state, formAction, isPending] = useActionState<ActionState, FormData>(startImpersonation, { error: '' });

    useEffect(() => {
        if (state?.error) {
            notify({ title: state.error, intent: "error" });
        }
    }, [state]);

    return (
        <form action={formAction}>
            <input type="hidden" name="targetTeamId" value={teamId} />
            <Button
                type="submit"
                size="sm"
                variant="outline"
                className="rounded-xl h-8 text-xs gap-1.5"
                disabled={isPending}
            >
                {isPending ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                    <ShieldAlert className="h-3.5 w-3.5" />
                )}
                Имперсонация
            </Button>
        </form>
    );
}
