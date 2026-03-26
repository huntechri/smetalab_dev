import { compare, hash } from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { User } from '@/lib/data/db/schema';

const SALT_ROUNDS = 10;

function getAuthSecretKey() {
  const authSecret = process.env.AUTH_SECRET;

  if (!authSecret) {
    throw new Error('AUTH_SECRET is required for token signing and verification');
  }

  if (authSecret.length < 32) {
    throw new Error('AUTH_SECRET must be at least 32 characters long');
  }

  return new TextEncoder().encode(authSecret);
}

export async function hashPassword(password: string) {
  return hash(password, SALT_ROUNDS);
}

export async function comparePasswords(
  plainTextPassword: string,
  hashedPassword: string
) {
  return compare(plainTextPassword, hashedPassword);
}

type SessionData = {
  user: { id: number };
  platformRole: string | null;
  expires: string;
};

const ACCESS_TOKEN_EXPIRY = '15m'; // 15 minutes
const REFRESH_TOKEN_EXPIRY = '7d';  // 7 days
export const REFRESH_ENDPOINT_PATH = '/api/refresh';

export const SESSION_COOKIE_NAME = 'access_token';
export const REFRESH_COOKIE_NAME = 'refresh_token';
export const REFRESH_ENDPOINT_ALIASES = ['/api/auth/refresh'] as const;

export async function signToken(payload: SessionData, expiry: string = '1d') {
  const key = getAuthSecretKey();

  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(expiry)
    .sign(key);
}

export async function verifyToken(input: string) {
  const key = getAuthSecretKey();

  try {
    const { payload } = await jwtVerify(input, key, {
      algorithms: ['HS256'],
    });
    return payload as SessionData;
  } catch (_err) {
    return null;
  }
}

export async function getSession() {
  const session = (await cookies()).get(SESSION_COOKIE_NAME)?.value;
  if (!session) return null;
  return await verifyToken(session);
}

export const COOKIE_OPTIONS_ACCESS = {
  httpOnly: true,
  secure: true, // Required for sameSite: 'none'
  sameSite: 'none' as const,
  path: '/',
};

export const COOKIE_OPTIONS_REFRESH = {
  httpOnly: true,
  secure: true, // Required for sameSite: 'none'
  sameSite: 'none' as const,
  path: '/',
};

export async function setSession(user: User) {
  const now = Date.now();
  const accessExpires = new Date(now + 15 * 60 * 1000); // 15m
  const refreshExpires = new Date(now + 7 * 24 * 60 * 60 * 1000); // 7d

  const sessionData: SessionData = {
    user: { id: user.id },
    platformRole: user.platformRole ?? null,
    expires: accessExpires.toISOString(),
  };

  const accessToken = await signToken(sessionData, ACCESS_TOKEN_EXPIRY);
  const refreshToken = await signToken(
    { ...sessionData, expires: refreshExpires.toISOString() },
    REFRESH_TOKEN_EXPIRY
  );

  const cookieStore = await cookies();

  cookieStore.set(SESSION_COOKIE_NAME, accessToken, {
    ...COOKIE_OPTIONS_ACCESS,
    expires: accessExpires,
  });

  cookieStore.set(REFRESH_COOKIE_NAME, refreshToken, {
    ...COOKIE_OPTIONS_REFRESH,
    expires: refreshExpires,
  });
}

export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
  cookieStore.delete(REFRESH_COOKIE_NAME);
  cookieStore.delete({ name: REFRESH_COOKIE_NAME, path: REFRESH_ENDPOINT_PATH });
  for (const aliasPath of REFRESH_ENDPOINT_ALIASES) {
    cookieStore.delete({ name: REFRESH_COOKIE_NAME, path: aliasPath });
  }
}
