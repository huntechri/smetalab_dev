import { headers } from 'next/headers';

const trackers = new Map<string, { count: number; expiresAt: number }>();

/**
 * A simple in-memory rate limiter.
 * Warning: In a serverless environment (like Vercel), this memory is per-function instance
 * and not shared. However, it provides a basic layer of protection against rapid-fire attacks
 * against a single instance.
 *
 * @param limit Max requests allowed in the window
 * @param windowMs Time window in milliseconds
 * @returns true if allowed, false if rate limited
 */
export async function rateLimit(limit: number = 5, windowMs: number = 60 * 1000): Promise<boolean> {
  const headerStore = await headers();
  const ip = headerStore.get('x-forwarded-for') || '127.0.0.1';
  // Use first IP if multiple are present (proxies)
  const clientIp = ip.split(',')[0].trim();

  const now = Date.now();
  const key = `${clientIp}`;

  const tracker = trackers.get(key);

  if (!tracker || tracker.expiresAt < now) {
    trackers.set(key, { count: 1, expiresAt: now + windowMs });

    // Simple cleanup to prevent memory leaks if thousands of IPs hit
    if (trackers.size > 10000) {
      trackers.clear();
    }

    return true;
  }

  if (tracker.count >= limit) {
    return false;
  }

  tracker.count++;
  return true;
}
