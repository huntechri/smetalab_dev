import { compare, hash } from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { User } from '@/lib/db/schema';

const key = new TextEncoder().encode(process.env.AUTH_SECRET);
const SALT_ROUNDS = 10;

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

export const SESSION_COOKIE_NAME = 'access_token';
export const REFRESH_COOKIE_NAME = 'refresh_token';

export async function signToken(payload: SessionData, expiry: string = '1d') {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(expiry)
    .sign(key);
}

export async function verifyToken(input: string) {
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
    expires: accessExpires,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  });

  cookieStore.set(REFRESH_COOKIE_NAME, refreshToken, {
    expires: refreshExpires,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/api/auth/refresh', // Limited path for refresh token
  });
}

export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
  cookieStore.delete(REFRESH_COOKIE_NAME);
}

