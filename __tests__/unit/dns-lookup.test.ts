import { describe, it, expect, vi, afterEach } from 'vitest';
import { isPrivateIp, safeLookup } from '@/lib/services/dns-lookup';
import dns, { LookupOptions } from 'node:dns';

// Mock node:dns
vi.mock('node:dns', () => {
    return {
        default: {
            lookup: vi.fn(),
        }
    };
});

describe('dns-lookup', () => {
    describe('isPrivateIp', () => {
        it('should identify private IPs', () => {
            expect(isPrivateIp('0.0.0.0')).toBe(true);
            expect(isPrivateIp('::')).toBe(true);
            expect(isPrivateIp('10.0.0.1')).toBe(true);
            expect(isPrivateIp('192.168.1.1')).toBe(true);
            expect(isPrivateIp('127.0.0.1')).toBe(true);
            expect(isPrivateIp('169.254.0.1')).toBe(true);
            expect(isPrivateIp('172.16.0.1')).toBe(true);
            expect(isPrivateIp('172.31.255.255')).toBe(true);
            expect(isPrivateIp('::1')).toBe(true);
            expect(isPrivateIp('fc00::1')).toBe(true);
            expect(isPrivateIp('fd00::1')).toBe(true);
            expect(isPrivateIp('fe80::1')).toBe(true);

            // IPv4-mapped IPv6 addresses (the vulnerability)
            expect(isPrivateIp('::ffff:127.0.0.1')).toBe(true);
            expect(isPrivateIp('::ffff:10.0.0.1')).toBe(true);
            expect(isPrivateIp('::ffff:192.168.1.1')).toBe(true);
        });

        it('should identify public IPs', () => {
            expect(isPrivateIp('8.8.8.8')).toBe(false);
            expect(isPrivateIp('172.15.0.1')).toBe(false);
            expect(isPrivateIp('172.32.0.1')).toBe(false);
            expect(isPrivateIp('1.1.1.1')).toBe(false);
        });
    });

    describe('safeLookup', () => {
        afterEach(() => {
            vi.clearAllMocks();
        });

        it('should resolve public IPs', async () => {
            vi.mocked(dns.lookup).mockImplementation(((hostname: string, _options: unknown, callback: (err: unknown, address: string, family: number) => void) => {
                callback(null, '8.8.8.8', 4);
            }) as unknown as typeof dns.lookup);

            await new Promise<void>((resolve, reject) => {
                safeLookup('google.com', {} as LookupOptions, (err, address, family) => {
                    if (err) return reject(err);
                    expect(address).toBe('8.8.8.8');
                    expect(family).toBe(4);
                    resolve();
                });
            });
        });

        it('should reject private IPs', async () => {
            vi.mocked(dns.lookup).mockImplementation(((hostname: string, _options: unknown, callback: (err: unknown, address: string, family: number) => void) => {
                callback(null, '127.0.0.1', 4);
            }) as unknown as typeof dns.lookup);

            await new Promise<void>((resolve, _reject) => {
                safeLookup('localhost', {} as LookupOptions, (err, _address, _family) => {
                    expect(err).toBeDefined();
                    expect(err?.message).toContain('private IP');
                    resolve();
                });
            });
        });

        it('should reject IPv4-mapped IPv6 private IPs', async () => {
            vi.mocked(dns.lookup).mockImplementation(((hostname: string, _options: unknown, callback: (err: unknown, address: string, family: number) => void) => {
                callback(null, '::ffff:127.0.0.1', 6);
            }) as unknown as typeof dns.lookup);

            await new Promise<void>((resolve, _reject) => {
                safeLookup('ipv6-localhost', {} as LookupOptions, (err, _address, _family) => {
                    expect(err).toBeDefined();
                    expect(err?.message).toContain('private IP');
                    resolve();
                });
            });
        });

        it('should pass through errors', async () => {
            const mockError = new Error('DNS Error');
            vi.mocked(dns.lookup).mockImplementation(((hostname: string, _options: unknown, callback: (err: unknown, address: string | null, family: number) => void) => {
                callback(mockError, null, 0);
            }) as unknown as typeof dns.lookup);

            await new Promise<void>((resolve, _reject) => {
                safeLookup('invalid.domain', {} as LookupOptions, (err, _address, _family) => {
                    expect(err).toBe(mockError);
                    resolve();
                });
            });
        });
    });
});
