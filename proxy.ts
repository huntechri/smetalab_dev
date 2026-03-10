import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import {
  verifyToken,
  REFRESH_COOKIE_NAME,
  SESSION_COOKIE_NAME,
} from '@/lib/infrastructure/auth/session';
import { refreshSessionTokens } from '@/lib/services/auth-refresh.service';

const protectedRoutes = ['/dashboard', '/app', '/admin'];

async function handleProxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const accessToken = request.cookies.get('access_token');
  const refreshToken = request.cookies.get('refresh_token');

  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );
  const isDashboardRoute = pathname.startsWith('/dashboard');

  if (isProtectedRoute && !accessToken && !refreshToken) {
    return NextResponse.redirect(new URL('/sign-in', request.url));
  }

  if (!isProtectedRoute) {
    return NextResponse.next();
  }

  let res = NextResponse.next();

  // If access token is missing but refresh token exists, we could try to refresh
  // For simplicity in middleware, we'll let the client or next request handle refresh if we get a 401
  // or we can attempt a server-side refresh here if needed.
  // However, most robust way is to check the token.

  if (request.method === 'GET') {
    try {
      const parsed = accessToken ? await verifyToken(accessToken.value) : null;

      if (!parsed && refreshToken) {
        const refreshResult = await refreshSessionTokens(refreshToken.value);

        if (!refreshResult.success) {
          if (isProtectedRoute) {
            return NextResponse.redirect(new URL('/sign-in', request.url));
          }
          return res;
        }

        res.cookies.set(SESSION_COOKIE_NAME, refreshResult.accessToken, {
          expires: refreshResult.accessExpires,
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          path: '/',
        });

        res.cookies.set(REFRESH_COOKIE_NAME, refreshResult.refreshToken, {
          expires: refreshResult.refreshExpires,
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          path: '/',
        });

        return res;
      }

      if (parsed) {
        if (isDashboardRoute) {
          const hasPlatformAccess =
            parsed.platformRole === 'superadmin' ||
            parsed.platformRole === 'support';

          if (!hasPlatformAccess) {
            return NextResponse.redirect(new URL('/app', request.url));
          }
        }
      }
    } catch {
      console.error('Error verifying access token');
      if (isProtectedRoute) {
        return NextResponse.redirect(new URL('/sign-in', request.url));
      }
    }
  }

  return res;
}

export default async function proxy(request: NextRequest) {
  return handleProxy(request);
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
  runtime: 'nodejs'
};
