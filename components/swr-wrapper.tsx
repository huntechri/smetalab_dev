'use client';

import { SWRConfig } from 'swr';
import { use } from 'react';
import type { AppTeam, AppUser } from '@/shared/types/session';

export function SWRWrapper({
    children,
    userPromise,
    teamPromise
}: {
    children: React.ReactNode;
    userPromise: Promise<AppUser | null>;
    teamPromise: Promise<AppTeam | null>;
}) {
    const user = use(userPromise);
    const team = use(teamPromise);

    return (
        <SWRConfig
            value={{
                fallback: {
                    '/api/user': user,
                    '/api/team': team
                }
            }}
        >
            {children}
        </SWRConfig>
    );
}
