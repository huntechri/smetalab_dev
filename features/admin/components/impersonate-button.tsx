'use client';

import { useActionState } from 'react';
import { Button } from '@/shared/ui/button';
import { FormLayout } from '@/shared/ui/form-layout';
import { HiddenInput } from '@/shared/ui/hidden-input';
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
        <FormLayout action={formAction}>
            <HiddenInput name="targetTeamId" value={teamId} />
            <Button
                type="submit"
                variant="outline"
                size="default"
                disabled={isPending}
            >
                {isPending ? (
                    <Loader2 />
                ) : (
                    <ShieldAlert />
                )}
                Имперсонация
            </Button>
        </FormLayout>
    );
}
