import dns, { LookupOptions } from 'node:dns';

export function isPrivateIp(ip: string): boolean {
    // Block "this network" (0.0.0.0) which often resolves to localhost
    if (ip === '0.0.0.0') return true;
    if (ip === '::') return true;

    // Handle IPv4-mapped IPv6 addresses (e.g., ::ffff:127.0.0.1)
    if (ip.startsWith('::ffff:')) {
        return isPrivateIp(ip.substring(7));
    }

    if (ip.startsWith('10.')) return true;
    if (ip.startsWith('192.168.')) return true;
    if (ip.startsWith('127.')) return true;
    if (ip.startsWith('169.254.')) return true;

    if (ip.startsWith('172.')) {
        const parts = ip.split('.');
        if (parts.length > 1) {
            const secondOctet = Number(parts[1]);
            if (secondOctet >= 16 && secondOctet <= 31) return true;
        }
    }

    if (ip === '::1') return true;
    if (ip.startsWith('fc') || ip.startsWith('fd')) return true;
    if (ip.startsWith('fe80:')) return true;

    return false;
}

interface ErrnoException extends Error {
    errno?: number;
    code?: string;
    path?: string;
    syscall?: string;
}

export function safeLookup(hostname: string, options: LookupOptions, callback: (err: ErrnoException | null, address: string, family: number) => void): void {
    dns.lookup(hostname, options, (err, address, family) => {
        if (err) {
            return callback(err, address as string, family);
        }

        // Address can be an object array if all: true is passed, but we expect string for http.request default usage.
        // We cast address to string to simplify, as http.request doesn't use all: true.
        if (typeof address === 'string' && isPrivateIp(address)) {
            const error = new Error(`DNS lookup resolved to private IP: ${address}`) as ErrnoException;
            error.code = 'ENOTFOUND';
            return callback(error, address, family);
        }

        // @ts-expect-error - address might be object if options.all is true, but we assume standard lookup
        callback(null, address, family);
    });
}
