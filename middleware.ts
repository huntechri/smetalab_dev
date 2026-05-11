/**
 * Next.js Middleware — Route protection.
 *
 * Protects authenticated routes behind a session check.
 * Public routes (/auth, /api, /landing, static assets) are allowed through.
 *
 * Uses the existing custom JWT-based auth (not Supabase).
 * See lib/infrastructure/auth/session.ts for session internals.
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

// ─── Configuration ──────────────────────────────────────────────────────

/** Routes that require an authenticated session. */
const PROTECTED_PATTERNS = [
  '/dashboard',
  '/projects',
  '/directories',
  '/team',
  '/templates',
  '/procurements',
  '/admin',
  '/settings',
];

/** Routes that are always public (no session required). */
const PUBLIC_PATTERNS = [
  '/auth',
  '/api',
  '/_next',
  '/favicon.ico',
  '/robots.txt',
  '/sitemap.xml',
];

/** The landing page is public. */
const LANDING_PATH = '/';

// ─── Helpers ────────────────────────────────────────────────────────────

function getAuthSecretKey(): Uint8Array {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    throw new Error('AUTH_SECRET is not configured');
  }
  return new TextEncoder().encode(secret);
}

async function verifyAccessToken(token: string): Promise<boolean> {
  try {
    const key = getAuthSecretKey();
    const { payload } = await jwtVerify(token, key, {
      algorithms: ['HS256'],
    });
    // Token is valid if it hasn't expired (jwtVerify throws if expired)
    return !!payload;
  } catch {
    return false;
  }
}

function isProtected(pathname: string): boolean {
  if (pathname === LANDING_PATH) return false;
  return PROTECTED_PATTERNS.some(
    (pattern) => pathname === pattern || pathname.startsWith(`${pattern}/`),
  );
}

function isPublic(pathname: string): boolean {
  if (pathname === LANDING_PATH) return true;
  return PUBLIC_PATTERNS.some(
    (pattern) => pathname === pattern || pathname.startsWith(`${pattern}/`),
  );
}

// ─── Middleware ──────────────────────────────────────────────────────────

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Allow public routes through immediately
  if (isPublic(pathname)) {
    return NextResponse.next();
  }

  // 2. If the route is not explicitly protected, allow it (opt-in protection)
  if (!isProtected(pathname)) {
    return NextResponse.next();
  }

  // 3. Check for access token in cookies
  const accessToken = request.cookies.get('access_token')?.value;

  if (!accessToken) {
    const loginUrl = new URL('/auth/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 4. Verify the token
  const valid = await verifyAccessToken(accessToken);
  if (!valid) {
    // Check for refresh token
    const refreshToken = request.cookies.get('refresh_token')?.value;
    if (refreshToken) {
      // Let the request pass through — the refresh endpoint will handle it
      // The page/server component will attempt a refresh and redirect if needed
      return NextResponse.next();
    }

    const loginUrl = new URL('/auth/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

// ─── Matcher ────────────────────────────────────────────────────────────

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimisation)
     * - favicon.ico (favicon)
     * - public files (images, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
