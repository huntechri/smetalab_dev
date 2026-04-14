'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { Team, User } from '@/lib/data/db/schema';

export interface PermissionEntry {
    code: string;
    level: 'read' | 'manage';
}

interface UserContextType {
    permissions: PermissionEntry[];
    user: User | null;
    team: Team | null;
    loading: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({
    permissions,
    user,
    team,
    children
}: {
    permissions: PermissionEntry[];
    user: User | null;
    team: Team | null;
    children: ReactNode;
}) {
    return (
        <UserContext.Provider value={{ permissions, user, team, loading: false }}>
            {children}
        </UserContext.Provider>
    );
}

// Alias for backward compatibility if needed, but better use useUserContext
export const usePermissionsContext = () => useUserContext();

export function useUserContext() {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error('useUserContext must be used within a UserProvider');
    }
    return context;
}
