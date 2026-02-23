import { and, eq, gt, isNull } from 'drizzle-orm';
import { randomBytes, createHash } from 'node:crypto';
import { db } from '@/lib/data/db/drizzle';
import { authTokens, type User, users } from '@/lib/data/db/schema';
import {
  sendEmailVerificationEmail,
  sendPasswordResetEmail,
} from '@/lib/infrastructure/email/email';

const TOKEN_LENGTH_BYTES = 32;
const EMAIL_VERIFICATION_TTL_MS = 24 * 60 * 60 * 1000;
const PASSWORD_RESET_TTL_MS = 60 * 60 * 1000;

type AuthTokenType = 'email_verification' | 'password_reset';

function generateToken() {
  return randomBytes(TOKEN_LENGTH_BYTES).toString('hex');
}

function hashToken(token: string) {
  return createHash('sha256').update(token).digest('hex');
}

async function issueToken(userId: number, type: AuthTokenType, ttlMs: number) {
  await db
    .delete(authTokens)
    .where(and(eq(authTokens.userId, userId), eq(authTokens.type, type), isNull(authTokens.usedAt)));

  const rawToken = generateToken();
  const tokenHash = hashToken(rawToken);
  const expiresAt = new Date(Date.now() + ttlMs);

  await db.insert(authTokens).values({
    userId,
    type,
    tokenHash,
    expiresAt,
  });

  return rawToken;
}

export async function sendEmailVerification(user: Pick<User, 'id' | 'email'>) {
  const token = await issueToken(user.id, 'email_verification', EMAIL_VERIFICATION_TTL_MS);
  return sendEmailVerificationEmail({
    to: user.email,
    token,
  });
}

export async function sendPasswordReset(user: Pick<User, 'id' | 'email'>) {
  const token = await issueToken(user.id, 'password_reset', PASSWORD_RESET_TTL_MS);
  return sendPasswordResetEmail({
    to: user.email,
    token,
  });
}

export async function consumeToken(token: string, type: AuthTokenType) {
  const tokenHash = hashToken(token);

  const [authToken] = await db
    .select()
    .from(authTokens)
    .where(
      and(
        eq(authTokens.tokenHash, tokenHash),
        eq(authTokens.type, type),
        isNull(authTokens.usedAt),
        gt(authTokens.expiresAt, new Date())
      )
    )
    .limit(1);

  if (!authToken) {
    return null;
  }

  await db
    .update(authTokens)
    .set({ usedAt: new Date() })
    .where(eq(authTokens.id, authToken.id));

  return authToken;
}

export async function markEmailAsVerified(userId: number) {
  await db
    .update(users)
    .set({ emailVerifiedAt: new Date() })
    .where(eq(users.id, userId));
}
