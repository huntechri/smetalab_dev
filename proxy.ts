import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/infrastructure/auth/session';

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

  let res = NextResponse.next();

  // If access token is missing but refresh token exists, we could try to refresh
  // For simplicity in middleware, we'll let the client or next request handle refresh if we get a 401
  // or we can attempt a server-side refresh here if needed.
  // However, most robust way is to check the token.

  if (accessToken && request.method === 'GET') {
    try {
      const parsed = await verifyToken(accessToken.value);

      if (!parsed && refreshToken) {
        // Access token expired, but we have a refresh token
        // We redirect to a refresh handler or handle it
        // For now, let's just allow it to continue if it's not a protected route
        // or redirect to sign-in if it is and we can't refresh.
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