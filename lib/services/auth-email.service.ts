import { and, eq, gt, isNull, sql } from 'drizzle-orm';
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

let hasEmailVerifiedAtColumnCache: boolean | null = null;

export type AuthUserRecord = Pick<
  User,
  'id' | 'name' | 'email' | 'passwordHash' | 'platformRole' | 'createdAt' | 'updatedAt' | 'deletedAt'
> & {
  emailVerifiedAt: Date | null;
  isEmailVerificationSupported: boolean;
};

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

async function hasEmailVerifiedAtColumn() {
  if (hasEmailVerifiedAtColumnCache !== null) {
    return hasEmailVerifiedAtColumnCache;
  }

  const result = await db.execute(sql`
    select exists (
      select 1
      from information_schema.columns
      where table_schema = 'public'
        and table_name = 'users'
        and column_name = 'email_verified_at'
    ) as exists
  `);

  const rows = result as unknown as { exists: boolean }[];
  hasEmailVerifiedAtColumnCache = Boolean(rows[0]?.exists);
  return hasEmailVerifiedAtColumnCache;
}

export async function findUserByEmailForAuth(email: string): Promise<AuthUserRecord | null> {
  const emailVerificationSupported = await hasEmailVerifiedAtColumn();

  const [user] = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      passwordHash: users.passwordHash,
      platformRole: users.platformRole,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt,
      deletedAt: users.deletedAt,
    })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (!user) {
    return null;
  }

  if (!emailVerificationSupported) {
    return {
      ...user,
      emailVerifiedAt: null,
      isEmailVerificationSupported: false,
    };
  }

  const result = await db.execute(sql`
    select email_verified_at
    from users
    where id = ${user.id}
    limit 1
  `);
  const rows = result as unknown as { email_verified_at: Date | null }[];

  return {
    ...user,
    emailVerifiedAt: rows[0]?.email_verified_at ?? null,
    isEmailVerificationSupported: true,
  };
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
  if (!(await hasEmailVerifiedAtColumn())) {
    return;
  }

  await db.execute(sql`
    update users
    set email_verified_at = now()
    where id = ${userId}
  `);
}
