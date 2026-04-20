import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

import {
  REFRESH_COOKIE_NAME,
  SESSION_COOKIE_NAME,
  COOKIE_OPTIONS_ACCESS,
  COOKIE_OPTIONS_REFRESH,
} from '@/lib/infrastructure/auth/session';
import { refreshSessionTokens } from '@/lib/services/auth-refresh.service';

export async function POST(_req: NextRequest) {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get(REFRESH_COOKIE_NAME)?.value;

  if (!refreshToken) {
    return NextResponse.json({ error: 'Refresh token missing' }, { status: 401 });
  }

  const result = await refreshSessionTokens(refreshToken);

  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  const response = NextResponse.json({ success: true });

  response.cookies.set(SESSION_COOKIE_NAME, result.accessToken, {
    ...COOKIE_OPTIONS_ACCESS,
    expires: result.accessExpires,
  });

  response.cookies.set(REFRESH_COOKIE_NAME, result.refreshToken, {
    ...COOKIE_OPTIONS_REFRESH,
    expires: result.refreshExpires,
  });

  return response;
}
