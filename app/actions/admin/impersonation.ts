'use server';

import { z } from 'zod';
import { requirePermission } from '@/lib/infrastructure/auth/access';
import { protectedAction } from '@/lib/infrastructure/auth/middleware';
import { startImpersonationUseCase, stopImpersonationUseCase } from '@/lib/domain/admin/use-cases';
import { cookies, headers } from 'next/headers';

import { redirect } from 'next/navigation';

const startImpersonationSchema = z.object({
    targetTeamId: z.coerce.number(),
});

export const startImpersonation = protectedAction(
    'platform.tenants', // Requires platform level permission
    startImpersonationSchema,
    async (data, formData, { user }) => {
        if (user.platformRole !== 'superadmin') {
            return { error: 'Только супердминистраторы могут использовать имперсонацию' };
        }

        const sessionToken = Buffer.from(globalThis.crypto.getRandomValues(new Uint8Array(32))).toString('hex');
        const ip = (await headers()).get('x-forwarded-for') || 'unknown';

        await startImpersonationUseCase(user.id, data.targetTeamId, sessionToken, ip);

        const cookieStore = await cookies();
        cookieStore.set('impersonation_id', sessionToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
        });

        redirect('/dashboard');
    }
);

export const stopImpersonation = async () => {
    await requirePermission('platform.tenants');

    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('impersonation_id')?.value;

    if (sessionToken) {
        await stopImpersonationUseCase(sessionToken);

        cookieStore.delete('impersonation_id');
    }

    return { success: 'Режим имперсонации завершен' };
};
