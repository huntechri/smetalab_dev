import { and, eq, isNull } from 'drizzle-orm';
import { z } from 'zod';

import { db } from '@/lib/data/db/drizzle';
import { users } from '@/lib/data/db/schema';
import { signToken, verifyToken } from '@/lib/infrastructure/auth/session';

const refreshTokenSchema = z.string().min(1);

type RefreshTokensSuccess = {
  success: true;
  accessToken: string;
  refreshToken: string;
  accessExpires: Date;
  refreshExpires: Date;
};

type RefreshTokensFailure = {
  success: false;
  status: 401;
  error: string;
};

export async function refreshSessionTokens(refreshTokenInput: string): Promise<RefreshTokensSuccess | RefreshTokensFailure> {
  const parsedToken = refreshTokenSchema.safeParse(refreshTokenInput);

  if (!parsedToken.success) {
    return { success: false, status: 401, error: 'Refresh token missing' };
  }

  const payload = await verifyToken(parsedToken.data);

  if (!payload) {
    return { success: false, status: 401, error: 'Invalid refresh token' };
  }

  const [user] = await db
    .select()
    .from(users)
    .where(and(eq(users.id, payload.user.id), isNull(users.deletedAt)))
    .limit(1);

  if (!user) {
    return { success: false, status: 401, error: 'User not found' };
  }

  const now = Date.now();
  const accessExpires = new Date(now + 15 * 60 * 1000);
  const refreshExpires = new Date(now + 7 * 24 * 60 * 60 * 1000);

  const sessionData = {
    user: { id: user.id },
    platformRole: user.platformRole ?? null,
    expires: accessExpires.toISOString(),
  };

  const accessToken = await signToken(sessionData, '15m');
  const nextRefreshToken = await signToken(
    { ...sessionData, expires: refreshExpires.toISOString() },
    '7d'
  );

  return {
    success: true,
    accessToken,
    refreshToken: nextRefreshToken,
    accessExpires,
    refreshExpires,
  };
}
