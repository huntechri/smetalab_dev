/**
 * Supabase-compatible middleware client.
 *
 * This module provides a `createServerClient` wrapper that emulates the
 * @supabase/ssr `createServerClient` API surface. Since the project uses
 * custom JWT-based auth (not Supabase Auth), the session is verified via
 * the existing `getSession` / `verifyToken` helpers.
 *
 * This allows existing middleware patterns that expect a Supabase-style
 * client to work with the custom auth backend.
 */

import { type NextRequest, type NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

// ─── Types ───────────────────────────────────────────────────────────────

interface SupabaseClientLike {
  auth: {
    getSession(): Promise<{
      data: {
        session: {
          user: { id: string };
          access_token: string;
        } | null;
      };
      error: Error | null;
    }>;
  };
}

// ─── Implementation ─────────────────────────────────────────────────────

function getAuthSecretKey(): Uint8Array {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    throw new Error('AUTH_SECRET is not configured');
  }
  return new TextEncoder().encode(secret);
}

/**
 * Creates a server-side Supabase-like client for use in Next.js middleware.
 *
 * Mimics the @supabase/ssr `createServerClient` API:
 * ```ts
 * const supabase = createServerClient(
 *   process.env.NEXT_PUBLIC_SUPABASE_URL!,
 *   process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
 *   { cookies: { getAll, setAll } }
 * );
 * ```
 *
 * With our custom auth, the URL and key parameters are ignored; session
 * resolution always goes through the `access_token` cookie.
 */
export function createServerClient(
  _supabaseUrl: string,
  _supabaseKey: string,
  options: {
    cookies: {
      getAll(): Array<{ name: string; value: string }>;
      setAll(
        cookiesToSet: Array<{ name: string; value: string; options?: Record<string, unknown> }>,
      ): void;
    };
  },
): SupabaseClientLike {
  return {
    auth: {
      async getSession() {
        try {
          const allCookies = options.cookies.getAll();
          const accessToken = allCookies.find(
            (c) => c.name === 'access_token',
          );

          if (!accessToken?.value) {
            return {
              data: { session: null },
              error: null,
            };
          }

          const key = getAuthSecretKey();
          const { payload } = await jwtVerify(accessToken.value, key, {
            algorithms: ['HS256'],
          });

          return {
            data: {
              session: {
                user: { id: String(payload.user?.id ?? '') },
                access_token: accessToken.value,
              },
            },
            error: null,
          };
        } catch {
          return {
            data: { session: null },
            error: null,
          };
        }
      },
    },
  };
}
