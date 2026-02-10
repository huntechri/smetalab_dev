import React from 'react';
import { SWRConfig } from 'swr';

export const MockSWRWrapper = ({ children, user = null, team = null }: { children: React.ReactNode, user?: unknown, team?: unknown }) => {
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
};

// Mock next/link default export
const Link = ({ href, children, ...props }: { href: string, children: React.ReactNode }) => (
    <a href={href} {...props} onClick={(e) => e.preventDefault()}>
        {children}
    </a>
);
export default Link;

// Mock next/navigation named exports
export const useRouter = () => ({
    push: () => {},
    replace: () => {},
    prefetch: () => {},
    back: () => {},
});
export const useSearchParams = () => new URLSearchParams();
export const usePathname = () => '/';
export const redirect = (url: string) => { console.log('Redirecting to', url); };

export const cookies = () => ({
    get: () => ({ value: '' }),
    set: () => {},
});
export const headers = () => new Map();
export const revalidatePath = () => {};
export const revalidateTag = () => {};
export const unstable_cache = (fn: (...args: unknown[]) => Promise<unknown>) => fn;

export const performance = {
  now: () => Date.now(),
};
