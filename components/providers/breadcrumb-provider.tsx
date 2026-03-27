'use client';

import * as React from 'react';
import { createContext, useContext, useState, useEffect } from 'react';

export type BreadcrumbEntry = {
    label: string;
    href?: string;
};

type BreadcrumbContextType = {
    breadcrumbs: BreadcrumbEntry[];
    setBreadcrumbs: (breadcrumbs: BreadcrumbEntry[]) => void;
};

const BreadcrumbContext = createContext<BreadcrumbContextType | undefined>(undefined);

export function BreadcrumbProvider({ children }: { children: React.ReactNode }) {
    const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbEntry[]>([]);

    return (
        <BreadcrumbContext.Provider value={{ breadcrumbs, setBreadcrumbs }}>
            {children}
        </BreadcrumbContext.Provider>
    );
}

export function useBreadcrumbs(entries?: BreadcrumbEntry[]) {
    const context = useContext(BreadcrumbContext);
    if (!context) {
        throw new Error('useBreadcrumbs must be used within a BreadcrumbProvider');
    }

    const { setBreadcrumbs } = context;
    const entriesString = entries ? JSON.stringify(entries) : '';

    useEffect(() => {
        if (entries) {
            setBreadcrumbs(entries);
        }
        return () => {
            if (entries) {
                setBreadcrumbs([]);
            }
        };
    }, [entriesString, setBreadcrumbs]);

    return context;
}
