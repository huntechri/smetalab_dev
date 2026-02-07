import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken, signToken } from '@/lib/auth/session';
import { db } from '@/lib/db/drizzle';
import { users } from '@/lib/db/schema';
import { eq, isNull, and } from 'drizzle-orm';

export async function POST(_req: NextRequest) {
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get('refresh_token')?.value;

    if (!refreshToken) {
        return NextResponse.json({ error: 'Refresh token missing' }, { status: 401 });
    }

    const payload = await verifyToken(refreshToken);
    if (!payload) {
        return NextResponse.json({ error: 'Invalid refresh token' }, { status: 401 });
    }

    // Verify user still exists and is active
    const [user] = await db
        .select()
        .from(users)
        .where(and(eq(users.id, payload.user.id), isNull(users.deletedAt)))
        .limit(1);

    if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 401 });
    }

    // Generate new tokens (Rotation)
    const now = Date.now();
    const accessExpires = new Date(now + 15 * 60 * 1000); // 15m
    const refreshExpires = new Date(now + 7 * 24 * 60 * 60 * 1000); // 7d

    const sessionData = {
        user: { id: user.id },
        platformRole: user.platformRole ?? null,
        expires: accessExpires.toISOString(),
    };

    const newAccessToken = await signToken(sessionData, '15m');
    const newRefreshToken = await signToken(
        { ...sessionData, expires: refreshExpires.toISOString() },
        '7d'
    );

    const response = NextResponse.json({ success: true });

    response.cookies.set('access_token', newAccessToken, {
        expires: accessExpires,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
    });

    response.cookies.set('refresh_token', newRefreshToken, {
        expires: refreshExpires,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/api/refresh', // Keep it restricted
    });

    return response;
}
